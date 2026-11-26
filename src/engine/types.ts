// Core type definitions shared by the engine, content packs and UI.
// Everything stored in a Run or Battle is plain JSON so it can be saved.

export type WorldId = string;

export type WeaponType =
  | 'sword' | 'lance' | 'axe' | 'hammer' | 'dagger' | 'gauntlet'
  | 'bow' | 'sling' | 'boomerang' | 'hookshot'
  | 'magic' | 'staff' | 'natural' | 'instrument'
  /** Cannons, harpoons and other ship-mounted or crewed weapons. */
  | 'siege';

export type Element = 'fire' | 'ice' | 'lightning' | 'water' | 'light' | 'dark' | 'nature';

export type StatusKind =
  | 'dazed'
  | 'burn' | 'freeze' | 'shock' | 'poison' | 'stun'
  | 'silence' | 'root' | 'blind' | 'curse' | 'confuse' | 'sleep' | 'bleed' | 'fear' | 'weaken' | 'exposed'
  | 'regen' | 'inspired' | 'protected' | 'haste' | 'veiled'
  /** Twilight Princess: no conventional weapon attacks (Bubbles). Dark ChuChu turned to stone. */
  | 'weaponCurse' | 'petrified';

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
export type WarpKind = 'forest' | 'fire' | 'water' | 'spirit' | 'shadow' | 'light' | 'owl';

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
  grantedBy?: { weapons?: string[]; skill?: string; gear?: string[]; race?: string; templates?: string[]; everyone?: boolean; skills?: string[]; races?: string[] };
  /** Situational actions (Board, Disembark, Pick Up…): shown as their own button when usable, not in the Abilities menu. */
  contextual?: boolean;
  /** Hidden Skills: only units who have learned it (it's in their abilities) can use it. */
  hidden?: boolean;
  /** Mounted techniques: only while riding. */
  mounted?: boolean;
  /** Icon for contextual action buttons. */
  icon?: string;
  /** Songs: affects every ally/enemy within this many spaces (default 3). */
  radius?: number;
  /** Used once per turn at most (doesn't use the turn's action). */
  perTurn?: boolean;
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
export type Terrain = BaseTerrain | 'cracked' | 'timeBlock' | 'timeGap' | 'bridge'
  // Termina battlefield spaces
  | 'dekuFlower' | 'goldFlower' | 'owlStatue' | 'poisonWater' | 'frozenMech' | 'rollingRamp'
  | 'current' | 'waterwheel' | 'sunBlock' | 'weightedSwitch' | 'inversionSwitch' | 'mailbox'
  // Great Sea battlefield spaces
  | 'whirlpool' | 'updraft' | 'ropeSwing' | 'grapplePost' | 'hangingVine' | 'plantingSoil' | 'grownTree'
  | 'shipDeck' | 'boardingPoint' | 'cannonEmplacement' | 'submergedTreasure' | 'sandVortex' | 'spikedBarrel'
  | 'watchtower' | 'searchlight' | 'commandStatue'
  // Twilight Princess battlefield spaces
  | 'twilightFog' | 'twilightBarrier' | 'sacredLight' | 'spinnerRail' | 'spinnerGear' | 'clawshotGrate' | 'hangingPeahat'
  | 'magneticSurface' | 'magneticCrane' | 'dominionStatue' | 'sinkingSand' | 'iceWall' | 'iceBlock' | 'buriedPassage'
  | 'howlingStone' | 'windVent' | 'cannonTransport' | 'flames';

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
  /** Can only move through water (Lord Jabu-Jabu). */
  waterOnly?: boolean;
  /** Takes +50% damage from these elements. */
  weakTo?: Element[];
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
  /** Chance to inflict a status on a damaging hit. */
  inflict?: { status: StatusKind; chance: number; turns: number };
  /** After a hit, half damage also lands on: enemies next to the target ('adjacent'),
   *  enemies further along the line ('line'), or enemies next to the wielder ('around'). */
  splash?: 'adjacent' | 'line' | 'around';
  /** Heal this fraction of max HP after defeating an enemy. */
  healOnKill?: number;
  /** Attacks beyond 1 space are magical sword beams costing this much MP. */
  beam?: number;
  /** Durability lost per use (default 1; 0.5 = wears half as fast). */
  wearRate?: number;
  /** +1 Might per space moved before attacking, up to this cap. */
  momentum?: number;
  /** Only these races can wield it. */
  races?: string[];
  /** Wielder must be at least this size. */
  minSize?: number;
  /** Strikes twice when the wielder attacks from concealment (Veiled). */
  braveConcealed?: boolean;
  /** After defeating an enemy. */
  onKill?: 'undeadRally' | 'batSwarm';
  /** Purges the target's curse for bonus damage. */
  curseEater?: boolean;
  /** Can be wielded without matching the class's weapon types (signature gear). */
  anyClass?: boolean;
  // ── Wind Waker ──
  /** Counters twice (Ganondorf's Twin Swords). */
  counterTwice?: boolean;
  /** Extra Critical on parries. */
  parryCrit?: number;
  /** Damage multiplier against units carrying a shield. */
  vsShield?: number;
  /** Damage multiplier against armored units and constructs; breaks Darknut armor. */
  armorBreaker?: number;
  /** Extra damage against enemies on sand or sinking terrain. */
  sandBonus?: number;
  /** Reflects magic: the wielder takes half damage from spells. */
  reflectMagic?: boolean;
  /** Can be set alight: fire damage for 3 attacks, then it burns away. */
  ignitable?: boolean;
  /** Double combat experience while equipped. */
  doubleXp?: boolean;
  /** A hit anchors a vessel or large creature in place (Root). */
  anchors?: boolean;
  /** Cannon: needs a vessel, a cannoneer class or a Cannon Emplacement. */
  crewed?: boolean;
  // ── Twilight Princess ──
  /** Hidden Skills cost this much less stamina. */
  hiddenThrift?: number;
  noCrit?: boolean;
  /** Smashes ice walls and blocks. */
  breaksIce?: boolean;
  /** Gale Boomerang: pulls dropped items, puts out flames, pushes smaller targets 1 space. */
  gale?: boolean;
  /** Light Sword: purifies Twilight around the wielder. */
  dispelsTwilight?: boolean;
  /** Uses the higher of STR or MAG. */
  strOrMag?: boolean;
  /** Removes one beneficial buff from the target. */
  stripsBuff?: boolean;
  /** Fraction of demons' RES ignored. */
  sacredVsDemon?: number;
  spinRepeat?: boolean;
  /** Thrown explosives (never hurt the thrower). */
  bombs?: boolean;
  /** Mounted hits push smaller targets this many spaces. */
  mountedKnockback?: number;
  /** Purifies Twilight on the tile it strikes. */
  purifies?: boolean;
  pierceBarrier?: boolean;
  breaksBarriers?: boolean;
  /** Regrows for this much MP after being lost. */
  regrows?: number;
  /** Hits hidden and concealed targets without revealing them. */
  hitsConcealed?: boolean;
  /** Leaves burning ground along the attack. */
  burnsPath?: boolean;
  /** Ice pillars become obstacles. */
  iceObstacle?: boolean;
  /** Drains this much MP on hit. */
  drainsMp?: number;
  mpToWielder?: boolean;
  /** Fireballs a shield can bat back. */
  reflectable?: boolean;
  /** A ghostly rat clings on: −2 MOV for 2 turns. */
  burden?: boolean;
  /** Poe lanterns. */
  lantern?: boolean;
  /** Chilled: −2 MOV and SPD for a turn. */
  chill?: boolean;
  duplicateOnKill?: boolean;
  /** Randomly physical or magical. */
  unstable?: boolean;
  /** Natural contact attack that deals magic damage. */
  magicContact?: boolean;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type GearSlotKind = 'shield' | 'head' | 'body' | 'hands' | 'feet' | 'accessory' | 'mount' | VesselSlot;
/** Ship equipment slots (vessels only). */
export type VesselSlot = 'hull' | 'sail' | 'utility' | 'flag';
/** Equipment slots on a unit. Accessories have two slots. */
export type GearSlot = 'shield' | 'head' | 'body' | 'hands' | 'feet' | 'acc1' | 'acc2' | 'mount' | VesselSlot;
export const GEAR_SLOTS: GearSlot[] = ['shield', 'head', 'body', 'hands', 'feet', 'acc1', 'acc2', 'mount', 'hull', 'sail', 'utility', 'flag'];
export const VESSEL_SLOTS: VesselSlot[] = ['hull', 'sail', 'utility', 'flag'];

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
  /** Transformation masks: the form the wearer takes (Link's forms; Majora's Mask). */
  transform?: string;
  /** Can only be worn by units at least this size. */
  minSize?: number;
  /** MP spent each turn while transformed with this mask. */
  upkeep?: number;
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
  | 'flight' // the rider flies (Loftwing)
  | 'sleepImmune' | 'fearImmune' | 'curseImmune' | 'shockImmune'
  | 'stoneMask' // enemies ignore the wearer beyond 2 spaces until it attacks
  | 'healBoost' // +25% healing received
  | 'couple' // double support gains, +25% support bonuses
  | 'scents' // reveals buried treasure and traps within 4
  | 'garoSight' // reveals hidden enemies within 4
  | 'captain' // allied undead within 3 gain +2 SKL; undead recruits
  | 'gibdo' // Gibdos and ReDeads won't attack the wearer
  | 'postman' // double mailbox rewards
  | 'dekuCrown' // Deku allies within 2 gain +1 RES
  | 'fireWeak' // takes +50% fire damage
  | 'concealOnWait' // Veiled after a turn without attacking
  | 'remainsForest' | 'remainsMomentum' | 'remainsAquatic' | 'remainsGiant'
  | 'bubble' // negates the first damaging hit each battle
  | 'magicRange' // +1 range on magic
  | 'songThrift' // songs cost 25% less MP
  | 'timeThrift' // time songs cost 50% less MP
  | 'majoraEye' // offensive magic inflicts a random negative status
  | 'giantTear' // +5 max HP per point of size
  | 'phaseThrough' // move through enemy units
  | 'rollBoost' // rolling/charging +2 range and cheaper
  | 'balloon' // flight; takes double damage from bows and slings
  | 'jumpUnits' // can pass through units
  | 'composer' // your sleep and curse effects last 1 turn longer
  // ── Wind Waker ──
  | 'revealStats' // Hero's Charm: shows enemy weaknesses and equipment wear
  | 'parryStamina' // Hero's Clothes: parries restore 2 stamina
  | 'parryStamina5' // Orca's Champion Belt: parries restore 5 stamina
  | 'magicArmor' // damage is paid with MP (or Rupees) instead of HP
  | 'telescope' // +3 vision; reveals hidden enemies within 5
  | 'swiftSail' // vessels: always a favourable wind, +3 MOV
  | 'sail' // vessels: wind-powered movement
  | 'noCrit' // can't be critically hit
  | 'armorBreakGuard' // negates the first armor-breaking blow
  | 'poeCommand' // Poes won't attack the wearer; allied Poes nearby +2 STR
  | 'flightHit' // +15 Hit while airborne
  | 'quickBoard' // boarding doesn't end the turn
  | 'frontalGuard' // melee damage taken −25%
  | 'flyMov' // +1 MOV while flying
  | 'forestConceal' // hidden (Veiled) while standing in a forest
  | 'darkWard' // non-light magic damage taken −30%
  | 'stopFollowUp' // a successful block stops the attacker's follow-up
  | 'unmovable' // immune to forced movement
  | 'ropeGloves' // grappling range +2
  | 'twoHandedGrip' // two-handed weapons weigh 3 less
  | 'freePlanting' // planting doesn't use the action (once per turn)
  | 'deckBoots' // rope swings and ship decks cost 1 movement
  | 'landingStrike' // flyers who moved hit everything next to the target
  | 'pirateAura' // nearby pirates +2 STR and SKL
  | 'fireImmune' // no fire damage; fire magic restores 3 MP
  | 'jabunBlessing' // swim; regenerate 10% HP per turn in water
  | 'windCharm' // movement never reduced by the wind
  | 'cyclonePull' // wind attacks pull the target in
  | 'seagullSight' // +3 vision range
  | 'ritoCrestAura' // flying allies within 2 gain +10 Avoid
  | 'forestSeed' // grows a forest underfoot at the start of battle
  | 'constructCore' // +5 MP when you defeat a construct
  | 'helmarocPlume' // flyers +2 MOV and +15 Avoid
  | 'sandWalker' // ignores sinking sand and sand vortexes
  | 'dinPearl' // fire attacks restore 2 stamina
  | 'farorePearl' // techniques and movement abilities cost 25% less stamina
  | 'nayruPearl' // barriers absorb 50% more (Magic Armor halves MP cost)
  // ── Vessel equipment ──
  | 'spectralHull' // pass through obstacles
  | 'reinforcedSail' // immune to sail damage; half damage from wind attacks
  | 'boardingRamp' // infantry board without ending their turn
  | 'repairStation' // +5 HP per turn while stationary
  | 'grappleCrane' // salvage submerged treasure from 2 spaces
  | 'pirateFlag' // pirates aboard: the vessel gains +2 STR each
  | 'royalFlag' // passengers aboard: the vessel gains +2 DEF and RES
  | 'ghostFlag' // hidden from enemies at night
  // ── Twilight Princess ──
  | 'woodenShield' | 'zoraArmorWeak' | 'villageCharm' | 'hawkeye' | 'lantern' | 'clawshot' | 'spinner' | 'dominion' | 'horseCall'
  | 'freeTransform' | 'pierceBarrier' | 'warpGrant' | 'revealUndead' | 'phaseOnce' | 'warpThrift' | 'twilightRegen' | 'iceRegen'
  | 'armorLayers' | 'shadowWard' | 'freeShieldAttack' | 'bigGrapple' | 'shadowGrab' | 'snowWalker' | 'barrierWalker'
  | 'supportReach' | 'mountedThrift' | 'hiddenCrest' | 'warHorn' | 'twilightConceal' | 'healStamina' | 'sacredForest'
  | 'sacredFire' | 'purifyStep' | 'boneCrest' | 'iceJewel' | 'dragonHeart'
  // Extra units
  | 'healThrift' | 'extraFairy' | 'mpRegen3' | 'fireResist' | 'burningAura' | 'curseTouch' | 'pulsingGuard' | 'stillAvoid' | 'ambushBoost';

export type ItemKind =
  | 'heal' | 'fullHeal' | 'mp' | 'sta' | 'fairy' | 'bomb' | 'stun' | 'learn'
  /** Majora's Mask specials, resolved by id in engine/items.ts. */
  | 'special'
  /** cure: removes statuses; buff: timed stat boost; fruit: elemental throw; cloud: veils allies; muddle: confuses; bean: plants a sprout. */
  | 'cure' | 'buff' | 'fruit' | 'cloud' | 'muddle' | 'bean'
  /** Reusable tools (never used up). */
  | 'tool';

export type ToolKind = 'hookshot' | 'longshot' | 'lens' | 'fishing' | 'shovel' | 'pictograph' | 'telescope';

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
  /** bombs: only Gorons or units with this much CON can use it. */
  minCon?: number;
  /** bombs: also break ordinary walls. */
  breaksWalls?: boolean;
  /** special: targets a tile within minRange..maxRange (otherwise self). */
  targeted?: boolean;
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
  /** Regions of the Termina campaign (with the three-day cycle). */
  campaign?: 'termina' | 'greatSea' | 'twilight';
  /** Battles here are fought at sea (vessels, wind, islands). */
  naval?: boolean;
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
  /** Additional personal skills. */
  extraSkills?: SkillId[];
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
  /** Campaign this commander starts in by default. */
  campaign?: 'termina' | 'greatSea' | 'twilight';
  /** Weapons, gear and items handed out to the army at the start (commander first). */
  startingItems?: string[];
}

export type CommanderBonus = 'extraTreasure' | 'healing' | 'forging' | 'postBattleHeal' | 'rupees' | 'monsters'
  | 'transformThrift' | 'rolling' | 'aquatic' | 'dekuArmy' | 'undeadArmy' | 'lingeringStatus'
  | 'courageOfTheSea' | 'piratesSpoils' | 'dragonRoost' | 'forestRenewal' | 'hyrulesLegacy' | 'forsaken' | 'unrulyWinds'
  | 'forgottenTechniques' | 'childrenOfTwilight' | 'sacredResistance' | 'ancientMastery' | 'mightMakesRight' | 'endlessTwilight' | 'divinePower';

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
  /** Transformation mask currently in effect (gear id). */
  maskForm?: string;
  /** Turn on which a mask was last swapped (Hero of Masks: one free swap per turn). */
  maskTurn?: number;
  /** Deku Princess: who hurt her last round. */
  lastHitBy?: string;
  /** Has attacked this battle (breaks Stone Mask / concealment). */
  attacked?: boolean;
  /** Elegy of Emptiness statue / Bio Deku Baba sprout: removed after battle. */
  summoned?: boolean;
  /** Vessels: units carried aboard (off the map while aboard). */
  cargo?: Unit[];
  /** Vessels: components knocked out this battle. */
  damaged?: { sail?: boolean; mast?: boolean; rudder?: boolean; cannon?: boolean };
  /** Enemy vessel taken by your crew (joins the fleet after a victory). */
  captured?: boolean;
  /** Weapons picked up off the battlefield (usable even without training). */
  scavenged?: string[];
  /** Darknuts and armored foes: their armor has been smashed. */
  armorBroken?: boolean;
  /** Turns left under the Command Melody (reverts to its own side after). */
  commanded?: number;
  /** Turn a once-per-turn effect was last used (keyed by effect). */
  turnUses?: Record<string, number>;
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

export type NodeType = 'battle' | 'elite' | 'ambush' | 'siege' | 'dungeon' | 'event' | 'recruit' | 'shop' | 'camp' | 'fountain' | 'treasure' | 'blacksmith' | 'boss'
  /** Great Sea: open water with nothing in it. */
  | 'sea';

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
  traps?: { x: number; y: number; hidden: boolean; /** Player-placed (Death Armos Core): springs on enemies. */ armed?: boolean }[];
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
  /** Direction underwater currents push (Termina). */
  currentDir?: [number, number];
  /** Inversion switches flip these tiles between wall and plain. */
  invertTiles?: number[];
  /** Mailboxes already opened. */
  mailOpened?: number[];
  /** Inverted Song of Time: turns left with reinforcements and hazards delayed. */
  timeSlowed?: number;
  /** Weighted switch currently held. */
  switchHeld?: boolean;
  /** Skull Kid's army: inflicted statuses last longer. */
  statusBonus?: number;
  /** Termina night: undead regenerate (Igos's army). */
  night?: boolean;
  /** Enemies purified by the Song of Healing (they may join after the battle). */
  purified?: Unit[];
  /** Commander bonus active in this battle. */
  bonus?: CommanderBonus;
  /** Equipment and quest items the army owns (Spoils Bag, Deluxe Pictograph Box…). */
  owned?: string[];
  /** Naval battles: the prevailing wind (direction it blows toward). */
  wind?: [number, number];
  /** Weapons lying on the battlefield (disarmed or dropped by the fallen). */
  dropped?: { x: number; y: number; id: string }[];
  /** A fight at sea. */
  naval?: boolean;
  /** Searchlights have spotted you (Forsaken Fortress guards are alerted). */
  alarm?: boolean;
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
  /** Great Sea sectors: name shown on the chart, the island's region, and what must be done first. */
  label?: string;
  island?: string;
  locked?: 'pearls' | 'tower' | 'hyrule' | 'temples';
  /** Sea battles at this sector (vs. a fight on an island). */
  naval?: boolean;
  /** Special fleet (the Ghost Ship). */
  fleet?: string[];
  night?: boolean;
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
  /** Which campaign: the endless Hyrule war, Termina with its three-day cycle, or the Great Sea. */
  campaign?: 'hyrule' | 'termina' | 'greatSea' | 'twilight';
  /** Great Sea: the naval campaign's state. */
  sea?: SeaState;
  /** Termina: hours passed in the current three-day cycle (0-71) and resets so far. */
  clock?: { hours: number; resets: number };
  /** Termina: Rupees safe in the Clock Town bank (kept through the Song of Time). */
  bank?: number;
  /** Quest items (don't use pack slots). */
  questItems?: string[];
  /** Chamber of Trials modifiers for this campaign. */
  trials?: string[];
  /** Permanent bonuses bought between runs. */
  metaBonus?: { armyCap?: number; cp?: number };
  /** Discovered support conversations (keys 'templateA|templateB|rank'). */
  convosSeen?: string[];
  /** Form-specific support conversations unlocked (pair key#form). */
  formSupports?: string[];
  /** uids chosen for the pending battle. */
  deployment?: string[];
  uidCounter: number;
}

export interface Pos {
  x: number;
  y: number;
}

/** The Great Sea campaign: fleet stats and the chart. */
export interface SeaState {
  /** Maximum vessels owned. */
  fleetCap: number;
  /** Maximum vessels deployed in a naval battle. */
  navalDeploy: number;
  /** Hidden routes and encounters: how far the chart is revealed around you. */
  navigation: number;
  /** Submerged treasure rewards. */
  salvage: number;
  /** 0-100: pirate, merchant and maritime recruits. */
  reputation: number;
  /** Sector ids revealed on the chart. */
  revealed: string[];
  /** Islands cleared. */
  cleared: string[];
  /** Charts completed (each new chart is harder). */
  charts: number;
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
  | { kind: 'support'; amount: number }
  /** Quest items. */
  | { kind: 'quest'; id: string }
  /** Great Sea: navigation, salvage or naval reputation. */
  | { kind: 'sea'; stat: 'navigation' | 'salvage' | 'reputation' | 'fleetCap'; amount: number }
  /** Damage (negative) or repair (positive) the fleet's vessels by a fraction of max HP. */
  | { kind: 'fleet'; pct: number }
  /** Army supplies. */
  | { kind: 'supplies'; amount: number }
  | { kind: 'takeQuest'; id: string }
  /** Twilight Princess: the Hero's Shade teaches a random Hidden Skill to a swordsman. */
  | { kind: 'hiddenSkill' }
  /** Release a full Vessel of Light (or keep the Twilight for now). */
  | { kind: 'restoreLight' } | { kind: 'delayLight' };

/** Conditions for an event or a single choice. */
export interface EventRequires {
  quest?: string[];
  noQuest?: string[];
  /** Equipment owned by anyone in the army (or the convoy). */
  gear?: string[];
  /** A unit from one of these templates is in the army. */
  unit?: string[];
  noGear?: string[];
  /** Number of masks owned. */
  maskCount?: number;
}

export interface EventOutcome {
  text: string;
  effects: EventEffect[];
}

export interface EventChoice {
  label: string;
  requires?: EventRequires;
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
  requires?: EventRequires;
  choices: EventChoice[];
}
