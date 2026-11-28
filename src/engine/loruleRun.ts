// A Link Between Worlds campaign: the sixteen regions of section 11 (Hyrule's six in order, then Lorule's hub, the seven
// Sage dungeons in any order with crossings back to Hyrule through the wall cracks, the Treacherous Tower and Lorule
// Castle), Ravio's rental shop (rentals reclaimed by Sheerow when the renter falls), the Maiamai rescue and Mother
// Maiamai's Nice upgrades, Master Ore at the Lorulean Forge, the new encounter types, the camp facilities (Ravio's
// Shop, Maiamai Nursery, Lorulean Forge, Milk Bar, Sage Sanctuary) and Yuga's fusion into Yuga Ganon.

import { BOSSES, GEAR, ITEMS, QUEST_ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import {
  HYRULE_ROUTE, KINGDOM, LB_ROUTE_BOSSES, LORULE_FINALE, LORULE_HUB, LORULE_PREFERRED_ART, LORULE_ROUTE, NEEDS_CROSSING, NICE_ITEMS, PAIRED_LB_REGIONS,
  SAGE_DUNGEONS, SAGE_OF, SAGE_PAINTING, SAGES,
} from '../content/lorule';
import { canWield } from './combat';
import { anchorCost, footprint, keyOf, tilesInRange, unitAt } from './grid';
import { lrState, spawnNear } from './lorule';
import type { RNG } from './rng';
import { INF } from './rules';
import { addToPack, makeEnemy, makeHero, prepareForBattle } from './units';
import type { Battle, BossDef, EventEffect, MapNode, Run, RunMap, Unit } from './types';
import type { Reward } from './run';

export interface Rental { id: string; uid: string }
export interface LoruleRunState {
  /** Route bosses beaten (and `region:<id>` once a region's rewards are in). */
  beaten: string[];
  /** Yuga Ganon is beaten: the route is done. */
  done?: boolean;
  /** Baby Maiamai rescued (they go home to their mother, not into the army). */
  maiamai: number;
  /** Nice upgrades given (one per 10 Maiamai, up to 9; at 100 the Great Spin). */
  niceGiven: number;
  /** The army's Nice tools (item ids). */
  nice: string[];
  /** Ravio's rentals: which unit holds which item. */
  rentals: Rental[];
  /** Crossings between the kingdoms. */
  crossings: number;
  /** The last region change crossed the kingdoms (a blocked encounter is bypassed). */
  justCrossed?: boolean;
  /** Master Ore spent at the forge. */
  tempered: number;
  /** The Sage Sanctuary's blessing on the next battle. */
  blessed?: boolean;
  /** A hint ghost's hint for the next battle (hidden enemies and traps shown). */
  hint?: boolean;
  /** Camp facility actions already taken at this camp. */
  campUsed: string[];
  greatSpin?: boolean;
}

declare module './types' {
  interface Run {
    /** The A Link Between Worlds campaign state. */
    lorule?: LoruleRunState;
  }
}

export const loruleOf = (run: Run): LoruleRunState => (run.lorule ??= { beaten: [], maiamai: 0, niceGiven: 0, nice: [], rentals: [], crossings: 0, tempered: 0, campUsed: [] });
const q = (run: Run) => (run.questItems ??= []);
const count = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const take = (run: Run, id: string, n = 1) => { for (let i = 0; i < n; i++) { const k = q(run).indexOf(id); if (k < 0) return false; q(run).splice(k, 1); } return true; };
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? QUEST_ITEMS[id]?.name ?? TEMPLATES[id]?.name ?? id;
const ownedBy = (run: Run, id: string) => run.roster.find((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id) || u.pack.some((p) => p.id === id));
const owns = (run: Run, id: string) => run.convoy.includes(id) || !!ownedBy(run, id);
const avgLevel = (run: Run) => Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));

export const loruleStartRegion = (): string => LORULE_ROUTE[0];
export const inLoruleRoute = (run: Run) => run.campaign === 'lorule' && LORULE_ROUTE.includes(run.region) && !loruleOf(run).done;

function recruitOnce(run: Run, id: string, rng: RNG, lines: string[], why: string) {
  if (!TEMPLATES[id] || run.roster.some((u) => u.templateId === id)) return;
  const u = makeHero(id, `p${run.uidCounter++}`, avgLevel(run), rng);
  if (LORULE_PREFERRED_ART[id]) u.artPick = LORULE_PREFERRED_ART[id];
  run.roster.push(u);
  run.stats.recruits++;
  lines.push(why);
}
/** Hand something to the army: a weapon to someone who can wield it, gear to the convoy, pack items to a pack. */
function give(run: Run, id: string) {
  if (ITEMS[id]) { if (!run.roster.some((u) => addToPack(u, id))) run.convoy.push(id); return; }
  const w = WEAPONS[id];
  const u = w ? run.roster.find((x) => canWield(x, w) && x.weapons.length < 5) : undefined;
  if (u) u.weapons.push(id); else run.convoy.push(id);
}

/** New campaign. */
export function loruleStart(run: Run, rng: RNG) {
  loruleOf(run);
  void rng;
}

/** The fixed boss of a route region: the first of its bosses not yet beaten (Shadow Link once the Four Swords pack is in). */
export function loruleBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'lorule' || node.type !== 'boss') return null;
  const list = (LB_ROUTE_BOSSES[node.world] ?? []).map((id) => (id === 'darkLink' && BOSSES.shadowLink ? 'shadowLink' : id)).filter((id) => BOSSES[id]);
  if (!list.length) return null;
  const st = loruleOf(run);
  return BOSSES[list.find((x) => !st.beaten.includes(x)) ?? list[0]] ?? null;
}

// ───────────────────────── The map: kingdoms and encounters ─────────────────────────

const ENCOUNTER_NAME: Record<NonNullable<MapNode['lrEncounter']>, string> = {
  paintingRescue: 'Painting Rescue', parallelInfiltration: 'Parallel Infiltration', maiamaiRescue: 'Maiamai Rescue', treacherousTower: 'Treacherous Tower',
  rentalChallenge: 'Rental Challenge', shadowDuel: 'Shadow Duel',
};
export const encounterName = (n?: MapNode) => (n?.lrEncounter ? ENCOUNTER_NAME[n.lrEncounter] : null);

/** Map decoration: Hyrule's recruitment, trade and defence; Lorule's danger; the encounter types; crossings bypass a blocked encounter. */
export function loruleDecorateMap(run: Run, map: RunMap, rng: RNG) {
  if (run.campaign !== 'lorule' || !LORULE_ROUTE.includes(run.region)) return;
  const st = loruleOf(run);
  const rows = Math.max(...map.nodes.map((n) => n.row));
  const mid = (types: string[]) => map.nodes.filter((n) => n.row >= 1 && n.row <= rows - 1 && types.includes(n.type) && !n.lrEncounter);
  const pick = (types: string[]) => { const l = mid(types); return l.length ? rng.pick(l) : undefined; };
  const kingdom = KINGDOM[run.region];
  // Crossing between the kingdoms: the way round a blocked encounter.
  const prev = run.regionsVisited[run.regionsVisited.length - 2];
  st.justCrossed = !!prev && !!KINGDOM[prev] && KINGDOM[prev] !== kingdom;
  if (st.justCrossed) {
    st.crossings++;
    const blocked = pick(['elite', 'siege', 'ambush']);
    if (blocked) blocked.type = 'treasure';
  }
  if (run.region === 'treacherousTower') {
    for (const n of map.nodes) if (['camp', 'fountain', 'event'].includes(n.type)) n.type = 'battle';
    for (const n of map.nodes) if (['battle', 'ambush', 'siege', 'elite'].includes(n.type)) n.lrEncounter = 'treacherousTower';
    return;
  }
  if (kingdom === 'hyrule') {
    const r = pick(['battle', 'event']); if (r) r.type = 'recruit';
    const s = pick(['battle', 'event', 'treasure']); if (s && rng.chance(50)) s.type = 'shop';
  } else {
    const e = pick(['battle']); if (e) e.type = 'elite';
  }
  const set = (types: string[], enc: NonNullable<MapNode['lrEncounter']>) => { const n = pick(types); if (n) { if (n.type === 'event') n.type = 'battle'; n.lrEncounter = enc; } };
  set(['battle', 'event'], 'maiamaiRescue');
  if (['kakarikoLB', 'thievesTown', 'hyruleCastleLB'].includes(run.region)) set(['battle'], 'rentalChallenge');
  if (['sanctuaryLB', 'loruleCastle', 'darkPalaceLB'].includes(run.region)) set(['elite', 'battle'], 'shadowDuel');
  if (kingdom === 'lorule' && run.region !== LORULE_HUB) set(['siege', 'battle', 'elite'], 'parallelInfiltration');
  const unfreed = SAGES.filter((s) => !run.roster.some((u) => u.templateId === s));
  if (unfreed.length && HYRULE_ROUTE.indexOf(run.region) !== 0 && HYRULE_ROUTE.indexOf(run.region) !== 1) set(['battle', 'event'], 'paintingRescue');
}

/** Battle setup: the boss's retinue, paired bosses, Yuga's fusion, the encounters, the Nice tools, the preferred Ganon art. */
export function loruleBattleSetup(run: Run, b: Battle, rng: RNG) {
  const st = run.lorule;
  const lr = lrState(b);
  if (st) lr.nice = [...st.nice];
  if (run.campaign !== 'lorule') return;
  for (const u of b.units) { const a = LORULE_PREFERRED_ART[u.bossId ?? u.templateId ?? '']; if (a && !u.artOverride) u.artOverride = a; }
  if (st?.blessed) { for (const u of b.units.filter((x) => x.team === 'player')) u.buffs.push({ id: 'sagesBlessing', name: 'Sage Sanctuary', turns: 3, stats: { mag: 3, res: 3 } }); st.blessed = false; }
  if (st?.hint) { for (const u of b.units) if (u.team === 'enemy') u.hidden = false; for (const t of b.traps ?? []) t.hidden = false; st.hint = false; }
  const node = run.map.nodes.find((n) => n.id === run.currentNodeId);
  const enc = node?.lrEncounter;
  if (enc && b.nodeType !== 'boss') applyEncounter(run, b, enc, rng);
  if (b.nodeType !== 'boss') return;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!main) return;
  for (const id of ESCORTS[main.bossId ?? ''] ?? []) spawnNear(b, id, main, main.level, rng, 'enemy');
  // Tower of Hera: Mini-Moldorms (Moldorm with a reduced-size modifier).
  if (b.world === 'towerOfHeraLB') for (let i = 0; i < 2; i++) {
    const m = spawnNear(b, 'moldorm', main, Math.max(1, main.level - 2), rng, 'enemy');
    if (m) { m.name = 'Mini-Moldorm'; m.size = 1; m.stats.hp = m.hp = Math.ceil(m.stats.hp * 0.6); m.stats.str = Math.ceil(m.stats.str * 0.7); }
  }
  if (b.world === 'loruleCastle' && main.bossId === 'yugaBoss') lr.fusion = true;
  if (!PAIRED_LB_REGIONS.includes(b.world)) return;
  for (const id of (LB_ROUTE_BOSSES[b.world] ?? []).filter((x) => x !== main.bossId)) {
    const def = BOSSES[id];
    if (!def) continue;
    const e = makeEnemy(def, b.world, main.level, `lb${b.uidCounter++}`, rng, { boss: true });
    for (let d = 1; d <= 8; d++) {
      const spot = tilesInRange(b, main, d, d, main.size).find((p) => anchorCost(b, e, p.x, p.y) < INF && footprint(p.x, p.y, e.size).every((f) => !unitAt(b, f.x, f.y)));
      if (spot) { Object.assign(e, { x: spot.x, y: spot.y, ai: main.ai }); b.units.push(e); lr.allBosses = true; break; }
    }
  }
}

const ESCORTS: Record<string, string[]> = {
  heedle: ['keese'], yugaBoss: ['ballChainSoldier'], margomill: ['bari'], gigabari: ['bari'], stalblind: ['rupeeLike'], gemesaurKing: ['gimos'],
  knucklemaster: ['wallmaster'], zaganaga: ['devalant', 'devalant'], dharkstare: ['bigPengator', 'pengator'], grinexx: ['fireKeese', 'gimos'],
};
const RENTALS = ['fairyBow', 'boomerang', 'hookshot', 'magicHammer', 'fireRod', 'iceRod', 'tornadoRod', 'sandRod'];

function applyEncounter(run: Run, b: Battle, enc: NonNullable<MapNode['lrEncounter']>, rng: RNG) {
  const lr = lrState(b);
  lr.encounter = enc;
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !b.units.some((u) => keyOf(b, u.x, u.y) === i) ? i : -1)).filter((i) => i >= 0));
  const far = plains.filter((k) => k % b.width >= Math.floor(b.width / 2));
  switch (enc) {
    case 'maiamaiRescue':
      for (let i = 0; i < 5; i++) { const k = plains.pop(); if (k !== undefined) b.tiles[k] = 'maiamaiSpot'; }
      b.log.push('Maiamai Rescue: Baby Maiamai are hiding all over the field. Find them before the battle ends!');
      break;
    case 'parallelInfiltration': {
      const near = plains.filter((k) => k % b.width <= 2);
      for (const k of [near[0], far[0]]) if (k !== undefined) b.tiles[k] = 'wallCrack';
      b.rewardRupees += 80;
      b.log.push('Parallel Infiltration: a Wall Crack near the army leads behind the enemy line.');
      break;
    }
    case 'paintingRescue': {
      const unfreed = rng.shuffle(SAGES.filter((s) => !run.roster.some((u) => u.templateId === s))).slice(0, 2);
      for (const id of unfreed) {
        const k = far.pop();
        if (k === undefined) break;
        const c = prepareForBattle(makeHero(id, `lb${b.uidCounter++}`, Math.max(1, b.enemyLevel - 1), rng));
        Object.assign(c, { x: k % b.width, y: Math.floor(k / b.width), team: 'player', captive: true, npc: false, lrPainted: { turns: 99 } });
        b.tiles[k] = 'portraitFrame';
        b.units.push(c);
      }
      if (unfreed.length) { b.objective = { type: 'rescue' }; b.log.push('Painting Rescue: free the painted Sages from their Portrait Frames (stand next to them)!'); }
      break;
    }
    case 'rentalChallenge': {
      lr.loaned = {};
      for (const u of b.units.filter((x) => x.team === 'player')) {
        const opts = RENTALS.filter((id) => canWield(u, WEAPONS[id]) && !u.weapons.includes(id));
        if (!opts.length) continue;
        const id = rng.pick(opts);
        u.weapons.unshift(id); lr.loaned[u.uid] = id;
      }
      b.rewardRupees += 150;
      b.log.push('Rental Challenge: win with the gear Ravio lent you (it goes back after the battle). ₹150 more if you do.');
      break;
    }
    case 'shadowDuel': {
      const id = BOSSES.shadowLink ? 'shadowLink' : 'darkLink';
      const def = BOSSES[id];
      const k = far.pop();
      if (!def || k === undefined) break;
      const e = makeEnemy(def, b.world, b.enemyLevel + 1, `lb${b.uidCounter++}`, rng);
      const loadout = rng.shuffle(['fightersSword', 'fairyBow', 'boomerang', 'fireRod', 'iceRod', 'tornadoRod', 'magicHammer', 'hookshot']).filter((w) => canWield(e, WEAPONS[w])).slice(0, 2);
      if (loadout.length) e.weapons = [...loadout, ...e.weapons];
      Object.assign(e, { x: k % b.width, y: Math.floor(k / b.width), ai: 'aggressive' });
      b.units.push(e);
      b.log.push(`Shadow Duel: ${e.name} steps out of the shadows with a random loadout (${loadout.map(nameOf).join(', ') || 'its own sword'}).`);
      break;
    }
    case 'treacherousTower':
      b.objective = { type: 'survive', turns: 5 };
      b.log.push('Treacherous Tower: wave after wave — survive five turns. There is little rest between floors.');
      break;
  }
}

// ───────────────────────── After a battle ─────────────────────────

/** Maiamai milestones: a Nice upgrade every 10, the Great Spin at 100. */
export const niceAvailable = (run: Run) => Math.min(9, Math.floor(loruleOf(run).maiamai / 10)) - loruleOf(run).niceGiven;

export function rescueMaiamai(run: Run, n: number, lines: string[]) {
  const st = loruleOf(run);
  const before = st.maiamai;
  st.maiamai = Math.min(100, st.maiamai + n);
  for (let i = 0; i < st.maiamai - before; i++) q(run).push('maiamaiToken');
  if (Math.floor(st.maiamai / 10) > Math.floor(before / 10)) lines.push(`${st.maiamai} Baby Maiamai rescued: Mother Maiamai can make another tool Nice (Maiamai Nursery).`);
  if (st.maiamai >= 100 && !st.greatSpin) { st.greatSpin = true; give(run, 'greatSpinScroll'); lines.push('All 100 Baby Maiamai are home! Mother Maiamai gives you the Great Spin Scroll.'); }
}

export function loruleAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const lr = b.lr;
  const st = run.lorule;
  // Rentals: Sheerow reclaims the items of fallen renters; Sheerow (if he lived) brings home everyone else's.
  if (st) {
    const fallen = b.fallen.filter((u) => u.team === 'player' && !u.npc);
    const sheerow = b.units.some((u) => u.team === 'player' && u.skills.includes('itemRetrieval'));
    for (const f of fallen) {
      const rec = run.fallen.find((x) => x.uid === f.uid) ?? f;
      for (const r of st.rentals.filter((x) => x.uid === f.uid)) {
        rec.weapons = rec.weapons.filter((w) => w !== r.id);
        for (const [slot, g] of Object.entries(rec.gear)) if (g === r.id) delete rec.gear[slot as keyof typeof rec.gear];
        lines.push(`Sheerow flies off with the rented ${nameOf(r.id)}: ${f.name} has fallen.`);
      }
      st.rentals = st.rentals.filter((x) => x.uid !== f.uid);
      if (sheerow) {
        const kit = [...rec.weapons.filter((w) => WEAPONS[w] && !WEAPONS[w].unique && WEAPONS[w].type !== 'natural'), ...Object.values(rec.gear).filter((g): g is string => !!g && !GEAR[g]?.unique)];
        if (kit.length) { run.convoy.push(...kit); rec.weapons = rec.weapons.filter((w) => !kit.includes(w)); rec.gear = {}; lines.push(`Sheerow brings home ${f.name}'s equipment (${kit.map(nameOf).join(', ')}).`); }
      }
    }
  }
  if (!lr) return lines;
  if (lr.stolen) { run.rupees = Math.max(0, run.rupees - lr.stolen); lines.push(`The Rupee Likes got away with ₹${lr.stolen}.`); }
  if (!won) return lines;
  if (lr.found.length) { for (const id of lr.found) q(run).push(id); lines.push(`Found: ${lr.found.map(nameOf).join(', ')}.`); }
  if (lr.rupees) { run.rupees += lr.rupees; lines.push(`₹${lr.rupees} in gems and Rupees picked up on the field.`); }
  if (lr.maiamai) { lines.push(`${lr.maiamai} Baby Maiamai rescued.`); rescueMaiamai(run, lr.maiamai, lines); }
  if (lr.encounter === 'maiamaiRescue' && lr.maiamai >= 5) { run.rupees += 100; lines.push('Every Maiamai found: Mother Maiamai sends ₹100.'); }
  if (lr.encounter === 'treacherousTower') { run.rupees += 120; lines.push('A floor of the Treacherous Tower cleared: ₹120.'); }
  if (run.roster.some((u) => u.skills.includes('masterTempering'))) {
    let n = 0;
    for (const u of run.roster) for (const w of Object.keys(u.wear ?? {})) if ((u.wear![w] ?? 0) > 0) { u.wear![w] = Math.max(0, u.wear![w] - 5); n++; }
    if (n) lines.push(`The Lorulean Blacksmith tempers ${n} worn weapon${n > 1 ? 's' : ''}.`);
  }
  if (run.roster.some((u) => Object.values(u.gear).includes('gemesaurMask'))) { const r = Math.round(b.rewardRupees * 0.15); run.rupees += r; lines.push(`The Gemesaur Mask sheds ₹${r}.`); }
  if (run.campaign === 'lorule' && rng.chance(20)) { rescueMaiamai(run, 1, lines); lines.push('A Baby Maiamai was hiding in the rubble.'); }
  if (run.campaign === 'lorule') lines.push(...routeRewards(run, b, rng));
  return lines;
}

function routeRewards(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  if (b.nodeType !== 'boss') return lines;
  const st = loruleOf(run);
  const region = b.world;
  const list = (LB_ROUTE_BOSSES[region] ?? []).map((id) => (id === 'darkLink' && BOSSES.shadowLink ? 'shadowLink' : id));
  for (const id of b.fallen.filter((u) => u.team === 'enemy' && u.isBoss).map((u) => u.bossId ?? '')) if (list.includes(id) && !st.beaten.includes(id)) st.beaten.push(id);
  const key = `region:${region}`;
  if (st.beaten.includes(key)) return lines;
  st.beaten.push(key);
  const giveOnce = (id: string, why: string) => { if (!owns(run, id)) { give(run, id); lines.push(why); } };
  const sage = SAGE_OF[region];
  if (sage) {
    const painting = SAGE_PAINTING[sage];
    if (painting && !q(run).includes(painting)) q(run).push(painting);
    const freed = SAGE_DUNGEONS.filter((r) => st.beaten.includes(`region:${r}`)).length;
    if (sage === 'oren' && !count(run, 'smoothGem')) lines.push(`Queen Oren's painting is freed (${freed}/7), but she won't march with you until her Smooth Gem is back.`);
    else {
      if (sage === 'oren') take(run, 'smoothGem');
      recruitOnce(run, sage, rng, lines, `${TEMPLATES[sage]?.name} steps out of the painting: a Sage of Lorule is free (${freed}/7).`);
    }
  }
  switch (region) {
    case 'kakarikoLB':
      recruitOnce(run, 'ravio', rng, lines, 'A rabbit-hooded merchant has moved into your house. "I\'ll be renting out my wares here. You can call me Ravio." He joins — Sheerow too.');
      recruitOnce(run, 'sheerow', rng, lines, '');
      giveOnce('raviosBracelet', "Ravio's Bracelet: now you can merge into walls.");
      break;
    case 'easternPalaceLB': giveOnce('pendantOfCourage', 'The Pendant of Courage.'); lines.push('Yuga escapes through the wall, laughing.'); break;
    case 'houseOfGales': giveOnce('pendantOfWisdom', 'The Pendant of Wisdom.'); break;
    case 'towerOfHeraLB':
      giveOnce('pendantOfPower', 'The Pendant of Power.');
      giveOnce('masterSword', 'All three Pendants: the Master Sword in the Lost Woods.');
      break;
    case 'sanctuaryLB':
      giveOnce('hylianShield', 'The Hylian Shield, from the Sanctuary\'s treasury.');
      recruitOnce(run, 'gramps', rng, lines, 'Gramps hobbles in from Kakariko: "Shadows of yourself now? You need a teacher."');
      break;
    case 'hyruleCastleLB':
      if (!q(run).includes('paintingOfZelda')) q(run).push('paintingOfZelda');
      lines.push('Yuga turns Princess Zelda into a painting and flees through a crack in the wall — into Lorule. Follow him.');
      break;
    case LORULE_HUB:
      q(run).push('masterOre');
      recruitOnce(run, 'thiefGirl', rng, lines, 'A pink-haired thief drops from a rooftop: "You want into the Hideout? I know the way. I also want in."');
      recruitOnce(run, 'loruleanBlacksmith', rng, lines, 'The Lorulean Blacksmith looks at your sword: "Master Ore. I can work with that."');
      break;
    case 'swampPalaceLB': giveOnce('zorasFlippers', "Zora's Flippers."); break;
    case 'desertPalaceLB': giveOnce('sandRod', 'The Sand Rod.'); break;
    case 'iceRuins': giveOnce('redMail', 'The Red Mail.'); break;
    case 'turtleRockLB': q(run).push('masterOre'); lines.push('Master Ore glints in the cooling lava.'); break;
    case 'treacherousTower': run.rupees += 500; q(run).push('masterOre'); lines.push('The top of the Treacherous Tower: ₹500 and Master Ore.'); break;
    case 'loruleCastle':
      st.done = true;
      q(run).push('triforceOfLorule');
      take(run, 'paintingOfZelda');
      recruitOnce(run, 'zeldaALBW', rng, lines, 'Zelda steps out of the last painting, the Triforce of Wisdom shining.');
      recruitOnce(run, 'hilda', rng, lines, 'Hilda kneels: "I was wrong. Let me help you save both our kingdoms." She joins.');
      giveOnce('hildasCrown', "Hilda's Crown.");
      lines.push('Yuga Ganon is defeated. The Triforce of Lorule is restored.');
      break;
  }
  return lines.filter(Boolean);
}

/** Region choices after a boss. Empty: the ordinary choice of regions. */
export function loruleRegionOptions(run: Run, rng: RNG): string[] {
  const st = loruleOf(run);
  if (st.done) return rng.shuffle(LORULE_ROUTE.filter((x) => x !== run.region)).slice(0, 3);
  const beaten = (r: string) => st.beaten.includes(`region:${r}`);
  const h = HYRULE_ROUTE.indexOf(run.region);
  if (h >= 0 && h < HYRULE_ROUTE.length - 1 && !beaten(HYRULE_ROUTE[HYRULE_ROUTE.length - 1])) return [HYRULE_ROUTE[h + 1]];
  if (run.region === 'hyruleCastleLB' && !beaten(LORULE_HUB)) return [LORULE_HUB];
  const left = SAGE_DUNGEONS.filter((r) => !beaten(r));
  if (left.length) {
    // The Desert Palace's entrance is in Hyrule: it is offered from a Hyrulean region only.
    const inHyrule = KINGDOM[run.region] === 'hyrule';
    const open = left.filter((r) => inHyrule || !NEEDS_CROSSING.includes(r));
    const opts = rng.shuffle(open).slice(0, inHyrule ? 3 : 2);
    if (!inHyrule) opts.push(rng.pick(['kakarikoLB', 'sanctuaryLB', 'hyruleCastleLB', 'easternPalaceLB']));
    return opts;
  }
  const fin = LORULE_FINALE.filter((r) => !beaten(r));
  return fin.length ? fin : [LORULE_FINALE[LORULE_FINALE.length - 1]];
}

// ───────────────────────── Events and treasure ─────────────────────────

export function applyLoruleEffect(run: Run, e: Extract<EventEffect, { kind: 'lorule' }>, rng: RNG): string | null {
  const st = loruleOf(run);
  switch (e.op) {
    case 'maiamai': { const lines: string[] = []; rescueMaiamai(run, e.amount ?? 1, lines); return [`${e.amount ?? 1} Baby Maiamai rescued (${st.maiamai}/100).`, ...lines].join(' '); }
    case 'masterOre': q(run).push('masterOre'); return 'Master Ore!';
    case 'hint': st.hint = true; return 'In the next battle, every hidden enemy and trap is shown.';
    case 'rent': {
      const u = rng.pick(run.roster);
      const opts = RENTALS.filter((id) => canWield(u, WEAPONS[id]) && !u.weapons.includes(id));
      if (!opts.length) { run.rupees += 100; return 'Nothing fits; Ravio refunds you.'; }
      const id = rng.pick(opts);
      u.weapons.push(id); st.rentals.push({ id, uid: u.uid });
      return `${u.name} rents the ${nameOf(id)}.`;
    }
    case 'temper': return temper(run) ?? 'You need Master Ore and the Master Sword (or its Tempered form).';
    case 'repairAll': {
      let n = 0;
      for (const u of run.roster) for (const w of Object.keys(u.wear ?? {})) { u.wear![w] = Math.max(0, u.wear![w] - 10); n++; }
      return `${n} weapon${n === 1 ? '' : 's'} mended.`;
    }
    case 'fuseYuga': return fuseYuga(run, rng) ?? 'Yuga isn\'t here.';
  }
  return null;
}

/** Yuga merges with the Demon King's painting: he becomes Yuga Ganon for good (same level, same place in the army). */
export function fuseYuga(run: Run, rng: RNG): string | null {
  const i = run.roster.findIndex((u) => u.templateId === 'yuga');
  if (i < 0 || !TEMPLATES.yugaGanon) return null;
  const old = run.roster[i];
  const u = makeHero('yugaGanon', old.uid, old.level, rng);
  Object.assign(u, { xp: old.xp, isCommander: old.isCommander, pack: old.pack });
  run.roster[i] = u;
  return `${old.name} becomes Yuga Ganon (level ${u.level}).`;
}

/** The Lorulean Forge: Master Sword → Tempered Sword → Golden Sword, one Master Ore each. */
export function temper(run: Run): string | null {
  if (!count(run, 'masterOre')) return null;
  const next: Record<string, string> = { masterSword: 'temperedSword', temperedSword: 'goldenSword' };
  for (const u of run.roster) {
    const w = u.weapons.find((x) => next[x]);
    if (!w) continue;
    take(run, 'masterOre');
    u.weapons[u.weapons.indexOf(w)] = next[w];
    if (u.wear) delete u.wear[w];
    loruleOf(run).tempered++;
    return `${u.name}'s ${nameOf(w)} is tempered into the ${nameOf(next[w])}.`;
  }
  const c = run.convoy.findIndex((x) => next[x]);
  if (c < 0) return null;
  take(run, 'masterOre');
  const was = run.convoy[c];
  run.convoy[c] = next[was];
  loruleOf(run).tempered++;
  return `The ${nameOf(was)} is tempered into the ${nameOf(next[was])}.`;
}

/** Treasure nodes: Lorule's chests hold rarer things; Master Ore and Maiamai turn up. */
export function loruleTreasure(run: Run, rng: RNG, ev: { rewards: Reward[]; rupees: number }): string[] {
  if (run.campaign !== 'lorule') return [];
  const lines: string[] = [];
  const lorule = KINGDOM[run.region] === 'lorule';
  if (rng.chance(lorule ? 35 : 15)) { q(run).push('masterOre'); lines.push('Master Ore is tucked in the chest.'); }
  if (rng.chance(40)) { lines.push('A Baby Maiamai was hiding in the chest.'); rescueMaiamai(run, 1, lines); }
  if (lorule && rng.chance(40)) ev.rewards.unshift({ kind: 'gear', id: rng.pick(['hintGlasses', 'raviosRobes', 'raviosRabbitHood', 'stalblindsShield', 'blueMail']) });
  if (rng.chance(25)) ev.rewards.unshift({ kind: 'item', id: rng.pick(['scootFruit', 'foulFruit']) });
  return lines;
}

// ───────────────────────── Ravio's Shop and the camp facilities (sections 8 and 11) ─────────────────────────

/** Ravio's prices: the item's own price, doubled to buy outright; a rental is a twelfth of that. */
export function buyPrice(run: Run, id: string): number {
  const base = WEAPONS[id]?.price ?? GEAR[id]?.price ?? ITEMS[id]?.price ?? 300;
  return Math.round(Math.max(200, base * 2) * priceMult(run) / 10) * 10;
}
export function rentPrice(run: Run, id: string): number {
  const base = WEAPONS[id]?.price ?? GEAR[id]?.price ?? 300;
  return Math.max(30, Math.round((Math.max(200, base * 2) / 12) * priceMult(run) * (run.bonus === 'rentalDiscount' ? 0.5 : 1) / 10) * 10);
}
const priceMult = (run: Run) => (run.roster.some((u) => Object.values(u.gear).includes('raviosRabbitHood')) ? 0.85 : 1)
  * (['ravio', 'beedle', 'tingle', 'linebeck'].every((id) => run.roster.some((u) => u.templateId === id)) ? 0.85 : 1);
export const RAVIO_STOCK = [...RENTALS, 'bomb', 'raviosBracelet', 'hintGlasses', 'scootFruit', 'foulFruit', 'staminaScroll'];

export interface LoruleCampOption {
  key: string;
  facility: string;
  label: string;
  desc: string;
  ok: boolean;
  pick?: (u: Unit) => boolean;
  select?: { id: string; label: string }[];
}

export const LORULE_FACILITIES: Record<string, { name: string; icon: string; where: ('camp' | 'shop' | 'smith')[] }> = {
  ravio: { name: "Ravio's Shop", icon: '🐰', where: ['camp', 'shop'] },
  nursery: { name: 'Maiamai Nursery', icon: '🐙', where: ['camp'] },
  forge: { name: 'Lorulean Forge', icon: '⚒', where: ['camp', 'smith'] },
  milkBar: { name: 'Milk Bar', icon: '🥛', where: ['camp', 'shop'] },
  sanctuary: { name: 'Sage Sanctuary', icon: '⛪', where: ['camp'] },
};

const rentable = (id: string) => !!WEAPONS[id];

export function loruleCampOptions(run: Run, where: 'camp' | 'shop' | 'smith'): LoruleCampOption[] {
  if (run.campaign !== 'lorule') return [];
  const st = loruleOf(run);
  const out: LoruleCampOption[] = [];
  const add = (facility: string, o: Omit<LoruleCampOption, 'facility'>) => { if (LORULE_FACILITIES[facility].where.includes(where)) out.push({ facility, ...o }); };
  const used = (k: string) => st.campUsed.includes(k);
  // ── Ravio's Shop ──
  add('ravio', { key: 'rent', label: 'Rent an item for the run', desc: 'It goes back to Ravio (Sheerow fetches it) if the renter falls.', ok: true,
    select: RAVIO_STOCK.filter(rentable).map((id) => ({ id, label: `${nameOf(id)} — rent ₹${rentPrice(run, id)}` })), pick: (u) => RAVIO_STOCK.some((id) => rentable(id) && canWield(u, WEAPONS[id])) });
  add('ravio', { key: 'buy', label: 'Buy an item outright', desc: 'Yours to keep (normal recovery rules), and it can be made Nice.', ok: true,
    select: RAVIO_STOCK.map((id) => ({ id, label: `${nameOf(id)} — buy ₹${buyPrice(run, id)}` })) });
  if (st.rentals.length) add('ravio', { key: 'moveRental', label: 'Move a rental to another unit (free)', desc: `${st.rentals.length} rental${st.rentals.length > 1 ? 's' : ''} out.`, ok: true,
    select: st.rentals.map((r) => ({ id: `${r.id}@${r.uid}`, label: `${nameOf(r.id)} (${run.roster.find((u) => u.uid === r.uid)?.name ?? '?'})` })), pick: () => true });
  // ── Maiamai Nursery ──
  const avail = niceAvailable(run);
  const candidates = Object.keys(NICE_ITEMS).filter((id) => !st.nice.includes(id) && owns(run, id) && !st.rentals.some((r) => r.id === id));
  add('nursery', { key: 'nice', label: `Make a tool Nice (${avail} upgrade${avail === 1 ? '' : 's'} ready · ${st.maiamai}/100 Maiamai)`, desc: 'Mother Maiamai upgrades one owned (bought) item for the rest of the run.',
    ok: avail > 0 && candidates.length > 0, select: candidates.map((id) => ({ id, label: NICE_ITEMS[id] })) });
  add('nursery', { key: 'adoptBaby', label: 'Adopt a Baby Maiamai — ₹120', desc: 'A recruitable Baby Maiamai (separate from the rescued ones) joins the army.', ok: run.rupees >= 120 && !used('adoptBaby') });
  // ── Lorulean Forge ──
  add('forge', { key: 'temper', label: `Temper the Master Sword with Master Ore (${count(run, 'masterOre')} ore)`, desc: 'Master Sword → Tempered Sword → Golden Sword.', ok: count(run, 'masterOre') > 0 && [...run.convoy, ...run.roster.flatMap((u) => u.weapons)].some((w) => w === 'masterSword' || w === 'temperedSword') });
  const worn = run.roster.reduce((n, u) => n + Object.values(u.wear ?? {}).filter((x) => x > 0).length, 0);
  add('forge', { key: 'repair', label: `Mend every weapon — ₹${worn * 15}`, desc: `${worn} worn weapon${worn === 1 ? '' : 's'}.`, ok: worn > 0 && run.rupees >= worn * 15 });
  // ── Milk Bar ──
  add('milkBar', { key: 'milk', label: 'Buy Lon Lon Milk — ₹80', desc: 'Two servings.', ok: run.rupees >= 80 });
  add('milkBar', { key: 'potion', label: 'Buy a Red Potion — ₹120', desc: 'A full bottle.', ok: run.rupees >= 120 });
  add('milkBar', { key: 'round', label: 'A round for the army — ₹60', desc: 'Stories and songs: every pair in the army gains support points.', ok: run.rupees >= 60 && !used('round') });
  // ── Sage Sanctuary ──
  const freed = SAGE_DUNGEONS.filter((r) => st.beaten.includes(`region:${r}`)).length;
  add('sanctuary', { key: 'bless', label: `Pray at the Sage Sanctuary (${freed}/7 Sages free)`, desc: 'Removes painting curses and blesses the next battle: the army starts with +3 MAG and RES for 3 turns.', ok: !st.blessed && !used('bless') });
  return out;
}

export function doLoruleCamp(run: Run, key: string, rng: RNG, uid?: string, arg?: string): string | null {
  const st = loruleOf(run);
  const opt = loruleCampOptions(run, 'camp').concat(loruleCampOptions(run, 'shop'), loruleCampOptions(run, 'smith')).find((o) => o.key === key);
  if (!opt || !opt.ok) return null;
  const u = uid ? run.roster.find((x) => x.uid === uid) : undefined;
  const done = () => { if (!st.campUsed.includes(key)) st.campUsed.push(key); };
  switch (key) {
    case 'rent': {
      const id = arg && RAVIO_STOCK.includes(arg) && rentable(arg) ? arg : RENTALS[0];
      if (!u || !canWield(u, WEAPONS[id]) || run.rupees < rentPrice(run, id)) return null;
      run.rupees -= rentPrice(run, id);
      u.weapons.push(id); st.rentals.push({ id, uid: u.uid });
      return `${u.name} rents the ${nameOf(id)}. "Take good care of it!"`;
    }
    case 'buy': {
      const id = arg && RAVIO_STOCK.includes(arg) ? arg : RAVIO_STOCK[0];
      if (run.rupees < buyPrice(run, id)) return null;
      run.rupees -= buyPrice(run, id);
      give(run, id);
      return `Bought: ${nameOf(id)}.`;
    }
    case 'moveRental': {
      const [id, from] = (arg ?? '').split('@');
      const r = st.rentals.find((x) => x.id === id && x.uid === from);
      const holder = run.roster.find((x) => x.uid === from);
      if (!r || !u || !holder || u === holder || !canWield(u, WEAPONS[id])) return null;
      holder.weapons.splice(holder.weapons.indexOf(id), 1);
      if (!holder.weapons.length) holder.weapons.push('dekuStick');
      u.weapons.push(id); r.uid = u.uid;
      return `Ravio moves the ${nameOf(id)} from ${holder.name} to ${u.name}, free of charge.`;
    }
    case 'nice': {
      const id = arg && NICE_ITEMS[arg] ? arg : undefined;
      if (!id || st.nice.includes(id) || !owns(run, id)) return null;
      st.nice.push(id); st.niceGiven++;
      return `"Nice!" ${NICE_ITEMS[id]}.`;
    }
    case 'adoptBaby': run.rupees -= 120; done(); run.roster.push(makeHero('babyMaiamai', `p${run.uidCounter++}`, avgLevel(run), rng)); run.stats.recruits++; return 'A Baby Maiamai climbs onto someone\'s shoulder.';
    case 'temper': return temper(run);
    case 'repair': {
      const worn = run.roster.reduce((n, x) => n + Object.values(x.wear ?? {}).filter((w) => w > 0).length, 0);
      run.rupees -= worn * 15;
      for (const x of run.roster) for (const w of Object.keys(x.wear ?? {})) x.wear![w] = 0;
      return 'The Lorulean Forge mends every weapon.';
    }
    case 'milk': run.rupees -= 80; give(run, 'lonLonMilk'); return 'Milk, two servings.';
    case 'potion': run.rupees -= 120; give(run, 'redPotion'); return 'A Red Potion.';
    case 'round': {
      run.rupees -= 60; done();
      const s = (run.supports ??= {});
      for (let i = 0; i < run.roster.length; i++) for (let j = i + 1; j < run.roster.length; j++) { const k = [run.roster[i].uid, run.roster[j].uid].sort().join('|'); s[k] = (s[k] ?? 0) + 2; }
      return 'A round of milk: the army\'s friendships deepen.';
    }
    case 'bless': done(); st.blessed = true; return 'The Sages\' prayer washes over the army: the next battle starts blessed.';
  }
  return null;
}

/** New camp: facility uses reset. */
export function loruleCampVisit(run: Run) {
  if (run.lorule) run.lorule.campUsed = [];
}

/** Top-bar summary of the campaign. */
export function loruleStatus(run: Run): { line: string; kingdom: string; maiamai: number; nice: number; niceReady: number; rentals: number; sages: number; ore: number } {
  const st = loruleOf(run);
  const i = LORULE_ROUTE.indexOf(run.region);
  return {
    line: i >= 0 ? `Region ${st.beaten.filter((x) => x.startsWith('region:')).length + 1}/16` : 'Hyrule', kingdom: KINGDOM[run.region] === 'lorule' ? 'Lorule' : 'Hyrule',
    maiamai: st.maiamai, nice: st.nice.length, niceReady: Math.max(0, niceAvailable(run)), rentals: st.rentals.length,
    sages: SAGE_DUNGEONS.filter((r) => st.beaten.includes(`region:${r}`)).length, ore: count(run, 'masterOre'),
  };
}
