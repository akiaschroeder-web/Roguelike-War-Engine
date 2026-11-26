import type { RaceDef } from '../../engine/types';

// Races new in the Skyward Sword pack. Hylians, Sheikah, Gorons, demons,
// monsters and the undead reuse the existing entries.
export const RACES: RaceDef[] = [
  { id: 'swordSpirit', name: 'Sword Spirit', desc: 'A spirit that lives inside a blade. Fi floats beside her master; Ghirahim is a sword given a body.', flies: true, tags: ['divine', 'spirit', 'sword'], growthMods: { mag: 10, skl: 10, hp: -10 } },
  { id: 'demonSword', name: 'Demon Sword Spirit', desc: 'The spirit of the Demon King\'s sword. Theatrical, cruel and very hard to hit.', tags: ['demon', 'sword'], growthMods: { skl: 10, spd: 5, lck: -10 } },
  { id: 'demonDeity', name: 'Demon Deity', desc: 'The Demon King himself: a god of hatred, wreathed in black flame.', tags: ['demon', 'deity'], growthMods: { hp: 20, str: 10, spd: -10 } },
  { id: 'goddess', name: 'Goddess', desc: 'Hylia, the goddess who guarded the Triforce and lifted Skyloft above the clouds.', tags: ['divine', 'deity'], growthMods: { mag: 15, res: 10, str: -15 } },
  { id: 'skySpirit', name: 'Sky Spirit', desc: 'A great whale of the clouds that guards the skies above Hyrule.', flies: true, tags: ['divine', 'spirit', 'beast', 'sky'], growthMods: { hp: 20, res: 10, spd: -10 } },
  { id: 'waterDragon', name: 'Water Dragon', desc: 'Faron, the dragon of Lake Floria. Never far from water.', swims: true, tags: ['dragon', 'divine', 'aquatic'], weakTo: ['lightning'], growthMods: { mag: 10, res: 10, spd: -10 } },
  { id: 'fireDragon', name: 'Fire Dragon', desc: 'Eldin, the dragon of the volcano. Lives in lava and has the temper to match.', lavaImmune: true, tags: ['dragon', 'divine', 'fire'], weakTo: ['ice'], growthMods: { hp: 10, str: 10, spd: -10 } },
  { id: 'thunderDragon', name: 'Thunder Dragon', desc: 'Lanayru, the dragon of the ancient sea. Old, sick, and still crackling with power.', tags: ['dragon', 'divine', 'lightning'], weakTo: ['water'], growthMods: { mag: 15, skl: 5, def: -5 } },
  { id: 'ancientRobot', name: 'Ancient Robot', desc: 'A machine of the Lanayru era, run on Timeshift Stones. Stronger inside a Timeshift field.', tags: ['construct', 'ancient', 'robot'], weakTo: ['water'], growthMods: { def: 10, hp: 10, spd: -5, mag: -10 } },
  { id: 'kikwi', name: 'Kikwi', desc: 'Round forest folk of Faron Woods. Shy, plant-like and excellent at hiding.', forestWalker: true, tags: ['plant', 'beast'], growthMods: { hp: 10, res: 10, spd: -15 } },
  { id: 'mogma', name: 'Mogma', desc: 'Mole-like treasure hunters of Eldin Volcano who dig through rock as easily as dirt.', tags: ['mogma'], growthMods: { spd: 10, lck: 10, def: -5 } },
  { id: 'loftwingRace', name: 'Loftwing', desc: 'The great birds of Skyloft. Every Skyloftian has one, bound for life.', flies: true, tags: ['bird', 'beast', 'mount'], growthMods: { spd: 10, hp: 5, mag: -20 } },
  { id: 'trialSpirit', name: 'Silent Realm Spirit', desc: 'A guardian of the goddess\'s trials. Silent, relentless, and blind to anything but trespassers.', tags: ['spirit', 'guardian', 'divine'], growthMods: { str: 5, res: 10, lck: -10 } },
  { id: 'sealedDemon', name: 'Sealed Demon', desc: 'The Demon King\'s hatred, sealed beneath Hyrule and forever trying to climb out.', tags: ['demon'], growthMods: { hp: 25, str: 10, spd: -15, lck: -10 } },
  { id: 'fireCreature', name: 'Volcanic Creature', desc: 'A creature of magma and flame. Lava is home; water is death.', lavaImmune: true, tags: ['fire'], weakTo: ['water', 'ice'], growthMods: { mag: 5, def: 5 } },
];
