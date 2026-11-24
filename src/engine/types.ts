// Core type definitions shared by the engine, content packs and UI.
// Everything stored in a Run or Battle is plain JSON so it can be saved.

export type WorldId = string;

export type WeaponType =
  | 'sword' | 'lance' | 'axe' | 'hammer' | 'dagger' | 'gauntlet'
  | 'bow' | 'sling' | 'boomerang' | 'hookshot'
  | 'magic' | 'staff' | 'natural' | 'instrument';

export type Element = 'fire' | 'ice' | 'lightning' | 'water' | 'light' | 'dark' | 'nature';

export type StatusKind =
  | 'burn' | 'freeze' | 'shock' | 'poison' | 'stun'
  | 'silence' | 'root' | 'blind' | 'curse' | 'confuse' | 'sleep' | 'bleed' | 'fear' | 'weaken' | 'exposed'
  | 'regen' | 'inspired' | 'protected' | 'haste' | 'veiled';

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
  /** Known automatically by anyone carrying one of these weapons or having this skill. */
  grantedBy?: { weapons?: string[]; skill?: string };
  /** Doesn't end the unit's turn (Hookshot: you can still attack). */
  freeAction?: boolean;
  implemented: boolean;
}

/**
 * foot/armor/cavalry/flying are standard; `fixed` never moves (e.g. the Great
 * Deku Tree). Racial traits (Zora swimming, Kokiri forest-walking) layer on top.
 */
export type MoveType = 'foot' | 'cavalry' | 'armor' | 'flying' | 'fixed';

export type BaseTerrain = 'plain' | 'forest' | 'mountain' | 'water' | 'wall' | 'fort' | 'lava';
/** Special terrain: cracked walls (bombs break them), Time Blocks (Song of Time), bridges (Magic Beans, Master Builder). */
export type Terrain = BaseTerrain | 'cracked' | 'timeBlock' | 'timeGap' | 'bridge';

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
  /** Durability (uses). Omit for the rarity default; 0 = unbreakable. */
  uses?: number;
  /** What the weapon becomes when it breaks (e.g. Giant's Knife -> Broken Giant's Knife). */
  brokenInto?: string;
  /** Instruments: MP discount on songs. */
  songDiscount?: number;
  /** Healing power multiplier for staves (e.g. 1.5 = +50%). */
  healBonus?: number;
  desc?: string;
  /** Not sold in shops (boss drops, signature gear, natural weapons). */
  unique?: boolean;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type GearSlotKind = 'shield' | 'head' | 'body' | 'hands' | 'feet' | 'accessory' | 'mount';
/** Equipment slots on a unit. Accessories have two slots. */
export type GearSlot = 'shield' | 'head' | 'body' | 'hands' | 'feet' | 'acc1' | 'acc2' | 'mount';
export const GEAR_SLOTS: GearSlot[] = ['shield', 'head', 'body', 'hands', 'feet', 'acc1', 'acc2', 'mount'];

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
  /** Mounts: footprint size while riding (the rider becomes at least this big). */
  size?: number;
  /** Art id for the battle animation (mounts). */
  art?: string;
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
  | 'mpRegen' // +2 MP at the start of each turn
  | 'canto' // Epona: can move again after attacking, with leftover movement
  | 'forestRunner' // forests cost 1 movement while riding
  | 'mountainWalker' // mountains passable (cost 2) while riding
  | 'phantomRide' // ride straight through enemy units
  | 'charge' // +2 damage when attacking after moving 3+ spaces
  | 'intimidate' // enemies within 2 spaces have −5 Avoid
  | 'staRegen' // +2 extra stamina per turn
  | 'flight'; // the rider flies (Loftwing)

export type ItemKind =
  | 'heal' | 'fullHeal' | 'mp' | 'sta' | 'fairy' | 'bomb' | 'stun' | 'learn'
  /** cure: removes statuses; buff: timed stat boost; fruit: elemental throw; cloud: veils allies; muddle: confuses; bean: plants a sprout. */
  | 'cure' | 'buff' | 'fruit' | 'cloud' | 'muddle' | 'bean'
  /** Reusable tools (never used up). */
  | 'tool';

export type ToolKind = 'hookshot' | 'longshot' | 'lens' | 'fishing' | 'shovel';

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
  /** cure: statuses removed ('negative' = every harmful status). */
  cures?: StatusKind[] | 'negative';
  /** fruit/muddle/cloud: status applied (turns = 2 unless set). */
  status?: StatusKind;
  statusTurns?: number;
  element?: Element;
  /** buff items: stat bonus and duration. */
  buff?: Partial<Record<StatKey | 'mov', number>>;
  buffTurns?: number;
  tool?: ToolKind;
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
  terrainNames: Record<BaseTerrain, string>;
  terrainColors: Record<BaseTerrain, string>;
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
  /** Gear equipped from the start (e.g. a mount). */
  gear?: Partial<Record<GearSlot, string>>;
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
  /** Abilities (e.g. Koume and Kotake can fuse). */
  abilities?: string[];
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
  /** Weapon id -> uses spent (durability wear). */
  wear?: Record<string, number>;
  /** Weapon id -> Blacksmith improvement level (+1 Might each, max 3). */
  forge?: Record<string, number>;
  /** In battle: riding the equipped mount (false after dismounting). */
  mounted?: boolean;
  /** Size on foot (size grows while mounted). */
  baseSize?: number;
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
  /** Invisible until revealed (Lens of Truth, adjacency, Dampé). */
  hidden?: boolean;
  /** Allied NPC on your side, moved by the computer in the Allied Phase. */
  npc?: boolean;
  /** Escort target: must survive and reach the exit. */
  vip?: boolean;
  /** Prisoner: can't act until a unit frees them. */
  captive?: boolean;
  /** A freed prisoner (joins the army after a victory). */
  rescued?: boolean;
  // Battle state
  x: number; // top-left of footprint
  y: number;
  moved: boolean;
  acted: boolean;
  kills: number;
  movedDist: number;
  survivedOnce?: boolean;
}

export type ObjectiveType = 'rout' | 'boss' | 'survive' | 'seize' | 'defend' | 'escape' | 'capture' | 'escort' | 'rescue';

export interface Objective {
  type: ObjectiveType;
  turns?: number;
  /** Target tiles: the throne to seize, the point to defend, the exit, or the points to capture. */
  tiles?: Pos[];
  /** Capture: how many points must be held at once. */
  need?: number;
}

/** Optional bonus goal for extra rewards. */
export interface SideQuest {
  kind: 'fast' | 'noLoss';
  turns?: number;
  rupees: number;
  item?: string;
}

export type NodeType = 'battle' | 'elite' | 'ambush' | 'siege' | 'dungeon' | 'event' | 'recruit' | 'shop' | 'camp' | 'fountain' | 'treasure' | 'blacksmith' | 'boss';

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
  /** Ambush: the opening enemy phase has happened. */
  ambushed?: boolean;
  /** Lost the objective but the army escapes (no game over). */
  retreat?: boolean;
  rewardRupees: number;
  nodeType: NodeType;
  log: string[];
  fallen: Unit[];
  enemyLevel: number;
  uidCounter: number;
  /** Impa's Royal Protector: used this enemy phase. */
  interceptUsed: boolean;
  /** Optional bonus goal. */
  sideQuest?: SideQuest;
  /** Support points for the deployed army (copied from the run). */
  supports?: Record<string, number>;
  /** Name of the army you're fighting (non-monster battles). */
  forceName?: string;
  /** Rain (Song of Storms, storms) or a sandstorm (−15 Hit for everyone). */
  weather?: { kind: 'rain' | 'sandstorm'; turns: number };
  /** Burning tiles (spread through forests; rain puts them out). */
  fires?: { x: number; y: number; turns: number }[];
  /** Magic Bean sprouts: grow into a bridge (on water) or thicket after `turns`. */
  sprouts?: { x: number; y: number; turns: number }[];
  /** Hidden spike traps (hurt and root player units; the Lens of Truth reveals them). */
  traps?: { x: number; y: number; hidden: boolean }[];
  /** Buried treasure: dig with a Shovel (or Dampé). */
  digSpots?: Pos[];
  /** Fog of war: enemies are only visible near your units. */
  fog?: boolean;
  /** Items and Rupees found during the battle (handed out afterwards). */
  loot?: string[];
  bonusRupees?: number;
  /** 0 in the first region (bosses and leaders hit softer), rising later. */
  bossTier?: number;
  /** Command Points for orders this battle. */
  cp?: number;
  cpMax?: number;
  /** Orders this commander can give. */
  orders?: OrderId[];
  /** Coordinated Strike: active on this turn. */
  coordinatedTurn?: number;
  /** Army morale (0-100) for Hit/Avoid. */
  morale?: number;
  /** Benched units that can be brought in with Reinforce. */
  reserves?: Unit[];
  /** Units pulled out with Emergency Retreat (they survive). */
  withdrawn?: Unit[];
  /** Army-wide healing multiplier from the commander bonus. */
  healMult: number;
  /** Loot dropped by bosses this battle. */
  drops: string[];
}

export interface Army {
  level: number;
  xp: number;
  supplies: number;
  materials: number;
  /** 0-100: Hit and Avoid bonus or penalty for the whole army. */
  morale: number;
  /** 0-100: shop discounts and better recruits. */
  reputation: number;
  fairyDust: number;
  sacredEnergy: number;
  /** Blessing bought with Sacred Energy, applied at the start of the next battle. */
  blessing?: 'din' | 'nayru' | 'farore';
  /** Feast at camp: everyone starts the next battle Inspired. */
  feast?: boolean;
}

export type OrderId = 'rally' | 'forcedMarch' | 'defensiveFormation' | 'focusFire' | 'emergencyRetreat' | 'reinforce' | 'holdTheLine' | 'coordinatedStrike' | 'secondWind';

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
  /** Wear/forge state of weapons sitting in the convoy, by weapon id. */
  itemState?: Record<string, { wear?: number; forge?: number }>;
  /** Support points between pairs of units (key: 'uidA|uidB', sorted). */
  supports?: Record<string, number>;
  /** Random events already seen this run. */
  eventsSeen?: string[];
  /** Dungeon in progress: current floor out of `of`. */
  dungeon?: { floor: number; of: number };
  /** Army-wide stats and resources. */
  army?: Army;
  /** Which campaign: the endless Hyrule war, or Termina with its three-day cycle. */
  campaign?: 'hyrule' | 'termina';
  /** Chamber of Trials modifiers for this campaign. */
  trials?: string[];
  /** Permanent bonuses bought between runs. */
  metaBonus?: { armyCap?: number; cp?: number };
  /** Discovered support conversations (keys 'templateA|templateB|rank'). */
  convosSeen?: string[];
  /** uids chosen for the pending battle. */
  deployment?: string[];
  uidCounter: number;
}

export interface Pos {
  x: number;
  y: number;
}

// ───────────────────────── Random events ─────────────────────────

export type EventEffect =
  | { kind: 'rupees'; amount: number }
  /** Heal (positive) or hurt (negative) the whole army by a fraction of max HP. Damage never kills. */
  | { kind: 'hp'; pct: number }
  | { kind: 'xp'; amount: number }
  /** An item, weapon or gear to the convoy (random from the list). */
  | { kind: 'loot'; ids: string[] }
  /** A random template from the list joins the army. */
  | { kind: 'recruit'; pool: string[] }
  /** A random unit gains a permanent stat bonus. */
  | { kind: 'stat'; stat: StatKey; amount: number }
  /** Every pair in the army gains support points. */
  | { kind: 'support'; amount: number };

export interface EventOutcome {
  text: string;
  effects: EventEffect[];
}

export interface EventChoice {
  label: string;
  /** Rupees paid up front (the choice is greyed out if you can't afford it). */
  cost?: number;
  /** Plain outcome, or a gamble. */
  outcome?: EventOutcome;
  gamble?: { chance: number; win: EventOutcome; lose: EventOutcome };
}

export interface EventDef {
  id: string;
  title: string;
  text: string;
  /** Art id for the event picture. */
  art?: string;
  /** Only in these regions (all if omitted). */
  regions?: WorldId[];
  choices: EventChoice[];
}
