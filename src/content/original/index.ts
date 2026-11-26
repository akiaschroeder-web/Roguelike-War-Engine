import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export { QUEST_ITEMS } from './items';
export { SPOILS, LEVEL_BOSSES, SECOND_QUEST_BOSSES, GLEEOK, GLEEOK_STAND_IN } from './enemies';
export { LEVELS } from './regions';
export { BEAM_SWORDS } from './weapons';

// The Legend of Zelda (1986): the first Hyrule and its nine Underworld Levels.
export const ORIGINAL_HYRULE: ContentPack = {
  id: 'original',
  name: 'The Legend of Zelda',
  races: [],
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
  bossAsTemplate: { ganonBoss: 'ganonHyrule', dodongoBoss: 'dodongo' },
  events: EVENTS,
};
