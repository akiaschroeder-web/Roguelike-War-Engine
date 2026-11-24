#!/usr/bin/env python3
"""Turn source character art (art-src/) into game assets.

For each entry in ART below:
  public/art/<id>.png        full-body art, trimmed, max 640px tall (battle cinematic)
  public/portraits/<id>.png  256x256 face crop (map tokens and menus)
and src/content/ocarina/artManifest.ts lists which ids have art.

face = (x, y, size) as fractions of the source image: the face centre and the
crop width relative to the image width. Tweak these if a crop looks off.

Usage: python3 scripts/process_art.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art-src"
ART = ROOT / "public" / "art"
PORTRAITS = ROOT / "public" / "portraits"
MANIFEST = ROOT / "src" / "content" / "ocarina" / "artManifest.ts"

# id: (source file, (face x, face y, crop width))
ENTRIES = {
    "link": ("link.png", (0.315, 0.315, 0.30)),
    "youngLink": ("youngLink.png", (0.55, 0.21, 0.40)),
    "zelda": ("zelda.png", (0.56, 0.21, 0.46)),
    "sheik": ("sheik.png", (0.36, 0.16, 0.40)),
    "saria": ("saria.png", (0.47, 0.13, 0.75)),
    "ruto": ("ruto.webp", (0.61, 0.15, 0.55)),
    "darunia": ("darunia.png", (0.50, 0.27, 0.80)),
    "rauru": ("rauru.webp", (0.49, 0.20, 0.60)),
    "impa": ("impa.webp", (0.51, 0.115, 0.62)),
    "nabooru": ("nabooru.webp", (0.46, 0.085, 0.50)),
    "talon": ("talon.png", (0.50, 0.22, 0.62)),
    "ingo": ("ingo.webp", (0.58, 0.135, 0.62)),
    "mido": ("mido.webp", (0.57, 0.34, 0.62)),
    "ganondorf": ("ganondorf.png", (0.67, 0.19, 0.24)),
    "ganon": ("ganon.png", (0.34, 0.19, 0.30)),
    # Batch 2
    "goronWarrior": ("goronWarrior.webp", (0.40, 0.32, 0.55)),
    "dampe": ("dampe.png", (0.52, 0.30, 0.60)),
    "maskSalesman": ("maskSalesman.webp", (0.17, 0.165, 0.30)),
    "carpenterBoss": ("carpenterBoss.png", (0.47, 0.16, 0.62)),
    "navi": ("navi.png", (0.60, 0.48, 0.90)),
    "kaepora": ("kaepora.png", (0.27, 0.36, 0.40)),
    "dekuTree": ("dekuTree.png", (0.37, 0.70, 0.40)),
    "koume": ("koume.png", (0.40, 0.50, 0.50)),
    "kotake": ("kotake.png", (0.31, 0.36, 0.42)),
    "twinrova": ("twinrova.webp", (0.46, 0.30, 0.26)),
    "darkLink": ("darkLink.webp", (0.36, 0.13, 0.42)),
    "ironKnuckleNabooru": ("ironKnuckleNabooru.webp", (0.46, 0.37, 0.55)),
    "hyruleSoldier": ("hyruleSoldier.webp", (0.50, 0.27, 0.50)),
    "kingZora": ("kingZora.webp", (0.36, 0.15, 0.40)),
    "phantomGanonMounted": ("phantomGanonMounted.webp", (0.645, 0.10, 0.16)),
    # Batch 3
    "kokiriA": ("kokiriA.png", (0.50, 0.21, 0.80)),
    "kokiriB": ("kokiriB.webp", (0.50, 0.27, 0.60)),
    "kokiriC": ("kokiriC.webp", (0.50, 0.29, 0.60)),
    "zoraWarrior": ("zoraWarrior.webp", (0.36, 0.10, 0.25)),
    "gerudoGuard": ("gerudoGuard.webp", (0.55, 0.19, 0.40)),
    "gerudoThief": ("gerudoThief.webp", (0.49, 0.17, 0.42)),
    "sheikahWarrior": ("sheikahWarrior.png", (0.57, 0.18, 0.32)),
    "dekuScrub": ("dekuScrub.png", (0.53, 0.38, 0.80)),
    "businessScrub": ("businessScrub.webp", (0.50, 0.51, 0.60)),
    "stalchild": ("stalchild.webp", (0.55, 0.18, 0.50)),
    "stalfos": ("stalfos.webp", (0.50, 0.26, 0.55)),
    "dinolfos": ("dinolfos.webp", (0.49, 0.43, 0.40)),
    "lizalfos": ("lizalfos.webp", (0.19, 0.12, 0.30)),
    "moblin": ("moblin.png", (0.21, 0.15, 0.35)),
    "ironKnuckle": ("ironKnuckle.webp", (0.44, 0.34, 0.42)),
    "queenGohma": ("queenGohma.png", (0.54, 0.31, 0.50)),
    # Batch 4 (bosses)
    "kingDodongo": ("kingDodongo.webp", (0.16, 0.30, 0.30)),
    "barinade": ("barinade.png", (0.50, 0.30, 0.45)),
    "volvagia": ("volvagia.webp", (0.14, 0.30, 0.22)),
    "morpha": ("morpha.png", (0.72, 0.78, 0.42)),
    "bongoBongo": ("bongoBongo.png", (0.49, 0.48, 0.50)),
    "malon": ("malon.png", (0.50, 0.14, 0.42)),
    "greatFairy": ("greatFairy.webp", (0.22, 0.44, 0.24)),
    "phantomGanon": ("phantomGanon.png", (0.63, 0.24, 0.30)),
}


def trim(im: Image.Image) -> Image.Image:
    alpha = im.getchannel("A").point(lambda a: 255 if a > 24 else 0)
    box = alpha.getbbox()
    return im.crop(box) if box else im


def main() -> None:
    ART.mkdir(parents=True, exist_ok=True)
    PORTRAITS.mkdir(parents=True, exist_ok=True)
    done = []
    for cid, (name, (fx, fy, fw)) in ENTRIES.items():
        path = SRC / name
        if not path.exists():
            print(f"skip {cid}: {name} missing")
            continue
        im = Image.open(path).convert("RGBA")
        w, h = im.size

        # Face crop (square), padded with transparency if it runs off the edge.
        side = int(fw * w)
        cx, cy = int(fx * w), int(fy * h)
        box = (cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side)
        face = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        face.paste(im.crop((max(0, box[0]), max(0, box[1]), min(w, box[2]), min(h, box[3]))),
                   (max(0, -box[0]), max(0, -box[1])))
        face.resize((256, 256), Image.LANCZOS).save(PORTRAITS / f"{cid}.png", optimize=True)

        # Full body, trimmed and scaled down.
        body = trim(im)
        scale = min(1.0, 640 / body.height)
        if scale < 1:
            body = body.resize((max(1, int(body.width * scale)), 640), Image.LANCZOS)
        body.save(ART / f"{cid}.png", optimize=True)
        done.append(cid)
        print(f"ok {cid}: portrait 256x256, art {body.width}x{body.height}")

    ids = sorted(set(done) | {p.stem for p in ART.glob("*.png")})
    MANIFEST.write_text(
        "// Generated by scripts/process_art.py: ids that have files in public/art and public/portraits.\n"
        f"export const ART_IDS: string[] = {ids!r};\n".replace("'", '"')
    )


if __name__ == "__main__":
    main()
