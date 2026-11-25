#!/usr/bin/env python3
"""Prepare Wind Waker source art: copy to art-src/, cut out backgrounds, split
combined images (Mothula pair, Gohdan and its hand, Molgera and its larva).

Usage: python3 scripts/prep_ww_art.py   (then python3 scripts/process_art.py)
"""
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter
import colorsys

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "wind_waker"
OUT = ROOT / "art-src"

COPY = {
    "heroOfWinds": "heroOfWinds.webp", "tetra": "tetra.png", "zeldaWW": "zeldaWW.webp", "ganondorfWW": "ganondorfWW.png",
    "kingDaphnes": "kingDaphnes.webp", "kingOfRedLions": "kingOfRedLions.png", "aryll": "aryll.webp", "grandma": "grandma.webp",
    "orca": "orca.webp", "sturgeon": "sturgeon.webp", "medli": "medli.webp", "makar": "makar.webp", "komali": "komali.webp",
    "quill": "quill.webp", "ritoChieftain": "ritoChieftain.webp", "laruto": "laruto.webp", "fado": "fado.webp", "niko": "niko.webp",
    "gonzo": "gonzo.webp", "salvatore": "salvatore.webp", "beedle": "beedle.png", "mila": "mila.webp", "lenzo": "lenzo.webp",
    "valoo": "valoo.webp", "jabun": "jabun.png", "zephos": "zephos.webp", "cyclos": "cyclos.webp", "fishman": "fishman.webp",
    "korokGeneric": "korokGeneric.png", "senza": "senza.png", "mako": "mako.webp", "zuko": "zuko.webp", "nudge": "nudge.webp",
    "bokoblin": "bokoblin.webp", "miniblin": "miniblin.png", "bokoBaba": "bokoBaba.png", "kargaroc": "kargaroc.webp",
    "wingedMothula": "mothulaWinged.png", "morth": "morth.webp", "magtail": "magtail.webp", "seahat": "seahat.webp",
    "greatSeaGyorg": "gyorg.webp", "bigOcto": "bigOcto.png", "darknut": "darknut.webp", "mightyDarknut": "mightyDarknut.webp",
    "armosKnight": "armosKnight.webp", "floorMasterWW": "floorMasterWW.webp", "bombchuMonster": "bombchuWW.webp", "bombchuMonsterMM": "bombchuMM_alt.png",
    "chuchuRed": "chuchuWW_red.png", "chuchuGreen": "chuchuWW_green.png", "chuchuBlue": "chuchuWW_blue.png", "chuchuYellow": "chuchuWW_yellow.png",
    "chuchuRedMM": "chuchuMM_red.webp", "chuchuGreenMM": "chuchuMM_green.webp", "arrowChuchu": "chuchuMM_arrow.webp",
    "gohmaWW": "gohmaWW.png", "kalleDemos": "kalleDemos.webp", "helmarocKing": "helmarocKing.webp", "jalhalla": "jalhalla.webp",
    "puppetGanonBeast": "puppetGanon.webp", "phantomGanonWW": "phantomGanonWW_alt.png",
    "raft": "raft.png", "beedlesShopShip": "shopShip.webp", "gunboat": "gunboat.png", "pirateShip": "pirateShip.webp", "ghostShip": "ghostShip.webp",
}


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def crop_frac(im: Image.Image, l: float, t: float, r: float, b: float) -> Image.Image:
    w, h = im.size
    return trim(im.crop((int(l * w), int(t * h), int(r * w), int(b * h))))


def flood_white(im: Image.Image, tol: int = 38) -> Image.Image:
    """Make the near-white background connected to the border transparent."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]:
            continue
        seen[y * w + x] = 1
        r, g, b, a = px[x, y]
        if min(r, g, b) < 255 - tol:
            continue
        px[x, y] = (r, g, b, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im


def keep_mask(im: Image.Image, keep) -> Image.Image:
    """Keep pixels matching `keep(h, s, v, r, g, b)`, then only the biggest blob (holes filled)."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    mask = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if keep(hh, ss, vv, r, g, b):
                mask[y * w + x] = 1
    # Largest connected component
    label = [0] * (w * h)
    best, best_n, cur = 0, 0, 0
    for i in range(w * h):
        if not mask[i] or label[i]:
            continue
        cur += 1
        n = 0
        q = deque([i])
        label[i] = cur
        while q:
            k = q.popleft()
            n += 1
            x, y = k % w, k // w
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if mask[j] and not label[j]:
                        label[j] = cur
                        q.append(j)
        if n > best_n:
            best_n, best = n, cur
    # Fill holes: background = pixels outside the blob reachable from the border
    outside = bytearray(w * h)
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        k = y * w + x
        if outside[k] or label[k] == best:
            continue
        outside[k] = 1
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    alpha = Image.new("L", (w, h))
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            ap[x, y] = 0 if outside[y * w + x] else 255
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
    im.putalpha(alpha)
    return trim(im)


def blobs(im: Image.Image, scale: int = 4) -> list:
    """Separate shapes in an image by transparency. Returns cut-outs, biggest first."""
    w, h = im.size
    small = im.getchannel("A").resize((w // scale, h // scale))
    sw, sh = small.size
    a = small.load()
    label = [0] * (sw * sh)
    sizes = {}
    cur = 0
    for i in range(sw * sh):
        x, y = i % sw, i // sw
        if label[i] or a[x, y] < 40:
            continue
        cur += 1
        q = deque([i]); label[i] = cur; n = 0
        while q:
            k = q.popleft(); n += 1
            kx, ky = k % sw, k // sw
            for nx, ny in ((kx + 1, ky), (kx - 1, ky), (kx, ky + 1), (kx, ky - 1), (kx + 1, ky + 1), (kx - 1, ky - 1), (kx + 1, ky - 1), (kx - 1, ky + 1)):
                if 0 <= nx < sw and 0 <= ny < sh:
                    j = ny * sw + nx
                    if not label[j] and a[nx, ny] >= 40:
                        label[j] = cur; q.append(j)
        sizes[cur] = n
    out = []
    for lab, _ in sorted(sizes.items(), key=lambda kv: -kv[1]):
        m = Image.new("L", (sw, sh))
        mp = m.load()
        for i, l in enumerate(label):
            if l == lab:
                mp[i % sw, i // sw] = 255
        m = m.resize((w, h)).filter(ImageFilter.MaxFilter(5))
        piece = im.copy()
        piece.putalpha(Image.composite(im.getchannel("A"), Image.new("L", (w, h), 0), m))
        out.append(trim(piece))
    return out


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for cid, name in COPY.items():
        Image.open(SRC / name).convert("RGBA").save(OUT / f"{cid}.png")
    # Combined images
    pair = Image.open(SRC / "mothulaPair.webp").convert("RGBA")
    gohdan = Image.open(SRC / "gohdan.webp").convert("RGBA")
    # Gohdan's head and its right hand overlap: the thumb (x > 0.598, y > 0.255) belongs to the hand.
    gw, gh = gohdan.size
    head = gohdan.copy()
    head.paste((0, 0, 0, 0), (int(0.645 * gw), 0, gw, gh))
    head.paste((0, 0, 0, 0), (int(0.598 * gw), int(0.255 * gh), gw, gh))
    # The face is symmetrical: rebuild the side hidden behind the thumb from the other half.
    axis = int(0.4545 * gw)
    left = head.crop((int(0.25 * gw), 0, axis, gh))
    head.paste((0, 0, 0, 0), (axis, 0, gw, gh))
    head.alpha_composite(left.transpose(Image.FLIP_LEFT_RIGHT), (axis, 0))
    blobs(crop_frac(head, 0.25, 0.0, 0.70, 1.0), 2)[0].save(OUT / "gohdan.png")
    hand = gohdan.copy()
    hand.paste((0, 0, 0, 0), (0, 0, int(0.598 * gw), gh))
    hand.paste((0, 0, 0, 0), (0, 0, int(0.645 * gw), int(0.255 * gh)))
    molgera = Image.open(SRC / "molgera.webp").convert("RGBA")
    parts = blobs(molgera)
    parts[0].save(OUT / "molgera.png")
    parts[1].save(OUT / "molgeraLarva.png")
    # The ground Mothula, lower right. The flying one's lower wings hang down onto it, so cut along
    # its back: keep only what's below y = 0.70, except the tall shell on the right.
    ground = pair.copy()
    pw, ph = ground.size
    ground.paste((0, 0, 0, 0), (0, 0, pw, int(0.70 * ph)))
    ground.paste(pair.crop((int(0.80 * pw), int(0.60 * ph), pw, int(0.70 * ph))), (int(0.80 * pw), int(0.60 * ph)))
    gp = ground.load()
    for y in range(int(0.70 * ph), int(0.80 * ph)):
        for x in range(int(0.80 * pw)):
            r, g, b, a = gp[x, y]
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if a and 0.25 <= hh <= 0.58 and ss > 0.25 and vv > 0.25:
                gp[x, y] = (0, 0, 0, 0)
    ground = crop_frac(ground, 0.40, 0.58, 1.0, 1.0)
    blobs(ground, 1)[0].save(OUT / "mothula.png")
    blobs(crop_frac(hand, 0.59, 0.0, 1.0, 1.0), 2)[0].save(OUT / "gohdansHand.png")
    # Backgrounds to cut out
    flood_white(Image.open(SRC / "ritoGeneric.jpg")).save(OUT / "ritoGeneric.png")
    navy_gold = lambda h, s, v, r, g, b: (0.55 <= h <= 0.75 and s > 0.35 and v < 0.75) or (0.10 <= h <= 0.18 and s > 0.55 and v > 0.45) or (0.45 <= h <= 0.55 and s > 0.4)
    keep_mask(Image.open(SRC / "puppetGanonSpider.jpg"), navy_gold).save(OUT / "puppetGanonSpider.png")
    keep_mask(Image.open(SRC / "puppetGanonSnake.jpg"), navy_gold).save(OUT / "puppetGanonSnake.png")
    wood = lambda h, s, v, r, g, b: (0.08 <= h <= 0.30 and s > 0.28 and v < 0.85) or (v < 0.42 and s < 0.5) or (0.45 <= h <= 0.6 and s > 0.25 and v > 0.5)
    sub = Image.open(SRC / "submarine.jpg").crop((300, 60, 1000, 720))
    keep_mask(sub, wood).save(OUT / "submarine.png")
    print("prepared", len(COPY) + 8, "images")


if __name__ == "__main__":
    main()
