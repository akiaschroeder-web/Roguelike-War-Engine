#!/usr/bin/env python3
"""Prepare Tri Force Heroes source art (art_sources/triforce_heroes/): copy to art-src/ under game ids as trimmed RGBA PNGs.
Pillow and NumPy only.

Special cases:
  kingTuft.jpg                         a black backdrop: near-black pixels connected to the border are keyed out, then the
                                       black line art within 3px of the figure is restored (the outline stays), and the
                                       loose trembling marks around him are dropped (only his connected shape is kept).
  styla.webp                           a white backdrop (RGB): keyed out from the border with a soft edge.
  grimRepoe.webp                       a grey ground-shadow disc under it (half-transparent black): the region grown from the
                                       disc's centre is removed.
  totem_GreenTop_RedMid_BlueBottom.jpg a white backdrop, keyed out; then the six stacking orders of the three heroes are made
                                       by swapping the tunic and hair colours (hue classes green / red / blue, remapped in HSV
                                       to the target hero's measured colour), as totem<TOP><MID><BOTTOM>.png, and the six
                                       two-hero stacks cropped from them (the top two figures), as totem<TOP><BOTTOM>.png.
  *_alt files                          -> their game ids (greenHeroALBW for the ALBW Link, stylaCursed for Styla).
  small renders                        (shortest side < 400px) a 2x LANCZOS upscale.

Usage: python3 scripts/prep_triforce_art.py   (then ONLY=... python3 scripts/process_art.py)
"""
from collections import deque
from itertools import permutations
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "triforce_heroes"
OUT = ROOT / "art-src"

RENAME = {"greenHero_ALBWLink_alt": "greenHeroALBW", "stylaCursed_alt": "stylaCursed", "totem_GreenTop_RedMid_BlueBottom": "totem"}
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


def flood(mask: np.ndarray, seeds: list[tuple[int, int]]) -> np.ndarray:
    """Pixels of `mask` 4-connected to any seed (y, x)."""
    h, w = mask.shape
    out = np.zeros_like(mask, dtype=bool)
    q = deque()
    for y, x in seeds:
        if mask[y, x] and not out[y, x]:
            out[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True
                q.append((ny, nx))
    return out


def border_seeds(h: int, w: int) -> list[tuple[int, int]]:
    return [(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)]


def key_white(im: Image.Image, lo: int = 222, hi: int = 246) -> Image.Image:
    """Key out a white backdrop connected to the border, with a soft edge between `lo` and `hi` (the minimum channel)."""
    a = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = a.shape
    mn = a.min(axis=2)
    sat = a.max(axis=2) - mn
    bg = flood((mn > lo) & (sat < 28), border_seeds(h, w))
    alpha = np.full((h, w), 255, dtype=np.int32)
    soft = np.clip((hi - mn) * 255 // max(1, hi - lo), 0, 255)
    alpha[bg] = soft[bg]
    out = np.dstack([a, alpha]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def key_black(im: Image.Image, dark: int = 34, keep: int = 3) -> Image.Image:
    """Key out a black backdrop connected to the border; dark line art within `keep` px of the figure is restored."""
    a = np.array(im.convert("RGB")).astype(np.int32)
    h, w, _ = a.shape
    mx = a.max(axis=2)
    bg = flood(mx < dark, border_seeds(h, w))
    fig = Image.fromarray(((~bg) * 255).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(2 * keep + 1))
    near = np.array(fig) > 0
    # Black pixels touching the colours are the outline; the rest of the black is the backdrop.
    solid = ~bg | (near & bg & ~flood(bg & ~near, border_seeds(h, w)))
    alpha = np.where(solid, 255, 0).astype(np.uint8)
    alpha = np.array(Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.7)))
    return Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), "RGBA")


def main_shape(im: Image.Image, thresh: int = 60) -> Image.Image:
    """Keep only the figure's own connected shape (grown from its centre): drops loose marks around it."""
    a = np.array(im.convert("RGBA"))
    h, w, _ = a.shape
    solid = a[..., 3] > thresh
    ys, xs = np.nonzero(solid)
    cy, cx = int(np.median(ys)), int(np.median(xs))
    if not solid[cy, cx]:
        d = (ys - cy) ** 2 + (xs - cx) ** 2
        cy, cx = int(ys[d.argmin()]), int(xs[d.argmin()])
    keep = flood(solid, [(cy, cx)])
    grown = np.array(Image.fromarray((keep * 255).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(3))) > 0
    a[..., 3] = np.where(grown, a[..., 3], 0)
    return Image.fromarray(a, "RGBA")


def remove_grey_disc(im: Image.Image) -> Image.Image:
    """Grim Repoe's ground shadow: a flat disc of half-transparent black (it reads as grey). Grow that region from the
    disc's centre and clear it (the opaque figure above it is untouched)."""
    a = np.array(im.convert("RGBA")).astype(np.int32)
    h, w, _ = a.shape
    rgb = a[..., :3]
    al = a[..., 3]
    shade = (rgb.max(axis=2) < 40) & (al > 30) & (al < 230)
    ys, xs = np.nonzero(shade[int(h * 0.65):, :])
    if not len(ys):
        return im
    cy, cx = int(np.median(ys)) + int(h * 0.65), int(np.median(xs))
    disc = flood(shade, [(cy, cx)])
    # The disc's anti-aliased rim: faint dark pixels next to it.
    rim = np.array(Image.fromarray((disc * 255).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(5))) > 0
    disc |= rim & (rgb.max(axis=2) < 60) & (al < 230)
    a[..., 3][disc] = 0
    return Image.fromarray(a.astype(np.uint8), "RGBA")


# ───────────────────────── Totem colour swaps ─────────────────────────

def rgb_to_hsv(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(axis=-1), rgb.min(axis=-1)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rm = m & (mx == r)
    gm = m & (mx == g) & ~rm
    bm = m & ~rm & ~gm
    h[rm] = ((g - b)[rm] / d[rm]) % 6
    h[gm] = (b - r)[gm] / d[gm] + 2
    h[bm] = (r - g)[bm] / d[bm] + 4
    h = h * 60
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    return np.stack([h, s, mx], axis=-1)


def hsv_to_rgb(hsv: np.ndarray) -> np.ndarray:
    h, s, v = hsv[..., 0] % 360, np.clip(hsv[..., 1], 0, 1), np.clip(hsv[..., 2], 0, 1)
    c = v * s
    x = c * (1 - np.abs((h / 60) % 2 - 1))
    m = v - c
    z = np.zeros_like(h)
    k = (h // 60).astype(int)
    r = np.choose(k % 6, [c, x, z, z, x, c])
    g = np.choose(k % 6, [x, c, c, x, z, z])
    b = np.choose(k % 6, [z, z, x, c, c, x])
    return np.stack([r + m, g + m, b + m], axis=-1)


def hero_classes(hsv: np.ndarray, alpha: np.ndarray) -> dict[str, np.ndarray]:
    """Tunic and hair pixels of each hero, by hue: green, red, blue (skin, belts, boots and the sword are left alone)."""
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    vis = (alpha > 0) & (v > 0.16)
    return {
        "G": vis & (h >= 62) & (h < 165) & (s > 0.28),
        "R": vis & ((h < 14) | (h >= 335)) & (s > 0.45),
        "B": vis & (h >= 190) & (h < 262) & (s > 0.32),
    }


def recolour(im: Image.Image, mapping: dict[str, str]) -> Image.Image:
    """Swap the heroes' colours: pixels of class `src` take the hue (and the relative saturation and brightness) of `dst`."""
    a = np.array(im.convert("RGBA")).astype(np.float64)
    hsv = rgb_to_hsv(a[..., :3] / 255)
    cls = hero_classes(hsv, a[..., 3])
    stats = {}
    for k, m in cls.items():
        sel = hsv[m]
        # Circular mean hue (red wraps around 0).
        ang = np.deg2rad(sel[:, 0])
        hue = np.rad2deg(np.arctan2(np.sin(ang).mean(), np.cos(ang).mean())) % 360
        stats[k] = (hue, sel[:, 1].mean(), sel[:, 2].mean())
    out = hsv.copy()
    for src, dst in mapping.items():
        if src == dst:
            continue
        m = cls[src]
        sh, ss, sv = stats[src]
        dh, ds, dv = stats[dst]
        dhue = ((hsv[m][:, 0] - sh + 180) % 360) - 180
        out[m, 0] = (dh + dhue * 0.6) % 360
        out[m, 1] = np.clip(hsv[m][:, 1] * ds / max(ss, 1e-6), 0, 1)
        out[m, 2] = np.clip(hsv[m][:, 2] * dv / max(sv, 1e-6), 0, 1)
    rgb = (hsv_to_rgb(out) * 255).round()
    return Image.fromarray(np.dstack([rgb, a[..., 3]]).astype(np.uint8), "RGBA")


# The source order (top, middle, bottom) is Green, Red, Blue. The cut between the top two and the bottom figure.
SOURCE = "GRB"
TWO_CUT = 0.565


def totems(base: Image.Image) -> None:
    for order in permutations("GRB"):
        top3 = "".join(order)
        mapping = {SOURCE[i]: order[i] for i in range(3)}
        img = recolour(base, mapping)
        save(trim(img), f"totem{top3}")
        # Two heroes: the top two figures, cropped above the bottom one (its colours faded out below the cut).
        w, h = img.size
        cut = int(h * TWO_CUT)
        two = img.crop((0, 0, w, cut))
        arr = np.array(two)
        fade = 14
        for i in range(fade):
            arr[cut - fade + i, :, 3] = (arr[cut - fade + i, :, 3].astype(int) * (fade - i) // fade).astype(np.uint8)
        save(trim(Image.fromarray(arr, "RGBA")), f"totem{order[0]}{order[1]}")


def save(img: Image.Image, gid: str) -> None:
    img.save(OUT / f"{gid}.png")
    print("ok", gid, img.size)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        gid = RENAME.get(f.stem, f.stem)
        raw = Image.open(f)
        if f.stem == "kingTuft":
            save(upscale(trim(main_shape(key_black(raw)))), gid)
            continue
        if f.stem == "styla":
            save(trim(clean_halo(key_white(raw))), gid)
            continue
        if f.stem.startswith("totem_"):
            keyed = upscale(trim(clean_halo(key_white(raw))))
            totems(keyed)
            continue
        img = raw.convert("RGBA")
        if f.stem == "grimRepoe":
            img = remove_grey_disc(img)
        save(upscale(trim(clean_halo(img))), gid)


if __name__ == "__main__":
    main()
