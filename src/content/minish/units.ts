import type { RaceDef, Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

const u = (t: UnitTemplate): UnitTemplate => t;

export const RACES: RaceDef[] = [
  { id: 'minish', name: 'Minish', desc: 'The Picori: a tiny people no bigger than a thumb, who live in tree stumps, under houses and inside mountains, and who only show themselves to children. Micro units (size 0).',
    tags: ['minish', 'picori'], growthMods: { spd: 5, lck: 5 } },
  { id: 'windTribe', name: 'Wind Tribe', desc: 'The people of the Palace of Winds above the clouds, keepers of the Ocarina of Wind.', tags: ['windTribe'], growthMods: { mag: 5, res: 5 } },
];

// Section 2 characters and section 3's generic Minish (doc stats). Size 0 is a Micro unit (engine/micro.ts).
// Micro Link and the Cap form of Ezlo are forms of their characters (formOf) but recruitable on their own;
// Vaati's Minish and Hylian forms are separate entries (exclusive pairs keep one of each person per army).
export const TEMPLATES: UnitTemplate[] = [
  // ── Named characters ──
  u({ id: 'heroOfMinish', name: 'Link', title: 'Hero of the Minish', race: 'hylian', classId: 'sacredSwordsman', size: 1, home: 'hyruleTownMC', glyph: 'LM', microForm: 'microLink',
    stats: st(28, 13, 5, 16, 14, 9, 7, 15, 8, 6, 30, 20), weapons: ['smithsSword', 'magicalBoomerang'], skill: 'fourSwordHero', abilities: ['mcShrink'],
    bio: 'A blacksmith\'s apprentice from Hyrule Town who carried the Smith\'s sword to the Picori Festival and came home with a talking hat. With Ezlo on his head he shrinks to the size of a Minish; with the Four Sword he becomes four.' }),
  u({ id: 'microLink', name: 'Micro Link', title: 'Miniature Adventurer', race: 'hylian', classId: 'miniatureAdventurer', size: 0, home: 'minishWoods', glyph: 'ml', formOf: 'heroOfMinish', growForm: 'heroOfMinish',
    stats: st(22, 12, 5, 18, 17, 5, 7, 15, 1, 7, 28, 20), weapons: ['minishSword'], skill: 'smallButMighty', abilities: ['mcExposeWeakPoint', 'mcInternalStrike', 'mcGrow'],
    bio: 'Link at Minish size: a puddle is a lake, a cat is a monster, and a Big ChuChu has an inside to fight in.' }),
  u({ id: 'zeldaMC', name: 'Princess Zelda', title: 'Light Force Princess', race: 'hylian', classId: 'lightForcePrincess', size: 1, home: 'hyruleTownMC', glyph: 'ZM',
    stats: st(25, 3, 27, 15, 11, 5, 25, 20, 5, 5, 16, 65), weapons: ['lightArrowMC', 'healStaff'], skill: 'lightForce', abilities: ['lightForceBarrier'],
    bio: 'Link\'s childhood friend and the princess of Hyrule, who carries the Light Force in her blood without knowing it — which is why Vaati turned her to stone.' }),
  u({ id: 'ezloMinish', name: 'Ezlo', title: 'Minish Sage', race: 'minish', classId: 'minishSage', size: 0, home: 'minishWoods', glyph: 'EZ',
    stats: st(20, 2, 28, 19, 8, 4, 25, 17, 1, 5, 14, 65), weapons: ['ezlosStaff', 'healStaff'], skill: 'masterOfMiniaturization', abilities: ['ezloCapForm', 'mcHitchRide'],
    bio: 'A cranky Minish sage who made the Minish Cap and was cursed into it by his own apprentice. In his true form he is a small old man with a staff, a long white beard and opinions about everything.' }),
  u({ id: 'ezloCap', name: 'Ezlo', title: 'Magical Companion', race: 'minish', classId: 'magicalCompanion', size: 0, home: 'minishWoods', glyph: 'Ec', formOf: 'ezloMinish',
    stats: st(18, 3, 24, 16, 13, 4, 22, 15, 1, 6, 15, 55), weapons: ['capGust'], skill: 'enchantedCap', abilities: ['ezloMinishForm', 'mcHitchRide'],
    bio: 'Ezlo as the green bird-headed cap: he sits on a hero\'s head, shrinks him at the Minish Portals, and lets him glide on the wind.' }),
  u({ id: 'vaatiMinish', name: 'Vaati', title: 'Apprentice Sorcerer', race: 'minish', classId: 'apprenticeSorcerer', size: 0, home: 'minishWoods', glyph: 'va', rare: true,
    stats: st(22, 3, 23, 17, 15, 4, 20, 8, 1, 7, 16, 50), weapons: ['minishStaffWeapon'], skill: 'forbiddenAmbition', abilities: ['mcSabotage', 'mcDistract'],
    bio: 'Ezlo\'s brilliant apprentice, before he stole the Minish Cap: a small Minish with a curious mind and an appetite for every spell he is not supposed to learn.' }),
  u({ id: 'vaatiHylian', name: 'Vaati', title: 'Wind Sorcerer', race: 'minish', classId: 'windSorcerer', size: 1, home: 'darkHyruleCastle', glyph: 'VH', rare: true,
    stats: st(38, 7, 32, 20, 17, 10, 28, 7, 7, 7, 22, 75), weapons: ['vaatisDarkOrb'], skill: 'sorcerersCapSkill', abilities: ['vaatiCurse', 'mcShrink'],
    bio: 'The Wind Sorcerer in Hylian shape, wearing the Minish Cap he stole: purple robes, a crimson eye, and a talent for turning people into stone.' }),
  u({ id: 'kingDaltus', name: 'King Daltus', title: 'Royal Commander', race: 'hylian', classId: 'royalCommander', size: 1, home: 'hyruleTownMC', glyph: 'KD',
    stats: st(38, 17, 4, 15, 9, 17, 10, 15, 13, 5, 32, 12), weapons: ['daltusRoyalSword'], skill: 'royalAuthority', abilities: ['royalDecree'],
    bio: 'The king of Hyrule, a big, kind-hearted man with a red cape and a weakness for festivals. Under Vaati\'s spell he forgot himself; himself again, he leads from the front.' }),
  u({ id: 'potho', name: 'Minister Potho', title: 'Royal Advisor', race: 'hylian', classId: 'royalAdvisor', size: 1, home: 'hyruleTownMC', glyph: 'MP',
    stats: st(24, 4, 8, 14, 7, 6, 10, 14, 6, 4, 16, 20), weapons: ['healStaff', 'smithsSword'], skill: 'royalAdministration', abilities: ['royalRequisition'],
    bio: 'The king\'s minister, with a tall hat, a great moustache and a ledger for everything. He never fights if he can file a request instead.' }),
  u({ id: 'smith', name: 'Smith', title: 'Master Blacksmith', race: 'hylian', classId: 'masterBlacksmithMC', size: 1, home: 'hyruleTownMC', glyph: 'SM',
    stats: st(32, 17, 0, 18, 7, 12, 6, 12, 14, 4, 30, 0), weapons: ['smithsHammer', 'smithsSword'], skill: 'masterCraftsmanMC', abilities: ['masterCraftsman'],
    bio: 'Link\'s grandfather and the best blacksmith in Hyrule Town, who forged the sword the Minish gift to the festival champion every hundred years.' }),
  u({ id: 'melari', name: 'Melari', title: 'Mountain Minish Blacksmith', race: 'minish', classId: 'mountainMinishSmith', size: 0, home: 'mountCrenel', glyph: 'ME',
    stats: st(28, 18, 4, 20, 7, 14, 8, 13, 2, 4, 35, 10), weapons: ['melarisHammer'], skill: 'sacredForging', abilities: ['mcHitchRide', 'mcSabotage', 'mcInternalStrike'],
    bio: 'The master smith of the Mountain Minish in Mount Crenel, who reforged the broken Picori Blade and can hear a crack in a sword from across the forge.' }),
  u({ id: 'festari', name: 'Festari', title: 'Forest Minish Guide', race: 'minish', classId: 'forestMinishGuide', size: 0, home: 'minishWoods', glyph: 'FE',
    stats: st(18, 5, 8, 16, 17, 3, 10, 14, 1, 8, 22, 20), weapons: ['minishBow', 'minishSword'], skill: 'forestPassage', abilities: ['mcHitchRide', 'mcTrip', 'mcDistract'],
    bio: 'A Forest Minish who knows every root and rabbit hole of the Minish Woods, and who is always somewhere in the grass ahead of you.' }),
  u({ id: 'gentari', name: 'Gentari', title: 'Forest Minish Elder', race: 'minish', classId: 'forestMinishElder', size: 0, home: 'minishVillage', glyph: 'GE',
    stats: st(20, 2, 23, 15, 6, 5, 24, 18, 1, 4, 14, 55), weapons: ['minishStaffWeapon', 'healStaff'], skill: 'ancientWisdom', abilities: ['mcHitchRide'],
    bio: 'The elder of the Minish Village in the woods, who keeps the old stories of the Picori Blade and the Light Force.' }),
  u({ id: 'librari', name: 'Librari', title: 'Town Minish Elder', race: 'minish', classId: 'townMinishElder', size: 0, home: 'hyruleTownMC', glyph: 'LI',
    stats: st(18, 2, 25, 20, 5, 3, 25, 17, 1, 4, 12, 60), weapons: ['minishStaffWeapon', 'healStaff'], skill: 'hiddenKnowledge', abilities: ['mcHitchRide', 'mcExposeWeakPoint'],
    bio: 'The Minish who lives in the Hyrule Town library, among books a thousand times his size. He knows where every secret mechanism in the castle is.' }),
  u({ id: 'percy', name: 'Percy', title: 'Poet', race: 'hylian', classId: 'poet', size: 1, home: 'hyruleTownMC', glyph: 'PE',
    stats: st(22, 3, 10, 14, 10, 4, 12, 16, 5, 5, 16, 25), weapons: ['poetsLyre', 'healStaff'], skill: 'inspiringVerse', abilities: ['inspiringVerseAct'],
    bio: 'A wandering poet with a feathered hat and a verse for every occasion, most of them about himself. They work anyway.' }),
  u({ id: 'gregal', name: 'Gregal', title: 'Wind Tribe Sage', race: 'windTribe', classId: 'windTribeSage', size: 1, home: 'cloudTops', glyph: 'GR',
    stats: st(26, 4, 24, 15, 7, 6, 23, 15, 6, 5, 16, 55), weapons: ['windTome', 'healStaff'], skill: 'windBlessing', abilities: ['tailwind'],
    bio: 'An elder of the Wind Tribe who came down from the Palace of Winds long ago, and has never quite got used to the ground.' }),
  u({ id: 'swiftblade', name: 'Swiftblade', title: 'Swordmaster', race: 'hylian', classId: 'swordmasterMC', size: 1, home: 'hyruleTownMC', glyph: 'SB',
    stats: st(32, 17, 0, 21, 20, 10, 6, 12, 9, 7, 40, 0), weapons: ['swiftbladesSword'], skill: 'swiftTechnique', abilities: ['rollAttack', 'dashAttack'],
    bio: 'The eldest of the Blade Brothers, who runs a dojo in Hyrule Town and teaches sword techniques to anyone who can find the scrolls.' }),
  u({ id: 'greatblade', name: 'Greatblade', title: 'Heavy Swordmaster', race: 'hylian', classId: 'heavySwordmaster', size: 1, home: 'castorWilds', glyph: 'GB',
    stats: st(40, 24, 0, 17, 9, 16, 7, 10, 17, 5, 45, 0), weapons: ['greatbladesSword'], skill: 'powerTechnique', abilities: ['rockBreakerMC', 'downwardThrust'],
    bio: 'A huge Blade Brother who trains in the Castor Wilds and believes every problem has a big enough sword.' }),
  u({ id: 'grimblade', name: 'Grimblade', title: 'Shadow Swordmaster', race: 'hylian', classId: 'shadowSwordmaster', size: 1, home: 'royalValley', glyph: 'GM',
    stats: st(30, 19, 3, 19, 16, 9, 10, 7, 9, 6, 35, 8), weapons: ['grimbladesSword'], skill: 'perilTechnique', abilities: ['perilBeam'],
    bio: 'The gloomy Blade Brother who keeps his dojo near the Royal Valley graveyard and teaches the techniques you only need when you are nearly dead.' }),
  u({ id: 'swiftbladeFirst', name: 'Swiftblade the First', title: 'Spectral Swordmaster', race: 'spirit', classId: 'spectralSwordmaster', size: 1, home: 'royalValley', glyph: 'S1', rare: true,
    stats: st(36, 23, 12, 25, 22, 13, 18, 10, 10, 7, 45, 30), weapons: ['swiftbladesSword'], skill: 'ultimateTechnique', abilities: ['greatSpin', 'perilBeam'],
    bio: 'The ghost of the founder of the Blade Brothers\' school, who waits in the Royal Crypt for a student good enough to learn the Great Spin Attack.' }),
  // ── Section 3: generic Minish (all share the forest Minish art) ──
  u({ id: 'forestMinishScout', name: 'Forest Minish Scout', title: 'Forest Minish', race: 'minish', classId: 'minishScout', size: 0, home: 'minishWoods', glyph: 'fS', generic: true,
    stats: st(14, 5, 0, 12, 16, 2, 5, 10, 1, 8, 20, 0), weapons: ['minishSpear'], skill: 'hiddenTrails', abilities: ['mcHitchRide', 'mcTrip'],
    bio: 'A quick Forest Minish who runs ahead through the grass and comes back with news.' }),
  u({ id: 'forestMinishHealer', name: 'Forest Minish Healer', title: 'Forest Minish', race: 'minish', classId: 'minishHealer', size: 0, home: 'minishVillage', glyph: 'fH', generic: true,
    stats: st(16, 2, 15, 10, 10, 3, 14, 12, 1, 6, 12, 35), weapons: ['healStaff', 'minishStaffWeapon'], skill: 'naturalMedicine', abilities: ['mcHitchRide'],
    bio: 'A Forest Minish who knows which leaf to chew for which ache, and rides along on the people she patches up.' }),
  u({ id: 'mountainMinishWarrior', name: 'Mountain Minish Warrior', title: 'Mountain Minish', race: 'minish', classId: 'minishWarrior', size: 0, home: 'mountCrenel', glyph: 'mW', generic: true,
    stats: st(22, 13, 0, 11, 8, 10, 5, 6, 2, 5, 28, 0), weapons: ['minishHammer'], skill: 'tinyHammer', abilities: ['mcHitchRide', 'mcInternalStrike'],
    bio: 'A stocky Mountain Minish with a hammer, who knows exactly where an armour plate is weakest.' }),
  u({ id: 'mountainMinishBlacksmith', name: 'Mountain Minish Blacksmith', title: 'Mountain Minish', race: 'minish', classId: 'minishSmith', size: 0, home: 'mountCrenel', glyph: 'mB', generic: true,
    stats: st(20, 10, 2, 17, 6, 8, 6, 8, 2, 5, 25, 8), weapons: ['minishHammer'], skill: 'fieldForging', abilities: ['mcHitchRide', 'mcSabotage'],
    bio: 'One of Melari\'s apprentices, who rides on a larger friend\'s shoulder and mends their sword while they swing it.' }),
  u({ id: 'townMinishThief', name: 'Town Minish Thief', title: 'Town Minish', race: 'minish', classId: 'minishThief', size: 0, home: 'hyruleTownMC', glyph: 'tT', generic: true,
    stats: st(16, 7, 0, 16, 19, 3, 5, 13, 1, 8, 25, 0), weapons: ['minishSword'], skill: 'unnoticedHands', abilities: ['mcHitchRide', 'mcPickpocket', 'mcSabotage'],
    bio: 'A Town Minish who lives under the floorboards and borrows things. Nobody has ever noticed.' }),
  u({ id: 'townMinishTinkerer', name: 'Town Minish Tinkerer', title: 'Town Minish', race: 'minish', classId: 'minishTinkerer', size: 0, home: 'hyruleTownMC', glyph: 'tK', generic: true,
    stats: st(18, 4, 10, 19, 9, 5, 10, 10, 1, 6, 18, 25), weapons: ['minishStaffWeapon', 'minishHammer'], skill: 'smallMechanisms', abilities: ['mcHitchRide', 'mcInternalStrike', 'mcExposeWeakPoint', 'mcSabotage'],
    bio: 'A Town Minish who climbs inside clocks, music boxes and ancient guardians to see how they work — and how they stop.' }),
];

/** Micro-only encounters (dungeon nodes in these regions are fought at Minish size). */
export const MICRO_DUNGEON_REGIONS = ['hyruleTownMC', 'minishWoods', 'minishVillage', 'castorWilds', 'lakeHyliaMC'];
