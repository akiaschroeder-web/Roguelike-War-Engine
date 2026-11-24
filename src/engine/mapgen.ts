import { INF, MOVE_COSTS } from './rules';
import type { RNG } from './rng';
import type { MapStyle, Pos, Terrain } from './types';

export interface GeneratedMap {
  width: number;
  height: number;
  tiles: Terrain[];
  playerSpawns: Pos[];
  enemySpawns: Pos[];
  bossSpawn: Pos | null;
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const SOLID: Terrain[] = ['plain', 'forest', 'fort'];

/**
 * Generate a skirmish map in a region's style. The player deploys on the left
 * and enemies on the right. Every spawn is reachable by armored units, and
 * each footprint (for large units) sits entirely on solid ground.
 */
export function generateMap(
  rng: RNG, width: number, height: number, style: MapStyle,
  playerSizes: number[], enemySizes: number[], bossSize: number,
): GeneratedMap {
  for (let attempt = 0; attempt < 60; attempt++) {
    const m = tryGenerate(rng, width, height, style, playerSizes, enemySizes, bossSize, attempt > 40);
    if (m) return m;
  }
  // Grow the field until everyone fits.
  return generateMap(rng, width + 2, height + 1, { ...style, forest: 0, mountain: 0, walls: 0, water: 'none' }, playerSizes, enemySizes, bossSize);
}

function tryGenerate(
  rng: RNG, w: number, h: number, style: MapStyle,
  playerSizes: number[], enemySizes: number[], bossSize: number, sparse: boolean,
): GeneratedMap | null {
  const tiles: Terrain[] = new Array(w * h).fill('plain');
  const idx = (x: number, y: number) => y * w + x;
  const inB = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const liquid: Terrain = style.lava ? 'lava' : 'water';
  const blob = (t: Terrain, size: number, minX = 0, maxX = w - 1) => {
    let x = rng.int(minX, maxX), y = rng.int(0, h - 1);
    for (let i = 0; i < size; i++) {
      if (inB(x, y)) tiles[idx(x, y)] = t;
      const [dx, dy] = rng.pick(DIRS);
      x = Math.max(minX, Math.min(maxX, x + dx));
      y = Math.max(0, Math.min(h - 1, y + dy));
    }
  };
  const area = w * h;
  const density = sparse ? 0.4 : 1;

  for (let i = 0; i < Math.round((area / 100) * style.forest * density); i++) blob('forest', rng.int(2, 5));
  for (let i = 0; i < Math.round((area / 100) * style.mountain * density); i++) blob('mountain', rng.int(2, 4), 3, w - 4);

  const river = () => {
    let x = rng.int(Math.floor(w * 0.35), Math.floor(w * 0.65));
    const bridges = new Set([rng.int(0, h - 1), rng.int(0, h - 1), rng.int(0, h - 1)]);
    for (let y = 0; y < h; y++) {
      if (!bridges.has(y)) {
        tiles[idx(x, y)] = liquid;
        if (rng.chance(50) && inB(x + 1, y)) tiles[idx(x + 1, y)] = liquid; // wider rivers for big maps
      }
      if (rng.chance(30)) x = Math.max(4, Math.min(w - 5, x + rng.pick([-1, 1])));
    }
  };
  if (!sparse) {
    switch (style.water) {
      case 'river': river(); break;
      case 'lake': blob(liquid, rng.int(5, 10), 4, w - 5); break;
      case 'many': river(); blob(liquid, rng.int(4, 8), 4, w - 5); blob(liquid, rng.int(3, 6), 4, w - 5); break;
      case 'moat': {
        const mx = Math.floor(w * 0.6);
        for (let y = 0; y < h; y++) if (y % Math.max(3, Math.floor(h / 3)) !== 1) tiles[idx(mx, y)] = liquid;
        break;
      }
      case 'none': break;
    }
    for (let i = 0; i < style.walls; i++) {
      const horiz = rng.chance(50);
      let x = rng.int(4, w - 5), y = rng.int(1, h - 2);
      for (let j = 0; j < rng.int(2, 4); j++) {
        if (inB(x, y)) tiles[idx(x, y)] = 'wall';
        if (horiz) x++; else y++;
      }
    }
  }
  for (let i = 0; i < style.forts; i++) tiles[idx(rng.int(3, w - 3), rng.int(0, h - 1))] = 'fort';

  // Deploy zones stay walkable.
  const pZone = Math.max(3, Math.max(1, ...playerSizes) + 1);
  const eZone = Math.max(3, Math.max(1, bossSize, ...enemySizes) + 1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < pZone; x++) if (tiles[idx(x, y)] !== 'forest') tiles[idx(x, y)] = 'plain';
    for (let x = w - eZone; x < w; x++) if (!SOLID.includes(tiles[idx(x, y)])) tiles[idx(x, y)] = 'plain';
  }

  // Connectivity for armored units from the player's side.
  const origin = { x: 0, y: Math.floor(h / 2) };
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

  const taken = new Set<number>();
  const fits = (x: number, y: number, s: number) => {
    for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) {
      const tx = x + dx, ty = y + dy;
      if (!inB(tx, ty)) return false;
      const k = idx(tx, ty);
      if (taken.has(k) || !seen.has(k) || !SOLID.includes(tiles[k])) return false;
    }
    return true;
  };
  const claim = (x: number, y: number, s: number) => {
    for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) taken.add(idx(x + dx, y + dy));
  };
  const place = (s: number, minX: number, maxX: number, score: (p: Pos) => number): Pos | null => {
    const cands: Pos[] = [];
    for (let y = 0; y < h; y++) for (let x = minX; x <= maxX - s + 1; x++) if (fits(x, y, s)) cands.push({ x, y });
    if (!cands.length) return null;
    cands.sort((a, b) => score(a) - score(b));
    const p = cands[0];
    claim(p.x, p.y, s);
    return p;
  };

  // Boss first (largest), on the far right near the middle.
  let bossSpawn: Pos | null = null;
  if (bossSize) {
    bossSpawn = place(bossSize, w - eZone, w - 1, (p) => Math.abs(p.y + bossSize / 2 - h / 2) - p.x * 0.5 + rng.next());
    if (!bossSpawn) return null;
    tiles[idx(bossSpawn.x, bossSpawn.y)] = 'fort';
  }

  // Players: biggest first, clustered around the middle of the left edge.
  const playerSpawns: Pos[] = new Array(playerSizes.length);
  const pOrder = playerSizes.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]);
  for (const [s, i] of pOrder) {
    const p = place(s, 0, pZone - 1 + (s > 2 ? 1 : 0), (c) => Math.abs(c.y + s / 2 - h / 2) + c.x * 0.6);
    if (!p) return null;
    playerSpawns[i] = p;
  }

  // Enemies over the right 55% of the map, biased toward the far side.
  const enemySpawns: Pos[] = new Array(enemySizes.length);
  const eOrder = enemySizes.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]);
  for (const [s, i] of eOrder) {
    const p = place(s, Math.floor(w * 0.45), w - 1, (c) => -c.x + (rng.next() - 0.5) * 8);
    if (!p) return null;
    enemySpawns[i] = p;
  }
  return { width: w, height: h, tiles, playerSpawns, enemySpawns, bossSpawn };
}
