import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Monsters from the Skyward Sword design doc (all recruitable). Bokoblins, Moblins,
// Lizalfos, Stalfos, Keese, ChuChus, Octoroks, Wallmasters, Deku Babas and Bubbles
// are the existing entries; Beamos keeps its old enemy entry and gets a template.
export const ENEMIES: EnemyArchetype[] = [
  e('technoblin', 'Technoblin', 'ancientRaider', 'monster', ['technoblinBaton'], st(24, 8, 6, 10, 9, 5, 6, 4, 7, 5, 18, 12), { skill: 'electricWeaponry', glyph: 'TB' }),
  e('cursedBokoblin', 'Cursed Bokoblin', 'undeadRaider', 'undead', ['cursedGrasp'], st(28, 9, 5, 6, 4, 7, 8, 2, 9, 4, 18, 10), { skill: 'undyingGrasp', glyph: 'CB' }),
  e('ironShieldMoblin', 'Moblin (Iron Shield)', 'heavyDefender', 'monster', ['moblinSpear'], st(45, 15, 0, 8, 4, 20, 4, 4, 23, 3, 30, 0), { size: 2, skill: 'ironWall', glyph: 'IM' }),
  e('quadroBaba', 'Quadro Baba', 'quadroPlant', 'monster', ['quadroMaw'], st(30, 13, 3, 9, 6, 8, 5, 3, 12, 0, 20, 6), { size: 2, skill: 'alternatingMaw', glyph: 'QB', ai: 'stationary' }),
  e('furnix', 'Furnix', 'fireBird', 'fireCreature', ['furnixFlame'], st(28, 8, 12, 10, 14, 4, 10, 5, 8, 8, 20, 24), { size: 2, skill: 'blazingFlight', glyph: 'FX' }),
  e('pyrup', 'Pyrup', 'fireArtillery', 'fireCreature', ['pyrupFireball'], st(22, 4, 12, 9, 5, 8, 9, 4, 5, 3, 14, 22), { skill: 'shelteredFlame', glyph: 'PY' }),
  e('froak', 'Froak', 'explosiveCreature', 'monster', ['froakPuff'], st(16, 5, 9, 6, 7, 3, 4, 5, 3, 6, 12, 8), { skill: 'volatileBody', glyph: 'FR' }),
  e('ampilus', 'Ampilus', 'electricRoller', 'monster', ['ampilusRoll'], st(28, 10, 10, 8, 12, 12, 8, 4, 10, 7, 24, 20), { skill: 'chargedShell', glyph: 'AM' }),
  e('ampilusEgg', 'Ampilus Egg', 'electricHatchling', 'monster', ['eggSpark'], st(12, 0, 4, 3, 0, 6, 4, 3, 2, 0, 0, 8), { skill: 'rapidMaturation', glyph: 'AE', ai: 'stationary' }),
  e('aracha', 'Aracha', 'sandScorpion', 'monster', ['arachaSting'], st(18, 7, 0, 9, 12, 5, 3, 4, 3, 6, 16, 0), { skill: 'sandAmbush', glyph: 'AR' }),
  e('magmanos', 'Magmanos', 'magmaConstruct', 'fireCreature', ['magmaFist'], st(42, 16, 12, 7, 4, 14, 12, 3, 18, 4, 24, 22), { size: 2, skill: 'moltenBody', glyph: 'MG' }),
  e('sentrobe', 'Sentrobe', 'missileConstruct', 'ancientRobot', ['sentrobeMissileLauncher'], st(38, 8, 14, 13, 8, 12, 9, 2, 15, 5, 20, 28), { size: 2, skill: 'missileNetwork', glyph: 'SN' }),
  e('watcher', 'Watcher', 'silentRealmSpirit', 'trialSpirit', ['watcherGlare'], st(14, 2, 8, 16, 13, 2, 10, 5, 2, 8, 10, 18), { skill: 'intruderAlert', glyph: 'WA', ai: 'guard' }),
  e('earthGuardian', 'Earth Guardian', 'trialGuardian', 'trialSpirit', ['guardianClubNatural'], st(45, 18, 8, 11, 7, 16, 12, 3, 20, 6, 32, 18), { size: 2, skill: 'relentlessPursuit', glyph: 'EG' }),
  e('skyGuardian', 'Sky Guardian', 'skyTrialGuardian', 'trialSpirit', ['guardianClaws'], st(36, 14, 12, 12, 12, 10, 14, 3, 14, 9, 24, 26), { size: 2, skill: 'spectralPursuit', glyph: 'SG' }),
  e('remlit', 'Remlit', 'nocturnalBeast', 'monster', ['remlitClaws'], st(18, 5, 2, 9, 14, 3, 4, 10, 3, 7, 16, 4), { skill: 'nightTransformation', glyph: 'RL' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  // ── Bosses and minibosses (section 4; all recruitable) ──
  b({ id: 'scaldera', name: 'Scaldera', title: 'Pyroclastic Fiend', home: 'eldinVolcano', race: 'fireCreature', classId: 'pyroclasticFiend', size: 4, glyph: 'SC',
    weapons: ['scalderaBoulder', 'scalderaFireball'], skill: 'moltenPursuit', stats: st(65, 19, 12, 8, 8, 18, 12, 3, 30, 6, 35, 24),
    quote: '(A boulder of rock and magma rolls up the slope, its single eye glowing.)', drops: ['scalderasMoltenCore', 'fireshieldEarrings'] }),
  b({ id: 'moldarach', name: 'Moldarach', title: 'Thousand-Year Arachnid', home: 'lanayruDesert', race: 'monster', classId: 'thousandYearArachnid', size: 3, glyph: 'MO',
    weapons: ['moldarachPincer', 'moldarachTail'], skill: 'armoredPincers', stats: st(55, 16, 3, 12, 9, 17, 7, 4, 24, 6, 30, 6),
    quote: '(An Aracha that has lived a thousand years bursts out of the sand, pincers raised.)', drops: ['moldarachPincer', 'moldarachsAncientEye'] }),
  b({ id: 'koloktos', name: 'Koloktos', title: 'Ancient Automaton', home: 'ancientCistern', race: 'ancientRobot', classId: 'ancientAutomaton', size: 4, glyph: 'KO',
    weapons: ['koloktosGreatblade', 'koloktosArms'], skill: 'sixArmedArsenal', stats: st(80, 24, 8, 16, 7, 20, 12, 3, 35, 4, 45, 16),
    quote: '(A golden machine with six arms unfolds from the cistern floor and draws its swords.)', drops: ['koloktosGreatblade', 'koloktosCrown', 'koloktosGoldenArmor', 'koloktosGauntlets', 'koloktosPowerCore'] }),
  b({ id: 'tentalus', name: 'Tentalus', title: 'Abyssal Leviathan', home: 'lanayruSandSea', race: 'aquaticCreature', classId: 'abyssalLeviathan', size: 5, glyph: 'TE',
    weapons: ['tentalusTentacles', 'tentalusMaw'], skill: 'tentacleDominion', stats: st(90, 23, 15, 10, 6, 16, 15, 4, 38, 6, 40, 30),
    quote: '(Tentacles rise over the deck of the Sandship. Something enormous is climbing aboard.)', drops: ['tentalusTentacleCharm', 'waterDragonsScale'] }),
  b({ id: 'bilocyte', name: 'Bilocyte', title: 'Thunderhead Parasite', home: 'theSky', race: 'monster', classId: 'thunderheadParasite', size: 3, glyph: 'BI',
    weapons: ['bilocyteSpores', 'bilocyteLash'], skill: 'parasiticAttachment', stats: st(48, 12, 19, 13, 11, 8, 17, 3, 18, 7, 24, 38),
    quote: '(A great eye opens on the sky whale\'s back. Levias roars in pain.)', drops: ['bilocytesParasiteGem', 'leviasScale'] }),
  b({ id: 'imprisoned', name: 'The Imprisoned', title: 'Sealed Demon', home: 'sealedGrounds', race: 'sealedDemon', classId: 'sealedDemonClass', size: 5, glyph: 'IP',
    weapons: ['imprisonedStomp'], skill: 'unstoppableAscension', abilities: ['imprisonedRise'], stats: st(90, 25, 12, 6, 4, 20, 16, 2, 40, 4, 45, 25),
    quote: '(A mountain of black scales drags itself up out of the Sealed Grounds toward the Temple of Hylia.)', drops: ['demisesScales'] }),
  b({ id: 'imprisonedArmed', name: 'The Imprisoned (Armed Form)', title: 'Demonic Colossus', home: 'sealedGrounds', race: 'sealedDemon', classId: 'demonicColossus', size: 5, glyph: 'IA',
    weapons: ['imprisonedGrasp', 'imprisonedStomp'], skill: 'climbingHorror', abilities: ['imprisonedAscend'], stats: st(100, 29, 14, 8, 5, 22, 18, 2, 42, 5, 50, 30),
    quote: '(It has grown arms. It grabs the cliffside and pulls itself toward you.)', drops: ['demisesScales'] }),
  b({ id: 'imprisonedFlying', name: 'The Imprisoned (Flying Form)', title: 'Ascending Demon', home: 'sealedGrounds', race: 'sealedDemon', classId: 'ascendingDemon', size: 5, glyph: 'IF',
    weapons: ['imprisonedDive', 'imprisonedGrasp'], skill: 'brokenSeal', stats: st(105, 28, 20, 9, 8, 20, 20, 2, 42, 8, 45, 40),
    quote: '(The seal shatters. The Imprisoned rises on black wings and comes down on the temple.)', drops: ['demisesFlame'] }),
  b({ id: 'stalmaster', name: 'Stalmaster', title: 'Undead Swordmaster', home: 'skyKeep', race: 'undead', classId: 'undeadSwordmaster', size: 2, glyph: 'SM',
    weapons: ['stalmastersSword'], skill: 'fourArmedCombat', stats: st(42, 16, 2, 17, 11, 12, 7, 4, 17, 5, 35, 4),
    quote: '(Four arms, four swords, and every one of them is guarding something.)', drops: ['stalmastersSword', 'stalmastersBracers'] }),
  b({ id: 'scervo', name: 'LD-002G Scervo', title: 'Ancient Pirate', home: 'lanayruSandSea', race: 'ancientRobot', classId: 'ancientPirate', size: 1, glyph: 'SV',
    weapons: ['scervosCutlass'], skill: 'relentlessDuelist', stats: st(34, 13, 2, 16, 13, 10, 6, 5, 11, 6, 28, 4),
    quote: '"Haaaaargh! Walk the plank, landlubber!" (on a very narrow plank)', drops: ['scervosCutlass', 'ancientRobotPlating'] }),
  b({ id: 'dreadfuse', name: 'LD-003D Dreadfuse', title: 'Ancient Executioner', home: 'skyKeep', race: 'ancientRobot', classId: 'ancientExecutioner', size: 1, glyph: 'DF',
    weapons: ['dreadfusesBlade'], skill: 'electricCounter', stats: st(38, 14, 10, 17, 12, 12, 10, 4, 12, 6, 30, 20),
    quote: '(It clicks its jaw, spins its blade, and waits for you to swing first.)', drops: ['dreadfusesBlade', 'ancientMechanicalGrips'] }),
  b({ id: 'darkLizalfos', name: 'Dark Lizalfos', title: 'Reptilian Elite', home: 'fireSanctuary', race: 'monster', classId: 'reptilianElite', size: 1, glyph: 'DL',
    weapons: ['lizalfosBlade', 'cursedBreath'], skill: 'cursedBreathSkill', stats: st(32, 12, 8, 12, 13, 7, 9, 5, 9, 6, 24, 16),
    quote: '(Its gauntlet hisses. Its breath is darker than smoke.)', drops: ['silentRealmVestments'] }),
  // ── Region leaders: forms of recruitable characters (bossAsTemplate) ──
  b({ id: 'grooseRival', name: 'Groose', title: 'Rival Knight', home: 'skyloft', race: 'hylian', classId: 'siegeEngineer', size: 1, glyph: 'GR',
    weapons: ['skyKnightsSword'], skill: 'groosenatorSkill', stats: st(30, 11, 0, 9, 7, 8, 3, 6, 12, 5, 24, 0),
    quote: '"You stay away from Zelda! And from MY Wing Ceremony!" (He has hidden your Loftwing.)', drops: ['crimsonLoftwingMount', 'knightAcademyCrest'] }),
  b({ id: 'ghirahimBoss', name: 'Ghirahim', title: 'Demon Lord', home: 'faronWoodsSS', race: 'demonSword', classId: 'demonLord', size: 1, glyph: 'GH',
    weapons: ['ghirahimsBlade', 'ghirahimsDemonDarts'], skill: 'predictiveGuard', abilities: ['ghirahimTrueForm'], stats: st(36, 15, 16, 18, 17, 8, 13, 6, 10, 7, 30, 34),
    quote: '"I am the Demon Lord Ghirahim. Hmm. You didn\'t sit through that whole introduction for nothing, I hope?"', drops: ['ghirahimsBlade', 'ghirahimsMantle', 'ghirahimsDiamond'] }),
  b({ id: 'demiseBoss', name: 'Demise', title: 'Demon King', home: 'demonsRealm', race: 'demonDeity', classId: 'demonKing', size: 2, glyph: 'DE',
    weapons: ['demonKingsSword'], skill: 'eternalHatred', abilities: ['lightningSword', 'darkSkywardStrike'], stats: st(66, 27, 21, 16, 11, 18, 17, 4, 24, 5, 44, 44),
    quote: '"Ah, a young hero. Will you come at me? You will lose, of course."', drops: ['demonKingsSword', 'demisesScales', 'demisesFlame'] }),
];

export const ROSTERS: Record<string, string[]> = {
  skyloft: ['remlit', 'remlit', 'keese', 'bokoblin', 'bokoblin', 'chuchuBlue', 'moblin'],
  theSky: ['keese', 'fireKeese', 'remlit', 'bokoblin', 'bokoblin', 'moblin', 'furnix', 'furnix', 'technoblin'],
  faronWoodsSS: ['bokoblin', 'bokoblin', 'dekuBaba', 'quadroBaba', 'octorok', 'keese', 'chuchuGreen'],
  eldinVolcano: ['bokoblin', 'fireKeese', 'pyrup', 'magmanos', 'redBubble', 'chuchuRed', 'lizalfos', 'froak'],
  lanayruDesert: ['technoblin', 'technoblin', 'ampilus', 'ampilusEgg', 'aracha', 'sentrobe', 'beamos', 'chuchuYellow', 'froak'],
  lanayruSandSea: ['technoblin', 'technoblin', 'beamos', 'sentrobe', 'octorok', 'chuchuYellow'],
  ancientCistern: ['cursedBokoblin', 'cursedBokoblin', 'stalfos', 'chuchuBlue', 'dekuBaba', 'quadroBaba', 'keese'],
  fireSanctuary: ['fireKeese', 'magmanos', 'pyrup', 'lizalfos', 'chuchuRed', 'ironShieldMoblin', 'stalfos', 'furnix'],
  sealedGrounds: ['bokoblin', 'bokoblin', 'moblin', 'ironShieldMoblin', 'cursedBokoblin', 'lizalfos', 'technoblin'],
  skyKeep: ['stalfos', 'ironShieldMoblin', 'lizalfos', 'sentrobe', 'beamos', 'quadroBaba', 'cursedBokoblin', 'magmanos', 'watcher', 'earthGuardian', 'skyGuardian'],
  demonsRealm: ['ironShieldMoblin', 'cursedBokoblin', 'moblin', 'lizalfos', 'stalfos', 'keese', 'magmanos'],
};

export const REGION_BOSSES: Record<string, string[]> = {
  skyloft: ['grooseRival'],
  theSky: ['bilocyte'],
  faronWoodsSS: ['ghirahimBoss'],
  eldinVolcano: ['scaldera'],
  lanayruDesert: ['moldarach'],
  lanayruSandSea: ['scervo', 'tentalus'],
  ancientCistern: ['koloktos'],
  fireSanctuary: ['darkLizalfos', 'ghirahimBoss'],
  sealedGrounds: ['imprisoned', 'imprisonedArmed', 'imprisonedFlying'],
  skyKeep: ['stalmaster', 'dreadfuse'],
  demonsRealm: ['demiseBoss'],
};

/** Monster spoils dropped on defeat (section 18 pack items). */
export const SPOILS: Record<string, string> = {
  remlit: 'remlitTreat', froak: 'froakSac', ampilus: 'ampilusShell', furnix: 'furnixFeather', quadroBaba: 'quadroBabaSeed', sentrobe: 'sentrobeDrone',
  earthGuardian: 'guardianSignal', skyGuardian: 'guardianSignal', magmanos: 'magmanosCore',
};

/** Crafting materials monsters leave behind (into the army's material bag). */
export const MATERIAL_DROPS: Record<string, string[]> = {
  bokoblin: ['monsterClaw', 'monsterHorn'], technoblin: ['amberRelic', 'monsterClaw'], cursedBokoblin: ['ornamentalSkull', 'monsterHorn'], ironShieldMoblin: ['monsterHorn', 'eldinOre'],
  moblin: ['monsterHorn'], lizalfos: ['lizardTail'], darkLizalfos: ['lizardTail', 'evilCrystal'], stalfos: ['ornamentalSkull'], stalmaster: ['goldenSkull'],
  chuchuRed: ['jellyBlob'], chuchuBlue: ['jellyBlob'], chuchuGreen: ['jellyBlob'], chuchuYellow: ['jellyBlob'], keese: ['monsterClaw'], fireKeese: ['monsterClaw'],
  quadroBaba: ['hornetLarvae'], dekuBaba: ['hornetLarvae'], octorok: ['jellyBlob'], aracha: ['monsterClaw'], ampilus: ['ancientFlower'], sentrobe: ['ancientFlower', 'amberRelic'],
  beamos: ['amberRelic'], magmanos: ['eldinOre'], pyrup: ['eldinOre'], furnix: ['birdFeather'], remlit: ['tumbleweed'], froak: ['jellyBlob'],
  watcher: ['duskRelic'], earthGuardian: ['duskRelic'], skyGuardian: ['blueBirdFeather'], ghirahimBoss: ['evilCrystal', 'goldenSkull'], demiseBoss: ['evilCrystal', 'goldenSkull'],
  scaldera: ['eldinOre', 'goldenSkull'], moldarach: ['goldenSkull', 'ancientFlower'], koloktos: ['goldenSkull', 'ancientFlower'], tentalus: ['goldenSkull'], bilocyte: ['blueBirdFeather', 'evilCrystal'],
  imprisoned: ['evilCrystal'], imprisonedArmed: ['evilCrystal'], imprisonedFlying: ['evilCrystal', 'goldenSkull'], scervo: ['ancientFlower'], dreadfuse: ['ancientFlower', 'goldenSkull'], grooseRival: ['birdFeather'],
};
