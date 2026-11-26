import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'yigaClan', name: 'The Yiga Clan', desc: 'Masked assassins sworn to the Demon King, disguised as travelers until the moment they strike.',
    units: ['yigaFootsoldier', 'yigaFootsoldier', 'yigaBlademaster', 'yigaEngineer'], leaders: ['kohga', 'sooga'], regions: { kakarikoWild: 6, gerudoWild: 4, depthsMines: 6, akkala: 2, necluda: 2 } },
  { id: 'calamityForces', name: 'The Calamity\'s Machines', desc: 'Guardians turned by Malice, marching out of Hyrule Castle in the Calamity\'s name.',
    units: ['guardianScout2', 'guardianScout3', 'guardianScout1', 'guardianStalker', 'decayedGuardian'], leaders: ['calamityGanon'], regions: { centralHyrule: 5, hyruleCastleWild: 5, akkala: 5, finalTrial: 3 } },
  { id: 'constructLegion', name: 'Zonai Construct Legion', desc: 'Soldier Constructs still following orders ten thousand years old. Some of those orders were given by the Gloom.',
    units: ['soldierConstruct1', 'soldierConstruct2', 'soldierConstruct3', 'captainConstruct1', 'captainConstruct2', 'stewardConstruct'], leaders: ['mineruConstruct', 'rauruZonai'], regions: { greatSkyIsland: 6, skyArchipelago: 4, spiritTemple: 6, depthsMines: 3 } },
  { id: 'demonKingsArmy', name: "The Demon King's Army", desc: 'Gloom Spawn, phantoms and the monsters who answered Ganondorf\'s call.',
    units: ['gloomSpawn', 'stalmoblin', 'stalkoblin', 'stalizalfos', 'yigaBlademaster'], leaders: ['ganondorfWild', 'phantomGanondorf'], regions: { gloomsOrigin: 8, hyruleCastleWild: 4, greatHyruleForest: 2 } },
  { id: 'gerudoWarriorsWild', name: 'Gerudo Warriors', desc: 'Riju\'s guard, who take a dim view of strangers near their town.',
    units: ['gerudoGuard', 'gerudoGuard', 'gerudoThief'], leaders: ['buliara', 'riju', 'urbosa'], regions: { gerudoWild: 4 } },
  { id: 'zoraGuardWild', name: 'Zora Guard', desc: 'The Domain\'s spear-bearers, quick to defend their prince.',
    units: ['zoraWarrior', 'zoraWarrior', 'zoraMystic'], leaders: ['sidon', 'dorephan', 'mipha'], regions: { lanayruWild: 3 } },
  { id: 'goronMinersWild', name: 'Goron Miners', desc: 'YunoboCo\'s workers, defending their mines with very large hammers.',
    units: ['goronWarrior', 'goronRoller', 'goronWarrior'], leaders: ['yunobo', 'bludo', 'daruk'], regions: { eldinWild: 3 } },
  { id: 'ritoFlight', name: 'Rito Flight', desc: 'The warriors of Rito Village, wary of anyone near their skies.',
    units: ['ritoArcher', 'ritoScout', 'ritoArcher'], leaders: ['teba', 'tulin', 'revali'], regions: { hebra: 3, skyArchipelago: 2 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  greatPlateau: 90, centralHyrule: 60, hyruleCastleWild: 60, hateno: 85, kakarikoWild: 50, akkala: 60, lanayruWild: 75, eldinWild: 75, hebra: 75, gerudoWild: 65,
  faronWild: 85, necluda: 80, greatHyruleForest: 85, greatSkyIsland: 55, skyArchipelago: 70, depthsMines: 50, spiritTemple: 50, gloomsOrigin: 50, finalTrial: 70,
};
