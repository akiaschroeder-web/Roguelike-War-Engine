// Echoes of Wisdom battle rules, and the game-wide Echo system.
// - Echoes (section 7): any unit with the Tri Rod (Zelda, Tekom) or an Echo ability summons copies of monsters it has
//   learned (from defeated monsters of every pack) at 75% of their HP, STR, MAG, DEF and RES, within its Echo Capacity.
//   Echoes take no slot, gain no EXP, carry no items, can't summon, and are never casualties (nor recruits or loot).
// - Object Echoes (section 8): battlefield objects (terrain on one tile) that also use capacity.
// - Bind and Reverse Bond, Swordfighter Form and its Energy, Automatons and Wind-Up Energy, smoothies in battle,
//   the Still World's spaces, the cast's skills, the monsters, and every boss gimmick (Null's arms and Boss Reflection).
// Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts, abilities.ts, status.ts, ai.ts, run.ts and battleView.ts.

import { BOSSES, CLASSES, ENEMIES, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import {
  AUTOMATONS, BOSS_ECHO_COST, BOSS_REFLECTIONS, DESERT_REGIONS, ECHO_COST_OVERRIDES, ENERGY_ACTIVATE, ENERGY_MAX, ENERGY_PER_MIGHTY_ATTACK, ENERGY_PER_TURN,
  EO_FEATURES, EO_SPECIAL, EO_SPOILS, OBJECT_BY_ID, OBJECT_ECHOES, RIVER_ZORA_IDS, STARTING_MONSTERS, STARTING_OBJECTS, SWORDFIGHTER_BASE, SWORDFIGHTER_STATS,
  TRI_CAPACITY, TRI_MAX_LEVEL, WINDUP_PER_TURN,
} from '../content/echoes';
import { anchorCost, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF } from './rules';
import { addStatus } from './status';
import { activeGear, effectiveStats, makeEnemy, moveTypeOf, unitTags } from './units';
import { pullToward, pushAway } from './windwaker';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Echoes of Wisdom battle state (and the Echo system's, in any campaign). */
    eo?: EOState;
  }
  interface Unit {
    /** An Echo: the uid of its summoner, and the capacity it uses. */
    eoBy?: string;
    eoCost?: number;
    /** A Rift creature (the Still World): more RES, immune to fear, unharmed by unstable spaces. */
    eoRift?: boolean;
    /** Swordfighter Energy (Zelda), and whether Swordfighter Form is active. */
    eoEnergy?: number;
    eoSword?: boolean;
    /** The Echo this summoner will create next (picked in the battle view). */
    eoPick?: string;
    /** Bori's bubble (damage it can still take). */
    eoBubble?: number;
    /** Null's arms. */
    eoArms?: number;
    /** Hydrozol: turns spent absorbing water. */
    eoAbsorb?: number;
  }
  interface WeaponDef {
    /** Echoes of Wisdom effects handled by engine/echoes.ts. */
    eo?: string[];
  }
  interface GearDef {
    /** Echoes of Wisdom effects (upgrade families `fam:<family>:<level>`) handled by engine/echoes.ts. */
    eo?: string[];
  }
}

export interface EOObject { x: number; y: number; id: string; owner: string; team: string; cost: number; turns?: number; prev: Terrain }

export interface EOState {
  /** Echoes the army knows (monster template ids and object ids). */
  known: string[];
  /** Tri's level (capacity), Might Crystals (Energy). */
  triLevel: number;
  might: number;
  objects: EOObject[];
  /** A Still World (Rift) battle. */
  rift?: boolean;
  /** Learned during the battle (Echo Learning Points). */
  learned: string[];
  /** Stamps, Tri's friends rescued, Rift spaces repaired, quest items found. */
  stamps: number;
  rescued: number;
  repaired: number;
  found: string[];
  /** A team can't summon until this turn (Return to Nothing). */
  noSummon?: { team: string; until: number };
  /** Phases already processed (field-wide effects run once per phase). */
  phases: string[];
}

export const eoState = (b: Battle): EOState => (b.eo ??= { known: [...STARTING_MONSTERS, ...STARTING_OBJECTS], triLevel: 1, might: 0, objects: [], learned: [], stamps: 0, rescued: 0, repaired: 0, found: [], phases: [] });
const EO_WORLD = (b: Battle) => worldDef(b.world).campaign === 'echoes';
const has = (u: Unit, s: string) => u.skills.includes(s);
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
const gearTag = (u: Unit, t: string) => activeGear(u).some((g) => g.eo?.includes(t));
const weaponTag = (u: Unit, t: string) => !!WEAPONS[u.weapons[0]]?.eo?.includes(t);
/** The best level of an upgrade family worn (pieces of one family don't stack). */
const famLevel = (u: Unit, fam: string) => Math.max(0, ...activeGear(u).flatMap((g) => (g.eo ?? []).filter((t) => t.startsWith(`fam:${fam}:`)).map((t) => Number(t.split(':')[2]))));
function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}
export const isAutomaton = (u: Unit) => u.race === 'automaton' || AUTOMATONS.includes(u.templateId ?? '');
export const isEcho = (u: Unit) => !!u.eoBy;
export const isRiftLike = (u: Unit) => !!u.eoRift || !!u.eoBy || u.race === 'primordial' || unitTags(u).includes('rift');
const isRiverZora = (u: Unit) => u.race === 'riverZora' || RIVER_ZORA_IDS.includes(u.templateId ?? u.artId ?? '');
const aquatic = (u: Unit) => u.race === 'zora' || u.race === 'riverZora' || unitTags(u).includes('aquatic');
const tid = (u: Unit) => u.bossId ?? u.templateId ?? u.artId ?? '';
const groups = (b: Battle, u: Unit, id: string) => u.team === 'player' && !!b.groupSupports?.includes(id);
const isSummoner = (u: Unit) => u.weapons.some((w) => WEAPONS[w]?.eo?.includes('triRod')) || u.abilities.includes('createEcho') || has(u, 'wisdomOfThePrincess') || has(u, 'falseWisdom');

// ───────────────────────── The Echo Compendium ─────────────────────────

/** A monster the Compendium can hold: an ordinary monster of any pack (no named characters, bosses, vessels or trains). */
export function isEchoEligible(id: string): boolean {
  const e = ENEMIES[id];
  if (!e || BOSSES[id]) return false;
  const tags = [...(CLASSES[e.classId]?.tags ?? [])];
  if (tags.includes('vessel') || tags.includes('train') || tags.includes('automaton')) return false;
  return !!TEMPLATES[id]?.monster || RIVER_ZORA_IDS.includes(id);
}

/** Section 7's cost table: overrides, else graded by size and strength (basic 2 … legendary 6). */
export function echoCost(id: string): number {
  if (OBJECT_BY_ID[id]) return OBJECT_BY_ID[id].cost;
  if (BOSSES[id] && !ENEMIES[id]) return BOSS_ECHO_COST;
  if (ECHO_COST_OVERRIDES[id]) return ECHO_COST_OVERRIDES[id];
  const e = ENEMIES[id];
  if (!e) return 3;
  const s = { ...CLASSES[e.classId]?.base, ...(e.stats ?? {}) } as Record<string, number>;
  const power = (s.hp ?? 20) + 2 * Math.max(s.str ?? 5, s.mag ?? 5) + (s.def ?? 5) + (s.res ?? 5);
  const size = e.size ?? 1;
  if (size >= 3) return power >= 150 ? 6 : 5;
  if (size === 2) return power >= 110 ? 5 : 4;
  return power < 65 ? 2 : power < 95 ? 3 : 4;
}

export const echoName = (id: string) => OBJECT_BY_ID[id]?.name ?? ENEMIES[id]?.name ?? BOSSES[id]?.name ?? id;

/** Echo Capacity of a summoner: Tri's level, Tri in the battle, the Zelda commander bonus. */
export function echoCapacity(b: Battle, u: Unit): number {
  const st = eoState(b);
  if (u.team === 'enemy') return u.isBoss ? 10 : 6;
  let cap = TRI_CAPACITY[Math.max(1, Math.min(TRI_MAX_LEVEL, st.triLevel))];
  if (b.bonus === 'echoCapacity') cap += 2;
  if (b.units.some((a) => a.team === u.team && has(a, 'powerOfCreation') && a !== u)) cap += st.triLevel >= 6 ? 2 : 1;
  if (has(u, 'powerOfCreation')) cap += 1;
  return cap;
}
export function echoUsed(b: Battle, u: Unit): number {
  return b.units.filter((e) => e.eoBy === u.uid).reduce((n, e) => n + (e.eoCost ?? 0), 0) + eoState(b).objects.filter((o) => o.owner === u.uid).reduce((n, o) => n + o.cost, 0);
}
/** What an Echo costs this summoner (Tri's higher levels, the Prime Energy group, Tri's Bond, the Void's reflections). */
export function echoCostFor(b: Battle, u: Unit, id: string): number {
  let c = echoCost(id);
  const st = eoState(b);
  if (u.team === 'player' && st.triLevel >= 5 && c === 2 && !OBJECT_BY_ID[id]) c = 1;
  if (groups(b, u, 'primeEnergy')) c -= 1;
  if (hasBuff(u, 'triBond')) c -= 1;
  if (BOSSES[id] && u.team === 'player' && b.bonus === 'voidReflection') c = Math.ceil(c * 0.75);
  return Math.max(1, c);
}
const summonRange = (b: Battle) => 2 + (eoState(b).triLevel >= 4 ? 1 : 0) + (eoState(b).triLevel >= 8 ? 1 : 0);

/** The Echoes a summoner can choose from (for the battle view's picker). */
export function echoChoices(b: Battle, u: Unit): { id: string; name: string; cost: number; object: boolean; ok: boolean }[] {
  const st = eoState(b);
  const left = echoCapacity(b, u) - echoUsed(b, u);
  return st.known.filter((id) => OBJECT_BY_ID[id] || isEchoEligible(id))
    .map((id) => ({ id, name: echoName(id), cost: echoCostFor(b, u, id), object: !!OBJECT_BY_ID[id], ok: echoCostFor(b, u, id) <= left }))
    .sort((x, y) => Number(x.object) - Number(y.object) || y.cost - x.cost || x.name.localeCompare(y.name));
}
/** The Echo a summoner creates: its pick if it still fits, else the strongest monster that does. */
function chosenEcho(b: Battle, u: Unit): string | undefined {
  const opts = echoChoices(b, u).filter((o) => o.ok);
  if (u.eoPick && opts.some((o) => o.id === u.eoPick)) return u.eoPick;
  return opts.find((o) => !o.object)?.id ?? opts[0]?.id;
}

// ───────────────────────── Summoning ─────────────────────────

const freeFor = (b: Battle, who: Unit, x: number, y: number) => inBounds(b, x, y) && anchorCost(b, who, x, y) < INF && footprint(x, y, who.size).every((p) => !unitAt(b, p.x, p.y));

/** Make an Echo of a monster (or a boss reflection) for a summoner, next to `near` (or on `at`). */
export function summonEcho(b: Battle, u: Unit, id: string, rng: RNG, at?: Pos, opts: { cost?: number; pct?: number; near?: Unit } = {}): Unit | null {
  const arch = ENEMIES[id] ?? BOSSES[id];
  if (!arch) return null;
  const e = makeEnemy(arch, b.world, Math.max(1, u.level), `eo${b.uidCounter++}`, rng);
  const pct = opts.pct ?? (u.team === 'player' && b.bonus === 'falseEchoes' ? 0.9 : 0.75);
  for (const k of ['hp', 'str', 'mag', 'def', 'res'] as const) e.stats[k] = Math.max(1, Math.round(e.stats[k] * pct));
  e.hp = e.stats.hp;
  let spot: Pos | undefined = at && freeFor(b, e, at.x, at.y) ? at : undefined;
  const anchor = opts.near ?? u;
  for (let d = 1; d <= 4 && !spot; d++) spot = tilesInRange(b, anchor, d, d, anchor.size).find((p) => freeFor(b, e, p.x, p.y));
  if (!spot) return null;
  Object.assign(e, {
    x: spot.x, y: spot.y, team: u.team, summoned: true, eoBy: u.uid, eoCost: opts.cost ?? echoCostFor(b, u, id), eoRift: u.eoRift || u.team === 'enemy' && !!eoState(b).rift,
    name: `${arch.name} (Echo)`, isBoss: false, moved: true, acted: true, ai: 'aggressive', pack: [], gear: {},
    abilities: e.abilities.filter((a) => !['createEcho', 'echoCreationNull', 'echoCreationTekom', 'bossReflection'].includes(a)),
  });
  b.units.push(e);
  return e;
}

/** Create an Object Echo on a tile. */
function placeObject(b: Battle, u: Unit, id: string, at: Pos, out: EOOutcome) {
  const o = OBJECT_BY_ID[id];
  const st = eoState(b);
  const k = keyOf(b, at.x, at.y);
  const near = foesOf(b, u).filter((e) => footprint(e.x, e.y, e.size).some((p) => Math.abs(p.x - at.x) + Math.abs(p.y - at.y) <= 1));
  const mag = effectiveStats(u).mag;
  // Thrown objects: a Small Rock or Pot next to enemies is hurled at the nearest and shatters.
  if ((id === 'echoSmallRock' || id === 'echoPot') && near.length) {
    const t = near[0];
    hurt(b, u, t, (id === 'echoSmallRock' ? 6 : 5) + Math.floor(mag / 4), out, true);
    out.lines.push(`${u.name} hurls an Echo ${o.name} at ${t.name}!`);
    return;
  }
  st.objects.push({ x: at.x, y: at.y, id, owner: u.uid, team: u.team, cost: echoCostFor(b, u, id), turns: o.turns, prev: b.tiles[k] });
  b.tiles[k] = o.terrain;
  out.lines.push(`${u.name} creates an Echo: ${o.name}.`);
  if (id === 'echoBoulder') for (const t of near) { hurt(b, u, t, 8 + Math.floor(mag / 3), out, true); out.lines.push(`The Boulder crushes ${t.name}!`); }
  if (id === 'echoTorch') b.fog = false;
  const lure = id === 'echoCarrot' ? (e: Unit) => unitTags(e).includes('beast') : id === 'echoMeat' ? (e: Unit) => e.race === 'monster' : id === 'echoGrilledFish' ? (e: Unit) => aquatic(e) : null;
  if (lure) for (const e of foesOf(b, u)) if (!e.isBoss && lure(e) && Math.abs(e.x - at.x) + Math.abs(e.y - at.y) <= (id === 'echoGrilledFish' ? 4 : 3)) { addStatus(e, 'confuse', 1); out.statuses.push({ uid: e.uid, kind: 'confuse' }); }
}

function removeObject(b: Battle, o: EOObject) {
  const st = eoState(b);
  st.objects = st.objects.filter((x) => x !== o);
  const k = keyOf(b, o.x, o.y);
  if (b.tiles[k] === OBJECT_BY_ID[o.id]?.terrain) b.tiles[k] = o.prev;
}

/** False Wisdom: Tekom copies a foe's summoning. */
function copySummon(b: Battle, by: Unit, id: string, rng: RNG, out: EOOutcome) {
  if (OBJECT_BY_ID[id]) return;
  for (const t of foesOf(b, by).filter((x) => has(x, 'falseWisdom'))) {
    if (echoUsed(b, t) + echoCostFor(b, t, id) > echoCapacity(b, t)) continue;
    const e = summonEcho(b, t, id, rng);
    if (e) out.lines.push(`${t.name} copies it: a hostile ${e.name} appears!`);
  }
}

// ───────────────────────── Movement ─────────────────────────

/** Per-unit movement (grid.ts tileCost): climbing gear, the Frog Ring, Ice Spikes, the Gerudo Sandals, wall-crawlers, Echoes in rifts. */
export function eoTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  void b;
  if ((t === 'wall' || t === 'mountain') && (has(u, 'silkClimber') || has(u, 'wallCrawler'))) c = Math.min(c, 2);
  if (t === 'riftBoundary' && (isEcho(u) || u.race === 'primordial' || has(u, 'powerOfCreation'))) c = 2;
  const climb = famLevel(u, 'climb');
  if (climb && (t === 'mountain' || t === 'rotatedTerrain' || t === 'eoBox')) c = Math.min(c, climb >= 2 ? 1 : 2);
  if (gearTag(u, 'frogRing') && (t === 'mountain' || t === 'eoBox' || t === 'rotatedTerrain') && c < INF) c = Math.max(1, c - 1);
  if (gearTag(u, 'iceSpikes') && (t === 'frozenWater' || t === 'iceBlock') && c < INF) c = 1;
  if ((t === 'sinkingSand' || t === 'sandPile') && (has(u, 'desertTactics') || Object.values(u.gear).includes('gerudoSandals'))) c = Math.min(c, 1);
  return c;
}

// ───────────────────────── Battlefield setup ─────────────────────────

function layTerrain(b: Battle, rng: RNG, list: Partial<Record<Terrain, number>>) {
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 2 && i % b.width <= b.width - 3 ? i : -1)).filter((i) => i >= 0));
  for (const [t, n] of Object.entries(list) as [Terrain, number][]) for (let j = 0; j < n; j++) { const k = plains.pop(); if (k !== undefined) b.tiles[k] = t; }
}

/** The region's battlefield spaces (section 13). */
export function decorateEchoes(b: Battle, rng: RNG) {
  const feats = EO_FEATURES[b.world];
  if (!feats || b.naval) return;
  layTerrain(b, rng, feats);
}

/** A Still World battle: broken islands, unstable spaces, a corruption source and Tri's friend; every enemy is a Rift creature. */
export function startStillWorld(b: Battle, rng: RNG, terrain: Partial<Record<Terrain, number>>, friend: boolean) {
  const st = eoState(b);
  st.rift = true;
  layTerrain(b, rng, { ...terrain, ...(friend ? { triFriend: 1 } : {}) });
  for (const u of b.units) if (u.team === 'enemy') { u.eoRift = true; u.stats.res += 4; }
  // Null is at home in the Still World.
  for (const u of b.units) u.buffs = u.buffs.filter((x) => x.id !== 'eoStarved');
}

/** Battle start: Energy, Null's arms, Bori's bubble, Rift creatures. */
export function echoesBattleStart(b: Battle) {
  const st = eoState(b);
  for (const u of b.units) {
    if (has(u, 'wisdomOfThePrincess') || u.weapons.some((w) => WEAPONS[w]?.eo?.includes('mighty'))) u.eoEnergy ??= ENERGY_MAX + 5 * st.might;
    if (has(u, 'primordialNothingness') && u.team === 'enemy') u.eoArms ??= 4;
    // Null on your side, outside the Still World, is starved of Rifts.
    if (has(u, 'primordialNothingness') && u.team === 'player' && !st.rift && !hasBuff(u, 'eoStarved')) { const k = (x: number) => -Math.round(x * 0.45); buff(u, 'eoStarved', 'Starved of Rifts', 999, { str: k(u.stats.str), mag: k(u.stats.mag), def: k(u.stats.def), res: k(u.stats.res), spd: -4 }); u.hp = Math.min(u.hp, Math.ceil(u.stats.hp * 0.6)); }
    if (has(u, 'protectiveBubble')) u.eoBubble ??= 15;
    if (st.rift && u.team === 'enemy') u.eoRift = true;
  }
}

// ───────────────────────── Start of each turn ─────────────────────────

export interface EOEvent { uid: string; heal: number; damage: number; source: string }

/** Swordfighter Form ends: back to the Tri Rod. */
function revertSword(u: Unit) {
  u.eoSword = false;
  u.buffs = u.buffs.filter((x) => x.id !== 'swordfighter');
  const rod = u.weapons.findIndex((w) => WEAPONS[w]?.eo?.includes('triRod'));
  if (rod > 0) u.weapons.unshift(...u.weapons.splice(rod, 1));
}
const masteryMult = (u: Unit) => [1, 0.8, 0.65, 0.5][famLevel(u, 'mastery')] ?? 1;

/** Field-wide effects, once per phase: objects fade, torches burn, wind cannons blow, Rifts spread and spawn. */
function phaseOnce(b: Battle, team: string, events: EOEvent[]) {
  const st = eoState(b);
  const key = `${b.turn}:${team}`;
  if (st.phases.includes(key)) return;
  st.phases.push(key);
  for (const o of [...st.objects].filter((x) => x.team === team)) {
    const owner = b.units.find((x) => x.uid === o.owner);
    if (o.id === 'echoTorch') for (const e of b.units.filter((x) => x.team !== team && Math.abs(x.x - o.x) + Math.abs(x.y - o.y) <= 1)) addStatus(e, 'burn', 2);
    if (o.id === 'echoWindCannon') for (const e of b.units.filter((x) => x.team !== team && x.size <= 1 && !x.isBoss && Math.abs(x.x - o.x) + Math.abs(x.y - o.y) <= 3)) pushAway(b, e, { x: o.x, y: o.y, size: 1 }, 2);
    if (o.turns !== undefined && --o.turns <= 0) removeObject(b, o);
    else if (!owner) removeObject(b, o);
  }
  if (team !== 'enemy') return;
  // Unrepaired unstable spaces spread every other turn.
  if (b.turn % 2 === 0) {
    const rifts = b.tiles.map((t, i) => (t === 'unstableRift' ? i : -1)).filter((i) => i >= 0);
    const add = rifts.slice(0, 2).flatMap((i) => [i + 1, i - 1, i + b.width, i - b.width]).filter((i) => i >= 0 && i < b.tiles.length && b.tiles[i] === 'plain');
    for (const i of add.slice(0, 2)) b.tiles[i] = 'unstableRift';
  }
  // A Rift Corruption Source keeps making hostile Echoes.
  if (b.turn % 2 === 1 && b.units.filter((x) => x.team === 'enemy' && x.summoned).length < 4) {
    b.tiles.forEach((t, i) => {
      if (t !== 'riftCorruptionSource') return;
      const p = { x: i % b.width, y: Math.floor(i / b.width) };
      const pool = ['keese', 'zol', 'octorok', 'moblin', 'lizalfos', 'ignizol', 'strandtula'].filter((id) => ENEMIES[id]);
      const caster = { ...b.units.find((x) => x.team === 'enemy')!, uid: 'riftSource', level: b.enemyLevel, eoRift: true } as Unit;
      if (!caster.team || !pool.length) return;
      const seed = (b.turn * 31 + i) % pool.length;
      const e = summonEcho(b, caster, pool[seed], new RNG((b.rngState ^ (i * 7919 + b.turn)) >>> 0), undefined, { near: { ...caster, x: p.x, y: p.y, size: 1 } });
      if (e) { e.eoBy = 'riftSource'; e.moved = e.acted = false; events.push({ uid: e.uid, heal: 0, damage: 0, source: 'crawls out of the Rift Corruption' }); }
    });
  }
}

export function eoStartPhase(b: Battle, u: Unit, events: EOEvent[]) {
  phaseOnce(b, u.team, events);
  const st = eoState(b);
  const heal = (who: Unit, pct: number, source: string) => {
    if (isAutomaton(who) && !source.includes('repair')) return;
    const amt = Math.min(who.stats.hp - who.hp, Math.ceil(who.stats.hp * pct));
    if (amt > 0) { who.hp += amt; events.push({ uid: who.uid, heal: amt, damage: 0, source }); }
  };
  const hurtT = (who: Unit, dmg: number, source: string) => {
    dmg = Math.min(who.hp - 1, Math.floor(dmg));
    if (dmg > 0) { who.hp -= dmg; events.push({ uid: who.uid, heal: 0, damage: dmg, source }); }
  };
  const k = keyOf(b, u.x, u.y);
  const here = b.tiles[k];
  // ── Spaces ──
  const bed = here === 'eoOldBed' ? 0.15 : here === 'eoSoftBed' ? 0.25 : here === 'eoZeldaBed' ? 0.3 : 0;
  if (bed) { heal(u, bed * (gearTag(u, 'pajamas') ? 2 : 1), 'rests on an Echo bed'); if (here === 'eoZeldaBed') u.mp = Math.min(u.stats.mp, u.mp + 10); }
  if (here === 'eoTrampoline') buff(u, 'eoTrampoline', 'Trampoline', 1, { mov: 2 });
  if (here === 'eoPot' && u.micro) addStatus(u, 'veiled', 1);
  if (u.team === 'player' && !isEcho(u)) {
    if (here === 'echoLearningPoint') {
      const next = OBJECT_ECHOES.map((o) => o.id).find((id) => !st.known.includes(id));
      b.tiles[k] = 'plain';
      if (next) { st.known.push(next); st.learned.push(next); events.push({ uid: u.uid, heal: 0, damage: 0, source: `learns an Object Echo: ${OBJECT_BY_ID[next].name}` }); }
    }
    if (here === 'stampStation') { b.tiles[k] = 'plain'; st.stamps += 1 + (has(u, 'stampEnthusiast') ? 1 : 0) + (gearTag(u, 'stampSuit') ? 1 : 0); events.push({ uid: u.uid, heal: 0, damage: 0, source: 'stamps a Stamp Card' }); }
    if (here === 'triFriend') { b.tiles[k] = 'plain'; st.rescued++; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'rescues one of Tri\'s friends' }); }
    if (here === 'riftCorruptionSource') { b.tiles[k] = 'plain'; st.repaired++; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'seals the Rift Corruption Source' }); }
  }
  if (here === 'glowingEnergyOrb' && u.team === 'player') {
    b.tiles[k] = 'plain';
    if (u.eoEnergy !== undefined) u.eoEnergy = Math.min(ENERGY_MAX + 5 * st.might, u.eoEnergy + 15);
    u.sta = Math.min(u.stats.sta, u.sta + 10);
    events.push({ uid: u.uid, heal: 0, damage: 0, source: 'absorbs a Glowing Energy Orb' });
  }
  if (footprint(u.x, u.y, u.size).some((p) => tileAt(b, p.x, p.y) === 'unstableRift') && !isRiftLike(u) && !has(u, 'powerOfCreation') && moveTypeOf(u) !== 'flying') hurtT(u, u.stats.hp * 0.1, 'is eaten at by the unstable Rift');
  // ── Swordfighter Energy ──
  if (u.eoEnergy !== undefined) {
    const max = ENERGY_MAX + 5 * st.might;
    if (u.eoSword) {
      u.eoEnergy -= Math.ceil(ENERGY_PER_TURN * masteryMult(u));
      if (u.eoEnergy <= 0) { u.eoEnergy = 0; revertSword(u); events.push({ uid: u.uid, heal: 0, damage: 0, source: 'runs out of Energy and leaves Swordfighter Form' }); }
    } else {
      const regen = [0, 3, 6][famLevel(u, 'energy')] ?? 0;
      u.eoEnergy = Math.min(max, u.eoEnergy + regen + (alliesOf(b, u).some((a) => has(a, 'mightResearch') && unitDist(u, a) <= 3) ? 4 : 0));
    }
  }
  // ── Automatons: Wind-Up Energy ──
  if (isAutomaton(u)) {
    let use = WINDUP_PER_TURN;
    if ((u.team === 'player' && b.bonus === 'clockworkArmy') || groups(b, u, 'clockworkArmy')) use = Math.ceil(use * 0.75);
    if (alliesOf(b, u).some((a) => has(a, 'mechanicalGenius') && unitDist(u, a) <= 2)) use -= 3;
    u.sta = Math.max(0, u.sta - Math.max(0, use));
    if (u.sta <= 0) { u.moved = u.acted = true; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'has wound down (it needs rewinding)' }); }
  }
  // ── The cast ──
  for (const a of alliesOf(b, u)) {
    const d = unitDist(u, a);
    if (has(a, 'oceanMelody') && d <= 2 && aquatic(u)) heal(u, 0.1 * (b.bonus === 'aquaticHealing' && u.team === 'player' ? 1.3 : 1), 'is soothed by the Ocean Melody');
    if (weaponTag(a, 'healMusic') && d <= 2) heal(u, 0.05, 'hears Kushara\'s harp');
    if (has(a, 'gentleGiant') && d <= 1) buff(u, 'eoCarried', 'Carried', 1, { mov: 1 });
  }
  if (has(u, 'desertTactics') && (DESERT_REGIONS.includes(b.world) || here === 'sinkingSand')) buff(u, 'desertTactics', 'Desert Tactics', 1, { mov: 1 });
  if (u.team === 'player' && b.bonus === 'desertMarch') buff(u, 'desertMarch', 'Desert March', 1, { mov: 1 });
  // ── Monsters ──
  if (has(u, 'waterAbsorption') && !hasBuff(u, 'eoSwollen')) {
    if (tilesInRange(b, u, 0, 1).some((p) => ['water', 'verticalWaterColumn'].includes(tileAt(b, p.x, p.y) ?? '')) || b.weather?.kind === 'rain') u.eoAbsorb = (u.eoAbsorb ?? 0) + 1;
    if ((u.eoAbsorb ?? 0) >= 2) { buff(u, 'eoSwollen', 'Swollen', 99, { str: 4, def: 4 }); u.stats.hp = Math.round(u.stats.hp * 1.5); u.hp += Math.round(u.stats.hp / 3); events.push({ uid: u.uid, heal: 0, damage: 0, source: 'swells with water' }); }
  }
  if (has(u, 'livingCyclone')) for (const e of foesOf(b, u)) if (unitDist(u, e) <= 1 && e.size <= 1) pushAway(b, e, u, 1);
  if (has(u, 'rainSong') && b.turn % 3 === 0) { b.weather = { kind: 'rain', turns: 2 }; b.fires = []; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'sings up the rain' }); }
  if (has(u, 'burrower') && u.team === 'enemy' && b.turn % 2 === 0) {
    const t = foesOf(b, u).filter((e) => !e.hidden).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
    const spot = t && unitDist(u, t) > 1 ? tilesInRange(b, t, 1, 1, t.size).find((p) => freeFor(b, u, p.x, p.y)) : undefined;
    if (spot) { u.x = spot.x; u.y = spot.y; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'burrows and pops up' }); }
  }
  // ── Bosses ──
  if (has(u, 'whirlpoolMaster')) for (const e of foesOf(b, u)) if (unitDist(u, e) <= 4 && unitDist(u, e) > 1) pullToward(b, e, u, 1);
  if (has(u, 'desertBurrower')) { if (b.turn % 2 === 0 && !hasBuff(u, 'eoUnearthed')) buff(u, 'eoBurrowed', 'Burrowed', 1); }
  if (has(u, 'primordialNothingness') && u.team === 'enemy') {
    const s = effectiveStats(u);
    const targets = foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) <= 3).sort((x, y) => x.hp - y.hp);
    for (let i = 0; i < (u.eoArms ?? 0) && targets.length; i++) {
      const t = targets[i % targets.length];
      hurtT(t, Math.max(1, Math.floor(s.str / 3) + 2 - effectiveStats(t).def / 2), 'is struck by one of Null\'s arms');
    }
  }
}

// ───────────────────────── Combat ─────────────────────────

export interface EOMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

export function eoMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): EOMods {
  const m: EOMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const allies = b.units.filter((a) => a !== u && a.team === u.team);
  const within = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  const melee = unitDist(u, foe, pos) <= 1;
  const here = tileAt(b, pos.x, pos.y);
  if (here === 'eoTable') m.hit += 15;
  // Hyrule's army: coordinated infantry attacks.
  const infantry = moveTypeOf(u) === 'foot' || moveTypeOf(u) === 'armor';
  const flanked = b.units.some((a) => a !== u && a.team === u.team && unitDist(a, foe) <= 1);
  if (infantry && flanked && (has(u, 'royalOffensive') || allies.some((a) => has(a, 'royalOffensive') && within(a, 3)))) m.dmg += 3;
  if (w?.eo?.includes('formation') && flanked) m.dmg += 3;
  if (has(u, 'hiddenStrength') && melee) m.dmg += initiating ? 3 : 7;
  if (w?.eo?.includes('counter')) { m.spd += 2; if (!initiating) m.dmg += 4; }
  if (u.race === 'gerudo' && allies.some((a) => has(a, 'desertAuthority') && within(a, 3))) { m.str += 3; m.skl += 3; }
  const desert = DESERT_REGIONS.includes(b.world) || here === 'sinkingSand';
  if (has(u, 'desertTactics') && desert) { m.str += 2; m.avoid += 5; }
  if (u.team === 'player' && b.bonus === 'desertMarch' && desert) { m.str += 1; m.avoid += 5; }
  if (isRiverZora(u)) {
    if (allies.some((a) => has(a, 'riverPercussion') && within(a, 3))) { m.str += 3; m.mag += 3; }
    if (allies.some((a) => weaponTag(a, 'riverDrum') && within(a, 3))) { m.str += 2; m.mag += 2; }
  }
  if (u.team === 'player' && b.bonus === 'riverZoraMight' && (isRiverZora(u) || u.race === 'zora' || has(u, 'riverPercussion'))) { m.str += 3; m.mag += 3; m.def += 1; }
  if (u.team === 'player' && b.bonus === 'goronObstacles') { m.def += 3; m.str += 2; }
  if (u.team === 'player' && b.bonus === 'formationCommand' && infantry) { m.def += 2; m.dmg += 2; }
  if (allies.some((a) => has(a, 'livingPlatform') && within(a, 1))) m.hit += 15;
  if (w?.eo?.includes('mighty') && allies.some((a) => has(a, 'mightResearch') && within(a, 3))) m.dmg += 2;
  if (isAutomaton(u) && allies.some((a) => has(a, 'mechanicalGenius') && within(a, 2))) m.def += 2;
  if (has(u, 'rollingShell') && initiating) m.dmg += Math.min(4, u.movedDist ?? 0);
  if (u.eoRift) m.res += 2;
  // Group supports.
  if (groups(b, u, 'primeEnergy') && ['zeldaEoW', 'linkEoW', 'tri'].includes(u.templateId ?? '')) { m.str += 3; m.mag += 3; m.res += 3; }
  if (groups(b, u, 'royalCouncil') && ['kingEoW', 'generalWright', 'ministerLefte', 'impaEoW'].includes(u.templateId ?? '')) { m.def += 2; m.res += 2; }
  if (groups(b, u, 'mechanicalMasters') && (isAutomaton(u) || unitTags(u).includes('construct'))) { m.def += 4; m.skl += 4; }
  if (groups(b, u, 'mountainBrotherhood') && ['darston', 'conde', 'yeto'].includes(u.templateId ?? '')) m.def += 2;
  if (groups(b, u, 'desertCommand') && u.race === 'gerudo') { m.str += 2; m.spd += 2; }
  if (groups(b, u, 'falseCreation') && isEcho(u)) { m.str += 3; m.mag += 3; }
  if (groups(b, u, 'unitedWatersEoW') && aquatic(u)) { m.def += 2; m.res += 2; m.spd += 2; }
  void w;
  return m;
}

/** Zelda can swing a Mighty weapon only in Swordfighter Form; a wound-down Automaton can't fight. */
export function eoCannotAttack(b: Battle, atk: Unit, w: WeaponDef | undefined): boolean {
  void b;
  if (has(atk, 'wisdomOfThePrincess') && w?.eo?.includes('mighty') && !atk.eoSword) return true;
  if (isAutomaton(atk) && atk.sta <= 0) return true;
  return false;
}

/** Damage multipliers: Rift hunters, stone and flame bodies, every boss defence, smoothies and charms. */
export function eoMultiplier(b: Battle, atk: Unit, def: Unit, magical: boolean, w: WeaponDef | undefined, element?: Element): number {
  let m = 1;
  if (isRiftLike(def)) {
    if (has(atk, 'mysteriousSwordsman')) m *= 1.3;
    if (atk.team === 'player' && b.bonus === 'riftHunter') m *= 1.2;
  }
  if (has(def, 'stoneBody')) { if (!magical) m *= 0.6; if (element === 'fire') m = 0; }
  if (has(def, 'livingFlame') && element === 'fire') m = 0;
  if (has(atk, 'aquaticPredator') && footprint(def.x, def.y, def.size).some((p) => ['water', 'verticalWaterColumn'].includes(tileAt(b, p.x, p.y) ?? ''))) m *= 1.3;
  if (has(def, 'floatingCore')) m *= hasBuff(def, 'eoCoreOut') ? 1.25 : hasBuff(def, 'eoLoosened') ? 1 : 0.7;
  if (has(def, 'desertBurrower') && hasBuff(def, 'eoBurrowed') && !hasBuff(def, 'eoUnearthed')) m *= 0.7;
  if (has(def, 'elementalHelmet')) {
    const helmet: Element = b.turn % 2 === 1 ? 'fire' : 'ice';
    const opposing = helmet === 'fire' ? 'ice' : 'fire';
    if (element === opposing || hasBuff(def, 'eoHornsBroken')) m *= 1.3; else m *= 0.6;
  }
  if (has(def, 'protectiveBubble') && (def.eoBubble ?? 0) > 0 && w?.type !== 'bow') m *= 0.4;
  if (has(def, 'primordialNothingness') && (def.eoArms ?? 0) > 0) m *= 0.5;
  if (has(def, 'gentleGiant') && element === 'ice') m *= 0.5;
  if (atk.team === 'player' && b.bonus === 'goronObstacles' && unitTags(def).includes('construct')) m *= 1.5;
  if (has(atk, 'gentleGiant') && unitTags(def).includes('construct')) m *= 1.5;
  if (has(atk, 'riverPercussion') && magical && element === 'water') m *= 1.2;
  if (hasBuff(def, 'eoElectro') && element === 'lightning') m *= 0.5;
  if (hasBuff(def, 'eoWarm') && element === 'ice') m *= 0.5;
  if (hasBuff(def, 'eoChilly') && element === 'fire') m *= 0.5;
  const charm = famLevel(def, 'charm');
  if (charm) m *= charm >= 2 ? 0.8 : 0.9;
  if (element === 'dark' && gearTag(atk, 'nullsEmbrace')) m *= 1.25;
  return m;
}

/** After a hit lands: bubbles pop, horns shatter, Null's arms break, courage grows, golden pecks pay, Energy is spent. */
export function eoAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element?: Element): string[] {
  const lines: string[] = [];
  if (by.eoSword && w?.eo?.includes('mighty') && by.eoEnergy !== undefined) {
    by.eoEnergy = Math.max(0, by.eoEnergy - Math.ceil(ENERGY_PER_MIGHTY_ATTACK * masteryMult(by)));
    if (by.eoEnergy <= 0) { revertSword(by); lines.push(`${by.name} runs out of Energy and leaves Swordfighter Form.`); }
  }
  if (target.hp > 0 && dmg > 0) {
    if (has(target, 'protectiveBubble') && (target.eoBubble ?? 0) > 0) {
      target.eoBubble = w?.type === 'bow' ? 0 : Math.max(0, (target.eoBubble ?? 0) - dmg);
      if (!target.eoBubble) lines.push(`${target.name}'s bubble pops!`);
    }
    if (has(target, 'elementalHelmet') && element === (b.turn % 2 === 1 ? 'ice' : 'fire') && !hasBuff(target, 'eoHornsBroken')) { buff(target, 'eoHornsBroken', 'Horns shattered', 2); lines.push(`The opposing element shatters ${target.name}'s horns!`); }
    if (has(target, 'primordialNothingness') && dmg >= 12 && (target.eoArms ?? 0) > 0) { target.eoArms!--; lines.push(`One of ${target.name}'s arms is destroyed (${target.eoArms} left).`); }
    if (has(target, 'livingFlame') && unitDist(by, target) <= 1 && (b.turn + by.uid.length) % 2 === 0) addStatus(by, 'burn', 2);
  }
  if (dmg > 0) for (const a of b.units) if (a !== target && a.team === target.team && has(a, 'growingCourage') && unitDist(a, target) <= 3) {
    const cur = a.buffs.find((x) => x.id === 'growingCourage');
    const n = Math.min(6, ((cur?.stats?.str as number | undefined) ?? 0) + 1);
    buff(a, 'growingCourage', 'Growing Courage', 99, { str: n, def: n });
  }
  if (dmg > 0 && (has(by, 'goldenPeck') || weaponTag(by, 'goldenPeck')) && by.team === 'player') b.bonusRupees = (b.bonusRupees ?? 0) + 15;
  b.log.push(...lines);
  return lines;
}

export function eoOnKill(b: Battle, by: Unit, victim: Unit) {
  const heart = famLevel(by, 'heart');
  if (heart) by.hp = Math.min(by.stats.hp, by.hp + heart * 3);
  if (has(victim, 'livingPlatform')) for (const e of b.units.filter((x) => x.team !== victim.team && unitDist(x, victim) <= 1)) e.hp = Math.max(1, e.hp - 8);
  if (victim.team !== 'enemy' || by.team !== 'player' || victim.summoned) return;
  const spoil = EO_SPOILS[tid(victim)];
  if (spoil && (b.turn + victim.uid.length) % 4 === 0) eoState(b).found.push(spoil);
}

/** Automatons and Rift creatures shrug off some statuses; smoothies and flame bodies others (status.ts immuneTo). */
export function eoImmune(u: Unit, kind: StatusKind): boolean {
  if (isAutomaton(u) && ['poison', 'bleed', 'fear', 'sleep'].includes(kind)) return true;
  if (u.eoRift && kind === 'fear') return true;
  if ((has(u, 'livingFlame') || has(u, 'stoneBody')) && kind === 'burn') return true;
  if (has(u, 'gentleGiant') && kind === 'freeze') return true;
  const bf = (id: string) => u.buffs?.some((x) => x.id === id);
  if ((kind === 'shock' && bf('eoElectro')) || (kind === 'freeze' && bf('eoWarm')) || (kind === 'burn' && bf('eoChilly'))) return true;
  return false;
}

/** Food does nothing for Automatons (items.ts healing items). */
export const eoHealItemMult = (b: Battle, u: Unit) => { void b; return isAutomaton(u) ? 0 : 1; };

/** Battle orders (army.ts): Wright's formation commands −25% CP, Lefte's Strategic Wisdom −1 CP (minimum 1). */
export function eoOrderCost(b: Battle, cp: number): number {
  let c = cp;
  if (b.bonus === 'formationCommand') c = Math.floor(c * 0.75);
  if (b.units.some((u) => u.team === 'player' && has(u, 'strategicWisdom'))) c -= 1;
  return Math.max(1, Math.min(cp, c));
}

/** Taunting Croak: a unit within 2 of a Ribbitune attacks it if it can (ai.ts). */
export function eoTauntFilter(unit: Unit, foes: Unit[]): Unit[] {
  const t = foes.filter((f) => has(f, 'tauntingCroak') && unitDist(unit, f) <= 2);
  return t.length ? t : foes;
}

/** Bombs loosen the Seismic Talus's core. */
export function eoOnBlast(b: Battle, by: Unit, at: Pos, radius: number): string[] {
  const lines: string[] = [];
  for (const e of b.units) {
    if (e.team === by.team || !has(e, 'floatingCore')) continue;
    if (footprint(e.x, e.y, e.size).some((p) => Math.abs(p.x - at.x) + Math.abs(p.y - at.y) <= radius)) { buff(e, 'eoLoosened', 'Core loosened', 1); lines.push(`The blast loosens ${e.name}'s core!`); }
  }
  for (const o of [...eoState(b).objects]) if (o.id === 'echoIceBlock' && Math.abs(o.x - at.x) + Math.abs(o.y - at.y) <= radius) removeObject(b, o);
  return lines;
}

/** Before the battle ends: Echoes vanish (never casualties, recruits or loot) and objects fade. */
export function echoesBeforeFinish(b: Battle) {
  if (!b.eo && !b.units.some((u) => u.eoBy)) return;
  const st = eoState(b);
  for (const o of [...st.objects]) removeObject(b, o);
  b.units = b.units.filter((u) => !u.eoBy);
  b.fallen = b.fallen.filter((u) => !u.eoBy);
  for (const u of b.units) if (u.eoSword) revertSword(u);
}

/** Monsters defeated this battle that the Compendium can learn. */
export const defeatedEchoes = (b: Battle) => [...new Set(b.fallen.filter((u) => u.team === 'enemy' && !u.summoned && !u.isBoss).map((u) => u.templateId ?? u.artId ?? '').filter(isEchoEligible))];

// ───────────────────────── Abilities ─────────────────────────

const SPECIAL = new Set(EO_SPECIAL);
export const isEchoesAbility = (def: AbilityDef) => SPECIAL.has(def.id);
export { EO_ENEMY_CASTS } from '../content/echoes';
const TILE = new Set(['createEcho', 'dismissEcho']);
const TARGET = new Set(['eoBind', 'eoReverseBond', 'triBond', 'riftBreaker', 'mightInfusion', 'rewindAutomaton', 'repairAutomaton', 'mechanicalMawAct']);
export const eoNeedsTile = (def: AbilityDef) => TILE.has(def.id);
export const eoNeedsTarget = (def: AbilityDef) => TARGET.has(def.id);

export function eoTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const st = eoState(b);
  if (def.id === 'dismissEcho') return [...b.units.filter((e) => e.eoBy === u.uid).map((e) => ({ x: e.x, y: e.y })), ...st.objects.filter((o) => o.owner === u.uid).map((o) => ({ x: o.x, y: o.y }))];
  if (def.id === 'createEcho') {
    const id = chosenEcho(b, u);
    const obj = id ? OBJECT_BY_ID[id] : undefined;
    return tilesInRange(b, u, 1, summonRange(b), u.size).filter((p) => !unitAt(b, p.x, p.y) && (obj
      ? !['wall', 'fort'].includes(b.tiles[keyOf(b, p.x, p.y)]) && !st.objects.some((o) => o.x === p.x && o.y === p.y)
      : anchorCost(b, { ...u, size: 1, micro: undefined, buffs: [], gear: {} } as Unit, p.x, p.y) < INF));
  }
  return [];
}

export function eoTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  const d = (e: Unit) => unitDist(u, e);
  switch (def.id) {
    case 'eoBind': return b.units.filter((e) => e !== u && d(e) <= 3 && !(e.isBoss && !has(e, 'floatingCore') && !has(e, 'protectiveBubble') && !has(e, 'desertBurrower')));
    case 'eoReverseBond': return b.units.filter((e) => e !== u && d(e) <= 6 && d(e) > 1);
    case 'triBond': return alliesOf(b, u).filter((a) => d(a) <= 3);
    case 'riftBreaker': return foesOf(b, u).filter((e) => d(e) === 1);
    case 'mightInfusion': return alliesOf(b, u).filter((a) => d(a) <= 2 && (a.eoEnergy !== undefined || isAutomaton(a)));
    case 'rewindAutomaton': return alliesOf(b, u).filter((a) => d(a) <= 1 && isAutomaton(a) && a.sta < a.stats.sta);
    case 'repairAutomaton': return alliesOf(b, u).filter((a) => d(a) <= 1 && isAutomaton(a) && a.hp < a.stats.hp);
    case 'mechanicalMawAct': return foesOf(b, u).filter((e) => d(e) === 1 && !e.isBoss && e.size <= u.size && e.hp < e.stats.hp * 0.3);
  }
  return [];
}

export function eoUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isEchoesAbility(def)) return undefined;
  const st = eoState(b);
  const blocked = st.noSummon && st.noSummon.team === u.team && b.turn <= st.noSummon.until;
  switch (def.id) {
    case 'createEcho':
      if (u.eoSword) return 'Not in Swordfighter Form';
      if (isEcho(u)) return 'Echoes can\'t summon';
      if (blocked) return 'Summoning is disabled (Return to Nothing)';
      if (!chosenEcho(b, u)) return `No Echo fits (capacity ${echoUsed(b, u)}/${echoCapacity(b, u)})`;
      if (!eoTiles(b, u, def).length) return 'No room to summon';
      return null;
    case 'dismissEcho': return eoTiles(b, u, def).length ? null : 'No Echoes to dismiss';
    case 'eoBind': if (u.eoSword) return 'Not in Swordfighter Form'; return eoTargets(b, u, def).length ? null : 'Nothing within 3 to bind';
    case 'swordfighterForm':
      if (u.eoSword) return null;
      if ((u.eoEnergy ?? 0) < ENERGY_ACTIVATE) return 'Not enough Energy';
      return null;
    case 'eoRestoration':
      if (!has(u, 'powerOfCreation') && !u.weapons.some((w) => WEAPONS[w]?.eo?.includes('triRod')) && !alliesOf(b, u).some((a) => has(a, 'powerOfCreation'))) return 'Needs Tri (in the battle) or the Tri Rod';
      return tilesInRange(b, u, 0, restoreReach(u), u.size).some((p) => ['unstableRift', 'riftCorruptionSource', 'triFriend'].includes(tileAt(b, p.x, p.y) ?? '')) ? null : 'No Rift spaces within reach';
    case 'echoCreationNull': case 'echoCreationTekom': case 'bossReflection': return blocked ? 'Summoning is disabled' : null;
  }
  if (TARGET.has(def.id) && !eoTargets(b, u, def).length) return 'No target';
  return null;
}
const restoreReach = (u: Unit) => 2 + (gearTag(u, 'nullsEmbrace') ? 1 : 0);

export function eoCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  let m = 1;
  if (b && def.mp && u.team === 'player' && b.units.some((a) => a !== u && a.team === u.team && has(a, 'strategicWisdom') && unitDist(u, a) <= 2)) m *= 0.85;
  if (def.id === 'bossReflection' && u.team === 'player' && b?.bonus === 'voidReflection') m *= 0.75;
  return m;
}

export interface EOOutcome {
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

/** Damage from an Echoes ability or object (kills land in `fallen`, Echoes don't). */
function hurt(b: Battle, by: Unit, t: Unit, dmg: number, out: EOOutcome, flat = false) {
  if (!flat) dmg = Math.floor(dmg * eoMultiplier(b, by, t, false, WEAPONS[by.weapons[0]]));
  dmg = Math.min(t.hp, Math.max(0, Math.floor(dmg)));
  t.hp -= dmg;
  const killed = t.hp <= 0;
  out.hits.push({ uid: t.uid, dmg, hp: t.hp, killed, statuses: [] });
  if (dmg > 0) eoAfterHit(b, by, t, dmg, WEAPONS[by.weapons[0]]);
  if (killed) {
    by.kills++;
    eoOnKill(b, by, t);
    b.units = b.units.filter((x) => x !== t);
    if (!t.summoned) b.fallen.push(t);
    b.log.push(`${by.name} defeated ${t.name}.`);
  }
}

/** Monsters a hostile summoner (Null, Tekom, a Corruption Source) can copy. */
function hostilePool(b: Battle): string[] {
  const st = eoState(b);
  const known = st.known.filter((id) => isEchoEligible(id));
  const base = ['moblin', 'darknut', 'lizalfos', 'ignizol', 'tornando', 'strandtula', 'keese', 'octorok', 'lynel'].filter((id) => ENEMIES[id]);
  return [...new Set([...base, ...known])];
}

export function castEchoes(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): EOOutcome | null {
  if (!isEchoesAbility(def)) return null;
  const out: EOOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const st = eoState(b);
  const es = effectiveStats(u);
  switch (def.id) {
    case 'createEcho': {
      const id = chosenEcho(b, u);
      if (!id || !at) return null;
      if (OBJECT_BY_ID[id]) placeObject(b, u, id, at, out);
      else {
        const e = summonEcho(b, u, id, rng, at);
        if (!e) return null;
        out.lines.push(`${u.name} creates an Echo: ${e.name} (capacity ${echoUsed(b, u)}/${echoCapacity(b, u)}).`);
        copySummon(b, u, id, rng, out);
      }
      u.buffs = u.buffs.filter((x) => x.id !== 'triBond');
      return out;
    }
    case 'dismissEcho': {
      const e = b.units.find((x) => x.eoBy === u.uid && x.x === at?.x && x.y === at?.y);
      if (e) { b.units = b.units.filter((x) => x !== e); out.lines.push(`${u.name} dismisses ${e.name}.`); return out; }
      const o = st.objects.find((x) => x.owner === u.uid && x.x === at?.x && x.y === at?.y);
      if (!o) return null;
      removeObject(b, o);
      out.lines.push(`${u.name} dismisses the Echo ${OBJECT_BY_ID[o.id]?.name ?? ''}.`);
      return out;
    }
    case 'eoBind': {
      const t = target!;
      const ts = effectiveStats(t);
      const chance = gearTag(u, 'nullsEmbrace') || t.team === u.team ? 100 : Math.max(15, Math.min(100, 75 + (es.mag - ts.res) * 2 - ts.con - (t.size - 1) * 15));
      if (has(t, 'floatingCore')) { buff(t, 'eoCoreOut', 'Core extracted', 2); out.lines.push(`Weak Point Extraction: ${u.name} pulls ${t.name}'s core out of its body!`); return out; }
      if (has(t, 'protectiveBubble') && (t.eoBubble ?? 0) > 0) { t.eoBubble = 0; out.lines.push(`${u.name} binds ${t.name}'s bubble and tears it open!`); return out; }
      if (has(t, 'desertBurrower')) { buff(t, 'eoUnearthed', 'Dragged out', 2); t.buffs = t.buffs.filter((x) => x.id !== 'eoBurrowed'); out.lines.push(`${u.name} drags ${t.name} out of the sand!`); return out; }
      if (!rng.chance(chance)) { out.lines.push(`${t.name} resists the Bind (${chance}%).`); return out; }
      if (t.team !== u.team && t.gear.shield && !t.isBoss) { out.lines.push(`Shield Pull: ${u.name} tears ${t.name}'s shield away!`); t.gear = { ...t.gear, shield: undefined }; }
      if (pullToward(b, t, u, 2)) out.lines.push(`${u.name} binds ${t.name} and drags it closer.`);
      else if (!out.lines.length) out.lines.push(`${t.name} is bound, but there is nowhere to drag it.`);
      if (tilesInRange(b, u, 1, 1, u.size).some((p) => tileAt(b, p.x, p.y) === 'bindHandle')) for (const e of foesOf(b, u).filter((x) => x !== t && unitDist(u, x) <= 3)) pullToward(b, e, u, 1);
      return out;
    }
    case 'eoReverseBond': {
      const t = target!;
      const spot = tilesInRange(b, t, 1, 1, t.size).filter((p) => freeFor(b, u, p.x, p.y)).sort((p, q) => Math.abs(p.x - u.x) + Math.abs(p.y - u.y) - Math.abs(q.x - u.x) - Math.abs(q.y - u.y))[0];
      if (!spot) return null;
      out.warped = { from: { x: u.x, y: u.y }, to: { ...spot } };
      u.x = spot.x; u.y = spot.y;
      out.lines.push(`Reverse Bond: ${u.name} follows ${t.name}.`);
      return out;
    }
    case 'swordfighterForm': {
      if (u.eoSword) { revertSword(u); out.lines.push(`${u.name} leaves Swordfighter Form.`); return out; }
      u.eoEnergy = (u.eoEnergy ?? 0) - ENERGY_ACTIVATE;
      u.eoSword = true;
      const delta: Record<string, number> = {};
      for (const k of Object.keys(SWORDFIGHTER_STATS) as (keyof typeof SWORDFIGHTER_STATS)[]) delta[k] = SWORDFIGHTER_STATS[k] - SWORDFIGHTER_BASE[k];
      buff(u, 'swordfighter', 'Swordfighter Form', 999, delta);
      const sword = u.weapons.findIndex((w) => WEAPONS[w]?.eo?.includes('mighty') || WEAPONS[w]?.type === 'sword');
      if (sword > 0) u.weapons.unshift(...u.weapons.splice(sword, 1));
      out.buffed.push(u.uid);
      out.lines.push(`${u.name} takes Swordfighter Form! (Energy ${u.eoEnergy})`);
      return out;
    }
    case 'eoRestoration': {
      let n = 0;
      for (const p of tilesInRange(b, u, 0, restoreReach(u), u.size)) {
        const k = keyOf(b, p.x, p.y);
        if (b.tiles[k] === 'unstableRift' || b.tiles[k] === 'riftCorruptionSource') { b.tiles[k] = 'plain'; n++; }
        if (b.tiles[k] === 'triFriend') { b.tiles[k] = 'plain'; st.rescued++; out.lines.push('Tri\'s friend is free!'); }
      }
      st.repaired += n;
      out.lines.push(`Restoration: ${n} Rift space${n === 1 ? '' : 's'} repaired.`);
      return out;
    }
    case 'triBond': {
      const t = target!;
      buff(t, 'triBond', 'Bond of Creation', 2, { mag: 4, res: 4 });
      out.buffed.push(t.uid);
      return out;
    }
    case 'riftBreaker': {
      const t = target!;
      const might = WEAPONS[u.weapons[0]]?.might ?? 0;
      let dmg = Math.max(0, es.str + might + 6 - effectiveStats(t).def);
      if (isRiftLike(t)) { dmg *= 2; out.lines.push('Rift Breaker: double damage!'); }
      hurt(b, u, t, dmg, out);
      return out;
    }
    case 'mightInfusion': {
      const t = target!;
      if (t.eoEnergy !== undefined) t.eoEnergy = Math.min(ENERGY_MAX + 5 * st.might, t.eoEnergy + 15);
      if (isAutomaton(t)) t.sta = Math.min(t.stats.sta, t.sta + 15);
      out.buffed.push(t.uid);
      out.lines.push(`${t.name} is charged with Might.`);
      return out;
    }
    case 'rewindAutomaton': { const t = target!; t.sta = t.stats.sta; out.lines.push(`${u.name} rewinds ${t.name}.`); return out; }
    case 'repairAutomaton': {
      const t = target!;
      const amt = Math.min(t.stats.hp - t.hp, Math.ceil(t.stats.hp * 0.4));
      t.hp += amt; out.heals.push({ uid: t.uid, amount: amt });
      return out;
    }
    case 'mechanicalMawAct': { const t = target!; hurt(b, u, t, t.hp, out, true); out.lines.push(`${u.name}'s Mechanical Maw swallows ${t.name}!`); return out; }
    case 'helmetReconstruction': { u.buffs = u.buffs.filter((x) => x.id !== 'eoHornsBroken'); u.hp = Math.min(u.stats.hp, u.hp + Math.ceil(u.stats.hp * 0.1)); out.lines.push(`${u.name} rebuilds its elemental helmet.`); return out; }
    case 'bubbleShield': { u.eoBubble = 15; out.lines.push(`${u.name} re-forms its bubble.`); return out; }
    case 'electricalSummons': {
      const id = ENEMIES.biri ? 'biri' : 'buzzBlob';
      let n = 0;
      for (let i = 0; i < 2; i++) { const e = summonEcho(b, u, id, rng, undefined, { cost: 0, pct: 1 }); if (e) { e.name = ENEMIES[id].name; n++; } }
      out.lines.push(n ? `${u.name} summons ${n} ${ENEMIES[id].name}${n > 1 ? 's' : ''}!` : 'Nothing answers.');
      return out;
    }
    case 'echoCreationNull': case 'echoCreationTekom': {
      const pool = hostilePool(b).filter((id) => echoUsed(b, u) + echoCostFor(b, u, id) <= echoCapacity(b, u));
      if (!pool.length) { out.lines.push(`${u.name} has no capacity left.`); return out; }
      const e = summonEcho(b, u, rng.pick(pool), rng);
      out.lines.push(e ? `${u.name} creates an Echo: ${e.name}!` : 'There is no room.');
      return out;
    }
    case 'bossReflection': {
      const pool = BOSS_REFLECTIONS.filter((id) => BOSSES[id] && (BOSSES[id].size ?? 1) <= 3);
      const e = pool.length ? summonEcho(b, u, rng.pick(pool), rng, undefined, { pct: 0.6, cost: 0 }) : null;
      out.lines.push(e ? `Boss Reflection: ${u.name} summons ${e.name}!` : 'The reflection finds no room.');
      return out;
    }
    case 'riftCreation': {
      const t = foesOf(b, u).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
      if (!t) return out;
      let n = 0;
      for (const p of tilesInRange(b, t, 0, 2 + (gearTag(u, 'nullsEmbrace') ? 1 : 0), t.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain' || b.tiles[k] === 'forest') { b.tiles[k] = 'unstableRift'; n++; } }
      out.lines.push(`${u.name} unmakes the ground: ${n} spaces become the Still World.`);
      return out;
    }
    case 'consumption': {
      const t = foesOf(b, u).filter((e) => unitDist(u, e) <= 3).sort((x, y) => x.hp - y.hp)[0];
      if (!t) return out;
      const before = t.hp;
      hurt(b, u, t, Math.max(0, es.mag + 10 - effectiveStats(t).res), out);
      const dealt = before - Math.max(0, t.hp);
      u.hp = Math.min(u.stats.hp, u.hp + dealt);
      if (dealt) out.heals.push({ uid: u.uid, amount: dealt });
      return out;
    }
    case 'voidRestoration': { u.eoArms = 4; out.lines.push(`${u.name}'s arms grow back.`); return out; }
    case 'returnToNothing': {
      for (const t of foesOf(b, u).filter((e) => unitDist(u, e) <= 3)) hurt(b, u, t, Math.max(0, es.mag + 6 - effectiveStats(t).res), out);
      st.noSummon = { team: u.team === 'player' ? 'enemy' : 'player', until: b.turn + 2 };
      out.lines.push('Return to Nothing! Summoning is disabled for 2 turns.');
      return out;
    }
  }
  return null;
}

// ───────────────────────── Items ─────────────────────────

export const EO_FREE_ITEMS = new Set(['refreshingSmoothie', 'energySmoothie', 'toughSmoothie', 'electroSmoothie', 'warmSmoothie', 'chillySmoothie', 'bubbleSmoothie',
  'rapidSmoothie', 'radiantSmoothie', 'twistySmoothie', 'goldenSmoothie', 'unfortunateSmoothie']);

export function useEchoesItem(b: Battle, u: Unit, id: string, at?: Pos): string | null {
  const st = eoState(b);
  const max = ENERGY_MAX + 5 * st.might;
  const healHp = (n: number) => { if (isAutomaton(u)) return 0; const a = Math.min(u.stats.hp - u.hp, n); u.hp += a; return a; };
  const other = at ? b.units.find((x) => x.team === u.team && x.x === at.x && x.y === at.y) : undefined;
  const auto = other && isAutomaton(other) ? other : isAutomaton(u) ? u : b.units.find((x) => x.team === u.team && isAutomaton(x) && unitDist(u, x) <= 1);
  switch (id) {
    case 'refreshingSmoothie': return `${u.name} drinks a Refreshing Smoothie (+${healHp(20)} HP).`;
    case 'energySmoothie': if (u.eoEnergy !== undefined) u.eoEnergy = Math.min(max, u.eoEnergy + 20); return `${u.name} drinks an Energy Smoothie (Energy ${u.eoEnergy ?? '—'}).`;
    case 'toughSmoothie': buff(u, 'eoTough', 'Tough Smoothie', 3, { def: 5 }); return `${u.name} drinks a Tough Smoothie (+5 DEF).`;
    case 'electroSmoothie': buff(u, 'eoElectro', 'Electro Smoothie', 3); return `${u.name} is insulated against lightning.`;
    case 'warmSmoothie': buff(u, 'eoWarm', 'Warm Smoothie', 3); return `${u.name} is warm against the cold.`;
    case 'chillySmoothie': buff(u, 'eoChilly', 'Chilly Smoothie', 3); return `${u.name} is cool against the heat.`;
    case 'bubbleSmoothie': buff(u, 'airPotion', 'Bubble Smoothie', 3); return `${u.name} can swim for a while.`;
    case 'rapidSmoothie': buff(u, 'eoRapid', 'Rapid Smoothie', 2, { mov: 2 }); return `${u.name} speeds up (+2 MOV).`;
    case 'radiantSmoothie': b.fog = false; for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= 5) e.hidden = false; return `${u.name} glows: the darkness lifts.`;
    case 'twistySmoothie': if (auto) { auto.sta = Math.min(auto.stats.sta, auto.sta + 25); return `${auto.name} is wound up (+25 Wind-Up Energy).`; } return 'No Automaton to wind up.';
    case 'goldenSmoothie': { const h = healHp(40); if (u.eoEnergy !== undefined) u.eoEnergy = Math.min(max, u.eoEnergy + 30); return `${u.name} drinks a Golden Smoothie (+${h} HP).`; }
    case 'unfortunateSmoothie': return `${u.name} drinks an Unfortunate Smoothie (+${healHp(3)} HP). Ugh.`;
    case 'clockworkKey': if (auto) { auto.sta = auto.stats.sta; return `The Clockwork Key rewinds ${auto.name}.`; } return 'No Automaton within reach.';
    case 'monsterStoneKit': if (auto) { const a = Math.min(auto.stats.hp - auto.hp, Math.ceil(auto.stats.hp * 0.4)); auto.hp += a; return `${auto.name} is repaired (+${a} HP).`; } return 'No Automaton within reach.';
  }
  return null;
}

/** The battle view's note for a summoner: capacity and Energy. */
export function eoUnitNote(b: Battle, u: Unit): string | null {
  const parts: string[] = [];
  if (isSummoner(u) && !isEcho(u)) parts.push(`Echoes ${echoUsed(b, u)}/${echoCapacity(b, u)}`);
  if (u.eoEnergy !== undefined) parts.push(`Energy ${u.eoEnergy}${u.eoSword ? ' (Swordfighter)' : ''}`);
  if (isAutomaton(u)) parts.push(`Wind-Up ${u.sta}/${u.stats.sta}`);
  if (u.eoArms) parts.push(`Arms ${u.eoArms}`);
  if (u.eoBubble) parts.push(`Bubble ${u.eoBubble}`);
  if (isEcho(u)) parts.push('Echo');
  void EO_WORLD;
  return parts.length ? parts.join(' · ') : null;
}
