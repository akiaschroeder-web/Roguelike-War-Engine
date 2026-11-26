import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS } from './items';
import { RACES } from './races';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export { QUEST_ITEMS, MATERIALS, INSECTS_BY_REGION } from './items';
export { SPOILS, MATERIAL_DROPS } from './enemies';
export { RECIPES, GENERIC_PER_MATERIAL, type Recipe } from './crafting';
export { SKYWARD_SWORDS } from './abilities';
export { SKY_REGIONS } from './regions';

export const SKYWARD_SWORD: ContentPack = {
  id: 'skyward',
  name: 'Skyward Sword',
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
  bossAsTemplate: { grooseRival: 'groose', ghirahimBoss: 'ghirahim', demiseBoss: 'demise' },
  exclusivePairs: [['ghirahim', 'ghirahimTrue'], ['imprisoned', 'imprisonedArmed'], ['imprisoned', 'imprisonedFlying'], ['imprisonedArmed', 'imprisonedFlying']],
  events: EVENTS,
};
