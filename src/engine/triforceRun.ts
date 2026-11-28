// The Tri Force Heroes campaign: the nine Drablands regions of section 8 in order (Woodlands to the Den of Trials, each
// with its final boss), the heroes and Hytopians joining, Lady Maud's Fashion Curse over Hytopia (Styla cursed, an
// outfit cursed each battle) until the Sky Realm, crafting materials, and the camp facilities: Madame Couture's
// Boutique (craft and tailor outfits from materials and Rupees), the Hytopian Training Hall (Totems and cooperative
// techniques) and the Drablands Challenge Board (optional battle restrictions for rare materials). ALBW Link leads it
// with an alternative loadout: the Tri Force Heroes.

import { BOSSES, ENEMIES, GEAR, ITEMS, QUEST_ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import {
  ALT_LOADOUTS, BOSS_COPIES, CURSED_STYLA_ART, MATERIALS, OUTFITS, RARE_MATERIALS, RECIPES, REGION_MATERIAL, TF_ROUTE, TF_ROUTE_BOSSES, TRI_HEROES, TRIFORCE_PREFERRED_ART,
} from '../content/triforce';
import { adjustMorale, armyOf } from './army';
import { canWield } from './combat';
import { anchorCost, footprint, tilesInRange, unitAt } from './grid';
import type { RNG } from './rng';
import { INF } from './rules';
import { outfitOf, tfState } from './triforce';
import { addToPack, makeEnemy, makeHero } from './units';
import type { Battle, BossDef, CommanderDef, EventEffect, MapNode, Run, Unit } from './types';
import type { Reward } from './run';

export interface TriforceRunState {
  /** Route bosses beaten (and `region:<id>` markers). */
  beaten: string[];
  /** The Shadow Links are beaten: the route is done. */
  done?: boolean;
  /** Lady Maud's Fashion Curse holds over Hytopia (until she is beaten in the Sky Realm). */
  cursed: boolean;
  /** Camp facility actions already taken at this camp. */
  campUsed: string[];
  /** Totem drill at the Hytopian Training Hall (0–3): +1 Command Point each in this campaign's battles. */
  drill: number;
  /** Outfits Madame Couture has tailored (+2 DEF and RES when worn). */
  tailored: string[];
  /** The Drablands Challenge Board modifier taken for the next battle. */
  challenge?: string;
  /** Outfits sewn so far. */
  crafted: number;
}

declare module './types' {
  interface Run {
    /** The Tri Force Heroes campaign state. */
    triforce?: TriforceRunState;
  }
}

export const triforceOf = (run: Run): TriforceRunState => (run.triforce ??= { beaten: [], cursed: true, campUsed: [], drill: 0, tailored: [], crafted: 0 });
const q = (run: Run) => (run.questItems ??= []);
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? QUEST_ITEMS[id]?.name ?? TEMPLATES[id]?.name ?? (id === 'fairyDust' ? 'Fairy Dust' : id);
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id) || u.pack.some((p) => p.id === id));
const avgLevel = (run: Run) => Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));
const inArmy = (run: Run, id: string) => run.roster.some((u) => u.templateId === id);

export const triforceStartRegion = (): string => TF_ROUTE[0];
export const inTriforceRoute = (run: Run) => run.campaign === 'triforce' && TF_ROUTE.includes(run.region) && !triforceOf(run).done;

/** ALBW Link leads this campaign with the Tri Force Heroes (one commander entry, an alternative loadout). */
export function triforceLoadout<C extends CommanderDef>(cmd: C, campaign?: string): C {
  if (campaign !== 'triforce') return cmd;
  const alt = ALT_LOADOUTS.find((a) => a.heroId === cmd.heroId);
  return alt ? { ...cmd, ...alt } : cmd;
}

function recruitOnce(run: Run, id: string, rng: RNG, lines: string[], why: string): boolean {
  if (!TEMPLATES[id] || run.roster.some((u) => u.templateId === id || TEMPLATES[u.templateId ?? '']?.exclusiveWith?.includes(id))) return false;
  const u = makeHero(id, `p${run.uidCounter++}`, avgLevel(run), rng);
  dress(run, u);
  run.roster.push(u);
  run.stats.recruits++;
  lines.push(why);
  return true;
}
/** The campaign's looks: the ALBW Link as the Green Hero, Styla in her cursed bodysuit while the curse holds. */
function dress(run: Run, u: Unit) {
  if (run.campaign !== 'triforce') return;
  const a = TRIFORCE_PREFERRED_ART[u.templateId ?? ''];
  if (a && !u.artPick) u.artPick = a;
  if (u.templateId === 'styla') u.artPick = triforceOf(run).cursed ? CURSED_STYLA_ART : 'styla';
}
function give(run: Run, id: string) {
  if (ITEMS[id]) { if (!run.roster.some((u) => addToPack(u, id))) run.convoy.push(id); return; }
  const w = WEAPONS[id];
  const u = w ? run.roster.find((x) => canWield(x, w) && x.weapons.length < 5) : undefined;
  if (u) u.weapons.push(id); else run.convoy.push(id);
}

/** New campaign. */
export function triforceStart(run: Run, rng: RNG) {
  triforceOf(run);
  void rng;
  for (const u of run.roster) dress(run, u);
}

/** The fixed boss of a route region. */
export function triforceBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'triforce' || node.type !== 'boss') return null;
  const list = (TF_ROUTE_BOSSES[node.world] ?? []).filter((id) => BOSSES[id]);
  if (!list.length) return null;
  const st = triforceOf(run);
  return BOSSES[list.find((x) => !st.beaten.includes(x)) ?? list[0]] ?? null;
}

// ───────────────────────── Materials ─────────────────────────

/** How many of a material the army holds (quest items; Gold Dust in packs and the convoy; the army's Fairy Dust). */
export function matCount(run: Run, id: string): number {
  if (id === 'fairyDust') return armyOf(run).fairyDust;
  if (id === 'goldDust') return run.convoy.filter((x) => x === 'goldDust').length + run.roster.reduce((n, u) => n + u.pack.filter((p) => p.id === 'goldDust').reduce((m, p) => m + p.uses, 0), 0);
  return (run.questItems ?? []).filter((x) => x === id).length;
}
function takeMat(run: Run, id: string, n: number) {
  for (let i = 0; i < n; i++) {
    if (id === 'fairyDust') { armyOf(run).fairyDust = Math.max(0, armyOf(run).fairyDust - 1); continue; }
    if (id === 'goldDust') {
      const c = run.convoy.indexOf('goldDust');
      if (c >= 0) { run.convoy.splice(c, 1); continue; }
      for (const u of run.roster) { const p = u.pack.find((x) => x.id === 'goldDust'); if (p) { p.uses--; if (p.uses <= 0) u.pack.splice(u.pack.indexOf(p), 1); break; } }
      continue;
    }
    const k = q(run).indexOf(id);
    if (k >= 0) q(run).splice(k, 1);
  }
}
export function addMat(run: Run, id: string, n = 1) {
  for (let i = 0; i < n; i++) {
    if (id === 'fairyDust') armyOf(run).fairyDust++;
    else if (id === 'goldDust') give(run, 'goldDust');
    else q(run).push(id);
  }
}
/** Materials from a battle: King Tuft's command (+30%), his Hytopian Authority (one more). */
function gainMats(run: Run, ids: string[], rng: RNG, lines: string[]) {
  const got = [...ids];
  if (run.bonus === 'hytopianCrafting') for (const id of ids) if (rng.chance(30)) got.push(id);
  if (got.length && run.roster.some((u) => u.skills.includes('hytopianAuthority'))) got.push(rng.pick(got));
  for (const id of got) addMat(run, id);
  if (got.length) {
    const tally = new Map<string, number>();
    for (const id of got) tally.set(id, (tally.get(id) ?? 0) + 1);
    lines.push(`Materials: ${[...tally].map(([id, n]) => `${nameOf(id)}${n > 1 ? ` ×${n}` : ''}`).join(', ')}.`);
  }
}

// ───────────────────────── Battle setup ─────────────────────────

const ESCORTS: Record<string, string[]> = {
  margoma: ['miniMargo'], arrghus: ['skullfish'], moldormBoss: ['hokkubokku'], blizzagia: ['freezard'], ladysPets: ['totemArmos'],
  stalchampion: ['stalfos', 'stalfos'], prismantus: ['beamos'], ladyMaudBoss: ['keeleon', 'wizzrobe'],
};
export const CHALLENGES: Record<string, { name: string; text: string }> = {
  restrictedEquipment: { name: 'Restricted Equipment', text: 'No pack items may be used.' },
  limitedTurns: { name: 'Limited Turns', text: 'Win within 8 turns for the reward.' },
  sharedDamage: { name: 'Shared Damage', text: 'Every hit on an ally costs every other ally 2 HP.' },
  mandatoryOutfits: { name: 'Mandatory Outfits', text: 'Units without an outfit fight at −3 STR, MAG, DEF and RES.' },
  reducedDeployment: { name: 'Reduced Deployment', text: 'Only the commander and three others take the field.' },
};

function spawnNear(b: Battle, id: string, near: Unit, level: number, rng: RNG, boss = false): Unit | undefined {
  const a = ENEMIES[id] ?? BOSSES[id];
  if (!a) return undefined;
  const e = makeEnemy(a, b.world, level, `tf${b.uidCounter++}`, rng, { boss });
  if (!boss) e.isBoss = false;
  for (let d = 1; d <= 8; d++) {
    const spot = tilesInRange(b, near, d, d, near.size).find((p) => anchorCost(b, e, p.x, p.y) < INF && footprint(p.x, p.y, e.size).every((f) => !unitAt(b, f.x, f.y)));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y, team: 'enemy', ai: boss ? near.ai : 'aggressive' }); b.units.push(e); return e; }
  }
  return undefined;
}

/** Battle setup: Lady Maud's command, the Totem drill, the Fashion Curse, tailored outfits, the Challenge Board, bosses. */
export function triforceBattleSetup(run: Run, b: Battle, rng: RNG) {
  const player = b.units.filter((u) => u.team === 'player');
  const camp = run.campaign === 'triforce';
  const hasOutfits = player.some((u) => outfitOf(u));
  if (!camp && !hasOutfits && b.bonus !== 'fashionTyranny' && !player.some((u) => TRI_HEROES[u.templateId ?? ''])) return;
  const st = tfState(b);
  if (b.bonus === 'fashionTyranny') st.tyranny = 1;
  const rs = run.triforce;
  for (const u of player) if (rs?.tailored.includes(u.gear.body ?? '') && outfitOf(u)) u.buffs.push({ id: 'tfTailoredOutfit', name: 'Tailored', turns: 99, stats: { def: 2, res: 2 } });
  if (!camp || !rs) return;
  if (rs.drill && b.cp !== undefined) { b.cp += rs.drill; b.cpMax = (b.cpMax ?? 0) + rs.drill; }
  // Lady Maud's Fashion Curse over Hytopia.
  if (rs.cursed) {
    st.curse = true;
    for (const u of player.filter((x) => x.templateId === 'styla')) { u.buffs.push({ id: 'tfStylaCursed', name: 'Cursed bodysuit', turns: 99 }); u.artOverride = CURSED_STYLA_ART; }
  }
  // The Drablands Challenge Board.
  if (rs.challenge) {
    st.challenge = rs.challenge;
    rs.challenge = undefined;
    b.log.push(`Drablands Challenge: ${CHALLENGES[st.challenge]?.name} — ${CHALLENGES[st.challenge]?.text}`);
    if (st.challenge === 'mandatoryOutfits') for (const u of player.filter((x) => !outfitOf(x))) u.buffs.push({ id: 'tfUnderdressed', name: 'Underdressed', turns: 99, stats: { str: -3, mag: -3, def: -3, res: -3 } });
    if (st.challenge === 'reducedDeployment') {
      const keep = [...player].sort((x, y) => Number(!!y.isCommander) - Number(!!x.isCommander)).slice(0, 4);
      const out = player.filter((u) => !keep.includes(u));
      b.units = b.units.filter((u) => !out.includes(u));
      (b.withdrawn ??= []).push(...out);
    }
  }
  if (b.nodeType !== 'boss') return;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!main) return;
  const id = main.bossId ?? '';
  // The Woodlands' boss is the campaign's first: it fights below the doc's full strength.
  if (TF_ROUTE.indexOf(b.world) === 0) { for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res'] as const) main.stats[k] = Math.round(main.stats[k] * 0.72); main.stats.hp = main.hp = Math.round(main.stats.hp * 0.7); }
  for (const e of ESCORTS[id] ?? []) spawnNear(b, e, main, Math.max(1, main.level - 1), rng);
  const copies = BOSS_COPIES[b.world] ?? 0;
  for (let i = 0; i < copies; i++) {
    const e = spawnNear(b, id, main, main.level, rng, true);
    if (!e) continue;
    for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res'] as const) e.stats[k] = Math.round(e.stats[k] * 0.85);
    e.stats.hp = e.hp = Math.round(e.stats.hp * 0.8);
    e.name = `${e.name} ${['II', 'III', 'IV'][i]}`;
    st.allBosses = true;
  }
}

// ───────────────────────── After a battle ─────────────────────────

export function triforceAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const tf = b.tf;
  if (!tf && run.campaign !== 'triforce') return lines;
  if (!won) return lines;
  const camp = run.campaign === 'triforce' || TF_ROUTE.includes(b.world);
  const mats = [...(tf?.found ?? [])];
  if (camp) {
    const reg = REGION_MATERIAL[b.world];
    if (reg) mats.push(rng.pick(reg));
    if (b.nodeType === 'elite') mats.push('rareMetal');
    if (b.nodeType === 'boss') mats.push(rng.pick(RARE_MATERIALS));
    if ((tf?.coop ?? 0) >= 3) mats.push('friendlyToken');
    if (rng.chance(10)) mats.push('fabledButterfly');
  }
  if (camp || mats.length) gainMats(run, mats, rng, lines);
  if (tf?.rupees) { run.rupees += tf.rupees; lines.push(`The Rupee Regalia: ₹${tf.rupees} more.`); }
  // The Drablands Challenge Board's reward.
  if (tf?.challenge) {
    if (tf.challenge === 'limitedTurns' && b.turn > 8) lines.push('The Challenge took too long: no reward.');
    else {
      const prize = [rng.pick(RARE_MATERIALS), rng.pick(RARE_MATERIALS)];
      if (rng.chance(20)) prize.push('fairyDust');
      for (const id of prize) addMat(run, id);
      run.rupees += 100;
      lines.push(`Drablands Challenge cleared: ${prize.map(nameOf).join(', ')} and ₹100.`);
    }
  }
  if (run.roster.some((u) => u.skills.includes('hytopianAuthority'))) adjustMorale(run, 2);
  if (run.campaign === 'triforce') lines.push(...routeRewards(run, b, rng));
  return lines;
}

/** The next of the three heroes the army is missing. */
const missingHero = (run: Run) => ['blueHero', 'redHero', 'linkALBW'].find((id) => !inArmy(run, id));

function routeRewards(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  if (b.nodeType !== 'boss') return lines;
  const st = triforceOf(run);
  const region = b.world;
  const list = TF_ROUTE_BOSSES[region] ?? [];
  for (const u of b.fallen) if (u.team === 'enemy' && u.isBoss && list.includes(u.bossId ?? '') && !st.beaten.includes(u.bossId!)) st.beaten.push(u.bossId!);
  const key = `region:${region}`;
  if (st.beaten.includes(key)) return lines;
  st.beaten.push(key);
  const giveOnce = (id: string, why: string) => { if (!owns(run, id)) { give(run, id); lines.push(why); } };
  const hero = (why: string) => { const id = missingHero(run); if (id) recruitOnce(run, id, rng, lines, `${TEMPLATES[id].name} answers King Tuft's posters: ${why}`); };
  switch (region) {
    case 'woodlandsTF':
      recruitOnce(run, 'madameCouture', rng, lines, 'Madame Couture opens her Boutique to the army: "Bring me materials, darlings, and I will make you beautiful."');
      giveOnce('doppelDoll', 'A Doppel Doll, from the Woodlands\' last chest.');
      break;
    case 'riversideTF':
      recruitOnce(run, 'kingTuft', rng, lines, 'King Tuft waddles out to meet you, weeping with joy: "Heroes! Real heroes!" He joins.');
      giveOnce('waterRod', 'The Water Rod, from the bottom of the river.');
      break;
    case 'volcanoTF': giveOnce('gripshot', 'The Gripshot, half-melted but working.'); hero('"Sorry I\'m late. Was the volcano always this hot?"'); break;
    case 'iceCavernTF': hero('"Is it just me, or is it freezing?"'); break;
    case 'fortressTF': recruitOnce(run, 'styla', rng, lines, st.cursed ? 'Princess Styla is rescued from the Fortress — still in Lady Maud\'s brown bodysuit. "Don\'t look at me!"' : 'Princess Styla is rescued from the Fortress.'); break;
    case 'dunesTF': hero('"There you are! Three is the right number."'); addMat(run, 'goldDust'); lines.push('Gold Dust glitters in the sand.'); break;
    case 'ruinsTF': {
      const o = rng.pick(OUTFITS.filter((x) => !owns(run, x.id)).map((x) => x.id).concat(['triSuit']));
      give(run, o); lines.push(`An outfit in the Ruins' treasury: the ${nameOf(o)}.`);
      break;
    }
    case 'skyRealmTF':
      st.cursed = false;
      for (const u of run.roster.filter((x) => x.templateId === 'styla')) u.artPick = 'styla';
      lines.push('Lady Maud is beaten. The Fashion Curse lifts: Princess Styla\'s dress is back, and Hytopia can dress again.');
      recruitOnce(run, 'ladyMaud', rng, lines, 'Lady Maud folds her parasol. "Fine. FINE. My sister always did have the better boutique." She joins.');
      addMat(run, 'fairyDust');
      break;
    case 'denOfTrialsTF':
      st.done = true;
      recruitOnce(run, 'shadowLink', rng, lines, 'The last of the Shadow Links stops fighting and simply… follows you.');
      lines.push('The Den of Trials is cleared. The heroes of Hytopia are legends.');
      break;
  }
  return lines.filter(Boolean);
}

/** Region choices after a boss: the next region on the route. Empty: the ordinary choice of regions. */
export function triforceRegionOptions(run: Run, rng: RNG): string[] {
  const st = triforceOf(run);
  const i = TF_ROUTE.indexOf(run.region);
  if (i < 0) return [];
  if (st.done || i === TF_ROUTE.length - 1) return rng.shuffle(TF_ROUTE.filter((x) => x !== run.region)).slice(0, 3);
  return [TF_ROUTE[i + 1]];
}

// ───────────────────────── Events and treasure ─────────────────────────

export function applyTriforceEffect(run: Run, e: Extract<EventEffect, { kind: 'triforce' }>, rng: RNG): string | null {
  const st = triforceOf(run);
  switch (e.op) {
    case 'material': {
      const pool = REGION_MATERIAL[run.region] ?? MATERIALS.filter((m) => !RARE_MATERIALS.includes(m) && m !== 'fairyDust');
      const got: string[] = [];
      for (let i = 0; i < (e.amount ?? 1); i++) { const id = e.id ?? rng.pick([...pool, 'monsterGutsTF', 'fluffyFuzz']); addMat(run, id); got.push(id); }
      return `Materials: ${got.map(nameOf).join(', ')}.`;
    }
    case 'rare': { const id = rng.pick(RARE_MATERIALS); addMat(run, id); return `A rare material: ${nameOf(id)}!`; }
    case 'drill': if (st.drill >= 3) return 'You already know every Totem drill.'; st.drill++; return `Totem drill ${st.drill}/3: +1 Command Point in this campaign's battles.`;
    case 'fashionShow': {
      const n = run.roster.filter((u) => GEAR[u.gear.body ?? '']?.tf?.includes('outfit')).length;
      run.rupees += 40 * n;
      const s = (run.supports ??= {});
      for (let i = 0; i < run.roster.length; i++) for (let j = i + 1; j < run.roster.length; j++) { const k = [run.roster[i].uid, run.roster[j].uid].sort().join('|'); s[k] = (s[k] ?? 0) + 1; }
      return n ? `${n} outfit${n > 1 ? 's' : ''} on show: ₹${40 * n} in tips.` : 'Nobody is wearing an outfit. The crowd is polite about it.';
    }
  }
  return null;
}

/** Treasure nodes: outfits, materials and Doppel Dolls in the Drablands' chests. */
export function triforceTreasure(run: Run, rng: RNG, ev: { rewards: Reward[]; rupees: number }): string[] {
  if (run.campaign !== 'triforce') return [];
  const lines: string[] = [];
  if (rng.chance(30)) ev.rewards.unshift({ kind: 'gear', id: rng.pick(OUTFITS.filter((o) => o.rarity === 'rare' || o.rarity === 'uncommon').map((o) => o.id)) });
  if (rng.chance(25)) ev.rewards.unshift({ kind: 'item', id: 'doppelDoll' });
  if (rng.chance(60)) { const id = rng.pick(REGION_MATERIAL[run.region] ?? ['monsterGutsTF']); addMat(run, id); lines.push(`${nameOf(id)} is tucked in the chest.`); }
  return lines;
}

// ───────────────────────── Camp facilities (section 8) ─────────────────────────

export interface TriforceCampOption {
  key: string;
  facility: string;
  label: string;
  desc: string;
  ok: boolean;
  pick?: (u: Unit) => boolean;
  select?: { id: string; label: string }[];
}

export const TF_FACILITIES: Record<string, { name: string; icon: string; where: ('camp' | 'shop' | 'smith')[] }> = {
  boutique: { name: "Madame Couture's Boutique", icon: '👗', where: ['camp', 'shop'] },
  hall: { name: 'Hytopian Training Hall', icon: '🗼', where: ['camp'] },
  board: { name: 'Drablands Challenge Board', icon: '📋', where: ['camp'] },
};

/** A recipe's cost for this army (Hytopian Fashion: 25% fewer Rupees and materials). */
export function recipeCost(run: Run, id: string): { rupees: number; mats: [string, number][] } {
  const r = RECIPES[id];
  const fashion = ['styla', 'kingTuft', 'madameCouture'].every((t) => inArmy(run, t));
  const m = fashion ? 0.75 : 1;
  return { rupees: Math.round((r?.rupees ?? 0) * m / 10) * 10, mats: Object.entries(r?.mats ?? {}).map(([k, n]) => [k, Math.max(1, Math.ceil(n * m))] as [string, number]) };
}
export const canCraft = (run: Run, id: string) => { const c = recipeCost(run, id); return !!RECIPES[id] && run.rupees >= c.rupees && c.mats.every(([k, n]) => matCount(run, k) >= n); };
const TAILOR_COST = 200;

export function triforceCampOptions(run: Run, where: 'camp' | 'shop' | 'smith'): TriforceCampOption[] {
  if (run.campaign !== 'triforce') return [];
  const st = triforceOf(run);
  const out: TriforceCampOption[] = [];
  const add = (facility: string, o: Omit<TriforceCampOption, 'facility'>) => { if (TF_FACILITIES[facility].where.includes(where)) out.push({ facility, ...o }); };
  const used = (k: string) => st.campUsed.includes(k);
  // ── Madame Couture's Boutique ──
  const recipes = Object.keys(RECIPES).filter((id) => GEAR[id]);
  const craftable = recipes.filter((id) => canCraft(run, id));
  add('boutique', { key: 'craft', label: `Sew an outfit (${craftable.length} ready)`, desc: 'Madame Couture combines materials and Rupees into an outfit (body slot).', ok: craftable.length > 0,
    select: [...craftable, ...recipes.filter((id) => !craftable.includes(id))].map((id) => {
      const c = recipeCost(run, id);
      return { id, label: `${canCraft(run, id) ? '✔' : '✗'} ${nameOf(id)} — ₹${c.rupees} + ${c.mats.map(([k, n]) => `${nameOf(k)}${n > 1 ? ` ×${n}` : ''} (${matCount(run, k)})`).join(', ')}` };
    }) });
  const worn = OUTFITS.filter((o) => owns(run, o.id) && !st.tailored.includes(o.id));
  add('boutique', { key: 'tailor', label: `Tailor an outfit — ₹${TAILOR_COST} + Silver Thread (${matCount(run, 'silverThread')})`, desc: 'Upgrades an outfit you own: +2 DEF and RES whenever it is worn.',
    ok: worn.length > 0 && run.rupees >= TAILOR_COST && matCount(run, 'silverThread') > 0, select: worn.map((o) => ({ id: o.id, label: o.name })) });
  // ── Hytopian Training Hall ──
  const drillCost = 150 * (st.drill + 1);
  add('hall', { key: 'drill', label: `Totem drill (${st.drill}/3) — ₹${drillCost}`, desc: 'Practise stacking and the cooperative techniques: +1 Command Point in every battle of this campaign.', ok: st.drill < 3 && run.rupees >= drillCost && !used('drill') });
  add('hall', { key: 'spar', label: 'Cooperative sparring — ₹60', desc: 'Everyone in the army gains 15 XP and support points.', ok: run.rupees >= 60 && !used('spar') });
  // ── Drablands Challenge Board ──
  add('board', { key: 'challenge', label: st.challenge ? `Challenge taken: ${CHALLENGES[st.challenge].name}` : 'Take a Drablands Challenge for the next battle', desc: 'An optional restriction on the next battle; win it for two rare materials and ₹100.',
    ok: !st.challenge, select: Object.entries(CHALLENGES).map(([id, c]) => ({ id, label: `${c.name}: ${c.text}` })) });
  return out;
}

export function doTriforceCamp(run: Run, key: string, rng: RNG, uid?: string, arg?: string): string | null {
  const st = triforceOf(run);
  const opt = triforceCampOptions(run, 'camp').concat(triforceCampOptions(run, 'shop')).find((o) => o.key === key);
  if (!opt || !opt.ok) return null;
  void uid;
  const done = () => { if (!st.campUsed.includes(key)) st.campUsed.push(key); };
  switch (key) {
    case 'craft': {
      const id = arg && RECIPES[arg] ? arg : undefined;
      if (!id || !canCraft(run, id)) return null;
      const c = recipeCost(run, id);
      run.rupees -= c.rupees;
      for (const [k, n] of c.mats) takeMat(run, k, n);
      run.convoy.push(id);
      st.crafted++;
      return `Madame Couture sews the ${nameOf(id)}. "Magnificent, darling!" (in the convoy)`;
    }
    case 'tailor': {
      const id = arg && GEAR[arg] && owns(run, arg) ? arg : undefined;
      if (!id || st.tailored.includes(id)) return null;
      run.rupees -= TAILOR_COST; takeMat(run, 'silverThread', 1);
      st.tailored.push(id);
      return `The ${nameOf(id)} is tailored to perfection: +2 DEF and RES when worn.`;
    }
    case 'drill': run.rupees -= 150 * (st.drill + 1); st.drill++; done(); return `Totem drill ${st.drill}/3: +1 Command Point in every battle.`;
    case 'spar': {
      run.rupees -= 60; done();
      for (const u of run.roster) u.xp += 15;
      const s = (run.supports ??= {});
      for (let i = 0; i < run.roster.length; i++) for (let j = i + 1; j < run.roster.length; j++) { const k = [run.roster[i].uid, run.roster[j].uid].sort().join('|'); s[k] = (s[k] ?? 0) + 2; }
      void rng;
      return 'The army practises Totems until nobody falls off. Everyone gains experience.';
    }
    case 'challenge': {
      const id = arg && CHALLENGES[arg] ? arg : undefined;
      if (!id) return null;
      st.challenge = id;
      return `Challenge accepted: ${CHALLENGES[id].name}. ${CHALLENGES[id].text}`;
    }
  }
  return null;
}

/** New camp: facility uses reset. */
export function triforceCampVisit(run: Run) {
  if (run.triforce) run.triforce.campUsed = [];
}

/** Top-bar summary of the campaign. */
export function triforceStatus(run: Run): { line: string; mats: number; outfits: number; cursed: boolean; drill: number; challenge?: string; heroes: number } {
  const st = triforceOf(run);
  const i = TF_ROUTE.indexOf(run.region);
  return {
    line: i >= 0 ? `Drablands ${i + 1}/${TF_ROUTE.length}` : 'Hytopia',
    mats: MATERIALS.reduce((n, id) => n + matCount(run, id), 0),
    outfits: OUTFITS.filter((o) => owns(run, o.id)).length,
    cursed: st.cursed, drill: st.drill, challenge: st.challenge ? CHALLENGES[st.challenge].name : undefined,
    heroes: Object.keys(TRI_HEROES).filter((id) => inArmy(run, id)).length,
  };
}
