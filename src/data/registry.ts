// The active content, indexed for fast lookup. The engine and UI read game
// data only through this module, so adding content packs is a matter of
// installing them here.

import { OCARINA } from '../content/ocarina';
import type { ContentPack } from '../content/types';
import type {
  AccessoryDef, BossDef, ClassDef, CommanderDef, EnemyArchetype, PermanentItemDef, RaceDef, SkillDef, UnitTemplate, WeaponDef, WorldDef, WorldId,
} from '../engine/types';

export const RACES: Record<string, RaceDef> = {};
export const CLASSES: Record<string, ClassDef> = {};
export const WEAPONS: Record<string, WeaponDef> = {};
export const ACCESSORIES: Record<string, AccessoryDef> = {};
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

const index = <T extends { id: string }>(target: Record<string, T>, list: T[]) => {
  for (const x of list) target[x.id] = x;
};

export function installPack(p: ContentPack): void {
  PACKS.push(p);
  index(RACES, p.races);
  index(CLASSES, p.classes);
  index(WEAPONS, p.weapons);
  index(ACCESSORIES, p.accessories);
  index(PERMANENT_ITEMS, p.permanentItems);
  index(SKILLS, p.skills);
  index(WORLDS, p.regions);
  for (const r of p.regions) if (!REGION_IDS.includes(r.id)) REGION_IDS.push(r.id);
  index(TEMPLATES, p.templates);
  TEMPLATE_LIST.push(...p.templates);
  index(ENEMIES, p.enemies);
  for (const [k, v] of Object.entries(p.rosters)) (ROSTERS[k] ??= []).push(...v);
  index(BOSSES, p.bosses);
  for (const [k, v] of Object.entries(p.regionBosses)) (REGION_BOSSES[k] ??= []).push(...v);
  COMMANDERS.push(...p.commanders);
  for (const id of p.artIds) ART_IDS.add(id);
  Object.assign(ART_ALIASES, p.artAliases);
  Object.assign(ART_VARIANTS, p.artVariants ?? {});
}

installPack(OCARINA);

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
export function artFor(id: string | undefined, seed = ''): string | null {
  if (!id) return null;
  const variants = ART_VARIANTS[id]?.filter((v) => ART_IDS.has(v));
  if (variants?.length) {
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return variants[h % variants.length];
  }
  if (ART_IDS.has(id)) return id;
  const alias = ART_ALIASES[id];
  return alias && ART_IDS.has(alias) ? alias : null;
}
