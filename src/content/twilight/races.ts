import type { RaceDef } from '../../engine/types';

export const RACES: RaceDef[] = [
  { id: 'twili', name: 'Twili', desc: 'People of the Twilight Realm, descended from the Interlopers. Strong in shadow magic and at home in Twilight.', tags: ['twili', 'shadow'], growthMods: { mag: 10, res: 5, def: -5 } },
  { id: 'sacredBeast', name: 'Sacred Beast', desc: 'A Hylian transformed by Twilight into a great wolf. Keen senses; can dig and howl.', tags: ['beast', 'canine'], growthMods: { spd: 10, str: 5, mag: -10 } },
  { id: 'heroSpirit', name: 'Undead Spirit', desc: 'The restless spirit of a long-dead warrior. Undead and unseen to most.', tags: ['undead', 'spirit'], weakTo: ['light'], growthMods: { skl: 10, hp: 5, lck: -10 } },
  { id: 'yeti', name: 'Yeti', desc: 'Furry mountain folk of Snowpeak. Huge, warm-hearted, at home on snow and ice.', tags: ['beast'], growthMods: { hp: 20, str: 5, spd: -10 } },
  { id: 'oocca', name: 'Oocca', desc: 'Bird-bodied people of the City in the Sky. They flutter rather than fly, but they do get over walls.', flies: true, tags: ['bird'], growthMods: { mag: 10, hp: -10, str: -10 } },
  { id: 'lightSpirit', name: 'Light Spirit', desc: 'One of the four spirits that guard Hyrule\'s light. Divine; purifies Twilight wherever it stands.', tags: ['divine', 'spirit', 'light'], growthMods: { mag: 10, res: 10, hp: 10, spd: -10 } },
  { id: 'twilit', name: 'Twilit Creature', desc: 'A creature twisted by Twilight. Stronger in Twilight terrain; burned by sacred light.', tags: ['shadow', 'twilight'], weakTo: ['light'], growthMods: { mag: 5, res: 5 } },
  { id: 'bullbo', name: 'Bullbo', desc: 'A great tusked boar ridden by the Bulblin raiders.', tags: ['beast'], growthMods: { hp: 15, str: 5, mag: -20 } },
];
