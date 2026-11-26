// The Skyward Sword campaign: Skyloft to the Demon's Realm, the Silent Realm
// trials, crafting materials and equipment upgrades, Gratitude Crystals, the
// Song of the Hero, the sword's sacred flames, and the pack's medals.

import { GEAR, ITEMS, WEAPONS, WORLDS } from '../data/registry';
import { GENERIC_PER_MATERIAL, INSECTS_BY_REGION, MATERIALS, RECIPES, type Recipe } from '../content/skyward';
import { armyOf } from './army';
import type { RNG } from './rng';
import { hasEffect } from './units';
import type { Battle, Run, Unit } from './types';

declare module './types' {
  interface Run {
    /** Skyward Sword: Silent Realm trials and the like. */
    skyward?: { trialPending?: string; trialsDone: string[] };
  }
}

export const SKYWARD_REGIONS = Object.values(WORLDS).filter((w) => w.campaign === 'skyward').map((w) => w.id);
export const MATERIAL_IDS = new Set(MATERIALS.map((m) => m.id));

export function skywardOf(run: Run) {
  return (run.skyward ??= { trialsDone: [] });
}

const q = (run: Run) => (run.questItems ??= []);
export const questCount = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const addQ = (run: Run, id: string, n = 1) => { for (let i = 0; i < n; i++) q(run).push(id); };
function takeQ(run: Run, id: string, n: number) {
  for (let i = 0; i < n; i++) { const k = q(run).indexOf(id); if (k >= 0) q(run).splice(k, 1); }
}
const worn = (run: Run, effect: string) => run.roster.filter((u) => Object.values(u.gear).some((g) => GEAR[g!]?.effects?.includes(effect as never)));

/** New Skyward Sword campaign: start in Skyloft with a few Treasures for Gondo. */
export function skywardStart(run: Run) {
  skywardOf(run);
  addQ(run, 'amberRelic', 2);
  addQ(run, 'monsterClaw', 1);
  addQ(run, 'jellyBlob', 1);
}

/** The army's next battle will be a Silent Realm trial for this region. */
export function queueTrial(run: Run, region: string): string {
  skywardOf(run).trialPending = region;
  return 'Your next battle is a Silent Realm trial.';
}

/** Four song parts make the Song of the Hero. */
export function skywardQuestCheck(run: Run): string[] {
  const parts = ['songPartFaron', 'songPartEldin', 'songPartLanayru', 'songPartLevias'];
  if (parts.every((p) => q(run).includes(p)) && !q(run).includes('songOfTheHeroComplete')) {
    for (const p of parts) takeQ(run, p, 1);
    addQ(run, 'songOfTheHeroComplete');
    return ['The four parts come together: the Song of the Hero! Anyone with the Goddess\'s Harp can now play it.'];
  }
  return [];
}

/** Battle Rupee multiplier from medals and wallets. */
export function skywardRupeeMult(run: Run): number {
  let m = 1;
  m *= 1 + 0.3 * worn(run, 'rupeeMedal').length;
  if (worn(run, 'cursedMedal').length) m *= 2;
  if (q(run).includes('extraWallet')) m *= 1.1;
  if (q(run).includes('tycoonWallet')) m *= 1.25;
  return m;
}

const TRIAL_REWARDS: Record<string, string[]> = {
  skyloft: ['goddessShield', 'sacredShield'],
  faronWoodsSS: ['waterDragonsScale'],
  lanayruDesert: ['clawshot', 'doubleClawshots'],
  eldinVolcano: ['fireshieldEarrings'],
};
const FLAMES: Record<string, string> = { ancientCistern: 'faroresFlame', lanayruSandSea: 'nayrusFlame', fireSanctuary: 'dinsFlame', demonsRealm: 'hyliasBlessing', sealedGrounds: 'hyliasBlessing' };
const SONG_PARTS: Record<string, string> = { faronDragon: 'songPartFaron', eldinDragon: 'songPartEldin', lanayruDragon: 'songPartLanayru', levias: 'songPartLevias' };
const owns = (run: Run, id: string) => run.convoy.includes(id) || run.roster.some((u) => u.weapons.includes(id) || Object.values(u.gear).includes(id));

/** After a battle: materials, insects, trials, flames, song parts, Gratitude Crystals, medal finds. */
export function skywardAfterBattle(run: Run, b: Battle, won: boolean, sideDone: boolean, rng: RNG): string[] {
  const lines: string[] = [];
  const st = b.ss;
  const sw = skywardOf(run);
  // The Silent Realm
  if (st?.trial) {
    sw.trialPending = undefined;
    if (won) {
      if (!sw.trialsDone.includes(st.trial.region)) sw.trialsDone.push(st.trial.region);
      addQ(run, 'spiritVessel');
      const reward = (TRIAL_REWARDS[st.trial.region] ?? []).find((id) => !owns(run, id)) ?? rng.pick(['lifeMedal', 'potionMedal', 'heartMedal', 'treasureMedal', 'rupeeMedal', 'sacredShield']);
      run.convoy.push(reward);
      if (st.trial.region === 'skyloft' && !q(run).includes('stoneOfTrials')) { addQ(run, 'stoneOfTrials'); lines.push('The Stone of Trials: the Sky Keep can rise.'); }
      for (const u of run.roster.filter((x) => b.units.some((p) => p.uid === x.uid))) { u.stats.sta += 2; u.stats.lck += 1; }
      lines.push(`Trial passed! ${WEAPONS[reward]?.name ?? GEAR[reward]?.name ?? reward} is yours, and the participants are blessed (+2 stamina, +1 LCK).`);
    } else lines.push('The trial is failed. The Silent Realm fades; you can try again at another Trial Gate.');
    return lines;
  }
  if (st?.trialOpened) { sw.trialPending = b.world; lines.push('The Trial Gate is open: your next battle is a Silent Realm trial.'); }
  if (!won) return lines;
  // Materials from fallen monsters (and the Cursed Medal's extra share)
  const mats = st?.materials ?? [];
  for (const m of mats) addQ(run, m);
  if (mats.length) lines.push(`Treasures: ${summarize(mats)}.`);
  // Insects
  const ss = WORLDS[b.world]?.campaign === 'skyward';
  const nets = worn(run, 'bugNet');
  const insects = INSECTS_BY_REGION[b.world];
  if (insects?.length && (ss || nets.length)) {
    let n = nets.some((u) => hasEffect(u, 'bigBugNet')) ? 2 : nets.length ? 1 : rng.chance(30) ? 1 : 0;
    if (worn(run, 'bugMedal').length) n *= 2;
    const got: string[] = [];
    for (let i = 0; i < n; i++) got.push(rng.pick(insects));
    for (const g of got) addQ(run, g);
    if (got.length) lines.push(`Insects caught: ${summarize(got)}.`);
  }
  // A sacred flame from the region's boss
  const flame = FLAMES[b.world];
  if (flame && b.nodeType === 'boss' && !q(run).includes(flame) && (flame !== 'hyliasBlessing' || b.fallen.some((u) => u.isBoss && ['imprisonedFlying', 'demiseBoss', 'imprisoned', 'imprisonedArmed'].includes(u.bossId ?? '')))) {
    addQ(run, flame);
    lines.push(`${flame === 'hyliasBlessing' ? "Hylia's Blessing" : flame === 'faroresFlame' ? "Farore's Flame" : flame === 'nayrusFlame' ? "Nayru's Flame" : "Din's Flame"} burns where the boss fell. (Use it to upgrade the goddess's sword.)`);
  }
  // The Dragons and Levias teach the Song of the Hero after fighting beside you.
  for (const t of st?.deployed ?? []) {
    const part = SONG_PARTS[t];
    if (part && !q(run).includes(part) && !q(run).includes('songOfTheHeroComplete')) { addQ(run, part); lines.push(`${t === 'levias' ? 'Levias' : t.replace('Dragon', '')} teaches you a part of the Song of the Hero.`); }
  }
  // Gratitude: side quests done
  if (sideDone && (ss || run.roster.some((u) => u.skills.includes('gratitude')) || worn(run, 'gratitudePendant').length)) {
    const n = 1 + (run.roster.some((u) => u.skills.includes('gratitude')) ? 1 : 0) + (worn(run, 'gratitudePendant').length ? 1 : 0);
    addQ(run, 'gratitudeCrystal', n);
    lines.push(`+${n} Gratitude Crystal${n > 1 ? 's' : ''} (${questCount(run, 'gratitudeCrystal')} held).`);
    if (run.roster.some((u) => u.skills.includes('gratitude'))) armyOf(run).reputation = Math.min(100, armyOf(run).reputation + 3);
  }
  if (worn(run, 'gratitudePendant').length) armyOf(run).reputation = Math.min(100, armyOf(run).reputation + 2);
  // Heart Medal: healing finds
  for (const u of worn(run, 'heartMedal')) {
    u.hp = Math.min(u.stats.hp, u.hp + Math.ceil(u.stats.hp * 0.05));
    if (rng.chance(40)) { if (u.pack.length < 6) u.pack.push({ id: 'redPotion', uses: 1 }); else run.convoy.push('redPotion'); lines.push(`${u.name} finds a Heart Potion.`); }
  }
  lines.push(...skywardQuestCheck(run));
  return lines;
}

function summarize(ids: string[]): string {
  const c = new Map<string, number>();
  for (const id of ids) c.set(id, (c.get(id) ?? 0) + 1);
  return [...c].map(([id, n]) => `${MATERIALS.find((m) => m.id === id)?.name ?? id}${n > 1 ? ` ×${n}` : ''}`).join(', ');
}

/** Skyward campaign region choices after a boss: Skyloft → the Sky → the surface → the deeper places → the Demon's Realm. */
export function skywardRegionOptions(run: Run, rng: RNG): string[] {
  const qi = run.questItems ?? [];
  const recent = run.regionsVisited.slice(-2);
  const been = (r: string) => run.regionsVisited.includes(r);
  if (run.region === 'skyloft' && !been('theSky')) return ['theSky'];
  const pool = SKYWARD_REGIONS.filter((r) => {
    if (recent.includes(r) || r === 'skyloft') return false;
    if (r === 'lanayruSandSea') return qi.includes('ancientSeaChart') || been('lanayruDesert') || run.act >= 4;
    if (r === 'ancientCistern') return been('faronWoodsSS') || run.act >= 3;
    if (r === 'fireSanctuary') return been('eldinVolcano') || run.act >= 4;
    if (r === 'sealedGrounds') return run.act >= 2;
    if (r === 'skyKeep') return qi.includes('stoneOfTrials') || run.act >= 6;
    if (r === 'demonsRealm') return been('sealedGrounds') && (been('skyKeep') || run.act >= 7);
    return true;
  });
  return rng.shuffle(pool).slice(0, 3);
}

// ───────────────────────── Crafting (section 13) ─────────────────────────

export interface CraftCost { mats: Record<string, number>; sacred: string[]; rupees: number; generic: number; ok: boolean; missing: string[] }

/** How much a recipe costs this army (discounts for Gondo, Groose and the engineering groups). */
export function recipeCost(run: Run, r: Recipe): CraftCost {
  const has = (t: string) => run.roster.some((u) => u.templateId === t);
  let mult = 1;
  if (run.roster.some((u) => u.skills.includes('masterUpgrader'))) mult *= 0.75;
  if (run.bonus === 'groosesEngineering') mult *= 0.75;
  if (['gondo', 'scrapper', 'skipper'].every(has)) mult *= 0.7;
  if (['gondo', 'biggoron', 'medigoron'].every(has)) mult *= 0.7;
  const mats: Record<string, number> = {};
  let generic = 0;
  const missing: string[] = [];
  for (const [id, n] of Object.entries(r.mats)) {
    const need = Math.max(1, Math.ceil(n * mult - 1e-9));
    mats[id] = need;
    const short = Math.max(0, need - questCount(run, id));
    generic += short * GENERIC_PER_MATERIAL;
    if (short) missing.push(id);
  }
  const sacredMissing = (r.sacred ?? []).filter((s) => !q(run).includes(s));
  const rupees = Math.round(r.rupees * (run.bonus === 'groosesEngineering' ? 0.9 : 1));
  const ok = !sacredMissing.length && run.rupees >= rupees && armyOf(run).materials >= generic;
  return { mats, sacred: r.sacred ?? [], rupees, generic, ok, missing: [...missing, ...sacredMissing] };
}

/** Where a recipe's starting item is: a unit (uid) or the convoy (null). */
export function recipeHolders(run: Run, r: Recipe): (string | null)[] {
  const out: (string | null)[] = [];
  for (const u of run.roster) if (u.weapons.includes(r.from) || Object.values(u.gear).includes(r.from)) out.push(u.uid);
  if (run.convoy.includes(r.from)) out.push(null);
  return out;
}

/** Recipes the army could use right now (it holds the starting item). */
export function availableRecipes(run: Run): Recipe[] {
  return RECIPES.filter((r) => recipeHolders(run, r).length > 0 && (WEAPONS[r.to] || GEAR[r.to]));
}

/** Upgrade an item: spend materials (generic army materials fill gaps), Rupees and sacred flames. */
export function craft(run: Run, recipeId: string, holder: string | null): boolean {
  const r = RECIPES.find((x) => x.id === recipeId);
  if (!r) return false;
  const cost = recipeCost(run, r);
  if (!cost.ok) return false;
  const u = holder ? run.roster.find((x) => x.uid === holder) : undefined;
  if (holder && !u) return false;
  if (!replaceItem(run, u, r.from, r.to)) return false;
  for (const [id, n] of Object.entries(cost.mats)) takeQ(run, id, Math.min(n, questCount(run, id)));
  for (const s of cost.sacred) takeQ(run, s, 1);
  armyOf(run).materials -= cost.generic;
  run.rupees -= cost.rupees;
  return true;
}

function replaceItem(run: Run, u: Unit | undefined, from: string, to: string): boolean {
  if (!u) {
    const i = run.convoy.indexOf(from);
    if (i < 0) return false;
    run.convoy[i] = to;
    if (run.itemState?.[from]) delete run.itemState[from];
    return true;
  }
  const wi = u.weapons.indexOf(from);
  if (wi >= 0) {
    u.weapons[wi] = to;
    if (u.wear) delete u.wear[from];
    if (u.forge?.[from]) { u.forge[to] = u.forge[from]; delete u.forge[from]; }
    return true;
  }
  for (const [slot, id] of Object.entries(u.gear)) {
    if (id !== from) continue;
    u.gear[slot as keyof Unit['gear']] = to;
    if (u.shieldDmg?.[from] !== undefined) { const rest = { ...u.shieldDmg }; delete rest[from]; u.shieldDmg = rest; }
    return true;
  }
  return false;
}

/** Shield repair at the workshop. */
export function shieldRepairCost(u: Unit): number {
  const id = u.gear.shield;
  const def = id ? GEAR[id] : undefined;
  const dmg = id ? u.shieldDmg?.[id] ?? 0 : 0;
  if (!def?.durability || !dmg) return 0;
  return Math.max(10, Math.round(def.price * 0.3 * (dmg / def.durability)));
}

export function repairShield(run: Run, uid: string): boolean {
  const u = run.roster.find((x) => x.uid === uid);
  const cost = u ? shieldRepairCost(u) : 0;
  if (!u || !cost || run.rupees < cost) return false;
  run.rupees -= cost;
  const rest = { ...u.shieldDmg };
  delete rest[u.gear.shield!];
  u.shieldDmg = rest;
  return true;
}

/** The materials bag (quest-inventory treasures and insects). */
export function materialBag(run: Run): { id: string; name: string; n: number; insect: boolean }[] {
  return MATERIALS.map((m) => ({ id: m.id, name: m.name, n: questCount(run, m.id), insect: !!m.insect })).filter((m) => m.n > 0);
}

/** Adventure Pouch Upgrade, used outside battle. */
export function canUsePouch(u: Unit, index: number): boolean {
  return u.pack[index]?.id === 'adventurePouch' && (u.packBonus ?? 0) < 4 && !!ITEMS.adventurePouch;
}

export function usePouch(u: Unit, index: number): boolean {
  if (!canUsePouch(u, index)) return false;
  u.packBonus = (u.packBonus ?? 0) + 1;
  const p = u.pack[index];
  if (--p.uses <= 0) u.pack.splice(index, 1);
  return true;
}
