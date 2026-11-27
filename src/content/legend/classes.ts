import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 16, mp: 12,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(22, 7, 5, 8, 8, 6, 5, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const HERO = g(85, 50, 25, 55, 50, 35, 30, 50);
const MAGE = g(55, 10, 70, 50, 40, 20, 65, 55);
const SAGE = g(50, 10, 65, 55, 25, 20, 60, 50);
const KNIGHT = g(80, 50, 10, 45, 40, 45, 20, 30);
const BEAST = g(85, 50, 10, 40, 45, 35, 20, 30);
const SMALL = g(45, 25, 30, 40, 55, 15, 35, 25);
const BOSS = g(140, 50, 50, 35, 25, 45, 40, 20);
const CASTER_BOSS = g(110, 20, 65, 45, 35, 30, 55, 20);

export const CLASSES: ClassDef[] = [
  // ── Characters ──
  c('legendaryAdventurer', 'Legendary Adventurer', '🗡', ['sword', 'bow', 'boomerang', 'hookshot', 'magic', 'instrument', 'hammer', 'sling'], 'foot', HERO),
  c('sacredMaiden', 'Sacred Maiden', '🔺', ['magic', 'staff', 'instrument'], 'foot', MAGE),
  c('tridentWarlord', 'Trident Warlord', '🔱', ['lance', 'magic'], 'foot', g(130, 55, 55, 40, 30, 45, 45, 15), undefined, ['demon']),
  c('hylianSwordsman', 'Hylian Swordsman', '⚔', ['sword', 'lance'], 'foot', KNIGHT),
  c('elderSage', 'Elder Sage', '📜', ['magic', 'staff'], 'foot', SAGE),
  c('desertSage', 'Desert Sage', '🏜', ['magic', 'staff'], 'foot', SAGE),
  c('witch', 'Witch', '🧪', ['magic', 'staff'], 'foot', g(55, 10, 60, 55, 30, 20, 55, 60)),
  c('travelingMusician', 'Traveling Musician', '🎶', ['instrument', 'sling', 'staff'], 'foot', g(55, 15, 45, 50, 50, 20, 40, 60)),
  c('darkWizard', 'Dark Wizard', '🧙', ['magic', 'staff'], 'foot', g(85, 15, 70, 55, 45, 25, 60, 20)),
  c('dreamSinger', 'Dream Singer', '🎵', ['instrument', 'staff', 'magic'], 'foot', g(55, 10, 60, 55, 45, 15, 55, 65)),
  c('forager', 'Forager', '🍄', ['hammer', 'axe'], 'foot', g(75, 40, 0, 30, 25, 35, 20, 55)),
  c('chainChompClass', 'Chain Chomp', '⛓', ['natural'], 'foot', BEAST),
  c('flyingCompanion', 'Flying Companion', '🐓', ['natural'], 'flying', g(50, 25, 15, 40, 65, 15, 25, 45)),
  c('dreamDeity', 'Dream Deity', '🐋', ['magic', 'natural'], 'flying', g(140, 25, 65, 45, 25, 35, 60, 45), undefined, ['divine']),
  c('oracleOfSeasonsClass', 'Oracle of Seasons', '🍂', ['magic', 'staff'], 'foot', g(60, 15, 65, 50, 50, 20, 55, 55)),
  c('oracleOfAgesClass', 'Oracle of Ages', '⌛', ['instrument', 'magic', 'staff'], 'foot', g(55, 10, 70, 55, 40, 20, 65, 60)),
  c('oracleOfSecretsClass', 'Oracle of Secrets', '🗝', ['magic', 'staff'], 'foot', g(55, 10, 60, 65, 45, 15, 60, 70)),
  c('royalSwordsman', 'Royal Swordsman', '🤺', ['sword'], 'foot', g(75, 50, 10, 50, 55, 30, 20, 35)),
  c('royalNursemaid', 'Royal Nursemaid', '🛡', ['staff', 'magic', 'dagger'], 'foot', g(65, 25, 45, 45, 25, 35, 45, 40)),
  c('royalCommander', 'Royal Commander', '👑', ['lance', 'staff', 'magic'], 'foot', g(60, 20, 50, 55, 35, 30, 45, 45)),
  c('guardianTreeClass', 'Guardian Tree', '🌳', ['magic', 'staff', 'natural'], 'fixed', g(150, 15, 60, 40, 5, 50, 60, 40), undefined, ['plant']),
  c('boxingKangaroo', 'Boxing Kangaroo', '🥊', ['gauntlet', 'natural'], 'foot', g(85, 50, 10, 50, 55, 30, 20, 30), undefined, ['beast']),
  c('aquaticDodongo', 'Aquatic Dodongo', '🦎', ['natural'], 'foot', g(100, 45, 5, 30, 25, 50, 25, 30), undefined, ['beast']),
  c('flyingBear', 'Flying Bear', '🐻', ['natural'], 'flying', g(110, 55, 0, 25, 25, 40, 20, 35), undefined, ['beast']),
  // ── Forms ──
  c('possessedOracle', 'Possessed Oracle', '👁', ['magic', 'instrument', 'staff'], 'foot', MAGE, undefined, ['possessed']),
  c('darkDragon', 'Dark Dragon', '🐉', ['natural', 'magic'], 'flying', BOSS, undefined, ['dragon', 'demon']),
  c('shadowFairy', 'Shadow Fairy', '🧚', ['magic'], 'flying', CASTER_BOSS, undefined, ['demon']),
  c('shellBeast', 'Shell Beast', '🐢', ['natural'], 'foot', BOSS, undefined, ['demon']),
  c('webSpider', 'Web Spider', '🕷', ['natural'], 'foot', BOSS, undefined, ['demon', 'insect']),
  c('queenBee', 'Queen Bee', '🐝', ['natural', 'magic'], 'flying', CASTER_BOSS, undefined, ['demon', 'insect']),
  // ── New monsters ──
  c('cursedSpirit', 'Cursed Spirit', '💀', ['natural', 'magic'], 'flying', SMALL, s(16, 3, 12, 9, 14, 3, 15, 3, 2, 7), ['undead']),
  c('electricSlime', 'Electric Slime', '⚡', ['natural'], 'foot', g(60, 25, 35, 30, 25, 25, 30, 20), s(22, 6, 12, 7, 7, 5, 10, 5, 5, 4)),
  c('strangeSlime', 'Strange Slime', '🥒', ['natural', 'magic'], 'foot', g(60, 20, 40, 40, 25, 25, 35, 45), s(24, 5, 14, 11, 6, 5, 12, 12, 5, 4)),
  c('burrowingBeast', 'Burrowing Beast', '⛏', ['natural'], 'foot', BEAST, s(36, 16, 0, 12, 11, 13, 5, 4, 15, 6)),
  c('heavyThrower', 'Heavy Thrower', '⚫', ['natural', 'hammer'], 'foot', g(95, 50, 0, 35, 20, 40, 15, 15), s(40, 19, 0, 12, 7, 14, 5, 5, 22, 4)),
  c('wizzrobeCaster', 'Wizzrobe', '🪄', ['magic'], 'foot', g(55, 10, 60, 45, 45, 15, 50, 20), s(26, 3, 15, 12, 11, 4, 13, 5, 4, 5)),
  // ── Bosses ──
  c('armoredTyrant', 'Armored Tyrant', '🦖', ['natural'], 'foot', BOSS),
  c('arrgiSwarm', 'Swarm Eye', '🫧', ['natural', 'magic'], 'flying', BOSS),
  c('headlessThief', 'Headless Thief', '👺', ['magic', 'natural'], 'foot', CASTER_BOSS, undefined, ['demon']),
  c('frozenEye', 'Frozen Eye', '❄', ['magic', 'natural'], 'foot', BOSS),
  c('eyeColony', 'Eye Colony', '👀', ['magic', 'natural'], 'foot', CASTER_BOSS),
  c('bottleGenie', 'Bottle Genie', '🏺', ['magic', 'natural'], 'flying', CASTER_BOSS, undefined, ['demon']),
  c('dividingEye', 'Dividing Eye', '🟡', ['natural'], 'foot', BOSS),
  c('deepPredator', 'Deep Predator', '🐟', ['natural'], 'foot', BOSS, undefined, ['aquatic']),
  c('burrowingEel', 'Burrowing Eel', '🪱', ['natural'], 'foot', BOSS),
  c('livingFloor', 'Living Floor', '▦', ['magic', 'natural'], 'fixed', CASTER_BOSS),
  c('galeRaptor', 'Gale Raptor', '🦅', ['natural', 'magic'], 'flying', BOSS),
  c('livingFlame', 'Living Flame', '🔥', ['magic', 'natural'], 'foot', CASTER_BOSS),
  c('nightmareShadow', 'Nightmare Shadow', '🌑', ['magic', 'natural', 'lance'], 'foot', g(150, 50, 60, 40, 40, 40, 50, 15), undefined, ['demon']),
  c('petrifyingHead', 'Petrifying Head', '🐍', ['magic', 'natural'], 'flying', CASTER_BOSS),
  c('generalOfDarknessClass', 'General of Darkness', '⛓', ['hammer', 'natural'], 'armor', BOSS, undefined, ['demon', 'armored']),
  c('headlessSpirit', 'Headless Spirit', '🎃', ['natural', 'magic'], 'foot', BOSS, undefined, ['undead']),
  c('thwompGuardian', 'Thwomp Guardian', '🗿', ['natural'], 'armor', BOSS, undefined, ['stone']),
  c('shadowWitch', 'Shadow Witch', '🧹', ['magic'], 'flying', CASTER_BOSS, undefined, ['undead']),
  c('orbitingEye', 'Orbiting Eye', '🧿', ['magic', 'natural'], 'flying', CASTER_BOSS),
  c('cloudBeast', 'Cloud Beast', '☁', ['magic', 'natural'], 'flying', CASTER_BOSS),
  c('amphibiousOcto', 'Amphibious Octo', '🐙', ['natural'], 'foot', BOSS, undefined, ['aquatic']),
  c('arsenalGolem', 'Arsenal Golem', '🤖', ['natural', 'gauntlet'], 'armor', BOSS, undefined, ['stone', 'armored']),
  c('sorceressOfShadowsClass', 'Sorceress of Shadows', '🦋', ['magic'], 'foot', CASTER_BOSS, undefined, ['demon']),
];
