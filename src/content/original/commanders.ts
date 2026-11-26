import type { CommanderDef } from '../../engine/types';

export const COMMANDERS: CommanderDef[] = [
  { heroId: 'heroOfHyrule', armyName: 'Hero of Hyrule', units: ['oldMan', 'merchantHyrule'], bonus: 'hiddenTreasure', campaign: 'original',
    bonusText: 'Hidden treasure (staircases, secret caves, bombed walls, burnt bushes and buried finds) is 25% richer.', startingItems: ['greenClothes', 'bomb', 'enemyBait'] },
  { heroId: 'zeldaHyrule', armyName: 'Princess of Wisdom', units: ['oldWoman', 'hyruleSoldier'], bonus: 'wisdomOfHyrule', campaign: 'original',
    bonusText: 'Magic damage and healing are 20% stronger.', startingItems: ['letter', 'blueLifeMedicine'] },
  { heroId: 'ganonHyrule', armyName: 'Prince of Darkness', units: ['goriya', 'rope', 'zol'], bonus: 'concealedDarkness', campaign: 'original',
    bonusText: 'Allied monsters start each battle concealed (Veiled for 2 turns) and gain +2 STR and MAG while concealed.', startingItems: ['blueCandle'] },
];
