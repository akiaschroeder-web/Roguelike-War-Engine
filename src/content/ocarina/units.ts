import type { Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc tables: physical then magical/secondary. */
const st = (
  hp: number, str: number, skl: number, spd: number, def: number, con: number, mov: number,
  mag: number, res: number, lck: number, sta: number, mp: number,
): Stats => ({ hp, str, skl, spd, def, con, mov, mag, res, lck, sta, mp });

type T = Omit<UnitTemplate, 'glyph'> & { glyph?: string };
const glyphOf = (name: string) => {
  const w = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : name.slice(0, 2)).toUpperCase();
};
const u = (t: T): UnitTemplate => ({ glyph: glyphOf(t.name), ...t });

// ───────────────────────── Named characters ─────────────────────────

export const NAMED: UnitTemplate[] = [
  u({ id: 'link', name: 'Link', title: 'Hero of Time', race: 'hylian', classId: 'hero', size: 1, home: 'hyruleField',
    stats: st(24, 8, 9, 10, 7, 9, 5, 3, 4, 8, 15, 6), weapons: ['kokiriSword', 'fairySlingshot'], skill: 'spiritOfCourage', abilities: ['sariasSong'],
    exclusiveWith: ['youngLink'], bio: 'A versatile frontline fighter capable of using nearly every conventional weapon and adventuring tool.' }),
  u({ id: 'youngLink', name: 'Young Link', title: 'Kokiri Adventurer', race: 'hylian', classId: 'adventurer', size: 1, home: 'kokiriForest', glyph: 'YL',
    stats: st(19, 5, 9, 12, 4, 5, 5, 4, 5, 12, 12, 8), weapons: ['kokiriSword', 'boomerang'], skill: 'smallButMighty',
    exclusiveWith: ['link'], bio: 'A lighter, faster Link specializing in unconventional weapons and utility items.' }),
  u({ id: 'zelda', name: 'Princess Zelda', title: 'Princess of Destiny', race: 'hylian', classId: 'royalSage', size: 1, home: 'hyruleCastle', glyph: 'ZE',
    stats: st(18, 3, 10, 8, 3, 5, 5, 13, 12, 10, 8, 24), weapons: ['lightSageStaff', 'healStaff', 'fairyOcarina'], skill: 'spiritOfWisdom', abilities: ['zeldasLullaby'],
    exclusiveWith: ['sheik'], bio: 'A powerful light-magic user with exceptional magical resistance and army support capabilities.' }),
  u({ id: 'sheik', name: 'Sheik', title: 'Survivor of the Sheikah', race: 'hylian', classId: 'shadowWarrior', size: 1, home: 'kakarikoGraveyard', glyph: 'SH',
    stats: st(21, 6, 13, 14, 4, 6, 6, 5, 7, 8, 18, 10), weapons: ['sheikahNeedles', 'sheikahShortblade', 'sheiksHarp'], skill: 'vanishingAct', abilities: ['zeldasLullaby', 'sunsSong', 'minuetOfForest', 'nocturneOfShadow'],
    exclusiveWith: ['zelda'], bio: 'An exceptionally fast skirmisher specializing in evasion, infiltration and precision attacks.' }),
  u({ id: 'ganondorf', name: 'Ganondorf', title: 'King of Thieves', race: 'gerudo', classId: 'darkKing', size: 1, home: 'gerudoDesert',
    stats: st(30, 13, 8, 7, 10, 14, 5, 12, 9, 4, 20, 20), weapons: ['giantsKnife', 'poeLantern'], skill: 'spiritOfPower', abilities: ['transformGanon'], gear: { mount: 'ganondorfStallion' },
    bio: 'A powerful hybrid combatant with exceptional strength, magic and constitution.' }),
  // Sages
  u({ id: 'rauru', name: 'Rauru', title: 'Sage of Light', race: 'hylian', classId: 'lightSage', size: 1, home: 'hyruleCastle',
    stats: st(20, 3, 9, 4, 5, 7, 4, 14, 14, 9, 8, 28), weapons: ['lightSageStaff', 'healStaff'], skill: 'sacredSanctuary',
    bio: 'The ancient sage who guards the Chamber of Sages.' }),
  u({ id: 'saria', name: 'Saria', title: 'Sage of Forest', race: 'kokiri', classId: 'forestSage', size: 1, home: 'kokiriForest',
    stats: st(17, 2, 8, 9, 3, 4, 5, 10, 10, 11, 9, 20), weapons: ['forestSageStaff', 'healStaff', 'fairyOcarina'], skill: 'forestsFriendship', abilities: ['sariasSong'],
    bio: 'Link’s oldest friend. Her song carries through the Lost Woods.' }),
  u({ id: 'darunia', name: 'Darunia', title: 'Sage of Fire', race: 'goron', classId: 'goronChief', size: 2, home: 'deathMountain',
    stats: st(32, 12, 6, 5, 12, 16, 4, 5, 4, 7, 24, 8), weapons: ['goronHammer', 'fireSageStaff'], skill: 'swornBrother',
    bio: 'Big Boss of the Gorons. Fiercely loyal to his Sworn Brother.' }),
  u({ id: 'ruto', name: 'Princess Ruto', title: 'Sage of Water', race: 'zora', classId: 'zoraSage', size: 1, home: 'zorasDomain', glyph: 'RU',
    stats: st(22, 5, 9, 10, 5, 7, 5, 11, 9, 7, 14, 20), weapons: ['zoraSpear', 'waterSageStaff'], skill: 'royalWaters',
    bio: 'The headstrong Zora princess, and self-declared fiancée of a certain hero.' }),
  u({ id: 'impa', name: 'Impa', title: 'Sage of Shadow', race: 'sheikah', classId: 'sheikahGuardian', size: 1, home: 'kakarikoGraveyard',
    stats: st(24, 9, 12, 12, 7, 8, 6, 6, 7, 7, 20, 12), weapons: ['sheikahShortblade', 'sheikahNeedles'], skill: 'royalProtector',
    bio: 'Zelda’s guardian and the last of the Sheikah who served the royal family.' }),
  u({ id: 'nabooru', name: 'Nabooru', title: 'Sage of Spirit', race: 'gerudo', classId: 'gerudoElite', size: 1, home: 'gerudoDesert',
    stats: st(25, 10, 11, 11, 6, 9, 6, 5, 6, 9, 18, 10), weapons: ['gerudoScimitar'], skill: 'loneThief',
    bio: 'A Gerudo thief who steals from the rich, and who has no love for Ganondorf.' }),
  // Supporting characters
  u({ id: 'malon', name: 'Malon', title: 'Rancher', race: 'hylian', classId: 'rancher', size: 1, home: 'hyruleField',
    stats: st(19, 4, 7, 8, 4, 6, 5, 5, 6, 12, 10, 10), weapons: ['royalHuntingBow', 'healStaff'], skill: 'songOfTheRanch', abilities: ['eponasSong'], gear: { mount: 'epona' },
    bio: 'Lon Lon Ranch’s cheerful heart. Every horse on the ranch adores her.' }),
  u({ id: 'talon', name: 'Talon', title: 'Quartermaster', race: 'hylian', classId: 'quartermaster', size: 1, home: 'hyruleField',
    stats: st(26, 6, 4, 3, 6, 11, 4, 1, 3, 9, 10, 0), weapons: ['pitchfork'], skill: 'ranchSupplies',
    bio: 'Owner of Lon Lon Ranch. Can fall asleep anywhere, including mid-battle.' }),
  u({ id: 'ingo', name: 'Ingo', title: 'Ruthless Rider', race: 'hylian', classId: 'cavalier', size: 1, home: 'hyruleField',
    stats: st(23, 8, 8, 8, 5, 8, 5, 1, 3, 4, 15, 0), weapons: ['hyruleSpear'], skill: 'ruthlessRider',
    bio: 'The ranch hand who seized Lon Lon Ranch. Ambitious, bitter, and a fine rider.' }),
  u({ id: 'mido', name: 'Mido', title: 'Boss of the Kokiri', race: 'kokiri', classId: 'forestScout', size: 1, home: 'kokiriForest',
    stats: st(18, 5, 7, 10, 3, 4, 5, 3, 5, 6, 12, 6), weapons: ['dekuStick', 'dekuShooter'], skill: 'kokiriAuthority',
    bio: 'Self-appointed boss of the Kokiri. Brave, as long as someone is watching.' }),
  u({ id: 'kingZora', name: 'King Zora', title: 'Royal Defender', race: 'zora', classId: 'royalDefender', size: 2, home: 'zorasDomain', glyph: 'KZ',
    stats: st(36, 7, 4, 2, 10, 18, 3, 6, 8, 8, 14, 12), weapons: ['royalZoraTrident', 'zoraWaterMagic'], skill: 'royalPresence',
    bio: 'The enormous, slow-moving monarch of the Zora. Moving him is a campaign of its own.' }),
  u({ id: 'biggoron', name: 'Biggoron', title: 'Giant Blacksmith', race: 'goron', classId: 'giantBlacksmith', size: 5, home: 'deathMountain',
    stats: st(48, 16, 5, 3, 15, 24, 3, 1, 4, 8, 28, 0), weapons: ['biggoronSword'], skill: 'masterCraftsman',
    bio: 'The largest Goron alive, and the finest smith in Hyrule. Has terrible eyesight.' }),
  u({ id: 'medigoron', name: 'Medigoron', title: 'Weaponsmith', race: 'goron', classId: 'weaponsmith', size: 3, home: 'deathMountain',
    stats: st(30, 11, 6, 4, 10, 14, 4, 1, 4, 7, 22, 0), weapons: ['giantsKnife', 'goronHammer'], skill: 'heavyForging',
    bio: 'Biggoron’s brother. His knives are mighty, if not always durable.' }),
  u({ id: 'dampe', name: 'Dampé', title: 'Gravekeeper', race: 'hylian', classId: 'gravekeeper', size: 1, home: 'kakarikoGraveyard', glyph: 'DA',
    stats: st(24, 7, 6, 4, 7, 9, 4, 4, 8, 10, 14, 8), weapons: ['dampeShovel'], skill: 'graveyardShift',
    bio: 'Kakariko’s gravekeeper. Creepy, kind, and very good with a shovel.' }),
  u({ id: 'maskSalesman', name: 'Happy Mask Salesman', title: 'Mask Merchant', race: 'hylian', classId: 'maskMerchant', size: 1, home: 'hyruleCastle', glyph: 'HM',
    stats: st(20, 3, 10, 8, 3, 6, 5, 8, 10, 15, 10, 16), weapons: ['poeLantern'], skill: 'maskCollector',
    bio: 'He sells happiness. Nobody knows what else he carries in that pack.' }),
  // The magic table had no row for the Carpenter Boss; MAG/RES/LCK/STA/MP are my placeholders.
  u({ id: 'carpenterBoss', name: 'Carpenter Boss', title: 'Engineer', race: 'hylian', classId: 'engineer', size: 1, home: 'gerudoDesert', glyph: 'CB',
    stats: st(27, 9, 7, 5, 7, 11, 4, 1, 3, 8, 16, 0), weapons: ['carpenterHammer'], skill: 'masterBuilder',
    bio: 'Mutoh’s crew can build anything. Getting them to finish it is another matter.' }),
  u({ id: 'navi', name: 'Navi', title: 'Guide Fairy', race: 'fairy', classId: 'guide', size: 0, home: 'kokiriForest',
    stats: st(8, 0, 14, 16, 0, 1, 8, 6, 10, 12, 8, 16), weapons: ['fairyLight'], skill: 'heyListen',
    bio: 'Link’s fairy companion. Limited offensive ability, unlimited opinions.' }),
  u({ id: 'kaepora', name: 'Kaepora Gaebora', title: 'Sky Guide', race: 'owl', classId: 'skyGuide', size: 2, home: 'lostWoods', glyph: 'KG',
    stats: st(30, 8, 11, 10, 6, 13, 8, 7, 10, 10, 20, 14), weapons: ['talons'], skill: 'ancientGuidance',
    bio: 'A wise owl who appears at important moments, and talks for a very long time.' }),
  u({ id: 'dekuTree', name: 'Great Deku Tree', title: 'Guardian of the Forest', race: 'spirit', classId: 'forestGuardian', size: 5, home: 'kokiriForest', glyph: 'DT',
    stats: st(65, 10, 7, 0, 16, 30, 0, 14, 15, 10, 20, 30), weapons: ['forestSageStaff', 'healStaff'], skill: 'guardianOfTheForest',
    bio: 'The ancient guardian of the Kokiri. Stationary, but nothing near him goes unprotected.' }),
  u({ id: 'greatFairy', name: 'Great Fairy', title: 'Fairy Matriarch', race: 'fairy', classId: 'fairyMatriarch', size: 2, home: 'deathMountain', glyph: 'GF',
    stats: st(25, 2, 12, 10, 4, 6, 6, 17, 16, 14, 10, 35), weapons: ['greatFairyWand', 'forestSageStaff'], skill: 'greatFairysBlessing', abilities: ['dinsFire', 'faroresWind', 'nayrusLove'],
    bio: 'Her laughter echoes through the fountain. Her blessings are worth the wait.' }),
  u({ id: 'jabuJabu', name: 'Lord Jabu-Jabu', title: 'Guardian of the Zora', race: 'aquaticDeity', classId: 'guardianBeast', size: 5, home: 'zorasDomain', glyph: 'JJ',
    stats: st(95, 16, 5, 3, 22, 40, 4, 10, 18, 10, 40, 25), weapons: ['jabuTide'], skill: 'guardianOfTheZora', extraSkills: ['divineBulk'], rare: true,
    bio: 'The great fish deity of Zora\'s Fountain. A living fortress that can only move through deep water.' }),
];

// ───────────────────────── Generic recruitable units ─────────────────────────
// Stats are class base stats with small racial tweaks; the doc lists roles only.

const g = (id: string, name: string, classId: string, race: string, home: string, weapons: string[], size: number, stats: Stats, bio: string, monster = false): UnitTemplate =>
  ({ id, name, title: 'Recruit', race, classId, size, home, stats, weapons, glyph: glyphOf(name), bio, generic: true, monster });

export const GENERICS: UnitTemplate[] = [
  g('hyruleSoldier', 'Hyrule Soldier', 'soldier', 'hylian', 'hyruleField', ['hyruleSpear', 'soldierSword'], 1, st(20, 6, 6, 6, 5, 7, 5, 0, 2, 4, 12, 0), 'Balanced infantry of the royal army.'),
  g('hyruleArcher', 'Hyrule Archer', 'archer', 'hylian', 'hyruleField', ['royalHuntingBow'], 1, st(18, 5, 8, 7, 4, 6, 5, 0, 2, 5, 12, 0), 'Conventional ranged support.'),
  g('hyruleKnight', 'Hyrule Knight', 'knight', 'hylian', 'hyruleCastle', ['hyruleSpear'], 1, st(24, 8, 5, 3, 10, 12, 4, 0, 2, 3, 14, 0), 'Defensive infantry in heavy plate.'),
  g('hyruleCavalry', 'Hyrule Cavalry', 'cavalry', 'hylian', 'hyruleField', ['hyruleSpear'], 2, st(21, 7, 6, 7, 6, 9, 7, 0, 3, 4, 14, 0), 'Mounted lancers. Their horses take up room.'),
  g('kokiriScout', 'Kokiri Scout', 'scout', 'kokiri', 'kokiriForest', ['kokiriSword'], 1, st(16, 4, 7, 10, 3, 4, 6, 3, 4, 7, 10, 4), 'Quick and at home in the trees.'),
  g('kokiriSlingshooter', 'Kokiri Slingshooter', 'skirmisher', 'kokiri', 'kokiriForest', ['fairySlingshot'], 1, st(16, 4, 9, 9, 3, 4, 5, 2, 4, 7, 10, 4), 'Light ranged attacks from the canopy.'),
  g('goronWarrior', 'Goron Warrior', 'brawler', 'goron', 'deathMountain', ['goronFists'], 1, st(28, 9, 5, 4, 8, 13, 5, 0, 1, 4, 18, 0), 'Rock-hard fists, rock-hard heads.'),
  g('goronRoller', 'Goron Roller', 'charger', 'goron', 'deathMountain', ['goronFists'], 1, st(26, 8, 5, 7, 7, 12, 6, 0, 1, 4, 18, 0), 'Curls up and rolls into the enemy line.'),
  g('zoraWarrior', 'Zora Warrior', 'lancer', 'zora', 'zorasDomain', ['hyruleSpear'], 1, st(20, 6, 7, 7, 5, 7, 5, 1, 5, 5, 12, 4), 'Spear fighters of the royal guard.'),
  g('zoraMystic', 'Zora Mystic', 'mage', 'zora', 'zorasDomain', ['zoraWaterMagic', 'healStaff'], 1, st(17, 0, 6, 6, 2, 5, 5, 7, 8, 5, 8, 14), 'Water magic and healing.'),
  g('gerudoGuard', 'Gerudo Guard', 'swordsman', 'gerudo', 'gerudoDesert', ['gerudoScimitar'], 1, st(20, 7, 9, 9, 4, 6, 5, 1, 2, 5, 14, 2), 'Fast, deadly scimitar fighters.'),
  g('gerudoThief', 'Gerudo Thief', 'thief', 'gerudo', 'gerudoDesert', ['gerudoDagger'], 1, st(17, 5, 9, 11, 3, 5, 6, 0, 2, 8, 12, 0), 'Infiltrators and skilled pickpockets.'),
  g('sheikahWarrior', 'Sheikah Warrior', 'assassin', 'sheikah', 'kakarikoGraveyard', ['sheikahNeedles'], 1, st(18, 6, 11, 11, 4, 6, 6, 2, 4, 5, 14, 4), 'Evasion and precision.'),
  g('dekuScrub', 'Deku Scrub', 'skirmisher', 'deku', 'kokiriForest', ['dekuShooter'], 1, st(15, 4, 8, 7, 4, 3, 4, 1, 3, 6, 8, 0), 'Spits nuts with surprising force.'),
  g('businessScrub', 'Business Scrub', 'merchant', 'deku', 'lostWoods', ['dekuShooter'], 1, st(15, 2, 7, 7, 3, 3, 5, 3, 4, 14, 8, 2), 'Will sell you anything. Will also shoot you.'),
  g('stalchild', 'Stalchild', 'undeadSoldier', 'undead', 'hyruleField', ['claws'], 1, st(16, 5, 4, 5, 3, 5, 5, 0, 1, 0, 8, 0), 'Cheap, expendable infantry.', true),
  g('stalfos', 'Stalfos', 'undeadKnight', 'undead', 'lostWoods', ['stalfosSword'], 1, st(22, 8, 8, 7, 7, 8, 5, 0, 2, 0, 14, 0), 'Sword-and-shield skeleton knights.', true),
  g('lizalfos', 'Lizalfos', 'skirmisher', 'monster', 'deathMountain', ['lizalfosBlade'], 1, st(19, 6, 8, 9, 4, 6, 6, 0, 2, 3, 14, 0), 'Agile, leaping lizard warriors.', true),
  g('dinolfos', 'Dinolfos', 'warrior', 'monster', 'deathMountain', ['dinolfosCleaver'], 1, st(24, 10, 6, 6, 7, 10, 5, 0, 2, 3, 16, 0), 'Heavy melee lizard brutes.', true),
  g('moblin', 'Moblin', 'heavySoldier', 'monster', 'lostWoods', ['moblinSpear'], 2, st(28, 10, 4, 3, 8, 14, 4, 0, 0, 2, 16, 0), 'Hulking spear-wielders.', true),
  g('ironKnuckle', 'Iron Knuckle', 'heavyKnight', 'monster', 'gerudoDesert', ['ironKnuckleAxe'], 2, st(30, 12, 7, 3, 13, 16, 4, 0, 4, 2, 18, 0), 'Walking fortresses with enormous axes.', true),
];

export const TEMPLATES: UnitTemplate[] = [...NAMED, ...GENERICS];
