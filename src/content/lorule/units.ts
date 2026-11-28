import type { RaceDef, Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

const u = (t: UnitTemplate): UnitTemplate => t;

export const RACES: RaceDef[] = [
  { id: 'lorulean', name: 'Lorulean', desc: 'The people of Lorule, Hyrule\'s twin kingdom, whose Triforce was destroyed and whose world is crumbling into the void.',
    tags: ['lorulean'], growthMods: { res: 5 } },
  { id: 'maiamai', name: 'Maiamai', desc: 'Little hermit octopuses who hide all over Hyrule and Lorule, and their enormous mother. Aquatic.',
    tags: ['aquatic', 'maiamai'], swims: true, growthMods: { lck: 10 } },
  { id: 'companionBird', name: 'Companion Bird', desc: 'A small bird with a very large sense of duty.', tags: ['bird', 'beast'], flies: true },
];

// Section 2's characters and the Seven Sages, and the Lorule generics (doc stats). The Baby Maiamai is a Micro
// unit (size 0) and a generic: several can join. Yuga and Yuga Ganon are separate entries, both recruitable.
export const TEMPLATES: UnitTemplate[] = [
  // ── Named characters ──
  u({ id: 'linkALBW', name: 'Link', title: 'Hero of Hyrule and Lorule', race: 'hylian', classId: 'paintingSwordsman', size: 1, home: 'kakarikoLB', glyph: 'LB',
    stats: st(32, 16, 12, 18, 16, 12, 10, 16, 9, 6, 35, 40), weapons: ['fightersSword', 'boomerang'], skill: 'betweenWorlds', abilities: ['wallMerge'],
    bio: 'A blacksmith\'s apprentice from Hyrule who slept through his own apprenticeship, until a sorcerer turned a priest\'s daughter into a painting in front of him. Ravio\'s bracelet lets him slip into walls as a drawing of himself.' }),
  u({ id: 'zeldaALBW', name: 'Princess Zelda', title: 'Sacred Princess', race: 'hylian', classId: 'sacredPrincessLB', size: 1, home: 'hyruleCastleLB', glyph: 'ZB',
    stats: st(27, 4, 30, 17, 12, 6, 28, 20, 5, 5, 18, 75), weapons: ['sacredLightLB', 'healStaff'], skill: 'hyrulesLight', abilities: ['paintingDispel'],
    bio: 'The princess of Hyrule and keeper of the Triforce of Wisdom, who sends the hero the Pendant of Courage — and is painted onto a wall for her trouble.' }),
  u({ id: 'hilda', name: 'Princess Hilda', title: 'Lorulean Princess', race: 'lorulean', classId: 'loruleanPrincess', size: 1, home: 'loruleCastle', glyph: 'HI',
    stats: st(28, 5, 29, 18, 13, 8, 27, 9, 6, 5, 20, 70), weapons: ['hildasStaff'], skill: 'fallenKingdom', abilities: ['hildasVeil', 'paintingDispel'],
    bio: 'The last princess of Lorule, whose ancestors destroyed their own Triforce to end a war over it. She would do almost anything to save her people — including steal Hyrule\'s.' }),
  u({ id: 'ravio', name: 'Ravio', title: 'Traveling Merchant', race: 'lorulean', classId: 'travelingMerchantLB', size: 1, home: 'kakarikoLB', glyph: 'RV',
    stats: st(26, 7, 15, 17, 18, 6, 13, 20, 7, 6, 25, 40), weapons: ['raviosHammer'], skill: 'resourcefulMerchant', abilities: ['merchantsLoan'],
    bio: 'A self-described coward in a rabbit hood who moved into the hero\'s house, opened a shop in it, and rents out every tool the hero needs. He is braver than he says.' }),
  u({ id: 'yuga', name: 'Yuga', title: 'Painting Sorcerer', race: 'lorulean', classId: 'paintingSorcerer', size: 1, home: 'loruleCastle', glyph: 'YU', rare: true,
    stats: st(36, 6, 35, 23, 17, 9, 28, 7, 7, 6, 22, 85), weapons: ['yugasPaintbrush'], skill: 'livingPortrait', abilities: ['paintingPrison', 'wallMerge'],
    bio: 'A vain Lorulean sorcerer and artist who turns the descendants of the Seven Sages into paintings, and wants the most beautiful subject of all: the Demon King.' }),
  u({ id: 'sheerow', name: 'Sheerow', title: 'Flying Companion', race: 'companionBird', classId: 'flyingCompanionLB', size: 1, home: 'kakarikoLB', glyph: 'SH',
    stats: st(15, 4, 0, 15, 25, 2, 8, 18, 2, 9, 25, 0), weapons: ['sheerowPeck'], skill: 'itemRetrieval',
    bio: 'Ravio\'s little white bird. When a renter falls, Sheerow flies off with the rented item. When a friend falls, Sheerow brings their things home.' }),
  u({ id: 'gramps', name: 'Gramps', title: 'Veteran Swordsman', race: 'hylian', classId: 'veteranSwordsman', size: 1, home: 'kakarikoLB', glyph: 'GP',
    stats: st(42, 24, 10, 29, 18, 17, 15, 16, 13, 6, 50, 30), weapons: ['grampsSword'], skill: 'veteranHero', abilities: ['greatSpin'],
    bio: 'A bald old man with a cane who runs the swordsman\'s hut in Kakariko. Leave the cane alone: he once fought the hero of legend to a standstill.' }),
  u({ id: 'motherMaiamai', name: 'Mother Maiamai', title: 'Aquatic Support', race: 'maiamai', classId: 'aquaticSupport', size: 3, home: 'kakarikoLB', glyph: 'MM',
    stats: st(75, 8, 24, 13, 5, 20, 25, 20, 30, 4, 25, 65), weapons: ['maiamaiTentacle', 'healStaff'], skill: 'mothersGiftSkill', abilities: ['mothersGift'],
    bio: 'A huge pink octopus in a shell who lives in Lake Hylia and has lost exactly one hundred children. Bring them back and she will make your tools Nice.' }),
  u({ id: 'babyMaiamai', name: 'Baby Maiamai', title: 'Aquatic Companion', race: 'maiamai', classId: 'aquaticCompanion', size: 0, home: 'kakarikoLB', glyph: 'bm', generic: true,
    stats: st(10, 2, 4, 10, 14, 4, 8, 15, 1, 5, 15, 10), weapons: ['maiamaiSquirt'], skill: 'hiddenChild', abilities: ['mcHitchRide'],
    bio: 'A tiny pink hermit octopus with a spiky shell. It clings to walls, trees and the backs of larger friends, and squeaks "Maiamai!" when found.' }),
  u({ id: 'loruleanBlacksmith', name: 'Lorulean Blacksmith', title: 'Blacksmith', race: 'lorulean', classId: 'blacksmithLB', size: 1, home: 'thievesTown', glyph: 'LS',
    stats: st(35, 19, 0, 22, 8, 13, 7, 10, 16, 4, 35, 0), weapons: ['smithsHammer'], skill: 'masterTempering',
    bio: 'The smith in the ruined forge outside Lorule\'s Thieves\' Town, who lost his partner and keeps working anyway. Bring him Master Ore and he will temper a legend.' }),
  u({ id: 'thiefGirl', name: 'Thief Girl', title: 'Rogue', race: 'lorulean', classId: 'rogueLB', size: 1, home: 'thievesTown', glyph: 'TG',
    stats: st(25, 10, 2, 19, 22, 6, 8, 15, 6, 7, 30, 5), weapons: ['thievesDaggerLB'], skill: 'insideKnowledge',
    bio: 'A pink-haired thief from Thieves\' Town who knows every trap in the Thieves\' Hideout, because she helped set them. Also: a Sage, as it turns out.' }),
  // ── The Seven Sages ──
  u({ id: 'gulley', name: 'Gulley', title: 'Forest Scout', race: 'hylian', classId: 'forestScoutLB', size: 1, home: 'skullWoodsLB', glyph: 'GU',
    stats: st(20, 7, 5, 13, 15, 5, 7, 16, 5, 6, 22, 15), weapons: ['fairySlingshot'], skill: 'forestChild',
    bio: 'The blacksmith\'s son from Kakariko, who wandered into the Lost Woods and came out a painting. A Sage, and a child, and very proud of both.' }),
  u({ id: 'osfala', name: 'Osfala', title: 'Apprentice Sage', race: 'hylian', classId: 'apprenticeSage', size: 1, home: 'desertPalaceLB', glyph: 'OS',
    stats: st(28, 6, 24, 16, 13, 7, 19, 10, 7, 5, 20, 55), weapons: ['osfalasSandRod'], skill: 'sagesConfidence',
    bio: 'Sahasrahla\'s grandson and apprentice, who went into the Desert Palace convinced he was the hero. He was not. He is, it turns out, a Sage.' }),
  u({ id: 'seres', name: 'Seres', title: 'Sanctuary Priestess', race: 'hylian', classId: 'sanctuaryPriestess', size: 1, home: 'sanctuaryLB', glyph: 'SE',
    stats: st(25, 3, 25, 15, 10, 5, 25, 17, 5, 5, 16, 65), weapons: ['sacredLightLB', 'healStaff'], skill: 'sanctuaryPrayer', abilities: ['sanctuaryBlessing', 'paintingDispel'],
    bio: 'The priest\'s daughter at the Sanctuary, the first Sage Yuga painted. Freed, she prays over the wounded, and paintings peel off the walls around her.' }),
  u({ id: 'oren', name: 'Queen Oren', title: 'Zora Queen', race: 'riverZora', classId: 'zoraQueen', size: 2, home: 'swampPalaceLB', glyph: 'OR',
    stats: st(48, 14, 23, 16, 12, 15, 24, 15, 24, 6, 30, 60), weapons: ['zoraWaterMagic', 'riverZoraRoyalTrident'], skill: 'riverQueen', abilities: ['healingCurrent'],
    bio: 'The queen of the Zoras of Hyrule\'s rivers: enormous, imperious and extremely particular about her Smooth Gem. A Sage of Lorule\'s Swamp Palace.' }),
  u({ id: 'rosso', name: 'Rosso', title: 'Mountain Miner', race: 'hylian', classId: 'mountainMiner', size: 2, home: 'iceRuins', glyph: 'RS',
    stats: st(48, 25, 0, 15, 8, 20, 7, 12, 25, 5, 50, 0), weapons: ['magicHammer'], skill: 'mountainStrengthLB',
    bio: 'A huge, cheerful miner who lives in a house on Death Mountain and lifts rocks for fun. He gave the hero the Power Glove; Yuga gave him a frame.' }),
  u({ id: 'irene', name: 'Irene', title: 'Flying Witch', race: 'hylian', classId: 'flyingWitch', size: 1, home: 'turtleRockLB', glyph: 'IR', gear: { mount: 'irenesBroom' },
    stats: st(24, 3, 24, 18, 19, 4, 20, 13, 5, 8, 20, 60), weapons: ['witchsSpark'], skill: 'witchTransportation', abilities: ['transportAlly'],
    bio: 'A young witch-in-training on a broom, granddaughter of a famous witch, who gives the hero rides across Hyrule for a bell. Fast, fearless and a Sage.' }),
  u({ id: 'impaALBW', name: 'Impa (Seven Sages)', title: 'Royal Sage', race: 'sheikah', classId: 'royalSageLB', size: 1, home: 'hyruleCastleLB', glyph: 'IB',
    stats: st(32, 14, 19, 20, 16, 12, 22, 15, 8, 6, 32, 50), weapons: ['impasBlade'], skill: 'royalProtection', abilities: ['paintingDispel'],
    bio: 'Princess Zelda\'s attendant in this age, a descendant of the Sages, who was painted onto the wall of Hyrule Castle\'s throne room beside her princess.' }),
  // Yuga Ganon as a recruit (and commander) keeps the doc's full stat sheet (user decision).
  u({ id: 'yugaGanon', name: 'Yuga Ganon', title: 'Painting Demon King', race: 'demon', classId: 'paintingDemonKing', size: 3, home: 'loruleCastle', glyph: 'YG', rare: true,
    stats: st(130, 36, 40, 25, 17, 30, 35, 8, 40, 7, 55, 100), weapons: ['demonicTrident', 'yugaGanonBolts'], skill: 'fusionOfPower',
    abilities: ['lightningBarrage', 'paintingPrison', 'darkWorldMerge', 'reflectedEnergy', 'triforceCataclysm'],
    bio: 'Yuga fused with the Demon King\'s painting: Ganon\'s strength in an artist\'s hands.' }),
  // ── Generics (Lorule) ──
  u({ id: 'loruleSoldier', name: 'Lorule Soldier', title: 'Soldier of Lorule', race: 'lorulean', classId: 'loruleSoldierClass', size: 1, home: 'loruleCastle', glyph: 'lS', generic: true,
    stats: st(27, 12, 0, 11, 10, 10, 7, 5, 9, 5, 28, 0), weapons: ['loruleSword'], skill: 'desperateDefense',
    bio: 'A horned, armoured soldier of a dying kingdom, fighting for whatever the princess says will save it.' }),
  u({ id: 'loruleSpearman', name: 'Lorule Spearman', title: 'Soldier of Lorule', race: 'lorulean', classId: 'loruleSpearmanClass', size: 1, home: 'loruleCastle', glyph: 'lP', generic: true,
    stats: st(29, 14, 0, 13, 9, 12, 6, 5, 11, 5, 30, 0), weapons: ['loruleSpear'], skill: 'piercingFormation',
    bio: 'Lorule\'s spearmen fight in pairs and threes; a lone one is nervous.' }),
  u({ id: 'loruleKnight', name: 'Lorule Knight', title: 'Knight of Lorule', race: 'lorulean', classId: 'loruleKnightClass', size: 1, home: 'loruleCastle', glyph: 'lK', generic: true,
    stats: st(36, 17, 0, 15, 10, 18, 10, 6, 14, 5, 35, 0), weapons: ['loruleSword'], skill: 'fallenGuard',
    bio: 'A knight of the fallen kingdom\'s guard, whose armour has been blessed against the darkness pouring out of the cracks in the world.' }),
];

/** Which kingdom each region of the campaign belongs to (section 11). */
export const KINGDOM: Record<string, 'hyrule' | 'lorule'> = {
  kakarikoLB: 'hyrule', easternPalaceLB: 'hyrule', houseOfGales: 'hyrule', towerOfHeraLB: 'hyrule', sanctuaryLB: 'hyrule', hyruleCastleLB: 'hyrule',
  thievesTown: 'lorule', thievesHideout: 'lorule', darkPalaceLB: 'lorule', swampPalaceLB: 'lorule', skullWoodsLB: 'lorule', desertPalaceLB: 'lorule',
  iceRuins: 'lorule', turtleRockLB: 'lorule', treacherousTower: 'lorule', loruleCastle: 'lorule',
};
/** The Seven Sages (their paintings are the campaign's quest items). */
export const SAGES = ['gulley', 'osfala', 'seres', 'oren', 'rosso', 'irene', 'impaALBW'];
