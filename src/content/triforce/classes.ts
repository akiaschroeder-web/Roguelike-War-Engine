import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 20, mp: 12,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(22, 7, 4, 8, 8, 6, 5, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const BOSS = g(140, 50, 30, 35, 25, 45, 35, 15);
const CASTER_BOSS = g(110, 25, 65, 45, 35, 30, 55, 15);

// Section 1's classes, the monsters' and the bosses'.
export const CLASSES: ClassDef[] = [
  // ── Named characters ──
  c('cooperativeScout', 'Cooperative Scout', '💙', ['sword', 'bow', 'boomerang', 'hookshot', 'magic'], 'foot', g(60, 40, 30, 60, 65, 25, 30, 45)),
  c('cooperativeWarrior', 'Cooperative Warrior', '❤', ['sword', 'hammer', 'axe', 'bow'], 'foot', g(90, 60, 15, 45, 30, 55, 20, 35)),
  c('royalSupport', 'Royal Support', '👗', ['magic', 'staff'], 'foot', g(45, 5, 55, 40, 40, 15, 60, 60), undefined, ['royal']),
  c('hytopianCommander', 'Royal Commander', '👑', ['hammer', 'sword', 'lance'], 'foot', g(85, 35, 20, 40, 20, 45, 35, 50), undefined, ['royal']),
  c('masterTailor', 'Master Tailor', '🧵', ['dagger', 'magic', 'staff'], 'foot', g(50, 15, 40, 65, 35, 20, 40, 55)),
  c('fashionWitch', 'Fashion Witch', '☂', ['magic', 'staff'], 'foot', CASTER_BOSS, undefined, ['sorcerer']),
  // ── Monsters ──
  c('stackedGuardianClass', 'Stacked Guardian', '🗿', ['natural', 'lance'], 'armor', g(90, 50, 5, 30, 15, 60, 30, 10), s(42, 18, 5, 10, 5, 24, 12, 4, 24, 4), ['construct', 'armored', 'stone']),
  c('chameleonClass', 'Chameleon', '🦎', ['natural'], 'foot', g(60, 45, 20, 50, 60, 20, 30, 25), s(25, 12, 6, 16, 17, 6, 9, 8, 7, 7), ['beast', 'reptile']),
  c('segmentedClass', 'Segmented Body', '🐛', ['natural'], 'foot', g(85, 50, 10, 35, 30, 45, 25, 15), s(38, 18, 4, 12, 9, 16, 7, 5, 18, 5), ['beast', 'insect']),
  c('miniMargoClass', 'Mini-Margo', '⚙', ['natural'], 'foot', g(50, 40, 5, 30, 40, 40, 15, 10), s(18, 10, 0, 8, 10, 10, 4, 3, 6, 5), ['construct', 'armored']),
  // ── Bosses and minibosses ──
  c('armoredSpinner', 'Armored Spinner', '⚙', ['natural'], 'armor', BOSS, undefined, ['construct', 'armored']),
  c('iceDragon', 'Ice Dragon', '🐉', ['natural', 'magic'], 'flying', CASTER_BOSS, undefined, ['dragon', 'beast']),
  c('compositeMonster', 'Composite Monster', '🎀', ['natural', 'magic'], 'foot', BOSS, undefined, ['beast']),
  c('stalSwordmaster', 'Undead Swordmaster', '💀', ['sword', 'natural'], 'foot', g(130, 60, 15, 50, 30, 50, 30, 10), undefined, ['undead']),
  c('magicalConstruct', 'Magical Construct', '🔺', ['natural', 'magic'], 'foot', CASTER_BOSS, undefined, ['construct']),
  c('electricBlobClass', 'Electric Blob', '⚡', ['natural', 'magic'], 'foot', CASTER_BOSS, undefined, ['jelly']),
  c('livingGlacierClass', 'Living Glacier', '🧊', ['natural', 'magic'], 'armor', CASTER_BOSS, undefined, ['construct', 'stone']),
  c('desertSovereignClass', 'Desert Sovereign', '🦅', ['natural', 'magic'], 'flying', g(100, 45, 45, 45, 55, 30, 35, 15), undefined, ['bird', 'beast']),
  c('spectralReaperClass', 'Spectral Reaper', '🪦', ['natural', 'axe', 'magic'], 'foot', g(100, 50, 50, 50, 40, 30, 50, 10), undefined, ['undead', 'ghost']),
  c('camouflageBeast', 'Camouflage Beast', '🦎', ['natural'], 'foot', g(120, 55, 20, 50, 40, 40, 30, 15), undefined, ['beast', 'reptile']),
];
