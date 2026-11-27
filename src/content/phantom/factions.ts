import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'bellumsPhantoms', name: "Bellum's Phantoms", desc: 'The Temple\'s armored guardians and their watching eyes, sent out across the sea.',
    units: ['phantom', 'phantom', 'swiftPhantom', 'warpPhantom', 'phantomEye', 'phantomEye'], leaders: ['bellum'], regions: { templeOfTheOceanKing: 6, zauzsIsland: 3, finalDuel: 4, isleOfRuins: 1 } },
  { id: 'jolenesCrew', name: "Jolene's Crew", desc: 'A pirate crew with a grudge against one particular treasure hunter.',
    units: ['nudge', 'senza', 'zuko', 'senza'], leaders: ['jolene'], regions: { cannonIsland: 4, molidaIsland: 2, bellumsWaters: 2, mercayIsland: 1 } },
  { id: 'yookRaiders', name: 'Yook Raiders', desc: 'Yook pretending to be Anouki, and Yook not bothering to pretend.',
    units: ['yookWarrior', 'yookIceBreather', 'yookBerserker'], leaders: [], regions: { isleOfFrost: 5 } },
  // The pending Subrosians: an ore-trading gang in Era of Legend's Subrosia.
  { id: 'subrosianOreGang', name: 'Subrosian Ore Gang', desc: 'Hooded Subrosians who think everything that falls through a portal is theirs to keep — especially Ore Chunks.',
    units: ['subrosianWarrior', 'subrosianWarrior', 'subrosianMiner', 'subrosianThief', 'subrosianSorcerer', 'subrosianBlacksmith'], leaders: ['rosa'], regions: { subrosia: 4 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  mercayIsland: 85, templeOfTheOceanKing: 50, isleOfEmber: 85, cannonIsland: 55, isleOfGust: 85, molidaIsland: 75, ghostShipPH: 90, goronIsland: 85,
  isleOfFrost: 65, isleOfTheDead: 85, isleOfRuins: 75, zauzsIsland: 60, bellumsWaters: 80, finalDuel: 55,
};
