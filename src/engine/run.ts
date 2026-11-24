import {
  EVENTS, FACTIONS, GEAR, QUEST_ITEMS, RACES, WORLDS, ITEMS, MONSTER_CHANCE, BOSSES, bossPool, COMMANDERS, PERMANENT_ITEMS, REGION_IDS, TEMPLATE_LIST, TEMPLATES, WEAPONS,
} from '../data/registry';
import { createBattle } from './battle';
import { isSPair, rankOf, supportKey, type SupportRank } from './supports';
import { restoreForm } from './transform';
import { canWield, type LevelUp } from './combat';
import { RNG } from './rng';
import { ARMY_CAPACITY, DEPLOY_CAPACITY } from './rules';
import { adjustMorale, adjustReputation, applyArmyBuffs, armyCap, armyOf, deployCap, gainArmyXp, newArmy, repDiscount, supplyCap } from './army';
import { prepareForBattle } from './units';
import { emptyProgress, type MetaProgress } from './meta';
import { addToPack, canRide, forgeLevel, gainXp, makeHero, maxUses, rollLevelUp, slotFor } from './units';
import type { Battle, BossDef, CommanderDef, EventDef, EventEffect, EventOutcome, EventRequires, EnemyForce, FactionDef, GearSlot, MapNode, NodeType, Rarity, Run, RunMap, Unit, UnitTemplate, WorldId } from './types';

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

export function newRun(seed: number, commanderId: string, campaign?: 'hyrule' | 'termina'): RunWithEvent {
  const rng = new RNG(seed);
  const cmd = COMMANDERS.find((c) => c.heroId === commanderId) ?? COMMANDERS[0];
  const camp = campaign ?? cmd.campaign ?? 'hyrule';
  const home = TEMPLATES[cmd.heroId].home;
  // Hyrule campaigns start in the commander's home region; Termina always starts in Clock Town.
  const region = camp === 'termina' ? 'clockTown' : WORLDS[home]?.campaign === 'termina' ? 'hyruleField' : home === 'hyruleCastle' ? 'hyruleField' : home;
  const run: RunWithEvent = {
    seed, rngState: 0, act: 1, region, regionsVisited: [region], map: { rows: 0, nodes: [] }, currentNodeId: null,
    roster: [], fallen: [], rupees: 200, convoy: [], commanderId: cmd.heroId, bonus: cmd.bonus,
    stats: { battles: 0, kills: 0, recruits: 0 }, seenHeroes: [cmd.heroId], bossesFought: [], uidCounter: 0, army: newArmy(),
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
  run.campaign = camp;
  if (camp === 'termina') { run.clock = { hours: 0, resets: 0 }; run.bank = 0; run.questItems = []; }
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
    ['battle', 34], ['recruit', 12], ['shop', 9], ['camp', 8], ['fountain', 5], ['treasure', 7], ['blacksmith', 6], ['elite', row >= 2 ? 10 : 0],
    ['event', 10], ['ambush', row >= 1 ? 6 : 0], ['siege', row >= 2 ? 5 : 0], ['dungeon', row >= 2 && row <= ROWS_PER_REGION - 3 ? 4 : 0],
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
  | { type: 'region'; options: WorldId[] }
  | { type: 'blacksmith'; forgeOffers: string[]; sold: string[] }
  | { type: 'event'; eventId: string; result?: { text: string; lines: string[] } }
  | { type: 'dungeon'; floor: number; of: number }
  | { type: 'moonfall' };

/** Node types that are fought. */
export const BATTLE_NODES: NodeType[] = ['battle', 'elite', 'ambush', 'siege', 'dungeon', 'boss'];
export const DUNGEON_FLOORS = 3;

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

function bossPower(b: BossDef): number {
  const s = b.stats;
  return s.hp + 2 * (Math.max(s.str, s.mag) + s.def + s.res + s.spd) + 20 * ((b.size ?? 1) - 1);
}

function bossFor(run: Run, rng: RNG, node: MapNode): BossDef {
  // Not canon: anyone can be a boss, even someone already in your army.
  // After the free-for-all point, bosses come from every region.
  let pool = isFreeForAll(run) ? Object.values(BOSSES) : bossPool(node.world);
  if (!pool.length) pool = Object.values(BOSSES);
  if (node.type === 'boss') {
    const fresh = pool.filter((b) => !run.bossesFought.includes(b.id));
    const choices = fresh.length ? fresh : pool;
    // The first regional boss is the region's weakest; tougher ones come later.
    const graded = [...choices].sort((a, b) => bossPower(a) - bossPower(b));
    if (run.act === 1) return graded[0];
    if (run.act === 2) return rng.pick(graded.slice(0, Math.max(1, Math.ceil(graded.length / 2))));
    return rng.pick(choices);
  }
  return rng.pick(pool);
}

export function enterNode(run: RunWithEvent, nodeId: string): void {
  const node = nodeById(run, nodeId);
  if (!node || !availableNodes(run).includes(node)) throw new Error('Node not available');
  run.currentNodeId = nodeId;
  node.visited = true;
  run.event = undefined;
  if (advanceClock(run, hoursFor(node.type))) { run.event = { type: 'moonfall' }; return; }
  if (BATTLE_NODES.includes(node.type)) {
    if (node.type === 'dungeon') run.dungeon = { floor: 1, of: DUNGEON_FLOORS };
    marchToBattle(run);
    return;
  }
  gainArmyXp(run, 8);
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
      case 'blacksmith': {
        const rar = raritiesFor(run.act + 1);
        const forgeOffers = rng.shuffle(Object.values(WEAPONS).filter((w) => !w.unique && w.type !== 'instrument' && rar.includes(w.rarity))).slice(0, 3).map((w) => w.id);
        run.event = { type: 'blacksmith', forgeOffers, sold: [] };
        break;
      }
      case 'fountain':
        run.event = { type: 'fountain' };
        break;
      case 'treasure':
        run.event = { type: 'treasure', rewards: treasureRewards(run, rng), rupees: 100 + run.act * 60 };
        break;
      case 'event': {
        const pool = Object.values(EVENTS).filter((e) => (!e.regions || e.regions.includes(node.world)) && meetsRequires(run, e.requires));
        const fresh = pool.filter((e) => !(run.eventsSeen ?? []).includes(e.id));
        const ev = rng.pick(fresh.length ? fresh : pool);
        (run.eventsSeen ??= []).push(ev.id);
        run.event = { type: 'event', eventId: ev.id };
        break;
      }
    }
  });
}

/** Go to deployment (if the army is bigger than the field) or straight into battle. */
export function marchToBattle(run: RunWithEvent): void {
  const node = currentNode(run)!;
  if (run.roster.length > deployCap(run)) run.event = { type: 'deploy', nodeId: node.id };
  else startBattle(run, run.roster.map((u) => u.uid));
}

/** The kind of battle actually fought at a node (dungeon floors are battles, the last one an elite). */
export function battleKind(run: Run, node: MapNode): NodeType {
  if (node.type !== 'dungeon') return node.type;
  return run.dungeon && run.dungeon.floor >= run.dungeon.of ? 'elite' : 'battle';
}

/** Begin the battle at the current node with the chosen units. */
export function startBattle(run: RunWithEvent, uids: string[]): void {
  const node = currentNode(run)!;
  const kind = battleKind(run, node);
  const floorBonus = node.type === 'dungeon' ? (run.dungeon?.floor ?? 1) - 1 : 0;
  const chosen = run.roster.filter((u) => uids.includes(u.uid) || u.isCommander).slice(0, deployCap(run));
  run.deployment = chosen.map((u) => u.uid);
  run.event = undefined;
  withRng(run, (rng) => {
    const force = pickForce(run, rng, node, kind);
    const boss = (kind !== 'elite' && kind !== 'boss') || force?.leader ? undefined : bossFor(run, rng, node);
    if (boss) run.bossesFought.push(boss.id);
    run.battle = createBattle({
      world: node.world, nodeType: node.type === 'dungeon' ? kind : node.type, depth: depthOf(run, node) + floorBonus, roster: chosen,
      seed: rng.int(0, 2 ** 31), boss, healMult: run.bonus === 'healing' ? 1.2 : 1, force, supports: run.supports, trials: run.trials,
      levelBonus: (run.clock?.resets ?? 0) * 2 + (run.clock && clockLabel(run).day === 3 ? 1 : 0),
      gearOwned: [...ownedGear(run)],
    });
    run.battle.bonus = run.bonus;
    run.battle.night = run.clock ? clockLabel(run).night : true;
    run.battle.statusBonus = run.bonus === 'lingeringStatus' ? 1 : 0;
    run.battle.reserves = run.roster.filter((u) => !chosen.includes(u)).map((u) => ({ ...prepareForBattle(u), x: -1, y: -1 }));
    applyArmyBuffs(run, run.battle);
  });
}

/**
 * Who you fight: the region's monsters, a regional army (Gerudo, Gorons, Zora…),
 * an army mixed with monsters, or a band of rival heroes. Regional bosses stay
 * monsters/villains; elite fights can be led by a named character.
 */
/** From this region on, battles ignore regions and draw units from anywhere. */
export const FREE_FOR_ALL_REGION = 4;

export function isFreeForAll(run: Run): boolean {
  return run.act >= FREE_FOR_ALL_REGION;
}

/** A force drawn from the entire cast: any monster, soldier, hero, villain or boss. */
function freeForAll(rng: RNG, kind: NodeType): EnemyForce {
  const named = TEMPLATE_LIST.filter((t) => !t.generic).map((t) => t.id);
  return {
    name: 'Free-for-All', desc: 'The war has scattered everyone across Hyrule. Anyone could be on the other side.',
    templates: TEMPLATE_LIST.map((t) => t.id), monsters: true, anyMonsters: true,
    heroes: rng.shuffle([...named]).slice(0, rng.int(0, 3)),
    leader: (kind === 'elite' || kind === 'siege') && rng.chance(60) ? rng.pick(named) : undefined,
  };
}

export function pickForce(run: Run, rng: RNG, node: MapNode, kind: NodeType = node.type): EnemyForce | undefined {
  if (isFreeForAll(run)) return freeForAll(rng, kind);
  if (kind === 'boss') return rng.chance(40) ? armyFor(run, rng, node, false) : undefined;
  // Sieges are always against an army holding a keep.
  if (kind !== 'siege' && rng.chance(MONSTER_CHANCE[node.world] ?? 50)) return undefined;
  return armyFor(run, rng, node, (kind === 'elite' || kind === 'siege') && rng.chance(60)) ?? undefined;
}

function armyFor(_run: Run, rng: RNG, node: MapNode, withLeader: boolean): EnemyForce | undefined {
  // Duplicates are fine: rivals and leaders can be characters you already have.
  const free = (id: string) => !!TEMPLATES[id];
  if (rng.chance(12) && FACTIONS.rivals) {
    const pool = TEMPLATE_LIST.filter((t) => !t.generic && !t.rare && free(t.id)).map((t) => t.id);
    const heroes = rng.shuffle(pool).slice(0, 4);
    const generics = TEMPLATE_LIST.filter((t) => t.generic && !t.monster).map((t) => t.id);
    return { name: FACTIONS.rivals.name, desc: FACTIONS.rivals.desc, templates: generics, heroes, monsters: false,
      leader: withLeader ? rng.shuffle(pool.filter((id) => !heroes.includes(id)))[0] : undefined };
  }
  const options = Object.values(FACTIONS).filter((f) => !f.rivals && (f.regions[node.world] ?? 0) > 0);
  if (!options.length) return undefined;
  const f = rng.weighted(options.map((o) => [o, o.regions[node.world]] as [FactionDef, number]));
  const leaders = f.leaders.filter(free);
  return {
    name: f.name, desc: f.desc, templates: f.units.filter((id) => TEMPLATES[id]), monsters: rng.chance(30),
    leader: withLeader && leaders.length ? rng.pick(leaders) : undefined,
  };
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
  const day = run.clock ? clockLabel(run).day : 0;
  const available = TEMPLATE_LIST.filter((t) => !t.generic && !have.has(t.id)
    && !run.fallen.some((f) => f.templateId === t.id) && !conflicts(run, t)
    && (!day || !TERMINA_SCHEDULE[t.id] || TERMINA_SCHEDULE[t.id].includes(day)));
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
  const owned = ownedGear(run);
  const undeadBoost = run.bonus === 'undeadArmy' || owned.has('captainsHat');
  const beastBoost = owned.has('bremenMask') || owned.has('maskOfTruth');
  const weightOf = (t: UnitTemplate) => {
    let wgt = t.monster ? monsterWeight : 2;
    if (run.bonus === 'dekuArmy' && t.race === 'deku') wgt *= 3;
    if (undeadBoost && t.race === 'undead') wgt *= 3;
    if (beastBoost && RACES[t.race]?.tags?.includes('beast')) wgt *= 2;
    return wgt;
  };
  while (offers.length < 3 && generics.length) {
    const pick = rng.weighted(generics.map((t) => [t, weightOf(t)] as [UnitTemplate, number]));
    if (!offers.includes(pick.id)) offers.push(pick.id);
  }
  return offers;
}

function treasureRewards(run: Run, rng: RNG, better = false): Reward[] {
  const rar = raritiesFor(run.act + (better ? 2 : 1));
  const owned = ownedUniques(run);
  const pool: Reward[] = [
    ...Object.values(GEAR).filter((a) => rar.includes(a.rarity) && !owned.has(a.id)).map((a) => ({ kind: 'gear' as const, id: a.id })),
    ...Object.values(ITEMS).filter((i) => i.rarity !== 'common').map((i) => ({ kind: 'item' as const, id: i.id })),
    ...Object.values(WEAPONS).filter((w) => rar.includes(w.rarity) && w.type !== 'natural' && !owned.has(w.id) && w.id !== 'fairyLight').map((w) => ({ kind: 'weapon' as const, id: w.id })),
    ...Object.keys(PERMANENT_ITEMS).map((id) => ({ kind: 'permanent' as const, id })),
  ];
  return rng.shuffle(pool).slice(0, (run.bonus === 'extraTreasure' ? 4 : 3) + (better ? 1 : 0));
}

export interface BattleSummary {
  won: boolean;
  rupees: number;
  fallen: Unit[];
  kills: number;
  drops: string[];
  /** Changes to army resources. */
  army: ArmyReport;
  /** Items found on the battlefield (sent to packs or the convoy). */
  found: string[];
  /** Rescued prisoners who joined the army. */
  joined: string[];
  /** Side quest result, if there was one. */
  sideQuest?: { text: string; done: boolean; reward: string };
  /** The objective was lost but the army escaped. */
  retreated?: boolean;
  /** Dungeon: next floor (or cleared). */
  dungeon?: { floor: number; of: number; cleared: boolean };
  /** Support ranks reached this battle. */
  supportUps: { a: string; b: string; aUid: string; bUid: string; rank: SupportRank }[];
}

/** HP recovered after a battle (fraction of max HP). */
export const POST_BATTLE_HEAL = 0.2;

export function finishBattle(run: RunWithEvent): BattleSummary {
  const b = run.battle!;
  const won = b.result === 'won';
  const kills = b.fallen.filter((u) => u.team === 'enemy').length;
  // Undo transformations: Ganon becomes Ganondorf again; Twinrova splits back
  // into Koume and Kotake (both fall if Twinrova fell).
  const split = (u: Unit): Unit[] => {
    const partner = u.fusedPartner;
    const me = restoreForm(u);
    if (!partner) return [me];
    const ratio = me.hp > 0 ? me.hp / me.stats.hp : 0;
    return [me, { ...partner, hp: me.hp > 0 ? Math.max(1, Math.ceil(partner.stats.hp * ratio)) : 0 }];
  };
  const fallen = b.fallen.filter((u) => u.team === 'player' && !u.npc).flatMap(split);
  const survivors = new Map([...b.units, ...(b.withdrawn ?? [])].filter((u) => u.team === 'player' && !u.npc).flatMap(split).map((u) => [u.uid, u]));
  const deployed = new Set(run.deployment ?? []);
  const heal = run.trials?.includes('wounds') ? 0 : (armyOf(run).supplies > 0 ? POST_BATTLE_HEAL : 0.05) + (run.bonus === 'postBattleHeal' ? 0.1 : 0);
  run.roster = run.roster
    .filter((u) => !fallen.some((f) => f.uid === u.uid))
    .map((u) => {
      const fought = survivors.get(u.uid);
      const next = fought ? { ...fought } : { ...u };
      // Back on foot-size bookkeeping after the battle.
      next.size = u.baseSize ?? u.size;
      delete next.baseSize;
      delete next.mounted;
      // Benched units rest a little more than those who fought.
      const pct = deployed.has(u.uid) ? heal : heal + 0.2;
      next.hp = Math.min(next.stats.hp, next.hp + Math.ceil(next.stats.hp * pct));
      return { ...next, moved: false, acted: false, kills: 0, movedDist: 0, survivedOnce: false, statuses: [], buffs: [], mp: next.stats.mp, sta: next.stats.sta, faroreMark: undefined, cooldowns: {}, maskForm: undefined, maskTurn: undefined, usedAbilities: [] };
    });
  run.fallen.push(...fallen.map((u) => ({ ...u, hp: 0 })));
  // Victory experience for everyone who fought and lived (bigger for tougher fights).
  if (won) {
    const bonus = { boss: 40, elite: 30, siege: 30, ambush: 25 }[b.nodeType as string] ?? 20;
    withRng(run, (rng) => {
      for (const u of run.roster) if (survivors.has(u.uid)) gainXp(u, bonus, rng);
    });
  }

  let rupees = 0;
  const drops: string[] = [];
  const found: string[] = [];
  const joined: string[] = [];
  if (won) {
    const badge = ownedGear(run).has('bombersBadge') ? 1.1 : 1;
    rupees = Math.round(b.rewardRupees * (run.bonus === 'rupees' ? 1.25 : 1) * badge) + (b.bonusRupees ?? 0);
    run.rupees += rupees;
    // Things found on the field (digging, fishing)
    for (const id of b.loot ?? []) { giveItem(run, id, null); found.push(id); }
    // Talon's Ranch Supplies
    for (const u of run.roster) {
      if (!u.skills.includes('ranchSupplies')) continue;
      for (let i = 0; i < 2; i++) giveItem(run, 'lonLonMilk', u.uid);
      found.push('lonLonMilk', 'lonLonMilk');
    }
    // Freed prisoners join (if there's room)
    withRng(run, (rng) => {
      for (const c of [...b.units.filter((x) => x.rescued), ...(b.purified ?? [])]) {
        if (run.roster.length >= armyCap(run) || !c.templateId) continue;
        if (!TEMPLATES[c.templateId]?.generic && run.roster.some((r) => r.templateId === c.templateId)) continue;
        const u = makeHero(c.templateId, nextUid(run), recruitLevel(run), rng);
        run.roster.push(u);
        run.stats.recruits++;
        joined.push(u.name);
      }
    });
    withRng(run, (rng) => {
      const owned = ownedUniques(run);
      for (const boss of b.fallen.filter((u) => u.isBoss && u.bossId)) {
        const options = (BOSSES[boss.bossId!]?.drops ?? []).filter((id) => !owned.has(id));
        if (options.length) {
          const id = options.find((x) => x.endsWith('Remains')) ?? rng.pick(options); // Boss Remains always drop first
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
  // Supports: keep the new points and report rank-ups.
  const supportUps: BattleSummary['supportUps'] = [];
  const before = run.supports ?? {};
  const after = { ...before, ...(b.supports ?? {}) };
  const byUid = new Map([...run.roster, ...run.fallen].map((u) => [u.uid, u]));
  for (const [k, pts] of Object.entries(after)) {
    const [x, y] = k.split('|');
    const ux = byUid.get(x), uy = byUid.get(y);
    if (!ux || !uy) continue;
    const s = isSPair(ux, uy);
    const r = rankOf(pts, s);
    if (r && r !== rankOf(before[k] ?? 0, s)) supportUps.push({ a: ux.name, b: uy.name, aUid: ux.uid, bUid: uy.uid, rank: r });
  }
  run.supports = after;

  // Side quest
  let sideQuest: BattleSummary['sideQuest'];
  const sq = b.sideQuest;
  if (sq) {
    const done = won && (sq.kind === 'fast' ? b.turn <= (sq.turns ?? 99) : fallen.length === 0);
    const parts = [`₹${sq.rupees}`, ...(sq.item && ITEMS[sq.item] ? [ITEMS[sq.item].name] : [])];
    if (done) {
      run.rupees += sq.rupees;
      rupees += sq.rupees;
      if (sq.item) giveItem(run, sq.item, null);
    }
    sideQuest = { text: sideQuestText(sq), done, reward: parts.join(' + ') };
  }

  // Dungeon: on to the next floor, or the vault at the bottom.
  let dungeon: BattleSummary['dungeon'];
  const node = currentNode(run);
  if (run.dungeon && node?.type === 'dungeon') {
    if (!won) delete run.dungeon;
    else if (run.dungeon.floor < run.dungeon.of) {
      run.dungeon.floor++;
      dungeon = { ...run.dungeon, cleared: false };
      run.event = { type: 'dungeon', floor: run.dungeon.floor, of: run.dungeon.of };
    } else {
      dungeon = { ...run.dungeon, cleared: true };
      delete run.dungeon;
      withRng(run, (rng) => { run.event = { type: 'treasure', rewards: treasureRewards(run, rng, true), rupees: 250 + run.act * 100 }; });
    }
  }
  const army = armyAfterBattle(run, b, won, fallen.length, deployed.size || survivors.size);
  return { won, rupees, fallen, kills, drops, supportUps, sideQuest, retreated: !won && !!b.retreat, dungeon, found, joined, army };
}

export interface ArmyReport {
  xp: number;
  levelUps: number;
  supplies: number;
  materials: number;
  morale: number;
  reputation: number;
  fairyDust: number;
  sacredEnergy: number;
  starving: boolean;
}

/** Supplies eaten, materials salvaged, morale and reputation, army experience. */
function armyAfterBattle(run: Run, b: Battle, won: boolean, losses: number, deployed: number): ArmyReport {
  const a = armyOf(run);
  const before = { ...a };
  const eat = 1 + Math.ceil(deployed / 3);
  const starving = a.supplies < eat;
  a.supplies = Math.max(0, a.supplies - eat);
  const kind = b.nodeType;
  const rng = new RNG(b.rngState);
  if (won) {
    a.materials += rng.int(1, 3) + (kind === 'elite' || kind === 'siege' ? 3 : kind === 'boss' ? 6 : 0);
    a.supplies = Math.min(supplyCap(run), a.supplies + rng.int(2, 5));
    adjustMorale(run, 5 + (losses === 0 ? 3 : 0));
    adjustReputation(run, 2 + (b.objective.type === 'rescue' || b.objective.type === 'escort' ? 4 : 0));
    const bosses = b.fallen.filter((u) => u.team === 'enemy' && u.isBoss).length;
    a.sacredEnergy += kind === 'boss' ? 1 : 0;
    if (bosses && rng.chance(kind === 'boss' ? 100 : 35)) a.fairyDust++;
  } else {
    adjustMorale(run, -10);
  }
  adjustMorale(run, -8 * losses);
  if (starving) adjustMorale(run, -10);
  const xp = won ? (kind === 'boss' ? 60 : kind === 'elite' || kind === 'siege' ? 35 : 20) : 8;
  const levelUps = gainArmyXp(run, xp);
  return {
    xp, levelUps, starving,
    supplies: a.supplies - before.supplies, materials: a.materials - before.materials, morale: a.morale - before.morale,
    reputation: a.reputation - before.reputation, fairyDust: a.fairyDust - before.fairyDust, sacredEnergy: a.sacredEnergy - before.sacredEnergy,
  };
}

export function sideQuestText(sq: { kind: string; turns?: number }): string {
  return sq.kind === 'fast' ? `Win within ${sq.turns} turns` : 'Win without losing a unit';
}

/** Dungeon: continue to the next floor. */
export function descendDungeon(run: RunWithEvent): void {
  if (run.event?.type !== 'dungeon') return;
  run.event = undefined;
  marchToBattle(run);
}

/** Dungeon: give up and leave with what you have. */
export function leaveDungeon(run: RunWithEvent): void {
  delete run.dungeon;
  run.event = undefined;
}

// ───────────────────────── Random events ─────────────────────────

export function eventDef(run: RunWithEvent): EventDef | undefined {
  return run.event?.type === 'event' ? EVENTS[run.event.eventId] : undefined;
}

export function canChoose(run: Run, def: EventDef, index: number): boolean {
  const c = def.choices[index];
  return !!c && run.rupees >= (c.cost ?? 0) && meetsRequires(run, c.requires);
}

/** Every piece of equipment the army owns (worn or in the convoy). */
export function ownedGear(run: Run): Set<string> {
  return new Set([...run.convoy, ...run.roster.flatMap((u) => [...u.weapons, ...Object.values(u.gear ?? {}).filter((x): x is string => !!x)])]);
}

export function meetsRequires(run: Run, r: EventRequires | undefined): boolean {
  if (!r) return true;
  const q = run.questItems ?? [];
  if (r.quest && !r.quest.every((id) => q.includes(id))) return false;
  if (r.noQuest && r.noQuest.some((id) => q.includes(id))) return false;
  const owned = ownedGear(run);
  if (r.gear && !r.gear.every((id) => owned.has(id))) return false;
  if (r.noGear && r.noGear.some((id) => owned.has(id))) return false;
  if (r.maskCount && [...owned].filter((id) => GEAR[id]?.slot === 'head' && /mask|hat|hood/i.test(GEAR[id].name)).length < r.maskCount) return false;
  return true;
}

/** Add a quest item. The Sun's and Moon's Masks combine into the Couple's Mask. */
export function addQuestItem(run: Run, id: string) {
  const q = (run.questItems ??= []);
  q.push(id);
  if (q.includes('sunsMask') && q.includes('moonsMask')) {
    run.questItems = q.filter((x) => x !== 'sunsMask' && x !== 'moonsMask');
    if (!ownedGear(run).has('couplesMask')) run.convoy.push('couplesMask');
  }
}

/** Pick an event choice: pay, roll a gamble, apply effects. Returns the result shown to the player. */
export function chooseEvent(run: RunWithEvent, index: number): { text: string; lines: string[] } | null {
  const ev = run.event;
  const def = eventDef(run);
  if (ev?.type !== 'event' || !def || ev.result || !canChoose(run, def, index)) return null;
  const c = def.choices[index];
  run.rupees -= c.cost ?? 0;
  const result = withRng(run, (rng) => {
    let out: EventOutcome = c.outcome ?? { text: '', effects: [] };
    if (c.gamble) out = rng.chance(c.gamble.chance) ? c.gamble.win : c.gamble.lose;
    return { text: out.text, lines: out.effects.map((e) => applyEffect(run, e, rng)).filter((l): l is string => !!l) };
  });
  ev.result = result;
  return result;
}

const STAT_NAMES: Record<string, string> = { hp: 'HP', str: 'STR', mag: 'MAG', skl: 'SKL', spd: 'SPD', def: 'DEF', res: 'RES', lck: 'LCK' };

function applyEffect(run: Run, e: EventEffect, rng: RNG): string | null {
  switch (e.kind) {
    case 'rupees':
      run.rupees = Math.max(0, run.rupees + e.amount);
      return e.amount >= 0 ? `+₹${e.amount}` : `-₹${-e.amount}`;
    case 'hp':
      for (const u of run.roster) {
        const d = Math.ceil(u.stats.hp * Math.abs(e.pct));
        u.hp = e.pct >= 0 ? Math.min(u.stats.hp, u.hp + d) : Math.max(1, u.hp - d);
      }
      return e.pct >= 0 ? `Army healed ${Math.round(e.pct * 100)}% HP` : `Army lost ${Math.round(-e.pct * 100)}% HP`;
    case 'xp': {
      let ups = 0;
      for (const u of run.roster) ups += gainXp(u, e.amount, rng).length;
      return `Army gained ${e.amount} EXP${ups ? ` (${ups} level-up${ups > 1 ? 's' : ''})` : ''}`;
    }
    case 'loot': {
      const ids = e.ids.filter((id) => kindOf(id));
      if (!ids.length) return null;
      const id = rng.pick(ids);
      give(run, id, null);
      const name = WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? PERMANENT_ITEMS[id]?.name ?? id;
      return `Found ${name} (sent to convoy)`;
    }
    case 'recruit': {
      if (run.roster.length >= armyCap(run)) { run.rupees += 100; return 'Your army is full: they leave you ₹100 instead'; }
      const have = new Set(run.roster.map((u) => u.templateId));
      const pool = e.pool.filter((id) => TEMPLATES[id] && (TEMPLATES[id].generic || !have.has(id)));
      if (!pool.length) return null;
      const u = makeHero(rng.pick(pool), nextUid(run), recruitLevel(run), rng);
      run.roster.push(u);
      run.stats.recruits++;
      return `${u.name} joined your army`;
    }
    case 'stat': {
      const u = rng.pick(run.roster);
      u.stats[e.stat] += e.amount;
      if (e.stat === 'hp') u.hp += e.amount;
      return `${u.name}: +${e.amount} ${STAT_NAMES[e.stat]}`;
    }
    case 'quest':
      addQuestItem(run, e.id);
      return `Quest item: ${QUEST_ITEMS[e.id]?.name ?? e.id}${!(run.questItems ?? []).includes(e.id) && e.id.endsWith('sMask') ? ' (combined into the Couple\'s Mask!)' : ''}`;
    case 'takeQuest': {
      const q = run.questItems ?? [];
      const i = q.indexOf(e.id);
      if (i >= 0) q.splice(i, 1);
      return null;
    }
    case 'support': {
      const s = (run.supports ??= {});
      for (let i = 0; i < run.roster.length; i++)
        for (let j = i + 1; j < run.roster.length; j++) {
          const k = supportKey(run.roster[i].uid, run.roster[j].uid);
          s[k] = (s[k] ?? 0) + e.amount;
        }
      return 'Support bonds grew stronger';
    }
  }
}

export function isRegionComplete(run: Run): boolean {
  const n = currentNode(run);
  return !!n && n.type === 'boss' && !run.battle;
}

/** After a regional boss: offer the next region to march on. */
export function offerRegions(run: RunWithEvent): void {
  withRng(run, (rng) => {
    if (run.campaign === 'termina') {
      const t = terminaNextRegions(run);
      if (t.length) { run.event = { type: 'region', options: t }; return; }
    }
    const recent = run.regionsVisited.slice(-2);
    // Hyrule's war stays in Hyrule until the Free-for-All, when Termina's regions join in.
    const pool = REGION_IDS.filter((r) => !recent.includes(r) && (run.act + 1 >= FREE_FOR_ALL_REGION || WORLDS[r]?.campaign !== 'termina') && r !== 'moon');
    const options = rng.shuffle(pool).slice(0, 3);
    run.event = { type: 'region', options };
  });
}

// ───────────────────────── Termina campaign ─────────────────────────

export const TERMINA_TEMPLES: WorldId[] = ['woodfall', 'snowhead', 'greatBay', 'ikana'];
const REMAINS: Record<string, string> = { woodfall: 'odolwaRemains', snowhead: 'gohtRemains', greatBay: 'gyorgRemains', ikana: 'twinmoldRemains' };
export const CYCLE_HOURS = 72;

/** Boss Remains the army holds. */
export function remainsHeld(run: Run): string[] {
  const owned = ownedGear(run);
  return Object.values(REMAINS).filter((id) => owned.has(id));
}

/** Clock Town → Termina Field → the four regions (any order) → the Moon once all four Remains are held. Then endless. */
function terminaNextRegions(run: Run): WorldId[] {
  if (run.region === 'clockTown' && !run.regionsVisited.includes('terminaField')) return ['terminaField'];
  if (run.region === 'moon') return [];
  const held = remainsHeld(run);
  if (held.length >= 4) return ['moon'];
  const open = TERMINA_TEMPLES.filter((r) => !held.includes(REMAINS[r]));
  return open.length ? open : ['moon'];
}

/** Hours in the cycle each kind of encounter takes. */
export function hoursFor(type: NodeType): number {
  return BATTLE_NODES.includes(type) ? 6 : 3;
}

export function clockLabel(run: Run): { day: number; time: string; night: boolean; hoursLeft: number } {
  const h = run.clock?.hours ?? 0;
  const day = Math.min(3, Math.floor(h / 24) + 1);
  const clock = (6 + h) % 24;
  const night = h % 24 >= 12;
  const hh = clock % 12 === 0 ? 12 : clock % 12;
  return { day, time: `${hh}:00 ${clock < 12 ? 'a.m.' : 'p.m.'}`, night, hoursLeft: Math.max(0, CYCLE_HOURS - h) };
}

/** Advance the Moon's clock. Returns true if the Moon has fallen. */
export function advanceClock(run: Run, hours: number): boolean {
  if (run.campaign !== 'termina' || !run.clock || run.region === 'moon') return false;
  run.clock.hours += hours;
  return run.clock.hours >= CYCLE_HOURS;
}

/** Items that are lost when time is reset (ordinary consumables). */
const KEEP_KINDS = new Set(['tool', 'learn']);
const KEEP_QUEST = new Set(['bombersNotebook', 'fishingPass']);

/** The Song of Time: back to the dawn of the first day, at a price. */
export function songOfTimeReset(run: RunWithEvent): string[] {
  if (run.campaign !== 'termina' || run.battle || !run.clock) return [];
  const lost: string[] = [];
  run.clock.hours = 0;
  run.clock.resets++;
  if (run.rupees) lost.push(`₹${run.rupees} unbanked Rupees`);
  run.rupees = 0;
  let items = 0;
  for (const u of run.roster) {
    const before = u.pack.length;
    u.pack = u.pack.filter((p) => KEEP_KINDS.has(ITEMS[p.id]?.kind ?? '') || p.id === 'strayFairy');
    items += before - u.pack.length;
  }
  const cBefore = run.convoy.length;
  run.convoy = run.convoy.filter((id) => !ITEMS[id] || KEEP_KINDS.has(ITEMS[id].kind) || id === 'strayFairy');
  items += cBefore - run.convoy.length;
  if (items) lost.push(`${items} consumable item${items > 1 ? 's' : ''}`);
  const q = run.questItems ?? [];
  const goneQuest = q.filter((id) => !KEEP_QUEST.has(id));
  if (goneQuest.length) lost.push(`${goneQuest.length} quest item${goneQuest.length > 1 ? 's' : ''}`);
  run.questItems = q.filter((id) => KEEP_QUEST.has(id));
  const a = armyOf(run);
  a.blessing = undefined;
  a.feast = false;
  // The current route starts over.
  withRng(run, (rng) => { run.map = generateRegionMap(rng, run.act, run.region); });
  run.currentNodeId = null;
  run.event = undefined;
  return lost;
}

export function deposit(run: Run, amount: number): boolean {
  if (run.campaign !== 'termina' || amount <= 0 || amount > run.rupees) return false;
  run.rupees -= amount;
  run.bank = (run.bank ?? 0) + amount;
  return true;
}

export function withdraw(run: Run, amount: number): boolean {
  if (run.campaign !== 'termina' || amount <= 0 || amount > (run.bank ?? 0)) return false;
  run.bank! -= amount;
  run.rupees += amount;
  return true;
}

/** Who can be recruited on which day of the cycle (Bombers' Notebook). */
export const TERMINA_SCHEDULE: Record<string, number[]> = {
  anju: [1, 2], kafei: [3], mikau: [1, 2], lulu: [2, 3], darmani: [1, 2, 3], tingle: [1, 2], skullKid: [3], tatl: [1, 2, 3], tael: [3],
  sharp: [2, 3], flat: [1, 2], garoMaster: [2, 3], captainKeeta: [3], dekuPrincess: [1], dekuKing: [2, 3],
};

export function advanceRegion(run: RunWithEvent, region: WorldId): void {
  // After the Moon, the three-day cycle is over: Termina's war goes on without a clock.
  if (run.region === 'moon') delete run.clock;
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
  if (run.roster.length >= armyCap(run)) return null;
  const bonusLvl = run.bonus === 'dekuArmy' && TEMPLATES[templateId]?.race === 'deku' ? 1 : 0;
  const unit = withRng(run, (rng) => makeHero(templateId, nextUid(run), recruitLevel(run) + bonusLvl, rng));
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
  if (u.weapons.length >= 5) stashWeapon(run, u.uid, u.weapons[u.weapons.length - 1], true);
  u.weapons.push(id);
  const st = run.itemState?.[id];
  if (st) {
    if (st.wear) (u.wear ??= {})[id] = st.wear;
    if (st.forge) (u.forge ??= {})[id] = st.forge;
    delete run.itemState![id];
  }
  return true;
}

/** Equip a gear piece in its slot; whatever was there goes to the convoy. */
export function giveGear(run: Run, id: string, uid: string | null): boolean {
  const u = uid ? run.roster.find((x) => x.uid === uid) : undefined;
  const def = GEAR[id];
  if (!def) return false;
  if (!u) { run.convoy.push(id); return true; }
  if (def.slot === 'mount' && !canRide(u)) return false;
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
  if (GEAR[id]?.slot === 'mount') return canRide(u);
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

export function stashWeapon(run: Run, uid: string, weaponId: string, force = false): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  if (!u || (u.weapons.length <= 1 && !force)) return false;
  const i = u.weapons.indexOf(weaponId);
  if (i < 0) return false;
  u.weapons.splice(i, 1);
  run.convoy.push(weaponId);
  // Remember wear and improvements while it sits in the convoy.
  const wear = u.wear?.[weaponId], forge = u.forge?.[weaponId];
  if (wear || forge) {
    (run.itemState ??= {})[weaponId] = { wear, forge };
    if (u.wear) delete u.wear[weaponId];
    if (u.forge) delete u.forge[weaponId];
  }
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
  if (def.id === 'goldDust') {
    const razor = u.weapons.indexOf('razorSword');
    if (razor >= 0) { u.weapons[razor] = 'gildedSword'; if (u.wear) delete u.wear.razorSword; }
    else { const w = u.weapons[0]; (u.forge ??= {})[w] = Math.min(MAX_FORGE, forgeLevel(u, w) + 1); }
  } else if (def.kind === 'learn') u.abilities.push(def.teaches!);
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
  if (def.id === 'goldDust') return u.weapons.includes('razorSword') || (!!u.weapons[0] && forgeLevel(u, u.weapons[0]) < MAX_FORGE && !!WEAPONS[u.weapons[0]] && WEAPONS[u.weapons[0]].type !== 'natural');
  return false;
}

/** Great Fairy: hand in a Stray Fairy for a free blessing (doesn't use up the visit). */
export function returnStrayFairy(run: RunWithEvent, uid: string): string | null {
  if (run.event?.type !== 'fountain') return null;
  const holder = run.roster.find((u) => u.pack.some((p) => p.id === 'strayFairy'));
  const ci = run.convoy.indexOf('strayFairy');
  if (holder) { const i = holder.pack.findIndex((p) => p.id === 'strayFairy'); if (--holder.pack[i].uses <= 0) holder.pack.splice(i, 1); }
  else if (ci >= 0) run.convoy.splice(ci, 1);
  else return null;
  const ev = run.event;
  const got = fountainBless(run, uid);
  run.event = ev; // the fountain visit continues
  return got;
}

export function strayFairyCount(run: Run): number {
  return run.convoy.filter((id) => id === 'strayFairy').length + run.roster.reduce((n, u) => n + u.pack.filter((p) => p.id === 'strayFairy').reduce((a, p) => a + p.uses, 0), 0);
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
  const base = kind === 'weapon' ? weaponPrice(run, id) : kind === 'gear' ? GEAR[id].price : kind === 'item' ? ITEMS[id].price : PERMANENT_ITEMS[id].price;
  return Math.round(base * (1 - repDiscount(run) / 100));
}

export const SUPPLY_PACK = { amount: 10, price: 90 };

export function supplyPrice(run: Run): number {
  return Math.round(SUPPLY_PACK.price * (1 - repDiscount(run) / 100) * (run.trials?.includes('famine') ? 2 : 1));
}

/** Buy a crate of supplies at a merchant. */
export function buySupplies(run: RunWithEvent): boolean {
  const a = armyOf(run);
  const price = supplyPrice(run);
  if (run.event?.type !== 'shop' || run.rupees < price || a.supplies >= supplyCap(run)) return false;
  run.rupees -= price;
  a.supplies = Math.min(supplyCap(run), a.supplies + SUPPLY_PACK.amount);
  return true;
}

/** Camp: a feast in the mess hall (supplies → morale, and everyone starts the next battle Inspired). */
export const FEAST_COST = 8;
export function campFeast(run: RunWithEvent): boolean {
  const a = armyOf(run);
  if (run.event?.type !== 'camp' || a.supplies < FEAST_COST) return false;
  a.supplies -= FEAST_COST;
  adjustMorale(run, 15);
  a.feast = true;
  run.event = undefined;
  return true;
}

/** Camp: revive a fallen unit with Fairy Dust (doesn't use up the camp visit). */
export function reviveWithDust(run: RunWithEvent, uid: string): boolean {
  const a = armyOf(run);
  const i = run.fallen.findIndex((u) => u.uid === uid);
  if (a.fairyDust < 1 || i < 0 || run.roster.length >= armyCap(run)) return false;
  a.fairyDust--;
  const [u] = run.fallen.splice(i, 1);
  run.roster.push({ ...u, hp: Math.ceil(u.stats.hp / 2) });
  return true;
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
  // Resting eats supplies; a well-fed army recovers fully.
  const a = armyOf(run);
  const fed = a.supplies >= 4;
  if (fed) a.supplies -= 4;
  const anju = run.roster.some((u) => u.skills.includes('hospitality')); // Anju's Hospitality
  for (const u of run.roster) u.hp = Math.min(u.stats.hp, u.hp + Math.ceil(u.stats.hp * (fed ? 1 : anju ? 0.75 : 0.5)));
  adjustMorale(run, (fed ? 5 : 0) + (anju ? 5 : 0));
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
  if (i < 0 || run.roster.length >= armyCap(run)) return false;
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

export interface Meta extends MetaProgress {
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
  const empty: Meta = { runs: 0, bestDepth: 0, bestRegion: 0, discovered: [], bossesDefeated: [], ...emptyProgress() };
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
  run.army ??= newArmy();
  const fix = (u: Unit & { accessory?: string; stunned?: number }) => {
    u.gear ??= {};
    u.pack ??= [];
    u.mp ??= u.stats.mp;
    u.sta ??= u.stats.sta;
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

// ───────────────────────── Blacksmith ─────────────────────────

const RARITY_VALUE: Record<string, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };
const smithDiscount = (run: Run) => (run.bonus === 'forging' ? 0.75 : 1);
const valueOf = (id: string) => WEAPONS[id]?.price || RARITY_VALUE[WEAPONS[id]?.rarity] || 300;

export function repairCost(run: Run, u: Unit, weaponId: string): number {
  const max = maxUses(WEAPONS[weaponId]);
  const wear = u.wear?.[weaponId] ?? 0;
  if (!max || !wear) return 0;
  return Math.max(20, Math.round(valueOf(weaponId) * (wear / max) * 0.6 * smithDiscount(run)));
}

export const MAX_FORGE = 3;

export function improveCost(run: Run, u: Unit, weaponId: string): number {
  const w = WEAPONS[weaponId];
  if (!w || w.type === 'natural' || w.type === 'instrument' || w.type === 'staff') return 0;
  const lvl = forgeLevel(u, weaponId);
  if (lvl >= MAX_FORGE) return 0;
  return Math.round((150 + valueOf(weaponId) * 0.3) * (lvl + 1) * smithDiscount(run));
}

/** Materials needed to improve a weapon (2, 4, 6). */
export function improveMaterials(u: Unit, weaponId: string): number {
  return 2 * (forgeLevel(u, weaponId) + 1);
}

export function forgePrice(run: Run, weaponId: string): number {
  return Math.round(valueOf(weaponId) * 0.85 * smithDiscount(run));
}

export function repairWeapon(run: RunWithEvent, uid: string, weaponId: string): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  if (run.event?.type !== 'blacksmith' || !u) return false;
  const cost = repairCost(run, u, weaponId);
  if (!cost || run.rupees < cost) return false;
  run.rupees -= cost;
  delete u.wear![weaponId];
  return true;
}

export function improveWeapon(run: RunWithEvent, uid: string, weaponId: string): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  if (run.event?.type !== 'blacksmith' || !u) return false;
  const cost = improveCost(run, u, weaponId);
  const mats = improveMaterials(u, weaponId);
  if (!cost || run.rupees < cost || armyOf(run).materials < mats) return false;
  run.rupees -= cost;
  armyOf(run).materials -= mats;
  (u.forge ??= {})[weaponId] = forgeLevel(u, weaponId) + 1;
  return true;
}

export function forgeWeapon(run: RunWithEvent, weaponId: string, uid: string): boolean {
  const ev = run.event;
  if (ev?.type !== 'blacksmith' || !ev.forgeOffers.includes(weaponId) || ev.sold.includes(weaponId)) return false;
  const price = forgePrice(run, weaponId);
  if (run.rupees < price || !giveWeapon(run, weaponId, uid)) return false;
  run.rupees -= price;
  ev.sold.push(weaponId);
  return true;
}
