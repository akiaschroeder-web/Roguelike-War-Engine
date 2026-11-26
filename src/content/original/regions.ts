import type { BaseTerrain, MapStyle, WorldDef } from '../../engine/types';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'original' });

// Dungeon rooms: plenty of wall segments, little forest, the odd moat.
const ROOM: MapStyle = { forest: 0.6, mountain: 1, water: 'none', walls: 5, forts: 1 };

/** The Underworld Levels, in order. Each of the first eight holds a fragment of the Triforce of Wisdom. */
export const LEVELS = ['level1Eagle', 'level2Moon', 'level3Manji', 'level4Snake', 'level5Lizard', 'level6Dragon', 'level7Demon', 'level8Lion', 'level9DeathMountain'];

export const REGIONS: WorldDef[] = [
  r('level1Eagle', 'Level 1: The Eagle', 'Keese · Stalfos · Gels · Goriyas', 'The first Underworld labyrinth, shaped like an eagle. Aquamentus guards its fragment.',
    '#4a7ab0', t('Blue Tile', 'Bush', 'Statue', 'Moat', 'Dungeon Wall', 'Stairway Room', 'Fire'), t('#5a8ac0', '#3a7a3a', '#6a7a9a', '#2a4a8a', '#2a3a5a', '#7a8ab0', '#d06030'), ROOM),
  r('level2Moon', 'Level 2: The Moon', 'Ropes · Goriyas · Moldorms', 'A crescent of rooms full of snakes. Dodongo waits at the end, hungry.',
    '#4a9aa0', t('Teal Tile', 'Bush', 'Statue', 'Moat', 'Dungeon Wall', 'Stairway Room', 'Fire'), t('#5aaab0', '#3a7a3a', '#6a8a8a', '#2a5a7a', '#2a4a4a', '#7aa0a0', '#d06030'), ROOM),
  r('level3Manji', 'Level 3: The Manji', 'Zols · Darknuts · Bubbles', 'A swastika-shaped maze of slimes and armored knights, with Manhandla at its heart.',
    '#5a9a5a', t('Green Tile', 'Bush', 'Statue', 'Moat', 'Dungeon Wall', 'Stairway Room', 'Fire'), t('#6aaa6a', '#3a7a3a', '#7a8a6a', '#2a5a6a', '#2a4a2a', '#8aaa7a', '#d06030'), { ...ROOM, water: 'river' }),
  r('level4Snake', 'Level 4: The Snake', 'Vires · Like Likes · a raft crossing', 'A long serpent of rooms over dark water. The Gleeok\'s heads come at you from every side.',
    '#a0a050', t('Yellow Tile', 'Bush', 'Statue', 'Underground Lake', 'Dungeon Wall', 'Stairway Room', 'Fire'), t('#b0b060', '#5a7a3a', '#8a8a6a', '#2a4a6a', '#4a4a2a', '#b0b080', '#d06030'), { ...ROOM, water: 'lake' }),
  r('level5Lizard', 'Level 5: The Lizard', 'Pols Voices · Gibdos · Darknuts', 'The lizard-shaped labyrinth where Pols Voices hop and Digdogger rolls. Bring the Recorder.',
    '#7a7a7a', t('Grey Tile', 'Bush', 'Statue', 'Moat', 'Dungeon Wall', 'Stairway Room', 'Fire'), t('#8a8a8a', '#4a6a3a', '#7a7a8a', '#2a3a6a', '#3a3a3a', '#9a9a9a', '#d06030'), ROOM),
  r('level6Dragon', 'Level 6: The Dragon', 'Ghinis · Vires · Like Likes', 'A dragon-shaped tomb, haunted by Ghinis among the gravestones. Gohma watches with one eye.',
    '#6a8a6a', t('Mossy Tile', 'Bush', 'Statue', 'Moat', 'Dungeon Wall', 'Stairway Room', 'Fire'), t('#7a9a7a', '#3a6a3a', '#7a8a7a', '#2a4a5a', '#2a3a2a', '#8a9a8a', '#d06030'), ROOM),
  r('level7Demon', 'Level 7: The Demon', 'Goriyas · Ropes · Wallmasters', 'A demon\'s face of rooms. A Hungry Goriya bars the way; Aquamentus waits again, stronger.',
    '#5a6a9a', t('Slate Tile', 'Bush', 'Statue', 'Moat', 'Dungeon Wall', 'Stairway Room', 'Fire'), t('#6a7aaa', '#3a6a3a', '#7a7a9a', '#2a3a7a', '#2a2a4a', '#8a8aaa', '#d06030'), { ...ROOM, water: 'moat' }),
  r('level8Lion', 'Level 8: The Lion', 'Darknuts · Lanmolas · Pols Voices', 'The lion\'s den: armored knights, burrowing worms and the Gleeok once more.',
    '#8a6a4a', t('Ochre Tile', 'Bush', 'Statue', 'Moat', 'Dungeon Wall', 'Stairway Room', 'Fire'), t('#9a7a5a', '#4a6a3a', '#8a7a6a', '#2a4a6a', '#3a2a1a', '#aa8a6a', '#d06030'), ROOM),
  r('level9DeathMountain', 'Level 9: Death Mountain', 'Patras · Lanmolas · Ganon', 'Ganon\'s lair inside Death Mountain. The Triforce of Wisdom opens the way; only Silver Arrows finish him.',
    '#6a3a3a', t('Red Tile', 'Dead Bush', 'Rock', 'Moat', 'Mountain Wall', 'Throne Room', 'Lava'), t('#7a4a4a', '#4a3a2a', '#6a5a5a', '#3a2a4a', '#2a1a1a', '#8a5a5a', '#e0402a'),
    { ...ROOM, walls: 6, mountain: 2, lava: true }),
];
