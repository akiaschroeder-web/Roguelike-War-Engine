import type { BaseTerrain, MapStyle, Terrain, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'triforce' });

/** The Drablands, in order (section 8). */
export const TF_ROUTE = ['woodlandsTF', 'riversideTF', 'volcanoTF', 'iceCavernTF', 'fortressTF', 'dunesTF', 'ruinsTF', 'skyRealmTF', 'denOfTrialsTF'];
/** Sand regions (Dunewalker Duds). */
export const SANDY_TF = ['dunesTF', 'ruinsTF'];
/** Each region's material (section 5); the Dunes give Gold Dust (the existing pack item). */
export const REGION_MATERIAL: Record<string, string[]> = {
  woodlandsTF: ['sweetShroom'], riversideTF: ['freshKelp'], volcanoTF: ['lavaDrop', 'demonFossil'], iceCavernTF: ['snowflakeTF', 'freezardWater'],
  fortressTF: ['silverThread'], dunesTF: ['goldDust'], ruinsTF: ['stalSkull', 'monsterGutsTF'], skyRealmTF: ['divineWhiskers'], denOfTrialsTF: ['rareMetal'],
};

/** Battlefield spaces placed in each region's battles (section 7). */
export const TF_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  woodlandsTF: { totemPlatform: 2, elevatedSwitch: 1, outfitPedestal: 1 },
  riversideTF: { waterPillar: 2, gripshotTarget: 2, totemPlatform: 1 },
  volcanoTF: { totemPlatform: 2, gripshotTarget: 2, elevatedSwitch: 1 },
  iceCavernTF: { totemPlatform: 1, elevatedSwitch: 2, outfitPedestal: 1 },
  fortressTF: { triforceGateway: 1, elevatedSwitch: 2, totemPlatform: 1 },
  dunesTF: { gripshotTarget: 2, totemPlatform: 2, outfitPedestal: 1 },
  ruinsTF: { triforceGateway: 1, elevatedSwitch: 1, gripshotTarget: 2 },
  skyRealmTF: { totemPlatform: 2, gripshotTarget: 2, elevatedSwitch: 1 },
  denOfTrialsTF: { triforceGateway: 1, totemPlatform: 2, outfitPedestal: 2 },
};

export const REGIONS: WorldDef[] = [
  r('woodlandsTF', 'Woodlands', 'Moblins · Keeleons · Margoma', 'The Drablands\' first stage: a deep forest of moss and mushrooms, where the Hinox Brothers throw bombs and a spiked fortress spins under the trees.',
    '#6a9a4a', t('Mossy Path', 'Deep Woods', 'Tree Stump', 'Forest Pond', 'Root Wall', 'Totem Stage', 'Lava'), t('#9ac07a', '#3a7a3a', '#7a6a4a', '#4a8ad0', '#5a4a3a', '#a09060', '#d0502a'), { forest: 3, mountain: 0.5, water: 'lake', walls: 3, forts: 1 }),
  r('riversideTF', 'Riverside', 'Skullfish · Electric Blobs · Arrghus', 'Rivers and waterfalls between grassy islands, Water Rods and Water Pillars, and an eye surrounded by puffballs in the deepest pool.',
    '#4a9ac0', t('Riverbank', 'Reeds', 'Boulder', 'River', 'Cliff', 'Island', 'Lava'), t('#a8c890', '#5a9a5a', '#8a8a7a', '#3a7ac8', '#6a6a5a', '#b0a070', '#d0502a'), { forest: 1, mountain: 0.5, water: 'river', walls: 2, forts: 1 }),
  r('volcanoTF', 'Volcano', 'Fire Keeleons · Hokkubokku · Moldorm', 'Rivers of lava and crumbling rock under an ash sky: Goron Garb country, and Moldorm\'s nest at the top.',
    '#b04a2a', t('Basalt', 'Ash Field', 'Crag', 'Hot Spring', 'Lava Wall', 'Ledge', 'Lava'), t('#8a6a5a', '#5a4a3a', '#6a4a3a', '#4a7ab0', '#4a3030', '#9a6a4a', '#e0502a'), { forest: 0.3, mountain: 2, water: 'river', walls: 3, forts: 1, lava: true }),
  r('iceCavernTF', 'Ice Cavern', 'Freezards · Freezlord · Blizzagia', 'A cavern of blue ice and sliding floors — bring a Cozy Parka — where a crystal-crowned serpent sleeps under the floor.',
    '#8ac0e0', t('Ice Floor', 'Frost', 'Ice Crag', 'Meltwater', 'Ice Wall', 'Frozen Ledge', 'Lava'), t('#d8e8f0', '#9ab8c8', '#b0c8d8', '#5a8ab0', '#8aa0b8', '#c0d0e0', '#d06030'), { forest: 0.3, mountain: 1.5, water: 'lake', walls: 4, forts: 1 }),
  r('fortressTF', 'Fortress', 'Totem Armos · Ball and Chain Soldiers · the Lady\'s Pets', 'Lady Maud\'s stronghold in the Drablands: Totem Armos on the battlements, switches only a Totem can reach, and her pets in the keep.',
    '#7a6a8a', t('Courtyard', 'Garden', 'Battlement', 'Moat', 'Fortress Wall', 'Keep', 'Lava'), t('#b0a8b8', '#6a8a5a', '#8a8090', '#3a6aa0', '#5a4a6a', '#a090b0', '#d0502a'), { forest: 0.5, mountain: 1, water: 'moat', walls: 6, forts: 2 }),
  r('dunesTF', 'Dunes', 'Leevers · Vulture Vizier · Stalchampion', 'Sand to the horizon, Gold Dust in the dunes, a vulture riding the wind — and a giant skeleton who was champion once.',
    '#d0b060', t('Sand', 'Dry Brush', 'Dune', 'Oasis', 'Sandstone Wall', 'Ruin', 'Lava'), t('#e0c888', '#9a8a4a', '#c8a870', '#4a8ab0', '#9a7a50', '#b09060', '#d0502a'), { forest: 0.3, mountain: 2, water: 'none', walls: 3, forts: 1 }),
  r('ruinsTF', 'Ruins', 'Poes · ReDeads · Prismantus', 'Overgrown stone halls full of ghosts, where a construct of coloured lenses turns its gaze from red to green to blue.',
    '#8a8a6a', t('Flagstone', 'Overgrowth', 'Rubble', 'Flooded Hall', 'Ruined Wall', 'Altar', 'Lava'), t('#b8b098', '#5a7a4a', '#8a8070', '#4a7aa0', '#6a6050', '#a89870', '#d0502a'), { forest: 1.5, mountain: 1, water: 'none', walls: 5, forts: 1 }),
  r('skyRealmTF', 'Sky Realm', 'Aeralfos · Wizzrobes · Lady Maud', 'Clouds and floating platforms high over Hytopia, Gripshot Targets between them, and the witch waiting with her parasol at the top.',
    '#c0a0d8', t('Cloud', 'Cloud Garden', 'Floating Rock', 'Open Sky', 'Sky Wall', 'Platform', 'Lava'), t('#e8e0f0', '#b0c8a0', '#a8a0b8', '#a0c0f0', '#8a7aa0', '#d0c0e0', '#d0502a'), { forest: 0.5, mountain: 1, water: 'many', walls: 2, forts: 2 }),
  r('denOfTrialsTF', 'Den of Trials', 'every monster · the Shadow Links', 'The Drablands\' final challenge: floor after floor of every monster in the land, and three Shadow Links waiting at the bottom.',
    '#4a3a4a', t('Trial Floor', 'Shadow', 'Pillar', 'Abyss', 'Trial Wall', 'Rest Floor', 'Lava'), t('#6a5a6a', '#3a2a3a', '#5a4a5a', '#2a2a4a', '#2a1a2a', '#7a6a7a', '#c04a2a'), { forest: 0.5, mountain: 1, water: 'none', walls: 6, forts: 1 }),
];
