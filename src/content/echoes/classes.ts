import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 20, mp: 12,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(20, 6, 4, 8, 8, 5, 5, 5, 4, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; units use the doc's stat sheets).
const MONSTER = g(60, 35, 30, 30, 35, 25, 20, 15);
const AUTOMATON = g(60, 40, 15, 40, 30, 45, 15, 5);
const BOSS = g(140, 50, 35, 35, 25, 45, 35, 15);
const CASTER_BOSS = g(110, 25, 65, 45, 35, 30, 55, 15);

export const CLASSES: ClassDef[] = [
  // ── Named characters (King, Impa and Darston reuse the Royal Commander, Sheikah Guardian and Goron Chief classes) ──
  c('echoSummoner', 'Echo Summoner', '✨', ['magic', 'staff', 'sword'], 'foot', g(55, 25, 60, 50, 45, 25, 55, 55), undefined, ['royal']),
  c('heroOfMight', 'Hero of Might', '⚔', ['sword', 'bow'], 'foot', g(85, 55, 15, 55, 50, 40, 25, 45)),
  c('riftSpirit', 'Rift Spirit', '🔺', ['magic', 'staff'], 'flying', g(40, 0, 65, 50, 50, 15, 65, 50), undefined, ['rift']),
  c('militaryGeneral', 'Military General', '🎖', ['sword', 'lance'], 'foot', g(90, 55, 0, 50, 30, 50, 20, 30)),
  c('royalStrategist', 'Royal Strategist', '📖', ['staff', 'magic', 'sword'], 'foot', g(50, 10, 35, 60, 25, 20, 35, 45)),
  c('ancientResearcher', 'Ancient Researcher', '🔬', ['magic', 'staff'], 'foot', g(55, 10, 45, 55, 20, 20, 45, 35)),
  c('automatonEngineer', 'Automaton Engineer', '🔧', ['hammer', 'staff'], 'foot', g(80, 40, 15, 60, 20, 35, 20, 30)),
  c('gerudoCommander', 'Gerudo Commander', '🔱', ['lance', 'sword', 'magic'], 'foot', g(80, 50, 30, 50, 40, 35, 40, 35)),
  c('gerudoCaptain', 'Gerudo Captain', '🗡', ['lance', 'sword'], 'foot', g(75, 50, 10, 55, 55, 30, 20, 35)),
  c('riverZoraChief', 'River Zora Chief', '🥁', ['instrument', 'magic', 'lance'], 'foot', g(105, 45, 50, 35, 25, 40, 45, 25), undefined, ['aquatic']),
  c('seaZoraChief', 'Sea Zora Chief', '🎼', ['instrument', 'magic', 'staff'], 'foot', g(55, 15, 60, 45, 40, 20, 60, 40), undefined, ['aquatic']),
  c('mountainGiant', 'Mountain Giant', '⛄', ['hammer'], 'foot', g(150, 60, 0, 30, 15, 50, 35, 40)),
  c('travelingCollector', 'Traveling Collector', '📮', ['hammer', 'sword'], 'foot', g(55, 20, 0, 35, 50, 20, 20, 75)),
  c('darkSummoner', 'Dark Summoner', '🟥', ['magic', 'staff', 'sword'], 'foot', g(70, 20, 65, 50, 40, 25, 60, 15), undefined, ['rift', 'echo']),
  // ── Section 3: monsters ──
  c('livingFlameEoW', 'Living Flame', '🕯', ['natural', 'magic'], 'foot', MONSTER, s(18, 6, 14, 7, 8, 4, 10, 5, 4, 5), ['slime', 'fire']),
  c('waterBlob', 'Water Blob', '💧', ['natural', 'magic'], 'foot', MONSTER, s(20, 8, 8, 6, 6, 7, 9, 5, 5, 4), ['slime', 'aquatic']),
  c('rollingShell', 'Rolling Shell', '🦔', ['natural'], 'armor', g(70, 45, 0, 35, 50, 45, 15, 15), s(25, 14, 0, 10, 17, 13, 5, 5, 10, 7), ['beast', 'armored']),
  c('livingCyclone', 'Living Cyclone', '🌪', ['natural', 'magic'], 'flying', g(50, 15, 55, 45, 60, 15, 45, 20), s(20, 3, 19, 14, 21, 4, 15, 6, 3, 8), ['beast']),
  c('tauntingFrog', 'Taunting Frog', '🐸', ['natural', 'magic'], 'foot', MONSTER, s(22, 5, 13, 10, 13, 5, 10, 9, 5, 5), ['beast', 'amphibian']),
  c('rainFrog', 'Rain Frog', '🌧', ['natural', 'magic'], 'foot', g(55, 10, 55, 40, 30, 20, 50, 25), s(24, 4, 23, 12, 10, 5, 20, 10, 5, 5), ['beast', 'amphibian']),
  c('burrower', 'Burrower', '🦫', ['natural'], 'foot', g(65, 45, 0, 40, 45, 25, 15, 15), s(23, 12, 0, 13, 14, 7, 5, 6, 7, 6), ['beast']),
  c('livingPlatform', 'Living Platform', '🟨', ['natural'], 'armor', g(110, 55, 0, 25, 10, 65, 30, 10), s(38, 22, 0, 8, 5, 23, 10, 4, 25, 3), ['construct', 'stone']),
  c('silkSpider', 'Silk Spider', '🕷', ['natural'], 'foot', g(55, 35, 15, 45, 50, 15, 20, 15), s(18, 8, 5, 13, 15, 4, 7, 5, 4, 6), ['insect', 'beast']),
  c('wallCrawler', 'Wall Crawler', '🕸', ['natural'], 'foot', g(65, 45, 0, 45, 55, 20, 15, 15), s(22, 12, 0, 14, 18, 6, 5, 5, 6, 7), ['insect', 'beast']),
  c('stoneBody', 'Stone Body', '🪨', ['natural'], 'armor', g(100, 50, 5, 25, 15, 70, 30, 10), s(35, 17, 3, 7, 5, 24, 10, 4, 19, 4), ['construct', 'stone', 'armored']),
  c('aquaticPredator', 'Aquatic Predator', '🦈', ['natural'], 'foot', g(110, 60, 0, 45, 55, 35, 20, 15), s(42, 24, 0, 16, 20, 12, 7, 6, 17, 8), ['beast', 'aquatic']),
  // ── Section 5: Automatons ──
  c('automatonLeaper', 'Leaping Automaton', '🕹', ['natural'], 'foot', AUTOMATON, undefined, ['automaton', 'construct', 'mechanical']),
  c('automatonGunner', 'Gunner Automaton', '🎯', ['natural'], 'foot', AUTOMATON, undefined, ['automaton', 'construct', 'mechanical']),
  c('automatonMusician', 'Music-Box Automaton', '🎵', ['natural', 'magic'], 'foot', g(55, 15, 50, 45, 30, 25, 40, 10), undefined, ['automaton', 'construct', 'mechanical']),
  c('automatonMaw', 'Biting Automaton', '🪤', ['natural'], 'armor', g(85, 55, 0, 30, 15, 50, 20, 5), undefined, ['automaton', 'construct', 'mechanical']),
  c('automatonSwordsman', 'Swordmaster Automaton', '🤖', ['natural', 'sword'], 'armor', g(100, 60, 0, 50, 25, 55, 20, 5), undefined, ['automaton', 'construct', 'mechanical']),
  c('automatonBird', 'Golden Automaton', '🐦', ['natural'], 'flying', g(45, 25, 0, 50, 70, 15, 20, 80), undefined, ['automaton', 'construct', 'mechanical']),
  // ── Section 4: bosses ──
  c('stoneConstructEoW', 'Stone Construct', '🗿', ['natural', 'magic'], 'armor', g(150, 55, 25, 30, 10, 65, 35, 10), undefined, ['construct', 'stone', 'armored']),
  c('burrowingSandBeast', 'Burrowing Sand Beast', '🦂', ['natural', 'magic'], 'foot', BOSS, undefined, ['beast']),
  c('aquaticGuardian', 'Aquatic Guardian', '🐋', ['natural', 'magic'], 'foot', BOSS, undefined, ['beast', 'aquatic']),
  c('elementalMountainBeast', 'Elemental Mountain Beast', '🐏', ['natural', 'magic'], 'foot', BOSS, undefined, ['beast']),
  c('bubbleGuardian', 'Bubble Guardian', '🎐', ['natural', 'magic'], 'flying', CASTER_BOSS, undefined, ['beast', 'aquatic', 'slime']),
  c('guardianFishDeity', 'Guardian Fish Deity', '🐟', ['natural', 'magic'], 'foot', g(150, 50, 40, 25, 15, 50, 45, 25), undefined, ['beast', 'aquatic', 'divine']),
  c('primordialEntity', 'Primordial Entity', '🕳', ['natural', 'magic'], 'armor', g(160, 50, 70, 40, 20, 50, 60, 5), undefined, ['void', 'rift', 'demon']),
];
