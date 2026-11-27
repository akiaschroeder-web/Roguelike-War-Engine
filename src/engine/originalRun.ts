// The Original Hyrule campaign: the nine Underworld Levels in order, a fragment of the
// Triforce of Wisdom from each of the first eight bosses, Death Mountain once the Triforce
// is whole, the Second Quest's boss placements, and the Merchant's secret wares.
// Then the second chapter, Zelda II: North Castle, six palaces (a Palace Crystal each,
// placed in the statue by a unit who gains a level), the overworld around them, the Old
// Men's spells and the swordmasters' techniques, and the Great Palace.

import { ABILITIES, BOSSES, GEAR, ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import { GLEEOK, GLEEOK_STAND_IN, GREAT_PALACE, LEVEL_BOSSES, LEVELS, PALACE_BOSSES, PALACES, SECOND_QUEST_BOSSES, Z2_REGION_IDS, Z2_SPELLS, Z2_TECHNIQUES } from '../content/original';
import { footprint } from './grid';
import type { RNG } from './rng';
import { gainXp } from './units';
import type { Battle, BossDef, EventEffect, MapNode, Run, Unit } from './types';

declare module './types' {
  interface Run {
    /** Original Hyrule: Levels whose fragment has been won. */
    original?: { fragments: string[] };
  }
}

export const ORIGINAL_REGIONS = [...LEVELS, ...Z2_REGION_IDS];
const DEATH_MOUNTAIN = LEVELS[8];
/** Zelda II's overworld areas: side trips between the palaces. */
export const Z2_OVERWORLD = ['z2Towns', 'z2DeathMountain', 'spectacleRock'];
const NORTH_CASTLE = 'northCastle';
const VALLEY = 'valleyOfDeath';
/** XP a Palace Crystal gives the unit who places it (one level). */
export const CRYSTAL_XP = 100;

export function originalOf(run: Run) {
  return (run.original ??= { fragments: [] });
}

const q = (run: Run) => (run.questItems ??= []);
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id));

/** Where an Original Hyrule campaign begins: Level 1 — or North Castle for the Sleeping
 *  Princess, and for a World Tour that has already been through the nine Levels. */
export function originalStartRegion(run: { commanderId: string; regionsVisited: string[] }): string {
  return run.commanderId === 'sleepingZelda' || run.regionsVisited.includes(LEVELS[0]) ? NORTH_CASTLE : LEVELS[0];
}

/** Palace Crystals placed so far. */
export const crystalsHeld = (run: Run) => (run.questItems ?? []).filter((x) => x === 'palaceCrystal').length;

/** New Original Hyrule campaign: Level 1, no fragments yet. */
export function originalStart(run: Run) {
  originalOf(run);
  q(run);
}

/** Is this a Second Quest run? */
export const secondQuest = (run: Run) => !!run.trials?.includes('secondQuest');

/** The fixed boss of a Level (First or Second Quest placement). Null outside the campaign's Levels. */
export function originalBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'original' || node.type !== 'boss') return null;
  // Zelda II: each palace has its guardian.
  if (PALACE_BOSSES[node.world]) return BOSSES[PALACE_BOSSES[node.world]] ?? null;
  if (!LEVELS.includes(node.world)) return null;
  let id = (secondQuest(run) ? SECOND_QUEST_BOSSES : LEVEL_BOSSES)[node.world];
  if (id === GLEEOK && !BOSSES[GLEEOK]) id = GLEEOK_STAND_IN;
  return BOSSES[id] ?? null;
}

/** While marching through the nine Levels — and then Zelda II's Hyrule up to the Great
 *  Palace — battles stay in their region (no Free-for-All). */
export function inOriginalLevels(run: Run): boolean {
  if (run.campaign !== 'original') return false;
  if (LEVELS.includes(run.region)) return !run.original?.fragments.includes(DEATH_MOUNTAIN);
  return Z2_REGION_IDS.includes(run.region) && !run.original?.fragments.includes(GREAT_PALACE);
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
  if (run.campaign === 'original' && b.nodeType === 'boss') lines.push(...palaceAfterBattle(run, b, rng));
  if (run.roster.some((u) => u.skills.includes('secretMerchandise')) && rng.chance(25)) {
    const id = rng.pick(MERCHANT_WARES);
    run.convoy.push(id);
    lines.push(`The Merchant turns up something rare: ${nameOf(id)}.`);
  }
  return lines;
}

/** Original Hyrule region choices after a boss: Level by Level, then Death Mountain once the Triforce is whole;
 *  then Zelda II: North Castle, the palaces in order (with an overworld side trip on offer), the Valley of
 *  Death once all six crystals are placed, and the Great Palace. */
export function originalRegionOptions(run: Run): string[] {
  if (run.region === DEATH_MOUNTAIN) return [NORTH_CASTLE];
  if (Z2_REGION_IDS.includes(run.region)) return zelda2Options(run);
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

// ───────────────────────── Zelda II ─────────────────────────

function zelda2Options(run: Run): string[] {
  if (run.region === GREAT_PALACE) return [];
  const og = originalOf(run);
  const next = PALACES.find((p) => !og.fragments.includes(p));
  if (!next) return run.regionsVisited.includes(VALLEY) || run.region === VALLEY ? [GREAT_PALACE] : [VALLEY];
  const side = Z2_OVERWORLD.filter((r) => !run.regionsVisited.includes(r) && r !== run.region);
  return side.length && !Z2_OVERWORLD.includes(run.region) ? [next, side[0]] : [next];
}

const PALACE_TREASURE: Record<string, string> = {
  parapaPalace: 'blueCandle', midoroPalace: 'powerBracelets', islandPalace: 'raft', mazeIslandPalace: 'magicBoots', palaceOnTheSea: 'recorder', threeEyeRockPalace: 'cross',
};

/** Who places the Palace Crystal: a unit standing next to the Palace Statue when the guardian
 *  fell (the player's choice, by positioning) — otherwise the highest-level survivor. */
function crystalBearer(run: Run, b: Battle): Unit | undefined {
  const statues = b.tiles.map((t, i) => (t === 'palaceStatue' ? i : -1)).filter((i) => i >= 0);
  const near = b.units.filter((u) => u.team === 'player' && !u.npc && statues.some((k) => {
    const x = k % b.width, y = Math.floor(k / b.width);
    return footprint(u.x, u.y, u.size).some((p) => Math.abs(p.x - x) + Math.abs(p.y - y) === 1);
  }));
  const pick = near.sort((a, c) => a.level - c.level)[0];
  const inRoster = pick && run.roster.find((u) => u.uid === pick.uid);
  return inRoster ?? [...run.roster].sort((a, c) => c.level - a.level || c.stats.hp - a.stats.hp)[0];
}

/** After a palace guardian falls: the Palace Crystal, its treasure, a level for its bearer. */
function palaceAfterBattle(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  const og = originalOf(run);
  if (!PALACE_BOSSES[b.world] || og.fragments.includes(b.world)) return lines;
  og.fragments.push(b.world);
  if (b.world === GREAT_PALACE) {
    lines.push('Thunderbird falls, and Link\'s Shadow with it. The Triforce of Courage is yours — far away in North Castle, the Sleeping Princess opens her eyes.');
    if (!owns(run, 'triforceCourage')) run.convoy.push('triforceCourage');
    return lines;
  }
  q(run).push('palaceCrystal');
  const n = crystalsHeld(run);
  const who = crystalBearer(run, b);
  if (who) {
    const xp = Math.round(CRYSTAL_XP * (run.bonus === 'ancientMagic' ? 1.25 : 1));
    const ups = gainXp(who, xp, rng).length;
    lines.push(`${who.name} places the Palace Crystal in the statue (${n}/6): +${xp} EXP${ups ? ` — Level ${who.level}!` : ''}`);
  }
  const loot = PALACE_TREASURE[b.world];
  if (loot && !owns(run, loot) && (WEAPONS[loot] || GEAR[loot] || ITEMS[loot])) { run.convoy.push(loot); lines.push(`Treasure of the palace: ${nameOf(loot)}.`); }
  if (n >= 6) lines.push('All six crystals are placed. Far to the east, the seal on the Great Palace breaks.');
  return lines;
}

/** Can this unit learn spells? Anyone with real magic in them. */
export const spellCompatible = (u: Unit) => u.stats.mp >= 8 || !!TEMPLATES[u.templateId ?? '']?.weapons.some((w) => WEAPONS[w]?.type === 'magic' || WEAPONS[w]?.type === 'staff');
/** Can this unit learn sword techniques? Anyone who fights with a sword. */
export const swordUser = (u: Unit) => u.weapons.some((w) => WEAPONS[w]?.type === 'sword');
/** Knows the spell already (the Hero of Hyrule knows all eight). */
const knowsSpell = (u: Unit, id: string) => u.abilities.includes(id) || !!ABILITIES[id]?.grantedBy?.templates?.includes(u.templateId ?? '');

/** Zelda II event effects: teach a spell or technique, hand over a pack item. */
export function applyAolEffect(run: Run, e: Extract<EventEffect, { kind: 'aol' }>, rng: RNG): string | null {
  const id = e.id ?? '';
  const name = ABILITIES[id]?.name ?? id;
  switch (e.op) {
    case 'spell': {
      if (!Z2_SPELLS.includes(id)) return null;
      const pool = run.roster.filter((u) => spellCompatible(u) && !knowsSpell(u, id));
      const pupil = pool.find((u) => u.templateId === 'sleepingZelda') ?? [...pool].sort((a, c) => c.stats.mag - a.stats.mag)[0];
      if (!pupil) { run.rupees += 50; return `No one else can learn ${name} (₹50 back).`; }
      pupil.abilities.push(id);
      return `${pupil.name} learns the spell ${name}!`;
    }
    case 'technique': {
      if (!Z2_TECHNIQUES.includes(id)) return null;
      const pool = run.roster.filter((u) => swordUser(u) && !u.abilities.includes(id));
      const pupil = pool.find((u) => u.templateId === 'heroOfHyrule') ?? (pool.length ? rng.pick(pool) : undefined);
      if (!pupil) return `No swordsman left to learn ${name}.`;
      pupil.abilities.push(id);
      return `${pupil.name} learns ${name}!`;
    }
    case 'take': {
      const i = run.convoy.indexOf(id);
      if (i >= 0) { run.convoy.splice(i, 1); return `Handed over: ${nameOf(id)}.`; }
      for (const u of run.roster) {
        const j = u.pack.findIndex((p) => p.id === id);
        if (j >= 0) { if (--u.pack[j].uses <= 0) u.pack.splice(j, 1); return `Handed over: ${nameOf(id)}.`; }
      }
      return null;
    }
  }
  return null;
}
