import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 14, mp: 10,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(20, 6, 4, 7, 7, 5, 4, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Wind Waker classes. Named units use their own stat sheets from the design doc;
// class growths are my balancing proposal.
export const CLASSES: ClassDef[] = [
  c('windAdventurer', 'Wind Adventurer', '🌀', ['sword', 'bow', 'hookshot', 'boomerang', 'hammer'], 'foot', g(70, 45, 25, 55, 55, 30, 30, 50)),
  c('pirateCaptain', 'Pirate Captain', '🏴', ['sword', 'dagger', 'bow', 'hookshot', 'siege'], 'foot', g(65, 40, 20, 55, 60, 25, 30, 55), undefined, ['pirate']),
  c('sacredArcher', 'Sacred Archer', '🏹', ['bow', 'magic', 'staff'], 'foot', g(55, 20, 60, 55, 45, 20, 55, 50)),
  c('dualBladeWarlord', 'Dual-Blade Warlord', '⚔', ['sword', 'magic'], 'foot', g(90, 60, 30, 55, 45, 40, 30, 25)),
  c('fallenMonarch', 'Fallen Monarch', '♛', ['sword', 'magic', 'staff'], 'foot', g(70, 30, 50, 35, 20, 35, 55, 40)),
  c('royalWarship', 'Royal Warship', '⛵', ['siege', 'natural'], 'foot', g(110, 35, 30, 30, 25, 45, 40, 40), undefined, ['vessel']),
  c('seagullScout', 'Seagull Scout', '🕊', ['sling', 'dagger'], 'foot', g(45, 10, 25, 40, 55, 15, 30, 70)),
  c('caretaker', 'Caretaker', '🍲', ['staff'], 'foot', g(55, 5, 40, 30, 20, 20, 45, 70)),
  c('swordmaster', 'Swordmaster', '🗡', ['sword', 'lance'], 'foot', g(80, 55, 10, 65, 45, 35, 25, 30)),
  c('scholar', 'Scholar', '📜', ['magic', 'staff'], 'foot', g(50, 5, 50, 50, 20, 20, 50, 45)),
  c('earthSage', 'Earth Sage', '✨', ['magic', 'staff', 'instrument'], 'foot', g(55, 10, 60, 45, 45, 15, 55, 45)),
  c('windSage', 'Wind Sage', '🍃', ['magic', 'staff', 'instrument'], 'foot', g(50, 10, 60, 40, 40, 15, 55, 50)),
  c('royalAviator', 'Royal Aviator', '🪶', ['lance', 'bow'], 'flying', g(65, 45, 20, 45, 60, 25, 30, 40)),
  c('skyMessenger', 'Sky Messenger', '✉', ['lance', 'bow'], 'flying', g(65, 35, 20, 50, 65, 25, 30, 40)),
  c('skyCommander', 'Sky Commander', '🦅', ['lance', 'bow', 'magic'], 'flying', g(75, 50, 30, 50, 45, 35, 40, 35)),
  c('pirateDeckhand', 'Pirate Deckhand', '⚓', ['dagger', 'sword', 'hookshot'], 'foot', g(55, 35, 5, 50, 60, 20, 20, 45), s(22, 6, 0, 7, 8, 5, 3, 7, 7, 5), ['pirate']),
  c('pirateFirstMate', 'Pirate First Mate', '⚓', ['sword', 'axe', 'gauntlet'], 'foot', g(95, 55, 5, 35, 25, 45, 15, 30), undefined, ['pirate']),
  c('artillerySpecialist', 'Artillery Specialist', '💣', ['siege', 'bow'], 'foot', g(60, 30, 10, 65, 25, 25, 20, 40), undefined, ['pirate']),
  c('travelingMerchant', 'Traveling Merchant', '🎒', ['sling', 'dagger', 'staff'], 'foot', g(55, 15, 15, 40, 40, 20, 25, 70)),
  c('treasureThief', 'Treasure Thief', '💰', ['dagger', 'sword'], 'foot', g(50, 25, 15, 55, 65, 15, 25, 50)),
  c('pictographer', 'Pictographer', '📷', ['magic', 'sling'], 'foot', g(55, 15, 30, 60, 25, 20, 35, 45)),
  c('skyGuardian', 'Sky Guardian', '🐉', ['natural', 'magic'], 'flying', g(140, 60, 50, 30, 20, 50, 45, 30)),
  c('oceanGuardian', 'Ocean Guardian', '🐋', ['natural', 'magic'], 'foot', g(150, 40, 50, 20, 10, 60, 55, 30)),
  c('windController', 'Wind Controller', '🌬', ['magic', 'staff'], 'flying', g(70, 15, 60, 45, 55, 25, 55, 45)),
  c('cycloneSorcerer', 'Cyclone Sorcerer', '🌪', ['magic', 'staff'], 'flying', g(90, 20, 65, 40, 45, 30, 50, 30)),
  c('marineCartographer', 'Marine Cartographer', '🐟', ['natural', 'dagger'], 'foot', g(60, 25, 15, 45, 55, 20, 25, 45)),
  // Generic Rito
  c('flyingScout', 'Flying Scout', '🪶', ['bow', 'dagger'], 'flying', g(50, 25, 10, 45, 65, 15, 25, 40), s(18, 4, 2, 9, 13, 3, 5, 7, 4, 8)),
  c('flyingInfantry', 'Flying Infantry', '🪶', ['lance', 'sword'], 'flying', g(65, 45, 10, 45, 50, 25, 25, 30), s(24, 8, 2, 10, 11, 5, 5, 6, 7, 7)),
  c('flyingArcher', 'Flying Archer', '🏹', ['bow'], 'flying', g(55, 35, 10, 55, 55, 20, 25, 35), s(20, 6, 2, 12, 12, 4, 5, 7, 5, 7)),
  c('flyingDefender', 'Flying Defender', '🛡', ['lance', 'axe'], 'flying', g(80, 45, 10, 35, 35, 45, 30, 25), s(28, 8, 2, 8, 8, 9, 6, 5, 9, 6)),
  c('windMage', 'Wind Mage', '🌬', ['magic', 'staff'], 'flying', g(50, 10, 55, 45, 50, 15, 50, 35), s(19, 2, 11, 9, 10, 3, 10, 7, 4, 7)),
  c('flyingSupport', 'Flying Support', '✉', ['bow', 'staff'], 'flying', g(50, 15, 20, 40, 65, 15, 25, 45), s(19, 3, 3, 8, 14, 3, 5, 8, 4, 9)),
  // Generic Korok
  c('korokForestScout', 'Forest Scout', '🍂', ['sling', 'magic'], 'foot', g(45, 15, 30, 40, 55, 15, 35, 45), s(16, 3, 4, 8, 11, 2, 6, 9, 3, 6)),
  c('terrainSupport', 'Terrain Support', '🌱', ['magic', 'staff'], 'foot', g(50, 10, 45, 35, 35, 25, 45, 40), s(18, 2, 8, 7, 6, 4, 8, 8, 3, 5)),
  c('natureMageWW', 'Nature Mage (Korok)', '🍃', ['magic'], 'foot', g(45, 5, 60, 45, 40, 15, 50, 40), s(17, 2, 12, 9, 8, 3, 10, 8, 3, 5)),
  c('forestHealer', 'Forest Healer', '💚', ['staff', 'magic'], 'foot', g(50, 5, 55, 40, 35, 15, 55, 45), s(18, 1, 11, 8, 7, 3, 12, 9, 3, 5)),
  // Generic pirates
  c('pirateInfantry', 'Pirate Infantry', '⚓', ['sword', 'dagger', 'hookshot'], 'foot', g(65, 40, 5, 40, 40, 25, 15, 35), s(22, 6, 0, 7, 8, 5, 3, 7, 7, 5), ['pirate']),
  c('pirateDuelist', 'Pirate Duelist', '⚔', ['sword', 'dagger'], 'foot', g(65, 45, 5, 55, 50, 25, 15, 30), s(24, 8, 0, 10, 10, 5, 3, 6, 8, 5), ['pirate']),
  c('pirateScout', 'Pirate Lookout', '🔭', ['bow', 'dagger', 'sling'], 'foot', g(50, 30, 5, 55, 55, 15, 20, 40), s(19, 4, 1, 11, 12, 3, 4, 8, 5, 6), ['pirate']),
  c('pirateArtillery', 'Pirate Cannoneer', '💣', ['siege', 'axe', 'dagger'], 'foot', g(70, 45, 5, 55, 20, 30, 15, 30), s(26, 8, 0, 12, 5, 6, 3, 6, 12, 4), ['pirate']),
  c('pirateSkirmisher', 'Pirate Grappler', '🪝', ['hookshot', 'dagger', 'sword'], 'foot', g(55, 35, 5, 50, 55, 20, 15, 35), s(21, 6, 0, 10, 12, 4, 3, 7, 6, 6), ['pirate']),
  // Monsters
  c('monsterInfantry', 'Monster Infantry', '👹', ['sword', 'lance', 'axe', 'natural'], 'foot', g(60, 40, 5, 35, 35, 25, 15, 25), s(22, 7, 0, 7, 8, 5, 3, 5, 7, 5)),
  c('swarmInfantry', 'Swarm Infantry', '👺', ['lance', 'natural'], 'foot', g(40, 30, 5, 40, 55, 10, 10, 30), s(12, 4, 0, 7, 12, 2, 2, 5, 2, 6)),
  c('predatoryPlant', 'Predatory Plant', '🌿', ['natural'], 'fixed', g(55, 40, 10, 35, 20, 25, 15, 20), s(20, 8, 2, 7, 4, 4, 3, 4, 6, 0)),
  c('flyingPredator', 'Flying Predator', '🦅', ['natural'], 'flying', g(70, 45, 5, 40, 50, 25, 20, 25), s(30, 10, 0, 9, 12, 5, 4, 5, 12, 8)),
  c('armoredInsect', 'Armored Insect', '🪲', ['natural'], 'foot', g(75, 45, 10, 35, 30, 45, 25, 20), s(32, 11, 2, 8, 7, 10, 5, 4, 14, 5)),
  c('flyingInsect', 'Flying Insect', '🦋', ['natural'], 'flying', g(70, 40, 10, 40, 50, 30, 25, 20), s(30, 10, 2, 9, 12, 7, 5, 4, 12, 8)),
  c('parasiticInsect', 'Parasitic Insect', '🕷', ['natural'], 'foot', g(30, 15, 5, 40, 50, 5, 10, 25), s(8, 2, 0, 9, 10, 1, 2, 4, 1, 5)),
  c('volcanicInsect', 'Volcanic Insect', '🐛', ['natural'], 'armor', g(70, 40, 20, 30, 20, 50, 30, 20), s(28, 10, 4, 7, 5, 12, 6, 4, 13, 4)),
  c('marineFlyer', 'Marine Flyer', '🌀', ['natural'], 'flying', g(60, 40, 10, 35, 50, 25, 20, 25), s(25, 8, 2, 8, 12, 5, 4, 5, 10, 8)),
  c('marinePredator', 'Marine Predator', '🦈', ['natural'], 'foot', g(75, 50, 5, 40, 55, 25, 20, 20), s(32, 12, 0, 9, 13, 6, 4, 4, 14, 8)),
  c('oceanMonster', 'Ocean Monster', '🐙', ['natural', 'magic'], 'foot', g(120, 50, 40, 30, 15, 40, 35, 15), s(65, 16, 12, 8, 4, 12, 10, 4, 30, 4)),
  c('armoredSwordsman', 'Armored Swordsman', '🛡', ['sword', 'natural'], 'armor', g(85, 55, 5, 45, 20, 55, 20, 20), s(38, 14, 0, 11, 6, 17, 5, 4, 18, 4)),
  c('eliteKnight', 'Elite Armored Knight', '🛡', ['sword', 'natural'], 'armor', g(95, 60, 10, 55, 30, 55, 25, 25), s(46, 17, 2, 14, 8, 19, 7, 5, 20, 5)),
  c('heavyConstruct', 'Heavy Construct', '🗿', ['natural'], 'armor', g(85, 55, 15, 25, 15, 60, 30, 10), s(40, 15, 4, 6, 5, 18, 8, 2, 20, 4)),
  c('shadowCreature', 'Shadow Creature', '✋', ['natural', 'magic'], 'foot', g(60, 40, 35, 45, 40, 20, 40, 15), s(25, 10, 7, 10, 9, 5, 10, 3, 8, 5)),
  c('explosiveRodent', 'Explosive Rodent', '💣', ['natural'], 'foot', g(40, 30, 5, 35, 65, 10, 10, 20), s(14, 5, 0, 7, 14, 2, 2, 4, 3, 7)),
  c('jellyBlob', 'Jelly Blob', '🟢', ['natural'], 'foot', g(55, 30, 15, 30, 30, 15, 20, 30), s(18, 5, 2, 5, 6, 3, 4, 5, 4, 4)),
  // Bosses
  c('volcanicParasite', 'Volcanic Parasite', '🦂', ['natural', 'magic'], 'armor', g(130, 60, 25, 25, 15, 60, 30, 10)),
  c('giantPlant', 'Giant Predatory Plant', '🌺', ['natural', 'magic'], 'fixed', g(120, 50, 45, 30, 10, 35, 40, 10)),
  c('divineConstruct', 'Divine Construct', '🗿', ['natural', 'magic', 'siege'], 'foot', g(120, 40, 55, 40, 20, 45, 45, 15)),
  c('giantFlyingBeast', 'Giant Flying Beast', '🦅', ['natural'], 'flying', g(130, 65, 15, 40, 45, 45, 25, 15)),
  c('poeMonarch', 'Poe Monarch', '👻', ['natural', 'magic'], 'flying', g(120, 45, 60, 30, 20, 35, 55, 10)),
  c('desertLeviathan', 'Desert Leviathan', '🐍', ['natural', 'lance'], 'foot', g(140, 70, 25, 35, 35, 45, 30, 10)),
  c('demonicPuppet', 'Demonic Puppet', '🎎', ['natural', 'magic'], 'foot', g(130, 65, 40, 35, 35, 45, 40, 10)),
  c('desertPredator', 'Desert Predator', '🐛', ['natural'], 'foot', g(65, 40, 5, 35, 45, 20, 15, 15)),
  // Vessels
  c('raftVessel', 'Raft', '🛶', ['siege', 'natural'], 'foot', g(60, 15, 0, 20, 15, 20, 10, 15), undefined, ['vessel']),
  c('sailVessel', 'Sailing Boat', '⛵', ['siege', 'natural'], 'foot', g(70, 20, 0, 30, 30, 25, 15, 25), undefined, ['vessel']),
  c('merchantVessel', 'Merchant Ship', '🚢', ['siege', 'natural'], 'foot', g(80, 20, 0, 30, 20, 30, 25, 50), undefined, ['vessel']),
  c('gunboatVessel', 'Gunboat', '🚤', ['siege', 'natural'], 'foot', g(90, 45, 0, 45, 25, 45, 20, 15), undefined, ['vessel']),
  c('warshipVessel', 'Warship', '🏴', ['siege', 'natural'], 'foot', g(130, 55, 0, 45, 25, 50, 30, 30), undefined, ['vessel']),
  c('ghostVessel', 'Ghost Ship', '☠', ['siege', 'magic', 'natural'], 'foot', g(110, 35, 45, 40, 35, 35, 55, 20), undefined, ['vessel']),
  c('submersible', 'Submarine', '🛢', ['siege', 'natural'], 'foot', g(110, 45, 0, 35, 15, 55, 35, 15), undefined, ['vessel']),
];
