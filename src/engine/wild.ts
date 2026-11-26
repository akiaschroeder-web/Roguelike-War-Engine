// Era of the Wild battle rules: weapon fusion and durability modifiers, Gloom and
// Malice, elemental reactions, Flurry Rush / Perfect Guard / Bullet Time / charged
// attacks, Champion and Sage abilities, Divine Beasts, monster tiers, Zonai Devices
// and the shared Energy Cell, vehicles, the pack's battlefield spaces and the cast's
// skills. Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts,
// abilities.ts and units.ts (like skyward.ts).

import { ABILITIES, CLASSES, ENEMIES, GEAR, ITEMS, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import { DEVICE_ENERGY, FREE_FUSE, MATERIAL_BY_ID, MATERIAL_DROPS, SPOILS, TIERED, VEHICLE_BY_ID, WILD_CLIMATE, WILD_DEPTHS, WILD_SKY, ZONAI_DEVICES } from '../content/wild';
import { BOSS_AS_TEMPLATE } from '../content/wild/enemies';
import { SKY_REGIONS } from '../content/skyward';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF, isMagical, WATERY } from './rules';
import { addStatus, hasStatus, STATUS_INFO } from './status';
import { restoreForm, roomFor, transformInto } from './transform';
import { canSwim, effectiveStats, hasEffect, isMounted, makeEnemy, makeHero, moveTypeOf, prepareForBattle, unitTags, usesLeft } from './units';
import { disarm, pullToward, pushAway } from './windwaker';
import { activeGroups } from './supports';
import { hasTrait, traitCount, wildTraits } from './wildGear';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Era of the Wild battle state. */
    wild?: WildState;
  }
  interface Unit {
    /** Max HP lost to Gloom (until cured by sunlight, Lightroots, Sundelion meals or the Light Dragon). */
    gloom?: number;
    /** Monster tier: 0 Red · 1 Blue · 2 Black · 3 Silver · 4 Gold. */
    wildTier?: number;
    /** Fused material or device, by weapon or shield id. */
    fused?: Record<string, string>;
    /** Durability modifier by weapon id. */
    wmod?: Record<string, 'decayed' | 'pristine'>;
    /** Great Fairy armor enhancement, by gear id. */
    armorStars?: Record<string, number>;
    /** Mineru's Construct: Left Arm, Right Arm, Back Device and Power Core. */
    constructSlots?: { leftArm?: string; rightArm?: string; back?: string; core?: string };
    /** Became a dragon for good (only a sacred event reverses it). */
    permanentForm?: boolean;
    // Battle-only
    arrowFuse?: { id: string; shots: number; element?: Element };
    tempFuse?: { might: number; element?: Element; strikes: number };
    wildCharges?: Record<string, number>;
    wildDisabled?: boolean;
    wildCorrupt?: boolean;
    wildSeg?: number;
    msEnergy?: number;
    wildGiant?: boolean;
  }
}

export interface WildState {
  energy: number;
  energyMax: number;
  timers: { k: number; turns: number; revert: Terrain }[];
  /** Materials picked up (to the quest inventory afterwards). */
  materials: string[];
  /** Riju's lightning fields. */
  fields: { x: number; y: number; r: number; turns: number; team: string }[];
  /** Where each unit started its turn (Recall). */
  prevPos: Record<string, Pos>;
  turnHp: Record<string, number>;
  alliesHurt: number;
  locks: Record<string, string>;
  /** Per-turn devices and vehicles drawing energy (unit uid -> cost). */
  upkeep: Record<string, number>;
  /** Weapons won pristine from pedestals. */
  pristine: string[];
  bloodMoon?: boolean;
  noDrain?: number;
  layer: 'surface' | 'sky' | 'depths';
  /** One-time spaces used (tile keys). */
  used: number[];
  lastWeapon: Record<string, string>;
  hits: Record<string, number>;
  bombs: { x: number; y: number; turns: number; team: string; power: number }[];
  cones: number[];
  gloomRes: number;
}

// ───────────────────────── Helpers ─────────────────────────

const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.templateId ?? u.bossId ?? '';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const tilesOf = (b: Battle, u: Unit) => footprint(u.x, u.y, u.size).map((p) => b.tiles[keyOf(b, p.x, p.y)]);
const isWildWorld = (b: Battle) => worldDef(b.world).campaign === 'wild';
const mechanical = (u: Unit) => unitTags(u).includes('mechanical') || ['guardian', 'zonaiConstruct', 'zonaiVehicle', 'divineBeast', 'ancientRobot'].includes(u.race);
const corruptedFoe = (u: Unit) => !!u.wildCorrupt || hasStatus(u, 'malice') || unitTags(u).some((t) => t === 'malice' || t === 'gloom' || t === 'demon');
const airborne = (u: Unit) => moveTypeOf(u) === 'flying' || hasBuff(u, 'aerial') || hasBuff(u, 'glide');
const isTransport = (u: Unit) => has(u, 'divineBeastSystems') || (u.race === 'zonaiVehicle' && (VEHICLE_BY_ID[tid(u)]?.crew ?? 0) > 0);
const capacity = (u: Unit) => (has(u, 'divineBeastSystems') ? 8 : VEHICLE_BY_ID[tid(u)]?.crew ?? 0);
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a.team === u.team && a !== u);
const free = (b: Battle, u: Unit, x: number, y: number) =>
  inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u; });
export const wildState = (b: Battle): WildState => (b.wild ??= {
  energy: 30, energyMax: 30, timers: [], materials: [], fields: [], prevPos: {}, turnHp: {}, alliesHurt: 0, locks: {}, upkeep: {}, pristine: [],
  layer: 'surface', used: [], lastWeapon: {}, hits: {}, bombs: [], cones: [], gloomRes: 0,
});

function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}, barrier = false) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats, ...(barrier ? { barrier } : {}) });
}

function nearFree(b: Battle, who: Unit, by: Pos & { size: number }, r = 1): Pos | null {
  for (let d = 1; d <= r; d++) for (const p of tilesInRange(b, by, d, d, by.size)) if (free(b, who, p.x, p.y)) return p;
  return null;
}

function setTimed(b: Battle, k: number, t: Terrain, turns: number) {
  const was = b.tiles[k];
  if (was === t) return;
  b.tiles[k] = t;
  const st = wildState(b);
  const cur = st.timers.find((x) => x.k === k);
  if (cur) cur.turns = Math.max(cur.turns, turns);
  else st.timers.push({ k, turns, revert: was });
}

function drop(b: Battle, mats: string[]) { wildState(b).materials.push(...mats); }

/** Gloom: max HP lost until cured. Never kills; never takes more than 60% of max HP. */
export function addGloom(b: Battle | undefined, u: Unit, n: number, by?: Unit): number {
  if (n <= 0 || u.hp <= 0) return 0;
  const tr = wildTraits(u);
  if (tr.includes('gloomImmune') || hasBuff(u, 'lightBarrier')) return 0;
  let mult = 1;
  if (tr.includes('gloomRes2')) mult *= 0.4; else if (tr.includes('gloomRes')) mult *= 0.7;
  if (hasBuff(u, 'wt:gloomWard')) mult *= 0.4;
  if (b?.wild && u.team === 'player') mult *= 1 - Math.min(0.5, b.wild.gloomRes * 0.1);
  if (by && b?.bonus === 'demonKingsGloom' && by.team === 'player') mult *= 2;
  const original = u.stats.hp + (u.gloom ?? 0);
  const amt = Math.max(0, Math.min(Math.ceil(n * mult), u.stats.hp - Math.ceil(original * 0.4)));
  if (!amt) return 0;
  u.gloom = (u.gloom ?? 0) + amt;
  u.stats.hp -= amt;
  u.hp = Math.max(1, Math.min(u.hp, u.stats.hp));
  return amt;
}

/** Restore max HP lost to Gloom (and the HP with it). */
export function cureGloom(u: Unit, n = Infinity): number {
  const amt = Math.min(u.gloom ?? 0, n);
  if (amt <= 0) return 0;
  u.gloom = (u.gloom ?? 0) - amt;
  if (!u.gloom) delete u.gloom;
  u.stats.hp += amt;
  u.hp = Math.min(u.stats.hp, u.hp + amt);
  return amt;
}

// ───────────────────────── Energy ─────────────────────────

/** Energy multiplier for this unit's devices and vehicles. */
export function energyMult(b: Battle, u: Unit): number {
  let m = 1;
  const team = b.units.filter((a) => a.team === u.team);
  if (team.some((a) => has(a, 'spiritSagesVow'))) m *= 0.75;
  if (team.some((a) => has(a, 'stolenTechnology') && unitDist(a, u) <= 3) || has(u, 'stolenTechnology')) m *= 0.75;
  if (u.team === 'player' && b.bonus === 'zonaiEngineering') m *= 0.7;
  m *= Math.max(0.5, 1 - 0.1 * traitCount(u, 'deviceThrift'));
  if (hasTrait(u, 'secret:spirit')) m *= 0.75;
  return m;
}

/** Pay energy from the shared cell; false if there isn't enough. */
export function spendEnergy(b: Battle, u: Unit, cost: number): boolean {
  const st = wildState(b);
  if ((st.noDrain ?? 0) > 0 || cost <= 0) return true;
  const flat = u.weapons.some((w) => WEAPONS[w]?.wild?.includes('energyEfficient')) ? 1 : 0;
  const c = Math.max(0, Math.ceil(cost * energyMult(b, u)) - flat);
  if (st.energy < c) return false;
  st.energy -= c;
  return true;
}

// ───────────────────────── Movement ─────────────────────────

export function wildTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  const flying = moveTypeOf(u) === 'flying';
  const tr = wildTraits(u);
  // The sky: open sky is crossed only by flyers (even swimmers fall).
  if (t === 'water' && !flying && WILD_SKY.includes(b.world)) return INF;
  switch (t) {
    case 'climbableCliff': if (tr.includes('climbMaster')) c = 1; else if (tr.includes('climb')) c = Math.max(1, c - 1); break;
    case 'wetCliff': if (tr.includes('slipImmune') || tr.includes('climbMaster')) c = 1; else if (tr.includes('climb') || tr.includes('slipRes')) c = Math.max(1, c - 1); break;
    case 'mountain': if (tr.includes('climbMaster') || hasBuff(u, 'cycleZero')) c = Math.min(c, 2); if (has(u, 'volcanicAssault')) c = Math.min(c, 2); break;
    case 'sludge': if (hasBuff(u, 'bigWheel') || u.skills.includes('sludgeForm')) c = 1; break;
    case 'wall': if (has(u, 'ceilingCrawl')) c = 2; break;
    case 'lava': if (has(u, 'volcanicAssault')) c = 1; break;
    case 'forest': if (has(u, 'heavyPaws') || has(u, 'forestBound')) c = 1; break;
    case 'water': if (tid(u) === 'vahRuta' || (u.race === 'zonaiVehicle' && VEHICLE_BY_ID[tid(u)]?.swims)) c = 1; break;
    case 'chasm': if (hasBuff(u, 'glide') || flying) c = 1; break;
  }
  if (WATERY.includes(t) && tr.includes('swim') && !SKY_REGIONS.includes(b.world)) c = Math.min(c, 1);
  if ((t === 'climbableCliff' || t === 'mountain') && has(u, 'ceilingCrawl')) c = 1;
  if (c < INF && hasBuff(u, 'bigWheel') && (t === 'mountain' || t === 'climbableCliff')) c = Math.min(c, 2);
  if (c < INF && hasBuff(u, 'zonaiSled') && t === 'frozenWater') c = 1;
  return c;
}

// ───────────────────────── Battlefield setup ─────────────────────────

const FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  greatPlateau: { dryGrass: 4, tallTree: 2, oreDeposit: 1, cookingPot: 1, shrineEntrance: 1, korokPuzzle: 1, sheikahTower: 1, climbableCliff: 2, explosiveBarrel: 1 },
  centralHyrule: { dryGrass: 4, monsterCamp: 1, monsterLookout: 1, explosiveBarrel: 2, oreDeposit: 1, stable: 1, shrineEntrance: 1, sheikahTower: 1, fallenLog: 1 },
  hyruleCastleWild: { explosiveBarrel: 2, gloom: 3, monsterLookout: 1, climbableCliff: 2, luminousOre: 1 },
  hateno: { dryGrass: 3, cookingPot: 1, stable: 1, korokPuzzle: 1, tallTree: 2, oreDeposit: 1, shrineEntrance: 1 },
  kakarikoWild: { tallTree: 2, cookingPot: 1, korokPuzzle: 1, shrineEntrance: 1, climbableCliff: 2 },
  akkala: { dryGrass: 3, monsterCamp: 1, explosiveBarrel: 2, oreDeposit: 2, climbableCliff: 2, sheikahTower: 1 },
  lanayruWild: { sludge: 4, wetCliff: 3, shrineEntrance: 1, luminousOre: 2, korokPuzzle: 1 },
  eldinWild: { oreDeposit: 3, rareOre: 1, explosiveBarrel: 2, climbableCliff: 2, cookingPot: 1, monsterCamp: 1 },
  hebra: { tallTree: 2, climbableCliff: 3, oreDeposit: 1, shrineEntrance: 1, korokPuzzle: 1 },
  gerudoWild: { oreDeposit: 1, rareOre: 1, monsterCamp: 1, climbableCliff: 2, shrineEntrance: 1 },
  faronWild: { tallTree: 3, wetCliff: 2, dryGrass: 2, korokPuzzle: 1, fallenLog: 2, shrineEntrance: 1 },
  necluda: { dryGrass: 4, monsterCamp: 2, stable: 1, tallTree: 2, korokPuzzle: 1, cookingPot: 1 },
  greatHyruleForest: { tallTree: 4, korokPuzzle: 3, fallenLog: 2, gloom: 2, dryGrass: 2 },
  greatSkyIsland: { floatingIsland: 2, deviceDispenser: 2, zonaiTerminal: 1, launchPlatform: 2, lowGravity: 2, fallingRuin: 1, crystalPedestal: 1, skyviewTower: 1, floatingPlatform: 1 },
  skyArchipelago: { floatingIsland: 3, waterSphere: 2, lowGravity: 3, launchPlatform: 2, fallingRuin: 2, deviceDispenser: 1, floatingPlatform: 2 },
  depthsMines: { gloom: 4, gloomPool: 1, lightroot: 1, darkness: 10, zonaiteDeposit: 3, abandonedMine: 1, poeSpirit: 3, bargainerStatue: 1, yigaHideout: 1, ascendPillar: 1, pristinePedestal: 1, deviceDispenser: 1 },
  spiritTemple: { gloom: 3, darkness: 8, zonaiteDeposit: 2, zonaiTerminal: 2, poeSpirit: 2, lightroot: 1, deviceDispenser: 1 },
  gloomsOrigin: { gloom: 7, gloomPool: 3, darkness: 10, poeSpirit: 2, lightroot: 1, pristinePedestal: 1 },
  finalTrial: { shrineEntrance: 2, crystalPedestal: 1, explosiveBarrel: 1, climbableCliff: 2 },
};
const OBSTACLES = new Set<Terrain>(['oreDeposit', 'rareOre', 'luminousOre', 'cookingPot', 'explosiveBarrel', 'fallingRuin', 'deviceDispenser', 'zonaiTerminal', 'lightroot', 'bargainerStatue', 'zonaiteDeposit']);
const TIER_NAMES = ['', 'Blue', 'Black', 'Silver', 'Gold'];
export const TIER_MULT = [1, 1.2, 1.4, 1.7, 2];
const TIER_STATS = ['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res'] as const;

/** Scale a monster to a tier (multipliers apply to HP STR MAG SKL SPD DEF RES only). */
export function applyTier(u: Unit, tier: number) {
  const from = TIER_MULT[u.wildTier ?? 0], to = TIER_MULT[tier];
  if (tier <= (u.wildTier ?? 0)) return;
  for (const k of TIER_STATS) u.stats[k] = Math.round((u.stats[k] / from) * to);
  u.hp = Math.min(u.stats.hp, Math.round((u.hp / from) * to));
  const base = u.name.replace(/^(Blue|Black|Silver|Gold) /, '');
  u.name = tier ? `${TIER_NAMES[tier]} ${base}` : base;
  u.wildTier = tier;
}

/** The tier a monster spawns at, by enemy level (Gold only under the Blood Moon or very deep). */
export function tierFor(level: number, rng: RNG, bloodMoon = false): number {
  const roll = rng.int(0, 99) + (bloodMoon ? 25 : 0);
  if ((bloodMoon || level >= 24) && level >= 16 && roll >= 105) return 4;
  if (level >= 12 && roll >= 85) return 3;
  if (level >= 8 && roll >= 65) return 2;
  if (level >= 3 && roll >= 40) return 1;
  return 0;
}

const MONSTER_HORN: Record<string, string> = { bokoblin: 'bokoblinHorn', moblin: 'moblinHorn', lizalfos: 'lizalfosHorn', horriblin: 'horriblinHorn', bossBokoblin: 'bossBokoblinHorn', stalkoblin: 'bokoblinHorn', stalmoblin: 'moblinHorn', stalizalfos: 'lizalfosHorn' };

export function decorateWild(b: Battle, rng: RNG) {
  if (!isWildWorld(b)) return;
  const st = wildState(b);
  st.layer = worldDef(b.world).layer ?? 'surface';
  const feats = FEATURES[b.world] ?? {};
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const pool = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) ? i : -1)).filter((i) => i >= 0));
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    for (let j = 0, tries = 0; j < n && pool.length && tries < 60; j++, tries++) {
      const k = pool.pop()!;
      const x = k % b.width;
      if (OBSTACLES.has(t) && (x < 3 || x > b.width - 3)) { j--; continue; }
      b.tiles[k] = t;
    }
  }
  // Forests in the grassland catch fire easily: some become dry grass.
  if (st.layer === 'surface') for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i] === 'forest' && !occupied.has(i) && rng.chance(15)) b.tiles[i] = 'tallTree';
  // The Depths are dark.
  if (st.layer === 'depths') b.fog = true;
  for (const u of b.units) {
    if (u.team !== 'enemy') continue;
    const id = u.artId ?? u.templateId ?? '';
    // Monster tiers scale with run depth.
    if (TIERED.has(id) && !u.isBoss) applyTier(u, tierFor(b.enemyLevel, rng, st.bloodMoon));
    // Machines in the wild are corrupted by Malice (a status, not another unit).
    if (mechanical(u) && ['guardian', 'divineBeast', 'zonaiConstruct'].includes(u.race)) u.wildCorrupt = true;
    // Monsters fight with decayed weapons with horns fused on (the Upheaval).
    const horn = MONSTER_HORN[id];
    if (horn) for (const w of u.weapons) if (WEAPONS[w]?.type !== 'natural' && rng.chance(60)) { (u.fused ??= {})[w] = horn; if (st.layer === 'surface') (u.wmod ??= {})[w] = 'decayed'; }
    // Ambushers hide.
    if (has(u, 'dormantThreat') || has(u, 'treeDisguise') || has(u, 'seismicHunter') || has(u, 'yigaDisguise')) u.hidden = true;
    if (st.layer === 'depths' && tilesOf(b, u).includes('darkness')) u.hidden = true;
  }
  // Rare creatures turn up near collectors.
  if (b.units.some((u) => u.team === 'player' && has(u, 'satoriObsession')) && rng.chance(50)) spawnNear(b, rng.pick(['bubbulfrog', 'blupee']), rng);
}

function spawnNear(b: Battle, id: string, rng: RNG) {
  const a = ENEMIES[id];
  if (!a) return;
  const e = makeEnemy(a, b.world, Math.max(1, b.enemyLevel), `e${b.uidCounter++}`, rng);
  const spots = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && i % b.width >= Math.floor(b.width / 2) ? i : -1)).filter((i) => i >= 0));
  for (const k of spots) if (free(b, e, k % b.width, Math.floor(k / b.width))) { e.x = k % b.width; e.y = Math.floor(k / b.width); b.units.push(e); return; }
}

/** Battle start: charges, armor segments, group supports, bubbles, the Master Sword's energy. */
export function wildBattleStart(b: Battle, _rng: RNG) {
  const st = wildState(b);
  const groups = b.groupSupports ?? activeGroups(b, 'player');
  for (const u of b.units) {
    const extra = (hasTrait(u, 'championCharge') ? 1 : 0) + (u.team === 'player' && groups.includes('championsOfHyrule') && ['mipha', 'daruk', 'revali', 'urbosa'].includes(tid(u)) ? 1 : 0);
    const c: Record<string, number> = {};
    if (has(u, 'miphasGrace')) c.miphasGrace = 1; // the group makes it heal more instead
    if (has(u, 'daruksProtection')) c.daruksProtection = 3 + extra;
    if (has(u, 'revalisGale') || u.abilities.includes('revalisGale')) c.revalisGale = 3 + extra;
    if (has(u, 'urbosasFury')) c.urbosasFury = 3 + extra;
    if (has(u, 'aerialCarrier')) c.aerialCarrier = 1;
    u.wildCharges = c;
    if (has(u, 'divineBeastSystems')) u.wildSeg = 4;
    if (has(u, 'protectiveBubbles') && !hasBuff(u, 'bubble')) u.buffs.push({ id: 'bubble', name: 'Bubble', turns: 99 });
    if (has(u, 'fusionSpecialist')) u.tempFuse = { might: 2, strikes: 99 };
    if (u.weapons.includes('masterSword')) u.msEnergy = groups.includes('firstAndTheLast') && u.team === 'player' ? 25 : 18;
    if (has(u, 'yigaDisguise') && u.team === 'player') addStatus(u, 'veiled', 1);
    st.turnHp[u.uid] = u.hp;
    st.prevPos[u.uid] = { x: u.x, y: u.y };
    // Hylian set: more max HP as temporary hearts.
    if (hasTrait(u, 'tempHp')) u.hp = u.stats.hp + 8;
  }
  // Commander bonuses that act at the start of battle.
  for (const u of b.units.filter((x) => x.team === 'player' && !x.npc)) {
    if (b.bonus === 'ritoGale' && moveTypeOf(u) === 'flying') buff(u, 'ritoGale', 'Gale of the Rito', 99, { mov: 2 });
    if (b.bonus === 'windRiders') buff(u, 'windRiders', 'Wind Riders', 99);
    if (b.bonus === 'yigaAmbush') addStatus(u, 'veiled', 2);
    if ((groups.includes('threeGenerationsOfRito') && ['revali', 'teba', 'tulin'].includes(tid(u)))) buff(u, 'ritoGenerations', 'Three Generations', 99, { mov: 1 });
    if (has(u, 'ancientBallads')) b.morale = Math.min(100, (b.morale ?? 50) + 5);
    if (hasTrait(u, 'morale')) b.morale = Math.min(100, (b.morale ?? 50) + 3);
  }
  if (groups.includes('acrossOneHundredYears')) b.morale = Math.min(100, (b.morale ?? 50) + 10);
  if (b.units.some((u) => u.team === 'player' && hasTrait(u, 'energyCap'))) { st.energyMax += 15; st.energy += 15; }
}

// ───────────────────────── Start of phase ─────────────────────────

export interface WildEvent { uid: string; heal: number; damage: number; source: string }

export function wildStartPhase(b: Battle, u: Unit, events: WildEvent[]) {
  const st = b.wild;
  if (!st && !isWildWorld(b) && !u.gloom && !wildTraits(u).length && !u.wildCharges) return;
  const w = wildState(b);
  const rng = new RNG(b.rngState);
  const here = tilesOf(b, u);
  const mine = b.units.filter((a) => a.team === u.team);
  const foes = foesOf(b, u);
  const heal = (amt: number, source: string) => {
    amt = Math.min(u.stats.hp - u.hp, Math.max(0, Math.ceil(amt)));
    if (amt > 0) { u.hp += amt; events.push({ uid: u.uid, heal: amt, damage: 0, source }); }
  };
  const hurt = (who: Unit, amt: number, source: string) => {
    amt = Math.min(who.hp - 1, Math.max(0, Math.ceil(amt)));
    if (amt > 0) { who.hp -= amt; events.push({ uid: who.uid, heal: 0, damage: amt, source }); }
  };
  // Once per round (the first player unit): timers, fields, bombs and energy.
  if (u.team === 'player' && u === mine[0]) {
    for (const t of w.timers) if (--t.turns <= 0) b.tiles[t.k] = t.revert;
    w.timers = w.timers.filter((t) => t.turns > 0);
    for (const f of w.fields) f.turns--;
    w.fields = w.fields.filter((f) => f.turns > 0);
    if ((w.noDrain ?? 0) > 0) w.noDrain!--;
    if (b.units.some((a) => a.team === 'player' && hasTrait(a, 'fastRecharge'))) w.energy = Math.min(w.energyMax, w.energy + 4);
    for (const bomb of [...w.bombs]) if (--bomb.turns <= 0) { explode(b, bomb, events); w.bombs = w.bombs.filter((x) => x !== bomb); }
  }
  w.prevPos[u.uid] = { x: u.x, y: u.y };
  w.turnHp[u.uid] = u.hp;
  (u.turnUses ??= {}).climate = b.weather?.kind === 'rain' ? 3 : HEAT.has(b.world) ? 1 : COLD.has(b.world) ? 2 : 0;
  // ── Giant forms shrink back ──
  if (u.wildGiant && !hasBuff(u, 'giantForm')) { u.size = u.baseSize ?? 1; u.wildGiant = false; }
  // ── Disabled Divine Beasts and machines out of energy ──
  if (u.wildDisabled) { u.moved = u.acted = true; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is disabled' }); return; }
  if (u.race === 'zonaiVehicle' && u.team === 'player' && !u.npc) {
    const v = VEHICLE_BY_ID[tid(u)];
    if (v && !spendEnergy(b, u, v.energy)) { buff(u, 'noEnergy', 'Out of energy', 1, { mov: -99 }); addStatus(u, 'root', 1); events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is out of energy' }); }
    if (v && v.crew > 0 && !(u.cargo?.length)) buff(u, 'autopilot', 'Autopilot', 1, { mov: -2 });
  }
  if (w.upkeep[u.uid] !== undefined && !spendEnergy(b, u, w.upkeep[u.uid])) {
    b.units = b.units.filter((x) => x !== u);
    events.push({ uid: u.uid, heal: 0, damage: 0, source: 'powers down (no energy)' });
    return;
  }
  // ── Master Sword energy ──
  if (u.msEnergy !== undefined) {
    const groups = b.groupSupports ?? [];
    u.msEnergy = Math.min(groups.includes('firstAndTheLast') ? 25 : 18, u.msEnergy + (hasBuff(u, 'msDrained') ? 5 : 1) + (groups.includes('firstAndTheLast') ? 1 : 0));
    if (hasBuff(u, 'msDrained') && u.msEnergy >= 10) u.buffs = u.buffs.filter((x) => x.id !== 'msDrained');
  }
  // ── Terrain: Gloom, Lightroots, sunlight, updrafts, sludge, climate ──
  if (here.includes('gloom') || here.includes('gloomPool')) {
    const g = addGloom(b, u, Math.max(2, Math.ceil((u.stats.hp + (u.gloom ?? 0)) * (here.includes('gloomPool') ? 0.15 : 0.1))));
    if (g) events.push({ uid: u.uid, heal: 0, damage: g, source: `Gloom (−${g} max HP)` });
  }
  if (b.tiles.some((t, i) => t === 'lightroot' && footDist(i % b.width, Math.floor(i / b.width), 1, u.x, u.y, u.size) <= 2)) {
    const c = cureGloom(u);
    heal(u.stats.hp * 0.1, c ? `Lightroot (+${c} max HP)` : 'Lightroot');
  }
  if ((here.includes('updraft') || here.includes('launchPlatform')) && !hasBuff(u, 'aerial')) buff(u, 'aerial', 'Updraft', 1, { mov: 2 });
  if (here.includes('lowGravity')) buff(u, 'lowGravity', 'Low Gravity', 1, { mov: 1 });
  if (here.includes('stable') && isMounted(u)) heal(u.stats.hp * 0.1, 'Stable');
  if (here.includes('waterSphere') && !canSwim(u) && moveTypeOf(u) !== 'flying') hurt(u, u.stats.hp * 0.05, 'Water sphere');
  if (here.includes('sludge') && !has(u, 'sludgeForm')) buff(u, 'sludged', 'In sludge', 1, { spd: -2 });
  const climate = WILD_CLIMATE[b.world];
  const tr = wildTraits(u);
  if (climate && isWildWorld(b) && u.team === 'player' && !mechanical(u)) {
    if (climate === 'cold' && !tr.includes('coldRes') && !tr.includes('freezeImmune') && !hasBuff(u, 'wt:coldRes')) hurt(u, u.stats.hp * 0.04, 'Freezing cold');
    if (climate === 'hot' && b.turn % 2 === 1 && !tr.includes('heatRes') && !hasBuff(u, 'wt:heatRes')) hurt(u, u.stats.hp * 0.03, 'Desert heat');
    if (climate === 'volcanic' && !tr.includes('flameRes') && !tr.includes('fireImmune') && !hasBuff(u, 'wt:fireImmune') && rng.chance(20)) addStatus(u, 'burn', 1);
  }
  if (climate === 'storm' && b.weather?.kind === 'rain' && u.team === 'player' && rng.chance(8) && carriesMetal(u) && !tr.includes('shockImmune') && !tr.includes('lightningImmune')) {
    hurt(u, 6, 'Lightning strikes metal');
    addStatus(u, 'shock', 1);
  }
  // ── Malice corrupts machinery ──
  if (hasStatus(u, 'malice') && mechanical(u) && rng.chance(b.bonus === 'calamityCorruption' && u.team === 'enemy' ? 50 : 30)) addStatus(u, 'confuse', 1);
  // ── Personal skills ──
  if (has(u, 'eternalRestoration')) {
    heal(u.stats.hp * 0.15, 'Eternal Restoration');
    for (const a of mine) if (a !== u && unitDist(a, u) <= 3) { a.hp = Math.min(a.stats.hp, a.hp + Math.ceil(a.stats.hp * 0.1)); cureGloom(a, 2); }
  }
  if (has(u, 'rapidReform')) heal(u.stats.hp * 0.15, 'Rapid Reform');
  if (has(u, 'oreEater')) {
    const ore = tilesInRange(b, u, 1, 1, u.size).find((p) => ['oreDeposit', 'zonaiteDeposit', 'rareOre'].includes(tileAt(b, p.x, p.y) ?? ''));
    if (ore) { b.tiles[keyOf(b, ore.x, ore.y)] = 'plain'; heal(u.stats.hp * 0.3, 'eats ore'); }
  }
  if (has(u, 'flameOfDinSkill')) for (const e of foes) if (unitDist(u, e) <= 2) { hurt(e, e.stats.hp * 0.05, 'Flame of Din'); if (rng.chance(30)) addStatus(e, 'burn', 1); }
  if (has(u, 'frostOfNayruSkill')) {
    for (const e of foes) if (unitDist(u, e) <= 2) buff(e, 'chilled', 'Chilled', 1, { spd: -2 });
    for (const p of tilesInRange(b, u, 1, 2, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'water') setTimed(b, k, 'frozenWater', 2); }
  }
  if (has(u, 'thunderOfFaroreSkill') && b.turn % 2 === 0) for (const e of foes.filter((x) => unitDist(u, x) <= 3).slice(0, 2)) { hurt(e, 8, 'Thunder of Farore'); addStatus(e, 'shock', 1); }
  if (has(u, 'lordOfTheMountainSkill')) { u.sta = u.stats.sta; for (const a of mine) if (unitDist(a, u) <= 3 && unitTags(a).includes('beast')) a.statuses = a.statuses.filter((s) => s.kind !== 'fear'); }
  if (has(u, 'seismicDominion')) for (const e of foes) if (unitDist(u, e) <= 2 && moveTypeOf(e) !== 'flying') hurt(e, 6, 'Sand shockwave');
  if (has(u, 'devouringInhale')) {
    const t = foes.filter((e) => e.size < u.size && unitDist(u, e) <= 3 && unitDist(u, e) > 1).sort((a, c) => unitDist(u, a) - unitDist(u, c))[0];
    if (t) { pullToward(b, t, u, 1); addStatus(t, 'root', 1); events.push({ uid: t.uid, heal: 0, damage: 0, source: `is pulled in by ${u.name}` }); }
  }
  if (has(u, 'hiveQueen') && b.turn % 2 === 0 && b.units.filter((x) => x.team === u.team && x.artId === 'gibdo' && x.summoned).length < 3 && ENEMIES.gibdo) {
    const g = makeEnemy(ENEMIES.gibdo, b.world, Math.max(1, b.enemyLevel - 1), `e${b.uidCounter++}`, rng);
    const spot = nearFree(b, g, u, 2);
    if (spot) { Object.assign(g, { x: spot.x, y: spot.y, team: u.team, summoned: true, moved: true, acted: true }); b.units.push(g); events.push({ uid: g.uid, heal: 0, damage: 0, source: 'crawls out of the hive' }); }
  }
  if (has(u, 'waterBlight') || has(u, 'aquaticSiegeFortress')) {
    for (const p of tilesInRange(b, u, 1, 1, u.size).slice(0, 3)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain' && !unitAt(b, p.x, p.y)) setTimed(b, k, 'water', 3); }
    if (has(u, 'aquaticSiegeFortress')) for (const a of mine) if (a !== u && unitDist(a, u) <= 3) a.hp = Math.min(a.stats.hp, a.hp + Math.ceil(a.stats.hp * 0.1));
  }
  if (has(u, 'thunderBlight') && u.lastHitBy) {
    const by = b.units.find((x) => x.uid === u.lastHitBy);
    const spot = by && nearFree(b, u, by, 1);
    if (spot) { u.x = spot.x; u.y = spot.y; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'teleports' }); }
  }
  if (has(u, 'gloomPhantomSkill')) {
    const t = foes.filter((e) => unitDist(u, e) <= 5).sort((a, c) => unitDist(u, a) - unitDist(u, c))[0];
    const spot = t && unitDist(u, t) > 1 && nearFree(b, u, t, 1);
    if (spot) { u.x = spot.x; u.y = spot.y; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'blinks through the Gloom' }); }
  }
  if (has(u, 'formationShift')) {
    const f = b.turn % 3;
    buff(u, 'formation', f === 0 ? 'Humanoid Formation' : f === 1 ? 'Cube Formation' : 'Platform Formation', 1, f === 0 ? { str: 4 } : f === 1 ? { def: 6 } : { mov: 2 });
  }
  if (has(u, 'swappingArms') && u.weapons.length > 1) u.weapons.push(u.weapons.shift()!);
  if (has(u, 'maintenance')) {
    for (const a of mine) if (a !== u && unitDist(a, u) <= 1 && mechanical(a)) a.hp = Math.min(a.stats.hp, a.hp + Math.ceil(a.stats.hp * 0.15));
    if (u.team === 'player') w.energy = Math.min(w.energyMax, w.energy + 3);
  }
  if (has(u, 'royalSteed') || hasTrait(u, 'mountedStamina') && isMounted(u)) u.sta = Math.min(u.stats.sta, u.sta + (has(u, 'royalSteed') ? 2 : 3));
  if (has(u, 'forestBound') && here.includes('forest')) addStatus(u, 'veiled', 1);
  if (has(u, 'aerialSurveillance')) for (const e of foes) if (e.hidden && unitDist(u, e) <= 6) e.hidden = false;
  if (hasTrait(u, 'scouting')) for (const e of foes) if (e.hidden && unitDist(u, e) <= 5) e.hidden = false;
  if (hasTrait(u, 'lightsTerrain') || hasBuff(u, 'wt:bright') || hasBuff(u, 'zonaiLight')) lightUp(b, u, hasBuff(u, 'zonaiLight') || hasBuff(u, 'wt:bright') ? 3 : 2);
  if (has(u, 'mechanicalDiscipline')) u.statuses = u.statuses.filter((s) => s.kind !== 'fear');
  // ── Auras from allies ──
  for (const a of mine) {
    if (a === u) continue;
    const d = unitDist(a, u);
    if (has(a, 'royalPresenceWild') && d <= 2 && u.race === 'zora') heal(u.stats.hp * 0.1, 'Royal Presence');
    if (has(a, 'lordOfTheMountainSkill') && d <= 3 && unitTags(u).includes('beast')) u.statuses = u.statuses.filter((s) => s.kind !== 'fear');
  }
  // ── Group supports ──
  if (u.team === 'player') {
    const groups = b.groupSupports ?? [];
    if (groups.includes('acrossOneHundredYears') && ['heroOfTheWild', 'zeldaWild', 'kingRhoam', 'impaWild'].includes(tid(u))) u.statuses = u.statuses.filter((s) => s.kind !== 'fear');
    if (groups.includes('zoraRoyalFamily') && canSwim(u) && b.units.some((a) => a.team === 'player' && ['dorephan', 'mipha', 'sidon', 'yona'].includes(tid(a)) && unitDist(a, u) <= 2)) heal(u.stats.hp * 0.05, 'Zora Royal Family');
  }
  b.rngState = rng.state;
}

function carriesMetal(u: Unit): boolean {
  const sh = u.gear.shield ? GEAR[u.gear.shield] : undefined;
  if (sh?.shieldFamily === 'iron') return true;
  return u.weapons.slice(0, 1).some((id) => { const w = WEAPONS[id]; return !!w && w.type !== 'natural' && w.type !== 'magic' && w.type !== 'staff' && !/wood|branch|boko|bone|tree|bat|club|mop|oar|ladle|pitchfork|boomerang/i.test(id); });
}

function lightUp(b: Battle, at: Pos & { size?: number }, r: number) {
  for (const p of [{ x: at.x, y: at.y }, ...tilesInRange(b, { x: at.x, y: at.y }, 1, r, at.size ?? 1)]) {
    const k = keyOf(b, p.x, p.y);
    if (b.tiles[k] === 'darkness') b.tiles[k] = 'plain';
    const e = unitAt(b, p.x, p.y);
    if (e?.hidden) e.hidden = false;
  }
}

function explode(b: Battle, bomb: { x: number; y: number; team: string; power: number }, events: WildEvent[]) {
  for (const e of b.units) if (footDist(bomb.x, bomb.y, 1, e.x, e.y, e.size) <= 1 && e.hp > 1) { const d = Math.min(e.hp - 1, bomb.power); e.hp -= d; events.push({ uid: e.uid, heal: 0, damage: d, source: 'Time Bomb' }); }
  breakAround(b, { x: bomb.x, y: bomb.y }, 1);
}

/** Explosions break cracked walls, ore, barrels (chain) and ice. */
function breakAround(b: Battle, at: Pos, r: number): string[] {
  const lines: string[] = [];
  for (const p of [at, ...tilesInRange(b, at, 1, r, 1)]) {
    if (!inBounds(b, p.x, p.y)) continue;
    const k = keyOf(b, p.x, p.y);
    const t = b.tiles[k];
    if (t === 'cracked' || t === 'iceBlock' || t === 'iceWall') b.tiles[k] = 'plain';
    if (t === 'oreDeposit' || t === 'rareOre' || t === 'luminousOre' || t === 'zonaiteDeposit') { b.tiles[k] = 'plain'; drop(b, oreLoot(t, 1)); lines.push('An ore deposit shatters.'); }
    if (t === 'explosiveBarrel') { b.tiles[k] = 'plain'; lines.push('An explosive barrel goes up!'); for (const e of b.units) if (footDist(p.x, p.y, 1, e.x, e.y, e.size) <= 1 && e.hp > 1) e.hp = Math.max(1, e.hp - 12); }
  }
  return lines;
}

function oreLoot(t: Terrain, bonus: number): string[] {
  const n = 1 + bonus;
  const pick = (a: string[]) => Array.from({ length: n }, (_, i) => a[i % a.length]);
  if (t === 'rareOre') return pick(['diamond', 'ruby', 'sapphire', 'topaz']);
  if (t === 'luminousOre') return pick(['luminousStone']);
  if (t === 'zonaiteDeposit') return pick(['zonaite', 'largeZonaite']);
  return pick(['amber', 'opal', 'luminousStone']);
}

// ───────────────────────── Environment (elemental reactions) ─────────────────────────

const FLAMMABLE = new Set<Terrain>(['dryGrass', 'burningGrass', 'tallTree', 'fallenLog', 'forest']);

/** Fire spreads across grass and trees; burning grass makes updrafts; Gloom pools spread. */
export function wildEnvironment(b: Battle, events: { text: string; uid?: string; damage?: number }[]) {
  if (!b.wild && !isWildWorld(b)) return;
  const st = wildState(b);
  const rng = new RNG(b.rngState);
  const rain = b.weather?.kind === 'rain';
  // Burning grass keeps burning until doused.
  for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i] === 'burningGrass' && !rain) ignite(b, i, 2);
  const next: number[] = [];
  for (const f of b.fires ?? []) {
    const k = keyOf(b, f.x, f.y);
    for (const p of tilesInRange(b, f, 1, 1, 1)) {
      const nk = keyOf(b, p.x, p.y);
      if (FLAMMABLE.has(b.tiles[nk]) && b.tiles[nk] !== 'forest' && !(b.fires ?? []).some((o) => o.x === p.x && o.y === p.y) && rng.chance(rain ? 10 : 45)) next.push(nk);
    }
    // Fire + grass makes an updraft; fire + a Hylian pine cone makes a strong one.
    if ((b.tiles[k] === 'dryGrass' || b.tiles[k] === 'burningGrass') && f.turns <= 1) setTimed(b, k, 'updraft', 2);
    if (st.cones.includes(k)) { for (const p of [{ x: f.x, y: f.y }, ...tilesInRange(b, f, 1, 1, 1)]) { const ck = keyOf(b, p.x, p.y); if (!['wall', 'fort'].includes(b.tiles[ck])) setTimed(b, ck, 'updraft', 3); } st.cones = st.cones.filter((c) => c !== k); events.push({ text: 'A pine cone bursts into flame: a strong updraft!' }); }
    if (f.turns <= 1 && (b.tiles[k] === 'tallTree' || b.tiles[k] === 'fallenLog')) b.tiles[k] = 'plain';
    if (b.tiles[k] === 'iceBlock' || b.tiles[k] === 'frozenWater') b.tiles[k] = 'water';
    if (b.tiles[k] === 'explosiveBarrel') events.push(...breakAround(b, { x: f.x, y: f.y }, 1).map((text) => ({ text })));
  }
  if (next.length) { for (const k of next) ignite(b, k, 2); events.push({ text: `Flames race through the grass (${next.length} space${next.length > 1 ? 's' : ''}).` }); }
  // Gloom pools spread corruption.
  for (let i = 0; i < b.tiles.length; i++) {
    if (b.tiles[i] !== 'gloomPool' || !rng.chance(30)) continue;
    const p = { x: i % b.width, y: Math.floor(i / b.width), size: 1 };
    const t = rng.pick(tilesInRange(b, p, 1, 1, 1));
    if (t && b.tiles[keyOf(b, t.x, t.y)] === 'plain') b.tiles[keyOf(b, t.x, t.y)] = 'gloom';
  }
  // Riju's lightning fields crackle.
  for (const f of st.fields) for (const e of b.units) if (e.team !== f.team && footDist(f.x, f.y, 1, e.x, e.y, e.size) <= f.r && rng.chance(25)) addStatus(e, 'shock', 1);
  // Weather: storms in Faron and Lanayru, blizzards in Hebra.
  if (!b.weather && isWildWorld(b) && (WILD_CLIMATE[b.world] === 'storm') && rng.chance(15)) { b.weather = { kind: 'rain', turns: 3 }; events.push({ text: 'A thunderstorm rolls in. Metal draws lightning!' }); }
  b.rngState = rng.state;
}

function ignite(b: Battle, k: number, turns: number) {
  if (b.weather?.kind === 'rain') return;
  const x = k % b.width, y = Math.floor(k / b.width);
  const f = (b.fires ??= []).find((o) => o.x === x && o.y === y);
  if (f) f.turns = Math.max(f.turns, turns);
  else b.fires.push({ x, y, turns });
}

/** An element lands on a space: fire spreads and melts, ice freezes, lightning conducts, water washes, wind blows. */
export function react(b: Battle, at: Pos, element: Element | 'wind' | undefined, by?: Unit, radius = 0): string[] {
  if (!element) return [];
  const lines: string[] = [];
  const tiles = [at, ...tilesInRange(b, at, 1, radius, 1)].filter((p) => inBounds(b, p.x, p.y));
  for (const p of tiles) {
    const k = keyOf(b, p.x, p.y);
    const t = b.tiles[k];
    if (element === 'fire') {
      if (FLAMMABLE.has(t) || wildState(b).cones.includes(k)) ignite(b, k, t === 'tallTree' ? 3 : 2);
      if (t === 'frozenWater' || t === 'iceBlock') { b.tiles[k] = 'water'; lines.push('The ice melts.'); }
      if (t === 'explosiveBarrel') lines.push(...breakAround(b, p, 1));
    } else if (element === 'ice') {
      if (t === 'water' || t === 'poisonWater' || t === 'waterSphere') { setTimed(b, k, 'frozenWater', 3); lines.push('The water freezes solid.'); }
      if (t === 'lava') { setTimed(b, k, 'solidifiedLava', 3); lines.push('The lava cools into rock.'); }
      if (b.fires?.some((f) => f.x === p.x && f.y === p.y)) b.fires = b.fires.filter((f) => !(f.x === p.x && f.y === p.y));
    } else if (element === 'water') {
      if (t === 'sludge') { b.tiles[k] = 'plain'; lines.push('The sludge washes away.'); }
      if (t === 'burningGrass') b.tiles[k] = 'dryGrass';
      if (b.fires?.length) b.fires = b.fires.filter((f) => !(f.x === p.x && f.y === p.y));
      const u = unitAt(b, p.x, p.y);
      if (u) u.statuses = u.statuses.filter((s) => s.kind !== 'burn');
    } else if (element === 'lightning') {
      if (WATERY.includes(t) || t === 'frozenWater') lines.push(...electrify(b, p, by));
    } else if (element === 'wind') {
      // Wind + fire: flames spread downwind. Wind + smoke: concealment is blown away.
      if (by) {
        const dx = Math.sign(p.x - by.x), dy = Math.sign(p.y - by.y);
        if (b.fires?.some((f) => f.x === p.x && f.y === p.y)) { const nk = keyOf(b, p.x + dx, p.y + dy); if (inBounds(b, p.x + dx, p.y + dy) && FLAMMABLE.has(b.tiles[nk])) ignite(b, nk, 2); }
      }
      const u = unitAt(b, p.x, p.y);
      if (u && by && u.team !== by.team) u.statuses = u.statuses.filter((s) => s.kind !== 'veiled');
    }
  }
  return [...new Set(lines)];
}

/** Lightning conducts through connected water (and from there, metal). */
function electrify(b: Battle, from: Pos, by?: Unit): string[] {
  const seen = new Set<number>([keyOf(b, from.x, from.y)]);
  const queue = [from];
  while (queue.length && seen.size < 18) {
    const p = queue.shift()!;
    for (const q of tilesInRange(b, p, 1, 1, 1)) {
      const k = keyOf(b, q.x, q.y);
      if (seen.has(k) || !(WATERY.includes(b.tiles[k]) || b.tiles[k] === 'frozenWater')) continue;
      seen.add(k); queue.push(q);
    }
  }
  let n = 0;
  for (const u of b.units) {
    if (by && u.team === by.team) continue;
    if (!footprint(u.x, u.y, u.size).some((p) => seen.has(keyOf(b, p.x, p.y)))) continue;
    const tr = wildTraits(u);
    if (tr.includes('shockImmune') || tr.includes('lightningImmune')) continue;
    if (u.hp > 1) { u.hp = Math.max(1, u.hp - (tr.includes('shockRes') ? 2 : 4)); addStatus(u, 'shock', 1); n++; }
  }
  return n ? [`The water carries the lightning (${n} shocked).`] : [];
}

/** Lightning arcs through metal: adjacent enemies holding metal take 3. */
function conductMetal(b: Battle, target: Unit, by: Unit): string | null {
  const hit: Unit[] = [];
  let cur = target;
  for (let i = 0; i < 3; i++) {
    const next = b.units.find((e) => e.team === target.team && e !== target && !hit.includes(e) && unitDist(e, cur) === 1 && carriesMetal(e) && e.hp > 1);
    if (!next) break;
    next.hp = Math.max(1, next.hp - 3); addStatus(next, 'shock', 1); hit.push(next); cur = next;
  }
  void by;
  return hit.length ? `Lightning arcs through metal to ${hit.map((h) => h.name).join(', ')}.` : null;
}

// ───────────────────────── Fusion and durability ─────────────────────────

/** Fusion data for a material or device id (bag materials, free rocks, gems, Zonai devices). */
export function fuseOf(id: string | undefined): { might: number; element?: Element; single?: boolean; zonai?: boolean; name: string } | null {
  if (!id) return null;
  const m = MATERIAL_BY_ID[id];
  if (m?.fuse) return { ...m.fuse, name: m.name };
  if (FREE_FUSE[id]) return { ...FREE_FUSE[id].fuse, name: FREE_FUSE[id].name };
  if (ITEMS[id]) {
    const it = ITEMS[id];
    const dev: Record<string, { might: number; element?: Element }> = { flameEmitter: { might: 4, element: 'fire' }, frostEmitter: { might: 4, element: 'ice' }, shockEmitter: { might: 4, element: 'lightning' },
      zonaiRocket: { might: 2 }, zonaiSpring: { might: 2 }, zonaiCart: { might: 1 }, zonaiSled: { might: 1 }, zonaiMirror: { might: 2, element: 'light' }, bombFlower: { might: 6 }, puffshroom: { might: 1 }, beamEmitter: { might: 5 } };
    if (dev[id]) return { ...dev[id], zonai: ZONAI_DEVICES.includes(id), name: it.name };
  }
  return null;
}

/** Fusion Might for a weapon (or DEF for a shield) on this unit. */
export function fusedMight(u: Unit, w: WeaponDef): number {
  const f = fuseOf(u.fused?.[w.id]);
  if (!f) return 0;
  let m = f.might * (w.fuseMult ?? 1);
  if (f.zonai && w.wild?.includes('zonaiFusion')) m *= 1.5;
  if (has(u, 'advancedArsenalConstruct')) m *= 1.5;
  return Math.floor(m);
}

export { wildMaxUses } from './wildGear';

/** The Master Sword: it loses energy instead of breaking. */
function masterSwordDrained(u: Unit, w: WeaponDef): boolean {
  return w.id === 'masterSword' && u.msEnergy !== undefined && hasBuff(u, 'msDrained');
}

// ───────────────────────── Combat hooks ─────────────────────────

export interface WildMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

const HEAT = new Set(['eldinWild', 'gerudoWild']);
const COLD = new Set(['hebra']);

export function wildMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): WildMods {
  const m: WildMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const tr = wildTraits(u);
  if (!tr.length && !b.wild && !u.skills.length) return m;
  const allies = alliesOf(b, u);
  const near = (a: Unit, r: number) => unitDist(a, u, pos) <= r;
  const dist = unitDist(u, foe, pos);
  const night = !!b.night;
  const air = airborne(u);
  if (tr.includes('stealth') && night) m.avoid += 10;
  if (tr.includes('nightAvoid') && night) m.avoid += 20;
  if (tr.includes('emberPower') && HEAT.has(b.world)) m.str += 3;
  if (tr.includes('frostPower') && COLD.has(b.world)) m.str += 3;
  if (tr.includes('stormPower') && b.weather?.kind === 'rain') m.str += 3;
  if (tr.includes('critDmg') && w && !isMagical(w.type)) m.crit += 15;
  if (tr.includes('aquaticStability') && tilesOf(b, u).some((t) => WATERY.includes(t))) m.avoid += 10;
  if (tr.includes('slipImmune') && b.weather?.kind === 'rain') m.avoid += 10;
  // Bullet Time and aerial archery
  if (air && w?.type === 'bow' && initiating && (has(u, 'bulletTime') || hasBuff(u, 'aerial'))) m.hit += 20;
  if (air && w?.type === 'bow' && has(u, 'aerialVeteran')) m.hit += 15;
  if (air && w?.wild?.includes('aerialAccuracy')) m.hit += 20;
  if (w?.wild?.includes('wetAccuracy') && (b.weather?.kind === 'rain' || tilesOf(b, u).some((t) => WATERY.includes(t)))) m.hit += 20;
  if (w?.wild?.includes('longCrit') && dist >= 5) m.crit += 20;
  if (w?.wild?.includes('unawareCrit') && (u.hidden || hasStatus(u, 'veiled') || !foe.attacked)) m.crit += 20;
  if (w?.wild?.includes('aquatic') && tilesInRange(b, pos, 0, 1, u.size).some((p) => WATERY.includes(tileAt(b, p.x, p.y) ?? 'plain'))) m.hit += 20;
  if (w?.wild?.includes('counterBonus') && !initiating) m.dmg += 3;
  if (has(u, 'ancientExpertise') && w && (w.wild?.includes('ancientDamage') || w.type === 'siege')) { m.dmg += 4; m.hit += 15; }
  if (has(u, 'basicLasers')) m.hit += 10;
  if (has(u, 'ancientMelee') && dist <= 1) m.dmg += 2;
  if (has(u, 'masterOfCombat')) m.hit += 10;
  if (has(u, 'calamitousArsenal')) { m.hit += 10; if (initiating && w && b.wild?.lastWeapon[u.uid] && b.wild.lastWeapon[u.uid] !== w.id) m.dmg += 3; }
  if (has(u, 'fortifiedPosition') && (u.movedDist ?? 0) === 0) m.def += 8;
  if (has(u, 'limblessFury') && u.hp < u.stats.hp / 2) m.str += 4;
  if (has(u, 'boneThrower') && dist >= 2) m.hit += 10;
  if (has(u, 'rupeeSpirit')) m.avoid += 30;
  if (has(u, 'masterOfTrials')) m.avoid += 15;
  if (has(u, 'gloomPhantomSkill')) m.avoid += 20;
  if (has(u, 'thunderBlight') && dist >= 2) m.avoid += 20;
  if (has(u, 'ceilingCrawl') && tilesInRange(b, pos, 1, 1, u.size).some((p) => tileAt(b, p.x, p.y) === 'wall')) m.avoid += 20;
  if (has(u, 'giantsGrasp') && tilesInRange(b, pos, 1, 1, u.size).some((p) => ['forest', 'tallTree'].includes(tileAt(b, p.x, p.y) ?? ''))) m.dmg += 5;
  if (has(u, 'heavyPaws') && tileAt(b, pos.x, pos.y) === 'forest') m.str += 3;
  if (has(u, 'tramplingCharge') && initiating && (u.movedDist ?? 0) >= 3) m.dmg += 4;
  if (has(u, 'advancedArsenal') && b.turn % 2 === 0 && w?.type === 'natural' && w.magicContact) m.dmg += 6;
  if (has(u, 'fireBlight') && b.turn % 2 === 1 && initiating) m.dmg += 6;
  if (hasBuff(u, 'eagleEye')) m.hit += 10;
  if (hasBuff(u, 'divineFlight')) m.avoid += 20;
  if (hasBuff(u, 'constructHead')) m.hit += 20;
  if (hasBuff(u, 'steeringStick')) m.hit += 10;
  if (hasBuff(u, 'zonaiEnhancement') && w && (w.wild?.includes('zonai') || u.race === 'zonaiVehicle')) m.dmg += 5;
  if (foe.turnUses?.analyzed && allies.some((a) => a.team === u.team)) m.hit += 10;
  if (hasBuff(foe, 'ancientResearchMark')) m.hit += 15;
  // Yiga ambushes from disguise
  if (initiating && (u.hidden || hasStatus(u, 'veiled')) && (CLASSES[u.classId]?.tags?.includes('yiga') || b.bonus === 'yigaAmbush')) m.dmg += 3;
  // ── Commander bonuses ──
  if (u.team === 'player' && b.bonus === 'demonKingsGloom' && unitTags(u).includes('demon')) m.dmg += 1;
  // ── Auras ──
  for (const a of allies) {
    const d = unitDist(a, u, pos);
    if (has(a, 'demonKingsDominionWild') && d <= 3 && unitTags(u).includes('demon')) { m.str += 4; m.mag += 4; }
    if (has(a, 'gloryToMasterKohga') && d <= 2 && CLASSES[u.classId]?.tags?.includes('yiga')) { m.str += 3; m.spd += 3; }
    if (has(a, 'royalGuidance') && d <= 2 && u.race === 'hylian') { m.def += 3; m.res += 3; }
    if (has(a, 'traditionalWisdom') && d <= 2 && canSwim(u)) { m.skl += 3; m.res += 3; }
    if (has(a, 'commandSignal') && d <= 2 && /soldierConstruct/.test(tid(u))) m.skl += 2;
    if (has(a, 'coordinatedAssault') && d <= 1 && u.race === 'zonaiConstruct') m.str += 3;
    if (has(a, 'zonaiCommand') && d <= 3 && u.race === 'zonaiConstruct') { m.str += 4; m.def += 4; m.skl += 4; }
    if (has(a, 'bokoblinWarlord') && d <= 3 && /bokoblin/i.test(u.artId ?? tid(u))) { m.str += 3; m.def += 3; }
    if (has(a, 'monsterPlatform') && d <= 1 && u.size === 1) { m.def += 2; m.avoid += 10; }
    if (has(a, 'flyingArtillery') && d <= 3 && moveTypeOf(u) === 'flying') m.hit += 10;
    if (hasBuff(a, 'goronGuard') && d <= 1) m.def += 2;
  }
  if (hasBuff(u, 'gerudoRally') && u.race === 'gerudo') { m.str += 2; m.skl += 2; }
  if (u.team === 'player' && w?.type === 'sword' && (b.groupSupports ?? []).includes('gerudoLegacy') && ['nabooru', 'urbosa', 'riju'].includes(tid(u))) m.crit += 10;
  void near;
  return m;
}

/** Extra Might: fusion, pristine/decayed, temporary fusion, Demon King's Bow, near-breaking. */
export function wildMight(b: Battle, u: Unit, w: WeaponDef, foe: Unit, initiating: boolean, dist: number): number {
  let m = fusedMight(u, w);
  const mod = u.wmod?.[w.id];
  if (mod === 'decayed') m -= Math.ceil(w.might * 0.3);
  if (mod === 'pristine') m += Math.max(2, Math.ceil(w.might * 0.15));
  if (u.tempFuse && !isMagical(w.type)) m += u.tempFuse.might;
  if (u.arrowFuse && w.type === 'bow') m += 3;
  if (w.wild?.includes('mtGrowsHp')) m += Math.min(18, Math.floor(u.stats.hp / 5));
  if (w.wild?.includes('thrownMulti') && dist >= 2) m += 3;
  if (w.wild?.includes('gemElement') && w.wild.includes('gemBoost') && MATERIAL_BY_ID[u.fused?.[w.id] ?? '']?.kind === 'gem') m += 4;
  if (w.id === 'masterSword' && (b.groupSupports ?? []).includes('firstAndTheLast') && u.team === 'player') m += 5;
  if (u.constructSlots && (tid(u) === 'mineruConstruct')) m += u.constructSlots.core ? 2 : 0;
  void foe; void initiating;
  return m;
}

/** Element override: fused materials and gems, fused arrows, set bonuses in their climate, Volcanic Charge. */
export function wildElement(u: Unit, w: WeaponDef): Element | undefined {
  if (w.type === 'bow' && u.arrowFuse?.element) return u.arrowFuse.element;
  if (u.tempFuse?.element && !isMagical(w.type)) return u.tempFuse.element;
  const f = fuseOf(u.fused?.[w.id]);
  if (f?.element && (w.wild?.includes('gemElement') || f.element !== 'light' || w.type !== 'magic')) return f.element;
  if (hasBuff(u, 'volcanicCharge')) return 'fire';
  if (has(u, 'elementalHeads')) return (['fire', 'ice', 'lightning'] as Element[])[(u.turnUses?.headCycle ?? 0) % 3];
  const tr = wildTraits(u);
  if (tr.includes('fireAttack') && u.turnUses?.climate === 1) return 'fire';
  if (tr.includes('iceAttack') && u.turnUses?.climate === 2) return 'ice';
  if (tr.includes('lightningAttack') && u.turnUses?.climate === 3) return 'lightning';
  return undefined;
}

/** Can't attack: a drained Master Sword, Bullet Time (no counters against aerial archers), out of energy. */
export function wildCannotAttack(b: Battle, u: Unit, w: WeaponDef, initiating: boolean, foe?: Unit, foeW?: WeaponDef): boolean {
  if (masterSwordDrained(u, w)) return true;
  if (hasBuff(u, 'noEnergy') && (w.type === 'siege' || u.race === 'zonaiVehicle')) return true;
  if (u.wildDisabled) return true;
  if (!initiating && foe && foeW?.type === 'bow' && airborne(foe) && (has(foe, 'bulletTime') || hasBuff(foe, 'aerial'))) return true;
  if (b.wild && w.wild?.includes('energyRange') && foe && unitDist(u, foe) >= 6 && b.wild.energy < 2 && u.team === 'player') return true;
  return false;
}

/** Extra reach: Fortified Position, wind riders, sword beams, Windcleaver, Medoh's cannons, Calamity's lasers. */
export function wildRangeBonus(u: Unit, w: WeaponDef): number {
  let r = 0;
  if (has(u, 'fortifiedPosition') && (u.movedDist ?? 0) === 0 && w.maxRange > 1) r += 1;
  if (has(u, 'aerialSurveillance') && w.maxRange > 1) r += 1;
  if (has(u, 'windBlight') && w.type === 'natural' && w.maxRange > 1) r += 1;
  if (has(u, 'flyingArtillery') && w.maxRange > 1) r += 2;
  if (w.type === 'bow' && hasBuff(u, 'windRiders')) r += 1;
  if (has(u, 'windcleaverSkill') && w.type === 'sword' && w.maxRange === 1) r += 1;
  if (w.id === 'masterSword') {
    const tr = wildTraits(u);
    if (tr.includes('swordBeam') && (u.hp >= u.stats.hp || u.gear.body === 'championsLeathers')) r += 3;
  }
  if (w.wild?.includes('spellRange')) r += 0;
  return r;
}

/** Defense and hit tweaks: charged attacks, piercing ancient energy, sacred light, extra heads. */
export function wildSideAdjust(b: Battle, atk: Unit, def: Unit, w: WeaponDef, arrow: AbilityDef | undefined, defense: number, magical: boolean, initiating: boolean): { defense: number; hit: number; extraAttack: boolean } {
  const out = { defense, hit: 0, extraAttack: false };
  if (arrow?.id === 'chargedAttack' && w.twoHanded) out.defense = Math.floor(defense * 0.75);
  if (arrow?.id === 'chargedAttack' && w.type === 'lance') out.extraAttack = true;
  if (w.id === 'guardianSwordPlus' && magical) out.defense = Math.floor(defense * 0.85);
  if (magical && (has(atk, 'lightOfTheZonaiSkill') && (w.element === 'light'))) out.defense = Math.floor(out.defense * 0.7);
  if (initiating && (has(atk, 'threeHeads') || has(atk, 'tripleMagma') || has(atk, 'elementalHeads'))) out.extraAttack = true;
  if (initiating && w.wild?.includes('repeatedCut')) out.hit += 0;
  if (hasBuff(def, 'timeSlow')) out.hit += 10;
  void b;
  return out;
}

/** Damage multipliers. */
export function wildMultiplier(b: Battle, atk: Unit, def: Unit, element: Element | undefined, magical: boolean, w: WeaponDef, dist: number, arrow?: AbilityDef): number {
  let mult = 1;
  const physical = !magical;
  const sacred = element === 'light' || !!w.sacredMult;
  const dtr = wildTraits(def);
  const atr = wildTraits(atk);
  const ancientFoe = mechanical(def) || unitTags(def).includes('ancient');
  // ── Weapon effects ──
  const fx = w.wild ?? [];
  if (fx.includes('vsAncient') && ancientFoe) mult *= 1.5;
  if (fx.includes('vsGuardian') && def.race === 'guardian') mult *= 1.5;
  if (fx.includes('vsStone') && unitTags(def).includes('stone')) mult *= 1.5;
  if (fx.includes('vsWood') && unitTags(def).includes('plant')) mult *= 1.3;
  if (fx.includes('wetDouble') && (b.weather?.kind === 'rain' || tilesOf(b, atk).some((t) => WATERY.includes(t)))) mult *= 1.6;
  if (fx.includes('aquatic') && tilesOf(b, atk).concat(tilesOf(b, def)).some((t) => WATERY.includes(t))) mult *= 1.25;
  if (fx.includes('criticalHp') && atk.hp <= atk.stats.hp * 0.25) mult *= 1.5;
  if (fx.includes('nearBreakingDouble')) { const left = usesLeft(atk, w.id); if (left !== null && left <= Math.max(3, (w.uses ?? 20) * 0.25)) mult *= 2; }
  if (fx.includes('sneakBonus') && (atk.hidden || hasStatus(atk, 'veiled') || !def.attacked)) mult *= 1.5;
  if (fx.includes('windSlash') && dist >= 2) mult *= 0.5;
  if (fx.includes('bone') && atr.includes('boneDmg')) mult *= 1.3;
  if (w.shots && w.shots > 1) mult *= 1 + 0.5 * (w.shots - 1);
  if (arrow?.id === 'chargedAttack') {
    if (w.type === 'lance') mult *= 0.7;
    if (fx.includes('chargedBonus')) mult *= 1.25;
    if (w.twoHanded) mult *= 1.1;
  }
  // ── Traits ──
  if (atr.includes('ancientDmg') && (fx.includes('ancientDamage') || w.type === 'siege')) mult *= 1.25;
  if (atr.includes('vsArmored') && (unitTags(def).includes('armor') || CLASSES[def.classId]?.moveType === 'armor' || mechanical(def))) mult *= 1.25;
  if (sacred) mult *= 1 + 0.05 * traitCount(atk, 'sacredBoost') + (atr.includes('sacredAspect') ? 0.25 : 0);
  if (element && atr.includes(`secret:${element === 'dark' ? 'dark' : element}`)) mult *= 1.25;
  if (element && element !== 'light' && atr.includes('elementDmg')) mult *= 1.2;
  if (physical && dtr.includes('physGuard')) mult *= 0.85;
  if (physical && dtr.includes('physRes')) mult *= 0.9;
  if (dtr.includes('guardianRes') && mechanical(atk)) mult *= Math.max(0.4, 1 - 0.15 * traitCount(def, 'guardianRes'));
  if (element === 'fire') { if (dtr.includes('fireImmune') || hasBuff(def, 'wt:fireImmune')) mult *= 0.5; else if (dtr.includes('flameRes')) mult *= 0.75; }
  if (element === 'ice' && (dtr.includes('coldRes') || hasBuff(def, 'wt:coldRes'))) mult *= 0.75;
  if (element === 'lightning') { if (dtr.includes('lightningImmune') || dtr.includes('shockImmune')) mult *= 0.25; else if (dtr.includes('shockRes') || hasBuff(def, 'wt:shockRes')) mult *= 0.5; }
  if (element === 'dark' && dtr.includes('shadowRes')) mult *= 0.8;
  if ((element === 'water' || fx.includes('windGust')) && dtr.includes('windWaterRes')) mult *= 0.75;
  // ── Sacred light against Malice, Gloom and corruption ──
  if (sacred && corruptedFoe(def)) mult *= 1.5;
  if (sacred && has(atk, 'lightOfTheZonaiSkill') && (def.gloom ?? 0) > 0) mult *= 1.3;
  if (sacred && has(atk, 'awakeningPower')) mult *= 1 + Math.min(0.4, (b.wild?.alliesHurt ?? 0) * 0.04);
  // ── Corrupted machines hit harder ──
  if (atk.wildCorrupt || (atk.team === 'player' && b.bonus === 'calamityCorruption' && mechanical(atk))) mult *= 1.15;
  // ── Defender skills ──
  if (has(def, 'hatredUnleashed') && !sacred && !hasStatus(def, 'exposed')) mult *= 0.25;
  if (has(def, 'hatredUnleashed') && sacred) mult *= 1.5;
  if (has(def, 'livingOre') && !hasStatus(def, 'exposed') && !(w.type === 'hammer' || w.armorBreaker || w.bombs)) mult *= 0.5;
  if (has(def, 'armoredLegs') && (b.wild?.hits[def.uid] ?? 0) < 3) mult *= 0.5;
  if (has(def, 'resistsCutting') && ['sword', 'lance', 'axe'].includes(w.type)) mult *= 0.5;
  if (has(def, 'resistsCutting') && (w.type === 'hammer' || w.bombs)) mult *= 2;
  if (has(def, 'reinforcedBody') && physical && !element) mult *= 0.85;
  if (has(def, 'fireBlight') && b.turn % 2 === 0 && (w.type === 'bow' || w.type === 'sling')) mult = 0;
  if (has(def, 'windBlight') && dist >= 3) mult *= 0.7;
  if (has(def, 'seismicDominion') && element === 'lightning') mult *= 0.5;
  if (has(def, 'shiftingCore') && dist <= 1 && ((b.turn + atk.uid.length) % 2 === 0)) mult *= 0.4;
  if (def.wildSeg && def.wildSeg > 0) mult *= 0.75;
  if (hasBuff(def, 'gerudoCounter') && dist <= 1) mult *= 0.5;
  if (hasBuff(atk, 'gerudoCounter') && dist <= 1) mult *= 1.5;
  // Gibdo's hardened husk (TotK): physical damage halved until an elemental hit breaks it.
  if ((def.artId === 'gibdo' || tid(def) === 'gibdo') && !def.turnUses?.huskBroken) { if (element && element !== 'light') (def.turnUses ??= {}).huskBroken = 1; else if (physical) mult *= 0.5; }
  // Royal Protector: Buliara guards Gerudo leaders next to her.
  if (b.units.some((a) => a.team === def.team && a !== def && has(a, 'royalProtectorWild') && unitDist(a, def) <= 1) && def.race === 'gerudo' && (def.isCommander || ['riju', 'urbosa', 'nabooru', 'ganondorfWild'].includes(tid(def)))) mult *= 0.75;
  // Attacker skills
  if (has(atk, 'targetLock') && b.wild?.locks[atk.uid] === def.uid) mult *= 1.5;
  if (has(atk, 'skySerpent') && moveTypeOf(def) === 'flying') mult *= 1.5;
  if (has(atk, 'seismicHunter') && (def.movedDist ?? 0) >= 3) mult *= 1.25;
  if (hasBuff(atk, 'autopilot')) mult *= 0.5;
  if (atk.wildDisabled) mult = 0;
  // ── Commander bonuses ──
  if (atk.team === 'player') {
    if (b.bonus === 'sacredResearch' && sacred) mult *= 1.25;
    if (b.bonus === 'gerudoLightning' && element === 'lightning') mult *= 1.25;
    if (b.bonus === 'goronMining' && (w.type === 'hammer') && unitTags(def).includes('stone')) mult *= 1.25;
  }
  if (def.team === 'player' && b.bonus === 'goronGuard' && physical) mult *= 0.85;
  // ── Group supports ──
  const groups = atk.team === 'player' ? b.groupSupports ?? [] : [];
  if (groups.includes('gerudoLegacy') && ['nabooru', 'urbosa', 'riju'].includes(tid(atk)) && element === 'lightning') mult *= 1.25;
  if (groups.includes('goronChampions') && ['darunia', 'darmani', 'darbus', 'daruk', 'yunobo'].includes(tid(atk)) && (w.type === 'hammer' || w.twoHanded)) mult *= 1.2;
  if (groups.includes('demonKings') && ['demise', 'ganondorf', 'ganondorfWW', 'ganondorfTP', 'ganondorfWild', 'demonDragon'].includes(tid(atk)) && element === 'dark') mult *= 1.25;
  if (groups.includes('yigaEngineeringDivision') && w.type === 'siege') mult *= 1.2;
  if (groups.includes('threeSacredDragons') && ['dinraal', 'naydra', 'farosh'].includes(tid(atk)) && element) mult *= 1.1;
  return mult;
}

/** Damage as it lands: Daruk's Protection, water barriers, Perfect Guard and reflected lasers, Perfect Evasion, Mystic armor. */
export function wildOnStrike(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, rng: RNG, blocked = false): { dmg: number; line?: string } {
  if (dmg <= 0 || !w) return { dmg };
  const pts = target.turnUses?.wildShield ?? 0;
  if (pts > 0 && hasBuff(target, 'wildShield')) {
    const absorbed = Math.min(dmg, pts);
    target.turnUses!.wildShield = pts - absorbed;
    if (pts - absorbed <= 0) target.buffs = target.buffs.filter((x) => x.id !== 'wildShield');
    return { dmg: dmg - absorbed, line: `${target.name}'s barrier absorbs ${absorbed}.` };
  }
  const dist = unitDist(by, target);
  const melee = dist <= 1 && !isMagical(w.type) && !w.magicContact;
  if (hasBuff(target, 'perfectEvasion') && melee) {
    target.buffs = target.buffs.filter((x) => x.id !== 'perfectEvasion');
    const back = Math.min(by.hp - 1, Math.max(1, effectiveStats(target).str + (WEAPONS[target.weapons[0]]?.might ?? 0) - effectiveStats(by).def));
    if (back > 0) by.hp -= back;
    return { dmg: 0, line: `${target.name} evades perfectly and strikes back (${back})!` };
  }
  if (hasBuff(target, 'waterBarrier')) { target.buffs = target.buffs.filter((x) => x.id !== 'waterBarrier'); return { dmg: 0, line: `${target.name}'s water barrier bursts, blocking the attack.` }; }
  // Daruk's Protection
  const daruk = [target, ...alliesOf(b, target)].find((a) => (a.wildCharges?.daruksProtection ?? 0) > 0 && unitDist(a, target) <= 1);
  if (daruk) { daruk.wildCharges!.daruksProtection--; return { dmg: 0, line: `Daruk's Protection blocks the blow! (${daruk.wildCharges!.daruksProtection} left)` }; }
  // Perfect Guard (shields): parry completely, reflecting projectiles.
  const sh = target.gear.shield ? GEAR[target.gear.shield] : undefined;
  const shieldUp = !!sh && !WEAPONS[target.weapons[0]]?.twoHanded;
  if (shieldUp) {
    const fx = sh!.wildFx ?? [];
    const pg = has(target, 'perfectGuard') ? 20 + Math.floor(effectiveStats(target).skl / 4) : 0;
    const chance = pg ? pg + (fx.includes('enhancedParry') ? 20 : 0) + (fx.includes('perfectTiming') ? 15 : 0) : 0;
    const laser = /laser|beam|Laser|Beam/.test(w.id) || w.magicContact;
    const autoReflect = blocked && laser && (fx.includes('autoReflect') || (fx.includes('reflectStrong') && w.might > 12) || (fx.includes('reflectWeak') && w.might <= 12));
    if ((chance && rng.chance(chance)) || autoReflect) {
      const reflect = dist >= 2 || laser ? Math.min(by.hp - 1, Math.floor(dmg / 2)) : 0;
      if (reflect > 0) by.hp -= reflect;
      if (fx.includes('spiked') || fx.includes('contactDmg')) by.hp = Math.max(1, by.hp - (fx.includes('contactDmg') ? 5 : 3));
      return { dmg: 0, line: `${target.name} ${autoReflect ? 'reflects the laser' : 'Perfect Guards'}${reflect ? ` — ${reflect} back at ${by.name}` : ''}!` };
    }
  }
  // Mystic armor: part of the damage is paid in Rupees.
  if (target.team === 'player' && hasTrait(target, 'rupeeShield') && b.rewardRupees + (b.bonusRupees ?? 0) > dmg * 3) {
    const paid = Math.floor(dmg / 4);
    b.bonusRupees = (b.bonusRupees ?? 0) - paid * 3;
    return { dmg: dmg - paid };
  }
  return { dmg };
}

/** Death prevention: Mipha's Grace, Divine Beasts disabled rather than destroyed, a Stalnox's detached eye. */
export function wildSaveFromDeath(b: Battle, target: Unit, by?: Unit): { line: string; heal: number } | null {
  const grace = [target, ...alliesOf(b, target)].find((a) => (a.wildCharges?.miphasGrace ?? 0) > 0 && unitDist(a, target) <= 3);
  if (grace) {
    grace.wildCharges!.miphasGrace--;
    const big = target.team === 'player' && (b.groupSupports ?? []).includes('championsOfHyrule');
    return { line: `Mipha's Grace! ${target.name} is restored.`, heal: Math.ceil(target.stats.hp * (big ? 1 : 0.4)) };
  }
  if (has(target, 'detachedEye') && !target.turnUses?.eyeOut) {
    (target.turnUses ??= {}).eyeOut = 1;
    addStatus(target, 'exposed', 2);
    return { line: `${target.name}'s eye detaches — destroy it!`, heal: 0 };
  }
  if (has(target, 'divineBeastSystems') && target.team === 'player' && !target.wildDisabled) {
    target.wildDisabled = true;
    return { line: `${target.name} is disabled, but not destroyed.`, heal: 0 };
  }
  if ((has(target, 'reassemble')) && !target.usedAbilities?.includes('reassemble') && !(by && (WEAPONS[by.weapons[0]]?.type === 'hammer' || WEAPONS[by.weapons[0]]?.element === 'light'))) {
    (target.usedAbilities ??= []).push('reassemble');
    return { line: `${target.name} pulls itself back together!`, heal: Math.ceil(target.stats.hp * 0.25) };
  }
  return null;
}

/** After a damaging hit: Gloom, Malice, reactions, fusion wear, Urbosa's Fury, Riju's field, segments. */
export function wildAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element: Element | undefined, rng: RNG, arrow?: AbilityDef): string[] {
  const lines: string[] = [];
  if (!w) return lines;
  const st = b.wild ?? (isWildWorld(b) || dmg > 0 ? wildState(b) : undefined);
  if (st && w) st.lastWeapon[by.uid] = w.id;
  if (has(by, 'elementalHeads')) (by.turnUses ??= {}).headCycle = (by.turnUses.headCycle ?? 0) + 1;
  if (by.msEnergy !== undefined && w.id === 'masterSword') {
    by.msEnergy--;
    if (by.msEnergy <= 0 && !hasBuff(by, 'msDrained')) { buff(by, 'msDrained', 'Master Sword resting', 99); lines.push(`${by.name}'s Master Sword runs out of energy and needs to recharge.`); }
  }
  if (by.arrowFuse && w.type === 'bow') { if (--by.arrowFuse.shots <= 0) delete by.arrowFuse; }
  if (by.tempFuse && !isMagical(w.type) && w.type !== 'bow') { if (--by.tempFuse.strikes <= 0) delete by.tempFuse; }
  // Single-use fused materials break after one attack (Forest Dweller's weapons may regrow them).
  const fz = fuseOf(by.fused?.[w.id]);
  if (fz?.single && by.team === 'player' && !(w.wild?.includes('regrowFuse') && rng.chance(40))) { lines.push(`${by.name}'s fused ${fz.name} shatters.`); delete by.fused![w.id]; }
  if (dmg <= 0 || target.hp <= 0) return lines;
  if (st && target.team === 'player') st.alliesHurt++;
  // Gloom and Malice
  const gloomy = w.wild?.includes('gloomHit') || w.wild?.includes('gloomBoth') || has(by, 'demonKingsDominionWild') || has(by, 'gloomGrasp') || has(by, 'eternalCalamity');
  if (gloomy) {
    const g = addGloom(b, target, Math.max(2, Math.ceil(dmg * 0.25)), by);
    if (g) lines.push(`${target.name} is Gloomed (−${g} max HP).`);
    if (w.wild?.includes('gloomBoth')) addGloom(b, by, 1);
  }
  if (w.wild?.includes('malice') && rng.chance(b.bonus === 'calamityCorruption' && by.team === 'player' ? 80 : 40)) addStatus(target, 'malice', 2);
  if (element === 'light' && hasStatus(target, 'malice')) target.statuses = target.statuses.filter((s) => s.kind !== 'malice');
  // Weapon effects
  if ((w.wild?.includes('knockback') || w.wild?.includes('windGust')) && target.size <= by.size && !hasTrait(target, 'windRes') && !hasBuff(target, 'zonaiStake')) pushAway(b, target, by, 1);
  if (w.wild?.includes('disarms') && hasStatus(target, 'shock') && rng.chance(30)) { const lost = disarm(b, target); if (lost) lines.push(`${target.name} drops their weapon!`); }
  if (w.wild?.includes('clearsSludge')) react(b, target, 'water', by);
  if (w.wild?.includes('sludgeSpray') || has(by, 'sludgeForm')) for (const p of footprint(target.x, target.y, target.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain') setTimed(b, k, 'sludge', 3); }
  // Elemental reactions on the target's space
  if (element) lines.push(...react(b, target, element, by, w.splash || w.wild?.includes('wideElement') ? 1 : 0));
  if (element === 'lightning') { const arc = conductMetal(b, target, by); if (arc) lines.push(arc); }
  if (element && by.team === 'player' && (b.groupSupports ?? []).includes('threeSacredDragons') && ['dinraal', 'naydra', 'farosh'].includes(tid(by))) {
    for (const e of b.units.filter((x) => x.team === target.team && x !== target && unitDist(x, target) <= 1 && x.hp > 1)) e.hp = Math.max(1, e.hp - Math.ceil(dmg * 0.3));
  }
  // Fire Sage's Vow: rolling attacks smash obstacles next to the target.
  if (has(by, 'fireSagesVow') && (w.momentum || w.id === 'yunoboRoll')) lines.push(...breakAround(b, target, 1));
  // Riju's lightning field: allied projectiles call down lightning.
  if (st && w && (w.type === 'bow' || w.type === 'sling' || w.type === 'boomerang' || w.maxRange >= 2) && unitDist(by, target) >= 2) {
    const f = st.fields.find((x) => x.team === by.team && footDist(x.x, x.y, 1, target.x, target.y, target.size) <= x.r);
    if (f && target.hp > 1) { const d = Math.min(target.hp - 1, 8); target.hp -= d; addStatus(target, 'shock', 1); lines.push(`Lightning strikes ${target.name} in the field (${d})!`); }
  }
  // Divine Beast armor segments break under big hits.
  if (target.wildSeg && dmg >= target.stats.hp * 0.1) { target.wildSeg--; lines.push(`An armor segment on ${target.name} breaks (${target.wildSeg} left).`); }
  if (st && (has(target, 'armoredLegs') || has(target, 'hatredUnleashed') || has(target, 'livingOre'))) {
    st.hits[target.uid] = (st.hits[target.uid] ?? 0) + 1;
    if (has(target, 'hatredUnleashed') && st.hits[target.uid] % 3 === 0) { addStatus(target, 'exposed', 1); lines.push(`A Malice weak point opens on ${target.name}!`); }
    if (has(target, 'livingOre') && st.hits[target.uid] === 2) { addStatus(target, 'exposed', 3); lines.push(`${target.name}'s ore is exposed!`); }
    if (has(target, 'armoredLegs') && st.hits[target.uid] === 3) { addStatus(target, 'exposed', 99); lines.push(`${target.name}'s legs break!`); }
  }
  if (has(by, 'targetLock') && st) st.locks[by.uid] = target.uid;
  if (has(target, 'rupeeSpirit')) b.bonusRupees = (b.bonusRupees ?? 0) + 20;
  if (has(target, 'moltenSurface') && unitDist(by, target) <= 1 && !hasTrait(by, 'fireImmune') && !hasTrait(by, 'flameRes')) { by.hp = Math.max(1, by.hp - 5); if (rng.chance(50)) addStatus(by, 'burn', 2); }
  if ((has(target, 'frozenSurface') || has(target, 'chillingContact')) && unitDist(by, target) <= 1 && !hasTrait(by, 'coldRes') && rng.chance(30)) addStatus(by, 'freeze', 1);
  if (has(target, 'burningContact') && unitDist(by, target) <= 1 && !hasTrait(by, 'flameRes') && rng.chance(30)) addStatus(by, 'burn', 2);
  if (has(target, 'lightningFortress') && unitDist(by, target) <= 1) { by.hp = Math.max(1, by.hp - 6); addStatus(by, 'shock', 1); }
  // Urbosa's Fury: charged melee attacks release lightning.
  if ((arrow?.id === 'chargedAttack' || arrow?.id === 'thunderSlash') && (by.wildCharges?.urbosasFury ?? 0) > 0 && unitDist(by, target) <= 1) {
    by.wildCharges!.urbosasFury--;
    const r = 3 + (by.team === 'player' && b.bonus === 'lightningFields' ? 1 : 0);
    const mag = effectiveStats(by).mag;
    let n = 0;
    for (const e of foesOf(b, by)) if (unitDist(by, e) <= r && e.hp > 1) { const d = Math.min(e.hp - 1, Math.max(1, mag + 6 - effectiveStats(e).res)); e.hp -= d; addStatus(e, 'shock', 1); n++; }
    lines.push(`Urbosa's Fury! Lightning strikes ${n} enem${n === 1 ? 'y' : 'ies'}. (${by.wildCharges!.urbosasFury} left)`);
  }
  if (arrow?.id === 'chargedAttack' && w.wild?.includes('windBlade')) {
    const behind = b.units.filter((e) => e.team === target.team && e !== target && unitDist(e, target) === 1 && e.hp > 1).slice(0, 2);
    for (const e of behind) e.hp = Math.max(1, e.hp - Math.floor(dmg / 2));
    if (behind.length) lines.push('Wind blades cut through!');
  }
  return lines;
}

/** After combat: charged spin attacks, the aerial carrier's bomb. */
export function wildAfterCombat(b: Battle, attacker: Unit, defender: Unit, arrowId: string | null, landed: { atk: number; def: number }): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const hit = (me: Unit, foe: Unit, d: number) => {
    if (foe.hp <= 1 || me.hp <= 0 || d <= 0) return;
    d = Math.min(foe.hp - 1, d);
    foe.hp -= d;
    out.push({ uid: foe.uid, dmg: d, hp: foe.hp, killed: false, by: me.uid });
  };
  const w = WEAPONS[attacker.weapons[0]];
  if (arrowId === 'chargedAttack' && landed.atk > 0 && w?.type === 'sword' && !w.twoHanded) {
    for (const e of b.units.filter((x) => x.team !== attacker.team && x !== defender && unitDist(attacker, x) <= 1)) hit(attacker, e, Math.floor(landed.atk / 2));
  }
  if ((attacker.wildCharges?.aerialCarrier ?? 0) > 0 && landed.atk > 0) {
    attacker.wildCharges!.aerialCarrier--;
    for (const e of b.units.filter((x) => x.team !== attacker.team && unitDist(defender, x) <= 1)) hit(attacker, e, 8);
  }
  if (has(defender, 'spinningLasers') && landed.atk > 0 && unitDist(attacker, defender) <= 1 && defender.hp > 0) {
    for (const e of b.units.filter((x) => x.team !== defender.team && unitDist(defender, x) <= 1)) hit(defender, e, 4);
  }
  return out;
}

/** Flurry Rush: dodging a melee attack sets up a flurry. */
export function wildCanParry(u: Unit, w: WeaponDef | undefined, dist: number, _rng: RNG): 'flurry' | null {
  if (!w || u.hp <= 0 || dist > 1 || isMagical(w.type) || w.magicContact) return null;
  return has(u, 'flurryRush') ? 'flurry' : null;
}

/** Flurry Rush strikes by weapon type (each strike at reduced damage). */
export function wildFlurry(_u: Unit, w: WeaponDef | undefined): { blows: number; factor: number } {
  const bonus = w?.wild?.includes('flurryBonus') ? 0.1 : 0;
  if (!w || w.type === 'natural') return { blows: 3, factor: 0.4 + bonus };
  if (w.type === 'lance') return { blows: 5, factor: 0.3 + bonus };
  if (w.twoHanded) return { blows: 2, factor: 0.6 + bonus };
  if (w.type === 'sword') return { blows: 4, factor: 0.35 + bonus };
  return { blows: 3, factor: 0.4 + bonus };
}

/** On a kill: materials, spoils, Divine Beasts captured, cargo spilled out. */
export function wildOnKill(b: Battle, by: Unit, victim: Unit, rng: RNG) {
  // Passengers spill out of a destroyed transport.
  for (const c of victim.cargo ?? []) {
    const spot = nearFree(b, c, victim, 3);
    if (spot) { Object.assign(c, { x: spot.x, y: spot.y, moved: true, acted: true }); b.units.push(c); }
  }
  victim.cargo = [];
  if (victim.team !== 'enemy' || victim.summoned) return;
  const st = b.wild ?? (isWildWorld(b) ? wildState(b) : undefined);
  const id = victim.bossId ?? victim.artId ?? victim.templateId ?? '';
  // A beaten Divine Beast is disabled, not destroyed: it joins you after a victory.
  if (has(victim, 'divineBeastSystems')) {
    const t = victim.templateId ?? BOSS_AS_TEMPLATE[victim.bossId ?? ''] ?? victim.artId;
    if (t && TEMPLATES[t]) (b.purified ??= []).push({ ...victim, templateId: t });
  }
  if (!st) return;
  const mats = MATERIAL_DROPS[id];
  const tier = victim.wildTier ?? 0;
  if (mats?.length) {
    const n = (victim.isBoss ? 2 : 1) + (st.bloodMoon ? 1 : 0) + (tier >= 3 ? 1 : 0);
    for (let i = 0; i < n; i++) if (rng.chance(victim.isBoss ? 100 : 55)) st.materials.push(mats[Math.min(mats.length - 1, tier >= 1 && i === 0 ? Math.min(tier, mats.length - 1) : rng.int(0, mats.length - 1))]);
  }
  if (tier >= 1 && /bokoblin/i.test(id)) st.materials.push(['bokoblinHorn', 'blueBokoblinHorn', 'blackBokoblinHorn', 'silverBokoblinHorn', 'silverBokoblinHorn'][tier]);
  const spoil = SPOILS[id];
  if (spoil && ITEMS[spoil] && rng.chance(20)) (b.loot ??= []).push(spoil);
  if (victim.isBoss && TIERED.has(id) || (victim.isBoss && rng.chance(40))) st.materials.push('monsterMedal');
  void by;
}

/** Combat experience multiplier. */
export function wildXpMult(b: Battle, u: Unit): number {
  let m = 1;
  if (WEAPONS[u.weapons[0]]?.wild?.includes('proficiencyXp')) m *= 1.3;
  if (has(u, 'ancientMemory') && (['centralHyrule', 'hyruleCastleWild', 'akkala', 'greatPlateau', 'greatSkyIsland', 'skyArchipelago', 'finalTrial'].includes(b.world))) m *= 1.3;
  return m;
}

/** Sooga's Unwavering Loyalty: he takes hits meant for Master Kohga. */
export function wildInterceptor(_b: Battle, p: Unit, target: Unit): boolean {
  return has(p, 'unwaveringLoyalty') && ['kohga', 'kohgaBoss'].includes(tid(target)) && unitDist(p, target) <= 2;
}

/** Healing multipliers (Zora Royal Family, the Champions' water). */
export function wildHealMult(b: Battle, healer: Unit, target: Unit): number {
  let m = 1;
  const groups = target.team === 'player' ? b.groupSupports ?? [] : [];
  if (groups.includes('zoraRoyalFamily') && canSwim(target) && b.units.some((a) => a.team === 'player' && ['dorephan', 'mipha', 'sidon', 'yona'].includes(tid(a)) && unitDist(a, target) <= 2)) m *= 1.25;
  if (groups.includes('ancientAndModernTech') && mechanical(target)) m *= 1.3;
  void healer;
  return m;
}

/** After healing: Yona's Compassionate Care lifts one more harmful status. */
export function wildAfterHeal(_b: Battle, healer: Unit, target: Unit) {
  if (!has(healer, 'compassionateCare')) return;
  for (let i = 0; i < 2; i++) {
    const bad = target.statuses.findIndex((x) => !STATUS_INFO[x.kind].good);
    if (bad >= 0) target.statuses.splice(bad, 1);
  }
}

/** Stamina multiplier: Champion's Arsenal, Royal Guard, Barbarian and Fierce Deity sets. */
export function wildStaminaMult(u: Unit, aId?: string): number {
  let m = 1;
  if (has(u, 'championsArsenal')) {
    const cats = new Set(u.weapons.map((id) => WEAPONS[id]?.type).filter((t) => t && t !== 'natural'));
    m *= Math.max(0.7, 1 - 0.1 * Math.max(0, cats.size - 1));
  }
  const tr = wildTraits(u);
  if (tr.includes('staminaThrift')) m *= 0.7;
  if (aId === 'chargedAttack' && tr.includes('chargedThrift')) m *= 0.5;
  return m;
}

// ───────────────────────── Abilities ─────────────────────────

const WILD_IDS = new Set(Object.values(ABILITIES).filter((a) => a.wild).map((a) => a.id));
/** Enemy abilities used on their own when ready. */
export const WILD_ENEMY_AUTO = ['calamityForm', 'demonDragonForm', 'phantomLegion', 'mazDuplicates', 'mazGiantForm', 'sludgeSurge'];
const SACRED = new Set(['sealingLight', 'sacredProtection', 'lightOfRestoration', 'recallBlessing', 'sacredBreathAbility', 'healingWind', 'restorativeScales', 'sacredBeam', 'lightBarrier', 'divineArmAbility', 'royalSeal', 'soniasRecall', 'temporalRestoration', 'timeBarrier', 'sacredGuidance']);
export const WILD_SACRED_ABILITIES = SACRED;

export function isWildAbility(def: AbilityDef): boolean { return WILD_IDS.has(def.id) && !!def.wild; }
export function wildNeedsTile(def: AbilityDef): boolean { return isWildAbility(def) && def.wild!.target === 'tile'; }
export function wildNeedsTarget(def: AbilityDef): boolean { return isWildAbility(def) && (def.wild!.target === 'foe' || def.wild!.target === 'ally'); }

const MOVABLE = new Set<Terrain>(['fallenLog', 'floatingPlatform', 'fallingRuin', 'explosiveBarrel']);
const HIGH = new Set<Terrain>(['mountain', 'climbableCliff', 'wetCliff', 'tallTree', 'sheikahTower', 'skyviewTower', 'monsterLookout', 'fort', 'floatingIsland', 'ascendPillar']);

export function wildTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const s = def.wild!;
  const [min, max] = s.range ?? [1, 1];
  const out: Pos[] = [];
  const inRange = tilesInRange(b, u, Math.max(1, min), max, u.size);
  switch (def.id) {
    case 'cryonis': for (const p of inRange) if (WATERY.includes(tileAt(b, p.x, p.y)!) && !unitAt(b, p.x, p.y)) out.push(p); break;
    case 'ascend': for (const p of inRange) if ((HIGH.has(tileAt(b, p.x, p.y)!) || tilesInRange(b, p, 1, 1, 1).some((q) => tileAt(b, q.x, q.y) === 'wall')) && free(b, u, p.x, p.y)) out.push(p); break;
    case 'ultrahand': if (adjacentTile(b, u, MOVABLE)) for (const p of inRange) if (['water', 'chasm', 'lava', 'plain', 'sludge', 'gloom'].includes(tileAt(b, p.x, p.y)!) && !unitAt(b, p.x, p.y)) out.push(p); break;
    case 'deployTroops': { const c = u.cargo?.[0]; if (c) for (const p of tilesInRange(b, u, 1, 1, u.size)) if (free(b, c, p.x, p.y)) out.push(p); break; }
    case 'autobuild': for (const p of tilesInRange(b, u, 1, 1, u.size)) if (tileAt(b, p.x, p.y) === 'plain' && !unitAt(b, p.x, p.y)) out.push(p); break;
    case 'rockBreaker': case 'mineOre': for (const p of tilesInRange(b, u, 1, 1, u.size)) if (['cracked', 'oreDeposit', 'rareOre', 'luminousOre', 'zonaiteDeposit', 'explosiveBarrel', ...(def.id === 'rockBreaker' ? ['wall', 'iceBlock'] : [])].includes(tileAt(b, p.x, p.y) ?? '')) out.push(p); break;
    default: for (const p of inRange) out.push(p);
  }
  return out;
}

const adjacentTile = (b: Battle, u: Unit, set: Set<Terrain>) => tilesInRange(b, u, 1, 1, u.size).find((p) => set.has(tileAt(b, p.x, p.y)!));

export function wildTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  const s = def.wild!;
  const [min, max] = s.range ?? [1, 1];
  const inR = (x: Unit) => { const d = unitDist(u, x); return d >= min && d <= max; };
  if (s.target === 'foe') {
    let list = foesOf(b, u).filter((e) => inR(e) && !e.hidden);
    if (def.id === 'magnesis') list = list.filter((e) => carriesMetal(e) || mechanical(e));
    if (def.id === 'stasis' && !b.owned?.includes('stasisPlus')) list = list.filter((e) => mechanical(e) || e.race === 'zonaiVehicle');
    if (def.id === 'guardianCorruption') list = list.filter((e) => mechanical(e) && !e.isBoss);
    if (def.id === 'recall') list = [...list, ...alliesOf(b, u).filter(inR)].filter((x) => { const p = b.wild?.prevPos[x.uid]; return !!p && (p.x !== x.x || p.y !== x.y) && free(b, x, p.x, p.y); });
    return list;
  }
  let allies = [u, ...alliesOf(b, u)].filter((a) => (a === u ? min === 0 : inR(a)) && !a.captive);
  if (def.id === 'recallBlessing' || def.id === 'soniasRecall') allies = allies.filter((a) => { const p = b.wild?.prevPos[a.uid]; return a !== u && !!p && (p.x !== a.x || p.y !== a.y) && free(b, a, p.x, p.y); });
  if (def.id === 'aquaticRescue') allies = allies.filter((a) => a !== u && a.size === 1 && unitDist(u, a) > 1 && !!nearFree(b, a, u, 1));
  if (def.id === 'constructControl') allies = allies.filter(mechanical);
  if (def.id === 'boardTransport') return alliesOf(b, u).filter((t) => unitDist(u, t) === 1 && isTransport(t) && (t.cargo?.length ?? 0) < capacity(t) && u.size === 1 && !isTransport(u) && !u.isCommander && !u.npc);
  if (def.id === 'revalisGale') allies = allies.filter((a) => !a.isBoss);
  return allies;
}

const has5 = (b: Battle, ids: string[]) => ids.every((id) => b.units.some((x) => tid(x) === id));

export function wildUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isWildAbility(def)) return undefined;
  const s = def.wild!;
  if (s.charges && (u.wildCharges?.[def.id] ?? 0) <= 0) return 'No charges left this battle';
  if (s.belowHp && u.hp > u.stats.hp * s.belowHp) return `Only below ${Math.round(s.belowHp * 100)}% HP`;
  if (wildNeedsTarget(def) && !wildTargets(b, u, def).length) return def.id === 'stasis' ? 'No machine in range (Stasis+ works on anyone)' : 'No one in range';
  if (wildNeedsTile(def) && !wildTiles(b, u, def).length) return def.id === 'ultrahand' ? 'No log, barrel or platform next to you' : def.id === 'cryonis' ? 'No water in range' : 'Nowhere to use it';
  const here = tilesOf(b, u);
  const adj = (t: Terrain) => !!tilesInRange(b, u, 1, 1, u.size).find((p) => tileAt(b, p.x, p.y) === t);
  const used = (t: Terrain) => { const p = tilesInRange(b, u, 0, 1, u.size).find((q) => tileAt(b, q.x, q.y) === t); return !p || wildState(b).used.includes(keyOf(b, p.x, p.y)); };
  switch (def.id) {
    case 'masterCycleZeroRune': return b.owned?.includes('masterCycleRune') ? null : 'Unlock the rune first';
    case 'fuse': return u.pack.some((p) => fuseItem(p.id)) || tilesInRange(b, u, 1, 1, u.size).some((p) => ['mountain', 'fallenLog', 'oreDeposit', 'climbableCliff'].includes(tileAt(b, p.x, p.y) ?? '')) ? null : 'Nothing to fuse';
    case 'autobuild': return blueprintsOwned(b).length ? (wildState(b).energy >= 10 ? null : 'Needs 10 energy') : 'No Autobuild blueprint saved';
    case 'draconification': return Object.values(u.gear).some((g) => g === 'secretStoneLight' || g === 'secretStoneTime') ? (b.turn >= 2 || u.team === 'enemy' ? null : 'The stone needs a turn to wake') : 'Wear the Secret Stone of Light or Time';
    case 'demonDragonForm': return Object.values(u.gear).includes('secretStoneDarkness') || u.team === 'enemy' ? (u.team === 'enemy' && u.hp > u.stats.hp / 2 ? 'Not yet' : TEMPLATES.demonDragon && roomFor(b, u, 5) ? null : 'Not enough room') : 'Wear the Secret Stone of Darkness';
    case 'calamityForm': return TEMPLATES.darkBeastGanonWild && roomFor(b, u, 5) ? null : 'Not enough room';
    case 'spiritTransfer': return u.originalForm ? 'Already in a Construct' : (alliesOf(b, u).some((a) => tid(a) === 'mineruConstruct' && unitDist(a, u) <= 1) || roomFor(b, u, 2)) ? null : 'No Construct nearby and no room to take its form';
    case 'leaveConstruct': return u.originalForm || u.cargo?.some((c) => tid(c) === 'mineru') ? null : 'Mineru isn\'t inside';
    case 'divineBeastLaser': return b.turn >= 3 || hasBuff(u, 'championPilot') ? null : 'Still charging (turn 3)';
    case 'combinedBombardment': return (b.groupSupports ?? []).includes('fourDivineBeasts') || has5(b, ['vahRuta', 'vahRudania', 'vahMedoh', 'vahNaboris']) ? null : 'Needs all four Divine Beasts on the field';
    case 'cookAtPot': return adj('cookingPot') && !u.turnUses?.cooked ? null : 'Stand next to a Cooking Pot';
    case 'solveKorok': return here.includes('korokPuzzle') ? null : 'Stand on a Korok puzzle';
    case 'activateTower': return here.includes('sheikahTower') || here.includes('skyviewTower') ? (used('sheikahTower') && used('skyviewTower') ? 'Already activated' : null) : 'Stand on a tower';
    case 'enterShrine': return (here.includes('shrineEntrance') || here.includes('crystalPedestal')) && !(used('shrineEntrance') && used('crystalPedestal')) ? null : 'Stand on a shrine entrance';
    case 'useDispenser': return adj('deviceDispenser') && !used('deviceDispenser') ? null : 'Stand next to an unused dispenser';
    case 'useTerminal': return adj('zonaiTerminal') && !used('zonaiTerminal') ? null : 'Stand next to an unused Zonai Terminal';
    case 'launchPlatform': return here.includes('launchPlatform') || here.includes('updraft') ? null : 'Stand on a launch platform or updraft';
    case 'mazGiantForm': case 'sludgeSurge': return roomFor(b, u, 3) ? (u.team === 'enemy' && u.hp > u.stats.hp * 0.7 ? 'Not yet' : null) : 'Not enough room';
    case 'phantomLegion': case 'mazDuplicates': return u.team === 'enemy' && u.hp > u.stats.hp * 0.75 ? 'Not yet' : nearFree(b, u, u, 2) ? null : 'No room';
    case 'tidalSlash': return null;
  }
  if (hasBuff(u, 'sacredSeal') && ['draconification', 'demonDragonForm', 'calamityForm', 'spiritTransfer'].includes(def.id)) return 'Sealed: can\'t transform';
  return null;
}

/** Fusable throwables (in battle, with the Zonai Arm's Fuse). */
function fuseItem(id: string): { element?: Element; name: string } | null {
  const map: Record<string, Element | undefined> = { fireFruit: 'fire', iceFruit: 'ice', shockFruit: 'lightning', splashFruit: 'water', dazzlefruit: 'light', bombFlower: undefined, muddleBud: undefined, puffshroom: undefined, brightbloomSeed: 'light', korokFrond: undefined };
  if (!(id in map)) return null;
  return { element: map[id], name: ITEMS[id]?.name ?? id };
}

function blueprintsOwned(b: Battle): string[] {
  return (b.owned ?? []).filter((x) => x.startsWith('blueprint_')).map((x) => x.slice(10)).filter((v) => TEMPLATES[v]);
}

export interface WildOutcome {
  hits: { uid: string; dmg: number; hp: number; killed: boolean; statuses: StatusKind[] }[];
  heals: { uid: string; amount: number }[];
  statuses: { uid: string; kind: StatusKind }[];
  cleansed: string[];
  buffed: string[];
  lines: string[];
  transformed?: string;
  warped?: { from: Pos; to: Pos };
  free?: boolean;
}

/** Strength multiplier for an ability (sacred and Zonai bonuses, Sage boosts, Awakening Power). */
function abilityBoost(b: Battle, u: Unit, def: AbilityDef): number {
  const tags = def.wild?.tags ?? [];
  let m = 1;
  const player = u.team === 'player';
  const groups = player ? b.groupSupports ?? [] : [];
  const sacred = tags.includes('sacred') || SACRED.has(def.id);
  if (sacred && player && b.bonus === 'sacredResearch') m *= 1.25;
  if ((sacred || tags.includes('zonai')) && player && b.bonus === 'kingOfLight') m *= 1.25;
  if ((sacred || tags.includes('zonai')) && groups.includes('foundingOfHyrule') && ['rauruZonai', 'sonia', 'mineru'].includes(tid(u))) m *= 1.25;
  if (sacred && has(u, 'awakeningPower')) m *= 1 + Math.min(0.4, (b.wild?.alliesHurt ?? 0) * 0.04);
  if (tags.includes('sage') && hasTrait(u, 'sageBoost')) m *= 1.2;
  if (tags.includes('lightning') && hasTrait(u, 'secret:lightning')) m *= 1.25;
  if (tags.includes('water') && hasTrait(u, 'secret:water')) m *= 1.25;
  if (tags.includes('fire') && hasTrait(u, 'secret:fire')) m *= 1.25;
  if (tags.includes('wind') && hasTrait(u, 'secret:wind')) m *= 1.25;
  if (sacred && hasTrait(u, 'secret:light')) m *= 1.25;
  if (tags.includes('gloom') && hasTrait(u, 'secret:dark')) m *= 1.25;
  return m;
}

export function castWild(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): WildOutcome | null {
  if (!isWildAbility(def)) return null;
  const s = def.wild!;
  const st = wildState(b);
  const out: WildOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const es = effectiveStats(u);
  const boost = abilityBoost(b, u, def);
  const w = WEAPONS[u.weapons[0]];
  const strike = (e: Unit, dmg: number, status?: { kind: StatusKind; turns: number; chance?: number }) => {
    dmg = Math.min(e.hp, Math.max(0, Math.floor(dmg)));
    if (e.buffs.some((x) => x.barrier)) dmg = 0;
    if (dmg > 0) { const os = wildOnStrike(b, u, e, dmg, w, rng); dmg = os.dmg; if (os.line) out.lines.push(os.line); }
    if (dmg >= e.hp && e.hp > 0) { const sv = wildSaveFromDeath(b, e, u); if (sv) { dmg = e.hp - 1; out.lines.push(sv.line); e.hp -= dmg; e.hp = Math.min(e.stats.hp, e.hp + sv.heal); dmg = -1; } }
    if (dmg >= 0) e.hp -= dmg;
    const killed = e.hp <= 0;
    const statuses: StatusKind[] = [];
    if (!killed && status && rng.chance(status.chance ?? 100)) { addStatus(e, status.kind, status.turns); statuses.push(status.kind); }
    out.hits.push({ uid: e.uid, dmg: Math.max(0, dmg), hp: e.hp, killed, statuses });
    if (dmg > 0) { e.lastHitBy = u.uid; if (e.team === 'player') st.alliesHurt++; }
    if (killed) {
      u.kills++;
      wildOnKill(b, u, e, rng);
      b.units = b.units.filter((x) => x !== e);
      if (!e.summoned) b.fallen.push(e);
      b.log.push(`${u.name} defeated ${e.name}.`);
    }
  };
  const heal = (a: Unit, amt: number) => {
    amt = Math.min(a.stats.hp - a.hp, Math.ceil(amt * (u.team === 'player' ? b.healMult : 1)));
    if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); }
  };
  const damageOf = (e: Unit): number => {
    const d = s.dmg!;
    const stat = d.stat === 'str' ? es.str : d.stat === 'mag' ? es.mag : es.skl;
    const weaponMt = d.weapon ? (w?.might ?? 0) + (w ? wildMight(b, u, w, e, true, unitDist(u, e)) : 0) : 0;
    const base = (d.hits ?? 1) > 1 && !d.weapon ? Math.floor(stat / 2) : stat;
    const ds = effectiveStats(e);
    let vs = d.vs === 'res' ? ds.res : ds.def;
    if (d.pierce) vs = Math.floor(vs * (1 - d.pierce));
    let dmg = (base + d.base + weaponMt - vs) * boost;
    if (d.sacred && corruptedFoe(e)) dmg *= def.id === 'sealingLight' ? 2 : 1.5;
    if (d.element) dmg *= wildMultiplier(b, u, e, d.element, d.vs === 'res', w ?? WEAPONS.fangs, unitDist(u, e));
    if ((d.hits ?? 1) > 1 && d.weapon) dmg *= 0.6;
    return Math.max(1, Math.floor(dmg));
  };
  const applyTo = (e: Unit) => {
    if (s.dmg) for (let i = 0; i < (s.dmg.hits ?? 1) && e.hp > 0; i++) strike(e, damageOf(e), i === 0 ? s.status : undefined);
    else if (s.status && e.team !== u.team) { addStatus(e, s.status.kind, s.status.turns); out.statuses.push({ uid: e.uid, kind: s.status.kind }); }
    if (e.hp > 0 && s.gloom && e.team !== u.team) { const g = addGloom(b, e, s.gloom, u); if (g) out.lines.push(`${e.name} loses ${g} max HP to Gloom.`); }
    if (e.hp > 0 && s.push) pushAway(b, e, u, s.push);
    if (e.hp > 0 && s.buff && e.team !== u.team) buff(e, s.buff.id, s.buff.name, s.buff.turns, s.buff.stats ?? {}, !!s.buff.barrier);
    if (e.hp > 0 && def.id === 'royalSeal') addStatus(e, 'silence', 2);
    if (s.dmg?.element) out.lines.push(...react(b, e, s.dmg.element, u));
  };
  const helpAlly = (a: Unit) => {
    if (s.heal) heal(a, (s.heal.pct ? a.stats.hp * s.heal.pct : 0) + (s.heal.base ?? 0) + (s.heal.stat === 'mag' ? es.mag : 0));
    if (s.buff) { buff(a, s.buff.id, s.buff.name, s.buff.turns, s.buff.stats ?? {}, !!s.buff.barrier); out.buffed.push(a.uid); }
    if (s.status && !s.dmg) { addStatus(a, s.status.kind, s.status.turns); out.statuses.push({ uid: a.uid, kind: s.status.kind }); }
    if (s.shield) { buff(a, 'wildShield', 'Barrier', 2); (a.turnUses ??= {}).wildShield = Math.round(s.shield * boost); out.buffed.push(a.uid); }
    if (s.cleanse) { const n = a.statuses.length; a.statuses = a.statuses.filter((x) => STATUS_INFO[x.kind].good); if (a.statuses.length < n) out.cleansed.push(a.uid); }
    if (s.purify) { const c = cureGloom(a, def.id === 'healingWind' ? 5 : Infinity); a.statuses = a.statuses.filter((x) => x.kind !== 'malice'); if (c) out.lines.push(`${a.name} recovers ${c} max HP from Gloom.`); out.cleansed.push(a.uid); }
    // Sidon's army: water abilities add a water barrier.
    if (u.team === 'player' && b.bonus === 'waterBarriers' && s.tags?.includes('water')) { buff(a, 'wildShield', 'Water Barrier', 2); (a.turnUses ??= {}).wildShield = Math.max(a.turnUses.wildShield ?? 0, 6); }
  };
  const tele = (to: Pos) => { out.warped = { from: { x: u.x, y: u.y }, to: { ...to } }; u.x = to.x; u.y = to.y; };
  const r = (s.radius ?? 0) + (u.team === 'player' && b.bonus === 'lightningFields' && s.tags?.includes('lightning') ? 1 : 0);

  // ── Special cases first ──
  switch (def.id) {
    case 'magnesis': {
      const t = target!;
      const lost = !t.isBoss && carriesMetal(t) ? disarm(b, t) : null;
      if (!lost) pullToward(b, t, u, 2);
      out.lines.push(lost ? `Magnesis rips ${t.name}'s weapon away!` : `Magnesis drags ${t.name} closer.`);
      return out;
    }
    case 'camera': (target!.turnUses ??= {}).analyzed = 1; target!.hidden = false; st.materials.push(`compendium:${tid(target!) || target!.artId}`); out.lines.push(`Snap! ${target!.name} is in the Compendium.`); return out;
    case 'sheikahSensor': case 'eagleEye': case 'ancientKnowledgeMineru': {
      const rr = s.reveal ?? 6;
      let n = 0;
      for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= rr) { e.hidden = false; n++; }
      for (const t of b.traps ?? []) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= rr) { t.hidden = false; n++; }
      const koroks = b.tiles.filter((t) => t === 'korokPuzzle').length;
      out.lines.push(`${n} hidden thing${n === 1 ? '' : 's'} revealed${koroks ? `; ${koroks} Korok puzzle${koroks > 1 ? 's' : ''} nearby` : ''}.`);
      if (def.id === 'eagleEye') for (const a of [u, ...alliesOf(b, u)].filter((a) => unitDist(a, u) <= 3)) { buff(a, 'eagleEye', 'Eagle Eye', 2); out.buffed.push(a.uid); }
      if (def.id === 'ancientKnowledgeMineru') for (const e of foesOf(b, u).filter((e) => mechanical(e) && unitDist(u, e) <= rr)) { addStatus(e, 'exposed', 2); out.statuses.push({ uid: e.uid, kind: 'exposed' }); }
      return out;
    }
    case 'stasis': addStatus(target!, 'stun', 1); out.statuses.push({ uid: target!.uid, kind: 'stun' }); out.lines.push(`${target!.name} is frozen in time.`); return out;
    case 'ancientResearch': addStatus(target!, 'exposed', 3); buff(target!, 'ancientResearchMark', 'Researched', 3); out.statuses.push({ uid: target!.uid, kind: 'exposed' }); out.lines.push(`${u.name} finds ${target!.name}'s weak point.`); return out;
    case 'recall': case 'recallBlessing': case 'soniasRecall': {
      const t = target!;
      const p = st.prevPos[t.uid];
      if (!p) return null;
      out.warped = { from: { x: t.x, y: t.y }, to: { ...p } };
      t.x = p.x; t.y = p.y;
      if (t.team === u.team) { t.moved = false; t.movedDist = 0; }
      out.lines.push(t.team === u.team ? `${t.name} is returned to where the turn began.` : `${t.name}'s movement runs backwards.`);
      return out;
    }
    case 'temporalRestoration': {
      const t = target!;
      const before = st.turnHp[t.uid] ?? t.hp;
      if (before > t.hp) heal(t, before - t.hp);
      helpAlly(t);
      return out;
    }
    case 'aquaticRescue': {
      const t = target!;
      const spot = nearFree(b, t, u, 1);
      if (!spot) return null;
      out.warped = { from: { x: t.x, y: t.y }, to: spot };
      t.x = spot.x; t.y = spot.y;
      helpAlly(t);
      return out;
    }
    case 'guardianCorruption': { const t = target!; t.team = u.team; t.commanded = 2; t.moved = t.acted = true; t.wildCorrupt = true; out.lines.push(`Malice pours into ${t.name}. It turns on its allies!`); return out; }
    case 'fuse': {
      const i = u.pack.findIndex((p) => fuseItem(p.id));
      if (i >= 0) {
        const f = fuseItem(u.pack[i].id)!;
        const bow = u.weapons.some((id) => WEAPONS[id]?.type === 'bow');
        if (bow) u.arrowFuse = { id: u.pack[i].id, shots: 3, element: f.element };
        else u.tempFuse = { might: 3, element: f.element, strikes: 3 };
        if (--u.pack[i].uses <= 0) u.pack.splice(i, 1);
        out.lines.push(`${u.name} fuses ${f.name} onto ${bow ? 'their arrows' : 'their weapon'}.`);
      } else { u.tempFuse = { might: 4, strikes: 99 }; out.lines.push(`${u.name} fuses a rock to their weapon (+4 Might this battle).`); }
      out.free = has(u, 'fusionSpecialist');
      return out;
    }
    case 'ultrahand': {
      const p = adjacentTile(b, u, MOVABLE)!;
      const from = keyOf(b, p.x, p.y);
      const obj = b.tiles[from];
      const to = keyOf(b, at!.x, at!.y);
      b.tiles[from] = 'plain';
      b.tiles[to] = obj === 'explosiveBarrel' ? 'explosiveBarrel' : ['water', 'chasm', 'lava', 'sludge'].includes(b.tiles[to]) ? 'bridge' : 'fallenLog';
      out.lines.push(obj === 'explosiveBarrel' ? 'Ultrahand sets the barrel down.' : 'Ultrahand lays down a makeshift bridge.');
      return out;
    }
    case 'ascend': tele(at!); u.moved = true; u.movedDist += 1; out.lines.push(`${u.name} ascends straight up through the surface.`); out.free = true; return out;
    case 'autobuild': {
      const id = blueprintsOwned(b).sort((a, c) => (VEHICLE_BY_ID[a]?.zonaite ?? 0) - (VEHICLE_BY_ID[c]?.zonaite ?? 0))[0];
      if (!id || !spendEnergy(b, u, 10)) return null;
      const v = prepareForBattle(makeHero(id, `p${b.uidCounter++}`, Math.max(1, u.level - 2), rng));
      if (!free(b, v, at!.x, at!.y)) return null;
      Object.assign(v, { x: at!.x, y: at!.y, team: u.team, summoned: true, moved: true, acted: true, npc: false });
      b.units.push(v);
      out.lines.push(`Autobuild: a ${v.name} assembles itself from Zonai parts.`);
      return out;
    }
    case 'deployTroops': {
      const c = u.cargo?.shift();
      if (!c || !at) return null;
      Object.assign(c, { x: at.x, y: at.y, moved: true, acted: false });
      b.units.push(c);
      if (!u.cargo?.length) u.buffs = u.buffs.filter((x) => x.id !== 'piloted' && x.id !== 'championPilot');
      out.lines.push(`${c.name} disembarks from ${u.name}.`);
      out.free = true;
      return out;
    }
    case 'boardTransport': {
      const t = target!;
      (t.cargo ??= []).push(u);
      b.units = b.units.filter((x) => x !== u);
      u.acted = u.moved = true;
      const PILOTS: Record<string, string[]> = { vahRuta: ['mipha', 'sidon'], vahRudania: ['daruk', 'yunobo'], vahMedoh: ['revali', 'tulin'], vahNaboris: ['urbosa', 'riju'] };
      const champ = PILOTS[tid(t)];
      if (champ?.[0] === tid(u)) { buff(t, 'championPilot', `Piloted by ${u.name}`, 99, { str: 6, mag: 6, skl: 6, mov: 1 }); out.lines.push(`${u.name} takes the controls of ${t.name} — a Champion in her own beast!`); }
      else if (has(t, 'divineBeastSystems') && !hasBuff(t, 'piloted') && !hasBuff(t, 'championPilot')) { buff(t, 'piloted', `Piloted by ${u.name}`, 99, { str: champ?.includes(tid(u)) ? 4 : 2, mag: champ?.includes(tid(u)) ? 4 : 2, skl: 2 }); out.lines.push(`${u.name} pilots ${t.name}.`); }
      else out.lines.push(`${u.name} climbs aboard ${t.name}.`);
      return out;
    }
    case 'spiritTransfer': {
      const host = alliesOf(b, u).find((a) => tid(a) === 'mineruConstruct' && unitDist(a, u) <= 1);
      if (host) {
        (host.cargo ??= []).push(u);
        b.units = b.units.filter((x) => x !== u);
        buff(host, 'possessed', 'Possessed by Mineru', 99, { str: 4, def: 4, skl: 4, mag: Math.floor(es.mag / 2) });
        if (!host.abilities.includes('leaveConstruct')) host.abilities.push('leaveConstruct');
        out.lines.push(`Mineru's spirit flows into the Construct.`);
        return out;
      }
      const before = u.name;
      transformInto(b, u, 'mineruConstruct');
      if (!u.abilities.includes('leaveConstruct')) u.abilities.push('leaveConstruct');
      out.transformed = before;
      out.lines.push('Mineru takes the form of her Construct.');
      return out;
    }
    case 'leaveConstruct': {
      const inner = u.cargo?.find((c) => tid(c) === 'mineru');
      if (inner) {
        const spot = nearFree(b, inner, u, 2);
        if (!spot) return null;
        u.cargo = u.cargo!.filter((c) => c !== inner);
        Object.assign(inner, { x: spot.x, y: spot.y, moved: true, acted: true });
        b.units.push(inner);
        u.buffs = u.buffs.filter((x) => x.id !== 'possessed');
        out.lines.push('Mineru steps out of the Construct.');
        return out;
      }
      if (!u.originalForm) return null;
      const before = u.name;
      Object.assign(u, restoreForm(u));
      out.transformed = before;
      return out;
    }
    case 'draconification': case 'demonDragonForm': case 'calamityForm': {
      const into = def.id === 'draconification' ? 'lightDragon' : def.id === 'demonDragonForm' ? 'demonDragon' : 'darkBeastGanonWild';
      const size = TEMPLATES[into]?.size ?? 5;
      if (!roomFor(b, u, size)) return null;
      const before = u.name;
      const wasBoss = u.isBoss;
      transformInto(b, u, into);
      u.isBoss = wasBoss;
      if (def.id !== 'calamityForm') u.permanentForm = true;
      (u.usedAbilities ??= []).push(def.id);
      out.transformed = before;
      out.lines.push(def.id === 'draconification' ? 'Zelda swallows the Secret Stone. A white dragon rises.' : def.id === 'demonDragonForm' ? '"Behold the power of the Demon King!" Ganondorf swallows his stone.' : 'Calamity Ganon\'s shape collapses into a beast of Malice.');
      return out;
    }
    case 'phantomLegion': case 'mazDuplicates': {
      const id = s.summon!;
      const src = TEMPLATES[id];
      let n = 0;
      for (let i = 0; i < 2; i++) {
        const c = src ? prepareForBattle(makeHero(id, `${u.team === 'player' ? 'p' : 'e'}${b.uidCounter++}`, Math.max(1, u.level - 1), rng)) : null;
        if (!c) break;
        const spot = nearFree(b, c, u, 2);
        if (!spot) break;
        Object.assign(c, { x: spot.x, y: spot.y, team: u.team, summoned: true, ephemeral: true, moved: true, acted: true, ai: 'aggressive', npc: u.team === 'player' });
        if (def.id === 'mazDuplicates') { c.illusionOf = u.uid; c.stats.hp = c.hp = Math.ceil(c.stats.hp / 3); c.name = `${u.name} (duplicate)`; }
        b.units.push(c);
        n++;
      }
      (u.usedAbilities ??= []).push(def.id);
      out.lines.push(n ? `${n} ${def.id === 'phantomLegion' ? 'Phantom Ganondorfs rise from the Gloom' : 'duplicates appear'}!` : 'Nothing answers.');
      return out;
    }
    case 'mazGiantForm': case 'sludgeSurge': {
      if (!roomFor(b, u, 3)) return null;
      u.size = 3; u.wildGiant = true;
      buff(u, 'giantForm', s.buff!.name, 2, s.buff!.stats ?? {});
      if (def.id === 'sludgeSurge') for (const p of tilesInRange(b, u, 1, 2, u.size)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain' || b.tiles[k] === 'water') setTimed(b, k, 'sludge', 4); }
      (u.usedAbilities ??= []).push(def.id);
      out.lines.push(`${u.name} grows enormous!`);
      return out;
    }
    case 'lightningFieldRiju': st.fields.push({ x: u.x, y: u.y, r: r || 2, turns: 2, team: u.team }); out.lines.push(`A field of lightning spreads around ${u.name}.`); return out;
    case 'tidalSlash': {
      const t = target!;
      const charged = hasBuff(u, 'waterBarrier');
      if (charged) u.buffs = u.buffs.filter((x) => x.id !== 'waterBarrier');
      const base = damageOf(t) + (charged ? Math.floor(8 * boost) : 0);
      strike(t, base);
      if (charged) for (const e of b.units.filter((x) => x.team === t.team && x !== t && unitDist(x, t) <= 1)) strike(e, Math.floor(base / 2));
      return out;
    }
    case 'windGust': {
      for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(x, u) <= (r || 3))) {
        if (moveTypeOf(a) === 'flying' || hasBuff(a, 'aerial')) buff(a, 'tulinsGust', "Tulin's Gust", 1, { mov: 4 });
        else { buff(a, 'tulinsGust', "Tulin's Gust", 1, { mov: 2 }); buff(a, 'glide', 'Gliding', 1); }
        out.buffed.push(a.uid);
      }
      for (const p of tilesInRange(b, u, 1, 3, u.size)) react(b, p, 'wind', u);
      return out;
    }
    case 'combinedBombardment': {
      const beasts = b.units.filter((a) => a.team === u.team && ['vahRuta', 'vahRudania', 'vahMedoh', 'vahNaboris'].includes(tid(a)));
      const hit = new Set<Unit>();
      for (const bst of beasts) for (const e of foesOf(b, bst)) if (unitDist(bst, e) <= 5) hit.add(e);
      for (const e of hit) strike(e, Math.floor(es.mag / 2) + 10);
      (u.usedAbilities ??= []).push(def.id);
      out.lines.push('The Four Divine Beasts open fire together!');
      return out;
    }
    case 'rockBreaker': case 'mineOre': {
      const k = keyOf(b, at!.x, at!.y);
      const t = b.tiles[k];
      const bonus = (has(u, 'miningAuthority') ? 1 : 0) + (u.weapons.some((id) => WEAPONS[id]?.wild?.includes('miningYield')) ? 1 : 0) + (u.team === 'player' && b.bonus === 'goronMining' ? 1 : 0) + (hasTrait(u, 'mineralFind') ? 1 : 0);
      if (t === 'explosiveBarrel') out.lines.push(...breakAround(b, at!, 1));
      else { b.tiles[k] = 'plain'; if (t !== 'cracked' && t !== 'wall' && t !== 'iceBlock') { const got = oreLoot(t, bonus); st.materials.push(...got); out.lines.push(`Mined: ${got.map((m) => MATERIAL_BY_ID[m]?.name ?? m).join(', ')}.`); } else out.lines.push('Smashed!'); }
      return out;
    }
    case 'cookAtPot': {
      for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(x, u) <= 1)) {
        heal(a, a.stats.hp * 0.2);
        const bad = a.statuses.findIndex((x) => !STATUS_INFO[x.kind].good);
        if (bad >= 0) { a.statuses.splice(bad, 1); out.cleansed.push(a.uid); }
      }
      (u.turnUses ??= {}).cooked = 1;
      out.lines.push(`${u.name} cooks a quick meal${st.bloodMoon ? ' under the Blood Moon — perfect!' : '.'}`);
      return out;
    }
    case 'solveKorok': { const k = keyOf(b, u.x, u.y); b.tiles[k] = 'plain'; const n = hasTrait(u, 'korokSense') ? 2 : 1; for (let i = 0; i < n; i++) st.materials.push('korokSeed'); out.lines.push('Yahaha! You found me! (Korok Seed)'); return out; }
    case 'activateTower': {
      const p = tilesInRange(b, u, 0, 0, u.size).concat([{ x: u.x, y: u.y }]).find((q) => ['sheikahTower', 'skyviewTower'].includes(tileAt(b, q.x, q.y) ?? ''))!;
      const k = keyOf(b, p.x, p.y);
      st.used.push(k);
      b.fog = false;
      for (const e of b.units) e.hidden = false;
      if (b.tiles[k] === 'skyviewTower') { for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(x, u) <= 1)) { buff(a, 'aerial', 'Skyview Launch', 2, { mov: 3 }); out.buffed.push(a.uid); } st.materials.push('skyviewActivated'); }
      else st.materials.push('sheikahTowerMap');
      out.lines.push('The tower activates: the whole field is revealed!');
      return out;
    }
    case 'enterShrine': {
      const p = [{ x: u.x, y: u.y }, ...tilesInRange(b, u, 0, 1, u.size)].find((q) => ['shrineEntrance', 'crystalPedestal'].includes(tileAt(b, q.x, q.y) ?? '') && !st.used.includes(keyOf(b, q.x, q.y)))!;
      st.used.push(keyOf(b, p.x, p.y));
      heal(u, u.stats.hp * 0.3);
      st.materials.push(st.layer === 'sky' || tileAt(b, p.x, p.y) === 'crystalPedestal' ? 'lightOfBlessing' : 'spiritOrb');
      out.lines.push(`${u.name} completes the shrine. A blessing awaits.`);
      return out;
    }
    case 'useDispenser': {
      const p = tilesInRange(b, u, 1, 1, u.size).find((q) => tileAt(b, q.x, q.y) === 'deviceDispenser')!;
      st.used.push(keyOf(b, p.x, p.y));
      const dev = rng.pick(ZONAI_DEVICES);
      if (u.pack.length < 6) u.pack.push({ id: dev, uses: 1 }); else (b.loot ??= []).push(dev);
      out.lines.push(`The dispenser drops a capsule: ${ITEMS[dev]?.name ?? dev}.`);
      return out;
    }
    case 'useTerminal': {
      const p = tilesInRange(b, u, 1, 1, u.size).find((q) => tileAt(b, q.x, q.y) === 'zonaiTerminal')!;
      st.used.push(keyOf(b, p.x, p.y));
      for (const a of b.units.filter((x) => x.team === u.team && mechanical(x))) { buff(a, 'terminal', 'Zonai Terminal', 3, { str: 2 }); out.buffed.push(a.uid); }
      st.energy = Math.min(st.energyMax + 20, st.energy + 10);
      out.lines.push('The Zonai Terminal hums: machines power up (+10 energy).');
      return out;
    }
    case 'zonaiEnhancement': st.energy = Math.min(st.energyMax + 20, st.energy + 10); break;
    case 'flamingRoll': case 'goronCharge': case 'calamityDive': case 'maliceStampedeAbility': {
      const t = target!;
      const spot = unitDist(u, t) > 1 ? nearFree(b, u, t, 1) : null;
      if (spot) tele(spot);
      applyTo(t);
      if (r) for (const e of b.units.filter((x) => x.team === t.team && x !== t && unitDist(x, u) <= r)) applyTo(e);
      if (def.id === 'flamingRoll') out.lines.push(...breakAround(b, t, 1));
      return out;
    }
    case 'divineArmAbility': { const t = target!; if (unitDist(u, t) > 1 && !t.isBoss) pullToward(b, t, u, 3); applyTo(t); return out; }
    case 'boulderBreakerStrike': {
      const t = target!;
      strike(t, damageOf(t) * (unitTags(t).includes('stone') || CLASSES[t.classId]?.moveType === 'armor' ? 1.5 : 1));
      out.lines.push(...breakAround(b, t, 1));
      return out;
    }
    case 'elementalBarrageAbility': {
      const t = target!;
      for (const el of ['fire', 'ice', 'lightning'] as Element[]) if (t.hp > 0) { const dmg = Math.max(1, Math.floor((Math.floor(es.mag / 2) + 4 - effectiveStats(t).res) * wildMultiplier(b, u, t, el, true, w ?? WEAPONS.fangs, unitDist(u, t)))); strike(t, dmg, { kind: el === 'fire' ? 'burn' : el === 'ice' ? 'freeze' : 'shock', turns: 1, chance: 25 }); }
      return out;
    }
    case 'divingArrow': case 'precisionShot': { const t = target!; strike(t, damageOf(t) * (def.id === 'precisionShot' && rng.chance(20) ? 3 : 1)); return out; }
    case 'gloomMeteor': case 'eruptionBarrage': case 'remoteBombRound': case 'remoteBombCube': {
      const plus = (def.id === 'remoteBombRound' || def.id === 'remoteBombCube') && b.owned?.includes('remoteBombPlus');
      const rad = r + (plus ? 1 : 0);
      const victims = b.units.filter((e) => e.team !== u.team && footDist(at!.x, at!.y, 1, e.x, e.y, e.size) <= rad);
      for (const e of victims) { if (s.dmg) strike(e, damageOf(e) + (plus ? 4 : 0)); if (e.hp > 0 && s.gloom) addGloom(b, e, s.gloom, u); }
      out.lines.push(...breakAround(b, at!, rad));
      if (s.dmg?.element) out.lines.push(...react(b, at!, s.dmg.element, u, rad));
      if (s.terrain) for (const p of [at!, ...tilesInRange(b, at!, 1, rad, 1)]) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'plain') setTimed(b, k, s.terrain, 4); }
      if (plus && u.cooldowns) u.turnUses = { ...(u.turnUses ?? {}), bombPlus: 1 };
      return out;
    }
  }

  // ── Data-driven abilities ──
  if (s.target === 'foe') {
    const t = target!;
    if (s.pull && !s.dmg) pullToward(b, t, u, s.pull);
    applyTo(t);
    if (r) for (const e of b.units.filter((x) => x.team === t.team && x !== t && unitDist(x, t) <= r)) applyTo(e);
  } else if (s.target === 'ally') {
    const t = target!;
    if (s.charges) (u.wildCharges ??= {})[def.id] = (u.wildCharges[def.id] ?? 1) - 1;
    helpAlly(t);
    if (def.id === 'revalisGale') { for (const p of tilesInRange(b, t, 1, 1, t.size)) react(b, p, 'wind', u); out.lines.push(`Revali's Gale lifts ${t.name} into the sky! (${u.wildCharges?.revalisGale ?? 0} left)`); }
  } else if (s.target === 'foes') {
    for (const e of foesOf(b, u).filter((x) => unitDist(u, x) <= r)) applyTo(e);
    if (s.dmg?.element === 'lightning' || s.tags?.includes('lightning')) for (const p of tilesInRange(b, u, 1, r, u.size)) react(b, p, 'lightning', u);
  } else if (s.target === 'allies') {
    for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(u, x) <= r)) helpAlly(a);
    if (def.id === 'protectiveDome' || def.id === 'lightBarrier') out.lines.push(`${def.name}!`);
    if (s.reveal) for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= s.reveal) e.hidden = false;
    if (def.id === 'sacredGuidance') for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(u, x) <= r)) for (const k of Object.keys(a.cooldowns ?? {})) if (k !== def.id && --a.cooldowns![k] <= 0) delete a.cooldowns![k];
  } else if (s.target === 'tile') {
    const p = at!;
    if (s.terrain) {
      for (const q of [p, ...tilesInRange(b, p, 1, r, 1)]) {
        const k = keyOf(b, q.x, q.y);
        const tt = b.tiles[k];
        if (def.id === 'cryonis' && !WATERY.includes(tt)) continue;
        if (['wall', 'fort', ...OBSTACLES].includes(tt)) continue;
        setTimed(b, k, s.terrain, s.terrainTurns ?? 3);
      }
      out.lines.push(def.id === 'cryonis' ? 'An ice pillar rises from the water.' : `${def.name}!`);
    }
    if (s.dmg) for (const e of b.units.filter((x) => x.team !== u.team && footDist(p.x, p.y, 1, x.x, x.y, x.size) <= r)) applyTo(e);
    if (s.move) tele(p);
  } else {
    // self
    if (s.buff) { buff(u, s.buff.id, s.buff.name, s.buff.turns, s.buff.stats ?? {}, !!s.buff.barrier); out.buffed.push(u.uid); }
    if (def.id === 'corruptingFlight') for (const q of tilesInRange(b, u, 1, 1, u.size)) { const k = keyOf(b, q.x, q.y); if (b.tiles[k] === 'plain') setTimed(b, k, 'gloom', 3); }
    if (def.id === 'aquaticDash') out.lines.push(`${u.name} darts through the water.`);
  }
  if (s.charges && s.target !== 'ally') (u.wildCharges ??= {})[def.id] = Math.max(0, (u.wildCharges[def.id] ?? 1) - 1);
  return out;
}

/** MP multiplier for Wild abilities (the Legacy of Hylia, Sage's Emblem). */
export function wildCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  if (!b || !isWildAbility(def)) return 1;
  let m = 1;
  const sacred = SACRED.has(def.id) || def.wild?.tags?.includes('sacred');
  if (sacred && u.team === 'player' && (b.groupSupports ?? []).includes('legacyOfHylia') && ['hylia', 'zeldaSS', 'zeldaWild'].includes(tid(u))) m *= 0.7;
  return m;
}

/** Cooldown reduction: Sages of the New Era, Sage's Emblem, Secret Stone of Time, Remote Bomb+. */
export function wildCooldownCut(b: Battle, u: Unit, def: AbilityDef): number {
  let n = 0;
  const sage = def.wild?.tags?.includes('sage');
  if (sage && u.team === 'player' && (b.groupSupports ?? []).includes('sagesOfTheNewEra')) n++;
  if (sage && hasTrait(u, 'sageBoost')) n++;
  if (hasTrait(u, 'secret:time') && ['soniasRecall', 'temporalRestoration', 'timeBarrier', 'recallBlessing', 'recall'].includes(def.id)) n++;
  if ((def.id === 'remoteBombRound' || def.id === 'remoteBombCube') && b.owned?.includes('remoteBombPlus')) n++;
  return n;
}

// ───────────────────────── Items ─────────────────────────

/** Battlefield reactions for the older packs' fruits and puffshrooms when they land. */
export function wildItemReaction(b: Battle, u: Unit, id: string, at: Pos): string[] {
  const def = ITEMS[id];
  if (!def) return [];
  const lines: string[] = [];
  if (id === 'fireFruit' || id === 'iceFruit' || id === 'shockFruit') lines.push(...react(b, at, def.element, u, def.radius ?? 0));
  if (id === 'puffshroom') for (const e of b.units) if (e.team !== u.team && footDist(at.x, at.y, 1, e.x, e.y, e.size) <= 1) addStatus(e, 'blind', 1);
  return lines;
}

/** Can this Wild item be used here? (Devices need energy; capsules need room.) */
export function wildCanUseItem(b: Battle, u: Unit, id: string): boolean | undefined {
  const e = DEVICE_ENERGY[id];
  if (!e) return undefined;
  const st = wildState(b);
  if ((st.noDrain ?? 0) > 0) return true;
  return st.energy >= Math.ceil(e.cost * energyMult(b, u)) - 1 || e.cost === 0;
}

export function useWildItem(b: Battle, u: Unit, id: string, rng: RNG, target?: Unit, at?: Pos): string | null {
  const st = wildState(b);
  const healBy = (n: number) => { u.hp = Math.min(u.stats.hp, u.hp + n); };
  const tempHp = (n: number) => { u.hp = Math.max(u.hp, u.stats.hp) + n; };
  const dev = DEVICE_ENERGY[id];
  if (dev && !spendEnergy(b, u, dev.perTurn ? dev.cost * (['flameEmitter', 'frostEmitter', 'shockEmitter', 'beamEmitter', 'homingCart'].includes(id) ? 1 : 3) : dev.cost)) return 'Not enough energy in the Energy Cell.';
  const area = (r: number) => b.units.filter((e) => at && footDist(at.x, at.y, 1, e.x, e.y, e.size) <= r);
  switch (id) {
    // ── Meals ──
    case 'heartyFriedWildGreens': u.hp = u.stats.hp; tempHp(10); return `${u.name} is fully healed, with hearts to spare.`;
    case 'heartyElixir': u.hp = u.stats.hp; tempHp(6); return `${u.name} is fully healed.`;
    case 'energizingMushroomSkewer': healBy(15); u.sta = Math.min(u.stats.sta, u.sta + 15); return `${u.name} feels energized.`;
    case 'energizingElixir': u.sta = Math.min(u.stats.sta, u.sta + 20); return `${u.name} catches a second wind.`;
    case 'enduringFriedWildGreens': u.sta = u.stats.sta + 10; return `${u.name}'s stamina overflows.`;
    case 'enduringElixir': u.sta = u.stats.sta + 8; return `${u.name}'s stamina overflows.`;
    case 'sneakyFriedWildGreens': addStatus(u, 'veiled', 5); return `${u.name} moves without a sound.`;
    case 'sneakyElixir': addStatus(u, 'veiled', 3); return `${u.name} moves without a sound.`;
    case 'spicySauteedPeppers': healBy(8); buff(u, 'wt:coldRes', 'Spicy (cold resistance)', 5); return `${u.name} warms right up.`;
    case 'chillyFruitMix': healBy(8); buff(u, 'wt:heatRes', 'Chilly (heat resistance)', 5); return `${u.name} cools down.`;
    case 'electroMushroomSkewer': healBy(8); buff(u, 'wt:shockRes', 'Electro (lightning resistance)', 5); return `${u.name} tingles.`;
    case 'spicyElixir': buff(u, 'wt:coldRes', 'Spicy Elixir', 6); return `${u.name} resists the cold.`;
    case 'chillyElixir': buff(u, 'wt:heatRes', 'Chilly Elixir', 6); return `${u.name} resists the heat.`;
    case 'electroElixir': buff(u, 'wt:shockRes', 'Electro Elixir', 6); return `${u.name} resists lightning.`;
    case 'fireproofElixir': buff(u, 'wt:fireImmune', 'Fireproof Elixir', 5); u.statuses = u.statuses.filter((s) => s.kind !== 'burn'); return `${u.name} is fireproof.`;
    case 'stickyElixir': buff(u, 'wt:slipImmune', 'Sticky Elixir', 6); return `${u.name}'s grip is sure.`;
    case 'sunnyFriedWildGreens': { const c = cureGloom(u); healBy(10); return c ? `Sunlight in a dish: ${u.name} recovers ${c} max HP from Gloom.` : `${u.name} feels warm and bright.`; }
    case 'wardingFriedWildGreens': buff(u, 'wt:gloomWard', 'Warding (Gloom resistance)', 5); return `${u.name} is warded against the Gloom.`;
    case 'brightMushroomSkewer': buff(u, 'wt:bright', 'Bright', 5); lightUp(b, u, 3); return `${u.name} glows.`;
    case 'brightElixir': buff(u, 'wt:bright', 'Bright Elixir', 6); lightUp(b, u, 3); return `${u.name} glows.`;
    // ── Throwables ──
    case 'splashFruit': if (!at) return null; return ['A splash of water.', ...react(b, at, 'water', u, 1)].join(' ');
    case 'dazzlefruit': {
      if (!at) return null;
      for (const e of area(1)) if (e.team !== u.team) { addStatus(e, 'blind', 2); if (unitTags(e).some((t) => t === 'undead' || t === 'gloom')) e.hp = Math.max(1, e.hp - 10); }
      lightUp(b, at, 1);
      return 'A blinding flash!';
    }
    case 'bombFlower': {
      if (!at) return null;
      for (const e of area(1)) if (e.team !== u.team) e.hp = Math.max(e === target ? 0 : 1, e.hp - 12);
      for (const e of area(1).filter((x) => x.hp <= 0)) { b.units = b.units.filter((x) => x !== e); b.fallen.push(e); u.kills++; wildOnKill(b, u, e, rng); }
      return ['BOOM!', ...breakAround(b, at, 1), ...react(b, at, 'fire', u, 0)].join(' ');
    }
    case 'brightbloomSeed': if (at) lightUp(b, at, 2); return 'The seed bursts into light.';
    case 'giantBrightbloomSeed': if (at) lightUp(b, at, 4); return 'A huge bloom lights the dark.';
    case 'hylianPineCone': {
      if (!at) return null;
      const k = keyOf(b, at.x, at.y);
      st.cones.push(k);
      if (b.fires?.some((f) => footDist(f.x, f.y, 1, at.x, at.y, 1) <= 1)) { ignite(b, k, 1); return 'The pine cone lands in the fire!'; }
      return 'A pine cone, ready to burn.';
    }
    case 'korokFrond': {
      if (!at) return null;
      for (const e of area(1)) if (e.team !== u.team && e.size <= 2) pushAway(b, e, u, 1);
      return ['A gust of wind!', ...react(b, at, 'wind', u, 1)].join(' ');
    }
    case 'octoBalloon': {
      const t = at && unitAt(b, at.x, at.y);
      if (!t) return 'It floats away.';
      if (t.team === u.team) { buff(t, 'glide', 'Octo Balloon', 2); return `${t.name} floats up.`; }
      if (t.size === 1 && !t.isBoss) { addStatus(t, 'root', 1); return `${t.name} is lifted off its feet!`; }
      return 'It\'s too heavy.';
    }
    case 'flint': if (!at) return null; return ['Sparks!', ...react(b, at, 'fire', u, 0)].join(' ');
    // ── Zonai Devices ──
    case 'zonaiFan': for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(x, u) <= 2)) buff(a, 'zonaiFan', 'Fan', 1, { mov: 2 }); for (const p of tilesInRange(b, u, 1, 2, u.size)) react(b, p, 'wind', u); return 'The fan whirs: a tailwind.';
    case 'zonaiWing': buff(u, 'glide', 'Wing', 2); return `${u.name} glides on a Zonai wing.`;
    case 'zonaiCart': buff(u, 'zonaiCart', 'Cart', 1, { mov: 2 }); return `${u.name} rolls along on a cart.`;
    case 'zonaiBalloon': { const hot = (b.fires ?? []).some((f) => footDist(f.x, f.y, 1, u.x, u.y, u.size) <= 1) || b.units.some((x) => x.artId === 'flameEmitterDevice' && unitDist(x, u) <= 1); buff(u, 'glide', 'Balloon', hot ? 2 : 1); return hot ? 'The heat fills the balloon: up!' : 'The balloon lifts a little.'; }
    case 'zonaiRocket': buff(u, 'glide', 'Rocket', 1); buff(u, 'zonaiRocket', 'Rocket', 1, { mov: 4 }); return `${u.name} blasts off!`;
    case 'zonaiTimeBomb': if (!at) return null; st.bombs.push({ x: at.x, y: at.y, turns: 1, team: u.team, power: 15 }); return 'Tick... tick...';
    case 'portablePot': for (const a of [u, ...alliesOf(b, u)].filter((x) => unitDist(x, u) <= 1)) { a.hp = Math.min(a.stats.hp, a.hp + Math.ceil(a.stats.hp * 0.25)); const bad = a.statuses.findIndex((x) => !STATUS_INFO[x.kind].good); if (bad >= 0) a.statuses.splice(bad, 1); } return 'A quick meal from the portable pot.';
    case 'flameEmitter': case 'frostEmitter': case 'shockEmitter': case 'beamEmitter': {
      if (!at) return null;
      const el: Record<string, [string, Element | undefined, number, number]> = { flameEmitter: ['Flame Emitter', 'fire', 8, 1], frostEmitter: ['Frost Emitter', 'ice', 7, 1], shockEmitter: ['Shock Emitter', 'lightning', 7, 1], beamEmitter: ['Beam Emitter', undefined, 9, 4] };
      const [name, element, might, range] = el[id];
      const turret = makeEnemy({ id: `${id}Device`, name, classId: 'stationaryGuardian', race: 'zonaiVehicle', weapons: [`${id}Blast`], stats: { hp: 14, str: 0, mag: 8, skl: 10, spd: 0, def: 6, res: 4, lck: 0, con: 10, mov: 0, sta: 0, mp: 0 }, glyph: name.slice(0, 2).toUpperCase() },
        b.world, Math.max(1, u.level), `p${b.uidCounter++}`, rng);
      void element; void might; void range;
      if (!free(b, turret, at.x, at.y)) return 'No room.';
      Object.assign(turret, { x: at.x, y: at.y, team: u.team, npc: u.team === 'player', summoned: true, ai: 'stationary', moved: true, acted: true });
      b.units.push(turret);
      st.upkeep[turret.uid] = DEVICE_ENERGY[id].cost;
      return `${name} set down (${DEVICE_ENERGY[id].cost} energy a turn).`;
    }
    case 'zonaiHydrant': for (const p of [{ x: u.x, y: u.y }, ...tilesInRange(b, u, 1, 2, u.size)]) react(b, p, 'water', u); for (const e of foesOf(b, u).filter((x) => unitDist(x, u) <= 2)) e.hp = Math.max(1, e.hp - 3); return 'A jet of water douses the area.';
    case 'steeringStick': { const v = alliesOf(b, u).find((a) => a.race === 'zonaiVehicle' && unitDist(a, u) <= 1); if (!v) return 'No vehicle next to you to steer.'; buff(v, 'steeringStick', 'Steered', 1, { mov: 2 }); v.buffs = v.buffs.filter((x) => x.id !== 'autopilot'); return `${u.name} takes the stick of the ${v.name}.`; }
    case 'bigWheel': buff(u, 'bigWheel', 'Big Wheel', 2, { mov: 1 }); return 'Big wheels: over the rough ground.';
    case 'smallWheel': buff(u, 'smallWheel', 'Small Wheel', 1, { mov: 2 }); return 'Small wheels: zoom.';
    case 'zonaiSled': buff(u, 'zonaiSled', 'Sled', 3); buff(u, 'sandRunner', 'Sled', 3); return `${u.name} slides along.`;
    case 'zonaiBattery': st.energy += 15; return 'Battery attached: +15 energy.';
    case 'bigBattery': st.energy += 50; return 'Big Battery attached: +50 energy.';
    case 'zonaiSpring': { const e = foesOf(b, u).find((x) => unitDist(x, u) === 1 && x.size <= 2); if (e) { pushAway(b, e, u, 2); return `The spring launches ${e.name} away!`; } buff(u, 'glide', 'Spring', 1); return `${u.name} bounces up.`; }
    case 'zonaiCannon': if (!at) return null; for (const e of area(1)) if (e.team !== u.team) e.hp = Math.max(1, e.hp - (footDist(at.x, at.y, 1, e.x, e.y, e.size) === 0 ? 16 : 8)); return ['The cannon fires!', ...breakAround(b, at, 1)].join(' ');
    case 'zonaiStabilizer': case 'zonaiStake': buff(u, 'zonaiStake', id === 'zonaiStake' ? 'Staked' : 'Stabilized', 3, id === 'zonaiStake' ? { def: 2 } : {}); return `${u.name} is anchored in place.`;
    case 'hoverStone': {
      if (!at) return null;
      const k = keyOf(b, at.x, at.y);
      if (!['water', 'chasm', 'lava', 'plain', 'gloom', 'sludge'].includes(b.tiles[k])) return 'It needs open space.';
      setTimed(b, k, 'floatingPlatform', 3);
      return 'A hover stone floats into place.';
    }
    case 'zonaiLight': buff(u, 'zonaiLight', 'Light', 3); lightUp(b, u, 3); return 'Zonai light pushes back the dark.';
    case 'zonaiMirror': { buff(u, 'zonaiMirror', 'Mirror', 2); let n = 0; for (const e of foesOf(b, u).filter((x) => unitDist(x, u) <= 2 && unitTags(x).some((t) => t === 'undead' || t === 'gloom'))) { e.hp = Math.max(1, e.hp - 6); n++; } return `The mirror redirects light${n ? ` (${n} burned)` : ''}.`; }
    case 'homingCart': {
      const t = foesOf(b, u).filter((e) => !e.hidden).sort((a, c) => unitDist(u, a) - unitDist(u, c))[0];
      if (!t) return 'No target.';
      const d = Math.min(t.hp - 1, 14);
      t.hp -= Math.max(0, d);
      return `A homing cart runs down ${t.name} and explodes (${d})!`;
    }
    case 'constructHead': buff(u, 'constructHead', 'Construct Head', 3); return 'A construct head locks on to targets.';
    case 'zonaiCharge': st.energy = Math.min(st.energyMax + 30, st.energy + 20); return 'The Energy Cell recharges (+20).';
    case 'largeZonaiCharge': st.energy = Math.max(st.energy, st.energyMax); st.noDrain = 2; return 'The Energy Cell overflows: devices are free for 2 turns.';
  }
  void target;
  return null;
}

/** Fire immunity for burning ground. */
export function wildHazardImmune(u: Unit): boolean {
  return hasTrait(u, 'fireImmune') || hasBuff(u, 'wt:fireImmune');
}

// ───────────────────────── After moving ─────────────────────────

/** Stepping on spaces: Poes, Korok seeds by touch, pristine weapons, Gloom trails, lit paths. */
export function wildAfterMove(b: Battle, u: Unit): string | null {
  if (!b.wild && !isWildWorld(b)) return null;
  const st = wildState(b);
  const lines: string[] = [];
  for (const p of footprint(u.x, u.y, u.size)) {
    const k = keyOf(b, p.x, p.y);
    const t = b.tiles[k];
    if (has(u, 'eternalCalamity') && (t === 'plain' || t === 'forest')) setTimed(b, k, 'gloom', 4);
    if (u.team !== 'player' || u.npc) continue;
    if (hasTrait(u, 'leavesLight') && t === 'darkness') b.tiles[k] = 'plain';
    if (t === 'poeSpirit') { b.tiles[k] = 'plain'; st.materials.push('poe'); lines.push(`${u.name} catches a Poe.`); }
    if (t === 'pristinePedestal' && !st.used.includes(k)) {
      st.used.push(k);
      const pool = Object.values(WEAPONS).filter((w) => !w.unique && w.type !== 'natural' && ['rare', 'epic'].includes(w.rarity) && w.id in (WEAPONS)).map((w) => w.id);
      const id = pool[(k * 7 + b.turn) % pool.length];
      if (id) { (b.loot ??= []).push(id); st.pristine.push(id); lines.push(`${u.name} takes a pristine ${WEAPONS[id].name} from the pedestal.`); }
    }
    if (t === 'abandonedMine' && !st.used.includes(k)) { st.used.push(k); st.materials.push('zonaite', 'zonaite'); lines.push('Zonaite in the old mine.'); }
    if (t === 'yigaHideout' && !st.used.includes(k)) { st.used.push(k); st.materials.push('yigaSchematic'); lines.push('A Yiga schematic, left on a table.'); }
    if (t === 'fallingRuin') { b.tiles[k] = 'floatingPlatform'; }
  }
  if (!lines.length) return null;
  b.log.push(...lines);
  return lines.join(' ');
}

void hasEffect; void ITEMS;
export { WILD_DEPTHS };
