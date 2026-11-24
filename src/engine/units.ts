import { CLASSES } from '../data/classes';
import { HERO_MAP } from '../data/heroes';
import type { BossDef, EnemyArchetype, Growths, HeroDef, RelicId, Stats, StatKey, Unit, WorldId } from './types';
import type { RNG } from './rng';

export const MAX_LEVEL = 20;
export const XP_PER_LEVEL = 100;
export const STAT_KEYS: StatKey[] = ['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res'];

function addStats(base: Stats, mods: Partial<Stats>): Stats {
  const out = { ...base };
  for (const k of Object.keys(mods) as (keyof Stats)[]) out[k] += mods[k] ?? 0;
  return out;
}

function addGrowths(base: Growths, mods: Partial<Growths>): Growths {
  const out = { ...base };
  for (const k of Object.keys(mods) as StatKey[]) out[k] += mods[k] ?? 0;
  return out;
}

function blankUnit(partial: Partial<Unit> & Pick<Unit, 'uid' | 'name' | 'world' | 'classId' | 'team' | 'stats' | 'growths' | 'weaponId'>): Unit {
  return {
    title: '',
    level: 1,
    xp: 0,
    hp: partial.stats.hp,
    skills: [],
    glyph: partial.name.slice(0, 2).toUpperCase(),
    x: 0,
    y: 0,
    moved: false,
    acted: false,
    kills: 0,
    ...partial,
  };
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
  // Pity: a level that rolls nothing still gives +1 to the best growth.
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

/** Give a unit XP; returns any level-ups that happened. */
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

export function makeHeroUnit(hero: HeroDef | string, uid: string, level: number, rng: RNG): Unit {
  const h = typeof hero === 'string' ? HERO_MAP[hero] : hero;
  const cls = CLASSES[h.classId];
  const unit = blankUnit({
    uid,
    heroId: h.id,
    name: h.name,
    title: h.title,
    world: h.world,
    classId: h.classId,
    team: 'player',
    stats: addStats(cls.base, h.statMods),
    growths: addGrowths(cls.growths, h.growthMods),
    weaponId: h.weaponId,
    skills: [h.skill],
    glyph: h.glyph,
  });
  for (let l = 1; l < level; l++) rollLevelUp(unit, rng);
  unit.hp = unit.stats.hp;
  return unit;
}

export function makeEnemyUnit(
  arch: EnemyArchetype | BossDef,
  world: WorldId,
  level: number,
  uid: string,
  rng: RNG,
  opts: { boss?: boolean } = {},
): Unit {
  const cls = CLASSES[arch.classId];
  const boss = 'statMods' in arch ? (arch as BossDef) : undefined;
  const lvl = Math.min(MAX_LEVEL, Math.max(1, level));
  const unit = blankUnit({
    uid,
    name: arch.name,
    title: boss?.title ?? cls.name,
    world,
    classId: arch.classId,
    team: 'enemy',
    stats: boss ? addStats(cls.base, boss.statMods) : { ...cls.base },
    // Enemies grow a little slower than heroes so the player can out-scale them.
    growths: Object.fromEntries(Object.entries(cls.growths).map(([k, v]) => [k, Math.round(v * 0.85)])) as Growths,
    weaponId: arch.weaponId,
    skills: arch.skill ? [arch.skill] : [],
    glyph: boss?.glyph ?? arch.name.slice(0, 2).toUpperCase(),
    isBoss: opts.boss,
    ai: opts.boss ? 'guard' : 'aggressive',
  });
  for (let l = 1; l < lvl; l++) rollLevelUp(unit, rng);
  // Overflow levels beyond the cap become flat bonuses (late-act scaling).
  const overflow = Math.max(0, level - MAX_LEVEL);
  if (overflow) {
    unit.stats.hp += overflow * 2;
    for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res'] as StatKey[]) unit.stats[k] += Math.ceil(overflow / 2);
  }
  unit.hp = unit.stats.hp;
  return unit;
}

/** Stats with relic modifiers applied (relics only affect the player's army). */
export function effectiveStats(unit: Unit, relics: RelicId[]): Stats {
  const s = { ...unit.stats };
  if (unit.team !== 'player') return s;
  if (relics.includes('warpShard')) s.mov += 1;
  if (relics.includes('ironBanner')) s.def += 2;
  if (relics.includes('riftBattery')) { s.str += 2; s.mag += 2; }
  if (relics.includes('glassCannon')) { s.str += 4; s.mag += 4; s.def -= 3; s.res -= 3; }
  s.def = Math.max(0, s.def);
  s.res = Math.max(0, s.res);
  return s;
}

/** Reset per-battle state when a roster unit enters a fight. */
export function prepareForBattle(unit: Unit): Unit {
  return { ...unit, stats: { ...unit.stats }, growths: { ...unit.growths }, skills: [...unit.skills], hp: unit.stats.hp, moved: false, acted: false, kills: 0 };
}
