import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSS_AS_TEMPLATE, BOSSES, CHU_TEMPLATES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as ST_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { RACES, TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export const QUEST_ITEMS = ST_QUEST_ITEMS;
export { SP_SPECIAL } from './abilities';
export { PAIRED_ST_REGIONS, ROUTE_BOSSES as ST_ROUTE_BOSSES, ST_SPOILS } from './enemies';
export { TRAIN_PART_IDS, TRAIN_SETS, TRAIN_SLOTS, TRAIN_SLOT_NAMES, trainPartId, type TrainSlot } from './gear';
export { RAIL_MAPS, ST_TREASURES, TREASURE_VALUE } from './items';
export { REALM_SAGE, SPIRIT_FINALE, SPIRIT_REALMS, SPIRIT_ROUTE, SPIRIT_TOWER, ST_FEATURES } from './regions';
export { SP_CAPACITY } from './units';

// The Legend of Zelda: Spirit Tracks — New Hyrule. A new Link (the Hero of Spirits) and Zelda (whose
// spirit possesses Phantoms), Lokomo sages and their songs, railway combat with customizable trains
// and demon trains, the Tower of Spirits, Big Blin, and the six new ChuChus of docs/chuchu-expansion.md
// (mechanics in engine/spirit.ts and spiritRun.ts).
export const SPIRIT_TRACKS: ContentPack = {
  id: 'spirit',
  name: 'The Legend of Zelda: Spirit Tracks',
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
  templates: [...TEMPLATES, ...CHU_TEMPLATES],
  enemies: ENEMIES,
  rosters: ROSTERS,
  bosses: BOSSES,
  regionBosses: REGION_BOSSES,
  commanders: COMMANDERS,
  artIds: [],
  artAliases: ART_ALIASES,
  artVariants: ART_VARIANTS,
  bossAsTemplate: BOSS_AS_TEMPLATE,
  exclusivePairs: [['zeldaST', 'spiritZelda'], ['zeldaST', 'phantomZelda'], ['spiritZelda', 'phantomZelda'], ['zeldaST', 'malladusZelda'], ['malladus', 'malladusZelda']],
  events: EVENTS,
};
