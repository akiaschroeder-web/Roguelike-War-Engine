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
    # Mounts (full art is drawn under the rider in battle animations)
    "epona": ("epona.webp", (0.13, 0.20, 0.30)),
    "lordOfTheMountain": ("lordOfTheMountain.png", (0.28, 0.25, 0.40)),
    "ganondorfStallion": ("ganondorfStallion.webp", (0.15, 0.17, 0.35)),
    "giantHorse": ("giantHorse.png", (0.15, 0.22, 0.40)),
    "horseWhite": ("horseWhite.png", (0.18, 0.15, 0.45)),
    "horseBlack": ("horseBlack.webp", (0.13, 0.20, 0.30)),
    "horseGolden": ("horseGolden.png", (0.18, 0.13, 0.45)),
    "horsePinto": ("horsePinto.png", (0.22, 0.17, 0.50)),
    "stalhorse": ("stalhorse.webp", (0.80, 0.17, 0.45)),
    "loftwing": ("loftwing.webp", (0.20, 0.62, 0.40)),
    "sandSeal": ("sandSeal.png", (0.18, 0.50, 0.40)),
    "wolfMount": ("wolfMount.webp", (0.78, 0.25, 0.40)),
    "bullbo": ("bullbo.webp", (0.70, 0.35, 0.50)),
    "greatFairy": ("greatFairy.webp", (0.22, 0.44, 0.24)),
    "phantomGanon": ("phantomGanon.png", (0.63, 0.24, 0.30)),
    # Creatures batch 1
    "keese": ("keese.png", (0.44, 0.56, 0.60)),
    "guay": ("guay.png", (0.42, 0.55, 0.75)),
    "peahat": ("peahat.webp", (0.49, 0.50, 0.70)),
    "leever": ("leever.webp", (0.50, 0.37, 0.60)),
    "poe": ("poe.webp", (0.43, 0.26, 0.60)),
    "dekuBaba": ("dekuBaba.webp", (0.28, 0.40, 0.62)),
    "skulltula": ("skulltula.webp", (0.50, 0.45, 0.60)),
    "wolfos": ("wolfos.webp", (0.79, 0.43, 0.42)),
    "tektite": ("tektite.png", (0.46, 0.42, 0.50)),
    "stinger": ("stinger.webp", (0.50, 0.50, 0.95)),
    "babyDodongo": ("babyDodongo.webp", (0.24, 0.24, 0.45)),
    "dodongo": ("dodongo.webp", (0.45, 0.38, 0.30)),
    "octorok": ("octorok.png", (0.57, 0.40, 0.62)),
    "shellBlade": ("shellBlade.webp", (0.51, 0.50, 0.80)),
    "likeLike": ("likeLike.png", (0.50, 0.50, 0.90)),
    "beamos": ("beamos.webp", (0.48, 0.16, 0.70)),
    "anubis": ("anubis.webp", (0.50, 0.16, 0.60)),
    "redead": ("redead.webp", (0.47, 0.14, 0.30)),
    "wallmaster": ("wallmaster.webp", (0.50, 0.45, 0.85)),
    "fireKeese": ("fireKeese.png", (0.50, 0.48, 0.55)),
    "iceKeese": ("iceKeese.png", (0.55, 0.62, 0.50)),
    "gibdo": ("gibdo.webp", (0.48, 0.08, 0.70)),
    "clubMoblin": ("clubMoblin.webp", (0.48, 0.22, 0.45)),
    # Majora's Mask
    "terminaLink": ("terminaLink.png", (0.47, 0.36, 0.26)),
    "dekuLink": ("dekuLink.png", (0.36, 0.40, 0.45)),
    "goronLink": ("goronLink.png", (0.40, 0.25, 0.45)),
    "zoraLink": ("zoraLink.png", (0.31, 0.13, 0.30)),
    "fierceDeityLink": ("fierceDeityLink.png", (0.36, 0.27, 0.20)),
    "giantLink": ("giantLink.png", (0.47, 0.15, 0.55)),
    "skullKid": ("skullKid.png", (0.53, 0.33, 0.42)),
    "tatl": ("tatl.png", (0.52, 0.50, 0.85)),
    "tael": ("tael.png", (0.56, 0.56, 0.90)),
    "kafei": ("kafei.png", (0.47, 0.13, 0.42)),
    "anju": ("anju.png", (0.50, 0.09, 0.48)),
    "dekuPrincess": ("dekuPrincess.png", (0.53, 0.50, 0.50)),
    "dekuKing": ("dekuKing.png", (0.42, 0.62, 0.45)),
    "darmani": ("darmani.png", (0.45, 0.18, 0.55)),
    "mikau": ("mikau.png", (0.46, 0.12, 0.40)),
    "lulu": ("lulu.png", (0.47, 0.13, 0.35)),
    "captainKeeta": ("captainKeeta.png", (0.55, 0.13, 0.55)),
    "igosDuIkana": ("igos.png", (0.46, 0.165, 0.30)),
    "ikanaServant1": ("ikanaServant1.png", (0.50, 0.19, 0.45)),
    "ikanaServant2": ("ikanaServant2.png", (0.40, 0.20, 0.45)),
    "sharp": ("sharp.png", (0.42, 0.48, 0.36)),
    "flat": ("flat.png", (0.26, 0.30, 0.45)),
    "garoMaster": ("garoMaster.png", (0.50, 0.25, 0.40)),
    "tingle": ("tingle.png", (0.45, 0.17, 0.60)),
    "odolwa": ("odolwa.png", (0.43, 0.10, 0.40)),
    "goht": ("goht.png", (0.27, 0.15, 0.20)),
    "gyorg": ("gyorg.png", (0.25, 0.45, 0.40)),
    "redTwinmold": ("redTwinmold.png", (0.22, 0.33, 0.25)),
    "blueTwinmold": ("blueTwinmold.png", (0.25, 0.30, 0.45)),
    "majorasMask": ("majorasMask.png", (0.50, 0.45, 0.90)),
    "majorasIncarnation": ("majorasIncarnation.png", (0.50, 0.36, 0.35)),
    "majorasWrath": ("majorasWrath.png", (0.48, 0.13, 0.50)),
    "giant": ("giant.png", (0.48, 0.13, 0.50)),
    "wart": ("wart.png", (0.50, 0.50, 0.90)),
    "gomess": ("gomess.png", (0.50, 0.40, 0.35)),
    "gekko": ("gekko.png", (0.55, 0.30, 0.60)),
    "snapper": ("snapper.png", (0.15, 0.60, 0.50)),
    "deathArmos": ("deathArmos.png", (0.50, 0.30, 0.60)),
    "eyegore": ("eyegore.png", (0.50, 0.22, 0.60)),
    "hiploop": ("hiploop.png", (0.50, 0.55, 0.60)),
    "deepPython": ("deepPython.png", (0.20, 0.40, 0.50)),
    "bioDekuBaba": ("bioDekuBaba.png", (0.48, 0.40, 0.60)),
    "giantTurtle": ("giantTurtle.png", (0.85, 0.62, 0.35)),
    "madScrub": ("madScrub.png", (0.45, 0.50, 0.80)),
    "jabuJabu": ("jabuJabu.png", (0.35, 0.50, 0.70)),
    # The Wind Waker (prepared by scripts/prep_ww_art.py)
    "heroOfWinds": ("heroOfWinds.png", (0.30, 0.30, 0.30)),
    "tetra": ("tetra.png", (0.38, 0.17, 0.50)),
    "zeldaWW": ("zeldaWW.png", (0.42, 0.14, 0.55)),
    "ganondorfWW": ("ganondorfWW.png", (0.38, 0.10, 0.35)),
    "kingDaphnes": ("kingDaphnes.png", (0.50, 0.18, 0.55)),
    "kingOfRedLions": ("kingOfRedLions.png", (0.86, 0.24, 0.40)),
    "aryll": ("aryll.png", (0.42, 0.22, 0.75)),
    "grandma": ("grandma.png", (0.42, 0.21, 0.80)),
    "orca": ("orca.png", (0.62, 0.10, 0.32)),
    "sturgeon": ("sturgeon.png", (0.45, 0.50, 0.95)),
    "medli": ("medli.png", (0.50, 0.18, 0.55)),
    "makar": ("makar.png", (0.58, 0.45, 0.80)),
    "komali": ("komali.png", (0.50, 0.18, 0.55)),
    "quill": ("quill.png", (0.50, 0.18, 0.55)),
    "ritoChieftain": ("ritoChieftain.png", (0.50, 0.18, 0.55)),
    "laruto": ("laruto.png", (0.35, 0.28, 0.45)),
    "fado": ("fado.png", (0.50, 0.30, 0.45)),
    "niko": ("niko.png", (0.50, 0.18, 0.55)),
    "gonzo": ("gonzo.png", (0.50, 0.18, 0.55)),
    "salvatore": ("salvatore.png", (0.50, 0.18, 0.55)),
    "beedle": ("beedle.png", (0.50, 0.18, 0.55)),
    "mila": ("mila.png", (0.50, 0.18, 0.55)),
    "lenzo": ("lenzo.png", (0.50, 0.45, 0.75)),
    "valoo": ("valoo.png", (0.20, 0.27, 0.40)),
    "jabun": ("jabun.png", (0.50, 0.45, 0.75)),
    "zephos": ("zephos.png", (0.65, 0.30, 0.55)),
    "cyclos": ("cyclos.png", (0.48, 0.20, 0.60)),
    "fishman": ("fishman.png", (0.75, 0.40, 0.50)),
    "korokGeneric": ("korokGeneric.png", (0.38, 0.18, 0.90)),
    "ritoGeneric": ("ritoGeneric.png", (0.50, 0.18, 0.55)),
    "senza": ("senza.png", (0.50, 0.18, 0.55)),
    "mako": ("mako.png", (0.50, 0.18, 0.55)),
    "zuko": ("zuko.png", (0.50, 0.22, 0.75)),
    "nudge": ("nudge.png", (0.50, 0.18, 0.55)),
    "bokoblin": ("bokoblin.png", (0.50, 0.45, 0.75)),
    "miniblin": ("miniblin.png", (0.50, 0.45, 0.75)),
    "bokoBaba": ("bokoBaba.png", (0.50, 0.45, 0.75)),
    "kargaroc": ("kargaroc.png", (0.45, 0.30, 0.40)),
    "mothula": ("mothula.png", (0.50, 0.50, 1.05)),
    "wingedMothula": ("wingedMothula.png", (0.50, 0.50, 1.05)),
    "morth": ("morth.png", (0.50, 0.50, 1.05)),
    "magtail": ("magtail.png", (0.55, 0.35, 0.75)),
    "seahat": ("seahat.png", (0.50, 0.50, 1.05)),
    "greatSeaGyorg": ("greatSeaGyorg.png", (0.30, 0.30, 0.60)),
    "bigOcto": ("bigOcto.png", (0.50, 0.50, 1.15)),
    "darknut": ("darknut.png", (0.50, 0.50, 1.00)),
    "mightyDarknut": ("mightyDarknut.png", (0.50, 0.50, 1.00)),
    "armosKnight": ("armosKnight.png", (0.55, 0.32, 0.80)),
    "floorMasterWW": ("floorMasterWW.png", (0.50, 0.50, 1.05)),
    "bombchuMonster": ("bombchuMonster.png", (0.50, 0.70, 1.00)),
    "bombchuMonsterMM": ("bombchuMonsterMM.png", (0.50, 0.50, 1.05)),
    "chuchuRed": ("chuchuRed.png", (0.50, 0.50, 1.75)),
    "chuchuGreen": ("chuchuGreen.png", (0.50, 0.50, 1.60)),
    "chuchuBlue": ("chuchuBlue.png", (0.50, 0.50, 1.35)),
    "chuchuYellow": ("chuchuYellow.png", (0.50, 0.50, 1.15)),
    "chuchuRedMM": ("chuchuRedMM.png", (0.50, 0.50, 1.20)),
    "chuchuGreenMM": ("chuchuGreenMM.png", (0.50, 0.50, 1.20)),
    "arrowChuchu": ("arrowChuchu.png", (0.50, 0.50, 1.15)),
    "gohmaWW": ("gohmaWW.png", (0.50, 0.50, 1.00)),
    "kalleDemos": ("kalleDemos.png", (0.50, 0.50, 1.00)),
    "gohdan": ("gohdan.png", (0.50, 0.35, 0.35)),
    "gohdansHand": ("gohdansHand.png", (0.50, 0.50, 1.10)),
    "helmarocKing": ("helmarocKing.png", (0.50, 0.42, 0.90)),
    "jalhalla": ("jalhalla.png", (0.50, 0.50, 1.00)),
    "molgera": ("molgera.png", (0.50, 0.50, 1.00)),
    "molgeraLarva": ("molgeraLarva.png", (0.88, 0.83, 0.40)),
    "puppetGanonBeast": ("puppetGanonBeast.png", (0.68, 0.25, 0.40)),
    "puppetGanonSpider": ("puppetGanonSpider.png", (0.50, 0.50, 1.00)),
    "puppetGanonSnake": ("puppetGanonSnake.png", (0.50, 0.50, 1.00)),
    "phantomGanonWW": ("phantomGanonWW.png", (0.50, 0.50, 1.00)),
    "raft": ("raft.png", (0.50, 0.50, 1.05)),
    "beedlesShopShip": ("beedlesShopShip.png", (0.50, 0.50, 1.00)),
    "gunboat": ("gunboat.png", (0.50, 0.50, 1.05)),
    "pirateShip": ("pirateShip.png", (0.50, 0.50, 1.36)),
    "ghostShip": ("ghostShip.png", (0.50, 0.50, 1.40)),
    "submarine": ("submarine.png", (0.50, 0.50, 1.05)),
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
