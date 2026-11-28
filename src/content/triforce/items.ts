import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;

// Section 4's pack tools. Items need no art.
export const ITEMS: ItemDef[] = [
  it({ id: 'gripshot', name: 'Gripshot', kind: 'tool', rarity: 'epic', price: 900, power: 0, uses: 1,
    desc: 'A grappling claw (the Gripshot action): pull an ally, an enemy (size 2 or less) or yourself toward a Gripshot Target, up to 4 spaces. Never used up.' }),
  it({ id: 'doppelDoll', name: 'Doppel Doll', kind: 'special', rarity: 'rare', price: 300, power: 0, uses: 1,
    desc: 'Summons a wooden Doppel of the user next to them for 3 turns: half the user\'s HP and 70% of their STR, MAG and SKL, under your control. A summon, not a recruit.' }),
];

// Section 5's crafting materials (shared quest inventory). Gold Dust and Fairy Dust are the existing resources (a pack
// item and the army's Fairy Dust); the Demon Fossil is the Spirit Tracks treasure.
export const QUEST_ITEMS = [
  { id: 'blinBling', name: 'Blin Bling', desc: 'Crafting material from Moblins: a gaudy ornament.' },
  { id: 'tektiteShell', name: 'Tektite Shell', desc: 'Crafting material from Tektites: a springy carapace.' },
  { id: 'sweetShroom', name: 'Sweet Shroom', desc: 'Crafting material from the Woodlands: it smells of candy.' },
  { id: 'freshKelp', name: 'Fresh Kelp', desc: 'Crafting material from the Riverside.' },
  { id: 'fluffyFuzz', name: 'Fluffy Fuzz', desc: 'Crafting material from aquatic encounters.' },
  { id: 'monsterGutsTF', name: 'Monster Guts', desc: 'Crafting material from monsters. Madame Couture does not ask.' },
  { id: 'lavaDrop', name: 'Lava Drop', desc: 'Crafting material from the Volcano: still warm.' },
  { id: 'snowflakeTF', name: 'Snowflake', desc: 'Crafting material from the Ice Cavern: it never melts.' },
  { id: 'freezardWater', name: 'Freezard Water', desc: 'Crafting material from the Ice Cavern.' },
  { id: 'stalSkull', name: 'Stal Skull', desc: 'Crafting material from undead encounters.' },
  { id: 'silverThread', name: 'Silver Thread', desc: 'Crafting material from the Fortress.' },
  { id: 'ancientFin', name: 'Ancient Fin', desc: 'Crafting material from aquatic bosses.' },
  { id: 'exquisiteLace', name: 'Exquisite Lace', desc: 'Crafting material from palace encounters.' },
  { id: 'divineWhiskers', name: 'Divine Whiskers', desc: 'Crafting material from the Sky Realm.' },
  { id: 'fabledButterfly', name: 'Fabled Butterfly', desc: 'Crafting material from rare encounters.' },
  { id: 'rareMetal', name: 'Rare Metal', desc: 'Crafting material from elite encounters.' },
  { id: 'friendlyToken', name: 'Friendly Token', desc: 'Crafting material for completing cooperative battle objectives.' },
];

/** Every crafting material: quest items, plus Gold Dust (a pack item) and Fairy Dust (the army's resource). */
export const MATERIALS = [...QUEST_ITEMS.map((q) => q.id), 'demonFossil', 'goldDust', 'fairyDust'];
export const RARE_MATERIALS = ['fabledButterfly', 'rareMetal', 'divineWhiskers', 'exquisiteLace'];

export interface Recipe { rupees: number; mats: Record<string, number> }
const r = (rupees: number, mats: Record<string, number>): Recipe => ({ rupees, mats });

/** Madame Couture's Boutique: every outfit, and the four existing outfits she can also sew. */
export const RECIPES: Record<string, Recipe> = {
  bigBombOutfit: r(300, { blinBling: 1, lavaDrop: 1 }),
  boomeranger: r(300, { tektiteShell: 2, sweetShroom: 1 }),
  cactoClothes: r(300, { sweetShroom: 1, monsterGutsTF: 2 }),
  cheerOutfit: r(300, { fluffyFuzz: 2, friendlyToken: 1 }),
  cheetahCostume: r(500, { blinBling: 2, rareMetal: 1, fluffyFuzz: 1 }),
  cozyParka: r(300, { snowflakeTF: 2, fluffyFuzz: 1 }),
  cursedTights: r(500, { demonFossil: 1, stalSkull: 2, silverThread: 1 }),
  semiCursedTights: r(300, { stalSkull: 1, silverThread: 1 }),
  dapperSpinnerKit: r(300, { silverThread: 1, tektiteShell: 1 }),
  dunewalkerDuds: r(200, { goldDust: 1, monsterGutsTF: 1 }),
  energyGear: r(300, { rareMetal: 1, freezardWater: 1 }),
  fireBlazer: r(300, { lavaDrop: 2, demonFossil: 1 }),
  goronGarb: r(500, { lavaDrop: 2, rareMetal: 1, demonFossil: 1 }),
  gustGarb: r(300, { sweetShroom: 2, fluffyFuzz: 1 }),
  hammerwear: r(300, { rareMetal: 1, blinBling: 1 }),
  jackOfHearts: r(300, { monsterGutsTF: 2, sweetShroom: 1 }),
  kokiriClothes: r(300, { sweetShroom: 2, tektiteShell: 1 }),
  ladysEnsemble: r(800, { exquisiteLace: 2, divineWhiskers: 1, silverThread: 1 }),
  legendaryDress: r(800, { exquisiteLace: 1, fabledButterfly: 1, fairyDust: 1 }),
  lightArmor: r(300, { rareMetal: 1, snowflakeTF: 1 }),
  luckyLoungewear: r(300, { fluffyFuzz: 1, fabledButterfly: 1 }),
  ninjaGi: r(500, { silverThread: 1, blinBling: 1, stalSkull: 1 }),
  queenOfHearts: r(800, { exquisiteLace: 1, fairyDust: 1, divineWhiskers: 1 }),
  roboWear: r(300, { rareMetal: 2, freezardWater: 1 }),
  rupeeRegalia: r(500, { goldDust: 1, exquisiteLace: 1, blinBling: 2 }),
  serpentsToga: r(500, { freshKelp: 2, ancientFin: 1 }),
  showstopper: r(300, { exquisiteLace: 1, friendlyToken: 1 }),
  spinAttackAttire: r(300, { tektiteShell: 1, monsterGutsTF: 1 }),
  swordSuit: r(500, { rareMetal: 1, stalSkull: 1, silverThread: 1 }),
  swordMasterSuit: r(800, { rareMetal: 2, divineWhiskers: 1, demonFossil: 1 }),
  timelessTunic: r(300, { freshKelp: 1, sweetShroom: 1, friendlyToken: 1 }),
  tingleTights: r(500, { fluffyFuzz: 1, fabledButterfly: 1 }),
  torrentRobe: r(300, { freshKelp: 2, freezardWater: 1 }),
  triSuit: r(800, { friendlyToken: 2, divineWhiskers: 1, fabledButterfly: 1 }),
  // The existing outfits (their entries are the basis for TFH's matching outfits).
  herosClothes: r(300, { sweetShroom: 1, friendlyToken: 1 }),
  zoraArmor: r(500, { freshKelp: 1, ancientFin: 1 }),
  fierceDeityBody: r(800, { demonFossil: 1, divineWhiskers: 1, rareMetal: 1 }),
  linebecksCoat: r(300, { freshKelp: 1, goldDust: 1 }),
};
