import type { BaseTerrain, MapStyle, Terrain, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'fourswords' });

const DUNGEON: MapStyle = { forest: 0.5, mountain: 0.5, water: 'none', walls: 6, forts: 1 };

/** The campaign's twelve regions, in order (section 11): Four Swords, then Four Swords Adventures. */
export const FS_ROUTE = [
  'seaOfTrees', 'talusCave', 'deathMountainFS', 'vaatisPalace',
  'whereaboutsOfTheWind', 'easternHyrule', 'deathMountainFSA', 'nearTheFields', 'darkWorldFSA', 'desertOfDoubt', 'frozenHyrule', 'realmOfTheHeavens',
];
/** The Four Swords half of the route (the GBA game) and the Adventures half. */
export const FS_GBA = FS_ROUTE.slice(0, 4);
/** Regions fought in the Dark World (Shadow Sword, Shadow Link's commander bonus, more portals). */
export const DARK_REGIONS = ['darkWorldFSA', 'vaatisPalace', 'realmOfTheHeavens'];
/** Desert regions (Geldman's Sand Ambush). */
export const DESERT_REGIONS = ['desertOfDoubt'];

/** Battlefield spaces placed in each region's battles (section 10; the Gnat Passage is the Micro Passage). */
export const FS_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  seaOfTrees: { forceGemDeposit: 3, itemPedestal: 1, cooperativeBlock: 1, microPassage: 1, formationSwitch: 1 },
  talusCave: { forceGemDeposit: 3, fourPersonSwitch: 1, forceBarrier: 2, fairyPedestal: 1, cooperativeBlock: 1 },
  deathMountainFS: { forceGemDeposit: 3, magneticPillar: 2, itemPedestal: 1, formationSwitch: 1, forceBarrier: 1 },
  vaatisPalace: { forceGemDeposit: 3, sanctuarySeal: 1, fsDarkPortal: 2, shadowMirrorGate: 1, fourPersonSwitch: 1 },
  whereaboutsOfTheWind: { forceGemDeposit: 3, itemPedestal: 1, cooperativeBlock: 1, royalJewelPedestal: 1 },
  easternHyrule: { forceGemDeposit: 3, fairyPedestal: 1, formationSwitch: 1, microPassage: 1 },
  deathMountainFSA: { forceGemDeposit: 3, magneticPillar: 2, forceBarrier: 1, itemPedestal: 1 },
  nearTheFields: { forceGemDeposit: 3, fourPersonSwitch: 1, cooperativeBlock: 1, royalJewelPedestal: 1, shadowMirrorGate: 1 },
  darkWorldFSA: { forceGemDeposit: 3, fsDarkPortal: 4, shadowMirrorGate: 2, sanctuarySeal: 1 },
  desertOfDoubt: { forceGemDeposit: 3, fairyPedestal: 1, royalJewelPedestal: 1, microPassage: 1, magneticPillar: 1 },
  frozenHyrule: { forceGemDeposit: 3, formationSwitch: 1, forceBarrier: 2, itemPedestal: 1 },
  realmOfTheHeavens: { forceGemDeposit: 4, sanctuarySeal: 1, fsDarkPortal: 2, shadowMirrorGate: 1, fourPersonSwitch: 1 },
};

export const REGIONS: WorldDef[] = [
  // ── Four Swords ──
  r('seaOfTrees', 'Sea of Trees', 'Octoroks · Zols · Delu Zol', 'The forest behind the Four Sword Sanctuary, where the sword split one Link into four and the first Great Fairy waits behind a Force Barrier.',
    '#4a8a3a', t('Glade', 'Deep Wood', 'Mossy Rock', 'Stream', 'Root Wall', 'Fairy Grove', 'Lava'), t('#9ac07a', '#2a6a2a', '#7a8a5a', '#4a8ad0', '#5a4a3a', '#a08a5a', '#d0502a'), { forest: 3, mountain: 0.5, water: 'lake', walls: 1, forts: 1 }),
  r('talusCave', 'Talus Cave', 'Keese · Stalfos · Dera Zol', 'Frozen caves under the mountains, where Four-Person Switches open the ice and a slime that changes colour guards the deepest hall.',
    '#7aa0c0', t('Cave Floor', 'Frost', 'Ice Rock', 'Cold Pool', 'Cave Wall', 'Ice Shrine', 'Lava'), t('#b0c0d0', '#8ab0c0', '#8a9aa8', '#5a8ab0', '#4a5a6a', '#a0b0c0', '#d0602a'), DUNGEON),
  r('deathMountainFS', 'Death Mountain', 'Fire Keese · Tektites · Gouen', 'The volcano of the Four Swords: lava rivers, Magnetic Pillars over the gaps, and a burning face in the crater.',
    '#b04a2a', t('Ash Path', 'Scorched Scrub', 'Crag', 'Hot Spring', 'Cliff', 'Fire Shrine', 'Lava'), t('#9a7a62', '#6a5a3a', '#6a4a3a', '#4a7ab0', '#4a3a30', '#a07a50', '#e0502a'), { forest: 0.3, mountain: 3, water: 'none', walls: 2, forts: 1, lava: true }),
  r('vaatisPalace', 'Vaati\'s Palace', 'Darknuts · Ball and Chain Troopers · Vaati', 'The Wind Mage\'s palace in the clouds above Hyrule, where Princess Zelda is held and every door wants a key.',
    '#6a4a8a', t('Palace Floor', 'Cloud', 'Pillar', 'Sky', 'Palace Wall', 'Throne', 'Dark Fire'), t('#8a7a9a', '#b8c0d8', '#7a6a8a', '#8ab0e0', '#3a2a4a', '#9a7a8a', '#a03a5a'), DUNGEON),
  // ── Four Swords Adventures ──
  r('whereaboutsOfTheWind', 'Whereabouts of the Wind', 'Octoroks · Hyrule soldiers · Phantom Ganon', 'Lake Hylia, the Cave of No Return and Hyrule Castle, where the Four Sword was pulled once more and the Shrine Maidens vanished.',
    '#5a9ac0', t('Lakeshore', 'Grove', 'Cliff Path', 'Lake Hylia', 'Castle Wall', 'Castle', 'Lava'), t('#c8d0a0', '#4a8a4a', '#8a8a7a', '#3a7ac0', '#7a7a7a', '#b0a090', '#d0502a'), { forest: 1, mountain: 1, water: 'lake', walls: 3, forts: 2 }),
  r('easternHyrule', 'Eastern Hyrule', 'Terrorpins · Octoroks · Stone Arrghus', 'The coast, the Village of the Blue Maiden and the Eastern Temple, where a stone eye watches the sea.',
    '#5ab0a0', t('Beach', 'Palms', 'Dune', 'Sea', 'Temple Wall', 'Village', 'Lava'), t('#e0d0a0', '#5a9a5a', '#c8b888', '#3a8ac0', '#8a8a7a', '#c0a080', '#d0502a'), { forest: 1, mountain: 0.5, water: 'many', walls: 2, forts: 2 }),
  r('deathMountainFSA', 'Death Mountain', 'Tektites · Big Bombs · Big Dodongo', 'The foothills, the mountain path and the Tower of Flames, where the Red Maiden is sealed and something swallows bombs.',
    '#c05a3a', t('Foothill', 'Scrub', 'Crag', 'Spring', 'Cliff', 'Tower of Flames', 'Lava'), t('#a88a6a', '#6a6a3a', '#7a5a4a', '#4a7ab0', '#5a3a30', '#b0704a', '#e0502a'), { forest: 0.5, mountain: 2.5, water: 'lake', walls: 2, forts: 1, lava: true }),
  r('nearTheFields', 'Near the Fields', 'Hyrule soldiers · Moblins · Big Darknut', 'Hyrule Field, the swamp and Hyrule Castle under Ganon\'s spell, where the soldiers you rescue join you and the Big Darknut holds the gate.',
    '#7ab05a', t('Field', 'Thicket', 'Hill', 'Swamp', 'Castle Wall', 'Barracks', 'Lava'), t('#a8c080', '#4a7a3a', '#8a9a6a', '#4a7a6a', '#7a7a7a', '#a89a7a', '#d0502a'), { forest: 2, mountain: 1, water: 'many', walls: 2, forts: 2 }),
  r('darkWorldFSA', 'The Dark World', 'Stalfos · Wizzrobes · Shadow Link', 'The Lost Woods, Kakariko Village and the Temple of Darkness, turned inside out through the Dark Mirror. Shadow Link is waiting on the other side of every portal.',
    '#5a3a6a', t('Dark Path', 'Twisted Wood', 'Skull Rock', 'Black Water', 'Dark Wall', 'Temple of Darkness', 'Dark Fire'), t('#7a6a8a', '#3a3a4a', '#6a5a6a', '#2a2a5a', '#3a2a4a', '#8a6a7a', '#a03a5a'), { forest: 3, mountain: 1, water: 'lake', walls: 3, forts: 1 }),
  r('desertOfDoubt', 'The Desert of Doubt', 'Geldmen · Leevers · Manhandla', 'The desert, the Desert Temple and the Pyramid that held the Trident of Power, where the sand itself grabs your ankles.',
    '#d0b070', t('Sand', 'Oasis Palms', 'Dune', 'Oasis', 'Temple Wall', 'Pyramid', 'Quicksand'), t('#e0c890', '#7a9a5a', '#c8a870', '#4a8ac0', '#a08a6a', '#c0a070', '#b08a4a'), { forest: 0.3, mountain: 2, water: 'none', walls: 3, forts: 1 }),
  r('frozenHyrule', 'Frozen Hyrule', 'Ice Keese · Darknuts · Frostare and Helmaroc King', 'Frozen Hyrule, the Ice Temple and the Tower of Winds, where Frostare guards the White Maiden and the Helmaroc King nests on the tower.',
    '#a0c0e0', t('Snowfield', 'Frozen Wood', 'Ice Crag', 'Frozen Lake', 'Ice Wall', 'Ice Temple', 'Lava'), t('#e8f0f8', '#8ab0c0', '#a0b8c8', '#7ab0d0', '#8aa0b0', '#c0d0e0', '#d06030'), { forest: 1, mountain: 2, water: 'lake', walls: 3, forts: 1 }),
  r('realmOfTheHeavens', 'Realm of the Heavens', 'Darknuts · Wizzrobes · Vaati, then Ganon', 'The realm above the clouds, the Dark Cloud and the Palace of Winds: Vaati waits at the top, and behind him the King of Darkness.',
    '#8a7ab0', t('Cloud', 'Cloud Grass', 'Cloud Bank', 'Sky Gap', 'Palace Wall', 'Palace of Winds', 'Dark Fire'), t('#d8d0e8', '#b0b8d8', '#a8a0c0', '#8ab0e0', '#5a4a7a', '#b0a0c0', '#a03a5a'), DUNGEON),
];
