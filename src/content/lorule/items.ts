import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;

// Section 6's pack items. Milk, potions, bottles and the Golden Bee reuse their existing entries.
export const ITEMS: ItemDef[] = [
  it({ id: 'scootFruit', name: 'Scoot Fruit', kind: 'special', rarity: 'uncommon', price: 120, power: 0, uses: 1,
    desc: 'Escape a dungeon or encounter: the army slips away (the battle ends as a retreat, no casualties). Not against a region\'s boss.' }),
  it({ id: 'foulFruit', name: 'Foul Fruit', kind: 'special', rarity: 'uncommon', price: 100, power: 0, uses: 1,
    desc: 'A stench so terrible that every enemy within 2 is Stunned for a turn (bosses only Dazed).' }),
  it({ id: 'staminaScroll', name: 'Stamina Scroll', kind: 'special', rarity: 'epic', price: 900, power: 0, uses: 1,
    desc: 'Permanent: the reader gains +20% max STA and MP.' }),
  it({ id: 'greatSpinScroll', name: 'Great Spin Scroll', kind: 'learn', rarity: 'epic', price: 800, power: 0, uses: 1, teaches: 'greatSpin',
    desc: 'Skill enhancement: upgrades the Spin Attack to the Great Spin.' }),
];

/** Mother Maiamai's Nice upgrades (section 6): the item and what its Nice version does. */
export const NICE_ITEMS: Record<string, string> = {
  fairyBow: 'Nice Bow: three arrows in a spread (enemies next to the target take half damage)',
  boomerang: 'Nice Boomerang: up to three at once (+1 strike when attacking)',
  hookshot: 'Nice Hookshot: more damage (+5) and a longer pull',
  magicHammer: 'Nice Hammer: a bigger shockwave (enemies around the target take half damage, +4 damage)',
  bomb: 'Nice Bombs: a bigger blast (+1 radius) and more damage (+8)',
  fireRod: 'Nice Fire Rod: a larger flame (+5 damage, burns everyone next to the target)',
  iceRod: 'Nice Ice Rod: several ice projectiles (+1 strike when attacking)',
  tornadoRod: 'Nice Tornado Rod: larger wind (+4 damage) and a longer stun (2 turns)',
  sandRod: 'Nice Sand Rod: more pillars (in a cross), lasting longer (5 turns)',
};

// Section 6's quest items and materials (shared quest inventory).
export const QUEST_ITEMS = [
  { id: 'paintingGulley', name: "Gulley's Painting", desc: 'One of the Seven Sage Paintings: Gulley, trapped in a frame.' },
  { id: 'paintingOsfala', name: "Osfala's Painting", desc: 'One of the Seven Sage Paintings: Osfala, trapped in a frame.' },
  { id: 'paintingSeres', name: "Seres's Painting", desc: 'One of the Seven Sage Paintings: Seres, trapped in a frame.' },
  { id: 'paintingOren', name: "Oren's Painting", desc: 'One of the Seven Sage Paintings: Queen Oren, trapped in a frame.' },
  { id: 'paintingRosso', name: "Rosso's Painting", desc: 'One of the Seven Sage Paintings: Rosso, trapped in a frame.' },
  { id: 'paintingIrene', name: "Irene's Painting", desc: 'One of the Seven Sage Paintings: Irene, trapped in a frame.' },
  { id: 'paintingImpa', name: "Impa's Painting", desc: 'One of the Seven Sage Paintings: Impa, trapped in a frame.' },
  { id: 'paintingOfZelda', name: 'Painting of Princess Zelda', desc: 'Yuga\'s masterpiece. The princess is still in it.' },
  { id: 'masterOre', name: 'Master Ore', desc: 'A rare ore from treasure and special encounters: the Lorulean Forge tempers the Master Sword with it (Tempered, then Golden).' },
  { id: 'letterInABottle', name: 'Letter in a Bottle', desc: 'Washed up on a beach. It\'s addressed to someone in Lorule.' },
  { id: 'premiumMilk', name: 'Premium Milk', desc: 'The Milk Bar\'s finest. Somebody somewhere really wants it.' },
  { id: 'maiamaiToken', name: 'Maiamai Rescue Token', desc: 'A rescued Baby Maiamai, home with its mother.' },
  { id: 'triforceOfLorule', name: 'Triforce of Lorule', desc: 'The Triforce Lorule\'s royal family destroyed, restored at last.' },
  { id: 'smoothGem', name: 'Smooth Gem', desc: 'A perfectly smooth stone. Queen Oren lost it, and won\'t help anyone until it\'s back.' },
  // Monster and boss materials.
  { id: 'rupeeLikeGel', name: 'Rupee Like Gel', desc: 'Crafting material: greed.' },
  { id: 'bariMembrane', name: 'Bari Membrane', desc: 'Crafting material: insulation.' },
  { id: 'biriSpark', name: 'Biri Spark', desc: 'Crafting material: lightning.' },
  { id: 'gimosCore', name: 'Gimos Core', desc: 'Crafting material: elemental cores.' },
  { id: 'pengatorFeather', name: 'Pengator Feather', desc: 'Crafting material: ice.' },
  { id: 'devalantClaw', name: 'Devalant Claw', desc: 'Crafting material: sand.' },
  { id: 'margomillSegment', name: 'Margomill Segment', desc: 'Crafting material: wind.' },
  { id: 'gemesaurGemstone', name: 'Gemesaur Gemstone', desc: 'Crafting material: gem armour.' },
  { id: 'knucklemasterEye', name: 'Knucklemaster Eye', desc: 'Crafting material: insight.' },
  { id: 'stalblindSkull', name: 'Stalblind Skull', desc: 'Crafting material: undead guard.' },
  { id: 'zaganagaRoot', name: 'Zaganaga Root', desc: 'Crafting material: sand magic.' },
  { id: 'dharkstareIceCrystal', name: 'Dharkstare Ice Crystal', desc: 'Crafting material: ice magic.' },
  { id: 'grinexxMoltenShell', name: 'Grinexx Molten Shell', desc: 'Crafting material: lava armour.' },
  { id: 'yugasMagicPaint', name: "Yuga's Magic Paint", desc: 'Crafting material: painting magic.' },
];

/** The Seven Sage Paintings, by Sage. */
export const SAGE_PAINTING: Record<string, string> = {
  gulley: 'paintingGulley', osfala: 'paintingOsfala', seres: 'paintingSeres', oren: 'paintingOren', rosso: 'paintingRosso', irene: 'paintingIrene', impaALBW: 'paintingImpa',
};
