import { ART_ALIASES, ART_IDS } from './art';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { ACCESSORIES, PERMANENT_ITEMS, SKILLS } from './items';
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
  accessories: ACCESSORIES,
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
};
