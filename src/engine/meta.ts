// Progression that survives between campaigns: Hero Medals and the facilities
// that spend them (Goddess Statue, Hall of Heroes, Royal Treasury, Military
// Academy), the Bounty Board, and the Chamber of Trials.

import { TEMPLATES } from '../data/registry';
import { armyOf } from './army';
import type { Run } from './types';

export interface MetaProgress {
  medals: number;
  medalsTotal: number;
  /** Goddess Statue upgrade id -> level bought. */
  upgrades: Record<string, number>;
  /** Hall of Heroes: characters who can join at the start of a campaign. */
  heroes: string[];
  /** Royal Treasury: starting kits unlocked. */
  kits: string[];
  /** Military Academy: starting formations unlocked. */
  formations: string[];
  /** Bounty ids already claimed. */
  bounties: string[];
  /** Lifetime counters for bounties. */
  counters: Record<string, number>;
  /** Archives. */
  convos: string[];
  enemiesSeen: string[];
  itemsSeen: string[];
}

export function emptyProgress(): MetaProgress {
  return { medals: 0, medalsTotal: 0, upgrades: {}, heroes: [], kits: [], formations: [], bounties: [], counters: {}, convos: [], enemiesSeen: [], itemsSeen: [] };
}

// ───────────────────────── Goddess Statue ─────────────────────────

export interface UpgradeDef { id: string; name: string; desc: string; costs: number[] }

export const UPGRADES: UpgradeDef[] = [
  { id: 'vigor', name: 'Blessing of Vigor', desc: '+2 max HP for your starting army (per level).', costs: [4, 8, 12] },
  { id: 'purse', name: 'Royal Purse', desc: '+100 starting Rupees (per level).', costs: [3, 6, 9] },
  { id: 'pantry', name: 'Full Pantry', desc: '+10 starting supplies (per level).', costs: [3, 5, 8] },
  { id: 'barracks', name: 'Bigger Barracks', desc: '+1 army capacity (per level).', costs: [8, 14] },
  { id: 'command', name: 'Strategist’s Seal', desc: '+1 Command Point every battle (per level).', costs: [6, 12] },
  { id: 'spirit', name: 'Fighting Spirit', desc: '+10 starting morale (per level).', costs: [4, 8] },
  { id: 'renown', name: 'Renown', desc: '+10 starting reputation (per level).', costs: [4, 8] },
  { id: 'dust', name: 'Fairy’s Favor', desc: 'Start each campaign with 1 Fairy Dust.', costs: [7] },
];

export function upgradeLevel(p: MetaProgress, id: string): number {
  return p.upgrades[id] ?? 0;
}

export function upgradeCost(p: MetaProgress, id: string): number | null {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) return null;
  return def.costs[upgradeLevel(p, id)] ?? null;
}

export function buyUpgrade(p: MetaProgress, id: string): boolean {
  const cost = upgradeCost(p, id);
  if (cost === null || p.medals < cost) return false;
  p.medals -= cost;
  p.upgrades[id] = upgradeLevel(p, id) + 1;
  return true;
}

// ───────────────────────── Hall of Heroes ─────────────────────────

export const HERO_COST = 5;

/** Named characters you've met who can be unlocked as starting companions. */
export function heroCandidates(discovered: string[], p: MetaProgress): string[] {
  return discovered.filter((id) => TEMPLATES[id] && !TEMPLATES[id].generic && !TEMPLATES[id].rare && !p.heroes.includes(id));
}

export function unlockHero(p: MetaProgress, id: string): boolean {
  if (p.heroes.includes(id) || p.medals < HERO_COST || !TEMPLATES[id]) return false;
  p.medals -= HERO_COST;
  p.heroes.push(id);
  return true;
}

// ───────────────────────── Royal Treasury ─────────────────────────

export interface KitDef { id: string; name: string; desc: string; cost: number; items: string[]; materials?: number; fairyDust?: number; supplies?: number }

export const KITS: KitDef[] = [
  { id: 'medic', name: 'Medic’s Satchel', desc: '3 Red Potions and an Antidote.', cost: 3, items: ['redPotion', 'redPotion', 'redPotion', 'antidote'] },
  { id: 'explorer', name: 'Explorer’s Kit', desc: 'Shovel, Fishing Rod and Magic Beans.', cost: 4, items: ['shovel', 'fishingRod', 'magicBean'] },
  { id: 'bomber', name: 'Bomb Bag', desc: 'Bombs, a Bombchu and Deku Nuts.', cost: 4, items: ['bomb', 'bombchu', 'dekuNut'] },
  { id: 'truth', name: 'Lens of Truth', desc: 'See hidden enemies and traps from day one.', cost: 6, items: ['lensOfTruth'] },
  { id: 'smith', name: 'Smith’s Crate', desc: '+20 materials for the Blacksmith.', cost: 4, items: [], materials: 20 },
  { id: 'fairy', name: 'Fairy in a Bottle', desc: 'A Bottled Fairy and 1 Fairy Dust.', cost: 6, items: ['fairy'], fairyDust: 1 },
  { id: 'hookshot', name: 'Hookshot', desc: 'Start with a Hookshot.', cost: 6, items: ['hookshot'] },
  { id: 'song', name: 'Lost Sheet Music', desc: 'Song of Time and Song of Storms sheet music.', cost: 5, items: ['sheetTime', 'sheetStorms'] },
];

export function unlockKit(p: MetaProgress, id: string): boolean {
  const k = KITS.find((x) => x.id === id);
  if (!k || p.kits.includes(id) || p.medals < k.cost) return false;
  p.medals -= k.cost;
  p.kits.push(id);
  return true;
}

// ───────────────────────── Military Academy ─────────────────────────

export interface FormationDef { id: string; name: string; desc: string; cost: number }

export const FORMATIONS: FormationDef[] = [
  { id: 'veterans', name: 'Veteran Company', desc: 'Your starting army begins at Level 3.', cost: 8 },
  { id: 'quartermasters', name: 'Quartermasters', desc: 'Start with +20 supplies and +10 materials.', cost: 5 },
  { id: 'zealots', name: 'Sacred Order', desc: 'Start with 2 Sacred Energy.', cost: 6 },
  { id: 'heralds', name: 'Heralds', desc: 'Start with +25 reputation and +10 morale.', cost: 5 },
];

export function unlockFormation(p: MetaProgress, id: string): boolean {
  const f = FORMATIONS.find((x) => x.id === id);
  if (!f || p.formations.includes(id) || p.medals < f.cost) return false;
  p.medals -= f.cost;
  p.formations.push(id);
  return true;
}

// ───────────────────────── Chamber of Trials ─────────────────────────

export interface TrialDef { id: string; name: string; desc: string; mult: number }

export const TRIALS: TrialDef[] = [
  { id: 'hardened', name: 'Hardened Foes', desc: 'Enemies are 2 levels higher.', mult: 0.3 },
  { id: 'swarm', name: 'Swarm', desc: '+2 enemies in every battle.', mult: 0.25 },
  { id: 'famine', name: 'Famine', desc: 'Start with half supplies; merchants charge double for supplies.', mult: 0.15 },
  { id: 'wounds', name: 'Lingering Wounds', desc: 'No HP recovery after battles.', mult: 0.25 },
  { id: 'mist', name: 'Endless Mist', desc: 'Every battle is fought in fog.', mult: 0.15 },
];

export function trialMultiplier(trials: string[] | undefined): number {
  return 1 + (trials ?? []).reduce((s, id) => s + (TRIALS.find((t) => t.id === id)?.mult ?? 0), 0);
}

// ───────────────────────── Bounty Board ─────────────────────────

export interface BountyDef { id: string; name: string; desc: string; reward: number; done: (c: Record<string, number>) => boolean }

const c = (k: string, n: number) => (x: Record<string, number>) => (x[k] ?? 0) >= n;

export const BOUNTIES: BountyDef[] = [
  { id: 'region2', name: 'Beyond the Border', desc: 'Reach region 2.', reward: 3, done: c('bestRegion', 2) },
  { id: 'region4', name: 'Into the Free-for-All', desc: 'Reach region 4.', reward: 6, done: c('bestRegion', 4) },
  { id: 'region7', name: 'Endless War', desc: 'Reach region 7.', reward: 12, done: c('bestRegion', 7) },
  { id: 'bosses5', name: 'Boss Hunter', desc: 'Defeat 5 regional bosses (lifetime).', reward: 4, done: c('bossKills', 5) },
  { id: 'bosses20', name: 'Legend of the Battlefield', desc: 'Defeat 20 bosses (lifetime).', reward: 10, done: c('bossKills', 20) },
  { id: 'siege', name: 'Stormbreaker', desc: 'Win a siege.', reward: 3, done: c('sieges', 1) },
  { id: 'dungeon', name: 'Dungeon Delver', desc: 'Clear a dungeon.', reward: 3, done: c('dungeons', 1) },
  { id: 'rescue', name: 'Liberator', desc: 'Rescue 5 prisoners (lifetime).', reward: 4, done: c('rescued', 5) },
  { id: 'escort', name: 'Bodyguard', desc: 'Win 3 escort missions (lifetime).', reward: 4, done: c('escorts', 3) },
  { id: 'supportS', name: 'Bonds of Destiny', desc: 'Reach an S support.', reward: 5, done: c('supportS', 1) },
  { id: 'flawless10', name: 'Not a Scratch', desc: 'Win 10 battles without losing a unit (lifetime).', reward: 4, done: c('flawless', 10) },
  { id: 'battles100', name: 'Centurion', desc: 'Win 100 battles (lifetime).', reward: 10, done: c('wins', 100) },
];

export function bump(p: MetaProgress, key: string, n = 1) {
  p.counters[key] = (p.counters[key] ?? 0) + n;
}

export function setMax(p: MetaProgress, key: string, v: number) {
  p.counters[key] = Math.max(p.counters[key] ?? 0, v);
}

/** Claim every finished bounty. Returns the ones newly claimed. */
export function claimBounties(p: MetaProgress): BountyDef[] {
  const out: BountyDef[] = [];
  for (const b of BOUNTIES) {
    if (p.bounties.includes(b.id) || !b.done(p.counters)) continue;
    p.bounties.push(b.id);
    p.medals += b.reward;
    p.medalsTotal += b.reward;
    out.push(b);
  }
  return out;
}

// ───────────────────────── Earning medals ─────────────────────────

/** Hero Medals for a finished (or abandoned) campaign. */
export function medalsForRun(run: Run): number {
  const regions = Math.max(0, run.act - 1);
  const base = regions * 3 + Math.floor(run.stats.battles / 3) + run.bossesFought.length;
  return Math.max(1, Math.round(base * trialMultiplier(run.trials)));
}

export function awardMedals(p: MetaProgress, n: number) {
  p.medals += n;
  p.medalsTotal += n;
}

// ───────────────────────── Applying to a new campaign ─────────────────────────

export interface RunChoices {
  campaign?: 'hyrule' | 'termina' | 'greatSea' | 'twilight' | 'skyward';
  hero?: string;
  kit?: string;
  formation?: string;
  trials?: string[];
}

/** Starting bonuses from facilities and the player's choices. Call right after newRun. */
export function applyMetaToRun(run: Run, p: MetaProgress, choices: RunChoices, addHero: (id: string) => void, give: (id: string) => void, levelUp: (levels: number) => void) {
  const a = armyOf(run);
  const lvl = (id: string) => upgradeLevel(p, id);
  for (const u of run.roster) { u.stats.hp += 2 * lvl('vigor'); u.hp = u.stats.hp; }
  run.rupees += 100 * lvl('purse');
  a.supplies += 10 * lvl('pantry');
  a.morale = Math.min(100, a.morale + 10 * lvl('spirit'));
  a.reputation = Math.min(100, a.reputation + 10 * lvl('renown'));
  a.fairyDust += lvl('dust');
  run.metaBonus = { armyCap: lvl('barracks'), cp: lvl('command') };
  if (choices.hero && p.heroes.includes(choices.hero) && !run.roster.some((u) => u.templateId === choices.hero)) addHero(choices.hero);
  const kit = KITS.find((k) => k.id === choices.kit && p.kits.includes(k.id));
  if (kit) {
    for (const id of kit.items) give(id);
    a.materials += kit.materials ?? 0;
    a.fairyDust += kit.fairyDust ?? 0;
    a.supplies += kit.supplies ?? 0;
  }
  switch (p.formations.includes(choices.formation ?? '') ? choices.formation : undefined) {
    case 'veterans': levelUp(2); break;
    case 'quartermasters': a.supplies += 20; a.materials += 10; break;
    case 'zealots': a.sacredEnergy += 2; break;
    case 'heralds': a.reputation = Math.min(100, a.reputation + 25); a.morale = Math.min(100, a.morale + 10); break;
  }
  run.trials = (choices.trials ?? []).filter((t) => TRIALS.some((x) => x.id === t));
  if (run.trials.includes('famine')) a.supplies = Math.floor(a.supplies / 2);
}
