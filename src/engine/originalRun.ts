// The Original Hyrule campaign: the nine Underworld Levels in order, a fragment of the
// Triforce of Wisdom from each of the first eight bosses, Death Mountain once the Triforce
// is whole, the Second Quest's boss placements, and the Merchant's secret wares.

import { BOSSES, GEAR, ITEMS, WEAPONS } from '../data/registry';
import { GLEEOK, GLEEOK_STAND_IN, LEVEL_BOSSES, LEVELS, SECOND_QUEST_BOSSES } from '../content/original';
import type { RNG } from './rng';
import type { Battle, BossDef, MapNode, Run } from './types';

declare module './types' {
  interface Run {
    /** Original Hyrule: Levels whose fragment has been won. */
    original?: { fragments: string[] };
  }
}

export const ORIGINAL_REGIONS = LEVELS;
const DEATH_MOUNTAIN = LEVELS[8];

export function originalOf(run: Run) {
  return (run.original ??= { fragments: [] });
}

const q = (run: Run) => (run.questItems ??= []);
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id));

/** New Original Hyrule campaign: Level 1, no fragments yet. */
export function originalStart(run: Run) {
  originalOf(run);
  q(run);
}

/** Is this a Second Quest run? */
export const secondQuest = (run: Run) => !!run.trials?.includes('secondQuest');

/** The fixed boss of a Level (First or Second Quest placement). Null outside the campaign's Levels. */
export function originalBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'original' || node.type !== 'boss' || !LEVELS.includes(node.world)) return null;
  let id = (secondQuest(run) ? SECOND_QUEST_BOSSES : LEVEL_BOSSES)[node.world];
  if (id === GLEEOK && !BOSSES[GLEEOK]) id = GLEEOK_STAND_IN;
  return BOSSES[id] ?? null;
}

/** While marching through the nine Levels, battles stay in their Level (no Free-for-All). */
export function inOriginalLevels(run: Run): boolean {
  return run.campaign === 'original' && LEVELS.includes(run.region) && !run.original?.fragments.includes(DEATH_MOUNTAIN);
}

const MERCHANT_WARES = ['magicalShield', 'blueRing', 'blueCandle', 'redCandle', 'raft', 'stepladder', 'magicalBoomerang', 'whiteSword', 'bookOfMagic', 'silverArrow', 'redLifeMedicine', 'magicalClock'];
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? id;

/** After a battle: Triforce fragments, the assembled Triforce, the Merchant's finds, secrets found. */
export function originalAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  if (!won) return lines;
  if ((b.og?.found ?? 0) > 0) lines.push(`Secrets found: ${b.og!.found}.`);
  if (run.campaign === 'original' && b.nodeType === 'boss' && LEVELS.includes(b.world)) {
    const og = originalOf(run);
    if (!og.fragments.includes(b.world)) {
      og.fragments.push(b.world);
      if (b.world === DEATH_MOUNTAIN) {
        lines.push('Ganon falls, and the Triforce of Power with him. Hyrule is free — though the war goes on.');
      } else {
        q(run).push('wisdomFragment');
        const n = q(run).filter((x) => x === 'wisdomFragment').length;
        lines.push(`A fragment of the Triforce of Wisdom! (${Math.min(8, n)}/8)`);
        if (n >= 8 && !q(run).includes('fullTriforce')) {
          q(run).push('fullTriforce');
          if (!owns(run, 'triforceWisdom')) run.convoy.push('triforceWisdom');
          lines.push('The eight fragments join: the Triforce of Wisdom is whole! The way to Death Mountain opens.');
        }
      }
    }
  }
  if (run.roster.some((u) => u.skills.includes('secretMerchandise')) && rng.chance(25)) {
    const id = rng.pick(MERCHANT_WARES);
    run.convoy.push(id);
    lines.push(`The Merchant turns up something rare: ${nameOf(id)}.`);
  }
  return lines;
}

/** Original Hyrule region choices after a boss: Level by Level, then Death Mountain once the Triforce is whole. */
export function originalRegionOptions(run: Run): string[] {
  const i = LEVELS.indexOf(run.region);
  if (i < 0 || run.region === DEATH_MOUNTAIN) return [];
  const og = originalOf(run);
  const next = LEVELS[i + 1];
  if (next !== DEATH_MOUNTAIN) return [next];
  if ((run.questItems ?? []).includes('fullTriforce')) return [DEATH_MOUNTAIN];
  // A fragment is still missing: go back for it.
  const missing = LEVELS.slice(0, 8).filter((l) => !og.fragments.includes(l));
  return missing.length ? missing.slice(0, 3) : [DEATH_MOUNTAIN];
}
