// Casting spells, performing songs and using personal abilities in battle.

import { ABILITIES, WEAPONS } from '../data/registry';
import { useFairy, type LevelUp } from './combat';
import { anchorCost, footprint, unitAt, unitDist } from './grid';
import type { RNG } from './rng';
import { INF } from './rules';
import { addStatus, clearStatus, weatherMight } from './status';
import { effectiveStats, gainXp, unitTags } from './units';
import type { AbilityDef, Battle, Pos, StatusKind, Unit } from './types';

/** Best instrument discount among carried instruments, or null with no instrument. */
export function instrumentDiscount(u: Unit): number | null {
  const inst = u.weapons.map((id) => WEAPONS[id]).filter((w) => w?.type === 'instrument');
  if (!inst.length) return null;
  return Math.max(...inst.map((w) => w.songDiscount ?? 0));
}

export function abilityCost(u: Unit, def: AbilityDef): number {
  if (def.kind !== 'song') return def.mp;
  return Math.max(1, def.mp - (instrumentDiscount(u) ?? 0));
}

/** Why an ability can't be used right now, or null if it can. */
export function unusableReason(b: Battle, u: Unit, def: AbilityDef): string | null {
  if (!def.implemented) return 'Coming in a later update';
  if (def.kind === 'arrow') return 'Chosen when attacking with a bow';
  if (def.kind === 'song' && instrumentDiscount(u) === null) return 'Needs an instrument';
  if (def.oncePerBattle && u.usedAbilities?.includes(def.id)) return 'Already used this battle';
  if (u.mp < abilityCost(u, def)) return 'Not enough MP';
  if (def.id === 'faroresWind' && u.faroreMark && !markFree(b, u)) return 'The return point is blocked';
  if (def.id === 'greatFairysBlessing' && !abilityTargets(b, u, def).length) return 'No one needs it';
  return null;
}

export function castableAbilities(b: Battle, u: Unit): AbilityDef[] {
  return u.abilities.map((id) => ABILITIES[id]).filter((d) => d && !unusableReason(b, u, d));
}

/** Units an ability can be aimed at (only abilities that need a target). */
export function abilityTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  if (def.id === 'greatFairysBlessing') {
    return b.units.filter((a) => a.team === u.team && unitDist(u, a) <= 2 && (a.hp < a.stats.hp || a.mp < a.stats.mp));
  }
  return [];
}

export function needsTarget(def: AbilityDef): boolean {
  return def.id === 'greatFairysBlessing';
}

/** Radius of the area an ability affects around the caster (for previews). */
export function abilityRadius(def: AbilityDef): number {
  if (def.id === 'dinsFire') return 2;
  if (def.kind === 'song') return 3;
  return 0;
}

function markFree(b: Battle, u: Unit): boolean {
  const m = u.faroreMark;
  if (!m) return false;
  if (anchorCost(b, u, m.x, m.y) >= INF) return false;
  return footprint(m.x, m.y, u.size).every((p) => {
    const o = unitAt(b, p.x, p.y);
    return !o || o === u;
  });
}

export interface AbilityResult {
  def: AbilityDef;
  hits: { uid: string; dmg: number; hp: number; killed: boolean; saved?: 'fairy'; statuses: StatusKind[] }[];
  heals: { uid: string; amount: number }[];
  statuses: { uid: string; kind: StatusKind }[];
  cleansed: string[];
  buffed: string[];
  marked?: Pos;
  warped?: { from: Pos; to: Pos };
  weather?: boolean;
  levelUps: LevelUp[];
}

/** Use an ability. Mutates the battle; returns null if it can't be used. */
export function castAbility(b: Battle, u: Unit, id: string, rng: RNG, targetUid?: string): AbilityResult | null {
  const def = ABILITIES[id];
  if (!def || !u.abilities.includes(id) || unusableReason(b, u, def)) return null;
  const target = targetUid ? b.units.find((x) => x.uid === targetUid) : undefined;
  if (needsTarget(def) && (!target || !abilityTargets(b, u, def).includes(target))) return null;

  const res: AbilityResult = { def, hits: [], heals: [], statuses: [], cleansed: [], buffed: [], levelUps: [] };
  const allies = (r: number) => b.units.filter((a) => a.team === u.team && unitDist(u, a) <= r);
  const foes = (r: number) => b.units.filter((e) => e.team !== u.team && unitDist(u, e) <= r);
  let xp = 15;

  switch (id) {
    case 'dinsFire': {
      const mag = effectiveStats(u).mag;
      for (const e of foes(2)) {
        const dmg = Math.min(e.hp, Math.max(0, mag + 6 + weatherMight(b, 'fire') - effectiveStats(e).res));
        e.hp -= dmg;
        let saved: 'fairy' | undefined;
        if (e.hp <= 0 && useFairy(e)) saved = 'fairy';
        const killed = e.hp <= 0;
        const statuses: StatusKind[] = [];
        if (!killed && dmg > 0) {
          clearStatus(e, 'freeze');
          if (b.weather?.kind !== 'rain' && rng.chance(50)) { addStatus(e, 'burn', u.skills.includes('witchOfFlame') ? 3 : 2); statuses.push('burn'); }
        }
        res.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, saved, statuses });
        xp += 6 + (killed ? 20 : 0);
        if (killed) {
          u.kills++;
          b.units = b.units.filter((x) => x !== e);
          b.fallen.push(e);
          b.log.push(`${u.name}'s Din's Fire defeated ${e.name}.`);
        }
      }
      break;
    }
    case 'nayrusLove':
      u.buffs = u.buffs.filter((x) => !x.barrier);
      u.buffs.push({ id: 'nayrusLove', name: "Nayru's Love", turns: 1, barrier: true });
      res.buffed.push(u.uid);
      break;
    case 'faroresWind':
      if (u.faroreMark) {
        const from = { x: u.x, y: u.y };
        u.x = u.faroreMark.x;
        u.y = u.faroreMark.y;
        res.warped = { from, to: { ...u.faroreMark } };
        u.faroreMark = undefined;
      } else {
        u.faroreMark = { x: u.x, y: u.y };
        res.marked = { ...u.faroreMark };
      }
      break;
    case 'zeldasLullaby':
      for (const a of allies(3)) {
        if (a.statuses.length) { a.statuses = []; res.cleansed.push(a.uid); }
      }
      break;
    case 'sariasSong':
      for (const a of allies(3)) {
        a.buffs = a.buffs.filter((x) => x.id !== 'sariasSong');
        a.buffs.push({ id: 'sariasSong', name: "Saria's Song", turns: 3, stats: { spd: 2, lck: 2 } });
        res.buffed.push(a.uid);
      }
      break;
    case 'sunsSong':
      for (const e of foes(3)) {
        if (!unitTags(e).includes('undead')) continue;
        addStatus(e, 'stun', 1);
        res.statuses.push({ uid: e.uid, kind: 'stun' });
      }
      break;
    case 'songOfStorms':
      b.weather = { kind: 'rain', turns: 3 };
      for (const x of b.units) {
        if (x.statuses.some((st) => st.kind === 'burn')) { clearStatus(x, 'burn'); res.cleansed.push(x.uid); }
      }
      res.weather = true;
      break;
    case 'greatFairysBlessing': {
      const t = target!;
      const amount = t.stats.hp - t.hp;
      t.hp = t.stats.hp;
      t.mp = t.stats.mp;
      res.heals.push({ uid: t.uid, amount });
      (u.usedAbilities ??= []).push(id);
      break;
    }
    default:
      return null;
  }
  u.mp -= abilityCost(u, def);
  if (u.team === 'player') {
    for (const gains of gainXp(u, Math.min(60, xp), rng)) res.levelUps.push({ uid: u.uid, name: u.name, level: u.level, gains });
  }
  return res;
}
