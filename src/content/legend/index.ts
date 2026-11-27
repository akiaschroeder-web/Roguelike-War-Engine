import { ART_ALIASES, ART_VARIANTS } from './art';
import { ABILITIES } from './abilities';
import { CLASSES } from './classes';
import { COMMANDERS } from './commanders';
import { BOSS_AS_TEMPLATE, BOSSES, ENEMIES, REGION_BOSSES, RETURNING_WIZZROBES, ROSTERS } from './enemies';
import { EVENTS } from './events';
import { FACTIONS, MONSTER_CHANCE } from './factions';
import { GEAR } from './gear';
import { ITEMS, QUEST_ITEMS as LG_QUEST_ITEMS } from './items';
import { REGIONS } from './regions';
import { SKILLS } from './skills';
import { RACES, TEMPLATES } from './units';
import { WEAPONS } from './weapons';
import type { ContentPack } from '../types';

export const QUEST_ITEMS = LG_QUEST_ITEMS;
export { ACHIEVEMENT_RINGS, RING_IDS } from './gear';
export { HARP_TUNES, KOHOLINT_SONGS, SEED_SHOTS } from './abilities';
export { BUNNY_ART, NIGHTMARE_FORMS } from './art';
export { PAIRED_BOSS_REGIONS, ROUTE_BOSSES, SPOILS } from './enemies';
export { SATCHELS, SEED_ITEM, SEED_KINDS, TRADING_SEQUENCES, type SeedKind } from './items';
export {
  AGES_OF_LABRYNNA, DREAM_OF_KOHOLINT, KOHOLINT, LEGEND_FEATURES, LEGEND_REGION_IDS, LIGHT_AND_DARK, ROOM_OF_RITES, SEASONAL, SEASONS_OF_HOLODRUM, TIMEWORN, WORLD_LINKED,
} from './regions';
export { ANIMAL_COMPANIONS, FORM_TEMPLATES } from './units';
export { LEGEND_BEAM_SWORDS, SIREN_INSTRUMENTS } from './weapons';

// The Legend of Zelda: Era of Legend — A Link to the Past, Link's Awakening, Oracle of Seasons
// and Oracle of Ages: one Link for all four, the Light and Dark Worlds, Koholint's dream, the
// seasons of Holodrum and the ages of Labrynna (mechanics in engine/legend.ts and legendRun.ts).
export const ERA_OF_LEGEND: ContentPack = {
  id: 'legend',
  name: 'The Legend of Zelda: Era of Legend',
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
  rosters: { ...ROSTERS, ...RETURNING_WIZZROBES },
  bosses: BOSSES,
  regionBosses: REGION_BOSSES,
  commanders: COMMANDERS,
  artIds: [],
  artAliases: ART_ALIASES,
  artVariants: ART_VARIANTS,
  bossAsTemplate: BOSS_AS_TEMPLATE,
  exclusivePairs: [['nayru', 'nayruPossessed'], ['onox', 'onoxDragon'], ['veran', 'veranFairy'], ['veran', 'veranTurtle'], ['veran', 'veranSpider'], ['veran', 'veranBee']],
  events: EVENTS,
};
