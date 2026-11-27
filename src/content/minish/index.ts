import { ART_ALIASES, ART_IDS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as MC_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { RACES, TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export const QUEST_ITEMS = MC_QUEST_ITEMS;
export { DOJO_TECHNIQUES, MN_SPECIAL } from './abilities';
export { MC_SPOILS, PAIRED_MC_REGIONS, ROUTE_BOSSES as MC_ROUTE_BOSSES, VAATI_FORMS } from './enemies';
export { ELEMENTS, KINSTONES, PICOLYTES } from './items';
export { ELEMENT_OF, MC_FEATURES, MELARI_FORGE, MICRO_DUNGEON_TERRAIN, MINISH_ROUTE } from './regions';
export { MICRO_DUNGEON_REGIONS } from './units';

const VAATI = ['vaatiMinish', 'vaatiHylian', 'vaatiReborn', 'vaatiTransfigured', 'vaatisWrath'];

// The Legend of Zelda: The Minish Cap — Hyrule in the Era of the Minish. Link, Ezlo and the Picori, the
// Four Sword and its Elements, Kinstone fusion, the Blade Brothers, Vaati's three demonic forms, and the
// base game's Micro units (engine/micro.ts; the campaign's rules are in engine/minish.ts and minishRun.ts).
export const MINISH_CAP: ContentPack = {
  id: 'minish',
  name: 'The Legend of Zelda: The Minish Cap',
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
  exclusivePairs: [['heroOfMinish', 'microLink'], ['ezloMinish', 'ezloCap'], ...VAATI.flatMap((a, i) => VAATI.slice(i + 1).map((b) => [a, b] as [string, string]))],
  events: EVENTS,
};
