#!/usr/bin/env python3
"""Prepare Phantom Hourglass source art (and the pending Era of Legend / OoT units):
copy to art-src/ under game ids as trimmed RGBA PNGs.

Special cases:
  cubusSisters_group.webp  all four Cubus Sisters in one image: each is cut out with a polygon
                           mask (the figures overlap), then only the sister's own connected
                           figure is kept -> cubusSister1 (red), 2 (blue), 3 (gold, with the
                           cyan energy orb in front of her face), 4 (green).
  gleeokPH.jpg             a JPEG on white: the background is flood-filled from the border and the
                           edge un-mixed from the white; the sea and splash stay part of the art.
  ghostShipPH.webp         becomes the Wind Waker `ghostShip` art (binding user request): made
                           translucent (~65% alpha) and tinted light blue. Replaces art-src/ghostShip.png
                           (scripts/prep_ww_art.py no longer writes ghostShip).
  small sprites            (SMALL) a smooth LANCZOS upscale so the shortest side is >= 300px.
  others                   already transparent: faint haze dropped.

Usage: python3 scripts/prep_phantom_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "phantom_hourglass"
LEGEND = ROOT / "art_sources" / "era_of_legend"
OUT = ROOT / "art-src"

EXTRA = [LEGEND / "potionShopLady.png", LEGEND / "rosa.webp", LEGEND / "subrosian.png"]
SKIP = {"cubusSisters_group", "ghostShipPH", "gleeokPH"}
SMALL = {"bremeur", "doylan", "max", "ciela", "neri", "yook", "jolenesShip", "subrosian", "anouki", "bellumbeck", "blaaz",
         "ghostShipPH", "potionShopLady", "oceanKing"}
MIN_SIDE = 300

# Cubus Sisters: polygons in source pixels (1274x850) around each figure.
CUBUS = {
    "cubusSister1": [(0, 120), (275, 120), (300, 300), (258, 340), (234, 380), (228, 420), (234, 480), (262, 505),
                     (282, 520), (282, 580), (232, 660), (90, 670), (0, 470)],
    "cubusSister2": [(258, 342), (470, 318), (482, 420), (535, 480), (546, 448), (560, 446), (574, 470), (596, 545),
                     (662, 690), (600, 830), (228, 810), (230, 720), (265, 650), (286, 600), (286, 520), (262, 505),
                     (238, 480), (232, 420), (238, 380)],
    "cubusSister3": [(440, 0), (940, 0), (935, 200), (905, 300), (918, 380), (905, 430), (820, 560), (800, 645),
                     (612, 645), (584, 520), (566, 462), (532, 412), (440, 330)],
    "cubusSister4": [(915, 240), (1274, 240), (1274, 850), (770, 850), (790, 610), (840, 560), (906, 440), (918, 380)],
}


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


def keep_main_figure(im: Image.Image, frac: float = 0.04) -> Image.Image:
    """Keep the connected opaque regions at least `frac` of the largest one (drops neighbours' slivers)."""
    solid = im.getchannel("A").point(lambda a: 255 if a > 24 else 0)
    w, h = solid.size
    arr = np.array(solid)
    label = 1
    sizes = {}
    m = solid.copy()
    ys, xs = np.nonzero(arr == 255)
    for y, x in zip(ys, xs):
        if m.getpixel((int(x), int(y))) != 255:
            continue
        label += 1
        if label >= 255:
            break
        ImageDraw.floodfill(m, (int(x), int(y)), label)
    lab = np.array(m)
    for v in range(2, label + 1):
        sizes[v] = int((lab == v).sum())
    if not sizes:
        return im
    big = max(sizes.values())
    keep = np.isin(lab, [v for v, s in sizes.items() if s >= big * frac])
    # keep the soft edge next to kept regions
    near = np.array(Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    a = np.array(im)
    a[..., 3] = np.where(near, a[..., 3], 0)
    return Image.fromarray(a, "RGBA")


def cubus(raw: Image.Image) -> dict[str, Image.Image]:
    im = clean_halo(raw.convert("RGBA"))
    out = {}
    for gid, poly in CUBUS.items():
        mask = Image.new("L", im.size, 0)
        ImageDraw.Draw(mask).polygon(poly, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(1.2))
        cut = im.copy()
        cut.putalpha(Image.fromarray(np.minimum(np.array(im.getchannel("A")), np.array(mask))))
        out[gid] = keep_main_figure(trim(cut))
    return out


def ghost_tint(im: Image.Image, opacity: float = 0.68) -> Image.Image:
    """Translucent, light-blue spectral version of the ship."""
    a = np.array(im).astype(np.float64)
    rgb = a[..., :3]
    lum = (0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]) / 255
    tint = np.array([160.0, 220.0, 255.0])
    shade = (0.62 + 0.75 * lum)[..., None] * tint
    out = np.clip(0.15 * rgb + 0.85 * shade + 20, 0, 255)
    alpha = a[..., 3] * opacity
    return Image.fromarray(np.dstack([out, alpha]).astype(np.uint8), "RGBA")


def upscale(im: Image.Image, stem: str) -> Image.Image:
    w, h = im.size
    if stem in SMALL and min(w, h) < MIN_SIDE:
        k = -(-MIN_SIDE // min(w, h))
        return im.resize((w * k, h * k), Image.LANCZOS)
    return im


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()) + EXTRA:
        raw = Image.open(f)
        if f.stem == "cubusSisters_group":
            for gid, img in cubus(raw).items():
                img.save(OUT / f"{gid}.png")
                print("ok", gid, img.size)
            continue
        if f.stem == "gleeokPH":
            img = trim(remove_light(raw, thresh=236))
        elif f.stem == "ghostShipPH":
            img = ghost_tint(upscale(trim(clean_halo(raw.convert("RGBA"))), f.stem))
            img.save(OUT / "ghostShip.png")
            print("ok ghostShip (from ghostShipPH)", img.size)
            continue
        else:
            img = upscale(trim(clean_halo(raw.convert("RGBA"))), f.stem)
        assert f.stem not in SKIP or f.stem == "gleeokPH"
        img.save(OUT / f"{f.stem}.png")
        print("ok", f.stem, img.size)


if __name__ == "__main__":
    main()
