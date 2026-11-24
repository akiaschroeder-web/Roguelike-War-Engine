import type { FactionDef } from '../../engine/types';

// Non-monster armies you can fight. This isn't a canon story: anyone can end up
// on the other side of the battlefield in a war across Hyrule.
export const FACTIONS: FactionDef[] = [
  {
    id: 'hyruleGuard', name: 'Hyrulean Army', desc: 'The royal army has orders to stop anyone marching under a foreign banner.',
    units: ['hyruleSoldier', 'hyruleSoldier', 'hyruleArcher', 'hyruleKnight', 'hyruleCavalry'],
    leaders: ['impa', 'ingo', 'kingZora'],
    regions: { hyruleField: 5, hyruleCastle: 6, kakarikoGraveyard: 2, lostWoods: 1 },
  },
  {
    id: 'gerudo', name: 'Gerudo Raiders', desc: 'Desert thieves after your Rupees, and your weapons, and your boots.',
    units: ['gerudoGuard', 'gerudoGuard', 'gerudoThief', 'gerudoThief'],
    leaders: ['nabooru', 'koume', 'kotake'],
    regions: { gerudoDesert: 7, hyruleField: 3, hyruleCastle: 1 },
  },
  {
    id: 'gorons', name: 'Goron Brawlers', desc: 'A Goron challenge! They just want to see who rolls harder.',
    units: ['goronWarrior', 'goronWarrior', 'goronRoller'],
    leaders: ['darunia', 'medigoron', 'biggoron'],
    regions: { deathMountain: 7, hyruleField: 1, kakarikoGraveyard: 1 },
  },
  {
    id: 'zora', name: 'Zora Royal Guard', desc: 'The Zora guard their waters jealously, and you are standing in them.',
    units: ['zoraWarrior', 'zoraWarrior', 'zoraMystic'],
    leaders: ['ruto', 'kingZora'],
    regions: { zorasDomain: 7, hyruleField: 1, lostWoods: 1 },
  },
  {
    id: 'kokiri', name: 'Kokiri Pranksters', desc: 'The children of the forest and their Deku friends think this is a game. It hurts anyway.',
    units: ['kokiriScout', 'kokiriSlingshooter', 'kokiriSlingshooter', 'dekuScrub', 'businessScrub'],
    leaders: ['mido', 'saria'],
    regions: { kokiriForest: 7, lostWoods: 5 },
  },
  {
    id: 'sheikah', name: 'Sheikah Shadows', desc: 'Shadow warriors testing your army, for reasons they will not share.',
    units: ['sheikahWarrior', 'sheikahWarrior', 'hyruleArcher'],
    leaders: ['impa', 'sheik'],
    regions: { kakarikoGraveyard: 6, hyruleCastle: 2, lostWoods: 1 },
  },
  {
    id: 'rivals', name: 'Rival Heroes', desc: 'Another band of heroes is fighting the same war, and they want your spoils.',
    units: [],
    leaders: [],
    regions: {},
    rivals: true,
  },
];

/** Chance (%) a regular battle in each region is against monsters rather than an army. */
export const MONSTER_CHANCE: Record<string, number> = {
  hyruleField: 40, kokiriForest: 45, lostWoods: 55, deathMountain: 50, zorasDomain: 45,
  gerudoDesert: 35, kakarikoGraveyard: 55, hyruleCastle: 40,
};
