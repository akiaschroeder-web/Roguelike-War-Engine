// Naval warfare (The Wind Waker): vessels that carry passengers, wind, boarding,
// capturing ships, sinking, and knocked-out ship components.

import { RACES, TEMPLATES, WEAPONS } from '../data/registry';
import { CAPACITY } from '../content/windwaker';
import { anchorCost, footDist, footprint, inBounds, keyOf, unitAt, unitDist } from './grid';
import type { RNG } from './rng';
import { INF, WATERY } from './rules';
import { hasEffect, unitTags } from './units';
import type { Battle, Pos, Terrain, Unit } from './types';

export const isVessel = (u: Pick<Unit, 'race'>): boolean => !!RACES[u.race]?.tags?.includes('vessel');

/** Passenger room (in spaces: a size-2 passenger takes 2). */
export function capacityOf(v: Unit): number {
  if (!isVessel(v)) return 0;
  return CAPACITY[v.templateId ?? v.artId ?? ''] ?? Math.max(1, v.size * 2 - 2);
}

export function cargoLoad(v: Unit): number {
  return (v.cargo ?? []).reduce((s, p) => s + (p.baseSize ?? p.size), 0);
}

export function roomAboard(v: Unit, p: Unit): boolean {
  return isVessel(v) && !isVessel(p) && (p.baseSize ?? p.size) <= 2 && cargoLoad(v) + (p.baseSize ?? p.size) <= capacityOf(v);
}

export const isWatery = (t: Terrain | undefined) => !!t && WATERY.includes(t);

/** Is the vessel wind-powered right now? (Rafts and submarines are rowed or submerged.) */
function sailing(v: Unit): boolean {
  if (!isVessel(v) || v.skills.includes('submerge')) return false;
  return hasEffect(v, 'sail') || v.skills.includes('masterOfTheSeas') || v.skills.includes('phantomVoyage');
}

/**
 * Movement cost multiplier for one step in direction (dx, dy). With the wind a
 * step costs less (+2 MOV over a typical move), against it more (−2 MOV).
 */
export function windFactor(b: Battle, u: Unit, dx: number, dy: number): number {
  if (!b.wind || !sailing(u)) return 1;
  if (hasEffect(u, 'swiftSail')) return 0.6;
  const dot = dx * b.wind[0] + dy * b.wind[1];
  if (dot > 0) return u.damaged?.mast ? 1 : u.skills.includes('trimSails') ? 0.5 : 0.6;
  if (dot < 0) return u.skills.includes('masterOfTheSeas') || hasEffect(u, 'windCharm') ? 1 : 1.6;
  return 1;
}

export const WIND_NAMES: Record<string, string> = { '1,0': 'East', '-1,0': 'West', '0,1': 'South', '0,-1': 'North' };
export const WIND_ARROWS: Record<string, string> = { '1,0': '→', '-1,0': '←', '0,1': '↓', '0,-1': '↑' };
export const windLabel = (w?: [number, number]) => (w ? `${WIND_ARROWS[w.join(',')]} ${WIND_NAMES[w.join(',')]} wind` : '');

/** Turn the wind a quarter clockwise. */
export function rotateWind(b: Battle): [number, number] {
  const w = b.wind ?? [1, 0];
  b.wind = [-w[1], w[0]] as [number, number];
  if (Object.is(b.wind[0], -0)) b.wind[0] = 0;
  if (Object.is(b.wind[1], -0)) b.wind[1] = 0;
  return b.wind;
}

/** Point the wind from `from` toward `to` (the dominant axis). */
export function aimWind(b: Battle, from: Pos, to: Pos): [number, number] {
  const dx = to.x - from.x, dy = to.y - from.y;
  b.wind = Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx) || 1, 0] : [0, Math.sign(dy) || 1];
  return b.wind;
}

// ───────────────────────── Boarding ─────────────────────────

/** Friendly vessels next to `u` with room for it. */
export function boardTargets(b: Battle, u: Unit): Unit[] {
  if (isVessel(u) || u.captive || u.vip) return [];
  return b.units.filter((v) => v.team === u.team && v !== u && roomAboard(v, u) && unitDist(u, v) <= 1);
}

/** Boarding doesn't end the turn with a ramp, a boarding point, pirate garb or a boarding party. */
export function quickBoard(b: Battle, u: Unit, v: Unit): boolean {
  return hasEffect(v, 'boardingRamp') || hasEffect(u, 'quickBoard') || u.skills.includes('boardingParty') || u.skills.includes('ropeRunner')
    || footprint(u.x, u.y, u.size).some((p) => b.tiles[keyOf(b, p.x, p.y)] === 'boardingPoint');
}

export function board(b: Battle, u: Unit, v: Unit): boolean {
  if (!boardTargets(b, u).includes(v)) return false;
  const quick = quickBoard(b, u, v);
  b.units = b.units.filter((x) => x !== u);
  u.x = v.x; u.y = v.y;
  u.moved = true;
  u.acted = !quick;
  (v.cargo ??= []).push(u);
  b.log.push(`${u.name} boards the ${v.name}.`);
  return true;
}

/** Where the next passenger can be put ashore (or into the water, if they swim or fly). */
export function disembarkTiles(b: Battle, v: Unit): Pos[] {
  const p = v.cargo?.[0];
  if (!p) return [];
  const out: Pos[] = [];
  for (let y = v.y - p.size; y <= v.y + v.size; y++) {
    for (let x = v.x - p.size; x <= v.x + v.size; x++) {
      if (!inBounds(b, x, y) || footDist(x, y, p.size, v.x, v.y, v.size) !== 1) continue;
      if (anchorCost(b, p, x, y) >= INF) continue;
      if (footprint(x, y, p.size).some((f) => unitAt(b, f.x, f.y))) continue;
      out.push({ x, y });
    }
  }
  return out;
}

export function disembark(b: Battle, v: Unit, at: Pos): Unit | null {
  if (!disembarkTiles(b, v).some((t) => t.x === at.x && t.y === at.y)) return null;
  const p = v.cargo!.shift()!;
  p.x = at.x; p.y = at.y;
  p.moved = false;
  p.movedDist = 0;
  b.units.push(p);
  b.log.push(`${p.name} disembarks from the ${v.name}.`);
  return p;
}

/** Adjacent enemy vessels whose crew is gone. */
export function commandeerTargets(b: Battle, u: Unit): Unit[] {
  if (isVessel(u) || u.npc) return [];
  return b.units.filter((v) => v.team !== u.team && isVessel(v) && !v.isBoss && !(v.cargo?.length) && unitDist(u, v) <= 1);
}

export function commandeer(b: Battle, u: Unit, v: Unit): boolean {
  if (!commandeerTargets(b, u).includes(v)) return false;
  v.team = u.team;
  v.captured = u.team === 'player';
  v.ai = 'aggressive';
  v.moved = v.acted = true;
  v.hidden = false;
  b.log.push(`${u.name} commandeers the ${v.name}!`);
  // The boarder takes the helm.
  b.units = b.units.filter((x) => x !== u);
  u.moved = u.acted = true;
  (v.cargo ??= []).push(u);
  return true;
}

/** Enemy AI: put crew ashore next to the vessel when your units are close. */
export function enemyUnload(b: Battle, v: Unit): Unit[] {
  if (!isVessel(v) || !v.cargo?.length) return [];
  const foes = b.units.filter((e) => e.team !== v.team);
  const stuck = b.turn >= 3 && v.movedDist === 0 && b.turn % 2 === 1;
  if (!foes.some((e) => unitDist(v, e) <= 6) && !stuck) return [];
  const out: Unit[] = [];
  for (let i = 0; i < 4 && v.cargo?.length; i++) {
    const tiles = disembarkTiles(b, v);
    if (!tiles.length) break;
    // Toward the nearest foe.
    tiles.sort((a, c) => Math.min(...foes.map((e) => footDist(a.x, a.y, 1, e.x, e.y, e.size))) - Math.min(...foes.map((e) => footDist(c.x, c.y, 1, e.x, e.y, e.size))));
    const p = disembark(b, v, tiles[0]);
    if (!p) break;
    p.moved = p.acted = true; // they act next turn
    out.push(p);
  }
  return out;
}

/** Refresh passengers at the start of their side's phase. */
export function refreshCargo(v: Unit) {
  for (const p of v.cargo ?? []) {
    p.moved = false;
    p.acted = false;
    p.movedDist = 0;
    p.sta = Math.min(p.stats.sta, p.sta + 2);
  }
}

/** Ships that went down this battle: their passengers swim, fly, jump to another ship or are lost. */
export function resolveSinking(b: Battle): string[] {
  const lines: string[] = [];
  for (const v of b.fallen) {
    if (!isVessel(v) || !v.cargo?.length) continue;
    const passengers = v.cargo;
    v.cargo = [];
    // The wreck leaves floating debris to cling to.
    for (const f of footprint(v.x, v.y, v.size)) if (inBounds(b, f.x, f.y) && isWatery(b.tiles[keyOf(b, f.x, f.y)])) b.tiles[keyOf(b, f.x, f.y)] = 'shipDeck';
    for (const p of passengers) {
      // Jump to a friendly ship nearby?
      const rescue = b.units.find((s) => s.team === p.team && roomAboard(s, p) && footDist(s.x, s.y, s.size, v.x, v.y, v.size) <= 2);
      if (rescue) { (rescue.cargo ??= []).push(p); lines.push(`${p.name} leaps aboard the ${rescue.name}!`); continue; }
      let best: Pos | null = null;
      let bestD = 99;
      for (let y = v.y - 2; y < v.y + v.size + 2; y++) for (let x = v.x - 2; x < v.x + v.size + 2; x++) {
        if (!inBounds(b, x, y) || anchorCost(b, p, x, y) >= INF) continue;
        if (footprint(x, y, p.size).some((f) => unitAt(b, f.x, f.y))) continue;
        const d = footDist(x, y, p.size, v.x, v.y, v.size);
        if (d < bestD) { bestD = d; best = { x, y }; }
      }
      if (best) {
        p.x = best.x; p.y = best.y;
        b.units.push(p);
        lines.push(`${p.name} escapes the sinking ${v.name}.`);
      } else {
        p.hp = 0;
        b.fallen.push(p);
        lines.push(`${p.name} is lost with the ${v.name}!`);
      }
    }
  }
  b.log.push(...lines);
  return lines;
}

/** Every unit in the battle, including passengers aboard ships. */
export function allAboard(b: Battle): Unit[] {
  return b.units.flatMap((u) => [u, ...(u.cargo ?? [])]);
}

// ───────────────────────── Components ─────────────────────────

export const COMPONENT_NAMES = { sail: 'sail', mast: 'mast', rudder: 'rudder', cannon: 'cannons' } as const;
export type Component = keyof typeof COMPONENT_NAMES;

/** A damaging hit on a vessel may knock out a component. */
export function damageComponent(v: Unit, rng: RNG, forced?: Component): Component | null {
  if (!isVessel(v)) return null;
  const d = (v.damaged ??= {});
  const options = (['sail', 'mast', 'rudder', 'cannon'] as Component[]).filter((c) => !d[c] && !(c === 'sail' && hasEffect(v, 'reinforcedSail')));
  if (forced) {
    if (!options.includes(forced)) return null;
    d[forced] = true;
    return forced;
  }
  if (!options.length || !rng.chance(20)) return null;
  const c = rng.pick(options);
  d[c] = true;
  return c;
}

export function repairComponent(v: Unit): Component | null {
  const d = v.damaged;
  if (!d) return null;
  const c = (['sail', 'mast', 'rudder', 'cannon'] as Component[]).find((k) => d[k]);
  if (c) delete d[c];
  return c ?? null;
}

/** Siege weapons a vessel can't fire (cannons knocked out). */
export function cannonsDown(u: Unit, weaponId: string): boolean {
  return !!u.damaged?.cannon && !!WEAPONS[weaponId]?.crewed;
}

/** MOV changes from damage and passengers. */
export function vesselMov(u: Unit, mov: number): number {
  if (!isVessel(u)) return mov;
  if (u.damaged?.sail) mov = Math.floor(mov / 2);
  if (u.damaged?.rudder) mov -= 1;
  if (u.cargo?.some((p) => p.skills.includes('ropeRunner'))) mov += 1;
  return mov;
}

/** Combat bonuses a vessel gets from its flag and crew. */
export function vesselMods(b: Battle, u: Unit): { str: number; def: number; res: number; hit: number; avoid: number; dmg: number } {
  const m = { str: 0, def: 0, res: 0, hit: 0, avoid: 0, dmg: 0 };
  if (isVessel(u)) {
    const crew = u.cargo ?? [];
    m.str += Math.min(3, crew.length); // the crew works the guns
    if (hasEffect(u, 'pirateFlag')) m.str += 2 * crew.filter((p) => unitTags(p).includes('pirate')).length;
    if (hasEffect(u, 'royalFlag') && crew.length) { m.def += 2; m.res += 2; }
    if (u.skills.includes('smallCraft')) m.avoid += 10;
    if (u.skills.includes('armoredGunboat')) m.dmg += 2;
  }
  for (const a of b.units) if (a !== u && a.team === u.team && a.skills.includes('flagship') && unitDist(u, a) <= 3) m.hit += 5;
  return m;
}

// ───────────────────────── Sea battlefields ─────────────────────────

export interface NavalLayout {
  width: number;
  height: number;
  tiles: Terrain[];
  bossSpawn: Pos | null;
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * A sea battle: a beach on the left, open ocean, and islands with sandbars.
 * Places every unit (vessels on water, others on land or water as they can).
 * Units that can't be placed are left at x = -1 (the caller loads them aboard).
 */
export function layoutNaval(rng: RNG, players: Unit[], enemies: Unit[], boss: Unit | undefined, depth: number): NavalLayout {
  const biggest = Math.max(2, ...[...players, ...enemies, ...(boss ? [boss] : [])].map((u) => u.size));
  const width = 17 + rng.int(0, 3) + Math.max(0, biggest - 3) * 2;
  const height = 10 + rng.int(0, 2) + Math.max(0, biggest - 4);
  const tiles: Terrain[] = new Array(width * height).fill('water');
  const idx = (x: number, y: number) => y * width + x;
  const inB = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height;
  // The beach
  for (let y = 0; y < height; y++) for (let x = 0; x < 3; x++) tiles[idx(x, y)] = rng.chance(12) ? 'forest' : 'plain';
  // Islands
  const islands: Pos[] = [];
  const count = 3 + rng.int(0, 2);
  for (let i = 0; i < count; i++) {
    const cx = rng.int(Math.floor(width * 0.35), width - 3), cy = rng.int(1, height - 2);
    islands.push({ x: cx, y: cy });
    let x = cx, y = cy;
    const size = rng.int(5, 11);
    for (let j = 0; j < size; j++) {
      if (inB(x, y)) tiles[idx(x, y)] = rng.chance(20) ? 'forest' : rng.chance(8) ? 'mountain' : 'plain';
      const [dx, dy] = rng.pick(DIRS);
      x = Math.max(4, Math.min(width - 1, x + dx));
      y = Math.max(0, Math.min(height - 1, y + dy));
    }
  }
  // Reefs
  for (let i = 0; i < 3; i++) {
    const x = rng.int(5, width - 3), y = rng.int(0, height - 1);
    if (tiles[idx(x, y)] === 'water') tiles[idx(x, y)] = 'wall';
  }
  // Sandbars: the beach links to the nearest island and each island to the next,
  // so nobody is ever stranded (ships are still the fast way across).
  const sandbar = (fx: number, fy: number, tx: number, ty: number) => {
    let x = fx, y = fy;
    while (x !== tx || y !== ty) {
      const t = tiles[idx(x, y)];
      if (t === 'water' || t === 'wall') tiles[idx(x, y)] = rng.chance(25) ? 'shipDeck' : 'plain';
      if (x !== tx && (y === ty || rng.chance(55))) x += Math.sign(tx - x);
      else y += Math.sign(ty - y);
    }
  };
  const chain = [...islands].sort((a, c) => a.x - c.x);
  if (chain[0]) sandbar(3, Math.floor(height / 2), chain[0].x, chain[0].y);
  for (let i = 1; i < chain.length; i++) sandbar(chain[i - 1].x, chain[i - 1].y, chain[i].x, chain[i].y);
  // Sea features
  const water = () => tiles.map((t, k) => (t === 'water' && k % width > 4 ? k : -1)).filter((k) => k >= 0);
  if (rng.chance(45)) tiles[rng.pick(water())] = 'whirlpool';
  for (let i = 0; i < 1 + (depth > 6 ? 1 : 0); i++) if (rng.chance(55)) tiles[rng.pick(water())] = 'submergedTreasure';
  const cur = rng.shuffle(water()).slice(0, rng.chance(50) ? 5 : 0);
  for (const k of cur) tiles[k] = 'current';
  // Boarding points on the beach edge
  for (let y = 0; y < height; y++) if (rng.chance(18)) tiles[idx(2, y)] = 'boardingPoint';

  const fake = { width, height, tiles, units: [] as Unit[] } as unknown as Battle;
  const taken = new Set<number>();
  const fits = (u: Unit, x: number, y: number) => {
    if (anchorCost(fake, u, x, y) >= INF) return false;
    return footprint(x, y, u.size).every((p) => inB(p.x, p.y) && !taken.has(idx(p.x, p.y)));
  };
  const claim = (u: Unit, x: number, y: number) => {
    u.x = x; u.y = y;
    for (const p of footprint(x, y, u.size)) taken.add(idx(p.x, p.y));
  };
  const place = (u: Unit, minX: number, maxX: number, score: (x: number, y: number) => number): boolean => {
    let best: Pos | null = null, bs = Infinity;
    for (let y = 0; y < height; y++) for (let x = Math.max(0, minX); x <= Math.min(width - u.size, maxX); x++) {
      if (!fits(u, x, y)) continue;
      const s = score(x, y);
      if (s < bs) { bs = s; best = { x, y }; }
    }
    if (!best) return false;
    claim(u, best.x, best.y);
    return true;
  };
  const mid = height / 2;
  let bossSpawn: Pos | null = null;
  if (boss) {
    if (place(boss, Math.floor(width * 0.6), width - 1, (x, y) => -x * 0.5 + Math.abs(y + boss.size / 2 - mid) + rng.next())) bossSpawn = { x: boss.x, y: boss.y };
  }
  for (const u of [...players].sort((a, c) => c.size - a.size)) {
    const ok = isVessel(u)
      ? place(u, 3, 3 + u.size + 3, (x, y) => Math.abs(y + u.size / 2 - mid) + (x - 3) * 0.4 + rng.next() * 0.5)
      : place(u, 0, 2, (x, y) => Math.abs(y + u.size / 2 - mid) + x * 0.3);
    if (!ok) { u.x = -1; u.y = -1; }
  }
  for (const u of [...enemies].sort((a, c) => c.size - a.size)) {
    const ok = place(u, Math.floor(width * 0.45), width - 1, (x) => -x + (rng.next() - 0.5) * 10);
    if (!ok) { u.x = -1; u.y = -1; }
  }
  return { width, height, tiles, bossSpawn };
}

/** Enemy vessels for a sea battle, with crews drawn from the enemy force. */
export function enemyFleet(depth: number, rng: RNG, pirates: boolean): string[] {
  const n = depth < 4 ? 1 : depth < 12 ? rng.int(1, 2) : rng.int(2, 3);
  const pool: [string, number][] = [
    ['bokoblinRaft', depth < 10 ? 5 : 2], ['gunboat', depth >= 3 ? 4 : 0], ['submarine', depth >= 8 ? 2 : 0],
    ['pirateShip', pirates ? 6 : depth >= 14 ? 1 : 0], ['sailingBoat', pirates ? 3 : 1],
  ];
  return Array.from({ length: n }, () => rng.weighted(pool)).filter((id) => TEMPLATES[id]);
}

/** Everyone who isn't a ship and could ride one. */
export const canRide = (u: Unit) => !isVessel(u) && (u.baseSize ?? u.size) <= 2;
