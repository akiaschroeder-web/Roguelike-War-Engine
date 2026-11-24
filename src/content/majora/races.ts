import type { RaceDef } from '../../engine/types';

export const RACES: RaceDef[] = [
  { id: 'deity', name: 'Deity', desc: 'A divine being of immense power.', tags: ['divine'], growthMods: { str: 10, mag: 10, def: 5 } },
  { id: 'giant', name: 'Giant', desc: 'One of the four guardians of Termina.', tags: ['divine', 'giant'], growthMods: { hp: 25, str: 10, spd: -15 } },
];
