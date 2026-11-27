import type { BossDef, EnemyArchetype, Stats } from '../../engine/types';
import { st } from './units';

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

// Section 3's five new monsters, and the Wizzrobe family this pack creates (Wizzrobe, the Boss
// Wizzrobe — stronger than a Wizzrobe, weaker than Agahnim — and the three elemental Wizzrobes).
export const ENEMIES: EnemyArchetype[] = [
  e('antiFairy', 'Anti-Fairy', 'cursedSpirit', 'undead', ['antiFairyTouch'], st(16, 3, 12, 9, 14, 3, 15, 3, 2, 7, 12, 25), { skill: 'magicDrain', glyph: 'AF' }),
  e('buzzBlob', 'Buzz Blob', 'electricSlime', 'chuchu', ['buzzShock'], st(22, 6, 12, 7, 7, 5, 10, 5, 5, 4, 16, 22), { skill: 'electricalBody', glyph: 'BB' }),
  e('cukeman', 'Cukeman', 'strangeSlime', 'chuchu', ['cukemanSlap'], st(24, 5, 14, 11, 6, 5, 12, 12, 5, 4, 15, 25), { skill: 'powderMutationSkill', glyph: 'CU' }),
  e('subterror', 'Subterror', 'burrowingBeast', 'monster', ['subterrorClaws'], st(36, 16, 0, 12, 11, 13, 5, 4, 15, 6, 30, 0), { size: 2, skill: 'undergroundAmbush', glyph: 'ST' }),
  e('smasher', 'Smasher', 'heavyThrower', 'monster', ['ironBall'], st(40, 19, 0, 12, 7, 14, 5, 5, 22, 4, 35, 0), { size: 2, skill: 'ironBallThrow', glyph: 'SM' }),
  e('wizzrobe', 'Wizzrobe', 'wizzrobeCaster', 'monster', ['wizzrobeBolt'], st(26, 3, 15, 12, 11, 4, 13, 5, 4, 5, 18, 30), { skill: 'wizzrobeBlink', glyph: 'WZ' }),
  e('meteoWizzrobe', 'Meteo Wizzrobe', 'wizzrobeCaster', 'monster', ['meteoFlame'], st(30, 3, 18, 13, 12, 5, 15, 5, 4, 5, 20, 36), { skill: 'wizzrobeBlink', glyph: 'MW' }),
  e('thunderWizzrobe', 'Thunder Wizzrobe', 'wizzrobeCaster', 'monster', ['thunderBolt'], st(30, 3, 18, 14, 13, 5, 15, 5, 4, 5, 20, 36), { skill: 'wizzrobeBlink', glyph: 'TW' }),
  e('blizzrobe', 'Blizzrobe', 'wizzrobeCaster', 'monster', ['blizzardBolt'], st(30, 3, 18, 13, 11, 6, 16, 5, 4, 5, 20, 36), { skill: 'wizzrobeBlink', glyph: 'BZ' }),
  e('bossWizzrobe', 'Boss Wizzrobe', 'wizzrobeCaster', 'monster', ['masterWizzrobeBolt'], st(40, 4, 24, 16, 13, 7, 20, 6, 6, 6, 22, 55), { skill: 'grandWizzrobe', glyph: 'GW' }),
];

const b = (d: BossDef): BossDef => d;

export const BOSSES: BossDef[] = [
  // ── A Link to the Past ──
  b({ id: 'helmasaurKing', name: 'Helmasaur King', title: 'Armored Tyrant', home: 'darkWorld', race: 'monster', classId: 'armoredTyrant', size: 4, glyph: 'HK',
    weapons: ['maskRam', 'helmasaurFireball'], skill: 'armoredMask', stats: st(90, 24, 8, 11, 7, 30, 12, 4, 40, 5, 45, 20),
    quote: '(A great armored beast crawls out of the Palace of Darkness, its face hidden behind an iron mask. Swords skid off it.)', drops: ['helmasaurKingsMask', 'magicHammer'] }),
  b({ id: 'arrghus', name: 'Arrghus', title: 'Swamp Eye', home: 'darkWorld', race: 'aquatic', classId: 'arrgiSwarm', size: 3, glyph: 'AR',
    weapons: ['arrghusPuff'], skill: 'protectiveArrgi', stats: st(72, 15, 18, 13, 10, 16, 18, 5, 28, 5, 30, 40),
    quote: '(A single great eye floats over the swamp water, wrapped in a cloud of little puffballs.)', drops: ['zorasFlippers', 'blueMail'] }),
  b({ id: 'blind', name: 'Blind the Thief', title: 'Headless Thief', home: 'darkWorld', race: 'demon', classId: 'headlessThief', size: 2, glyph: 'BL',
    weapons: ['blindLaser'], skill: 'detachedHeads', stats: st(48, 12, 24, 16, 15, 8, 20, 8, 10, 7, 24, 50),
    quote: '"Don\'t open the curtains." (Something in white robes rises from the floor. It has too many heads.)', drops: ['titansMitt'] }),
  b({ id: 'kholdstare', name: 'Kholdstare', title: 'Frozen Eye', home: 'darkWorld', race: 'monster', classId: 'frozenEye', size: 3, glyph: 'KH',
    weapons: ['kholdstareIce'], skill: 'frozenPrison', abilities: ['kholdstareHail'], stats: st(80, 18, 25, 13, 8, 22, 23, 4, 30, 5, 32, 55),
    quote: '(Black tendrils and a single blue eye, locked in a block of ice under the lake. The ice is cracking.)', drops: ['redShield', 'etherMedallion'] }),
  b({ id: 'vitreous', name: 'Vitreous', title: 'Eye Colony', home: 'darkWorld', race: 'monster', classId: 'eyeColony', size: 4, glyph: 'VI',
    weapons: ['vitreousLightning'], skill: 'watchingEyes', abilities: ['vitreousStorm', 'eyeVolley'], stats: st(95, 10, 28, 20, 3, 16, 25, 5, 35, 2, 24, 65),
    quote: '(A pool of slime full of eyes. One great eye in the middle opens, and the air crackles.)', drops: ['caneOfSomaria', 'bombosMedallion'] }),
  b({ id: 'trinexx', name: 'Trinexx', title: 'Dual-Element Hydra', home: 'ganonsTowerLttP', race: 'monster', classId: 'elementalHydra', size: 4, glyph: 'TX',
    weapons: ['trinexxFire', 'trinexxIce', 'trinexxShell'], skill: 'dualElements', stats: st(110, 27, 29, 15, 7, 25, 26, 5, 45, 5, 45, 65),
    quote: '(A great stone turtle with three heads: one of rock, one breathing fire, one breathing ice.)', drops: ['trinexxsScale', 'redMail'] }),
  // ── Link's Awakening ──
  b({ id: 'genie', name: 'Genie', title: 'Bottle Genie', home: 'mabeVillage', race: 'demon', classId: 'bottleGenie', size: 2, glyph: 'GE',
    weapons: ['genieFireball'], skill: 'magicBottle', abilities: ['genieFlames'], stats: st(50, 13, 21, 13, 12, 10, 18, 8, 15, 6, 25, 45),
    quote: '"Ho ho ho! Can you catch me?" (A grinning genie pops out of a pot and back in again.)', drops: ['conchHorn'] }),
  b({ id: 'slimeEye', name: 'Slime Eye', title: 'Dividing Eye', home: 'mysteriousForest', race: 'chuchu', classId: 'dividingEye', size: 3, glyph: 'SE',
    weapons: ['slimeEyeSlam'], skill: 'dividingBody', stats: st(65, 17, 5, 10, 9, 14, 10, 4, 25, 5, 30, 12),
    quote: '(A huge jelly with a single eye drops from the ceiling. It wobbles, as if it might come apart.)', drops: ['seaLilysBell'] }),
  b({ id: 'anglerFish', name: 'Angler Fish', title: 'Underwater Predator', home: 'mysteriousForest', race: 'aquatic', classId: 'deepPredator', size: 3, glyph: 'AN',
    weapons: ['anglerBite'], skill: 'underwaterPredator', stats: st(60, 22, 5, 11, 12, 15, 9, 4, 25, 7, 35, 12),
    quote: '(A light bobs in the deep water. Behind it, an enormous mouth.)', drops: ['surfHarp'] }),
  b({ id: 'slimeEel', name: 'Slime Eel', title: 'Burrowing Eel', home: 'animalVillage', race: 'aquatic', classId: 'burrowingEel', size: 3, glyph: 'SL',
    weapons: ['slimeEelBite'], skill: 'burrowingHeads', stats: st(70, 20, 10, 12, 13, 16, 12, 4, 25, 5, 35, 20),
    quote: '(Holes in the walls. Something long and slimy watches you from all of them.)', drops: ['windMarimba'] }),
  b({ id: 'facade', name: 'Facade', title: 'Living Floor', home: 'animalVillage', race: 'monster', classId: 'livingFloor', size: 3, glyph: 'FC',
    weapons: ['facadeHex'], skill: 'livingFloorSkill', stats: st(75, 8, 26, 16, 2, 20, 24, 5, 35, 0, 20, 60),
    quote: '"Hee hee hee... I am the floor." (A face grins up from the tiles. The tiles start to lift.)', drops: ['coralTriangle'] }),
  b({ id: 'evilEagle', name: 'Evil Eagle', title: 'Gale Raptor', home: 'talTalHeights', race: 'monster', classId: 'galeRaptor', size: 3, glyph: 'EE',
    weapons: ['eagleTalons', 'eagleFeathers'], skill: 'galeForce', abilities: ['galeWings'], stats: st(65, 21, 15, 18, 18, 12, 13, 7, 22, 9, 38, 30),
    quote: '(At the top of Eagle\'s Tower, a skull-faced bird screams and beats its wings. The wind nearly knocks you off.)', drops: ['eveningCalmOrgan'] }),
  b({ id: 'hotHead', name: 'Hot Head', title: 'Living Flame', home: 'talTalHeights', race: 'monster', classId: 'livingFlame', size: 3, glyph: 'HH',
    weapons: ['hotHeadFire'], skill: 'livingFlameSkill', abilities: ['lavaBurst'], stats: st(70, 18, 26, 13, 12, 15, 22, 4, 25, 7, 32, 50),
    quote: '(A living fireball rises out of the lava of Turtle Rock, laughing.)', drops: ['thunderDrum'] }),
  b({ id: 'shadowNightmare', name: 'Shadow Nightmare', title: 'Dream Devourer', home: 'windFishsEgg', race: 'nightmare', classId: 'nightmareShadow', size: 3, glyph: 'SN',
    weapons: ['nightmareTendrils'], skill: 'nightmareTransformation', abilities: ['nightmareShift'], stats: st(100, 25, 32, 18, 17, 20, 27, 5, 30, 7, 42, 75),
    quote: '"You must not wake the Wind Fish! If the Wind Fish wakes, the island will vanish — and so will we!"', drops: ['nightmareEssence', 'windFishsBlessing'] }),
  // ── Oracle of Seasons ──
  b({ id: 'medusaHead', name: 'Medusa Head', title: 'Petrifying Head', home: 'tarmRuins', race: 'monster', classId: 'petrifyingHead', size: 3, glyph: 'MD',
    weapons: ['medusaBeam'], skill: 'petrifyingGaze', abilities: ['petrifyingStare'], stats: st(65, 13, 29, 18, 12, 12, 25, 5, 20, 6, 24, 60),
    quote: '(A snake-haired head hovers in the Sword & Shield Maze. Don\'t look it in the eye.)', drops: ['medusasEye'] }),
  b({ id: 'onox', name: 'General Onox', title: 'General of Darkness', home: 'templeOfSeasons', race: 'demon', classId: 'generalOfDarknessClass', size: 2, glyph: 'ON',
    weapons: ['onoxsFlail'], skill: 'generalOfDarkness', abilities: ['onoxTransform', 'flailSweep'], stats: st(70, 29, 14, 15, 9, 25, 16, 5, 28, 5, 45, 25),
    quote: '"Ha! A child with a sword? The seasons are mine now, and so is the Oracle."', drops: ['onoxsArmor', 'rodOfSeasons'] }),
  // ── Oracle of Ages ──
  b({ id: 'pumpkinHead', name: 'Pumpkin Head', title: 'Headless Spirit', home: 'lynnaCity', race: 'undead', classId: 'headlessSpirit', size: 2, glyph: 'PH',
    weapons: ['pumpkinFire'], skill: 'headlessSpiritSkill', stats: st(45, 16, 12, 11, 9, 14, 13, 6, 15, 5, 28, 24),
    quote: '(A ghostly body in a cape, with a great pumpkin for a head. It grins and spits fire.)', drops: ['powerBraceletL2'] }),
  b({ id: 'headThwomp', name: 'Head Thwomp', title: 'Rotating Faces', home: 'lynnaVillage', race: 'construct', classId: 'thwompGuardian', size: 3, glyph: 'HT',
    weapons: ['thwompSlam'], skill: 'rotatingFaces', stats: st(85, 27, 10, 8, 4, 30, 15, 4, 40, 3, 40, 20),
    quote: '(A great stone face turns, and turns again. One of its faces is open.)', drops: ['switchHook'] }),
  b({ id: 'shadowHag', name: 'Shadow Hag', title: 'Shadow Witch', home: 'lynnaVillage', race: 'undead', classId: 'shadowWitch', size: 2, glyph: 'SH',
    weapons: ['hagCurse'], skill: 'shadowDivision', abilities: ['shadowCurse'], stats: st(48, 6, 26, 17, 16, 7, 23, 8, 8, 7, 20, 55),
    quote: '(Four shadows move on the floor, and only one of them casts its witch.)', drops: ['seedShooter'] }),
  b({ id: 'eyesoar', name: 'Eyesoar', title: 'Orbiting Eye', home: 'crescentIsland', race: 'monster', classId: 'orbitingEye', size: 3, glyph: 'EY',
    weapons: ['eyesoarBeam'], skill: 'orbitingEyes', abilities: ['eyeVolley'], stats: st(70, 15, 23, 18, 13, 15, 20, 6, 25, 7, 30, 45),
    quote: '(A great eye in the Skull Dungeon, four smaller eyes circling it like moons.)', drops: ['mermaidSuit'] }),
  b({ id: 'smog', name: 'Smog', title: 'Cloud Beast', home: 'rollingRidge', race: 'monster', classId: 'cloudBeast', size: 3, glyph: 'SG',
    weapons: ['smogLightning'], skill: 'cloudAssembly', abilities: ['smogStorm'], stats: st(65, 10, 25, 14, 10, 10, 25, 6, 22, 6, 24, 55),
    quote: '(A green cloud with one eye pours out of the walls of the Crown Dungeon, crackling.)', drops: ['magneticGloves'] }),
  b({ id: 'octogon', name: 'Octogon', title: 'Amphibious Octo', home: 'zoraSeas', race: 'aquatic', classId: 'amphibiousOcto', size: 3, glyph: 'OC',
    weapons: ['octogonTentacles', 'octogonInk'], skill: 'amphibiousAssault', abilities: ['inkCloud'], stats: st(70, 21, 12, 14, 13, 16, 13, 5, 28, 7, 35, 25),
    quote: '(A red octopus guards Jabu-Jabu\'s Belly. Under the water it is faster than you.)', drops: ['longHook'] }),
  b({ id: 'ramrock', name: 'Ramrock', title: 'Changing Arsenal', home: 'rollingRidge', race: 'construct', classId: 'arsenalGolem', size: 3, glyph: 'RR',
    weapons: ['ramrockFists'], skill: 'changingArsenal', stats: st(90, 27, 10, 15, 7, 26, 14, 5, 38, 4, 45, 20),
    quote: '(A stone guardian in the Ancient Tomb. Its arms come off and come back as something else.)', drops: ['mastersPlaque'] }),
  b({ id: 'veran', name: 'Veran', title: 'Sorceress of Shadows', home: 'blackTower', race: 'demon', classId: 'sorceressOfShadowsClass', size: 1, glyph: 'VE',
    weapons: ['veransShadowBolt'], skill: 'sorceressOfShadows', abilities: ['veranPossession', 'veranMetamorphosis'], stats: st(45, 5, 32, 20, 16, 8, 28, 9, 6, 7, 20, 75),
    quote: '"Did you think the Oracle of Ages would come quietly? She was such a comfortable place to hide."', drops: ['veransShadowGarb', 'harpOfAges'] }),
  // ── Possessed Nayru (Nayru\'s form while Veran possesses her) and boss forms of characters ──
  b({ id: 'nayruPossessed', name: 'Possessed Nayru', title: 'Vessel of Veran', home: 'blackTower', race: 'hylian', classId: 'possessedOracle', size: 1, glyph: 'PN',
    weapons: ['veransShadowBolt'], skill: 'possessedVessel', abilities: ['timeWarpCurse'], stats: st(30, 4, 30, 16, 10, 6, 26, 6, 5, 5, 16, 70),
    quote: '(Nayru smiles, and it isn\'t her smile.) "Strike me, hero. You\'ll only hurt your precious Oracle."', drops: ['oraclesJewelry'] }),
  b({ id: 'agahnimBoss', name: 'Agahnim', title: 'Dark Wizard', home: 'hyruleCastleLttP', race: 'hylian', classId: 'darkWizard', size: 1, glyph: 'AH',
    weapons: ['agahnimsScepter', 'energyBall'], skill: 'falseMagicSkill', abilities: ['energyBallVolley', 'lightningSpread', 'illusoryTeleport'], stats: st(44, 6, 26, 18, 12, 8, 22, 7, 7, 6, 22, 65),
    quote: '"The Seven Maidens are gone. Only the princess remains — and you, boy, are too late."', drops: ['agahnimsRobes', 'agahnimsScepter'] }),
  b({ id: 'ganonLegendBoss', name: 'Ganon', title: 'King of Darkness', home: 'ganonsTowerLttP', race: 'demon', classId: 'tridentWarlord', size: 3, glyph: 'GK',
    weapons: ['ganonsTridentLegend', 'blazingBats'], skill: 'powerOfTheTriforce', abilities: ['darkTeleportation', 'darknessShroud', 'demonicRestoration'], stats: st(95, 29, 29, 18, 12, 24, 25, 5, 33, 6, 48, 70),
    quote: '"So you are the one who keeps getting in my way. Come, then. The Triforce is mine, and so is this world."', drops: ['ganonsTridentLegend', 'goldenSword'] }),
  b({ id: 'ganonResurrected', name: 'Ganon (Resurrected)', title: 'Berserk King of Darkness', home: 'roomOfRites', race: 'demon', classId: 'tridentWarlord', size: 3, glyph: 'GR',
    weapons: ['ganonsTridentLegend', 'blazingBats'], skill: 'powerOfTheTriforce', abilities: ['tridentThrow', 'earthquakeGanon'], stats: st(100, 31, 26, 16, 12, 24, 22, 3, 34, 7, 50, 60),
    quote: '(Raised without the princess\'s blood, the King of Darkness comes back wrong: roaring, mindless, unstoppable.)', drops: ['ganonsTridentLegend', 'thousandthRing'] }),
  // ── Returning monsters as region bosses (forms of the recruitable monsters) ──
  b({ id: 'armosKnightsBoss', name: 'Armos Knights', title: 'Eastern Palace Guardians', home: 'easternPalace', race: 'construct', classId: 'heavyConstruct', size: 2, glyph: 'AK',
    weapons: ['armosSlam'], skill: 'explosiveCore', stats: st(55, 18, 4, 8, 6, 20, 8, 3, 24, 4, 30, 10),
    quote: '(Six statues around the room, and one by one, they start to hop.)', drops: ['pegasusBoots'] }),
  b({ id: 'lanmolasBoss', name: 'Lanmolas', title: 'Desert Palace Burrowers', home: 'desertPalace', race: 'monster', classId: 'segmentedCrawler', size: 2, glyph: 'LM',
    weapons: ['lanmolaMandibles'], skill: 'segmentedBody', stats: st(52, 17, 0, 11, 15, 12, 6, 4, 18, 8, 32, 0),
    quote: '(The sand bulges. Three great worms burst out at once, scattering rocks.)', drops: ['powerGlove'] }),
  b({ id: 'moldormBoss', name: 'Moldorm', title: 'Tower Worm', home: 'deathMountainLttP', race: 'monster', classId: 'burrowingWorm', size: 2, glyph: 'MM',
    weapons: ['moldormBite'], skill: 'sandBurrow', stats: st(48, 16, 0, 10, 14, 12, 6, 4, 16, 7, 30, 0),
    quote: '(A great segmented worm circles the top of the tower, faster and faster. One wrong step and you fall.)', drops: ['moonPearl', 'magicMirror'] }),
  b({ id: 'mothulaBoss', name: 'Mothula', title: 'Skull Woods Moth', home: 'darkWorld', race: 'monster', classId: 'armoredInsect', size: 2, glyph: 'MT',
    weapons: ['mothulaStinger'], skill: 'infestation', stats: st(55, 16, 6, 11, 12, 13, 8, 4, 18, 6, 30, 10),
    quote: '(A huge moth drops from the roots of the Skull Woods. The floor around it is covered in spikes.)', drops: ['fireRod', 'rocsCape'] }),
];

/** Boss ids that are other forms of a recruitable template (not recruited separately). */
export const BOSS_AS_TEMPLATE: Record<string, string> = {
  nayruPossessed: 'nayru', agahnimBoss: 'agahnim', ganonLegendBoss: 'ganonLegend', ganonResurrected: 'ganonLegend',
  armosKnightsBoss: 'armosKnight', lanmolasBoss: 'lanmola', moldormBoss: 'moldorm', mothulaBoss: 'mothula',
};

// Rosters: the returning Era of Legend monsters are the existing entries (Octoroks, Moblins, Keese,
// Stalfos, Ropes, Zols, Gels, Leevers, Tektites, Like Likes, Darknuts, Goriyas, Bubbles, Moldorms...).
export const ROSTERS: Record<string, string[]> = {
  hyruleCastleLttP: ['wizzrobe', 'keese', 'rope', 'stalfos', 'moblin', 'blueBubble', 'antiFairy', 'helmasaur'],
  easternPalace: ['stalfos', 'antiFairy', 'redBubble', 'helmasaur', 'armosKnight', 'gibdo', 'keese', 'rope'],
  desertPalace: ['leever', 'leever', 'gibdo', 'geldarm', 'polsVoice', 'antiFairy', 'stalfos', 'buzzBlob'],
  deathMountainLttP: ['tektite', 'tektite', 'buzzBlob', 'keese', 'lynel', 'redBubble', 'moldorm', 'wizzrobe'],
  darkWorld: ['moblin', 'wizzrobe', 'blizzrobe', 'antiFairy', 'helmasaur', 'zol', 'gibdo', 'likeLike', 'goriya'],
  ganonsTowerLttP: ['wizzrobe', 'bossWizzrobe', 'meteoWizzrobe', 'thunderWizzrobe', 'blizzrobe', 'darknut', 'ironKnuckle', 'stalfos', 'antiFairy'],
  mabeVillage: ['octorok', 'octorok', 'buzzBlob', 'moblin', 'keese', 'leever', 'zol', 'cukeman'],
  mysteriousForest: ['moblin', 'buzzBlob', 'cukeman', 'zol', 'gel', 'keese', 'octorok', 'polsVoice'],
  animalVillage: ['leever', 'polsVoice', 'stalfos', 'wizzrobe', 'antiFairy', 'gibdo', 'likeLike', 'goriya'],
  talTalHeights: ['tektite', 'tektite', 'keese', 'moldorm', 'wizzrobe', 'meteoWizzrobe', 'darknut', 'redBubble'],
  windFishsEgg: ['antiFairy', 'blueBubble', 'redBubble', 'stalfos', 'wizzrobe', 'zol', 'gel', 'keese'],
  horonVillage: ['octorok', 'moblin', 'buzzBlob', 'keese', 'rope', 'zol', 'gel', 'leever'],
  natzu: ['moblin', 'moblin', 'octorok', 'tektite', 'leever', 'buzzBlob', 'subterror', 'polsVoice'],
  subrosia: ['subterror', 'smasher', 'redBubble', 'fireKeese', 'meteoWizzrobe', 'tektite', 'darknut', 'leever'],
  tarmRuins: ['darknut', 'ironKnuckle', 'moblin', 'wizzrobe', 'blizzrobe', 'lynel', 'smasher', 'goriya'],
  templeOfSeasons: ['ironKnuckle', 'darknut', 'moblin', 'smasher', 'thunderWizzrobe', 'meteoWizzrobe', 'blizzrobe', 'stalfos'],
  lynnaCity: ['octorok', 'moblin', 'buzzBlob', 'keese', 'rope', 'gel', 'zol', 'cukeman'],
  lynnaVillage: ['stalfos', 'moblin', 'goriya', 'antiFairy', 'keese', 'buzzBlob', 'rope', 'polsVoice'],
  crescentIsland: ['octorok', 'tektite', 'leever', 'subterror', 'moblin', 'buzzBlob', 'zol', 'likeLike'],
  rollingRidge: ['tektite', 'smasher', 'subterror', 'darknut', 'wizzrobe', 'thunderWizzrobe', 'redBubble', 'goriya'],
  zoraSeas: ['octorok', 'octorok', 'zol', 'likeLike', 'blizzrobe', 'gibdo', 'antiFairy', 'stalfos'],
  blackTower: ['ironKnuckle', 'darknut', 'wizzrobe', 'bossWizzrobe', 'antiFairy', 'stalfos', 'blueBubble', 'moblin'],
  roomOfRites: ['meteoWizzrobe', 'blizzrobe', 'thunderWizzrobe', 'bossWizzrobe', 'ironKnuckle', 'darknut', 'redBubble', 'blueBubble'],
};

/** Wizzrobes return to the older packs' regions where they belonged (merged into those rosters). */
export const RETURNING_WIZZROBES: Record<string, string[]> = {
  // Ocarina of Time / Majora's Mask: the castle and the temples of ice and spirit
  hyruleCastle: ['wizzrobe'], snowhead: ['blizzrobe'], ikana: ['wizzrobe'],
  // The Wind Waker: the Forsaken Fortress, the Tower of the Gods, the Wind Temple and Ganon's Tower
  forsakenFortress: ['wizzrobe'], towerOfTheGods: ['wizzrobe'], windTemple: ['wizzrobe'], ganonsTower: ['wizzrobe', 'bossWizzrobe'],
  // Zelda II's palaces and the Original Hyrule Levels
  mazeIslandPalace: ['wizzrobe'], palaceOnTheSea: ['wizzrobe'], threeEyeRockPalace: ['wizzrobe'], greatPalace: ['wizzrobe'],
  level6Dragon: ['wizzrobe'], level8Lion: ['wizzrobe'], level9DeathMountain: ['wizzrobe', 'wizzrobe'],
  // Era of the Wild: the elemental Wizzrobes
  eldinWild: ['meteoWizzrobe'], hebra: ['blizzrobe'], lanayruWild: ['thunderWizzrobe'],
};

/** Each route region's bosses, in order: the boss node fights the first one not yet beaten (with the next as its partner). */
export const ROUTE_BOSSES: Record<string, string[]> = {
  hyruleCastleLttP: ['agahnimBoss'], easternPalace: ['armosKnightsBoss'], desertPalace: ['lanmolasBoss'], deathMountainLttP: ['moldormBoss'],
  darkWorld: ['helmasaurKing', 'arrghus', 'mothulaBoss', 'blind', 'kholdstare', 'vitreous', 'trinexx'], ganonsTowerLttP: ['ganonLegendBoss'],
  mabeVillage: ['moldormBoss', 'genie'], mysteriousForest: ['slimeEye', 'anglerFish'], animalVillage: ['slimeEel', 'facade'], talTalHeights: ['evilEagle', 'hotHead'],
  windFishsEgg: ['shadowNightmare'],
  horonVillage: ['aquamentus', 'dodongoBoss'], natzu: ['mothulaBoss', 'queenGohma'], subrosia: ['digdogger', 'manhandla'], tarmRuins: ['gleeokFlame', 'medusaHead'],
  templeOfSeasons: ['onox'],
  lynnaCity: ['pumpkinHead'], lynnaVillage: ['headThwomp', 'shadowHag'], crescentIsland: ['eyesoar'], rollingRidge: ['smog', 'ramrock'], zoraSeas: ['octogon'],
  blackTower: ['nayruPossessed'],
  roomOfRites: ['ganonResurrected', 'koume', 'kotake'],
};
/** Regions whose boss node brings two bosses at once (both must fall). */
export const PAIRED_BOSS_REGIONS = ['darkWorld', 'mabeVillage', 'mysteriousForest', 'animalVillage', 'talTalHeights', 'horonVillage', 'natzu', 'subrosia', 'tarmRuins', 'lynnaVillage', 'rollingRidge', 'roomOfRites'];

// The boss pools other campaigns (Random, the free-for-all) draw from.
export const REGION_BOSSES: Record<string, string[]> = {
  hyruleCastleLttP: ['agahnimBoss'], easternPalace: ['armosKnightsBoss'], desertPalace: ['lanmolasBoss'], deathMountainLttP: ['moldormBoss'],
  darkWorld: ['helmasaurKing', 'arrghus', 'mothulaBoss', 'blind', 'kholdstare', 'vitreous'], ganonsTowerLttP: ['trinexx', 'ganonLegendBoss'],
  mabeVillage: ['genie'], mysteriousForest: ['slimeEye', 'anglerFish'], animalVillage: ['slimeEel', 'facade'], talTalHeights: ['evilEagle', 'hotHead'], windFishsEgg: ['shadowNightmare'],
  horonVillage: ['aquamentus'], natzu: ['mothulaBoss'], subrosia: ['digdogger', 'manhandla'], tarmRuins: ['medusaHead'], templeOfSeasons: ['onox'],
  lynnaCity: ['pumpkinHead'], lynnaVillage: ['headThwomp', 'shadowHag'], crescentIsland: ['eyesoar'], rollingRidge: ['smog', 'ramrock'], zoraSeas: ['octogon'],
  blackTower: ['nayruPossessed', 'veran'], roomOfRites: ['ganonResurrected'],
};

/** Monster spoils (section 10's collectibles, dropped on defeat). */
export const SPOILS: Record<string, string> = {
  antiFairy: 'magicPowder', buzzBlob: 'sleepyToadstool', cukeman: 'sleepyToadstool', subterror: 'gashaSeed', smasher: 'pieceOfPower',
  wizzrobe: 'mysterySeed', meteoWizzrobe: 'emberSeed', thunderWizzrobe: 'galeSeed', blizzrobe: 'scentSeed', bossWizzrobe: 'guardianAcorn',
};
