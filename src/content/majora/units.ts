import type { Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc tables: physical (HP STR SKL SPD DEF CON MOV) then MAG RES LCK STA MP. */
const st = (
  hp: number, str: number, skl: number, spd: number, def: number, con: number, mov: number,
  mag: number, res: number, lck: number, sta: number, mp: number,
): Stats => ({ hp, str, skl, spd, def, con, mov, mag, res, lck, sta, mp });

type T = Omit<UnitTemplate, 'glyph'> & { glyph?: string };
const glyphOf = (name: string) => {
  const w = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : name.slice(0, 2)).toUpperCase();
};
const u = (t: T): UnitTemplate => ({ glyph: glyphOf(t.name), ...t });

export const NAMED: UnitTemplate[] = [
  // ── Link and his forms ──
  u({ id: 'terminaLink', name: 'Link (Termina)', title: 'Hero of Termina', race: 'hylian', classId: 'maskAdventurer', size: 1, home: 'clockTown', glyph: 'LT',
    stats: st(22, 7, 10, 11, 5, 6, 5, 5, 6, 11, 14, 12), weapons: ['kokiriSword', 'ocarinaOfTime'], skill: 'heroOfMasks', abilities: ['songOfTime', 'songOfHealing', 'songOfSoaring'],
    bio: 'A young hero lost in a strange land, with three days to save it and a growing collection of masks.' }),
  u({ id: 'dekuLink', name: 'Deku Link', title: 'Deku Adventurer', race: 'deku', classId: 'dekuAdventurer', size: 1, home: 'woodfall', glyph: 'DL',
    stats: st(17, 4, 9, 12, 3, 3, 6, 8, 5, 9, 12, 18), weapons: ['bubbleBlast', 'dekuPeck', 'dekuPipes'], skill: 'dekuMobility', abilities: ['sonataOfAwakening'], rare: true,
    bio: 'Link in the shape of a Deku Scrub: light, quick, bouncing over water and gliding from flowers. Weak to fire.' }),
  u({ id: 'goronLink', name: 'Goron Link', title: 'Rolling Warrior', race: 'goron', classId: 'rollingWarrior', size: 2, home: 'snowhead', glyph: 'GL',
    stats: st(34, 13, 7, 5, 12, 16, 4, 4, 4, 7, 25, 14), weapons: ['goronPunch', 'goronDrums'], skill: 'spikedRoll', abilities: ['goronLullaby'], rare: true,
    bio: 'Link wearing the spirit of Darmani: a spiked, rolling powerhouse who shrugs off heat.' }),
  u({ id: 'zoraLink', name: 'Zora Link', title: 'Aquatic Warrior', race: 'zora', classId: 'aquaticWarrior', size: 1, home: 'greatBay', glyph: 'ZL',
    stats: st(25, 8, 12, 13, 5, 8, 6, 7, 8, 8, 20, 18), weapons: ['zoraFins', 'zoraGuitar'], skill: 'aquaticGrace', abilities: ['newWaveBossaNova'], rare: true,
    bio: 'Link carrying Mikau\'s memory: a swift swimmer with returning fin blades and an electric barrier.' }),
  u({ id: 'fierceDeityLink', name: 'Fierce Deity Link', title: 'Divine Swordsman', race: 'deity', classId: 'divineSwordsman', size: 2, home: 'moon', glyph: 'FD',
    stats: st(40, 18, 14, 12, 12, 16, 6, 16, 14, 10, 25, 32), weapons: ['doubleHelixSword'], skill: 'wrathOfTheDeity', rare: true,
    bio: 'A terrible god wearing Link\'s face. The Double Helix Sword cuts down bosses and fires magical beams.' }),
  u({ id: 'giantLink', name: 'Giant Link', title: 'Colossal Hero', race: 'hylian', classId: 'colossalHero', size: 5, home: 'ikana', glyph: 'GI',
    stats: st(65, 24, 8, 4, 16, 30, 4, 5, 10, 8, 35, 30), weapons: ['giantFists'], skill: 'colossalStrength', rare: true,
    bio: 'Link grown to the size of a Giant. Every blow sweeps the battlefield and knocks down walls.' }),

  // ── Terminians ──
  u({ id: 'skullKid', name: 'Skull Kid', title: 'Forest Trickster', race: 'spirit', classId: 'forestTrickster', size: 1, home: 'clockTown',
    stats: st(19, 4, 12, 14, 3, 4, 7, 12, 10, 9, 12, 25), weapons: ['skullKidMagic', 'skullKidFlute'], skill: 'mischief', abilities: ['sariasSong'],
    bio: 'A lonely imp who stole a terrible mask. Swaps places with friend and foe alike.' }),
  u({ id: 'tatl', name: 'Tatl', title: 'Fairy Guide', race: 'fairy', classId: 'fairyGuide', size: 0, home: 'clockTown',
    stats: st(8, 0, 13, 16, 0, 1, 8, 7, 10, 12, 8, 18), weapons: ['fairyGlow'], skill: 'quickWarning',
    bio: 'A sharp-tongued fairy who warns allies just in time.' }),
  u({ id: 'tael', name: 'Tael', title: 'Spirit Guide', race: 'fairy', classId: 'spiritGuide', size: 0, home: 'clockTown',
    stats: st(9, 0, 11, 14, 0, 1, 8, 9, 12, 10, 8, 20), weapons: ['fairyGlow'], skill: 'callTheGiants',
    bio: 'Tatl\'s brother, who knows where the Giants sleep.' }),
  u({ id: 'kafei', name: 'Kafei', title: 'Masked Thief', race: 'hylian', classId: 'maskedThief', size: 1, home: 'clockTown',
    stats: st(20, 5, 10, 12, 4, 5, 6, 3, 5, 10, 13, 6), weapons: ['sheikahShortblade'], skill: 'determination',
    bio: 'Cursed into a child\'s body, still hunting the thief who took his wedding mask.' }),
  u({ id: 'anju', name: 'Anju', title: 'Innkeeper', race: 'hylian', classId: 'innkeeper', size: 1, home: 'clockTown',
    stats: st(19, 3, 6, 6, 3, 5, 5, 5, 7, 12, 9, 12), weapons: ['anjuPan', 'healStaff'], skill: 'hospitality',
    bio: 'The Stock Pot Inn\'s innkeeper. Her camps leave the army well rested.' }),
  u({ id: 'dekuPrincess', name: 'Deku Princess', title: 'Royal Skirmisher', race: 'deku', classId: 'royalSkirmisher', size: 1, home: 'woodfall',
    stats: st(18, 6, 10, 11, 4, 4, 5, 6, 6, 7, 13, 12), weapons: ['fairySlingshot'], skill: 'royalTemper',
    bio: 'A princess with a famous temper. Whoever hurts her regrets it.' }),
  u({ id: 'dekuKing', name: 'Deku King', title: 'Forest Monarch', race: 'deku', classId: 'forestMonarch', size: 1, home: 'woodfall',
    stats: st(25, 7, 7, 5, 7, 8, 4, 8, 9, 6, 14, 16), weapons: ['dekuRoyalScepter'], skill: 'royalCommand',
    bio: 'Ruler of the Deku Palace. His presence stiffens every Deku spine.' }),
  u({ id: 'darmani', name: 'Darmani III', title: 'Goron Champion', race: 'goron', classId: 'goronChampion', size: 2, home: 'snowhead',
    stats: st(36, 14, 8, 6, 13, 17, 4, 4, 5, 9, 28, 12), weapons: ['goronFists', 'goronDrums'], skill: 'mountainHero',
    bio: 'The greatest Goron hero, refusing to rest until Snowhead is free.' }),
  u({ id: 'mikau', name: 'Mikau', title: 'Zora Guitar Warrior', race: 'zora', classId: 'zoraGuitarist', size: 1, home: 'greatBay',
    stats: st(26, 9, 13, 12, 6, 9, 6, 8, 8, 9, 22, 18), weapons: ['mikauFinBlades', 'zoraGuitar'], skill: 'indigoGos', abilities: ['newWaveBossaNova'],
    bio: 'Guitarist of the Indigo-Go\'s. His songs pick the whole army up.' }),
  u({ id: 'lulu', name: 'Lulu', title: 'Zora Songstress', race: 'zora', classId: 'zoraSongstress', size: 1, home: 'greatBay',
    stats: st(21, 3, 10, 9, 4, 6, 5, 13, 12, 11, 10, 26), weapons: ['zoraWaterMagic', 'zoraGuitar'], skill: 'voiceOfTheOcean', abilities: ['newWaveBossaNova', 'songOfHealing'],
    bio: 'The Indigo-Go\'s singer. Her voice carries further over water.' }),
  u({ id: 'captainKeeta', name: 'Captain Keeta', title: 'Undead Captain', race: 'undead', classId: 'undeadCaptain', size: 3, home: 'ikana',
    stats: st(44, 15, 9, 5, 12, 22, 4, 5, 8, 5, 26, 12), weapons: ['keetaGreatsword'], skill: 'captainsOrders',
    bio: 'A giant skeleton captain who never stopped leading his soldiers.' }),
  u({ id: 'igosDuIkana', name: 'Igos du Ikana', title: 'Fallen King', race: 'undead', classId: 'fallenKing', size: 2, home: 'ikana', glyph: 'IG',
    stats: st(36, 13, 12, 8, 10, 14, 5, 9, 11, 6, 22, 20), weapons: ['ikanaRoyalSword'], skill: 'undyingKingdom',
    bio: 'The last king of Ikana. Only light keeps him down for good.' }),
  u({ id: 'ikanaServant1', name: 'Ikana Royal Servant I', title: 'Royal Swordsman', race: 'undead', classId: 'royalSwordsman', size: 1, home: 'ikana', glyph: 'S1',
    stats: st(28, 12, 13, 12, 7, 9, 6, 2, 5, 4, 20, 6), weapons: ['servantBlade'], skill: 'kingsBlade', extraSkills: ['skeletalReassembly'],
    bio: 'The king\'s sword arm. Fights hardest near Igos du Ikana.' }),
  u({ id: 'ikanaServant2', name: 'Ikana Royal Servant II', title: 'Royal Defender', race: 'undead', classId: 'ikanaDefender', size: 1, home: 'ikana', glyph: 'S2',
    stats: st(32, 9, 9, 7, 12, 12, 5, 2, 7, 4, 22, 6), weapons: ['servantSpear'], skill: 'kingsShield', extraSkills: ['skeletalReassembly'],
    bio: 'The king\'s shield. Throws himself in front of any blow aimed at Igos.' }),
  u({ id: 'sharp', name: 'Sharp', title: 'Curse Composer', race: 'undead', classId: 'composer', size: 1, home: 'ikana',
    stats: st(20, 2, 10, 7, 3, 4, 5, 14, 13, 5, 8, 28), weapons: ['composerBaton', 'fairyOcarina'], skill: 'songOfSorrow', abilities: ['goronLullaby'],
    bio: 'A composer who sold his soul. His dirge drains the magic of anyone nearby.' }),
  u({ id: 'flat', name: 'Flat', title: 'Spirit Composer', race: 'undead', classId: 'composer', size: 1, home: 'ikana',
    stats: st(20, 2, 11, 7, 3, 4, 5, 13, 14, 9, 8, 28), weapons: ['composerBaton', 'fairyOcarina'], skill: 'songOfRelease', abilities: ['songOfHealing', 'sunsSong'],
    bio: 'Sharp\'s loyal brother. His songs release curses and weaken the restless dead.' }),
  u({ id: 'garoMaster', name: 'Garo Master', title: 'Phantom Assassin', race: 'phantom', classId: 'phantomAssassin', size: 1, home: 'ikana', glyph: 'GM',
    stats: st(25, 11, 15, 15, 5, 7, 7, 5, 7, 6, 22, 10), weapons: ['garoMasterBlades'], skill: 'masterOfAmbush',
    bio: 'A ghostly ninja master who strikes from the shadows.' }),
  u({ id: 'tingle', name: 'Tingle', title: 'Balloon Cartographer', race: 'hylian', classId: 'balloonCartographer', size: 1, home: 'terminaField',
    stats: st(18, 2, 8, 7, 3, 5, 5, 4, 5, 15, 10, 10), weapons: ['tingleMap'], skill: 'kooloolimpah', gear: { mount: 'tinglesBalloon' },
    bio: 'Kooloo-Limpah! Floats over the battlefield mapping hidden traps and treasure.' }),

  // ── The Four Giants ──
  u({ id: 'woodfallGiant', name: 'Woodfall Giant', title: 'Guardian Deity', race: 'giant', classId: 'guardianDeity', size: 5, home: 'woodfall', glyph: 'WG',
    stats: st(80, 22, 8, 3, 17, 35, 3, 17, 16, 10, 35, 35), weapons: ['giantStompWeapon'], skill: 'forestGuardian', rare: true,
    bio: 'Guardian of the southern swamp. Forests spring up where it stands.' }),
  u({ id: 'snowheadGiant', name: 'Snowhead Giant', title: 'Guardian Deity', race: 'giant', classId: 'guardianDeity', size: 5, home: 'snowhead', glyph: 'SG',
    stats: st(80, 22, 8, 3, 17, 35, 3, 17, 16, 10, 35, 35), weapons: ['giantStompWeapon'], skill: 'mountainGuardian', rare: true,
    bio: 'Guardian of the northern mountains. Its stomps send freezing shockwaves.' }),
  u({ id: 'greatBayGiant', name: 'Great Bay Giant', title: 'Guardian Deity', race: 'giant', classId: 'guardianDeity', size: 5, home: 'greatBay', glyph: 'BG',
    stats: st(80, 22, 8, 3, 17, 35, 3, 17, 16, 10, 35, 35), weapons: ['giantStompWeapon', 'jabuTide'], skill: 'oceanGuardian', rare: true,
    bio: 'Guardian of the western sea. Calls tidal surges.' }),
  u({ id: 'ikanaGiant', name: 'Ikana Giant', title: 'Guardian Deity', race: 'giant', classId: 'guardianDeity', size: 5, home: 'ikana', glyph: 'KG',
    stats: st(80, 22, 8, 3, 17, 35, 3, 17, 16, 10, 35, 35), weapons: ['giantStompWeapon'], skill: 'spiritGuardian', rare: true,
    bio: 'Guardian of the eastern canyon. Its presence wards off curses.' }),
];

/** The new generic Deku units (the OoT Deku Scrub and Business Scrub remain). */
export const GENERICS: UnitTemplate[] = [
  u({ id: 'dekuSoldier', name: 'Deku Soldier', title: 'Infantry', race: 'deku', classId: 'dekuInfantry', size: 1, home: 'woodfall', glyph: 'DS', generic: true,
    stats: st(20, 6, 7, 8, 5, 5, 5, 2, 3, 6, 14, 4), weapons: ['dekuSpear'], skill: 'dekuPhalanx', bio: 'A palace soldier. Stronger in formation.' }),
  u({ id: 'dekuRoyalGuard', name: 'Deku Royal Guard', title: 'Knight', race: 'deku', classId: 'dekuKnight', size: 1, home: 'woodfall', glyph: 'DG', generic: true,
    stats: st(24, 7, 8, 6, 8, 7, 4, 2, 5, 5, 16, 4), weapons: ['dekuSpear'], skill: 'royalGuardDeku', bio: 'Sworn to protect the Deku royal family.' }),
  u({ id: 'dekuFlowerScout', name: 'Deku Flower Scout', title: 'Scout', race: 'deku', classId: 'dekuScout', size: 1, home: 'woodfall', glyph: 'DF', generic: true,
    stats: st(16, 4, 9, 12, 2, 3, 7, 3, 4, 8, 14, 8), weapons: ['fairySlingshot'], skill: 'flowerLaunch', bio: 'Launches from Deku Flowers and glides far behind enemy lines.' }),
  u({ id: 'dekuMystic', name: 'Deku Mystic', title: 'Nature Mage', race: 'deku', classId: 'natureMage', size: 1, home: 'woodfall', glyph: 'DM', generic: true,
    stats: st(17, 2, 8, 7, 3, 3, 5, 10, 9, 8, 8, 20), weapons: ['bubbleBlast', 'healStaff'], skill: 'natureMend', bio: 'Its nature magic mends nearby allies.' }),
  u({ id: 'dekuBombardier', name: 'Deku Bombardier', title: 'Artillery', race: 'deku', classId: 'dekuArtillery', size: 1, home: 'woodfall', glyph: 'DB', generic: true,
    stats: st(18, 5, 10, 8, 3, 5, 5, 4, 4, 5, 14, 8), weapons: ['dekuFlowerLauncher'], skill: 'nutBombardment', bio: 'Lobs explosive pods over walls.' }),
  u({ id: 'madScrub', name: 'Mad Scrub', title: 'Skirmisher', race: 'deku', classId: 'dekuSkirmisher', size: 1, home: 'woodfall', glyph: 'MS', generic: true,
    stats: st(18, 5, 10, 9, 3, 4, 5, 3, 4, 5, 12, 6), weapons: ['madScrubSeeds'], skill: 'tripleShot', bio: 'Fires a rapid volley when it doesn\'t have to move.' }),
];

export const TEMPLATES: UnitTemplate[] = [...NAMED, ...GENERICS];
