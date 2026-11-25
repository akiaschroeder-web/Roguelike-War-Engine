import type { Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc tables: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

type T = Omit<UnitTemplate, 'glyph'> & { glyph?: string };
const glyphOf = (name: string) => {
  const w = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : name.slice(0, 2)).toUpperCase();
};
const u = (t: T): UnitTemplate => ({ glyph: glyphOf(t.name), ...t });

export const NAMED: UnitTemplate[] = [
  // ── Main characters ──
  u({ id: 'heroOfWinds', name: 'Link (Hero of Winds)', title: 'Wind Adventurer', race: 'hylian', classId: 'windAdventurer', size: 1, home: 'outsetIsland', glyph: 'LW',
    stats: st(23, 7, 5, 12, 12, 6, 5, 10, 6, 5, 16, 12), weapons: ['herosSword', 'windWaker'], skill: 'heroOfWinds', abilities: ['multiTargetThrow'],
    bio: 'A boy from Outset Island who set sail to rescue his sister, and became the hero the gods had been waiting for.' }),
  u({ id: 'tetra', name: 'Tetra', title: 'Pirate Captain', race: 'hylian', classId: 'pirateCaptain', size: 1, home: 'greatSea',
    stats: st(22, 6, 3, 12, 13, 4, 5, 10, 6, 6, 16, 8), weapons: ['tetrasCutlass', 'pirateDagger'], skill: 'piratesFortune',
    bio: 'Captain of the most feared pirate crew on the Great Sea. Sharp, bossy and fearless, with a secret she doesn\'t know herself.' }),
  u({ id: 'zeldaWW', name: 'Princess Zelda (Wind Waker)', title: 'Sacred Archer', race: 'hylian', classId: 'sacredArcher', size: 1, home: 'submergedHyrule', glyph: 'ZW',
    stats: st(20, 4, 14, 13, 9, 4, 13, 11, 5, 5, 10, 26), weapons: ['fairyBow', 'sacredLight', 'healStaff'], skill: 'sacredPartnership', abilities: ['lightArrow'],
    bio: 'Tetra awakened to her royal blood. Her Light Arrows shine brightest against a foe her allies have already wounded.' }),
  u({ id: 'ganondorfWW', name: 'Ganondorf (Wind Waker)', title: 'King of the Forsaken Fortress', race: 'gerudo', classId: 'dualBladeWarlord', size: 1, home: 'ganonsTower', glyph: 'GW',
    stats: st(32, 15, 8, 15, 12, 10, 8, 5, 15, 6, 28, 16), weapons: ['ganondorfsTwinSwords'], skill: 'desertWind', rare: true,
    bio: 'An older Ganondorf who spent a century beneath the waves, waiting. Now he fights with two swords and a swordsman\'s patience.' }),

  // ── Supporting characters ──
  u({ id: 'kingDaphnes', name: 'King Daphnes', title: 'Fallen Monarch', race: 'hylian', classId: 'fallenMonarch', size: 1, home: 'submergedHyrule', glyph: 'KD',
    stats: st(28, 7, 12, 9, 5, 8, 14, 10, 10, 4, 14, 24), weapons: ['royalGuardBlade', 'sacredLight', 'healStaff'], skill: 'kingsWisdom',
    bio: 'King Daphnes Nohansen Hyrule, last king of the drowned kingdom. Wise, sad and steadfast.' }),
  u({ id: 'kingOfRedLions', name: 'King of Red Lions', title: 'Royal Warship', race: 'enchantedVessel', classId: 'royalWarship', size: 3, home: 'greatSea', glyph: 'KR',
    stats: st(45, 10, 8, 8, 7, 12, 10, 10, 24, 7, 30, 20), weapons: ['redLionCannon', 'ramming'], skill: 'masterOfTheSeas',
    bio: 'A talking boat with a lion\'s head, who knows far more about Hyrule than any boat should. Carries three passengers.' }),
  u({ id: 'aryll', name: 'Aryll', title: 'Seagull Scout', race: 'hylian', classId: 'seagullScout', size: 1, home: 'outsetIsland',
    stats: st(16, 2, 3, 8, 9, 2, 5, 14, 3, 5, 10, 8), weapons: ['fairySlingshot'], skill: 'friendsOfTheSky', gear: { acc1: 'telescope' },
    bio: 'Link\'s little sister. She loves seagulls, and they love her back.' }),
  u({ id: 'grandma', name: 'Grandma', title: 'Caretaker', race: 'hylian', classId: 'caretaker', size: 1, home: 'outsetIsland', glyph: 'GM',
    stats: st(20, 1, 7, 5, 3, 3, 10, 15, 5, 3, 8, 16), weapons: ['healStaff'], skill: 'grandmothersLove',
    bio: 'Her Elixir Soup could raise the dead. Possibly literally.' }),
  u({ id: 'orca', name: 'Orca', title: 'Swordmaster', race: 'hylian', classId: 'swordmaster', size: 1, home: 'outsetIsland',
    stats: st(30, 13, 2, 16, 10, 8, 5, 8, 12, 5, 26, 4), weapons: ['orcasTrainingSpear', 'pirateCutlass'], skill: 'mastersDiscipline',
    bio: 'Outset\'s old swordmaster. Five hundred hits before you get a lesson.' }),
  u({ id: 'sturgeon', name: 'Sturgeon', title: 'Scholar', race: 'hylian', classId: 'scholar', size: 1, home: 'outsetIsland',
    stats: st(19, 2, 8, 10, 3, 3, 12, 10, 5, 3, 8, 18), weapons: ['sturgeonTome', 'healStaff'], skill: 'encyclopedicKnowledge',
    bio: 'Orca\'s grumpy brother, who has read every book and remembers all of them.' }),
  u({ id: 'medli', name: 'Medli', title: 'Earth Sage', race: 'rito', classId: 'earthSage', size: 1, home: 'dragonRoost',
    stats: st(20, 3, 12, 11, 12, 3, 12, 10, 4, 7, 14, 24), weapons: ['medlisHarp', 'reflectedLight', 'healStaff'], skill: 'earthGodsPrayer', abilities: ['earthGodsLyric'],
    bio: 'Valoo\'s attendant, too young to fly far, but brave enough to follow Link into the Earth Temple.' }),
  u({ id: 'makar', name: 'Makar', title: 'Wind Sage', race: 'korok', classId: 'windSage', size: 1, home: 'forestHaven',
    stats: st(17, 2, 13, 8, 7, 3, 11, 12, 3, 5, 10, 26), weapons: ['makarsViolin', 'korokWind', 'healStaff'], skill: 'windGodsAria', abilities: ['windGodsAriaSong'],
    bio: 'The Koroks\' little violinist. Falls into trouble often, and out of it with a song.' }),
  u({ id: 'komali', name: 'Prince Komali', title: 'Royal Aviator', race: 'rito', classId: 'royalAviator', size: 1, home: 'dragonRoost',
    stats: st(23, 8, 4, 10, 13, 5, 6, 9, 6, 7, 18, 10), weapons: ['komaliTalonSpear', 'ritoBow'], skill: 'dragonsCourage',
    bio: 'The Rito prince, who finally grew his wings and found his courage.' }),
  u({ id: 'quill', name: 'Quill', title: 'Sky Messenger', race: 'rito', classId: 'skyMessenger', size: 1, home: 'dragonRoost',
    stats: st(24, 6, 4, 12, 14, 5, 7, 8, 7, 8, 20, 10), weapons: ['ritoSpear', 'ritoBow'], skill: 'specialDelivery',
    bio: 'The Rito postman. Neither monsters nor cannon fire stop the mail.' }),
  u({ id: 'ritoChieftain', name: 'Rito Chieftain', title: 'Sky Commander', race: 'rito', classId: 'skyCommander', size: 1, home: 'dragonRoost', glyph: 'RC',
    stats: st(29, 10, 6, 12, 10, 7, 9, 8, 10, 7, 22, 14), weapons: ['ritoChieftainSpear', 'ritoBow'], skill: 'wingsOfLeadership',
    bio: 'Leader of the Rito and father of Komali. His wings carry the whole flock.' }),
  u({ id: 'laruto', name: 'Laruto', title: 'Earth Sage (Ancient)', race: 'zoraSpirit', classId: 'earthSage', size: 1, home: 'earthTemple',
    stats: st(21, 2, 16, 10, 8, 4, 15, 10, 4, 5, 10, 32), weapons: ['larutosHarp', 'sacredLight', 'zoraWaterMagic'], skill: 'ancientEarthPrayer', abilities: ['earthGodsLyric'], rare: true,
    bio: 'The Zora sage who once prayed in the Earth Temple. Her harp still remembers the song.' }),
  u({ id: 'fado', name: 'Fado', title: 'Wind Sage (Ancient)', race: 'kokiriSpirit', classId: 'windSage', size: 1, home: 'windTemple',
    stats: st(19, 2, 15, 11, 9, 3, 14, 11, 3, 5, 10, 30), weapons: ['fadosViolin', 'korokWind', 'healStaff'], skill: 'ancientWindPrayer', abilities: ['windGodsAriaSong'], rare: true,
    bio: 'The Kokiri sage of the Wind Temple. Her violin makes every song last longer.' }),
  u({ id: 'niko', name: 'Niko', title: 'Pirate Deckhand', race: 'hylian', classId: 'pirateDeckhand', size: 1, home: 'greatSea',
    stats: st(19, 5, 1, 10, 12, 3, 3, 9, 5, 6, 15, 0), weapons: ['pirateDagger', 'grapplingHook'], skill: 'ropeRunner',
    bio: 'The crew\'s youngest, and loudest. Master of the rope swing (he\'ll tell you so).' }),
  u({ id: 'gonzo', name: 'Gonzo', title: 'Pirate First Mate', race: 'hylian', classId: 'pirateFirstMate', size: 1, home: 'greatSea',
    stats: st(32, 12, 1, 9, 7, 10, 4, 7, 14, 5, 24, 0), weapons: ['pirateCutlass'], skill: 'captainsRightHand',
    bio: 'Tetra\'s burly first mate. He\'d take a cannonball for Miss Tetra, and has.' }),
  u({ id: 'salvatore', name: 'Salvatore', title: 'Artillery Specialist', race: 'hylian', classId: 'artillerySpecialist', size: 1, home: 'greatSea',
    stats: st(24, 5, 2, 14, 6, 5, 4, 10, 8, 4, 14, 4), weapons: ['pirateCannon'], skill: 'splooshKaboom',
    bio: 'Runs the Sploosh Kaboom game on Windfall. Knows exactly where every shot will land.' }),
  u({ id: 'beedle', name: 'Beedle', title: 'Traveling Merchant', race: 'hylian', classId: 'travelingMerchant', size: 1, home: 'greatSea',
    stats: st(20, 3, 2, 8, 8, 3, 5, 15, 6, 5, 12, 4), weapons: ['fairySlingshot', 'healStaff'], skill: 'customerRewards',
    bio: 'Thank you so much for shopping! The longer you survive, the better his prices.' }),
  u({ id: 'mila', name: 'Mila', title: 'Treasure Thief', race: 'hylian', classId: 'treasureThief', size: 1, home: 'greatSea',
    stats: st(18, 4, 2, 12, 13, 3, 4, 10, 4, 6, 14, 4), weapons: ['pirateDagger'], skill: 'lightFingers',
    bio: 'A rich girl from Windfall who fell on hard times, and learned to take what she wanted.' }),
  u({ id: 'lenzo', name: 'Lenzo', title: 'Pictographer', race: 'hylian', classId: 'pictographer', size: 1, home: 'greatSea',
    stats: st(22, 3, 5, 14, 6, 4, 7, 10, 6, 4, 10, 10), weapons: ['pictoFlash'], skill: 'perfectPicture',
    bio: 'Windfall\'s master pictographer. Once he\'s captured your weak spot, everyone knows it.' }),
  u({ id: 'valoo', name: 'Valoo', title: 'Sky Guardian', race: 'dragonDeity', classId: 'skyGuardian', size: 5, home: 'dragonRoost',
    stats: st(90, 23, 20, 10, 7, 19, 17, 10, 40, 6, 40, 40), weapons: ['valoosDragonfire', 'dragonClaws'], skill: 'dragonsBlessing', rare: true,
    bio: 'The great sky spirit who sleeps on Dragon Roost\'s peak. Grumpy when he has a thorn in his tail.' }),
  u({ id: 'jabun', name: 'Jabun', title: 'Ocean Guardian', race: 'aquaticDeity', classId: 'oceanGuardian', size: 5, home: 'outsetIsland',
    stats: st(95, 15, 18, 7, 4, 22, 20, 10, 40, 5, 40, 40), weapons: ['jabunBite', 'jabuTide'], skill: 'oceansProtection', rare: true,
    bio: 'The water spirit who guards Nayru\'s Pearl, hiding from Ganondorf in a cave behind Outset Island.' }),
  u({ id: 'zephos', name: 'Zephos', title: 'Wind Controller', race: 'windDeity', classId: 'windController', size: 2, home: 'greatSea',
    stats: st(32, 5, 19, 12, 14, 6, 17, 12, 10, 8, 16, 40), weapons: ['zephosGust'], skill: 'godOfWinds', abilities: ['windsRequiem'], rare: true,
    bio: 'The god of winds. Teaches whoever asks nicely how to turn the wind around.' }),
  u({ id: 'cyclos', name: 'Cyclos', title: 'Cyclone Sorcerer', race: 'windDeity', classId: 'cycloneSorcerer', size: 3, home: 'greatSea',
    stats: st(48, 8, 22, 11, 12, 9, 16, 8, 20, 7, 20, 45), weapons: ['cyclosCycloneStaff'], skill: 'godOfCyclones', rare: true,
    bio: 'Zephos\'s brother, the god of cyclones. Hates being shot at with arrows.' }),
  u({ id: 'fishman', name: 'Fishman', title: 'Marine Cartographer', race: 'aquaticCreature', classId: 'marineCartographer', size: 1, home: 'greatSea',
    stats: st(22, 5, 3, 10, 12, 4, 6, 10, 5, 7, 18, 8), weapons: ['fishmanBrush'], skill: 'seaCharting',
    bio: 'A talking fish who fills in your Sea Chart. Feed him and he\'ll tell you everything.' }),

  // ── Tetra's crew (generic pirates, renamed after the crew) ──
  u({ id: 'senza', name: 'Senza', title: 'Pirate Deckhand', race: 'hylian', classId: 'pirateInfantry', size: 1, home: 'greatSea', generic: true,
    stats: st(22, 6, 0, 7, 8, 5, 3, 7, 7, 5, 16, 0), weapons: ['pirateCutlass', 'grapplingHook'], skill: 'boardingParty',
    bio: 'The crew\'s big, quiet bruiser. First across the gangplank every time.' }),
  u({ id: 'nudge', name: 'Nudge', title: 'Pirate Swordsman', race: 'hylian', classId: 'pirateDuelist', size: 1, home: 'greatSea', generic: true,
    stats: st(24, 8, 0, 10, 10, 5, 3, 6, 8, 5, 18, 0), weapons: ['pirateCutlass'], skill: 'parryStance',
    bio: 'Lanky, nervous, and surprisingly good with a cutlass.' }),
  u({ id: 'zuko', name: 'Zuko', title: 'Pirate Lookout', race: 'hylian', classId: 'pirateScout', size: 1, home: 'greatSea', generic: true,
    stats: st(19, 4, 1, 11, 12, 3, 4, 8, 5, 6, 14, 2), weapons: ['fairyBow', 'pirateDagger'], skill: 'crowsNest', gear: { acc1: 'telescope' },
    bio: 'Up in the crow\'s nest with his telescope, he spots ships before they spot him.' }),
  u({ id: 'mako', name: 'Mako', title: 'Pirate Cannoneer', race: 'hylian', classId: 'pirateArtillery', size: 1, home: 'greatSea', generic: true,
    stats: st(26, 8, 0, 12, 5, 6, 3, 6, 12, 4, 18, 0), weapons: ['pirateCannon', 'pirateDagger'], skill: 'cannonDrill',
    bio: 'The crew\'s brain. Calculates every cannon shot from his book.' }),
  u({ id: 'pirateGrappler', name: 'Pirate Grappler', title: 'Skirmisher', race: 'hylian', classId: 'pirateSkirmisher', size: 1, home: 'greatSea', generic: true, glyph: 'PG',
    stats: st(21, 6, 0, 10, 12, 4, 3, 7, 6, 6, 18, 0), weapons: ['grapplingHook', 'pirateDagger'], skill: 'grappler',
    bio: 'Swings from ship to ship on a rope, dragging enemies along.' }),
];

export const GENERICS: UnitTemplate[] = [
  // Rito
  u({ id: 'ritoScout', name: 'Rito Scout', title: 'Flying Scout', race: 'rito', classId: 'flyingScout', size: 1, home: 'dragonRoost', generic: true, glyph: 'RS',
    stats: st(18, 4, 2, 9, 13, 3, 5, 7, 4, 8, 16, 4), weapons: ['ritoBow', 'pirateDagger'], skill: 'ritoScouting', bio: 'Flies ahead to see what\'s coming.' }),
  u({ id: 'ritoWarrior', name: 'Rito Warrior', title: 'Flying Infantry', race: 'rito', classId: 'flyingInfantry', size: 1, home: 'dragonRoost', generic: true, glyph: 'RW',
    stats: st(24, 8, 2, 10, 11, 5, 5, 6, 7, 7, 20, 4), weapons: ['ritoSpear'], skill: 'aerialStrike', bio: 'Dives on the enemy spear-first.' }),
  u({ id: 'ritoArcher', name: 'Rito Archer', title: 'Flying Archer', race: 'rito', classId: 'flyingArcher', size: 1, home: 'dragonRoost', generic: true, glyph: 'RA',
    stats: st(20, 6, 2, 12, 12, 4, 5, 7, 5, 7, 16, 4), weapons: ['ritoBow'], skill: 'highGround', bio: 'Shoots from above every obstacle.' }),
  u({ id: 'ritoGuardian', name: 'Rito Guardian', title: 'Flying Defender', race: 'rito', classId: 'flyingDefender', size: 1, home: 'dragonRoost', generic: true, glyph: 'RG',
    stats: st(28, 8, 2, 8, 8, 9, 6, 5, 9, 6, 22, 4), weapons: ['ritoSpear'], skill: 'skyShield', bio: 'Guards the flock\'s flanks in the air.' }),
  u({ id: 'ritoWindcaller', name: 'Rito Windcaller', title: 'Wind Mage', race: 'rito', classId: 'windMage', size: 1, home: 'dragonRoost', generic: true, glyph: 'RN',
    stats: st(19, 2, 11, 9, 10, 3, 10, 7, 4, 7, 12, 22), weapons: ['gustMagic', 'healStaff'], skill: 'tailwind', bio: 'Calls a tailwind for the whole squad.' }),
  u({ id: 'ritoCourier', name: 'Rito Courier', title: 'Flying Support', race: 'rito', classId: 'flyingSupport', size: 1, home: 'dragonRoost', generic: true, glyph: 'RU',
    stats: st(19, 3, 3, 8, 14, 3, 5, 8, 4, 9, 18, 6), weapons: ['ritoBow', 'healStaff'], skill: 'courierService', bio: 'Delivers supplies anywhere on the field.' }),
  // Korok
  u({ id: 'korokScout', name: 'Korok Scout', title: 'Forest Scout', race: 'korok', classId: 'korokForestScout', size: 1, home: 'forestHaven', generic: true, glyph: 'KS',
    stats: st(16, 3, 4, 8, 11, 2, 6, 9, 3, 6, 12, 10), weapons: ['fairySlingshot', 'korokWind'], skill: 'leafGlide', bio: 'Glides on a big leaf and vanishes into the trees.' }),
  u({ id: 'korokPlanter', name: 'Korok Planter', title: 'Terrain Support', race: 'korok', classId: 'terrainSupport', size: 1, home: 'forestHaven', generic: true, glyph: 'KP',
    stats: st(18, 2, 8, 7, 6, 4, 8, 8, 3, 5, 10, 18), weapons: ['korokWind', 'healStaff'], skill: 'greenThumb', bio: 'Plants trees wherever the army needs cover.' }),
  u({ id: 'korokWindMage', name: 'Korok Wind Mage', title: 'Nature Mage', race: 'korok', classId: 'natureMageWW', size: 1, home: 'forestHaven', generic: true, glyph: 'KW',
    stats: st(17, 2, 12, 9, 8, 3, 10, 8, 3, 5, 10, 24), weapons: ['korokWind'], skill: 'breezeCaller', bio: 'Its breezes knock enemies off balance.' }),
  u({ id: 'korokHealer', name: 'Korok Healer', title: 'Forest Healer', race: 'korok', classId: 'forestHealer', size: 1, home: 'forestHaven', generic: true, glyph: 'KH',
    stats: st(18, 1, 11, 8, 7, 3, 12, 9, 3, 5, 10, 24), weapons: ['healStaff', 'korokWind'], skill: 'forestMend', bio: 'Its forest magic mends everyone nearby.' }),
];

/** Vessels: recruitable ship units. */
export const VESSELS: UnitTemplate[] = [
  u({ id: 'smallRaft', name: 'Small Raft', title: 'Raft', race: 'vessel', classId: 'raftVessel', size: 2, home: 'greatSea', generic: true, glyph: 'SR',
    stats: st(25, 2, 0, 3, 3, 3, 2, 3, 12, 3, 15, 0), weapons: ['ramming'], skill: 'smallCraft', bio: 'A few logs lashed together. Carries 2.' }),
  u({ id: 'sailingBoat', name: 'Sailing Boat', title: 'Sailing Boat', race: 'vessel', classId: 'sailVessel', size: 2, home: 'greatSea', generic: true, glyph: 'SB',
    stats: st(35, 3, 0, 5, 6, 5, 3, 5, 15, 5, 20, 0), weapons: ['ramming', 'shipCannon'], skill: 'trimSails', gear: { sail: 'basicSail' }, bio: 'A nimble little sailboat. Carries 2.' }),
  u({ id: 'beedlesShopShip', name: "Beedle's Shop Ship", title: 'Merchant Ship', race: 'vessel', classId: 'merchantVessel', size: 3, home: 'greatSea', glyph: 'BS',
    stats: st(45, 3, 0, 5, 4, 6, 5, 12, 20, 4, 25, 0), weapons: ['ramming'], skill: 'floatingShop', gear: { sail: 'basicSail' }, bio: 'Beedle\'s floating store, complete with a giant gramophone horn. Carries 4.' }),
  u({ id: 'bokoblinRaft', name: 'Bokoblin Raft', title: 'Raft', race: 'vessel', classId: 'raftVessel', size: 3, home: 'greatSea', generic: true, glyph: 'BR', monster: true,
    stats: st(40, 5, 0, 5, 4, 5, 3, 4, 20, 4, 25, 0), weapons: ['ramming', 'shipCannon'], skill: 'bokoblinCrew', bio: 'A Bokoblin raft with a skull on a pole. Carries 4.' }),
  u({ id: 'gunboat', name: 'Gunboat', title: 'Gunboat', race: 'vessel', classId: 'gunboatVessel', size: 3, home: 'forsakenFortress', generic: true, glyph: 'GB', monster: true,
    stats: st(55, 12, 0, 10, 6, 10, 5, 4, 24, 5, 30, 0), weapons: ['shipCannon', 'ramming'], skill: 'armoredGunboat', bio: 'A horned, armored cannon boat from the Forsaken Fortress. Carries 3.' }),
  u({ id: 'pirateShip', name: 'Pirate Ship', title: 'Warship', race: 'vessel', classId: 'warshipVessel', size: 5, home: 'greatSea', generic: true, glyph: 'PS',
    stats: st(100, 18, 0, 12, 7, 15, 8, 8, 40, 6, 45, 0), weapons: ['shipCannon', 'navalHarpoon', 'ramming'], skill: 'flagship', gear: { sail: 'basicSail', flag: 'pirateFlag' },
    bio: 'A great three-sail pirate ship with cannons on both sides. Carries 8.' }),
  u({ id: 'ghostShip', name: 'Ghost Ship', title: 'Ghost Ship', race: 'vessel', classId: 'ghostVessel', size: 5, home: 'greatSea', glyph: 'GS', rare: true,
    stats: st(85, 12, 15, 10, 9, 10, 18, 5, 35, 7, 40, 35), weapons: ['ghostCannon', 'shipCannon'], skill: 'phantomVoyage', gear: { sail: 'basicSail', flag: 'ghostFlag' },
    bio: 'A cursed ship that sails only under certain moons. Carries 6.' }),
  u({ id: 'submarine', name: 'Submarine', title: 'Submarine', race: 'vessel', classId: 'submersible', size: 4, home: 'greatSea', generic: true, glyph: 'SU', monster: true,
    stats: st(75, 14, 0, 8, 4, 16, 10, 4, 32, 4, 35, 0), weapons: ['torpedo', 'ramming'], skill: 'submerge', bio: 'A barrel-shaped Bokoblin submarine. Carries 5.' }),
];

/** Passengers each vessel can carry. */
export const CAPACITY: Record<string, number> = {
  smallRaft: 2, sailingBoat: 2, beedlesShopShip: 4, bokoblinRaft: 4, gunboat: 3, pirateShip: 8, ghostShip: 6, submarine: 5, kingOfRedLions: 3,
};

/** Vessel equipment slots by size (smaller vessels have fewer). */
export const VESSEL_SLOTS_BY_SIZE: Record<number, ('hull' | 'sail' | 'utility' | 'flag')[]> = {
  2: ['hull', 'sail'], 3: ['hull', 'sail', 'utility'], 4: ['hull', 'sail', 'utility', 'flag'], 5: ['hull', 'sail', 'utility', 'flag'],
};

export const TEMPLATES: UnitTemplate[] = [...NAMED, ...GENERICS, ...VESSELS];
