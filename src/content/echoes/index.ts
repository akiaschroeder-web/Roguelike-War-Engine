import { ART_ALIASES, ART_IDS, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS, DRADD_RIVER_ZORA } from './commanders';
import { BOSS_AS_TEMPLATE, BOSSES, ENEMIES, REGION_BOSSES, RIVER_ZORA_IDS, RIVER_ZORA_REGIONS, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as EO_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { RACES, TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';
import type { CommanderDef, EnemyArchetype } from '../../engine/types';

export const QUEST_ITEMS = EO_QUEST_ITEMS;
export { EO_ENEMY_CASTS, EO_SPECIAL } from './abilities';
export { AUTOMATONS } from './units';
export * from './echoData';
export { BOSS_AS_TEMPLATE as EO_BOSS_AS_TEMPLATE, ECHO_BOSSES, EO_SPOILS, ROUTE_BOSSES as EO_ROUTE_BOSSES, RIVER_ZORA_IDS } from './enemies';
export { SMOOTHIE_FEE, SMOOTHIE_FILLERS, SMOOTHIE_INGREDIENTS, SMOOTHIE_RECIPES } from './items';
export { DESERT_REGIONS, ECHOES_ROUTE, EO_FEATURES, STILL_WORLD_TERRAIN, TRI_FRIENDS } from './regions';

// The Legend of Zelda: Echoes of Wisdom — Hyrule and the Still World. Princess Zelda, Tri and the Tri Rod;
// the game-wide Echo system (engine/echoes.ts), Swordfighter Form, Bind and Reverse Bond, Dampé's
// Automatons, smoothies, the Rifts, and Null (the campaign's rules are in engine/echoes.ts and echoesRun.ts).
export const ECHOES_OF_WISDOM: ContentPack = {
  id: 'echoes',
  name: 'The Legend of Zelda: Echoes of Wisdom',
  races: RACES,
  classes: CLASSES,
  weapons: WEAPONS,
  gear: GEAR,
  items: ITEMS,
  abilities: ABILITIES,
  factions: FACTIONS,
  supportPairs: [],
  monsterChance: MONSTER_CHANCE,
  permanentItems: [],
  skills: SKILLS,
  regions: REGIONS,
  templates: TEMPLATES,
  enemies: ENEMIES,
  rosters: ROSTERS,
  bosses: BOSSES,
  regionBosses: REGION_BOSSES,
  commanders: COMMANDERS,
  artIds: ART_IDS,
  artAliases: ART_ALIASES,
  artVariants: ART_VARIANTS,
  bossAsTemplate: BOSS_AS_TEMPLATE,
  exclusivePairs: [['zeldaEoW', 'tekom']],
  events: EVENTS,
};

/**
 * Content from packs built in parallel (A Link Between Worlds' River Zora, docs/river-zora.md), wired in only
 * once it is installed: the River Zora join the Jabul, Faron and Wrecked Ship rosters, and Dradd leads them.
 * Called by the registry after every pack is installed.
 */
export function resolveEchoesFallbacks(enemies: Record<string, EnemyArchetype>, rosters: Record<string, string[]>, commanders: CommanderDef[], templates: Record<string, unknown>) {
  const zora = RIVER_ZORA_IDS.filter((id) => enemies[id]);
  for (const r of RIVER_ZORA_REGIONS) for (const id of zora) if (rosters[r] && !rosters[r].includes(id)) rosters[r].push(id);
  const dradd = commanders.find((c) => c.heroId === 'dradd');
  if (dradd && DRADD_RIVER_ZORA.every((id) => templates[id])) dradd.units = [...DRADD_RIVER_ZORA];
}
