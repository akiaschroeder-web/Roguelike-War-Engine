import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'ganonsHorde', name: "Ganon's Horde", desc: 'Moblins, Goriyas and Darknuts, sent by the Prince of Darkness to keep the fragments hidden.',
    units: ['goriya', 'goriya', 'moblin', 'darknut', 'rope', 'zol'], leaders: ['ganonHyrule'], regions: { level7Demon: 4, level8Lion: 4, level9DeathMountain: 6 } },
  { id: 'hyruleRemnant', name: 'The Remnant of Hyrule', desc: 'The last of the royal guard, who take your army for Ganon\'s.',
    units: ['hyruleSoldier', 'hyruleSoldier', 'oldMan', 'merchantHyrule'], leaders: ['zeldaHyrule', 'heroOfHyrule'], regions: { level1Eagle: 2, level2Moon: 2, level3Manji: 2 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  northCastle: 85, parapaPalace: 90, z2Towns: 70, z2DeathMountain: 85, midoroPalace: 90, islandPalace: 85, mazeIslandPalace: 90, spectacleRock: 85,
  palaceOnTheSea: 90, threeEyeRockPalace: 90, valleyOfDeath: 80, greatPalace: 95,
  level1Eagle: 85, level2Moon: 85, level3Manji: 80, level4Snake: 85, level5Lizard: 80, level6Dragon: 85, level7Demon: 70, level8Lion: 70, level9DeathMountain: 65,
};
