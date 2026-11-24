import { CLASSES, WEAPONS } from '../data/registry';
import { keyOf, terrainAt, unitDist } from './grid';
import type { RNG } from './rng';
import { isMagical, TERRAIN_BONUS, TRIANGLE } from './rules';
import { accessoryBonus, effectiveStats, gainXp, hasEffect, unitTags } from './units';
import type { Battle, Pos, StatKey, Unit, WeaponDef } from './types';

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
  saved?: boolean;
}

export interface LevelUp {
  uid: string;
  name: string;
  level: number;
  gains: Partial<Record<StatKey, number>>;
}

export interface CombatResult {
  strikes: Strike[];
  deaths: string[];
  xp: { uid: string; amount: number }[];
  levelUps: LevelUp[];
}

export const weaponDef = (id: string | null | undefined): WeaponDef | undefined => (id ? WEAPONS[id] : undefined);

/** The equipped (first) weapon. */
export function weaponOf(u: Unit): WeaponDef {
  return WEAPONS[u.weapons[0]] ?? WEAPONS.fangs;
}

export function canWield(u: Unit, w: WeaponDef): boolean {
  return w.type === 'natural' || !!CLASSES[u.classId]?.weapons.includes(w.type);
}

export function canReach(w: WeaponDef, d: number): boolean {
  return d >= w.minRange && d <= w.maxRange;
}

/** Offensive weapons the unit can use at distance d (equipped first). */
export function attackWeapons(u: Unit, d: number): WeaponDef[] {
  return u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type !== 'staff' && canWield(u, w) && canReach(w, d));
}

export function healWeapons(u: Unit, d: number): WeaponDef[] {
  return u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type === 'staff' && canWield(u, w) && canReach(w, d));
}

/** Widest offensive range (for threat displays and AI). */
export function maxAttackRange(u: Unit): { min: number; max: number } | null {
  const ws = u.weapons.map((id) => WEAPONS[id]).filter((w) => w && w.type !== 'staff' && canWield(u, w));
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
  if (hasEffect(u, 'mountedAvoid') && CLASSES[u.classId]?.moveType === 'cavalry') m.avoid += 10;
  if (hasEffect(u, 'beastSlayer') && unitTags(foe).includes('beast')) m.str += 3;
  if (hasEffect(u, 'giantEye') && foe.size >= 2) m.hit += 20;
  return m;
}

function sideStats(b: Battle, atk: Unit, atkPos: Pos, def: Unit, defPos: Pos, initiating: boolean, weapon: WeaponDef | undefined, foeWeapon: WeaponDef | undefined): SideForecast {
  const d = unitDist({ ...atk, ...atkPos }, { ...def, ...defPos });
  if (!weapon || weapon.type === 'staff' || !canReach(weapon, d)) {
    return { uid: atk.uid, weaponId: weapon?.id ?? null, canAttack: false, dmg: 0, hit: 0, crit: 0, attacks: 0, triangle: 0, effective: false };
  }
  const as = effectiveStats(atk);
  const ds = effectiveStats(def);
  const am = situational(b, atk, atkPos, def, initiating);
  const dm = situational(b, def, defPos, atk, !initiating);
  const ab = accessoryBonus(atk);
  const db = accessoryBonus(def);
  const terrain = TERRAIN_BONUS[b.tiles[keyOf(b, defPos.x, defPos.y)]];
  const tri = triangleOf(weapon, foeWeapon);
  const magical = isMagical(weapon.type);
  const tags = unitTags(def);
  const effective = !!weapon.effective?.some((t) => tags.includes(t));

  let might = weapon.might * (effective ? 2 : 1);
  if (atk.skills.includes('heavyForging') && weapon.twoHanded) might += 2;
  const power = (magical ? as.mag + am.mag : as.str + am.str) + might + tri + am.dmg;
  let defense = magical ? ds.res + dm.res : ds.def + dm.def + terrain.def;
  if (weapon.pierce) defense = Math.floor(defense * (1 - weapon.pierce));
  let dmg = Math.max(0, power - defense);
  if (hasEffect(atk, 'desperation') && atk.hp < atk.stats.hp / 2) dmg = Math.floor(dmg * 1.25);

  const atkSpd = as.spd + am.spd - Math.max(0, weapon.weight - as.con);
  const defW = foeWeapon ?? weapon;
  const defSpd = ds.spd + dm.spd - Math.max(0, (foeWeapon ? defW.weight : 0) - ds.con);
  const hit = clamp(weapon.hit + (as.skl + am.skl) * 2 + Math.floor(as.lck / 2) + tri * 15 + am.hit + ab.hit
    - (Math.max(0, defSpd) * 2 + ds.lck + terrain.avoid + dm.avoid + db.avoid));
  const crit = clamp(weapon.crit + Math.floor((as.skl + am.skl) / 2) + am.crit + ab.crit - ds.lck);

  let attacks = atkSpd - defSpd >= 4 ? 2 : 1;
  if (weapon.brave && initiating) attacks *= 2;
  return { uid: atk.uid, weaponId: weapon.id, canAttack: true, dmg, hit, crit, attacks, triangle: tri, effective };
}

/** The defender counters with the first carried weapon that reaches. */
export function counterWeapon(def: Unit, d: number): WeaponDef | undefined {
  return attackWeapons(def, d)[0];
}

/** Preview `attacker` (standing at `from`, using `weaponId`) attacking `defender`. */
export function forecast(b: Battle, attacker: Unit, from: Pos, defender: Unit, weaponId?: string): Forecast {
  const defPos = { x: defender.x, y: defender.y };
  const d = unitDist(attacker, defender, from);
  const aw = (weaponId ? weaponDef(weaponId) : undefined) ?? attackWeapons(attacker, d)[0];
  const dw = counterWeapon(defender, d);
  return {
    attacker: sideStats(b, attacker, from, defender, defPos, true, aw, dw),
    defender: sideStats(b, defender, defPos, attacker, from, false, dw, aw),
    distance: d,
  };
}

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
export function resolveCombat(b: Battle, attacker: Unit, defender: Unit, rng: RNG, weaponId?: string): CombatResult {
  const fc = forecast(b, attacker, attacker, defender, weaponId);
  // Using a weapon equips it.
  if (fc.attacker.weaponId) equip(attacker, fc.attacker.weaponId);

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

  for (const [by, target, side] of seq) {
    if (by.hp <= 0 || target.hp <= 0) break;
    const hit = rng.chance(side.hit);
    const crit = hit && rng.chance(side.crit);
    let dmg = hit ? side.dmg * (crit ? 3 : 1) : 0;
    dmg = Math.min(dmg, target.hp);
    let saved = false;
    if (dmg >= target.hp && hasEffect(target, 'surviveOnce') && !target.survivedOnce) {
      target.survivedOnce = true;
      dmg = target.hp - 1;
      saved = true;
    }
    target.hp -= dmg;
    if (dmg > 0) dealt.add(by.uid);
    let heal = 0;
    if (dmg > 0 && by.skills.includes('lifesteal')) {
      heal = Math.min(Math.floor(dmg / 2), by.stats.hp - by.hp);
      by.hp += heal;
    }
    const killed = target.hp <= 0;
    strikes.push({ by: by.uid, target: target.uid, hit, crit, dmg, heal, targetHp: target.hp, byHp: by.hp, killed, saved });
    if (killed) {
      by.kills++;
      deaths.push(target.uid);
      b.log.push(`${by.name} defeated ${target.name}.`);
      killUnit(b, target);
      break;
    }
  }

  const xp: { uid: string; amount: number }[] = [];
  const levelUps: LevelUp[] = [];
  for (const [me, foe] of [[attacker, defender], [defender, attacker]] as const) {
    if (me.team !== 'player' || me.hp <= 0) continue;
    const amount = xpFor(me, foe, dealt.has(me.uid), deaths.includes(foe.uid));
    xp.push({ uid: me.uid, amount });
    for (const gains of gainXp(me, amount, rng)) levelUps.push({ uid: me.uid, name: me.name, level: me.level, gains });
  }
  return { strikes, deaths, xp, levelUps };
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
