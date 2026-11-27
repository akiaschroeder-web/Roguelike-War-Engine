// Zelda II: The Adventure of Link — the expansion's units (design doc sections 1–4).
// The Sleeping Princess, sixteen palace monsters, six palace guardians (all recruitable),
// three overworld leaders (forms of recruitable monsters) and the Floating Helmets that
// Helmethead sheds in battle. Returning monsters (Iron Knuckles, Stalfos, Goriyas, Moblins,
// Octoroks, Leevers, Tektites, Keese, Bubbles) keep their units; Barba is Volvagia and
// Link's Shadow is Dark Link. Wizzrobes come from the Era of Legend pack (it adds them to the later palaces).

import type { BossDef, ClassDef, EnemyArchetype, Growths, MoveType, Stats, UnitTemplate, WeaponType } from '../../engine/types';
import { st } from './units';

const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base: Stats, tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });
const BOSS = g(140, 50, 50, 35, 25, 45, 40, 25);

export const Z2_CLASSES: ClassDef[] = [
  c('ancientPrincess', 'Ancient Princess', '💤', ['magic', 'staff'], 'foot', g(60, 5, 75, 50, 35, 20, 70, 60), st(23, 2, 23, 13, 8, 4, 24, 16, 4, 5, 14, 50)),
  // ── Monsters (Bit is the existing Lesser Slime class) ──
  c('slime', 'Slime', '🔵', ['natural'], 'foot', g(60, 35, 5, 35, 45, 25, 20, 25), st(18, 6, 0, 7, 10, 4, 3, 4, 4, 5, 16, 0)),
  c('divingBird', 'Diving Bird', '🦅', ['natural'], 'flying', g(45, 35, 5, 45, 65, 15, 20, 25), st(12, 6, 0, 9, 15, 2, 3, 4, 2, 8, 16, 0), ['beast']),
  c('treeSpider', 'Tree Spider', '🕷', ['natural'], 'foot', g(60, 40, 5, 45, 45, 25, 20, 25), st(18, 7, 0, 10, 9, 4, 4, 5, 4, 5, 18, 0), ['beast']),
  c('axeWarrior', 'Axe Warrior', '🪓', ['axe', 'natural'], 'foot', g(85, 55, 5, 45, 40, 40, 20, 20), st(32, 15, 0, 12, 10, 10, 5, 5, 12, 5, 28, 0)),
  c('reptilianFighter', 'Reptilian Fighter', '🦎', ['hammer', 'natural'], 'foot', g(80, 45, 5, 45, 40, 40, 20, 20), st(26, 10, 0, 10, 9, 9, 5, 5, 8, 5, 22, 0)),
  c('desertCrawler', 'Desert Crawler', '🐛', ['natural'], 'foot', g(90, 45, 5, 30, 30, 40, 20, 15), st(34, 12, 0, 8, 6, 10, 4, 3, 15, 5, 26, 0), ['beast']),
  c('invisibleSpirit', 'Invisible Spirit', '👁', ['magic', 'natural'], 'flying', g(60, 15, 55, 45, 55, 15, 50, 25), st(22, 4, 14, 11, 13, 3, 14, 6, 3, 7, 14, 30)),
  c('spikedCrawler', 'Spiked Crawler', '🦔', ['natural'], 'foot', g(55, 25, 5, 25, 20, 55, 20, 20), st(14, 5, 0, 5, 4, 13, 4, 3, 5, 3, 12, 0)),
  c('skeletalFish', 'Skeletal Fish', '🐟', ['natural', 'magic'], 'foot', g(55, 35, 20, 40, 50, 20, 25, 20), st(16, 7, 4, 8, 12, 4, 6, 3, 3, 6, 16, 8), ['undead']),
  c('armoredWarrior', 'Armored Warrior', '🛡', ['hammer', 'natural'], 'armor', g(95, 55, 5, 45, 30, 55, 25, 20), st(38, 17, 0, 13, 8, 15, 6, 5, 17, 5, 32, 0), ['armor']),
  c('heavyWarrior', 'Heavy Warrior', '🐂', ['hammer', 'natural'], 'foot', g(105, 60, 5, 35, 25, 45, 20, 15), st(42, 19, 0, 11, 6, 13, 5, 4, 20, 4, 35, 0)),
  c('avianKnight', 'Avian Knight', '🐦', ['sword', 'natural'], 'foot', g(85, 50, 15, 65, 60, 35, 25, 30), st(36, 15, 3, 19, 18, 10, 7, 7, 10, 7, 32, 8)),
  c('firebird', 'Firebird', '🔥', ['magic', 'natural'], 'flying', g(75, 30, 55, 45, 55, 25, 45, 20), st(30, 8, 16, 12, 14, 6, 12, 5, 9, 8, 22, 30), ['beast']),
  c('skeletalWanderer', 'Skeletal Wanderer', '🐺', ['sword', 'natural'], 'foot', g(55, 30, 15, 30, 30, 20, 25, 15), st(14, 5, 3, 5, 5, 3, 6, 2, 4, 4, 12, 6), ['undead']),
  c('teleportingMage', 'Teleporting Mage', '🧙', ['magic', 'staff'], 'foot', g(55, 10, 65, 50, 45, 15, 60, 25), st(22, 3, 18, 14, 12, 3, 17, 6, 4, 5, 14, 38)),
  c('floatingHelmet', 'Floating Helmet', '⛑', ['magic'], 'flying', g(40, 10, 40, 30, 35, 30, 30, 10), st(14, 2, 10, 9, 9, 8, 9, 3, 4, 5, 10, 12)),
  // ── Palace guardians ──
  c('armoredMaceKnight', 'Armored Mace Knight', '🐴', ['hammer', 'natural'], 'armor', BOSS, st(48, 19, 0, 13, 7, 21, 8, 5, 23, 5, 38, 0), ['armor']),
  c('hauntedKnight', 'Haunted Knight', '⛑', ['sword', 'magic', 'natural'], 'armor', BOSS, st(55, 16, 17, 13, 8, 18, 15, 5, 22, 5, 30, 35), ['armor', 'undead']),
  c('ironKnuckleCommander', 'Iron Knuckle Commander', '🏇', ['lance', 'sword', 'natural'], 'cavalry', BOSS, st(46, 18, 5, 19, 15, 18, 9, 6, 18, 8, 38, 15), ['armor']),
  c('supremeSorcerer', 'Supreme Sorcerer', '🔮', ['magic', 'staff'], 'foot', g(90, 10, 80, 60, 50, 20, 75, 25), st(35, 3, 28, 20, 16, 5, 26, 7, 5, 7, 16, 60)),
  c('heavyFlailWarrior', 'Heavy Flail Warrior', '⛓', ['hammer', 'natural'], 'foot', g(160, 60, 5, 30, 20, 45, 25, 15), st(72, 26, 0, 12, 6, 20, 7, 4, 35, 4, 45, 0)),
  c('palaceGuardian', 'Palace Guardian', '⚡', ['magic', 'natural'], 'flying', g(180, 50, 65, 35, 30, 50, 55, 20), st(105, 20, 32, 17, 14, 24, 28, 5, 38, 8, 40, 65)),
];

type T = Omit<UnitTemplate, 'glyph'> & { glyph: string };
const u = (t: T): UnitTemplate => t;

export const Z2_TEMPLATES: UnitTemplate[] = [
  u({ id: 'sleepingZelda', name: 'Princess Zelda (Sleeping Princess)', title: 'Ancient Princess', race: 'hylian', classId: 'ancientPrincess', size: 1, home: 'northCastle', glyph: 'ZS',
    stats: st(23, 2, 23, 13, 8, 4, 24, 16, 4, 5, 14, 50), weapons: ['lightSageStaff', 'healStaff'], skill: 'awakening', rare: true,
    abilities: ['sleepingCurse', 'ancientBlessing', 'dreamProtection', 'couragesAwakening'],
    bio: 'The first Princess Zelda, who would not tell her brother the secret of the Triforce and was cast into an enchanted sleep by a wizard. She slept for centuries on an altar in North Castle while the kingdom forgot her name — until a hero placed six crystals in six palaces and woke her.' }),
];

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 2 (stats from section 4). Colour variants come from the existing monster progression.
export const Z2_ENEMIES: EnemyArchetype[] = [
  e('bit', 'Bit', 'lesserSlime', 'chuchu', ['bitBounce'], st(10, 3, 0, 5, 8, 2, 2, 4, 2, 4, 10, 0), { skill: 'suddenLeap', glyph: 'BI' }),
  e('bot', 'Bot', 'slime', 'chuchu', ['botSlam'], st(18, 6, 0, 7, 10, 4, 3, 4, 4, 5, 16, 0), { skill: 'bouncingAssault', glyph: 'BO' }),
  e('moby', 'Moby', 'divingBird', 'monster', ['mobyTalons'], st(12, 6, 0, 9, 15, 2, 3, 4, 2, 8, 16, 0), { skill: 'diveAttack', glyph: 'MB' }),
  e('deeler', 'Deeler', 'treeSpider', 'monster', ['deelerFangs'], st(18, 7, 0, 10, 9, 4, 4, 5, 4, 5, 18, 0), { skill: 'suspendedAmbush', glyph: 'DE' }),
  e('daira', 'Daira', 'axeWarrior', 'monster', ['dairaAxe'], st(32, 15, 0, 12, 10, 10, 5, 5, 12, 5, 28, 0), { skill: 'axeThrow', glyph: 'DA' }),
  e('geru', 'Geru', 'reptilianFighter', 'monster', ['geruMace'], st(26, 10, 0, 10, 9, 9, 5, 5, 8, 5, 22, 0), { skill: 'reptilianGuard', glyph: 'GR' }),
  e('geldarm', 'Geldarm', 'desertCrawler', 'monster', ['geldarmMandibles'], st(34, 12, 0, 8, 6, 10, 4, 3, 15, 5, 26, 0), { size: 2, skill: 'sandEmergence', glyph: 'GD' }),
  e('moa', 'Moa', 'invisibleSpirit', 'phantom', ['moaFlame'], st(22, 4, 14, 11, 13, 3, 14, 6, 3, 7, 14, 30), { skill: 'unseenPresence', glyph: 'MA' }),
  e('myu', 'Myu', 'spikedCrawler', 'monster', ['myuSpikes'], st(14, 5, 0, 5, 4, 13, 4, 3, 5, 3, 12, 0), { skill: 'spikedBody', glyph: 'MY' }),
  e('bagoBago', 'Bago-Bago', 'skeletalFish', 'undead', ['bagoBite', 'bagoBones'], st(16, 7, 4, 8, 12, 4, 6, 3, 3, 6, 16, 8), { skill: 'leapingBones', glyph: 'BB' }),
  e('doomknocker', 'Doomknocker', 'armoredWarrior', 'monster', ['doomknockerHammer'], st(38, 17, 0, 13, 8, 15, 6, 5, 17, 5, 32, 0), { size: 2, skill: 'returningHammer', glyph: 'DK' }),
  e('guma', 'Guma', 'heavyWarrior', 'monster', ['gumaMace'], st(42, 19, 0, 11, 6, 13, 5, 4, 20, 4, 35, 0), { size: 2, skill: 'ironFlail', glyph: 'GU' }),
  e('fokka', 'Fokka', 'avianKnight', 'monster', ['fokkaSword'], st(36, 15, 3, 19, 18, 10, 7, 7, 10, 7, 32, 8), { skill: 'leapingSwordsmanship', glyph: 'FK' }),
  e('fokkeru', 'Fokkeru', 'firebird', 'monster', ['fokkeruFire', 'fokkeruTalons'], st(30, 8, 16, 12, 14, 6, 12, 5, 9, 8, 22, 30), { size: 2, skill: 'fireSpit', glyph: 'FR' }),
  e('wosu', 'Wosu', 'skeletalWanderer', 'undead', ['wosuClaws'], st(14, 5, 3, 5, 5, 3, 6, 2, 4, 4, 12, 6), { skill: 'mindDrain', glyph: 'WO' }),
  e('mago', 'Mago', 'teleportingMage', 'monster', ['magoBolt'], st(22, 3, 18, 14, 12, 3, 17, 6, 4, 5, 14, 38), { skill: 'magicalRelocation', glyph: 'MG' }),
  // Helmethead's detached helmets (temporary, but recruitable like any monster).
  e('floatingHelmet', 'Floating Helmet', 'floatingHelmet', 'undead', ['helmetBolt'], st(14, 2, 10, 9, 9, 8, 9, 3, 4, 5, 10, 12), { skill: 'spectralHelm', glyph: 'FH' }),
];

const b = (d: BossDef): BossDef => d;

export const Z2_BOSSES: BossDef[] = [
  // ── Section 3: the palace guardians (all recruitable) ──
  b({ id: 'horsehead', name: 'Horsehead', title: 'Armored Mace Knight', home: 'parapaPalace', race: 'monster', classId: 'armoredMaceKnight', size: 2, glyph: 'HH',
    weapons: ['horseheadsMace'], skill: 'armoredBody', abilities: ['heavyMaceSwing', 'crushingStrike', 'sweepingBlow', 'armoredAdvance'], stats: st(48, 19, 0, 13, 7, 21, 8, 5, 23, 5, 38, 0),
    quote: '(A horse-headed knight in heavy armor swings a mace at the end of Parapa\'s hall. His breastplate turns every blow from the front. Strike from above.)', drops: ['horseheadsMace', 'horseheadsArmor'] }),
  b({ id: 'helmethead', name: 'Helmethead', title: 'Haunted Knight', home: 'midoroPalace', race: 'undead', classId: 'hauntedKnight', size: 2, glyph: 'HM',
    weapons: ['helmetheadBlade', 'helmetFireball'], skill: 'detachedHelmets', abilities: ['helmetFireballAbility', 'armoredCharge', 'spectralSummoning', 'tripleBarrage'],
    stats: st(55, 16, 17, 13, 8, 18, 15, 5, 22, 5, 30, 35),
    quote: '(A giant knight with too many helmets. Knock one off and it floats away on its own, spitting fire.)', drops: ['helmetheadsHelm'] }),
  b({ id: 'rebonack', name: 'Rebonack', title: 'Iron Knuckle Commander', home: 'islandPalace', race: 'monster', classId: 'ironKnuckleCommander', size: 2, glyph: 'RB',
    weapons: ['rebonacksLance', 'rebonackBeam'], skill: 'unyieldingKnight', abilities: ['mountedCharge', 'lanceThrust', 'swordBeamBarrage', 'defensiveDuel'],
    stats: st(46, 18, 5, 19, 15, 18, 9, 6, 18, 8, 38, 15),
    quote: '(An Iron Knuckle on an armored horse lowers his lance. Unhorse him and he only gets faster.)', drops: ['rebonacksLance', 'rebonacksArmor'] }),
  b({ id: 'carock', name: 'Carock', title: 'Supreme Sorcerer', home: 'mazeIslandPalace', race: 'phantom', classId: 'supremeSorcerer', size: 2, glyph: 'CA',
    weapons: ['carocksStaff', 'carockBolt'], skill: 'magicalIntangibility', abilities: ['rapidTeleport', 'arcaneBolt', 'magicalBarrage', 'illusoryEscape'],
    stats: st(35, 3, 28, 20, 16, 5, 26, 7, 5, 7, 16, 60),
    quote: '(A robed sorcerer blinks from wall to wall. Swords pass through him. His own spells, thrown back, do not.)', drops: ['carocksStaff', 'magicBoots'] }),
  b({ id: 'gooma', name: 'Gooma', title: 'Heavy Flail Warrior', home: 'palaceOnTheSea', race: 'monster', classId: 'heavyFlailWarrior', size: 3, glyph: 'GM',
    weapons: ['ballAndChain'], skill: 'crushingMomentum', abilities: ['ballAndChainSwing', 'wideSweep', 'overheadSlam', 'armorCrusher'],
    stats: st(72, 26, 0, 12, 6, 20, 7, 4, 35, 4, 45, 0),
    quote: '(A horned giant whirls a ball and chain. Every blow on the same shield lands harder than the last.)', drops: ['ballAndChain', 'recorder'] }),
  b({ id: 'thunderbird', name: 'Thunderbird', title: 'Palace Guardian', home: 'greatPalace', race: 'monster', classId: 'palaceGuardian', size: 4, glyph: 'TB',
    weapons: ['thunderbirdFlames', 'thunderbirdTalons'], skill: 'sealedFace', abilities: ['fireballRain', 'guardianFlight', 'burningDive', 'infernalStorm', 'reseal'],
    stats: st(105, 20, 32, 17, 14, 24, 28, 5, 38, 8, 40, 65),
    quote: '(The guardian of the Great Palace spreads its wings. Its face is sealed behind a mask nothing can break — nothing but Thunder.)', drops: ['thunderbirdMask'] }),
  // ── Overworld leaders: stronger forms of recruitable monsters (bossAsTemplate) ──
  b({ id: 'geruBoss', name: 'Geru Captain', title: 'Reptilian Fighter', home: 'northCastle', race: 'monster', classId: 'reptilianFighter', size: 1, glyph: 'GR',
    weapons: ['geruMace'], skill: 'reptilianGuard', stats: st(34, 12, 0, 12, 10, 11, 6, 5, 9, 5, 26, 0),
    quote: '(A lizard warrior in a crested helmet holds the road out of North Castle. His shield doesn\'t move.)', drops: ['fokkaHelmet'] }),
  b({ id: 'dairaBoss', name: 'Daira Chieftain', title: 'Axe Warrior', home: 'z2DeathMountain', race: 'monster', classId: 'axeWarrior', size: 1, glyph: 'DA',
    weapons: ['dairaAxe'], skill: 'axeThrow', stats: st(40, 17, 0, 13, 11, 12, 6, 5, 13, 5, 30, 0),
    quote: '(Axes come spinning out of the dark of the mountain caves. They always come back to the same hand.)', drops: ['dairaAxe'] }),
  b({ id: 'gumaBoss', name: 'Guma Brute', title: 'Heavy Warrior', home: 'valleyOfDeath', race: 'monster', classId: 'heavyWarrior', size: 2, glyph: 'GU',
    weapons: ['gumaMace'], skill: 'ironFlail', stats: st(52, 21, 0, 12, 7, 15, 6, 4, 22, 4, 38, 0),
    quote: '(The Valley of Death echoes with iron. A horned brute twirls a mace on a chain and waits at the mouth of the valley.)', drops: ['doomknockerHammer'] }),
  b({ id: 'geldarmBoss', name: 'Great Geldarm', title: 'Desert Crawler', home: 'z2Towns', race: 'monster', classId: 'desertCrawler', size: 2, glyph: 'GD',
    weapons: ['geldarmMandibles'], skill: 'sandEmergence', stats: st(44, 14, 0, 9, 7, 12, 5, 3, 17, 5, 30, 0),
    quote: '(The sand on the desert road rises into a wall of legs. It won\'t let anyone pass to the towns of the south.)', drops: ['magicBoots'] }),
];

/** Overworld leaders are forms of recruitable monsters. */
export const Z2_BOSS_AS_TEMPLATE: Record<string, string> = { geruBoss: 'geru', dairaBoss: 'daira', gumaBoss: 'guma', geldarmBoss: 'geldarm' };

/** Enemy rosters (the Era of Legend pack adds Wizzrobes to the later palaces). */
export const Z2_ROSTERS: Record<string, string[]> = {
  northCastle: ['bit', 'bit', 'bot', 'moby', 'deeler', 'octorok', 'tektite', 'geru'],
  parapaPalace: ['bot', 'bot', 'bit', 'myu', 'myu', 'stalfos', 'ironKnuckle', 'keese'],
  z2Towns: ['moa', 'wosu', 'wosu', 'bot', 'octorok', 'geru', 'moby', 'leever', 'geldarm'],
  z2DeathMountain: ['daira', 'daira', 'geru', 'moblin', 'keese', 'tektite', 'deeler', 'ironKnuckle'],
  midoroPalace: ['bot', 'myu', 'stalfos', 'ironKnuckle', 'mago', 'keese', 'blueBubble', 'bagoBago'],
  islandPalace: ['ironKnuckle', 'ironKnuckle', 'stalfos', 'myu', 'bagoBago', 'geru', 'redBubble', 'goriya'],
  mazeIslandPalace: ['moa', 'moa', 'ironKnuckle', 'stalfos', 'guma', 'bot', 'keese', 'goriya'],
  spectacleRock: ['daira', 'moby', 'keese', 'tektite', 'deeler', 'moblin', 'myu', 'geldarm'],
  palaceOnTheSea: ['fokka', 'fokkeru', 'doomknocker', 'ironKnuckle', 'moa', 'myu', 'bagoBago', 'octorok'],
  threeEyeRockPalace: ['fokka', 'fokkeru', 'doomknocker', 'ironKnuckle', 'stalfos', 'mago', 'moa', 'blueBubble'],
  valleyOfDeath: ['daira', 'guma', 'doomknocker', 'moblin', 'ironKnuckle', 'geldarm', 'moby', 'wosu', 'redBubble'],
  greatPalace: ['fokka', 'fokka', 'fokkeru', 'doomknocker', 'ironKnuckle', 'mago', 'moa', 'myu', 'bot', 'guma'],
};

/** The palaces, in order, and each one's guardian. Three-Eye Rock's Barba is Volvagia. */
export const PALACES = ['parapaPalace', 'midoroPalace', 'islandPalace', 'mazeIslandPalace', 'palaceOnTheSea', 'threeEyeRockPalace'];
export const GREAT_PALACE = 'greatPalace';
export const PALACE_BOSSES: Record<string, string> = {
  parapaPalace: 'horsehead', midoroPalace: 'helmethead', islandPalace: 'rebonack', mazeIslandPalace: 'carock', palaceOnTheSea: 'gooma',
  threeEyeRockPalace: 'volvagia', greatPalace: 'thunderbird',
};
/** After Thunderbird falls in the Great Palace, Link's Shadow steps out. */
export const GREAT_PALACE_SHADOW = 'darkLink';

export const Z2_REGION_BOSSES: Record<string, string[]> = {
  ...Object.fromEntries(Object.entries(PALACE_BOSSES).map(([k, v]) => [k, [v]])),
  northCastle: ['geruBoss'], z2DeathMountain: ['dairaBoss'], spectacleRock: ['dairaBoss', 'gumaBoss'], valleyOfDeath: ['gumaBoss'], z2Towns: ['geldarmBoss'],
};

export const Z2_SPOILS: Record<string, string> = {
  moa: 'moaEye', myu: 'myuSpike', fokka: 'fokkaFeather', thunderbird: 'thunderbirdFlame', bot: 'experienceBag', bit: 'experienceBag', geldarm: 'experienceBag',
  daira: 'experienceBag', doomknocker: 'experienceBag', guma: 'experienceBag', mago: 'waterOfLife', fokkeru: 'thunderbirdFlame', horsehead: 'linkDoll', helmethead: 'linkDoll',
  rebonack: 'linkDoll', carock: 'waterOfLife', gooma: 'linkDoll',
};
