import type { RaceDef } from '../../engine/types';

// Racial traits. Growth modifiers are my balancing proposal (the design doc
// doesn't specify growth rates) and are added to class growths.

export const RACES: RaceDef[] = [
  { id: 'hylian', name: 'Hylian', desc: 'Balanced stats and versatile class options.' },
  { id: 'gerudo', name: 'Gerudo', desc: 'High strength and skill.', growthMods: { str: 10, skl: 10, res: -5 } },
  { id: 'sheikah', name: 'Sheikah', desc: 'High skill, speed and stealth.', growthMods: { skl: 10, spd: 10, hp: -5 } },
  { id: 'goron', name: 'Goron', desc: 'High HP, defense and constitution. Immune to lava.', lavaImmune: true, growthMods: { hp: 15, def: 10, spd: -10 } },
  { id: 'zora', name: 'Zora', desc: 'Swims through water. Effective in aquatic terrain.', swims: true, growthMods: { res: 10, mag: 5, str: -5 } },
  { id: 'kokiri', name: 'Kokiri', desc: 'Moves through forests freely. Magical aptitude.', forestWalker: true, growthMods: { spd: 10, mag: 5, hp: -10 } },
  { id: 'deku', name: 'Deku Scrub', desc: 'Plant-based. Ranged projectiles, forest-walker. Hops across water. Weak to fire.', forestWalker: true, tags: ['plant'], weakTo: ['fire'], growthMods: { skl: 10, def: -5 } },
  { id: 'aquaticDeity', name: 'Aquatic Deity', desc: 'A vast, sacred creature of the deep. Moves only through water.', swims: true, waterOnly: true, tags: ['beast', 'divine'], growthMods: { hp: 20, def: 10, spd: -15 } },
  { id: 'fairy', name: 'Fairy', desc: 'Flight, healing and magic.', flies: true, growthMods: { mag: 10, res: 10, hp: -15, str: -10 } },
  { id: 'owl', name: 'Owl', desc: 'Flight and keen sight.', flies: true, tags: ['beast'] },
  { id: 'spirit', name: 'Forest Spirit', desc: 'An ancient guardian of the forest.', forestWalker: true, tags: ['plant'] },
  { id: 'phantom', name: 'Phantom', desc: 'A spectral copy given form by dark magic.', tags: ['possessed', 'demon'] },
  { id: 'shadow', name: 'Shadow', desc: 'A reflection born of darkness.', tags: ['demon'] },
  { id: 'demon', name: 'Demon', desc: 'A being of pure malice.', tags: ['demon'], lavaImmune: true },
  { id: 'undead', name: 'Undead', desc: 'Restless dead.', tags: ['undead'] },
  { id: 'monster', name: 'Monster', desc: 'Highly variable characteristics.', tags: ['beast'] },
  { id: 'aquatic', name: 'Aquatic Monster', desc: 'Lurks in deep water.', swims: true, tags: ['beast'] },
  { id: 'construct', name: 'Construct', desc: 'Magical machinery.', tags: ['stone'] },
];
