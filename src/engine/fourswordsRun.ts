// The Four Swords & Four Swords Adventures campaign: the twelve regions of section 11 in order (Four Swords, then
// Four Swords Adventures, with the bosses the doc places and the finale of Vaati and then Ganon), the Links joining,
// the Shrine Maidens freed, Royal Jewels, Force Power carried into battle, Level 2 tools and the camp facilities
// (Four Sword Sanctuary, Force Shrine, Shrine Maiden Sanctuary, Great Fairy Workshop).

import { BOSSES, CLASSES, ENEMIES, GEAR, ITEMS, QUEST_ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import { BIG_RETURNING, FINALE_REGION, FOUR_LINKS, FS_ESCORTS, FS_GBA, FS_ROUTE, FS_ROUTE_BOSSES, LEVEL2, MAIDENS, PAIRED_FS_REGIONS, RETURNING_BOSS_ABILITIES } from '../content/fourswords';
import { anchorCost, footprint, tilesInRange, unitAt } from './grid';
import { fsActive, fsGainForce, fsState } from './fourswords';
import type { RNG } from './rng';
import { INF } from './rules';
import { addStatus } from './status';
import { addToPack, makeEnemy, makeHero, moveTypeOf } from './units';
import type { Battle, BossDef, EventEffect, MapNode, Run, Unit } from './types';
import type { Reward } from './run';

export interface FourSwordsRunState {
  /** Route bosses beaten (and `region:<id>` markers). */
  beaten: string[];
  /** Ganon is beaten: the route is done. */
  done?: boolean;
  /** Camp facility actions already taken at this camp. */
  campUsed: string[];
  /** Force Shrine level (0–3): +10% Force collection and +100 starting Force Power each. */
  shrine: number;
  /** Formation drill (0–3): +1 Command Point each in battles with two Links or more. */
  drill: number;
  /** Force Power carried into the next battle (the owl, Tingle). */
  pending: number;
}

declare module './types' {
  interface Run {
    /** The Four Swords campaign state. */
    fourswords?: FourSwordsRunState;
  }
}

export const fourswordsOf = (run: Run): FourSwordsRunState => (run.fourswords ??= { beaten: [], campUsed: [], shrine: 0, drill: 0, pending: 0 });
const q = (run: Run) => (run.questItems ??= []);
const count = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const take = (run: Run, id: string, n = 1) => { for (let i = 0; i < n; i++) { const k = q(run).indexOf(id); if (k < 0) return false; q(run).splice(k, 1); } return true; };
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id) || u.pack.some((p) => p.id === id));
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? QUEST_ITEMS[id]?.name ?? TEMPLATES[id]?.name ?? id;
const avgLevel = (run: Run) => Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));
const inArmy = (run: Run, id: string) => run.roster.some((u) => u.templateId === id);

export const fourswordsStartRegion = (): string => FS_ROUTE[0];
export const inFourSwordsRoute = (run: Run) => run.campaign === 'fourswords' && FS_ROUTE.includes(run.region) && !fourswordsOf(run).done;

function recruitOnce(run: Run, id: string, rng: RNG, lines: string[], why: string): boolean {
  if (!TEMPLATES[id] || run.roster.some((u) => u.templateId === id || TEMPLATES[u.templateId ?? '']?.exclusiveWith?.includes(id))) return false;
  run.roster.push(makeHero(id, `p${run.uidCounter++}`, avgLevel(run), rng));
  run.stats.recruits++;
  lines.push(why);
  return true;
}

/** New campaign. */
export function fourswordsStart(run: Run, rng: RNG) {
  fourswordsOf(run);
  void rng;
}

/** The "Big" returning bosses: an ordinary monster entry scaled up into a boss (the same unit, its own art). */
export function bigReturningBoss(id: string, region: string): BossDef | null {
  const e = ENEMIES[id];
  const info = BIG_RETURNING[id];
  if (!e || !info) return null;
  const cls = CLASSES[e.classId];
  const base = { ...cls.base, ...(e.stats ?? {}) };
  const stats = { ...base, hp: Math.round(base.hp * 2.4) + 10, str: base.str + 5, def: base.def + 4, res: base.res + 3, skl: base.skl + 3, spd: base.spd + 1, mp: Math.max(base.mp, 20), sta: Math.max(base.sta, 30) };
  return {
    id, name: info.name, title: info.title, home: region, race: e.race, classId: e.classId, size: Math.max(2, e.size ?? 1), weapons: [...e.weapons], skill: e.skill,
    glyph: e.glyph ?? info.name.slice(0, 2).toUpperCase(), stats, quote: info.quote, abilities: [...(RETURNING_BOSS_ABILITIES[id] ?? [])], drops: [],
  };
}

/** The fixed boss of a route region: the first of its bosses not yet beaten. */
export function fourswordsBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'fourswords' || node.type !== 'boss') return null;
  const list = FS_ROUTE_BOSSES[node.world] ?? [];
  if (!list.length) return null;
  const st = fourswordsOf(run);
  const id = list.find((x) => !st.beaten.includes(x)) ?? list[0];
  return BOSSES[id] ?? bigReturningBoss(id, node.world);
}

function spawnNear(b: Battle, id: string, near: Unit, level: number, rng: RNG, boss = false): Unit | undefined {
  const a = ENEMIES[id] ?? BOSSES[id];
  if (!a) return undefined;
  const e = makeEnemy(a, b.world, level, `fs${b.uidCounter++}`, rng, { boss });
  if (!boss) e.isBoss = false;
  for (let d = 1; d <= 8; d++) {
    const spot = tilesInRange(b, near, d, d, near.size).find((p) => anchorCost(b, e, p.x, p.y) < INF && footprint(p.x, p.y, e.size).every((f) => !unitAt(b, f.x, f.y)));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y, team: 'enemy', ai: boss ? near.ai : 'aggressive' }); b.units.push(e); return e; }
  }
  return undefined;
}

/** Battle setup: Force Power carried in, the Links' Command Points, commander bonuses, the route bosses' retinues. */
export function fourswordsBattleSetup(run: Run, b: Battle, rng: RNG) {
  const player = b.units.filter((u) => u.team === 'player');
  const links = player.filter((u) => FOUR_LINKS.includes(u.templateId ?? ''));
  const fsCamp = run.campaign === 'fourswords';
  if (!fsCamp && !links.length) return;
  const st = fourswordsOf(run);
  // Command Points for formations: the Sanctuary's attunement and the formation drill.
  if (links.length >= 2 && b.cp !== undefined) { const n = 2 + st.drill; b.cp += n; b.cpMax = (b.cpMax ?? 0) + n; }
  if (fsActive(b)) {
    const fs = fsState(b);
    fs.collect = 1 + 0.1 * st.shrine;
    const start = st.shrine * 100 + st.pending;
    st.pending = 0;
    if (start) fsGainForce(b, start, 'Force Power carried into battle', true);
  }
  // Commander bonuses that need the battle's bonus to be set.
  if (b.bonus === 'scoutsCourage') for (const u of player) if (moveTypeOf(u) === 'foot') u.buffs.push({ id: 'scoutsCourage', name: 'Scout\'s Courage', turns: 99, stats: { mov: 1 } });
  if (b.bonus === 'shadowCommand') for (const u of player) addStatus(u, 'veiled', 1);
  if (b.bonus === 'sanctuaryLight') b.healMult *= 1.25;
  if (b.groupSupports?.includes('sacredFellowship')) b.healMult *= 1.15;
  if (!fsCamp || b.nodeType !== 'boss') return;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!main) return;
  const id = main.bossId ?? '';
  // Returning bosses fight with their encounter-specific abilities.
  for (const a of RETURNING_BOSS_ABILITIES[id] ?? []) if (!main.abilities.includes(a)) main.abilities.push(a);
  for (const e of FS_ESCORTS[id] ?? []) spawnNear(b, e, main, Math.max(1, main.level - 1), rng);
  const fs = fsState(b);
  if (b.world === FINALE_REGION && id === 'vaatiWindMage') fs.finale = true;
  if (PAIRED_FS_REGIONS.includes(b.world)) {
    for (const other of (FS_ROUTE_BOSSES[b.world] ?? []).filter((x) => x !== id)) {
      const e = spawnNear(b, other, main, main.level, rng, true);
      if (!e) continue;
      if ((b.bossTier ?? 0) === 0) { for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res'] as const) e.stats[k] = Math.round(e.stats[k] * 0.8); e.stats.hp = e.hp = Math.round(e.stats.hp * 0.85); }
      fs.allBosses = true;
    }
  }
}

// ───────────────────────── After a battle ─────────────────────────

export function fourswordsAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const fs = b.fs;
  if (fs?.found.length && won) {
    for (const id of fs.found) q(run).push(id);
    lines.push(`Found: ${fs.found.map(nameOf).join(', ')}.`);
  }
  if (fs && (fs.force > 0 || fs.reached.length)) lines.push(`Force Power: ${fs.force}${fs.reached.length ? ` (${fs.reached.length} threshold${fs.reached.length > 1 ? 's' : ''} reached)` : ''}.`);
  if (!won) return lines;
  // Gems left over become Rupees (a tenth of the Force Power).
  if (fs && fs.force >= 10 && run.campaign === 'fourswords') { const r = Math.floor(fs.force / 10); run.rupees += r; lines.push(`The leftover Force Gems are worth ₹${r}.`); }
  if (run.campaign === 'fourswords' || FS_ROUTE.includes(b.world)) lines.push(...routeRewards(run, b, rng));
  return lines;
}

/** The next Link the army is missing. */
const missingLink = (run: Run) => FOUR_LINKS.find((id) => !inArmy(run, id));

function routeRewards(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  if (b.nodeType !== 'boss' || run.campaign !== 'fourswords') return lines;
  const st = fourswordsOf(run);
  const region = b.world;
  const list = FS_ROUTE_BOSSES[region] ?? [];
  for (const u of b.fallen) if (u.team === 'enemy' && u.isBoss && list.includes(u.bossId ?? '') && !st.beaten.includes(u.bossId!)) st.beaten.push(u.bossId!);
  const key = `region:${region}`;
  if (st.beaten.includes(key)) return lines;
  st.beaten.push(key);
  const give = (id: string, why: string) => {
    if (owns(run, id)) return;
    if (ITEMS[id]) { const u = run.roster.find((x) => addToPack(x, id)); if (!u) run.convoy.push(id); } else run.convoy.push(id);
    lines.push(why);
  };
  const link = (why: string) => { const id = missingLink(run); if (id) recruitOnce(run, id, rng, lines, `${TEMPLATES[id].name} steps out of the Four Sword's light: ${why}`); };
  if (run.roster.some((u) => Object.values(u.gear).includes('herosKey'))) { run.rupees += 250; run.convoy.push(rng.pick(['bombL2', 'forceFairy', 'redPotion'])); lines.push("The Hero's Key opens the trial's last chest: ₹250 and a treasure."); }
  if (!FS_GBA.includes(region)) q(run).push('royalJewel');
  switch (region) {
    case 'seaOfTrees': link('"About time you split up."'); give('magneticGloves', 'The Magnetic Gloves, from a Great Fairy in the Sea of Trees.'); break;
    case 'talusCave': link('the fourth of you shivers in the cold.'); give('rocsFeather', "Roc's Feather, frozen in a block of ice."); break;
    case 'deathMountainFS': link('there should always be four.'); give('gnatHat', 'The Gnat Hat, left in a crack in the crater wall.'); break;
    case 'vaatisPalace': {
      const holder = run.roster.find((u) => u.templateId === 'greenLink') ?? run.roster.find((u) => FOUR_LINKS.includes(u.templateId ?? ''));
      if (!owns(run, 'fourSword')) { if (holder) holder.weapons.unshift('fourSword'); else run.convoy.push('fourSword'); lines.push(`The Four Sword answers its hero${holder ? `: ${holder.name} carries it now` : ''}.`); }
      recruitOnce(run, 'zeldaFS', rng, lines, 'Princess Zelda is free. "You came — all four of you."');
      break;
    }
    case 'whereaboutsOfTheWind': recruitOnce(run, 'greenMaiden', rng, lines, 'The Green Maiden steps out of her crystal in the castle.'); break;
    case 'easternHyrule': recruitOnce(run, 'blueMaiden', rng, lines, 'The Blue Maiden is freed from the Eastern Temple.'); give('pegasusBoots', 'Pegasus Boots, from the Village of the Blue Maiden.'); break;
    case 'deathMountainFSA': recruitOnce(run, 'redMaiden', rng, lines, 'The Red Maiden leaves the Tower of Flames, glowing.'); break;
    case 'nearTheFields': recruitOnce(run, 'hyruleCaptain', rng, lines, 'A Hyrule captain shakes off Ganon\'s spell and salutes.'); break;
    case 'darkWorldFSA': recruitOnce(run, 'purpleMaiden', rng, lines, 'The Purple Maiden walks out of the Temple of Darkness.'); give('fsLamp', 'A Lamp, from Kakariko Village.'); break;
    case 'desertOfDoubt': recruitOnce(run, 'yellowMaiden', rng, lines, 'The Yellow Maiden is freed from the Desert Temple.'); break;
    case 'frozenHyrule': recruitOnce(run, 'whiteMaiden', rng, lines, 'The White Maiden thaws out of the Ice Temple\'s crystal.'); break;
    case 'realmOfTheHeavens':
      st.done = true;
      lines.push('Vaati is sealed in the Four Sword again, and Ganon with him. The sky over Hyrule clears.');
      break;
  }
  return lines;
}

/** Region choices after a boss: the next region on the route. Empty: the ordinary choice of regions. */
export function fourswordsRegionOptions(run: Run, rng: RNG): string[] {
  const st = fourswordsOf(run);
  const i = FS_ROUTE.indexOf(run.region);
  if (i < 0) return [];
  if (st.done || i === FS_ROUTE.length - 1) return rng.shuffle(FS_ROUTE.filter((x) => x !== run.region)).slice(0, 3);
  return [FS_ROUTE[i + 1]];
}

// ───────────────────────── Level 2 tools, events, treasure ─────────────────────────

/** Upgradable tools the army holds (equipped, in packs or in the convoy). */
export function upgradableTools(run: Run): { id: string; uid?: string }[] {
  const out: { id: string; uid?: string }[] = [];
  for (const u of run.roster) {
    for (const w of u.weapons) if (LEVEL2[w]) out.push({ id: w, uid: u.uid });
    for (const g of Object.values(u.gear)) if (g && LEVEL2[g]) out.push({ id: g, uid: u.uid });
    for (const p of u.pack) if (LEVEL2[p.id]) out.push({ id: p.id, uid: u.uid });
  }
  for (const c of run.convoy) if (LEVEL2[c]) out.push({ id: c });
  return out;
}
/** Swap one tool for its Level 2 version, wherever it is. */
export function upgradeTool(run: Run, id: string, uid?: string): string | null {
  const to = LEVEL2[id];
  if (!to) return null;
  const u = uid ? run.roster.find((x) => x.uid === uid) : undefined;
  if (u) {
    const wi = u.weapons.indexOf(id);
    if (wi >= 0) { u.weapons[wi] = to; if (u.wear) delete u.wear[id]; }
    else {
      const slot = (Object.keys(u.gear) as (keyof typeof u.gear)[]).find((k) => u.gear[k] === id);
      if (slot) u.gear[slot] = to;
      else { const p = u.pack.find((x) => x.id === id); if (!p) return null; p.id = to; }
    }
    return `${u.name}'s ${nameOf(id)} becomes ${nameOf(to)}.`;
  }
  const ci = run.convoy.indexOf(id);
  if (ci < 0) return null;
  run.convoy[ci] = to;
  return `The ${nameOf(id)} becomes ${nameOf(to)}.`;
}

export function applyFourSwordsEffect(run: Run, e: Extract<EventEffect, { kind: 'fourswords' }>, rng: RNG): string | null {
  const st = fourswordsOf(run);
  switch (e.op) {
    case 'upgrade': {
      const tools = upgradableTools(run);
      if (!tools.length) { run.convoy.push('bombL2'); return 'You have nothing to upgrade, so she gives you Level 2 Bombs instead.'; }
      const t = rng.pick(tools);
      return upgradeTool(run, t.id, t.uid);
    }
    case 'force': st.pending += e.amount ?? 200; return `+${e.amount ?? 200} Force Power at the start of the next battle.`;
    case 'drill': if (st.drill >= 3) return 'The Links already know every drill.'; st.drill++; return `Formation drill ${st.drill}/3: +1 Command Point in battles with two Links or more.`;
    case 'links': {
      const lines: string[] = [];
      for (let i = 0; i < 3; i++) { const id = missingLink(run); if (!id || !recruitOnce(run, id, rng, lines, `${TEMPLATES[id].name} joins.`)) break; }
      return lines.join(' ') || 'There are already four of you.';
    }
    case 'maiden': {
      const id = MAIDENS.find((m) => !inArmy(run, m));
      const lines: string[] = [];
      if (!id || !recruitOnce(run, id, rng, lines, `The ${TEMPLATES[id].name} joins the army.`)) return 'Every Shrine Maiden is already with you.';
      return lines.join(' ');
    }
  }
  return null;
}

/** Treasure nodes: Level 2 tools and Royal Jewels in the chests. */
export function fourswordsTreasure(run: Run, rng: RNG, ev: { rewards: Reward[]; rupees: number }): string[] {
  if (run.campaign !== 'fourswords') return [];
  const lines: string[] = [];
  if (rng.chance(30)) ev.rewards.unshift({ kind: 'item', id: rng.pick(['bombL2', 'forceFairy', 'fsLamp']) });
  if (rng.chance(20)) ev.rewards.unshift({ kind: 'gear', id: rng.pick(['greenHerosTunic', 'redHerosTunic', 'blueHerosTunic', 'purpleHerosTunic', 'herosMedal']) });
  if (rng.chance(25)) { fourswordsOf(run).pending += 150; lines.push('A pouch of Force Gems: +150 Force Power at the start of the next battle.'); }
  return lines;
}

// ───────────────────────── Camp facilities (section 11) ─────────────────────────

export interface FourSwordsCampOption {
  key: string;
  facility: string;
  label: string;
  desc: string;
  ok: boolean;
  pick?: (u: Unit) => boolean;
  select?: { id: string; label: string }[];
}

export const FS_FACILITIES: Record<string, { name: string; icon: string; where: ('camp' | 'shop' | 'smith')[] }> = {
  sanctuary: { name: 'Four Sword Sanctuary', icon: '🗡', where: ['camp'] },
  shrine: { name: 'Force Shrine', icon: '💎', where: ['camp'] },
  maidens: { name: 'Shrine Maiden Sanctuary', icon: '🕯', where: ['camp', 'shop'] },
  workshop: { name: 'Great Fairy Workshop', icon: '🧚', where: ['camp', 'smith'] },
};
const UPGRADE_COST = 300;

export function fourswordsCampOptions(run: Run, where: 'camp' | 'shop' | 'smith'): FourSwordsCampOption[] {
  if (run.campaign !== 'fourswords') return [];
  const st = fourswordsOf(run);
  const out: FourSwordsCampOption[] = [];
  const add = (facility: string, o: Omit<FourSwordsCampOption, 'facility'>) => { if (FS_FACILITIES[facility].where.includes(where)) out.push({ facility, ...o }); };
  const used = (k: string) => st.campUsed.includes(k);
  // ── Four Sword Sanctuary ──
  const missing = missingLink(run);
  add('sanctuary', { key: 'callLink', label: `Draw the Four Sword: call ${missing ? TEMPLATES[missing].name : 'a Link'} — ₹300`, desc: 'A missing Link steps out of the sword\'s light.', ok: !!missing && run.rupees >= 300 && !used('callLink') });
  add('sanctuary', { key: 'drill', label: `Formation drill (${st.drill}/3) — ₹200`, desc: 'The princess drills the Links in Box, Line, Column and Cross: +1 Command Point in every battle with two Links or more.', ok: st.drill < 3 && run.rupees >= 200 && !used('drill') });
  // ── Force Shrine ──
  const shrineCost = 250 * (st.shrine + 1);
  add('shrine', { key: 'shrine', label: `Strengthen the Force Shrine (${st.shrine}/3) — ₹${shrineCost}`, desc: 'Better Force Power collection (+10%) and retention (+100 Force Power at the start of every battle).', ok: st.shrine < 3 && run.rupees >= shrineCost });
  // ── Shrine Maiden Sanctuary ──
  add('maidens', { key: 'heal', label: 'Magical healing — ₹80', desc: 'The Maidens heal the whole army to full.', ok: run.rupees >= 80 && run.roster.some((u) => u.hp < u.stats.hp) });
  const maiden = MAIDENS.find((m) => !inArmy(run, m));
  add('maidens', { key: 'freeMaiden', label: `Free a Shrine Maiden from her crystal (${count(run, 'maidenCrystal')} crystal${count(run, 'maidenCrystal') === 1 ? '' : 's'})`, desc: 'A Shrine Maiden Crystal becomes a Maiden.', ok: !!maiden && count(run, 'maidenCrystal') > 0 });
  add('maidens', { key: 'recruitMaiden', label: `Ask ${maiden ? `the ${TEMPLATES[maiden].name}` : 'a Maiden'} to join — ₹400`, desc: 'A Shrine Maiden leaves the sanctuary with you.', ok: !!maiden && run.rupees >= 400 && !used('recruitMaiden') });
  // ── Great Fairy Workshop ──
  const tools = upgradableTools(run);
  add('workshop', { key: 'upgrade', label: `Level 2 upgrade — ₹${UPGRADE_COST}`, desc: 'Fire Rod, Bow, Boomerang, Slingshot, Hammer, Bombs, Roc\'s Feather, Pegasus Boots and the Magnetic Gloves.', ok: tools.length > 0 && run.rupees >= UPGRADE_COST,
    select: tools.map((t, i) => ({ id: `${i}`, label: `${nameOf(t.id)}${t.uid ? ` (${run.roster.find((u) => u.uid === t.uid)?.name ?? ''})` : ' (convoy)'} → ${nameOf(LEVEL2[t.id])}` })) });
  return out;
}

export function doFourSwordsCamp(run: Run, key: string, rng: RNG, uid?: string, arg?: string): string | null {
  const st = fourswordsOf(run);
  const opt = fourswordsCampOptions(run, 'camp').concat(fourswordsCampOptions(run, 'shop'), fourswordsCampOptions(run, 'smith')).find((o) => o.key === key);
  if (!opt || !opt.ok) return null;
  void uid;
  const done = () => { if (!st.campUsed.includes(key)) st.campUsed.push(key); };
  switch (key) {
    case 'callLink': { run.rupees -= 300; done(); const lines: string[] = []; const id = missingLink(run)!; recruitOnce(run, id, rng, lines, `${TEMPLATES[id].name} joins the army.`); return lines.join(' ') || null; }
    case 'drill': run.rupees -= 200; done(); st.drill++; return `Formation drill ${st.drill}/3.`;
    case 'shrine': run.rupees -= 250 * (st.shrine + 1); st.shrine++; return `The Force Shrine glows brighter (level ${st.shrine}).`;
    case 'heal': run.rupees -= 80; for (const u of run.roster) u.hp = u.stats.hp; return 'The Shrine Maidens heal everyone.';
    case 'freeMaiden': { take(run, 'maidenCrystal'); const lines: string[] = []; const id = MAIDENS.find((m) => !inArmy(run, m))!; recruitOnce(run, id, rng, lines, `The crystal shatters: the ${TEMPLATES[id].name} joins.`); return lines.join(' ') || null; }
    case 'recruitMaiden': { run.rupees -= 400; done(); const lines: string[] = []; const id = MAIDENS.find((m) => !inArmy(run, m))!; recruitOnce(run, id, rng, lines, `The ${TEMPLATES[id].name} joins.`); return lines.join(' ') || null; }
    case 'upgrade': {
      const tools = upgradableTools(run);
      const t = tools[Number(arg ?? 0)] ?? tools[0];
      if (!t) return null;
      run.rupees -= UPGRADE_COST;
      return upgradeTool(run, t.id, t.uid);
    }
  }
  return null;
}

/** New camp: facility uses reset. */
export function fourswordsCampVisit(run: Run) {
  if (run.fourswords) run.fourswords.campUsed = [];
}

/** Top-bar summary of the campaign. */
export function fourswordsStatus(run: Run): { line: string; links: number; maidens: number; jewels: number; shrine: number; drill: number; pending: number } {
  const st = fourswordsOf(run);
  const i = FS_ROUTE.indexOf(run.region);
  return {
    line: i >= 0 ? `${i < FS_GBA.length ? 'Four Swords' : 'Adventures'} ${i < FS_GBA.length ? i + 1 : i - FS_GBA.length + 1}/${i < FS_GBA.length ? FS_GBA.length : FS_ROUTE.length - FS_GBA.length}` : 'Hyrule',
    links: FOUR_LINKS.filter((id) => inArmy(run, id)).length, maidens: MAIDENS.filter((id) => inArmy(run, id)).length, jewels: count(run, 'royalJewel'),
    shrine: st.shrine, drill: st.drill, pending: st.pending,
  };
}
