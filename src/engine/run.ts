import { CLASSES } from '../data/classes';
import { BOSSES } from '../data/enemies';
import { HEROES, HERO_MAP } from '../data/heroes';
import { RELIC_IDS, RELICS } from '../data/skills';
import { SHOP_WEAPONS, WEAPONS } from '../data/weapons';
import { PLAYABLE_WORLDS } from '../data/worlds';
import { createBattle } from './battle';
import { RNG } from './rng';
import { gainXp, makeHeroUnit, rollLevelUp, STAT_KEYS } from './units';
import type { MapNode, NodeType, RelicId, Run, RunMap, StatKey, Unit, WorldId } from './types';
import type { LevelUp } from './combat';

export const ACTS = 3;
export const ROWS_PER_ACT = 7; // last row is the act boss
export const MAX_ROSTER = 8;

function withRng<T>(run: Run, fn: (rng: RNG) => T): T {
  const rng = new RNG(run.rngState);
  const out = fn(rng);
  run.rngState = rng.state;
  return out;
}

const nextUid = (run: Run) => `p${run.uidCounter++}`;

export function newRun(seed: number, commanderId: string): Run {
  const rng = new RNG(seed);
  const run: Run = {
    seed,
    rngState: 0,
    act: 1,
    map: { rows: 0, nodes: [] },
    currentNodeId: null,
    roster: [],
    fallen: [],
    gold: 200,
    relics: [],
    stats: { battles: 0, kills: 0, recruits: 0 },
    seenHeroes: [commanderId],
    bossesFought: [],
    uidCounter: 0,
  };
  const commander = makeHeroUnit(commanderId, nextUid(run), 1, rng);
  commander.isCommander = true;
  run.roster.push(commander);

  // Two companions from other worlds, one of whom is always a damage dealer
  // and the other random (so the starting party has some variety).
  const cmdWorld = HERO_MAP[commanderId].world;
  const pool = rng.shuffle(HEROES.filter((h) => h.world !== cmdWorld && CLASSES[h.classId].weapons[0] !== 'staff'));
  const first = pool[0];
  const second = rng.shuffle(HEROES.filter((h) => h.world !== cmdWorld && h.world !== first.world && h.id !== commanderId))[0];
  for (const h of [first, second]) {
    run.roster.push(makeHeroUnit(h, nextUid(run), 1, rng));
    run.seenHeroes.push(h.id);
  }
  run.map = generateActMap(rng, 1, []);
  run.rngState = rng.state;
  return run;
}

export function generateActMap(rng: RNG, act: number, bossesFought: string[]): RunMap {
  const nodes: MapNode[] = [];
  const rows: MapNode[][] = [];
  let id = 0;
  for (let r = 0; r < ROWS_PER_ACT; r++) {
    const isBossRow = r === ROWS_PER_ACT - 1;
    const count = isBossRow ? 1 : r === 0 ? rng.int(2, 3) : rng.int(2, 4);
    const row: MapNode[] = [];
    for (let i = 0; i < count; i++) {
      const type: NodeType = isBossRow ? 'boss' : pickNodeType(rng, r, act);
      const world: WorldId = act === ACTS && isBossRow ? 'rift' : rng.pick(PLAYABLE_WORLDS);
      row.push({
        id: `a${act}n${id++}`,
        row: r,
        col: count === 1 ? 0.5 : (i + 0.5) / count + (rng.next() - 0.5) * 0.08,
        type,
        world,
        next: [],
        visited: false,
      });
    }
    rows.push(row);
    nodes.push(...row);
  }
  // Act boss world: pick a warlord we haven't fought yet.
  if (act < ACTS) {
    const remaining = BOSSES.filter((b) => !bossesFought.includes(b.id));
    const boss = rng.pick(remaining.length ? remaining : BOSSES);
    rows[ROWS_PER_ACT - 1][0].world = boss.world;
  }
  // Connect rows: each node links to the 1-2 nearest nodes in the next row,
  // and every next-row node gets at least one incoming edge.
  for (let r = 0; r < ROWS_PER_ACT - 1; r++) {
    const cur = rows[r], nxt = rows[r + 1];
    for (const n of cur) {
      const sorted = [...nxt].sort((a, b) => Math.abs(a.col - n.col) - Math.abs(b.col - n.col));
      n.next.push(sorted[0].id);
      if (sorted[1] && rng.chance(45)) n.next.push(sorted[1].id);
    }
    for (const m of nxt) {
      if (!cur.some((n) => n.next.includes(m.id))) {
        const nearest = [...cur].sort((a, b) => Math.abs(a.col - m.col) - Math.abs(b.col - m.col))[0];
        nearest.next.push(m.id);
      }
    }
  }
  return { rows: ROWS_PER_ACT, nodes };
}

function pickNodeType(rng: RNG, row: number, act: number): NodeType {
  if (row === 0) return 'battle';
  if (row === ROWS_PER_ACT - 2) return rng.weighted([['rest', 3], ['shop', 2], ['battle', 2]]);
  const entries: [NodeType, number][] = [
    ['battle', 45],
    ['recruit', row <= 3 || act > 1 ? 16 : 8],
    ['shop', 11],
    ['rest', 9],
    ['treasure', 9],
    ['elite', row >= 2 ? 12 : 0],
  ];
  return rng.weighted(entries);
}

export function nodeById(run: Run, id: string): MapNode | undefined {
  return run.map.nodes.find((n) => n.id === id);
}

export function availableNodes(run: Run): MapNode[] {
  if (!run.currentNodeId) return run.map.nodes.filter((n) => n.row === 0);
  const cur = nodeById(run, run.currentNodeId);
  return cur ? cur.next.map((id) => nodeById(run, id)!).filter(Boolean) : [];
}

/** Overall depth (fights get harder the further in you are). */
export function depthOf(run: Run, node: MapNode): number {
  return (run.act - 1) * ROWS_PER_ACT + node.row;
}

// ───────────────────────── Events ─────────────────────────

export type RunEvent =
  | { type: 'recruit'; offers: string[] }
  | { type: 'shop'; weapons: string[]; relics: RelicId[]; tonics: StatKey[]; sold: string[] }
  | { type: 'rest' }
  | { type: 'treasure'; relics: RelicId[]; gold: number };

export interface RunWithEvent extends Run {
  event?: RunEvent;
}

export function enterNode(run: RunWithEvent, nodeId: string): void {
  const node = nodeById(run, nodeId);
  if (!node || !availableNodes(run).includes(node)) throw new Error('Node not available');
  run.currentNodeId = nodeId;
  node.visited = true;
  run.event = undefined;
  withRng(run, (rng) => {
    switch (node.type) {
      case 'battle':
      case 'elite':
      case 'boss': {
        const finalBoss = node.type === 'boss' && run.act === ACTS;
        let boss;
        if (node.type === 'boss' && !finalBoss) {
          boss = BOSSES.find((b) => b.world === node.world && !run.bossesFought.includes(b.id)) ?? BOSSES.find((b) => b.world === node.world);
        } else if (node.type === 'elite') {
          boss = rng.pick(BOSSES.filter((b) => b.world === node.world));
        }
        if (boss) run.bossesFought.push(boss.id);
        run.battle = createBattle({
          world: node.world,
          nodeType: node.type,
          depth: depthOf(run, node),
          roster: run.roster,
          relics: run.relics,
          seed: rng.int(0, 2 ** 31),
          boss,
          finalBoss,
        });
        break;
      }
      case 'recruit': {
        const pool = HEROES.filter((h) => !run.seenHeroes.includes(h.id));
        // Prefer heroes from the node's world, then anyone.
        const local = rng.shuffle(pool.filter((h) => h.world === node.world));
        const other = rng.shuffle(pool.filter((h) => h.world !== node.world));
        const offers = [...local.slice(0, 1), ...other].slice(0, 3).map((h) => h.id);
        run.event = { type: 'recruit', offers };
        break;
      }
      case 'shop': {
        const maxTier = Math.min(3, run.act + 1);
        const weapons = rng.shuffle(SHOP_WEAPONS.filter((w) => w.tier <= maxTier)).slice(0, 5).map((w) => w.id);
        const relics = rng.shuffle(RELIC_IDS.filter((r) => !run.relics.includes(r))).slice(0, 2);
        const tonics = rng.shuffle([...STAT_KEYS]).slice(0, 2);
        run.event = { type: 'shop', weapons, relics, tonics, sold: [] };
        break;
      }
      case 'rest':
        run.event = { type: 'rest' };
        break;
      case 'treasure': {
        const relics = rng.shuffle(RELIC_IDS.filter((r) => !run.relics.includes(r))).slice(0, 3);
        run.event = { type: 'treasure', relics, gold: 100 + run.act * 50 };
        break;
      }
    }
  });
}

export function currentNode(run: Run): MapNode | undefined {
  return run.currentNodeId ? nodeById(run, run.currentNodeId) : undefined;
}

export interface BattleSummary {
  won: boolean;
  gold: number;
  fallen: Unit[];
  kills: number;
}

/** Fold a finished battle back into the run. */
export function finishBattle(run: RunWithEvent): BattleSummary {
  const b = run.battle!;
  const won = b.result === 'won';
  const kills = b.fallen.filter((u) => u.team === 'enemy').length;
  const fallen = b.fallen.filter((u) => u.team === 'player');
  const survivors = b.units.filter((u) => u.team === 'player');
  // Carry progression back; HP fully restores between fights.
  run.roster = survivors.map((u) => ({ ...u, hp: u.stats.hp, moved: false, acted: false, kills: 0 }));
  run.fallen.push(...fallen.map((u) => ({ ...u, hp: 0 })));
  let gold = 0;
  if (won) {
    gold = Math.round(b.rewardGold * (run.relics.includes('bountyBadge') ? 1.5 : 1));
    run.gold += gold;
  }
  run.stats.battles++;
  run.stats.kills += kills;
  run.battle = undefined;
  return { won, gold, fallen, kills };
}

export function isActComplete(run: Run): boolean {
  const n = currentNode(run);
  return !!n && n.type === 'boss';
}

export function isRunWon(run: Run): boolean {
  return isActComplete(run) && run.act === ACTS;
}

export function advanceAct(run: Run): void {
  run.act++;
  run.currentNodeId = null;
  withRng(run, (rng) => {
    run.map = generateActMap(rng, run.act, run.bossesFought);
  });
  run.gold += 150;
}

export function averageLevel(run: Run): number {
  if (!run.roster.length) return 1;
  return run.roster.reduce((s, u) => s + u.level, 0) / run.roster.length;
}

export function recruit(run: RunWithEvent, heroId: string): Unit {
  const level = Math.max(1, Math.round(averageLevel(run)) - 1);
  const unit = withRng(run, (rng) => makeHeroUnit(heroId, nextUid(run), level, rng));
  run.roster.push(unit);
  for (const id of run.event?.type === 'recruit' ? run.event.offers : [heroId]) {
    if (!run.seenHeroes.includes(id)) run.seenHeroes.push(id);
  }
  run.stats.recruits++;
  run.event = undefined;
  return unit;
}

// ───────────────────────── Shop ─────────────────────────

export const TONIC_PRICE = 220;
export const REVIVE_PRICE = 450;

export function canEquip(unit: Unit, weaponId: string): boolean {
  return CLASSES[unit.classId].weapons.includes(WEAPONS[weaponId].type);
}

export function buyWeapon(run: RunWithEvent, weaponId: string, unitUid: string): boolean {
  const ev = run.event;
  const w = WEAPONS[weaponId];
  const unit = run.roster.find((u) => u.uid === unitUid);
  if (ev?.type !== 'shop' || !unit || run.gold < w.price || !canEquip(unit, weaponId) || ev.sold.includes(weaponId)) return false;
  run.gold -= w.price;
  unit.weaponId = weaponId;
  ev.sold.push(weaponId);
  return true;
}

export function buyRelic(run: RunWithEvent, relic: RelicId): boolean {
  const ev = run.event;
  const price = RELICS[relic].price;
  if (ev?.type !== 'shop' || run.gold < price || run.relics.includes(relic)) return false;
  run.gold -= price;
  run.relics.push(relic);
  ev.sold.push(relic);
  return true;
}

export function buyTonic(run: RunWithEvent, stat: StatKey, unitUid: string): boolean {
  const ev = run.event;
  const unit = run.roster.find((u) => u.uid === unitUid);
  const tag = `tonic:${stat}`;
  if (ev?.type !== 'shop' || !unit || run.gold < TONIC_PRICE || ev.sold.includes(tag)) return false;
  run.gold -= TONIC_PRICE;
  const amount = stat === 'hp' ? 5 : 2;
  unit.stats[stat] += amount;
  if (stat === 'hp') unit.hp += amount;
  ev.sold.push(tag);
  return true;
}

export function revive(run: RunWithEvent, unitUid: string): boolean {
  const idx = run.fallen.findIndex((u) => u.uid === unitUid);
  if (run.event?.type !== 'shop' || idx < 0 || run.gold < REVIVE_PRICE || run.roster.length >= MAX_ROSTER) return false;
  run.gold -= REVIVE_PRICE;
  const [u] = run.fallen.splice(idx, 1);
  run.roster.push({ ...u, hp: u.stats.hp });
  return true;
}

// ───────────────────────── Rest / treasure ─────────────────────────

/** Rest option A: one unit trains hard and gains a full level. */
export function restTrain(run: RunWithEvent, unitUid: string): LevelUp | null {
  const unit = run.roster.find((u) => u.uid === unitUid);
  if (!unit || run.event?.type !== 'rest') return null;
  const gains = withRng(run, (rng) => rollLevelUp(unit, rng));
  run.event = undefined;
  return { uid: unit.uid, name: unit.name, level: unit.level, gains };
}

/** Rest option B: everyone drills together for some XP. */
export function restDrill(run: RunWithEvent): LevelUp[] {
  if (run.event?.type !== 'rest') return [];
  const ups: LevelUp[] = [];
  withRng(run, (rng) => {
    for (const u of run.roster) {
      for (const gains of gainXp(u, 45, rng)) ups.push({ uid: u.uid, name: u.name, level: u.level, gains });
    }
  });
  run.event = undefined;
  return ups;
}

export function takeTreasure(run: RunWithEvent, relic: RelicId | null): void {
  const ev = run.event;
  if (ev?.type !== 'treasure') return;
  if (relic && ev.relics.includes(relic)) run.relics.push(relic);
  else run.gold += ev.gold;
  run.event = undefined;
}

// ───────────────────────── Persistence ─────────────────────────

const RUN_KEY = 'rwe.run.v1';
const META_KEY = 'rwe.meta.v1';

export interface Meta {
  runs: number;
  wins: number;
  bestDepth: number;
  discovered: string[];
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function saveRun(run: RunWithEvent | null): void {
  const s = storage();
  try {
    if (!run) s?.removeItem(RUN_KEY);
    else s?.setItem(RUN_KEY, JSON.stringify(run));
  } catch { /* storage full or blocked: play on without saving */ }
}

export function loadRun(): RunWithEvent | null {
  try {
    const raw = storage()?.getItem(RUN_KEY);
    return raw ? (JSON.parse(raw) as RunWithEvent) : null;
  } catch {
    return null;
  }
}

export function loadMeta(): Meta {
  try {
    const raw = storage()?.getItem(META_KEY);
    if (raw) return { runs: 0, wins: 0, bestDepth: 0, discovered: [], ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { runs: 0, wins: 0, bestDepth: 0, discovered: [] };
}

export function saveMeta(m: Meta): void {
  try {
    storage()?.setItem(META_KEY, JSON.stringify(m));
  } catch { /* ignore */ }
}
