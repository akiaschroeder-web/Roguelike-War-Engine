import { ART_ALIASES, ART_IDS, ART_VARIANTS } from './art';
import { CLASSES } from './classes';
import { ABILITIES } from './magic';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { COMMANDERS } from './commanders';
import { EVENTS } from './events';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { GEAR, ITEMS, PERMANENT_ITEMS, SKILLS } from './items';
import { RACES } from './races';
import { REGIONS } from './regions';
import { TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export const OCARINA: ContentPack = {
  id: 'ocarina',
  name: 'Ocarina of Time',
  races: RACES,
  classes: CLASSES,
  weapons: WEAPONS,
  gear: GEAR,
  items: ITEMS,
  abilities: ABILITIES,
  factions: FACTIONS,
  supportPairs: [
    ['link', 'zelda'], ['link', 'malon'], ['link', 'saria'], ['link', 'navi'], ['link', 'darunia'], ['link', 'ruto'],
    ['youngLink', 'saria'], ['youngLink', 'malon'], ['youngLink', 'navi'], ['youngLink', 'mido'],
    ['zelda', 'impa'], ['sheik', 'impa'], ['ruto', 'kingZora'], ['malon', 'talon'], ['darunia', 'biggoron'],
    ['biggoron', 'medigoron'], ['koume', 'kotake'], ['ganondorf', 'koume'], ['ganondorf', 'kotake'], ['nabooru', 'ganondorf'],
    ['saria', 'dekuTree'], ['navi', 'dekuTree'], ['rauru', 'zelda'],
  ],
  monsterChance: MONSTER_CHANCE,
  permanentItems: PERMANENT_ITEMS,
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
  events: EVENTS,
  bossAsTemplate: { ganondorfBoss: 'ganondorf', phantomGanonMounted: 'phantomGanon' },
  exclusivePairs: [
    ['link', 'youngLink'], ['zelda', 'sheik'], ['ganondorf', 'ganon'], ['nabooru', 'ironKnuckleNabooru'],
    ['twinrova', 'koume'], ['twinrova', 'kotake'],
  ],
};
