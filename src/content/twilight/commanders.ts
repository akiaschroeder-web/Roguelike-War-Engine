import type { CommanderDef } from '../../engine/types';

export const COMMANDERS: CommanderDef[] = [
  { heroId: 'heroOfTwilight', armyName: 'Hero of Twilight', units: ['midnaImp', 'rusl', 'hyruleSoldier'], bonus: 'forgottenTechniques', campaign: 'twilight',
    bonusText: 'All physical techniques (including Hidden Skills) cost 20% less stamina.', startingItems: ['ordonShield', 'lantern', 'epona'] },
  { heroId: 'midnaImp', armyName: 'Twilight Resistance', units: ['wolfLink', 'shadowBeast', 'shadowKargarok'], bonus: 'childrenOfTwilight', campaign: 'twilight',
    bonusText: 'Your units are immune to Twilight terrain penalties.', startingItems: ['twilightCrystal', 'fusedShadowHelmet'] },
  { heroId: 'zeldaTP', armyName: 'Defenders of Hyrule', units: ['ashei', 'hyruleKnight', 'hyruleArcher'], bonus: 'sacredResistance', campaign: 'twilight',
    bonusText: 'Light attacks deal 25% more damage to the undead and Twilight creatures.', startingItems: ['royalCrest'] },
  { heroId: 'herosShade', armyName: 'Forgotten Warriors', units: ['stalfos', 'rusl', 'hyruleSoldier'], bonus: 'ancientMastery', campaign: 'twilight',
    bonusText: 'Weapon experience is doubled, and each starting swordsman knows one random Hidden Skill.', startingItems: ['herosShadesArmor'] },
  { heroId: 'kingBulblin', armyName: 'Raider Horde', units: ['bulblin', 'bulblinArcher', 'wildBullbo'], bonus: 'mightMakesRight', campaign: 'twilight',
    bonusText: 'Mounted charges deal 30% more damage, and defeated enemies are more likely to join you.', startingItems: ['lordBullboMount', 'bulblinWarHorn'] },
  { heroId: 'zant', armyName: "Usurper's Army", units: ['shadowBeast', 'shadowBulblin', 'phantomZant'], bonus: 'endlessTwilight', campaign: 'twilight',
    bonusText: 'Shadow abilities cost 25% less MP, and your Shadow Beasts revive at 50% HP instead of 25%.', startingItems: ['zantsHelmet', 'twilightFogCapsule'] },
  { heroId: 'ganondorfTP', armyName: "Dark Lord's Legion", units: ['darknut', 'redeadKnight', 'aeralfos'], bonus: 'divinePower', campaign: 'twilight',
    bonusText: 'Your units gain +3 STR and MAG while below 50% HP.', startingItems: ['darknutArmor', 'shadowBeastHide'] },
];
