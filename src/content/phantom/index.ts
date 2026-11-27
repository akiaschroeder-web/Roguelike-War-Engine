import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSS_AS_TEMPLATE, BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as PH_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { RACES, TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export const QUEST_ITEMS = PH_QUEST_ITEMS;
export { HOURGLASS_COSTS } from './abilities';
export { PAIRED_PH_REGIONS, PH_SPOILS, ROUTE_BOSSES as PH_ROUTE_BOSSES } from './enemies';
export { SHIP_PART_IDS, SHIP_SETS, SHIP_SLOTS, SHIP_SLOT_NAMES, shipPartId, SPIRIT_GEM_GEAR, type ShipSlot } from './gear';
export { PH_TREASURES, SEA_CHARTS, SPIRIT_GEMS } from './items';
export {
  CHART_FOR, NORTHEASTERN_SEA, NORTHWESTERN_SEA, OCEAN_KING_TEMPLE, PH_FEATURES, PH_FINALE, PHANTOM_ROUTE, SOUTHEASTERN_SEA, SOUTHWESTERN_SEA,
} from './regions';
export { PH_CAPACITY } from './units';
export { PHANTOM_METALS } from './weapons';

// The Legend of Zelda: Phantom Hourglass — the World of the Ocean King. The Hero of Winds and
// Tetra are this pack's Link and Zelda; it builds on the Wind Waker's naval systems (steamships
// with eight part slots and nine part sets), and brings in the pending Potion Shop Lady and the
// eight Subrosians (mechanics in engine/phantom.ts and phantomRun.ts).
export const PHANTOM_HOURGLASS: ContentPack = {
  id: 'phantom',
  name: 'The Legend of Zelda: Phantom Hourglass',
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
  artIds: [],
  artAliases: ART_ALIASES,
  artVariants: ART_VARIANTS,
  bossAsTemplate: BOSS_AS_TEMPLATE,
  exclusivePairs: [['linebeck', 'bellumbeck'], ['oshus', 'oceanKing']],
  events: EVENTS,
};
