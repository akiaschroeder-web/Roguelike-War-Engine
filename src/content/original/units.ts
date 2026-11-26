import type { Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc table: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

type T = Omit<UnitTemplate, 'glyph'> & { glyph: string };
const u = (t: T): UnitTemplate => t;

// Link, Zelda and Ganon are new entries (the exceptions to the returning-character rule).
export const TEMPLATES: UnitTemplate[] = [
  // ── Main characters ──
  u({ id: 'heroOfHyrule', name: 'Link (Hero of Hyrule)', title: 'Adventurer', race: 'hylian', classId: 'adventurer', size: 1, home: 'level1Eagle', glyph: 'LH',
    stats: st(28, 12, 4, 13, 12, 8, 6, 12, 9, 6, 28, 12), weapons: ['kokiriSword', 'fairyBow', 'boomerang'], skill: 'itsDangerousToGoAlone',
    extraSkills: ['swordBeam', 'dungeonExplorer', 'quickItem'], abilities: ['triforcesCourage'],
    bio: 'A boy who wandered into a broken Hyrule, was handed a sword by an old man in a cave, and went down into the Underworld eight times to put the Triforce back together.' }),
  u({ id: 'zeldaHyrule', name: 'Zelda (Era of Decline)', title: 'Princess of Wisdom', race: 'hylian', classId: 'princessOfWisdom', size: 1, home: 'level9DeathMountain', glyph: 'ZH',
    stats: st(24, 3, 22, 13, 9, 5, 21, 15, 5, 5, 16, 45), weapons: ['lightSageStaff', 'healStaff'], skill: 'scatteredWisdom',
    abilities: ['lightOfWisdom', 'sacredBarrierHyrule', 'wisdomsGuidance', 'triforceRestoration'],
    bio: 'The princess who broke the Triforce of Wisdom into eight pieces and hid them rather than let Ganon have it. Every piece found brings back a little of what she knows.' }),
  u({ id: 'ganonHyrule', name: 'Ganon (Prince of Darkness)', title: 'Invisible Sorcerer', race: 'demon', classId: 'invisibleSorcerer', size: 2, home: 'level9DeathMountain', glyph: 'GN',
    stats: st(65, 20, 26, 16, 15, 17, 22, 4, 20, 7, 35, 55), weapons: ['ganonsTrident', 'darkFireballs'], skill: 'invisibleDarkness',
    extraSkills: ['invisibleAssault', 'princeOfDarkness'], abilities: ['darkFireball', 'darkTeleport'], rare: true,
    bio: 'The Prince of Darkness, who took the Triforce of Power and an army of monsters and turned Hyrule into ruins. He fights unseen, and only silver arrows truly frighten him.' }),
  // ── Supporting characters ──
  u({ id: 'oldMan', name: 'Old Man', title: 'Hermit', race: 'hylian', classId: 'hermit', size: 1, home: 'level1Eagle', glyph: 'OM',
    stats: st(22, 3, 16, 14, 4, 4, 16, 12, 4, 3, 12, 32), weapons: ['forestSageStaff', 'healStaff'], skill: 'ancientAdvice',
    bio: '"It\'s dangerous to go alone! Take this." He lives in caves, between two fires, and knows more about the Underworld than anyone alive.' }),
  u({ id: 'oldWoman', name: 'Old Woman', title: 'Potion Maker', race: 'hylian', classId: 'potionMaker', size: 1, home: 'level2Moon', glyph: 'OW',
    stats: st(20, 2, 14, 12, 5, 3, 15, 15, 3, 3, 10, 30), weapons: ['healStaff', 'fireSageStaff'], skill: 'lifeMedicine',
    bio: 'A woman in red who brews the Water of Life — for anyone who brings her the Letter, and pays.' }),
  u({ id: 'merchantHyrule', name: 'Merchant', title: 'Traveling Trader', race: 'hylian', classId: 'travelingTrader', size: 1, home: 'level3Manji', glyph: 'MR',
    stats: st(24, 5, 0, 10, 8, 5, 4, 18, 6, 5, 18, 0), weapons: ['merchantsPack', 'boomerang'], skill: 'secretMerchandise',
    bio: '"Buy somethin\' will ya!" A trader who sets up shop in caves all over Hyrule, behind burnt bushes and bombed walls.' }),
];
