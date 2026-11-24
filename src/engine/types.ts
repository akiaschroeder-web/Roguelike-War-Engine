// Core type definitions shared by the engine, content packs and UI.
// Everything stored in a Run or Battle is plain JSON so it can be saved.

export type WorldId = string;

export type WeaponType =
  | 'sword' | 'lance' | 'axe' | 'hammer' | 'dagger' | 'gauntlet'
  | 'bow' | 'sling' | 'boomerang' | 'hookshot'
  | 'magic' | 'staff' | 'natural' | 'instrument';

export type Element = 'fire' | 'ice' | 'lightning' | 'water' | 'light' | 'dark' | 'nature';

export type StatusKind = 'burn' | 'freeze' | 'shock' | 'poison' | 'stun';

export interface Status {
  kind: StatusKind;
  turns: number;
}

/** A timed bonus (songs, spells). `barrier` negates all damage while active. */
export interface Buff {
  id: string;
  name: string;
  turns: number;
  stats?: Partial<Record<StatKey | 'mov', number>>;
  barrier?: boolean;
}

export type AbilityKind = 'spell' | 'song' | 'arrow' | 'technique' | 'personal';

/** Where a warp song can take the performer. */
export type WarpKind = 'forest' | 'fire' | 'water' | 'spirit' | 'shadow' | 'light';

/** Spells, songs, elemental arrows and once-per-battle personal abilities. */
export interface AbilityDef {
  id: string;
  name: string;
  kind: AbilityKind;
  mp: number;
  /** Techniques cost stamina instead of MP. */
  sta?: number;
  /** Techniques: which weapon types can use it (everyone with such a weapon knows it). */
  weaponTypes?: WeaponType[];
  /** Area technique used from the Abilities menu (Spin Attack) rather than in the forecast. */
  area?: boolean;
  /** Warp songs: destination type; turns before it can be used again. */
  warp?: WarpKind;
  cooldown?: number;
  desc: string;
  /** Attack modifiers (arrows, techniques): added might/hit/crit, element, effectiveness. */
  might?: number;
  hit?: number;
  crit?: number;
  element?: Element;
  effective?: string[];
  /** Personal abilities: usable once per battle. */
  oncePerBattle?: boolean;
  implemented: boolean;
}

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
  /** Element: may inflict a status (fire burns, ice freezes, lightning shocks, nature poisons). */
  element?: Element;
  /** Instruments: MP discount on songs. */
  songDiscount?: number;
  /** Healing power multiplier for staves (e.g. 1.5 = +50%). */
  healBonus?: number;
  desc?: string;
  /** Not sold in shops (boss drops, signature gear, natural weapons). */
  unique?: boolean;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type GearSlotKind = 'shield' | 'head' | 'body' | 'hands' | 'feet' | 'accessory';
/** Equipment slots on a unit. Accessories have two slots. */
export type GearSlot = 'shield' | 'head' | 'body' | 'hands' | 'feet' | 'acc1' | 'acc2';
export const GEAR_SLOTS: GearSlot[] = ['shield', 'head', 'body', 'hands', 'feet', 'acc1', 'acc2'];

export interface GearDef {
  id: string;
  name: string;
  slot: GearSlotKind;
  rarity: Rarity;
  price: number;
  /** block = % chance to halve a hit's damage (shields). */
  stats: Partial<Stats> & { hit?: number; avoid?: number; crit?: number; block?: number };
  desc: string;
  /** Engine-implemented special effects. */
  effects?: GearEffect[];
  unique?: boolean;
}

export type GearEffect =
  | 'surviveOnce' // Triforce of Courage
  | 'desperation' // Triforce of Power: +25% damage below half HP
  | 'crestAura' // Royal Family Crest: adjacent allies +5 hit
  | 'beastSlayer' // +3 STR vs beasts
  | 'giantEye' // +20 hit vs size 2+
  | 'mountedAvoid' // +10 avoid while mounted
  | 'forestRegen' // +2 HP/turn in forests
  | 'lightAura' // adjacent allies recover 3 HP per turn
  | 'lavaImmune' // Goron Tunic: no lava damage
  | 'swim' // Zora Tunic / scales: can enter deep water
  | 'critGuard' // Stalfos Shield: crits deal ×2 instead of ×3
  | 'mpRegen'; // +2 MP at the start of each turn

export type ItemKind = 'heal' | 'fullHeal' | 'mp' | 'sta' | 'fairy' | 'bomb' | 'stun' | 'learn';

/** Consumables carried in a unit's 6-slot pack. */
export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  rarity: Rarity;
  price: number;
  /** Heal amount or damage. */
  power: number;
  /** Uses per stack (e.g. Lon Lon Milk has 2 servings, Bombs come in 3s). */
  uses: number;
  /** Targeted items: range from the user, and blast radius around the target tile. */
  minRange?: number;
  maxRange?: number;
  radius?: number;
  /** 'learn' items teach this ability when used. */
  teaches?: string;
  desc: string;
}

export interface PackItem {
  id: string;
  uses: number;
}

export const PACK_SIZE = 6;

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
  /** Spells/songs/arrows known from the start. */
  abilities?: string[];
  glyph: string;
  bio: string;
  /** Home region (colours the token). */
  home: WorldId;
  /** Generic units can be recruited many times and get small stat variance. */
  generic?: boolean;
  /** A monster unit (Ganondorf's army sees these more often in recruitment). */
  monster?: boolean;
  /** Bosses and villains: offered less often in recruitment. */
  rare?: boolean;
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

/** A non-monster army that can oppose you. */
export interface FactionDef {
  id: string;
  name: string;
  desc: string;
  /** Generic template ids (repeats raise their odds). */
  units: string[];
  /** Named template ids that can lead elite fights. */
  leaders: string[];
  /** Region id -> weight. */
  regions: Record<string, number>;
  /** Draws named heroes from the whole cast instead. */
  rivals?: boolean;
}

/** Who you're fighting in a battle. */
export interface EnemyForce {
  name: string;
  desc?: string;
  /** Template ids to draw soldiers from (empty for pure monster battles). */
  templates: string[];
  /** Also include the region's monsters. */
  monsters: boolean;
  /** Monsters come from every region, not just this one. */
  anyMonsters?: boolean;
  /** Named rival heroes (each appears at most once). */
  heroes?: string[];
  /** Named leader for elite fights (replaces the monster boss). */
  leader?: string;
}

export interface CommanderDef {
  heroId: string;
  armyName: string;
  units: string[]; // template ids, excluding the commander
  bonus: CommanderBonus;
  bonusText: string;
  /** Weapons, gear and items handed out to the army at the start (commander first). */
  startingItems?: string[];
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
  gear: Partial<Record<GearSlot, string>>;
  pack: PackItem[];
  /** Current MP (max is stats.mp). Refills at the start of each battle. */
  mp: number;
  /** Current stamina (max is stats.sta). Refills each battle, +2 per turn. */
  sta: number;
  /** Ability id -> turns until usable again. */
  cooldowns?: Record<string, number>;
  statuses: Status[];
  buffs: Buff[];
  /** Known spells, songs and elemental arrows. */
  abilities: string[];
  /** Once-per-battle abilities already used. */
  usedAbilities?: string[];
  /** Farore's Wind return point. */
  faroreMark?: Pos;
  skills: SkillId[];
  glyph: string;
  /** Enemy archetype id (used for shared art). */
  artId?: string;
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
  /** Name of the army you're fighting (non-monster battles). */
  forceName?: string;
  /** Rain from Song of Storms. */
  weather?: { kind: 'rain'; turns: number };
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
