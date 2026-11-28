import { RACES } from '../data/registry';
import { tpTileCost } from './twilight';
import { ssTileCost } from './skyward';
import { wildTileCost } from './wild';
import { ogLeaps, ogTileCost } from './original';
import { lgTileCost } from './legend';
import { phTileCost } from './phantom';
import { spTileCost } from './spirit';
import { mcTileCost, microRoom } from './micro';
import { mnTileCost } from './minish';
import { fsTileCost } from './fourswords';
import { lrTileCost } from './lorule';
import { tfTileCost } from './triforce';
import { INF, MOVE_COSTS } from './rules';
import { canSwim, effectiveStats, hasEffect, isMounted, moveTypeOf, unitTags } from './units';
import { windFactor } from './naval';
import type { Battle, Pos, Terrain, Unit } from './types';

// Units occupy a size×size footprint anchored at (x, y), its top-left tile.

export const keyOf = (b: { width: number }, x: number, y: number) => y * b.width + x;
export const posOf = (b: { width: number }, k: number): Pos => ({ x: k % b.width, y: Math.floor(k / b.width) });
export const dist = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function inBounds(b: { width: number; height: number }, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < b.width && y < b.height;
}

export function terrainAt(b: Battle, x: number, y: number): Terrain {
  return b.tiles[keyOf(b, x, y)];
}

export function footprint(x: number, y: number, size: number): Pos[] {
  const out: Pos[] = [];
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) out.push({ x: x + dx, y: y + dy });
  return out;
}

/** The normal-sized unit on a tile. Micro units (engine/micro.ts) share tiles and never block, so they are not
 *  returned: use micro.ts unitsAt / microAt for them. */
export function unitAt(b: Battle, x: number, y: number): Unit | undefined {
  return b.units.find((u) => !u.micro && !u.tfStack && x >= u.x && y >= u.y && x < u.x + u.size && y < u.y + u.size);
}

/** Gap distance between two footprints (1 = adjacent, 0 = overlapping). */
export function footDist(ax: number, ay: number, as: number, bx: number, by: number, bs: number): number {
  const gx = Math.max(0, ax - (bx + bs - 1), bx - (ax + as - 1));
  const gy = Math.max(0, ay - (by + bs - 1), by - (ay + as - 1));
  return gx + gy;
}

/** Distance between two units, optionally with `a` standing at `aPos`. */
export function unitDist(a: Unit, b: Unit, aPos: Pos = a): number {
  const d = footDist(aPos.x, aPos.y, a.size, b.x, b.y, b.size);
  // A Micro unit sharing a space with another unit is next to it (it can strike, be struck, ride or infiltrate).
  return d === 0 && (a.micro || b.micro || !!a.tfStack || !!b.tfStack) && a.uid !== b.uid ? 1 : d;
}

/** Movement cost of a single tile for a unit, including racial traits. */
export function tileCost(b: Battle, unit: Unit, t: Terrain): number {
  const mt = moveTypeOf(unit);
  let c = MOVE_COSTS[mt][t];
  if (mt === 'fixed') return INF;
  const race = RACES[unit.race];
  const watery = t === 'water' || t === 'poisonWater' || t === 'current' || t === 'whirlpool' || t === 'submergedTreasure' || t === 'cycloneWarp';
  if (watery && canSwim(unit)) c = 1;
  else if (watery && unit.skills.includes('leafGlide')) c = 2; // Koroks glide over on leaves
  else if (watery && unit.skills.includes('dekuMobility')) c = 2; // Deku Link bounces across water
  else if (watery && unit.race === 'deku') c = 3; // other Deku hop a little
  if (race?.waterOnly && !watery) return INF; // Lord Jabu-Jabu stays in the water
  if (t === 'rollingRamp' && unit.race === 'goron') c = 1;
  if (t === 'forest' && (race?.forestWalker || forestFriend(b, unit))) c = 1;
  if (isMounted(unit)) {
    if (t === 'forest' && hasEffect(unit, 'forestRunner')) c = 1;
    if (t === 'mountain' && hasEffect(unit, 'mountainWalker')) c = 2;
  }
  if (t === 'wall' && unit.skills.includes('spectralPassage')) c = 2;
  // Wind Waker spaces
  if (t === 'ropeSwing' && (unit.skills.includes('ropeRunner') || unit.skills.includes('boardingParty') || unit.skills.includes('grappler')
    || hasEffect(unit, 'deckBoots') || unit.weapons.includes('grapplingHook') || unitTags(unit).includes('pirate'))) c = 1;
  if (t === 'shipDeck' && (unit.skills.includes('ropeRunner') || hasEffect(unit, 'deckBoots'))) c = 1;
  if (t === 'sandVortex' && hasEffect(unit, 'sandWalker')) c = 1;
  if (hasEffect(unit, 'spectralHull') && (t === 'wall' || t === 'mountain' || t === 'plain' || t === 'forest')) c = Math.min(c, 2);
  // Twilight Princess spaces
  c = tpTileCost(b, unit, t, c);
  // Skyward Sword spaces
  c = ssTileCost(b, unit, t, c);
  // Era of the Wild spaces
  c = wildTileCost(b, unit, t, c)
  // Original Hyrule spaces
  c = ogTileCost(b, unit, t, c);
  // Era of Legend spaces (seasons, snowbanks, Invisible Floors, rings)
  c = lgTileCost(b, unit, t, c);
  // Phantom Hourglass spaces (Safe Zones keep Phantoms out, tightropes, the Ocean King's Blessing)
  c = phTileCost(b, unit, t, c);
  // Spirit Tracks spaces (trains stay on the rails; the Lokomo melodies)
  c = spTileCost(b, unit, t, c);
  // Micro units have their own movement network on size-dependent terrain
  if (unit.micro) c = mcTileCost(b, unit, t, c);
  // The Minish Cap's gear and skills (Grip Ring, Hidden Trails, Climbing Gloves, Leaf Glider)
  c = mnTileCost(b, unit, t, c);
  // Four Swords: Shadow Link walks through dark terrain
  c = fsTileCost(b, unit, t, c);
  // A Link Between Worlds: wall-merged units travel through walls; forests, River Zora waters
  c = lrTileCost(b, unit, t, c);
  // Tri Force Heroes: the Cozy Parka on ice, the Dunewalker Duds on sand
  c = tfTileCost(b, unit, t, c);
  if (unit.buffs?.some((x) => x.id === 'spectralStep') && c >= INF && t !== 'water') c = 2;
  return c;
}

/** Saria's Forest's Friendship applies to her and allies adjacent to her. */
function forestFriend(b: Battle, unit: Unit): boolean {
  if (unit.skills.includes('forestsFriendship')) return true;
  return b.units.some((s) => s !== unit && s.team === unit.team && s.skills.includes('forestsFriendship') && unitDist(unit, s) <= 1);
}

/** Cost of placing the unit's footprint with its anchor at (x, y). */
export function anchorCost(b: Battle, unit: Unit, x: number, y: number): number {
  let worst = 0;
  for (const p of footprint(x, y, unit.size)) {
    if (!inBounds(b, p.x, p.y)) return INF;
    worst = Math.max(worst, tileCost(b, unit, b.tiles[keyOf(b, p.x, p.y)]));
    if (worst >= INF) return INF;
  }
  return worst;
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export interface ReachInfo {
  cost: number;
  prev: number;
}

export interface Moves {
  /** Anchor tiles the unit may end its move on, keyed by tile index. */
  reach: Map<number, ReachInfo>;
  /** Anchor path (including the start) to a reachable destination. */
  path: (dest: number) => Pos[];
}

/**
 * Dijkstra over anchor positions. Allies can be passed through but not stood
 * on; enemies block (unless the unit has Spectral Passage).
 */
export function computeMoves(b: Battle, unit: Unit, budget?: number): Moves {
  const mov = unit.statuses?.some((s) => s.kind === 'root') ? 0 : budget ?? effectiveStats(unit).mov;
  const ghost = unit.skills.includes('spectralPassage') || hasEffect(unit, 'phantomRide') || hasEffect(unit, 'phaseThrough')
    || hasEffect(unit, 'spectralHull') || unit.skills.includes('phantomVoyage') || unit.skills.includes('suspendedHorror') || unit.skills.includes('burrowingAmbush') || ogLeaps(unit);
  // Micro units never block, and pass through every space (up to four of them stop on one tile).
  const micro = !!unit.micro;
  const occ = new Map<number, Unit>();
  for (const u of b.units) if (!u.micro && !u.tfStack) for (const p of footprint(u.x, u.y, u.size)) occ.set(keyOf(b, p.x, p.y), u);

  const blockedByFoe = (x: number, y: number) => {
    if (ghost || micro) return false;
    for (const p of footprint(x, y, unit.size)) {
      const o = occ.get(keyOf(b, p.x, p.y));
      if (o && o.team !== unit.team) return true;
    }
    return false;
  };
  const freeToStop = (x: number, y: number) => {
    if (micro) return microRoom(b, x, y, unit) > 0;
    for (const p of footprint(x, y, unit.size)) {
      const o = occ.get(keyOf(b, p.x, p.y));
      if (o && o !== unit) return false;
    }
    return true;
  };

  const all = new Map<number, ReachInfo>();
  const start = keyOf(b, unit.x, unit.y);
  all.set(start, { cost: 0, prev: -1 });
  const frontier = [start];
  while (frontier.length && mov > 0) {
    frontier.sort((a, c) => all.get(a)!.cost - all.get(c)!.cost);
    const cur = frontier.shift()!;
    const { x, y } = posOf(b, cur);
    const cc = all.get(cur)!.cost;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!inBounds(b, nx, ny)) continue;
      const c = anchorCost(b, unit, nx, ny);
      if (c >= INF || blockedByFoe(nx, ny)) continue;
      const nc = cc + c * windFactor(b, unit, dx, dy);
      if (nc > mov) continue;
      const nk = keyOf(b, nx, ny);
      const p = all.get(nk);
      if (!p || nc < p.cost) {
        all.set(nk, { cost: nc, prev: cur });
        frontier.push(nk);
      }
    }
  }
  const reach = new Map<number, ReachInfo>();
  for (const [k, v] of all) {
    const { x, y } = posOf(b, k);
    if (k === start || freeToStop(x, y)) reach.set(k, v);
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

/** Tiles at distance [min, max] from a footprint. */
export function tilesInRange(b: { width: number; height: number }, p: Pos, min: number, max: number, size = 1): Pos[] {
  const out: Pos[] = [];
  for (let y = p.y - max; y < p.y + size + max; y++) {
    for (let x = p.x - max; x < p.x + size + max; x++) {
      if (!inBounds(b, x, y)) continue;
      const d = footDist(x, y, 1, p.x, p.y, size);
      if (d >= min && d <= max) out.push({ x, y });
    }
  }
  return out;
}

/**
 * Distance field over the mover's anchor positions: movement cost to get
 * adjacent to any goal unit, ignoring other units. Used by the AI.
 */
export function distanceField(b: Battle, mover: Unit, goals: Unit[]): number[] {
  const d = new Array(b.tiles.length).fill(Infinity);
  const frontier: number[] = [];
  for (let y = 0; y < b.height; y++) {
    for (let x = 0; x < b.width; x++) {
      if (anchorCost(b, mover, x, y) >= INF && !(x === mover.x && y === mover.y)) continue;
      if (goals.some((g) => footDist(x, y, mover.size, g.x, g.y, g.size) <= 1)) {
        const k = keyOf(b, x, y);
        d[k] = 0;
        frontier.push(k);
      }
    }
  }
  while (frontier.length) {
    frontier.sort((a, c) => d[a] - d[c]);
    const cur = frontier.shift()!;
    const { x, y } = posOf(b, cur);
    const stepIn = Math.min(anchorCost(b, mover, x, y), 4);
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!inBounds(b, nx, ny) || anchorCost(b, mover, nx, ny) >= INF) continue;
      const nk = keyOf(b, nx, ny);
      const nd = d[cur] + stepIn;
      if (nd < d[nk]) {
        d[nk] = nd;
        frontier.push(nk);
      }
    }
  }
  return d;
}
