import type { CommanderDef } from '../../engine/types';

// Section 13.
export const COMMANDERS: CommanderDef[] = [
  { heroId: 'linkALBW', armyName: 'The Hero of Two Kingdoms', units: ['gulley', 'hyruleSoldier'], bonus: 'betweenWorldsLB', campaign: 'lorule',
    bonusText: 'Wall merging costs 25% less MP.', startingItems: ['redPotion'] },
  { heroId: 'zeldaALBW', armyName: "Hyrule's Light", units: ['seres', 'hyruleKnight'], bonus: 'sacredLightLB', campaign: 'lorule',
    bonusText: 'Allied sacred and healing magic is 25% stronger.', startingItems: ['redPotion'] },
  { heroId: 'hilda', armyName: 'The Royal Guard of Lorule', units: ['loruleKnight', 'loruleSoldier'], bonus: 'loruleGuard', campaign: 'lorule',
    bonusText: 'Lorulean allies gain +3 DEF and RES.', startingItems: ['redPotion'] },
  { heroId: 'ravio', armyName: "Ravio's Rental Company", units: ['sheerow', 'loruleSoldier'], bonus: 'rentalDiscount', campaign: 'lorule',
    bonusText: 'Rentals at Ravio\'s Shop cost 50% less.', startingItems: ['redPotion'] },
  { heroId: 'yuga', armyName: "The Artist's Collection", units: ['gimos', 'loruleSpearman'], bonus: 'livingPortraitLB', campaign: 'lorule',
    bonusText: 'Magic statuses the army inflicts (and Painting Prison) last 1 turn longer.' },
  { heroId: 'oren', armyName: 'The Court of the River', units: ['zoraWarrior', 'zoraMystic'], bonus: 'riverQueenLB', campaign: 'lorule',
    bonusText: 'Aquatic allies gain +2 MOV in water.', startingItems: ['redPotion'] },
  { heroId: 'gramps', armyName: "Gramps's Old Students", units: ['hyruleSoldier', 'hyruleSpearman'], bonus: 'veteranTechniques', campaign: 'lorule',
    bonusText: 'Sword techniques cost 25% less STA.', startingItems: ['redPotion'] },
  { heroId: 'yugaGanon', armyName: 'The Painted Demon King', units: ['bari', 'rupeeLike'], bonus: 'demonKingsMonsters', campaign: 'lorule',
    bonusText: 'Allied monsters gain +3 STR and MAG.' },
];
