// Echoes of Wisdom campaign: the twelve regions of section 14 in order (with their bosses), the Echo Compendium
// (learned in every campaign: the Echo system is game-wide), Tri's level and Echo Capacity, the Rifts and the Still
// World (unrepaired Rifts spread after encounters, swallowing shops and recruits; repairing them and rescuing Tri's
// friends gives Tri EXP, Might Crystals and regional rewards), smoothies on the Wild era's ingredient bag, stamps,
// and the camp facilities (Echo Archive, Lueburry's Laboratory, Dampé's Studio, Smoothie Shop, Rift Observatory,
// Stamp Rally Station).

import { BOSSES, ENEMIES, GEAR, ITEMS, QUEST_ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import {
  AUTOMATONS, ECHO_BOSSES, ECHOES_ROUTE, EO_ROUTE_BOSSES, OBJECT_BY_ID, OBJECT_ECHOES, SMOOTHIE_FEE, SMOOTHIE_FILLERS, SMOOTHIE_INGREDIENTS, SMOOTHIE_RECIPES,
  STARTING_MONSTERS, STARTING_OBJECTS, STILL_WORLD_TERRAIN, TRI_FRIENDS, TRI_MAX_LEVEL, TRI_XP_PER_LEVEL,
} from '../content/echoes';
import { anchorCost, footprint, tilesInRange, unitAt } from './grid';
import { defeatedEchoes, echoName, eoState, isAutomaton, isEchoEligible, startStillWorld } from './echoes';
import type { RNG } from './rng';
import { INF } from './rules';
import { addToPack, makeEnemy, makeHero } from './units';
import type { Battle, BossDef, EventEffect, MapNode, Run, RunMap, Unit } from './types';
import type { Reward } from './run';

export interface EchoesRunState {
  /** The Echo Compendium: monster template ids and Object Echo ids. */
  known: string[];
  /** Tri's EXP (Rift repairs and rescues) and level. */
  triXp: number;
  /** Route bosses beaten (and `region:<id>` markers). */
  beaten: string[];
  done?: boolean;
  rescued: number;
  repaired: number;
  stamps: number;
  campUsed: string[];
}

declare module './types' {
  interface Run {
    /** Echoes of Wisdom state (the Compendium is kept in every campaign). */
    eow?: EchoesRunState;
  }
  interface MapNode {
    /** Echoes of Wisdom: a Rift has swallowed this place (a Still World battle). */
    eoRift?: boolean;
  }
}

export const echoesOf = (run: Run): EchoesRunState => (run.eow ??= { known: [...STARTING_MONSTERS, ...STARTING_OBJECTS], triXp: 0, beaten: [], rescued: 0, repaired: 0, stamps: 0, campUsed: [] });
export const triLevel = (run: Run) => Math.min(TRI_MAX_LEVEL, 1 + Math.floor(echoesOf(run).triXp / TRI_XP_PER_LEVEL));
const q = (run: Run) => (run.questItems ??= []);
const count = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const take = (run: Run, id: string, n = 1) => { for (let i = 0; i < n; i++) { const k = q(run).indexOf(id); if (k < 0) return false; q(run).splice(k, 1); } return true; };
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id));
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? QUEST_ITEMS[id]?.name ?? TEMPLATES[id]?.name ?? echoName(id);
const avgLevel = (run: Run) => Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));
const isEoCamp = (run: Run) => run.campaign === 'echoes';

export const echoesStartRegion = (): string => ECHOES_ROUTE[0];
export const inEchoesRoute = (run: Run) => isEoCamp(run) && ECHOES_ROUTE.includes(run.region) && !echoesOf(run).done;

function recruitOnce(run: Run, id: string, rng: RNG, lines: string[], why: string) {
  if (!TEMPLATES[id] || run.roster.some((u) => u.templateId === id || TEMPLATES[u.templateId ?? '']?.exclusiveWith?.includes(id))) return;
  run.roster.push(makeHero(id, `p${run.uidCounter++}`, avgLevel(run), rng));
  run.stats.recruits++;
  lines.push(why);
}
function give(run: Run, id: string, lines: string[], why: string) {
  if (owns(run, id) || !(WEAPONS[id] || GEAR[id] || ITEMS[id])) return;
  if (ITEMS[id]) { const u = run.roster.find((x) => addToPack(x, id)); if (!u) run.convoy.push(id); } else run.convoy.push(id);
  lines.push(why);
}

/** New campaign: the Compendium's first Echoes, a Stamp Card. */
export function echoesStart(run: Run, rng: RNG) {
  echoesOf(run);
  if (!q(run).includes('stampCard')) q(run).push('stampCard', 'refreshingGrapes', 'floralNectar');
  void rng;
}

/** The fixed boss of a route region. */
export function echoesBossFor(run: Run, node: MapNode): BossDef | null {
  if (!isEoCamp(run) || node.type !== 'boss') return null;
  const id = (EO_ROUTE_BOSSES[node.world] ?? []).find((x) => BOSSES[x]);
  return id ? BOSSES[id] : null;
}

/** Map decoration: Rifts swallow one or two places in every route region. */
export function echoesDecorateMap(run: Run, map: RunMap, rng: RNG) {
  if (!isEoCamp(run) || !ECHOES_ROUTE.includes(run.region)) return;
  const rows = Math.max(...map.nodes.map((n) => n.row));
  const mid = rng.shuffle(map.nodes.filter((n) => n.row >= 1 && n.row <= rows - 1 && ['battle', 'event', 'elite'].includes(n.type)));
  const i = ECHOES_ROUTE.indexOf(run.region);
  for (const n of mid.slice(0, i >= 8 ? 3 : i >= 3 ? 2 : 1)) { n.eoRift = true; if (n.type === 'event') n.type = 'battle'; }
}

const ESCORTS: Record<string, string[]> = {
  seismicTalus: ['octorok'], mogryph: ['holmill', 'caromadillo'], vocavor: ['chompfin', 'hydrozol'], skorchill: ['whiteWolfos', 'freezard'],
  tekomBoss: ['darknut'], nullEoW: ['lynel', 'darknut'], echoLink: ['moblin', 'lizalfos'],
};

function spawnNear(b: Battle, id: string, near: Unit, level: number, rng: RNG): Unit | undefined {
  const a = ENEMIES[id] ?? BOSSES[id];
  if (!a) return undefined;
  const e = makeEnemy(a, b.world, level, `eo${b.uidCounter++}`, rng);
  e.isBoss = false;
  for (let d = 1; d <= 6; d++) {
    const spot = tilesInRange(b, near, d, d, near.size).find((p) => anchorCost(b, e, p.x, p.y) < INF && footprint(p.x, p.y, e.size).every((f) => !unitAt(b, f.x, f.y)));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y, team: 'enemy', ai: 'aggressive' }); b.units.push(e); return e; }
  }
  return undefined;
}

/** Battle setup, every campaign: the Compendium and Tri's level ride along. Echoes of Wisdom: Still World battles, Echo bosses. */
export function echoesBattleSetup(run: Run, b: Battle, rng: RNG) {
  const ev = echoesOf(run);
  const st = eoState(b);
  st.known = [...ev.known];
  st.triLevel = triLevel(run);
  st.might = count(run, 'mightCrystal');
  for (const u of b.units) if (u.eoEnergy !== undefined) u.eoEnergy = 40 + 5 * st.might;
  if (!isEoCamp(run)) return;
  const node = run.map.nodes.find((n) => n.id === run.currentNodeId);
  if (node?.eoRift && !b.naval) startStillWorld(b, rng, STILL_WORLD_TERRAIN, !!TRI_FRIENDS[b.world]);
  if (b.nodeType !== 'boss') return;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!main) return;
  if (ECHO_BOSSES.includes(main.bossId ?? '')) {
    main.name = main.name.startsWith('Echo') ? main.name : `Echo ${main.name}`;
    main.eoRift = true;
    if ((b.bossTier ?? 0) === 0) { for (const k of ['str', 'mag', 'def', 'res'] as const) main.stats[k] = Math.round(main.stats[k] * 0.9); main.stats.hp = main.hp = Math.round(main.stats.hp * 0.9); }
  }
  for (const id of ESCORTS[main.bossId ?? ''] ?? []) spawnNear(b, id, main, Math.max(1, main.level - 1), rng);
}

// ───────────────────────── After a battle ─────────────────────────

export function echoesAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const ev = echoesOf(run);
  const st = b.eo;
  if (!won) return lines;
  // The Echo Compendium learns from every defeated monster (any pack, any campaign).
  const fresh = [...defeatedEchoes(b), ...(st?.learned ?? [])].filter((id) => !ev.known.includes(id));
  if (fresh.length && (isEoCamp(run) || run.roster.some((u) => u.weapons.some((w) => WEAPONS[w]?.eo?.includes('triRod'))))) {
    ev.known.push(...fresh);
    lines.push(`The Echo Compendium learns: ${fresh.map(echoName).join(', ')}.`);
  }
  if (st?.found.length) { q(run).push(...st.found); lines.push(`Found: ${st.found.map(nameOf).join(', ')}.`); }
  if (st?.stamps) {
    for (let i = 0; i < st.stamps; i++) q(run).push('stamp');
    ev.stamps += st.stamps;
    lines.push(`${st.stamps} stamp${st.stamps > 1 ? 's' : ''} for the Stamp Card.`);
  }
  if (st?.rescued) { ev.rescued += st.rescued; ev.triXp += st.rescued; lines.push(`Tri's friend${st.rescued > 1 ? 's are' : ' is'} rescued! Tri glows brighter.`); }
  if (st?.repaired) ev.repaired += st.repaired;
  if (run.roster.some((u) => u.skills.includes('stampEnthusiast'))) { const bonus = Math.round(b.rewardRupees * 0.2); run.rupees += bonus; lines.push(`The Stamp Guy finds ₹${bonus} on the way.`); }
  if (!isEoCamp(run)) return lines;
  const node = run.map.nodes.find((n) => n.id === run.currentNodeId);
  if (node?.eoRift) {
    node.eoRift = false;
    const before = triLevel(run);
    ev.triXp += TRI_XP_PER_LEVEL;
    ev.repaired++;
    q(run).push('mightCrystal');
    lines.push(`The Rift is repaired! Tri gains power${triLevel(run) > before ? ` (Tri level ${triLevel(run)})` : ''}, and a Might Crystal is left behind.`);
    if (rng.chance(50)) { const ing = rng.pick(Object.keys(SMOOTHIE_INGREDIENTS)); q(run).push(ing); lines.push(`${nameOf(ing)} grows where the Rift was.`); }
  } else lines.push(...spreadRifts(run, rng));
  if (rng.chance(30)) { const ing = rng.pick(Object.keys(SMOOTHIE_INGREDIENTS)); q(run).push(ing); lines.push(`A smoothie ingredient: ${nameOf(ing)}.`); }
  lines.push(...routeRewards(run, b, rng));
  return lines;
}

/** Unrepaired Rifts spread after encounters: they swallow neighbouring places (shops and recruits become Still World battles). */
function spreadRifts(run: Run, rng: RNG): string[] {
  const rifts = run.map.nodes.filter((n) => n.eoRift && !n.visited);
  if (!rifts.length || !rng.chance(35)) return [];
  const near = run.map.nodes.filter((n) => !n.visited && !n.eoRift && n.type !== 'boss' && rifts.some((r) => r.next.includes(n.id) || n.next.includes(r.id)));
  if (!near.length) return [];
  const n = rng.pick(near);
  const was = n.type;
  n.eoRift = true;
  if (['shop', 'recruit', 'camp', 'event', 'treasure', 'fountain', 'blacksmith'].includes(n.type)) n.type = 'battle';
  return [`The Rift spreads!${was !== n.type ? ` A ${was} ahead is swallowed by the Still World.` : ' Another place ahead is swallowed.'}`];
}

function routeRewards(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  if (b.nodeType !== 'boss') return lines;
  const ev = echoesOf(run);
  const region = b.world;
  const key = `region:${region}`;
  if (ev.beaten.includes(key) || !ECHOES_ROUTE.includes(region)) return lines;
  ev.beaten.push(key);
  ev.triXp += 1;
  q(run).push('mightCrystal');
  lines.push('The region\'s Rift closes. A Might Crystal glitters in the light.');
  switch (region) {
    case 'suthornForest': recruitOnce(run, 'tri', rng, lines, 'A glowing little being bobs up: "I\'m Tri! Let me help you, Zelda."'); give(run, 'heartPin', lines, 'A Heart Pin, from the ruins.'); break;
    case 'gerudoDesertEoW': recruitOnce(run, 'dohna', rng, lines, 'Dohna sheathes her blade: "You saved the Sanctum. I\'ll follow you."'); give(run, 'gerudoSandals', lines, 'Gerudo Sandals, from Chief Seera.'); break;
    case 'jabulWaters': recruitOnce(run, rng.chance(50) ? 'dradd' : 'kushara', rng, lines, 'A Zora chief joins you, the quarrel forgotten for now.'); give(run, 'zorasFlippers', lines, 'Zora\'s Flippers.'); give(run, 'zoraScaleEoW', lines, 'A Zora Scale.'); break;
    case 'hyruleCastleEoW': recruitOnce(run, 'kingEoW', rng, lines, 'The real king steps out of the Rift in the throne room. "My daughter."'); recruitOnce(run, 'ministerLefte', rng, lines, 'Lefte bows: "I never believed the copy."'); break;
    case 'eldinVolcanoEoW': recruitOnce(run, 'darston', rng, lines, '"That\'s courage, goro!" Darston joins.'); give(run, 'chillySmoothie', lines, 'A Chilly Smoothie for the road.'); break;
    case 'faronWetlands': recruitOnce(run, 'lueburry', rng, lines, 'Lueburry adjusts his spectacles. "The Might Crystals! I must study them in the field!"'); give(run, 'frogRing', lines, 'A Frog Ring, from a Deku Scrub.'); break;
    case 'hebraMountain': recruitOnce(run, 'conde', rng, lines, 'Condé shoulders his shovel. "I\'ll clear the way."'); give(run, 'climbingBand', lines, 'A Climbing Band.'); break;
    case 'easternTemple': recruitOnce(run, 'stampGuy', rng, lines, 'A man in a stamp suit leaps out: "A Stamp Station in a temple! I\'m coming!"'); break;
    case 'wreckedShip': recruitOnce(run, 'dampeEoW', rng, lines, 'Dampé climbs out of the hold: "Nice work. Now let me show you my Automatons."'); recruitOnce(run, rng.pick(AUTOMATONS.slice(0, 3)), rng, lines, 'An Automaton salutes.'); break;
    case 'eternalForest': recruitOnce(run, 'tekom', rng, lines, 'The copy of Zelda falls to her knees. "What am I, without the Rift?" Tekom joins you.'); break;
    case 'ancientRuins': recruitOnce(run, 'linkEoW', rng, lines, 'The real Link steps out of the last copy. He nods to Zelda.'); give(run, 'swordOfMight', lines, 'The Sword of Might.'); break;
    case 'nullsBody':
      ev.done = true;
      q(run).push('powerPrimeEnergy', 'wisdomPrimeEnergy', 'couragePrimeEnergy');
      give(run, 'nullsEmbrace', lines, 'Null\'s Embrace.');
      lines.push('Null returns to nothing. The Rifts close all over Hyrule, and Tri\'s friends come home.');
      break;
  }
  return lines;
}

/** Region choices after a boss: the next region on the route. Empty: the ordinary choice of regions. */
export function echoesRegionOptions(run: Run, rng: RNG): string[] {
  const i = ECHOES_ROUTE.indexOf(run.region);
  if (i < 0) return [];
  if (echoesOf(run).done || i === ECHOES_ROUTE.length - 1) return rng.shuffle(ECHOES_ROUTE.filter((x) => x !== run.region)).slice(0, 3);
  return [ECHOES_ROUTE[i + 1]];
}

/** Treasure nodes: an ingredient, a Might Crystal, sometimes gear. */
export function echoesTreasure(run: Run, rng: RNG, ev: { rewards: Reward[]; rupees: number }): string[] {
  if (!isEoCamp(run)) return [];
  const lines: string[] = [];
  if (rng.chance(50)) { const ing = rng.pick(Object.keys(SMOOTHIE_INGREDIENTS)); q(run).push(ing); lines.push(`${nameOf(ing)} is tucked in the chest.`); }
  if (rng.chance(20)) { q(run).push('mightCrystal'); lines.push('And a Might Crystal!'); }
  if (rng.chance(25)) ev.rewards.unshift({ kind: 'gear', id: rng.pick(['royalTravelAttire', 'disguiseEoW', 'energyGlove', 'surveyScope', 'curiousCharm', 'climbingBand', 'heartPin', 'herosClothes']) });
  if (run.roster.some((u) => Object.values(u.gear).includes('stampSuit'))) ev.rupees += 40;
  return lines;
}

// ───────────────────────── Smoothies (the Wild era's ingredient bag) ─────────────────────────

const fillersHeld = (run: Run, not?: string) => [...Object.keys(SMOOTHIE_INGREDIENTS), ...SMOOTHIE_FILLERS].filter((id) => id !== not && count(run, id) > 0);

export function smoothieOptions(run: Run): { id: string; label: string; ok: boolean; uses: string[] }[] {
  return Object.entries(SMOOTHIE_RECIPES).map(([id, keys]) => {
    let uses: string[] = [];
    if (keys.length) {
      const k = keys.find((x) => count(run, x) > 0);
      const second = k ? (count(run, k) > 1 ? k : fillersHeld(run, k)[0]) : undefined;
      if (k && second) uses = [k, second];
    } else {
      const f = SMOOTHIE_FILLERS.filter((x) => count(run, x) > 0);
      if (f.length >= 2 || (f[0] && count(run, f[0]) >= 2)) uses = [f[0], f[1] ?? f[0]];
    }
    return { id, label: `${ITEMS[id]?.name ?? id}${uses.length ? ` (${uses.map(nameOf).join(' + ')}, ₹${SMOOTHIE_FEE})` : ''}`, ok: uses.length === 2 && run.rupees >= SMOOTHIE_FEE, uses };
  });
}

export function blendSmoothie(run: Run, id: string): string | null {
  const o = smoothieOptions(run).find((x) => x.id === id);
  if (!o?.ok) return null;
  for (const u of o.uses) take(run, u);
  run.rupees -= SMOOTHIE_FEE;
  run.convoy.push(id);
  return `Blended: ${nameOf(id)}.`;
}

// ───────────────────────── Events ─────────────────────────

function learnObject(run: Run): string {
  const ev = echoesOf(run);
  const next = OBJECT_ECHOES.map((o) => o.id).find((id) => !ev.known.includes(id));
  if (!next) return 'The Compendium already holds every object.';
  ev.known.push(next);
  return `A new Object Echo: ${OBJECT_BY_ID[next].name}.`;
}
function learnMonster(run: Run, rng: RNG): string {
  const ev = echoesOf(run);
  const pool = Object.keys(ENEMIES).filter((id) => isEchoEligible(id) && !ev.known.includes(id) && (TEMPLATES[id]?.home === run.region || rng.chance(10)));
  if (!pool.length) return 'Nothing new to copy here.';
  const id = rng.pick(pool);
  ev.known.push(id);
  return `A new Echo: ${echoName(id)}.`;
}

export function applyEchoesEffect(run: Run, e: Extract<EventEffect, { kind: 'echoes' }>, rng: RNG): string | null {
  const ev = echoesOf(run);
  switch (e.op) {
    case 'learnObject': return learnObject(run);
    case 'learnMonster': return learnMonster(run, rng);
    case 'mightCrystal': q(run).push('mightCrystal'); return 'A Might Crystal (+5 Swordfighter Energy).';
    case 'stamp': { const n = e.amount ?? 1; for (let i = 0; i < n; i++) q(run).push('stamp'); ev.stamps += n; return `${n} stamp${n > 1 ? 's' : ''}.`; }
    case 'smoothie': { const s = rng.pick(Object.keys(SMOOTHIE_RECIPES).filter((x) => x !== 'unfortunateSmoothie')); run.convoy.push(s); return `A ${nameOf(s)}.`; }
    case 'ingredient': { const out: string[] = []; for (let i = 0; i < (e.amount ?? 1); i++) { const s = rng.pick(Object.keys(SMOOTHIE_INGREDIENTS)); q(run).push(s); out.push(nameOf(s)); } return `Ingredients: ${out.join(', ')}.`; }
    case 'triXp': { const before = triLevel(run); ev.triXp += e.amount ?? 1; ev.rescued++; return triLevel(run) > before ? `Tri reaches level ${triLevel(run)}!` : 'Tri glows a little brighter.'; }
  }
  return null;
}

// ───────────────────────── Camp facilities (section 14) ─────────────────────────

export interface EchoesCampOption { key: string; facility: string; label: string; desc: string; ok: boolean; pick?: (u: Unit) => boolean; select?: { id: string; label: string }[] }

export const ECHOES_FACILITIES: Record<string, { name: string; icon: string; where: ('camp' | 'shop' | 'smith')[] }> = {
  archive: { name: 'Echo Archive', icon: '📜', where: ['camp'] },
  lab: { name: "Lueburry's Laboratory", icon: '🔬', where: ['camp', 'smith'] },
  studio: { name: "Dampé's Studio", icon: '⚙', where: ['camp', 'smith'] },
  smoothie: { name: 'Smoothie Shop', icon: '🥤', where: ['camp', 'shop'] },
  observatory: { name: 'Rift Observatory', icon: '🔭', where: ['camp'] },
  stamps: { name: 'Stamp Rally Station', icon: '📮', where: ['camp', 'shop'] },
};
const STAMP_REWARDS = ['stampSuit', 'heartBarrette', 'energyBelt', 'surveyBinoculars', 'secondMastery', 'silkPajamas', 'ancientCharm', 'finalMastery'];

export function echoesCampOptions(run: Run, where: 'camp' | 'shop' | 'smith'): EchoesCampOption[] {
  if (!isEoCamp(run)) return [];
  const ev = echoesOf(run);
  const out: EchoesCampOption[] = [];
  const add = (facility: string, o: Omit<EchoesCampOption, 'facility'>) => { if (ECHOES_FACILITIES[facility].where.includes(where)) out.push({ facility, ...o }); };
  const used = (k: string) => ev.campUsed.includes(k);
  const monsters = ev.known.filter((id) => !OBJECT_BY_ID[id]);
  // ── Echo Archive ──
  add('archive', { key: 'study', label: `Study a monster's trail — ₹120 (Compendium: ${monsters.length} monsters, ${ev.known.length - monsters.length} objects)`, desc: 'Learn a new monster Echo native to this region.', ok: run.rupees >= 120 && !used('study') });
  add('archive', { key: 'sketch', label: 'Sketch an object — ₹80', desc: 'Learn the next Object Echo.', ok: run.rupees >= 80 && !used('sketch') && OBJECT_ECHOES.some((o) => !ev.known.includes(o.id)) });
  // ── Lueburry's Laboratory ──
  add('lab', { key: 'bombs', label: 'Craft Bombs of Might — 2 Might Crystals', desc: 'Energy-powered explosives.', ok: count(run, 'mightCrystal') >= 2 });
  add('lab', { key: 'mightGear', label: 'Swordfighter gear — 1 Might Crystal + ₹300', desc: 'An Energy Glove, then First Mastery, then an Energy Belt.', ok: count(run, 'mightCrystal') >= 1 && run.rupees >= 300 && !used('mightGear') });
  add('lab', { key: 'energyBrew', label: 'Energy Smoothie — ₹80', desc: 'Lueburry\'s own recipe.', ok: run.rupees >= 80 });
  // ── Dampé's Studio ──
  add('studio', { key: 'build', label: 'Build an Automaton — a Monster Stone + ₹250', desc: 'Techtite, Tocktorok, Gizmol or High-Teku Baba (a Heirloom Katana makes a Roboblin, a Golden Fan a Goldfinch).', ok: count(run, 'monsterStone') >= 1 && run.rupees >= 250,
    select: AUTOMATONS.filter((id) => id !== 'roboblin' || count(run, 'heirloomKatana')).filter((id) => id !== 'goldfinch' || count(run, 'goldenFan')).map((id) => ({ id, label: TEMPLATES[id]?.name ?? id })) });
  add('studio', { key: 'repairAll', label: 'Repair every Automaton — ₹60', desc: 'Mechanical repair: full HP.', ok: run.rupees >= 60 && run.roster.some((u) => isAutomaton(u) && u.hp < u.stats.hp) });
  add('studio', { key: 'key', label: 'Buy a Clockwork Key — ₹150', desc: 'Rewinds an Automaton in battle.', ok: run.rupees >= 150 });
  add('studio', { key: 'stoneKit', label: 'Make a Monster Stone Kit — a Monster Stone', desc: 'Field repairs for Automatons.', ok: count(run, 'monsterStone') >= 1 });
  // ── Smoothie Shop ──
  for (const s of smoothieOptions(run)) add('smoothie', { key: `blend:${s.id}`, label: `Blend ${s.label}`, desc: ITEMS[s.id]?.desc ?? '', ok: s.ok });
  // ── Rift Observatory ──
  const rifts = run.map.nodes.filter((n) => n.eoRift && !n.visited).length;
  add('observatory', { key: 'observe', label: `Rift progress: Tri level ${triLevel(run)}, ${ev.repaired} Rifts repaired, ${ev.rescued} friends rescued, ${rifts} open here`, desc: 'Tri\'s level sets the army\'s Echo Capacity.', ok: false });
  add('observatory', { key: 'seal', label: 'Seal a Rift from afar — ₹250 (needs Tri)', desc: 'Tri closes the nearest open Rift on this map (no battle, no reward).', ok: rifts > 0 && run.rupees >= 250 && run.roster.some((u) => u.templateId === 'tri') && !used('seal') });
  // ── Stamp Rally Station ──
  add('stamps', { key: 'card', label: `Trade a full Stamp Card — 10 stamps (${count(run, 'stamp')})`, desc: 'Prizes: the Stamp Suit, then better and better accessories.', ok: count(run, 'stamp') >= 10 });
  return out;
}

export function doEchoesCamp(run: Run, key: string, rng: RNG, uid?: string, arg?: string): string | null {
  const ev = echoesOf(run);
  const opt = echoesCampOptions(run, 'camp').concat(echoesCampOptions(run, 'shop'), echoesCampOptions(run, 'smith')).find((o) => o.key === key);
  if (!opt || !opt.ok) return null;
  void uid;
  const done = () => { if (!ev.campUsed.includes(key)) ev.campUsed.push(key); };
  if (key.startsWith('blend:')) return blendSmoothie(run, key.slice(6));
  switch (key) {
    case 'study': run.rupees -= 120; done(); return learnMonster(run, rng);
    case 'sketch': run.rupees -= 80; done(); return learnObject(run);
    case 'bombs': take(run, 'mightCrystal', 2); run.convoy.push('bombsOfMight'); return 'Bombs of Might, fresh from the laboratory.';
    case 'mightGear': {
      const g = ['energyGlove', 'firstMastery', 'energyBelt', 'secondMastery'].find((x) => !owns(run, x)) ?? 'finalMastery';
      take(run, 'mightCrystal'); run.rupees -= 300; done(); run.convoy.push(g);
      return `Lueburry hands you: ${nameOf(g)}.`;
    }
    case 'energyBrew': run.rupees -= 80; run.convoy.push('energySmoothie'); return 'An Energy Smoothie.';
    case 'build': {
      const id = arg && opt.select?.some((s) => s.id === arg) ? arg : rng.pick(AUTOMATONS.slice(0, 4));
      take(run, 'monsterStone'); run.rupees -= 250;
      if (id === 'roboblin') take(run, 'heirloomKatana');
      if (id === 'goldfinch') take(run, 'goldenFan');
      run.roster.push(makeHero(id, `p${run.uidCounter++}`, avgLevel(run), rng));
      run.stats.recruits++;
      return `Dampé winds up a new ${nameOf(id)}.`;
    }
    case 'repairAll': run.rupees -= 60; for (const u of run.roster) if (isAutomaton(u)) u.hp = u.stats.hp; return 'Every Automaton is repaired.';
    case 'key': run.rupees -= 150; run.convoy.push('clockworkKey'); return 'A Clockwork Key.';
    case 'stoneKit': take(run, 'monsterStone'); run.convoy.push('monsterStoneKit'); return 'A Monster Stone Kit.';
    case 'seal': {
      const n = run.map.nodes.find((x) => x.eoRift && !x.visited);
      if (!n) return null;
      n.eoRift = false; run.rupees -= 250; done();
      return 'Tri reaches out from the observatory: one Rift ahead closes.';
    }
    case 'card': {
      take(run, 'stamp', 10);
      const g = STAMP_REWARDS.find((x) => !owns(run, x)) ?? 'goldenSmoothie';
      run.convoy.push(g);
      return `The Stamp Guy is overjoyed: ${nameOf(g)}!`;
    }
  }
  return null;
}

/** New camp: facility uses reset. */
export function echoesCampVisit(run: Run) {
  if (run.eow) run.eow.campUsed = [];
}

/** Top-bar summary of the campaign. */
export function echoesStatus(run: Run): { line: string; tri: number; known: number; crystals: number; stamps: number; rifts: number } {
  const ev = echoesOf(run);
  const i = ECHOES_ROUTE.indexOf(run.region);
  return {
    line: i >= 0 ? `Region ${i + 1}/12` : 'Hyrule', tri: triLevel(run), known: ev.known.length, crystals: count(run, 'mightCrystal'), stamps: count(run, 'stamp'),
    rifts: run.map.nodes.filter((n) => n.eoRift && !n.visited).length,
  };
}
