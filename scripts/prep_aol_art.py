#!/usr/bin/env python3
"""Prepare Zelda II: The Adventure of Link source art: copy to art-src/ under game ids as
trimmed RGBA PNGs.

Special cases:
  sleepingZelda_sheet.jpg  a JPEG concept sheet on white: the full-body standing figure (top
                           right) is cropped out and the white background removed by a flood fill
                           from the border (interior whites stay), the edge un-mixed from the white.
  thunderbird_painting.png a square painting: the winged figure is cut out of its yellow painted
                           background by colour segmentation (purple/blue/dark vs yellow), keeping
                           the connected region around the body (the cloud line-art, banner and
                           frame are separate and drop out), holes filled, edges smoothed.
  others                   already transparent: faint haze dropped and light (near-white)
                           fringes pulled in.

Usage: python3 scripts/prep_aol_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "adventure_of_link"
OUT = ROOT / "art-src"

# source stem -> game art id (default: the same)
RENAME = {"sleepingZelda_sheet": "sleepingZelda", "thunderbird_painting": "thunderbird"}
# Scans whose outline has a light fringe: pull it in by a pixel.
DEFRINGE = {"bagoBago", "bit", "bot", "doomknocker", "moa", "myu", "rebonack", "wosu", "helmethead", "carock", "geldarm", "mago"}

# The standing figure on the Zelda sheet (pixels of the 236x326 source).
ZELDA_BOX = (137, 14, 235, 220)


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def flood_from_border(mask: Image.Image, value: int = 128) -> np.ndarray:
    """mask: 'L' with 255 = candidate background. Returns the part reachable from the border."""
    m = mask.copy()
    w, h = m.size
    for x in range(w):
        for y in (0, h - 1):
            if m.getpixel((x, y)) == 255:
                ImageDraw.floodfill(m, (x, y), value)
    for y in range(h):
        for x in (0, w - 1):
            if m.getpixel((x, y)) == 255:
                ImageDraw.floodfill(m, (x, y), value)
    return np.array(m) == value


def remove_white(im: Image.Image, thresh: int = 228) -> Image.Image:
    """Flood-fill the white background from the border; keep enclosed whites."""
    rgb = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = rgb.shape
    lo = rgb.min(axis=2)
    bg = flood_from_border(Image.fromarray(np.where(lo >= thresh, 255, 0).astype(np.uint8), "L"))
    near = np.array(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
    band = near & ~bg
    alpha = np.full((h, w), 255.0)
    alpha[bg] = 0
    a_band = np.clip((255 - lo) / (255 - 140), 0, 1)
    alpha[band] = np.minimum(255, a_band[band] * 255)
    out = rgb.astype(np.float64)
    a = np.clip(alpha / 255, 1e-3, 1)[..., None]
    unmixed = np.clip((out - (1 - a) * 255) / a, 0, 255)
    out = np.where(band[..., None], unmixed, out)
    res = Image.fromarray(np.dstack([out, alpha]).astype(np.uint8), "RGBA")
    al = res.getchannel("A").filter(ImageFilter.GaussianBlur(0.4))
    res.putalpha(Image.fromarray(np.minimum(np.array(al), alpha.astype(np.uint8))))
    return res


def sleeping_zelda(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGB").crop(ZELDA_BOX)
    rgb = np.array(im)
    # A stray pen stroke from the sheet runs past both hands: paint it out.
    rgb[116:124, 0:8] = 255
    rgb[116:124, 86:] = 255
    # The floor shadow under her shoes.
    rgb[200:, :] = np.where(rgb[200:, :].min(axis=2, keepdims=True) > 150, 255, rgb[200:, :])
    big = Image.fromarray(rgb).resize((im.width * 3, im.height * 3), Image.LANCZOS)
    out = remove_white(big)
    # Keep only the figure (drop sketch specks from the neighbouring drawings).
    al = np.array(out.getchannel("A"))
    seed = Image.fromarray(np.where(al > 40, 255, 0).astype(np.uint8))
    ImageDraw.floodfill(seed, (out.width // 2, out.height // 2), 128)
    keep = np.array(seed.filter(ImageFilter.MaxFilter(5))) == 128
    out.putalpha(Image.fromarray(np.where(keep, al, 0).astype(np.uint8)))
    return out


def thunderbird(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGB")
    W, Hh = im.size
    S = 1000
    small = im.resize((S, S), Image.LANCZOS)
    hsv = np.array(small.convert("HSV")).astype(np.int32)
    rgb = np.array(small).astype(np.int32)
    hue, val = hsv[..., 0] * 360 // 255, hsv[..., 2]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    yellow = (hue >= 20) & (hue <= 70) & (val > 150)
    fig = ((b - (r + g) / 2 > -20) | (val < 110)) & ~yellow
    # The frame: never part of the figure.
    fig[:12, :] = fig[-12:, :] = False
    fig[:, :12] = fig[:, -12:] = False
    m = Image.fromarray((fig * 255).astype(np.uint8))
    # Break thin cloud lines off, then keep the region connected to the body.
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    seeded = m.copy()
    ImageDraw.floodfill(seeded, (500, 560), 128)
    body = (np.array(seeded) == 128)
    # Close speckled feather tips, then fill enclosed holes (eyes, Triforce, gaps in the plumage).
    bm = Image.fromarray((body * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    outside = flood_from_border(Image.fromarray(255 - np.array(bm)))
    solid = ~outside
    # Never reach below the body into the lettering banner.
    solid[925:, :] = False
    mask = Image.fromarray((solid * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))
    mask = mask.resize((W, Hh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.2))
    out = im.convert("RGBA")
    al = np.array(mask).astype(np.float64)
    # Along the edge, yellow background pixels go fully transparent.
    full = np.array(im.convert("HSV")).astype(np.int32)
    fh, fv = full[..., 0] * 360 // 255, full[..., 2]
    fy = (fh >= 20) & (fh <= 70) & (fv > 170) & (full[..., 1] > 50)
    edge = (al > 0) & (al < 255)
    al[edge & fy] *= 0.15
    out.putalpha(Image.fromarray(np.clip(al, 0, 255).astype(np.uint8)))
    out = trim(out)
    return out.resize((out.width // 2, out.height // 2), Image.LANCZOS)


def clean_halo(im: Image.Image, defringe: bool) -> Image.Image:
    """Drop the faint haze around scans; optionally fade a light outline by one pixel."""
    a = np.array(im).astype(np.int32)
    al = a[..., 3]
    al[al < 16] = 0
    if defringe:
        opaque = Image.fromarray(((al > 0) * 255).astype(np.uint8))
        inner = np.array(opaque.filter(ImageFilter.MinFilter(3))) > 0
        edge = (al > 0) & ~inner
        light = a[..., :3].min(axis=2) > 200
        al[edge & light] = (al[edge & light] * 0.3).astype(np.int32)
    a[..., 3] = al
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        gid = RENAME.get(f.stem, f.stem)
        if f.stem == "sleepingZelda_sheet":
            img = sleeping_zelda(f)
        elif f.stem == "thunderbird_painting":
            img = thunderbird(f)
        else:
            img = clean_halo(Image.open(f).convert("RGBA"), f.stem in DEFRINGE)
        img = trim(img)
        img.save(OUT / f"{gid}.png")
        print("ok", gid, img.size)


if __name__ == "__main__":
    main()
