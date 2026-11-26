// Casting spells, performing songs and using personal abilities in battle.

import { ABILITIES, ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import { castTermina, ENEMY_TRANSFORMS, terminaNeedsTarget, terminaTargets, terminaUnusable } from './terminaAbilities';
import { castWindWaker, wwCostMult, wwNeedsTarget, wwNeedsTile, wwTargets, wwTiles, wwUnusable } from './windwaker';
import { supportCostMult } from './supports';
import { castTwilight, techniqueAllowed, techniqueCost, tpCostMult, tpNeedsTarget, tpNeedsTile, tpTargets, tpTiles, tpUnusable } from './twilight';
import { castSkyward, SS_ENEMY_TRANSFORMS, ssCostMult, ssNeedsTarget, ssNeedsTile, ssTargets, ssTiles, ssUnusable, TRANSFORM_ABILITIES } from './skyward';
import { buildAt, buildTargets, canDig, dig, hasTimeBlocks, ignite, meltSunBlocks, toggleTimeBlocks } from './field';
import { roomFor, transformInto } from './transform';
import { useFairy, type LevelUp } from './combat';
import { anchorCost, footDist, footprint, tilesInRange, unitAt, unitDist } from './grid';
import type { RNG } from './rng';
import { INF } from './rules';
import { addStatus, clearStatus, hasStatus, onDamaged, STATUS_INFO, weatherMight } from './status';
import { mountToggleBlocked } from './battle';
import { effectiveStats, gainXp, hasEffect, isMounted, mountOf, sizeWhen, unitTags } from './units';
import type { AbilityDef, Battle, Pos, StatusKind, Unit } from './types';

/** Best instrument discount among carried instruments, or null with no instrument. */
export function instrumentDiscount(u: Unit): number | null {
  const inst = u.weapons.map((id) => WEAPONS[id]).filter((w) => w?.type === 'instrument');
  if (!inst.length) return null;
  return Math.max(...inst.map((w) => w.songDiscount ?? 0));
}

/** MP (or stamina, for techniques) an ability costs this unit. */
export function abilityCost(u: Unit, def: AbilityDef, b?: Battle): number {
  const m = wwCostMult(b, u, def) * tpCostMult(b, u, def) * ssCostMult(b, u, def) * supportCostMult(b, u, def.kind, def.element, def.id);
  if (def.sta) return techniqueCost(u, def, b?.bonus);
  if (m !== 1) return Math.max(def.kind === 'song' ? 1 : 0, Math.floor(abilityCost(u, def) * m));
  if (def.mp && u.buffs?.some((x) => x.id === 'chateau')) return 0; // Chateau Romani
  if (def.kind !== 'song') return def.mp;
  let cost = Math.max(1, def.mp - (instrumentDiscount(u) ?? 0));
  if (hasEffect(u, 'songThrift')) cost = Math.ceil(cost * 0.75);
  if (hasEffect(u, 'timeThrift') && /time|soaring/i.test(def.id)) cost = Math.ceil(cost * 0.5);
  return Math.max(1, cost);
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
  const innate = Object.values(ABILITIES).filter((a) => (a.kind === 'technique' && a.area && !a.hidden && a.weaponTypes?.some((t) => types.has(t)))
    || (a.grantedBy?.weapons?.some((w) => u.weapons.includes(w))) || (a.grantedBy?.skill && u.skills.includes(a.grantedBy.skill))
    || (a.grantedBy?.gear?.some((g) => Object.values(u.gear ?? {}).includes(g) || u.maskForm === g))
    || (a.grantedBy?.race && u.race === a.grantedBy.race) || (a.grantedBy?.templates?.includes(u.templateId ?? u.bossId ?? ''))
    || a.grantedBy?.everyone || a.grantedBy?.skills?.some((s) => u.skills.includes(s)) || a.grantedBy?.races?.includes(u.race));
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
        : def.warp === 'owl' ? near(x, y, 'owlStatue')
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
  if ((def.kind === 'spell' || def.kind === 'song') && hasStatus(u, 'silence')) return 'Silenced';
  if (def.oncePerBattle && u.usedAbilities?.includes(def.id)) return 'Already used this battle';
  if (u.cooldowns?.[def.id]) return `Recharging (${u.cooldowns[def.id]} turn${u.cooldowns[def.id] > 1 ? 's' : ''})`;
  if (TRANSFORM_ABILITIES.has(def.id) && u.buffs?.some((x) => x.id === 'sacredSeal')) return 'Sealed: can\'t transform';
  const ssr = ssUnusable(b, u, def);
  if (ssr) return ssr;
  if (def.sta ? u.sta < abilityCost(u, def, b) : u.mp < abilityCost(u, def, b)) return def.sta ? 'Not enough stamina' : 'Not enough MP';
  const tr = terminaUnusable(b, u, def);
  if (tr !== undefined) return tr;
  const wr = wwUnusable(b, u, def);
  if (wr !== undefined) return wr;
  if (def.kind === 'technique' && !techniqueAllowed(u, def, b)) return def.mounted ? 'Only while mounted' : def.id === 'greatSpin' ? 'Only at full HP' : 'Not learned';
  const tw = tpUnusable(b, u, def);
  if (tw !== undefined) return tw;
  if (def.id === 'spinAttack' && !b.units.some((e) => e.team !== u.team && unitDist(u, e) === 1)) return 'No adjacent enemies';
  if (def.warp && !warpTiles(b, u, def).length) return 'No suitable destination on this map';
  if (def.id === 'hookshotPull') {
    if (u.movedDist > 0) return 'Only instead of walking';
    if (u.size > 1) return 'Too big to be pulled';
    if (!hookTiles(b, u).length) return 'Nothing to latch onto';
  }
  if (def.id === 'digHere' && !canDig(b, u)) return 'Can’t dig here';
  if (def.id === 'buildHere' && !buildTargets(b, u).length) return 'Nothing to build';
  if (def.id === 'transportAlly' && !transportee(b, u)) return 'No adjacent ally on foot';
  if (def.id === 'songOfTime' && !hasTimeBlocks(b) && !b.units.some((a) => a.team === u.team && a !== u && unitDist(u, a) <= 3 && Object.keys(a.cooldowns ?? {}).length)) return 'No Time Blocks or cooldowns';
  if (def.id === 'eponasSong') {
    const needsRemount = u.mounted === false && !!mountOf(u) && !mountToggleBlocked(b, u);
    if (!needsRemount && !b.units.some((a) => a.team === u.team && isMounted(a) && unitDist(u, a) <= 3)) return 'No mount to call and no riders nearby';
  }
  if (def.id === 'faroresWind' && u.faroreMark && !markFree(b, u)) return 'The return point is blocked';
  if (def.id === 'greatFairysBlessing' && !abilityTargets(b, u, def).length) return 'No one needs it';
  if (def.id === 'masterCraftsman' && !abilityTargets(b, u, def).length) return 'No worn weapons nearby';
  if (def.id === 'transformGanon') {
    if (u.hp > u.stats.hp / 2) return 'Only below half HP';
    if (!TEMPLATES.ganon || !roomFor(b, u, TEMPLATES.ganon.size)) return 'Not enough room to transform';
  }
  if (def.id === 'twinrovaFusion') {
    const sis = sister(b, u);
    if (!sis) return 'The other sister must be adjacent';
    if (!TEMPLATES.twinrova || !roomFor(b, u, TEMPLATES.twinrova.size, [sis])) return 'Not enough room to fuse';
  }
  return null;
}

export function castableAbilities(b: Battle, u: Unit): AbilityDef[] {
  return knownAbilities(u).filter((d) => !unusableReason(b, u, d));
}

export function needsTile(def: AbilityDef): boolean {
  return !!def.warp || wwNeedsTile(def) || tpNeedsTile(def) || ssNeedsTile(def) || def.id === 'hookshotPull' || def.id === 'buildHere' || def.id === 'transportAlly';
}

/** Destination tiles for tile-targeted abilities (warps, Hookshot, Build, Transport). */
export function abilityTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  if (def.warp) return warpTiles(b, u, def);
  if (def.id === 'hookshotPull') return hookTiles(b, u).map((h) => h.land);
  if (def.id === 'buildHere') return buildTargets(b, u);
  if (wwNeedsTile(def)) return wwTiles(b, u, def);
  if (tpNeedsTile(def)) return tpTiles(b, u, def);
  if (ssNeedsTile(def)) return ssTiles(b, u, def);
  if (def.id === 'transportAlly') {
    const t = transportee(b, u);
    if (!t) return [];
    const out: Pos[] = [];
    for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) {
      if (footDist(x, y, 1, u.x, u.y, u.size) > 5 || unitAt(b, x, y) || anchorCost(b, t, x, y) >= INF) continue;
      out.push({ x, y });
    }
    return out;
  }
  return [];
}

const HOOK_ANCHORS = new Set(['forest', 'wall', 'fort', 'mountain', 'cracked', 'timeBlock', 'grapplePost', 'grownTree', 'ropeSwing', 'watchtower', 'searchlight', 'commandStatue', 'hangingVine']);

/** Hookshot: for each straight line, latch onto the first anchor or unit within range and land just before it. */
export function hookTiles(b: Battle, u: Unit): { land: Pos; anchor: Pos }[] {
  const grapple = u.weapons.includes('grapplingHook') ? 3 + (hasEffect(u, 'ropeGloves') ? 2 : 0) + (u.skills.includes('grappler') ? 2 : 0) : 0;
  const range = Math.max(u.weapons.includes('longshot') ? 5 : u.weapons.includes('hookshot') ? 3 : 0, grapple);
  const out: { land: Pos; anchor: Pos }[] = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (let i = 1; i <= range; i++) {
      const x = u.x + dx * i, y = u.y + dy * i;
      if (x < 0 || y < 0 || x >= b.width || y >= b.height) break;
      const t = b.tiles[y * b.width + x];
      const occupant = unitAt(b, x, y);
      if (occupant || HOOK_ANCHORS.has(t)) {
        if (i === 1) break; // already next to it
        const land = { x: x - dx, y: y - dy };
        if (anchorCost(b, u, land.x, land.y) < INF && !unitAt(b, land.x, land.y)) out.push({ land, anchor: { x, y } });
        break;
      }
    }
  }
  return out;
}

/** Ancient Guidance: the adjacent ally on foot who would be carried. */
function transportee(b: Battle, u: Unit): Unit | undefined {
  return b.units.find((a) => a !== u && a.team === u.team && !a.acted && !a.captive && a.size === 1 && !isMounted(a) && unitDist(u, a) === 1);
}

/** Units an ability can be aimed at (only abilities that need a target). */
export function abilityTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  if (terminaNeedsTarget(def)) return terminaTargets(b, u, def);
  if (wwNeedsTarget(def)) return wwTargets(b, u, def);
  if (tpNeedsTarget(def)) return tpTargets(b, u, def);
  if (ssNeedsTarget(def)) return ssTargets(b, u, def);
  if (def.id === 'masterCraftsman') {
    return b.units.filter((a) => a.team === u.team && unitDist(u, a) <= 1 && a.weapons.some((w) => (a.wear?.[w] ?? 0) > 0));
  }
  if (def.id === 'greatFairysBlessing') {
    return b.units.filter((a) => a.team === u.team && unitDist(u, a) <= 2 && (a.hp < a.stats.hp || a.mp < a.stats.mp));
  }
  return [];
}

export function needsTarget(def: AbilityDef): boolean {
  if (terminaNeedsTarget(def) || wwNeedsTarget(def) || tpNeedsTarget(def) || ssNeedsTarget(def)) return true;
  return def.id === 'greatFairysBlessing' || def.id === 'masterCraftsman';
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
  repaired?: { uid: string; weaponId: string };
  transformed?: string;
  /** Extra log lines. */
  lines: string[];
  /** Didn't use the unit's action (Hero of Masks, gliding). */
  free?: boolean;
  levelUps: LevelUp[];
}

/** Use an ability. Mutates the battle; returns null if it can't be used. */
export function castAbility(b: Battle, u: Unit, id: string, rng: RNG, targetUid?: string, at?: Pos): AbilityResult | null {
  const def = ABILITIES[id];
  if (!def || !knownAbilities(u).includes(def) || unusableReason(b, u, def)) return null;
  if (needsTile(def) && (!at || !abilityTiles(b, u, def).some((p) => p.x === at.x && p.y === at.y))) return null;
  const target = targetUid ? b.units.find((x) => x.uid === targetUid) : undefined;
  if (needsTarget(def) && (!target || !abilityTargets(b, u, def).includes(target))) return null;

  const res: AbilityResult = { def, hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], levelUps: [] };
  const allies = (r: number) => b.units.filter((a) => a.team === u.team && unitDist(u, a) <= r);
  const foes = (r: number) => b.units.filter((e) => e.team !== u.team && unitDist(u, e) <= r);
  let xp = 15;

  switch (id) {
    case 'dinsFire': {
      const mag = effectiveStats(u).mag;
      // Forests around the caster catch fire.
      ignite(b, tilesInRange(b, u, 1, 2, u.size).filter((p) => b.tiles[p.y * b.width + p.x] === 'forest'));
      for (const e of foes(2)) {
        const dmg = Math.min(e.hp, Math.max(0, mag + 6 + weatherMight(b, 'fire') - effectiveStats(e).res));
        e.hp -= dmg;
        let saved: 'fairy' | undefined;
        if (e.hp <= 0 && useFairy(e)) saved = 'fairy';
        const killed = e.hp <= 0;
        const statuses: StatusKind[] = [];
        if (!killed && dmg > 0) {
          onDamaged(e);
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
        if (a.statuses.some((st) => !STATUS_INFO[st.kind].good)) { a.statuses = a.statuses.filter((st) => STATUS_INFO[st.kind].good); res.cleansed.push(a.uid); }
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
      if (meltSunBlocks(b, u, 4)) res.lines.push('Sunlight melts away the Sun Blocks!');
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
        if (!killed && dmg > 0) onDamaged(e);
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
    case 'songOfTime': {
      const n = toggleTimeBlocks(b);
      res.lines.push(n ? `Time shifts: ${n} Time Block${n > 1 ? 's' : ''} change.` : 'The melody echoes through time.');
      for (const a of allies(3)) if (a !== u && Object.keys(a.cooldowns ?? {}).length) { a.cooldowns = {}; res.buffed.push(a.uid); }
      break;
    }
    case 'hookshotPull': {
      const from = { x: u.x, y: u.y };
      const d = Math.abs(at!.x - u.x) + Math.abs(at!.y - u.y);
      u.x = at!.x; u.y = at!.y;
      u.movedDist += d;
      u.moved = true;
      res.warped = { from, to: { ...at! } };
      xp = 3;
      break;
    }
    case 'digHere': {
      const got = dig(b, u, rng);
      res.lines.push(got.item ? `${u.name} digs up ${ITEMS[got.item]?.name ?? got.item}!${got.rupees ? ` (+₹${got.rupees})` : ''}` : got.rupees ? `${u.name} digs up ₹${got.rupees}.` : 'Just dirt.');
      xp = 8;
      break;
    }
    case 'buildHere': {
      const t = buildAt(b, at!);
      res.lines.push(t === 'bridge' ? 'A bridge is built.' : t === 'wall' ? 'A barricade goes up.' : 'The obstacle is cleared.');
      xp = 10;
      break;
    }
    case 'transportAlly': {
      const t = transportee(b, u)!;
      res.warped = { from: { x: t.x, y: t.y }, to: { ...at! } };
      t.x = at!.x; t.y = at!.y;
      res.lines.push(`${u.name} carries ${t.name} across the field.`);
      break;
    }
    case 'masterCraftsman': {
      const t = target!;
      const w = t.weapons.find((id) => (t.wear?.[id] ?? 0) > 0)!;
      t.wear![w] = Math.max(0, t.wear![w] - 5);
      res.repaired = { uid: t.uid, weaponId: w };
      (u.usedAbilities ??= []).push(id);
      break;
    }
    case 'transformGanon':
      transformInto(b, u, 'ganon');
      res.transformed = u.name;
      (u.usedAbilities ??= []).push(id);
      break;
    case 'twinrovaFusion': {
      const sis = sister(b, u)!;
      transformInto(b, u, 'twinrova', sis);
      res.transformed = u.name;
      (u.usedAbilities ??= []).push(id);
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
      if (!def.warp) {
        const tm = castSkyward(b, u, def, rng, target, at) ?? castTwilight(b, u, def, rng, target, at) ?? castWindWaker(b, u, def, rng, target, at) ?? castTermina(b, u, def, rng, target, at);
        if (!tm) return null;
        res.hits.push(...tm.hits);
        res.heals.push(...tm.heals);
        res.statuses.push(...tm.statuses);
        res.cleansed.push(...tm.cleansed);
        res.buffed.push(...tm.buffed);
        res.lines.push(...tm.lines);
        if (tm.transformed) res.transformed = tm.transformed;
        if (tm.warped) res.warped = tm.warped;
        res.free = tm.free;
        xp = tm.hits.length ? 15 + tm.hits.length * 6 : 10;
        break;
      }
      if (def.warp && at) {
        res.warped = { from: { x: u.x, y: u.y }, to: { ...at } };
        u.x = at.x;
        u.y = at.y;
        break;
      }
      return null;
  }
  if (def.sta) u.sta -= abilityCost(u, def, b);
  else u.mp -= abilityCost(u, def, b);
  if (def.cooldown) (u.cooldowns ??= {})[def.id] = def.cooldown;
  if (u.team === 'player') {
    for (const gains of gainXp(u, Math.min(60, xp), rng)) res.levelUps.push({ uid: u.uid, name: u.name, level: u.level, gains });
  }
  return res;
}

/** Koume's or Kotake's sister, if adjacent and on the same side. */
function sister(b: Battle, u: Unit): Unit | undefined {
  const other = u.templateId === 'koume' || u.bossId === 'koume' ? 'kotake' : u.templateId === 'kotake' || u.bossId === 'kotake' ? 'koume' : null;
  if (!other) return undefined;
  return b.units.find((a) => a !== u && a.team === u.team && (a.templateId === other || a.bossId === other) && unitDist(u, a) <= 1);
}

/** Enemy Ganondorf and the witch sisters transform on their own when they can. */
export function enemyAutoTransform(b: Battle, u: Unit, rng: RNG): AbilityResult | null {
  if (u.team !== 'enemy') return null;
  for (const id of ['transformGanon', 'twinrovaFusion', ...ENEMY_TRANSFORMS, ...SS_ENEMY_TRANSFORMS]) {
    if (!u.abilities.includes(id)) continue;
    const def = ABILITIES[id];
    if (def && !unusableReason(b, u, def)) return castAbility(b, u, id, rng);
  }
  return null;
}
