import type { BossDef, EnemyArchetype, Stats, UnitTemplate } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 3's five monsters (the Torch and Wrecker Phantoms wear Phantom armor like the Phantom
// Hourglass Phantoms), and the six new ChuChus of docs/chuchu-expansion.md. Phantoms, Warp Phantoms,
// Phantom Eyes, Geozards, Stalfos, Octoroks, Keese, Bulblins, Miniblins and the rest carry over.
export const ENEMIES: EnemyArchetype[] = [
  e('torchPhantom', 'Torch Phantom', 'torchPhantomClass', 'phantom', ['torchPhantomSword'], st(50, 23, 12, 14, 7, 26, 18, 3, 25, 5, 40, 25), { size: 2, skill: 'livingTorch', glyph: 'TP', ai: 'guard' }),
  e('wreckerPhantom', 'Wrecker Phantom', 'wreckerPhantomClass', 'phantom', ['wreckerBall'], st(65, 28, 0, 10, 6, 32, 15, 3, 32, 5, 45, 0), { size: 2, skill: 'rollingDestruction', glyph: 'WR', ai: 'guard' }),
  e('geozardChief', 'Geozard Chief', 'geozardChiefClass', 'monster', ['geozardChiefsBlade', 'geozardChiefFire'], st(48, 21, 12, 17, 12, 22, 13, 6, 20, 6, 35, 25), { size: 2, skill: 'eliteReptilian', glyph: 'GC' }),
  e('sandworm', 'Sandworm', 'sandwormClass', 'monster', ['sandwormBite'], st(32, 15, 0, 10, 14, 9, 6, 4, 13, 7, 28, 0), { size: 2, skill: 'sandAmbushST', glyph: 'SW' }),
  e('keyMaster', 'Key Master', 'keyMasterClass', 'monster', ['keyMasterClaw', 'keyMasterGaze'], st(20, 5, 10, 16, 19, 4, 10, 12, 4, 8, 28, 20), { skill: 'keyTheftSkill', glyph: 'KM' }),
  // ── The new ChuChus ──
  e('chuchuStandard', 'Standard ChuChu', 'elementalSlime', 'chuchu', ['chuchuSlam'], st(16, 5, 4, 5, 7, 3, 5, 6, 4, 5, 18, 12), { skill: 'elementalAdaptation', glyph: 'CS' }),
  e('chuchuFire', 'Fire ChuChu', 'elementalSlime', 'chuchu', ['flameJelly'], st(18, 6, 14, 7, 8, 4, 10, 5, 5, 5, 20, 30), { skill: 'combustibleBody', glyph: 'CF' }),
  e('chuchuIce', 'Ice ChuChu', 'elementalSlime', 'chuchu', ['frostJelly'], st(18, 5, 15, 8, 6, 5, 12, 5, 5, 5, 18, 32), { skill: 'frozenBody', glyph: 'CI' }),
  e('chuchuElectric', 'Electric ChuChu', 'elementalSlime', 'chuchu', ['shockJelly'], st(16, 5, 16, 9, 12, 3, 11, 6, 4, 6, 18, 35), { skill: 'volatileCharge', glyph: 'CE' }),
  e('chuchuMetal', 'Metal ChuChu', 'armoredSlime', 'chuchu', ['metalJelly'], st(28, 12, 15, 8, 4, 22, 14, 4, 16, 4, 24, 35), { skill: 'permanentConduction', glyph: 'CM' }),
  e('chuchuHelmet', 'Helmet ChuChu', 'armoredSlime', 'chuchu', ['helmetHorns'], st(22, 10, 0, 7, 6, 6, 4, 5, 12, 4, 26, 0), { skill: 'ironHelmet', glyph: 'CH' }),
];

/** The Helmet ChuChu recruits with its helmet on (the other ChuChus are made from their archetypes). */
export const CHU_TEMPLATES: UnitTemplate[] = [
  { id: 'chuchuHelmet', name: 'Helmet ChuChu', title: 'Armored Slime', race: 'chuchu', classId: 'armoredSlime', size: 1, home: 'fireRealm', glyph: 'CH', generic: true, monster: true,
    stats: st(22, 10, 0, 7, 6, 6, 4, 5, 12, 4, 26, 0), weapons: ['helmetHorns'], skill: 'ironHelmet', gear: { head: 'chuchuIronHelmet' },
    bio: 'A ChuChu that found a three-horned iron helmet and decided it was a knight now.' },
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  b({ id: 'stagnox', name: 'Stagnox', title: 'Armored Insect', home: 'forestRealm', race: 'monster', classId: 'armoredInsectST', size: 3, glyph: 'SG',
    weapons: ['stagnoxMandibles', 'stagnoxSpray'], skill: 'armoredInsectSkill', abilities: ['poisonCloud', 'stagnoxCharge'],
    stats: st(80, 23, 12, 12, 10, 25, 13, 4, 30, 6, 40, 25),
    quote: '(A great armored beetle turns in the Forest Temple, its shell clanking. Swords skid off it. Somewhere, the wind is blowing...)', drops: ['lokomoSageRobes'] }),
  b({ id: 'fraaz', name: 'Fraaz', title: 'Master of Ice and Fire', home: 'snowRealm', race: 'demon', classId: 'iceFireBeast', size: 3, glyph: 'FZ',
    weapons: ['fraazFlame', 'fraazFrost'], skill: 'iceAndFire', abilities: ['iceFireBreath', 'fraazSplit'],
    stats: st(70, 14, 28, 15, 13, 15, 25, 6, 24, 7, 28, 60),
    quote: '(A bat-eared demon hovers in the Snow Temple, one eye blue with frost and one orange with flame.)', drops: ['whip'] }),
  b({ id: 'phytops', name: 'Phytops', title: 'Thorned Menace', home: 'oceanRealm', race: 'monster', classId: 'thornedMenace', size: 4, glyph: 'PT',
    weapons: ['phytopsTentacle'], skill: 'thornedMenaceSkill', abilities: ['thornTentacles', 'thornWall'],
    stats: st(95, 24, 22, 16, 7, 20, 23, 4, 38, 4, 35, 50),
    quote: '(A plant the size of a house unfolds in the Ocean Temple, tentacles thrashing, thorns everywhere.)', drops: ['fairyBow'] }),
  b({ id: 'cragma', name: 'Cragma', title: 'Lava Colossus', home: 'fireRealm', race: 'fireCreature', classId: 'lavaColossus', size: 5, glyph: 'CG',
    weapons: ['cragmaFist', 'cragmaMagma'], skill: 'lavaColossusSkill', abilities: ['giantFist', 'lavaEruption'],
    stats: st(130, 35, 18, 10, 5, 32, 22, 3, 50, 4, 55, 35),
    quote: '(The lava of the Fire Temple heaves up into a giant with fists of stone and one burning eye.)', drops: ['dragonTrainCannonPart'] }),
  b({ id: 'skeldritch', name: 'Skeldritch', title: 'Ancient Demon', home: 'sandRealm', race: 'demon', classId: 'ancientDemonST', size: 4, glyph: 'SK',
    weapons: ['skeldritchClaw'], skill: 'ancientDemonSkill', abilities: ['boulderHurl', 'skeldritchQuake'],
    stats: st(100, 28, 18, 14, 7, 28, 20, 4, 40, 4, 45, 35),
    quote: '(A skeletal demon rises from the sand of the Sand Temple, a boulder in each claw.)', drops: ['sandWand'] }),
  b({ id: 'malladus', name: 'Malladus', title: 'Demon King', home: 'sacredBattlefield', race: 'demon', classId: 'demonKingST', size: 4, glyph: 'MD',
    weapons: ['malladusClaw', 'malladusDarkBeam'], skill: 'demonicIncarnation', abilities: ['demonKingsWrath', 'malladusBeam'],
    stats: st(125, 32, 35, 19, 13, 28, 30, 4, 42, 7, 50, 85),
    quote: '(Sealed under the Tower of Spirits for a hundred years, the Demon King rises in his true shape: a vast boar-like beast with burning hair.)', drops: ['malladusHorn'] }),
  b({ id: 'malladusZelda', name: 'Malladus (Possessed Zelda)', title: 'Stolen Vessel', home: 'sacredBattlefield', race: 'demon', classId: 'stolenVessel', size: 1, glyph: 'MZ',
    weapons: ['stolenLight'], skill: 'stolenVesselSkill', abilities: ['stolenLightBlast'],
    stats: st(45, 6, 34, 20, 16, 10, 30, 5, 6, 7, 20, 80),
    quote: '(Zelda\'s body opens its eyes. They are red, and the voice is not hers. "This vessel suits me well.")', drops: ['sacredSpiritGem'] }),
  b({ id: 'demonTrain', name: 'Demon Train', title: 'Railway Demon', home: 'demonTrainLine', race: 'train', classId: 'demonTrainClass', size: 5, glyph: 'DM',
    weapons: ['demonTrainCannon', 'demonTrainRam'], skill: 'multiCarTrain', abilities: ['demonTrainBarrage'],
    stats: st(150, 26, 24, 14, 7, 24, 22, 4, 55, 6, 50, 60),
    quote: '(A black train with a face, belching blue flame, rolls out of the Dark Realm. Every car has its own cannon.)', drops: ['skullTrainEnginePart', 'skullTrainCannonPart'] }),
  // ── Boss forms of recruitable characters and units ──
  b({ id: 'bigBlinBoss', name: 'Big Blin', title: 'Bulblin Raid Leader', home: 'abodaVillage', race: 'monster', classId: 'heavyBruiser', size: 2, glyph: 'BB',
    weapons: ['bigBlinClub'], skill: 'blinBrute', abilities: ['heavyClub', 'pirateRally'], stats: st(48, 23, 0, 11, 6, 17, 6, 5, 24, 5, 40, 0),
    quote: '(A huge Blin with a basket on his back blocks the road out of Aboda. "Hrrr! Little engineer. Into the basket!")', drops: ['bigBlinClub', 'captureBasket'] }),
  b({ id: 'coleBoss', name: 'Chancellor Cole', title: 'Dark Sorcerer', home: 'hyruleCastleST', race: 'demon', classId: 'darkSorcererST', size: 1, glyph: 'CO',
    weapons: ['colesDarkBolt'], skill: 'demonicInfluence', abilities: ['darkMagicBarrage', 'colesWarp', 'demonicSummon'], stats: st(38, 5, 29, 17, 13, 8, 24, 5, 6, 6, 18, 65),
    quote: '"Oh, the princess\'s little engineer. How touching. Do stay out of the way while I borrow her body."', drops: ['colesDarkMagic'] }),
  b({ id: 'byrneBoss', name: 'Byrne', title: 'Fallen Lokomo', home: 'towerOfSpirits', race: 'lokomo', classId: 'fallenLokomo', size: 1, glyph: 'BY',
    weapons: ['byrnesClaw'], skill: 'ironGauntletSkill', abilities: ['ironGrab', 'gauntletThrow'], stats: st(44, 23, 16, 20, 17, 15, 14, 8, 16, 7, 42, 35),
    quote: '"The Spirit Gods gave the Lokomo nothing but duty. Malladus will give me power. Stand aside, or be thrown aside."', drops: ['byrnesGauntlet', 'byrnesClaw'] }),
  b({ id: 'darkTrainBoss', name: 'Dark Train', title: 'Lead Demon Train', home: 'darkRealm', race: 'train', classId: 'darkTrainClass', size: 3, glyph: 'DT',
    weapons: ['darkTrainCannon', 'trainCollision'], skill: 'darkCollision', stats: st(58, 16, 10, 11, 9, 13, 13, 4, 30, 6, 40, 20),
    quote: '(A dark train with purple eyes roars down the line, straight at you.)', drops: ['steelTrainEnginePart'] }),
];

/** Boss forms of recruitable characters (they share the character's progression). */
export const BOSS_AS_TEMPLATE: Record<string, string> = { bigBlinBoss: 'bigBlin', coleBoss: 'cole', byrneBoss: 'byrne', darkTrainBoss: 'darkTrain' };

// Regional rosters (existing ChuChus, Octoroks, Keese, Bulblins, Miniblins, Stalfos, Skulltulas,
// Bubbles and the Phantom Hourglass Phantoms return; the Tower is the Phantoms' home). The new
// ChuChus also join the Wild campaign's regions.
export const ROSTERS: Record<string, string[]> = {
  abodaVillage: ['chuchuStandard', 'chuchuStandard', 'octorok', 'keese', 'miniblin', 'bulblin', 'skulltula', 'miniblin'],
  hyruleCastleST: ['bulblin', 'bulblin', 'miniblin', 'keese', 'stalfos', 'keese', 'chuchuStandard', 'skulltula'],
  forestRealm: ['chuchuStandard', 'octorok', 'skulltula', 'keese', 'bulblin', 'moblin', 'chuchuElectric', 'miniblin'],
  snowRealm: ['chuchuIce', 'chuchuIce', 'iceKeese', 'stalfos', 'bulblin', 'freezard', 'chuchuStandard', 'keese'],
  oceanRealm: ['chuchuElectric', 'octorok', 'geozard', 'chuchuMetal', 'keese', 'bubbleMM', 'miniblin', 'skulltula'],
  fireRealm: ['chuchuFire', 'chuchuFire', 'fireKeese', 'geozardChief', 'bubbleMM', 'stalfos', 'chuchuHelmet', 'geozard'],
  sandRealm: ['sandworm', 'sandworm', 'stalfos', 'geozard', 'chuchuMetal', 'skulltula', 'keyMaster', 'chuchuHelmet'],
  towerOfSpirits: ['phantom', 'phantom', 'warpPhantom', 'torchPhantom', 'wreckerPhantom', 'phantomEye', 'keyMaster', 'chuchuHelmet'],
  darkRealm: ['stalfos', 'geozardChief', 'torchPhantom', 'bubbleMM', 'keese', 'chuchuMetal', 'bulblin', 'phantomEye'],
  demonTrainLine: ['torchPhantom', 'wreckerPhantom', 'geozardChief', 'stalfos', 'bulblin', 'phantomEye', 'keese'],
  sacredBattlefield: ['phantom', 'wreckerPhantom', 'torchPhantom', 'geozardChief', 'stalfos', 'warpPhantom', 'phantomEye'],
  // The Wild campaign's ChuChu pools: the BotW/TotK variants by climate.
  greatPlateau: ['chuchuStandard'], hateno: ['chuchuStandard', 'chuchuIce'], necluda: ['chuchuStandard'], lanayruWild: ['chuchuStandard', 'chuchuElectric'],
  eldinWild: ['chuchuFire', 'chuchuFire'], hebra: ['chuchuIce', 'chuchuIce'], gerudoWild: ['chuchuElectric'], faronWild: ['chuchuElectric', 'chuchuStandard'],
  centralHyrule: ['chuchuStandard', 'chuchuFire'], akkala: ['chuchuFire'],
};

/** Each spirit region's bosses in order: the boss node fights the first not yet beaten (with the rest as partners). */
export const ROUTE_BOSSES: Record<string, string[]> = {
  abodaVillage: ['bigBlinBoss'], hyruleCastleST: ['coleBoss'], forestRealm: ['stagnox'], snowRealm: ['fraaz'], oceanRealm: ['phytops'], fireRealm: ['cragma'],
  sandRealm: ['skeldritch'], towerOfSpirits: ['byrneBoss'], darkRealm: ['darkTrainBoss'], demonTrainLine: ['demonTrain'], sacredBattlefield: ['malladusZelda', 'malladus'],
};
/** Regions whose boss node brings every listed boss at once (all must fall). */
export const PAIRED_ST_REGIONS = ['sacredBattlefield'];

// The boss pools other campaigns (Random, the free-for-all) draw from.
export const REGION_BOSSES: Record<string, string[]> = {
  abodaVillage: ['bigBlinBoss'], hyruleCastleST: ['coleBoss'], forestRealm: ['stagnox'], snowRealm: ['fraaz'], oceanRealm: ['phytops'], fireRealm: ['cragma'],
  sandRealm: ['skeldritch'], towerOfSpirits: ['byrneBoss'], darkRealm: ['darkTrainBoss'], demonTrainLine: ['demonTrain'], sacredBattlefield: ['malladus', 'malladusZelda'],
};

/** Monster spoils in the spirit regions (dropped on defeat, 25%): treasures go to the quest bag, items to the loot. */
export const ST_SPOILS: Record<string, string> = {
  torchPhantom: 'phantomTear', wreckerPhantom: 'phantomTear', geozardChief: 'goronAmber', keyMaster: 'ancientGoldPiece', sandworm: 'mysticJade', stalfos: 'stalfosSkull',
  chuchuStandard: 'chuchuJellyST', chuchuFire: 'redChuJelly', chuchuIce: 'whiteChuJelly', chuchuElectric: 'yellowChuJelly', chuchuMetal: 'electrifiedMetalGel', chuchuHelmet: 'redChuJelly',
};
