import type { CommanderDef } from '../../engine/types';

export const COMMANDERS: CommanderDef[] = [
  { heroId: 'heroOfWinds', armyName: 'Hero of Winds', units: ['aryll', 'orca', 'kingOfRedLions'], bonus: 'courageOfTheSea', campaign: 'greatSea',
    bonusText: 'Successful parries and counterattacks generate 1 Command Point (once per turn per unit).', startingItems: ['herosShield', 'basicSail'] },
  { heroId: 'tetra', armyName: 'Pirate Crew', units: ['gonzo', 'niko', 'mako', 'pirateShip'], bonus: 'piratesSpoils', campaign: 'greatSea',
    bonusText: 'Captured ships and defeated enemies bring 25% more loot (Rupees and drops).', startingItems: ['pirateCannon', 'grapplingHook', 'allPurposeBait'] },
  { heroId: 'medli', armyName: "Earth Sage's Guardians", units: ['komali', 'ritoWarrior', 'ritoArcher'], bonus: 'dragonRoost', campaign: 'greatSea',
    bonusText: 'Flying units gain +1 MOV, and sacred (light) attacks deal 20% more to the undead.', startingItems: ['fairyBow', 'ritoFlightGarb'] },
  { heroId: 'makar', armyName: 'Children of the Forest', units: ['korokScout', 'korokPlanter', 'korokWindMage'], bonus: 'forestRenewal', campaign: 'greatSea',
    bonusText: 'Allies standing in vegetation (forests and trees) recover 10% HP each turn.', startingItems: ['dekuLeaf', 'korokGardeningGloves'] },
  { heroId: 'kingDaphnes', armyName: 'Kingdom Beneath the Sea', units: ['zeldaWW', 'hyruleKnight', 'hyruleArcher'], bonus: 'hyrulesLegacy', campaign: 'greatSea',
    bonusText: 'All allies gain +2 RES. Repairing royal and sacred equipment costs 25% less.', startingItems: ['royalCrest'] },
  { heroId: 'ganondorfWW', armyName: 'Forsaken Armada', units: ['darknut', 'bokoblin', 'miniblin', 'gunboat'], bonus: 'forsaken', campaign: 'greatSea',
    bonusText: 'Monsters join recruitment from the start. Disarmed enemies suffer −3 STR and DEF for 2 turns.', startingItems: ['darknutShield', 'pirateCannon'] },
  { heroId: 'cyclos', armyName: 'Lords of the Gale', units: ['zephos', 'seahat', 'kargaroc'], bonus: 'unrulyWinds', campaign: 'greatSea',
    bonusText: 'Wind abilities and melodies cost 50% less MP. Enemy flyers are hurled further by your winds.', startingItems: ['zephosWindCharm', 'windWaker'] },
];
