// Core type definitions shared by the engine, content packs and UI.
// Everything stored in a Run or Battle is plain JSON so it can be saved.

export type WorldId = string;

export type WeaponType =
  | 'sword' | 'lance' | 'axe' | 'hammer' | 'dagger' | 'gauntlet'
  | 'bow' | 'sling' | 'boomerang' | 'hookshot'
  | 'magic' | 'staff' | 'natural';

/**
 * foot/armor/cavalry/flying are standard; `fixed` never moves (e.g. the Great
 * Deku Tree). Racial traits (Zora swimming, Kokiri forest-walking) layer on top.
 */
export type MoveType = 'foot' | 'cavalry' | 'armor' | 'flying' | 'fixed';

export type Terrain = 'plain' | 'forest' | 'mountain' | 'water' | 'wall' | 'fort' | 'lava';

export type Team = 'player' | 'enemy';

/** Stats that can grow on level-up. */
export type StatKey = 'hp' | 'str' | 'mag' | 'skl' | 'spd' | 'def' | 'res' | 'lck';

export type Stats = Record<StatKey, number> & {
  con: number;
  mov: number;
  /** Reserved for techniques (not used in combat yet). */
  sta: number;
  /** Reserved for spells and songs (not used in combat yet). */
  mp: number;
};
export type Growths = Record<StatKey, number>;

export interface RaceDef {
  id: string;
  name: string;
  desc: string;
  /** Extra unit tags, e.g. 'undead', 'demon', 'beast' (used by effectiveness). */
  tags?: string[];
  swims?: boolean;
  forestWalker?: boolean;
  lavaImmune?: boolean;
  flies?: boolean;
  growthMods?: Partial<Growths>;
}

export interface ClassDef {
  id: string;
  name: string;
  weapons: WeaponType[];
  moveType: MoveType;
  /** Base stats used by generic units and enemies of this class. */
  base: Stats;
  growths: Growths;
  icon: string;
  tags?: string[];
}

export interface WeaponDef {
  id: string;
  name: string;
  type: WeaponType;
  might: number;
  hit: number;
  crit: number;
  weight: number;
  minRange: number;
  maxRange: number;
  rarity: Rarity;
  price: number;
  /** Tags or move types this weapon deals double might against. */
  effective?: string[];
  /** Fraction (0-1) of the target's Def/Res ignored. */
  pierce?: number;
  /** Strikes twice when initiating combat. */
  brave?: boolean;
  twoHanded?: boolean;
  /** Healing power multiplier for staves (e.g. 1.5 = +50%). */
  healBonus?: number;
  desc?: string;
  /** Not sold in shops (boss drops, signature gear, natural weapons). */
  unique?: boolean;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface AccessoryDef {
  id: string;
  name: string;
  rarity: Rarity;
  price: number;
  stats: Partial<Stats> & { hit?: number; avoid?: number; crit?: number };
  desc: string;
  /** Engine-implemented special effects. */
  effects?: AccessoryEffect[];
  unique?: boolean;
}

export type AccessoryEffect =
  | 'surviveOnce' // Triforce of Courage
  | 'desperation' // Triforce of Power: +25% damage below half HP
  | 'crestAura' // Royal Family Crest: adjacent allies +5 hit
  | 'beastSlayer' // +3 STR vs beasts
  | 'giantEye' // +20 hit vs size 2+
  | 'mountedAvoid' // +10 avoid while mounted
  | 'forestRegen' // +2 HP/turn in forests
  | 'lightAura'; // adjacent allies recover 3 HP per turn

export interface PermanentItemDef {
  id: string;
  name: string;
  price: number;
  stat: keyof Stats;
  amount: number;
  desc: string;
}

export interface WorldDef {
  id: WorldId;
  name: string;
  genre: string;
  blurb: string;
  color: string;
  terrainNames: Record<Terrain, string>;
  terrainColors: Record<Terrain, string>;
  map: MapStyle;
}

export interface MapStyle {
  forest: number; // clumps per 100 tiles
  mountain: number;
  water: 'none' | 'river' | 'lake' | 'moat' | 'many';
  walls: number; // wall segments
  forts: number;
  lava?: boolean; // water features become lava
}

/** Template for a recruitable unit (named hero or generic soldier). */
export interface UnitTemplate {
  id: string;
  name: string;
  title: string;
  race: string;
  classId: string;
  size: number;
  /** Level 1 stats. */
  stats: Stats;
  /** Overrides the class+race growths if given. */
  growths?: Partial<Growths>;
  weapons: string[];
  skill?: SkillId;
  glyph: string;
  bio: string;
  /** Home region (colours the token). */
  home: WorldId;
  /** Generic units can be recruited many times and get small stat variance. */
  generic?: boolean;
  /** Only recruitable by monster armies (e.g. Ganondorf's). */
  monster?: boolean;
  /** Cannot be in the same army as these template ids. */
  exclusiveWith?: string[];
}

export interface EnemyArchetype {
  id: string;
  name: string;
  race: string;
  classId: string;
  size?: number;
  weapons: string[];
  skill?: SkillId;
  /** Overrides class base stats. */
  stats?: Partial<Stats>;
  ai?: 'aggressive' | 'guard' | 'stationary';
  glyph?: string;
}

export interface BossDef extends EnemyArchetype {
  title: string;
  home: WorldId;
  stats: Stats;
  glyph: string;
  quote: string;
  /** Equipment that can drop on defeat. */
  drops?: string[];
}

export interface CommanderDef {
  heroId: string;
  armyName: string;
  units: string[]; // template ids, excluding the commander
  bonus: CommanderBonus;
  bonusText: string;
  startingItems?: string[]; // accessory / permanent item ids
}

export type CommanderBonus = 'extraTreasure' | 'healing' | 'forging' | 'postBattleHeal' | 'rupees' | 'monsters';

export type SkillId = string;

export interface SkillDef {
  id: SkillId;
  name: string;
  desc: string;
  /** False if the effect isn't implemented yet (shown in the UI as such). */
  implemented: boolean;
}

export interface Unit {
  uid: string;
  templateId?: string;
  name: string;
  title: string;
  race: string;
  home: WorldId;
  classId: string;
  team: Team;
  size: number;
  level: number;
  xp: number;
  /** Permanent stats; `stats.hp` is max HP. */
  stats: Stats;
  growths: Growths;
  hp: number;
  /** Carried weapons; index 0 is equipped. */
  weapons: string[];
  accessory?: string;
  skills: SkillId[];
  glyph: string;
  isCommander?: boolean;
  isBoss?: boolean;
  bossId?: string;
  ai?: 'aggressive' | 'guard' | 'stationary';
  // Battle state
  x: number; // top-left of footprint
  y: number;
  moved: boolean;
  acted: boolean;
  kills: number;
  movedDist: number;
  survivedOnce?: boolean;
}

export type ObjectiveType = 'rout' | 'boss' | 'survive';

export interface Objective {
  type: ObjectiveType;
  turns?: number;
}

export type NodeType = 'battle' | 'elite' | 'recruit' | 'shop' | 'camp' | 'fountain' | 'treasure' | 'boss';

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
  result?: 'won' | 'lost';
  rewardRupees: number;
  nodeType: NodeType;
  log: string[];
  fallen: Unit[];
  enemyLevel: number;
  uidCounter: number;
  /** Impa's Royal Protector: used this enemy phase. */
  interceptUsed: boolean;
  /** Army-wide healing multiplier from the commander bonus. */
  healMult: number;
  /** Loot dropped by bosses this battle. */
  drops: string[];
}

export interface MapNode {
  id: string;
  row: number;
  col: number;
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
  /** Region number, 1-based, increases forever. */
  act: number;
  region: WorldId;
  regionsVisited: WorldId[];
  map: RunMap;
  currentNodeId: string | null;
  roster: Unit[];
  fallen: Unit[];
  rupees: number;
  /** Unequipped weapons/accessories. */
  convoy: string[];
  commanderId: string;
  bonus: CommanderBonus;
  stats: { battles: number; kills: number; recruits: number };
  seenHeroes: string[];
  bossesFought: string[];
  battle?: Battle;
  /** uids chosen for the pending battle. */
  deployment?: string[];
  uidCounter: number;
}

export interface Pos {
  x: number;
  y: number;
}
