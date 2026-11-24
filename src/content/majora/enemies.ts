import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';

const st = (
  hp: number, str: number, skl: number, spd: number, def: number, con: number, mov: number,
  mag: number, res: number, lck: number, sta: number, mp: number,
): Stats => ({ hp, str, skl, spd, def, con, mov, mag, res, lck, sta, mp });

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Monsters and minibosses from the design doc (all recruitable).
export const ENEMIES: EnemyArchetype[] = [
  e('wart', 'Wart', 'bubbleMonster', 'aquatic', ['wartBubbles'], st(40, 8, 7, 4, 8, 18, 4, 10, 10, 4, 18, 22), { size: 3, skill: 'bubbleShield', glyph: 'WA' }),
  e('gomess', 'Gomess', 'swarmReaper', 'undead', ['gomessScythe'], st(35, 14, 11, 9, 10, 14, 5, 12, 13, 3, 22, 24), { size: 2, skill: 'batSwarm', glyph: 'GO' }),
  e('gekko', 'Gekko', 'amphibianFighter', 'monster', ['gekkoFists'], st(24, 8, 9, 11, 5, 7, 5, 4, 5, 6, 16, 8), { skill: 'snapperRider', glyph: 'GK' }),
  e('snapper', 'Snapper', 'armoredBeast', 'monster', ['snapperShell'], st(30, 10, 5, 5, 14, 14, 4, 0, 4, 5, 20, 0), { size: 2, skill: 'spinningShell', glyph: 'SN' }),
  e('deathArmos', 'Death Armos', 'ancientConstruct', 'construct', ['armosDive'], st(34, 13, 6, 7, 15, 16, 5, 7, 8, 2, 20, 14), { size: 2, skill: 'ancientDive', glyph: 'DA' }),
  e('eyegore', 'Eyegore', 'ancientConstruct', 'construct', ['eyegoreBeam', 'armosDive'], st(40, 14, 11, 3, 17, 20, 3, 12, 9, 2, 20, 24), { size: 2, skill: 'piercingGaze', glyph: 'EY' }),
  e('deepPython', 'Deep Python', 'aquaticSerpent', 'aquatic', ['pythonBite'], st(38, 13, 9, 8, 8, 18, 5, 3, 5, 4, 25, 6), { size: 3, skill: 'constrict', glyph: 'DP' }),
  e('hiploop', 'Hiploop', 'armoredBeast', 'monster', ['hiploopCharge'], st(25, 9, 6, 8, 10, 9, 5, 0, 3, 4, 18, 0), { skill: 'frontalMask', glyph: 'HI' }),
  e('bioDekuBaba', 'Bio Deku Baba', 'aquaticPlant', 'aquatic', ['babaSnap'], st(20, 8, 6, 5, 4, 5, 4, 3, 4, 5, 12, 6), { skill: 'detachedStem', glyph: 'BB' }),
  e('giantTurtle', 'Giant Turtle', 'aquaticTransport', 'aquatic', ['turtleBite'], st(60, 10, 4, 3, 22, 30, 4, 5, 12, 8, 35, 15), { size: 4, skill: 'livingIsland', glyph: 'GT' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  b({ id: 'odolwa', name: 'Odolwa', title: 'Masked Jungle Warrior', home: 'woodfall', race: 'monster', classId: 'jungleChampion', size: 3, glyph: 'OD',
    weapons: ['odolwaSword'], skill: 'jungleRitual', stats: st(48, 16, 12, 10, 10, 22, 5, 9, 8, 6, 28, 18),
    quote: '(He dances, blade raised, as insects swarm around him.)', drops: ['odolwaRemains', 'odolwaShield', 'odolwaAnklets', 'odolwaGreatblade'] }),
  b({ id: 'goht', name: 'Goht', title: 'Masked Mechanical Monster', home: 'snowhead', race: 'construct', classId: 'mechanicalCharger', size: 4, glyph: 'GH',
    weapons: ['gohtHorns', 'gohtLightningHorn'], skill: 'runawayMachine', stats: st(58, 18, 8, 12, 16, 28, 7, 12, 8, 3, 35, 24),
    quote: '(Gears grind. It paws the frozen ground.)', drops: ['gohtRemains', 'gohtPlating', 'gohtHooves', 'gohtLightningHorn'] }),
  b({ id: 'gyorg', name: 'Gyorg', title: 'Gargantuan Masked Fish', home: 'greatBay', race: 'aquatic', classId: 'aquaticBehemoth', size: 4, glyph: 'GY',
    weapons: ['gyorgJaws'], skill: 'predatorOfTheDeep', stats: st(54, 17, 10, 13, 10, 25, 7, 5, 7, 4, 30, 12),
    quote: '(A shadow circles beneath the platform.)', drops: ['gyorgRemains'] }),
  b({ id: 'redTwinmold', name: 'Red Twinmold', title: 'Giant Masked Insect', home: 'ikana', race: 'monster', classId: 'desertColossus', size: 5, glyph: 'RT',
    weapons: ['twinmoldMandibles'], skill: 'burrowingTerror', stats: st(70, 21, 8, 6, 15, 32, 5, 8, 10, 3, 36, 20),
    quote: '(The sand erupts.)', drops: ['twinmoldRemains', 'twinmoldCarapace'] }),
  b({ id: 'blueTwinmold', name: 'Blue Twinmold', title: 'Giant Masked Insect', home: 'ikana', race: 'monster', classId: 'flyingColossus', size: 5, glyph: 'BT',
    weapons: ['twinmoldFire', 'twinmoldMandibles'], skill: 'desertFlight', stats: st(60, 16, 10, 9, 12, 28, 7, 14, 12, 4, 30, 28),
    quote: '(It coils through the sky, spitting fire.)', drops: ['twinmoldRemains', 'twinmoldCarapace'] }),
  b({ id: 'majorasMask', name: "Majora's Mask", title: 'Cursed Artifact', home: 'moon', race: 'demon', classId: 'cursedArtifact', size: 2, glyph: 'MM',
    weapons: ['majoraSpin', 'majoraTendrils'], skill: 'cursedRotation', abilities: ['majoraIncarnate'], stats: st(34, 5, 13, 12, 8, 8, 7, 18, 16, 8, 15, 40),
    quote: '"…You\'ve met with a terrible fate, haven\'t you?"', drops: ['majorasMaskGear', 'majorasEye', 'moonFragment'] }),
  b({ id: 'majorasIncarnation', name: "Majora's Incarnation", title: 'Chaotic Demon', home: 'moon', race: 'demon', classId: 'chaoticDemon', size: 2, glyph: 'MI',
    weapons: ['majoraKick'], skill: 'frenziedMovement', abilities: ['majoraWrath'], stats: st(38, 10, 14, 20, 6, 10, 9, 14, 12, 10, 28, 35),
    quote: '(It dances, giggling, faster than the eye can follow.)', drops: ['majorasEye'] }),
  b({ id: 'majorasWrath', name: "Majora's Wrath", title: 'Demonic Deity', home: 'moon', race: 'demon', classId: 'demonicDeity', size: 3, glyph: 'MW',
    weapons: ['majoraWhips', 'majoraTendrils'], skill: 'wrathfulReach', stats: st(48, 17, 16, 15, 11, 15, 7, 20, 16, 6, 30, 40),
    quote: '(Whips crack across the field.)', drops: ['moonFragment', 'majorasEye'] }),
  // Characters who also serve as regional bosses (recruited through their own templates).
  b({ id: 'skullKidBoss', name: 'Skull Kid', title: 'Wearer of the Mask', home: 'clockTown', race: 'spirit', classId: 'forestTrickster', size: 1, glyph: 'SK',
    weapons: ['skullKidMagic'], skill: 'mischief', stats: st(26, 6, 13, 15, 5, 6, 7, 15, 12, 9, 14, 30),
    quote: '"Hee hee! You can\'t stop the Moon!"', drops: ['skullKidFlute', 'stoneMask'] }),
  b({ id: 'keetaBoss', name: 'Captain Keeta', title: 'Undead Captain', home: 'terminaField', race: 'undead', classId: 'undeadCaptain', size: 3, glyph: 'CK',
    weapons: ['keetaGreatsword'], skill: 'captainsOrders', stats: st(44, 15, 9, 5, 12, 22, 4, 5, 8, 5, 26, 12),
    quote: '(The giant skeleton raises its blade.)', drops: ['captainsHat', 'keetaGreatsword'] }),
  b({ id: 'igosBoss', name: 'Igos du Ikana', title: 'Fallen King', home: 'ikana', race: 'undead', classId: 'fallenKing', size: 2, glyph: 'IG',
    weapons: ['ikanaRoyalSword'], skill: 'undyingKingdom', stats: st(36, 13, 12, 8, 10, 14, 5, 9, 11, 6, 22, 20),
    quote: '"Ikana will never fall!"', drops: ['ikanaRoyalCrown', 'ikanaRoyalArmor', 'ikanaRoyalSword'] }),
];

export const ROSTERS: Record<string, string[]> = {
  clockTown: ['stalchild', 'keese', 'dekuScrub', 'hiploop', 'octorok'],
  terminaField: ['octorok', 'peahat', 'leever', 'wolfos', 'keese', 'gekko', 'bioDekuBaba'],
  woodfall: ['dekuBaba', 'bioDekuBaba', 'dekuScrub', 'snapper', 'octorok', 'skulltula', 'gekko', 'hiploop'],
  snowhead: ['wolfos', 'iceKeese', 'tektite', 'gekko', 'likeLike', 'dodongo'],
  greatBay: ['likeLike', 'shellBlade', 'octorok', 'deepPython', 'bioDekuBaba', 'wart', 'gekko', 'stinger'],
  ikana: ['redead', 'gibdo', 'stalchild', 'stalfos', 'poe', 'deathArmos', 'eyegore', 'wallmaster', 'gomess'],
  moon: ['wart', 'gomess', 'gekko', 'snapper', 'deathArmos', 'eyegore', 'deepPython', 'hiploop', 'redead', 'likeLike'],
};

export const REGION_BOSSES: Record<string, string[]> = {
  clockTown: ['skullKidBoss'],
  terminaField: ['keetaBoss'],
  woodfall: ['odolwa'],
  snowhead: ['goht'],
  greatBay: ['gyorg'],
  ikana: ['igosBoss', 'redTwinmold', 'blueTwinmold'],
  moon: ['majorasMask'],
};
