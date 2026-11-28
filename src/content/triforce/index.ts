import { ART_ALIASES, ART_IDS, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSSES, ENEMIES, REGION_BOSSES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as TF_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { RACES, TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export const QUEST_ITEMS = TF_QUEST_ITEMS;
export { TF_ENEMY_CASTS, TF_SPECIAL, TOTEM_CP } from './abilities';
export { CURSED_STYLA_ART, TOTEM_ART_2, TOTEM_ART_3, TRIFORCE_PREFERRED_ART } from './art';
export { ALT_LOADOUTS } from './commanders';
export { BOSS_COPIES, ROUTE_BOSSES as TF_ROUTE_BOSSES } from './enemies';
export { OUTFITS } from './gear';
export { MATERIALS, RARE_MATERIALS, RECIPES, type Recipe } from './items';
export { REGION_MATERIAL, SANDY_TF, TF_FEATURES, TF_ROUTE } from './regions';
export { HYTOPIANS, TRI_HEROES } from './units';

// The Legend of Zelda: Tri Force Heroes — Hytopia and the Drablands. Totems, outfits, Madame Couture's Boutique and
// Lady Maud's Fashion Curse (the rules are in engine/triforce.ts and triforceRun.ts).
export const TRI_FORCE_HEROES: ContentPack = {
  id: 'triforce',
  name: 'The Legend of Zelda: Tri Force Heroes',
  races: RACES,
  classes: CLASSES,
  weapons: WEAPONS,
  gear: GEAR,
  items: ITEMS,
  abilities: ABILITIES,
  factions: [],
  supportPairs: [],
  monsterChance: { woodlandsTF: 95, riversideTF: 95, volcanoTF: 95, iceCavernTF: 95, fortressTF: 85, dunesTF: 95, ruinsTF: 95, skyRealmTF: 90, denOfTrialsTF: 100 },
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
  // Lady Maud's boss form and the Hinox Brothers (the existing Hinox with boss modifiers) recruit as those entries.
  bossAsTemplate: { ladyMaudBoss: 'ladyMaud', hinoxEldest: 'hinox', hinoxElder: 'hinox', lilHinox: 'hinox' },
  events: EVENTS,
};
