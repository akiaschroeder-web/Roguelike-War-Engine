// The Phantom Hourglass campaign: the World of the Ocean King, from Mercay Island across the four
// sea charts to the Final Temple, Bellum's Ghost Ship and the duel with Bellumbeck; the Phantom
// Hourglass's reserve (Sands of Hours), the Temple of the Ocean King's floors and shortcuts,
// Spirit Gems and the Spirits' levels, the three metals and the Phantom Sword, treasure and salvage,
// steamship parts, sea crossings fought at sea, and the pending units' after-battle work.

import { BOSSES, GEAR, ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import {
  CHART_FOR, OCEAN_KING_TEMPLE, PAIRED_PH_REGIONS, PH_ROUTE_BOSSES, PH_TREASURES, PHANTOM_METALS, PHANTOM_ROUTE, SEA_CHARTS, SHIP_PART_IDS, SHIP_SETS, SPIRIT_GEMS,
} from '../content/phantom';
import { addPhantomPartner, isPhantom, phState, setLevel, spawnEnemyTemplate } from './phantom';
import { isVessel } from './naval';
import type { RNG } from './rng';
import { gainXp, makeHero } from './units';
import type { Battle, BossDef, EventEffect, MapNode, RunMap, Run } from './types';
import type { Reward } from './run';

export interface PhantomRunState {
  /** Deepest floor of the Temple of the Ocean King cleared. */
  templeFloor: number;
  /** Route bosses beaten. */
  beaten: string[];
  /** The duel is won: the route is done. */
  done?: boolean;
}

declare module './types' {
  interface Run {
    /** Phantom Hourglass campaign state (the Hourglass and gems also follow other campaigns). */
    phantom?: PhantomRunState;
  }
}

export const phantomOf = (run: Run): PhantomRunState => (run.phantom ??= { templeFloor: 0, beaten: [] });
const q = (run: Run) => (run.questItems ??= []);
const count = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id));
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? id;
const MAX_ENERGY = 60;

/** The Phantom Hourglass's reserve: 10, +5 for each Sands of Hours. */
export const hourglassMax = (run: Run) => Math.min(MAX_ENERGY, 10 + 5 * count(run, 'sandsOfHours'));
/** A Spirit's level from its gems: 10 → 1, 20 → 2. */
export const spiritLevel = (run: Run, spirit: 'leaf' | 'neri' | 'ciela') => { const n = count(run, SPIRIT_GEMS[spirit]); return n >= 20 ? 2 : n >= 10 ? 1 : 0; };

export const phantomStartRegion = (): string => PHANTOM_ROUTE[0];

function recruitOnce(run: Run, id: string, rng: RNG, lines: string[], why: string) {
  if (!TEMPLATES[id] || run.roster.some((u) => u.templateId === id || TEMPLATES[u.templateId ?? '']?.exclusiveWith?.includes(id))) return;
  const lvl = Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));
  run.roster.push(makeHero(id, `p${run.uidCounter++}`, lvl, rng));
  run.stats.recruits++;
  lines.push(why);
}

/** New Phantom Hourglass campaign: the Hourglass, the first sea chart, the Hero of Winds and a ship. */
export function phantomStart(run: Run, rng: RNG) {
  phantomOf(run);
  for (const id of ['phantomHourglass', 'southwesternSeaChart']) if (!q(run).includes(id)) q(run).push(id);
  const lines: string[] = [];
  recruitOnce(run, 'heroOfWinds', rng, lines, 'The Hero of Winds washes ashore on Mercay Island.');
  if (!run.roster.some(isVessel)) recruitOnce(run, 'ssLinebeck', rng, lines, 'The S.S. Linebeck waits at the dock.');
}

/** Is the army on the route (battles stay in their region, no Free-for-All)? */
export function inPhantomRoute(run: Run): boolean {
  return run.campaign === 'phantom' && PHANTOM_ROUTE.includes(run.region) && !phantomOf(run).done;
}

/** The fixed boss of a route region: the first of its bosses not yet beaten. */
export function phantomBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'phantom') return null;
  // The bottom of a Temple visit is guarded by a Phantom Vanguard (Bellum waits for the Final Temple).
  if (node.type === 'dungeon' && node.world === OCEAN_KING_TEMPLE) return BOSSES.phantomVanguard ?? null;
  if (node.type !== 'boss') return null;
  const list = (PH_ROUTE_BOSSES[node.world] ?? []).filter((id) => BOSSES[id]);
  if (!list.length) return null;
  const ph = phantomOf(run);
  return BOSSES[list.find((x) => !ph.beaten.includes(x)) ?? list[0]] ?? null;
}

/** Map decoration: a Temple of the Ocean King floor in every island's map, and sea crossings fought at sea. */
export function phantomDecorateMap(run: Run, map: RunMap, rng: RNG) {
  if (run.campaign !== 'phantom' || !PHANTOM_ROUTE.includes(run.region)) return;
  const island = run.region !== OCEAN_KING_TEMPLE && run.region !== 'finalDuel' && run.region !== 'bellumsWaters';
  const rows = Math.max(...map.nodes.map((n) => n.row));
  if (island) {
    // The Temple calls the hero back: one dungeon node descends into it.
    const mid = map.nodes.filter((n) => n.row >= 1 && n.row <= rows - 2 && ['battle', 'event', 'treasure', 'recruit'].includes(n.type));
    const t = mid.length ? rng.pick(mid) : undefined;
    if (t) { t.type = 'dungeon'; t.world = OCEAN_KING_TEMPLE; }
    // Steaming in: one of the first battles is fought at sea.
    const first = map.nodes.filter((n) => n.row <= 1 && n.type === 'battle');
    if (first.length) rng.pick(first).naval = true;
  }
  // Jolene runs you down at sea off Cannon Island.
  if (run.region === 'cannonIsland') for (const n of map.nodes) if (n.type === 'boss') n.naval = true;
}

/** Temple of the Ocean King floors: deeper on every visit; cleared floors are a shortcut. */
export function phantomEnterDungeon(run: Run, node: MapNode): boolean {
  if (run.campaign !== 'phantom' || node.world !== OCEAN_KING_TEMPLE || node.type !== 'dungeon') return false;
  const start = Math.max(1, phantomOf(run).templeFloor);
  run.dungeon = { floor: start, of: Math.min(14, start + 2) };
  return true;
}

/** Battle setup: the Hourglass's time, the Spirits' levels, partner bosses, escorts and loadouts. */
export function phantomBattleSetup(run: Run, b: Battle, rng: RNG) {
  const st = phState(b);
  if ((run.questItems ?? []).includes('phantomHourglass')) { st.hourglass = true; st.max = hourglassMax(run); st.energy = st.max; }
  st.levels = { leaf: spiritLevel(run, 'leaf'), neri: spiritLevel(run, 'neri'), ciela: spiritLevel(run, 'ciela') };
  if (b.world === OCEAN_KING_TEMPLE && run.dungeon) st.templeFloor = run.dungeon.floor;
  // The Temple's Phantoms: few on the first floors, more the deeper you go.
  if (b.world === OCEAN_KING_TEMPLE) {
    const cap = run.act <= 1 ? 0 : Math.min(4, 1 + Math.floor((st.templeFloor ?? run.act) / 3));
    let n = 0;
    b.units = b.units.filter((u) => u.team !== 'enemy' || u.isBoss || !isPhantom(u) || ++n <= cap);
  }
  // Ciela's level: the army's swords fire beams.
  if (st.levels.ciela && b.units.some((u) => u.team === 'player' && u.templateId === 'ciela')) for (const u of b.units) if (u.team === 'player') u.phCielaBeam = st.levels.ciela;
  // Neri at level 2: a barrier on everyone next to her at the start.
  if (st.levels.neri >= 2) for (const n of b.units.filter((u) => u.team === 'player' && u.templateId === 'neri')) for (const a of b.units) if (a.team === 'player' && a !== n && Math.abs(a.x - n.x) + Math.abs(a.y - n.y) <= 2) a.buffs.push({ id: 'neriBarrier', name: 'Sacred Barrier', turns: 1, barrier: true });
  // The Bombchu Bag: bigger stacks.
  if ((run.questItems ?? []).includes('bombchuBagPH')) for (const u of b.units) if (u.team === 'player') for (const p of u.pack) if (p.id === 'bombchu') p.uses++;
  if (run.campaign !== 'phantom' || b.nodeType !== 'boss') return;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  if (!main) return;
  // The Gleeok of the Isle of Frost breathes both fire and ice.
  if (main.bossId === 'gleeokFrost' && !main.weapons.includes('gleeokFlameBreath') && WEAPONS.gleeokFlameBreath) main.weapons.push('gleeokFlameBreath');
  if (main.bossId === 'gleeokFlame' && !main.weapons.includes('gleeokFrostBreath') && WEAPONS.gleeokFrostBreath) main.weapons.push('gleeokFrostBreath');
  if (PAIRED_PH_REGIONS.includes(b.world)) {
    for (const id of (PH_ROUTE_BOSSES[b.world] ?? []).filter((x) => x !== main.bossId)) {
      const e = addPhantomPartner(b, id, rng);
      if (e?.bossId === 'gleeokFlame' && WEAPONS.gleeokFrostBreath) e.weapons.push('gleeokFrostBreath');
    }
  }
  // Escorts: the Cobble Knights with their king, Jolene's Ship, the Phantoms' guard.
  const lvl = Math.max(1, main.level - 1);
  if (main.bossId === 'kingMutohBoss') for (const id of ['bremeur', 'doylan', 'max']) spawnEnemyTemplate(b, id, main, lvl, rng);
  if (main.bossId === 'joleneBoss' && b.naval) spawnEnemyTemplate(b, 'jolenesShip', main, lvl, rng);
  if (main.bossId === 'phantomVanguard' && (b.bossTier ?? 0) > 0) for (const id of ['swiftPhantom', 'phantomEye']) spawnEnemyTemplate(b, id, main, lvl, rng);
  if (main.bossId === 'bellumbeckBoss') spawnEnemyTemplate(b, 'phantomEye', main, lvl, rng);
}

function addGems(run: Run, n: number, rng: RNG): string {
  const kinds = Object.values(SPIRIT_GEMS);
  const k = rng.pick(kinds);
  for (let i = 0; i < n; i++) q(run).push(k);
  return `${n} ${k === 'powerSpiritGem' ? 'Power' : k === 'wisdomSpiritGem' ? 'Wisdom' : 'Courage'} Gem${n > 1 ? 's' : ''}`;
}
const randomPart = (rng: RNG, rare = false): string => {
  const sets = SHIP_SETS.filter((s) => (rare ? s.rarity !== 'common' : s.rarity !== 'legendary' || rng.chance(15)));
  const set = rng.pick(sets);
  return rng.pick(SHIP_PART_IDS.filter((id) => id.startsWith(set.id)));
};

/** After a battle: finds, the Temple's floors, route rewards, the Spirits, the pending units' work. */
export function phantomAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const st = b.ph;
  if (st?.found.length && won) {
    for (const id of st.found) q(run).push(id);
    const names = st.found.map((id) => (id === 'sandsOfHours' ? 'Sands of Hours' : id.replace(/SpiritGem$/, ' Gem').replace(/([A-Z])/g, ' $1').trim()));
    lines.push(`Found: ${names.join(', ')}.`);
  }
  if (!won) return lines;
  const ph = phantomOf(run);
  // The Temple of the Ocean King: a new deepest floor opens a shortcut and gives up its treasure.
  if (st?.templeFloor && st.templeFloor > ph.templeFloor) {
    ph.templeFloor = st.templeFloor;
    const t = rng.pick(PH_TREASURES.slice(0, 8));
    q(run).push(t);
    lines.push(`Temple floor ${st.templeFloor} cleared: a shortcut opens, and a treasure (${nameOf(t)}).`);
    if (st.templeFloor % 2 === 0) { q(run).push('sandsOfHours'); lines.push('The Sands of Hours glitter on the altar: the Hourglass grows.'); }
  }
  // Fortune Seeker: 30% more from the haul.
  if (run.bonus === 'fortuneSeeker' || run.roster.some((u) => u.skills.includes('fortuneSeeker'))) {
    const r = Math.round(((b.bonusRupees ?? 0) + b.rewardRupees * 0.3) * 0.3);
    if (r > 0) { run.rupees += r; lines.push(`Fortune Seeker: +₹${r}.`); }
  }
  // The Golden set pays.
  const golden = Math.max(0, ...run.roster.filter(isVessel).map((v) => setLevel(v, 'golden')));
  if (golden) { const r = Math.round(b.rewardRupees * (golden === 2 ? 0.5 : 0.25)); run.rupees += r; lines.push(`Golden ship parts: +₹${r}.`); }
  // Zauz's Sacred Forging.
  const smith = run.roster.find((u) => u.skills.includes('sacredForging') || u.weapons.some((w) => WEAPONS[w]?.ph?.includes('repair')));
  if (smith) {
    const amt = smith.weapons.includes('zauzsForgingHammer') ? 10 : 5;
    let n = 0;
    for (const u of run.roster) for (const w of Object.keys(u.wear ?? {})) if ((u.wear![w] ?? 0) > 0) { u.wear![w] = Math.max(0, u.wear![w] - amt); n++; }
    if (n) lines.push(`${smith.name} repairs ${n} worn weapon${n > 1 ? 's' : ''}.`);
  }
  // Max's Knight's Trial.
  if (b.nodeType === 'elite' || b.nodeType === 'boss') for (const u of run.roster.filter((x) => x.skills.includes('knightsTrial'))) gainXp(u, 20, rng);
  // The pending units: the Potion Shop Lady's Brew, the Subrosian Miner's ore and the Chef's soup.
  if (run.roster.some((u) => u.skills.includes('oldRecipes'))) {
    const ing = ['magicMushroom', 'redChuJelly', 'blueChuJelly', 'greenChuJelly', 'sleepyToadstool', 'mushroomSpores'];
    const i = run.convoy.findIndex((id) => ing.includes(id));
    if (i >= 0) { const was = run.convoy.splice(i, 1)[0]; const p = rng.pick(['redPotion', 'greenPotion', 'bluePotion']); run.convoy.push(p); lines.push(`The Potion Shop Lady brews ${nameOf(was)} into a ${nameOf(p)}.`); }
  }
  if (run.roster.some((u) => u.skills.includes('oreHunter')) && rng.chance(50)) { const n = rng.int(1, 3); for (let i = 0; i < n; i++) q(run).push('oreChunk'); lines.push(`The Subrosian Miner digs up ${n} Ore Chunk${n > 1 ? 's' : ''}.`); }
  if (run.roster.some((u) => u.skills.includes('lavaCooking')) && rng.chance(40) && ITEMS.lavaSoup) { run.convoy.push('lavaSoup'); lines.push('The Subrosian Chef cooks a Lava Soup.'); }
  if (run.campaign === 'phantom' || PHANTOM_ROUTE.includes(b.world)) lines.push(...routeRewards(run, b, rng));
  return lines;
}

const METAL_OF: Record<string, string> = { goronIsland: 'crimsonine', isleOfFrost: 'azurine', isleOfTheDead: 'aquanine' };
const CHART_AFTER: Record<string, string> = { molidaIsland: 'northwesternSeaChart', goronIsland: 'northeasternSeaChart', isleOfTheDead: 'southeasternSeaChart' };

function routeRewards(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  if (b.nodeType !== 'boss') return lines;
  const ph = phantomOf(run);
  const list = PH_ROUTE_BOSSES[b.world] ?? [];
  if (!list.length) return lines;
  const beatenNow = b.fallen.filter((u) => u.team === 'enemy' && u.isBoss).map((u) => u.bossId ?? u.templateId ?? '').filter((id) => list.includes(id));
  if (!beatenNow.length) beatenNow.push(list.find((x) => !ph.beaten.includes(x)) ?? list[0]);
  const first = beatenNow.some((id) => !ph.beaten.includes(id));
  for (const id of beatenNow) if (!ph.beaten.includes(id)) ph.beaten.push(id);
  if (!first) return lines;
  // Every temple boss: Spirit Gems and Sands of Hours.
  lines.push(`${addGems(run, 3, rng)} and the Sands of Hours.`);
  q(run).push('sandsOfHours');
  const metal = METAL_OF[b.world];
  if (metal && !q(run).includes(metal)) { q(run).push(metal); lines.push(`A sacred metal: ${nameOf(metal)} (${PHANTOM_METALS.filter((m) => q(run).includes(m)).length}/3).`); }
  const chart = CHART_AFTER[b.world];
  if (chart && !q(run).includes(chart)) { q(run).push(chart); lines.push(`The ${nameOf(chart)} — a new sea opens.`); }
  // Zauz forges the Phantom Sword once the three metals are in hand.
  if (b.world === 'zauzsIsland' && PHANTOM_METALS.every((m) => q(run).includes(m)) && !owns(run, 'phantomSword')) {
    for (const m of PHANTOM_METALS) q(run).splice(q(run).indexOf(m), 1);
    run.convoy.push('phantomSword');
    lines.push('Zauz forges Crimsonine, Azurine and Aquanine into the Phantom Sword. The Phantoms can be beaten now.');
  }
  // The story's companions.
  if (b.world === 'mercayIsland') recruitOnce(run, 'ciela', rng, lines, 'Ciela flutters out of the Temple: "Wake up! You can\'t just lie there!" She joins you.');
  if (b.world === 'ghostShipPH') recruitOnce(run, 'tetra', rng, lines, 'Tetra is free of the Ghost Ship — and she joins you.');
  if (b.world === 'isleOfTheDead') recruitOnce(run, 'kingMutoh', rng, lines, 'King Mutoh is satisfied. The ancient king lends you his strength.');
  if (b.world === 'isleOfRuins') recruitOnce(run, 'oshus', rng, lines, 'Oshus has been watching. "It is time I told you who I am."');
  const text: Record<string, string> = {
    templeOfTheOceanKing: 'Bellum is driven from the Temple of the Ocean King — but its Ghost Ship rises from the sea.',
    bellumsWaters: 'The Ghost Ship sinks. On its deck, something has taken hold of Linebeck.',
    finalDuel: 'Bellum is gone. The Ocean King is free, the fog lifts, and the World of the Ocean King sinks back into a dream.',
  };
  if (text[b.world]) lines.push(text[b.world]);
  if (b.world === 'finalDuel') { ph.done = true; recruitOnce(run, 'linebeck', rng, lines, 'Linebeck, himself again, joins you — "for a share of the treasure".'); }
  return lines;
}

/** Region choices after a boss on the route. Empty: the ordinary choice of regions. */
export function phantomRegionOptions(run: Run, rng: RNG): string[] {
  const ph = phantomOf(run);
  const r = run.region;
  const i = PHANTOM_ROUTE.indexOf(r);
  if (i < 0) return [];
  if (ph.done || i === PHANTOM_ROUTE.length - 1) return rng.shuffle(PHANTOM_ROUTE.filter((x) => x !== r && x !== OCEAN_KING_TEMPLE)).slice(0, 3);
  const next = PHANTOM_ROUTE[i + 1];
  // A sea chart opens each new sea; without it the army goes back to the Temple to find the way.
  const chart = CHART_FOR[next];
  if (chart && !(run.questItems ?? []).includes(chart)) return [r];
  return [next];
}

/** Phantom Hourglass event effects. */
export function applyPhantomEffect(run: Run, e: Extract<EventEffect, { kind: 'phantom' }>, rng: RNG): string | null {
  const qi = q(run);
  const take = (id: string) => { const i = qi.indexOf(id); if (i < 0) return false; qi.splice(i, 1); return true; };
  switch (e.op) {
    case 'buyPart': { const id = randomPart(rng); run.convoy.push(id); return `${nameOf(id)}.`; }
    case 'tradeTreasures': {
      const held = PH_TREASURES.filter((t) => qi.includes(t));
      let n = 0;
      for (const t of PH_TREASURES) while (n < 3 && take(t)) n++;
      if (n < 3) { for (let k = 0; k < n; k++) qi.push(held[k] ?? held[0]); return 'You need three treasures to trade.'; }
      const id = randomPart(rng, true);
      run.convoy.push(id);
      return `Three treasures for the ${nameOf(id)}.`;
    }
    case 'sellTreasures': {
      const VALUE: Record<string, number> = { regalNecklace: 300, pearlNecklace: 150, pinkCoral: 120, whitePearlLoop: 200, darkPearlLoop: 400, zoraScale: 180, rutoCrown: 500, goronAmber: 160, phantomEssence: 100, bellumsEye: 800 };
      let total = 0, n = 0;
      run.questItems = qi.filter((id) => { if (VALUE[id]) { total += VALUE[id]; n++; return false; } return true; });
      const mult = run.bonus === 'fortuneSeeker' || run.roster.some((u) => u.skills.includes('fortuneSeeker')) ? 1.3 : 1;
      total = Math.round(total * mult);
      run.rupees += total;
      return n ? `Sold ${n} treasure${n > 1 ? 's' : ''} for ₹${total}.` : 'You have no treasures to sell.';
    }
    case 'sands': qi.push('sandsOfHours'); if (!qi.includes('phantomHourglass')) qi.push('phantomHourglass'); return `The Phantom Hourglass now holds ${hourglassMax(run)} time.`;
    case 'gem': return `${addGems(run, 1 + rng.int(0, 2), rng)}.`;
    case 'salvage': {
      const n = e.amount ?? 1;
      const finds: string[] = [];
      const mult = run.bonus === 'fortuneSeeker' || run.roster.some((u) => u.skills.includes('fortuneSeeker')) ? 1.3 : 1;
      const rupees = Math.round((80 + run.act * 40) * n * mult);
      run.rupees += rupees;
      for (let i = 0; i < n; i++) {
        const roll = rng.int(0, 99);
        if (roll < 40) { const id = randomPart(rng); run.convoy.push(id); finds.push(nameOf(id)); }
        else if (roll < 65) finds.push(addGems(run, 1, rng));
        else if (roll < 80) { qi.push('sandsOfHours'); finds.push('the Sands of Hours'); }
        else { const t = rng.pick(PH_TREASURES.slice(0, 8)); qi.push(t); finds.push(nameOf(t)); }
      }
      return `₹${rupees} and ${finds.join(', ')}.`;
    }
    case 'fish': {
      const roll = rng.int(0, 99);
      if (roll < 30) { run.convoy.push('lavaSoup'); return 'A huge Loovar: the army feasts (a Lava Soup\'s worth of leftovers).'; }
      if (roll < 60) { const t = rng.pick(['pinkCoral', 'zoraScale', 'pearlNecklace']); qi.push(t); return `Something shiny on the hook: ${nameOf(t)}.`; }
      if (roll < 85) { run.rupees += 250; return 'A Rusty Swordfish — a collector pays ₹250 for it.'; }
      qi.push('sandsOfHours');
      return 'The legendary Neptoona! Inside its belly: the Sands of Hours.';
    }
    case 'forgeSword': {
      if (!PHANTOM_METALS.every((m) => qi.includes(m))) return 'You need all three metals.';
      for (const m of PHANTOM_METALS) take(m);
      run.convoy.push('phantomSword');
      return 'The Phantom Sword!';
    }
    case 'craftPhantom': {
      let n = 0;
      while (n < 3 && take('phantomEssence')) n++;
      const id = owns(run, 'phantomHelmet') ? rng.pick(['phantomArmor', 'swiftPhantomArmor', 'warpPhantomArmor', 'phantomGreatsword']) : 'phantomHelmet';
      run.convoy.push(id);
      return `${nameOf(id)}.`;
    }
    case 'mixPotions': {
      const reds = run.convoy.filter((id) => id === 'redPotion' || id === 'greenPotion');
      if (reds.length < 2) return 'You need two potions in the convoy.';
      for (const id of reds.slice(0, 2)) run.convoy.splice(run.convoy.indexOf(id), 1);
      run.convoy.push('bluePotion');
      return 'Two potions become one Blue Potion.';
    }
    case 'sellOre': {
      let n = 0;
      while (take('oreChunk')) n++;
      run.rupees += n * 40;
      return `${n} Ore Chunk${n > 1 ? 's' : ''} for ₹${n * 40}.`;
    }
  }
  return null;
}

/** Treasure nodes in the phantom campaign: a Treasure Chart turns them into salvage (ship parts and gems). */
export function phantomTreasure(run: Run, rng: RNG, ev: { rewards: Reward[]; rupees: number }): string[] {
  if (run.campaign !== 'phantom') return [];
  const lines: string[] = [];
  const qi = q(run);
  if (run.bonus === 'fortuneSeeker' || run.roster.some((u) => u.skills.includes('fortuneSeeker'))) ev.rupees = Math.round(ev.rupees * 1.3);
  const i = qi.indexOf('treasureChart');
  if (i >= 0) {
    qi.splice(i, 1);
    const id = randomPart(rng, true);
    ev.rewards.unshift({ kind: 'gear', id });
    ev.rupees += 200;
    lines.push(`The Treasure Chart leads to a wreck: salvage! (${nameOf(id)}, ${addGems(run, 2, rng)})`);
  }
  return lines;
}

/** Top-bar summary of the campaign. */
export function phantomStatus(run: Run): { sea: string; energy: number; gems: [number, number, number]; levels: [number, number, number]; floor: number; metals: number; parts: number; sword: boolean } {
  const ph = phantomOf(run);
  const chart = [...SEA_CHARTS].reverse().find((c) => (run.questItems ?? []).includes(c));
  const sea = run.region === OCEAN_KING_TEMPLE ? 'The Temple' : chart ? nameOf(chart).replace(' Chart', '') : 'The World of the Ocean King';
  const parts = [...run.convoy, ...run.roster.flatMap((u) => Object.values(u.gear))].filter((id) => !!id && SHIP_PART_IDS.includes(id)).length;
  return {
    sea, energy: (run.questItems ?? []).includes('phantomHourglass') ? hourglassMax(run) : 0,
    gems: [count(run, 'powerSpiritGem'), count(run, 'wisdomSpiritGem'), count(run, 'courageSpiritGem')],
    levels: [spiritLevel(run, 'leaf'), spiritLevel(run, 'neri'), spiritLevel(run, 'ciela')],
    floor: ph.templeFloor, metals: PHANTOM_METALS.filter((m) => (run.questItems ?? []).includes(m)).length, parts, sword: owns(run, 'phantomSword'),
  };
}
