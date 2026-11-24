import type { CommanderDef } from '../../engine/types';

// Starting armies from the design doc. Starting gear that needs systems not
// built yet (shields, tunics, potions, bombs, ocarina, scales) is listed in
// `pendingGear` so it can be granted once those systems exist.
export const COMMANDERS: (CommanderDef & { pendingGear: string[] })[] = [
  { heroId: 'link', armyName: "Hero's Expedition", units: ['navi', 'malon', 'hyruleSoldier'], bonus: 'extraTreasure',
    bonusText: 'Treasure encounters offer one additional reward choice.',
    pendingGear: ['Deku Shield', 'Kokiri Tunic', 'Fairy Ocarina'] },
  { heroId: 'zelda', armyName: 'Royal Resistance', units: ['impa', 'hyruleKnight', 'hyruleArcher'], bonus: 'healing',
    bonusText: 'Healing abilities restore 20% additional HP.',
    pendingGear: ['Hylian Shield', 'Hyrule Soldier Armor', '2× Red Potion'] },
  { heroId: 'darunia', armyName: 'Brothers of the Mountain', units: ['medigoron', 'goronWarrior', 'goronRoller'], bonus: 'forging',
    bonusText: 'Forging costs −25%. (Until the Blacksmith arrives: weapon prices −25%.)',
    pendingGear: ['Bomb Bag', '5× Bombs'] },
  { heroId: 'ruto', armyName: 'Royal Zora Guard', units: ['zoraWarrior', 'zoraWarrior', 'zoraMystic'], bonus: 'postBattleHeal',
    bonusText: 'All units recover an extra 10% HP after each battle.',
    pendingGear: ['Silver Scale', 'Zora Tunic'] },
  { heroId: 'nabooru', armyName: 'Gerudo Rebellion', units: ['gerudoGuard', 'gerudoThief', 'gerudoGuard'], bonus: 'rupees',
    bonusText: 'Earn 25% additional Rupees from battles.',
    startingItems: ['gerudoLongbow'], pendingGear: ['Gerudo Buckler', 'Gerudo Sandals'] },
  { heroId: 'ganondorf', armyName: 'Army of Darkness', units: ['moblin', 'stalfos', 'lizalfos'], bonus: 'monsters',
    bonusText: 'Monster recruitment is enabled from the start.',
    pendingGear: [] },
];
