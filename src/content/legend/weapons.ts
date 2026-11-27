import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

/** Swords that fire a beam (range 2–3) at full HP (the Golden Sword's beams are very strong). */
export const LEGEND_BEAM_SWORDS = ['temperedSword', 'goldenSword', 'koholintSword', 'nobleSword'];
/** The eight Instruments of the Sirens (all eight unlock the Wind Fish's Egg). */
export const SIREN_INSTRUMENTS = ['fullMoonCello', 'conchHorn', 'seaLilysBell', 'surfHarp', 'windMarimba', 'coralTriangle', 'eveningCalmOrgan', 'thunderDrum'];

// Mt and rarity from the design doc where it gives them; hit, crit, weight and range are my proposals.
// Returning equipment reuses the existing entries: Master Sword, Biggoron's Sword, Hookshot, Fairy Bow,
// Boomerang, Magical Boomerang, Fairy Slingshot, Fire Rod, Ice Rod and the Ocarinas.
export const WEAPONS: WeaponDef[] = [
  // ── A Link to the Past ──
  w('fightersSword', "Fighter's Sword", 'sword', 'common', 6, 90, 0, 4, 1, 1, { uses: 50, desc: 'The basic sword of the Hylian royal guard.' }),
  w('temperedSword', 'Tempered Sword', 'sword', 'epic', 18, 90, 5, 6, 1, 1, { uses: 60, sacredMult: 1.2, lg: ['beam'], desc: 'Tempered by the Smithies of Kakariko: better sacred damage (+20% vs demons and the undead). Sword beams at full HP.' }),
  w('goldenSword', 'Golden Sword', 'sword', 'legendary', 25, 95, 10, 6, 1, 1, { uses: 0, unique: true, sacredMult: 1.3, element: 'light', lg: ['beam', 'strongBeam'],
    desc: 'Thrown into the Pyramid\'s fairy fountain, the Master Sword came back gold: very strong beams (range 2–4) at full HP.' }),
  w('magicHammer', 'Magic Hammer', 'hammer', 'rare', 13, 80, 0, 9, 1, 1, { uses: 50, armorBreaker: 1.5, lg: ['heavy', 'breaksStakes'], desc: 'Breaks armor, Wooden Stakes and structures; heavy enough to crack Helmasaur King\'s mask.' }),
  w('caneOfSomaria', 'Cane of Somaria', 'staff', 'epic', 0, 100, 0, 3, 1, 1, { uses: 0, unique: true, lg: ['somaria'], desc: 'Conjures a movable Somaria Block (Somaria Block ability) that can burst into four projectiles.' }),
  w('caneOfByrna', 'Cane of Byrna', 'staff', 'legendary', 0, 100, 0, 3, 1, 1, { uses: 0, unique: true, lg: ['byrna'], desc: 'Spins a damaging protective barrier around the holder (Byrna Barrier), draining MP every turn it lasts.' }),
  // ── Link's Awakening ──
  w('koholintSword', 'Koholint Sword', 'sword', 'legendary', 18, 90, 10, 5, 1, 1, { uses: 0, unique: true, lg: ['beam'], desc: 'The sword washed ashore on Toronbo Shores and reforged: beams at full HP.' }),
  // ── The Oracles ──
  w('nobleSword', 'Noble Sword', 'sword', 'epic', 15, 90, 5, 5, 1, 1, { uses: 60, lg: ['beam'], desc: 'The sword of the Hero of Labrynna and Holodrum: beams at full HP.' }),
  w('rodOfSeasons', 'Rod of Seasons', 'magic', 'mythic', 12, 90, 5, 3, 1, 2, { uses: 0, unique: true, lg: ['seasons'], desc: 'Changes the active season from a Tree Stump (Change Season). Its strikes carry the current season (winter freezes, summer burns, autumn and spring buffet).' }),
  w('harpOfAges', 'Harp of Ages', 'instrument', 'mythic', 0, 100, 0, 2, 1, 1, { uses: 0, unique: true, songDiscount: 2, lg: ['ages'],
    desc: 'Teaches the Tune of Echoes, the Tune of Currents and the Tune of Ages: activate Time Portals, return to the present, change eras anywhere.' }),
  w('seedShooter', 'Seed Shooter', 'sling', 'rare', 6, 90, 5, 2, 2, 4, { uses: 0, unique: true, lg: ['seedAmmo', 'ricochet'], desc: 'Fires any of the five mystical seeds (chosen when attacking); shots ricochet onto a second enemy nearby (half damage).' }),
  w('hyperSlingshot', 'Hyper Slingshot', 'sling', 'epic', 7, 85, 0, 2, 2, 4, { uses: 0, unique: true, lg: ['seedAmmo', 'triple'], splash: 'adjacent', desc: 'Three seeds at once in different directions: half damage also hits the target\'s neighbours.' }),
  w('switchHook', 'Switch Hook', 'hookshot', 'epic', 5, 90, 0, 3, 1, 4, { uses: 0, unique: true, lg: ['switchHook'], desc: 'Swap places with a unit, Switch Hook Target or object within 4 (Switch Places).' }),
  w('longHook', 'Long Hook', 'hookshot', 'legendary', 7, 90, 0, 3, 1, 7, { uses: 0, unique: true, lg: ['switchHook', 'longHook'], desc: 'The upgraded Switch Hook: swap places within 7.' }),
  // ── Instruments of the Sirens (magical weapons) ──
  w('fullMoonCello', 'Full Moon Cello', 'magic', 'legendary', 10, 90, 0, 3, 1, 2, sig({ uses: 0, lg: ['siren', 'sirenRegen'], desc: 'Siren Instrument: allies within 2 regenerate 5% HP each turn.' })),
  w('conchHorn', 'Conch Horn', 'magic', 'legendary', 12, 85, 0, 3, 1, 2, sig({ uses: 0, lg: ['siren', 'knockback'], desc: 'Siren Instrument: its blast of sound knocks the target back a space.' })),
  w('seaLilysBell', "Sea Lily's Bell", 'magic', 'legendary', 10, 95, 0, 2, 1, 2, sig({ uses: 0, lg: ['siren', 'sirenCleanse'], desc: 'Siren Instrument: at the start of each turn, the holder is cleansed of one harmful status.' })),
  w('surfHarp', 'Surf Harp', 'magic', 'legendary', 11, 90, 0, 3, 1, 2, sig({ uses: 0, element: 'water', lg: ['siren', 'sirenAquatic'], desc: 'Siren Instrument: water magic; allies within 2 swim.' })),
  w('windMarimba', 'Wind Marimba', 'magic', 'legendary', 11, 90, 0, 3, 1, 3, sig({ uses: 0, lg: ['siren', 'sirenWind'], displacesFlyers: true, desc: 'Siren Instrument: wind attacks that blow fliers away; +1 MOV.' })),
  w('coralTriangle', 'Coral Triangle', 'magic', 'legendary', 9, 95, 0, 2, 1, 2, sig({ uses: 0, lg: ['siren', 'sirenBarrier'], desc: 'Siren Instrument: once per battle, a barrier on the holder the first time it would be hit hard (25% max HP or more).' })),
  w('eveningCalmOrgan', 'Evening Calm Organ', 'magic', 'legendary', 10, 85, 0, 4, 1, 2, sig({ uses: 0, inflict: { status: 'sleep', chance: 30, turns: 1 }, lg: ['siren'], desc: 'Siren Instrument: may put the target to sleep; weakens nightmares.' })),
  w('thunderDrum', 'Thunder Drum', 'magic', 'legendary', 15, 85, 5, 4, 1, 2, sig({ uses: 0, element: 'lightning', lg: ['siren'], desc: 'Siren Instrument: lightning; the most offensive of the eight.' })),
  // ── Character equipment (section 9) ──
  w('unclesSword', "Uncle's Sword", 'sword', 'rare', 9, 90, 5, 5, 1, 1, sig({ uses: 0, lg: ['guardian'], desc: '+3 damage while an ally stands next to the wielder.' })),
  w('sahasrahlasStaff', "Sahasrahla's Staff", 'magic', 'legendary', 12, 90, 0, 3, 1, 3, sig({ uses: 0, lg: ['spellThrift', 'spellRange'], desc: 'Spells cost 20% less MP; magic reaches 1 space further.' })),
  w('syrupsBrewingStaff', "Syrup's Brewing Staff", 'staff', 'epic', 0, 100, 0, 3, 1, 2, sig({ uses: 0, healBonus: 1.3, lg: ['potionBoost'], desc: 'Potions brewed or used by the holder are 30% stronger.' })),
  w('agahnimsScepter', "Agahnim's Scepter", 'magic', 'legendary', 15, 90, 5, 3, 1, 3, sig({ uses: 0, element: 'lightning', lg: ['copyShot'], desc: 'Its bolts can split: 30% chance a secondary copy strikes another enemy near the target for half damage.' })),
  w('marinsHarp', "Marin's Harp", 'instrument', 'epic', 0, 100, 0, 2, 1, 1, sig({ uses: 0, songDiscount: 2, lg: ['musicHeal'], desc: 'Musical healing +50%.' })),
  w('ralphsSword', "Ralph's Sword", 'sword', 'epic', 13, 90, 10, 5, 1, 1, sig({ uses: 0, lg: ['giantKiller'], desc: '+25% damage against higher-level enemies.' })),
  w('onoxsFlail', "Onox's Flail", 'hammer', 'mythic', 28, 80, 5, 12, 1, 2, sig({ uses: 0, splash: 'adjacent', armorBreaker: 1.5, lg: ['heavy'], pierce: 0.3, desc: 'A wide, armor-breaking swing (half damage to the target\'s neighbours); ignores 30% DEF.' })),
  w('ganonsTridentLegend', "Ganon's Trident (King of Darkness)", 'lance', 'mythic', 30, 85, 10, 10, 1, 3, sig({ uses: 0, element: 'dark', lg: ['tridentMagic'], desc: 'Melee and thrown (range 1–3): the King of Darkness\'s trident, wreathed in dark magic.' })),
  // ── Signature and natural weapons ──
  w('sageSceptre', 'Sage Sceptre', 'magic', 'epic', 12, 95, 0, 2, 1, 2, sig({ uses: 0, element: 'light', desc: 'Light magic of the Sages\' bloodline.' })),
  w('blazingBats', 'Blazing Bats', 'magic', 'epic', 14, 85, 5, 0, 2, 4, sig({ uses: 0, element: 'fire', desc: 'A flock of burning bats.' })),
  w('fluteBoysOcarina', "Flute Boy's Flute", 'instrument', 'rare', 0, 100, 0, 1, 1, 1, sig({ uses: 0, songDiscount: 1, lg: ['musicHeal'], desc: 'The flute of the Haunted Grove. Musical healing +50%.' })),
  w('energyBall', 'Energy Ball', 'magic', 'epic', 13, 85, 0, 0, 2, 4, sig({ uses: 0, reflectable: true, desc: 'Agahnim\'s energy balls. A sword can bat them back.' })),
  w('tarinsStick', "Tarin's Stick", 'hammer', 'common', 6, 85, 0, 3, 1, 1, sig({ uses: 0, desc: 'Good for poking beehives. Not a good idea.' })),
  w('dinsDanceFire', "Din's Dance", 'magic', 'legendary', 13, 90, 5, 0, 1, 2, sig({ uses: 0, element: 'fire', desc: 'The Oracle of Seasons\' fiery dance.' })),
  w('nayrusHarp', "Nayru's Song", 'instrument', 'legendary', 0, 100, 0, 1, 1, 1, sig({ uses: 0, songDiscount: 2, lg: ['musicHeal'], desc: 'The Oracle of Ages\' song. Musical healing +50%.' })),
  w('faroresBook', "Farore's Secrets", 'magic', 'legendary', 11, 95, 5, 1, 1, 3, sig({ uses: 0, hitsConcealed: true, desc: 'Secret words: strikes hidden and concealed foes without revealing them.' })),
  w('impasKnife', "Impa's Knife", 'dagger', 'uncommon', 6, 90, 5, 2, 1, 2, sig({ uses: 0 })),
  w('ambisSpear', "Ambi's Spear", 'lance', 'rare', 9, 85, 0, 6, 1, 1, sig({ uses: 0 })),
  w('veransShadowBolt', 'Shadow Bolt', 'magic', 'legendary', 15, 90, 5, 0, 1, 3, sig({ uses: 0, element: 'dark', desc: 'Veran\'s shadow magic.' })),
  nat('chompBite', 'Chomp', 12, 85, 10, 1, 2, { lg: ['eatsPlants'] }),
  nat('roosterPeck', 'Rooster Peck', 5, 90, 5, 1, 1),
  nat('windFishsSong', "Wind Fish's Song", 16, 90, 0, 1, 4, { magicContact: true, element: 'light' }),
  nat('windFishsBody', "Wind Fish's Bulk", 14, 80, 0, 1, 1),
  nat('makuRoots', 'Maku Roots', 10, 80, 0, 1, 2, { magicContact: true, element: 'nature', restrains: true }),
  w('rickysPunches', "Ricky's Punches", 'gauntlet', 'rare', 10, 90, 10, 0, 1, 1, sig({ uses: 0, brave: true, desc: 'A one-two combination.' })),
  nat('dimitriBite', 'Dimitri Bite', 13, 85, 5, 1, 1),
  nat('mooshPound', 'Ground Pound', 15, 80, 5, 1, 1, { splash: 'around' }),
  nat('dragonClaws', 'Dragon Claws', 18, 85, 10, 1, 1, { pierce: 0.3 }),
  nat('darkFireBreath', 'Dark Fire Breath', 16, 85, 0, 2, 4, { magicContact: true, element: 'fire', splash: 'adjacent' }),
  nat('shellSlam', 'Shell Slam', 15, 80, 0, 1, 1),
  nat('venomFangs', 'Venom Fangs', 13, 85, 5, 1, 1, { inflict: { status: 'poison', chance: 40, turns: 2 } }),
  nat('stinger', 'Stinger', 12, 90, 10, 1, 2, { inflict: { status: 'poison', chance: 25, turns: 2 } }),
  // ── New monsters ──
  nat('antiFairyTouch', 'Cursed Contact', 5, 90, 0, 1, 1, { magicContact: true, drainsMp: 4 }),
  nat('buzzShock', 'Electric Body', 7, 85, 0, 1, 1, { magicContact: true, element: 'lightning' }),
  nat('cukemanSlap', 'Cukeman Slap', 6, 85, 5, 1, 1, { inflict: { status: 'confuse', chance: 20, turns: 1 } }),
  nat('subterrorClaws', 'Burrowing Claws', 12, 85, 10, 1, 1),
  w('ironBall', 'Iron Ball', 'hammer', 'rare', 14, 75, 0, 10, 1, 3, sig({ uses: 0, lg: ['heavy', 'ironBall'], desc: 'A huge iron ball, thrown up to 3 spaces. Whoever holds it can throw it back.' })),
  nat('wizzrobeBolt', 'Wizzrobe Bolt', 8, 85, 0, 1, 3, { magicContact: true }),
  nat('meteoFlame', 'Meteo Flame', 10, 85, 0, 1, 3, { magicContact: true, element: 'fire' }),
  nat('thunderBolt', 'Thunder Bolt', 10, 85, 0, 1, 3, { magicContact: true, element: 'lightning' }),
  nat('blizzardBolt', 'Blizzard Bolt', 10, 85, 0, 1, 3, { magicContact: true, element: 'ice' }),
  nat('masterWizzrobeBolt', 'Grand Wizzrobe Bolt', 13, 85, 5, 1, 4, { magicContact: true, element: 'dark' }),
  // ── Bosses ──
  nat('maskRam', 'Mask Ram', 16, 80, 0, 1, 1),
  nat('helmasaurFireball', 'Tail Fireball', 11, 80, 0, 2, 3, { magicContact: true, element: 'fire' }),
  nat('arrghusPuff', 'Puff Bomb', 11, 85, 0, 1, 2, { magicContact: true, element: 'water' }),
  nat('blindLaser', 'Eye Laser', 14, 85, 5, 1, 3, { magicContact: true, element: 'fire' }),
  nat('kholdstareIce', 'Icy Shard', 14, 85, 0, 1, 3, { magicContact: true, element: 'ice' }),
  nat('vitreousLightning', 'Lightning Spit', 15, 85, 0, 1, 4, { magicContact: true, element: 'lightning' }),
  nat('trinexxFire', 'Fire Head', 15, 85, 5, 1, 3, { magicContact: true, element: 'fire' }),
  nat('trinexxIce', 'Ice Head', 15, 85, 5, 1, 3, { magicContact: true, element: 'ice' }),
  nat('trinexxShell', 'Rock Head', 16, 80, 0, 1, 1),
  nat('genieFireball', 'Genie Fireball', 13, 85, 0, 1, 3, { magicContact: true, element: 'fire' }),
  nat('slimeEyeSlam', 'Gooey Slam', 13, 80, 0, 1, 1, { inflict: { status: 'root', chance: 20, turns: 1 } }),
  nat('anglerBite', 'Angler Bite', 15, 85, 10, 1, 1),
  nat('slimeEelBite', 'Eel Bite', 14, 85, 5, 1, 2),
  nat('facadeHex', 'Floor Hex', 14, 85, 0, 1, 4, { magicContact: true, element: 'dark' }),
  nat('eagleTalons', 'Talons', 15, 85, 10, 1, 1),
  nat('eagleFeathers', 'Feather Volley', 11, 85, 0, 2, 3),
  nat('hotHeadFire', 'Fireball', 16, 85, 0, 1, 3, { magicContact: true, element: 'fire', inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('nightmareTendrils', 'Nightmare Tendrils', 16, 85, 5, 1, 2, { magicContact: true, element: 'dark' }),
  nat('medusaBeam', 'Eye Beam', 15, 85, 0, 1, 4, { magicContact: true }),
  nat('pumpkinFire', 'Pumpkin Fire', 13, 85, 0, 1, 3, { magicContact: true, element: 'fire' }),
  nat('thwompSlam', 'Thwomp Slam', 20, 75, 0, 1, 1),
  nat('hagCurse', 'Hag Curse', 14, 85, 0, 1, 3, { magicContact: true, element: 'dark' }),
  nat('eyesoarBeam', 'Eye Beam', 14, 85, 5, 1, 3, { magicContact: true }),
  nat('smogLightning', 'Smog Lightning', 14, 85, 0, 1, 3, { magicContact: true, element: 'lightning' }),
  nat('octogonInk', 'Ink Shot', 13, 85, 0, 1, 3, { inflict: { status: 'blind', chance: 30, turns: 1 } }),
  nat('octogonTentacles', 'Tentacles', 15, 85, 5, 1, 1),
  nat('ramrockFists', 'Rocket Fists', 18, 80, 0, 1, 2),
];
