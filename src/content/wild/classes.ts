import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta = 16, mp = 10): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(20, 6, 4, 7, 7, 5, 4, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const HERO = g(80, 50, 25, 60, 55, 35, 30, 50);
const KNIGHT = g(75, 45, 10, 50, 45, 40, 20, 35);
const MAGE = g(55, 10, 65, 50, 40, 15, 55, 45);
const SACRED = g(60, 10, 70, 55, 40, 20, 65, 55);
const DEMON = g(80, 55, 45, 45, 35, 35, 30, 15);
const TANK = g(100, 55, 5, 35, 20, 55, 20, 30);
const ARCHER = g(65, 40, 15, 60, 60, 20, 25, 35);
const SUPPORT = g(60, 20, 40, 45, 40, 25, 40, 55);
const SCHOLAR = g(55, 15, 35, 60, 40, 20, 35, 50);
const BEAST = g(75, 45, 10, 45, 60, 25, 25, 35);
const SMALL = g(45, 30, 20, 45, 55, 20, 25, 30);
const CONSTRUCT = g(75, 45, 15, 45, 30, 45, 25, 15);
const GUARDIAN = g(75, 25, 55, 50, 30, 45, 30, 10);
const COLOSSUS = g(130, 55, 25, 30, 15, 55, 30, 15);
const DRAGON = g(130, 45, 60, 35, 25, 40, 55, 35);
const BOSS = g(140, 55, 45, 35, 25, 45, 40, 25);
const BLIGHT = g(95, 45, 55, 50, 45, 30, 45, 20);
const BEASTS = g(160, 55, 60, 35, 15, 55, 45, 15);
const VEHICLE = g(70, 40, 0, 40, 30, 45, 15, 10);

const MELEE: WeaponType[] = ['sword', 'lance', 'axe', 'hammer'];
const MONSTER = ['beast'];

export const CLASSES: ClassDef[] = [
  // ── Heroes and villains ──
  c('championOfHyrule', 'Champion of Hyrule', '🗡', [...MELEE, 'bow', 'boomerang'], 'foot', HERO),
  c('sacredScholar', 'Sacred Scholar', '📜', ['magic', 'staff', 'bow'], 'foot', SACRED),
  c('gloomSovereign', 'Gloom Sovereign', '👑', ['sword', 'lance', 'magic', 'bow'], 'foot', DEMON, undefined, ['demon']),
  c('calamityIncarnate', 'Calamity Incarnate', '🕷', ['natural', 'magic', 'siege', 'sword', 'lance'], 'foot', BOSS, undefined, ['demon']),
  c('calamityColossus', 'Calamity Colossus', '🐗', ['natural', 'magic', 'siege'], 'foot', BEASTS, undefined, ['demon', 'colossal']),
  // ── Champions and Sages ──
  c('championHealer', 'Champion Healer', '🔱', ['lance', 'staff', 'magic'], 'foot', g(65, 30, 55, 50, 45, 25, 45, 45)),
  c('championDefender', 'Champion Defender', '🪨', ['hammer', 'axe', 'sword', 'natural'], 'foot', TANK),
  c('championArcher', 'Champion Archer', '🏹', ['bow', 'lance'], 'flying', ARCHER),
  c('thunderChampion', 'Thunder Champion', '⚡', ['sword', 'magic', 'lance'], 'foot', g(75, 45, 45, 55, 45, 30, 35, 40)),
  c('sageOfWater', 'Sage of Water', '💧', ['lance', 'sword', 'magic'], 'foot', g(85, 45, 35, 45, 40, 35, 35, 45)),
  c('sageOfFire', 'Sage of Fire', '🔥', ['hammer', 'natural', 'axe'], 'foot', TANK),
  c('sageOfWind', 'Sage of Wind', '🌬', ['bow'], 'flying', ARCHER),
  c('sageOfLightning', 'Sage of Lightning', '🌩', ['sword', 'magic'], 'foot', g(65, 35, 55, 50, 50, 25, 40, 45)),
  c('sageOfSpirit', 'Sage of Spirit', '👻', ['magic', 'staff'], 'foot', MAGE),
  c('modularWarMachine', 'Modular War Machine', '🤖', [...MELEE, 'siege', 'natural', 'gauntlet', 'bow'], 'foot', CONSTRUCT, undefined, ['mechanical']),
  // ── Ancient Hyrule ──
  c('kingOfLight', 'King of Light', '☀', ['magic', 'staff', 'natural'], 'foot', g(85, 35, 65, 50, 35, 35, 55, 45)),
  c('queenOfTime', 'Queen of Time', '⏳', ['magic', 'staff'], 'foot', SACRED),
  c('sacredSkyGuardian', 'Sacred Sky Guardian', '🐉', ['natural', 'magic'], 'flying', DRAGON),
  c('dragonOfGloom', 'Dragon of Gloom', '🐲', ['natural', 'magic'], 'flying', g(140, 60, 55, 35, 25, 45, 40, 10), undefined, ['demon']),
  c('elementalDragon', 'Elemental Dragon', '🐉', ['natural', 'magic'], 'flying', DRAGON),
  c('mountainLord', 'Lord of the Mountain', '🦌', ['natural', 'magic'], 'foot', g(75, 30, 45, 50, 60, 25, 50, 60)),
  c('horseDeity', 'Horse Deity', '🐎', ['magic', 'staff'], 'foot', SUPPORT),
  // ── Supporting characters ──
  c('villageElder', 'Village Elder', '🏮', ['magic', 'staff'], 'foot', g(50, 10, 50, 55, 25, 15, 55, 50)),
  c('technologyResearcher', 'Technology Researcher', '🔬', ['siege', 'magic', 'dagger'], 'foot', SCHOLAR),
  c('ancientEngineer', 'Ancient Engineer', '🔧', ['siege', 'hammer', 'bow'], 'foot', SCHOLAR),
  c('villageChief', 'Village Chief', '🎐', ['dagger', 'staff', 'magic'], 'foot', SUPPORT),
  c('yigaGrandmaster', 'Yiga Grandmaster', '🍌', ['magic', 'natural', 'sword'], 'foot', g(80, 35, 50, 45, 40, 30, 40, 50), undefined, ['yiga']),
  c('yigaLieutenant', 'Yiga Lieutenant', '⚔', ['sword', 'dagger'], 'foot', g(75, 50, 20, 55, 55, 30, 25, 30), undefined, ['yiga']),
  c('veteranArcher', 'Veteran Archer', '🦅', ['bow', 'sword'], 'flying', ARCHER),
  c('travelingBard', 'Traveling Bard', '🪗', ['instrument', 'bow', 'magic'], 'flying', SUPPORT),
  c('forestMusician', 'Forest Musician', '🪇', ['natural', 'instrument', 'staff'], 'foot', g(80, 25, 45, 35, 25, 30, 45, 60)),
  c('fallenKingWild', 'Fallen King', '♔', ['sword', 'magic'], 'foot', KNIGHT),
  c('royalDefenderWild', 'Royal Defender', '🔱', ['lance', 'sword'], 'foot', TANK),
  c('royalAdvisor', 'Royal Advisor', '📘', ['magic', 'staff'], 'foot', SCHOLAR),
  c('royalHealer', 'Royal Healer', '💗', ['staff', 'magic'], 'foot', SUPPORT),
  c('goronBoss', 'Goron Boss', '⛏', ['hammer', 'axe'], 'armor', TANK),
  c('royalBodyguard', 'Royal Bodyguard', '🛡', ['sword', 'lance'], 'foot', KNIGHT),
  c('constructionForeman', 'Construction Foreman', '🔨', ['hammer', 'axe'], 'foot', g(75, 45, 0, 50, 30, 35, 15, 40)),
  c('monsterEnthusiast', 'Monster Enthusiast', '🦇', ['magic', 'dagger'], 'foot', SUPPORT),
  c('bubbulCollector', 'Bubbul Collector', '🐸', ['magic', 'staff'], 'foot', SUPPORT),
  c('zonaiArchaeologist', 'Zonai Archaeologist', '🏺', ['hammer', 'axe'], 'foot', g(80, 45, 5, 45, 30, 35, 20, 35)),
  c('investigativeReporter', 'Investigative Reporter', '📰', ['bow'], 'flying', ARCHER),
  c('bloodMoonResearcher', 'Blood Moon Researcher', '🌕', ['magic', 'staff'], 'foot', SCHOLAR),
  c('constructionAssistant', 'Construction Assistant', '🧰', ['hammer', 'axe'], 'foot', g(70, 40, 0, 45, 35, 30, 15, 40)),
  // ── Yiga Clan ──
  c('yigaAssassin', 'Yiga Assassin', '🗡', ['dagger', 'sword', 'bow'], 'foot', g(55, 40, 15, 55, 60, 20, 25, 30), s(20, 7, 3, 10, 11, 4, 4, 5, 5, 6, 18, 6), ['yiga']),
  c('windSwordsman', 'Wind Swordsman', '🌪', ['sword'], 'foot', g(75, 50, 20, 55, 45, 30, 25, 25), s(30, 11, 4, 13, 11, 7, 6, 4, 9, 6, 24, 8), ['yiga']),
  c('vehicleOperator', 'Vehicle Operator', '🛠', ['siege', 'sword', 'bow'], 'foot', g(60, 35, 25, 55, 40, 25, 25, 35), s(22, 7, 6, 12, 9, 5, 6, 6, 6, 5, 18, 12), ['yiga']),
  // ── Guardians ──
  c('mobileSiege', 'Mobile Siege', '🕷', ['natural', 'magic'], 'foot', GUARDIAN, undefined, ['mechanical']),
  c('aerialArtillery', 'Aerial Artillery', '🛸', ['natural', 'magic'], 'flying', GUARDIAN, undefined, ['mechanical']),
  c('stationaryGuardian', 'Stationary Guardian', '🗼', ['natural', 'magic'], 'fixed', GUARDIAN, undefined, ['mechanical']),
  c('dormantGuardian', 'Dormant Guardian', '⚙', ['natural', 'magic'], 'fixed', GUARDIAN, undefined, ['mechanical']),
  c('guardianScoutClass', 'Guardian Scout', '🔦', ['natural', 'magic', 'sword', 'lance', 'axe'], 'foot', GUARDIAN, undefined, ['mechanical']),
  // ── Zonai Constructs ──
  c('constructInfantry', 'Construct Infantry', '🤖', [...MELEE, 'bow'], 'foot', CONSTRUCT, undefined, ['mechanical']),
  c('eliteConstruct', 'Elite Construct', '🤖', [...MELEE, 'bow'], 'foot', CONSTRUCT, undefined, ['mechanical']),
  c('heavyConstructWild', 'Heavy Construct', '🦾', [...MELEE, 'bow'], 'armor', CONSTRUCT, undefined, ['mechanical']),
  c('constructCommander', 'Construct Commander', '🎖', [...MELEE, 'bow'], 'foot', CONSTRUCT, undefined, ['mechanical']),
  c('eliteCommander', 'Elite Commander', '🎖', [...MELEE, 'bow'], 'foot', CONSTRUCT, undefined, ['mechanical']),
  c('supremeCommander', 'Supreme Commander', '☀', [...MELEE, 'bow'], 'foot', CONSTRUCT, undefined, ['mechanical']),
  c('utilityConstruct', 'Utility Construct', '🧹', ['natural', 'staff'], 'foot', SUPPORT, undefined, ['mechanical']),
  c('manufacturingConstruct', 'Manufacturing Construct', '⚒', ['hammer', 'natural'], 'foot', CONSTRUCT, undefined, ['mechanical']),
  // ── Large monsters ──
  c('centaurWarlord', 'Centaur Warlord', '🦁', ['sword', 'hammer', 'lance', 'bow', 'natural'], 'foot', g(100, 55, 20, 55, 50, 40, 30, 20), undefined, MONSTER),
  c('giantBruiser', 'Giant Bruiser', '👹', ['natural'], 'foot', COLOSSUS, undefined, MONSTER),
  c('undeadGiant', 'Undead Giant', '💀', ['natural'], 'foot', COLOSSUS, undefined, ['undead']),
  c('stoneColossus', 'Stone Colossus', '🪨', ['natural'], 'armor', COLOSSUS, undefined, ['stone']),
  c('mobileFortress', 'Mobile Fortress', '🏯', ['natural'], 'armor', COLOSSUS, undefined, ['stone']),
  c('desertLeviathanWild', 'Desert Leviathan', '🦈', ['natural'], 'foot', COLOSSUS, undefined, MONSTER),
  c('monsterCommander', 'Monster Commander', '👺', ['axe', 'hammer', 'sword', 'lance', 'natural'], 'foot', g(85, 50, 5, 40, 30, 40, 20, 25), undefined, MONSTER),
  c('ceilingAmbusher', 'Ceiling Ambusher', '🦎', ['lance', 'hammer', 'natural'], 'foot', SMALL, s(22, 8, 2, 10, 13, 4, 4, 4, 6, 7), MONSTER),
  c('elementalHydra', 'Elemental Hydra', '🐉', ['natural', 'magic'], 'flying', BOSS, undefined, ['dragon']),
  c('pebblit', 'Pebblit', '🪨', ['natural'], 'foot', SMALL, s(16, 6, 0, 5, 5, 10, 2, 3, 5, 4), ['stone']),
  c('ambushPlant', 'Ambush Plant', '🌳', ['natural'], 'foot', g(75, 45, 10, 35, 25, 35, 20, 15), s(32, 11, 2, 8, 5, 9, 4, 3, 14, 3), ['plant']),
  c('flyingPredatorWild', 'Flying Predator', '🦅', ['natural'], 'flying', BEAST, s(24, 8, 2, 10, 13, 4, 4, 5, 8, 8)),
  c('flyingUndead', 'Flying Undead', '🦋', ['natural', 'magic'], 'flying', g(75, 35, 35, 45, 45, 25, 35, 15)),
  c('corruptionSwarm', 'Corruption Swarm', '🖐', ['natural'], 'foot', g(85, 50, 35, 40, 35, 30, 30, 10), undefined, ['demon']),
  c('magicalCaveCreature', 'Magical Cave Creature', '🫧', ['natural', 'magic'], 'foot', SMALL),
  c('magicalSpirit', 'Magical Spirit', '🐰', ['natural'], 'foot', g(40, 15, 25, 50, 75, 20, 35, 70)),
  c('depthsPredator', 'Depths Predator', '🐊', ['natural'], 'foot', BEAST, undefined, MONSTER),
  c('subterraneanGiant', 'Subterranean Giant', '🐲', ['natural'], 'foot', COLOSSUS, undefined, MONSTER),
  c('reassemblingUndead', 'Reassembling Undead', '☠', ['sword', 'lance', 'axe', 'hammer', 'bow', 'boomerang', 'natural'], 'foot', g(55, 40, 10, 40, 40, 20, 15, 10), s(18, 7, 0, 7, 7, 3, 2, 2, 5, 5)),
  // ── Bosses ──
  c('aquaticBlight', 'Aquatic Blight', '🔱', ['lance', 'magic'], 'foot', BLIGHT, undefined, ['malice']),
  c('infernalBlight', 'Infernal Blight', '🔥', ['sword', 'magic'], 'foot', BLIGHT, undefined, ['malice']),
  c('aerialBlight', 'Aerial Blight', '🌪', ['siege', 'magic'], 'flying', BLIGHT, undefined, ['malice']),
  c('lightningBlight', 'Lightning Blight', '⚡', ['sword', 'magic'], 'foot', BLIGHT, undefined, ['malice']),
  c('sheikahMaster', 'Sheikah Master', '🧘', ['magic', 'sword', 'natural'], 'foot', g(90, 45, 60, 60, 45, 30, 50, 40)),
  c('frozenSkySerpent', 'Frozen Sky Serpent', '❄', ['natural', 'magic'], 'flying', BOSS),
  c('volcanicArachnid', 'Volcanic Arachnid', '🕷', ['natural', 'magic'], 'foot', BOSS),
  c('sludgeManipulator', 'Sludge Manipulator', '🐙', ['natural', 'magic'], 'foot', BLIGHT),
  c('desertHiveQueen', 'Desert Hive Queen', '🦋', ['natural', 'magic'], 'flying', BOSS, undefined, ['undead']),
  c('corruptedWarMachine', 'Corrupted War Machine', '🤖', [...MELEE, 'natural', 'siege'], 'foot', BOSS, undefined, ['mechanical']),
  c('volcanicHydra', 'Volcanic Hydra', '🌋', ['natural', 'magic'], 'foot', BOSS, undefined, ['dragon']),
  c('modularConstruct', 'Modular Construct', '🧊', ['natural'], 'foot', g(110, 50, 15, 35, 20, 50, 25, 10), undefined, ['mechanical']),
  c('gloomPhantom', 'Gloom Phantom', '👤', ['sword', 'lance', 'magic'], 'foot', g(80, 50, 45, 50, 45, 30, 35, 15), undefined, ['demon']),
  // ── Divine Beasts ──
  c('divineBeastClass', 'Divine Beast', '🐘', ['natural', 'magic', 'siege'], 'foot', BEASTS, undefined, ['colossal']),
  c('flyingDivineBeast', 'Divine Beast (Flying)', '🦅', ['natural', 'magic', 'siege'], 'flying', BEASTS, undefined, ['colossal']),
  // ── Mounts ──
  c('warSteed', 'War Steed', '🐎', ['natural'], 'foot', BEAST, s(28, 9, 0, 9, 13, 6, 3, 8, 12, 8), ['mount']),
  c('desertMount', 'Desert Mount', '🦭', ['natural'], 'foot', BEAST, s(26, 7, 2, 9, 12, 6, 4, 9, 10, 8), ['mount']),
  c('forestBeast', 'Forest Beast', '🐻', ['natural'], 'foot', BEAST, s(30, 10, 0, 8, 10, 7, 3, 6, 12, 7), ['mount']),
  c('ancientCycle', 'Ancient Cycle', '🏍', ['natural', 'siege'], 'foot', g(70, 40, 10, 45, 60, 35, 20, 30), s(30, 9, 2, 12, 15, 9, 5, 8, 12, 10), ['mechanical', 'mount']),
  // ── Zonai vehicles (built at the Zonai Workshop) ──
  c('zonaiVehicleClass', 'Zonai Vehicle', '🚙', ['siege', 'natural'], 'foot', VEHICLE, s(30, 8, 0, 9, 8, 9, 3, 3, 14, 6), ['mechanical', 'vehicle']),
  c('zonaiAircraft', 'Zonai Aircraft', '🛩', ['siege', 'natural'], 'flying', VEHICLE, s(26, 7, 0, 10, 11, 6, 3, 3, 10, 9), ['mechanical', 'vehicle']),
];
