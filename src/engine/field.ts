// The battlefield itself: fire, Magic Beans, traps, buried treasure, Time Blocks,
// cracked walls, fog of war and hidden enemies, plus the Environmental Phase.

import { footDist, footprint, inBounds, keyOf, unitAt } from './grid';
import { RNG } from './rng';
import { addStatus } from './status';
import { hasEffect, unitTags } from './units';
import { decorateWindWaker, wwEnvironment } from './windwaker';
import { decorateTwilight, twilightBattleStart } from './twilight';
import { decorateSkyward, skywardBattleStart } from './skyward';
import { decorateWild, wildBattleStart, wildEnvironment } from './wild';
import { decorateOriginal, originalBattleStart } from './original';
import { decorateLegend, legendBattleStart } from './legend';
import { decoratePhantom, phantomBattleStart } from './phantom';
import { decorateSpirit, spiritBattleStart } from './spirit';
import { decorateMinish, minishBattleStart } from './minish';
import { decorateFourSwords, fourSwordsBattleStart } from './fourswords';
import { GEAR, ITEMS } from '../data/registry';
import type { Battle, Pos, Terrain, Unit, WorldId } from './types';

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ───────────────────────── Setup ─────────────────────────

const FOGGY: Record<string, number> = { lostWoods: 100, kokiriForest: 20, kakarikoGraveyard: 35, zorasDomain: 10 };
const TIME_BLOCKS: Record<string, number> = { hyruleCastle: 50, lostWoods: 35, kakarikoGraveyard: 35, gerudoDesert: 25 };
const DIG_SPOTS: Record<string, number> = { kakarikoGraveyard: 4, gerudoDesert: 3 };
const TRAP_NODES = new Set(['siege', 'dungeon', 'elite']);

/** Add region features to a freshly generated battle. */
export function decorateField(b: Battle, rng: RNG, nodeType: string) {
  const world = b.world as WorldId;
  // Walls: some are cracked (bombs and builders break them); some are Time Blocks.
  const timeBlocks = rng.chance(TIME_BLOCKS[world] ?? 12);
  b.tiles.forEach((t, k) => {
    if (t !== 'wall') return;
    if (timeBlocks && rng.chance(45)) b.tiles[k] = 'timeBlock';
    else if (rng.chance(30)) b.tiles[k] = 'cracked';
  });
  // Termina spaces go down first so treasure and traps land on open ground.
  decorateTermina(b, rng);
  decorateWindWaker(b, rng);
  decorateTwilight(b, rng);
  decorateSkyward(b, rng);
  decorateWild(b, rng);
  twilightBattleStart(b, rng);
  skywardBattleStart(b, rng);
  wildBattleStart(b, rng);
  decorateOriginal(b, rng);
  originalBattleStart(b, rng);
  decorateLegend(b, rng);
  legendBattleStart(b);
  // Spirit Tracks first: the Tower of Spirits turns on the Phantom patrols (without the Temple's life drain).
  decorateSpirit(b, rng);
  decoratePhantom(b, rng);
  phantomBattleStart(b);
  spiritBattleStart(b);
  // The Minish Cap: its battlefield spaces, Micro dungeons, boss defences.
  decorateMinish(b, rng);
  minishBattleStart(b);
  // Four Swords: Force Gem Deposits, switches, portals, mirrors and seals; Big Bomb fuses.
  decorateFourSwords(b, rng);
  fourSwordsBattleStart(b);
  // Fog of war
  b.fog = rng.chance(FOGGY[world] ?? 6);
  // Buried treasure
  const open = (p: Pos) => b.tiles[keyOf(b, p.x, p.y)] === 'plain' && !unitAt(b, p.x, p.y);
  const middle: Pos[] = [];
  for (let y = 0; y < b.height; y++) for (let x = 3; x < b.width - 3; x++) middle.push({ x, y });
  const spots = rng.shuffle(middle.filter(open));
  b.digSpots = spots.splice(0, (DIG_SPOTS[world] ?? 1) + (rng.chance(40) ? 1 : 0));
  // Traps in fortified places
  if (TRAP_NODES.has(nodeType) || rng.chance(15)) {
    b.traps = spots.splice(0, rng.int(2, 4)).map((p) => ({ ...p, hidden: true }));
  }
  // Ghosts and some undead hide until revealed.
  for (const e of b.units) {
    if (e.team !== 'enemy' || e.isBoss || e.size > 1) continue;
    const tags = unitTags(e);
    if ((e.artId === 'poe' || e.artId === 'wallmaster' || (tags.includes('undead') && world === 'kakarikoGraveyard')) && rng.chance(60)) e.hidden = true;
  }
  // Desert storms
  if (world === 'gerudoDesert' && rng.chance(30)) b.weather = { kind: 'sandstorm', turns: 4 };
  if (world === 'zorasDomain' && rng.chance(20)) b.weather = { kind: 'rain', turns: 4 };
}

// ───────────────────────── Vision ─────────────────────────

/** Can the player see this unit? (Hidden enemies and fog of war.) */
export function isSeen(b: Battle, u: Unit): boolean {
  if (u.team === 'player') return true;
  if (u.hidden) return false;
  if (!b.fog) return true;
  return b.units.some((p) => p.team === 'player' && !p.captive && footDist(p.x, p.y, p.size, u.x, u.y, u.size) <= visionOf(p));
}

export function visionOf(u: Unit): number {
  let r = 4;
  if (u.buffs?.some((x) => x.id === 'lens')) r += 3;
  if (u.skills.includes('ancientGuidance')) r += 4;
  if (hasEffect(u, 'telescope') || hasEffect(u, 'seagullSight') || u.skills.includes('crowsNest')) r += 3;
  if (u.skills.includes('ritoScouting')) r += 2;
  if (u.buffs?.some((x) => x.id === 'watchtower')) r += 3;
  return r;
}

/** Tiles the player can currently see (all of them without fog). */
export function visibleTiles(b: Battle): Set<number> | null {
  if (!b.fog) return null;
  const seen = new Set<number>();
  for (const p of b.units) {
    if (p.team !== 'player' || p.captive) continue;
    const r = visionOf(p);
    for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) {
      if (footDist(x, y, 1, p.x, p.y, p.size) <= r) seen.add(keyOf(b, x, y));
    }
  }
  return seen;
}

/**
 * Reveal hidden enemies and traps: anything adjacent to a player unit, within
 * 4 of a Lens of Truth user, and undead within 3 of Dampé. Returns names revealed.
 */
export function revealNearby(b: Battle): string[] {
  const out: string[] = [];
  const players = b.units.filter((p) => p.team === 'player' && !p.captive);
  for (const e of b.units) {
    if (!e.hidden) continue;
    const found = players.some((p) => {
      const d = footDist(p.x, p.y, p.size, e.x, e.y, e.size);
      return d <= 1 || (p.buffs?.some((x) => x.id === 'lens') && d <= 4) || (p.skills.includes('graveyardShift') && d <= 3 && unitTags(e).includes('undead'))
        || (p.skills.includes('kooloolimpah') && d <= 6) || (hasEffect(p, 'garoSight') && d <= 4) || (hasEffect(p, 'scents') && d <= 4);
    });
    if (found) { e.hidden = false; out.push(e.name); }
  }
  for (const t of b.traps ?? []) {
    if (t.hidden && players.some((p) => {
      const d = footDist(p.x, p.y, p.size, t.x, t.y, 1);
      return ((p.buffs?.some((x) => x.id === 'lens') || hasEffect(p, 'scents')) && d <= 4) || (p.skills.includes('kooloolimpah') && d <= 6);
    })) t.hidden = false;
  }
  return out;
}

// ───────────────────────── Traps & digging ─────────────────────────

/** A player unit ending its move on a trap: 20% max HP and rooted for a turn. */
export function triggerTraps(b: Battle, u: Unit): number {
  if (moveIsFlying(u)) return 0;
  const tiles = footprint(u.x, u.y, u.size);
  // Hidden spike traps catch your army; Death Armos Cores you planted catch the enemy.
  const i = (b.traps ?? []).findIndex((t) => (u.team === 'player' ? !t.armed : !!t.armed) && tiles.some((p) => p.x === t.x && p.y === t.y));
  if (i < 0) return 0;
  b.traps!.splice(i, 1);
  const dmg = Math.min(u.hp - 1, Math.ceil(u.stats.hp * 0.2));
  u.hp -= dmg;
  addStatus(u, 'root', 1);
  b.log.push(`${u.name} stepped on a spike trap!`);
  return dmg;
}

function moveIsFlying(u: Unit): boolean {
  const mount = u.gear?.mount ? GEAR[u.gear.mount] : undefined;
  return !!mount?.effects?.includes('flight') && u.mounted !== false || ['keese', 'fireKeese', 'iceKeese', 'navi', 'peahat'].includes(u.artId ?? u.templateId ?? '');
}

const DIG_LOOT = ['redPotion', 'bluePotion', 'fairy', 'bomb', 'magicJar', 'greenPotion', 'magicBean', 'fireFruit', 'elixir', 'sacredWater', 'staminaPotion'];

/** Dig where the unit stands. Returns what was found. */
export function dig(b: Battle, u: Unit, rng: RNG): { item?: string; rupees?: number } {
  const spots = b.digSpots ?? [];
  const i = spots.findIndex((p) => footprint(u.x, u.y, u.size).some((f) => f.x === p.x && f.y === p.y));
  const expert = u.skills.includes('graveyardShift');
  if (i >= 0) {
    spots.splice(i, 1);
    const pool = DIG_LOOT.filter((id) => ITEMS[id]);
    const item = rng.pick(pool);
    (b.loot ??= []).push(item);
    const rupees = expert ? 50 : 0;
    b.bonusRupees = (b.bonusRupees ?? 0) + rupees;
    return { item, rupees };
  }
  if (rng.chance(expert ? 50 : 25)) {
    const rupees = rng.pick([5, 20, 20, 50]);
    b.bonusRupees = (b.bonusRupees ?? 0) + rupees;
    return { rupees };
  }
  return {};
}

export function canDig(b: Battle, u: Unit): boolean {
  const t = b.tiles[keyOf(b, u.x, u.y)];
  return t === 'plain' || t === 'forest' || t === 'fort';
}

/** Fishing from a tile next to water. */
export function canFish(b: Battle, u: Unit): boolean {
  return footprint(u.x, u.y, u.size).some((p) => DIRS.some(([dx, dy]) => {
    const x = p.x + dx, y = p.y + dy;
    return inBounds(b, x, y) && b.tiles[keyOf(b, x, y)] === 'water';
  }));
}

export function fish(b: Battle, rng: RNG): { item?: string; rupees?: number } {
  const r = rng.int(0, 99);
  if (r < 40) {
    const item = rng.pick(['redPotion', 'lonLonMilk', 'zoraWater', 'hyruleRation'].filter((id) => ITEMS[id]));
    (b.loot ??= []).push(item);
    return { item };
  }
  if (r < 75) {
    const rupees = rng.pick([10, 20, 30, 50, 100]);
    b.bonusRupees = (b.bonusRupees ?? 0) + rupees;
    return { rupees };
  }
  return {};
}

// ───────────────────────── Terrain changes ─────────────────────────

/** Bombs break cracked walls in their blast. Returns tiles broken. */
export function blastTerrain(b: Battle, at: Pos, radius: number, walls = false): number {
  let n = 0;
  for (let y = at.y - radius; y <= at.y + radius; y++) for (let x = at.x - radius; x <= at.x + radius; x++) {
    if (!inBounds(b, x, y) || Math.abs(x - at.x) + Math.abs(y - at.y) > radius) continue;
    const k = keyOf(b, x, y);
    if (b.tiles[k] === 'cracked' || (walls && (b.tiles[k] === 'wall' || b.tiles[k] === 'frozenMech' || b.tiles[k] === 'sunBlock'))) { b.tiles[k] = 'plain'; n++; }
  }
  return n;
}

/** Song of Time: Time Blocks vanish and empty slots fill (unless someone stands there). */
export function toggleTimeBlocks(b: Battle): number {
  let n = 0;
  b.tiles.forEach((t, k) => {
    const x = k % b.width, y = Math.floor(k / b.width);
    if (t === 'timeBlock') { b.tiles[k] = 'timeGap'; n++; }
    else if (t === 'timeGap' && !unitAt(b, x, y)) { b.tiles[k] = 'timeBlock'; n++; }
  });
  return n;
}

export function hasTimeBlocks(b: Battle): boolean {
  return b.tiles.some((t) => t === 'timeBlock' || t === 'timeGap');
}

/** Set tiles on fire (forests burn longest). */
export function ignite(b: Battle, tiles: Pos[]) {
  if (b.weather?.kind === 'rain') return;
  for (const p of tiles) {
    if (!inBounds(b, p.x, p.y)) continue;
    const t = b.tiles[keyOf(b, p.x, p.y)];
    if (t === 'water' || t === 'wall' || t === 'lava' || t === 'timeBlock' || t === 'cracked') continue;
    const turns = t === 'forest' ? 3 : 1;
    const f = (b.fires ??= []).find((x) => x.x === p.x && x.y === p.y);
    if (f) f.turns = Math.max(f.turns, turns);
    else b.fires.push({ x: p.x, y: p.y, turns });
  }
}

export function plantBean(b: Battle, at: Pos) {
  (b.sprouts ??= []).push({ ...at, turns: 2 });
}

/** Master Builder: bridge water, clear obstacles, or raise a barricade on open ground. */
export function buildAt(b: Battle, at: Pos): Terrain | null {
  const k = keyOf(b, at.x, at.y);
  const t = b.tiles[k];
  if (t === 'water') return (b.tiles[k] = 'bridge');
  if (t === 'cracked' || t === 'wall' || t === 'timeBlock') return (b.tiles[k] = 'plain');
  if ((t === 'plain' || t === 'bridge') && !unitAt(b, at.x, at.y)) return (b.tiles[k] = 'wall');
  return null;
}

export function buildTargets(b: Battle, u: Unit): Pos[] {
  const out: Pos[] = [];
  for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) {
    if (footDist(x, y, 1, u.x, u.y, u.size) !== 1) continue;
    const t = b.tiles[keyOf(b, x, y)];
    if (t === 'water' || t === 'cracked' || t === 'wall' || t === 'timeBlock' || ((t === 'plain' || t === 'bridge') && !unitAt(b, x, y))) out.push({ x, y });
  }
  return out;
}

// ───────────────────────── Environmental Phase ─────────────────────────

export interface EnvEvent {
  text: string;
  uid?: string;
  damage?: number;
}

/** Fire spreads and burns out, beans grow, weather shifts. Runs between enemy and player phases. */
export function environmentPhase(b: Battle): EnvEvent[] {
  const rng = new RNG(b.rngState);
  const events: EnvEvent[] = [];
  const rain = b.weather?.kind === 'rain';
  if ((b.timeSlowed ?? 0) > 0) {
    b.timeSlowed!--;
    events.push({ text: 'Time crawls: the battlefield holds still.' });
    return events;
  }
  terminaEnvironment(b, events);
  wwEnvironment(b, events);

  // Fire
  if (rain && b.fires?.length) { b.fires = []; events.push({ text: 'The rain puts out the fires.' }); }
  if (b.fires?.length) {
    const next: Pos[] = [];
    for (const f of b.fires) {
      for (const [dx, dy] of DIRS) {
        const x = f.x + dx, y = f.y + dy;
        if (inBounds(b, x, y) && b.tiles[keyOf(b, x, y)] === 'forest' && !b.fires.some((o) => o.x === x && o.y === y) && rng.chance(35)) next.push({ x, y });
      }
      f.turns--;
      if (f.turns <= 0 && b.tiles[keyOf(b, f.x, f.y)] === 'forest') b.tiles[keyOf(b, f.x, f.y)] = 'plain'; // burnt down
    }
    b.fires = b.fires.filter((f) => f.turns > 0);
    if (next.length) { ignite(b, next); events.push({ text: `The fire spreads (${next.length} tile${next.length > 1 ? 's' : ''}).` }); }
    for (const u of b.units) {
      if (!b.fires.some((f) => footprint(u.x, u.y, u.size).some((p) => p.x === f.x && p.y === f.y))) continue;
      const dmg = Math.min(u.hp - 1, Math.ceil(u.stats.hp * 0.1));
      u.hp -= Math.max(0, dmg);
      if (!u.skills.includes('witchOfFlame') && !(u.race === 'goron')) addStatus(u, 'burn', 2);
      events.push({ text: `${u.name} is caught in the flames.`, uid: u.uid, damage: Math.max(0, dmg) });
    }
  }

  // Era of the Wild: fire across grass, updrafts, Gloom pools, storms
  wildEnvironment(b, events);

  // Magic Beans
  for (const s of b.sprouts ?? []) {
    s.turns--;
    if (s.turns > 0) continue;
    const k = keyOf(b, s.x, s.y);
    const t = b.tiles[k];
    b.tiles[k] = t === 'water' || t === 'lava' ? 'bridge' : 'forest';
    events.push({ text: t === 'water' || t === 'lava' ? 'A bean sprout spreads into a leafy bridge.' : 'A bean sprout grows into a thicket.' });
  }
  b.sprouts = (b.sprouts ?? []).filter((s) => s.turns > 0);

  // Weather
  if (b.weather) {
    b.weather.turns--;
    if (b.weather.turns <= 0) {
      events.push({ text: b.weather.kind === 'rain' ? 'The rain stops.' : 'The sandstorm dies down.' });
      b.weather = undefined;
    }
  } else if (b.world === 'gerudoDesert' && rng.chance(12)) {
    b.weather = { kind: 'sandstorm', turns: 3 };
    events.push({ text: 'A sandstorm blows in! (−15 Hit for everyone)' });
  } else if ((b.world === 'zorasDomain' || b.world === 'hyruleField') && rng.chance(6)) {
    b.weather = { kind: 'rain', turns: 3 };
    events.push({ text: 'Rain begins to fall.' });
  }
  b.rngState = rng.state;
  return events;
}

/** Sunlight or Light Arrows melt Sun Blocks within `r` of a unit. Returns how many. */
export function meltSunBlocks(b: Battle, near: { x: number; y: number; size: number }, r: number): number {
  let n = 0;
  b.tiles.forEach((t, k) => {
    if (t !== 'sunBlock') return;
    const x = k % b.width, y = Math.floor(k / b.width);
    if (footDist(x, y, 1, near.x, near.y, near.size) <= r) { b.tiles[k] = 'plain'; n++; }
  });
  return n;
}

/** Fire thaws Frozen Mechanisms within `r`. */
export function thawMechanisms(b: Battle, near: { x: number; y: number; size: number }, r: number): number {
  let n = 0;
  b.tiles.forEach((t, k) => {
    if (t !== 'frozenMech') return;
    const x = k % b.width, y = Math.floor(k / b.width);
    if (footDist(x, y, 1, near.x, near.y, near.size) <= r) { b.tiles[k] = 'plain'; n++; }
  });
  return n;
}

// ───────────────────────── Termina battlefield spaces ─────────────────────────

const TERMINA_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  clockTown: { mailbox: 3, owlStatue: 1, weightedSwitch: 1 },
  terminaField: { owlStatue: 1, dekuFlower: 2, mailbox: 1 },
  woodfall: { dekuFlower: 4, goldFlower: 1, poisonWater: 6, owlStatue: 1 },
  snowhead: { frozenMech: 3, rollingRamp: 3, owlStatue: 1 },
  greatBay: { current: 6, waterwheel: 1, owlStatue: 1, mailbox: 1 },
  ikana: { sunBlock: 3, inversionSwitch: 1, weightedSwitch: 1, owlStatue: 1 },
  moon: { dekuFlower: 2, goldFlower: 1, rollingRamp: 1, sunBlock: 2 },
};

/** Scatter a region's special spaces across the middle of the map. */
export function decorateTermina(b: Battle, rng: RNG) {
  const feats = TERMINA_FEATURES[b.world];
  if (!feats) return;
  const occupied = (x: number, y: number) => !!unitAt(b, x, y);
  for (const [t, count] of Object.entries(feats) as [Terrain, number][]) {
    for (let i = 0; i < count; i++) {
      const walkableTarget = !['owlStatue', 'frozenMech', 'waterwheel', 'sunBlock', 'mailbox'].includes(t);
      const cand: number[] = [];
      b.tiles.forEach((cur, k) => {
        const x = k % b.width, y = Math.floor(k / b.width);
        if (x < 3 || x > b.width - 4 || occupied(x, y)) return;
        if (t === 'poisonWater' || t === 'current') { if (cur === 'water' || (cur === 'plain' && rng.chance(8))) cand.push(k); return; }
        if (t === 'waterwheel') { if (cur === 'wall' || cur === 'plain') cand.push(k); return; }
        if (cur === 'plain' || (!walkableTarget && cur === 'wall')) cand.push(k);
      });
      if (!cand.length) continue;
      b.tiles[rng.pick(cand)] = t;
    }
  }
  if (b.tiles.includes('current')) b.currentDir = rng.pick([[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]);
  if (b.tiles.includes('inversionSwitch')) {
    // Some walls and some open ground swap places when the switch is pressed.
    const walls = b.tiles.map((t, k) => (t === 'wall' ? k : -1)).filter((k) => k >= 0);
    const open = b.tiles.map((t, k) => (t === 'plain' && !occupied(k % b.width, Math.floor(k / b.width)) && k % b.width > 3 && k % b.width < b.width - 4 ? k : -1)).filter((k) => k >= 0);
    b.invertTiles = [...rng.shuffle(walls).slice(0, 4), ...rng.shuffle(open).slice(0, 4)];
  }
}

/** Environment Phase in Termina: poisoned water, currents, waterwheels and weighted switches. */
function terminaEnvironment(b: Battle, events: EnvEvent[]) {
  for (const u of b.units) {
    const tiles = footprint(u.x, u.y, u.size).map((p) => b.tiles[keyOf(b, p.x, p.y)]);
    if (tiles.includes('poisonWater') && u.hp > 1 && !u.skills.includes('jungleRitual')) {
      const d = Math.min(u.hp - 1, Math.ceil(u.stats.hp * 0.1));
      u.hp -= d;
      addStatus(u, 'poison', 2);
      events.push({ text: `${u.name} is hurt by the poisoned water.`, uid: u.uid, damage: d });
    }
  }
  // Currents push swimmers along.
  if (b.currentDir) {
    const [dx, dy] = b.currentDir;
    for (const u of b.units) {
      if (b.tiles[keyOf(b, u.x, u.y)] !== 'current' || u.size > 1) continue;
      const nx = u.x + dx, ny = u.y + dy;
      if (!inBounds(b, nx, ny) || unitAt(b, nx, ny)) continue;
      const t = b.tiles[keyOf(b, nx, ny)];
      if (!['water', 'current', 'poisonWater', 'plain', 'bridge'].includes(t)) continue;
      u.x = nx; u.y = ny;
      events.push({ text: `The current carries ${u.name} along.` });
    }
    // Waterwheels turn the currents every third turn.
    if (b.tiles.includes('waterwheel') && b.turn % 3 === 0) {
      b.currentDir = [-dx, -dy] as [number, number];
      events.push({ text: 'The waterwheel turns: the currents reverse.' });
    }
  }
  // Weighted switches: something heavy opens the Time Blocks while it stays put.
  const pressed = b.tiles.some((t, k) => {
    if (t !== 'weightedSwitch') return false;
    const u = unitAt(b, k % b.width, Math.floor(k / b.width));
    return !!u && ((u.baseSize ?? u.size) >= 2 || u.stats.con >= 14);
  });
  if (pressed !== !!b.switchHeld && hasTimeBlocks(b)) {
    b.switchHeld = pressed;
    b.tiles.forEach((t, k) => {
      if (pressed && t === 'timeBlock') b.tiles[k] = 'timeGap';
      else if (!pressed && t === 'timeGap' && !unitAt(b, k % b.width, Math.floor(k / b.width))) b.tiles[k] = 'timeBlock';
    });
    events.push({ text: pressed ? 'A weighted switch sinks: the Time Blocks drop away.' : 'The switch rises: Time Blocks return.' });
  }
}

/** Stepping on an Inversion Switch flips the marked walls and floors. */
export function pressInversion(b: Battle, u: Unit): boolean {
  if (b.tiles[keyOf(b, u.x, u.y)] !== 'inversionSwitch' || !b.invertTiles?.length) return false;
  for (const k of b.invertTiles) {
    const x = k % b.width, y = Math.floor(k / b.width);
    if (b.tiles[k] === 'wall') b.tiles[k] = 'plain';
    else if (b.tiles[k] === 'plain' && !unitAt(b, x, y)) b.tiles[k] = 'wall';
  }
  return true;
}

/** Mailboxes next to the unit that haven't been opened. */
export function adjacentMailboxes(b: Battle, u: Unit): number[] {
  const out: number[] = [];
  for (const p of footprint(u.x, u.y, u.size)) {
    for (const [dx, dy] of DIRS) {
      const x = p.x + dx, y = p.y + dy;
      if (!inBounds(b, x, y)) continue;
      const k = keyOf(b, x, y);
      if (b.tiles[k] === 'mailbox' && !(b.mailOpened ?? []).includes(k) && !out.includes(k)) out.push(k);
    }
  }
  return out;
}

const MAIL_LOOT = ['redPotion', 'greenPotion', 'mysteryMilk', 'magicMushroom', 'springWater', 'bomb', 'chateauRomani'];

/** Check a mailbox: Rupees, an item, or a letter. The Postman's Hat doubles it. */
export function openMailbox(b: Battle, u: Unit, rng: RNG): string {
  const k = adjacentMailboxes(b, u)[0];
  if (k === undefined) return '';
  (b.mailOpened ??= []).push(k);
  const twice = hasEffect(u, 'postman') ? 2 : 1;
  const parts: string[] = [];
  for (let i = 0; i < twice; i++) {
    if (rng.chance(55)) {
      const id = rng.pick(MAIL_LOOT.filter((x) => ITEMS[x]));
      (b.loot ??= []).push(id);
      parts.push(ITEMS[id].name);
    } else {
      const r = rng.pick([20, 50, 100]);
      b.bonusRupees = (b.bonusRupees ?? 0) + r;
      parts.push(`₹${r}`);
    }
  }
  return `Inside the mailbox: ${parts.join(' and ')}.`;
}
