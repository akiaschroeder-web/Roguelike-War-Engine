import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// New monsters (section 3; all recruitable). Octoroks, Moblins, Darknuts, Stalfos, Like Likes,
// Wallmasters, Keese, Leevers, Tektites, Peahats, Armos (the Armos Knight), Bubbles, Dodongos,
// Moldorms and Gibdos are the existing entries. There is no Wizzrobe unit yet.
export const ENEMIES: EnemyArchetype[] = [
  e('goriya', 'Goriya', 'boomerangFighter', 'monster', ['goriyaBoomerang'], st(24, 9, 0, 13, 10, 6, 4, 5, 7, 5, 22, 0), { skill: 'returningStrike', glyph: 'GO' }),
  e('rope', 'Rope', 'serpent', 'monster', ['ropeFangs'], st(15, 7, 0, 8, 14, 2, 3, 4, 3, 7, 18, 0), { skill: 'suddenCharge', glyph: 'RP' }),
  e('zol', 'Zol', 'dividingSlime', 'chuchu', ['slimeSlam'], st(20, 6, 2, 5, 5, 5, 4, 4, 5, 4, 14, 4), { skill: 'division', glyph: 'ZO' }),
  e('gel', 'Gel', 'lesserSlime', 'chuchu', ['stickyBody'], st(8, 3, 0, 4, 7, 1, 2, 3, 2, 4, 8, 0), { skill: 'clingingBody', glyph: 'GE' }),
  e('vire', 'Vire', 'wingedDemon', 'demon', ['vireClaws', 'vireFireball'], st(28, 10, 7, 10, 13, 6, 8, 5, 6, 7, 24, 16), { skill: 'batDivision', glyph: 'VI' }),
  e('polsVoice', 'Pols Voice', 'leapingBeast', 'monster', ['polsLeap'], st(22, 8, 5, 7, 14, 10, 3, 6, 5, 7, 22, 10), { skill: 'sensitiveHearing', glyph: 'PV' }),
  e('ghini', 'Ghini', 'graveyardSpirit', 'phantom', ['spectralTouch'], st(24, 4, 12, 9, 8, 3, 13, 5, 3, 6, 14, 25), { skill: 'graveyardHaunting', glyph: 'GH' }),
  e('lanmola', 'Lanmola', 'segmentedCrawler', 'monster', ['lanmolaMandibles'], st(38, 13, 0, 9, 15, 10, 5, 4, 15, 8, 30, 0), { size: 2, skill: 'segmentedBody', glyph: 'LA' }),
  e('patra', 'Patra', 'swarmController', 'monster', ['patrasEye', 'patraOrbit'], st(55, 12, 19, 15, 14, 12, 17, 5, 18, 7, 28, 40), { size: 3, skill: 'orbitalDefense', glyph: 'PA' }),
  e('lesserDigdogger', 'Lesser Digdogger', 'fragmentedEye', 'monster', ['lesserDigdoggerBody'], st(20, 8, 2, 8, 14, 5, 4, 4, 5, 7, 18, 4), { skill: 'erraticMovement', glyph: 'LD' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  // ── New bosses (section 4; all recruitable) ──
  b({ id: 'aquamentus', name: 'Aquamentus', title: 'Unicorn Dragon', home: 'level1Eagle', race: 'monster', classId: 'unicornDragon', size: 3, glyph: 'AQ',
    weapons: ['aquamentusFireball', 'aquamentusHornNatural'], skill: 'tripleFireballSkill', abilities: ['dragonGuard'], stats: st(65, 17, 22, 12, 7, 15, 14, 5, 28, 5, 32, 45),
    quote: '(A green dragon with a unicorn\'s horn plants its feet at the end of the room. Three fireballs come at once.)', drops: ['aquamentusHorn', 'magicalShield'] }),
  b({ id: 'manhandla', name: 'Manhandla', title: 'Four-Headed Plant', home: 'level3Manji', race: 'monster', classId: 'fourHeadedPlant', size: 3, glyph: 'MH',
    weapons: ['manhandlaJaws', 'manhandlaSeeds'], skill: 'frenziedGrowth', stats: st(70, 19, 10, 10, 6, 14, 9, 4, 30, 4, 35, 20),
    quote: '(Four snapping flower heads around one bulb. Cut one off and the rest move faster.)', drops: ['manhandlaFang', 'blueRing'] }),
  b({ id: 'digdogger', name: 'Digdogger', title: 'Giant Eye Monster', home: 'level5Lizard', race: 'monster', classId: 'giantEyeMonster', size: 4, glyph: 'DD',
    weapons: ['digdoggerBody'], skill: 'resonantWeakness', abilities: ['fragmentation'], stats: st(85, 22, 5, 7, 8, 20, 10, 3, 38, 5, 40, 10),
    quote: '(A great spiked eye rolls across the floor. Swords bounce off it. Somewhere, a recorder would help.)', drops: ['recorder', 'redCandle'] }),
  // ── Region leaders: forms of recruitable units (bossAsTemplate) ──
  b({ id: 'dodongoBoss', name: 'Dodongo', title: 'Bomb-Eating Beast', home: 'level2Moon', race: 'monster', classId: 'beast', size: 2, glyph: 'DO',
    weapons: ['bite', 'dodongoFlame'], skill: 'explosiveAppetite', stats: st(50, 16, 6, 8, 6, 14, 6, 3, 22, 4, 30, 10),
    quote: '(A rhinoceros-sized lizard lumbers out, mouth open wide. It looks like it would eat anything. Even a bomb.)', drops: ['stepladder', 'dodongoShield'] }),
  b({ id: 'ganonBoss', name: 'Ganon', title: 'Prince of Darkness', home: 'level9DeathMountain', race: 'demon', classId: 'invisibleSorcerer', size: 2, glyph: 'GN',
    weapons: ['ganonsTrident', 'darkFireballs'], skill: 'invisibleDarkness', abilities: ['darkTeleport'], stats: st(70, 21, 28, 17, 15, 18, 23, 4, 21, 7, 38, 60),
    quote: '(Laughter from nowhere. The room is empty — and then it isn\'t.)', drops: ['magicalSword', 'redRing'] }),
];

/** The classic Gleeok (Levels 4 and 8) is the Flame Gleeok from the Era of the Wild pack. Until that
 *  pack is merged, Volvagia stands in; the boss choice in originalRun.ts prefers gleeokFlame when it exists. */
export const GLEEOK = 'gleeokFlame';
export const GLEEOK_STAND_IN = 'volvagia';

export const ROSTERS: Record<string, string[]> = {
  level1Eagle: ['keese', 'keese', 'stalfos', 'gel', 'gel', 'goriya', 'wallmaster', 'octorok'],
  level2Moon: ['rope', 'rope', 'goriya', 'gel', 'keese', 'moldorm', 'tektite', 'octorok'],
  level3Manji: ['zol', 'zol', 'gel', 'darknut', 'keese', 'redBubble', 'tektite', 'peahat'],
  level4Snake: ['vire', 'vire', 'zol', 'gel', 'likeLike', 'keese', 'blueBubble', 'moblin'],
  level5Lizard: ['polsVoice', 'polsVoice', 'gibdo', 'darknut', 'zol', 'redBubble', 'leever', 'ghini'],
  level6Dragon: ['ghini', 'vire', 'likeLike', 'zol', 'gel', 'wallmaster', 'keese', 'blueBubble'],
  level7Demon: ['goriya', 'goriya', 'rope', 'moldorm', 'wallmaster', 'dodongo', 'lanmola', 'polsVoice'],
  level8Lion: ['darknut', 'darknut', 'polsVoice', 'gibdo', 'vire', 'lanmola', 'likeLike', 'armosKnight'],
  level9DeathMountain: ['patra', 'lanmola', 'darknut', 'wallmaster', 'likeLike', 'vire', 'polsVoice', 'zol', 'blueBubble', 'redBubble', 'lesserDigdogger'],
};

/** First Quest bosses, one per Level (Death Mountain: Ganon). */
export const LEVEL_BOSSES: Record<string, string> = {
  level1Eagle: 'aquamentus', level2Moon: 'dodongoBoss', level3Manji: 'manhandla', level4Snake: GLEEOK, level5Lizard: 'digdogger',
  level6Dragon: 'queenGohma', level7Demon: 'aquamentus', level8Lion: GLEEOK, level9DeathMountain: 'ganonBoss',
};
/** Second Quest: the boss placements change. */
export const SECOND_QUEST_BOSSES: Record<string, string> = {
  level1Eagle: 'dodongoBoss', level2Moon: 'aquamentus', level3Manji: 'digdogger', level4Snake: 'manhandla', level5Lizard: GLEEOK,
  level6Dragon: 'aquamentus', level7Demon: 'queenGohma', level8Lion: 'digdogger', level9DeathMountain: 'ganonBoss',
};

// The boss pools other campaigns (Random, the free-for-all) draw from; Volvagia stands in for the Gleeok until it exists.
export const REGION_BOSSES: Record<string, string[]> = {
  level1Eagle: ['aquamentus'], level2Moon: ['dodongoBoss'], level3Manji: ['manhandla'], level4Snake: [GLEEOK], level5Lizard: ['digdogger'],
  level6Dragon: ['queenGohma'], level7Demon: ['aquamentus', 'dodongoBoss'], level8Lion: [GLEEOK, 'digdogger'], level9DeathMountain: ['ganonBoss'],
};

/** Monster spoils dropped on defeat (section 7). */
export const SPOILS: Record<string, string> = {
  goriya: 'goriyaFang', rope: 'ropeVenom', zol: 'zolGelatin', gel: 'zolGelatin', vire: 'vireWing', polsVoice: 'polsVoiceEar', ghini: 'ghiniEssence',
  lanmola: 'lanmolaSegment', patra: 'patraEyeFragment', aquamentus: 'aquamentusScale', manhandla: 'manhandlaPetal', digdogger: 'digdoggerFragment', lesserDigdogger: 'digdoggerFragment',
};
