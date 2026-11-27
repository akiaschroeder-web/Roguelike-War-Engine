import type { BaseTerrain, MapStyle, Terrain, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'spirit' });

const FIELD: MapStyle = { forest: 2, mountain: 1.5, water: 'river', walls: 1, forts: 1 };
const TOWER: MapStyle = { forest: 0.3, mountain: 0.5, water: 'none', walls: 6, forts: 1 };
const COLORS = t('#b8c88a', '#4a8a4a', '#8a7a5a', '#3a7ac0', '#6a5a4a', '#a07a50', '#d0502a');

/** The campaign route, in order: Aboda and the castle, the five realms, the Tower, then the finale. */
export const SPIRIT_REALMS = ['forestRealm', 'snowRealm', 'oceanRealm', 'fireRealm', 'sandRealm'];
export const SPIRIT_ROUTE = ['abodaVillage', 'hyruleCastleST', ...SPIRIT_REALMS, 'towerOfSpirits', 'darkRealm', 'demonTrainLine', 'sacredBattlefield'];
export const SPIRIT_FINALE = ['darkRealm', 'demonTrainLine', 'sacredBattlefield'];
/** The Tower of Spirits: the recurring, expanding dungeon (no life drain, unlike the Temple of the Ocean King). */
export const SPIRIT_TOWER = 'towerOfSpirits';
/** Each realm's Lokomo sage (and the duet that restores its tracks). */
export const REALM_SAGE: Record<string, string> = { forestRealm: 'gage', snowRealm: 'steem', oceanRealm: 'carben', fireRealm: 'embrose', sandRealm: 'rael' };

/** Battlefield spaces placed in each region's land battles (train battles lay their own rails). */
export const ST_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  abodaVillage: { railTrack: 3, trainStation: 1, tearOfLight: 0, whipPost: 0 },
  hyruleCastleST: { floorSpikes: 2, railSwitch: 0, lightStatue: 1, tearOfLight: 1 },
  forestRealm: { railTrack: 2, whipPost: 1, lightStatue: 1, rollingBoulder: 1 },
  snowRealm: { whipPost: 2, floorSpikes: 1, rollingBoulder: 1 },
  oceanRealm: { whipPost: 1, lightStatue: 1, tearOfLight: 1 },
  fireRealm: { rollingBoulder: 2, floorSpikes: 2, whipPost: 1 },
  sandRealm: { lightStatue: 2, rollingBoulder: 1, floorSpikes: 1 },
  towerOfSpirits: { sacredSafeZone: 4, tearOfLight: 3, floorSpikes: 2, lightStatue: 1 },
  darkRealm: { floorSpikes: 2, lightStatue: 1, tearOfLight: 1 },
  demonTrainLine: { tearOfLight: 1 },
  sacredBattlefield: { tearOfLight: 2, lightStatue: 2 },
};

export const REGIONS: WorldDef[] = [
  r('abodaVillage', 'Aboda Village', 'ChuChus · Bulblins · Big Blin', 'A quiet village at the end of the line, where Link learned to drive trains under Alfonzo and the old storyteller Niko keeps his Stamp Book.',
    '#8ac06a', t('Village Green', 'Orchard', 'Hillside', 'Pond', 'Fence', 'Station', 'Bonfire'), COLORS, FIELD),
  r('hyruleCastleST', 'Hyrule Castle', 'Bulblins · Stalfos · Chancellor Cole', 'The castle of New Hyrule, where a certificate ceremony became a kidnapping and the princess lost her body to a man in a top hat.',
    '#c0a0d0', t('Castle Courtyard', 'Garden', 'Battlement', 'Moat', 'Castle Wall', 'Throne Room', 'Brazier'), t('#c8c0b0', '#5a8a4a', '#8a8a9a', '#3a6ab0', '#6a6a7a', '#b09a7a', '#d06030'),
    { forest: 0.8, mountain: 1, water: 'moat', walls: 5, forts: 2 }),
  r('forestRealm', 'Forest Realm', 'Octoroks · Moblins · Stagnox', 'Green hills crossed by the Spirit Tracks, the Forest Sanctuary of Gage, and the Forest Temple where an armored beetle waits for the wind.',
    '#4a9a4a', t('Meadow', 'Old Forest', 'Hill', 'Stream', 'Rock Wall', 'Sanctuary', 'Lava'), t('#9ac07a', '#2a6a3a', '#7a8a5a', '#3a7ac0', '#5a5a4a', '#a08a6a', '#d0502a'),
    { forest: 4, mountain: 1.5, water: 'river', walls: 1, forts: 1 }),
  r('snowRealm', 'Snow Realm', 'Ice ChuChus · Freezards · Fraaz', 'A white country of Anouki villages and frozen lakes, Steem\'s Snow Sanctuary, and the Snow Temple of the Master of Ice and Fire.',
    '#a8d0e8', t('Snowfield', 'Frosted Pines', 'Ice Crag', 'Frozen Lake', 'Ice Wall', 'Anouki Hut', 'Lava'), t('#e8f0f8', '#7a9aaa', '#9ab0c0', '#5a8ab0', '#8aa0b0', '#c0a080', '#d06030'),
    { forest: 2, mountain: 2, water: 'lake', walls: 2, forts: 2 }),
  r('oceanRealm', 'Ocean Realm', 'Geozards · Metal ChuChus · Phytops', 'Islands linked by sea bridges of rail, Linebeck III\'s shop, Carben\'s Ocean Sanctuary, and the Ocean Temple overgrown with thorns.',
    '#3a8ac0', t('Beach', 'Palms', 'Sea Cliff', 'Sea', 'Reef', 'Lighthouse', 'Lava'), t('#d8c890', '#4a8a4a', '#8a7a5a', '#2a6ab0', '#5a6a6a', '#b09a7a', '#d0502a'),
    { forest: 1.5, mountain: 1.5, water: 'many', walls: 1, forts: 1 }),
  r('fireRealm', 'Fire Realm', 'Fire ChuChus · Geozard Chiefs · Cragma', 'Volcanoes, lava rivers and the Goron village; Embrose drums in the Fire Sanctuary, and Cragma sleeps in the lava of the Fire Temple.',
    '#c05a3a', t('Ash', 'Charred Brush', 'Volcanic Rock', 'Hot Spring', 'Basalt', 'Goron Hut', 'Lava'), t('#9a7a62', '#5a4a3a', '#6a4a3a', '#4a7ab0', '#4a3a30', '#b08a5a', '#e0502a'),
    { forest: 0.5, mountain: 2.5, water: 'river', walls: 2, forts: 1, lava: true }),
  r('sandRealm', 'Sand Realm', 'Sandworms · Key Masters · Skeldritch', 'A desert sealed for a century, where the tracks are buried under dunes, Rael keeps the Sand Sanctuary, and an ancient demon guards the Sand Temple.',
    '#d8b870', t('Sand', 'Dune Grass', 'Sandstone', 'Oasis', 'Ruined Wall', 'Sanctuary', 'Hot Sand'), t('#e0c880', '#9a9a5a', '#c0a070', '#3a8ac0', '#8a7a5a', '#a08050', '#e07030'),
    { forest: 0.3, mountain: 2, water: 'lake', walls: 3, forts: 1 }),
  r('towerOfSpirits', 'Tower of Spirits', 'Phantoms · Key Masters · Byrne', 'The Lokomo tower at the heart of the Spirit Tracks, with Malladus sealed beneath it. Phantoms patrol its floors; each climb goes a little higher.',
    '#7a6aa0', t('Tower Floor', 'Vines', 'Pillar', 'Sacred Pool', 'Tower Wall', 'Safe Room', 'Spikes'), t('#a09ab0', '#4a6a4a', '#7a6a8a', '#3a6aa0', '#3a2a5a', '#e8d890', '#a03a3a'), TOWER),
  r('darkRealm', 'Dark Realm', 'Dark Trains · Torch Phantoms', 'Where the Spirit Tracks run when the Tower falls: a red sky, black rails, and demon trains on every line.',
    '#5a2a4a', t('Ashen Ground', 'Dead Trees', 'Black Rock', 'Dark Water', 'Demon Wall', 'Ruined Station', 'Hellfire'), t('#6a4a5a', '#3a2a3a', '#5a3a4a', '#2a2a5a', '#2a1a2a', '#7a5a6a', '#c03a4a'),
    { forest: 0.8, mountain: 1.5, water: 'lake', walls: 2, forts: 1, lava: true }),
  r('demonTrainLine', 'The Demon Train', 'Wrecker Phantoms · the Demon Train', 'Cole and Byrne\'s escape line through the Dark Realm, and the many-cannoned Demon Train that carries the Demon King in Zelda\'s body.',
    '#4a2a3a', t('Rail Bed', 'Smoke', 'Slag', 'Dark Water', 'Embankment', 'Signal Box', 'Hellfire'), t('#5a4a4a', '#4a3a3a', '#5a4a4a', '#2a2a4a', '#2a1a1a', '#7a6a5a', '#c04a3a'),
    { forest: 0.3, mountain: 1, water: 'none', walls: 2, forts: 1 }),
  r('sacredBattlefield', 'The Final Battlefield', 'Phantoms · Malladus', 'A field of light and darkness at the end of the tracks, where Link and Zelda face the Demon King together.',
    '#3a2a5a', t('Sacred Ground', 'Shadow', 'Ruin', 'Dark Water', 'Rift', 'Light Altar', 'Demon Fire'), t('#7a6a8a', '#3a2a4a', '#5a4a6a', '#2a2a5a', '#1a1a2a', '#d8c890', '#9a2a5a'),
    { forest: 0.3, mountain: 0.8, water: 'moat', walls: 2, forts: 1 }),
];
