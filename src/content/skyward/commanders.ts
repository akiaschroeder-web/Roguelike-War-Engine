import type { CommanderDef } from '../../engine/types';

// Signature weapons the doc lists as starting gear (the Groosenator, Ghirahim's Blade and
// the Demon King's Sword) are already part of those characters' own loadouts.

export const COMMANDERS: CommanderDef[] = [
  { heroId: 'heroOfTheSky', armyName: 'Knights of Skyloft', units: ['fi', 'pipit', 'crimsonLoftwing'], bonus: 'knightAcademy', campaign: 'skyward',
    bonusText: 'Sword combat experience +30%; riders on flying mounts spend 20% less stamina.', startingItems: ['goddessSword', 'woodenShieldTP', 'sailcloth'] },
  { heroId: 'zeldaSS', armyName: 'Servants of Hylia', units: ['impaSS', 'hyruleKnight', 'skyLoftwing'], bonus: 'sacredMission', campaign: 'skyward',
    bonusText: 'Healing and sacred (light) attacks and abilities are 25% stronger.', startingItems: ['goddessHarp', 'sacredShield', 'lifeMedal'] },
  { heroId: 'groose', armyName: 'Sealed Grounds Defense', units: ['fledge', 'scrapper', 'hyruleSoldier'], bonus: 'groosesEngineering', campaign: 'skyward',
    bonusText: 'Siege weapons and Bombardment deal 25% more damage; equipment upgrades need 25% fewer materials.', startingItems: ['bomb', 'bomb', 'treasureMedal'] },
  { heroId: 'ghirahim', armyName: 'Demon Tribe', units: ['cursedBokoblin', 'stalmaster', 'technoblin'], bonus: 'demonicSwordsmanship', campaign: 'skyward',
    bonusText: 'Every successful counterattack restores 3 HP and 3 stamina.', startingItems: ['ghirahimsDiamond', 'demonCrystal'] },
  { heroId: 'demise', armyName: 'Army of Eternal Hatred', units: ['ironShieldMoblin', 'darkLizalfos', 'cursedBokoblin'], bonus: 'demonKingsDominion', campaign: 'skyward',
    bonusText: 'Allied demons gain +3 STR and MAG and are immune to fear.', startingItems: ['demisesScales', 'demisesFlame'] },
];
