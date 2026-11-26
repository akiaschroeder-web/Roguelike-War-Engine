import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;

// Potions and pack items (sections 10 and 18). The Red Potion is the Heart Potion;
// water, sacred water, fairies and Empty Bottles are existing entries.
export const ITEMS: ItemDef[] = [
  // ── Potions ──
  it({ id: 'heartPotionPlus', name: 'Heart Potion+', kind: 'special', rarity: 'rare', price: 300, power: 0, uses: 1, desc: 'Fully restores HP.' }),
  it({ id: 'heartPotionPlusPlus', name: 'Heart Potion++', kind: 'special', rarity: 'epic', price: 550, power: 0, uses: 2, desc: 'Fully restores HP. Two doses.' }),
  it({ id: 'staminaPotionSS', name: 'Stamina Potion (Skyloft)', kind: 'special', rarity: 'uncommon', price: 160, power: 20, uses: 1, desc: '+20 stamina, and techniques and Dash cost half stamina for 3 turns.' }),
  it({ id: 'staminaPotionPlus', name: 'Stamina Potion+', kind: 'special', rarity: 'rare', price: 320, power: 0, uses: 1, desc: 'Techniques and Dash cost no stamina for 3 turns.' }),
  it({ id: 'airPotion', name: 'Air Potion', kind: 'special', rarity: 'uncommon', price: 120, power: 0, uses: 1, desc: 'Breathe underwater (swim) for 5 turns.' }),
  it({ id: 'airPotionPlus', name: 'Air Potion+', kind: 'special', rarity: 'rare', price: 220, power: 0, uses: 1, desc: 'Breathe underwater (swim) for 10 turns.' }),
  it({ id: 'revitalizingPotion', name: 'Revitalizing Potion', kind: 'special', rarity: 'uncommon', price: 150, power: 15, uses: 1, desc: 'Restores 15 HP and 20 shield durability.' }),
  it({ id: 'revitalizingPotionPlus', name: 'Revitalizing Potion+', kind: 'special', rarity: 'rare', price: 280, power: 25, uses: 1, desc: 'Restores 25 HP and fully repairs your shield.' }),
  it({ id: 'revitalizingPotionPlusPlus', name: 'Revitalizing Potion++', kind: 'special', rarity: 'epic', price: 600, power: 0, uses: 2, desc: 'Fully restores HP and your shield. Two doses.' }),
  it({ id: 'guardianPotion', name: 'Guardian Potion', kind: 'special', rarity: 'rare', price: 300, power: 0, uses: 1, desc: 'Damage you take is halved for 3 turns.' }),
  it({ id: 'guardianPotionPlus', name: 'Guardian Potion+', kind: 'special', rarity: 'epic', price: 550, power: 0, uses: 1, desc: 'You take no damage until your next turn.' }),
  it({ id: 'mushroomSpores', name: 'Mushroom Spores', kind: 'special', rarity: 'common', price: 60, power: 0, uses: 1, desc: 'Plant and fungus allies within 2 (Kikwi, Deku, Koroks, Babas) recover 15 HP and gain +2 DEF for 2 turns.' }),
  it({ id: 'glitteringSpores', name: 'Glittering Spores', kind: 'stun', rarity: 'rare', price: 220, power: 0, uses: 1, minRange: 1, maxRange: 3, radius: 1, desc: 'A glittering cloud: stuns enemies in a small area.' }),
  it({ id: 'hotPumpkinSoup', name: 'Hot Pumpkin Soup', kind: 'special', rarity: 'uncommon', price: 120, power: 20, uses: 1, desc: '+20 HP and +10 stamina — if you drink it in the first 5 turns. After that it\'s Cold Pumpkin Soup.' }),
  it({ id: 'coldPumpkinSoup', name: 'Cold Pumpkin Soup', kind: 'heal', rarity: 'common', price: 40, power: 10, uses: 1, desc: 'Restores 10 HP.' }),
  // ── Pack items ──
  it({ id: 'staminaFruit', name: 'Stamina Fruit', kind: 'special', rarity: 'common', price: 50, power: 15, uses: 1, desc: '+15 stamina.' }),
  it({ id: 'remlitTreat', name: 'Remlit Treat', kind: 'special', rarity: 'common', price: 40, power: 0, uses: 1, targeted: true, minRange: 1, maxRange: 2, desc: 'Pacifies a hostile Remlit (it fights for you this battle); other beasts are distracted (Confused). Animals are keener to join you afterwards.' }),
  it({ id: 'froakSac', name: 'Froak Sac', kind: 'bomb', rarity: 'uncommon', price: 120, power: 10, uses: 2, minRange: 1, maxRange: 3, radius: 1, desc: 'A floating explosive mine (10 damage in a small blast).' }),
  it({ id: 'ampilusShell', name: 'Ampilus Shell', kind: 'special', rarity: 'rare', price: 250, power: 0, uses: 1, desc: 'Your next three physical attacks are electrified (lightning, may Shock).' }),
  it({ id: 'furnixFeather', name: 'Furnix Feather', kind: 'special', rarity: 'rare', price: 250, power: 0, uses: 1, desc: 'Temporary flight for 2 turns.' }),
  it({ id: 'quadroBabaSeed', name: 'Quadro Baba Seed', kind: 'special', rarity: 'rare', price: 220, power: 0, uses: 1, targeted: true, minRange: 1, maxRange: 2, desc: 'Plants a stationary Quadro Baba that fights for you this battle.' }),
  it({ id: 'sentrobeDrone', name: 'Sentrobe Drone', kind: 'special', rarity: 'epic', price: 450, power: 14, uses: 1, targeted: true, minRange: 2, maxRange: 6, desc: 'A tracking drone: 14 damage to the target and 7 to enemies next to it. Never misses.' }),
  it({ id: 'guardianSignal', name: 'Guardian Signal', kind: 'special', rarity: 'epic', price: 400, power: 0, uses: 1, targeted: true, minRange: 1, maxRange: 5, desc: 'Marks an enemy for 3 turns: allies get +10 Hit against it, and allied Guardians +3 MOV pursuing it.' }),
  it({ id: 'magmanosCore', name: 'Magmanos Core', kind: 'special', rarity: 'epic', price: 400, power: 0, uses: 1, desc: 'For 3 turns: immune to fire damage, and lava heals you instead of burning you.' }),
  it({ id: 'timeshiftFragment', name: 'Timeshift Fragment', kind: 'special', rarity: 'legendary', price: 700, power: 0, uses: 1, targeted: true, minRange: 1, maxRange: 4, desc: 'Opens a temporary ancient-era Timeshift field (radius 2) for 3 turns.' }),
  it({ id: 'sacredFlame', name: 'Sacred Flame', kind: 'special', rarity: 'legendary', price: 700, power: 0, uses: 1, desc: 'Your weapon deals sacred (light) damage for 3 turns: +30% against demons and the undead.' }),
  it({ id: 'demonCrystal', name: 'Demon Crystal', kind: 'special', rarity: 'legendary', price: 700, power: 15, uses: 1, desc: 'Restores 15 MP; dark magic deals +25% damage for 2 turns.' }),
  // ── Carrying capacity ──
  it({ id: 'adventurePouch', name: 'Adventure Pouch Upgrade', kind: 'special', rarity: 'epic', price: 500, power: 0, uses: 1, desc: 'Use outside battle: +1 pack slot for this unit (up to 10).' }),
];

/** Crafting materials and insects (section 12). They live in the quest inventory, not in packs. */
export const MATERIALS: { id: string; name: string; rarity: string; use: string; insect?: boolean }[] = [
  { id: 'hornetLarvae', name: 'Hornet Larvae', rarity: 'common', use: 'wooden shields and light tools' },
  { id: 'birdFeather', name: 'Bird Feather', rarity: 'common', use: 'bows and aerial gear' },
  { id: 'tumbleweed', name: 'Tumbleweed', rarity: 'common', use: 'slingshots and ammo containers' },
  { id: 'lizardTail', name: 'Lizard Tail', rarity: 'uncommon', use: 'durable weapons and armor' },
  { id: 'eldinOre', name: 'Eldin Ore', rarity: 'uncommon', use: 'iron shields and heavy weapons' },
  { id: 'ancientFlower', name: 'Ancient Flower', rarity: 'rare', use: 'ancient devices and Beetle upgrades' },
  { id: 'amberRelic', name: 'Amber Relic', rarity: 'common', use: 'reinforcement' },
  { id: 'duskRelic', name: 'Dusk Relic', rarity: 'rare', use: 'sacred equipment and magic tools' },
  { id: 'jellyBlob', name: 'Jelly Blob', rarity: 'common', use: 'flexible armor and tool parts' },
  { id: 'monsterClaw', name: 'Monster Claw', rarity: 'common', use: 'physical weapon upgrades' },
  { id: 'monsterHorn', name: 'Monster Horn', rarity: 'uncommon', use: 'heavy weapons and ammo containers' },
  { id: 'ornamentalSkull', name: 'Ornamental Skull', rarity: 'uncommon', use: 'undead and defensive gear' },
  { id: 'evilCrystal', name: 'Evil Crystal', rarity: 'rare', use: 'dark magic and advanced gear' },
  { id: 'blueBirdFeather', name: 'Blue Bird Feather', rarity: 'rare', use: 'high-level bows and aerial gear' },
  { id: 'goldenSkull', name: 'Golden Skull', rarity: 'epic', use: 'high-tier armor and weapons' },
  { id: 'goddessPlume', name: 'Goddess Plume', rarity: 'epic', use: 'advanced sacred crafting (a plume kept for the forge rather than worn)' },
  // Insects
  { id: 'faronGrasshopper', name: 'Faron Grasshopper', rarity: 'common', use: 'Stamina and Guardian Potions', insect: true },
  { id: 'woodlandRhinoBeetle', name: 'Woodland Rhino Beetle', rarity: 'common', use: 'Revitalizing Potions', insect: true },
  { id: 'dekuHornet', name: 'Deku Hornet', rarity: 'common', use: 'Heart and Revitalizing Potions', insect: true },
  { id: 'skyloftMantis', name: 'Skyloft Mantis', rarity: 'common', use: 'Air and Revitalizing Potions', insect: true },
  { id: 'volcanicLadybug', name: 'Volcanic Ladybug', rarity: 'common', use: 'Stamina Potions', insect: true },
  { id: 'blessedButterfly', name: 'Blessed Butterfly', rarity: 'uncommon', use: 'Heart and Guardian Potions', insect: true },
  { id: 'lanayruAnt', name: 'Lanayru Ant', rarity: 'common', use: 'Air and Revitalizing Potions', insect: true },
  { id: 'sandCicada', name: 'Sand Cicada', rarity: 'common', use: 'Heart and Revitalizing Potions', insect: true },
  { id: 'gerudoDragonfly', name: 'Gerudo Dragonfly', rarity: 'uncommon', use: 'Stamina and Revitalizing Potions', insect: true },
  { id: 'eldinRoller', name: 'Eldin Roller', rarity: 'uncommon', use: 'Heart and Guardian Potions', insect: true },
  { id: 'skyStagBeetle', name: 'Sky Stag Beetle', rarity: 'rare', use: 'Air and Stamina Potions', insect: true },
  { id: 'starryFirefly', name: 'Starry Firefly', rarity: 'rare', use: 'Guardian Potions', insect: true },
];

/** Where insects are caught after battle. */
export const INSECTS_BY_REGION: Record<string, string[]> = {
  skyloft: ['skyloftMantis', 'skyStagBeetle', 'starryFirefly'], theSky: ['skyStagBeetle', 'skyloftMantis'], faronWoodsSS: ['faronGrasshopper', 'woodlandRhinoBeetle', 'dekuHornet', 'blessedButterfly'],
  eldinVolcano: ['volcanicLadybug', 'eldinRoller'], lanayruDesert: ['lanayruAnt', 'sandCicada', 'gerudoDragonfly'], lanayruSandSea: ['sandCicada', 'lanayruAnt'],
  ancientCistern: ['blessedButterfly', 'dekuHornet'], fireSanctuary: ['volcanicLadybug', 'eldinRoller'], sealedGrounds: ['blessedButterfly', 'faronGrasshopper'],
  skyKeep: ['starryFirefly', 'skyStagBeetle'], demonsRealm: ['starryFirefly'],
};

/** Quest items and sacred artifacts (section 14, plus the flames, song parts and capacity upgrades). */
export const QUEST_ITEMS: { id: string; name: string; desc: string }[] = [
  ...MATERIALS.map((m) => ({ id: m.id, name: m.name, desc: `${m.insect ? 'Insect' : 'Treasure'} for crafting: ${m.use}.` })),
  { id: 'emeraldTablet', name: 'Emerald Tablet', desc: 'Opens the way to Faron Woods.' },
  { id: 'rubyTablet', name: 'Ruby Tablet', desc: 'Opens the way to Eldin Volcano.' },
  { id: 'amberTablet', name: 'Amber Tablet', desc: 'Opens the way to the Lanayru Desert.' },
  { id: 'stoneOfTrials', name: 'Stone of Trials', desc: 'Raises the Sky Keep out of the clouds.' },
  { id: 'gratitudeCrystal', name: 'Gratitude Crystal', desc: 'Earned by helping people (side quests). Batreaux trades them for rewards and permanent upgrades.' },
  { id: 'lifeTreeSeedling', name: 'Life Tree Seedling', desc: 'Plant it in the ancient past and it will grow into a Life Tree.' },
  { id: 'lifeTreeFruit', name: 'Life Tree Fruit', desc: 'Cures severe magical illness. The Thunder Dragon needs one.' },
  { id: 'ancientSeaChart', name: 'Ancient Sea Chart', desc: 'Charts the Lanayru Sand Sea.' },
  { id: 'cawlinsLetter', name: "Cawlin's Letter", desc: 'A love letter that may or may not reach its recipient.' },
  { id: 'rattle', name: 'Rattle', desc: 'A baby\'s rattle, found on a rooftop in Skyloft.' },
  { id: 'crystalBall', name: 'Crystal Ball', desc: 'For the fortune teller, Sparrot.' },
  { id: 'partyWheel', name: 'Party Wheel', desc: 'A ticket to the Fun Fun Island challenge.' },
  { id: 'beedlesInsectCage', name: "Beedle's Insect Cage", desc: 'Beedle wants a rare insect for his son.' },
  { id: 'tadtone', name: 'Tadtone', desc: 'A musical tadpole from Lake Floria. Collect them to finish the Water Dragon\'s song.' },
  { id: 'spiritVessel', name: 'Spirit Vessel', desc: 'Holds the Sacred Tears of a Silent Realm trial.' },
  { id: 'sacredTearItem', name: 'Sacred Tear', desc: 'A tear of the goddess, gathered in the Silent Realm.' },
  { id: 'windmillPropeller', name: 'Windmill Propeller', desc: 'Repairs Skyloft\'s lighthouse windmill.' },
  { id: 'powerGenerator', name: 'Power Generator', desc: 'Reactivates large ancient constructs and powers Ancient Power Sockets.' },
  { id: 'timeshiftStoneItem', name: 'Timeshift Stone', desc: 'A portable stone that activates an ancient-era field.' },
  { id: 'goldenCarving', name: 'Golden Carving', desc: 'Key to the Lanayru Mining Facility.' },
  { id: 'dragonSculpture', name: 'Dragon Sculpture', desc: 'Key to the Earth Temple.' },
  { id: 'ancientCircuit', name: 'Ancient Circuit', desc: 'Key to the Sandship\'s engine.' },
  { id: 'blessedIdol', name: 'Blessed Idol', desc: 'Key to the Ancient Cistern.' },
  { id: 'squidCarving', name: 'Squid Carving', desc: 'Key to the Sandship\'s hold.' },
  { id: 'mysteriousCrystals', name: 'Mysterious Crystals', desc: 'Key to the Fire Sanctuary.' },
  // The sword's evolution
  { id: 'faroresFlame', name: "Farore's Flame", desc: 'Forges the Goddess Sword into the Goddess Longsword.' },
  { id: 'nayrusFlame', name: "Nayru's Flame", desc: 'Forges the Goddess Longsword into the Goddess White Sword.' },
  { id: 'dinsFlame', name: "Din's Flame", desc: 'Forges the Goddess White Sword into the Master Sword.' },
  { id: 'hyliasBlessing', name: "Hylia's Blessing", desc: 'Blesses the Master Sword: it becomes the True Master Sword.' },
  // The Song of the Hero (the three Dragons and Levias each teach a part)
  { id: 'songPartFaron', name: 'Song of the Hero: Faron\'s Part', desc: 'The Water Dragon\'s part of the Song of the Hero.' },
  { id: 'songPartEldin', name: 'Song of the Hero: Eldin\'s Part', desc: 'The Fire Dragon\'s part of the Song of the Hero.' },
  { id: 'songPartLanayru', name: 'Song of the Hero: Lanayru\'s Part', desc: 'The Thunder Dragon\'s part of the Song of the Hero.' },
  { id: 'songPartLevias', name: 'Song of the Hero: Levias\'s Part', desc: 'The sky spirit\'s part of the Song of the Hero.' },
  { id: 'songOfTheHeroComplete', name: 'Song of the Hero', desc: 'The whole song. Anyone with the Goddess\'s Harp can now play it in battle.' },
  // Capacity upgrades (existing Bomb Bag, Quiver and wallet tiers are reused where they exist)
  { id: 'seedSatchel', name: 'Seed Satchel', desc: 'More Deku Seeds: slingshot attacks +1 Might.' },
  { id: 'mediumSeedSatchel', name: 'Medium Seed Satchel', desc: '+20 Deku Seeds: slingshot attacks +1 more Might.' },
  { id: 'largeSeedSatchel', name: 'Large Seed Satchel', desc: '+30 Deku Seeds: slingshot attacks +1 more Might.' },
  { id: 'extraWallet', name: 'Extra Wallet', desc: 'More room for Rupees: battle Rupee rewards +10%.' },
  { id: 'tycoonWallet', name: 'Tycoon Wallet', desc: 'A wallet for 9,000 Rupees: battle Rupee rewards +25%.' },
];
