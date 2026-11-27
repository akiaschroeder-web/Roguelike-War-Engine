import type { CommanderDef } from '../../engine/types';

// Section 14. The Lokomo Guardian in Anjean's army was dropped with the generic Lokomo: Steem takes its place (to confirm).
export const COMMANDERS: CommanderDef[] = [
  { heroId: 'heroOfSpirits', armyName: 'The Spirit Train', units: ['alfonzo', 'spiritTrain', 'teacher'], bonus: 'royalEngineers', campaign: 'spirit',
    bonusText: 'Rail movement and repairs +25%: allied trains +1 MOV, and every repair (trains, track, weapons) heals 25% more.', startingItems: ['redPotion', 'recruitUniform', 'whirlwindST'] },
  { heroId: 'zeldaST', armyName: "The Princess's Guard", units: ['heroOfSpirits', 'phantom'], bonus: 'unboundSpirit', campaign: 'spirit',
    bonusText: 'Possession and Spirit Form cost 25% less MP.', startingItems: ['phantomTear', 'recruitUniform'] },
  { heroId: 'anjean', armyName: 'The Lokomo Sages', units: ['gage', 'steem'], bonus: 'sacredSymphony', campaign: 'spirit',
    bonusText: 'Sacred and musical abilities +20%: songs and sacred abilities cost 20% less, and sacred healing and damage are 20% stronger.', startingItems: ['lokomoSageRobes'] },
  { heroId: 'byrne', armyName: "Byrne's Ambition", units: ['phantom', 'geozardChief'], bonus: 'ironGauntlet', campaign: 'spirit',
    bonusText: 'Melee attacks ignore 15% of the target\'s DEF.', startingItems: ['redPotion'] },
  { heroId: 'cole', armyName: "The Chancellor's Plot", units: ['torchPhantom', 'keyMaster'], bonus: 'demonicInfluence', campaign: 'spirit',
    bonusText: 'Possessed allies (Phantoms and the possessed) gain +3 STR and MAG.', startingItems: ['redPotion', 'recruitUniform'] },
  { heroId: 'malladus', armyName: 'The Demon King Returns', units: ['darkTrain', 'wreckerPhantom'], bonus: 'demonKingsRail', campaign: 'spirit',
    bonusText: 'Allied demonic units (demons, the undead, Phantoms and demon trains) gain +4 STR and RES.' },
];
