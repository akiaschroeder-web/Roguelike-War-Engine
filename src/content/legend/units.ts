import type { RaceDef, Stats, UnitTemplate } from '../../engine/types';

/** Stat order matches the design doc table: HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP. */
export const st = (
  hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number,
): Stats => ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });

const u = (t: UnitTemplate): UnitTemplate => t;

export const RACES: RaceDef[] = [
  { id: 'dreamCreature', name: 'Dream Creature', desc: 'A being of the Wind Fish\'s dream. It flies, and it never sleeps.', flies: true, tags: ['divine', 'dream'] },
  { id: 'nightmare', name: 'Nightmare', desc: 'A shadow that feeds on a dreamer\'s fear. Demonic.', tags: ['demon', 'nightmare'], lavaImmune: true },
  { id: 'guardianTree', name: 'Guardian Tree', desc: 'An ancient Maku Tree, rooted in place. Weak to fire.', tags: ['plant', 'divine'], weakTo: ['fire'], growthMods: { hp: 20, spd: -20 } },
  { id: 'animalCompanion', name: 'Animal Companion', desc: 'Ricky, Dimitri and Moosh: friends who carry a small rider (and fight on their own).', tags: ['beast', 'companion'] },
  { id: 'chainChomp', name: 'Chain Chomp', desc: 'An iron ball with teeth and an appetite. Eats plant monsters.', tags: ['beast', 'metal'], growthMods: { def: 10 } },
  { id: 'cuccoBird', name: 'Flying Rooster', desc: 'A rooster revived from the dead, who lifts friends over obstacles.', flies: true, tags: ['beast'] },
];

// Section 1-2 characters (doc stats), the Oracles and the animal companions.
// Forms (formOf) share progression with their character and are never offered at recruitment.
export const TEMPLATES: UnitTemplate[] = [
  // ── Main characters ──
  u({ id: 'heroOfLegend', name: 'Link (Hero of Legend)', title: 'Legendary Adventurer', race: 'hylian', classId: 'legendaryAdventurer', size: 1, home: 'hyruleCastleLttP', glyph: 'LL',
    stats: st(32, 15, 9, 15, 13, 10, 8, 14, 10, 6, 32, 24), weapons: ['fightersSword', 'fairyBow', 'boomerang'], skill: 'fourAdventures',
    extraSkills: ['legendaryAdaptability', 'secretDiscovery'], abilities: ['pegasusDash', 'hurricaneSpin', 'secretDiscoveryAbility'], gear: { shield: 'fightersShield' },
    artByGear: [
      { ids: ['rodOfSeasons'], art: 'heroOfLegendRod' },
      { ids: ['harpOfAges'], art: 'heroOfLegendHarp' },
      { ids: ['koholintSword', 'rocsFeather', 'rocsCape'], art: 'heroOfLegendJump' },
    ],
    bio: 'The boy who woke to his uncle\'s voice on a stormy night, crossed into the Dark World, washed up on Koholint and was called by the Triforce to Holodrum and Labrynna. One hero, four adventures.' }),
  u({ id: 'zeldaLegend', name: 'Zelda (Era of Legend)', title: 'Sacred Maiden', race: 'hylian', classId: 'sacredMaiden', size: 1, home: 'hyruleCastleLttP', glyph: 'ZL',
    stats: st(25, 3, 23, 14, 10, 5, 23, 16, 5, 5, 16, 50), weapons: ['sageSceptre', 'healStaff'], skill: 'bloodlineOfTheSages',
    abilities: ['sacredLightLegend', 'maidensBlessing', 'sealDarkness', 'telepathicGuidance'],
    bio: 'A descendant of the Seven Sages, who called for help through walls and dreams when Agahnim locked her away, and later went to Labrynna and Holodrum herself.' }),
  u({ id: 'ganonLegend', name: 'Ganon (King of Darkness)', title: 'Trident Warlord', race: 'demon', classId: 'tridentWarlord', size: 3, home: 'ganonsTowerLttP', glyph: 'GK',
    stats: st(90, 28, 28, 18, 12, 23, 24, 5, 32, 6, 45, 65), weapons: ['ganonsTridentLegend', 'blazingBats'], skill: 'powerOfTheTriforce',
    abilities: ['tridentThrow', 'blazingBatSwarm', 'darkTeleportation', 'earthquakeGanon', 'darknessShroud', 'demonicRestoration'], rare: true,
    bio: 'The King of Darkness, sealed in the Golden Land until it became the Dark World. Silver arrows frighten him; the Twinrova sisters would raise him again.' }),
  // ── A Link to the Past ──
  u({ id: 'linksUncle', name: "Link's Uncle", title: 'Hylian Swordsman', race: 'hylian', classId: 'hylianSwordsman', size: 1, home: 'hyruleCastleLttP', glyph: 'UN',
    stats: st(30, 13, 2, 12, 9, 11, 5, 8, 11, 5, 28, 6), weapons: ['unclesSword'], skill: 'familyLegacy', gear: { shield: 'fightersShield' },
    bio: '"Link, I\'m going out for a while. I\'ll be back by morning." A knight of Hyrule\'s royal line who went into the castle sewers alone.' }),
  u({ id: 'sahasrahla', name: 'Sahasrahla', title: 'Elder Sage', race: 'hylian', classId: 'elderSage', size: 1, home: 'easternPalace', glyph: 'SA',
    stats: st(24, 3, 23, 17, 5, 5, 22, 15, 5, 4, 12, 55), weapons: ['sahasrahlasStaff', 'healStaff'], skill: 'ancientKnowledge', abilities: ['telepathicCounsel'],
    bio: 'The elder of Kakariko, descendant of the Seven Wise Men, who reads the Pendants and speaks to the hero across any distance.' }),
  u({ id: 'aginah', name: 'Aginah', title: 'Desert Sage', race: 'hylian', classId: 'desertSage', size: 1, home: 'desertPalace', glyph: 'AG',
    stats: st(22, 3, 17, 14, 7, 4, 18, 12, 5, 4, 12, 38), weapons: ['fireSageStaff', 'healStaff'], skill: 'desertWisdom',
    bio: 'Sahasrahla\'s younger brother, who studies the Desert of Mystery in a cave near the Desert Palace.' }),
  u({ id: 'syrup', name: 'Syrup', title: 'Witch', race: 'hylian', classId: 'witch', size: 1, home: 'mysteriousForest', glyph: 'SY',
    stats: st(23, 2, 20, 15, 6, 4, 19, 16, 4, 4, 12, 45), weapons: ['syrupsBrewingStaff', 'healStaff'], skill: 'potionBrewing', abilities: ['brewPotion'],
    bio: 'The cackling witch of the potion shop, who turns mushrooms into Magic Powder and charges plenty for her medicine.' }),
  u({ id: 'fluteBoy', name: 'Flute Boy', title: 'Traveling Musician', race: 'hylian', classId: 'travelingMusician', size: 1, home: 'darkWorld', glyph: 'FB',
    stats: st(21, 3, 12, 13, 10, 4, 11, 15, 4, 5, 16, 30), weapons: ['fluteBoysOcarina', 'fairySlingshot'], skill: 'forestMelody', abilities: ['forestSong'],
    bio: 'A boy who played in the Haunted Grove until the Dark World turned him into a creature of the woods. He gave his flute to the hero.' }),
  u({ id: 'agahnim', name: 'Agahnim', title: 'Dark Wizard', race: 'hylian', classId: 'darkWizard', size: 1, home: 'hyruleCastleLttP', glyph: 'AH',
    stats: st(44, 5, 29, 19, 13, 8, 24, 7, 7, 6, 20, 65), weapons: ['agahnimsScepter', 'energyBall'], skill: 'falseMagicSkill',
    abilities: ['energyBallVolley', 'lightningSpread', 'illusoryTeleport', 'sendToDarkWorld'], gear: { body: 'agahnimsRobes' }, rare: true,
    bio: 'The wizard who came out of nowhere, ended a plague of disasters and took the throne\'s ear — then sent the Seven Maidens to the Dark World one by one. Ganon\'s alter ego.' }),
  // ── Link's Awakening ──
  u({ id: 'marin', name: 'Marin', title: 'Dream Singer', race: 'hylian', classId: 'dreamSinger', size: 1, home: 'mabeVillage', glyph: 'MA',
    stats: st(24, 3, 20, 15, 11, 4, 19, 18, 5, 5, 16, 42), weapons: ['marinsHarp', 'healStaff'], skill: 'balladOfTheWindFishSkill', abilities: ['balladOfTheWindFish'],
    bio: 'The girl who found the hero washed up on Toronbo Shores. She sings the Ballad of the Wind Fish and wants to see the world beyond the sea.' }),
  u({ id: 'tarin', name: 'Tarin', title: 'Forager', race: 'hylian', classId: 'forager', size: 1, home: 'mabeVillage', glyph: 'TA',
    stats: st(28, 9, 0, 7, 6, 8, 5, 14, 10, 4, 22, 0), weapons: ['tarinsStick'], skill: 'mushroomHunter',
    bio: 'Marin\'s father, a cheerful man with a moustache who loves mushrooms and once poked a beehive with a stick.' }),
  u({ id: 'bowwow', name: 'BowWow', title: 'Chain Chomp', race: 'chainChomp', classId: 'chainChompClass', size: 1, home: 'mabeVillage', glyph: 'BW',
    stats: st(35, 19, 0, 11, 13, 13, 5, 8, 14, 7, 32, 0), weapons: ['chompBite'], skill: 'voraciousAppetite',
    bio: 'Madam MeowMeow\'s beloved pet, who was kidnapped by Moblins and then eats the Goponga Flowers in the swamp.' }),
  u({ id: 'flyingRooster', name: 'Flying Rooster', title: 'Flying Companion', race: 'cuccoBird', classId: 'flyingCompanion', size: 1, home: 'talTalHeights', glyph: 'FR',
    stats: st(18, 5, 3, 10, 15, 3, 6, 12, 8, 9, 28, 8), weapons: ['roosterPeck'], skill: 'flightAssistance', abilities: ['carryAlly'],
    bio: 'Mabe Village\'s weather-vane rooster, revived by the Frog\'s Song of Soul. It lifts a friend above pits and walls.' }),
  u({ id: 'windFish', name: 'The Wind Fish', title: 'Dream Deity', race: 'dreamCreature', classId: 'dreamDeity', size: 5, home: 'windFishsEgg', glyph: 'WF',
    stats: st(100, 12, 35, 20, 8, 18, 32, 25, 40, 6, 35, 90), weapons: ['windFishsSong', 'windFishsBody'], skill: 'livingDream', abilities: ['awakeningSong'], rare: true,
    bio: 'The great whale who sleeps in the egg on Mt. Tamaranch and dreams Koholint into being. When it wakes, the island fades.' }),
  // ── The Oracles ──
  u({ id: 'din', name: 'Din', title: 'Oracle of Seasons', race: 'hylian', classId: 'oracleOfSeasonsClass', size: 1, home: 'horonVillage', glyph: 'DI',
    stats: st(28, 5, 26, 15, 13, 6, 22, 17, 5, 6, 20, 60), weapons: ['dinsDanceFire', 'healStaff'], skill: 'seasonalHarmony', abilities: ['changeSeasonDin', 'dinsDance'],
    bio: 'The dancer of Holodrum\'s troupe, whose dance keeps the seasons turning. Onox stole her away and sank the Temple of Seasons.' }),
  u({ id: 'nayru', name: 'Nayru', title: 'Oracle of Ages', race: 'hylian', classId: 'oracleOfAgesClass', size: 1, home: 'lynnaVillage', glyph: 'NA',
    stats: st(25, 3, 28, 16, 10, 5, 26, 18, 4, 5, 16, 70), weapons: ['nayrusHarp', 'healStaff'], skill: 'temporalHarmony', abilities: ['actionReset', 'songOfAges'],
    bio: 'The singer of Lynna Village whose songs keep time flowing. Veran hid inside her and used her body to rewrite history.' }),
  u({ id: 'farore', name: 'Farore', title: 'Oracle of Secrets', race: 'hylian', classId: 'oracleOfSecretsClass', size: 1, home: 'lynnaCity', glyph: 'FA',
    stats: st(24, 3, 24, 20, 12, 4, 23, 22, 4, 5, 16, 60), weapons: ['faroresBook', 'healStaff'], skill: 'keeperOfSecrets', abilities: ['revealSecrets', 'faroresCounsel'],
    bio: 'The Oracle of Secrets, who never leaves the Maku Tree\'s side and keeps the passwords that bind two worlds together.' }),
  u({ id: 'ralph', name: 'Ralph', title: 'Royal Swordsman', race: 'hylian', classId: 'royalSwordsman', size: 1, home: 'lynnaVillage', glyph: 'RA',
    stats: st(29, 14, 2, 14, 14, 8, 5, 9, 9, 6, 30, 5), weapons: ['ralphsSword'], skill: 'recklessCourage', abilities: ['heroicCharge'],
    bio: 'Nayru\'s childhood friend, a descendant of Queen Ambi, who charges ahead of the hero to save her and usually gets there second.' }),
  u({ id: 'impaOracle', name: 'Impa (Oracle Era)', title: 'Royal Nursemaid', race: 'sheikah', classId: 'royalNursemaid', size: 1, home: 'lynnaVillage', glyph: 'IO',
    stats: st(26, 5, 13, 12, 6, 7, 14, 12, 9, 4, 18, 28), weapons: ['healStaff', 'impasKnife'], skill: 'royalCaretaker',
    bio: 'Zelda\'s nursemaid, who travelled with the Oracles — and was possessed by Veran first, then pushed a stone for the hero.' }),
  u({ id: 'queenAmbi', name: 'Queen Ambi', title: 'Royal Commander', race: 'hylian', classId: 'royalCommander', size: 1, home: 'lynnaCity', glyph: 'QA',
    stats: st(27, 4, 15, 15, 8, 7, 16, 14, 6, 5, 18, 35), weapons: ['ambisSpear', 'healStaff'], skill: 'royalConstruction', abilities: ['raiseBarricade'], gear: { head: 'queenAmbisCrown' },
    bio: 'The queen of Labrynna 400 years ago, who forced her people to build the Black Tower under Veran\'s spell — and freed them once she was herself again.' }),
  u({ id: 'makuTreeHolodrum', name: 'Maku Tree (Holodrum)', title: 'Guardian Tree', race: 'guardianTree', classId: 'guardianTreeClass', size: 5, home: 'horonVillage', glyph: 'MH',
    stats: st(110, 8, 24, 12, 2, 25, 28, 18, 45, 0, 20, 80), weapons: ['makuRoots', 'healStaff'], skill: 'essenceOfNature', rare: true,
    bio: 'The old Maku Tree of Horon Village, guardian of Holodrum, who gives the hero the Essences\' meaning and a Maku Seed.' }),
  u({ id: 'makuTreeLabrynna', name: 'Maku Tree (Labrynna)', title: 'Guardian Tree', race: 'guardianTree', classId: 'guardianTreeClass', size: 5, home: 'lynnaCity', glyph: 'ML',
    stats: st(100, 6, 29, 15, 2, 22, 32, 20, 45, 0, 20, 90), weapons: ['makuRoots', 'healStaff'], skill: 'essenceOfTime', rare: true,
    bio: 'The young Maku Tree of Lynna City, a sprout in the past and a shy guardian with a pink flower in the present.' }),
  u({ id: 'ricky', name: 'Ricky', title: 'Boxing Kangaroo', race: 'animalCompanion', classId: 'boxingKangaroo', size: 2, home: 'natzu', glyph: 'RI',
    stats: st(38, 18, 3, 15, 15, 10, 6, 10, 15, 7, 38, 8), weapons: ['rickysPunches'], skill: 'hurricanePunch', gear: { hands: 'rickysBoxingGloves' },
    bio: 'A kangaroo boxer from the Natzu Region who lost his gloves and will carry anyone who finds them. He hops cliffs in a single bound.' }),
  u({ id: 'dimitri', name: 'Dimitri', title: 'Aquatic Dodongo', race: 'animalCompanion', classId: 'aquaticDodongo', size: 2, home: 'natzu', glyph: 'DM',
    stats: st(45, 16, 2, 10, 8, 17, 8, 10, 20, 5, 35, 5), weapons: ['dimitriBite'], skill: 'riverTraveler',
    bio: 'A gentle, swimming Dodongo that the villagers took for a monster. In the water he swims against any current, and he swallows enemies whole.' }),
  u({ id: 'moosh', name: 'Moosh', title: 'Flying Bear', race: 'animalCompanion', classId: 'flyingBear', size: 2, home: 'natzu', glyph: 'MO',
    stats: st(48, 21, 0, 9, 7, 13, 7, 12, 24, 6, 35, 0), weapons: ['mooshPound'], skill: 'hoveringGiant',
    bio: 'A blue bear with little wings, nervous and teased by the Spiked Beetles, who flutters over pits and comes down hard.' }),

  // ── Forms (shared progression; never offered at recruitment) ──
  u({ id: 'nayruPossessed', name: 'Possessed Nayru', title: 'Vessel of Veran', race: 'hylian', classId: 'possessedOracle', size: 1, home: 'blackTower', glyph: 'PN', formOf: 'nayru',
    stats: st(30, 4, 30, 16, 10, 6, 26, 6, 5, 5, 16, 70), weapons: ['veransShadowBolt', 'nayrusHarp'], skill: 'possessedVessel', abilities: ['timeWarpCurse'], rare: true,
    bio: 'Nayru, with the Sorceress of Shadows inside her. Veran uses the Oracle of Ages\' power to send history backward — and shields herself with Nayru\'s body.' }),
  u({ id: 'onoxDragon', name: 'Dark Dragon Onox', title: 'Dragon of Darkness', race: 'demon', classId: 'darkDragon', size: 4, home: 'templeOfSeasons', glyph: 'DO', formOf: 'onox',
    stats: st(95, 30, 20, 15, 9, 24, 18, 5, 36, 6, 45, 35), weapons: ['dragonClaws', 'darkFireBreath'], skill: 'dragonOfDarkness', abilities: ['aerialBombardment'], rare: true,
    bio: 'Onox\'s true shape: a black dragon with a fiery breath who drags Din down into the earth with him.' }),
  u({ id: 'veranFairy', name: 'Veran (Fairy Form)', title: 'Sorceress of Shadows', race: 'demon', classId: 'shadowFairy', size: 1, home: 'blackTower', glyph: 'VF', formOf: 'veran',
    stats: st(45, 5, 32, 20, 18, 8, 28, 9, 6, 8, 20, 75), weapons: ['veransShadowBolt'], skill: 'illusoryFairy', abilities: ['fairyIllusion'], rare: true,
    bio: 'Veran\'s fairy shape, quick and flickering, that flies out of a possessed body when the Mystery Seeds strike.' }),
  u({ id: 'veranTurtle', name: 'Veran (Turtle Form)', title: 'Sorceress of Shadows', race: 'demon', classId: 'shellBeast', size: 3, home: 'blackTower', glyph: 'VT', formOf: 'veran',
    stats: st(70, 22, 18, 14, 6, 26, 18, 6, 30, 4, 35, 40), weapons: ['shellSlam'], skill: 'heavyShell', abilities: ['groundPound'], rare: true,
    bio: 'A great purple turtle. Its shell turns every blade; it must be flipped over to be hurt.' }),
  u({ id: 'veranSpider', name: 'Veran (Spider Form)', title: 'Sorceress of Shadows', race: 'demon', classId: 'webSpider', size: 3, home: 'blackTower', glyph: 'VS', formOf: 'veran',
    stats: st(65, 20, 20, 17, 14, 15, 16, 6, 24, 7, 35, 40), weapons: ['venomFangs'], skill: 'webPursuit', abilities: ['webShot'], rare: true,
    bio: 'A purple spider that skitters after its prey and webs the floor.' }),
  u({ id: 'veranBee', name: 'Veran (Bee Form)', title: 'Sorceress of Shadows', race: 'demon', classId: 'queenBee', size: 2, home: 'blackTower', glyph: 'VB', formOf: 'veran',
    stats: st(58, 18, 24, 18, 17, 12, 18, 6, 18, 8, 35, 45), weapons: ['stinger'], skill: 'hiveQueenVeran', abilities: ['summonBees'], rare: true,
    bio: 'A queen bee the size of a horse, who dives at her foes and calls up a swarm.' }),
];

/** Animal companions that double as mounts (their flutes are mount gear). */
export const ANIMAL_COMPANIONS = ['ricky', 'dimitri', 'moosh'];
/** Template id -> the form it is (for the tests and the transformation code). */
export const FORM_TEMPLATES = TEMPLATES.filter((t) => t.formOf).map((t) => t.id);
