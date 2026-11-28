#!/usr/bin/env python3
"""Prepare the Echoes of Wisdom source art (art_sources/echoes_of_wisdom/): copy to art-src/ under game ids as
trimmed RGBA PNGs. Pillow (with numpy for the pixel maths) only; no background-removal models.

Special cases:
  tekom_cloudbg.webp   -> tekom: an opaque cloudy sky behind her. Pale, unsaturated pixels connected to the border
                          are flood-filled away, then the edge is softened and un-mixed from the sky colour.
  null.png             -> nullEoW: opaque black rectangles sit behind the arms in the colour channels of the
                          (transparent) background; transparent pixels get their colour bled in from the nearest
                          opaque pixels, so resizing never drags black into the edges.
  biriEOW_alt.png      -> biriEoW (an alternate for the A Link Between Worlds pack's Biri).
  *EOW                 -> *EoW (zeldaEoW, linkEoW, kingEoW, impaEoW, dampeEoW).
  small images         (shortest side < 400px) a 2x LANCZOS upscale (3x below 200px).

Usage: python3 scripts/prep_echoes_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "echoes_of_wisdom"
OUT = ROOT / "art-src"

RENAME = {
    "zeldaEOW": "zeldaEoW", "linkEOW": "linkEoW", "kingEOW": "kingEoW", "impaEOW": "impaEoW", "dampeEOW": "dampeEoW",
    "biriEOW_alt": "biriEoW", "tekom_cloudbg": "tekom", "null": "nullEoW",
}
SMALL = 400
TINY = 200


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def clean_halo(im: Image.Image, cut: int = 24) -> Image.Image:
    a = np.array(im).astype(np.int32)
    a[..., 3][a[..., 3] < cut] = 0
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def bleed(im: Image.Image, passes: int = 12) -> Image.Image:
    """Give fully transparent pixels the colour of their nearest opaque neighbours (no dark fringes on resize)."""
    a = np.array(im).astype(np.float64)
    rgb, alpha = a[..., :3], a[..., 3]
    known = alpha > 0
    rgb[~known] = 0
    for _ in range(passes):
        if known.all():
            break
        acc = np.zeros_like(rgb)
        n = np.zeros(alpha.shape)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh_rgb = np.roll(np.roll(rgb, dy, 0), dx, 1)
            sh_k = np.roll(np.roll(known, dy, 0), dx, 1)
            acc += sh_rgb * sh_k[..., None]
            n += sh_k
        grow = ~known & (n > 0)
        rgb[grow] = acc[grow] / n[grow][:, None]
        known = known | grow
    rest = ~known
    if rest.any():
        rgb[rest] = rgb[known].mean(axis=0)
    return Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), "RGBA")


def key_sky(im: Image.Image) -> Image.Image:
    """Remove a pale cloudy background: flood from the border over bright, unsaturated pixels."""
    rgb = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = rgb.shape
    bright = rgb.min(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    cand = (bright >= 150) & (sat <= 34)
    reach = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if cand[y, x]:
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
    # Close pinholes in the subject, then soften a one-pixel edge band.
    mask = Image.fromarray((~reach * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    keep = np.array(mask) > 0
    soft = np.array(mask.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float64)
    alpha = np.where(keep, np.minimum(255, soft * 1.6), 0)
    sky = np.median(rgb[reach], axis=0) if reach.any() else np.array([220, 220, 225])
    a = np.clip(alpha / 255, 1e-3, 1)[..., None]
    edge = (alpha > 0) & (alpha < 250)
    unmixed = np.clip((rgb - (1 - a) * sky) / a, 0, 255)
    out = np.where(edge[..., None], unmixed, rgb)
    return Image.fromarray(np.dstack([out, alpha]).astype(np.uint8), "RGBA")


def upscale(im: Image.Image) -> Image.Image:
    w, h = im.size
    k = 3 if min(w, h) < TINY else 2 if min(w, h) < SMALL else 1
    return im.resize((w * k, h * k), Image.LANCZOS) if k > 1 else im


def save(img: Image.Image, gid: str) -> None:
    img.save(OUT / f"{gid}.png")
    print("ok", gid, img.size)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        gid = RENAME.get(f.stem, f.stem)
        raw = Image.open(f)
        if f.stem == "tekom_cloudbg":
            img = key_sky(raw)
        else:
            img = raw.convert("RGBA")
        img = clean_halo(img)
        if f.stem == "null":
            img = bleed(img)
        save(bleed(upscale(trim(img)), 4) if f.stem == "null" else upscale(trim(img)), gid)


if __name__ == "__main__":
    main()
