import type { BaseTerrain, MapStyle, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, layer: 'surface' | 'sky' | 'depths', genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'wild', layer });

/** Sky regions: the open "water" tiles are the sky (only flyers cross; falling is a hazard). */
export const WILD_SKY = ['greatSkyIsland', 'skyArchipelago'];
/** Depths regions: Gloom, darkness and Zonaite. */
export const WILD_DEPTHS = ['depthsMines', 'spiritTemple', 'gloomsOrigin'];
/** Climate hazards (cold, heat, volcanic, storm) by region. */
export const WILD_CLIMATE: Record<string, 'cold' | 'hot' | 'volcanic' | 'storm' | undefined> = {
  hebra: 'cold', gerudoWild: 'hot', eldinWild: 'volcanic', faronWild: 'storm', lanayruWild: 'storm', akkala: undefined,
};

export const REGIONS: WorldDef[] = [
  // ── Surface ──
  r('greatPlateau', 'Great Plateau', 'surface', 'Tutorial · ruined temples · Sheikah technology',
    'A walled plateau above Hyrule Field, where the Temple of Time lies in ruins and an old man cooks by the fire.',
    '#8ab060', t('Meadow', 'Pine Woods', 'Plateau Cliff', 'Pond', 'Plateau Wall', 'Temple of Time', 'Bonfire'),
    t('#98b868', '#3f7a3a', '#8a8070', '#5a90b8', '#7a7466', '#b8a888', '#d07040'), { forest: 3, mountain: 2, water: 'lake', walls: 2, forts: 1 }),
  r('centralHyrule', 'Central Hyrule', 'surface', 'Guardian warfare · monster armies',
    'Hyrule Field around the ruined castle: Guardians stalk the grass and monster camps sit on every hill.',
    '#a0a060', t('Hyrule Field', 'Copse', 'Ruined Hill', 'River', 'Ruined Wall', 'Outpost Ruins', 'Burning Field'),
    t('#a8b070', '#4a7a40', '#8a8478', '#5a8ab0', '#6a6458', '#9a9080', '#c86a3a'), { forest: 2, mountain: 2, water: 'river', walls: 3, forts: 2 }),
  r('hyruleCastleWild', 'Hyrule Castle', 'surface', 'Royal gear · elite monsters · Malice',
    'The castle wrapped in Malice, then lifted into the sky: libraries, barracks, the Sanctum, and Gloom under all of it.',
    '#8a6a8a', t('Castle Floor', 'Overgrown Garden', 'Broken Rampart', 'Moat', 'Castle Wall', 'Sanctum', 'Malice'),
    t('#9a9090', '#5a6a4a', '#7a6a6a', '#4a6a8a', '#5a4a5a', '#b0a070', '#8a2a6a'), { forest: 1, mountain: 2, water: 'moat', walls: 6, forts: 2 }),
  r('hateno', 'Hateno', 'surface', 'Research · farming · services',
    'A quiet village of farms, a dye shop and the Ancient Tech Lab on the hill, where Purah blows things up on purpose.',
    '#9ac080', t('Farmland', 'Orchard', 'Hillside', 'Hateno Bay', 'Stone Fence', 'Tech Lab', 'Hearth'),
    t('#a8c878', '#5a9a4a', '#9a9078', '#4a90c0', '#8a8070', '#b8a078', '#d07040'), { forest: 2, mountain: 1.5, water: 'lake', walls: 2, forts: 1 }),
  r('kakarikoWild', 'Kakariko', 'surface', 'Sheikah recruitment · ruins · Yiga',
    'The Sheikah village in its misty valley, lanterns lit, with Yiga spies in every crowd.',
    '#c0a070', t('Village Path', 'Bamboo Grove', 'Valley Wall', 'Spring', 'Wooden Fence', "Impa's House", 'Lantern Fire'),
    t('#b0a078', '#5a8a4a', '#8a7a6a', '#5a8ab0', '#7a5a3a', '#b08a5a', '#d08040'), { forest: 3, mountain: 3, water: 'river', walls: 2, forts: 1 }),
  r('akkala', 'Akkala', 'surface', 'Ancient tech · fortified ruins · Guardians',
    'Autumn-red forests around the ruined citadel, Tarrey Town on its lake island, and the Akkala Ancient Tech Lab.',
    '#c07040', t('Red Meadow', 'Autumn Woods', 'Citadel Cliff', 'Lake Akkala', 'Citadel Wall', 'Fortress Ruins', 'Burning Brush'),
    t('#b89060', '#a05030', '#8a7060', '#4a7aa0', '#6a5a50', '#9a8070', '#d06030'), { forest: 3, mountain: 2, water: 'lake', walls: 5, forts: 2 }),
  r('lanayruWild', 'Lanayru', 'surface', 'Aquatic warfare · sludge · Zora',
    'Zora\'s Domain and its rivers, under endless rain — or under sludge, when the Mucktorok comes.',
    '#5aa0c8', t('Luminous Stone', 'Wetland', 'Rain Cliff', 'River', 'Domain Wall', "Zora's Domain", 'Malice'),
    t('#8ab0b8', '#4a8a7a', '#7a8a9a', '#3a80c0', '#6a8090', '#a0c0d0', '#7a3a7a'), { forest: 1.5, mountain: 2, water: 'many', walls: 2, forts: 1 }),
  r('eldinWild', 'Eldin', 'surface', 'Mining · volcanic heat · lava',
    'Death Mountain and Goron City: lava rivers, mining carts, ore everywhere, and heat that sets clothes alight.',
    '#c05a30', t('Ash Slope', 'Scorched Shrubs', 'Death Mountain', 'Hot Spring', 'Basalt', 'Goron City', 'Lava'),
    t('#9a7a68', '#6a5a3a', '#6a4434', '#5a8ab0', '#4a3a34', '#a06a4a', '#e8502a'), { forest: 0.5, mountain: 5, water: 'none', walls: 3, forts: 1, lava: true }),
  r('hebra', 'Hebra', 'surface', 'Snowstorms · aerial · freezing',
    'Snowfields and frozen peaks above Rito Village, with blizzards that freeze anyone not dressed for them.',
    '#c8d8e8', t('Snowfield', 'Frozen Pines', 'Hebra Peak', 'Frozen Lake', 'Ice Wall', 'Rito Village', 'Campfire'),
    t('#e0e8f0', '#5a7a7a', '#a0a8b8', '#8ab8d8', '#a8b8c8', '#c0a878', '#d08050'), { forest: 1.5, mountain: 4, water: 'lake', walls: 2, forts: 1 }),
  r('gerudoWild', 'Gerudo Desert', 'surface', 'Sand · heat · lightning',
    'Dunes and a walled city of women warriors; by day the heat, by night the cold, and lightning storms on the plateau.',
    '#e0c070', t('Sand Dunes', 'Oasis Palms', 'Desert Mesa', 'Oasis', 'Sandstone', 'Gerudo Town', 'Quicksand'),
    t('#e8d098', '#8aa050', '#c8a068', '#5aa0b0', '#b08a5a', '#c8a070', '#b08a50'), { forest: 0.5, mountain: 2, water: 'none', walls: 3, forts: 2 }),
  r('faronWild', 'Faron', 'surface', 'Jungle · storms · dragons',
    'Hot, wet jungle around Lake Floria, rained on all day, with a dragon that dives out of the lake.',
    '#4a9a5a', t('Jungle Floor', 'Rainforest', 'Floria Cliffs', 'Lake Floria', 'Root Wall', 'Lurelin Ruins', 'Burning Vine'),
    t('#7aa860', '#2a6a3a', '#7a8a6a', '#3a8aa0', '#4a4a30', '#9a9a70', '#c05a2a'), { forest: 6, mountain: 1.5, water: 'lake', walls: 2, forts: 1 }),
  r('necluda', 'Necluda', 'surface', 'Rural settlements · monster camps',
    'Rolling farmland between Kakariko and Hateno, Bokoblin camps on the hills and a Hinox asleep under a tree.',
    '#9ab868', t('Pasture', 'Woodland', 'Rolling Hills', 'Stream', 'Old Fence', 'Stable', 'Campfire'),
    t('#a0c070', '#4a8a40', '#8a8a6a', '#5a90b8', '#7a6a50', '#b09060', '#d07040'), { forest: 3, mountain: 2, water: 'river', walls: 2, forts: 1 }),
  r('greatHyruleForest', 'Great Hyrule Forest', 'surface', 'Korok puzzles · forest corruption',
    'The Lost Woods and the Korok Forest around the Great Deku Tree — and, lately, Gloom creeping between the roots.',
    '#3a7a4a', t('Forest Floor', 'Great Trees', 'Mossy Rock', 'Forest Pool', 'Root Wall', 'Deku Tree', 'Gloom Fire'),
    t('#6a9a5a', '#1e5a2a', '#6a7a5a', '#4a7aa0', '#3a3a24', '#8a9a60', '#8a2a3a'), { forest: 8, mountain: 1, water: 'lake', walls: 1, forts: 1 }),
  // ── Sky ──
  r('greatSkyIsland', 'Great Sky Island', 'sky', 'Zonai tech · construction trials',
    'A ring of sky islands with a Temple of Time of its own, Zonai devices in every ruin, and constructs on patrol.',
    '#b8e0f0', t('Sky Grass', 'Sky Grove', 'Zonai Ruin', 'Open Sky', 'Zonai Wall', 'Temple of Time', 'Zonai Forge'),
    t('#b0d888', '#6aa060', '#a8a898', '#eef8ff', '#8a9a90', '#d0c098', '#e0a050'), { forest: 1, mountain: 2, water: 'lake', walls: 2, forts: 1 }),
  r('skyArchipelago', 'Sky Archipelagos', 'sky', 'Aerial exploration · floating fortresses',
    'Scattered islands high over Hyrule: Gleeoks circling, sky platforms drifting, and the long way down.',
    '#c8e8ff', t('Island Turf', 'Island Grove', 'Floating Rock', 'Open Sky', 'Ruined Platform', 'Sky Fortress', 'Storm Fire'),
    t('#b8d890', '#70a868', '#b0b0b8', '#f4faff', '#9a9aa8', '#d0c090', '#e08050'), { forest: 0.5, mountain: 2.5, water: 'many', walls: 2, forts: 1 }),
  // ── Depths ──
  r('depthsMines', 'Abandoned Depths Mines', 'depths', 'Mining · Yiga vehicle warfare · Zonaite',
    'Pitch-black caverns under Hyrule full of Zonaite, Lightroots, abandoned mines and a Yiga hideout full of vehicles.',
    '#4a3a5a', t('Depths Floor', 'Glowing Fungus', 'Cavern Wall', 'Gloom Lake', 'Mine Shaft', 'Abandoned Mine', 'Gloom'),
    t('#4a4450', '#3a4a3a', '#3a3440', '#3a2a40', '#2a2430', '#6a5a4a', '#7a1a2a'), { forest: 0.5, mountain: 3, water: 'none', walls: 4, forts: 2 }),
  r('spiritTemple', 'Spirit Temple', 'depths', 'Construct trials · Zonai machinery',
    'Mineru\'s temple deep in the Depths, where a construct of hers has been seized by Gloom.',
    '#5a6a8a', t('Temple Floor', 'Zonai Moss', 'Machinery', 'Gloom Pool', 'Temple Wall', 'Spirit Sanctum', 'Gloom'),
    t('#5a5a6a', '#3a5a4a', '#4a4a5a', '#3a2a40', '#3a3a4a', '#7a7a90', '#7a1a2a'), { forest: 0.5, mountain: 2, water: 'none', walls: 5, forts: 1 }),
  r('gloomsOrigin', "Gloom's Origin", 'depths', 'Final demonic campaign',
    'Beneath Hyrule Castle, in the dark at the bottom of everything, the Demon King waits.',
    '#5a1a2a', t('Gloom-Soaked Stone', 'Dead Roots', 'Abyss Rock', 'Gloom Pool', 'Ancient Wall', "Demon King's Throne", 'Gloom'),
    t('#4a2a30', '#2a1a1a', '#3a2028', '#5a0a1a', '#1a0a10', '#6a2a3a', '#9a1a2a'), { forest: 0.3, mountain: 2, water: 'lake', walls: 3, forts: 1 }),
  // ── Surface challenge ──
  r('finalTrial', 'Final Trial', 'surface', 'Sheikah challenges · Trial of the Sword',
    'The Champions\' Ballad trials and the Trial of the Sword, ending at Monk Maz Koshia\'s shrine.',
    '#d0a050', t('Shrine Floor', 'Sacred Grove', 'Trial Pillar', 'Sacred Water', 'Shrine Wall', "Monk's Altar", 'Blue Flame'),
    t('#b0a890', '#5a8a6a', '#8a8070', '#5aa0c0', '#6a6a7a', '#d0b070', '#5a8ae0'), { forest: 1, mountain: 2, water: 'river', walls: 4, forts: 1 }),
];
