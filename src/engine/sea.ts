// The Great Sea campaign: a 7×7 chart of sea sectors. No countdown: the
// pressures are supplies, ship condition and navigation.

import { capacityOf, isVessel } from './naval';
import type { RNG } from './rng';
import type { MapNode, NodeType, Run, RunMap, SeaState, Unit, WorldId } from './types';

export const CHART_SIZE = 7;

export function newSea(): SeaState {
  return { fleetCap: 3, navalDeploy: 2, navigation: 1, salvage: 1, reputation: 30, revealed: [], cleared: [], charts: 0 };
}

export const sectorId = (charts: number, x: number, y: number) => `s${charts}_${x}_${y}`;
export const sectorName = (x: number, y: number) => `${'ABCDEFG'[x]}${y + 1}`;

interface IslandSpec { world: WorldId; label: string; type: NodeType; locked?: MapNode['locked']; naval?: boolean }

const ISLANDS: Record<string, IslandSpec> = {
  outset: { world: 'outsetIsland', label: 'Outset Island', type: 'boss' },
  windfall: { world: 'greatSea', label: 'Windfall Island', type: 'shop' },
  forsaken: { world: 'forsakenFortress', label: 'Forsaken Fortress', type: 'boss' },
  dragonRoost: { world: 'dragonRoost', label: 'Dragon Roost Island', type: 'boss' },
  forestHaven: { world: 'forestHaven', label: 'Forest Haven', type: 'boss' },
  tower: { world: 'towerOfTheGods', label: 'Tower of the Gods', type: 'boss', locked: 'pearls' },
  hyrule: { world: 'submergedHyrule', label: 'Submerged Hyrule', type: 'boss', locked: 'tower' },
  earth: { world: 'earthTemple', label: 'Headstone Island (Earth Temple)', type: 'boss', locked: 'hyrule' },
  wind: { world: 'windTemple', label: 'Gale Isle (Wind Temple)', type: 'boss', locked: 'hyrule' },
  ganon: { world: 'ganonsTower', label: "Ganon's Tower", type: 'boss', locked: 'temples' },
};

/** Generate a fresh chart. Outset Island is where you start. */
export function generateSeaChart(rng: RNG, charts: number): RunMap {
  const N = CHART_SIZE;
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) cells.push({ x, y });
  const placed = new Map<string, string>(); // "x,y" -> island key
  const at = (x: number, y: number) => placed.get(`${x},${y}`);
  const d = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const put = (key: string, pick: (c: { x: number; y: number }) => boolean) => {
    const opts = rng.shuffle(cells.filter((c) => !at(c.x, c.y) && pick(c)));
    const c = opts[0] ?? rng.shuffle(cells.filter((q) => !at(q.x, q.y)))[0];
    placed.set(`${c.x},${c.y}`, key);
    return c;
  };
  const outset = put('outset', (c) => c.y >= N - 2 && c.x <= 2);
  const tower = put('tower', (c) => c.x >= 2 && c.x <= 4 && c.y >= 2 && c.y <= 4);
  put('windfall', (c) => d(c, outset) === 2);
  put('forsaken', (c) => c.y <= 1 && d(c, outset) >= 6);
  put('dragonRoost', (c) => d(c, outset) >= 3 && d(c, outset) <= 5 && d(c, tower) >= 2);
  put('forestHaven', (c) => d(c, outset) >= 3 && d(c, outset) <= 6 && d(c, tower) >= 2);
  const hyrule = put('hyrule', (c) => d(c, tower) === 1);
  put('earth', (c) => d(c, hyrule) >= 3 && (c.x <= 1 || c.x >= N - 2));
  put('wind', (c) => d(c, hyrule) >= 3 && (c.y <= 1 || c.y >= N - 2) && d(c, outset) >= 3);
  put('ganon', (c) => d(c, hyrule) === 1 || d(c, hyrule) === 2);

  // Special sea encounters
  const special = new Map<string, Partial<MapNode>>();
  const free = () => rng.shuffle(cells.filter((c) => !at(c.x, c.y) && !special.has(`${c.x},${c.y}`)));
  for (const c of free().filter((q) => d(q, outset) >= 3).slice(0, 2)) special.set(`${c.x},${c.y}`, { type: 'boss', world: 'greatSea', label: 'Big Octo Waters', naval: true });
  const ghost = free().find((q) => d(q, outset) >= 4);
  if (ghost) special.set(`${ghost.x},${ghost.y}`, { type: 'elite', world: 'greatSea', label: 'The Ghost Ship', naval: true, fleet: ['ghostShip'], night: true });
  const sub = free().find((q) => d(q, outset) >= 2);
  if (sub) special.set(`${sub.x},${sub.y}`, { type: 'elite', world: 'greatSea', label: 'Bokoblin Submarine', naval: true, fleet: ['submarine'] });

  const nodes: MapNode[] = [];
  for (const c of cells) {
    const id = sectorId(charts, c.x, c.y);
    const key = at(c.x, c.y);
    const near = d(c, outset);
    let node: MapNode = { id, row: c.y, col: c.x, type: 'sea', world: 'greatSea', next: [], visited: false, naval: true };
    if (key) {
      const s = ISLANDS[key];
      node = { ...node, type: s.type, world: s.world, label: s.label, island: key, naval: s.naval ?? false, locked: s.locked };
      if (key === 'windfall') node.naval = false;
    } else if (special.has(`${c.x},${c.y}`)) {
      node = { ...node, ...special.get(`${c.x},${c.y}`) };
    } else {
      const type = rng.weighted<NodeType>([
        ['battle', 26], ['sea', 18], ['event', 13], ['treasure', 9], ['recruit', 8], ['shop', 5], ['camp', 6],
        ['fountain', 3], ['blacksmith', 3], ['elite', near >= 3 ? 6 : 1], ['ambush', near >= 2 ? 5 : 0],
      ]);
      node.type = type;
      // Some fights happen on small islands instead of at sea.
      if ((type === 'battle' || type === 'ambush') && rng.chance(35)) {
        node.naval = false;
        node.world = rng.pick(['outsetIsland', 'forsakenFortress', 'dragonRoost', 'forestHaven']);
        node.label = 'Small Island';
      } else if (type === 'shop') node.label = 'Merchant Ship';
      else if (type === 'camp') node.label = 'Quiet Islet';
      else if (type === 'fountain') node.label = 'Great Fairy Island';
      else if (type === 'treasure') node.label = 'Sunken Treasure';
      else if (type === 'blacksmith') node.label = 'Shipwright';
      else if (type === 'recruit') node.label = 'Sailors in Port';
    }
    nodes.push(node);
  }
  for (const n of nodes) {
    n.next = nodes.filter((m) => Math.abs(m.col - n.col) + Math.abs(m.row - n.row) === 1).map((m) => m.id);
  }
  return { rows: N, nodes };
}

export function seaOf(run: Run): SeaState {
  return (run.sea ??= newSea());
}

/** Reveal sectors around a position (Navigation level, Fishman, telescopes). */
export function revealAround(run: Run, x: number, y: number) {
  const sea = seaOf(run);
  const fish = run.roster.some((u) => u.skills.includes('seaCharting')) ? 1 : 0;
  const look = run.roster.some((u) => u.skills.includes('crowsNest') || u.skills.includes('friendsOfTheSky')) ? 1 : 0;
  const r = sea.navigation + fish + look;
  for (const n of run.map.nodes) {
    if (Math.abs(n.col - x) + Math.abs(n.row - y) <= r && !sea.revealed.includes(n.id)) sea.revealed.push(n.id);
  }
  // Islands are always on the chart.
  for (const n of run.map.nodes) if (n.island && !sea.revealed.includes(n.id)) sea.revealed.push(n.id);
}

/** Is a locked island open yet? */
export function lockReason(run: Run, n: MapNode, owned: Set<string>): string | null {
  const cleared = seaOf(run).cleared;
  switch (n.locked) {
    case 'pearls': {
      const missing = ['dinsPearl', 'faroresPearl', 'nayrusPearl'].filter((p) => !owned.has(p));
      return missing.length ? `Needs all three Goddess Pearls (${3 - missing.length}/3)` : null;
    }
    case 'tower': return cleared.includes('tower') ? null : 'Opens once the Tower of the Gods is cleared';
    case 'hyrule': return cleared.includes('hyrule') ? null : 'Opens once Submerged Hyrule is cleared';
    case 'temples': return cleared.includes('earth') && cleared.includes('wind') ? null : 'Opens once both the Earth and Wind Temples are cleared';
  }
  return null;
}

/** Sectors you can sail to from here. */
export function seaMoves(run: Run, owned: Set<string>): MapNode[] {
  if (!run.currentNodeId) return run.map.nodes.filter((n) => n.island === 'outset');
  const cur = run.map.nodes.find((n) => n.id === run.currentNodeId);
  if (!cur) return [];
  return cur.next.map((id) => run.map.nodes.find((n) => n.id === id)!).filter((n) => n && !lockReason(run, n, owned));
}

export interface SailReport { lines: string[]; supplies: number; fleetDamage: number }

/** Crossing to a new sector: supplies are eaten, rough seas batter the fleet. */
export function sail(run: Run, rng: RNG, eat: (n: number) => boolean): SailReport {
  const lines: string[] = [];
  let fleetDamage = 0;
  const ate = eat(1);
  if (!ate) {
    for (const u of run.roster) u.hp = Math.max(1, u.hp - Math.ceil(u.stats.hp * 0.05));
    lines.push('Out of supplies: the crew goes hungry (−5% HP).');
  }
  if (rng.chance(12)) {
    for (const v of run.roster.filter(isVessel)) {
      const d = Math.ceil(v.stats.hp * 0.08);
      v.hp = Math.max(1, v.hp - d);
      fleetDamage += d;
    }
    if (fleetDamage) lines.push(`Rough seas batter the fleet (−${fleetDamage} hull).`);
  }
  return { lines, supplies: ate ? -1 : 0, fleetDamage };
}

/** Depth for enemy scaling on the Great Sea. */
export function seaDepth(run: Run, node: MapNode): number {
  const sea = seaOf(run);
  const explored = run.map.nodes.filter((n) => n.visited && n.type !== 'sea').length;
  const islands = sea.cleared.length;
  let depth = sea.charts * 24 + Math.floor(explored * 0.75) + islands * 2;
  if (node.island === 'ganon') depth += 4;
  if (node.locked) depth += 2;
  return depth;
}

/** A chart is complete when Ganon's Tower falls. */
export function chartComplete(run: Run): boolean {
  return seaOf(run).cleared.includes('ganon');
}

export function fleetOf(run: Run): Unit[] {
  return run.roster.filter(isVessel);
}

export function fleetCap(run: Run): number {
  return seaOf(run).fleetCap + Math.floor(((run.army?.level ?? 1) - 1) / 3);
}

export function navalDeployCap(run: Run): number {
  return seaOf(run).navalDeploy + ((run.army?.level ?? 1) >= 5 ? 1 : 0);
}

/** Crew capacity: how many passengers the deployable fleet can carry. */
export function crewCapacity(run: Run): number {
  return fleetOf(run).slice(0, navalDeployCap(run)).reduce((s, v) => s + capacityOf(v), 0);
}
