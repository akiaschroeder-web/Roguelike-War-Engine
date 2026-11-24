import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'dekuArmy', name: 'Deku Royal Army', desc: 'The Deku King\'s soldiers, convinced you kidnapped someone.',
    units: ['dekuSoldier', 'dekuSoldier', 'dekuRoyalGuard', 'dekuFlowerScout', 'dekuMystic', 'dekuBombardier', 'madScrub'],
    leaders: ['dekuKing', 'dekuPrincess'], regions: { woodfall: 7, terminaField: 2, clockTown: 1 } },
  { id: 'ikanaLegion', name: 'Ikana Royal Army', desc: 'The undead soldiers of fallen Ikana, still guarding their king.',
    units: ['stalfos', 'stalchild', 'stalchild', 'ikanaServant1', 'ikanaServant2', 'gibdo'],
    leaders: ['igosDuIkana', 'captainKeeta', 'sharp'], regions: { ikana: 7, terminaField: 1 } },
  { id: 'goronVillage', name: 'Snowhead Gorons', desc: 'Frozen, hungry and grumpy Gorons who want to test your strength.',
    units: ['goronWarrior', 'goronWarrior', 'goronRoller'], leaders: ['darmani'], regions: { snowhead: 6 } },
  { id: 'indigoGos', name: 'The Indigo-Go\'s', desc: 'A Zora band\'s fans and guards. They think you stole the eggs.',
    units: ['zoraWarrior', 'zoraWarrior', 'zoraMystic'], leaders: ['mikau', 'lulu'], regions: { greatBay: 4 } },
  { id: 'piratesFortress', name: 'Gerudo Pirates', desc: 'Pirates of Great Bay, guarding their stolen loot.',
    units: ['gerudoGuard', 'gerudoGuard', 'gerudoThief'], leaders: ['nabooru'], regions: { greatBay: 5 } },
  { id: 'clockTownGuard', name: 'Clock Town Guard', desc: 'The town guard has orders: nobody leaves without a sword.',
    units: ['hyruleSoldier', 'hyruleSoldier', 'hyruleArcher'], leaders: ['kafei'], regions: { clockTown: 5, terminaField: 2 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  clockTown: 40, terminaField: 70, woodfall: 50, snowhead: 55, greatBay: 45, ikana: 40, moon: 85,
};
