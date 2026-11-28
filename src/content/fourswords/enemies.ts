import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 4's four monsters. Darknuts, Stalfos, Moblins, Wizzrobes, Like Likes, ChuChus, Keese, Octoroks, Tektites,
// Zols and the rest carry over with their existing entries.
export const ENEMIES: EnemyArchetype[] = [
  e('ballChainTrooper', 'Ball and Chain Trooper', 'chainTrooper', 'monster', ['trooperChain'], st(32, 18, 0, 12, 8, 14, 5, 5, 15, 5, 35, 0), { skill: 'chainReach', glyph: 'BT' }),
  e('bigBomb', 'Big Bomb', 'livingBomb', 'construct', ['bigBombBody'], st(35, 30, 0, 5, 3, 8, 5, 1, 20, 3, 15, 0), { size: 2, skill: 'massiveDetonation', glyph: 'BB' }),
  e('terrorpin', 'Terrorpin', 'armoredTurtle', 'monster', ['shellRam'], st(25, 12, 0, 8, 10, 20, 4, 5, 12, 5, 25, 0), { skill: 'armoredShell', glyph: 'TP' }),
  e('geldman', 'Geldman', 'sandAmbusher', 'monster', ['sandClaw'], st(28, 15, 3, 12, 14, 9, 6, 5, 10, 6, 30, 10), { skill: 'sandAmbushFS', glyph: 'GD' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  b({ id: 'vaatiWindMage', name: 'Vaati', title: 'Wind Mage', home: 'vaatisPalace', race: 'demon', classId: 'windSorcererFS', size: 3, glyph: 'VW',
    weapons: ['galeBolt'], skill: 'windFortress', abilities: ['cycloneFS', 'vacuumFS', 'windBarrierFS', 'eyeBeamFS', 'greatTornado'],
    stats: st(100, 12, 38, 22, 19, 20, 35, 7, 25, 8, 30, 100),
    quote: '(A black orb with a single red eye and bat wings hangs in a cyclone above the palace. "Four of you? Then I will break four heroes.")', drops: ['vaatisCycloneOrb'] }),
  b({ id: 'deluZol', name: 'Delu Zol', title: 'Giant Slime', home: 'seaOfTrees', race: 'chuchu', classId: 'giantSlimeFS', size: 3, glyph: 'DZ',
    weapons: ['gelSlam', 'gelSpit'], skill: 'dividingBodyFS', abilities: ['crushingBounce', 'slimeDivision', 'gelAbsorption', 'bodyRegeneration'],
    stats: st(70, 20, 10, 8, 6, 16, 12, 4, 30, 5, 35, 20),
    quote: '(A green slug of a slime, spiked along its back, heaves itself out of the Sea of Trees. Wherever it is cut, a smaller slime crawls away.)', drops: ['greenHerosTunic'] }),
  b({ id: 'gouen', name: 'Gouen', title: 'Volcanic Monster', home: 'deathMountainFS', race: 'fireCreature', classId: 'volcanicMonster', size: 4, glyph: 'GO',
    weapons: ['gouenMagmaFist', 'gouenFlame'], skill: 'moltenBodyFS', abilities: ['flameBreathFS', 'lavaBurstFS', 'crushingSlamFS', 'moltenArmor'],
    stats: st(105, 30, 25, 14, 8, 28, 20, 5, 40, 4, 45, 50),
    quote: '(A face in a crown of flame rises out of the crater of Death Mountain, scowling at the four of you as if you were late.)', drops: ['redHerosTunic'] }),
  b({ id: 'deraZol', name: 'Dera Zol', title: 'Elemental Slime', home: 'talusCave', race: 'chuchu', classId: 'elementalSlimeFS', size: 3, glyph: 'DR',
    weapons: ['gelSlam', 'elementalSpit'], skill: 'shiftingDefense', abilities: ['elementalShift', 'slimeBarrage', 'crushingBounce', 'spinyGelRecovery'],
    stats: st(85, 22, 26, 12, 9, 18, 24, 5, 32, 5, 40, 55),
    quote: '(Deep in the Talus Cave a slime glows one colour, then another. Whatever hurt it a moment ago doesn\'t any more.)', drops: ['blueHerosTunic'] }),
  b({ id: 'frostare', name: 'Frostare', title: 'Ice Guardian', home: 'frozenHyrule', race: 'monster', classId: 'iceGuardian', size: 3, glyph: 'FR',
    weapons: ['iceShard', 'frostTouch'], skill: 'frozenDefense', abilities: ['iceBeamFS', 'frozenBarrier', 'blizzardFS', 'frostRegeneration'],
    stats: st(90, 18, 30, 15, 7, 25, 28, 4, 35, 4, 35, 65),
    quote: '(An eye in a bloom of ice floats over the Ice Temple, wings of frost spread wide. The cold comes off it in waves.)', drops: ['purpleHerosTunic'] }),
  // New entries that are also recruitable characters (their templates share the ids).
  b({ id: 'shadowLink', name: 'Shadow Link', title: 'Shadow Swordsman', home: 'darkWorldFSA', race: 'shadow', classId: 'shadowSwordsmanFS', size: 1, glyph: 'SL',
    weapons: ['shadowSword'], skill: 'shadowReflectionSkill', abilities: ['shadowReflection', 'giantBombThrow'],
    stats: st(32, 19, 19, 21, 22, 10, 15, 5, 9, 7, 40, 45),
    quote: '"Four of you? Then there are four of me." (A Link in black grins with red eyes, a giant bomb under his arm.)', drops: ['shadowHerosTunic', 'shadowMirror'] }),
  b({ id: 'ganonFSA', name: 'Ganon', title: 'Trident Demon', home: 'realmOfTheHeavens', race: 'demon', classId: 'tridentDemon', size: 3, glyph: 'GF',
    weapons: ['tridentOfPower'], skill: 'kingOfDarkness', abilities: ['banishToDarkWorld', 'tridentSpin'],
    stats: st(110, 35, 32, 22, 12, 28, 30, 6, 38, 6, 55, 85),
    quote: '"Vaati was a tool. The Trident of Power is mine, and with it the world beneath and the world above." (The blue boar-demon lowers his trident.)', drops: ['ganonsDarkArmor', 'tridentOfPower'] }),
];

/** Each region's bosses (the doc's placements; returning bosses where the doc leaves a region open). */
export const ROUTE_BOSSES: Record<string, string[]> = {
  seaOfTrees: ['deluZol'], talusCave: ['deraZol'], deathMountainFS: ['gouen'], vaatisPalace: ['vaatiWindMage'],
  whereaboutsOfTheWind: ['phantomGanon'], easternHyrule: ['arrghus'], deathMountainFSA: ['dodongo'], nearTheFields: ['mightyDarknut'],
  darkWorldFSA: ['shadowLink'], desertOfDoubt: ['manhandla'], frozenHyrule: ['frostare', 'helmarocKing'], realmOfTheHeavens: ['vaatiWindMage'],
};
/** Regions whose boss node brings every listed boss at once (all must fall). */
export const PAIRED_FS_REGIONS = ['frozenHyrule'];
/** The finale: Vaati falls, then Ganon takes the field. */
export const FINALE_REGION = 'realmOfTheHeavens';
/** Returning monster entries fought as bosses here: the "Big" versions (stats scaled up from the ordinary entry). */
export const BIG_RETURNING: Record<string, { name: string; title: string; quote: string }> = {
  dodongo: { name: 'Big Dodongo', title: 'Volcanic Reptile', quote: '(A Dodongo the size of a house lumbers out of the Tower of Flames, swallowing anything round — bombs included.)' },
  mightyDarknut: { name: 'Big Darknut', title: 'Heavy Knight', quote: '(The captain of Ganon\'s Darknuts: plate on plate of armour, and a sword as long as a door.)' },
  moldorm: { name: 'Big Moldorm', title: 'Burrowing Worm', quote: '(A great segmented worm thrashes round the arena. Only its tail is soft.)' },
};
/** Each boss's retinue (returning monsters and the pack's own). */
export const FS_ESCORTS: Record<string, string[]> = {
  deluZol: ['zol', 'zol'], deraZol: ['zol', 'zol', 'stalfos', 'stalfos', 'iceKeese'], gouen: ['fireKeese', 'tektite'], vaatiWindMage: ['ballChainTrooper', 'darknut'],
  phantomGanon: ['moldorm', 'stalfos'], arrghus: ['octorok', 'terrorpin'], dodongo: ['tektite', 'bigBomb'], mightyDarknut: ['darknut', 'ballChainTrooper'],
  shadowLink: ['hinox'], manhandla: ['geldman', 'geldman'], frostare: ['iceKeese'],
};

// Boss pools (other campaigns and the regions without a fixed boss).
export const REGION_BOSSES: Record<string, string[]> = {
  seaOfTrees: ['deluZol'], talusCave: ['deraZol', 'frostare'], deathMountainFS: ['gouen'], vaatisPalace: ['vaatiWindMage', 'shadowLink'],
  whereaboutsOfTheWind: ['phantomGanon', 'shadowLink'], easternHyrule: ['arrghus', 'deluZol'], deathMountainFSA: ['gouen', 'kingDodongo'],
  nearTheFields: ['shadowLink', 'hinox'], darkWorldFSA: ['shadowLink', 'phantomGanon'], desertOfDoubt: ['manhandla', 'deraZol'],
  frozenHyrule: ['frostare', 'helmarocKing'], realmOfTheHeavens: ['vaatiWindMage', 'ganonFSA'],
};

// Regional rosters: the new monsters with the returning ones.
export const ROSTERS: Record<string, string[]> = {
  seaOfTrees: ['octorok', 'chuchuGreen', 'keese', 'zol', 'octorok', 'chuchuGreen'],
  talusCave: ['keese', 'zol', 'stalfos', 'chuchuGreen', 'iceKeese', 'octorok'],
  deathMountainFS: ['fireKeese', 'tektite', 'stalfos', 'bigBomb', 'chuchuRed', 'moblin'],
  vaatisPalace: ['darknut', 'ballChainTrooper', 'wizzrobe', 'stalfos', 'bigBomb', 'keese'],
  whereaboutsOfTheWind: ['octorok', 'chuchuGreen', 'keese', 'ballChainTrooper', 'moblin', 'tektite'],
  easternHyrule: ['octorok', 'terrorpin', 'chuchuGreen', 'likeLike', 'moblin', 'tektite'],
  deathMountainFSA: ['tektite', 'fireKeese', 'bigBomb', 'stalfos', 'moblin', 'chuchuRed'],
  nearTheFields: ['moblin', 'ballChainTrooper', 'octorok', 'darknut', 'likeLike', 'stalfos'],
  darkWorldFSA: ['stalfos', 'wizzrobe', 'keese', 'likeLike', 'moblin', 'bigBomb'],
  desertOfDoubt: ['geldman', 'geldman', 'leever', 'stalfos', 'gibdo', 'moblin'],
  frozenHyrule: ['iceKeese', 'terrorpin', 'darknut', 'wizzrobe', 'stalfos', 'ballChainTrooper'],
  realmOfTheHeavens: ['darknut', 'wizzrobe', 'ballChainTrooper', 'bigBomb', 'stalfos', 'moblin'],
};

/** Monster spoils (25% on defeat): crafting materials to the quest bag. */
export const FS_SPOILS: Record<string, string> = {
  terrorpin: 'terrorpinShell', geldman: 'geldmanSand', deluZol: 'deluZolGel', deraZol: 'deraZolGel', gouen: 'gouensMoltenCore', frostare: 'frostareCrystal',
  vaatiWindMage: 'windEssence', shadowLink: 'shadowEssence', ganonFSA: 'shadowEssence',
};
