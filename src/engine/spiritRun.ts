// The Spirit Tracks campaign: New Hyrule, from Aboda Village and the castle through the five realms
// (each with its rail map, Lokomo sage and temple), the recurring Tower of Spirits (a little higher on
// every visit), the Dark Realm's demon trains, the Demon Train and the Demon King; train battles on
// the Spirit Tracks, train parts, Elder Niko's Stamp Book, Force Gems that restore branch lines,
// passengers and freight, treasures for Linebeck III, and the cast's after-battle work.

import { BOSSES, GEAR, ITEMS, QUEST_ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import {
  PAIRED_ST_REGIONS, RAIL_MAPS, REALM_SAGE, SPIRIT_FINALE, SPIRIT_REALMS, SPIRIT_ROUTE, SPIRIT_TOWER, ST_ROUTE_BOSSES, ST_TREASURES, TRAIN_PART_IDS, TRAIN_SETS, TREASURE_VALUE,
} from '../content/spirit';
import { isPhantom, spawnEnemyTemplate } from './phantom';
import { addSpiritPartner, isTrain, spState, trainSetLevel } from './spirit';
import type { RNG } from './rng';
import { gainXp, makeHero } from './units';
import type { Battle, BossDef, EventEffect, MapNode, RunMap, Run } from './types';
import type { Reward } from './run';

export interface SpiritRunState {
  /** Highest floor of the Tower of Spirits cleared. */
  towerFloor: number;
  /** Route bosses beaten. */
  beaten: string[];
  /** The Demon King is beaten: the route is done. */
  done?: boolean;
  /** Stamps in Elder Niko's Stamp Book, and the prizes already claimed (5, 10, 15, 20). */
  stamps: number;
  prizes: number[];
  /** Branch lines restored with Force Gems. */
  branches: number;
}

declare module './types' {
  interface Run {
    /** Spirit Tracks campaign state. */
    spirit?: SpiritRunState;
  }
}

export const spiritOf = (run: Run): SpiritRunState => (run.spirit ??= { towerFloor: 0, beaten: [], stamps: 0, prizes: [], branches: 0 });
const q = (run: Run) => (run.questItems ??= []);
const count = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id));
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? QUEST_ITEMS[id]?.name ?? id;
const fortune = (run: Run) => run.roster.some((u) => u.skills.includes('inheritedFortune'));

export const spiritStartRegion = (): string => SPIRIT_ROUTE[0];

function recruitOnce(run: Run, id: string, rng: RNG, lines: string[], why: string) {
  if (!TEMPLATES[id] || run.roster.some((u) => u.templateId === id || TEMPLATES[u.templateId ?? '']?.exclusiveWith?.includes(id))) return;
  const lvl = Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));
  run.roster.push(makeHero(id, `p${run.uidCounter++}`, lvl, rng));
  run.stats.recruits++;
  lines.push(why);
}

/** New Spirit Tracks campaign: the Hero of Spirits, a train, and Niko's Stamp Book if he came along. */
export function spiritStart(run: Run, rng: RNG) {
  spiritOf(run);
  const lines: string[] = [];
  // Small armies pick up the hero on the way (the villains march without him).
  if (!TEMPLATES[run.commanderId]?.rare && run.roster.filter((u) => !isTrain(u)).length < 3) recruitOnce(run, 'heroOfSpirits', rng, lines, 'Link, a young engineer of Aboda Village, sets out for the castle.');
  if (!run.roster.some(isTrain) && !TEMPLATES[run.commanderId]?.rare) recruitOnce(run, 'spiritTrain', rng, lines, 'The Spirit Train waits at Aboda Station.');
  if (run.roster.some((u) => u.skills.includes('livingHistory')) && !q(run).includes('stampBook')) q(run).push('stampBook');
}

/** Is the army on the route (battles stay in their region, no Free-for-All)? */
export function inSpiritRoute(run: Run): boolean {
  return run.campaign === 'spirit' && SPIRIT_ROUTE.includes(run.region) && !spiritOf(run).done;
}

/** The fixed boss of a route region: the first of its bosses not yet beaten. */
export function spiritBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'spirit') return null;
  // The top of a Tower climb is guarded by a Phantom sentinel (Byrne waits for the Tower's own visit).
  if (node.type === 'dungeon' && node.world === SPIRIT_TOWER && run.region !== SPIRIT_TOWER) return BOSSES.phantomVanguard ?? null;
  if (node.type !== 'boss') return null;
  const list = (ST_ROUTE_BOSSES[node.world] ?? []).filter((id) => BOSSES[id]);
  if (!list.length) return null;
  const sp = spiritOf(run);
  return BOSSES[list.find((x) => !sp.beaten.includes(x)) ?? list[0]] ?? null;
}

/** Map decoration: a Tower climb in every realm's map, train battles on the line, and restored branch lines. */
export function spiritDecorateMap(run: Run, map: RunMap, rng: RNG) {
  if (run.campaign !== 'spirit' || !SPIRIT_ROUTE.includes(run.region)) return;
  const rows = Math.max(...map.nodes.map((n) => n.row));
  const realm = SPIRIT_REALMS.includes(run.region) || run.region === 'hyruleCastleST';
  if (realm) {
    // The Tower calls the hero back: one dungeon node climbs it.
    const mid = map.nodes.filter((n) => n.row >= 1 && n.row <= rows - 2 && ['battle', 'event', 'treasure', 'recruit'].includes(n.type));
    const t = mid.length ? rng.pick(mid) : undefined;
    if (t) { t.type = 'dungeon'; t.world = SPIRIT_TOWER; }
  }
  // On the line: one or two battles are fought on the Spirit Tracks.
  if (run.region !== SPIRIT_TOWER) {
    const battles = map.nodes.filter((n) => n.type === 'battle' && n.row >= (run.region === SPIRIT_ROUTE[0] ? 2 : 0));
    for (const n of rng.shuffle(battles).slice(0, run.act <= 1 ? 1 : 2)) n.naval = true;
  }
  // The Dark Realm's lead train and the Demon Train are fought on the rails.
  if (SPIRIT_FINALE.slice(0, 2).includes(run.region)) for (const n of map.nodes) if (n.type === 'boss') n.naval = true;
  // Force Gems restore branch lines: a merchant or a new recruit.
  const sp = spiritOf(run);
  const open = Math.floor(count(run, 'forceGem') / 3);
  while (sp.branches < open) {
    const c = map.nodes.filter((n) => n.row >= 1 && n.row <= rows - 1 && (n.type === 'battle' || n.type === 'event'));
    if (!c.length) break;
    rng.pick(c).type = rng.chance(50) ? 'recruit' : 'shop';
    sp.branches++;
  }
}

/** Tower of Spirits floors: higher on every visit; cleared floors are a shortcut. */
export function spiritEnterDungeon(run: Run, node: MapNode): boolean {
  if (run.campaign !== 'spirit' || node.world !== SPIRIT_TOWER || node.type !== 'dungeon') return false;
  const start = Math.max(1, spiritOf(run).towerFloor);
  run.dungeon = { floor: start, of: Math.min(16, start + 2) };
  return true;
}

/** Battle setup: the Tower's Phantoms, partner bosses and escorts. */
export function spiritBattleSetup(run: Run, b: Battle, rng: RNG) {
  if (b.world === SPIRIT_TOWER) {
    const st = spState(b);
    if (run.dungeon) st.towerFloor = run.dungeon.floor;
    // Few Phantoms on the lower floors, more the higher you climb.
    const cap = run.act <= 1 ? 0 : Math.min(4, 1 + Math.floor((st.towerFloor ?? run.act) / 3));
    let n = 0;
    b.units = b.units.filter((u) => u.team !== 'enemy' || u.isBoss || !isPhantom(u) || ++n <= cap);
  }
  if (run.campaign !== 'spirit' || b.nodeType !== 'boss') return;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!main) return;
  if (PAIRED_ST_REGIONS.includes(b.world)) for (const id of (ST_ROUTE_BOSSES[b.world] ?? []).filter((x) => x !== main.bossId)) addSpiritPartner(b, id, rng);
  const lvl = Math.max(1, main.level - 1);
  const tier = b.bossTier ?? 0;
  if (main.bossId === 'coleBoss') { spawnEnemyTemplate(b, 'keyMaster', main, lvl, rng); if (tier > 0) spawnEnemyTemplate(b, 'bulblin', main, lvl, rng); }
  if (main.bossId === 'byrneBoss') spawnEnemyTemplate(b, 'phantom', main, lvl, rng);
  if (main.bossId === 'bigBlinBoss' && tier > 0) for (let i = 0; i < 2; i++) spawnEnemyTemplate(b, 'miniblin', main, lvl, rng);
  if (main.bossId === 'darkTrainBoss' && b.naval) spawnEnemyTemplate(b, 'darkTrain', main, lvl, rng);
}

const randomPart = (rng: RNG, rare = false): string => {
  const sets = TRAIN_SETS.filter((s) => (rare ? s.rarity !== 'common' : s.rarity !== 'legendary' || rng.chance(15)));
  const set = rng.pick(sets);
  return rng.pick(TRAIN_PART_IDS.filter((id) => id.startsWith(set.id)));
};

function addStamp(run: Run, lines: string[], rng: RNG, n = 1) {
  if (!q(run).includes('stampBook')) return;
  const sp = spiritOf(run);
  sp.stamps += n;
  lines.push(`A station stamp (${sp.stamps} in the Stamp Book).`);
  const prizes: [number, string, string][] = [[5, 'engineersCertificate', 'gear and supplies'], [10, 'shieldOfAntiquity', 'the Shield of Antiquity'], [15, '', 'a rare train part'], [20, 'sacredSpiritGem', 'a legendary treasure']];
  for (const [at, id, what] of prizes) {
    if (sp.stamps < at || sp.prizes.includes(at)) continue;
    sp.prizes.push(at);
    if (at === 5) { run.convoy.push(id, 'redPotion', 'redPotion'); run.rupees += 150; }
    else if (at === 15) run.convoy.push(randomPart(rng, true));
    else run.convoy.push(id);
    lines.push(`${at} stamps! Niko's prize: ${what}.`);
  }
}

/** After a battle: finds, the Tower's floors, the cast's work, route rewards. */
export function spiritAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const st = b.sp;
  if (st?.found.length && won) {
    for (const id of st.found) q(run).push(id);
    lines.push(`Found: ${st.found.map(nameOf).join(', ')}.`);
  }
  if (!won) return lines;
  const sp = spiritOf(run);
  // The Tower of Spirits: a new highest floor opens a shortcut and gives up a treasure.
  if (st?.towerFloor && st.towerFloor > sp.towerFloor) {
    sp.towerFloor = st.towerFloor;
    const t = rng.pick(ST_TREASURES.slice(0, 5));
    q(run).push(t);
    lines.push(`Tower floor ${st.towerFloor} cleared: a shortcut opens, and a treasure (${nameOf(t)}).`);
    if (st.towerFloor % 3 === 0) { q(run).push('forceGem'); lines.push('A Force Gem glows on the altar.'); }
  }
  // Linebeck III's Inherited Fortune.
  if (fortune(run)) { const r = Math.round(b.rewardRupees * 0.3); if (r > 0) { run.rupees += r; lines.push(`Inherited Fortune: +₹${r}.`); } }
  // Generations of Adventure: more treasure.
  if (b.groupSupports?.includes('generationsOfAdventure')) { const r = Math.round(b.rewardRupees * 0.25); run.rupees += r; lines.push(`Generations of Adventure: +₹${r}.`); }
  // The Golden set pays.
  const golden = Math.max(0, ...run.roster.filter(isTrain).map((v) => trainSetLevel(v, 'golden')));
  if (golden) { const r = Math.round(b.rewardRupees * (golden === 2 ? 0.5 : 0.25)); run.rupees += r; lines.push(`Golden train parts: +₹${r}.`); }
  // Alfonzo mends the army's weapons.
  const smith = run.roster.find((u) => u.skills.includes('masterEngineer'));
  if (smith) {
    const amt = run.bonus === 'royalEngineers' ? 6 : 5;
    let n = 0;
    for (const u of run.roster) for (const w of Object.keys(u.wear ?? {})) if ((u.wear![w] ?? 0) > 0) { u.wear![w] = Math.max(0, u.wear![w] - amt); n++; }
    if (n) lines.push(`${smith.name} mends ${n} worn weapon${n > 1 ? 's' : ''}.`);
  }
  // Elder Niko's Living History and the Teacher's Sword Training: a little more experience.
  const fought = new Set(b.units.filter((u) => u.team === 'player').map((u) => u.uid));
  if (run.roster.some((u) => u.skills.includes('livingHistory'))) {
    for (const u of run.roster) if (fought.has(u.uid)) gainXp(u, 6, rng);
    const s = run.supports ?? {};
    for (const k of Object.keys(s)) if (s[k] > 0 && k.split('|').every((x) => fought.has(x))) s[k] += 1;
    lines.push('Niko\'s stories by the fire: everyone learns a little more.');
  }
  if (run.roster.some((u) => u.skills.includes('swordTraining'))) for (const u of run.roster) if (fought.has(u.uid) && WEAPONS[u.weapons[0]]?.type === 'sword') gainXp(u, 5, rng);
  if (run.campaign === 'spirit' || SPIRIT_ROUTE.includes(b.world)) lines.push(...routeRewards(run, b, rng));
  return lines;
}

const NEXT_MAP: Record<string, string> = { hyruleCastleST: 'forestRailMap', forestRealm: 'snowRailMap', snowRealm: 'oceanRailMap', oceanRealm: 'fireRailMap', fireRealm: 'compassOfLight' };

function routeRewards(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  if (b.nodeType !== 'boss') return lines;
  const sp = spiritOf(run);
  const list = ST_ROUTE_BOSSES[b.world] ?? [];
  if (!list.length) return lines;
  const beatenNow = b.fallen.filter((u) => u.team === 'enemy' && u.isBoss).map((u) => u.bossId ?? u.templateId ?? '').filter((id) => list.includes(id));
  if (!beatenNow.length) beatenNow.push(list.find((x) => !sp.beaten.includes(x)) ?? list[0]);
  const first = beatenNow.some((id) => !sp.beaten.includes(id));
  for (const id of beatenNow) if (!sp.beaten.includes(id)) sp.beaten.push(id);
  if (!first) return lines;
  // Every station on the route stamps the book, and every boss leaves a Force Gem.
  addStamp(run, lines, rng);
  q(run).push('forceGem');
  lines.push(`A Force Gem (${count(run, 'forceGem')}).`);
  const map = NEXT_MAP[b.world];
  if (map && !q(run).includes(map)) { q(run).push(map); lines.push(`The ${nameOf(map)} — new tracks appear.`); }
  // The realms' sages join once their temples are cleansed.
  const sage = REALM_SAGE[b.world];
  if (sage) recruitOnce(run, sage, rng, lines, `${TEMPLATES[sage]?.name} rolls up: "The tracks are whole again. I'm coming with you."`);
  // The story's companions and the sacred gear.
  if (b.world === 'abodaVillage') { if (!owns(run, 'spiritFlute')) { run.convoy.push('spiritFlute'); lines.push('An old Lokomo panpipe turns up at the station: the Spirit Flute.'); } recruitOnce(run, 'alfonzo', rng, lines, 'Alfonzo climbs into the cab: "You\'ll need an engineer who can fight."'); }
  if (b.world === 'hyruleCastleST') recruitOnce(run, 'zeldaST', rng, lines, 'Zelda\'s spirit catches up with you: "Cole took my body. I\'m not letting you go alone."');
  if (b.world === SPIRIT_TOWER) {
    if (!owns(run, 'lokomoSword')) { run.convoy.push('lokomoSword'); lines.push('Anjean entrusts you with the Lokomo Sword.'); }
    recruitOnce(run, 'anjean', rng, lines, 'Anjean joins you: "My student has gone astray. I will see this through."');
  }
  if (b.world === 'darkRealm' && !owns(run, 'bowOfLight') && WEAPONS.bowOfLight) { run.convoy.push('bowOfLight'); lines.push('The Lokomo grant Zelda the Bow of Light.'); }
  if (b.world === 'demonTrainLine') recruitOnce(run, 'byrne', rng, lines, 'Byrne, broken and ashamed, turns on Malladus: "Let me make this right."');
  const text: Record<string, string> = {
    hyruleCastleST: 'Cole escapes with Zelda\'s body — towards the Tower of Spirits.',
    sandRealm: 'The last realm\'s tracks are restored. The Tower of Spirits stands whole again.',
    towerOfSpirits: 'Byrne falls back; beneath the Tower, the Demon King stirs.',
    darkRealm: 'The lead demon train is derailed. The Demon Train is coming.',
    demonTrainLine: 'The Demon Train is wrecked — but Malladus is free, and he wears Zelda\'s body.',
    sacredBattlefield: 'Malladus is gone. Zelda is herself again, and the Spirit Tracks run quiet and bright.',
  };
  if (text[b.world]) lines.push(text[b.world]);
  if (b.world === 'sacredBattlefield') sp.done = true;
  return lines;
}

/** Region choices after a boss on the route. Empty: the ordinary choice of regions. */
export function spiritRegionOptions(run: Run, rng: RNG): string[] {
  const sp = spiritOf(run);
  const r = run.region;
  const i = SPIRIT_ROUTE.indexOf(r);
  if (i < 0) return [];
  if (sp.done || i === SPIRIT_ROUTE.length - 1) return rng.shuffle(SPIRIT_ROUTE.filter((x) => x !== r && x !== SPIRIT_TOWER)).slice(0, 3);
  const next = SPIRIT_ROUTE[i + 1];
  // A rail map opens each realm's tracks; without it the army goes round again to find it.
  const map = RAIL_MAPS[next];
  if (map && !(run.questItems ?? []).includes(map)) return [r];
  return [next];
}

/** Spirit Tracks event effects. */
export function applySpiritEffect(run: Run, e: Extract<EventEffect, { kind: 'spirit' }>, rng: RNG): string | null {
  const qi = q(run);
  const take = (id: string) => { const i = qi.indexOf(id); if (i < 0) return false; qi.splice(i, 1); return true; };
  const lines: string[] = [];
  switch (e.op) {
    case 'buyPart': { const id = randomPart(rng); run.convoy.push(id); return `${nameOf(id)}.`; }
    case 'tradeTreasures': {
      const held = ST_TREASURES.filter((t) => qi.includes(t));
      let n = 0;
      for (const t of ST_TREASURES) while (n < 3 && take(t)) n++;
      if (n < 3) { for (let k = 0; k < n; k++) qi.push(held[k] ?? held[0]); return 'You need three treasures to trade.'; }
      const id = randomPart(rng, true);
      run.convoy.push(id);
      return `Three treasures for the ${nameOf(id)}.`;
    }
    case 'sellTreasures': {
      let total = 0, n = 0;
      run.questItems = qi.filter((id) => { if (TREASURE_VALUE[id]) { total += TREASURE_VALUE[id]; n++; return false; } return true; });
      total = Math.round(total * (fortune(run) ? 1.3 : 1));
      run.rupees += total;
      return n ? `Sold ${n} treasure${n > 1 ? 's' : ''} for ₹${total}.` : 'You have no treasures to sell.';
    }
    case 'stamp': addStamp(run, lines, rng); return lines.join(' ') || 'You need the Stamp Book.';
    case 'passenger': qi.push('passengerTicket'); return 'A passenger is aboard. Take them to the next station.';
    case 'freight': qi.push('freightCargo'); return 'Freight loaded. Deliver it to a station master.';
    case 'deliverPassenger': {
      let n = 0;
      while (take('passengerTicket')) n++;
      const r = Math.round(n * (120 + run.act * 30) * (fortune(run) ? 1.3 : 1));
      run.rupees += r;
      if (rng.chance(40)) { qi.push('forceGem'); lines.push('One of them gives you a Force Gem.'); }
      return [`${n} passenger${n === 1 ? '' : 's'} delivered: ₹${r}.`, ...lines].join(' ');
    }
    case 'deliverFreight': {
      take('freightCargo');
      const r = Math.round((200 + run.act * 40) * (fortune(run) ? 1.3 : 1));
      run.rupees += r;
      const id = randomPart(rng);
      run.convoy.push(id);
      return `Delivered intact: ₹${r} and a ${nameOf(id)}.`;
    }
    case 'duet': {
      const realm = SPIRIT_REALMS.includes(run.region) ? run.region : rng.pick(SPIRIT_REALMS);
      const musician = run.roster.some((u) => u.race === 'lokomo' || u.weapons.includes('spiritFlute')) || run.convoy.includes('spiritFlute');
      if (!musician) return 'You have no one to play with — you need the Spirit Flute or a Lokomo.';
      qi.push('forceGem');
      const sage = REALM_SAGE[realm];
      if (sage && rng.chance(50)) recruitOnce(run, sage, rng, lines, `${TEMPLATES[sage]?.name} rolls after you, still playing.`);
      return [`The duet restores a stretch of track: a Force Gem (${count(run, 'forceGem')}).`, ...lines].join(' ');
    }
    case 'sage': {
      const sage = REALM_SAGE[run.region] ?? rng.pick(Object.values(REALM_SAGE));
      recruitOnce(run, sage, rng, lines, `${TEMPLATES[sage]?.name} joins you.`);
      return lines.join(' ') || 'The sage is already with you.';
    }
    case 'lokomoSword': {
      if (owns(run, 'lokomoSword')) return 'You already carry the Lokomo Sword.';
      for (let i = 0; i < 3; i++) take('forceGem');
      run.convoy.push('lokomoSword');
      return 'Three Force Gems for the Lokomo Sword.';
    }
  }
  return null;
}

/** Treasure nodes in the spirit campaign: Inherited Fortune, and Force Gems in the ballast. */
export function spiritTreasure(run: Run, rng: RNG, ev: { rewards: Reward[]; rupees: number }): string[] {
  if (run.campaign !== 'spirit') return [];
  const lines: string[] = [];
  if (fortune(run)) ev.rupees = Math.round(ev.rupees * 1.3);
  if (rng.chance(25)) { q(run).push('forceGem'); lines.push('A Force Gem glints in the chest.'); }
  if (rng.chance(30)) { const id = randomPart(rng); ev.rewards.unshift({ kind: 'gear', id }); }
  return lines;
}

/** Top-bar summary of the campaign. */
export function spiritStatus(run: Run): { line: string; stamps: number; book: boolean; gems: number; floor: number; maps: number; parts: number } {
  const sp = spiritOf(run);
  const realm = SPIRIT_REALMS.includes(run.region) ? run.region.replace('Realm', ' Realm').replace(/^./, (c) => c.toUpperCase()) : run.region === SPIRIT_TOWER ? 'The Tower' : 'New Hyrule';
  const parts = [...run.convoy, ...run.roster.flatMap((u) => Object.values(u.gear))].filter((id) => !!id && TRAIN_PART_IDS.includes(id)).length;
  return {
    line: realm, stamps: sp.stamps, book: (run.questItems ?? []).includes('stampBook'), gems: count(run, 'forceGem'), floor: sp.towerFloor,
    maps: Object.values(RAIL_MAPS).filter((m) => (run.questItems ?? []).includes(m)).length, parts,
  };
}
