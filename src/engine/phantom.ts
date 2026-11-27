// Phantom Hourglass battle rules (the World of the Ocean King): the Phantom Hourglass as a shared
// army resource (time energy and its four abilities), the Temple of the Ocean King (life drain
// outside Sacred Safe Zones, Phantom patrols, Phantom Eyes and alarms), the Phantoms' frontal
// armor and the Phantom Sword, steamship part sets, the Spirits' levels, every boss gimmick
// (Blaaz, Cyclok, Crayk, the Cubus Sisters, Dongorongo, Eox, Bellum, Bellumbeck, Bellum's Ghost
// Ship), the Anouki and Yook, the pack's battlefield spaces, and the pending units (the Potion Shop
// Lady and the Subrosians). Hooks are called from battle.ts, combat.ts, field.ts, grid.ts,
// items.ts, status.ts, abilities.ts, naval.ts, windwaker.ts and battleView.ts (like legend.ts).

import { BOSSES, ENEMIES, GEAR, ITEMS, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import { HOURGLASS_COSTS, OCEAN_KING_TEMPLE, PH_FEATURES, PH_SPOILS, SHIP_SETS, PH_CAPACITY } from '../content/phantom';
import { QUEST_ITEMS as PH_QUEST } from '../content/phantom/items';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { repairComponent, isVessel } from './naval';
import { RNG } from './rng';
import { INF, WATERY } from './rules';
import { addStatus } from './status';
import { restoreForm, roomFor, transformInto } from './transform';
import { activeGear, canSwim, effectiveStats, makeEnemy, makeEnemyFromTemplate, moveTypeOf, unitTags } from './units';
import { pushAway } from './windwaker';
import type { AbilityDef, Battle, Element, EnemyArchetype, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Phantom Hourglass battle state. */
    ph?: PHState;
  }
  interface Unit {
    /** The way this unit faces (for frontal armor): a unit vector. */
    phFacing?: [number, number];
    /** Jolene's Relentless Pursuit: enemies she has attacked. */
    phMarked?: string[];
    /** Crayk's shell: hits taken and broken for good. */
    phShellHits?: number;
    phShellBroken?: boolean;
    /** Eox's joints left (0-4). */
    phJoints?: number;
    /** Blaaz: divided into flames right now. */
    phDivided?: boolean;
    /** Cyclok knocked out of the air (turns), Dongorongo knocked over (turns). */
    phDowned?: number;
    phKnocked?: number;
    /** Bellum's possession: the side this unit belongs to and turns left. */
    phPossessed?: { team: Unit['team']; turns: number };
    /** A Temple Phantom's patrol route (tile keys) and where on it it is. */
    phRoute?: number[];
    phRouteAt?: number;
    /** Ciela's level (sword beams for the army): 1 at full HP, 2 always. */
    phCielaBeam?: number;
  }
}

export interface PHState {
  /** The army holds the Phantom Hourglass; its time energy and reserve. */
  hourglass: boolean;
  energy: number;
  max: number;
  /** Fought inside the Temple of the Ocean King (life drain, Safe Zones, patrols). */
  temple: boolean;
  /** Turn the Temple last drained the Hourglass, and whether it was already empty then. */
  drainTurn?: number;
  empty?: boolean;
  /** Phantom alarm: turns left. */
  alarm: number;
  /** Quest items found in battle (Phantom Essence, treasures, gems). */
  found: string[];
  /** Spirit levels (0-2) from Power, Wisdom and Courage Gems. */
  levels: { leaf: number; neri: number; ciela: number };
  /** Temporary spaces (Whirlwinds raised by Cyclok, ice walls...): tile, what it was, turns left. */
  timed: { k: number; was: Terrain; turns: number }[];
  /** Crystal Pedestals activated (army buffs). */
  pedestals: string[];
  /** Every boss must fall (the Cubus Sisters, the Gleeoks). */
  allBosses?: boolean;
  /** The Temple floor this battle is (for shortcuts and treasure). */
  templeFloor?: number;
}

const PH_WORLD = (b: Battle) => worldDef(b.world).campaign === 'phantom';
export const phState = (b: Battle): PHState =>
  (b.ph ??= { hourglass: false, energy: 0, max: 0, temple: false, alarm: 0, found: [], levels: { leaf: 0, neri: 0, ciela: 0 }, timed: [], pedestals: [] });
const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.templateId ?? u.bossId ?? u.artId ?? '';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
const free = (b: Battle, u: Unit, x: number, y: number) =>
  inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u; });
const tilesOf = (b: Battle, u: Unit) => footprint(u.x, u.y, u.size).map((p) => b.tiles[keyOf(b, p.x, p.y)]);
const near = (b: Battle, u: Unit, ts: Terrain[], r = 1) => [{ x: u.x, y: u.y }, ...tilesInRange(b, u, 1, r, u.size)].some((p) => ts.includes(tileAt(b, p.x, p.y)!));
const adjacentTile = (b: Battle, u: Unit, t: Terrain): Pos | undefined => tilesInRange(b, u, 1, 1, u.size).find((p) => tileAt(b, p.x, p.y) === t);

function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}

/** Phantom Hourglass effect tags on a unit: its active gear and its equipped weapon. */
export function phTags(u: Unit): Set<string> {
  const out = new Set<string>();
  for (const g of activeGear(u)) for (const t of g.ph ?? []) out.add(t);
  for (const t of WEAPONS[u.weapons[0]]?.ph ?? []) out.add(t);
  return out;
}
const tag = (u: Unit, t: string) => phTags(u).has(t);
const isHeavy = (w: WeaponDef | undefined) => !!w && (w.type === 'hammer' || w.type === 'axe' || !!w.twoHanded || !!w.armorBreaker);
const PHANTOM_SKILLS = ['phantomArmorSkill', 'relentlessChase', 'spectralWarp'];
export const isPhantom = (u: Unit) => PHANTOM_SKILLS.some((s) => has(u, s));
const isSacred = (w: WeaponDef | undefined, element?: Element) => !!w?.ph?.includes('sacred') || element === 'light' || !!w?.sacredMult;
const isExposed = (u: Unit) => hasBuff(u, 'phExposed') || hasBuff(u, 'timeFrozen') || u.statuses.some((s) => s.kind === 'exposed');
const snowy = (b: Battle, u: Unit) => b.world === 'isleOfFrost' || b.world === 'snowpeak' || b.world === 'hebra' || tilesOf(b, u).some((t) => t === 'frozenWater' || t === 'iceBlock' || t === 'iceWall');
const isAquaticUnit = (u: Unit) => isVessel(u) || canSwim(u) || unitTags(u).includes('aquatic');
const isMonsterish = (u: Unit) => ['monster', 'demon', 'undead', 'phantom', 'chuchu', 'aquatic', 'construct'].includes(u.race) || unitTags(u).includes('demon') || unitTags(u).includes('undead') || unitTags(u).includes('beast');

// ───────────────────────── Facing ─────────────────────────

const center = (p: Pos, size: number) => ({ x: p.x + (size - 1) / 2, y: p.y + (size - 1) / 2 });
function dirTo(from: Pos & { size: number }, to: Pos & { size: number }): [number, number] {
  const a = center(from, from.size), c = center(to, to.size);
  const dx = c.x - a.x, dy = c.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) return [Math.sign(dx) || 1, 0];
  return [0, Math.sign(dy) || 1];
}
/** Which way a unit faces: its own record, or toward the other side of the field. */
export const facingOf = (u: Unit): [number, number] => u.phFacing ?? (u.team === 'enemy' ? [-1, 0] : [1, 0]);
/** Is an attack from `from` coming at `def`'s front (the half it faces)? */
export function isFrontal(def: Unit, from: Pos, fromSize: number): boolean {
  const [fx, fy] = facingOf(def);
  const a = center(from, fromSize), c = center(def, def.size);
  return (a.x - c.x) * fx + (a.y - c.y) * fy > 0.25;
}
export function face(u: Unit, toward: Unit | (Pos & { size: number })) { u.phFacing = dirTo(u, toward); }

// ───────────────────────── Temporary units ─────────────────────────

const TEMP: Record<string, EnemyArchetype> = {
  blaazFlame: { id: 'blaazFlame', name: 'Flame of Blaaz', race: 'demon', classId: 'fireDemon', weapons: ['blaazFireball'], stats: { hp: 10, str: 6, mag: 14, skl: 12, spd: 12, def: 4, res: 10, mov: 6 }, glyph: 'BF' },
  crayklet: { id: 'crayklet', name: 'Crayklet', race: 'aquatic', classId: 'invisibleCrustacean', weapons: ['craykPincers'], stats: { hp: 14, str: 8, skl: 8, spd: 10, def: 6, res: 2, mov: 5 }, glyph: 'Ck' },
  cobbleConstruct: { id: 'cobbleConstruct', name: 'Cobble Construct', race: 'construct', classId: 'cobbleKnight', weapons: ['cobbleLance'], stats: { hp: 30, str: 12, skl: 10, spd: 6, def: 14, res: 6, mov: 4 }, glyph: 'CC' },
};

function spawnTemp(b: Battle, id: string, nearPos: Pos & { size: number }, team: Unit['team'], level: number, extra: Partial<Unit> = {}): Unit | null {
  const a = TEMP[id] ?? ENEMIES[id];
  if (!a) return null;
  const rng = new RNG(b.rngState);
  const e = makeEnemy(a, b.world, Math.max(1, level), `ph${b.uidCounter++}`, rng);
  b.rngState = rng.state;
  let spot: Pos | null = null;
  for (let d = 1; d <= 4 && !spot; d++) for (const p of tilesInRange(b, nearPos, d, d, nearPos.size)) if (free(b, e, p.x, p.y)) { spot = p; break; }
  if (!spot) return null;
  Object.assign(e, { x: spot.x, y: spot.y, team, summoned: true, moved: true, acted: true, ai: 'aggressive', npc: team === 'player' }, extra);
  b.units.push(e);
  return e;
}

/** A template unit (a Cobble Knight, Jolene's Ship) joining the enemy side near `nearPos`. */
export function spawnEnemyTemplate(b: Battle, id: string, nearPos: Pos & { size: number }, level: number, rng: RNG): Unit | null {
  if (!TEMPLATES[id]) return null;
  const e = makeEnemyFromTemplate(id, level, `ph${b.uidCounter++}`, rng);
  for (let d = 1; d <= 6; d++) {
    const spot = tilesInRange(b, nearPos, d, d, nearPos.size).find((p) => free(b, e, p.x, p.y));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y }); b.units.push(e); phantomBattleStartUnit(b, e); return e; }
  }
  return null;
}

/** Add a partner boss (the other Cubus Sisters, the second Gleeok). */
export function addPhantomPartner(b: Battle, bossId: string, rng: RNG): Unit | null {
  const def = BOSSES[bossId];
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!def || !main) return null;
  const e = makeEnemy(def, b.world, main.level, `ph${b.uidCounter++}`, rng, { boss: true });
  for (let d = 1; d <= 6; d++) {
    const spot = tilesInRange(b, main, d, d, main.size).find((p) => free(b, e, p.x, p.y));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y, team: 'enemy', ai: main.ai }); b.units.push(e); phState(b).allBosses = true; phantomBattleStartUnit(b, e); return e; }
  }
  return null;
}

// ───────────────────────── Movement ─────────────────────────

/** Phantom Hourglass movement exceptions (called from grid.ts). */
export function phTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  const flying = moveTypeOf(u) === 'flying';
  switch (t) {
    case 'sacredSafeZone': if (isPhantom(u)) return INF; break;
    case 'tightrope': c = flying ? 1 : u.size === 1 ? 1 : INF; break;
    case 'chasm': if (u.size === 1 && (u.weapons.includes('grapplingHook') && b.owned?.includes('tightropeKit'))) c = 2; break;
  }
  if (WATERY.includes(t) && tag(u, 'aquatic')) c = 1;
  if (u.race === 'anouki' && (t === 'frozenWater' || t === 'iceBlock')) c = Math.min(c, 1);
  return c;
}

// ───────────────────────── Battlefield setup ─────────────────────────

const OBSTACLES = new Set<Terrain>(['tightropePost', 'spiritPedestal', 'sunCrest']);

/** Place the region's battlefield spaces; the Temple gets Safe Zones and patrol routes. */
export function decoratePhantom(b: Battle, rng: RNG) {
  const feats = PH_FEATURES[b.world];
  if (!feats) return;
  const st = phState(b);
  st.temple = b.world === OCEAN_KING_TEMPLE;
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 2 && i % b.width <= b.width - 3 ? i : -1)).filter((i) => i >= 0));
  const pos = (k: number) => ({ x: k % b.width, y: Math.floor(k / b.width) });
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    for (let j = 0; j < n; j++) {
      if (t === 'submergedTreasure' || t === 'cycloneWarp') {
        const wet = rng.shuffle(b.tiles.map((x, i) => (x === 'water' && !occupied.has(i) ? i : -1)).filter((i) => i >= 0));
        const k = wet[0];
        if (k !== undefined) b.tiles[k] = t;
        continue;
      }
      if (t === 'tightropePost') {
        // Two posts with a chasm between them, in a straight line.
        const k = plains.pop();
        if (k === undefined) break;
        const { x, y } = pos(k);
        const len = 3;
        if (x + len + 1 >= b.width) continue;
        const line = Array.from({ length: len }, (_, i) => keyOf(b, x + 1 + i, y));
        if (line.some((q) => occupied.has(q) || b.tiles[q] === 'wall')) continue;
        b.tiles[k] = 'tightropePost';
        for (const q of line) b.tiles[q] = 'chasm';
        b.tiles[keyOf(b, x + len + 1, y)] = 'tightropePost';
        j++;
        continue;
      }
      const k = plains.pop();
      if (k === undefined) break;
      if (OBSTACLES.has(t) && tilesInRange(b, pos(k), 1, 1).some((p) => OBSTACLES.has(b.tiles[keyOf(b, p.x, p.y)]))) continue;
      b.tiles[k] = t;
    }
  }
  // The Temple: a Safe Zone at the army's start, and every Phantom gets a patrol route.
  if (st.temple) {
    for (const u of b.units.filter((x) => x.team === 'player').slice(0, 3)) {
      for (const p of tilesInRange(b, u, 1, 1, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain' && !occupied.has(k)) { b.tiles[k] = 'sacredSafeZone'; break; } }
    }
  }
}

/** Battle start (every campaign): facing, shells and joints, ship-part sets, the Spirits, Foresight. */
export function phantomBattleStart(b: Battle) {
  for (const u of [...b.units]) phantomBattleStartUnit(b, u);
  const st = b.ph;
  // Patrol routes for Temple Phantoms: a loop of Patrol Route spaces around where they stand.
  if (st?.temple) {
    for (const u of b.units.filter((x) => x.team === 'enemy' && isPhantom(x))) {
      const route: number[] = [];
      const [dx, dy] = u.y % 2 ? [1, 0] : [0, 1];
      for (let i = -2; i <= 2; i++) {
        const x = u.x + dx * i, y = u.y + dy * i;
        if (!inBounds(b, x, y)) continue;
        const k = keyOf(b, x, y);
        if (b.tiles[k] === 'plain' || b.tiles[k] === 'phantomPatrol') { if (b.tiles[k] === 'plain') b.tiles[k] = 'phantomPatrol'; route.push(k); }
      }
      if (route.length > 1) { u.phRoute = route; u.phRouteAt = Math.max(0, route.indexOf(keyOf(b, u.x, u.y))); u.ai = 'guard'; }
    }
  }
  if (b.units.some((u) => u.team === 'player' && has(u, 'foresight'))) {
    const hidden = b.units.filter((e) => e.team === 'enemy' && e.hidden).length;
    b.log.push(`Astrid's Foresight: ${hidden ? `${hidden} hidden enem${hidden > 1 ? 'ies' : 'y'} on the field; ` : ''}${b.objective.type === 'survive' ? 'reinforcements will come from the far edge every other turn.' : 'no reinforcements are coming.'}`);
  }
  // Oracle-era Subrosian miners and Linebeck's coat: an extra buried treasure.
  const extra = b.units.filter((u) => u.team === 'player' && (has(u, 'oreHunter') || tag(u, 'treasure'))).length;
  for (let i = 0; i < Math.min(2, extra); i++) {
    const k = b.tiles.findIndex((t, j) => t === 'plain' && (j * 7 + i * 13) % 11 === 0 && !unitAt(b, j % b.width, Math.floor(j / b.width)));
    if (k >= 0) (b.digSpots ??= []).push({ x: k % b.width, y: Math.floor(k / b.width) });
  }
}

function phantomBattleStartUnit(b: Battle, u: Unit) {
  if (has(u, 'invisibleHunter')) { u.phShellHits = 0; u.phShellBroken = false; if (u.team === 'enemy') u.hidden = true; }
  if (has(u, 'structuralWeakness')) u.phJoints = 4;
  if (isVessel(u)) applyShipSets(u);
  if (has(u, 'possessedArmor') || has(u, 'exposedInterior') || isPhantom(u) || has(u, 'shieldedAssault')) u.phFacing = facingOf(u);
  void b;
}

// ───────────────────────── Ship parts ─────────────────────────

/** How many parts of each set a vessel has fitted. */
export function shipSets(u: Unit): Record<string, number> {
  const out: Record<string, number> = {};
  for (const g of activeGear(u)) for (const t of g.ph ?? []) if (t.startsWith('set:')) out[t.slice(4)] = (out[t.slice(4)] ?? 0) + 1;
  return out;
}
/** 0, 1 (4+ parts: partial) or 2 (all 8: full) for one set. */
export const setLevel = (u: Unit, set: string) => { const n = shipSets(u)[set] ?? 0; return n >= 8 ? 2 : n >= 4 ? 1 : 0; };

const SET_STATS: Record<string, [Record<string, number>, Record<string, number>]> = {
  standard: [{ def: 2, res: 2 }, { str: 3, def: 3, res: 3, mov: 1 }],
  barrel: [{}, { def: 2 }],
  tropical: [{ mov: 1 }, { mov: 2 }],
  stone: [{ def: 4 }, { def: 8 }],
  demon: [{ str: 3 }, { str: 6 }],
  golden: [{}, { str: 3, mag: 3, skl: 3, spd: 3, def: 3, res: 3, lck: 3 }],
};
function applyShipSets(u: Unit) {
  u.buffs = u.buffs.filter((x) => !x.id.startsWith('shipSet:'));
  for (const s of SHIP_SETS) {
    const lvl = setLevel(u, s.id);
    if (!lvl) continue;
    u.buffs.push({ id: `shipSet:${s.id}`, name: `${s.name} set (${lvl === 2 ? 'full' : 'partial'})`, turns: 999, stats: SET_STATS[s.id]?.[lvl - 1] ?? {} });
  }
}
/** Extra passengers from the Barrel set (naval.ts capacityOf). */
export function phCapacity(v: Unit): number | undefined {
  const base = PH_CAPACITY[v.templateId ?? v.bossId ?? ''];
  const lvl = setLevel(v, 'barrel');
  if (base === undefined && !lvl) return undefined;
  return (base ?? Math.max(1, v.size * 2 - 2)) + lvl;
}

// ───────────────────────── Start of each turn ─────────────────────────

export interface PHEvent { uid: string; heal: number; damage: number; source: string }

export function phStartPhase(b: Battle, u: Unit, events: PHEvent[]) {
  const st = b.ph;
  const heal = (pct: number, source: string, who = u) => {
    const amt = Math.min(who.stats.hp - who.hp, Math.ceil(who.stats.hp * pct));
    if (amt > 0) { who.hp += amt; events.push({ uid: who.uid, heal: amt, damage: 0, source }); }
  };
  const hurt = (who: Unit, dmg: number, source: string) => {
    dmg = Math.min(who.hp - 1, dmg);
    if (dmg > 0) { who.hp -= dmg; events.push({ uid: who.uid, heal: 0, damage: dmg, source }); }
    return Math.max(0, dmg);
  };
  // Temporary spaces revert (once per round, on the player's phase).
  if (st && u.team === 'player' && st.drainTurn !== b.turn) {
    for (const x of st.timed) if (--x.turns <= 0 && !unitAt(b, x.k % b.width, Math.floor(x.k / b.width))) b.tiles[x.k] = x.was;
    st.timed = st.timed.filter((x) => x.turns > 0);
    if (st.alarm > 0) st.alarm--;
  }
  // The Temple of the Ocean King drains the life of anyone outside a Sacred Safe Zone — unless the Hourglass has time left.
  if (st?.temple && u.team === 'player' && !u.npc) {
    const outside = (x: Unit) => !tilesOf(b, x).includes('sacredSafeZone');
    if (st.drainTurn !== b.turn) {
      st.drainTurn = b.turn;
      st.empty = !st.hourglass || st.energy <= 0;
      if (!st.empty && b.units.some((x) => x.team === 'player' && !x.npc && outside(x))) st.energy--;
    }
    if (outside(u) && st.empty) hurt(u, Math.ceil(u.stats.hp * 0.08), 'The Temple drains your life');
  } else if (st && u.team === 'player' && st.drainTurn !== b.turn) st.drainTurn = b.turn;
  const tags = phTags(u);
  if (tags.has('regen10')) heal(0.1, "Ocean King's Blessing");
  // Ship sets: Simple parts patch themselves up.
  if (isVessel(u)) {
    const simple = setLevel(u, 'simple');
    if (simple) { heal(simple === 2 ? 0.1 : 0.05, 'Simple parts'); if (simple === 2) repairComponent(u); }
  }
  // Frozen Battlefield: this enemy loses its turn.
  if (hasBuff(u, 'timeStopped')) { u.buffs = u.buffs.filter((x) => x.id !== 'timeStopped'); u.moved = u.acted = true; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is frozen in time' }); }
  // Possession wears off.
  if (u.phPossessed && --u.phPossessed.turns <= 0) { endPossession(u); events.push({ uid: u.uid, heal: 0, damage: 0, source: 'Bellum lets go' }); }
  // Auras from allies.
  for (const a of alliesOf(b, u)) {
    const d = unitDist(u, a);
    if (has(a, 'oceanKingsWisdom') && d <= 2) u.mp = Math.min(u.stats.mp, u.mp + 5);
    if (has(a, 'mechanicalExpertise') && d <= 1 && (isVessel(u) || u.race === 'construct')) { heal(0.1, 'Eddo\'s repairs'); repairComponent(u); }
    if (has(a, 'winterGuard') && d <= 1) u.statuses = u.statuses.filter((x) => x.kind !== 'freeze');
    if (has(a, 'chiefOfTheFrost') && d <= 4 && (u.race === 'anouki' || u.race === 'yook')) buff(u, 'chiefOfTheFrost', 'Chief of the Frost', 1, { mov: 1 });
    if (has(a, 'masterOfTheSeasPH') && isAquaticUnit(u)) buff(u, 'masterOfTheSeasPH', 'Master of the Seas', 1, { mov: 3 });
  }
  if (has(u, 'masterOfTheSeasPH') && isAquaticUnit(u)) buff(u, 'masterOfTheSeasPH', 'Master of the Seas', 1, { mov: 3 });
  if (has(u, 'fastPursuit')) buff(u, 'fastPursuit', 'Fast Pursuit', 1, { mov: 2 });
  if (u.race === 'anouki') u.statuses = u.statuses.filter((x) => x.kind !== 'freeze');
  // Detection.
  const reveal = (r: number) => { let n = 0; for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= r) { e.hidden = false; n++; } return n; };
  if (has(u, 'iceTracker')) { const n = reveal(3); if (n) events.push({ uid: u.uid, heal: 0, damage: 0, source: `tracks ${n} hidden enem${n > 1 ? 'ies' : 'y'}` }); }
  if (has(u, 'foresight')) { reveal(6); for (const t of b.traps ?? []) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= 6) t.hidden = false; }
  if (has(u, 'secretKey')) for (const p of tilesInRange(b, u, 0, 2, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'invisibleFloor') b.tiles[k] = 'plain'; }
  // ── Monsters ──
  if (has(u, 'phantomAlarmSkill') && st) {
    const seen = foesOf(b, u).filter((e) => unitDist(u, e) <= 3);
    for (const e of seen) e.hidden = false;
    if (seen.length && st.alarm <= 0) { st.alarm = 3; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'raises the alarm! The Phantoms give chase' }); }
  }
  if (isPhantom(u) && u.team === 'enemy') phantomPatrol(b, u, events);
  // ── Bosses ──
  if (has(u, 'flameDivision') && !u.phDivided && u.hp < u.stats.hp * 0.75 && u.hp > u.stats.hp * 0.2 && b.turn % 3 === 0) { const n = divide(b, u); if (n) events.push({ uid: u.uid, heal: 0, damage: 0, source: 'divides into flames' }); }
  if (has(u, 'tornadoRider')) {
    if (u.phDowned) u.phDowned--;
    if (u.team === 'enemy' && b.turn % 3 === 0) { const n = raiseWhirlwinds(b, u, 1); if (n) events.push({ uid: u.uid, heal: 0, damage: 0, source: 'stirs up a whirlwind' }); }
  }
  if (has(u, 'invisibleHunter') && !u.phShellBroken) u.hidden = true;
  if (has(u, 'exposedInterior') && u.phKnocked) u.phKnocked--;
  if (has(u, 'lifeForceConsumption')) {
    let drained = 0;
    for (const e of foesOf(b, u)) if (unitDist(u, e) <= 2) drained += hurt(e, Math.ceil(e.stats.hp * 0.05), 'Bellum drains your life');
    if (drained) heal(drained / u.stats.hp, 'drained life force');
    if (u.team === 'enemy' && b.turn % 3 === 0 && b.units.filter((x) => x.team === u.team && tid(x) === 'phantomEye').length < 3) {
      for (let i = 0; i < 2; i++) spawnTemp(b, 'phantomEye', u, u.team, u.level - 2, { summoned: true });
      events.push({ uid: u.uid, heal: 0, damage: 0, source: 'summons Phantom Eyes' });
    }
    if (u.team === 'enemy' && b.turn % 4 === 2) { const t = possessionTarget(b, u); if (t) { possess(b, u, t); events.push({ uid: t.uid, heal: 0, damage: 0, source: `is possessed by ${u.name}` }); } }
  }
  if (has(u, 'spectralFleet') && u.team === 'enemy' && b.turn % 2 === 0 && b.units.filter((x) => x.team === u.team && x.summoned).length < 4) {
    const e = spawnTemp(b, ENEMIES.poe ? 'poe' : 'phantomEye', u, u.team, u.level - 2);
    if (e) events.push({ uid: u.uid, heal: 0, damage: 0, source: 'calls up a spectre from the deep' });
  }
}

/** Phantoms walk their routes until the alarm is raised or someone comes close; then they give chase. */
function phantomPatrol(b: Battle, u: Unit, events: PHEvent[]) {
  const st = b.ph;
  const spotted = foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) <= (has(u, 'relentlessChase') ? 6 : 3));
  const alarmed = (st?.alarm ?? 0) > 0;
  if (alarmed || spotted.length || !st?.temple) {
    u.ai = 'aggressive';
    if (has(u, 'relentlessChase')) buff(u, 'relentlessChase', 'Relentless Chase', 1, { mov: 4 });
    if (has(u, 'spectralWarp')) {
      const eyes = b.units.filter((x) => x.team === u.team && has(x, 'phantomAlarmSkill'));
      const targets = foesOf(b, u).filter((e) => !e.hidden && (alarmed || eyes.some((x) => unitDist(x, e) <= 3)) && unitDist(u, e) > 2);
      const t = targets.sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
      const spot = t && tilesInRange(b, t, 1, 1, t.size).find((p) => free(b, u, p.x, p.y));
      if (t && spot) { u.x = spot.x; u.y = spot.y; face(u, t); events.push({ uid: u.uid, heal: 0, damage: 0, source: 'warps through the shadows' }); }
    }
    const nearest = foesOf(b, u).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
    if (nearest) face(u, nearest);
    return;
  }
  // Unaware: it keeps to its route and only strikes whoever is right next to it.
  u.ai = 'stationary';
  if (!u.phRoute?.length) return;
  for (let step = 0; step < 2; step++) {
    const i = ((u.phRouteAt ?? 0) + 1) % u.phRoute.length;
    const k = u.phRoute[i];
    const x = k % b.width, y = Math.floor(k / b.width);
    if (!free(b, u, x, y)) { u.phRoute.reverse(); u.phRouteAt = u.phRoute.length - 1 - (u.phRouteAt ?? 0); break; }
    u.phFacing = [Math.sign(x - u.x), Math.sign(y - u.y)];
    if (!u.phFacing[0] && !u.phFacing[1]) u.phFacing = facingOf(u);
    u.x = x; u.y = y; u.phRouteAt = i;
  }
  void events;
}

// ───────────────────────── After moving ─────────────────────────

/** After a unit moves: Whirlwinds launch it, Phantom Alarms go off, and it faces its nearest foe. */
export function phAfterMove(b: Battle, u: Unit): string | null {
  const lines: string[] = [];
  const st = b.ph;
  const here = tilesOf(b, u);
  if (here.includes('whirlwind') && u.size <= 2 && !isVessel(u)) {
    const foe = foesOf(b, u).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0] ?? u;
    const spots = tilesInRange(b, u, 2, 3, u.size).filter((p) => free(b, u, p.x, p.y)).sort((p, q) => footDist(p.x, p.y, u.size, foe.x, foe.y, foe.size) - footDist(q.x, q.y, u.size, foe.x, foe.y, foe.size));
    if (spots[0]) { u.x = spots[0].x; u.y = spots[0].y; lines.push(`The Whirlwind launches ${u.name} across the field!`); }
  }
  if (st && u.team === 'player' && here.includes('phantomAlarm') && st.alarm <= 0) { st.alarm = 3; lines.push('⚠ A Phantom Alarm goes off — every Phantom gives chase!'); }
  const nearest = foesOf(b, u).filter((e) => !e.hidden).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
  if (nearest && (u.phFacing || isPhantom(u))) face(u, nearest);
  if (!lines.length) return null;
  b.log.push(...lines);
  return lines.join(' ');
}

// ───────────────────────── Combat ─────────────────────────

export interface PHMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

/** Situational bonuses (combat.ts situational). */
export function phMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): PHMods {
  const m: PHMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const d = unitDist(u, foe, pos);
  const tags = phTags(u);
  const allies = b.units.filter((a) => a !== u && a.team === u.team);
  const within = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  if (has(u, 'relentlessPursuitPH') && u.phMarked?.includes(foe.uid)) { m.str += 4; m.spd += 4; }
  if (has(u, 'frozenFighter') && snowy(b, u)) m.str += 3;
  if (has(u, 'frozenRage')) m.str += Math.floor((1 - u.hp / u.stats.hp) * 10);
  if (has(u, 'volcanicNative') && near(b, u, ['lava'])) { m.str += 3; m.def += 3; }
  if (has(u, 'ancientLoyalty') && allies.some((a) => (a.isCommander || (u.team === 'enemy' && a.isBoss)) && within(a, 1))) m.def += 4;
  if (w?.ph?.includes('royalGuard') && allies.some((a) => (a.isCommander || (u.team === 'enemy' && a.isBoss)) && within(a, 2))) m.dmg += 4;
  if (w?.ph?.includes('counterCrit') && !initiating) m.crit += 20;
  if (tags.has('frontalDef12') && isFrontal(u, foe, foe.size)) m.def += 12;
  if (tags.has('frontalDef4') && isFrontal(u, foe, foe.size)) m.def += 4;
  if (tags.has('powerGem') && w && w.type !== 'staff') m.dmg += 3;
  if (tags.has('courageGem') && w?.type === 'sword' && d > 1) m.dmg += 3;
  // Auras.
  for (const a of allies) {
    if (has(a, 'sacredFlame') && within(a, 2)) m.dmg += 3 + 2 * (b.ph?.levels.leaf ?? 0);
    if (has(a, 'islandChief') && u.race === 'goron' && within(a, 3)) { m.str += 3; m.def += 3; }
    if (has(a, 'chiefOfTheFrost') && (u.race === 'anouki' || u.race === 'yook') && within(a, 4)) { m.def += 3; m.res += 3; }
    if (has(a, 'masterOfTheSeasPH') && isAquaticUnit(u)) { m.def += 3; m.res += 3; }
    if (has(a, 'mermaidsCharm') && within(a, 2)) m.hit += 5;
  }
  if (has(u, 'masterOfTheSeasPH') && isAquaticUnit(u)) { m.def += 3; m.res += 3; }
  if (b.units.some((j) => j.team !== u.team && has(j, 'mermaidsCharm') && unitDist(u, j, pos) <= 2)) m.hit -= 10;
  // The Cubus Sisters together.
  if (has(u, 'deadMansVolley') && new Set(b.units.filter((x) => x.team === u.team && has(x, 'deadMansVolley')).map(tid)).size >= 4) { m.mag += 4; m.res += 3; }
  // Commander bonuses.
  if (u.team === 'player' && b.bonus === 'cobbleLegacy' && u.race === 'cobble') { m.def += 3; m.res += 3; }
  // Ship sets.
  if (isVessel(u)) {
    const tropical = setLevel(u, 'tropical'), vintage = setLevel(u, 'vintage'), stone = setLevel(u, 'stone');
    if (tropical === 2) m.avoid += 10;
    if (vintage && w?.type === 'siege') { m.hit += vintage === 2 ? 20 : 10; if (vintage === 2) m.crit += 10; }
    if (stone === 2 && w?.id === 'ramming') m.dmg += 4;
  }
  return m;
}

/** Extra reach: Courage Gems and Ciela's levels give swords a beam. */
export function phRangeBonus(u: Unit, w: WeaponDef): number {
  if (w.type !== 'sword') return 0;
  if (tag(u, 'courageGem')) return 1;
  if (u.phCielaBeam && (u.phCielaBeam >= 2 || u.hp >= u.stats.hp)) return 1;
  return 0;
}

/** Can't attack: Cyclok in the air is out of melee reach; frozen enemies can't counter; Time Stop. */
export function phCannotAttack(b: Battle, atk: Unit, def: Unit, d: number, initiating: boolean): boolean {
  if (has(def, 'tornadoRider') && !def.phDowned && d <= 1 && moveTypeOf(atk) !== 'flying') return true;
  if (!initiating && (hasBuff(atk, 'timeFrozen') || hasBuff(def, 'timeWalk'))) return true;
  void b;
  return false;
}

/** Damage multiplier: Phantom armor and the Phantom Sword, boss shells and armor, the Spirits, ship sets. */
export function phMultiplier(b: Battle, atk: Unit, atkPos: Pos, def: Unit, magical: boolean, w: WeaponDef | undefined, d: number, element?: Element): number {
  let m = 1;
  const dt = phTags(def);
  const sacred = isSacred(w, element);
  const exposed = isExposed(def);
  const frontal = isFrontal(def, atkPos, atk.size) && !has(atk, 'rollingCharge');
  // Phantoms: immune to ordinary frontal weapon attacks.
  if (isPhantom(def)) {
    if (w?.id === 'phantomSword') m *= 2;
    else if (frontal && !sacred && !exposed) return 0;
  }
  if (has(def, 'shieldedAssault') && frontal && !exposed) m *= 0.3;
  if (has(def, 'possessedArmor')) { if (hasBuff(def, 'eyeExposed')) m *= 1.5; else if (frontal) m *= 0.25; }
  if (has(def, 'exposedInterior')) { if (def.phKnocked) m *= 1.5; else if (frontal) m *= 0.2; }
  if (has(def, 'flameDivision') && def.phDivided) return 0;
  if (has(def, 'flameDivision') && hasBuff(def, 'blaazExposed')) m *= 1.5;
  if (has(def, 'tornadoRider') && !def.phDowned && (d > 1 || magical)) m *= 0.5;
  if (has(def, 'invisibleHunter') && !def.phShellBroken) m *= 0.6;
  if (has(def, 'structuralWeakness')) m *= (def.phJoints ?? 4) >= 4 ? 0.5 : (def.phJoints ?? 4) <= 0 ? 1.5 : 1;
  if ((has(def, 'lifeForceConsumption') || has(def, 'spectralFleet')) && !exposed && w?.id !== 'phantomSword') m *= 0.5;
  // Elements.
  if (element === 'ice' && (def.race === 'yook' || dt.has('iceGuard'))) m *= 0.5;
  if (element === 'ice' && b.units.some((a) => a !== def && a.team === def.team && has(a, 'winterGuard') && unitDist(a, def) <= 1)) m *= 0.75;
  if (element === 'fire' && dt.has('fireGuard')) m *= 0.6;
  // The Spirits.
  if (b.units.some((n) => n !== def && n.team === def.team && has(n, 'sacredProtection') && unitDist(n, def) <= 2)) m *= 0.8 - 0.05 * (b.ph?.levels.neri ?? 0);
  if (has(atk, 'sacredFlame') && !magical) m *= 1 + 0.15 * (b.ph?.levels.leaf ?? 0);
  // Characters and commanders.
  if (has(atk, 'royalChallenger') && (def.isCommander || def.isBoss)) m *= 1.25;
  if (atk.team === 'player' && b.bonus === 'boardingFury' && (isVessel(def) || tilesOf(b, atk).some((t) => t === 'shipDeck' || t === 'boardingPoint') || atk.movedDist > 0 && b.naval)) m *= 1.2;
  // Ship sets.
  if (isVessel(def)) { const iron = setLevel(def, 'iron'); if (iron) m *= iron === 2 ? 0.7 : 0.85; }
  return m;
}

/** After a hit: shells crack, joints break, Blaaz divides or recombines, knockbacks, drains and thorns. */
export function phAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element?: Element): string[] {
  const lines: string[] = [];
  const heavy = isHeavy(w);
  const melee = unitDist(by, target) <= 1;
  if (has(target, 'invisibleHunter') && !target.phShellBroken) {
    target.phShellHits = (target.phShellHits ?? 0) + (heavy ? 2 : 1);
    if (target.phShellHits >= 4) { target.phShellBroken = true; target.hidden = false; lines.push(`${target.name}'s shell shatters — it can't hide any more!`); }
    else lines.push(`${target.name}'s shell cracks (${target.phShellHits}/4).`);
  }
  if (has(target, 'structuralWeakness') && (target.phJoints ?? 0) > 0 && (heavy || dmg >= target.stats.hp * 0.12)) breakJoint(target, lines);
  if (has(target, 'exposedInterior') && heavy && melee && !target.phKnocked) { target.phKnocked = 1; lines.push(`${target.name} is knocked onto its back — its belly is exposed!`); }
  if (has(target, 'flameDivision') && !target.phDivided && target.hp > 0 && target.hp < target.stats.hp * 0.75 && !target.usedAbilities?.includes('firstDivision')) {
    (target.usedAbilities ??= []).push('firstDivision');
    if (divide(b, target)) lines.push(`${target.name} divides into three flames!`);
  }
  // A boomerang through a flame of Blaaz forces them back together.
  if (target.artId === 'blaazFlame' && w?.type === 'boomerang') {
    const owner = b.units.find((x) => x.uid === target.illusionOf);
    if (owner) { recombine(b, owner); lines.push(`The boomerang drives the flames back together — ${owner.name} is exposed!`); }
  }
  if (w?.id === 'phantomSword' && (has(target, 'lifeForceConsumption') || has(target, 'spectralFleet'))) buff(target, 'phExposed', 'Exposed', 1);
  if (dmg > 0 && target.hp > 0) {
    if (has(by, 'heavyBlow') && melee && !target.isBoss) pushAway(b, target, by, 1);
    if (tag(by, 'drain') || w?.ph?.includes('drain')) { const h = Math.min(by.stats.hp - by.hp, Math.ceil(dmg / 3)); if (h > 0) by.hp += h; }
    if (w?.ph?.includes('whirlwind')) raiseWhirlwinds(b, target, 1, 2);
    if (has(by, 'possessedArmor') || has(by, 'lifeForceConsumption')) { /* no extra */ }
    if (isVessel(by) && setLevel(by, 'demon') === 2 && (b.turn + target.uid.length) % 5 === 0) addStatus(target, 'fear', 2);
  }
  if (dmg > 0 && melee && tag(target, 'thorns2') && by.hp > 1) { by.hp = Math.max(1, by.hp - 2); lines.push(`${by.name} is pricked by ${target.name}'s Wheelchair Spikes.`); }
  void element;
  b.log.push(...lines);
  return lines;
}

/** After an exchange: facing, Relentless Pursuit, Dead Man's Volley, the Cubus Orb, Crayk shows itself. */
export function phAfterCombat(b: Battle, attacker: Unit, defender: Unit, landed: { atk: number; def: number }): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const zap = (by: Unit, t: Unit, dmg: number) => {
    dmg = Math.max(0, Math.min(t.hp - (t.isBoss ? 1 : 0), Math.floor(dmg)));
    if (dmg <= 0) return;
    t.hp -= dmg;
    const killed = t.hp <= 0;
    out.push({ uid: t.uid, dmg, hp: t.hp, killed, by: by.uid });
    if (killed) { b.units = b.units.filter((x) => x !== t); if (!t.summoned) b.fallen.push(t); by.kills++; }
  };
  if (attacker.hp > 0) face(attacker, defender);
  if (defender.hp > 0) face(defender, attacker);
  if (has(attacker, 'relentlessPursuitPH') && !(attacker.phMarked ??= []).includes(defender.uid)) attacker.phMarked.push(defender.uid);
  if (hasBuff(attacker, 'timeWalk')) attacker.buffs = attacker.buffs.filter((x) => x.id !== 'timeWalk');
  if (has(attacker, 'invisibleHunter')) attacker.hidden = false;
  const w = WEAPONS[attacker.weapons[0]];
  if (landed.atk > 0 && defender.hp > 0) {
    if (has(attacker, 'deadMansVolley') && (w?.type === 'magic' || w?.magicContact)) {
      const sisters = b.units.filter((x) => x !== attacker && x.team === attacker.team && has(x, 'deadMansVolley') && unitDist(x, defender) <= 4).length;
      if (sisters) { zap(attacker, defender, 3 * sisters); b.log.push(`The orb rebounds between the sisters (${sisters}×)!`); }
    } else if (w?.ph?.includes('reflect')) {
      const allies = b.units.filter((x) => x !== attacker && x.team === attacker.team && unitDist(x, defender) <= 3).length;
      if (allies) zap(attacker, defender, 2 * Math.min(3, allies));
    }
  }
  return out;
}

/** On a kill: Bellum feeds, Phantoms leave Essence, the Evil Phantom's army recovers, flames of Blaaz burn their master. */
export function phOnKill(b: Battle, by: Unit, victim: Unit, rng: RNG) {
  for (const bel of b.units.filter((x) => has(x, 'lifeForceConsumption') && x.team !== victim.team && x.hp > 0 && unitDist(x, victim) <= 4)) {
    bel.hp = Math.min(bel.stats.hp, bel.hp + Math.ceil(bel.stats.hp * 0.15));
    bel.mp = Math.min(bel.stats.mp, bel.mp + 10);
    b.log.push(`${bel.name} feeds on the life force of ${victim.name}.`);
  }
  if (by.team === 'player' && b.bonus === 'phantomFeast' && isMonsterish(by)) by.hp = Math.min(by.stats.hp, by.hp + Math.ceil(by.stats.hp * 0.1));
  if (victim.artId === 'blaazFlame') {
    const owner = b.units.find((x) => x.uid === victim.illusionOf);
    if (owner) {
      owner.hp = Math.max(1, owner.hp - Math.ceil(owner.stats.hp * 0.1));
      if (!b.units.some((x) => x !== victim && x.illusionOf === owner.uid && x.hp > 0)) recombine(b, owner);
    }
  }
  const spoil = PH_SPOILS[victim.artId ?? victim.templateId ?? ''];
  if (spoil && victim.team === 'enemy' && by.team === 'player' && !victim.summoned && rng.chance(25)) {
    if (PH_QUEST.some((q) => q.id === spoil)) phState(b).found.push(spoil);
    else (b.loot ??= []).push(spoil);
  }
}

// ───────────────────────── Statuses ─────────────────────────

export function phImmune(u: Unit, kind: StatusKind): boolean {
  if (kind === 'freeze' && (u.race === 'anouki' || tag(u, 'cold'))) return true;
  return false;
}

/** Healing items: the Potion Shop Lady's Old Recipes. */
export function phHealItemMult(b: Battle, u: Unit): number {
  void b;
  return has(u, 'oldRecipes') ? 1.3 : 1;
}

// ───────────────────────── Boss gimmicks ─────────────────────────

function divide(b: Battle, u: Unit): number {
  let n = 0;
  for (let i = 0; i < 3; i++) {
    const f = spawnTemp(b, 'blaazFlame', u, u.team, u.level, { illusionOf: u.uid, summoned: true, moved: false, acted: false });
    if (!f) continue;
    f.stats = { ...f.stats, hp: Math.max(8, Math.ceil(u.stats.hp * 0.15)), mag: Math.ceil(u.stats.mag * 0.6) };
    f.hp = f.stats.hp;
    f.artId = 'blaazFlame';
    n++;
  }
  if (n) u.phDivided = true;
  return n;
}
function recombine(b: Battle, u: Unit) {
  b.units = b.units.filter((x) => x.illusionOf !== u.uid || x.artId !== 'blaazFlame');
  u.phDivided = false;
  buff(u, 'blaazExposed', 'Exposed', 2);
  addStatus(u, 'exposed', 2);
}
function breakJoint(u: Unit, lines: string[]) {
  u.phJoints = Math.max(0, (u.phJoints ?? 4) - 1);
  const lost = 4 - u.phJoints;
  buff(u, 'eoxJoints', `Broken joints (${lost})`, 999, { str: -3 * lost, mov: -lost });
  lines.push(u.phJoints ? `One of ${u.name}'s joints breaks (${u.phJoints} left)!` : `${u.name}'s last joint gives way — its core is open!`);
}
/** Raise Whirlwinds near foes of `u` (or around a target). Returns how many. */
function raiseWhirlwinds(b: Battle, around: Unit, n: number, turns = 4): number {
  const st = phState(b);
  let made = 0;
  if (b.tiles.filter((t) => t === 'whirlwind').length >= 5) return 0;
  const foes = around.team === 'enemy' && has(around, 'tornadoRider') ? foesOf(b, around) : [around];
  for (const f of foes.slice(0, n)) {
    const p = tilesInRange(b, f, 1, 2, f.size).find((q) => tileAt(b, q.x, q.y) === 'plain' && !unitAt(b, q.x, q.y));
    if (!p) continue;
    const k = keyOf(b, p.x, p.y);
    st.timed.push({ k, was: b.tiles[k], turns });
    b.tiles[k] = 'whirlwind';
    made++;
  }
  return made;
}
function possessionTarget(b: Battle, bel: Unit): Unit | undefined {
  const list = foesOf(b, bel).filter((e) => !e.isBoss && !e.isCommander && !isVessel(e) && !e.phPossessed && unitDist(bel, e) <= 3);
  return list.find((e) => e.templateId === 'linebeck') ?? list.sort((x, y) => y.stats.str - x.stats.str)[0];
}
function possess(b: Battle, bel: Unit, t: Unit) {
  t.phPossessed = { team: t.team, turns: 2 };
  if (t.templateId === 'linebeck' && TEMPLATES.bellumbeck && roomFor(b, t, TEMPLATES.bellumbeck.size)) {
    transformInto(b, t, 'bellumbeck');
    t.artId = 'bellumbeck';
    b.log.push('Bellum pours into Linebeck — Bellumbeck rises!');
  }
  t.team = bel.team;
  t.npc = false;
  t.ai = 'aggressive';
  t.moved = t.acted = true;
}
function endPossession(u: Unit) {
  const p = u.phPossessed;
  if (!p) return;
  u.team = p.team;
  delete u.phPossessed;
  if (u.originalForm && u.templateId === 'bellumbeck') { const r = restoreForm(u); Object.assign(u, r); delete u.originalForm; delete u.artId; }
}

/** Rout maps: only Phantoms are left, and nobody in the army carries the Phantom Sword (they can't be beaten). */
export function phOnlyPhantomsLeft(b: Battle, enemies: Unit[]): boolean {
  if (!enemies.length || !enemies.every((e) => isPhantom(e) && !e.isBoss)) return false;
  return !b.units.some((u) => u.team === 'player' && u.weapons.includes('phantomSword'));
}

/** True while a paired boss fight still has a boss standing. */
export function phBossesRemain(b: Battle): boolean {
  return !!b.ph?.allBosses && b.units.some((u) => u.team === 'enemy' && u.isBoss);
}

/** Before the battle ends: possessed units go home. */
export function phantomBeforeFinish(b: Battle) {
  for (const u of [...b.units, ...b.fallen]) {
    if (u.phPossessed) endPossession(u);
    delete u.phFacing;
    delete u.phMarked;
    delete u.phRoute;
    if (u.buffs) u.buffs = u.buffs.filter((x) => !x.id.startsWith('shipSet:'));
  }
}

// ───────────────────────── Abilities ─────────────────────────

const TILE = new Set(['temporalEscape', 'goronRoll', 'wheelchairRush', 'phantomWarp', 'hammerLaunch', 'cycloneWarpAct']);
const TARGET = new Set(['sacredOpening', 'cielaTimeStop', 'fieldRepair', 'lifeForceDrain', 'bellumPossession', 'lifeForceSlash', 'quickRemedy', 'subrosianDanceAct', 'subrosianRepair', 'sneakySwapAbility']);
const OTHER = new Set(['timeFreeze', 'frozenBattlefield', 'revealOceanKing', 'cobbleConstruct', 'frozenSanctuary', 'flameDivisionAbility', 'tornadoSummoning', 'invisiblePursuit', 'craykletSummoning',
  'combinedBarrage', 'ancientReconstruction', 'phantomEyeSummoning', 'secretKeyOpen', 'strikeSunCrest', 'activatePedestal', 'stringTightrope']);
/** Enemy units use these on their own when they can. */
export const PH_ENEMY_CASTS = ['ancientReconstruction', 'combinedBarrage'];

export const isPhantomAbility = (def: AbilityDef) => TILE.has(def.id) || TARGET.has(def.id) || OTHER.has(def.id);
export const phNeedsTile = (def: AbilityDef) => TILE.has(def.id);
export const phNeedsTarget = (def: AbilityDef) => TARGET.has(def.id);

/** Time an Hourglass ability costs this unit. */
export function hourglassCost(b: Battle, u: Unit, id: string): number {
  let c = HOURGLASS_COSTS[id] ?? 0;
  if (!c) return 0;
  if (b.bonus === 'spiritOfCourage' && u.team === 'player') c *= 0.75;
  if (has(u, 'phantomHourglassSkill')) c *= 0.75;
  if (u.weapons[0] === 'phantomSword') c -= 2;
  c -= b.ph?.levels.ciela ?? 0;
  return Math.max(1, Math.ceil(c));
}

/** Cost multiplier: Frost Magic, Volcanic Magic. */
export function phCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  if (!b) return 1;
  let m = 1;
  const el = def.element ?? def.wild?.dmg?.element;
  if (el === 'ice' && has(u, 'frostMagic')) m *= 0.75;
  if (el === 'fire' && has(u, 'volcanicMagic')) m *= 0.75;
  return m;
}

function line(b: Battle, u: Unit, n: number, flat: boolean): { stop: Pos | null; foe?: Unit; path: Pos[] }[] {
  const out: { stop: Pos | null; foe?: Unit; path: Pos[] }[] = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const path: Pos[] = [];
    let foe: Unit | undefined;
    for (let i = 1; i <= n; i++) {
      const x = u.x + dx * i, y = u.y + dy * i;
      if (!inBounds(b, x, y)) break;
      const o = unitAt(b, x, y);
      if (o && o !== u) { if (o.team !== u.team) foe = o; break; }
      const t = tileAt(b, x, y)!;
      if (anchorCost(b, u, x, y) >= INF || (flat && t !== 'plain' && t !== 'fort' && t !== 'bridge' && t !== 'shipDeck')) break;
      path.push({ x, y });
    }
    out.push({ stop: path[path.length - 1] ?? null, foe, path });
  }
  return out;
}

export function phTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const out: Pos[] = [];
  switch (def.id) {
    case 'temporalEscape':
      for (const p of tilesInRange(b, u, 1, 4, u.size)) if (free(b, u, p.x, p.y)) out.push(p);
      return out;
    case 'goronRoll': case 'wheelchairRush':
      for (const l of line(b, u, def.id === 'goronRoll' ? 4 : 3, def.id === 'wheelchairRush')) {
        if (l.foe) out.push({ x: l.foe.x, y: l.foe.y });
        else if (l.stop) out.push(l.stop);
      }
      return out;
    case 'phantomWarp':
      for (const e of foesOf(b, u).filter((x) => !x.hidden && unitDist(u, x) <= 6)) for (const p of tilesInRange(b, e, 1, 1, e.size)) if (free(b, u, p.x, p.y)) out.push(p);
      return out;
    case 'hammerLaunch':
      for (const p of tilesInRange(b, u, 2, 4, u.size)) if (free(b, u, p.x, p.y)) out.push(p);
      return out;
    case 'cycloneWarpAct':
      for (let k = 0; k < b.tiles.length; k++) {
        if (b.tiles[k] !== 'cycloneWarp') continue;
        const x = k % b.width, y = Math.floor(k / b.width);
        if ((x !== u.x || y !== u.y) && free(b, u, x, y)) out.push({ x, y });
      }
      return out;
  }
  return out;
}

export function phTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  switch (def.id) {
    case 'sacredOpening': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) <= 4);
    case 'cielaTimeStop': return alliesOf(b, u).filter((a) => a.acted && !a.isBoss && unitDist(u, a) <= 4);
    case 'fieldRepair': return alliesOf(b, u).filter((a) => unitDist(u, a) <= 1 && (isVessel(a) || a.race === 'construct'));
    case 'lifeForceDrain': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) <= 3);
    case 'bellumPossession': return foesOf(b, u).filter((e) => !e.hidden && !e.isBoss && !e.isCommander && !isVessel(e) && !e.phPossessed && unitDist(u, e) <= 3);
    case 'lifeForceSlash': case 'sneakySwapAbility': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) === 1);
    case 'quickRemedy': return [u, ...alliesOf(b, u)].filter((a) => unitDist(u, a) <= 2 && a.hp < a.stats.hp);
    case 'subrosianDanceAct': return alliesOf(b, u).filter((a) => a.acted && !a.isBoss && unitDist(u, a) === 1);
    case 'subrosianRepair': return [u, ...alliesOf(b, u)].filter((a) => unitDist(u, a) <= 1 && (a.wear?.[a.weapons[0]] ?? 0) > 0);
  }
  return [];
}

const healItem = (u: Unit) => u.pack.findIndex((p) => {
  const id = p.id;
  return ['redPotion', 'bluePotion', 'greenPotion', 'lavaSoup', 'lonLonMilk', 'elixirSoup'].includes(id) || /potion|soup|milk/i.test(id);
});

export function phUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isPhantomAbility(def)) return undefined;
  const st = b.ph;
  if (HOURGLASS_COSTS[def.id] !== undefined) {
    if (u.team !== 'player') return 'Only the army with the Phantom Hourglass';
    if (!st?.hourglass) return 'Needs the Phantom Hourglass';
    if (st.energy < hourglassCost(b, u, def.id)) return 'Not enough time in the Hourglass';
  }
  if (phNeedsTile(def) && !phTiles(b, u, def).length) return 'Nowhere to go';
  if (phNeedsTarget(def) && !phTargets(b, u, def).length) return def.id === 'quickRemedy' ? 'No one hurt within 2' : 'No one in range';
  switch (def.id) {
    case 'timeFreeze': return foesOf(b, u).some((e) => unitDist(u, e) <= 3) ? null : 'No enemies within 3';
    case 'quickRemedy': return healItem(u) >= 0 ? null : 'No healing item in your pack';
    case 'revealOceanKing': return TEMPLATES.oceanKing && roomFor(b, u, TEMPLATES.oceanKing.size) ? null : 'Not enough room for the Ocean King';
    case 'frozenSanctuary': return [u, ...alliesOf(b, u)].some((a) => unitDist(u, a) <= 3 && snowy(b, a) && a.hp < a.stats.hp) ? null : 'No one hurt on snow or ice within 3';
    case 'flameDivisionAbility': return u.phDivided ? 'Already divided' : null;
    case 'invisiblePursuit': return u.phShellBroken ? 'The shell is broken' : null;
    case 'combinedBarrage': return new Set(b.units.filter((x) => x.team === u.team && has(x, 'deadMansVolley')).map(tid)).size >= 4 ? null : 'Needs all four sisters';
    case 'ancientReconstruction': return u.hp > u.stats.hp / 2 ? 'Only below half HP' : null;
    case 'secretKeyOpen': return adjacentTile(b, u, 'lockedDoor') ? null : 'No Locked Door next to you';
    case 'strikeSunCrest': return adjacentTile(b, u, 'sunCrest') ? null : 'No Sun Crest next to you';
    case 'activatePedestal': return adjacentTile(b, u, 'spiritPedestal') ? null : 'No Crystal Pedestal next to you';
    case 'hammerLaunch': return !tilesOf(b, u).includes('hammerPad') ? 'Stand on a Hammer Launch Pad'
      : [u, ...alliesOf(b, u).filter((a) => unitDist(u, a) <= 1)].some((a) => WEAPONS[a.weapons[0]]?.type === 'hammer' || a.weapons.some((w) => WEAPONS[w]?.type === 'hammer')) ? null : 'Needs a hammer (yours or an adjacent ally\'s)';
    case 'stringTightrope': return !u.weapons.includes('grapplingHook') ? 'Needs a Grappling Hook' : !b.owned?.includes('tightropeKit') ? 'Needs the Grappling Hook Enhancement' : tightropeLine(b, u) ? null : 'No Tightrope Post in line across a gap';
    case 'cycloneWarpAct': return !tilesOf(b, u).includes('cycloneWarp') ? 'Stand on a Cyclone Warp Point' : b.owned?.includes('cycloneSlate') ? null : 'Needs the Cyclone Slate';
  }
  return null;
}

/** From a Tightrope Post next to the unit, the gap to the next post in a straight line. */
function tightropeLine(b: Battle, u: Unit): number[] | null {
  const post = adjacentTile(b, u, 'tightropePost');
  if (!post) return null;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const gap: number[] = [];
    for (let i = 1; i <= 6; i++) {
      const x = post.x + dx * i, y = post.y + dy * i;
      const t = tileAt(b, x, y);
      if (!t) break;
      if (t === 'tightropePost') { if (gap.length) return gap; break; }
      if (t !== 'chasm' && t !== 'water' && t !== 'lava') break;
      gap.push(keyOf(b, x, y));
    }
  }
  return null;
}

export interface PHOutcome {
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

/** A time-stopping ability went off: Bellumbeck's eye is exposed. */
function exposeBellumbecks(b: Battle, u: Unit, lines: string[], only?: Unit) {
  for (const e of foesOf(b, u)) if (has(e, 'possessedArmor') && (!only || only === e)) { buff(e, 'eyeExposed', "Bellum's Eye", 2); lines.push(`Time stops — Bellum's eye opens in ${e.name}'s armor!`); }
}

export function castPhantom(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): PHOutcome | null {
  if (!isPhantomAbility(def)) return null;
  const out: PHOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const s = effectiveStats(u);
  const st = phState(b);
  const strike = (e: Unit, dmg: number, status?: StatusKind) => {
    dmg = Math.min(e.hp, Math.max(1, Math.floor(dmg)));
    if (e.buffs.some((x) => x.barrier)) dmg = 0;
    e.hp -= dmg;
    const killed = e.hp <= 0;
    const statuses: StatusKind[] = [];
    if (!killed && status) { addStatus(e, status, 2); statuses.push(status); }
    out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses });
    if (killed) { u.kills++; phOnKill(b, u, e, rng); b.units = b.units.filter((x) => x !== e); if (!e.summoned) b.fallen.push(e); b.log.push(`${u.name} defeated ${e.name}.`); }
    return dmg;
  };
  const heal = (a: Unit, amt: number) => { amt = Math.min(a.stats.hp - a.hp, Math.ceil(amt)); if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); } return amt; };
  const spend = () => { const c = hourglassCost(b, u, def.id); if (c) st.energy = Math.max(0, st.energy - c); };
  const dash = (bonus: number, behind: boolean) => {
    const from = { x: u.x, y: u.y };
    const foe = unitAt(b, at!.x, at!.y);
    let land: Pos = at!;
    if (foe && foe !== u && foe.team !== u.team) {
      const dx = Math.sign(at!.x - u.x), dy = Math.sign(at!.y - u.y);
      land = { x: at!.x - dx, y: at!.y - dy };
      const w = WEAPONS[u.weapons[0]];
      strike(foe, s.str + (w?.might ?? 0) + bonus - effectiveStats(foe).def);
      if (foe.hp > 0) {
        // Rolling through: come to rest beyond the enemy (striking from behind) if there's room.
        const beyond = { x: foe.x + dx * foe.size, y: foe.y + dy * foe.size };
        if (behind && free(b, u, beyond.x, beyond.y)) land = beyond;
        else pushAway(b, foe, u, 1);
      }
    }
    if (land.x !== u.x || land.y !== u.y) { u.x = land.x; u.y = land.y; out.warped = { from, to: { ...land } }; }
  };
  switch (def.id) {
    // ── The Phantom Hourglass ──
    case 'timeFreeze': {
      spend();
      let n = 0;
      for (const e of foesOf(b, u)) {
        const d = unitDist(u, e);
        if (d > 3 || (e.isBoss && d > 2)) continue;
        buff(e, 'timeFrozen', 'Time Frozen', 1);
        out.statuses.push({ uid: e.uid, kind: 'stun' });
        n++;
      }
      exposeBellumbecks(b, u, out.lines);
      out.lines.push(`Time Freeze! ${n} enem${n === 1 ? 'y stands' : 'ies stand'} frozen (⌛${st.energy}/${st.max}).`);
      return out;
    }
    case 'frozenBattlefield': {
      spend();
      let n = 0;
      for (const e of foesOf(b, u)) { if (e.isBoss) continue; buff(e, 'timeStopped', 'Frozen Battlefield', 2); n++; }
      exposeBellumbecks(b, u, out.lines);
      out.lines.push(`The whole battlefield freezes: ${n} enem${n === 1 ? 'y' : 'ies'} will lose their next turn. Bosses resist (⌛${st.energy}/${st.max}).`);
      return out;
    }
    case 'temporalEscape': {
      spend();
      out.warped = { from: { x: u.x, y: u.y }, to: { ...at! } };
      u.x = at!.x; u.y = at!.y;
      out.lines.push(`${u.name} slips out of time (⌛${st.energy}/${st.max}).`);
      return out;
    }
    case 'sacredOpening': {
      spend();
      const t = target!;
      buff(t, 'phExposed', 'Sacred Opening', 2);
      addStatus(t, 'exposed', 2);
      out.statuses.push({ uid: t.uid, kind: 'exposed' });
      exposeBellumbecks(b, u, out.lines, t);
      out.lines.push(`A sacred light opens ${t.name}'s defenses (⌛${st.energy}/${st.max}).`);
      return out;
    }
    // ── Named characters ──
    case 'cielaTimeStop': {
      const t = target!;
      t.acted = false; t.moved = false; t.movedDist = 0;
      buff(t, 'timeWalk', 'Time Stop', 1);
      out.buffed.push(t.uid);
      exposeBellumbecks(b, u, out.lines);
      out.lines.push(`Ciela stops time for ${t.name}: it can act again, and its next attack draws no retaliation.`);
      return out;
    }
    case 'revealOceanKing': {
      const before = u.name;
      transformInto(b, u, 'oceanKing');
      u.artId = 'oceanKing';
      out.transformed = before;
      out.lines.push('The old man is gone. In his place, the Ocean King rises!');
      return out;
    }
    case 'fieldRepair': {
      const t = target!;
      heal(t, t.stats.hp * 0.3);
      const c = repairComponent(t);
      out.lines.push(`${u.name} patches up ${t.name}${c ? ` (the ${c} works again)` : ''}.`);
      return out;
    }
    case 'goronRoll': dash(6, true); out.lines.push(`${u.name} rolls!`); return out;
    case 'wheelchairRush': dash(4, false); out.lines.push(`${u.name} rushes forward in her wheelchair!`); return out;
    case 'cobbleConstruct': {
      const c = spawnTemp(b, 'cobbleConstruct', u, u.team, u.level, { moved: false, acted: false });
      if (c) { c.artId = 'cobbleConstruct'; out.lines.push('A Cobble construct grinds to life beside the king.'); } else out.lines.push('There is no room for a construct.');
      return out;
    }
    case 'frozenSanctuary': {
      for (const a of [u, ...alliesOf(b, u)]) if (unitDist(u, a) <= 3 && snowy(b, a)) heal(a, a.stats.hp * 0.2);
      out.lines.push('The cold itself shelters the Chief\'s people.');
      return out;
    }
    case 'phantomWarp': out.warped = { from: { x: u.x, y: u.y }, to: { ...at! } }; u.x = at!.x; u.y = at!.y; out.lines.push(`${u.name} warps through the shadows.`); return out;
    // ── Bosses ──
    case 'flameDivisionAbility': out.lines.push(divide(b, u) ? `${u.name} divides into three flames!` : 'No room to divide.'); return out;
    case 'tornadoSummoning': {
      const n = raiseWhirlwinds(b, u, 2);
      for (const e of foesOf(b, u)) if (unitDist(u, e) <= 2) pushAway(b, e, u, 1);
      out.lines.push(`${n} whirlwind${n === 1 ? '' : 's'} rise from the sand!`);
      return out;
    }
    case 'invisiblePursuit': u.hidden = true; buff(u, 'invisiblePursuit', 'Invisible Pursuit', 1, { mov: 2 }); out.lines.push(`${u.name} fades from sight.`); return out;
    case 'craykletSummoning': {
      let n = 0;
      for (let i = 0; i < 2; i++) if (spawnTemp(b, 'crayklet', u, u.team, Math.max(1, u.level - 2), { artId: 'crayklet' })) n++;
      out.lines.push(n ? `${n} Crayklet${n > 1 ? 's' : ''} scuttle out!` : 'Nothing comes.');
      return out;
    }
    case 'combinedBarrage': {
      const sisters = b.units.filter((x) => x.team === u.team && has(x, 'deadMansVolley'));
      for (const e of foesOf(b, u)) if (sisters.some((x) => unitDist(x, e) <= 3)) strike(e, Math.floor(s.mag / 2) + 6 - Math.floor(effectiveStats(e).res / 2));
      out.lines.push('The four sisters loose a Combined Barrage!');
      return out;
    }
    case 'ancientReconstruction': {
      u.phJoints = Math.min(4, (u.phJoints ?? 4) + 1);
      const lost = 4 - u.phJoints;
      if (lost) buff(u, 'eoxJoints', `Broken joints (${lost})`, 999, { str: -3 * lost, mov: -lost }); else u.buffs = u.buffs.filter((x) => x.id !== 'eoxJoints');
      heal(u, u.stats.hp * 0.15);
      out.lines.push(`${u.name} pulls its stones back together.`);
      return out;
    }
    case 'phantomEyeSummoning': {
      let n = 0;
      for (let i = 0; i < 2; i++) if (spawnTemp(b, 'phantomEye', u, u.team, Math.max(1, u.level - 2))) n++;
      out.lines.push(`${n} Phantom Eye${n === 1 ? '' : 's'} rise to watch the field.`);
      return out;
    }
    case 'lifeForceDrain': { const t = target!; const d = strike(t, s.mag + 6 - effectiveStats(t).res); heal(u, d); out.lines.push(`${u.name} drains ${t.name}'s life force.`); return out; }
    case 'lifeForceSlash': { const t = target!; const d = strike(t, s.str + 4 + (WEAPONS[u.weapons[0]]?.might ?? 0) - effectiveStats(t).def); heal(u, d / 2); return out; }
    case 'bellumPossession': { const t = target!; possess(b, u, t); out.lines.push(`${u.name} possesses ${t.name}!`); return out; }
    // ── The Potion Shop Lady and the Subrosians ──
    case 'quickRemedy': {
      const t = target!;
      const i = healItem(u);
      const id = u.pack[i].id;
      const name = ITEMS[id]?.name ?? id;
      if (--u.pack[i].uses <= 0) u.pack.splice(i, 1);
      heal(t, (id === 'bluePotion' || id === 'elixirSoup' ? t.stats.hp : id === 'lavaSoup' ? 25 : 20) * 1.3);
      out.lines.push(`${u.name} tosses ${t === u ? 'down' : `${t.name}`} a remedy (${name}).`);
      return out;
    }
    case 'subrosianDanceAct': { const t = target!; t.acted = false; t.moved = false; t.movedDist = 0; out.buffed.push(t.uid); out.lines.push(`${u.name} dances: ${t.name} can act again!`); return out; }
    case 'subrosianRepair': { const t = target!; if (t.wear) t.wear[t.weapons[0]] = 0; out.lines.push(`${u.name} hammers ${t.name}'s ${WEAPONS[t.weapons[0]]?.name ?? 'weapon'} as good as new.`); return out; }
    case 'sneakySwapAbility': {
      const t = target!;
      const i = t.pack.findIndex(() => true);
      if (i >= 0 && u.pack.length < 6) { const p = t.pack.splice(i, 1)[0]; u.pack.push(p); out.lines.push(`${u.name} swipes a ${p.id} from ${t.name}!`); }
      else if (rng.chance(40)) { (b.loot ??= []).push(rng.pick(['redPotion', 'bomb', 'bombchu', 'sandsOfHoursVial'])); out.lines.push(`${u.name} finds something in ${t.name}'s pockets.`); }
      else out.lines.push(`${t.name}'s pockets are empty.`);
      return out;
    }
    case 'secretKeyOpen': { const p = adjacentTile(b, u, 'lockedDoor')!; b.tiles[keyOf(b, p.x, p.y)] = 'plain'; out.lines.push(`${u.name} opens the door with her secret key.`); return out; }
    // ── Battlefield spaces ──
    case 'strikeSunCrest': {
      const p = adjacentTile(b, u, 'sunCrest')!;
      let n = 0;
      for (const q of tilesInRange(b, p, 1, 4, 1)) { const k = keyOf(b, q.x, q.y); if (b.tiles[k] === 'lockedDoor' || b.tiles[k] === 'cracked' || b.tiles[k] === 'crystalBarrier') { b.tiles[k] = 'plain'; n++; } }
      b.tiles[keyOf(b, p.x, p.y)] = 'fort';
      const spot = tilesInRange(b, p, 1, 3, 1).find((q) => tileAt(b, q.x, q.y) === 'plain' && !unitAt(b, q.x, q.y));
      if (spot) (b.digSpots ??= []).push(spot);
      out.lines.push(`The Sun Crest blazes: ${n} seal${n === 1 ? '' : 's'} open and a hidden treasure glints nearby.`);
      return out;
    }
    case 'activatePedestal': {
      const p = adjacentTile(b, u, 'spiritPedestal')!;
      const kind = (['power', 'wisdom', 'courage'] as const).find((x) => !st.pedestals.includes(x)) ?? 'courage';
      st.pedestals.push(kind);
      b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      const stat: Record<string, number> = kind === 'power' ? { str: 2 } : kind === 'wisdom' ? { res: 2 } : { skl: 2 };
      for (const a of b.units.filter((x) => x.team === u.team)) buff(a, `pedestal:${kind}`, `Crystal of ${kind[0].toUpperCase()}${kind.slice(1)}`, 99, stat);
      out.lines.push(`The crystal of ${kind} fits the pedestal: the whole army is blessed.`);
      return out;
    }
    case 'hammerLaunch': out.warped = { from: { x: u.x, y: u.y }, to: { ...at! } }; u.x = at!.x; u.y = at!.y; out.lines.push(`WHAM! ${u.name} is launched off the pad.`); return out;
    case 'stringTightrope': {
      const gap = tightropeLine(b, u)!;
      for (const k of gap) b.tiles[k] = 'tightrope';
      out.lines.push(`${u.name} strings a tightrope across the gap.`);
      return out;
    }
    case 'cycloneWarpAct': out.warped = { from: { x: u.x, y: u.y }, to: { ...at! } }; u.x = at!.x; u.y = at!.y; out.lines.push(`A cyclone carries ${u.name} across the field.`); return out;
  }
  return null;
}

// ───────────────────────── Items ─────────────────────────

/** Bombchus run through Bombchu Tunnels: from next to one, any space next to another tunnel is in reach. */
export function phItemTiles(b: Battle, u: Unit, id: string, tiles: Pos[]): Pos[] | null {
  if (id !== 'bombchu' || !adjacentTile(b, u, 'bombchuTunnel')) return null;
  const extra: Pos[] = [];
  for (let k = 0; k < b.tiles.length; k++) {
    if (b.tiles[k] !== 'bombchuTunnel') continue;
    for (const p of tilesInRange(b, { x: k % b.width, y: Math.floor(k / b.width) }, 1, 1, 1)) if (!extra.some((q) => q.x === p.x && q.y === p.y)) extra.push(p);
  }
  return [...tiles, ...extra.filter((p) => !tiles.some((q) => q.x === p.x && q.y === p.y))];
}

/** Phantom Hourglass pack items. Returns a log line, or null if the item isn't one of ours. */
export function usePhantomItem(b: Battle, id: string): string | null {
  if (id !== 'sandsOfHoursVial') return null;
  const st = phState(b);
  if (!st.hourglass) { st.hourglass = true; st.max = Math.max(st.max, 8); }
  st.energy = Math.min(st.max, st.energy + 8);
  return `The Phantom Hourglass fills: ⌛${st.energy}/${st.max}.`;
}

/** A bomb went off: Cyclok falls from the air through a Whirlwind, Dongorongo is knocked over, Eox's joints crack. */
export function phOnBlast(b: Battle, by: Unit, at: Pos, radius: number, power: number): string[] {
  const lines: string[] = [];
  const whirl = (p: Pos) => tilesInRange(b, p, 0, 1, 1).some((q) => tileAt(b, q.x, q.y) === 'whirlwind');
  if (whirl(at) || near(b, by, ['whirlwind'])) {
    for (const c of b.units.filter((x) => has(x, 'tornadoRider') && x.team !== by.team && !x.phDowned && footDist(at.x, at.y, 1, x.x, x.y, x.size) <= radius + 3)) {
      c.phDowned = 2;
      const d = Math.min(c.hp - 1, power);
      if (d > 0) c.hp -= d;
      lines.push(`The explosive rides the Whirlwind up — ${c.name} crashes to the ground!`);
    }
  }
  for (const e of b.units.filter((x) => x.team !== by.team && x.hp > 0 && footDist(at.x, at.y, 1, x.x, x.y, x.size) <= radius)) {
    if (has(e, 'exposedInterior')) {
      if (e.phKnocked) { const d = Math.min(e.hp - 1, power); if (d > 0) e.hp -= d; lines.push(`The blast goes straight into ${e.name}'s open mouth!`); }
      else { e.phKnocked = 1; lines.push(`The blast knocks ${e.name} onto its back!`); }
    }
    if (has(e, 'structuralWeakness') && (e.phJoints ?? 0) > 0) breakJoint(e, lines);
    if (has(e, 'invisibleHunter') && !e.phShellBroken) { e.phShellHits = (e.phShellHits ?? 0) + 2; if (e.phShellHits >= 4) { e.phShellBroken = true; e.hidden = false; lines.push(`The blast cracks ${e.name}'s shell open!`); } else e.hidden = false; }
  }
  return lines;
}

/** After a salvage haul: ship parts, Spirit Gems and Sands of Hours (Salvage Arm, Strong Salvage, Fortune Seeker). */
export function phSalvageBonus(b: Battle, u: Unit, rupees: number, rng: RNG): string[] {
  const lines: string[] = [];
  let extra = 0;
  if (has(u, 'strongSalvage')) extra += 0.5;
  if (u.team === 'player' && (b.bonus === 'fortuneSeeker' || b.units.some((a) => a.team === u.team && has(a, 'fortuneSeeker')))) extra += 0.3;
  if (extra) { const r = Math.round(rupees * extra); b.bonusRupees = (b.bonusRupees ?? 0) + r; lines.push(`+₹${r} more from the haul.`); }
  if (!PH_WORLD(b) && !tag(u, 'salvageArm')) return lines;
  const roll = rng.int(0, 99);
  if (roll < (tag(u, 'salvageArm') ? 45 : 25)) {
    const sets = SHIP_SETS.filter((s) => s.rarity !== 'legendary' || rng.chance(30));
    const set = rng.pick(sets);
    const slots = ['hull', 'cannonMount', 'prow', 'anchor', 'handrail', 'bridge', 'chimney', 'wheel'];
    const part = `${set.id}${(() => { const sl = rng.pick(slots); return sl[0].toUpperCase() + sl.slice(1); })()}Part`;
    if (GEAR[part]) { (b.loot ??= []).push(part); lines.push(`A ship part: the ${GEAR[part].name}!`); }
  } else if (roll < 75) {
    const gem = rng.pick(['powerSpiritGem', 'wisdomSpiritGem', 'courageSpiritGem']);
    phState(b).found.push(gem);
    lines.push('A Spirit Gem glints among the barnacles.');
  } else {
    phState(b).found.push('sandsOfHours');
    lines.push('A pouch of the Sands of Hours!');
  }
  return lines;
}

/** The Phantom Hourglass's state line for the battle screen. */
export const hourglassLabel = (b: Battle) => (b.ph?.hourglass ? `⌛${b.ph.energy}/${b.ph.max}` : '');

