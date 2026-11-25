import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });

// Numbers from the Wind Waker design doc where it gave them; the rest are my
// proposals in line with similar weapons.
export const WEAPONS: WeaponDef[] = [
  // ── Link ──
  w('herosSword', "Hero's Sword", 'sword', 'uncommon', 7, 95, 0, 5, 1, 1, { uses: 45, parryCrit: 10, desc: '+10 Critical when performing a parry.' }),
  w('skullHammer', 'Skull Hammer', 'hammer', 'epic', 17, 75, 5, 16, 1, 1, { uses: 50, twoHanded: true, armorBreaker: 1.5, effective: [],
    desc: 'Two-handed. +50% damage against armored units and constructs, and smashes Darknut armor.' }),
  w('grapplingHook', 'Grappling Hook', 'hookshot', 'rare', 3, 90, 0, 2, 1, 3, { uses: 0, anyClass: true,
    desc: 'Swing across gaps (Grapple Swing), pull smaller enemies closer and snatch their weapons.' }),

  // ── Wind Waker characters ──
  w('tetrasCutlass', "Tetra's Cutlass", 'sword', 'epic', 10, 95, 15, 5, 1, 1, { uses: 50, unique: true, desc: 'After a successful parry the wielder may move 2 more spaces.' }),
  w('orcasTrainingSpear', "Orca's Training Spear", 'lance', 'rare', 6, 100, 0, 5, 1, 2, { uses: 60, doubleXp: true, desc: 'Doubles combat experience while equipped.' }),
  w('bokoStick', 'Boko Stick', 'axe', 'common', 5, 85, 0, 4, 1, 1, { uses: 15, ignitable: true, desc: 'Can be set alight (Ignite) for 3 fire attacks before it burns away.' }),
  w('bokoblinMachete', 'Bokoblin Machete', 'sword', 'uncommon', 7, 80, 5, 6, 1, 1, { uses: 35, desc: 'Can be thrown up to 3 spaces when disarmed (Throw Machete).' }),
  w('darknutGreatsword', 'Darknut Greatsword', 'sword', 'epic', 17, 80, 10, 14, 1, 2, { uses: 55, twoHanded: true, vsShield: 1.3, desc: 'Two-handed. +30% damage against shield-bearers.' }),
  w('mightyDarknutBlade', 'Mighty Darknut Blade', 'sword', 'legendary', 20, 85, 15, 15, 1, 2, { uses: 65, twoHanded: true, pierce: 0.25, desc: 'Two-handed. Ignores 25% of enemy DEF.' }),
  w('phantomGanonsSword', "Phantom Ganon's Sword", 'sword', 'legendary', 16, 90, 15, 10, 1, 2, { uses: 60, reflectMagic: true, unique: true,
    desc: 'Reflects magic: the wielder takes half damage from spells.' }),
  w('ganondorfsTwinSwords', "Ganondorf's Twin Swords", 'sword', 'mythic', 15, 95, 20, 10, 1, 1, { uses: 80, counterTwice: true, unique: true, desc: 'Counterattacks twice.' }),
  w('helmarocTalons', 'Helmaroc Talons', 'gauntlet', 'legendary', 16, 85, 10, 8, 1, 1, { uses: 55, unique: true, anyClass: true,
    desc: 'Flying wielders can grab smaller enemies and drop them elsewhere (Talon Grab).' }),
  w('molgeraFang', 'Molgera Fang', 'lance', 'epic', 13, 85, 10, 9, 1, 2, { uses: 45, sandBonus: 6, unique: true, desc: '+6 Might against enemies on sand or sinking terrain.' }),
  w('pirateCutlass', 'Pirate Cutlass', 'sword', 'common', 6, 90, 5, 5, 1, 1, { uses: 40 }),
  w('pirateDagger', 'Pirate Dagger', 'dagger', 'common', 4, 95, 10, 2, 1, 1, { uses: 40 }),
  w('ritoSpear', 'Rito Spear', 'lance', 'uncommon', 7, 85, 5, 6, 1, 1, { uses: 40 }),
  w('ritoBow', 'Rito Longbow', 'bow', 'uncommon', 7, 85, 5, 4, 2, 3, { uses: 40 }),
  w('ritoChieftainSpear', "Chieftain's Wing Spear", 'lance', 'epic', 11, 90, 10, 7, 1, 2, { uses: 50, unique: true, desc: 'A dive from above: reaches 1–2 spaces.' }),
  w('komaliTalonSpear', "Komali's Talon Spear", 'lance', 'rare', 9, 85, 10, 6, 1, 1, { uses: 45, unique: true }),
  w('miniblinFork', 'Miniblin Pitchfork', 'lance', 'common', 3, 85, 0, 2, 1, 1, { uses: 25 }),

  // ── Magic ──
  w('gustMagic', 'Gust', 'magic', 'common', 4, 90, 0, 2, 1, 2, { uses: 40, desc: 'Wind magic.' }),
  w('korokWind', 'Korok Breeze', 'magic', 'uncommon', 6, 90, 0, 2, 1, 2, { uses: 40, element: 'nature', desc: 'Nature and wind magic. May poison.' }),
  w('sacredLight', 'Sacred Light', 'magic', 'rare', 7, 90, 5, 3, 1, 2, { uses: 40, element: 'light', effective: ['undead', 'demon'], desc: 'Light magic, effective against undead and demons.' }),
  w('reflectedLight', 'Reflected Light', 'magic', 'rare', 8, 90, 0, 3, 1, 3, { uses: 40, element: 'light', effective: ['undead'], desc: 'Light bounced off a harp: effective against undead.' }),
  w('sturgeonTome', 'Encyclopedia', 'magic', 'uncommon', 5, 95, 0, 4, 1, 2, { uses: 45, desc: 'Sturgeon\'s heavy book of everything.' }),
  w('pictoFlash', 'Pictograph Flash', 'magic', 'uncommon', 4, 95, 0, 2, 1, 3, { uses: 40, element: 'light', inflict: { status: 'blind', chance: 30, turns: 1 }, desc: 'A blinding flash: may Blind.' }),
  w('zephosGust', "Zephos's Gale", 'magic', 'epic', 12, 90, 5, 3, 1, 3, { uses: 0, unique: true, desc: 'A howling gale.' }),
  w('valoosDragonfire', "Valoo's Dragonfire", 'magic', 'mythic', 22, 85, 5, 0, 1, 5, { uses: 0, element: 'fire', splash: 'line', unique: true, anyClass: true, races: ['dragonDeity'],
    desc: 'A cone of fire: also scorches enemies further along the line.' }),
  w('cyclosCycloneStaff', "Cyclos's Cyclone Staff", 'magic', 'legendary', 14, 85, 5, 5, 2, 5, { uses: 0, unique: true, anyClass: true,
    desc: 'A tornado that pulls the target and its neighbours inward.' }),
  w('gohdansDivineCannon', "Gohdan's Divine Cannon", 'magic', 'legendary', 18, 80, 5, 8, 2, 6, { uses: 50, splash: 'adjacent', unique: true, anyClass: true,
    desc: 'Explosive magical shells that burst onto neighbours.' }),
  w('jalhallasLantern', "Jalhalla's Lantern", 'magic', 'legendary', 13, 90, 5, 4, 1, 3, { uses: 50, element: 'dark', inflict: { status: 'curse', chance: 40, turns: 2 }, unique: true, anyClass: true,
    desc: 'May Curse. Can call a Poe spirit to your side (Summon Poe).' }),
  w('puppetGanonsStrings', "Puppet Ganon's Strings", 'magic', 'mythic', 12, 90, 5, 2, 1, 5, { uses: 0, element: 'dark', inflict: { status: 'root', chance: 50, turns: 1 }, unique: true, anyClass: true,
    desc: 'May Root smaller enemies in place.' }),

  // ── Instruments ──
  w('windWaker', 'Wind Waker', 'instrument', 'legendary', 0, 0, 0, 1, 0, 0, { uses: 0, songDiscount: 2, unique: true, anyClass: true,
    desc: 'The conductor\'s baton. Conducts the wind melodies (−2 MP on songs).' }),
  w('medlisHarp', "Medli's Harp", 'instrument', 'legendary', 0, 0, 0, 1, 0, 0, { uses: 0, songDiscount: 2, unique: true, desc: 'Light abilities reach further; Earth God\'s Lyric reflects light.' }),
  w('makarsViolin', "Makar's Violin", 'instrument', 'legendary', 0, 0, 0, 1, 0, 0, { uses: 0, songDiscount: 2, unique: true, desc: 'Wind and nature melodies grow healing vegetation.' }),
  w('fadosViolin', "Fado's Violin", 'instrument', 'epic', 0, 0, 0, 1, 0, 0, { uses: 0, songDiscount: 1, unique: true, desc: 'Song buffs last 2 turns longer.' }),
  w('larutosHarp', "Laruto's Harp", 'instrument', 'epic', 0, 0, 0, 1, 0, 0, { uses: 0, songDiscount: 1, unique: true, desc: 'Musical attacks deal +50% to undead and spectral units.' }),

  // ── Siege ──
  w('pirateCannon', 'Pirate Cannon', 'siege', 'rare', 20, 70, 0, 12, 3, 7, { uses: 30, crewed: true, splash: 'adjacent', effective: ['vessel'],
    desc: 'Bursts onto neighbours. Effective against vessels; half damage against anything else.' }),
  w('navalHarpoon', 'Naval Harpoon', 'siege', 'rare', 12, 80, 0, 8, 2, 6, { uses: 30, crewed: true, anchors: true, desc: 'Anchors the target (Root), stopping a ship in its tracks. Half damage against anything but vessels.' }),
  w('heavyCannon', 'Heavy Cannon', 'siege', 'epic', 28, 65, 0, 18, 3, 8, { uses: 25, crewed: true, effective: ['vessel'], desc: 'Effective against vessels; half damage against anything else.' }),
  w('shipCannon', 'Ship Cannon', 'siege', 'uncommon', 14, 75, 0, 10, 2, 5, { uses: 40, crewed: true, effective: ['vessel'], desc: 'Effective against vessels; half damage against anything else.' }),
  w('emplacedCannon', 'Emplaced Cannon', 'siege', 'common', 16, 75, 0, 0, 3, 7, { uses: 0, unique: true, anyClass: true, splash: 'adjacent', desc: 'The fortress cannon you\'re standing at.' }),
  w('torpedo', 'Barrel Torpedo', 'siege', 'rare', 18, 80, 0, 0, 1, 4, { uses: 0, unique: true, effective: ['vessel'], desc: 'Fired from beneath the waves. Effective against vessels.' }),
  w('ghostCannon', 'Spectral Cannon', 'magic', 'epic', 15, 80, 5, 0, 2, 5, { uses: 0, unique: true, element: 'dark', inflict: { status: 'fear', chance: 25, turns: 2 }, desc: 'Ghostly shells. May inflict Fear.' }),
  w('ramming', 'Ramming Prow', 'natural', 'common', 6, 80, 0, 0, 1, 1, { uses: 0, unique: true, momentum: 4, desc: '+1 Might per space sailed before ramming (max +4).' }),

  // ── Natural weapons ──
  nat('redLionCannon', 'Red Lion Cannon', 14, 85, 0, 2, 5, { type: 'siege', anyClass: true, effective: ['vessel'] }),
  nat('babaLash', 'Lashing Vine', 9, 80, 5, 1, 2),
  nat('kargarocTalons', 'Kargaroc Talons', 10, 85, 5, 1, 1),
  nat('mothulaStinger', 'Mothula Stinger', 11, 80, 0, 1, 1),
  nat('mothulaWings', 'Wing Rush', 10, 80, 0, 1, 1, { splash: 'line' }),
  nat('morthCling', 'Cling', 3, 90, 0, 1, 1, { inflict: { status: 'weaken', chance: 50, turns: 2 } }),
  nat('magtailBite', 'Magtail Bite', 10, 80, 0, 1, 1, { element: 'fire' }),
  nat('seahatRotor', 'Rotor Blades', 9, 85, 5, 1, 1),
  nat('sharkBite', 'Shark Bite', 12, 85, 10, 1, 1, { momentum: 5 }),
  nat('octoTentacles', 'Tentacles', 15, 80, 0, 1, 2, { splash: 'around' }),
  nat('octoInk', 'Ink Spray', 10, 80, 0, 1, 3, { type: 'magic', anyClass: true, inflict: { status: 'blind', chance: 40, turns: 2 } }),
  nat('armosSlam', 'Armos Slam', 14, 75, 0, 1, 1),
  nat('shadowGrasp', 'Shadow Grasp', 9, 85, 5, 1, 1),
  nat('bombchuBlast', 'Living Bomb', 14, 85, 0, 1, 1, { splash: 'adjacent' }),
  nat('chuBody', 'Jelly Slam', 5, 80, 0, 1, 1),
  nat('chuShock', 'Electric Jelly', 6, 80, 0, 1, 1, { element: 'lightning' }),
  nat('chuArrow', 'Jelly Arrow', 6, 80, 0, 2, 3, { type: 'bow', anyClass: true }),
  nat('dragonClaws', 'Dragon Claws', 14, 85, 5, 1, 1),
  nat('jabunBite', 'Jabun\'s Bite', 12, 80, 0, 1, 1),
  nat('fishmanBrush', 'Paintbrush Slap', 4, 90, 5, 1, 1),
  nat('gohmaMandibles', 'Molten Mandibles', 18, 80, 5, 1, 2, { element: 'fire' }),
  nat('kalleVines', 'Suspended Vines', 14, 85, 0, 1, 3, { inflict: { status: 'root', chance: 30, turns: 1 } }),
  nat('gohdanFists', 'Divine Fists', 12, 80, 0, 1, 1),
  nat('helmarocBeak', 'Armored Beak', 20, 80, 5, 1, 1),
  nat('poeSlam', 'Spirit Slam', 12, 80, 0, 1, 1, { element: 'dark' }),
  nat('sandBlast', 'Sand Spout', 14, 80, 0, 1, 3, { type: 'magic', anyClass: true }),
  nat('molgeraJaws', 'Molgera\'s Jaws', 20, 80, 10, 1, 1),
  nat('puppetClaws', 'Puppet Claws', 18, 80, 5, 1, 1),
  nat('spiderCrash', 'Falling Terror', 17, 75, 5, 1, 1, { splash: 'adjacent' }),
  nat('snakeCharge', 'Unrelenting Charge', 16, 80, 5, 1, 1, { momentum: 6, splash: 'line' }),
  nat('larvaBite', 'Burrowing Bite', 9, 85, 5, 1, 1),
  nat('divineGrasp', 'Divine Grasp', 13, 85, 0, 1, 1, { inflict: { status: 'root', chance: 40, turns: 1 } }),
];
