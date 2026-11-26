// "Additional Units — OOT, WW & TP" and the Bubble family: the Poe Sisters,
// Dark/Purple/Rare ChuChu, the Queen of Fairies, six Bubbles and Freezard.
// They live in this pack but call their own games' regions home.

import type { EnemyArchetype, GearDef, GearSlotKind, ItemDef, Rarity, SkillDef, Stats, UnitTemplate, WeaponDef } from '../../engine/types';
import { st } from './units';

const WPRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };
const GPRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const lantern = (id: string, name: string, rarity: Rarity, might: number, hit: number, crit: number, maxRange: number, uses: number, extra: Partial<WeaponDef>): WeaponDef =>
  ({ id, name, type: 'magic', rarity, might, hit, crit, weight: 2, minRange: 1, maxRange, uses, price: WPRICE[rarity], lantern: true, ...extra });
const nat = (id: string, name: string, might: number, hit: number, crit: number, maxRange: number, extra: Partial<WeaponDef> = {}): WeaponDef =>
  ({ id, name, type: 'natural', rarity: 'common', might, hit, crit, weight: 0, minRange: 1, maxRange, uses: 0, unique: true, price: 0, ...extra });
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: GPRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), head = gs('head'), acc = gs('accessory');

export const EXTRA_WEAPONS: WeaponDef[] = [
  // Poe Sister lanterns (magic, for Poes and trained mages)
  lantern('joellesLantern', "Joelle's Lantern", 'epic', 10, 90, 10, 3, 50, { element: 'fire', inflict: { status: 'burn', chance: 50, turns: 2 }, desc: 'Inflicts Burning.' }),
  lantern('bethsLantern', "Beth's Lantern", 'epic', 8, 95, 5, 3, 50, { element: 'ice', chill: true, desc: 'Inflicts Chilled: −2 MOV and −2 SPD for a turn.' }),
  lantern('amysLantern', "Amy's Lantern", 'epic', 9, 90, 10, 3, 50, { element: 'dark', drainsMp: 3, mpToWielder: true, desc: 'Drains 3 MP from the target to you.' }),
  lantern('megsLantern', "Meg's Lantern", 'legendary', 13, 95, 15, 4, 65, { element: 'dark', duplicateOnKill: true, desc: 'Defeating an enemy creates an illusory duplicate of the wielder (up to 3).' }),
  // ChuChus
  nat('darkJelly', 'Shadow Slam', 8, 85, 0, 1, { element: 'dark' }),
  nat('unstableJelly', 'Unstable Slam', 6, 85, 5, 1, { unstable: true, desc: 'Randomly physical or magical.' }),
  nat('goldenJelly', 'Golden Slam', 8, 90, 5, 1, { element: 'light' }),
  // Bubbles
  nat('flamingCollision', 'Flaming Collision', 8, 85, 5, 1, { element: 'fire', inflict: { status: 'burn', chance: 30, turns: 2 } }),
  nat('cursedCollision', 'Cursed Collision', 6, 85, 0, 1, { element: 'dark', magicContact: true, inflict: { status: 'weaponCurse', chance: 100, turns: 2 } }),
  nat('emeraldCollision', 'Emerald Collision', 6, 85, 0, 1, { element: 'nature', magicContact: true }),
  nat('skullCharge', 'Skull Charge', 7, 90, 10, 1, { momentum: 0 }),
  nat('cursedBite', 'Cursed Bite', 5, 90, 0, 1, { element: 'dark', inflict: { status: 'weaponCurse', chance: 100, turns: 3 } }),
  nat('spectralCollision', 'Spectral Collision', 6, 90, 5, 1, { element: 'dark', magicContact: true }),
  // Queen of Fairies and Freezard
  { id: 'fairyQueensWand', name: "Fairy Queen's Wand", type: 'staff', rarity: 'mythic', might: 0, hit: 100, crit: 0, weight: 1, minRange: 1, maxRange: 3, uses: 0, price: 0, unique: true, anyClass: true, healBonus: 1.5,
    desc: 'Heals at +50% power, from up to 3 spaces away.' },
  { id: 'queensFairyLight', name: 'Fairy Light', type: 'magic', rarity: 'legendary', might: 12, hit: 95, crit: 5, weight: 0, minRange: 1, maxRange: 3, uses: 0, price: 0, unique: true, element: 'light' },
  nat('freezingBreath', 'Freezing Breath', 10, 85, 0, 2, { element: 'ice', splash: 'line', inflict: { status: 'freeze', chance: 30, turns: 1 } }),
];

export const EXTRA_GEAR: GearDef[] = [
  shield('fairyQueensDoll', "Fairy Queen's Doll", 'mythic', { mag: 6, res: 5, mp: 15 }, '+6 MAG, +5 RES, +15 MP. Healing costs 25% less MP; once per battle you revive at 25% HP.', { effects: ['healThrift', 'surviveOnce'], unique: true }),
  head('fairyQueensCrown', "Fairy Queen's Crown", 'legendary', { mag: 4, lck: 4, res: 3 }, '+4 MAG, +4 LCK, +3 RES. Fairy Summoning creates one more Fairy.', { effects: ['extraFairy'], unique: true }),
  acc('royalFairyCharm', 'Royal Fairy Charm', 'legendary', {}, 'Healing received +50%. +3 MP each turn. Immune to curses.', { effects: ['healBoost', 'healBoost', 'mpRegen3', 'curseImmune'] }),
  // Bubble gear
  acc('redBubbleFlame', 'Red Bubble Flame', 'rare', {}, '50% fire resistance; melee attackers take 3 fire damage.', { effects: ['fireResist', 'burningAura'] }),
  acc('blueBubbleFlame', 'Blue Bubble Flame', 'epic', {}, 'Physical hits have a 20% chance to inflict Weapon Curse.', { effects: ['curseTouch'] }),
  acc('greenBubbleFlame', 'Green Bubble Flame', 'rare', {}, 'Alternates each turn between +4 DEF and +4 RES.', { effects: ['pulsingGuard'] }),
  head('whiteBubbleSkull', 'White Bubble Skull', 'rare', { spd: 2 }, '+2 SPD. Charging attacks gain +1 Might per space moved (max +5).', { effects: ['remainsMomentum'] }),
  acc('cursedSkullCharm', 'Cursed Skull Charm', 'uncommon', {}, 'Curses you inflict last 1 turn longer.', { effects: ['composer'] }),
  acc('spectralSkullFragment', 'Spectral Skull Fragment', 'rare', {}, '+15 Avoid while you haven\'t moved; ambush damage +20%.', { effects: ['stillAvoid', 'ambushBoost'] }),
];

export const EXTRA_ITEMS: ItemDef[] = [
  { id: 'bubbleBoneFragment', name: 'Bubble Bone Fragment', kind: 'special', rarity: 'common', price: 40, power: 0, uses: 1, desc: 'Crafting material for undead equipment (sells well).' },
  { id: 'cursedFlameEssence', name: 'Cursed Flame Essence', kind: 'muddle', rarity: 'rare', price: 250, power: 0, uses: 1, targeted: true, minRange: 1, maxRange: 3, status: 'weaponCurse', statusTurns: 2, desc: 'Weapon Curse on an enemy within 3 (2 turns).' },
  { id: 'volcanicFlameEssence', name: 'Volcanic Flame Essence', kind: 'special', rarity: 'rare', price: 250, power: 0, uses: 1, desc: 'Immune to fire and lava damage for 3 turns.' },
  { id: 'pulsatingFlameEssence', name: 'Pulsating Flame Essence', kind: 'buff', rarity: 'rare', price: 250, power: 0, uses: 1, buff: { def: 5, res: 5 }, buffTurns: 2, desc: '+5 DEF and RES for 2 turns.' },
  { id: 'spectralFlameEssence', name: 'Spectral Flame Essence', kind: 'special', rarity: 'rare', price: 250, power: 0, uses: 1, desc: 'Pass through obstacles and units on your next move.' },
];

export const EXTRA_SKILLS: SkillDef[] = [
  // Poe Sisters
  { id: 'crimsonFlame', name: 'Crimson Flame', implemented: true, desc: 'Fire attacks ignore 25% of the target\'s RES and Burn lasts a turn longer.' },
  { id: 'azureFlame', name: 'Azure Flame', implemented: true, desc: 'Magical hits reduce the target\'s MOV by 2 for a turn.' },
  { id: 'emeraldFlame', name: 'Emerald Flame', implemented: true, desc: 'Hits also drain 3 stamina and 3 MP from the target.' },
  { id: 'sisterOfIllusions', name: 'Sister of Illusions', implemented: true, desc: 'Starts each battle with three illusory duplicates (each vanishes when struck).' },
  { id: 'poeSisterBond', name: 'Flames of the Forest Temple', implemented: true, desc: 'All four sisters deployed: +3 MAG and RES, +15 Avoid, spectral abilities cost 25% less MP, and each surviving sister restores 2 MP to the others each turn. Spectral: moves through walls and units; physical damage −25%, light damage +50%.' },
  // ChuChus
  { id: 'creatureOfDarkness', name: 'Creature of Darkness', implemented: true, desc: 'Ordinary weapons can\'t hurt it in its jelly state. Light petrifies it for 2 turns: it can\'t act, takes double damage from hammers, and can hold down switches.' },
  { id: 'unstableComposition', name: 'Unstable Composition', implemented: true, desc: 'Each turn, randomly +5 STR, +5 MAG, +5 DEF/RES, heal 25%, or lose 10% HP.' },
  { id: 'goldenRegeneration', name: 'Golden Regeneration', implemented: true, desc: 'Recovers 25% max HP at the start of each turn.' },
  // Queen of Fairies
  { id: 'motherOfFairies', name: 'Mother of Fairies', implemented: true, desc: 'Allied Fairies and Great Fairies gain +4 MAG, +4 RES and recover 5 MP each turn.' },
  // Bubbles
  { id: 'infernalShroud', name: 'Infernal Shroud', implemented: true, desc: 'While aflame: melee damage taken −50% and melee attackers Burn. Water, ice and wind put the flames out for 2 turns.' },
  { id: 'cursedFlameBubble', name: 'Cursed Flame', implemented: true, desc: 'While aflame, contact attacks inflict Weapon Curse for 2 turns. Shield attacks and wind put the flames out.' },
  { id: 'pulsatingFlame', name: 'Pulsating Flame', implemented: true, desc: 'Alternates each turn: ignited (+5 DEF/RES, melee attackers take magic damage) or extinguished (+3 MOV, +15 Avoid).' },
  { id: 'relentlessPatrol', name: 'Relentless Patrol', implemented: true, desc: '+2 Might per space moved before attacking (max +10).' },
  { id: 'lingeringCurse', name: 'Lingering Curse', implemented: true, desc: 'Contact attacks inflict Weapon Curse for 3 turns.' },
  { id: 'spectralDormancy', name: 'Spectral Dormancy', implemented: true, desc: 'Hidden after a turn without moving; the first attack from hiding deals +50%.' },
  { id: 'bubbleTraits', name: 'Bubble', implemented: true, desc: 'Floats over hazards. Undead: immune to poison. Sacred light deals +50%. Light enough to be blown or knocked away.' },
  // Freezard
  { id: 'freezingBreathSkill', name: 'Freezing Breath', implemented: true, desc: 'Its breath freezes the ground ahead into ice.' },
];

const named = (t: Omit<UnitTemplate, 'glyph'> & { glyph: string }): UnitTemplate => t;

export const EXTRA_TEMPLATES: UnitTemplate[] = [
  named({ id: 'joelle', name: 'Joelle', title: 'Flame Spirit', race: 'undead', classId: 'poeSister', size: 1, home: 'lostWoods', glyph: 'JO',
    stats: st(24, 3, 14, 11, 10, 4, 11, 6, 3, 6, 12, 28), weapons: ['joellesLantern'], skill: 'crimsonFlame', extraSkills: ['poeSisterBond'], abilities: ['crimsonLantern', 'paintingRefuge'], rare: true,
    bio: 'The red Poe Sister of the Forest Temple: hot-tempered, impatient, and quick with her fire.' }),
  named({ id: 'beth', name: 'Beth', title: 'Frost Spirit', race: 'undead', classId: 'poeSister', size: 1, home: 'lostWoods', glyph: 'BE',
    stats: st(26, 2, 12, 10, 8, 6, 15, 7, 3, 5, 12, 30), weapons: ['bethsLantern'], skill: 'azureFlame', extraSkills: ['poeSisterBond'], abilities: ['coldEmbrace', 'spectralBarrier', 'paintingRefuge'], rare: true,
    bio: 'The blue Poe Sister, calm and cold, who guards her sisters with barriers of frost.' }),
  named({ id: 'amy', name: 'Amy', title: 'Phantom Trickster', race: 'undead', classId: 'poeSister', size: 1, home: 'lostWoods', glyph: 'AM',
    stats: st(22, 2, 13, 12, 12, 3, 12, 8, 3, 6, 12, 32), weapons: ['amysLantern'], skill: 'emeraldFlame', extraSkills: ['poeSisterBond'], abilities: ['hauntingCurse', 'spiritDrain', 'paintingRefuge'], rare: true,
    bio: 'The green Poe Sister, a giggling trickster who drains her victims dry.' }),
  named({ id: 'meg', name: 'Meg', title: 'Phantom Illusionist', race: 'undead', classId: 'poeSister', size: 1, home: 'lostWoods', glyph: 'ME',
    stats: st(30, 4, 17, 14, 14, 5, 16, 10, 4, 7, 16, 40), weapons: ['megsLantern'], skill: 'sisterOfIllusions', extraSkills: ['poeSisterBond'], abilities: ['phantomQuartet', 'illusoryExchange', 'phantomAssault'], rare: true,
    bio: 'The purple Poe Sister, eldest and most powerful, who hides among copies of herself.' }),
  named({ id: 'queenOfFairies', name: 'Queen of Fairies', title: 'Fairy Sovereign', race: 'fairy', classId: 'fairySovereign', size: 1, home: 'greatSea', glyph: 'QF',
    stats: st(30, 2, 28, 16, 12, 5, 26, 25, 3, 7, 12, 65), weapons: ['fairyQueensWand', 'queensFairyLight'], skill: 'motherOfFairies', gear: { shield: 'fairyQueensDoll' }, rare: true,
    abilities: ['fairyQueensBlessing', 'elementalGift', 'royalRestoration', 'fairySummoning', 'divineProtection', 'fairyAscension'],
    bio: 'Tiny, ancient and more powerful than any Great Fairy. She lives on the Mother and Child Isles, and answers only to the Ballad of Gales.' }),
];

const e = (id: string, name: string, classId: string, race: string, weapons: string[], stats: Stats, extra: Partial<EnemyArchetype> = {}): EnemyArchetype =>
  ({ id, name, classId, race, weapons, stats, ...extra });

export const EXTRA_ENEMIES: EnemyArchetype[] = [
  e('darkChuchu', 'Dark ChuChu', 'jellyBlob', 'chuchu', ['darkJelly'], st(28, 8, 10, 8, 7, 8, 14, 4, 6, 5, 18, 22), { skill: 'creatureOfDarkness', glyph: 'CD' }),
  e('purpleChuchu', 'Purple ChuChu', 'jellyBlob', 'chuchu', ['unstableJelly'], st(22, 5, 9, 7, 8, 5, 8, 15, 5, 5, 14, 20), { skill: 'unstableComposition', glyph: 'CP' }),
  e('rareChuchu', 'Rare ChuChu', 'jellyBlob', 'chuchu', ['goldenJelly'], st(32, 8, 15, 10, 10, 7, 14, 20, 6, 5, 20, 30), { skill: 'goldenRegeneration', glyph: 'CR' }),
  e('redBubble', 'Red Bubble', 'bubbleSpirit', 'undead', ['flamingCollision'], st(24, 8, 12, 9, 12, 6, 10, 4, 4, 7, 18, 24), { skill: 'infernalShroud', glyph: 'RB' }),
  e('blueBubble', 'Blue Bubble', 'bubbleSpirit', 'undead', ['cursedCollision'], st(20, 4, 12, 9, 9, 4, 12, 4, 3, 6, 12, 26), { skill: 'cursedFlameBubble', glyph: 'BU' }),
  e('greenBubble', 'Green Bubble', 'bubbleSpirit', 'undead', ['emeraldCollision'], st(24, 5, 9, 7, 7, 6, 10, 5, 3, 5, 14, 22), { skill: 'pulsatingFlame', glyph: 'GB' }),
  e('whiteBubble', 'White Bubble', 'bubbleSpirit', 'undead', ['skullCharge'], st(18, 10, 0, 11, 15, 3, 4, 5, 4, 9, 24, 0), { skill: 'relentlessPatrol', glyph: 'WB' }),
  e('bubbleMM', 'Bubble', 'bubbleSpirit', 'undead', ['cursedBite'], st(17, 4, 10, 9, 12, 2, 9, 4, 2, 7, 12, 24), { skill: 'lingeringCurse', glyph: 'BM' }),
  e('skullBubble', 'Skull Bubble', 'bubbleSpirit', 'undead', ['spectralCollision'], st(16, 3, 10, 10, 12, 3, 10, 3, 3, 7, 10, 20), { skill: 'spectralDormancy', glyph: 'SB' }),
  e('freezard', 'Freezard', 'iceConstruct', 'construct', ['freezingBreath'], st(34, 9, 12, 7, 3, 12, 12, 3, 14, 2, 18, 20), { size: 2, skill: 'freezingBreathSkill', glyph: 'FZ' }),
];

/** Where the extra monsters turn up, in their own games' regions. */
export const EXTRA_ROSTERS: Record<string, string[]> = {
  deathMountain: ['redBubble'], kakarikoGraveyard: ['blueBubble', 'whiteBubble'], lostWoods: ['greenBubble'], gerudoDesert: ['greenBubble', 'blueBubble'],
  zorasDomain: ['freezard'], ikana: ['bubbleMM'], snowhead: ['freezard'], dragonRoost: ['redBubble'], earthTemple: ['blueBubble', 'darkChuchu'],
  towerOfTheGods: ['darkChuchu'], windTemple: ['darkChuchu'], greatSea: ['purpleChuchu'],
};

/** Monster spoils (the Bubble drops). */
export const EXTRA_SPOILS: Record<string, string> = {
  redBubble: 'redBubbleFlame', blueBubble: 'blueBubbleFlame', greenBubble: 'greenBubbleFlame', whiteBubble: 'whiteBubbleSkull', bubbleMM: 'cursedSkullCharm',
  skullBubble: 'spectralSkullFragment', purpleChuchu: 'purpleChuJelly', rareChuchu: 'rareChuJelly',
};
