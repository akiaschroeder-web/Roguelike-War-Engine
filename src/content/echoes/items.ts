import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;
const smoothie = (id: string, name: string, desc: string, price = 120): ItemDef =>
  ({ id, name, kind: 'special', rarity: 'uncommon', price, power: 0, uses: 1, desc: `${desc} A smoothie: drink it in battle (doesn't use your action).` });

/** Section 12: the smoothie ingredients (quest bag, like the Wild ingredients) and what each is for. */
export const SMOOTHIE_INGREDIENTS: Record<string, string> = {
  refreshingGrapes: 'HP', electroApple: 'electric resistance', floralNectar: 'Swordfighter Energy', bubbleKelp: 'underwater endurance',
  rocktato: 'defence', toughMango: 'defence', warmPepper: 'cold resistance', chillyCactus: 'heat resistance', riverhorse: 'swimming',
  radiantButter: 'light', twistedPumpkin: 'Wind-Up Energy', goldenEgg: 'strong recovery',
};
/** Existing materials that make a smoothie's second ingredient (the Wild era's basics and monster parts). */
export const SMOOTHIE_FILLERS = ['freshMilk', 'rockSalt', 'bokoblinFang', 'moblinFang', 'bokoblinGuts', 'moblinGuts', 'lizalfosTail', 'chuchuJelly', 'caneSugar', 'goatButter'];
/** Smoothie id -> its key ingredients (any one of them plus any second ingredient). Unfortunate: two fillers. */
export const SMOOTHIE_RECIPES: Record<string, string[]> = {
  refreshingSmoothie: ['refreshingGrapes'], energySmoothie: ['floralNectar'], toughSmoothie: ['rocktato', 'toughMango'], electroSmoothie: ['electroApple'],
  warmSmoothie: ['warmPepper'], chillySmoothie: ['chillyCactus'], bubbleSmoothie: ['bubbleKelp'], rapidSmoothie: ['riverhorse'], radiantSmoothie: ['radiantButter'],
  twistySmoothie: ['twistedPumpkin'], goldenSmoothie: ['goldenEgg'], unfortunateSmoothie: [],
};
export const SMOOTHIE_FEE = 20;

// Section 11's pack items and section 12's smoothies.
export const ITEMS: ItemDef[] = [
  it({ id: 'bombsOfMight', name: 'Bombs of Might', kind: 'bomb', rarity: 'epic', price: 700, power: 18, uses: 3, minRange: 1, maxRange: 4, radius: 1, element: 'fire',
    desc: 'Energy-powered explosives: 18 damage within 1 of the target (in Swordfighter Form +6, for 3 Energy). Three throws.' }),
  it({ id: 'clockworkKey', name: 'Clockwork Key', kind: 'special', rarity: 'rare', price: 300, power: 0, uses: 3, targeted: true, minRange: 1, maxRange: 1,
    desc: 'Rewinds an adjacent Automaton (or the user): its Wind-Up Energy is full again. Three uses.' }),
  it({ id: 'monsterStoneKit', name: 'Monster Stone Kit', kind: 'special', rarity: 'uncommon', price: 200, power: 0, uses: 2, targeted: true, minRange: 1, maxRange: 1,
    desc: 'Mechanical repair: an adjacent Automaton (or the user, if it is one) recovers 40% HP. Two uses.' }),
  smoothie('refreshingSmoothie', 'Refreshing Smoothie', 'Recovers 20 HP (not for Automatons).'),
  smoothie('energySmoothie', 'Energy Smoothie', 'Restores 20 Swordfighter Energy.'),
  smoothie('toughSmoothie', 'Tough Smoothie', '+5 DEF for 3 turns.'),
  smoothie('electroSmoothie', 'Electro Smoothie', 'Lightning damage halved and no Shock for 3 turns.'),
  smoothie('warmSmoothie', 'Warm Smoothie', 'Cold resistance: ice damage halved and no Freeze for 3 turns.'),
  smoothie('chillySmoothie', 'Chilly Smoothie', 'Heat resistance: fire damage halved and no Burns for 3 turns.'),
  smoothie('bubbleSmoothie', 'Bubble Smoothie', 'Underwater endurance: the drinker can swim for 3 turns.'),
  smoothie('rapidSmoothie', 'Rapid Smoothie', '+2 MOV for 2 turns.'),
  smoothie('radiantSmoothie', 'Radiant Smoothie', 'Lights the darkness: the fog lifts and hidden enemies within 5 are revealed.'),
  smoothie('twistySmoothie', 'Twisty Smoothie', 'Restores 25 Wind-Up Energy to the drinker, or to an Automaton next to it.'),
  smoothie('goldenSmoothie', 'Golden Smoothie', 'Strong recovery: 40 HP and 30 Swordfighter Energy.', 300),
  smoothie('unfortunateSmoothie', 'Unfortunate Smoothie', 'Minimal recovery: 3 HP. It tastes of regret.', 20),
];

// Section 12's ingredients, collectibles and quest items (shared quest inventory).
export const QUEST_ITEMS = [
  ...Object.entries(SMOOTHIE_INGREDIENTS).map(([id, use]) => ({ id, name: id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), desc: `Smoothie ingredient: ${use}.` })),
  { id: 'mightCrystal', name: 'Might Crystal', desc: 'Raises Swordfighter max Energy (+5 each) and the Mighty weapons (Lueburry\'s Laboratory: +1 Might).' },
  { id: 'stampCard', name: 'Stamp Card', desc: 'Records the Stamp Stations you have found. Ten stamps fill a card; the Stamp Rally Station trades full cards for rewards.' },
  { id: 'stamp', name: 'Stamp', desc: 'A stamp from a Stamp Station.' },
  { id: 'monsterStone', name: 'Monster Stone', desc: 'Repairs Automatons at Dampé\'s Studio.' },
  { id: 'musicBox', name: 'Music Box', desc: 'Automaton material.' },
  { id: 'heirloomKatana', name: 'Heirloom Katana', desc: 'Automaton material (a Roboblin needs one).' },
  { id: 'goldenFan', name: 'Golden Fan', desc: 'Automaton material (a Goldfinch needs one).' },
  { id: 'prismaticMusicBox', name: 'Prismatic Music Box', desc: 'Advanced Automaton material.' },
  { id: 'powerPrimeEnergy', name: 'Power Prime Energy', desc: 'One of the three Prime Energies, held by Null.' },
  { id: 'wisdomPrimeEnergy', name: 'Wisdom Prime Energy', desc: 'One of the three Prime Energies, held by Null.' },
  { id: 'couragePrimeEnergy', name: 'Courage Prime Energy', desc: 'One of the three Prime Energies, held by Null.' },
];
