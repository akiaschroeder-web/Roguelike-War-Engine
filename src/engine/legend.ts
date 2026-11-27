// Era of Legend battle rules (A Link to the Past, Link's Awakening, Oracle of Seasons, Oracle of Ages):
// the Light and Dark Worlds (linked map versions, portals, the Moon Pearl, the rabbit form, the
// Magic Mirror), the seasons of Holodrum (Rod of Seasons, Din, Tree Stumps), the past and present of
// Labrynna (Harp of Ages tunes, Time Portals, past actions changing the present), mystical seeds as
// items and ammunition, Magic Rings, Link's Four Adventures, Zelda's Bloodline of the Sages, Ganon's
// Power of the Triforce, the Shadow Nightmare's six forms, Onox's and Veran's transformations,
// Veran's possession, every boss gimmick and the pack's battlefield spaces.
// Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts, status.ts, abilities.ts
// and battleView.ts (like original.ts).

import { BOSSES, ENEMIES, GEAR, ROSTERS, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import {
  BUNNY_ART, KOHOLINT, LEGEND_FEATURES, NIGHTMARE_FORMS, SEASONAL, SEED_SHOTS, SPOILS, TIMEWORN, WORLD_LINKED, type SeedKind,
} from '../content/legend';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF, WATERY } from './rules';
import { addStatus, STATUS_INFO } from './status';
import { roomFor, transformInto } from './transform';
import { activeGear, effectiveStats, hasEffect, makeEnemy, moveTypeOf, unitTags } from './units';
import { pullToward, pushAway } from './windwaker';
import type { AbilityDef, Battle, Element, EnemyArchetype, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

declare module './types' {
  interface Battle {
    /** Era of Legend battle state. */
    lg?: LGState;
  }
  interface Unit {
    /** Shadow Nightmare's current form (index into NIGHTMARE_FORMS). */
    lgForm?: number;
    /** Helmasaur King: heavy hits on the mask (3 break it). */
    lgMask?: number;
    lgMaskBroken?: boolean;
    /** Arrghus's Arrgi, Vitreous's lesser eyes, Eyesoar's orbiting eyes. */
    lgGuards?: number;
    /** Kholdstare's ice shell, Genie's bottle, Pumpkin Head's head (still on). */
    lgShell?: boolean;
    lgShellHits?: number;
    /** Blind's released heads; Slime Eye has split; Smog's fragments. */
    lgSplits?: number;
    /** Veran's possession: the side this unit really belongs to, and turns left. */
    lgPossessed?: { team: Unit['team']; turns: number };
    /** Underground (Subterror). */
    lgUnder?: boolean;
    /** Once-per-battle protections used (Protection Ring, Coral Triangle). */
    lgUsed?: string[];
  }
}

export interface LGState {
  /** Light/Dark World: which world the field is in, and the other world's terrain. */
  world?: 'light' | 'dark';
  alt?: Terrain[];
  /** Dark World monsters have come out (the first crossing). */
  darkSpawned?: boolean;
  /** Holodrum's season, and the water tiles a season froze or dried (restored when it changes). */
  season?: Season;
  seasonTiles?: { k: number; t: Terrain }[];
  /** Labrynna: which era the field is in, the other era's terrain, and the past as it began. */
  era?: 'present' | 'past';
  eraAlt?: Terrain[];
  pastStart?: Terrain[];
  /** The Tune of Echoes has awakened the Time Portals. */
  echoes?: boolean;
  /** Mystical seeds in the satchel (ammunition), copied from the run. */
  seeds: Record<SeedKind, number>;
  /** Gale Seed trees shaken (warp points). */
  warpTrees: number[];
  /** Every boss must fall (paired boss fights). */
  allBosses?: boolean;
  /** Gasha Seeds planted this battle (they grow after it). */
  gashaPlanted: number;
  /** Secrets found (for the after-battle report). */
  found: number;
  /** Bosses beaten earlier in the run (Victory Ring). */
  victory?: boolean;
  /** Mystery Rings found in battle (Gasha Nuts). */
  mysteryRings?: number;
  /** Essences of Nature and of Time held: each restores 1 HP / 1 MP to your units every turn. */
  nature?: number;
  time?: number;
}

const isLegendWorld = (b: Battle) => worldDef(b.world).campaign === 'legend';
export const lgState = (b: Battle): LGState => (b.lg ??= { seeds: { ember: 0, scent: 0, pegasus: 0, gale: 0, mystery: 0 }, warpTrees: [], gashaPlanted: 0, found: 0 });
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

function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}

/** Era of Legend effect tags on a unit: its active gear and its equipped weapon (rings count once). */
export function lgTags(u: Unit): Set<string> {
  const out = new Set<string>();
  for (const g of activeGear(u)) for (const t of g.lg ?? []) out.add(t);
  for (const t of WEAPONS[u.weapons[0]]?.lg ?? []) out.add(t);
  return out;
}
const tag = (u: Unit, t: string) => lgTags(u).has(t);
/** Heavy weapons: hammers, axes, flails, two-handed weapons and armor-breakers. */
export const isHeavy = (w: WeaponDef | undefined) => !!w && (w.type === 'hammer' || w.type === 'axe' || !!w.twoHanded || !!w.armorBreaker || !!w.lg?.includes('heavy'));
const lifts = (u: Unit) => hasEffect(u, 'liftHeavy') || ['powerBracelets', 'powerBraceletL2', 'powerGlove', 'titansMitt', 'goronBracelet', 'silverGauntlets', 'goldenGauntlets'].includes(u.gear.hands ?? '');
const isDemonic = (u: Unit) => ['demon', 'undead', 'nightmare', 'phantom', 'shadow', 'monster', 'chuchu', 'aquatic', 'construct'].includes(u.race) || unitTags(u).includes('demon') || unitTags(u).includes('undead');

// ───────────────────────── Temporary units ─────────────────────────

const TEMP: Record<string, EnemyArchetype> = {
  bee: { id: 'bee', name: 'Bee', race: 'monster', classId: 'flyer', weapons: ['fangs'], stats: { hp: 12, str: 7, skl: 10, spd: 13, def: 2, mov: 7 }, glyph: 'BE' },
  goldenBee: { id: 'goldenBee', name: 'Golden Bee', race: 'monster', classId: 'flyer', weapons: ['fangs'], stats: { hp: 22, str: 14, skl: 14, spd: 16, def: 5, mov: 8 }, glyph: 'GB' },
  blindHead: { id: 'blindHead', name: "Blind's Head", race: 'demon', classId: 'flyer', weapons: ['blindLaser'], stats: { hp: 18, str: 6, mag: 14, skl: 12, spd: 12, def: 4, res: 10, mov: 6 }, glyph: 'BH' },
  kholdstareBody: { id: 'kholdstareBody', name: 'Kholdstare (Split)', race: 'monster', classId: 'flyer', weapons: ['kholdstareIce'], stats: { hp: 24, str: 8, mag: 14, skl: 10, spd: 9, def: 8, res: 12, mov: 5 }, glyph: 'KS' },
  slimeEyeHalf: { id: 'slimeEyeHalf', name: 'Slime Eye (Half)', race: 'chuchu', classId: 'beast', weapons: ['slimeEyeSlam'], stats: { hp: 30, str: 13, skl: 8, spd: 8, def: 10, mov: 5 }, glyph: 'S½' },
  hagShadow: { id: 'hagShadow', name: 'Shadow Copy', race: 'undead', classId: 'flyer', weapons: ['hagCurse'], stats: { hp: 14, mag: 14, skl: 12, spd: 14, def: 3, res: 10, mov: 7 }, glyph: 'SC' },
  smogFragment: { id: 'smogFragment', name: 'Smog Fragment', race: 'monster', classId: 'flyer', weapons: ['smogLightning'], stats: { hp: 14, mag: 12, skl: 10, spd: 10, def: 3, res: 12, mov: 5 }, glyph: 'SF' },
  arrgi: { id: 'arrgi', name: 'Arrgi', race: 'aquatic', classId: 'flyer', weapons: ['arrghusPuff'], stats: { hp: 10, str: 6, skl: 8, spd: 10, def: 3, mov: 5 }, glyph: 'Ag' },
};

/** A temporary unit (bees, heads, split bodies, copies) on `team`'s side next to `near`. */
function spawnTemp(b: Battle, id: string, nearPos: Pos & { size: number }, team: Unit['team'], level: number, extra: Partial<Unit> = {}): Unit | null {
  const a = TEMP[id] ?? ENEMIES[id];
  if (!a) return null;
  const rng = new RNG(b.rngState);
  const e = makeEnemy(a, b.world, Math.max(1, level), `lg${b.uidCounter++}`, rng);
  b.rngState = rng.state;
  let spot: Pos | null = null;
  for (let d = 1; d <= 3 && !spot; d++) for (const p of tilesInRange(b, nearPos, d, d, nearPos.size)) if (free(b, e, p.x, p.y)) { spot = p; break; }
  if (!spot) return null;
  Object.assign(e, { x: spot.x, y: spot.y, team, summoned: true, moved: true, acted: true, ai: 'aggressive', npc: team === 'player' }, extra);
  b.units.push(e);
  return e;
}

// ───────────────────────── Movement ─────────────────────────

const SAND: Terrain[] = ['sandPile', 'sinkingSand', 'sandVortex'];

/** Era of Legend movement exceptions (called from grid.ts). */
export function lgTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  const flying = moveTypeOf(u) === 'flying';
  const st = b.lg;
  switch (t) {
    case 'seasonalSnowbank': c = st?.season === 'winter' || flying ? 1 : INF; break;
    case 'seasonalMushroom': c = st?.season === 'autumn' || flying ? 1 : INF; break;
    case 'magneticRail': if (hasEffect(u, 'magnet') || tag(u, 'magnet')) c = 1; break;
    case 'invisibleFloor': c = flying ? 1 : INF; break;
    case 'underwaterFloor': if (tag(u, 'zoraRing') || tag(u, 'flippers') || tag(u, 'mermaid') || has(u, 'riverTraveler')) c = 1; break;
    case 'frozenWater': if (tag(u, 'snowshoe')) c = 1; break;
  }
  if (WATERY.includes(t) && has(u, 'riverTraveler')) c = 1;
  if (SAND.includes(t) && (tag(u, 'quicksand') || has(u, 'desertWisdom') || b.units.some((a) => a.team === u.team && has(a, 'desertWisdom') && unitDist(u, a) <= 2))) c = 1;
  if (t === 'mountain' && tag(u, 'ricky')) c = Math.min(c, 2);
  return c;
}

// ───────────────────────── Battlefield setup ─────────────────────────

const OBSTACLES = new Set<Terrain>(['crystalBarrier', 'woodenStake', 'somariaBlock', 'magneticOrb', 'seedTree', 'switchHookTarget', 'seasonalSnowbank', 'seasonalMushroom', 'owlStatue', 'invisibleFloor']);
const SEED_TREE_KIND: SeedKind[] = ['ember', 'scent', 'pegasus', 'gale', 'mystery'];

/** The other world's (or era's) terrain at the same coordinates: different routes and obstacles. */
function otherVersion(tiles: Terrain[], rng: RNG, kind: 'world' | 'era'): Terrain[] {
  return tiles.map((t) => {
    if (kind === 'world') {
      if (t === 'forest') return rng.chance(50) ? 'mountain' : 'forest';
      if (t === 'mountain') return rng.chance(50) ? 'forest' : 'plain';
      if (t === 'plain') return rng.chance(6) ? 'water' : rng.chance(4) ? 'forest' : 'plain';
      if (t === 'wall') return rng.chance(40) ? 'plain' : 'wall';
      if (t === 'water') return rng.chance(40) ? 'plain' : 'water';
      return t;
    }
    // The past: no bridges yet (water), unfinished walls (plain), saplings where trees stand, soft soil to plant in.
    if (t === 'bridge') return 'water';
    if (t === 'wall') return rng.chance(35) ? 'plain' : 'wall';
    if (t === 'forest') return rng.chance(50) ? 'softSoil' : 'plain';
    if (t === 'plain') return rng.chance(5) ? 'softSoil' : rng.chance(4) ? 'water' : 'plain';
    if (t === 'cracked') return 'wall';
    return t;
  });
}

/** Place the region's battlefield spaces and prepare linked worlds, seasons and eras. */
export function decorateLegend(b: Battle, rng: RNG) {
  if (!isLegendWorld(b)) return;
  const st = lgState(b);
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 3 && i % b.width <= b.width - 4 ? i : -1)).filter((i) => i >= 0));
  const feats = LEGEND_FEATURES[b.world] ?? {};
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    for (let j = 0; j < n; j++) {
      if (t === 'underwaterFloor') {
        const wet = rng.shuffle(b.tiles.map((x, i) => (x === 'water' && !occupied.has(i) ? i : -1)).filter((i) => i >= 0));
        const k = wet[0] ?? plains.pop();
        if (k !== undefined) b.tiles[k] = t;
        continue;
      }
      const k = plains.pop();
      if (k === undefined) break;
      if (OBSTACLES.has(t) && tilesInRange(b, { x: k % b.width, y: Math.floor(k / b.width) }, 1, 1).some((p) => OBSTACLES.has(b.tiles[keyOf(b, p.x, p.y)]))) continue;
      b.tiles[k] = t;
      if (t === 'seedTree') st.warpTrees = st.warpTrees.filter((x) => x !== k);
    }
  }
  // Light World / Dark World: a linked version of the same field; portals stand in both.
  const linked = WORLD_LINKED[b.world];
  if (linked) {
    st.world = linked;
    st.alt = otherVersion(b.tiles, rng, 'world');
    for (let k = 0; k < b.tiles.length; k++) {
      if (b.tiles[k] === 'lightPortal' || b.tiles[k] === 'darkPortal') st.alt[k] = b.tiles[k] === 'lightPortal' ? 'darkPortal' : 'lightPortal';
      if (occupied.has(k)) st.alt[k] = b.tiles[k];
    }
    // Make sure there is a way across.
    if (!b.tiles.some((t) => t === 'lightPortal' || t === 'darkPortal')) {
      const k = plains.pop();
      if (k !== undefined) { b.tiles[k] = linked === 'light' ? 'darkPortal' : 'lightPortal'; st.alt[k] = linked === 'light' ? 'lightPortal' : 'darkPortal'; }
    }
  }
  // Holodrum: the season in effect when the battle begins.
  if (SEASONAL.has(b.world)) setSeason(b, rng.pick(SEASONS));
  // Labrynna: the present, with the past at the same coordinates.
  if (TIMEWORN.has(b.world)) {
    st.era = 'present';
    st.eraAlt = otherVersion(b.tiles, rng, 'era');
    for (const k of occupied) st.eraAlt[k] = b.tiles[k];
    for (let k = 0; k < b.tiles.length; k++) if (b.tiles[k] === 'timePortal') st.eraAlt[k] = 'timePortal';
    st.pastStart = [...st.eraAlt];
  }
  // Farore's army and Sign Rings: an extra buried treasure on the map.
  const extra = (b.bonus === 'secretsOfFarore' ? 1 : 0) + b.units.filter((u) => u.team === 'player' && tag(u, 'sign')).length;
  for (let i = 0; i < extra; i++) { const k = plains.pop(); if (k !== undefined) (b.digSpots ??= []).push({ x: k % b.width, y: Math.floor(k / b.width) }); }
}

// ───────────────────────── Seasons ─────────────────────────

/** Change the season: water freezes in winter and partly dries in summer (both armies feel it). */
export function setSeason(b: Battle, s: Season): string {
  const st = lgState(b);
  for (const x of st.seasonTiles ?? []) if (!unitAt(b, x.k % b.width, Math.floor(x.k / b.width)) || x.t !== 'water') b.tiles[x.k] = x.t;
  st.seasonTiles = [];
  st.season = s;
  if (s === 'winter' || s === 'summer') {
    for (let k = 0; k < b.tiles.length; k++) {
      if (b.tiles[k] !== 'water') continue;
      const x = k % b.width, y = Math.floor(k / b.width);
      const shore = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const t = tileAt(b, x + dx, y + dy); return !!t && t !== 'water'; });
      if (s === 'summer' && !shore) continue;
      st.seasonTiles.push({ k, t: 'water' });
      b.tiles[k] = s === 'winter' ? 'frozenWater' : 'plain';
    }
  }
  return { spring: 'Spring: flowers bloom, the forests heal and Seasonal Flowers launch whoever steps on them.', summer: 'Summer: the shallows dry up and fire burns hotter.',
    autumn: 'Autumn: the Seasonal Mushrooms soften and can be crossed; leaves fill the forests.', winter: 'Winter: water freezes over, snowbanks become pathways and ice bites harder.' }[s];
}

const SEASON_STAT: Record<Season, 'res' | 'str' | 'skl' | 'def'> = { spring: 'res', summer: 'str', autumn: 'skl', winter: 'def' };

// ───────────────────────── Light and Dark Worlds ─────────────────────────

/** Swap the field to the other world: terrain changes everywhere, rabbits appear, the Dark World stirs. */
export function crossWorlds(b: Battle, rng: RNG): string[] {
  const st = lgState(b);
  if (!st.alt || !st.world) return [];
  const lines: string[] = [];
  const next = st.alt;
  // Nobody ends up inside a wall: the ground under a unit stays as it is.
  for (const u of b.units) for (const p of footprint(u.x, u.y, u.size)) { const k = keyOf(b, p.x, p.y); next[k] = b.tiles[k]; }
  st.alt = b.tiles;
  b.tiles = next;
  st.world = st.world === 'light' ? 'dark' : 'light';
  lines.push(st.world === 'dark' ? 'The field twists into the Dark World.' : 'The light returns: the Light World again.');
  applyWorldForms(b, lines);
  if (st.world === 'dark' && !st.darkSpawned) {
    st.darkSpawned = true;
    const pool = ROSTERS.darkWorld ?? [];
    const lvl = Math.max(1, b.enemyLevel);
    const anchor = b.units.find((u) => u.team === 'enemy') ?? b.units[0];
    for (let i = 0; i < 2 && pool.length && anchor; i++) { const e = spawnTemp(b, rng.pick(pool), anchor, 'enemy', lvl); if (e) { e.summoned = false; e.moved = e.acted = false; } }
    lines.push('Dark World creatures crawl out of the shadows.');
  }
  return lines;
}

/** Who keeps their shape in the Dark World: Moon Pearl holders, demons and monsters, bosses. */
const keepsShape = (u: Unit) => u.isBoss || tag(u, 'moonPearl') || isDemonic(u) || !!RACES_IMMUNE[u.race];
const RACES_IMMUNE: Record<string, boolean> = { deity: true, goddess: true, dragonDeity: true, dreamCreature: true, guardianTree: true, vessel: true };

function applyWorldForms(b: Battle, lines: string[]) {
  const dark = lgState(b).world === 'dark';
  for (const u of b.units) {
    if (dark && !keepsShape(u)) {
      if (!hasBuff(u, 'bunny')) { buff(u, 'bunny', 'Rabbit Form', 99, { def: -4, res: -4 }); lines.push(`${u.name} turns into a rabbit!`); }
      if (tid(u) === 'heroOfLegend') u.artOverride = BUNNY_ART;
    } else if (!dark && hasBuff(u, 'bunny')) {
      u.buffs = u.buffs.filter((x) => x.id !== 'bunny');
      if (u.artOverride === BUNNY_ART) delete u.artOverride;
    }
  }
}

/** Banish one unit to the Dark World's shape for a while (Agahnim). */
function bunnify(u: Unit, turns: number): boolean {
  if (keepsShape(u)) return false;
  buff(u, 'bunny', 'Rabbit Form', turns, { def: -4, res: -4 });
  if (tid(u) === 'heroOfLegend') u.artOverride = BUNNY_ART;
  return true;
}

// ───────────────────────── Past and present ─────────────────────────

/** Pass between past and present. What was changed in the past shows in the present. */
export function shiftEra(b: Battle): string[] {
  const st = lgState(b);
  if (!st.eraAlt || !st.era) return [];
  const lines: string[] = [];
  const toPresent = st.era === 'past';
  const next = st.eraAlt;
  if (toPresent && st.pastStart) {
    let changes = 0;
    for (let k = 0; k < b.tiles.length; k++) {
      if (b.tiles[k] === st.pastStart[k]) continue;
      // A sapling planted in the past is a tree now; a wall broken then is still broken; a bridge built then still stands.
      next[k] = b.tiles[k] === 'softSoil' ? 'plain' : b.tiles[k];
      changes++;
    }
    st.pastStart = [...b.tiles];
    if (changes) lines.push(`What was done in the past has changed the present (${changes} space${changes > 1 ? 's' : ''}).`);
  }
  for (const u of b.units) for (const p of footprint(u.x, u.y, u.size)) { const k = keyOf(b, p.x, p.y); next[k] = b.tiles[k]; }
  st.eraAlt = b.tiles;
  b.tiles = next;
  st.era = toPresent ? 'present' : 'past';
  lines.unshift(toPresent ? 'Time flows forward: the present.' : 'Time folds back four hundred years: the past.');
  return lines;
}

// ───────────────────────── Battle start ─────────────────────────

const LTTP_TOOLS = ['fightersSword', 'temperedSword', 'goldenSword', 'magicHammer', 'caneOfSomaria', 'caneOfByrna', 'fireRod', 'iceRod', 'fightersShield', 'redShield', 'blueMail', 'redMail',
  'magicCape', 'pegasusBoots', 'powerGlove', 'titansMitt', 'moonPearl', 'magicMirror', 'bookOfMudora', 'bugCatchingNet', 'zorasFlippers', 'pendantOfCourage', 'pendantOfWisdom', 'pendantOfPower',
  'bombosMedallion', 'etherMedallion', 'quakeMedallion', 'masterSword', 'hookshot', 'magicalBoomerang', 'lantern'];
const LA_TOOLS = ['koholintSword', 'rocsFeather', 'powerBraceletL2', 'powerBracelets', 'fullMoonCello', 'conchHorn', 'seaLilysBell', 'surfHarp', 'windMarimba', 'coralTriangle', 'eveningCalmOrgan', 'thunderDrum', 'fairyOcarina', 'ocarinaOfTime', 'mirrorShield'];
const OOS_TOOLS = ['rodOfSeasons', 'nobleSword', 'biggoronSword', 'seedSatchelOracle', 'slingshotEnhancement', 'hyperSlingshot', 'magneticGloves', 'rocsCape', 'rickysFlute', 'mooshsFlute', 'fairySlingshot'];
const OOA_TOOLS = ['harpOfAges', 'switchHook', 'longHook', 'seedShooter', 'mermaidSuit', 'dimitrisFlute', 'mastersPlaque', 'strangeFlute'];

/** Four Adventures: how many of the four games' tools a unit carries. */
export function adventuresOf(u: Unit): number {
  const carried = new Set([...u.weapons, ...Object.values(u.gear ?? {}).filter((x): x is string => !!x), ...u.pack.map((p) => p.id)]);
  return [LTTP_TOOLS, LA_TOOLS, OOS_TOOLS, OOA_TOOLS].filter((list) => list.some((id) => carried.has(id))).length;
}

/** Battle start (every campaign): passives, boss gimmicks, Agahnim's illusions, the Dark World's rabbits. */
export function legendBattleStart(b: Battle) {
  const st = lgState(b);
  const lines: string[] = [];
  for (const u of [...b.units]) {
    if (has(u, 'fourAdventures')) { const n = adventuresOf(u); if (n) buff(u, 'fourAdventures', 'Four Adventures', 99, { skl: n, lck: n }); }
    if (has(u, 'armoredMask')) { u.lgMask = 0; u.lgMaskBroken = false; }
    if (has(u, 'protectiveArrgi')) u.lgGuards = 6;
    if (has(u, 'watchingEyes') || has(u, 'orbitingEyes')) u.lgGuards = 4;
    if (has(u, 'frozenPrison') || has(u, 'magicBottle') || has(u, 'headlessSpiritSkill')) { u.lgShell = true; u.lgShellHits = 0; }
    if (has(u, 'nightmareTransformation')) setNightmareForm(u, 0);
    if (has(u, 'undergroundAmbush') && u.team === 'enemy') { u.hidden = true; u.lgUnder = true; }
    if (has(u, 'shadowDivision')) for (let i = 0; i < 2; i++) spawnTemp(b, 'hagShadow', u, u.team, u.level, { illusionOf: u.uid });
  }
  // Agahnim's illusions: copies of him at a third of his strength (they vanish when he falls).
  for (const a of b.units.filter((x) => has(x, 'falseMagicSkill') && !x.summoned && !x.illusionOf)) {
    let n = 0;
    for (let i = 0; i < 2; i++) {
      const src = ENEMIES.wizzrobe ?? TEMP.hagShadow;
      const c = spawnTemp(b, src.id, a, a.team, a.level, { illusionOf: a.uid });
      if (!c) continue;
      Object.assign(c, { name: `${a.name} (illusion)`, artId: a.bossId ?? a.templateId, glyph: a.glyph, weapons: [...a.weapons.filter((w) => WEAPONS[w]?.type === 'magic')] });
      c.stats = { ...a.stats, hp: Math.max(8, Math.ceil(a.stats.hp / 3)), mag: Math.ceil(a.stats.mag / 3) + (a.team === 'player' && b.bonus === 'falseMagic' ? 4 : 0) };
      c.hp = c.stats.hp;
      if (!c.weapons.length) c.weapons = ['energyBall'];
      n++;
    }
    if (n) lines.push(`${a.name} splits into ${n + 1} — which one is real?`);
  }
  if (st.world === 'dark') applyWorldForms(b, lines);
  // Paired boss fights: every boss must fall.
  if (b.units.filter((u) => u.isBoss).length > 1) st.allBosses = true;
  b.log.push(...lines);
}

function setNightmareForm(u: Unit, i: number) {
  u.lgForm = i;
  u.artOverride = NIGHTMARE_FORMS[i]?.art;
}

/** Spawn the partner boss of a paired boss fight (legendRun decides who). */
export function addPartnerBoss(b: Battle, bossId: string, rng: RNG): Unit | null {
  const def = BOSSES[bossId] ?? ENEMIES[bossId];
  if (!def) return null;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!main) return null;
  const e = makeEnemy(def, b.world, main.level, `lg${b.uidCounter++}`, rng, { boss: true });
  for (let d = 1; d <= 5; d++) {
    const spot = tilesInRange(b, main, d, d, main.size).find((p) => free(b, e, p.x, p.y));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y, team: 'enemy' }); b.units.push(e); lgState(b).allBosses = true; legendBattleStartUnit(b, e); return e; }
  }
  return null;
}

function legendBattleStartUnit(b: Battle, u: Unit) {
  if (has(u, 'armoredMask')) { u.lgMask = 0; u.lgMaskBroken = false; }
  if (has(u, 'protectiveArrgi')) u.lgGuards = 6;
  if (has(u, 'watchingEyes') || has(u, 'orbitingEyes')) u.lgGuards = 4;
  if (has(u, 'frozenPrison') || has(u, 'magicBottle') || has(u, 'headlessSpiritSkill')) { u.lgShell = true; u.lgShellHits = 0; }
  if (has(u, 'nightmareTransformation')) setNightmareForm(u, 0);
  void b;
}

// ───────────────────────── Start of each turn ─────────────────────────

export interface LGEvent { uid: string; heal: number; damage: number; source: string }

const SIREN = (u: Unit) => tag(u, 'siren');
const SAGES = new Set(['sahasrahla', 'aginah', 'din', 'nayru', 'farore', 'makuTreeHolodrum', 'makuTreeLabrynna', 'impaOracle', 'zelda', 'zeldaTP', 'zeldaSS', 'zeldaWild', 'zeldaHyrule',
  'sleepingZelda', 'zeldaWW', 'rauru', 'saria', 'darunia', 'ruto', 'impa', 'nabooru', 'sheik', 'hylia', 'oldMan', 'rauruZonai', 'sonia', 'mineru', 'kass', 'medli', 'makar', 'laruto', 'fado']);

export function lgStartPhase(b: Battle, u: Unit, events: LGEvent[]) {
  const st = b.lg;
  const heal = (pct: number, source: string, who = u) => {
    const amt = Math.min(who.stats.hp - who.hp, Math.ceil(who.stats.hp * pct));
    if (amt > 0) { who.hp += amt; events.push({ uid: who.uid, heal: amt, damage: 0, source }); }
  };
  const hurt = (who: Unit, dmg: number, source: string) => {
    dmg = Math.min(who.hp - 1, dmg);
    if (dmg > 0) { who.hp -= dmg; events.push({ uid: who.uid, heal: 0, damage: dmg, source }); }
  };
  const tags = lgTags(u);
  if (u.team === 'player' && !u.npc && st?.nature) { const amt = Math.min(u.stats.hp - u.hp, st.nature); if (amt > 0) { u.hp += amt; events.push({ uid: u.uid, heal: amt, damage: 0, source: 'Essences of Nature' }); } }
  if (u.team === 'player' && !u.npc && st?.time) u.mp = Math.min(u.stats.mp, u.mp + st.time);
  if (tags.has('regen10')) heal(0.1, 'Heart Ring');
  else if (tags.has('regen5')) heal(0.05, 'Heart Ring');
  if (tags.has('mpRegen3')) u.mp = Math.min(u.stats.mp, u.mp + 3);
  if (tags.has('sirenCleanse')) { const i = u.statuses.findIndex((x) => !STATUS_INFO[x.kind].good); if (i >= 0) u.statuses.splice(i, 1); }
  if (tags.has('swimmer') && WATERY.includes(b.tiles[keyOf(b, u.x, u.y)])) buff(u, 'swimmerRing', "Swimmer's Ring", 1, { mov: 2 });
  if (tags.has('mermaid') && WATERY.includes(b.tiles[keyOf(b, u.x, u.y)])) buff(u, 'mermaidSuit', 'Mermaid Suit', 1, { mov: 2 });
  if (tags.has('sirenWind')) buff(u, 'windMarimba', 'Wind Marimba', 1, { mov: 1 });
  // Magic Cape and the Cane of Byrna drain MP while they last.
  if (hasBuff(u, 'magicCape')) { if (u.mp >= 4) u.mp -= 4; else { u.buffs = u.buffs.filter((x) => x.id !== 'magicCape'); u.hidden = false; } }
  if (hasBuff(u, 'byrna')) {
    if (u.mp >= 3) { u.mp -= 3; for (const e of foesOf(b, u)) if (unitDist(u, e) === 1) hurt(e, 4, 'Byrna Barrier'); }
    else u.buffs = u.buffs.filter((x) => x.id !== 'byrna');
  }
  // Possession wears off.
  if (u.lgPossessed && --u.lgPossessed.turns <= 0) { u.team = u.lgPossessed.team; u.npc = false; delete u.lgPossessed; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'Veran lets go' }); }
  // Auras from allies.
  for (const a of alliesOf(b, u)) {
    const d = unitDist(u, a);
    if (has(a, 'essenceOfNature') && d <= 3) heal(0.1, 'Essence of Nature');
    if (has(a, 'essenceOfTime') && d <= 3) { u.mp = Math.min(u.stats.mp, u.mp + 4); cutCooldowns(u, 1); }
    if (has(a, 'temporalHarmony') && d <= 2) cutCooldowns(u, 1);
    if (SIREN(a) && tag(a, 'sirenRegen') && d <= 2) heal(0.05, 'Full Moon Cello');
    if (SIREN(a) && tag(a, 'sirenAquatic') && d <= 2) buff(u, 'airPotion', 'Surf Harp', 1);
  }
  // The Wind Fish's Living Dream: nobody near it sleeps.
  if (b.units.some((a) => a.team === u.team && has(a, 'livingDream') && unitDist(u, a) <= 5)) u.statuses = u.statuses.filter((x) => x.kind !== 'sleep');
  // Spring: vegetation heals.
  if (st?.season === 'spring' && tilesOf(b, u).some((t) => t === 'forest' || t === 'seasonalFlower')) heal(0.1, 'Spring growth');
  // ── Boss and monster gimmicks ──
  if (has(u, 'amphibiousAssault')) { u.buffs = u.buffs.filter((x) => x.id !== 'submergedOcto'); if (tilesOf(b, u).some((t) => WATERY.includes(t))) buff(u, 'submergedOcto', 'Submerged', 1); }
  if (has(u, 'underwaterPredator')) { if (tilesOf(b, u).some((t) => WATERY.includes(t))) buff(u, 'submerged', 'Submerged', 1, { str: 5, mov: 5 }); }
  if (has(u, 'livingFlameSkill') && tilesOf(b, u).some((t) => t === 'lava')) heal(0.15, 'Lava');
  if (has(u, 'livingFlameSkill')) for (const p of tilesInRange(b, u, 1, 1, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain' && !unitAt(b, p.x, p.y) && (b.turn + k) % 3 === 0) (b.fires ??= []).push({ x: p.x, y: p.y, turns: 2 }); }
  if (has(u, 'galeForce')) for (const e of foesOf(b, u)) if (unitDist(u, e) <= 2 && !tag(e, 'steadfast')) pushAway(b, e, u, 1);
  if (has(u, 'livingFloorSkill')) {
    const t = foesOf(b, u).filter((e) => unitDist(u, e) <= 4).sort((x, y) => x.hp - y.hp)[0];
    if (t) { hurt(t, tag(t, 'trapGuard') ? 3 : 6, 'A floor tile flies up'); addStatus(t, 'root', 1); }
  }
  if (has(u, 'petrifyingGaze')) {
    for (const e of foesOf(b, u)) {
      const inLine = footprint(e.x, e.y, e.size).some((p) => footprint(u.x, u.y, u.size).some((q) => p.x === q.x || p.y === q.y));
      if (inLine && unitDist(u, e) <= 4 && e.gear.shield !== 'mirrorShield' && (b.turn + e.uid.length) % 5 < 2) { addStatus(e, 'petrified', 1); events.push({ uid: e.uid, heal: 0, damage: 0, source: "Medusa's gaze" }); }
    }
  }
  if (has(u, 'watchingEyes') && b.turn % 2 === 0) for (const e of foesOf(b, u)) if (unitDist(u, e) <= 6) { hurt(e, tag(e, 'electricGuard') ? 2 : 5, 'Lightning'); if (b.turn % 4 === 0) addStatus(e, 'shock', 1); }
  if (has(u, 'rotatingFaces')) {
    const f = b.turn % 4;
    u.buffs = u.buffs.filter((x) => x.id !== 'thwompFace');
    u.buffs.push({ id: 'thwompFace', name: ['Fire Face', 'Stone Face', 'Rage Face', 'Open Face'][f], turns: 1, stats: [{ mag: 6 }, { def: 8 }, { str: 6 }, {}][f] });
  }
  if (has(u, 'changingArsenal')) {
    const f = b.turn % 4;
    u.buffs = u.buffs.filter((x) => x.id !== 'ramrockArms');
    u.buffs.push({ id: 'ramrockArms', name: ['Fists', 'Pincers', 'Shields', 'Extending Arms'][f], turns: 1, stats: [{ str: 4 }, { skl: 4 }, { def: 8 }, {}][f] });
  }
  if (has(u, 'cloudAssembly')) {
    for (const f of b.units.filter((x) => x.artId === 'smogFragment' && x.team === u.team && unitDist(u, x) <= 1)) {
      b.units = b.units.filter((x) => x !== f);
      heal(0.08, 'A fragment merges back');
    }
  }
  if (has(u, 'webPursuit') && foesOf(b, u).some((e) => unitDist(u, e) <= 5 && e.statuses.some((s) => s.kind === 'root'))) buff(u, 'webPursuit', 'Web Pursuit', 1, { mov: 2 });
  if (has(u, 'powerOfTheTriforce') && u.bossId === 'ganonResurrected') buff(u, 'berserk', 'Berserk', 1, { str: 3, mov: 2 });
  // Subterrors burrow back down when no one is next to them.
  if (u.lgUnder !== undefined && u.team === 'enemy' && !foesOf(b, u).some((e) => unitDist(u, e) <= 1)) { u.hidden = true; u.lgUnder = true; }
  // Wizzrobes blink next to their prey.
  if ((has(u, 'wizzrobeBlink') || has(u, 'grandWizzrobe')) && u.team === 'enemy') {
    const foes = foesOf(b, u).filter((e) => !e.hidden);
    const nearest = foes.sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
    if (nearest && unitDist(u, nearest) > 5) {
      const spot = tilesInRange(b, nearest, 3, 3, nearest.size).find((p) => free(b, u, p.x, p.y));
      if (spot) { u.x = spot.x; u.y = spot.y; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'blinks across the field' }); }
    }
  }
}

function cutCooldowns(u: Unit, n: number) {
  for (const k of Object.keys(u.cooldowns ?? {})) { u.cooldowns![k] -= n; if (u.cooldowns![k] <= 0) delete u.cooldowns![k]; }
}

// ───────────────────────── After moving ─────────────────────────

/** After a unit moves: spring flowers launch it; Secret Discovery looks around. */
export function lgAfterMove(b: Battle, u: Unit): string | null {
  const lines: string[] = [];
  const st = b.lg;
  if (st?.season === 'spring' && tilesOf(b, u).includes('seasonalFlower')) {
    const foe = foesOf(b, u).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
    const goal = foe ?? u;
    const spots = tilesInRange(b, u, 2, 3, u.size).filter((p) => free(b, u, p.x, p.y)).sort((p, q) => footDist(p.x, p.y, u.size, goal.x, goal.y, goal.size) - footDist(q.x, q.y, u.size, goal.x, goal.y, goal.size));
    if (spots[0]) { u.x = spots[0].x; u.y = spots[0].y; lines.push(`The Seasonal Flower launches ${u.name} over the obstacles!`); }
  }
  if (u.team === 'player' && has(u, 'secretDiscovery')) { const n = revealAround(b, u, 2); if (n) lines.push(`${u.name} spots ${n} hidden thing${n > 1 ? 's' : ''}.`); }
  if (!lines.length) return null;
  b.log.push(...lines);
  return lines.join(' ');
}

/** Reveal hidden enemies, Invisible Floors and treasure within r. Returns how many. */
function revealAround(b: Battle, u: Pos & { size: number; team: Unit['team'] }, r: number): number {
  let n = 0;
  for (const e of b.units) if (e.team !== u.team && e.hidden && footDist(e.x, e.y, e.size, u.x, u.y, u.size) <= r) { e.hidden = false; if (e.lgUnder) e.lgUnder = false; n++; }
  for (const t of b.traps ?? []) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= r) { t.hidden = false; n++; }
  for (const p of tilesInRange(b, u, 0, r, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'invisibleFloor') { b.tiles[k] = 'plain'; n++; } }
  if (n && b.lg) b.lg.found += n;
  return n;
}

// ───────────────────────── Combat ─────────────────────────

export interface LGMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

/** Situational bonuses (combat.ts situational). */
export function lgMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): LGMods {
  const m: LGMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const d = unitDist(u, foe, pos);
  const tags = lgTags(u);
  // Ganon: the Power of the Triforce.
  if (has(u, 'powerOfTheTriforce')) { if (u.hp > u.stats.hp / 2) { m.str += 5; m.mag += 5; } else m.spd += 4; }
  if (b.units.some((g) => g.team !== u.team && has(g, 'powerOfTheTriforce') && g.hp <= g.stats.hp / 2 && unitDist(u, g, pos) <= 2)) m.hit -= 10;
  // Zelda: the Bloodline of the Sages.
  if (SAGES.has(tid(u)) || u.abilities.some((id) => /sacred|sage/i.test(id))) if (b.units.some((z) => z !== u && z.team === u.team && has(z, 'bloodlineOfTheSages') && unitDist(u, z, pos) <= 2)) { m.mag += 3; m.res += 3; }
  // Link's Uncle: Family Legacy.
  if (/link|hero/i.test(tid(u)) && b.units.some((a) => a !== u && a.team === u.team && has(a, 'familyLegacy') && unitDist(u, a, pos) <= 1)) { m.str += 3; m.def += 3; }
  if (has(u, 'recklessCourage') && initiating && (foe.level > u.level || foe.isBoss)) m.str += 5;
  if (has(u, 'illusoryFairy') && d > 1) m.avoid += 20;
  if (has(u, 'grandWizzrobe')) m.mag += 3;
  if ((has(u, 'wizzrobeBlink') || has(u, 'grandWizzrobe')) && b.units.some((a) => a !== u && a.team === u.team && has(a, 'grandWizzrobe') && unitDist(u, a, pos) <= 3)) m.mag += 2;
  if (has(u, 'amphibiousAssault') && !tilesOf(b, u).some((t) => WATERY.includes(t))) m.skl += 4;
  if (has(u, 'hoveringGiant') && initiating && u.movedDist >= 3) m.dmg += 4;
  // Din's Seasonal Harmony and the Oracle of Seasons' army.
  const season = b.lg?.season;
  if (season && (b.units.some((a) => a.team === u.team && has(a, 'seasonalHarmony') && unitDist(u, a, pos) <= 3) || (u.team === 'player' && b.bonus === 'seasonalBlessing'))) m[SEASON_STAT[season]] += 2;
  // Ganon's army: demonic and undead units.
  if (u.team === 'player' && b.bonus === 'kingOfDarkness' && (unitTags(u).includes('demon') || unitTags(u).includes('undead'))) { m.str += 3; m.mag += 3; }
  // Gear.
  if (tags.has('frontalMask') && d === 1 && !isHeavy(WEAPONS[foe.weapons[0]])) m.def += 12;
  if (tags.has('crownAura')) { /* aura only */ }
  if (b.units.some((a) => a !== u && a.team === u.team && tag(a, 'crownAura') && unitDist(u, a, pos) <= 1) && u.movedDist === 0) m.def += 3;
  if (w && (w.type === 'gauntlet' || w.type === 'natural')) m.dmg += (tags.has('unarmed6') || tags.has('boxing') ? 6 : 0) + (tags.has('unarmed2') ? 2 : 0);
  if (w?.type === 'boomerang') m.dmg += tags.has('rang6') ? 6 : tags.has('rang3') ? 3 : 0;
  if (w?.type === 'sword' && tags.has('plaque')) m.dmg += 3;
  if (w?.lg?.includes('guardian') && alliesOf(b, u).some((a) => unitDist(u, a, pos) <= 1)) m.dmg += 3;
  if (hasBuff(foe, 'moblinForm') && isDemonic(u)) m.hit -= 10;
  // Shadow Nightmare's forms.
  if (u.lgForm !== undefined) {
    const f = [{ def: 6 }, { mag: 6 }, { spd: 6 }, { str: 5, mag: 5 }, { spd: 4 }, { mag: 5 }][u.lgForm] as Partial<LGMods>;
    for (const [k, v] of Object.entries(f)) m[k as keyof LGMods] += v as number;
  }
  return m;
}

/** Extra reach: sword beams, Hurricane Punch, Sahasrahla's Staff, the Nightmare's ranged forms, Slime Eel, Ramrock's extending arms. */
export function lgRangeBonus(u: Unit, w: WeaponDef): number {
  let n = 0;
  if (w.lg?.includes('beam')) {
    const tags = lgTags(u);
    const pct = u.hp / u.stats.hp;
    if (pct >= 1 || tags.has('energyBeam') || (tags.has('light50') && pct > 0.5) || (tags.has('light75') && pct > 0.75)) n += w.lg.includes('strongBeam') ? 3 : 2;
  }
  if (w.type === 'gauntlet' && has(u, 'hurricanePunch')) n += 1;
  if (w.type === 'magic' && u.weapons.some((id) => WEAPONS[id]?.lg?.includes('spellRange'))) n += 1;
  if (has(u, 'burrowingHeads')) n += 2;
  if (u.lgForm === 1 || u.lgForm === 5) n += 2;
  if (has(u, 'changingArsenal') && u.buffs.some((x) => x.id === 'ramrockArms' && x.name === 'Extending Arms')) n += 2;
  if (hasBuff(u, 'octoForm')) n += 2;
  return n;
}

/** Can't attack: rabbits, the cloaked, and foes that can't be reached (submerged Octogon). */
export function lgCannotAttack(atk: Unit, def?: Unit, d = 1): boolean {
  if (hasBuff(atk, 'bunny') || hasBuff(atk, 'magicCape')) return true;
  if (def && hasBuff(def, 'magicCape')) return true;
  if (def && has(def, 'amphibiousAssault') && def.buffs.some((x) => x.id === 'submergedOcto') && d > 1) return true;
  return false;
}

/** Damage multiplier: rings, armor, boss shells and masks, silver arrows, seasons. */
export function lgMultiplier(b: Battle, atk: Unit, def: Unit, magical: boolean, w: WeaponDef | undefined, d: number, element?: Element, arrow?: AbilityDef): number {
  let m = 1;
  const at = lgTags(atk), dt = lgTags(def);
  // Attacker's rings and items.
  if (!magical && at.has('physical200')) m *= 2;
  else if (!magical && at.has('physical150')) m *= 1.5;
  if (at.has('cursed')) m *= 0.5;
  if (at.has('doubleEdged')) m *= 1.5;
  if (at.has('whimsical')) m *= 0.75;
  if (!magical && hasBuff(atk, 'pieceOfPower')) m *= 2;
  if (w?.lg?.includes('giantKiller') && def.level > atk.level) m *= 1.25;
  if (w?.lg?.includes('eatsPlants') && unitTags(def).includes('plant')) m *= 2;
  if (has(atk, 'voraciousAppetite') && unitTags(def).includes('plant')) m *= 2;
  if (at.has('nightmareEssence') && def.statuses.some((s) => s.kind === 'sleep' || s.kind === 'fear' || s.kind === 'confuse')) m *= 1.3;
  if (atk.team === 'player' && b.bonus === 'generalOfDarkness' && isHeavy(w)) m *= 1.15;
  if (atk.team === 'player' && b.bonus === 'sacredMaiden' && (magical && (element === 'light' || atk.abilities.some((a) => /sacred/i.test(a))))) m *= 1.2;
  if (atk.illusionOf && atk.team === 'player' && b.bonus === 'falseMagic') m *= 1.5;
  if (w?.type === 'bow' && hasBuff(atk, 'silverArrows') && has(def, 'powerOfTheTriforce')) m *= 1.5;
  // Seasons.
  if (b.lg?.season === 'summer' && element === 'fire') m *= 1.2;
  if (b.lg?.season === 'winter' && element === 'ice') m *= 1.2;
  // Defender's armor and rings.
  if (dt.has('damage50')) m *= 0.5;
  else if (dt.has('damage75')) m *= 0.75;
  if (dt.has('cursed')) m *= 2;
  if (hasBuff(def, 'guardianAcorn')) m *= 0.5;
  if (hasBuff(def, 'byrna')) m *= 0.25;
  if (dt.has('fireIceGuard') && (element === 'fire' || element === 'ice')) m *= 0.5;
  if (dt.has('fireGuard') && (element === 'fire' || (!magical && d > 1))) m *= 0.75;
  if (dt.has('electricGuard') && element === 'lightning') m *= 0.5;
  if (dt.has('beamGuard') && d > 1 && w?.type === 'sword') m *= 0.5;
  if (dt.has('projectileHazard') && d > 1 && w?.magicContact) m *= 0.5;
  // Bosses.
  const heavy = isHeavy(w);
  if (has(def, 'armoredMask') && !def.lgMaskBroken && d <= 1 && !heavy) m *= 0.25;
  if (has(def, 'protectiveArrgi') && (def.lgGuards ?? 0) > 0 && w?.type !== 'hookshot') m *= 0.3;
  if (has(def, 'watchingEyes') && (def.lgGuards ?? 0) > 0) m *= 0.4;
  if (has(def, 'orbitingEyes') && (def.lgGuards ?? 0) > 0) m *= 0.6;
  if (has(def, 'frozenPrison') && def.lgShell && element !== 'fire') m *= 0.2;
  if (has(def, 'magicBottle') && def.lgShell) m *= 0;
  if (has(def, 'headlessSpiritSkill') && def.lgShell) m *= 0.25;
  if (has(def, 'heavyShell') && !heavy && !magical) m *= 0.5;
  if (has(def, 'burrowingHeads') && !def.attacked) m *= 0.6;
  if (has(def, 'possessedVessel') && !hasBuff(def, 'veranRevealed') && arrow?.id !== 'mysteryShot') m *= 0.5;
  if (has(def, 'dualElements') && (element === 'fire' || element === 'ice')) m *= 1.5;
  if (has(def, 'rotatingFaces') && def.buffs.some((x) => x.id === 'thwompFace' && x.name === 'Open Face')) m *= 1.5;
  if (hasBuff(def, 'balladWeakened')) m *= 1.25;
  return m;
}

/** Defense pierced: Onox and Dark Dragon Onox ignore 30% DEF with heavy attacks. */
export function lgDefense(atk: Unit, w: WeaponDef | undefined, defense: number, magical: boolean): number {
  if (!magical && (has(atk, 'generalOfDarkness') || has(atk, 'dragonOfDarkness')) && (isHeavy(w) || has(atk, 'dragonOfDarkness'))) return Math.floor(defense * 0.7);
  return defense;
}

/** Strikes twice: Ramrock's pincers, Eyesoar with two or more eyes. */
export function lgExtraAttack(atk: Unit, initiating: boolean): boolean {
  if (!initiating) return false;
  if (has(atk, 'changingArsenal') && atk.buffs.some((x) => x.id === 'ramrockArms' && x.name === 'Pincers')) return true;
  if (has(atk, 'orbitingEyes') && (atk.lgGuards ?? 0) >= 2) return true;
  return false;
}

/** One strike landing: Protection Ring, Coral Triangle, the Whimsical Ring's huge hit. */
export function lgOnStrike(_b: Battle, by: Unit, target: Unit, dmg: number, rng: RNG): { dmg: number; line?: string } {
  if (dmg <= 0) return { dmg };
  const used = (target.lgUsed ??= []);
  if (tag(by, 'whimsical') && rng.chance(10)) return { dmg: dmg * 3, line: `${by.name}'s Whimsical Ring: a huge hit!` };
  if (tag(target, 'protection') && !used.includes('protection') && dmg > target.stats.hp * 0.25) { used.push('protection'); return { dmg: Math.ceil(target.stats.hp * 0.25), line: `${target.name}'s Protection Ring softens the blow.` }; }
  if (tag(target, 'sirenBarrier') && !used.includes('coral') && dmg >= target.stats.hp * 0.25) { used.push('coral'); return { dmg: 0, line: `The Coral Triangle's barrier stops the blow.` }; }
  return { dmg };
}

/** After a hit: masks crack, shells melt, Arrgi are pulled away, heads are released, bodies divide. */
export function lgAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element?: Element, arrowId?: string | null): string[] {
  const lines: string[] = [];
  const heavy = isHeavy(w);
  if (has(target, 'armoredMask') && !target.lgMaskBroken && heavy && unitDist(by, target) <= 1) {
    target.lgMask = (target.lgMask ?? 0) + 1;
    if (target.lgMask >= 3) { target.lgMaskBroken = true; lines.push(`${target.name}'s mask shatters!`); } else lines.push(`${target.name}'s mask cracks (${target.lgMask}/3).`);
  }
  if (has(target, 'protectiveArrgi') && (target.lgGuards ?? 0) > 0) {
    const n = w?.type === 'hookshot' || w?.lg?.includes('switchHook') ? 2 : 1;
    target.lgGuards = Math.max(0, (target.lgGuards ?? 0) - n);
    lines.push(target.lgGuards ? `An Arrgi is torn away (${target.lgGuards} left).` : `The last Arrgi is gone — ${target.name} is exposed!`);
  }
  if ((has(target, 'watchingEyes') || has(target, 'orbitingEyes')) && (target.lgGuards ?? 0) > 0 && (dmg > 0 || b.turn % 2 === 0)) {
    target.lgGuards = (target.lgGuards ?? 1) - 1;
    lines.push(target.lgGuards ? `One of ${target.name}'s eyes falls (${target.lgGuards} left).` : `${target.name}'s eyes are gone!`);
  }
  if (has(target, 'frozenPrison') && target.lgShell && element === 'fire') {
    target.lgShell = false;
    lines.push(`The ice around ${target.name} melts — and it splits apart!`);
    for (let i = 0; i < 2; i++) spawnTemp(b, 'kholdstareBody', target, target.team, target.level);
  }
  if ((has(target, 'magicBottle') || has(target, 'headlessSpiritSkill')) && target.lgShell) {
    target.lgShellHits = (target.lgShellHits ?? 0) + 1;
    if (heavy || lifts(by) || target.lgShellHits >= 3) { target.lgShell = false; lines.push(has(target, 'magicBottle') ? `${target.name}'s bottle shatters!` : `${target.name}'s pumpkin head flies off!`); }
  }
  if (has(target, 'detachedHeads') && target.hp > 0) {
    const want = target.hp < target.stats.hp / 3 ? 2 : target.hp < (target.stats.hp * 2) / 3 ? 1 : 0;
    while ((target.lgSplits ?? 0) < want) { target.lgSplits = (target.lgSplits ?? 0) + 1; if (spawnTemp(b, 'blindHead', target, target.team, target.level)) lines.push(`A head breaks away from ${target.name}!`); }
  }
  if (has(target, 'dividingBody') && target.hp > 1 && !target.lgSplits && ((by.movedDist >= 2 && by.attacked) || heavy)) {
    target.lgSplits = 1;
    const half = Math.floor(target.hp / 2);
    target.hp -= half;
    const twin = spawnTemp(b, 'slimeEyeHalf', target, target.team, target.level);
    if (twin) { twin.hp = Math.max(1, half); twin.stats.hp = Math.max(twin.stats.hp, half); lines.push(`${target.name} splits in two!`); }
  }
  if (has(target, 'cloudAssembly') && dmg >= target.stats.hp * 0.15 && (target.lgSplits ?? 0) < 4) {
    target.lgSplits = (target.lgSplits ?? 0) + 1;
    if (spawnTemp(b, 'smogFragment', target, target.team, target.level)) lines.push(`A cloud fragment breaks off ${target.name}.`);
  }
  // Shadow copies vanish in direct light.
  if (element === 'light' || hasEffect(by, 'lantern')) {
    const before = b.units.length;
    b.units = b.units.filter((x) => !(x.artId === 'hagShadow' && unitDist(x, target) <= 4));
    if (b.units.length < before) lines.push('The light scatters the shadow copies!');
  }
  if (has(target, 'possessedVessel') && (arrowId === 'mysteryShot' || element === 'light')) { buff(target, 'veranRevealed', 'Revealed', 3); lines.push(`${target.name}'s true shape shows through: Veran is exposed!`); }
  if (target.lgUnder) { target.lgUnder = false; target.hidden = false; }
  // Weapon effects.
  if (dmg > 0 && target.hp > 0) {
    if (w?.lg?.includes('knockback') || (tag(by, 'boxing') && (w?.type === 'gauntlet' || w?.type === 'natural'))) if (!tag(target, 'steadfast')) pushAway(b, target, by, 1);
    if (w?.lg?.includes('seasons') && b.lg?.season) {
      const s = b.lg.season;
      if ((b.turn + target.uid.length) % 4 === 0) addStatus(target, s === 'winter' ? 'freeze' : s === 'summer' ? 'burn' : s === 'autumn' ? 'confuse' : 'stun', 1);
    }
    if (arrowId === 'pegasusShot') addStatus(target, 'root', 1);
    if (arrowId === 'galeShot' && !target.isBoss) pushAway(b, target, by, 2);
    if (tag(by, 'petrifyCrit') && dmg >= effectiveStats(by).mag) addStatus(target, 'petrified', 1);
    if (has(target, 'electricalBody') && unitDist(by, target) <= 1 && w && ['sword', 'lance', 'axe', 'dagger', 'hammer'].includes(w.type) && !tag(by, 'electricGuard') && by.hp > 1) {
      const z = Math.min(by.hp - 1, 4); by.hp -= z; addStatus(by, 'shock', 1); lines.push(`${target.name}'s body shocks ${by.name} (−${z}).`);
    }
  }
  b.log.push(...lines);
  return lines;
}

/** Instead of falling: the next form rises (Shadow Nightmare, Veran, Possessed Nayru, Onox). */
export function lgSaveFromDeath(b: Battle, u: Unit): { line: string; heal: number } | null {
  if (has(u, 'nightmareTransformation') && (u.lgForm ?? 0) < NIGHTMARE_FORMS.length - 1) {
    const i = (u.lgForm ?? 0) + 1;
    setNightmareForm(u, i);
    return { line: `The shadow reforms: ${NIGHTMARE_FORMS[i].name}!`, heal: Math.ceil(u.stats.hp * 0.45) };
  }
  if (u.team !== 'enemy') return null;
  const chain: Record<string, string> = { nayruPossessed: 'veran', veran: 'veranTurtle', veranTurtle: 'veranSpider', veranSpider: 'veranBee', onox: 'onoxDragon' };
  const next = chain[tid(u)];
  if (next && TEMPLATES[next] && roomFor(b, u, TEMPLATES[next].size)) {
    const was = u.name;
    const boss = u.isBoss;
    transformInto(b, u, next);
    u.isBoss = boss;
    u.artId = next;
    u.hp = u.stats.hp;
    const line = tid(u) === 'veran' && was.startsWith('Possessed') ? 'Veran is driven out of Nayru — the Sorceress of Shadows herself!' : `${was} becomes ${u.name}!`;
    return { line, heal: Math.ceil(u.stats.hp * (next === 'veran' ? 0.8 : 0.6)) };
  }
  return null;
}

/** After an exchange: ricochets, copies, recoil, extra elemental strikes, Moosh's ground pound. */
export function lgAfterCombat(b: Battle, attacker: Unit, defender: Unit, landed: { atk: number; def: number }, rng: RNG): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const zap = (by: Unit, t: Unit, dmg: number) => {
    dmg = Math.max(0, Math.min(t.hp - (t.isBoss ? 1 : 0), Math.floor(dmg)));
    if (dmg <= 0) return;
    t.hp -= dmg;
    const killed = t.hp <= 0;
    out.push({ uid: t.uid, dmg, hp: t.hp, killed, by: by.uid });
    if (killed) { b.units = b.units.filter((x) => x !== t); if (!t.summoned) b.fallen.push(t); by.kills++; }
  };
  const w = WEAPONS[attacker.weapons[0]];
  if (landed.atk > 0 && w?.lg?.includes('ricochet')) {
    const second = foesOf(b, attacker).find((e) => e !== defender && unitDist(e, defender) <= 2);
    if (second) zap(attacker, second, landed.atk / 2);
  }
  if (landed.atk > 0 && w?.lg?.includes('copyShot') && rng.chance(30)) {
    const second = foesOf(b, attacker).find((e) => e !== defender && unitDist(e, defender) <= 2);
    if (second) { zap(attacker, second, landed.atk / 2); b.log.push(`A copy of the bolt splits off toward ${second.name}.`); }
  }
  for (const [me, foe, dealt] of [[attacker, defender, landed.atk], [defender, attacker, landed.def]] as const) {
    if (me.hp <= 0) continue;
    if (dealt > 0 && tag(me, 'doubleEdged')) { const r = Math.min(me.hp - 1, Math.ceil(dealt * 0.1)); if (r > 0) { me.hp -= r; b.log.push(`${me.name} takes ${r} recoil (Double-Edged Ring).`); } }
    if (foe.hp > 0 && has(me, 'dualElements')) zap(me, foe, Math.max(1, Math.floor(effectiveStats(me).mag / 2) + 4 - effectiveStats(foe).res));
  }
  if (attacker.hp > 0 && has(attacker, 'hoveringGiant') && attacker.movedDist >= 3) for (const e of foesOf(b, attacker)) if (e !== defender && unitDist(e, attacker) <= 1) zap(attacker, e, 4);
  if (attacker.lgUnder !== undefined) { attacker.lgUnder = false; attacker.hidden = false; }
  return out;
}

/** On a kill: BowWow eats plants, spoils drop, an Iron Ball stays behind, Agahnim's illusions fade. */
export function lgOnKill(b: Battle, by: Unit, victim: Unit, rng: RNG) {
  if (has(by, 'voraciousAppetite') && unitTags(victim).includes('plant')) { const h = Math.min(by.stats.hp - by.hp, Math.ceil(by.stats.hp * 0.3)); by.hp += h; if (h) b.log.push(`${by.name} gobbles it up (+${h} HP).`); }
  if (victim.weapons.includes('ironBall') && victim.team === 'enemy') (b.dropped ??= []).push({ x: victim.x, y: victim.y, id: 'ironBall' });
  const spoil = SPOILS[victim.artId ?? ''];
  if (spoil && victim.team === 'enemy' && by.team === 'player' && rng.chance(tag(by, 'greenJoy') ? 50 : 25)) (b.loot ??= []).push(spoil);
  if (has(victim, 'falseMagicSkill')) b.units = b.units.filter((x) => x.illusionOf !== victim.uid);
}

// ───────────────────────── Statuses ─────────────────────────

export function lgImmune(b: Battle | undefined, u: Unit, kind: StatusKind): boolean {
  if ((kind === 'sleep' || kind === 'confuse') && tag(u, 'noSleep')) return true;
  if (kind === 'sleep' && (has(u, 'livingDream') || (b && b.units.some((a) => a.team === u.team && has(a, 'livingDream') && unitDist(u, a) <= 5)))) return true;
  if ((kind === 'curse' || kind === 'weaponCurse') && tag(u, 'whisp')) return true;
  return false;
}

/** Healing items: Syrup's brewing (within 2), Impa's care (adjacent), the Blue Joy Ring. */
export function lgHealItemMult(b: Battle, u: Unit): number {
  let m = 1;
  if (b.units.some((a) => a.team === u.team && has(a, 'potionBrewing') && unitDist(u, a) <= 2)) m *= 1.3;
  if (b.units.some((a) => a !== u && a.team === u.team && has(a, 'royalCaretaker') && unitDist(u, a) <= 1)) m *= 1.3;
  if (tag(u, 'blueJoy')) m *= 1.5;
  if (u.weapons.some((id) => WEAPONS[id]?.lg?.includes('potionBoost'))) m *= 1.3;
  return m;
}

// ───────────────────────── Abilities ─────────────────────────

const TILE = new Set(['pegasusDash', 'carryAlly', 'somariaBlockAbility', 'rocsJump', 'switchPlaces']);
const TARGET = new Set(['sealDarkness', 'sendToDarkWorld', 'actionReset', 'veranPossession', 'magneticPull']);
const OTHER = new Set(['secretDiscoveryAbility', 'revealSecrets', 'darknessShroud', 'brewPotion', 'balladOfTheWindFish', 'changeSeasonDin', 'changeSeason', 'songOfAges', 'summonBees',
  'veranMetamorphosis', 'onoxTransform', 'powderMutation', 'burrow', 'ether', 'quake', 'magicCapeCloak', 'byrnaBarrier', 'tuneOfEchoes', 'tuneOfCurrents', 'tuneOfAges', 'magicMirrorWarp',
  'frogsSongOfSoul', 'hitCrystalSwitch', 'poundStake', 'harvestSeeds', 'stoneBeakHint', 'enterPortal', 'enterTimePortal', 'octoForm', 'moblinForm']);
/** Enemy units use these on their own when they can (Onox's dragon, the Nightmare's recovery). */
export const LG_ENEMY_CASTS = ['onoxTransform', 'nightmareShift'];

export const isLegendAbility = (def: AbilityDef) => TILE.has(def.id) || TARGET.has(def.id) || OTHER.has(def.id);
export const lgNeedsTile = (def: AbilityDef) => TILE.has(def.id);
export const lgNeedsTarget = (def: AbilityDef) => TARGET.has(def.id);

const MUSICAL = new Set(['balladOfTheWindFish', 'forestSong', 'songOfAges', 'balladSong', 'frogsSongOfSoul', 'awakeningSong']);

/** Cost multiplier: Legendary Adaptability and the Hero of Legend's army; Sahasrahla's knowledge and staff; the Book of Mudora. */
export function lgCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  let m = 1;
  const toolGranted = !!(def.grantedBy?.gear?.some((g) => Object.values(u.gear ?? {}).includes(g)) || def.grantedBy?.weapons?.some((w) => u.weapons.includes(w)));
  if (toolGranted && (has(u, 'legendaryAdaptability') || (u.team === 'player' && b?.bonus === 'legendaryTools'))) m *= 0.8;
  if ((def.kind === 'spell' || (def.kind === 'personal' && def.mp > 0)) && has(u, 'ancientKnowledge')) m *= 0.75;
  if (def.mp > 0 && u.weapons.some((id) => WEAPONS[id]?.lg?.includes('spellThrift'))) m *= 0.8;
  if (def.mp > 0 && tag(u, 'mudora')) m *= 0.9;
  return m;
}

/** Stamina: the Charge Ring halves technique costs; Legendary Adaptability. */
export function lgStaminaMult(u: Unit, a: AbilityDef): number {
  let m = 1;
  if (tag(u, 'chargeThrift')) m *= 0.5;
  if (has(u, 'legendaryAdaptability') && (a.grantedBy?.gear?.length || a.grantedBy?.weapons?.length)) m *= 0.8;
  return m;
}

/** Cooldown cut: the Oracle of Ages' army. */
export function lgCooldownCut(b: Battle, u: Unit, _def: AbilityDef): number {
  return u.team === 'player' && b.bonus === 'timeHarmony' ? 1 : 0;
}

/** Straight lines from the unit, up to n spaces. */
function lines(b: Battle, u: Unit, n: number): Pos[][] {
  const out: Pos[][] = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const line: Pos[] = [];
    for (let i = 1; i <= n; i++) { const x = u.x + dx * i, y = u.y + dy * i; if (!inBounds(b, x, y)) break; line.push({ x, y }); }
    out.push(line);
  }
  return out;
}

const swapRange = (u: Unit) => (u.weapons.includes('longHook') ? 7 : 4);
const carried = (b: Battle, u: Unit) => alliesOf(b, u).find((a) => a.size === 1 && !a.acted && unitDist(u, a) === 1);

export function lgTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const out: Pos[] = [];
  switch (def.id) {
    case 'pegasusDash': {
      const n = tag(u, 'pegasusBoots') ? 6 : 4;
      for (const line of lines(b, u, n)) {
        for (const p of line) {
          if (unitAt(b, p.x, p.y)) { if (unitAt(b, p.x, p.y)!.team !== u.team) out.push(p); break; }
          if (anchorCost(b, u, p.x, p.y) >= INF) break;
          out.push(p);
        }
      }
      return out;
    }
    case 'carryAlly': {
      const t = carried(b, u);
      if (!t) return [];
      for (const p of tilesInRange(b, u, 1, 4, u.size)) if (free(b, t, p.x, p.y)) out.push(p);
      return out;
    }
    case 'somariaBlockAbility':
      for (const p of tilesInRange(b, u, 1, 2, u.size)) { const t = tileAt(b, p.x, p.y); if ((t === 'plain' && !unitAt(b, p.x, p.y)) || (t === 'somariaBlock' && footDist(p.x, p.y, 1, u.x, u.y, u.size) === 1)) out.push(p); }
      return out;
    case 'rocsJump': {
      const max = tag(u, 'jump3') ? 3 : 2;
      for (const p of tilesInRange(b, u, 2, max, u.size)) if (free(b, u, p.x, p.y)) out.push(p);
      return out;
    }
    case 'switchPlaces':
      for (const p of tilesInRange(b, u, 1, swapRange(u), u.size)) {
        const o = unitAt(b, p.x, p.y);
        if (o && o !== u && o.size <= Math.max(1, u.size) && !(o.isBoss && o.size > u.size)) { if (o.x === p.x && o.y === p.y) out.push(p); }
        else if (!o && tileAt(b, p.x, p.y) === 'switchHookTarget') out.push(p);
      }
      return out;
  }
  return out;
}

export function lgTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  switch (def.id) {
    case 'sealDarkness': case 'sendToDarkWorld': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) <= 3);
    case 'veranPossession': return foesOf(b, u).filter((e) => !e.hidden && !e.isBoss && !e.isCommander && unitDist(u, e) <= 3);
    case 'actionReset': return alliesOf(b, u).filter((a) => a.acted && unitDist(u, a) <= 3 && !a.isBoss);
    case 'magneticPull': return foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) <= 4 && (unitTags(e).includes('armored') || unitTags(e).includes('metal') || unitTags(e).includes('stone') || e.race === 'construct'
      || ['sword', 'lance', 'axe', 'hammer'].includes(WEAPONS[e.weapons[0]]?.type ?? '')));
  }
  return [];
}

const adjacentTile = (b: Battle, u: Unit, t: Terrain): Pos | undefined => tilesInRange(b, u, 1, 1, u.size).find((p) => tileAt(b, p.x, p.y) === t);
const onTile = (b: Battle, u: Unit, ts: Terrain[]) => tilesOf(b, u).some((t) => ts.includes(t));

export function lgUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isLegendAbility(def) && def.id !== 'nightmareShift') return undefined;
  const st = b.lg;
  if (lgNeedsTile(def) && !lgTiles(b, u, def).length) return def.id === 'carryAlly' ? 'No ally next to you to carry' : 'Nowhere to go';
  if (lgNeedsTarget(def) && !lgTargets(b, u, def).length) return 'No one in range';
  switch (def.id) {
    case 'changeSeason': return near(b, u, ['treeStump']) ? null : 'Stand on or next to a Tree Stump';
    case 'tuneOfEchoes': return !st?.era ? 'No Time Portals here' : near(b, u, ['timePortal']) ? null : 'Stand on or next to a Time Portal';
    case 'tuneOfCurrents': return st?.era === 'past' ? null : 'Only in the past';
    case 'tuneOfAges': return st?.era ? null : 'Past and present don\'t meet here';
    case 'enterTimePortal': return onTile(b, u, ['timePortal']) && st?.echoes ? null : onTile(b, u, ['timePortal']) ? 'Play the Tune of Echoes first' : 'Stand on a Time Portal';
    case 'enterPortal': return onTile(b, u, ['lightPortal', 'darkPortal']) && st?.alt ? null : 'Stand on a portal';
    case 'magicMirrorWarp': return st?.world === 'dark' ? null : 'Only in the Dark World';
    case 'hitCrystalSwitch': return adjacentTile(b, u, 'crystalSwitch') ? null : 'No Crystal Switch next to you';
    case 'poundStake': return !adjacentTile(b, u, 'woodenStake') ? 'No Wooden Stake next to you' : u.weapons.some((w) => WEAPONS[w]?.lg?.includes('breaksStakes')) || lifts(u) || isHeavy(WEAPONS[u.weapons[0]]) ? null : 'Needs a hammer or lifting gear';
    case 'harvestSeeds': return adjacentTile(b, u, 'seedTree') ? null : 'No Mystical Seed Tree next to you';
    case 'stoneBeakHint': return !adjacentTile(b, u, 'owlStatue') ? 'No Owl Statue next to you' : b.owned?.includes('stoneBeak') ? null : 'Needs a Stone Beak';
    case 'onoxTransform': return u.hp > u.stats.hp / 2 ? 'Only below half HP' : TEMPLATES.onoxDragon && roomFor(b, u, TEMPLATES.onoxDragon.size) ? null : 'Not enough room';
    case 'veranMetamorphosis': return TEMPLATES[nextVeran(u)] && roomFor(b, u, TEMPLATES[nextVeran(u)].size) ? null : 'Not enough room';
    case 'brewPotion': return u.pack.length >= 6 && !brewIngredient(b, u) ? 'Pack full' : brewIngredient(b, u) || (u.mp >= 10 && !u.usedAbilities?.includes('brewMp')) ? null : 'No ingredients (and the MP brew is used)';
    case 'powderMutation': return null;
    case 'burrow': return u.hidden ? 'Already underground' : null;
  }
  return null;
}

const VERAN_CYCLE = ['veran', 'veranFairy', 'veranTurtle', 'veranSpider', 'veranBee'];
const nextVeran = (u: Unit) => VERAN_CYCLE[(VERAN_CYCLE.indexOf(tid(u)) + 1) % VERAN_CYCLE.length];
const INGREDIENTS: Record<string, string> = { magicMushroom: 'redPotion', sleepyToadstool: 'magicPowder', bottledBee: 'bluePotion', redChuJelly: 'redPotion', blueChuJelly: 'bluePotion', greenChuJelly: 'greenPotion' };
function brewIngredient(b: Battle, u: Unit): { who: Unit; i: number } | null {
  for (const who of [u, ...alliesOf(b, u).filter((a) => unitDist(u, a) === 1)]) { const i = who.pack.findIndex((p) => INGREDIENTS[p.id]); if (i >= 0) return { who, i }; }
  return null;
}

export interface LGOutcome {
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

export function castLegend(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): LGOutcome | null {
  if (!isLegendAbility(def)) return null;
  const out: LGOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const s = effectiveStats(u);
  const st = lgState(b);
  const strike = (e: Unit, dmg: number, status?: StatusKind) => {
    dmg = Math.min(e.hp, Math.max(1, Math.floor(dmg)));
    if (e.buffs.some((x) => x.barrier)) dmg = 0;
    if (dmg >= e.hp) { const sv = lgSaveFromDeath(b, e); if (sv) { out.lines.push(sv.line); e.hp = Math.min(e.stats.hp, 1 + sv.heal); dmg = 0; } }
    e.hp -= dmg;
    const killed = e.hp <= 0;
    const statuses: StatusKind[] = [];
    if (!killed && status) { addStatus(e, status, 2); statuses.push(status); }
    out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses });
    if (killed) { u.kills++; lgOnKill(b, u, e, rng); b.units = b.units.filter((x) => x !== e); if (!e.summoned) b.fallen.push(e); b.log.push(`${u.name} defeated ${e.name}.`); }
  };
  const heal = (a: Unit, amt: number) => { amt = Math.min(a.stats.hp - a.hp, Math.ceil(amt * (u.team === 'player' ? b.healMult : 1))); if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); } };
  const radius = (r: number) => r + (u.team === 'player' && b.bonus === 'balladOfTheWindFish' && MUSICAL.has(def.id) ? 1 : 0);
  const crossed = (fn: () => string[]) => { out.lines.push(...fn()); };
  switch (def.id) {
    case 'pegasusDash': {
      const from = { x: u.x, y: u.y };
      const foe = unitAt(b, at!.x, at!.y);
      let land = at!;
      if (foe && foe !== u) {
        const dx = Math.sign(at!.x - u.x), dy = Math.sign(at!.y - u.y);
        land = { x: at!.x - dx, y: at!.y - dy };
        const w = WEAPONS[u.weapons[0]];
        strike(foe, s.str + (w?.might ?? 0) + 4 - effectiveStats(foe).def);
        if (foe.hp > 0) pushAway(b, foe, u, 1);
      }
      if (land.x !== u.x || land.y !== u.y) { u.x = land.x; u.y = land.y; out.warped = { from, to: { ...land } }; }
      out.lines.push(`${u.name} dashes${foe && foe !== u ? ` into ${foe.name}` : ''}!`);
      return out;
    }
    case 'secretDiscoveryAbility': case 'revealSecrets': {
      const n = revealAround(b, u, def.id === 'revealSecrets' ? 8 : 4);
      out.lines.push(n ? `${u.name} uncovers ${n} hidden thing${n > 1 ? 's' : ''}.` : 'Nothing hidden nearby.');
      return out;
    }
    case 'sealDarkness': {
      const t = target!;
      addStatus(t, 'silence', 2); out.statuses.push({ uid: t.uid, kind: 'silence' });
      buff(t, 'sealed', 'Sealed', 2, { mov: -2 });
      if (isDemonic(t) && (unitTags(t).includes('demon') || t.race === 'nightmare')) strike(t, (s.mag + 6 - effectiveStats(t).res) * (u.team === 'player' && b.bonus === 'sacredMaiden' ? 1.2 : 1));
      out.lines.push(`${t.name} is sealed!`);
      return out;
    }
    case 'darknessShroud': {
      const r = u.hp <= u.stats.hp / 2 ? 5 : 3;
      for (const e of foesOf(b, u)) if (unitDist(u, e) <= r) { addStatus(e, 'blind', 2); out.statuses.push({ uid: e.uid, kind: 'blind' }); }
      addStatus(u, 'veiled', 2);
      out.lines.push('The lights go out.');
      return out;
    }
    case 'brewPotion': {
      const ing = brewIngredient(b, u);
      let made: string;
      if (ing) { const id = ing.who.pack[ing.i].id; made = INGREDIENTS[id]; if (--ing.who.pack[ing.i].uses <= 0) ing.who.pack.splice(ing.i, 1); }
      else { u.mp -= 10; (u.usedAbilities ??= []).push('brewMp'); made = 'redPotion'; }
      const into = [u, ...alliesOf(b, u).filter((a) => unitDist(u, a) === 1)].find((a) => a.pack.length < 6);
      if (into) into.pack.push({ id: made, uses: 1 }); else (b.loot ??= []).push(made);
      out.lines.push(`${u.name} brews a ${made === 'magicPowder' ? 'pinch of Magic Powder' : made === 'bluePotion' ? 'Blue Potion' : made === 'greenPotion' ? 'Green Potion' : 'Red Potion'}${into && into !== u ? ` for ${into.name}` : ''}.`);
      return out;
    }
    case 'sendToDarkWorld': {
      const t = target!;
      out.lines.push(bunnify(t, 2) ? `${t.name} is banished into the Dark World's shape: a rabbit!` : `${t.name} keeps its shape.`);
      return out;
    }
    case 'balladOfTheWindFish': {
      const r = radius(3);
      for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(u, x) <= r)) {
        heal(a, Math.floor(s.mag / 2) + 6);
        const n = a.statuses.length; a.statuses = a.statuses.filter((x) => x.kind !== 'sleep'); if (a.statuses.length < n) out.cleansed.push(a.uid);
      }
      for (const e of foesOf(b, u)) if (unitDist(u, e) <= r && (e.race === 'nightmare' || unitTags(e).includes('nightmare') || unitTags(e).includes('demon'))) { addStatus(e, 'weaken', 2); buff(e, 'balladWeakened', 'Ballad', 2); out.statuses.push({ uid: e.uid, kind: 'weaken' }); }
      out.lines.push('The Ballad of the Wind Fish drifts over the field.');
      return out;
    }
    case 'carryAlly': {
      const t = carried(b, u)!;
      out.warped = { from: { x: t.x, y: t.y }, to: { ...at! } };
      t.x = at!.x; t.y = at!.y;
      out.lines.push(`${u.name} carries ${t.name} over the obstacles.`);
      return out;
    }
    case 'changeSeasonDin': case 'changeSeason': {
      const next = SEASONS[(SEASONS.indexOf(st.season ?? 'winter') + 1) % 4];
      out.lines.push(setSeason(b, next));
      return out;
    }
    case 'actionReset': {
      const t = target!;
      t.acted = false; t.moved = false; t.movedDist = 0;
      out.buffed.push(t.uid);
      out.lines.push(`Time folds back for ${t.name}: it can act again.`);
      return out;
    }
    case 'songOfAges': {
      for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(u, x) <= radius(3))) { cutCooldowns(a, 1); a.mp = Math.min(a.stats.mp, a.mp + 5); out.buffed.push(a.uid); }
      out.lines.push('Nayru sings, and time eases around her friends.');
      return out;
    }
    case 'summonBees': {
      let n = 0;
      for (let i = 0; i < 2; i++) if (spawnTemp(b, 'bee', u, u.team, u.level)) n++;
      out.lines.push(n ? `${n} Bees answer the call!` : 'No room for the swarm.');
      return out;
    }
    case 'veranMetamorphosis': {
      const next = nextVeran(u);
      transformInto(b, u, next);
      out.transformed = u.name;
      out.lines.push(`Veran becomes ${u.name}!`);
      return out;
    }
    case 'veranPossession': {
      const t = target!;
      t.lgPossessed = { team: t.team, turns: tag(u, 'longPossession') ? 3 : 2 };
      t.team = u.team;
      t.npc = u.team === 'player';
      t.moved = t.acted = true;
      out.lines.push(`Veran slips inside ${t.name}!`);
      return out;
    }
    case 'onoxTransform':
      transformInto(b, u, 'onoxDragon');
      (u.usedAbilities ??= []).push(def.id);
      out.transformed = u.name;
      out.lines.push('"You think you have won? Behold my true form!" Onox becomes the Dark Dragon.');
      return out;
    case 'powderMutation': {
      if (tid(u) === 'buzzBlob' || tid(u) === 'cukeman') {
        const into = tid(u) === 'buzzBlob' ? 'cukeman' : 'buzzBlob';
        mutate(u, into);
        out.lines.push(`${u.name === 'Cukeman' ? 'The Buzz Blob' : 'The Cukeman'} becomes a ${u.name}!`);
      }
      for (const e of foesOf(b, u)) if (unitDist(u, e) <= 2) { addStatus(e, 'confuse', 1); out.statuses.push({ uid: e.uid, kind: 'confuse' }); }
      return out;
    }
    case 'burrow': u.hidden = true; u.lgUnder = true; out.lines.push(`${u.name} burrows underground.`); return out;
    case 'ether': {
      for (const e of foesOf(b, u)) { strike(e, s.mag - effectiveStats(e).res); if (e.hp > 0 && !e.isBoss) { addStatus(e, 'freeze', 1); out.statuses.push({ uid: e.uid, kind: 'freeze' }); } }
      for (let k = 0; k < b.tiles.length; k++) if (b.tiles[k] === 'invisibleFloor') b.tiles[k] = 'plain';
      for (const e of b.units) if (e.team !== u.team) e.hidden = false;
      out.lines.push('Ether! A freezing storm sweeps the field.');
      return out;
    }
    case 'quake': {
      for (const e of foesOf(b, u)) {
        if (moveTypeOf(e) === 'flying') continue;
        strike(e, s.str + 4 - effectiveStats(e).def);
        if (e.hp > 0 && !e.isBoss && !e.templateId && e.level <= u.level) { addStatus(e, 'stun', 2); out.statuses.push({ uid: e.uid, kind: 'stun' }); }
      }
      out.lines.push('Quake! The ground splits open.');
      return out;
    }
    case 'magicCapeCloak':
      if (hasBuff(u, 'magicCape')) { u.buffs = u.buffs.filter((x) => x.id !== 'magicCape'); u.hidden = false; out.lines.push(`${u.name} reappears.`); }
      else { u.mp -= 4; buff(u, 'magicCape', 'Magic Cape', 99); if (u.team === 'enemy') u.hidden = true; out.lines.push(`${u.name} vanishes under the Magic Cape.`); }
      return out;
    case 'somariaBlockAbility': {
      const k = keyOf(b, at!.x, at!.y);
      if (b.tiles[k] === 'somariaBlock') {
        b.tiles[k] = 'plain';
        for (const e of foesOf(b, u)) if (footDist(at!.x, at!.y, 1, e.x, e.y, e.size) <= 1) strike(e, s.mag + 6 - effectiveStats(e).res);
        out.lines.push('The Somaria Block bursts into four projectiles!');
      } else { b.tiles[k] = 'somariaBlock'; out.lines.push('A Somaria Block appears.'); }
      return out;
    }
    case 'byrnaBarrier': buff(u, 'byrna', 'Byrna Barrier', 99); out.buffed.push(u.uid); out.lines.push(`A barrier of light spins around ${u.name}.`); return out;
    case 'rocsJump': { const from = { x: u.x, y: u.y }; u.x = at!.x; u.y = at!.y; out.warped = { from, to: { ...at! } }; out.lines.push(`${u.name} leaps!`); return out; }
    case 'magneticPull': { const t = target!; pullToward(b, t, u, 2); out.lines.push(`The Magnetic Gloves drag ${t.name} closer.`); if (has(t, 'protectiveArrgi')) t.lgGuards = Math.max(0, (t.lgGuards ?? 0) - 2); return out; }
    case 'switchPlaces': {
      const o = unitAt(b, at!.x, at!.y);
      const from = { x: u.x, y: u.y };
      if (o) { o.x = from.x; o.y = from.y; u.x = at!.x; u.y = at!.y; if (has(o, 'protectiveArrgi')) o.lgGuards = Math.max(0, (o.lgGuards ?? 0) - 2); }
      else { const k = keyOf(b, at!.x, at!.y), k0 = keyOf(b, from.x, from.y); const t0 = b.tiles[k0]; b.tiles[k0] = 'switchHookTarget'; b.tiles[k] = t0 === 'switchHookTarget' ? 'plain' : t0; u.x = at!.x; u.y = at!.y; }
      out.warped = { from, to: { ...at! } };
      out.lines.push(o ? `${u.name} switches places with ${o.name}!` : `${u.name} switches places with the target.`);
      return out;
    }
    case 'tuneOfEchoes': st.echoes = true; crossed(() => shiftEra(b)); out.lines.unshift('The Tune of Echoes: the Time Portals awaken.'); return out;
    case 'tuneOfCurrents': case 'tuneOfAges': case 'enterTimePortal': crossed(() => shiftEra(b)); return out;
    case 'enterPortal': case 'magicMirrorWarp': crossed(() => crossWorlds(b, rng)); return out;
    case 'frogsSongOfSoul':
      for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(u, x) <= radius(3))) {
        const n = a.statuses.length; a.statuses = a.statuses.filter((x) => !['sleep', 'stun', 'petrified'].includes(x.kind)); if (a.statuses.length < n) out.cleansed.push(a.uid);
        if (a.hp === 1) heal(a, a.stats.hp * 0.3);
      }
      out.lines.push("The Frog's Song of Soul wakes what was sleeping.");
      return out;
    case 'hitCrystalSwitch': {
      let n = 0;
      for (let k = 0; k < b.tiles.length; k++) {
        const x = k % b.width, y = Math.floor(k / b.width);
        if (b.tiles[k] === 'crystalBarrier') { b.tiles[k] = 'loweredBarrier'; n++; }
        else if (b.tiles[k] === 'loweredBarrier' && !unitAt(b, x, y)) { b.tiles[k] = 'crystalBarrier'; n++; }
      }
      out.lines.push(`The switch changes colour: ${n} barrier${n === 1 ? '' : 's'} move.`);
      return out;
    }
    case 'poundStake': { const p = adjacentTile(b, u, 'woodenStake')!; b.tiles[keyOf(b, p.x, p.y)] = 'plain'; out.lines.push('The stake sinks into the ground.'); return out; }
    case 'harvestSeeds': {
      const p = adjacentTile(b, u, 'seedTree')!;
      const k = keyOf(b, p.x, p.y);
      const kind = SEED_TREE_KIND[k % SEED_TREE_KIND.length];
      st.seeds[kind] = (st.seeds[kind] ?? 0) + 8;
      if (kind === 'gale' && !st.warpTrees.includes(k)) st.warpTrees.push(k);
      (u.turnUses ??= {})[`tree${k}`] = b.turn;
      out.lines.push(`${u.name} shakes the tree: +8 ${kind[0].toUpperCase()}${kind.slice(1)} Seeds.`);
      return out;
    }
    case 'stoneBeakHint': {
      const n = revealAround(b, u, 5);
      for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(u, x) <= 2)) buff(a, 'owlHint', "The Owl's Hint", 1, { skl: 3 });
      out.lines.push(`"Hoot! Listen well..." ${n ? `${n} hidden thing${n > 1 ? 's are' : ' is'} revealed.` : 'The owl gives you courage.'}`);
      return out;
    }
    case 'octoForm': buff(u, 'octoForm', 'Octorok', 3, { str: -4 }); u.artOverride = 'octorok'; out.lines.push(`${u.name} becomes an Octorok!`); return out;
    case 'moblinForm': buff(u, 'moblinForm', 'Moblin', 3, { str: 4, def: 2 }); u.artOverride = 'moblin'; out.lines.push(`${u.name} becomes a Moblin!`); return out;
  }
  return null;
}

/** Buzz Blob <-> Cukeman (Magic Powder, Powder Mutation). */
function mutate(u: Unit, into: string) {
  const a = ENEMIES[into];
  if (!a) return;
  Object.assign(u, { name: a.name, artId: into, glyph: a.glyph ?? u.glyph, weapons: [...a.weapons], skills: a.skill ? [a.skill] : [] });
  if (u.templateId === 'buzzBlob' || u.templateId === 'cukeman') u.templateId = into;
}

/** After any ability: Marin's army reaches further, songs heal more, Forest Melody restores stamina, the Spin Ring. */
export function lgAfterAbility(b: Battle, u: Unit, def: AbilityDef, res: { hits: { uid: string; dmg: number; hp: number; killed: boolean }[]; heals: { uid: string; amount: number }[]; lines: string[] }) {
  if (def.kind === 'song' || MUSICAL.has(def.id)) {
    if (has(u, 'forestMelody')) for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(u, x) <= 3)) a.sta = Math.min(a.stats.sta, a.sta + 8);
    const musical = has(u, 'balladOfTheWindFishSkill') || u.weapons.some((id) => WEAPONS[id]?.lg?.includes('musicHeal'));
    if (musical) for (const h of res.heals) { const a = b.units.find((x) => x.uid === h.uid); if (!a) continue; const extra = Math.min(a.stats.hp - a.hp, Math.ceil(h.amount / 2)); if (extra > 0) { a.hp += extra; h.amount += extra; } }
    if (has(u, 'balladOfTheWindFishSkill')) for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(u, x) <= 3)) a.statuses = a.statuses.filter((x) => x.kind !== 'sleep');
    // The Ballad of Koholint: musical abilities reach a space further.
    if (u.team === 'player' && b.bonus === 'balladOfTheWindFish' && def.kind === 'song' && res.heals.length) {
      const r = def.radius ?? 3;
      const avg = Math.ceil(res.heals.reduce((n, h) => n + h.amount, 0) / res.heals.length);
      for (const a of alliesOf(b, u).filter((x) => unitDist(u, x) === r + 1)) { const amt = Math.min(a.stats.hp - a.hp, avg); if (amt > 0) { a.hp += amt; res.heals.push({ uid: a.uid, amount: amt }); } }
    }
  }
  if (tag(u, 'spinTwice') && ['hurricaneSpin', 'spinAttack', 'greatSpin'].includes(def.id)) {
    for (const h of [...res.hits]) {
      const e = b.units.find((x) => x.uid === h.uid);
      if (!e || e.hp <= 0 || h.dmg <= 0) continue;
      const dmg = Math.min(e.hp - (e.isBoss ? 1 : 0), h.dmg);
      if (dmg <= 0) continue;
      e.hp -= dmg;
      res.hits.push({ uid: e.uid, dmg, hp: e.hp, killed: e.hp <= 0 });
      if (e.hp <= 0) { b.units = b.units.filter((x) => x !== e); if (!e.summoned) b.fallen.push(e); u.kills++; }
    }
    res.lines.push('The Spin Ring: the spin strikes twice!');
  }
}

// ───────────────────────── Items ─────────────────────────

const PLANTABLE: Terrain[] = ['softSoil'];

export function lgItemTiles(b: Battle, u: Unit, id: string, tiles: Pos[]): Pos[] | null {
  if (id === 'gashaSeed') return tilesInRange(b, u, 1, 1, u.size).filter((p) => PLANTABLE.includes(tileAt(b, p.x, p.y)!) && !unitAt(b, p.x, p.y));
  if (tag(u, 'toss') && ['emberSeed', 'scentSeed', 'mysterySeed', 'bomb', 'superBomb'].includes(id)) {
    const more = tiles.length ? tilesInRange(b, u, 1, Math.max(...tiles.map((p) => footDist(p.x, p.y, 1, u.x, u.y, u.size))) + 2, u.size) : tiles;
    return more;
  }
  return null;
}

export function lgCanUseItem(b: Battle, u: Unit, id: string): boolean | undefined {
  if (id === 'gashaSeed') return (lgItemTiles(b, u, id, []) ?? []).length > 0;
  if (id === 'strangeFlute') return true;
  return undefined;
}

/** Era of Legend pack items. Returns a log line, or null if the item isn't one of ours. */
export function useLegendItem(b: Battle, u: Unit, id: string, rng: RNG, target?: Unit, at?: Pos): string | null {
  const st = lgState(b);
  switch (id) {
    case 'magicPowder': {
      const t = target;
      if (t && t.team !== u.team && tid(t) === 'antiFairy') {
        b.units = b.units.filter((x) => x !== t);
        for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(t, x) <= 2)) a.hp = Math.min(a.stats.hp, a.hp + Math.ceil(a.stats.hp * 0.3));
        return 'The Anti-Fairy turns into a healing fairy and flutters around everyone nearby!';
      }
      if (t && (tid(t) === 'buzzBlob' || tid(t) === 'cukeman')) { mutate(t, tid(t) === 'buzzBlob' ? 'cukeman' : 'buzzBlob'); return `Poof! It's a ${t.name} now.`; }
      if (at) { const k = keyOf(b, at.x, at.y); if (b.tiles[k] === 'seedTree') { st.seeds.ember += 5; return 'The powder sparks on the tree: +5 Ember Seeds.'; } }
      if (t && t.team !== u.team) { addStatus(t, 'confuse', 1); return `${t.name} sneezes and stumbles about.`; }
      return 'Sparkling powder drifts away.';
    }
    case 'sleepyToadstool': buff(u, 'toadstool', 'Drowsy', 1); addStatus(u, 'sleep', 1); return `${u.name} eats the toadstool and nods off. (Syrup could have used that.)`;
    case 'bottledBee': case 'goldenBee': { const e = spawnTemp(b, id === 'goldenBee' ? 'goldenBee' : 'bee', u, u.team, u.level); return e ? `A ${e.name} buzzes out to fight!` : 'The bee flies off.'; }
    case 'guardianAcorn': buff(u, 'guardianAcorn', 'Guardian Acorn', 3); return `${u.name} is guarded (damage halved for 3 turns).`;
    case 'pieceOfPower': buff(u, 'pieceOfPower', 'Piece of Power', 3); return `${u.name} is filled with power (physical damage doubled for 3 turns)!`;
    case 'gashaSeed': {
      const k = keyOf(b, at!.x, at!.y);
      st.gashaPlanted++;
      if (st.era === 'past') { b.tiles[k] = 'forest'; return 'A Gasha Seed planted in the past: by the present it will be a great tree.'; }
      b.tiles[k] = 'forest';
      return 'A Gasha sapling takes root. It will grow over the coming battles.';
    }
    case 'gashaNut': {
      const roll = rng.int(0, 99);
      if (roll < 45) { st.mysteryRings = (st.mysteryRings ?? 0) + 1; return 'Inside: a Mystery Ring!'; }
      if (roll < 75) { const r = rng.int(50, 200); b.bonusRupees = (b.bonusRupees ?? 0) + r; return `Inside: ₹${r}.`; }
      (b.loot ??= []).push(rng.pick(['guardianAcorn', 'pieceOfPower', 'gashaSeed', 'secretMedicine', 'goldenBee']));
      return 'Inside: a treasure!';
    }
    case 'makuSeed': {
      let n = 0;
      for (const p of tilesInRange(b, u, 0, 3, u.size)) { const k = keyOf(b, p.x, p.y); if (['crystalBarrier', 'woodenStake', 'invisibleFloor'].includes(b.tiles[k])) { b.tiles[k] = 'plain'; n++; } }
      n += revealAround(b, u, 6);
      return `The Maku Seed glows: ${n} seal${n === 1 ? '' : 's'} broken and secrets laid bare.`;
    }
    case 'emberSeed': {
      const t = at ? unitAt(b, at.x, at.y) : undefined;
      if (at) { const k = keyOf(b, at.x, at.y); if (b.tiles[k] === 'burnableBush' || b.tiles[k] === 'forest') (b.fires ??= []).push({ x: at.x, y: at.y, turns: 2 }); }
      if (t && t.team !== u.team) { const d = Math.min(t.hp, Math.max(1, 8 - Math.floor(effectiveStats(t).res / 2))); t.hp -= d; if (t.hp > 0) addStatus(t, 'burn', 2); else { b.units = b.units.filter((x) => x !== t); b.fallen.push(t); } return `Ember Seed: ${t.name} takes ${d} fire damage.`; }
      return 'The Ember Seed bursts into flame.';
    }
    case 'scentSeed': {
      let n = 0;
      for (const e of foesOf(b, u)) if (at && footDist(at.x, at.y, 1, e.x, e.y, e.size) <= 2 && (unitTags(e).includes('beast') || !e.templateId)) { pullToward(b, e, { ...at, size: 1 }, 1); addStatus(e, 'confuse', 1); n++; }
      return `The scent lures ${n} monster${n === 1 ? '' : 's'}.`;
    }
    case 'pegasusSeed': { const turns = tag(u, 'pegasusLong') ? 4 : 2; buff(u, 'pegasusSeed', 'Pegasus Seed', turns, { mov: 3, spd: 4 }); return `${u.name} runs like the wind (${turns} turns).`; }
    case 'galeSeed': {
      const trees = st.warpTrees.map((k) => ({ x: k % b.width, y: Math.floor(k / b.width) }));
      const pool = [...trees.flatMap((p) => tilesInRange(b, p, 1, 1, 1)), ...tilesInRange(b, u, 2, 6, u.size)].filter((p) => free(b, u, p.x, p.y));
      const foe = foesOf(b, u).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
      const dest = foe ? pool.sort((p, q) => footDist(p.x, p.y, u.size, foe.x, foe.y, foe.size) - footDist(q.x, q.y, u.size, foe.x, foe.y, foe.size))[Math.min(2, pool.length - 1)] : pool[0];
      if (!dest) return 'The wind dies down.';
      u.x = dest.x; u.y = dest.y;
      return `A whirlwind carries ${u.name} away!`;
    }
    case 'mysterySeed': {
      const t = at ? unitAt(b, at.x, at.y) : undefined;
      if (t && has(t, 'possessedVessel')) { buff(t, 'veranRevealed', 'Revealed', 3); return 'The Mystery Seed bursts: Veran\'s true shape shows through!'; }
      if (!t || t.team === u.team) return 'The Mystery Seed bursts harmlessly.';
      const kind = rng.pick<StatusKind>(['burn', 'freeze', 'shock', 'confuse', 'dazed']);
      addStatus(t, kind, 1);
      const d = Math.min(t.hp - 1, 5); if (d > 0) t.hp -= d;
      return `The Mystery Seed bursts on ${t.name}: ${kind}!`;
    }
    case 'strangeFlute': {
      const companion = ['ricky', 'dimitri', 'moosh'].find((c) => b.owned?.includes(`${c === 'ricky' ? 'rickys' : c === 'dimitri' ? 'dimitris' : 'mooshs'}Flute`)) ?? rng.pick(['ricky', 'dimitri', 'moosh']);
      const t = TEMPLATES[companion];
      if (!t) return null;
      const a = { id: companion, name: t.name, race: t.race, classId: t.classId, size: t.size, weapons: [...t.weapons], skill: t.skill, stats: { ...t.stats }, glyph: t.glyph } as EnemyArchetype;
      TEMP[companion] = a;
      const e = spawnTemp(b, companion, u, u.team, u.level);
      if (e) { e.artId = companion; e.moved = e.acted = false; }
      return e ? `${t.name} answers the Strange Flute!` : 'Nobody can reach you here.';
    }
  }
  return null;
}

/** A bomb went off: Helmasaur's mask breaks, Genie's bottle and Pumpkin Head's head too; the Blast Ring adds damage. */
export function lgOnBlast(_b: Battle, by: Unit, victims: Unit[], power: number): string[] {
  const lines: string[] = [];
  for (const e of victims) {
    if (e.hp <= 0) continue;
    if (has(e, 'armoredMask') && !e.lgMaskBroken) { e.lgMaskBroken = true; lines.push(`The explosion breaks ${e.name}'s mask!`); }
    if ((has(e, 'magicBottle') || has(e, 'headlessSpiritSkill')) && e.lgShell) { e.lgShell = false; lines.push(`The blast breaks ${e.name}'s ${has(e, 'magicBottle') ? 'bottle' : 'pumpkin head'}!`); }
    if (tag(by, 'blast')) { const d = Math.min(e.hp - 1, Math.ceil(power / 2)); if (d > 0) e.hp -= d; }
  }
  return lines;
}

/** Before the battle ends: possessed units go home, temporary forms and looks are undone. */
export function legendBeforeFinish(b: Battle) {
  for (const u of [...b.units, ...b.fallen]) {
    if (u.lgPossessed) { u.team = u.lgPossessed.team; u.npc = false; delete u.lgPossessed; }
    delete u.artOverride;
    delete u.lgForm;
    if (u.buffs) u.buffs = u.buffs.filter((x) => x.id !== 'bunny' && x.id !== 'magicCape' && x.id !== 'byrna');
  }
}

/** True while a paired boss fight still has a boss standing. */
export function lgBossesRemain(b: Battle): boolean {
  return !!b.lg?.allBosses && b.units.some((u) => u.team === 'enemy' && u.isBoss);
}

/** Is this unit in a Koholint region (owl statues and the dream)? */
export const inKoholint = (b: Battle) => KOHOLINT.has(b.world);
/** Seed ammunition: usable with seed weapons or an enhanced slingshot while the satchel has that seed. */
export function lgSeedReady(b: Battle | undefined, u: Unit, w: WeaponDef, a: AbilityDef): boolean {
  const kind = SEED_SHOTS[a.id] as SeedKind | undefined;
  if (!kind) return true;
  if (!(w.lg?.includes('seedAmmo') || (w.type === 'sling' && tag(u, 'seedSlingshot')))) return false;
  return !!b && (b.lg?.seeds[kind] ?? 0) > 0;
}
/** A seed shot was fired: one seed fewer. */
export function lgOnAttackMod(b: Battle, a: AbilityDef) {
  const kind = SEED_SHOTS[a.id] as SeedKind | undefined;
  if (kind && b.lg) b.lg.seeds[kind] = Math.max(0, b.lg.seeds[kind] - 1);
}
/** A unit's displayed name for the Shadow Nightmare's current form. */
export const nightmareFormName = (u: Unit) => (u.lgForm !== undefined ? NIGHTMARE_FORMS[u.lgForm]?.name : undefined);
/** Battle setup hook for gear (used by tests). */
export const lgGearDef = (id: string) => GEAR[id];
