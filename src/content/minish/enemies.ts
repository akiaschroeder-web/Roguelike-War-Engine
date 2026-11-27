import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 4's six monsters (size 0 = Micro). Darknuts, Moblins, Keese, ChuChus, Like Likes, Wizzrobes,
// Gibdos, Octoroks, Stalfos and the rest carry over with their existing entries.
export const ENEMIES: EnemyArchetype[] = [
  e('pesto', 'Pesto', 'pestBug', 'monster', ['pestoSting'], st(12, 6, 0, 8, 17, 2, 3, 4, 1, 8, 18, 0), { size: 0, skill: 'flyingPest', glyph: 'PS' }),
  e('puffstool', 'Puffstool', 'sporeFungus', 'monster', ['puffstoolSporeCloud'], st(18, 3, 13, 10, 5, 5, 12, 5, 1, 4, 14, 25), { size: 0, skill: 'sporeCloud', glyph: 'PF' }),
  e('spinyBeetle', 'Spiny Beetle', 'spinyBeetleClass', 'monster', ['spinyBeetleHorn'], st(22, 11, 0, 9, 10, 13, 3, 4, 8, 5, 25, 0), { skill: 'camouflage', glyph: 'SB' }),
  e('rollobite', 'Rollobite', 'rollingBug', 'monster', ['rollobiteRoll'], st(20, 8, 0, 7, 12, 15, 4, 4, 2, 6, 25, 0), { size: 0, skill: 'armoredRoll', glyph: 'RB' }),
  e('eyegoreStatue', 'Eyegore Statue', 'watchingGuardian', 'construct', ['eyegoreBeam', 'eyegoreSlam'], st(48, 20, 8, 14, 5, 25, 12, 3, 25, 4, 35, 18), { size: 2, skill: 'watchingGuardianSkill', glyph: 'EG', ai: 'stationary' }),
  e('ballChainSoldier', 'Ball and Chain Soldier', 'chainSoldier', 'monster', ['ballAndChainFlail'], st(52, 25, 0, 13, 6, 23, 8, 5, 28, 4, 45, 0), { size: 2, skill: 'sweepingChain', glyph: 'BC', ai: 'guard' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  b({ id: 'bigGreenChuchu', name: 'Big Green ChuChu', title: 'Giant Slime', home: 'deepwoodShrine', race: 'chuchu', classId: 'giantSlime', size: 3, glyph: 'BG',
    weapons: ['bigChuSlam', 'acidSplash'], skill: 'gelatinousGiant', abilities: ['crushingBounce', 'bodyRegeneration'],
    stats: st(70, 19, 5, 8, 7, 18, 10, 6, 30, 5, 40, 15),
    quote: '(A ChuChu the size of a house wobbles in the heart of the Deepwood Shrine. Swords sink into it and come out sticky. A gust of wind might knock it over...)', drops: ['minishLeafShield'] }),
  b({ id: 'bigBlueChuchu', name: 'Big Blue ChuChu', title: 'Giant Electric Slime', home: 'templeOfDroplets', race: 'chuchu', classId: 'giantSlime', size: 3, glyph: 'BU',
    weapons: ['bigBlueShock', 'bigChuSlam'], skill: 'giganticCharge', abilities: ['crushingBounce', 'bodyRegeneration'],
    stats: st(75, 20, 24, 10, 9, 18, 22, 6, 30, 5, 40, 50),
    quote: '(A blue giant slime crackles in the Temple of Droplets. Every few moments its coating dies down — and then the air hums again.)', drops: ['minishTunic'] }),
  b({ id: 'bigOctorok', name: 'Big Octorok', title: 'Frost Beast', home: 'templeOfDroplets', race: 'monster', classId: 'frostBeast', size: 3, glyph: 'BO',
    weapons: ['octorokBoulder', 'freezingBreath'], skill: 'frozenArena', abilities: ['vacuumInhale', 'inkCloud'],
    stats: st(85, 23, 25, 15, 8, 20, 24, 5, 35, 5, 40, 55),
    quote: '(The ice cracks. A great red octopus with a flower on its back heaves itself up and spits a boulder of ice.)', drops: ['zorasFlippers'] }),
  b({ id: 'gleerok', name: 'Gleerok', title: 'Volcanic Beast', home: 'caveOfFlames', race: 'fireCreature', classId: 'volcanicBeast', size: 4, glyph: 'GL',
    weapons: ['gleerokFlame', 'crushingNeck'], skill: 'volcanicShell', abilities: ['volcanicEruption'],
    stats: st(100, 28, 18, 12, 6, 30, 17, 4, 40, 4, 45, 35),
    quote: '(A lava-dragon coils out of the magma of the Cave of Flames, its back a shell of red-hot rock.)', drops: ['gleerokShellArmor', 'caneOfPacci'] }),
  b({ id: 'mazaal', name: 'Mazaal', title: 'Ancient Construct', home: 'fortressOfWinds', race: 'construct', classId: 'ancientConstructMC', size: 4, glyph: 'MZ',
    weapons: ['mazaalHands', 'mazaalEyeBeam'], skill: 'mechanicalInterior', abilities: ['mechanicalSlam'],
    stats: st(110, 30, 15, 16, 5, 32, 20, 3, 45, 4, 50, 30),
    quote: '(A stone face rises from the floor of the Fortress of Winds, and two great hands lift beside it. There is a crack in the forehead just big enough for a Minish.)', drops: ['mazaalsSacredCore', 'moleMitts'] }),
  b({ id: 'gyorgFemale', name: 'Female Gyorg', title: 'Aerial Platform', home: 'palaceOfWinds', race: 'monster', classId: 'aerialPlatform', size: 4, glyph: 'GF',
    weapons: ['gyorgCharge', 'gyorgEyeBeam'], skill: 'aerialPair', abilities: ['wingGust'],
    stats: st(95, 22, 15, 15, 13, 22, 17, 6, 35, 8, 45, 30),
    quote: '(A vast red ray glides out of the clouds above the Palace of Winds, eyes all over its back. Something smaller and blue circles it.)', drops: ['gyorgEyeCharm'] }),
  b({ id: 'gyorgMale', name: 'Male Gyorg', title: 'Aerial Hunter', home: 'palaceOfWinds', race: 'monster', classId: 'aerialHunter', size: 3, glyph: 'GM',
    weapons: ['gyorgStrike'], skill: 'aerialPair',
    stats: st(70, 25, 8, 17, 20, 16, 12, 6, 25, 9, 40, 20),
    quote: '(The blue Gyorg dives at anyone who gets near its mate.)', drops: ['rocsCape'] }),
  b({ id: 'vaatiReborn', name: 'Vaati Reborn', title: 'Demonic Sorcerer', home: 'darkHyruleCastle', race: 'demon', classId: 'demonicSorcerer', size: 2, glyph: 'VR',
    weapons: ['darkOrbShot', 'shadowFlame'], skill: 'eyesOfDarkness', abilities: ['magicalTeleport'],
    stats: st(65, 10, 35, 20, 17, 14, 30, 6, 15, 7, 30, 85),
    quote: '"The Light Force is mine, and with it this kingdom. Did you think a hat and a boy could stop me?"', drops: ['vaatisDarkOrb'] }),
  b({ id: 'vaatiTransfigured', name: 'Vaati Transfigured', title: 'Floating Demon', home: 'darkHyruleCastle', race: 'demon', classId: 'floatingDemon', size: 3, glyph: 'VT',
    weapons: ['darkEyeBeam', 'spikedOrb'], skill: 'eightfoldDefense',
    stats: st(95, 17, 38, 22, 14, 22, 32, 5, 30, 7, 35, 90),
    quote: '(The sorcerer\'s body tears open into a single great eye, wreathed in eight smaller ones.)', drops: ['vaatisEye'] }),
  b({ id: 'vaatisWrath', name: "Vaati's Wrath", title: 'Wind Demon', home: 'darkHyruleCastle', race: 'demon', classId: 'windDemon', size: 4, glyph: 'VW',
    weapons: ['crushingClaw', 'darkCyclone'], skill: 'demonicArms', abilities: ['windCataclysm'],
    stats: st(125, 32, 40, 23, 15, 28, 35, 4, 40, 7, 50, 100),
    quote: '(Vaati\'s last shape fills the sky: a cage of black wind, a red eye, and two great clawed arms.)', drops: ['sorcerersCap', 'vaatisRobes'] }),
  // ── Minibosses ──
  b({ id: 'madderpillar', name: 'Madderpillar', title: 'Insect Bruiser', home: 'minishWoods', race: 'monster', classId: 'insectBruiser', size: 0, glyph: 'MP',
    weapons: ['madderpillarBite'], skill: 'enragedCrawl', abilities: ['crawlingCharge'],
    stats: st(28, 14, 0, 10, 13, 8, 4, 5, 3, 7, 30, 0),
    quote: '(At Minish size, a caterpillar is a monster: a blue Madderpillar barrels through the grass, head down. Its tail is soft.)', drops: ['minishLeafGlider'] }),
  b({ id: 'spinyChuchu', name: 'Spiny ChuChu', title: 'Defensive Slime', home: 'hyruleTownMC', race: 'chuchu', classId: 'defensiveSlime', size: 1, glyph: 'SC',
    weapons: ['spinyChuSpikes'], skill: 'retractableSpikes', abilities: ['gelRecovery'],
    stats: st(24, 12, 0, 7, 6, 12, 5, 5, 10, 5, 25, 0),
    quote: '(The fifteenth kind of ChuChu: grey, wobbly, and covered in spikes that slide in and out.)', drops: ['minishMetalShield'] }),
  b({ id: 'silverDarknut', name: 'Silver Darknut', title: 'Armored Swordsman', home: 'windRuins', race: 'monster', classId: 'armoredSwordsman', size: 2, glyph: 'SD',
    weapons: ['darknutGreatsword'], skill: 'silverGuard', abilities: ['defensiveStance'],
    stats: st(48, 21, 0, 16, 8, 25, 10, 7, 24, 5, 40, 0),
    quote: '(A Darknut in silver plate raises its shield. Nothing gets through from the front.)', drops: ['mountainMinishHelmet'] }),
  b({ id: 'redDarknut', name: 'Red Darknut', title: 'Assault Knight', home: 'royalValley', race: 'monster', classId: 'armoredSwordsman', size: 2, glyph: 'RD',
    weapons: ['mightyDarknutBlade'], skill: 'aggressiveSwordsmanship', abilities: ['lungingThrust'],
    stats: st(52, 25, 0, 19, 13, 21, 9, 7, 24, 6, 45, 0),
    quote: '(A red-armoured Darknut charges, sword first, and does not stop.)', drops: ['minishForgingApron'] }),
  b({ id: 'blackKnight', name: 'Black Knight', title: 'Elite Darknut', home: 'darkHyruleCastle', race: 'monster', classId: 'armoredSwordsman', size: 2, glyph: 'BK',
    weapons: ['blackBlade'], skill: 'masterOfTheBlade', abilities: ['executionStrike'],
    stats: st(65, 29, 0, 25, 17, 28, 15, 8, 28, 6, 55, 0),
    quote: '(A knight in black armour with a golden shield guards Vaati\'s throne room. Its sword moves before you do.)', drops: ['blackBlade'] }),
];

/** Each region's bosses in order (the doc's placements; minibosses where the doc leaves a region open). */
export const ROUTE_BOSSES: Record<string, string[]> = {
  hyruleTownMC: ['spinyChuchu'], minishWoods: ['madderpillar'], deepwoodShrine: ['bigGreenChuchu'], caveOfFlames: ['gleerok'],
  windRuins: ['silverDarknut'], fortressOfWinds: ['mazaal'], royalValley: ['redDarknut'], templeOfDroplets: ['bigBlueChuchu', 'bigOctorok'],
  palaceOfWinds: ['gyorgFemale', 'gyorgMale'], darkHyruleCastle: ['vaatiReborn'],
};
/** Regions whose boss node brings every listed boss at once (all must fall). */
export const PAIRED_MC_REGIONS = ['templeOfDroplets', 'palaceOfWinds'];
/** Vaati's three demonic forms, fought one after another in the same battle. */
export const VAATI_FORMS = ['vaatiReborn', 'vaatiTransfigured', 'vaatisWrath'];

// Boss pools (other campaigns and the regions without a fixed boss).
export const REGION_BOSSES: Record<string, string[]> = {
  hyruleTownMC: ['spinyChuchu'], minishWoods: ['madderpillar'], minishVillage: ['madderpillar', 'spinyChuchu'], deepwoodShrine: ['bigGreenChuchu'],
  mountCrenel: ['spinyChuchu', 'silverDarknut'], caveOfFlames: ['gleerok'], castorWilds: ['silverDarknut', 'redDarknut'], windRuins: ['silverDarknut'],
  fortressOfWinds: ['mazaal'], royalValley: ['redDarknut'], lakeHyliaMC: ['bigOctorok', 'redDarknut'], templeOfDroplets: ['bigBlueChuchu', 'bigOctorok'],
  veilFalls: ['redDarknut', 'silverDarknut'], cloudTops: ['gyorgMale', 'blackKnight'], palaceOfWinds: ['gyorgFemale', 'gyorgMale'],
  darkHyruleCastle: ['vaatiReborn', 'vaatiTransfigured', 'vaatisWrath', 'blackKnight'],
};

// Regional rosters: the new monsters with the returning ones.
export const ROSTERS: Record<string, string[]> = {
  hyruleTownMC: ['chuchuGreen', 'octorok', 'keese', 'pesto', 'rollobite', 'chuchuGreen', 'spinyBeetle'],
  minishWoods: ['pesto', 'pesto', 'puffstool', 'octorok', 'chuchuGreen', 'rollobite', 'keese'],
  minishVillage: ['pesto', 'puffstool', 'rollobite', 'chuchuGreen', 'spinyBeetle'],
  deepwoodShrine: ['chuchuGreen', 'puffstool', 'pesto', 'rollobite', 'keese', 'likeLike'],
  mountCrenel: ['spinyBeetle', 'rollobite', 'keese', 'chuchuGreen', 'octorok', 'pesto'],
  caveOfFlames: ['fireKeese', 'rollobite', 'spinyBeetle', 'chuchuRed', 'keese', 'likeLike'],
  castorWilds: ['puffstool', 'octorok', 'pesto', 'chuchuGreen', 'moblin', 'spinyBeetle'],
  windRuins: ['eyegoreStatue', 'moblin', 'keese', 'stalfos', 'rollobite', 'spinyBeetle'],
  fortressOfWinds: ['eyegoreStatue', 'stalfos', 'darknut', 'wizzrobe', 'keese', 'moblin'],
  royalValley: ['gibdo', 'stalfos', 'keese', 'gibdo', 'pesto', 'spinyBeetle'],
  lakeHyliaMC: ['octorok', 'chuchuGreen', 'pesto', 'puffstool', 'rollobite', 'keese'],
  templeOfDroplets: ['iceKeese', 'chuchuGreen', 'likeLike', 'rollobite', 'wizzrobe', 'keese'],
  veilFalls: ['spinyBeetle', 'keese', 'moblin', 'darknut', 'rollobite', 'pesto'],
  cloudTops: ['keese', 'moblin', 'wizzrobe', 'pesto', 'darknut', 'eyegoreStatue'],
  palaceOfWinds: ['ballChainSoldier', 'darknut', 'wizzrobe', 'eyegoreStatue', 'keese', 'moblin'],
  darkHyruleCastle: ['ballChainSoldier', 'darknut', 'wizzrobe', 'gibdo', 'stalfos', 'keese', 'eyegoreStatue'],
};

/** Monster spoils (25% on defeat): crafting materials to the quest bag. */
export const MC_SPOILS: Record<string, string> = {
  pesto: 'pestoWing', puffstool: 'puffstoolSpores', rollobite: 'rollobiteShell', gleerok: 'gleerokScale', mazaal: 'mazaalMechanism',
  gyorgFemale: 'gyorgWingFragment', gyorgMale: 'gyorgWingFragment', vaatiReborn: 'vaatisDarkEssence', vaatiTransfigured: 'vaatisDarkEssence', vaatisWrath: 'vaatisDarkEssence',
};
