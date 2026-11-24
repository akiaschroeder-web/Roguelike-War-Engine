import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 14, mp: 10,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({
  hp, str, mag, skl, spd, def, res, lck,
});
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(20, 6, 4, 7, 7, 5, 4, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Majora's Mask classes. Named units use their own stat sheets from the design
// doc; class growths are my balancing proposal.
export const CLASSES: ClassDef[] = [
  c('maskAdventurer', 'Mask Adventurer', '🎭', ['sword', 'bow', 'hookshot', 'boomerang'], 'foot', g(70, 45, 25, 55, 55, 30, 30, 50)),
  c('dekuAdventurer', 'Deku Adventurer', '🌱', ['natural', 'magic'], 'foot', g(55, 25, 45, 50, 60, 20, 35, 45)),
  c('rollingWarrior', 'Rolling Warrior', '⛰', ['natural', 'gauntlet'], 'foot', g(90, 60, 15, 35, 20, 55, 20, 35)),
  c('aquaticWarrior', 'Aquatic Warrior', '≈', ['natural', 'boomerang', 'gauntlet'], 'foot', g(70, 45, 35, 55, 60, 30, 40, 40)),
  c('divineSwordsman', 'Divine Swordsman', '✷', ['sword', 'magic'], 'foot', g(85, 60, 50, 55, 50, 45, 45, 35)),
  c('colossalHero', 'Colossal Hero', '⛰', ['natural', 'sword', 'gauntlet'], 'foot', g(110, 70, 15, 30, 15, 55, 30, 30)),
  c('forestTrickster', 'Forest Trickster', '☾', ['magic', 'dagger', 'instrument'], 'foot', g(55, 20, 55, 55, 65, 20, 45, 45)),
  c('fairyGuide', 'Fairy Guide', '✧', ['magic'], 'flying', g(40, 5, 45, 55, 65, 10, 45, 55)),
  c('spiritGuide', 'Spirit Guide', '✦', ['magic'], 'flying', g(40, 5, 50, 50, 60, 10, 50, 45)),
  c('maskedThief', 'Masked Thief', '🗝', ['dagger', 'sword'], 'foot', g(60, 35, 20, 55, 60, 25, 30, 50)),
  c('innkeeper', 'Innkeeper', '🏠', ['staff', 'hammer'], 'foot', g(60, 25, 35, 40, 40, 25, 40, 60)),
  c('royalSkirmisher', 'Royal Skirmisher', '🌸', ['sling', 'gauntlet', 'magic'], 'foot', g(55, 40, 30, 50, 55, 25, 30, 40)),
  c('forestMonarch', 'Forest Monarch', '♛', ['magic', 'staff', 'lance'], 'foot', g(70, 35, 45, 35, 25, 35, 45, 30)),
  c('goronChampion', 'Goron Champion', '⛰', ['gauntlet', 'hammer', 'instrument'], 'foot', g(95, 60, 15, 35, 25, 55, 20, 40)),
  c('zoraGuitarist', 'Zora Guitar Warrior', '♪', ['boomerang', 'lance', 'gauntlet', 'instrument'], 'foot', g(70, 45, 35, 55, 55, 30, 35, 40)),
  c('zoraSongstress', 'Zora Songstress', '♫', ['magic', 'staff', 'instrument'], 'foot', g(60, 10, 60, 45, 40, 20, 55, 50)),
  c('undeadCaptain', 'Undead Captain', '☠', ['sword', 'lance'], 'foot', g(100, 60, 15, 40, 20, 50, 30, 20)),
  c('fallenKing', 'Fallen King', '♛', ['sword', 'magic'], 'foot', g(85, 55, 35, 50, 35, 45, 40, 25)),
  c('composer', 'Composer', '♬', ['magic', 'instrument'], 'foot', g(55, 10, 60, 45, 35, 20, 60, 35)),
  c('phantomAssassin', 'Phantom Assassin', '🗡', ['dagger', 'sword'], 'foot', g(65, 50, 20, 65, 65, 25, 30, 30)),
  c('balloonCartographer', 'Balloon Cartographer', '🎈', ['sling', 'bow'], 'foot', g(55, 15, 20, 40, 35, 20, 25, 70)),
  c('jungleChampion', 'Jungle Champion', '⚔', ['sword', 'natural'], 'foot', g(100, 60, 30, 50, 40, 45, 30, 25)),
  c('mechanicalCharger', 'Mechanical Charger', '⚙', ['natural', 'magic'], 'cavalry', g(110, 60, 35, 30, 45, 60, 30, 15)),
  c('aquaticBehemoth', 'Aquatic Behemoth', '🐟', ['natural'], 'foot', g(110, 60, 20, 40, 50, 40, 25, 15)),
  c('desertColossus', 'Desert Colossus', '🪱', ['natural', 'magic'], 'foot', g(130, 70, 25, 30, 25, 55, 35, 15)),
  c('flyingColossus', 'Flying Colossus', '🪱', ['natural', 'magic'], 'flying', g(110, 55, 50, 40, 35, 45, 40, 15)),
  c('cursedArtifact', 'Cursed Artifact', '🎭', ['magic', 'natural'], 'flying', g(75, 20, 65, 50, 45, 30, 60, 30)),
  c('chaoticDemon', 'Chaotic Demon', '🌀', ['natural', 'magic'], 'foot', g(80, 40, 50, 60, 75, 25, 45, 35)),
  c('demonicDeity', 'Demonic Deity', '👁', ['natural', 'magic'], 'foot', g(100, 60, 65, 55, 55, 40, 55, 25)),
  c('guardianDeity', 'Guardian Deity', '⛰', ['natural', 'hammer', 'magic'], 'foot', g(140, 70, 55, 30, 10, 60, 55, 35)),
  c('bubbleMonster', 'Bubble Monster', '🫧', ['magic', 'natural'], 'foot', g(90, 30, 40, 30, 15, 35, 40, 15)),
  c('swarmReaper', 'Swarm Reaper', '🦇', ['axe', 'natural', 'magic'], 'flying', g(80, 55, 45, 45, 35, 35, 45, 15)),
  c('amphibianFighter', 'Amphibian Fighter', '🐸', ['natural', 'gauntlet'], 'foot', g(65, 40, 15, 45, 50, 25, 25, 30)),
  c('armoredBeast', 'Armored Beast', '🛡', ['natural'], 'armor', g(75, 40, 5, 25, 20, 55, 20, 25)),
  c('ancientConstruct', 'Ancient Construct', '🗿', ['natural', 'magic'], 'armor', g(80, 50, 30, 30, 25, 55, 35, 10)),
  c('aquaticSerpent', 'Aquatic Serpent', '🐍', ['natural'], 'foot', g(90, 50, 15, 40, 35, 35, 25, 15)),
  c('aquaticPlant', 'Aquatic Plant', '🌿', ['natural'], 'foot', g(55, 35, 15, 30, 25, 20, 20, 25)),
  c('aquaticTransport', 'Aquatic Transport', '🐢', ['natural'], 'foot', g(130, 35, 20, 20, 10, 65, 40, 35)),
  c('guardianBeast', 'Guardian Beast', '🐟', ['natural', 'magic'], 'foot', g(140, 45, 35, 20, 10, 65, 55, 35)),
  c('royalSwordsman', 'Royal Swordsman', '⚔', ['sword', 'dagger'], 'foot', g(70, 50, 10, 55, 50, 30, 25, 20)),
  c('ikanaDefender', 'Royal Defender (Ikana)', '🛡', ['sword', 'lance'], 'armor', g(80, 40, 10, 40, 30, 50, 30, 20)),
  // Generic Deku
  c('dekuInfantry', 'Deku Infantry', '🌱', ['lance', 'sling'], 'foot', g(65, 40, 15, 45, 45, 30, 25, 35), s(20, 6, 2, 7, 8, 5, 3, 6, 5, 5)),
  c('dekuKnight', 'Deku Knight', '🛡', ['lance', 'sword'], 'foot', g(75, 40, 15, 45, 35, 40, 30, 30), s(24, 7, 2, 8, 6, 8, 5, 5, 7, 4)),
  c('dekuScout', 'Deku Scout', '🌼', ['sling', 'dagger'], 'foot', g(50, 30, 20, 45, 65, 15, 25, 45), s(16, 4, 3, 9, 12, 2, 4, 8, 3, 7)),
  c('natureMage', 'Nature Mage', '🍃', ['magic', 'staff'], 'foot', g(50, 10, 60, 45, 40, 15, 50, 45), s(17, 2, 10, 8, 7, 3, 9, 8, 3, 5)),
  c('dekuArtillery', 'Deku Artillery', '💥', ['sling', 'bow'], 'foot', g(55, 35, 25, 55, 45, 20, 25, 30), s(18, 5, 4, 10, 8, 3, 4, 5, 5, 5)),
  c('dekuSkirmisher', 'Mad Scrub', '🌰', ['sling'], 'foot', g(55, 35, 20, 55, 50, 20, 25, 30), s(18, 5, 3, 10, 9, 3, 4, 5, 4, 5)),
];
