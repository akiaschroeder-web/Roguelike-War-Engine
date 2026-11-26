import { ABILITIES, CLASSES, GEAR, ITEMS, RACES, TEMPLATES, WEAPONS } from '../data/registry';
import { STATUS_STATS } from './status';
import { armorStarDef, wildLavaImmune, wildMaxUses, wildPrepare } from './wildGear';
import { vesselMov } from './naval';
import type { RNG } from './rng';
import { MAX_LEVEL, XP_PER_LEVEL } from './rules';
import { GEAR_SLOTS, PACK_SIZE } from './types';
import type { BossDef, EnemyArchetype, GearDef, WeaponDef, GearSlot, GearSlotKind, Growths, MoveType, Stats, StatKey, Unit, UnitTemplate, WorldId } from './types';

export { MAX_LEVEL, XP_PER_LEVEL };
export const STAT_KEYS: StatKey[] = ['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res', 'lck'];

export function growthsFor(classId: string, race: string, overrides?: Partial<Growths>, scale = 1): Growths {
  const base = CLASSES[classId]?.growths ?? { hp: 60, str: 40, mag: 20, skl: 40, spd: 40, def: 25, res: 20, lck: 30 };
  const mods = RACES[race]?.growthMods ?? {};
  const out = {} as Growths;
  for (const k of STAT_KEYS) out[k] = Math.max(0, Math.round((overrides?.[k] ?? base[k] + (mods[k] ?? 0)) * scale));
  return out;
}

function blank(p: Omit<Unit, 'level' | 'xp' | 'hp' | 'x' | 'y' | 'moved' | 'acted' | 'kills' | 'movedDist' | 'gear' | 'pack' | 'mp' | 'sta' | 'statuses' | 'buffs' | 'abilities'> & Partial<Unit>): Unit {
  return {
    level: 1, xp: 0, hp: p.stats.hp, mp: p.stats.mp, sta: p.stats.sta, x: 0, y: 0, moved: false, acted: false, kills: 0, movedDist: 0,
    gear: {}, pack: [], statuses: [], buffs: [], abilities: [], ...p,
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
    weapons: [...t.weapons], skills: [...(t.skill ? [t.skill] : []), ...(t.extraSkills ?? [])], glyph: t.glyph,
    abilities: [...(t.abilities ?? []), ...(t.skill && ABILITIES[t.skill] ? [t.skill] : [])],
  });
  if (t.gear) unit.gear = { ...t.gear };
  for (let l = 1; l < level; l++) rollLevelUp(unit, rng);
  unit.hp = unit.stats.hp;
  return unit;
}

/** A recruitable character or soldier fighting on the enemy side. */
export function makeEnemyFromTemplate(templateId: string, level: number, uid: string, rng: RNG, opts: { boss?: boolean } = {}): Unit {
  const u = makeHero(templateId, uid, Math.min(MAX_LEVEL, Math.max(1, level)), rng);
  u.team = 'enemy';
  u.ai = opts.boss ? 'guard' : 'aggressive';
  u.isBoss = opts.boss;
  return u;
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
    abilities: [...(('abilities' in arch && (arch as BossDef).abilities) || []), ...(arch.skill && ABILITIES[arch.skill] ? [arch.skill] : [])],
    isBoss: opts.boss, bossId: isBossDef ? arch.id : undefined, artId: arch.id, ai: arch.ai ?? (opts.boss ? 'guard' : 'aggressive'),
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
  if (isGliding(u)) return 'flying';
  if (activeGear(u).some((g) => g.slot === 'accessory' && g.effects?.includes('flight'))) return 'flying'; // Deku Flower Petal
  if (RACES[u.race]?.flies) return 'flying';
  if (isMounted(u)) return mountOf(u)!.effects?.includes('flight') ? 'flying' : 'cavalry';
  return cls?.moveType ?? 'foot';
}

/** Can this unit ride a mount? (Not fliers, stationary units, cavalry classes or giants.) */
export function canRide(u: Unit): boolean {
  const mt = CLASSES[u.classId]?.moveType;
  return mt !== 'fixed' && mt !== 'flying' && mt !== 'cavalry' && !RACES[u.race]?.flies && (u.baseSize ?? u.size) <= 2;
}

export function mountOf(u: Unit): GearDef | undefined {
  const id = u.gear?.mount;
  return id ? GEAR[id] : undefined;
}

/** Riding right now (outside battle, a unit with a mount counts as mounted). */
export function isMounted(u: Unit): boolean {
  return !!mountOf(u) && u.mounted !== false && canRide(u);
}

/** Footprint size with or without the mount. */
export function sizeWhen(u: Unit, mounted: boolean): number {
  const base = u.baseSize ?? u.size;
  const m = mountOf(u);
  return mounted && m && canRide(u) ? Math.max(base, m.size ?? 2) : base;
}

/** Tags used for weapon effectiveness: race/class tags, move type, and 'large'. */
export function unitTags(u: Unit): string[] {
  return [...(RACES[u.race]?.tags ?? []), ...(CLASSES[u.classId]?.tags ?? []), moveTypeOf(u), ...(u.size >= 2 ? ['large'] : [])];
}

/** Gear that is currently active (a shield does nothing with a two-handed weapon). */
export function activeGear(unit: Unit): GearDef[] {
  const twoHanded = !!WEAPONS[unit.weapons[0]]?.twoHanded;
  // Skyward Sword's Cursed Medal: the wearer's shield does nothing.
  const cursed = unit.gear?.acc1 === 'cursedMedal' || unit.gear?.acc2 === 'cursedMedal';
  const out: GearDef[] = [];
  for (const slot of GEAR_SLOTS) {
    const id = unit.gear?.[slot];
    if (!id || !GEAR[id]) continue;
    if (slot === 'shield' && (twoHanded || cursed)) continue;
    if (slot === 'mount' && !isMounted(unit)) continue;
    out.push(GEAR[id]);
  }
  return out;
}

/** Permanent stats plus gear bonuses. */
export function effectiveStats(unit: Unit): Stats {
  const s = { ...unit.stats };
  const masks = unit.skills?.includes('maskCollector');
  if (hasEffect(unit, 'giantTear')) s.hp += 5 * (unit.baseSize ?? unit.size);
  for (const g of activeGear(unit)) {
    const mult = masks && g.slot === 'head' && /mask/i.test(g.name) ? 1.5 : 1;
    for (const [k, v] of Object.entries(g.stats)) {
      if (k in s) (s as Record<string, number>)[k] += Math.round((v as number) * mult);
    }
  }
  for (const b of unit.buffs ?? []) {
    for (const [k, v] of Object.entries(b.stats ?? {})) (s as Record<string, number>)[k] += v as number;
  }
  for (const st of unit.statuses ?? []) {
    for (const [k, v] of Object.entries(STATUS_STATS[st.kind] ?? {})) (s as Record<string, number>)[k] += v as number;
  }
  s.def += armorStarDef(unit);
  if (moveTypeOf(unit) === 'flying') {
    if (hasEffect(unit, 'flyMov')) s.mov += 1;
    if (hasEffect(unit, 'helmarocPlume')) s.mov += 2;
  }
  s.mov = vesselMov(unit, s.mov);
  for (const k of ['def', 'res', 'lck', 'spd', 'con'] as const) s[k] = Math.max(0, s[k]);
  s.mov = Math.max(1, s.mov);
  if (unit.stats.mov === 0) s.mov = 0; // stationary units stay stationary
  return s;
}

export function gearBonus(unit: Unit): { hit: number; avoid: number; crit: number; block: number } {
  const b = { hit: 0, avoid: 0, crit: 0, block: 0 };
  for (const g of activeGear(unit)) {
    b.hit += g.stats.hit ?? 0;
    b.avoid += g.stats.avoid ?? 0;
    b.crit += g.stats.crit ?? 0;
    b.block += g.stats.block ?? 0;
  }
  return b;
}

export function hasEffect(unit: Unit, effect: string): boolean {
  return activeGear(unit).some((g) => g.effects?.includes(effect as never));
}

export function isLavaImmune(u: Unit): boolean {
  return !!RACES[u.race]?.lavaImmune || hasEffect(u, 'lavaImmune') || hasEffect(u, 'hazardResist') || moveTypeOf(u) === 'flying'
    || !!u.buffs?.some((b) => b.id === 'magmanosCore') || !!u.skills?.includes('moltenBody') || wildLavaImmune(u);
}

export function canSwim(u: Unit): boolean {
  return !!RACES[u.race]?.swims || hasEffect(u, 'swim') || hasEffect(u, 'remainsAquatic') || !!u.buffs?.some((b) => b.id === 'seahorse' || b.id === 'airPotion');
}

/** Temporarily airborne (Deku Flower glide, Twinmold Wing Fragment, Tingle's balloon). */
export function isGliding(u: Unit): boolean {
  return !!u.buffs?.some((b) => b.id === 'glide' || b.id === 'wing' || b.id === 'aerial') || hasEffect(u, 'balloon');
}

/** Which slot a gear piece goes into on this unit (second accessory slot if the first is taken). */
export function slotFor(unit: Unit, kind: GearSlotKind): GearSlot {
  if (kind !== 'accessory') return kind;
  return unit.gear.acc1 && !unit.gear.acc2 ? 'acc2' : 'acc1';
}

/** Pack slots for this unit (6, plus Adventure Pouch Upgrades up to 10). */
export function packSize(u: Unit): number {
  return Math.min(10, PACK_SIZE + (u.packBonus ?? 0));
}

/** Max uses in one pack slot (e.g. Bombs come in 3s and stack to 9). */
export const stackCap = (itemId: string) => (ITEMS[itemId]?.uses ?? 1) * 3;

/** Add a consumable to the pack, merging into a stack of the same item; false if no room. */
export function addToPack(unit: Unit, itemId: string, uses?: number): boolean {
  const def = ITEMS[itemId];
  if (!def) return false;
  let n = uses ?? def.uses;
  const cap = stackCap(itemId);
  const room = unit.pack.filter((p) => p.id === itemId).reduce((r, p) => r + (cap - p.uses), 0)
    + (packSize(unit) - unit.pack.length) * cap;
  if (room < n) return false;
  for (const p of unit.pack) {
    if (p.id !== itemId || n <= 0) continue;
    const add = Math.min(n, cap - p.uses);
    p.uses += add;
    n -= add;
  }
  while (n > 0) {
    const add = Math.min(n, cap);
    unit.pack.push({ id: itemId, uses: add });
    n -= add;
  }
  return true;
}

/** Reset per-battle state. HP carries over between battles. */
export function prepareForBattle(unit: Unit): Unit {
  const baseSize = unit.baseSize ?? unit.size;
  const riding = !!mountOf(unit) && canRide({ ...unit, baseSize });
  const out: Unit = {
    ...unit, baseSize, mounted: riding, size: riding ? Math.max(baseSize, mountOf(unit)!.size ?? 2) : baseSize,
    stats: { ...unit.stats }, growths: { ...unit.growths }, skills: [...unit.skills], weapons: [...unit.weapons],
    gear: { ...unit.gear }, pack: unit.pack.map((p) => ({ ...p })), abilities: [...unit.abilities],
    mp: unit.stats.mp, sta: unit.stats.sta, statuses: [], buffs: [], usedAbilities: [], faroreMark: undefined, cooldowns: {},
    hp: Math.max(1, unit.hp), moved: false, acted: false, kills: 0, movedDist: 0, survivedOnce: false, attacked: false, lastHitBy: undefined,
  };
  wildPrepare(out);
  // Wart's bubbles: the first damaging hit of each battle is absorbed.
  if (out.skills.includes('bubbleShield') || hasEffect(out, 'bubble')) out.buffs.push({ id: 'bubble', name: 'Bubble', turns: 99 });
  // The Garo Master starts the battle hidden in the shadows.
  if (out.skills.includes('masterOfAmbush')) out.statuses.push({ kind: 'veiled', turns: 2 });
  return out;
}

// ───────── Weapon durability and forging ─────────

const RARITY_USES: Record<string, number> = { common: 40, uncommon: 35, rare: 30, epic: 30, legendary: 45, mythic: 0 };

/** Max uses for a weapon (0 = unbreakable). Natural weapons and instruments never break. */
export function maxUses(w: WeaponDef | undefined): number {
  if (!w || w.type === 'natural' || w.type === 'instrument') return 0;
  if (w.uses !== undefined) return w.uses;
  return w.type === 'staff' ? Math.round((RARITY_USES[w.rarity] ?? 30) * 0.6) : RARITY_USES[w.rarity] ?? 30;
}

export function usesLeft(u: Unit, weaponId: string): number | null {
  const max = wildMaxUses(u, weaponId, maxUses(WEAPONS[weaponId]));
  if (!max) return null;
  return Math.max(0, max - (u.wear?.[weaponId] ?? 0));
}

export function forgeLevel(u: Unit, weaponId: string): number {
  return u.forge?.[weaponId] ?? 0;
}

/**
 * Spend one use of a weapon (player units only). If it breaks it is replaced
 * by its broken form, or removed; a unit left with nothing grabs a Deku Stick.
 */
export function spendUse(u: Unit, weaponId: string): { broke: boolean; into?: string } {
  if (u.team !== 'player') return { broke: false };
  const max = wildMaxUses(u, weaponId, maxUses(WEAPONS[weaponId]));
  if (!max) return { broke: false };
  u.wear ??= {};
  u.wear[weaponId] = (u.wear[weaponId] ?? 0) + (WEAPONS[weaponId]?.wearRate ?? 1);
  if (u.wear[weaponId] < max) return { broke: false };
  delete u.wear[weaponId];
  if (u.forge) delete u.forge[weaponId];
  if (u.fused) delete u.fused[weaponId];
  if (u.wmod) delete u.wmod[weaponId];
  const i = u.weapons.indexOf(weaponId);
  const into = WEAPONS[weaponId]?.brokenInto;
  if (i >= 0) {
    if (into) u.weapons[i] = into;
    else u.weapons.splice(i, 1);
  }
  if (!u.weapons.length) u.weapons.push('dekuStick');
  return { broke: true, into: into ?? (u.weapons[0] === 'dekuStick' && !into ? 'dekuStick' : undefined) };
}
