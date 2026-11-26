// The Legend of Zelda (Original Hyrule) battle rules: Sword Beams, It's Dangerous to Go
// Alone, Ganon's invisibility and the Silver Arrows, dividing slimes and bats, Pols Voice's
// ears, Ghini graves, Lanmola segments, Patra's orbiting eyes, Aquamentus's fireballs,
// Manhandla's four heads, Digdogger and the Recorder, rings, candles, keys and the pack's
// battlefield spaces (hidden staircases, secret caves, blade traps, push blocks...).
// Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts, status.ts and
// abilities.ts (like skyward.ts).

import { ENEMIES, WEAPONS, worldDef } from '../data/registry';
import { BEAM_SWORDS, SPOILS } from '../content/original';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF, isMagical } from './rules';
import { addStatus } from './status';
import { canSwim, effectiveStats, hasEffect, makeEnemy, moveTypeOf, unitTags } from './units';
import { disarm, pushAway } from './windwaker';
import { ignite } from './field';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Original Hyrule battle state. */
    og?: OGState;
    /** Second Quest (campaign modifier): harder formations, moved secrets. */
    secondQuest?: boolean;
  }
  interface Unit {
    /** Patra: orbiting eyes left. */
    ogEyes?: number;
    /** Lanmola: body segments left. */
    ogSegments?: number;
    /** Manhandla: heads destroyed. */
    ogHeads?: number;
    /** Digdogger: shrunk to its vulnerable form. */
    ogShrunk?: boolean;
  }
}

export interface OGState {
  /** Hidden staircases not yet found (tile keys; the tile looks like floor). */
  secrets: number[];
  /** Enemies at the start (Shutter Doors open once half are beaten). */
  startEnemies: number;
  /** Secrets found this battle (for the after-battle report). */
  found: number;
}

const isOG = (b: Battle) => worldDef(b.world).campaign === 'original';
export const ogState = (b: Battle): OGState => (b.og ??= { secrets: [], startEnemies: 0, found: 0 });
const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.templateId ?? u.bossId ?? u.artId ?? '';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const concealed = (u: Unit) => !!u.hidden || u.statuses.some((s) => s.kind === 'veiled');
const isMonster = (u: Unit) => !u.templateId || ['monster', 'undead', 'demon', 'chuchu', 'phantom'].includes(u.race) || unitTags(u).includes('beast');
const free = (b: Battle, u: Unit, x: number, y: number, ignore?: Unit) =>
  inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u || o === ignore; });
const BRACELETS = ['powerBracelets', 'goronBracelet', 'silverGauntlets', 'goldenGauntlets'];
const treasureMult = (b: Battle) => (b.bonus === 'hiddenTreasure' ? 1.25 : 1);

function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}

function nearFree(b: Battle, who: Unit, by: Pos & { size: number }, r = 2, ignore?: Unit): Pos | null {
  if (ignore && free(b, who, by.x, by.y, ignore)) return { x: by.x, y: by.y };
  for (let d = 1; d <= r; d++) for (const p of tilesInRange(b, by, d, d, by.size)) if (free(b, who, p.x, p.y, ignore)) return p;
  return null;
}

/** A temporary unit (split slimes, bats, grave spirits, fragments) on `team`'s side. */
function spawn(b: Battle, id: string, near: Pos & { size: number }, team: Unit['team'], level: number, ignore?: Unit): Unit | null {
  const a = ENEMIES[id];
  if (!a) return null;
  const rng = new RNG(b.rngState);
  const e = makeEnemy(a, b.world, Math.max(1, level), `og${b.uidCounter++}`, rng);
  b.rngState = rng.state;
  const spot = nearFree(b, e, near, 2, ignore);
  if (!spot) return null;
  Object.assign(e, { x: spot.x, y: spot.y, team, summoned: true, moved: true, acted: true, ai: 'aggressive' });
  if (team === 'player') e.npc = true;
  b.units.push(e);
  return e;
}

/** Triforce of Wisdom fragments the army holds (8 once whole). */
export function fragmentsHeld(b: Battle): number {
  const o = b.owned ?? [];
  if (o.includes('fullTriforce')) return 8;
  return Math.min(8, o.filter((x) => x === 'wisdomFragment').length);
}

// ───────────────────────── Movement ─────────────────────────

/** Original Hyrule movement exceptions (called from grid.ts). */
export function ogTileCost(_b: Battle, u: Unit, t: Terrain, c: number): number {
  const flying = moveTypeOf(u) === 'flying';
  switch (t) {
    case 'ladderGap': if (flying || hasEffect(u, 'stepladder')) c = 1; break;
    case 'water': if (!flying && !canSwim(u)) { if (hasEffect(u, 'raft')) c = Math.min(c, 2); else if (hasEffect(u, 'stepladder')) c = Math.min(c, 3); } break;
    case 'wall': case 'gravestone': if (has(u, 'graveyardHaunting')) c = 2; break;
  }
  return c;
}

// ───────────────────────── Battlefield setup ─────────────────────────

const FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  level1Eagle: { burnableBush: 2, boulder: 1, pushBlock: 1, shutterDoor: 1, secretCave: 1, lockedDoor: 1, bladeTrap: 1 },
  level2Moon: { burnableBush: 2, pushBlock: 1, bladeTrap: 2, secretCave: 1, lockedDoor: 1 },
  level3Manji: { shutterDoor: 2, pushBlock: 1, bladeTrap: 1, boulder: 1, burnableBush: 1, secretCave: 1 },
  level4Snake: { raftDock: 2, ladderGap: 2, shutterDoor: 1, pushBlock: 1, secretCave: 1 },
  level5Lizard: { burnableBush: 2, boulder: 1, bladeTrap: 2, lockedDoor: 2, secretCave: 1 },
  level6Dragon: { gravestone: 4, burnableBush: 2, pushBlock: 1, secretCave: 1 },
  level7Demon: { goriyaCheckpoint: 1, bladeTrap: 2, lockedDoor: 1, pushBlock: 1, secretCave: 1, burnableBush: 1, raftDock: 1 },
  level8Lion: { ladderGap: 2, boulder: 2, bladeTrap: 2, shutterDoor: 1, lockedDoor: 1, secretCave: 1 },
  level9DeathMountain: { bladeTrap: 3, shutterDoor: 2, lockedDoor: 1, boulder: 1, gravestone: 1, secretCave: 1 },
};
const OBSTACLES = new Set<Terrain>(['boulder', 'pushBlock', 'shutterDoor', 'bladeTrap', 'goriyaCheckpoint', 'gravestone', 'lockedDoor']);

export function decorateOriginal(b: Battle, rng: RNG) {
  if (!isOG(b)) return;
  const st = ogState(b);
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 3 && i % b.width <= b.width - 4 ? i : -1)).filter((i) => i >= 0));
  const feats = { ...(FEATURES[b.world] ?? {}) };
  // Second Quest: more walls to bomb and more secrets, all in new places.
  if (b.secondQuest) { feats.bladeTrap = (feats.bladeTrap ?? 0) + 1; feats.lockedDoor = (feats.lockedDoor ?? 0) + 1; }
  const waterAt = (k: number) => tilesInRange(b, { x: k % b.width, y: Math.floor(k / b.width) }, 1, 1).some((p) => b.tiles[keyOf(b, p.x, p.y)] === 'water');
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    for (let j = 0; j < n; j++) {
      if (t === 'ladderGap') {
        // A narrow gap in the water (or a pit in the floor).
        const wet = rng.shuffle(b.tiles.map((x, i) => (x === 'water' ? i : -1)).filter((i) => i >= 0));
        const k = wet[0] ?? plains.pop();
        if (k !== undefined) b.tiles[k] = 'ladderGap';
        continue;
      }
      const idx = t === 'raftDock' ? plains.findIndex(waterAt) : plains.length - 1;
      if (idx < 0) continue;
      const [k] = plains.splice(idx, 1);
      // Keep obstacles from sealing a unit in: never next to another obstacle.
      if (OBSTACLES.has(t) && tilesInRange(b, { x: k % b.width, y: Math.floor(k / b.width) }, 1, 1).some((p) => OBSTACLES.has(b.tiles[keyOf(b, p.x, p.y)]))) continue;
      b.tiles[k] = t;
    }
  }
  // Hidden staircases look like ordinary floor until found.
  st.secrets = plains.splice(0, 2 + (b.secondQuest ? 2 : 0) + (rng.chance(40) ? 1 : 0));
}

/** Battle start (every campaign): Patra's eyes, Lanmola's segments, the Old Man's advice, Ganon's army. */
export function originalBattleStart(b: Battle, rng: RNG) {
  const st = ogState(b);
  st.startEnemies = b.units.filter((u) => u.team === 'enemy').length;
  // Ghinis need graves to haunt.
  if (b.units.some((u) => has(u, 'graveyardHaunting')) && !b.tiles.includes('gravestone')) {
    for (const g of b.units.filter((u) => has(u, 'graveyardHaunting')).slice(0, 2)) {
      const p = rng.shuffle(tilesInRange(b, g, 1, 2, g.size)).find((q) => tileAt(b, q.x, q.y) === 'plain' && !unitAt(b, q.x, q.y));
      if (p) b.tiles[keyOf(b, p.x, p.y)] = 'gravestone';
    }
  }
  for (const u of b.units) {
    if (has(u, 'orbitalDefense')) u.ogEyes = 8;
    if (has(u, 'segmentedBody')) u.ogSegments = 3;
    if (u.team === 'player' && b.bonus === 'concealedDarkness' && isMonster(u)) addStatus(u, 'veiled', 2);
    if (u.team === 'player' && has(u, 'ancientAdvice')) {
      for (const t of b.traps ?? []) t.hidden = false;
      revealSecrets(b, u, 99);
      for (const e of b.units) if (e.team !== u.team && !e.isBoss) addStatus(e, 'exposed', 1);
    }
  }
}

// ───────────────────────── Secrets ─────────────────────────

/** Turn hidden staircases within r of a unit into visible ones. Returns how many. */
function revealSecrets(b: Battle, from: Pos & { size: number }, r: number): number {
  const st = b.og;
  if (!st) return 0;
  let n = 0;
  st.secrets = st.secrets.filter((k) => {
    const x = k % b.width, y = Math.floor(k / b.width);
    if (footDist(x, y, 1, from.x, from.y, from.size) > r || b.tiles[k] !== 'plain') return true;
    b.tiles[k] = 'hiddenStairs';
    n++;
    return false;
  });
  return n;
}

/** Hidden things within r: enemies, traps and staircases. */
function revealAll(b: Battle, u: Unit, r: number): number {
  let n = revealSecrets(b, u, r);
  for (const e of b.units) if (e.team !== u.team && e.hidden && unitDist(u, e) <= r) { e.hidden = false; n++; }
  for (const t of b.traps ?? []) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= r) { t.hidden = false; n++; }
  return n;
}

const STAIR_LOOT = ['rupeeCache', 'smallKey', 'enemyBait', 'blueLifeMedicine', 'bomb', 'rupeeCache', 'silverArrow', 'fairy'];
const CAVE_LOOT = ['blueLifeMedicine', 'enemyBait', 'bomb', 'smallKey', 'redLifeMedicine', 'magicalClock', 'silverArrow'];

/** Something burnt, pushed or blown open: maybe a staircase appears there. */
function maybeStairs(b: Battle, k: number, chance: number, rng: RNG): boolean {
  const st = ogState(b);
  if (st.secrets.includes(k) || rng.chance(chance)) {
    st.secrets = st.secrets.filter((x) => x !== k);
    b.tiles[k] = 'hiddenStairs';
    return true;
  }
  return false;
}

/** After a unit moves: staircases, secret caves, blade traps. */
export function ogAfterMove(b: Battle, u: Unit): string | null {
  const lines: string[] = [];
  const rng = new RNG(b.rngState);
  if (u.team === 'player' && !u.npc) {
    for (const p of footprint(u.x, u.y, u.size)) {
      const k = keyOf(b, p.x, p.y);
      const t = b.tiles[k];
      if (t === 'hiddenStairs') {
        b.tiles[k] = 'plain';
        const item = rng.pick(STAIR_LOOT);
        const rupees = Math.round(rng.int(30, 90) * treasureMult(b));
        (b.loot ??= []).push(item);
        b.bonusRupees = (b.bonusRupees ?? 0) + rupees;
        ogState(b).found++;
        lines.push(`${u.name} goes down a hidden staircase: a treasure room (₹${rupees} and an item)!`);
      } else if (t === 'secretCave') {
        b.tiles[k] = 'plain';
        ogState(b).found++;
        const roll = rng.int(0, 2);
        if (roll === 0) { const rupees = Math.round(rng.int(50, 120) * treasureMult(b)); b.bonusRupees = (b.bonusRupees ?? 0) + rupees; lines.push(`A secret cave: "It's a secret to everybody." (₹${rupees})`); }
        else if (roll === 1) { (b.loot ??= []).push(rng.pick(CAVE_LOOT)); if (treasureMult(b) > 1) (b.loot ??= []).push('rupeeCache'); lines.push('A secret cave: someone left you a gift. "Take this."'); }
        else { const h = Math.min(u.stats.hp - u.hp, Math.ceil(u.stats.hp * 0.4)); u.hp += h; lines.push(`A secret cave with a fairy pond: ${u.name} recovers ${h} HP.`); }
      }
    }
    // Blade traps slide down their lane at whoever steps into it.
    for (let i = 0; i < b.tiles.length; i++) {
      if (b.tiles[i] !== 'bladeTrap') continue;
      const tx = i % b.width, ty = Math.floor(i / b.width);
      const inLane = footprint(u.x, u.y, u.size).find((p) => (p.x === tx || p.y === ty) && Math.abs(p.x - tx) + Math.abs(p.y - ty) <= 4);
      if (!inLane || (u.turnUses?.[`blade${i}`] ?? -1) === b.turn) continue;
      const dx = Math.sign(inLane.x - tx), dy = Math.sign(inLane.y - ty);
      let clear = true;
      for (let x = tx + dx, y = ty + dy; x !== inLane.x || y !== inLane.y; x += dx, y += dy) {
        const t = tileAt(b, x, y);
        if (!t || OBSTACLES.has(t) || t === 'wall' || t === 'cracked' || (unitAt(b, x, y) && unitAt(b, x, y) !== u)) { clear = false; break; }
      }
      if (!clear) continue;
      (u.turnUses ??= {})[`blade${i}`] = b.turn;
      const dmg = Math.min(u.hp - 1, 5);
      if (dmg > 0) { u.hp -= dmg; lines.push(`A Blade Trap slams into ${u.name} (−${dmg}).`); }
    }
  }
  b.rngState = rng.state;
  if (!lines.length) return null;
  b.log.push(...lines);
  return lines.join(' ');
}

/** A bomb went off (items.ts): walls may hide staircases; Dodongo eats bombs. */
export function ogOnBlast(b: Battle, at: Pos, radius: number, broken: number, victims: Unit[], power: number, rng: RNG): string[] {
  const lines: string[] = [];
  for (const e of victims) {
    if (!has(e, 'explosiveAppetite') || e.hp <= 0) continue;
    const dmg = Math.min(e.hp - 1, power * 2);
    e.hp -= dmg;
    addStatus(e, 'stun', 1);
    lines.push(`${e.name} swallows the bomb! (−${dmg} more, Stunned)`);
  }
  if (broken && isOG(b)) {
    for (const p of [at, ...tilesInRange(b, at, 1, radius)]) {
      const k = keyOf(b, p.x, p.y);
      if (b.tiles[k] === 'plain' && maybeStairs(b, k, 20, rng)) { lines.push('Behind the bombed wall: a hidden staircase!'); break; }
    }
  }
  b.log.push(...lines);
  return lines;
}

// ───────────────────────── Start of phase ─────────────────────────

export interface OGEvent { uid: string; heal: number; damage: number; source: string }

export function ogStartPhase(b: Battle, u: Unit, events: OGEvent[]) {
  const mine = b.units.filter((a) => a.team === u.team);
  const foes = b.units.filter((e) => e.team !== u.team && !e.captive);
  const st = b.og;
  // ── Once per round (first unit of the player phase): doors and the Hungry Goriya ──
  if (st && u.team === 'player' && u === mine[0]) {
    const enemies = b.units.filter((e) => e.team === 'enemy').length;
    if (b.tiles.includes('shutterDoor') && st.startEnemies && enemies <= st.startEnemies / 2) {
      for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i] === 'shutterDoor') b.tiles[i] = 'plain';
      b.log.push('The Shutter Doors grind open.');
    }
    if (b.tiles.includes('goriyaCheckpoint') && !b.units.some((e) => e.team === 'enemy' && tid(e) === 'goriya')) {
      for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i] === 'goriyaCheckpoint') b.tiles[i] = 'plain';
      b.log.push('With the Goriyas beaten, the Hungry Goriya\'s post is abandoned.');
    }
  }
  // ── Ganon's invisibility ──
  if (has(u, 'invisibleDarkness')) {
    if (hasBuff(u, 'silverSealed') || hasBuff(u, 'wisdomLit')) u.hidden = false;
    else if (u.team === 'enemy') { if (!u.hidden) events.push({ uid: u.uid, heal: 0, damage: 0, source: 'vanishes' }); u.hidden = true; }
    else addStatus(u, 'veiled', 1);
  }
  // ── Goriyas who've been fed sit and eat ──
  if (hasBuff(u, 'fed')) { u.moved = u.acted = true; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is busy eating' }); }
  // ── Rope: Sudden Charge ──
  if (has(u, 'suddenCharge') && foes.some((e) => (e.x === u.x || e.y === u.y) && unitDist(u, e) <= 6)) buff(u, 'suddenCharge', 'Sudden Charge', 1, { mov: 4 });
  // ── Ghini: Graveyard Haunting ──
  if (has(u, 'graveyardHaunting') && !u.summoned && b.turn % 2 === 0 && b.units.filter((g) => g.team === u.team && g.summoned && tid(g) === 'ghini').length < 2) {
    const grave = tilesInRange(b, u, 1, 1, u.size).find((p) => tileAt(b, p.x, p.y) === 'gravestone');
    if (grave) {
      const g = spawn(b, 'ghini', { ...grave, size: 1 }, u.team, u.level - 1);
      if (g) events.push({ uid: u.uid, heal: 0, damage: 0, source: 'calls a Ghini from the grave' });
    }
  }
  // ── Detection ──
  if (u.team === 'player' && has(u, 'dungeonExplorer')) {
    const n = revealAll(b, u, 3);
    if (n) events.push({ uid: u.uid, heal: 0, damage: 0, source: 'finds something hidden nearby' });
  }
  if (Object.values(u.gear ?? {}).includes('triforceWisdom')) {
    for (const e of foes) if (e.hidden && unitDist(u, e) <= 4) { e.hidden = false; if (has(e, 'invisibleDarkness')) buff(e, 'wisdomLit', 'Revealed', 1); }
  }
  // ── Raft Docks ──
  if (hasEffect(u, 'raft') && footprint(u.x, u.y, u.size).some((p) => tileAt(b, p.x, p.y) === 'raftDock')) buff(u, 'raftDock', 'On the Raft', 1, { mov: 2 });
}

// ───────────────────────── Combat hooks ─────────────────────────

export interface OGMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

/** Situational bonuses from Original Hyrule skills, gear and buffs. */
export function ogMods(b: Battle, u: Unit, pos: Pos, _foe: Unit, initiating: boolean, w?: WeaponDef): OGMods {
  const m: OGMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const allies = b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
  if (has(u, 'itsDangerousToGoAlone') && !allies.some((a) => unitDist(a, u, pos) <= 3)) { m.str += 2; m.def += 2; m.skl += 2; }
  if (has(u, 'scatteredWisdom')) { const n = fragmentsHeld(b); m.mag += n; m.res += n; }
  if (has(u, 'invisibleAssault') && initiating && concealed(u)) m.crit += 25;
  if (has(u, 'erraticMovement') && (u.movedDist ?? 0) >= 3) m.avoid += 20;
  if (isMonster(u)) {
    if (allies.some((a) => has(a, 'princeOfDarkness') && unitDist(a, u, pos) <= 2)) { m.str += 3; m.mag += 3; }
    if (u.team === 'player' && b.bonus === 'concealedDarkness' && concealed(u)) { m.str += 2; m.mag += 2; }
  }
  if (w?.type === 'boomerang' && hasBuff(u, 'goriyaFang')) m.dmg += 3;
  if (w?.id === 'patrasEye') m.dmg += Math.floor((u.ogEyes ?? 0) / 2);
  if (w && isMagical(w.type) && hasBuff(u, 'patraEye')) m.hit += 20;
  return m;
}

/** Extra attacks: Returning Strike (boomerangs hit on the way out and back). */
export function ogExtraAttack(atk: Unit, w: WeaponDef, initiating: boolean): boolean {
  return initiating && has(atk, 'returningStrike') && w.type === 'boomerang' && !w.brave;
}

/** Sword Beams: at full HP, sword attacks reach further. */
export function ogRangeBonus(u: Unit, w: WeaponDef): number {
  if (w.type !== 'sword' || u.hp < u.stats.hp) return 0;
  if (!has(u, 'swordBeam') && !BEAM_SWORDS.includes(w.id)) return 0;
  return w.id === 'magicalSword' ? 3 : 2;
}

/** Damage multipliers: rings, Pols Voice's ears, Digdogger's shell, Silver Arrows, barriers. */
export function ogMultiplier(b: Battle, atk: Unit, def: Unit, magical: boolean, w: WeaponDef | undefined, dist: number): number {
  let mult = 1;
  if (hasEffect(def, 'redRing')) mult *= 0.5;
  else if (hasEffect(def, 'blueRing')) mult *= 0.75;
  if (magical && hasBuff(def, 'sacredBarrierHyrule')) mult = 0;
  if (magical && dist > 1 && hasEffect(def, 'magicalShield')) mult *= 0.5;
  if (has(def, 'sensitiveHearing')) {
    if (w?.type === 'bow' || w?.type === 'instrument') mult *= 2;
    else if (!magical && dist <= 1) mult *= 0.5;
  }
  if (has(def, 'resonantWeakness')) mult *= def.ogShrunk ? 1.5 : 0.5;
  if (w?.type === 'bow' && hasBuff(atk, 'silverArrows') && unitTags(def).includes('demon')) mult *= 2;
  if (atk.team === 'player' && b.bonus === 'wisdomOfHyrule' && magical) mult *= 1.2;
  return mult;
}

/** Damage as it lands: Patra's eyes, Lanmola's segments, Manhandla's heads. */
export function ogOnStrike(_b: Battle, _by: Unit, target: Unit, dmg: number): { dmg: number; line?: string } {
  if (dmg <= 0) return { dmg };
  if ((target.ogEyes ?? 0) > 0) {
    const lost = Math.min(target.ogEyes!, dmg >= 12 ? 2 : 1);
    target.ogEyes! -= lost;
    return { dmg: Math.ceil(dmg * 0.25), line: `An orbiting eye takes the blow (${target.ogEyes} left).` };
  }
  if ((target.ogSegments ?? 0) > 0 && dmg >= 3) {
    target.ogSegments!--;
    return { dmg: Math.ceil(dmg * 0.4), line: `A segment of ${target.name} breaks off (${target.ogSegments} left).` };
  }
  if (has(target, 'frenziedGrowth')) {
    const q = target.stats.hp / 4;
    const heads = Math.ceil(target.hp / q - 1e-9);
    const floor = Math.floor((heads - 1) * q + 1e-9);
    if (target.hp - dmg < floor) return { dmg: target.hp - floor };
  }
  return { dmg };
}

/** After a damaging hit lands. */
export function ogAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined): string[] {
  const lines: string[] = [];
  if (!w) return lines;
  if (w.id === 'manhandlaFang' && dmg > 0 && by.hp > 0) {
    const h = Math.min(by.stats.hp - by.hp, Math.ceil(dmg * 0.15));
    if (h > 0) { by.hp += h; lines.push(`${by.name} devours (+${h} HP).`); }
  }
  if (has(by, 'clingingBody') && dmg > 0 && unitDist(by, target) <= 1 && target.hp > 0) buff(target, 'clinging', 'Clinging Gel', 1, { mov: -1 });
  if (w.id === 'magicalRod' && hasEffect(by, 'bookOfMagic')) { ignite(b, footprint(target.x, target.y, target.size)); lines.push('The Book of Magic sets the ground alight!'); }
  if (w.type === 'bow' && hasBuff(by, 'silverArrows') && has(target, 'invisibleDarkness') && target.hp > 0) {
    target.hidden = false;
    target.statuses = target.statuses.filter((s) => s.kind !== 'veiled');
    buff(target, 'silverSealed', 'Silver Arrow', 3);
    lines.push(`The Silver Arrow pins ${target.name}: he can't vanish for 3 turns!`);
  }
  if (dmg > 0 && hasBuff(by, 'ropeVenom') && target.hp > 0) { addStatus(target, 'poison', 2); by.buffs = by.buffs.filter((x) => x.id !== 'ropeVenom'); lines.push(`${target.name} is poisoned by the Rope Venom.`); }
  const fr = frenzy(target);
  if (fr) lines.push(fr);
  b.log.push(...lines);
  return lines;
}

/** Manhandla: count destroyed heads and speed up for each. */
function frenzy(target: Unit): string | null {
  if (!has(target, 'frenziedGrowth') || target.hp <= 0) return null;
  const lost = 4 - Math.ceil(target.hp / (target.stats.hp / 4) - 1e-9);
  if (lost <= (target.ogHeads ?? 0)) return null;
  target.ogHeads = lost;
  buff(target, 'frenzy', `Frenzied Growth (${lost} head${lost > 1 ? 's' : ''} lost)`, 99, { spd: 2 * lost, mov: lost });
  return `One of ${target.name}'s heads is destroyed! It grows frenzied.`;
}

/** On a kill: Zols split into Gels, Vires into Keese; spoils. */
export function ogOnKill(b: Battle, by: Unit, victim: Unit, rng: RNG, dmg: number, element: Element | undefined, w: WeaponDef | undefined) {
  const lvl = victim.level;
  if (has(victim, 'division') && dmg < victim.stats.hp / 2) {
    const n = [spawn(b, 'gel', victim, victim.team, lvl, victim), spawn(b, 'gel', victim, victim.team, lvl, victim)].filter(Boolean).length;
    if (n) b.log.push(`${victim.name} splits into ${n} Gel${n > 1 ? 's' : ''}!`);
  }
  if (has(victim, 'batDivision') && element !== 'light' && !(w && (isMagical(w.type) || w.magicContact))) {
    const n = [spawn(b, 'keese', victim, victim.team, lvl, victim), spawn(b, 'keese', victim, victim.team, lvl, victim)].filter(Boolean).length;
    if (n) b.log.push(`${victim.name} bursts into ${n} Keese!`);
  }
  if (victim.team === 'enemy' && !victim.summoned) {
    const spoil = SPOILS[victim.bossId ?? victim.artId ?? victim.templateId ?? ''];
    if (spoil && rng.chance(victim.isBoss ? 60 : 18)) (b.loot ??= []).push(spoil);
  }
  void by;
}

// ───────────────────────── Abilities ─────────────────────────

const OG_TILE = new Set(['darkTeleport', 'playRecorder', 'candleFire']);
const OG_TARGET = new Set(['sacredBarrierHyrule', 'darkFireball', 'disarmingThrow', 'slimeMerge', 'tripleFireball', 'hornCharge', 'concentratedBreath', 'eyeFixation']);
const OG_OTHER = new Set(['triforcesCourage', 'lightOfWisdom', 'wisdomsGuidance', 'triforceRestoration', 'graveSummoning', 'eyeSwarm', 'dragonGuard', 'fourWayAssault',
  'seedBarrage', 'heavyImpact', 'fragmentation', 'pushBoulder', 'pushBlockOH', 'openLockedDoor']);
/** Abilities enemies use on their own when they can (before acting). */
export const OG_ENEMY_CASTS = ['fragmentation', 'dragonGuard'];

export function isOGAbility(def: AbilityDef): boolean {
  return OG_TILE.has(def.id) || OG_TARGET.has(def.id) || OG_OTHER.has(def.id);
}
export function ogNeedsTile(def: AbilityDef): boolean { return OG_TILE.has(def.id); }
export function ogNeedsTarget(def: AbilityDef): boolean { return OG_TARGET.has(def.id); }

const foesWithin = (b: Battle, u: Unit, r: number, min = 1) => b.units.filter((e) => e.team !== u.team && !e.captive && !(u.team === 'player' && e.hidden) && unitDist(u, e) >= min && unitDist(u, e) <= r);
const alliesWithin = (b: Battle, u: Unit, r: number) => b.units.filter((a) => a.team === u.team && a !== u && unitDist(u, a) <= r);
const adjacentTiles = (b: Battle, u: Unit, t: Terrain) => tilesInRange(b, u, 1, 1, u.size).filter((p) => tileAt(b, p.x, p.y) === t);

/** Where an adjacent block would slide (directly away from the pusher), if it can. */
function pushTarget(b: Battle, u: Unit, p: Pos): Pos | null {
  const dx = Math.sign(p.x - Math.max(u.x, Math.min(p.x, u.x + u.size - 1)));
  const dy = Math.sign(p.y - Math.max(u.y, Math.min(p.y, u.y + u.size - 1)));
  if (dx && dy) return null;
  const to = { x: p.x + dx, y: p.y + dy };
  return tileAt(b, to.x, to.y) === 'plain' && !unitAt(b, to.x, to.y) ? to : null;
}
const pushable = (b: Battle, u: Unit, t: Terrain) => adjacentTiles(b, u, t).find((p) => pushTarget(b, u, p));
const strongEnough = (u: Unit) => effectiveStats(u).str >= 12 || Object.values(u.gear ?? {}).some((g) => BRACELETS.includes(g!));
const hasKey = (u: Unit) => hasEffect(u, 'magicalKey') || u.pack.some((p) => p.id === 'smallKey');
const isGel = (a: Unit) => tid(a) === 'gel';

export function ogTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const out: Pos[] = [];
  const scan = (min: number, max: number, ok: (x: number, y: number) => boolean) => {
    for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) {
      const d = footDist(x, y, u.size, u.x, u.y, u.size);
      if (d >= min && d <= max && ok(x, y)) out.push({ x, y });
    }
  };
  switch (def.id) {
    case 'darkTeleport': scan(1, 5, (x, y) => free(b, u, x, y)); break;
    case 'playRecorder': scan(0, 6, (x, y) => free(b, u, x, y)); break;
    case 'candleFire': for (const p of tilesInRange(b, u, 1, 2, u.size)) { const t = tileAt(b, p.x, p.y); if (t !== 'wall' && t !== 'water') out.push(p); } break;
  }
  return out;
}

export function ogTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  switch (def.id) {
    case 'sacredBarrierHyrule': return [u, ...alliesWithin(b, u, 2)];
    case 'darkFireball': return foesWithin(b, u, 4);
    case 'disarmingThrow': return foesWithin(b, u, 3);
    case 'slimeMerge': return alliesWithin(b, u, 1).filter((a) => isGel(a) && a.summoned);
    case 'tripleFireball': return foesWithin(b, u, 5);
    case 'hornCharge': return foesWithin(b, u, 3);
    case 'concentratedBreath': return foesWithin(b, u, 4);
    case 'eyeFixation': return foesWithin(b, u, 4);
  }
  return [];
}

export function ogUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isOGAbility(def)) return undefined;
  if (ogNeedsTarget(def) && !ogTargets(b, u, def).length) return def.id === 'slimeMerge' ? 'No temporary Gel next to you' : 'No one in range';
  if (ogNeedsTile(def) && !ogTiles(b, u, def).length) return 'Nowhere to go';
  switch (def.id) {
    case 'candleFire':
      if (hasEffect(u, 'redCandle')) return null;
      return u.usedAbilities?.includes('candleFire') ? 'The Blue Candle works once per battle' : null;
    case 'graveSummoning': return adjacentTiles(b, u, 'gravestone').length ? null : 'Stand next to a Gravestone';
    case 'fourWayAssault': case 'heavyImpact': return foesWithin(b, u, 1).length ? null : 'No adjacent enemies';
    case 'seedBarrage': return foesWithin(b, u, 3).length ? null : 'No enemies within 3';
    case 'eyeSwarm': return (u.ogEyes ?? 0) <= 0 && u.team === 'enemy' ? 'No eyes left' : foesWithin(b, u, 2).length ? null : 'No enemies within 2';
    case 'fragmentation': return u.hp <= u.stats.hp * 0.6 || u.ogShrunk ? (ENEMIES.lesserDigdogger ? null : 'Can\'t split') : 'Only below 60% HP (or once shrunk)';
    case 'dragonGuard': return u.team === 'enemy' && (u.hp > u.stats.hp * 0.7 || hasBuff(u, 'dragonGuard')) ? 'Not yet' : null;
    case 'pushBoulder': return !adjacentTiles(b, u, 'boulder').length ? 'No boulder next to you' : !strongEnough(u) ? 'Needs 12 STR or a Power Bracelet' : pushable(b, u, 'boulder') ? null : 'It won\'t budge that way';
    case 'pushBlockOH': return pushable(b, u, 'pushBlock') ? null : 'No Push Block that can move';
    case 'openLockedDoor': return !adjacentTiles(b, u, 'lockedDoor').length ? 'No Locked Door next to you' : hasKey(u) ? null : 'Needs a Small Key or the Magical Key';
  }
  return null;
}

export interface OGOutcome {
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

export function castOriginal(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): OGOutcome | null {
  if (!isOGAbility(def)) return null;
  const out: OGOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [] };
  const s = effectiveStats(u);
  const magicMult = u.team === 'player' && b.bonus === 'wisdomOfHyrule' ? 1.2 : 1;
  const strike = (e: Unit, dmg: number, status?: StatusKind, chance = 0, element?: Element, w?: WeaponDef) => {
    if (e.buffs.some((x) => x.barrier)) dmg = 0;
    const ls = ogOnStrike(b, u, e, Math.max(0, Math.floor(dmg)));
    if (ls.line) out.lines.push(ls.line);
    dmg = Math.min(e.hp, Math.max(0, ls.dmg));
    e.hp -= dmg;
    const killed = e.hp <= 0;
    const statuses: StatusKind[] = [];
    if (!killed && status && rng.chance(chance)) { addStatus(e, status, 2); statuses.push(status); }
    out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses });
    if (dmg > 0) { e.lastHitBy = u.uid; if (e.hidden) e.hidden = false; }
    if (killed) {
      u.kills++;
      ogOnKill(b, u, e, rng, dmg, element, w);
      b.units = b.units.filter((x) => x !== e);
      if (!e.summoned) b.fallen.push(e);
      b.log.push(`${u.name} defeated ${e.name}.`);
    } else { const fr = frenzy(e); if (fr) out.lines.push(fr); }
  };
  const magic = (e: Unit, base: number, mult = 1) => Math.max(1, Math.floor((s.mag + base) * mult * magicMult * ogMultiplier(b, u, e, true, WEAPONS.darkFireballs, unitDist(u, e)) - effectiveStats(e).res));
  const phys = (e: Unit, base: number) => Math.max(1, Math.floor((s.str + base) * ogMultiplier(b, u, e, false, WEAPONS[u.weapons[0]], 1) - effectiveStats(e).def));
  const heal = (a: Unit, amt: number) => {
    amt = Math.min(a.stats.hp - a.hp, Math.ceil(amt * (u.team === 'player' ? b.healMult : 1)));
    if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); }
  };
  const group = (r: number) => [u, ...alliesWithin(b, u, r)];
  switch (def.id) {
    // ── Link ──
    case 'triforcesCourage':
      u.statuses = u.statuses.filter((x) => x.kind !== 'fear' && x.kind !== 'confuse');
      buff(u, 'triforcesCourage', "Triforce's Courage", 3);
      out.buffed.push(u.uid);
      out.free = true;
      out.lines.push(`${u.name} steels himself: no fear, no confusion.`);
      break;
    // ── Zelda ──
    case 'lightOfWisdom': {
      const n = revealAll(b, u, 5);
      for (const e of b.units) if (e.team !== u.team && has(e, 'invisibleDarkness') && unitDist(u, e) <= 5) { e.hidden = false; buff(e, 'wisdomLit', 'Light of Wisdom', 2); }
      out.lines.push(n ? `The Light of Wisdom shines: ${n} hidden thing${n > 1 ? 's' : ''} revealed.` : 'The Light of Wisdom shines. Nothing is hiding nearby.');
      break;
    }
    case 'sacredBarrierHyrule': buff(target!, 'sacredBarrierHyrule', 'Sacred Barrier', 1); out.buffed.push(target!.uid); out.lines.push(`${target!.name} is shielded from magic.`); break;
    case 'wisdomsGuidance': for (const a of group(2)) { buff(a, 'wisdomsGuidance', "Wisdom's Guidance", 2, { skl: 3, lck: 5 }); out.buffed.push(a.uid); } break;
    case 'triforceRestoration':
      for (const a of group(2)) { heal(a, s.mag / 2 + 6); a.mp = Math.min(a.stats.mp, a.mp + 6); }
      out.lines.push('The Triforce\'s light restores the army.');
      break;
    // ── Ganon ──
    case 'darkFireball': strike(target!, magic(target!, 8), 'burn', 30, 'fire', WEAPONS.darkFireballs); break;
    case 'darkTeleport':
      out.warped = { from: { x: u.x, y: u.y }, to: { ...at! } };
      u.x = at!.x; u.y = at!.y;
      addStatus(u, 'veiled', 1);
      out.lines.push(`${u.name} vanishes and reappears.`);
      break;
    // ── Monsters ──
    case 'disarmingThrow': {
      const t = target!;
      strike(t, phys(t, WEAPONS[u.weapons.find((w) => WEAPONS[w]?.type === 'boomerang') ?? '']?.might ?? 6));
      if (b.units.includes(t) && rng.chance(40)) { const lost = disarm(b, t); if (lost) out.lines.push(`${t.name} is disarmed!`); }
      break;
    }
    case 'slimeMerge': {
      const g = target!;
      b.units = b.units.filter((x) => x !== g);
      heal(u, g.hp + 8);
      buff(u, 'slimeMerge', 'Merged Slime', 99, { def: 3, str: 2 });
      out.buffed.push(u.uid);
      out.lines.push(`${u.name} absorbs the other Gel and swells up.`);
      break;
    }
    case 'graveSummoning': {
      const grave = adjacentTiles(b, u, 'gravestone')[0];
      const g = spawn(b, 'ghini', { ...grave, size: 1 }, u.team, u.level - 1);
      out.lines.push(g ? 'A Ghini rises from the grave.' : 'The grave stays quiet.');
      break;
    }
    case 'eyeSwarm':
      for (const e of foesWithin(b, u, 2)) strike(e, Math.max(1, Math.floor(s.mag / 3 + (u.ogEyes ?? 0)) - Math.floor(effectiveStats(e).res / 2)));
      break;
    case 'tripleFireball': {
      const t = target!;
      const lanes = [t, ...b.units.filter((e) => e.team !== u.team && e !== t && unitDist(e, t) === 1)].slice(0, 3);
      for (const e of lanes) strike(e, magic(e, 6), 'burn', 20, 'fire');
      break;
    }
    case 'hornCharge': {
      const t = target!;
      const spot = nearFree(b, u, { x: t.x, y: t.y, size: t.size }, 1);
      if (spot && unitDist(u, t) > 1) { out.warped = { from: { x: u.x, y: u.y }, to: spot }; u.x = spot.x; u.y = spot.y; }
      strike(t, phys(t, 6));
      if (b.units.includes(t) && pushAway(b, t, u, 1)) out.lines.push(`${t.name} is knocked back.`);
      break;
    }
    case 'dragonGuard': buff(u, 'dragonGuard', 'Dragon Guard', 2, { def: 6, res: 6 }); out.buffed.push(u.uid); out.free = true; b.log.push(`${u.name} raises its Dragon Guard.`); break;
    case 'concentratedBreath': strike(target!, magic(target!, 6, 2), 'burn', 40, 'fire'); break;
    case 'fourWayAssault': for (const e of foesWithin(b, u, 1)) strike(e, phys(e, 4)); break;
    case 'seedBarrage': for (const e of foesWithin(b, u, 3)) strike(e, phys(e, 4 - Math.ceil(s.str / 2))); break;
    case 'heavyImpact':
      for (const e of foesWithin(b, u, 1)) { strike(e, phys(e, 4 - Math.ceil(s.str / 2))); if (b.units.includes(e)) pushAway(b, e, u, 1); }
      break;
    case 'eyeFixation': addStatus(target!, 'exposed', 3); out.statuses.push({ uid: target!.uid, kind: 'exposed' }); out.lines.push(`${u.name} fixes its eye on ${target!.name}.`); break;
    case 'fragmentation': {
      const n = [spawn(b, 'lesserDigdogger', u, u.team, u.level), spawn(b, 'lesserDigdogger', u, u.team, u.level)].filter(Boolean).length;
      u.ogShrunk = true;
      (u.usedAbilities ??= []).push('fragmentation');
      b.log.push(`${u.name} splits! ${n} Lesser Digdogger${n === 1 ? '' : 's'} break${n === 1 ? 's' : ''} off, and it shrinks.`);
      out.lines.push(`${u.name} fragments!`);
      out.free = true;
      break;
    }
    // ── Tools ──
    case 'playRecorder': {
      const from = { x: u.x, y: u.y };
      for (const e of b.units.filter((x) => x.team !== u.team)) {
        if (has(e, 'resonantWeakness') && !e.ogShrunk && unitDist(u, e) <= 4) { e.ogShrunk = true; buff(e, 'shrunk', 'Shrunk', 99, { def: -8 }); out.lines.push(`The Recorder\'s tune shrinks ${e.name}!`); }
      }
      for (const e of b.units.filter((x) => x.team !== u.team && has(x, 'sensitiveHearing') && unitDist(u, x) <= 3)) strike(e, Math.max(1, (s.mag + 8) * 2 - effectiveStats(e).res));
      if (at && (at.x !== u.x || at.y !== u.y)) { out.warped = { from, to: { ...at } }; u.x = at.x; u.y = at.y; out.lines.push('A whirlwind carries the player away.'); }
      break;
    }
    case 'candleFire': {
      const p = at!;
      const k = keyOf(b, p.x, p.y);
      ignite(b, [p]);
      const e = unitAt(b, p.x, p.y);
      if (e && e.team !== u.team) strike(e, 8, 'burn', 50, 'fire');
      if (b.tiles[k] === 'burnableBush') {
        b.tiles[k] = 'plain';
        if (maybeStairs(b, k, 35, rng)) { ogState(b).found++; out.lines.push('The bush burns away — a hidden staircase!'); }
        else if (rng.chance(25)) { const r = Math.round(20 * treasureMult(b)); b.bonusRupees = (b.bonusRupees ?? 0) + r; out.lines.push(`The bush burns away: ₹${r} hidden underneath.`); }
        else out.lines.push('The bush burns away.');
      }
      if (hasEffect(u, 'redCandle')) (u.cooldowns ??= {}).candleFire = 2;
      else (u.usedAbilities ??= []).push('candleFire');
      break;
    }
    // ── Battlefield spaces ──
    case 'pushBoulder': case 'pushBlockOH': {
      const kind: Terrain = def.id === 'pushBoulder' ? 'boulder' : 'pushBlock';
      const p = pushable(b, u, kind)!;
      const to = pushTarget(b, u, p)!;
      const k = keyOf(b, p.x, p.y);
      b.tiles[keyOf(b, to.x, to.y)] = kind;
      b.tiles[k] = 'plain';
      out.lines.push(kind === 'boulder' ? `${u.name} heaves the boulder aside.` : `${u.name} pushes the block.`);
      if (kind === 'pushBlock') {
        if (b.tiles.includes('shutterDoor')) { for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i] === 'shutterDoor') b.tiles[i] = 'plain'; out.lines.push('Somewhere, Shutter Doors grind open.'); }
      }
      if (maybeStairs(b, k, kind === 'boulder' ? 35 : 40, rng)) { ogState(b).found++; out.lines.push('Underneath: a hidden staircase!'); }
      out.free = true;
      break;
    }
    case 'openLockedDoor': {
      const p = adjacentTiles(b, u, 'lockedDoor')[0];
      b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      if (!hasEffect(u, 'magicalKey')) {
        const i = u.pack.findIndex((x) => x.id === 'smallKey');
        if (--u.pack[i].uses <= 0) u.pack.splice(i, 1);
      }
      out.lines.push('The door unlocks.');
      out.free = true;
      break;
    }
  }
  b.log.push(...out.lines.filter((l) => !b.log.includes(l)));
  return out;
}

/** Status immunities (status.ts): Triforce's Courage. */
export function ogImmune(u: Unit, kind: StatusKind): boolean {
  return (kind === 'fear' || kind === 'confuse') && !!u.buffs?.some((x) => x.id === 'triforcesCourage');
}

// ───────────────────────── Items ─────────────────────────

/** Old Woman's Life Medicine: healing items heal 30% more near her. */
export function ogHealItemMult(b: Battle, u: Unit): number {
  return b.units.some((a) => a.team === u.team && has(a, 'lifeMedicine') && unitDist(a, u) <= 2) ? 1.3 : 1;
}

/** Link's Quick Item: once per battle, an item doesn't use the action. */
export function ogQuickItem(u: Unit): boolean {
  if (!has(u, 'quickItem') || u.usedAbilities?.includes('quickItem')) return false;
  (u.usedAbilities ??= []).push('quickItem');
  return true;
}

/** Extra conditions on using an item here (items.ts canUseHere). */
export function ogCanUseItem(b: Battle, u: Unit, id: string): boolean | undefined {
  if (id === 'smallKey') return adjacentTiles(b, u, 'lockedDoor').length > 0;
  if (id === 'blueLifeMedicine' || id === 'redLifeMedicine') return u.hp < u.stats.hp;
  return undefined;
}

export function useOriginalItem(b: Battle, u: Unit, id: string, rng: RNG, target?: Unit, at?: Pos): string | null {
  const t = (stats: Record<string, number>, name: string, turns = 3, bid = id) => { buff(u, bid, name, turns, stats); };
  switch (id) {
    case 'silverArrow': t({}, 'Silver Arrows', 3, 'silverArrows'); return `${u.name} nocks a Silver Arrow.`;
    case 'enemyBait': {
      const p = at ?? u;
      let n = 0;
      for (const e of b.units) {
        if (e.team === u.team || e.isBoss || !isMonster(e) || footDist(p.x, p.y, 1, e.x, e.y, e.size) > 2) continue;
        if (tid(e) === 'goriya') buff(e, 'fed', 'Eating', 2); else addStatus(e, 'confuse', 1);
        n++;
      }
      let line = n ? `${n} monster${n > 1 ? 's' : ''} go for the food.` : 'Nobody takes the bait.';
      for (const q of [p, ...tilesInRange(b, p, 1, 1)]) {
        const k = keyOf(b, q.x, q.y);
        if (b.tiles[k] !== 'goriyaCheckpoint') continue;
        b.tiles[k] = 'plain';
        const r = Math.round(50 * treasureMult(b));
        b.bonusRupees = (b.bonusRupees ?? 0) + r;
        line += ` The Hungry Goriya eats and wanders off, leaving ₹${r}.`;
      }
      return line;
    }
    case 'blueLifeMedicine': case 'redLifeMedicine': { const h = u.stats.hp - u.hp; u.hp = u.stats.hp; return `${u.name} drinks the medicine (+${h} HP).`; }
    case 'magicalClock': {
      let n = 0;
      for (const e of b.units) if (e.team !== u.team && !e.isBoss) { addStatus(e, 'stun', 1); n++; }
      return `The Magical Clock ticks: time stops for ${n} enem${n === 1 ? 'y' : 'ies'}.`;
    }
    case 'rupeeCache': { const r = Math.round(rng.int(30, 150) * treasureMult(b)); b.bonusRupees = (b.bonusRupees ?? 0) + r; return `A Rupee Cache: ₹${r}!`; }
    case 'smallKey': {
      const p = adjacentTiles(b, u, 'lockedDoor')[0];
      if (p) b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      return 'The Small Key turns. The door opens.';
    }
    case 'goriyaFang': t({}, 'Goriya Fang'); return `${u.name}'s boomerang is fitted with a fang.`;
    case 'ropeVenom': t({}, 'Rope Venom', 5); return `${u.name} coats the weapon in venom.`;
    case 'zolGelatin': { if (target && target.team !== u.team) { addStatus(target, 'root', 1); return `${target.name} is stuck in the gelatin.`; } return 'The gelatin splats on the floor.'; }
    case 'vireWing': t({ mag: 4 }, 'Vire Wing'); return `${u.name} draws on the dark wing (+4 MAG).`;
    case 'polsVoiceEar': { const n = revealAll(b, u, 6); return n ? `The ear twitches: ${n} hidden thing${n > 1 ? 's' : ''} found.` : 'The ear hears nothing hidden.'; }
    case 'ghiniEssence': buff(u, 'spectralStep', 'Ghini Essence', 2); return `${u.name} turns spectral.`;
    case 'lanmolaSegment': t({ def: 4 }, 'Lanmola Segment'); return `${u.name} straps on a shell segment (+4 DEF).`;
    case 'patraEyeFragment': t({}, 'Patra\'s Eye', 3, 'patraEye'); return `${u.name}'s aim sharpens (+20 magic Hit).`;
    case 'aquamentusScale': t({ def: 5, res: 5 }, 'Dragon Scale'); return `${u.name} is armored in dragon scale.`;
    case 'manhandlaPetal': {
      const h = Math.min(u.stats.hp - u.hp, Math.ceil(20 * ogHealItemMult(b, u)));
      u.hp += h;
      u.statuses = u.statuses.filter((x) => x.kind !== 'poison');
      return `${u.name} eats the petal (+${h} HP, poison cured).`;
    }
    case 'digdoggerFragment': t({ con: 5, def: 4 }, 'Digdogger Fragment'); return `${u.name} grows heavy and hard (+5 CON, +4 DEF).`;
  }
  return null;
}
