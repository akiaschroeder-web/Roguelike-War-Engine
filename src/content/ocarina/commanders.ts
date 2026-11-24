import type { CommanderDef } from '../../engine/types';

// Starting armies from the design doc. `startingItems` are handed out at the
// start (equipped on the commander where possible). Gear that needs systems not
// built yet (ocarina, bomb bag) is listed in `pendingGear`.
export const COMMANDERS: (CommanderDef & { pendingGear: string[] })[] = [
  { heroId: 'link', armyName: "Hero's Expedition", units: ['navi', 'malon', 'hyruleSoldier'], bonus: 'extraTreasure',
    bonusText: 'Treasure encounters offer one additional reward choice.',
    startingItems: ['dekuShield', 'kokiriTunic'], pendingGear: ['Fairy Ocarina'] },
  { heroId: 'zelda', armyName: 'Royal Resistance', units: ['impa', 'hyruleKnight', 'hyruleArcher'], bonus: 'healing',
    bonusText: 'Healing abilities restore 20% additional HP.',
    startingItems: ['hylianShield', 'soldierArmor', 'redPotion', 'redPotion'], pendingGear: [] },
  { heroId: 'darunia', armyName: 'Brothers of the Mountain', units: ['medigoron', 'goronWarrior', 'goronRoller'], bonus: 'forging',
    bonusText: 'Forging costs −25%. (Until the Blacksmith arrives: weapon prices −25%.)',
    startingItems: ['bomb', 'bomb'], pendingGear: ['Bomb Bag'] },
  { heroId: 'ruto', armyName: 'Royal Zora Guard', units: ['zoraWarrior', 'zoraWarrior', 'zoraMystic'], bonus: 'postBattleHeal',
    bonusText: 'All units recover an extra 10% HP after each battle.',
    startingItems: ['zoraTunic', 'silverScale'], pendingGear: [] },
  { heroId: 'nabooru', armyName: 'Gerudo Rebellion', units: ['gerudoGuard', 'gerudoThief', 'gerudoGuard'], bonus: 'rupees',
    bonusText: 'Earn 25% additional Rupees from battles.',
    startingItems: ['gerudoBuckler', 'gerudoSandals', 'gerudoLongbow'], pendingGear: [] },
  { heroId: 'ganondorf', armyName: 'Army of Darkness', units: ['moblin', 'stalfos', 'lizalfos'], bonus: 'monsters',
    bonusText: 'Monsters answer his call: they turn up far more often in recruitment.',
    pendingGear: [] },
];
