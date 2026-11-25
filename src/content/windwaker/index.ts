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
export { CAPACITY, VESSEL_SLOTS_BY_SIZE } from './units';
export { SPOILS } from './enemies';

export const WIND_WAKER: ContentPack = {
  id: 'windwaker',
  name: 'The Wind Waker',
  races: RACES,
  classes: CLASSES,
  weapons: WEAPONS,
  gear: GEAR,
  items: ITEMS,
  abilities: ABILITIES,
  factions: FACTIONS,
  supportPairs: [
    ['heroOfWinds', 'tetra'], ['heroOfWinds', 'aryll'], ['tetra', 'gonzo'], ['heroOfWinds', 'kingOfRedLions'], ['kingDaphnes', 'zeldaWW'],
    ['medli', 'komali'], ['medli', 'laruto'], ['makar', 'fado'], ['orca', 'sturgeon'], ['zephos', 'cyclos'], ['ritoChieftain', 'komali'], ['heroOfWinds', 'grandma'],
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
  bossAsTemplate: { bokoblinChief: 'bokoblin', bigOctoBoss: 'bigOcto', mightyDarknutBoss: 'mightyDarknut', ganondorfWWBoss: 'ganondorfWW' },
  exclusivePairs: [],
  events: EVENTS,
};
