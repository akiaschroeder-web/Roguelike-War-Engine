// Core rules shared by every content pack.

import type { BaseTerrain, MoveType, Terrain, WeaponType } from './types';

export const INF = 99;

const SPECIAL = (open: number) => ({ cracked: INF, timeBlock: INF, timeGap: open, bridge: open });
export const MOVE_COSTS: Record<MoveType, Record<Terrain, number>> = {
  foot:    { plain: 1, forest: 2, mountain: 3, water: INF, wall: INF, fort: 1, lava: 2, ...SPECIAL(1) },
  cavalry: { plain: 1, forest: 3, mountain: INF, water: INF, wall: INF, fort: 1, lava: 3, ...SPECIAL(1) },
  armor:   { plain: 1, forest: 2, mountain: INF, water: INF, wall: INF, fort: 1, lava: 2, ...SPECIAL(1) },
  flying:  { plain: 1, forest: 1, mountain: 1, water: 1, wall: INF, fort: 1, lava: 1, ...SPECIAL(1) },
  fixed:   { plain: INF, forest: INF, mountain: INF, water: INF, wall: INF, fort: INF, lava: INF, ...SPECIAL(INF) },
};

export const TERRAIN_BONUS: Record<Terrain, { avoid: number; def: number; heal: number }> = {
  plain:    { avoid: 0, def: 0, heal: 0 },
  forest:   { avoid: 20, def: 1, heal: 0 },
  mountain: { avoid: 30, def: 2, heal: 0 },
  water:    { avoid: 0, def: 0, heal: 0 },
  wall:     { avoid: 0, def: 0, heal: 0 },
  fort:     { avoid: 20, def: 2, heal: 20 },
  lava:     { avoid: 0, def: 0, heal: 0 },
  cracked:  { avoid: 0, def: 0, heal: 0 },
  timeBlock: { avoid: 0, def: 0, heal: 0 },
  timeGap:  { avoid: 0, def: 0, heal: 0 },
  bridge:   { avoid: 0, def: 0, heal: 0 },
};

/** Display names and colours for special terrain (regions name the basic ones). */
export const SPECIAL_TERRAIN: Record<Exclude<Terrain, BaseTerrain>, { name: string; color: string }> = {
  cracked: { name: 'Cracked Wall', color: '#7a6a5a' },
  timeBlock: { name: 'Time Block', color: '#5a5aa0' },
  timeGap: { name: 'Time Block Slot', color: '#8a8ab8' },
  bridge: { name: 'Bridge', color: '#9a7a4a' },
};

/** Lava damage at the start of a unit's turn (as % of max HP). */
export const LAVA_DAMAGE_PCT = 20;

/** Weapon triangle: key beats value. */
export const TRIANGLE: Partial<Record<WeaponType, WeaponType>> = {
  sword: 'axe',
  axe: 'lance',
  lance: 'sword',
};

export function isMagical(type: WeaponType): boolean {
  return type === 'magic' || type === 'staff';
}

export const MAX_LEVEL = 30;
export const XP_PER_LEVEL = 100;
export const ARMY_CAPACITY = 12;
export const DEPLOY_CAPACITY = 8;
