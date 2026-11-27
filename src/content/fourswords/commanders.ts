import type { CommanderDef } from '../../engine/types';

// Section 13.
export const COMMANDERS: CommanderDef[] = [
  { heroId: 'greenLink', armyName: 'The Four Links', units: ['redLink', 'blueLink', 'purpleLink'], bonus: 'fourSwordLeader', campaign: 'fourswords',
    bonusText: 'Formation commands cost 25% less CP.', startingItems: ['redPotion'] },
  { heroId: 'redLink', armyName: 'The Red Vanguard', units: ['hyruleSpearman', 'hyruleBombardier'], bonus: 'warriorsCourage', campaign: 'fourswords',
    bonusText: 'Allied physical damage +20%.', startingItems: ['bomb', 'redPotion'] },
  { heroId: 'blueLink', armyName: 'The Blue Scouts', units: ['hyruleSoldier', 'hyruleSoldier'], bonus: 'scoutsCourage', campaign: 'fourswords',
    bonusText: 'Allied infantry (units on foot) gain +1 MOV.', startingItems: ['redPotion'] },
  { heroId: 'purpleLink', armyName: 'The Purple Circle', units: ['purpleMaiden', 'blueMaiden'], bonus: 'mysticCommand', campaign: 'fourswords',
    bonusText: 'Allied magic abilities cost 20% less MP.', startingItems: ['redPotion'] },
  { heroId: 'zeldaFS', armyName: 'The Sanctuary Guard', units: ['greenMaiden', 'whiteMaiden'], bonus: 'sanctuaryLight', campaign: 'fourswords',
    bonusText: 'Allied sacred and healing abilities are 25% stronger.', startingItems: ['shrineMaidenRobes', 'redPotion'] },
  { heroId: 'shadowLink', armyName: 'The Dark Mirror', units: ['terrorpin', 'geldman'], bonus: 'shadowCommand', campaign: 'fourswords',
    bonusText: 'Better concealment (the army starts every battle Veiled) and Dark World combat (+3 STR and MAG in the Dark World).' },
  { heroId: 'vaatiWindMage', armyName: "The Wind Mage's Court", units: ['deluZol', 'deraZol'], bonus: 'windMage', campaign: 'fourswords',
    bonusText: 'Allied wind attacks deal 25% more damage.' },
  { heroId: 'ganonFSA', armyName: 'The King of Darkness', units: ['moblin', 'darknut'], bonus: 'darkKingsHost', campaign: 'fourswords',
    bonusText: 'Allied monsters gain +3 STR and DEF.' },
];
