import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

// Section 11's weapons and tools (Might and rarity from the doc; hit, crit, weight and range are my proposals).
// Bombs of Might and the Clockwork Key are pack items (items.ts). The `eo` tags are read by engine/echoes.ts.
export const WEAPONS: WeaponDef[] = [
  w('triRod', 'Tri Rod', 'magic', 'mythic', 12, 90, 0, 2, 1, 2, sig({ uses: 0, eo: ['triRod'], desc: 'Tri\'s rod: Echo creation, Bind and Reverse Bond for anyone who carries it (12 magical Might).' })),
  w('swordOfMight', 'Sword of Might', 'sword', 'legendary', 23, 90, 5, 4, 1, 1, sig({ uses: 0, eo: ['mighty'], desc: 'Link\'s power in a blade. Zelda can swing it only in Swordfighter Form (each attack costs 3 Energy); anyone else uses it normally.' })),
  w('bowOfMight', 'Bow of Might', 'bow', 'legendary', 20, 95, 5, 3, 2, 6, sig({ uses: 0, eo: ['mighty'], desc: 'A bow of Might crystal: range 2–6. In Swordfighter Form each shot costs 3 Energy.' })),
  w('wrightsSword', "Wright's Sword", 'sword', 'epic', 17, 85, 5, 6, 1, 1, sig({ eo: ['formation'], desc: 'Stronger formation attacks: +3 damage when another ally is next to the target.' })),
  w('dohnasSpear', "Dohna's Spear", 'lance', 'epic', 16, 85, 5, 5, 1, 2, sig({ eo: ['counter'], desc: '+2 SPD; counterattacks deal +4 damage.' })),
  w('draddsDrum', "Dradd's Drum", 'instrument', 'epic', 0, 0, 0, 3, 1, 1, sig({ songDiscount: 2, eo: ['riverDrum'], desc: 'River Zora within 3 of the drummer gain +2 STR and MAG; songs cost 2 less MP.' })),
  w('kusharasInstrument', "Kushara's Harp", 'instrument', 'epic', 0, 0, 0, 2, 1, 1, sig({ songDiscount: 3, eo: ['healMusic'], desc: 'Restorative music: allies within 2 recover 5% HP each turn; songs cost 3 less MP.' })),
  w('condesSnowShovel', "Condé's Snow Shovel", 'hammer', 'rare', 16, 80, 0, 10, 1, 1, sig({ eo: ['shovel'], effective: ['construct', 'stone'], desc: 'Clears snow and ice; double Might against constructs and stone obstacles.' })),
  w('falseTriRod', 'False Tri Rod', 'magic', 'legendary', 12, 90, 5, 2, 1, 2, sig({ uses: 0, element: 'dark', eo: ['triRod'], desc: 'Tekom\'s copy of the Tri Rod: dark Echoes, Bind (12 magical Might).' })),
  w('seerasTrident', "Seera's Trident", 'lance', 'epic', 15, 85, 5, 6, 1, 2, sig({ desc: 'The Gerudo chief\'s trident.' })),
  w('triLight', 'Light of Creation', 'magic', 'rare', 9, 95, 0, 0, 1, 2, { uses: 0, unique: true, element: 'light', desc: 'Tri\'s glow: a bolt of creation-light.' }),
  w('strategistsTome', "Strategist's Tome", 'magic', 'uncommon', 7, 90, 0, 2, 1, 2, { desc: 'Lefte\'s book of plans, thrown open with a flash.' }),
  w('researchersStaff', "Researcher's Staff", 'magic', 'uncommon', 9, 85, 0, 2, 1, 2, { desc: 'A crystal-tipped staff from Lueburry\'s house.' }),
  w('dampesWrench', "Dampé's Wrench", 'hammer', 'uncommon', 11, 80, 0, 5, 1, 1, sig({ eo: ['wrench'], desc: 'Mechanical repairs; double Might against constructs.' , effective: ['construct'] })),
  w('stampHammer', 'Stamp', 'hammer', 'common', 6, 90, 10, 2, 1, 1, sig({ desc: 'A heavy rubber stamp. Thwack.' })),
  w('zoraFireballEoW', 'Zora Fireball', 'magic', 'common', 9, 85, 0, 0, 2, 4, { uses: 0, unique: true, element: 'fire', desc: 'A River Zora\'s natural fireball (9 magical Might; range 2–4).' }),
  // ── Monsters ──
  nat('ignizolFlame', 'Living Flame', 7, 85, 0, 1, 1, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 50, turns: 2 } }),
  nat('hydrozolSplash', 'Water Splash', 7, 85, 0, 1, 2, { magicContact: true, element: 'water' }),
  nat('caromadilloRoll', 'Rolling Shell', 9, 80, 0, 1, 1, { momentum: 4 }),
  nat('tornandoGust', 'Cyclone', 7, 90, 0, 1, 2, { magicContact: true }),
  nat('ribbituneCroak', 'Croak', 6, 90, 0, 1, 2, { magicContact: true }),
  nat('drippituneSong', 'Rain Song', 9, 85, 0, 1, 3, { magicContact: true, element: 'water' }),
  nat('holmillClaws', 'Digging Claws', 8, 85, 0, 1, 1),
  nat('platboomSlam', 'Platform Slam', 13, 75, 0, 1, 1),
  nat('strandtulaFangs', 'Silk Bite', 6, 90, 0, 1, 1, { inflict: { status: 'root', chance: 25, turns: 1 } }),
  nat('crawltulaFangs', 'Crawler Bite', 8, 85, 5, 1, 1),
  nat('tweelusSlam', 'Stone Slam', 11, 75, 0, 1, 1),
  nat('chompfinJaws', 'Jaws', 13, 85, 5, 1, 1),
  // ── Automatons ──
  nat('techtiteLegs', 'Spring Legs', 10, 85, 0, 1, 1),
  nat('tocktorokCannon', 'Rapid Pellets', 6, 85, 0, 1, 3, { shots: 2 }),
  nat('gizmolBubbles', 'Musical Bubbles', 9, 90, 0, 1, 2, { magicContact: true }),
  nat('tekuMaw', 'Mechanical Maw', 13, 80, 5, 1, 1),
  w('roboblinKatana', 'Heirloom Katana', 'sword', 'epic', 16, 90, 10, 5, 1, 1, { uses: 0, unique: true, splash: 'around', desc: 'Sweeping sword attacks: half damage to every other enemy next to the wielder.' }),
  nat('goldfinchBeak', 'Golden Peck', 6, 95, 10, 1, 1, { eo: ['goldenPeck'] }),
  // ── Bosses ──
  nat('talusFist', 'Stone Fist', 15, 80, 0, 1, 1),
  nat('talusRockBarrage', 'Rock Barrage', 11, 75, 0, 2, 3),
  nat('volcanicTalusMagma', 'Magma Barrage', 12, 80, 0, 2, 3, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('mogryphClaws', 'Burrowing Claws', 14, 85, 5, 1, 1),
  nat('mogryphSandBlast', 'Sand Blast', 11, 80, 0, 2, 3, { magicContact: true, inflict: { status: 'blind', chance: 25, turns: 1 } }),
  nat('vocavorTail', 'Tail Fin', 13, 85, 0, 1, 1),
  nat('vocavorTorrent', 'Torrent', 13, 85, 0, 2, 3, { magicContact: true, element: 'water' }),
  nat('skorchillHorns', 'Horns', 15, 80, 5, 1, 1),
  nat('skorchillBreath', 'Fire-and-Ice Breath', 12, 85, 0, 1, 2, { magicContact: true, element: 'ice', inflict: { status: 'freeze', chance: 15, turns: 1 } }),
  nat('boriShock', 'Electric Tendrils', 10, 85, 0, 1, 2, { magicContact: true, element: 'lightning', inflict: { status: 'shock', chance: 25, turns: 1 } }),
  nat('boriBounce', 'Bubble Bounce', 10, 80, 0, 1, 1),
  nat('jabuMaw', 'Great Maw', 14, 85, 5, 1, 1),
  nat('jabuWaterSpout', 'Water Spout', 13, 85, 0, 1, 3, { magicContact: true, element: 'water' }),
  nat('voidGrasp', 'Void Grasp', 17, 85, 5, 1, 2),
  nat('nullDarkness', 'Nothingness', 17, 85, 0, 1, 3, { magicContact: true, element: 'dark' }),
];
