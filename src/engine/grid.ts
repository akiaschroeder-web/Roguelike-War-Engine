import { CLASSES, INF, MOVE_COSTS } from '../data/classes';
import { effectiveStats } from './units';
import type { Battle, MoveType, Pos, Terrain, Unit } from './types';

export const keyOf = (b: { width: number }, x: number, y: number) => y * b.width + x;
export const posOf = (b: { width: number }, k: number): Pos => ({ x: k % b.width, y: Math.floor(k / b.width) });
export const dist = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function inBounds(b: { width: number; height: number }, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < b.width && y < b.height;
}

export function terrainAt(b: Battle, x: number, y: number): Terrain {
  return b.tiles[keyOf(b, x, y)];
}

export function unitAt(b: Battle, x: number, y: number): Unit | undefined {
  return b.units.find((u) => u.x === x && u.y === y);
}

export function moveTypeOf(u: Unit): MoveType {
  return CLASSES[u.classId].moveType;
}

export function moveCost(t: Terrain, mt: MoveType): number {
  return MOVE_COSTS[mt][t];
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export interface ReachInfo {
  cost: number;
  prev: number;
}

export interface Moves {
  /** Tiles the unit may end its move on, keyed by tile index. */
  reach: Map<number, ReachInfo>;
  /** Path (including the start tile) to a reachable destination. */
  path: (dest: number) => Pos[];
}

/**
 * Dijkstra over the unit's movement budget. Allies can be passed through but
 * not stood on; enemies block.
 */
export function computeMoves(b: Battle, unit: Unit, budget?: number): Moves {
  const mov = budget ?? effectiveStats(unit, b.relics).mov;
  const mt = moveTypeOf(unit);
  const occupant = new Map<number, Unit>();
  for (const u of b.units) occupant.set(keyOf(b, u.x, u.y), u);

  const all = new Map<number, ReachInfo>();
  const start = keyOf(b, unit.x, unit.y);
  all.set(start, { cost: 0, prev: -1 });
  const frontier = [start];
  while (frontier.length) {
    frontier.sort((a, c) => all.get(a)!.cost - all.get(c)!.cost);
    const cur = frontier.shift()!;
    const { x, y } = posOf(b, cur);
    const cc = all.get(cur)!.cost;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!inBounds(b, nx, ny)) continue;
      const nk = keyOf(b, nx, ny);
      const occ = occupant.get(nk);
      if (occ && occ.team !== unit.team) continue;
      const c = moveCost(b.tiles[nk], mt);
      if (c >= INF) continue;
      const nc = cc + c;
      if (nc > mov) continue;
      const p = all.get(nk);
      if (!p || nc < p.cost) {
        all.set(nk, { cost: nc, prev: cur });
        frontier.push(nk);
      }
    }
  }
  const reach = new Map(all);
  for (const k of [...reach.keys()]) {
    const occ = occupant.get(k);
    if (occ && occ !== unit) reach.delete(k);
  }
  const path = (dest: number) => {
    const out: Pos[] = [];
    let cur = dest;
    while (cur !== -1) {
      const info = all.get(cur);
      if (!info) break;
      out.unshift(posOf(b, cur));
      cur = info.prev;
    }
    return out;
  };
  return { reach, path };
}

export function reachable(b: Battle, unit: Unit, budget?: number): Map<number, ReachInfo> {
  return computeMoves(b, unit, budget).reach;
}

/** Tiles within [min,max] Manhattan range of a position. */
export function tilesInRange(b: { width: number; height: number }, p: Pos, min: number, max: number): Pos[] {
  const out: Pos[] = [];
  for (let dy = -max; dy <= max; dy++) {
    for (let dx = -max; dx <= max; dx++) {
      const d = Math.abs(dx) + Math.abs(dy);
      if (d < min || d > max) continue;
      const x = p.x + dx, y = p.y + dy;
      if (inBounds(b, x, y)) out.push({ x, y });
    }
  }
  return out;
}

/**
 * Multi-source distance field (movement cost) from a set of goal tiles,
 * ignoring units. Used by the AI to walk toward targets beyond its reach.
 */
export function distanceField(b: Battle, goals: Pos[], mt: MoveType): number[] {
  const d = new Array(b.tiles.length).fill(Infinity);
  const frontier: number[] = [];
  for (const g of goals) {
    const k = keyOf(b, g.x, g.y);
    d[k] = 0;
    frontier.push(k);
  }
  while (frontier.length) {
    frontier.sort((a, c) => d[a] - d[c]);
    const cur = frontier.shift()!;
    const { x, y } = posOf(b, cur);
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!inBounds(b, nx, ny)) continue;
      const nk = keyOf(b, nx, ny);
      // Walking nk -> cur costs the entry cost of cur; nk itself must be passable.
      if (moveCost(b.tiles[nk], mt) >= INF) continue;
      const nd = d[cur] + Math.min(moveCost(b.tiles[cur], mt), 3);
      if (nd < d[nk]) {
        d[nk] = nd;
        frontier.push(nk);
      }
    }
  }
  return d;
}
