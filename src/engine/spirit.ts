// Spirit Tracks battle rules (New Hyrule): railway combat (trains that run only on connected rail
// spaces, carry passengers, fire cannons and ram, switches, broken track, stations, crossings and
// Spirit Tracks), the four train-part slots and eight sets, Zelda's spirit and her possession of
// Phantoms, the Tower of Spirits (patrols without the life drain), the Lokomo sages and the Spirit
// Flute's songs, every boss gimmick (Stagnox, Fraaz, Phytops, Cragma, Skeldritch, Malladus and his
// stolen vessel, the Demon Train), Big Blin, the pack's battlefield spaces, and the six new ChuChus.
// Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts, status.ts, abilities.ts,
// naval.ts, twilight.ts and battleView.ts (like phantom.ts).

import { BOSSES, ENEMIES, GEAR, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import { SP_CAPACITY, SP_SPECIAL, SPIRIT_TOWER, ST_FEATURES, ST_SPOILS, TRAIN_SETS } from '../content/spirit';
import { QUEST_ITEMS as ST_QUEST } from '../content/spirit/items';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { isVessel, repairComponent, type NavalLayout } from './naval';
import { face, isFrontal, isPhantom, phState } from './phantom';
import { RNG } from './rng';
import { INF, WATERY } from './rules';
import { addStatus } from './status';
import { roomFor, transformInto } from './transform';
import { activeGear, effectiveStats, makeEnemy, moveTypeOf, unitTags } from './units';
import { pushAway, pullToward } from './windwaker';
import type { AbilityDef, Battle, Element, EnemyArchetype, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Spirit Tracks battle state. */
    sp?: SPState;
  }
  interface Unit {
    /** Elemental ChuChus: turns until the coating recovers (0 or missing = charged). */
    stCoat?: number;
    /** Helmet ChuChu: the helmet has been knocked off. */
    stHelmetOff?: boolean;
    /** Fraaz: the current form. */
    stForm?: 'fire' | 'ice';
    /** Stagnox: turns its armor stays blown open. */
    stArmorOpen?: number;
    /** Sandworm: just surfaced (+50% on the next attack). */
    stSurfaced?: boolean;
    /** The Demon Train: a car has been knocked out (no more half damage). */
    stCarsOut?: boolean;
  }
}

export interface SPState {
  /** A train battle (rails, stations, switches). */
  rail: boolean;
  /** The Tower of Spirits (patrols and Safe Zones, no life drain). */
  tower: boolean;
  towerFloor?: number;
  /** Junction tiles a Railway Switch opens and closes, and whether they are open. */
  junctions: number[];
  junctionsOpen: boolean;
  /** Floor spike tiles a switch retracts, and whether they are up. */
  spikes: number[];
  spikesUp: boolean;
  /** Rolling boulders (tile, direction). */
  boulders: { k: number; dx: number; dy: number }[];
  /** Temporary spaces (Sand Pillars, Sand Bridges, frozen water): tile, what it was, turns left. */
  timed: { k: number; was: Terrain; turns: number }[];
  /** Units carried off in Big Blin's basket. */
  captured: { unit: Unit; by: string; turns: number }[];
  /** Quest items found in battle (treasures, Force Gems). */
  found: string[];
  /** Turn the once-per-round upkeep last ran. */
  round?: number;
  /** Every boss must fall (Malladus and his stolen vessel). */
  allBosses?: boolean;
}

export const spState = (b: Battle): SPState =>
  (b.sp ??= { rail: false, tower: false, junctions: [], junctionsOpen: true, spikes: [], spikesUp: true, boulders: [], timed: [], captured: [], found: [] });
const ST_WORLD = (b: Battle) => worldDef(b.world).campaign === 'spirit';
const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.templateId ?? u.bossId ?? u.artId ?? '';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
const free = (b: Battle, u: Unit, x: number, y: number) =>
  inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u; });
const tilesOf = (b: Battle, u: Unit) => footprint(u.x, u.y, u.size).map((p) => b.tiles[keyOf(b, p.x, p.y)]);
const adjacentTile = (b: Battle, u: Unit, t: Terrain | Terrain[]): Pos | undefined => {
  const ts = Array.isArray(t) ? t : [t];
  return tilesInRange(b, u, 1, 1, u.size).find((p) => ts.includes(tileAt(b, p.x, p.y)!));
};
function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}

/** Spirit Tracks effect tags on a unit: its active gear and its equipped weapon. */
export function stTags(u: Unit): Set<string> {
  const out = new Set<string>();
  for (const g of activeGear(u)) for (const t of g.st ?? []) out.add(t);
  for (const t of WEAPONS[u.weapons[0]]?.st ?? []) out.add(t);
  return out;
}
const tag = (u: Unit, t: string) => stTags(u).has(t);

export const isTrain = (u: Pick<Unit, 'race'>) => u.race === 'train';
/** Rail spaces a train can run on. */
export const RAIL: Terrain[] = ['railTrack', 'railJunction', 'trainStation', 'railCrossing', 'spiritTrack'];
const isEngineer = (u: Unit) => has(u, 'spiritEngineer') || has(u, 'masterEngineer') || tag(u, 'engineer');
const isChu = (u: Unit) => u.race === 'chuchu';
const COATED = ['combustibleBody', 'frozenBody', 'volatileCharge'];
const coated = (u: Unit) => COATED.some((s) => has(u, s)) && !u.stCoat;
const isSacredHit = (atk: Unit, w: WeaponDef | undefined, element?: Element) =>
  !!w?.st?.includes('sacred') || element === 'light' || !!w?.sacredMult || hasBuff(atk, 'tearOfLight');
/** Possessed and demonic units (Demonic Influence, the Demon King's army). */
export const isPossessed = (u: Unit) => isPhantom(u) || unitTags(u).includes('possessed') || u.race === 'phantom' || !!u.phPossessed;
export const isDemonic = (u: Unit) => u.race === 'demon' || u.race === 'undead' || unitTags(u).includes('demon') || unitTags(u).includes('undead') || isPossessed(u);
const isZeldaForm = (u: Unit) => ['zeldaST', 'spiritZelda', 'phantomZelda', 'phantomZeldaTorch', 'phantomZeldaWarp', 'phantomZeldaWrecker'].includes(tid(u));
const PHANTOM_FORMS = ['phantomZelda', 'phantomZeldaTorch', 'phantomZeldaWarp', 'phantomZeldaWrecker'];
const near = (b: Battle, u: Unit, skill: string, r: number, pos: Pos = u) => b.units.some((a) => a !== u && a.team === u.team && has(a, skill) && unitDist(u, a, pos) <= r);

// ───────────────────────── Train parts ─────────────────────────

/** How many parts of each set a train has fitted. */
export function trainSets(u: Unit): Record<string, number> {
  const out: Record<string, number> = {};
  for (const g of activeGear(u)) for (const t of g.st ?? []) if (t.startsWith('trainSet:')) out[t.slice(9)] = (out[t.slice(9)] ?? 0) + 1;
  return out;
}
/** 0, 1 (2+ parts: partial) or 2 (all 4: full) for one set. */
export const trainSetLevel = (u: Unit, set: string) => { const n = trainSets(u)[set] ?? 0; return n >= 4 ? 2 : n >= 2 ? 1 : 0; };
const SET_STATS: Record<string, [Record<string, number>, Record<string, number>]> = {
  spirit: [{ def: 2, res: 2 }, { str: 3, def: 3, res: 3, mov: 1 }],
  wooden: [{ mov: 1 }, { mov: 2 }],
  steel: [{ def: 4 }, { def: 8 }],
  stagecoach: [{}, { res: 2 }],
  dragon: [{ str: 3 }, { str: 6 }],
  skull: [{ res: 4 }, { res: 8 }],
  golden: [{}, { str: 3, mag: 3, skl: 3, spd: 3, def: 3, res: 3, lck: 3 }],
};
function applyTrainSets(u: Unit) {
  u.buffs = u.buffs.filter((x) => !x.id.startsWith('trainSet:'));
  for (const s of TRAIN_SETS) {
    const lvl = trainSetLevel(u, s.id);
    if (!lvl) continue;
    u.buffs.push({ id: `trainSet:${s.id}`, name: `${s.name} set (${lvl === 2 ? 'full' : 'partial'})`, turns: 999, stats: SET_STATS[s.id]?.[lvl - 1] ?? {} });
  }
}
/** Passenger room for trains (naval.ts capacityOf): the base, plus the Stagecoach set. */
export function spCapacity(v: Unit): number | undefined {
  if (!isTrain(v)) return undefined;
  const base = SP_CAPACITY[v.templateId ?? v.bossId ?? ''] ?? Math.max(1, v.size * 2 - 2);
  return base + trainSetLevel(v, 'stagecoach');
}

// ───────────────────────── Movement ─────────────────────────

/** Spirit Tracks movement exceptions (called from grid.ts): trains stay on the rails. */
export function spTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  if (isTrain(u)) return RAIL.includes(t) ? 1 : INF;
  if (t === 'sandBridge' || t === 'tearOfLight' || t === 'floorSpikes') c = Math.min(c, moveTypeOf(u) === 'fixed' ? INF : 1);
  // The Sand Melody: no desert penalties; the Ocean Melody: allies swim.
  const sb = (b as Partial<Battle>).units;
  if (sb && u.size <= 2) {
    if ((t === 'sinkingSand' || t === 'sandPile' || t === 'sandVortex') && near(b, u, 'sandMelody', 2)) c = Math.min(c, 1);
    if (WATERY.includes(t) && t !== 'whirlpool' && near(b, u, 'oceanMelody', 2)) c = Math.min(c, 1);
  }
  return c;
}

// ───────────────────────── Train battlefields ─────────────────────────

/**
 * A train battle: a station platform on the left, a loop of track (bands as wide as the biggest
 * train) with a switchable junction across the middle, crossings, a stretch of Spirit Track, a
 * broken section and an enemy station on the right. Places every unit (trains on the rails, others
 * on the platform or the land); units that can't be placed are left at x = -1 (the caller loads them aboard).
 */
export function layoutRail(rng: RNG, players: Unit[], enemies: Unit[], boss: Unit | undefined): NavalLayout & { junctions: number[] } {
  const all = [...players, ...enemies, ...(boss ? [boss] : [])];
  const S = Math.max(3, ...all.filter(isTrain).map((u) => u.size));
  const width = 20 + S + (S > 3 ? 2 : 0);
  const height = 2 * S + 6;
  const tiles: Terrain[] = new Array(width * height).fill('plain');
  const idx = (x: number, y: number) => y * width + x;
  const set = (x0: number, x1: number, y0: number, y1: number, t: Terrain) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[idx(x, y)] = t; };
  // Land: scrub and rocks between the lines.
  for (let k = 0; k < tiles.length; k++) { const r = rng.next(); if (r < 0.1) tiles[k] = 'forest'; else if (r < 0.14) tiles[k] = 'mountain'; }
  const L = 3, R = width - 1 - S, top = 1, bot = height - 1 - S;
  set(L, width - 2, top, top + S - 1, 'railTrack');
  set(L, width - 2, bot, bot + S - 1, 'railTrack');
  set(L, L + S - 1, top, bot + S - 1, 'railTrack');
  set(R, R + S - 1, top, bot + S - 1, 'railTrack');
  // The junction across the middle (a Railway Switch opens and closes it).
  const mx = Math.floor(width / 2 - S / 2);
  const junctions: number[] = [];
  for (let y = top + S; y < bot; y++) for (let x = mx; x < mx + S; x++) { tiles[idx(x, y)] = 'railJunction'; junctions.push(idx(x, y)); }
  const sy = Math.floor(height / 2);
  tiles[idx(mx - 1, sy)] = 'railSwitch';
  // Stations: the home platform and the enemy depot.
  for (let y = sy - 1; y <= sy + 1; y++) { for (let x = L; x < L + S; x++) tiles[idx(x, y)] = 'trainStation'; tiles[idx(2, y)] = 'trainStation'; }
  for (let y = sy - 1; y <= sy + 1; y++) for (let x = R; x < R + S; x++) tiles[idx(x, y)] = 'trainStation';
  // The platform itself is open ground.
  for (let y = 0; y < height; y++) for (let x = 0; x < 3; x++) if (tiles[idx(x, y)] !== 'trainStation') tiles[idx(x, y)] = rng.chance(10) ? 'forest' : 'plain';
  // Crossings on both lines, a stretch of Spirit Track, and a broken section of the top line.
  const cx1 = L + S + 2 + rng.int(0, 2), cx2 = R - 3 - rng.int(0, 2);
  for (let y = top; y < top + S; y++) tiles[idx(cx1, y)] = 'railCrossing';
  for (let y = bot; y < bot + S; y++) tiles[idx(cx2, y)] = 'railCrossing';
  for (let x = L + S; x < L + S + 5 && x < mx; x++) for (let y = bot; y < bot + S; y++) if (tiles[idx(x, y)] === 'railTrack') tiles[idx(x, y)] = 'spiritTrack';
  const bx = Math.floor(width * 0.68);
  if (bx > mx + S && bx < R) for (let y = top; y < top + S; y++) tiles[idx(bx, y)] = 'brokenTrack';

  const fake = { width, height, tiles, units: [] as Unit[] } as unknown as Battle;
  const taken = new Set<number>();
  const fits = (u: Unit, x: number, y: number) => anchorCost(fake, u, x, y) < INF && footprint(x, y, u.size).every((p) => p.x < width && p.y < height && !taken.has(idx(p.x, p.y)));
  const claim = (u: Unit, x: number, y: number) => { u.x = x; u.y = y; for (const p of footprint(x, y, u.size)) taken.add(idx(p.x, p.y)); };
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
  if (boss && place(boss, Math.floor(width * 0.6), width - 1, (x, y) => -x * 0.5 + Math.abs(y + boss.size / 2 - mid) + rng.next())) bossSpawn = { x: boss.x, y: boss.y };
  for (const u of [...players].sort((a, c) => c.size - a.size)) {
    const ok = isTrain(u)
      ? place(u, L, L + S + 4, (x, y) => Math.abs(y + u.size / 2 - mid) + (x - L) * 0.6 + rng.next() * 0.5)
      : place(u, 0, 2, (x, y) => Math.abs(y + u.size / 2 - mid) + x * 0.3);
    if (!ok) { u.x = -1; u.y = -1; }
  }
  for (const u of [...enemies].sort((a, c) => c.size - a.size)) {
    const ok = place(u, Math.floor(width * 0.45), width - 1, (x) => -x + (rng.next() - 0.5) * 10);
    if (!ok) { u.x = -1; u.y = -1; }
  }
  return { width, height, tiles, bossSpawn, junctions };
}

/** Enemy trains for a train battle (Dark Trains; Armored Trains further on). */
export function enemyTrains(depth: number, rng: RNG): string[] {
  const n = depth < 5 ? 1 : depth < 12 ? rng.int(1, 2) : 2;
  return Array.from({ length: n }, () => (depth >= 8 && rng.chance(35) ? 'armoredTrain' : 'darkTrain')).filter((id) => TEMPLATES[id]);
}

// ───────────────────────── Battlefield setup ─────────────────────────

const OBSTACLES = new Set<Terrain>(['railSwitch', 'whipPost', 'lightStatue', 'rollingBoulder']);

/** Place the region's battlefield spaces; the Tower gets Safe Zones and patrols (no life drain). Runs before the Phantom Hourglass decoration. */
export function decorateSpirit(b: Battle, rng: RNG) {
  const feats = ST_FEATURES[b.world];
  if (!feats) return;
  const st = spState(b);
  if (b.world === SPIRIT_TOWER) {
    st.tower = true;
    // The Phantoms patrol as in the Temple of the Ocean King, but the Tower doesn't drain anyone's life.
    const ph = phState(b);
    ph.temple = true;
    ph.noDrain = true;
  }
  if (st.rail) return;
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 2 && i % b.width <= b.width - 3 ? i : -1)).filter((i) => i >= 0));
  const pos = (k: number) => ({ x: k % b.width, y: Math.floor(k / b.width) });
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    if (t === 'railTrack' && n > 0) {
      // A branch line runs across the field, with a crossing.
      const y = Math.floor(b.height / 2) + (rng.chance(50) ? 1 : -1);
      for (let x = 1; x < b.width - 1; x++) { const k = keyOf(b, x, y); if (b.tiles[k] === 'plain' && !occupied.has(k)) b.tiles[k] = 'railTrack'; }
      const cx = rng.int(3, b.width - 4);
      if (b.tiles[keyOf(b, cx, y)] === 'railTrack') b.tiles[keyOf(b, cx, y)] = 'railCrossing';
      continue;
    }
    for (let j = 0; j < n; j++) {
      const k = plains.pop();
      if (k === undefined) break;
      if (OBSTACLES.has(t) && tilesInRange(b, pos(k), 1, 1).some((p) => OBSTACLES.has(b.tiles[keyOf(b, p.x, p.y)]))) continue;
      b.tiles[k] = t;
      if (t === 'floorSpikes') st.spikes.push(k);
      if (t === 'rollingBoulder') st.boulders.push({ k, dx: rng.chance(50) ? 1 : -1, dy: 0 });
    }
  }
  // A Railway Switch retracts the spikes, if there are any.
  if (st.spikes.length && !b.tiles.includes('railSwitch')) { const k = plains.pop(); if (k !== undefined) b.tiles[k] = 'railSwitch'; }
  // The Tower: a Safe Zone beside the army's start.
  if (st.tower) {
    for (const u of b.units.filter((x) => x.team === 'player').slice(0, 3)) {
      for (const p of tilesInRange(b, u, 1, 1, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain' && !occupied.has(k)) { b.tiles[k] = 'sacredSafeZone'; break; } }
    }
  }
}

/** Train battles: junction tiles, the station's extras (crossings already laid by layoutRail). */
export function setupRail(b: Battle, junctions: number[]) {
  const st = spState(b);
  st.rail = true;
  st.junctions = junctions;
  st.junctionsOpen = true;
  delete b.wind;
  delete b.currentDir;
}

/** Battle start (every campaign): coats, helmets, train-part sets, Fraaz's form, Stagnox's facing, Ferrus. */
export function spiritBattleStart(b: Battle) {
  for (const u of [...b.units, ...b.units.flatMap((v) => v.cargo ?? [])]) spiritBattleStartUnit(u);
  if (b.sp?.rail) {
    // Ferrus knows the line: Broken Track near him is already mended.
    for (const f of b.units.filter((u) => u.team === 'player' && has(u, 'railwayKnowledge'))) {
      let n = 0;
      for (const p of tilesInRange(b, f, 0, 3, f.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'brokenTrack' && !b.sp.junctions.includes(k)) { b.tiles[k] = 'railTrack'; n++; } }
      b.log.push(`Ferrus's Railway Knowledge: ${n ? `${n} broken rails mended; ` : ''}${b.objective.type === 'survive' ? 'reinforcements are on the next train.' : 'no reinforcements are scheduled.'}`);
    }
  }
}

function spiritBattleStartUnit(u: Unit) {
  if (COATED.some((s) => has(u, s))) u.stCoat = 0;
  if (has(u, 'ironHelmet')) u.stHelmetOff = false;
  if (has(u, 'iceAndFire')) u.stForm = 'fire';
  if (has(u, 'armoredInsectSkill')) u.phFacing = u.phFacing ?? (u.team === 'enemy' ? [-1, 0] : [1, 0]);
  if (isTrain(u)) applyTrainSets(u);
  if (has(u, 'multiCarTrain')) u.stCarsOut = false;
}

/** A partner boss joining the enemy side (Malladus beside his stolen vessel). */
export function addSpiritPartner(b: Battle, bossId: string, rng: RNG): Unit | null {
  const def = BOSSES[bossId];
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!def || !main) return null;
  const e = makeEnemy(def, b.world, main.level, `sp${b.uidCounter++}`, rng, { boss: true });
  for (let d = 1; d <= 8; d++) {
    const spot = tilesInRange(b, main, d, d, main.size).find((p) => free(b, e, p.x, p.y));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y, team: 'enemy', ai: main.ai }); b.units.push(e); spState(b).allBosses = true; spiritBattleStartUnit(e); return e; }
  }
  return null;
}

// ───────────────────────── Temporary units ─────────────────────────

const TEMP: Record<string, EnemyArchetype> = {
  fraazHalf: { id: 'fraazHalf', name: 'Half of Fraaz', race: 'demon', classId: 'iceFireBeast', size: 2, weapons: ['fraazFrost'], skill: 'iceAndFire', stats: { hp: 30, str: 8, mag: 18, skl: 12, spd: 12, def: 8, res: 14, mov: 6 }, glyph: 'F½' },
  awakenedGuardian: { id: 'awakenedGuardian', name: 'Awakened Guardian', race: 'construct', classId: 'cobbleKnight', weapons: ['cobbleLance'], stats: { hp: 30, str: 13, skl: 10, spd: 5, def: 14, res: 8, mov: 4 }, glyph: 'AG' },
};

function spawnTemp(b: Battle, id: string, nearPos: Pos & { size: number }, team: Unit['team'], level: number, extra: Partial<Unit> = {}): Unit | null {
  const a = TEMP[id] ?? ENEMIES[id];
  if (!a) return null;
  const rng = new RNG(b.rngState);
  const e = makeEnemy(a, b.world, Math.max(1, level), `sp${b.uidCounter++}`, rng);
  b.rngState = rng.state;
  let spot: Pos | null = null;
  for (let d = 1; d <= 4 && !spot; d++) for (const p of tilesInRange(b, nearPos, d, d, nearPos.size)) if (free(b, e, p.x, p.y)) { spot = p; break; }
  if (!spot) return null;
  Object.assign(e, { x: spot.x, y: spot.y, team, summoned: true, moved: true, acted: true, ai: 'aggressive', npc: team === 'player' }, extra);
  b.units.push(e);
  spiritBattleStartUnit(e);
  return e;
}

// ───────────────────────── Start of each turn ─────────────────────────

export interface SPEvent { uid: string; heal: number; damage: number; source: string }

function roundUpkeep(b: Battle, events: SPEvent[]) {
  const st = b.sp!;
  st.round = b.turn;
  for (const x of st.timed) if (--x.turns <= 0 && !unitAt(b, x.k % b.width, Math.floor(x.k / b.width))) b.tiles[x.k] = x.was;
  st.timed = st.timed.filter((x) => x.turns > 0 || unitAt(b, x.k % b.width, Math.floor(x.k / b.width)));
  // Rolling boulders roll on.
  for (const bo of st.boulders) {
    for (let step = 0; step < 2; step++) {
      const x = bo.k % b.width + bo.dx, y = Math.floor(bo.k / b.width) + bo.dy;
      const t = tileAt(b, x, y);
      const o = inBounds(b, x, y) ? unitAt(b, x, y) : undefined;
      if (o) {
        const dmg = Math.min(o.hp - 1, Math.max(1, Math.ceil(o.stats.hp * 0.15)));
        if (dmg > 0) { o.hp -= dmg; events.push({ uid: o.uid, heal: 0, damage: dmg, source: 'is flattened by a rolling boulder' }); }
        bo.dx = -bo.dx; bo.dy = -bo.dy;
        break;
      }
      if (!t || (t !== 'plain' && t !== 'railTrack' && t !== 'sandBridge')) { bo.dx = -bo.dx; bo.dy = -bo.dy; break; }
      b.tiles[bo.k] = 'plain';
      bo.k = keyOf(b, x, y);
      b.tiles[bo.k] = 'rollingBoulder';
    }
  }
  // Big Blin's basket: captives fall out when the time is up (or if he's gone).
  for (const c of [...st.captured]) {
    const by = b.units.find((x) => x.uid === c.by);
    if (--c.turns > 0 && by) continue;
    const at = by ?? c.unit;
    let spot: Pos | undefined;
    for (let d = 1; d <= 5 && !spot; d++) spot = tilesInRange(b, at, d, d, at.size).find((p) => free(b, c.unit, p.x, p.y));
    if (!spot) continue;
    c.unit.x = spot.x; c.unit.y = spot.y; c.unit.moved = c.unit.acted = true;
    b.units.push(c.unit);
    st.captured = st.captured.filter((x) => x !== c);
    events.push({ uid: c.unit.uid, heal: 0, damage: 0, source: 'tumbles out of the basket' });
  }
}

export function spStartPhase(b: Battle, u: Unit, events: SPEvent[]) {
  const st = b.sp;
  if (st && u.team === 'player' && st.round !== b.turn) roundUpkeep(b, events);
  const heal = (pct: number, source: string, who = u) => {
    const amt = Math.min(who.stats.hp - who.hp, Math.ceil(who.stats.hp * pct));
    if (amt > 0) { who.hp += amt; events.push({ uid: who.uid, heal: amt, damage: 0, source }); }
  };
  const hurt = (who: Unit, dmg: number, source: string) => {
    dmg = Math.min(who.hp - 1, Math.floor(dmg));
    if (dmg > 0) { who.hp -= dmg; events.push({ uid: who.uid, heal: 0, damage: dmg, source }); }
    return Math.max(0, dmg);
  };
  const here = tilesOf(b, u);
  // Floor spikes hurt whoever stands on them.
  if (here.includes('floorSpikes') && moveTypeOf(u) !== 'flying' && !isTrain(u)) hurt(u, Math.max(1, u.stats.hp * 0.08), 'is cut by floor spikes');
  // Coatings recover by themselves after 2 turns.
  if (u.stCoat && --u.stCoat <= 0) { u.stCoat = 0; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is coated again' }); }
  if (has(u, 'armoredInsectSkill') && u.stArmorOpen) u.stArmorOpen--;
  // Trains: stations repair them; the Spirit Engineer and the royal engineers speed them up.
  if (isTrain(u)) {
    if (here.includes('trainStation')) { heal(0.1 * repairMult(b, u), 'is serviced at the station'); repairComponent(u); }
    const mov = (b.bonus === 'royalEngineers' && u.team === 'player' ? 1 : 0) + (b.units.some((a) => a.team === u.team && has(a, 'spiritEngineer')) ? 1 : 0);
    if (mov) buff(u, 'spiritEngineerMov', 'On schedule', 1, { mov });
    // The Sweet set looks after passengers and neighbours.
    const sweet = trainSetLevel(u, 'sweet');
    if (sweet) {
      for (const p of [...(u.cargo ?? []), ...alliesOf(b, u).filter((a) => unitDist(u, a) <= 1)]) {
        heal(sweet === 2 ? 0.2 : 0.1, 'Sweet set comforts', p);
        if (sweet === 2) p.statuses = p.statuses.filter((s) => s.kind === 'inspired' || s.kind === 'regen' || s.kind === 'protected' || s.kind === 'haste' || s.kind === 'veiled');
      }
    }
  }
  // Auras from allies.
  for (const a of alliesOf(b, u)) {
    const d = unitDist(u, a);
    if (has(a, 'spiritEngineer') && isTrain(u) && d <= 1) { heal(0.1 * repairMult(b, u), "Link's repairs"); repairComponent(u); }
    if (has(a, 'forestMelodyST') && d <= 2) { heal(0.1, 'Forest Melody'); u.sta = Math.min(u.stats.sta, u.sta + 3); }
    if (has(a, 'snowMelody') && d <= 2) u.statuses = u.statuses.filter((x) => x.kind !== 'freeze');
    if (has(a, 'fireMelody') && d <= 2) u.statuses = u.statuses.filter((x) => x.kind !== 'burn');
    if (has(a, 'sacredGuardian') && d <= 2) { u.statuses = u.statuses.filter((x) => x.kind !== 'curse'); if (u.phPossessed) u.phPossessed.turns = 0; }
  }
  // Detection.
  const reveal = (r: number) => { let n = 0; for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= r) { e.hidden = false; n++; } return n; };
  if (has(u, 'railwayKnowledge')) { reveal(6); for (const t of b.traps ?? []) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= 6) t.hidden = false; }
  if (has(u, 'livingTorch')) reveal(3);
  // Metal ChuChu's Static Field.
  if (hasBuff(u, 'staticField')) for (const e of foesOf(b, u)) if (unitDist(u, e) <= 1) hurt(e, 4 + Math.floor(effectiveStats(u).mag / 4), 'is shocked by the static field');
  // ── Bosses ──
  if (has(u, 'iceAndFire')) {
    u.stForm = u.stForm === 'fire' ? 'ice' : 'fire';
    const wpn = u.stForm === 'fire' ? 'fraazFlame' : 'fraazFrost';
    if (u.weapons.includes(wpn)) u.weapons = [wpn, ...u.weapons.filter((x) => x !== wpn)];
    events.push({ uid: u.uid, heal: 0, damage: 0, source: u.stForm === 'fire' ? 'bursts into flame (fire form)' : 'freezes over (ice form)' });
  }
  if (has(u, 'thornedMenaceSkill')) {
    for (const e of foesOf(b, u)) if (unitDist(u, e) <= 2 && hurt(e, e.stats.hp * 0.05, 'is lashed by thorns') && (b.turn + e.uid.length) % 3 === 0) addStatus(e, 'poison', 2);
  }
  if (has(u, 'ancientDemonSkill') && u.team === 'enemy' && b.turn % 2 === 0) {
    const t = foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) >= 2 && unitDist(u, e) <= 5).sort((x, y) => x.hp - y.hp)[0];
    if (t) for (const l of boulder(b, u, t)) events.push({ uid: t.uid, heal: 0, damage: 0, source: l });
  }
  if (has(u, 'demonicInfluence') && u.team === 'enemy' && u.isBoss && b.turn % 3 === 0 && b.units.filter((x) => x.team === u.team && x.summoned).length < 3) {
    if (spawnTemp(b, 'phantomEye', u, u.team, u.level - 2)) events.push({ uid: u.uid, heal: 0, damage: 0, source: 'summons a Phantom Eye' });
  }
}

const repairMult = (b: Battle, u: Unit) => (u.team === 'player' && b.bonus === 'royalEngineers' ? 1.25 : 1);

// ───────────────────────── After moving ─────────────────────────

/** After a unit moves: Tears of Light are picked up, floor spikes cut, and Stagnox turns to face its foe. */
export function spAfterMove(b: Battle, u: Unit): string | null {
  const lines: string[] = [];
  for (const p of footprint(u.x, u.y, u.size)) {
    const k = keyOf(b, p.x, p.y);
    if (b.tiles[k] === 'tearOfLight' && !isTrain(u)) {
      b.tiles[k] = 'plain';
      buff(u, 'tearOfLight', 'Tear of Light', 3);
      lines.push(`${u.name} picks up a Tear of Light: their weapon shines with sacred power!`);
    }
  }
  if (tilesOf(b, u).includes('floorSpikes') && moveTypeOf(u) !== 'flying' && !isTrain(u) && u.hp > 1) {
    const d = Math.min(u.hp - 1, Math.max(1, Math.ceil(u.stats.hp * 0.08)));
    u.hp -= d;
    lines.push(`${u.name} steps on floor spikes (−${d}).`);
  }
  if (has(u, 'armoredInsectSkill')) { const n = foesOf(b, u).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0]; if (n) face(u, n); }
  if (!lines.length) return null;
  b.log.push(...lines);
  return lines.join(' ');
}

// ───────────────────────── Combat ─────────────────────────

export interface SPMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

/** Situational bonuses (combat.ts situational). */
export function spMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): SPMods {
  const m: SPMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const d = unitDist(u, foe, pos);
  const tags = stTags(u);
  const allies = b.units.filter((a) => a !== u && a.team === u.team);
  const within = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  const here = footprint(pos.x, pos.y, u.size).map((p) => tileAt(b, p.x, p.y));
  if (has(u, 'spiritEngineer')) m.hit += 10;
  if (has(u, 'spiritLocomotive') && here.includes('spiritTrack')) { m.str += 3; m.def += 3; }
  if (isTrain(u) && trainSetLevel(u, 'wooden') === 2) m.avoid += 10;
  if (has(u, 'blinBrute')) { const n = Math.min(3, allies.filter((a) => tid(a) === 'miniblin' && within(a, 3)).length); m.str += 2 * n; m.def += 2 * n; }
  if (w?.type === 'sword' && allies.some((a) => has(a, 'swordTraining') && within(a, 2))) { m.skl += 2; m.hit += 5; }
  if (hasBuff(u, 'swordLesson')) m.crit += 10;
  // Cole's aura and his army's bonus don't stack; the commanders' bonuses are for their allies.
  if (u.team === 'player' && b.bonus === 'demonicInfluence' && isPossessed(u) && !u.isCommander) { m.str += 3; m.mag += 3; }
  else if (isDemonic(u) && allies.some((a) => has(a, 'demonicInfluence') && within(a, 3))) { m.str += 3; m.mag += 3; }
  if (u.team === 'player' && b.bonus === 'demonKingsRail' && isDemonic(u) && !u.isCommander) { m.str += 4; m.res += 4; }
  if (allies.some((a) => has(a, 'sandMelody') && within(a, 2))) m.def += 2;
  if (w && w.type !== 'staff' && w.type !== 'instrument' && allies.some((a) => has(a, 'fireMelody') && within(a, 2))) m.dmg += 2;
  if (has(u, 'lavaColossusSkill') && [...here, ...tilesInRange(b, { x: pos.x, y: pos.y }, 1, 1, u.size).map((p) => tileAt(b, p.x, p.y))].includes('lava')) { m.def += 10; m.res += 10; }
  if (w?.st?.includes('counterPower') && !initiating) m.dmg += 4;
  if (w?.st?.includes('extraFire')) m.dmg += 3;
  if (tags.has('mechanic') && w?.type === 'siege') m.hit += 10;
  // The Iron Helmet.
  const helm = u.gear?.head === 'chuchuIronHelmet';
  if (helm && !isChu(u)) { m.def -= 12; m.res -= 2; }
  if (has(u, 'ironHelmet')) {
    if (!u.stHelmetOff && !helm) m.def += 12;
    if (u.stHelmetOff && helm) { m.def -= 12; m.res -= 2; }
  }
  // Coated elemental ChuChus: +4 MAG.
  if (coated(u)) m.mag += 4;
  // Byrne's Iron Gauntlet (and his army): melee ignores 15% of DEF.
  if (d <= 1 && (has(foe, 'ironGauntletSkill') || (foe.team === 'player' && b.bonus === 'ironGauntlet'))) m.def -= Math.ceil(effectiveStats(u).def * 0.15);
  // The Sacred Spirit Gem in a possessed Phantom.
  if (tags.has('spiritGem') && PHANTOM_FORMS.includes(tid(u))) { m.str += 3; m.mag += 3; m.skl += 3; m.spd += 3; m.def += 3; m.res += 3; }
  return m;
}

/** Can't attack: Spirit Zelda carries no physical weapon (handled by her loadout); nothing else yet. */
export function spCannotAttack(atk: Unit, w: WeaponDef | undefined): boolean {
  return tid(atk) === 'spiritZelda' && !!w && w.type !== 'magic' && w.type !== 'instrument' && w.type !== 'staff';
}

/** Damage multiplier: trains and their armor, Zelda's spirit, boss shells and forms, the ChuChus, the sages. */
export function spMultiplier(b: Battle, atk: Unit, atkPos: Pos, def: Unit, magical: boolean, w: WeaponDef | undefined, d: number, element?: Element): number {
  let m = 1;
  const sacred = isSacredHit(atk, w, element);
  const exposed = hasBuff(def, 'stExposed') || hasBuff(def, 'phExposed') || def.statuses.some((s) => s.kind === 'exposed');
  // Trains.
  if (isTrain(def)) {
    const steel = trainSetLevel(def, 'steel');
    if (steel === 2) m *= 0.85;
    if (has(def, 'armoredPlating')) m *= 0.8;
    if (has(def, 'multiCarTrain') && !def.stCarsOut) m *= 0.5;
  }
  // A train's cannons are built to hit other trains: 60% against anything else.
  if (w?.crewed && isTrain(atk) && !isVessel(def)) m *= 0.6;
  if (w?.st?.includes('collision')) {
    if (has(atk, 'darkCollision')) m *= 1.25;
    if (tilesOf(b, def).includes('railCrossing')) m *= 2;
  }
  // Zelda's spirit: ordinary blows pass through her, sacred and demonic power doesn't.
  if (tid(def) === 'spiritZelda') m *= sacred || element === 'dark' ? 1.5 : magical ? 1 : 0.5;
  // Bosses.
  if (has(def, 'armoredInsectSkill')) { if (def.stArmorOpen) m *= 1.5; else if (isFrontal(def, atkPos, atk.size)) m *= 0.2; }
  if (has(def, 'iceAndFire') && element && def.stForm) {
    if (element === def.stForm) return 0;
    if ((element === 'fire' && def.stForm === 'ice') || (element === 'ice' && def.stForm === 'fire')) m *= 2;
  }
  if ((has(def, 'thornedMenaceSkill') || has(def, 'lavaColossusSkill') || has(def, 'ancientDemonSkill')) && !exposed) m *= 0.5;
  if (has(def, 'demonicIncarnation') && sacred) m *= 1.5;
  if (has(def, 'stolenVesselSkill') && !sacred) m *= 0.5;
  if (has(atk, 'stolenVesselSkill') && element === 'dark') m *= 1.25;
  // The ChuChus.
  if (has(def, 'combustibleBody') && element === 'fire') return 0;
  if (has(def, 'frozenBody') && element === 'ice') return 0;
  if ((has(def, 'volatileCharge') || has(def, 'permanentConduction')) && element === 'lightning') return 0;
  if (has(def, 'combustibleBody') && (element === 'ice' || element === 'water')) m *= 1.5;
  if (has(def, 'frozenBody') && element === 'fire') m *= 1.5;
  if (has(def, 'volatileCharge') && d > 1 && (w?.type === 'bow' || w?.type === 'sling')) m *= 1.5;
  if (has(def, 'permanentConduction')) {
    const ranged = d > 1 || w?.type === 'bow' || w?.type === 'sling' || !!w?.bombs;
    if (ranged || sacred || !!w?.beam) m *= 1.5;
    else if (!magical) return 0;
  }
  if (has(def, 'ironHelmet') && w?.pierce) m *= 1.5;
  // The sages' melodies.
  const defNear = (s: string) => b.units.some((a) => a !== def && a.team === def.team && has(a, s) && unitDist(a, def) <= 2) || has(def, s);
  const atkNear = (s: string) => b.units.some((a) => a !== atk && a.team === atk.team && has(a, s) && unitDist(a, atk, atkPos) <= 2) || has(atk, s);
  if (element === 'ice' && defNear('snowMelody')) m *= 0.5;
  if (element === 'fire' && defNear('fireMelody')) m *= 0.5;
  if (element === 'dark' && defNear('sacredGuardian')) m *= 0.75;
  if (magical && tag(def, 'magicGuard')) m *= 0.75;
  if (magical && element === 'ice' && atkNear('snowMelody')) m *= 1.25;
  if (magical && element === 'water' && atkNear('oceanMelody')) m *= 1.25;
  // Commanders, Big Blin and the Pirate Necklace.
  if (atk.team === 'player' && b.bonus === 'sacredSymphony' && sacred) m *= 1.2;
  if (b.naval && tag(atk, 'boarding')) m *= 1.25;
  if (b.naval && hasBuff(atk, 'boardingAssault')) m *= 1.5;
  if (atk.stSurfaced) m *= 1.5;
  return m;
}

/** After a hit: ChuChus adapt, helmets fly, Phantoms are exposed, armor cracks, cars are knocked out. */
export function spAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element?: Element): string[] {
  const lines: string[] = [];
  const sacred = isSacredHit(by, w, element);
  if (target.hp > 0) {
    // A Standard ChuChu takes on the element that hit it.
    if (has(target, 'elementalAdaptation') && element && ['fire', 'ice', 'lightning'].includes(element)) {
      const into = element === 'fire' ? 'chuchuFire' : element === 'ice' ? 'chuchuIce' : 'chuchuElectric';
      if (TEMPLATES[into]) {
        const was = target.name;
        transformInto(b, target, into);
        target.artId = into;
        target.stCoat = 0;
        lines.push(`${was} soaks up the ${element} and becomes a ${target.name}!`);
      }
    }
    // A sacred blow lays a Phantom (or a sacred-sensitive boss) open.
    if (sacred && (isPhantom(target) || has(target, 'thornedMenaceSkill'))) buff(target, 'stExposed', 'Exposed', 1);
    // The Whip knocks the helmet off.
    if (w?.id === 'whip' && has(target, 'ironHelmet') && !target.stHelmetOff) { target.stHelmetOff = true; lines.push(`The Whip yanks ${target.name}'s helmet off!`); }
    // Wind lays Stagnox's armor open.
    if ((w?.ph?.includes('whirlwind') || w?.st?.includes('wind')) && has(target, 'armoredInsectSkill')) { target.stArmorOpen = 2; lines.push(`The wind blows ${target.name}'s armor open!`); }
    if (has(target, 'multiCarTrain') && !target.stCarsOut && dmg >= target.stats.hp * 0.15) { target.stCarsOut = true; lines.push(`A car of the ${target.name} is knocked out — its armor no longer holds!`); }
    if (has(target, 'permanentConduction') && element === 'lightning') target.mp = Math.min(target.stats.mp, target.mp + 5);
    if (tid(target) === 'fraaz' && target.hp < target.stats.hp / 2 && !target.usedAbilities?.includes('fraazSplit')) {
      (target.usedAbilities ??= []).push('fraazSplit');
      if (splitFraaz(b, target)) lines.push(`${target.name} splits into two bodies!`);
    }
    if (dmg > 0) {
      if (w?.st?.includes('knockback') && !target.isBoss) pushAway(b, target, by, 1);
      if (isTrain(by) && trainSetLevel(by, 'dragon') === 2 && (b.turn + target.uid.length) % 4 === 0) addStatus(target, 'burn', 2);
      if (isTrain(by) && trainSetLevel(by, 'skull') === 2 && (b.turn + target.uid.length) % 4 === 1) addStatus(target, 'fear', 2);
    }
  }
  if (by.stSurfaced) by.stSurfaced = false;
  b.log.push(...lines);
  return lines;
}

/** After an exchange: ChuChu contact damage, the Electrical Counter, the Demon Train's other cars. */
export function spAfterCombat(b: Battle, attacker: Unit, defender: Unit, landed: { atk: number; def: number }): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const zap = (by: Unit, t: Unit, dmg: number) => {
    if (!b.units.includes(t)) return;
    dmg = Math.max(0, Math.min(t.hp - (t.isBoss || t.isCommander ? 1 : 0), Math.floor(dmg)));
    if (dmg <= 0) return;
    t.hp -= dmg;
    const killed = t.hp <= 0;
    out.push({ uid: t.uid, dmg, hp: t.hp, killed, by: by.uid });
    if (killed) { b.units = b.units.filter((x) => x !== t); if (!t.summoned) b.fallen.push(t); by.kills++; }
  };
  const w = WEAPONS[attacker.weapons[0]];
  const melee = unitDist(attacker, defender) <= 1 && w && w.type !== 'bow' && w.type !== 'sling' && w.type !== 'magic' && !w.magicContact;
  if (melee && attacker.hp > 0 && defender.hp > 0) {
    const mag = effectiveStats(defender).mag;
    if (has(defender, 'combustibleBody') && coated(defender)) { zap(defender, attacker, 3 + Math.floor(mag / 3)); if (attacker.hp > 0) addStatus(attacker, 'burn', 2); }
    if (has(defender, 'volatileCharge') && coated(defender)) zap(defender, attacker, 3 + Math.floor(mag / 3));
    if (has(defender, 'frozenBody') && coated(defender) && (b.turn + attacker.uid.length) % 3 === 0) addStatus(attacker, 'freeze', 1);
    if (has(defender, 'permanentConduction') && !w.bombs) { zap(defender, attacker, 4 + Math.floor(mag / 3)); if (attacker.hp > 0 && (b.turn + attacker.uid.length) % 4 === 0) addStatus(attacker, 'shock', 1); }
    if (hasBuff(defender, 'electricalCounter')) zap(defender, attacker, 6 + Math.floor(mag / 2));
  }
  if (has(attacker, 'multiCarTrain') && landed.atk > 0) {
    const others = b.units.filter((e) => e.team !== attacker.team && e !== defender && !e.hidden && unitDist(attacker, e) <= 4).slice(0, 2);
    const s = effectiveStats(attacker);
    for (const e of others) zap(attacker, e, Math.max(1, Math.floor(s.str * 0.5) - Math.floor(effectiveStats(e).def / 2)));
    if (others.length) b.log.push(`The ${attacker.name}'s other cars open fire!`);
  }
  if (has(attacker, 'armoredInsectSkill') && attacker.hp > 0) face(attacker, defender);
  return out;
}

/** On a kill: ChuChus explode, Malladus grows stronger as his demons fall, and spoils drop. */
export function spOnKill(b: Battle, by: Unit, victim: Unit, rng: RNG) {
  if (coated(victim)) {
    const mag = effectiveStats(victim).mag;
    const kind: StatusKind | null = has(victim, 'frozenBody') ? 'freeze' : has(victim, 'volatileCharge') ? 'shock' : 'burn';
    for (const e of b.units.filter((x) => x !== victim && x.hp > 0 && unitDist(x, victim) <= 1)) {
      const d = Math.min(e.hp - 1, 4 + Math.floor(mag / 3));
      if (d > 0) e.hp -= d;
      if (kind && rng.chance(40)) addStatus(e, kind, kind === 'burn' ? 2 : 1);
    }
    b.log.push(`${victim.name} explodes as it bursts!`);
  }
  if (isDemonic(victim)) {
    for (const m of b.units.filter((x) => x !== victim && x.team === victim.team && has(x, 'demonicIncarnation') && x.hp > 0)) {
      const cur = m.buffs.find((x) => x.id === 'demonicIncarnation')?.stats?.str ?? 0;
      if (cur >= 10) continue;
      buff(m, 'demonicIncarnation', 'Demonic Incarnation', 99, { str: cur + 2, mag: cur + 2 });
      b.log.push(`${m.name} grows stronger as ${victim.name} falls.`);
    }
  }
  const spoil = ST_SPOILS[victim.artId ?? victim.templateId ?? ''];
  if (spoil && victim.team === 'enemy' && by.team === 'player' && !victim.summoned && (ST_WORLD(b) || spoil !== 'stalfosSkull') && rng.chance(25)) {
    if (ST_QUEST.some((q) => q.id === spoil) || ['goronAmber'].includes(spoil)) spState(b).found.push(spoil);
    else (b.loot ??= []).push(spoil);
  }
  if (has(victim, 'ironHelmet') && !victim.stHelmetOff && victim.team === 'enemy' && by.team === 'player' && !victim.summoned && rng.chance(15) && GEAR.chuchuIronHelmet) (b.loot ??= []).push('chuchuIronHelmet');
}

/** A lethal blow on Zelda in a Phantom's armor: she slips out as a spirit instead. */
export function spSaveFromDeath(b: Battle, u: Unit): { line: string; heal: number } | null {
  if (!PHANTOM_FORMS.includes(tid(u)) || !TEMPLATES.spiritZelda) return null;
  if (!roomFor(b, u, 1)) return null;
  const boss = u.isBoss;
  transformInto(b, u, 'spiritZelda');
  if (!u.skills.includes('spectralPassage')) u.skills.push('spectralPassage');
  u.isBoss = boss;
  u.artId = 'spiritZelda';
  return { line: 'The armor shatters — Zelda\'s spirit slips free!', heal: Math.ceil(u.stats.hp * 0.35) };
}

/** Phantom Zelda's Royal Guardian: she takes the hit for an ally within 2 (combat.ts findInterceptor). */
export function spInterceptor(b: Battle, p: Unit, target: Unit): boolean {
  void b;
  return has(p, 'royalGuardianST') && unitDist(p, target) <= 2;
}

/** Sacred healing under Anjean's command (combat.ts heal multipliers). */
export function spHealMult(b: Battle, healer: Unit): number {
  return healer.team === 'player' && b.bonus === 'sacredSymphony' ? 1.2 : 1;
}

// ───────────────────────── ChuChu fusion ─────────────────────────

const ELEMENTAL_CHU = ['chuchuFire', 'chuchuIce', 'chuchuElectric'];
const NEW_CHU = ['chuchuStandard', ...ELEMENTAL_CHU, 'chuchuMetal', 'chuchuHelmet'];
/**
 * The expansion's fusion rules (twilight.ts chuFusion): Standard + Standard, or a Standard and an elemental,
 * make the larger elemental; two different elementals make a Purple ChuChu; Metal and Helmet ChuChus only
 * fuse with their own kind (a Helmet ChuChu that has lost its helmet fuses like an ordinary one).
 * Returns the resulting template, null if they can't fuse, or undefined for the older ChuChus' rules.
 */
export function spChuFusion(u: Unit, other: Unit): string | null | undefined {
  let a = tid(u), c = tid(other);
  if (!NEW_CHU.includes(a) && !NEW_CHU.includes(c)) return undefined;
  if (a === 'chuchuHelmet' && u.stHelmetOff && c !== 'chuchuHelmet') a = 'chuchuStandard';
  if (c === 'chuchuHelmet' && other.stHelmetOff && a !== 'chuchuHelmet') c = 'chuchuStandard';
  if (a === c) return a;
  if (['chuchuMetal', 'chuchuHelmet'].includes(a) || ['chuchuMetal', 'chuchuHelmet'].includes(c)) return null;
  if (a === 'chuchuStandard' && ELEMENTAL_CHU.includes(c)) return c;
  if (c === 'chuchuStandard' && ELEMENTAL_CHU.includes(a)) return a;
  if (ELEMENTAL_CHU.includes(a) && ELEMENTAL_CHU.includes(c)) return 'purpleChuchu';
  // A new ChuChu with one of the older ones: the older rules (mixed colours make purple).
  return 'purpleChuchu';
}

// ───────────────────────── Statuses ─────────────────────────

export function spImmune(u: Unit, kind: StatusKind): boolean {
  if (kind === 'burn' && has(u, 'combustibleBody')) return true;
  if (kind === 'freeze' && has(u, 'frozenBody')) return true;
  if (kind === 'shock' && (has(u, 'volatileCharge') || has(u, 'permanentConduction'))) return true;
  if ((kind === 'curse' || kind === 'fear') && u.race === 'lokomo') return true;
  if (kind === 'fear' && isTrain(u) && trainSetLevel(u, 'skull') === 2) return true;
  return false;
}

// ───────────────────────── Boss gimmicks ─────────────────────────

function splitFraaz(b: Battle, u: Unit): boolean {
  const half = spawnTemp(b, 'fraazHalf', u, u.team, u.level, { illusionOf: u.uid, summoned: true, moved: false, acted: false, artId: 'fraazHalf' });
  if (!half) return false;
  half.stForm = u.stForm === 'fire' ? 'ice' : 'fire';
  half.weapons = [half.stForm === 'fire' ? 'fraazFlame' : 'fraazFrost'];
  half.stats = { ...half.stats, hp: Math.ceil(u.stats.hp * 0.3), mag: Math.ceil(u.stats.mag * 0.6) };
  half.hp = half.stats.hp;
  return true;
}

/** Skeldritch hurls a boulder: a Whirlwind or a shield-bearer turns it back into his armor. */
function boulder(b: Battle, sk: Unit, t: Unit): string[] {
  const s = effectiveStats(sk);
  const turned = t.pack.some((p) => p.id === 'whirlwindST') || (!!t.gear?.shield && (b.turn + t.uid.length) % 2 === 0);
  if (turned) {
    const d = Math.min(sk.hp - 1, Math.max(1, s.str + 6 - Math.floor(s.def / 2)));
    if (d > 0) sk.hp -= d;
    buff(sk, 'stExposed', 'Armor cracked', 2);
    b.log.push(`${t.name} turns the boulder back — it smashes into ${sk.name}'s armor (−${d})!`);
    return [`turns the boulder back into ${sk.name}`];
  }
  const d = Math.min(t.hp - 1, Math.max(1, s.str + 6 - effectiveStats(t).def));
  if (d > 0) t.hp -= d;
  b.log.push(`${sk.name} hurls a boulder at ${t.name} (−${d}).`);
  return [`is hit by a boulder (−${d})`];
}

/** True while a paired boss fight still has a boss standing. */
export function spBossesRemain(b: Battle): boolean {
  return !!b.sp?.allBosses && b.units.some((u) => u.team === 'enemy' && u.isBoss);
}

/** Before the battle ends: Big Blin's captives come back out (beaten enemies count as fallen). */
export function spiritBeforeFinish(b: Battle) {
  const st = b.sp;
  if (st?.captured.length) {
    for (const c of st.captured) { if (c.unit.team === 'player') b.units.push(c.unit); else b.fallen.push(c.unit); }
    st.captured = [];
  }
  for (const u of [...b.units, ...b.fallen]) if (u.buffs) u.buffs = u.buffs.filter((x) => !x.id.startsWith('trainSet:'));
}

/** Every enemy is gone from the field (some may be in Big Blin's basket). */
export const spCapturedAll = (b: Battle) => !!b.sp?.captured.length && !b.units.some((u) => u.team === 'enemy');

// ───────────────────────── Abilities ─────────────────────────

const TILE = new Set(['whipSwing', 'songOfBirds', 'sandPillarAct', 'sandBridgeAct', 'wreckingRoll', 'eyeWarpST', 'sandAmbushAct', 'hornChargeChu']);
const TARGET = new Set(['possessPhantom', 'masterRepair', 'blinCapture', 'ironGrab', 'gauntletThrow', 'keyTheft', 'boulderHurl', 'iceFireBreath']);
const SPECIAL = new Set(SP_SPECIAL);
/** Enemy units use these on their own when they can (battle screen only). */
export const SP_ENEMY_CASTS = ['fraazSplit'];

export const isSpiritAbility = (def: AbilityDef) => SPECIAL.has(def.id);
export const spNeedsTile = (def: AbilityDef) => TILE.has(def.id);
export const spNeedsTarget = (def: AbilityDef) => TARGET.has(def.id);

/** Cost multiplier: the princess's possession, the Lokomo's songs, the Sacred Spirit Gem. */
export function spCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  if (!b) return 1;
  let m = 1;
  if ((def.id === 'possessPhantom' || def.id === 'spiritForm') && u.team === 'player' && b.bonus === 'unboundSpirit') m *= 0.75;
  if (u.team === 'player' && b.bonus === 'sacredSymphony' && (def.kind === 'song' || def.wild?.tags?.includes('sacred'))) m *= 0.8;
  if (def.kind === 'song' && tag(u, 'spiritGem')) m *= 0.75;
  return m;
}

/** A Phantom Zelda can possess: exposed or stunned (or time-frozen). */
export const possessable = (e: Unit) => isPhantom(e) && !e.isBoss
  && (hasBuff(e, 'stExposed') || hasBuff(e, 'phExposed') || hasBuff(e, 'timeFrozen') || e.statuses.some((s) => s.kind === 'exposed' || s.kind === 'stun' || s.kind === 'freeze'));
const PHANTOM_FORM_OF: Record<string, string> = { torchPhantom: 'phantomZeldaTorch', warpPhantom: 'phantomZeldaWarp', wreckerPhantom: 'phantomZeldaWrecker' };

function line(b: Battle, u: Unit, n: number): { stop: Pos | null; foe?: Unit; path: Pos[] }[] {
  const out: { stop: Pos | null; foe?: Unit; path: Pos[] }[] = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const path: Pos[] = [];
    let foe: Unit | undefined;
    let x = u.x, y = u.y;
    for (let i = 1; i <= n; i++) {
      x = u.x + dx * i; y = u.y + dy * i;
      if (!footprint(x, y, u.size).every((p) => inBounds(b, p.x, p.y))) break;
      const o = footprint(x, y, u.size).map((p) => unitAt(b, p.x, p.y)).find((v) => v && v !== u);
      if (o) { if (o.team !== u.team) foe = o; break; }
      const crush = u.skills.includes('rollingDestruction') || tid(u) === 'phantomZeldaWrecker' || tag(u, 'wrecker');
      if (anchorCost(b, u, x, y) >= INF && !(crush && footprint(x, y, u.size).every((p) => ['sandPillar', 'rollingBoulder', 'boulder', 'cracked', 'plain', 'railTrack'].includes(tileAt(b, p.x, p.y)!) || anchorCost(b, { ...u, size: 1 }, p.x, p.y) < INF))) break;
      path.push({ x, y });
    }
    out.push({ stop: path[path.length - 1] ?? null, foe, path });
  }
  return out;
}

export function spTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const out: Pos[] = [];
  const freeTiles = (from: Pos & { size: number }, min: number, max: number) => tilesInRange(b, from, min, max, from.size).filter((p) => free(b, u, p.x, p.y));
  switch (def.id) {
    case 'whipSwing': {
      const post = adjacentTile(b, u, 'whipPost');
      if (!post) return out;
      return tilesInRange(b, post, 1, 3, 1).filter((p) => free(b, u, p.x, p.y) && footDist(p.x, p.y, u.size, u.x, u.y, u.size) >= 2);
    }
    case 'songOfBirds': return freeTiles(u, 1, 5);
    case 'sandAmbushAct': return freeTiles(u, 1, 5);
    case 'eyeWarpST':
      for (const e of foesOf(b, u).filter((x) => !x.hidden && unitDist(u, x) <= 8)) for (const p of tilesInRange(b, e, 1, 1, e.size)) if (free(b, u, p.x, p.y)) out.push(p);
      return out;
    case 'sandPillarAct':
      return tilesInRange(b, u, 1, 3, u.size).filter((p) => !unitAt(b, p.x, p.y) && ['plain', 'forest', 'railTrack', 'sandPile'].includes(tileAt(b, p.x, p.y)!));
    case 'sandBridgeAct':
      return tilesInRange(b, u, 1, 3, u.size).filter((p) => !unitAt(b, p.x, p.y) && ['water', 'chasm', 'lava', 'sinkingSand', 'sandVortex', 'poisonWater'].includes(tileAt(b, p.x, p.y)!));
    case 'wreckingRoll': case 'hornChargeChu':
      for (const l of line(b, u, def.id === 'wreckingRoll' ? 4 : 3)) {
        if (l.foe) out.push({ x: l.foe.x, y: l.foe.y });
        else if (l.stop) out.push(l.stop);
      }
      return out;
  }
  return out;
}

export function spTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  switch (def.id) {
    case 'possessPhantom': return foesOf(b, u).filter((e) => unitDist(u, e) <= 1 && possessable(e));
    case 'masterRepair': return alliesOf(b, u).filter((a) => unitDist(u, a) <= 1 && ((isVessel(a) || a.race === 'construct') ? a.hp < a.stats.hp || !!a.damaged && Object.values(a.damaged).some(Boolean) : (a.wear?.[a.weapons[0]] ?? 0) > 0));
    case 'blinCapture': return foesOf(b, u).filter((e) => unitDist(u, e) === 1 && e.size === 1 && !e.isBoss && !e.isCommander && e.hp < e.stats.hp * 0.25);
    case 'ironGrab': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) >= 2 && unitDist(u, e) <= 3);
    case 'gauntletThrow': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) === 1 && !e.isBoss && e.size <= 2);
    case 'keyTheft': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) === 1 && e.pack.length > 0);
    case 'boulderHurl': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) >= 2 && unitDist(u, e) <= 5);
    case 'iceFireBreath': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) <= 3);
  }
  return [];
}

const SWITCH_TILES = ['railSwitch'];

export function spUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isSpiritAbility(def)) return undefined;
  if (spNeedsTile(def) && !spTiles(b, u, def).length) return 'Nowhere to go';
  if (spNeedsTarget(def) && !spTargets(b, u, def).length) return def.id === 'possessPhantom' ? 'No exposed or stunned Phantom next to you' : 'No one in range';
  const musicians = (r: number) => alliesOf(b, u).filter((a) => unitDist(u, a) <= r && (a.race === 'lokomo' || a.weapons.includes('spiritFlute')));
  switch (def.id) {
    case 'throwSwitch': return adjacentTile(b, u, SWITCH_TILES as Terrain[]) ? null : 'No Railway Switch next to you';
    case 'repairTrack': return adjacentTile(b, u, 'brokenTrack') && brokenStretch(b, u).length ? null : 'No Broken Track next to you';
    case 'whipSwing': return u.weapons.includes('whip') ? null : 'Needs a Whip';
    case 'songOfDiscovery': return u.turnUses?.['pt:songOfDiscovery'] === b.turn ? 'Already used this turn' : null;
    case 'songOfLight': return tilesInRange(b, u, 0, 5, u.size).some((p) => tileAt(b, p.x, p.y) === 'lightStatue') ? null : 'No Light Statue within 5';
    case 'lokomoDuet': return musicians(2).length ? null : 'Needs another musician (a Lokomo or a Spirit Flute) within 2';
    case 'songOfRestoration': {
      const zelda = [u, ...alliesOf(b, u)].some((a) => unitDist(u, a) <= 3 && isZeldaForm(a));
      const lokomo = [u, ...alliesOf(b, u)].some((a) => unitDist(u, a) <= 3 && a.race === 'lokomo');
      return zelda && lokomo ? null : 'Needs Zelda and a Lokomo within 3';
    }
    case 'spiritForm': return TEMPLATES.spiritZelda ? null : 'Unavailable';
    case 'possessPhantom': {
      const t = spTargets(b, u, def)[0];
      const form = PHANTOM_FORM_OF[tid(t)] ?? 'phantomZelda';
      return TEMPLATES[form] && roomFor(b, { ...u, x: t.x, y: t.y }, TEMPLATES[form].size, [t, u]) ? null : 'No room for the armor';
    }
    case 'returnToBody': return u.originalForm || tid(u) !== 'zeldaST' ? null : 'Already in her body';
    case 'reequipHelmet': return u.stHelmetOff ? null : 'The helmet is on';
    case 'reigniteChu': case 'refreeze': case 'recharge': return u.stCoat ? null : 'Already coated';
    case 'flameBurst': case 'frostBurst': case 'dischargeST': return u.stCoat ? 'The coating is spent' : foesOf(b, u).some((e) => unitDist(u, e) <= (def.id === 'dischargeST' ? 1 : 2)) ? null : 'No enemies in reach';
    case 'frozenSurfaceChu': return tilesInRange(b, u, 0, 2, u.size).some((p) => tileAt(b, p.x, p.y) === 'water') ? null : 'No water within 2';
    case 'staticField': return null;
    case 'fraazSplit': return u.hp > u.stats.hp / 2 ? 'Only below half HP' : null;
    case 'merchantsAppraisal': return null;
    case 'sweepingSmash': return b.units.some((x) => x !== u && unitDist(u, x) === 1) ? null : 'Nobody next to you';
  }
  return null;
}

/** The connected stretch of Broken Track next to the unit (not a closed junction). */
function brokenStretch(b: Battle, u: Unit): number[] {
  const start = tilesInRange(b, u, 1, 1, u.size).map((p) => keyOf(b, p.x, p.y)).find((k) => b.tiles[k] === 'brokenTrack' && !b.sp?.junctions.includes(k));
  if (start === undefined) return [];
  const out = new Set<number>([start]);
  const todo = [start];
  while (todo.length) {
    const k = todo.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = k % b.width + dx, y = Math.floor(k / b.width) + dy;
      if (!inBounds(b, x, y)) continue;
      const n = keyOf(b, x, y);
      if (!out.has(n) && b.tiles[n] === 'brokenTrack' && !b.sp?.junctions.includes(n)) { out.add(n); todo.push(n); }
    }
  }
  return [...out];
}

export interface SPOutcome {
  hits: { uid: string; dmg: number; hp: number; killed: boolean; statuses: StatusKind[] }[];
  heals: { uid: string; amount: number }[];
  statuses: { uid: string; kind: StatusKind }[];
  cleansed: string[];
  buffed: string[];
  lines: string[];
  transformed?: string;
  warped?: { from: Pos; to: Pos };
  free?: boolean;
}

export function castSpirit(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): SPOutcome | null {
  if (!isSpiritAbility(def)) return null;
  const out: SPOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const s = effectiveStats(u);
  const st = spState(b);
  const strike = (e: Unit, dmg: number, status?: StatusKind) => {
    dmg = Math.min(e.hp, Math.max(1, Math.floor(dmg)));
    if (e.buffs.some((x) => x.barrier)) dmg = 0;
    e.hp -= dmg;
    const killed = e.hp <= 0;
    const statuses: StatusKind[] = [];
    if (!killed && status) { addStatus(e, status, 2); statuses.push(status); }
    out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses });
    if (killed) { u.kills++; spOnKill(b, u, e, rng); b.units = b.units.filter((x) => x !== e); if (!e.summoned) b.fallen.push(e); b.log.push(`${u.name} defeated ${e.name}.`); }
    return dmg;
  };
  const heal = (a: Unit, amt: number) => { amt = Math.min(a.stats.hp - a.hp, Math.ceil(amt)); if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); } return amt; };
  const timed = (k: number, t: Terrain, turns: number) => { st.timed.push({ k, was: b.tiles[k], turns }); b.tiles[k] = t; };
  const tele = (to: Pos) => { out.warped = { from: { x: u.x, y: u.y }, to: { ...to } }; u.x = to.x; u.y = to.y; };
  const foes = (r: number) => foesOf(b, u).filter((e) => unitDist(u, e) <= r);
  const dash = (bonus: number, reach: number) => {
    const l = line(b, u, reach).find((x) => (x.foe && x.foe.x === at!.x && x.foe.y === at!.y) || (x.stop && x.stop.x === at!.x && x.stop.y === at!.y));
    if (!l) return;
    const land = l.path[l.path.length - 1];
    // Obstacles along the way are crushed.
    for (const q of l.path) for (const f of footprint(q.x, q.y, u.size)) {
      const k = keyOf(b, f.x, f.y);
      if (['sandPillar', 'rollingBoulder', 'boulder', 'cracked'].includes(b.tiles[k])) { b.tiles[k] = 'plain'; st.boulders = st.boulders.filter((o) => o.k !== k); }
    }
    if (land && free(b, u, land.x, land.y)) tele(land);
    if (l.foe) {
      strike(l.foe, s.str + (WEAPONS[u.weapons[0]]?.might ?? 0) + bonus - effectiveStats(l.foe).def);
      if (l.foe.hp > 0) pushAway(b, l.foe, u, 1);
    }
  };
  switch (def.id) {
    // ── Railway and battlefield actions ──
    case 'throwSwitch': {
      st.junctionsOpen = !st.junctionsOpen;
      for (const k of st.junctions) if (!unitAt(b, k % b.width, Math.floor(k / b.width))) b.tiles[k] = st.junctionsOpen ? 'railJunction' : 'brokenTrack';
      st.spikesUp = !st.spikesUp;
      for (const k of st.spikes) if (!unitAt(b, k % b.width, Math.floor(k / b.width))) b.tiles[k] = st.spikesUp ? 'floorSpikes' : 'plain';
      out.free = tag(u, 'mechanic');
      out.lines.push(`${u.name} throws the switch: the junction ${st.junctionsOpen ? 'opens' : 'closes'}${st.spikes.length ? ` and the spikes ${st.spikesUp ? 'spring up' : 'retract'}` : ''}.`);
      return out;
    }
    case 'repairTrack': {
      const ks = brokenStretch(b, u);
      for (const k of ks) b.tiles[k] = 'railTrack';
      out.free = isEngineer(u);
      out.lines.push(`${u.name} repairs ${ks.length} space${ks.length === 1 ? '' : 's'} of track.`);
      return out;
    }
    case 'whipSwing': tele(at!); out.lines.push(`${u.name} swings across on the Whip.`); return out;
    // ── Spirit Flute songs ──
    case 'songOfAwakening': {
      const g = spawnTemp(b, 'awakenedGuardian', u, u.team, u.level, { moved: false, acted: false, artId: 'armos' });
      out.lines.push(g ? 'A stone guardian stirs and rises to fight beside you.' : 'Nothing answers the song.');
      return out;
    }
    case 'stSongOfHealing': {
      for (const a of [u, ...alliesOf(b, u)]) if (unitDist(u, a) <= 3) heal(a, a.stats.hp * 0.3 * spHealMult(b, u));
      out.lines.push('The Song of Healing washes over the army.');
      return out;
    }
    case 'songOfDiscovery': {
      (u.turnUses ??= {})['pt:songOfDiscovery'] = b.turn;
      let n = 0;
      for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= 6) { e.hidden = false; n++; }
      for (const t of b.traps ?? []) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= 6) t.hidden = false;
      const spot = tilesInRange(b, u, 1, 4, u.size).find((p) => tileAt(b, p.x, p.y) === 'plain' && !unitAt(b, p.x, p.y) && !(b.digSpots ?? []).some((q) => q.x === p.x && q.y === p.y));
      if (spot) (b.digSpots ??= []).push(spot);
      out.lines.push(`The Song of Discovery: ${n} hidden enem${n === 1 ? 'y' : 'ies'} revealed${spot ? ', and something is buried nearby' : ''}.`);
      return out;
    }
    case 'songOfBirds': tele(at!); out.lines.push(`A flock of birds carries ${u.name} away.`); return out;
    case 'songOfLight': {
      let lit = 0;
      for (const p of tilesInRange(b, u, 0, 5, u.size)) {
        if (tileAt(b, p.x, p.y) !== 'lightStatue') continue;
        lit++;
        b.tiles[keyOf(b, p.x, p.y)] = 'sacredLight';
        for (const e of foesOf(b, u)) if (footDist(p.x, p.y, 1, e.x, e.y, e.size) <= 2) { buff(e, 'stExposed', 'Exposed by light', 2); addStatus(e, 'exposed', 2); out.statuses.push({ uid: e.uid, kind: 'exposed' }); }
      }
      b.fog = false;
      out.lines.push(`${lit} Light Statue${lit === 1 ? '' : 's'} blaze${lit === 1 ? 's' : ''} up; the darkness around them is driven back.`);
      return out;
    }
    case 'lokomoDuet': {
      let n = 0;
      for (const p of tilesInRange(b, u, 0, 5, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'brokenTrack' && !st.junctions.includes(k)) { b.tiles[k] = 'railTrack'; n++; } }
      for (const a of [u, ...alliesOf(b, u)]) if (unitDist(u, a) <= 2) { buff(a, 'lokomoDuet', 'Lokomo Duet', 2, { str: 2, mag: 2, def: 2, res: 2 }); out.buffed.push(a.uid); }
      const realm = worldDef(b.world).name;
      out.lines.push(`The ${realm} Duet rings out${n ? `: ${n} broken rails shine back into place` : ''}.`);
      return out;
    }
    case 'songOfRestoration': {
      let n = 0;
      for (const e of foesOf(b, u)) {
        if (unitDist(u, e) > 6 || !isDemonic(e)) continue;
        buff(e, 'restorationWeakened', 'Song of Restoration', 3, { str: -5, mag: -5, def: -5, res: -5 });
        if (has(e, 'demonicIncarnation') || has(e, 'stolenVesselSkill')) buff(e, 'stExposed', 'Exposed', 3);
        n++;
      }
      out.lines.push(`The Song of Restoration: ${n} demonic foe${n === 1 ? ' is' : 's are'} weakened.`);
      return out;
    }
    // ── Equipment ──
    case 'sandPillarAct': timed(keyOf(b, at!.x, at!.y), 'sandPillar', 3); out.lines.push('A pillar of sand rises.'); return out;
    case 'sandBridgeAct': {
      const k0 = keyOf(b, at!.x, at!.y);
      const wet = b.tiles[k0];
      timed(k0, 'sandBridge', 3);
      const dx = Math.sign(at!.x - u.x), dy = Math.sign(at!.y - u.y);
      for (let i = 1; i <= 2; i++) { const x = at!.x + dx * i, y = at!.y + dy * i; if (tileAt(b, x, y) === wet) timed(keyOf(b, x, y), 'sandBridge', 3); }
      out.lines.push('Sand pours out into a bridge.');
      return out;
    }
    case 'blinCapture': {
      const t = target!;
      b.units = b.units.filter((x) => x !== t);
      st.captured.push({ unit: t, by: u.uid, turns: 3 });
      out.lines.push(`${u.name} stuffs ${t.name} into the basket!`);
      return out;
    }
    case 'ironGrab': {
      const t = target!;
      pullToward(b, t, u, 3);
      strike(t, s.str + 4 - effectiveStats(t).def);
      out.lines.push(`The gauntlet shoots out and drags ${t.name} in!`);
      return out;
    }
    case 'gauntletThrow': {
      const t = target!;
      const moved = pushAway(b, t, u, 3);
      const blocked = !moved || unitDist(u, t) < 4;
      strike(t, s.str + 6 - effectiveStats(t).def, blocked && t.hp > 0 ? 'stun' : undefined);
      out.lines.push(`${u.name} hurls ${t.name} across the field!`);
      return out;
    }
    case 'wreckingRoll': dash(8, 4); out.lines.push(`${u.name} rolls into a wrecking ball!`); return out;
    case 'hornChargeChu': dash(4, 3); out.lines.push(`${u.name} charges, horns first!`); return out;
    // ── Zelda ──
    case 'spiritForm': {
      const before = u.name;
      transformInto(b, u, 'spiritZelda');
      if (!u.skills.includes('spectralPassage')) u.skills.push('spectralPassage');
      u.artId = 'spiritZelda';
      out.transformed = before;
      out.lines.push('Zelda\'s spirit steps out of her body.');
      return out;
    }
    case 'possessPhantom': {
      const t = target!;
      const form = PHANTOM_FORM_OF[tid(t)] ?? 'phantomZelda';
      const ratio = t.hp / t.stats.hp;
      b.units = b.units.filter((x) => x !== t);
      if (!t.summoned) b.fallen.push(t);
      u.kills++;
      const before = u.name;
      u.x = t.x; u.y = t.y;
      transformInto(b, u, form);
      u.artId = form;
      u.hp = Math.max(1, Math.ceil(u.stats.hp * Math.max(0.5, ratio)));
      out.transformed = before;
      out.lines.push(`Zelda pours herself into the ${t.name}'s armor — Phantom Zelda rises!`);
      return out;
    }
    case 'returnToBody': {
      const before = u.name;
      transformInto(b, u, 'zeldaST');
      u.artId = 'zeldaST';
      out.transformed = before;
      out.lines.push('Zelda returns to her own body.');
      return out;
    }
    case 'eyeWarpST': tele(at!); out.lines.push(`${u.name} warps through the shadows.`); return out;
    // ── Named characters ──
    case 'masterRepair': {
      const t = target!;
      if (isVessel(t) || t.race === 'construct') { heal(t, t.stats.hp * 0.3 * repairMult(b, u)); const c = repairComponent(t); out.lines.push(`${u.name} patches up the ${t.name}${c ? ` (the ${c} works again)` : ''}.`); }
      else { if (t.wear) t.wear[t.weapons[0]] = 0; out.lines.push(`${u.name} hammers ${t.name}'s ${WEAPONS[t.weapons[0]]?.name ?? 'weapon'} as good as new.`); }
      return out;
    }
    case 'demonicSummon': {
      let n = 0;
      for (const id of ['phantomEye', 'keese']) if (spawnTemp(b, id, u, u.team, Math.max(1, u.level - 2))) n++;
      out.lines.push(`${n} creature${n === 1 ? '' : 's'} answer the chancellor's call.`);
      return out;
    }
    case 'merchantsAppraisal': {
      for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= 6) e.hidden = false;
      const spot = tilesInRange(b, u, 1, 4, u.size).find((p) => tileAt(b, p.x, p.y) === 'plain' && !unitAt(b, p.x, p.y));
      if (spot) (b.digSpots ??= []).push(spot);
      out.lines.push('Linebeck III sniffs the air. "Treasure. Right... about... there."');
      return out;
    }
    case 'sweepingSmash': {
      const mt = WEAPONS[u.weapons[0]]?.might ?? 0;
      for (const x of b.units.filter((v) => v !== u && unitDist(u, v) === 1)) strike(x, s.str + mt - 2 - effectiveStats(x).def);
      out.lines.push(`${u.name} swings wildly at everything around him!`);
      return out;
    }
    case 'pirateRally': {
      for (const a of alliesOf(b, u)) if (unitDist(u, a) <= 3 && ['miniblin', 'bulblin', 'bulblinArcher', 'kingBulblin', 'shadowBulblin'].includes(tid(a))) { buff(a, 'pirateRally', 'Pirate Rally', 3, { str: 3, spd: 3 }); out.buffed.push(a.uid); }
      out.lines.push(`${u.name} bellows: the Blins rally!`);
      return out;
    }
    case 'sandAmbushAct': tele(at!); u.hidden = true; u.stSurfaced = true; out.lines.push(`${u.name} dives under the sand.`); return out;
    case 'keyTheft': {
      const t = target!;
      const p = t.pack.splice(0, 1)[0];
      if (p) (b.loot ??= []).push(p.id);
      const spot = tilesInRange(b, u, 2, 4, u.size).filter((q) => free(b, u, q.x, q.y)).sort((q, r) => footDist(r.x, r.y, u.size, t.x, t.y, t.size) - footDist(q.x, q.y, u.size, t.x, t.y, t.size))[0];
      if (spot) tele(spot);
      out.lines.push(`${u.name} snatches ${p ? 'something' : 'nothing'} from ${t.name} and runs!`);
      return out;
    }
    // ── Bosses ──
    case 'iceFireBreath': {
      const t = target!;
      const el: Element = u.stForm === 'ice' ? 'ice' : 'fire';
      for (const e of [t, ...foesOf(b, u).filter((x) => x !== t && unitDist(x, t) <= 1)]) {
        const mult = spMultiplier(b, u, u, e, true, undefined, unitDist(u, e), el);
        strike(e, (s.mag + 4 - effectiveStats(e).res) * mult, el === 'ice' ? 'freeze' : 'burn');
      }
      out.lines.push(`${u.name} breathes ${el}!`);
      return out;
    }
    case 'fraazSplit': out.lines.push(splitFraaz(b, u) ? `${u.name} splits into two bodies!` : 'No room to split.'); (u.usedAbilities ??= []).push('fraazSplit'); return out;
    case 'boulderHurl': for (const l of boulder(b, u, target!)) out.lines.push(l); return out;
    // ── The new ChuChus ──
    case 'flameBurst': case 'frostBurst': {
      const el: Element = def.id === 'flameBurst' ? 'fire' : 'ice';
      for (const e of foes(2)) strike(e, (s.mag + (el === 'fire' ? 3 : 2) - effectiveStats(e).res) * spMultiplier(b, u, u, e, true, undefined, unitDist(u, e), el), rng.chance(40) ? (el === 'fire' ? 'burn' : 'freeze') : undefined);
      u.stCoat = 2;
      out.lines.push(def.id === 'flameBurst' ? `${u.name} bursts into flame!` : `${u.name} explodes in a freezing burst!`);
      return out;
    }
    case 'dischargeST': {
      for (const e of foes(1)) { strike(e, (s.mag + 3 - effectiveStats(e).res) * spMultiplier(b, u, u, e, true, undefined, 1, 'lightning'), 'shock'); if (e.hp > 0 && rng.chance(40)) { addStatus(e, 'weaken', 2); out.statuses.push({ uid: e.uid, kind: 'weaken' }); } }
      u.stCoat = 2;
      out.lines.push(`${u.name} discharges!`);
      return out;
    }
    case 'conductiveBurst': {
      const wet = (e: Unit) => [...tilesOf(b, e), ...tilesInRange(b, e, 1, 1, e.size).map((p) => tileAt(b, p.x, p.y))].some((t) => !!t && WATERY.includes(t));
      let n = 0;
      for (const e of foes(5)) if (wet(e)) { strike(e, (s.mag + 4 - effectiveStats(e).res) * spMultiplier(b, u, u, e, true, undefined, unitDist(u, e), 'lightning'), 'shock'); n++; }
      out.lines.push(n ? `Lightning races through the water: ${n} enem${n === 1 ? 'y is' : 'ies are'} shocked!` : 'The charge fizzles: nobody is in the water.');
      return out;
    }
    case 'reigniteChu': case 'refreeze': case 'recharge': u.stCoat = 0; out.lines.push(`${u.name}'s coating crackles back.`); return out;
    case 'frozenSurfaceChu': {
      let n = 0;
      for (const p of tilesInRange(b, u, 0, 2, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'water') { timed(k, 'frozenWater', 3); n++; } }
      out.lines.push(`${n} space${n === 1 ? '' : 's'} of water freeze over.`);
      return out;
    }
    case 'staticField': buff(u, 'staticField', 'Static Field', 3); out.buffed.push(u.uid); out.lines.push(`An electric field crackles around ${u.name}.`); return out;
    case 'reequipHelmet': u.stHelmetOff = false; out.lines.push(`${u.name} wobbles back into its helmet.`); return out;
  }
  return null;
}

// ───────────────────────── Items ─────────────────────────

/** Spirit Tracks pack items: the Whirlwind and the Phantom Tear. Returns a log line, or null if the item isn't one of ours. */
export function useSpiritItem(b: Battle, u: Unit, id: string, at?: Pos): string | null {
  if (id === 'phantomTear') { buff(u, 'tearOfLight', 'Tear of Light', 3); return `${u.name}'s weapon shines with a Tear of Light: sacred for 3 turns.`; }
  if (id !== 'whirlwindST') return null;
  const t = at ? unitAt(b, at.x, at.y) : undefined;
  if (!t || t.team === u.team) return 'The Whirlwind whistles through empty air.';
  if (has(t, 'armoredInsectSkill')) { t.stArmorOpen = 2; return `The gust blows ${t.name}'s armor wide open!`; }
  const moved = t.isBoss || isTrain(t) ? false : pushAway(b, t, u, 3);
  if (has(t, 'tornadoRider')) t.phDowned = 2;
  return moved ? `The Whirlwind blows ${t.name} back!` : `${t.name} braces against the gust.`;
}

/** A bomb went off: Cragma's weak point is exposed, Phytops's thorns burn away, Stagnox's armor rattles. */
export function spOnBlast(b: Battle, by: Unit, at: Pos, radius: number): string[] {
  const lines: string[] = [];
  for (const e of b.units.filter((x) => x.team !== by.team && x.hp > 0 && footDist(at.x, at.y, 1, x.x, x.y, x.size) <= radius)) {
    if (has(e, 'lavaColossusSkill') || has(e, 'thornedMenaceSkill')) { buff(e, 'stExposed', 'Exposed', 2); lines.push(`The blast exposes ${e.name}'s weak point!`); }
    if (has(e, 'permanentConduction')) lines.push(`The blast rattles ${e.name}.`);
  }
  // Explosions crush Sand Pillars and rolling boulders.
  for (const p of tilesInRange(b, at, 0, radius, 1)) {
    const k = keyOf(b, p.x, p.y);
    if (b.tiles[k] === 'rollingBoulder' || b.tiles[k] === 'sandPillar') { b.tiles[k] = 'plain'; if (b.sp) b.sp.boulders = b.sp.boulders.filter((q) => q.k !== k); }
  }
  return lines;
}
