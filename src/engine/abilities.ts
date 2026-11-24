// Casting spells, performing songs and using personal abilities in battle.

import { ABILITIES, WEAPONS } from '../data/registry';
import { useFairy, type LevelUp } from './combat';
import { anchorCost, footprint, unitAt, unitDist } from './grid';
import type { RNG } from './rng';
import { INF } from './rules';
import { addStatus, clearStatus, weatherMight } from './status';
import { mountToggleBlocked } from './battle';
import { effectiveStats, gainXp, isMounted, mountOf, sizeWhen, unitTags } from './units';
import type { AbilityDef, Battle, Pos, StatusKind, Unit } from './types';

/** Best instrument discount among carried instruments, or null with no instrument. */
export function instrumentDiscount(u: Unit): number | null {
  const inst = u.weapons.map((id) => WEAPONS[id]).filter((w) => w?.type === 'instrument');
  if (!inst.length) return null;
  return Math.max(...inst.map((w) => w.songDiscount ?? 0));
}

/** MP (or stamina, for techniques) an ability costs this unit. */
export function abilityCost(u: Unit, def: AbilityDef): number {
  if (def.sta) return def.sta;
  if (def.kind !== 'song') return def.mp;
  return Math.max(1, def.mp - (instrumentDiscount(u) ?? 0));
}

export function costLabel(u: Unit, def: AbilityDef): string {
  if (def.sta) return `${def.sta} STA`;
  if (def.mp) return `${abilityCost(u, def)} MP`;
  return def.oncePerBattle ? 'once per battle' : '';
}

/** Learned abilities plus area techniques granted by carried weapons (Spin Attack). */
export function knownAbilities(u: Unit): AbilityDef[] {
  const learned = u.abilities.map((id) => ABILITIES[id]).filter(Boolean);
  const types = new Set(u.weapons.map((id) => WEAPONS[id]?.type));
  const innate = Object.values(ABILITIES).filter((a) => a.kind === 'technique' && a.area && a.weaponTypes?.some((t) => types.has(t)));
  return [...learned, ...innate.filter((a) => !learned.includes(a))];
}

/** Tiles a warp song can send the performer to. */
export function warpTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  if (!def.warp) return [];
  const out: Pos[] = [];
  const t = (x: number, y: number) => (x >= 0 && y >= 0 && x < b.width && y < b.height ? b.tiles[y * b.width + x] : undefined);
  const near = (x: number, y: number, kind: string) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => t(x + dx, y + dy) === kind);
  for (let y = 0; y < b.height; y++) {
    for (let x = 0; x < b.width; x++) {
      if (x === u.x && y === u.y) continue;
      if (anchorCost(b, u, x, y) >= INF) continue;
      if (!footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u; })) continue;
      const here = t(x, y);
      const ok = def.warp === 'forest' ? here === 'forest'
        : def.warp === 'fire' ? here !== 'lava' && near(x, y, 'lava')
        : def.warp === 'water' ? near(x, y, 'water')
        : def.warp === 'spirit' ? here === 'fort'
        : def.warp === 'shadow' ? near(x, y, 'wall')
        : x < 3; // light: deployment zone
      if (ok) out.push({ x, y });
    }
  }
  return out;
}

/** Why an ability can't be used right now, or null if it can. */
export function unusableReason(b: Battle, u: Unit, def: AbilityDef): string | null {
  if (!def.implemented) return 'Coming in a later update';
  if (def.kind === 'arrow') return 'Chosen when attacking with a bow';
  if (def.kind === 'technique' && !def.area) return 'Chosen in the combat forecast';
  if (def.kind === 'song' && instrumentDiscount(u) === null) return 'Needs an instrument';
  if (def.oncePerBattle && u.usedAbilities?.includes(def.id)) return 'Already used this battle';
  if (u.cooldowns?.[def.id]) return `Recharging (${u.cooldowns[def.id]} turn${u.cooldowns[def.id] > 1 ? 's' : ''})`;
  if (def.sta ? u.sta < def.sta : u.mp < abilityCost(u, def)) return def.sta ? 'Not enough stamina' : 'Not enough MP';
  if (def.id === 'spinAttack' && !b.units.some((e) => e.team !== u.team && unitDist(u, e) === 1)) return 'No adjacent enemies';
  if (def.warp && !warpTiles(b, u, def).length) return 'No suitable destination on this map';
  if (def.id === 'eponasSong') {
    const needsRemount = u.mounted === false && !!mountOf(u) && !mountToggleBlocked(b, u);
    if (!needsRemount && !b.units.some((a) => a.team === u.team && isMounted(a) && unitDist(u, a) <= 3)) return 'No mount to call and no riders nearby';
  }
  if (def.id === 'faroresWind' && u.faroreMark && !markFree(b, u)) return 'The return point is blocked';
  if (def.id === 'greatFairysBlessing' && !abilityTargets(b, u, def).length) return 'No one needs it';
  return null;
}

export function castableAbilities(b: Battle, u: Unit): AbilityDef[] {
  return knownAbilities(u).filter((d) => !unusableReason(b, u, d));
}

export function needsTile(def: AbilityDef): boolean {
  return !!def.warp;
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
  if (def.id === 'spinAttack') return 1;
  if (def.warp) return 0;
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
  mounted?: boolean;
  levelUps: LevelUp[];
}

/** Use an ability. Mutates the battle; returns null if it can't be used. */
export function castAbility(b: Battle, u: Unit, id: string, rng: RNG, targetUid?: string, at?: Pos): AbilityResult | null {
  const def = ABILITIES[id];
  if (!def || !knownAbilities(u).includes(def) || unusableReason(b, u, def)) return null;
  if (needsTile(def) && (!at || !warpTiles(b, u, def).some((p) => p.x === at.x && p.y === at.y))) return null;
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
    case 'eponasSong': {
      if (u.mounted === false && mountOf(u) && !mountToggleBlocked(b, u)) {
        u.mounted = true;
        u.size = sizeWhen(u, true);
        res.mounted = true;
      }
      for (const a of allies(3)) {
        if (!isMounted(a)) continue;
        a.buffs = a.buffs.filter((x) => x.id !== 'eponasSong');
        a.buffs.push({ id: 'eponasSong', name: "Epona's Song", turns: 2, stats: { mov: 2 } });
        res.buffed.push(a.uid);
      }
      break;
    }
    case 'songOfStorms':
      b.weather = { kind: 'rain', turns: 3 };
      for (const x of b.units) {
        if (x.statuses.some((st) => st.kind === 'burn')) { clearStatus(x, 'burn'); res.cleansed.push(x.uid); }
      }
      res.weather = true;
      break;
    case 'spinAttack': {
      const sword = u.weapons.map((w) => WEAPONS[w]).find((w) => w?.type === 'sword');
      const str = effectiveStats(u).str + (sword?.might ?? 0);
      for (const e of foes(1)) {
        const dmg = Math.min(e.hp, Math.max(0, str - effectiveStats(e).def));
        e.hp -= dmg;
        let saved: 'fairy' | undefined;
        if (e.hp <= 0 && useFairy(e)) saved = 'fairy';
        const killed = e.hp <= 0;
        if (!killed && dmg > 0) clearStatus(e, 'freeze');
        res.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, saved, statuses: [] });
        xp += 8 + (killed ? 20 : 0);
        if (killed) {
          u.kills++;
          b.units = b.units.filter((x) => x !== e);
          b.fallen.push(e);
          b.log.push(`${u.name}'s Spin Attack defeated ${e.name}.`);
        }
      }
      break;
    }
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
      if (def.warp && at) {
        res.warped = { from: { x: u.x, y: u.y }, to: { ...at } };
        u.x = at.x;
        u.y = at.y;
        break;
      }
      return null;
  }
  if (def.sta) u.sta -= def.sta;
  else u.mp -= abilityCost(u, def);
  if (def.cooldown) (u.cooldowns ??= {})[def.id] = def.cooldown;
  if (u.team === 'player') {
    for (const gains of gainXp(u, Math.min(60, xp), rng)) res.levelUps.push({ uid: u.uid, name: u.name, level: u.level, gains });
  }
  return res;
}
