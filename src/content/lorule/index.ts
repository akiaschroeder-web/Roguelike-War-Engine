import { ART_ALIASES, ART_IDS, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as LB_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { RACES, TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export const QUEST_ITEMS = LB_QUEST_ITEMS;
export { LB_ENEMY_CASTS, LB_SPECIAL } from './abilities';
export { LORULE_PREFERRED_ART, MERGED_ART } from './art';
export { LB_SPOILS, PAIRED_LB_REGIONS, ROUTE_BOSSES as LB_ROUTE_BOSSES, YUGA_FUSION } from './enemies';
export { NICE_ITEMS, SAGE_PAINTING } from './items';
export { HYRULE_ROUTE, LB_FEATURES, LORULE_FINALE, LORULE_HUB, LORULE_ROUTE, NEEDS_CROSSING, SAGE_DUNGEONS, SAGE_OF } from './regions';
export { KINGDOM, SAGES } from './units';

// The Legend of Zelda: A Link Between Worlds — Hyrule and Lorule. Ravio's rentals, wall merging, Yuga's painting
// magic, the Seven Sages, the Maiamai and the Nice tools (the rules are in engine/lorule.ts and loruleRun.ts).
export const LINK_BETWEEN_WORLDS: ContentPack = {
  id: 'lorule',
  name: 'The Legend of Zelda: A Link Between Worlds',
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
  bossAsTemplate: { yugaBoss: 'yuga' },
  events: EVENTS,
};
