import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 14, mp: 10,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(20, 6, 4, 7, 7, 5, 4, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const HERO = g(80, 50, 25, 60, 55, 35, 30, 50);
const KNIGHT = g(75, 45, 10, 55, 50, 35, 25, 40);
const MAGE = g(55, 10, 65, 50, 45, 15, 55, 50);
const DIVINE = g(60, 10, 70, 55, 45, 20, 65, 60);
const DEMON = g(85, 55, 50, 55, 45, 35, 40, 20);
const TANK = g(100, 55, 5, 35, 20, 55, 20, 30);
const SUPPORT = g(60, 20, 40, 45, 40, 25, 40, 55);
const BEAST = g(75, 45, 10, 45, 60, 25, 25, 35);
const SMALL = g(45, 25, 20, 45, 60, 15, 25, 35);
const CONSTRUCT = g(80, 40, 35, 40, 25, 50, 30, 15);
const DRAGON = g(130, 45, 60, 35, 25, 40, 55, 35);
const BOSS = g(140, 55, 45, 35, 25, 45, 40, 25);

export const CLASSES: ClassDef[] = [
  // ── Main characters ──
  c('knightOfTheGoddess', 'Knight of the Goddess', '🗡', ['sword', 'bow', 'sling', 'hookshot'], 'foot', HERO),
  c('sacredPriestess', 'Sacred Priestess', '🪽', ['staff', 'magic', 'bow'], 'foot', DIVINE),
  c('divineGuide', 'Divine Guide', '💠', ['magic'], 'foot', MAGE),
  c('siegeEngineer', 'Siege Engineer', '🎯', ['siege', 'sling', 'hammer', 'sword'], 'foot', g(85, 50, 0, 45, 30, 40, 20, 35)),
  c('sacredGuardian', 'Sacred Guardian', '🗝', ['dagger', 'sword', 'magic'], 'foot', g(75, 45, 45, 60, 60, 30, 40, 35)),
  c('demonLord', 'Demon Lord', '💎', ['sword', 'dagger', 'magic'], 'foot', DEMON),
  c('livingDemonBlade', 'Living Demon Blade', '⚔', ['sword', 'magic'], 'foot', g(100, 60, 45, 60, 40, 50, 40, 15)),
  c('demonKing', 'Demon King', '🔥', ['sword', 'magic'], 'foot', g(130, 65, 55, 45, 30, 50, 45, 15)),
  // ── Supporting characters ──
  c('knightCommander', 'Knight Commander', '🦉', ['sword', 'staff', 'magic'], 'foot', g(70, 35, 25, 60, 25, 35, 35, 50)),
  c('knightTrainee', 'Knight Trainee', '🏋', ['sword', 'sling'], 'foot', g(65, 45, 10, 45, 45, 30, 25, 55)),
  c('skyKnight', 'Sky Knight', '🪶', ['sword', 'lance', 'bow'], 'foot', KNIGHT),
  c('benevolentDemon', 'Benevolent Demon', '🦇', ['magic', 'staff', 'natural'], 'foot', g(90, 35, 55, 35, 30, 30, 45, 55), undefined, ['demon']),
  c('scrapSmith', 'Scrap Smith', '🔧', ['hammer', 'sling', 'siege'], 'foot', g(70, 40, 5, 60, 30, 35, 20, 40)),
  c('transportConstruct', 'Transport Construct', '🛸', ['natural'], 'flying', CONSTRUCT),
  c('navalCaptain', 'Naval Captain', '⚓', ['sword', 'siege'], 'foot', g(65, 35, 15, 60, 30, 40, 30, 40)),
  c('forestElder', 'Forest Elder', '🌳', ['natural', 'staff'], 'foot', SUPPORT),
  c('archaeologist', 'Archaeologist', '⛏', ['gauntlet', 'hammer'], 'armor', TANK),
  c('treasureExcavator', 'Treasure Excavator', '💰', ['dagger', 'natural'], 'foot', g(55, 30, 10, 55, 60, 20, 25, 65)),
  c('celestialGuardian', 'Celestial Guardian', '🐋', ['natural', 'magic'], 'flying', DRAGON),
  c('dragonGuardian', 'Dragon Guardian', '🐉', ['natural', 'magic'], 'foot', DRAGON),
  c('divineSovereign', 'Divine Sovereign', '✨', ['magic', 'staff', 'bow'], 'foot', g(70, 15, 80, 60, 45, 25, 70, 70)),
  // ── Monsters ──
  c('ancientRaider', 'Ancient Raider', '⚡', ['hammer', 'natural'], 'foot', g(60, 40, 20, 45, 40, 25, 25, 20), s(24, 8, 6, 10, 9, 5, 6, 4, 7, 5)),
  c('undeadRaider', 'Undead Raider', '💀', ['natural', 'sword'], 'foot', g(70, 40, 10, 30, 20, 30, 30, 10), s(28, 9, 5, 6, 4, 7, 8, 2, 9, 4)),
  c('heavyDefender', 'Heavy Defender', '🛡', ['hammer', 'lance', 'natural'], 'armor', TANK, s(45, 15, 0, 8, 4, 20, 4, 4, 23, 3)),
  c('quadroPlant', 'Predatory Plant', '🌺', ['natural'], 'fixed', g(70, 45, 15, 40, 25, 30, 25, 15), s(30, 13, 3, 9, 6, 8, 5, 3, 12, 0)),
  c('fireBird', 'Fire Bird', '🐦', ['natural', 'magic'], 'flying', g(60, 25, 45, 45, 60, 15, 40, 25)),
  c('fireArtillery', 'Fire Artillery', '🌋', ['natural', 'magic'], 'foot', g(55, 15, 45, 40, 25, 35, 35, 20)),
  c('explosiveCreature', 'Explosive Creature', '🐡', ['natural'], 'foot', SMALL),
  c('electricRoller', 'Electric Roller', '🌀', ['natural'], 'foot', g(70, 40, 35, 35, 50, 45, 30, 15)),
  c('electricHatchling', 'Electric Hatchling', '🥚', ['natural'], 'fixed', g(40, 10, 20, 20, 10, 30, 20, 20)),
  c('sandScorpion', 'Sand Scorpion', '🦂', ['natural'], 'foot', SMALL),
  c('magmaConstruct', 'Magma Construct', '🪨', ['natural', 'magic'], 'foot', g(95, 50, 35, 30, 15, 45, 35, 10)),
  c('missileConstruct', 'Ancient Construct', '🚀', ['siege', 'natural', 'magic'], 'foot', CONSTRUCT),
  c('ancientTurret', 'Ancient Turret', '👁', ['magic', 'natural'], 'fixed', g(80, 15, 50, 50, 10, 50, 30, 10), s(40, 5, 16, 15, 2, 17, 8, 2, 20, 0)),
  c('silentRealmSpirit', 'Silent Realm Spirit', '🏮', ['natural', 'magic'], 'flying', g(40, 10, 35, 55, 50, 10, 35, 25)),
  c('trialGuardian', 'Trial Guardian', '👹', ['hammer', 'natural'], 'foot', g(110, 55, 25, 35, 25, 45, 35, 10)),
  c('skyTrialGuardian', 'Trial Guardian', '👻', ['natural', 'magic'], 'flying', g(90, 45, 35, 40, 40, 30, 40, 10)),
  c('nocturnalBeast', 'Nocturnal Beast', '🐈', ['natural'], 'foot', BEAST),
  // ── Bosses and minibosses ──
  c('pyroclasticFiend', 'Pyroclastic Fiend', '🌋', ['natural', 'magic'], 'foot', BOSS),
  c('thousandYearArachnid', 'Thousand-Year Arachnid', '🦂', ['natural', 'gauntlet'], 'foot', BOSS),
  c('ancientAutomaton', 'Ancient Automaton', '🗿', ['sword', 'natural'], 'foot', BOSS, undefined, ['ancient']),
  c('abyssalLeviathan', 'Abyssal Leviathan', '🐙', ['natural', 'magic'], 'foot', BOSS),
  c('thunderheadParasite', 'Thunderhead Parasite', '👁', ['natural', 'magic'], 'flying', BOSS),
  c('sealedDemonClass', 'Sealed Demon', '⛓', ['natural'], 'foot', g(150, 60, 25, 25, 15, 50, 40, 10)),
  c('demonicColossus', 'Demonic Colossus', '🖐', ['natural'], 'foot', g(150, 65, 30, 30, 20, 50, 40, 10)),
  c('ascendingDemon', 'Ascending Demon', '🐲', ['natural', 'magic'], 'flying', g(150, 60, 40, 30, 30, 45, 45, 10)),
  c('undeadSwordmaster', 'Undead Swordmaster', '☠', ['sword'], 'foot', g(95, 55, 5, 65, 40, 40, 25, 15)),
  c('ancientPirate', 'Ancient Pirate', '🏴', ['sword'], 'foot', g(80, 50, 5, 60, 50, 35, 25, 20)),
  c('ancientExecutioner', 'Ancient Executioner', '⚡', ['sword', 'magic'], 'foot', g(85, 50, 35, 65, 45, 40, 35, 15)),
  c('reptilianElite', 'Reptilian Elite', '🦎', ['sword', 'natural'], 'foot', g(75, 45, 30, 50, 50, 30, 35, 20)),
  // ── Loftwings ──
  c('aerialMount', 'Aerial Mount', '🐦', ['natural'], 'flying', BEAST),
  c('sacredAerialMount', 'Sacred Aerial Mount', '🦅', ['natural'], 'flying', g(80, 45, 15, 50, 65, 30, 35, 45)),
];
