import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';

const st = (
  hp: number, str: number, skl: number, spd: number, def: number, con: number, mov: number,
  mag: number, res: number, lck: number, sta: number, mp: number,
): Stats => ({ hp, str, skl, spd, def, con, mov, mag, res, lck, sta, mp });

const e = (id: string, name: string, classId: string, race: string, weapons: string[], extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, ...extra });

// Rank-and-file enemies. Most use class base stats; a few get tweaks.
export const ENEMIES: EnemyArchetype[] = [
  e('stalchild', 'Stalchild', 'undeadSoldier', 'undead', ['claws']),
  e('stalfos', 'Stalfos', 'undeadKnight', 'undead', ['stalfosSword']),
  e('lizalfos', 'Lizalfos', 'skirmisher', 'monster', ['lizalfosBlade']),
  e('dinolfos', 'Dinolfos', 'warrior', 'monster', ['dinolfosCleaver']),
  e('moblin', 'Moblin', 'heavySoldier', 'monster', ['moblinSpear'], { size: 2 }),
  e('clubMoblin', 'Club Moblin', 'heavySoldier', 'monster', ['moblinClub'], { size: 2, glyph: 'CM' }),
  e('ironKnuckle', 'Iron Knuckle', 'heavyKnight', 'monster', ['ironKnuckleAxe'], { size: 2 }),
  e('dekuScrub', 'Deku Scrub', 'spitter', 'deku', ['stone'], { ai: 'guard' }),
  e('dekuBaba', 'Deku Baba', 'plant', 'deku', ['bite'], { ai: 'stationary', glyph: 'DB' }),
  e('skulltula', 'Skulltula', 'beast', 'monster', ['fangs'], { ai: 'guard', stats: { def: 6, spd: 5 } }),
  e('keese', 'Keese', 'flyer', 'monster', ['fangs']),
  e('fireKeese', 'Fire Keese', 'flyer', 'monster', ['fangs'], { stats: { str: 6 }, glyph: 'FK' }),
  e('iceKeese', 'Ice Keese', 'flyer', 'monster', ['fangs'], { stats: { res: 5, spd: 10 }, glyph: 'IK' }),
  e('guay', 'Guay', 'flyer', 'monster', ['talons']),
  e('peahat', 'Peahat', 'flyer', 'monster', ['talons'], { size: 2, stats: { hp: 24, def: 5 } }),
  e('wolfos', 'Wolfos', 'beast', 'monster', ['claws'], { stats: { str: 8, spd: 10 } }),
  e('tektite', 'Tektite', 'beast', 'monster', ['fangs'], { stats: { mov: 7 } }),
  e('babyDodongo', 'Baby Dodongo', 'beast', 'monster', ['bite'], { stats: { spd: 4, def: 5 }, glyph: 'BD' }),
  e('dodongo', 'Dodongo', 'beast', 'monster', ['bite'], { size: 2, stats: { hp: 30, str: 10, def: 9, spd: 3, mov: 4 } }),
  e('octorok', 'Octorok', 'spitter', 'aquatic', ['stone']),
  e('shellBlade', 'Shell Blade', 'beast', 'aquatic', ['claws'], { stats: { def: 10, spd: 3 }, glyph: 'SB' }),
  e('stinger', 'Stinger', 'flyer', 'aquatic', ['talons']),
  e('likeLike', 'Like Like', 'beast', 'monster', ['drainTouch'], { stats: { hp: 28, def: 6, spd: 2, mov: 3 }, skill: 'lifesteal', glyph: 'LL' }),
  e('leever', 'Leever', 'beast', 'monster', ['claws']),
  e('beamos', 'Beamos', 'turret', 'construct', ['beamosEye'], { ai: 'stationary' }),
  e('anubis', 'Anubis', 'caster', 'undead', ['fireBreath']),
  e('gerudoGuard', 'Gerudo Guard', 'swordsman', 'gerudo', ['gerudoScimitar']),
  e('gerudoThief', 'Gerudo Thief', 'thief', 'gerudo', ['gerudoDagger']),
  e('poe', 'Poe', 'caster', 'undead', ['poeLantern']),
  e('redead', 'ReDead', 'beast', 'undead', ['drainTouch'], { stats: { hp: 26, str: 9, spd: 2, mov: 3, def: 5 }, glyph: 'RD' }),
  e('gibdo', 'Gibdo', 'beast', 'undead', ['drainTouch'], { stats: { hp: 28, str: 10, spd: 3, mov: 3, def: 6 } }),
  e('wallmaster', 'Wallmaster', 'beast', 'monster', ['claws'], { stats: { str: 9, mov: 5 } }),
];

// Unique "lifesteal" monster skill lives in the engine for enemies.

/** Rank-and-file rosters for each region. */
export const ROSTERS: Record<string, string[]> = {
  hyruleField: ['stalchild', 'guay', 'peahat', 'leever', 'moblin', 'poe'],
  kokiriForest: ['dekuBaba', 'dekuScrub', 'skulltula', 'keese', 'wolfos'],
  lostWoods: ['wolfos', 'dekuScrub', 'moblin', 'clubMoblin', 'skulltula', 'stalfos'],
  deathMountain: ['tektite', 'babyDodongo', 'dodongo', 'fireKeese', 'lizalfos', 'dinolfos'],
  zorasDomain: ['octorok', 'shellBlade', 'stinger', 'likeLike', 'tektite', 'lizalfos', 'iceKeese'],
  gerudoDesert: ['gerudoGuard', 'gerudoThief', 'leever', 'beamos', 'anubis', 'ironKnuckle'],
  kakarikoGraveyard: ['poe', 'redead', 'gibdo', 'stalfos', 'wallmaster', 'keese'],
  hyruleCastle: ['moblin', 'ironKnuckle', 'stalfos', 'lizalfos', 'dinolfos', 'redead'],
};

const b = (d: BossDef): BossDef => d;

// Dungeon boss stats aren't in the doc, so those are my proposal.
// Villain stats (Koume, Kotake, Twinrova, Phantom Ganon, Dark Link, Ganon,
// Iron Knuckle Nabooru, Ganondorf) are taken from the doc's tables.
export const BOSSES: BossDef[] = [
  b({ id: 'queenGohma', name: 'Queen Gohma', title: 'Parasitic Armored Arachnid', home: 'kokiriForest', race: 'monster', classId: 'monsterBoss', size: 3,
    weapons: ['bossClaws'], glyph: 'QG', stats: st(40, 11, 8, 6, 9, 20, 4, 4, 5, 2, 20, 10), quote: '(Her single eye fixes on you from the ceiling.)',
    drops: ['gohmaEye', 'gohmaHelm', 'kokiriEmerald'] }),
  b({ id: 'kingDodongo', name: 'King Dodongo', title: 'Infernal Dinosaur', home: 'deathMountain', race: 'monster', classId: 'monsterBoss', size: 4,
    weapons: ['bite', 'fireBreath'], glyph: 'KD', stats: st(50, 14, 6, 3, 13, 28, 3, 8, 4, 2, 24, 10), quote: '(The cavern shakes as it inhales.)',
    drops: ['dodongoFang', 'dodongoArmor', 'dodongoShield', 'goronRuby'] }),
  b({ id: 'barinade', name: 'Barinade', title: 'Bio-Electric Anemone', home: 'zorasDomain', race: 'monster', classId: 'monsterBoss', size: 3, ai: 'stationary',
    weapons: ['bossBeam'], glyph: 'BA', stats: st(44, 6, 9, 5, 9, 20, 0, 13, 10, 2, 20, 20), quote: '(Crackling tentacles anchor it to the ceiling.)',
    drops: ['zoraSapphire'] }),
  b({ id: 'phantomGanon', name: 'Phantom Ganon', title: 'Evil Spirit from Beyond', home: 'lostWoods', race: 'phantom', classId: 'phantomKnight', size: 1,
    weapons: ['pgTrident'], glyph: 'PG', skill: 'spectralPassage', stats: st(28, 9, 10, 11, 7, 9, 7, 11, 9, 3, 16, 20),
    quote: 'You are nothing but a phantom yourself, boy.', drops: ['pgTrident', 'pgMask', 'forestMedallion'] }),
  b({ id: 'phantomGanonMounted', name: 'Phantom Ganon', title: 'Rider of the Painting', home: 'hyruleField', race: 'phantom', classId: 'phantomKnight', size: 2,
    weapons: ['pgTrident'], glyph: 'PG', skill: 'spectralPassage', stats: st(28, 9, 10, 11, 7, 9, 9, 11, 9, 3, 16, 20),
    quote: '(A spectral horse bursts out of the painting.)', drops: ['pgTrident', 'phantomHorse'] }),
  b({ id: 'volvagia', name: 'Volvagia', title: 'Subterranean Lava Dragon', home: 'deathMountain', race: 'demon', classId: 'dragon', size: 4,
    weapons: ['fireBreath', 'bossClaws'], glyph: 'VO', stats: st(48, 13, 9, 10, 10, 24, 6, 12, 8, 3, 24, 20), quote: '(The lava erupts. Something enormous rises with it.)',
    drops: ['volvagiaCrown', 'volvagiaArmor', 'fireMedallion'] }),
  b({ id: 'morpha', name: 'Morpha', title: 'Giant Aquatic Amoeba', home: 'zorasDomain', race: 'aquatic', classId: 'monsterBoss', size: 3,
    weapons: ['bossClaws'], glyph: 'MO', stats: st(46, 12, 8, 7, 8, 18, 5, 10, 12, 2, 20, 20), quote: '(The water itself reaches for you.)',
    drops: ['morphaArmor', 'waterMedallion'] }),
  b({ id: 'darkLink', name: 'Dark Link', title: 'Shadow Swordsman', home: 'zorasDomain', race: 'shadow', classId: 'shadowSwordsman', size: 1,
    weapons: ['darkMasterSword'], glyph: 'DL', skill: 'darkReflection', stats: st(24, 8, 10, 12, 6, 9, 5, 3, 7, 5, 18, 8),
    quote: '(It moves exactly as you do.)', drops: ['darkMasterSword', 'shadowTunic'] }),
  b({ id: 'bongoBongo', name: 'Bongo Bongo', title: 'Phantom Shadow Beast', home: 'kakarikoGraveyard', race: 'demon', classId: 'monsterBoss', size: 5,
    weapons: ['bossClaws'], glyph: 'BB', stats: st(60, 15, 9, 6, 11, 26, 4, 10, 9, 2, 24, 20), quote: '(Drums pound in the dark.)',
    drops: ['bongoEye', 'bongoGrasp', 'shadowMedallion'] }),
  b({ id: 'koume', name: 'Koume', title: 'Witch of Flame', home: 'gerudoDesert', race: 'gerudo', classId: 'fireWitch', size: 1,
    weapons: ['koumeBroom'], glyph: 'KO', skill: 'witchOfFlame', stats: st(19, 2, 10, 8, 3, 4, 6, 14, 11, 5, 8, 26), quote: 'Kotake! Look at this whelp!' }),
  b({ id: 'kotake', name: 'Kotake', title: 'Witch of Ice', home: 'gerudoDesert', race: 'gerudo', classId: 'iceWitch', size: 1,
    weapons: ['kotakeBroom'], glyph: 'KT', skill: 'witchOfIce', stats: st(19, 2, 10, 8, 3, 4, 6, 14, 11, 5, 8, 26), quote: 'Koume, let us freeze them solid!' }),
  b({ id: 'twinrova', name: 'Twinrova', title: 'Sorceress Sisters', home: 'gerudoDesert', race: 'gerudo', classId: 'elementalSorceress', size: 2,
    weapons: ['twinrovaScepter'], glyph: 'TW', skill: 'combinedSorcery', stats: st(38, 4, 14, 12, 7, 9, 7, 19, 15, 7, 14, 40),
    quote: 'Double Dynamite Attack!', drops: ['twinrovaScepter', 'twinrovaRobes', 'twinrovaGem', 'spiritMedallion'] }),
  b({ id: 'ironKnuckleNabooru', name: 'Iron Knuckle', title: 'Enslaved Warrior', home: 'gerudoDesert', race: 'gerudo', classId: 'ironKnuckle', size: 2,
    weapons: ['ironKnuckleAxe'], glyph: 'IK', skill: 'enslavedWarrior', stats: st(34, 14, 8, 4, 15, 17, 4, 2, 6, 3, 24, 4),
    quote: '(The armor’s visor hides a familiar face.)', drops: ['ironKnuckleAxe'] }),
  b({ id: 'ganondorfBoss', name: 'Ganondorf', title: 'Great King of Evil', home: 'hyruleCastle', race: 'gerudo', classId: 'darkKing', size: 1,
    weapons: ['darkOrb', 'giantsKnife'], glyph: 'GA', skill: 'spiritOfPower', stats: st(30, 13, 8, 7, 10, 14, 5, 12, 9, 4, 20, 20),
    quote: 'The Triforce shall be mine!', drops: ['darkOrb', 'ganondorfArmor', 'triforcePower'] }),
  b({ id: 'ganon', name: 'Ganon', title: 'Demon King', home: 'hyruleCastle', race: 'demon', classId: 'demonBeast', size: 3,
    weapons: ['ganonBlades'], glyph: 'GN', skill: 'demonicFury', stats: st(60, 20, 9, 6, 16, 28, 5, 10, 12, 3, 30, 20),
    quote: '(A roar that shakes the castle to its foundations.)', drops: ['ganonBlades', 'ganonHorn', 'masterSword'] }),
];

/** Boss pools per region. The first is used for the regional boss; elites draw from all. */
export const REGION_BOSSES: Record<string, string[]> = {
  hyruleField: ['phantomGanonMounted', 'ironKnuckleNabooru'],
  kokiriForest: ['queenGohma'],
  lostWoods: ['phantomGanon'],
  deathMountain: ['kingDodongo', 'volvagia'],
  zorasDomain: ['barinade', 'morpha', 'darkLink'],
  gerudoDesert: ['twinrova', 'ironKnuckleNabooru', 'koume', 'kotake'],
  kakarikoGraveyard: ['bongoBongo'],
  hyruleCastle: ['ganondorfBoss', 'ganon'],
};
