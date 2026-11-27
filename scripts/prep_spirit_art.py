#!/usr/bin/env python3
"""Prepare Spirit Tracks source art (and the ChuChu expansion's): copy to art-src/ under game ids as
trimmed RGBA PNGs.

Special cases:
  heroOfSpirits_logo.jpg   a JPEG on white with the Spirit Tracks logo and a watermark beside Link: both
                           are painted out, then the white background is flood-filled from the border and
                           the edge un-mixed from the white -> heroOfSpirits.
  renamed                  chuchuBasic -> chuchuStandard, chuchuFlame -> chuchuFire, chuchuFrost -> chuchuIce,
                           possessedZeldaMalladus -> malladusZelda (docs/chuchu-expansion.md, the pack doc).
  small sprites            (shortest side < 300px) a smooth LANCZOS upscale.
  others                   already transparent: faint haze dropped.

Usage: python3 scripts/prep_spirit_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "spirit_tracks"
OUT = ROOT / "art-src"

RENAME = {
    "heroOfSpirits_logo": "heroOfSpirits",
    "chuchuBasic": "chuchuStandard",
    "chuchuFlame": "chuchuFire",
    "chuchuFrost": "chuchuIce",
    "possessedZeldaMalladus": "malladusZelda",
}
MIN_SIDE = 300
# heroOfSpirits_logo.jpg (736x844): the logo and the watermark, as boxes in source pixels.
LOGO_BOXES = [(352, 455, 736, 662), (560, 690, 736, 844)]


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


def remove_light(im: Image.Image, thresh: int = 228) -> Image.Image:
    """Flood-fill a light background from the border; keep enclosed light areas; un-mix the edge."""
    rgb = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = rgb.shape
    lo = rgb.min(axis=2)
    cand = lo >= thresh
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
    a = np.array(im).astype(np.int32)
    a[..., 3][a[..., 3] < cut] = 0
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def keep_main_figure(im: Image.Image, frac: float = 0.03) -> Image.Image:
    """Keep the connected opaque regions at least `frac` of the largest one (drops stray specks)."""
    solid = im.getchannel("A").point(lambda a: 255 if a > 24 else 0)
    m = solid.copy()
    arr = np.array(solid)
    label = 1
    ys, xs = np.nonzero(arr == 255)
    for y, x in zip(ys, xs):
        if m.getpixel((int(x), int(y))) != 255:
            continue
        label += 1
        if label >= 255:
            break
        ImageDraw.floodfill(m, (int(x), int(y)), label)
    lab = np.array(m)
    sizes = {v: int((lab == v).sum()) for v in range(2, label + 1)}
    if not sizes:
        return im
    big = max(sizes.values())
    keep = np.isin(lab, [v for v, s in sizes.items() if s >= big * frac])
    near = np.array(Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    a = np.array(im)
    a[..., 3] = np.where(near, a[..., 3], 0)
    return Image.fromarray(a, "RGBA")


def hero_of_spirits(raw: Image.Image) -> Image.Image:
    im = raw.convert("RGB")
    d = ImageDraw.Draw(im)
    for box in LOGO_BOXES:
        d.rectangle(box, fill=(255, 255, 255))
    # The pale outline glow around the figure counts as background too.
    cut = remove_light(im, thresh=222)
    return keep_main_figure(trim(clean_halo(cut, 40)))


def upscale(im: Image.Image) -> Image.Image:
    w, h = im.size
    if min(w, h) < MIN_SIDE:
        k = -(-MIN_SIDE // min(w, h))
        return im.resize((w * k, h * k), Image.LANCZOS)
    return im


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        gid = RENAME.get(f.stem, f.stem)
        raw = Image.open(f)
        if f.stem == "heroOfSpirits_logo":
            img = hero_of_spirits(raw)
        else:
            img = upscale(trim(clean_halo(raw.convert("RGBA"))))
        img.save(OUT / f"{gid}.png")
        print("ok", gid, img.size)


if __name__ == "__main__":
    main()
