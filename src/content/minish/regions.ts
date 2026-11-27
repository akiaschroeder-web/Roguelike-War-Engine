import type { BaseTerrain, MapStyle, Terrain, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'minish' });

const WOODS: MapStyle = { forest: 4, mountain: 0.5, water: 'river', walls: 0.5, forts: 1 };
const DUNGEON: MapStyle = { forest: 0.5, mountain: 0.5, water: 'none', walls: 6, forts: 1 };

/** The campaign's sixteen regions, in order (section 12). */
export const MINISH_ROUTE = [
  'hyruleTownMC', 'minishWoods', 'minishVillage', 'deepwoodShrine', 'mountCrenel', 'caveOfFlames', 'castorWilds', 'windRuins',
  'fortressOfWinds', 'royalValley', 'lakeHyliaMC', 'templeOfDroplets', 'veilFalls', 'cloudTops', 'palaceOfWinds', 'darkHyruleCastle',
];
/** Where each Element is won (it reforges the Picori Blade), and Melari's forge. */
export const ELEMENT_OF: Record<string, string> = { deepwoodShrine: 'earthElement', caveOfFlames: 'fireElement', templeOfDroplets: 'waterElement', palaceOfWinds: 'windElement' };
export const MELARI_FORGE = 'mountCrenel';

/** Battlefield spaces placed in each region's battles (section 10, with the size-dependent terrain). */
export const MC_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  hyruleTownMC: { minishPortal: 1, ordinaryHouse: 2, puddle: 2, giantFlower: 1, minishDoor: 1, raindrop: 1 },
  minishWoods: { minishPortal: 1, giantGrass: 4, tallGrass: 3, giantMushroom: 1, fallenTwig: 2, puddle: 2, minishVine: 1 },
  minishVillage: { minishPortal: 1, giantGrass: 3, minishDoor: 2, giantMushroom: 1, waterDroplet: 2, microPassage: 2, microTunnel: 2 },
  deepwoodShrine: { giantGrass: 2, spiderweb: 3, microPassage: 2, floatingLeaf: 1, internalWeakPoint: 0 },
  mountCrenel: { minishPortal: 1, softEarthWall: 2, minishVine: 2, microPassage: 1, raindrop: 2, gustCurrent: 1 },
  caveOfFlames: { pacciHole: 2, softEarthWall: 1, microTunnel: 2, internalWeakPoint: 0 },
  castorWilds: { tallGrass: 4, puddle: 3, floatingLeaf: 2, minishPortal: 1, microBridge: 1, giantFlower: 1 },
  windRuins: { gustCurrent: 2, windCrest: 2, microPassage: 1, softEarthWall: 1 },
  fortressOfWinds: { gustCurrent: 2, pacciHole: 1, microTunnel: 2, duplicationTile: 1 },
  royalValley: { tallGrass: 2, spiderweb: 2, minishPortal: 1, microTunnel: 2 },
  lakeHyliaMC: { floatingLeaf: 3, microBridge: 2, puddle: 2, minishDoor: 1, minishPortal: 1, waterDroplet: 2 },
  templeOfDroplets: { waterDroplet: 3, floatingLeaf: 2, duplicationTile: 1, microPassage: 1 },
  veilFalls: { minishVine: 3, gustCurrent: 2, softEarthWall: 1, windCrest: 1 },
  cloudTops: { gustCurrent: 3, windCrest: 2, giantMushroom: 1 },
  palaceOfWinds: { gustCurrent: 3, duplicationTile: 1, pacciHole: 1 },
  darkHyruleCastle: { duplicationTile: 2, microPassage: 1, minishPortal: 1, bookshelf: 1, minishTable: 1 },
};
/** Micro dungeons: size-dependent terrain laid out for a Micro-scale fight (a house, a library shelf, a flooded garden). */
export const MICRO_DUNGEON_TERRAIN: Partial<Record<Terrain, number>> = { bookshelf: 3, minishTable: 2, puddle: 3, giantFlower: 2, fallenTwig: 2, tallGrass: 3, raindrop: 1, minishDoor: 1 };

export const REGIONS: WorldDef[] = [
  r('hyruleTownMC', 'Hyrule Town', 'ChuChus · Octoroks · the Picori Festival', 'The castle town in festival week: merchants, a sword-fighting tournament, a library full of Minish, and Smith\'s forge on the south road.',
    '#d0b070', t('Town Square', 'Garden', 'Rooftop', 'Fountain', 'Town Wall', 'Shop', 'Brazier'), t('#d0c098', '#5a9a4a', '#9a8a7a', '#4a8ad0', '#8a7a6a', '#c09a6a', '#d05a30'), { forest: 1, mountain: 0.5, water: 'moat', walls: 4, forts: 3 }),
  r('minishWoods', 'Minish Woods', 'Pestos · Puffstools · Madderpillar', 'The forest south of town, where the grass is taller than you think and the Forest Minish live under every stump.',
    '#4a9a4a', t('Glade', 'Old Wood', 'Rise', 'Brook', 'Root Wall', 'Stump', 'Lava'), t('#9ac07a', '#2a6a3a', '#7a8a5a', '#4a8ad0', '#5a4a3a', '#8a6a4a', '#d0502a'), WOODS),
  r('minishVillage', 'Minish Village', 'Pestos · Rollobites · Forest Minish', 'A village of Minish houses inside a hollow stump: mushrooms for roofs, acorns for pots, and the elder Gentari\'s hall.',
    '#7ac06a', t('Moss', 'Clover', 'Pebble', 'Dewpond', 'Bark Wall', 'Minish House', 'Ember'), t('#a8d090', '#3a8a3a', '#9a9a8a', '#6aa0d0', '#6a4a2a', '#c0905a', '#d05a30'), WOODS),
  r('deepwoodShrine', 'Deepwood Shrine', 'ChuChus · Puffstools · Big Green ChuChu', 'A shrine sunk in the roots of the Minish Woods, where barrels roll on vines and the Earth Element waits behind a giant slime.',
    '#3a7a3a', t('Shrine Floor', 'Roots', 'Barrel', 'Root Pool', 'Shrine Wall', 'Altar', 'Lava'), t('#8aa07a', '#2a5a2a', '#7a6a4a', '#3a7ab0', '#3a4a2a', '#a08a5a', '#d0502a'), DUNGEON),
  r('mountCrenel', 'Mount Crenel', 'Spiny Beetles · Rollobites · Mountain Minish', 'A rocky mountain of mineral springs and soft earth, where the Mountain Minish forge, and Melari reforges the Picori Blade.',
    '#a08a6a', t('Path', 'Scrub', 'Crag', 'Spring', 'Cliff', 'Forge', 'Lava'), t('#b8a888', '#6a7a4a', '#8a7a6a', '#4a8ad0', '#6a5a4a', '#a07a50', '#d0502a'), { forest: 0.5, mountain: 3, water: 'river', walls: 2, forts: 1 }),
  r('caveOfFlames', 'Cave of Flames', 'Fire Keese · Spiny Beetles · Gleerok', 'The Goron mine under Mount Crenel, flooded with lava, where minecarts run on rails and Gleerok guards the Fire Element.',
    '#c05a3a', t('Cave Floor', 'Ash', 'Rock', 'Hot Spring', 'Cave Wall', 'Mine Cart', 'Lava'), t('#9a7a62', '#5a4a3a', '#6a4a3a', '#4a7ab0', '#4a3a30', '#b08a5a', '#e0502a'), { forest: 0.3, mountain: 2, water: 'river', walls: 4, forts: 1, lava: true }),
  r('castorWilds', 'Castor Wilds', 'Puffstools · Octoroks · Golden Kinstones', 'A swamp east of town, tall with reeds and flowers, where the Golden Kinstones are and a Blade Brother trains.',
    '#6a9a5a', t('Bog', 'Reeds', 'Mound', 'Swamp Water', 'Ruin', 'Hut', 'Lava'), t('#8a9a6a', '#4a7a3a', '#7a7a5a', '#4a7a8a', '#5a5a4a', '#9a8a5a', '#d0502a'), { forest: 3, mountain: 0.5, water: 'many', walls: 1, forts: 1 }),
  r('windRuins', 'Wind Ruins', 'Eyegore Statues · Moblins · Silver Darknut', 'The broken stones of the Wind Tribe\'s old capital, where Eyegore statues still watch and the wind never stops.',
    '#b0b090', t('Flagstones', 'Grass', 'Rubble', 'Cistern', 'Ruined Wall', 'Shrine', 'Lava'), t('#c8c0a0', '#6a9a5a', '#9a9080', '#4a8ad0', '#7a7060', '#a89a7a', '#d0502a'), { forest: 1, mountain: 1.5, water: 'none', walls: 4, forts: 1 }),
  r('fortressOfWinds', 'Fortress of Winds', 'Eyegores · Darknuts · Mazaal', 'An ancient fortress risen from the ruins, full of moving floors, Wizzrobes and the great stone guardian Mazaal.',
    '#9a8a6a', t('Fortress Floor', 'Moss', 'Pillar', 'Moat', 'Fortress Wall', 'Gate', 'Lava'), t('#b0a080', '#5a7a4a', '#8a7a6a', '#3a6aa0', '#5a4a3a', '#a09070', '#d0502a'), DUNGEON),
  r('royalValley', 'Royal Valley', 'Gibdos · Stalfos · Red Darknut', 'A misty valley of graves behind the castle, where Dampé keeps the keys and the Royal Crypt holds the old kings.',
    '#6a6a8a', t('Graveyard', 'Dead Wood', 'Tombstone', 'Mire', 'Crypt Wall', 'Mausoleum', 'Lava'), t('#8a8a90', '#4a5a4a', '#7a7a80', '#3a5a7a', '#4a4a5a', '#8a8090', '#d0502a'), { forest: 2, mountain: 1, water: 'lake', walls: 3, forts: 1 }),
  r('lakeHyliaMC', 'Lake Hylia', 'Octoroks · ChuChus · hidden Minish settlements', 'A wide lake of lily pads and little islands, where the Minish live in a house under the bridge and Librari\'s cousins fish from leaves.',
    '#4a9ac0', t('Shore', 'Lily Pads', 'Island Rock', 'Lake', 'Cliff', 'Cabin', 'Lava'), t('#c8d0a0', '#4a9a5a', '#8a8a7a', '#3a7ac0', '#6a6a5a', '#a08a6a', '#d0502a'), { forest: 1, mountain: 1, water: 'many', walls: 1, forts: 1 }),
  r('templeOfDroplets', 'Temple of Droplets', 'Ice Keese · Big Blue ChuChu · Big Octorok', 'A temple of ice and falling water under Lake Hylia, where the Water Element is frozen in a block.',
    '#7ab0d0', t('Ice Floor', 'Frost', 'Ice Pillar', 'Meltwater', 'Ice Wall', 'Altar', 'Lava'), t('#d8e8f0', '#8ab0c0', '#a0b8c8', '#5a8ab0', '#8aa0b0', '#c0b090', '#d06030'), DUNGEON),
  r('veilFalls', 'Veil Falls', 'Spiny Beetles · Darknuts', 'A cliff of waterfalls and caves on the way up to the clouds: climbing, and wind that tries to throw you off.',
    '#6a8aa0', t('Ledge', 'Mist', 'Cliff Face', 'Falls', 'Rock Wall', 'Cave', 'Lava'), t('#a0b0b0', '#6a8a7a', '#7a8a8a', '#5a9ad0', '#5a6a6a', '#8a8a7a', '#d0502a'), { forest: 1, mountain: 3, water: 'river', walls: 2, forts: 1 }),
  r('cloudTops', 'Cloud Tops', 'Moblins · Wizzrobes · Male Gyorg', 'A land of cloud above Veil Falls, where the Wind Tribe\'s houses float and the Gyorg hunt.',
    '#c8d8f0', t('Cloud', 'Cloud Grass', 'Cloud Bank', 'Sky Gap', 'Cloud Wall', 'Wind Tribe House', 'Lava'), t('#e8f0f8', '#b0c8d8', '#c8d0e0', '#8ab0e0', '#a0b0c0', '#c0b8a0', '#d0502a'), { forest: 0.5, mountain: 1, water: 'lake', walls: 1, forts: 1 }),
  r('palaceOfWinds', 'Palace of Winds', 'Ball and Chain Soldiers · Darknuts · the Gyorg pair', 'The Wind Tribe\'s palace on the highest cloud, guarded by the Gyorg pair and holding the last Element.',
    '#a0b8e0', t('Palace Floor', 'Cloud', 'Pillar', 'Sky', 'Palace Wall', 'Throne', 'Lava'), t('#d8e0f0', '#b8c8e0', '#a8b0c8', '#8ab0e0', '#7080a0', '#c8b890', '#d0502a'), DUNGEON),
  r('darkHyruleCastle', 'Dark Hyrule Castle', 'Darknuts · Black Knight · Vaati', 'Hyrule Castle in Vaati\'s hands: a black sky, stone soldiers in the courtyard, and the sorcerer waiting in the throne room in three shapes.',
    '#5a3a6a', t('Dark Courtyard', 'Dead Garden', 'Battlement', 'Black Moat', 'Castle Wall', 'Throne Room', 'Dark Fire'), t('#7a6a8a', '#3a3a4a', '#6a5a7a', '#2a2a5a', '#3a2a4a', '#8a6a7a', '#a03a5a'), { forest: 0.3, mountain: 1, water: 'moat', walls: 5, forts: 2 }),
];
