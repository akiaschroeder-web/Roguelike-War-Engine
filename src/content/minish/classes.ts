import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 16, mp: 12,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(20, 6, 4, 8, 8, 5, 5, 5, 4, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const MINISH = g(50, 30, 30, 50, 55, 20, 30, 50);
const MINISH_MAGE = g(45, 5, 60, 50, 35, 15, 55, 50);
const SWORDMASTER = g(80, 50, 5, 60, 50, 35, 20, 30);
const BOSS = g(140, 50, 35, 35, 25, 45, 35, 15);
const CASTER_BOSS = g(110, 25, 65, 45, 35, 30, 55, 15);
const SLIME = g(120, 45, 30, 25, 20, 40, 30, 15);

export const CLASSES: ClassDef[] = [
  // ── Named characters ──
  c('sacredSwordsman', 'Sacred Swordsman', '⚔', ['sword', 'boomerang', 'bow', 'magic'], 'foot', g(85, 50, 20, 55, 50, 40, 25, 45)),
  c('miniatureAdventurer', 'Miniature Adventurer', '🗡', ['sword', 'boomerang', 'bow'], 'foot', g(70, 45, 20, 60, 60, 25, 25, 45), undefined, ['micro']),
  c('lightForcePrincess', 'Light Force Princess', '👑', ['magic', 'staff', 'bow'], 'foot', g(50, 10, 65, 50, 40, 15, 65, 55), undefined, ['royal']),
  c('minishSage', 'Minish Sage', '🧙', ['magic', 'staff'], 'foot', MINISH_MAGE),
  c('magicalCompanion', 'Magical Companion', '🎩', ['magic'], 'flying', g(45, 10, 55, 50, 50, 15, 50, 45)),
  c('apprenticeSorcerer', 'Apprentice Sorcerer', '✨', ['magic', 'staff'], 'foot', g(45, 5, 65, 50, 50, 15, 50, 25)),
  c('windSorcerer', 'Wind Sorcerer', '🌪', ['magic', 'staff'], 'foot', CASTER_BOSS, undefined, ['sorcerer']),
  c('royalCommander', 'Royal Commander', '👑', ['sword', 'lance'], 'foot', g(90, 50, 10, 45, 25, 50, 30, 45), undefined, ['royal']),
  c('royalAdvisor', 'Royal Advisor', '📜', ['staff', 'sword'], 'foot', g(50, 15, 30, 45, 25, 20, 30, 50)),
  c('masterBlacksmithMC', 'Master Blacksmith', '🔨', ['hammer', 'sword'], 'foot', g(85, 50, 0, 55, 20, 40, 20, 35)),
  c('mountainMinishSmith', 'Mountain Minish Blacksmith', '⚒', ['hammer'], 'foot', g(75, 50, 10, 55, 20, 45, 25, 35)),
  c('forestMinishGuide', 'Forest Minish Guide', '🍃', ['sword', 'bow'], 'foot', MINISH),
  c('forestMinishElder', 'Forest Minish Elder', '🌳', ['magic', 'staff'], 'foot', MINISH_MAGE),
  c('townMinishElder', 'Town Minish Elder', '📚', ['magic', 'staff'], 'foot', MINISH_MAGE),
  c('poet', 'Poet', '🪶', ['instrument', 'staff', 'sword'], 'foot', g(50, 15, 35, 45, 35, 15, 40, 60)),
  c('windTribeSage', 'Wind Tribe Sage', '🌬', ['magic', 'staff'], 'foot', g(55, 10, 60, 45, 25, 20, 60, 45)),
  c('swordmasterMC', 'Swordmaster', '🤺', ['sword'], 'foot', SWORDMASTER),
  c('heavySwordmaster', 'Heavy Swordmaster', '🗡', ['sword'], 'foot', g(95, 60, 0, 45, 20, 50, 20, 25)),
  c('shadowSwordmaster', 'Shadow Swordmaster', '🌑', ['sword'], 'foot', g(75, 55, 10, 55, 45, 30, 30, 20)),
  c('spectralSwordmaster', 'Spectral Swordmaster', '👻', ['sword', 'magic'], 'foot', g(85, 55, 30, 65, 55, 35, 45, 25), undefined, ['spectral']),
  // ── Generic Minish ──
  c('minishScout', 'Minish Scout', '🍀', ['lance', 'sword', 'bow'], 'foot', MINISH, s(14, 5, 0, 12, 16, 2, 5, 10, 1, 8)),
  c('minishHealer', 'Minish Healer', '🌿', ['staff', 'magic'], 'foot', MINISH_MAGE, s(16, 2, 15, 10, 10, 3, 14, 12, 1, 6)),
  c('minishWarrior', 'Minish Warrior', '🔨', ['hammer', 'sword', 'lance'], 'foot', g(70, 50, 5, 40, 30, 45, 20, 25), s(22, 13, 0, 11, 8, 10, 5, 6, 2, 5)),
  c('minishSmith', 'Minish Blacksmith', '⚒', ['hammer'], 'foot', g(65, 40, 10, 55, 25, 35, 25, 30), s(20, 10, 2, 17, 6, 8, 6, 8, 2, 5)),
  c('minishThief', 'Minish Thief', '🪙', ['sword', 'dagger', 'bow'], 'foot', g(50, 30, 5, 55, 65, 15, 20, 55), s(16, 7, 0, 16, 19, 3, 5, 13, 1, 8)),
  c('minishTinkerer', 'Minish Tinkerer', '⚙', ['magic', 'hammer', 'staff'], 'foot', g(55, 20, 40, 60, 35, 20, 40, 40), s(18, 4, 10, 19, 9, 5, 10, 10, 1, 6)),
  // ── Monsters ──
  c('pestBug', 'Flying Pest', '🪰', ['natural'], 'flying', g(40, 35, 0, 35, 60, 15, 10, 15), s(12, 6, 0, 8, 17, 2, 3, 4, 1, 8), ['insect', 'beast']),
  c('sporeFungus', 'Spore Fungus', '🍄', ['natural', 'magic'], 'foot', g(60, 15, 50, 35, 20, 25, 45, 15), s(18, 3, 13, 10, 5, 5, 12, 5, 1, 4), ['plant']),
  c('spinyBeetleClass', 'Spiny Beetle', '🪲', ['natural'], 'foot', g(75, 45, 0, 35, 35, 55, 15, 15), s(22, 11, 0, 9, 10, 13, 3, 4, 8, 5), ['insect', 'beast', 'armored']),
  c('rollingBug', 'Armored Roller', '🐛', ['natural'], 'armor', g(70, 35, 0, 30, 40, 60, 15, 15), s(20, 8, 0, 7, 12, 15, 4, 4, 2, 6), ['insect', 'beast', 'armored']),
  c('watchingGuardian', 'Watching Guardian', '👁', ['natural', 'magic'], 'armor', g(120, 50, 20, 40, 10, 70, 35, 10), s(48, 20, 8, 14, 5, 25, 12, 3, 25, 4), ['construct', 'stone', 'armored']),
  c('chainSoldier', 'Ball and Chain Soldier', '⛓', ['hammer', 'axe', 'natural'], 'armor', g(120, 60, 0, 35, 15, 60, 20, 15), s(52, 25, 0, 13, 6, 23, 8, 5, 28, 4), ['armored']),
  // ── Bosses and minibosses ──
  c('giantSlime', 'Giant Slime', '🟢', ['natural', 'magic'], 'armor', SLIME, undefined, ['chuchu', 'slime']),
  c('frostBeast', 'Frost Beast', '🐙', ['natural', 'magic'], 'foot', BOSS, undefined, ['beast', 'aquatic']),
  c('volcanicBeast', 'Volcanic Beast', '🌋', ['natural', 'magic'], 'armor', BOSS, undefined, ['beast', 'reptile', 'armored']),
  c('ancientConstructMC', 'Ancient Construct', '🗿', ['natural', 'magic'], 'armor', g(150, 55, 25, 35, 10, 60, 40, 10), undefined, ['construct', 'stone', 'armored']),
  c('aerialPlatform', 'Aerial Platform', '🦑', ['natural', 'magic'], 'flying', BOSS, undefined, ['beast']),
  c('aerialHunter', 'Aerial Hunter', '🦈', ['natural'], 'flying', g(110, 55, 15, 45, 50, 35, 25, 15), undefined, ['beast']),
  c('demonicSorcerer', 'Demonic Sorcerer', '👁', ['magic', 'natural'], 'flying', CASTER_BOSS, undefined, ['demon']),
  c('floatingDemon', 'Floating Demon', '🔴', ['magic', 'natural'], 'flying', CASTER_BOSS, undefined, ['demon']),
  c('windDemon', 'Wind Demon', '🌀', ['magic', 'natural'], 'flying', BOSS, undefined, ['demon']),
  c('insectBruiser', 'Insect Bruiser', '🐛', ['natural'], 'foot', g(80, 50, 0, 35, 45, 30, 15, 15), s(28, 14, 0, 10, 13, 8, 4, 5, 3, 7), ['insect', 'beast']),
  c('defensiveSlime', 'Defensive Slime', '🦔', ['natural'], 'foot', g(80, 40, 0, 25, 20, 45, 20, 15), s(24, 12, 0, 7, 6, 12, 5, 5, 10, 5), ['chuchu', 'slime']),
];
