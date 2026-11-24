import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './magic';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR, ITEMS, SKILLS } from './items';
import { RACES } from './races';
import { REGIONS } from './regions';
import { TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export { QUEST_ITEMS } from './items';

export const MAJORA: ContentPack = {
  id: 'majora',
  name: "Majora's Mask",
  races: RACES,
  classes: CLASSES,
  weapons: WEAPONS,
  gear: GEAR,
  items: ITEMS,
  abilities: ABILITIES,
  factions: FACTIONS,
  supportPairs: [
    ['terminaLink', 'tatl'], ['tatl', 'tael'], ['skullKid', 'tael'], ['skullKid', 'tatl'], ['kafei', 'anju'],
    ['dekuKing', 'dekuPrincess'], ['mikau', 'lulu'], ['igosDuIkana', 'ikanaServant1'], ['igosDuIkana', 'ikanaServant2'],
    ['sharp', 'flat'], ['darmani', 'goronLink'], ['mikau', 'zoraLink'], ['terminaLink', 'skullKid'],
  ],
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
  bossAsTemplate: { skullKidBoss: 'skullKid', keetaBoss: 'captainKeeta', igosBoss: 'igosDuIkana' },
  exclusivePairs: [],
  events: EVENTS,
};
