import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;
const sp = (id: string, name: string, rarity: ItemDef['rarity'], price: number, uses: number, desc: string, extra: Partial<ItemDef> = {}): ItemDef =>
  it({ id, name, kind: 'special', rarity, price, power: 0, uses, desc, ...extra });

/** The five mystical seeds (pack use, or ammunition from the Seed Satchel). */
export const SEED_KINDS = ['ember', 'scent', 'pegasus', 'gale', 'mystery'] as const;
export type SeedKind = (typeof SEED_KINDS)[number];
export const SEED_ITEM: Record<SeedKind, string> = { ember: 'emberSeed', scent: 'scentSeed', pegasus: 'pegasusSeed', gale: 'galeSeed', mystery: 'mysterySeed' };
/** Seed Satchel capacities (quest items). */
export const SATCHELS: [string, number][] = [['hugeSeedSatchel', 99], ['largeSeedSatchelOracle', 50], ['seedSatchelOracle', 20]];

// Section 7 and 10 pack items. Bombs, the Magic Mushroom and the Bomb Flower are the existing entries.
export const ITEMS: ItemDef[] = [
  it({ id: 'superBomb', name: 'Super Bomb', kind: 'bomb', rarity: 'epic', price: 400, power: 24, uses: 1, minRange: 1, maxRange: 2, radius: 2, breaksWalls: true,
    desc: 'A huge explosive: 24 damage within 2 spaces of where it lands; breaks walls and structures (Wooden Stakes, Somaria Blocks, Crystal Barriers).' }),
  sp('sleepyToadstool', 'Sleepy Toadstool', 'uncommon', 120, 1, 'A drowsy mushroom. Syrup (or anyone with Potion Brewing nearby) turns it into Magic Powder; eaten, it puts you to sleep.'),
  sp('magicPowder', 'Magic Powder', 'rare', 180, 2, 'Sprinkle it on a space within 2: transforms compatible monsters (an Anti-Fairy becomes a healing fairy, a Buzz Blob a Cukeman and back), lights torches and Ember Seed trees.',
    { targeted: true, minRange: 1, maxRange: 2 }),
  sp('secretMedicine', 'Secret Medicine', 'legendary', 600, 1, 'Automatic: when the holder would fall, they are restored to full HP.', { kind: 'fairy', power: 100 }),
  sp('bottledBee', 'Bee', 'uncommon', 90, 1, 'Release it: a temporary Bee fights at your side this battle.'),
  sp('goldenBee', 'Golden Bee', 'epic', 320, 1, 'Release it: a temporary Golden Bee — much stronger — fights at your side this battle.'),
  sp('guardianAcorn', 'Guardian Acorn', 'rare', 220, 1, 'Damage you take is halved for 3 turns. Doesn\'t use your action.'),
  sp('pieceOfPower', 'Piece of Power', 'rare', 240, 1, 'Physical damage you deal is doubled for 3 turns. Doesn\'t use your action.'),
  sp('gashaSeed', 'Gasha Seed', 'uncommon', 100, 1, 'Plant it in adjacent Soft Soil. A Gasha tree grows over the next battles (victories, defeated enemies, new regions, quests) and bears a Gasha Nut.',
    { targeted: true, minRange: 1, maxRange: 1 }),
  sp('gashaNut', 'Gasha Nut', 'rare', 0, 1, 'Crack it open: a Mystery Ring, Rupees or a random treasure.'),
  sp('makuSeed', 'Maku Seed', 'legendary', 0, 1, 'The Maku Tree\'s gift: opens sealed places — Crystal Barriers within 3 fall, Wooden Stakes sink and the Maku Tree\'s light reveals hidden things.'),
  // ── Mystical seeds ──
  sp('emberSeed', 'Ember Seeds', 'common', 60, 5, 'Throw within 2: fire (8 damage, may Burn) — burns bushes and lights torches.', { targeted: true, minRange: 1, maxRange: 2, element: 'fire' }),
  sp('scentSeed', 'Scent Seeds', 'common', 60, 5, 'Throw within 3: beasts and monsters within 2 of it are lured there (pulled a space closer and Confused for a turn).', { targeted: true, minRange: 1, maxRange: 3 }),
  sp('pegasusSeed', 'Pegasus Seeds', 'common', 60, 5, '+3 MOV and +4 SPD for 2 turns (the Pegasus Ring doubles it). Doesn\'t use your action.'),
  sp('galeSeed', 'Gale Seeds', 'uncommon', 80, 5, 'A whirlwind carries you to a free space within 6 (a Mystical Seed Tree you have visited: anywhere).'),
  sp('mysterySeed', 'Mystery Seeds', 'common', 60, 5, 'Throw within 3: a random effect — fire, ice, lightning, a confusing cloud or nothing. Reveals the true shape of a possessed foe.', { targeted: true, minRange: 1, maxRange: 3 }),
  // ── The Strange Flute ──
  sp('strangeFlute', 'Strange Flute', 'rare', 300, 2, 'Calls your registered animal companion (Ricky, Dimitri or Moosh) to fight beside you this battle. Become friends with one and its own flute is yours.'),
];

/** Quest items: Pendants, Crystals, Instruments, Essences, keys, trading sequences and satchels. */
export const QUEST_ITEMS: { id: string; name: string; desc: string }[] = [
  // ── A Link to the Past ──
  { id: 'crystalMaiden', name: 'Crystal (Maiden)', desc: 'One of the seven Crystals holding a Maiden of the Sages\' line. All seven break the barrier on Ganon\'s Tower.' },
  // ── Link's Awakening ──
  { id: 'goldenLeaf', name: 'Golden Leaf', desc: 'One of the five Golden Leaves that open the way into Kanalet Castle.' },
  { id: 'dungeonKeyLA', name: 'Dungeon Key', desc: 'A Koholint dungeon key (Tail, Slime, Angler, Face, Bird).' },
  { id: 'stoneBeak', name: 'Stone Beak', desc: 'Fits an Owl Statue\'s beak: the owl gives a hint (hidden things within 4 are revealed).' },
  // ── Oracle of Seasons ──
  { id: 'essenceOfNature', name: 'Essence of Nature', desc: 'One of the eight Essences of Nature (Fertile Soil, Gift of Time, Bright Sun, Soothing Rain, Nurturing Warmth, Blowing Wind, Seed of Life, Changing Seasons). Each gives the army a little strength (+1 HP regen in forests); all eight open the Temple of Seasons.' },
  { id: 'starShapedOre', name: 'Star-Shaped Ore', desc: 'Dug up on the beach of Subrosia. The Subrosians love it.' },
  { id: 'ribbonOracle', name: 'Ribbon', desc: 'A Subrosian ribbon, a present for Rosa.' },
  { id: 'rustyBell', name: 'Rusty Bell', desc: 'Polish it in Subrosia\'s lava and it becomes the Pirate\'s Bell.' },
  { id: 'treasureMap', name: 'Treasure Map', desc: 'Shows where rings are buried.' },
  { id: 'redOre', name: 'Red Ore', desc: 'Smelted with Blue Ore into Hard Ore for the Noble Sword.' },
  { id: 'blueOre', name: 'Blue Ore', desc: 'Smelted with Red Ore into Hard Ore for the Noble Sword.' },
  // ── Oracle of Ages ──
  { id: 'essenceOfTime', name: 'Essence of Time', desc: 'One of the eight Essences of Time (Eternal Spirit, Ancient Wood, Echoing Howl, Burning Flame, Sacred Soil, Bereft Peak, Rolling Sea, Falling Star). Each gives the army a little time (+1 MP each turn); all eight open the Black Tower\'s heart.' },
  { id: 'zoraScale', name: 'Zora Scale', desc: 'Proof of the Zoras\' trust: entry to the Sea of Storms.' },
  { id: 'mermaidKey', name: 'Mermaid Key', desc: 'Opens the Mermaid\'s Cave.' },
  { id: 'libraryKey', name: 'Library Key', desc: 'Opens the Eyeglass Library.' },
  // ── Rings and seeds ──
  { id: 'mysteryRing', name: 'Mystery Ring', desc: 'An unappraised ring. Vasu identifies it for a few Rupees.' },
  { id: 'ringBox', name: 'Ring Box', desc: 'Holds rings outside the convoy: Vasu keeps unequipped rings in it for you.' },
  { id: 'seedSatchelOracle', name: 'Seed Satchel', desc: 'Holds up to 20 of each mystical seed (ammunition).' },
  { id: 'largeSeedSatchelOracle', name: 'Large Seed Satchel', desc: 'Holds up to 50 of each mystical seed.' },
  { id: 'hugeSeedSatchel', name: 'Huge Seed Satchel', desc: 'Holds up to 99 of each mystical seed.' },
  { id: 'windFishsEggOpen', name: 'The Egg Opens', desc: 'All eight Instruments of the Sirens played: the Wind Fish\'s Egg has cracked.' },
];

/** The trading sequences (event items, one in hand at a time per game). */
export const TRADING_SEQUENCES: Record<'la' | 'oos' | 'ooa', { id: string; name: string }[]> = {
  la: ['Yoshi Doll', 'Ribbon', 'Dog Food', 'Bananas', 'Stick', 'Honeycomb', 'Pineapple', 'Hibiscus', 'Letter', 'Broom', 'Fishing Hook', 'Necklace', 'Scale', 'Magnifying Lens']
    .map((name) => ({ id: `tradeLA_${name.replace(/[^A-Za-z]/g, '')}`, name })),
  oos: ['Cuccodex', 'Lon Lon Egg', 'Ghastly Doll', 'Iron Pot', 'Lava Soup', 'Goron Vase', 'Fish', 'Megaphone', 'Mushroom', 'Wooden Bird', 'Engine Grease', 'Phonograph']
    .map((name) => ({ id: `tradeOoS_${name.replace(/[^A-Za-z]/g, '')}`, name })),
  ooa: ['Poe Clock', 'Stationery', 'Stink Bag', 'Tasty Meat', 'Doggie Mask', 'Dumbbell', 'Cheesy Mustache', 'Funny Joke', 'Touching Book', 'Magic Oar', 'Sea Ukulele', 'Broken Sword']
    .map((name) => ({ id: `tradeOoA_${name.replace(/[^A-Za-z]/g, '')}`, name })),
};
for (const seq of Object.values(TRADING_SEQUENCES)) for (const t of seq) QUEST_ITEMS.push({ id: t.id, name: t.name, desc: 'A trading-sequence item. Someone on the march wants it — and has something to give in return.' });
