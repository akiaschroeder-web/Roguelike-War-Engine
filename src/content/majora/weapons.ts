import type { Rarity, WeaponDef, WeaponType } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 150, uncommon: 300, rare: 550, epic: 900, legendary: 1500, mythic: 2500 };

const w = (
  id: string, name: string, type: WeaponType, rarity: Rarity, might: number, hit: number, crit: number,
  weight: number, minRange: number, maxRange: number, extra: Partial<WeaponDef> = {},
): WeaponDef => ({ id, name, type, rarity, might, hit, crit, weight, minRange, maxRange, price: PRICE[rarity], ...extra });

// Numbers come from the Majora's Mask design doc. Where it gave no Hit, Crit or
// Weight (magical weapons), I chose values in line with similar weapons.
export const WEAPONS: WeaponDef[] = [
  // ── Link's swords ──
  w('razorSword', 'Razor Sword', 'sword', 'rare', 9, 90, 10, 4, 1, 1, { uses: 25, brokenInto: 'kokiriSword',
    desc: 'Reverts to a Kokiri Sword when its durability runs out.' }),
  w('gildedSword', 'Gilded Sword', 'sword', 'epic', 12, 95, 15, 5, 1, 1, { uses: 65, wearRate: 0.5,
    desc: 'Forged with Gold Dust. Wears out at half the usual rate.' }),
  w('greatFairySword', "Great Fairy's Sword", 'sword', 'legendary', 18, 85, 15, 11, 1, 1, { uses: 60, twoHanded: true, healOnKill: 0.1,
    desc: 'Two-handed. Restores 10% max HP after defeating an enemy.' }),
  w('doubleHelixSword', 'Double Helix Sword', 'sword', 'mythic', 20, 95, 20, 12, 1, 4, { uses: 0, twoHanded: true, beam: 3, unique: true,
    desc: 'Two-handed. Attacks from 2–4 spaces are magical sword beams (3 MP).' }),

  // ── Termina weapons ──
  w('garoTwinBlades', 'Garo Twin Blades', 'dagger', 'rare', 6, 95, 15, 4, 1, 1, { uses: 40, braveConcealed: true,
    desc: 'Strikes twice when attacking from concealment (Veiled).' }),
  w('garoMasterBlades', "Garo Master's Blades", 'sword', 'legendary', 10, 95, 20, 6, 1, 1, { uses: 50, pierce: 0.25, unique: true,
    desc: 'Ignores 25% of enemy DEF.' }),
  w('keetaGreatsword', "Keeta's Greatsword", 'sword', 'legendary', 15, 80, 5, 15, 1, 2, { uses: 50, twoHanded: true, onKill: 'undeadRally', unique: true,
    desc: 'Defeating an enemy gives nearby undead allies +2 STR for two turns.' }),
  w('ikanaRoyalSword', 'Ikana Royal Sword', 'sword', 'legendary', 13, 90, 10, 8, 1, 1, { uses: 60, curseEater: true, unique: true,
    desc: 'Absorbs darkness: +4 Might against Cursed enemies.' }),
  w('odolwaGreatblade', "Odolwa's Greatblade", 'sword', 'legendary', 19, 75, 10, 17, 1, 2, { uses: 50, twoHanded: true, splash: 'adjacent', minSize: 2, unique: true,
    desc: 'Sweeping: half damage to enemies next to the target. Requires Size 2+.' }),
  w('mikauFinBlades', "Mikau's Fin Blades", 'boomerang', 'legendary', 10, 90, 10, 4, 1, 3, { uses: 60, brave: true, races: ['zora'], anyClass: true, unique: true,
    desc: 'Two projectiles that return to the thrower. Zora only.' }),
  w('gomessScythe', "Gomess's Scythe", 'axe', 'legendary', 15, 85, 20, 12, 1, 2, { uses: 45, onKill: 'batSwarm', unique: true,
    desc: 'Defeating an enemy summons a bat swarm (Veiled for 2 turns).' }),
  w('majoraWhips', "Majora's Whips", 'natural', 'mythic', 16, 90, 10, 6, 1, 4, { uses: 0, splash: 'adjacent', unique: true,
    desc: 'Lashes up to 4 spaces away and strikes enemies around the target.' }),
  w('dekuRoyalScepter', 'Deku Royal Scepter', 'magic', 'epic', 7, 85, 0, 3, 1, 3, { element: 'nature', inflict: { status: 'root', chance: 35, turns: 1 }, splash: 'adjacent', unique: true,
    desc: 'Roots spread between adjacent enemies (may Root).' }),
  w('dekuFlowerLauncher', 'Deku Flower Launcher', 'sling', 'rare', 7, 80, 5, 5, 2, 4, { splash: 'adjacent',
    desc: 'Explosive pods arc over walls: half damage around the target.' }),
  w('gohtLightningHorn', "Goht's Lightning Horn", 'magic', 'legendary', 12, 85, 5, 6, 1, 4, { element: 'lightning', momentum: 6, unique: true,
    desc: 'Lightning. +1 Might per space moved before attacking (up to +6).' }),
  w('eyegoreBeam', "Eyegore's Beam", 'magic', 'epic', 14, 80, 0, 7, 2, 5, { splash: 'line', unique: true,
    desc: 'Pierces every enemy in a straight line behind the target.' }),
  w('majoraTendrils', "Majora's Tendrils", 'magic', 'legendary', 13, 85, 5, 5, 1, 3, { element: 'dark', inflict: { status: 'root', chance: 40, turns: 1 }, unique: true,
    desc: 'Dark magic that restrains (Root) and curses.' }),

  // ── Instruments ──
  w('dekuPipes', 'Deku Pipes', 'instrument', 'rare', 0, 0, 0, 1, 0, 0, { races: ['deku'], songDiscount: 1, desc: 'Deku only. Songs cost 1 less MP and reach 1 space further in forests.' }),
  w('goronDrums', 'Goron Drums', 'instrument', 'rare', 0, 0, 0, 3, 0, 0, { races: ['goron'], songDiscount: 1, desc: 'Goron only. Songs cost 1 less MP; offensive songs can Stun.' }),
  w('zoraGuitar', 'Zora Guitar', 'instrument', 'epic', 0, 0, 0, 2, 0, 0, { races: ['zora'], songDiscount: 2, desc: 'Zora only. Songs cost 2 less MP and reach 2 spaces further in water.' }),

  // ── Natural weapons of transformations, bosses and monsters ──
  w('bubbleBlast', 'Bubble Blast', 'magic', 'common', 5, 90, 0, 0, 1, 2, { unique: true, desc: 'A magical bubble.' }),
  w('dekuPeck', 'Deku Spin', 'natural', 'common', 4, 90, 5, 0, 1, 1, { unique: true }),
  w('goronPunch', 'Goron Punch', 'natural', 'common', 9, 85, 5, 0, 1, 1, { unique: true }),
  w('zoraFins', 'Fin Boomerangs', 'boomerang', 'common', 6, 90, 5, 0, 1, 2, { unique: true, brave: true, anyClass: true, desc: 'Two fins that return.' }),
  w('giantFists', 'Giant Sweep', 'natural', 'common', 14, 80, 5, 0, 1, 2, { unique: true, splash: 'adjacent', desc: 'Sweeps around the target.' }),
  w('odolwaSword', "Odolwa's Blade", 'natural', 'common', 12, 85, 10, 0, 1, 2, { unique: true, splash: 'adjacent' }),
  w('gohtHorns', "Goht's Horns", 'natural', 'common', 11, 80, 5, 0, 1, 1, { unique: true, momentum: 8 }),
  w('gyorgJaws', "Gyorg's Jaws", 'natural', 'common', 13, 80, 5, 0, 1, 1, { unique: true, element: 'water' }),
  w('twinmoldMandibles', 'Twinmold Mandibles', 'natural', 'common', 14, 75, 5, 0, 1, 2, { unique: true, splash: 'adjacent' }),
  w('twinmoldFire', 'Twinmold Fireball', 'magic', 'common', 10, 80, 0, 0, 2, 4, { unique: true, element: 'fire' }),
  w('majoraSpin', 'Cursed Rotation', 'magic', 'common', 9, 85, 5, 0, 1, 1, { unique: true, element: 'dark' }),
  w('majoraKick', 'Frenzied Strike', 'natural', 'common', 10, 90, 15, 0, 1, 1, { unique: true }),
  w('wartBubbles', 'Bubble Volley', 'magic', 'common', 7, 85, 0, 0, 1, 3, { unique: true, element: 'water' }),
  w('gekkoFists', 'Gekko Punches', 'natural', 'common', 6, 90, 10, 0, 1, 1, { unique: true, brave: true }),
  w('snapperShell', 'Shell Spin', 'natural', 'common', 8, 80, 0, 0, 1, 1, { unique: true, splash: 'around' }),
  w('armosDive', 'Explosive Dive', 'natural', 'common', 10, 75, 0, 0, 1, 1, { unique: true, splash: 'adjacent' }),
  w('pythonBite', 'Constricting Bite', 'natural', 'common', 10, 80, 5, 0, 1, 1, { unique: true, inflict: { status: 'root', chance: 40, turns: 1 } }),
  w('hiploopCharge', 'Hiploop Charge', 'natural', 'common', 7, 80, 0, 0, 1, 1, { unique: true, momentum: 3 }),
  w('babaSnap', 'Bio Snap', 'natural', 'common', 7, 85, 5, 0, 1, 1, { unique: true, element: 'nature' }),
  w('turtleBite', 'Shell Slam', 'natural', 'common', 9, 75, 0, 0, 1, 1, { unique: true }),
  w('giantStompWeapon', 'Giant Stomp', 'natural', 'common', 16, 80, 5, 0, 1, 2, { unique: true, splash: 'adjacent' }),
  w('servantBlade', "Servant's Blade", 'sword', 'rare', 8, 90, 10, 6, 1, 1, { unique: true }),
  w('servantSpear', "Servant's Spear", 'lance', 'rare', 8, 85, 5, 7, 1, 1, { unique: true }),
  w('dekuSpear', 'Deku Spear', 'lance', 'common', 5, 85, 0, 3, 1, 1, { desc: 'A light spear carried by Deku soldiers.' }),
  w('madScrubSeeds', 'Seed Barrage', 'sling', 'common', 4, 85, 0, 1, 2, 3, { unique: true }),
  w('skullKidMagic', 'Mischief Magic', 'magic', 'rare', 7, 85, 5, 1, 1, 2, { unique: true, element: 'dark', desc: 'A blast of stolen mask magic.' }),
  w('fairyGlow', 'Fairy Glow', 'magic', 'common', 3, 95, 0, 0, 1, 2, { unique: true, element: 'light' }),
  w('composerBaton', "Composer's Baton", 'magic', 'rare', 6, 85, 0, 1, 1, 2, { unique: true, element: 'dark' }),
  w('tingleMap', 'Map Toss', 'sling', 'common', 3, 90, 10, 1, 1, 2, { unique: true }),
  w('anjuPan', 'Frying Pan', 'hammer', 'common', 4, 85, 5, 3, 1, 1, { unique: true, anyClass: true }),
];
