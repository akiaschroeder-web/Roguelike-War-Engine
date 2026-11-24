import type { CommanderDef } from '../../engine/types';

export const COMMANDERS: CommanderDef[] = [
  { heroId: 'terminaLink', armyName: 'Hero of Termina', units: ['tatl', 'kafei', 'dekuFlowerScout'], bonus: 'transformThrift', campaign: 'termina',
    bonusText: 'Transformations cost 25% less MP to maintain.', startingItems: ['herosShield', 'dekuMask'] },
  { heroId: 'darmani', armyName: 'Mountain Champions', units: ['goronWarrior', 'goronRoller', 'hyruleSoldier'], bonus: 'rolling', campaign: 'termina',
    bonusText: 'Rolling and charging attacks deal extra damage (+3 after moving 3+ spaces).', startingItems: ['goronRacingBracers', 'powderKeg'] },
  { heroId: 'mikau', armyName: 'Great Bay Warriors', units: ['lulu', 'zoraWarrior', 'zoraMystic'], bonus: 'aquatic', campaign: 'termina',
    bonusText: 'Aquatic units gain +1 MOV. Songs restore 2 extra stamina.', startingItems: ['zoraTunic'] },
  { heroId: 'dekuKing', armyName: 'Deku Royal Army', units: ['dekuPrincess', 'dekuRoyalGuard', 'dekuMystic'], bonus: 'dekuArmy', campaign: 'termina',
    bonusText: 'Deku recruits are offered more often and join one level higher.', startingItems: ['dekuBarkArmor', 'dekuRoyalCrown', 'dekuFlowerSeed'] },
  { heroId: 'igosDuIkana', armyName: 'Fallen Kingdom', units: ['sharp', 'stalfos', 'stalchild'], bonus: 'undeadArmy', campaign: 'termina',
    bonusText: 'Undead join recruitment from the start, and regenerate 5% HP each turn at night.', startingItems: ['ikanaRoyalCrown', 'poeLantern', 'gibdoMask'] },
  { heroId: 'skullKid', armyName: 'Children of the Moon', units: ['tael', 'madScrub', 'hiploop'], bonus: 'lingeringStatus', campaign: 'termina',
    bonusText: 'Statuses you inflict on enemies last one turn longer.', startingItems: ['stoneMask', 'maskOfScents'] },
];
