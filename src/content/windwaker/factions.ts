import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'tetrasPirates', name: "Tetra's Pirates", desc: 'The most feared pirates on the Great Sea think your ship looks valuable.',
    units: ['senza', 'nudge', 'zuko', 'mako', 'pirateGrappler', 'pirateGrappler'], leaders: ['tetra', 'gonzo'], regions: { greatSea: 6, forsakenFortress: 2, outsetIsland: 2 } },
  { id: 'ritoFlock', name: 'Rito Flock', desc: 'Rito warriors who mistake you for Valoo\'s tormentors.',
    units: ['ritoWarrior', 'ritoWarrior', 'ritoArcher', 'ritoScout', 'ritoGuardian', 'ritoWindcaller'], leaders: ['ritoChieftain', 'komali'], regions: { dragonRoost: 6, greatSea: 1 } },
  { id: 'korokGrove', name: 'Korok Grove', desc: 'Startled Koroks defending their seedlings.',
    units: ['korokScout', 'korokPlanter', 'korokWindMage', 'korokHealer'], leaders: ['makar'], regions: { forestHaven: 5 } },
  { id: 'forsakenArmada', name: 'Forsaken Armada', desc: 'Ganondorf\'s Bokoblins, Moblins and Darknuts, with gunboats.',
    units: ['bokoblin', 'bokoblin', 'miniblin', 'moblin', 'darknut', 'gunboat'], leaders: ['ganondorfWW'], regions: { forsakenFortress: 7, greatSea: 3, ganonsTower: 4 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  outsetIsland: 70, forsakenFortress: 40, dragonRoost: 55, forestHaven: 60, greatSea: 55, towerOfTheGods: 90, earthTemple: 90, windTemple: 85, submergedHyrule: 80, ganonsTower: 80,
};
