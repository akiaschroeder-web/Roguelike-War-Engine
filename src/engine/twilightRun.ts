// The Twilight Princess campaign: Restoring the Light (Tears of Light fill each
// province's Vessel of Light), the Hero's Shade's Hidden Skills, the Fused Shadow
// and the Mirror of Twilight, and the camp skills of the Twilight cast.

import { GEAR, TEMPLATES, WEAPONS, WORLDS } from '../data/registry';
import { HIDDEN_SKILLS, TWILIT_PROVINCES } from '../content/twilight';
import type { RNG } from './rng';
import { makeHero } from './units';
import type { Battle, Run, Unit } from './types';

declare module './types' {
  interface Run {
    /** Twilight Princess: Tears of Light per province and the provinces already restored. */
    twilight?: { tears: Record<string, number>; restored: string[]; pending?: string; asked?: string[] };
  }
}

/** Tears of Light needed to fill a province's Vessel of Light. */
export const TEARS_NEEDED = 8;

export const TWILIGHT_REGIONS = Object.values(WORLDS).filter((w) => w.campaign === 'twilight').map((w) => w.id);

export function twilightOf(run: Run) {
  return (run.twilight ??= { tears: {}, restored: [] });
}

/** Is this province still under the Twilight? */
export function isTwilit(run: Run, world: string): boolean {
  if (world === 'twilightRealm') return true;
  if (run.campaign !== 'twilight' && !TWILIT_PROVINCES[world]) return false;
  if (!TWILIT_PROVINCES[world] || world === 'ordonProvince') return false;
  return !twilightOf(run).restored.includes(world);
}

const swordsman = (u: Unit) => u.weapons.some((w) => WEAPONS[w]?.type === 'sword');

/** The Hero's Shade teaches a random Hidden Skill to a swordsman who still lacks one. */
export function teachHiddenSkill(run: Run, rng: RNG, uid?: string): string | null {
  const pool = run.roster.filter((u) => swordsman(u) && HIDDEN_SKILLS.some((s) => !u.abilities.includes(s)));
  const pupil = (uid && pool.find((u) => u.uid === uid)) || pool.find((u) => u.templateId === 'heroOfTwilight') || (pool.length ? rng.pick(pool) : undefined);
  if (!pupil) return 'No one left with a technique to learn.';
  const skill = HIDDEN_SKILLS.find((s) => !pupil.abilities.includes(s))!;
  pupil.abilities.push(skill);
  return `${pupil.name} learns the Hidden Skill ${skillName(skill)}!`;
}

const skillName = (id: string) => ({ endingBlow: 'Ending Blow', shieldAttack: 'Shield Attack', backSlice: 'Back Slice', helmSplitter: 'Helm Splitter', mortalDraw: 'Mortal Draw', jumpStrike: 'Jump Strike', greatSpin: 'Great Spin' } as Record<string, string>)[id] ?? id;

/** New Twilight campaign: start in Ordon; the Forgotten Warriors know a Hidden Skill each. */
export function twilightStart(run: Run, rng: RNG) {
  twilightOf(run);
  run.questItems ??= [];
  if (run.bonus === 'ancientMastery') {
    for (const u of run.roster) {
      if (!swordsman(u)) continue;
      const left = HIDDEN_SKILLS.filter((s) => !u.abilities.includes(s));
      if (left.length) u.abilities.push(rng.pick(left));
    }
  }
}

function addQuest(run: Run, id: string) {
  (run.questItems ??= []).push(id);
}
const count = (run: Run, id: string) => (run.questItems ?? []).filter((q) => q === id).length;
function takeAll(run: Run, id: string) {
  run.questItems = (run.questItems ?? []).filter((q) => q !== id);
}

/** Four Fused Shadow fragments make the Complete Fused Shadow; four Mirror Shards the Mirror of Twilight. */
export function twilightQuestCheck(run: Run): string[] {
  const lines: string[] = [];
  if (count(run, 'fusedShadowPiece') >= 4 && GEAR.fusedShadow) {
    takeAll(run, 'fusedShadowPiece');
    run.convoy.push('fusedShadow');
    lines.push('The four fragments fuse into the Complete Fused Shadow!');
  }
  if (count(run, 'mirrorShard') >= 4 && !run.questItems?.includes('mirrorOfTwilight')) {
    takeAll(run, 'mirrorShard');
    addQuest(run, 'mirrorOfTwilight');
    lines.push('The Mirror of Twilight is whole again. The way to the Twilight Realm is open.');
  }
  if (count(run, 'skyCharacter') >= 6 && !run.questItems?.includes('skyBookComplete')) {
    takeAll(run, 'skyCharacter');
    addQuest(run, 'skyBookComplete');
    lines.push('The Ancient Sky Book is complete: the Dominion Rod awakens.');
    run.convoy.push('dominionRod');
  }
  return lines;
}

/** After a battle in the Twilight campaign (or any twilit fight). */
export function twilightAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const tp = b.tp;
  if (won && tp) {
    const tw = twilightOf(run);
    if (tp.tears > 0 && TWILIT_PROVINCES[b.world] && !tw.restored.includes(b.world)) {
      tw.tears[b.world] = Math.min(TEARS_NEEDED, (tw.tears[b.world] ?? 0) + tp.tears);
      lines.push(`Tears of Light: ${tw.tears[b.world]}/${TEARS_NEEDED} for ${WORLDS[b.world]?.name ?? b.world}.`);
      if (tw.tears[b.world] >= TEARS_NEEDED && !(tw.asked ?? []).includes(b.world)) {
        tw.pending = b.world;
        lines.push('The Vessel of Light is full! The Light Spirit\'s spring is calling.');
      }
    }
    if (tp.howled) { const l = teachHiddenSkill(run, rng, tp.learn?.[0]); if (l) lines.push(l); }
    for (let i = 0; i < (tp.poeSouls ?? 0); i++) addQuest(run, 'poeSoul');
    if (tp.poeSouls) lines.push(`Collected ${tp.poeSouls} Poe Soul${tp.poeSouls > 1 ? 's' : ''}.`);
    if (tp.rupees) { run.rupees += tp.rupees; lines.push(`Jovani's curse: +₹${tp.rupees}.`); }
  }
  if (won) {
    for (const u of run.roster) {
      if (u.skills.includes('heartyConstitution') && u.pack.length < 6) { u.pack.push({ id: 'simpleSoup', uses: 1 }); lines.push(`${u.name} cooks Simple Soup.`); }
      if (u.skills.includes('princessOfBugs') && rng.chance(25)) { addQuest(run, 'goldenBug'); run.rupees += 30; lines.push('Agitha spots a Golden Bug (+₹30).'); }
    }
  }
  lines.push(...twilightQuestCheck(run));
  return lines;
}

/** Release the Tears: the province is restored and its Light Spirit may join you. */
export function restoreLight(run: Run, rng: RNG, region?: string): string {
  const tw = twilightOf(run);
  const r = region ?? tw.pending;
  if (!r) return 'Nothing happens.';
  tw.pending = undefined;
  (tw.asked ??= []).push(r);
  if (!tw.restored.includes(r)) tw.restored.push(r);
  const spirit = TWILIT_PROVINCES[r];
  const name = WORLDS[r]?.name ?? r;
  if (spirit && TEMPLATES[spirit] && !run.roster.some((u) => u.templateId === spirit)) {
    const level = Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));
    const u = makeHero(spirit, `p${run.uidCounter++}`, level, rng);
    run.roster.push(u);
    run.stats.recruits++;
    return `Light returns to ${name}! ${u.name} joins your army.`;
  }
  return `Light returns to ${name}!`;
}

/** Keep the Twilight for now (more Twilight recruits and shadow equipment). */
export function delayLight(run: Run): string {
  const tw = twilightOf(run);
  if (tw.pending) (tw.asked ??= []).push(tw.pending);
  tw.pending = undefined;
  return 'You keep the Tears of Light. The Twilight lingers… for now.';
}

/** Twilight-campaign region choices after a boss. */
export function twilightRegionOptions(run: Run, rng: RNG): string[] {
  const q = run.questItems ?? [];
  const recent = run.regionsVisited.slice(-2);
  const pool = TWILIGHT_REGIONS.filter((r) => {
    if (recent.includes(r)) return false;
    if (r === 'twilightRealm') return q.includes('mirrorOfTwilight') || run.act >= 5;
    if (r === 'hyruleCastleTP') return run.regionsVisited.includes('twilightRealm') || run.act >= 6;
    if (r === 'cityInTheSky') return q.includes('ancientSkyBook') || run.act >= 4;
    if (r === 'sacredGrove' || r === 'snowpeak' || r === 'gerudoDesertTP') return run.act >= 2;
    return true;
  });
  return rng.shuffle(pool).slice(0, 3);
}
