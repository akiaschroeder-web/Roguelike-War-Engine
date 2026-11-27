import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });
/** Micro-sized gear (engine/micro.ts): native Micro units can only use Micro weapons. */
const MICRO = ['micro'];

// Section 7's weapons (Mt and rarity from the doc; hit, crit, weight and range are my proposals). The White
// Sword, Magical Boomerang, Bombs and the Healing Staff reuse their existing entries.
export const WEAPONS: WeaponDef[] = [
  // ── Weapons and tools ──
  w('smithsSword', "Smith's Sword", 'sword', 'common', 7, 95, 0, 2, 1, 1, { uses: 50, desc: 'Light: a well-balanced sword from Smith\'s forge.' }),
  w('picoriBlade', 'Picori Blade', 'sword', 'legendary', 9, 85, 0, 5, 1, 1, { uses: 0, unique: true, mc: ['sacred', 'picori'], desc: 'The dormant sacred blade of the Minish: Melari can reforge it into the White Sword, and the four Elements awaken it.' }),
  w('whiteSwordTwo', 'White Sword (Two Elements)', 'sword', 'legendary', 15, 90, 5, 5, 1, 1, { uses: 0, unique: true, element: 'light', sacredMult: 1.2, mc: ['sacred', 'picori', 'dup:1'],
    desc: 'The White Sword with the Earth and Fire Elements infused: Four Sword Split makes one duplicate.' }),
  w('whiteSwordThree', 'White Sword (Three Elements)', 'sword', 'legendary', 19, 90, 5, 5, 1, 1, { uses: 0, unique: true, element: 'light', sacredMult: 1.3, mc: ['sacred', 'picori', 'dup:2'],
    desc: 'Three Elements infused: Four Sword Split makes two duplicates.' }),
  w('fourSword', 'Four Sword', 'sword', 'mythic', 25, 95, 10, 6, 1, 1, { uses: 0, unique: true, element: 'light', sacredMult: 1.5, mc: ['sacred', 'picori', 'dup:3'],
    desc: 'The legendary sacred blade, all four Elements infused: Four Sword Split makes three duplicates.' }),
  w('caneOfPacci', 'Cane of Pacci', 'magic', 'epic', 6, 85, 0, 3, 1, 3, sig({ mc: ['pacci', 'flip', 'tool'], desc: 'Flips enemies and objects (a hit leaves the target flipped: −5 DEF and its shell or slime open); launches from Pacci Holes.' })),
  w('ocarinaOfWind', 'Ocarina of Wind', 'instrument', 'epic', 0, 0, 0, 1, 1, 1, sig({ mc: ['windCrest'], desc: 'From a Wind Crest, travel to any other Wind Crest on the field.' })),
  // ── Micro equipment ──
  w('minishSword', 'Minish Sword', 'sword', 'common', 6, 95, 0, 1, 1, 1, { mc: MICRO, desc: 'Micro-sized.' }),
  w('minishSpear', 'Minish Spear', 'lance', 'common', 7, 85, 0, 1, 1, 1, { mc: [...MICRO, 'microReach'], desc: 'Micro-sized; more reach against Micro enemies (+15 Hit).' }),
  w('minishHammer', 'Minish Hammer', 'hammer', 'uncommon', 9, 75, 0, 2, 1, 1, { mc: [...MICRO, 'mechanical'], desc: 'Micro-sized; effective against internal mechanisms (Micro damage against armour and machines 50%; internal strikes +6 on constructs).' }),
  w('minishBow', 'Minish Bow', 'bow', 'uncommon', 6, 85, 0, 1, 2, 2, { mc: MICRO, desc: 'Micro-sized, ranged.' }),
  w('minishStaffWeapon', 'Minish Staff', 'magic', 'uncommon', 8, 85, 0, 1, 1, 2, { mc: MICRO, desc: 'Micro-sized: 8 magical Might.' }),
  w('melarisHammer', "Melari's Hammer", 'hammer', 'legendary', 16, 85, 5, 3, 1, 1, sig({ uses: 0, mc: [...MICRO, 'mechanical', 'forging'], desc: 'Micro-sized; advanced field forging: the wielder\'s host recovers 3 weapon uses a turn.' })),
  w('ezlosStaff', "Ezlo's Staff", 'magic', 'legendary', 18, 90, 5, 1, 1, 2, sig({ uses: 0, mc: [...MICRO, 'sizeBoost'], desc: 'Micro-sized: 18 magical Might; size-changing spells cost nothing.' })),
  // ── Character gear ──
  w('daltusRoyalSword', "Daltus's Royal Sword", 'sword', 'epic', 18, 85, 5, 6, 1, 1, sig({ mc: ['commander'], desc: 'Better commander support: Royal Authority reaches 2 further.' })),
  w('swiftbladesSword', "Swiftblade's Sword", 'sword', 'epic', 17, 95, 10, 4, 1, 1, sig({ mc: ['techThrift'], desc: 'Sword techniques cost 20% less STA.' })),
  w('greatbladesSword', "Greatblade's Sword", 'sword', 'epic', 22, 75, 5, 10, 1, 1, sig({ mc: ['charged'], desc: 'Better charged attacks: +4 damage when the wielder hasn\'t moved this turn.' })),
  w('grimbladesSword', "Grimblade's Sword", 'sword', 'epic', 19, 85, 10, 5, 1, 1, sig({ mc: ['peril'], desc: 'Stronger at low HP: below half HP, +4 damage and +15 Crit.' })),
  w('vaatisDarkOrb', "Vaati's Dark Orb", 'magic', 'legendary', 27, 85, 5, 4, 1, 2, sig({ element: 'dark', desc: 'Dark projectiles.' })),
  w('vaatisEye', "Vaati's Eye", 'magic', 'mythic', 30, 90, 10, 4, 1, 3, sig({ element: 'dark', pierce: 0.3, desc: 'Piercing beams (ignore 30% of RES).' })),
  w('ballAndChainFlail', 'Ball and Chain Flail', 'hammer', 'epic', 22, 70, 0, 12, 1, 2, sig({ splash: 'around', desc: 'Sweeping area attacks: half damage to every other enemy next to the wielder.' })),
  w('smithsHammer', "Smith's Hammer", 'hammer', 'uncommon', 10, 80, 0, 6, 1, 1, { mc: ['tool'], desc: 'A forge hammer. Strikes shell mechanisms.' }),
  w('lightArrowMC', 'Light Force', 'magic', 'legendary', 13, 90, 5, 2, 1, 2, sig({ element: 'light', sacredMult: 1.3, desc: 'The Light Force made into a bolt of light.' })),
  w('capGust', 'Cap Gust', 'magic', 'common', 6, 90, 0, 0, 1, 2, { uses: 0, unique: true, mc: MICRO, desc: 'Ezlo flaps his brim.' }),
  w('windTome', 'Wind Tribe Gale', 'magic', 'rare', 11, 85, 0, 2, 1, 2, { desc: 'A gust of the Wind Tribe\'s magic.' }),
  w('poetsLyre', "Poet's Lyre", 'instrument', 'uncommon', 0, 0, 0, 1, 1, 1, { songDiscount: 2, desc: 'Songs cost 2 less MP.' }),
  w('blackBlade', 'Black Blade', 'sword', 'legendary', 20, 85, 10, 8, 1, 1, { desc: 'The Black Knight\'s sword.' }),
  // ── Monsters ──
  nat('pestoSting', 'Sting', 5, 85, 0, 1, 1, { mc: ['microHunter'] }),
  nat('puffstoolSporeCloud', 'Spores', 5, 80, 0, 1, 1, { magicContact: true, element: 'nature', inflict: { status: 'poison', chance: 40, turns: 2 } }),
  nat('spinyBeetleHorn', 'Spiny Horn', 8, 80, 0, 1, 1),
  nat('rollobiteRoll', 'Armored Roll', 7, 80, 0, 1, 1),
  nat('eyegoreBeamMC', 'Eye Beam', 10, 80, 0, 2, 3, { magicContact: true }),
  nat('eyegoreSlam', 'Stone Slam', 12, 75, 0, 1, 1),
  nat('madderpillarBite', 'Headbutt', 9, 85, 0, 1, 1),
  nat('spinyChuSpikes', 'Spiked Bounce', 8, 80, 0, 1, 1),
  // ── Bosses ──
  nat('bigChuSlam', 'Gelatinous Slam', 12, 80, 0, 1, 1),
  nat('acidSplash', 'Acid Splash', 9, 80, 0, 2, 2, { magicContact: true, element: 'nature' }),
  nat('bigBlueShock', 'Electrical Discharge', 11, 85, 0, 1, 2, { magicContact: true, element: 'lightning', inflict: { status: 'shock', chance: 25, turns: 1 } }),
  nat('octorokBoulder', 'Boulder Spit', 12, 75, 0, 1, 3),
  nat('freezingBreathMC', 'Freezing Breath', 11, 85, 0, 1, 2, { magicContact: true, element: 'ice', inflict: { status: 'freeze', chance: 20, turns: 1 } }),
  nat('gleerokFlame', 'Lava Breath', 13, 80, 0, 1, 2, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('crushingNeck', 'Crushing Neck', 14, 80, 5, 1, 1),
  nat('mazaalHands', 'Crushing Hands', 15, 80, 0, 1, 2),
  nat('mazaalEyeBeam', 'Eye Beam', 12, 85, 0, 2, 3, { magicContact: true, element: 'light' }),
  nat('gyorgCharge', 'Aerial Charge', 13, 80, 0, 1, 1),
  nat('gyorgEyeBeam', 'Eye Volley', 10, 85, 0, 2, 3, { magicContact: true }),
  nat('gyorgStrike', 'Diving Strike', 14, 85, 5, 1, 1),
  nat('darkOrbShot', 'Dark Orb', 14, 85, 0, 1, 2, { magicContact: true, element: 'dark' }),
  nat('shadowFlame', 'Shadow Flame', 12, 85, 0, 1, 1, { magicContact: true, element: 'fire' }),
  nat('darkEyeBeam', 'Dark Eye Beam', 15, 85, 0, 1, 3, { magicContact: true, element: 'dark' }),
  nat('spikedOrb', 'Spiked Orb', 13, 80, 0, 1, 1),
  nat('crushingClaw', 'Crushing Claw', 18, 80, 5, 1, 1),
  nat('darkCyclone', 'Dark Cyclone', 16, 85, 0, 1, 2, { magicContact: true, element: 'dark' }),
];
