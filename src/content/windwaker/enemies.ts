import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Monsters from the design doc (all recruitable). ChuChu stats are mine.
export const ENEMIES: EnemyArchetype[] = [
  e('bokoblin', 'Bokoblin', 'monsterInfantry', 'monster', ['bokoblinMachete', 'bokoStick'], st(22, 7, 0, 7, 8, 5, 3, 5, 7, 5, 16, 0), { skill: 'scavenger', glyph: 'BK' }),
  e('miniblin', 'Miniblin', 'swarmInfantry', 'monster', ['miniblinFork'], st(12, 4, 0, 7, 12, 2, 2, 5, 2, 6, 12, 0), { skill: 'mobMentality', glyph: 'MB' }),
  e('bokoBaba', 'Boko Baba', 'predatoryPlant', 'monster', ['babaLash'], st(20, 8, 2, 7, 4, 4, 3, 4, 6, 0, 12, 4), { skill: 'lashingVine', glyph: 'BO', ai: 'stationary' }),
  e('kargaroc', 'Kargaroc', 'flyingPredator', 'monster', ['kargarocTalons'], st(30, 10, 0, 9, 12, 5, 4, 5, 12, 8, 22, 0), { size: 2, skill: 'skyHunter', glyph: 'KA' }),
  e('mothula', 'Mothula', 'armoredInsect', 'monster', ['mothulaStinger'], st(32, 11, 2, 8, 7, 10, 5, 4, 14, 5, 22, 6), { size: 2, skill: 'infestation', glyph: 'MO' }),
  e('wingedMothula', 'Winged Mothula', 'flyingInsect', 'monster', ['mothulaWings'], st(30, 10, 2, 9, 12, 7, 5, 4, 12, 8, 22, 6), { size: 2, skill: 'wingedAssault', glyph: 'WM' }),
  e('morth', 'Morth', 'parasiticInsect', 'monster', ['morthCling'], st(8, 2, 0, 9, 10, 1, 2, 4, 1, 5, 8, 0), { skill: 'cling', glyph: 'MR' }),
  e('magtail', 'Magtail', 'volcanicInsect', 'monster', ['magtailBite'], st(28, 10, 4, 7, 5, 12, 6, 4, 13, 4, 20, 8), { size: 2, skill: 'armoredCurl', glyph: 'MG' }),
  e('seahat', 'Seahat', 'marineFlyer', 'monster', ['seahatRotor'], st(25, 8, 2, 8, 12, 5, 4, 5, 10, 8, 18, 4), { size: 2, skill: 'oceanAmbush', glyph: 'SH' }),
  e('greatSeaGyorg', 'Great Sea Gyorg', 'marinePredator', 'aquatic', ['sharkBite'], st(32, 12, 0, 9, 13, 6, 4, 4, 14, 8, 24, 0), { size: 2, skill: 'sharkRush', glyph: 'GG' }),
  e('bigOcto', 'Big Octo', 'oceanMonster', 'aquatic', ['octoTentacles', 'octoInk'], st(65, 16, 12, 8, 4, 12, 10, 4, 30, 4, 32, 24), { size: 4, skill: 'whirlpool', glyph: 'BO' }),
  e('darknut', 'Darknut', 'armoredSwordsman', 'monster', ['darknutGreatsword'], st(38, 14, 0, 11, 6, 17, 5, 4, 18, 4, 28, 0), { size: 2, skill: 'heavyArmor', glyph: 'DK' }),
  e('mightyDarknut', 'Mighty Darknut', 'eliteKnight', 'monster', ['mightyDarknutBlade'], st(46, 17, 2, 14, 8, 19, 7, 5, 20, 5, 32, 6), { size: 2, skill: 'masterDuelist', glyph: 'MD' }),
  e('armosKnight', 'Armos Knight', 'heavyConstruct', 'construct', ['armosSlam'], st(40, 15, 4, 6, 5, 18, 8, 2, 20, 4, 24, 10), { size: 2, skill: 'explosiveCore', glyph: 'AK' }),
  e('floorMasterWW', 'Floor Master', 'shadowCreature', 'shadow', ['shadowGrasp'], st(25, 10, 7, 10, 9, 5, 10, 3, 8, 5, 18, 14), { skill: 'abduction', glyph: 'FM' }),
  e('bombchuMonster', 'Bombchu', 'explosiveRodent', 'monster', ['bombchuBlast'], st(14, 5, 0, 7, 14, 2, 2, 4, 3, 7, 12, 0), { skill: 'livingBomb', glyph: 'BC' }),
  e('chuchuRed', 'Red ChuChu', 'jellyBlob', 'chuchu', ['chuBody'], st(18, 5, 2, 5, 6, 3, 4, 5, 4, 4, 12, 4), { skill: 'jellyBody', glyph: 'CR' }),
  e('chuchuGreen', 'Green ChuChu', 'jellyBlob', 'chuchu', ['chuBody'], st(22, 5, 3, 5, 5, 4, 6, 5, 5, 4, 12, 6), { skill: 'jellyBody', glyph: 'CG' }),
  e('chuchuBlue', 'Blue ChuChu', 'jellyBlob', 'chuchu', ['chuBody'], st(26, 7, 4, 6, 6, 5, 7, 8, 6, 4, 14, 8), { skill: 'jellyBody', glyph: 'CB' }),
  e('chuchuYellow', 'Yellow ChuChu', 'jellyBlob', 'chuchu', ['chuShock'], st(20, 6, 4, 5, 6, 4, 6, 5, 5, 4, 12, 6), { skill: 'electricJelly', glyph: 'CY' }),
  e('arrowChuchu', 'Arrow ChuChu', 'jellyBlob', 'chuchu', ['chuArrow'], st(16, 6, 2, 8, 6, 2, 4, 5, 4, 4, 12, 4), { skill: 'jellyBody', glyph: 'CA' }),
  // Boss parts (recruitable on their own)
  e('molgeraLarva', 'Molgera Larva', 'desertPredator', 'monster', ['larvaBite'], st(24, 9, 0, 8, 10, 5, 4, 4, 10, 6, 18, 0), { size: 2, skill: 'burrowingAmbush', glyph: 'ML' }),
  e('gohdansHand', "Gohdan's Hand", 'divineConstruct', 'construct', ['divineGrasp'], st(30, 13, 6, 10, 8, 12, 10, 3, 14, 6, 20, 12), { size: 2, skill: 'divineGraspSkill', glyph: 'GH' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  b({ id: 'gohmaWW', name: 'Gohma', title: 'Volcanic Parasite', home: 'dragonRoost', race: 'monster', classId: 'volcanicParasite', size: 4, glyph: 'GO',
    weapons: ['gohmaMandibles'], skill: 'moltenCarapace', stats: st(65, 19, 8, 8, 5, 22, 10, 4, 30, 4, 35, 18),
    quote: '(Its armored tail cracks the magma crust.)', drops: ['dinsPearl', 'magtailCarapace', 'valoosScale'] }),
  b({ id: 'kalleDemos', name: 'Kalle Demos', title: 'Giant Predatory Plant', home: 'forestHaven', race: 'monster', classId: 'giantPlant', size: 4, glyph: 'KD',
    weapons: ['kalleVines'], skill: 'suspendedRoots', stats: st(58, 15, 14, 9, 3, 12, 13, 4, 28, 0, 25, 30),
    quote: '(Vines lash out from the great hanging bud.)', drops: ['faroresPearl', 'korokForestSeed', 'korokLeafCloak'] }),
  b({ id: 'gohdan', name: 'Gohdan', title: 'Divine Construct', home: 'towerOfTheGods', race: 'construct', classId: 'divineConstruct', size: 4, glyph: 'GD',
    weapons: ['gohdansDivineCannon', 'gohdanFists'], skill: 'trialOfTheGods', stats: st(62, 12, 18, 12, 6, 16, 16, 5, 30, 5, 25, 35),
    quote: '"Show me your courage."', drops: ['gohdansSacredCore', 'gohdansDivineCannon', 'masterSword'] }),
  b({ id: 'helmarocKing', name: 'Helmaroc King', title: 'Giant Flying Beast', home: 'forsakenFortress', race: 'monster', classId: 'giantFlyingBeast', size: 4, glyph: 'HK',
    weapons: ['helmarocBeak', 'helmarocTalons'], skill: 'armoredBeak', stats: st(70, 21, 4, 12, 14, 16, 8, 5, 32, 8, 38, 10),
    quote: '(A screech echoes off the fortress walls.)', drops: ['nayrusPearl', 'helmarocKingsMask', 'helmarocPlume', 'helmarocTalons'] }),
  b({ id: 'jalhalla', name: 'Jalhalla', title: 'Poe Monarch', home: 'earthTemple', race: 'undead', classId: 'poeMonarch', size: 4, glyph: 'JA',
    weapons: ['jalhallasLantern', 'poeSlam'], skill: 'spiritCollective', stats: st(60, 14, 20, 8, 5, 12, 18, 4, 30, 4, 25, 40),
    quote: '(A hundred lantern-lights laugh as one.)', drops: ['jalhallasMask', 'jalhallasLantern'] }),
  b({ id: 'molgera', name: 'Molgera', title: 'Desert Leviathan', home: 'windTemple', race: 'monster', classId: 'desertLeviathan', size: 5, glyph: 'MO',
    weapons: ['molgeraJaws', 'sandBlast'], skill: 'sandVortexSkill', stats: st(78, 23, 8, 10, 10, 15, 10, 4, 38, 7, 40, 20),
    quote: '(The sand pit begins to churn.)', drops: ['molgeraSandPearl', 'molgeraFang'] }),
  b({ id: 'puppetGanonBeast', name: 'Puppet Ganon', title: 'Demonic Puppet (Beast Form)', home: 'ganonsTower', race: 'demon', classId: 'demonicPuppet', size: 4, glyph: 'PB',
    weapons: ['puppetClaws', 'puppetGanonsStrings'], skill: 'suspendedHorror', stats: st(70, 22, 12, 8, 6, 16, 12, 3, 32, 5, 35, 30),
    quote: '(It dangles from a hundred strings, grinning.)', drops: ['puppetGanonsString', 'puppetGanonsStrings'] }),
  b({ id: 'puppetGanonSpider', name: 'Puppet Ganon', title: 'Demonic Puppet (Spider Form)', home: 'ganonsTower', race: 'demon', classId: 'demonicPuppet', size: 4, glyph: 'PS',
    weapons: ['spiderCrash', 'puppetGanonsStrings'], skill: 'fallingTerror', stats: st(65, 19, 14, 10, 10, 13, 14, 3, 30, 6, 35, 30),
    quote: '(Eight legs drum on the floor.)', drops: ['puppetGanonsHide', 'puppetGanonsString'] }),
  b({ id: 'puppetGanonSnake', name: 'Puppet Ganon', title: 'Demonic Puppet (Snake Form)', home: 'ganonsTower', race: 'demon', classId: 'demonicPuppet', size: 5, glyph: 'PN',
    weapons: ['snakeCharge', 'puppetGanonsStrings'], skill: 'unrelentingCharge', stats: st(72, 20, 12, 12, 17, 12, 12, 3, 35, 9, 40, 30),
    quote: '(It coils, then strikes across the whole room.)', drops: ['puppetGanonsHide', 'puppetGanonsString'] }),
  // Regional leaders that are other units' forms
  b({ id: 'bokoblinChief', name: 'Bokoblin Chief', title: 'Leader of the Raiders', home: 'outsetIsland', race: 'monster', classId: 'monsterInfantry', size: 1, glyph: 'BK',
    weapons: ['bokoblinMachete', 'bokoStick'], skill: 'scavenger', stats: st(34, 11, 0, 10, 10, 7, 4, 6, 9, 5, 20, 0),
    quote: '(It waves a machete and squeals orders.)', drops: ['herosClothes', 'telescope', 'pirateCutlass'] }),
  b({ id: 'bigOctoBoss', name: 'Big Octo', title: 'Terror of the Great Sea', home: 'greatSea', race: 'aquatic', classId: 'oceanMonster', size: 4, glyph: 'BO',
    weapons: ['octoTentacles', 'octoInk'], skill: 'whirlpool', stats: st(72, 17, 13, 8, 4, 13, 11, 4, 32, 4, 32, 24),
    quote: '(The sea starts to spin.)', drops: ['swiftSail', 'jabunsBlessing', 'heavyCannon'] }),
  b({ id: 'mightyDarknutBoss', name: 'Mighty Darknut', title: 'Knight Captain of the Sunken Castle', home: 'submergedHyrule', race: 'monster', classId: 'eliteKnight', size: 2, glyph: 'MD',
    weapons: ['mightyDarknutBlade'], skill: 'masterDuelist', stats: st(54, 18, 2, 15, 9, 20, 8, 5, 22, 5, 34, 6),
    quote: '(Its red cape sweeps the flooded hall.)', drops: ['mightyDarknutHelmet', 'mightyDarknutArmor', 'mightyDarknutShield', 'mightyDarknutBlade'] }),
  b({ id: 'ganondorfWWBoss', name: 'Ganondorf', title: 'King of the Forsaken Fortress', home: 'ganonsTower', race: 'gerudo', classId: 'dualBladeWarlord', size: 1, glyph: 'GW',
    weapons: ['ganondorfsTwinSwords'], skill: 'desertWind', stats: st(40, 17, 9, 16, 13, 12, 9, 6, 15, 6, 30, 18),
    quote: '"The wind... it is blowing."', drops: ['ganondorfsTwinSwords', 'triforceCourage'] }),
];

export const ROSTERS: Record<string, string[]> = {
  outsetIsland: ['bokoblin', 'miniblin', 'chuchuRed', 'chuchuGreen', 'keese', 'bokoBaba'],
  forsakenFortress: ['bokoblin', 'bokoblin', 'moblin', 'miniblin', 'kargaroc', 'keese', 'darknut'],
  dragonRoost: ['bokoblin', 'kargaroc', 'magtail', 'chuchuRed', 'fireKeese', 'bokoBaba', 'chuchuYellow'],
  forestHaven: ['bokoBaba', 'mothula', 'wingedMothula', 'morth', 'chuchuGreen', 'peahat', 'bokoblin'],
  greatSea: ['seahat', 'greatSeaGyorg', 'bokoblin', 'miniblin', 'kargaroc', 'chuchuBlue', 'moblin'],
  towerOfTheGods: ['armosKnight', 'armosKnight', 'chuchuYellow', 'bombchuMonster', 'beamos', 'darknut', 'keese'],
  earthTemple: ['redead', 'stalfos', 'poe', 'floorMasterWW', 'moblin', 'darknut', 'chuchuBlue', 'keese'],
  windTemple: ['wingedMothula', 'armosKnight', 'floorMasterWW', 'morth', 'bombchuMonster', 'peahat', 'arrowChuchu'],
  submergedHyrule: ['darknut', 'mightyDarknut', 'moblin', 'stalfos', 'redead', 'armosKnight'],
  ganonsTower: ['darknut', 'mightyDarknut', 'moblin', 'redead', 'peahat', 'floorMasterWW', 'kargaroc', 'stalfos'],
};

export const REGION_BOSSES: Record<string, string[]> = {
  outsetIsland: ['bokoblinChief'],
  forsakenFortress: ['helmarocKing'],
  dragonRoost: ['gohmaWW'],
  forestHaven: ['kalleDemos'],
  greatSea: ['bigOctoBoss'],
  towerOfTheGods: ['gohdan'],
  earthTemple: ['jalhalla'],
  windTemple: ['molgera'],
  submergedHyrule: ['mightyDarknutBoss'],
  ganonsTower: ['puppetGanonBeast', 'puppetGanonSpider', 'puppetGanonSnake', 'ganondorfWWBoss', 'phantomGanon'],
};

/** Monster spoils dropped on defeat. */
export const SPOILS: Record<string, string> = {
  bokoblin: 'joyPendant', bokoblinChief: 'joyPendant', moblin: 'skullNecklace', darknut: 'knightsCrest', mightyDarknut: 'knightsCrest', mightyDarknutBoss: 'knightsCrest',
  kargaroc: 'goldenFeather', bokoBaba: 'bokoBabaSeed', chuchuRed: 'redChuJelly', chuchuGreen: 'greenChuJelly', chuchuBlue: 'blueChuJelly', chuchuYellow: 'greenChuJelly',
  arrowChuchu: 'redChuJelly', morth: 'morthCluster', magtail: 'magtailShell', seahat: 'seahatRotor', bigOcto: 'bigOctoInk', mothula: 'morthCluster',
};
