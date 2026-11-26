#!/usr/bin/env python3
"""Prepare The Legend of Zelda (Original Hyrule) source art: copy to art-src/ under game ids
as trimmed RGBA PNGs. Zelda's JPEG is on white: the background is removed by a flood fill
from the border (interior whites stay), with the anti-aliased edge un-mixed from the white.
Soft-edged scans get their faint halo of near-transparent pixels cleaned up.

Usage: python3 scripts/prep_original_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "original_hyrule"
OUT = ROOT / "art-src"

# source stem -> game art id (default: the same)
RENAME: dict[str, str] = {}
# Scans whose outline has a light fringe: pull it in by a pixel.
DEFRINGE = {"ghini"}


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def remove_white(im: Image.Image, thresh: int = 232) -> Image.Image:
    """Flood-fill the white background from the border; keep enclosed whites."""
    rgb = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = rgb.shape
    lo = rgb.min(axis=2)
    whiteish = Image.fromarray(np.where(lo >= thresh, 255, 0).astype(np.uint8), "L").copy()
    for x in range(w):
        for y in (0, h - 1):
            if whiteish.getpixel((x, y)) == 255:
                ImageDraw.floodfill(whiteish, (x, y), 128)
    for y in range(h):
        for x in (0, w - 1):
            if whiteish.getpixel((x, y)) == 255:
                ImageDraw.floodfill(whiteish, (x, y), 128)
    bg = np.array(whiteish) == 128
    # Edge band: pixels next to the background are part white; un-mix them.
    near = np.array(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    band = near & ~bg
    alpha = np.full((h, w), 255.0)
    alpha[bg] = 0
    a_band = np.clip((255 - lo) / (255 - 150), 0, 1)
    alpha[band] = np.minimum(255, a_band[band] * 255)
    out = rgb.astype(np.float64)
    a = np.clip(alpha / 255, 1e-3, 1)[..., None]
    unmixed = np.clip((out - (1 - a) * 255) / a, 0, 255)
    out = np.where(band[..., None], unmixed, out)
    rgba = np.dstack([out, alpha]).astype(np.uint8)
    res = Image.fromarray(rgba, "RGBA")
    # Smooth the cut a touch.
    al = res.getchannel("A").filter(ImageFilter.GaussianBlur(0.5))
    res.putalpha(Image.fromarray(np.minimum(np.array(al), alpha.astype(np.uint8))))
    return res


def clean_halo(im: Image.Image, defringe: bool) -> Image.Image:
    """Drop the faint haze around scans; optionally erode a light outline by one pixel."""
    a = np.array(im).astype(np.int32)
    al = a[..., 3]
    al[al < 16] = 0
    if defringe:
        opaque = Image.fromarray(((al > 0) * 255).astype(np.uint8))
        inner = np.array(opaque.filter(ImageFilter.MinFilter(3))) > 0
        edge = (al > 0) & ~inner
        light = a[..., :3].min(axis=2) > 200
        al[edge & light] = (al[edge & light] * 0.35).astype(np.int32)
    a[..., 3] = al
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        gid = RENAME.get(f.stem, f.stem)
        im = Image.open(f)
        if f.suffix.lower() in (".jpg", ".jpeg"):
            img = remove_white(im.convert("RGB"))
        else:
            img = clean_halo(im.convert("RGBA"), f.stem in DEFRINGE)
        img = trim(img)
        img.save(OUT / f"{gid}.png")
        print("ok", gid, img.size)


if __name__ == "__main__":
    main()
