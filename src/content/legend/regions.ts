import type { BaseTerrain, MapStyle, Terrain, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'legend' });

const FIELD: MapStyle = { forest: 3, mountain: 1.5, water: 'river', walls: 1, forts: 1 };
const DUNGEON: MapStyle = { forest: 0.5, mountain: 1, water: 'none', walls: 5, forts: 1 };
const TOWN: MapStyle = { forest: 2, mountain: 0.5, water: 'lake', walls: 3, forts: 2 };
const OVERWORLD = t('Grass', 'Trees', 'Rocks', 'Water', 'Cliff', 'House', 'Lava');
const OVER_C = t('#6ab04a', '#2e7a32', '#8a7a5a', '#3a7ac0', '#5a4a3a', '#a07a50', '#d0502a');
const PALACE = t('Stone Floor', 'Shrubbery', 'Statue', 'Moat', 'Palace Wall', 'Chamber', 'Fire Pit');

/** The four routes, in order. */
export const LIGHT_AND_DARK = ['hyruleCastleLttP', 'easternPalace', 'desertPalace', 'deathMountainLttP', 'darkWorld', 'ganonsTowerLttP'];
export const DREAM_OF_KOHOLINT = ['mabeVillage', 'mysteriousForest', 'animalVillage', 'talTalHeights', 'windFishsEgg'];
export const SEASONS_OF_HOLODRUM = ['horonVillage', 'natzu', 'subrosia', 'tarmRuins', 'templeOfSeasons'];
export const AGES_OF_LABRYNNA = ['lynnaCity', 'lynnaVillage', 'crescentIsland', 'rollingRidge', 'zoraSeas', 'blackTower'];
export const ROOM_OF_RITES = 'roomOfRites';
export const LEGEND_REGION_IDS = [...LIGHT_AND_DARK, ...DREAM_OF_KOHOLINT, ...SEASONS_OF_HOLODRUM, ...AGES_OF_LABRYNNA, ROOM_OF_RITES];

/** Light World / Dark World: these maps have a linked second version (portals, the Moon Pearl, the Magic Mirror).
 *  'dark' starts in the Dark World. */
export const WORLD_LINKED: Record<string, 'light' | 'dark'> = { deathMountainLttP: 'light', darkWorld: 'dark', ganonsTowerLttP: 'dark', hyruleCastleLttP: 'light' };
/** Holodrum's maps have seasons (the Rod of Seasons, Din and Tree Stumps change them). */
export const SEASONAL = new Set([...SEASONS_OF_HOLODRUM, ROOM_OF_RITES]);
/** Labrynna's maps have a past and a present (the Harp of Ages and Time Portals). */
export const TIMEWORN = new Set(AGES_OF_LABRYNNA);
/** Koholint: Owl Statues and the Wind Fish's dream. */
export const KOHOLINT = new Set(DREAM_OF_KOHOLINT);

/** Battlefield spaces placed in each region. */
export const LEGEND_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  hyruleCastleLttP: { crystalSwitch: 1, crystalBarrier: 3, woodenStake: 1, darkPortal: 1 },
  easternPalace: { crystalSwitch: 1, crystalBarrier: 2, woodenStake: 2, invisibleFloor: 1 },
  desertPalace: { woodenStake: 2, invisibleFloor: 2, crystalSwitch: 1, crystalBarrier: 2 },
  deathMountainLttP: { darkPortal: 1, crystalSwitch: 1, crystalBarrier: 3, woodenStake: 1 },
  darkWorld: { lightPortal: 1, woodenStake: 2, somariaBlock: 1, invisibleFloor: 1, crystalSwitch: 1, crystalBarrier: 2 },
  ganonsTowerLttP: { lightPortal: 1, crystalSwitch: 2, crystalBarrier: 4, invisibleFloor: 2, somariaBlock: 1 },
  mabeVillage: { owlStatue: 1, softSoil: 1, underwaterFloor: 2 },
  mysteriousForest: { owlStatue: 1, softSoil: 2, crystalSwitch: 1, crystalBarrier: 2 },
  animalVillage: { owlStatue: 1, softSoil: 1, magneticOrb: 1, woodenStake: 1 },
  talTalHeights: { owlStatue: 2, crystalSwitch: 1, crystalBarrier: 2, invisibleFloor: 1 },
  windFishsEgg: { owlStatue: 1, invisibleFloor: 3 },
  horonVillage: { treeStump: 2, seedTree: 1, softSoil: 1, seasonalFlower: 1, seasonalSnowbank: 1, seasonalMushroom: 1 },
  natzu: { treeStump: 1, seedTree: 1, seasonalFlower: 2, seasonalMushroom: 1, softSoil: 1 },
  subrosia: { seedTree: 1, magneticOrb: 1, magneticRail: 2, softSoil: 1 },
  tarmRuins: { treeStump: 2, seedTree: 1, seasonalSnowbank: 2, seasonalMushroom: 1, softSoil: 1 },
  templeOfSeasons: { treeStump: 1, seasonalFlower: 1, seasonalSnowbank: 1, seasonalMushroom: 1, crystalSwitch: 1, crystalBarrier: 2 },
  lynnaCity: { timePortal: 1, seedTree: 1, softSoil: 2, switchHookTarget: 1 },
  lynnaVillage: { timePortal: 1, softSoil: 1, switchHookTarget: 2, crystalSwitch: 1, crystalBarrier: 2 },
  crescentIsland: { timePortal: 1, seedTree: 1, softSoil: 1, switchHookTarget: 1, underwaterFloor: 1 },
  rollingRidge: { timePortal: 1, switchHookTarget: 2, magneticOrb: 1, magneticRail: 1, softSoil: 1 },
  zoraSeas: { timePortal: 1, underwaterFloor: 4, switchHookTarget: 1 },
  blackTower: { timePortal: 1, switchHookTarget: 2, crystalSwitch: 1, crystalBarrier: 3 },
  roomOfRites: { treeStump: 1, timePortal: 1, invisibleFloor: 2 },
};

export const REGIONS: WorldDef[] = [
  // ── Light and Dark (A Link to the Past) ──
  r('hyruleCastleLttP', 'Hyrule Castle (Era of Legend)', "Soldiers · Agahnim's guards · Wizzrobes", 'A storm over the castle, the princess in the dungeon, and a wizard on the throne\'s ear.',
    '#5a7ab0', PALACE, t('#8a8aa0', '#3a6a3a', '#7a7a8a', '#2a4a8a', '#3a3a5a', '#9a8a70', '#d06030'), { ...DUNGEON, forest: 1, water: 'moat' }),
  r('easternPalace', 'Eastern Palace', 'Stalfos · Armos Knights · Anti-Fairies', 'The first palace of the Pendants, east of Kakariko, where Sahasrahla waits.',
    '#a08a50', PALACE, t('#b0a070', '#5a7a3a', '#8a8a6a', '#3a5a7a', '#5a4a2a', '#b09a70', '#d06030'), DUNGEON),
  r('desertPalace', 'Desert Palace', 'Leevers · Lanmolas · Gibdos', 'In the Desert of Mystery, a palace only the Book of Mudora opens.',
    '#d0a050', t('Sand', 'Cactus', 'Dune', 'Oasis', 'Sandstone Wall', 'Ruin', 'Hot Sand'), t('#d8b870', '#6a8a3a', '#c09a5a', '#3a8aa0', '#8a6a3a', '#b08a5a', '#e07030'), { forest: 0.6, mountain: 2, water: 'none', walls: 3, forts: 1 }),
  r('deathMountainLttP', 'Death Mountain (Era of Legend)', 'Tektites · Lynels · the Tower of Hera', 'The Old Man\'s path up the mountain, the Magic Mirror, and the Tower of Hera at the summit.',
    '#8a6a5a', t('Rock Path', 'Shrub', 'Crag', 'Spring', 'Cliff', 'Tower', 'Lava'), t('#9a8a7a', '#5a6a3a', '#7a6a5a', '#4a6a9a', '#4a3a2a', '#a08a70', '#e0502a'), { forest: 1, mountain: 4, water: 'none', walls: 2, forts: 1 }),
  r('darkWorld', 'The Dark World', 'Moblins · Wizzrobes · the seven Crystal Maidens', 'The Golden Land turned to darkness by Ganon\'s wish. Without the Moon Pearl you are a rabbit here.',
    '#6a4a8a', t('Dead Grass', 'Twisted Trees', 'Dark Rocks', 'Murky Water', 'Cliff', 'Hut', 'Lava'), t('#7a6a4a', '#4a3a5a', '#6a5a6a', '#3a3a6a', '#3a2a3a', '#7a5a6a', '#d04030'), FIELD),
  r('ganonsTowerLttP', "Ganon's Tower (Era of Legend)", 'Wizzrobes · Darknuts · the King of Darkness', 'The tower on Death Mountain\'s Dark World peak, where Agahnim waits again and Ganon flees to the Pyramid.',
    '#4a2a4a', PALACE, t('#5a4a5a', '#3a3a3a', '#5a4a5a', '#2a2a4a', '#1a1a2a', '#6a4a6a', '#e0402a'), { ...DUNGEON, walls: 6, lava: true }),
  // ── Dream of Koholint (Link's Awakening) ──
  r('mabeVillage', 'Mabe Village', 'Octoroks · Buzz Blobs · Moblins', 'Marin\'s village by Toronbo Shores, the Tail Cave, and a Chain Chomp who loves the sun.',
    '#7ac06a', OVERWORLD, OVER_C, TOWN),
  r('mysteriousForest', 'Mysterious Forest', 'Moblins · Cukemen · Zols', 'A raccoon who is really Tarin, sleepy toadstools, and the Bottle Grotto beyond the swamp.',
    '#3a7a4a', t('Moss', 'Dense Trees', 'Boulder', 'Swamp', 'Thicket', 'Hollow', 'Lava'), t('#5a9a4a', '#1e5a2a', '#6a6a4a', '#3a6a5a', '#2a3a2a', '#7a6a40', '#d0502a'), { ...FIELD, forest: 6 }),
  r('animalVillage', 'Animal Village', 'Pols Voices · Stalfos · Wizzrobes', 'A village of talking animals on the edge of the Yarna Desert, near the Catfish\'s Maw.',
    '#c0a060', t('Sand', 'Palm', 'Dune', 'Pond', 'Rock Wall', 'House', 'Hot Sand'), t('#d0b878', '#5a8a3a', '#b09060', '#3a8ab0', '#7a6040', '#b08050', '#e07030'), { forest: 1, mountain: 2, water: 'lake', walls: 2, forts: 2 }),
  r('talTalHeights', 'Tal Tal Heights', 'Tektites · Moldorms · Meteo Wizzrobes', 'The high mountains of Koholint: Eagle\'s Tower, Turtle Rock and the egg on Mt. Tamaranch above them.',
    '#8a7a9a', t('Mountain Path', 'Shrub', 'Peak', 'Mountain Stream', 'Cliff', 'Tower', 'Lava'), t('#9a8a8a', '#4a6a4a', '#7a6a7a', '#4a6aa0', '#4a3a4a', '#9a8aa0', '#e0502a'), { forest: 1, mountain: 4, water: 'river', walls: 2, forts: 1, lava: true }),
  r('windFishsEgg', "The Wind Fish's Egg", 'Nightmares · Bubbles · Anti-Fairies', 'Inside the egg, a maze of dream; at its heart the Shadow Nightmare, wearing the faces of every enemy you ever had.',
    '#d0c0e8', t('Dream Floor', 'Shadow', 'Echo', 'Void', 'Shell Wall', 'Heart', 'Nightmare'), t('#c8b8e0', '#5a4a7a', '#9a8ab0', '#2a2a4a', '#6a5a8a', '#e0d0f0', '#8a2a6a'), { ...DUNGEON, walls: 4 }),
  // ── Seasons of Holodrum (Oracle of Seasons) ──
  r('horonVillage', 'Horon Village', "Octoroks · Moblins · Onox's soldiers", 'Holodrum\'s capital around the old Maku Tree, where the seasons have gone wrong.',
    '#8ac06a', OVERWORLD, OVER_C, TOWN),
  r('natzu', 'Natzu Region', 'Moblins · Tektites · Subterrors', 'Ricky\'s plains, Dimitri\'s river and Moosh\'s prairie: Holodrum\'s wild north.',
    '#a0b05a', OVERWORLD, t('#8ab05a', '#3e7a32', '#9a8a5a', '#3a7ac0', '#6a5a3a', '#a07a50', '#d0502a'), FIELD),
  r('subrosia', 'Subrosia', 'Smashers · Subterrors · Fire Keese', 'The lava world under Holodrum, full of hooded Subrosians who dance, dig and trade ore.',
    '#c05a3a', t('Basalt', 'Mushroom', 'Rock', 'Lava Pool', 'Cave Wall', 'Subrosian Hut', 'Lava'), t('#7a5a4a', '#8a4a3a', '#6a4a3a', '#d06030', '#3a2a2a', '#9a6a5a', '#e0502a'), { forest: 1, mountain: 2, water: 'many', walls: 3, forts: 1, lava: true }),
  r('tarmRuins', 'Tarm Ruins', 'Darknuts · Lynels · Iron Knuckles', 'Ruins in the north of Holodrum, where the Lost Woods turn the seasons over and the Explorer\'s Crypt waits.',
    '#7a8a6a', t('Old Stone', 'Overgrowth', 'Ruin', 'Pond', 'Ruined Wall', 'Shrine', 'Lava'), t('#8a9a7a', '#3a6a3a', '#7a7a6a', '#3a6a9a', '#4a4a3a', '#9a8a7a', '#d0502a'), { forest: 3, mountain: 2, water: 'river', walls: 3, forts: 1 }),
  r('templeOfSeasons', 'Temple of Seasons', "Onox's Castle · Iron Knuckles · Darknuts", 'The sunken temple and the castle above it, where Onox holds Din in crystal.',
    '#5a5a7a', PALACE, t('#7a7a8a', '#3a5a3a', '#6a6a7a', '#3a4a7a', '#2a2a3a', '#8a7a8a', '#e04030'), { ...DUNGEON, walls: 6 }),
  // ── Ages of Labrynna (Oracle of Ages) ──
  r('lynnaCity', 'Lynna City', 'Octoroks · Moblins · Buzz Blobs', 'The town around the Maku Tree — or the young sprout she was four hundred years ago.',
    '#7ab08a', OVERWORLD, OVER_C, TOWN),
  r('lynnaVillage', 'Lynna Village (the Past)', 'Stalfos · Goriyas · Ambi\'s guards', 'Four hundred years ago, the village under Queen Ambi\'s Black Tower: workers, soldiers and a shadow over the queen.',
    '#a09a6a', OVERWORLD, t('#9ab06a', '#3e6a32', '#8a7a5a', '#3a6aa0', '#5a4a3a', '#a07a50', '#d0502a'), TOWN),
  r('crescentIsland', 'Crescent Island', 'Tektites · Subterrors · Tokay country', 'An island of thieving lizard-folk, Gale Seeds and the Moonlit Grotto.',
    '#c0b070', t('Sand', 'Palm', 'Dune', 'Sea', 'Rock', 'Hut', 'Lava'), t('#d8c880', '#4a8a3a', '#b0a070', '#3a8ac0', '#7a6a4a', '#a08050', '#e07030'), { ...FIELD, water: 'many' }),
  r('rollingRidge', 'Rolling Ridge', 'Smashers · Darknuts · Thunder Wizzrobes', 'The Gorons\' mountain, Crown Dungeon on its peak and the Ancient Tomb below.',
    '#9a7a5a', t('Mountain Path', 'Shrub', 'Ridge', 'Spring', 'Cliff', 'Goron Hall', 'Lava'), t('#a08a6a', '#4a6a3a', '#8a6a4a', '#4a6aa0', '#4a3a2a', '#a0805a', '#e0502a'), { forest: 1, mountain: 4, water: 'none', walls: 2, forts: 1 }),
  r('zoraSeas', 'Zora Seas', 'Octoroks · Like Likes · Blizzrobes', 'The Zoras\' frozen village, Jabu-Jabu\'s Belly and the Sea of Storms.',
    '#3a7ab0', t('Ice Shelf', 'Kelp', 'Reef', 'Sea', 'Coral Wall', 'Zora Hall', 'Lava'), t('#a8d0e8', '#2a6a5a', '#6a8aa0', '#2a5aa0', '#3a4a6a', '#7aa0c0', '#d06030'), { forest: 1, mountain: 1, water: 'many', walls: 2, forts: 1 }),
  r('blackTower', 'The Black Tower', 'Iron Knuckles · Boss Wizzrobes · Veran', 'The tower Queen Ambi built for the Sorceress of Shadows, rising over present and past alike.',
    '#3a2a3a', PALACE, t('#5a4a5a', '#2a3a2a', '#5a4a5a', '#2a2a3a', '#1a1a1a', '#6a5a6a', '#e0402a'), { ...DUNGEON, walls: 6 }),
  // ── The Room of Rites (linked Oracle finale) ──
  r(ROOM_OF_RITES, 'The Room of Rites', 'Koume · Kotake · Twinrova · Ganon', 'Under Hyrule Castle, the Twinrova sisters light the Flames of Destruction, Sorrow and Despair to raise the King of Darkness.',
    '#8a2a3a', t('Altar Floor', 'Shadow', 'Pillar', 'Ice Pool', 'Altar Wall', 'Altar', 'Flame'), t('#6a3a4a', '#3a2a3a', '#7a5a6a', '#6aa0d0', '#2a1a2a', '#9a4a5a', '#e05030'), { forest: 0.5, mountain: 1, water: 'lake', walls: 3, forts: 1, lava: true }),
];
