import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), body = gs('body'), acc = gs('accessory'), head = gs('head'), utility = gs('utility');

/** The eight ship component slots of a steamship (extending the Wind Waker's hull / sail / utility / flag). */
export const SHIP_SLOTS = ['hull', 'cannonMount', 'prow', 'anchor', 'handrail', 'bridge', 'chimney', 'wheel'] as const;
export type ShipSlot = (typeof SHIP_SLOTS)[number];
export const SHIP_SLOT_NAMES: Record<ShipSlot, string> = {
  hull: 'Hull', cannonMount: 'Cannon', prow: 'Prow', anchor: 'Anchor', handrail: 'Handrail', bridge: 'Bridge', chimney: 'Chimney', wheel: 'Wheel',
};
/** What each slot does on its own (every part). */
const SLOT_STATS: Record<ShipSlot, GearDef['stats']> = {
  hull: { hp: 4, def: 1 }, cannonMount: { str: 1, hit: 5 }, prow: { def: 1, str: 1 }, anchor: { def: 1 }, handrail: { res: 1 },
  bridge: { skl: 1 }, chimney: { spd: 1 }, wheel: { avoid: 5 },
};
const SLOT_DESC: Record<ShipSlot, string> = {
  hull: 'HP and DEF', cannonMount: 'cannon attack and accuracy', prow: 'collision damage and defense', anchor: 'resists forced movement',
  handrail: 'protects the crew', bridge: 'command and crew bonuses', chimney: 'speed and steam', wheel: 'turning and maneuverability',
};

/** The nine ship-part sets: 4 matching parts give the partial bonus, all 8 the full one (engine/phantom.ts shipSetBonus). */
export const SHIP_SETS: { id: string; name: string; rarity: Rarity; partial: string; full: string }[] = [
  { id: 'standard', name: 'S.S.', rarity: 'common', partial: '+2 DEF and RES', full: '+3 STR, DEF and RES, +1 MOV' },
  { id: 'simple', name: 'Simple', rarity: 'common', partial: 'repairs itself 5% HP a turn', full: 'repairs itself 10% HP a turn and fixes a knocked-out component' },
  { id: 'barrel', name: 'Barrel', rarity: 'uncommon', partial: '+1 passenger', full: '+2 passengers and +2 DEF' },
  { id: 'tropical', name: 'Tropical', rarity: 'uncommon', partial: '+1 MOV', full: '+2 MOV and +10 Avoid' },
  { id: 'stone', name: 'Stone', rarity: 'rare', partial: '+4 DEF', full: '+8 DEF and +4 ramming damage' },
  { id: 'vintage', name: 'Vintage', rarity: 'rare', partial: '+10 Hit with cannons', full: '+20 Hit and +10 Critical with cannons' },
  { id: 'demon', name: 'Demon', rarity: 'epic', partial: '+3 STR', full: '+6 STR; hits may inflict Fear' },
  { id: 'iron', name: 'Iron', rarity: 'epic', partial: 'damage taken −15%', full: 'damage taken −30%' },
  { id: 'golden', name: 'Golden', rarity: 'legendary', partial: '+25% battle Rupees', full: '+50% battle Rupees and +3 to every stat' },
];
export const shipPartId = (set: string, slot: ShipSlot) => `${set}${slot[0].toUpperCase()}${slot.slice(1)}Part`;
export const SHIP_PART_IDS: string[] = SHIP_SETS.flatMap((s) => SHIP_SLOTS.map((slot) => shipPartId(s.id, slot)));

const SHIP_PARTS: GearDef[] = SHIP_SETS.flatMap((set) => SHIP_SLOTS.map((slot) => ({
  id: shipPartId(set.id, slot), name: `${set.name} ${SHIP_SLOT_NAMES[slot]}`, slot, rarity: set.rarity, price: Math.round(PRICE[set.rarity] * 0.5),
  stats: { ...SLOT_STATS[slot], ...(set.id === 'golden' && slot === 'hull' ? { hp: 8, def: 1 } : {}) },
  desc: `Steamship part (${SHIP_SLOT_NAMES[slot]}: ${SLOT_DESC[slot]}). ${set.name} set — 4 parts: ${set.partial}; all 8: ${set.full}.`,
  ph: [`set:${set.id}`],
} as GearDef)));

/** Spirit Gem accessories (the gems themselves are collectibles that upgrade Leaf, Neri and Ciela). */
export const SPIRIT_GEM_GEAR = ['spiritOfPowerGem', 'spiritOfWisdomGem', 'spiritOfCourageGem'];

// Section 6's armor and accessories, the Anouki Chief's gear, the Potion Shop Lady's Wheelchair
// Spikes, the Salvage Arm, and the 72 ship parts (9 sets × 8 slots).
export const GEAR: GearDef[] = [
  head('phantomHelmet', 'Phantom Helmet', 'epic', { def: 5, res: 5 }, '+5 DEF and RES.'),
  body('phantomArmor', 'Phantom Armor', 'legendary', { def: 2, spd: -3 }, '+12 DEF against attacks from the front (the side you last faced), −3 SPD.', { ph: ['frontalDef12'] }),
  body('swiftPhantomArmor', 'Swift Phantom Armor', 'legendary', { def: 7, mov: 2 }, '+7 DEF, +2 MOV.'),
  body('warpPhantomArmor', 'Warp Phantom Armor', 'legendary', { def: 6, res: 3 }, '+6 DEF, +3 RES. Phantom Warp: teleport next to an enemy within 6, once per battle.', { ph: ['warp'] }),
  shield('geozardShield', 'Geozard Shield', 'rare', { def: 3, block: 25 }, '+3 DEF, 25% block. +4 DEF from the front; fire damage −40%.', { ph: ['frontalDef4', 'fireGuard'] }),
  body('anoukiCoat', 'Anouki Coat', 'uncommon', { def: 2, res: 2 }, 'No cold-terrain damage or snow penalties; can\'t be Frozen.', { ph: ['cold'] }),
  body('yookFurCloak', 'Yook Fur Cloak', 'rare', { def: 3, hp: 4 }, 'Ice damage −50%.', { ph: ['iceGuard'] }),
  body('cobbleRoyalArmor', 'Cobble Royal Armor', 'epic', { def: 7, res: 4 }, '+7 DEF, +4 RES.'),
  head('jolenesHeadband', "Jolene's Headband", 'rare', { skl: 3, spd: 3 }, '+3 SKL and SPD.'),
  body('linebecksCoat', "Linebeck's Coat", 'rare', { def: 2, lck: 4 }, 'More treasure: +1 buried treasure on every map, and +15% battle Rupees.', { ph: ['treasure'] }),
  acc('oceanKingsBlessing', "Ocean King's Blessing", 'mythic', { res: 3 }, 'Moves through water like a swimmer and recovers 10% HP each turn.', { ph: ['aquatic', 'regen10'], unique: true }),
  acc('spiritOfPowerGem', 'Spirit of Power Gem', 'epic', { str: 4 }, '+4 STR; weapon attacks deal +3 fire damage.', { ph: ['powerGem'] }),
  acc('spiritOfWisdomGem', 'Spirit of Wisdom Gem', 'epic', { def: 4, res: 4 }, '+4 DEF and RES.'),
  acc('spiritOfCourageGem', 'Spirit of Courage Gem', 'epic', { skl: 4 }, '+4 SKL; swords fire beams (range 2) and beams deal +3 damage.', { ph: ['courageGem'] }),
  // ── The Anouki Chief ──
  head('chiefsAntlerCrown', "Chief's Antler Crown", 'epic', { res: 4, lck: 2 }, '+4 RES, +2 LCK.', { unique: true }),
  body('chiefsWinterRobes', "Chief's Winter Robes", 'epic', { def: 5, res: 5 }, '+5 DEF and RES; can\'t be Frozen.', { ph: ['cold'], unique: true }),
  // ── The Potion Shop Lady ──
  acc('wheelchairSpikes', 'Wheelchair Spikes', 'rare', { def: 3 }, '+3 DEF; enemies that hit you in melee take 2 damage.', { ph: ['thorns2'], unique: true }),
  // ── Tools ──
  utility('salvageArm', 'Salvage Arm', 'rare', {}, 'Ships recover sunken treasure from up to 2 spaces away, and salvage finds ship parts, Spirit Gems and Sands of Hours more often.',
    { effects: ['grappleCrane'], ph: ['salvageArm'] }),
  ...SHIP_PARTS,
];
