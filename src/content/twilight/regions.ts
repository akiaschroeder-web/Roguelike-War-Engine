import type { BaseTerrain, MapStyle, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'twilight' });

/** Provinces that the Twilight covers until their Light Spirit is restored. */
export const TWILIT_PROVINCES: Record<string, string> = { faronWoods: 'faron', eldinProvince: 'eldin', lanayruProvince: 'lanayru', ordonProvince: 'ordona' };

export const REGIONS: WorldDef[] = [
  r('ordonProvince', 'Ordon Province', 'Farmland · forests · introductory raids',
    'Goat pastures, a spring, and a village that has never seen war. The Bulblins are coming.',
    '#8ac05a', t('Pasture', 'Ordon Woods', 'Hillside', 'Ordon Spring', 'Fence', 'Ranch House', 'Bonfire'),
    t('#9ac56a', '#3f7a34', '#8a8a5a', '#5aa0d0', '#8a6a4a', '#b08a5a', '#c05a2a'), { forest: 4, mountain: 1, water: 'lake', walls: 1, forts: 1 }),
  r('faronWoods', 'Faron Woods', 'Poisonous fog · Twilight · dense forest',
    'The forest south of Hyrule Field, thick with purple fog. At its heart the Forest Temple, and Diababa.',
    '#4a8a4a', t('Forest Path', 'Faron Thicket', 'Mossy Rocks', 'Swamp', 'Root Wall', 'Old Temple', 'Burning Brush'),
    t('#6a9a5a', '#2a5a2a', '#6a7a5a', '#4a7a6a', '#4a3a2a', '#8a7a5a', '#c05a2a'), { forest: 7, mountain: 1, water: 'river', walls: 2, forts: 1 }),
  r('eldinProvince', 'Eldin Province', 'Mountain warfare · magnetic surfaces · volcanic hazards',
    'Kakariko Village and Death Mountain, where the Gorons have turned against outsiders and the mountain glows.',
    '#b07a4a', t('Dirt Road', 'Scrub', 'Death Mountain', 'Hot Spring', 'Rock Face', 'Kakariko House', 'Magma'),
    t('#a08a62', '#5a6a3a', '#7a5a4a', '#5a8ab0', '#5a4a40', '#a07a5a', '#d0502a'), { forest: 1, mountain: 6, water: 'none', walls: 3, forts: 2, lava: true }),
  r('lanayruProvince', 'Lanayru Province', 'Aquatic warfare · frozen waterways · sunken ruins',
    'Lake Hylia and Zora\'s Domain, frozen solid by a falling Twilight fragment. The Lakebed Temple lies beneath.',
    '#4a8ac0', t('Shore', 'Reeds', 'Cliff', 'Lake Hylia', 'Ruin Wall', 'Zora Hall', 'Hot Spring'),
    t('#9ab08a', '#4a7a5a', '#7a7a7a', '#3a7ab0', '#6a6a7a', '#7a9ab0', '#d07a4a'), { forest: 1, mountain: 2, water: 'many', walls: 2, forts: 1 }),
  r('hyruleFieldTP', 'Hyrule Field', 'Large-scale mounted warfare · open battlefields',
    'The great plain between the provinces, ruled by Bulblin horsemen and King Bulblin on his armored boar.',
    '#9aba6a', t('Grassland', 'Copse', 'Ridge', 'River', 'Ruined Wall', 'Bridge Fort', 'Brushfire'),
    t('#a0c070', '#4a7a3a', '#9a8a62', '#4a9ad0', '#7a6a58', '#b08a5a', '#c05a2a'), { forest: 1.5, mountain: 1, water: 'river', walls: 1, forts: 2 }),
  r('gerudoDesertTP', 'Gerudo Desert', 'Sinking sand · undead armies · Spinner rails',
    'The desert where the Sages once tried to execute Ganondorf. The Arbiter\'s Grounds hold the Mirror of Twilight.',
    '#d0b06a', t('Sand', 'Dry Brush', 'Dune', 'Oasis', 'Sandstone', 'Arbiter\'s Grounds', 'Quicksand'),
    t('#d8c088', '#8a8a4a', '#c0a060', '#4a9ab0', '#a08060', '#b09060', '#a08050'), { forest: 0.5, mountain: 2, water: 'none', walls: 3, forts: 2 }),
  r('snowpeak', 'Snowpeak', 'Snowstorms · ice puzzles · heavy monsters',
    'A frozen mountain and its ruined mansion, where a yeti cooks soup for his ailing wife.',
    '#c0d8e8', t('Snowfield', 'Frozen Pines', 'Snowpeak', 'Frozen Lake', 'Ice Wall', 'Snowpeak Ruins', 'Hearth'),
    t('#e0e8f0', '#6a8a8a', '#b0c0d0', '#8ab0d0', '#a0b0c0', '#b0a090', '#d07a4a'), { forest: 2, mountain: 4, water: 'lake', walls: 3, forts: 1 }),
  r('sacredGrove', 'Sacred Grove and Temple of Time', 'Ancient constructs · Dominion Statues · light mechanisms',
    'The forest where the Master Sword rests, and the Temple of Time hidden in another age.',
    '#6aa08a', t('Mossy Stone', 'Sacred Grove', 'Ruined Steps', 'Spring', 'Temple Wall', 'Pedestal', 'Brazier'),
    t('#8aa080', '#2a6a4a', '#8a8a7a', '#4a9ab0', '#8a8a8a', '#c0b080', '#c05a2a'), { forest: 5, mountain: 1, water: 'none', walls: 4, forts: 1 }),
  r('cityInTheSky', 'City in the Sky', 'Aerial combat · wind hazards · Clawshot traversal',
    'The Oocca\'s floating city, held aloft by ancient power and now ruled by Argorok.',
    '#9ac0e0', t('Walkway', 'Hanging Garden', 'Tower', 'Cloud Gap', 'Sky Wall', 'Oocca Hall', 'Sun Furnace'),
    t('#c0d0e0', '#6a9a7a', '#a0a0b0', '#e8f0ff', '#8a9ab0', '#b0b0a0', '#d0a050'), { forest: 1, mountain: 2, water: 'many', walls: 4, forts: 2 }),
  r('twilightRealm', 'Twilight Realm', 'Corrupted terrain · shadow armies · teleportation',
    'The Palace of Twilight, a world of black-and-orange squares and drifting light where Zant sits on Midna\'s throne.',
    '#5a4a6a', t('Twilight Floor', 'Shadow Trees', 'Floating Rock', 'Twilight Pool', 'Black Wall', 'Palace Hall', 'Sol Light'),
    t('#4a4a5a', '#2a3a4a', '#5a5a6a', '#3a3a6a', '#1a1a2a', '#6a5a7a', '#e0a040'), { forest: 1, mountain: 2, water: 'lake', walls: 5, forts: 2 }),
  r('hyruleCastleTP', 'Hyrule Castle', 'Siege warfare · elite formations',
    'Hyrule Castle, sealed in a barrier of Twilight. Ganondorf waits in the throne room.',
    '#8a6a8a', t('Courtyard', 'Garden', 'Rampart', 'Moat', 'Castle Wall', 'Keep', 'Torch'),
    t('#9a8a8a', '#4a6a4a', '#7a6a6a', '#3a5a7a', '#4a4a5a', '#8a7a8a', '#c05a2a'), { forest: 1, mountain: 1, water: 'moat', walls: 7, forts: 3 }),
];
