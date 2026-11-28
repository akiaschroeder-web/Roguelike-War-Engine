import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 3's six monsters (the Biri is a Micro unit). Colour variants of Bari, Biri and Rupee Like share these
// entries; Yuga's ordinary forces are the returning monsters of the earlier packs.
export const ENEMIES: EnemyArchetype[] = [
  e('rupeeLike', 'Rupee Like', 'rupeeLikeClass', 'monster', ['rupeeLikeSwallow'], st(26, 10, 4, 7, 4, 9, 12, 18, 12, 3, 20, 15), { skill: 'greedySwallow', glyph: 'RL' }),
  e('bari', 'Bari', 'bariClass', 'monster', ['bariShock'], st(22, 7, 16, 10, 12, 5, 13, 5, 5, 6, 18, 35), { skill: 'electricalMembrane', glyph: 'BA' }),
  e('biri', 'Biri', 'biriClass', 'monster', ['biriZap'], st(10, 3, 9, 8, 16, 2, 7, 4, 1, 6, 12, 20), { size: 0, skill: 'tinyConductor', glyph: 'bi' }),
  e('gimos', 'Gimos', 'gimosClass', 'construct', ['gimosFireCore', 'gimosIceCore'], st(30, 13, 17, 12, 6, 17, 12, 4, 16, 4, 25, 35), { skill: 'elementalConstruct', glyph: 'GI' }),
  e('pengator', 'Pengator', 'pengatorClass', 'monster', ['pengatorSlide'], st(24, 12, 2, 11, 17, 7, 9, 6, 7, 6, 30, 8), { skill: 'slidingAssault', glyph: 'PG' }),
  e('devalant', 'Devalant', 'devalantClass', 'monster', ['devalantPincers'], st(28, 14, 3, 12, 13, 10, 6, 5, 9, 6, 30, 10), { skill: 'sandHunter', glyph: 'DV' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  // Yuga as a boss (Eastern Palace and Hyrule Castle): a form of the recruitable Yuga (bossAsTemplate).
  b({ id: 'yugaBoss', name: 'Yuga', title: 'Painting Sorcerer', home: 'easternPalaceLB', race: 'lorulean', classId: 'paintingSorcerer', size: 1, glyph: 'YU',
    weapons: ['yugaPaintSplash'], skill: 'livingPortrait', abilities: ['wallMerge', 'yugaPaintStorm'],
    stats: st(46, 6, 26, 21, 15, 9, 24, 7, 7, 6, 22, 85),
    quote: '"Ah, the hero. What a dreary subject. Hold still — I shall make you into something worth looking at."', drops: ['yugasRobes'] }),
  b({ id: 'margomill', name: 'Margomill', title: 'Wind Guardian', home: 'houseOfGales', race: 'construct', classId: 'windGuardian', size: 3, glyph: 'MG',
    weapons: ['margomillBlades', 'margomillGale'], skill: 'layeredBody', abilities: ['windBlast', 'rotatingDefense', 'segmentRegeneration', 'spinningCharge'],
    stats: st(80, 20, 24, 15, 12, 24, 18, 5, 30, 6, 40, 50),
    quote: '(A spinning tower of stone rings rises in the House of Gales. Wind howls between its segments.)', drops: ['tornadoRod'] }),
  b({ id: 'gemesaurKing', name: 'Gemesaur King', title: 'Gemstone Beast', home: 'darkPalaceLB', race: 'monster', classId: 'gemstoneBeast', size: 4, glyph: 'GK',
    weapons: ['gemesaurBite', 'gemesaurBarrageShot'], skill: 'gemstoneArmor', abilities: ['gemstoneBarrage', 'crushingCharge', 'tailSweepLB', 'gemstoneRegrowth'],
    stats: st(110, 30, 12, 14, 11, 35, 16, 12, 40, 5, 50, 25),
    quote: '(In the dark of the Dark Palace a great beast lifts its head: its mask is a crust of glittering gems.)', drops: ['gemesaurMask'] }),
  b({ id: 'knucklemaster', name: 'Knucklemaster', title: 'Giant Hand', home: 'skullWoodsLB', race: 'undead', classId: 'giantHand', size: 3, glyph: 'KM',
    weapons: ['knucklemasterFist'], skill: 'crushingPalm', abilities: ['crushingFist', 'graspHand', 'sweepingPalm', 'wallCrush'],
    stats: st(85, 32, 5, 19, 17, 20, 14, 4, 30, 7, 50, 15),
    quote: '(A gigantic hand drops from the ceiling of Skull Woods. In its palm, an eye opens.)', drops: ['titansMitt'] }),
  b({ id: 'stalblind', name: 'Stalblind', title: 'Undead Guardian', home: 'thievesHideout', race: 'undead', classId: 'undeadGuardian', size: 2, glyph: 'SB',
    weapons: ['stalblindSword', 'stalblindBreath'], skill: 'headlessWarrior', abilities: ['shieldedSlash', 'spectralBreath', 'detachHead', 'undeadReassembly'],
    stats: st(75, 27, 18, 24, 14, 24, 20, 5, 22, 6, 45, 45),
    quote: '(A skeletal knight with a sword and shield waits in the Thieves\' Hideout. Its head floats beside it, grinning.)', drops: ['stalblindsShield'] }),
  b({ id: 'zaganaga', name: 'Zaganaga', title: 'Desert Plant', home: 'desertPalaceLB', race: 'monster', classId: 'desertPlant', size: 3, glyph: 'ZG', ai: 'stationary',
    weapons: ['zaganagaVines', 'zaganagaSeeds'], skill: 'rootedAmbush', abilities: ['sandBurrow', 'spikedSeedBarrage', 'rootGrasp', 'sandstormLB'],
    stats: st(85, 18, 26, 16, 8, 20, 24, 5, 30, 5, 35, 60),
    quote: '(The sand of the Desert Palace bulges. A flower the size of a house opens its petals and spits seeds.)', drops: ['sandRod'] }),
  b({ id: 'dharkstare', name: 'Dharkstare', title: 'Frozen Eye Demon', home: 'iceRuins', race: 'demon', classId: 'frozenEyeDemon', size: 3, glyph: 'DH',
    weapons: ['dharkstareBeam', 'dharkstareTendrils'], skill: 'frozenShell', abilities: ['iceBeamLB', 'frozenPrisonLB', 'blizzardField', 'iceShellRegeneration'],
    stats: st(90, 15, 34, 18, 13, 22, 30, 5, 30, 6, 30, 80),
    quote: '(At the bottom of the Ice Ruins, an eye inside a shell of ice turns towards you.)', drops: ['dharkstaresEye'] }),
  b({ id: 'grinexx', name: 'Grinexx', title: 'Volcanic Turtle', home: 'turtleRockLB', race: 'fireCreature', classId: 'volcanicTurtle', size: 4, glyph: 'GX',
    weapons: ['grinexxShellSlam', 'grinexxGeyser'], skill: 'lavaDweller', abilities: ['lavaGeyser', 'shellSlam', 'lavaSubmerge', 'volcanicEruptionLB'],
    stats: st(115, 32, 27, 15, 7, 34, 24, 4, 42, 4, 50, 65),
    quote: '(Turtle Rock\'s lava heaves. A turtle with a volcano for a shell surfaces — and sinks again.)', drops: ['grinexxShellArmor'] }),
  b({ id: 'yugaGanon', name: 'Yuga Ganon', title: 'Painting Demon King', home: 'loruleCastle', race: 'demon', classId: 'paintingDemonKing', size: 3, glyph: 'YG',
    weapons: ['yugaGanonsTrident', 'yugaGanonBolts'], skill: 'fusionOfPower', abilities: ['lightningBarrage', 'paintingPrison', 'darkWorldMerge', 'reflectedEnergy', 'triforceCataclysm'],
    stats: st(130, 36, 40, 25, 17, 30, 35, 8, 40, 7, 55, 100),
    quote: '"Behold! The Demon King\'s strength in an artist\'s hands. Hyrule and Lorule will both make lovely paintings."', drops: ['yugaGanonsTrident', 'yugasPortrait'] }),
  // ── Minibosses ──
  b({ id: 'heedle', name: 'Heedle', title: 'Cyclone Swarm', home: 'kakarikoLB', race: 'monster', classId: 'cycloneSwarm', size: 2, glyph: 'HD',
    weapons: ['heedleFlame'], skill: 'cycloneSwarm',
    stats: st(40, 12, 20, 14, 17, 10, 15, 5, 12, 7, 25, 40),
    quote: '(A burning, glittering insect hovers over the field, and little cyclones spin up wherever it looks.)', drops: ['hintGlasses'] }),
  b({ id: 'gigabari', name: 'Gigabari', title: 'Electrical Division', home: 'thievesTown', race: 'monster', classId: 'electricDivision', size: 3, glyph: 'GB',
    weapons: ['gigabariShock'], skill: 'electricalDivision',
    stats: st(65, 16, 26, 13, 9, 18, 22, 4, 28, 5, 30, 55),
    quote: '(A great yellow jellyfish fills the corridor, humming. Little Bari bob inside it like fruit in jelly.)', drops: ['blueMail'] }),
  b({ id: 'bigPengator', name: 'Big Pengator', title: 'Ice Commander', home: 'iceRuins', race: 'monster', classId: 'iceCommander', size: 2, glyph: 'BP',
    weapons: ['bigPengatorCharge'], skill: 'iceCommander', abilities: ['slidingCharge'],
    stats: st(46, 22, 5, 14, 14, 17, 12, 6, 22, 6, 40, 15),
    quote: '(A Pengator twice the size of the others honks an order, and the whole flock slides at you on its belly.)', drops: ['iceRod'] }),
];

/** Each region's bosses (the doc's placements; minibosses where it leaves a region open). */
export const ROUTE_BOSSES: Record<string, string[]> = {
  kakarikoLB: ['heedle'], easternPalaceLB: ['yugaBoss'], houseOfGales: ['margomill'], towerOfHeraLB: ['moldormBoss'], sanctuaryLB: ['darkLink'],
  hyruleCastleLB: ['yugaBoss'], thievesTown: ['gigabari'], thievesHideout: ['stalblind'], darkPalaceLB: ['gemesaurKing'], swampPalaceLB: ['arrghus'],
  skullWoodsLB: ['knucklemaster'], desertPalaceLB: ['zaganaga'], iceRuins: ['dharkstare'], turtleRockLB: ['grinexx'],
  treacherousTower: ['helmasaurKing', 'blind'], loruleCastle: ['yugaBoss'],
};
/** Regions whose boss node brings every listed boss at once (all must fall). */
export const PAIRED_LB_REGIONS = ['treacherousTower'];
/** Lorule Castle: Yuga fuses with Ganon instead of falling (Fusion of Power). */
export const YUGA_FUSION: Record<string, string> = { yugaBoss: 'yugaGanon' };

// Boss pools (other campaigns, the Random campaign and the free-for-all).
export const REGION_BOSSES: Record<string, string[]> = {
  kakarikoLB: ['heedle'], easternPalaceLB: ['yugaBoss'], houseOfGales: ['margomill'], towerOfHeraLB: ['heedle', 'gigabari'], sanctuaryLB: ['gigabari', 'heedle'],
  hyruleCastleLB: ['yugaBoss'], thievesTown: ['gigabari'], thievesHideout: ['stalblind'], darkPalaceLB: ['gemesaurKing'], swampPalaceLB: ['gigabari'],
  skullWoodsLB: ['knucklemaster'], desertPalaceLB: ['zaganaga'], iceRuins: ['dharkstare', 'bigPengator'], turtleRockLB: ['grinexx'],
  treacherousTower: ['bigPengator', 'heedle', 'gigabari'], loruleCastle: ['yugaGanon', 'yugaBoss'],
};

// Regional rosters: the new monsters with the returning ones (River Zora join from engine/riverzora content).
export const ROSTERS: Record<string, string[]> = {
  kakarikoLB: ['octorok', 'keese', 'octorok', 'rope', 'chuchuGreen', 'tektite'],
  easternPalaceLB: ['stalfos', 'keese', 'gel', 'zol', 'antiFairy', 'goriya', 'buzzBlob'],
  houseOfGales: ['keese', 'goriya', 'stalfos', 'rope', 'antiFairy', 'bari'],
  towerOfHeraLB: ['moldorm', 'tektite', 'keese', 'goriya', 'bari', 'antiFairy'],
  sanctuaryLB: ['gibdo', 'stalfos', 'wallmaster', 'keese', 'zol'],
  hyruleCastleLB: ['ballChainSoldier', 'darknut', 'wizzrobe', 'moblin', 'keese', 'armosKnight'],
  thievesTown: ['rope', 'rupeeLike', 'keese', 'moblin', 'buzzBlob', 'octorok'],
  thievesHideout: ['rupeeLike', 'gibdo', 'stalfos', 'keese', 'wallmaster', 'bari'],
  darkPalaceLB: ['gimos', 'keese', 'gibdo', 'wizzrobe', 'antiFairy', 'stalfos'],
  swampPalaceLB: ['bari', 'biri', 'zol', 'octorok', 'likeLike', 'keese'],
  skullWoodsLB: ['gibdo', 'stalfos', 'wallmaster', 'moblin', 'keese', 'likeLike'],
  desertPalaceLB: ['devalant', 'gibdo', 'moldorm', 'tektite', 'keese', 'gimos'],
  iceRuins: ['pengator', 'pengator', 'chuchuIce', 'keese', 'stalfos', 'gimos'],
  turtleRockLB: ['fireKeese', 'chuchuRed', 'gimos', 'moldorm', 'hinox', 'stalfos'],
  treacherousTower: ['lynel', 'darknut', 'hinox', 'moblin', 'gimos', 'wizzrobe'],
  loruleCastle: ['ballChainSoldier', 'darknut', 'lynel', 'gimos', 'wizzrobe', 'stalfos', 'eyegore'],
};

/** Monster spoils (on defeat, now and then): the doc's materials to the quest bag. */
export const LB_SPOILS: Record<string, string> = {
  rupeeLike: 'rupeeLikeGel', bari: 'bariMembrane', biri: 'biriSpark', gimos: 'gimosCore', pengator: 'pengatorFeather', devalant: 'devalantClaw',
  margomill: 'margomillSegment', gemesaurKing: 'gemesaurGemstone', knucklemaster: 'knucklemasterEye', stalblind: 'stalblindSkull', zaganaga: 'zaganagaRoot',
  dharkstare: 'dharkstareIceCrystal', grinexx: 'grinexxMoltenShell', yugaGanon: 'yugasMagicPaint', yugaBoss: 'yugasMagicPaint',
  // The Wild era's monster horns, fangs and tails (returning materials).
  moblin: 'moblinFang', lynel: 'monsterHorn', hinox: 'monsterHorn', darknut: 'moblinFang', moldorm: 'lizalfosTail', stalfos: 'monsterHorn',
};
