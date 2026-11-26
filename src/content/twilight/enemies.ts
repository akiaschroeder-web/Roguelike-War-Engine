import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Monsters from the Twilight Princess design doc (all recruitable).
export const ENEMIES: EnemyArchetype[] = [
  e('bulblin', 'Bulblin', 'raider', 'monster', ['bulblinClub'], st(24, 8, 0, 8, 8, 5, 3, 5, 8, 5, 18, 0), { skill: 'raidersMomentum', glyph: 'BU' }),
  e('bulblinArcher', 'Bulblin Archer', 'raiderArcher', 'monster', ['fireArrows'], st(21, 6, 0, 11, 9, 4, 3, 5, 6, 5, 16, 0), { skill: 'fireVolley', glyph: 'BA' }),
  e('wildBullbo', 'Bullbo', 'ridingBeast', 'bullbo', ['bullboTusks'], st(35, 13, 0, 6, 10, 9, 4, 5, 18, 7, 28, 0), { size: 2, skill: 'wildCharge', glyph: 'BB' }),
  e('babaSerpent', 'Baba Serpent', 'predatoryPlant', 'monster', ['babaJaws'], st(22, 9, 2, 8, 7, 4, 3, 4, 6, 4, 16, 4), { skill: 'severedStalk', glyph: 'BS' }),
  e('bigBaba', 'Big Baba', 'giantPlant', 'monster', ['bigBabaMaw'], st(42, 16, 4, 7, 3, 10, 6, 3, 20, 0, 24, 8), { size: 3, skill: 'devouringMaw', glyph: 'BI', ai: 'stationary' }),
  e('shadowBeast', 'Shadow Beast', 'twilightMonster', 'twilit', ['shadowClaws'], st(36, 14, 8, 9, 10, 10, 9, 3, 16, 6, 24, 20), { size: 2, skill: 'twilightRevival', glyph: 'SB' }),
  e('shadowKargarok', 'Shadow Kargarok', 'twilightFlyer', 'twilit', ['shadowTalons'], st(32, 11, 5, 10, 13, 6, 7, 4, 13, 8, 24, 12), { size: 2, skill: 'shadowFlight', glyph: 'SK' }),
  e('shadowBulblin', 'Shadow Bulblin', 'twilightRaider', 'twilit', ['shadowClaws'], st(26, 10, 4, 8, 9, 6, 7, 3, 9, 5, 20, 10), { skill: 'twilightEmpowerment', glyph: 'SL' }),
  e('shadowDekuBaba', 'Shadow Deku Baba', 'twilightPlant', 'twilit', ['babaJaws'], st(24, 9, 6, 7, 4, 5, 7, 3, 7, 0, 14, 14), { skill: 'corruptedRoots', glyph: 'SD', ai: 'stationary' }),
  e('shadowKeese', 'Shadow Keese', 'twilightBat', 'twilit', ['mpDrainBite'], st(12, 4, 5, 9, 14, 2, 5, 3, 2, 8, 10, 10), { skill: 'shadowBite', glyph: 'SE' }),
  e('twilitVermin', 'Twilit Vermin', 'twilightCreatureClass', 'twilit', ['twilitBite'], st(14, 5, 2, 7, 12, 3, 4, 3, 3, 6, 12, 4), { skill: 'swarmingDarkness', glyph: 'TV' }),
  e('shadowInsect', 'Shadow Insect', 'twilightParasite', 'twilit', ['parasiteSting'], st(15, 4, 7, 9, 12, 2, 7, 4, 2, 7, 12, 16), { skill: 'invisibleParasite', glyph: 'SI' }),
  e('twilitBloat', 'Twilit Bloat', 'giantShadowInsect', 'twilit', ['bloatShock'], st(48, 13, 17, 11, 12, 8, 13, 4, 23, 7, 26, 30), { size: 3, skill: 'electricalAmbush', glyph: 'TB' }),
  e('helmasaur', 'Helmasaur', 'armoredBeast', 'monster', ['helmetFace'], st(25, 9, 0, 7, 8, 13, 3, 4, 10, 5, 18, 0), { skill: 'armoredFace', glyph: 'HM' }),
  e('helmasaurus', 'Helmasaurus', 'heavyArmoredBeast', 'monster', ['heavyHelmetCharge'], st(40, 15, 0, 8, 6, 19, 5, 4, 21, 4, 28, 0), { size: 2, skill: 'heavyCarapace', glyph: 'HU' }),
  e('toadpoli', 'Toadpoli', 'amphibianArtillery', 'monster', ['toadpoliFire'], st(18, 4, 8, 10, 7, 3, 5, 4, 4, 5, 12, 16), { skill: 'fireSpit', glyph: 'TO' }),
  e('bombling', 'Bombling', 'explosiveInsect', 'monster', ['bomblingBlast'], st(12, 3, 0, 8, 11, 2, 3, 4, 2, 6, 10, 0), { skill: 'livingExplosive', glyph: 'BG' }),
  e('tileWorm', 'Tile Worm', 'burrowingParasite', 'monster', ['wormBite'], st(18, 7, 0, 8, 9, 5, 3, 3, 4, 4, 14, 0), { skill: 'hiddenBeneath', glyph: 'TW' }),
  e('moldorm', 'Moldorm', 'burrowingWorm', 'monster', ['moldormBite'], st(22, 8, 0, 7, 11, 5, 3, 4, 6, 6, 18, 0), { skill: 'sandBurrow', glyph: 'MD' }),
  e('poisonMite', 'Poison Mite', 'parasiticSwarm', 'monster', ['miteBite'], st(8, 2, 0, 8, 10, 1, 2, 3, 1, 5, 8, 0), { skill: 'clingingSwarm', glyph: 'PM' }),
  e('ghoulRat', 'Ghoul Rat', 'spectralParasite', 'undead', ['ghostlyBurden'], st(10, 3, 5, 9, 12, 1, 8, 3, 1, 6, 10, 12), { skill: 'invisibleBurden', glyph: 'GR' }),
  e('redeadKnight', 'ReDead Knight', 'undeadHeavyInfantry', 'undead', ['redeadKnightBlade'], st(40, 16, 8, 8, 3, 14, 10, 3, 20, 3, 26, 16), { size: 2, skill: 'paralyzingScream', glyph: 'RK' }),
  e('chilfos', 'Chilfos', 'iceInfantry', 'monster', ['chilfosSpear'], st(26, 9, 10, 11, 8, 7, 11, 4, 9, 5, 18, 20), { skill: 'frozenArmament', glyph: 'CH' }),
  e('miniFreezard', 'Mini Freezard', 'iceConstruct', 'construct', ['slidingIce'], st(16, 5, 7, 5, 9, 8, 8, 3, 5, 5, 12, 14), { skill: 'slidingCollision', glyph: 'MF' }),
  e('whiteWolfos', 'White Wolfos', 'arcticBeast', 'monster', ['wolfosClaws'], st(28, 11, 0, 11, 15, 5, 5, 6, 8, 8, 24, 0), { skill: 'snowPredator', glyph: 'WW' }),
  e('skullfish', 'Skullfish', 'skeletalFish', 'undead', ['boneJaws'], st(20, 8, 0, 8, 12, 5, 6, 3, 5, 7, 16, 0), { skill: 'undeadSwimmer', glyph: 'SF' }),
  e('aeralfos', 'Aeralfos', 'flyingReptilianKnight', 'monster', ['aeralfosSword'], st(36, 13, 2, 14, 14, 10, 6, 5, 15, 8, 28, 4), { size: 2, skill: 'aerialDuelist', glyph: 'AE' }),
  // Boss parts and minor specials (recruitable on their own)
  e('ooksParasite', "Ook's Parasite", 'twilightParasite', 'twilit', ['possession'], st(12, 2, 12, 9, 10, 2, 10, 3, 2, 5, 8, 24), { skill: 'possessionSkill', glyph: 'OP' }),
  e('stallordsHead', "Stallord's Head", 'undeadConstruct', 'undead', ['skullBolt'], st(48, 10, 18, 12, 15, 10, 14, 3, 20, 8, 24, 35), { size: 3, skill: 'floatingSkull', glyph: 'SH' }),
  e('armogohmasEye', "Armogohma's Eye", 'arachnidParasite', 'monster', ['eyeRoll'], st(15, 3, 6, 8, 15, 2, 5, 4, 2, 8, 12, 12), { skill: 'emergencyEscape', glyph: 'AY' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  // ── Dungeon bosses ──
  b({ id: 'diababa', name: 'Diababa', title: 'Twilit Parasite', home: 'faronWoods', race: 'twilit', classId: 'twilitParasiteBoss', size: 4, glyph: 'DI',
    weapons: ['tripleMaw'], skill: 'tripleMaw', stats: st(65, 17, 15, 10, 3, 12, 13, 4, 30, 0, 30, 30), ai: 'stationary',
    quote: '(Three heads rise from the poison swamp. A monkey watches from the vines.)', drops: ['faronsBlessing', 'ordonShield'] }),
  b({ id: 'fyrus', name: 'Fyrus', title: 'Twilit Igniter', home: 'eldinProvince', race: 'twilit', classId: 'twilitIgniter', size: 4, glyph: 'FY',
    weapons: ['fyrusChains'], skill: 'infernalChains', stats: st(75, 23, 12, 9, 7, 16, 10, 4, 35, 5, 40, 24),
    quote: '(The Goron Patriarch, burning from within, strains at his shackles.)', drops: ['fyrusChains', 'eldinsBlessing'] }),
  b({ id: 'morpheel', name: 'Morpheel', title: 'Twilit Aquatic Beast', home: 'lanayruProvince', race: 'twilit', classId: 'twilitAquaticBeast', size: 5, glyph: 'MP',
    weapons: ['morpheelMaw'], skill: 'abyssalPredator', stats: st(85, 22, 8, 10, 12, 14, 12, 4, 38, 8, 40, 20),
    quote: '(Tentacles rise from the deep; something huge waits beneath.)', drops: ['morpheelsEye', 'zoraArmor'] }),
  b({ id: 'stallord', name: 'Stallord', title: 'Twilit Fossil', home: 'gerudoDesertTP', race: 'undead', classId: 'twilitFossil', size: 5, glyph: 'ST',
    weapons: ['stallordClaws', 'stallordsBoneDisc'], skill: 'ancientResurrection', stats: st(90, 24, 16, 8, 4, 19, 15, 3, 40, 3, 40, 35),
    quote: '(A sword in its skull. Zant\'s magic pulls the bones together.)', drops: ['stallordsBoneDisc', 'stallordsBoneCrest'] }),
  b({ id: 'blizzeta', name: 'Blizzeta', title: 'Twilit Ice Mass', home: 'snowpeak', race: 'twilit', classId: 'twilitIceMass', size: 4, glyph: 'BZ',
    weapons: ['blizzetasIcePillar', 'blizzetaShards'], skill: 'frozenFortress', stats: st(70, 14, 23, 10, 7, 20, 18, 5, 30, 5, 30, 45),
    quote: '"Mine... my mirror..." (Yeta\'s voice, inside the ice.)', drops: ['blizzetasIcePillar', 'blizzetasFrozenJewel'] }),
  b({ id: 'armogohma', name: 'Armogohma', title: 'Twilit Arachnid', home: 'sacredGrove', race: 'twilit', classId: 'twilitArachnid', size: 4, glyph: 'AR',
    weapons: ['armogohmaFangs', 'armogohmasEyeBeam'], skill: 'ceilingPredator', stats: st(72, 18, 17, 12, 10, 15, 13, 4, 32, 6, 35, 35),
    quote: '(It clings to the ceiling of the Temple of Time, its great eye burning.)', drops: ['armogohmasEyeBeam', 'dominionRod'] }),
  b({ id: 'argorok', name: 'Argorok', title: 'Twilit Dragon', home: 'cityInTheSky', race: 'twilit', classId: 'twilitDragon', size: 5, glyph: 'AG',
    weapons: ['argorokTalons', 'argoroksDragonfire'], skill: 'armoredDragon', stats: st(95, 26, 19, 12, 11, 23, 16, 5, 40, 8, 45, 38),
    quote: '(Armored in plates of black metal, the dragon dives out of the clouds.)', drops: ['argoroksDragonArmor', 'argoroksDragonHeart', 'argoroksDragonfire'] }),
  // ── Minibosses and special enemies ──
  b({ id: 'ook', name: 'Ook', title: 'Corrupted Primate', home: 'faronWoods', race: 'twilit', classId: 'corruptedPrimate', size: 2, glyph: 'OO',
    weapons: ['ookBoomerang', 'primateFists'], skill: 'pillarAcrobat', stats: st(32, 10, 2, 13, 15, 6, 5, 6, 12, 7, 24, 4),
    quote: '(A baboon in a Twilight mask leaps between the pillars.)', drops: ['galeBoomerang'] }),
  b({ id: 'dangoro', name: 'Dangoro', title: 'Goron Sumo Guardian', home: 'eldinProvince', race: 'goron', classId: 'goronSumoGuardian', size: 3, glyph: 'DA',
    weapons: ['goronSumoFists'], skill: 'volcanicWrestler', stats: st(55, 19, 2, 10, 5, 18, 6, 6, 28, 4, 35, 4),
    quote: '"No one passes Dangoro!"', drops: ['sumoWristbands'] }),
  b({ id: 'dekuToad', name: 'Deku Toad', title: 'Amphibian Behemoth', home: 'lanayruProvince', race: 'monster', classId: 'amphibianBehemoth', size: 4, glyph: 'DT',
    weapons: ['dekuToadSlam', 'toadpoliFire'], skill: 'spawnBrood', stats: st(60, 18, 6, 8, 7, 12, 8, 4, 30, 5, 30, 12),
    quote: '(It drops from the ceiling. Tadpoles pour off its back.)', drops: ['hawkeye'] }),
  b({ id: 'deathSword', name: 'Death Sword', title: 'Spectral Executioner', home: 'gerudoDesertTP', race: 'undead', classId: 'spectralExecutioner', size: 3, glyph: 'DS',
    weapons: ['deathSwordsBlade'], skill: 'invisibleExecutioner', stats: st(48, 19, 12, 14, 10, 11, 15, 3, 22, 6, 30, 24),
    quote: '(An empty robe holding a sword taller than a man. Only a wolf can see it.)', drops: ['deathSwordsBlade'] }),
  b({ id: 'darkhammer', name: 'Darkhammer', title: 'Armored Executioner', home: 'snowpeak', race: 'monster', classId: 'armoredExecutioner', size: 2, glyph: 'DH',
    weapons: ['darkhammerFlail'], skill: 'chainDefense', stats: st(45, 18, 0, 10, 5, 18, 6, 4, 23, 4, 32, 0),
    quote: '(The chain whirls. The ball comes down.)', drops: ['ballAndChain', 'darkhammerGauntlets'] }),
  b({ id: 'phantomZant', name: 'Phantom Zant', title: 'Shadow Illusion', home: 'twilightRealm', race: 'twili', classId: 'shadowIllusion', size: 2, glyph: 'PZ',
    weapons: ['phantomOrb'], skill: 'phantomSummoning', stats: st(38, 5, 20, 12, 14, 6, 15, 3, 12, 7, 18, 40),
    quote: '(A flickering copy of the usurper, there and gone again.)', drops: ['zantsRoyalJewel'] }),
  b({ id: 'possessedZelda', name: 'Possessed Zelda', title: 'Twilight Puppet', home: 'hyruleCastleTP', race: 'hylian', classId: 'twilightPuppet', size: 1, glyph: 'PS',
    weapons: ['possessedSword', 'phantomOrb'], skill: 'puppetOfDarkness', stats: st(30, 6, 20, 14, 12, 8, 18, 5, 6, 6, 16, 40),
    quote: '(Zelda\'s body floats above the throne. Ganondorf speaks through her.)', drops: ['zeldasRapier'] }),
  // ── Regional leaders ──
  b({ id: 'bulblinRaidLeader', name: 'Bulblin Raid Leader', title: 'Raider', home: 'ordonProvince', race: 'monster', classId: 'raider', size: 1, glyph: 'BR',
    weapons: ['bulblinClub'], skill: 'raidersMomentum', stats: st(32, 11, 0, 10, 9, 8, 4, 5, 10, 6, 22, 0),
    quote: '(It blows a horn. Bullbos thunder out of the woods.)', drops: ['bulblinWarHorn'] }),
  b({ id: 'kingBulblinBoss', name: 'King Bulblin', title: 'Raider King', home: 'hyruleFieldTP', race: 'monster', classId: 'raiderKing', size: 3, glyph: 'KB',
    weapons: ['kingBulblinsAxe'], skill: 'strengthAboveAll', stats: st(46, 19, 0, 12, 9, 15, 6, 6, 24, 7, 34, 0),
    quote: '(He hefts the great axe from Lord Bullbo\'s back.)', drops: ['kingBulblinsAxe', 'kingBulblinsHelm', 'lordBullboMount'] }),
  b({ id: 'zantBoss', name: 'Zant', title: 'Usurper King', home: 'twilightRealm', race: 'twili', classId: 'usurperKing', size: 1, glyph: 'ZA',
    weapons: ['zantsTwinBlades', 'zantsShadowOrb'], skill: 'unstableSorcery', abilities: ['zantsWarp'], stats: st(40, 12, 23, 15, 17, 9, 16, 4, 11, 7, 30, 50),
    quote: '"My god... is not like your gods!"', drops: ['zantsHelmet', 'zantsRoyalRobes', 'zantsTwinBlades'] }),
  b({ id: 'ganondorfTPBoss', name: 'Ganondorf', title: 'Dark Lord', home: 'hyruleCastleTP', race: 'gerudo', classId: 'executionerKing', size: 1, glyph: 'GT',
    weapons: ['swordOfTheSages'], skill: 'divineDefiance', stats: st(48, 22, 15, 16, 11, 16, 13, 6, 18, 5, 36, 30),
    quote: '"The history of light and shadow will be written in blood!"', drops: ['swordOfTheSages', 'fusedShadow'] }),
  b({ id: 'darkBeastGanonBoss', name: 'Dark Beast Ganon', title: 'Colossal Charger', home: 'hyruleCastleTP', race: 'demon', classId: 'colossalCharger', size: 4, glyph: 'DB',
    weapons: ['beastGore', 'beastSlam'], skill: 'beastOfDarkness', abilities: ['beastCharge'], stats: st(90, 27, 9, 10, 13, 19, 11, 4, 40, 8, 42, 22),
    quote: '(A boar of darkness bursts from a portal in the throne room.)', drops: ['shadowBeastHide'] }),
];

export const ROSTERS: Record<string, string[]> = {
  ordonProvince: ['bulblin', 'bulblin', 'bulblinArcher', 'wildBullbo', 'dekuBaba', 'keese', 'shadowInsect'],
  faronWoods: ['bokoblin', 'babaSerpent', 'bigBaba', 'shadowDekuBaba', 'shadowKeese', 'shadowBeast', 'shadowInsect', 'twilitVermin', 'skulltula'],
  eldinProvince: ['bulblin', 'bulblinArcher', 'toadpoli', 'dodongo', 'fireKeese', 'shadowBeast', 'shadowKargarok', 'shadowInsect', 'twilitBloat'],
  lanayruProvince: ['shadowBeast', 'shadowInsect', 'twilitBloat', 'shadowKeese', 'helmasaur', 'skullfish', 'toadpoli', 'lizalfos', 'chuchuBlue'],
  hyruleFieldTP: ['bulblin', 'bulblin', 'bulblinArcher', 'wildBullbo', 'kargaroc', 'poe', 'shadowBeast'],
  gerudoDesertTP: ['moldorm', 'helmasaur', 'helmasaurus', 'redeadKnight', 'stalfos', 'poe', 'ghoulRat', 'bulblin', 'skullBubble'],
  snowpeak: ['whiteWolfos', 'chilfos', 'miniFreezard', 'iceKeese', 'freezard', 'chuchuBlue'],
  sacredGrove: ['darknut', 'armosKnight', 'stalfos', 'babaSerpent', 'tileWorm', 'poisonMite', 'skulltula'],
  cityInTheSky: ['aeralfos', 'kargaroc', 'helmasaur', 'dinolfos', 'lizalfos', 'babaSerpent'],
  twilightRealm: ['shadowBeast', 'shadowBeast', 'shadowKargarok', 'shadowBulblin', 'shadowKeese', 'twilitVermin', 'shadowInsect'],
  hyruleCastleTP: ['darknut', 'lizalfos', 'dinolfos', 'aeralfos', 'redeadKnight', 'bulblin', 'shadowBeast', 'stalfos'],
};

export const REGION_BOSSES: Record<string, string[]> = {
  ordonProvince: ['bulblinRaidLeader'],
  faronWoods: ['ook', 'diababa'],
  eldinProvince: ['dangoro', 'fyrus'],
  lanayruProvince: ['dekuToad', 'morpheel'],
  hyruleFieldTP: ['kingBulblinBoss'],
  gerudoDesertTP: ['deathSword', 'stallord'],
  snowpeak: ['darkhammer', 'blizzeta'],
  sacredGrove: ['armogohma'],
  cityInTheSky: ['argorok'],
  twilightRealm: ['phantomZant', 'zantBoss'],
  hyruleCastleTP: ['possessedZelda', 'darkBeastGanonBoss', 'ganondorfTPBoss'],
};

/** Monster spoils dropped on defeat. */
export const SPOILS: Record<string, string> = {
  babaSerpent: 'babaSerpentSeed', shadowBeast: 'shadowBeastFragment', helmasaur: 'helmasaurCarapace',
  poisonMite: 'poisonMiteCluster', ghoulRat: 'ghoulRatEssence', chilfos: 'chilfosIceShard', miniFreezard: 'freezardBreathCrystal', bombling: 'bomblingItem',
};
