# Era of the Wild art ids

Game art id → source file → use. Prepared by `scripts/prep_wild_art.py` into `art-src/<id>.png`
(trimmed RGBA), then `scripts/process_art.py` (section "# Era of the Wild") makes
`public/art/<id>.png` and `public/portraits/<id>.png`.

Cleaning: the `_patternbg` files (and several others: Gleeoks, Colgera, Dinraal, Farosh, Hinox, Frox,
Stal*, Yiga Blademaster, Master Cycle Zero, ...) sit on a navy (23,69,110) logo pattern that is
near-transparent (alpha 1–24); navy pixels at alpha ≤ 64 and anything at alpha ≤ 1 are cleared.
`wildLink.jpg` is cut out of its white background by a flood fill from the border.
`waterblight_whiteblocks.png`: the white/black blocks were already fully transparent.

| Game art id | Source file | Use |
|---|---|---|
| `aerocuda` | `aerocuda.webp` | Aerocuda unit |
| `battleTalus` | `battleTalus.png` | Battle Talus unit |
| `bludo` | `bludo.webp` | Bludo unit |
| `blupee` | `blupee.png` | Blupee unit |
| `bokoblinBotW` | `bokoblinBotW.webp` | alt art (BotW) for the existing Bokoblin (bokoblin) |
| `bossBokoblin` | `bossBokoblin_patternbg.png` | Boss Bokoblin unit |
| `bubbulfrog` | `bubbulfrog.png` | Bubbulfrog unit (upside-down multi-faced frog spirit) |
| `buliara` | `buliara.png` | Buliara unit |
| `calamityGanon` | `calamityGanon.webp` | Calamity Ganon unit |
| `captainConstructBlade` | `captainConstructBlade.png` | Captain Construct I–III (blade crest) |
| `captainConstructGold` | `captainConstructGold.png` | Captain Construct IV (golden sun crest) |
| `colgera` | `colgera.png` | Colgera (boss) unit |
| `darkBeastGanonWild` | `darkBeastGanonWild.webp` | Dark Beast Ganon (BotW) unit |
| `daruk` | `daruk.png` | Daruk (Champion) unit |
| `decayedGuardian` | `decayedGuardian.png` | Decayed Guardian unit |
| `demonDragon` | `demonDragon.png` | Demon Dragon unit |
| `dinraal` | `dinraal.png` | Dinraal unit |
| `dorephan` | `dorephan_patternbg.png` | King Dorephan unit |
| `evermean` | `evermean.png` | Evermean unit |
| `farosh` | `farosh.png` | Farosh unit |
| `fireblight` | `fireblight.webp` | Fireblight Ganon (boss) unit |
| `fluxConstruct1` | `fluxConstruct1.png` | Flux Construct I (plain teal) |
| `fluxConstruct2` | `fluxConstruct2.png` | Flux Construct II (teal with gold trim) |
| `fluxConstruct3` | `fluxConstruct3.png` | Flux Construct III (gold) |
| `forgeConstruct` | `forgeConstruct.png` | Forge Construct unit |
| `frostPebblit` | `frostPebblit.png` | Frost Pebblit unit |
| `frostTalus` | `frostTalus.png` | Frost Talus unit |
| `frox` | `frox.png` | Frox unit |
| `ganondorfWild` | `ganondorfWild.png` | Ganondorf (Demon King, TotK) unit |
| `ganondorfWildDemonKing` | `ganondorfWildDemonKing.png` | alt art for Ganondorf (ganondorfWild): fiery Demon King phase |
| `giantWhiteStallion` | `giantWhiteStallion.png` | Giant White Stallion (mount) unit |
| `gibdoTOTK` | `gibdoTOTK.png` | alt art (TotK) for the existing Gibdo (gibdo) |
| `gleeokFlame` | `gleeokFlame.png` | Flame Gleeok unit |
| `gleeokFrost` | `gleeokFrost.png` | Frost Gleeok unit |
| `gleeokThunder` | `gleeokThunder_patternbg.png` | Thunder Gleeok unit |
| `gloomSpawn` | `gloomSpawn.png` | Gloom Spawn unit |
| `goronWarriorBotW` | `goronWarriorBotW.webp` | alt art (BotW) for the generic Goron units (base art goronWarrior) |
| `goronWarriorTP` | `goronWarriorTP.png` | alt art (TP) for the generic Goron units (base art goronWarrior) |
| `goronWarriorWW` | `goronWarriorWW.webp` | alt art (WW, backpack merchant Goron) for the generic Goron units (base art goronWarrior) |
| `granteson` | `granteson_patternbg.png` | Granteson (Grantéson) unit |
| `guardianScout1` | `guardianScout1.png` | Guardian Scout I unit (no weapons) |
| `guardianScout2` | `guardianScout2.png` | Guardian Scout II unit |
| `guardianScout3` | `guardianScout3.png` | Guardian Scout III unit (two blades) |
| `guardianScout4` | `guardianScout4.png` | Guardian Scout IV unit (three weapons) |
| `guardianSkywatcher` | `guardianSkywatcher.png` | Guardian Skywatcher unit |
| `guardianStalker` | `guardianStalker.png` | Guardian Stalker unit |
| `guardianTurret` | `guardianTurret.png` | Guardian Turret unit |
| `heroOfTheWild` | `wildLink.jpg` | Wild Link (Hero of the Wild) unit; white JPEG background removed |
| `hestu` | `hestu.webp` | Hestu unit |
| `hino` | `hino_patternbg.png` | Hino unit |
| `hinox` | `hinox.png` | Hinox unit |
| `horriblin` | `horriblin.png` | Horriblin unit |
| `hudson` | `hudson_patternbg.png` | Hudson unit |
| `igneoPebblit` | `igneoPebblit.png` | Igneo Pebblit unit |
| `igneoTalus` | `igneoTalus.png` | Igneo Talus unit |
| `impaWild` | `impaWild.png` | Impa (elderly, BotW/TotK) unit |
| `kass` | `kass.webp` | Kass unit |
| `kilton` | `kilton_patternbg.png` | Kilton unit |
| `kingGleeok` | `kingGleeok_patternbg.png` | King Gleeok unit |
| `kingRhoam` | `kingRhoam.webp` | King Rhoam unit |
| `kohga` | `kohga.png` | Master Kohga unit |
| `koltin` | `koltin.png` | Koltin unit |
| `lightDragon` | `lightDragon_patternbg.png` | Light Dragon unit |
| `likeLikeBotW` | `likeLikeBotW.webp` | alt art (BotW) for the existing Like Like (likeLike) |
| `littleFrox` | `littleFrox.png` | Little Frox unit |
| `lizalfosBotW` | `lizalfosBotW.png` | alt art (BotW) for the existing Lizalfos (lizalfos) |
| `lynel` | `lynel.webp` | Lynel unit (white mane) |
| `malanya` | `malanya.png` | Malanya unit (small figure, red beaked mask, ribbons) |
| `marbledGohma` | `marbledGohma.png` | Marbled Gohma (boss) unit |
| `masterCycleZero` | `masterCycleZero.png` | Master Cycle Zero (mount) unit |
| `mazKoshia` | `mazKoshia.webp` | Monk Maz Koshia (boss) unit |
| `mineruConstruct` | `mineruConstruct.png` | Mineru's Construct unit (Mineru stands in front of it; portrait is the Construct's head) |
| `mipha` | `mipha.webp` | Mipha (Champion) unit |
| `moblinBotW` | `moblinBotW.png` | alt art (BotW) for the existing Moblin (moblin) |
| `molduga` | `molduga.webp` | Molduga unit |
| `molduking` | `molduking.webp` | Molduking unit |
| `moragia` | `moragia.png` | Moragia (boss) unit |
| `mothGibdo` | `mothGibdo.png` | Moth Gibdo unit |
| `mountainBear` | `mountainBear.png` | Mountain Bear (mount) unit |
| `mountainDeer` | `mountainDeer.png` | Mountain Deer (mount) unit |
| `mucktorok` | `mucktorok_patternbg.png` | Mucktorok (boss) unit |
| `muzu` | `muzu_patternbg.png` | Muzu unit |
| `naydra` | `naydra_patternbg.png` | Naydra unit |
| `patricia` | `patricia.png` | Patricia (mount) unit |
| `paya` | `paya.webp` | Paya unit |
| `penn` | `penn.png` | Penn unit |
| `phantomGanondorf` | `phantomGanondorf.webp` | Phantom Ganondorf (boss) unit |
| `purah` | `purah.webp` | Purah unit (adult and child forms together; portrait on the adult) |
| `queenGibdo` | `queenGibdo_patternbg.png` | Queen Gibdo (boss) unit |
| `rauruZonai` | `rauruZonai.webp` | Rauru (Zonai king) unit |
| `revali` | `revali.webp` | Revali (Champion) unit |
| `riju` | `riju.png` | Riju (Sage of Lightning) unit |
| `ritoWarriorBotW` | `ritoWarriorBotW_patternbg.png` | alt art (BotW) for the generic Rito units (base art ritoGeneric) |
| `robbie` | `robbie.png` | Robbie unit |
| `royalWhiteStallion` | `royalWhiteStallion.png` | Royal White Stallion (mount) unit |
| `satori` | `satori.png` | Lord of the Mountain (Satori) unit |
| `seizedConstruct` | `seizedConstruct.png` | Seized Construct (boss) unit |
| `sidon` | `sidon.webp` | Sidon (Sage of Water) unit |
| `soldierConstructAxe` | `soldierConstructAxe.png` | Soldier Construct look B (axe) — split across Soldier Construct I–IV |
| `soldierConstructSpear` | `soldierConstructSpear.png` | Soldier Construct look A (spear) — split across Soldier Construct I–IV |
| `sonia` | `sonia.webp` | Sonia unit |
| `sooga` | `sooga.webp` | Sooga (Yiga lieutenant, optional) unit |
| `stalizalfos` | `stalizalfos.png` | Stalizalfos unit |
| `stalkoblin` | `stalkoblin.png` | Stalkoblin unit |
| `stalmoblin` | `stalmoblin.png` | Stalmoblin unit |
| `stalnox` | `stalnox.png` | Stalnox unit |
| `stewardConstruct` | `stewardConstruct.png` | Steward Construct unit |
| `stonePebblit` | `stonePebblit.png` | Stone Pebblit unit |
| `stoneTalus` | `stoneTalus.png` | Stone Talus unit |
| `tauro` | `tauro.png` | Tauro unit |
| `teba` | `teba.webp` | Teba unit |
| `thunderblight` | `thunderblight.webp` | Thunderblight Ganon (boss) unit |
| `tulin` | `tulin.png` | Tulin (Sage of Wind) unit |
| `urbosa` | `urbosa.webp` | Urbosa (Champion) unit |
| `vahMedoh` | `vahMedoh.webp` | Divine Beast Vah Medoh |
| `vahNaboris` | `vahNaboris.webp` | Divine Beast Vah Naboris |
| `vahRudania` | `vahRudania.webp` | Divine Beast Vah Rudania |
| `vahRuta` | `vahRuta.webp` | Divine Beast Vah Ruta |
| `waterblight` | `waterblight_whiteblocks.png` | Waterblight Ganon (boss) unit |
| `windblight` | `windblight.webp` | Windblight Ganon (boss) unit |
| `yigaBlademaster` | `yigaBlademaster.png` | Yiga Blademaster AND Yiga Engineer (same image for both) |
| `yigaFootsoldier` | `yigaFootsoldier.webp` | Yiga Footsoldier unit |
| `yona` | `yona.webp` | Yona unit |
| `yunobo` | `yunobo.png` | Yunobo (Sage of Fire) unit |
| `zeldaWild` | `wildZelda.webp` | Wild Zelda unit |
| `zoraWarriorBotW` | `zoraWarriorBotW_patternbg.png` | alt art (BotW) for the generic Zora units (base art zoraWarrior) |
| `zoraWarriorTP` | `zoraWarriorTP.webp` | alt art (TP) for the generic Zora units (base art zoraWarrior) |
