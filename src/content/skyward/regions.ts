import type { BaseTerrain, MapStyle, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'skyward' });

/** Regions where the open "water" tiles are the sky itself (only flyers cross). */
export const SKY_REGIONS = ['skyloft', 'theSky', 'skyKeep'];

export const REGIONS: WorldDef[] = [
  r('skyloft', 'Skyloft', 'Merchants · knight recruitment · upgrades · aerial training',
    'The floating town above the clouds: the Knight Academy, the Bazaar, Gondo\'s Scrap Shop, and a lot of Loftwings.',
    '#9ad0f0', t('Grass', 'Orchard', 'Rocky Rise', 'Open Sky', 'Stone Wall', 'Knight Academy', 'Bonfire'),
    t('#a8d070', '#5a9a4a', '#a0a090', '#e8f4ff', '#9a9080', '#c0a070', '#d07040'), { forest: 1.5, mountain: 1, water: 'many', walls: 2, forts: 2 }),
  r('theSky', 'The Sky', 'Flying encounters · islands · aerial combat',
    'An ocean of clouds dotted with small islands. Guays, Keese and stranger things fly here.',
    '#bfe2ff', t('Island Grass', 'Island Grove', 'Rock Spire', 'Cloud Sea', 'Cliff', 'Sky Shrine', 'Storm Fire'),
    t('#b0d880', '#6aa05a', '#b0b0b8', '#f4faff', '#8a8a9a', '#d0c090', '#d08050'), { forest: 1, mountain: 2, water: 'many', walls: 1, forts: 1 }),
  r('faronWoodsSS', 'Faron Woods', 'Forest ambushes · Kikwi · sacred ruins',
    'The first land below the clouds: giant trees, Bokoblin camps, shy Kikwis and the Skyview Temple.',
    '#4a9a4a', t('Forest Floor', 'Great Trees', 'Mossy Rock', 'Lake Floria', 'Root Wall', 'Skyview Temple', 'Burning Brush'),
    t('#7aaa5a', '#2a6a2a', '#7a8a6a', '#4a8ab0', '#4a3a2a', '#9a9a7a', '#c05a2a'), { forest: 7, mountain: 1, water: 'lake', walls: 2, forts: 1 }),
  r('eldinVolcano', 'Eldin Volcano', 'Lava · tunnels · explosives',
    'A volcano full of Mogma tunnels, bomb flowers and lava rivers. The Earth Temple waits at the top.',
    '#c06a3a', t('Ash', 'Scorched Scrub', 'Volcanic Rock', 'Hot Spring', 'Basalt Wall', 'Earth Temple', 'Lava'),
    t('#9a8070', '#6a5a3a', '#6a4a3a', '#5a8ab0', '#4a3a34', '#a07050', '#e0502a'), { forest: 0.5, mountain: 5, water: 'none', walls: 3, forts: 1, lava: true }),
  r('lanayruDesert', 'Lanayru Desert', 'Timeshift Fields · machinery · electric enemies',
    'Sand over an ancient civilisation. Strike a Timeshift Stone and the past — robots, rivers, green fields — comes back.',
    '#d8b870', t('Sand', 'Dry Scrub', 'Dune', 'Oasis', 'Sandstone', 'Mining Facility', 'Quicksand'),
    t('#e0c890', '#9a9a5a', '#c8a868', '#5aa0b0', '#a88a60', '#9a8a70', '#b08a50'), { forest: 0.5, mountain: 3, water: 'none', walls: 3, forts: 2 }),
  r('lanayruSandSea', 'Lanayru Sand Sea', 'Ancient naval combat · boarding',
    'A sea of sand that is a real sea in the past. Skipper\'s boat, pirate robots, and the Sandship somewhere out there.',
    '#c8b080', t('Sand Bar', 'Shipwreck', 'Rock Outcrop', 'Sand Sea', 'Hull Plating', 'Sandship Deck', 'Engine Fire'),
    t('#d8c090', '#8a7a5a', '#a8986a', '#c8a870', '#7a6a5a', '#a08060', '#d07040'), { forest: 0.5, mountain: 1, water: 'many', walls: 3, forts: 2 }),
  r('ancientCistern', 'Ancient Cistern', 'Sacred water · undead · constructs',
    'A temple of white stone and lotus pools above a basement full of cursed Bokoblins.',
    '#8ac0c8', t('Marble Floor', 'Lotus Garden', 'Raised Dais', 'Sacred Pool', 'Temple Wall', 'Statue Hall', 'Cursed Water'),
    t('#d0d8d0', '#6aa080', '#b0b0a8', '#5ab0c8', '#9a9a9a', '#d0c8a0', '#6a4a7a'), { forest: 1, mountain: 1, water: 'many', walls: 4, forts: 1 }),
  r('fireSanctuary', 'Fire Sanctuary', 'Magma hazards · Mogma recruitment',
    'The volcano\'s summit temple, bridges of rock over magma, Mogmas hiding in every wall.',
    '#d0503a', t('Scorched Stone', 'Ash Thicket', 'Magma Rock', 'Cooling Pool', 'Sanctuary Wall', 'Fire Altar', 'Magma'),
    t('#9a7060', '#5a4a3a', '#7a3a2a', '#5a7a9a', '#4a2a24', '#b06040', '#f0502a'), { forest: 0.3, mountain: 4, water: 'none', walls: 4, forts: 1, lava: true }),
  r('sealedGrounds', 'Sealed Grounds', 'Defensive warfare · seal restoration',
    'A spiral pit around the Sealed Temple, where the Imprisoned keeps climbing out and Groose keeps a catapult ready.',
    '#8a7a6a', t('Spiral Path', 'Dead Trees', 'Pit Wall', 'Seal Pool', 'Barricade', 'Sealed Temple', 'Demon Fire'),
    t('#a09080', '#5a5a4a', '#7a6a5a', '#4a6a8a', '#6a5a4a', '#b0a080', '#a03030'), { forest: 1, mountain: 3, water: 'none', walls: 3, forts: 2 }),
  r('skyKeep', 'Sky Keep', 'Mechanism-heavy battles · sacred trials',
    'A sliding-room fortress of the goddess, last stronghold before the Triforce. Every room is a trial.',
    '#b0b8e0', t('Keep Floor', 'Sky Garden', 'Machinery', 'Open Sky', 'Keep Wall', 'Triforce Chamber', 'Sacred Fire'),
    t('#c8c8d8', '#7a9a8a', '#8a8aa0', '#eef4ff', '#7a7a9a', '#e0d090', '#e0a050'), { forest: 1, mountain: 2, water: 'many', walls: 5, forts: 2 }),
  r('demonsRealm', "Demon's Realm", 'High-level demonic encounters',
    'A dark lake under a storm of lightning, outside time. Demise waits with his sword drawn.',
    '#4a3a5a', t('Dark Shore', 'Black Reeds', 'Storm Rock', 'Dark Lake', 'Shadow Wall', 'Demon Altar', 'Black Flame'),
    t('#4a4a5a', '#2a3a3a', '#5a5a6a', '#2a3a5a', '#1a1a2a', '#6a4a6a', '#a03050'), { forest: 0.5, mountain: 2, water: 'lake', walls: 3, forts: 1 }),
];
