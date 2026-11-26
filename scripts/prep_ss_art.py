#!/usr/bin/env python3
"""Prepare Skyward Sword source art: copy to art-src/ under game ids, and cut the
Faron and Eldin dragons out of their in-game backgrounds with hand-traced outlines.

Usage: python3 scripts/prep_ss_art.py   (then python3 scripts/process_art.py)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art_sources" / "skyward_sword"
OUT = ROOT / "art-src"

# source stem -> game art id (default: the same)
RENAME = {
    "skyLink": "heroOfTheSky", "ssZelda": "zeldaSS", "ssImpa": "impaSS",
    "lanayruSS": "lanayruDragon", "faronSS_uncropped": "faronDragon", "eldinSS_uncropped": "eldinDragon",
    "loftwingSS": "loftwingBlue",
}

FARON = [(.44, .16), (.46, .14), (.49, .135), (.51, .155), (.55, .17), (.555, .20), (.53, .215), (.53, .24), (.60, .25),
         (.65, .27), (.66, .32), (.65, .38), (.70, .38), (.73, .40), (.765, .46), (.775, .52), (.75, .58), (.735, .63),
         (.76, .645), (.80, .70), (.82, .72), (.88, .71), (.94, .74), (.95, .78), (.92, .82), (.86, .825), (.82, .81),
         (.825, .88), (.83, .95), (.82, 1.0), (.16, 1.0), (.17, .88), (.17, .75), (.19, .67), (.22, .655), (.225, .55),
         (.23, .50), (.25, .485), (.33, .47), (.36, .44), (.36, .34), (.40, .30), (.45, .26), (.46, .24), (.43, .21),
         (.44, .18)]
FARON_WHISKERS = [
    [(.445, .15), (.40, .15), (.33, .16), (.29, .20), (.24, .25), (.19, .30), (.16, .35), (.16, .38), (.20, .40),
     (.25, .41), (.26, .44), (.24, .47)],
    [(.50, .135), (.53, .11), (.56, .095), (.60, .10), (.65, .115), (.70, .11), (.75, .09), (.79, .085), (.83, .11),
     (.87, .16), (.90, .20), (.89, .26), (.875, .30), (.87, .32), (.89, .34), (.95, .36)],
]
ELDIN = [(.40, .07), (.44, .09), (.50, .08), (.53, .04), (.56, .035), (.55, .09), (.53, .14), (.53, .165), (.59, .17),
         (.63, .19), (.645, .215), (.63, .26), (.64, .33), (.67, .36), (.72, .355), (.76, .37), (.785, .40), (.78, .44),
         (.75, .47), (.71, .48), (.72, .55), (.74, .60), (.765, .67), (.75, .70), (.70, .71), (.62, .735), (.55, .74),
         (.50, .75), (.47, .76), (.42, .76), (.40, .74), (.37, .70), (.33, .66), (.32, .60), (.32, .45), (.34, .39),
         (.38, .36), (.42, .27), (.46, .21), (.44, .17), (.43, .12), (.40, .10)]
ELDIN_TAIL = [(.47, .74), (.51, .75), (.51, .82), (.55, .855), (.62, .86), (.70, .835), (.75, .81), (.79, .81), (.79, .83),
              (.76, .87), (.70, .905), (.62, .93), (.55, .94), (.49, .92), (.455, .87), (.45, .80)]
ELDIN_WHISKERS = [[(.47, .19), (.40, .205), (.36, .215), (.34, .20)], [(.53, .19), (.60, .19), (.66, .185), (.69, .16), (.70, .14)]]


def trim(im: Image.Image) -> Image.Image:
    box = im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    return im.crop(box) if box else im


def cut(path: Path, polys, lines) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    scale = 4  # draw the mask big for smooth edges
    mask = Image.new("L", (w * scale, h * scale), 0)
    d = ImageDraw.Draw(mask)
    for poly in polys:
        d.polygon([(x * w * scale, y * h * scale) for x, y in poly], fill=255)
    for ln in lines:
        d.line([(x * w * scale, y * h * scale) for x, y in ln], fill=255, width=int(0.0075 * w * scale), joint="curve")
    mask = mask.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    im.putalpha(mask)
    return trim(im)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for f in sorted(SRC.iterdir()):
        gid = RENAME.get(f.stem, f.stem)
        if f.stem == "faronSS_uncropped":
            img = cut(f, [FARON], FARON_WHISKERS)
        elif f.stem == "eldinSS_uncropped":
            img = cut(f, [ELDIN, ELDIN_TAIL], ELDIN_WHISKERS)
        else:
            img = trim(Image.open(f).convert("RGBA"))
        img.save(OUT / f"{gid}.png")
        print("ok", gid, img.size)


if __name__ == "__main__":
    main()
