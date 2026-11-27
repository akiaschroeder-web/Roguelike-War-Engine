import type { CommanderDef } from '../../engine/types';

// Section 13. Pirate Deckhand / Swordsman / Lookout are the Wind Waker's Senza, Nudge and Zuko.
export const COMMANDERS: CommanderDef[] = [
  { heroId: 'linebeck', armyName: 'The S.S. Linebeck', units: ['ssLinebeck', 'eddo', 'senza'], bonus: 'fortuneSeeker', campaign: 'phantom',
    bonusText: 'Treasure and salvage rewards +30% (treasure Rupees, battle salvage and finds).', startingItems: ['redPotion', 'bombchu'] },
  { heroId: 'ciela', armyName: 'Spirits of the Ocean King', units: ['heroOfWinds', 'leaf', 'neri'], bonus: 'spiritOfCourage', campaign: 'phantom',
    bonusText: 'Phantom Hourglass abilities cost 25% less time energy.', startingItems: ['spiritOfCourageGem'] },
  { heroId: 'jolene', armyName: "Jolene's Pirates", units: ['jolenesShip', 'nudge', 'zuko'], bonus: 'boardingFury', campaign: 'phantom',
    bonusText: 'Boarding attacks +20%: attacks on vessels, and attacks made from a ship\'s deck, a boarding point or right after landing.', startingItems: ['pirateCutlass'] },
  { heroId: 'kingMutoh', armyName: 'The Cobble Kingdom', units: ['bremeur', 'doylan', 'max'], bonus: 'cobbleLegacy', campaign: 'phantom',
    bonusText: 'Cobble units gain +3 DEF and RES.', startingItems: ['cobbleRoyalArmor'] },
  { heroId: 'bellum', armyName: 'The Evil Phantom', units: ['phantom', 'phantomEye'], bonus: 'phantomFeast', campaign: 'phantom',
    bonusText: 'Allied monsters recover 10% HP after defeating an enemy.', startingItems: ['phantomHelmet'] },
];
