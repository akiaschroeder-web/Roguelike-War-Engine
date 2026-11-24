import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });

// Might/Hit/Crit/Range come from the design doc. Where it gave no weight or
// crit, I picked values that fit the weapon's role. Durability is not
// implemented yet, so the Giant's Knife doesn't break.
export const WEAPONS: WeaponDef[] = [
  // ── Link's swords and hammers ──
  w('kokiriSword', 'Kokiri Sword', 'sword', 'common', 4, 95, 5, 2, 1, 1, { uses: 45, desc: 'Lightweight; no weight penalty.' }),
  w('masterSword', 'Master Sword', 'sword', 'mythic', 12, 95, 15, 5, 1, 1, { effective: ['demon'], unique: true, uses: 0, desc: 'Double damage against demonic enemies. Never breaks.' }),
  w('giantsKnife', "Giant's Knife", 'sword', 'rare', 15, 75, 5, 13, 1, 1, { twoHanded: true, uses: 8, brokenInto: 'brokenGiantsKnife', desc: 'Extremely powerful two-handed sword. Very limited durability.' }),
  w('brokenGiantsKnife', "Broken Giant's Knife", 'sword', 'common', 3, 65, 0, 6, 1, 1, { uses: 0, unique: true, desc: 'What is left of a Giant\'s Knife. Never breaks further.' }),
  w('biggoronSword', "Biggoron's Sword", 'sword', 'legendary', 17, 85, 10, 12, 1, 1, { twoHanded: true, pierce: 0.25, unique: true, uses: 70, desc: 'Durable two-handed blade; armor-breaking (ignores 25% DEF).' }),
  w('megatonHammer', 'Megaton Hammer', 'hammer', 'legendary', 14, 70, 0, 14, 1, 1, { effective: ['armor', 'stone'], unique: true, uses: 40, desc: 'Effective against armored and rock enemies.' }),
  w('dekuStick', 'Deku Stick', 'sword', 'common', 5, 80, 0, 2, 1, 1, { uses: 3, desc: 'Fragile: breaks after 3 uses.' }),
  // ── Link's ranged weapons ──
  w('fairySlingshot', 'Fairy Slingshot', 'sling', 'common', 3, 90, 0, 1, 2, 3, { effective: ['flying'], desc: 'Effective against flying enemies.' }),
  w('fairyBow', 'Fairy Bow', 'bow', 'rare', 7, 85, 0, 4, 2, 4, { effective: ['flying'] }),
  w('boomerang', 'Boomerang', 'boomerang', 'uncommon', 4, 85, 0, 2, 1, 3, { desc: '30% chance to stun.' }),
  w('hookshot', 'Hookshot', 'hookshot', 'rare', 5, 80, 0, 4, 1, 3, { desc: 'Also a tool: pull yourself up to 3 spaces in a straight line to a tree, wall, fort or unit (crosses water and gaps).' }),
  w('longshot', 'Longshot', 'hookshot', 'epic', 7, 85, 0, 5, 1, 5, { desc: 'Also a tool: pull yourself up to 5 spaces in a straight line to a tree, wall, fort or unit.' }),
  // ── Conventional weapons ──
  w('soldierSword', "Hyrule Soldier's Sword", 'sword', 'common', 5, 85, 0, 5, 1, 1),
  w('royalGuardBlade', "Royal Guard's Blade", 'sword', 'rare', 9, 90, 5, 7, 1, 1),
  w('gerudoScimitar', 'Gerudo Scimitar', 'sword', 'uncommon', 6, 90, 10, 4, 1, 1),
  w('twinGerudoBlades', 'Twin Gerudo Blades', 'sword', 'epic', 7, 85, 5, 6, 1, 1, { brave: true, desc: 'Strikes twice when initiating combat.' }),
  w('nabooruScimitar', "Nabooru's Scimitar", 'sword', 'legendary', 11, 95, 10, 5, 1, 1, { pierce: 0.3, unique: true, desc: 'Ignores 30% of enemy DEF.' }),
  w('sheikahShortblade', 'Sheikah Shortblade', 'dagger', 'rare', 5, 95, 20, 2, 1, 1),
  w('gerudoDagger', 'Gerudo Dagger', 'dagger', 'common', 4, 90, 10, 2, 1, 1),
  w('sheikahNeedles', 'Sheikah Needles', 'dagger', 'uncommon', 4, 90, 10, 1, 1, 2, { desc: 'Thrown weapon.' }),
  w('impasBlade', "Impa's Blade", 'sword', 'legendary', 10, 95, 10, 6, 1, 1, { unique: true }),
  w('stalfosSword', 'Stalfos Sword', 'sword', 'uncommon', 7, 80, 0, 7, 1, 1),
  w('lizalfosBlade', 'Lizalfos Blade', 'sword', 'uncommon', 6, 85, 5, 4, 1, 1),
  w('dinolfosCleaver', 'Dinolfos Cleaver', 'sword', 'rare', 10, 75, 0, 9, 1, 1),
  w('hyruleSpear', 'Hyrule Spear', 'lance', 'common', 6, 85, 0, 6, 1, 1, { effective: ['cavalry'], desc: 'Effective against cavalry.' }),
  w('moblinSpear', 'Moblin Spear', 'lance', 'uncommon', 9, 75, 0, 10, 1, 1),
  w('zoraSpear', 'Zora Spear', 'lance', 'rare', 8, 90, 0, 6, 1, 1, { desc: '+3 Might in water (coming with terrain effects).' }),
  w('royalZoraTrident', 'Royal Zora Trident', 'lance', 'epic', 11, 85, 5, 8, 1, 2),
  w('ironKnuckleAxe', 'Iron Knuckle Axe', 'axe', 'epic', 17, 65, 0, 16, 1, 1, { pierce: 0.5, twoHanded: true, desc: 'Ignores 50% of enemy DEF.' }),
  w('moblinClub', 'Moblin Club', 'hammer', 'uncommon', 11, 65, 0, 11, 1, 1),
  w('goronHammer', 'Goron Stone Hammer', 'hammer', 'uncommon', 10, 75, 0, 10, 1, 1, { effective: ['stone'] }),
  w('daruniaHammer', "Darunia's Warhammer", 'hammer', 'legendary', 15, 80, 5, 13, 1, 1, { effective: ['armor'], unique: true }),
  w('goronFists', 'Goron Battle Fists', 'gauntlet', 'common', 5, 90, 0, 3, 1, 1, { brave: true, desc: 'Two consecutive strikes when attacking.' }),
  w('dampeShovel', "Dampé's Shovel", 'hammer', 'uncommon', 5, 85, 0, 5, 1, 1),
  w('carpenterHammer', "Carpenter's Hammer", 'hammer', 'common', 4, 90, 0, 4, 1, 1),
  w('gerudoLongbow', 'Gerudo Longbow', 'bow', 'rare', 8, 90, 5, 5, 2, 3, { effective: ['flying'] }),
  w('royalHuntingBow', 'Royal Hunting Bow', 'bow', 'uncommon', 6, 85, 0, 4, 2, 2, { effective: ['flying'] }),
  w('dekuShooter', 'Deku Shooter', 'sling', 'common', 4, 85, 0, 2, 2, 3),
  w('pitchfork', 'Ranch Pitchfork', 'lance', 'common', 5, 80, 0, 5, 1, 1),
  // ── Magic ──
  w('forestSageStaff', 'Forest Sage Staff', 'magic', 'rare', 6, 85, 0, 4, 1, 3, { element: 'nature', desc: 'Nature: may Poison.' }),
  w('fireSageStaff', 'Fire Sage Staff', 'magic', 'rare', 8, 80, 0, 5, 1, 3, { element: 'fire', desc: 'Fire: may inflict Burning.' }),
  w('waterSageStaff', 'Water Sage Staff', 'magic', 'rare', 6, 90, 0, 4, 1, 3, { element: 'water', desc: 'Water: stronger in the rain.' }),
  w('shadowSageStaff', 'Shadow Sage Staff', 'magic', 'rare', 7, 85, 5, 4, 1, 3),
  w('spiritSageStaff', 'Spirit Sage Staff', 'magic', 'rare', 8, 85, 0, 5, 1, 3, { effective: ['possessed'] }),
  w('lightSageStaff', 'Light Sage Staff', 'magic', 'epic', 9, 90, 0, 5, 1, 4, { effective: ['undead', 'demon'] }),
  w('koumeBroom', "Koume's Broom", 'magic', 'legendary', 11, 85, 5, 4, 1, 4, { unique: true, element: 'fire', desc: 'Fire: may inflict Burning.' }),
  w('kotakeBroom', "Kotake's Broom", 'magic', 'legendary', 10, 90, 5, 4, 1, 4, { unique: true, element: 'ice', desc: 'Ice: may Freeze.' }),
  w('twinrovaScepter', "Twinrova's Scepter", 'magic', 'mythic', 15, 85, 5, 6, 1, 4, { unique: true, element: 'fire', desc: 'Fire: may inflict Burning.' }),
  w('pgTrident', "Phantom Ganon's Trident", 'magic', 'legendary', 13, 85, 5, 7, 1, 4, { unique: true }),
  w('darkOrb', "Ganondorf's Dark Orb", 'magic', 'legendary', 14, 80, 5, 6, 2, 4, { unique: true }),
  w('ganonBlades', "Ganon's Twin Blades", 'sword', 'mythic', 20, 80, 10, 14, 1, 2, { unique: true }),
  w('darkMasterSword', 'Dark Master Sword', 'sword', 'legendary', 11, 90, 10, 5, 1, 1, { unique: true }),
  w('poeLantern', 'Poe Lantern', 'magic', 'rare', 6, 85, 0, 3, 1, 3),
  w('bigPoeLantern', 'Big Poe Lantern', 'magic', 'epic', 9, 85, 0, 4, 1, 3),
  w('fairyLight', 'Fairy Light', 'magic', 'common', 0, 95, 0, 0, 1, 2, { unique: true, desc: 'A weak flash of fairy light. Navi is a support unit.' }),
  w('zoraWaterMagic', 'Zora Water Magic', 'magic', 'common', 5, 90, 0, 2, 1, 2),
  // ── Instruments (needed to perform songs; not used for attacking) ──
  w('fairyOcarina', 'Fairy Ocarina', 'instrument', 'uncommon', 0, 0, 0, 1, 0, 0, { desc: 'Lets the holder perform songs they have learned.' }),
  w('ocarinaOfTime', 'Ocarina of Time', 'instrument', 'mythic', 0, 0, 0, 1, 0, 0, { songDiscount: 2, unique: true, desc: 'Songs cost 2 less MP (minimum 1).' }),
  w('sheiksHarp', "Sheik's Harp", 'instrument', 'legendary', 0, 0, 0, 2, 0, 0, { songDiscount: 1, unique: true, desc: 'Songs cost 1 less MP.' }),
  w('skullKidFlute', "Skull Kid's Flute", 'instrument', 'rare', 0, 0, 0, 1, 0, 0, { songDiscount: 1, desc: 'Songs cost 1 less MP.' }),
  // ── Healing staves (not in the doc; needed so healers can heal) ──
  w('healStaff', 'Healing Staff', 'staff', 'common', 10, 100, 0, 2, 1, 1),
  w('fairyStaff', 'Fairy Staff', 'staff', 'rare', 18, 100, 0, 3, 1, 2),
  w('greatFairyWand', 'Great Fairy Wand', 'staff', 'legendary', 12, 100, 0, 3, 1, 4, { healBonus: 1.5, unique: true, desc: 'Increases all healing by 50%.' }),
  // ── Natural weapons (monsters) ──
  w('fangs', 'Fangs', 'natural', 'common', 5, 85, 5, 0, 1, 1, { unique: true }),
  w('claws', 'Claws', 'natural', 'common', 6, 80, 5, 0, 1, 1, { unique: true }),
  w('talons', 'Talons', 'natural', 'common', 6, 85, 5, 0, 1, 1, { unique: true }),
  w('bite', 'Crushing Bite', 'natural', 'common', 9, 75, 0, 0, 1, 1, { unique: true }),
  w('stone', 'Spat Rock', 'natural', 'common', 5, 80, 0, 0, 2, 3, { unique: true }),
  w('fireBreath', 'Fire Breath', 'magic', 'common', 7, 80, 0, 0, 1, 2, { unique: true, element: 'fire' }),
  w('beamosEye', 'Laser Eye', 'magic', 'common', 8, 85, 0, 0, 2, 4, { unique: true }),
  w('drainTouch', 'Life Drain', 'natural', 'common', 6, 80, 0, 0, 1, 1, { unique: true }),
  w('bossClaws', 'Great Claws', 'natural', 'common', 12, 80, 5, 0, 1, 2, { unique: true }),
  w('jabuTide', 'Tidal Spray', 'magic', 'common', 9, 85, 0, 0, 1, 3, { unique: true, element: 'water' }),
  w('bossBeam', 'Arcane Blast', 'magic', 'common', 11, 80, 5, 0, 1, 3, { unique: true, element: 'lightning' }),
];
