import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'yugasForces', name: "Yuga's Forces", desc: 'Lorule\'s soldiers, spearmen and knights, marching for the sorcerer who says he can save their world.',
    units: ['loruleSoldier', 'loruleSoldier', 'loruleSpearman', 'loruleKnight'], leaders: ['yuga'], regions: { hyruleCastleLB: 3, loruleCastle: 4, thievesTown: 1, darkPalaceLB: 1, treacherousTower: 2 } },
  { id: 'enchantedGuard', name: 'The Enchanted Castle Guard', desc: 'Hyrule\'s own soldiers, under Yuga\'s spell, blocking the way to the castle.',
    units: ['hyruleSoldier', 'hyruleSoldier', 'hyruleSpearman', 'hyruleKnight', 'hyruleArcher'], leaders: [], regions: { hyruleCastleLB: 3, sanctuaryLB: 1, kakarikoLB: 1 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  kakarikoLB: 85, easternPalaceLB: 95, houseOfGales: 95, towerOfHeraLB: 95, sanctuaryLB: 85, hyruleCastleLB: 50,
  thievesTown: 75, thievesHideout: 90, darkPalaceLB: 90, swampPalaceLB: 95, skullWoodsLB: 95, desertPalaceLB: 95, iceRuins: 95, turtleRockLB: 95,
  treacherousTower: 70, loruleCastle: 50,
};
