import type { RaceDef, Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc table: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

const u = (t: UnitTemplate): UnitTemplate => t;

export const RACES: RaceDef[] = [
  { id: 'lokomo', name: 'Lokomo', desc: 'The sacred guardians of the Spirit Tracks, who roll on wheels and play the songs that hold the rails together. Never possessed or cursed.',
    tags: ['lokomo', 'divine', 'spirit'], growthMods: { mag: 5, res: 5 } },
  { id: 'train', name: 'Train', desc: 'A locomotive of New Hyrule: it runs only on connected rail spaces (tracks, junctions, crossings, stations and Spirit Tracks), carries passengers, and is customized with four parts (Engine, Cannon, Passenger Car, Freight Car).',
    tags: ['vessel', 'train', 'metal'], growthMods: { hp: 20, def: 5, spd: -10, mag: -20, lck: -10 } },
];

// Section 1 characters (doc stats), Big Blin (batch 4), the trains (section 6; stats are my proposal),
// and Zelda's spirit and Phantom forms. Spirit Zelda and Phantom Zelda share the princess's progression
// and supports (SUPPORT_CANON) but are recruitable on their own (exclusive pairs). The Torch, Warp and
// Wrecker possession forms are battle-only (formOf): the doc says they are never recruited separately.
export const TEMPLATES: UnitTemplate[] = [
  // ── Named characters ──
  u({ id: 'heroOfSpirits', name: 'Link', title: 'Hero of Spirits', race: 'hylian', classId: 'royalEngineer', size: 1, home: 'abodaVillage', glyph: 'LS',
    stats: st(28, 12, 5, 16, 13, 9, 7, 14, 8, 6, 28, 18), weapons: ['recruitsSword', 'boomerang'], skill: 'spiritEngineer', gear: { body: 'engineersClothes' },
    bio: 'A young engineer from Aboda Village who came to the castle to receive his certificate and left carrying a sword, a flute and the princess\'s spirit. The Hero of Spirits.' }),
  u({ id: 'zeldaST', name: 'Princess Zelda', title: 'Royal Princess', race: 'hylian', classId: 'royalPrincessST', size: 1, home: 'hyruleCastleST', glyph: 'ZS',
    stats: st(24, 3, 24, 15, 12, 5, 22, 17, 5, 6, 16, 50), weapons: ['zeldasLightST', 'healStaff'], skill: 'unboundSpirit', abilities: ['spiritForm', 'royalLightST'],
    bio: 'The princess of New Hyrule. When Chancellor Cole stole her body, her spirit stayed behind — and learned that it could take over a Phantom\'s armor.' }),
  u({ id: 'spiritZelda', name: 'Spirit Zelda', title: 'Unbound Spirit', race: 'spirit', classId: 'spiritPrincess', size: 1, home: 'towerOfSpirits', glyph: 'Zs', rare: true,
    stats: st(24, 3, 24, 15, 12, 5, 22, 17, 5, 6, 16, 50), weapons: ['zeldasLightST'], skill: 'unboundSpirit', extraSkills: ['spectralPassage'], abilities: ['possessPhantom', 'returnToBody'],
    bio: 'Zelda\'s spirit, pale and floating, separated from her body. She passes through walls, shrugs off ordinary blows and can possess a Phantom once it has been exposed or stunned.' }),
  u({ id: 'phantomZelda', name: 'Phantom Zelda', title: 'Possessed Knight', race: 'phantom', classId: 'possessedKnightST', size: 2, home: 'towerOfSpirits', glyph: 'PZ', rare: true,
    stats: st(48, 21, 12, 13, 7, 28, 18, 17, 25, 5, 38, 30), weapons: ['phantomZeldaBlade'], skill: 'royalGuardianST', abilities: ['returnToBody'],
    bio: 'Zelda inside a Phantom\'s armor: a towering knight who stands in front of her friends and carries them over spikes and pits. If the armor falls, she slips out as a spirit.' }),
  u({ id: 'phantomZeldaTorch', name: 'Phantom Zelda (Torch)', title: 'Possessed Torch Phantom', race: 'phantom', classId: 'possessedKnightST', size: 2, home: 'towerOfSpirits', glyph: 'PT', formOf: 'phantomZelda',
    stats: st(48, 21, 12, 13, 7, 28, 18, 17, 25, 5, 38, 30), weapons: ['torchPhantomSword', 'phantomZeldaBlade'], skill: 'royalGuardianST', abilities: ['torchFlameST', 'returnToBody'],
    bio: 'Zelda in a Torch Phantom\'s armor, its blade wreathed in fire that lights the dark.' }),
  u({ id: 'phantomZeldaWarp', name: 'Phantom Zelda (Warp)', title: 'Possessed Warp Phantom', race: 'phantom', classId: 'possessedKnightST', size: 2, home: 'towerOfSpirits', glyph: 'PW', formOf: 'phantomZelda',
    stats: st(48, 21, 12, 13, 7, 28, 18, 17, 25, 5, 38, 30), weapons: ['phantomZeldaBlade'], skill: 'royalGuardianST', abilities: ['eyeWarpST', 'returnToBody'],
    bio: 'Zelda in a Warp Phantom\'s armor: wherever a Phantom Eye looks, she can be.' }),
  u({ id: 'phantomZeldaWrecker', name: 'Phantom Zelda (Wrecker)', title: 'Possessed Wrecker Phantom', race: 'phantom', classId: 'possessedKnightST', size: 2, home: 'towerOfSpirits', glyph: 'PR', formOf: 'phantomZelda',
    stats: st(48, 21, 12, 13, 7, 28, 18, 17, 25, 5, 38, 30), weapons: ['phantomZeldaBlade'], skill: 'royalGuardianST', abilities: ['wreckingRoll', 'returnToBody'],
    bio: 'Zelda in a Wrecker Phantom\'s armor, curled into a rolling iron ball.' }),
  u({ id: 'alfonzo', name: 'Alfonzo', title: 'Royal Swordsman', race: 'hylian', classId: 'royalSwordsmanST', size: 1, home: 'abodaVillage', glyph: 'AL',
    stats: st(38, 19, 2, 18, 10, 15, 7, 12, 16, 5, 38, 6), weapons: ['alfonzosSword'], skill: 'masterEngineer', abilities: ['masterRepair'],
    bio: 'Link\'s mentor at Aboda: an engineer who once served as a royal swordsman, and who can fix any train with a wrench, a hammer and a grumble.' }),
  u({ id: 'elderNiko', name: 'Niko', title: 'Elder Storyteller', race: 'hylian', classId: 'storyteller', size: 1, home: 'abodaVillage', glyph: 'EN',
    stats: st(22, 3, 8, 14, 4, 4, 12, 20, 5, 4, 12, 20), weapons: ['healStaff', 'storyBookST'], skill: 'livingHistory', abilities: ['storyOfTheWinds'],
    bio: 'An old man of Aboda with a picture show and a long memory. Long ago he sailed with a pirate captain and a boy in a green tunic. He keeps the Stamp Book.' }),
  u({ id: 'cole', name: 'Chancellor Cole', title: 'Dark Sorcerer', race: 'demon', classId: 'darkSorcererST', size: 1, home: 'hyruleCastleST', glyph: 'CO', rare: true,
    stats: st(38, 5, 29, 17, 13, 8, 24, 5, 6, 6, 18, 65), weapons: ['colesDarkBolt'], skill: 'demonicInfluence', abilities: ['darkMagicBarrage', 'colesWarp', 'demonicSummon'],
    bio: 'The chancellor of New Hyrule, a horned demon in a top hat who has spent a century plotting to bring back the Demon King Malladus. (His full Dark Magic is won from his boss form.)' }),
  u({ id: 'byrne', name: 'Byrne', title: 'Fallen Lokomo', race: 'lokomo', classId: 'fallenLokomo', size: 1, home: 'towerOfSpirits', glyph: 'BY', rare: true,
    stats: st(44, 23, 16, 20, 17, 15, 14, 8, 16, 7, 42, 35), weapons: ['gauntletFist'], skill: 'ironGauntletSkill', abilities: ['ironGrab', 'gauntletThrow'],
    bio: 'Anjean\'s finest student, who wanted the Spirit Gods\' power for himself and sided with Cole to get it. His great clawed gauntlet grabs and throws whatever it reaches.' }),
  u({ id: 'anjean', name: 'Anjean', title: 'Lokomo Sage', race: 'lokomo', classId: 'lokomoSage', size: 1, home: 'towerOfSpirits', glyph: 'AJ',
    stats: st(30, 3, 29, 18, 7, 9, 28, 20, 7, 6, 16, 70), weapons: ['anjeansSacredStaff'], skill: 'sacredGuardian', abilities: ['sacredBarrierST', 'sealDarknessST'], gear: { mount: 'lokomoWheelchair' },
    bio: 'The eldest Lokomo, keeper of the Tower of Spirits, who taught Byrne and still hopes to see him come home. She rides a little rolling chair and hits very hard with a staff.' }),
  u({ id: 'ferrus', name: 'Ferrus', title: 'Railway Enthusiast', race: 'hylian', classId: 'railwayEnthusiast', size: 1, home: 'hyruleCastleST', glyph: 'FE',
    stats: st(24, 5, 0, 17, 10, 5, 5, 18, 7, 5, 20, 0), weapons: ['boomerang', 'pebbleSling'], skill: 'railwayKnowledge', abilities: ['trainPictograph'],
    bio: 'A train-mad young man with a camera who knows every switch, siding and timetable in New Hyrule — and some that aren\'t on the maps.' }),
  u({ id: 'linebeck3', name: 'Linebeck III', title: 'Treasure Merchant', race: 'hylian', classId: 'treasureMerchant', size: 1, home: 'oceanRealm', glyph: 'L3',
    stats: st(26, 6, 0, 14, 10, 6, 6, 20, 8, 5, 22, 0), weapons: ['merchantsCutlass', 'pebbleSling'], skill: 'inheritedFortune', abilities: ['merchantsAppraisal'],
    bio: 'The grandson of a certain treasure hunter, who runs a shop by the sea and buys treasures at prices his grandfather would have called robbery.' }),
  u({ id: 'teacher', name: 'Teacher', title: 'Royal Sword Instructor', race: 'hylian', classId: 'swordInstructor', size: 1, home: 'hyruleCastleST', glyph: 'TE',
    stats: st(32, 15, 0, 19, 12, 11, 6, 10, 10, 5, 30, 0), weapons: ['recruitsSword'], skill: 'swordTraining', abilities: ['swordLesson', 'disciplinedStrike'],
    bio: 'The princess\'s strict, bespectacled tutor and the castle guards\' sword instructor. His lessons hurt; they also work.' }),
  // ── The five Lokomo sages ──
  u({ id: 'gage', name: 'Gage', title: 'Forest Sage', race: 'lokomo', classId: 'lokomoMusician', size: 1, home: 'forestRealm', glyph: 'GA',
    stats: st(26, 4, 22, 15, 8, 7, 20, 15, 7, 6, 18, 50), weapons: ['sanctuaryLight', 'lokomoCello', 'healStaff'], skill: 'forestMelodyST', abilities: ['forestMelodyAct'], gear: { mount: 'lokomoWheelchair' },
    bio: 'The Lokomo of the Forest Sanctuary, who plays a great green cello and worries about the trees.' }),
  u({ id: 'steem', name: 'Steem', title: 'Snow Sage', race: 'lokomo', classId: 'lokomoMusician', size: 1, home: 'snowRealm', glyph: 'SE',
    stats: st(28, 4, 24, 14, 7, 9, 23, 12, 8, 6, 18, 55), weapons: ['sanctuaryLight', 'lokomoLute', 'healStaff'], skill: 'snowMelody', abilities: ['snowMelodyAct'], gear: { mount: 'lokomoWheelchair' },
    bio: 'The white-bearded Lokomo of the Snow Sanctuary, who plays a stringed instrument through the blizzard.' }),
  u({ id: 'carben', name: 'Carben', title: 'Ocean Sage', race: 'lokomo', classId: 'lokomoMusician', size: 1, home: 'oceanRealm', glyph: 'CB',
    stats: st(25, 3, 23, 16, 10, 6, 22, 16, 6, 6, 16, 55), weapons: ['sanctuaryLight', 'lokomoFlute', 'healStaff'], skill: 'oceanMelody', abilities: ['oceanMelodyAct'], gear: { mount: 'lokomoWheelchair' },
    bio: 'The Lokomo of the Ocean Sanctuary, light-hearted and light-blue, who plays the flute with the waves.' }),
  u({ id: 'embrose', name: 'Embrose', title: 'Fire Sage', race: 'lokomo', classId: 'lokomoMusician', size: 1, home: 'fireRealm', glyph: 'EM',
    stats: st(30, 7, 26, 13, 8, 10, 21, 10, 9, 6, 20, 55), weapons: ['sanctuaryLight', 'lokomoDrums', 'healStaff'], skill: 'fireMelody', abilities: ['fireMelodyAct'], gear: { mount: 'lokomoWheelchair' },
    bio: 'The red-haired Lokomo of the Fire Sanctuary, who plays the drums loudly enough to shake the volcano.' }),
  u({ id: 'rael', name: 'Rael', title: 'Sand Sage', race: 'lokomo', classId: 'lokomoMusician', size: 1, home: 'sandRealm', glyph: 'RA',
    stats: st(28, 5, 25, 17, 9, 8, 24, 14, 7, 6, 18, 60), weapons: ['sanctuaryLight', 'lokomoHorn', 'healStaff'], skill: 'sandMelody', abilities: ['sandMelodyAct'], gear: { mount: 'lokomoWheelchair' },
    bio: 'The Lokomo of the Sand Sanctuary, who plays a great horn over the dunes.' }),
  // ── Big Blin (batch 4) ──
  u({ id: 'bigBlin', name: 'Big Blin', title: 'Heavy Bruiser', race: 'monster', classId: 'heavyBruiser', size: 2, home: 'hyruleCastleST', glyph: 'BB', monster: true,
    stats: st(48, 23, 0, 11, 6, 17, 6, 5, 24, 5, 40, 0), weapons: ['bigBlinClub'], skill: 'blinBrute', abilities: ['heavyClub', 'sweepingSmash', 'pirateRally', 'boardingAssault'],
    gear: { tool: 'captureBasket', acc1: 'pirateNecklace' },
    bio: 'A huge Blin with a club and a basket on his back for carrying off whoever he knocks down. He leads the Miniblins and Bulblins on raids by land and by rail.' }),
  // ── Trains (section 6) ──
  u({ id: 'spiritTrain', name: 'Spirit Train', title: 'Sacred Locomotive', race: 'train', classId: 'spiritTrainClass', size: 3, home: 'abodaVillage', glyph: 'TR',
    stats: st(62, 14, 0, 13, 8, 13, 11, 14, 30, 6, 40, 0), weapons: ['trainCannon', 'trainCollision'], skill: 'spiritLocomotive',
    gear: { trainEngine: 'spiritTrainEnginePart', trainCannon: 'spiritTrainCannonPart', passengerCar: 'spiritPassengerCarPart', freightCar: 'spiritFreightCarPart' },
    bio: 'The train of the Spirit Tracks, with a green funnel, a cannon and a passenger car. Engine, cannon and both cars can be swapped for other sets. Carries 4.' }),
  u({ id: 'armoredTrain', name: 'Armored Train', title: 'Heavy Locomotive', race: 'train', classId: 'armoredTrainClass', size: 3, home: 'darkRealm', glyph: 'AT',
    stats: st(74, 15, 0, 10, 6, 19, 10, 8, 36, 5, 40, 0), weapons: ['trainCannon', 'trainCollision'], skill: 'armoredPlating',
    bio: 'A blue armored locomotive with burning eyes and a heavy hull, built to take hits. Carries 3.' }),
  u({ id: 'darkTrain', name: 'Dark Train', title: 'Demonic Locomotive', race: 'train', classId: 'darkTrainClass', size: 3, home: 'darkRealm', glyph: 'DT',
    stats: st(58, 16, 10, 11, 9, 13, 13, 4, 30, 6, 40, 20), weapons: ['darkTrainCannon', 'trainCollision'], skill: 'darkCollision',
    bio: 'A hostile demon train that runs on the rails of the Dark Realm and rams anything on its line. Carries 4.' }),
];

/** Passenger room for the pack's trains. */
export const SP_CAPACITY: Record<string, number> = { spiritTrain: 4, armoredTrain: 3, darkTrain: 4, darkTrainBoss: 4, demonTrain: 8 };
