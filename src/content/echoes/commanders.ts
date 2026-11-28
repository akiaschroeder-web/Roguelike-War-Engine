import type { CommanderDef } from '../../engine/types';

// Section 16. Dradd's River Zora are the A Link Between Worlds pack's (docs/river-zora.md): until they exist he
// leads Sea Zora instead (content/echoes/index.ts resolveEchoesFallbacks swaps them in once they are installed).
export const DRADD_RIVER_ZORA = ['riverZoraWarrior', 'riverZoraHunter'];
export const COMMANDERS: CommanderDef[] = [
  { heroId: 'zeldaEoW', armyName: 'The Princess of Echoes', units: ['tri', 'hyruleSoldier'], bonus: 'echoCapacity', campaign: 'echoes',
    bonusText: '+2 Echo Capacity for every allied summoner.', startingItems: ['redPotion', 'energySmoothie'] },
  { heroId: 'linkEoW', armyName: 'The Swordsman of the Rift', units: ['hyruleSoldier', 'hyruleArcher'], bonus: 'riftHunter', campaign: 'echoes',
    bonusText: 'Allies deal 20% more damage to Rift creatures and Echoes.', startingItems: ['redPotion'] },
  { heroId: 'generalWright', armyName: "Wright's Royal Army", units: ['hyruleKnight', 'hyruleSoldier', 'hyruleSoldier'], bonus: 'formationCommand', campaign: 'echoes',
    bonusText: 'Battle orders (formation commands) cost 25% less CP, and the infantry hold formation (+2 DEF, +2 damage).', startingItems: ['redPotion'] },
  { heroId: 'dampeEoW', armyName: "Dampé's Studio", units: ['techtite', 'tocktorok'], bonus: 'clockworkArmy', campaign: 'echoes',
    bonusText: 'Automatons spend 25% less Wind-Up Energy.', startingItems: ['clockworkKey', 'redPotion'] },
  { heroId: 'darston', armyName: 'The Gorons of Eldin', units: ['goronWarrior', 'goronRoller'], bonus: 'goronObstacles', campaign: 'echoes',
    bonusText: 'Allies gain +3 DEF and +2 STR, and deal 50% more damage to constructs and obstacles.', startingItems: ['redPotion'] },
  { heroId: 'dohna', armyName: 'The Sanctum Guard', units: ['gerudoGuard', 'gerudoGuard'], bonus: 'desertMarch', campaign: 'echoes',
    bonusText: 'Allies gain +1 MOV, and fight better on sand (+1 STR and +5 Avoid in the desert).', startingItems: ['redPotion'] },
  { heroId: 'dradd', armyName: 'The River Zora of Jabul', units: ['zoraWarrior', 'zoraMystic'], bonus: 'riverZoraMight', campaign: 'echoes',
    bonusText: 'River Zora (and Dradd, and the Zora who march with him) gain +3 STR and MAG and +1 DEF.', startingItems: ['redPotion'] },
  { heroId: 'kushara', armyName: 'The Sea Zora of Jabul', units: ['zoraWarrior', 'zoraMystic'], bonus: 'aquaticHealing', campaign: 'echoes',
    bonusText: 'Healing on aquatic allies is 30% stronger.', startingItems: ['redPotion', 'zoraWater'] },
  { heroId: 'tekom', armyName: 'The False Princess', units: ['darknut', 'ignizol'], bonus: 'falseEchoes', campaign: 'echoes',
    bonusText: 'Allied monster Echoes are stronger (90% of the original, not 75%).', startingItems: ['redPotion'] },
  { heroId: 'nullEoW', armyName: 'The Primordial Void', units: ['tornando', 'tweelus'], bonus: 'voidReflection', campaign: 'echoes',
    bonusText: 'Boss Echoes cost 25% less (MP and capacity).' },
];
