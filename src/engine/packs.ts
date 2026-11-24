// Content packs: user-made heroes, worlds, enemies and warlords, created in the
// in-game editor (or imported as JSON) and layered on top of the built-in data.

import { CLASSES } from '../data/classes';
import { BOSSES, ENEMY_ROSTERS } from '../data/enemies';
import { HEROES, HERO_MAP } from '../data/heroes';
import { SKILLS } from '../data/skills';
import { WEAPONS } from '../data/weapons';
import { PLAYABLE_WORLDS, WORLDS } from '../data/worlds';
import type { BossDef, BuiltinWorldId, EnemyArchetype, Growths, HeroDef, SkillId, Stats, StatKey, Terrain, WorldDef, WorldId } from './types';

export const PACK_FORMAT = 1;

export interface PackWorld {
  id: string;
  name: string;
  genre: string;
  blurb: string;
  color: string;
  /** Built-in world whose terrain colours this world borrows. */
  theme: BuiltinWorldId;
  terrainNames: Partial<Record<Terrain, string>>;
}

export interface PackEnemy extends EnemyArchetype {
  id: string;
  world: WorldId;
}

export interface ContentPack {
  format: number;
  id: string;
  name: string;
  author: string;
  description: string;
  enabled: boolean;
  /** Remove the built-in heroes so only pack heroes appear. */
  hideBuiltinHeroes: boolean;
  /** Battles only take place in pack worlds. */
  hideBuiltinWorlds: boolean;
  worlds: PackWorld[];
  heroes: HeroDef[];
  enemies: PackEnemy[];
  bosses: BossDef[];
}

export const TERRAINS: Terrain[] = ['plain', 'forest', 'mountain', 'water', 'wall', 'fort'];
export const THEMES: BuiltinWorldId[] = ['emberhold', 'starfall', 'pixelvale', 'neon', 'ronin', 'hollowmere', 'rift'];
const STAT_KEYS: (StatKey | 'mov')[] = ['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res', 'mov'];

// ───────────────────────── Snapshot of built-in content ─────────────────────────

const BASE = {
  heroes: [...HEROES],
  heroMap: { ...HERO_MAP },
  worlds: { ...WORLDS },
  playable: [...PLAYABLE_WORLDS],
  rosters: Object.fromEntries(Object.entries(ENEMY_ROSTERS).map(([k, v]) => [k, [...v]])),
  bosses: [...BOSSES],
};

const replaceArray = <T>(target: T[], items: T[]) => target.splice(0, target.length, ...items);
const replaceRecord = <T>(target: Record<string, T>, items: Record<string, T>) => {
  for (const k of Object.keys(target)) delete target[k];
  Object.assign(target, items);
};

/** Rebuild the live data tables from the built-in snapshot plus enabled packs. */
export function applyPacks(packs: ContentPack[]): void {
  const enabled = packs.filter((p) => p.enabled);
  const heroes = [...BASE.heroes];
  const heroMap = { ...BASE.heroMap };
  const worlds: Record<string, WorldDef> = { ...BASE.worlds };
  let playable = [...BASE.playable];
  const rosters: Record<string, EnemyArchetype[]> = Object.fromEntries(Object.entries(BASE.rosters).map(([k, v]) => [k, [...v]]));
  let bosses = [...BASE.bosses];
  const packWorlds: string[] = [];

  for (const p of enabled) {
    for (const w of p.worlds) {
      worlds[w.id] = toWorldDef(w);
      packWorlds.push(w.id);
      if (!playable.includes(w.id)) playable.push(w.id);
    }
  }
  for (const p of enabled) {
    for (const h of p.heroes) {
      heroes.push(h);
      heroMap[h.id] = h;
    }
    for (const e of p.enemies) (rosters[e.world] ??= []).push(e);
    bosses.push(...p.bosses);
  }
  const packHeroIds = new Set(enabled.flatMap((p) => p.heroes.map((h) => h.id)));
  if (enabled.some((p) => p.hideBuiltinHeroes) && packHeroIds.size >= 3) {
    // Built-in heroes stay in heroMap so saved runs that include them still load.
    replaceArray(heroes, heroes.filter((h) => packHeroIds.has(h.id)));
  }
  if (enabled.some((p) => p.hideBuiltinWorlds) && packWorlds.length) {
    playable = packWorlds;
    const local = bosses.filter((b) => playable.includes(b.world));
    if (local.length) bosses = local;
  }

  replaceArray(HEROES, heroes);
  replaceRecord(HERO_MAP, heroMap);
  replaceRecord(WORLDS, worlds);
  replaceArray(PLAYABLE_WORLDS, playable);
  replaceRecord(ENEMY_ROSTERS, rosters);
  replaceArray(BOSSES, bosses);
}

function toWorldDef(w: PackWorld): WorldDef {
  const theme = BASE.worlds[w.theme] ?? BASE.worlds.emberhold;
  const terrainNames = { ...theme.terrainNames };
  for (const t of TERRAINS) if (w.terrainNames[t]) terrainNames[t] = w.terrainNames[t]!;
  return { id: w.id, name: w.name, genre: w.genre, blurb: w.blurb, color: w.color, terrainNames, terrainColors: { ...theme.terrainColors } };
}

/** Every world a pack's characters may belong to (built-in + all packs). */
export function knownWorlds(packs: ContentPack[]): { id: string; name: string }[] {
  const out = THEMES.map((id) => ({ id: id as string, name: BASE.worlds[id].name }));
  for (const p of packs) for (const w of p.worlds) out.push({ id: w.id, name: `${w.name} (${p.name})` });
  return out;
}

// ───────────────────────── Normalisation ─────────────────────────

const str = (v: unknown, max: number, fallback = '') => (typeof v === 'string' ? v.trim().slice(0, max) : fallback);
const num = (v: unknown, lo: number, hi: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : 0;
};
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'item';
const glyphOf = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
};
const isColor = (c: string) => /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(c);
const portrait = (v: unknown) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return undefined;
  if (s.startsWith('data:image/') || /^https?:\/\//.test(s)) return s.slice(0, 400_000);
  return undefined;
};

function mods(v: unknown, lo: number, hi: number, keys: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  if (v && typeof v === 'object') {
    for (const k of keys) {
      const n = num((v as Record<string, unknown>)[k], lo, hi);
      if (n) out[k] = n;
    }
  }
  return out;
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base, i = 2;
  while (used.has(id)) id = `${base}-${i++}`;
  used.add(id);
  return id;
}

/** Turn arbitrary JSON (from import or the editor) into a well-formed pack. */
export function normalizePack(raw: unknown, existingIds: string[] = []): ContentPack {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const arr = (k: string) => (Array.isArray(r[k]) ? (r[k] as Record<string, unknown>[]) : []);
  const name = str(r.name, 60, 'Untitled Pack') || 'Untitled Pack';
  const packId = uniqueId(str(r.id, 40) || `pack-${slug(name)}`, new Set(existingIds));
  const used = new Set<string>();
  const ref = (local: string) => (local.includes(':') ? local : `${packId}:${local}`);

  const worlds: PackWorld[] = arr('worlds').map((w) => {
    const wname = str(w.name, 40, 'New World') || 'New World';
    const theme = THEMES.includes(w.theme as BuiltinWorldId) ? (w.theme as BuiltinWorldId) : 'emberhold';
    const tn: Partial<Record<Terrain, string>> = {};
    const rawTn = (w.terrainNames ?? {}) as Record<string, unknown>;
    for (const t of TERRAINS) { const v = str(rawTn[t], 30); if (v) tn[t] = v; }
    const color = str(w.color, 7);
    return {
      id: uniqueId(str(w.id, 80) || ref(`world-${slug(wname)}`), used),
      name: wname,
      genre: str(w.genre, 40),
      blurb: str(w.blurb, 300),
      color: isColor(color) ? color : '#b48cff',
      theme,
      terrainNames: tn,
    };
  });
  // Characters may reference a pack world by its plain name/slug as a convenience.
  const resolveWorld = (v: unknown): WorldId => {
    const s = str(v, 80);
    if (!s) return worlds[0]?.id ?? 'emberhold';
    const byId = worlds.find((w) => w.id === s || w.id === ref(s) || w.id === ref(`world-${slug(s)}`) || w.name.toLowerCase() === s.toLowerCase());
    return byId ? byId.id : s;
  };
  const skill = (v: unknown): SkillId => (str(v, 20) in SKILLS ? (str(v, 20) as SkillId) : 'nimble');

  const heroes: HeroDef[] = arr('heroes').map((h) => {
    const hname = str(h.name, 30, 'Hero') || 'Hero';
    return {
      id: uniqueId(str(h.id, 80) || ref(slug(hname)), used),
      name: hname,
      title: str(h.title, 40),
      world: resolveWorld(h.world),
      classId: str(h.classId, 20, 'blademaster'),
      weaponId: str(h.weaponId, 20, 'ironSword'),
      skill: skill(h.skill),
      statMods: mods(h.statMods, -10, 15, STAT_KEYS) as Partial<Stats>,
      growthMods: mods(h.growthMods, -50, 50, STAT_KEYS.slice(0, 7)) as Partial<Growths>,
      glyph: (str(h.glyph, 3) || glyphOf(hname)).toUpperCase(),
      bio: str(h.bio, 400),
      portrait: portrait(h.portrait),
    };
  });

  const enemies: PackEnemy[] = arr('enemies').map((e) => {
    const ename = str(e.name, 30, 'Enemy') || 'Enemy';
    const sk = str(e.skill, 20);
    return {
      id: uniqueId(str(e.id, 80) || ref(`enemy-${slug(ename)}`), used),
      name: ename,
      world: resolveWorld(e.world),
      classId: str(e.classId, 20, 'brawler'),
      weaponId: str(e.weaponId, 20, 'ironAxe'),
      ...(sk in SKILLS ? { skill: sk as SkillId } : {}),
      portrait: portrait(e.portrait),
    };
  });

  const bosses: BossDef[] = arr('bosses').map((b) => {
    const bname = str(b.name, 30, 'Warlord') || 'Warlord';
    return {
      id: uniqueId(str(b.id, 80) || ref(`boss-${slug(bname)}`), used),
      name: bname,
      title: str(b.title, 40),
      world: resolveWorld(b.world),
      classId: str(b.classId, 20, 'knight'),
      weaponId: str(b.weaponId, 20, 'silverLance'),
      skill: skill(b.skill),
      statMods: mods(b.statMods, -10, 30, STAT_KEYS) as Partial<Stats>,
      glyph: (str(b.glyph, 3) || glyphOf(bname)).toUpperCase(),
      quote: str(b.quote, 200),
      portrait: portrait(b.portrait),
    };
  });

  return {
    format: PACK_FORMAT,
    id: packId,
    name,
    author: str(r.author, 40),
    description: str(r.description, 300),
    enabled: r.enabled !== false,
    hideBuiltinHeroes: r.hideBuiltinHeroes === true,
    hideBuiltinWorlds: r.hideBuiltinWorlds === true,
    worlds,
    heroes,
    enemies,
    bosses,
  };
}

export function emptyPack(name: string, existingIds: string[]): ContentPack {
  return normalizePack({ name, enabled: true }, existingIds);
}

// ───────────────────────── Validation ─────────────────────────

export interface PackIssues {
  errors: string[];
  warnings: string[];
}

/** Check a pack against the classes/weapons/worlds the engine knows about. */
export function validatePack(pack: ContentPack, allPacks: ContentPack[] = []): PackIssues {
  const errors: string[] = [];
  const warnings: string[] = [];
  const worldIds = new Set(knownWorlds([...allPacks.filter((p) => p.id !== pack.id), pack]).map((w) => w.id));

  const checkChar = (kind: string, c: { name: string; classId: string; weaponId: string; world: string }) => {
    const label = `${kind} “${c.name}”`;
    const cls = CLASSES[c.classId];
    const w = WEAPONS[c.weaponId];
    if (!cls) errors.push(`${label}: unknown class “${c.classId}”.`);
    if (!w) errors.push(`${label}: unknown weapon “${c.weaponId}”.`);
    if (cls && w && !cls.weapons.includes(w.type)) errors.push(`${label}: a ${cls.name} can't use ${w.name} (${w.type}).`);
    if (!worldIds.has(c.world)) errors.push(`${label}: unknown world “${c.world}”.`);
  };
  pack.heroes.forEach((h) => checkChar('Hero', h));
  pack.enemies.forEach((e) => checkChar('Enemy', e));
  pack.bosses.forEach((b) => checkChar('Warlord', b));

  for (const w of pack.worlds) {
    if (!pack.enemies.some((e) => e.world === w.id) && !allPacks.some((p) => p.enemies.some((e) => e.world === w.id))) {
      warnings.push(`World “${w.name}” has no enemy types yet, so battles there use Rift enemies.`);
    }
    if (!pack.bosses.some((b) => b.world === w.id)) {
      warnings.push(`World “${w.name}” has no warlord, so elite fights there borrow one from another world.`);
    }
  }
  if (pack.hideBuiltinHeroes && pack.heroes.length < 3) {
    errors.push('“Hide built-in heroes” needs at least 3 heroes in the pack (a run starts with 3).');
  }
  if (pack.hideBuiltinWorlds && !pack.worlds.length) {
    warnings.push('“Only my worlds” has no effect until the pack has at least one world.');
  }
  return { errors, warnings };
}

// ───────────────────────── Storage ─────────────────────────

const PACKS_KEY = 'rwe.packs.v1';

export function loadPacks(): ContentPack[] {
  try {
    const raw = localStorage.getItem(PACKS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const ids: string[] = [];
    return list.map((p) => {
      const n = normalizePack(p, ids);
      ids.push(n.id);
      return n;
    });
  } catch {
    return [];
  }
}

/** Returns false if the browser refused (usually storage full from big images). */
export function savePacks(packs: ContentPack[]): boolean {
  try {
    localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
    return true;
  } catch {
    return false;
  }
}

/** Packs whose validation errors would break play are skipped when applying. */
export function playablePacks(packs: ContentPack[]): ContentPack[] {
  return packs.filter((p) => p.enabled && validatePack(p, packs).errors.length === 0);
}
