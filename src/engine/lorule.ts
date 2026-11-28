// A Link Between Worlds battle rules: wall merging (a movement state with MP costs), Painting Prison, the pack's
// battlefield spaces (Mergeable Walls, Wall Cracks, Portrait Frames, Tornado Lifts, Ice Platforms, Maiamai Hiding
// Spots, Rupee Traps, Gemstone Barriers, Darkness Switches, Energy Orbs), the cast's skills, every boss gimmick
// (Margomill's segments, the Gemesaur mask, Knucklemaster's palm, Stalblind's head, Zaganaga's burrowing, Dharkstare's
// shell, Grinexx in the lava, Yuga's fusion with Ganon) and the monsters (Rupee Like, Bari and Biri, Gimos, Pengator,
// Devalant); the River Zora (submerging, the natural Fireball, Flood, Rising Tide); the Nice tools; the new items.
// Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts, abilities.ts, twilight.ts and battleView.ts.

import { BOSSES, ENEMIES, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import { LB_ENEMY_CASTS, LB_FEATURES, LB_SPECIAL, LB_SPOILS, MERGED_ART, YUGA_FUSION } from '../content/lorule';
import { RIVER_ZORA_IDS, RZ_SPECIAL } from '../content/riverzora';
import { anchorCost, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { mcTransform, microFits } from './micro';
import type { RNG } from './rng';
import { INF, isMagical, WATERY } from './rules';
import { addStatus } from './status';
import { activeGear, effectiveStats, makeEnemy, makeHero, prepareForBattle, unitTags } from './units';
import { pushAway } from './windwaker';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** A Link Between Worlds battle state. */
    lr?: LRState;
  }
  interface Unit {
    /** Wall-merged: a painting travelling through the walls. */
    lrMerged?: boolean;
    /** Turn this unit last stepped out of a wall. */
    lrEmergedTurn?: number;
    /** Painting Prison: turns left and the caster. */
    lrPainted?: { turns: number; by?: string };
    /** River Zora: underwater, hidden from ordinary enemies. */
    lrSubmerged?: boolean;
    /** Turn it surfaced (River Ambush). */
    lrSurfacedTurn?: number;
    /** Margomill: segments left. */
    lrSegments?: number;
    /** Gemesaur King: mask points left. */
    lrMask?: number;
    /** Dharkstare: the turn fire broke its shell. */
    lrShellBroken?: number;
    /** Rupee Like: Rupees swallowed this battle. */
    lrStolen?: number;
    /** A temporary summon: turns left. */
    lrTemp?: number;
  }
  interface MapNode {
    /** A Link Between Worlds encounter type (engine/loruleRun.ts). */
    lrEncounter?: 'paintingRescue' | 'parallelInfiltration' | 'maiamaiRescue' | 'treacherousTower' | 'rentalChallenge' | 'shadowDuel';
  }
}

export interface LRState {
  /** Timed terrain (sand pillars, floods) and what it reverts to. */
  timers: { k: number; turns: number; revert: Terrain }[];
  /** Baby Maiamai rescued this battle. */
  maiamai: number;
  /** Quest items found in battle (materials, Master Ore). */
  found: string[];
  /** Rupees shed by the Gemesaur King, found in Rupee Traps. */
  rupees: number;
  /** Rupees the Rupee Likes still hold. */
  stolen: number;
  /** The army's Nice tools (loruleRun.ts). */
  nice: string[];
  /** Weapons lent for a Rental Challenge (removed after the battle), by uid. */
  loaned?: Record<string, string>;
  encounter?: string;
  /** Every listed boss must fall (paired bosses). */
  allBosses?: boolean;
  /** Lorule Castle: Yuga fuses with Ganon instead of falling. */
  fusion?: boolean;
}

export const lrState = (b: Battle): LRState => (b.lr ??= { timers: [], maiamai: 0, found: [], rupees: 0, stolen: 0, nice: [] });
const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.bossId ?? u.templateId ?? u.artId ?? '';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
const lbTag = (u: Unit, t: string) => activeGear(u).some((g) => g.lb?.includes(t)) || !!WEAPONS[u.weapons[0]]?.lb?.includes(t);
function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}
const magicalW = (w?: WeaponDef) => !!w && (isMagical(w.type) || !!w.magicContact);
const isWater = (t?: Terrain) => !!t && (WATERY as readonly string[]).includes(t);
const onWater = (b: Battle, u: Unit, pos: Pos = u) => footprint(pos.x, pos.y, u.size).some((p) => isWater(tileAt(b, p.x, p.y)));
const nearWater = (b: Battle, u: Unit, pos: Pos = u) => onWater(b, u, pos) || tilesInRange(b, pos, 1, 1, u.size).some((p) => isWater(tileAt(b, p.x, p.y)));
export const isRiverZora = (u: Unit) => u.race === 'riverZora';
const aquatic = (u: Unit) => unitTags(u).includes('aquatic') || u.race === 'zora' || u.race === 'riverZora';
export const mergeable = (t?: Terrain) => t === 'wall' || t === 'mergeWall' || t === 'cracked';
/** Units that can wall-merge (Between Worlds, Ravio's Bracelet, Yuga's painting magic). */
export const canMerge = (u: Unit) => has(u, 'betweenWorlds') || lbTag(u, 'wallMerge') || Object.values(u.gear).includes('raviosBracelet') || u.abilities.includes('wallMerge');
const royal = (u: Unit) => unitTags(u).includes('royal') || ['zeldaALBW', 'hilda', 'oren', 'zelda', 'zeldaMC', 'kingDaltus'].includes(tid(u));
const onIce = (b: Battle, u: Unit, pos: Pos = u) => b.world === 'iceRuins' || ['icePlatform', 'frozenWater'].includes(tileAt(b, pos.x, pos.y) ?? '');
const inLorule = (b: Battle) => worldDef(b.world).campaign === 'lorule';
const free = (b: Battle, u: Unit, x: number, y: number, ignore?: Unit) => anchorCost(b, { ...u, lrMerged: false }, x, y) < INF
  && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u || o === ignore; });

function setTimed(b: Battle, k: number, t: Terrain, turns: number) {
  const st = lrState(b);
  const cur = st.timers.find((x) => x.k === k);
  if (cur) { cur.turns = Math.max(cur.turns, turns); b.tiles[k] = t; return; }
  if (b.tiles[k] === t) return;
  st.timers.push({ k, turns, revert: b.tiles[k] });
  b.tiles[k] = t;
}

/** The nearest free space to `near` for a unit (to step out of a wall, to resurface…). */
function nearestFree(b: Battle, u: Unit, near: Pos, maxD = 6, pred: (p: Pos) => boolean = () => true): Pos | undefined {
  for (let d = 1; d <= maxD; d++) {
    const spot = tilesInRange(b, near, d, d, u.size).find((p) => pred(p) && free(b, u, p.x, p.y));
    if (spot) return spot;
  }
  return undefined;
}

// ───────────────────────── Wall merging ─────────────────────────

const mergeMult = (b: Battle | undefined, u: Unit) => (u.team === 'player' && b?.bonus === 'betweenWorldsLB' ? 0.75 : 1) * (lbTag(u, 'toolThrift') ? 0.75 : 1)
  * (u.team === 'player' && b?.groupSupports?.includes('betweenKingdoms') ? 0.75 : 1);
const mergeUpkeep = (b: Battle, u: Unit) => Math.ceil(5 * mergeMult(b, u));

export function mergeInto(b: Battle, u: Unit, at: Pos) {
  void b;
  u.x = at.x; u.y = at.y;
  u.lrMerged = true;
  const art = MERGED_ART[u.templateId ?? ''];
  if (art) u.artOverride = art;
}
export function emerge(b: Battle, u: Unit, at?: Pos) {
  if (at) { u.x = at.x; u.y = at.y; }
  u.lrMerged = false;
  u.lrEmergedTurn = b.turn;
  if (u.artOverride && u.artOverride === MERGED_ART[u.templateId ?? '']) u.artOverride = undefined;
}
/** At 0 MP a merged unit is forced out at the nearest valid space. */
function forceOut(b: Battle, u: Unit): boolean {
  const spot = nearestFree(b, u, u, 8, (p) => !mergeable(tileAt(b, p.x, p.y)));
  emerge(b, u, spot);
  return !!spot;
}

/** Per-unit movement (grid.ts tileCost): walls for merged units, Gulley's forests, the Baby Maiamai clinging to walls. */
export function lrTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  if (u.lrMerged && mergeable(t)) return 1;
  if (u.lrPainted) return INF;
  if (t === 'forest' && has(u, 'forestChild')) c = Math.min(c, 1);
  if (has(u, 'hiddenChild') && (t === 'wall' || t === 'mergeWall')) c = Math.min(c, 2);
  if (isRiverZora(u) && isWater(t)) c = Math.min(c, 1);
  void b;
  return c;
}

/** After a unit walks a path (battleView.ts walk): wall spaces cost MP, ending on the ground emerges, River Zora surface. */
export function lrAfterWalk(b: Battle, u: Unit, path: Pos[]): string | null {
  const lines: string[] = [];
  if (u.lrMerged) {
    const walls = path.slice(1).filter((p) => mergeable(tileAt(b, p.x, p.y))).length;
    u.mp = Math.max(0, u.mp - Math.ceil(2 * walls * mergeMult(b, u)));
    if (!mergeable(tileAt(b, u.x, u.y))) { emerge(b, u); lines.push(`${u.name} steps out of the wall.`); }
    else if (u.mp <= 0) { forceOut(b, u); lines.push(`${u.name} runs out of magic and is forced out of the wall.`); }
  }
  if (u.lrSubmerged && path.length > 1) {
    const stayed = path.every((p) => isWater(tileAt(b, p.x, p.y)));
    if (!stayed || !u.abilities.includes('silentSwim')) surface(b, u);
  }
  const pick = lrPickups(b, u);
  if (pick) lines.push(pick);
  return lines.join(' ') || null;
}

function surface(b: Battle, u: Unit) {
  if (!u.lrSubmerged) return;
  u.lrSubmerged = false;
  u.lrSurfacedTurn = b.turn;
  if (u.team === 'enemy') u.hidden = false;
}

/** Spaces that act when a unit stands on them: Maiamai, Energy Orbs, Rupee Traps; Sheerow picks up dropped weapons. */
export function lrPickups(b: Battle, u: Unit): string | null {
  const k = keyOf(b, u.x, u.y);
  const t = b.tiles[k];
  const st = lrState(b);
  if (u.team !== 'player') return null;
  if (has(u, 'itemRetrieval') && b.dropped?.length) {
    const here = b.dropped.filter((d) => d.x === u.x && d.y === u.y);
    if (here.length) { b.dropped = b.dropped.filter((d) => !here.includes(d)); b.loot = [...(b.loot ?? []), ...here.map((d) => d.id)]; return `${u.name} picks up ${here.length} dropped weapon${here.length > 1 ? 's' : ''}.`; }
  }
  if (t === 'maiamaiSpot') { b.tiles[k] = 'plain'; st.maiamai++; return `"Maiamai!" ${u.name} finds a hidden Baby Maiamai (${st.maiamai} this battle).`; }
  if (t === 'energyOrb') { b.tiles[k] = 'plain'; u.mp = Math.min(u.stats.mp, u.mp + 10); u.sta = Math.min(u.stats.sta, u.sta + 10); return `${u.name} breaks an Energy Orb (+10 MP and STA).`; }
  if (t === 'rupeeTrap') {
    b.tiles[k] = 'plain';
    if (has(u, 'insideKnowledge') || alliesOf(b, u).some((a) => has(a, 'insideKnowledge') && unitDist(u, a) <= 2)) { st.rupees += 50; return `${u.name} spots the Rupee Trap and pockets the bait (₹50).`; }
    const dmg = Math.min(u.hp - 1, Math.ceil(u.stats.hp * 0.12));
    if (dmg > 0) u.hp -= dmg;
    addStatus(u, 'root', 1);
    return `The Rupees were a trap! ${u.name} is caught (−${dmg}, Rooted).`;
  }
  return null;
}

// ───────────────────────── Battlefield setup ─────────────────────────

/** Place the region's battlefield spaces (and a Baby Maiamai or two in this campaign's battles). */
export function decorateLorule(b: Battle, rng: RNG) {
  const feats = LB_FEATURES[b.world];
  if (!feats || b.naval) return;
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 1 && i % b.width <= b.width - 2 ? i : -1)).filter((i) => i >= 0));
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) for (let j = 0; j < n; j++) { const k = plains.pop(); if (k !== undefined) b.tiles[k] = t; }
  // Wall Cracks come in pairs: one near the army, one deep in enemy ground.
  const cracks = b.tiles.reduce((n, t) => n + (t === 'wallCrack' ? 1 : 0), 0);
  if (cracks === 1) { const k = plains.pop(); if (k !== undefined) b.tiles[k] = 'wallCrack'; }
}

/** Battle start: boss defences, Gimos cores, Devalants under the sand, the Lorule group supports that count heads. */
export function loruleBattleStart(b: Battle) {
  for (const u of b.units) {
    if (has(u, 'layeredBody')) u.lrSegments = 4;
    if (has(u, 'gemstoneArmor')) u.lrMask = 40;
    if (has(u, 'frozenShell')) { buff(u, 'wildShield', 'Frozen Shell', 2); (u.turnUses ??= {}).wildShield = 25; }
    if (has(u, 'elementalConstruct') && u.weapons.length > 1 && u.uid.length % 2 === 0) u.weapons = [...u.weapons].reverse();
    if (has(u, 'sandHunter') && u.team === 'enemy' && /desert|sand/i.test(worldDef(b.world).name)) u.hidden = true;
  }
  // Group supports the registry can't count (twilight.ts sets the plain ones first).
  const mine = b.units.filter((u) => u.team === 'player');
  const groups = new Set(b.groupSupports ?? []);
  const rz = mine.filter(isRiverZora).length;
  if (rz >= 3) groups.add('riverPack');
  if (rz && mine.some((u) => u.race === 'zora')) groups.add('unitedWaters');
  const babies = mine.filter((u) => u.templateId === 'babyMaiamai').length;
  if (mine.some((u) => u.templateId === 'motherMaiamai') && babies >= 4) groups.add('familyReunion'); else groups.delete('familyReunion');
  b.groupSupports = [...groups];
}

// ───────────────────────── Start of each turn ─────────────────────────

export interface LREvent { uid: string; heal: number; damage: number; source: string }

export function lrStartPhase(b: Battle, u: Unit, events: LREvent[]) {
  const heal = (who: Unit, pct: number, source: string) => {
    const amt = Math.min(who.stats.hp - who.hp, Math.ceil(who.stats.hp * pct));
    if (amt > 0) { who.hp += amt; events.push({ uid: who.uid, heal: amt, damage: 0, source }); }
  };
  const hurt = (who: Unit, dmg: number, source: string) => {
    dmg = Math.min(who.hp - 1, Math.floor(dmg));
    if (dmg > 0) { who.hp -= dmg; events.push({ uid: who.uid, heal: 0, damage: dmg, source }); }
  };
  const st = b.lr;
  // Timed terrain ticks once a turn (on the first unit of the player phase).
  if (st?.timers.length && u.team === 'player' && b.units.find((x) => x.team === 'player') === u) {
    for (const tm of st.timers) if (--tm.turns <= 0) b.tiles[tm.k] = tm.revert;
    st.timers = st.timers.filter((tm) => tm.turns > 0);
  }
  // Temporary summons fade.
  if (u.lrTemp !== undefined && --u.lrTemp <= 0) { b.units = b.units.filter((x) => x !== u); events.push({ uid: u.uid, heal: 0, damage: 0, source: 'fades away' }); return; }
  // A freed prisoner steps out of its frame.
  if (u.lrPainted && u.lrPainted.turns >= 90 && !u.captive) delete u.lrPainted;
  // Painting Prison: no moving, no attacking.
  if (u.lrPainted) {
    u.moved = u.acted = true;
    if (--u.lrPainted.turns <= 0) delete u.lrPainted;
    events.push({ uid: u.uid, heal: 0, damage: 0, source: u.lrPainted ? 'is trapped in a painting' : 'steps out of the painting' });
    return;
  }
  // Wall merging upkeep.
  if (u.lrMerged) {
    const cost = mergeUpkeep(b, u);
    if (u.mp >= cost) u.mp -= cost; else { forceOut(b, u); events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is forced out of the wall' }); }
  }
  // River Zora under the surface.
  if (u.lrSubmerged && !onWater(b, u)) surface(b, u);
  if (u.lrSubmerged && lbTag(u, 'submergedMp')) u.mp = Math.min(u.stats.mp, u.mp + 3);
  // Auras and the cast.
  for (const a of alliesOf(b, u)) {
    const d = unitDist(u, a);
    if (has(a, 'sanctuaryPrayer') && d <= 1) heal(u, 0.1, 'rests in the Sanctuary');
    if (has(a, 'hyrulesLight') && d <= 2) u.statuses = u.statuses.filter((x) => x.kind !== 'curse');
    if (has(a, 'riverQueen') && d <= 3 && aquatic(u) && onWater(b, u)) buff(u, 'riverQueen', 'River Queen', 1, { mov: 3 });
    if (has(a, 'lordOfTheRiver') && d <= 4 && isRiverZora(u) && onWater(b, u)) buff(u, 'lordOfTheRiver', 'Lord of the River', 1, { mov: 1 });
    if (has(a, 'iceCommander') && d <= 3 && has(u, 'slidingAssault')) buff(u, 'iceCommander', 'Ice Commander', 1, { str: 3, spd: 3 });
  }
  if (u.team === 'player' && b.bonus === 'riverQueenLB' && aquatic(u) && onWater(b, u)) buff(u, 'riverQueenLB', 'Court of the River', 1, { mov: 2 });
  if (has(u, 'fallenGuard') || lbTag(u, 'curseGuard')) u.statuses = u.statuses.filter((x) => x.kind !== 'curse');
  if (has(u, 'forestChild') && tileAt(b, u.x, u.y) === 'forest') addStatus(u, 'veiled', 1);
  if (has(u, 'slidingAssault') && onIce(b, u)) buff(u, 'slidingAssault', 'Sliding', 1, { mov: 2 });
  if (b.groupSupports?.includes('familyReunion') && u.team === 'player' && u.race === 'maiamai') heal(u, 0.1, 'is cheered by the family');
  if (has(u, 'insideKnowledge') || lbTag(u, 'hints')) {
    for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= 5) e.hidden = false;
    for (const tr of b.traps ?? []) if (tr.hidden && Math.abs(tr.x - u.x) + Math.abs(tr.y - u.y) <= 5) tr.hidden = false;
  }
  const pick = lrPickups(b, u);
  if (pick) b.log.push(pick);
  // ── Monsters ──
  if (has(u, 'tinyConductor') && b.turn % 2 === 1) for (const e of foesOf(b, u)) if (unitDist(u, e) <= 1 && footprint(e.x, e.y, e.size).some((p) => p.x === u.x && p.y === u.y)) {
    hurt(e, 2 + effectiveStats(u).mag / 3, 'is shocked by a Biri');
    addStatus(e, 'shock', 1);
  }
  if (has(u, 'sandHunter') && u.team === 'enemy' && /desert|sand/i.test(worldDef(b.world).name) && !foesOf(b, u).some((e) => unitDist(u, e) <= 1)) u.hidden = true;
  // ── Bosses ──
  if (has(u, 'cycloneSwarm')) {
    const s = effectiveStats(u);
    for (const e of foesOf(b, u).filter((x) => !x.hidden && unitDist(u, x) <= 3).sort((x, y) => x.hp - y.hp).slice(0, 2)) {
      hurt(e, Math.max(1, s.mag / 3 - effectiveStats(e).res / 4), 'is caught in a little tornado');
      if (!e.isBoss) pushAway(b, e, u, 1);
    }
  }
  if (has(u, 'rootedAmbush') && u.team === 'enemy' && b.turn % 2 === 0) relocateNextToFoe(b, u, events, 'erupts from the sand');
  if (has(u, 'lavaDweller')) {
    if (tilesInRange(b, u, 0, 1, u.size).some((p) => tileAt(b, p.x, p.y) === 'lava') || footprint(u.x, u.y, u.size).some((p) => tileAt(b, p.x, p.y) === 'lava')) heal(u, 0.1, 'soaks in the lava');
    if (u.team === 'enemy' && b.turn % 3 === 0 && relocateNextToFoe(b, u, events, 'erupts beneath the army')) {
      const s = effectiveStats(u);
      for (const e of foesOf(b, u).filter((x) => unitDist(u, x) <= 1)) hurt(e, Math.max(2, s.mag / 2 + 4 - effectiveStats(e).res / 2), 'is engulfed by the eruption');
    }
  }
  if (has(u, 'frozenShell') && u.lrShellBroken !== b.turn - 1 && u.lrShellBroken !== b.turn) {
    const pts = Math.min(25, (hasBuff(u, 'wildShield') ? u.turnUses?.wildShield ?? 0 : 0) + 12);
    buff(u, 'wildShield', 'Frozen Shell', 2); (u.turnUses ??= {}).wildShield = pts;
  }
  // Enemy painters paint on their own (the AI casts no targeted abilities).
  if (u.team === 'enemy' && u.abilities.includes('paintingPrison') && !u.cooldowns?.paintingPrison && u.mp >= 15) {
    const t = foesOf(b, u).filter((e) => !e.hidden && !e.lrPainted && !e.isCommander && unitDist(u, e) <= 3).sort((x, y) => y.stats.hp - x.stats.hp)[0];
    if (t) { paint(b, u, t); u.mp -= 15; (u.cooldowns ??= {}).paintingPrison = 3; events.push({ uid: t.uid, heal: 0, damage: 0, source: `is turned into a painting by ${u.name}` }); }
  }
}

/** Burrow, sink or merge and come out next to the nearest foe. */
function relocateNextToFoe(b: Battle, u: Unit, events: LREvent[], what: string): boolean {
  const foe = foesOf(b, u).filter((e) => !e.hidden).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
  if (!foe || unitDist(u, foe) <= 1) return false;
  const spot = nearestFree(b, u, foe, 2);
  if (!spot) return false;
  u.x = spot.x; u.y = spot.y;
  events.push({ uid: u.uid, heal: 0, damage: 0, source: what });
  return true;
}

// ───────────────────────── Painting Prison ─────────────────────────

export function paint(b: Battle, by: Unit, t: Unit, turns = 3) {
  let n = t.isBoss ? 1 : turns;
  if (by.team === 'player' && b.bonus === 'livingPortraitLB') n++;
  if (lbTag(by, 'longPaint')) n++;
  t.lrPainted = { turns: n, by: by.uid };
  if (t.lrMerged) emerge(b, t);
}
export const isPainted = (u: Unit) => !!u.lrPainted;

// ───────────────────────── Combat ─────────────────────────

export interface LRMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

export function lrMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): LRMods {
  const m: LRMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const allies = b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
  const within = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  const groups = u.team === 'player' ? b.groupSupports ?? [] : [];
  const t = tileAt(b, pos.x, pos.y);
  // River Zora
  if (isRiverZora(u) && onWater(b, u, pos)) m.avoid += 15;
  if (has(u, 'shorelineFighter') && nearWater(b, u, pos)) { m.str += 3; m.def += 3; }
  if (has(u, 'riverSentinel') && onWater(b, u, pos)) m.def += 5;
  if (u.lrSubmerged && initiating) {
    if (has(u, 'beneathTheSurface')) { m.hit += 25; m.crit += 20; }
    if (w?.lb?.includes('concealCrit')) m.crit += 15;
    if (lbTag(u, 'concealCrit10')) m.crit += 10;
  }
  if (isRiverZora(u) && allies.some((a) => has(a, 'lordOfTheRiver') && within(a, 4))) { m.str += 3; m.mag += 3; m.def += 3; }
  if (aquatic(u) && allies.some((a) => has(a, 'riverQueen') && within(a, 3))) { m.str += 3; m.mag += 3; }
  if (isRiverZora(u) && groups.includes('riverRoyalty')) { m.def += 3; m.res += 3; }
  if (isRiverZora(u) && groups.includes('riverPack') && allies.some((a) => isRiverZora(a) && within(a, 2))) { m.str += 2; m.mag += 2; }
  if (groups.includes('riverHuntingParty') && ['riverZoraWarrior', 'riverZoraHunter', 'riverZoraGuardian'].includes(u.templateId ?? '') && nearWater(b, u, pos)) { m.hit += 15; m.avoid += 15; }
  if (groups.includes('unitedWaters') && (isRiverZora(u) || u.race === 'zora') && onWater(b, u, pos)) { m.skl += 2; m.spd += 2; }
  // Generics
  if (has(u, 'desperateDefense') && u.hp < u.stats.hp / 2) m.def += 3;
  if (has(u, 'piercingFormation') && allies.some((a) => WEAPONS[a.weapons[0]]?.type === 'lance' && (within(a, 1) || unitDist(a, foe) <= 1))) m.dmg += 3;
  // The cast
  const fallen = b.fallen.filter((x) => x.team === u.team && !x.lrTemp).length;
  if (fallen && [u, ...allies].some((a) => has(a, 'fallenKingdom'))) { const n = Math.min(5, fallen); m.str += n; m.mag += n; m.def += n; }
  if (has(u, 'veteranHero') && foe.weapons.some((x) => WEAPONS[x]?.type === 'sword')) { m.hit += 20; m.crit += 10; if (!initiating) m.dmg += Math.ceil(effectiveStats(u).str * 0.3); }
  if (w?.lb?.includes('counter') && !initiating) m.dmg += Math.ceil(effectiveStats(u).str * 0.3);
  if ([u, ...allies].some((a) => has(a, 'masterTempering') && (a === u || within(a, 1)))) m.dmg += 2;
  if (has(u, 'forestChild') && t === 'forest') m.avoid += 20;
  if (has(u, 'sagesConfidence')) { const n = Math.min(5, u.kills); m.mag += n; m.skl += n; }
  if (allies.some((a) => has(a, 'sanctuaryPrayer') && within(a, 1))) m.res += 3;
  if (has(u, 'hiddenChild') && tilesInRange(b, pos, 1, 1, u.size).some((p) => ['wall', 'mergeWall', 'forest'].includes(tileAt(b, p.x, p.y) ?? ''))) m.avoid += 20;
  if (u.templateId === 'babyMaiamai' && allies.some((a) => has(a, 'mothersGiftSkill') && within(a, 3))) { m.def += 4; m.res += 4; }
  if (lbTag(u, 'hints') && foe.isBoss) m.crit += 10;
  if (u.team === 'player' && b.bonus === 'loruleGuard' && u.race === 'lorulean') { m.def += 3; m.res += 3; }
  if (u.team === 'player' && b.bonus === 'demonKingsMonsters' && (TEMPLATES[u.templateId ?? '']?.monster || ['monster', 'construct', 'undead'].includes(u.race))) { m.str += 3; m.mag += 3; }
  if (groups.includes('sagesUnited') && ['gulley', 'osfala', 'seres', 'oren', 'rosso', 'irene', 'impaALBW'].includes(u.templateId ?? '')) { m.mag += 4; m.res += 4; }
  if (groups.includes('veteranMasters') && ['gramps', 'herosShade', 'swiftbladeFirst'].includes(u.templateId ?? '')) { m.skl += 3; m.crit += 5; }
  if (groups.includes('hopeForLorule') && ['hilda', 'ravio', 'thiefGirl'].includes(u.templateId ?? '')) { m.def += 2; m.res += 2; }
  if (groups.includes('courageRestored') && ['linkALBW', 'zeldaALBW', 'ravio'].includes(u.templateId ?? '')) { m.hit += 10; m.avoid += 5; }
  // Monsters and bosses
  if (has(u, 'slidingAssault') && onIce(b, u, pos)) m.dmg += 4;
  if (has(u, 'iceCommander') && (u.movedDist ?? 0) >= 3 && initiating) m.dmg += 4;
  if (has(u, 'layeredBody')) { const lost = 4 - (u.lrSegments ?? 4); m.def -= 3 * lost; m.spd += 2 * lost; }
  return m;
}

/** Attacks that can't happen: painted units, merged units' ordinary weapons, melee against merged and submerged units. */
export function lrCannotAttack(b: Battle, atk: Unit, def: Unit, w: WeaponDef | undefined, d: number): boolean {
  if (!w) return false;
  const magical = magicalW(w);
  const painting = !!w.lb?.includes('painting');
  if (atk.lrPainted) return true;
  if (def.lrPainted && !magical) return true;
  if (atk.lrMerged && !painting) return true;
  if (def.lrMerged && d <= 1 && !(magical || painting || w.type === 'hammer')) return true;
  if (def.lrSubmerged && d > 1 && w.element !== 'lightning' && !painting) return true;
  if (hasBuff(def, 'lrMergedBoss') && d <= 1 && !magical) return true;
  void b;
  return false;
}

/** Damage multipliers: boss defences and weaknesses, the cast's bonuses, the Nice tools. */
export function lrMultiplier(b: Battle, atk: Unit, atkPos: Pos, def: Unit, magical: boolean, w: WeaponDef | undefined, d: number, element?: Element): number {
  let m = 1;
  const sacred = element === 'light' || !!w?.sacredMult;
  const groups = atk.team === 'player' ? b.groupSupports ?? [] : [];
  if (def.lrSubmerged && element === 'lightning') m *= 1.5;
  if (b.units.some((a) => a.team === atk.team && has(a, 'hyrulesLight') && unitDist(a, atk, atkPos) <= 2) && (unitTags(def).includes('demon') || unitTags(def).includes('undead'))) m *= 1.2;
  if (atk.team === 'player' && b.bonus === 'sacredLightLB' && sacred) m *= 1.25;
  if (has(def, 'layeredBody') && (def.lrSegments ?? 0) > 0) m *= 0.7;
  if (has(def, 'gemstoneArmor')) m *= (def.lrMask ?? 0) > 0 ? 0.3 : 1.3;
  if (has(def, 'crushingPalm') && canMerge(atk)) m *= 1.5;
  if (has(def, 'headlessWarrior') && !magical && d > 1) m *= 0.7;
  if (has(def, 'frozenShell') && element === 'fire') m *= 1.5;
  if (has(atk, 'fusionOfPower') && (element === 'dark' || element === 'lightning')) m *= 1.2;
  if (has(atk, 'sandHunter') && atk.hidden) m *= 1.3;
  if (has(atk, 'riverAmbush') && (atk.lrSubmerged || atk.lrSurfacedTurn === b.turn)) m *= 1.3;
  if (hasBuff(def, 'guardianStance') && !magical) m *= 0.6;
  if ((has(atk, 'mountainStrengthLB') || lbTag(atk, 'obstacles')) && ['armored', 'construct', 'stone'].some((t) => unitTags(def).includes(t))) m *= 1.3;
  if (has(def, 'fallenGuard') && element === 'dark') m *= 0.7;
  if (w?.lb?.includes('royalTrident') && (element === 'fire' || element === 'water' || w.element === 'water')) m *= 1.2;
  if (lbTag(atk, 'iceBoost') && element === 'ice') m *= 1.2;
  if (atk.team === 'player' && w && b.lr?.nice.includes(w.id)) m *= 1.25;
  if (groups.includes('forbiddenSorcery') && ['yuga', 'agahnim', 'vaatiHylian'].includes(atk.templateId ?? '') && magical) m *= 1.15;
  if (groups.includes('courageRestored') && ['linkALBW', 'zeldaALBW', 'ravio'].includes(atk.templateId ?? '') && sacred) m *= 1.15;
  return m;
}

/** After a hit: painted units freed by light, segments and masks break, the palm pins, Rupees go missing. */
export function lrAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element?: Element): string[] {
  const lines: string[] = [];
  const st = lrState(b);
  if (target.lrPainted && (element === 'light' || !!w?.sacredMult)) { delete target.lrPainted; lines.push(`Sacred light frees ${target.name} from the painting!`); }
  if (target.hp > 0) {
    if (has(target, 'layeredBody') && (target.lrSegments ?? 0) > 0 && (dmg >= 10 || w?.lb?.includes('wind'))) {
      target.lrSegments = Math.max(0, (target.lrSegments ?? 0) - (w?.lb?.includes('wind') ? 2 : 1));
      lines.push(`A segment of ${target.name} shatters (${target.lrSegments} left): it spins faster!`);
    }
    if (has(target, 'gemstoneArmor') && (target.lrMask ?? 0) > 0 && dmg > 0) {
      target.lrMask = Math.max(0, (target.lrMask ?? 0) - dmg * (w?.type === 'hammer' ? 6 : 3));
      if (by.team === 'player') st.rupees += 10;
      lines.push(target.lrMask ? `Gems fly from ${target.name}'s mask (${target.lrMask} left).` : `${target.name}'s gem mask shatters — its weak point is exposed!`);
    }
    if (has(target, 'frozenShell') && element === 'fire') { target.buffs = target.buffs.filter((x) => x.id !== 'wildShield'); target.lrShellBroken = b.turn; lines.push(`Fire shatters ${target.name}'s frozen shell!`); }
    if (has(by, 'crushingPalm') && dmg > 0 && target.size <= 2) { addStatus(target, 'root', 1); lines.push(`${by.name} pins ${target.name} under its palm!`); }
    if (w?.lb?.includes('painting') && by.weapons[0] === 'yugasPaintbrush' && !target.isBoss && (b.turn + target.uid.length) % 7 === 0) { paint(b, by, target, 1); lines.push(`${target.name} is splashed into a painting!`); }
    if (w?.id === 'tornadoRod' && by.team === 'player' && st.nice.includes('tornadoRod')) addStatus(target, 'stun', 2);
    if (w?.lb?.includes('knockback') && !target.isBoss) pushAway(b, target, by, 1);
  }
  if (has(by, 'greedySwallow') && target.team === 'player' && dmg > 0) {
    const n = 15 + ((b.turn * 7 + target.uid.length) % 16);
    by.lrStolen = (by.lrStolen ?? 0) + n; st.stolen += n;
    lines.push(`${by.name} swallows ₹${n}!`);
  }
  b.log.push(...lines);
  return lines;
}

/** After an exchange: electrified jellies, reflected energy, the Nice tools' splash, River Zora surfacing and retreating. */
export function lrAfterCombat(b: Battle, attacker: Unit, defender: Unit, landed: { atk: number; def: number }): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const zap = (to: Unit, from: Unit, dmg: number) => {
    if (to.hp <= 0 || !b.units.includes(to)) return;
    dmg = Math.min(to.hp, Math.max(1, Math.floor(dmg)));
    to.hp -= dmg;
    const killed = to.hp <= 0;
    if (killed) { b.units = b.units.filter((x) => x !== to); if (!to.summoned) b.fallen.push(to); }
    out.push({ uid: to.uid, dmg, hp: to.hp, killed, by: from.uid });
  };
  const w = WEAPONS[attacker.weapons[0]];
  const melee = unitDist(attacker, defender) <= 1 && landed.atk > 0;
  if (melee && defender.hp > 0 && (has(defender, 'electricalMembrane') || has(defender, 'electricalDivision')) && b.turn % 2 === 0) {
    zap(attacker, defender, 3 + effectiveStats(defender).mag / 4);
    b.log.push(`${defender.name}'s membrane is electrified!`);
  }
  if (landed.atk > 0 && hasBuff(defender, 'lrReflect') && magicalW(w)) zap(attacker, defender, landed.atk / 2);
  // Nice tools: the spread, the shockwave, the larger flame.
  if (attacker.team === 'player' && landed.atk > 0 && w && b.lr?.nice.includes(w.id) && ['fairyBow', 'magicHammer', 'fireRod'].includes(w.id)) {
    for (const e of b.units.filter((x) => x.team === defender.team && x !== defender && unitDist(x, defender) <= 1)) zap(e, attacker, landed.atk / 2 + (w.id === 'magicHammer' ? 4 : 0));
  }
  if (attacker.lrSubmerged) surface(b, attacker);
  if (attacker.abilities.includes('aquaticRetreat') && attacker.hp > 0 && onWater(b, attacker) && attacker.sta >= 4) {
    const spot = waterRetreat(b, attacker, defender);
    if (spot) { attacker.x = spot.x; attacker.y = spot.y; attacker.sta -= 4; b.log.push(`${attacker.name} slips back through the water.`); }
  }
  return out;
}

/** Up to 3 spaces through connected water, as far from the foe as possible. */
function waterRetreat(b: Battle, u: Unit, from: Unit): Pos | undefined {
  const seen = new Set([keyOf(b, u.x, u.y)]);
  let frontier: Pos[] = [{ x: u.x, y: u.y }];
  const reach: Pos[] = [];
  for (let step = 0; step < 3; step++) {
    const next: Pos[] = [];
    for (const p of frontier) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const q = { x: p.x + dx, y: p.y + dy };
      const k = keyOf(b, q.x, q.y);
      if (!inBounds(b, q.x, q.y) || seen.has(k) || !isWater(b.tiles[k])) continue;
      seen.add(k);
      if (unitAt(b, q.x, q.y)) continue;
      next.push(q); reach.push(q);
    }
    frontier = next;
  }
  if (u.size > 1) return undefined;
  return reach.sort((p, q) => unitDist({ ...u, ...q }, from) - unitDist({ ...u, ...p }, from))[0];
}

export function lrOnKill(b: Battle, by: Unit, victim: Unit, rng: RNG) {
  const st = lrState(b);
  // The caster's defeat frees its paintings.
  for (const u of b.units) if (u.lrPainted?.by === victim.uid && u.lrPainted.turns < 90) delete u.lrPainted;
  if (victim.lrStolen) { st.stolen = Math.max(0, st.stolen - victim.lrStolen); b.log.push(`${victim.name} coughs up ₹${victim.lrStolen}.`); }
  // Bari split into Biri, the Gigabari into Bari.
  const split = has(victim, 'electricalDivision') ? ['bari', 'bari', 'bari'] : has(victim, 'electricalMembrane') ? ['biri', 'biri'] : [];
  for (const id of split) spawnNear(b, id, victim, Math.max(1, victim.level - 1), rng, victim.team, 4);
  if (victim.team !== 'enemy' || by.team !== 'player') return;
  const id = tid(victim);
  const n = (b.turn + victim.uid.length * 7) % 4;
  if (LB_SPOILS[id] && n === 0) st.found.push(LB_SPOILS[id]);
  if (inLorule(b) && victim.isBoss && victim.size >= 2) st.found.push('masterOre');
}

/** A unit appears near another (splitting jellies, a detached head, reinforcements). */
export function spawnNear(b: Battle, id: string, near: Unit, level: number, rng: RNG, team: Unit['team'], temp?: number): Unit | undefined {
  const arch = ENEMIES[id] ?? BOSSES[id];
  const e = arch ? makeEnemy(arch, b.world, level, `lb${b.uidCounter++}`, rng) : TEMPLATES[id] ? prepareForBattle(makeHero(id, `lb${b.uidCounter++}`, level, rng)) : undefined;
  if (!e) return undefined;
  if (BOSSES[id]) e.isBoss = false;
  for (let d = 1; d <= 4; d++) {
    const spot = tilesInRange(b, near, d, d, near.size).find((p) => anchorCost(b, e, p.x, p.y) < INF && (e.micro ? microFits(b, e, p.x, p.y) : footprint(p.x, p.y, e.size).every((f) => !unitAt(b, f.x, f.y))));
    if (spot) {
      Object.assign(e, { x: spot.x, y: spot.y, team, ai: 'aggressive', moved: true, acted: true });
      if (temp) { e.lrTemp = temp; e.summoned = true; }
      if (team === 'player') e.npc = true;
      b.units.push(e);
      return e;
    }
  }
  return undefined;
}

/** Yuga fuses with Ganon instead of falling (Lorule Castle). */
export function lrSaveFromDeath(b: Battle, u: Unit): { line: string; heal: number } | null {
  const into = YUGA_FUSION[u.bossId ?? ''];
  if (!into || !b.lr?.fusion || u.team !== 'enemy' || !TEMPLATES[into]) return null;
  const size = TEMPLATES[into].size;
  for (let d = 0; d <= 3; d++) {
    const spot = (d === 0 ? [{ x: u.x, y: u.y }] : tilesInRange(b, u, d, d, u.size)).find((p) => anchorCost(b, { ...u, size }, p.x, p.y) < INF
      && footprint(p.x, p.y, size).every((q) => { const o = unitAt(b, q.x, q.y); return !o || o === u; }));
    if (spot) { u.x = spot.x; u.y = spot.y; break; }
  }
  const was = u.name;
  mcTransform(b, u, into);
  u.bossId = into; u.artId = into; u.isBoss = true;
  u.stats.hp = Math.round(u.stats.hp * ((b.bossTier ?? 0) <= 1 ? 0.65 : 0.85)) + Math.max(0, u.level - 1);
  u.mp = u.stats.mp;
  b.lr.fusion = false;
  return { line: `${was} is beaten — and merges with the Demon King's painting: Yuga Ganon!`, heal: u.stats.hp };
}

/** Impa guards royalty; River Sentinels guard their kin. */
export function lrInterceptor(b: Battle, p: Unit, target: Unit): boolean {
  void b;
  if (p.lrPainted || p.lrMerged) return false;
  return (has(p, 'royalProtection') && royal(target) && unitDist(p, target) <= 1) || (has(p, 'riverSentinel') && isRiverZora(target) && unitDist(p, target) <= 1);
}

export function lrBossesRemain(b: Battle): boolean {
  return !!b.lr?.allBosses && b.units.some((u) => u.team === 'enemy' && u.isBoss);
}

/** Before the battle ends: summons fade, walls give their units back, paintings let go, loans are returned. */
export function loruleBeforeFinish(b: Battle) {
  b.units = b.units.filter((u) => u.lrTemp === undefined);
  b.fallen = b.fallen.filter((u) => u.lrTemp === undefined);
  for (const u of [...b.units, ...b.fallen]) {
    if (u.lrMerged) emerge(b, u);
    delete u.lrPainted; delete u.lrSubmerged; delete u.lrSegments; delete u.lrMask;
    const loan = b.lr?.loaned?.[u.uid];
    if (loan) { const i = u.weapons.indexOf(loan); if (i >= 0) u.weapons.splice(i, 1); if (!u.weapons.length) u.weapons.push('dekuStick'); }
  }
}

// ───────────────────────── Abilities ─────────────────────────

const SPECIAL = new Set([...LB_SPECIAL, ...RZ_SPECIAL]);
const PASSIVE = new Set(['aquaticRetreat', 'silentSwim']);
const TILE = new Set(['wallMerge', 'wallEmerge', 'crackTravel', 'tornadoLiftAct', 'sandPillarLB', 'flood']);
const TARGET = new Set(['paintingPrison', 'paintingDispel']);
export const isLoruleAbility = (def: AbilityDef) => SPECIAL.has(def.id);
export const lrNeedsTile = (def: AbilityDef) => TILE.has(def.id);
export const lrNeedsTarget = (def: AbilityDef) => TARGET.has(def.id);
export const LR_ENEMY_CASTS = LB_ENEMY_CASTS;

export function lrTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const out: Pos[] = [];
  const empty = (p: Pos) => !unitAt(b, p.x, p.y);
  switch (def.id) {
    case 'wallMerge': for (const p of tilesInRange(b, u, 1, 1, u.size)) if (mergeable(tileAt(b, p.x, p.y)) && empty(p)) out.push(p); break;
    case 'wallEmerge': for (const p of tilesInRange(b, u, 1, 1, u.size)) if (!mergeable(tileAt(b, p.x, p.y)) && free(b, u, p.x, p.y)) out.push(p); break;
    case 'crackTravel':
      if (tileAt(b, u.x, u.y) !== 'wallCrack') break;
      for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) if ((x !== u.x || y !== u.y) && b.tiles[keyOf(b, x, y)] === 'wallCrack' && free(b, u, x, y)) out.push({ x, y });
      break;
    case 'tornadoLiftAct':
      if (tileAt(b, u.x, u.y) !== 'tornadoLift' && u.weapons[0] !== 'tornadoRod') break;
      for (const p of tilesInRange(b, u, 2, 4, u.size)) if (['mountain', 'fort', 'tornadoLift'].includes(tileAt(b, p.x, p.y) ?? '') && free(b, u, p.x, p.y)) out.push(p);
      break;
    case 'sandPillarLB': case 'flood':
      for (const p of tilesInRange(b, u, 1, 3, u.size)) if (tileAt(b, p.x, p.y) === 'plain' && empty(p)) out.push(p);
      break;
  }
  return out;
}

export function lrTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  if (def.id === 'paintingPrison') return foesOf(b, u).filter((e) => !e.hidden && !e.lrPainted && unitDist(u, e) <= 3);
  if (def.id === 'paintingDispel') return b.units.filter((a) => a.team === u.team && a !== u && unitDist(u, a) <= 2 && (!!a.lrPainted || a.statuses.some((s) => s.kind === 'curse')));
  return [];
}

export function lrCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  let m = 1;
  if (def.id === 'wallMerge') m *= mergeMult(b, u);
  if (def.id === 'paintingPrison' && lbTag(u, 'paintThrift')) m *= 0.75;
  if (b && has(u, 'riverMagic') && onWater(b, u)) m *= 0.75;
  if (b && u.team === 'player' && b.groupSupports?.includes('sagesUnited') && ['gulley', 'osfala', 'seres', 'oren', 'rosso', 'irene', 'impaALBW'].includes(u.templateId ?? '')
    && (def.wild?.target === 'allies' || def.wild?.target === 'ally' || ['paintingDispel', 'healingCurrent'].includes(def.id))) m *= 0.75;
  return m;
}

/** Why a pack ability can't be used now (null: it can; undefined: not ours). */
export function lrUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (u.lrPainted) return 'Trapped in a painting';
  if (PASSIVE.has(def.id)) return 'Passive';
  const enemyCast = (LB_ENEMY_CASTS as readonly string[]).includes(def.id);
  if (enemyCast && def.wild?.target === 'foes' && !foesOf(b, u).some((e) => !e.hidden && unitDist(u, e) <= (def.wild!.radius ?? 1))) return 'No foe in reach';
  if (enemyCast && def.wild?.target === 'self' && def.wild.heal && u.hp > u.stats.hp * 0.6) return 'Not hurt enough';
  if (!isLoruleAbility(def)) return undefined;
  const near = (r: number, pred: (e: Unit) => boolean = () => true) => foesOf(b, u).some((e) => !e.hidden && unitDist(u, e) <= r && pred(e));
  if (lrNeedsTile(def) && !lrTiles(b, u, def).length) return def.id === 'wallMerge' ? (u.lrMerged ? 'Already merged' : 'No wall next to you') : def.id === 'wallEmerge' ? (u.lrMerged ? 'No room to step out' : 'Not merged') : 'Not from here';
  if (def.id === 'wallMerge' && u.lrMerged) return 'Already merged';
  if (def.id === 'wallEmerge' && !u.lrMerged) return 'Not merged';
  if (lrNeedsTarget(def) && !lrTargets(b, u, def).length) return def.id === 'paintingDispel' ? 'No painted or cursed ally nearby' : 'No foe within 3';
  switch (def.id) {
    case 'darkWorldMerge': return near(1) ? 'Already next to a foe' : !darkMergeSpot(b, u) ? 'No wall near the enemy' : null;
    case 'segmentRegeneration': return (u.lrSegments ?? 4) >= 4 && u.hp > u.stats.hp * 0.7 ? 'Not damaged' : null;
    case 'gemstoneRegrowth': return (u.lrMask ?? 40) >= 30 ? 'The mask is intact' : null;
    case 'iceShellRegeneration': return hasBuff(u, 'wildShield') && (u.turnUses?.wildShield ?? 0) >= 15 ? 'The shell is intact' : null;
    case 'wallCrush': return !near(2, (e) => !!e.lrMerged) && !near(1) ? 'Nothing to crush' : null;
    case 'detachHead': return !near(5) ? 'No foe nearby' : null;
    case 'sandBurrow': return near(1) || !foesOf(b, u).length ? 'Already in reach' : null;
    case 'sandstormLB': return !near(4) ? 'No foe within 4' : null;
    case 'lavaSubmerge': return u.hp > u.stats.hp * 0.6 ? 'Not hurt enough' : null;
    case 'rzSubmerge': return u.lrSubmerged ? 'Already submerged' : !onWater(b, u) ? 'Must be in water' : null;
    case 'boilingCurrent': return !near(4, (e) => onWater(b, e)) ? 'No foe in the water within 4' : null;
    case 'healingCurrent': return ![u, ...alliesOf(b, u)].some((a) => aquatic(a) && unitDist(u, a) <= 3 && a.hp < a.stats.hp) ? 'No aquatic ally needs healing' : null;
  }
  return null;
}

function darkMergeSpot(b: Battle, u: Unit): Pos | undefined {
  const foe = foesOf(b, u).filter((e) => !e.hidden).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
  if (!foe) return undefined;
  for (let d = 1; d <= 3; d++) {
    const spot = tilesInRange(b, foe, d, d, u.size).find((p) => unitDist({ ...u, ...p }, u) <= 6 + u.size && free(b, u, p.x, p.y)
      && tilesInRange(b, p, 1, 1, u.size).some((q) => mergeable(tileAt(b, q.x, q.y))));
    if (spot) return spot;
  }
  return undefined;
}

export interface LROutcome {
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

export function castLorule(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): LROutcome | null {
  if (!isLoruleAbility(def)) return null;
  const out: LROutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const from = { x: u.x, y: u.y };
  const s = effectiveStats(u);
  const hit = (e: Unit, dmg: number) => {
    dmg = Math.max(1, Math.floor(dmg));
    const d = Math.min(e.hp, dmg);
    e.hp -= d;
    const killed = e.hp <= 0;
    if (killed) { b.units = b.units.filter((x) => x !== e); if (!e.summoned) b.fallen.push(e); }
    out.hits.push({ uid: e.uid, dmg: d, hp: e.hp, killed, statuses: [] });
  };
  const healU = (a: Unit, amt: number) => { amt = Math.min(a.stats.hp - a.hp, Math.ceil(amt)); if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); } };
  const flood = (tiles: Pos[], turns: number) => {
    let n = 0;
    for (const p of tiles) {
      const k = keyOf(b, p.x, p.y);
      if (!['plain', 'forest', 'sandPillar'].includes(b.tiles[k])) continue;
      const o = unitAt(b, p.x, p.y);
      if (o && anchorCost(b, { ...o }, o.x, o.y) < INF && !isRiverZora(o) && !aquatic(o) && o.team !== u.team) continue;
      setTimed(b, k, 'water', turns); n++;
    }
    return n;
  };
  const floodTurns = 4 + (u.team === 'player' && b.groupSupports?.includes('mastersOfTheCurrent') ? 2 : 0);
  switch (def.id) {
    case 'wallMerge': mergeInto(b, u, at!); out.warped = { from, to: { ...at! } }; out.lines.push(`${u.name} merges into the wall as a painting.`); return out;
    case 'wallEmerge': emerge(b, u, at); out.warped = { from, to: { ...at! } }; out.lines.push(`${u.name} steps out of the wall.`); return out;
    case 'crackTravel': u.x = at!.x; u.y = at!.y; out.warped = { from, to: { ...at! } }; out.lines.push(`${u.name} slips through the crack into the other kingdom — and back out somewhere else.`); return out;
    case 'tornadoLiftAct': u.x = at!.x; u.y = at!.y; out.warped = { from, to: { ...at! } }; out.lines.push(`The wind throws ${u.name} onto high ground.`); return out;
    case 'sandPillarLB': {
      const big = u.weapons[0] === 'osfalasSandRod' || (u.team === 'player' && !!b.lr?.nice.includes('sandRod'));
      for (const p of [at!, ...(big ? tilesInRange(b, at!, 1, 1, 1) : [])]) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain' && !unitAt(b, p.x, p.y)) setTimed(b, k, 'sandPillar', big ? 5 : 3); }
      out.lines.push(big ? 'Sand pillars rise in a cross.' : 'A pillar of sand rises.');
      return out;
    }
    case 'paintingPrison': paint(b, u, target!); out.statuses.push({ uid: target!.uid, kind: 'stun' }); out.lines.push(`${target!.name} is turned into a painting!`); return out;
    case 'paintingDispel':
      delete target!.lrPainted;
      if (target!.captive) { target!.captive = false; target!.rescued = true; }
      target!.statuses = target!.statuses.filter((x) => x.kind !== 'curse');
      out.cleansed.push(target!.uid); out.lines.push(`${u.name} dispels the painting: ${target!.name} is free.`);
      return out;
    case 'darkWorldMerge': {
      const spot = darkMergeSpot(b, u)!;
      u.x = spot.x; u.y = spot.y;
      buff(u, 'lrMergedBoss', 'Merged (Dark World)', 1); out.buffed.push(u.uid);
      out.warped = { from, to: spot }; out.lines.push(`${u.name} sinks into the walls and resurfaces beside the army!`);
      return out;
    }
    case 'segmentRegeneration': u.lrSegments = Math.min(4, (u.lrSegments ?? 0) + 1); healU(u, u.stats.hp * 0.15); out.lines.push(`${u.name} regrows a segment (${u.lrSegments}).`); return out;
    case 'gemstoneRegrowth': u.lrMask = Math.min(40, (u.lrMask ?? 0) + 25); healU(u, u.stats.hp * 0.1); out.lines.push(`${u.name}'s gem mask grows back.`); return out;
    case 'iceShellRegeneration': buff(u, 'wildShield', 'Frozen Shell', 2); (u.turnUses ??= {}).wildShield = 25; out.buffed.push(u.uid); out.lines.push(`${u.name}'s frozen shell regrows.`); return out;
    case 'wallCrush':
      for (const e of foesOf(b, u).filter((x) => unitDist(u, x) <= (x.lrMerged ? 2 : 1))) { if (e.lrMerged) forceOut(b, e); hit(e, s.str + 4 - effectiveStats(e).def); }
      out.lines.push(`${u.name} smashes the walls!`);
      return out;
    case 'detachHead': {
      const head = spawnNear(b, 'heedle', u, u.level, rng, u.team, 3);
      if (head) { Object.assign(head, { name: `${u.name}'s Head`, artId: 'stalblind', glyph: 'SH', skills: [], weapons: ['stalblindBreath'], abilities: [] }); head.stats.hp = head.hp = Math.ceil(u.stats.hp * 0.3); }
      out.lines.push(head ? `${u.name}'s head floats free and attacks on its own!` : 'There is no room for the head.');
      return out;
    }
    case 'sandBurrow': case 'lavaSubmerge': {
      const ev: LREvent[] = [];
      if (def.id === 'lavaSubmerge') { healU(u, u.stats.hp * 0.15); addStatus(u, 'veiled', 1); }
      const moved = relocateNextToFoe(b, u, ev, def.id === 'sandBurrow' ? 'erupts from the sand' : 'surfaces');
      if (moved) out.warped = { from, to: { x: u.x, y: u.y } };
      out.lines.push(def.id === 'sandBurrow' ? `${u.name} burrows${moved ? ' and erupts beside the army' : ''}!` : `${u.name} sinks beneath the surface.`);
      return out;
    }
    case 'sandstormLB':
      b.weather = { kind: 'sandstorm', turns: 3 };
      for (const e of foesOf(b, u).filter((x) => unitDist(u, x) <= 4)) hit(e, s.mag / 2 - effectiveStats(e).res / 3);
      out.lines.push('A sandstorm whips across the field!');
      return out;
    // ── River Zora ──
    case 'rzSubmerge':
      u.lrSubmerged = true;
      if (u.team === 'enemy') u.hidden = true;
      out.buffed.push(u.uid); out.lines.push(`${u.name} slips under the surface.`);
      return out;
    case 'flood': {
      const n = flood([at!, { x: at!.x + 1, y: at!.y }, { x: at!.x, y: at!.y + 1 }, { x: at!.x + 1, y: at!.y + 1 }].filter((p) => inBounds(b, p.x, p.y)), floodTurns);
      out.lines.push(`${n} space${n === 1 ? '' : 's'} flood with shallow water.`);
      return out;
    }
    case 'risingTide': {
      const n = flood(tilesInRange(b, u, 1, 3, u.size), floodTurns);
      out.lines.push(`The tide rises: ${n} spaces flood.`);
      return out;
    }
    case 'healingCurrent':
      for (const a of [u, ...alliesOf(b, u)].filter((x) => aquatic(x) && unitDist(u, x) <= 3)) healU(a, a.stats.hp * 0.25);
      out.lines.push('A healing current washes over the aquatic allies.');
      return out;
    case 'boilingCurrent':
      for (const e of foesOf(b, u).filter((x) => unitDist(u, x) <= 4 && onWater(b, x))) hit(e, s.mag + 6 - effectiveStats(e).res);
      out.lines.push('The water boils!');
      return out;
    case 'riverRally':
      for (const a of [u, ...alliesOf(b, u)].filter((x) => isRiverZora(x) && unitDist(u, x) <= 3)) { buff(a, 'riverRally', 'River Rally', 3, { spd: 3 }); out.buffed.push(a.uid); }
      if (u.team === 'player') b.morale = Math.min(100, (b.morale ?? 50) + 5);
      out.lines.push(`${u.name} rallies the river!`);
      return out;
    case 'aquaticReinforcements': {
      let n = 0;
      for (let i = 0; i < 2; i++) if (spawnNear(b, RIVER_ZORA_IDS[0], u, Math.max(1, u.level - 2), rng, u.team, 3)) n++;
      out.lines.push(n ? `${n} River Zora surface to fight!` : 'No one answers.');
      return out;
    }
  }
  return null;
}

// ───────────────────────── Items ─────────────────────────

export function useLoruleItem(b: Battle, u: Unit, id: string): string | null {
  switch (id) {
    case 'scootFruit':
      if (b.nodeType === 'boss') return 'The Scoot Fruit does nothing: there is no running from this fight.';
      b.retreat = true; b.result = 'lost';
      return `${u.name} eats a Scoot Fruit — the whole army vanishes in a puff of smoke!`;
    case 'foulFruit': {
      let n = 0;
      for (const e of foesOf(b, u).filter((x) => unitDist(u, x) <= 2)) { addStatus(e, e.isBoss ? 'dazed' : 'stun', 1); n++; }
      return n ? `The Foul Fruit\'s stench stuns ${n} enem${n === 1 ? 'y' : 'ies'}!` : 'The stench drifts away. Nobody was close enough.';
    }
    case 'staminaScroll':
      u.stats.sta = Math.ceil(u.stats.sta * 1.2); u.stats.mp = Math.ceil(u.stats.mp * 1.2);
      u.sta = u.stats.sta; u.mp = u.stats.mp;
      return `${u.name} reads the Stamina Scroll: +20% max STA and MP for good.`;
  }
  return null;
}

/** Nice Bombs: a bigger blast and more damage. */
export function lrOnBlast(b: Battle, by: Unit, at: Pos, radius: number): string[] {
  if (by.team !== 'player' || !b.lr?.nice.includes('bomb')) return [];
  let n = 0;
  for (const e of [...b.units]) {
    if (e.team === by.team || !footprint(e.x, e.y, e.size).some((p) => Math.abs(p.x - at.x) + Math.abs(p.y - at.y) <= radius + 1)) continue;
    const d = Math.min(e.hp - 1, 8);
    if (d > 0) { e.hp -= d; n++; }
  }
  return n ? [`Nice Bombs! The bigger blast catches ${n} more time${n === 1 ? '' : 's'}.`] : [];
}

/** Sword technique stamina (twilight.ts techniqueCost): Gramps's students and the Veteran Masters. */
export function lrStaminaAdjust(u: Unit, a: AbilityDef, bonus: string | undefined, c: number, groups?: string[]): number {
  if (a.kind !== 'technique' || !(a.weaponTypes ?? []).includes('sword')) return c;
  let m = 1;
  if (bonus === 'veteranTechniques' && u.team === 'player') m *= 0.75;
  if (groups?.includes('veteranMasters') && ['gramps', 'herosShade', 'swiftbladeFirst'].includes(u.templateId ?? '')) m *= 0.8;
  return Math.max(0, Math.floor(c * m));
}
