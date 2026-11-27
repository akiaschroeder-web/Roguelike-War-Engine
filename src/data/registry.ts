// The active content, indexed for fast lookup. The engine and UI read game
// data only through this module, so adding content packs is a matter of
// installing them here.

import { OCARINA } from '../content/ocarina';
import { MAJORA, QUEST_ITEMS as MM_QUEST } from '../content/majora';
import { WIND_WAKER, QUEST_ITEMS as WW_QUEST } from '../content/windwaker';
import { TWILIGHT_PRINCESS, QUEST_ITEMS as TP_QUEST } from '../content/twilight';
import { SKYWARD_SWORD, QUEST_ITEMS as SS_QUEST } from '../content/skyward';
import { ERA_OF_THE_WILD, QUEST_ITEMS as WILD_QUEST } from '../content/wild';
import { ORIGINAL_HYRULE, QUEST_ITEMS as OH_QUEST } from '../content/original';
import { ERA_OF_LEGEND, QUEST_ITEMS as LG_QUEST } from '../content/legend';
import { PHANTOM_HOURGLASS, QUEST_ITEMS as PH_QUEST } from '../content/phantom';
import { SPIRIT_TRACKS, QUEST_ITEMS as ST_QUEST } from '../content/spirit';
import { SPECIAL_TERRAIN } from '../engine/rules';
import type { ContentPack } from '../content/types';
import type {
  AbilityDef, FactionDef, GearDef, ItemDef, BossDef, ClassDef, CommanderDef, EnemyArchetype, PermanentItemDef, RaceDef, SkillDef, UnitTemplate, WeaponDef, WorldDef, WorldId, EventDef, BaseTerrain, Terrain } from '../engine/types';

export const RACES: Record<string, RaceDef> = {};
export const CLASSES: Record<string, ClassDef> = {};
export const WEAPONS: Record<string, WeaponDef> = {};
export const GEAR: Record<string, GearDef> = {};
export const ITEMS: Record<string, ItemDef> = {};
export const ABILITIES: Record<string, AbilityDef> = {};
export const FACTIONS: Record<string, FactionDef> = {};
export const MONSTER_CHANCE: Record<string, number> = {};
export const SUPPORT_S_PAIRS: [string, string][] = [];
export const PERMANENT_ITEMS: Record<string, PermanentItemDef> = {};
export const SKILLS: Record<string, SkillDef> = {};
export const WORLDS: Record<string, WorldDef> = {};
export const REGION_IDS: WorldId[] = [];
export const TEMPLATES: Record<string, UnitTemplate> = {};
export const TEMPLATE_LIST: UnitTemplate[] = [];
export const ENEMIES: Record<string, EnemyArchetype> = {};
export const ROSTERS: Record<string, string[]> = {};
export const BOSSES: Record<string, BossDef> = {};
export const REGION_BOSSES: Record<string, string[]> = {};
export const COMMANDERS: (CommanderDef & { pendingGear?: string[] })[] = [];
export const PACKS: ContentPack[] = [];
export const ART_IDS = new Set<string>();
export const ART_ALIASES: Record<string, string> = {};
export const ART_VARIANTS: Record<string, string[]> = {};
/** Boss id -> the template that boss is a form of. */
export const BOSS_AS_TEMPLATE: Record<string, string> = {};
export const EVENTS: Record<string, EventDef> = {};

const index = <T extends { id: string }>(target: Record<string, T>, list: T[]) => {
  for (const x of list) target[x.id] = x;
};

export function installPack(p: ContentPack): void {
  PACKS.push(p);
  index(RACES, p.races);
  index(CLASSES, p.classes);
  index(WEAPONS, p.weapons);
  index(GEAR, p.gear);
  index(ITEMS, p.items);
  index(ABILITIES, p.abilities);
  index(FACTIONS, p.factions);
  index(EVENTS, p.events ?? []);
  Object.assign(MONSTER_CHANCE, p.monsterChance);
  SUPPORT_S_PAIRS.push(...(p.supportPairs ?? []));
  index(PERMANENT_ITEMS, p.permanentItems);
  index(SKILLS, p.skills);
  index(WORLDS, p.regions);
  for (const r of p.regions) if (!REGION_IDS.includes(r.id)) REGION_IDS.push(r.id);
  // A later pack can give an existing unit a full template (Skyward Sword's Beamos): it replaces the old one.
  for (const t of p.templates) {
    const i = TEMPLATE_LIST.findIndex((x) => x.id === t.id);
    if (i >= 0) TEMPLATE_LIST.splice(i, 1);
  }
  index(TEMPLATES, p.templates);
  TEMPLATE_LIST.push(...p.templates);
  index(ENEMIES, p.enemies);
  for (const [k, v] of Object.entries(p.rosters)) (ROSTERS[k] ??= []).push(...v);
  index(BOSSES, p.bosses);
  for (const [k, v] of Object.entries(p.regionBosses)) (REGION_BOSSES[k] ??= []).push(...v);
  COMMANDERS.push(...p.commanders);
  for (const id of p.artIds) ART_IDS.add(id);
  Object.assign(ART_ALIASES, p.artAliases);
  // Variant lists from several packs are merged: later packs append their alternates.
  for (const [k, v] of Object.entries(p.artVariants ?? {})) {
    const cur = (ART_VARIANTS[k] ??= []);
    for (const id of v) if (!cur.includes(id)) cur.push(id);
  }
  Object.assign(BOSS_AS_TEMPLATE, p.bossAsTemplate ?? {});

  // Every unit is recruitable: bosses, villains and enemy creatures become templates too.
  for (const b of p.bosses) {
    if (TEMPLATES[b.id] || BOSS_AS_TEMPLATE[b.id]) continue;
    addTemplate({
      id: b.id, name: b.name, title: b.title, race: b.race, classId: b.classId, size: b.size ?? 1, stats: { ...b.stats },
      weapons: [...b.weapons], skill: b.skill, abilities: b.abilities, glyph: b.glyph, home: b.home, rare: true,
      bio: `${b.title}. ${b.quote}`,
    });
  }
  for (const e of p.enemies) {
    if (TEMPLATES[e.id]) continue;
    const cls = CLASSES[e.classId];
    if (!cls) continue;
    addTemplate({
      id: e.id, name: e.name, title: 'Recruit', race: e.race, classId: e.classId, size: e.size ?? 1,
      stats: { ...cls.base, ...(e.stats ?? {}) }, weapons: [...e.weapons], skill: e.skill,
      glyph: e.glyph ?? e.name.slice(0, 2).toUpperCase(), home: REGION_IDS.find((r) => p.rosters[r]?.includes(e.id)) ?? REGION_IDS[0],
      generic: true, monster: true, bio: `A ${e.name} that has sworn itself to your banner.`,
    });
  }
  for (const [a, b] of p.exclusivePairs ?? []) {
    for (const [x, y] of [[a, b], [b, a]]) {
      const t = TEMPLATES[x];
      if (t && !t.exclusiveWith?.includes(y)) t.exclusiveWith = [...(t.exclusiveWith ?? []), y];
    }
  }
}

function addTemplate(t: UnitTemplate) {
  TEMPLATES[t.id] = t;
  TEMPLATE_LIST.push(t);
}

installPack(OCARINA);
installPack(MAJORA);
installPack(WIND_WAKER);
installPack(TWILIGHT_PRINCESS);
installPack(SKYWARD_SWORD);
installPack(ERA_OF_THE_WILD);
installPack(ORIGINAL_HYRULE);
installPack(ERA_OF_LEGEND);
installPack(PHANTOM_HOURGLASS);
installPack(SPIRIT_TRACKS);
// Phantom Ganon keeps his entry; his Wind Waker sword joins his drops.
if (BOSSES.phantomGanon) BOSSES.phantomGanon.drops = [...(BOSSES.phantomGanon.drops ?? []), 'phantomGanonsSword'];

/** Quest items (shared quest inventory). */
export const QUEST_ITEMS: Record<string, { id: string; name: string; desc: string }> = Object.fromEntries([...MM_QUEST, ...WW_QUEST, ...TP_QUEST, ...SS_QUEST, ...WILD_QUEST, ...OH_QUEST, ...LG_QUEST, ...PH_QUEST, ...ST_QUEST].map((q) => [q.id, q]));

// ───────── Safe lookups ─────────

export function worldDef(id: WorldId): WorldDef {
  return WORLDS[id] ?? WORLDS[REGION_IDS[0]];
}

export function rosterFor(world: WorldId): EnemyArchetype[] {
  const ids = ROSTERS[world]?.length ? ROSTERS[world] : ROSTERS[REGION_IDS[0]];
  return ids.map((id) => ENEMIES[id]).filter(Boolean);
}

export function bossPool(world: WorldId): BossDef[] {
  const ids = REGION_BOSSES[world]?.length ? REGION_BOSSES[world] : Object.keys(BOSSES);
  return ids.map((id) => BOSSES[id]).filter(Boolean);
}

export function raceOf(id: string): RaceDef {
  return RACES[id] ?? { id, name: id, desc: '' };
}

export function skillDef(id: string): SkillDef {
  return SKILLS[id] ?? { id, name: id, desc: '', implemented: false };
}

/**
 * The art id a unit should display, or null if no image exists yet.
 * `seed` (e.g. the unit's uid) picks a stable variant for generic units.
 */
export function artFor(id: string | undefined, seed = '', pick?: string): string | null {
  if (!id) return null;
  const variants = ART_VARIANTS[id]?.filter((v) => ART_IDS.has(v));
  if (variants?.length) {
    if (pick && variants.includes(pick)) return pick; // the player chose this look
    if (!seed || variants.length === 1) return variants[0];
    // FNV-1a with a final mix, so neighbouring uids don't simply alternate.
    let h = 0x811c9dc5;
    for (const c of `${id}:${seed}`) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0; h = Math.imul(h, 0x45d9f3b) >>> 0; h = (h ^ (h >>> 16)) >>> 0;
    // The original art turns up half the time; the alternates share the rest.
    const r = h % 100;
    if (r < 50) return variants[0];
    return variants[1 + (Math.floor(h / 100) % (variants.length - 1))];
  }
  if (ART_IDS.has(id)) return id;
  const alias = ART_ALIASES[id];
  return alias && ART_IDS.has(alias) ? alias : null;
}

/**
 * Art that follows a unit's equipment (the template's artByGear): the first entry whose ids include
 * the equipped weapon or a worn gear piece. Null when none applies (the ordinary art is used).
 */
export function gearArt(u: { templateId?: string; weapons?: string[]; gear?: Partial<Record<string, string>> }): string | null {
  const t = u.templateId ? TEMPLATES[u.templateId] : undefined;
  if (!t?.artByGear) return null;
  const worn = new Set(Object.values(u.gear ?? {}).filter(Boolean));
  const w = u.weapons?.[0];
  for (const e of t.artByGear) if (e.ids.some((id) => id === w || worn.has(id))) return ART_IDS.has(e.art) ? e.art : null;
  return null;
}

/** The art a unit shows: a temporary battle form first, then equipment-dependent art (it wins over the
 *  random or chosen variant), then its variant or ordinary art. */
export function unitArt(u: { uid: string; templateId?: string; bossId?: string; artId?: string; artPick?: string; artOverride?: string; weapons?: string[]; gear?: Partial<Record<string, string>> }): string | null {
  if (u.artOverride) { const o = artFor(u.artOverride); if (o) return o; }
  return gearArt(u) ?? artFor(u.bossId ?? u.templateId ?? u.artId, u.uid, u.artPick);
}

/** Name and colour of a terrain type in a region (special terrain shares one look). */
export function terrainLook(world: string, t: Terrain): { name: string; color: string } {
  const w = worldDef(world);
  if (t in SPECIAL_TERRAIN) return SPECIAL_TERRAIN[t as keyof typeof SPECIAL_TERRAIN];
  return { name: w.terrainNames[t as BaseTerrain], color: w.terrainColors[t as BaseTerrain] };
}
