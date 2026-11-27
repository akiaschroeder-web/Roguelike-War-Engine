import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;

/** Treasures (section 9): sold to Linebeck III or traded for train parts. The Phantom Hourglass pack's
 *  pearls, Ruto Crown and Goron Amber, the Era of the Wild's Star Fragment and Dragon Scale are reused. */
export const ST_TREASURES = ['stalfosSkull', 'palaceDish', 'ancientGoldPiece', 'demonFossil', 'mysticJade', 'whitePearlLoop', 'darkPearlLoop', 'pearlNecklace', 'rutoCrown', 'goronAmber', 'starFragment', 'dragonScale'];
export const TREASURE_VALUE: Record<string, number> = {
  stalfosSkull: 120, palaceDish: 220, ancientGoldPiece: 300, demonFossil: 400, mysticJade: 350, whitePearlLoop: 200, darkPearlLoop: 400, pearlNecklace: 150,
  rutoCrown: 500, goronAmber: 160, starFragment: 450, dragonScale: 380,
};
/** The rail maps: each opens the Spirit Tracks of the next realm. The Compass of Light opens the Sand Realm. */
export const RAIL_MAPS: Record<string, string> = { forestRealm: 'forestRailMap', snowRealm: 'snowRailMap', oceanRealm: 'oceanRailMap', fireRealm: 'fireRailMap', sandRealm: 'compassOfLight' };

// Section 9's pack items and quest items (Bee Larvae is the existing Bee Larva).
export const ITEMS: ItemDef[] = [
  it({ id: 'whirlwindST', name: 'Whirlwind', kind: 'special', rarity: 'rare', price: 500, power: 0, uses: 3, targeted: true, minRange: 1, maxRange: 3,
    desc: 'A propeller toy that blows a gust: an enemy (or a projectile) within 3 is blown back up to 3 spaces; it also turns Skeldritch\'s boulders back and lays Stagnox\'s armor open.' }),
  it({ id: 'chuchuJellyST', name: 'ChuChu Jelly', kind: 'heal', rarity: 'common', price: 40, power: 10, uses: 1, desc: 'Plain jelly from a Standard ChuChu. Restores 10 HP.' }),
  it({ id: 'whiteChuJelly', name: 'White Chu Jelly', kind: 'cure', rarity: 'uncommon', price: 90, power: 0, uses: 1, cures: ['burn', 'poison'], desc: 'Cold jelly from an Ice ChuChu: cures Burning and Poison.' }),
  it({ id: 'yellowChuJelly', name: 'Yellow Chu Jelly', kind: 'mp', rarity: 'uncommon', price: 90, power: 15, uses: 1, desc: 'Crackling jelly from an Electric ChuChu: restores 15 MP.' }),
  it({ id: 'electrifiedMetalGel', name: 'Electrified Metal Gel', kind: 'mp', rarity: 'rare', price: 200, power: 30, uses: 1, desc: 'Humming gel from a Metal ChuChu: restores 30 MP.' }),
  it({ id: 'phantomTear', name: 'Phantom Tear', kind: 'special', rarity: 'rare', power: 0, price: 350, uses: 1,
    desc: 'A Tear of Light in a bottle: for 3 turns the user\'s weapon is sacred (it beats Phantom armor from any side and exposes Phantoms for possession).' }),
];

export const QUEST_ITEMS: { id: string; name: string; desc: string }[] = [
  { id: 'stalfosSkull', name: 'Stalfos Skull', desc: 'A treasure. Collectors pay for these.' },
  { id: 'palaceDish', name: 'Palace Dish', desc: 'A treasure from Hyrule Castle\'s kitchens.' },
  { id: 'ancientGoldPiece', name: 'Ancient Gold Piece', desc: 'A treasure: old Lokomo gold.' },
  { id: 'demonFossil', name: 'Demon Fossil', desc: 'A rare treasure from the Dark Realm.' },
  { id: 'mysticJade', name: 'Mystic Jade', desc: 'A treasure of the Ocean Realm.' },
  { id: 'forestRailMap', name: 'Forest Rail Map', desc: 'The Spirit Tracks of the Forest Realm.' },
  { id: 'snowRailMap', name: 'Snow Rail Map', desc: 'The Spirit Tracks of the Snow Realm.' },
  { id: 'oceanRailMap', name: 'Ocean Rail Map', desc: 'The Spirit Tracks of the Ocean Realm.' },
  { id: 'fireRailMap', name: 'Fire Rail Map', desc: 'The Spirit Tracks of the Fire Realm.' },
  { id: 'compassOfLight', name: 'Compass of Light', desc: 'Points the way through the sand to the Sand Realm\'s tracks.' },
  { id: 'stampBook', name: 'Stamp Book', desc: 'Elder Niko\'s book of station stamps: 5 stamps give gear and supplies, 10 the Shield of Antiquity, 15 a rare train part, 20 a legendary treasure.' },
  { id: 'forceGem', name: 'Force Gem', desc: 'A gem that restores a missing stretch of track. Every 3 open a branch line with a merchant or a new recruit.' },
  { id: 'freightCargo', name: 'Freight Cargo', desc: 'Fragile goods for delivery. Bring it to a station for a reward.' },
  { id: 'passengerTicket', name: 'Passenger Ticket', desc: 'A passenger waiting to be taken to the next station.' },
  { id: 'royalEngineerCertificate', name: 'Royal Engineer Certificate', desc: 'The hero\'s certificate. Train repairs at stations are free.' },
];
