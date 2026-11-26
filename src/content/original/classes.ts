import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 14, mp: 10,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(20, 6, 4, 7, 7, 5, 4, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const BEAST = g(70, 40, 10, 45, 55, 25, 20, 30);
const SMALL = g(45, 25, 15, 40, 55, 15, 20, 30);
const BOSS = g(140, 50, 50, 35, 25, 45, 40, 25);

export const CLASSES: ClassDef[] = [
  // ── Main characters ──
  c('adventurer', 'Adventurer', '🗡', ['sword', 'bow', 'boomerang'], 'foot', g(80, 50, 20, 60, 55, 35, 30, 55)),
  c('princessOfWisdom', 'Princess of Wisdom', '🔺', ['magic', 'staff'], 'foot', g(60, 10, 70, 50, 40, 20, 65, 60)),
  c('invisibleSorcerer', 'Invisible Sorcerer', '🐗', ['lance', 'magic'], 'foot', g(120, 55, 60, 40, 35, 40, 45, 15), undefined, ['demon']),
  // ── Supporting characters ──
  c('hermit', 'Hermit', '🧙', ['staff', 'magic'], 'foot', g(55, 10, 55, 55, 20, 20, 55, 50)),
  c('potionMaker', 'Potion Maker', '⚗', ['staff', 'magic'], 'foot', g(55, 10, 50, 50, 25, 15, 55, 60)),
  c('travelingTrader', 'Traveling Trader', '💰', ['sword', 'boomerang', 'bow'], 'foot', g(65, 30, 0, 45, 40, 25, 20, 70)),
  // ── New monsters ──
  c('boomerangFighter', 'Boomerang Fighter', '🪃', ['boomerang', 'natural'], 'foot', g(70, 40, 5, 55, 45, 30, 20, 25), s(24, 9, 0, 13, 10, 6, 4, 5, 7, 5)),
  c('serpent', 'Serpent', '🐍', ['natural'], 'foot', SMALL, s(15, 7, 0, 8, 14, 2, 3, 4, 3, 7)),
  c('dividingSlime', 'Dividing Slime', '🟢', ['natural'], 'foot', g(70, 30, 10, 25, 25, 30, 25, 20), s(20, 6, 2, 5, 5, 5, 4, 4, 5, 4)),
  c('lesserSlime', 'Lesser Slime', '🫧', ['natural'], 'foot', g(40, 20, 5, 30, 45, 15, 20, 25), s(8, 3, 0, 4, 7, 1, 2, 3, 2, 4)),
  c('wingedDemon', 'Winged Demon', '🦇', ['natural', 'magic'], 'flying', g(70, 40, 30, 40, 50, 25, 30, 20), s(28, 10, 7, 10, 13, 6, 8, 5, 6, 7)),
  c('leapingBeast', 'Leaping Beast', '🐰', ['natural'], 'foot', BEAST, s(22, 8, 5, 7, 14, 10, 3, 6, 5, 7)),
  c('graveyardSpirit', 'Graveyard Spirit', '👻', ['natural', 'magic'], 'flying', g(60, 15, 50, 40, 35, 15, 50, 25), s(24, 4, 12, 9, 8, 3, 13, 5, 3, 6)),
  c('segmentedCrawler', 'Segmented Crawler', '🐛', ['natural'], 'foot', g(90, 45, 5, 35, 55, 35, 20, 15), s(38, 13, 0, 9, 15, 10, 5, 4, 15, 8)),
  c('swarmController', 'Swarm Controller', '👁', ['magic', 'natural'], 'flying', g(100, 30, 60, 50, 40, 35, 50, 20), s(55, 12, 19, 15, 14, 12, 17, 5, 18, 7)),
  // ── Bosses ──
  c('unicornDragon', 'Unicorn Dragon', '🦄', ['natural', 'magic'], 'foot', BOSS, undefined, ['dragon']),
  c('fourHeadedPlant', 'Four-Headed Plant', '🌺', ['natural'], 'foot', g(150, 55, 25, 30, 20, 40, 25, 15), undefined, ['plant']),
  c('giantEyeMonster', 'Giant Eye Monster', '🌀', ['natural'], 'foot', g(160, 60, 10, 25, 25, 50, 30, 10)),
  c('fragmentedEye', 'Fragmented Eye', '◉', ['natural'], 'foot', g(55, 30, 10, 35, 60, 20, 20, 20), s(20, 8, 2, 8, 14, 5, 4, 4, 5, 7)),
];
