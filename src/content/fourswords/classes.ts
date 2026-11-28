import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 20, mp: 10,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(24, 8, 4, 8, 8, 6, 5, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const LINK = g(55, 15, 35, 40, 35, 20, 35, 45);
const MAIDEN = g(50, 5, 60, 45, 35, 15, 60, 50);
const SOLDIER = g(75, 45, 0, 45, 35, 40, 20, 30);
const BOSS = g(140, 50, 35, 35, 25, 45, 35, 15);
const CASTER_BOSS = g(110, 25, 65, 45, 35, 30, 55, 15);
const SLIME = g(120, 45, 30, 25, 20, 40, 30, 15);
const LINK_TOOLS: WeaponType[] = ['sword', 'bow', 'boomerang', 'sling', 'hammer'];

export const CLASSES: ClassDef[] = [
  // ── The four Links ──
  c('fourSwordLeader', 'Four Sword Leader', '🗡', [...LINK_TOOLS, 'magic'], 'foot', g(70, 40, 20, 45, 40, 30, 25, 40)),
  c('fourSwordWarrior', 'Four Sword Warrior', '⚔', [...LINK_TOOLS, 'axe'], 'foot', g(75, 40, 5, 35, 25, 35, 15, 30)),
  c('fourSwordScout', 'Four Sword Scout', '🏹', [...LINK_TOOLS, 'dagger'], 'foot', g(65, 35, 15, 50, 60, 20, 20, 45)),
  c('fourSwordMystic', 'Four Sword Mystic', '✨', [...LINK_TOOLS, 'magic', 'staff'], 'foot', LINK),
  // ── Section 2 ──
  c('sacredPrincess', 'Sacred Princess', '👑', ['magic', 'staff', 'bow'], 'foot', g(55, 10, 65, 50, 40, 20, 65, 55), undefined, ['royal']),
  c('shadowSwordsmanFS', 'Shadow Swordsman', '🌑', ['sword', 'magic', 'bow', 'boomerang'], 'foot', g(75, 50, 45, 55, 55, 30, 40, 20), undefined, ['shadow']),
  c('tridentDemon', 'Trident Demon', '🔱', ['lance', 'magic', 'natural'], 'armor', BOSS, undefined, ['demon']),
  c('shrineMaiden', 'Shrine Maiden', '🕯', ['staff', 'magic'], 'foot', MAIDEN, undefined, ['maiden']),
  // ── Section 3: the custom military classes ──
  c('spearmanFS', 'Royal Spearman', '⟋', ['lance', 'sword'], 'foot', SOLDIER, s(28, 13, 0, 12, 10, 11, 5, 7, 10, 5)),
  c('bombardierFS', 'Royal Bombardier', '💣', ['sling', 'sword', 'bow'], 'foot', g(70, 40, 0, 55, 30, 30, 20, 35), s(26, 11, 0, 16, 9, 8, 5, 8, 11, 5)),
  c('captainFS', 'Royal Captain', '🎖', ['sword', 'lance'], 'foot', g(85, 50, 5, 50, 40, 45, 25, 40), s(36, 17, 0, 17, 13, 15, 8, 12, 12, 6)),
  // ── Section 4: monsters ──
  c('chainTrooper', 'Ball and Chain Trooper', '⛓', ['hammer', 'natural'], 'armor', g(100, 55, 0, 35, 20, 55, 15, 15), s(32, 18, 0, 12, 8, 14, 5, 5, 15, 5), ['armored']),
  c('livingBomb', 'Living Bomb', '💣', ['natural'], 'foot', g(90, 60, 0, 15, 10, 30, 15, 5), s(35, 30, 0, 5, 3, 8, 5, 1, 20, 3), ['construct', 'bomb']),
  c('armoredTurtle', 'Armored Turtle', '🐢', ['natural'], 'foot', g(70, 40, 0, 30, 35, 70, 15, 15), s(25, 12, 0, 8, 10, 20, 4, 5, 12, 5), ['beast', 'armored', 'shell']),
  c('sandAmbusher', 'Sand Ambusher', '🏜', ['natural'], 'foot', g(80, 50, 10, 40, 45, 30, 20, 15), s(28, 15, 3, 12, 14, 9, 6, 5, 10, 6), ['beast']),
  // ── Section 5: bosses ──
  c('windSorcererFS', 'Wind Sorcerer', '🌪', ['magic', 'natural'], 'flying', CASTER_BOSS, undefined, ['demon']),
  c('giantSlimeFS', 'Giant Slime', '🟩', ['natural', 'magic'], 'armor', SLIME, undefined, ['slime']),
  c('volcanicMonster', 'Volcanic Monster', '🔥', ['natural', 'magic'], 'armor', BOSS, undefined, ['fire']),
  c('elementalSlimeFS', 'Elemental Slime', '🟪', ['natural', 'magic'], 'armor', SLIME, undefined, ['slime']),
  c('iceGuardian', 'Ice Guardian', '❄', ['natural', 'magic'], 'flying', CASTER_BOSS, undefined, ['ice']),
];
