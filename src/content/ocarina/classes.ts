import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 12, mp: 6,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({
  hp, str, mag, skl, spd, def, res, lck,
});
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, base: Stats, growths: Growths, tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Class growths are a balancing proposal; base stats are used for generic
// units and enemies (named characters use their own stat sheets).
export const CLASSES: ClassDef[] = [
  // ── Named-character classes ──
  c('hero', 'Hero', '⚔', ['sword', 'bow', 'sling', 'hammer', 'hookshot', 'boomerang'], 'foot', s(22, 7, 2, 8, 9, 6, 3, 6, 8, 5), g(75, 50, 15, 50, 50, 35, 25, 45)),
  c('adventurer', 'Adventurer', '🪃', ['sword', 'sling', 'boomerang', 'hookshot'], 'foot', s(19, 5, 3, 8, 11, 4, 4, 10, 5, 5), g(60, 40, 20, 50, 60, 25, 30, 60)),
  c('royalSage', 'Royal Sage', '✦', ['magic', 'staff', 'bow'], 'foot', s(18, 3, 12, 9, 8, 3, 11, 9, 5, 5), g(50, 15, 60, 45, 45, 15, 55, 45)),
  c('shadowWarrior', 'Shadow Warrior', '☾', ['dagger', 'sword'], 'foot', s(20, 6, 4, 12, 13, 4, 6, 7, 6, 6), g(60, 40, 20, 55, 65, 20, 30, 40)),
  c('darkKing', 'Dark King', '♛', ['sword', 'magic', 'gauntlet'], 'foot', s(28, 12, 11, 8, 7, 9, 8, 4, 13, 5), g(90, 60, 50, 35, 30, 45, 35, 15)),
  c('lightSage', 'Light Sage', '☀', ['magic', 'staff'], 'foot', s(19, 3, 13, 8, 4, 5, 13, 8, 7, 4), g(55, 10, 60, 40, 25, 25, 60, 40)),
  c('forestSage', 'Forest Sage', '♣', ['magic', 'staff'], 'foot', s(17, 2, 10, 8, 9, 3, 10, 11, 4, 5), g(50, 10, 55, 45, 55, 15, 50, 55)),
  c('goronChief', 'Goron Chief', '⛰', ['hammer', 'gauntlet', 'magic'], 'foot', s(30, 11, 5, 6, 5, 11, 4, 7, 15, 4), g(95, 60, 15, 35, 20, 50, 15, 35)),
  c('zoraSage', 'Zora Sage', '≈', ['lance', 'magic', 'staff'], 'foot', s(21, 5, 10, 9, 10, 5, 9, 7, 7, 5), g(60, 30, 50, 45, 50, 25, 45, 35)),
  c('sheikahGuardian', 'Sheikah Guardian', '◈', ['sword', 'dagger', 'magic'], 'foot', s(23, 9, 6, 11, 11, 7, 7, 7, 8, 6), g(70, 45, 25, 55, 55, 30, 30, 35)),
  c('gerudoElite', 'Gerudo Elite', '☽', ['sword', 'lance', 'dagger', 'magic'], 'foot', s(24, 10, 5, 11, 11, 6, 6, 9, 9, 6), g(70, 55, 25, 55, 55, 25, 25, 40)),
  c('rancher', 'Rancher', '♪', ['bow', 'staff'], 'foot', s(19, 4, 5, 7, 8, 4, 6, 12, 6, 5), g(55, 25, 30, 40, 45, 20, 35, 60)),
  c('quartermaster', 'Quartermaster', '⚖', ['lance', 'hammer'], 'foot', s(26, 6, 1, 4, 3, 6, 3, 9, 11, 4), g(85, 40, 5, 25, 15, 35, 15, 45)),
  c('cavalier', 'Cavalier', '🐎', ['lance', 'sword'], 'cavalry', s(22, 7, 1, 7, 7, 6, 3, 5, 8, 7), g(70, 45, 5, 40, 40, 35, 15, 30)),
  c('forestScout', 'Forest Scout', '🜁', ['sword', 'sling'], 'foot', s(18, 5, 3, 7, 10, 3, 5, 6, 4, 5), g(55, 35, 20, 45, 55, 20, 30, 35)),
  c('royalDefender', 'Royal Defender', '♜', ['lance', 'magic'], 'armor', s(34, 7, 6, 4, 2, 10, 8, 8, 17, 3), g(100, 40, 30, 25, 10, 50, 40, 35)),
  c('giantBlacksmith', 'Giant Blacksmith', '⚒', ['hammer', 'sword'], 'armor', s(46, 15, 1, 5, 3, 14, 4, 8, 24, 3), g(120, 65, 0, 30, 10, 55, 15, 30)),
  c('weaponsmith', 'Weaponsmith', '⚒', ['hammer', 'sword', 'axe'], 'foot', s(29, 11, 1, 6, 4, 10, 4, 7, 14, 4), g(95, 60, 0, 35, 15, 45, 15, 30)),
  c('gravekeeper', 'Gravekeeper', '⚰', ['hammer'], 'foot', s(24, 7, 4, 6, 4, 7, 8, 10, 9, 4), g(80, 40, 20, 35, 20, 35, 35, 50)),
  c('maskMerchant', 'Mask Merchant', '☺', ['magic'], 'foot', s(20, 3, 8, 10, 8, 3, 10, 15, 6, 5), g(55, 15, 45, 50, 45, 15, 50, 70)),
  c('engineer', 'Engineer', '⚙', ['hammer', 'axe'], 'foot', s(26, 9, 1, 7, 5, 7, 3, 7, 11, 4), g(85, 50, 5, 40, 25, 35, 15, 35)),
  c('guide', 'Guide', '✧', ['magic'], 'flying', s(8, 0, 6, 14, 16, 0, 10, 12, 1, 8), g(30, 0, 40, 60, 70, 5, 50, 60)),
  c('skyGuide', 'Sky Guide', '🦉', ['natural'], 'flying', s(28, 8, 7, 11, 10, 6, 10, 10, 13, 8), g(80, 40, 35, 50, 45, 25, 40, 45)),
  c('forestGuardian', 'Forest Guardian', '🌳', ['magic', 'staff'], 'fixed', s(60, 10, 14, 7, 0, 16, 15, 10, 30, 0), g(120, 30, 50, 30, 0, 50, 50, 40)),
  c('fairyMatriarch', 'Fairy Matriarch', '❀', ['magic', 'staff'], 'flying', s(24, 2, 16, 12, 10, 4, 16, 14, 6, 6), g(60, 5, 65, 50, 45, 15, 65, 60)),
  c('fireWitch', 'Fire Witch', '♨', ['magic'], 'flying', s(19, 2, 14, 10, 8, 3, 11, 5, 4, 6), g(50, 5, 65, 45, 45, 15, 50, 25)),
  c('iceWitch', 'Ice Witch', '❄', ['magic'], 'flying', s(19, 2, 14, 10, 8, 3, 11, 5, 4, 6), g(50, 5, 65, 45, 45, 15, 50, 25)),
  c('elementalSorceress', 'Elemental Sorceress', '☯', ['magic'], 'flying', s(36, 4, 18, 13, 11, 7, 14, 7, 9, 7), g(90, 10, 70, 50, 45, 30, 55, 30)),
  c('phantomKnight', 'Phantom Knight', '♞', ['lance', 'magic'], 'foot', s(27, 9, 10, 10, 10, 7, 9, 3, 9, 7), g(80, 45, 45, 45, 45, 30, 35, 15)),
  c('demonBeast', 'Demon Beast', '♉', ['sword', 'natural'], 'foot', s(58, 19, 9, 9, 6, 15, 11, 3, 28, 5), g(130, 70, 30, 35, 25, 55, 40, 10)),
  c('shadowSwordsman', 'Shadow Swordsman', '◐', ['sword'], 'foot', s(23, 8, 3, 10, 12, 6, 7, 5, 9, 5), g(70, 50, 10, 50, 55, 30, 30, 25)),
  c('ironKnuckle', 'Iron Knuckle', '♖', ['axe'], 'armor', s(32, 13, 2, 8, 4, 14, 6, 3, 17, 4), g(95, 60, 5, 40, 15, 55, 20, 15)),

  // ── Generic classes ──
  c('soldier', 'Soldier', '⟋', ['lance', 'sword'], 'foot', s(20, 6, 0, 6, 6, 5, 2, 4, 7, 5), g(70, 45, 5, 40, 35, 30, 15, 30)),
  c('archer', 'Archer', '🏹', ['bow'], 'foot', s(18, 5, 0, 8, 7, 4, 2, 5, 6, 5), g(60, 40, 5, 55, 45, 20, 20, 35)),
  c('knight', 'Knight', '🛡', ['lance', 'sword'], 'armor', s(24, 8, 0, 5, 3, 10, 2, 3, 12, 4), g(85, 50, 0, 35, 15, 55, 15, 25)),
  c('cavalry', 'Cavalier', '🐎', ['lance', 'sword'], 'cavalry', s(21, 7, 0, 6, 7, 6, 3, 4, 9, 7), g(70, 45, 5, 40, 40, 30, 15, 30)),
  c('scout', 'Scout', '➶', ['sword', 'sling'], 'foot', s(17, 4, 2, 7, 9, 3, 4, 6, 4, 6), g(55, 35, 15, 45, 55, 15, 25, 40)),
  c('skirmisher', 'Skirmisher', '•', ['sling', 'boomerang', 'sword'], 'foot', s(17, 4, 1, 8, 8, 3, 3, 6, 4, 5), g(55, 35, 10, 50, 50, 15, 20, 40)),
  c('brawler', 'Brawler', '✊', ['gauntlet', 'hammer'], 'foot', s(26, 9, 0, 5, 5, 7, 1, 4, 12, 5), g(90, 55, 0, 35, 30, 35, 10, 25)),
  c('charger', 'Charger', '◉', ['gauntlet'], 'foot', s(25, 8, 0, 5, 7, 7, 1, 4, 12, 6), g(85, 50, 0, 35, 40, 35, 10, 25)),
  c('lancer', 'Lancer', '⟋', ['lance'], 'foot', s(20, 6, 1, 7, 7, 5, 4, 5, 7, 5), g(65, 45, 10, 45, 45, 25, 25, 30)),
  c('mage', 'Mage', '✦', ['magic', 'staff'], 'foot', s(17, 0, 7, 6, 6, 2, 7, 5, 5, 5), g(55, 5, 55, 45, 45, 15, 45, 35)),
  c('swordsman', 'Swordsman', '🗡', ['sword'], 'foot', s(19, 6, 1, 8, 9, 4, 3, 5, 6, 5), g(65, 45, 5, 50, 55, 20, 20, 30)),
  c('thief', 'Thief', '◇', ['dagger', 'sword'], 'foot', s(17, 4, 0, 8, 11, 3, 2, 8, 5, 6), g(55, 35, 5, 50, 65, 15, 20, 55)),
  c('assassin', 'Assassin', '✕', ['dagger', 'sword'], 'foot', s(18, 6, 2, 11, 11, 4, 4, 5, 6, 6), g(60, 40, 10, 60, 60, 20, 25, 30)),
  c('merchant', 'Merchant', '¤', ['sling'], 'foot', s(16, 2, 3, 7, 7, 3, 4, 12, 4, 5), g(50, 20, 20, 45, 45, 15, 25, 70)),
  c('undeadSoldier', 'Undead Soldier', '☠', ['sword', 'natural'], 'foot', s(16, 5, 0, 4, 5, 3, 1, 0, 5, 5), g(55, 40, 0, 30, 35, 20, 10, 0), ['undead']),
  c('undeadKnight', 'Undead Knight', '☠', ['sword'], 'foot', s(22, 8, 0, 8, 7, 7, 2, 0, 8, 5), g(75, 50, 0, 45, 40, 35, 15, 0), ['undead']),
  c('warrior', 'Warrior', '⚔', ['sword', 'axe'], 'foot', s(24, 10, 0, 6, 6, 7, 2, 3, 10, 5), g(85, 55, 0, 40, 35, 35, 15, 20)),
  c('heavySoldier', 'Heavy Soldier', '⟋', ['lance', 'hammer'], 'foot', s(28, 10, 0, 4, 3, 8, 0, 2, 14, 4), g(95, 60, 0, 30, 20, 40, 5, 15)),
  c('heavyKnight', 'Heavy Knight', '♖', ['axe'], 'armor', s(30, 12, 0, 7, 3, 13, 4, 2, 16, 4), g(95, 60, 0, 40, 15, 55, 15, 15)),

  // ── Monster classes (enemies) ──
  c('beast', 'Beast', '✶', ['natural'], 'foot', s(18, 6, 0, 6, 9, 3, 1, 3, 6, 6), g(65, 45, 0, 40, 55, 20, 10, 20), ['beast']),
  c('flyer', 'Flyer', '⌃', ['natural'], 'flying', s(13, 4, 0, 7, 11, 1, 2, 3, 3, 7), g(45, 35, 0, 45, 60, 10, 15, 20), ['beast']),
  c('plant', 'Plant', '❦', ['natural'], 'fixed', s(18, 7, 0, 6, 4, 3, 2, 0, 6, 0), g(60, 45, 0, 40, 20, 25, 15, 0), ['plant']),
  c('spitter', 'Spitter', '◌', ['sling', 'natural'], 'foot', s(16, 5, 0, 7, 6, 4, 2, 2, 5, 4), g(55, 40, 0, 45, 35, 25, 15, 15)),
  c('caster', 'Caster', '✺', ['magic'], 'foot', s(18, 0, 8, 6, 6, 3, 7, 3, 5, 5), g(60, 0, 55, 40, 40, 20, 45, 20)),
  c('turret', 'Turret', '◎', ['magic'], 'fixed', s(24, 0, 8, 8, 2, 10, 6, 0, 20, 0), g(70, 0, 50, 45, 10, 50, 30, 0), ['stone']),
  c('dragon', 'Dragon', '🐉', ['natural', 'magic'], 'flying', s(44, 12, 11, 8, 9, 9, 7, 2, 22, 6), g(110, 50, 45, 35, 40, 40, 30, 10), ['beast']),
  c('monsterBoss', 'Monster Lord', '♛', ['natural', 'magic'], 'foot', s(40, 12, 10, 8, 5, 11, 8, 2, 20, 4), g(120, 55, 45, 35, 25, 45, 35, 10), ['beast']),
];
