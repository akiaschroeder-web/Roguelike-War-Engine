import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

// Section 4's new main-hand tools and boss weapons (Might and rarity from the doc; hit, crit, weight and range are my
// proposals). The Gust Jar, Fire Rod, Bow, Boomerang, Hammer and swords reuse their existing entries.
export const WEAPONS: WeaponDef[] = [
  w('waterRod', 'Water Rod', 'magic', 'epic', 9, 90, 0, 2, 1, 2, { element: 'water', tf: ['waterRod'],
    desc: 'A jet of water; raises temporary Water Pillars that lift a unit (Water Pillar: +1 height for 3 turns).' }),
  w('ladyMaudsParasol', "Lady Maud's Parasol", 'magic', 'legendary', 26, 90, 5, 2, 1, 2, sig({ tf: ['reflect'],
    desc: 'Magical reflection: magic attackers take a quarter of the damage they deal back.' })),
  w('grimRepoesScythe', "Grim Repoe's Scythe", 'axe', 'epic', 21, 80, 10, 8, 1, 1, { element: 'dark', pierce: 0.3, tf: ['spectral'],
    desc: 'Spectral damage: dark, and ignores 30% of DEF.' }),
  w('stalchampionsSword', "Stalchampion's Sword", 'sword', 'legendary', 28, 80, 5, 12, 1, 2, { tf: ['vertical'], twoHanded: true,
    desc: 'More vertical attack range: reaches 2 spaces, and strikes the top of a Totem and fliers without penalty.' }),
  // ── Character weapons ──
  w('fashionSparkle', 'Fashion Sparkle', 'magic', 'uncommon', 8, 95, 5, 1, 1, 2, sig({ element: 'light', desc: 'A dazzle of sequins: light magic.' })),
  w('kingsScepterTF', "King Tuft's Scepter", 'hammer', 'rare', 13, 85, 0, 6, 1, 1, sig({ desc: 'Heavy, golden and covered in jewels. It has never been used as anything but a weapon.' })),
  w('tailorsNeedle', "Tailor's Needle", 'dagger', 'rare', 8, 95, 15, 1, 1, 1, sig({ desc: 'A needle as long as a sword. Precise.' })),
  // ── Natural weapons ──
  nat('totemArmosClub', 'Totem Club', 12, 80, 0, 1, 1),
  nat('keeleonTongue', 'Tongue Lash', 9, 90, 5, 1, 2),
  nat('keeleonFireTongue', 'Flaming Tongue', 10, 85, 5, 1, 2, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 25, turns: 2 } }),
  nat('hokkubokkuSlam', 'Segment Slam', 11, 80, 0, 1, 1),
  nat('miniMargoSpikes', 'Spikes', 8, 85, 0, 1, 1),
  // ── Bosses ──
  nat('margomaSpikes', 'Spiked Rim', 15, 80, 5, 1, 1),
  nat('margomaEyeBeam', 'Eye Beam', 12, 85, 0, 2, 3, { magicContact: true }),
  nat('blizzagiaFangs', 'Frozen Fangs', 15, 80, 5, 1, 1, { element: 'ice' }),
  nat('blizzagiaBreath', 'Freezing Breath', 14, 85, 0, 2, 3, { magicContact: true, element: 'ice', inflict: { status: 'freeze', chance: 20, turns: 1 } }),
  nat('petsFangs', 'Threefold Bite', 15, 80, 5, 1, 1),
  nat('petsBolts', 'Elemental Bolts', 13, 85, 0, 2, 3, { magicContact: true, element: 'lightning' }),
  nat('stalchampionBlade', 'Giant Sword', 17, 80, 10, 1, 2, { tf: ['vertical'] }),
  nat('prismantusBeam', 'Prism Beam', 14, 85, 0, 1, 3, { magicContact: true, element: 'light' }),
  nat('blobKingShock', 'Crown Shock', 11, 85, 0, 1, 2, { magicContact: true, element: 'lightning', inflict: { status: 'shock', chance: 25, turns: 1 } }),
  nat('blobQueenShock', 'Brood Shock', 12, 85, 0, 1, 2, { magicContact: true, element: 'lightning', inflict: { status: 'shock', chance: 20, turns: 1 } }),
  nat('freezlordShard', 'Freezing Shard', 13, 85, 0, 1, 3, { magicContact: true, element: 'ice', inflict: { status: 'freeze', chance: 25, turns: 1 } }),
  nat('vizierTalons', 'Talons', 12, 85, 5, 1, 1),
  nat('vizierGust', 'Desert Gust', 11, 85, 0, 2, 3, { magicContact: true }),
  nat('repoeScythe', 'Spectral Scythe', 16, 80, 10, 1, 1, { element: 'dark', pierce: 0.3 }),
  nat('gigaleonTongue', 'Hidden Tongue', 15, 85, 10, 1, 2),
  nat('maudParasolBolt', 'Parasol Bolt', 16, 90, 5, 1, 3, { magicContact: true, tf: ['reflect'] }),
];
