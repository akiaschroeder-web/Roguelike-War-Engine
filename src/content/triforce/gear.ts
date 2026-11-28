import type { GearDef, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
/** An outfit (body slot): its effect is named by `tf` and handled by engine/triforce.ts. */
const o = (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, tf: string[], extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot: 'body', rarity, price: PRICE[rarity], stats, desc, tf: ['outfit', ...tf], ...extra });

// Section 4's 34 outfits. "Bear Minimum Digs" is simply the unequipped state. The Hero's Clothes, Zora Armor, Fierce
// Deity armour and Linebeck's Coat keep their existing entries (Madame Couture can sew them too: content/triforce/items.ts).
export const OUTFITS: GearDef[] = [
  o('bigBombOutfit', 'Big Bomb Outfit', 'rare', { def: 1 }, 'Bombs deal 50% more damage, with a blast 1 space wider.', ['bigBomb']),
  o('boomeranger', 'Boomeranger', 'rare', { def: 1 }, 'Boomerangs reach 1 space further and deal +3 damage.', ['boomerang']),
  o('cactoClothes', 'Cacto Clothes', 'rare', { def: 2 }, 'Spiny: enemies that strike the wearer in melee take 4 damage.', ['cacto']),
  o('cheerOutfit', 'Cheer Outfit', 'rare', { res: 1 }, 'Allies within 2 recover 5 more STA and MP at the start of each turn.', ['cheer']),
  o('cheetahCostume', 'Cheetah Costume', 'epic', { mov: 2, spd: 5 }, '+2 MOV, +5 SPD.', ['cheetah']),
  o('cozyParka', 'Cozy Parka', 'rare', { def: 2, res: 1 }, 'Immune to freezing-terrain penalties: ice costs normal movement, and the wearer can\'t be Frozen.', ['parka']),
  o('cursedTights', 'Cursed Tights', 'epic', { str: 8, mag: 8 }, '+8 STR and MAG; max HP halved in battle.', ['cursed']),
  o('semiCursedTights', 'Semi-Cursed Tights', 'rare', { str: 4, mag: 4 }, '+4 STR and MAG; max HP −25% in battle.', ['semiCursed']),
  o('dapperSpinnerKit', 'Dapper Spinner Kit', 'rare', { def: 1 }, 'Spin Attack damage and radius up: the Dapper Spin hits everything within 2 for 120%.', ['dapper']),
  o('dunewalkerDuds', 'Dunewalker Duds', 'uncommon', { def: 1 }, 'No sand penalties: desert and dune terrain costs 1 movement.', ['dunes']),
  o('energyGear', 'Energy Gear', 'rare', { def: 1 }, '+15 STA and MP in battle.', ['energy']),
  o('fireBlazer', 'Fire Blazer', 'rare', { def: 1, res: 1 }, 'A stronger Fire Rod: fire magic deals 30% more damage.', ['fireBlazer']),
  o('goronGarb', 'Goron Garb', 'epic', { def: 3 }, 'Immune to lava.', ['goron'], { effects: ['lavaImmune'] }),
  o('gustGarb', 'Gust Garb', 'rare', { def: 1 }, 'Gust Jar knockback up: it hits 3 harder.', ['gust']),
  o('hammerwear', 'Hammerwear', 'rare', { def: 2 }, 'Hammers deal 25% more damage, and the shockwave hits enemies next to the target for a quarter.', ['hammer']),
  o('jackOfHearts', 'Jack of Hearts', 'rare', { def: 1 }, '+15 max HP in battle.', ['hearts15']),
  o('kokiriClothes', 'Kokiri Clothes', 'rare', { spd: 1 }, 'Bows fire three arrows: up to two enemies next to the target take half damage.', ['kokiri']),
  o('ladysEnsemble', "Lady's Ensemble", 'legendary', { mag: 4, res: 4 }, 'Stronger support magic: healing +30%, and buffs the wearer casts last a turn longer.', ['ladys']),
  o('legendaryDress', 'Legendary Dress', 'legendary', { res: 3, lck: 5 }, 'Stronger recovery items: potions, milk and food heal 50% more.', ['dress']),
  o('lightArmor', 'Light Armor', 'rare', { def: 2 }, 'Lights the surrounding darkness: no fog of war, and +10 Hit.', ['light']),
  o('luckyLoungewear', 'Lucky Loungewear', 'rare', { lck: 5 }, '15% chance to negate a hit (it is halved, like a shield block, then shrugged off).', ['lucky'], { stats: { lck: 5, block: 15 } }),
  o('ninjaGi', 'Ninja Gi', 'epic', { spd: 6 }, '+6 SPD; more dash-attack damage: +4 damage when attacking after moving 3 or more spaces.', ['ninja']),
  o('queenOfHearts', 'Queen of Hearts', 'legendary', { def: 2 }, '+30 max HP in battle.', ['hearts30']),
  o('roboWear', 'Robo Wear', 'rare', { def: 2 }, 'More Gripshot reach (+2 spaces).', ['robo']),
  o('rupeeRegalia', 'Rupee Regalia', 'epic', { lck: 3 }, 'Doubles the wearer\'s Rupees: ₹15 more for every enemy the wearer defeats.', ['rupees']),
  o('serpentsToga', "Serpent's Toga", 'epic', { def: 1 }, 'Better underwater combat: swims, and +3 STR and DEF in or next to water.', ['serpent'], { effects: ['swim'] }),
  o('showstopper', 'Showstopper', 'rare', { res: 2 }, 'Distracts surrounding enemies: foes within 2 have −10 Hit.', ['showstopper']),
  o('spinAttackAttire', 'Spin Attack Attire', 'rare', { def: 1 }, 'Cheaper Spin Attack: spins cost half the STA.', ['spinThrift']),
  o('swordSuit', 'Sword Suit', 'epic', { def: 1 }, '+5 sword Might.', ['sword5']),
  o('swordMasterSuit', 'Sword Master Suit', 'legendary', { def: 2 }, '+8 sword Might; sword beams: at full HP, swords reach 3 spaces.', ['sword8']),
  o('timelessTunic', 'Timeless Tunic', 'rare', { def: 1, res: 1 }, 'Better heart drops: recover 10% HP for every enemy the wearer defeats.', ['hearts']),
  o('tingleTights', 'Tingle Tights', 'epic', { lck: 4 }, 'Prevents the first falling casualty each battle: the wearer survives a fatal fall (or the first fatal blow) at 1 HP.', ['tingle']),
  o('torrentRobe', 'Torrent Robe', 'rare', { res: 2 }, 'A stronger Water Rod: water magic deals 30% more damage.', ['torrent']),
  o('triSuit', 'Tri Suit', 'legendary', { def: 1 }, '+3 STR, MAG, DEF and RES while two allied heroes are within 2.', ['triSuit']),
];

export const GEAR: GearDef[] = [...OUTFITS];
