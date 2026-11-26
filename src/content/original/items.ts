import type { ItemDef } from '../../engine/types';

const it = (d: ItemDef): ItemDef => d;

// Section 7 pack items. Bombs, Fairies and potions are the existing entries. The doc's
// crafting materials have a direct use instead (there is no crafting in this pack).
export const ITEMS: ItemDef[] = [
  it({ id: 'silverArrow', name: 'Silver Arrow', kind: 'special', rarity: 'legendary', price: 700, power: 0, uses: 2,
    desc: 'Nock it: for 3 turns your bow attacks deal double damage to demons, and a hit on Ganon strips his invisibility for 3 turns.' }),
  it({ id: 'enemyBait', name: 'Food (Enemy Bait)', kind: 'special', rarity: 'common', price: 40, power: 0, uses: 1, targeted: true, minRange: 1, maxRange: 3,
    desc: 'Monsters within 2 of where it lands are distracted (Confused); Goriyas there are satisfied and stop fighting for 2 turns. Feeds a Hungry Goriya.' }),
  it({ id: 'blueLifeMedicine', name: 'Blue Life Medicine', kind: 'special', rarity: 'rare', price: 300, power: 0, uses: 1, desc: 'Fully restores HP.' }),
  it({ id: 'redLifeMedicine', name: 'Red Life Medicine', kind: 'special', rarity: 'epic', price: 520, power: 0, uses: 2, desc: 'Fully restores HP. Two doses.' }),
  it({ id: 'magicalClock', name: 'Magical Clock', kind: 'special', rarity: 'legendary', price: 650, power: 0, uses: 1, desc: 'Time stops: ordinary enemies (not bosses) can\'t act for one round.' }),
  it({ id: 'rupeeCache', name: 'Rupee Cache', kind: 'special', rarity: 'uncommon', price: 0, power: 0, uses: 1, desc: 'A secret stash: 30–150 Rupees.' }),
  it({ id: 'smallKey', name: 'Small Key', kind: 'special', rarity: 'common', price: 60, power: 0, uses: 1, desc: 'Opens an adjacent Locked Door.' }),
  // ── Monster spoils ──
  it({ id: 'goriyaFang', name: 'Goriya Fang', kind: 'special', rarity: 'uncommon', price: 120, power: 0, uses: 1, desc: 'Lash it to a boomerang: +3 Might with boomerangs for 3 turns.' }),
  it({ id: 'ropeVenom', name: 'Rope Venom', kind: 'special', rarity: 'common', price: 60, power: 0, uses: 1, desc: 'Your next weapon hit Poisons the target.' }),
  it({ id: 'zolGelatin', name: 'Zol Gelatin', kind: 'special', rarity: 'common', price: 60, power: 0, uses: 1, targeted: true, minRange: 1, maxRange: 2,
    desc: 'Sticky glue: the enemy where it lands is Rooted for a turn.' }),
  it({ id: 'vireWing', name: 'Vire Wing', kind: 'special', rarity: 'rare', price: 250, power: 0, uses: 1, desc: 'Dark magic: +4 MAG for 3 turns.' }),
  it({ id: 'polsVoiceEar', name: 'Pols Voice Ear', kind: 'special', rarity: 'uncommon', price: 150, power: 0, uses: 1, desc: 'Hear everything: reveals hidden enemies, traps and hidden staircases within 6.' }),
  it({ id: 'ghiniEssence', name: 'Ghini Essence', kind: 'special', rarity: 'rare', price: 240, power: 0, uses: 1, desc: 'Spectral movement for 2 turns: walls and obstacles cost 2 movement.' }),
  it({ id: 'lanmolaSegment', name: 'Lanmola Segment', kind: 'special', rarity: 'rare', price: 240, power: 0, uses: 1, desc: 'Strap on a shell segment: +4 DEF for 3 turns.' }),
  it({ id: 'patraEyeFragment', name: 'Patra Eye Fragment', kind: 'special', rarity: 'epic', price: 380, power: 0, uses: 1, desc: 'Consumed: +20 Hit with magic for 3 turns.' }),
  it({ id: 'aquamentusScale', name: 'Aquamentus Scale', kind: 'special', rarity: 'legendary', price: 600, power: 0, uses: 1, desc: 'Dragon armor: +5 DEF and +5 RES for 3 turns.' }),
  it({ id: 'manhandlaPetal', name: 'Manhandla Petal', kind: 'special', rarity: 'epic', price: 320, power: 20, uses: 1, desc: 'Restores 20 HP and cures Poison.' }),
  it({ id: 'digdoggerFragment', name: 'Digdogger Fragment', kind: 'special', rarity: 'epic', price: 340, power: 0, uses: 1, desc: '+5 CON and +4 DEF for 3 turns.' }),
];

/** Quest items: the Triforce of Wisdom's fragments (one per Level) and the assembled Triforce. */
export const QUEST_ITEMS: { id: string; name: string; desc: string }[] = [
  { id: 'wisdomFragment', name: 'Triforce of Wisdom Fragment', desc: 'One of the eight pieces Zelda hid in the Underworld. Each one held makes Zelda wiser (+1 MAG and RES).' },
  { id: 'fullTriforce', name: 'The Triforce of Wisdom', desc: 'All eight fragments, reunited. The way to Death Mountain is open.' },
];
