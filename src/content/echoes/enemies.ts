import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 3's twelve monsters. The returning ones (Zol, Buzz Blob, Moblins, Lynel, Lizalfos, Darknut, Armos,
// Ball and Chain Trooper, Gibdo, ReDead, the Wizzrobes, Rope, Wolfos, Keese, Freezard, Beamos, Mothula, Deku Baba,
// Tektite, Ghini, Moa, Biri, Poe, Octorok, Moldorm and the Spiny Beetle) keep their existing entries.
export const ENEMIES: EnemyArchetype[] = [
  e('ignizol', 'Ignizol', 'livingFlameEoW', 'chuchu', ['ignizolFlame'], st(18, 6, 14, 7, 8, 4, 10, 5, 4, 5, 18, 25), { skill: 'livingFlameEoW', glyph: 'IZ' }),
  e('hydrozol', 'Hydrozol', 'waterBlob', 'chuchu', ['hydrozolSplash'], st(20, 8, 8, 6, 6, 7, 9, 5, 5, 4, 22, 20), { skill: 'waterAbsorption', glyph: 'HZ' }),
  e('caromadillo', 'Caromadillo', 'rollingShell', 'monster', ['caromadilloRoll'], st(25, 14, 0, 10, 17, 13, 5, 5, 10, 7, 30, 0), { skill: 'rollingShell', glyph: 'CA' }),
  e('tornando', 'Tornando', 'livingCyclone', 'monster', ['tornandoGust'], st(20, 3, 19, 14, 21, 4, 15, 6, 3, 8, 15, 40), { skill: 'livingCyclone', glyph: 'TN' }),
  e('ribbitune', 'Ribbitune', 'tauntingFrog', 'monster', ['ribbituneCroak'], st(22, 5, 13, 10, 13, 5, 10, 9, 5, 5, 20, 30), { skill: 'tauntingCroak', glyph: 'RI' }),
  e('drippitune', 'Drippitune', 'rainFrog', 'monster', ['drippituneSong'], st(24, 4, 23, 12, 10, 5, 20, 10, 5, 5, 20, 55), { skill: 'rainSong', glyph: 'DP' }),
  e('holmill', 'Holmill', 'burrower', 'monster', ['holmillClaws'], st(23, 12, 0, 13, 14, 7, 5, 6, 7, 6, 30, 0), { skill: 'burrower', glyph: 'HM' }),
  e('platboom', 'Platboom', 'livingPlatform', 'construct', ['platboomSlam'], st(38, 22, 0, 8, 5, 23, 10, 4, 25, 3, 35, 0), { size: 2, skill: 'livingPlatform', glyph: 'PB' }),
  e('strandtula', 'Strandtula', 'silkSpider', 'monster', ['strandtulaFangs'], st(18, 8, 5, 13, 15, 4, 7, 5, 4, 6, 20, 10), { skill: 'silkClimber', glyph: 'ST' }),
  e('crawltula', 'Crawltula', 'wallCrawler', 'monster', ['crawltulaFangs'], st(22, 12, 0, 14, 18, 6, 5, 5, 6, 7, 28, 0), { skill: 'wallCrawler', glyph: 'CR' }),
  e('tweelus', 'Tweelus', 'stoneBody', 'construct', ['tweelusSlam'], st(35, 17, 3, 7, 5, 24, 10, 4, 19, 4, 35, 10), { skill: 'stoneBody', glyph: 'TW' }),
  e('chompfin', 'Chompfin', 'aquaticPredator', 'aquatic', ['chompfinJaws'], st(42, 24, 0, 16, 20, 12, 7, 6, 17, 8, 40, 0), { size: 2, skill: 'aquaticPredator', glyph: 'CF' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  b({ id: 'seismicTalus', name: 'Seismic Talus', title: 'Stone Construct', home: 'suthornForest', race: 'construct', classId: 'stoneConstructEoW', size: 3, glyph: 'SZ',
    weapons: ['talusFist', 'talusRockBarrage'], skill: 'floatingCore', abilities: ['stoneFistEoW', 'doubleSlam', 'rotatingBody', 'coreReconstruction'],
    stats: st(95, 30, 15, 12, 7, 34, 18, 4, 38, 4, 50, 35),
    quote: '(A ring of boulders lifts off the forest floor and settles into the shape of a giant. In its chest, a glowing core floats free of the stone. Something could pull it out...)', drops: ['curiousCharm'] }),
  b({ id: 'mogryph', name: 'Mogryph', title: 'Burrowing Sand Beast', home: 'gerudoDesertEoW', race: 'monster', classId: 'burrowingSandBeast', size: 4, glyph: 'MG',
    weapons: ['mogryphClaws', 'mogryphSandBlast'], skill: 'desertBurrower', abilities: ['sandCharge', 'burrowingAmbush', 'sandTornado', 'wingedAssault', 'quicksandField'],
    stats: st(105, 29, 22, 17, 16, 24, 19, 5, 35, 7, 50, 50),
    quote: '(The dunes of the Sanctum heave. A winged beast the size of a house bursts up from beneath the sand, and dives back down before anyone can strike.)', drops: ['gerudoSandals'] }),
  b({ id: 'vocavor', name: 'Vocavor', title: 'Aquatic Guardian', home: 'jabulWaters', race: 'aquatic', classId: 'aquaticGuardian', size: 4, glyph: 'VO',
    weapons: ['vocavorTail', 'vocavorTorrent'], skill: 'whirlpoolMaster', abilities: ['whirlpoolEoW', 'tailSweepEoW', 'aquaticCharge', 'crushingCurrent', 'deepWaterRetreat'],
    stats: st(110, 26, 30, 18, 18, 23, 25, 6, 38, 8, 50, 70),
    quote: '(The ruins under Jabul Waters roar. A whale-like guardian circles the flooded hall, dragging the water — and everything in it — into a whirlpool.)', drops: ['zoraScaleEoW'] }),
  b({ id: 'skorchill', name: 'Skorchill', title: 'Elemental Mountain Beast', home: 'hebraMountain', race: 'monster', classId: 'elementalMountainBeast', size: 3, glyph: 'SK',
    weapons: ['skorchillHorns', 'skorchillBreath'], skill: 'elementalHelmet', abilities: ['spinningChargeEoW', 'frozenHorns', 'burningHorns', 'helmetReconstruction', 'mountainSmash'],
    stats: st(115, 32, 26, 15, 10, 30, 26, 5, 38, 5, 55, 65),
    quote: '(A great horned ram in a helmet of ice and fire rears up in the Lanayru Temple. Its horns flare red, then frost over blue.)', drops: ['iceSpikes'] }),
  b({ id: 'bori', name: 'Bori', title: 'Bubble Guardian', home: 'wreckedShip', race: 'aquatic', classId: 'bubbleGuardian', size: 3, glyph: 'BO',
    weapons: ['boriShock', 'boriBounce'], skill: 'protectiveBubble', abilities: ['bubbleBounce', 'electricalSummons', 'bubbleShield', 'aquaticCollision'],
    stats: st(65, 16, 24, 12, 11, 15, 25, 5, 25, 6, 30, 55),
    quote: '(In the flooded hold of the Wrecked Ship, a jellyfish with a rainbow crown floats inside a shimmering bubble. Little Biri swarm around it.)', drops: ['spinBrace'] }),
  b({ id: 'nullEoW', name: 'Null', title: 'Primordial Entity', home: 'nullsBody', race: 'primordial', classId: 'primordialEntity', size: 5, glyph: 'NU',
    weapons: ['voidGrasp', 'nullDarkness'], skill: 'primordialNothingness',
    abilities: ['voidGraspAct', 'riftCreation', 'echoCreationNull', 'bossReflection', 'shadowArms', 'consumption', 'voidRestoration', 'returnToNothing'],
    stats: st(180, 40, 48, 26, 15, 35, 40, 2, 50, 6, 70, 150),
    quote: '(There is no floor. There is no sky. There is only the thing that eats Rifts, its many black arms reaching out of the walls of its own body.)', drops: ['nullsEmbrace'] }),
  // ── Returning encounters as boss forms of recruitable characters ──
  b({ id: 'tekomBoss', name: 'Tekom', title: 'Echo Zelda', home: 'eternalForest', race: 'hylian', classId: 'darkSummoner', size: 1, glyph: 'TK',
    weapons: ['falseTriRod'], skill: 'falseWisdom', abilities: ['echoCreationTekom', 'eoBind'],
    stats: st(52, 9, 36, 21, 17, 13, 30, 5, 6, 6, 25, 100),
    quote: '"I am Zelda. I am the one who summons. You are the copy."', drops: ['falseTriRod'] }),
  b({ id: 'echoLink', name: 'Echo Link', title: 'Hero of Might (Echo)', home: 'ancientRuins', race: 'hylian', classId: 'heroOfMight', size: 1, glyph: 'EL',
    weapons: ['herosSword', 'travelersBow'], skill: 'mysteriousSwordsman', abilities: ['heroicSpin', 'mightyShot'],
    stats: st(58, 23, 8, 21, 19, 16, 13, 10, 10, 7, 45, 25),
    quote: '(A silent copy of Link steps out of the Rift — sword, bow and bombs, in turn. Its eyes glow red.)', drops: ['heartBarrette'] }),
  b({ id: 'jabuJabuBoss', name: 'Lord Jabu-Jabu', title: 'Guardian Deity of the Zora', home: 'jabulWaters', race: 'aquatic', classId: 'guardianFishDeity', size: 4, glyph: 'JJ',
    weapons: ['jabuMaw', 'jabuWaterSpout'], skill: 'parasiteShield', abilities: ['jabuSwallow', 'tidalSplash', 'jabuSacredWaters'],
    stats: st(115, 27, 28, 14, 9, 28, 27, 10, 42, 5, 55, 70),
    quote: '(The sunken ruins flood with a smell of old fish. The Zora\'s guardian rises from the water — red-eyed, a Rift copy, with something writhing in its belly.)', drops: ['zoraSapphire'] }),
  b({ id: 'volcanicTalus', name: 'Volcanic Talus', title: 'Stone Construct (fire)', home: 'eldinVolcanoEoW', race: 'fireCreature', classId: 'stoneConstructEoW', size: 3, glyph: 'VT',
    weapons: ['talusFist', 'volcanicTalusMagma'], skill: 'floatingCore', abilities: ['stoneFistEoW', 'doubleSlam', 'coreReconstruction'],
    stats: st(100, 31, 18, 12, 7, 33, 18, 4, 38, 4, 50, 35),
    quote: '(The Seismic Talus again, but this one is made of cooling lava. Its core glows white-hot.)', drops: ['energyGlove'] }),
];

/** Boss forms of existing templates (not recruited separately). */
export const BOSS_AS_TEMPLATE: Record<string, string> = { tekomBoss: 'tekom', echoLink: 'linkEoW', jabuJabuBoss: 'jabuJabuEoW' };

/** Each Still World region's bosses (section 14; Echo Ganon, Volvagia, Gohma and Smog are returning entries). The campaign fights
 *  one of a region's list (Jabul Waters: Vocavor or the Echo Lord Jabu-Jabu), preferring one this run hasn't fought. */
export const ROUTE_BOSSES: Record<string, string[]> = {
  suthornForest: ['seismicTalus'], gerudoDesertEoW: ['mogryph'], jabulWaters: ['vocavor', 'jabuJabuBoss'], hyruleCastleEoW: ['ganonLegendBoss'],
  eldinVolcanoEoW: ['volvagia'], faronWetlands: ['queenGohma'], hebraMountain: ['skorchill'], easternTemple: ['smog'],
  wreckedShip: ['bori'], eternalForest: ['tekomBoss'], ancientRuins: ['echoLink'], nullsBody: ['nullEoW'],
};
/** Returning bosses fought as Echoes (an Echo modifier: rift creatures, a touch weaker, red-eyed). */
export const ECHO_BOSSES = ['ganonLegendBoss', 'volvagia', 'queenGohma', 'smog', 'manhandla', 'lanmolasBoss', 'slimeEye', 'echoLink', 'jabuJabuBoss'];

// Boss pools (other campaigns and the Random mode).
export const REGION_BOSSES: Record<string, string[]> = {
  suthornForest: ['seismicTalus'], gerudoDesertEoW: ['mogryph', 'lanmolasBoss'], jabulWaters: ['vocavor', 'jabuJabuBoss'], hyruleCastleEoW: ['ganonLegendBoss', 'echoLink'],
  eldinVolcanoEoW: ['volvagia', 'volcanicTalus'], faronWetlands: ['queenGohma', 'manhandla'], hebraMountain: ['skorchill'], easternTemple: ['smog', 'slimeEye'],
  wreckedShip: ['bori'], eternalForest: ['tekomBoss'], ancientRuins: ['echoLink', 'manhandla', 'lanmolasBoss', 'slimeEye'], nullsBody: ['nullEoW'],
};

// Regional rosters: the new monsters with the returning ones and the regional generics (section 2).
export const ROSTERS: Record<string, string[]> = {
  suthornForest: ['octorok', 'moblin', 'keese', 'strandtula', 'zol', 'rope', 'octorok', 'keese'],
  gerudoDesertEoW: ['moldorm', 'caromadillo', 'gibdo', 'holmill', 'tornando', 'lizalfos'],
  jabulWaters: ['chompfin', 'octorok', 'hydrozol', 'ribbitune', 'drippitune', 'buzzBlob'],
  hyruleCastleEoW: ['darknut', 'moblin', 'lizalfos', 'wizzrobe', 'keese'],
  eldinVolcanoEoW: ['ignizol', 'fireKeese', 'tweelus', 'lizalfos', 'tektite'],
  faronWetlands: ['dekuBaba', 'ribbitune', 'drippitune', 'hydrozol', 'mothula'],
  hebraMountain: ['whiteWolfos', 'iceKeese', 'freezard', 'tweelus', 'tektite', 'platboom'],
  easternTemple: ['armosKnight', 'poe', 'ghini', 'gibdo', 'redead', 'beamos', 'crawltula', 'keese'],
  wreckedShip: ['chompfin', 'hydrozol', 'octorok', 'buzzBlob', 'strandtula', 'redead'],
  eternalForest: ['wolfos', 'dekuBaba', 'moa', 'crawltula', 'tornando', 'ghini', 'holmill'],
  ancientRuins: ['darknut', 'lynel', 'platboom', 'tweelus', 'beamos', 'ignizol', 'wizzrobe', 'ballChainSoldier'],
  nullsBody: ['darknut', 'lynel', 'mightyDarknut', 'wizzrobe', 'tornando', 'platboom', 'ignizol', 'strandtula'],
};

/** River Zora (docs/river-zora.md, built by the A Link Between Worlds pack) join these regions' rosters once they exist. */
export const RIVER_ZORA_IDS = ['riverZora', 'riverZoraWarrior', 'riverZoraHunter', 'riverZoraGuardian', 'riverZoraSorcerer', 'riverZoraChieftain'];
export const RIVER_ZORA_REGIONS = ['jabulWaters', 'faronWetlands', 'wreckedShip'];

/** Monster spoils (25% on defeat): smoothie ingredients and Automaton materials to the quest bag. */
export const EO_SPOILS: Record<string, string> = {
  ignizol: 'warmPepper', hydrozol: 'bubbleKelp', caromadillo: 'rocktato', tornando: 'floralNectar', ribbitune: 'riverhorse', drippitune: 'refreshingGrapes',
  holmill: 'rocktato', platboom: 'toughMango', strandtula: 'bokoblinFang', crawltula: 'bokoblinFang', tweelus: 'monsterStone', chompfin: 'moblinGuts',
  seismicTalus: 'musicBox', mogryph: 'goldenFan', vocavor: 'prismaticMusicBox', skorchill: 'heirloomKatana', bori: 'electroApple', nullEoW: 'goldenEgg', jabuJabuBoss: 'bubbleKelp',
};
