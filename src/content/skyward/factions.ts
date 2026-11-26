import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'skyloftKnights', name: 'Knights of Skyloft', desc: 'Knight Academy cadets who take you for an intruder, and won\'t back down.',
    units: ['hyruleSoldier', 'hyruleKnight', 'skyLoftwing'], leaders: ['pipit', 'karane', 'gaepora', 'groose'], regions: { skyloft: 6, theSky: 3 } },
  { id: 'demonTribe', name: 'The Demon Tribe', desc: 'Ghirahim\'s Bokoblins, Moblins and Lizalfos, out to find the goddess\'s reincarnation.',
    units: ['bokoblin', 'bokoblin', 'moblin', 'ironShieldMoblin', 'lizalfos', 'cursedBokoblin'], leaders: ['ghirahim'], regions: { faronWoodsSS: 4, eldinVolcano: 4, sealedGrounds: 5, fireSanctuary: 3 } },
  { id: 'ancientMachines', name: 'Ancient Machines', desc: 'Robots of the Lanayru era, reactivated by a Timeshift Stone and loyal to nobody.',
    units: ['technoblin', 'technoblin', 'sentrobe', 'beamos', 'ampilus'], leaders: ['scervo', 'dreadfuse'], regions: { lanayruDesert: 5, lanayruSandSea: 6, skyKeep: 2 } },
  { id: 'armyOfHatred', name: 'Army of Eternal Hatred', desc: 'The Demon King\'s legion: the strongest of the demon tribe and the dead who serve him.',
    units: ['ironShieldMoblin', 'cursedBokoblin', 'lizalfos', 'stalfos', 'moblin'], leaders: ['demise', 'ghirahimTrue'], regions: { demonsRealm: 8, skyKeep: 3 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  skyloft: 55, theSky: 85, faronWoodsSS: 75, eldinVolcano: 70, lanayruDesert: 70, lanayruSandSea: 65, ancientCistern: 90, fireSanctuary: 75, sealedGrounds: 60, skyKeep: 70, demonsRealm: 60,
};
