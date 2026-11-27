import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), body = gs('body'), acc = gs('accessory'), head = gs('head'), hands = gs('hands'), feet = gs('feet');
const MICRO = ['micro'];

// Section 7's gear. Roc's Cape (Era of Legend), Pegasus Boots, Power Bracelets, Zora's Flippers and the
// Mirror Shield reuse their existing entries.
export const GEAR: GearDef[] = [
  hands('moleMitts', 'Mole Mitts', 'rare', { str: 1 }, 'Dig through Soft Earth Walls and underground passages (Dig Through, from next to one).', { mc: ['moleMitts'] }),
  acc('gripRing', 'Grip Ring', 'uncommon', {}, 'Climbs designated walls and cliffs: mountains and Minish Vines cost 2 movement.', { mc: ['gripRing'] }),
  // ── Micro equipment (Micro units; a shrunk unit's own gear shrinks with it) ──
  shield('minishLeafShield', 'Minish Leaf Shield', 'common', { def: 3 }, '+3 DEF. Micro-sized.', { mc: MICRO }),
  shield('minishMetalShield', 'Minish Metal Shield', 'uncommon', { def: 6, block: 10 }, '+6 DEF, 10% block. Micro-sized.', { mc: MICRO }),
  head('forestMinishCap', 'Forest Minish Cap', 'common', { avoid: 2 }, '+2 Avoid; woodland concealment (hidden in forests and grass at the start of each turn).', { mc: [...MICRO, 'woodlandConceal'] }),
  head('mountainMinishHelmet', 'Mountain Minish Helmet', 'uncommon', { def: 3 }, '+3 DEF. Micro-sized.', { mc: MICRO }),
  head('townMinishHood', 'Town Minish Hood', 'uncommon', { skl: 3 }, '+3 SKL. Micro-sized.', { mc: MICRO }),
  body('minishTunic', 'Minish Tunic', 'common', { def: 2, res: 2 }, '+2 DEF and RES. Micro-sized.', { mc: MICRO }),
  body('minishForgingApron', 'Minish Forging Apron', 'rare', { def: 4 }, '+4 DEF; better repairs (field forging restores 2 more uses).', { mc: [...MICRO, 'forging'] }),
  hands('minishClimbingGloves', 'Minish Climbing Gloves', 'uncommon', {}, 'Climb larger units and vertical surfaces: Bookshelves, Flowers and Vines cost 1; Hitch Ride onto enemies too (for infiltration).', { mc: [...MICRO, 'climb'] }),
  feet('minishBoots', 'Minish Boots', 'common', { mov: 1 }, '+1 MOV. Micro-sized.', { mc: MICRO }),
  acc('minishLeafGlider', 'Minish Leaf Glider', 'rare', {}, 'Glide across gaps on wind currents: Puddles and water cost 2, and Gust Currents carry you twice as far without harm.', { mc: [...MICRO, 'glider'] }),
  // ── Character gear ──
  head('sorcerersCap', "Sorcerer's Cap", 'mythic', { mag: 8, res: 5 }, '+8 MAG, +5 RES; advanced transformation magic (shrink and grow anywhere).', { mc: ['sizeChange'] }),
  body('vaatisRobes', "Vaati's Robes", 'legendary', { mag: 6, res: 6 }, '+6 MAG and RES.'),
  head('daltusCrown', "Daltus's Crown", 'epic', { lck: 4 }, '+4 LCK; longer command aura (Royal Authority and commander auras reach 2 further).', { mc: ['commander'] }),
  body('windTribeRobes', 'Wind Tribe Robes', 'rare', { res: 3 }, 'Wind resistance: never pushed by Gust Currents, and +3 RES.', { mc: ['windGuard'] }),
  acc('lightForce', 'Light Force', 'mythic', { mag: 8, res: 8 }, '+8 MAG and RES; +5 MP at the start of each turn.', { mc: ['lightForce'] }),
  body('gleerokShellArmor', 'Gleerok Shell Armor', 'legendary', { def: 12, spd: -2 }, '+12 DEF; fire resistance (half fire damage, no Burns).', { mc: ['fireGuard'] }),
  acc('mazaalsSacredCore', "Mazaal's Sacred Core", 'legendary', { def: 3, res: 3 }, 'Mechanical defence and repair: +3 DEF/RES, and the wearer recovers 10% HP each turn if it is a construct.', { mc: ['sacredCore'] }),
  acc('gyorgEyeCharm', 'Gyorg Eye Charm', 'epic', { skl: 4, hit: 5 }, '+4 SKL; better aerial accuracy (+15 Hit while flying or against fliers).', { mc: ['aerialAim'] }),
];
