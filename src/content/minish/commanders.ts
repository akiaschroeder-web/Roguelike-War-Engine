import type { CommanderDef } from '../../engine/types';

// Section 14.
export const COMMANDERS: CommanderDef[] = [
  { heroId: 'heroOfMinish', armyName: 'The Picori Festival Champion', units: ['ezloCap', 'forestMinishScout'], bonus: 'fourSwordHero', campaign: 'minish',
    bonusText: 'Four Sword abilities (Four Sword Split) cost 25% less MP.', startingItems: ['redPotion', 'minishLeafShield'] },
  { heroId: 'ezloMinish', armyName: "Ezlo's Expedition", units: ['microLink', 'forestMinishHealer', 'mountainMinishWarrior'], bonus: 'minishSage', campaign: 'minish',
    bonusText: 'Allied Micro units gain +2 SKL and SPD.', startingItems: ['redPotion', 'minishTunic'] },
  { heroId: 'zeldaMC', armyName: "The Princess's Guard", units: ['hyruleSoldier', 'hyruleKnight'], bonus: 'lightForceBonus', campaign: 'minish',
    bonusText: 'Allied sacred abilities (light and sacred magic, sacred weapons) are 20% stronger.', startingItems: ['redPotion'] },
  { heroId: 'melari', armyName: "Melari's Forge", units: ['mountainMinishWarrior', 'mountainMinishBlacksmith'], bonus: 'masterForging', campaign: 'minish',
    bonusText: 'Repairs restore twice the durability (field forging, Sacred Forging, Master Craftsman and the Minish Forge).', startingItems: ['minishForgingApron', 'redPotion'] },
  { heroId: 'kingDaltus', armyName: 'The Royal Army of Hyrule', units: ['potho', 'hyruleKnight', 'hyruleArcher'], bonus: 'royalAuthority', campaign: 'minish',
    bonusText: 'Hyrule soldiers gain +3 DEF, and morale never falls below 40.', startingItems: ['redPotion'] },
  { heroId: 'swiftblade', armyName: 'The Blade Brothers', units: ['greatblade', 'grimblade'], bonus: 'bladeBrothers', campaign: 'minish',
    bonusText: 'Sword techniques cost 20% less STA.', startingItems: ['redPotion'] },
  { heroId: 'vaatiHylian', armyName: "The Wind Sorcerer's Ambition", units: ['vaatiMinish', 'pesto', 'puffstool'], bonus: 'windSorcery', campaign: 'minish',
    bonusText: 'Allied dark and wind magic deals 25% more damage.' },
];
