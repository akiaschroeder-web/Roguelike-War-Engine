import type { RaceDef, Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

const u = (t: UnitTemplate): UnitTemplate => t;

// The pack uses the existing races (Hylian, Shadow, Demon, Monster, ChuChu, Volcanic Creature, Construct).
export const RACES: RaceDef[] = [];

/** The four Links (section 1): their template ids, in the doc's order. */
export const FOUR_LINKS = ['greenLink', 'redLink', 'blueLink', 'purpleLink'];
export const MAIDENS = ['greenMaiden', 'redMaiden', 'blueMaiden', 'purpleMaiden', 'yellowMaiden', 'whiteMaiden'];
/** Generic Hyrule soldiers (Military Command, Royal Authority). */
export const HYRULE_SOLDIERS = ['hyruleSoldier', 'hyruleKnight', 'hyruleArcher', 'hyruleSpearman', 'hyruleBombardier', 'hyruleCaptain'];

const LINK_KIT = ['formationBox', 'formationLine', 'formationColumn', 'formationCross', 'formationMarch', 'combinedSpin', 'heroStack', 'cooperativeThrow', 'fourfoldStrike', 'fourfoldBarrier', 'sacredSealFS'];

// Sections 1–3 (doc stats). Shadow Link and Ganon also have boss entries (enemies.ts) with the same ids.
export const TEMPLATES: UnitTemplate[] = [
  // ── The four Links ──
  u({ id: 'greenLink', name: 'Green Link', title: 'Four Sword Leader', race: 'hylian', classId: 'fourSwordLeader', size: 1, home: 'seaOfTrees', glyph: 'LG',
    stats: st(30, 15, 7, 16, 15, 12, 10, 15, 9, 6, 35, 25), weapons: ['fightersSword', 'boomerang'], skill: 'unitedCourage', abilities: ['coordinatedStrikeFS', 'herosRally', 'swordBeamFS', ...LINK_KIT],
    bio: 'The Link who drew the Four Sword, in the green tunic the others copied. He thinks for four people, which is the trouble with being the leader of yourself.' }),
  u({ id: 'redLink', name: 'Red Link', title: 'Four Sword Warrior', race: 'hylian', classId: 'fourSwordWarrior', size: 1, home: 'seaOfTrees', glyph: 'LR',
    stats: st(38, 21, 3, 13, 10, 17, 7, 10, 13, 5, 45, 10), weapons: ['fightersSword', 'magicHammer'], skill: 'burningCourage', abilities: ['powerSlash', 'guardBreaker', 'recklessCharge', ...LINK_KIT],
    bio: 'The loudest of the four: cheerful, hungry and first through every door. He hits hardest when he is losing, and he is never quite losing.' }),
  u({ id: 'blueLink', name: 'Blue Link', title: 'Four Sword Scout', race: 'hylian', classId: 'fourSwordScout', size: 1, home: 'seaOfTrees', glyph: 'LB',
    stats: st(26, 13, 5, 19, 23, 8, 9, 15, 7, 8, 40, 15), weapons: ['fightersSword', 'fairyBow'], skill: 'swiftCourage', abilities: ['quickSlash', 'rollingAssault', 'evasiveStep', ...LINK_KIT],
    bio: 'The quick-tempered one, who never waits for the plan and is usually already round the back of the enemy when Green finishes explaining it.' }),
  u({ id: 'purpleLink', name: 'Purple Link', title: 'Four Sword Mystic', race: 'hylian', classId: 'fourSwordMystic', size: 1, home: 'seaOfTrees', glyph: 'LP',
    stats: st(26, 10, 21, 16, 14, 8, 19, 17, 7, 6, 25, 50), weapons: ['fightersSword', 'fireRod'], skill: 'mysticCourage', abilities: ['mysticSlash', 'chargedBeam', 'herosBlessing', ...LINK_KIT],
    bio: 'The thoughtful Link, who reads the old tablets, counts the Force Gems and is the only one of the four who ever brings a map.' }),
  // ── Section 2 ──
  u({ id: 'zeldaFS', name: 'Princess Zelda', title: 'Sacred Princess', race: 'hylian', classId: 'sacredPrincess', size: 1, home: 'whereaboutsOfTheWind', glyph: 'ZF',
    stats: st(28, 4, 29, 17, 13, 7, 27, 20, 6, 5, 20, 70), weapons: ['lightBolt', 'healStaff'], skill: 'sealOfLight', abilities: ['sacredLightFS'],
    bio: 'The princess who keeps the Four Sword Sanctuary with the six Shrine Maidens. Vaati carried her off once; she has been preparing for the second time ever since.' }),
  u({ id: 'shadowLink', name: 'Shadow Link', title: 'Shadow Swordsman', race: 'shadow', classId: 'shadowSwordsmanFS', size: 1, home: 'darkWorldFSA', glyph: 'SL', rare: true,
    stats: st(32, 19, 19, 21, 22, 10, 15, 5, 9, 7, 40, 45), weapons: ['shadowSword'], skill: 'shadowReflectionSkill', abilities: ['shadowReflection', 'giantBombThrow'],
    bio: 'Born from the Dark Mirror and Ganon\'s malice: a Link with red eyes and a black tunic, who steals Force Gems, throws giant bombs and laughs while doing it. Not Dark Link — he has his own grudges.' }),
  u({ id: 'ganonFSA', name: 'Ganon', title: 'Trident Demon', race: 'demon', classId: 'tridentDemon', size: 3, home: 'realmOfTheHeavens', glyph: 'GF', rare: true,
    stats: st(110, 35, 32, 22, 12, 28, 30, 6, 38, 6, 55, 85), weapons: ['tridentOfPower'], skill: 'kingOfDarkness', abilities: ['banishToDarkWorld', 'tridentSpin'],
    bio: 'Ganondorf of the Gerudo, reborn as the blue boar-demon by the Trident of Power he stole from the Pyramid. He freed Vaati to blot out the sky, and waited.' }),
  // ── The six Shrine Maidens ──
  u({ id: 'greenMaiden', name: 'Green Maiden', title: 'Shrine Maiden of the Forest', race: 'hylian', classId: 'shrineMaiden', size: 1, home: 'whereaboutsOfTheWind', glyph: 'MG',
    stats: st(24, 3, 20, 13, 10, 5, 20, 15, 5, 5, 15, 50), weapons: ['healStaff', 'maidenLight'], skill: 'forestBlessing', abilities: ['forestPrayer'],
    bio: 'The Maiden of the Lost Woods shrine, who smells of moss and can tell from the colour of a leaf whether it is poisoned.' }),
  u({ id: 'redMaiden', name: 'Red Maiden', title: 'Shrine Maiden of Flame', race: 'hylian', classId: 'shrineMaiden', size: 1, home: 'deathMountainFSA', glyph: 'MR',
    stats: st(24, 4, 24, 14, 11, 5, 17, 12, 5, 5, 15, 50), weapons: ['healStaff', 'maidenLight'], skill: 'flameBlessing', abilities: ['flamePrayer'],
    bio: 'The Maiden of the Tower of Flames, sealed in a crystal on Death Mountain. She came out of it warm, and stayed warm.' }),
  u({ id: 'blueMaiden', name: 'Blue Maiden', title: 'Shrine Maiden of Water', race: 'hylian', classId: 'shrineMaiden', size: 1, home: 'easternHyrule', glyph: 'MB',
    stats: st(25, 2, 22, 14, 10, 6, 23, 15, 5, 5, 15, 60), weapons: ['healStaff', 'maidenLight'], skill: 'waterBlessing', abilities: ['waterPrayer'],
    bio: 'The Maiden of the village on the eastern coast, which renamed itself after her. She is still embarrassed about it.' }),
  u({ id: 'purpleMaiden', name: 'Purple Maiden', title: 'Shrine Maiden of Shadow', race: 'hylian', classId: 'shrineMaiden', size: 1, home: 'darkWorldFSA', glyph: 'MP',
    stats: st(22, 3, 25, 17, 15, 4, 22, 10, 5, 6, 18, 55), weapons: ['healStaff', 'maidenLight'], skill: 'shadowBlessing', abilities: ['shadowVeil'],
    bio: 'The Maiden held in the Temple of Darkness. She learned to hide in the dark there, and to see in it.' }),
  u({ id: 'yellowMaiden', name: 'Yellow Maiden', title: 'Shrine Maiden of Light', race: 'hylian', classId: 'shrineMaiden', size: 1, home: 'desertOfDoubt', glyph: 'MY',
    stats: st(24, 3, 26, 15, 12, 5, 24, 17, 5, 5, 15, 60), weapons: ['healStaff', 'maidenLight'], skill: 'radiantBlessing', abilities: ['radiantPrayer'],
    bio: 'The Maiden of the Desert Temple, bright as noon, who lifts curses the way other people lift a cup.' }),
  u({ id: 'whiteMaiden', name: 'White Maiden', title: 'Shrine Maiden of Protection', race: 'hylian', classId: 'shrineMaiden', size: 1, home: 'frozenHyrule', glyph: 'MW',
    stats: st(28, 3, 21, 14, 8, 10, 26, 14, 5, 4, 18, 60), weapons: ['healStaff', 'maidenLight'], skill: 'protectiveBlessing', abilities: ['protectivePrayer'],
    bio: 'The pale-blue Maiden of the Ice Temple, the eldest of the six, who builds barriers out of nothing and expects you to stand behind them.' }),
  // ── Section 3: generic Hyrule soldiers (they share the Hyrule soldier art) ──
  u({ id: 'hyruleSpearman', name: 'Hyrule Spearman', title: 'Royal Spearman', race: 'hylian', classId: 'spearmanFS', size: 1, home: 'whereaboutsOfTheWind', glyph: 'hS', generic: true,
    stats: st(28, 13, 0, 12, 10, 11, 5, 7, 10, 5, 28, 0), weapons: ['hyruleSpear', 'soldierSword'], skill: 'spearFormation',
    bio: 'A royal spearman who fights best shoulder to shoulder, in a line of spears that nothing gets through.' }),
  u({ id: 'hyruleBombardier', name: 'Hyrule Bombardier', title: 'Royal Bombardier', race: 'hylian', classId: 'bombardierFS', size: 1, home: 'easternHyrule', glyph: 'hB', generic: true,
    stats: st(26, 11, 0, 16, 9, 8, 5, 8, 11, 5, 30, 0), weapons: ['soldierSword', 'fairySlingshot'], skill: 'militaryExplosives',
    bio: 'A soldier from the castle\'s powder store, singed eyebrows and all, who throws bombs further and bigger than anyone.' }),
  u({ id: 'hyruleCaptain', name: 'Hyrule Captain', title: 'Royal Captain', race: 'hylian', classId: 'captainFS', size: 1, home: 'nearTheFields', glyph: 'hC', generic: true,
    stats: st(36, 17, 0, 17, 13, 15, 8, 12, 12, 6, 35, 0), weapons: ['soldierSword', 'hyruleSpear'], skill: 'militaryCommand', abilities: ['captainsOrder'],
    bio: 'A veteran officer of the royal army, who kept his squad together when the castle fell under Ganon\'s spell.' }),
];

