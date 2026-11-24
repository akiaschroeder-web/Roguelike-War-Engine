import { ABILITIES, CLASSES, ITEMS, WEAPONS } from '../data/registry';
import { gainSupport, supportBonus } from './supports';
import { isHelpless, onDamaged, rollElement, statusMods, weatherMight } from './status';
import { keyOf, terrainAt, unitDist } from './grid';
import type { RNG } from './rng';
import { isMagical, TERRAIN_BONUS, TRIANGLE } from './rules';
import { effectiveStats, forgeLevel, gainXp, gearBonus, hasEffect, isMounted, spendUse, unitTags } from './units';
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
  saved?: 'triforce' | 'fairy';
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
  return w.type === 'natural' || w.type === 'instrument' || !!CLASSES[u.classId]?.weapons.includes(w.type);
}

export function canReach(w: WeaponDef, d: number): boolean {
  return d >= w.minRange && d <= w.maxRange;
}

/** Offensive weapons the unit can use at distance d (equipped first). */
export function attackWeapons(u: Unit, d: number): WeaponDef[] {
  return u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type !== 'staff' && w.type !== 'instrument' && canWield(u, w) && canReach(w, d));
}

export function healWeapons(u: Unit, d: number): WeaponDef[] {
  return u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type === 'staff' && canWield(u, w) && canReach(w, d));
}

/** Widest offensive range (for threat displays and AI). */
export function maxAttackRange(u: Unit): { min: number; max: number } | null {
  const ws = u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type !== 'staff' && w.type !== 'instrument' && canWield(u, w));
  if (!ws.length) return null;
  return { min: Math.min(...ws.map((w) => w.minRange)), max: Math.max(...ws.map((w) => w.maxRange)) };
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
  const sup = supportBonus(b, u, pos);
  m.hit += sup.hit; m.avoid += sup.avoid; m.crit += sup.crit; m.def += sup.def; m.res += sup.def;
  return m;
}

function sideStats(
  b: Battle, atk: Unit, atkPos: Pos, def: Unit, defPos: Pos, initiating: boolean,
  weapon: WeaponDef | undefined, foeWeapon: WeaponDef | undefined, arrow?: AbilityDef,
): SideForecast {
  const d = unitDist({ ...atk, ...atkPos }, { ...def, ...defPos });
  const helpless = !initiating && isHelpless(atk);
  if (!weapon || weapon.type === 'staff' || weapon.type === 'instrument' || !canReach(weapon, d) || helpless) {
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
  const magical = isMagical(weapon.type);
  const tags = unitTags(def);
  const effective = !![...(weapon.effective ?? []), ...(arrow?.effective ?? [])].some((t) => tags.includes(t));
  const element = arrow?.element ?? weapon.element;
  const sa = statusMods(atk);
  const sd = statusMods(def);

  let might = (weapon.might + forgeLevel(atk, weapon.id) + (arrow?.might ?? 0)) * (effective ? 2 : 1) + weatherMight(b, element);
  if (atk.skills.includes('heavyForging') && weapon.twoHanded) might += 2;
  const power = (magical ? as.mag + am.mag : as.str + am.str) + might + tri + am.dmg + sa.dmg;
  let defense = magical ? ds.res + dm.res : Math.max(0, ds.def + dm.def + sd.def) + terrain.def;
  if (weapon.pierce) defense = Math.floor(defense * (1 - weapon.pierce));
  let dmg = Math.max(0, power - defense);
  if (hasEffect(atk, 'desperation') && atk.hp < atk.stats.hp / 2) dmg = Math.floor(dmg * 1.25);
  if (def.buffs?.some((x) => x.barrier)) dmg = 0; // Nayru's Love

  const atkSpd = as.spd + am.spd - Math.max(0, weapon.weight - as.con);
  const defW = foeWeapon ?? weapon;
  const defSpd = ds.spd + dm.spd - Math.max(0, (foeWeapon ? defW.weight : 0) - ds.con);
  const hit = clamp(weapon.hit + (arrow?.hit ?? 0) + (as.skl + am.skl) * 2 + Math.floor(as.lck / 2) + tri * 15 + am.hit + ab.hit + sa.hit - (b.weather?.kind === 'sandstorm' ? 15 : 0)
    - (Math.max(0, defSpd) * 2 + ds.lck + terrain.avoid + dm.avoid + db.avoid + sd.avoid));
  const crit = clamp(weapon.crit + (arrow?.crit ?? 0) + Math.floor((as.skl + am.skl) / 2) + am.crit + ab.crit - ds.lck);

  let attacks = atkSpd - defSpd >= 4 ? 2 : 1;
  if (weapon.brave && initiating) attacks *= 2;
  return { uid: atk.uid, weaponId: weapon.id, canAttack: true, dmg, hit, crit, attacks, triangle: tri, effective, block: Math.min(80, db.block), arrowId: arrow?.id ?? null, element };
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

/** Resolve a full exchange. Mutates the battle (HP, deaths, XP, level-ups). */
export function resolveCombat(b: Battle, attacker: Unit, defender: Unit, rng: RNG, weaponId?: string, arrowId?: string): CombatResult {
  const fc = forecast(b, attacker, attacker, defender, weaponId, arrowId);
  // Using a weapon equips it; elemental arrows cost MP once per combat.
  if (fc.attacker.weaponId) equip(attacker, fc.attacker.weaponId);
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
  for (let i = 0; i < perRoundA; i++) seq.push(A);
  if (fc.defender.canAttack) seq.push(D);
  if (roundsA >= 2) for (let i = 0; i < perRoundA; i++) seq.push(A);
  if (fc.defender.attacks >= 2) seq.push(D);

  const strikes: Strike[] = [];
  const deaths: string[] = [];
  const dealt = new Set<string>();

  const broken: CombatResult['broken'] = [];
  for (const [by, target, side] of seq) {
    if (by.hp <= 0 || target.hp <= 0) break;
    if (side.weaponId && by.weapons.includes(side.weaponId)) {
      const r = spendUse(by, side.weaponId);
      if (r.broke) broken.push({ uid: by.uid, weaponId: side.weaponId, into: r.into });
    }
    const hit = rng.chance(side.hit);
    const crit = hit && rng.chance(side.crit);
    let dmg = hit ? side.dmg * (crit ? (hasEffect(target, 'critGuard') ? 2 : 3) : 1) : 0;
    const blocked = hit && dmg > 0 && side.block > 0 && rng.chance(side.block);
    if (blocked) dmg = Math.floor(dmg / 2);
    dmg = Math.min(dmg, target.hp);
    let saved: Strike['saved'];
    if (dmg >= target.hp && hasEffect(target, 'surviveOnce') && !target.survivedOnce) {
      target.survivedOnce = true;
      dmg = target.hp - 1;
      saved = 'triforce';
    }
    target.hp -= dmg;
    if (target.hp <= 0 && useFairy(target)) saved = 'fairy';
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
    if (killed) {
      by.kills++;
      deaths.push(target.uid);
      b.log.push(`${by.name} defeated ${target.name}.`);
      killUnit(b, target);
      break;
    }
  }

  for (const me of [attacker, defender]) if (me.hp > 0) gainSupport(b, me);
  const xp: { uid: string; amount: number }[] = [];
  const levelUps: LevelUp[] = [];
  for (const [me, foe] of [[attacker, defender], [defender, attacker]] as const) {
    if (me.team !== 'player' || me.hp <= 0) continue;
    const amount = xpFor(me, foe, dealt.has(me.uid), deaths.includes(foe.uid));
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
  return b.units.find((p) => p !== target && p.team === target.team && p.skills.includes('royalProtector')
    && unitDist(p, target) <= 1 && canReach(w, unitDist(attacker, p)));
}
