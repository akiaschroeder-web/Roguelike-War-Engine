import type { ClassDef, MoveType, Terrain } from '../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, mov: number) => ({
  hp, str, mag, skl, spd, def, res, mov,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number) => ({
  hp, str, mag, skl, spd, def, res,
});

export const CLASSES: Record<string, ClassDef> = {
  blademaster: {
    id: 'blademaster', name: 'Blademaster', weapons: ['sword'], moveType: 'foot', icon: '⚔',
    base: s(18, 5, 1, 9, 10, 4, 2, 5), growths: g(65, 40, 10, 55, 60, 25, 25),
  },
  knight: {
    id: 'knight', name: 'Knight', weapons: ['lance'], moveType: 'armor', icon: '🛡',
    base: s(24, 7, 0, 4, 2, 10, 1, 4), growths: g(85, 50, 5, 35, 20, 55, 15),
  },
  cavalier: {
    id: 'cavalier', name: 'Cavalier', weapons: ['lance', 'sword'], moveType: 'cavalry', icon: '🐎',
    base: s(20, 6, 0, 6, 7, 6, 3, 7), growths: g(70, 45, 5, 45, 45, 35, 20),
  },
  brawler: {
    id: 'brawler', name: 'Brawler', weapons: ['axe'], moveType: 'foot', icon: '🪓',
    base: s(24, 8, 0, 4, 6, 4, 0, 5), growths: g(85, 60, 0, 35, 40, 25, 10),
  },
  ranger: {
    id: 'ranger', name: 'Ranger', weapons: ['bow'], moveType: 'foot', icon: '🏹',
    base: s(17, 5, 0, 8, 7, 3, 3, 5), growths: g(60, 45, 5, 60, 50, 20, 25),
  },
  mage: {
    id: 'mage', name: 'Mage', weapons: ['magic'], moveType: 'foot', icon: '✦',
    base: s(16, 0, 7, 6, 6, 2, 7, 5), growths: g(55, 5, 60, 45, 45, 15, 45),
  },
  gunner: {
    id: 'gunner', name: 'Gunner', weapons: ['gun'], moveType: 'foot', icon: '⌖',
    base: s(17, 6, 0, 9, 5, 4, 2, 5), growths: g(60, 45, 0, 65, 35, 25, 20),
  },
  cleric: {
    id: 'cleric', name: 'Cleric', weapons: ['staff', 'magic'], moveType: 'foot', icon: '✚',
    base: s(16, 0, 5, 5, 7, 2, 8, 5), growths: g(55, 0, 50, 40, 50, 15, 55),
  },
  skyrider: {
    id: 'skyrider', name: 'Skyrider', weapons: ['lance'], moveType: 'flying', icon: '🜁',
    base: s(17, 5, 2, 7, 9, 4, 6, 7), growths: g(60, 40, 15, 45, 55, 20, 40),
  },
};

export const INF = 99;

export const MOVE_COSTS: Record<MoveType, Record<Terrain, number>> = {
  foot:    { plain: 1, forest: 2, mountain: 3, water: INF, wall: INF, fort: 1 },
  cavalry: { plain: 1, forest: 3, mountain: INF, water: INF, wall: INF, fort: 1 },
  armor:   { plain: 1, forest: 2, mountain: INF, water: INF, wall: INF, fort: 1 },
  flying:  { plain: 1, forest: 1, mountain: 1, water: 1, wall: INF, fort: 1 },
};

export const TERRAIN_BONUS: Record<Terrain, { avoid: number; def: number; heal: number }> = {
  plain:    { avoid: 0, def: 0, heal: 0 },
  forest:   { avoid: 20, def: 1, heal: 0 },
  mountain: { avoid: 30, def: 2, heal: 0 },
  water:    { avoid: 0, def: 0, heal: 0 },
  wall:     { avoid: 0, def: 0, heal: 0 },
  fort:     { avoid: 20, def: 2, heal: 20 },
};
