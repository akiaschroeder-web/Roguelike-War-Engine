import type { Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc tables: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

type T = Omit<UnitTemplate, 'glyph'> & { glyph?: string };
const glyphOf = (name: string) => {
  const w = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : name.slice(0, 2)).toUpperCase();
};
const u = (t: T): UnitTemplate => ({ glyph: glyphOf(t.name), ...t });

export const NAMED: UnitTemplate[] = [
  // ── Main characters ──
  u({ id: 'heroOfTheSky', name: 'Link (Hero of the Sky)', title: 'Knight of the Goddess', race: 'hylian', classId: 'knightOfTheGoddess', size: 1, home: 'skyloft', glyph: 'LS',
    stats: st(27, 10, 5, 12, 11, 7, 6, 10, 9, 5, 28, 10), weapons: ['practiceSword', 'fairySlingshot'], skill: 'chosenByTheGoddess', abilities: ['skywardCharge', 'dash'],
    bio: 'A sleepy Knight Academy student whose Loftwing is the only crimson one in Skyloft. The goddess has other plans for him.' }),
  u({ id: 'zeldaSS', name: 'Zelda (Skyward Sword)', title: 'Sacred Priestess', race: 'hylian', classId: 'sacredPriestess', size: 1, home: 'skyloft', glyph: 'ZS',
    stats: st(24, 3, 22, 12, 9, 5, 22, 14, 5, 5, 12, 45), weapons: ['priestessLight', 'healStaff'], skill: 'goddessReborn',
    abilities: ['goddessBlessing', 'sacredSeal', 'divineBarrier', 'prayerOfHylia', 'balladOfTheGoddess'],
    bio: 'The headmaster\'s daughter and Link\'s oldest friend, who turns out to be the mortal rebirth of the goddess Hylia.' }),
  u({ id: 'fi', name: 'Fi', title: 'Divine Guide', race: 'swordSpirit', classId: 'divineGuide', size: 1, home: 'skyloft', glyph: 'FI',
    stats: st(20, 4, 18, 17, 14, 4, 16, 8, 3, 7, 12, 36), weapons: ['fisSacredProjection'], skill: 'probabilityAnalysis', abilities: ['dowsing', 'divineDance', 'sacredBlade', 'swordCommunion'],
    bio: 'The spirit of the Goddess Sword, made by Hylia to guide her chosen hero. There is an 85% probability she will tell you so.' }),
  u({ id: 'groose', name: 'Groose', title: 'Siege Engineer', race: 'hylian', classId: 'siegeEngineer', size: 1, home: 'skyloft', glyph: 'GR',
    stats: st(32, 12, 0, 11, 7, 9, 4, 8, 13, 5, 26, 0), weapons: ['groosenator', 'fairySlingshot'], skill: 'groosenatorSkill', abilities: ['bombardment', 'constructEmplacement', 'heavyLift', 'unexpectedCourage'],
    bio: 'Skyloft\'s pompadoured bully, who falls to the surface, builds a catapult, and becomes a hero in his own right.' }),
  u({ id: 'impaSS', name: 'Impa (Guardian of Hylia)', title: 'Sacred Guardian', race: 'sheikah', classId: 'sacredGuardian', size: 1, home: 'sealedGrounds', glyph: 'IS',
    stats: st(28, 10, 13, 15, 15, 7, 13, 9, 8, 7, 24, 26), weapons: ['sheikahKunai', 'priestessLight'], skill: 'sacredDuty', abilities: ['sacredBarrierSS', 'sheikahStrike', 'shadowDash', 'protectiveSeal'],
    bio: 'A Sheikah warrior sent from the distant past to protect Zelda. She waits a very long time.' }),
  u({ id: 'ghirahim', name: 'Ghirahim', title: 'Demon Lord', race: 'demonSword', classId: 'demonLord', size: 1, home: 'faronWoodsSS', glyph: 'GH',
    stats: st(32, 14, 15, 17, 16, 7, 12, 6, 10, 7, 28, 30), weapons: ['ghirahimsBlade', 'ghirahimsDemonDarts'], skill: 'predictiveGuard',
    abilities: ['bladeCatch', 'demonDarts', 'teleportSlash', 'demonicRestoration', 'ghirahimTrueForm'], rare: true, exclusiveWith: ['ghirahimTrue'],
    bio: 'The self-proclaimed Demon Lord, all diamonds and snapping fingers. He is the Demon King\'s sword, and he wants his master back.' }),
  u({ id: 'ghirahimTrue', name: 'Ghirahim (True Form)', title: 'Living Demon Blade', race: 'demonSword', classId: 'livingDemonBlade', size: 1, home: 'skyKeep', glyph: 'GT',
    stats: st(44, 19, 17, 19, 15, 16, 14, 5, 14, 7, 36, 36), weapons: ['ghirahimsBlade'], skill: 'metallicBody',
    abilities: ['demonBlade', 'rapidTeleportation', 'diamondBarrage', 'executionersStrike', 'ghirahimSpiritForm'], rare: true, exclusiveWith: ['ghirahim'],
    bio: 'Ghirahim with the act dropped: a living black blade with a diamond in his chest.' }),
  u({ id: 'demise', name: 'Demise', title: 'Demon King', race: 'demonDeity', classId: 'demonKing', size: 2, home: 'demonsRealm', glyph: 'DE',
    stats: st(60, 25, 20, 15, 10, 17, 16, 4, 23, 5, 40, 40), weapons: ['demonKingsSword'], skill: 'eternalHatred', abilities: ['demonKingsSlash', 'lightningSword', 'darkSkywardStrike', 'demonicDominion'], rare: true,
    bio: 'The Demon King who once laid siege to the surface. Sealed for an age, he would rather die than be forgotten.' }),
  // ── Supporting characters ──
  u({ id: 'gaepora', name: 'Gaepora', title: 'Knight Commander', race: 'hylian', classId: 'knightCommander', size: 1, home: 'skyloft',
    stats: st(30, 10, 5, 16, 6, 9, 10, 12, 11, 4, 22, 12), weapons: ['skyKnightsSword', 'healStaff'], skill: 'headmaster', bio: 'The owlish headmaster of the Knight Academy and Zelda\'s father.' }),
  u({ id: 'fledge', name: 'Fledge', title: 'Knight Trainee', race: 'hylian', classId: 'knightTrainee', size: 1, home: 'skyloft',
    stats: st(18, 4, 0, 6, 7, 3, 3, 11, 5, 5, 14, 0), weapons: ['practiceSword', 'fairySlingshot'], skill: 'selfImprovement', abilities: ['dash'], bio: 'A skinny, nervous student who trains every night with a pumpkin for a dumbbell.' }),
  u({ id: 'pipit', name: 'Pipit', title: 'Sky Knight', race: 'hylian', classId: 'skyKnight', size: 1, home: 'skyloft',
    stats: st(25, 9, 2, 13, 12, 7, 5, 9, 8, 6, 24, 4), weapons: ['skyKnightsSword'], skill: 'modelKnight', abilities: ['dash'], bio: 'The Knight Academy\'s model student and Skyloft\'s most dependable guard.' }),
  u({ id: 'karane', name: 'Karane', title: 'Sky Knight', race: 'hylian', classId: 'skyKnight', size: 1, home: 'skyloft',
    stats: st(24, 8, 3, 12, 13, 6, 6, 10, 7, 6, 22, 6), weapons: ['skyKnightsSword', 'fairyBow'], skill: 'karanesDetermination', abilities: ['dash'], bio: 'A forthright knight-in-training who is very fond of Pipit, and lets everyone know it.' }),
  u({ id: 'batreaux', name: 'Batreaux', title: 'Benevolent Demon', race: 'demon', classId: 'benevolentDemon', size: 2, home: 'skyloft', glyph: 'BX',
    stats: st(38, 12, 18, 9, 8, 10, 16, 13, 16, 6, 24, 36), weapons: ['demonicKindness', 'healStaff'], skill: 'gratitude', bio: 'A demon who hides under Skyloft and dreams of being human. Gratitude Crystals might do it.' }),
  u({ id: 'gondo', name: 'Gondo', title: 'Scrap Smith', race: 'hylian', classId: 'scrapSmith', size: 1, home: 'skyloft',
    stats: st(26, 9, 0, 14, 7, 7, 4, 8, 10, 4, 20, 0), weapons: ['scrapWrench', 'fairySlingshot'], skill: 'masterUpgrader', bio: 'The bespectacled owner of Skyloft\'s Scrap Shop, who can upgrade anything with the right parts.' }),
  u({ id: 'scrapper', name: 'Scrapper', title: 'Transport Construct', race: 'ancientRobot', classId: 'transportConstruct', size: 1, home: 'lanayruDesert',
    stats: st(28, 10, 0, 10, 9, 12, 5, 4, 12, 7, 25, 0), weapons: ['scrapperBuzz'], skill: 'heavyCargo', abilities: ['aerialTransport'], bio: 'A grumpy ancient robot who calls Link "Master" with obvious contempt. Carries anything.' }),
  u({ id: 'skipper', name: 'Skipper', title: 'Naval Captain', race: 'ancientRobot', classId: 'navalCaptain', size: 1, home: 'lanayruSandSea',
    stats: st(25, 8, 2, 15, 8, 10, 7, 8, 8, 5, 20, 8), weapons: ['skippersCutlass', 'deckCannon'], skill: 'ancientNavigation', bio: 'The ancient robot captain of a stolen ship, still sailing the Sand Sea in search of it.' }),
  u({ id: 'bucha', name: 'Bucha', title: 'Forest Elder', race: 'kikwi', classId: 'forestElder', size: 2, home: 'faronWoodsSS',
    stats: st(35, 5, 9, 6, 3, 9, 10, 12, 16, 3, 16, 20), weapons: ['kikwiBelly', 'healStaff'], skill: 'naturalCamouflage', bio: 'The enormous Kikwi elder of Faron Woods, who once rescued Zelda.' }),
  u({ id: 'gorko', name: 'Gorko', title: 'Archaeologist', race: 'goron', classId: 'archaeologist', size: 2, home: 'lanayruDesert',
    stats: st(38, 13, 2, 10, 5, 14, 6, 10, 18, 4, 28, 4), weapons: ['goronSumoFists'], skill: 'ancientKnowledge', bio: 'A Goron explorer obsessed with the goddess\'s ancient mysteries, and very happy to explain them at length.' }),
  u({ id: 'moldini', name: 'Moldini', title: 'Treasure Excavator', race: 'mogma', classId: 'treasureExcavator', size: 1, home: 'eldinVolcano',
    stats: st(22, 6, 1, 13, 14, 4, 5, 14, 5, 7, 22, 2), weapons: ['mogmaClaws'], skill: 'buriedFortune', abilities: ['mogmaDig'], bio: 'A cool-headed Mogma treasure hunter who knows a good dig spot by smell.' }),
  u({ id: 'levias', name: 'Levias', title: 'Celestial Guardian', race: 'skySpirit', classId: 'celestialGuardian', size: 5, home: 'theSky', glyph: 'LV',
    stats: st(110, 20, 24, 12, 10, 22, 25, 15, 45, 8, 45, 55), weapons: ['leviasCelestialWind', 'whaleBreach'], skill: 'guardianOfTheSkies', rare: true,
    bio: 'The great sky whale, Skyloft\'s guardian since the goddess raised it. Once possessed by a Bilocyte, now grateful.' }),
  u({ id: 'faronDragon', name: 'Faron (Water Dragon)', title: 'Dragon Guardian', race: 'waterDragon', classId: 'dragonGuardian', size: 4, home: 'faronWoodsSS', glyph: 'FD',
    stats: st(80, 17, 23, 12, 10, 16, 22, 11, 32, 6, 32, 48), weapons: ['faronsWaterSphere', 'dragonClawsSS'], skill: 'floodbringer', rare: true,
    bio: 'The Water Dragon of Lake Floria, proud and impatient, who flooded Faron Woods to protect it.' }),
  u({ id: 'eldinDragon', name: 'Eldin (Fire Dragon)', title: 'Dragon Guardian', race: 'fireDragon', classId: 'dragonGuardian', size: 4, home: 'eldinVolcano', glyph: 'ED',
    stats: st(90, 23, 21, 10, 7, 20, 17, 10, 36, 5, 38, 42), weapons: ['eldinsMagmaBreath', 'dragonClawsSS'], skill: 'volcanicAuthority', rare: true,
    bio: 'The Fire Dragon of Eldin Volcano, who laughs like an avalanche and tests heroes by burning their feet.' }),
  u({ id: 'lanayruDragon', name: 'Lanayru (Thunder Dragon)', title: 'Dragon Guardian', race: 'thunderDragon', classId: 'dragonGuardian', size: 4, home: 'lanayruDesert', glyph: 'LD',
    stats: st(75, 14, 26, 14, 12, 15, 24, 12, 30, 7, 30, 55), weapons: ['lanayrusThunderOrb', 'dragonClawsSS'], skill: 'ancientThunder', rare: true,
    bio: 'The Thunder Dragon of the Lanayru Desert, dying of illness in the present and hale in the past.' }),
  u({ id: 'hylia', name: 'Hylia', title: 'Divine Sovereign', race: 'goddess', classId: 'divineSovereign', size: 1, home: 'skyKeep', glyph: 'HY',
    stats: st(40, 5, 32, 20, 14, 10, 30, 20, 7, 6, 20, 70), weapons: ['hyliasRadiance', 'healStaff'], skill: 'divineAuthority', abilities: ['goddessBlessing', 'prayerOfHylia', 'balladOfTheGoddess'], rare: true,
    bio: 'The goddess who sealed Demise and gave up her divinity to be reborn as a mortal girl.' }),
  // ── Beamos: a full recruitable entry (the existing enemy stays in the older packs' rosters) ──
  u({ id: 'beamos', name: 'Beamos', title: 'Ancient Turret', race: 'construct', classId: 'ancientTurret', size: 2, home: 'lanayruDesert', glyph: 'BM',
    stats: st(40, 5, 16, 15, 2, 17, 8, 2, 20, 0, 10, 30), weapons: ['beamosEye', 'beamosTrackingBeam'], skill: 'trackingBeam', generic: true, monster: true,
    bio: 'A one-eyed stone sentry that turns to follow you. Its beam gets more accurate every time it hits.' }),
  // ── Loftwings (they fight on their own; the matching mount gear lets someone ride one) ──
  u({ id: 'skyLoftwing', name: 'Loftwing', title: 'Aerial Mount', race: 'loftwingRace', classId: 'aerialMount', size: 2, home: 'skyloft', glyph: 'LW',
    stats: st(32, 9, 0, 11, 15, 5, 6, 8, 12, 9, 30, 0), weapons: ['loftwingBeak'], skill: 'skyRider', abilities: ['beakStrike', 'divingAttack', 'wingGust', 'aerialTransport'], generic: true, monster: true,
    bio: 'One of Skyloft\'s great birds. Every Skyloftian is chosen by one.' }),
  u({ id: 'crimsonLoftwing', name: 'Crimson Loftwing', title: 'Sacred Aerial Mount', race: 'loftwingRace', classId: 'sacredAerialMount', size: 2, home: 'skyloft', glyph: 'CL',
    stats: st(40, 12, 3, 14, 18, 7, 9, 12, 14, 10, 36, 6), weapons: ['loftwingBeak'], skill: 'chosenCompanion', abilities: ['beakStrike', 'divingAttack', 'wingGust', 'aerialTransport'], rare: true,
    bio: 'The last of the crimson Loftwings, a breed thought extinct. It chose Link.' }),
];

export const TEMPLATES: UnitTemplate[] = [...NAMED];
