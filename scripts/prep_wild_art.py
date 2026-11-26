#!/usr/bin/env python3
"""Prepare Era of the Wild (BotW/TotK) source art: copy to art-src/ under game ids,
strip the near-transparent navy logo-pattern backgrounds, and cut wildLink.jpg out
of its white background.

Usage: python3 scripts/prep_wild_art.py   (then python3 scripts/process_art.py)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "era_of_the_wild"
OUT = ROOT / "art-src"

# source stem (after dropping _patternbg / _whiteblocks) -> game art id (default: the same)
RENAME = {"wildLink": "heroOfTheWild", "wildZelda": "zeldaWild"}
SUFFIXES = ("_patternbg", "_whiteblocks")

NAVY = np.array([23, 69, 110])


def game_id(stem: str) -> str:
    for s in SUFFIXES:
        stem = stem.removesuffix(s)
    return RENAME.get(stem, stem)


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def strip_navy(im: Image.Image) -> Image.Image:
    """The logo-pattern background is navy (23,69,110) at alpha 1-24 (the logo shapes are a
    touch denser). Clear navy-coloured pixels that are only faintly visible, and anything at
    alpha <= 1. Opaque blue parts of a subject (Naydra, Zora, ...) are untouched."""
    a = np.array(im)
    rgb = a[..., :3].astype(int)
    al = a[..., 3]
    dist = np.sqrt(((rgb - NAVY) ** 2).sum(-1))
    clear = (al <= 1) | ((dist < 40) & (al <= 64))
    a[clear] = 0
    return Image.fromarray(a)


def cut_white(im: Image.Image, white: int = 232, soft: int = 190) -> Image.Image:
    """Flood fill the white background from the image border (interior whites such as eyes
    and cloth are not connected to it, so they stay), then soften the edge band: alpha from
    how far a pixel is from white, with the white matte un-mixed from its colour."""
    rgb = np.array(im.convert("RGB")).astype(float)
    h, w, _ = rgb.shape
    mn = rgb.min(-1)
    near = Image.fromarray(np.where(mn >= white, 255, 0).astype(np.uint8), "L").copy()  # writable
    for x, y in [(x, 0) for x in range(0, w, 8)] + [(x, h - 1) for x in range(0, w, 8)] + \
                [(0, y) for y in range(0, h, 8)] + [(w - 1, y) for y in range(0, h, 8)]:
        if near.getpixel((x, y)) == 255:
            ImageDraw.floodfill(near, (x, y), 128)
    bg = np.array(near) == 128
    # edge band: background grown by a few pixels
    band = np.array(Image.fromarray(bg.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(5))) > 0
    alpha = np.where(bg, 0.0, 1.0)
    edge = band & ~bg
    soft_a = np.clip((255 - mn) / (255 - soft), 0, 1)
    alpha[edge] = soft_a[edge]
    out = rgb.copy()
    m = edge & (alpha > 0)
    out[m] = np.clip((rgb[m] - (1 - alpha[m, None]) * 255) / alpha[m, None], 0, 255)
    a = np.dstack([out, alpha * 255]).round().astype(np.uint8)
    a[alpha == 0] = 0
    return Image.fromarray(a, "RGBA")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        if f.suffix.lower() not in (".png", ".webp", ".jpg", ".jpeg"):
            continue
        gid = game_id(f.stem)
        im = Image.open(f)
        if f.stem == "wildLink":
            img = cut_white(im)
        else:
            img = strip_navy(im.convert("RGBA"))
        img = trim(img)
        img.save(OUT / f"{gid}.png")
        print("ok", gid, img.size)


if __name__ == "__main__":
    main()
