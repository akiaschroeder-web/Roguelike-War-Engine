import type { ClassDef, Growths, MoveType, Stats, WeaponType } from '../../engine/types';

const s = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number, con: number, mov: number): Stats => ({
  hp, str, mag, skl, spd, def, res, lck, con, mov, sta: 14, mp: 10,
});
const g = (hp: number, str: number, mag: number, skl: number, spd: number, def: number, res: number, lck: number): Growths => ({ hp, str, mag, skl, spd, def, res, lck });
const c = (id: string, name: string, icon: string, weapons: WeaponType[], moveType: MoveType, growths: Growths, base = s(20, 6, 4, 7, 7, 5, 4, 5, 6, 5), tags?: string[]): ClassDef =>
  ({ id, name, icon, weapons, moveType, base, growths, tags });

// Growth presets (my balancing proposal; named units use the doc's stat sheets).
const HERO = g(75, 50, 25, 60, 55, 35, 30, 50);
const BEAST = g(70, 50, 5, 50, 65, 25, 25, 40);
const MAGE = g(55, 10, 65, 50, 45, 15, 55, 45);
const TANK = g(100, 60, 5, 35, 20, 55, 20, 30);
const SUPPORT = g(55, 10, 50, 45, 40, 20, 50, 60);

const WARRIOR = g(75, 50, 10, 55, 45, 35, 25, 35);
const BOSS = g(140, 55, 45, 35, 25, 45, 40, 25);
const SMALL = g(45, 25, 20, 45, 60, 15, 25, 35);
const SPIRIT = g(120, 35, 60, 35, 25, 40, 60, 40);

export const CLASSES: ClassDef[] = [
  // ── Main characters ──
  c('twilightSwordsman', 'Twilight Swordsman', '🗡', ['sword', 'bow', 'hammer', 'boomerang', 'hookshot', 'sling'], 'foot', HERO),
  c('sacredBeastClass', 'Sacred Beast', '🐺', ['natural'], 'foot', BEAST),
  c('royalLightMage', 'Royal Light Mage', '✨', ['sword', 'bow', 'staff', 'magic'], 'foot', g(55, 20, 65, 55, 45, 20, 60, 50)),
  c('executionerKing', 'Executioner King', '⚔', ['sword', 'magic'], 'cavalry', g(95, 65, 40, 55, 35, 45, 35, 20)),
  c('colossalCharger', 'Colossal Charger', '🐗', ['natural'], 'foot', BOSS, undefined, ['demon']),
  // ── Supporting characters ──
  c('shadowSorceress', 'Shadow Sorceress', '🌒', ['magic'], 'foot', g(50, 10, 65, 50, 55, 15, 50, 45)),
  c('twilightPrincessClass', 'Twilight Princess', '👑', ['magic', 'staff'], 'foot', g(65, 15, 70, 50, 45, 20, 60, 40)),
  c('usurperKing', 'Usurper King', '🎭', ['sword', 'magic'], 'foot', g(70, 30, 65, 45, 55, 25, 50, 15)),
  c('ancientSwordmaster', 'Ancient Swordmaster', '⚔', ['sword'], 'foot', g(85, 55, 20, 70, 45, 40, 35, 25)),
  c('animalCaretaker', 'Animal Caretaker', '🐴', ['staff', 'sling'], 'foot', g(55, 15, 25, 35, 40, 15, 30, 60)),
  c('youngSquire', 'Young Squire', '🛡', ['sword', 'sling'], 'foot', g(50, 30, 10, 40, 45, 25, 20, 55)),
  c('tpMerchant', 'Merchant', '🏪', ['sling', 'staff'], 'foot', g(45, 10, 15, 45, 25, 15, 25, 70)),
  c('resistanceSwordsman', 'Resistance Swordsman', '🌲', ['sword', 'bow'], 'foot', WARRIOR),
  c('sumoWrestler', 'Sumo Wrestler', '🤼', ['gauntlet'], 'armor', TANK),
  c('shaman', 'Shaman', '🔥', ['staff', 'magic'], 'foot', SUPPORT),
  c('demolitionist', 'Demolitionist', '💣', ['sling', 'siege'], 'foot', g(65, 30, 10, 55, 30, 25, 20, 40)),
  c('resistanceCoordinator', 'Resistance Coordinator', '🍺', ['dagger', 'staff', 'sword'], 'foot', g(65, 30, 20, 45, 30, 25, 30, 55)),
  c('mountainKnight', 'Mountain Knight', '🏔', ['sword', 'lance'], 'foot', WARRIOR),
  c('veteranArtillerist', 'Veteran Artillerist', '🎯', ['siege', 'bow'], 'foot', g(60, 30, 10, 65, 20, 25, 25, 40)),
  c('ancientScholar', 'Ancient Scholar', '📖', ['magic', 'staff'], 'foot', g(50, 5, 45, 55, 35, 15, 45, 50)),
  c('aquaticPrince', 'Aquatic Prince', '🔱', ['lance', 'magic'], 'foot', g(55, 25, 40, 40, 55, 20, 40, 50)),
  c('royalSpirit', 'Royal Spirit', '💧', ['magic', 'staff'], 'foot', MAGE),
  c('sumoElder', 'Sumo Elder', '🪨', ['gauntlet', 'hammer'], 'armor', TANK),
  c('mountainPatriarch', 'Mountain Patriarch', '⛰', ['gauntlet', 'hammer'], 'armor', TANK),
  c('mountainBrawler', 'Mountain Brawler', '❄', ['gauntlet'], 'foot', g(120, 55, 5, 25, 20, 45, 30, 40)),
  c('mountainCaretaker', 'Mountain Caretaker', '🍵', ['staff', 'magic'], 'foot', SUPPORT),
  c('insectCollector', 'Insect Collector', '🦋', ['staff', 'magic', 'sling'], 'foot', SUPPORT),
  c('cursedTreasureHunter', 'Cursed Treasure Hunter', '💰', ['dagger', 'axe'], 'armor', g(60, 20, 20, 35, 20, 40, 35, 55)),
  c('ancientGuide', 'Ancient Guide', '🐦', ['magic'], 'foot', g(40, 5, 55, 45, 50, 10, 50, 55)),
  c('raiderKing', 'Raider King', '🪓', ['axe', 'lance'], 'cavalry', g(100, 65, 0, 45, 30, 50, 20, 20)),
  c('courier', 'Courier', '✉', ['dagger', 'sling'], 'foot', g(55, 20, 5, 40, 70, 20, 20, 50)),
  c('shadowColossus', 'Shadow Colossus', '🌑', ['magic', 'natural'], 'foot', BOSS, undefined, ['twilight']),
  c('warBeast', 'War Beast', '🐗', ['natural'], 'cavalry', g(110, 60, 0, 35, 45, 45, 20, 25)),
  // ── Light Spirits ──
  c('lightSpiritClass', 'Light Spirit', '☀', ['magic', 'natural', 'staff'], 'foot', SPIRIT),
  c('lightSpiritAerial', 'Light Spirit', '🦅', ['magic', 'natural', 'staff'], 'flying', SPIRIT),
  // ── Monsters ──
  c('raider', 'Raider', '🪓', ['axe', 'sword', 'lance'], 'foot', g(60, 40, 0, 40, 40, 25, 15, 25), s(24, 8, 0, 8, 8, 5, 3, 5, 8, 5)),
  c('raiderArcher', 'Raider Archer', '🏹', ['bow'], 'foot', g(55, 30, 0, 50, 45, 20, 15, 25), s(21, 6, 0, 11, 9, 4, 3, 5, 6, 5)),
  c('ridingBeast', 'Riding Beast', '🐗', ['natural'], 'cavalry', g(90, 50, 0, 30, 45, 35, 15, 25), s(35, 13, 0, 6, 10, 9, 4, 5, 18, 7)),
  c('twilightMonster', 'Twilight Monster', '👁', ['natural'], 'foot', g(80, 50, 30, 40, 45, 35, 35, 15)),
  c('twilightFlyer', 'Twilight Flyer', '🦇', ['natural'], 'flying', g(70, 40, 20, 40, 55, 25, 30, 20)),
  c('twilightRaider', 'Twilight Raider', '👹', ['natural', 'axe'], 'foot', g(65, 45, 20, 40, 45, 25, 30, 15)),
  c('twilightPlant', 'Twilight Plant', '🌿', ['natural'], 'fixed', g(60, 40, 30, 35, 20, 25, 30, 15)),
  c('twilightBat', 'Twilight Bat', '🦇', ['natural'], 'flying', SMALL),
  c('twilightCreatureClass', 'Twilight Creature', '🐀', ['natural'], 'foot', SMALL),
  c('twilightParasite', 'Twilight Parasite', '🪲', ['natural', 'magic'], 'foot', SMALL),
  c('giantShadowInsect', 'Giant Shadow Insect', '🪰', ['natural', 'magic'], 'flying', g(100, 45, 55, 40, 45, 30, 45, 15)),
  c('heavyArmoredBeast', 'Armored Beast', '🦏', ['natural'], 'armor', TANK),
  c('amphibianArtillery', 'Amphibian Artillery', '🐸', ['natural'], 'foot', SMALL),
  c('explosiveInsect', 'Explosive Insect', '💥', ['natural'], 'foot', SMALL),
  c('burrowingParasite', 'Burrowing Parasite', '🪱', ['natural'], 'foot', SMALL),
  c('burrowingWorm', 'Burrowing Worm', '🐛', ['natural'], 'foot', SMALL),
  c('parasiticSwarm', 'Parasitic Swarm', '🕷', ['natural'], 'foot', SMALL),
  c('spectralParasite', 'Spectral Parasite', '🐁', ['natural'], 'foot', SMALL),
  c('undeadHeavyInfantry', 'Undead Heavy Infantry', '☠', ['sword', 'axe'], 'armor', TANK),
  c('iceInfantry', 'Ice Infantry', '🧊', ['lance'], 'foot', WARRIOR),
  c('iceConstruct', 'Ice Construct', '❄', ['natural', 'magic'], 'foot', SMALL),
  c('arcticBeast', 'Arctic Beast', '🐺', ['natural'], 'foot', BEAST),
  c('skeletalFish', 'Skeletal Fish', '🐟', ['natural'], 'foot', SMALL),
  c('flyingReptilianKnight', 'Reptilian Knight', '🦎', ['sword', 'lance'], 'flying', WARRIOR),
  // ── Bosses and minibosses ──
  c('twilitParasiteBoss', 'Twilit Parasite', '🌺', ['natural', 'magic'], 'fixed', BOSS),
  c('twilitIgniter', 'Twilit Igniter', '🔥', ['natural', 'magic'], 'foot', BOSS),
  c('twilitAquaticBeast', 'Twilit Aquatic Beast', '🐍', ['natural'], 'foot', BOSS),
  c('twilitFossil', 'Twilit Fossil', '💀', ['natural', 'magic'], 'foot', BOSS),
  c('twilitIceMass', 'Twilit Ice Mass', '❄', ['natural', 'magic'], 'foot', BOSS),
  c('twilitArachnid', 'Twilit Arachnid', '🕷', ['natural', 'magic'], 'foot', BOSS),
  c('twilitDragon', 'Twilit Dragon', '🐉', ['natural', 'magic'], 'flying', BOSS),
  c('corruptedPrimate', 'Corrupted Primate', '🐒', ['boomerang', 'natural'], 'foot', g(80, 40, 10, 55, 60, 25, 25, 30)),
  c('goronSumoGuardian', 'Goron Sumo Guardian', '🤼', ['gauntlet'], 'armor', TANK),
  c('amphibianBehemoth', 'Amphibian Behemoth', '🐸', ['natural'], 'foot', BOSS),
  c('spectralExecutioner', 'Spectral Executioner', '⚰', ['sword', 'magic'], 'foot', g(100, 55, 35, 50, 35, 35, 45, 15)),
  c('armoredExecutioner', 'Armored Executioner', '⛓', ['hammer', 'axe'], 'armor', TANK),
  c('shadowIllusion', 'Shadow Illusion', '👻', ['magic'], 'foot', MAGE),
  c('twilightPuppet', 'Twilight Puppet', '🎎', ['sword', 'magic'], 'foot', MAGE),
  c('undeadConstruct', 'Undead Construct', '💀', ['natural', 'magic'], 'flying', g(100, 30, 55, 40, 45, 30, 45, 15)),
  c('arachnidParasite', 'Arachnid Parasite', '👁', ['natural'], 'foot', SMALL),
  // ── Extra units ──
  c('poeSister', 'Poe Sister', '🏮', ['magic'], 'flying', g(55, 10, 65, 50, 50, 15, 55, 35), undefined, ['phantom']),
  c('fairySovereign', 'Fairy Sovereign', '🧚', ['staff', 'magic'], 'flying', g(55, 5, 75, 55, 45, 15, 70, 70)),
  c('bubbleSpirit', 'Bubble', '💀', ['natural'], 'flying', g(50, 25, 40, 40, 55, 15, 35, 15)),
];
