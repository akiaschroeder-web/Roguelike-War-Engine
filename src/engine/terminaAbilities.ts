// Majora's Mask abilities: transformation masks, Majora's forms, Termina songs,
// and character/mask abilities. Hooked into engine/abilities.ts.

import { GEAR, TEMPLATES } from '../data/registry';
import { anchorCost, footDist, footprint, inBounds, keyOf, unitAt, unitDist } from './grid';
import type { RNG } from './rng';
import { INF } from './rules';
import { addStatus, hasComposer } from './status';
import { restoreForm, roomFor, transformInto } from './transform';
import { canSwim, effectiveStats, hasEffect, unitTags } from './units';
import type { AbilityDef, Battle, Pos, StatusKind, Unit } from './types';

/** Characters who can wear Link's transformation masks. */
export const LINK_FAMILY = ['terminaLink', 'youngLink', 'link', 'dekuLink', 'goronLink', 'zoraLink', 'fierceDeityLink', 'giantLink'];

const baseTemplate = (u: Unit) => u.originalForm?.templateId ?? u.templateId ?? '';
const watery = (t: string | undefined) => t === 'water' || t === 'poisonWater' || t === 'current';

export interface TerminaOutcome {
  hits: { uid: string; dmg: number; hp: number; killed: boolean; statuses: StatusKind[] }[];
  heals: { uid: string; amount: number }[];
  statuses: { uid: string; kind: StatusKind }[];
  cleansed: string[];
  buffed: string[];
  lines: string[];
  transformed?: string;
  warped?: { from: Pos; to: Pos };
  /** The ability didn't use the unit's action. */
  free?: boolean;
}

/** Can this unit wear transformation masks? */
function maskCompatible(u: Unit, gearId: string): boolean {
  if (gearId === 'majorasMaskGear') return ['skullKid'].includes(baseTemplate(u));
  return LINK_FAMILY.includes(baseTemplate(u));
}

function maskOf(def: AbilityDef): string | undefined {
  return def.id.startsWith('mask_') ? def.id.slice(5) : undefined;
}

/** Song range, widened by Lulu, the Zora Guitar in water and the Deku Pipes in forests. */
export function songRadius(b: Battle, u: Unit, def: AbilityDef): number {
  let r = def.radius ?? 3;
  const t = b.tiles[keyOf(b, u.x, u.y)];
  if (watery(t) && (u.skills.includes('voiceOfTheOcean') || u.weapons.includes('zoraGuitar'))) r += 2;
  if (t === 'forest' && u.weapons.includes('dekuPipes')) r += 1;
  if ((b.groupSupports ?? []).includes('voicesOfTheSea') && ['ruto', 'lulu', 'medli'].includes(u.templateId ?? '')) r += 2;
  return r;
}

/** Why a Termina ability can't be used (undefined = not a Termina ability). */
export function terminaUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  const mask = maskOf(def);
  if (mask) {
    const g = GEAR[mask];
    if (!g?.transform || !maskCompatible(u, mask)) return 'Only certain characters can transform with this mask';
    if (u.maskForm === mask) return 'Already transformed';
    const t = TEMPLATES[g.transform];
    if (!t || !roomFor(b, u, t.size)) return 'Not enough room to transform';
    if (g.upkeep && u.mp < g.upkeep) return `Needs at least ${g.upkeep} MP`;
    return null;
  }
  switch (def.id) {
    case 'removeMask':
      if (!u.maskForm) return 'Not transformed';
      if (!roomFor(b, u, u.originalForm?.size ?? 1)) return 'Not enough room';
      return null;
    case 'majoraIncarnate':
    case 'majoraWrath': {
      if (u.hp > u.stats.hp / 2) return 'Only below half HP';
      const next = def.id === 'majoraIncarnate' ? 'majorasIncarnation' : 'majorasWrath';
      if (!TEMPLATES[next] || !roomFor(b, u, TEMPLATES[next].size)) return 'Not enough room';
      return null;
    }
    case 'flowerGlide':
    case 'goronRoll':
    case 'rapidSwim':
      if (u.movedDist > 0) return 'Use before moving';
      if (def.id === 'rapidSwim' && !watery(b.tiles[keyOf(b, u.x, u.y)])) return 'Must be in water';
      return null;
    case 'dekuSpin':
    case 'groundPound':
    case 'giantStomp':
    case 'blastMask':
      return foesWithin(b, u, def.id === 'giantStomp' ? 1 : 1).length ? null : 'No adjacent enemies';
    case 'dekuNutDrop':
      return foesWithin(b, u, 1).length ? null : 'No adjacent enemies';
    case 'tidalSurge':
      return foesWithin(b, u, 2).length ? null : 'No enemies within 2';
    case 'mischief':
    case 'quickWarning':
      return terminaTargets(b, u, def).length ? null : 'No one in range';
    case 'kamaroDance':
      return foesWithin(b, u, 2).length ? null : 'No enemies within 2';
    case 'elegyOfEmptiness':
      return elegySpot(b, u) ? null : 'No room for a statue';
    case 'songOfSoaring':
      return null;
  }
  return undefined;
}

function foesWithin(b: Battle, u: Unit, r: number): Unit[] {
  return b.units.filter((e) => e.team !== u.team && !e.captive && unitDist(u, e) <= r);
}

export function terminaNeedsTarget(def: AbilityDef): boolean {
  return def.id === 'mischief' || def.id === 'quickWarning';
}

export function terminaTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  if (def.id === 'mischief') return b.units.filter((x) => x !== u && x.size === 1 && !x.captive && unitDist(u, x) <= 4 && u.size === 1);
  if (def.id === 'quickWarning') return b.units.filter((x) => x.team === u.team && x !== u && unitDist(u, x) <= 3);
  return [];
}

/** Elegy of Emptiness: an empty spot next to the performer that fits a statue of their size. */
function elegySpot(b: Battle, u: Unit): Pos | null {
  for (let y = u.y - u.size; y <= u.y + u.size; y++) {
    for (let x = u.x - u.size; x <= u.x + u.size; x++) {
      if (!inBounds(b, x, y) || footDist(x, y, u.size, u.x, u.y, u.size) !== 1) continue;
      if (anchorCost(b, u, x, y) >= INF) continue;
      if (footprint(x, y, u.size).every((p) => !unitAt(b, p.x, p.y))) return { x, y };
    }
  }
  return null;
}

/** Turn back from a transformation, in place. */
export function revertMask(u: Unit) {
  if (!u.originalForm) return;
  const back = restoreForm(u);
  Object.assign(u, back);
  delete u.originalForm;
  delete u.maskForm;
}

function strike(b: Battle, u: Unit, e: Unit, dmg: number, out: TerminaOutcome, status?: StatusKind, chance = 0, rng?: RNG) {
  dmg = Math.min(e.hp, Math.max(0, dmg));
  e.hp -= dmg;
  const killed = e.hp <= 0;
  const statuses: StatusKind[] = [];
  if (!killed && status && rng?.chance(chance)) { addStatus(e, status, 1 + (e.team === 'enemy' ? b.statusBonus ?? 0 : 0)); statuses.push(status); }
  out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses });
  if (killed) {
    u.kills++;
    b.units = b.units.filter((x) => x !== e);
    b.fallen.push(e);
    b.log.push(`${u.name} defeated ${e.name}.`);
  }
}

/** Run a Termina ability. Returns null when `def` isn't one. */
export function castTermina(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, _at?: Pos): TerminaOutcome | null {
  const out: TerminaOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [] };
  const s = effectiveStats(u);
  const mask = maskOf(def);
  if (mask) {
    const heroFree = (u.skills.includes('heroOfMasks') || u.originalForm?.skills.includes('heroOfMasks')) && u.maskTurn !== b.turn;
    if (u.maskForm) revertMask(u);
    const before = u.name;
    transformInto(b, u, GEAR[mask].transform!);
    u.maskForm = mask;
    u.maskTurn = b.turn;
    out.transformed = before;
    out.free = heroFree;
    out.lines.push(`${before} puts on the ${GEAR[mask].name}!`);
    return out;
  }
  const r = songRadius(b, u, def);
  const allies = (rad: number) => b.units.filter((a) => a.team === u.team && unitDist(u, a) <= rad);
  const foes = (rad: number) => foesWithin(b, u, rad);
  const buff = (a: Unit, id: string, name: string, turns: number, stats: Record<string, number>) => {
    a.buffs = a.buffs.filter((x) => x.id !== id);
    a.buffs.push({ id, name, turns, stats });
    out.buffed.push(a.uid);
  };
  switch (def.id) {
    case 'removeMask': {
      const heroFree = (u.originalForm?.skills.includes('heroOfMasks')) && u.maskTurn !== b.turn;
      const name = u.name;
      revertMask(u);
      u.maskTurn = b.turn;
      out.transformed = name;
      out.free = heroFree;
      out.lines.push(`${u.name} takes off the mask.`);
      break;
    }
    case 'majoraIncarnate':
    case 'majoraWrath': {
      const before = u.name;
      transformInto(b, u, def.id === 'majoraIncarnate' ? 'majorasIncarnation' : 'majorasWrath');
      out.transformed = before;
      (u.usedAbilities ??= []).push(def.id);
      break;
    }
    // ── Form abilities ──
    case 'dekuSpin':
      for (const e of foes(1)) strike(b, u, e, s.str + 4 - effectiveStats(e).def, out);
      break;
    case 'dekuNutDrop':
      for (const e of foes(1)) { addStatus(e, 'stun', 1); out.statuses.push({ uid: e.uid, kind: 'stun' }); }
      break;
    case 'flowerGlide':
      u.buffs.push({ id: 'glide', name: 'Flower Glide', turns: 1, stats: { mov: 2 } });
      out.buffed.push(u.uid);
      out.free = true;
      break;
    case 'groundPound':
      for (const e of foes(1)) strike(b, u, e, s.str + 6 - effectiveStats(e).def, out, 'stun', 30, rng);
      break;
    case 'defensiveCurl':
      buff(u, 'curl', 'Defensive Curl', 1, { def: 6, res: 3 });
      break;
    case 'goronRoll':
      buff(u, 'roll', 'Goron Roll', 1, { mov: 3 + (hasEffect(u, 'rollBoost') ? 2 : 0) });
      out.free = true;
      break;
    case 'rapidSwim':
      buff(u, 'swim', 'Rapid Swimming', 1, { mov: 3 });
      out.free = true;
      break;
    case 'electricBarrier':
      buff(u, 'electric', 'Electric Barrier', 2, {});
      out.lines.push('Adjacent attackers will be shocked.');
      break;
    case 'giantStomp':
      for (const e of foes(1)) strike(b, u, e, s.str + 8 - effectiveStats(e).def, out, 'stun', 40, rng);
      break;
    case 'tidalSurge':
      for (const e of foes(2)) strike(b, u, e, s.mag + 6 - effectiveStats(e).res, out);
      (u.usedAbilities ??= []).push(def.id);
      break;
    case 'royalGuardBash':
      for (const a of allies(1)) if (a !== u) buff(a, 'royalGuard', 'Royal Guard', 1, { def: 4 });
      break;
    // ── Character abilities ──
    case 'mischief': {
      const t = target!;
      const from = { x: u.x, y: u.y };
      [u.x, u.y, t.x, t.y] = [t.x, t.y, u.x, u.y];
      out.warped = { from, to: { x: u.x, y: u.y } };
      out.lines.push(`${u.name} swaps places with ${t.name}!`);
      break;
    }
    case 'quickWarning':
      addStatus(target!, 'veiled', 1);
      out.statuses.push({ uid: target!.uid, kind: 'veiled' });
      out.lines.push(`"Watch out!" ${target!.name} is on guard.`);
      break;
    // ── Mask abilities ──
    case 'blastMask': {
      for (const e of foes(1)) strike(b, u, e, 12, out);
      if (!u.gear?.shield) { const recoil = Math.min(u.hp - 1, 5); u.hp -= recoil; out.lines.push(`The blast hurts ${u.name} too (−${recoil}).`); }
      break;
    }
    case 'kamaroDance':
      for (const e of foes(2)) { addStatus(e, 'dazed', 2 + (b.statusBonus ?? 0)); out.statuses.push({ uid: e.uid, kind: 'dazed' }); }
      break;
    case 'bremenMarch':
      for (const a of allies(2)) buff(a, 'bremen', 'Bremen March', 1, { mov: 1 });
      break;
    // ── Songs ──
    case 'songOfHealing': {
      for (const a of allies(r)) {
        const n = a.statuses.length;
        a.statuses = a.statuses.filter((st) => st.kind !== 'curse' && st.kind !== 'fear' && st.kind !== 'confuse');
        if (a.statuses.length !== n) out.cleansed.push(a.uid);
      }
      // Purify weakened undead and possessed enemies: they leave in peace and can join you.
      for (const e of foes(r)) {
        const tags = unitTags(e);
        if (!e.isBoss && (tags.includes('undead') || tags.includes('possessed')) && e.hp <= e.stats.hp * 0.35) {
          b.units = b.units.filter((x) => x !== e);
          (b.purified ??= []).push(e);
          out.lines.push(`${e.name}'s spirit is healed. It may join you after the battle.`);
        }
      }
      break;
    }
    case 'sonataOfAwakening':
      for (const a of allies(r)) {
        const n = a.statuses.length;
        a.statuses = a.statuses.filter((st) => !['sleep', 'stun', 'freeze'].includes(st.kind));
        if (a.statuses.length !== n) out.cleansed.push(a.uid);
      }
      break;
    case 'goronLullaby':
      for (const e of foes(r)) {
        if (rng.chance(Math.max(15, 75 - effectiveStats(e).res * 3))) { addStatus(e, 'sleep', 2 + (b.statusBonus ?? 0) + (hasComposer(u) ? 1 : 0)); out.statuses.push({ uid: e.uid, kind: 'sleep' }); }
        if (u.weapons.includes('goronDrums') && rng.chance(30)) { addStatus(e, 'stun', 1); out.statuses.push({ uid: e.uid, kind: 'stun' }); }
      }
      break;
    case 'newWaveBossaNova':
      for (const a of allies(r)) if (canSwim(a)) buff(a, 'bossaNova', 'New Wave Bossa Nova', 3, { mov: 2, mag: 2 });
      break;
    case 'elegyOfEmptiness': {
      const p = elegySpot(b, u)!;
      const statue: Unit = {
        ...u, uid: `elegy${b.uidCounter++}`, name: `${u.name} Shell`, title: 'Elegy statue', x: p.x, y: p.y, weapons: [], pack: [], abilities: [],
        skills: [], statuses: [], buffs: [], npc: true, summoned: true, ai: 'stationary', isCommander: false, hp: Math.ceil(u.stats.hp / 2),
        stats: { ...u.stats, hp: Math.ceil(u.stats.hp / 2), mov: 0 }, moved: true, acted: true, originalForm: undefined, maskForm: undefined,
      };
      b.units.push(statue);
      out.lines.push('An empty shell takes your shape.');
      break;
    }
    case 'oathToOrder':
      for (const a of b.units) if (a.team === u.team && (a.race === 'giant' || (a.baseSize ?? a.size) >= 5)) buff(a, 'oath', 'Oath to Order', 3, { str: 4, def: 4, res: 4 });
      break;
    case 'invertedSongOfTime':
      b.timeSlowed = 2;
      (u.usedAbilities ??= []).push(def.id);
      out.lines.push('Time slows: reinforcements and hazards are delayed for 2 turns.');
      break;
    case 'songOfDoubleTime':
      for (const a of b.units) {
        if (a.team !== u.team) continue;
        for (const k of Object.keys(a.cooldowns ?? {})) { a.cooldowns![k] -= 2; if (a.cooldowns![k] <= 0) delete a.cooldowns![k]; }
      }
      (u.usedAbilities ??= []).push(def.id);
      out.lines.push('Time leaps forward: cooldowns advance two turns.');
      break;
    default:
      return null;
  }
  // Musicians: Mikau's band restores stamina; Flat's songs release curses and weaken undead.
  if (def.kind === 'song') {
    const sta = (u.skills.includes('indigoGos') ? 3 : 0) + (b.bonus === 'aquatic' ? 2 : 0);
    if (sta) for (const a of allies(r)) a.sta = Math.min(a.stats.sta, a.sta + sta);
    if (u.skills.includes('songOfRelease')) {
      for (const a of allies(r)) a.statuses = a.statuses.filter((st) => st.kind !== 'curse');
      for (const e of foes(r)) if (unitTags(e).includes('undead')) { addStatus(e, 'weaken', 2); out.statuses.push({ uid: e.uid, kind: 'weaken' }); }
    }
  }
  return out;
}

/** Enemy Majora transforms on its own when it can. */
export const ENEMY_TRANSFORMS = ['majoraIncarnate', 'majoraWrath'];
