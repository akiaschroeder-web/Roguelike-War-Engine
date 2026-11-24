import type { Terrain, WorldDef, WorldId } from '../engine/types';

// Each world reskins the same six terrain types so maps feel distinct while
// the rules stay identical. Add a world here and it becomes available to the
// run generator automatically.

const t = (
  plain: string,
  forest: string,
  mountain: string,
  water: string,
  wall: string,
  fort: string,
): Record<Terrain, string> => ({ plain, forest, mountain, water, wall, fort });

export const WORLDS: Record<WorldId, WorldDef> = {
  emberhold: {
    id: 'emberhold',
    name: 'Emberhold',
    genre: 'High Fantasy',
    blurb: 'A kingdom of banners and dragonfire, its knights sworn to a broken crown.',
    color: '#e0533d',
    terrainNames: t('Meadow', 'Old Forest', 'Crag', 'Lake', 'Castle Wall', 'Keep'),
    terrainColors: t('#7a9a4a', '#3f6b34', '#8a7a68', '#3c6e9e', '#5b5560', '#b08a4a'),
  },
  starfall: {
    id: 'starfall',
    name: 'Starfall Station',
    genre: 'Sci-Fi Shooter',
    blurb: 'An orbital fortress at the edge of known space, overrun by rogue machines.',
    color: '#3ec7e0',
    terrainNames: t('Deck Plate', 'Server Racks', 'Debris', 'Hull Breach', 'Bulkhead', 'Med Bay'),
    terrainColors: t('#5a6472', '#2f4a5c', '#6e6a62', '#0d1424', '#2a2e38', '#3d8a7a'),
  },
  pixelvale: {
    id: 'pixelvale',
    name: 'Pixelvale',
    genre: '8-Bit Platformer',
    blurb: 'A bright, blocky land where everything bounces and nothing stays dead for long.',
    color: '#7be04a',
    terrainNames: t('Grass Block', 'Pipe Grove', 'Brick Hill', 'Pit', 'Solid Block', 'Checkpoint'),
    terrainColors: t('#5fc24a', '#2e8f3a', '#c2703a', '#1a1a3a', '#8a4a2a', '#e0c040'),
  },
  neon: {
    id: 'neon',
    name: 'Neon Sprawl',
    genre: 'Cyberpunk',
    blurb: 'Rain-slick megacity streets where corporations own the sky and the code.',
    color: '#e04ac2',
    terrainNames: t('Street', 'Market Stalls', 'Rubble', 'Canal', 'Tower', 'Safehouse'),
    terrainColors: t('#3a3a52', '#4a2f5c', '#5c5466', '#1a2a4a', '#1c1c28', '#7a4ac2'),
  },
  ronin: {
    id: 'ronin',
    name: 'Ronin Isles',
    genre: 'Samurai Fighter',
    blurb: 'Islands of cherry blossoms and duelling grounds, ruled by the strongest blade.',
    color: '#f0a040',
    terrainNames: t('Courtyard', 'Bamboo', 'Cliffs', 'Koi Pond', 'Pagoda Wall', 'Shrine'),
    terrainColors: t('#b8a070', '#5a8a3a', '#7a6a5a', '#3a7aa0', '#6a2a2a', '#c04a3a'),
  },
  hollowmere: {
    id: 'hollowmere',
    name: 'Hollowmere',
    genre: 'Gothic Horror',
    blurb: 'A moonlit valley of crypts and cathedrals, stalked by things that hunger.',
    color: '#a07ae0',
    terrainNames: t('Graveyard', 'Dead Woods', 'Tombs', 'Black Moat', 'Crypt Wall', 'Chapel'),
    terrainColors: t('#4a5048', '#2e3a2e', '#5a5262', '#1a2228', '#2a2430', '#6a5a8a'),
  },
  rift: {
    id: 'rift',
    name: 'The Rift',
    genre: 'Between Worlds',
    blurb: 'The wound where all worlds bleed together. Something is pulling them apart.',
    color: '#ffffff',
    terrainNames: t('Shardfloor', 'Echo Thicket', 'Fractured Peak', 'Void', 'Null Wall', 'Anchor'),
    terrainColors: t('#4a4a6a', '#3a2a5a', '#6a5a7a', '#05050f', '#20182e', '#c0a0ff'),
  },
};

/** Worlds that heroes come from and that normal battles take place in. */
export const PLAYABLE_WORLDS: WorldId[] = ['emberhold', 'starfall', 'pixelvale', 'neon', 'ronin', 'hollowmere'];
