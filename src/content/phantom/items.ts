import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;

/** The Spirits' gems: 10 raise the matching Spirit to level 1, 20 to level 2. */
export const SPIRIT_GEMS: Record<'leaf' | 'neri' | 'ciela', string> = { leaf: 'powerSpiritGem', neri: 'wisdomSpiritGem', ciela: 'courageSpiritGem' };
/** Treasures: sold to traders or traded for ship parts. */
export const PH_TREASURES = ['regalNecklace', 'pearlNecklace', 'pinkCoral', 'whitePearlLoop', 'darkPearlLoop', 'zoraScale', 'rutoCrown', 'goronAmber', 'phantomEssence', 'bellumsEye'];
/** The four sea charts of the World of the Ocean King. */
export const SEA_CHARTS = ['southwesternSeaChart', 'northwesternSeaChart', 'northeasternSeaChart', 'southeasternSeaChart'];

// Section 7's collectibles and quest items (the Helmaroc Plume is the existing Helmaroc Feather;
// treasure charts are the Wind Waker's Treasure Chart), plus the Subrosian Chef's Lava Soup.
export const ITEMS: ItemDef[] = [
  it({ id: 'lavaSoup', name: 'Lava Soup', kind: 'heal', rarity: 'uncommon', price: 140, power: 25, uses: 1, desc: 'A Subrosian specialty, still bubbling. Restores 25 HP.' }),
  it({ id: 'sandsOfHoursVial', name: 'Vial of Sand', kind: 'special', rarity: 'rare', price: 300, power: 0, uses: 1, desc: 'A pinch of the Sands of Hours: the Phantom Hourglass regains 8 time.' }),
];

export const QUEST_ITEMS: { id: string; name: string; desc: string }[] = [
  { id: 'phantomHourglass', name: 'Phantom Hourglass', desc: 'Holds the Sands of Hours. Its time energy is shared by the whole army: Time Freeze, Frozen Battlefield, Temporal Escape and Sacred Opening.' },
  { id: 'sandsOfHours', name: 'Sands of Hours', desc: 'Each one raises the Phantom Hourglass\'s reserve by 5 for the rest of the run.' },
  { id: 'powerSpiritGem', name: 'Power Gem', desc: 'A Spirit Gem of Power. 10 raise Leaf to level 1, 20 to level 2 (more fire and physical damage).' },
  { id: 'wisdomSpiritGem', name: 'Wisdom Gem', desc: 'A Spirit Gem of Wisdom. 10 raise Neri to level 1, 20 to level 2 (less damage taken, barriers).' },
  { id: 'courageSpiritGem', name: 'Courage Gem', desc: 'A Spirit Gem of Courage. 10 raise Ciela to level 1, 20 to level 2 (sword beams, cheaper time abilities).' },
  { id: 'crimsonine', name: 'Crimsonine', desc: 'A sacred red metal, one of the three the Phantom Sword needs.' },
  { id: 'azurine', name: 'Azurine', desc: 'A sacred blue metal, one of the three the Phantom Sword needs.' },
  { id: 'aquanine', name: 'Aquanine', desc: 'A sacred sea-green metal, one of the three the Phantom Sword needs.' },
  { id: 'regalNecklace', name: 'Regal Necklace', desc: 'A treasure (and accessory material). Sells well.' },
  { id: 'pearlNecklace', name: 'Pearl Necklace', desc: 'A treasure.' },
  { id: 'pinkCoral', name: 'Pink Coral', desc: 'A treasure; aquatic crafting material.' },
  { id: 'whitePearlLoop', name: 'White Pearl Loop', desc: 'A treasure.' },
  { id: 'darkPearlLoop', name: 'Dark Pearl Loop', desc: 'A rare magic material.' },
  { id: 'zoraScale', name: 'Zora Scale', desc: 'Material for aquatic gear.' },
  { id: 'rutoCrown', name: 'Ruto Crown', desc: 'A treasure that can be made into an accessory.' },
  { id: 'goronAmber', name: 'Goron Amber', desc: 'Armor material.' },
  { id: 'phantomEssence', name: 'Phantom Essence', desc: 'What is left of a Phantom. Material for Phantom gear.' },
  { id: 'bellumsEye', name: "Bellum's Eye", desc: 'A mythic magic material.' },
  { id: 'sunKey', name: 'Sun Key', desc: 'Opens the sealed door on Goron Island.' },
  { id: 'kingsKey', name: "King's Key", desc: 'Opens King Mutoh\'s tomb on the Isle of the Dead.' },
  { id: 'ghostKey', name: 'Ghost Key', desc: 'Opens the doors of the Ghost Ship.' },
  { id: 'cycloneSlate', name: 'Cyclone Slate', desc: 'Calls up a cyclone: ships warp between Cyclone Warp Points, and the army can sail to any island already visited.' },
  { id: 'jolenesLetter', name: "Jolene's Letter", desc: 'A letter for Joanne, from her sister.' },
  { id: 'herosNewClothes', name: "Hero's New Clothes", desc: 'Freshly woven. Someone on the Isle of Frost will want to see them.' },
  { id: 'kaleidoscope', name: 'Kaleidoscope', desc: 'Prized by collectors.' },
  { id: 'guardNotebook', name: 'Guard Notebook', desc: 'Notes on Anouki and Yook... which is which?' },
  { id: 'woodHeart', name: 'Wood Heart', desc: 'Carved for a loved one.' },
  { id: 'southwesternSeaChart', name: 'Southwestern Sea Chart', desc: 'The first sea of the World of the Ocean King: Mercay, Ember, Cannon, Gust and Molida.' },
  { id: 'northwesternSeaChart', name: 'Northwestern Sea Chart', desc: 'The fog-bound sea of the Ghost Ship and Goron Island.' },
  { id: 'northeasternSeaChart', name: 'Northeastern Sea Chart', desc: 'The cold sea: the Isle of Frost and the Isle of the Dead.' },
  { id: 'southeasternSeaChart', name: 'Southeastern Sea Chart', desc: 'The sea of the Isle of Ruins and Zauz\'s Island.' },
  { id: 'bombchuBagPH', name: 'Bombchu Bag', desc: 'Every Bombchu stack the army carries into battle holds one more.' },
  { id: 'tightropeKit', name: 'Grappling Hook Enhancement', desc: 'A Grappling Hook can string a tightrope between two Tightrope Posts, and its wielder crosses Tightropes freely.' },
  { id: 'bigCatchLure', name: 'Fishing Rod Enhancement', desc: 'The Big Catch Lure: deep-sea fishing encounters.' },
  { id: 'oreChunk', name: 'Ore Chunk', desc: 'Subrosian currency. Traded for Rupees and smithing.' },
];
