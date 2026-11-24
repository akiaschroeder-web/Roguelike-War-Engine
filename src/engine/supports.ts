// Support relationships: allies who fight near each other bond over time and
// earn ranks C, B, A (and S for special pairs), which grant combat bonuses
// when they fight within 2 spaces of each other.

import { SUPPORT_S_PAIRS } from '../data/registry';
import { unitDist } from './grid';
import type { Battle, Pos, Unit } from './types';

export type SupportRank = '' | 'C' | 'B' | 'A' | 'S';

export const RANK_POINTS: [SupportRank, number][] = [['S', 70], ['A', 40], ['B', 20], ['C', 8]];

export const supportKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function isSPair(a: Unit, b: Unit): boolean {
  const ta = a.templateId, tb = b.templateId;
  return !!ta && !!tb && SUPPORT_S_PAIRS.some(([x, y]) => (x === ta && y === tb) || (x === tb && y === ta));
}

export function rankOf(points: number, sPair: boolean): SupportRank {
  for (const [r, p] of RANK_POINTS) {
    if (r === 'S' && !sPair) continue;
    if (points >= p) return r;
  }
  return '';
}

/** Max points a pair can reach (non-S pairs stop at A). */
export function pointCap(sPair: boolean): number {
  return sPair ? 70 : 40;
}

const BONUS: Record<SupportRank, { hit: number; avoid: number; crit: number; def: number }> = {
  '': { hit: 0, avoid: 0, crit: 0, def: 0 },
  C: { hit: 5, avoid: 5, crit: 0, def: 0 },
  B: { hit: 10, avoid: 10, crit: 5, def: 0 },
  A: { hit: 15, avoid: 15, crit: 5, def: 1 },
  S: { hit: 20, avoid: 20, crit: 10, def: 2 },
};

/** Combined bonus from supported allies within 2 spaces (capped). */
export function supportBonus(b: Battle, u: Unit, pos: Pos): { hit: number; avoid: number; crit: number; def: number } {
  const out = { hit: 0, avoid: 0, crit: 0, def: 0 };
  if (!b.supports) return out;
  for (const a of b.units) {
    if (a === u || a.team !== u.team || unitDist(u, a, pos) > 2) continue;
    const r = rankOf(b.supports[supportKey(u.uid, a.uid)] ?? 0, isSPair(u, a));
    const x = BONUS[r];
    out.hit += x.hit; out.avoid += x.avoid; out.crit += x.crit; out.def += x.def;
  }
  out.hit = Math.min(30, out.hit);
  out.avoid = Math.min(30, out.avoid);
  out.crit = Math.min(15, out.crit);
  out.def = Math.min(3, out.def);
  return out;
}

/** A player unit fought (or healed): bond with allies within 2 spaces. */
export function gainSupport(b: Battle, u: Unit, amount = 1, partner?: Unit) {
  if (u.team !== 'player') return;
  b.supports ??= {};
  const friends = partner ? [partner] : b.units.filter((a) => a !== u && a.team === 'player' && unitDist(u, a) <= 2);
  for (const a of friends) {
    const k = supportKey(u.uid, a.uid);
    b.supports[k] = Math.min(pointCap(isSPair(u, a)), (b.supports[k] ?? 0) + amount);
  }
}
