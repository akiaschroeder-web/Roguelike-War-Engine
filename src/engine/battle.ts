import { TERRAIN_BONUS } from '../data/classes';
import { bossesFor, FINAL_BOSS, rosterFor } from '../data/enemies';
import { keyOf, unitAt } from './grid';
import { generateMap } from './mapgen';
import { RNG } from './rng';
import { effectiveStats, makeEnemyUnit, prepareForBattle } from './units';
import type { Battle, BossDef, NodeType, Objective, RelicId, Team, Unit, WorldId } from './types';

export interface BattleSetup {
  world: WorldId;
  nodeType: NodeType;
  /** Overall progress through the run (0 = first fight). */
  depth: number;
  roster: Unit[];
  relics: RelicId[];
  seed: number;
  boss?: BossDef;
  finalBoss?: boolean;
}

export function enemyLevelFor(depth: number, nodeType: NodeType): number {
  const base = 1 + Math.floor(depth * 0.85);
  return base + (nodeType === 'elite' ? 1 : nodeType === 'boss' ? 2 : 0);
}

export function createBattle(setup: BattleSetup): Battle {
  const rng = new RNG(setup.seed);
  const pc = setup.roster.length;
  const isBossFight = setup.nodeType === 'boss' || setup.nodeType === 'elite';
  const level = enemyLevelFor(setup.depth, setup.nodeType);

  let objective: Objective = { type: 'rout' };
  if (isBossFight) objective = { type: 'boss' };
  else if (setup.depth > 1 && rng.chance(25)) objective = { type: 'survive', turns: 6 };

  let enemyCount = Math.min(12, Math.max(3, Math.round(pc * 0.9 + setup.depth / 3)));
  if (setup.nodeType === 'elite') enemyCount += 1;
  if (setup.nodeType === 'boss') enemyCount += 2;
  if (objective.type === 'survive') enemyCount = Math.max(3, enemyCount - 2);

  const width = 12 + (isBossFight ? 2 : 0) + rng.int(0, 2);
  const height = 9 + (setup.nodeType === 'boss' ? 1 : 0) + rng.int(0, 1);
  const map = generateMap(rng, width, height, pc, enemyCount);

  let uid = 0;
  const units: Unit[] = setup.roster.map((u, i) => ({ ...prepareForBattle(u), x: map.playerSpawns[i].x, y: map.playerSpawns[i].y }));

  const roster = rosterFor(setup.world);
  for (const p of map.enemySpawns) {
    const arch = rng.pick(roster);
    const lvl = Math.max(1, level + rng.int(-1, 1));
    const e = makeEnemyUnit(arch, setup.world, lvl, `e${uid++}`, rng);
    e.x = p.x;
    e.y = p.y;
    // Some enemies hold position until provoked, so maps don't all collapse at once.
    if (rng.chance(25)) e.ai = 'guard';
    units.push(e);
  }

  if (isBossFight) {
    const bossDef = setup.finalBoss ? FINAL_BOSS : setup.boss ?? rng.pick(bossesFor(setup.world));
    const bossLevel = level + (setup.nodeType === 'boss' ? 2 : 1);
    const boss = makeEnemyUnit(bossDef, bossDef.world, bossLevel, `e${uid++}`, rng, { boss: true });
    boss.x = map.bossSpawn.x;
    boss.y = map.bossSpawn.y;
    if (setup.finalBoss) boss.ai = 'stationary';
    units.push(boss);
  }

  const goldBase = setup.nodeType === 'boss' ? 500 : setup.nodeType === 'elite' ? 320 : 160;
  const b: Battle = {
    width: map.width,
    height: map.height,
    tiles: map.tiles,
    world: setup.world,
    units,
    turn: 1,
    phase: 'player',
    objective,
    rngState: rng.state,
    phoenixUsed: false,
    rewardGold: goldBase + setup.depth * 15,
    nodeType: setup.nodeType,
    log: [],
    relics: [...setup.relics],
    fallen: [],
    enemyLevel: level,
    uidCounter: uid,
  };
  return b;
}

export interface TurnStartEvent {
  uid: string;
  heal: number;
  source: string;
}

/** Begin a team's phase: clear action flags and apply start-of-turn healing. */
export function startPhase(b: Battle, team: Team): TurnStartEvent[] {
  b.phase = team;
  const events: TurnStartEvent[] = [];
  for (const u of b.units) {
    if (u.team !== team) continue;
    u.moved = false;
    u.acted = false;
    const max = u.stats.hp;
    if (u.hp >= max) continue;
    let heal = 0;
    const sources: string[] = [];
    const t = TERRAIN_BONUS[b.tiles[keyOf(b, u.x, u.y)]];
    if (t.heal) { heal += Math.ceil((max * t.heal) / 100); sources.push('terrain'); }
    if (u.skills.includes('regen')) { heal += Math.ceil(max * 0.2); sources.push('Regen'); }
    if (team === 'player' && b.relics.includes('medkit')) { heal += 5; sources.push('Medkit'); }
    heal = Math.min(heal, max - u.hp);
    if (heal > 0) {
      u.hp += heal;
      events.push({ uid: u.uid, heal, source: sources.join(' + ') });
    }
  }
  return events;
}

/** Spawn reinforcements in survive maps. Returns the new units. */
export function spawnReinforcements(b: Battle): Unit[] {
  if (b.objective.type !== 'survive' || b.turn % 2 !== 0) return [];
  const rng = new RNG(b.rngState);
  const spawned: Unit[] = [];
  const edge = b.width - 1;
  const ys = rng.shuffle([...Array(b.height).keys()]);
  for (const y of ys) {
    if (spawned.length >= 2) break;
    if (unitAt(b, edge, y) || b.tiles[keyOf(b, edge, y)] !== 'plain') continue;
    const arch = rng.pick(rosterFor(b.world));
    const e = makeEnemyUnit(arch, b.world, b.enemyLevel, `e${b.uidCounter++}`, rng);
    e.x = edge;
    e.y = y;
    e.moved = e.acted = true; // they act from next enemy phase
    b.units.push(e);
    spawned.push(e);
  }
  b.rngState = rng.state;
  return spawned;
}

/** Check win/lose conditions. Sets and returns b.result if the battle ended. */
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

export function moveUnit(u: Unit, x: number, y: number) {
  u.x = x;
  u.y = y;
  u.moved = true;
}

export function objectiveText(o: Objective): string {
  switch (o.type) {
    case 'rout': return 'Defeat all enemies';
    case 'boss': return 'Defeat the warlord';
    case 'survive': return `Survive ${o.turns} turns`;
  }
}

export function unitMov(b: Battle, u: Unit): number {
  return effectiveStats(u, b.relics).mov;
}
