// Micro units (size 0): a permanent, base-game rule any pack can use (docs/minish-cap-pack.md section 1).
//
// A Micro unit is stored with `size: 1` and `micro: true`, so every footprint, distance and range
// calculation keeps working; what changes is occupancy:
//   · up to MICRO_CAP Micro units share one tile, of any team, alongside a normal unit (or a tile of a
//     larger unit's footprint, each tile independently);
//   · Micro units never block anyone, and pass through every space (grid.ts computeMoves);
//   · `unitAt` returns only normal-sized units, so ordinary placement and targeting are unchanged;
//   · a Micro unit on the same tile as another unit counts as adjacent to it (grid.ts unitDist).
// Combat: Micro vs Normal direct attacks deal 25% unless they hit a weak point; Normal vs Micro ordinary
// targeted attacks get −60 Hit; area attacks (abilities and blasts that pick every unit in range) hit both.
// Actions: Hitch Ride, the infiltration actions, stomping, internal strikes, shrinking and growing, and the
// size-dependent spaces (separate movement networks for normal and Micro units).

import { TEMPLATES, WEAPONS } from '../data/registry';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange } from './grid';
import { INF } from './rules';
import { addStatus } from './status';
import { transformInto } from './transform';
import { activeGear, canSwim, effectiveStats, moveTypeOf, unitTags } from './units';
import type { AbilityDef, Battle, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';
import type { RNG } from './rng';

declare module './types' {
  interface Unit {
    /** Hitch Ride: the host this Micro unit rides on, and its tile within the host's footprint. */
    mcRide?: { host: string; dx: number; dy: number };
    /** A normal unit shrunk to Micro size: what to restore when it grows. */
    /** Ordinary weapons magically resized for this native Micro unit (the Minish Forge). */
    mcResized?: string[];
    mcShrunk?: { hp: number; def: number; con: number; size: number; baseSize?: number; mounted?: boolean };
  }
  interface UnitTemplate {
    /** The Micro form this character shrinks into (its own stat profile, e.g. Micro Link). */
    microForm?: string;
    /** The normal-sized form a native Micro character grows into. */
    growForm?: string;
  }
}

export const MICRO_CAP = 4;
export const isMicro = (u?: { micro?: boolean } | null) => !!u?.micro;
const covers = (u: Unit, x: number, y: number) => x >= u.x && y >= u.y && x < u.x + u.size && y < u.y + u.size;
const has = (u: Unit, s: string) => u.skills.includes(s);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);

/** Every unit (normal and Micro) on a tile. */
export function unitsAt(b: Battle, x: number, y: number): Unit[] {
  return b.units.filter((u) => covers(u, x, y));
}
/** The Micro units on a tile. */
export function microAt(b: Battle, x: number, y: number): Unit[] {
  return b.units.filter((u) => u.micro && covers(u, x, y));
}
/** Room left for Micro units on a tile (not counting `except`). */
export function microRoom(b: Battle, x: number, y: number, except?: Unit): number {
  return MICRO_CAP - b.units.filter((u) => u !== except && u.micro && covers(u, x, y)).length;
}
/** Two units share at least one tile. */
export const sharesTile = (a: Unit, b: Unit) => a !== b && footDist(a.x, a.y, a.size, b.x, b.y, b.size) === 0;
/** A Micro unit can stop on this tile (terrain and the four-per-tile limit). */
export function microFits(b: Battle, u: Unit, x: number, y: number): boolean {
  return inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && microRoom(b, x, y, u) > 0;
}
/** Corner slot (0-3) of a Micro unit on its tile, for the battle view. */
export function microSlot(b: Battle, u: Unit): number {
  return Math.max(0, microAt(b, u.x, u.y).indexOf(u)) % MICRO_CAP;
}

/** Micro-sized weapons (Minish gear) and those any size can use. */
const microSized = (w: WeaponDef) => !!w.mc?.includes('micro') || ['natural', 'magic', 'staff', 'instrument'].includes(w.type) || !!w.anyClass;
/** Native Micro units can't use ordinary weapons (no magical resizing); shrunk units' gear shrinks with them. */
export function mcCannotWield(u: Unit, w: WeaponDef): boolean {
  return !!u.micro && !u.mcShrunk && !u.originalForm && !microSized(w) && !u.mcResized?.includes(w.id);
}

// ───────────────────────── Movement: the Micro network ─────────────────────────

/** Movement cost of a tile for a Micro unit (grid.ts tileCost). Normal units use rules.ts MOVE_COSTS. */
export function mcTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  void b;
  if (!u.micro) return c;
  const fly = moveTypeOf(u) === 'flying';
  switch (t) {
    case 'microPassage': case 'microBridge': case 'microTunnel': case 'minishDoor': case 'floatingLeaf': case 'minishPortal':
    case 'internalWeakPoint': case 'pacciHole': case 'duplicationTile': case 'windCrest': case 'giantMushroom': case 'minishVine':
    case 'gustCurrent': case 'waterDroplet': case 'raindrop': case 'minishTable': case 'ordinaryHouse': case 'giantGrass':
      return 1;
    case 'spiderweb': return 4;
    case 'softEarthWall': return INF;
    case 'puddle': return fly || canSwim(u) ? 1 : INF; // deep water at Micro size
    case 'giantFlower': return fly ? 1 : 2; // an elevated platform
    case 'fallenTwig': return fly ? 1 : INF; // an obstacle
    case 'bookshelf': return fly ? 1 : 2; // a climbable structure
    case 'tallGrass': return fly ? 1 : 2; // a dense forest
  }
  return c;
}

/** Situational bonuses for Micro units on size-dependent terrain, and the infiltration debuffs (combat.ts situational). */
export function mcMods(b: Battle, u: Unit, pos: Pos): { hit: number; avoid: number; def: number; skl: number } {
  const m = { hit: 0, avoid: 0, def: 0, skl: 0 };
  if (u.buffs.some((x) => x.id === 'mcDistracted')) m.hit -= 15;
  if (!u.micro) return m;
  const t = tileAt(b, pos.x, pos.y);
  if (t === 'giantGrass' || t === 'tallGrass') m.avoid += 20;
  if (t === 'giantFlower' || t === 'minishTable') { m.avoid += 15; m.hit += 10; }
  if (t === 'bookshelf') m.avoid += 20;
  if (t === 'minishDoor' || t === 'ordinaryHouse') { m.avoid += 20; m.def += 2; }
  return m;
}

// ───────────────────────── Combat rules ─────────────────────────

/** Normal vs Micro: ordinary targeted attacks −60 Hit. */
export function mcHit(atk: Unit, def: Unit): number {
  return def.micro && !atk.micro ? -60 : 0;
}

/** The target's weak point is open to this Micro attacker (Expose Weak Point, an Internal Weak Point space). */
export function weakPointOpen(b: Battle, atk: Unit, def: Unit): boolean {
  return def.buffs.some((x) => x.id === 'mcWeakPoint') || tileAt(b, atk.x, atk.y) === 'internalWeakPoint' || !!def.isBoss && def.buffs.some((x) => x.id === 'mcExposedCore');
}

/** Micro vs Normal: direct attacks deal 25% unless they hit a weak point (Tiny Hammer: 50% against armour and machines). */
export function mcMultiplier(b: Battle, atk: Unit, def: Unit, w: WeaponDef | undefined): number {
  if (!atk.micro || def.micro) return 1;
  if (weakPointOpen(b, atk, def)) return 1;
  const armored = unitTags(def).some((t) => t === 'armored' || t === 'construct' || t === 'stone' || t === 'metal');
  if (armored && (has(atk, 'tinyHammer') || w?.mc?.includes('mechanical'))) return 0.5;
  return 0.25;
}

// ───────────────────────── Each turn ─────────────────────────

export interface MCEvent { uid: string; heal: number; damage: number; source: string }

/** Riders keep to their host; a ride ends when they no longer share a tile. */
export function syncRiders(b: Battle) {
  for (const r of b.units) {
    if (!r.mcRide) continue;
    const h = b.units.find((x) => x.uid === r.mcRide!.host);
    if (!h || !r.micro || h.team !== r.team) { delete r.mcRide; continue; }
    const dx = Math.min(r.mcRide.dx, h.size - 1), dy = Math.min(r.mcRide.dy, h.size - 1);
    const x = h.x + dx, y = h.y + dy;
    if (r.x === x && r.y === y) continue;
    if (microRoom(b, x, y, r) > 0) { r.x = x; r.y = y; } else delete r.mcRide;
  }
}

/** Start of a Micro unit's turn: hazards and shelter on size-dependent terrain, wind currents. */
export function mcStartPhase(b: Battle, u: Unit, events: MCEvent[]) {
  if (u.mcRide && !b.units.some((h) => h.uid === u.mcRide!.host && sharesTile(u, h))) delete u.mcRide;
  if (!u.micro) return;
  const t = tileAt(b, u.x, u.y);
  const hurt = (pct: number, source: string) => {
    const d = Math.min(u.hp - 1, Math.max(1, Math.ceil(u.stats.hp * pct)));
    if (d > 0) { u.hp -= d; events.push({ uid: u.uid, heal: 0, damage: d, source }); }
  };
  if (t === 'waterDroplet' && moveTypeOf(u) !== 'flying') hurt(0.1, 'is soaked by a water droplet');
  if (t === 'raindrop') hurt(0.1, 'is hit by a falling raindrop');
  if (t === 'minishDoor' || t === 'ordinaryHouse') {
    const h = Math.min(u.stats.hp - u.hp, Math.ceil(u.stats.hp * 0.1));
    if (h > 0) { u.hp += h; events.push({ uid: u.uid, heal: h, damage: 0, source: 'rests in a tiny house' }); }
  }
  if (t === 'giantGrass') addStatus(u, 'veiled', 1);
  if (t === 'gustCurrent' && !u.mcRide) {
    const [dx, dy] = b.wind ?? [1, 0];
    let x = u.x, y = u.y;
    for (let i = 0; i < 2; i++) if (microFits(b, u, x + dx, y + dy)) { x += dx; y += dy; }
    if (x !== u.x || y !== u.y) { u.x = x; u.y = y; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is carried off by the gust current' }); }
  }
}

/** After any unit moves: its riders follow; a Micro unit that walked off its host dismounts; Giant Grass hides it. */
export function mcAfterMove(b: Battle, u: Unit): string | null {
  if (u.mcRide) {
    const h = b.units.find((x) => x.uid === u.mcRide!.host);
    if (!h || !sharesTile(u, h)) delete u.mcRide;
  }
  syncRiders(b);
  if (!u.micro) return null;
  const t = tileAt(b, u.x, u.y);
  if (t === 'giantGrass') { addStatus(u, 'veiled', 1); return `${u.name} disappears into the giant grass.`; }
  if (t === 'waterDroplet' && moveTypeOf(u) !== 'flying' && u.hp > 1) { const d = Math.min(u.hp - 1, Math.ceil(u.stats.hp * 0.1)); u.hp -= d; return `${u.name} is splashed by a water droplet (−${d}).`; }
  return null;
}

// ───────────────────────── Deployment ─────────────────────────

/** Battle start: Micro units deploy riding a larger ally where one is close (up to two per host), sharing its tile. */
export function placeMicroAtStart(b: Battle) {
  for (const team of ['player', 'enemy'] as const) {
    const hosts = b.units.filter((h) => h.team === team && !h.micro && !h.captive && !h.isBoss);
    if (!hosts.length) continue;
    const load = new Map<string, number>();
    for (const m of b.units.filter((x) => x.team === team && x.micro && !x.isBoss)) {
      const h = hosts.filter((x) => (load.get(x.uid) ?? 0) < 2 && footDist(x.x, x.y, x.size, m.x, m.y, 1) <= 3)
        .sort((p, q) => footDist(p.x, p.y, p.size, m.x, m.y, 1) - footDist(q.x, q.y, q.size, m.x, m.y, 1))[0];
      if (!h) continue;
      const spot = footprint(h.x, h.y, h.size).find((p) => microFits(b, m, p.x, p.y));
      if (!spot) continue;
      m.x = spot.x; m.y = spot.y;
      m.mcRide = { host: h.uid, dx: spot.x - h.x, dy: spot.y - h.y };
      load.set(h.uid, (load.get(h.uid) ?? 0) + 1);
    }
  }
}

/** After a battle: shrunk units return to full size (their stats are restored before they go back to the roster). */
export function microBeforeFinish(b: Battle) {
  for (const u of [...b.units, ...b.fallen, ...(b.withdrawn ?? []), ...b.units.flatMap((v) => v.cargo ?? [])]) {
    if (u.mcShrunk) unshrink(u);
    delete u.mcRide;
    if (u.originalForm?.templateId && TEMPLATES[u.originalForm.templateId]) u.micro = TEMPLATES[u.originalForm.templateId].size === 0 || undefined;
  }
}

// ───────────────────────── Shrinking and growing ─────────────────────────

/** Shrink with the doc's modifiers (units without their own Micro profile): HP ×0.8, DEF ×0.6, CON 1–2, SKL +2, SPD +3, MOV +1. */
export function shrink(u: Unit) {
  const ratio = u.hp / Math.max(1, u.stats.hp);
  u.mcShrunk = { hp: u.stats.hp, def: u.stats.def, con: u.stats.con, size: u.size, baseSize: u.baseSize, mounted: u.mounted };
  u.stats = { ...u.stats, hp: Math.max(1, Math.round(u.stats.hp * 0.8)), def: Math.round(u.stats.def * 0.6), con: Math.min(2, Math.max(1, u.stats.con)) };
  u.hp = Math.max(1, Math.round(u.stats.hp * ratio));
  u.size = 1; u.baseSize = 1; u.mounted = false; u.micro = true;
  u.buffs = u.buffs.filter((x) => x.id !== 'mcShrink');
  u.buffs.push({ id: 'mcShrink', name: 'Micro size', turns: 999, stats: { skl: 2, spd: 3, mov: 1 } });
}
export function unshrink(u: Unit) {
  const s = u.mcShrunk;
  if (!s) return;
  const ratio = u.hp / Math.max(1, u.stats.hp);
  // Level-up gains made while small are kept.
  u.stats = { ...u.stats, hp: s.hp + Math.max(0, u.stats.hp - Math.round(s.hp * 0.8)), def: s.def, con: s.con };
  u.hp = u.hp <= 0 ? 0 : Math.max(1, Math.round(u.stats.hp * ratio));
  u.size = s.size; u.baseSize = s.baseSize; u.mounted = s.mounted;
  delete u.mcShrunk;
  u.micro = undefined;
  u.buffs = u.buffs.filter((x) => x.id !== 'mcShrink');
}
/** Change into another template's form, fixing up Micro size (templates of size 0 are Micro). */
export function mcTransform(b: Battle, u: Unit, templateId: string) {
  transformInto(b, u, templateId);
  const micro = TEMPLATES[templateId]?.size === 0;
  if (micro) { u.size = 1; u.baseSize = 1; }
  u.micro = micro || undefined;
}

/** Shrinking is possible on a Minish Portal, beside (or carrying) an Ezlo, or with a magic cap. */
export function canChangeSize(b: Battle, u: Unit): boolean {
  if (tileAt(b, u.x, u.y) === 'minishPortal' || footprint(u.x, u.y, u.size).some((p) => tileAt(b, p.x, p.y) === 'minishPortal')) return true;
  if (b.groupSupports?.includes('picoriLegend') && ['heroOfMinish', 'microLink', 'zeldaMC', 'ezloMinish', 'ezloCap'].includes(u.templateId ?? '')) return true;
  if (has(u, 'masterOfMiniaturization') || has(u, 'enchantedCap') || has(u, 'sorcerersCapSkill') || WEAPONS[u.weapons[0]]?.mc?.includes('sizeBoost') || activeGear(u).some((g) => g.mc?.includes('sizeChange'))) return true;
  return b.units.some((a) => a.team === u.team && a !== u && (has(a, 'masterOfMiniaturization') || has(a, 'enchantedCap')) && footDist(a.x, a.y, a.size, u.x, u.y, u.size) <= 1);
}

/** Room to grow back: normal-sized footprint free of normal units and solid terrain (not inside a creature). */
function growRoom(b: Battle, u: Unit, size: number): boolean {
  const probe = { ...u, size, micro: undefined } as Unit;
  if (anchorCost(b, probe, u.x, u.y) >= INF) return false;
  return footprint(u.x, u.y, size).every((p) => !b.units.some((o) => o !== u && !o.micro && covers(o, p.x, p.y)));
}

const growTarget = (u: Unit): { kind: 'unshrink'; size: number } | { kind: 'form'; id: string; size: number } | null => {
  if (u.mcShrunk) return { kind: 'unshrink', size: u.mcShrunk.size };
  const base = u.originalForm?.templateId;
  if (u.micro && base && TEMPLATES[base] && TEMPLATES[base].size > 0 && TEMPLATES[base].microForm === u.templateId) return { kind: 'form', id: base, size: TEMPLATES[base].size };
  const g = TEMPLATES[u.templateId ?? '']?.growForm;
  if (u.micro && g && TEMPLATES[g]) return { kind: 'form', id: g, size: TEMPLATES[g].size };
  return null;
};

// ───────────────────────── Actions ─────────────────────────

const INFILTRATE = ['mcSabotage', 'mcDistract', 'mcTrip', 'mcExposeWeakPoint', 'mcInternalStrike', 'mcPickpocket'];
const TARGET = new Set([...INFILTRATE, 'mcStomp']);
const TILE = new Set(['mcTunnelTravel', 'mcMushroomLaunch', 'mcPacciLaunch', 'mcWindCrestWarp']);
export const MICRO_ABILITIES = new Set([...TARGET, ...TILE, 'mcShrink', 'mcGrow', 'mcHitchRide', 'mcDismount', 'mcDigWall', 'mcBurnWeb']);
export const mcNeedsTile = (def: AbilityDef) => TILE.has(def.id);
export const mcNeedsTarget = (def: AbilityDef) => TARGET.has(def.id);

/** Internal strikes work on compatible monsters and constructs: anything size 2 or more with an inside to get into. */
export const internalCompatible = (e: Unit) => !e.micro && e.size >= 2 && !unitTags(e).includes('vessel') && !unitTags(e).includes('spirit');
const weaponTag = (u: Unit, t: string) => u.weapons.some((id) => WEAPONS[id]?.mc?.includes(t));
const gearTag = (u: Unit, t: string) => activeGear(u).some((g) => g.mc?.includes(t));

export function mcTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  if (def.id === 'mcStomp') return b.units.filter((e) => e.team !== u.team && e.micro && !e.hidden && sharesTile(u, e));
  if (!u.micro) return [];
  const foes = b.units.filter((e) => e.team !== u.team && !e.micro && !e.captive && sharesTile(u, e));
  if (def.id === 'mcInternalStrike') return foes.filter(internalCompatible);
  if (def.id === 'mcPickpocket') return foes.filter((e) => e.pack.length > 0 || e.weapons.length > 1);
  return foes;
}

function freeFor(b: Battle, u: Unit, x: number, y: number): boolean {
  if (u.micro) return microFits(b, u, x, y);
  return anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => !b.units.some((o) => o !== u && !o.micro && covers(o, p.x, p.y)));
}

export function mcTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const here = tileAt(b, u.x, u.y);
  const all: Pos[] = [];
  for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) all.push({ x, y });
  switch (def.id) {
    case 'mcTunnelTravel': return u.micro && here === 'microTunnel' ? all.filter((p) => (p.x !== u.x || p.y !== u.y) && tileAt(b, p.x, p.y) === 'microTunnel' && freeFor(b, u, p.x, p.y)) : [];
    case 'mcMushroomLaunch': return u.micro && here === 'giantMushroom' ? tilesInRange(b, u, 2, 4).filter((p) => freeFor(b, u, p.x, p.y)) : [];
    case 'mcPacciLaunch': {
      const cane = weaponTag(u, 'pacci') || b.units.some((a) => a.team === u.team && weaponTag(a, 'pacci') && footDist(a.x, a.y, a.size, u.x, u.y, u.size) <= 1);
      return here === 'pacciHole' && cane && u.size <= 2 ? tilesInRange(b, u, 2, 4, u.size).filter((p) => freeFor(b, u, p.x, p.y)) : [];
    }
    case 'mcWindCrestWarp': return here === 'windCrest' && weaponTag(u, 'windCrest') ? all.filter((p) => (p.x !== u.x || p.y !== u.y) && tileAt(b, p.x, p.y) === 'windCrest' && freeFor(b, u, p.x, p.y)) : [];
  }
  return [];
}

export function mcUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!MICRO_ABILITIES.has(def.id)) return undefined;
  if (TARGET.has(def.id) && !mcTargets(b, u, def).length) return def.id === 'mcStomp' ? 'No enemy Micro unit on your spaces' : 'Must share a space with a suitable enemy';
  if (TILE.has(def.id) && !mcTiles(b, u, def).length) return 'Not from here';
  switch (def.id) {
    case 'mcShrink':
      if (u.micro) return 'Already Micro-sized';
      if ((u.baseSize ?? u.size) > 2 || u.isBoss || unitTags(u).includes('vessel') || unitTags(u).includes('train')) return 'Too big to shrink';
      if (!canChangeSize(b, u)) return 'Needs a Minish Portal or Ezlo';
      if (microRoom(b, u.x, u.y, u) <= 0) return 'No room at Micro size here';
      return null;
    case 'mcGrow': {
      const g = growTarget(u);
      if (!g) return 'No normal-sized form';
      if (!canChangeSize(b, u)) return 'Needs a Minish Portal or Ezlo';
      if (!growRoom(b, u, g.size)) return 'Not enough room to grow';
      return null;
    }
    case 'mcHitchRide':
      if (!u.micro || u.mcRide) return u.mcRide ? 'Already riding' : 'Micro units only';
      return b.units.some((h) => h.team === u.team && !h.micro && sharesTile(u, h)) ? null : 'Share a larger ally\'s space first';
    case 'mcDismount': return u.mcRide ? null : 'Not riding';
    case 'mcDigWall': return gearTag(u, 'moleMitts') && tilesInRange(b, u, 1, 1, u.size).some((p) => tileAt(b, p.x, p.y) === 'softEarthWall') ? null : 'Needs Mole Mitts next to a Soft Earth Wall';
    case 'mcBurnWeb': {
      const fire = weaponTag(u, 'lantern') || u.pack.some((p) => p.id === 'flameLantern') || WEAPONS[u.weapons[0]]?.element === 'fire';
      return fire && tilesInRange(b, u, 0, 2, u.size).some((p) => tileAt(b, p.x, p.y) === 'spiderweb') ? null : 'Needs fire within 2 of a Spiderweb';
    }
  }
  return null;
}

/** Pack reactions to an internal strike (a boss's mechanisms, eyes or arms). */
export const internalHooks: ((b: Battle, by: Unit, e: Unit) => string[])[] = [];

export interface MCOutcome {
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

function debuff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}

export function castMicro(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): MCOutcome | null {
  if (!MICRO_ABILITIES.has(def.id)) return null;
  const out: MCOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const s = effectiveStats(u);
  const strike = (e: Unit, dmg: number) => {
    dmg = Math.min(e.hp, Math.max(1, Math.floor(dmg)));
    if (e.buffs.some((x) => x.barrier || x.id === 'bubble')) dmg = 0;
    e.hp -= dmg;
    const killed = e.hp <= 0;
    out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses: [] });
    if (killed) { u.kills++; b.units = b.units.filter((x) => x !== e); if (!e.summoned) b.fallen.push(e); b.log.push(`${u.name} defeated ${e.name}.`); }
    return dmg;
  };
  const tele = (to: Pos) => { out.warped = { from: { x: u.x, y: u.y }, to: { ...to } }; u.x = to.x; u.y = to.y; delete u.mcRide; };
  switch (def.id) {
    case 'mcShrink': {
      const form = TEMPLATES[u.templateId ?? '']?.microForm;
      const was = u.name;
      if (form && TEMPLATES[form]) mcTransform(b, u, form);
      else shrink(u);
      out.transformed = was;
      out.lines.push(`${was} shrinks to Micro size${form ? ` (${u.name})` : ''}.`);
      return out;
    }
    case 'mcGrow': {
      const g = growTarget(u)!;
      const was = u.name;
      if (g.kind === 'unshrink') unshrink(u);
      else mcTransform(b, u, g.id);
      delete u.mcRide;
      out.transformed = was;
      out.lines.push(`${was} grows back to full size.`);
      return out;
    }
    case 'mcHitchRide': {
      const h = b.units.find((x) => x.team === u.team && !x.micro && sharesTile(u, x))!;
      u.mcRide = { host: h.uid, dx: u.x - h.x, dy: u.y - h.y };
      out.free = true;
      out.lines.push(`${u.name} hitches a ride on ${h.name}.`);
      return out;
    }
    case 'mcDismount': delete u.mcRide; out.free = true; out.lines.push(`${u.name} hops off.`); return out;
    case 'mcStomp': {
      const e = target!;
      const es = effectiveStats(e);
      const hit = Math.max(10, Math.min(95, 55 + (s.skl - es.spd) * 3 + Math.floor(s.lck / 2)));
      if (!rng.chance(hit)) { out.lines.push(`${u.name} stomps at ${e.name} and misses (${hit}%).`); return out; }
      const mult = u.skills.includes('gelatinousGiant') ? 2 : 1;
      const d = strike(e, (s.str + 4 - es.def) * 1.5 * mult);
      out.lines.push(`${u.name} stomps on ${e.name} (−${d}).`);
      return out;
    }
    case 'mcSabotage': {
      const e = target!;
      const w = e.weapons[0];
      if (e.team === 'player' && w) { e.wear ??= {}; e.wear[w] = (e.wear[w] ?? 0) + 5; }
      debuff(e, 'mcSabotaged', 'Sabotaged gear', 2, { str: -3, mag: -3, def: -2 });
      out.lines.push(`${u.name} sabotages ${e.name}'s ${WEAPONS[w]?.name ?? 'gear'} (durability −5; −3 STR/MAG, −2 DEF for 2 turns).`);
      return out;
    }
    case 'mcDistract': debuff(target!, 'mcDistracted', 'Distracted', 2, { skl: -4 }); out.lines.push(`${u.name} distracts ${target!.name} (−4 SKL, −15 Hit for 2 turns).`); return out;
    case 'mcTrip': debuff(target!, 'mcTripped', 'Tripped', 2, { mov: -2 }); if (target!.size <= 2) addStatus(target!, 'root', 1); out.lines.push(`${u.name} trips ${target!.name} (−2 MOV${target!.size <= 2 ? ', rooted' : ''}).`); return out;
    case 'mcExposeWeakPoint': debuff(target!, 'mcWeakPoint', 'Weak point exposed', 2, { def: -5 }); out.lines.push(`${u.name} exposes ${target!.name}'s weak point (−5 DEF; Micro attacks strike in full for 2 turns).`); return out;
    case 'mcInternalStrike': {
      const e = target!;
      const es = effectiveStats(e);
      const w = WEAPONS[u.weapons[0]];
      const magical = w?.type === 'magic' || w?.type === 'staff';
      const power = (magical ? s.mag : s.str) + (w?.might ?? 0) + (u.skills.includes('smallButMightyMC') ? 6 : 0) + (w?.mc?.includes('mechanical') && unitTags(e).includes('construct') ? 6 : 0);
      const mult = u.skills.includes('smallMechanisms') && unitTags(e).includes('construct') ? 1.5 : 1;
      const d = strike(e, (power - Math.floor((magical ? es.res : es.def) * 0.25)) * mult);
      if (e.hp > 0) debuff(e, 'mcWeakPoint', 'Weak point exposed', 1, { def: -5 });
      out.lines.push(`${u.name} gets inside ${e.name} and strikes its internal weak point (−${d}).`);
      if (e.hp > 0) for (const h of internalHooks) out.lines.push(...h(b, u, e));
      return out;
    }
    case 'mcPickpocket': {
      const e = target!;
      const bonus = u.skills.includes('unnoticedHands') ? 25 : 0;
      if (!rng.chance(Math.min(95, 55 + bonus + (s.spd - effectiveStats(e).spd) * 2))) { out.lines.push(`${e.name} notices ${u.name}'s hand in the pack.`); return out; }
      let got: string | undefined;
      if (e.pack.length) { const p = e.pack.splice(rng.int(0, e.pack.length - 1), 1)[0]; got = p.id; }
      else if (e.weapons.length > 1) { const i = rng.int(1, e.weapons.length - 1); got = e.weapons.splice(i, 1)[0]; }
      if (got && u.team === 'player') (b.loot ??= []).push(got);
      out.lines.push(got ? `${u.name} pickpockets ${e.name}: ${WEAPONS[got]?.name ?? got}.` : `${e.name} has nothing worth taking.`);
      return out;
    }
    case 'mcTunnelTravel': case 'mcMushroomLaunch': case 'mcPacciLaunch': case 'mcWindCrestWarp': {
      tele(at!);
      out.free = def.id === 'mcTunnelTravel';
      const how = { mcTunnelTravel: 'crawls through the Micro Tunnel', mcMushroomLaunch: 'bounces off the Giant Mushroom', mcPacciLaunch: 'is launched from the Pacci Hole', mcWindCrestWarp: 'plays the Ocarina of Wind and is carried to another Wind Crest' }[def.id];
      out.lines.push(`${u.name} ${how}.`);
      return out;
    }
    case 'mcDigWall': {
      let n = 0;
      for (const p of tilesInRange(b, u, 1, 1, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'softEarthWall') { b.tiles[k] = 'plain'; n++; } }
      out.lines.push(`${u.name} digs through ${n} soft earth wall${n > 1 ? 's' : ''} with the Mole Mitts.`);
      return out;
    }
    case 'mcBurnWeb': {
      let n = 0;
      for (const p of tilesInRange(b, u, 0, 2, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'spiderweb') { b.tiles[k] = 'plain'; n++; } }
      out.free = true;
      out.lines.push(`${u.name} burns away ${n} spiderweb${n > 1 ? 's' : ''}.`);
      return out;
    }
  }
  return null;
}

/** Enemy AI: a larger unit with an enemy Micro unit underfoot tries to crush it before acting. */
export function microEnemyStompTarget(b: Battle, u: Unit): Unit | undefined {
  if (u.team !== 'enemy' || u.micro) return undefined;
  return b.units.filter((e) => e.team !== u.team && e.micro && !e.hidden && sharesTile(u, e)).sort((x, y) => x.hp - y.hp)[0];
}
