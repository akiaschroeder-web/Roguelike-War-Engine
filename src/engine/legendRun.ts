// The Era of Legend campaign: four routes — Light and Dark (Hyrule Castle to Ganon), Dream of
// Koholint (Mabe Village to the Shadow Nightmare), Seasons of Holodrum (to Onox) and Ages of
// Labrynna (to Veran) — the linked Oracle continuation and the Room of Rites; Pendants, Crystals,
// the Instruments of the Sirens and the Essences; Gasha trees, ring appraisal and the Ring Box,
// the Seed Satchel, the trading sequences and the after-battle rewards.

import { ABILITIES, BOSSES, GEAR, ITEMS, TEMPLATES, WEAPONS } from '../data/registry';
import {
  ACHIEVEMENT_RINGS, AGES_OF_LABRYNNA, DREAM_OF_KOHOLINT, LIGHT_AND_DARK, PAIRED_BOSS_REGIONS, RING_IDS, ROOM_OF_RITES, ROUTE_BOSSES, SATCHELS, SEASONS_OF_HOLODRUM,
  SEED_KINDS, SIREN_INSTRUMENTS, TRADING_SEQUENCES, type SeedKind,
} from '../content/legend';
import { addPartnerBoss, lgState } from './legend';
import type { RNG } from './rng';
import { makeHero } from './units';
import type { Battle, BossDef, EventEffect, MapNode, Rarity, Run } from './types';

export interface LegendRunState {
  /** Mystical seeds in the satchel. */
  seeds: Record<SeedKind, number>;
  /** Gasha trees: growth points each (a tree bears a nut at 8). */
  gasha: number[];
  /** Rings kept in the Ring Box (out of the convoy). */
  ringBox: string[];
  /** Trading sequences: the next step of each. */
  trade: Record<'la' | 'oos' | 'ooa', number>;
  /** Routes finished: lttp, la, oos, ooa, rites. */
  done: string[];
  /** Route bosses beaten. */
  beaten: string[];
}

declare module './types' {
  interface Run {
    /** Era of Legend campaign state (seeds, Gasha trees and rings also follow other campaigns). */
    legend?: LegendRunState;
  }
}

const ROUTES: Record<string, string[]> = { lttp: LIGHT_AND_DARK, la: DREAM_OF_KOHOLINT, oos: SEASONS_OF_HOLODRUM, ooa: AGES_OF_LABRYNNA };
const FINALES: Record<string, string> = { ganonsTowerLttP: 'lttp', windFishsEgg: 'la', templeOfSeasons: 'oos', blackTower: 'ooa', [ROOM_OF_RITES]: 'rites' };
export const LEGEND_REGIONS = [...LIGHT_AND_DARK, ...DREAM_OF_KOHOLINT, ...SEASONS_OF_HOLODRUM, ...AGES_OF_LABRYNNA, ROOM_OF_RITES];
const DARK_WORLD_BOSSES = ['helmasaurKing', 'arrghus', 'mothulaBoss', 'blind', 'kholdstare', 'vitreous', 'trinexx'];
const INSTRUMENT_OF: Record<string, string> = {
  moldormBoss: 'fullMoonCello', genie: 'conchHorn', slimeEye: 'seaLilysBell', anglerFish: 'surfHarp', slimeEel: 'windMarimba', facade: 'coralTriangle', evilEagle: 'eveningCalmOrgan', hotHead: 'thunderDrum',
};
const PENDANT_OF: Record<string, string> = { armosKnightsBoss: 'pendantOfCourage', lanmolasBoss: 'pendantOfPower', moldormBoss: 'pendantOfWisdom' };
const GASHA_RIPE = 8;

export function legendOf(run: Run): LegendRunState {
  return (run.legend ??= { seeds: { ember: 0, scent: 0, pegasus: 0, gale: 0, mystery: 0 }, gasha: [], ringBox: [], trade: { la: 0, oos: 0, ooa: 0 }, done: [], beaten: [] });
}
const q = (run: Run) => (run.questItems ??= []);
const count = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id));
const nameOf = (id: string) => WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? id;

/** Seeds the satchel holds of each kind (no satchel: a small pouch of 10). */
export function satchelCap(run: Run): number {
  for (const [id, n] of SATCHELS) if ((run.questItems ?? []).includes(id)) return n;
  return 10;
}

/** Where an Era of Legend campaign begins: each commander's own game. */
export function legendStartRegion(run: { commanderId: string; regionsVisited: string[] }): string {
  const c = run.commanderId;
  if (['marin', 'tarin', 'windFish', 'bowwow'].includes(c)) return DREAM_OF_KOHOLINT[0];
  if (['din', 'onox', 'ricky', 'moosh', 'makuTreeHolodrum'].includes(c)) return SEASONS_OF_HOLODRUM[0];
  if (['nayru', 'farore', 'veran', 'ralph', 'queenAmbi', 'impaOracle', 'makuTreeLabrynna', 'dimitri'].includes(c)) return AGES_OF_LABRYNNA[0];
  return LIGHT_AND_DARK[0];
}

/** New Era of Legend campaign: a Seed Satchel with a few seeds. */
export function legendStart(run: Run) {
  const lg = legendOf(run);
  if (!q(run).includes('seedSatchelOracle')) q(run).push('seedSatchelOracle');
  for (const k of SEED_KINDS) lg.seeds[k] = Math.max(lg.seeds[k], 10);
}

/** Is the army marching one of the routes (battles stay in their region, no Free-for-All)? */
export function inLegendRoutes(run: Run): boolean {
  if (run.campaign !== 'legend') return false;
  const lg = legendOf(run);
  return LEGEND_REGIONS.includes(run.region) && !(lg.done.includes('lttp') && lg.done.includes('la') && lg.done.includes('rites'));
}

/** The fixed boss of a route region: the first of its bosses not yet beaten. */
export function legendBossFor(run: Run, node: MapNode): BossDef | null {
  if (run.campaign !== 'legend' || node.type !== 'boss') return null;
  const list = (ROUTE_BOSSES[node.world] ?? []).filter((id) => BOSSES[id]);
  if (!list.length) return null;
  const lg = legendOf(run);
  const id = list.find((x) => !lg.beaten.includes(x)) ?? list[0];
  return BOSSES[id] ?? null;
}

/** Battle setup: the satchel, the Victory Ring, the Essences' blessings, and the partner boss of a paired fight. */
export function legendBattleSetup(run: Run, b: Battle, rng: RNG) {
  const lg = legendOf(run);
  const st = lgState(b);
  st.seeds = { ...lg.seeds };
  st.victory = lg.beaten.length > 0 || run.bossesFought.length > 1;
  st.nature = Math.min(8, count(run, 'essenceOfNature'));
  st.time = Math.min(8, count(run, 'essenceOfTime'));
  for (const u of b.units) if (u.team === 'player' && st.victory && Object.values(u.gear ?? {}).includes('victoryRing')) u.buffs.push({ id: 'victoryRing', name: 'Victory Ring', turns: 99, stats: { str: 3, skl: 3 } });
  if (run.campaign !== 'legend' || b.nodeType !== 'boss' || !PAIRED_BOSS_REGIONS.includes(b.world)) return;
  const main = b.units.find((u) => u.isBoss && u.team === 'enemy');
  const list = (ROUTE_BOSSES[b.world] ?? []).filter((id) => BOSSES[id] && id !== main?.bossId);
  const partners = b.world === ROOM_OF_RITES ? list : [list.find((id) => !lg.beaten.includes(id)) ?? list[0]].filter(Boolean);
  for (const id of partners) addPartnerBoss(b, id, rng);
}

const RARITY_WEIGHT: Record<Rarity, number> = { common: 30, uncommon: 26, rare: 20, epic: 12, legendary: 5, mythic: 1 };
/** Vasu's appraisal: a random ring (common ones more often). */
function appraiseOne(run: Run, rng: RNG): string {
  const pool = RING_IDS.filter((id) => !ACHIEVEMENT_RINGS.includes(id));
  const id = rng.weighted(pool.map((x) => [x, RARITY_WEIGHT[GEAR[x]?.rarity ?? 'common']] as [string, number]));
  run.convoy.push(id);
  return id;
}

/** After a battle: seeds back to the satchel, Gasha trees grow, route rewards, achievement rings. */
export function legendAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const lg = legendOf(run);
  const st = b.lg;
  if (st) {
    const cap = satchelCap(run);
    for (const k of SEED_KINDS) lg.seeds[k] = Math.min(cap, st.seeds[k] ?? lg.seeds[k]);
    for (let i = 0; i < st.gashaPlanted; i++) lg.gasha.push(0);
    if (st.gashaPlanted) lines.push(`${st.gashaPlanted} Gasha tree${st.gashaPlanted > 1 ? 's' : ''} planted.`);
    for (let i = 0; i < (st.mysteryRings ?? 0); i++) q(run).push('mysteryRing');
    if (st.found) lines.push(`Secrets found: ${st.found}.`);
  }
  if (!won) return lines;
  // Gasha trees grow with victories, defeated enemies and boss fights.
  if (lg.gasha.length) {
    const kills = b.fallen.filter((u) => u.team === 'enemy').length;
    const mult = owns(run, 'gashaRing') ? 1.5 : 1;
    const grow = (1 + Math.floor(kills / 5) + (b.nodeType === 'boss' ? 2 : 0)) * mult;
    lg.gasha = lg.gasha.map((g) => g + grow);
    lines.push(...harvestGasha(run, rng, false));
  }
  // Rings that pay.
  const rupeeRing = (id: string) => run.roster.some((u) => Object.values(u.gear).includes(id));
  const bonus = Math.round(b.rewardRupees * ((rupeeRing('goldJoyRing') ? 0.3 : 0) + (rupeeRing('rupeeRing') ? 0.2 : 0) + (rupeeRing('cursedRing') ? 0.5 : 0)));
  if (bonus > 0) { run.rupees += bonus; lines.push(`Rings: +₹${bonus}.`); }
  // Tarin's Mushroom Hunter.
  if (run.roster.some((u) => u.skills.includes('mushroomHunter')) && rng.chance(40)) { const m = rng.pick(['magicMushroom', 'sleepyToadstool']); run.convoy.push(m); lines.push(`Tarin finds a ${nameOf(m)}.`); }
  // Route rewards for each boss beaten.
  if (run.campaign === 'legend' || LEGEND_REGIONS.includes(b.world)) lines.push(...routeRewards(run, b, rng));
  // Achievement rings.
  const ach: [boolean, string][] = [
    [lg.done.length > 0, 'firstRing'], [run.stats.battles + 1 >= 100, 'hundredthRing'], [run.stats.battles + 1 >= 1000, 'thousandthRing'],
    [run.stats.kills >= 1000, 'slayersRing'], [run.rupees >= 10000, 'rupeeRing'],
  ];
  for (const [ok, id] of ach) if (ok && !owns(run, id) && !lg.ringBox.includes(id)) { run.convoy.push(id); lines.push(`An achievement: the ${nameOf(id)}!`); }
  return lines;
}

function recruitOnce(run: Run, id: string, rng: RNG, lines: string[], why: string) {
  if (!TEMPLATES[id] || run.roster.some((u) => u.templateId === id)) return;
  const lvl = Math.max(1, Math.round(run.roster.reduce((s, u) => s + u.level, 0) / Math.max(1, run.roster.length)));
  run.roster.push(makeHero(id, `p${run.uidCounter++}`, lvl, rng));
  run.stats.recruits++;
  lines.push(why);
}

function routeRewards(run: Run, b: Battle, rng: RNG): string[] {
  const lines: string[] = [];
  const lg = legendOf(run);
  const beatenNow = b.fallen.filter((u) => u.team === 'enemy' && u.isBoss).map((u) => u.bossId ?? u.templateId ?? '');
  // Possessed Nayru and Onox fall in their last forms; record the boss the fight began with.
  if (b.nodeType === 'boss' && ROUTE_BOSSES[b.world]?.length && !beatenNow.some((id) => ROUTE_BOSSES[b.world].includes(id))) {
    const first = (ROUTE_BOSSES[b.world] ?? []).find((id) => !lg.beaten.includes(id));
    if (first) beatenNow.push(first);
  }
  for (const id of beatenNow) {
    if (!lg.beaten.includes(id)) lg.beaten.push(id);
    const pendant = PENDANT_OF[id];
    if (pendant && LIGHT_AND_DARK.includes(b.world) && !owns(run, pendant)) { run.convoy.push(pendant); lines.push(`The ${nameOf(pendant)}! (${['pendantOfCourage', 'pendantOfPower', 'pendantOfWisdom'].filter((p) => owns(run, p)).length}/3)`); }
    const inst = INSTRUMENT_OF[id];
    if (inst && DREAM_OF_KOHOLINT.includes(b.world) && !owns(run, inst)) { run.convoy.push(inst); lines.push(`An Instrument of the Sirens: the ${nameOf(inst)} (${instrumentsHeld(run)}/8).`); }
    if (DARK_WORLD_BOSSES.includes(id) && b.world === 'darkWorld') { q(run).push('crystalMaiden'); lines.push(`A Crystal: one of the Maidens is free (${count(run, 'crystalMaiden')}/7).`); }
    if (SEASONS_OF_HOLODRUM.includes(b.world) && b.world !== 'templeOfSeasons') { q(run).push('essenceOfNature'); lines.push(`An Essence of Nature (${count(run, 'essenceOfNature')}/8).`); }
    if (AGES_OF_LABRYNNA.includes(b.world) && b.world !== 'blackTower') {
      const n = id === 'octogon' ? 2 : 1;
      for (let i = 0; i < n; i++) q(run).push('essenceOfTime');
      lines.push(`${n > 1 ? 'Two Essences' : 'An Essence'} of Time (${count(run, 'essenceOfTime')}/8).`);
    }
  }
  // A Dark World dungeon (elite fight) frees a Maiden too.
  if (b.world === 'darkWorld' && b.nodeType === 'elite') { q(run).push('crystalMaiden'); lines.push(`A Crystal from the dungeon's depths (${count(run, 'crystalMaiden')}/7).`); }
  if (b.nodeType === 'boss' && b.world === 'hyruleCastleLttP') recruitOnce(run, 'zeldaLegend', rng, lines, 'Princess Zelda is free — and she joins you.');
  if (count(run, 'crystalMaiden') >= 7 && !q(run).includes('crystalsComplete')) { q(run).push('crystalsComplete'); lines.push('All seven Maidens are free: the barrier on Ganon\'s Tower breaks.'); }
  if (instrumentsHeld(run) >= 8 && !q(run).includes('windFishsEggOpen')) { q(run).push('windFishsEggOpen'); lines.push('Eight instruments play the Ballad of the Wind Fish: the Egg on Mt. Tamaranch cracks open.'); }
  // Finales.
  const finale = FINALES[b.world];
  if (finale && b.nodeType === 'boss' && !lg.done.includes(finale)) {
    lg.done.push(finale);
    const text: Record<string, string> = {
      lttp: 'Ganon falls under the Pyramid of Power. The Triforce restores the Golden Land — Hyrule is whole again.',
      la: 'The Shadow Nightmare fades. The Wind Fish wakes, and Koholint fades with the dream... but its people go on, somewhere.',
      oos: 'Onox falls and the seasons turn as they should. Din dances again in Horon Village.',
      ooa: 'Veran is defeated and Nayru is free. Time flows on in Labrynna.',
      rites: 'The Flames of Despair go out. The resurrected Ganon falls back into darkness, and the Twinrova sisters with him.',
    };
    lines.push(text[finale]);
    if (finale === 'oos') recruitOnce(run, 'din', rng, lines, 'Din joins your army.');
    if (finale === 'ooa') recruitOnce(run, 'nayru', rng, lines, 'Nayru, herself again, joins your army.');
    if (finale === 'la') recruitOnce(run, 'windFish', rng, lines, 'The Wind Fish lends you its dream.');
    if ((finale === 'oos' && lg.done.includes('ooa')) || (finale === 'ooa' && lg.done.includes('oos'))) lines.push('Both Oracles are safe — but under Hyrule Castle, two witches light the Flames of Destruction. The Room of Rites awaits.');
  }
  return lines;
}

export const instrumentsHeld = (run: Run) => SIREN_INSTRUMENTS.filter((id) => owns(run, id)).length;
const essences = (run: Run, id: string) => count(run, id);

/** Mature Gasha trees bear their nuts (opened at once). */
function harvestGasha(run: Run, rng: RNG, force: boolean): string[] {
  const lg = legendOf(run);
  const lines: string[] = [];
  const keep: number[] = [];
  for (const g of lg.gasha) {
    if (g < GASHA_RIPE && !(force && g >= GASHA_RIPE / 2)) { keep.push(g); continue; }
    const big = g >= GASHA_RIPE * 1.5;
    const roll = rng.int(0, 99);
    if (roll < (big ? 60 : 45)) { q(run).push('mysteryRing'); lines.push('A Gasha tree bears a nut: inside, a Mystery Ring!'); }
    else if (roll < 75) { const r = rng.int(60, 220); run.rupees += r; lines.push(`A Gasha tree bears a nut: ₹${r}.`); }
    else { const it = rng.pick(['guardianAcorn', 'pieceOfPower', 'gashaSeed', 'secretMedicine', 'goldenBee', 'heartRingL1']); run.convoy.push(it); lines.push(`A Gasha tree bears a nut: ${nameOf(it)}.`); }
  }
  lg.gasha = keep;
  return lines;
}

/** Region choices after a boss on the routes. Empty: the ordinary choice of regions. */
export function legendRegionOptions(run: Run): string[] {
  const lg = legendOf(run);
  const r = run.region;
  const unbeaten = (region: string) => (ROUTE_BOSSES[region] ?? []).some((id) => BOSSES[id] && !lg.beaten.includes(id));
  const nextOf = (route: string[]) => { const i = route.indexOf(r); return i >= 0 && i + 1 < route.length ? route[i + 1] : undefined; };
  const otherStarts = () => (['lttp', 'la', 'oos', 'ooa'] as const).filter((x) => !lg.done.includes(x)).map((x) => ROUTES[x][0]).filter((x) => x !== r);
  if (r === ROOM_OF_RITES) return otherStarts().slice(0, 3);
  // A Light and Dark: the Dark World until all seven Maidens are free.
  if (r === 'darkWorld' && count(run, 'crystalMaiden') < 7) return ['darkWorld'];
  if (r === 'ganonsTowerLttP') return otherStarts().slice(0, 3);
  if (r === 'windFishsEgg') return otherStarts().slice(0, 3);
  // The Oracles: a missing Essence sends you back; then the linked continuation and the Room of Rites.
  if (r === 'templeOfSeasons' || r === 'blackTower') {
    const other = r === 'templeOfSeasons' ? 'ooa' : 'oos';
    if (!lg.done.includes(other)) return [ROUTES[other][0]];
    return lg.done.includes('rites') ? otherStarts().slice(0, 3) : [ROOM_OF_RITES];
  }
  const route = Object.values(ROUTES).find((x) => x.includes(r));
  if (!route) return [];
  const next = nextOf(route);
  if (!next) return [];
  // Gates: eight Instruments for the Egg, eight Essences for the Oracle finales, seven Crystals for Ganon's Tower.
  const gate: Record<string, () => boolean> = {
    windFishsEgg: () => instrumentsHeld(run) >= 8, templeOfSeasons: () => essences(run, 'essenceOfNature') >= 8, blackTower: () => essences(run, 'essenceOfTime') >= 8,
  };
  if (gate[next] && !gate[next]()) {
    const back = route.slice(0, route.indexOf(next)).filter(unbeaten);
    if (back.length) return back.slice(0, 3);
  }
  return [next];
}

/** Era of Legend event effects. */
export function applyLegendEffect(run: Run, e: Extract<EventEffect, { kind: 'legend' }>, rng: RNG): string | null {
  const lg = legendOf(run);
  const qi = q(run);
  const takeQuest = (id: string) => { const i = qi.indexOf(id); if (i < 0) return false; qi.splice(i, 1); return true; };
  switch (e.op) {
    case 'appraise': {
      if (!takeQuest('mysteryRing')) return 'No Mystery Ring to appraise.';
      const id = appraiseOne(run, rng);
      return `Vasu: "It's a ${nameOf(id)}!"`;
    }
    case 'appraiseAll': {
      const got: string[] = [];
      while (takeQuest('mysteryRing')) { if (run.rupees < 15) { qi.push('mysteryRing'); break; } run.rupees -= 15; got.push(nameOf(appraiseOne(run, rng))); }
      return got.length ? `Appraised: ${got.join(', ')}.` : 'Nothing appraised.';
    }
    case 'sellDuplicates': {
      const equipped = new Set(run.roster.flatMap((u) => Object.values(u.gear)));
      const seen = new Set<string>();
      let total = 0, n = 0;
      run.convoy = run.convoy.filter((id) => {
        if (!RING_IDS.includes(id)) return true;
        if (equipped.has(id) || seen.has(id) || lg.ringBox.includes(id)) { total += Math.round((GEAR[id]?.price ?? 100) / 2); n++; return false; }
        seen.add(id);
        return true;
      });
      run.rupees += total;
      return n ? `Sold ${n} duplicate ring${n > 1 ? 's' : ''} for ₹${total}.` : 'No duplicates to sell.';
    }
    case 'ringBoxStore': {
      const rings = run.convoy.filter((id) => RING_IDS.includes(id));
      run.convoy = run.convoy.filter((id) => !RING_IDS.includes(id));
      lg.ringBox.push(...rings);
      return rings.length ? `${rings.length} ring${rings.length > 1 ? 's' : ''} stored in the Ring Box.` : 'No rings in the convoy.';
    }
    case 'ringBoxTake': {
      const n = lg.ringBox.length;
      run.convoy.push(...lg.ringBox);
      lg.ringBox = [];
      return n ? `${n} ring${n > 1 ? 's' : ''} back in the convoy.` : 'The Ring Box is empty.';
    }
    case 'plantGasha': {
      const i = run.convoy.indexOf('gashaSeed');
      if (i >= 0) run.convoy.splice(i, 1);
      else {
        const holder = run.roster.find((u) => u.pack.some((p) => p.id === 'gashaSeed'));
        if (!holder) return 'You have no Gasha Seed.';
        const j = holder.pack.findIndex((p) => p.id === 'gashaSeed');
        if (--holder.pack[j].uses <= 0) holder.pack.splice(j, 1);
      }
      lg.gasha.push(1);
      return 'A Gasha Seed is planted.';
    }
    case 'harvestGasha': {
      const lines = harvestGasha(run, rng, true);
      return lines.length ? lines.join(' ') : lg.gasha.length ? `Your ${lg.gasha.length} Gasha tree${lg.gasha.length > 1 ? 's are' : ' is'} still growing.` : 'You have no Gasha trees.';
    }
    case 'trade': {
      const key = (e.id ?? 'la') as 'la' | 'oos' | 'ooa';
      const seq = TRADING_SEQUENCES[key];
      const step = lg.trade[key];
      if (step >= seq.length) return 'Nobody wants to trade any more.';
      if (step > 0) takeQuest(seq[step - 1].id);
      if (step < seq.length) qi.push(seq[step].id);
      lg.trade[key] = step + 1;
      // The trades pay off along the way, and the last one is special.
      if (step + 1 === seq.length) {
        const prize = key === 'la' ? 'koholintSword' : key === 'oos' ? 'biggoronSword' : 'nobleSword';
        if (!owns(run, prize)) run.convoy.push(prize);
        return `The last trade: ${seq[step].name} — and in return, the ${nameOf(prize)}!`;
      }
      if (step % 4 === 3) { run.rupees += 80; return `Traded for the ${seq[step].name} (and ₹80 for your trouble).`; }
      return `Traded for the ${seq[step].name}.`;
    }
    case 'song': {
      const id = e.id ?? '';
      if (!ABILITIES[id]) return null;
      const pupil = run.roster.find((u) => !u.abilities.includes(id) && u.weapons.some((w) => WEAPONS[w]?.type === 'instrument'))
        ?? run.roster.find((u) => !u.abilities.includes(id) && u.templateId === 'heroOfLegend');
      if (!pupil) return 'Nobody with an instrument to learn it.';
      pupil.abilities.push(id);
      return `${pupil.name} learns ${ABILITIES[id].name}${pupil.weapons.some((w) => WEAPONS[w]?.type === 'instrument') ? '' : ' (find an instrument to play it)'}.`;
    }
    case 'seeds': {
      const cap = satchelCap(run);
      const kind = rng.pick([...SEED_KINDS]);
      lg.seeds[kind] = Math.min(cap, lg.seeds[kind] + (e.amount ?? 10));
      for (const k of SEED_KINDS) if (k !== kind) lg.seeds[k] = Math.min(cap, lg.seeds[k] + 3);
      return `The satchel fills: ${kind[0].toUpperCase()}${kind.slice(1)} Seeds ${lg.seeds[kind]}/${cap}.`;
    }
    case 'satchel': {
      const next = !qi.includes('seedSatchelOracle') ? 'seedSatchelOracle' : !qi.includes('largeSeedSatchelOracle') ? 'largeSeedSatchelOracle' : !qi.includes('hugeSeedSatchel') ? 'hugeSeedSatchel' : null;
      if (!next) { run.rupees += 200; return 'Your satchel is already the biggest there is (₹200 back).'; }
      qi.push(next);
      return `${next === 'hugeSeedSatchel' ? 'A Huge' : next === 'largeSeedSatchelOracle' ? 'A Large' : 'A'} Seed Satchel: ${satchelCap(run)} of each seed.`;
    }
    case 'brew': {
      const i = run.convoy.indexOf(e.id ?? '');
      const holder = run.roster.find((u) => u.pack.some((p) => p.id === e.id));
      if (i >= 0) run.convoy.splice(i, 1);
      else if (holder) { const j = holder.pack.findIndex((p) => p.id === e.id); if (--holder.pack[j].uses <= 0) holder.pack.splice(j, 1); }
      else return 'You have nothing to brew.';
      run.convoy.push('magicPowder');
      return 'Magic Powder!';
    }
    case 'temper': {
      for (const u of run.roster) { const j = u.weapons.indexOf('fightersSword'); if (j >= 0) { u.weapons[j] = 'temperedSword'; return `${u.name}'s sword is tempered.`; } }
      const k = run.convoy.indexOf('fightersSword');
      if (k >= 0) { run.convoy[k] = 'temperedSword'; return 'The sword is tempered.'; }
      return null;
    }
    case 'gild': {
      for (const u of run.roster) { const j = u.weapons.indexOf('temperedSword'); if (j >= 0) { u.weapons[j] = 'goldenSword'; return `${u.name}'s sword comes back as the Golden Sword!`; } }
      const k = run.convoy.indexOf('temperedSword');
      if (k >= 0) { run.convoy[k] = 'goldenSword'; return 'The Golden Sword!'; }
      return null;
    }
  }
  return null;
}

/** Farore's army (or Farore herself): an extra recruit offer. */
export const legendExtraRecruit = (run: Run) => run.bonus === 'secretsOfFarore' || run.roster.some((u) => u.skills.includes('keeperOfSecrets'));

/** Top-bar summary of the campaign. */
export function legendStatus(run: Run): { route: string; pendants: number; crystals: number; instruments: number; nature: number; time: number; seeds: number; cap: number; gasha: number; rings: number } {
  const lg = legendOf(run);
  const route = LIGHT_AND_DARK.includes(run.region) ? 'Light and Dark' : DREAM_OF_KOHOLINT.includes(run.region) ? 'Dream of Koholint' : SEASONS_OF_HOLODRUM.includes(run.region) ? 'Seasons of Holodrum'
    : AGES_OF_LABRYNNA.includes(run.region) ? 'Ages of Labrynna' : run.region === ROOM_OF_RITES ? 'The Room of Rites' : 'Era of Legend';
  return {
    route, pendants: ['pendantOfCourage', 'pendantOfWisdom', 'pendantOfPower'].filter((p) => owns(run, p)).length, crystals: Math.min(7, count(run, 'crystalMaiden')),
    instruments: instrumentsHeld(run), nature: Math.min(8, count(run, 'essenceOfNature')), time: Math.min(8, count(run, 'essenceOfTime')),
    seeds: SEED_KINDS.reduce((n, k) => n + lg.seeds[k], 0), cap: satchelCap(run), gasha: lg.gasha.length, rings: count(run, 'mysteryRing'),
  };
}
