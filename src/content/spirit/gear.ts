import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), body = gs('body'), acc = gs('accessory'), head = gs('head'), hands = gs('hands'), mount = gs('mount'), tool = gs('tool');

/** The four train part slots (section 6): Engine, Cannon, Passenger Car, Freight Car. */
export const TRAIN_SLOTS = ['trainEngine', 'trainCannon', 'passengerCar', 'freightCar'] as const;
export type TrainSlot = (typeof TRAIN_SLOTS)[number];
export const TRAIN_SLOT_NAMES: Record<TrainSlot, string> = { trainEngine: 'Engine', trainCannon: 'Cannon', passengerCar: 'Passenger Car', freightCar: 'Freight Car' };
const SLOT_STATS: Record<TrainSlot, GearDef['stats']> = {
  trainEngine: { spd: 1, skl: 1 }, trainCannon: { str: 1, hit: 5 }, passengerCar: { res: 1 }, freightCar: { hp: 3, def: 1 },
};
const SLOT_DESC: Record<TrainSlot, string> = {
  trainEngine: 'movement, acceleration and collisions', trainCannon: 'cannon attack and accuracy', passengerCar: 'troop capacity and comfort', freightCar: 'cargo and supplies',
};

/** The eight train-part sets: 2 matching parts give the partial bonus, all 4 the full one (engine/spirit.ts). */
export const TRAIN_SETS: { id: string; name: string; rarity: Rarity; partial: string; full: string }[] = [
  { id: 'spirit', name: 'Spirit', rarity: 'common', partial: '+2 DEF and RES', full: '+3 STR, DEF and RES, +1 MOV' },
  { id: 'wooden', name: 'Wooden', rarity: 'common', partial: '+1 MOV', full: '+2 MOV and +10 Avoid' },
  { id: 'steel', name: 'Steel', rarity: 'uncommon', partial: '+4 DEF', full: '+8 DEF and damage taken −15%' },
  { id: 'sweet', name: 'Sweet', rarity: 'uncommon', partial: 'passengers and adjacent allies recover 10% HP a turn', full: '20% HP a turn, and ailments are cured' },
  { id: 'stagecoach', name: 'Stagecoach', rarity: 'rare', partial: '+1 passenger', full: '+2 passengers and +2 RES' },
  { id: 'dragon', name: 'Dragon', rarity: 'rare', partial: '+3 STR', full: '+6 STR; its hits may Burn' },
  { id: 'skull', name: 'Skull', rarity: 'epic', partial: '+4 RES', full: '+8 RES; immune to Fear, and its hits may inflict Fear' },
  { id: 'golden', name: 'Golden', rarity: 'legendary', partial: '+25% battle Rupees', full: '+50% battle Rupees and +3 to every stat' },
];
export const trainPartId = (set: string, slot: TrainSlot) => `${set}${slot[0].toUpperCase()}${slot.slice(1)}Part`;
export const TRAIN_PART_IDS: string[] = TRAIN_SETS.flatMap((s) => TRAIN_SLOTS.map((slot) => trainPartId(s.id, slot)));

const TRAIN_PARTS: GearDef[] = TRAIN_SETS.flatMap((set) => TRAIN_SLOTS.map((slot) => ({
  id: trainPartId(set.id, slot), name: `${set.name} ${TRAIN_SLOT_NAMES[slot]}`, slot, rarity: set.rarity, price: Math.round(PRICE[set.rarity] * 0.5),
  stats: { ...SLOT_STATS[slot] },
  desc: `Train part (${TRAIN_SLOT_NAMES[slot]}: ${SLOT_DESC[slot]}). ${set.name} set — 2 parts: ${set.partial}; all 4: ${set.full}.`,
  st: [`trainSet:${set.id}`],
  // Found, traded for and won in New Hyrule (not sold in ordinary shops).
  unique: true,
} as GearDef)));

// Section 7's armor, tools and accessories, Big Blin's gear, the ChuChu Iron Helmet, and the 32 train parts.
export const GEAR: GearDef[] = [
  body('engineersClothes', "Engineer's Clothes", 'uncommon', { def: 2, skl: 2 }, '+2 DEF and SKL. Better rail repairs: mends Broken Track without using an action, and repairs on trains heal 25% more.', { st: ['engineer'] }),
  body('recruitUniform', 'Recruit Uniform', 'common', { def: 2, res: 1, spd: 1 }, 'Light, balanced armor: +2 DEF, +1 RES, +1 SPD.'),
  shield('shieldOfAntiquity', 'Shield of Antiquity', 'legendary', { def: 5, res: 6, block: 30 }, '+5 DEF, +6 RES, 30% block. Very durable; magic damage taken −25%.', { durability: 60, st: ['magicGuard'] }),
  hands('byrnesGauntlet', "Byrne's Gauntlet", 'legendary', { str: 3, def: 2 }, '+3 STR, +2 DEF. Grab, pull and throw: Iron Grab and Gauntlet Throw.', { unique: true }),
  body('wreckerPhantomArmor', 'Wrecker Phantom Armor', 'legendary', { def: 14, spd: -2 }, '+14 DEF, −2 SPD. Rolling attacks: Wrecking Roll.', { unique: true }),
  body('lokomoSageRobes', 'Lokomo Sage Robes', 'epic', { mag: 5, res: 5 }, '+5 MAG and RES.'),
  mount('lokomoWheelchair', 'Lokomo Wheelchair', 'rare', { mov: 2 }, '+2 MOV on ordinary terrain (rides like a mount: no mountains, slow in forests). Size 1.', { size: 1 }),
  acc('malladusHorn', "Malladus's Horn", 'mythic', { str: 7, mag: 7 }, '+7 STR and MAG.', { unique: true }),
  acc('sacredSpiritGem', 'Sacred Spirit Gem', 'legendary', { mag: 3, res: 3 }, '+3 MAG and RES. Stronger possession and music: songs cost 25% less, and a possessed Phantom form gains +3 to every stat.', { st: ['spiritGem'] }),
  acc('engineersCertificate', "Engineer's Certificate", 'rare', { skl: 3 }, '+3 SKL. Mechanical proficiency: mends Broken Track and throws switches without using an action; siege weapons +10 Hit.', { st: ['engineer', 'mechanic'] }),
  acc('pirateNecklace', 'Pirate Necklace', 'uncommon', { str: 2 }, '+2 STR; +25% damage in ship and train battles.', { st: ['boarding'] }),
  tool('captureBasket', 'Capture Basket', 'rare', {}, 'A big basket for carrying off a beaten foe: Capture.'),
  head('chuchuIronHelmet', 'ChuChu Iron Helmet', 'rare', { def: 12, res: 2, spd: -1 }, '+12 DEF, +2 RES; prevents critical hits. ChuChu units only (anyone else gets nothing from it). It supplies the Iron Helmet skill\'s +12 DEF: they don\'t stack.', { st: ['chuHelmet'] }),
  ...TRAIN_PARTS,
];
