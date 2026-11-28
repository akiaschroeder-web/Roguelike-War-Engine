import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const body = gs('body'), acc = gs('accessory'), head = gs('head'), hands = gs('hands'), feet = gs('feet');

// Section 6's gear. Roc's Feather, Roc's Cape, Pegasus Boots and the Magnetic Gloves reuse their entries; their
// Level 2 versions are here. The coloured tunics can be worn by anyone.
export const GEAR: GearDef[] = [
  head('gnatHat', 'Gnat Hat', 'epic', { avoid: 5 }, 'The wearer can become a Micro unit anywhere (Shrink and Grow, the Minish Cap pack\'s size rules): squeeze through Gnat Passages and infiltrate larger enemies. +5 Avoid.', { mc: ['sizeChange'], fs: ['gnat'] }),
  // ── Tunics ──
  body('greenHerosTunic', "Green Hero's Tunic", 'rare', { def: 3, skl: 3 }, '+3 DEF and SKL.'),
  body('redHerosTunic', "Red Hero's Tunic", 'rare', { str: 4, def: 4 }, '+4 STR and DEF.'),
  body('blueHerosTunic', "Blue Hero's Tunic", 'rare', { spd: 4, mov: 1 }, '+4 SPD, +1 MOV.'),
  body('purpleHerosTunic', "Purple Hero's Tunic", 'rare', { mag: 4, res: 4 }, '+4 MAG and RES.'),
  body('shadowHerosTunic', "Shadow Hero's Tunic", 'legendary', { spd: 2, avoid: 10 }, 'Better concealment (Veiled at the start of each turn in forests, fog or the Dark World) and dark resistance (half dark damage). +2 SPD, +10 Avoid.', { fs: ['shadowConceal', 'darkGuard'] }),
  body('shrineMaidenRobes', 'Shrine Maiden Robes', 'epic', { mag: 5, res: 5 }, '+5 MAG and RES.'),
  body('ganonsDarkArmor', "Ganon's Dark Armor", 'mythic', { def: 12, res: 8, spd: -2 }, '+12 DEF, +8 RES.'),
  // ── Accessories ──
  acc('shrineMaidenJewel', 'Shrine Maiden Jewel', 'epic', { res: 2 }, 'Cheaper support spells: healing, blessing and barrier abilities cost 30% less MP. +2 RES.', { fs: ['supportThrift'] }),
  acc('shadowMirror', 'Shadow Mirror', 'mythic', { mag: 4, spd: 2 }, 'Shadow duplicates and Dark World travel: grants Shadow Reflection, and Dark World Portals cost nothing to cross. +4 MAG, +2 SPD.', { fs: ['shadowMirror'] }),
  acc('herosMedal', "Hero's Medal", 'rare', { lck: 3 }, 'Better Force Gem collection: +25% Force Power from every gem. +3 LCK.', { fs: ['gemBonus'] }),
  acc('herosKey', "Hero's Key", 'legendary', { lck: 5 }, 'Bigger rewards from regional trials: a region boss victory pays ₹250 more and leaves an extra treasure. +5 LCK.', { fs: ['trialReward'] }),
  // ── Level 2 tools ──
  acc('rocsFeatherL2', "Roc's Feather Lv. 2", 'epic', {}, 'Longer jumps: leap to a free space up to 3 away over anything (Roc\'s Jump).', { lg: ['jump1', 'jump3'], fs: ['l2'] }),
  feet('pegasusBootsL2', 'Pegasus Boots Lv. 2', 'legendary', { mov: 3 }, '+3 MOV. A longer Pegasus Dash (6 spaces).', { lg: ['pegasusBoots'], fs: ['l2'] }),
  hands('magneticGlovesL2', 'Magnetic Gloves Lv. 2', 'legendary', {}, 'More magnetic range: Magnetic Pull, and swing to a Magnetic Pillar up to 6 away (4 with the ordinary gloves).', { lg: ['magnet'], fs: ['l2', 'magnet2'] }),
];
