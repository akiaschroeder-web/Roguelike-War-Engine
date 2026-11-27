#!/usr/bin/env python3
"""Prepare the Four Swords & Four Swords Adventures source art (art_sources/four_swords/): copy to art-src/ under
game ids as trimmed RGBA PNGs. Pillow and NumPy only (no rembg).

Special cases:
  the six Maidens          tiny pixel sprites saved blurry at a large size: the pixel grid is found (block size and
                           offset that line up with the colour edges), each block is reduced to its median colour,
                           and the sprite is scaled back up with NEAREST by a whole number, so the pixels are crisp.
  geldman.png              a painted desert backdrop (sky and pale dunes): flood-filled from the transparent edge
                           through pale, low-saturation and sky-blue pixels (the dark outline stops it), then only the
                           largest remaining piece is kept (the dune ridge behind the head is dropped), edges softened.
  purpleLink.webp          a flat white background: flood-filled from the border and the edge un-mixed from the white.
  small sprites            (shortest side < 400px) a 2x LANCZOS upscale.
  ids                      zeldaFS, ganonFSA, kaeporaGaeboraFS, arrghusFSA, phantomGanonFSA keep their file names;
                           everything else already uses its game id.

Usage: python3 scripts/prep_fourswords_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "four_swords"
OUT = ROOT / "art-src"

PIXEL = {"greenMaiden", "redMaiden", "blueMaiden", "purpleMaiden", "yellowMaiden", "whiteMaiden"}
KEYED = {"purpleLink"}
SMALL = 400


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def flood(cand: np.ndarray, seed: np.ndarray) -> np.ndarray:
    """Pixels of `cand` 4-connected to `seed`."""
    h, w = cand.shape
    reach = seed & cand
    q = deque(zip(*np.nonzero(reach)))
    while q:
        cy, cx = q.popleft()
        for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
            if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not reach[ny, nx]:
                reach[ny, nx] = True
                q.append((ny, nx))
    return reach


def largest_component(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    best, best_n, n = None, 0, 0
    for y, x in zip(*np.nonzero(mask)):
        if lab[y, x]:
            continue
        n += 1
        lab[y, x] = n
        q, size = deque([(y, x)]), 0
        while q:
            cy, cx = q.popleft()
            size += 1
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = n
                    q.append((ny, nx))
        if size > best_n:
            best, best_n = n, size
    return lab == best if best else mask


def key_white(im: Image.Image, tol: int = 26) -> Image.Image:
    """Flood-fill the border colour from the edges; un-mix the edge band from it."""
    rgb = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.abs(rgb - bg).max(axis=2)
    seed = np.zeros((h, w), bool)
    seed[0, :] = seed[-1, :] = seed[:, 0] = seed[:, -1] = True
    reach = flood(dist <= tol, seed)
    near = np.array(Image.fromarray((reach * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
    band = near & ~reach
    alpha = np.full((h, w), 255.0)
    alpha[reach] = 0
    alpha[band] = np.minimum(255, np.clip(dist / 90.0, 0, 1)[band] * 255)
    a = np.clip(alpha / 255, 1e-3, 1)[..., None]
    out = np.where(band[..., None], np.clip((rgb - (1 - a) * bg) / a, 0, 255), rgb)
    return Image.fromarray(np.dstack([out, alpha]).astype(np.uint8), "RGBA")


def remove_desert(im: Image.Image) -> Image.Image:
    """Geldman: drop the sky and the pale dunes behind him (the dark outline stops the fill)."""
    a = np.array(im.convert("RGBA")).astype(np.float64)
    rgb, alpha = a[..., :3] / 255.0, a[..., 3]
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, bl = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = np.where(mx == r, ((g - bl) / np.maximum(mx - mn, 1e-6)) % 6, 0) * 60
    pale = ((sat < 0.42) & (mx > 0.55)) | ((sat < 0.6) & (mx > 0.82))
    sky = (bl > r + 0.04) & (mx > 0.45)
    # The dune ridge behind his head: an orange-brown streak (Geldman's own browns are yellower or duller).
    ridge = (mx == r) & (hue < 34) & (sat > 0.62) & (mx > 0.58)
    cand = pale | sky | ridge | (alpha < 40)
    seed = alpha < 20
    seed[0, :] = seed[-1, :] = seed[:, 0] = seed[:, -1] = True
    bg = flood(cand, seed)
    keep = largest_component(~bg & (alpha > 40))
    soft = np.array(Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float64)
    a[..., 3] = np.minimum(alpha, soft)
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def grid_of(arr: np.ndarray) -> tuple[float, float, float, float]:
    """The pixel grid of a blurred pixel-art image: (block size, x offset, y offset, edge score)."""
    rgb = arr[..., :3].astype(np.float64)
    al = arr[..., 3:4].astype(np.float64) / 255.0
    img = rgb * al
    gx = np.abs(np.diff(img, axis=1)).sum(axis=2).sum(axis=0)  # edge strength between columns x and x+1
    gy = np.abs(np.diff(img, axis=0)).sum(axis=2).sum(axis=1)
    found: list[tuple[float, float, float, float]] = []
    for s in np.arange(6.0, 32.0, 0.25):
        def score(g: np.ndarray) -> tuple[float, float]:
            top, off = 0.0, 0.0
            for o in np.arange(0.0, s, 0.5):
                idx = np.round(np.arange(o, len(g), s)).astype(int)
                idx = idx[(idx >= 0) & (idx < len(g))]
                if len(idx) < 4:
                    continue
                v = g[idx].mean() / (g.mean() + 1e-9)
                if v > top:
                    top, off = v, o
            return top, off
        sx, ox = score(gx)
        sy, oy = score(gy)
        found.append((sx + sy, float(s), ox, oy))
    # Multiples of the true block size line up with edges too: take the smallest size scoring near the best.
    best = max(found, key=lambda f: f[0])
    def divides(f: tuple[float, float, float, float]) -> bool:
        r = best[1] / f[1]
        return f is best or (round(r) >= 2 and abs(r - round(r)) < 0.06)
    sc, s, ox, oy = min((f for f in found if f[0] >= 0.8 * best[0] and divides(f)), key=lambda f: f[1])
    return s, ox + 0.5, oy + 0.5, sc


def depixel(im: Image.Image) -> Image.Image:
    """Rebuild a blurred pixel sprite at its native size, then scale it up cleanly (NEAREST, whole factor)."""
    arr = np.array(im.convert("RGBA"))
    s, ox, oy, sc = grid_of(arr)
    h, w = arr.shape[:2]
    xs = np.arange(ox, w, s)
    ys = np.arange(oy, h, s)
    # Blocks that start before the offset.
    if ox - s > -s / 2:
        xs = np.concatenate([[ox - s], xs])
    if oy - s > -s / 2:
        ys = np.concatenate([[oy - s], ys])
    nw, nh = len(xs), len(ys)
    small = np.zeros((nh, nw, 4), np.uint8)
    m = max(1, int(s * 0.25))
    for j, y0 in enumerate(ys):
        for i, x0 in enumerate(xs):
            y1, x1 = int(round(y0 + s)), int(round(x0 + s))
            ya, xa = max(0, int(round(y0)) + m), max(0, int(round(x0)) + m)
            yb, xb = min(h, y1 - m), min(w, x1 - m)
            if yb <= ya or xb <= xa:
                continue
            blk = arr[ya:yb, xa:xb].reshape(-1, 4)
            if np.median(blk[:, 3]) < 128:
                continue
            opaque = blk[blk[:, 3] >= 128]
            small[j, i, :3] = np.median(opaque[:, :3], axis=0)
            small[j, i, 3] = 255
    out = trim(Image.fromarray(small, "RGBA"))
    k = max(2, -(-480 // max(1, min(out.size))))
    print(f"   pixel grid {s:.2f}px (score {sc:.2f}) -> native {out.size[0]}x{out.size[1]}, x{k}")
    return out.resize((out.size[0] * k, out.size[1] * k), Image.NEAREST)


def clean_halo(im: Image.Image, cut: int = 16) -> Image.Image:
    a = np.array(im).astype(np.int32)
    a[..., 3][a[..., 3] < cut] = 0
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def upscale(im: Image.Image) -> Image.Image:
    w, h = im.size
    return im.resize((w * 2, h * 2), Image.LANCZOS) if min(w, h) < SMALL else im


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        gid = f.stem
        raw = Image.open(f)
        if gid in PIXEL:
            img = depixel(trim(clean_halo(raw.convert("RGBA"))))
        elif gid == "geldman":
            img = upscale(trim(clean_halo(remove_desert(raw))))
        elif gid in KEYED:
            img = upscale(trim(clean_halo(key_white(raw))))
        else:
            img = upscale(trim(clean_halo(raw.convert("RGBA"))))
        img.save(OUT / f"{gid}.png")
        print("ok", gid, img.size)


if __name__ == "__main__":
    main()
