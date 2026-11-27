import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

/** Level 2 upgrades of the returning tools (the Great Fairy Workshop and the Great Fairy Upgrade Pedestal). */
export const LEVEL2: Record<string, string> = {
  fireRod: 'fireRodL2', fairyBow: 'bowL2', boomerang: 'boomerangL2', fairySlingshot: 'slingshotL2', magicHammer: 'hammerL2', bomb: 'bombL2',
  rocsFeather: 'rocsFeatherL2', pegasusBoots: 'pegasusBootsL2', magneticGloves: 'magneticGlovesL2',
};

// Section 6's weapons and tools (Mt and rarity from the doc; hit, crit, weight and range are my proposals). The Four
// Sword, the Fire Rod, the Fairy Bow, the Boomerang, the Fairy Slingshot, the Magic Hammer and Bombs reuse their entries.
export const WEAPONS: WeaponDef[] = [
  w('tridentOfPower', 'Trident of Power', 'lance', 'mythic', 32, 85, 10, 12, 1, 2, sig({ uses: 0, element: 'dark', fs: ['banish'],
    desc: 'Ganon\'s trident, stolen from the Pyramid: dark damage, and a hit can banish the target into the Dark World (25%: Banished, −4 STR, MAG, DEF and RES and rooted for 2 turns).' })),
  w('shadowSword', 'Shadow Sword', 'sword', 'legendary', 22, 90, 10, 6, 1, 1, sig({ uses: 0, element: 'dark', fs: ['darkness'],
    desc: 'A blade of the Dark Mirror\'s shadow: +25% damage in darkness (night, fog, the Dark World, or a Dark World Portal underfoot).' })),
  w('vaatisCycloneOrb', "Vaati's Cyclone Orb", 'magic', 'mythic', 30, 90, 5, 4, 1, 2, sig({ uses: 0, fs: ['wind'],
    desc: 'The Wind Mage\'s orb: 30 magical Might; wind attacks that push the target back a space.' })),
  // ── Level 2 tools ──
  w('fireRodL2', 'Fire Rod Lv. 2', 'magic', 'epic', 13, 85, 0, 2, 1, 3, { element: 'fire', fs: ['flames', 'l2'],
    desc: 'The upgraded Fire Rod: its fireballs leave persistent flames on the target\'s space (open ground burns for a few turns).' }),
  w('bowL2', 'Bow Lv. 2', 'bow', 'rare', 10, 90, 5, 4, 2, 4, { pierce: 0.2, splash: 'line', fs: ['l2'],
    desc: 'Piercing arrows: ignore 20% of DEF, and half damage carries on to the enemy behind the target.' }),
  w('boomerangL2', 'Boomerang Lv. 2', 'boomerang', 'rare', 8, 90, 0, 2, 1, 4, { splash: 'adjacent', inflict: { status: 'stun', chance: 30, turns: 1 }, fs: ['l2'],
    desc: 'More range (1–4) and several targets: half damage also hits the enemies next to the target. 30% chance to stun.' }),
  w('slingshotL2', 'Slingshot Lv. 2', 'sling', 'rare', 6, 90, 0, 1, 2, 4, { splash: 'adjacent', effective: ['flying'], fs: ['l2'],
    desc: 'Three projectiles at once: half damage also hits the enemies next to the target. Effective against fliers.' }),
  w('hammerL2', 'Hammer Lv. 2', 'hammer', 'epic', 16, 80, 0, 9, 1, 1, { armorBreaker: 1.5, splash: 'around', fs: ['l2', 'flip'],
    desc: 'A shockwave on every blow: half damage to every other enemy next to the wielder. Breaks armour and flips Terrorpins.' }),
  // ── The Shrine Maidens' light ──
  w('maidenLight', "Maiden's Light", 'magic', 'uncommon', 7, 90, 0, 1, 1, 2, { element: 'light', sacredMult: 1.2, desc: 'A Shrine Maiden\'s sacred light (+20% against demons and the undead).' }),
  // ── Monsters ──
  nat('trooperChain', 'Ball and Chain', 11, 75, 0, 1, 2, { fs: ['chainPull'] }),
  nat('bigBombBody', 'Fuse Slam', 8, 70, 0, 1, 1),
  nat('shellRam', 'Shell Ram', 9, 80, 0, 1, 1),
  nat('sandClaw', 'Sand Claw', 10, 85, 5, 1, 1),
  // ── Bosses ──
  nat('galeBolt', 'Gale Bolt', 14, 85, 0, 1, 3, { magicContact: true, fs: ['wind'] }),
  nat('gelSlam', 'Gel Slam', 13, 80, 0, 1, 1),
  nat('gelSpit', 'Gel Spit', 9, 80, 0, 2, 2, { magicContact: true, element: 'nature' }),
  nat('magmaFist', 'Magma Fist', 16, 80, 5, 1, 1, { element: 'fire' }),
  nat('gouenFlame', 'Flame Breath', 13, 85, 0, 1, 2, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('elementalSpit', 'Elemental Spit', 12, 85, 0, 1, 2, { magicContact: true }),
  nat('iceShard', 'Ice Shard', 13, 85, 0, 1, 3, { magicContact: true, element: 'ice', inflict: { status: 'freeze', chance: 15, turns: 1 } }),
  nat('frostTouch', 'Frost Touch', 12, 85, 0, 1, 1, { element: 'ice' }),
];
