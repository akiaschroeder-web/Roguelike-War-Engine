import type { BaseTerrain, MapStyle, Terrain, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle, naval = false): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'phantom', naval });

const ISLAND: MapStyle = { forest: 2, mountain: 1.5, water: 'many', walls: 1, forts: 1 };
const TEMPLE: MapStyle = { forest: 0.3, mountain: 0.5, water: 'none', walls: 6, forts: 1 };
const ISLE = t('Sand Path', 'Palms', 'Cliffs', 'Sea', 'Rock Wall', 'Hut', 'Lava');
const ISLE_C = t('#d8c890', '#4a8a4a', '#8a7a5a', '#2a7ac0', '#6a5a4a', '#a07a50', '#d0502a');
const TEMPLE_T = t('Temple Floor', 'Vines', 'Pillar', 'Sacred Pool', 'Temple Wall', 'Safe Room', 'Spikes');

/** The campaign route, in order (four sea charts, then the finale). */
export const SOUTHWESTERN_SEA = ['mercayIsland', 'isleOfEmber', 'cannonIsland', 'isleOfGust', 'molidaIsland'];
export const NORTHWESTERN_SEA = ['ghostShipPH', 'goronIsland'];
export const NORTHEASTERN_SEA = ['isleOfFrost', 'isleOfTheDead'];
export const SOUTHEASTERN_SEA = ['isleOfRuins', 'zauzsIsland'];
export const PH_FINALE = ['templeOfTheOceanKing', 'bellumsWaters', 'finalDuel'];
export const PHANTOM_ROUTE = [...SOUTHWESTERN_SEA, ...NORTHWESTERN_SEA, ...NORTHEASTERN_SEA, ...SOUTHEASTERN_SEA, ...PH_FINALE];
/** Which sea chart opens each stretch of the route. */
export const CHART_FOR: Record<string, string> = {
  ghostShipPH: 'northwesternSeaChart', goronIsland: 'northwesternSeaChart', isleOfFrost: 'northeasternSeaChart', isleOfTheDead: 'northeasternSeaChart',
  isleOfRuins: 'southeasternSeaChart', zauzsIsland: 'southeasternSeaChart',
};
/** The Temple of the Ocean King: the recurring, expanding dungeon (and the Final Temple). */
export const OCEAN_KING_TEMPLE = 'templeOfTheOceanKing';

/** Battlefield spaces placed in each region. */
export const PH_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  mercayIsland: { sunCrest: 1, submergedTreasure: 1, cycloneWarp: 1, hammerPad: 1 },
  templeOfTheOceanKing: { sacredSafeZone: 4, phantomPatrol: 0, phantomAlarm: 2, spiritPedestal: 1, sunCrest: 1 },
  isleOfEmber: { sunCrest: 1, bombchuTunnel: 2, hammerPad: 1 },
  cannonIsland: { submergedTreasure: 2, bombchuTunnel: 2, cycloneWarp: 1 },
  isleOfGust: { whirlwind: 3, tightropePost: 2, bombchuTunnel: 1 },
  molidaIsland: { tightropePost: 2, sunCrest: 1, submergedTreasure: 1, hammerPad: 1 },
  ghostShipPH: { sacredSafeZone: 1, phantomAlarm: 1, bombchuTunnel: 2 },
  goronIsland: { bombchuTunnel: 3, sunCrest: 1, hammerPad: 1 },
  isleOfFrost: { whirlwind: 1, spiritPedestal: 1, hammerPad: 1 },
  isleOfTheDead: { sunCrest: 2, sacredSafeZone: 1, spiritPedestal: 1 },
  isleOfRuins: { sunCrest: 2, hammerPad: 2, bombchuTunnel: 1 },
  zauzsIsland: { spiritPedestal: 1, submergedTreasure: 1, cycloneWarp: 1 },
  bellumsWaters: { cycloneWarp: 2, submergedTreasure: 2 },
  finalDuel: { sacredSafeZone: 2, spiritPedestal: 1 },
};

export const REGIONS: WorldDef[] = [
  r('mercayIsland', 'Mercay Island', 'ChuChus · Octoroks · the Temple of the Ocean King', 'Where the hero washed ashore, Ciela found him, and Linebeck\'s ship waits at the dock below the Temple of the Ocean King.',
    '#7ac06a', ISLE, ISLE_C, ISLAND),
  r('templeOfTheOceanKing', 'Temple of the Ocean King', 'Phantoms · Phantom Eyes · Bellum', 'A temple that drinks the life of anyone outside its Sacred Safe Zones. Phantoms patrol its floors; at the bottom, Bellum waits.',
    '#6a5a8a', TEMPLE_T, t('#9a8aa0', '#4a6a4a', '#7a6a7a', '#3a6aa0', '#3a2a4a', '#e8d890', '#a03a3a'), TEMPLE),
  r('isleOfEmber', 'Isle of Ember', 'Fire Keese · Geozards · Blaaz', 'A volcanic island with a fortune teller\'s house and the Temple of Fire, where Blaaz divides and burns.',
    '#c05a3a', t('Ash', 'Charred Brush', 'Volcanic Rock', 'Sea', 'Basalt', 'Astrid\'s House', 'Lava'), t('#9a7a62', '#5a4a3a', '#6a4a3a', '#2a6ab0', '#4a3a30', '#b08a5a', '#e0502a'),
    { forest: 0.5, mountain: 3, water: 'lake', walls: 2, forts: 1, lava: true }),
  r('cannonIsland', 'Cannon Island', 'Miniblins · Bokoblins · Jolene', 'Eddo\'s cannon workshop and its booby-trapped house. Out at sea, a green pirate ship is closing in.',
    '#8a8a5a', t('Workshop Yard', 'Scrub', 'Rocks', 'Sea', 'Stone Wall', 'Workshop', 'Furnace'), ISLE_C, ISLAND),
  r('isleOfGust', 'Isle of Gust', 'Keese · Wizzrobes · Cyclok', 'An island of wind and sand-filled geysers; the Wind Temple and an octopus riding a cyclone.',
    '#c0b070', t('Sand', 'Dune Grass', 'Wind-Carved Rock', 'Sea', 'Rock Wall', 'Windmill', 'Hot Sand'), t('#d8c880', '#8a9a5a', '#b0a070', '#3a8ac0', '#7a6a4a', '#a08050', '#e07030'), ISLAND),
  r('molidaIsland', 'Molida Island', 'Octoroks · Like Likes · Crayk', 'A fishing village, a hidden cave, and the Temple of Courage where Crayk hunts unseen.',
    '#5a9a7a', ISLE, ISLE_C, ISLAND),
  r('ghostShipPH', 'The Ghost Ship', 'Stalfos · ReDeads · the Cubus Sisters', 'A green-hulled ghost galleon drifting in the fog of the northwestern sea, with Tetra aboard and four giggling sisters in its hold.',
    '#5a8a8a', t('Rotten Deck', 'Rigging', 'Crates', 'Bilge', 'Hull', 'Cabin', 'Cursed Fire'), t('#6a7a6a', '#4a5a4a', '#5a5a4a', '#2a4a5a', '#2a3a3a', '#7a8a7a', '#6a3a7a'),
    { forest: 0.5, mountain: 1, water: 'moat', walls: 5, forts: 1 }),
  r('goronIsland', 'Goron Island', 'Geozards · Moldorms · Dongorongo', 'The Gorons\' island of red rock, the Goron Temple, and the armored lizard at its heart.',
    '#a06a4a', t('Red Rock', 'Shrub', 'Crag', 'Sea', 'Cliff', 'Goron House', 'Lava'), t('#a07a5a', '#5a6a3a', '#8a5a4a', '#3a7ac0', '#5a3a2a', '#a0805a', '#e0502a'),
    { forest: 0.5, mountain: 4, water: 'lake', walls: 2, forts: 2 }),
  r('isleOfFrost', 'Isle of Frost', 'Yook · Ice Keese · the Gleeok', 'An island of snow where the Anouki and the Yook glare at each other across the ice, and the Temple of Ice holds a two-headed dragon.',
    '#a8d0e8', t('Snow', 'Frosted Pines', 'Ice Crag', 'Frozen Sea', 'Ice Wall', 'Anouki Hut', 'Lava'), t('#e8f0f8', '#7a9aaa', '#9ab0c0', '#5a8ab0', '#8aa0b0', '#c0a080', '#d06030'),
    { forest: 2, mountain: 2, water: 'lake', walls: 2, forts: 2 }),
  r('isleOfTheDead', 'Isle of the Dead', 'Stalfos · Poes · the Cobble Knights', 'King Mutoh\'s tomb, guarded by the ghosts of the Cobble Kingdom: Bremeur, Doylan and Max still keep their posts.',
    '#6a6a8a', t('Grave Path', 'Dead Trees', 'Tombstone', 'Black Water', 'Crypt Wall', 'Mausoleum', 'Cursed Flame'), t('#7a7a8a', '#4a4a3a', '#6a6a7a', '#2a3a5a', '#3a3a4a', '#8a8a9a', '#7a3a6a'),
    { forest: 1, mountain: 2, water: 'lake', walls: 4, forts: 1 }),
  r('isleOfRuins', 'Isle of Ruins', 'Geozards · Stalfos · Eox', 'The flooded ruins of the Cobble Kingdom, Mutoh\'s Temple and the stone soldier who guards it.',
    '#8a8a6a', t('Old Stone', 'Overgrowth', 'Ruin', 'Flooded Street', 'Ruined Wall', 'Temple', 'Lava'), t('#9a9a7a', '#4a6a3a', '#7a7a6a', '#3a6a9a', '#4a4a3a', '#a09a7a', '#d0502a'),
    { forest: 2, mountain: 2, water: 'many', walls: 4, forts: 1 }),
  r('zauzsIsland', "Zauz's Island", 'Geozards · Swift Phantoms', 'A lonely island with a forge. Bring the three sacred metals, and Zauz will make a blade that can cut Phantoms.',
    '#9a7a5a', t('Path', 'Scrub', 'Rocks', 'Sea', 'Stone Wall', "Zauz's Forge", 'Forge Fire'), ISLE_C, ISLAND),
  r('bellumsWaters', "Bellum's Waters", "Sea monsters · Bellum's Ghost Ship", 'The open sea after the Temple: the possessed Ghost Ship rises to finish what Bellum began.',
    '#2a4a6a', t('Sandbar', 'Wreckage', 'Sea Rock', 'Dark Sea', 'Reef', 'Floating Wreck', 'Burning Oil'), t('#c8b880', '#5a5a4a', '#6a6a6a', '#1a3a6a', '#4a5a6a', '#7a6a5a', '#c05a2a'),
    { forest: 0.5, mountain: 1, water: 'many', walls: 1, forts: 1 }, true),
  r('finalDuel', 'The Final Duel', 'Phantoms · Bellumbeck', 'On the deck of the ruined ship, under a sky gone black: Linebeck, possessed, with Bellum\'s eye burning in his armor.',
    '#3a2a4a', t('Deck', 'Shadow', 'Debris', 'Dark Sea', 'Railing', 'Mast', 'Phantom Fire'), t('#5a4a5a', '#3a2a3a', '#5a4a4a', '#1a2a4a', '#2a1a2a', '#6a5a6a', '#8a2a5a'),
    { forest: 0.3, mountain: 0.5, water: 'moat', walls: 2, forts: 1 }),
];
