import type { FactionDef } from '../../engine/types';

// Section 2: no new races; the regional generics fight as factions (under a Rift's spell, or mistaking Zelda for an impostor).
export const FACTIONS: FactionDef[] = [
  { id: 'falseKingsGuard', name: "The False King's Guard", desc: 'Hyrule\'s soldiers, knights and archers, obeying the copy of the king who called the princess an impostor.',
    units: ['hyruleSoldier', 'hyruleSoldier', 'hyruleKnight', 'hyruleArcher'], leaders: ['generalWright', 'kingEoW'], regions: { hyruleCastleEoW: 4, suthornForest: 1, easternTemple: 1 } },
  { id: 'gerudoSanctumGuard', name: 'The Gerudo Sanctum Guard', desc: 'Seera\'s warriors, suspicious of strangers who come out of the sand.',
    units: ['gerudoGuard', 'gerudoGuard', 'gerudoThief'], leaders: ['dohna', 'chiefSeera'], regions: { gerudoDesertEoW: 3 } },
  { id: 'eldinGorons', name: 'The Gorons of Eldin', desc: 'Gorons who think anyone climbing the volcano during a Rift must be up to no good.',
    units: ['goronWarrior', 'goronWarrior', 'goronRoller'], leaders: ['darston'], regions: { eldinVolcanoEoW: 3 } },
  { id: 'faronDeku', name: 'The Deku of Faron', desc: 'Deku Scrubs of the wetlands, guarding their temple with seeds and spears.',
    units: ['dekuSoldier', 'dekuFlowerScout', 'dekuMystic', 'dekuScrub'], leaders: [], regions: { faronWetlands: 3, eternalForest: 1 } },
  { id: 'seaZoraGuard', name: 'The Sea Zora Guard', desc: 'Kushara\'s warriors and mystics, at odds with the River Zora upstream.',
    units: ['zoraWarrior', 'zoraWarrior', 'zoraMystic'], leaders: ['kushara'], regions: { jabulWaters: 3, wreckedShip: 1 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  suthornForest: 80, gerudoDesertEoW: 70, jabulWaters: 70, hyruleCastleEoW: 55, eldinVolcanoEoW: 75, faronWetlands: 75,
  hebraMountain: 95, easternTemple: 95, wreckedShip: 95, eternalForest: 90, ancientRuins: 95, nullsBody: 100,
};
