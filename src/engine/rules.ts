// Core rules shared by every content pack.

import type { BaseTerrain, MoveType, Terrain, WeaponType } from './types';

export const INF = 99;

// Water-like spaces (poisoned water, currents, whirlpools) follow the unit's water cost.
// `rough` is the cost of climbing (watchtowers, trees, sinking sand); `gap` is a rope swing over a drop.
const SPECIAL = (open: number, water = INF, rough = 2, gap = INF) => ({
  cracked: INF, timeBlock: INF, timeGap: open, bridge: open,
  dekuFlower: open, goldFlower: open, owlStatue: INF, poisonWater: water, frozenMech: INF, rollingRamp: open,
  current: water, waterwheel: INF, sunBlock: INF, weightedSwitch: open, inversionSwitch: open, mailbox: INF,
  whirlpool: water, updraft: open, ropeSwing: gap, grapplePost: INF, hangingVine: INF, plantingSoil: open, grownTree: rough,
  shipDeck: open, boardingPoint: open, cannonEmplacement: open, submergedTreasure: water, sandVortex: rough, spikedBarrel: INF,
  watchtower: rough, searchlight: INF, commandStatue: INF,
});
export const MOVE_COSTS: Record<MoveType, Record<Terrain, number>> = {
  foot:    { plain: 1, forest: 2, mountain: 3, water: INF, wall: INF, fort: 1, lava: 2, ...SPECIAL(1) },
  cavalry: { plain: 1, forest: 3, mountain: INF, water: INF, wall: INF, fort: 1, lava: 3, ...SPECIAL(1, INF, 3) },
  armor:   { plain: 1, forest: 2, mountain: INF, water: INF, wall: INF, fort: 1, lava: 2, ...SPECIAL(1) },
  flying:  { plain: 1, forest: 1, mountain: 1, water: 1, wall: INF, fort: 1, lava: 1, ...SPECIAL(1, 1, 1, 1) },
  fixed:   { plain: INF, forest: INF, mountain: INF, water: INF, wall: INF, fort: INF, lava: INF, ...SPECIAL(INF, INF, INF) },
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
  dekuFlower: { avoid: 10, def: 0, heal: 0 },
  goldFlower: { avoid: 10, def: 0, heal: 0 },
  owlStatue: { avoid: 0, def: 0, heal: 0 },
  poisonWater: { avoid: 0, def: 0, heal: 0 },
  frozenMech: { avoid: 0, def: 0, heal: 0 },
  rollingRamp: { avoid: 0, def: 0, heal: 0 },
  current: { avoid: 0, def: 0, heal: 0 },
  waterwheel: { avoid: 0, def: 0, heal: 0 },
  sunBlock: { avoid: 0, def: 0, heal: 0 },
  weightedSwitch: { avoid: 0, def: 0, heal: 0 },
  inversionSwitch: { avoid: 0, def: 0, heal: 0 },
  mailbox: { avoid: 0, def: 0, heal: 0 },
  whirlpool: { avoid: -10, def: 0, heal: 0 },
  updraft: { avoid: 10, def: 0, heal: 0 },
  ropeSwing: { avoid: 0, def: 0, heal: 0 },
  grapplePost: { avoid: 0, def: 0, heal: 0 },
  hangingVine: { avoid: 0, def: 0, heal: 0 },
  plantingSoil: { avoid: 0, def: 0, heal: 0 },
  grownTree: { avoid: 30, def: 2, heal: 10 },
  shipDeck: { avoid: 0, def: 1, heal: 0 },
  boardingPoint: { avoid: 0, def: 0, heal: 0 },
  cannonEmplacement: { avoid: 10, def: 2, heal: 0 },
  submergedTreasure: { avoid: 0, def: 0, heal: 0 },
  sandVortex: { avoid: -15, def: 0, heal: 0 },
  spikedBarrel: { avoid: 0, def: 0, heal: 0 },
  watchtower: { avoid: 20, def: 2, heal: 0 },
  searchlight: { avoid: 0, def: 0, heal: 0 },
  commandStatue: { avoid: 0, def: 0, heal: 0 },
};

/** Water-like spaces: swimmers move through them, others can't. */
export const WATERY: Terrain[] = ['water', 'poisonWater', 'current', 'whirlpool', 'submergedTreasure'];

/** Display names and colours for special terrain (regions name the basic ones). */
export const SPECIAL_TERRAIN: Record<Exclude<Terrain, BaseTerrain>, { name: string; color: string }> = {
  cracked: { name: 'Cracked Wall', color: '#7a6a5a' },
  timeBlock: { name: 'Time Block', color: '#5a5aa0' },
  timeGap: { name: 'Time Block Slot', color: '#8a8ab8' },
  bridge: { name: 'Bridge', color: '#9a7a4a' },
  dekuFlower: { name: 'Deku Flower', color: '#c06ab0' },
  goldFlower: { name: 'Golden Deku Flower', color: '#d9b440' },
  owlStatue: { name: 'Owl Statue', color: '#8a7a6a' },
  poisonWater: { name: 'Poisoned Water', color: '#6a3a7a' },
  frozenMech: { name: 'Frozen Mechanism', color: '#9ad0e8' },
  rollingRamp: { name: 'Rolling Ramp', color: '#b08a5a' },
  current: { name: 'Underwater Current', color: '#2a6ab0' },
  waterwheel: { name: 'Waterwheel', color: '#6a5034' },
  sunBlock: { name: 'Sun Block', color: '#e0c060' },
  weightedSwitch: { name: 'Weighted Switch', color: '#7a7a8a' },
  inversionSwitch: { name: 'Inversion Switch', color: '#a04060' },
  mailbox: { name: 'Mailbox', color: '#c03030' },
  whirlpool: { name: 'Whirlpool', color: '#1a4a8a' },
  updraft: { name: 'Wind Updraft', color: '#bfe6f0' },
  ropeSwing: { name: 'Rope Swing', color: '#7a5a3a' },
  grapplePost: { name: 'Grappling Post', color: '#8a6a3a' },
  hangingVine: { name: 'Hanging Vine', color: '#3a7a3a' },
  plantingSoil: { name: 'Planting Soil', color: '#7a5a3a' },
  grownTree: { name: 'Grown Tree', color: '#2a7a2a' },
  shipDeck: { name: 'Ship Deck', color: '#a07a4a' },
  boardingPoint: { name: 'Boarding Point', color: '#c09a5a' },
  cannonEmplacement: { name: 'Cannon Emplacement', color: '#5a5a5a' },
  submergedTreasure: { name: 'Submerged Treasure', color: '#2a7aa0' },
  sandVortex: { name: 'Sand Vortex', color: '#c0a060' },
  spikedBarrel: { name: 'Spiked Barrel', color: '#8a4a2a' },
  watchtower: { name: 'Watchtower', color: '#8a7a5a' },
  searchlight: { name: 'Searchlight', color: '#e8e0a0' },
  commandStatue: { name: 'Command Statue', color: '#8a8a7a' },
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
