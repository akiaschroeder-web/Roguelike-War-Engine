import type { RaceDef } from '../../engine/types';

export const RACES: RaceDef[] = [
  { id: 'rito', name: 'Rito', desc: 'Bird-folk of Dragon Roost. They fly over water and walls of rock alike.', flies: true, tags: ['bird'], growthMods: { spd: 10, skl: 5, def: -5 } },
  { id: 'korok', name: 'Korok', desc: 'Little tree spirits. Forest-walkers who glide on leaves. Weak to fire.', forestWalker: true, tags: ['plant', 'spirit'], weakTo: ['fire'], growthMods: { mag: 10, res: 5, hp: -10, str: -5 } },
  { id: 'zoraSpirit', name: 'Zora Spirit', desc: 'The spirit of an ancient Zora sage. Swims through water.', swims: true, tags: ['spirit', 'divine'], growthMods: { mag: 10, res: 10, hp: -10 } },
  { id: 'kokiriSpirit', name: 'Kokiri Spirit', desc: 'The spirit of an ancient Kokiri sage. Moves freely through forests.', forestWalker: true, tags: ['spirit', 'divine'], growthMods: { mag: 10, spd: 5, hp: -10 } },
  { id: 'dragonDeity', name: 'Dragon Deity', desc: 'A sky spirit in the shape of a great dragon. Flies; immune to lava.', flies: true, lavaImmune: true, tags: ['divine', 'beast', 'dragon'], growthMods: { hp: 20, str: 10, spd: -10 } },
  { id: 'windDeity', name: 'Wind Deity', desc: 'A frog-like god of the winds, riding a cloud.', flies: true, tags: ['divine'], growthMods: { mag: 10, spd: 5 } },
  { id: 'aquaticCreature', name: 'Aquatic Creature', desc: 'A sea creature that can talk. Swims.', swims: true, tags: ['beast'] },
  { id: 'vessel', name: 'Vessel', desc: 'A ship. Sails only on water, carries passengers, and has a hull, sail, rudder, mast and cannons that can be knocked out.', swims: true, waterOnly: true, tags: ['vessel', 'wood'], growthMods: { hp: 20, def: 5, spd: -10, mag: -20, lck: -10 } },
  { id: 'enchantedVessel', name: 'Enchanted Vessel', desc: 'A talking boat with a will of its own. Sails only on water and carries passengers.', swims: true, waterOnly: true, tags: ['vessel', 'divine'], growthMods: { hp: 15, res: 5, spd: -5 } },
  { id: 'chuchu', name: 'ChuChu', desc: 'A jelly blob. Squishy and surprisingly resilient.', tags: ['beast', 'jelly'] },
];
