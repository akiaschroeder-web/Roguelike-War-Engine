import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 20, mp: 12,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(22, 7, 4, 8, 8, 6, 5, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const MAGE = g(50, 5, 60, 50, 40, 15, 55, 40);
const SOLDIER = g(80, 50, 5, 45, 35, 45, 20, 25);
const BOSS = g(140, 50, 35, 35, 25, 45, 35, 15);
const CASTER_BOSS = g(110, 25, 65, 45, 35, 30, 55, 15);

// Section 2's custom classes, the Sages', the Lorule generics', the monsters' and the bosses'.
export const CLASSES: ClassDef[] = [
  // ── Named characters ──
  c('paintingSwordsman', 'Painting Swordsman', '🖼', ['sword', 'bow', 'boomerang', 'hookshot', 'hammer', 'magic'], 'foot', g(85, 50, 25, 55, 50, 40, 25, 45)),
  c('sacredPrincess', 'Sacred Princess', '👑', ['magic', 'staff', 'bow'], 'foot', g(50, 10, 65, 50, 40, 15, 65, 55), undefined, ['royal']),
  c('loruleanPrincess', 'Lorulean Princess', '♛', ['magic', 'staff'], 'foot', g(55, 10, 65, 50, 40, 20, 60, 30), undefined, ['royal']),
  c('travelingMerchantLB', 'Traveling Merchant', '🐰', ['hammer', 'magic', 'boomerang', 'bow', 'hookshot'], 'foot', g(60, 25, 35, 50, 55, 20, 35, 65)),
  c('paintingSorcerer', 'Painting Sorcerer', '🎨', ['magic', 'staff'], 'foot', CASTER_BOSS, undefined, ['sorcerer']),
  c('flyingCompanionLB', 'Flying Companion', '🕊', ['natural'], 'flying', g(40, 20, 0, 50, 70, 10, 30, 60), s(15, 4, 0, 15, 25, 2, 8, 18, 2, 9), ['bird']),
  c('veteranSwordsman', 'Veteran Swordsman', '🗡', ['sword'], 'foot', g(85, 55, 10, 65, 45, 40, 25, 35)),
  c('aquaticSupport', 'Aquatic Support', '🐙', ['natural', 'staff', 'magic'], 'foot', g(120, 15, 50, 35, 15, 40, 50, 45), undefined, ['aquatic']),
  c('aquaticCompanion', 'Aquatic Companion', '🐚', ['natural'], 'foot', g(40, 15, 25, 40, 55, 20, 30, 60), s(10, 2, 4, 10, 14, 4, 8, 15, 1, 5), ['aquatic', 'micro']),
  c('blacksmithLB', 'Lorulean Blacksmith', '⚒', ['hammer', 'sword'], 'foot', g(85, 50, 0, 55, 20, 40, 20, 30)),
  c('rogueLB', 'Rogue', '🗝', ['dagger', 'sword', 'bow', 'boomerang'], 'foot', g(55, 35, 5, 55, 65, 20, 25, 50)),
  // ── The Seven Sages ──
  c('forestScoutLB', 'Forest Scout', '🌲', ['sling', 'bow', 'sword'], 'foot', g(50, 30, 15, 45, 55, 20, 25, 55)),
  c('apprenticeSage', 'Apprentice Sage', '🏜', ['magic', 'staff'], 'foot', MAGE),
  c('sanctuaryPriestess', 'Sanctuary Priestess', '⛪', ['magic', 'staff'], 'foot', g(45, 5, 60, 45, 35, 15, 65, 50)),
  c('zoraQueen', 'Zora Queen', '🧜', ['magic', 'lance', 'natural', 'staff'], 'foot', g(110, 35, 50, 35, 25, 40, 50, 30), undefined, ['royal', 'aquatic']),
  c('mountainMiner', 'Mountain Miner', '⛏', ['hammer', 'axe'], 'armor', g(120, 60, 0, 35, 15, 50, 15, 25)),
  c('flyingWitch', 'Flying Witch', '🧹', ['magic', 'staff'], 'foot', g(45, 5, 60, 50, 55, 10, 45, 35)),
  c('royalSageLB', 'Royal Sage', '🗡', ['sword', 'dagger', 'magic'], 'foot', g(70, 40, 40, 55, 50, 30, 45, 35)),
  // ── Generics ──
  c('loruleSoldierClass', 'Lorule Soldier', '🛡', ['sword', 'lance'], 'foot', SOLDIER, s(27, 12, 0, 11, 10, 10, 7, 5, 9, 5), ['soldier']),
  c('loruleSpearmanClass', 'Spearman', '🔱', ['lance'], 'foot', SOLDIER, s(29, 14, 0, 13, 9, 12, 6, 5, 11, 5), ['soldier']),
  c('loruleKnightClass', 'Lorule Knight', '⚔', ['sword', 'lance'], 'armor', g(90, 55, 5, 45, 30, 55, 30, 25), s(36, 17, 0, 15, 10, 18, 10, 6, 14, 5), ['soldier', 'armored']),
  // ── Monsters ──
  c('rupeeLikeClass', 'Rupee Like', '💰', ['natural'], 'foot', g(80, 35, 15, 25, 15, 40, 40, 60), s(26, 10, 4, 7, 4, 9, 12, 18, 12, 3), ['likeLike']),
  c('bariClass', 'Bari', '🎐', ['natural', 'magic'], 'flying', g(60, 20, 50, 35, 40, 20, 45, 15), s(22, 7, 16, 10, 12, 5, 13, 5, 5, 6), ['jelly', 'aquatic']),
  c('biriClass', 'Biri', '⚡', ['natural', 'magic'], 'flying', g(35, 15, 35, 30, 55, 10, 30, 15), s(10, 3, 9, 8, 16, 2, 7, 4, 1, 6), ['jelly', 'aquatic']),
  c('gimosClass', 'Elemental Construct', '🗿', ['natural', 'magic'], 'foot', g(85, 40, 45, 35, 20, 50, 35, 10), s(30, 13, 17, 12, 6, 17, 12, 4, 16, 4), ['construct', 'stone']),
  c('pengatorClass', 'Pengator', '🐧', ['natural'], 'foot', g(65, 45, 5, 35, 55, 25, 25, 15), s(24, 12, 2, 11, 17, 7, 9, 6, 7, 6), ['beast']),
  c('devalantClass', 'Sand Hunter', '🦂', ['natural'], 'foot', g(70, 45, 10, 40, 45, 30, 20, 15), s(28, 14, 3, 12, 13, 10, 6, 5, 9, 6), ['beast', 'insect']),
  // ── Bosses and minibosses ──
  c('windGuardian', 'Wind Guardian', '🌀', ['natural', 'magic'], 'armor', BOSS, undefined, ['construct', 'armored']),
  c('gemstoneBeast', 'Gemstone Beast', '💎', ['natural', 'magic'], 'armor', BOSS, undefined, ['beast', 'armored']),
  c('giantHand', 'Giant Hand', '✋', ['natural'], 'foot', g(130, 60, 10, 40, 35, 40, 25, 10), undefined, ['undead']),
  c('undeadGuardian', 'Undead Guardian', '💀', ['sword', 'natural', 'magic'], 'foot', g(120, 55, 35, 45, 30, 45, 35, 10), undefined, ['undead']),
  c('desertPlant', 'Desert Plant', '🌵', ['natural', 'magic'], 'foot', CASTER_BOSS, undefined, ['plant']),
  c('frozenEyeDemon', 'Frozen Eye Demon', '👁', ['natural', 'magic'], 'flying', CASTER_BOSS, undefined, ['demon']),
  c('volcanicTurtle', 'Volcanic Turtle', '🐢', ['natural', 'magic'], 'armor', BOSS, undefined, ['beast', 'reptile', 'armored']),
  c('paintingDemonKing', 'Painting Demon King', '🔱', ['lance', 'magic', 'natural'], 'foot', g(150, 60, 60, 45, 30, 50, 50, 15), undefined, ['demon', 'sorcerer']),
  c('cycloneSwarm', 'Cyclone Swarm', '🔥', ['natural', 'magic'], 'flying', g(80, 30, 50, 35, 45, 25, 35, 10), undefined, ['beast']),
  c('electricDivision', 'Electrical Division', '🎐', ['natural', 'magic'], 'flying', g(110, 30, 55, 30, 25, 35, 45, 10), undefined, ['jelly', 'aquatic']),
  c('iceCommander', 'Ice Commander', '🐧', ['natural'], 'foot', g(100, 55, 10, 40, 45, 40, 30, 15), undefined, ['beast']),
];
