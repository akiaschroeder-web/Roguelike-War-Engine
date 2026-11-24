import { CLASSES, TERRAIN_BONUS } from '../data/classes';
import { isMagical, TRIANGLE, WEAPONS } from '../data/weapons';
import { dist, terrainAt } from './grid';
import type { RNG } from './rng';
import { effectiveStats, gainXp } from './units';
import type { Battle, Pos, StatKey, Unit, WeaponDef } from './types';

export interface SideForecast {
  uid: string;
  canAttack: boolean;
  dmg: number;
  hit: number;
  crit: number;
  attacks: number; // 0, 1 or 2
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
  /** Striker's HP after any lifesteal. */
  byHp: number;
  killed: boolean;
  saved?: boolean; // phoenix feather
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

export function weaponOf(u: Unit): WeaponDef {
  return WEAPONS[u.weaponId];
}

export function canReach(w: WeaponDef, d: number): boolean {
  return d >= w.minRange && d <= w.maxRange;
}

function triangleOf(a: WeaponDef, d: WeaponDef): -1 | 0 | 1 {
  if (TRIANGLE[a.type] === d.type) return 1;
  if (TRIANGLE[d.type] === a.type) return -1;
  return 0;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function sideStats(b: Battle, atk: Unit, atkPos: Pos, def: Unit, defPos: Pos): SideForecast {
  const aw = weaponOf(atk);
  const dw = weaponOf(def);
  const as = effectiveStats(atk, b.relics);
  const ds = effectiveStats(def, b.relics);
  const d = dist(atkPos, defPos);
  const canAttack = aw.type !== 'staff' && canReach(aw, d);
  const tri = triangleOf(aw, dw);
  const terrain = TERRAIN_BONUS[terrainAt(b, defPos.x, defPos.y)];
  const magical = isMagical(aw.type);
  const effective = !!aw.effective?.includes(CLASSES[def.classId].moveType);

  const momentum = atk.skills.includes('momentum') ? Math.min(6, atk.kills * 2) : 0;
  const might = aw.might * (effective ? 2 : 1);
  const power = (magical ? as.mag : as.str) + might + tri + momentum;
  let defense = (magical ? ds.res : ds.def) + terrain.def;
  if (atk.skills.includes('armorBreak')) defense = Math.floor(defense / 2);
  let dmg = Math.max(0, power - defense);
  if (def.skills.includes('bulwark')) dmg = Math.max(0, dmg - 3);

  const hitBonus = atk.team === 'player' && b.relics.includes('tacticianMap') ? 15 : 0;
  const critBonus = (atk.team === 'player' && b.relics.includes('critLens') ? 10 : 0) + (atk.skills.includes('deadeye') ? 20 : 0);
  const avoid = ds.spd * 2 + terrain.avoid + (def.skills.includes('nimble') ? 20 : 0);
  const hit = clamp(aw.hit + as.skl * 2 + tri * 15 + hitBonus - avoid);
  const crit = clamp(aw.crit + Math.floor(as.skl / 2) + critBonus - Math.floor(ds.skl / 4));

  const attacks = canAttack ? (as.spd - ds.spd >= 4 ? 2 : 1) : 0;
  return { uid: atk.uid, canAttack, dmg, hit, crit, attacks, triangle: tri, effective };
}

/** Preview a fight where `attacker` strikes `defender` from `from`. */
export function forecast(b: Battle, attacker: Unit, from: Pos, defender: Unit): Forecast {
  const defPos = { x: defender.x, y: defender.y };
  return {
    attacker: sideStats(b, attacker, from, defender, defPos),
    defender: sideStats(b, defender, defPos, attacker, from),
    distance: dist(from, defPos),
  };
}

/** Rough expected damage of a forecast side, used by the AI. */
export function expectedDamage(s: SideForecast): number {
  const perHit = s.dmg * (1 + (2 * s.crit) / 100);
  return (perHit * s.hit * s.attacks) / 100;
}

function xpFor(unit: Unit, foe: Unit, dealtDamage: boolean, killed: boolean): number {
  const diff = foe.level - unit.level;
  let xp = dealtDamage ? 10 + diff * 2 : 1;
  if (killed) xp += 25 + diff * 3 + (foe.isBoss ? 40 : 0);
  return Math.max(1, Math.min(100, xp));
}

function killUnit(b: Battle, u: Unit) {
  b.units = b.units.filter((x) => x !== u);
  b.fallen.push(u);
}

/** Resolve a full exchange. Mutates the battle (HP, deaths, XP, level-ups). */
export function resolveCombat(b: Battle, attacker: Unit, defender: Unit, rng: RNG): CombatResult {
  const fc = forecast(b, attacker, { x: attacker.x, y: attacker.y }, defender);
  const seq: [Unit, Unit, SideForecast][] = [];
  const A: [Unit, Unit, SideForecast] = [attacker, defender, fc.attacker];
  const D: [Unit, Unit, SideForecast] = [defender, attacker, fc.defender];
  const vantage = defender.skills.includes('vantage') && fc.defender.canAttack;
  if (vantage) seq.push(D, A);
  else {
    seq.push(A);
    if (fc.defender.canAttack) seq.push(D);
  }
  if (fc.attacker.attacks === 2) seq.push(A);
  if (fc.defender.attacks === 2) seq.push(D);

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
    if (dmg >= target.hp && target.team === 'player' && b.relics.includes('phoenixFeather') && !b.phoenixUsed) {
      b.phoenixUsed = true;
      dmg = target.hp - 1;
      saved = true;
    }
    target.hp -= dmg;
    if (dmg > 0) dealt.add(by.uid);
    let heal = 0;
    if (dmg > 0 && (by.skills.includes('lifesteal') || by.weaponId === 'nosferatu')) {
      heal = Math.min(Math.floor(dmg / 2), by.stats.hp - by.hp);
      by.hp += heal;
    }
    const killed = target.hp <= 0;
    strikes.push({ by: by.uid, target: target.uid, hit, crit, dmg, heal, targetHp: target.hp, byHp: by.hp, killed, saved });
    if (killed) {
      by.kills++;
      deaths.push(target.uid);
      if (by.team === 'player' && b.relics.includes('vampireFang')) {
        by.hp = Math.min(by.stats.hp, by.hp + 8);
        strikes[strikes.length - 1].byHp = by.hp;
      }
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

export interface HealResult {
  amount: number;
  xp: number;
  levelUps: LevelUp[];
}

export function healAmount(b: Battle, healer: Unit): number {
  return effectiveStats(healer, b.relics).mag + weaponOf(healer).might;
}

export function resolveHeal(b: Battle, healer: Unit, target: Unit, rng: RNG): HealResult {
  const amount = Math.min(healAmount(b, healer), target.stats.hp - target.hp);
  target.hp += amount;
  const levelUps: LevelUp[] = [];
  const xp = healer.team === 'player' ? 16 : 0;
  if (xp) for (const gains of gainXp(healer, xp, rng)) levelUps.push({ uid: healer.uid, name: healer.name, level: healer.level, gains });
  return { amount, xp, levelUps };
}
