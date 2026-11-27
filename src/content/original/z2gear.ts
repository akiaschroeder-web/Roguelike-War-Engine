// Zelda II: The Adventure of Link — weapons, armor, accessories, pack and quest items
// (design doc sections 7 and 8). Gooma uses the existing Ball and Chain; the Raft,
// Recorder, Magical Key, Hammer (Megaton Hammer), Triforce of Courage and Magic
// Containers are the existing entries.

import type { GearDef, GearSlotKind, ItemDef, Rarity, WeaponDef, WeaponType } from '../../engine/types';

const WPRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };
const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: WPRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

export const Z2_WEAPONS: WeaponDef[] = [
  // ── Section 7 ──
  w('dairaAxe', 'Daira Axe', 'axe', 'rare', 13, 75, 5, 8, 1, 4, { uses: 45, desc: 'Thrown up to 4 spaces and caught again (never lost).' }),
  w('doomknockerHammer', 'Doomknocker Hammer', 'hammer', 'rare', 15, 70, 5, 10, 1, 3, { uses: 45,
    desc: 'Thrown, it comes back: attacking from 2 or more spaces away strikes once more on the return.' }),
  w('horseheadsMace', "Horsehead's Mace", 'hammer', 'epic', 19, 75, 5, 12, 1, 1, sig({ uses: 50, desc: 'Crushes shields: ignores the DEF a shield gives and can\'t be blocked.' })),
  w('rebonacksLance', "Rebonack's Lance", 'lance', 'legendary', 21, 85, 10, 11, 1, 1, sig({ uses: 0, momentum: 6, desc: '+1 Might per space travelled before attacking (up to +6).' })),
  w('fokkaSword', 'Fokka Sword', 'sword', 'epic', 16, 90, 10, 6, 1, 1, sig({ uses: 50, desc: 'Jumping attacks (after moving, or while leaping) bypass shields: no block, no shield DEF.' })),
  w('carocksStaff', "Carock's Staff", 'magic', 'legendary', 22, 85, 5, 5, 1, 3, sig({ uses: 0, desc: 'Teleport magic costs half the MP.' })),
  // ── Monster and guardian weapons ──
  nat('bitBounce', 'Bouncing Body', 4, 85, 0, 1, 1),
  nat('botSlam', 'Bouncing Slam', 6, 85, 0, 1, 1),
  nat('mobyTalons', 'Diving Talons', 7, 85, 5, 1, 1),
  nat('deelerFangs', 'Deeler Fangs', 8, 85, 5, 1, 1, { inflict: { status: 'poison', chance: 20, turns: 2 } }),
  nat('geruMace', 'Geru Mace', 9, 80, 5, 1, 1),
  nat('geldarmMandibles', 'Geldarm Mandibles', 10, 80, 5, 1, 1),
  nat('moaFlame', 'Moa Flame', 8, 85, 0, 1, 2, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 20, turns: 2 } }),
  nat('myuSpikes', 'Spiked Shell', 6, 80, 0, 1, 1),
  nat('bagoBite', 'Bone Jaws', 7, 85, 5, 1, 1),
  nat('bagoBones', 'Spat Bones', 5, 75, 0, 2, 2),
  nat('gumaMace', 'Chained Mace', 12, 75, 5, 1, 2),
  nat('fokkeruFire', 'Bouncing Fireballs', 10, 80, 0, 1, 3, { magicContact: true, element: 'fire', splash: 'adjacent' }),
  nat('fokkeruTalons', 'Fokkeru Talons', 8, 85, 5, 1, 1),
  nat('wosuClaws', 'Wosu Claws', 6, 85, 0, 1, 1),
  nat('magoBolt', 'Mago Bolt', 9, 85, 0, 1, 3, { magicContact: true }),
  nat('helmetBolt', 'Spectral Bolt', 7, 85, 0, 1, 3, { magicContact: true, element: 'fire' }),
  nat('helmetheadBlade', 'Haunted Blade', 13, 85, 5, 1, 1),
  nat('helmetFireball', 'Helmet Fireballs', 12, 80, 0, 2, 4, { magicContact: true, element: 'fire' }),
  nat('rebonackBeam', 'Lance Beam', 11, 80, 0, 2, 3, { magicContact: true }),
  nat('carockBolt', 'Arcane Bolt', 14, 90, 0, 1, 5, { magicContact: true }),
  nat('thunderbirdFlames', 'Guardian Flames', 16, 85, 0, 1, 4, { magicContact: true, element: 'fire', splash: 'adjacent' }),
  nat('thunderbirdTalons', 'Guardian Talons', 15, 85, 5, 1, 1),
];

const GPRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: GPRICE[rarity], stats, desc, ...extra });
const head = gs('head'), body = gs('body'), feet = gs('feet'), acc = gs('accessory');

export const Z2_GEAR: GearDef[] = [
  body('horseheadsArmor', "Horsehead's Armor", 'epic', { def: 8 }, '+8 DEF. Ordinary physical blows from the front deal 15% less (jumping attacks, and attacks on a surrounded wearer, still land in full).', { effects: ['frontalArmor'] }),
  head('helmetheadsHelm', "Helmethead's Helm", 'legendary', { def: 4, res: 4 }, '+4 DEF, +4 RES. Once per battle, release a Spectral Helmet that fights on its own (Spectral Helmet).', { effects: ['spectralHelmet'] }),
  body('rebonacksArmor', "Rebonack's Armor", 'legendary', { def: 7, skl: 3 }, '+7 DEF, +3 SKL.'),
  head('fokkaHelmet', 'Fokka Helmet', 'rare', { def: 3 }, '+3 DEF. +15 Hit against flying and leaping enemies.', { effects: ['aerialAim'] }),
  head('thunderbirdMask', 'Thunderbird Mask', 'legendary', { mag: 6, res: 5 }, '+6 MAG, +5 RES — but lightning hurts the wearer 50% more.', { effects: ['lightningVulnerable'] }),
  feet('magicBoots', 'Magic Boots', 'epic', {}, 'Walk on water: water and deep water cost 1 movement.', { effects: ['waterWalk'] }),
  acc('cross', 'Cross', 'legendary', {}, 'Reveals invisible enemies within 5 at the start of each turn (Moas, Ganon).', { effects: ['cross'], unique: true }),
];

const it = (d: ItemDef): ItemDef => d;

export const Z2_ITEMS: ItemDef[] = [
  it({ id: 'experienceBag', name: 'Experience Bag (P-Bag)', kind: 'special', rarity: 'uncommon', price: 160, power: 0, uses: 1, desc: 'Open it: immediate experience (60 EXP).' }),
  it({ id: 'linkDoll', name: 'Link Doll', kind: 'special', rarity: 'epic', price: 480, power: 0, uses: 1,
    desc: 'Carry it for the battle: the next fatal blow is prevented and you recover 25% HP. The doll is used up.' }),
  it({ id: 'waterOfLife', name: 'Water of Life', kind: 'mp', rarity: 'rare', price: 260, power: 999, uses: 1, desc: 'Fully restores MP. (A sick child in Saria needs some too.)' }),
  it({ id: 'moaEye', name: 'Moa Eye', kind: 'special', rarity: 'rare', price: 220, power: 0, uses: 1, desc: 'See the unseen: reveals invisible enemies within 6, and they stay revealed for 3 turns.' }),
  it({ id: 'myuSpike', name: 'Myu Spike', kind: 'special', rarity: 'uncommon', price: 140, power: 0, uses: 1, desc: 'Fix it to your shield: for 3 turns, melee attackers take 4 damage when they hit you.' }),
  it({ id: 'fokkaFeather', name: 'Fokka Feather', kind: 'special', rarity: 'epic', price: 360, power: 0, uses: 1, desc: 'For 2 turns: +2 MOV, leap over units, and your attacks count as jumping attacks.' }),
  it({ id: 'thunderbirdFlame', name: 'Thunderbird Flame', kind: 'special', rarity: 'legendary', price: 700, power: 0, uses: 1, desc: 'Legendary fire: +6 MAG for 3 turns and your sword attacks deal +4 fire damage.' }),
];

/** Quest items. Triforce of Courage and Magic Containers are the existing entries. */
export const Z2_QUEST_ITEMS: { id: string; name: string; desc: string }[] = [
  { id: 'palaceCrystal', name: 'Palace Crystal', desc: 'Placed in a palace\'s statue once its guardian falls. Six of them open the Great Palace.' },
  { id: 'trophy', name: 'Trophy', desc: 'Ruto\'s stolen trophy. Its owner will teach a spell in exchange.' },
  { id: 'lostMirror', name: 'Lost Mirror', desc: 'A hand mirror found under a table in Saria. Its owner will reward its return.' },
];
