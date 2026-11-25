import { ABILITIES, CLASSES, GEAR, ITEMS, RACES, WEAPONS } from '../data/registry';
import { gainSupport, supportBonus } from './supports';
import { coordinatedBonus, moraleBonus } from './army';
import { isHelpless, onDamaged, rollElement, statusMods, weatherMight } from './status';
import { keyOf, terrainAt, unitDist } from './grid';
import { meltSunBlocks, thawMechanisms } from './field';
import { canParry, critImmune, masterSwordState, onParry, rangeBonus, scavengePenalty, wwAfterCombat, wwAfterHit, wwElement, wwMods, wwMultiplier, wwOnKill } from './windwaker';
import { cannonsDown, isVessel, vesselMods } from './naval';
import type { RNG } from './rng';
import { isMagical, TERRAIN_BONUS, TRIANGLE } from './rules';
import { canSwim, effectiveStats, forgeLevel, gainXp, gearBonus, hasEffect, isMounted, spendUse, unitTags } from './units';
import type { AbilityDef, Battle, Element, Pos, StatKey, StatusKind, Unit, WeaponDef } from './types';

export interface SideForecast {
  uid: string;
  weaponId: string | null;
  canAttack: boolean;
  dmg: number;
  hit: number;
  crit: number;
  attacks: number;
  triangle: -1 | 0 | 1;
  effective: boolean;
  /** Chance the target's shield halves each hit. */
  block: number;
  /** Elemental arrow used (initiating bow attacks only). */
  arrowId: string | null;
  element?: Element;
}

export interface Forecast {
  attacker: SideForecast;
  defender: SideForecast;
  distance: number;
}

export interface Strike {
  by: string;
  target: string;
  hit: boolean;
  crit: boolean;
  dmg: number;
  heal: number;
  targetHp: number;
  byHp: number;
  killed: boolean;
  blocked?: boolean;
  saved?: 'triforce' | 'fairy' | 'revive';
  /** Collateral damage from a sweeping attack. */
  splash?: boolean;
  /** Statuses inflicted by this hit. */
  statuses?: StatusKind[];
  /** The target's ice shattered. */
  thawed?: boolean;
}

export interface LevelUp {
  uid: string;
  name: string;
  level: number;
  gains: Partial<Record<StatKey, number>>;
}

export interface CombatResult {
  strikes: Strike[];
  /** Weapons that broke during the exchange. */
  broken: { uid: string; weaponId: string; into?: string }[];
  deaths: string[];
  xp: { uid: string; amount: number }[];
  levelUps: LevelUp[];
}

/** A Bottled Fairy in the pack revives a unit at 50% HP (consumed). */
export function useFairy(u: Unit): boolean {
  const i = u.pack.findIndex((p) => ITEMS[p.id]?.kind === 'fairy');
  if (i < 0) return false;
  u.pack.splice(i, 1);
  u.hp = Math.max(1, Math.ceil((u.stats.hp * (ITEMS.fairy?.power ?? 50)) / 100));
  return true;
}

export const weaponDef = (id: string | null | undefined): WeaponDef | undefined => (id ? WEAPONS[id] : undefined);

/** The equipped (first) weapon. */
export function weaponOf(u: Unit): WeaponDef {
  return WEAPONS[u.weapons[0]] ?? WEAPONS.fangs;
}

export function canWield(u: Unit, w: WeaponDef): boolean {
  if (w.races && !w.races.includes(u.race)) return false;
  if (w.minSize && (u.baseSize ?? u.size) < w.minSize) return false;
  if (cannonsDown(u, w.id)) return false;
  if (u.scavenged?.includes(w.id)) return true; // picked up off the field: usable, just badly
  // Vessels fire their cannons; nobody else fires a ship's guns without training.
  if (w.type === 'siege' && isVessel(u)) return true;
  return w.type === 'natural' || w.type === 'instrument' || !!w.anyClass || !!CLASSES[u.classId]?.weapons.includes(w.type);
}

export function canReach(w: WeaponDef, d: number, u?: Unit): boolean {
  return d >= w.minRange && d <= w.maxRange + (u ? rangeBonus(u, w) : 0);
}

/** Offensive weapons the unit can use at distance d (equipped first). */
export function attackWeapons(u: Unit, d: number): WeaponDef[] {
  const extra = hasEffect(u, 'magicRange');
  return u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type !== 'staff' && w.type !== 'instrument' && canWield(u, w)
    && (canReach(w, d, u) || (extra && w.type === 'magic' && d === w.maxRange + 1)));
}

export function healWeapons(u: Unit, d: number): WeaponDef[] {
  return u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type === 'staff' && canWield(u, w) && canReach(w, d));
}

/** Widest offensive range (for threat displays and AI). */
export function maxAttackRange(u: Unit): { min: number; max: number } | null {
  const ws = u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type !== 'staff' && w.type !== 'instrument' && canWield(u, w));
  if (!ws.length) return null;
  return { min: Math.min(...ws.map((w) => w.minRange)), max: Math.max(...ws.map((w) => w.maxRange + rangeBonus(u, w))) };
}

function triangleOf(a: WeaponDef, d?: WeaponDef): -1 | 0 | 1 {
  if (!d) return 0;
  if (TRIANGLE[a.type] === d.type) return 1;
  if (TRIANGLE[d.type] === a.type) return -1;
  return 0;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(v)));

interface Mods {
  str: number; mag: number; skl: number; spd: number; def: number; res: number;
  hit: number; avoid: number; crit: number; dmg: number;
}

/** Situational bonuses from personal skills, auras and accessories. */
export function situational(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean): Mods {
  const m: Mods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const has = (s: string) => u.skills.includes(s);
  const allies = b.units.filter((a) => a !== u && a.team === u.team);
  const near = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  const terrain = terrainAt(b, pos.x, pos.y);
  const fs = effectiveStats(foe);
  const us = effectiveStats(u);

  if (has('spiritOfCourage') && foe.level - u.level >= 3) { m.str += 2; m.skl += 2; m.spd += 2; }
  if (has('smallButMighty') && fs.con >= us.con * 2) m.avoid += 20;
  if (has('spiritOfPower')) { const k = Math.min(5, u.kills); m.str += k; m.mag += k; }
  if (has('swornBrother') && allies.some((a) => near(a, 1) && a.hp < a.stats.hp / 2)) { m.str += 3; m.def += 3; }
  if (has('loneThief') && !allies.some((a) => near(a, 1))) { m.hit += 15; m.avoid += 15; }
  if (has('ruthlessRider') && initiating && u.movedDist >= 4) m.dmg += 3;
  if (has('demonicFury') && u.hp < u.stats.hp / 2) m.str += 5;
  if (has('darkReflection') && initiating) { m.str += Math.max(0, fs.str - us.str); m.spd += Math.max(0, fs.spd - us.spd); }
  if (has('enslavedWarrior')) m.def += 4;
  if (terrain === 'forest' && (has('forestsFriendship') || allies.some((a) => a.skills.includes('forestsFriendship') && near(a, 1)))) m.avoid += 10;

  for (const a of allies) {
    if (a.skills.includes('spiritOfWisdom') && near(a, 2)) { m.res += 2; m.hit += 10; }
    if (a.skills.includes('kokiriAuthority') && u.race === 'kokiri' && near(a, 2)) { m.skl += 2; m.spd += 2; }
    if (a.skills.includes('royalPresence') && u.race === 'zora' && near(a, 3)) { m.def += 2; m.res += 2; }
    if (a.skills.includes('heyListen') && near(a, 2)) m.hit += 20;
    if (hasEffect(a, 'crestAura') && near(a, 1)) m.hit += 5;
  }
  if (hasEffect(u, 'mountedAvoid') && (isMounted(u) || CLASSES[u.classId]?.moveType === 'cavalry')) m.avoid += 10;
  if (hasEffect(u, 'charge') && initiating && u.movedDist >= 3) m.dmg += 2;
  if (b.units.some((e) => e.team !== u.team && hasEffect(e, 'intimidate') && unitDist(u, e, pos) <= 2)) m.avoid -= 5;
  if (hasEffect(u, 'beastSlayer') && unitTags(foe).includes('beast')) m.str += 3;
  if (hasEffect(u, 'giantEye') && foe.size >= 2) m.hit += 20;
  if (u.team === 'player' && !u.npc) {
    const mb = moraleBonus(b.morale);
    m.hit += mb;
    m.avoid += mb;
    if (initiating) m.dmg += coordinatedBonus(b, u, foe);
  }
  // ── Termina skills and auras ──
  const watery = (t: string) => t === 'water' || t === 'poisonWater' || t === 'current';
  if (has('aquaticGrace') && watery(terrain)) m.avoid += 15;
  if (has('royalTemper') && u.lastHitBy === foe.uid) m.str += 4;
  if (has('spikedRoll') && initiating && u.movedDist >= 3) m.dmg += 4;
  if (has('determination') && [...u.weapons.map((id) => WEAPONS[id]), ...Object.values(u.gear ?? {}).map((id) => GEAR[id!])].some((x) => x?.unique)) { m.spd += 2; m.skl += 2; }
  if (has('dekuPhalanx') && allies.some((a) => a.templateId === 'dekuSoldier' && near(a, 1))) m.def += 2;
  const igos = allies.find((a) => a.skills.includes('undyingKingdom'));
  if (has('kingsBlade') && igos && near(igos, 3)) { m.str += 3; m.spd += 2; m.crit += 10; }
  const loyal = [u, ...allies].filter((a) => a.skills.includes('undyingKingdom') || a.skills.includes('kingsBlade') || a.skills.includes('kingsShield'));
  if (loyal.includes(u) && loyal.some((a) => a.skills.includes('undyingKingdom')) && loyal.some((a) => a.skills.includes('kingsBlade')) && loyal.some((a) => a.skills.includes('kingsShield'))) {
    m.str += 2; m.def += 2; m.res += 2; m.hit += 10;
  }
  const tags = unitTags(u);
  for (const a of allies) {
    if (a.skills.includes('callTheGiants') && (u.baseSize ?? u.size) >= 3 && near(a, 3)) { m.str += 2; m.res += 2; }
    if (a.skills.includes('royalCommand') && u.race === 'deku' && near(a, 2)) { m.str += 2; m.def += 2; }
    if (a.skills.includes('mountainHero') && u.race === 'goron' && near(a, 1)) m.def += 2;
    if (a.skills.includes('captainsOrders') && tags.includes('undead') && near(a, 4)) { m.str += 2; m.skl += 2; }
    if (hasEffect(a, 'captain') && tags.includes('undead') && near(a, 3)) m.skl += 2;
    if (a.skills.includes('spiritGuardian') && near(a, 3)) m.res += 3;
    if (a.skills.includes('guardianOfTheZora') && u.race === 'zora' && near(a, 4)) { m.def += 3; m.res += 3; }
    if (hasEffect(a, 'dekuCrown') && u.race === 'deku' && near(a, 2)) m.res += 1;
  }
  if (b.bonus === 'rolling' && initiating && u.movedDist >= 3 && (u.race === 'goron' || hasEffect(u, 'charge') || has('spikedRoll') || has('runawayMachine'))) m.dmg += 3;
  const ww = wwMods(b, u, pos, foe, initiating, WEAPONS[u.weapons[0]]);
  const vm = vesselMods(b, u);
  m.str += ww.str + vm.str; m.mag += ww.mag; m.skl += ww.skl; m.spd += ww.spd; m.def += ww.def + vm.def; m.res += ww.res + vm.res;
  m.hit += ww.hit + vm.hit; m.avoid += ww.avoid + vm.avoid; m.crit += ww.crit; m.dmg += ww.dmg + vm.dmg;
  const sup = supportBonus(b, u, pos);
  const cm = hasEffect(u, 'couple') ? 1.25 : 1;
  m.hit += Math.round(sup.hit * cm); m.avoid += Math.round(sup.avoid * cm); m.crit += Math.round(sup.crit * cm); m.def += sup.def; m.res += sup.def;
  return m;
}

function sideStats(
  b: Battle, atk: Unit, atkPos: Pos, def: Unit, defPos: Pos, initiating: boolean,
  weapon: WeaponDef | undefined, foeWeapon: WeaponDef | undefined, arrow?: AbilityDef,
): SideForecast {
  const d = unitDist({ ...atk, ...atkPos }, { ...def, ...defPos });
  const helpless = !initiating && isHelpless(atk);
  const beaming = !!weapon?.beam && d > 1;
  if (!weapon || weapon.type === 'staff' || weapon.type === 'instrument' || !canReach(weapon, d, atk) || helpless || (beaming && atk.mp < weapon.beam!)) {
    return { uid: atk.uid, weaponId: weapon?.id ?? null, canAttack: false, dmg: 0, hit: 0, crit: 0, attacks: 0, triangle: 0, effective: false, block: 0, arrowId: null };
  }
  const as = effectiveStats(atk);
  const ds = effectiveStats(def);
  const am = situational(b, atk, atkPos, def, initiating);
  const dm = situational(b, def, defPos, atk, !initiating);
  const ab = gearBonus(atk);
  const db = gearBonus(def);
  const terrain = TERRAIN_BONUS[b.tiles[keyOf(b, defPos.x, defPos.y)]];
  const tri = triangleOf(weapon, foeWeapon);
  const magical = isMagical(weapon.type) || beaming;
  const tags = unitTags(def);
  const ms = weapon.id === 'masterSword' ? masterSwordState(b, atk) : null;
  const wEff = ms === 'dormant' ? [] : ms ? ['demon', 'undead'] : weapon.effective ?? [];
  const effective = !![...wEff, ...(arrow?.effective ?? [])].some((t) => tags.includes(t));
  const element = arrow?.element ?? wwElement(atk, weapon) ?? weapon.element;
  const sa = statusMods(atk);
  const sd = statusMods(def);

  let might = (weapon.might + forgeLevel(atk, weapon.id) + (arrow?.might ?? 0)) * (effective ? 2 : 1) + weatherMight(b, element);
  if (initiating) {
    const moved = atk.movedDist ?? 0;
    if (weapon.momentum) might += Math.min(weapon.momentum, moved);
    if (atk.skills.includes('runawayMachine')) might += Math.min(8, moved);
    if (hasEffect(atk, 'remainsMomentum')) might += Math.min(5, moved);
  }
  if (weapon.curseEater && def.statuses?.some((x) => x.kind === 'curse')) might += 4;
  if (ms === 'full' && tags.includes('demon')) might += 4;
  if (atk.skills.includes('heavyForging') && weapon.twoHanded) might += 2;
  const power = (magical ? as.mag + am.mag : as.str + am.str) + might + tri + am.dmg + sa.dmg;
  let defense = magical ? ds.res + dm.res : Math.max(0, ds.def + dm.def + sd.def) + terrain.def;
  if (weapon.pierce) defense = Math.floor(defense * (1 - weapon.pierce));
  let dmg = Math.max(0, power - defense);
  if (hasEffect(atk, 'desperation') && atk.hp < atk.stats.hp / 2) dmg = Math.floor(dmg * 1.25);
  dmg = Math.floor(dmg * terminaMultiplier(b, atk, def, defPos, element, magical, weapon));
  dmg = Math.floor(dmg * wwMultiplier(b, atk, def, defPos, element, magical, weapon, d));
  if (atk.isBoss && atk.team === 'enemy' && (b.bossTier ?? 2) < 2) dmg = Math.floor(dmg * (b.bossTier === 0 ? 0.7 : 0.85)); // early bosses hit softer
  if (def.buffs?.some((x) => x.barrier || x.id === 'bubble')) dmg = 0; // Nayru's Love, Wart's bubbles

  const grip = (u: Unit, w: WeaponDef) => (w.twoHanded && hasEffect(u, 'twoHandedGrip') ? 3 : 0);
  const atkSpd = as.spd + am.spd - Math.max(0, weapon.weight - grip(atk, weapon) - as.con);
  const defW = foeWeapon ?? weapon;
  const defSpd = ds.spd + dm.spd - Math.max(0, (foeWeapon ? defW.weight - grip(def, defW) : 0) - ds.con);
  const hit = clamp(weapon.hit + (arrow?.hit ?? 0) + (as.skl + am.skl) * 2 + Math.floor(as.lck / 2) + tri * 15 + am.hit + ab.hit + sa.hit - (b.weather?.kind === 'sandstorm' ? 15 : 0)
    + scavengePenalty(atk, weapon, CLASSES[atk.classId]?.weapons ?? [])
    - (Math.max(0, defSpd) * 2 + ds.lck + terrain.avoid + dm.avoid + db.avoid + sd.avoid));
  const concealed = atk.statuses?.some((x) => x.kind === 'veiled');
  const crit = critImmune(def) ? 0 : initiating && concealed && atk.skills.includes('masterOfAmbush') ? 100
    : clamp(weapon.crit + (arrow?.crit ?? 0) + Math.floor((as.skl + am.skl) / 2) + am.crit + ab.crit - ds.lck);

  let attacks = atkSpd - defSpd >= 4 ? 2 : 1;
  if ((weapon.brave || (weapon.braveConcealed && concealed) || (atk.skills.includes('tripleShot') && atk.movedDist === 0)) && initiating) attacks *= 2;
  return { uid: atk.uid, weaponId: weapon.id, canAttack: true, dmg, hit, crit, attacks, triangle: tri, effective, block: Math.min(80, db.block), arrowId: arrow?.id ?? null, element };
}

/** Termina damage modifiers: boss slayers, aquatic predators, bat swarms, weaknesses, giants. */
function terminaMultiplier(b: Battle, atk: Unit, def: Unit, defPos: Pos, element: Element | undefined, magical: boolean, weapon: WeaponDef): number {
  let mult = 1;
  const t = terrainAt(b, defPos.x, defPos.y);
  const watery = t === 'water' || t === 'poisonWater' || t === 'current';
  if (atk.skills.includes('wrathOfTheDeity') && def.isBoss) mult *= 1.5;
  if (atk.skills.includes('predatorOfTheDeep') && watery && !canSwim(def)) mult *= 2;
  if (def.skills.includes('batSwarm') && element !== 'light') mult *= 0.5;
  if (def.skills.includes('divineBulk') && !magical) mult *= 0.75;
  if (element && (RACES[def.race]?.weakTo?.includes(element) || (element === 'fire' && hasEffect(def, 'fireWeak')))) mult *= 1.5;
  if (hasEffect(atk, 'remainsForest') && t === 'forest') mult *= 1.25;
  if (hasEffect(atk, 'remainsAquatic') && canSwim(def)) mult *= 1.25;
  if (hasEffect(def, 'remainsGiant') && atk.size > def.size) mult *= 0.75;
  if (hasEffect(def, 'balloon') && (weapon.type === 'bow' || weapon.type === 'sling')) mult *= 2;
  return mult;
}

/** The defender counters with the first carried weapon that reaches. */
export function counterWeapon(def: Unit, d: number): WeaponDef | undefined {
  return attackWeapons(def, d)[0];
}

/** Preview `attacker` (standing at `from`, using `weaponId`) attacking `defender`. */
export function forecast(b: Battle, attacker: Unit, from: Pos, defender: Unit, weaponId?: string, arrowId?: string): Forecast {
  const defPos = { x: defender.x, y: defender.y };
  const d = unitDist(attacker, defender, from);
  const aw = (weaponId ? weaponDef(weaponId) : undefined) ?? attackWeapons(attacker, d)[0];
  const dw = counterWeapon(defender, d);
  const arrow = arrowId && attackMods(attacker, aw).some((a) => a.id === arrowId) ? ABILITIES[arrowId] : undefined;
  return {
    attacker: sideStats(b, attacker, from, defender, defPos, true, aw, dw, arrow),
    defender: sideStats(b, defender, defPos, attacker, from, false, dw, aw),
    distance: d,
  };
}

/**
 * Attack modifiers usable with this weapon right now: elemental arrows (bows,
 * cost MP) and techniques for the weapon's type (cost stamina).
 */
export function attackMods(u: Unit, weapon: WeaponDef | undefined): AbilityDef[] {
  if (!weapon) return [];
  const out: AbilityDef[] = [];
  if (weapon.type === 'bow') {
    for (const id of u.abilities) {
      const a = ABILITIES[id];
      if (a?.kind === 'arrow' && a.implemented && u.mp >= a.mp && !u.statuses.some((s) => s.kind === 'silence')) out.push(a);
    }
  }
  for (const a of Object.values(ABILITIES)) {
    if (a.kind === 'technique' && !a.area && a.weaponTypes?.includes(weapon.type) && u.sta >= (a.sta ?? 0)) out.push(a);
  }
  return out;
}

/** @deprecated use attackMods */
export const arrowOptions = (u: Unit) => attackMods(u, weaponOf(u));

export function expectedDamage(s: SideForecast): number {
  const perHit = s.dmg * (1 + (2 * s.crit) / 100);
  return (perHit * s.hit * s.attacks) / 100;
}

function xpFor(unit: Unit, foe: Unit, dealt: boolean, killed: boolean): number {
  const diff = foe.level - unit.level;
  let xp = dealt ? 10 + diff * 2 : 1;
  if (killed) xp += 25 + diff * 3 + (foe.isBoss ? 40 : 0);
  return Math.max(1, Math.min(100, xp));
}

function killUnit(b: Battle, u: Unit) {
  b.units = b.units.filter((x) => x !== u);
  b.fallen.push(u);
}

/** Enemies caught by a weapon's (or skill's) sweep. */
function splashTargets(b: Battle, atk: Unit, target: Unit, w: WeaponDef | undefined): Unit[] {
  const kind = w?.splash ?? (atk.skills.includes('colossalStrength') || atk.skills.includes('burrowingTerror') ? 'adjacent'
    : atk.skills.includes('cursedRotation') ? 'around' : undefined);
  if (!kind) return [];
  const foes = b.units.filter((e) => e.team !== atk.team && e !== target && !e.captive && e.hp > 0);
  if (kind === 'adjacent') return foes.filter((e) => unitDist(e, target) === 1);
  if (kind === 'around') return foes.filter((e) => unitDist(e, atk) === 1);
  // 'line': keep going past the target in the same direction.
  const dx = Math.sign(target.x - atk.x), dy = Math.sign(target.y - atk.y);
  if (dx && dy) return foes.filter((e) => unitDist(e, target) === 1);
  const out: Unit[] = [];
  for (let i = 1; i <= 4; i++) {
    const x = target.x + dx * (target.size - 1 + i) * (dx > 0 ? 1 : 1), y = target.y + dy * (target.size - 1 + i);
    const e = foes.find((f) => x >= f.x && y >= f.y && x < f.x + f.size && y < f.y + f.size);
    if (e && !out.includes(e)) out.push(e);
  }
  return out;
}

/** Giant Link's blows knock down walls around the target. */
function smashWalls(b: Battle, target: Unit) {
  for (let y = target.y - 1; y <= target.y + target.size; y++) {
    for (let x = target.x - 1; x <= target.x + target.size; x++) {
      if (x < 0 || y < 0 || x >= b.width || y >= b.height) continue;
      const k = keyOf(b, x, y);
      if (b.tiles[k] === 'wall' || b.tiles[k] === 'cracked') b.tiles[k] = 'plain';
    }
  }
}

function onKillEffects(b: Battle, by: Unit, w: WeaponDef | undefined) {
  if (!w || by.hp <= 0) return;
  if (w.healOnKill) by.hp = Math.min(by.stats.hp, by.hp + Math.ceil(by.stats.hp * w.healOnKill));
  if (w.onKill === 'batSwarm') by.statuses.push({ kind: 'veiled', turns: 2 });
  if (w.onKill === 'undeadRally') {
    for (const a of b.units) {
      if (a.team === by.team && unitDist(a, by) <= 3 && unitTags(a).includes('undead')) a.buffs.push({ id: 'keetaRally', name: "Keeta's Rally", turns: 2, stats: { str: 2 } });
    }
  }
}

/** Resolve a full exchange. Mutates the battle (HP, deaths, XP, level-ups). */
export function resolveCombat(b: Battle, attacker: Unit, defender: Unit, rng: RNG, weaponId?: string, arrowId?: string): CombatResult {
  const fc = forecast(b, attacker, attacker, defender, weaponId, arrowId);
  // Using a weapon equips it; elemental arrows cost MP once per combat.
  if (fc.attacker.weaponId) equip(attacker, fc.attacker.weaponId);
  const aw = weaponDef(fc.attacker.weaponId);
  if (aw?.beam && fc.distance > 1) attacker.mp -= aw.beam; // Double Helix sword beam
  attacker.attacked = true;
  // Attacking gives away a concealed position.
  if (attacker.statuses.some((x) => x.kind === 'veiled')) attacker.statuses = attacker.statuses.filter((x) => x.kind !== 'veiled');
  if (fc.attacker.arrowId) {
    const mod = ABILITIES[fc.attacker.arrowId];
    if (mod.sta) attacker.sta -= mod.sta;
    else attacker.mp -= mod.mp;
  }

  type Swing = [Unit, Unit, SideForecast];
  const A: Swing = [attacker, defender, fc.attacker];
  const D: Swing = [defender, attacker, fc.defender];
  const braveA = fc.attacker.attacks >= 2 && !!weaponDef(fc.attacker.weaponId)?.brave;
  const perRoundA = braveA ? 2 : 1;
  const roundsA = fc.attacker.attacks / perRoundA;
  const seq: Swing[] = [];
  const dw = weaponDef(fc.defender.weaponId);
  const counterTwice = !!dw?.counterTwice || (defender.skills.includes('masterDuelist') && !!defender.armorBroken);
  for (let i = 0; i < perRoundA; i++) seq.push(A);
  if (fc.defender.canAttack) { seq.push(D); if (counterTwice) seq.push(D); }
  if (roundsA >= 2) for (let i = 0; i < perRoundA; i++) seq.push(A);
  if (fc.defender.attacks >= 2) seq.push(D);
  const stopped = new Set<string>();

  const strikes: Strike[] = [];
  const deaths: string[] = [];
  const dealt = new Set<string>();

  const broken: CombatResult['broken'] = [];
  for (const [by, target, side] of seq) {
    if (by.hp <= 0 || target.hp <= 0) break;
    if (stopped.has(by.uid)) continue;
    if (side.weaponId && by.weapons.includes(side.weaponId)) {
      const r = spendUse(by, side.weaponId);
      if (r.broke) broken.push({ uid: by.uid, weaponId: side.weaponId, into: r.into });
    }
    const hit = rng.chance(side.hit);
    const crit = hit && rng.chance(side.crit);
    let dmg = hit ? side.dmg * (crit ? (hasEffect(target, 'critGuard') ? 2 : 3) : 1) : 0;
    const elixir = by.buffs.findIndex((x) => x.id === 'elixir');
    if (dmg > 0 && elixir >= 0 && !isMagical(weaponDef(side.weaponId)?.type ?? 'natural')) { dmg *= 2; by.buffs.splice(elixir, 1); }
    if (hit) {
      const bubble = target.buffs.findIndex((x) => x.id === 'bubble');
      if (bubble >= 0) { target.buffs.splice(bubble, 1); dmg = 0; b.log.push(`${target.name}'s bubble pops!`); }
    }
    const blocked = hit && dmg > 0 && side.block > 0 && rng.chance(side.block);
    if (blocked) dmg = Math.floor(dmg / 2);
    if (blocked && hasEffect(target, 'stopFollowUp')) stopped.add(by.uid);
    // Magic Armor: MP (or Rupees) pay for the damage instead.
    if (dmg > 0 && hasEffect(target, 'magicArmor')) {
      const cost = Math.ceil(dmg / (hasEffect(target, 'nayruPearl') ? 4 : 2));
      if (target.mp >= cost) { target.mp -= cost; dmg = 0; }
      else if (target.team === 'player' && b.rewardRupees + (b.bonusRupees ?? 0) >= dmg * 5) { b.bonusRupees = (b.bonusRupees ?? 0) - dmg * 5; dmg = 0; }
    }
    dmg = Math.min(dmg, target.hp);
    let saved: Strike['saved'];
    if (dmg >= target.hp && hasEffect(target, 'surviveOnce') && !target.survivedOnce) {
      target.survivedOnce = true;
      dmg = target.hp - 1;
      saved = 'triforce';
    }
    target.hp -= dmg;
    if (dmg > 0) target.lastHitBy = by.uid;
    if (target.hp <= 0 && useFairy(target)) saved = 'fairy';
    // Igos du Ikana and his servants pull themselves back together (unless struck by light).
    if (target.hp <= 0 && (target.skills.includes('undyingKingdom') || target.skills.includes('skeletalReassembly'))
      && side.element !== 'light' && !target.usedAbilities?.includes('revive')) {
      (target.usedAbilities ??= []).push('revive');
      target.hp = Math.max(1, Math.ceil(target.stats.hp * 0.25));
      saved = 'revive';
      b.log.push(`${target.name} rises again!`);
    }
    if (dmg > 0) dealt.add(by.uid);
    let heal = 0;
    if (dmg > 0 && by.skills.includes('lifesteal')) {
      heal = Math.min(Math.floor(dmg / 2), by.stats.hp - by.hp);
      by.hp += heal;
    }
    const killed = target.hp <= 0;
    let thawed = false;
    let statuses: StatusKind[] | undefined;
    if (!killed && dmg > 0) {
      if (target.statuses.some((x) => x.kind === 'freeze' || x.kind === 'sleep')) { onDamaged(target); thawed = true; }
      statuses = rollElement(b, by, target, side.element, rng, side.weaponId ?? undefined);
    }
    strikes.push({ by: by.uid, target: target.uid, hit, crit, dmg, heal, targetHp: target.hp, byHp: by.hp, killed, blocked, saved, statuses, thawed });
    if (hit) b.log.push(...wwAfterHit(b, by, target, dmg, crit, weaponDef(side.weaponId), side.element, rng));
    if (killed) {
      by.kills++;
      deaths.push(target.uid);
      b.log.push(`${by.name} defeated ${target.name}.`);
      wwOnKill(b, by, target, rng);
      killUnit(b, target);
      onKillEffects(b, by, weaponDef(side.weaponId));
      break;
    }
    // Parries: dodge a blow and strike back through the guard (Hero of Winds), or with both swords (Desert Wind).
    if (!hit && target.hp > 0) {
      const mine = target === attacker ? fc.attacker : fc.defender;
      const kind = canParry(target, weaponDef(side.weaponId), fc.distance, rng);
      if (kind && mine.canAttack) {
        const tw = weaponDef(mine.weaponId);
        const pierceBonus = kind === 'parry' ? Math.floor(Math.max(0, effectiveStats(by).def) * 0.5) : 0;
        const blows = kind === 'desertWind' ? 2 : 1;
        onParry(b, target, tw);
        for (let k = 0; k < blows && by.hp > 0; k++) {
          const pcrit = rng.chance(Math.min(100, mine.crit + (tw?.parryCrit ?? 0)));
          let pd = Math.floor((mine.dmg + pierceBonus) * (kind === 'desertWind' ? 0.75 : 1)) * (pcrit ? 3 : 1);
          pd = Math.min(by.hp, Math.max(0, pd));
          by.hp -= pd;
          const pk = by.hp <= 0 && !useFairy(by);
          if (pd > 0) dealt.add(target.uid);
          strikes.push({ by: target.uid, target: by.uid, hit: true, crit: pcrit, dmg: pd, heal: 0, targetHp: Math.max(0, by.hp), byHp: target.hp, killed: pk, blocked: false });
          b.log.push(`${target.name} ${kind === 'parry' ? 'parries' : 'counters with both swords'}!`);
          if (pk) { target.kills++; deaths.push(by.uid); b.log.push(`${target.name} defeated ${by.name}.`); wwOnKill(b, target, by, rng); killUnit(b, by); }
        }
        if (by.hp <= 0) break;
      }
    }
  }
  // Sweeping, piercing and spinning attacks spill onto nearby enemies.
  const landed = strikes.some((s) => s.by === attacker.uid && s.hit && s.dmg > 0);
  if (landed && attacker.hp > 0) {
    const landing = hasEffect(attacker, 'landingStrike') && attacker.movedDist > 0 && CLASSES[attacker.classId]?.moveType === 'flying';
    const splash = splashTargets(b, attacker, defender, landing && !aw?.splash ? { ...aw!, splash: 'adjacent' } : aw);
    const half = Math.max(1, Math.floor(fc.attacker.dmg / 2));
    for (const e of splash) {
      const dmg = Math.min(e.hp, half);
      e.hp -= dmg;
      if (e.hp <= 0 && useFairy(e)) { /* saved */ }
      const killed = e.hp <= 0;
      strikes.push({ by: attacker.uid, target: e.uid, hit: true, crit: false, dmg, heal: 0, targetHp: e.hp, byHp: attacker.hp, killed, blocked: false, splash: true });
      if (killed) { attacker.kills++; deaths.push(e.uid); killUnit(b, e); b.log.push(`${attacker.name}'s sweep defeated ${e.name}.`); }
    }
    if (attacker.skills.includes('colossalStrength')) smashWalls(b, defender);
    if (fc.attacker.element === 'fire') thawMechanisms(b, defender, 1);
    if (fc.attacker.element === 'light') meltSunBlocks(b, defender, 1);
    if (attacker.skills.includes('natureMend')) {
      for (const a of b.units) if (a.team === attacker.team && unitDist(a, attacker) <= 2) a.hp = Math.min(a.stats.hp, a.hp + 2);
    }
  }

  // Zora Link's Electric Barrier shocks whoever strikes him up close.
  for (const [me, foe] of [[attacker, defender], [defender, attacker]] as const) {
    if (me.hp > 0 && foe.hp > 1 && me.buffs.some((x) => x.id === 'electric') && unitDist(me, foe) === 1 && strikes.some((s) => s.by === foe.uid)) {
      const d = Math.min(foe.hp - 1, 4);
      foe.hp -= d;
      strikes.push({ by: me.uid, target: foe.uid, hit: true, crit: false, dmg: d, heal: 0, targetHp: foe.hp, byHp: me.hp, killed: false, blocked: false, splash: true, statuses: ['shock'] });
      foe.statuses.push({ kind: 'shock', turns: 1 });
    }
  }
  for (const x of wwAfterCombat(b, attacker, defender)) {
    strikes.push({ by: x.by, target: x.uid, hit: true, crit: false, dmg: x.dmg, heal: 0, targetHp: x.hp, byHp: 0, killed: x.killed, blocked: false, splash: true });
    if (x.killed && !deaths.includes(x.uid)) deaths.push(x.uid);
  }
  for (const me of [attacker, defender]) if (me.hp > 0) gainSupport(b, me);
  const xp: { uid: string; amount: number }[] = [];
  const levelUps: LevelUp[] = [];
  for (const [me, foe] of [[attacker, defender], [defender, attacker]] as const) {
    if (me.team !== 'player' || me.hp <= 0) continue;
    const scholar = b.units.some((a) => a.team === me.team && a.skills.includes('encyclopedicKnowledge'));
    const amount = Math.round(xpFor(me, foe, dealt.has(me.uid), deaths.includes(foe.uid)) * (weaponDef(me.weapons[0])?.doubleXp ? 2 : 1) * (scholar ? 1.2 : 1));
    xp.push({ uid: me.uid, amount });
    for (const gains of gainXp(me, amount, rng)) levelUps.push({ uid: me.uid, name: me.name, level: me.level, gains });
  }
  return { strikes, broken, deaths, xp, levelUps };
}

/** Move a weapon to the front of the unit's inventory. */
export function equip(u: Unit, weaponId: string) {
  const i = u.weapons.indexOf(weaponId);
  if (i > 0) u.weapons.unshift(...u.weapons.splice(i, 1));
}

export interface HealResult {
  amount: number;
  xp: number;
  levelUps: LevelUp[];
}

export function healAmount(b: Battle, healer: Unit, staff: WeaponDef): number {
  return Math.round((effectiveStats(healer).mag + staff.might) * (staff.healBonus ?? 1) * (healer.team === 'player' ? b.healMult : 1));
}

export function resolveHeal(b: Battle, healer: Unit, target: Unit, rng: RNG, staffId?: string): HealResult {
  const staff = (staffId ? WEAPONS[staffId] : undefined) ?? healWeapons(healer, unitDist(healer, target))[0];
  const amount = staff ? Math.min(healAmount(b, healer, staff), target.stats.hp - target.hp) : 0;
  target.hp += amount;
  if (staff) spendUse(healer, staff.id);
  if (amount > 0) gainSupport(b, healer, 2, target);
  const levelUps: LevelUp[] = [];
  const xp = healer.team === 'player' ? 16 : 0;
  if (xp) for (const gains of gainXp(healer, xp, rng)) levelUps.push({ uid: healer.uid, name: healer.name, level: healer.level, gains });
  return { amount, xp, levelUps };
}

/**
 * Impa's Royal Protector: once per enemy phase, she takes the hit for an
 * adjacent ally, provided the attacker's weapon can reach her.
 */
export function findInterceptor(b: Battle, attacker: Unit, target: Unit, weaponId?: string): Unit | undefined {
  if (b.interceptUsed || target.team !== 'player') return undefined;
  const w = (weaponId ? WEAPONS[weaponId] : undefined) ?? weaponOf(attacker);
  const royal = (t: Unit) => ['dekuKing', 'dekuPrincess'].includes(t.templateId ?? '');
  return b.units.find((p) => p !== target && p.team === target.team && canReach(w, unitDist(attacker, p)) && (
    (p.skills.includes('royalProtector') && unitDist(p, target) <= 1)
    || (p.skills.includes('kingsShield') && target.skills.includes('undyingKingdom') && unitDist(p, target) <= 2)
    || (p.skills.includes('royalGuardDeku') && royal(target) && unitDist(p, target) <= 1)
    || (p.skills.includes('captainsRightHand') && target.isCommander && unitDist(p, target) <= 1)
    || (p.skills.includes('skyShield') && CLASSES[target.classId]?.moveType === 'flying' && unitDist(p, target) <= 1)));
}
