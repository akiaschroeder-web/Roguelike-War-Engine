import type { BaseTerrain, MapStyle, Terrain, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'echoes' });

const DUNGEON: MapStyle = { forest: 0.5, mountain: 0.5, water: 'none', walls: 6, forts: 1 };

/** The campaign's twelve regions, in order (section 14). */
export const ECHOES_ROUTE = [
  'suthornForest', 'gerudoDesertEoW', 'jabulWaters', 'hyruleCastleEoW', 'eldinVolcanoEoW', 'faronWetlands',
  'hebraMountain', 'easternTemple', 'wreckedShip', 'eternalForest', 'ancientRuins', 'nullsBody',
];
/** Desert regions: Dohna's Desert Tactics, Gerudo Sandals and the quicksand. */
export const DESERT_REGIONS = ['gerudoDesertEoW', 'gerudoDesert', 'gerudoDesertTP', 'gerudoWild', 'lanayruDesert', 'desertPalace'];
/** Where Tri's friends wait, one per region (a rescue in the region's Rift repairs it). */
export const TRI_FRIENDS: Record<string, string> = {
  suthornForest: 'the first of Tri\'s friends', gerudoDesertEoW: 'a friend lost in the sand', jabulWaters: 'a friend in the deep ruins', hyruleCastleEoW: 'a friend in the castle Rift',
  eldinVolcanoEoW: 'a friend in the lava', faronWetlands: 'a friend in the swamp', hebraMountain: 'a frozen friend', easternTemple: 'a friend in the temple',
  wreckedShip: 'a friend in the hold', eternalForest: 'a friend in the eternal woods', ancientRuins: 'a friend in the ruins', nullsBody: 'the last of Tri\'s friends',
};

/** Battlefield spaces placed in each region's ordinary battles (section 13). */
export const EO_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  suthornForest: { echoLearningPoint: 1, stampStation: 1, glowingEnergyOrb: 1 },
  gerudoDesertEoW: { echoLearningPoint: 1, sinkingSand: 2, glowingEnergyOrb: 1 },
  jabulWaters: { verticalWaterColumn: 2, echoLearningPoint: 1, stampStation: 1 },
  hyruleCastleEoW: { echoLearningPoint: 1, bindHandle: 1, glowingEnergyOrb: 1 },
  eldinVolcanoEoW: { echoLearningPoint: 1, glowingEnergyOrb: 1, stampStation: 1 },
  faronWetlands: { verticalWaterColumn: 1, echoLearningPoint: 1, bindHandle: 1 },
  hebraMountain: { echoLearningPoint: 1, glowingEnergyOrb: 1, stampStation: 1 },
  easternTemple: { bindHandle: 2, echoLearningPoint: 1 },
  wreckedShip: { verticalWaterColumn: 2, echoLearningPoint: 1 },
  eternalForest: { echoLearningPoint: 1, stampStation: 1, glowingEnergyOrb: 1 },
  ancientRuins: { echoLearningPoint: 1, glowingEnergyOrb: 2, bindHandle: 1 },
  nullsBody: { glowingEnergyOrb: 2 },
};
/** The Still World (Rift battles): broken islands, unstable spaces and a corruption source. */
export const STILL_WORLD_TERRAIN: Partial<Record<Terrain, number>> = { unstableRift: 6, riftBoundary: 4, floatingIsland: 2, rotatedTerrain: 2, glowingEnergyOrb: 1, riftCorruptionSource: 1 };

export const REGIONS: WorldDef[] = [
  r('suthornForest', 'Suthorn Forest and Ruins', 'Octoroks · Moblins · Seismic Talus', 'The woods south of the castle where the first Rift opened, and the old ruins where Zelda found the Tri Rod.',
    '#5a9a4a', t('Glade', 'Thicket', 'Ruin Mound', 'Stream', 'Ruin Wall', 'Old Shrine', 'Lava'), t('#9ac07a', '#3a7a3a', '#8a8a6a', '#4a8ad0', '#6a6a5a', '#a08a6a', '#d0502a'), { forest: 1.5, mountain: 0.5, water: 'none', walls: 1, forts: 1 }),
  r('gerudoDesertEoW', 'Gerudo Desert and Sanctum', 'Moldorms · Caromadillos · Mogryph', 'Dunes, Gerudo Town under a Rift, and the Sanctum where Mogryph sleeps in the sand.',
    '#d8b060', t('Sand', 'Oasis Palms', 'Dune', 'Oasis', 'Sandstone', 'Sanctum', 'Lava'), t('#e0c890', '#7aa05a', '#c8a060', '#4aa0c0', '#a0805a', '#c09a6a', '#d0602a'), { forest: 0.3, mountain: 2, water: 'lake', walls: 2, forts: 1 }),
  r('jabulWaters', 'Jabul Waters and Ruins', 'Chompfins · River Zora · Vocavor', 'Rivers and the sea where River Zora and Sea Zora quarrel, and the sunken ruins of an older Zora kingdom.',
    '#3a8ab0', t('Riverbank', 'Reeds', 'Rock', 'Deep Water', 'Ruin Wall', 'Zora Hall', 'Lava'), t('#b0c8a0', '#4a9a6a', '#8a8a8a', '#2a6ab0', '#5a6a7a', '#7aa0b0', '#d0502a'), { forest: 1, mountain: 0.5, water: 'many', walls: 2, forts: 1 }),
  r('hyruleCastleEoW', 'Hyrule Castle', 'Darknuts · the false king\'s guard · Echo Ganon', 'The castle in the grip of a copied king and a Rift in the throne room, where an Echo of Ganon waits.',
    '#8a7aa0', t('Courtyard', 'Garden', 'Battlement', 'Moat', 'Castle Wall', 'Throne Room', 'Brazier'), t('#c0b8a8', '#5a8a4a', '#8a8090', '#3a6ab0', '#6a6070', '#a090a0', '#d05a30'), { forest: 0.5, mountain: 1, water: 'moat', walls: 5, forts: 2 }),
  r('eldinVolcanoEoW', 'Eldin Volcano and Temple', 'Ignizols · Tweelus · Volvagia', 'The Goron mountain, Darston\'s village and the burning temple where an Echo of Volvagia coils.',
    '#b05a3a', t('Ash Path', 'Scorched Brush', 'Crag', 'Hot Spring', 'Basalt', 'Goron Hall', 'Lava'), t('#a08070', '#6a5a3a', '#7a5a4a', '#4a7ab0', '#4a3a30', '#b08a5a', '#e0502a'), { forest: 0.3, mountain: 3, water: 'river', walls: 2, forts: 1, lava: true }),
  r('faronWetlands', 'Faron Wetlands and Temple', 'Deku Babas · Ribbitunes · Gohma', 'A swamp of lily pads and Deku Scrubs, and a temple overgrown with vines where an Echo of Gohma lurks.',
    '#4a8a5a', t('Marsh', 'Mangroves', 'Mound', 'Swamp', 'Vine Wall', 'Deku Hall', 'Lava'), t('#8aa070', '#2a6a3a', '#7a7a5a', '#3a7a7a', '#4a5a3a', '#8a8a5a', '#d0502a'), { forest: 3, mountain: 0.5, water: 'many', walls: 1, forts: 1 }),
  r('hebraMountain', 'Hebra Mountain and Lanayru Temple', 'White Wolfos · Freezards · Skorchill', 'Snowfields where Condé shovels paths, and the frozen Lanayru Temple where Skorchill alternates fire and ice.',
    '#a8c0d8', t('Snowfield', 'Frosted Pines', 'Peak', 'Frozen Lake', 'Ice Wall', 'Lodge', 'Lava'), t('#e8f0f8', '#7a9aa0', '#a0b0c0', '#7ab0d8', '#8aa0b0', '#b0a090', '#d0602a'), { forest: 1, mountain: 3, water: 'lake', walls: 2, forts: 1 }),
  r('easternTemple', 'Eastern Temple', 'Armos · Poes · Smog', 'An old temple full of switches and statues, where an Echo of the cloud beast Smog drifts through the halls.',
    '#9a8a6a', t('Temple Floor', 'Moss', 'Pillar', 'Cistern', 'Temple Wall', 'Altar', 'Lava'), t('#c0b090', '#6a8a5a', '#9a8a7a', '#4a7ab0', '#6a5a4a', '#a89a7a', '#d0502a'), DUNGEON),
  r('wreckedShip', 'Wrecked Ship', 'Chompfins · Biri · Bori', 'A ghost ship run aground on the coast, flooded below deck, with a bubble-shielded jellyfish in the hold.',
    '#5a7a8a', t('Deck', 'Rigging', 'Cargo', 'Flooded Hold', 'Hull', 'Cabin', 'Lava'), t('#a08a6a', '#7a6a5a', '#8a7a6a', '#3a6a8a', '#5a4a3a', '#9a7a5a', '#d0502a'), { forest: 0.3, mountain: 1, water: 'many', walls: 4, forts: 1 }),
  r('eternalForest', 'Eternal Forest', 'Wolfos · Crawltulas · Tekom', 'A forest where it is always dusk and Dampé\'s studio hides among the trees, and where an Echo of Zelda waits.',
    '#3a6a5a', t('Clearing', 'Old Trees', 'Root Mound', 'Pond', 'Hedge', 'Studio', 'Lava'), t('#7a9a7a', '#1a4a3a', '#6a7a5a', '#3a6a8a', '#3a4a3a', '#8a7a5a', '#d0502a'), { forest: 4, mountain: 0.5, water: 'lake', walls: 1, forts: 1 }),
  r('ancientRuins', 'Ancient Ruins', 'Lynels · Darknuts · major Rifts', 'The ruins at the heart of the Still World, where the biggest Rifts open and copies of old heroes step out of them.',
    '#6a5a8a', t('Broken Floor', 'Dead Grove', 'Rubble', 'Void Pool', 'Ruin Wall', 'Rift Gate', 'Void Fire'), t('#8a809a', '#3a3a4a', '#7a6a8a', '#2a2a5a', '#4a3a5a', '#8a6a9a', '#a03a8a'), { forest: 0.5, mountain: 1.5, water: 'lake', walls: 4, forts: 1 }),
  r('nullsBody', "Null's Body", 'Echoes of everything · Null', 'Inside the Rift-eater itself: floating islands of stolen land, and a primordial nothing with many arms.',
    '#2a1a3a', t('Stolen Ground', 'Copied Wood', 'Floating Rock', 'Nothing', 'Void Wall', 'Core', 'Void Fire'), t('#5a4a6a', '#2a2a3a', '#4a3a5a', '#0a0a1a', '#1a0a2a', '#6a3a6a', '#8a2a8a'), { forest: 0.5, mountain: 1, water: 'lake', walls: 3, forts: 1 }),
];
