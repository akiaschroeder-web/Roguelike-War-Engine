import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

// Section 6's new weapons and the character gear that goes in the main hand (Might and rarity from the doc; hit,
// crit, weight and range are my proposals). The Bow (Fairy Bow), Boomerang, Hookshot, Magic Hammer, Fire Rod, Ice Rod,
// Master Sword and its Tempered and Golden tiers reuse their existing entries.
export const WEAPONS: WeaponDef[] = [
  w('tornadoRod', 'Tornado Rod', 'magic', 'epic', 10, 85, 0, 3, 1, 2, { lb: ['wind', 'tornado'], inflict: { status: 'stun', chance: 30, turns: 1 },
    desc: 'A cyclone that lifts and stuns (30%): wind strips Margomill\'s segments; lifts the wielder onto high ground (Tornado Lifts).' }),
  w('sandRod', 'Sand Rod', 'magic', 'epic', 11, 85, 0, 3, 1, 3, { lb: ['sand'], desc: 'Raises temporary sand pillars (Sand Pillar) and fires a sand wave.' }),
  // ── Character gear (main hand) ──
  w('yugasPaintbrush', "Yuga's Paintbrush", 'magic', 'legendary', 28, 85, 5, 2, 1, 2, sig({ lb: ['painting'], element: 'dark',
    desc: 'Painting magic: hits wall-merged and painted units, and its hits can turn a foe into a painting (15%, 1 turn).' })),
  w('yugaGanonsTrident', "Yuga Ganon's Trident", 'lance', 'mythic', 34, 85, 10, 9, 1, 2, sig({ element: 'dark', strOrMag: true, lb: ['painting'],
    desc: 'Physical and dark magic: uses STR or MAG, whichever is higher. Hits wall-merged units.' })),
  w('hildasStaff', "Hilda's Staff", 'magic', 'legendary', 25, 90, 5, 2, 1, 2, sig({ element: 'dark', lb: ['darkGuard'], desc: 'Stronger dark and protective spells (Hilda\'s Veil +3 RES).' })),
  w('raviosHammer', "Ravio's Hammer", 'hammer', 'rare', 13, 80, 0, 6, 1, 1, sig({ lb: ['utility'], desc: 'More equipment utility: Merchant\'s Loan lasts a turn longer. Breaks Gemstone Barriers.' })),
  w('osfalasSandRod', "Osfala's Sand Rod", 'magic', 'epic', 16, 90, 0, 3, 1, 3, sig({ lb: ['sand', 'sandMaster'], desc: 'Better sand manipulation (pillars in a cross) and magic attacks.' })),
  w('grampsSword', "Gramps's Sword", 'sword', 'legendary', 25, 95, 10, 5, 1, 1, sig({ uses: 0, lb: ['counter'], desc: 'More counter damage (+30% on counterattacks).' })),
  w('sacredLightLB', 'Sacred Light', 'magic', 'rare', 11, 90, 0, 2, 1, 2, { element: 'light', sacredMult: 1.2, desc: 'A prayer of light: sacred damage (+20% against demons and the undead).' }),
  w('witchsSpark', "Witch's Spark", 'magic', 'uncommon', 9, 90, 5, 1, 1, 2, { element: 'fire', desc: 'A crackle of broom-witch fire.' }),
  w('thievesDaggerLB', "Thief's Dagger", 'dagger', 'rare', 8, 95, 15, 2, 1, 1, { desc: 'Light and quick.' }),
  w('loruleSword', 'Lorule Sword', 'sword', 'common', 7, 90, 0, 5, 1, 1, { desc: 'The standard sword of Lorule\'s guard.' }),
  w('loruleSpear', 'Lorule Spear', 'lance', 'common', 8, 85, 0, 6, 1, 2, { desc: 'Reaches two spaces.' }),
  // ── Natural weapons ──
  nat('sheerowPeck', 'Peck', 4, 95, 5, 1, 1),
  nat('maiamaiTentacle', 'Tentacle Slap', 9, 85, 0, 1, 1),
  nat('maiamaiSquirt', 'Ink Squirt', 3, 90, 0, 1, 2, { magicContact: true, element: 'water' }),
  nat('rupeeLikeSwallow', 'Greedy Swallow', 7, 85, 0, 1, 1),
  nat('bariShock', 'Electric Touch', 8, 85, 0, 1, 1, { magicContact: true, element: 'lightning', inflict: { status: 'shock', chance: 20, turns: 1 } }),
  nat('biriZap', 'Zap', 4, 90, 0, 1, 1, { magicContact: true, element: 'lightning' }),
  nat('gimosFireCore', 'Fire Trident', 10, 80, 0, 1, 2, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 25, turns: 2 } }),
  nat('gimosIceCore', 'Ice Trident', 10, 80, 0, 1, 2, { magicContact: true, element: 'ice', inflict: { status: 'freeze', chance: 15, turns: 1 } }),
  nat('pengatorSlide', 'Belly Slide', 9, 85, 0, 1, 1),
  nat('devalantPincers', 'Sand Pincers', 10, 85, 5, 1, 1),
  // ── Bosses ──
  nat('margomillBlades', 'Spinning Blades', 13, 80, 0, 1, 1),
  nat('margomillGale', 'Gale', 10, 85, 0, 2, 3, { magicContact: true, lb: ['wind'] }),
  nat('gemesaurBite', 'Gem-Crusted Bite', 16, 80, 5, 1, 1),
  nat('gemesaurBarrageShot', 'Gemstone Shards', 11, 80, 0, 2, 3),
  nat('knucklemasterFist', 'Crushing Fist', 16, 80, 5, 1, 1),
  nat('stalblindSword', 'Shielded Slash', 14, 85, 5, 1, 1),
  nat('stalblindBreath', 'Spectral Breath', 11, 85, 0, 1, 2, { magicContact: true, element: 'dark' }),
  nat('zaganagaVines', 'Root Lash', 11, 80, 0, 1, 2),
  nat('zaganagaSeeds', 'Spiked Seeds', 10, 85, 0, 2, 3, { magicContact: true, element: 'nature', inflict: { status: 'poison', chance: 25, turns: 2 } }),
  nat('dharkstareBeam', 'Ice Beam', 14, 85, 0, 1, 3, { magicContact: true, element: 'ice', inflict: { status: 'freeze', chance: 15, turns: 1 } }),
  nat('dharkstareTendrils', 'Frozen Tendrils', 10, 80, 0, 1, 1),
  nat('grinexxShellSlam', 'Shell Slam', 17, 75, 0, 1, 1),
  nat('grinexxGeyser', 'Lava Geyser', 14, 80, 0, 1, 3, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('yugaGanonBolts', 'Lightning Bolts', 15, 85, 0, 2, 3, { magicContact: true, element: 'lightning', inflict: { status: 'shock', chance: 20, turns: 1 } }),
  nat('heedleFlame', 'Burning Body', 9, 85, 0, 1, 2, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 25, turns: 2 } }),
  nat('gigabariShock', 'Electric Mass', 12, 85, 0, 1, 1, { magicContact: true, element: 'lightning', inflict: { status: 'shock', chance: 25, turns: 1 } }),
  nat('bigPengatorCharge', 'Heavy Slide', 13, 85, 5, 1, 1),
];
