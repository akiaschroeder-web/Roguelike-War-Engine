import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

/** The three sacred metals Zauz forges into the Phantom Sword. */
export const PHANTOM_METALS = ['crimsonine', 'azurine', 'aquanine'];

// Section 6's weapons (Mt and rarity from the doc; hit, crit, weight and range are my proposals),
// the cast's own weapons, and natural attacks for the monsters and bosses. Returning equipment
// reuses the existing entries: Pirate Cutlass, Fairy Bow, Boomerang, Megaton/Skull Hammer, Dampé's
// Shovel, the Grappling Hook, Ship/Heavy Cannons, the Ramming Prow and the Healing Staff.
export const WEAPONS: WeaponDef[] = [
  // ── Section 6 ──
  w('phantomSword', 'Phantom Sword', 'sword', 'mythic', 26, 95, 10, 5, 1, 1, { uses: 0, unique: true, sacredMult: 1.3, element: 'light', ph: ['sacred', 'channel'],
    desc: 'Forged by Zauz from the three sacred metals with the Spirits\' blessing. Double damage against Phantoms (and it cuts through their armor from any side); Hourglass abilities cost the wielder 2 less time.' }),
  w('jolenesCutlass', "Jolene's Cutlass", 'sword', 'epic', 16, 90, 10, 5, 1, 1, { uses: 55, unique: true, ph: ['counterCrit'], desc: '+20 Critical when counterattacking.' }),
  w('zauzsForgingHammer', "Zauz's Forging Hammer", 'hammer', 'epic', 18, 80, 0, 12, 1, 1, { uses: 60, unique: true, armorBreaker: 1.5, ph: ['repair'],
    desc: 'Armor-breaking (×1.5 against armored units and constructs). After each battle the wielder repairs 5 uses on every worn weapon in the army.' }),
  w('phantomGreatsword', 'Phantom Greatsword', 'sword', 'legendary', 25, 75, 5, 16, 1, 1, { uses: 45, twoHanded: true, splash: 'adjacent', desc: 'Heavy and two-handed: a sweeping blow (half damage to enemies next to the target).' }),
  w('geozardBlade', 'Geozard Blade', 'sword', 'rare', 15, 85, 5, 7, 1, 1, { uses: 45, element: 'fire', inflict: { status: 'burn', chance: 25, turns: 2 }, desc: 'A fire-forged blade: fire damage that may Burn.' }),
  w('cobbleRoyalSword', 'Cobble Royal Sword', 'sword', 'epic', 17, 90, 5, 6, 1, 1, { uses: 55, ph: ['royalGuard'], desc: '+4 damage while within 2 of an allied commander.' }),
  w('anoukiHuntingSpear', 'Anouki Hunting Spear', 'lance', 'uncommon', 10, 95, 5, 6, 1, 2, { uses: 50, effective: ['beast'], desc: 'Thrown or thrust (range 1–2). Accurate and effective against beasts.' }),
  w('yookIceClub', 'Yook Ice Club', 'hammer', 'rare', 17, 75, 0, 12, 1, 1, { uses: 45, element: 'ice', inflict: { status: 'freeze', chance: 20, turns: 1 }, desc: 'Heavy blows that may Freeze.' }),
  w('blaazsFlame', "Blaaz's Flame", 'magic', 'legendary', 20, 85, 5, 4, 1, 3, { uses: 40, element: 'fire', splash: 'adjacent', desc: 'Spreading fireballs: half damage to enemies next to the target.' }),
  w('cyclokWindStaff', "Cyclok's Wind Staff", 'magic', 'legendary', 21, 85, 5, 5, 1, 3, { uses: 40, ph: ['whirlwind'], desc: 'Wind magic. A damaging hit raises a temporary Whirlwind next to the target.' }),
  w('cubusOrb', 'Cubus Orb', 'magic', 'epic', 16, 90, 5, 3, 1, 3, { uses: 50, element: 'dark', ph: ['reflect'], desc: 'Dead Man\'s Volley: the projectile rebounds off allies within 3 of the target, +2 damage for each.' }),
  w('bellumsTentacle', "Bellum's Tentacle", 'natural', 'mythic', 24, 85, 5, 0, 1, 2, { uses: 0, unique: true, anyClass: true, drainsMp: 5, mpToWielder: true, ph: ['drain'],
    desc: 'A grasping tentacle (range 1–2): drains 5 MP, and the wielder recovers a third of the damage dealt as HP.' }),
  // ── The cast ──
  w('anoukiRoyalStaff', 'Anouki Royal Staff', 'magic', 'epic', 16, 90, 5, 4, 1, 3, { uses: 50, element: 'ice', inflict: { status: 'freeze', chance: 15, turns: 1 }, ph: ['supportRange'],
    desc: 'Ice magic (range 1–3). The Chief\'s support abilities reach 1 space further.' }),
  w('cielasLight', "Ciela's Light", 'magic', 'rare', 9, 95, 5, 0, 1, 2, sig({ uses: 0, element: 'light', sacredMult: 1.2, desc: 'The Spirit of Courage\'s light.' })),
  w('leafsFlame', "Leaf's Flame", 'magic', 'rare', 10, 90, 5, 0, 1, 2, sig({ uses: 0, element: 'fire', inflict: { status: 'burn', chance: 20, turns: 2 }, desc: 'The Spirit of Power\'s fire.' })),
  w('nerisWave', "Neri's Wave", 'magic', 'rare', 8, 95, 0, 0, 1, 2, sig({ uses: 0, element: 'water', desc: 'The Spirit of Wisdom\'s calm water.' })),
  w('oshusTrident', "Oshus's Trident", 'lance', 'epic', 12, 90, 5, 6, 1, 2, sig({ uses: 0, element: 'water', desc: 'The old man\'s walking stick — or the Ocean King\'s trident.' })),
  w('tidalWave', 'Tidal Wave', 'magic', 'legendary', 18, 85, 0, 0, 1, 3, sig({ uses: 0, element: 'water', splash: 'adjacent', desc: 'The sea itself rises (half damage to those next to the target).' })),
  nat('oceanKingsTail', "Ocean King's Tail", 16, 85, 0, 1, 1, { desc: 'A great sweep of the whale\'s tail.', splash: 'around' }),
  w('seaFoamOrb', 'Sea-Foam Orb', 'magic', 'uncommon', 7, 90, 0, 2, 1, 2, sig({ uses: 0, element: 'water', inflict: { status: 'confuse', chance: 20, turns: 1 }, desc: 'Bubbles and song: may Confuse.' })),
  w('crystalBall', 'Crystal Ball', 'magic', 'rare', 10, 95, 0, 3, 1, 3, sig({ uses: 0, desc: 'Visions turned into force.' })),
  w('eddosHandCannon', "Eddo's Hand Cannon", 'siege', 'rare', 14, 75, 0, 8, 2, 4, sig({ uses: 40, splash: 'adjacent', desc: 'A cannon small enough to carry — barely. Half damage to those next to the target.' })),
  w('goronFists', 'Goron Fists', 'gauntlet', 'uncommon', 9, 85, 0, 0, 1, 1, sig({ uses: 0, desc: 'Rock-hard knuckles.' })),
  w('mutohsSceptre', "Mutoh's Sceptre", 'magic', 'epic', 14, 90, 5, 3, 1, 3, sig({ uses: 0, element: 'light', desc: 'The ancient king\'s light.' })),
  w('cobbleLance', 'Cobble Lance', 'lance', 'rare', 13, 85, 5, 8, 1, 1, { uses: 50, desc: 'An ancient knight\'s lance.' }),
  // ── Anouki, Yook and Phantoms ──
  w('frostSpell', 'Frost', 'magic', 'uncommon', 8, 90, 0, 2, 1, 2, { uses: 45, element: 'ice', inflict: { status: 'freeze', chance: 15, turns: 1 }, desc: 'Freezing magic.' }),
  nat('yookClaws', 'Yook Claws', 10, 80, 5, 1, 1),
  nat('frozenBreathWeapon', 'Frozen Breath', 11, 85, 0, 1, 2, { element: 'ice', magicContact: true, inflict: { status: 'freeze', chance: 20, turns: 1 } }),
  w('phantomBlade', "Phantom's Blade", 'sword', 'epic', 9, 80, 0, 10, 1, 1, { uses: 0, unique: true, desc: 'The great sword of a Temple Phantom.' }),
  nat('warpFlame', 'Warp Flame', 10, 85, 0, 1, 2, { magicContact: true, element: 'dark' }),
  nat('phantomEyeGaze', "Phantom Eye's Gaze", 4, 90, 0, 1, 2, { magicContact: true }),
  nat('geozardSpear', 'Geozard Spear', 7, 80, 0, 1, 1, { type: 'sword' }),
  nat('geozardFire', 'Fire Breath', 10, 85, 0, 1, 2, { element: 'fire', magicContact: true, inflict: { status: 'burn', chance: 25, turns: 2 } }),
  // ── Bosses ──
  nat('demonClaw', 'Demon Claw', 12, 85, 5, 1, 1),
  nat('cyclokTentacle', "Cyclok's Tentacle", 11, 85, 0, 1, 1),
  nat('craykPincers', "Crayk's Pincers", 20, 80, 10, 1, 1),
  nat('dongorongoBite', "Dongorongo's Bite", 22, 80, 5, 1, 1),
  nat('dongorongoFlame', 'Flame Breath', 15, 85, 0, 1, 3, { element: 'fire', magicContact: true, inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('eoxFist', 'Stone Fist', 28, 75, 0, 1, 1, { type: 'gauntlet', armorBreaker: 1.3 }),
  nat('bellumEyeBeam', "Bellum's Eye", 16, 85, 5, 1, 3, { magicContact: true, element: 'dark' }),
  w('bellumbecksBlade', "Bellumbeck's Blade", 'sword', 'mythic', 22, 85, 10, 8, 1, 1, { uses: 0, unique: true, desc: 'A blade of phantom steel in a possessed hand.' }),
  // ── The Potion Shop Lady and the Subrosians ──
  w('potionFlask', 'Thrown Flask', 'sling', 'uncommon', 6, 85, 0, 1, 1, 2, { uses: 40, inflict: { status: 'poison', chance: 30, turns: 2 }, desc: 'A flask of something bitter, thrown (range 1–2): may Poison.' }),
  w('subrosianDagger', 'Subrosian Dagger', 'dagger', 'common', 5, 95, 10, 2, 1, 1, { uses: 45, desc: 'A small blade from the lava world.' }),
  w('subrosianSpear', 'Subrosian Spear', 'lance', 'common', 8, 85, 0, 6, 1, 1, { uses: 45, element: 'fire', desc: 'Its tip glows like a coal.' }),
  w('subrosianHammer', 'Subrosian Smithing Hammer', 'hammer', 'rare', 12, 80, 0, 10, 1, 1, { uses: 50, armorBreaker: 1.25, desc: 'The hammer that forges Hard Ore.' }),
  w('subrosianPick', 'Ore Pick', 'axe', 'common', 9, 80, 5, 7, 1, 1, { uses: 45, desc: 'Digs ore — and works on monsters too.' }),
  w('lavaSpell', 'Lava Burst', 'magic', 'uncommon', 9, 85, 0, 3, 1, 2, { uses: 45, element: 'fire', inflict: { status: 'burn', chance: 20, turns: 2 }, desc: 'Molten rock flung by magic.' }),
  w('subrosianSling', 'Subrosian Sling', 'sling', 'common', 5, 90, 5, 1, 1, 3, { uses: 45, desc: 'Ore pellets.' }),
];
