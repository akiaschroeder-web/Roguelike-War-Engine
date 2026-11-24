import { TERRAIN_BONUS } from '../data/classes';
import { canReach, expectedDamage, forecast, healAmount, weaponOf } from './combat';
import { computeMoves, distanceField, keyOf, moveTypeOf, posOf, tilesInRange, unitAt } from './grid';
import type { Battle, Pos, Unit } from './types';

export interface AIPlan {
  unit: string;
  path: Pos[];
  dest: Pos;
  action: { type: 'attack' | 'heal'; target: string } | null;
}

/** Decide what an enemy unit does this turn. Pure: does not mutate the battle. */
export function planAction(b: Battle, unit: Unit): AIPlan {
  const weapon = weaponOf(unit);
  const stay = { x: unit.x, y: unit.y };
  const { reach, path } = computeMoves(b, unit, unit.ai === 'stationary' ? 0 : undefined);
  const foes = b.units.filter((u) => u.team !== unit.team);
  const friends = b.units.filter((u) => u.team === unit.team && u !== unit);

  // ── Healers: patch up the most injured ally they can reach.
  if (weapon.type === 'staff') {
    let best: { score: number; dest: number; target: Unit } | null = null;
    for (const [k] of reach) {
      const p = posOf(b, k);
      for (const t of tilesInRange(b, p, weapon.minRange, weapon.maxRange)) {
        const ally = friends.find((f) => f.x === t.x && f.y === t.y);
        if (!ally) continue;
        const missing = ally.stats.hp - ally.hp;
        if (missing < 5) continue;
        const score = Math.min(missing, healAmount(b, unit)) - threatAt(b, unit, p) * 0.3;
        if (!best || score > best.score) best = { score, dest: k, target: ally };
      }
    }
    if (best) {
      return { unit: unit.uid, path: path(best.dest), dest: posOf(b, best.dest), action: { type: 'heal', target: best.target.uid } };
    }
    // Otherwise trail behind the pack.
    return approach(b, unit, reach, path, friends.length ? friends : foes, 1);
  }

  // ── Attackers: evaluate every (tile, target) pair.
  let best: { score: number; dest: number; target: Unit } | null = null;
  for (const [k] of reach) {
    const p = posOf(b, k);
    for (const foe of foes) {
      const d = Math.abs(foe.x - p.x) + Math.abs(foe.y - p.y);
      if (!canReach(weapon, d)) continue;
      const fc = forecast(b, unit, p, foe);
      const dealt = expectedDamage(fc.attacker);
      const taken = expectedDamage(fc.defender);
      const lethal = fc.attacker.dmg * fc.attacker.attacks >= foe.hp;
      const terrain = TERRAIN_BONUS[b.tiles[k]];
      let score = dealt * 2 - taken + (lethal ? 30 : 0) + terrain.avoid / 10 + terrain.def;
      if (foe.isCommander) score += 8;
      if (fc.defender.attacks === 0) score += 5; // free hit
      if (!best || score > best.score) best = { score, dest: k, target: foe };
    }
  }
  if (best) {
    return { unit: unit.uid, path: path(best.dest), dest: posOf(b, best.dest), action: { type: 'attack', target: best.target.uid } };
  }

  // Guards hold position unless something wanders into reach.
  if (unit.ai === 'guard' || unit.ai === 'stationary') {
    return { unit: unit.uid, path: [stay], dest: stay, action: null };
  }
  return approach(b, unit, reach, path, foes, 0);
}

function approach(
  b: Battle,
  unit: Unit,
  reach: Map<number, { cost: number }>,
  path: (k: number) => Pos[],
  goals: Unit[],
  keepDistance: number,
): AIPlan {
  const stay = { x: unit.x, y: unit.y };
  if (!goals.length) return { unit: unit.uid, path: [stay], dest: stay, action: null };
  const field = distanceField(b, goals.map((g) => ({ x: g.x, y: g.y })), moveTypeOf(unit));
  let bestK = keyOf(b, unit.x, unit.y);
  let bestScore = Infinity;
  for (const [k] of reach) {
    const d = field[k];
    if (d === Infinity) continue;
    const score = Math.abs(d - keepDistance) + reach.get(k)!.cost * 0.01;
    if (score < bestScore) {
      bestScore = score;
      bestK = k;
    }
  }
  return { unit: unit.uid, path: path(bestK), dest: posOf(b, bestK), action: null };
}

/** How many foes could hit this tile next turn (very rough). */
function threatAt(b: Battle, unit: Unit, p: Pos): number {
  let n = 0;
  for (const foe of b.units) {
    if (foe.team === unit.team) continue;
    const w = weaponOf(foe);
    const d = Math.abs(foe.x - p.x) + Math.abs(foe.y - p.y);
    if (d <= foe.stats.mov + w.maxRange) n++;
  }
  return n;
}

/** Is the target still valid for the plan's action from its destination? */
export function planStillValid(b: Battle, plan: AIPlan): boolean {
  if (!plan.action) return true;
  const target = b.units.find((u) => u.uid === plan.action!.target);
  if (!target) return false;
  const occ = unitAt(b, plan.dest.x, plan.dest.y);
  return !occ || occ.uid === plan.unit;
}
