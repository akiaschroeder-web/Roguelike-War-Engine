import type { Terrain } from '../../engine/types';

/** Section 8's Object Echoes: battlefield objects (terrain on one tile), not units. */
export interface ObjectEcho {
  id: string;
  name: string;
  /** Echo Capacity it uses. */
  cost: number;
  /** The terrain it becomes (the Water Block is ordinary water). */
  terrain: Terrain;
  /** Turns before it fades on its own (0: until dismissed or destroyed). */
  turns?: number;
  desc: string;
}

export const OBJECT_ECHOES: ObjectEcho[] = [
  { id: 'echoTable', name: 'Table', cost: 1, terrain: 'eoTable', desc: 'Elevation: a unit on it gets +15 Hit and +10 Avoid.' },
  { id: 'echoWoodenBox', name: 'Wooden Box', cost: 1, terrain: 'eoBox', desc: 'Cover or platform: +20 Avoid and +2 DEF (2 movement to climb).' },
  { id: 'echoOldBed', name: 'Old Bed', cost: 1, terrain: 'eoOldBed', desc: 'A unit resting on it recovers 15% HP at the start of each turn.' },
  { id: 'echoSoftBed', name: 'Soft Bed', cost: 2, terrain: 'eoSoftBed', desc: 'A unit resting on it recovers 25% HP at the start of each turn.' },
  { id: 'echoZeldasBed', name: "Zelda's Bed", cost: 3, terrain: 'eoZeldaBed', desc: 'A unit resting on it recovers 30% HP and 10 MP at the start of each turn.' },
  { id: 'echoBoulder', name: 'Boulder', cost: 2, terrain: 'eoBoulder', desc: 'Blocks movement. Dropped next to enemies it crushes them (8 + the summoner\'s MAG/3).' },
  { id: 'echoSmallRock', name: 'Small Rock', cost: 1, terrain: 'eoRock', turns: 1, desc: 'Throwable: summoned next to enemies it is thrown at one (6 + MAG/4) and shatters.' },
  { id: 'echoPot', name: 'Pot', cost: 1, terrain: 'eoPot', desc: 'Throwable (next to enemies: 5 + MAG/4) or a hiding spot: a Micro unit on it is Veiled.' },
  { id: 'echoWaterBlock', name: 'Water Block', cost: 1, terrain: 'water', turns: 4, desc: 'Temporary swimmable water (4 turns).' },
  { id: 'echoIceBlock', name: 'Ice Block', cost: 1, terrain: 'eoIceBlock', turns: 4, desc: 'A sliding obstacle (blocks movement) that melts in 4 turns, or at once to fire.' },
  { id: 'echoTorch', name: 'Torch', cost: 1, terrain: 'eoTorch', desc: 'Lights the darkness (the fog lifts) and burns the enemies next to it at the start of each turn.' },
  { id: 'echoFlyingTile', name: 'Flying Tile', cost: 2, terrain: 'eoFlyingTile', desc: 'A platform: walkable even over water, lava, rifts and gaps.' },
  { id: 'echoCloud', name: 'Cloud', cost: 2, terrain: 'eoCloud', turns: 3, desc: 'A temporary aerial platform (3 turns): walkable over anything, +10 Avoid.' },
  { id: 'echoTrampoline', name: 'Trampoline', cost: 1, terrain: 'eoTrampoline', desc: 'Launches units higher: a unit starting its turn on it has +2 MOV.' },
  { id: 'echoWindCannon', name: 'Wind Cannon', cost: 2, terrain: 'eoWindCannon', desc: 'At the start of the summoner\'s turn, pushes light enemies (size 1) within 3 back 2 spaces.' },
  { id: 'echoWoodenSign', name: 'Wooden Sign', cost: 1, terrain: 'eoSign', desc: 'Light cover: +10 Avoid and +1 DEF.' },
  { id: 'echoCarrot', name: 'Carrot', cost: 1, terrain: 'eoCarrot', turns: 3, desc: 'Attracts animals and mounts: beasts within 3 are lured (Confused) for a turn.' },
  { id: 'echoMeat', name: 'Meat', cost: 1, terrain: 'eoMeat', turns: 3, desc: 'Distracts carnivores: monsters within 3 are lured (Confused) for a turn.' },
  { id: 'echoGrilledFish', name: 'Grilled Fish', cost: 1, terrain: 'eoFish', turns: 3, desc: 'Attracts aquatic monsters within 4 (Confused for a turn).' },
];
export const OBJECT_BY_ID: Record<string, ObjectEcho> = Object.fromEntries(OBJECT_ECHOES.map((o) => [o.id, o]));
/** Objects Zelda knows from the start (the Old Bed is the first thing she copies). */
export const STARTING_OBJECTS = ['echoOldBed', 'echoTable', 'echoWoodenBox', 'echoPot', 'echoSmallRock', 'echoWaterBlock'];
/** Monsters Zelda knows from the start (any campaign): a basic Echo or two to begin with. */
export const STARTING_MONSTERS = ['keese', 'octorok'];

/** Section 7's cost table, by monster (named exceptions; everything else is graded by size and strength). */
export const ECHO_COST_OVERRIDES: Record<string, number> = {
  keese: 2, fireKeese: 2, iceKeese: 2, zol: 2, rope: 2, chuchuGreen: 2, chuchuRed: 2, octorok: 2, ghini: 2,
  lizalfos: 3, darknut: 3, mightyDarknut: 4, moblin: 4, clubMoblin: 4, hinox: 5, lynel: 6,
  riverZora: 3, riverZoraWarrior: 3, riverZoraHunter: 3, riverZoraSorcerer: 3, riverZoraGuardian: 4, riverZoraChieftain: 4,
  ignizol: 2, hydrozol: 2, caromadillo: 2, tornando: 3, ribbitune: 2, drippitune: 3, holmill: 2, platboom: 4, strandtula: 2, crawltula: 2, tweelus: 3, chompfin: 4,
};
/** Boss Echoes (8–12): only Null's Boss Reflection summons them. */
export const BOSS_ECHO_COST = 10;
export const BOSS_REFLECTIONS = ['seismicTalus', 'mogryph', 'vocavor', 'skorchill', 'bori', 'volvagia', 'queenGohma', 'smog', 'manhandla', 'slimeEye'];

/** Tri's level → Echo Capacity (section 7's proposed values). */
export const TRI_CAPACITY = [3, 3, 4, 4, 5, 5, 6, 6, 7, 8, 9, 10];
export const TRI_MAX_LEVEL = 11;
/** Rift repairs (Tri EXP) per Tri level. */
export const TRI_XP_PER_LEVEL = 2;

/** Swordfighter Form (section 9): the stats as a Swordfighter replace the normal ones. */
export const SWORDFIGHTER_STATS = { str: 24, mag: 12, skl: 25, spd: 23, def: 18, res: 16, mov: 7 };
export const SWORDFIGHTER_BASE = { str: 6, mag: 34, skl: 19, spd: 16, def: 8, res: 28, mov: 6 };
export const ENERGY_MAX = 40;
export const ENERGY_ACTIVATE = 5;
export const ENERGY_PER_TURN = 10;
export const ENERGY_PER_MIGHTY_ATTACK = 3;
/** Wind-Up Energy an Automaton spends at the start of each of its turns. */
export const WINDUP_PER_TURN = 4;
