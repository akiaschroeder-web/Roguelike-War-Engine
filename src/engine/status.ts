// Status effects (burn, freeze, shock, poison, stun), elemental on-hit effects
// and timed buffs.

import type { RNG } from './rng';
import type { Battle, Element, StatusKind, Unit } from './types';

export const STATUS_INFO: Record<StatusKind, { name: string; icon: string; desc: string }> = {
  burn: { name: 'Burning', icon: '🔥', desc: 'Loses 10% max HP each turn and has −2 DEF.' },
  freeze: { name: 'Frozen', icon: '❄', desc: 'Cannot act. Taking damage breaks the ice.' },
  shock: { name: 'Shocked', icon: '⚡', desc: '−15 Hit.' },
  poison: { name: 'Poisoned', icon: '☠', desc: 'Loses 10% max HP each turn.' },
  stun: { name: 'Stunned', icon: '💫', desc: 'Loses its next action.' },
};

export function hasStatus(u: Unit, kind: StatusKind): boolean {
  return u.statuses.some((s) => s.kind === kind);
}

export function addStatus(u: Unit, kind: StatusKind, turns: number) {
  const cur = u.statuses.find((s) => s.kind === kind);
  if (cur) cur.turns = Math.max(cur.turns, turns);
  else u.statuses.push({ kind, turns });
}

export function clearStatus(u: Unit, kind?: StatusKind) {
  u.statuses = kind ? u.statuses.filter((s) => s.kind !== kind) : [];
}

/** Combat modifiers from statuses. */
export function statusMods(u: Unit): { def: number; hit: number } {
  return { def: hasStatus(u, 'burn') ? -2 : 0, hit: hasStatus(u, 'shock') ? -15 : 0 };
}

/** Might adjustment for an element in the current weather. */
export function weatherMight(b: Battle, el: Element | undefined): number {
  if (b.weather?.kind !== 'rain' || !el) return 0;
  if (el === 'fire') return -2;
  if (el === 'water' || el === 'lightning') return 2;
  return 0;
}

/**
 * After a damaging hit, an elemental attack may inflict a status.
 * Returns the status applied, if any.
 */
export function rollElement(b: Battle, by: Unit, target: Unit, el: Element | undefined, rng: RNG): StatusKind[] {
  const out: StatusKind[] = [];
  const els: Element[] = el ? [el] : [];
  if (by.skills.includes('combinedSorcery') && (el === 'fire' || el === 'ice')) els.splice(0, 1, 'fire', 'ice');
  const rain = b.weather?.kind === 'rain';
  for (const e of els) {
    if (e === 'fire' && !rain && rng.chance(30)) {
      addStatus(target, 'burn', by.skills.includes('witchOfFlame') ? 3 : 2);
      out.push('burn');
    } else if (e === 'ice' && rng.chance(by.skills.includes('witchOfIce') ? 40 : 20)) {
      addStatus(target, 'freeze', 1);
      out.push('freeze');
    } else if (e === 'lightning' && rng.chance(rain ? 50 : 30)) {
      addStatus(target, 'shock', 2);
      out.push('shock');
    } else if (e === 'nature' && rng.chance(30)) {
      addStatus(target, 'poison', 3);
      out.push('poison');
    }
  }
  return out;
}

export interface StatusTick {
  damage: number;
  lostTurn: StatusKind | null;
}

/**
 * Start-of-phase upkeep for one unit: damage over time (never lethal),
 * lost turns from freeze/stun, and status/buff countdowns.
 */
export function tickStatuses(u: Unit): StatusTick {
  let damage = 0;
  let lostTurn: StatusKind | null = null;
  for (const s of u.statuses) {
    if (s.kind === 'burn' || s.kind === 'poison') damage += Math.max(1, Math.ceil(u.stats.hp * 0.1));
    if ((s.kind === 'freeze' || s.kind === 'stun') && !lostTurn) lostTurn = s.kind;
  }
  damage = Math.min(damage, Math.max(0, u.hp - 1));
  u.hp -= damage;
  for (const s of u.statuses) s.turns--;
  u.statuses = u.statuses.filter((s) => s.turns > 0);
  for (const b of u.buffs) b.turns--;
  u.buffs = u.buffs.filter((b) => b.turns > 0);
  return { damage, lostTurn };
}
