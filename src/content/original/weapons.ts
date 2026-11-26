import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

/** Swords that fire a Sword Beam at full HP (anyone can, with these; Link can with any sword). */
export const BEAM_SWORDS = ['whiteSword', 'magicalSword'];

// Mt and rarity from the design doc; hit, crit, weight and range are my proposals.
// The starting Sword, Bow and Boomerang are the existing Kokiri Sword, Fairy Bow and Boomerang.
export const WEAPONS: WeaponDef[] = [
  // ── Section 6 ──
  w('whiteSword', 'White Sword', 'sword', 'rare', 12, 90, 5, 5, 1, 1, { uses: 55, desc: 'Fires a Sword Beam (range 2–3) while the wielder is at full HP.' }),
  w('magicalSword', 'Magical Sword', 'sword', 'legendary', 22, 95, 10, 6, 1, 1, { uses: 0, unique: true, sacredMult: 1.25, element: 'light',
    desc: 'Powerful Sword Beams (range 2–4) at full HP; +25% sacred damage against demons and the undead.' }),
  w('magicalRod', 'Magical Rod', 'magic', 'epic', 14, 85, 5, 4, 1, 3, { uses: 50, desc: 'Fires bolts of magic energy. With the Book of Magic, its bolts leave the ground burning.' }),
  w('magicalBoomerang', 'Magical Boomerang', 'boomerang', 'rare', 8, 90, 5, 2, 1, 5, { uses: 0, inflict: { status: 'stun', chance: 40, turns: 1 }, desc: 'Flies further (range 5) and stuns more often (40%).' }),
  w('goriyaBoomerang', 'Goriya Boomerang', 'boomerang', 'uncommon', 6, 85, 0, 2, 1, 3, { uses: 40, brave: true, desc: 'Hits on the way out and on the way back (strikes twice when attacking).' }),
  w('aquamentusHorn', 'Aquamentus Horn', 'natural', 'legendary', 18, 85, 5, 6, 1, 3, sig({ uses: 60, magicContact: true, element: 'fire', splash: 'adjacent',
    desc: 'Three spreading fireballs: half damage also lands on enemies next to the target.' })),
  w('manhandlaFang', 'Manhandla Fang', 'natural', 'epic', 14, 85, 10, 5, 1, 1, sig({ uses: 50, desc: 'Heals the wielder for 15% of the damage it deals.' })),
  w('patrasEye', "Patra's Eye", 'magic', 'legendary', 17, 90, 5, 3, 1, 3, sig({ uses: 60, desc: 'Stronger while orbital eyes survive (+1 Might per two eyes).' })),
  // ── Personal and monster weapons ──
  w('ganonsTrident', "Ganon's Trident", 'lance', 'legendary', 16, 85, 10, 9, 1, 2, sig({ uses: 0, element: 'dark', desc: 'The Prince of Darkness\'s trident. Thrown, it reaches 2 spaces.' })),
  w('darkFireballs', 'Dark Fireballs', 'magic', 'epic', 13, 85, 5, 2, 2, 4, sig({ uses: 0, element: 'fire', desc: 'Ganon\'s spinning fireballs.' })),
  w('merchantsPack', "Merchant's Heavy Pack", 'sword', 'uncommon', 6, 85, 5, 4, 1, 1, { uses: 45, unique: true, desc: 'A pack so full of wares it doubles as a club.' }),
  nat('ropeFangs', 'Venomous Fangs', 6, 85, 5, 1, 1, { inflict: { status: 'poison', chance: 35, turns: 2 } }),
  nat('slimeSlam', 'Slime Slam', 6, 80, 0, 1, 1, { inflict: { status: 'root', chance: 20, turns: 1 } }),
  nat('stickyBody', 'Sticky Collision', 3, 85, 0, 1, 1),
  nat('vireClaws', 'Vire Claws', 9, 85, 5, 1, 1),
  nat('vireFireball', 'Vire Fireball', 7, 80, 0, 2, 3, { magicContact: true, element: 'fire' }),
  nat('polsLeap', 'Leaping Collision', 8, 85, 5, 1, 1),
  nat('spectralTouch', 'Spectral Collision', 9, 85, 0, 1, 1, { magicContact: true, element: 'dark' }),
  nat('lanmolaMandibles', 'Lanmola Mandibles', 11, 85, 5, 1, 1),
  nat('aquamentusFireball', 'Triple Fireball', 12, 85, 0, 2, 5, { magicContact: true, element: 'fire', splash: 'adjacent' }),
  nat('aquamentusHornNatural', 'Unicorn Horn', 14, 80, 5, 1, 1),
  nat('manhandlaJaws', 'Manhandla Jaws', 12, 85, 5, 1, 1, { splash: 'around' }),
  nat('manhandlaSeeds', 'Seed Barrage', 7, 80, 0, 2, 3),
  nat('dodongoFlame', 'Dodongo Flame', 10, 80, 0, 1, 2, { magicContact: true, element: 'fire' }),
  nat('digdoggerBody', 'Rolling Collision', 16, 80, 0, 1, 1),
  nat('lesserDigdoggerBody', 'Erratic Collision', 8, 85, 5, 1, 1),
  nat('patraOrbit', 'Orbiting Eyes', 9, 85, 0, 1, 2, { magicContact: true }),
];
