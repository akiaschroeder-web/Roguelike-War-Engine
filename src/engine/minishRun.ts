// The Minish Cap campaign: the sixteen regions of section 12 in order (with the bosses the doc places), the
// Picori Blade's progression through Melari's forge and the four Elements to the Four Sword, Kinstone
// fusions, Mysterious Shells and Carlov's Figurine Gallery (Hyrule Archives entries), Picolytes, the
// Blade Brothers' dojo, Micro dungeons, and the camp facilities (Minish Settlement, Minish Forge,
// Kinstone Exchange, Swordmaster Dojo, Figurine Gallery, Picolyte Garden).

import { ABILITIES, BOSSES, ENEMIES, GEAR, ITEMS, QUEST_ITEMS, TEMPLATE_LIST, TEMPLATES, WEAPONS } from '../data/registry';
import {
  DOJO_TECHNIQUES, ELEMENT_OF, ELEMENTS, KINSTONES, MC_ROUTE_BOSSES, MELARI_FORGE, MICRO_DUNGEON_REGIONS, MINISH_ROUTE, PAIRED_MC_REGIONS, PICOLYTES,
} from '../content/minish';
import { anchorCost, footprint, tilesInRange, unitAt } from './grid';
import { mnState, startMicroDungeon } from './minish';
import { microFits } from './micro';
import type { RNG } from './rng';
import { INF } from './rules';
import { armyOf } from './army';
import { addToPack, gainXp, makeEnemy, makeHero } from './units';
import type { Battle, BossDef, EventEffect, MapNode, Run, RunMap, Unit } from './types';
import type { Reward } from './run';

export interface MinishRunState {
  /** Route bosses beaten. */
  beaten: string[];
  /** Vaati is beaten: the route is done. */
  done?: boolean;
  /** Melari has reforged the Picori Blade. */
  reforged?: boolean;
  /** Figurines collected this campaign (Hyrule Archives entries; merged into the lifetime collection). */
  figurines: string[];
  /** Kinstone fusions made. */
  fusions: number;
  /** Camp facility actions already taken at this camp. */
  campUsed: string[];
}

declare module './types' {
  interface Run {
    /** The Minish Cap campaign state. */
    minish?: MinishRunState;
  }
}

export const minishOf = (run: Run): MinishRunState => (run.minish ??= { beaten: [], figurines: [], fusions: 0, campUsed: [] });
const q = (run: Run) => (run.questItems ??= []);
const count = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const take = (run: Run, id: string, n = 1) => { for (let i = 0; i < n; i++) { const k = q(run).indexOf(id); if (k < 0) return false; q(run).splice(k, 1); } return true; };
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id));
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? QUEST_ITEMS[id]?.name ?? TEMPLATES[id]?.name ?? id;
const skill = (run: Run, s: string) => run.roster.some((u) => u.skills.includes(s));
const avgLevel = (run: Run) => Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));

export const minishStartRegion = (): string => MINISH_ROUTE[0];
export const inMinishRoute = (run: Run) => run.campaign === 'minish' && MINISH_ROUTE.includes(run.region) && !minishOf(run).done;

function recruitOnce(run: Run, id: string, rng: RNG, lines: string[], why: string) {
  if (!TEMPLATES[id] || run.roster.some((u) => u.templateId === id || TEMPLATES[u.templateId ?? '']?.exclusiveWith?.includes(id) || TEMPLATES[id].exclusiveWith?.includes(u.templateId ?? ''))) return;
  run.roster.push(makeHero(id, `p${run.uidCounter++}`, avgLevel(run), rng));
  run.stats.recruits++;
  lines.push(why);
}

/** New campaign: the Kinstone Bag, a first pair of Kinstones. */
export function minishStart(run: Run, rng: RNG) {
  minishOf(run);
  if (!q(run).includes('kinstoneBag')) q(run).push('kinstoneBag', 'kinstoneGreen');
  void rng;
}

/** The fixed boss of a route region: the first of its bosses not yet beaten. */
export function minishBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'minish' || node.type !== 'boss') return null;
  const list = (MC_ROUTE_BOSSES[node.world] ?? []).filter((id) => BOSSES[id]);
  if (!list.length) return null;
  const st = minishOf(run);
  return BOSSES[list.find((x) => !st.beaten.includes(x)) ?? list[0]] ?? null;
}

/** Map decoration: a Micro dungeon in the Minish regions, and the Kinstone fusions' discoveries. */
export function minishDecorateMap(run: Run, map: RunMap, rng: RNG) {
  if (run.campaign !== 'minish' || !MINISH_ROUTE.includes(run.region)) return;
  const rows = Math.max(...map.nodes.map((n) => n.row));
  if (MICRO_DUNGEON_REGIONS.includes(run.region) && !map.nodes.some((n) => n.type === 'dungeon')) {
    const mid = map.nodes.filter((n) => n.row >= 2 && n.row <= rows - 2 && ['battle', 'event'].includes(n.type));
    if (mid.length) rng.pick(mid).type = 'dungeon';
  }
}

/** Battle setup: Micro dungeons, paired bosses. */
export function minishBattleSetup(run: Run, b: Battle, rng: RNG) {
  if (run.campaign !== 'minish') return;
  if (b.nodeType === 'dungeon' && MICRO_DUNGEON_REGIONS.includes(b.world) && !b.naval) startMicroDungeon(b, rng);
  if (b.nodeType !== 'boss') return;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!main) return;
  // Bosses bring their retinue.
  for (const id of ESCORTS[main.bossId ?? ''] ?? []) spawnNear(b, id, main, Math.max(1, main.level - 1), rng);
  // The Madderpillar comes in segments: every one of them must fall.
  if (main.bossId === 'madderpillar') {
    for (let i = 0; i < SEGMENTS; i++) { const s = spawnNear(b, 'madderpillar', main, main.level, rng); if (s) { s.isBoss = true; s.name = `${s.name} (segment)`; s.ai = 'aggressive'; } }
    mnState(b).allBosses = true;
  }
  if (!PAIRED_MC_REGIONS.includes(b.world)) return;
  for (const id of (MC_ROUTE_BOSSES[b.world] ?? []).filter((x) => x !== main.bossId)) {
    const def = BOSSES[id];
    if (!def) continue;
    const e = makeEnemy(def, b.world, main.level, `mn${b.uidCounter++}`, rng, { boss: true });
    if ((b.bossTier ?? 0) === 0) { for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res'] as const) e.stats[k] = Math.round(e.stats[k] * 0.8); e.stats.hp = e.hp = Math.round(e.stats.hp * 0.85); }
    for (let d = 1; d <= 8; d++) {
      const spot = tilesInRange(b, main, d, d, main.size).find((p) => anchorCost(b, e, p.x, p.y) < INF && footprint(p.x, p.y, e.size).every((f) => !unitAt(b, f.x, f.y)));
      if (spot) { Object.assign(e, { x: spot.x, y: spot.y, ai: main.ai }); b.units.push(e); mnState(b).allBosses = true; break; }
    }
  }
}

/** Each boss's retinue (returning monsters and the pack's own). */
const ESCORTS: Record<string, string[]> = {
  spinyChuchu: ['chuchuGreen'], madderpillar: ['spinyBeetle', 'spinyBeetle', 'octorok', 'octorok', 'puffstool'], bigGreenChuchu: ['chuchuGreen', 'puffstool'],
  gleerok: ['rollobite', 'spinyBeetle'], silverDarknut: ['eyegoreStatue'], mazaal: ['eyegoreStatue'], redDarknut: ['gibdo'], vaatiReborn: ['ballChainSoldier', 'blackKnight'],
};
const SEGMENTS = 3;
function spawnNear(b: Battle, id: string, near: Unit, level: number, rng: RNG): Unit | undefined {
  const a = ENEMIES[id] ?? BOSSES[id];
  if (!a) return undefined;
  const e = makeEnemy(a, b.world, level, `mn${b.uidCounter++}`, rng);
  if (BOSSES[id]) e.isBoss = false;
  for (let d = 1; d <= 6; d++) {
    const spot = tilesInRange(b, near, d, d, near.size).find((p) => anchorCost(b, e, p.x, p.y) < INF && (e.micro ? microFits(b, e, p.x, p.y) : footprint(p.x, p.y, e.size).every((f) => !unitAt(b, f.x, f.y))));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y, team: 'enemy', ai: 'aggressive' }); b.units.push(e); return e; }
  }
  return undefined;
}

// ───────────────────────── The Picori Blade ─────────────────────────

const STAGES = ['picoriBlade', 'whiteSword', 'whiteSwordTwo', 'whiteSwordThree', 'fourSword'];
/** The blade the army's Picori Blade should be now: Melari's reforging, then 2, 3 and 4 Elements. */
export function swordStage(run: Run): string {
  const st = minishOf(run);
  const el = ELEMENTS.filter((e) => q(run).includes(e)).length;
  if (!st.reforged) return 'picoriBlade';
  return el >= 4 ? 'fourSword' : el >= 3 ? 'whiteSwordThree' : el >= 2 ? 'whiteSwordTwo' : 'whiteSword';
}
/** Swap the army's Picori Blade (wherever it is) for its current stage; hand one over if the army has none. */
function reforge(run: Run, lines: string[]) {
  const stage = swordStage(run);
  const rank = (w: string) => STAGES.indexOf(w);
  // The army's Picori Blade line: the most advanced one held (only one is upgraded).
  const holders: { u?: Unit; w: string }[] = [
    ...run.roster.flatMap((u) => u.weapons.filter((w) => rank(w) >= 0).map((w) => ({ u, w }))),
    ...run.convoy.filter((w) => rank(w) >= 0).map((w) => ({ w })),
  ].sort((x, y) => rank(y.w) - rank(x.w));
  const h = holders[0];
  if (h) {
    if (rank(h.w) >= rank(stage)) return;
    if (h.u) { h.u.weapons[h.u.weapons.indexOf(h.w)] = stage; if (h.u.wear) delete h.u.wear[h.w]; lines.push(`${h.u.name}'s ${nameOf(h.w)} becomes the ${nameOf(stage)}.`); }
    else { run.convoy[run.convoy.indexOf(h.w)] = stage; lines.push(`The ${nameOf(h.w)} becomes the ${nameOf(stage)}.`); }
    return;
  }
  if (!q(run).includes('brokenPicoriBlade')) return;
  take(run, 'brokenPicoriBlade');
  const link = run.roster.find((u) => ['heroOfMinish', 'microLink'].includes(u.templateId ?? ''));
  if (link) link.weapons.unshift(stage); else run.convoy.push(stage);
  lines.push(`The ${nameOf(stage)} is ready${link ? ` for ${link.name}` : ''}.`);
}

// ───────────────────────── After a battle ─────────────────────────

/** Kinstone pieces drop: mostly green, sometimes blue, rarely red. */
function kinstoneDrop(rng: RNG): string {
  return rng.weighted<string>([['kinstoneGreen', 60], ['kinstoneBlue', 28], ['kinstoneRed', 12]]);
}

export function minishAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const st = b.mn;
  if (st?.found.length && won) {
    for (const id of st.found) q(run).push(id);
    lines.push(`Found: ${st.found.map(nameOf).join(', ')}.`);
  }
  if (!won) return lines;
  const army = armyOf(run);
  // Picolytes drunk in battle.
  for (const p of new Set(st?.picolytes ?? [])) {
    if (p === 'redPicolyte') for (const u of run.roster) u.hp = Math.min(u.stats.hp, u.hp + Math.ceil(u.stats.hp * 0.15));
    if (p === 'greenPicolyte') q(run).push('mysteriousShell', 'mysteriousShell');
    if (p === 'bluePicolyte') run.convoy.push(rng.pick(['redPotion', 'lonLonMilk', 'bomb', 'minishMushroom']));
    if (p === 'yellowPicolyte') run.rupees += Math.round(b.rewardRupees * 0.3);
    if (p === 'whitePicolyte') q(run).push(kinstoneDrop(rng));
    if (p === 'orangePicolyte') run.convoy.push('fairy');
    lines.push(`${nameOf(p)}: ${PICOLYTES[p]}.`);
  }
  if (run.campaign === 'minish' && rng.chance(35)) { const k = kinstoneDrop(rng); q(run).push(k); lines.push(`A ${nameOf(k)}.`); }
  // The cast's work.
  if (skill(run, 'royalAdministration')) { army.supplies += 2; run.rupees += 50; lines.push('Royal Administration: +2 supplies, +₹50.'); }
  if (skill(run, 'inspiringVerse')) { army.morale = Math.min(100, army.morale + 3); lines.push('Percy\'s verse lifts the army\'s spirits (+3 morale).'); }
  if (run.bonus === 'royalAuthority') army.morale = Math.max(40, army.morale);
  const smith = run.roster.find((u) => u.skills.includes('masterCraftsmanMC'));
  if (smith) {
    const amt = run.bonus === 'masterForging' ? 10 : 5;
    let n = 0;
    for (const u of run.roster) for (const w of Object.keys(u.wear ?? {})) if ((u.wear![w] ?? 0) > 0) { u.wear![w] = Math.max(0, u.wear![w] - amt); n++; }
    if (n) lines.push(`${smith.name} mends ${n} worn weapon${n > 1 ? 's' : ''}.`);
  }
  if (skill(run, 'forestPassage') && ['minishWoods', 'minishVillage', 'deepwoodShrine', 'castorWilds'].includes(b.world) && rng.chance(50)) {
    q(run).push('mysteriousShell'); run.rupees += 40; lines.push('Festari finds woodland treasure: a Mysterious Shell and ₹40.');
  }
  if (run.campaign === 'minish' || MINISH_ROUTE.includes(b.world)) lines.push(...routeRewards(run, b, rng));
  return lines;
}

function routeRewards(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  if (b.nodeType !== 'boss' || run.campaign !== 'minish') return lines;
  const st = minishOf(run);
  const region = b.world;
  const list = MC_ROUTE_BOSSES[region] ?? [];
  const beatenNow = b.fallen.filter((u) => u.team === 'enemy' && u.isBoss).map((u) => u.bossId ?? '').filter((id) => list.includes(id));
  for (const id of beatenNow) if (!st.beaten.includes(id)) st.beaten.push(id);
  const key = `region:${region}`;
  if (st.beaten.includes(key)) return lines;
  st.beaten.push(key);
  q(run).push(rng.chance(50) ? 'kinstoneBlue' : 'kinstoneGreen');
  const el = ELEMENT_OF[region];
  if (el && !q(run).includes(el)) { q(run).push(el); lines.push(`The ${nameOf(el)}! (${ELEMENTS.filter((e) => q(run).includes(e)).length}/4)`); reforge(run, lines); }
  const give = (id: string, why: string) => { if (!owns(run, id)) { if (ITEMS[id]) { const u = run.roster.find((x) => addToPack(x, id)); if (!u) run.convoy.push(id); } else run.convoy.push(id); lines.push(why); } };
  switch (region) {
    case 'hyruleTownMC':
      recruitOnce(run, 'ezloCap', rng, lines, 'A green cap with a bird\'s head sits up and speaks: "You there! You can see Minish? Then you\'re coming with me." Ezlo joins.');
      break;
    case 'minishWoods':
      q(run).push('brokenPicoriBlade', 'jabberNut');
      lines.push('Deep in the woods, the Broken Picori Blade — and a Jabber Nut, so you can talk to the Minish.');
      recruitOnce(run, 'festari', rng, lines, 'Festari pops out of the grass: "I know a short cut."');
      break;
    case 'minishVillage': recruitOnce(run, 'gentari', rng, lines, 'Gentari leans on his staff: "The Elements must be gathered. I will help."'); break;
    case 'deepwoodShrine': give('gustJar', 'The Gust Jar, from the shrine\'s chest.'); break;
    case MELARI_FORGE:
      st.reforged = true;
      recruitOnce(run, 'melari', rng, lines, 'Melari slams his hammer down: "That blade deserves better than you lot. I\'m coming."');
      reforge(run, lines);
      give('gripRing', 'The Grip Ring, from a Mountain Minish climber.');
      break;
    case 'caveOfFlames': give('remoteBomb', 'Remote Bombs, from the Goron miners.'); break;
    case 'castorWilds':
      q(run).push('kinstoneGold', 'kinstoneGold');
      lines.push('Two Golden Kinstone pieces glitter in the swamp.');
      give('pegasusBoots', 'Pegasus Boots, from a Blade Brother\'s dojo.');
      recruitOnce(run, 'greatblade', rng, lines, 'Greatblade hefts his sword: "Show me those techniques of yours."');
      break;
    case 'windRuins': give('ocarinaOfWind', 'The Ocarina of Wind, left by the Wind Tribe.'); break;
    case 'fortressOfWinds': lines.push('Mazaal crumbles. The way to the Royal Valley opens.'); break;
    case 'royalValley':
      recruitOnce(run, 'grimblade', rng, lines, 'Grimblade steps out of the fog: "You fight well for someone so alive."');
      if (rng.chance(50)) recruitOnce(run, 'swiftbladeFirst', rng, lines, 'In the Royal Crypt, a ghostly swordmaster bows: Swiftblade the First will teach you himself.');
      break;
    case 'lakeHyliaMC':
      give('zorasFlippers', 'Flippers, from a Minish fisherman under the bridge.');
      recruitOnce(run, 'librari', rng, lines, 'Librari waves from a lily pad: "The library can spare me."');
      break;
    case 'templeOfDroplets': give('flameLantern', 'The Flame Lantern, from the temple\'s frozen chest.'); break;
    case 'veilFalls': give('rocsCape', "Roc's Cape, at the top of the falls."); break;
    case 'cloudTops': recruitOnce(run, 'gregal', rng, lines, 'Gregal of the Wind Tribe: "Come. The palace is above us."'); break;
    case 'palaceOfWinds': lines.push('The last Element. The Four Sword is whole.'); break;
    case 'darkHyruleCastle':
      st.done = true;
      recruitOnce(run, 'zeldaMC', rng, lines, 'Zelda wakes from stone, the Light Force shining in her hands.');
      give('lightForce', 'The Light Force.');
      lines.push('Vaati is defeated. Ezlo is himself again, and the Minish Cap is just a hat.');
      break;
  }
  return lines;
}

/** Region choices after a boss: the next region on the route. Empty: the ordinary choice of regions. */
export function minishRegionOptions(run: Run, rng: RNG): string[] {
  const st = minishOf(run);
  const i = MINISH_ROUTE.indexOf(run.region);
  if (i < 0) return [];
  if (st.done || i === MINISH_ROUTE.length - 1) return rng.shuffle(MINISH_ROUTE.filter((x) => x !== run.region)).slice(0, 3);
  return [MINISH_ROUTE[i + 1]];
}

// ───────────────────────── Kinstones, figurines, Picolytes ─────────────────────────

/** Fuse two halves of a colour: the outcome on the current map, or a reward. */
export function fuseKinstones(run: Run, color: string, rng: RNG): string | null {
  const id = `kinstone${color[0].toUpperCase()}${color.slice(1)}`;
  if (!(KINSTONES as readonly string[]).includes(id) || count(run, id) < 2) return null;
  take(run, id, 2);
  minishOf(run).fusions++;
  const ahead = run.map.nodes.filter((n) => !n.visited && n.type !== 'boss' && ['battle', 'event'].includes(n.type));
  const convert = (t: MapNode['type']) => { const n = ahead.length ? rng.pick(ahead) : undefined; if (n) { n.type = t; ahead.splice(ahead.indexOf(n), 1); } return !!n; };
  switch (id) {
    case 'kinstoneGreen': {
      if (rng.chance(50) && convert('treasure')) return 'Fusion! A treasure chest appears on the road ahead.';
      run.rupees += 120; run.convoy.push(rng.pick(['redPotion', 'lonLonMilk', 'minishMushroom']));
      return 'Fusion! ₹120 and a consumable.';
    }
    case 'kinstoneBlue': {
      const r = rng.int(0, 2);
      if (r === 0 && convert('recruit')) return 'Fusion! Someone ahead wants to join you.';
      if (r === 1 && convert('treasure')) return 'Fusion! A hidden passage opens to a treasure.';
      const g = rng.pick(['minishMetalShield', 'mountainMinishHelmet', 'townMinishHood', 'minishBoots', 'minishClimbingGloves', 'moleMitts']);
      run.convoy.push(g);
      return `Fusion! ${nameOf(g)}.`;
    }
    case 'kinstoneRed': {
      const r = rng.int(0, 2);
      if (r === 0 && convert('elite')) return 'Fusion! A rare monster stirs somewhere ahead.';
      if (r === 1) { const u = rng.pick(run.roster); const k = rng.pick(['str', 'mag', 'skl', 'spd', 'def', 'res'] as const); u.stats[k] += 1; return `Fusion! ${u.name} gains +1 ${k.toUpperCase()} for good.`; }
      const g = rng.pick(['minishLeafGlider', 'minishForgingApron', 'gyorgEyeCharm', 'windTribeRobes', 'melarisHammer']);
      run.convoy.push(g);
      return `Fusion! ${nameOf(g)}.`;
    }
    case 'kinstoneGold': {
      convert('fountain');
      convert('treasure');
      run.capBonus = { ...(run.capBonus ?? {}), army: (run.capBonus?.army ?? 0) + 1 };
      return 'Golden fusion! A Great Fairy\'s fountain and a secret treasure appear ahead, and the army can hold one more.';
    }
  }
  return null;
}

/** Carlov's Figurine Gallery: a figurine of someone not yet collected (no combat effect). */
export function drawFigurine(run: Run, rng: RNG): string | null {
  const st = minishOf(run);
  if (count(run, 'mysteriousShell') < 5) return null;
  take(run, 'mysteriousShell', 5);
  const pool = TEMPLATE_LIST.filter((t) => !t.formOf && !st.figurines.includes(t.id) && (t.home && (t.home in MINISH_HOMES || rng.chance(15))));
  const t = pool.length ? rng.pick(pool) : rng.pick(TEMPLATE_LIST);
  if (!st.figurines.includes(t.id)) st.figurines.push(t.id);
  if (st.figurines.length >= 20 && !q(run).includes('carlovMedal')) { q(run).push('carlovMedal'); return `A figurine of ${t.name}! (20 collected: Carlov hands you the Carlov Medal.)`; }
  return `A figurine of ${t.name} for the Hyrule Archives (${st.figurines.length} this campaign).`;
}
const MINISH_HOMES: Record<string, true> = Object.fromEntries(MINISH_ROUTE.map((r) => [r, true]));

const PICO = Object.keys(PICOLYTES);

/** A technique a sword user hasn't learned yet. */
function teach(run: Run, rng: RNG, uid?: string, id?: string): string {
  const swords = run.roster.filter((u) => u.weapons.some((w) => WEAPONS[w]?.type === 'sword'));
  const u = (uid ? swords.find((x) => x.uid === uid) : undefined) ?? rng.pick(swords.length ? swords : run.roster);
  const left = DOJO_TECHNIQUES.filter((t) => ABILITIES[t] && !u.abilities.includes(t));
  if (!left.length) return `${u.name} has learned every technique the Blade Brothers teach.`;
  const t = id && left.includes(id) ? id : rng.pick(left);
  u.abilities.push(t);
  return `${u.name} learns ${ABILITIES[t].name}.`;
}

/** The Minish Cap event effects. */
export function applyMinishEffect(run: Run, e: Extract<EventEffect, { kind: 'minish' }>, rng: RNG): string | null {
  switch (e.op) {
    case 'fuse': return fuseKinstones(run, e.id ?? 'green', rng) ?? 'You don\'t have both halves.';
    case 'kinstone': { const k = kinstoneDrop(rng); q(run).push(k); return `A ${nameOf(k)}.`; }
    case 'shells': { for (let i = 0; i < (e.amount ?? 1); i++) q(run).push('mysteriousShell'); return `${e.amount ?? 1} Mysterious Shell${(e.amount ?? 1) > 1 ? 's' : ''}.`; }
    case 'figurine': return drawFigurine(run, rng) ?? 'You need 5 Mysterious Shells.';
    case 'picolyte': { const p = rng.pick(PICO); run.convoy.push(p); return `A ${nameOf(p)}.`; }
    case 'teach': return teach(run, rng);
    case 'reforge': {
      const st = minishOf(run);
      if (!q(run).includes('brokenPicoriBlade') && !owns(run, 'picoriBlade')) return 'You have no broken blade to reforge yet.';
      st.reforged = true;
      const lines: string[] = [];
      reforge(run, lines);
      return lines.join(' ') || 'The blade is already as strong as Melari can make it.';
    }
    case 'repairAll': {
      const mult = run.bonus === 'masterForging' ? 2 : 1;
      let n = 0;
      for (const u of run.roster) for (const w of Object.keys(u.wear ?? {})) { u.wear![w] = Math.max(0, u.wear![w] - 10 * mult); n++; }
      return `${n} weapon${n === 1 ? '' : 's'} repaired.`;
    }
  }
  return null;
}

/** Treasure nodes: a Kinstone or a Mysterious Shell in the chest. */
export function minishTreasure(run: Run, rng: RNG, ev: { rewards: Reward[]; rupees: number }): string[] {
  if (run.campaign !== 'minish') return [];
  const lines: string[] = [];
  if (rng.chance(45)) { const k = kinstoneDrop(rng); q(run).push(k); lines.push(`A ${nameOf(k)} is tucked in the chest.`); }
  if (rng.chance(40)) { q(run).push('mysteriousShell'); lines.push('And a Mysterious Shell.'); }
  if (rng.chance(25)) ev.rewards.unshift({ kind: 'gear', id: rng.pick(['minishLeafShield', 'minishTunic', 'forestMinishCap', 'minishBoots', 'townMinishHood', 'mountainMinishHelmet']) });
  return lines;
}

// ───────────────────────── Camp facilities (section 12) ─────────────────────────

export interface MinishCampOption {
  key: string;
  facility: string;
  label: string;
  desc: string;
  ok: boolean;
  pick?: (u: Unit) => boolean;
  select?: { id: string; label: string }[];
}

export const MINISH_FACILITIES: Record<string, { name: string; icon: string; where: ('camp' | 'shop' | 'smith')[] }> = {
  settlement: { name: 'Minish Settlement', icon: '🍀', where: ['camp', 'shop'] },
  forge: { name: 'Minish Forge', icon: '⚒', where: ['camp', 'smith'] },
  exchange: { name: 'Kinstone Exchange', icon: '💠', where: ['camp'] },
  dojo: { name: 'Swordmaster Dojo', icon: '🤺', where: ['camp'] },
  gallery: { name: 'Figurine Gallery', icon: '🗿', where: ['camp', 'shop'] },
  garden: { name: 'Picolyte Garden', icon: '🌸', where: ['camp'] },
};
const MICRO_GEAR = ['minishSword', 'minishSpear', 'minishHammer', 'minishBow', 'minishStaffWeapon', 'minishLeafShield', 'minishMetalShield', 'forestMinishCap', 'mountainMinishHelmet', 'townMinishHood', 'minishTunic', 'minishBoots', 'minishClimbingGloves'];
const GENERIC_MINISH = ['forestMinishScout', 'forestMinishHealer', 'mountainMinishWarrior', 'mountainMinishBlacksmith', 'townMinishThief', 'townMinishTinkerer'];
const CRAFTS: { id: string; mat: string; n: number; rupees: number }[] = [
  { id: 'minishLeafGlider', mat: 'pestoWing', n: 2, rupees: 150 }, { id: 'minishMetalShield', mat: 'rollobiteShell', n: 2, rupees: 100 },
  { id: 'gleerokShellArmor', mat: 'gleerokScale', n: 1, rupees: 400 }, { id: 'mazaalsSacredCore', mat: 'mazaalMechanism', n: 1, rupees: 400 },
  { id: 'gyorgEyeCharm', mat: 'gyorgWingFragment', n: 1, rupees: 300 }, { id: 'vaatisEye', mat: 'vaatisDarkEssence', n: 2, rupees: 600 },
];
const priceOf = (id: string) => WEAPONS[id]?.price ?? GEAR[id]?.price ?? 200;

export function minishCampOptions(run: Run, where: 'camp' | 'shop' | 'smith'): MinishCampOption[] {
  if (run.campaign !== 'minish') return [];
  const st = minishOf(run);
  const out: MinishCampOption[] = [];
  const add = (facility: string, o: Omit<MinishCampOption, 'facility'>) => { if (MINISH_FACILITIES[facility].where.includes(where)) out.push({ facility, ...o }); };
  const used = (k: string) => st.campUsed.includes(k);
  // ── Minish Settlement ──
  add('settlement', { key: 'recruitMinish', label: 'Recruit a Minish volunteer — ₹150', desc: 'A generic Minish (scout, healer, warrior, blacksmith, thief or tinkerer) joins.', ok: run.rupees >= 150 && !used('recruitMinish') && q(run).includes('jabberNut') || run.rupees >= 150 && !used('recruitMinish') && run.roster.some((u) => u.race === 'minish') });
  add('settlement', { key: 'buyMicro', label: 'Buy Micro equipment', desc: 'Micro-sized weapons and gear for your Minish.', ok: true, select: MICRO_GEAR.map((id) => ({ id, label: `${nameOf(id)} — ₹${priceOf(id)}` })) });
  // ── Minish Forge ──
  const worn = run.roster.reduce((n, u) => n + Object.values(u.wear ?? {}).filter((x) => x > 0).length, 0);
  add('forge', { key: 'repair', label: `Repair every weapon — ₹${worn * 20}`, desc: `${worn} worn weapon${worn === 1 ? '' : 's'}${run.bonus === 'masterForging' ? ' (Master Forging: twice the durability)' : ''}.`, ok: worn > 0 && run.rupees >= worn * 20 });
  add('forge', { key: 'resize', label: 'Resize a weapon for a Micro unit — ₹200', desc: 'Magical resizing: the unit\'s equipped ordinary weapon becomes usable at Micro size.', ok: run.rupees >= 200,
    pick: (u) => !!u.micro && !!u.weapons[0] && !WEAPONS[u.weapons[0]]?.mc?.includes('micro') });
  if (q(run).includes('brokenPicoriBlade') || owns(run, 'picoriBlade')) add('forge', { key: 'reforge', label: 'Reforge the Picori Blade', desc: 'Melari\'s craft (he or a Mountain Minish Blacksmith must be in the army).', ok: run.roster.some((u) => ['melari', 'mountainMinishBlacksmith'].includes(u.templateId ?? '')) && !st.reforged });
  for (const c of CRAFTS) add('forge', { key: `craft:${c.id}`, label: `Craft ${nameOf(c.id)} — ${c.n}× ${nameOf(c.mat)}, ₹${c.rupees}`, desc: 'Monster materials into gear.', ok: count(run, c.mat) >= c.n && run.rupees >= c.rupees });
  // ── Kinstone Exchange ──
  for (const k of KINSTONES) add('exchange', { key: `fuse:${k}`, label: `Fuse two ${nameOf(k)}s (${count(run, k)})`, desc: 'Find a fusion partner: treasure, hidden caves, rare monsters, recruits or a Great Fairy.', ok: count(run, k) >= 2 });
  add('exchange', { key: 'tradeKinstone', label: 'Trade 3 Mysterious Shells for a Kinstone piece', desc: 'Random colour.', ok: count(run, 'mysteriousShell') >= 3 });
  // ── Swordmaster Dojo ──
  add('dojo', { key: 'teach', label: 'Learn a technique — ₹250', desc: 'Roll Attack, Dash Attack, Rock Breaker, Peril Beam, Down Thrust, Great Spin and the enhancements.', ok: run.rupees >= 250 && !used('teach'),
    pick: (u) => u.weapons.some((w) => WEAPONS[w]?.type === 'sword') && DOJO_TECHNIQUES.some((t) => !u.abilities.includes(t)),
    select: DOJO_TECHNIQUES.map((id) => ({ id, label: ABILITIES[id]?.name ?? id })) });
  // ── Figurine Gallery ──
  add('gallery', { key: 'figurine', label: `Trade 5 Mysterious Shells for a figurine (${count(run, 'mysteriousShell')} shells)`, desc: `Hyrule Archives entries, no combat effect (${st.figurines.length} this campaign).`, ok: count(run, 'mysteriousShell') >= 5 });
  // ── Picolyte Garden ──
  add('garden', { key: 'picolyte', label: 'Grow a Picolyte — ₹100', desc: 'Choose the colour.', ok: run.rupees >= 100 && !used('picolyte'), select: PICO.map((id) => ({ id, label: `${nameOf(id)}: ${PICOLYTES[id]}` })) });
  return out;
}

export function doMinishCamp(run: Run, key: string, rng: RNG, uid?: string, arg?: string): string | null {
  const st = minishOf(run);
  const opt = minishCampOptions(run, 'camp').concat(minishCampOptions(run, 'shop'), minishCampOptions(run, 'smith')).find((o) => o.key === key);
  if (!opt || !opt.ok) return null;
  const u = uid ? run.roster.find((x) => x.uid === uid) : undefined;
  if (opt.pick && (!u || !opt.pick(u))) return null;
  const done = () => { if (!st.campUsed.includes(key)) st.campUsed.push(key); };
  if (key.startsWith('fuse:')) return fuseKinstones(run, key.slice(5 + 'kinstone'.length).toLowerCase(), rng);
  if (key.startsWith('craft:')) {
    const c = CRAFTS.find((x) => x.id === key.slice(6))!;
    take(run, c.mat, c.n); run.rupees -= c.rupees; run.convoy.push(c.id);
    return `Crafted: ${nameOf(c.id)}.`;
  }
  switch (key) {
    case 'recruitMinish': {
      run.rupees -= 150; done();
      const id = rng.pick(GENERIC_MINISH);
      run.roster.push(makeHero(id, `p${run.uidCounter++}`, avgLevel(run), rng));
      run.stats.recruits++;
      return `A ${nameOf(id)} joins the army.`;
    }
    case 'buyMicro': {
      const id = arg && MICRO_GEAR.includes(arg) ? arg : MICRO_GEAR[0];
      if (run.rupees < priceOf(id)) return null;
      run.rupees -= priceOf(id); run.convoy.push(id);
      return `Bought: ${nameOf(id)}.`;
    }
    case 'repair': {
      const worn = run.roster.reduce((n, x) => n + Object.values(x.wear ?? {}).filter((w) => w > 0).length, 0);
      run.rupees -= worn * 20;
      for (const x of run.roster) for (const w of Object.keys(x.wear ?? {})) x.wear![w] = run.bonus === 'masterForging' ? 0 : Math.max(0, x.wear![w] - 15);
      return 'The Minish Forge repairs every weapon.';
    }
    case 'resize': {
      run.rupees -= 200;
      (u!.mcResized ??= []).push(u!.weapons[0]);
      return `${u!.name}'s ${nameOf(u!.weapons[0])} is magically resized.`;
    }
    case 'reforge': return applyMinishEffect(run, { kind: 'minish', op: 'reforge' }, rng);
    case 'tradeKinstone': { take(run, 'mysteriousShell', 3); const k = kinstoneDrop(rng); q(run).push(k); return `A ${nameOf(k)}.`; }
    case 'teach': { run.rupees -= 250; done(); return teach(run, rng, uid, arg); }
    case 'figurine': return drawFigurine(run, rng);
    case 'picolyte': {
      run.rupees -= 100; done();
      const p = arg && PICO.includes(arg) ? arg : rng.pick(PICO);
      run.convoy.push(p);
      return `A ${nameOf(p)} ripens in the garden.`;
    }
  }
  return null;
}

/** New camp: facility uses reset. */
export function minishCampVisit(run: Run) {
  if (run.minish) run.minish.campUsed = [];
}

/** Top-bar summary of the campaign. */
export function minishStatus(run: Run): { line: string; kinstones: number[]; shells: number; elements: number; sword: string; figurines: number } {
  const st = minishOf(run);
  const i = MINISH_ROUTE.indexOf(run.region);
  return {
    line: i >= 0 ? `Region ${i + 1}/16` : 'Hyrule', kinstones: KINSTONES.map((k) => count(run, k)), shells: count(run, 'mysteriousShell'),
    elements: ELEMENTS.filter((e) => q(run).includes(e)).length, sword: nameOf(swordStage(run)), figurines: st.figurines.length,
  };
}

/** Experience for the whole army (the Minish elders' training). */
export const minishTrain = (run: Run, rng: RNG, amount: number) => { for (const u of run.roster) gainXp(u, amount, rng); };
