import type { BossDef, EnemyArchetype, WorldId } from '../engine/types';

// Rank-and-file enemies for each world. They share classes with heroes but
// get world-flavoured names, so a "Brawler" in Starfall is a Breacher Drone.

export const ENEMY_ROSTERS: Record<WorldId, EnemyArchetype[]> = {
  emberhold: [
    { name: 'Brigand', classId: 'brawler', weaponId: 'ironAxe' },
    { name: 'Royal Guard', classId: 'knight', weaponId: 'ironLance' },
    { name: 'Lancer', classId: 'cavalier', weaponId: 'ironLance' },
    { name: 'Crossbowman', classId: 'ranger', weaponId: 'ironBow' },
    { name: 'Hedge Mage', classId: 'mage', weaponId: 'fire' },
    { name: 'Wyvern Rider', classId: 'skyrider', weaponId: 'ironLance' },
  ],
  starfall: [
    { name: 'Breacher Drone', classId: 'brawler', weaponId: 'ironAxe' },
    { name: 'Sentry Mech', classId: 'knight', weaponId: 'ironLance' },
    { name: 'Turret Bot', classId: 'gunner', weaponId: 'blaster' },
    { name: 'Hunter Drone', classId: 'skyrider', weaponId: 'ironLance' },
    { name: 'Plasma Caster', classId: 'mage', weaponId: 'thunder' },
    { name: 'Repair Bot', classId: 'cleric', weaponId: 'mend' },
  ],
  pixelvale: [
    { name: 'Shroomling', classId: 'brawler', weaponId: 'ironAxe' },
    { name: 'Shell Trooper', classId: 'knight', weaponId: 'ironLance' },
    { name: 'Spike Bat', classId: 'skyrider', weaponId: 'ironLance' },
    { name: 'Cannon Pod', classId: 'gunner', weaponId: 'blaster' },
    { name: 'Hop Knight', classId: 'blademaster', weaponId: 'ironSword' },
    { name: 'Flame Sprite', classId: 'mage', weaponId: 'fire' },
  ],
  neon: [
    { name: 'Gang Bruiser', classId: 'brawler', weaponId: 'ironAxe' },
    { name: 'Corp Trooper', classId: 'gunner', weaponId: 'blaster' },
    { name: 'Riot Unit', classId: 'knight', weaponId: 'ironLance' },
    { name: 'Razorgirl', classId: 'blademaster', weaponId: 'ironSword' },
    { name: 'Hoverbike', classId: 'cavalier', weaponId: 'ironSword' },
    { name: 'ICE Daemon', classId: 'mage', weaponId: 'thunder' },
  ],
  ronin: [
    { name: 'Ashigaru', classId: 'knight', weaponId: 'ironLance' },
    { name: 'Bandit Ronin', classId: 'blademaster', weaponId: 'ironSword' },
    { name: 'Ninja', classId: 'blademaster', weaponId: 'killingEdge' },
    { name: 'Yumi Archer', classId: 'ranger', weaponId: 'ironBow' },
    { name: 'Tengu', classId: 'skyrider', weaponId: 'ironLance' },
    { name: 'Sumo Brute', classId: 'brawler', weaponId: 'ironAxe' },
  ],
  hollowmere: [
    { name: 'Ghoul', classId: 'brawler', weaponId: 'ironAxe', skill: 'lifesteal' },
    { name: 'Skeleton', classId: 'blademaster', weaponId: 'ironSword' },
    { name: 'Gargoyle', classId: 'skyrider', weaponId: 'ironLance' },
    { name: 'Cultist', classId: 'mage', weaponId: 'fire' },
    { name: 'Bone Archer', classId: 'ranger', weaponId: 'ironBow' },
    { name: 'Headless Knight', classId: 'cavalier', weaponId: 'ironLance' },
  ],
  rift: [
    { name: 'Rift Echo', classId: 'blademaster', weaponId: 'steelSword' },
    { name: 'Shard Golem', classId: 'knight', weaponId: 'steelLance' },
    { name: 'Void Archer', classId: 'ranger', weaponId: 'steelBow' },
    { name: 'Null Caster', classId: 'mage', weaponId: 'thunder' },
    { name: 'Fracture Wing', classId: 'skyrider', weaponId: 'steelLance' },
    { name: 'Rift Brute', classId: 'brawler', weaponId: 'steelAxe' },
  ],
};

// Warlords lead elite fights and act bosses.
export const BOSSES: BossDef[] = [
  {
    id: 'ashenKing', name: 'The Ashen King', title: 'Usurper of Emberhold', world: 'emberhold',
    classId: 'knight', weaponId: 'silverLance', glyph: 'AK', skill: 'bulwark',
    statMods: { hp: 10, str: 3, def: 3, res: 2 },
    quote: 'Kneel, and I may let you keep your head.',
  },
  {
    id: 'overmind', name: 'OVERMIND', title: 'Station Intelligence', world: 'starfall',
    classId: 'gunner', weaponId: 'starbreaker', glyph: 'OM', skill: 'deadeye',
    statMods: { hp: 8, skl: 4, def: 2 },
    quote: 'ORGANIC INTRUSION DETECTED. INITIATING PURGE.',
  },
  {
    id: 'krakatoad', name: 'Lord Krakatoad', title: 'Lava-Castle Tyrant', world: 'pixelvale',
    classId: 'brawler', weaponId: 'silverAxe', glyph: 'KT', skill: 'regen',
    statMods: { hp: 14, str: 3, def: 2 },
    quote: 'CROAK! Every bounce you make, I make it HOTTER!',
  },
  {
    id: 'ceo', name: 'Director Sable', title: 'Megacorp CEO', world: 'neon',
    classId: 'mage', weaponId: 'nosferatu', glyph: 'DS', skill: 'armorBreak',
    statMods: { hp: 10, mag: 4, res: 3 },
    quote: 'Everything has a price. Yours just went down.',
  },
  {
    id: 'shogun', name: 'Shogun Raiden', title: 'Lord of a Hundred Duels', world: 'ronin',
    classId: 'blademaster', weaponId: 'silverSword', glyph: 'SR', skill: 'vantage',
    statMods: { hp: 10, str: 3, skl: 3, spd: 2 },
    quote: 'Draw your blade. Let it be the last thing you do.',
  },
  {
    id: 'countess', name: 'Countess Morwen', title: 'Undying Matriarch', world: 'hollowmere',
    classId: 'mage', weaponId: 'nosferatu', glyph: 'CM', skill: 'lifesteal',
    statMods: { hp: 12, mag: 3, res: 4 },
    quote: 'Such warm blood. It has been centuries.',
  },
];

export const FINAL_BOSS: BossDef = {
  id: 'unmaker', name: 'The Unmaker', title: 'Devourer of Worlds', world: 'rift',
  classId: 'mage', weaponId: 'riftCrown', glyph: '∅', skill: 'lifesteal',
  statMods: { hp: 30, mag: 6, def: 6, res: 6, skl: 4, spd: 2 },
  quote: 'Every world you love is a story. I am the end of all of them.',
};
