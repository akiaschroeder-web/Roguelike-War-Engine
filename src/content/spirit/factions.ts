import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'colesConspiracy', name: "Cole's Conspiracy", desc: 'The chancellor\'s Phantoms, his Key Masters and the Geozard Chiefs he bought, marching for the Demon King.',
    units: ['torchPhantom', 'phantom', 'keyMaster', 'geozardChief', 'phantomEye'], leaders: ['cole', 'byrne'], regions: { towerOfSpirits: 4, darkRealm: 5, demonTrainLine: 4, sacredBattlefield: 3 } },
  { id: 'bulblinRailRaiders', name: 'Bulblin Rail Raiders', desc: 'Bulblins on Bullbos and Miniblins in baskets, led by a Big Blin, who rob trains for a living.',
    units: ['bulblin', 'bulblin', 'miniblin', 'miniblin', 'wildBullbo'], leaders: ['bigBlin'], regions: { abodaVillage: 2, hyruleCastleST: 2, forestRealm: 3, snowRealm: 2, sandRealm: 1 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  abodaVillage: 85, hyruleCastleST: 60, forestRealm: 80, snowRealm: 85, oceanRealm: 85, fireRealm: 85, sandRealm: 85, towerOfSpirits: 60, darkRealm: 55,
  demonTrainLine: 60, sacredBattlefield: 65,
};
