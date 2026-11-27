import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 16, mp: 12,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(22, 7, 5, 8, 8, 6, 5, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const SPIRIT = g(40, 5, 70, 50, 55, 10, 65, 55);
const SAGE = g(55, 10, 65, 55, 25, 20, 65, 50);
const KNIGHT = g(80, 50, 10, 45, 35, 45, 25, 25);
const GORON = g(110, 55, 5, 30, 20, 50, 20, 30);
const MAGE = g(55, 10, 60, 45, 40, 20, 55, 35);
const BOSS = g(140, 50, 40, 35, 25, 45, 40, 20);
const CASTER_BOSS = g(110, 20, 65, 45, 35, 30, 55, 20);
const SHIP = g(110, 40, 10, 35, 25, 45, 30, 30);

export const CLASSES: ClassDef[] = [
  // ── Named characters ──
  c('treasureHunter', 'Treasure Hunter', '💰', ['sword', 'bow', 'boomerang', 'hookshot'], 'foot', g(65, 30, 10, 55, 55, 20, 20, 70)),
  c('spiritOfTheOcean', 'Ocean Spirit', '✨', ['magic', 'staff'], 'flying', SPIRIT, undefined, ['divine', 'spirit']),
  c('oceanSage', 'Ocean Sage', '🔱', ['magic', 'staff', 'lance'], 'foot', SAGE, undefined, ['divine']),
  c('oceanDeity', 'Ocean Deity', '🐋', ['magic', 'natural'], 'foot', g(150, 40, 65, 40, 20, 50, 60, 45), undefined, ['divine', 'aquatic']),
  c('pirateDuelistPH', 'Pirate Duelist', '🗡', ['sword', 'dagger'], 'foot', g(75, 50, 5, 55, 55, 30, 15, 30)),
  c('mermaidPerformer', 'Mermaid Performer', '🧜', ['instrument', 'magic', 'staff'], 'foot', g(55, 10, 45, 45, 40, 20, 45, 55)),
  c('fortuneTeller', 'Fortune Teller', '🔮', ['magic', 'staff'], 'foot', g(50, 5, 60, 60, 30, 15, 60, 65)),
  c('cannonEngineer', 'Engineer', '🔧', ['hammer', 'siege', 'bow'], 'foot', g(70, 35, 10, 60, 25, 30, 20, 40)),
  c('masterBlacksmith', 'Master Blacksmith', '⚒', ['hammer', 'axe'], 'foot', g(90, 55, 10, 50, 20, 45, 25, 30)),
  c('youngGoron', 'Young Goron', '🪨', ['gauntlet', 'natural', 'hammer'], 'foot', g(85, 45, 0, 35, 45, 45, 15, 35)),
  c('goronChieftain', 'Goron Chieftain', '🗿', ['hammer', 'gauntlet', 'natural'], 'armor', GORON),
  c('ancientKing', 'Ancient King', '👑', ['magic', 'staff', 'sword'], 'foot', SAGE, undefined, ['cobble']),
  c('cobbleKnight', 'Cobble Knight', '🛡', ['sword', 'lance'], 'armor', KNIGHT, undefined, ['cobble', 'armored']),
  c('tribalChieftain', 'Tribal Chieftain', '🦌', ['staff', 'magic', 'lance'], 'foot', g(60, 25, 60, 50, 25, 35, 60, 55)),
  // ── Anouki and Yook ──
  c('anoukiWarriorClass', 'Anouki Warrior', '🦌', ['lance', 'axe'], 'foot', g(75, 45, 5, 40, 35, 35, 25, 35), s(24, 10, 0, 10, 9, 8, 7, 8, 7, 5)),
  c('anoukiHunterClass', 'Anouki Hunter', '🏹', ['bow', 'lance'], 'foot', g(65, 35, 5, 55, 50, 20, 25, 40), s(22, 8, 0, 15, 13, 5, 6, 9, 6, 6)),
  c('anoukiIceMageClass', 'Anouki Ice Mage', '❄', ['magic', 'staff'], 'foot', MAGE, s(20, 3, 16, 12, 8, 4, 16, 8, 5, 5)),
  c('anoukiGuardianClass', 'Anouki Guardian', '🛡', ['lance', 'axe'], 'armor', g(90, 40, 15, 35, 20, 50, 35, 30), s(30, 9, 6, 10, 6, 14, 12, 7, 10, 4)),
  c('yookWarriorClass', 'Yook Warrior', '❄', ['axe', 'hammer', 'natural'], 'foot', g(110, 55, 0, 30, 25, 40, 25, 15), s(38, 18, 0, 10, 7, 13, 9, 5, 18, 5), ['beast']),
  c('yookBreatherClass', 'Yook Ice Breather', '🌬', ['natural', 'magic'], 'foot', g(100, 35, 50, 35, 25, 35, 40, 15), s(36, 12, 17, 11, 7, 12, 15, 5, 17, 5), ['beast']),
  c('yookBerserkerClass', 'Yook Berserker', '💢', ['axe', 'hammer', 'natural'], 'foot', g(120, 65, 0, 25, 35, 30, 15, 10), s(42, 22, 0, 9, 10, 10, 7, 4, 20, 6), ['beast']),
  // ── Monsters ──
  c('phantomGuard', 'Phantom', '🛡', ['sword', 'natural'], 'armor', g(110, 50, 0, 35, 15, 60, 30, 5), s(50, 22, 0, 14, 6, 28, 15, 3, 25, 5), ['armored', 'phantom']),
  c('swiftPhantomClass', 'Swift Phantom', '💨', ['sword', 'natural'], 'foot', g(100, 45, 0, 40, 45, 50, 30, 5), s(45, 19, 0, 15, 17, 22, 13, 3, 22, 9), ['armored', 'phantom']),
  c('warpPhantomClass', 'Warp Phantom', '🌀', ['sword', 'magic', 'natural'], 'armor', g(105, 45, 40, 40, 30, 50, 40, 5), s(48, 20, 18, 16, 12, 24, 20, 4, 23, 6), ['armored', 'phantom']),
  c('phantomEyeClass', 'Phantom Eye', '👁', ['natural', 'magic'], 'flying', g(35, 10, 30, 50, 55, 10, 30, 20), s(12, 2, 8, 15, 16, 2, 8, 5, 2, 8)),
  c('geozardClass', 'Geozard', '🦎', ['sword', 'natural'], 'foot', g(90, 45, 20, 40, 30, 40, 20, 15), s(38, 17, 8, 14, 10, 17, 9, 5, 16, 5), ['reptile']),
  // ── Bosses ──
  c('fireDemon', 'Fire Demon', '🔥', ['magic', 'natural'], 'foot', CASTER_BOSS, undefined, ['demon']),
  c('windSorcerer', 'Wind Sorcerer', '🌪', ['magic', 'natural'], 'flying', CASTER_BOSS),
  c('invisibleCrustacean', 'Invisible Crustacean', '🦀', ['natural'], 'foot', BOSS, undefined, ['aquatic']),
  c('ghostSorceress', 'Ghost Sorceress', '👻', ['magic', 'natural'], 'flying', g(55, 10, 65, 50, 45, 15, 60, 35), undefined, ['undead']),
  c('armoredLizard', 'Armored Lizard', '🐊', ['natural'], 'armor', BOSS, undefined, ['armored', 'reptile']),
  c('ancientStoneSoldier', 'Ancient Stone Soldier', '🗿', ['natural', 'gauntlet'], 'armor', g(160, 60, 10, 30, 15, 60, 35, 10), undefined, ['stone', 'construct']),
  c('lifeDrainingDemon', 'Life-Draining Demon', '🦑', ['magic', 'natural'], 'flying', g(140, 45, 65, 40, 30, 45, 55, 10), undefined, ['demon']),
  c('possessedDuelist', 'Possessed Duelist', '⚔', ['sword', 'magic'], 'armor', g(110, 55, 40, 55, 45, 50, 40, 10), undefined, ['armored', 'possessed']),
  // ── Vessels ──
  c('steamshipVessel', 'Steamship', '🚢', ['siege', 'natural'], 'foot', SHIP, undefined, ['vessel']),
  c('pirateSteamer', 'Pirate Steamer', '🏴', ['siege', 'natural'], 'foot', g(100, 45, 5, 40, 40, 40, 25, 30), undefined, ['vessel']),
  c('possessedWarship', 'Possessed Warship', '☠', ['siege', 'magic', 'natural'], 'foot', g(160, 50, 50, 35, 20, 50, 50, 10), undefined, ['vessel', 'demon']),
  // ── The pending units: the Potion Shop Lady and the Subrosians ──
  c('potionBrewer', 'Potion Brewer', '⚗', ['staff', 'magic', 'sling'], 'foot', g(45, 15, 55, 45, 20, 20, 50, 50)),
  c('subrosianAdventurer', 'Subrosian Adventurer', '🎀', ['dagger', 'sling', 'boomerang'], 'foot', g(65, 30, 25, 50, 55, 25, 30, 60)),
  c('subrosianInfantry', 'Subrosian Infantry', '🔥', ['sword', 'lance', 'axe'], 'foot', g(75, 45, 5, 35, 35, 35, 20, 25), s(24, 9, 0, 9, 8, 8, 4, 5, 7, 5)),
  c('subrosianSupport', 'Subrosian Dancer', '💃', ['staff', 'instrument', 'dagger'], 'foot', g(55, 15, 40, 45, 50, 20, 40, 50), s(20, 3, 10, 12, 13, 4, 9, 12, 4, 6)),
  c('subrosianHeavy', 'Subrosian Blacksmith', '⚒', ['hammer', 'axe'], 'armor', g(90, 50, 0, 45, 20, 45, 15, 25), s(30, 12, 0, 12, 6, 11, 4, 6, 12, 4)),
  c('subrosianExcavator', 'Subrosian Miner', '⛏', ['hammer', 'axe'], 'foot', g(80, 40, 0, 40, 30, 35, 15, 45), s(24, 9, 0, 10, 8, 8, 3, 9, 8, 5)),
  c('subrosianFireMage', 'Subrosian Sorcerer', '🔥', ['magic', 'staff'], 'foot', MAGE, s(20, 2, 15, 11, 9, 3, 12, 7, 4, 5)),
  c('subrosianHealer', 'Subrosian Chef', '🍲', ['staff', 'magic', 'dagger'], 'foot', g(60, 20, 45, 40, 30, 25, 40, 45), s(22, 4, 12, 11, 8, 5, 11, 11, 6, 5)),
  c('subrosianRogue', 'Subrosian Thief', '🗝', ['dagger', 'sling', 'boomerang'], 'foot', g(55, 30, 10, 50, 60, 20, 25, 55), s(20, 6, 3, 13, 15, 4, 5, 13, 4, 7)),
];
