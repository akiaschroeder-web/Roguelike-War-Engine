#!/usr/bin/env python3
"""Prepare Era of Legend source art (A Link to the Past, Link's Awakening, the Oracles):
copy to art-src/ under game ids as trimmed RGBA PNGs.

Special cases:
  heroOfLegendHarp.jpg  a JPEG on white: the background is removed by a flood fill from the
                        border (interior whites stay) and the edge un-mixed from the white.
  antiFairy.png         an opaque image with a white/grey "transparency" checkerboard baked in:
                        the neutral light background is flood-filled from the border.
  smog_patternbg.png    a navy pattern background left at near-zero alpha: dropped (id smog).
  headThwomp.png        the GIF frame's floor shadow (below a gap) is cut off.
  pixel sprites         (PIXEL below) upscaled with NEAREST by an integer factor so the shortest
                        side is at least 300px, so they stay crisp in portraits and battle art.
  others                already transparent: faint haze dropped.

Usage: python3 scripts/prep_legend_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "era_of_legend"
OUT = ROOT / "art-src"

# source stem -> game art id (default: the same)
RENAME = {"smog_patternbg": "smog"}
# Pixel-art sprites (upscaled with NEAREST).
PIXEL = {
    "aginah", "blind", "bunnyLink", "cukeman", "eyesoar", "fluteBoy", "headThwomp", "medusaHead", "nightmareAgahnim",
    "nightmareGanon", "nightmareGel", "nightmareDethI", "octogon", "pumpkinHead", "ramrock", "shadowHag", "smasher", "subterror",
    "trinexx", "veranBee", "veranFairy", "veranSpider", "veranTurtle", "vitreous", "onoxDragon",
}
# Small painted art: a smooth 2x so the face crops aren't blurry.
SMALL = {"dimitri", "moosh", "kholdstare", "octorokSS", "helmasaurKing"}
MIN_SIDE = 300


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


def remove_light(im: Image.Image, thresh: int = 228, neutral: int | None = None) -> Image.Image:
    """Flood-fill a light background from the border; keep enclosed light areas.
    neutral: also require low saturation (max - min channel below this) — for grey checkerboards."""
    rgb = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = rgb.shape
    lo = rgb.min(axis=2)
    cand = lo >= thresh
    if neutral is not None:
        cand &= (rgb.max(axis=2) - lo) < neutral
    bg = flood_from_border(Image.fromarray(np.where(cand, 255, 0).astype(np.uint8), "L"))
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


def clean_halo(im: Image.Image, cut: int = 16) -> Image.Image:
    """Drop the faint haze (near-transparent pixels) around the figure."""
    a = np.array(im).astype(np.int32)
    a[..., 3][a[..., 3] < cut] = 0
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def drop_shadow_bar(im: Image.Image) -> Image.Image:
    """Head Thwomp's GIF frame has its floor shadow below a gap of empty rows: cut it off."""
    rows = (np.array(im.getchannel("A")) > 24).any(axis=1)
    top = int(np.argmax(rows))
    gap = np.where(~rows[top:])[0]
    return im.crop((0, 0, im.width, top + int(gap[0]))) if len(gap) else im


def upscale(im: Image.Image, stem: str) -> Image.Image:
    w, h = im.size
    if stem in PIXEL:
        k = max(1, -(-MIN_SIDE // min(w, h)))
        return im.resize((w * k, h * k), Image.NEAREST) if k > 1 else im
    if stem in SMALL:
        return im.resize((w * 2, h * 2), Image.LANCZOS)
    return im


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        gid = RENAME.get(f.stem, f.stem)
        raw = Image.open(f)
        if f.stem == "heroOfLegendHarp":
            img = remove_light(raw)
        elif f.stem == "antiFairy":
            img = remove_light(raw, thresh=180, neutral=24)
        else:
            img = clean_halo(raw.convert("RGBA"), 40 if f.stem == "smog_patternbg" else 16)
        if f.stem == "headThwomp":
            img = drop_shadow_bar(trim(img))
        img = upscale(trim(img), f.stem)
        img.save(OUT / f"{gid}.png")
        print("ok", gid, img.size)


if __name__ == "__main__":
    main()
