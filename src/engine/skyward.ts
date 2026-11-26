// Skyward Sword battle rules: Skyward Strike, stamina, Timeshift fields and the
// pack's battlefield spaces, selective directional guarding, the Silent Realm,
// shields with durability, medals, the Goddess's Harp, and the personal skills,
// weapons and gear of the Skyward Sword cast. Hooks are called from battle.ts,
// combat.ts, field.ts, grid.ts, items.ts and abilities.ts (like twilight.ts).

import { ENEMIES, GEAR, ITEMS, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import { MATERIAL_DROPS, SKY_REGIONS, SKYWARD_SWORDS, SPOILS } from '../content/skyward';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF, isMagical } from './rules';
import { addStatus, hasStatus } from './status';
import { restoreForm, roomFor, transformInto } from './transform';
import { canSwim, effectiveStats, hasEffect, isMounted, makeEnemy, mountOf, moveTypeOf, unitTags } from './units';
import { disarm, pullToward, pushAway } from './windwaker';
import { dig } from './field';
import { rankOf, maxRank, supportKey } from './supports';
import type { AbilityDef, Battle, CommanderBonus, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Skyward Sword battle state. */
    ss?: SSState;
    /** This battle is a Silent Realm trial for the given region. */
    silentRealm?: string;
  }
  interface Unit {
    /** Shield durability lost, by shield id (persists between battles). */
    shieldDmg?: Record<string, number>;
    /** Extra pack slots (Adventure Pouch Upgrades). */
    packBonus?: number;
    /** Directional guard: the axis this unit guards (or, for Quadro Babas, the one open side). */
    ssGuard?: Axis;
    /** Ancient robot lying dormant until a Timeshift field (or power) wakes it. */
    ssDormant?: boolean;
    /** Silent Realm Guardians: turns left awake. */
    ssAwake?: number;
    /** Analyzed by Fi's Probability Analysis. */
    ssAnalyzed?: boolean;
    /** Ampilus Egg: turns grown. */
    ssHatch?: number;
  }
}

export type Axis = 'h' | 'v' | 'd';

export interface SSState {
  /** Active ancient-era Timeshift fields. turns < 0 = until the stone is struck again. */
  fields: { x: number; y: number; r: number; turns: number; stone?: number; revert: { k: number; was: Terrain }[] }[];
  /** Temporary terrain (water from Faron's sphere, solidified lava). */
  timers: { k: number; turns: number; revert: Terrain }[];
  /** Silent Realm trial. */
  trial?: { region: string; need: number; got: number; hidden: number[]; failed?: boolean };
  /** A Trial Gate was opened this battle. */
  trialOpened?: boolean;
  /** Crafting materials picked up (go to the quest inventory afterwards). */
  materials: string[];
  /** Rails and sockets are powered. */
  powered?: boolean;
  /** Night battle (Remlits transform). */
  night?: boolean;
  /** Template ids deployed at the start (for the Song of the Hero parts). */
  deployed?: string[];
  /** Goddess Cubes struck. */
  cubes?: number;
}

const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const tilesOf = (b: Battle, u: Unit) => footprint(u.x, u.y, u.size).map((p) => b.tiles[keyOf(b, p.x, p.y)]);
const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.templateId ?? u.bossId ?? '';
const isFlying = (u: Unit) => moveTypeOf(u) === 'flying';
const free = (b: Battle, u: Unit, x: number, y: number) =>
  inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u; });
export const ssState = (b: Battle): SSState => (b.ss ??= { fields: [], timers: [], materials: [] });
const isSS = (b: Battle) => worldDef(b.world).campaign === 'skyward';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const swordOf = (u: Unit) => WEAPONS[u.weapons[0]]?.type === 'sword';
const demonic = (u: Unit) => unitTags(u).includes('demon');
const undeadOrDemon = (u: Unit) => { const t = unitTags(u); return t.includes('demon') || t.includes('undead') || t.includes('shadow'); };
const ancient = (u: Unit) => u.race === 'ancientRobot' || unitTags(u).includes('ancient');
const guardianUnit = (u: Unit) => has(u, 'relentlessPursuit') || has(u, 'spectralPursuit');

function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}, barrier = false) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats, ...(barrier ? { barrier } : {}) });
}

function nearFree(b: Battle, who: Unit, by: Pos & { size: number }, r = 1): Pos | null {
  for (let d = 1; d <= r; d++) for (const p of tilesInRange(b, by, d, d, by.size)) if (free(b, who, p.x, p.y)) return p;
  return null;
}

/** Axis of an attack from `from` onto `to`: horizontal, vertical or diagonal. */
export function axisOf(from: Pos & { size: number }, to: Pos & { size: number }): Axis {
  const dx = (from.x + (from.size - 1) / 2) - (to.x + (to.size - 1) / 2);
  const dy = (from.y + (from.size - 1) / 2) - (to.y + (to.size - 1) / 2);
  if (Math.abs(dx) > Math.abs(dy)) return 'h';
  if (Math.abs(dy) > Math.abs(dx)) return 'v';
  return 'd';
}
const AXIS_NAME: Record<Axis, string> = { h: 'the sides', v: 'front and back', d: 'the diagonals' };

/** Units whose guard faces the nearest enemy each turn. */
const FACING = (u: Unit) => has(u, 'ironWall') || has(u, 'fourArmedCombat') || has(u, 'armoredPincers') || hasEffect(u, 'frontalShield');

function setTimed(b: Battle, x: number, y: number, t: Terrain, turns: number, allowUnit = false) {
  if (!inBounds(b, x, y)) return;
  const k = keyOf(b, x, y);
  const was = b.tiles[k];
  if (was === t || ['wall', 'fort', 'timeshiftStone', 'goddessCube', 'sealingSpike', 'powerSocket', 'windPinwheel', 'waterFruitPlant'].includes(was)) return;
  if (!allowUnit && unitAt(b, x, y)) return;
  b.tiles[k] = t;
  ssState(b).timers.push({ k, turns, revert: was });
}

// ───────────────────────── Timeshift ─────────────────────────

/** Is this space in the ancient era (an active Timeshift field, or near a carried Timeshift Orb)? */
export function inTimeshift(b: Battle, p: Pos, size = 1): boolean {
  const st = b.ss;
  if (!st) return false;
  if (st.fields.some((f) => footDist(p.x, p.y, size, f.x, f.y, 1) <= f.r)) return true;
  return b.units.some((c) => hasBuff(c, 'timeshiftOrb') && footDist(p.x, p.y, size, c.x, c.y, c.size) <= 2);
}

/** Turn the land around a point to its ancient-era state (or, if active there, back). */
export function toggleTimeshift(b: Battle, at: Pos, r: number, turns = -1, stone?: number): 'on' | 'off' {
  const st = ssState(b);
  const cur = st.fields.find((f) => (stone !== undefined && f.stone === stone) || (f.x === at.x && f.y === at.y));
  if (cur) { endField(b, cur); return 'off'; }
  const revert: { k: number; was: Terrain }[] = [];
  for (const p of [at, ...tilesInRange(b, at, 1, r)]) {
    const k = keyOf(b, p.x, p.y);
    const t = b.tiles[k];
    // Dried waterways flow again; dead ground turns green; machinery works.
    if (t === 'driedWaterway' && !unitAt(b, p.x, p.y)) { revert.push({ k, was: t }); b.tiles[k] = 'water'; }
    else if (t === 'plain' || t === 'sandPile') { revert.push({ k, was: t }); b.tiles[k] = 'timeshiftField'; }
  }
  st.fields.push({ x: at.x, y: at.y, r, turns, stone, revert });
  if (b.tiles.some((t, i) => t === 'powerSocket' && footDist(i % b.width, Math.floor(i / b.width), 1, at.x, at.y, 1) <= r)) st.powered = true;
  for (const u of b.units) if (u.ssDormant && inTimeshift(b, u, u.size)) u.ssDormant = false;
  return 'on';
}

function endField(b: Battle, f: SSState['fields'][number]) {
  const st = ssState(b);
  for (const { k, was } of f.revert) if (b.tiles[k] === 'timeshiftField' || b.tiles[k] === 'water') b.tiles[k] = was;
  st.fields = st.fields.filter((x) => x !== f);
}

// ───────────────────────── Movement ─────────────────────────

/** Skyward Sword movement exceptions (called from grid.ts). */
export function ssTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  const flying = isFlying(u);
  // The sky: only flyers cross the open sky (even swimmers fall).
  if (t === 'water' && !flying && SKY_REGIONS.includes(b.world)) return INF;
  switch (t) {
    case 'ancientRail': if (b.ss?.powered || hasBuff(u, 'minecart')) c = 1; break;
    case 'sandPile': if (u.race === 'mogma' || hasEffect(u, 'sandWalker') || has(u, 'sandAmbush')) c = 1; break;
    case 'driedWaterway': if (has(u, 'sandAmbush')) c = 1; break;
    case 'wall': if (has(u, 'spectralPursuit') || has(u, 'climbingHorror')) c = 2; break;
    case 'mountain': if (has(u, 'climbingHorror')) c = Math.min(c, 1); break;
  }
  if (c < INF && has(u, 'unstoppableAscension')) c = 1;
  return c;
}

// ───────────────────────── Battlefield setup ─────────────────────────

const FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  skyloft: { skyIslandEdge: 4, goddessCube: 1, trialGate: 1, windPinwheel: 1 },
  theSky: { skyIslandEdge: 6, goddessCube: 2, windPinwheel: 1 },
  faronWoodsSS: { goddessCube: 1, trialGate: 1, windPinwheel: 1, waterFruitPlant: 0 },
  eldinVolcano: { burrowingTunnel: 3, waterFruitPlant: 2, goddessCube: 1, trialGate: 1, sandPile: 1 },
  lanayruDesert: { timeshiftStone: 2, sandPile: 3, timeshiftOrb: 1, trialGate: 1, goddessCube: 1, powerSocket: 1 },
  lanayruSandSea: { timeshiftStone: 1, timeshiftOrb: 1, sandPile: 2, goddessCube: 1 },
  ancientCistern: { goddessCube: 1, windPinwheel: 1 },
  fireSanctuary: { burrowingTunnel: 3, waterFruitPlant: 3, goddessCube: 1 },
  sealedGrounds: { sealingSpike: 2, goddessCube: 1 },
  skyKeep: { timeshiftStone: 1, windPinwheel: 2, goddessCube: 1, burrowingTunnel: 2, waterFruitPlant: 1, skyIslandEdge: 2 },
  demonsRealm: {},
};
const OBSTACLES = new Set<Terrain>(['timeshiftStone', 'waterFruitPlant', 'windPinwheel', 'goddessCube', 'sealingSpike', 'powerSocket']);
/** Ancient machines that can lie dormant in the present. */
const DORMANT_KINDS = ['technoblin', 'sentrobe', 'ampilus', 'beamos'];

export function decorateSkyward(b: Battle, rng: RNG) {
  const st = ssState(b);
  // Armor layers (Koloktos Golden Armor) work in every campaign.
  for (const u of b.units) if (hasEffect(u, 'armorLayers') && u.layers === undefined) u.layers = 3;
  if (b.silentRealm) { setupSilentRealm(b, rng); return; }
  if (!isSS(b)) return;
  st.night = rng.chance(['skyloft', 'theSky'].includes(b.world) ? 35 : 20);
  const feats = FEATURES[b.world] ?? {};
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains: number[] = [];
  for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i] === 'plain' && !occupied.has(i)) plains.push(i);
  const pool = rng.shuffle(plains);
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    for (let j = 0, tries = 0; j < n && pool.length && tries < 40; j++, tries++) {
      const k = pool.pop()!;
      const x = k % b.width;
      if (OBSTACLES.has(t) && (x < 3 || x > b.width - 3)) { j--; continue; }
      b.tiles[k] = t;
    }
  }
  // The Lanayru regions: an ancient rail across the middle, dried waterways, a minecart.
  if (b.world === 'lanayruDesert' || b.world === 'skyKeep') {
    const y = Math.floor(b.height / 2) + (rng.chance(50) ? 1 : -1);
    let first = -1;
    for (let x = 3; x < b.width - 3; x++) {
      const k = keyOf(b, x, y);
      if (b.tiles[k] === 'plain' && !occupied.has(k)) { b.tiles[k] = 'ancientRail'; if (first < 0) first = k; }
    }
    if (first >= 0) b.tiles[first] = 'minecart';
  }
  if (b.world === 'lanayruDesert' || b.world === 'lanayruSandSea') {
    const x0 = rng.int(4, Math.max(4, b.width - 5));
    for (let y = 0; y < b.height; y++) {
      const k = keyOf(b, x0, y);
      if ((b.tiles[k] === 'plain' || b.tiles[k] === 'mountain') && !occupied.has(k)) b.tiles[k] = 'driedWaterway';
    }
  }
  const stones = b.tiles.some((t) => t === 'timeshiftStone');
  for (const u of b.units) {
    if (u.team !== 'enemy') continue;
    // Technoblin remains and dormant robots wait for the past to return.
    if (stones && DORMANT_KINDS.includes(u.artId ?? '') && !u.isBoss && rng.chance(35)) u.ssDormant = true;
    if (has(u, 'sandAmbush')) u.hidden = true;
  }
}

/** Battle start: group supports, Fi's analysis, Gorko's knowledge, dormant hatchlings. */
export function skywardBattleStart(b: Battle, rng: RNG) {
  const st = ssState(b);
  st.deployed = b.units.filter((u) => u.team === 'player' && !u.npc).map(tid);
  // A Power Generator keeps the ancient rails and sockets running; a Timeshift Stone travels with the Commander.
  if (b.owned?.includes('powerGenerator')) st.powered = true;
  const cmd = b.units.find((u) => u.isCommander);
  if (cmd && b.owned?.includes('timeshiftStoneItem') && isSS(b)) buff(cmd, 'timeshiftOrb', 'Timeshift Stone', 99);
  for (const u of b.units) {
    if (has(u, 'alternatingMaw')) u.ssGuard = rng.chance(50) ? 'h' : 'v';
    if (FACING(u) || has(u, 'predictiveGuard')) u.ssGuard = faceNearest(b, u);
    if (has(u, 'ancientKnowledge') && u.team === 'player') {
      for (const t of b.traps ?? []) t.hidden = false;
      const spots = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !unitAt(b, i % b.width, Math.floor(i / b.width)) && i % b.width >= 3 ? i : -1)).filter((i) => i >= 0));
      if (spots.length) b.tiles[spots[0]] = 'goddessCube';
    }
  }
}

function faceNearest(b: Battle, u: Unit): Axis | undefined {
  const foes = b.units.filter((e) => e.team !== u.team && !e.captive);
  if (!foes.length) return u.ssGuard;
  const near = foes.sort((a, c) => unitDist(u, a) - unitDist(u, c))[0];
  return axisOf(near, u);
}

// ───────────────────────── The Silent Realm ─────────────────────────

const TRIAL_TEARS = 6;
export const TRIAL_TURNS = 14;

function setupSilentRealm(b: Battle, rng: RNG) {
  const st = ssState(b);
  // Only the trial's spirits remain: Watchers and dormant Guardians.
  b.units = b.units.filter((u) => u.team === 'player' && !u.npc);
  b.sideQuest = undefined;
  b.fog = false;
  b.traps = [];
  for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i] === 'lava' || b.tiles[i] === 'fort') b.tiles[i] = 'plain';
  const open = () => rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !unitAt(b, i % b.width, Math.floor(i / b.width)) && i % b.width >= 4 ? i : -1)).filter((i) => i >= 0));
  const spots = open();
  const tears: number[] = [];
  for (const k of spots) {
    if (tears.length >= TRIAL_TEARS) break;
    const p = { x: k % b.width, y: Math.floor(k / b.width) };
    if (tears.every((o) => Math.abs(o % b.width - p.x) + Math.abs(Math.floor(o / b.width) - p.y) >= 3)) tears.push(k);
  }
  const hidden = tears.slice(0, 2);
  for (const k of tears.slice(2)) b.tiles[k] = 'sacredTear';
  const rest = spots.filter((k) => !tears.includes(k));
  for (const k of rest.splice(0, 2)) b.tiles[k] = 'lightFruit';
  for (const k of rest.splice(0, 3)) b.tiles[k] = 'wakingWater';
  const level = Math.max(1, b.enemyLevel);
  const spawn = (id: string, k: number | undefined) => {
    if (k === undefined) return;
    const a = ENEMIES[id];
    if (!a) return;
    const e = makeEnemy(a, b.world, level, `e${b.uidCounter++}`, rng);
    const p = { x: k % b.width, y: Math.floor(k / b.width) };
    const spot = free(b, e, p.x, p.y) ? p : nearFree(b, e, { ...p, size: 1 }, 3);
    if (!spot) return;
    Object.assign(e, { x: spot.x, y: spot.y, ai: id === 'watcher' ? 'guard' : 'aggressive', ssAwake: 0 });
    b.units.push(e);
  };
  const far = rest.filter((k) => k % b.width >= Math.floor(b.width / 2));
  for (let i = 0; i < 3; i++) spawn('watcher', rest[i]);
  spawn('earthGuardian', far[1] ?? rest[6]);
  spawn('earthGuardian', far[4] ?? rest[7]);
  spawn('skyGuardian', far[7] ?? rest[8]);
  st.trial = { region: b.silentRealm!, need: TRIAL_TEARS - 1, got: 0, hidden };
  b.objective = { type: 'trial', need: TRIAL_TEARS - 1, turns: TRIAL_TURNS };
  b.rewardRupees = Math.round(b.rewardRupees * 0.6);
  b.log.push('The Silent Realm: gather the Sacred Tears. You cannot fight here — if a Guardian touches you, the trial is over.');
}

/** Wake (or pacify) every Guardian on the field. */
function wakeGuardians(b: Battle, turns: number) {
  for (const g of b.units) if (guardianUnit(g) && g.team === 'enemy') g.ssAwake = turns;
}

/** Trial result (called from checkResult). */
export function trialResult(b: Battle): 'won' | 'lost' | undefined {
  const t = b.ss?.trial;
  if (!t || b.objective.type !== 'trial') return undefined;
  if (t.got >= t.need) return 'won';
  if (t.failed || b.turn > (b.objective.turns ?? TRIAL_TURNS)) { t.failed = true; b.retreat = true; return 'lost'; }
  return undefined;
}

// ───────────────────────── Start of phase ─────────────────────────

export interface SSEvent { uid: string; heal: number; damage: number; source: string }

export function ssStartPhase(b: Battle, u: Unit, events: SSEvent[]) {
  const st = b.ss;
  const rng = new RNG(b.rngState);
  const here = tilesOf(b, u);
  const mine = b.units.filter((a) => a.team === u.team);
  const foes = b.units.filter((e) => e.team !== u.team && !e.captive);
  const heal = (amt: number, source: string) => {
    amt = Math.min(u.stats.hp - u.hp, Math.max(0, Math.ceil(amt)));
    if (amt > 0) { u.hp += amt; events.push({ uid: u.uid, heal: amt, damage: 0, source }); }
  };
  const hurt = (who: Unit, amt: number, source: string) => {
    amt = Math.min(who.hp - 1, Math.max(0, Math.ceil(amt)));
    if (amt > 0) { who.hp -= amt; events.push({ uid: who.uid, heal: 0, damage: amt, source }); }
  };
  // ── Timers (once per round, on the player's phase) ──
  if (st && u.team === 'player' && u === mine[0]) {
    for (const t of st.timers) if (--t.turns <= 0) b.tiles[t.k] = t.revert;
    st.timers = st.timers.filter((t) => t.turns > 0);
    for (const f of [...st.fields]) if (f.turns > 0 && --f.turns === 0) endField(b, f);
  }
  // ── Dormant machines and the Silent Realm's spirits ──
  if (u.ssDormant) {
    if (inTimeshift(b, u, u.size)) { u.ssDormant = false; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'reactivates in the ancient era' }); }
    else { u.moved = u.acted = true; return; }
  }
  if (st?.trial && guardianUnit(u) && u.team === 'enemy') {
    if ((u.ssAwake ?? 0) > 0 || b.turn > 10) { u.ssAwake = Math.max(0, (u.ssAwake ?? 0) - 1); buff(u, 'pursuit', 'Relentless Pursuit', 1, { mov: 3 }); }
    else { u.moved = u.acted = true; }
  }
  if (has(u, 'intruderAlert')) {
    const seen = foes.filter((e) => unitDist(u, e) <= 3);
    for (const e of seen) { e.statuses = e.statuses.filter((s) => s.kind !== 'veiled'); e.hidden = false; }
    if (seen.length && b.units.some((g) => g.team === u.team && guardianUnit(g))) {
      wakeGuardians(b, 3);
      events.push({ uid: u.uid, heal: 0, damage: 0, source: 'spots an intruder! The Guardians wake' });
    }
  }
  if ((has(u, 'relentlessPursuit') || has(u, 'spectralPursuit')) && !st?.trial && foes.some((e) => hasBuff(e, 'guardianMark'))) buff(u, 'pursuit', 'Relentless Pursuit', 1, { mov: 3 });
  // ── Directional guards ──
  if (FACING(u) || (has(u, 'predictiveGuard') && !u.ssGuard)) u.ssGuard = faceNearest(b, u);
  // ── Growth and hatching ──
  if (has(u, 'rapidMaturation')) {
    u.ssHatch = (u.ssHatch ?? 0) + 1;
    if (u.ssHatch >= 4 && TEMPLATES.ampilus && roomFor(b, u, 1)) {
      transformInto(b, u, 'ampilus');
      u.artId = 'ampilus';
      u.moved = u.acted = true;
      events.push({ uid: u.uid, heal: 0, damage: 0, source: 'hatches into an Ampilus!' });
    }
  }
  // ── Terrain ──
  if (here.includes('lava') && (has(u, 'moltenBody') || hasEffect(u, 'moltenCore') || hasBuff(u, 'magmanosCore'))) heal(u.stats.hp * 0.2, 'Molten Body');
  if (here.includes('minecart') || (here.includes('ancientRail') && st?.powered)) buff(u, 'minecart', 'Minecart', 1, { mov: 4 });
  if (here.includes('water') && hasEffect(u, 'fastSwim')) buff(u, 'fastSwim', 'Water Dragon\'s Scale', 1, { mov: 1 });
  if ((here.includes('mountain') || here.includes('skyIslandEdge')) && hasEffect(u, 'sailcloth') && !isFlying(u)) buff(u, 'glide', 'Sailcloth Glide', 1, {});
  if (here.includes('skyIslandEdge') && isMounted(u) && mountOf(u)?.effects?.includes('flight')) buff(u, 'takeoff', 'Take-off', 1, { mov: 2 });
  if (isFlying(u) && isMounted(u) && hasEffect(u, 'skyBoots')) buff(u, 'skyBoots', 'Sky Knight Boots', 1, { mov: 2 });
  // The Imprisoned is held by a Sealing Spike nearby.
  if ((has(u, 'unstoppableAscension') || has(u, 'climbingHorror') || has(u, 'brokenSeal'))) {
    const spike = b.tiles.findIndex((t, i) => t === 'sealingSpike' && footDist(i % b.width, Math.floor(i / b.width), 1, u.x, u.y, u.size) <= 2);
    if (spike >= 0) {
      u.statuses = u.statuses.filter((s) => s.kind !== 'root');
      u.statuses.push({ kind: 'root', turns: 1 });
      b.tiles[spike] = 'plain';
      events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is pinned by a Sealing Spike' });
    }
  }
  if (has(u, 'unstoppableAscension')) u.statuses = u.statuses.filter((x) => !['stun', 'freeze', 'sleep'].includes(x.kind));
  // ── Sacred shields mend ──
  const sh = u.gear.shield;
  if (sh && GEAR[sh]?.shieldFamily === 'sacred' && (u.shieldDmg?.[sh] ?? 0) > 0) u.shieldDmg = { ...u.shieldDmg, [sh]: Math.max(0, (u.shieldDmg![sh] ?? 0) - 5) };
  // ── Personal skills ──
  if (has(u, 'missileNetwork') && b.turn % 2 === 0) {
    const t = foes.filter((e) => unitDist(u, e) <= 5).sort((a, c) => unitDist(u, a) - unitDist(u, c))[0];
    if (t) hurt(t, 6, `${u.name}'s missile`);
  }
  if (has(u, 'tentacleDominion')) {
    for (const e of foes) {
      if (unitDist(u, e) > 4) continue;
      const wet = footprint(e.x, e.y, e.size).some((p) => [p, ...tilesInRange(b, p, 1, 1)].some((q) => tileAt(b, q.x, q.y) === 'water'));
      if (wet) { hurt(e, 6, 'Tentalus\'s tentacles'); addStatus(e, 'root', 1); }
    }
  }
  if (has(u, 'probabilityAnalysis')) for (const e of foes) if (unitDist(u, e) <= 5) { e.ssAnalyzed = true; e.hidden = false; }
  if (hasEffect(u, 'fiCrystal') || hasEffect(u, 'markedSight')) for (const e of foes) if (e.hidden && unitDist(u, e) <= (hasEffect(u, 'markedSight') ? 6 : 5)) e.hidden = false;
  if (hasEffect(u, 'ancientEye')) for (const e of foes) if (e.hidden && unitDist(u, e) <= 6 && (has(e, 'sandAmbush') || has(e, 'hiddenBeneath') || has(e, 'sandBurrow'))) e.hidden = false;
  if (has(u, 'ancientThunder') && st) st.powered = true;
  if (has(u, 'nightTransformation') && st?.night && u.team === 'enemy') u.ai = 'aggressive';
  if (b.bonus === 'demonKingsDominion' && u.team === 'player' && demonic(u)) u.statuses = u.statuses.filter((s) => s.kind !== 'fear');
  // ── Group supports ──
  const groups = u.team === 'player' ? b.groupSupports ?? [] : [];
  if (groups.includes('firstKnights') && ['heroOfTheSky', 'groose', 'pipit', 'karane'].includes(tid(u))) u.sta = Math.min(u.stats.sta, u.sta + 1);
  // ── Auras from allies ──
  for (const a of mine) {
    if (a === u) continue;
    const d = unitDist(a, u);
    if (has(a, 'guardianOfTheSkies') && d <= 3 && isFlying(u)) u.sta = Math.min(u.stats.sta, u.sta + 3);
    if (has(a, 'naturalCamouflage') && d <= 2 && u.size < a.size && here.includes('forest')) addStatus(u, 'veiled', 1);
    if (has(a, 'ancientNavigation') && d <= 4 && unitTags(u).includes('vessel')) buff(u, 'navigation', 'Ancient Navigation', 1, { mov: 2 });
  }
  b.rngState = rng.state;
}

// ───────────────────────── Combat hooks ─────────────────────────

export interface SSMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

/** Situational bonuses from Skyward Sword skills, gear and spaces. */
export function ssMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): SSMods {
  const m: SSMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const allies = b.units.filter((a) => a !== u && a.team === u.team);
  const dist = unitDist(u, foe, pos);
  const near = (a: Unit, r: number) => unitDist(a, u, pos) <= r;
  const tile = tileAt(b, pos.x, pos.y);
  const flying = isFlying(u);
  if (ancient(u) && inTimeshift(b, pos, u.size)) { m.def += 3; m.res += 3; }
  if (has(u, 'nightTransformation') && b.ss?.night) m.str += 4;
  if (has(u, 'shelteredFlame')) {
    const walls = tilesInRange(b, pos, 1, 1, u.size).filter((p) => ['wall', 'mountain', 'cracked'].includes(tileAt(b, p.x, p.y) ?? '')).length;
    if (tile === 'fort' || tile === 'forest' || tile === 'mountain' || walls >= 2) m.def += 8;
  }
  const lost = 1 - u.hp / Math.max(1, u.stats.hp);
  if (has(u, 'eternalHatred')) { const n = Math.floor(lost * 4 + 1e-9); m.str += 2 * n; m.mag += 2 * n; }
  if (hasEffect(u, 'demisesFlame')) m.str += Math.min(6, Math.floor(lost * 10 + 1e-9));
  if (has(u, 'karanesDetermination') && allies.some((a) => near(a, 3) && a.hp < a.stats.hp && rankOf(b.supports?.[supportKey(u.uid, a.uid)] ?? 0, maxRank(u, a)) !== '')) { m.str += 3; m.spd += 3; }
  if (has(u, 'groosenatorSkill') && w?.type === 'siege') { m.dmg += 5; m.hit += 20; }
  if (w?.flightHit && flying && isMounted(u)) m.hit += w.flightHit;
  if (hasEffect(u, 'knightsUniform') && flying && isMounted(u)) m.skl += 2;
  if (mountOf(u)?.id === 'crimsonLoftwingMount' && isMounted(u) && tid(u) === 'heroOfTheSky') m.hit += 10;
  if (hasEffect(u, 'ancientGrip') && (w?.type === 'siege' || w?.element === 'lightning')) { m.hit += 15; m.dmg += 2; }
  if (hasEffect(u, 'fireBlessing') && (w?.element === 'fire')) m.dmg += 5;
  if (hasEffect(u, 'crimsonFeather') && flying) m.avoid += 15;
  if (hasEffect(u, 'silentVestments') && !b.units.some((e) => e.team !== u.team && unitDist(e, u, pos) <= 1)) m.avoid += 20;
  if (hasEffect(u, 'bugNet') && !initiating && dist >= 2) m.avoid += hasEffect(u, 'bigBugNet') ? 25 : 15;
  if (w?.noWeightPenalty) m.spd += Math.max(0, w.weight - effectiveStats(u).con);
  else if (w && hasEffect(u, 'multiWeapon')) m.spd += Math.floor(Math.max(0, w.weight - effectiveStats(u).con) / 2);
  if (hasBuff(u, 'swordCommunion') && w?.type === 'sword') { m.dmg += 3; m.hit += 15; }
  if (hasBuff(u, 'divineDance')) m.avoid += 15;
  if (hasBuff(u, 'lightningSword') && w?.type === 'sword') m.dmg += 4;
  if (hasEffect(u, 'frontalShield') && !initiating && u.ssGuard && axisOf({ ...foe }, { ...u, ...pos }) === u.ssGuard) m.def += 9;
  // Consecutive attacks on one target (Beamos, Scervo).
  const stacks = Math.min(3, u.turnUses?.[`track:${foe.uid}`] ?? 0);
  if (initiating && stacks && has(u, 'trackingBeam')) { m.hit += 10 * stacks; m.dmg += 2 * stacks; }
  if (initiating && stacks && has(u, 'relentlessDuelist')) m.dmg += 2 * stacks;
  // Marks and analysis
  if (foe.ssAnalyzed && allies.some((a) => has(a, 'probabilityAnalysis'))) m.hit += 15;
  if (hasEffect(u, 'fiCrystal') && (foe.isBoss || foe.ssAnalyzed)) m.hit += 15;
  if (hasBuff(foe, 'guardianMark')) m.hit += guardianUnit(u) ? 20 : 10;
  // Seed Satchels: more ammunition for slingshots.
  if (w?.type === 'sling' && u.team === 'player') m.dmg += (['seedSatchel', 'mediumSeedSatchel', 'largeSeedSatchel'] as const).filter((q) => b.owned?.includes(q)).length;
  // Commander bonus
  if (u.team === 'player' && b.bonus === 'demonKingsDominion' && demonic(u)) { m.str += 3; m.mag += 3; }
  // Auras
  for (const a of allies) {
    if (has(a, 'headmaster') && near(a, 2) && swordOf(u)) m.skl += 3;
    if (has(a, 'modelKnight') && near(a, 1) && moveTypeOf(u) === 'foot') { m.hit += 10; m.avoid += 10; }
    if (has(a, 'goddessReborn') && near(a, 2) && demonic(foe)) m.res += 4;
    if (has(a, 'ancientNavigation') && w?.type === 'siege') m.hit += 10;
    if (has(a, 'guardianOfTheSkies') && near(a, 3) && flying) m.res += 3;
    if (has(a, 'floodbringer') && near(a, 3) && canSwim(u)) { m.str += 2; m.def += 2; }
    if (tid(a) === 'fi' && near(a, 3) && SKYWARD_SWORDS.includes(u.weapons[0])) m.hit += 5;
  }
  return m;
}

/** Defense and hit tweaks in the forecast (techniques, piercing, extra attacks). */
export function ssSideAdjust(b: Battle, atk: Unit, def: Unit, w: WeaponDef, arrow: AbilityDef | undefined, defense: number, magical: boolean, initiating: boolean): { defense: number; hit: number; extraAttack: boolean } {
  const out = { defense, hit: 0, extraAttack: false };
  if (arrow?.id === 'demonBlade') out.defense = Math.floor(defense * 0.75);
  if (arrow?.id === 'fatalBlow' && knockedDown(def)) out.hit += 30;
  if (arrow?.id === 'executionersStrike' && def.hp < def.stats.hp / 2) out.hit += 20;
  if (atk.team === 'player' && magical && (b.groupSupports ?? []).includes('demonAndBlade') && ['demise', 'ghirahim'].includes(tid(atk)) && (w.element === 'dark')) out.defense = Math.floor(out.defense * 0.8);
  if (initiating && has(atk, 'fourArmedCombat') && w.type === 'sword') out.extraAttack = true;
  if (initiating && hasEffect(atk, 'powerCore') && !atk.usedAbilities?.includes('powerCore')) out.extraAttack = true;
  return out;
}

const knockedDown = (u: Unit) => ['dazed', 'stun', 'freeze', 'sleep', 'root'].some((k) => hasStatus(u, k as StatusKind));

/** Damage multipliers: directional guards, metal bodies, sacred weapons, shield families, potions. */
export function ssMultiplier(b: Battle, atk: Unit, def: Unit, element: Element | undefined, magical: boolean, w: WeaponDef, dist: number, arrow?: AbilityDef): number {
  let mult = 1;
  const physical = !magical;
  // ── Selective directional combat ──
  if (def.ssGuard) {
    const axis = axisOf(atk, def);
    if (has(def, 'alternatingMaw') && axis !== def.ssGuard) mult *= 0.25;
    else if (has(def, 'ironWall') && axis === def.ssGuard) mult *= dist > 1 ? 0.25 : 0.6;
    else if ((has(def, 'fourArmedCombat') || has(def, 'armoredPincers')) && axis === def.ssGuard) mult *= 0.4;
    else if (has(def, 'predictiveGuard') && axis === def.ssGuard && physical) mult *= 0.5;
  }
  const sacred = element === 'light' || !!w.sacredMult;
  if (has(def, 'metallicBody') && physical && !sacred) mult *= 0.6;
  const sm = w.sacredMult ?? (hasBuff(atk, 'sacredFlame') ? 1.3 : 0);
  if (sm && undeadOrDemon(def)) mult *= sm;
  // ── Shield families ──
  const shield = def.gear.shield ? GEAR[def.gear.shield] : undefined;
  if (shield?.shieldFamily && !WEAPONS[def.weapons[0]]?.twoHanded && !hasEffect(def, 'cursedMedal')) {
    if (element === 'lightning') mult *= shield.shieldFamily === 'wood' ? 0.75 : shield.shieldFamily === 'iron' ? 1.25 : 1;
    if (element === 'fire' && shield.shieldFamily === 'iron') mult *= 0.75;
    if (shield.shieldFamily === 'iron' && physical && (w.twoHanded || w.type === 'hammer')) mult *= 0.85;
    if (shield.shieldFamily === 'sacred' && (element === 'dark' || unitTags(atk).includes('undead'))) mult *= 0.75;
  }
  // ── Buffs and potions ──
  if (hasBuff(def, 'divineBarrier') && magical) mult = 0;
  if (hasBuff(def, 'guardianPotion')) mult *= 0.5;
  if (hasBuff(atk, 'demonCrystal') && element === 'dark' && magical) mult *= 1.25;
  // ── Skills and weapons ──
  if (has(atk, 'volcanicAuthority') && element === 'fire') mult *= 1.2;
  if (w.fleeingBonus && (def.movedDist ?? 0) >= 3) mult *= w.fleeingBonus;
  const diving = (has(atk, 'chosenCompanion') || (hasEffect(atk, 'crimsonDive') && isMounted(atk))) && (atk.movedDist ?? 0) >= 2 && physical;
  if (diving) mult *= 1.25;
  if (arrow?.id === 'divingAttack' && (atk.movedDist ?? 0) >= 2) mult *= 1.5;
  if (arrow?.id === 'fatalBlow' && knockedDown(def)) mult *= 2;
  if (arrow?.id === 'executionersStrike' && def.hp < def.stats.hp / 2) mult *= 1.5;
  if (has(atk, 'sandAmbush') && atk.hidden) mult *= 1.5;
  // ── Commander bonuses ──
  if (atk.team === 'player') {
    if (b.bonus === 'sacredMission' && element === 'light') mult *= 1.25;
    if (b.bonus === 'groosesEngineering' && w.type === 'siege') mult *= 1.25;
  }
  return mult;
}

/** Element override: Ampilus Shell, Lightning Sword, Sacred Flame. */
export function ssElement(u: Unit, w: WeaponDef): Element | undefined {
  if (hasBuff(u, 'sacredFlame')) return 'light';
  if (hasBuff(u, 'lightningSword') && w.type === 'sword') return 'lightning';
  if ((u.turnUses?.ampilusShell ?? 0) > 0 && !isMagical(w.type)) return 'lightning';
  return undefined;
}

/** Can't attack: the Silent Realm, a stationary siege engine after moving, a staggered counter. */
export function ssCannotAttack(b: Battle, u: Unit, w: WeaponDef, initiating: boolean): boolean {
  if (b.ss?.trial && u.team === 'player') return true;
  if (w.stationary && (u.movedDist ?? 0) > 0) return true;
  if (!initiating && hasBuff(u, 'staggered')) return true;
  return false;
}

/** Extra reach (the Whip with a Tentacle Charm). */
export function ssRangeBonus(u: Unit, w: WeaponDef): number {
  return w.id === 'whip' && hasEffect(u, 'ropeGloves') ? 2 : 0;
}

/** Damage as it lands: the Silent Realm, Predictive Guard, Blade Catch, Sacred Barrier. */
export function ssOnStrike(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, rng: RNG): { dmg: number; line?: string } {
  const trial = b.ss?.trial;
  if (trial && target.team === 'player') {
    if (guardianUnit(by)) { trial.failed = true; b.result = 'lost'; b.retreat = true; return { dmg: 0, line: `A Guardian catches ${target.name}! The trial is failed.` }; }
    wakeGuardians(b, 3);
    return { dmg: 0, line: `${by.name} raises the alarm! The Guardians wake.` };
  }
  if (dmg <= 0 || !w) return { dmg };
  const melee = !isMagical(w.type) && unitDist(by, target) <= 1 && !w.magicContact;
  if (melee && hasBuff(target, 'bladeCatch')) {
    target.buffs = target.buffs.filter((x) => x.id !== 'bladeCatch');
    const ws = WEAPONS[target.weapons[0]];
    if (ws?.parryStamina) target.sta = Math.min(target.stats.sta, target.sta + ws.parryStamina);
    const lost = !hasEffect(by, 'disarmImmune') && rng.chance(40) ? disarm(b, by) : null;
    return { dmg: 0, line: `${target.name} catches the blade between two fingers!${lost ? ` ${by.name} is disarmed.` : ''}` };
  }
  if (melee && has(target, 'predictiveGuard')) {
    target.ssGuard = axisOf(by, target);
    if ((target.turnUses?.predictive ?? -1) !== b.turn) {
      (target.turnUses ??= {}).predictive = b.turn;
      if (rng.chance(50)) return { dmg: 0, line: `${target.name} predicts the strike and catches it.` };
    }
  }
  const bar = target.turnUses?.sacredBarrier ?? 0;
  if (bar > 0 && hasBuff(target, 'sacredBarrierSS')) {
    const absorb = Math.min(dmg, bar);
    target.turnUses!.sacredBarrier = bar - absorb;
    if (bar - absorb <= 0) target.buffs = target.buffs.filter((x) => x.id !== 'sacredBarrierSS');
    return { dmg: dmg - absorb, line: `${target.name}'s Sacred Barrier absorbs ${absorb}.` };
  }
  return { dmg };
}

/** A shield blocked: it loses durability, and may break. */
export function ssOnBlock(b: Battle, target: Unit, prevented: number, element: Element | undefined): string | null {
  const id = target.gear.shield;
  const def = id ? GEAR[id] : undefined;
  if (!id || !def?.durability) return null;
  const wear = Math.max(1, prevented) * (def.shieldFamily === 'wood' && element === 'fire' ? 2 : 1);
  const now = (target.shieldDmg?.[id] ?? 0) + wear;
  target.shieldDmg = { ...(target.shieldDmg ?? {}), [id]: now };
  if (now < def.durability) return null;
  delete target.gear.shield;
  const rest = { ...target.shieldDmg };
  delete rest[id];
  target.shieldDmg = rest;
  b.log.push(`${target.name}'s ${def.name} breaks!`);
  return `${target.name}'s ${def.name} breaks!`;
}

/** Shield durability left, or null for shields that never break. */
export function shieldDurability(u: Unit): { left: number; max: number } | null {
  const id = u.gear.shield;
  const def = id ? GEAR[id] : undefined;
  if (!id || !def?.durability) return null;
  return { left: Math.max(0, def.durability - (u.shieldDmg?.[id] ?? 0)), max: def.durability };
}

/** After a damaging hit lands. */
export function ssAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element: Element | undefined, _rng: RNG, arrow?: AbilityDef): string[] {
  const lines: string[] = [];
  if (!w) return lines;
  const melee = unitDist(by, target) <= 1;
  // Consecutive-attack trackers (Beamos, Scervo, Scervo's Cutlass)
  if (dmg > 0) {
    const key = `track:${target.uid}`;
    const prev = by.turnUses?.[key] ?? 0;
    by.turnUses = Object.fromEntries(Object.entries(by.turnUses ?? {}).filter(([k]) => !k.startsWith('track:')));
    by.turnUses[key] = prev + 1;
    if (w.consecutivePush && prev >= 1 && target.hp > 0) { pushAway(b, target, by, 1); lines.push(`${target.name} is driven back!`); }
  }
  if ((by.turnUses?.ampilusShell ?? 0) > 0 && !isMagical(w.type)) by.turnUses!.ampilusShell--;
  if (dmg <= 0 || target.hp <= 0) {
    if (has(by, 'alternatingMaw') && dmg > 0) by.ssGuard = by.ssGuard === 'h' ? 'v' : 'h';
    return lines;
  }
  if (has(by, 'electricWeaponry') && melee) addStatus(target, 'shock', 1);
  if (has(by, 'undyingGrasp')) { target.sta = Math.max(0, target.sta - 4); addStatus(target, 'root', 1); lines.push(`${by.name} clings to ${target.name}!`); }
  if (has(by, 'alternatingMaw')) { by.ssGuard = by.ssGuard === 'h' ? 'v' : 'h'; lines.push(`${by.name} turns its open side to ${AXIS_NAME[by.ssGuard]}.`); }
  if (has(by, 'moltenPursuit')) {
    setTimed(b, target.x, target.y, 'flames', 2, true);
    if (target.size < by.size) pushAway(b, target, by, 1);
  }
  if (has(by, 'chargedShell') && (by.movedDist ?? 0) >= 2 && target.size <= by.size) pushAway(b, target, by, 1);
  if (has(by, 'armoredPincers')) {
    addStatus(target, 'root', 1);
    const other = b.units.find((e) => e.team === target.team && e !== target && unitDist(by, e) <= 1);
    if (other) { addStatus(other, 'root', 1); lines.push(`${by.name} grapples ${target.name} and ${other.name}!`); }
  }
  if (has(by, 'parasiticAttachment') && (target.size > by.size || isFlying(target))) {
    by.hp = Math.min(by.stats.hp, by.hp + Math.floor(dmg / 2));
    buff(by, 'parasite', 'Parasitic Attachment', 2, { str: 2 });
  }
  if (has(by, 'climbingHorror')) addStatus(target, 'root', 1);
  if (arrow?.id === 'shieldBash') { addStatus(target, 'dazed', 1); buff(target, 'staggered', 'Staggered', 1); lines.push(`${target.name} is knocked off balance!`); }
  if (w.restrains && target.size < by.size) addStatus(target, 'root', 1);
  if (w.revealsWeakness) addStatus(target, 'exposed', 1);
  if (w.waterTerrain) setTimed(b, target.x, target.y, 'water', 2, true);
  if (w.displacesFlyers && isFlying(target)) pushAway(b, target, by, 2);
  if (w.displacesFlyers) for (const a of b.units) if (a.team === by.team && a !== by && isFlying(a) && unitDist(a, by) <= 2) buff(a, 'celestialWind', 'Celestial Wind', 1, { mov: 2 });
  if (hasEffect(by, 'thunderBlessing') && element === 'lightning') {
    const next = b.units.find((e) => e.team === target.team && e !== target && unitDist(e, target) <= 1 && e.hp > 1);
    if (next) { const d = Math.min(next.hp - 1, Math.max(1, Math.floor(dmg / 2))); next.hp -= d; lines.push(`Lightning arcs to ${next.name} (${d}).`); }
  }
  if (hasEffect(by, 'parasiteGem') && target.size > by.size) by.hp = Math.min(by.stats.hp, by.hp + Math.ceil(dmg / 4));
  return lines;
}

/** After combat: Koloktos's extra arms, Demon King's Slash, counters that heal or shock. */
export function ssAfterCombat(b: Battle, attacker: Unit, defender: Unit, arrowId: string | null, landed: { atk: number; def: number }): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const hit = (me: Unit, foe: Unit, d: number) => {
    if (foe.hp <= 1 || me.hp <= 0 || d <= 0) return;
    d = Math.min(foe.hp - 1, d);
    foe.hp -= d;
    out.push({ uid: foe.uid, dmg: d, hp: foe.hp, killed: false, by: me.uid });
  };
  if (hasEffect(attacker, 'powerCore') && !attacker.usedAbilities?.includes('powerCore')) (attacker.usedAbilities ??= []).push('powerCore');
  if (has(attacker, 'sixArmedArsenal') && attacker.hp > 0) {
    for (const e of b.units.filter((x) => x.team !== attacker.team && x !== defender && unitDist(attacker, x) <= 1).slice(0, 2)) hit(attacker, e, Math.ceil(effectiveStats(attacker).str / 2));
  }
  if (arrowId === 'demonKingsSlash' && landed.atk > 0) {
    for (const e of b.units.filter((x) => x.team !== attacker.team && x !== defender && unitDist(defender, x) <= 1)) hit(attacker, e, Math.floor(landed.atk / 2));
  }
  if (landed.def > 0 && defender.hp > 0) {
    const dw = WEAPONS[defender.weapons[0]];
    if (dw?.counterLightning) { hit(defender, attacker, dw.counterLightning); if (attacker.hp > 0) addStatus(attacker, 'shock', 1); }
    if (defender.team === 'player' && b.bonus === 'demonicSwordsmanship') {
      defender.hp = Math.min(defender.stats.hp, defender.hp + 3);
      defender.sta = Math.min(defender.stats.sta, defender.sta + 3);
    }
  }
  return out;
}

/** Dreadfuse's Electric Counter parries melee attacks. */
export function ssCanParry(u: Unit, w: WeaponDef | undefined, dist: number, rng: RNG): 'parry' | null {
  if (!w || u.hp <= 0 || isMagical(w.type) || dist > 1) return null;
  if (has(u, 'electricCounter') && rng.chance(40)) return 'parry';
  return null;
}

/** Side effects of a parry; returns bonus damage for the riposte. */
export function ssOnParry(u: Unit, attacker: Unit): number {
  const w = WEAPONS[u.weapons[0]];
  if (w?.parryStamina) u.sta = Math.min(u.stats.sta, u.sta + w.parryStamina);
  if (has(u, 'electricCounter')) { addStatus(attacker, 'shock', 1); return 4; }
  return 0;
}

/** Combat experience multiplier (sword proficiency). */
export function ssXpMult(b: Battle, u: Unit): number {
  let m = 1;
  const sword = swordOf(u);
  if (sword && has(u, 'chosenByTheGoddess')) m *= 1.5;
  if (hasEffect(u, 'academyCrest')) m *= 1.3;
  if (sword && u.team === 'player' && b.bonus === 'knightAcademy') m *= 1.3;
  if (sword && b.units.some((a) => a !== u && a.team === u.team && has(a, 'headmaster') && unitDist(a, u) <= 2)) m *= 1.2;
  if (sword && (b.groupSupports ?? []).includes('firstKnights') && ['heroOfTheSky', 'groose', 'pipit', 'karane'].includes(tid(u))) m *= 1.25;
  return m;
}

/** Stamina cost multiplier for techniques and Dash. */
export function ssStaminaMult(u: Unit, bonus?: CommanderBonus | string): number {
  if (hasBuff(u, 'staFree')) return 0;
  let m = 1;
  if (hasBuff(u, 'staThrift')) m *= 0.5;
  if (bonus === 'knightAcademy' && u.team === 'player' && isMounted(u) && isFlying(u)) m *= 0.8;
  return m;
}

/** Impa's Sacred Duty: she protects adjacent priestesses and divine allies. */
export function sacredDutyCovers(p: Unit, target: Unit): boolean {
  return has(p, 'sacredDuty') && unitDist(p, target) <= 1 && (unitTags(target).includes('divine') || ['zeldaSS', 'zelda', 'zeldaTP', 'zeldaWW', 'hylia', 'fi'].includes(tid(target)));
}

/** After a unit moves: Sacred Tears, Waking Water, Light Fruit, Timeshift Orbs, burning trails. */
export function ssAfterMove(b: Battle, u: Unit): string | null {
  const st = b.ss;
  const lines: string[] = [];
  for (const p of footprint(u.x, u.y, u.size)) {
    const k = keyOf(b, p.x, p.y);
    const t = b.tiles[k];
    if (u.team !== 'player' || u.npc) continue;
    if (t === 'sacredTear' && st?.trial) {
      b.tiles[k] = 'plain';
      st.trial.got++;
      wakeGuardians(b, 0);
      lines.push(`${u.name} gathers a Sacred Tear (${st.trial.got}/${st.trial.need}). The Guardians fall still.`);
    } else if (t === 'wakingWater' && st?.trial) {
      wakeGuardians(b, 4);
      lines.push(`${u.name} touches Waking Water! The Guardians rise.`);
    } else if (t === 'lightFruit') {
      b.tiles[k] = 'plain';
      for (const h of st?.trial?.hidden ?? []) if (b.tiles[h] === 'plain') b.tiles[h] = 'sacredTear';
      if (st?.trial) st.trial.hidden = [];
      for (const e of b.units) if (e.team !== u.team && e.hidden && unitDist(u, e) <= 4) e.hidden = false;
      lines.push('A Light Fruit bursts: the hidden Sacred Tears shine.');
    } else if (t === 'timeshiftOrb') {
      b.tiles[k] = 'plain';
      buff(u, 'timeshiftOrb', 'Timeshift Orb', 99);
      ssState(b);
      for (const e of b.units) if (e.ssDormant && inTimeshift(b, e, e.size)) e.ssDormant = false;
      lines.push(`${u.name} lifts a Timeshift Orb: the ancient era surrounds them.`);
    }
  }
  if (has(u, 'blazingFlight')) setTimed(b, u.x, u.y, 'flames', 2, true);
  if (hasBuff(u, 'timeshiftOrb')) for (const e of b.units) if (e.ssDormant && inTimeshift(b, e, e.size)) e.ssDormant = false;
  if (!lines.length) return null;
  b.log.push(...lines);
  return lines.join(' ');
}

/** On a kill: materials, spoils, exploding Froaks. */
export function ssOnKill(b: Battle, by: Unit, victim: Unit, rng: RNG) {
  if (victim.team !== 'enemy' || victim.summoned) {
    if (has(victim, 'volatileBody')) explode(b, victim);
    return;
  }
  const st = ssState(b);
  const id = victim.bossId ?? victim.artId ?? victim.templateId ?? '';
  const mats = MATERIAL_DROPS[id];
  const owned = b.units.filter((a) => a.team === 'player');
  const boost = (owned.some((a) => hasEffect(a, 'treasureMedal')) ? 1.5 : 1) * (owned.some((a) => hasEffect(a, 'cursedMedal')) ? 2 : 1);
  if (mats?.length && (isSS(b) || boost > 1 || rng.chance(50))) {
    const n = (victim.isBoss ? 2 : 1) * (rng.chance(Math.min(100, 45 * boost)) ? 1 : 0) + (boost >= 2 && rng.chance(40) ? 1 : 0);
    for (let i = 0; i < n; i++) st.materials.push(rng.pick(mats));
  }
  const spoil = SPOILS[id];
  if (spoil && ITEMS[spoil] && rng.chance(15)) (b.loot ??= []).push(spoil);
  if (has(victim, 'volatileBody')) explode(b, victim);
  void by;
}

function explode(b: Battle, u: Unit) {
  for (const e of b.units) if (e !== u && unitDist(e, u) <= 1 && e.hp > 1) e.hp = Math.max(1, e.hp - 6);
  b.log.push(`${u.name} explodes!`);
}

// ───────────────────────── Abilities ─────────────────────────

const SS_TILE = new Set(['shadowDash', 'rapidTeleportation', 'bombardment', 'constructEmplacement', 'dropOff', 'beetleFlight', 'diamondStep', 'throwWaterFruit']);
const SS_TARGET = new Set(['skywardStrike', 'darkSkywardStrike', 'sacredSeal', 'goddessBlessing', 'sacredBlade', 'swordCommunion', 'sacredBarrierSS', 'protectiveSeal',
  'demonDarts', 'teleportSlash', 'aerialTransport', 'whipSnatch']);
const SS_OTHER = new Set(['skywardCharge', 'dash', 'divineBarrier', 'prayerOfHylia', 'dowsing', 'divineDance', 'heavyLift', 'unexpectedCourage', 'bladeCatch',
  'demonicRestoration', 'ghirahimTrueForm', 'ghirahimSpiritForm', 'diamondBarrage', 'lightningSword', 'demonicDominion', 'wingGust', 'gustBellowsBlast', 'mogmaDig',
  'strikeTimeshiftStone', 'openTrialGate', 'balladOfTheGoddess', 'faroresCourage', 'nayrusWisdom', 'dinsPower', 'songOfTheHero', 'dragonsChorus', 'imprisonedRise', 'imprisonedAscend']);
/** Abilities still usable in the Silent Realm (no fighting). */
const TRIAL_OK = new Set(['dash', 'shadowDash', 'rapidTeleportation', 'diamondStep', 'dowsing', 'aerialTransport', 'dropOff', 'beetleFlight', 'prayerOfHylia', 'balladOfTheGoddess', 'faroresCourage', 'nayrusWisdom', 'dinsPower']);
/** Transformations a Sacred Seal blocks (every pack's). */
export const TRANSFORM_ABILITIES = new Set(['ghirahimTrueForm', 'ghirahimSpiritForm', 'imprisonedRise', 'imprisonedAscend', 'transformGanon', 'twinrovaFusion', 'wolfForm', 'humanForm', 'fusedShadowForm', 'chuFusion']);
/** Enemy transformations, used on their own when ready. */
export const SS_ENEMY_TRANSFORMS = ['imprisonedRise', 'imprisonedAscend', 'ghirahimTrueForm'];
/** Sacred abilities (Zelda's Goddess Reborn, the Goddess's Servants, Hylia's Divine Authority). */
export const SACRED_ABILITIES = new Set(['goddessBlessing', 'sacredSeal', 'divineBarrier', 'prayerOfHylia', 'sacredBlade', 'swordCommunion', 'dowsing', 'sacredBarrierSS', 'protectiveSeal',
  'balladOfTheGoddess', 'faroresCourage', 'nayrusWisdom', 'dinsPower', 'songOfTheHero', 'dragonsChorus', 'skywardStrike', 'divineDance']);

export function isSSAbility(def: AbilityDef): boolean {
  return SS_TILE.has(def.id) || SS_TARGET.has(def.id) || SS_OTHER.has(def.id);
}
export function ssNeedsTile(def: AbilityDef): boolean { return SS_TILE.has(def.id); }
export function ssNeedsTarget(def: AbilityDef): boolean { return SS_TARGET.has(def.id); }

const foesWithin = (b: Battle, u: Unit, r: number, min = 1) => b.units.filter((e) => e.team !== u.team && !e.captive && unitDist(u, e) >= min && unitDist(u, e) <= r);
const alliesWithin = (b: Battle, u: Unit, r: number) => b.units.filter((a) => a.team === u.team && a !== u && unitDist(u, a) <= r);

/** Skyward Strike: charge level and the sword's numbers. */
export function skywardInfo(u: Unit): { level: number; rate: number; bonus: number; min: number; max: number; might: number } {
  const w = WEAPONS[u.weapons.find((id) => SKYWARD_SWORDS.includes(id)) ?? ''];
  const level = Math.min(3, u.turnUses?.ssCharge ?? 0);
  const rate = w?.id === 'masterSword' ? 2 : w?.skywardRate ?? 1;
  const bonus = w?.skywardBonus ?? 0;
  const max = [0, 3, 5, 6][level] + (bonus >= 4 ? 1 : 0);
  const might = [0, 3, 6, 10][level] + Math.min(bonus, 3) + (level >= 3 && has(u, 'chosenByTheGoddess') ? 4 : 0);
  return { level, rate, bonus, min: 2, max, might };
}

function teleportReach(u: Unit, base: number) {
  return base + (hasEffect(u, 'teleportBoost') ? 2 : 0);
}

export function ssTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const out: Pos[] = [];
  const scan = (min: number, max: number, ok: (x: number, y: number) => boolean) => {
    for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) {
      const d = footDist(x, y, u.size, u.x, u.y, u.size);
      if (d >= min && d <= max && ok(x, y)) out.push({ x, y });
    }
  };
  switch (def.id) {
    case 'shadowDash': scan(1, teleportReach(u, 4), (x, y) => free(b, u, x, y)); break;
    case 'rapidTeleportation': scan(1, teleportReach(u, 3), (x, y) => free(b, u, x, y)); break;
    case 'diamondStep': scan(1, teleportReach(u, 2), (x, y) => free(b, u, x, y)); break;
    case 'bombardment': for (const p of tilesInRange(b, u, 2, 6, u.size)) out.push(p); break;
    case 'constructEmplacement': for (const p of tilesInRange(b, u, 1, 1, u.size)) if (tileAt(b, p.x, p.y) === 'plain' && !unitAt(b, p.x, p.y)) out.push(p); break;
    case 'dropOff': {
      const c = u.cargo?.[0];
      if (c) for (const p of tilesInRange(b, u, 1, 1, u.size)) if (free(b, c, p.x, p.y)) out.push(p);
      break;
    }
    case 'beetleFlight': {
      const r = hasEffect(u, 'toughBeetle') ? 10 : hasEffect(u, 'quickBeetle') ? 8 : hasEffect(u, 'hookBeetle') ? 6 : 5;
      for (const p of tilesInRange(b, u, 1, r, u.size)) out.push(p);
      break;
    }
    case 'throwWaterFruit': for (const p of tilesInRange(b, u, 1, 3, u.size)) out.push(p); break;
  }
  return out;
}

export function ssTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  switch (def.id) {
    case 'skywardStrike': { const s = skywardInfo(u); return s.level ? foesWithin(b, u, s.max, s.min) : []; }
    case 'darkSkywardStrike': return (u.turnUses?.darkCharge ?? 0) > 0 ? foesWithin(b, u, 6, 2) : [];
    case 'sacredSeal': return foesWithin(b, u, 3);
    case 'goddessBlessing': return [u, ...alliesWithin(b, u, 2)];
    case 'sacredBlade': return foesWithin(b, u, 4);
    case 'swordCommunion': return [u, ...alliesWithin(b, u, 3)].filter((a) => a.weapons.some((w) => WEAPONS[w]?.type === 'sword'));
    case 'sacredBarrierSS': return [u, ...alliesWithin(b, u, 2)];
    case 'protectiveSeal': return foesWithin(b, u, 1);
    case 'demonDarts': return foesWithin(b, u, 5, 2);
    case 'teleportSlash': return foesWithin(b, u, teleportReach(u, 5)).filter((e) => !!nearFree(b, u, e, 1));
    case 'aerialTransport': return u.cargo?.length ? [] : alliesWithin(b, u, 1).filter((a) => a.size === 1 && !a.captive && !isFlying(a) && !a.cargo?.length && a.race !== 'vessel');
    case 'whipSnatch': return foesWithin(b, u, 3 + (hasEffect(u, 'ropeGloves') ? 2 : 0));
  }
  return [];
}

const adjacentTile = (b: Battle, u: Unit, t: Terrain) => tilesInRange(b, u, 1, 1, u.size).find((p) => tileAt(b, p.x, p.y) === t);

export function ssUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (b.ss?.trial && u.team === 'player' && !TRIAL_OK.has(def.id)) return 'You can\'t fight in the Silent Realm';
  if (!isSSAbility(def)) return undefined;
  if (TRANSFORM_ABILITIES.has(def.id) && hasBuff(u, 'sacredSeal')) return 'Sealed: can\'t transform';
  if (ssNeedsTarget(def) && !ssTargets(b, u, def).length) {
    if (def.id === 'skywardStrike') return skywardInfo(u).level ? 'No enemy in range' : 'Charge it first (Raise Sword)';
    if (def.id === 'darkSkywardStrike') return (u.turnUses?.darkCharge ?? 0) > 0 ? 'No enemy in range' : 'Charge it with Lightning Sword';
    return def.id === 'aerialTransport' && u.cargo?.length ? 'Already carrying someone' : 'No one in range';
  }
  if (ssNeedsTile(def) && !ssTiles(b, u, def).length) return 'Nowhere to go';
  const enemyHp = (pct: number) => (u.team === 'enemy' && u.hp > u.stats.hp * pct ? 'Not yet' : null);
  switch (def.id) {
    case 'skywardCharge': return skywardInfo(u).level >= 3 ? 'Fully charged' : null;
    case 'dash': return u.movedDist > 0 ? 'Only before moving' : null;
    case 'unexpectedCourage': return alliesWithin(b, u, 1).some((a) => a.hp < a.stats.hp) ? null : 'No injured ally next to you';
    case 'heavyLift': return alliesWithin(b, u, 1).concat(foesWithin(b, u, 1)).some((a) => a.size < u.size + 1 && !a.isBoss) || tilesInRange(b, u, 1, 1, u.size).some((p) => ['sandPile', 'cracked', 'driedWaterway'].includes(tileAt(b, p.x, p.y) ?? '')) ? null : 'Nothing to lift';
    case 'diamondBarrage': return foesWithin(b, u, 3).length ? null : 'No enemies within 3';
    case 'ghirahimTrueForm': return TEMPLATES.ghirahimTrue && roomFor(b, u, TEMPLATES.ghirahimTrue.size) ? enemyHp(0.5) : 'Can\'t transform here';
    case 'ghirahimSpiritForm': return u.originalForm ? null : 'Already in his usual form';
    case 'imprisonedRise': return TEMPLATES.imprisonedArmed && roomFor(b, u, 5) ? enemyHp(0.6) : 'Not enough room';
    case 'imprisonedAscend': return TEMPLATES.imprisonedFlying && roomFor(b, u, 5) ? enemyHp(0.6) : 'Not enough room';
    case 'wingGust': case 'gustBellowsBlast': return null;
    case 'mogmaDig': return null;
    case 'strikeTimeshiftStone': return adjacentTile(b, u, 'timeshiftStone') ? null : 'Stand next to a Timeshift Stone';
    case 'openTrialGate': return tilesOf(b, u).includes('trialGate') ? (b.ss?.trialOpened ? 'Already opened' : null) : 'Stand on a Trial Gate';
    case 'throwWaterFruit': return adjacentTile(b, u, 'waterFruitPlant') ? null : 'Stand next to a Water Fruit Plant';
    case 'songOfTheHero': return b.owned?.includes('songOfTheHeroComplete') ? null : 'Learn all four parts first (the three Dragons and Levias)';
    case 'dragonsChorus': return (b.groupSupports ?? []).includes('heroesSong') || u.team === 'enemy' ? (foesWithin(b, u, 4).length ? null : 'No enemies within 4') : 'Needs all three Dragons and Levias on the field';
  }
  return null;
}

export interface SSOutcome {
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

/** Sacred ability strength (Hylia's Divine Authority, the Servants of Hylia). */
function sacredBoost(b: Battle, u: Unit, def: AbilityDef): number {
  if (!SACRED_ABILITIES.has(def.id)) return 1;
  let m = 1;
  if (b.units.some((a) => a.team === u.team && has(a, 'divineAuthority'))) m *= 1.25;
  if (u.team === 'player' && b.bonus === 'sacredMission') m *= 1.25;
  return m;
}

export function castSkyward(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): SSOutcome | null {
  if (!isSSAbility(def)) return null;
  const out: SSOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [] };
  const s = effectiveStats(u);
  const boost = sacredBoost(b, u, def);
  const strike = (e: Unit, dmg: number, status?: StatusKind, chance = 0) => {
    dmg = Math.min(e.hp, Math.max(0, Math.floor(dmg)));
    if (e.buffs.some((x) => x.barrier)) dmg = 0;
    e.hp -= dmg;
    const killed = e.hp <= 0;
    const statuses: StatusKind[] = [];
    if (!killed && status && rng.chance(chance)) { addStatus(e, status, 1); statuses.push(status); }
    out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses });
    if (dmg > 0) e.lastHitBy = u.uid;
    if (killed) {
      u.kills++;
      ssOnKill(b, u, e, rng);
      b.units = b.units.filter((x) => x !== e);
      if (!e.summoned) b.fallen.push(e);
      b.log.push(`${u.name} defeated ${e.name}.`);
    }
  };
  const heal = (a: Unit, amt: number) => {
    amt = Math.min(a.stats.hp - a.hp, Math.ceil(amt));
    if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); }
  };
  const phys = (e: Unit, bonus: number, pct = 1) => {
    const w = WEAPONS[u.weapons[0]];
    return Math.max(1, Math.floor((s.str + (w?.might ?? 0) + bonus - effectiveStats(e).def) * pct));
  };
  const sacredDmg = (e: Unit, base: number) => Math.max(1, Math.floor((base - effectiveStats(e).res) * (undeadOrDemon(e) ? 1.3 : 1) * boost));
  const songBuff = (r: number, id: string, name: string, stats: Record<string, number>, turns = 2) => {
    for (const a of [u, ...alliesWithin(b, u, r)]) { buff(a, id, name, turns, stats); out.buffed.push(a.uid); }
  };
  const tele = (to: Pos) => { out.warped = { from: { x: u.x, y: u.y }, to: { ...to } }; u.x = to.x; u.y = to.y; };
  switch (def.id) {
    // ── Skyward Strike ──
    case 'skywardCharge': {
      const info = skywardInfo(u);
      const lvl = Math.min(3, info.level + info.rate);
      (u.turnUses ??= {}).ssCharge = lvl;
      buff(u, 'skyCharge', `Skyward Strike charged (Lv ${lvl})`, 99);
      out.lines.push(`${u.name} raises the sword to the sky (charge ${lvl}/3).`);
      break;
    }
    case 'skywardStrike': {
      const info = skywardInfo(u);
      const sword = WEAPONS[u.weapons.find((id) => SKYWARD_SWORDS.includes(id))!];
      strike(target!, Math.max(1, Math.floor((s.str + (sword?.might ?? 0) + info.might - effectiveStats(target!).res) * (sword?.sacredMult && undeadOrDemon(target!) ? sword.sacredMult : 1) * boost)));
      // Goddess Cubes in range open a chest elsewhere.
      const cubes = b.tiles.map((t, i) => (t === 'goddessCube' && footDist(i % b.width, Math.floor(i / b.width), 1, u.x, u.y, u.size) <= info.max ? i : -1)).filter((i) => i >= 0);
      for (const k of cubes) openCube(b, k, rng, out);
      u.turnUses!.ssCharge = 0;
      u.buffs = u.buffs.filter((x) => x.id !== 'skyCharge');
      out.lines.push(`${u.name} unleashes a Skyward Strike!`);
      break;
    }
    case 'darkSkywardStrike': {
      strike(target!, Math.max(1, s.str + (WEAPONS[u.weapons[0]]?.might ?? 0) + 10 - effectiveStats(target!).res), 'shock', 50);
      u.turnUses!.darkCharge = 0;
      out.lines.push(`${u.name} hurls a slash of dark lightning!`);
      break;
    }
    case 'lightningSword':
      buff(u, 'lightningSword', 'Lightning Sword', 2);
      (u.turnUses ??= {}).darkCharge = 3;
      out.buffed.push(u.uid);
      out.lines.push('Lightning strikes the Demon King\'s blade.');
      break;
    // ── Stamina ──
    case 'dash': buff(u, 'dash', 'Dash', 1, { mov: 3 }); out.buffed.push(u.uid); out.free = true; break;
    // ── Zelda ──
    case 'goddessBlessing': {
      const t = target!;
      heal(t, (s.mag + 8) * boost);
      const before = t.statuses.length;
      t.statuses = t.statuses.filter((x) => ['regen', 'inspired', 'protected', 'haste', 'veiled'].includes(x.kind));
      if (t.statuses.length < before) out.cleansed.push(t.uid);
      break;
    }
    case 'sacredSeal': addStatus(target!, 'root', 2); buff(target!, 'sacredSeal', 'Sacred Seal', 2); out.statuses.push({ uid: target!.uid, kind: 'root' }); break;
    case 'divineBarrier': songBuff(2, 'divineBarrier', 'Divine Barrier', {}, 1); break;
    case 'prayerOfHylia':
      for (const a of [u, ...alliesWithin(b, u, 3)]) { a.mp = Math.min(a.stats.mp, a.mp + Math.round(8 * boost)); a.sta = Math.min(a.stats.sta, a.sta + 4); out.buffed.push(a.uid); }
      break;
    // ── Fi ──
    case 'dowsing': {
      const r = 6 + (u.weapons.map((id) => WEAPONS[id]?.dowsingBonus ?? 0).reduce((x, y) => Math.max(x, y), 0)) + (alliesWithin(b, u, 99).some((a) => a.weapons.includes('goddessWhiteSword')) ? 4 : 0);
      let n = 0;
      for (const e of b.units) if (e.team !== u.team && e.hidden && unitDist(u, e) <= r) { e.hidden = false; n++; }
      for (const t of b.traps ?? []) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= r) { t.hidden = false; n++; }
      const tr = b.ss?.trial;
      if (tr) { for (const h of tr.hidden) if (footDist(h % b.width, Math.floor(h / b.width), 1, u.x, u.y, u.size) <= r && b.tiles[h] === 'plain') { b.tiles[h] = 'sacredTear'; n++; } tr.hidden = tr.hidden.filter((h) => b.tiles[h] !== 'sacredTear'); }
      const cubes = b.tiles.filter((t) => t === 'goddessCube').length;
      const digs = (b.digSpots ?? []).length;
      out.lines.push(`${u.name} dowses: ${n} hidden thing${n === 1 ? '' : 's'} revealed${cubes ? `, ${cubes} Goddess Cube${cubes > 1 ? 's' : ''} on the field` : ''}${digs ? `, ${digs} dig spot${digs > 1 ? 's' : ''}` : ''}.`);
      out.free = true;
      break;
    }
    case 'divineDance': songBuff(2, 'divineDance', 'Divine Dance', { skl: 3 }); break;
    case 'sacredBlade': strike(target!, sacredDmg(target!, s.mag + 8)); break;
    case 'swordCommunion': buff(target!, 'swordCommunion', 'Sword Communion', 3); out.buffed.push(target!.uid); break;
    // ── Groose ──
    case 'bombardment': {
      const r = (b.groupSupports ?? []).includes('siegeSpecialists') ? 2 : 1;
      const mult = u.team === 'player' && b.bonus === 'groosesEngineering' ? 1.25 : 1;
      for (const e of b.units.filter((x) => x.team !== u.team && footDist(at!.x, at!.y, 1, x.x, x.y, x.size) <= r)) strike(e, (s.str + 8 - effectiveStats(e).def) * mult);
      for (const p of [at!, ...tilesInRange(b, at!, 1, r)]) if (tileAt(b, p.x, p.y) === 'cracked' || tileAt(b, p.x, p.y) === 'sandPile') b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      out.lines.push('KABOOM!');
      break;
    }
    case 'constructEmplacement': b.tiles[keyOf(b, at!.x, at!.y)] = 'cannonEmplacement'; out.lines.push('An artillery platform goes up.'); break;
    case 'heavyLift': {
      for (const a of b.units.filter((x) => x !== u && unitDist(u, x) === 1 && x.size <= u.size && !x.isBoss)) { pushAway(b, a, u, 2); if (a.team !== u.team) strike(a, Math.floor(s.str / 3)); }
      for (const p of tilesInRange(b, u, 1, 1, u.size)) if (['sandPile', 'cracked', 'driedWaterway'].includes(tileAt(b, p.x, p.y) ?? '')) b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      out.lines.push(`${u.name} heaves!`);
      break;
    }
    case 'unexpectedCourage': buff(u, 'courage', 'Unexpected Courage', 2, { str: 4, def: 4 }); out.buffed.push(u.uid); break;
    // ── Impa ──
    case 'sacredBarrierSS': buff(target!, 'sacredBarrierSS', 'Sacred Barrier', 99); (target!.turnUses ??= {}).sacredBarrier = Math.round(12 * boost); out.buffed.push(target!.uid); break;
    case 'shadowDash': tele(at!); out.free = true; break;
    case 'protectiveSeal': addStatus(target!, 'root', 1); addStatus(target!, 'silence', 1); out.statuses.push({ uid: target!.uid, kind: 'root' }, { uid: target!.uid, kind: 'silence' }); break;
    // ── Ghirahim ──
    case 'bladeCatch': buff(u, 'bladeCatch', 'Blade Catch', 1); out.buffed.push(u.uid); break;
    case 'demonDarts': {
      const t = target!;
      const extra = b.units.filter((x) => x.team === t.team && x !== t && unitDist(x, t) <= 1).slice(0, 2);
      for (const e of [t, ...extra]) strike(e, Math.max(1, s.mag + 4 - effectiveStats(e).res));
      break;
    }
    case 'teleportSlash': {
      const t = target!;
      const spot = nearFree(b, u, t, 1);
      if (!spot) return null;
      tele(spot);
      strike(t, phys(t, 0));
      break;
    }
    case 'demonicRestoration': heal(u, u.stats.hp * 0.3); break;
    case 'ghirahimTrueForm':
    case 'imprisonedRise':
    case 'imprisonedAscend': {
      const before = u.name;
      const into = def.id === 'ghirahimTrueForm' ? 'ghirahimTrue' : def.id === 'imprisonedRise' ? 'imprisonedArmed' : 'imprisonedFlying';
      const wasBoss = u.isBoss;
      transformInto(b, u, into);
      u.isBoss = wasBoss;
      (u.usedAbilities ??= []).push(def.id);
      out.transformed = before;
      out.lines.push(def.id === 'ghirahimTrueForm' ? '"You\'ve pushed me too far." Ghirahim\'s skin turns to black steel.' : `${before} changes shape!`);
      break;
    }
    case 'ghirahimSpiritForm': {
      if (!u.originalForm) return null;
      const before = u.name;
      Object.assign(u, restoreForm(u));
      delete u.originalForm;
      out.transformed = before;
      break;
    }
    case 'rapidTeleportation': case 'diamondStep': tele(at!); out.free = true; break;
    case 'diamondBarrage': for (const e of foesWithin(b, u, 3)) strike(e, Math.floor(s.mag / 2) + 6 - Math.floor(effectiveStats(e).res / 2)); break;
    // ── Demise ──
    case 'demonicDominion': for (const a of [u, ...alliesWithin(b, u, 3)]) if (demonic(a)) { buff(a, 'dominion', 'Demonic Dominion', 3, { str: 3, res: 3 }); out.buffed.push(a.uid); } break;
    // ── Loftwings and tools ──
    case 'wingGust':
    case 'gustBellowsBlast': {
      const r = def.id === 'wingGust' ? 1 : 2;
      for (const e of foesWithin(b, u, r)) { if (e.size <= u.size + 1 && !has(e, 'unstoppableAscension')) { const moved = pushAway(b, e, u, 1); if (!moved && has(e, 'volatileBody')) { strike(e, e.hp); } } }
      blowTiles(b, u, r, rng, out);
      break;
    }
    case 'aerialTransport': {
      const t = target!;
      (u.cargo ??= []).push(t);
      b.units = b.units.filter((x) => x !== t);
      if (!has(u, 'heavyCargo')) buff(u, 'carrying', 'Carrying', 99, { mov: -1 });
      out.lines.push(`${u.name} lifts ${t.name} into the air.`);
      out.free = true;
      break;
    }
    case 'dropOff': {
      const c = u.cargo?.shift();
      if (!c || !at) return null;
      Object.assign(c, { x: at.x, y: at.y, moved: true, acted: false });
      b.units.push(c);
      u.buffs = u.buffs.filter((x) => x.id !== 'carrying');
      out.free = true;
      break;
    }
    case 'beetleFlight': {
      const r = hasEffect(u, 'toughBeetle') ? 3 : 2;
      let n = 0;
      for (const e of b.units) if (e.team !== u.team && e.hidden && footDist(at!.x, at!.y, 1, e.x, e.y, e.size) <= r) { e.hidden = false; n++; }
      for (const t of b.traps ?? []) if (t.hidden && footDist(at!.x, at!.y, 1, t.x, t.y, 1) <= r) { t.hidden = false; n++; }
      const here = tileAt(b, at!.x, at!.y);
      if (here === 'windPinwheel') spinPinwheel(b, keyOf(b, at!.x, at!.y), out);
      if (hasEffect(u, 'hookBeetle')) {
        const bomb = u.pack.find((p) => p.id === 'bomb');
        if (bomb) {
          if (--bomb.uses <= 0) u.pack = u.pack.filter((p) => p !== bomb);
          for (const e of b.units.filter((x) => x.team !== u.team && footDist(at!.x, at!.y, 1, x.x, x.y, x.size) <= 1)) strike(e, 12);
          if (here === 'cracked' || here === 'sandPile') b.tiles[keyOf(b, at!.x, at!.y)] = 'plain';
          out.lines.push('The Beetle drops a Bomb!');
        }
      }
      out.lines.push(`The Beetle scouts ahead${n ? `: ${n} hidden thing${n > 1 ? 's' : ''} found` : ''}.`);
      out.free = true;
      break;
    }
    case 'whipSnatch': {
      const t = target!;
      b.rewardRupees += 15;
      if (t.size === 1 && !t.isBoss) pullToward(b, t, u, 3);
      out.lines.push(`${u.name}'s whip snatches something from ${t.name}!`);
      break;
    }
    case 'mogmaDig': {
      const k = keyOf(b, u.x, u.y);
      const tunnels = (hasEffect(u, 'mogmaMitts') || u.race === 'mogma' || has(u, 'buriedFortune')) && b.tiles[k] === 'burrowingTunnel';
      if (tunnels) {
        const exits = b.tiles.map((t, i) => (t === 'burrowingTunnel' && i !== k && !unitAt(b, i % b.width, Math.floor(i / b.width)) ? i : -1)).filter((i) => i >= 0);
        if (exits.length) {
          const e = rng.pick(exits);
          tele({ x: e % b.width, y: Math.floor(e / b.width) });
          out.lines.push(`${u.name} burrows through to another tunnel!`);
          out.free = hasEffect(u, 'burrowBoots');
          break;
        }
      }
      const got = dig(b, u, rng);
      if (has(u, 'buriedFortune') && rng.chance(30)) ssState(b).materials.push(rng.pick(['amberRelic', 'eldinOre', 'ancientFlower']));
      // Moldini leaves an underground passage behind.
      if ((has(u, 'buriedFortune') || hasEffect(u, 'mogmaMitts')) && b.tiles[k] === 'plain') { b.tiles[k] = 'burrowingTunnel'; out.lines.push('A Burrowing Tunnel opens here.'); }
      out.lines.push(got.item ? `${u.name} digs up ${ITEMS[got.item]?.name ?? got.item}!` : got.rupees ? `${u.name} digs up ₹${got.rupees}.` : 'Just dirt.');
      break;
    }
    // ── Battlefield spaces ──
    case 'strikeTimeshiftStone': {
      const p = adjacentTile(b, u, 'timeshiftStone')!;
      const k = keyOf(b, p.x, p.y);
      const r = toggleTimeshift(b, p, 3, -1, k);
      out.lines.push(r === 'on' ? 'The Timeshift Stone flares: the ancient past returns around it!' : 'The Timeshift Stone dims: the present comes back.');
      break;
    }
    case 'openTrialGate': ssState(b).trialOpened = true; out.lines.push('The world goes silent and grey for a heartbeat. After this battle, the Silent Realm awaits.'); break;
    case 'throwWaterFruit': {
      for (const p of [at!, ...tilesInRange(b, at!, 1, 1)]) {
        const t = tileAt(b, p.x, p.y);
        if (t === 'lava') setTimed(b, p.x, p.y, 'solidifiedLava', 3, true);
        if (t === 'flames') b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      }
      for (const e of b.units.filter((x) => x.team !== u.team && footDist(at!.x, at!.y, 1, x.x, x.y, x.size) <= 1 && unitTags(x).includes('fire'))) strike(e, 8);
      out.lines.push('The fruit bursts: the lava hardens!');
      break;
    }
    // ── Goddess's Harp ──
    case 'balladOfTheGoddess': {
      songBuff(1, 'ballad', 'Ballad of the Goddess', { mag: 3 });
      const tr = b.ss?.trial;
      if (tr) { for (const h of tr.hidden) if (b.tiles[h] === 'plain') b.tiles[h] = 'sacredTear'; tr.hidden = []; }
      out.lines.push('The Ballad of the Goddess rings out.');
      break;
    }
    case 'faroresCourage': songBuff(3, 'faroresCourage', "Farore's Courage", { str: 3, spd: 3 }); break;
    case 'nayrusWisdom': songBuff(3, 'nayrusWisdom', "Nayru's Wisdom", { mag: 3, res: 3 }); break;
    case 'dinsPower': songBuff(3, 'dinsPower', "Din's Power", { str: 3, def: 3 }); break;
    case 'songOfTheHero':
      for (const a of b.units.filter((x) => x.team === u.team)) { buff(a, 'songOfTheHero', 'Song of the Hero', 3, { str: 3, mag: 3, skl: 3, spd: 3, def: 3, res: 3 }); out.buffed.push(a.uid); }
      out.lines.push('The whole Song of the Hero, at last!');
      break;
    case 'dragonsChorus': {
      const singers = b.units.filter((a) => a.team === u.team && ['faronDragon', 'eldinDragon', 'lanayruDragon', 'levias'].includes(tid(a)));
      const hit = new Set<Unit>();
      for (const sgr of singers.length ? singers : [u]) for (const e of foesWithin(b, sgr, 4)) hit.add(e);
      for (const e of hit) strike(e, Math.max(1, Math.floor(s.mag / 2) + 10));
      (u.usedAbilities ??= []).push(def.id);
      out.lines.push('The guardians of the land sing together!');
      break;
    }
    default:
      return null;
  }
  return out;
}

function openCube(b: Battle, k: number, rng: RNG, out: SSOutcome) {
  b.tiles[k] = 'plain';
  const st = ssState(b);
  st.cubes = (st.cubes ?? 0) + 1;
  const loot = rng.pick(['heartPotionPlus', 'revitalizingPotion', 'guardianPotion', 'staminaPotionPlus', 'heartMedal', 'rupeeMedal', 'treasureMedal', 'potionMedal', 'goddessShield', 'sacredShield']);
  if (ITEMS[loot] || GEAR[loot]) (b.loot ??= []).push(loot);
  b.bonusRupees = (b.bonusRupees ?? 0) + 50;
  st.materials.push(rng.pick(['duskRelic', 'goldenSkull', 'goddessPlume', 'ancientFlower']));
  out.lines.push('A Goddess Cube is struck! Somewhere, a Goddess Chest unlocks.');
}

function spinPinwheel(b: Battle, k: number, out: SSOutcome) {
  b.tiles[k] = 'plain';
  ssState(b).powered = true;
  b.bonusRupees = (b.bonusRupees ?? 0) + 40;
  out.lines.push('The Wind Pinwheel spins: a mechanism grinds into motion (rails powered, a hidden stash opens).');
}

function blowTiles(b: Battle, u: Unit, r: number, rng: RNG, out: SSOutcome) {
  for (const p of tilesInRange(b, u, 1, r, u.size)) {
    const k = keyOf(b, p.x, p.y);
    const t = b.tiles[k];
    if (t === 'sandPile') {
      b.tiles[k] = 'plain';
      const gorko = b.units.some((a) => a.team === u.team && has(a, 'ancientKnowledge'));
      if (rng.chance(gorko ? 70 : 40)) { b.bonusRupees = (b.bonusRupees ?? 0) + 20; ssState(b).materials.push(rng.pick(['amberRelic', 'tumbleweed', 'ancientFlower'])); out.lines.push('Something was buried in the sand!'); }
    } else if (t === 'windPinwheel') spinPinwheel(b, k, out);
    else if (t === 'flames') b.tiles[k] = 'plain';
  }
}

/** MP multiplier for Skyward Sword abilities. */
export function ssCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  if (!b) return 1;
  let m = 1;
  if (has(u, 'goddessReborn') && (SACRED_ABILITIES.has(def.id) || def.element === 'light')) m *= 0.75;
  return m;
}

// ───────────────────────── Items ─────────────────────────

/** Skyward Sword's own items, resolved by id. Returns a log line, or null if not an SS item. */
export function useSkywardItem(b: Battle, u: Unit, id: string, rng: RNG, target?: Unit, at?: Pos): string | null {
  const dur = (n: number) => n * (hasEffect(u, 'potionMedal') ? 2 : 1);
  const mendShield = (n: number | 'all') => {
    const sh = u.gear.shield;
    if (!sh || !u.shieldDmg?.[sh]) return;
    u.shieldDmg = { ...u.shieldDmg, [sh]: n === 'all' ? 0 : Math.max(0, u.shieldDmg[sh] - n) };
  };
  const healBy = (n: number) => { u.hp = Math.min(u.stats.hp, u.hp + n); };
  switch (id) {
    case 'heartPotionPlus': case 'heartPotionPlusPlus': u.hp = u.stats.hp; return `${u.name} is fully healed.`;
    case 'staminaPotionSS': u.sta = Math.min(u.stats.sta, u.sta + 20); buff(u, 'staThrift', 'Stamina Potion', dur(3)); return `${u.name} feels tireless.`;
    case 'staminaPotionPlus': buff(u, 'staFree', 'Stamina Potion+', dur(3)); return `${u.name} won't tire for a while.`;
    case 'airPotion': buff(u, 'airPotion', 'Air Potion', dur(5)); return `${u.name} can breathe underwater.`;
    case 'airPotionPlus': buff(u, 'airPotion', 'Air Potion+', dur(10)); return `${u.name} can breathe underwater.`;
    case 'revitalizingPotion': healBy(15); mendShield(20); return `${u.name} and their shield are revitalized.`;
    case 'revitalizingPotionPlus': healBy(25); mendShield('all'); return `${u.name}'s shield is good as new.`;
    case 'revitalizingPotionPlusPlus': u.hp = u.stats.hp; mendShield('all'); return `${u.name} is fully revitalized.`;
    case 'guardianPotion': buff(u, 'guardianPotion', 'Guardian Potion', dur(3)); return `${u.name} is shielded by the potion.`;
    case 'guardianPotionPlus': buff(u, 'guardianPotionPlus', 'Guardian Potion+', dur(1), {}, true); return `${u.name} is untouchable.`;
    case 'mushroomSpores': {
      let n = 0;
      for (const a of b.units.filter((x) => x.team === u.team && unitDist(x, u) <= 2 && (unitTags(x).includes('plant') || ['deku', 'kikwi', 'korok'].includes(x.race)))) {
        a.hp = Math.min(a.stats.hp, a.hp + 15); buff(a, 'spores', 'Mushroom Spores', 2, { def: 2 }); n++;
      }
      return n ? `The spores revive ${n} plant${n > 1 ? 's' : ''}.` : 'The spores drift away. Nothing here is a plant.';
    }
    case 'hotPumpkinSoup':
      if (b.turn > 5) { healBy(10); return 'It\'s gone cold. Still tasty (+10 HP).'; }
      healBy(20); u.sta = Math.min(u.stats.sta, u.sta + 10); return `${u.name} warms up.`;
    case 'staminaFruit': u.sta = Math.min(u.stats.sta, u.sta + 15); return `${u.name} catches a second wind.`;
    case 'remlitTreat': {
      if (!target) return 'Nobody to feed.';
      if (target.team !== u.team && (target.artId === 'remlit' || target.templateId === 'remlit')) { target.team = u.team; target.commanded = 99; target.moved = target.acted = true; return `${target.name} purrs and switches sides.`; }
      if (target.team !== u.team && unitTags(target).includes('beast')) { addStatus(target, 'confuse', 1); return `${target.name} is distracted by the treat.`; }
      return 'Nothing wants it.';
    }
    case 'ampilusShell': (u.turnUses ??= {}).ampilusShell = 3; return `${u.name}'s weapon crackles with electricity.`;
    case 'furnixFeather': buff(u, 'glide', 'Furnix Feather', dur(2)); return `${u.name} takes flight.`;
    case 'quadroBabaSeed': {
      if (!at || !ENEMIES.quadroBaba) return null;
      const s = makeEnemy(ENEMIES.quadroBaba, b.world, Math.max(1, b.enemyLevel - 1), `p${b.uidCounter++}`, rng);
      Object.assign(s, { team: u.team, x: at.x, y: at.y, moved: true, acted: true, summoned: true, npc: u.team === 'player', ai: 'stationary', ssGuard: 'h' });
      if (!free(b, s, at.x, at.y)) return 'No room.';
      b.units.push(s);
      return 'A Quadro Baba sprouts!';
    }
    case 'sentrobeDrone': {
      if (!at) return null;
      for (const e of b.units.filter((x) => x.team !== u.team && footDist(at.x, at.y, 1, x.x, x.y, x.size) <= 1)) {
        const main = footDist(at.x, at.y, 1, e.x, e.y, e.size) === 0;
        e.hp = Math.max(main ? 0 : 1, e.hp - (main ? 14 : 7));
        if (e.hp <= 0) { b.units = b.units.filter((x) => x !== e); b.fallen.push(e); u.kills++; ssOnKill(b, u, e, rng); }
      }
      return 'The drone homes in and explodes!';
    }
    case 'guardianSignal': if (target && target.team !== u.team) { buff(target, 'guardianMark', 'Marked', 3); return `${target.name} is marked for the Guardians.`; } return null;
    case 'magmanosCore': buff(u, 'magmanosCore', 'Magmanos Core', dur(3)); return `${u.name} glows like magma.`;
    case 'timeshiftFragment': if (at) { toggleTimeshift(b, at, 2, 3); return 'The fragment shatters: the ancient past returns around it for a while.'; } return null;
    case 'sacredFlame': buff(u, 'sacredFlame', 'Sacred Flame', 3); return `${u.name}'s weapon burns with sacred fire.`;
    case 'demonCrystal': u.mp = Math.min(u.stats.mp, u.mp + 15); buff(u, 'demonCrystal', 'Demon Crystal', 2); return `${u.name} drinks in dark power.`;
    case 'adventurePouch': return 'Use it at camp (outside battle).';
  }
  return null;
}

/** Fire immunity for 'flames' and lava from SS gear and potions. */
export function ssHazardImmune(u: Unit): boolean {
  return hasEffect(u, 'hazardResist') || hasBuff(u, 'magmanosCore') || has(u, 'moltenBody');
}

export { SKYWARD_SWORDS };
