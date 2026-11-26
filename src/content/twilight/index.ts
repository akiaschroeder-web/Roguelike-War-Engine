import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './magic';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS, SPOILS as TP_SPOILS } from './enemies';
import { EVENTS } from './events';
import { EXTRA_ENEMIES, EXTRA_GEAR, EXTRA_ITEMS, EXTRA_ROSTERS, EXTRA_SKILLS, EXTRA_SPOILS, EXTRA_TEMPLATES, EXTRA_WEAPONS } from './extras';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR, ITEMS, SKILLS } from './items';
import { RACES } from './races';
import { REGIONS } from './regions';
import { TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import { SUPPORT_PAIRS } from './supports';
import type { ContentPack } from '../types';

export { QUEST_ITEMS } from './items';
export { HIDDEN_SKILLS } from './magic';
export { TWILIT_PROVINCES } from './regions';
export const SPOILS: Record<string, string> = { ...TP_SPOILS, ...EXTRA_SPOILS };

const rosters: Record<string, string[]> = { ...ROSTERS };
for (const [k, v] of Object.entries(EXTRA_ROSTERS)) rosters[k] = [...(rosters[k] ?? []), ...v];

export const TWILIGHT_PRINCESS: ContentPack = {
  id: 'twilight',
  name: 'Twilight Princess',
  races: RACES,
  classes: CLASSES,
  weapons: [...WEAPONS, ...EXTRA_WEAPONS],
  gear: [...GEAR, ...EXTRA_GEAR],
  items: [...ITEMS, ...EXTRA_ITEMS],
  abilities: ABILITIES,
  factions: FACTIONS,
  supportPairs: SUPPORT_PAIRS.filter((p) => p.max === 'S').map((p) => [p.a, p.b] as [string, string]),
  monsterChance: MONSTER_CHANCE,
  permanentItems: [],
  skills: [...SKILLS, ...EXTRA_SKILLS],
  regions: REGIONS,
  templates: [...TEMPLATES, ...EXTRA_TEMPLATES],
  enemies: [...ENEMIES, ...EXTRA_ENEMIES],
  rosters,
  bosses: BOSSES,
  regionBosses: REGION_BOSSES,
  commanders: COMMANDERS,
  artIds: [],
  artAliases: ART_ALIASES,
  artVariants: ART_VARIANTS,
  bossAsTemplate: { bulblinRaidLeader: 'bulblin', kingBulblinBoss: 'kingBulblin', zantBoss: 'zant', ganondorfTPBoss: 'ganondorfTP', darkBeastGanonBoss: 'darkBeastGanon' },
  exclusivePairs: [['darbus', 'fyrus'], ['yeta', 'blizzeta'], ['heroOfTwilight', 'wolfLink'], ['zeldaTP', 'possessedZelda']],
  events: EVENTS,
};
