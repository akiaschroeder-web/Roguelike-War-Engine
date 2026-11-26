import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}) =>
  w(id, name, 'natural', 'common', might, hit, crit, 0, minRange, maxRange, { uses: 0, unique: true, ...extra });
const sig = (extra: Partial<WeaponDef> = {}) => ({ unique: true, anyClass: true, ...extra });

// Numbers from the Skyward Sword design doc where it gave them; natural weapons,
// supporting characters' weapons and missing hit/weight values are my proposals.
export const WEAPONS: WeaponDef[] = [
  // ── Link's swords (section 7). The Master Sword is the existing entry. ──
  w('practiceSword', 'Practice Sword', 'sword', 'common', 4, 95, 0, 3, 1, 1, { uses: 40, doubleXp: true, desc: 'A Knight Academy training blade. Doubles combat experience.' }),
  w('goddessSword', 'Goddess Sword', 'sword', 'rare', 9, 90, 5, 5, 1, 1, { uses: 60, unique: true, skywardRate: 1, desc: 'Unlocks Skyward Strike (charge it, then release a ranged slash). Upgraded with Farore\'s Flame.' }),
  w('goddessLongsword', 'Goddess Longsword', 'sword', 'epic', 13, 90, 10, 7, 1, 2, { uses: 70, unique: true, skywardRate: 1, skywardBonus: 2, desc: 'More reach; Skyward Strike +2 Might. Upgraded with Nayru\'s Flame.' }),
  w('goddessWhiteSword', 'Goddess White Sword', 'sword', 'legendary', 16, 95, 10, 7, 1, 2, { uses: 80, unique: true, skywardRate: 2, skywardBonus: 2, dowsingBonus: 4,
    desc: 'Skyward Strike charges twice as fast; Dowsing reaches 4 spaces further. Din\'s Flame turns it into the Master Sword.' }),
  w('trueMasterSword', 'True Master Sword', 'sword', 'mythic', 14, 100, 15, 5, 1, 1, { uses: 0, unique: true, effective: ['demon'], element: 'light', skywardRate: 3, skywardBonus: 4, sacredMult: 1.25,
    desc: 'The Master Sword blessed by Hylia: double damage to demons, sacred damage +25%, Skyward Strike charges in one action and reaches 1 further.' }),
  // ── Bows and slingshots (the ordinary Bow and Slingshot are the existing Fairy Bow and Fairy Slingshot) ──
  w('ironBow', 'Iron Bow', 'bow', 'rare', 10, 90, 10, 6, 2, 5, { uses: 60, pierce: 0.25, desc: 'Heavy draw: ignores 25% of the target\'s DEF.' }),
  w('sacredBow', 'Sacred Bow', 'bow', 'legendary', 15, 95, 15, 5, 2, 6, { uses: 80, element: 'light', sacredMult: 1.3, desc: 'Sacred arrows: +30% damage against demons and the undead.' }),
  w('scattershot', 'Scattershot', 'sling', 'rare', 5, 85, 5, 3, 1, 4, { uses: 50, splash: 'adjacent', desc: 'A cone of Deku Seeds: half damage to enemies next to the target too.' }),
  // ── Adventuring tools that are weapons ──
  w('whip', 'Whip', 'hookshot', 'rare', 4, 95, 0, 2, 1, 3, { uses: 50, anyClass: true, desc: 'Grabs switches and small items; Whip Snatch steals from or pulls light enemies within 3.' }),
  w('goddessHarp', "Goddess's Harp", 'instrument', 'legendary', 0, 100, 0, 1, 1, 1, { uses: 0, unique: true, songDiscount: 1, desc: 'Plays the goddess\'s songs (songs cost 1 less MP) and wakes divine mechanisms.' }),
  // ── Additional unique weapons (section 15) ──
  w('skyKnightsSword', "Sky Knight's Sword", 'sword', 'uncommon', 8, 95, 5, 4, 1, 1, { uses: 50, flightHit: 15, desc: '+15 Hit while riding a Loftwing (or any flying mount).' }),
  w('technoblinBaton', 'Technoblin Baton', 'hammer', 'rare', 9, 85, 5, 5, 1, 1, { uses: 45, element: 'lightning', desc: 'Electrified: may Shock on contact.' }),
  w('ghirahimsBlade', "Ghirahim's Blade", 'sword', 'legendary', 16, 95, 20, 7, 1, 2, sig({ uses: 70, parryStamina: 3, desc: 'A parry (or Blade Catch) restores 3 stamina.' })),
  w('demonKingsSword', "Demon King's Sword", 'sword', 'mythic', 25, 90, 15, 17, 1, 3, sig({ uses: 0, twoHanded: true, element: 'dark', desc: 'Absorbs lightning (Lightning Sword) to release a ranged Dark Skyward Strike.' })),
  w('koloktosGreatblade', 'Koloktos Greatblade', 'sword', 'legendary', 24, 80, 10, 24, 1, 2, sig({ uses: 65, twoHanded: true, splash: 'adjacent', armorBreaker: 1.5, desc: 'Cleaves the spaces around the target; +50% against armor and constructs.' })),
  w('stalmastersSword', "Stalmaster's Sword", 'sword', 'epic', 12, 90, 15, 6, 1, 1, { uses: 55, noWeightPenalty: true, desc: 'Balanced for many arms: its weight never slows you.' }),
  w('scervosCutlass', "Scervo's Cutlass", 'sword', 'epic', 13, 95, 20, 6, 1, 1, { uses: 60, consecutivePush: true, desc: 'Hitting the same enemy on consecutive attacks pushes it back 1 space.' }),
  w('dreadfusesBlade', "Dreadfuse's Electric Blade", 'sword', 'legendary', 15, 90, 15, 7, 1, 1, sig({ uses: 65, element: 'lightning', counterLightning: 4, desc: 'Counterattacks deal +4 lightning damage.' })),
  w('guardianClub', 'Guardian Club', 'hammer', 'epic', 18, 75, 5, 17, 1, 2, { uses: 60, twoHanded: true, fleeingBonus: 1.3, desc: '+30% damage against enemies that moved 3+ spaces this turn (fleeing).' }),
  w('moldarachPincer', 'Moldarach Pincer', 'gauntlet', 'epic', 14, 85, 10, 8, 1, 2, sig({ uses: 50, restrains: true, desc: 'Hits restrain smaller enemies (Rooted for a turn).' })),
  // ── Magical and specialized ──
  w('fisSacredProjection', "Fi's Sacred Projection", 'magic', 'legendary', 15, 95, 5, 0, 1, 4, sig({ uses: 0, element: 'light', revealsWeakness: true, desc: 'Sacred light: hits leave the target Exposed (−3 DEF and RES) for a turn.' })),
  w('ghirahimsDemonDarts', "Ghirahim's Demon Darts", 'magic', 'legendary', 12, 90, 10, 0, 2, 5, sig({ uses: 0, element: 'dark', splash: 'adjacent', desc: 'A spread of daggers: half damage to enemies next to the target (up to three targets).' })),
  w('lanayrusThunderOrb', "Lanayru's Thunder Orb", 'magic', 'legendary', 20, 85, 5, 0, 2, 5, sig({ uses: 0, element: 'lightning', splash: 'adjacent', desc: 'Chain lightning: arcs to enemies next to the target.' })),
  w('faronsWaterSphere', "Faron's Water Sphere", 'magic', 'legendary', 18, 90, 5, 0, 1, 5, sig({ uses: 0, element: 'water', waterTerrain: true, desc: 'Floods the target\'s space with water for 2 turns.' })),
  w('eldinsMagmaBreath', "Eldin's Magma Breath", 'magic', 'legendary', 22, 85, 5, 0, 1, 4, sig({ uses: 0, element: 'fire', splash: 'line', burnsPath: true, desc: 'A cone of magma: burns the ground and everything behind the target.' })),
  w('leviasCelestialWind', "Levias's Celestial Wind", 'magic', 'mythic', 22, 90, 5, 0, 1, 6, sig({ uses: 0, displacesFlyers: true, desc: 'Blows flying targets 2 spaces away; allied flyers near Levias gain +2 MOV.' })),
  w('groosenator', 'Groosenator', 'siege', 'legendary', 28, 75, 5, 14, 4, 10, sig({ uses: 40, crewed: false, stationary: true, splash: 'adjacent', bombs: true,
    desc: 'Groose\'s catapult: an explosive shot (half damage next to the target). Can\'t fire after moving.' })),
  w('sentrobeMissileLauncher', 'Sentrobe Missile Launcher', 'siege', 'epic', 16, 95, 5, 8, 2, 5, { uses: 40, crewed: false, splash: 'adjacent', bombs: true, desc: 'Tracking missiles: explode on the target and next to it.' }),
  // ── Supporting characters (my proposals) ──
  w('priestessLight', 'Light of the Goddess', 'magic', 'rare', 9, 90, 5, 1, 1, 2, { element: 'light', sacredMult: 1.2, desc: 'Sacred light: +20% against demons and the undead.' }),
  w('hyliasRadiance', "Hylia's Radiance", 'magic', 'mythic', 18, 95, 10, 0, 1, 4, sig({ uses: 0, element: 'light', effective: ['demon'], desc: 'The goddess\'s own light: double damage against demons.' })),
  w('sheikahKunai', 'Sheikah Kunai', 'dagger', 'rare', 8, 95, 15, 2, 1, 2, { desc: 'Thrown or held.' }),
  w('demonicKindness', 'Demonic Lightning', 'magic', 'rare', 11, 85, 5, 0, 1, 3, sig({ uses: 0, element: 'lightning', desc: 'Batreaux\'s magic, used gently.' })),
  w('scrapWrench', 'Scrap Wrench', 'hammer', 'uncommon', 8, 85, 0, 5, 1, 1, { desc: 'Good for repairs. And for not-repairs.' }),
  w('skippersCutlass', "Skipper's Cutlass", 'sword', 'rare', 9, 90, 10, 4, 1, 1, { unique: true, desc: 'An ancient robot captain\'s sword.' }),
  w('deckCannon', 'Deck Cannon', 'siege', 'rare', 14, 80, 0, 9, 2, 4, { crewed: false, desc: 'A small ancient cannon.' }),
  // ── Natural weapons ──
  nat('scrapperBuzz', 'Grappling Arm', 6, 90, 0, 1, 1),
  nat('kikwiBelly', 'Belly Bump', 6, 85, 0, 1, 1),
  nat('mogmaClaws', 'Mogma Claws', 6, 90, 10, 1, 1),
  nat('whaleBreach', 'Breach', 18, 80, 0, 1, 1, { splash: 'around' }),
  nat('dragonClawsSS', 'Dragon Claws', 14, 85, 5, 1, 1),
  nat('loftwingBeak', 'Beak', 7, 90, 5, 1, 1),
  nat('cursedGrasp', 'Cursed Grasp', 7, 85, 0, 1, 1, { element: 'dark' }),
  nat('quadroMaw', 'Alternating Maw', 11, 85, 5, 1, 1),
  nat('furnixFlame', 'Furnix Flame', 9, 85, 0, 1, 3, { element: 'fire', magicContact: true }),
  nat('pyrupFireball', 'Fireball', 8, 85, 0, 1, 3, { element: 'fire', magicContact: true }),
  nat('froakPuff', 'Puff Cloud', 6, 85, 0, 1, 1),
  nat('ampilusRoll', 'Rolling Shell', 10, 85, 5, 1, 1, { element: 'lightning', momentum: 3 }),
  nat('eggSpark', 'Spark', 3, 80, 0, 1, 1, { element: 'lightning' }),
  nat('arachaSting', 'Stinger', 8, 90, 10, 1, 1, { inflict: { status: 'poison', chance: 20, turns: 2 } }),
  nat('magmaFist', 'Magma Fist', 13, 80, 0, 1, 1, { element: 'fire' }),
  nat('watcherGlare', 'Watcher\'s Glare', 1, 90, 0, 1, 2, { magicContact: true, desc: 'It doesn\'t hurt. It tells the Guardians where you are.' }),
  nat('guardianClubNatural', 'Guardian Club', 16, 80, 5, 1, 2, { fleeingBonus: 1.3 }),
  nat('guardianClaws', 'Spectral Claws', 13, 85, 5, 1, 1, { magicContact: true }),
  nat('remlitClaws', 'Remlit Claws', 6, 90, 10, 1, 1),
  nat('beamosTrackingBeam', 'Tracking Beam', 12, 80, 0, 2, 5, { magicContact: true, element: 'fire' }),
  nat('scalderaBoulder', 'Molten Charge', 17, 80, 5, 1, 1, { element: 'fire', momentum: 4 }),
  nat('scalderaFireball', 'Magma Spit', 13, 80, 0, 2, 4, { element: 'fire', magicContact: true }),
  nat('moldarachTail', 'Tail Sting', 13, 85, 10, 1, 2),
  nat('koloktosArms', 'Six Arms', 18, 80, 5, 1, 1),
  nat('tentalusTentacles', 'Tentacle Lash', 17, 80, 5, 1, 3),
  nat('tentalusMaw', 'Abyssal Maw', 21, 75, 5, 1, 1),
  nat('bilocyteSpores', 'Parasite Spores', 13, 85, 0, 1, 4, { element: 'dark', magicContact: true }),
  nat('bilocyteLash', 'Lash', 11, 85, 5, 1, 1),
  nat('imprisonedStomp', 'Crushing Stomp', 20, 75, 0, 1, 1, { splash: 'around' }),
  nat('imprisonedGrasp', 'Massive Grasp', 22, 75, 5, 1, 2, { inflict: { status: 'root', chance: 40, turns: 1 } }),
  nat('imprisonedDive', 'Plunging Landing', 24, 75, 5, 1, 1, { splash: 'adjacent' }),
  nat('cursedBreath', 'Cursed Breath', 9, 85, 0, 1, 2, { element: 'dark', magicContact: true, inflict: { status: 'weaponCurse', chance: 50, turns: 2 } }),
];
