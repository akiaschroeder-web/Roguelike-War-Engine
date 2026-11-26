#!/usr/bin/env python3
"""Prepare Twilight Princess (and extra-unit) source art: copy to art-src/, cut out the
few opaque backgrounds, crop Stallord's Head out of Stallord.

Usage: python3 scripts/prep_tp_art.py   (then python3 scripts/process_art.py)
"""
import colorsys
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from prep_ww_art import blobs, crop_frac, keep_mask, trim  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "twilight_princess"
OUT = ROOT / "art-src"

# game id -> source file (default: <id>.<ext>)
RENAME = {
    "zeldaTP": "zeldaTP", "kingBulblin": "kingBulblin", "bullboTP": "bullboTP",
}


def main() -> None:
    OUT.mkdir(exist_ok=True)
    skip = {"lanayru", "stallord", "NOTES"}
    for f in sorted(SRC.iterdir()):
        if f.stem in skip or f.suffix == ".txt":
            continue
        trim(Image.open(f).convert("RGBA")).save(OUT / f"{f.stem}.png")

    # Lanayru: painted water scene. Keep the pale serpent above the waterline.
    lan = Image.open(SRC / "lanayru.webp").convert("RGBA")
    w, h = lan.size

    def keep(hh, ss, vv, r, g, b):
        if vv < 0.45:
            return False
        if 0.35 <= hh <= 0.62 and ss > 0.25:
            return False
        return True

    from PIL import ImageDraw, ImageFilter
    # Below the horizon (y > 0.26) the water is the same colour as the serpent, so only the
    # hand-traced coils survive there.
    shape = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(shape)
    d.rectangle((0, 0, w, int(0.26 * h)), fill=255)
    polys = [
        [(0.27, .20), (.64, .20), (.65, .45), (.66, .60), (.62, .65), (.55, .70), (.45, .72), (.30, .72), (.22, .68),
         (.19, .60), (.20, .50), (.22, .42), (.20, .33), (.24, .26)],
        [(.01, .52), (.03, .42), (.08, .37), (.15, .36), (.20, .40), (.22, .47), (.20, .53), (.12, .57), (.04, .57)],
        [(.64, .40), (.72, .39), (.76, .42), (.74, .52), (.70, .57), (.66, .58)],
        [(.70, .50), (.73, .45), (.80, .43), (.87, .43), (.95, .47), (.985, .55), (.97, .63), (.88, .68), (.82, .72),
         (.76, .74), (.72, .68), (.70, .60)],
    ]
    for poly in polys:
        d.polygon([(x * w, y * h) for x, y in poly], fill=255)
    shape = shape.filter(ImageFilter.GaussianBlur(3))
    body = keep_mask(lan, keep)
    full = Image.new("RGBA", (w, h))
    full.paste(lan, (0, 0))
    # keep_mask trims; redo the alpha at full size instead
    a = Image.new("L", (w, h), 0)
    px = lan.load()
    ap = a.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            ap[x, y] = 255 if keep(hh, ss, vv, r, g, b) else 0
    from PIL import ImageChops
    full.putalpha(ImageChops.multiply(a.filter(ImageFilter.GaussianBlur(1)), shape))
    del body
    blobs(trim(full), 3)[0].save(OUT / "lanayru.png")

    # Stallord stands on a sand slope (lower right). Remove the slope except under its foot.
    st = Image.open(SRC / "stallord.webp").convert("RGBA")
    sw, sh = st.size
    px = st.load()
    for y in range(int(0.55 * sh), sh):
        for x in range(int(0.30 * sw), sw):
            r, g, b, a = px[x, y]
            if not a:
                continue
            # slope boundary: roughly a circle arc from (1.0, 0.60) to (0.35, 1.0)
            fx, fy = x / sw, y / sh
            below = fy > 0.60 + (1.0 - fx) ** 1.35 * 0.62
            foot = 0.66 <= fx <= 0.77 and fy < 0.92
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            sandy = (hh < 0.08 or hh > 0.95) and ss > 0.25
            if below and not (foot and not sandy):
                px[x, y] = (0, 0, 0, 0)
    blobs(st, 3)[0].save(OUT / "stallord.png")
    # Stallord's Head: the horned skull, upper left.
    head = crop_frac(Image.open(OUT / "stallord.png").convert("RGBA"), 0.0, 0.0, 0.40, 0.62)
    blobs(head, 2)[0].save(OUT / "stallordsHead.png")


if __name__ == "__main__":
    main()
