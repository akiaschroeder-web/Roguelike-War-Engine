import { INF, MOVE_COSTS } from '../data/classes';
import type { RNG } from './rng';
import type { Pos, Terrain } from './types';

export interface GeneratedMap {
  width: number;
  height: number;
  tiles: Terrain[];
  playerSpawns: Pos[];
  enemySpawns: Pos[];
  bossSpawn: Pos;
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Procedurally generate a skirmish map. Player deploys on the left, enemies
 * on the right. All spawn tiles are guaranteed reachable by armored units
 * (the most restricted ground movement type), so nobody is ever walled off.
 */
export function generateMap(rng: RNG, width: number, height: number, playerCount: number, enemyCount: number): GeneratedMap {
  for (let attempt = 0; attempt < 40; attempt++) {
    const m = tryGenerate(rng, width, height, playerCount, enemyCount);
    if (m) return m;
  }
  // Fallback: an open field.
  return tryGenerate(rng, width, height, playerCount, enemyCount, true)!;
}

function tryGenerate(rng: RNG, w: number, h: number, pc: number, ec: number, plainOnly = false): GeneratedMap | null {
  const tiles: Terrain[] = new Array(w * h).fill('plain');
  const idx = (x: number, y: number) => y * w + x;
  const inB = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const blob = (t: Terrain, size: number, minX = 0, maxX = w - 1) => {
    let x = rng.int(minX, maxX), y = rng.int(0, h - 1);
    for (let i = 0; i < size; i++) {
      if (inB(x, y)) tiles[idx(x, y)] = t;
      const [dx, dy] = rng.pick(DIRS);
      x = Math.max(minX, Math.min(maxX, x + dx));
      y = Math.max(0, Math.min(h - 1, y + dy));
    }
  };

  if (!plainOnly) {
    const area = w * h;
    // Forests: several clumps.
    for (let i = 0; i < Math.round(area / 22); i++) blob('forest', rng.int(2, 5));
    // Mountains: a couple of ridges.
    for (let i = 0; i < Math.round(area / 45); i++) blob('mountain', rng.int(2, 4), 3, w - 3);
    // Water: either a winding river with bridges or a lake.
    if (rng.chance(55)) {
      let x = rng.int(Math.floor(w * 0.35), Math.floor(w * 0.65));
      const bridges = new Set([rng.int(0, h - 1), rng.int(0, h - 1), rng.int(0, h - 1)]);
      for (let y = 0; y < h; y++) {
        tiles[idx(x, y)] = bridges.has(y) ? 'plain' : 'water';
        if (rng.chance(30)) x = Math.max(3, Math.min(w - 4, x + rng.pick([-1, 1])));
        if (!bridges.has(y)) tiles[idx(x, y)] = 'water';
      }
    } else if (rng.chance(60)) {
      blob('water', rng.int(4, 8), 3, w - 4);
    }
    // Ruined walls: short straight segments.
    for (let i = 0; i < rng.int(1, 3); i++) {
      const horiz = rng.chance(50);
      let x = rng.int(3, w - 4), y = rng.int(1, h - 2);
      for (let j = 0; j < rng.int(2, 4); j++) {
        if (inB(x, y)) tiles[idx(x, y)] = 'wall';
        if (horiz) x++; else y++;
      }
    }
    // Forts: healing strongpoints.
    for (let i = 0; i < rng.int(1, 3); i++) tiles[idx(rng.int(3, w - 3), rng.int(0, h - 1))] = 'fort';
  }

  // Deploy zones: keep them walkable.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < 3; x++) if (tiles[idx(x, y)] !== 'forest') tiles[idx(x, y)] = 'plain';
    for (let x = w - 3; x < w; x++) if (tiles[idx(x, y)] !== 'forest') tiles[idx(x, y)] = 'plain';
  }
  // Boss sits on a fort at the far right.
  const bossSpawn = { x: w - 2, y: Math.floor(h / 2) + rng.int(-1, 1) };
  tiles[idx(bossSpawn.x, bossSpawn.y)] = 'fort';

  // Connectivity for armored units from the player's side.
  const origin = { x: 1, y: Math.floor(h / 2) };
  const seen = new Set<number>([idx(origin.x, origin.y)]);
  const q = [origin];
  while (q.length) {
    const p = q.shift()!;
    for (const [dx, dy] of DIRS) {
      const nx = p.x + dx, ny = p.y + dy;
      if (!inB(nx, ny)) continue;
      const k = idx(nx, ny);
      if (seen.has(k) || MOVE_COSTS.armor[tiles[k]] >= INF) continue;
      seen.add(k);
      q.push({ x: nx, y: ny });
    }
  }
  if (!seen.has(idx(bossSpawn.x, bossSpawn.y))) return null;

  const candidates = (minX: number, maxX: number) => {
    const out: Pos[] = [];
    for (let y = 0; y < h; y++) for (let x = minX; x <= maxX; x++) if (seen.has(idx(x, y))) out.push({ x, y });
    return out;
  };

  // Players cluster around the middle of the left edge.
  const pCand = candidates(0, 2).sort(
    (a, b) => Math.abs(a.y - h / 2) + a.x * 0.6 - (Math.abs(b.y - h / 2) + b.x * 0.6),
  );
  if (pCand.length < pc) return null;
  const playerSpawns = pCand.slice(0, pc);

  // Enemies spread over the right 55% of the map.
  const eCand = rng.shuffle(candidates(Math.floor(w * 0.45), w - 1).filter((p) => !(p.x === bossSpawn.x && p.y === bossSpawn.y)));
  if (eCand.length < ec) return null;
  // Bias toward the far side for most enemies, a few forward.
  eCand.sort((a, b) => b.x - a.x + (rng.next() - 0.5) * 6);
  const enemySpawns = eCand.slice(0, ec);

  return { width: w, height: h, tiles, playerSpawns, enemySpawns, bossSpawn };
}
