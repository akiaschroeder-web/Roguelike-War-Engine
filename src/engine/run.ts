import {
  GEAR, ITEMS, BOSS_AS_TEMPLATE, BOSSES, bossPool, COMMANDERS, PERMANENT_ITEMS, REGION_IDS, TEMPLATE_LIST, TEMPLATES, WEAPONS,
} from '../data/registry';
import { createBattle } from './battle';
import { canWield, type LevelUp } from './combat';
import { RNG } from './rng';
import { ARMY_CAPACITY, DEPLOY_CAPACITY } from './rules';
import { addToPack, gainXp, makeHero, rollLevelUp, slotFor } from './units';
import type { BossDef, CommanderDef, GearSlot, MapNode, NodeType, Rarity, Run, RunMap, Unit, UnitTemplate, WorldId } from './types';

export const ROWS_PER_REGION = 7; // last row is the regional boss
export { ARMY_CAPACITY, DEPLOY_CAPACITY };

const ownedTemplateUnique = (id: string) => !!TEMPLATES[id] && !TEMPLATES[id].generic;

function withRng<T>(run: Run, fn: (rng: RNG) => T): T {
  const rng = new RNG(run.rngState);
  const out = fn(rng);
  run.rngState = rng.state;
  return out;
}

const nextUid = (run: Run) => `p${run.uidCounter++}`;

export function commanderOf(run: Run): CommanderDef {
  return COMMANDERS.find((c) => c.heroId === run.commanderId) ?? COMMANDERS[0];
}

export function newRun(seed: number, commanderId: string): RunWithEvent {
  const rng = new RNG(seed);
  const cmd = COMMANDERS.find((c) => c.heroId === commanderId) ?? COMMANDERS[0];
  const home = TEMPLATES[cmd.heroId].home;
  const region = home === 'hyruleCastle' ? 'hyruleField' : home;
  const run: RunWithEvent = {
    seed, rngState: 0, act: 1, region, regionsVisited: [region], map: { rows: 0, nodes: [] }, currentNodeId: null,
    roster: [], fallen: [], rupees: 200, convoy: [], commanderId: cmd.heroId, bonus: cmd.bonus,
    stats: { battles: 0, kills: 0, recruits: 0 }, seenHeroes: [cmd.heroId], bossesFought: [], uidCounter: 0,
  };
  const commander = makeHero(cmd.heroId, nextUid(run), 1, rng);
  commander.isCommander = true;
  run.roster.push(commander);
  for (const id of cmd.units) {
    run.roster.push(makeHero(id, nextUid(run), 1, rng));
    if (ownedTemplateUnique(id)) run.seenHeroes.push(id);
  }
  // Starting gear: the commander first, then whoever can use it; otherwise the convoy.
  run.convoy = [];
  for (const id of cmd.startingItems ?? []) {
    const taker = run.roster.find((u) => canTake(u, id) && (kindOf(id) !== 'gear' || !u.gear[slotFor(u, GEAR[id].slot)]));
    if (!taker || !give(run, id, taker.uid)) run.convoy.push(id);
  }
  run.map = generateRegionMap(rng, run.act, region);
  run.rngState = rng.state;
  return run;
}

export function generateRegionMap(rng: RNG, act: number, region: WorldId): RunMap {
  const nodes: MapNode[] = [];
  const rows: MapNode[][] = [];
  let id = 0;
  for (let r = 0; r < ROWS_PER_REGION; r++) {
    const isBossRow = r === ROWS_PER_REGION - 1;
    const count = isBossRow ? 1 : r === 0 ? rng.int(2, 3) : rng.int(2, 4);
    const row: MapNode[] = [];
    for (let i = 0; i < count; i++) {
      row.push({
        id: `a${act}n${id++}`, row: r, col: count === 1 ? 0.5 : (i + 0.5) / count + (rng.next() - 0.5) * 0.08,
        type: isBossRow ? 'boss' : pickNodeType(rng, r), world: region, next: [], visited: false,
      });
    }
    rows.push(row);
    nodes.push(...row);
  }
  for (let r = 0; r < ROWS_PER_REGION - 1; r++) {
    const cur = rows[r], nxt = rows[r + 1];
    for (const n of cur) {
      const sorted = [...nxt].sort((a, b) => Math.abs(a.col - n.col) - Math.abs(b.col - n.col));
      n.next.push(sorted[0].id);
      if (sorted[1] && rng.chance(45)) n.next.push(sorted[1].id);
    }
    for (const m of nxt) {
      if (!cur.some((n) => n.next.includes(m.id))) {
        [...cur].sort((a, b) => Math.abs(a.col - m.col) - Math.abs(b.col - m.col))[0].next.push(m.id);
      }
    }
  }
  return { rows: ROWS_PER_REGION, nodes };
}

function pickNodeType(rng: RNG, row: number): NodeType {
  if (row === 0) return 'battle';
  if (row === ROWS_PER_REGION - 2) return rng.weighted([['camp', 3], ['fountain', 2], ['shop', 2], ['battle', 1]]);
  return rng.weighted([
    ['battle', 42], ['recruit', 14], ['shop', 10], ['camp', 9], ['fountain', 6], ['treasure', 9], ['elite', row >= 2 ? 12 : 0],
  ]);
}

export function nodeById(run: Run, id: string): MapNode | undefined {
  return run.map.nodes.find((n) => n.id === id);
}

export function availableNodes(run: Run): MapNode[] {
  if (!run.currentNodeId) return run.map.nodes.filter((n) => n.row === 0);
  const cur = nodeById(run, run.currentNodeId);
  return cur ? cur.next.map((id) => nodeById(run, id)!).filter(Boolean) : [];
}

export function currentNode(run: Run): MapNode | undefined {
  return run.currentNodeId ? nodeById(run, run.currentNodeId) : undefined;
}

/** Overall depth; drives enemy scaling forever. */
export function depthOf(run: Run, node: MapNode): number {
  return (run.act - 1) * ROWS_PER_REGION + node.row;
}

// ───────────────────────── Events ─────────────────────────

export type ItemKindTag = 'weapon' | 'gear' | 'item' | 'permanent';
export type Reward = { kind: ItemKindTag; id: string };

export function kindOf(id: string): ItemKindTag | null {
  return WEAPONS[id] ? 'weapon' : GEAR[id] ? 'gear' : ITEMS[id] ? 'item' : PERMANENT_ITEMS[id] ? 'permanent' : null;
}

export type RunEvent =
  | { type: 'deploy'; nodeId: string }
  | { type: 'recruit'; offers: string[] }
  | { type: 'shop'; weapons: string[]; gear: string[]; items: string[]; permanents: string[]; sold: string[] }
  | { type: 'camp' }
  | { type: 'fountain' }
  | { type: 'treasure'; rewards: Reward[]; rupees: number }
  | { type: 'region'; options: WorldId[] };

export interface RunWithEvent extends Run {
  event?: RunEvent;
}

const RARITY_BY_REGION: Rarity[][] = [
  ['common', 'uncommon'],
  ['common', 'uncommon', 'rare'],
  ['uncommon', 'rare', 'epic'],
  ['rare', 'epic', 'legendary'],
];
const raritiesFor = (act: number) => RARITY_BY_REGION[Math.min(act, RARITY_BY_REGION.length) - 1];

/** Unique items already owned (equipped or in the convoy). */
export function ownedUniques(run: Run): Set<string> {
  const ids = [...run.convoy, ...run.roster.flatMap((u) => [...u.weapons, ...Object.values(u.gear)])];
  return new Set(ids.filter((id) => WEAPONS[id]?.unique || GEAR[id]?.unique));
}

function bossFor(run: Run, rng: RNG, node: MapNode): BossDef {
  // Bosses who serve in your army (or another form of them) don't fight you.
  const have = new Set(run.roster.map((u) => u.templateId));
  const exclude = new Set<string>();
  for (const b of Object.values(BOSSES)) {
    const t = TEMPLATES[BOSS_AS_TEMPLATE[b.id] ?? b.id];
    if (t && (have.has(t.id) || t.exclusiveWith?.some((id) => have.has(id)))) exclude.add(b.id);
  }
  let pool = bossPool(node.world).filter((b) => !exclude.has(b.id));
  if (!pool.length) pool = Object.values(BOSSES).filter((b) => !exclude.has(b.id));
  if (node.type === 'boss') {
    const fresh = pool.filter((b) => !run.bossesFought.includes(b.id));
    return fresh[0] ?? rng.pick(pool);
  }
  return rng.pick(pool);
}

export function enterNode(run: RunWithEvent, nodeId: string): void {
  const node = nodeById(run, nodeId);
  if (!node || !availableNodes(run).includes(node)) throw new Error('Node not available');
  run.currentNodeId = nodeId;
  node.visited = true;
  run.event = undefined;
  if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
    if (run.roster.length > DEPLOY_CAPACITY) run.event = { type: 'deploy', nodeId };
    else startBattle(run, run.roster.map((u) => u.uid));
    return;
  }
  withRng(run, (rng) => {
    switch (node.type) {
      case 'recruit':
        run.event = { type: 'recruit', offers: recruitOffers(run, rng, node.world) };
        break;
      case 'shop': {
        const rar = raritiesFor(run.act);
        const weapons = rng.shuffle(Object.values(WEAPONS).filter((w) => !w.unique && rar.includes(w.rarity))).slice(0, 5).map((w) => w.id);
        const gear = rng.shuffle(Object.values(GEAR).filter((a) => !a.unique && rar.includes(a.rarity))).slice(0, 4).map((a) => a.id);
        const items = rng.shuffle(Object.values(ITEMS).filter((i) => rar.includes(i.rarity) || i.rarity === 'common')).slice(0, 4).map((i) => i.id);
        const permanents = rng.shuffle(Object.keys(PERMANENT_ITEMS)).slice(0, 2);
        run.event = { type: 'shop', weapons, gear, items, permanents, sold: [] };
        break;
      }
      case 'camp':
        run.event = { type: 'camp' };
        break;
      case 'fountain':
        run.event = { type: 'fountain' };
        break;
      case 'treasure':
        run.event = { type: 'treasure', rewards: treasureRewards(run, rng), rupees: 100 + run.act * 60 };
        break;
    }
  });
}

/** Begin the battle at the current node with the chosen units. */
export function startBattle(run: RunWithEvent, uids: string[]): void {
  const node = currentNode(run)!;
  const chosen = run.roster.filter((u) => uids.includes(u.uid) || u.isCommander).slice(0, DEPLOY_CAPACITY);
  run.deployment = chosen.map((u) => u.uid);
  run.event = undefined;
  withRng(run, (rng) => {
    const boss = node.type === 'battle' ? undefined : bossFor(run, rng, node);
    if (boss) run.bossesFought.push(boss.id);
    run.battle = createBattle({
      world: node.world, nodeType: node.type, depth: depthOf(run, node), roster: chosen,
      seed: rng.int(0, 2 ** 31), boss, healMult: run.bonus === 'healing' ? 1.2 : 1,
    });
  });
}

function conflicts(run: Run, t: UnitTemplate): boolean {
  const have = new Set(run.roster.map((u) => u.templateId));
  return !!t.exclusiveWith?.some((id) => have.has(id))
    || run.roster.some((u) => u.templateId && TEMPLATES[u.templateId]?.exclusiveWith?.includes(t.id));
}

export function recruitOffers(run: Run, rng: RNG, world: WorldId): string[] {
  const have = new Set(run.roster.map((u) => u.templateId));
  // Every unit is in the pool. Named characters (heroes, villains, bosses) join once;
  // generic soldiers and creatures can join many times.
  const available = TEMPLATE_LIST.filter((t) => !t.generic && !have.has(t.id)
    && !run.fallen.some((f) => f.templateId === t.id) && !conflicts(run, t));
  const fresh = available.filter((t) => !run.seenHeroes.includes(t.id));
  const pool = fresh.length >= 2 ? fresh : available;
  const heroes = pool.filter((t) => !t.rare);
  const rares = rng.shuffle(pool.filter((t) => t.rare));
  const local = rng.shuffle(heroes.filter((t) => t.home === world));
  const other = rng.shuffle(heroes.filter((t) => t.home !== world));
  const offers = [...local.slice(0, 1), ...other].slice(0, 2).map((t) => t.id);
  // Bosses and villains turn up now and then (more often deeper in).
  if (rares.length && rng.chance(Math.min(60, 20 + run.act * 8))) {
    if (offers.length >= 2) offers[1] = rares[0].id;
    else offers.push(rares[0].id);
  }
  const generics = TEMPLATE_LIST.filter((t) => t.generic);
  const monsterWeight = run.bonus === 'monsters' ? 3 : 1;
  while (offers.length < 3 && generics.length) {
    const pick = rng.weighted(generics.map((t) => [t, t.monster ? monsterWeight : 2] as [UnitTemplate, number]));
    if (!offers.includes(pick.id)) offers.push(pick.id);
  }
  return offers;
}

function treasureRewards(run: Run, rng: RNG): Reward[] {
  const rar = raritiesFor(run.act + 1);
  const owned = ownedUniques(run);
  const pool: Reward[] = [
    ...Object.values(GEAR).filter((a) => rar.includes(a.rarity) && !owned.has(a.id)).map((a) => ({ kind: 'gear' as const, id: a.id })),
    ...Object.values(ITEMS).filter((i) => i.rarity !== 'common').map((i) => ({ kind: 'item' as const, id: i.id })),
    ...Object.values(WEAPONS).filter((w) => rar.includes(w.rarity) && w.type !== 'natural' && !owned.has(w.id) && w.id !== 'fairyLight').map((w) => ({ kind: 'weapon' as const, id: w.id })),
    ...Object.keys(PERMANENT_ITEMS).map((id) => ({ kind: 'permanent' as const, id })),
  ];
  return rng.shuffle(pool).slice(0, run.bonus === 'extraTreasure' ? 4 : 3);
}

export interface BattleSummary {
  won: boolean;
  rupees: number;
  fallen: Unit[];
  kills: number;
  drops: string[];
}

/** HP recovered after a battle (fraction of max HP). */
export const POST_BATTLE_HEAL = 0.2;

export function finishBattle(run: RunWithEvent): BattleSummary {
  const b = run.battle!;
  const won = b.result === 'won';
  const kills = b.fallen.filter((u) => u.team === 'enemy').length;
  const fallen = b.fallen.filter((u) => u.team === 'player');
  const survivors = new Map(b.units.filter((u) => u.team === 'player').map((u) => [u.uid, u]));
  const deployed = new Set(run.deployment ?? []);
  const heal = POST_BATTLE_HEAL + (run.bonus === 'postBattleHeal' ? 0.1 : 0);
  run.roster = run.roster
    .filter((u) => !fallen.some((f) => f.uid === u.uid))
    .map((u) => {
      const fought = survivors.get(u.uid);
      const next = fought ? { ...fought } : { ...u };
      // Benched units rest a little more than those who fought.
      const pct = deployed.has(u.uid) ? heal : heal + 0.2;
      next.hp = Math.min(next.stats.hp, next.hp + Math.ceil(next.stats.hp * pct));
      return { ...next, moved: false, acted: false, kills: 0, movedDist: 0, survivedOnce: false, statuses: [], buffs: [], mp: next.stats.mp, faroreMark: undefined };
    });
  run.fallen.push(...fallen.map((u) => ({ ...u, hp: 0 })));

  let rupees = 0;
  const drops: string[] = [];
  if (won) {
    rupees = Math.round(b.rewardRupees * (run.bonus === 'rupees' ? 1.25 : 1));
    run.rupees += rupees;
    withRng(run, (rng) => {
      const owned = ownedUniques(run);
      for (const boss of b.fallen.filter((u) => u.isBoss && u.bossId)) {
        const options = (BOSSES[boss.bossId!]?.drops ?? []).filter((id) => !owned.has(id));
        if (options.length) {
          const id = rng.pick(options);
          drops.push(id);
          run.convoy.push(id);
          owned.add(id);
        }
      }
    });
  }
  run.stats.battles++;
  run.stats.kills += kills;
  run.battle = undefined;
  run.deployment = undefined;
  return { won, rupees, fallen, kills, drops };
}

export function isRegionComplete(run: Run): boolean {
  const n = currentNode(run);
  return !!n && n.type === 'boss' && !run.battle;
}

/** After a regional boss: offer the next region to march on. */
export function offerRegions(run: RunWithEvent): void {
  withRng(run, (rng) => {
    const recent = run.regionsVisited.slice(-2);
    const options = rng.shuffle(REGION_IDS.filter((r) => !recent.includes(r))).slice(0, 3);
    run.event = { type: 'region', options };
  });
}

export function advanceRegion(run: RunWithEvent, region: WorldId): void {
  run.act++;
  run.region = region;
  run.regionsVisited.push(region);
  run.currentNodeId = null;
  run.event = undefined;
  withRng(run, (rng) => { run.map = generateRegionMap(rng, run.act, region); });
  run.rupees += 150;
}

export function averageLevel(run: Run): number {
  if (!run.roster.length) return 1;
  return run.roster.reduce((s, u) => s + u.level, 0) / run.roster.length;
}

export function recruitLevel(run: Run): number {
  return Math.max(1, Math.round(averageLevel(run)) - 1);
}

export function recruit(run: RunWithEvent, templateId: string): Unit | null {
  if (run.roster.length >= ARMY_CAPACITY) return null;
  const unit = withRng(run, (rng) => makeHero(templateId, nextUid(run), recruitLevel(run), rng));
  run.roster.push(unit);
  if (run.event?.type === 'recruit') {
    for (const id of run.event.offers) if (ownedTemplateUnique(id) && !run.seenHeroes.includes(id)) run.seenHeroes.push(id);
  }
  run.stats.recruits++;
  run.event = undefined;
  return unit;
}

// ───────────────────────── Items ─────────────────────────

export function weaponPrice(run: Run, id: string): number {
  const p = WEAPONS[id].price;
  return run.bonus === 'forging' ? Math.round(p * 0.75) : p;
}

/** Give a weapon to a unit (up to 5 carried), or to the convoy. */
export function giveWeapon(run: Run, id: string, uid: string | null): boolean {
  const u = uid ? run.roster.find((x) => x.uid === uid) : undefined;
  if (!u) { run.convoy.push(id); return true; }
  if (!canWield(u, WEAPONS[id])) return false;
  if (u.weapons.length >= 5) run.convoy.push(u.weapons.pop()!);
  u.weapons.push(id);
  return true;
}

/** Equip a gear piece in its slot; whatever was there goes to the convoy. */
export function giveGear(run: Run, id: string, uid: string | null): boolean {
  const u = uid ? run.roster.find((x) => x.uid === uid) : undefined;
  const def = GEAR[id];
  if (!def) return false;
  if (!u) { run.convoy.push(id); return true; }
  const slot = slotFor(u, def.slot);
  const old = u.gear[slot];
  if (old) run.convoy.push(old);
  u.gear[slot] = id;
  return true;
}

/** Put a consumable in a unit's pack, or the convoy if the pack is full. */
export function giveItem(run: Run, id: string, uid: string | null, uses?: number): boolean {
  const u = uid ? run.roster.find((x) => x.uid === uid) : undefined;
  if (!ITEMS[id]) return false;
  if (!u || !addToPack(u, id, uses)) run.convoy.push(id);
  return true;
}

export function usePermanent(run: Run, id: string, uid: string): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  const item = PERMANENT_ITEMS[id];
  if (!u || !item) return false;
  u.stats[item.stat] += item.amount;
  if (item.stat === 'hp') u.hp += item.amount;
  return true;
}

/** Give any kind of thing to a unit (or the convoy when uid is null). */
export function give(run: Run, id: string, uid: string | null): boolean {
  switch (kindOf(id)) {
    case 'weapon': return giveWeapon(run, id, uid);
    case 'gear': return giveGear(run, id, uid);
    case 'item': return giveItem(run, id, uid);
    case 'permanent': return uid ? usePermanent(run, id, uid) : false;
    default: return false;
  }
}

/** Can this unit take this thing right now? */
export function canTake(u: Unit, id: string): boolean {
  if (WEAPONS[id]) return canWield(u, WEAPONS[id]);
  return !!kindOf(id);
}

/** Equip or hand something from the convoy to a unit. */
export function equipFromConvoy(run: Run, index: number, uid: string): boolean {
  const id = run.convoy[index];
  if (!id) return false;
  run.convoy.splice(index, 1);
  const ok = give(run, id, uid);
  if (!ok) run.convoy.splice(index, 0, id);
  return ok;
}

export function stashWeapon(run: Run, uid: string, weaponId: string): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  if (!u || u.weapons.length <= 1) return false;
  const i = u.weapons.indexOf(weaponId);
  if (i < 0) return false;
  u.weapons.splice(i, 1);
  run.convoy.push(weaponId);
  return true;
}

export function stashGear(run: Run, uid: string, slot: GearSlot): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  const id = u?.gear[slot];
  if (!u || !id) return false;
  run.convoy.push(id);
  delete u.gear[slot];
  return true;
}

export function stashItem(run: Run, uid: string, index: number): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  const p = u?.pack[index];
  if (!u || !p) return false;
  u.pack.splice(index, 1);
  // Back to the convoy as whole bundles (leftover single uses are lost).
  const bundles = Math.max(1, Math.floor(p.uses / (ITEMS[p.id]?.uses ?? 1)));
  for (let i = 0; i < bundles; i++) run.convoy.push(p.id);
  return true;
}

/** Use an item from the pack outside battle: heal, or learn a spell/song/arrow. */
export function useItemOutside(run: Run, uid: string, index: number): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  const p = u?.pack[index];
  const def = p && ITEMS[p.id];
  if (!u || !p || !def || !canUseOutside(u, index)) return false;
  if (def.kind === 'learn') u.abilities.push(def.teaches!);
  else if (def.kind === 'heal' || def.kind === 'fullHeal') u.hp = Math.min(u.stats.hp, u.hp + (def.kind === 'fullHeal' ? u.stats.hp : def.power));
  // (MP refills at the start of every battle, so MP items are only useful in battle.)
  if (--p.uses <= 0) u.pack.splice(index, 1);
  return true;
}

export function canUseOutside(u: Unit, index: number): boolean {
  const def = ITEMS[u.pack[index]?.id];
  if (!def) return false;
  if (def.kind === 'learn') return !!def.teaches && !u.abilities.includes(def.teaches);
  if (def.kind === 'heal' || def.kind === 'fullHeal') return u.hp < u.stats.hp;
  return false;
}

/** Great Fairy spells a unit could still learn. */
export function unlearnedFairySpells(u: Unit): string[] {
  return ['dinsFire', 'faroresWind', 'nayrusLove'].filter((id) => !u.abilities.includes(id));
}

/** Fountain option: the Great Fairy teaches one of her spells. */
export function fountainTeach(run: RunWithEvent, uid: string): string | null {
  const u = run.roster.find((x) => x.uid === uid);
  if (!u || run.event?.type !== 'fountain') return null;
  const options = unlearnedFairySpells(u);
  if (!options.length) return null;
  const id = withRng(run, (rng) => rng.pick(options));
  u.abilities.push(id);
  run.event = undefined;
  return id;
}

export function priceOf(run: Run, kind: ItemKindTag, id: string): number {
  if (kind === 'weapon') return weaponPrice(run, id);
  if (kind === 'gear') return GEAR[id].price;
  if (kind === 'item') return ITEMS[id].price;
  return PERMANENT_ITEMS[id].price;
}

export function buy(run: RunWithEvent, kind: ItemKindTag, id: string, uid: string | null): boolean {
  const ev = run.event;
  // Consumables can be bought repeatedly; everything else once.
  if (ev?.type !== 'shop' || (kind !== 'item' && ev.sold.includes(`${kind}:${id}`))) return false;
  const price = priceOf(run, kind, id);
  if (run.rupees < price) return false;
  if (!give(run, id, uid)) return false;
  run.rupees -= price;
  if (kind !== 'item') ev.sold.push(`${kind}:${id}`);
  return true;
}

// ───────────────────────── Camp / fountain / treasure ─────────────────────────

export function campRest(run: RunWithEvent): void {
  for (const u of run.roster) u.hp = Math.min(u.stats.hp, u.hp + Math.ceil(u.stats.hp * 0.5));
  run.event = undefined;
}

export function campTrain(run: RunWithEvent, uid: string): LevelUp | null {
  const unit = run.roster.find((u) => u.uid === uid);
  if (!unit || run.event?.type !== 'camp') return null;
  const gains = withRng(run, (rng) => rollLevelUp(unit, rng));
  run.event = undefined;
  return { uid: unit.uid, name: unit.name, level: unit.level, gains };
}

export function campDrill(run: RunWithEvent): LevelUp[] {
  if (run.event?.type !== 'camp') return [];
  const ups: LevelUp[] = [];
  withRng(run, (rng) => {
    for (const u of run.roster) for (const gains of gainXp(u, 45, rng)) ups.push({ uid: u.uid, name: u.name, level: u.level, gains });
  });
  run.event = undefined;
  return ups;
}

export function fountainHeal(run: RunWithEvent): void {
  for (const u of run.roster) u.hp = u.stats.hp;
  run.event = undefined;
}

export function fountainRevive(run: RunWithEvent, uid: string): boolean {
  const i = run.fallen.findIndex((u) => u.uid === uid);
  if (i < 0 || run.roster.length >= ARMY_CAPACITY) return false;
  const [u] = run.fallen.splice(i, 1);
  run.roster.push({ ...u, hp: u.stats.hp });
  run.event = undefined;
  return true;
}

/** The Great Fairy grants one unit a random permanent enhancement. */
export function fountainBless(run: RunWithEvent, uid: string): string | null {
  const ids = Object.keys(PERMANENT_ITEMS);
  const id = withRng(run, (rng) => rng.pick(ids));
  if (!usePermanent(run, id, uid)) return null;
  run.event = undefined;
  return id;
}

export function takeTreasure(run: RunWithEvent, index: number | null, uid: string | null): boolean {
  const ev = run.event;
  if (ev?.type !== 'treasure') return false;
  if (index === null) {
    run.rupees += ev.rupees;
  } else {
    const r = ev.rewards[index];
    if (!r) return false;
    if (!give(run, r.id, uid)) return false;
  }
  run.event = undefined;
  return true;
}

// ───────────────────────── Persistence ─────────────────────────

const RUN_KEY = 'hyrule.run.v1';
const META_KEY = 'hyrule.meta.v1';

export interface Meta {
  runs: number;
  bestDepth: number;
  bestRegion: number;
  discovered: string[];
  bossesDefeated: string[];
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function saveRun(run: RunWithEvent | null): void {
  try {
    if (!run) storage()?.removeItem(RUN_KEY);
    else storage()?.setItem(RUN_KEY, JSON.stringify(run));
  } catch { /* storage full or blocked */ }
}

export function loadRun(): RunWithEvent | null {
  try {
    const raw = storage()?.getItem(RUN_KEY);
    return raw ? migrateRun(JSON.parse(raw) as RunWithEvent) : null;
  } catch {
    return null;
  }
}

export function loadMeta(): Meta {
  const empty: Meta = { runs: 0, bestDepth: 0, bestRegion: 0, discovered: [], bossesDefeated: [] };
  try {
    const raw = storage()?.getItem(META_KEY);
    if (raw) return { ...empty, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return empty;
}

export function saveMeta(m: Meta): void {
  try {
    storage()?.setItem(META_KEY, JSON.stringify(m));
  } catch { /* ignore */ }
}

/** Bring saves from older versions up to date (single accessory slot, no pack). */
export function migrateRun(run: RunWithEvent): RunWithEvent {
  const fix = (u: Unit & { accessory?: string; stunned?: number }) => {
    u.gear ??= {};
    u.pack ??= [];
    u.mp ??= u.stats.mp;
    u.statuses ??= [];
    u.buffs ??= [];
    if (!u.abilities) {
      const t = u.templateId ? TEMPLATES[u.templateId] : undefined;
      u.abilities = [...(t?.abilities ?? [])];
    }
    if (u.stunned) u.statuses.push({ kind: 'stun', turns: u.stunned });
    delete u.stunned;
    if (u.accessory) {
      u.gear.acc1 = u.accessory;
      delete u.accessory;
    }
  };
  run.roster.forEach(fix);
  run.fallen.forEach(fix);
  run.battle?.units.forEach(fix);
  run.battle?.fallen.forEach(fix);
  const ev = run.event as (RunEvent & { accessories?: string[] }) | undefined;
  if (ev?.type === 'shop') {
    ev.gear ??= ev.accessories ?? [];
    ev.items ??= [];
  }
  if (ev?.type === 'treasure') {
    for (const r of ev.rewards) if ((r.kind as string) === 'accessory') r.kind = 'gear';
  }
  return run;
}
