// Support relationships: allies who fight near each other bond over time and
// earn ranks C, B, A (and S for special pairs), which grant combat bonuses
// when they fight within 2 spaces of each other. The support registry
// (docs/support-expansion.md) sets each pair's highest rank; forms share their
// character's bond; some pairs have named bonuses, and group supports switch on
// when all their members are on the field.

import { SUPPORT_S_PAIRS, WEAPONS } from '../data/registry';
import { SACRED_ABILITIES } from './skyward';
import { GROUP_SUPPORTS, PAIR_BONUSES, canonOf, maxRankFor, pairDef, pairKey } from '../content/supports';
import { unitDist } from './grid';
import { hasEffect } from './units';
import type { Battle, Pos, Unit } from './types';

export type SupportRank = '' | 'C' | 'B' | 'A' | 'S';

export const RANK_POINTS: [SupportRank, number][] = [['S', 70], ['A', 40], ['B', 20], ['C', 8]];
const CAP: Record<'B' | 'A' | 'S', number> = { B: 20, A: 40, S: 70 };

export const supportKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

const tid = (u: Unit) => u.templateId ?? u.bossId ?? '';

/** The pair's highest rank (registry, or the packs' S pairs, or A by default). */
export function maxRank(a: Unit, b: Unit): 'B' | 'A' | 'S' {
  const ta = tid(a), tb = tid(b);
  if (!ta || !tb) return 'A';
  if (pairDef(ta, tb)) return maxRankFor(ta, tb);
  const ca = canonOf(ta), cb = canonOf(tb);
  return SUPPORT_S_PAIRS.some(([x, y]) => (canonOf(x) === ca && canonOf(y) === cb) || (canonOf(x) === cb && canonOf(y) === ca)) ? 'S' : 'A';
}

export function isSPair(a: Unit, b: Unit): boolean {
  return maxRank(a, b) === 'S';
}

export function rankOf(points: number, sPair: boolean | 'B' | 'A' | 'S'): SupportRank {
  const max = sPair === true ? 'S' : sPair === false ? 'A' : sPair;
  for (const [r, p] of RANK_POINTS) {
    if (r === 'S' && max !== 'S') continue;
    if (r === 'A' && max === 'B') continue;
    if (points >= p) return r;
  }
  return '';
}

/** Max points a pair can reach. */
export function pointCap(sPair: boolean | 'B' | 'A' | 'S'): number {
  return CAP[sPair === true ? 'S' : sPair === false ? 'A' : sPair];
}

const BONUS: Record<SupportRank, { hit: number; avoid: number; crit: number; def: number }> = {
  '': { hit: 0, avoid: 0, crit: 0, def: 0 },
  C: { hit: 5, avoid: 5, crit: 0, def: 0 },
  B: { hit: 10, avoid: 10, crit: 5, def: 0 },
  A: { hit: 15, avoid: 15, crit: 5, def: 1 },
  S: { hit: 20, avoid: 20, crit: 10, def: 2 },
};

const reach = (u: Unit, a: Unit) => 2 + (hasEffect(u, 'supportReach') || hasEffect(a, 'supportReach') ? 1 : 0);

/** Combined bonus from supported allies within 2 spaces (capped). */
export function supportBonus(b: Battle, u: Unit, pos: Pos): { hit: number; avoid: number; crit: number; def: number } {
  const out = { hit: 0, avoid: 0, crit: 0, def: 0 };
  if (!b.supports) return out;
  for (const a of b.units) {
    if (a === u || a.team !== u.team || unitDist(u, a, pos) > reach(u, a)) continue;
    const r = rankOf(b.supports[supportKey(u.uid, a.uid)] ?? 0, maxRank(u, a));
    const x = BONUS[r];
    out.hit += x.hit; out.avoid += x.avoid; out.crit += x.crit; out.def += x.def;
  }
  out.hit = Math.min(30, out.hit);
  out.avoid = Math.min(30, out.avoid);
  out.crit = Math.min(15, out.crit);
  out.def = Math.min(3, out.def);
  return out;
}

/** A player unit fought (or healed): bond with allies within 2 spaces. */
export function gainSupport(b: Battle, u: Unit, amount = 1, partner?: Unit) {
  if (u.team !== 'player' || u.npc) return;
  b.supports ??= {};
  const friends = partner ? [partner] : b.units.filter((a) => a !== u && a.team === 'player' && !a.npc && !a.ephemeral && unitDist(u, a) <= reach(u, a));
  for (const a of friends) {
    const k = supportKey(u.uid, a.uid);
    let gain = amount * (hasEffect(u, 'couple') || hasEffect(a, 'couple') ? 2 : 1); // Couple's Mask
    // The Crimson Loftwing's Chosen Companion: bonds twice as fast with the Hero of the Sky.
    if ((u.skills.includes('chosenCompanion') && tid(a) === 'heroOfTheSky') || (a.skills.includes('chosenCompanion') && tid(u) === 'heroOfTheSky')) gain *= 2;
    // Colin's Growing Courage: double support with stronger allies.
    if ((u.skills.includes('growingCourage') && a.level > u.level) || (a.skills.includes('growingCourage') && u.level > a.level)) gain *= 2;
    b.supports[k] = Math.min(pointCap(maxRank(u, a)), (b.supports[k] ?? 0) + gain);
    // Form-specific conversations unlock once the pair has fought together in that form.
    const forms = [u, a].map((x) => x.templateId).filter((t): t is string => !!t && canonOf(t) !== t);
    if (forms.length) for (const f of forms) { const fk = `${pairKey(tid(u), tid(a))}#${f}`; if (!(b.formSupports ??= []).includes(fk)) b.formSupports.push(fk); }
  }
}

// ───────────────────────── Pair bonuses and group supports ─────────────────────────

export interface GroupMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number }

/** Group supports active for a team (every member on the field). */
export function activeGroups(b: Battle, team: string): string[] {
  const here = new Set(b.units.filter((x) => x.team === team).map((x) => canonOf(tid(x))));
  for (const v of b.units) for (const c of v.cargo ?? []) if (c.team === team) here.add(canonOf(tid(c)));
  return GROUP_SUPPORTS.filter((g) => g.members.every((m) => here.has(m))).map((g) => g.id);
}

const memberOf = (u: Unit, id: string) => GROUP_SUPPORTS.find((g) => g.id === id)?.members.includes(canonOf(tid(u))) ?? false;

/** Stat bonuses from named pair bonuses and group supports. */
export function specialSupportMods(b: Battle, u: Unit, pos: Pos, foe?: Unit): GroupMods {
  const m: GroupMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0 };
  if (u.team !== 'player') return m;
  // Named pair bonuses (A Legacy Remembered, Brotherhood of Stone…)
  for (const a of b.units) {
    if (a === u || a.team !== u.team) continue;
    const pb = PAIR_BONUSES[pairKey(tid(u), tid(a))];
    if (!pb || unitDist(u, a, pos) > pb.radius) continue;
    const r = rankOf(b.supports?.[supportKey(u.uid, a.uid)] ?? 0, maxRank(u, a));
    if ('CBAS'.indexOf(r) < 'CBAS'.indexOf(pb.rank) || !r) continue;
    for (const [k, v] of Object.entries(pb.stats)) m[k as keyof GroupMods] += v ?? 0;
  }
  const groups = b.groupSupports ?? activeGroups(b, u.team);
  if (!groups.length) return m;
  const w = WEAPONS[u.weapons[0]];
  const near = (id: string, r: number) => b.units.some((a) => a !== u && a.team === u.team && memberOf(a, id) && unitDist(u, a, pos) <= r);
  const add = (s: Partial<GroupMods>) => { for (const [k, v] of Object.entries(s)) m[k as keyof GroupMods] += v ?? 0; };
  for (const g of groups) {
    const mine = memberOf(u, g);
    switch (g) {
      case 'courageOfGenerations': if (mine && near(g, 3)) add({ str: 3, skl: 3, spd: 3 }); break;
      case 'threePrincesses': if (mine) add({ mag: 4, res: 4 }); break;
      case 'threeDarkLords': if (mine && foe?.isBoss) add({ str: 5, mag: 5 }); break;
      case 'companionsOfCourage': if (/link|hero/i.test(tid(u)) && near(g, 1)) add({ hit: 20, avoid: 20 }); break;
      case 'swornBrothers': if (mine) add({ str: 5, def: 5 }); break;
      case 'fallenHeroes': if (mine) add({ str: 4, res: 4 }); break;
      case 'kingdomOfIkana': if (mine) add({ str: 3, def: 3, res: 3 }); break;
      case 'forgottenKings': if (mine || near(g, 3)) add({ def: 3, res: 3 }); break;
      case 'guardiansOfTheWorld': add({ res: 3 }); break;
      case 'fourGiants': if (mine) add({ str: 5, def: 5, res: 5 }); break;
      case 'ordonFamily': if (mine && b.units.some((a) => a !== u && memberOf(a, g) && a.hp < a.stats.hp && unitDist(u, a, pos) <= 1)) add({ def: 3, res: 3 }); break;
      case 'thePirateCrew': if (mine) add({ str: 2 }); break;
      case 'friendsOfTheForest': if (mine && b.tiles[pos.y * b.width + pos.x] === 'forest') add({ avoid: 20 }); break;
      // ── Skyward Sword ──
      case 'originsOfCourage': if (mine && (w?.element === 'light' || !!w?.sacredMult || !!w?.skywardRate || w?.id === 'masterSword')) add({ str: 4, mag: 4 }); break;
      case 'demonAndBlade': if (mine && w?.element === 'dark') add({ str: 5, mag: 5 }); break;
      case 'siegeSpecialists': if (mine && w?.type === 'siege') add({ hit: 20 }); break;
      case 'spiritsOfTheSword': if (mine && w?.type === 'sword') add({ str: 3 }); break;
      // ── Era of the Wild ──
      case 'fiveChampions': if (mine && near(g, 3)) add({ str: 4, skl: 4, res: 4 }); break;
      case 'threeGenerationsOfRito': if (mine) add({ skl: 3, spd: 3 }); break;
      case 'zoraRoyalFamily': if ((mine || near(g, 2)) && (u.race === 'zora' || hasEffect(u, 'swim'))) add({ def: 3 }); break;
      case 'goronChampions': if (mine) add({ str: 5, def: 5 }); break;
      case 'ancientWarMachines': if (mine) add({ def: 4, ...(near(g, 3) ? { hit: 10 } : {}) }); break;
    }
  }
  return m;
}

/** MP and stamina discounts from group supports and named pair bonuses. */
export function supportCostMult(b: Battle | undefined, u: Unit, kind: 'song' | 'spell' | 'technique' | string, element?: string, abilityId?: string): number {
  if (!b || u.team !== 'player') return 1;
  const groups = b.groupSupports ?? activeGroups(b, u.team);
  let m = 1;
  if (groups.includes('sagesOfTheForest') && memberOf(u, 'sagesOfTheForest') && (kind === 'song' || element === 'nature' || element === 'wind')) m *= 0.7;
  if (groups.includes('threePrincesses') && memberOf(u, 'threePrincesses') && element === 'light') m *= 0.8;
  if (kind === 'technique' && groups.includes('mastersOfTheBlade') && memberOf(u, 'mastersOfTheBlade')) m *= 0.75;
  if (kind === 'technique' && b.units.some((a) => a !== u && pairKey(tid(u), tid(a)) === 'herosShade|link'
    && rankOf(b.supports?.[supportKey(u.uid, a.uid)] ?? 0, 'S') === 'S')) m *= 0.75;
  // Skyward Sword: the Goddess's Servants (sacred magic −30% MP) and the Spirits of the Sword (sword stamina).
  if (groups.includes('goddessServants') && memberOf(u, 'goddessServants') && (element === 'light' || SACRED_ABILITIES.has(abilityId ?? ''))) m *= 0.7;
  if (kind === 'technique' && groups.includes('spiritsOfTheSword') && memberOf(u, 'spiritsOfTheSword')) m *= 0.8;
  return m;
}

/** Group damage multipliers (The Royal Witches). */
export function supportDamageMult(b: Battle, u: Unit, element?: string): number {
  if (u.team !== 'player' || !element) return 1;
  const groups = b.groupSupports ?? activeGroups(b, u.team);
  let m = groups.includes('royalWitches') && memberOf(u, 'royalWitches') && ['fire', 'ice', 'dark'].includes(element) ? 1.2 : 1;
  // The Ancient Dragons: elemental damage +25%.
  if (groups.includes('ancientDragons') && memberOf(u, 'ancientDragons') && ['fire', 'ice', 'water', 'lightning', 'nature'].includes(element)) m *= 1.25;
  return m;
}

/** A Promise Kept: once per battle, a member next to another member survives a fatal blow. */
export function promiseKept(b: Battle, target: Unit): boolean {
  if (target.team !== 'player' || b.promiseUsed) return false;
  const groups = b.groupSupports ?? activeGroups(b, target.team);
  if (!groups.includes('aPromiseKept') || !memberOf(target, 'aPromiseKept')) return false;
  if (!b.units.some((a) => a !== target && a.team === target.team && memberOf(a, 'aPromiseKept') && unitDist(a, target) <= 1)) return false;
  b.promiseUsed = true;
  return true;
}

declare module './types' {
  interface Battle {
    /** Group supports active this battle (set at the start of battle). */
    groupSupports?: string[];
    /** Form-specific support conversations unlocked this battle. */
    formSupports?: string[];
    promiseUsed?: boolean;
  }
}
