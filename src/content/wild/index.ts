import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSS_AS_TEMPLATE, BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
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

export { QUEST_ITEMS, MATERIALS, MATERIAL_BY_ID, FREE_FUSE, MEALS, FORAGE, DEVICE_ENERGY, ZONAI_DEVICES, type WildMaterial, type FuseData, type CookFamily } from './items';
export { SPOILS, MATERIAL_DROPS, TIERED } from './enemies';
export { SET_BONUSES } from './gear';
export { VEHICLES, VEHICLE_BY_ID, type VehicleDef } from './vehicles';
export { WILD_SKY, WILD_DEPTHS, WILD_CLIMATE } from './regions';
export { VEHICLE_TEMPLATES } from './units';

export const ERA_OF_THE_WILD: ContentPack = {
  id: 'wild',
  name: 'Era of the Wild',
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
  exclusivePairs: [['zeldaWild', 'lightDragon'], ['ganondorfWild', 'demonDragon'], ['calamityGanon', 'darkBeastGanonWild']],
  events: EVENTS,
};
