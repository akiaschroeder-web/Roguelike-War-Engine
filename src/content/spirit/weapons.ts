import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

// Section 7's weapons (Mt and rarity from the doc; hit, crit, weight and range are my proposals), the
// cast's own weapons, the trains' guns, and natural attacks for the monsters, bosses and ChuChus.
// Returning equipment reuses the existing entries: the Whip (Skyward Sword), the Bow of Light (Era of
// the Wild), Boomerang, Bombs, Bow, shields and the Healing Staff.
export const WEAPONS: WeaponDef[] = [
  // ── Section 7 ──
  w('recruitsSword', "Recruit's Sword", 'sword', 'common', 6, 95, 0, 4, 1, 1, { uses: 50, desc: 'A light starter sword from the castle guard.' }),
  w('lokomoSword', 'Lokomo Sword', 'sword', 'mythic', 26, 95, 10, 5, 1, 1, { uses: 0, unique: true, element: 'light', sacredMult: 1.3, st: ['sacred', 'possession'],
    desc: 'The sacred blade of the Lokomo. Sacred damage: it cuts through Phantom armor from any side and leaves a struck Phantom exposed for Zelda to possess.' }),
  w('sandWand', 'Sand Wand', 'magic', 'epic', 9, 90, 0, 3, 1, 2, { uses: 40, unique: true, st: ['sandWand'],
    desc: 'Raises temporary Sand Pillars (obstacles) and Sand Bridges over water and pits (Sand Pillar, Sand Bridge). Its blast of sand is earth magic.' }),
  w('spiritFlute', 'Spirit Flute', 'instrument', 'legendary', 0, 100, 0, 1, 1, 1, { uses: 0, unique: true, anyClass: true, songDiscount: 2,
    desc: 'A Lokomo panpipe: Song of Awakening, Healing, Discovery, Birds and Light, the Lokomo Duets and the Song of Restoration.' }),
  // ── Character gear ──
  w('alfonzosSword', "Alfonzo's Sword", 'sword', 'epic', 19, 90, 5, 8, 1, 1, { uses: 55, unique: true, st: ['counterPower'], desc: 'A royal swordsman\'s blade: +4 damage when counterattacking.' }),
  w('byrnesClaw', "Byrne's Claw", 'gauntlet', 'legendary', 22, 90, 10, 6, 1, 1, { uses: 0, unique: true, pierce: 0.3, desc: 'Armor-piercing claws (ignore 30% of DEF).' }),
  w('colesDarkMagic', "Cole's Dark Magic", 'magic', 'legendary', 24, 85, 5, 3, 1, 3, { uses: 0, unique: true, element: 'dark', splash: 'adjacent', desc: 'Demonic projectiles (half damage to those next to the target).' }),
  w('anjeansSacredStaff', "Anjean's Sacred Staff", 'staff', 'legendary', 0, 100, 0, 3, 1, 2, { uses: 0, unique: true, healBonus: 1.5, st: ['strongBarrier'],
    desc: 'Heals 50% more; the wielder\'s barriers and seals last a turn longer.' }),
  w('torchPhantomSword', 'Torch Phantom Sword', 'sword', 'epic', 21, 80, 0, 12, 1, 1, { uses: 45, element: 'fire', inflict: { status: 'burn', chance: 35, turns: 2 }, desc: 'A burning greatsword: may inflict Burning.' }),
  w('geozardChiefsBlade', "Geozard Chief's Blade", 'sword', 'epic', 19, 85, 5, 8, 1, 1, { uses: 50, element: 'fire', st: ['extraFire'], desc: 'Fire-forged: +3 extra fire damage.' }),
  w('bigBlinClub', 'Big Blin Club', 'hammer', 'rare', 22, 70, 0, 16, 1, 1, { uses: 45, twoHanded: true, st: ['knockback'], desc: 'Two-handed and heavy: hits knock the target back 1 space.' }),
  // ── The cast ──
  w('zeldasLightST', "Zelda's Light", 'magic', 'rare', 9, 95, 5, 0, 1, 2, sig({ uses: 0, element: 'light', sacredMult: 1.2, desc: 'The princess\'s sacred light.' })),
  w('phantomZeldaBlade', "Phantom's Greatsword", 'sword', 'epic', 15, 80, 0, 10, 1, 1, sig({ uses: 0, desc: 'The great blade of the possessed armor.' })),
  w('storyBookST', 'Picture Show', 'magic', 'common', 5, 95, 0, 1, 1, 2, sig({ uses: 0, inflict: { status: 'confuse', chance: 15, turns: 1 }, desc: 'A paper-theatre tale told at the enemy: may Confuse.' })),
  w('merchantsCutlass', "Merchant's Cutlass", 'sword', 'uncommon', 8, 90, 5, 5, 1, 1, { uses: 45, desc: 'An heirloom of a treasure-hunting family.' }),
  w('pebbleSling', 'Pebble Sling', 'sling', 'common', 5, 90, 5, 1, 1, 3, { uses: 45, desc: 'A sling and a pocket of pebbles.' }),
  w('sanctuaryLight', 'Sanctuary Light', 'magic', 'rare', 8, 95, 0, 0, 1, 2, sig({ uses: 0, element: 'light', sacredMult: 1.2, desc: 'A Lokomo sage\'s sacred light.' })),
  w('lokomoCello', 'Lokomo Cello', 'instrument', 'epic', 0, 100, 0, 3, 1, 1, sig({ uses: 0, songDiscount: 2, desc: 'Gage\'s great green cello.' })),
  w('lokomoLute', 'Lokomo Lute', 'instrument', 'epic', 0, 100, 0, 2, 1, 1, sig({ uses: 0, songDiscount: 2, desc: 'Steem\'s stringed instrument.' })),
  w('lokomoFlute', 'Lokomo Flute', 'instrument', 'epic', 0, 100, 0, 1, 1, 1, sig({ uses: 0, songDiscount: 2, desc: 'Carben\'s flute.' })),
  w('lokomoDrums', 'Lokomo Drums', 'instrument', 'epic', 0, 100, 0, 3, 1, 1, sig({ uses: 0, songDiscount: 2, desc: 'Embrose\'s drums.' })),
  w('lokomoHorn', 'Lokomo Horn', 'instrument', 'epic', 0, 100, 0, 3, 1, 1, sig({ uses: 0, songDiscount: 2, desc: 'Rael\'s great horn.' })),
  // ── Trains ──
  w('trainCannon', 'Train Cannon', 'siege', 'uncommon', 13, 80, 0, 10, 2, 4, { uses: 0, unique: true, crewed: true, effective: ['vessel'], desc: 'A locomotive\'s mounted cannon (range 2–4): effective against trains and ships, 60% against anything else.' }),
  nat('trainCollision', 'Collision', 8, 85, 0, 1, 1, { momentum: 4, st: ['collision'], desc: '+1 Might per space travelled before ramming (max +4); double damage to anyone on a Railway Crossing.' }),
  w('darkTrainCannon', 'Dark Cannon', 'siege', 'rare', 14, 80, 0, 10, 2, 4, { uses: 0, unique: true, crewed: true, element: 'dark', effective: ['vessel'], desc: 'Demonic cannonballs (range 2–4): effective against trains and ships, 60% against anything else.' }),
  w('demonTrainCannon', 'Demon Train Cannons', 'siege', 'epic', 17, 80, 0, 12, 2, 5, { uses: 0, unique: true, crewed: true, element: 'dark', desc: 'The Demon Train\'s battery (range 2–5): 60% against anything but trains and ships.' }),
  nat('demonTrainRam', "Demon Train's Charge", 15, 80, 0, 1, 1, { momentum: 4, st: ['collision'] }),
  // ── Monsters ──
  nat('wreckerBall', 'Rolling Armor', 10, 80, 0, 1, 1, { armorBreaker: 1.3 }),
  nat('torchFlame', 'Torch Blade', 9, 80, 0, 1, 1, { element: 'fire', inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('geozardChiefFire', 'Fire Breath', 13, 85, 0, 1, 2, { element: 'fire', magicContact: true, inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('sandwormBite', 'Sandworm Bite', 11, 80, 5, 1, 1),
  nat('keyMasterClaw', 'Grasping Hand', 5, 95, 10, 1, 1),
  nat('keyMasterGaze', 'Eye of the Key Master', 8, 90, 0, 1, 2, { magicContact: true, element: 'dark' }),
  // ── Bosses ──
  nat('stagnoxMandibles', "Stagnox's Mandibles", 14, 80, 5, 1, 1),
  nat('stagnoxSpray', 'Poison Spray', 8, 85, 0, 1, 2, { magicContact: true, inflict: { status: 'poison', chance: 40, turns: 2 } }),
  nat('fraazFlame', "Fraaz's Fire", 10, 85, 0, 1, 3, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 20, turns: 2 } }),
  nat('fraazFrost', "Fraaz's Ice", 10, 85, 0, 1, 3, { magicContact: true, element: 'ice', inflict: { status: 'freeze', chance: 15, turns: 1 } }),
  nat('phytopsTentacle', 'Thorned Tentacle', 14, 80, 0, 1, 2, { inflict: { status: 'poison', chance: 30, turns: 2 } }),
  nat('cragmaFist', "Cragma's Fist", 18, 75, 0, 1, 1, { type: 'gauntlet', armorBreaker: 1.2 }),
  nat('cragmaMagma', 'Magma Spit', 11, 80, 0, 2, 3, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 25, turns: 2 } }),
  nat('skeldritchClaw', "Skeldritch's Claw", 16, 80, 5, 1, 1),
  // The bosses' own attacks (the doc's signature weapons are their drops).
  nat('colesDarkBolt', 'Dark Bolt', 7, 85, 0, 1, 3, { magicContact: true, element: 'dark' }),
  w('gauntletFist', 'Gauntlet Fist', 'gauntlet', 'rare', 12, 85, 5, 4, 1, 1, { uses: 0, unique: true, anyClass: true, desc: 'The great gauntlet\'s plain punch (Byrne\'s Claw itself is won from his boss form).' }),
  nat('malladusClaw', "Malladus's Claw", 14, 85, 5, 1, 1),
  nat('malladusDarkBeam', 'Demon Beam', 11, 85, 0, 1, 3, { magicContact: true, element: 'dark' }),
  w('stolenLight', 'Stolen Light', 'magic', 'mythic', 13, 90, 5, 0, 1, 3, { uses: 0, unique: true, anyClass: true, element: 'dark', desc: 'Zelda\'s power turned dark by the Demon King.' }),
  // ── The new ChuChus ──
  nat('chuchuSlam', 'Body Slam', 5, 85, 0, 1, 1),
  nat('flameJelly', 'Flaming Jelly', 6, 85, 0, 1, 1, { element: 'fire', magicContact: true, inflict: { status: 'burn', chance: 20, turns: 2 } }),
  nat('frostJelly', 'Freezing Jelly', 6, 85, 0, 1, 1, { element: 'ice', magicContact: true, inflict: { status: 'freeze', chance: 15, turns: 1 } }),
  nat('shockJelly', 'Charged Jelly', 6, 85, 0, 1, 1, { element: 'lightning', magicContact: true, inflict: { status: 'shock', chance: 20, turns: 1 } }),
  nat('metalJelly', 'Metallic Body', 9, 80, 0, 1, 1, { element: 'lightning' }),
  nat('helmetHorns', 'Helmet Horns', 7, 85, 5, 1, 1),
];
