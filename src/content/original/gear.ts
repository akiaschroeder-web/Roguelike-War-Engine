import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), body = gs('body'), acc = gs('accessory');

// Section 6. The Power Bracelet is the existing Power Bracelets; the complete Triforce of
// Wisdom is the existing accessory (eight fragments are another way to get it).
export const GEAR: GearDef[] = [
  shield('magicalShield', 'Magical Shield', 'epic', { def: 8, res: 6, block: 30 }, '+8 DEF, +6 RES, 30% block. Halves magic projectiles (ranged magic).', { effects: ['magicalShield'] }),
  body('greenClothes', 'Green Clothes', 'common', { def: 1, spd: 1, avoid: 5 }, 'Light adventurer clothing: +1 DEF, +1 SPD, +5 Avoid.'),
  acc('blueRing', 'Blue Ring', 'epic', {}, 'Incoming damage −25%. (Rings don\'t stack: the Red Ring wins.)', { effects: ['blueRing'] }),
  acc('redRing', 'Red Ring', 'legendary', {}, 'Incoming damage −50%. (Rings don\'t stack.)', { effects: ['redRing'] }),
  acc('raft', 'Raft', 'uncommon', {}, 'Travel designated water routes: water costs 2 movement, and a Raft Dock gives +2 MOV for the turn.', { effects: ['raft'] }),
  acc('stepladder', 'Stepladder', 'rare', {}, 'Bridges one-space gaps: Ladder Crossings cost 1 movement, narrow water costs 3.', { effects: ['stepladder'] }),
  acc('recorder', 'Recorder', 'epic', {}, 'Play it (Recorder ability): a whirlwind carries you up to 6 spaces, Digdoggers within 4 shrink, and Pols Voices within 3 are hurt.', { effects: ['recorder'] }),
  acc('bookOfMagic', 'Book of Magic', 'epic', { mag: 2 }, '+2 MAG. Magical Rod bolts leave the target\'s ground burning.', { effects: ['bookOfMagic'] }),
  acc('magicalKey', 'Magical Key', 'legendary', {}, 'Opens ordinary Locked Doors without Small Keys (Open Door).', { effects: ['magicalKey'], unique: true }),
  acc('letter', 'Letter', 'uncommon', { lck: 1 }, 'An old man\'s letter. Show it to the Old Woman to buy her medicine.', { effects: ['letter'], unique: true }),
  acc('blueCandle', 'Blue Candle', 'uncommon', {}, 'Light a fire within 2 once per battle: burns enemies there and Burnable Bushes (which may hide secrets).', { effects: ['blueCandle'] }),
  acc('redCandle', 'Red Candle', 'rare', {}, 'As the Blue Candle, but usable again after a 2-turn cooldown.', { effects: ['redCandle'] }),
];
