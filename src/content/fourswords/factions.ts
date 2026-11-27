import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'ganonsHost', name: "Ganon's Host", desc: 'Darknuts, Moblins and Ball and Chain Troopers in the Trident Demon\'s pay, with Shadow Link at their head.',
    units: ['darknut', 'moblin', 'ballChainTrooper', 'stalfos', 'bigBomb'], leaders: ['shadowLink'], regions: { darkWorldFSA: 4, realmOfTheHeavens: 4, nearTheFields: 2, desertOfDoubt: 1 } },
  { id: 'bewitchedGuard', name: 'The Bewitched Royal Guard', desc: 'Hyrule\'s spearmen, bombardiers and captains under Ganon\'s spell, marching against the four Links.',
    units: ['hyruleSoldier', 'hyruleSpearman', 'hyruleSpearman', 'hyruleBombardier', 'hyruleCaptain'], leaders: ['hyruleCaptain'], regions: { whereaboutsOfTheWind: 2, nearTheFields: 4 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  seaOfTrees: 95, talusCave: 95, deathMountainFS: 95, vaatisPalace: 80, whereaboutsOfTheWind: 75, easternHyrule: 90, deathMountainFSA: 90,
  nearTheFields: 55, darkWorldFSA: 70, desertOfDoubt: 85, frozenHyrule: 85, realmOfTheHeavens: 65,
};
