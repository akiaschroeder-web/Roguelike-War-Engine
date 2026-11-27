import type { CommanderDef } from '../../engine/types';

// Section 15. Agahnim's army brings the new Wizzrobe.
export const COMMANDERS: CommanderDef[] = [
  { heroId: 'heroOfLegend', armyName: 'Hero of Legend', units: ['linksUncle', 'fluteBoy'], bonus: 'legendaryTools', campaign: 'legend',
    bonusText: 'Abilities granted by equipped tools and utility gear cost 20% less stamina and MP across the army.', startingItems: ['pegasusBoots', 'bomb', 'emberSeed'] },
  { heroId: 'zeldaLegend', armyName: 'Princess Zelda', units: ['sahasrahla', 'hyruleKnight'], bonus: 'sacredMaiden', campaign: 'legend',
    bonusText: 'Sacred healing and magic damage are 20% stronger.', startingItems: ['bookOfMudora', 'redPotion'] },
  { heroId: 'marin', armyName: 'Ballad of Koholint', units: ['tarin', 'bowwow', 'flyingRooster'], bonus: 'balladOfTheWindFish', campaign: 'legend',
    bonusText: 'Musical abilities (songs and song-like personal abilities) reach 1 space further.', startingItems: ['magicMushroom', 'secretMedicine'] },
  { heroId: 'din', armyName: 'Oracle of Seasons', units: ['ricky', 'hyruleSoldier'], bonus: 'seasonalBlessing', campaign: 'legend',
    bonusText: 'Seasonal effects favour your army: each season gives your units +2 to a stat (spring RES, summer STR, autumn SKL, winter DEF).', startingItems: ['rickysFlute', 'emberSeed'] },
  { heroId: 'nayru', armyName: 'Oracle of Ages', units: ['ralph', 'dimitri'], bonus: 'timeHarmony', campaign: 'legend',
    bonusText: 'Ability cooldowns are 1 turn shorter (minimum 1).', startingItems: ['dimitrisFlute', 'mysterySeed'] },
  { heroId: 'farore', armyName: 'Oracle of Secrets', units: ['impaOracle', 'moosh'], bonus: 'secretsOfFarore', campaign: 'legend',
    bonusText: 'More secret encounters and recruits: an extra recruit offer, and every map hides an extra buried treasure.', startingItems: ['mooshsFlute', 'gashaSeed'] },
  { heroId: 'agahnim', armyName: "Agahnim's Court", units: ['wizzrobe', 'darknut'], bonus: 'falseMagic', campaign: 'legend',
    bonusText: 'Illusions and shadow copies on your side deal 50% more damage (and Agahnim\'s illusions are a little sturdier).', startingItems: ['mysterySeed'] },
  { heroId: 'onox', armyName: 'General of Darkness', units: ['ironKnuckle', 'moblin'], bonus: 'generalOfDarkness', campaign: 'legend',
    bonusText: 'Heavy weapon damage (axes, hammers, flails and two-handed weapons) +15%.', startingItems: ['bomb'] },
  { heroId: 'veran', armyName: 'Sorceress of Shadows', units: ['antiFairy', 'buzzBlob'], bonus: 'sorceressOfShadows', campaign: 'legend',
    bonusText: 'Negative statuses your army inflicts last 1 turn longer.', startingItems: ['mysterySeed'] },
  { heroId: 'ganonLegend', armyName: 'King of Darkness', units: ['agahnim', 'darknut'], bonus: 'kingOfDarkness', campaign: 'legend',
    bonusText: 'Demonic and undead units in your army gain +3 STR and MAG.', startingItems: ['guardianAcorn'] },
];
