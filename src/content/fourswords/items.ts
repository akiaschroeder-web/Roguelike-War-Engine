import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;

/** Force Gems (section 7): a battle resource, worth this much Force Power. */
export const FORCE_GEMS: Record<string, { name: string; force: number }> = {
  smallGreen: { name: 'small green Force Gem', force: 1 },
  smallBlue: { name: 'small blue Force Gem', force: 5 },
  smallRed: { name: 'small red Force Gem', force: 20 },
  largeGreen: { name: 'large green Force Gem', force: 50 },
  largeBlue: { name: 'large blue Force Gem', force: 100 },
  largeRed: { name: 'large red Force Gem', force: 200 },
  giant: { name: 'Giant Force Gem', force: 500 },
};
/** Force Power thresholds (section 9). */
export const FORCE_THRESHOLDS: { at: number; id: string; name: string; desc: string }[] = [
  { at: 500, id: 'awakening', name: 'Force Awakening', desc: 'The four Links gain +2 STR and MAG.' },
  { at: 1000, id: 'enhancement', name: 'Force Enhancement', desc: 'The Links\' sword attacks and the Four Sword deal extra sacred damage (+4).' },
  { at: 1500, id: 'mastery', name: 'Force Mastery', desc: 'Cooperative attacks (formation attacks and Coordinated Strike) deal 30% more.' },
  { at: 2000, id: 'sacred', name: 'Sacred Awakening', desc: 'The Four Sword is fully empowered (+50% damage) and Sacred Seal is enabled.' },
];

// Section 7's pack items. Bombs, Red Potions and fairies reuse their entries.
export const ITEMS: ItemDef[] = [
  it({ id: 'bombL2', name: 'Bomb Lv. 2', kind: 'bomb', rarity: 'rare', price: 360, power: 16, uses: 3, minRange: 1, maxRange: 3, radius: 2,
    desc: 'Bigger bombs: thrown 1–3 spaces, 16 damage to every enemy within 2 of the target. Breaks cracked walls.' }),
  it({ id: 'giantBomb', name: 'Giant Bomb', kind: 'special', rarity: 'legendary', price: 1400, power: 30, uses: 1, targeted: true, minRange: 1, maxRange: 3,
    desc: 'Placed up to 3 away: after a 3-turn countdown (a Giant Bomb Zone marks its blast) it deals 30 to every enemy within 2. Breaks walls, mirrors and seals.' }),
  it({ id: 'forceFairy', name: 'Force Fairy', kind: 'special', rarity: 'epic', price: 700, power: 50, uses: 1,
    desc: 'Revives the most recent fallen ally beside the user with half their HP.' }),
  it({ id: 'fsLamp', name: 'Lamp', kind: 'special', rarity: 'uncommon', price: 260, power: 0, uses: 4,
    desc: 'The lantern\'s light: lifts the fog, reveals hidden enemies and traps within 4, and burns spiderwebs around the user. 4 uses.' }),
];

// Section 7's materials and quest items (shared quest inventory).
export const QUEST_ITEMS = [
  { id: 'shadowEssence', name: 'Shadow Essence', desc: 'Crafting material: dark equipment.' },
  { id: 'windEssence', name: 'Wind Essence', desc: 'Crafting material: wind equipment.' },
  { id: 'terrorpinShell', name: 'Terrorpin Shell', desc: 'Crafting material: defensive equipment.' },
  { id: 'geldmanSand', name: 'Geldman Sand', desc: 'Crafting material: concealment equipment.' },
  { id: 'deluZolGel', name: 'Delu Zol Gel', desc: 'Crafting material: regenerative.' },
  { id: 'deraZolGel', name: 'Dera Zol Gel', desc: 'Crafting material: elemental.' },
  { id: 'gouensMoltenCore', name: "Gouen's Molten Core", desc: 'Crafting material: legendary fire.' },
  { id: 'frostareCrystal', name: 'Frostare Crystal', desc: 'Crafting material: legendary ice.' },
  { id: 'silverKey', name: 'Silver Key', desc: 'Opens a sealed door in Vaati\'s Palace.' },
  { id: 'goldenKey', name: 'Golden Key', desc: 'Opens the last door before a region boss.' },
  { id: 'herosKeyQuest', name: "Hero's Key (quest)", desc: 'The key to the Four Sword Sanctuary.' },
  { id: 'maidenCrystal', name: 'Shrine Maiden Crystal', desc: 'A Shrine Maiden sealed in crystal. The Shrine Maiden Sanctuary can free her.' },
  { id: 'royalJewel', name: 'Royal Jewel', desc: 'One of the five Royal Jewels. Set on a Royal Jewel Pedestal, it opens the way on.' },
  { id: 'shadowMirrorQuest', name: 'Dark Mirror shard', desc: 'A shard of the mirror that made Shadow Link.' },
  { id: 'tridentQuest', name: 'Trident of Power (sealed)', desc: 'The trident in the Pyramid, before Ganon took it.' },
];
