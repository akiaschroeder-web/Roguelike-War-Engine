// River Zora: a generic racial roster (docs/river-zora.md), separate from the Ocarina of Time pack's Sea Zora.
// Hostile and friendly River Zora share these entries; all six are recruitable generics that join the region
// pools of the original Zelda, the Era of Legend (A Link to the Past, Link's Awakening, the Oracles) and A Link
// Between Worlds. Their rules (submerging, the natural Fireball, Flood…) are in engine/lorule.ts.

import type { AbilityDef, ClassDef, EnemyArchetype, EventDef, GearDef, GearSlotKind, Growths, Rarity, RaceDef, SkillDef, Stats, UnitTemplate, WeaponDef, WeaponType, WildAbilitySpec } from '../../engine/types';
import type { ContentPack } from '../types';
import { REGIONS as ORIGINAL_REGIONS } from '../original/regions';
import { REGIONS as LEGEND_REGIONS } from '../legend/regions';
import { REGIONS as LORULE_REGIONS } from '../lorule/regions';

const st = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number, sta: number, mp: number): Stats =>
  ({ hp, str, mag, skl, spd, def, res, lck, con, mov, sta, mp });
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });

export const RIVER_ZORA_IDS = ['riverZora', 'riverZoraWarrior', 'riverZoraHunter', 'riverZoraGuardian', 'riverZoraSorcerer', 'riverZoraChieftain'];

const RACES: RaceDef[] = [
  { id: 'riverZora', name: 'River Zora', desc: 'Aquatic Adaptation: water costs 1 MOV and deep water needs no equipment; +15 Avoid in water; they submerge to hide from ordinary enemies (but lightning hurts them more while submerged); natural projectile attacks need no equipped weapon.',
    tags: ['aquatic', 'zora', 'riverZora'], swims: true, weakTo: [], growthMods: { mag: 5, spd: 5 } },
];

const c = (id: string, name: string, icon: string, weapons: WeaponType[], growths: Growths, base: Stats, tags: string[] = []): ClassDef =>
  ({ id, name, icon, weapons, moveType: 'foot', base, growths, tags: ['aquatic', ...tags] });
const CLASSES: ClassDef[] = [
  c('aquaticSkirmisher', 'Aquatic Skirmisher', '🐟', ['natural', 'magic', 'lance'], g(55, 30, 45, 40, 45, 25, 30, 20), st(24, 9, 12, 10, 12, 7, 8, 6, 8, 5, 24, 30)),
  c('aquaticWarriorRZ', 'Aquatic Warrior', '🔱', ['lance', 'natural', 'magic'], g(80, 50, 20, 45, 40, 45, 20, 20), st(32, 17, 8, 13, 12, 13, 7, 6, 12, 6, 35, 20)),
  c('aquaticHunter', 'Aquatic Hunter', '🎯', ['lance', 'natural', 'magic'], g(60, 40, 40, 60, 60, 20, 30, 30), st(26, 12, 16, 20, 18, 7, 10, 9, 8, 7, 30, 40)),
  c('aquaticHeavy', 'Aquatic Heavy Infantry', '🛡', ['lance', 'natural', 'magic'], g(110, 55, 20, 35, 20, 60, 30, 15), st(48, 21, 10, 12, 7, 24, 12, 5, 24, 4, 45, 25), ['armored']),
  c('aquaticSorcerer', 'Aquatic Sorcerer', '🌊', ['magic', 'staff', 'natural'], g(50, 10, 65, 50, 35, 15, 55, 30), st(25, 5, 25, 16, 11, 6, 22, 9, 7, 5, 20, 65)),
  c('tribalCommander', 'Tribal Commander', '👑', ['lance', 'magic', 'natural'], g(110, 55, 50, 45, 30, 45, 40, 35), st(55, 24, 22, 18, 12, 20, 18, 13, 25, 6, 45, 60)),
];

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });
const SKILLS: SkillDef[] = [
  k('aquaticAdaptation', 'Aquatic Adaptation', 'Water costs 1 MOV (deep water needs no equipment); +15 Avoid in water; can submerge to hide from ordinary enemies (lightning deals +50% while submerged); natural projectiles need no weapon.'),
  k('riverAmbush', 'River Ambush', '+30% damage when attacking right after emerging (the turn it surfaces).'),
  k('shorelineFighter', 'Shoreline Fighter', '+3 STR and DEF in or next to water.'),
  k('beneathTheSurface', 'Beneath the Surface', '+25 Hit and +20 Crit when attacking from concealment (submerged).'),
  k('riverSentinel', 'River Sentinel', 'Intercepts attacks on adjacent River Zora; +5 DEF in water.'),
  k('riverMagic', 'River Magic', 'Abilities cost 25% less MP while in water.'),
  k('lordOfTheRiver', 'Lord of the River', 'River Zora within 4 gain +3 STR, MAG and DEF, and +1 MOV while swimming.'),
];

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };
const w = (id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number, weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {}): WeaponDef =>
  ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });
const ZORA = ['riverZora', 'zora'];
const WEAPONS: WeaponDef[] = [
  w('zoraFireball', 'Zora Fireball', 'natural', 'common', 9, 85, 0, 0, 2, 4, { uses: 0, unique: true, magicContact: true, element: 'fire', lb: ['natural'], desc: 'A natural weapon: a spat fireball (9 magical Might, range 2–4). Needs no equipped weapon.' }),
  w('naturalClaws', 'Natural Claws', 'natural', 'common', 5, 90, 0, 0, 1, 1, { uses: 0, unique: true, desc: 'Webbed claws.' }),
  w('riverZoraSpear', 'River Zora Spear', 'lance', 'common', 10, 85, 0, 5, 1, 2, { races: ZORA, desc: 'Range 1–2.' }),
  w('riverZoraHuntingSpear', 'River Zora Hunting Spear', 'lance', 'uncommon', 12, 85, 5, 5, 1, 2, { races: ZORA, lb: ['concealCrit'], desc: '+15 Crit from concealment.' }),
  w('riverZoraHeavyTrident', 'River Zora Heavy Trident', 'lance', 'rare', 19, 75, 0, 11, 1, 1, { races: ZORA, lb: ['knockback'], desc: 'More knockback: a hit pushes the target back a space.' }),
  w('riverZoraStaff', 'River Zora Staff', 'magic', 'rare', 18, 85, 0, 3, 1, 2, { races: ZORA, element: 'water', lb: ['waterMagic'], desc: '18 magical Might; stronger water magic (+20% water abilities).' }),
  w('riverZoraRoyalTrident', 'River Zora Royal Trident', 'lance', 'epic', 23, 85, 5, 9, 1, 2, { races: ZORA, lb: ['royalTrident'], desc: 'Stronger fire and water attacks (+20%).' }),
];

const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity] + 50, stats, desc, ...extra });
const GEAR: GearDef[] = [
  gs('shield')('riverZoraShellShield', 'River Zora Shell Shield', 'rare', { def: 8 }, '+8 DEF.'),
  gs('body')('riverZoraScaleArmor', 'River Zora Scale Armor', 'common', { def: 4, res: 2 }, '+4 DEF, +2 RES.'),
  gs('body')('riverZoraHeavyArmor', 'River Zora Heavy Armor', 'rare', { def: 9, res: 4, spd: -1 }, '+9 DEF, +4 RES.'),
  gs('body')('riverZoraRoyalArmor', 'River Zora Royal Armor', 'epic', { def: 8, res: 8 }, '+8 DEF, +8 RES.'),
  gs('head')('riverZoraChieftainsCrown', "River Zora Chieftain's Crown", 'epic', { mag: 4, lck: 3 }, '+4 MAG, +3 LCK.'),
  gs('accessory')('riverZoraHuntersCharm', "River Zora Hunter's Charm", 'uncommon', {}, '+10 Crit while concealed.', { lb: ['concealCrit10'] }),
  gs('accessory')('riverZoraMysticCharm', 'River Zora Mystic Charm', 'rare', { res: 2 }, '+3 MP each turn while submerged.', { lb: ['submergedMp'] }),
];

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
const p = (id: string, name: string, mp: number, desc: string, wild: WildAbilitySpec, extra: X = {}): AbilityDef => ab({ id, name, kind: 'personal', mp, desc, wild, ...extra });
const q = (id: string, name: string, mp: number, desc: string, extra: X = {}): AbilityDef => ab({ id, name, kind: 'personal', mp, desc, ...extra });
const ABILITIES: AbilityDef[] = [
  p('rzFireball', 'Fireball', 4, 'A fire projectile at a foe 2–4 away (MAG + 3 fire vs RES).', { target: 'foe', range: [2, 4], dmg: { stat: 'mag', base: 3, vs: 'res', element: 'fire' } }),
  p('clawSwipe', 'Claw Swipe', 0, 'A basic melee swipe (STR + 2 vs DEF).', { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 2 } }, { sta: 3 }),
  q('rzSubmerge', 'Submerge', 0, 'Dive underwater: hidden from ordinary enemies (only lightning and enemies next to you can reach you) until you attack or leave the water. Doesn\'t use your action.',
    { sta: 3, freeAction: true, perTurn: true }),
  q('aquaticRetreat', 'Aquatic Retreat', 0, 'Passive: after attacking from water, swim up to 3 spaces away through connected water (4 STA).', { sta: 4 }),
  p('spearThrust', 'Spear Thrust', 0, 'A piercing thrust at a foe 1–2 away (STR + 4 vs DEF, ignores 30% of DEF).', { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 4, pierce: 0.3, weapon: true } }, { sta: 4 }),
  p('aquaticCharge', 'Aquatic Charge', 0, 'Charge at a foe within 3, then strike (STR + 5 vs DEF).', { target: 'foe', range: [1, 3], move: true, dmg: { stat: 'str', base: 5 } }, { sta: 6 }),
  p('draggingStrike', 'Dragging Strike', 0, 'Strike an adjacent foe and drag it a space (STR + 2 vs DEF).', { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 2 }, pull: 1 }, { sta: 7 }),
  p('precisionFireball', 'Precision Fireball', 6, 'A careful shot at a foe 2–5 away (MAG + 5 fire vs RES).', { target: 'foe', range: [2, 5], dmg: { stat: 'mag', base: 5, vs: 'res', element: 'fire' } }),
  p('ambushStrike', 'Ambush Strike', 0, 'A strike at an adjacent foe that hasn\'t seen you (STR + weapon + 8 vs DEF).', { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 8, weapon: true } }, { sta: 5 }),
  q('silentSwim', 'Silent Swim', 0, 'Passive: moves underwater without breaking concealment.'),
  p('huntersMark', "Hunter's Mark", 0, 'Mark a foe within 4: Exposed for 2 turns (allies gain Hit against it).', { target: 'foe', range: [1, 4], status: { kind: 'exposed', turns: 2 } }, { sta: 4 }),
  p('heavyTrident', 'Heavy Trident', 0, 'A powerful piercing attack on a foe 1–2 away (STR + 7 vs DEF, ignores 30% of DEF).', { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 7, pierce: 0.3, weapon: true } }, { sta: 5 }),
  p('tidalSweep', 'Tidal Sweep', 0, 'Hits every foe next to it and knocks them back (STR + 3 vs DEF).', { target: 'foes', radius: 1, dmg: { stat: 'str', base: 3 }, push: 1 }, { sta: 8 }),
  p('guardianStance', 'Guardian Stance', 0, 'Brace: 40% less physical damage taken until its next turn.', { target: 'self', buff: { id: 'guardianStance', name: 'Guardian Stance', turns: 1 } }, { sta: 5 }),
  p('greaterFireball', 'Greater Fireball', 8, 'A large explosive projectile at a foe 2–4 away and everyone next to it (MAG + 5 fire vs RES).', { target: 'foe', range: [2, 4], radius: 1, dmg: { stat: 'mag', base: 5, vs: 'res', element: 'fire' } }),
  p('waterJet', 'Water Jet', 6, 'A jet of water at a foe 1–3 away (MAG + 3 vs RES) that pushes it back 2.', { target: 'foe', range: [1, 3], dmg: { stat: 'mag', base: 3, vs: 'res', element: 'water' }, push: 2, tags: ['water'] }),
  q('flood', 'Flood', 15, 'A 2×2 area of open ground within 3 becomes shallow water for 4 turns.', { cooldown: 3 }),
  q('healingCurrent', 'Healing Current', 10, 'Aquatic allies within 3 recover 25% HP.', { cooldown: 2 }),
  q('boilingCurrent', 'Boiling Current', 15, 'Every foe in the water within 4 is scalded (MAG + 6 fire vs RES).', { cooldown: 3 }),
  p('royalTridentStrike', 'Royal Trident Strike', 0, 'A royal blow on a foe 1–2 away (STR + weapon + 10 vs DEF).', { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 10, weapon: true } }, { sta: 6 }),
  p('royalFireball', 'Royal Fireball', 10, 'An explosive fireball at a foe 2–4 away and everyone next to it (MAG + 8 fire vs RES).', { target: 'foe', range: [2, 4], radius: 1, dmg: { stat: 'mag', base: 8, vs: 'res', element: 'fire' } }),
  q('riverRally', 'River Rally', 0, 'Restores morale (+5); River Zora within 3 gain +3 SPD for 3 turns.', { sta: 8, cooldown: 3 }),
  q('risingTide', 'Rising Tide', 20, 'Floods the open ground within 3 for 4 turns.', { cooldown: 5 }),
  q('aquaticReinforcements', 'Aquatic Reinforcements', 15, 'Two River Zora surface beside him and fight for 3 turns.', { oncePerBattle: true }),
];
/** River Zora abilities handled by engine/lorule.ts castLorule. */
export const RZ_SPECIAL = ['rzSubmerge', 'aquaticRetreat', 'silentSwim', 'flood', 'healingCurrent', 'boilingCurrent', 'riverRally', 'risingTide', 'aquaticReinforcements'];

const t = (d: UnitTemplate): UnitTemplate => d;
const TEMPLATES: UnitTemplate[] = [
  t({ id: 'riverZora', name: 'River Zora', title: 'Aquatic Skirmisher', race: 'riverZora', classId: 'aquaticSkirmisher', size: 1, home: 'swampPalaceLB', glyph: 'rZ', generic: true,
    stats: st(24, 9, 12, 10, 12, 7, 8, 6, 8, 5, 24, 30), weapons: ['zoraFireball', 'naturalClaws'], skill: 'riverAmbush', extraSkills: ['aquaticAdaptation'],
    abilities: ['rzFireball', 'clawSwipe', 'rzSubmerge', 'aquaticRetreat'], bio: 'A river-dwelling Zora who surfaces, spits a fireball, and is gone again before you can turn.' }),
  t({ id: 'riverZoraWarrior', name: 'River Zora Warrior', title: 'Aquatic Warrior', race: 'riverZora', classId: 'aquaticWarriorRZ', size: 1, home: 'swampPalaceLB', glyph: 'rW', generic: true,
    stats: st(32, 17, 8, 13, 12, 13, 7, 6, 12, 6, 35, 20), weapons: ['riverZoraSpear', 'zoraFireball'], gear: { body: 'riverZoraScaleArmor' }, skill: 'shorelineFighter', extraSkills: ['aquaticAdaptation'],
    abilities: ['spearThrust', 'aquaticCharge', 'draggingStrike', 'rzFireball', 'rzSubmerge'], bio: 'A spear-carrying River Zora who fights best with its feet wet.' }),
  t({ id: 'riverZoraHunter', name: 'River Zora Hunter', title: 'Aquatic Hunter', race: 'riverZora', classId: 'aquaticHunter', size: 1, home: 'swampPalaceLB', glyph: 'rH', generic: true,
    stats: st(26, 12, 16, 20, 18, 7, 10, 9, 8, 7, 30, 40), weapons: ['riverZoraHuntingSpear', 'zoraFireball'], gear: { acc1: 'riverZoraHuntersCharm' }, skill: 'beneathTheSurface', extraSkills: ['aquaticAdaptation'],
    abilities: ['precisionFireball', 'ambushStrike', 'silentSwim', 'huntersMark', 'rzSubmerge'], bio: 'A patient hunter who waits under the surface for hours, then strikes once.' }),
  t({ id: 'riverZoraGuardian', name: 'River Zora Guardian', title: 'Aquatic Heavy Infantry', race: 'riverZora', classId: 'aquaticHeavy', size: 2, home: 'swampPalaceLB', glyph: 'rG', generic: true,
    stats: st(48, 21, 10, 12, 7, 24, 12, 5, 24, 4, 45, 25), weapons: ['riverZoraHeavyTrident', 'zoraFireball'], gear: { shield: 'riverZoraShellShield', body: 'riverZoraHeavyArmor' }, skill: 'riverSentinel', extraSkills: ['aquaticAdaptation'],
    abilities: ['heavyTrident', 'tidalSweep', 'guardianStance', 'greaterFireball', 'rzSubmerge'], bio: 'A huge, shell-armoured River Zora who plants itself in the shallows in front of its kin.' }),
  t({ id: 'riverZoraSorcerer', name: 'River Zora Sorcerer', title: 'Aquatic Sorcerer', race: 'riverZora', classId: 'aquaticSorcerer', size: 1, home: 'swampPalaceLB', glyph: 'rS', generic: true,
    stats: st(25, 5, 25, 16, 11, 6, 22, 9, 7, 5, 20, 65), weapons: ['riverZoraStaff', 'zoraFireball'], gear: { acc1: 'riverZoraMysticCharm' }, skill: 'riverMagic', extraSkills: ['aquaticAdaptation'],
    abilities: ['greaterFireball', 'waterJet', 'flood', 'healingCurrent', 'boilingCurrent', 'rzSubmerge'], bio: 'A River Zora who talks to the current, and the current listens: it floods fields and boils ponds.' }),
  t({ id: 'riverZoraChieftain', name: 'River Zora Chieftain', title: 'Tribal Commander', race: 'riverZora', classId: 'tribalCommander', size: 2, home: 'swampPalaceLB', glyph: 'rC', generic: true,
    stats: st(55, 24, 22, 18, 12, 20, 18, 13, 25, 6, 45, 60), weapons: ['riverZoraRoyalTrident', 'zoraFireball'], gear: { head: 'riverZoraChieftainsCrown', body: 'riverZoraRoyalArmor' }, skill: 'lordOfTheRiver', extraSkills: ['aquaticAdaptation'],
    abilities: ['royalTridentStrike', 'royalFireball', 'riverRally', 'risingTide', 'aquaticReinforcements', 'rzSubmerge'], bio: 'A generic tribal leader of the River Zora, crowned in shell and coral. Not a queen — but the river obeys.' }),
];

const ENEMY_STATS: Record<string, Stats> = Object.fromEntries(TEMPLATES.map((x) => [x.id, x.stats]));
const ENEMIES: EnemyArchetype[] = TEMPLATES.map((x) => ({ id: x.id, name: x.name, classId: x.classId, race: x.race, size: x.size, weapons: [...x.weapons], skill: x.skill, stats: ENEMY_STATS[x.id], glyph: x.glyph }));

// Region pools: every region of these campaigns with water (rivers, lakes, moats or many pools).
const watery = [...ORIGINAL_REGIONS, ...LEGEND_REGIONS, ...LORULE_REGIONS].filter((r) => r.map.water !== 'none');
// The first regions of each campaign only see the plain River Zora (the heavier ones wait further in).
const EARLY = new Set(['kakarikoLB', 'easternPalaceLB', 'houseOfGales', 'level1Eagle', 'level2Moon', 'level3Manji', 'hyruleCastleLttP', 'easternPalace', 'mabeVillage', 'horonVillage', 'lynnaVillage']);
const ROSTERS: Record<string, string[]> = Object.fromEntries(watery.map((r) => [r.id, EARLY.has(r.id) ? ['riverZora']
  : ['riverZora', 'riverZora', 'riverZoraWarrior', 'riverZoraHunter', ...(r.map.water === 'many' || r.map.water === 'lake' ? ['riverZoraSorcerer', 'riverZoraGuardian'] : [])]]));
/** The regions River Zora were added to. */
export const RIVER_ZORA_REGIONS = watery.map((r) => r.id);

const EVENTS: EventDef[] = [
  { id: 'riverZoraShallows', title: 'Eyes in the Shallows', art: 'riverZora', regions: RIVER_ZORA_REGIONS,
    text: 'Bubbles rise from the river. A finned head surfaces, watches you with round red eyes, and sinks again. Then three more.',
    choices: [
      { label: 'Offer a gift of fish', outcome: { text: 'A River Zora climbs out, dripping, and bows. It wants to come along.', effects: [{ kind: 'recruit', pool: ['riverZora', 'riverZoraWarrior', 'riverZoraHunter'] }] } },
      { label: 'Ask to speak to their chieftain', gamble: { chance: 30, win: { text: 'A crowned Zora rises from the deep. "The river remembers your kindness."', effects: [{ kind: 'recruit', pool: ['riverZoraChieftain', 'riverZoraSorcerer', 'riverZoraGuardian'] }] }, lose: { text: 'Fireballs! You retreat from the bank.', effects: [{ kind: 'hp', pct: -0.08 }] } } },
      { label: 'Keep your distance', outcome: { text: 'You march on, away from the water.', effects: [] } },
    ] },
];

export const RIVER_ZORA: ContentPack = {
  id: 'riverZora', name: 'River Zora', races: RACES, classes: CLASSES, weapons: WEAPONS, gear: GEAR, items: [], abilities: ABILITIES, factions: [], supportPairs: [],
  monsterChance: {}, permanentItems: [], skills: SKILLS, regions: [], templates: TEMPLATES, enemies: ENEMIES, rosters: ROSTERS, bosses: [], regionBosses: {},
  commanders: [], artIds: [], artAliases: {}, artVariants: Object.fromEntries(RIVER_ZORA_IDS.map((id) => [id, ['riverZora1', 'riverZora2', 'riverZora3', 'riverZora4', 'riverZora5']])),
  events: EVENTS,
};
