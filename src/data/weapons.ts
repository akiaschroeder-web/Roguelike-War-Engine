import type { WeaponDef, WeaponType } from '../engine/types';

const w = (
  id: string, name: string, type: WeaponType, might: number, hit: number, crit: number,
  minRange: number, maxRange: number, tier: number, price: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, might, hit, crit, minRange, maxRange, tier, price, ...extra });

const list: WeaponDef[] = [
  // Swords — accurate, fast
  w('ironSword', 'Iron Sword', 'sword', 5, 90, 0, 1, 1, 1, 0),
  w('steelSword', 'Steel Sword', 'sword', 8, 80, 0, 1, 1, 2, 300),
  w('silverSword', 'Silver Sword', 'sword', 12, 85, 5, 1, 1, 3, 700),
  w('killingEdge', 'Killing Edge', 'sword', 9, 80, 30, 1, 1, 3, 650),
  // Lances
  w('ironLance', 'Iron Lance', 'lance', 6, 80, 0, 1, 1, 1, 0),
  w('steelLance', 'Steel Lance', 'lance', 9, 75, 0, 1, 1, 2, 320),
  w('javelin', 'Javelin', 'lance', 6, 65, 0, 1, 2, 2, 380, { desc: 'Can be thrown at range 2.' }),
  w('silverLance', 'Silver Lance', 'lance', 13, 75, 0, 1, 1, 3, 750),
  // Axes — heavy hitters
  w('ironAxe', 'Iron Axe', 'axe', 8, 70, 0, 1, 1, 1, 0),
  w('steelAxe', 'Steel Axe', 'axe', 11, 65, 0, 1, 1, 2, 320),
  w('hammer', 'Hammer', 'axe', 10, 60, 0, 1, 1, 2, 400, { effective: ['armor'], desc: 'Effective against armored units.' }),
  w('handAxe', 'Hand Axe', 'axe', 7, 60, 0, 1, 2, 2, 380, { desc: 'Can be thrown at range 2.' }),
  w('silverAxe', 'Silver Axe', 'axe', 15, 70, 0, 1, 1, 3, 780),
  // Bows — range 2, effective vs fliers
  w('ironBow', 'Iron Bow', 'bow', 6, 85, 0, 2, 2, 1, 0, { effective: ['flying'] }),
  w('steelBow', 'Steel Bow', 'bow', 9, 75, 0, 2, 2, 2, 320, { effective: ['flying'] }),
  w('longbow', 'Longbow', 'bow', 8, 65, 0, 2, 3, 3, 600, { effective: ['flying'] }),
  // Magic — targets Res, range 1-2
  w('fire', 'Fire', 'magic', 5, 90, 0, 1, 2, 1, 0),
  w('thunder', 'Thunder', 'magic', 8, 80, 5, 1, 2, 2, 350),
  w('nosferatu', 'Nosferatu', 'magic', 7, 75, 0, 1, 2, 3, 650, { desc: 'Heals the user for half the damage dealt.' }),
  w('bolting', 'Bolting', 'magic', 11, 65, 0, 3, 5, 3, 900, { desc: 'Long range artillery spell.' }),
  // Guns — range 2-3, no melee counter
  w('blaster', 'Blaster', 'gun', 6, 85, 5, 2, 3, 1, 0),
  w('pulseRifle', 'Pulse Rifle', 'gun', 9, 80, 5, 2, 3, 2, 360),
  w('railgun', 'Railgun', 'gun', 13, 70, 10, 2, 4, 3, 850),
  // Staves — heal allies (might = heal power)
  w('mend', 'Mend Staff', 'staff', 10, 100, 0, 1, 1, 1, 0),
  w('recover', 'Recover Staff', 'staff', 20, 100, 0, 1, 1, 2, 400),
  w('physic', 'Physic Staff', 'staff', 10, 100, 0, 1, 3, 3, 600, { desc: 'Heal at range 1-3.' }),
  // Signature / boss weapons (not sold)
  w('dawnbrand', 'Dawnbrand', 'sword', 10, 90, 10, 1, 1, 4, 0, { effective: ['armor', 'cavalry'] }),
  w('voidScythe', 'Void Scythe', 'axe', 14, 80, 10, 1, 2, 4, 0),
  w('starbreaker', 'Starbreaker', 'gun', 12, 85, 15, 2, 3, 4, 0),
  w('riftCrown', 'Riftcrown', 'magic', 14, 85, 10, 1, 3, 4, 0),
];

export const WEAPONS: Record<string, WeaponDef> = Object.fromEntries(list.map((x) => [x.id, x]));

export const SHOP_WEAPONS = list.filter((x) => x.price > 0);

/** Starting (tier 1) weapon for each type — used when a class needs a default. */
export const STARTER_WEAPON: Record<WeaponType, string> = {
  sword: 'ironSword', lance: 'ironLance', axe: 'ironAxe', bow: 'ironBow',
  magic: 'fire', gun: 'blaster', staff: 'mend',
};

/** Weapon triangle: key beats value. Magic, bows, guns and staves sit outside it. */
export const TRIANGLE: Partial<Record<WeaponType, WeaponType>> = {
  sword: 'axe',
  axe: 'lance',
  lance: 'sword',
};

export function isMagical(type: WeaponType): boolean {
  return type === 'magic' || type === 'staff';
}
