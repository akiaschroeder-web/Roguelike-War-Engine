#!/usr/bin/env python3
"""Prepare A Link Between Worlds and River Zora source art (art_sources/link_between_worlds/, art_sources/river_zora/):
copy to art-src/ under game ids as trimmed RGBA PNGs. Pillow only.

Special cases:
  ravio_withSheerow_greenbg.jpg   a green painted backdrop: keyed out by "greenness", flood-filled from the border
                                  (the green gem on Ravio's belt is enclosed, so it stays), the edge despilled; then
                                  only the largest connected shape is kept, which drops Sheerow (he has his own art).
  heedle_x2.webp                  two identical Heedles side by side: the left one is cropped out.
  link2D_alt_brickbg.jpg          the 2D wall-merged Link on his brick wall: kept with the backdrop (it is the wall).
  *_alt files                     -> their game ids (ganonALBW, bariOOT, biriOOT, moldormALBW).
  small renders                   (shortest side < 400px) a 2x LANCZOS upscale.

Usage: python3 scripts/prep_lorule_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCES = [ROOT / "art_sources" / "link_between_worlds", ROOT / "art_sources" / "river_zora"]
OUT = ROOT / "art-src"

RENAME = {
    "ganonALBW_alt": "ganonALBW", "ravio_withSheerow_greenbg": "ravio", "lorulean_blacksmith": "loruleanBlacksmith",
    "bariOOT_alt": "bariOOT", "biriOOT_alt": "biriOOT", "heedle_x2": "heedle", "link2D_alt_brickbg": "link2D", "moldormALBW_alt": "moldormALBW",
}
SMALL = 400


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def clean_halo(im: Image.Image, cut: int = 16) -> Image.Image:
    r, g, b, a = im.split()
    return Image.merge("RGBA", (r, g, b, a.point(lambda v: 0 if v < cut else v)))


def upscale(im: Image.Image) -> Image.Image:
    w, h = im.size
    return im.resize((w * 2, h * 2), Image.LANCZOS) if min(w, h) < SMALL else im


def largest_component(im: Image.Image, thresh: int = 40) -> Image.Image:
    """Keep only the largest connected opaque shape (4-connectivity), with a 1px grown edge."""
    w, h = im.size
    alpha = im.getchannel("A")
    a = alpha.load()
    seen = bytearray(w * h)
    best: list[int] = []
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if seen[i] or a[x, y] <= thresh:
                continue
            seen[i] = 1
            comp = [i]
            q = deque([(x, y)])
            while q:
                cx, cy = q.popleft()
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h:
                        j = ny * w + nx
                        if not seen[j] and a[nx, ny] > thresh:
                            seen[j] = 1
                            comp.append(j)
                            q.append((nx, ny))
            if len(comp) > len(best):
                best = comp
    mask = Image.new("L", (w, h), 0)
    m = mask.load()
    for i in best:
        m[i % w, i // w] = 255
    mask = mask.filter(ImageFilter.MaxFilter(3))
    out = im.copy()
    out.putalpha(Image.composite(alpha, Image.new("L", (w, h), 0), mask))
    return out


def key_green(im: Image.Image, lo: int = 2, hi: int = 22) -> Image.Image:
    """Key out a green backdrop: pixels whose green exceeds red and blue, connected to the border, become transparent
    (a soft edge between `lo` and `hi` greenness); enclosed green (Ravio's gem) is kept. The edge is despilled."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    green = [[0] * w for _ in range(h)]
    for y in range(h):
        row = green[y]
        for x in range(w):
            r, g, b = px[x, y]
            row[x] = g - max(r, b)
    reach = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if green[y][x] > lo and not reach[y * w + x]:
                reach[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if green[y][x] > lo and not reach[y * w + x]:
                reach[y * w + x] = 1
                q.append((x, y))
    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < w and 0 <= ny < h and not reach[ny * w + nx] and green[ny][nx] > lo:
                reach[ny * w + nx] = 1
                q.append((nx, ny))
    out = Image.new("RGBA", (w, h))
    o = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if reach[y * w + x]:
                gr = green[y][x]
                alpha = 0 if gr >= hi else int(255 * (hi - gr) / (hi - lo))
                o[x, y] = (r, min(g, max(r, b) + 4), b, alpha)
            else:
                o[x, y] = (r, g, b, 255)
    return out


def save(img: Image.Image, gid: str) -> None:
    img.save(OUT / f"{gid}.png")
    print("ok", gid, img.size)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for src in SOURCES:
        for f in sorted(src.iterdir()):
            gid = RENAME.get(f.stem, f.stem)
            raw = Image.open(f)
            if f.stem == "ravio_withSheerow_greenbg":
                save(upscale(trim(largest_component(clean_halo(key_green(raw), 40)))), gid)
                continue
            if f.stem == "link2D_alt_brickbg":
                save(raw.convert("RGBA"), gid)
                continue
            img = raw.convert("RGBA")
            if f.stem == "heedle_x2":
                img = img.crop((0, 0, img.width // 2, img.height))
            save(upscale(trim(clean_halo(img))), gid)


if __name__ == "__main__":
    main()
