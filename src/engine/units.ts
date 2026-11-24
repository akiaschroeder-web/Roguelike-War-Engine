import { ACCESSORIES, CLASSES, RACES, TEMPLATES } from '../data/registry';
import type { RNG } from './rng';
import { MAX_LEVEL, XP_PER_LEVEL } from './rules';
import type { BossDef, EnemyArchetype, Growths, MoveType, Stats, StatKey, Unit, UnitTemplate, WorldId } from './types';

export { MAX_LEVEL, XP_PER_LEVEL };
export const STAT_KEYS: StatKey[] = ['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res', 'lck'];

export function growthsFor(classId: string, race: string, overrides?: Partial<Growths>, scale = 1): Growths {
  const base = CLASSES[classId]?.growths ?? { hp: 60, str: 40, mag: 20, skl: 40, spd: 40, def: 25, res: 20, lck: 30 };
  const mods = RACES[race]?.growthMods ?? {};
  const out = {} as Growths;
  for (const k of STAT_KEYS) out[k] = Math.max(0, Math.round((overrides?.[k] ?? base[k] + (mods[k] ?? 0)) * scale));
  return out;
}

function blank(p: Omit<Unit, 'level' | 'xp' | 'hp' | 'x' | 'y' | 'moved' | 'acted' | 'kills' | 'movedDist'> & Partial<Unit>): Unit {
  return { level: 1, xp: 0, hp: p.stats.hp, x: 0, y: 0, moved: false, acted: false, kills: 0, movedDist: 0, ...p };
}

/** Roll a single level-up. Returns the stat gains. */
export function rollLevelUp(unit: Unit, rng: RNG): Partial<Record<StatKey, number>> {
  const gains: Partial<Record<StatKey, number>> = {};
  for (const k of STAT_KEYS) {
    let g = unit.growths[k];
    let gain = 0;
    while (g >= 100) { gain++; g -= 100; }
    if (rng.chance(g)) gain++;
    if (gain) gains[k] = gain;
  }
  if (Object.keys(gains).length === 0) {
    const best = STAT_KEYS.reduce((a, b) => (unit.growths[a] >= unit.growths[b] ? a : b));
    gains[best] = 1;
  }
  for (const [k, v] of Object.entries(gains) as [StatKey, number][]) {
    unit.stats[k] += v;
    if (k === 'hp') unit.hp += v;
  }
  unit.level++;
  return gains;
}

export function gainXp(unit: Unit, amount: number, rng: RNG): Partial<Record<StatKey, number>>[] {
  const ups: Partial<Record<StatKey, number>>[] = [];
  if (unit.level >= MAX_LEVEL) return ups;
  unit.xp += Math.max(1, Math.round(amount));
  while (unit.xp >= XP_PER_LEVEL && unit.level < MAX_LEVEL) {
    unit.xp -= XP_PER_LEVEL;
    ups.push(rollLevelUp(unit, rng));
  }
  if (unit.level >= MAX_LEVEL) unit.xp = 0;
  return ups;
}

export function makeHero(template: UnitTemplate | string, uid: string, level: number, rng: RNG): Unit {
  const t = typeof template === 'string' ? TEMPLATES[template] : template;
  const stats = { ...t.stats };
  if (t.generic) {
    // Generic soldiers get a little variance so no two are identical.
    for (const k of rng.shuffle([...STAT_KEYS]).slice(0, 3)) stats[k] = Math.max(0, stats[k] + rng.pick([-1, 1, 1]));
  }
  const unit = blank({
    uid, templateId: t.id, name: t.name, title: t.title, race: t.race, home: t.home, classId: t.classId,
    team: 'player', size: t.size, stats, growths: growthsFor(t.classId, t.race, t.growths),
    weapons: [...t.weapons], skills: t.skill ? [t.skill] : [], glyph: t.glyph,
  });
  for (let l = 1; l < level; l++) rollLevelUp(unit, rng);
  unit.hp = unit.stats.hp;
  return unit;
}

export function makeEnemy(arch: EnemyArchetype | BossDef, world: WorldId, level: number, uid: string, rng: RNG, opts: { boss?: boolean } = {}): Unit {
  const cls = CLASSES[arch.classId];
  const isBossDef = 'quote' in arch;
  const stats: Stats = isBossDef ? { ...(arch as BossDef).stats } : { ...cls.base, ...(arch.stats ?? {}) };
  const lvl = Math.min(MAX_LEVEL, Math.max(1, level));
  const unit = blank({
    uid, name: arch.name, title: isBossDef ? (arch as BossDef).title : cls.name, race: arch.race,
    home: isBossDef ? (arch as BossDef).home : world, classId: arch.classId, team: 'enemy', size: arch.size ?? 1,
    stats, growths: growthsFor(arch.classId, arch.race, undefined, 0.85), weapons: [...arch.weapons],
    skills: arch.skill ? [arch.skill] : [], glyph: arch.glyph ?? arch.name.slice(0, 2).toUpperCase(),
    isBoss: opts.boss, bossId: isBossDef ? arch.id : undefined, ai: arch.ai ?? (opts.boss ? 'guard' : 'aggressive'),
  });
  for (let l = 1; l < lvl; l++) rollLevelUp(unit, rng);
  // Endless scaling: levels beyond the cap become flat bonuses.
  const overflow = Math.max(0, level - MAX_LEVEL);
  if (overflow) {
    unit.stats.hp += overflow * 2;
    for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res'] as StatKey[]) unit.stats[k] += Math.ceil(overflow / 2);
  }
  unit.hp = unit.stats.hp;
  return unit;
}

export function moveTypeOf(u: Unit): MoveType {
  const cls = CLASSES[u.classId];
  if (cls?.moveType === 'fixed') return 'fixed';
  if (RACES[u.race]?.flies) return 'flying';
  return cls?.moveType ?? 'foot';
}

/** Tags used for weapon effectiveness: race/class tags, move type, and 'large'. */
export function unitTags(u: Unit): string[] {
  return [...(RACES[u.race]?.tags ?? []), ...(CLASSES[u.classId]?.tags ?? []), moveTypeOf(u), ...(u.size >= 2 ? ['large'] : [])];
}

/** Permanent stats plus accessory bonuses. */
export function effectiveStats(unit: Unit): Stats {
  const s = { ...unit.stats };
  const acc = unit.accessory ? ACCESSORIES[unit.accessory] : undefined;
  if (acc) {
    for (const [k, v] of Object.entries(acc.stats)) {
      if (k in s) (s as Record<string, number>)[k] += v as number;
    }
  }
  for (const k of ['def', 'res', 'lck', 'spd'] as const) s[k] = Math.max(0, s[k]);
  return s;
}

export function accessoryBonus(unit: Unit): { hit: number; avoid: number; crit: number } {
  const acc = unit.accessory ? ACCESSORIES[unit.accessory] : undefined;
  return { hit: acc?.stats.hit ?? 0, avoid: acc?.stats.avoid ?? 0, crit: acc?.stats.crit ?? 0 };
}

export function hasEffect(unit: Unit, effect: string): boolean {
  const acc = unit.accessory ? ACCESSORIES[unit.accessory] : undefined;
  return !!acc?.effects?.includes(effect as never);
}

/** Reset per-battle state. HP carries over between battles. */
export function prepareForBattle(unit: Unit): Unit {
  return {
    ...unit, stats: { ...unit.stats }, growths: { ...unit.growths }, skills: [...unit.skills], weapons: [...unit.weapons],
    hp: Math.max(1, unit.hp), moved: false, acted: false, kills: 0, movedDist: 0, survivedOnce: false,
  };
}
