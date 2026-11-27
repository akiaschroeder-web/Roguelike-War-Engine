// Four Swords & Four Swords Adventures battle rules: Force Gems and Force Power (shared by the army, reset every
// battle, four thresholds), the Four Link formations and formation commands (Command Points), the four Links' kits,
// Zelda, Shadow Link (shadow duplicates, giant bombs, stolen gems), Ganon, the Shrine Maidens' blessings, the military
// classes, the pack's monsters and bosses, the fourteen battlefield spaces (Dark World Portals, Shadow Mirror Gates,
// Giant Bomb Zones…), Level 2 tools and the Gnat Hat (the base game's Micro units, engine/micro.ts).
// Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts, abilities.ts, run.ts and battleView.ts.

import { BOSSES, ENEMIES, ITEMS, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import {
  DARK_REGIONS, DESERT_REGIONS, FORCE_GEMS, FORCE_THRESHOLDS, FORMATION_CP, FORMATION_NEEDS, FORMATIONS, FOUR_LINKS, FS_FEATURES, FS_SPECIAL, FS_SPOILS, HYRULE_SOLDIERS, LEVEL2,
} from '../content/fourswords';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { ignite } from './field';
import { lgSaveFromDeath } from './legend';
import { mnSaveFromDeath } from './minish';
import { RNG } from './rng';
import { INF } from './rules';
import { addStatus } from './status';
import { activeGear, effectiveStats, makeEnemy, unitTags } from './units';
import { pullToward, pushAway } from './windwaker';
import { wildSaveFromDeath } from './wild';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Four Swords battle state. */
    fs?: FSState;
  }
  interface Unit {
    /** A shadow duplicate (Shadow Reflection, a Shadow Mirror Gate): turns left before it fades. */
    fsDup?: number;
    /** The Shadow Mirror Gate (tile key) that spawned this duplicate. */
    fsGate?: number;
    /** A Big Bomb's fuse: turns left. */
    fsFuse?: number;
    /** Delu Zol: slimes split off so far. */
    fsSplits?: number;
    /** Big Darknut: armour shed. */
    fsShed?: boolean;
  }
}

export interface FSBomb { x: number; y: number; turns: number; team: string; power: number; radius: number; by: string; zone: { k: number; t: Terrain }[] }
export interface FSState {
  /** Force Power collected this battle (the army's, shared). */
  force: number;
  /** Thresholds reached this battle (each gave +1 CP). */
  reached: string[];
  /** The Links' formation (player side) and the turns it holds. */
  formation?: { id: string; turns: number };
  /** Force Gem Deposits: tile key -> Force Power. */
  deposits: Record<number, number>;
  /** Dark World Portals in pairs (tile keys: 0↔1, 2↔3…). */
  portals: number[];
  /** Live Giant Bombs. */
  bombs: FSBomb[];
  /** Quest items found in battle (materials). */
  found: string[];
  /** Equipped tools upgraded by a Great Fairy pedestal (reverted after the battle). */
  temp: { uid: string; from: string; to: string }[];
  /** Last phase processed (`turn:team`), for once-per-phase effects. */
  phase?: string;
  /** Every listed boss must fall (paired bosses, the finale). */
  allBosses?: boolean;
  /** The finale: Vaati falls, then Ganon. */
  finale?: boolean;
  ganonOut?: boolean;
  /** Force Power collection multiplier (the Force Shrine). */
  collect: number;
}

export const fsState = (b: Battle): FSState => (b.fs ??= { force: 0, reached: [], deposits: {}, portals: [], bombs: [], found: [], temp: [], collect: 1 });
const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.bossId ?? u.templateId ?? u.artId ?? '';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
const fsTag = (u: Unit, t: string) => activeGear(u).some((g) => g.fs?.includes(t)) || !!WEAPONS[u.weapons[0]]?.fs?.includes(t);
function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}, barrier = false) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats, ...(barrier ? { barrier: true } : {}) });
}
function roll(b: Battle): number {
  const r = new RNG(b.rngState);
  const v = r.int(0, 99);
  b.rngState = r.state;
  return v;
}
const FS_WORLD = (b: Battle) => worldDef(b.world).campaign === 'fourswords';
/** One of the four Links (or a form of one). */
export const isLink = (u: Unit) => FOUR_LINKS.includes(u.templateId ?? '') || FOUR_LINKS.includes(u.originalForm?.templateId ?? '');
const linksOf = (b: Battle, team: string) => b.units.filter((u) => u.team === team && !u.captive && isLink(u) && u.fsDup === undefined);
const isDark = (u: Unit) => ['demon', 'undead', 'shadow', 'phantom', 'nightmare', 'twili'].includes(u.race) || unitTags(u).some((t) => t === 'demon' || t === 'undead' || t === 'shadow');
const isMonster = (u: Unit) => ['monster', 'demon', 'undead', 'chuchu', 'aquatic', 'construct', 'fireCreature', 'stalMonster'].includes(u.race) || !!TEMPLATES[u.templateId ?? '']?.monster;
const isSoldier = (u: Unit) => HYRULE_SOLDIERS.includes(u.templateId ?? '') || ['soldier', 'knight', 'archer', 'spearmanFS', 'bombardierFS', 'captainFS'].includes(u.classId);
const WIND_IDS = new Set(['windTome', 'capGust', 'darkCyclone', 'galeBoomerang', 'cycloneFS', 'greatTornado', 'windBarrierFS']);
const isWind = (w: WeaponDef | undefined) => !!w && (!!w.fs?.includes('wind') || WIND_IDS.has(w.id));
const isSacred = (w: WeaponDef | undefined, element?: Element) => element === 'light' || !!w?.sacredMult || !!w?.mc?.includes('sacred');
/** Force Power gives its threshold effects while it is held (stolen gems can drop it back). */
export const forceAt = (b: Battle, at: number) => (b.fs?.force ?? 0) >= at;
const darkHere = (b: Battle, u: Unit) => !!b.night || !!b.fog || DARK_REGIONS.includes(b.world) || hasBuff(u, 'fsDarkWorld') || tileAt(b, u.x, u.y) === 'fsDarkPortal';
const groups = (b: Battle) => b.groupSupports ?? [];

// ───────────────────────── Force Power ─────────────────────────

/** The army collects Force Power: thresholds open Force Barriers and give a Command Point each. */
export function fsGainForce(b: Battle, amount: number, why?: string, raw = false): string[] {
  const st = fsState(b);
  const players = b.units.filter((u) => u.team === 'player');
  const mult = raw ? 1 : st.collect * (players.some((u) => fsTag(u, 'gemBonus')) ? 1.25 : 1);
  const gain = Math.max(0, Math.round(amount * mult));
  if (!gain) return [];
  st.force += gain;
  const lines = [why ? `${why}: +${gain} Force Power (${st.force}).` : `+${gain} Force Power (${st.force}).`];
  for (const t of FORCE_THRESHOLDS) {
    if (st.force < t.at || st.reached.includes(t.id)) continue;
    st.reached.push(t.id);
    lines.push(`${t.name}! ${t.desc}`);
    if (b.cp !== undefined) { b.cp++; b.cpMax = (b.cpMax ?? 0) + 1; }
    if (t.at === 500) {
      let n = 0;
      b.tiles.forEach((x, k) => { if (x === 'forceBarrier') { b.tiles[k] = 'plain'; n++; } });
      if (n) lines.push(`${n} Force Barrier${n > 1 ? 's' : ''} dissolve${n > 1 ? '' : 's'}.`);
    }
  }
  b.log.push(...lines);
  return lines;
}

/** Shadow Link's hits scatter the army's gems onto the field (they can be picked up again). */
function scatterGems(b: Battle, near: Unit): string | null {
  const st = fsState(b);
  if (st.force <= 0) return null;
  const n = Math.min(st.force, 40 + Math.floor(st.force * 0.1));
  st.force -= n;
  const spot = tilesInRange(b, near, 1, 2, near.size).find((p) => tileAt(b, p.x, p.y) === 'plain' && !unitAt(b, p.x, p.y));
  if (spot) { const k = keyOf(b, spot.x, spot.y); b.tiles[k] = 'forceGemDeposit'; st.deposits[k] = (st.deposits[k] ?? 0) + n; }
  const line = `Shadow Link knocks ${n} Force Power loose${spot ? ' — the gems scatter nearby' : ''} (${st.force} left).`;
  b.log.push(line);
  return line;
}

/** A gem from a defeated enemy: mostly small, sometimes large; Giant Force Gems from bosses. */
function killGem(b: Battle, victim: Unit): number {
  if (victim.isBoss) return FORCE_GEMS.giant.force;
  if (victim.fsDup !== undefined || victim.summoned) return FORCE_GEMS.smallBlue.force;
  const r = roll(b);
  const base = r < 25 ? FORCE_GEMS.smallBlue.force : r < 60 ? FORCE_GEMS.smallRed.force : r < 90 ? FORCE_GEMS.largeGreen.force : FORCE_GEMS.largeBlue.force;
  return base + (TEMPLATES[victim.templateId ?? '']?.generic === false ? FORCE_GEMS.largeBlue.force : 0);
}

/** Force Power is the Four Sword's: it counts in this campaign's regions and wherever the Links fight. */
export const fsActive = (b: Battle) => FS_WORLD(b) || linksOf(b, 'player').length > 0;

// ───────────────────────── Movement ─────────────────────────

/** Shadow Link walks through dark terrain; the Shadow Mirror crosses portals freely. */
export function fsTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  if (has(u, 'shadowReflectionSkill') && (t === 'forest' || t === 'darkness' || t === 'twilightFog' || t === 'fsDarkPortal' || t === 'gloom')) c = Math.min(c, 1);
  void b;
  return c;
}

// ───────────────────────── Battlefield setup ─────────────────────────

/** Place the region's battlefield spaces (Force Gem Deposits get their gems; portals are paired). */
export function decorateFourSwords(b: Battle, rng: RNG) {
  const feats = FS_FEATURES[b.world];
  if (!feats || b.naval) return;
  const st = fsState(b);
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 2 && i % b.width <= b.width - 2 ? i : -1)).filter((i) => i >= 0));
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    for (let j = 0; j < n; j++) {
      // Portals pair across the field: one on each half. Obstacles only go on open ground (never a ford or a pass).
      const k = t === 'fsDarkPortal' ? takeHalf(b, plains, j % 2 === 0) : OBSTACLES.has(t) ? takeOpen(b, plains) : plains.pop();
      if (k === undefined) continue;
      b.tiles[k] = t;
      if (t === 'forceGemDeposit') st.deposits[k] = rng.pick([FORCE_GEMS.largeGreen.force, FORCE_GEMS.largeBlue.force, FORCE_GEMS.largeBlue.force, FORCE_GEMS.largeRed.force]);
      if (t === 'fsDarkPortal') st.portals.push(k);
    }
  }
  if (st.portals.length % 2) { b.tiles[st.portals.pop()!] = 'plain'; }
  // Boss fights: a Giant Force Gem in the arena.
  if (b.units.some((u) => u.isBoss)) { const k = plains.pop(); if (k !== undefined) { b.tiles[k] = 'forceGemDeposit'; st.deposits[k] = FORCE_GEMS.giant.force; } }
}
const OBSTACLES = new Set<Terrain>(['forceBarrier', 'cooperativeBlock', 'magneticPillar', 'shadowMirrorGate', 'sanctuarySeal']);
/** A plain whose eight neighbours are all open ground (plain or forest). */
function takeOpen(b: Battle, plains: number[]): number | undefined {
  const open = (x: number, y: number) => inBounds(b, x, y) && (b.tiles[keyOf(b, x, y)] === 'plain' || b.tiles[keyOf(b, x, y)] === 'forest');
  const i = plains.findIndex((k) => {
    const x = k % b.width, y = Math.floor(k / b.width);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && !open(x + dx, y + dy)) return false;
    return true;
  });
  return i >= 0 ? plains.splice(i, 1)[0] : undefined;
}
function takeHalf(b: Battle, plains: number[], left: boolean): number | undefined {
  const i = plains.findIndex((k) => (k % b.width < b.width / 2) === left);
  return i >= 0 ? plains.splice(i, 1)[0] : plains.pop();
}

/** Battle start: Big Bomb fuses, Geldmen burrow in the desert. */
export function fourSwordsBattleStart(b: Battle) {
  for (const u of b.units) {
    if (has(u, 'massiveDetonation')) u.fsFuse = 3;
    if (has(u, 'sandAmbush') && u.team === 'enemy' && DESERT_REGIONS.includes(b.world)) u.hidden = true;
  }
}

// ───────────────────────── Start of each turn ─────────────────────────

export interface FSEvent { uid: string; heal: number; damage: number; source: string }

export function fsStartPhase(b: Battle, u: Unit, events: FSEvent[]) {
  const st = fsState(b);
  const heal = (who: Unit, pct: number, source: string) => {
    const amt = Math.min(who.stats.hp - who.hp, Math.ceil(who.stats.hp * pct));
    if (amt > 0) { who.hp += amt; events.push({ uid: who.uid, heal: amt, damage: 0, source }); }
  };
  // Once per phase: formations hold, Giant Bombs tick, Shadow Mirror Gates spawn, switches are checked.
  const mark = `${b.turn}:${u.team}`;
  if (st.phase !== mark) {
    st.phase = mark;
    if (u.team === 'player' && st.formation && --st.formation.turns <= 0) { b.log.push(`The ${FORMATIONS[st.formation.id].name} formation breaks up.`); st.formation = undefined; }
    tickBombs(b, u.team, events);
    if (u.team === 'enemy') spawnFromMirrors(b);
    if (u.team === 'player') checkSwitches(b);
  }
  if (!b.units.includes(u)) return;
  // Shadow duplicates fade.
  if (u.fsDup !== undefined && --u.fsDup <= 0) {
    b.units = b.units.filter((x) => x !== u);
    events.push({ uid: u.uid, heal: 0, damage: 0, source: 'fades back into shadow' });
    return;
  }
  // A Big Bomb's fuse.
  if (u.fsFuse !== undefined && --u.fsFuse <= 0) { detonateBigBomb(b, u, events); if (!b.units.includes(u)) return; }
  // Player units collect the gems underfoot.
  if (u.team === 'player') collectAt(b, u);
  // The Shrine Maidens' blessings.
  for (const a of alliesOf(b, u)) {
    if (unitDist(u, a) > 2) continue;
    if (has(a, 'forestBlessing')) { heal(u, 0.05, 'Forest Blessing'); u.statuses = u.statuses.filter((x) => x.kind !== 'poison'); }
    if (has(a, 'waterBlessing')) { heal(u, 0.05, 'Water Blessing'); u.mp = Math.min(u.stats.mp, u.mp + 3); }
    if (has(a, 'radiantBlessing')) u.statuses = u.statuses.filter((x) => !['curse', 'silence', 'weaken'].includes(x.kind));
    if (has(a, 'protectiveBlessing')) { buff(u, 'wildShield', 'Protective Blessing', 1); (u.turnUses ??= {}).wildShield = Math.max(u.turnUses.wildShield ?? 0, 5); }
  }
  if (has(u, 'shadowBlessing') && !foesOf(b, u).some((e) => unitDist(u, e) <= 1)) addStatus(u, 'veiled', 1);
  if (fsTag(u, 'shadowConceal') && (b.fog || darkHere(b, u) || tileAt(b, u.x, u.y) === 'forest')) addStatus(u, 'veiled', 1);
  if (b.groupSupports?.includes('darkConspiracy') && u.team === 'player' && ['vaatiWindMage', 'vaatiHylian', 'ganonFSA', 'shadowLink'].includes(u.templateId ?? '') && !foesOf(b, u).some((e) => unitDist(u, e) <= 1)) addStatus(u, 'veiled', 1);
  // Monsters and bosses.
  if (has(u, 'sandAmbush') && u.team === 'enemy' && DESERT_REGIONS.includes(b.world) && !foesOf(b, u).some((e) => unitDist(u, e) <= 1)) u.hidden = true;
  if (has(u, 'shiftingDefense')) heal(u, 0.1, 'Gel Recovery');
  if (has(u, 'moltenBody') && footprint(u.x, u.y, u.size).some((p) => tileAt(b, p.x, p.y) === 'lava')) heal(u, 0.1, 'Molten Body');
  if (has(u, 'windFortress')) for (const e of foesOf(b, u)) if (unitDist(u, e) <= 1 && pushAway(b, e, u, 1)) events.push({ uid: e.uid, heal: 0, damage: 0, source: 'is blown back by the Wind Fortress' });
  if (tid(u) === 'mightyDarknut' && u.isBoss && !u.fsShed && u.hp < u.stats.hp / 2) {
    u.fsShed = true;
    buff(u, 'fsArmorShed', 'Armour shed', 99, { def: -8, spd: 6, str: 4 });
    events.push({ uid: u.uid, heal: 0, damage: 0, source: 'sheds its armour and speeds up' });
  }
}

/** Collect the Force Gem Deposit, Formation Switch and Royal Jewel Pedestal under a player unit. */
function collectAt(b: Battle, u: Unit): string[] {
  const st = fsState(b);
  const lines: string[] = [];
  for (const p of footprint(u.x, u.y, u.size)) {
    const k = keyOf(b, p.x, p.y);
    const t = b.tiles[k];
    if (t === 'forceGemDeposit') {
      const n = st.deposits[k] ?? FORCE_GEMS.largeGreen.force;
      delete st.deposits[k];
      b.tiles[k] = 'plain';
      lines.push(...fsGainForce(b, n, `${u.name} collects Force Gems`));
    }
    if (t === 'formationSwitch' && st.formation) {
      b.tiles[k] = 'plain';
      for (const e of b.units) if (e.team !== u.team && e.hidden) e.hidden = false;
      lines.push(...fsGainForce(b, 150, `The Formation Switch answers the ${FORMATIONS[st.formation.id].name}`));
    }
    if (t === 'royalJewelPedestal' && (b.owned ?? []).includes('royalJewel')) {
      b.tiles[k] = 'plain';
      openAll(b);
      lines.push(...fsGainForce(b, 200, 'A Royal Jewel fits the pedestal: the way opens'));
    }
  }
  return lines;
}
function openAll(b: Battle) {
  b.tiles.forEach((x, k) => { if (x === 'forceBarrier' || x === 'sanctuarySeal') b.tiles[k] = 'plain'; });
}
/** Four allies on or next to a Four-Person Switch press it (Hero Stack counts double). */
function checkSwitches(b: Battle) {
  b.tiles.forEach((t, k) => {
    if (t !== 'fourPersonSwitch') return;
    const x = k % b.width, y = Math.floor(k / b.width);
    const near = b.units.filter((u) => u.team === 'player' && footDist(x, y, 1, u.x, u.y, u.size) <= 1);
    const n = near.length + near.filter((u) => hasBuff(u, 'fsStacked')).length;
    if (n < 4) return;
    b.tiles[k] = 'plain';
    openAll(b);
    fsGainForce(b, 200, 'Four of you press the Four-Person Switch');
  });
}

/** After a player move (battle view): gems, switches and pedestals underfoot. */
export function fsAfterMove(b: Battle, u: Unit): string | null {
  if (u.team !== 'player') return null;
  const lines = collectAt(b, u);
  checkSwitches(b);
  return lines.length ? lines.join(' ') : null;
}

// ───────────────────────── Bombs, mirrors and duplicates ─────────────────────────

function hurtUnit(b: Battle, e: Unit, dmg: number, by?: Unit): boolean {
  dmg = Math.min(e.hp, Math.max(0, Math.floor(dmg)));
  if (e.buffs.some((x) => x.barrier)) dmg = 0;
  e.hp -= dmg;
  if (e.hp > 0) return false;
  b.units = b.units.filter((x) => x !== e);
  if (!e.summoned) b.fallen.push(e);
  if (by) { by.kills++; fsOnKill(b, by, e); }
  return true;
}

function placeBomb(b: Battle, at: Pos, team: string, power: number, turns: number, by: string) {
  const st = fsState(b);
  const zone: { k: number; t: Terrain }[] = [];
  for (const p of tilesInRange(b, at, 0, 2)) {
    const k = keyOf(b, p.x, p.y);
    const t = b.tiles[k];
    if (['plain', 'forest', 'fort', 'mountain'].includes(t)) { zone.push({ k, t }); b.tiles[k] = 'giantBombZone'; }
  }
  st.bombs.push({ x: at.x, y: at.y, turns, team, power, radius: 2, by, zone });
}

function tickBombs(b: Battle, team: string, events: FSEvent[]) {
  const st = fsState(b);
  for (const bomb of [...st.bombs]) {
    if (bomb.team !== team || --bomb.turns > 0) continue;
    st.bombs = st.bombs.filter((x) => x !== bomb);
    for (const z of bomb.zone) if (b.tiles[z.k] === 'giantBombZone') b.tiles[z.k] = z.t;
    const by = b.units.find((u) => u.uid === bomb.by);
    for (const e of b.units.filter((x) => x.team !== team && footDist(bomb.x, bomb.y, 1, x.x, x.y, x.size) <= bomb.radius)) {
      const dmg = Math.min(e.hp, bomb.power * (tid(e) === 'dodongo' ? 3 : 1));
      if (has(e, 'armoredShell')) buff(e, 'fsFlipped', 'Flipped', 2, { def: -5 });
      if (has(e, 'frozenDefense')) buff(e, 'fsThawed', 'Ice shattered', 2);
      hurtUnit(b, e, dmg, by);
      events.push({ uid: e.uid, heal: 0, damage: dmg, source: 'the Giant Bomb' });
    }
    blastTiles(b, bomb, bomb.radius);
    b.log.push('The Giant Bomb explodes!');
  }
}
/** Bomb blasts break cracked walls, Shadow Mirror Gates, Cooperative Blocks and (Giant Bombs) Sanctuary Seals. */
function blastTiles(b: Battle, at: Pos, r: number, giant = true): number {
  let n = 0;
  for (const p of tilesInRange(b, at, 0, r)) {
    const k = keyOf(b, p.x, p.y);
    if (b.tiles[k] === 'cracked' || b.tiles[k] === 'shadowMirrorGate' || b.tiles[k] === 'cooperativeBlock' || (giant && b.tiles[k] === 'sanctuarySeal')) { b.tiles[k] = 'plain'; n++; }
  }
  return n;
}

function detonateBigBomb(b: Battle, u: Unit, events: FSEvent[]) {
  const s = effectiveStats(u);
  for (const e of foesOf(b, u).filter((x) => unitDist(u, x) <= 2)) {
    const dmg = Math.min(e.hp, Math.max(1, s.str + 10 - Math.floor(effectiveStats(e).def / 2)));
    hurtUnit(b, e, dmg, u.team === 'player' ? u : undefined);
    events.push({ uid: e.uid, heal: 0, damage: dmg, source: `${u.name}'s Massive Detonation` });
  }
  blastTiles(b, u, 2, false);
  if (u.team === 'enemy') {
    b.units = b.units.filter((x) => x !== u);
    b.fallen.push(u);
    events.push({ uid: u.uid, heal: 0, damage: u.hp, source: 'explodes' });
    u.hp = 0;
  } else {
    const d = u.hp - 1;
    u.hp = 1;
    u.fsFuse = 3;
    events.push({ uid: u.uid, heal: 0, damage: d, source: 'explodes (the fuse is relit)' });
  }
}

/** A shadow duplicate of Shadow Link (from Shadow Reflection or a Shadow Mirror Gate). */
function shadowDuplicate(b: Battle, src: Unit | null, team: string, at: Pos, level: number, turns: number, strong = false): Unit | null {
  const base = src ?? (BOSSES.shadowLink ? makeEnemy(BOSSES.shadowLink, b.world, level, `fsd${b.uidCounter++}`, new RNG(b.rngState + b.uidCounter)) : null);
  if (!base) return null;
  const s = { ...base.stats };
  s.hp = Math.max(1, Math.round(s.hp * (strong ? 0.6 : 0.4)));
  for (const k of ['str', 'mag', 'skl'] as const) s[k] = Math.round(s[k] * (strong ? 0.75 : 0.6));
  const dup: Unit = {
    ...base, uid: `fsd${b.uidCounter++}`, name: `${base.name} (Shadow)`, stats: s, hp: s.hp, x: at.x, y: at.y, team: team as Unit['team'], weapons: [base.weapons[0]], pack: [], abilities: [],
    skills: [], gear: {}, buffs: [], statuses: [], isCommander: false, isBoss: false, summoned: true, fsDup: turns, moved: true, acted: true, kills: 0, movedDist: 0, wear: {},
    usedAbilities: [], cooldowns: {}, originalForm: undefined, ai: 'aggressive', artOverride: 'shadowLink',
  };
  b.units.push(dup);
  return dup;
}
const freeSpot = (b: Battle, near: Unit | Pos, u: Unit, min = 1, max = 3): Pos | undefined => {
  for (let d = min; d <= max; d++) {
    const spot = tilesInRange(b, near, d, d, 'size' in near ? near.size : 1).find((p) => anchorCost(b, u, p.x, p.y) < INF && footprint(p.x, p.y, u.size).every((q) => !unitAt(b, q.x, q.y)));
    if (spot) return spot;
  }
  return undefined;
};

/** Every other enemy phase, each Shadow Mirror Gate sends out a shadow duplicate (two at most per gate). */
function spawnFromMirrors(b: Battle) {
  if (b.turn % 2 === 0) return;
  b.tiles.forEach((t, k) => {
    if (t !== 'shadowMirrorGate') return;
    if (b.units.filter((u) => u.fsGate === k).length >= 2) return;
    const at = { x: k % b.width, y: Math.floor(k / b.width) };
    const probe = { x: at.x, y: at.y, size: 1 } as Unit;
    const spot = tilesInRange(b, at, 1, 2).find((p) => anchorCost(b, { ...probe, classId: 'shadowSwordsmanFS', race: 'shadow', skills: [], buffs: [], gear: {} } as unknown as Unit, p.x, p.y) < INF && !unitAt(b, p.x, p.y));
    if (!spot) return;
    const d = shadowDuplicate(b, null, 'enemy', spot, Math.max(1, b.enemyLevel - 1), 3);
    if (d) { d.fsGate = k; b.log.push('A shadow steps out of the Shadow Mirror Gate.'); }
  });
}

/** Banished into the Dark World: weakened and rooted (and sent through a portal if there is one). */
function banish(b: Battle, t: Unit): string {
  const st = fsState(b);
  buff(t, 'fsBanished', 'Banished', 2, { str: -4, mag: -4, def: -4, res: -4 });
  addStatus(t, 'root', 2);
  const k = st.portals.find((p) => !unitAt(b, p % b.width, Math.floor(p / b.width)));
  if (k !== undefined && !t.isBoss && t.size === 1) { t.x = k % b.width; t.y = Math.floor(k / b.width); }
  return `${t.name} is banished into the Dark World!`;
}

// ───────────────────────── Combat ─────────────────────────

export interface FSMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

export function fsMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): FSMods {
  const m: FSMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const allies = b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
  const within = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  const add = (o: Partial<FSMods>) => { for (const [k, v] of Object.entries(o)) m[k as keyof FSMods] += v ?? 0; };
  const link = isLink(u);
  if (link && allies.some((a) => isLink(a) && has(a, 'unitedCourage') && within(a, 4))) add({ str: 2, skl: 2, def: 2 });
  if (has(u, 'burningCourage') && u.hp < u.stats.hp / 2) m.str += 4;
  if (hasBuff(u, 'fsEvasive')) m.avoid += 30;
  if (hasBuff(u, 'fsStacked')) m.hit += 15;
  // The formation and Force Power (the player's Links).
  const st = b.fs;
  if (link && u.team === 'player' && st) {
    const f = st.formation?.id;
    if (f === 'box') add({ def: 4, res: 4 });
    if (f === 'line') add({ str: 3, hit: 10 });
    if (f === 'cross') add({ avoid: 15, crit: 10 });
    if (forceAt(b, 500)) add({ str: 2, mag: 2 });
    if (forceAt(b, 1000) && w?.type === 'sword') m.dmg += 4;
  }
  if (u.team === 'player' && w?.id === 'fourSword' && forceAt(b, 1000) && !link) m.dmg += 4;
  // Zelda's Seal of Light weakens dark foes near her.
  if (isDark(u) && b.units.some((a) => a.team !== u.team && has(a, 'sealOfLight') && unitDist(a, u, pos) <= 2)) add({ str: -3, mag: -3, def: -3 });
  // Ganon's King of Darkness, and his commander bonus.
  if (isMonster(u) && allies.some((a) => has(a, 'kingOfDarkness') && within(a, 3))) add({ str: 3, def: 3 });
  if (isMonster(u) && u.team === 'player' && b.bonus === 'darkKingsHost') add({ str: 3, def: 3 });
  if (allies.some((a) => has(a, 'shadowBlessing') && within(a, 2))) m.res += 4;
  // The military classes.
  if (has(u, 'spearFormation')) m.def += Math.min(4, 2 * allies.filter((a) => has(a, 'spearFormation') && within(a, 1)).length);
  if (isSoldier(u) && allies.some((a) => has(a, 'militaryCommand') && within(a, 3))) add({ str: 2, skl: 2 });
  if (has(u, 'sandAmbush') && u.hidden && initiating) add({ dmg: 6, hit: 20 });
  // The Dark World.
  if (hasBuff(u, 'fsDarkWorld')) { if (isDark(u) || has(u, 'shadowReflectionSkill')) add({ str: 3, mag: 3 }); else m.def -= 2; }
  if (u.team === 'player' && b.bonus === 'shadowCommand' && (DARK_REGIONS.includes(b.world) || hasBuff(u, 'fsDarkWorld'))) add({ str: 3, mag: 3 });
  // Group supports.
  if (groups(b).includes('fourfoldCourage') && link && allies.some((a) => isLink(a) && within(a, 4))) add({ str: 3, mag: 3, skl: 3, spd: 3, def: 3, res: 3 });
  void foe;
  return m;
}

export function fsCannotAttack(b: Battle, atk: Unit, def: Unit, w: WeaponDef | undefined): boolean {
  void b; void atk; void def; void w;
  return false;
}

/** Damage multipliers: the commanders, the Maidens' blessings, Mystic Courage, the bosses' defences. */
export function fsMultiplier(b: Battle, atk: Unit, atkPos: Pos, def: Unit, magical: boolean, w: WeaponDef | undefined, d: number, element?: Element): number {
  let m = 1;
  const near = (who: Unit, skill: string, r = 2) => b.units.some((a) => a.team === who.team && has(a, skill) && unitDist(a, who, who === atk ? atkPos : who) <= r);
  const sacred = isSacred(w, element);
  const pl = atk.team === 'player';
  if (pl && b.bonus === 'warriorsCourage' && !magical) m *= 1.2;
  if (has(atk, 'mysticCourage') && (magical || (!!w?.beam && d > 1))) m *= 1.25;
  if (has(atk, 'sealOfLight') && sacred) m *= 1.25;
  if (pl && b.bonus === 'sanctuaryLight' && sacred) m *= 1.25;
  if (sacred && near(atk, 'radiantBlessing')) m *= 1.2;
  if (element === 'fire' && near(atk, 'flameBlessing')) m *= 1.25;
  if (pl && b.bonus === 'windMage' && isWind(w)) m *= 1.25;
  if (w?.fs?.includes('darkness') && darkHere(b, atk)) m *= 1.25;
  if (w?.id === 'fourSword' && pl && forceAt(b, 2000)) m *= 1.5;
  if (groups(b).includes('sacredFellowship') && pl && (isLink(atk) || atk.templateId === 'zeldaFS') && sacred) m *= 1.15;
  if (groups(b).includes('darkConspiracy') && pl && element === 'dark' && ['vaatiWindMage', 'vaatiHylian', 'ganonFSA', 'shadowLink'].includes(atk.templateId ?? '')) m *= 1.15;
  // Defences.
  if (element === 'fire' && near(def, 'flameBlessing')) m *= 0.5;
  if (element === 'dark' && fsTag(def, 'darkGuard')) m *= 0.5;
  if (element === 'dark' && groups(b).includes('sacredSealGroup') && def.team === 'player' && ['zeldaFS', ...['greenMaiden', 'redMaiden', 'blueMaiden', 'purpleMaiden', 'yellowMaiden', 'whiteMaiden']].includes(def.templateId ?? '')) m *= 0.5;
  if (has(def, 'armoredShell') && !hasBuff(def, 'fsFlipped')) m *= 0.5;
  if (has(def, 'windFortress') && d > 1) m *= 0.5;
  if (hasBuff(def, 'fsWindBarrier') && d > 1) m *= 0;
  if (has(def, 'frozenDefense') && !hasBuff(def, 'fsThawed') && element !== 'fire') m *= 0.4;
  if (has(def, 'shiftingDefense')) m *= element === weaknessOf(b, def) ? 1.75 : 0.65;
  if (has(def, 'moltenBody') && element === 'fire') m *= 0;
  return m;
}

const WEAK: Element[] = ['fire', 'ice', 'lightning'];
/** Dera Zol's current weakness (it shifts every turn; Elemental Shift moves it on at once). */
export const weaknessOf = (b: Battle, u: Unit): Element => WEAK[(b.turn + (u.turnUses?.fsShift ?? 0)) % WEAK.length];

/** After a hit lands: the chain pulls, the Trident banishes, flames, shells flip, ice breaks, slimes split, gems scatter. */
export function fsAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element?: Element): string[] {
  const lines: string[] = [];
  if (dmg > 0 && target.hp > 0) {
    if (w?.fs?.includes('chainPull') && unitDist(by, target) >= 2 && pullToward(b, target, by, 1)) lines.push(`${by.name}'s chain drags ${target.name} closer.`);
    if (w?.fs?.includes('banish') && !target.isBoss && roll(b) < 25) lines.push(banish(b, target));
    if (w?.fs?.includes('wind') && w.id === 'vaatisCycloneOrb' && pushAway(b, target, by, 1)) lines.push(`The cyclone throws ${target.name} back.`);
    if (has(target, 'armoredShell') && (w?.type === 'hammer' || w?.fs?.includes('flip') || w?.mc?.includes('flip'))) { buff(target, 'fsFlipped', 'Flipped', 2, { def: -5 }); lines.push(`${target.name} is flipped onto its back!`); }
    if (has(target, 'frozenDefense') && !hasBuff(target, 'fsThawed') && (element === 'fire' || w?.type === 'hammer' || dmg >= 15)) { buff(target, 'fsThawed', 'Ice broken', 2); lines.push(`${target.name}'s ice armour ${element === 'fire' ? 'melts' : 'shatters'}!`); }
    if (has(target, 'dividingBody')) lines.push(...splitSlime(b, target));
  }
  if (w?.fs?.includes('flames') && dmg > 0) {
    ignite(b, [{ x: target.x, y: target.y }]);
    const f = b.fires?.find((x) => x.x === target.x && x.y === target.y);
    if (f) f.turns = Math.max(f.turns, 3);
  }
  // Shadow Link's hits: an enemy Shadow Link scatters the army's gems; yours steals Force from the enemy.
  if (dmg > 0 && has(by, 'shadowReflectionSkill') && by.fsDup === undefined) {
    if (by.team === 'enemy' && target.team === 'player') { const l = scatterGems(b, target); if (l) lines.push(l); }
    else if (by.team === 'player' && fsActive(b)) lines.push(...fsGainForce(b, 20, 'Shadow Link steals Force Gems'));
  }
  b.log.push(...lines.filter((l) => !b.log.includes(l)));
  return lines;
}

function splitSlime(b: Battle, u: Unit): string[] {
  const n = u.fsSplits ?? 0;
  const due = u.hp < u.stats.hp / 3 ? 2 : u.hp < (u.stats.hp * 2) / 3 ? 1 : 0;
  if (due <= n) return [];
  u.fsSplits = due;
  return spawnSlimes(b, u, 1) ? [`A slime breaks off ${u.name}!`] : [];
}
function spawnSlimes(b: Battle, u: Unit, count: number): number {
  const arch = ENEMIES.zol ?? ENEMIES.chuchuGreen;
  if (!arch) return 0;
  let made = 0;
  for (let i = 0; i < count; i++) {
    const e = makeEnemy(arch, b.world, Math.max(1, (u.level ?? 1) - 1), `fsz${b.uidCounter++}`, new RNG(b.rngState + b.uidCounter));
    const spot = freeSpot(b, u, e, 1, 3);
    if (!spot) break;
    Object.assign(e, { x: spot.x, y: spot.y, team: u.team, ai: 'aggressive', summoned: true, moved: true, acted: true });
    b.units.push(e);
    made++;
  }
  return made;
}

export function fsOnKill(b: Battle, by: Unit, victim: Unit) {
  const st = fsState(b);
  if (has(by, 'swiftCourage')) buff(by, 'swiftCourage', 'Swift Courage', 2, { mov: 2 });
  if (victim.team !== 'enemy' || by.team !== 'player') return;
  const id = tid(victim);
  if (FS_SPOILS[id] && (victim.isBoss || roll(b) < 25)) st.found.push(FS_SPOILS[id]);
  if (fsActive(b)) fsGainForce(b, killGem(b, victim), `${victim.name} drops a Force Gem`);
  if (st.finale && id === 'vaatiWindMage') summonGanon(b, victim);
}

/** The finale: when Vaati falls, Ganon takes the field. */
function summonGanon(b: Battle, near: Unit): boolean {
  const st = fsState(b);
  if (st.ganonOut || !BOSSES.ganonFSA) return false;
  st.ganonOut = true;
  const lvl = Math.max(near.level ?? 1, b.enemyLevel);
  const g = makeEnemy(BOSSES.ganonFSA, b.world, lvl + 1, `fsg${b.uidCounter++}`, new RNG(b.rngState + 77), { boss: true });
  const spot = freeSpot(b, near, g, 0, 6) ?? freeSpot(b, { x: b.width - 4, y: Math.floor(b.height / 2) }, g, 0, 8);
  if (!spot) return false;
  Object.assign(g, { x: spot.x, y: spot.y, ai: 'aggressive', moved: true, acted: true });
  if ((b.bossTier ?? 0) === 0) { for (const k of ['str', 'mag', 'def', 'res'] as const) g.stats[k] = Math.round(g.stats[k] * 0.8); g.stats.hp = g.hp = Math.round(g.stats.hp * 0.8); }
  b.units.push(g);
  b.log.push('"Vaati was only a tool." The sky splits, and Ganon descends with the Trident of Power!');
  return true;
}

/** Paired bosses and the finale: the battle goes on while any listed boss stands (and until Ganon has come). */
export function fsBossesRemain(b: Battle): boolean {
  const st = b.fs;
  if (!st) return false;
  if (st.finale && !st.ganonOut && !b.units.some((u) => u.team === 'enemy' && tid(u) === 'vaatiWindMage')) {
    const v = b.fallen.find((u) => tid(u) === 'vaatiWindMage') ?? b.units.find((u) => u.team === 'enemy');
    if (v && summonGanon(b, v)) return true;
  }
  return (!!st.allBosses || !!st.finale) && b.units.some((u) => u.team === 'enemy' && u.isBoss);
}

/** Before the battle ends: duplicates fade, temporary Level 2 tools go back to normal. */
export function fourSwordsBeforeFinish(b: Battle) {
  b.units = b.units.filter((u) => u.fsDup === undefined);
  b.fallen = b.fallen.filter((u) => u.fsDup === undefined);
  const st = b.fs;
  if (!st) return;
  for (const t of st.temp) for (const u of [...b.units, ...b.fallen, ...(b.withdrawn ?? [])]) {
    if (u.uid !== t.uid) continue;
    const i = u.weapons.indexOf(t.to);
    if (i >= 0) u.weapons[i] = t.from;
    const j = u.pack.findIndex((p) => p.id === t.to);
    if (j >= 0) u.pack[j].id = t.from;
  }
}

// ───────────────────────── Abilities ─────────────────────────

const SPECIAL = new Set(FS_SPECIAL);
export const isFourSwordsAbility = (def: AbilityDef) => SPECIAL.has(def.id);
const FORM_IDS = new Set(Object.keys(FORMATION_CP));
const TARGET = new Set(['coordinatedStrikeFS', 'swordBeamFS', 'powerSlash', 'guardBreaker', 'recklessCharge', 'quickSlash', 'rollingAssault', 'mysticSlash', 'chargedBeam',
  'heroStack', 'fourfoldStrike', 'banishToDarkWorld', 'gelAbsorption']);
const TILE = new Set(['cooperativeThrow', 'giantBombThrow', 'fsMagnetSwing']);
export const fsNeedsTarget = (def: AbilityDef) => TARGET.has(def.id);
export const fsNeedsTile = (def: AbilityDef) => TILE.has(def.id);
/** Enemies use these on their own when they can (engine/abilities.ts enemyAutoTransform). */
export const FS_ENEMY_CASTS = ['cycloneFS', 'vacuumFS', 'windBarrierFS', 'eyeBeamFS', 'greatTornado', 'slimeDivision', 'gelAbsorption', 'flameBreathFS', 'lavaBurst', 'crushingSlamFS', 'moltenArmor',
  'elementalShift', 'slimeBarrage', 'iceBeamFS', 'frozenBarrier', 'blizzardFS', 'frostRegeneration', 'phantomVolley', 'stoneShellFS', 'dodongoFireBreath', 'vineLash', 'talonDive',
  'hinoxBombToss', 'tailWhip', 'tridentSpin', 'banishToDarkWorld', 'shadowReflection', 'giantBombThrow', 'sacredLightFS'];

/** Command Points a formation command costs (Green Link's commander bonus −25%, the Legacy of the Four Sword −30%). */
export function formationCost(b: Battle, id: string): number {
  let c = FORMATION_CP[id] ?? 0;
  if (b.bonus === 'fourSwordLeader') c = Math.floor(c * 0.75);
  if (groups(b).includes('legacyOfFourSword')) c = Math.floor(c * 0.7);
  return Math.max(1, c);
}

export function fsCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  let m = 1;
  if (!b || u.team !== 'player') return m;
  if (b.bonus === 'mysticCommand' && def.mp > 0 && (def.kind === 'spell' || def.kind === 'personal' || def.kind === 'song')) m *= 0.8;
  if (fsTag(u, 'supportThrift') && (def.wild?.heal || def.wild?.target === 'allies' || def.wild?.target === 'ally' || def.wild?.buff)) m *= 0.7;
  if (groups(b).includes('legacyOfFourSword') && (isLink(u) || u.templateId === 'heroOfMinish') && (SPECIAL.has(def.id) || def.id === 'fourSwordSplit')) m *= 0.7;
  return m;
}

const sword = (u: Unit) => u.weapons.map((id) => WEAPONS[id]).find((w) => w?.type === 'sword');
const adjFoes = (b: Battle, u: Unit) => foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) === 1);
const freeFor = (b: Battle, u: Unit, x: number, y: number) => inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((q) => { const o = unitAt(b, q.x, q.y); return !o || o === u; });
/** Rolling Assault's landing space: straight through the enemy to its far side. */
function rollLanding(b: Battle, u: Unit, e: Unit): Pos | null {
  const dx = Math.sign(e.x - u.x), dy = Math.sign(e.y - u.y);
  const p = dx && !dy ? { x: dx > 0 ? e.x + e.size : e.x - u.size, y: u.y } : !dx && dy ? { x: u.x, y: dy > 0 ? e.y + e.size : e.y - u.size } : null;
  return p && freeFor(b, u, p.x, p.y) ? p : null;
}
const helperLink = (b: Battle, u: Unit, e: Unit) => b.units.find((a) => a !== u && a.team === u.team && isLink(a) && a.fsDup === undefined && unitDist(a, e) <= 3);
const adjLinks = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && isLink(a) && unitDist(u, a) <= 1);
const sacredPower = (b: Battle, u: Unit) => u.templateId === 'zeldaFS' || unitTags(u).includes('maiden') || isSacred(WEAPONS[u.weapons[0]], WEAPONS[u.weapons[0]]?.element)
  || (!!b.fs?.formation && b.units.filter((a) => a.team === u.team && isLink(a) && unitDist(u, a) <= 2).length >= 2) || u.weapons.includes('fourSword');
const adjTile = (b: Battle, u: Unit, t: Terrain) => tilesInRange(b, u, 1, 1, u.size).find((p) => tileAt(b, p.x, p.y) === t);
const onTile = (b: Battle, u: Unit, t: Terrain) => footprint(u.x, u.y, u.size).some((p) => tileAt(b, p.x, p.y) === t);

export function fsTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  const foes = foesOf(b, u).filter((e) => !e.hidden);
  switch (def.id) {
    case 'coordinatedStrikeFS': return adjFoes(b, u).filter((e) => !!helperLink(b, u, e));
    case 'powerSlash': case 'guardBreaker': case 'quickSlash': case 'mysticSlash': case 'gelAbsorption': return adjFoes(b, u);
    case 'rollingAssault': return adjFoes(b, u).filter((e) => e.size <= 2 && !!rollLanding(b, u, e));
    case 'swordBeamFS': return foes.filter((e) => { const d = unitDist(u, e); return d >= 2 && d <= 4; });
    case 'chargedBeam': return foes.filter((e) => { const d = unitDist(u, e); return d >= 2 && d <= 5; });
    case 'recklessCharge': return foes.filter((e) => unitDist(u, e) <= 4 && (unitDist(u, e) === 1 || tilesInRange(b, e, 1, 1, e.size).some((p) => freeFor(b, u, p.x, p.y) && footDist(p.x, p.y, u.size, u.x, u.y, u.size) <= 4)));
    case 'heroStack': return adjLinks(b, u).filter((a) => !a.acted);
    case 'fourfoldStrike': return foes.filter((e) => unitDist(u, e) <= 2);
    case 'banishToDarkWorld': return foes.filter((e) => unitDist(u, e) <= 3);
  }
  return [];
}

export function fsTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  switch (def.id) {
    case 'cooperativeThrow': {
      const t = adjLinks(b, u)[0];
      if (!t) return [];
      return tilesInRange(b, u, 2, 4, u.size).filter((p) => freeFor(b, t, p.x, p.y));
    }
    case 'giantBombThrow': return tilesInRange(b, u, 1, 3, u.size).filter((p) => tileAt(b, p.x, p.y) !== 'wall' && !fsState(b).bombs.some((x) => x.x === p.x && x.y === p.y));
    case 'fsMagnetSwing': {
      const range = fsTag(u, 'magnet2') ? 6 : u.gear.hands === 'magneticGloves' || fsTag(u, 'magnet2') ? 4 : 0;
      if (!range) return [];
      const out: Pos[] = [];
      b.tiles.forEach((t, k) => {
        if (t !== 'magneticPillar') return;
        const px = k % b.width, py = Math.floor(k / b.width);
        if (footDist(px, py, 1, u.x, u.y, u.size) > range) return;
        for (const p of tilesInRange(b, { x: px, y: py }, 1, 1)) if (freeFor(b, u, p.x, p.y) && !out.some((q) => q.x === p.x && q.y === p.y)) out.push(p);
      });
      return out;
    }
  }
  return [];
}

export function fsUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isFourSwordsAbility(def)) return undefined;
  if (TARGET.has(def.id) && !fsTargets(b, u, def).length) return def.id === 'coordinatedStrikeFS' ? 'Needs an adjacent enemy and another Link within 3 of it' : def.id === 'heroStack' ? 'Needs an adjacent Link who hasn\'t acted' : 'No one in range';
  if (TILE.has(def.id) && !fsTiles(b, u, def).length) return def.id === 'fsMagnetSwing' ? 'Needs Magnetic Gloves and a Magnetic Pillar in range' : def.id === 'cooperativeThrow' ? 'Needs an adjacent Link and room to land' : 'Nowhere to use it';
  if (FORM_IDS.has(def.id)) {
    if (u.team !== 'player') return 'Command Points are the player\'s';
    if (!isLink(u)) return 'Only a Link';
    const need = FORMATION_NEEDS[def.id] ?? 2;
    if (linksOf(b, u.team).length < need) return `Needs ${need} Links on the field`;
    const cost = formationCost(b, def.id);
    if ((b.cp ?? 0) < cost) return `Needs ${cost} CP`;
    switch (def.id) {
      case 'formationMarch': return linksOf(b, u.team).some((a) => !a.moved && unitDist(u, a) <= 3) ? null : 'Every Link nearby has moved';
      case 'combinedSpin': return adjLinks(b, u).some((a) => !a.acted) && [u, ...adjLinks(b, u)].some((a) => adjFoes(b, a).length) ? null : 'Needs an adjacent Link and enemies next to you';
      case 'sacredSeal': return forceAt(b, 2000) ? null : 'Needs Sacred Awakening (2,000 Force Power)';
      case 'fourfoldBarrier': return null;
    }
    return null;
  }
  switch (def.id) {
    case 'swordBeamFS': return u.hp < u.stats.hp ? 'Only at full HP' : sword(u) ? null : 'Needs a sword';
    case 'mysticSlash': case 'powerSlash': case 'quickSlash': case 'guardBreaker': case 'coordinatedStrikeFS': case 'rollingAssault': return sword(u) || WEAPONS[u.weapons[0]] ? null : 'Needs a weapon';
    case 'shadowReflection': return freeSpot(b, u, u, 1, 2) ? null : 'No room';
    case 'vacuumFS': return foesOf(b, u).some((e) => unitDist(u, e) <= 3 && unitDist(u, e) > 1) ? null : 'No one to pull';
    case 'slimeDivision': return freeSpot(b, u, u, 1, 2) || u.size > 1 ? null : 'No room';
    case 'frozenBarrier': return hasBuff(u, 'fsThawed') || u.team === 'player' ? null : 'The ice holds';
    case 'fsCrossPortal': return portalExit(b, u) ? null : 'Stand on a Dark World Portal (the matching one must be free)';
    case 'fsShatterMirror': return adjTile(b, u, 'shadowMirrorGate') ? null : 'Stand next to a Shadow Mirror Gate';
    case 'fsPushBlock': return pushableBlock(b, u) ? null : 'Needs another ally next to the same Cooperative Block';
    case 'fsTakeItem': return onTile(b, u, 'itemPedestal') ? (u.pack.length < 6 ? null : 'Your pack is full') : 'Stand on an Item Pedestal';
    case 'fsFairyUpgrade': return onTile(b, u, 'fairyPedestal') ? (upgradable(u) ? null : 'No tool to upgrade') : 'Stand on a Great Fairy Upgrade Pedestal';
    case 'fsBreakSeal': return adjTile(b, u, 'sanctuarySeal') ? (sacredPower(b, u) ? null : 'Needs sacred power or a formation of 2 Links') : 'Stand next to a Sanctuary Seal';
  }
  return null;
}

function portalExit(b: Battle, u: Unit): Pos | null {
  const st = b.fs;
  if (!st) return null;
  const i = st.portals.indexOf(keyOf(b, u.x, u.y));
  if (i < 0) return null;
  const k = st.portals[i ^ 1];
  if (k === undefined) return null;
  const p = { x: k % b.width, y: Math.floor(k / b.width) };
  return freeFor(b, u, p.x, p.y) ? p : null;
}
function pushableBlock(b: Battle, u: Unit): Pos | null {
  for (const p of tilesInRange(b, u, 1, 1, u.size)) {
    if (tileAt(b, p.x, p.y) !== 'cooperativeBlock') continue;
    if (b.units.some((a) => a !== u && a.team === u.team && footDist(p.x, p.y, 1, a.x, a.y, a.size) === 1)) return p;
  }
  return null;
}
const upgradable = (u: Unit): string | null => (LEVEL2[u.weapons[0]] ? u.weapons[0] : u.pack.find((p) => LEVEL2[p.id])?.id ?? null);

export interface FSOutcome {
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

/** One strike of a Link's technique or a formation attack (the pack's multipliers apply). */
function strike(b: Battle, u: Unit, e: Unit, out: FSOutcome, o: { stat?: 'str' | 'mag' | 'best'; base?: number; mult?: number; pierce?: number; vs?: 'def' | 'res'; element?: Element; coop?: boolean; noWeapon?: boolean } = {}) {
  if (e.hp <= 0 || !b.units.includes(e)) return;
  const s = effectiveStats(u);
  const w = WEAPONS[u.weapons[0]];
  const es = effectiveStats(e);
  const stat = o.stat === 'mag' ? s.mag : o.stat === 'best' ? Math.max(s.str, s.mag) : s.str;
  const magical = o.stat === 'mag' || (o.stat === 'best' && s.mag > s.str) || o.vs === 'res';
  const mods = fsMods(b, u, u, e, true, w);
  const vs = Math.floor((o.vs === 'res' ? es.res : es.def) * (1 - (o.pierce ?? 0)));
  let dmg = (stat + (magical ? mods.mag : mods.str) + (o.base ?? 0) + (o.noWeapon ? 0 : w?.might ?? 0) + mods.dmg - vs) * (o.mult ?? 1);
  dmg *= fsMultiplier(b, u, u, e, magical, w, unitDist(u, e), o.element ?? w?.element);
  if (o.coop && forceAt(b, 1500)) dmg *= 1.3;
  dmg = Math.max(1, Math.floor(dmg));
  if (e.buffs.some((x) => x.barrier)) dmg = 0;
  if (dmg >= e.hp) {
    const sv = wildSaveFromDeath(b, e, u) ?? lgSaveFromDeath(b, e) ?? mnSaveFromDeath(b, e);
    if (sv) { dmg = e.hp - 1; out.lines.push(sv.line); e.hp = 1; e.hp = Math.min(e.stats.hp, e.hp + sv.heal); out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed: false, statuses: [] }); return; }
  }
  e.hp -= Math.min(dmg, e.hp);
  e.lastHitBy = u.uid;
  const killed = e.hp <= 0;
  out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses: [] });
  if (!killed) out.lines.push(...fsAfterHit(b, u, e, dmg, w, o.element ?? w?.element));
  if (killed) {
    u.kills++;
    b.units = b.units.filter((x) => x !== e);
    if (!e.summoned) b.fallen.push(e);
    b.log.push(`${u.name} defeated ${e.name}.`);
    fsOnKill(b, u, e);
  }
}

export function castFourSwords(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): FSOutcome | null {
  if (!isFourSwordsAbility(def)) return null;
  const out: FSOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const st = fsState(b);
  if (def.perTurn) (u.turnUses ??= {})[`pt:${def.id}`] = b.turn;
  const payCp = () => { if (FORM_IDS.has(def.id)) b.cp = Math.max(0, (b.cp ?? 0) - formationCost(b, def.id)); };
  const used = (list: Unit[]) => { for (const a of list) if (a !== u) { a.acted = true; a.moved = true; } };
  const formation = (id: string) => {
    payCp();
    st.formation = { id, turns: 3 };
    if (id === 'column') for (const a of linksOf(b, u.team)) { buff(a, 'fsColumn', 'Column formation', 3, { mov: 2 }); out.buffed.push(a.uid); }
    else out.buffed.push(...linksOf(b, u.team).map((a) => a.uid));
    out.lines.push(`The Links take the ${FORMATIONS[id].name} formation: ${FORMATIONS[id].text}.`);
    return out;
  };
  switch (def.id) {
    // ── The Links' kits ──
    case 'coordinatedStrikeFS': {
      const e = target!;
      const h = helperLink(b, u, e)!;
      strike(b, u, e, out, { coop: true });
      if (h) { strike(b, h, e, out, { coop: true }); out.lines.push(`${h.name} joins ${u.name}'s attack!`); }
      return out;
    }
    case 'swordBeamFS': strike(b, u, target!, out, { mult: has(u, 'mysticCourage') ? 1.25 : 1 }); out.lines.push(`${u.name} fires a sword beam.`); return out;
    case 'powerSlash': if (has(target!, 'armoredShell')) buff(target!, 'fsFlipped', 'Flipped', 2, { def: -5 }); strike(b, u, target!, out, { mult: 1.6 }); return out;
    case 'guardBreaker':
      if (has(target!, 'armoredShell')) buff(target!, 'fsFlipped', 'Flipped', 2, { def: -5 });
      if (has(target!, 'frozenDefense')) buff(target!, 'fsThawed', 'Ice broken', 2);
      strike(b, u, target!, out, { pierce: 0.5 });
      return out;
    case 'recklessCharge': {
      const e = target!;
      if (unitDist(u, e) > 1) {
        const p = tilesInRange(b, e, 1, 1, e.size).filter((q) => freeFor(b, u, q.x, q.y)).sort((a, c) => footDist(a.x, a.y, u.size, u.x, u.y, u.size) - footDist(c.x, c.y, u.size, u.x, u.y, u.size))[0];
        if (p) { out.warped = { from: { x: u.x, y: u.y }, to: p }; u.x = p.x; u.y = p.y; u.moved = true; }
      }
      strike(b, u, e, out, { base: 6 });
      buff(u, 'recklessCharge', 'Reckless', 1, { def: -3 });
      return out;
    }
    case 'quickSlash': strike(b, u, target!, out, { mult: 0.75 }); strike(b, u, target!, out, { mult: 0.75 }); return out;
    case 'rollingAssault': {
      const e = target!;
      const p = rollLanding(b, u, e)!;
      out.warped = { from: { x: u.x, y: u.y }, to: p };
      u.x = p.x; u.y = p.y; u.moved = true;
      if (has(e, 'armoredShell')) buff(e, 'fsFlipped', 'Flipped', 2, { def: -5 });
      strike(b, u, e, out, { mult: 1.2 });
      out.lines.push(`${u.name} rolls past ${e.name} and strikes from behind!`);
      return out;
    }
    case 'evasiveStep': buff(u, 'fsEvasive', 'Evasive Step', 1); out.buffed.push(u.uid); return out;
    case 'mysticSlash': strike(b, u, target!, out, { stat: 'mag' }); return out;
    case 'chargedBeam': {
      const e = target!;
      strike(b, u, e, out, { stat: 'mag', base: 6, vs: 'res', pierce: 0.5, noWeapon: true, element: 'light' });
      // The beam carries on to the next enemy in line.
      const dx = Math.sign(e.x - u.x), dy = Math.sign(e.y - u.y);
      const behind = b.units.find((x) => x.team === e.team && x !== e && footDist(e.x + dx * e.size, e.y + dy * e.size, 1, x.x, x.y, x.size) === 0);
      if (behind) strike(b, u, behind, out, { stat: 'mag', base: 6, vs: 'res', pierce: 0.5, noWeapon: true, element: 'light', mult: 0.5 });
      return out;
    }
    // ── Formations and formation commands ──
    case 'formationBox': return formation('box');
    case 'formationLine': return formation('line');
    case 'formationColumn': return formation('column');
    case 'formationCross': return formation('cross');
    case 'formationMarch': {
      payCp();
      for (const a of linksOf(b, u.team).filter((x) => !x.moved && unitDist(u, x) <= 3)) { buff(a, 'formationMarch', 'Formation March', 1, { mov: 2 }); out.buffed.push(a.uid); }
      out.lines.push('The Links march together.');
      return out;
    }
    case 'combinedSpin': {
      payCp();
      const crew = [u, ...adjLinks(b, u).filter((a) => !a.acted)];
      const hit = new Set<Unit>();
      for (const a of crew) for (const e of adjFoes(b, a)) hit.add(e);
      for (const e of hit) { const by = crew.find((a) => unitDist(a, e) === 1) ?? u; strike(b, by, e, out, { coop: true }); }
      used(crew);
      out.lines.push(`${crew.length} Links spin together!`);
      return out;
    }
    case 'heroStack': {
      payCp();
      const top = target!;
      buff(top, 'fsStacked', 'Hero Stack', 1);
      top.acted = true;
      out.buffed.push(top.uid);
      // High switches within reach of the stack.
      for (const p of tilesInRange(b, u, 0, 1, u.size)) {
        const k = keyOf(b, p.x, p.y);
        if (b.tiles[k] === 'fourPersonSwitch' || b.tiles[k] === 'formationSwitch') { b.tiles[k] = 'plain'; openAll(b); out.lines.push(...fsGainForce(b, 150, 'The Hero Stack reaches a high switch')); }
      }
      out.lines.push(`${top.name} climbs onto ${u.name}'s shoulders.`);
      return out;
    }
    case 'cooperativeThrow': {
      payCp();
      const t = adjLinks(b, u)[0]!;
      out.warped = { from: { x: t.x, y: t.y }, to: { ...at! } };
      t.x = at!.x; t.y = at!.y;
      out.lines.push(`${u.name} throws ${t.name} across the field!`);
      return out;
    }
    case 'fourfoldStrike': {
      payCp();
      const e = target!;
      const crew = linksOf(b, u.team).filter((a) => (a === u || !a.acted) && unitDist(a, e) <= 3);
      for (const a of crew) strike(b, a, e, out, { stat: 'best', coop: true });
      used(crew);
      out.lines.push(`Fourfold Strike: ${crew.length} Links strike ${e.name} in turn!`);
      return out;
    }
    case 'fourfoldBarrier': {
      payCp();
      const crew = linksOf(b, u.team);
      const shielded = b.units.filter((a) => a.team === u.team && crew.some((l) => unitDist(l, a) <= 1));
      for (const a of shielded) { buff(a, 'fourfoldBarrier', 'Fourfold Barrier', 1, {}, true); out.buffed.push(a.uid); }
      used(crew);
      out.lines.push('The four Links raise a barrier of light.');
      return out;
    }
    case 'sacredSeal': {
      payCp();
      const crew = linksOf(b, u.team);
      const hit = foesOf(b, u).filter((e) => crew.some((l) => unitDist(l, e) <= 3));
      for (const e of hit) {
        const by = crew.reduce((x, y) => (unitDist(x, e) <= unitDist(y, e) ? x : y));
        strike(b, by, e, out, { stat: 'best', base: 10, mult: 2, vs: 'res', element: 'light', coop: true, noWeapon: true });
        if (e.hp > 0 && e.isBoss && isDark(e)) { addStatus(e, 'stun', 1); out.statuses.push({ uid: e.uid, kind: 'stun' }); }
      }
      used(crew);
      out.lines.push('Sacred Seal! The Four Sword\'s light pours over the field.');
      return out;
    }
    // ── Section 2 ──
    case 'shadowReflection': {
      let n = 0;
      const strong = groups(b).includes('fivefoldReflection') && u.team === 'player';
      for (let i = 0; i < 2; i++) { const p = freeSpot(b, u, u, 1, 2); if (p && shadowDuplicate(b, u, u.team, p, u.level, 2, strong)) n++; }
      out.lines.push(n ? `${u.name}'s shadow splits: ${n} duplicate${n > 1 ? 's' : ''}!` : 'No room for a shadow.');
      return out;
    }
    case 'giantBombThrow': placeBomb(b, at!, u.team, effectiveStats(u).str + 12, 2, u.uid); out.lines.push(`${u.name} throws a Giant Bomb! It will go off in 2 turns.`); return out;
    case 'banishToDarkWorld': out.lines.push(banish(b, target!)); out.statuses.push({ uid: target!.uid, kind: 'root' }); return out;
    // ── Bosses ──
    case 'vacuumFS': {
      let n = 0;
      for (const e of foesOf(b, u).filter((x) => unitDist(u, x) <= 3)) if (pullToward(b, e, u, 2)) n++;
      out.lines.push(`${u.name}'s Vacuum drags ${n} enem${n === 1 ? 'y' : 'ies'} in.`);
      return out;
    }
    case 'slimeDivision': { const n = spawnSlimes(b, u, 2); out.lines.push(`${n} slime${n === 1 ? '' : 's'} split off ${u.name}.`); return out; }
    case 'gelAbsorption': {
      const before = target!.hp;
      strike(b, u, target!, out, { base: 2, noWeapon: false });
      const amt = Math.min(u.stats.hp - u.hp, Math.ceil((before - Math.max(0, target!.hp)) / 2));
      if (amt > 0) { u.hp += amt; out.heals.push({ uid: u.uid, amount: amt }); }
      return out;
    }
    case 'elementalShift': {
      (u.turnUses ??= {}).fsShift = (u.turnUses.fsShift ?? 0) + 1;
      const amt = Math.min(u.stats.hp - u.hp, Math.ceil(u.stats.hp * 0.1));
      if (amt > 0) { u.hp += amt; out.heals.push({ uid: u.uid, amount: amt }); }
      out.lines.push(`${u.name} shifts: now weak to ${weaknessOf(b, u)}.`);
      return out;
    }
    case 'frozenBarrier': u.buffs = u.buffs.filter((x) => x.id !== 'fsThawed'); buff(u, 'frozenBarrier', 'Frozen Barrier', 2, { res: 4 }); out.buffed.push(u.uid); out.lines.push(`${u.name}'s ice armour re-forms.`); return out;
    // ── Battlefield actions ──
    case 'fsCrossPortal': {
      const p = portalExit(b, u)!;
      out.warped = { from: { x: u.x, y: u.y }, to: p };
      u.x = p.x; u.y = p.y;
      buff(u, 'fsDarkWorld', 'In the Dark World', 2);
      out.lines.push(`${u.name} steps through the portal into the ${DARK_REGIONS.includes(b.world) ? 'Light' : 'Dark'} World.`);
      if (fsTag(u, 'shadowMirror')) out.free = true;
      return out;
    }
    case 'fsShatterMirror': { const p = adjTile(b, u, 'shadowMirrorGate')!; b.tiles[keyOf(b, p.x, p.y)] = 'plain'; out.lines.push(`${u.name} shatters the Shadow Mirror Gate!`, ...fsGainForce(b, 100, 'Mirror shards')); return out; }
    case 'fsPushBlock': { const p = pushableBlock(b, u)!; b.tiles[keyOf(b, p.x, p.y)] = 'plain'; out.lines.push('The block grinds aside.', ...fsGainForce(b, 50, 'A Force Gem under the block')); return out; }
    case 'fsTakeItem': {
      const p = footprint(u.x, u.y, u.size).find((q) => tileAt(b, q.x, q.y) === 'itemPedestal')!;
      b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      const id = rng.pick(['bomb', 'bombL2', 'fsLamp', 'redPotion', 'forceFairy', 'giantBomb'].filter((x) => ITEMS[x]));
      u.pack.push({ id, uses: ITEMS[id].uses });
      out.lines.push(`${u.name} takes the ${ITEMS[id].name} from the pedestal.`);
      return out;
    }
    case 'fsFairyUpgrade': {
      const from = upgradable(u)!;
      const to = LEVEL2[from];
      const i = u.weapons.indexOf(from);
      if (i >= 0) u.weapons[i] = to; else { const j = u.pack.findIndex((x) => x.id === from); if (j >= 0) u.pack[j].id = to; }
      st.temp.push({ uid: u.uid, from, to });
      const p = footprint(u.x, u.y, u.size).find((q) => tileAt(b, q.x, q.y) === 'fairyPedestal')!;
      b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      out.lines.push(`A Great Fairy's laughter: ${u.name}'s ${WEAPONS[from]?.name ?? ITEMS[from]?.name ?? from} becomes ${WEAPONS[to]?.name ?? ITEMS[to]?.name ?? to} for this battle.`);
      return out;
    }
    case 'fsMagnetSwing': out.warped = { from: { x: u.x, y: u.y }, to: { ...at! } }; u.x = at!.x; u.y = at!.y; out.lines.push(`${u.name} swings across on the Magnetic Gloves.`); return out;
    case 'fsBreakSeal': {
      const p = adjTile(b, u, 'sanctuarySeal')!;
      b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      out.lines.push(`${u.name} breaks the Sanctuary Seal.`, ...fsGainForce(b, 200, 'The seal\'s light'));
      return out;
    }
  }
  return null;
}

/** Enemy bosses and Shadow Link use their abilities when it makes sense (targets chosen here). */
export function fsEnemyCast<R>(b: Battle, u: Unit, usable: (d: AbilityDef) => boolean, cast: (id: string, target?: string, at?: Pos) => R | null, abilities: Record<string, AbilityDef>): R | null {
  if (u.team !== 'enemy') return null;
  const foes = foesOf(b, u).filter((e) => !e.hidden);
  for (const id of FS_ENEMY_CASTS) {
    if (!u.abilities.includes(id)) continue;
    const def = abilities[id];
    if (!def || !usable(def)) continue;
    const s = def.wild;
    if (s?.target === 'foes' && !foes.some((e) => unitDist(u, e) <= (s.radius ?? 1))) continue;
    if (s?.target === 'self' && s.heal && u.hp > u.stats.hp * 0.6) continue;
    if (s?.target === 'self' && !s.heal && !foes.some((e) => unitDist(u, e) <= 4)) continue;
    if (id === 'elementalShift' && b.turn % 3 !== 0) continue;
    if (s?.target === 'foe') {
      const [lo, hi] = s.range ?? [1, 1];
      const t = foes.filter((e) => { const d = unitDist(u, e); return d >= lo && d <= hi; }).sort((x, y) => x.hp - y.hp)[0];
      if (!t) continue;
      const r = cast(id, t.uid);
      if (r) return r;
      continue;
    }
    if (fsNeedsTarget(def)) { const t = fsTargets(b, u, def)[0]; if (!t) continue; const r = cast(id, t.uid); if (r) return r; continue; }
    if (fsNeedsTile(def)) {
      const tiles = fsTiles(b, u, def);
      const best = tiles.map((p) => ({ p, n: foes.filter((e) => footDist(p.x, p.y, 1, e.x, e.y, e.size) <= 2).length })).sort((x, y) => y.n - x.n)[0];
      if (!best || best.n < 1) continue;
      const r = cast(id, undefined, best.p);
      if (r) return r;
      continue;
    }
    const r = cast(id);
    if (r) return r;
  }
  return null;
}

// ───────────────────────── Items ─────────────────────────

/** The Bombardier's Military Explosives: his bombs hit harder and wider. */
export function fsAdjustItem<T extends { kind: string; power: number; radius?: number } | undefined>(u: Unit, def: T): T {
  if (!def || def.kind !== 'bomb' || !has(u, 'militaryExplosives')) return def;
  return { ...def, power: Math.round(def.power * 1.5), radius: (def.radius ?? 0) + 1 } as T;
}

export function fsCanUseItem(b: Battle, u: Unit, id: string): boolean | undefined {
  if (id === 'forceFairy') return b.fallen.some((x) => x.team === u.team && !x.summoned && !x.npc) && !!freeSpot(b, u, u, 1, 2);
  return undefined;
}

export function useFourSwordsItem(b: Battle, u: Unit, id: string, at?: Pos): string | null {
  switch (id) {
    case 'giantBomb': placeBomb(b, at!, u.team, ITEMS.giantBomb?.power ?? 30, 3, u.uid); return `${u.name} sets a Giant Bomb. It will go off in 3 turns!`;
    case 'forceFairy': {
      const f = [...b.fallen].reverse().find((x) => x.team === u.team && !x.summoned && !x.npc);
      const spot = freeSpot(b, u, u, 1, 2);
      if (!f || !spot) return 'Nothing happens.';
      b.fallen = b.fallen.filter((x) => x !== f);
      Object.assign(f, { x: spot.x, y: spot.y, hp: Math.ceil(f.stats.hp / 2), moved: true, acted: true, statuses: [] });
      b.units.push(f);
      return `A Force Fairy brings ${f.name} back!`;
    }
    case 'fsLamp': {
      b.fog = false;
      let n = 0;
      for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= 4) { e.hidden = false; n++; }
      for (const t of b.traps ?? []) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= 4) { t.hidden = false; n++; }
      for (const p of tilesInRange(b, u, 0, 1, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'spiderweb') b.tiles[k] = 'plain'; }
      return `${u.name} lights the Lamp${n ? `: ${n} hidden thing${n > 1 ? 's' : ''} revealed` : ''}.`;
    }
  }
  return null;
}

/** Bomb blasts: mirrors shatter, Terrorpins flip, ice breaks, Dodongos swallow (triple damage). */
export function fsOnBlast(b: Battle, by: Unit, at: Pos, radius: number, power: number): string[] {
  const lines: string[] = [];
  const n = blastTiles(b, at, radius, false);
  if (n) lines.push(`The blast breaks ${n} mirror${n > 1 ? 's' : ''}, blocks or walls.`);
  for (const e of b.units) {
    if (e.team === by.team || footDist(at.x, at.y, 1, e.x, e.y, e.size) > radius) continue;
    if (has(e, 'armoredShell')) { buff(e, 'fsFlipped', 'Flipped', 2, { def: -5 }); lines.push(`${e.name} is blown onto its back!`); }
    if (has(e, 'frozenDefense')) { buff(e, 'fsThawed', 'Ice broken', 2); lines.push(`The blast shatters ${e.name}'s ice!`); }
    if (tid(e) === 'dodongo' && e.isBoss && e.hp > 0) { const d = Math.min(e.hp - 1, power * 2); e.hp -= d; lines.push(`${e.name} swallows the bomb — it explodes inside (−${d})!`); }
  }
  return lines;
}

/** The battle view's Force line: Force Power, the next threshold and the formation. */
export function fsStatus(b: Battle): { force: number; next: string; formation?: string } | null {
  if (!b.fs || (!fsActive(b) && !b.fs.force)) return null;
  const nx = FORCE_THRESHOLDS.find((t) => b.fs!.force < t.at);
  const f = b.fs.formation;
  return { force: b.fs.force, next: nx ? `${nx.name} at ${nx.at}` : 'Sacred Awakening', formation: f ? `${FORMATIONS[f.id].name} (${f.turns})` : undefined };
}

