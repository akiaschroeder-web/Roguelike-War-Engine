// Era of the Wild: equipment traits (armor set bonuses, resistances, disguises,
// runes), kept apart from engine/wild.ts so the low-level status and unit modules
// can use them without importing the whole pack engine.

import { CLASSES, GEAR, RACES, WEAPONS } from '../data/registry';
import { SET_BONUSES } from '../content/wild/gear';
import type { StatusKind, Unit } from './types';

const SET_SLOTS = ['head', 'body', 'feet'] as const;

/** Every Wild trait a unit has from its gear, set bonuses and meal/elixir buffs. */
export function wildTraits(u: Unit): string[] {
  const out: string[] = [];
  const twoHanded = !!WEAPONS[u.weapons?.[0]]?.twoHanded;
  for (const [slot, id] of Object.entries(u.gear ?? {})) {
    const g = id ? GEAR[id] : undefined;
    if (!g?.wildFx) continue;
    if (slot === 'shield' && twoHanded) continue;
    if (slot === 'mount' && u.mounted === false) continue;
    out.push(...g.wildFx);
  }
  // Set bonuses: head + body + feet of one set (the Ancient Hero's Aspect counts as a full set).
  const sets = SET_SLOTS.map((s) => GEAR[u.gear?.[s] ?? '']?.wildSet).filter(Boolean) as string[];
  if (sets.length === 3 && sets.every((s) => s === sets[0])) out.push(...(SET_BONUSES[sets[0]]?.traits ?? []), 'fullSet');
  // Armor enhanced at a Great Fairy Fountain doesn't change traits; meals and elixirs do.
  for (const b of u.buffs ?? []) if (b.id.startsWith('wt:')) out.push(b.id.slice(3));
  // Racial and personal traits.
  if (u.race === 'goron' || u.race === 'fireDragon' || u.race === 'fireCreature') out.push('flameRes');
  if (u.race === 'rito' || u.race === 'frostDragon') out.push('coldRes');
  if (u.race === 'gerudo') out.push('heatRes');
  if (u.race === 'zonaiConstruct' || u.race === 'guardian' || u.race === 'zonaiVehicle' || u.race === 'divineBeast') out.push('heatRes', 'coldRes');
  if (u.skills?.includes('mechanicalDiscipline')) out.push('fearImmune');
  if (u.skills?.includes('tramplingCharge')) out.push('fearImmune');
  if (u.templateId === 'stalhorse' || u.race === 'stalMonster' || u.race === 'gloomEntity' || u.race === 'immortalDemonDragon') out.push('gloomImmune');
  return out;
}

export const hasTrait = (u: Unit, t: string) => wildTraits(u).includes(t);
export const traitCount = (u: Unit, t: string) => wildTraits(u).filter((x) => x === t).length;

/** Status immunities from Wild gear (called from status.ts). */
export function wildImmune(u: Unit, kind: StatusKind): boolean {
  if (!u.gear && !u.buffs?.length && !u.skills?.length) return false;
  const tr = wildTraits(u);
  if (kind === 'freeze' && (tr.includes('freezeImmune') || u.gear?.head === 'zantsHelmet')) return true;
  if (kind === 'burn' && tr.includes('fireImmune')) return true;
  if (kind === 'shock' && (tr.includes('shockImmune') || tr.includes('lightningImmune'))) return true;
  if (kind === 'fear' && tr.includes('fearImmune')) return true;
  if (kind === 'malice' && (tr.includes('sacredWard') || RACES[u.race]?.tags?.includes('malice'))) return true;
  return false;
}

/** Lava immunity from Wild skills (Vah Rudania). */
export function wildLavaImmune(u: Unit): boolean {
  return !!u.skills?.includes('volcanicAssault') || hasTrait(u, 'fireImmune');
}

const FAMILY: Record<string, (id: string) => boolean> = {
  bokoblin: (id) => /bokoblin|boko|stalkoblin/i.test(id),
  moblin: (id) => /moblin/i.test(id),
  lizalfos: (id) => /lizalfos|lizal|dinolfos/i.test(id),
  horriblin: (id) => /horriblin/i.test(id),
  lynel: (id) => /lynel/i.test(id),
};

/** Disguises: does `enemy` (an AI unit) leave `target` alone? */
export function wildIgnores(enemy: Unit, target: Unit, dist: number, turn = 1): boolean {
  if (target.wildDisabled) return true; // a disabled Divine Beast is no threat
  if (dist <= 1 || target.attacked || enemy.lastHitBy === target.uid) return false;
  const tr = wildTraits(target);
  if (!tr.length) return false;
  const id = enemy.artId ?? enemy.templateId ?? enemy.bossId ?? '';
  for (const t of tr) {
    if (!t.startsWith('disguise:')) continue;
    const fam = t.slice(9);
    if (fam === 'lynel' && turn > 3) continue;
    if (FAMILY[fam]?.(id)) return true;
  }
  if (target.gear?.head === 'majorasMaskGear' && (RACES[enemy.race]?.tags?.includes('beast') || enemy.race === 'monster')) return true;
  if (tr.includes('boneDisguise') && (enemy.race === 'stalMonster' || /^stal/.test(id))) return true;
  if (tr.includes('gerudoDisguise') && enemy.race === 'gerudo') return true;
  if (tr.includes('yigaDisguise') && CLASSES[enemy.classId]?.tags?.includes('yiga')) return true;
  return false;
}

/** Max uses with fusion and decay/pristine modifiers (called from units.ts). */
export function wildMaxUses(u: Unit, weaponId: string, base: number): number {
  if (!base || (!u.wmod && !u.fused)) return base;
  let m = 1;
  const mod = u.wmod?.[weaponId];
  if (mod === 'decayed') m *= 0.6;
  if (mod === 'pristine') m *= 1.4;
  if (u.fused?.[weaponId]) {
    let f = 1.25 + 0.05 * Math.max(0, (u.turnUses?.fusionProf ?? 1) - 1);
    if (u.skills?.includes('resourcefulWarrior')) f += 0.2;
    if (u.buffs?.some((b) => b.id === 'fusionMastery')) f += 0.25;
    m *= f;
  }
  return Math.max(1, Math.round(base * m));
}

/** Great Fairy enhancement: +1 DEF per star on worn armor. */
export function armorStarDef(u: Unit): number {
  if (!u.armorStars) return 0;
  return (['head', 'body', 'feet'] as const).reduce((n, s) => n + (u.gear?.[s] ? u.armorStars?.[u.gear[s]!] ?? 0 : 0), 0);
}

/** Reset Wild battle-only state on the battle copy of a unit. */
export function wildPrepare(u: Unit) {
  delete u.arrowFuse; delete u.tempFuse; delete u.wildCharges; delete u.wildDisabled; delete u.msEnergy; delete u.wildGiant; delete u.wildSeg;
  if (u.team === 'player') delete u.wildCorrupt;
}
