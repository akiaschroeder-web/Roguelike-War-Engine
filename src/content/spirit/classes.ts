import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 16, mp: 12,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(22, 7, 5, 8, 8, 6, 5, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const SAGE = g(55, 10, 65, 55, 25, 20, 65, 50);
const MUSICIAN = g(55, 15, 60, 45, 30, 25, 55, 40);
const KNIGHT = g(85, 50, 15, 40, 25, 55, 35, 25);
const BOSS = g(140, 50, 40, 35, 25, 45, 40, 20);
const CASTER_BOSS = g(110, 20, 65, 45, 35, 30, 55, 20);
const TRAIN = g(110, 40, 10, 35, 25, 45, 30, 30);
const SLIME = g(60, 30, 40, 35, 40, 25, 35, 30);

export const CLASSES: ClassDef[] = [
  // ── Named characters ──
  c('royalEngineer', 'Royal Engineer', '🚂', ['sword', 'bow', 'boomerang', 'hookshot', 'instrument'], 'foot', g(85, 45, 20, 55, 50, 45, 30, 45)),
  c('royalPrincessST', 'Royal Princess', '👑', ['magic', 'staff', 'bow', 'instrument'], 'foot', g(45, 10, 65, 50, 45, 15, 65, 55), undefined, ['royal']),
  c('spiritPrincess', 'Unbound Spirit', '👻', ['magic', 'instrument'], 'flying', g(45, 5, 65, 50, 45, 10, 65, 55), undefined, ['spirit', 'royal']),
  c('possessedKnightST', 'Possessed Knight', '🛡', ['sword', 'natural'], 'armor', KNIGHT, undefined, ['armored', 'phantom', 'possessed']),
  c('royalSwordsmanST', 'Royal Swordsman', '⚔', ['sword', 'lance', 'hammer'], 'foot', g(85, 50, 5, 55, 30, 45, 20, 35)),
  c('storyteller', 'Storyteller', '📖', ['staff', 'magic'], 'foot', g(45, 10, 40, 45, 15, 15, 45, 65)),
  c('darkSorcererST', 'Dark Sorcerer', '🎩', ['magic', 'staff'], 'foot', CASTER_BOSS, undefined, ['demon']),
  c('fallenLokomo', 'Fallen Lokomo', '🦾', ['gauntlet', 'natural', 'magic'], 'foot', g(70, 45, 30, 45, 40, 30, 30, 20)),
  c('lokomoSage', 'Lokomo Sage', '✨', ['magic', 'staff', 'instrument'], 'foot', SAGE, undefined, ['lokomo']),
  c('lokomoMusician', 'Lokomo Musician', '🎶', ['instrument', 'magic', 'staff'], 'foot', MUSICIAN, undefined, ['lokomo']),
  c('railwayEnthusiast', 'Railway Enthusiast', '📷', ['bow', 'sling', 'boomerang'], 'foot', g(55, 25, 5, 60, 45, 20, 20, 65)),
  c('treasureMerchant', 'Treasure Merchant', '💰', ['sword', 'dagger', 'sling'], 'foot', g(60, 30, 5, 50, 45, 25, 20, 75)),
  c('swordInstructor', 'Sword Instructor', '🤺', ['sword', 'lance'], 'foot', g(75, 45, 5, 65, 40, 35, 20, 30)),
  // ── Monsters ──
  c('torchPhantomClass', 'Torch Phantom', '🔥', ['sword', 'natural'], 'armor', g(110, 50, 25, 35, 15, 55, 35, 5), s(50, 23, 12, 14, 7, 26, 18, 3, 25, 5), ['armored', 'phantom']),
  c('wreckerPhantomClass', 'Wrecker Phantom', '⚙', ['natural', 'hammer'], 'armor', g(130, 60, 0, 30, 15, 65, 30, 5), s(65, 28, 0, 10, 6, 32, 15, 3, 32, 5), ['armored', 'phantom']),
  c('geozardChiefClass', 'Geozard Chief', '🦎', ['sword', 'natural', 'magic'], 'foot', g(100, 50, 25, 45, 30, 45, 25, 15), s(48, 21, 12, 17, 12, 22, 13, 6, 20, 6), ['reptile']),
  c('sandwormClass', 'Sandworm', '🪱', ['natural'], 'foot', g(80, 45, 0, 30, 45, 25, 15, 10), s(32, 15, 0, 10, 14, 9, 6, 4, 13, 7), ['beast']),
  c('keyMasterClass', 'Key Master', '🗝', ['natural', 'magic'], 'flying', g(45, 15, 30, 50, 65, 10, 30, 40), s(20, 5, 10, 16, 19, 4, 10, 12, 4, 8)),
  c('heavyBruiser', 'Heavy Bruiser', '🪓', ['hammer', 'axe', 'natural'], 'foot', g(110, 60, 0, 30, 20, 45, 15, 15), s(48, 23, 0, 11, 6, 17, 6, 5, 24, 5)),
  // ── Bosses ──
  c('armoredInsectST', 'Armored Insect', '🪲', ['natural', 'magic'], 'armor', BOSS, undefined, ['armored', 'beast']),
  c('iceFireBeast', 'Master of Ice and Fire', '🔥', ['magic', 'natural'], 'foot', CASTER_BOSS, undefined, ['demon']),
  c('thornedMenace', 'Thorned Menace', '🌿', ['natural', 'magic'], 'armor', BOSS, undefined, ['plant']),
  c('lavaColossus', 'Lava Colossus', '🌋', ['natural', 'gauntlet'], 'armor', g(170, 60, 25, 25, 10, 60, 40, 10), undefined, ['stone', 'construct']),
  c('ancientDemonST', 'Ancient Demon', '💀', ['natural', 'magic'], 'armor', BOSS, undefined, ['demon', 'undead', 'armored']),
  c('demonKingST', 'Demon King', '👹', ['natural', 'magic', 'sword'], 'foot', g(90, 35, 35, 30, 20, 25, 30, 10), undefined, ['demon']),
  c('stolenVessel', 'Stolen Vessel', '🩸', ['magic', 'staff'], 'flying', g(70, 10, 70, 55, 50, 25, 65, 15), undefined, ['demon', 'possessed', 'royal']),
  // ── Trains ──
  c('spiritTrainClass', 'Spirit Train', '🚂', ['siege', 'natural'], 'foot', TRAIN, undefined, ['vessel', 'train']),
  c('armoredTrainClass', 'Armored Train', '🚃', ['siege', 'natural'], 'foot', g(120, 40, 5, 30, 20, 60, 30, 20), undefined, ['vessel', 'train', 'armored']),
  c('darkTrainClass', 'Dark Train', '🚇', ['siege', 'natural', 'magic'], 'foot', g(105, 45, 30, 35, 25, 45, 40, 10), undefined, ['vessel', 'train', 'demon']),
  c('demonTrainClass', 'Demon Train', '☠', ['siege', 'natural', 'magic'], 'foot', g(160, 55, 50, 35, 20, 55, 50, 10), undefined, ['vessel', 'train', 'demon']),
  // ── The new ChuChus (docs/chuchu-expansion.md) ──
  c('elementalSlime', 'Elemental Slime', '🫧', ['natural', 'magic'], 'foot', SLIME, s(18, 6, 14, 7, 8, 4, 10, 5, 5, 5), ['chuchu']),
  c('armoredSlime', 'Armored Slime', '🪖', ['natural'], 'armor', g(85, 45, 25, 30, 20, 55, 40, 20), s(22, 10, 0, 7, 6, 6, 4, 5, 12, 4), ['chuchu', 'armored']),
];
