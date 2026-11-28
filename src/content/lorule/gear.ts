import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), body = gs('body'), acc = gs('accessory'), head = gs('head'), hands = gs('hands'), mount = gs('mount');

// Section 6's gear. The Hylian Shield, Blue and Red Mail, Power Glove, Titan's Mitt, Pegasus Boots, Zora's Flippers,
// the Bug-Catching Net and the Pendants reuse their existing entries.
export const GEAR: GearDef[] = [
  acc('raviosBracelet', "Ravio's Bracelet", 'legendary', {}, 'Enables wall merging (Wall Merge: 5 MP to merge, 2 MP per wall space, 5 MP a turn to stay merged).', { lb: ['wallMerge'] }),
  head('hintGlasses', 'Hint Glasses', 'uncommon', { hit: 5 }, 'Reveals hints, mechanisms and weak points: hidden enemies and traps within 5 are revealed, and +10 Crit against bosses.', { lb: ['hints'] }),
  // ── Character gear ──
  mount('irenesBroom', "Irene's Broom", 'epic', { mov: 1 }, 'Flying movement for a size-1 rider (+1 MOV).', { size: 1, effects: ['flight'], lb: ['broom'] }),
  hands('rossosMiningGloves', "Rosso's Mining Gloves", 'epic', { str: 5 }, '+5 STR; more obstacle damage (+30% against armoured units, constructs and stone).', { lb: ['obstacles'] }),
  head('raviosRabbitHood', "Ravio's Rabbit Hood", 'rare', { lck: 5 }, '+5 LCK; better prices (Ravio\'s Shop 15% cheaper while someone in the army wears it).', { lb: ['prices'] }),
  body('raviosRobes', "Ravio's Robes", 'rare', { res: 4 }, '+4 RES; tools use less energy (Wall Merge and item rods cost 25% less MP).', { lb: ['toolThrift'] }),
  head('hildasCrown', "Hilda's Crown", 'legendary', { mag: 5, res: 5 }, '+5 MAG and RES.'),
  body('hildasRoyalDress', "Hilda's Royal Dress", 'legendary', { mag: 6, res: 6 }, '+6 MAG and RES.'),
  body('yugasRobes', "Yuga's Robes", 'legendary', { mag: 3, res: 3 }, 'Painting magic costs 25% less MP.', { lb: ['paintThrift'] }),
  acc('yugasPortrait', "Yuga's Portrait", 'legendary', {}, 'Longer painting status: Painting Prison lasts a turn longer.', { lb: ['longPaint'] }),
  shield('stalblindsShield', "Stalblind's Shield", 'legendary', { def: 9, block: 15 }, 'High physical DEF; curse resistance (can\'t be Cursed).', { lb: ['curseGuard'] }),
  head('gemesaurMask', 'Gemesaur Mask', 'legendary', { def: 10 }, '+10 DEF; more Rupee drops (+15% battle Rupees).', { lb: ['rupees'] }),
  body('grinexxShellArmor', 'Grinexx Shell Armor', 'legendary', { def: 12, spd: -2 }, 'High DEF; immune to lava.', { effects: ['lavaImmune'] }),
  acc('dharkstaresEye', "Dharkstare's Eye", 'legendary', { mag: 2 }, 'Stronger ice magic (+20%) and longer Freezes.', { lb: ['iceBoost'] }),
];
