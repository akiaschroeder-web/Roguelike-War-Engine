import { bossPool, rosterFor, worldDef } from '../data/registry';
import { footprint, keyOf, unitDist } from './grid';
import { generateMap } from './mapgen';
import { RNG } from './rng';
import { LAVA_DAMAGE_PCT, TERRAIN_BONUS } from './rules';
import { tickStatuses } from './status';
import { hasEffect, isLavaImmune, makeEnemy, prepareForBattle } from './units';
import type { Battle, BossDef, NodeType, Objective, Team, Unit, WorldId } from './types';

export interface BattleSetup {
  world: WorldId;
  nodeType: NodeType;
  /** Overall progress through the run (0 = first fight). Grows forever. */
  depth: number;
  roster: Unit[];
  seed: number;
  boss?: BossDef;
  healMult?: number;
}

/** Enemy level for a given depth. Keeps climbing in endless mode. */
export function enemyLevelFor(depth: number, nodeType: NodeType): number {
  const base = 1 + Math.floor(depth * 0.8);
  return base + (nodeType === 'elite' ? 1 : nodeType === 'boss' ? 2 : 0);
}

export function createBattle(setup: BattleSetup): Battle {
  const rng = new RNG(setup.seed);
  const pc = setup.roster.length;
  const isBossFight = setup.nodeType === 'boss' || setup.nodeType === 'elite';
  const level = enemyLevelFor(setup.depth, setup.nodeType);
  const world = worldDef(setup.world);

  let objective: Objective = { type: 'rout' };
  if (isBossFight) objective = { type: 'boss' };
  else if (setup.depth > 1 && rng.chance(25)) objective = { type: 'survive', turns: 6 };

  // Enemy count grows slowly with depth so the endless run keeps escalating.
  let enemyCount = Math.min(16, Math.max(3, Math.round(pc * 0.9 + setup.depth / 3)));
  if (setup.nodeType === 'elite') enemyCount += 1;
  if (setup.nodeType === 'boss') enemyCount += 2;
  if (objective.type === 'survive') enemyCount = Math.max(3, enemyCount - 2);

  const archs = Array.from({ length: enemyCount }, () => rng.pick(rosterFor(setup.world)));
  const bossDef = isBossFight ? setup.boss ?? rng.pick(bossPool(setup.world)) : undefined;
  const playerSizes = setup.roster.map((u) => u.size);
  const enemySizes = archs.map((a) => a.size ?? 1);
  const bossSize = bossDef?.size ?? 0;
  const biggest = Math.max(1, ...playerSizes, ...enemySizes, bossSize);

  const width = 13 + (isBossFight ? 2 : 0) + rng.int(0, 2) + Math.max(0, biggest - 2) * 2;
  const height = 9 + (setup.nodeType === 'boss' ? 1 : 0) + rng.int(0, 1) + Math.max(0, biggest - 3);
  const map = generateMap(rng, width, height, world.map, playerSizes, enemySizes, bossSize);

  let uid = 0;
  const units: Unit[] = setup.roster.map((u, i) => ({ ...prepareForBattle(u), x: map.playerSpawns[i].x, y: map.playerSpawns[i].y }));

  archs.forEach((arch, i) => {
    const lvl = Math.max(1, level + rng.int(-1, 1));
    const e = makeEnemy(arch, setup.world, lvl, `e${uid++}`, rng);
    e.x = map.enemySpawns[i].x;
    e.y = map.enemySpawns[i].y;
    if (e.ai === 'aggressive' && rng.chance(25)) e.ai = 'guard';
    units.push(e);
  });

  if (bossDef && map.bossSpawn) {
    const bossLevel = level + (setup.nodeType === 'boss' ? 2 : 1);
    const boss = makeEnemy(bossDef, setup.world, bossLevel, `e${uid++}`, rng, { boss: true });
    boss.x = map.bossSpawn.x;
    boss.y = map.bossSpawn.y;
    units.push(boss);
  }

  const base = setup.nodeType === 'boss' ? 500 : setup.nodeType === 'elite' ? 320 : 160;
  return {
    width: map.width,
    height: map.height,
    tiles: map.tiles,
    world: setup.world,
    units,
    turn: 1,
    phase: 'player',
    objective,
    rngState: rng.state,
    rewardRupees: base + setup.depth * 15,
    nodeType: setup.nodeType,
    log: [],
    fallen: [],
    enemyLevel: level,
    uidCounter: uid,
    interceptUsed: false,
    healMult: setup.healMult ?? 1,
    drops: [],
  };
}

export interface TurnStartEvent {
  uid: string;
  heal: number;
  damage: number;
  source: string;
}

/** Begin a team's phase: clear action flags, apply terrain and skill effects. */
export function startPhase(b: Battle, team: Team): TurnStartEvent[] {
  b.phase = team;
  if (team === 'enemy') b.interceptUsed = false;
  if (team === 'player' && b.weather) {
    b.weather.turns--;
    if (b.weather.turns <= 0) b.weather = undefined;
  }
  const events: TurnStartEvent[] = [];
  const mine = b.units.filter((u) => u.team === team);
  for (const u of mine) {
    u.moved = false;
    u.acted = false;
    u.movedDist = 0;
    // Statuses: damage over time, lost turns (freeze/stun), countdowns.
    const tick = tickStatuses(u);
    if (tick.lostTurn) u.moved = u.acted = true;
    if (tick.damage || tick.lostTurn) events.push({ uid: u.uid, heal: 0, damage: tick.damage, source: tick.lostTurn ?? 'status' });
    if (hasEffect(u, 'mpRegen')) u.mp = Math.min(u.stats.mp, u.mp + 2);
    const max = u.stats.hp;
    const tiles = footprint(u.x, u.y, u.size).map((p) => b.tiles[keyOf(b, p.x, p.y)]);
    const anchor = tiles[0];
    let pct = 0;
    let flat = 0;
    const sources: string[] = [];
    if (TERRAIN_BONUS[anchor].heal) { pct += TERRAIN_BONUS[anchor].heal; sources.push('terrain'); }
    if (u.skills.includes('royalWaters') && tiles.includes('water')) { pct += 15; sources.push('Royal Waters'); }
    if ((hasEffect(u, 'forestRegen')) && tiles.includes('forest')) { flat += 2; sources.push('forest'); }
    for (const a of mine) {
      if (a === u) continue;
      if (a.skills.includes('sacredSanctuary') && unitDist(u, a) <= 2) { pct += 10; sources.push('Sanctuary'); }
      if (a.skills.includes('guardianOfTheForest') && unitDist(u, a) <= 3) { pct += 10; sources.push('Deku Tree'); }
      if (hasEffect(a, 'lightAura') && unitDist(u, a) <= 1) { flat += 3; sources.push('Light Medallion'); }
    }
    let damage = 0;
    if (tiles.includes('lava') && !isLavaImmune(u)) {
      damage = Math.min(u.hp - 1, Math.ceil((max * LAVA_DAMAGE_PCT) / 100));
      u.hp -= damage;
    }
    const heal = Math.min(Math.ceil((max * pct) / 100) + flat, max - u.hp);
    if (heal > 0) u.hp += heal;
    if (heal > 0 || damage > 0) events.push({ uid: u.uid, heal: Math.max(0, heal), damage, source: sources.join(' + ') || 'lava' });
  }
  return events;
}

/** Spawn reinforcements in survive maps. */
export function spawnReinforcements(b: Battle): Unit[] {
  if (b.objective.type !== 'survive' || b.turn % 2 !== 0) return [];
  const rng = new RNG(b.rngState);
  const spawned: Unit[] = [];
  const edge = b.width - 1;
  const ys = rng.shuffle([...Array(b.height).keys()]);
  const smalls = rosterFor(b.world).filter((a) => (a.size ?? 1) === 1);
  for (const y of ys) {
    if (spawned.length >= 2 || !smalls.length) break;
    if (b.units.some((u) => edge >= u.x && edge < u.x + u.size && y >= u.y && y < u.y + u.size)) continue;
    if (b.tiles[keyOf(b, edge, y)] !== 'plain') continue;
    const e = makeEnemy(rng.pick(smalls), b.world, b.enemyLevel, `e${b.uidCounter++}`, rng);
    e.x = edge;
    e.y = y;
    e.moved = e.acted = true;
    b.units.push(e);
    spawned.push(e);
  }
  b.rngState = rng.state;
  return spawned;
}

export function checkResult(b: Battle): Battle['result'] {
  if (b.result) return b.result;
  const players = b.units.filter((u) => u.team === 'player');
  const enemies = b.units.filter((u) => u.team === 'enemy');
  if (!players.length || b.fallen.some((u) => u.isCommander)) return (b.result = 'lost');
  if (!enemies.length) return (b.result = 'won');
  if (b.objective.type === 'boss' && b.fallen.some((u) => u.isBoss)) return (b.result = 'won');
  if (b.objective.type === 'survive' && b.turn > (b.objective.turns ?? 6)) return (b.result = 'won');
  return undefined;
}

export function moveUnit(u: Unit, x: number, y: number, steps = 0) {
  u.movedDist += steps;
  u.x = x;
  u.y = y;
  u.moved = true;
}

export function objectiveText(o: Objective): string {
  switch (o.type) {
    case 'rout': return 'Rout the enemy';
    case 'boss': return 'Defeat the enemy commander';
    case 'survive': return `Defend for ${o.turns} turns`;
  }
}
