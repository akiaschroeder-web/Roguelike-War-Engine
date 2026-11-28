import type { RaceDef, Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

const u = (t: UnitTemplate): UnitTemplate => t;

export const RACES: RaceDef[] = [
  { id: 'hytopian', name: 'Hytopian', desc: 'The people of Hytopia, a kingdom where fashion is taken very, very seriously.', tags: ['hytopian'], growthMods: { lck: 5 } },
];

// Section 1's named characters (the doc's stat sheets). The ALBW Link is the Green Hero: his existing entry, unchanged.
// Lady Maud is also the Sky Realm's boss (ladyMaudBoss, a form of this entry).
export const TEMPLATES: UnitTemplate[] = [
  u({ id: 'blueHero', name: 'Blue Hero', title: 'Cooperative Scout', race: 'hylian', classId: 'cooperativeScout', size: 1, home: 'woodlandsTF', glyph: 'BH', rare: true,
    stats: st(28, 14, 10, 20, 22, 9, 11, 16, 8, 7, 35, 30), weapons: ['fightersSword', 'boomerang'], skill: 'heroicAgility',
    bio: 'A hero in a blue tunic who answered King Tuft\'s call for heroes. Quick, clever and very impatient, he is at his best on somebody else\'s shoulders — or with somebody on his.' }),
  u({ id: 'redHero', name: 'Red Hero', title: 'Cooperative Warrior', race: 'hylian', classId: 'cooperativeWarrior', size: 1, home: 'woodlandsTF', glyph: 'RH', rare: true,
    stats: st(36, 21, 6, 15, 12, 17, 8, 12, 12, 5, 45, 20), weapons: ['fightersSword', 'magicHammer'], skill: 'heroicStrength',
    bio: 'A hero in a red tunic with a loud voice and a louder swing. He is happiest at the bottom of a Totem, where everyone can lean on him.' }),
  u({ id: 'styla', name: 'Princess Styla', title: 'Royal Support', race: 'hytopian', classId: 'royalSupport', size: 1, home: 'fortressTF', glyph: 'ST', rare: true,
    stats: st(24, 3, 18, 13, 12, 5, 20, 22, 5, 5, 18, 45), weapons: ['fashionSparkle', 'healStaff'], skill: 'fashionableInspiration', abilities: ['runwayGrace'],
    bio: 'The princess of Hytopia and its most fashionable citizen — until Lady Maud cursed her into a brown bodysuit she cannot take off. She will not be seen in public until it is lifted.' }),
  u({ id: 'kingTuft', name: 'King Tuft', title: 'Royal Commander', race: 'hytopian', classId: 'hytopianCommander', size: 1, home: 'woodlandsTF', glyph: 'KT', rare: true,
    stats: st(38, 12, 8, 13, 7, 15, 12, 17, 14, 4, 30, 25), weapons: ['kingsScepterTF'], skill: 'hytopianAuthority', abilities: ['hytopianDecree'],
    bio: 'The tearful king of Hytopia, who would give his crown, his wig and his kingdom to see his daughter smile again. He has put up posters for heroes. He has put up a great many posters.' }),
  u({ id: 'madameCouture', name: 'Madame Couture', title: 'Master Tailor', race: 'hytopian', classId: 'masterTailor', size: 1, home: 'woodlandsTF', glyph: 'MC', rare: true,
    stats: st(25, 5, 12, 23, 10, 6, 13, 18, 6, 5, 22, 30), weapons: ['tailorsNeedle', 'healStaff'], skill: 'expertTailoringSkill', abilities: ['expertTailoring'],
    bio: 'The owner of Hytopia\'s grandest boutique, who will sew you anything — the Big Bomb Outfit, the Cheetah Costume, the Tingle Tights — if you bring her the materials and the Rupees. Her cat supervises.' }),
  u({ id: 'ladyMaud', name: 'Lady Maud', title: 'Fashion Witch', race: 'hytopian', classId: 'fashionWitch', size: 1, home: 'skyRealmTF', glyph: 'LM', rare: true,
    stats: st(35, 5, 32, 20, 17, 9, 29, 10, 7, 6, 20, 85), weapons: ['ladyMaudsParasol'], skill: 'fashionCurseSkill',
    abilities: ['fashionCurse', 'parasolBarrage', 'magicalReflection', 'witchsEnsemble', 'grandCurse'],
    bio: 'The Drablands witch behind the sunglasses and the parasol, Madame Couture\'s estranged sister, who cursed Princess Styla out of sheer envy. She can take the fashion right off your back.' }),
];

/** The three Tri Force Heroes: the Green Hero is the ALBW Link. Colour codes for the Totem art. */
export const TRI_HEROES: Record<string, 'G' | 'R' | 'B'> = { linkALBW: 'G', redHero: 'R', blueHero: 'B' };
/** The Hytopians of section 1. */
export const HYTOPIANS = ['styla', 'kingTuft', 'madameCouture', 'ladyMaud'];
