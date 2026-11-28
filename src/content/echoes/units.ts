import type { RaceDef, Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

const u = (t: UnitTemplate): UnitTemplate => t;

export const RACES: RaceDef[] = [
  { id: 'riverZora', name: 'River Zora', desc: 'The fishmen of Hyrule\'s rivers and lakes: water costs them nothing, and they spit fireballs without a weapon.', tags: ['aquatic', 'riverZora'], growthMods: { mag: 5, spd: 5 } },
  { id: 'primordial', name: 'Primordial Void', desc: 'Nothingness given shape: the Still World\'s own hunger.', tags: ['void', 'rift'], growthMods: { mag: 10, res: 10 } },
  { id: 'automaton', name: 'Automaton', desc: 'Wind-up machines built in Dampé\'s studio. Immune to poison, bleeding, fear and sleep; food does nothing for them (they need mechanical repair), and they run on Wind-Up Energy.',
    tags: ['automaton', 'construct', 'mechanical'], growthMods: { def: 5, lck: -10 } },
];

// Section 1's named characters, section 5's Automatons (permanent, recruitable, generic: Dampé can build more).
// Bosses and the twelve monsters are recruitable through the pack's BOSSES and ENEMIES (registry.ts).
export const TEMPLATES: UnitTemplate[] = [
  // ── Named characters ──
  u({ id: 'zeldaEoW', name: 'Princess Zelda', title: 'Echo Summoner', race: 'hylian', classId: 'echoSummoner', size: 1, home: 'hyruleCastleEoW', glyph: 'ZE',
    stats: st(32, 6, 34, 19, 16, 8, 28, 22, 6, 6, 25, 90), weapons: ['triRod', 'swordOfMight'], skill: 'wisdomOfThePrincess',
    abilities: ['createEcho', 'dismissEcho', 'eoBind', 'eoReverseBond', 'swordfighterForm', 'eoRestoration'],
    bio: 'The princess who escaped the Rift that swallowed her father and Link, and set out with a fairy-like stranger and a rod that copies anything it sees. Tables, beds, Moblins: she summons them all. When it comes to swords, she borrows Link\'s power.' }),
  u({ id: 'linkEoW', name: 'Link', title: 'Hero of Might', race: 'hylian', classId: 'heroOfMight', size: 1, home: 'hyruleCastleEoW', glyph: 'LE',
    stats: st(35, 21, 8, 21, 19, 14, 11, 17, 10, 7, 45, 25), weapons: ['herosSword', 'travelersBow'], skill: 'mysteriousSwordsman',
    abilities: ['mightySlash', 'mightyShot', 'mightyBomb', 'heroicSpin', 'riftBreaker'],
    bio: 'The swordsman who rescued Zelda from Ganon and was swallowed by a Rift for it. Rescued in turn, he fights the Rift\'s creatures and its copies with an old, quiet certainty.' }),
  u({ id: 'tri', name: 'Tri', title: 'Rift Spirit', race: 'fairy', classId: 'riftSpirit', size: 1, home: 'hyruleCastleEoW', glyph: 'TR',
    stats: st(20, 0, 35, 22, 20, 5, 35, 20, 2, 8, 10, 100), weapons: ['triLight', 'healStaff'], skill: 'powerOfCreation', abilities: ['eoRestoration', 'triBond'],
    bio: 'A small glowing being from the Still World, the child of the Triforce who lost her friends to Null. She helps Zelda copy the world, and every Rift repaired gives her back a little more of her power.' }),
  u({ id: 'kingEoW', name: 'King of Hyrule', title: 'Royal Commander', race: 'hylian', classId: 'royalCommanderMC', size: 1, home: 'hyruleCastleEoW', glyph: 'KH',
    stats: st(40, 14, 8, 16, 8, 17, 15, 16, 14, 4, 30, 25), weapons: ['soldierSword'], skill: 'royalAuthority', abilities: ['royalDecreeEoW'],
    bio: 'Zelda\'s father, swallowed by the first Rift and replaced by a copy who called his daughter an impostor. The real king fights beside her now, with Hyrule\'s soldiers at his back.' }),
  u({ id: 'generalWright', name: 'General Wright', title: 'Military General', race: 'hylian', classId: 'militaryGeneral', size: 1, home: 'hyruleCastleEoW', glyph: 'GW',
    stats: st(42, 23, 0, 21, 13, 19, 9, 12, 15, 6, 45, 0), weapons: ['wrightsSword'], skill: 'royalOffensive', abilities: ['formationCharge'],
    bio: 'The helmeted commander of Hyrule\'s army, who believes every problem can be solved by a well-drilled line of soldiers charging it.' }),
  u({ id: 'ministerLefte', name: 'Minister Lefte', title: 'Royal Strategist', race: 'hylian', classId: 'royalStrategist', size: 1, home: 'hyruleCastleEoW', glyph: 'ML',
    stats: st(25, 4, 12, 25, 10, 6, 14, 17, 6, 5, 18, 30), weapons: ['healStaff', 'strategistsTome'], skill: 'strategicWisdom', abilities: ['tacticalPlan'],
    bio: 'The king\'s minister: purple hair, glasses and a book of plans for every contingency, including, it turns out, the kingdom vanishing.' }),
  u({ id: 'impaEoW', name: 'Impa', title: 'Royal Guardian', race: 'sheikah', classId: 'sheikahGuardian', size: 1, home: 'hyruleCastleEoW', glyph: 'IE',
    stats: st(33, 17, 15, 25, 22, 12, 20, 15, 8, 7, 40, 40), weapons: ['impasKnife'], skill: 'hiddenStrength', abilities: ['sheikahVanish'],
    bio: 'Zelda\'s attendant: old, bent over a cane, and much faster than anyone who has underestimated her. She hid the princess when the castle turned on her.' }),
  u({ id: 'lueburry', name: 'Lueburry', title: 'Ancient Researcher', race: 'hylian', classId: 'ancientResearcher', size: 1, home: 'suthornForest', glyph: 'LU',
    stats: st(26, 4, 18, 24, 9, 7, 18, 14, 6, 5, 20, 45), weapons: ['researchersStaff', 'healStaff'], skill: 'mightResearch', abilities: ['mightInfusion'],
    bio: 'An old scholar with swirling glasses and a house full of Might Crystals, who worked out how to put Link\'s power into Zelda\'s hands.' }),
  u({ id: 'dampeEoW', name: 'Dampé', title: 'Automaton Engineer', race: 'hylian', classId: 'automatonEngineer', size: 1, home: 'eternalForest', glyph: 'DE',
    stats: st(35, 15, 8, 24, 8, 13, 10, 13, 14, 4, 35, 20), weapons: ['dampesWrench'], skill: 'mechanicalGenius', abilities: ['rewindAutomaton', 'repairAutomaton'],
    bio: 'Not the gravekeeper: this Dampé builds wind-up Automatons in his studio, with a wrench on his back and a Monster Stone for every repair.' }),
  u({ id: 'darston', name: 'Darston', title: 'Goron Chief', race: 'goron', classId: 'goronChief', size: 2, home: 'eldinVolcanoEoW', glyph: 'DS',
    stats: st(50, 25, 2, 16, 10, 23, 8, 15, 25, 5, 50, 10), weapons: ['goronHammer'], skill: 'growingCourage', abilities: ['goronRally'],
    bio: 'The chief of the Gorons of Eldin: duck-faced, yellow, and braver every time a friend gets hurt.' }),
  u({ id: 'chiefSeera', name: 'Chief Seera', title: 'Gerudo Commander', race: 'gerudo', classId: 'gerudoCommander', size: 1, home: 'gerudoDesertEoW', glyph: 'CS',
    stats: st(35, 20, 12, 22, 15, 14, 17, 15, 10, 6, 40, 30), weapons: ['seerasTrident'], skill: 'desertAuthority', abilities: ['sandstormCommand'],
    bio: 'The chief of the Gerudo, red-haired and trident in hand, who rules from the Gerudo Sanctum and lost her people\'s town to a Rift.' }),
  u({ id: 'dohna', name: 'Dohna', title: 'Gerudo Captain', race: 'gerudo', classId: 'gerudoCaptain', size: 1, home: 'gerudoDesertEoW', glyph: 'DO',
    stats: st(32, 18, 5, 22, 21, 12, 10, 13, 9, 7, 40, 15), weapons: ['dohnasSpear'], skill: 'desertTactics', abilities: ['desertDash'],
    bio: 'Seera\'s captain of the guard, who doubted the princess, then followed her into the Rift and never doubted her again.' }),
  u({ id: 'dradd', name: 'Dradd', title: 'River Zora Chief', race: 'riverZora', classId: 'riverZoraChief', size: 2, home: 'jabulWaters', glyph: 'DR',
    stats: st(48, 20, 24, 16, 11, 18, 22, 12, 24, 5, 35, 65), weapons: ['zoraFireballEoW', 'draddsDrum'], skill: 'riverPercussion', abilities: ['riverDrumbeat'],
    bio: 'The green, drum-bellied chief of the River Zora of Jabul Waters, who has quarrelled with the Sea Zora for longer than anyone can remember.' }),
  u({ id: 'kushara', name: 'Kushara', title: 'Sea Zora Chief', race: 'zora', classId: 'seaZoraChief', size: 1, home: 'jabulWaters', glyph: 'KU',
    stats: st(28, 7, 28, 20, 16, 8, 27, 17, 7, 6, 25, 75), weapons: ['zoraWaterMagic', 'kusharasInstrument'], skill: 'oceanMelody', abilities: ['tidalHymn'],
    bio: 'The chief of the Sea Zora, who plays her harp to calm the waves and, when it comes to it, to mend the wounded.' }),
  u({ id: 'conde', name: 'Condé', title: 'Mountain Giant', race: 'yeti', classId: 'mountainGiant', size: 3, home: 'hebraMountain', glyph: 'CO',
    stats: st(85, 30, 0, 13, 7, 25, 17, 19, 38, 5, 55, 0), weapons: ['condesSnowShovel'], skill: 'gentleGiant', abilities: ['avalancheShove'],
    bio: 'A gentle giant of Hebra Mountain with a snow shovel the size of a door, who clears paths, carries anyone who asks, and only gets angry when someone is cold.' }),
  u({ id: 'stampGuy', name: 'Stamp Guy', title: 'Traveling Collector', race: 'hylian', classId: 'travelingCollector', size: 1, home: 'suthornForest', glyph: 'SG',
    stats: st(25, 7, 0, 15, 20, 6, 8, 30, 7, 7, 30, 0), weapons: ['stampHammer'], skill: 'stampEnthusiast',
    bio: 'A man in a stamp-covered suit who has set up Stamp Stations all over Hyrule and needs you, specifically you, to fill his cards.' }),
  u({ id: 'tekom', name: 'Tekom', title: 'Echo Zelda', race: 'hylian', classId: 'darkSummoner', size: 1, home: 'eternalForest', glyph: 'TK', rare: true,
    stats: st(38, 7, 36, 21, 17, 10, 30, 5, 6, 6, 25, 100), weapons: ['falseTriRod'], skill: 'falseWisdom', abilities: ['createEcho', 'dismissEcho', 'eoBind'],
    bio: 'A red-eyed copy of Zelda made by Null, who summons hostile Echoes and copies anything the real princess conjures. Freed of the Rift, she has to decide what a copy is for.' }),
  // ── Section 5: Automatons (recruitable, permanent, take deployment slots; Wind-Up Energy in the STA slot) ──
  u({ id: 'techtite', name: 'Techtite', title: 'Automaton', race: 'automaton', classId: 'automatonLeaper', size: 1, home: 'eternalForest', glyph: 'Tt', generic: true,
    stats: st(30, 16, 0, 13, 17, 15, 8, 3, 10, 7, 35, 0), weapons: ['techtiteLegs'], skill: 'mechanicalLeap', abilities: ['mechanicalLeapAct'],
    bio: 'A wind-up Tektite of brass and springs: it jumps, it lands on things, the things stop moving.' }),
  u({ id: 'tocktorok', name: 'Tocktorok', title: 'Automaton', race: 'automaton', classId: 'automatonGunner', size: 1, home: 'eternalForest', glyph: 'To', generic: true,
    stats: st(28, 18, 0, 21, 10, 11, 6, 3, 9, 5, 40, 0), weapons: ['tocktorokCannon'], skill: 'rapidFire',
    bio: 'A clockwork Octorok whose snout fires pellets faster than any living one.' }),
  u({ id: 'gizmol', name: 'Gizmol', title: 'Automaton', race: 'automaton', classId: 'automatonMusician', size: 1, home: 'eternalForest', glyph: 'Gz', generic: true,
    stats: st(25, 6, 22, 16, 12, 8, 14, 5, 7, 5, 40, 35), weapons: ['gizmolBubbles'], skill: 'musicalBubbles', abilities: ['musicalBubblesAct'],
    bio: 'A music-box Zol that plays a little tune and blows damaging bubbles across the field.' }),
  u({ id: 'highTekuBaba', name: 'High-Teku Baba', title: 'Automaton', race: 'automaton', classId: 'automatonMaw', size: 1, home: 'eternalForest', glyph: 'HB', generic: true,
    stats: st(40, 28, 0, 14, 7, 20, 9, 3, 15, 4, 40, 0), weapons: ['tekuMaw'], skill: 'mechanicalMaw', abilities: ['mechanicalMawAct'],
    bio: 'A steel Deku Baba on a spring stalk. Anything small and tired that comes near it disappears.' }),
  u({ id: 'roboblin', name: 'Roboblin', title: 'Automaton', race: 'automaton', classId: 'automatonSwordsman', size: 2, home: 'eternalForest', glyph: 'RB', generic: true,
    stats: st(50, 32, 0, 21, 12, 24, 9, 3, 25, 5, 50, 0), weapons: ['roboblinKatana'], skill: 'mechanicalSwordmaster',
    bio: 'Dampé\'s masterpiece: a Moblin-sized samurai of iron with an heirloom katana and perfect form.' }),
  u({ id: 'goldfinch', name: 'Goldfinch', title: 'Automaton', race: 'automaton', classId: 'automatonBird', size: 1, home: 'eternalForest', glyph: 'GF', generic: true,
    stats: st(22, 8, 0, 20, 25, 7, 8, 35, 4, 9, 30, 0), weapons: ['goldfinchBeak'], skill: 'goldenPeck',
    bio: 'A golden clockwork bird. Whatever it pecks drops Rupees, which is why Dampé\'s studio is so nicely furnished.' }),
];

/** The six Automatons (Dampé's Studio builds them; Clockwork Army needs all six). */
export const AUTOMATONS = ['techtite', 'tocktorok', 'gizmol', 'highTekuBaba', 'roboblin', 'goldfinch'];
