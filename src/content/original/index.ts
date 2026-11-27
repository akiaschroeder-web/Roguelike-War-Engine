import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS, SPOILS as OH_SPOILS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as OH_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import { Z2_ABILITIES, Z2_SKILLS } from './z2abilities';
import { Z2_GEAR, Z2_ITEMS, Z2_QUEST_ITEMS, Z2_WEAPONS } from './z2gear';
import { Z2_COMMANDERS, Z2_EVENTS, Z2_REGIONS } from './z2regions';
import { Z2_BOSS_AS_TEMPLATE, Z2_BOSSES, Z2_CLASSES, Z2_ENEMIES, Z2_REGION_BOSSES, Z2_ROSTERS, Z2_SPOILS, Z2_TEMPLATES } from './z2units';
import type { ContentPack } from '../types';

/** Quest items: the Triforce of Wisdom's fragments, and Zelda II's Palace Crystals, Trophy and Lost Mirror. */
export const QUEST_ITEMS = [...OH_QUEST_ITEMS, ...Z2_QUEST_ITEMS];
export { LEVEL_BOSSES, SECOND_QUEST_BOSSES, GLEEOK, GLEEOK_STAND_IN } from './enemies';
/** Monster spoils dropped on defeat (both games). */
export const SPOILS: Record<string, string> = { ...OH_SPOILS, ...Z2_SPOILS };
export { LEVELS } from './regions';
export { BEAM_SWORDS } from './weapons';
export { GREAT_PALACE, GREAT_PALACE_SHADOW, PALACES, PALACE_BOSSES } from './z2units';
export { Z2_SPELLS, Z2_TECHNIQUES } from './z2abilities';
export { Z2_FEATURES, Z2_REGION_IDS } from './z2regions';

// The Legend of Zelda (1986): the first Hyrule and its nine Underworld Levels; then
// Zelda II: The Adventure of Link (1987), its palaces and the Sleeping Princess (z2*.ts).
export const ORIGINAL_HYRULE: ContentPack = {
  id: 'original',
  name: 'The Legend of Zelda',
  races: [],
  classes: [...CLASSES, ...Z2_CLASSES],
  weapons: [...WEAPONS, ...Z2_WEAPONS],
  gear: [...GEAR, ...Z2_GEAR],
  items: [...ITEMS, ...Z2_ITEMS],
  abilities: [...ABILITIES, ...Z2_ABILITIES],
  factions: FACTIONS,
  supportPairs: [],
  monsterChance: MONSTER_CHANCE,
  permanentItems: [],
  skills: [...SKILLS, ...Z2_SKILLS],
  regions: [...REGIONS, ...Z2_REGIONS],
  templates: [...TEMPLATES, ...Z2_TEMPLATES],
  enemies: [...ENEMIES, ...Z2_ENEMIES],
  rosters: { ...ROSTERS, ...Z2_ROSTERS },
  bosses: [...BOSSES, ...Z2_BOSSES],
  regionBosses: { ...REGION_BOSSES, ...Z2_REGION_BOSSES },
  commanders: [...COMMANDERS, ...Z2_COMMANDERS],
  artIds: [],
  artAliases: ART_ALIASES,
  artVariants: ART_VARIANTS,
  bossAsTemplate: { ganonBoss: 'ganonHyrule', dodongoBoss: 'dodongo', ...Z2_BOSS_AS_TEMPLATE },
  events: [...EVENTS, ...Z2_EVENTS],
};
