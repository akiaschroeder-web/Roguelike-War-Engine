import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'agahnimsGuard', name: "Agahnim's Castle Guard", desc: 'Hyrule\'s own soldiers, bewitched by the wizard on the throne, with Wizzrobes in the ranks.',
    units: ['hyruleSoldier', 'hyruleSoldier', 'hyruleKnight', 'wizzrobe', 'darknut'], leaders: ['agahnim'], regions: { hyruleCastleLttP: 6, easternPalace: 2, ganonsTowerLttP: 3 } },
  { id: 'ganonsDarkArmy', name: "Ganon's Dark World Army", desc: 'Moblins and Darknuts of the Golden Land, gone dark with their master\'s wish.',
    units: ['moblin', 'moblin', 'darknut', 'wizzrobe', 'ironKnuckle'], leaders: ['ganonLegend', 'agahnim'], regions: { darkWorld: 5, ganonsTowerLttP: 5, deathMountainLttP: 2 } },
  { id: 'onoxsLegion', name: "Onox's Legion", desc: 'The General of Darkness\'s soldiers, holding Holodrum\'s seasons hostage.',
    units: ['moblin', 'ironKnuckle', 'darknut', 'smasher', 'hyruleSoldier'], leaders: ['onox'], regions: { horonVillage: 2, natzu: 3, tarmRuins: 4, templeOfSeasons: 6 } },
  { id: 'ambisGuard', name: "Ambi's Guard", desc: 'Queen Ambi\'s soldiers of four hundred years ago, driving the workers to finish the Black Tower.',
    units: ['hyruleSoldier', 'hyruleSoldier', 'hyruleKnight', 'darknut'], leaders: ['queenAmbi', 'ralph'], regions: { lynnaVillage: 6, lynnaCity: 2, blackTower: 3 } },
  { id: 'veransShadows', name: "Veran's Shadows", desc: 'The Sorceress of Shadows\' possessed servants: monsters, soldiers and whoever she happens to be wearing.',
    units: ['antiFairy', 'buzzBlob', 'wizzrobe', 'ironKnuckle', 'hyruleSoldier'], leaders: ['veran'], regions: { blackTower: 5, zoraSeas: 2, rollingRidge: 2 } },
  { id: 'koholintNightmares', name: 'The Nightmares of Koholint', desc: 'The monsters the Shadow Nightmare dreams up to keep the Wind Fish asleep.',
    units: ['moblin', 'buzzBlob', 'cukeman', 'wizzrobe', 'antiFairy'], leaders: ['agahnim', 'veran'], regions: { mysteriousForest: 2, talTalHeights: 3, windFishsEgg: 5 } },
  { id: 'twinrovaCoven', name: 'The Twinrova Coven', desc: 'The witch sisters and their Wizzrobes, gathering flames to bring back Ganon.',
    units: ['meteoWizzrobe', 'blizzrobe', 'bossWizzrobe', 'darknut'], leaders: ['twinrova', 'koume', 'kotake'], regions: { roomOfRites: 6, blackTower: 2, templeOfSeasons: 2 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  hyruleCastleLttP: 40, easternPalace: 85, desertPalace: 85, deathMountainLttP: 75, darkWorld: 60, ganonsTowerLttP: 55,
  mabeVillage: 85, mysteriousForest: 80, animalVillage: 80, talTalHeights: 80, windFishsEgg: 75,
  horonVillage: 70, natzu: 60, subrosia: 90, tarmRuins: 55, templeOfSeasons: 40,
  lynnaCity: 75, lynnaVillage: 40, crescentIsland: 85, rollingRidge: 75, zoraSeas: 85, blackTower: 45, roomOfRites: 40,
};
