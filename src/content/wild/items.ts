import type { Element, ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;
const sp = (id: string, name: string, rarity: ItemDef['rarity'], price: number, desc: string, extra: Partial<ItemDef> = {}): ItemDef =>
  ({ id, name, kind: 'special', rarity, price, power: 0, uses: 1, desc, ...extra });
const throwIt = (id: string, name: string, rarity: ItemDef['rarity'], price: number, desc: string, extra: Partial<ItemDef> = {}): ItemDef =>
  sp(id, name, rarity, price, desc, { targeted: true, minRange: 1, maxRange: 3, radius: 1, uses: 2, ...extra });
const dev = (id: string, name: string, rarity: ItemDef['rarity'], price: number, desc: string, extra: Partial<ItemDef> = {}): ItemDef =>
  sp(id, name, rarity, price, desc, { uses: 1, ...extra });

export type CookFamily = 'fruit' | 'hearty' | 'energizing' | 'enduring' | 'mighty' | 'tough' | 'sneaky' | 'hasty' | 'spicy' | 'chilly' | 'electro'
  | 'bright' | 'sunny' | 'warding' | 'sticky' | 'basic' | 'meat' | 'fireproof';

export interface FuseData {
  /** Might added to a weapon (or DEF to a shield). */
  might: number;
  element?: Element;
  /** Breaks after one attack (Gibdo Bone, Ancient Blade). */
  single?: boolean;
  /** Zonai part: Zonaite weapons give +50%. */
  zonai?: boolean;
  /** Extra effect, shown in the description. */
  fx?: 'blunt' | 'armor' | 'knockback' | 'cutting' | 'impact' | 'crit' | 'sweep' | 'crushing' | 'element' | 'bone' | 'mining' | 'heavy' | 'ancient' | 'gem' | 'light' | 'restore';
  /** Gemstones: what they do on a shield. */
  shield?: string;
}

export interface WildMaterial {
  id: string;
  name: string;
  kind: 'food' | 'critter' | 'monster' | 'ancient' | 'zonai' | 'gem' | 'fuse' | 'dragon' | 'misc';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  family?: CookFamily;
  fuse?: FuseData;
  use: string;
}

const food = (id: string, name: string, family: CookFamily, rarity: WildMaterial['rarity'] = 'common'): WildMaterial => ({ id, name, kind: 'food', rarity, family, use: `${family} cooking` });
const critter = (id: string, name: string, family: CookFamily, rarity: WildMaterial['rarity'] = 'uncommon'): WildMaterial => ({ id, name, kind: 'critter', rarity, family, use: `${family} elixirs` });
const mon = (id: string, name: string, rarity: WildMaterial['rarity'], fuse?: FuseData, use = 'elixirs and trading'): WildMaterial => ({ id, name, kind: 'monster', rarity, fuse, use });
const fz = (id: string, name: string, kind: WildMaterial['kind'], rarity: WildMaterial['rarity'], fuse: FuseData, use: string): WildMaterial => ({ id, name, kind, rarity, fuse, use });

/** Ingredients and materials (section 21). Like Skyward Sword's treasures, they live in the quest inventory. */
export const MATERIALS: WildMaterial[] = [
  // ── Food families ──
  food('apple', 'Apple', 'fruit'), food('wildberry', 'Wildberry', 'fruit'), food('palmFruit', 'Palm Fruit', 'fruit'), food('hylianTomato', 'Hylian Tomato', 'fruit'),
  food('acorn', 'Acorn', 'fruit'), food('chickalooTreeNut', 'Chickaloo Tree Nut', 'fruit'),
  food('heartyDurian', 'Hearty Durian', 'hearty', 'rare'), food('heartyRadish', 'Hearty Radish', 'hearty', 'uncommon'), food('bigHeartyRadish', 'Big Hearty Radish', 'hearty', 'rare'),
  food('heartyTruffle', 'Hearty Truffle', 'hearty', 'uncommon'), food('bigHeartyTruffle', 'Big Hearty Truffle', 'hearty', 'rare'),
  food('stamellaShroom', 'Stamella Shroom', 'energizing'), food('staminokaBass', 'Staminoka Bass', 'energizing', 'uncommon'), food('courserBeeHoney', 'Courser Bee Honey', 'energizing', 'uncommon'), food('stambulb', 'Stambulb', 'energizing'),
  food('enduraShroom', 'Endura Shroom', 'enduring', 'rare'), food('enduraCarrot', 'Endura Carrot', 'enduring', 'rare'),
  food('mightyBananas', 'Mighty Bananas', 'mighty'), food('mightyThistle', 'Mighty Thistle', 'mighty'), food('razorshroom', 'Razorshroom', 'mighty'), food('mightyCarp', 'Mighty Carp', 'mighty', 'uncommon'), food('mightyPorgy', 'Mighty Porgy', 'mighty', 'uncommon'),
  food('armoranth', 'Armoranth', 'tough'), food('ironshroom', 'Ironshroom', 'tough'), food('armoredCarp', 'Armored Carp', 'tough', 'uncommon'), food('armoredPorgy', 'Armored Porgy', 'tough', 'uncommon'), food('fortifiedPumpkin', 'Fortified Pumpkin', 'tough'),
  food('silentShroom', 'Silent Shroom', 'sneaky'), food('blueNightshade', 'Blue Nightshade', 'sneaky'), food('silentPrincess', 'Silent Princess', 'sneaky', 'rare'), food('stealthfinTrout', 'Stealthfin Trout', 'sneaky', 'uncommon'),
  food('rushroom', 'Rushroom', 'hasty'), food('fleetLotusSeeds', 'Fleet-Lotus Seeds', 'hasty'), food('swiftCarrot', 'Swift Carrot', 'hasty'), food('swiftViolet', 'Swift Violet', 'hasty', 'uncommon'),
  food('spicyPepper', 'Spicy Pepper', 'spicy'), food('sunshroom', 'Sunshroom', 'spicy'), food('sizzlefinTrout', 'Sizzlefin Trout', 'spicy', 'uncommon'), food('warmSafflina', 'Warm Safflina', 'spicy'),
  food('hydromelon', 'Hydromelon', 'chilly'), food('chillshroom', 'Chillshroom', 'chilly'), food('chillfinTrout', 'Chillfin Trout', 'chilly', 'uncommon'), food('coolSafflina', 'Cool Safflina', 'chilly'),
  food('voltfruit', 'Voltfruit', 'electro'), food('zapshroom', 'Zapshroom', 'electro'), food('voltfinTrout', 'Voltfin Trout', 'electro', 'uncommon'), food('electricSafflina', 'Electric Safflina', 'electro'),
  food('brightcap', 'Brightcap', 'bright'), food('glowingCaveFish', 'Glowing Cave Fish', 'bright', 'uncommon'),
  food('sundelion', 'Sundelion', 'sunny', 'uncommon'), food('sunPumpkin', 'Sun Pumpkin', 'warding', 'uncommon'),
  food('stickyFrog', 'Sticky Frog', 'sticky', 'uncommon'), food('stickyLizard', 'Sticky Lizard', 'sticky', 'uncommon'),
  food('hylianRice', 'Hylian Rice', 'basic'), food('tabanthaWheat', 'Tabantha Wheat', 'basic'), food('rockSalt', 'Rock Salt', 'basic'), food('caneSugar', 'Cane Sugar', 'basic'),
  food('goatButter', 'Goat Butter', 'basic'), food('freshMilk', 'Fresh Milk', 'basic'), food('birdEgg', 'Bird Egg', 'basic'), food('hatenoCheese', 'Hateno Cheese', 'basic', 'uncommon'),
  food('goronSpice', 'Goron Spice', 'basic'), food('oilJar', 'Oil Jar', 'basic'),
  food('rawMeat', 'Raw Meat', 'meat'), food('rawPrimeMeat', 'Raw Prime Meat', 'meat', 'uncommon'), food('rawGourmetMeat', 'Raw Gourmet Meat', 'meat', 'rare'),
  food('rawBirdDrumstick', 'Raw Bird Drumstick', 'meat'), food('rawBirdThigh', 'Raw Bird Thigh', 'meat', 'uncommon'), food('rawWholeBird', 'Raw Whole Bird', 'meat', 'rare'),
  { id: 'goldenApple', name: 'Golden Apple', kind: 'food', rarity: 'rare', family: 'fruit', use: 'cooking (a guaranteed critical)' },
  { id: 'starFragment', name: 'Star Fragment', kind: 'misc', rarity: 'legendary', use: 'high sacred crafting (and a cooking critical)' },
  { id: 'wood', name: 'Wood', kind: 'misc', rarity: 'common', use: 'construction and campfires', fuse: { might: 2, fx: 'blunt' } },
  // ── Critters (elixirs) ──
  critter('heartyLizard', 'Hearty Lizard', 'hearty', 'rare'), critter('restlessCricket', 'Restless Cricket', 'energizing'), critter('tirelessFrog', 'Tireless Frog', 'enduring', 'rare'),
  critter('bladedRhinoBeetle', 'Bladed Rhino Beetle', 'mighty'), critter('ruggedRhinoBeetle', 'Rugged Rhino Beetle', 'tough'), critter('sunsetFirefly', 'Sunset Firefly', 'sneaky'),
  critter('hightailLizard', 'Hightail Lizard', 'hasty'), critter('hotFootedFrog', 'Hot-Footed Frog', 'hasty'), critter('warmDarner', 'Warm Darner', 'spicy'), critter('coldDarner', 'Cold Darner', 'chilly'),
  critter('electricDarner', 'Electric Darner', 'electro'), critter('fireproofLizard', 'Fireproof Lizard', 'fireproof'), critter('deepFirefly', 'Deep Firefly', 'bright'),
  // ── Fusion materials and objects (section 18) ──
  fz('spikedIronBall', 'Spiked Iron Ball', 'fuse', 'uncommon', { might: 12, fx: 'knockback' }, 'fusion: knockback, armor penetration'),
  mon('bokoblinHorn', 'Bokoblin Horn', 'common', { might: 3, fx: 'cutting' }), mon('blueBokoblinHorn', 'Blue Bokoblin Horn', 'uncommon', { might: 6, fx: 'cutting' }),
  mon('blackBokoblinHorn', 'Black Bokoblin Horn', 'rare', { might: 10, fx: 'cutting' }), mon('silverBokoblinHorn', 'Silver Bokoblin Horn', 'epic', { might: 15, fx: 'cutting' }),
  mon('moblinHorn', 'Moblin Horn', 'uncommon', { might: 5, fx: 'impact' }), mon('lizalfosHorn', 'Lizalfos Horn', 'uncommon', { might: 7, fx: 'crit' }),
  mon('bossBokoblinHorn', 'Boss Bokoblin Horn', 'rare', { might: 12, fx: 'sweep' }), mon('horriblinHorn', 'Horriblin Horn', 'uncommon', { might: 8, fx: 'blunt' }),
  mon('lynelSaberHorn', 'Lynel Saber Horn', 'epic', { might: 20, fx: 'cutting' }), mon('lynelMaceHorn', 'Lynel Mace Horn', 'epic', { might: 20, fx: 'crushing' }),
  mon('gleeokFlameHorn', 'Gleeok Flame Horn', 'legendary', { might: 18, element: 'fire', fx: 'element' }), mon('gleeokFrostHorn', 'Gleeok Frost Horn', 'legendary', { might: 18, element: 'ice', fx: 'element' }),
  mon('gleeokThunderHorn', 'Gleeok Thunder Horn', 'legendary', { might: 18, element: 'lightning', fx: 'element' }),
  mon('gibdoBone', 'Gibdo Bone', 'rare', { might: 20, single: true, fx: 'bone' }), mon('moldugaJaw', 'Molduga Jaw', 'epic', { might: 15, fx: 'bone' }),
  mon('hinoxToenail', 'Hinox Toenail', 'uncommon', { might: 6, fx: 'blunt' }), mon('froxFang', 'Frox Fang', 'epic', { might: 12, fx: 'mining' }),
  mon('constructHorn', 'Soldier Construct Horn', 'common', { might: 5, zonai: true, fx: 'impact' }), mon('captainConstructHorn', 'Captain Construct Horn', 'rare', { might: 12, zonai: true, fx: 'impact' }),
  mon('supremeConstructHorn', 'Captain Construct IV Horn', 'legendary', { might: 20, zonai: true, fx: 'impact' }),
  mon('fluxConstructCore', 'Flux Construct Core', 'rare', { might: 12, zonai: true, fx: 'heavy' }), mon('fluxConstructCoreII', 'Flux Construct II Core', 'epic', { might: 18, zonai: true, fx: 'heavy' }),
  mon('fluxConstructCoreIII', 'Flux Construct III Core', 'legendary', { might: 24, zonai: true, fx: 'heavy' }),
  mon('talusHeart', 'Talus Heart', 'rare', { might: 12, fx: 'blunt' }), mon('igneoTalusHeart', 'Igneo Talus Heart', 'epic', { might: 16, element: 'fire', fx: 'element' }),
  mon('frostTalusHeart', 'Frost Talus Heart', 'epic', { might: 16, element: 'ice', fx: 'element' }), mon('rareTalusHeart', 'Rare Talus Heart', 'legendary', { might: 20, fx: 'blunt' }),
  fz('dinraalHornShard', "Shard of Dinraal's Horn", 'dragon', 'legendary', { might: 25, element: 'fire', fx: 'element' }, 'fusion: fire'),
  fz('naydraHornShard', "Shard of Naydra's Horn", 'dragon', 'legendary', { might: 25, element: 'ice', fx: 'element' }, 'fusion: ice'),
  fz('faroshHornShard', "Shard of Farosh's Horn", 'dragon', 'legendary', { might: 25, element: 'lightning', fx: 'element' }, 'fusion: lightning'),
  fz('lightDragonHorn', "Light Dragon's Horn", 'dragon', 'legendary', { might: 25, element: 'light', fx: 'restore' }, 'restorative fusion (sacred)'),
  fz('ancientBlade', 'Ancient Blade', 'ancient', 'epic', { might: 30, single: true, fx: 'ancient' }, 'fusion: one devastating ancient strike'),
  // ── Gemstones (weapon / shield) ──
  fz('ruby', 'Ruby', 'gem', 'rare', { might: 3, element: 'fire', fx: 'gem', shield: 'coldRes' }, 'fire projectiles / cold resistance'),
  fz('sapphire', 'Sapphire', 'gem', 'rare', { might: 3, element: 'ice', fx: 'gem', shield: 'heatRes' }, 'ice projectiles / heat resistance'),
  fz('topaz', 'Topaz', 'gem', 'rare', { might: 3, element: 'lightning', fx: 'gem', shield: 'electricCounter' }, 'lightning projectiles / electric counters'),
  fz('opal', 'Opal', 'gem', 'uncommon', { might: 2, element: 'water', fx: 'gem', shield: 'removesBurn' }, 'water projectiles / puts out Burning'),
  fz('diamond', 'Diamond', 'gem', 'legendary', { might: 8, fx: 'gem', shield: 'durability' }, '+physical / +durability'),
  fz('amber', 'Amber', 'gem', 'common', { might: 3, fx: 'gem', shield: 'def' }, '+physical / +DEF'),
  fz('luminousStone', 'Luminous Stone', 'gem', 'common', { might: 1, element: 'light', fx: 'light', shield: 'reveal' }, 'lights terrain / reveals hidden adjacent enemies'),
  // ── Monster materials (elixir bases, homing and range for arrows, trade goods) ──
  mon('bokoblinFang', 'Bokoblin Fang', 'common'), mon('bokoblinGuts', 'Bokoblin Guts', 'uncommon'), mon('moblinFang', 'Moblin Fang', 'uncommon'), mon('moblinGuts', 'Moblin Guts', 'rare'),
  mon('lizalfosTail', 'Lizalfos Tail', 'uncommon'), mon('lizalfosTalon', 'Lizalfos Talon', 'uncommon'), mon('lynelHoof', 'Lynel Hoof', 'rare'), mon('lynelGuts', 'Lynel Guts', 'epic'),
  mon('hinoxGuts', 'Hinox Guts', 'rare'), mon('moldugaFin', 'Molduga Fin', 'rare'), mon('moldugaGuts', 'Molduga Guts', 'epic'), mon('gleeokWing', 'Gleeok Wing', 'epic'), mon('gleeokGuts', 'Gleeok Guts', 'legendary'),
  mon('froxGuts', 'Frox Guts', 'epic'), mon('keeseEyeball', 'Keese Eyeball', 'common', undefined, 'homing arrows'), mon('elementalKeeseEyeball', 'Elemental Keese Eyeball', 'uncommon', undefined, 'elemental homing arrows'),
  mon('keeseWing', 'Keese Wing', 'common', undefined, 'arrow range'), mon('aerocudaEyeball', 'Aerocuda Eyeball', 'uncommon', undefined, 'homing arrows'), mon('aerocudaWing', 'Aerocuda Wing', 'uncommon', undefined, 'arrow range'),
  mon('octorokEyeball', 'Octorok Eyeball', 'uncommon', undefined, 'homing arrows'), mon('chuchuJelly', 'Chuchu Jelly', 'common'), mon('gibdoWing', 'Gibdo Wing', 'uncommon'), mon('gibdoGuts', 'Gibdo Guts', 'rare'),
  mon('horriblinGuts', 'Horriblin Guts', 'uncommon'), mon('stalBone', 'Stal Bone', 'common', { might: 3, fx: 'bone' }), mon('pebblitOre', 'Pebblit Ore', 'common', { might: 4, fx: 'blunt' }),
  mon('evermeanBark', 'Evermean Bark', 'uncommon', { might: 4, fx: 'blunt' }), mon('bubbulGem', 'Bubbul Gem', 'rare', undefined, 'trade for rare monster rewards (Koltin)'),
  fz('dragonScale', 'Dragon Scale', 'dragon', 'epic', { might: 10, fx: 'element', element: 'fire' }, 'elemental crafting and fusion'),
  fz('dragonClaw', 'Dragon Claw', 'dragon', 'epic', { might: 12, fx: 'element', element: 'ice' }, 'elemental crafting and fusion'),
  fz('dragonFangShard', 'Dragon Fang Shard', 'dragon', 'legendary', { might: 15, fx: 'element', element: 'lightning' }, 'elemental crafting and fusion'),
  fz('dragonSpikeShard', 'Dragon Spike Shard', 'dragon', 'epic', { might: 10, fx: 'cutting' }, 'elemental crafting and fusion'),
  fz('lightDragonScale', "Light Dragon's Scale", 'dragon', 'legendary', { might: 12, element: 'light', fx: 'restore' }, 'restorative fusion'),
  fz('lightDragonFang', "Light Dragon's Fang Shard", 'dragon', 'legendary', { might: 15, element: 'light', fx: 'restore' }, 'restorative fusion'),
  fz('lightDragonTalon', "Light Dragon's Talon", 'dragon', 'legendary', { might: 14, element: 'light', fx: 'restore' }, 'restorative fusion'),
  // ── Ancient materials (Sheikah crafting tiers → Guardian and Divine Beast upgrades) ──
  { id: 'ancientScrew', name: 'Ancient Screw', kind: 'ancient', rarity: 'common', use: 'Sheikah crafting (tier 1)' },
  { id: 'ancientSpring', name: 'Ancient Spring', kind: 'ancient', rarity: 'common', use: 'Sheikah crafting (tier 1)' },
  { id: 'ancientGear', name: 'Ancient Gear', kind: 'ancient', rarity: 'uncommon', use: 'Sheikah crafting (tier 2)' },
  { id: 'ancientShaft', name: 'Ancient Shaft', kind: 'ancient', rarity: 'rare', use: 'Sheikah crafting (tier 3)' },
  { id: 'ancientCore', name: 'Ancient Core', kind: 'ancient', rarity: 'epic', use: 'Guardian upgrades and ancient gear' },
  { id: 'giantAncientCore', name: 'Giant Ancient Core', kind: 'ancient', rarity: 'legendary', use: 'Divine Beast upgrades' },
  // ── Zonai materials ──
  { id: 'zonaite', name: 'Zonaite', kind: 'zonai', rarity: 'common', use: 'construction and energy refinement' },
  { id: 'largeZonaite', name: 'Large Zonaite', kind: 'zonai', rarity: 'rare', use: 'construction (counts as 5 Zonaite)' },
  { id: 'crystallizedCharge', name: 'Crystallized Charge', kind: 'zonai', rarity: 'uncommon', use: 'permanent Energy Cell expansion (Crystal Refinery)' },
  { id: 'largeCrystallizedCharge', name: 'Large Crystallized Charge', kind: 'zonai', rarity: 'rare', use: 'counts as 5 Crystallized Charges' },
  { id: 'hugeCrystallizedCharge', name: 'Huge Crystallized Charge', kind: 'zonai', rarity: 'epic', use: 'counts as 20 Crystallized Charges' },
];
export const MATERIAL_BY_ID: Record<string, WildMaterial> = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));
/** Rocks and boulders are always lying around: free to fuse. */
export const FREE_FUSE: Record<string, { name: string; fuse: FuseData }> = {
  rock: { name: 'Rock', fuse: { might: 2, fx: 'blunt' } },
  boulder: { name: 'Boulder', fuse: { might: 5, fx: 'armor' } },
};

// ── Pack items: meals, elixirs, throwables, Zonai Devices and charges ──
export const ITEMS: ItemDef[] = [
  // Meals (section 22)
  it({ id: 'simmeredFruit', name: 'Simmered Fruit', kind: 'heal', rarity: 'common', price: 40, power: 20, uses: 1, desc: 'Restores 20 HP.' }),
  sp('heartyFriedWildGreens', 'Hearty Fried Wild Greens', 'rare', 260, 'Full heal, plus 10 temporary HP.'),
  sp('energizingMushroomSkewer', 'Energizing Mushroom Skewer', 'uncommon', 90, '+15 HP and +15 stamina.'),
  sp('enduringFriedWildGreens', 'Enduring Fried Wild Greens', 'rare', 160, 'Full stamina, plus 10 temporary stamina.'),
  it({ id: 'mightyBananaSkewer', name: 'Mighty Banana Skewer', kind: 'buff', rarity: 'uncommon', price: 110, power: 0, uses: 1, buff: { str: 5 }, buffTurns: 5, desc: '+5 STR for 5 turns.' }),
  it({ id: 'toughMushroomSkewer', name: 'Tough Mushroom Skewer', kind: 'buff', rarity: 'uncommon', price: 110, power: 0, uses: 1, buff: { def: 5 }, buffTurns: 5, desc: '+5 DEF for 5 turns.' }),
  sp('sneakyFriedWildGreens', 'Sneaky Fried Wild Greens', 'uncommon', 110, 'Concealment (Veiled) for 5 turns.'),
  it({ id: 'hastyMushroomSkewer', name: 'Hasty Mushroom Skewer', kind: 'buff', rarity: 'uncommon', price: 110, power: 0, uses: 1, buff: { mov: 2, spd: 3 }, buffTurns: 5, desc: '+2 MOV and +3 SPD for 5 turns.' }),
  sp('spicySauteedPeppers', 'Spicy Sautéed Peppers', 'common', 70, '+8 HP and cold resistance for 5 turns.'),
  sp('chillyFruitMix', 'Chilly Fruit Mix', 'common', 70, '+8 HP and heat resistance for 5 turns.'),
  sp('electroMushroomSkewer', 'Electro Mushroom Skewer', 'uncommon', 90, '+8 HP and lightning resistance for 5 turns.'),
  sp('sunnyFriedWildGreens', 'Sunny Fried Wild Greens', 'rare', 200, 'Restores all max HP lost to Gloom, and +10 HP.'),
  sp('wardingFriedWildGreens', 'Warding Fried Wild Greens', 'uncommon', 140, 'Gloom resistance for 5 turns (Gloom taken −60%).'),
  sp('brightMushroomSkewer', 'Bright Mushroom Skewer', 'common', 70, 'Illumination for 5 turns: Darkness within 3 is lit and hidden enemies there revealed.'),
  it({ id: 'meatSkewer', name: 'Meat Skewer', kind: 'heal', rarity: 'uncommon', price: 90, power: 35, uses: 1, desc: 'Restores 35 HP.' }),
  it({ id: 'dubiousFood', name: 'Dubious Food', kind: 'heal', rarity: 'common', price: 5, power: 5, uses: 1, desc: 'Restores 5 HP. Probably.' }),
  it({ id: 'rockHardFood', name: 'Rock-Hard Food', kind: 'heal', rarity: 'common', price: 2, power: 1, uses: 1, desc: 'Restores 1 HP. Ow.' }),
  // Elixirs
  sp('heartyElixir', 'Hearty Elixir', 'rare', 240, 'Full heal, plus 6 temporary HP.'),
  sp('energizingElixir', 'Energizing Elixir', 'uncommon', 100, '+20 stamina.'),
  sp('enduringElixir', 'Enduring Elixir', 'rare', 150, 'Full stamina, plus 8 temporary stamina.'),
  it({ id: 'mightyElixir', name: 'Mighty Elixir', kind: 'buff', rarity: 'uncommon', price: 120, power: 0, uses: 1, buff: { str: 4 }, buffTurns: 4, desc: '+4 STR for 4 turns.' }),
  it({ id: 'toughElixir', name: 'Tough Elixir', kind: 'buff', rarity: 'uncommon', price: 120, power: 0, uses: 1, buff: { def: 4 }, buffTurns: 4, desc: '+4 DEF for 4 turns.' }),
  sp('sneakyElixir', 'Sneaky Elixir', 'uncommon', 100, 'Veiled for 3 turns.'),
  it({ id: 'hastyElixir', name: 'Hasty Elixir', kind: 'buff', rarity: 'uncommon', price: 120, power: 0, uses: 1, buff: { mov: 2, spd: 2 }, buffTurns: 4, desc: '+2 MOV and +2 SPD for 4 turns.' }),
  sp('spicyElixir', 'Spicy Elixir', 'common', 80, 'Cold resistance for 6 turns.'),
  sp('chillyElixir', 'Chilly Elixir', 'common', 80, 'Heat resistance for 6 turns.'),
  sp('electroElixir', 'Electro Elixir', 'uncommon', 100, 'Lightning resistance for 6 turns.'),
  sp('fireproofElixir', 'Fireproof Elixir', 'rare', 160, 'Fire immunity for 5 turns (no Burning, fire damage halved, safe near lava).'),
  sp('stickyElixir', 'Sticky Elixir', 'uncommon', 90, 'Slip immunity for 6 turns (wet cliffs cost 1, +10 Avoid in rain).'),
  sp('brightElixir', 'Bright Elixir', 'uncommon', 90, 'Illumination for 6 turns.'),
  // Throwables and utility (section 21). Fire, Ice and Shock Fruit, Puffshrooms and Muddle Buds are the
  // existing entries (they gain the battlefield reactions in engine/wild.ts).
  throwIt('splashFruit', 'Splash Fruit', 'common', 40, 'Thrown water: clears sludge, puts out fires and Burning.', { power: 3, element: 'water' }),
  throwIt('dazzlefruit', 'Dazzlefruit', 'uncommon', 60, 'A flash of light: Blinds enemies; hurts the undead and Gloom (10).', { power: 10, element: 'light' }),
  throwIt('bombFlower', 'Bomb Flower', 'uncommon', 70, 'Explodes: 12 damage in a small blast; breaks cracked walls, ore and explosive barrels.', { power: 12, uses: 2 }),
  throwIt('brightbloomSeed', 'Brightbloom Seed', 'common', 30, 'Lights Darkness within 2 (and reveals enemies there).', { power: 0, uses: 3, radius: 2 }),
  throwIt('giantBrightbloomSeed', 'Giant Brightbloom Seed', 'uncommon', 70, 'Lights Darkness within 4.', { power: 0, radius: 4 }),
  throwIt('hylianPineCone', 'Hylian Pine Cone', 'common', 20, 'Set it on fire (or throw it into fire) and it makes a strong updraft.', { power: 0, uses: 3, radius: 0 }),
  throwIt('korokFrond', 'Korok Frond', 'uncommon', 60, 'A gust of wind: pushes enemies 1 space, spreads flames downwind, blows smoke away.', { power: 0 }),
  throwIt('octoBalloon', 'Octo Balloon', 'uncommon', 70, 'Lifts a light unit: an ally floats (flies) for 2 turns; a small enemy is lifted and Rooted for 1.', { power: 0, uses: 1, radius: 0 }),
  throwIt('flint', 'Flint', 'common', 20, 'Strike it to light the space (and anything flammable there).', { power: 0, uses: 3, radius: 0, maxRange: 1 }),
  // Zonai Devices (section 19): they draw on the army's shared Energy Cell.
  dev('zonaiFan', 'Fan', 'common', 60, 'Propels: you and allies within 2 gain +2 MOV this turn and the wind blows smoke away. Energy 2.'),
  dev('zonaiWing', 'Wing', 'common', 60, 'Gliding: fly for 2 turns. Energy 0.'),
  dev('zonaiCart', 'Cart', 'common', 50, 'A wheeled platform: +2 MOV this turn. Energy 0.'),
  dev('zonaiBalloon', 'Balloon', 'common', 50, 'Lift when heated: next to fire or a Flame Emitter you fly for 2 turns (1 turn otherwise). Energy 0.'),
  dev('zonaiRocket', 'Rocket', 'uncommon', 90, 'Propulsion: fly and +4 MOV this turn. Energy 5.'),
  dev('zonaiTimeBomb', 'Time Bomb', 'uncommon', 90, 'Plant it next to you: it explodes at the start of your next turn (15 damage in a small blast). Energy 0.', { targeted: true, minRange: 1, maxRange: 2 }),
  dev('portablePot', 'Portable Pot', 'uncommon', 100, 'One cooking action anywhere: you and adjacent allies recover 25% HP and shake off one harmful status. Energy 0.'),
  dev('flameEmitter', 'Flame Emitter', 'uncommon', 120, 'Set down a flame emitter that breathes fire on adjacent enemies each turn. Energy 3/turn.', { targeted: true, minRange: 1, maxRange: 1 }),
  dev('frostEmitter', 'Frost Emitter', 'uncommon', 120, 'Set down a frost emitter (freezing air on adjacent enemies). Energy 3/turn.', { targeted: true, minRange: 1, maxRange: 1 }),
  dev('shockEmitter', 'Shock Emitter', 'uncommon', 120, 'Set down a shock emitter (electricity on adjacent enemies). Energy 3/turn.', { targeted: true, minRange: 1, maxRange: 1 }),
  dev('beamEmitter', 'Beam Emitter', 'rare', 180, 'Set down a beam emitter turret (range 1–4). Energy 4/turn.', { targeted: true, minRange: 1, maxRange: 1 }),
  dev('zonaiHydrant', 'Hydrant', 'common', 70, 'A blast of water within 2: puts out fires and Burning, clears sludge, soaks enemies. Energy 2.'),
  dev('steeringStick', 'Steering Stick', 'uncommon', 80, 'Controls vehicles: an adjacent allied vehicle gains +2 MOV and +10 Hit this turn. Energy 0.'),
  dev('bigWheel', 'Big Wheel', 'uncommon', 90, 'Heavy terrain: +1 MOV and mountains, cliffs and sludge cost 2 for 2 turns. Energy 2/turn.'),
  dev('smallWheel', 'Small Wheel', 'common', 60, 'Fast ground travel: +2 MOV this turn. Energy 1.'),
  dev('zonaiSled', 'Sled', 'common', 50, 'Low friction: no sand, snow or ice penalties for 3 turns. Energy 0.'),
  dev('zonaiBattery', 'Battery', 'uncommon', 120, '+15 temporary energy for the Energy Cell.'),
  dev('bigBattery', 'Big Battery', 'epic', 400, '+50 temporary energy for the Energy Cell.'),
  dev('zonaiSpring', 'Spring', 'common', 70, 'Launches: knocks an adjacent enemy back 2 spaces, or bounces you 2 spaces up (fly this turn). Energy 3.'),
  dev('zonaiCannon', 'Cannon', 'rare', 160, 'An explosive shot at range 2–5: 16 damage in a small blast. Energy 5.', { targeted: true, minRange: 2, maxRange: 5 }),
  dev('zonaiStabilizer', 'Stabilizer', 'common', 50, 'Prevents tipping: can\'t be pushed, pulled or knocked down for 3 turns. Energy 1/turn.'),
  dev('hoverStone', 'Hover Stone', 'uncommon', 90, 'A floating platform over water, a chasm, lava or sky for 3 turns. Energy 3/turn.', { targeted: true, minRange: 1, maxRange: 2 }),
  dev('zonaiLight', 'Light', 'common', 50, 'Illumination: lights Darkness within 3 for 3 turns and reveals hidden enemies. Energy 1/turn.'),
  dev('zonaiStake', 'Stake', 'common', 40, 'Anchors: can\'t be moved for 3 turns (and +2 DEF). Energy 0.'),
  dev('zonaiMirror', 'Mirror', 'uncommon', 80, 'Redirects light: the next magic hit on you is halved, and nearby undead and Gloom take 6 sacred damage. Energy 0.'),
  dev('homingCart', 'Homing Cart', 'rare', 150, 'Launch a homing cart at the nearest enemy: it runs it down and explodes (14). Energy 2/turn.'),
  dev('constructHead', 'Construct Head', 'rare', 150, 'Auto-aims attached weapons: +20 Hit for 3 turns. Energy 1/turn.'),
  dev('zonaiCharge', 'Zonai Charge', 'common', 60, 'Restores 20 energy to the Energy Cell.'),
  dev('largeZonaiCharge', 'Large Zonai Charge', 'rare', 220, 'Refills the Energy Cell, and devices cost nothing for 2 turns.'),
];

/** Device energy costs (per use, or per turn while running). */
export const DEVICE_ENERGY: Record<string, { cost: number; perTurn?: boolean }> = {
  zonaiFan: { cost: 2 }, zonaiWing: { cost: 0 }, zonaiCart: { cost: 0 }, zonaiBalloon: { cost: 0 }, zonaiRocket: { cost: 5 }, zonaiTimeBomb: { cost: 0 }, portablePot: { cost: 0 },
  flameEmitter: { cost: 3, perTurn: true }, frostEmitter: { cost: 3, perTurn: true }, shockEmitter: { cost: 3, perTurn: true }, beamEmitter: { cost: 4, perTurn: true },
  zonaiHydrant: { cost: 2 }, steeringStick: { cost: 0 }, bigWheel: { cost: 2, perTurn: true }, smallWheel: { cost: 1 }, zonaiSled: { cost: 0 }, zonaiBattery: { cost: 0 }, bigBattery: { cost: 0 },
  zonaiSpring: { cost: 3 }, zonaiCannon: { cost: 5 }, zonaiStabilizer: { cost: 1, perTurn: true }, hoverStone: { cost: 3, perTurn: true }, zonaiLight: { cost: 1, perTurn: true },
  zonaiStake: { cost: 0 }, zonaiMirror: { cost: 0 }, homingCart: { cost: 2, perTurn: true }, constructHead: { cost: 1, perTurn: true },
};
export const ZONAI_DEVICES = Object.keys(DEVICE_ENERGY).filter((d) => d !== 'zonaiBattery' && d !== 'bigBattery');

/** Cooking: which meal (and elixir) a family of ingredients makes. */
export const MEALS: Partial<Record<CookFamily, { meal?: string; elixir?: string }>> = {
  fruit: { meal: 'simmeredFruit' }, hearty: { meal: 'heartyFriedWildGreens', elixir: 'heartyElixir' }, energizing: { meal: 'energizingMushroomSkewer', elixir: 'energizingElixir' },
  enduring: { meal: 'enduringFriedWildGreens', elixir: 'enduringElixir' }, mighty: { meal: 'mightyBananaSkewer', elixir: 'mightyElixir' }, tough: { meal: 'toughMushroomSkewer', elixir: 'toughElixir' },
  sneaky: { meal: 'sneakyFriedWildGreens', elixir: 'sneakyElixir' }, hasty: { meal: 'hastyMushroomSkewer', elixir: 'hastyElixir' }, spicy: { meal: 'spicySauteedPeppers', elixir: 'spicyElixir' },
  chilly: { meal: 'chillyFruitMix', elixir: 'chillyElixir' }, electro: { meal: 'electroMushroomSkewer', elixir: 'electroElixir' }, bright: { meal: 'brightMushroomSkewer', elixir: 'brightElixir' },
  sunny: { meal: 'sunnyFriedWildGreens' }, warding: { meal: 'wardingFriedWildGreens' }, sticky: { elixir: 'stickyElixir' }, meat: { meal: 'meatSkewer' }, fireproof: { elixir: 'fireproofElixir' },
};

/** Ingredients found after battles, by layer and climate. */
export const FORAGE: Record<string, string[]> = {
  surface: ['apple', 'wildberry', 'hylianTomato', 'rawMeat', 'stamellaShroom', 'mightyBananas', 'armoranth', 'silentShroom', 'rushroom', 'hylianRice', 'tabanthaWheat', 'birdEgg', 'acorn', 'heartyRadish', 'rockSalt', 'freshMilk', 'goatButter', 'caneSugar'],
  sky: ['wildberry', 'rawBirdDrumstick', 'rawBirdThigh', 'swiftViolet', 'courserBeeHoney', 'enduraCarrot', 'sundelion', 'fleetLotusSeeds', 'chickalooTreeNut'],
  depths: ['brightcap', 'glowingCaveFish', 'sunPumpkin', 'heartyTruffle', 'ironshroom', 'razorshroom', 'stambulb', 'deepFirefly'],
  cold: ['spicyPepper', 'sunshroom', 'warmSafflina', 'warmDarner', 'sizzlefinTrout'],
  hot: ['hydromelon', 'chillshroom', 'coolSafflina', 'coldDarner', 'voltfruit', 'palmFruit'],
  storm: ['voltfruit', 'zapshroom', 'electricSafflina', 'electricDarner', 'voltfinTrout'],
  water: ['mightyCarp', 'armoredCarp', 'mightyPorgy', 'armoredPorgy', 'stealthfinTrout', 'staminokaBass', 'stickyFrog', 'chillfinTrout'],
  forest: ['silentPrincess', 'blueNightshade', 'heartyDurian', 'mightyThistle', 'sunsetFirefly', 'hightailLizard', 'restlessCricket', 'bladedRhinoBeetle', 'ruggedRhinoBeetle', 'stickyLizard'],
  volcano: ['fireproofLizard', 'goronSpice', 'spicyPepper', 'fortifiedPumpkin', 'hotFootedFrog'],
};

/** Quest and progression items (section 23) plus every material. */
export const QUEST_ITEMS: { id: string; name: string; desc: string }[] = [
  ...MATERIALS.map((m) => ({ id: m.id, name: m.name, desc: `${m.kind === 'food' ? 'Ingredient' : m.kind === 'critter' ? 'Critter' : 'Material'}: ${m.use}.${m.fuse ? ` Fuse: +${m.fuse.might} Might${m.fuse.element ? ` (${m.fuse.element})` : ''}${m.fuse.single ? ', single use' : ''}.` : ''}` })),
  { id: 'spiritOrb', name: 'Spirit Orb', desc: 'Won from shrines. Four at a Goddess Statue: +5 max HP or +5 stamina for one unit.' },
  { id: 'lightOfBlessing', name: 'Light of Blessing', desc: 'Won from Shrines of Light. Works like a Spirit Orb.' },
  { id: 'korokSeed', name: 'Korok Seed', desc: 'Found by solving Korok puzzles. Hestu turns them into pack slots and convoy space.' },
  { id: 'sagesWill', name: "Sage's Will", desc: 'Four of them permanently enhance a chosen Sage.' },
  { id: 'poe', name: 'Poe', desc: 'A collectible spirit from the Depths. The Bargainer Statues trade them for equipment.' },
  { id: 'ponyPoint', name: 'Pony Point', desc: 'Earned at stables. Spend them on stable services and mount upgrades.' },
  { id: 'monsterMedal', name: 'Monster Medal', desc: 'For beating a designated monster family. Kilton pays for them.' },
  { id: 'travelMedallion', name: 'Travel Medallion', desc: 'A temporary fast-travel point: the next region choice can be any region you have visited.' },
  { id: 'shrineSensor', name: 'Shrine Sensor', desc: 'Reveals shrine encounters: one event on each new region\'s map becomes a shrine.' },
  { id: 'purahPadItem', name: 'Purah Pad Map Data', desc: 'Scouting and mapping: one more route is revealed after each regional boss.' },
  { id: 'autobuildSchemaStone', name: 'Autobuild Schema Stone', desc: 'Unlocks a vehicle blueprint for Autobuild (kept between campaigns).' },
  { id: 'yigaSchematic', name: 'Yiga Schematic', desc: 'A Yiga vehicle blueprint: vehicles cost 2 fewer Zonaite.' },
  { id: 'oldMap', name: 'Old Map', desc: 'Marks Depths treasure: the next treasure in the Depths is a rich one.' },
  { id: 'lightrootBlessing', name: 'Lightroot Blessing', desc: 'A Lightroot lit: Depths regions open, and Gloom heals a little after Depths battles.' },
  { id: 'hyruleCompendium', name: 'Hyrule Compendium', desc: 'Records the units, gear and materials you have seen. The archive pays for entries.' },
  { id: 'remoteBombPlus', name: 'Remote Bomb+', desc: 'Upgraded Remote Bombs: bigger blast and faster recharge.' },
  { id: 'stasisPlus', name: 'Stasis+', desc: 'Upgraded Stasis: it works on enemies.' },
  { id: 'masterCycleRune', name: 'Master Cycle Zero Rune', desc: 'The Sheikah Slate can summon Master Cycle Zero.' },
  { id: 'skyviewActivated', name: 'Skyview Tower Activated', desc: 'A Skyview Tower launches the army to the sky islands.' },
  { id: 'sheikahTowerMap', name: 'Sheikah Tower Map', desc: 'A Sheikah Tower\'s map: one more region is offered next time.' },
  { id: 'secretStoneRumor', name: 'Rumor of a Secret Stone', desc: 'Someone has seen a stone that glows from within.' },
];
