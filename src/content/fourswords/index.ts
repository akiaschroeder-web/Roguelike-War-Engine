import { ART_ALIASES, ART_IDS, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as FS_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { RACES, TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export const QUEST_ITEMS = FS_QUEST_ITEMS;
export { FORMATION_CP, FORMATION_NEEDS, FORMATIONS, FS_SPECIAL, RETURNING_BOSS_ABILITIES } from './abilities';
export { BIG_RETURNING, FINALE_REGION, FS_ESCORTS, FS_SPOILS, PAIRED_FS_REGIONS, ROUTE_BOSSES as FS_ROUTE_BOSSES } from './enemies';
export { FORCE_GEMS, FORCE_THRESHOLDS } from './items';
export { DARK_REGIONS, DESERT_REGIONS, FS_FEATURES, FS_GBA, FS_ROUTE } from './regions';
export { FOUR_LINKS, HYRULE_SOLDIERS, MAIDENS } from './units';
export { LEVEL2 } from './weapons';

/** Every form of Vaati is one person: the Wind Mage never shares an army with the Minish Cap's five. */
const VAATI = ['vaatiMinish', 'vaatiHylian', 'vaatiReborn', 'vaatiTransfigured', 'vaatisWrath'];

// The Legend of Zelda: Four Swords & Four Swords Adventures — the four Links, the Four Sword Sanctuary, Force Gems and
// Force Power, the Four Link formations, the Dark World, Shadow Link, Vaati the Wind Mage and Ganon (the campaign's
// rules are in engine/fourswords.ts and fourswordsRun.ts).
export const FOUR_SWORDS: ContentPack = {
  id: 'fourswords',
  name: 'The Legend of Zelda: Four Swords & Four Swords Adventures',
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
  artIds: ART_IDS,
  artAliases: ART_ALIASES,
  artVariants: ART_VARIANTS,
  exclusivePairs: VAATI.map((v) => ['vaatiWindMage', v] as [string, string]),
  events: EVENTS,
};
