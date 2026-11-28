import { attackWeapons, expectedDamage, forecast, healAmount, healWeapons } from './combat';
import { computeMoves, distanceField, footDist, keyOf, posOf, unitDist, type Moves } from './grid';
import { LAVA_DAMAGE_PCT, TERRAIN_BONUS, WATERY } from './rules';
import { hasEffect, isLavaImmune } from './units';
import { wildIgnores } from './wildGear';
import { eoTauntFilter } from './echoes';
import type { Battle, Pos, Unit } from './types';
import { microSheltered } from './micro';

export interface AIPlan {
  unit: string;
  path: Pos[];
  dest: Pos;
  action: { type: 'attack' | 'heal'; target: string; weaponId: string } | null;
}

/** Decide what an enemy unit does this turn. Pure: does not mutate the battle. */
export function planAction(b: Battle, unit: Unit): AIPlan {
  const stay = { x: unit.x, y: unit.y };
  if (unit.captive) return { unit: unit.uid, path: [stay], dest: stay, action: null };
  const moves = computeMoves(b, unit, unit.ai === 'stationary' ? 0 : undefined);
  // Escort VIPs head for the exit and never pick fights.
  if (unit.vip) {
    const exits = (b.objective.tiles ?? []).map((t) => ({ ...unit, x: t.x, y: t.y, size: 1 }));
    for (const [k] of moves.reach) {
      const p = posOf(b, k);
      if (exits.some((e) => e.x === p.x && e.y === p.y)) return { unit: unit.uid, path: moves.path(k), dest: p, action: null };
    }
    return exits.length ? approach(b, unit, moves, exits) : { unit: unit.uid, path: [stay], dest: stay, action: null };
  }
  const foes = b.units.filter((u) => u.team !== unit.team && !u.captive && !(unit.team === 'player' && u.hidden)
    // Stone Mask: unnoticed beyond 2 spaces until the wearer attacks.
    && !(hasEffect(u, 'stoneMask') && !u.attacked && unitDist(unit, u) > 2)
    // Gibdo Mask: Gibdos and ReDeads leave the wearer alone unless provoked.
    && !(hasEffect(u, 'gibdo') && ['gibdo', 'redead'].includes(unit.artId ?? '') && unit.lastHitBy !== u.uid)
    // Ghost ships slip by at night; Poes won't touch Jalhalla's Mask.
    && !(b.night && (hasEffect(u, 'ghostFlag') || u.skills.includes('phantomVoyage')) && !u.attacked && unitDist(unit, u) > 1)
    && !(hasEffect(u, 'poeCommand') && unit.artId === 'poe')
    // Era of the Wild disguises: monster masks, Gerudo and Yiga outfits, skeletal disguises.
    && !wildIgnores(unit, u, unitDist(unit, u), b.turn));
  const friends = b.units.filter((u) => u.team === unit.team && u !== unit);
  // Echoes of Wisdom: a Ribbitune's Taunting Croak draws the attention of foes within 2.
  const taunted = eoTauntFilter(unit, foes);
  if (taunted !== foes) foes.splice(0, foes.length, ...taunted);
  const lavaPenalty = (k: number) => (b.tiles[k] === 'lava' && !isLavaImmune(unit) ? LAVA_DAMAGE_PCT / 4 : 0);

  // Healing
  let bestHeal: { score: number; dest: number; target: Unit; w: string } | null = null;
  for (const [k] of moves.reach) {
    const p = posOf(b, k);
    for (const ally of friends) {
      const missing = ally.stats.hp - ally.hp;
      if (missing < 5) continue;
      const staff = healWeapons(unit, footDist(p.x, p.y, unit.size, ally.x, ally.y, ally.size))[0];
      if (!staff) continue;
      const score = Math.min(missing, healAmount(b, unit, staff)) - lavaPenalty(k);
      if (!bestHeal || score > bestHeal.score) bestHeal = { score, dest: k, target: ally, w: staff.id };
    }
  }

  // Attacks: evaluate every (tile, target, weapon).
  let best: { score: number; dest: number; target: Unit; w: string } | null = null;
  for (const [k] of moves.reach) {
    const p = posOf(b, k);
    for (const foe of foes) {
      if (microSheltered(b, foe)) continue;
      const d = footDist(p.x, p.y, unit.size, foe.x, foe.y, foe.size);
      for (const w of attackWeapons(unit, d)) {
        const fc = forecast(b, unit, p, foe, w.id);
        const dealt = expectedDamage(fc.attacker);
        const taken = expectedDamage(fc.defender);
        const lethal = fc.attacker.dmg * fc.attacker.attacks >= foe.hp;
        // Micro targets: a normal-sized attacker doesn't waste its turn on a near-hopeless swing (−60 Hit).
        if (foe.micro && !unit.micro && fc.attacker.hit < 20 && !lethal) continue;
        const terrain = TERRAIN_BONUS[b.tiles[k]];
        let score = dealt * 2 - taken + (lethal ? 30 : 0) + terrain.avoid / 10 + terrain.def - lavaPenalty(k);
        if (foe.isCommander) score += 8;
        if (fc.defender.attacks === 0) score += 5;
        if (!best || score > best.score) best = { score, dest: k, target: foe, w: w.id };
      }
    }
  }

  const plan = (choice: { dest: number; target: Unit; w: string }, type: 'attack' | 'heal'): AIPlan => ({
    unit: unit.uid, path: moves.path(choice.dest), dest: posOf(b, choice.dest), action: { type, target: choice.target.uid, weaponId: choice.w },
  });
  // Defend maps: an enemy that can reach the point takes it (that ends the battle).
  const point = b.objective.type === 'defend' ? b.objective.tiles?.[0] : undefined;
  if (point && unit.ai !== 'stationary') {
    for (const [k] of moves.reach) {
      const p = posOf(b, k);
      if (point.x >= p.x && point.x < p.x + unit.size && point.y >= p.y && point.y < p.y + unit.size) {
        return { unit: unit.uid, path: moves.path(k), dest: p, action: null };
      }
    }
  }
  if (bestHeal && (!best || bestHeal.score > best.score)) return plan(bestHeal, 'heal');
  if (best) return plan(best, 'attack');

  // Guards hold position, but march once the battle drags on or their side is nearly beaten.
  const restless = b.turn >= 6 || friends.length <= 1;
  if (unit.ai === 'stationary' || (unit.ai === 'guard' && !restless)) return { unit: unit.uid, path: [stay], dest: stay, action: null };
  // On defend maps, about half the enemy army heads for the point instead of your units.
  if (point && Number(unit.uid.replace(/\D/g, '')) % 2 === 0) {
    return approach(b, unit, moves, [{ ...unit, x: point.x, y: point.y, size: 1 }]);
  }
  // Ships with a crew aboard head for the shore nearest the enemy.
  if (unit.cargo?.length && foes.length) {
    const coast = coastNear(b, foes);
    if (coast.length) return approach(b, unit, moves, coast);
  }
  return approach(b, unit, moves, foes.length ? foes : friends);
}

/** Land spaces next to water close to the given units (as 1×1 goals). */
function coastNear(b: Battle, foes: Unit[]): Unit[] {
  const out: Unit[] = [];
  const watery = (t: string) => WATERY.includes(t as never);
  for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) {
    const t = b.tiles[keyOf(b, x, y)];
    if (watery(t) || t === 'wall' || t === 'mountain') continue;
    const wet = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < b.width && ny < b.height && watery(b.tiles[keyOf(b, nx, ny)]); });
    if (!wet) continue;
    if (foes.some((f) => footDist(x, y, 1, f.x, f.y, f.size) <= 4)) out.push({ ...foes[0], x, y, size: 1 } as Unit);
  }
  return out;
}

function approach(b: Battle, unit: Unit, moves: Moves, goals: Unit[]): AIPlan {
  const stay = { x: unit.x, y: unit.y };
  if (!goals.length) return { unit: unit.uid, path: [stay], dest: stay, action: null };
  let field = distanceField(b, unit, goals);
  // Can't get next to anyone (ships and sea monsters vs. troops ashore): make for the nearest coast.
  if (b.naval && field[keyOf(b, unit.x, unit.y)] === Infinity && ![...moves.reach.keys()].some((k) => field[k] < Infinity)) {
    const coast = coastNear(b, goals);
    if (coast.length) field = distanceField(b, unit, coast);
  }
  let bestK = keyOf(b, unit.x, unit.y);
  let bestScore = Infinity;
  for (const [k, info] of moves.reach) {
    if (field[k] === Infinity) continue;
    const lava = b.tiles[k] === 'lava' && !isLavaImmune(unit) ? 3 : 0;
    const score = field[k] + info.cost * 0.01 + lava;
    if (score < bestScore) {
      bestScore = score;
      bestK = k;
    }
  }
  return { unit: unit.uid, path: moves.path(bestK), dest: posOf(b, bestK), action: null };
}

/** True if the target is still alive and in range of the plan's destination. */
export function planStillValid(b: Battle, plan: AIPlan): boolean {
  if (!plan.action) return true;
  const target = b.units.find((u) => u.uid === plan.action!.target);
  const me = b.units.find((u) => u.uid === plan.unit);
  return !!target && !!me && unitDist(me, target, plan.dest) >= 0;
}
