// Core type definitions shared by the engine, data and UI layers.
// Everything that lives in a Run or Battle is plain JSON so it can be saved.

/** Built-in worlds are listed here; content packs can add more, so any string is allowed. */
export type BuiltinWorldId = 'emberhold' | 'starfall' | 'pixelvale' | 'neon' | 'ronin' | 'hollowmere' | 'rift';
export type WorldId = BuiltinWorldId | (string & {});

export type WeaponType = 'sword' | 'lance' | 'axe' | 'bow' | 'magic' | 'gun' | 'staff';

export type MoveType = 'foot' | 'cavalry' | 'armor' | 'flying';

export type Terrain = 'plain' | 'forest' | 'mountain' | 'water' | 'wall' | 'fort';

export type Team = 'player' | 'enemy';

export type StatKey = 'hp' | 'str' | 'mag' | 'skl' | 'spd' | 'def' | 'res';

export type Stats = Record<StatKey, number> & { mov: number };
export type Growths = Record<StatKey, number>;

export type SkillId =
  | 'lifesteal'
  | 'armorBreak'
  | 'nimble'
  | 'deadeye'
  | 'bulwark'
  | 'regen'
  | 'vantage'
  | 'momentum';

export type RelicId =
  | 'warpShard'
  | 'ironBanner'
  | 'critLens'
  | 'phoenixFeather'
  | 'bountyBadge'
  | 'vampireFang'
  | 'tacticianMap'
  | 'riftBattery'
  | 'glassCannon'
  | 'medkit';

export interface WorldDef {
  id: WorldId;
  name: string;
  genre: string;
  blurb: string;
  color: string; // accent colour for units / UI
  terrainNames: Record<Terrain, string>;
  terrainColors: Record<Terrain, string>;
}

export interface ClassDef {
  id: string;
  name: string;
  weapons: WeaponType[];
  moveType: MoveType;
  base: Stats;
  growths: Growths;
  icon: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  type: WeaponType;
  might: number;
  hit: number;
  crit: number;
  minRange: number;
  maxRange: number;
  /** Move types this weapon deals double might against. */
  effective?: MoveType[];
  tier: number;
  price: number;
  desc?: string;
}

export interface HeroDef {
  id: string;
  name: string;
  title: string;
  world: WorldId;
  classId: string;
  weaponId: string;
  skill: SkillId;
  /** Added on top of the class base stats. */
  statMods: Partial<Stats>;
  /** Added on top of the class growths. */
  growthMods: Partial<Growths>;
  glyph: string;
  bio: string;
  /** Optional image (URL or data: URI) shown instead of the glyph token. */
  portrait?: string;
}

export interface EnemyArchetype {
  name: string;
  classId: string;
  weaponId: string;
  skill?: SkillId;
  portrait?: string;
}

export interface BossDef extends EnemyArchetype {
  id: string;
  title: string;
  world: WorldId;
  statMods: Partial<Stats>;
  glyph: string;
  quote: string;
}

export interface Unit {
  uid: string;
  heroId?: string;
  name: string;
  title: string;
  world: WorldId;
  classId: string;
  team: Team;
  level: number;
  xp: number;
  /** Permanent stats; `stats.hp` is max HP. */
  stats: Stats;
  growths: Growths;
  hp: number;
  weaponId: string;
  skills: SkillId[];
  glyph: string;
  portrait?: string;
  isCommander?: boolean;
  isBoss?: boolean;
  ai?: 'aggressive' | 'guard' | 'stationary';
  // Battle state
  x: number;
  y: number;
  moved: boolean;
  acted: boolean;
  kills: number;
}

export type ObjectiveType = 'rout' | 'boss' | 'survive';

export interface Objective {
  type: ObjectiveType;
  turns?: number;
}

export interface Battle {
  width: number;
  height: number;
  tiles: Terrain[];
  world: WorldId;
  units: Unit[];
  turn: number;
  phase: Team;
  objective: Objective;
  rngState: number;
  phoenixUsed: boolean;
  result?: 'won' | 'lost';
  rewardGold: number;
  nodeType: NodeType;
  log: string[];
  /** Copy of the run's relics so the engine needs no reference to the run. */
  relics: RelicId[];
  /** Units that died during this battle (both teams). */
  fallen: Unit[];
  /** Level used for reinforcements in survive maps. */
  enemyLevel: number;
  uidCounter: number;
}

export type NodeType = 'battle' | 'elite' | 'recruit' | 'shop' | 'rest' | 'treasure' | 'boss';

export interface MapNode {
  id: string;
  row: number;
  col: number; // 0..1 horizontal position for drawing
  type: NodeType;
  world: WorldId;
  next: string[];
  visited: boolean;
}

export interface RunMap {
  rows: number;
  nodes: MapNode[];
}

export interface Run {
  seed: number;
  rngState: number;
  act: number;
  map: RunMap;
  currentNodeId: string | null;
  roster: Unit[];
  fallen: Unit[];
  gold: number;
  relics: RelicId[];
  stats: { battles: number; kills: number; recruits: number };
  /** Heroes already offered/recruited so offers don't repeat. */
  seenHeroes: string[];
  bossesFought: string[];
  battle?: Battle;
  uidCounter: number;
}

export interface Pos {
  x: number;
  y: number;
}
