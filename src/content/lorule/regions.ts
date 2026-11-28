import type { BaseTerrain, MapStyle, Terrain, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'lorule' });

// Dungeons have plenty of walls to merge into.
const DUNGEON: MapStyle = { forest: 0.3, mountain: 0.5, water: 'none', walls: 7, forts: 1 };

/** The Hyrule half of the route (fixed order), the Lorule hub, the seven Sage dungeons (any order), the tower and the castle. */
export const HYRULE_ROUTE = ['kakarikoLB', 'easternPalaceLB', 'houseOfGales', 'towerOfHeraLB', 'sanctuaryLB', 'hyruleCastleLB'];
export const LORULE_HUB = 'thievesTown';
export const SAGE_DUNGEONS = ['thievesHideout', 'darkPalaceLB', 'swampPalaceLB', 'skullWoodsLB', 'desertPalaceLB', 'iceRuins', 'turtleRockLB'];
export const LORULE_FINALE = ['treacherousTower', 'loruleCastle'];
/** The campaign's sixteen regions (section 11). */
export const LORULE_ROUTE = [...HYRULE_ROUTE, LORULE_HUB, ...SAGE_DUNGEONS, ...LORULE_FINALE];
/** Which Sage each dungeon holds (their painting is the dungeon's reward). */
export const SAGE_OF: Record<string, string> = {
  thievesHideout: 'osfala', darkPalaceLB: 'gulley', swampPalaceLB: 'oren', skullWoodsLB: 'seres', desertPalaceLB: 'irene', iceRuins: 'rosso', turtleRockLB: 'impaALBW',
};
/** The Desert Palace's entrance is in Hyrule: the route needs a crossing through both kingdoms first. */
export const NEEDS_CROSSING = ['desertPalaceLB'];

/** Battlefield spaces placed in each region's battles (section 10). */
export const LB_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  kakarikoLB: { mergeWall: 2, maiamaiSpot: 2, energyOrb: 1, rupeeTrap: 1 },
  easternPalaceLB: { mergeWall: 4, maiamaiSpot: 1, energyOrb: 1 },
  houseOfGales: { tornadoLift: 3, mergeWall: 2, maiamaiSpot: 1 },
  towerOfHeraLB: { mergeWall: 3, tornadoLift: 1, maiamaiSpot: 1, energyOrb: 1 },
  sanctuaryLB: { portraitFrame: 1, mergeWall: 2, energyOrb: 1, maiamaiSpot: 1 },
  hyruleCastleLB: { mergeWall: 4, portraitFrame: 1, wallCrack: 2, maiamaiSpot: 1 },
  thievesTown: { wallCrack: 2, rupeeTrap: 2, mergeWall: 2, maiamaiSpot: 1 },
  thievesHideout: { wallCrack: 2, rupeeTrap: 2, mergeWall: 3, darknessSwitch: 1 },
  darkPalaceLB: { darknessSwitch: 2, gemBarrier: 2, mergeWall: 3, maiamaiSpot: 1 },
  swampPalaceLB: { mergeWall: 2, maiamaiSpot: 2, energyOrb: 1 },
  skullWoodsLB: { mergeWall: 3, wallCrack: 2, maiamaiSpot: 1 },
  desertPalaceLB: { mergeWall: 2, tornadoLift: 1, wallCrack: 2, energyOrb: 1 },
  iceRuins: { icePlatform: 3, mergeWall: 3, maiamaiSpot: 1 },
  turtleRockLB: { icePlatform: 3, mergeWall: 2, energyOrb: 1 },
  treacherousTower: { mergeWall: 3, energyOrb: 1 },
  loruleCastle: { mergeWall: 4, portraitFrame: 1, gemBarrier: 1, darknessSwitch: 1, wallCrack: 2 },
};

export const REGIONS: WorldDef[] = [
  // ── Hyrule ──
  r('kakarikoLB', 'Kakariko Village', 'Merchants · recruits · Heedles', 'The village below the castle: the Milk Bar, the swordsman\'s hut, a street of shops — and Ravio\'s rental business, set up in the hero\'s own house.',
    '#c0a070', t('Village Path', 'Orchard', 'Hillside', 'Well Pond', 'Fence', 'Shop', 'Lava'), t('#cdb890', '#5a9a4a', '#9a8a6a', '#4a8ad0', '#7a6a5a', '#c09a6a', '#d0502a'), { forest: 1.5, mountain: 0.5, water: 'lake', walls: 3, forts: 3 }),
  r('easternPalaceLB', 'Eastern Palace', 'Stalfos · Buzz Blobs · Yuga', 'An old palace in the eastern woods, where the hero first meets a sorcerer with a paintbrush.',
    '#b8a878', t('Palace Floor', 'Moss', 'Statue', 'Moat', 'Palace Wall', 'Dais', 'Lava'), t('#cbbf98', '#5a8a4a', '#9a9080', '#4a7ab0', '#7a6a50', '#a89870', '#d0502a'), DUNGEON),
  r('houseOfGales', 'House of Gales', 'Goriyas · Keese · Margomill', 'A tower of wind on Lake Hylia\'s island, full of fans, Tornado Lifts and a guardian built of spinning stone rings.',
    '#9ac0c0', t('Gale Floor', 'Moss', 'Turbine', 'Lake', 'Wind Wall', 'Fan Room', 'Lava'), t('#c8d8d0', '#7aa08a', '#9ab0b0', '#4a8ac0', '#6a8a8a', '#a0b8b0', '#d0502a'), { ...DUNGEON, water: 'lake' }),
  r('towerOfHeraLB', 'Tower of Hera', 'Tektites · Mini-Moldorms · Moldorm', 'A tall tower on Death Mountain\'s summit, floor after floor of moving platforms up to the worm that guards the top.',
    '#a09080', t('Tower Floor', 'Moss', 'Crag', 'Abyss', 'Tower Wall', 'Platform', 'Lava'), t('#b8a898', '#6a8a5a', '#8a7a6a', '#3a4a6a', '#6a5a4a', '#a09080', '#d0502a'), DUNGEON),
  r('sanctuaryLB', 'Sanctuary', 'Gibdos · sacred trials · Shadow Link', 'The chapel north of the castle where Seres prayed, and where Yuga first painted a Sage onto the wall.',
    '#c8c0b0', t('Chapel Floor', 'Graveyard', 'Tombstone', 'Font', 'Chapel Wall', 'Altar', 'Lava'), t('#d8d0c0', '#6a7a5a', '#9a9a90', '#6aa0d0', '#8a8070', '#c0b890', '#d0502a'), { forest: 1, mountain: 1, water: 'none', walls: 5, forts: 2 }),
  r('hyruleCastleLB', 'Hyrule Castle', 'Ball and Chain Soldiers · Darknuts · Yuga', 'The castle in Yuga\'s grip: soldiers under his spell, a barrier around the keep, and the princess painted on the throne-room wall.',
    '#8a8ab0', t('Courtyard', 'Garden', 'Battlement', 'Moat', 'Castle Wall', 'Keep', 'Lava'), t('#b0b0c8', '#5a8a5a', '#8a8aa0', '#3a6aa0', '#5a5a7a', '#a0a0c0', '#d0502a'), { forest: 0.5, mountain: 1, water: 'moat', walls: 6, forts: 2 }),
  // ── Lorule ──
  r('thievesTown', "Thieves' Town", 'Rupee Likes · thieves · Gigabari', 'Lorule\'s mirror of Kakariko: a town of thieves under a red sky, with a ruined forge and a bar that sells something called milk.',
    '#8a5a5a', t('Cracked Street', 'Dead Orchard', 'Rubble', 'Dark Pond', 'Ruined Wall', 'Hideaway', 'Lava'), t('#9a7a70', '#4a4a3a', '#6a5a50', '#3a4a6a', '#4a3a3a', '#8a6a5a', '#c04a2a'), { forest: 1, mountain: 1, water: 'lake', walls: 4, forts: 3 }),
  r('thievesHideout', "Thieves' Hideout", 'Rupee Likes · traps · Stalblind', 'The thieves\' lair under the town, full of traps, flooded rooms and a skeleton knight guarding the vault — and Thief Girl, who knows the way.',
    '#6a4a4a', t('Hideout Floor', 'Rot', 'Rubble', 'Flooded Room', 'Hideout Wall', 'Vault', 'Lava'), t('#8a6a60', '#4a3a2a', '#6a5a50', '#3a5a7a', '#3a2a2a', '#8a6a4a', '#c04a2a'), { ...DUNGEON, water: 'river' }),
  r('darkPalaceLB', 'Dark Palace', 'Gimos · Wizzrobes · Gemesaur King', 'A palace in perpetual darkness where switches turn the lights out — and a gem-masked beast waits in the black.',
    '#4a3a5a', t('Dark Floor', 'Shadow', 'Pillar', 'Black Pool', 'Dark Wall', 'Shrine', 'Lava'), t('#5a5068', '#2a2a3a', '#4a4058', '#2a2a4a', '#2a2030', '#5a4a6a', '#a03a4a'), DUNGEON),
  r('swampPalaceLB', 'Swamp Palace', 'Bari · Biri · Arrghus', 'A drowned palace in Lorule\'s swamp. Flood it and drain it, and find the eye behind the puffballs.',
    '#4a7a6a', t('Swamp Floor', 'Reeds', 'Mound', 'Floodwater', 'Swamp Wall', 'Pump Room', 'Lava'), t('#6a8a70', '#3a6a4a', '#5a6a5a', '#3a6a8a', '#3a4a40', '#6a8a6a', '#c04a2a'), { ...DUNGEON, water: 'many', walls: 5 }),
  r('skullWoodsLB', 'Skull Woods', 'Gibdos · Wallmasters · Knucklemaster', 'A dead forest of skull-shaped hollows, where a giant hand lives in the ceiling of the deepest one.',
    '#5a5a4a', t('Dead Ground', 'Dead Wood', 'Skull Rock', 'Bog', 'Root Wall', 'Skull Hollow', 'Lava'), t('#7a7a62', '#3a4a30', '#6a6a5a', '#3a4a4a', '#3a3a2a', '#6a6050', '#c04a2a'), { forest: 3, mountain: 1, water: 'none', walls: 5, forts: 1 }),
  r('desertPalaceLB', 'Desert Palace', 'Devalants · Gibdos · Zaganaga', 'A palace swallowed by Lorule\'s desert, reached only through a crack in a Hyrulean wall. Sand Rod country.',
    '#c0a060', t('Sand', 'Dry Brush', 'Dune', 'Oasis', 'Sandstone Wall', 'Ruin', 'Lava'), t('#d8c088', '#8a8a4a', '#c0a070', '#4a8ab0', '#9a7a50', '#b09060', '#d0502a'), { forest: 0.3, mountain: 2, water: 'none', walls: 4, forts: 1 }),
  r('iceRuins', 'Ice Ruins', 'Pengators · Big Pengator · Dharkstare', 'A frozen fortress on Lorule\'s Death Mountain: sliding floors, Ice Platforms over the void, and an eye in a shell of ice.',
    '#9ac0e0', t('Ice Floor', 'Frost', 'Ice Crag', 'Meltwater', 'Ice Wall', 'Frozen Hall', 'Lava'), t('#d8e8f0', '#9ab8c8', '#b0c8d8', '#5a8ab0', '#8aa0b8', '#c0d0e0', '#d06030'), { forest: 0.3, mountain: 1, water: 'lake', walls: 6, forts: 1 }),
  r('turtleRockLB', 'Turtle Rock', 'Fire Keese · Hinox · Grinexx', 'A lake of lava shaped like a turtle, with a dungeon in its shell and a volcanic turtle under the surface.',
    '#a05a3a', t('Basalt', 'Ash', 'Rock', 'Hot Spring', 'Lava Wall', 'Shell Chamber', 'Lava'), t('#8a6a5a', '#5a4a3a', '#6a4a3a', '#4a7ab0', '#4a3030', '#9a6a4a', '#e0502a'), { forest: 0.3, mountain: 1.5, water: 'river', walls: 5, forts: 1, lava: true }),
  r('treacherousTower', 'Treacherous Tower', 'Lynels · Darknuts · a gauntlet', 'A tower in Lorule\'s mountains that offers a prize to anyone who climbs its floors without stopping. Few do.',
    '#6a5a7a', t('Arena Floor', 'Moss', 'Pillar', 'Abyss', 'Tower Wall', 'Rest Floor', 'Lava'), t('#8a7a90', '#4a5a4a', '#6a6070', '#2a2a4a', '#4a3a5a', '#8a7a8a', '#c04a2a'), DUNGEON),
  r('loruleCastle', 'Lorule Castle', 'Lorule Knights · Lynels · Yuga Ganon', 'The castle of the fallen kingdom, at the edge of the void, where Hilda waits — and Yuga with the Demon King\'s painting.',
    '#5a2a4a', t('Throne Hall', 'Dead Garden', 'Battlement', 'Void', 'Castle Wall', 'Throne', 'Dark Fire'), t('#7a5a6a', '#3a2a3a', '#6a4a5a', '#1a1a3a', '#3a1a2a', '#8a5a6a', '#a03a5a'), { forest: 0.3, mountain: 1, water: 'moat', walls: 7, forts: 2 }),
];
