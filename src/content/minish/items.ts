import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;

/** Picolytes (section 9): drunk in battle, they raise what the battle leaves behind. */
export const PICOLYTES: Record<string, string> = {
  redPicolyte: 'more heart drops (the army recovers 15% more HP after the battle)', greenPicolyte: 'more Mysterious Shells', bluePicolyte: 'more item drops',
  yellowPicolyte: 'more Rupees (+30%)', whitePicolyte: 'more Kinstone pieces', orangePicolyte: 'more fairies',
};
export const KINSTONES = ['kinstoneGreen', 'kinstoneBlue', 'kinstoneRed', 'kinstoneGold'] as const;
export const ELEMENTS = ['earthElement', 'fireElement', 'waterElement', 'windElement'] as const;

// Section 9's pack items. Red Potion, Blue Potion and Lon Lon Milk reuse their existing entries.
export const ITEMS: ItemDef[] = [
  it({ id: 'gustJar', name: 'Gust Jar', kind: 'special', rarity: 'rare', price: 600, power: 6, uses: 5, targeted: true, minRange: 1, maxRange: 3,
    desc: 'Inhales a Micro or size-1 enemy (pulls it 2 spaces closer and deals 6), clears spiderwebs, and knocks a giant ChuChu over (its slime stops softening blows for 2 turns). 5 uses.' }),
  it({ id: 'flameLantern', name: 'Flame Lantern', kind: 'special', rarity: 'rare', price: 550, power: 8, uses: 6, targeted: true, minRange: 1, maxRange: 2,
    desc: 'Lights darkness, melts ice and ignites: burns spiderwebs around the target, sets the Big Octorok\'s flower alight (no frozen armour) and burns (8 fire damage) the target. 6 uses.' }),
  it({ id: 'remoteBomb', name: 'Remote Bomb', kind: 'bomb', rarity: 'rare', price: 320, power: 16, uses: 2, minRange: 1, maxRange: 4, radius: 1, element: 'fire',
    desc: 'Placed up to 4 away and set off at once: 16 damage to everyone (normal and Micro) within 1 of it. Breaks cracked walls and Gleerok\'s shell.' }),
  it({ id: 'dogFood', name: 'Dog Food', kind: 'special', rarity: 'common', price: 80, power: 0, uses: 1, targeted: true, minRange: 1, maxRange: 3,
    desc: 'Attracts compatible animals: beasts within 2 of the target are lured (Confused for a turn).' }),
  it({ id: 'minishMushroom', name: 'Minish Mushroom', kind: 'special', rarity: 'common', price: 90, power: 14, uses: 2,
    desc: 'A Micro restorative: 14 HP (28 for a Micro unit) and 5 MP. Also a crafting ingredient. Two servings.' }),
  ...Object.entries(PICOLYTES).map(([id, what]) => it({ id, name: `${id[0].toUpperCase()}${id.slice(1).replace('Picolyte', '')} Picolyte`, kind: 'special', rarity: 'uncommon', price: 160, power: 0, uses: 1,
    desc: `Drink in battle: ${what}. Doesn't use your action.` })),
];

// Section 9's quest items, Kinstones, shells and crafting materials (shared quest inventory).
export const QUEST_ITEMS = [
  { id: 'kinstoneGreen', name: 'Green Kinstone Piece', desc: 'Common. Fuse two halves: Rupees, consumables and ordinary treasure.' },
  { id: 'kinstoneBlue', name: 'Blue Kinstone Piece', desc: 'Uncommon. Fuse two halves: equipment, recruitment encounters and hidden passages.' },
  { id: 'kinstoneRed', name: 'Red Kinstone Piece', desc: 'Rare. Fuse two halves: rare equipment, permanent enhancements and special events.' },
  { id: 'kinstoneGold', name: 'Gold Kinstone Piece', desc: 'Legendary. Fused for major quest progression and secret regions (a Great Fairy and a hidden treasure).' },
  { id: 'kinstoneBag', name: 'Kinstone Bag', desc: 'Holds Kinstone pieces. Fusions happen at camp (Kinstone Exchange), at recruitment encounters and with people on the march.' },
  { id: 'mysteriousShell', name: 'Mysterious Shell', desc: 'Carlov trades figurines for them at the Figurine Gallery.' },
  { id: 'earthElement', name: 'Earth Element', desc: 'One of the four Elements that reforge the Picori Blade.' },
  { id: 'fireElement', name: 'Fire Element', desc: 'One of the four Elements that reforge the Picori Blade.' },
  { id: 'waterElement', name: 'Water Element', desc: 'One of the four Elements that reforge the Picori Blade.' },
  { id: 'windElement', name: 'Wind Element', desc: 'One of the four Elements that reforge the Picori Blade.' },
  { id: 'brokenPicoriBlade', name: 'Broken Picori Blade', desc: 'The shattered sacred blade, waiting for Melari\'s forge.' },
  { id: 'smithsSwordDelivery', name: "Smith's Sword (delivery)", desc: 'The sword Smith forged for the Picori Festival champion.' },
  { id: 'wakeUpMushroom', name: 'Wake-Up Mushroom', desc: 'A mushroom so smelly it wakes anyone, even the Goron in Mount Crenel.' },
  { id: 'jabberNut', name: 'Jabber Nut', desc: 'Lets ordinary people talk to the Minish: more Minish recruits and trades.' },
  { id: 'lonLonRanchKey', name: 'Lon Lon Ranch Key', desc: 'Talon\'s spare key.' },
  { id: 'bookOfTheMinish', name: 'Book of the Minish', desc: 'One of the library\'s three missing books.' },
  { id: 'hyruleanBestiary', name: 'A Hyrulean Bestiary', desc: 'One of the library\'s three missing books.' },
  { id: 'legendOfThePicori', name: 'Legend of the Picori', desc: 'One of the library\'s three missing books.' },
  { id: 'historyOfMasks', name: 'A History of Masks', desc: 'A book with a familiar smiling face on the cover.' },
  { id: 'tingleTrophy', name: 'Tingle Trophy', desc: 'Kooloo-limpah.' },
  { id: 'carlovMedal', name: 'Carlov Medal', desc: 'For completing the figurine collection.' },
  { id: 'pestoWing', name: 'Pesto Wing', desc: 'Crafting material: Micro gliders.' },
  { id: 'puffstoolSpores', name: 'Puffstool Spores', desc: 'Crafting material: poison and confusion.' },
  { id: 'rollobiteShell', name: 'Rollobite Shell', desc: 'Crafting material: Micro armour.' },
  { id: 'gleerokScale', name: 'Gleerok Scale', desc: 'Crafting material: fire-resistant armour.' },
  { id: 'mazaalMechanism', name: 'Mazaal Mechanism', desc: 'Crafting material: ancient constructs.' },
  { id: 'gyorgWingFragment', name: 'Gyorg Wing Fragment', desc: 'Crafting material: flying equipment.' },
  { id: 'vaatisDarkEssence', name: "Vaati's Dark Essence", desc: 'Crafting material: mythic magic.' },
];
