#!/usr/bin/env python3
"""Prepare The Minish Cap source art (art_sources/minish_cap/): copy to art-src/ under game ids as
trimmed RGBA PNGs.

Special cases:
  gyorgPair.webp           both Gyorgs in one image: split by connected regions of the alpha channel,
                           the big red one -> gyorgFemale, the small blue one -> gyorgMale.
  ezloMinish.webp,         flat white backgrounds: flood-filled from the border (enclosed whites, like
  vaatiMinish.jpg          Ezlo's beard, are kept) and the edge un-mixed from the white.
  spinyChuchu.jpg          a flat beige background: the same, keyed on the border colour.
  linkMinish.png           -> heroOfMinish (Micro Link aliases to it).
  tiny pixel sprites       (shortest side < 200px: King Daltus, Melari, Madderpillar, Black Knight) an
                           integer NEAREST upscale, so the pixels stay crisp.
  small blurry sprites     (shortest side < 400px) a 2x LANCZOS upscale.

Usage: python3 scripts/prep_minish_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "minish_cap"
OUT = ROOT / "art-src"

RENAME = {"linkMinish": "heroOfMinish"}
# Backgrounds to key out: file stem -> 'border' (the border's own colour).
KEYED = {"ezloMinish", "vaatiMinish", "spinyChuchu"}
TINY = 200
SMALL = 400


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def components(mask: np.ndarray) -> list[np.ndarray]:
    """Connected regions of a boolean mask, largest first."""
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    out: list[np.ndarray] = []
    n = 0
    for y, x in zip(*np.nonzero(mask)):
        if lab[y, x]:
            continue
        n += 1
        lab[y, x] = n
        q = deque([(y, x)])
        while q:
            cy, cx = q.popleft()
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = n
                    q.append((ny, nx))
        out.append(lab == n)
    return sorted(out, key=lambda m: -int(m.sum()))


def key_background(im: Image.Image, tol: int = 26) -> Image.Image:
    """Flood-fill the border colour from the edges; keep enclosed areas of that colour; un-mix the edge."""
    rgb = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg_col = np.median(border, axis=0)
    dist = np.abs(rgb - bg_col).max(axis=2)
    cand = dist <= tol
    # Reachable from the border.
    reach = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if cand[y, x] and not reach[y, x]:
                reach[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if cand[y, x] and not reach[y, x]:
                reach[y, x] = True
                q.append((y, x))
    while q:
        cy, cx = q.popleft()
        for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
            if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not reach[ny, nx]:
                reach[ny, nx] = True
                q.append((ny, nx))
    near = np.array(Image.fromarray((reach * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
    band = near & ~reach
    alpha = np.full((h, w), 255.0)
    alpha[reach] = 0
    a_band = np.clip(dist / 90.0, 0, 1)
    alpha[band] = np.minimum(255, a_band[band] * 255)
    out = rgb.astype(np.float64)
    a = np.clip(alpha / 255, 1e-3, 1)[..., None]
    unmixed = np.clip((out - (1 - a) * bg_col) / a, 0, 255)
    out = np.where(band[..., None], unmixed, out)
    return Image.fromarray(np.dstack([out, alpha]).astype(np.uint8), "RGBA")


def clean_halo(im: Image.Image, cut: int = 16) -> Image.Image:
    a = np.array(im).astype(np.int32)
    a[..., 3][a[..., 3] < cut] = 0
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def upscale(im: Image.Image) -> Image.Image:
    w, h = im.size
    if min(w, h) < TINY:
        k = -(-480 // min(w, h))
        return im.resize((w * k, h * k), Image.NEAREST)
    if min(w, h) < SMALL:
        return im.resize((w * 2, h * 2), Image.LANCZOS)
    return im


def save(img: Image.Image, gid: str) -> None:
    img.save(OUT / f"{gid}.png")
    print("ok", gid, img.size)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        raw = Image.open(f)
        if f.stem == "gyorgPair":
            rgba = raw.convert("RGBA")
            a = np.array(rgba)
            parts = components(a[..., 3] > 40)
            for gid, m in (("gyorgFemale", parts[0]), ("gyorgMale", parts[1])):
                grown = np.array(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
                b = a.copy()
                b[..., 3] = np.where(grown, b[..., 3], 0)
                save(upscale(trim(clean_halo(Image.fromarray(b, "RGBA")))), gid)
            continue
        gid = RENAME.get(f.stem, f.stem)
        img = key_background(raw) if f.stem in KEYED else raw.convert("RGBA")
        save(upscale(trim(clean_halo(img))), gid)


if __name__ == "__main__":
    main()
