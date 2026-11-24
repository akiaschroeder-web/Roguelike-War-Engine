import { bossPool, CLASSES, ENEMIES, GEAR, rosterFor, TEMPLATES, worldDef } from '../data/registry';
import { anchorCost, footprint, keyOf, unitAt, unitDist } from './grid';
import { generateMap } from './mapgen';
import { RNG } from './rng';
import { INF, LAVA_DAMAGE_PCT, TERRAIN_BONUS } from './rules';
import { addStatus, tickStatuses } from './status';
import { decorateField } from './field';
import { revertMask } from './terminaAbilities';
import { roomFor } from './transform';
import { canRide, unitTags, hasEffect, isLavaImmune, isMounted, makeEnemy, mountOf, sizeWhen, makeEnemyFromTemplate, prepareForBattle } from './units';
import type { Battle, BossDef, EnemyArchetype, EnemyForce, NodeType, Objective, ObjectiveType, Pos, Team, Terrain, Unit, WorldId } from './types';

export interface BattleSetup {
  world: WorldId;
  nodeType: NodeType;
  /** Overall progress through the run (0 = first fight). Grows forever. */
  depth: number;
  roster: Unit[];
  seed: number;
  boss?: BossDef;
  healMult?: number;
  /** Who you're fighting; omitted = the region's monsters. */
  force?: EnemyForce;
  supports?: Record<string, number>;
  /** Chamber of Trials modifiers. */
  trials?: string[];
  /** Extra enemy levels (Termina: each Song of Time reset, and the third day). */
  levelBonus?: number;
  /** Equipment the army owns (some masks change encounters). */
  gearOwned?: string[];
}

/** Enemy level for a given depth. Keeps climbing in endless mode. */
export function enemyLevelFor(depth: number, nodeType: NodeType): number {
  // Gentle in the first region, then climbing faster and faster forever.
  const base = 1 + Math.floor(depth * 0.45 + Math.max(0, depth - 14) * 0.2 + Math.max(0, depth - 35) * 0.2);
  return base + (nodeType === 'elite' || nodeType === 'boss' ? 1 : 0);
}

/** Extra levels for bosses and leaders, phased in after the first region. */
function bossBonus(depth: number, nodeType: NodeType): number {
  const tier = depth < 7 ? 0 : depth < 14 ? 1 : 2;
  return tier + (nodeType === 'boss' && depth >= 7 ? 1 : 0);
}

export function createBattle(setup: BattleSetup): Battle {
  const rng = new RNG(setup.seed);
  const pc = setup.roster.length;
  const isBossFight = setup.nodeType === 'boss' || setup.nodeType === 'elite';
  const level = enemyLevelFor(setup.depth, setup.nodeType) + (setup.trials?.includes('hardened') ? 2 : 0) + (setup.levelBonus ?? 0);
  const world = worldDef(setup.world);

  let objective: Objective = { type: 'rout' };
  if (isBossFight) objective = { type: 'boss' };
  else if (setup.nodeType === 'siege') objective = { type: 'seize' };
  else if (setup.nodeType === 'ambush') objective = { type: 'rout' };
  else if (setup.depth >= 1) {
    objective = { type: rng.weighted<ObjectiveType>([['rout', 36], ['survive', 10], ['seize', 14], ['defend', 9], ['escape', 8], ['capture', 10], ['escort', 8], ['rescue', setup.gearOwned?.includes('kafeiMask') ? 16 : 8]]) };
    if (objective.type === 'survive' || objective.type === 'defend') objective.turns = 6;
  }

  // Enemy count grows slowly with depth so the endless run keeps escalating.
  let enemyCount = Math.min(16, Math.max(3, Math.round(pc * (setup.depth < 3 ? 0.75 : 0.9) + setup.depth / 3)));
  if (setup.nodeType === 'elite') enemyCount += 1;
  if (setup.nodeType === 'boss') enemyCount += setup.depth < 7 ? 0 : 2;
  if (objective.type === 'survive') enemyCount = Math.max(3, enemyCount - 2);
  if (setup.trials?.includes('swarm')) enemyCount += 2;

  // Each enemy slot is either a monster archetype or a character/soldier template.
  const force = setup.force;
  const heroes = rng.shuffle([...(force?.heroes ?? [])]);
  type Spec = { arch: EnemyArchetype } | { tmpl: string };
  const specs: Spec[] = Array.from({ length: enemyCount }, (): Spec => {
    const monster = () => ({ arch: rng.pick(force?.anyMonsters ? Object.values(ENEMIES) : rosterFor(setup.world)) });
    if (!force || (!force.templates.length && !heroes.length)) return monster();
    if (heroes.length && rng.chance(60)) return { tmpl: heroes.shift()! };
    if (force.monsters && rng.chance(40)) return monster();
    if (!force.templates.length) return monster();
    return { tmpl: rng.pick(force.templates) };
  });
  const leader = isBossFight && force?.leader && TEMPLATES[force.leader] ? TEMPLATES[force.leader] : undefined;
  const bossDef = isBossFight && !leader ? setup.boss ?? rng.pick(bossPool(setup.world)) : undefined;
  const playerSizes = setup.roster.map((u) => prepareForBattle(u).size);
  const enemySizes = specs.map((sp) => ('arch' in sp ? sp.arch.size ?? 1 : TEMPLATES[sp.tmpl]?.size ?? 1));
  const bossSize = leader?.size ?? bossDef?.size ?? 0;
  const biggest = Math.max(1, ...playerSizes, ...enemySizes, bossSize);

  const width = 13 + (isBossFight ? 2 : 0) + rng.int(0, 2) + Math.max(0, biggest - 2) * 2;
  const height = 9 + (setup.nodeType === 'boss' ? 1 : 0) + rng.int(0, 1) + Math.max(0, biggest - 3);
  const style = setup.nodeType === 'siege' ? { ...world.map, walls: world.map.walls + 6, forts: world.map.forts + 2, water: 'moat' as const } : world.map;
  const map = generateMap(rng, width, height, style, playerSizes, enemySizes, bossSize);
  placeObjective(rng, map, objective, playerSizes, enemySizes);
  // First-region bosses don't get a healing fort to sit on.
  if (setup.depth < 7 && map.bossSpawn && objective.type !== 'seize') map.tiles[map.bossSpawn.y * map.width + map.bossSpawn.x] = 'plain';

  let uid = 0;
  const units: Unit[] = setup.roster.map((u, i) => ({ ...prepareForBattle(u), x: map.playerSpawns[i].x, y: map.playerSpawns[i].y }));

  specs.forEach((sp, i) => {
    const lvl = Math.max(1, level + rng.int(-1, 1));
    const e = 'arch' in sp ? makeEnemy(sp.arch, setup.world, lvl, `e${uid++}`, rng) : makeEnemyFromTemplate(sp.tmpl, lvl, `e${uid++}`, rng);
    e.x = map.enemySpawns[i].x;
    e.y = map.enemySpawns[i].y;
    if (e.ai === 'aggressive' && rng.chance(25)) e.ai = 'guard';
    units.push(e);
  });
  if (setup.nodeType === 'ambush') ambushPositions(rng, map, units);
  // Circus Leader's Mask: hostile riders lose their nerve and hold position.
  if (setup.gearOwned?.includes('circusLeaderMask')) for (const e of units) if (e.team === 'enemy' && !e.isBoss && CLASSES[e.classId]?.moveType === 'cavalry') e.ai = 'guard';
  if (objective.type === 'seize' && objective.tiles?.[0]) {
    // Someone holds the throne: the toughest one-tile enemy, who won't leave it.
    const t = objective.tiles[0];
    const holder = units.find((u) => u.team === 'enemy' && footprint(u.x, u.y, u.size).some((f) => f.x === t.x && f.y === t.y));
    const keeper = holder ?? units.filter((u) => u.team === 'enemy' && u.size === 1).sort((a, c) => c.level - a.level || c.stats.hp - a.stats.hp)[0];
    if (keeper && !holder) { keeper.x = t.x; keeper.y = t.y; }
    if (keeper) keeper.ai = 'stationary';
  }

  if (leader && map.bossSpawn) {
    const boss = makeEnemyFromTemplate(leader.id, level + 1 + bossBonus(setup.depth, setup.nodeType), `e${uid++}`, rng, { boss: true });
    boss.x = map.bossSpawn.x;
    boss.y = map.bossSpawn.y;
    units.push(boss);
  } else if (bossDef && map.bossSpawn) {
    const bossLevel = level + bossBonus(setup.depth, setup.nodeType);
    const boss = makeEnemy(bossDef, setup.world, bossLevel, `e${uid++}`, rng, { boss: true });
    if (setup.depth < 7) {
      // First-region bosses are a little gentler.
      for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res'] as const) boss.stats[k] = Math.round(boss.stats[k] * 0.8);
      boss.stats.hp = boss.hp = Math.round(boss.stats.hp * 0.85);
    }
    boss.x = map.bossSpawn.x;
    boss.y = map.bossSpawn.y;
    units.push(boss);
  }

  addAllies(rng, map, units, objective, setup, level);

  const base = setup.nodeType === 'boss' ? 500 : setup.nodeType === 'elite' ? 320 : setup.nodeType === 'siege' ? 260 : setup.nodeType === 'ambush' ? 220 : 160;
  const battle: Battle = {
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
    forceName: force?.name,
    supports: { ...(setup.supports ?? {}) },
    drops: [],
    sideQuest: !isBossFight && setup.nodeType !== 'siege' && rng.chance(35)
      ? rng.chance(50)
        ? { kind: 'fast', turns: objective.type === 'survive' || objective.type === 'defend' ? undefined : 5 + Math.floor(enemyCount / 4), rupees: 120 + setup.depth * 12 }
        : { kind: 'noLoss', rupees: 80 + setup.depth * 10, item: rng.pick(['bluePotion', 'fairy', 'greenPotion', 'bombchu', 'staminaPotion']) }
      : undefined,
  };
  battle.bossTier = setup.depth < 7 ? 0 : setup.depth < 14 ? 1 : 2;
  // First-region bosses and leaders hold their ground instead of hunting your Commander.
  if (battle.bossTier === 0) for (const u of units) if (u.isBoss) u.ai = 'stationary';
  decorateField(battle, rng, setup.nodeType);
  if (setup.trials?.includes('mist')) battle.fog = true;
  battle.rngState = rng.state;
  return battle;
}

type GenMap = ReturnType<typeof generateMap>;

function occupied(map: GenMap, playerSizes: number[], enemySizes: number[]): Set<string> {
  const taken = new Set<string>();
  const add = (p: Pos, s: number) => { for (const f of footprint(p.x, p.y, s)) taken.add(`${f.x},${f.y}`); };
  map.playerSpawns.forEach((p, i) => add(p, playerSizes[i]));
  map.enemySpawns.forEach((p, i) => add(p, enemySizes[i]));
  if (map.bossSpawn) add(map.bossSpawn, 3);
  return taken;
}

const WALKABLE: Terrain[] = ['plain', 'forest', 'fort'];

/** Choose and mark objective tiles on the generated map. */
function placeObjective(rng: RNG, map: GenMap, o: Objective, playerSizes: number[], enemySizes: number[]) {
  const { width: w, height: h } = map;
  const taken = occupied(map, playerSizes, enemySizes);
  const free = (x: number, y: number) => !taken.has(`${x},${y}`) && WALKABLE.includes(map.tiles[y * w + x]);
  const pick = (cands: Pos[], score: (p: Pos) => number) => cands.filter((p) => free(p.x, p.y)).sort((a, b) => score(a) - score(b))[0];
  const all: Pos[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) all.push({ x, y });
  const mid = h / 2;
  switch (o.type) {
    case 'seize': {
      const t = map.bossSpawn ?? pick(all.filter((p) => p.x >= w - 3), (p) => Math.abs(p.y - mid) - p.x);
      if (t) { map.tiles[t.y * w + t.x] = 'fort'; o.tiles = [t]; }
      break;
    }
    case 'defend': {
      const t = pick(all.filter((p) => p.x <= 2), (p) => Math.abs(p.y - mid) + p.x * 0.5);
      if (t) { map.tiles[t.y * w + t.x] = 'fort'; o.tiles = [t]; }
      break;
    }
    case 'escape':
    case 'escort':
      o.tiles = all.filter((p) => p.x === w - 1 && WALKABLE.includes(map.tiles[p.y * w + p.x]));
      break;
    case 'capture': {
      const band = rng.shuffle(all.filter((p) => p.x >= Math.floor(w * 0.3) && p.x <= Math.ceil(w * 0.7)));
      const pts: Pos[] = [];
      for (const p of band) {
        if (pts.length >= 3) break;
        if (free(p.x, p.y) && pts.every((q) => Math.abs(q.y - p.y) + Math.abs(q.x - p.x) >= 3)) pts.push(p);
      }
      for (const p of pts) map.tiles[p.y * w + p.x] = 'fort';
      o.tiles = pts;
      o.need = Math.min(2, pts.length);
      break;
    }
  }
  if ((o.type === 'seize' || o.type === 'defend' || o.type === 'capture' || o.type === 'escape' || o.type === 'escort') && !o.tiles?.length) {
    o.type = 'rout'; // couldn't place it: fall back
    delete o.tiles;
  }
}

/** Ambush: some small enemies start on your flank, and the enemy moves first. */
function ambushPositions(rng: RNG, map: GenMap, units: Unit[]) {
  const taken = new Set<string>();
  for (const u of units) for (const f of footprint(u.x, u.y, u.size)) taken.add(`${f.x},${f.y}`);
  const spots = rng.shuffle(
    Array.from({ length: map.width * map.height }, (_, i) => ({ x: i % map.width, y: Math.floor(i / map.width) }))
      .filter((p) => p.x >= 2 && p.x <= 5 && !taken.has(`${p.x},${p.y}`) && WALKABLE.includes(map.tiles[p.y * map.width + p.x])),
  );
  const movers = units.filter((u) => u.team === 'enemy' && u.size === 1 && !u.isBoss);
  for (const e of movers.slice(0, Math.ceil(movers.length / 2))) {
    const s = spots.shift();
    if (!s) break;
    e.x = s.x;
    e.y = s.y;
    taken.add(`${s.x},${s.y}`);
  }
}

/** Is any unit of `team` standing on one of these tiles? */
function onTiles(b: Battle, team: Team, tiles: Pos[] | undefined, only?: (u: Unit) => boolean): number {
  if (!tiles) return 0;
  return tiles.filter((t) => b.units.some((u) => u.team === team && (!only || only(u)) && footprint(u.x, u.y, u.size).some((f) => f.x === t.x && f.y === t.y))).length;
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
  const events: TurnStartEvent[] = [];
  const mine = b.units.filter((u) => u.team === team);
  for (const u of mine) {
    u.moved = false;
    u.acted = false;
    u.movedDist = 0;
    // Statuses: damage over time, lost turns (freeze/stun), countdowns.
    const trng = new RNG(b.rngState);
    const tick = tickStatuses(u, trng.int(0, 99));
    b.rngState = trng.state;
    if (tick.lostTurn) u.moved = u.acted = true;
    if (tick.damage || tick.heal || tick.lostTurn) events.push({ uid: u.uid, heal: tick.heal, damage: tick.damage, source: tick.lostTurn ?? 'status' });
    if (hasEffect(u, 'mpRegen')) u.mp = Math.min(u.stats.mp, u.mp + 2);
    u.sta = Math.min(u.stats.sta, (u.sta ?? u.stats.sta) + 2 + (hasEffect(u, 'staRegen') ? 2 : 0));
    for (const k of Object.keys(u.cooldowns ?? {})) if (--u.cooldowns![k] <= 0) delete u.cooldowns![k];
    terminaUpkeep(b, u, events);
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
      if (a.skills.includes('songOfTheRanch') && isMounted(u) && unitDist(u, a) <= 1) { pct += 10; sources.push('Song of the Ranch'); }
      if (hasEffect(a, 'lightAura') && unitDist(u, a) <= 1) { flat += 3; sources.push('Light Medallion'); }
      if (a.skills.includes('guardianOfTheZora') && u.race === 'zora' && unitDist(u, a) <= 4) { pct += 5; sources.push('Jabu-Jabu'); }
    }
    if (u.skills.includes('forestGuardian') && tiles.includes('forest')) { pct += 10; sources.push('Forest Guardian'); }
    if (b.night && b.bonus === 'undeadArmy' && unitTags(u).includes('undead') && u.team === 'player') { pct += 5; sources.push('night'); }
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
  if (b.objective.type !== 'survive' || b.turn % 2 !== 0 || (b.timeSlowed ?? 0) > 0) return [];
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
  const players = b.units.filter((u) => u.team === 'player' && !u.npc);
  const enemies = b.units.filter((u) => u.team === 'enemy');
  if (!players.length || b.fallen.some((u) => u.isCommander)) return (b.result = 'lost');
  if (b.objective.type === 'escort' && b.fallen.some((u) => u.vip)) { b.retreat = true; return (b.result = 'lost'); }
  if (!enemies.length) return (b.result = 'won');
  if (b.objective.type === 'boss' && b.fallen.some((u) => u.isBoss)) return (b.result = 'won');
  const o = b.objective;
  if (o.type === 'survive' && b.turn > (o.turns ?? 6)) return (b.result = 'won');
  if (o.type === 'seize' && onTiles(b, 'player', o.tiles)) return (b.result = 'won');
  if (o.type === 'defend') {
    if (onTiles(b, 'enemy', o.tiles)) { b.retreat = true; return (b.result = 'lost'); }
    if (b.turn > (o.turns ?? 6)) return (b.result = 'won');
  }
  if (o.type === 'escape' && onTiles(b, 'player', o.tiles, (u) => !!u.isCommander)) return (b.result = 'won');
  if (o.type === 'escort' && onTiles(b, 'player', o.tiles, (u) => !!u.vip)) return (b.result = 'won');
  if (o.type === 'rescue' && b.units.some((u) => u.rescued) && !b.units.some((u) => u.captive)) return (b.result = 'won');
  if (o.type === 'capture' && onTiles(b, 'player', o.tiles) >= (o.need ?? 2)) return (b.result = 'won');
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
    case 'survive': return `Survive for ${o.turns} turns`;
    case 'seize': return 'Seize the throne (stand on the gold tile)';
    case 'defend': return `Defend the point for ${o.turns} turns`;
    case 'escape': return 'Escape: get your Commander to the far edge';
    case 'escort': return 'Escort: get the VIP (green) safely to the far edge';
    case 'rescue': return 'Rescue the prisoners (move next to them and Free them)';
    case 'capture': return `Hold ${o.need} of the ${o.tiles?.length ?? 3} capture points at once`;
  }
}

/** Why the unit can't mount/dismount right now, or null if it can. */
export function mountToggleBlocked(b: Battle, u: Unit): string | null {
  if (!mountOf(u) || !canRide(u)) return 'No mount';
  if (u.mounted !== false) return null; // dismounting always works
  const was = { mounted: u.mounted, size: u.size };
  u.mounted = true;
  u.size = sizeWhen(u, true);
  const fits = anchorCost(b, u, u.x, u.y) < INF
    && footprint(u.x, u.y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u; });
  u.mounted = was.mounted;
  u.size = was.size;
  return fits ? null : 'Not enough room to mount here';
}

/** Mount or dismount (changes size and movement type). Returns false if blocked. */
export function toggleMount(b: Battle, u: Unit): boolean {
  if (mountToggleBlocked(b, u)) return false;
  u.mounted = u.mounted === false;
  u.size = sizeWhen(u, u.mounted);
  return true;
}

// ───────────────────────── Allied units ─────────────────────────

const VIPS = ['talon', 'ingo', 'dampe', 'maskSalesman', 'carpenterBoss', 'malon', 'mido', 'saria', 'ruto', 'zelda', 'kaepora'];
const PRISONERS = ['hyruleSoldier', 'kokiriScout', 'goronWarrior', 'zoraWarrior', 'gerudoGuard', 'sheikahWarrior', 'hyruleArcher', 'talon', 'mido', 'ingo', 'carpenterBoss'];
const ALLY_SQUADS: Record<string, string[]> = {
  hyruleField: ['hyruleSoldier', 'hyruleArcher', 'hyruleCavalry'], hyruleCastle: ['hyruleKnight', 'hyruleSoldier', 'hyruleArcher'],
  kokiriForest: ['kokiriScout', 'kokiriSlingshooter'], lostWoods: ['kokiriScout', 'dekuScrub'], deathMountain: ['goronWarrior', 'goronRoller'],
  zorasDomain: ['zoraWarrior', 'zoraMystic'], gerudoDesert: ['gerudoGuard', 'gerudoThief'], kakarikoGraveyard: ['sheikahWarrior', 'hyruleSoldier'],
};

function freeTile(map: GenMap, units: Unit[], minX: number, maxX: number, rng: RNG, nearY?: number): Pos | null {
  const taken = new Set<string>();
  for (const u of units) for (const f of footprint(u.x, u.y, u.size)) taken.add(`${f.x},${f.y}`);
  const c: Pos[] = [];
  for (let y = 0; y < map.height; y++) for (let x = Math.max(0, minX); x <= Math.min(map.width - 1, maxX); x++) {
    if (!taken.has(`${x},${y}`) && WALKABLE.includes(map.tiles[y * map.width + x])) c.push({ x, y });
  }
  if (!c.length) return null;
  if (nearY !== undefined) return c.sort((a, b) => Math.abs(a.y - nearY) + a.x * 0.3 - (Math.abs(b.y - nearY) + b.x * 0.3))[0];
  return rng.pick(c);
}

function makeAlly(templateId: string, level: number, uid: string, rng: RNG): Unit | null {
  if (!TEMPLATES[templateId] || (TEMPLATES[templateId].size ?? 1) > 1) return null;
  const u = prepareForBattle(makeEnemyFromTemplate(templateId, level, uid, rng));
  u.team = 'player';
  u.npc = true;
  u.ai = 'aggressive';
  u.isBoss = false;
  return u;
}

/** VIPs to escort, prisoners to rescue, and friendly squads that fight alongside you. */
function addAllies(rng: RNG, map: GenMap, units: Unit[], o: Objective, setup: BattleSetup, level: number) {
  const have = new Set(setup.roster.map((u) => u.templateId));
  let n = 0;
  const add = (id: string, lvl: number, minX: number, maxX: number, mod: (u: Unit) => void, nearY?: number) => {
    const u = makeAlly(id, lvl, `a${n++}`, rng);
    const p = u && freeTile(map, units, minX, maxX, rng, nearY);
    if (!u || !p) return null;
    u.x = p.x; u.y = p.y;
    mod(u);
    units.push(u);
    return u;
  };
  if (o.type === 'escort') {
    const id = rng.pick(VIPS.filter((v) => !have.has(v) && TEMPLATES[v]));
    const vip = id && add(id, Math.max(1, level - 2), 0, 3, (u) => { u.vip = true; u.title = 'VIP'; }, Math.floor(map.height / 2));
    if (!vip) { o.type = 'rout'; delete o.tiles; }
  }
  if (o.type === 'rescue') {
    const pool = rng.shuffle(PRISONERS.filter((v) => TEMPLATES[v] && (TEMPLATES[v].generic || !have.has(v))));
    let placed = 0;
    for (const id of pool.slice(0, 2)) {
      if (add(id, Math.max(1, level - 1), Math.floor(map.width * 0.55), map.width - 2, (u) => { u.captive = true; u.moved = u.acted = true; })) placed++;
    }
    if (!placed) o.type = 'rout';
  }
  // Sometimes a friendly squad joins the fight (never in boss battles).
  if (setup.nodeType !== 'boss' && setup.nodeType !== 'elite' && rng.chance(15)) {
    const squad = ALLY_SQUADS[setup.world] ?? ALLY_SQUADS.hyruleField;
    for (let i = 0; i < rng.int(1, 2); i++) add(rng.pick(squad), Math.max(1, level - 1), 0, 4, () => undefined);
  }
}

/** Free an adjacent prisoner: they join the fight now and your army after a victory. */
export function freeCaptive(b: Battle, u: Unit, captiveUid: string): Unit | null {
  const c = b.units.find((x) => x.uid === captiveUid);
  if (!c?.captive || u.npc || u.team !== 'player' || unitDist(u, c) !== 1) return null;
  c.captive = false;
  c.rescued = true;
  c.moved = c.acted = true;
  b.log.push(`${u.name} freed ${c.name}!`);
  return c;
}

export function adjacentCaptives(b: Battle, u: Unit): Unit[] {
  if (u.npc || u.team !== 'player') return [];
  return b.units.filter((c) => c.captive && unitDist(u, c) === 1);
}

// ───────────────────────── Termina upkeep ─────────────────────────

/** Start-of-phase effects from Majora's Mask units, masks and battlefield spaces. */
function terminaUpkeep(b: Battle, u: Unit, events: TurnStartEvent[]) {
  // Fierce Deity and Giant forms drain MP; out of MP, the mask comes off.
  const mask = u.maskForm ? GEAR[u.maskForm] : undefined;
  if (mask?.upkeep) {
    const cost = Math.ceil(mask.upkeep * (b.bonus === 'transformThrift' && u.team === 'player' ? 0.75 : 1));
    if (u.mp >= cost) u.mp -= cost;
    else if (roomFor(b, u, u.originalForm?.size ?? 1)) {
      revertMask(u);
      events.push({ uid: u.uid, heal: 0, damage: 0, source: 'The mask slips off (out of MP)' });
    }
  }
  const foes = b.units.filter((e) => e.team !== u.team);
  // Sharp's Song of Sorrow drains MP.
  if (foes.some((e) => e.skills.includes('songOfSorrow') && unitDist(e, u) <= 3)) u.mp = Math.max(0, u.mp - 2);
  // Odolwa's insect swarm stings nearby enemies at the start of his side's turn.
  if (u.skills.includes('jungleRitual')) {
    for (const e of foes) {
      if (unitDist(e, u) > 2 || e.hp <= 1) continue;
      const d = Math.min(e.hp - 1, Math.ceil(e.stats.hp * 0.08));
      e.hp -= d;
      events.push({ uid: e.uid, heal: 0, damage: d, source: "Odolwa's swarm" });
    }
  }
  const here = b.tiles[keyOf(b, u.x, u.y)];
  // Deku Flowers launch Deku into a glide; Gorons get a run-up from ramps.
  if ((u.race === 'deku') && (here === 'dekuFlower' || here === 'goldFlower')) {
    u.buffs.push({ id: 'glide', name: here === 'goldFlower' ? 'Golden Flower Glide' : 'Flower Glide', turns: 1, stats: { mov: here === 'goldFlower' ? 4 : 2 } });
  }
  if (u.race === 'goron' && here === 'rollingRamp') u.buffs.push({ id: 'ramp', name: 'Ramp Launch', turns: 1, stats: { mov: 3 } });
  // Garo robes: a turn without attacking hides the wearer.
  if (hasEffect(u, 'concealOnWait') && !u.attacked) addStatus(u, 'veiled', 1);
  u.attacked = false;
  // The Woodfall Giant grows forests where it stands.
  if (u.skills.includes('forestGuardian')) {
    for (const p of footprint(u.x, u.y, u.size)) if (b.tiles[keyOf(b, p.x, p.y)] === 'plain') b.tiles[keyOf(b, p.x, p.y)] = 'forest';
  }
}
