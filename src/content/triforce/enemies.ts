import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 2's monsters (Fire Keeleon is the Keeleon with a fire modifier: engine/triforce.ts), and the Mini-Margos
// Margoma summons. The Drablands' returning monsters keep their entries.
export const ENEMIES: EnemyArchetype[] = [
  e('totemArmos', 'Totem Armos', 'stackedGuardianClass', 'monster', ['totemArmosClub'], st(42, 18, 5, 10, 5, 24, 12, 4, 24, 4, 35, 15), { size: 2, skill: 'stackedGuardian', glyph: 'TA' }),
  e('keeleon', 'Keeleon', 'chameleonClass', 'monster', ['keeleonTongue'], st(25, 12, 6, 16, 17, 6, 9, 8, 7, 7, 25, 15), { skill: 'chameleonTF', glyph: 'KE' }),
  e('hokkubokku', 'Hokkubokku', 'segmentedClass', 'monster', ['hokkubokkuSlam'], st(38, 18, 4, 12, 9, 16, 7, 5, 18, 5, 30, 10), { size: 2, skill: 'hokkuSegments', glyph: 'HK' }),
  e('miniMargo', 'Mini-Margo', 'miniMargoClass', 'construct', ['miniMargoSpikes'], st(18, 10, 0, 8, 10, 10, 4, 3, 6, 5, 20, 0), { glyph: 'mm' }),
];

const b = (d: BossDef): BossDef => d;

// Section 3's bosses and minibosses (doc stats), the Hinox Brothers (the existing Hinox with boss modifiers: their own
// names and gear, Lil' Hinox at reduced size) and Lady Maud's boss form (a form of the recruitable Lady Maud).
export const BOSSES: BossDef[] = [
  b({ id: 'margoma', name: 'Margoma', title: 'Armored Spinner', home: 'woodlandsTF', race: 'construct', classId: 'armoredSpinner', size: 3, glyph: 'MA',
    weapons: ['margomaSpikes', 'margomaEyeBeam'], skill: 'rotatingFortress', abilities: ['spinningCharge', 'spikedDefense', 'crushingSpin', 'miniMargoSummon'],
    stats: st(95, 27, 8, 15, 17, 30, 15, 5, 35, 7, 50, 20),
    quote: '(A spiked iron disc the size of a house spins up out of the forest floor. On top, a single eye opens.)', drops: ['dapperSpinnerKit'] }),
  b({ id: 'blizzagia', name: 'Blizzagia', title: 'Ice Dragon', home: 'iceCavernTF', race: 'monster', classId: 'iceDragon', size: 4, glyph: 'BZ',
    weapons: ['blizzagiaFangs', 'blizzagiaBreath'], skill: 'frozenDragon', abilities: ['freezingBreathTF', 'icePillarTF', 'undergroundDive', 'blizzardTF'],
    stats: st(110, 26, 34, 17, 14, 25, 30, 5, 38, 7, 45, 80),
    quote: '(The ice cracks. A serpent crowned in crystals rises out of the floor, breathing frost.)', drops: ['cozyParka'] }),
  b({ id: 'ladysPets', name: "The Lady's Pets", title: 'Composite Monster', home: 'fortressTF', race: 'monster', classId: 'compositeMonster', size: 4, glyph: 'LP',
    weapons: ['petsFangs', 'petsBolts'], skill: 'threefoldBeast', abilities: ['coordinatedAssaultTF', 'elementalProjectile', 'crushingCharge', 'combinedAttack'],
    stats: st(120, 28, 25, 17, 12, 24, 22, 6, 40, 6, 50, 65),
    quote: '(A pink, spiked crown-disc with three glowing faces lumbers into the Fortress. Lady Maud\'s pets are hungry.)', drops: ['showstopper'] }),
  b({ id: 'stalchampion', name: 'Stalchampion', title: 'Undead Swordmaster', home: 'dunesTF', race: 'undead', classId: 'stalSwordmaster', size: 3, glyph: 'SC',
    weapons: ['stalchampionBlade'], skill: 'toweringSwordsman', abilities: ['giantSwordSlash', 'shieldDefense', 'skeletalRecovery', 'groundSmash'],
    stats: st(105, 34, 10, 23, 11, 30, 18, 5, 38, 5, 55, 25),
    quote: '(A towering skeleton in a crown of bone rises from the sand, a sword as long as a tree over its shoulder.)', drops: ['stalchampionsSword', 'swordSuit'] }),
  b({ id: 'prismantus', name: 'Prismantus', title: 'Magical Construct', home: 'ruinsTF', race: 'construct', classId: 'magicalConstruct', size: 3, glyph: 'PR',
    weapons: ['prismantusBeam'], skill: 'rotatingPrism', abilities: ['prismBeam', 'rotatingBarrage', 'magicalBarrierTF', 'segmentRestoration'],
    stats: st(100, 18, 35, 22, 14, 26, 30, 4, 32, 6, 35, 85),
    quote: '(A great eye in a ring of red, green and blue lenses turns slowly in the Ruins. Each colour hums a different note.)', drops: ['lightArmor'] }),
  b({ id: 'ladyMaudBoss', name: 'Lady Maud', title: 'Fashion Witch', home: 'skyRealmTF', race: 'hytopian', classId: 'fashionWitch', size: 1, glyph: 'LM',
    weapons: ['maudParasolBolt'], skill: 'fashionCurseSkill', abilities: ['fashionCurse', 'parasolBarrage', 'magicalReflection', 'witchsEnsemble', 'grandCurse'],
    stats: st(70, 8, 32, 20, 17, 13, 29, 10, 9, 6, 30, 120),
    quote: '"Darlings! Those outfits are simply TRAGIC. Let me fix them for you — permanently."', drops: ['ladyMaudsParasol', 'ladysEnsemble'] }),
  // ── Minibosses ──
  b({ id: 'electricBlobKing', name: 'Electric Blob King', title: 'Electrical Crown', home: 'riversideTF', race: 'monster', classId: 'electricBlobClass', size: 3, glyph: 'EK',
    weapons: ['blobKingShock'], skill: 'electricalCrown',
    stats: st(65, 15, 25, 12, 8, 16, 22, 5, 28, 5, 30, 55),
    quote: '(A yellow blob in a tiny crown wobbles forward. The air around it crackles.)', drops: ['energyGear'] }),
  b({ id: 'electricBlobQueen', name: 'Electric Blob Queen', title: 'Electric Brood', home: 'riversideTF', race: 'monster', classId: 'electricBlobClass', size: 3, glyph: 'EQ',
    weapons: ['blobQueenShock'], skill: 'electricBrood',
    stats: st(70, 12, 29, 15, 8, 15, 25, 7, 28, 5, 28, 65),
    quote: '(A purple blob with enormous eyelashes bats them at you. Little blobs gather around her.)', drops: ['cheerOutfit'] }),
  b({ id: 'freezlord', name: 'Freezlord', title: 'Living Glacier', home: 'iceCavernTF', race: 'construct', classId: 'livingGlacierClass', size: 3, glyph: 'FL',
    weapons: ['freezlordShard'], skill: 'livingGlacier',
    stats: st(80, 20, 28, 13, 6, 26, 25, 4, 32, 4, 35, 60),
    quote: '(A wall of ice with a mouth full of icicles grinds across the cavern.)', drops: ['cozyParka'] }),
  b({ id: 'vultureVizier', name: 'Vulture Vizier', title: 'Desert Sovereign', home: 'dunesTF', race: 'monster', classId: 'desertSovereignClass', size: 2, glyph: 'VV',
    weapons: ['vizierTalons', 'vizierGust'], skill: 'desertSovereign',
    stats: st(60, 18, 22, 18, 22, 12, 16, 8, 15, 9, 35, 45),
    quote: '(A great red-headed vulture circles overhead, beating the sand into a storm.)', drops: ['dunewalkerDuds'] }),
  b({ id: 'grimRepoe', name: 'Grim Repoe', title: 'Spectral Reaper', home: 'ruinsTF', race: 'undead', classId: 'spectralReaperClass', size: 2, glyph: 'GR',
    weapons: ['repoeScythe'], skill: 'spectralReaper',
    stats: st(65, 23, 26, 21, 17, 14, 26, 5, 18, 7, 40, 60),
    quote: '(A hooded ghost in a jewelled collar drifts through the wall, scythe first.)', drops: ['grimRepoesScythe'] }),
  b({ id: 'gigaleon', name: 'Gigaleon', title: 'Perfect Camouflage', home: 'volcanoTF', race: 'monster', classId: 'camouflageBeast', size: 3, glyph: 'GG',
    weapons: ['gigaleonTongue'], skill: 'perfectCamouflage',
    stats: st(85, 27, 12, 22, 18, 18, 14, 6, 30, 7, 45, 30),
    quote: '(The air shimmers. An orange crown of spikes on a golden base flickers into sight — and is gone again.)', drops: ['ninjaGi'] }),
  b({ id: 'hinoxEldest', name: 'Hinox the Eldest', title: 'Hinox Brothers', home: 'woodlandsTF', race: 'monster', classId: 'giantBruiser', size: 3, glyph: 'H1',
    weapons: ['hinoxStomp', 'hinoxTreeThrow'], skill: 'giantsGrasp', abilities: ['hinoxBombToss'],
    stats: st(88, 25, 0, 8, 5, 18, 6, 4, 40, 4, 45, 10),
    quote: '"Little brothers! Bombs!" (The biggest Hinox lights a fuse.)', drops: ['bigBombOutfit'] }),
  b({ id: 'hinoxElder', name: 'Hinox the Elder', title: 'Hinox Brothers', home: 'woodlandsTF', race: 'monster', classId: 'giantBruiser', size: 3, glyph: 'H2',
    weapons: ['hinoxStomp', 'hinoxTreeThrow'], skill: 'giantsGrasp', abilities: ['hinoxBombToss'],
    stats: st(74, 23, 0, 8, 6, 16, 6, 4, 34, 4, 40, 10),
    quote: '(The middle Hinox picks up a tree and looks for something to hit with it.)', drops: ['hammerwear'] }),
  b({ id: 'lilHinox', name: "Lil' Hinox", title: 'Hinox Brothers', home: 'woodlandsTF', race: 'monster', classId: 'giantBruiser', size: 2, glyph: 'H3',
    weapons: ['hinoxStomp'], skill: 'giantsGrasp',
    stats: st(48, 17, 0, 9, 9, 12, 5, 6, 22, 5, 35, 5),
    quote: '(The smallest Hinox is still very large, and very cross about being called Lil\'.)', drops: ['cheerOutfit'] }),
];

/** Each region's final boss (section 8). The Shadow Links are the Four Swords Adventures Shadow Link, three of them. */
export const ROUTE_BOSSES: Record<string, string[]> = {
  woodlandsTF: ['margoma'], riversideTF: ['arrghus'], volcanoTF: ['moldormBoss'], iceCavernTF: ['blizzagia'], fortressTF: ['ladysPets'],
  dunesTF: ['stalchampion'], ruinsTF: ['prismantus'], skyRealmTF: ['ladyMaudBoss'], denOfTrialsTF: ['shadowLink'],
};
/** Regions whose boss comes with copies of itself (all must fall): the Den of Trials' three Shadow Links. */
export const BOSS_COPIES: Record<string, number> = { denOfTrialsTF: 2 };

// Boss pools (elite fights in this campaign, other campaigns, the Random campaign and the free-for-all).
export const REGION_BOSSES: Record<string, string[]> = {
  woodlandsTF: ['hinoxEldest', 'hinoxElder', 'lilHinox'], riversideTF: ['electricBlobKing', 'electricBlobQueen'], volcanoTF: ['gigaleon'],
  iceCavernTF: ['freezlord', 'blizzagia'], fortressTF: ['grimRepoe', 'electricBlobQueen', 'ladysPets'], dunesTF: ['vultureVizier', 'stalchampion'],
  ruinsTF: ['grimRepoe', 'gigaleon', 'prismantus'], skyRealmTF: ['vultureVizier', 'electricBlobKing', 'ladyMaudBoss'],
  denOfTrialsTF: ['freezlord', 'grimRepoe', 'gigaleon', 'vultureVizier'],
};

// Regional rosters: the three new monsters and the returning Drablands monsters (section 2).
export const ROSTERS: Record<string, string[]> = {
  woodlandsTF: ['octorok', 'keese', 'moblin', 'buzzBlob', 'keeleon', 'rope', 'tektite'],
  riversideTF: ['octorok', 'skullfish', 'leever', 'buzzBlob', 'keeleon', 'tektite', 'terrorpin'],
  volcanoTF: ['keeleon', 'keese', 'hokkubokku', 'aeralfos', 'beamos', 'tektite'],
  iceCavernTF: ['freezard', 'miniFreezard', 'keese', 'wizzrobe', 'hokkubokku', 'tektite'],
  fortressTF: ['ballChainSoldier', 'moblin', 'totemArmos', 'wizzrobe', 'beamos', 'stalfos', 'gimos'],
  dunesTF: ['leever', 'gibdo', 'hokkubokku', 'stalfos', 'morth', 'poe', 'tektite'],
  ruinsTF: ['totemArmos', 'poe', 'ghini', 'redead', 'wallmaster', 'gibdo', 'stalfos'],
  skyRealmTF: ['aeralfos', 'keeleon', 'totemArmos', 'wizzrobe', 'beamos', 'ballChainSoldier'],
  denOfTrialsTF: ['totemArmos', 'hokkubokku', 'keeleon', 'stalfos', 'wizzrobe', 'hinox', 'redead', 'gimos'],
};
