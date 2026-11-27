import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 3's monsters (the three Phantoms share the armor rules; the Phantom Eye raises alarms),
// the Yook as hostile Isle of Frost monsters, and the generic Subrosians for Subrosia's rosters.
export const ENEMIES: EnemyArchetype[] = [
  e('phantom', 'Phantom', 'phantomGuard', 'phantom', ['phantomBlade'], st(50, 22, 0, 14, 6, 28, 15, 3, 25, 5, 40, 0), { skill: 'phantomArmorSkill', glyph: 'PH', ai: 'guard' }),
  e('swiftPhantom', 'Swift Phantom', 'swiftPhantomClass', 'phantom', ['phantomBlade'], st(45, 19, 0, 15, 17, 22, 13, 3, 22, 9, 45, 0), { skill: 'relentlessChase', glyph: 'SP', ai: 'guard' }),
  e('warpPhantom', 'Warp Phantom', 'warpPhantomClass', 'phantom', ['phantomBlade', 'warpFlame'], st(48, 20, 18, 16, 12, 24, 20, 4, 23, 6, 35, 40), { skill: 'spectralWarp', glyph: 'WP', ai: 'guard' }),
  e('phantomEye', 'Phantom Eye', 'phantomEyeClass', 'monster', ['phantomEyeGaze'], st(12, 2, 8, 15, 16, 2, 8, 5, 2, 8, 10, 20), { skill: 'phantomAlarmSkill', glyph: 'PE' }),
  e('geozard', 'Geozard', 'geozardClass', 'monster', ['geozardSpear', 'geozardFire'], st(38, 17, 8, 14, 10, 17, 9, 5, 16, 5, 30, 18), { skill: 'shieldedAssault', glyph: 'GZ' }),
  e('yookWarrior', 'Yook Warrior', 'yookWarriorClass', 'yook', ['yookIceClub', 'yookClaws'], st(38, 18, 0, 10, 7, 13, 9, 5, 18, 5, 32, 0), { size: 2, skill: 'heavyBlow', glyph: 'YW' }),
  e('yookIceBreather', 'Yook Ice Breather', 'yookBreatherClass', 'yook', ['frozenBreathWeapon', 'yookClaws'], st(36, 12, 17, 11, 7, 12, 15, 5, 17, 5, 26, 35), { size: 2, skill: 'frozenBreathSkill', glyph: 'YB' }),
  e('yookBerserker', 'Yook Berserker', 'yookBerserkerClass', 'yook', ['yookIceClub', 'yookClaws'], st(42, 22, 0, 9, 10, 10, 7, 4, 20, 6, 38, 0), { size: 2, skill: 'frozenRage', glyph: 'YR' }),
  // Subrosians (their templates are in units.ts; these let them appear in Subrosia's rosters and faction)
  e('subrosianWarrior', 'Subrosian Warrior', 'subrosianInfantry', 'subrosian', ['subrosianSpear'], st(24, 9, 0, 9, 8, 8, 4, 5, 7, 5, 22, 0), { skill: 'volcanicNative', glyph: 'SW' }),
  e('subrosianMiner', 'Subrosian Miner', 'subrosianExcavator', 'subrosian', ['subrosianPick'], st(24, 9, 0, 10, 8, 8, 3, 9, 8, 5, 24, 0), { skill: 'oreHunter', glyph: 'SM' }),
  e('subrosianSorcerer', 'Subrosian Sorcerer', 'subrosianFireMage', 'subrosian', ['lavaSpell'], st(20, 2, 15, 11, 9, 3, 12, 7, 4, 5, 14, 32), { skill: 'volcanicMagic', glyph: 'SS' }),
  e('subrosianThief', 'Subrosian Thief', 'subrosianRogue', 'subrosian', ['subrosianDagger', 'subrosianSling'], st(20, 6, 3, 13, 15, 4, 5, 13, 4, 7, 20, 6), { skill: 'sneakySwap', glyph: 'ST' }),
  e('subrosianBlacksmith', 'Subrosian Blacksmith', 'subrosianHeavy', 'subrosian', ['subrosianHammer'], st(30, 12, 0, 12, 6, 11, 4, 6, 12, 4, 28, 0), { skill: 'masterSmith', glyph: 'SB' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  b({ id: 'blaaz', name: 'Blaaz', title: 'Master of Fire', home: 'isleOfEmber', race: 'demon', classId: 'fireDemon', size: 3, glyph: 'BZ',
    weapons: ['blaazFireball', 'demonClaw'], skill: 'flameDivision', abilities: ['fireballBarrage', 'flameDivisionAbility', 'burningTeleport', 'infernalBlast'],
    stats: st(65, 13, 26, 15, 12, 12, 23, 5, 22, 6, 25, 55),
    quote: '(A tall shape in a dark red robe spreads its arms in the Temple of Fire. Three flames peel away from it.)', drops: ['blaazsFlame'] }),
  b({ id: 'cyclok', name: 'Cyclok', title: 'Stirrer of Winds', home: 'isleOfGust', race: 'monster', classId: 'windSorcerer', size: 3, glyph: 'CY',
    weapons: ['cyclokGust', 'cyclokTentacle'], skill: 'tornadoRider', abilities: ['tornadoSummoning', 'windScythe', 'aerialDive', 'cycloneBarrage'],
    stats: st(60, 10, 28, 16, 16, 10, 22, 7, 20, 8, 25, 60),
    quote: '(An octopus rides a whirlwind over the Wind Temple, too high for any sword. Bombs drift up the cyclones...)', drops: ['cyclokWindStaff'] }),
  b({ id: 'crayk', name: 'Crayk', title: 'Bane of Courage', home: 'molidaIsland', race: 'aquatic', classId: 'invisibleCrustacean', size: 3, glyph: 'CR',
    weapons: ['craykPincers'], skill: 'invisibleHunter', abilities: ['pincerCrush', 'invisiblePursuit', 'craykletSummoning', 'shellDefense'],
    stats: st(75, 23, 8, 14, 15, 22, 12, 5, 30, 7, 38, 20),
    quote: '(Something clicks in the dark of the Temple of Courage. You can\'t see it. It can see you.)', drops: ['geozardShield'] }),
  ...[['1', 'Red'], ['2', 'Blue'], ['3', 'Gold'], ['4', 'Green']].map(([n, c]) => b({
    id: `cubusSister${n}`, name: `Cubus Sister (${c})`, title: 'Ghost Sorceress', home: 'ghostShipPH', race: 'undead', classId: 'ghostSorceress', size: 1, glyph: `C${n}`,
    weapons: ['cubusBolt'], skill: 'deadMansVolley', abilities: ['cubusVolley', 'combinedBarrage'], stats: st(26, 3, 20, 15, 12, 4, 19, 9, 4, 6, 14, 45),
    quote: n === '1' ? '"Ooh, a visitor! Shall we play? We\'ll bounce our little ball back and forth... and you\'re in the middle!"' : '(Another sister giggles from the rigging.)', drops: ['cubusOrb'],
  })),
  b({ id: 'dongorongo', name: 'Dongorongo', title: 'Armored Lizard', home: 'goronIsland', race: 'monster', classId: 'armoredLizard', size: 4, glyph: 'DG',
    weapons: ['dongorongoBite', 'dongorongoFlame'], skill: 'exposedInterior', abilities: ['armoredCharge', 'tailSweep', 'dongorongoFlameBreath', 'crushingStomp'],
    stats: st(95, 27, 15, 10, 8, 28, 14, 4, 38, 5, 45, 30),
    quote: '(A great red lizard with a crystal-studded shell turns its armored face toward you. Swords skid off. Its jaws open wide...)', drops: ['geozardBlade'] }),
  b({ id: 'eox', name: 'Eox', title: 'Ancient Stone Soldier', home: 'isleOfRuins', race: 'construct', classId: 'ancientStoneSoldier', size: 5, glyph: 'EX',
    weapons: ['eoxFist'], skill: 'structuralWeakness', abilities: ['stoneFist', 'earthquakeEox', 'crushingStomp', 'ancientReconstruction'],
    stats: st(125, 32, 5, 10, 4, 35, 18, 3, 50, 4, 50, 15),
    quote: '(The Cobble\'s last guardian rises from Mutoh\'s Temple, every joint grinding. Its fists are the size of houses.)', drops: ['cobbleRoyalArmor'] }),
  b({ id: 'bellum', name: 'Bellum', title: 'Evil Phantom', home: 'templeOfTheOceanKing', race: 'demon', classId: 'lifeDrainingDemon', size: 4, glyph: 'BL',
    weapons: ['bellumLash', 'bellumEyeBeam'], skill: 'lifeForceConsumption',
    abilities: ['tentacleStrike', 'phantomEyeSummoning', 'lifeForceDrain', 'spectralFlight', 'bellumPossession', 'maliciousRegeneration'],
    stats: st(110, 25, 35, 19, 15, 23, 30, 4, 38, 7, 45, 85),
    quote: '(At the bottom of the Temple of the Ocean King, a mass of tentacles and eyes. It has been drinking the Ocean King\'s life for a very long time.)', drops: ['bellumsTentacle', 'phantomArmor'] }),
  b({ id: 'bellumsGhostShip', name: "Bellum's Ghost Ship", title: 'Possessed Warship', home: 'bellumsWaters', race: 'vessel', classId: 'possessedWarship', size: 5, glyph: 'BG',
    weapons: ['ghostCannon', 'heavyCannon', 'ramming'], skill: 'spectralFleet', stats: st(150, 26, 30, 14, 9, 24, 26, 4, 50, 6, 45, 60),
    quote: '(A black ship bristling with spikes and golden cannons rises out of the sea, tentacles wrapped around its hull.)', drops: ['demonHullPart', 'demonCannonMountPart'] }),
  // ── Boss forms of recruitable characters ──
  b({ id: 'bellumbeckBoss', name: 'Bellumbeck', title: 'Possessed Duelist', home: 'finalDuel', race: 'phantom', classId: 'possessedDuelist', size: 1, glyph: 'BB',
    weapons: ['bellumbecksBlade', 'bellumEyeBeam'], skill: 'possessedArmor', abilities: ['phantomSwordStrike', 'spectralCounter', 'possessedCharge', 'lifeForceSlash'],
    stats: st(48, 24, 18, 23, 19, 22, 19, 4, 12, 7, 40, 35),
    quote: '"Heh... heh... You came all this way for me?" (Linebeck\'s voice, and Bellum\'s eye behind it.)', drops: ['warpPhantomArmor'] }),
  b({ id: 'joleneBoss', name: 'Jolene', title: 'Pirate Duelist', home: 'cannonIsland', race: 'hylian', classId: 'pirateDuelistPH', size: 1, glyph: 'JO',
    weapons: ['jolenesCutlass', 'pirateDagger'], skill: 'relentlessPursuitPH', abilities: ['pirateFlurry'], stats: st(30, 15, 2, 17, 16, 8, 5, 10, 9, 7, 32, 5),
    quote: '"LINEBECK! I\'ve found you at last! And you brought friends? Good. More to cut through."', drops: ['jolenesCutlass', 'jolenesHeadband'] }),
  b({ id: 'kingMutohBoss', name: 'King Mutoh', title: 'Ancient King', home: 'isleOfTheDead', race: 'cobble', classId: 'ancientKing', size: 1, glyph: 'KM',
    weapons: ['mutohsSceptre', 'cobbleRoyalSword'], skill: 'royalEngineering', abilities: ['cobbleConstruct'], stats: st(32, 7, 25, 18, 6, 10, 25, 15, 7, 4, 18, 60),
    quote: '"Who disturbs my rest? Prove yourself to my knights — and to me."', drops: ['cobbleRoyalSword'] }),
  b({ id: 'phantomVanguard', name: 'Phantom Vanguard', title: 'Temple Sentinel', home: 'mercayIsland', race: 'phantom', classId: 'phantomGuard', size: 1, glyph: 'PV',
    weapons: ['phantomBlade'], skill: 'phantomArmorSkill', stats: st(42, 15, 0, 12, 7, 12, 10, 3, 20, 5, 40, 0),
    quote: '(A Phantom stops its patrol. Its eye slit turns toward you — and its shield comes up.)', drops: ['phantomHelmet'] }),
];

/** Boss forms of recruitable characters (they share the character's progression). */
export const BOSS_AS_TEMPLATE: Record<string, string> = { bellumbeckBoss: 'bellumbeck', joleneBoss: 'jolene', kingMutohBoss: 'kingMutoh', phantomVanguard: 'phantom' };

// Regional rosters (existing ChuChus, Octoroks, Keese, Like Likes, Moldorms, Wizzrobes, Stalfos,
// Miniblins and the Wind Waker's monsters return; the Temple is the Phantoms' home).
export const ROSTERS: Record<string, string[]> = {
  mercayIsland: ['chuchuRed', 'chuchuGreen', 'octorok', 'keese', 'miniblin', 'chuchuBlue', 'phantomEye', 'moldorm'],
  templeOfTheOceanKing: ['phantom', 'phantom', 'swiftPhantom', 'warpPhantom', 'phantomEye', 'phantomEye', 'keese', 'stalfos'],
  isleOfEmber: ['fireKeese', 'chuchuRed', 'octorok', 'geozard', 'moldorm', 'keese', 'miniblin', 'likeLike'],
  cannonIsland: ['miniblin', 'bokoblin', 'octorok', 'chuchuYellow', 'keese', 'moldorm', 'seahat', 'likeLike'],
  isleOfGust: ['keese', 'octorok', 'moldorm', 'wizzrobe', 'seahat', 'chuchuYellow', 'likeLike', 'miniblin'],
  molidaIsland: ['octorok', 'chuchuBlue', 'likeLike', 'geozard', 'keese', 'moldorm', 'stalfos', 'miniblin'],
  ghostShipPH: ['stalfos', 'stalfos', 'redead', 'poe', 'keese', 'likeLike', 'phantomEye', 'chuchuGreen'],
  goronIsland: ['geozard', 'moldorm', 'fireKeese', 'chuchuRed', 'octorok', 'likeLike', 'wizzrobe', 'keese'],
  isleOfFrost: ['yookWarrior', 'yookIceBreather', 'yookBerserker', 'iceKeese', 'chuchuBlue', 'octorok', 'wizzrobe', 'likeLike'],
  isleOfTheDead: ['stalfos', 'stalfos', 'redead', 'poe', 'keese', 'wizzrobe', 'phantomEye', 'likeLike'],
  isleOfRuins: ['geozard', 'stalfos', 'wizzrobe', 'moldorm', 'keese', 'likeLike', 'phantom', 'octorok'],
  zauzsIsland: ['geozard', 'chuchuRed', 'octorok', 'keese', 'swiftPhantom', 'phantomEye', 'moldorm', 'miniblin'],
  bellumsWaters: ['seahat', 'bigOcto', 'octorok', 'phantomEye', 'keese', 'poe', 'warpPhantom', 'chuchuBlue'],
  finalDuel: ['phantom', 'swiftPhantom', 'warpPhantom', 'phantomEye', 'phantomEye', 'poe', 'stalfos', 'keese'],
  // The pending Subrosians return to Era of Legend's Subrosia (merged into its roster).
  subrosia: ['subrosianWarrior', 'subrosianMiner', 'subrosianThief'],
};

/** Each phantom region's bosses in order: the boss node fights the first not yet beaten (with the rest as partners). */
export const ROUTE_BOSSES: Record<string, string[]> = {
  mercayIsland: ['phantomVanguard'], isleOfEmber: ['blaaz'], cannonIsland: ['joleneBoss'], isleOfGust: ['cyclok'], molidaIsland: ['crayk'],
  ghostShipPH: ['cubusSister1', 'cubusSister2', 'cubusSister3', 'cubusSister4'], goronIsland: ['dongorongo'], isleOfFrost: ['gleeokFrost', 'gleeokFlame'],
  isleOfTheDead: ['kingMutohBoss'], isleOfRuins: ['eox'], zauzsIsland: ['phantomVanguard'], templeOfTheOceanKing: ['bellum'],
  bellumsWaters: ['bellumsGhostShip'], finalDuel: ['bellumbeckBoss'],
};
/** Regions whose boss node brings every listed boss at once (all must fall). */
export const PAIRED_PH_REGIONS = ['ghostShipPH', 'isleOfFrost'];

// The boss pools other campaigns (Random, the free-for-all) draw from.
export const REGION_BOSSES: Record<string, string[]> = {
  mercayIsland: ['phantomVanguard'], isleOfEmber: ['blaaz'], cannonIsland: ['joleneBoss'], isleOfGust: ['cyclok'], molidaIsland: ['crayk'],
  ghostShipPH: ['cubusSister1', 'cubusSister2', 'cubusSister3', 'cubusSister4'], goronIsland: ['dongorongo'], isleOfFrost: ['gleeokFrost'],
  isleOfTheDead: ['kingMutohBoss'], isleOfRuins: ['eox'], zauzsIsland: ['phantomVanguard'], templeOfTheOceanKing: ['bellum'],
  bellumsWaters: ['bellumsGhostShip'], finalDuel: ['bellumbeckBoss'],
};

/** Monster spoils in the phantom regions (dropped on defeat, 25%). */
export const PH_SPOILS: Record<string, string> = {
  phantom: 'phantomEssence', swiftPhantom: 'phantomEssence', warpPhantom: 'phantomEssence', phantomEye: 'sandsOfHoursVial', geozard: 'goronAmber',
};
