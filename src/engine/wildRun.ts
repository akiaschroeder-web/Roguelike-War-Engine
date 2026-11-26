// The Era of the Wild campaign: the three-layer map (surface, sky, depths) joined by
// towers, chasms and Ascend points; the Blood Moon; the army-wide stats of section
// 31; materials, cooking, fusion and the camp facilities of section 32; Zonai
// vehicles and Autobuild blueprints (kept between campaigns); monster tiers for recruits.

import { BOSSES, ENEMIES, GEAR, ITEMS, REGION_BOSSES, TEMPLATES, WEAPONS, WORLDS } from '../data/registry';
import { FORAGE, MATERIAL_BY_ID, MATERIALS, MEALS, VEHICLES, VEHICLE_BY_ID, WILD_CLIMATE, ZONAI_DEVICES, type CookFamily } from '../content/wild';
import { adjustMorale, armyCap, armyOf } from './army';
import type { RNG } from './rng';
import { makeHero, rollLevelUp } from './units';
import { applyTier, cureGloom, fuseOf, tierFor } from './wild';
import { TIERED } from '../content/wild';
import type { Battle, EventEffect, MapNode, Run, RunMap, Unit } from './types';

declare module './types' {
  interface Run {
    /** Era of the Wild: army-wide stats and the campaign's state. */
    wild?: WildRunState;
  }
}

export interface WildRunState {
  /** Section 31: new army stats. */
  energyCap: number;
  blueprintCap: number;
  research: number;
  construction: number;
  cooking: number;
  fusion: number;
  explore: { surface: number; sky: number; depths: number };
  gloomRes: number;
  colossal: number;
  /** Battles until the next Blood Moon; nodes it still lasts. */
  bloodMoonIn: number;
  bloodMoon: number;
  bloodMoons: number;
  compendium: string[];
  compendiumSold: number;
  /** Camp facility actions already taken at this camp. */
  campUsed: string[];
}

const BLUEPRINT_KEY = 'hyrule.wild.blueprints.v1';
export const WILD_REGIONS = Object.values(WORLDS).filter((w) => w.campaign === 'wild').map((w) => w.id);
const layerOf = (r: string) => WORLDS[r]?.layer ?? 'surface';

export function wildOf(run: Run): WildRunState {
  return (run.wild ??= {
    energyCap: 30, blueprintCap: 2, research: 1, construction: 1, cooking: 1, fusion: 1, explore: { surface: 1, sky: 0, depths: 0 },
    gloomRes: 0, colossal: 1, bloodMoonIn: 7, bloodMoon: 0, bloodMoons: 0, compendium: [], compendiumSold: 0, campUsed: [],
  });
}

const q = (run: Run) => (run.questItems ??= []);
export const wildCount = (run: Run, id: string) => (run.questItems ?? []).filter((x) => x === id).length;
const addQ = (run: Run, id: string, n = 1) => { for (let i = 0; i < n; i++) q(run).push(id); };
function takeQ(run: Run, id: string, n: number): boolean {
  if (wildCount(run, id) < n) return false;
  for (let i = 0; i < n; i++) q(run).splice(q(run).indexOf(id), 1);
  return true;
}
const inArmy = (run: Run, t: string) => run.roster.some((u) => u.templateId === t);
const skill = (run: Run, s: string) => run.roster.some((u) => u.skills.includes(s));

// ───────────────────────── Blueprints (kept between campaigns) ─────────────────────────

function storage(): Storage | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; }
}
export function savedBlueprints(): string[] {
  try { const raw = storage()?.getItem(BLUEPRINT_KEY); return raw ? (JSON.parse(raw) as string[]).filter((v) => VEHICLE_BY_ID[v]) : []; } catch { return []; }
}
function persistBlueprint(id: string) {
  try { const cur = savedBlueprints(); if (!cur.includes(id)) storage()?.setItem(BLUEPRINT_KEY, JSON.stringify([...cur, id])); } catch { /* storage blocked */ }
}
export const blueprints = (run: Run) => (run.questItems ?? []).filter((x) => x.startsWith('blueprint_')).map((x) => x.slice(10));

/** Unlock a vehicle blueprint (the cheapest locked one unless named). */
export function unlockBlueprint(run: Run, id?: string): string | null {
  const have = blueprints(run);
  const w = wildOf(run);
  if (have.length >= w.blueprintCap + 3) return null;
  const pick = id ?? [...VEHICLES].sort((a, c) => a.zonaite - c.zonaite).find((v) => !have.includes(v.id))?.id;
  if (!pick || have.includes(pick)) return null;
  addQ(run, `blueprint_${pick}`);
  persistBlueprint(pick);
  return pick;
}

// ───────────────────────── Campaign start ─────────────────────────

export function wildStart(run: Run) {
  const w = wildOf(run);
  for (const id of savedBlueprints()) if (!q(run).includes(`blueprint_${id}`)) addQ(run, `blueprint_${id}`);
  addQ(run, 'apple', 3); addQ(run, 'mightyBananas', 2); addQ(run, 'hylianRice', 1); addQ(run, 'zonaite', 6);
  if (run.commanderId === 'mineru' || run.commanderId === 'rauruZonai') addQ(run, 'zonaite', 6);
  if (run.commanderId === 'kohga') addQ(run, 'yigaSchematic');
  if (run.commanderId === 'zeldaWild') w.research = 2;
  if (run.commanderId === 'yunobo') addQ(run, 'amber', 2);
  for (const u of run.roster) if (u.isCommander && u.templateId === 'heroOfTheWild' && !u.gear.tool) u.gear.tool = 'sheikahSlate';
}

/** Battle setup from the campaign: Energy Cell, Blood Moon, Gloom resistance. */
export function wildBattleSetup(run: Run, b: Battle) {
  if (run.campaign !== 'wild' && !b.wild) return;
  const w = wildOf(run);
  const st = (b.wild ??= {
    energy: 30, energyMax: 30, timers: [], materials: [], fields: [], prevPos: {}, turnHp: {}, alliesHurt: 0, locks: {}, upkeep: {}, pristine: [],
    layer: WORLDS[b.world]?.layer ?? 'surface', used: [], lastWeapon: {}, hits: {}, bombs: [], cones: [], gloomRes: 0,
  });
  st.energyMax = w.energyCap + (b.units.some((u) => u.team === 'player' && Object.values(u.gear).includes('zonaiPowerCrystal')) ? 15 : 0);
  st.energy = st.energyMax;
  st.gloomRes = w.gloomRes;
  st.bloodMoon = w.bloodMoon > 0;
  for (const u of b.units.filter((x) => x.team === 'player')) {
    (u.turnUses ??= {}).fusionProf = w.fusion;
    if (run.bonus === 'fusionMastery') u.buffs.push({ id: 'fusionMastery', name: 'Fusion Mastery', turns: 99 });
  }
  // Master Kohga's army ambushes the ambushers: no enemy opening strike.
  if (run.bonus === 'yigaAmbush' && b.nodeType === 'ambush') b.ambushed = true;
  // Master Cycle Zero burns materials.
  for (const u of b.units.filter((x) => x.team === 'player' && x.gear.mount === 'masterCycleZeroMount')) {
    const a = armyOf(run);
    if (a.materials > 0) a.materials--; else u.buffs.push({ id: 'noFuel', name: 'Out of fuel', turns: 99, stats: { mov: -3 } });
  }
  for (const u of b.units.filter((x) => x.team === 'player' && x.skills.includes('ancientEngine'))) if (armyOf(run).materials > 0) u.buffs.push({ id: 'engine', name: 'Ancient Engine', turns: 99, stats: { mov: 2 } });
}

// ───────────────────────── The three-layer map ─────────────────────────

/** How the layers connect: towers launch you skyward, chasms drop you into the Depths, Ascend points lead back up. */
export const WILD_LINKS: Record<string, { to: string; via: string }[]> = {
  greatPlateau: [{ to: 'centralHyrule', via: 'the road' }, { to: 'necluda', via: 'the road' }, { to: 'greatSkyIsland', via: 'a Skyview Tower' }],
  centralHyrule: [{ to: 'hyruleCastleWild', via: 'the road' }, { to: 'kakarikoWild', via: 'the road' }, { to: 'lanayruWild', via: 'the road' }, { to: 'gerudoWild', via: 'the road' }, { to: 'hebra', via: 'the road' }, { to: 'greatHyruleForest', via: 'the road' }, { to: 'depthsMines', via: 'a chasm' }, { to: 'finalTrial', via: 'the Sword trial' }],
  hyruleCastleWild: [{ to: 'centralHyrule', via: 'the road' }, { to: 'gloomsOrigin', via: 'the chasm beneath the castle' }, { to: 'skyArchipelago', via: 'the floating castle' }],
  hateno: [{ to: 'necluda', via: 'the road' }, { to: 'kakarikoWild', via: 'the road' }, { to: 'lanayruWild', via: 'the road' }],
  kakarikoWild: [{ to: 'hateno', via: 'the road' }, { to: 'centralHyrule', via: 'the road' }, { to: 'akkala', via: 'the road' }, { to: 'necluda', via: 'the road' }],
  akkala: [{ to: 'kakarikoWild', via: 'the road' }, { to: 'eldinWild', via: 'the road' }, { to: 'lanayruWild', via: 'the road' }, { to: 'depthsMines', via: 'a chasm' }],
  lanayruWild: [{ to: 'hateno', via: 'the road' }, { to: 'akkala', via: 'the road' }, { to: 'centralHyrule', via: 'the road' }, { to: 'skyArchipelago', via: 'a Skyview Tower' }],
  eldinWild: [{ to: 'akkala', via: 'the road' }, { to: 'greatHyruleForest', via: 'the road' }, { to: 'depthsMines', via: 'a chasm' }, { to: 'skyArchipelago', via: 'a Skyview Tower' }],
  hebra: [{ to: 'centralHyrule', via: 'the road' }, { to: 'gerudoWild', via: 'the road' }, { to: 'skyArchipelago', via: 'a Skyview Tower' }, { to: 'greatHyruleForest', via: 'the road' }],
  gerudoWild: [{ to: 'hebra', via: 'the road' }, { to: 'faronWild', via: 'the road' }, { to: 'centralHyrule', via: 'the road' }, { to: 'depthsMines', via: 'a chasm' }, { to: 'spiritTemple', via: 'the chasm in the canyon' }],
  faronWild: [{ to: 'necluda', via: 'the road' }, { to: 'gerudoWild', via: 'the road' }, { to: 'lanayruWild', via: 'the road' }],
  necluda: [{ to: 'greatPlateau', via: 'the road' }, { to: 'hateno', via: 'the road' }, { to: 'faronWild', via: 'the road' }, { to: 'kakarikoWild', via: 'the road' }],
  greatHyruleForest: [{ to: 'centralHyrule', via: 'the road' }, { to: 'eldinWild', via: 'the road' }, { to: 'hebra', via: 'the road' }],
  greatSkyIsland: [{ to: 'skyArchipelago', via: 'a glide' }, { to: 'greatPlateau', via: 'a dive' }, { to: 'centralHyrule', via: 'a dive' }],
  skyArchipelago: [{ to: 'greatSkyIsland', via: 'a glide' }, { to: 'hebra', via: 'a dive' }, { to: 'lanayruWild', via: 'a dive' }, { to: 'eldinWild', via: 'a dive' }],
  depthsMines: [{ to: 'spiritTemple', via: 'the dark' }, { to: 'centralHyrule', via: 'an Ascend pillar' }, { to: 'akkala', via: 'an Ascend pillar' }, { to: 'eldinWild', via: 'an Ascend pillar' }, { to: 'gerudoWild', via: 'an Ascend pillar' }],
  spiritTemple: [{ to: 'depthsMines', via: 'the dark' }, { to: 'gloomsOrigin', via: 'the dark' }, { to: 'gerudoWild', via: 'an Ascend pillar' }],
  gloomsOrigin: [{ to: 'hyruleCastleWild', via: 'an Ascend pillar' }],
  finalTrial: [{ to: 'greatPlateau', via: 'the road' }, { to: 'centralHyrule', via: 'the road' }],
};

/** Wild region choices after a boss: neighbours on the map, gated by layer access. */
export function wildRegionOptions(run: Run, rng: RNG): string[] {
  const qi = run.questItems ?? [];
  const recent = run.regionsVisited.slice(-2);
  const been = (r: string) => run.regionsVisited.includes(r);
  const ok = (r: string) => {
    if (recent.includes(r)) return false;
    if (layerOf(r) === 'sky' && !(qi.includes('skyviewActivated') || run.act >= 2 || been('greatSkyIsland'))) return false;
    if (layerOf(r) === 'depths' && !(qi.includes('lightrootBlessing') || run.act >= 2)) return false;
    if (r === 'gloomsOrigin') return run.act >= 5 && (been('spiritTemple') || been('hyruleCastleWild') || run.act >= 7);
    if (r === 'finalTrial') return run.act >= 4;
    if (r === 'hyruleCastleWild') return run.act >= 3;
    return true;
  };
  const links = (WILD_LINKS[run.region] ?? []).map((l) => l.to).filter(ok);
  // Travel Medallion: any region visited so far. Tower maps: one more option.
  if (qi.includes('travelMedallion')) { links.push(...run.regionsVisited.filter((r) => ok(r) && !links.includes(r))); takeQ(run, 'travelMedallion', 1); }
  const extra = (qi.includes('sheikahTowerMap') ? 1 : 0) + (qi.includes('purahPadItem') ? 1 : 0);
  if (extra) for (const r of rng.shuffle(WILD_REGIONS.filter((x) => ok(x) && !links.includes(x))).slice(0, extra)) links.push(r);
  if (qi.includes('sheikahTowerMap')) takeQ(run, 'sheikahTowerMap', 1);
  const options = links.length ? links : WILD_REGIONS.filter((r) => !recent.includes(r) && r !== 'gloomsOrigin');
  return rng.shuffle([...new Set(options)]).slice(0, 3 + extra);
}

/** New region map: exploration, shrines (Kass, the Shrine Sensor), news (Penn), Blood Moon returns. */
export function wildDecorateMap(run: Run, map: RunMap, rng: RNG) {
  if (run.campaign !== 'wild') return;
  const w = wildOf(run);
  const layer = layerOf(run.region);
  const explore = w.explore[layer];
  const qi = run.questItems ?? [];
  const battles = map.nodes.filter((n) => n.type === 'battle' && n.row > 0 && n.row < map.rows - 1);
  let extra = (skill(run, 'breakingNews') ? 1 : 0) + (skill(run, 'ancientBallads') || qi.includes('shrineSensor') ? 1 : 0)
    + (run.roster.some((u) => Object.values(u.gear).includes('satorisBlessing')) ? 1 : 0);
  for (const n of battles) { if (rng.chance(6 * explore)) n.type = rng.pick(['event', 'treasure']); }
  for (const n of rng.shuffle(battles)) { if (extra-- <= 0) break; n.type = 'event'; }
  if (w.bloodMoon > 0) bloodMoonReturns(run, map, rng);
}

/** Defeated regional bosses return under the Blood Moon as optional elite fights. */
function bloodMoonReturns(run: Run, map: RunMap, rng: RNG) {
  const wildBosses = new Set(Object.entries(REGION_BOSSES).filter(([r]) => WILD_REGIONS.includes(r)).flatMap(([, ids]) => ids));
  const beaten = run.bossesFought.filter((id) => BOSSES[id] && (wildBosses.has(id) || run.campaign === 'wild'));
  if (!beaten.length) return;
  const cand = map.nodes.filter((n) => n.type === 'battle' && n.row >= 2 && n.row < map.rows - 1 && !n.bossReturn);
  const n = cand.length ? rng.pick(cand) : undefined;
  if (n) { n.type = 'elite'; n.bossReturn = rng.pick(beaten); }
}

/** Blood Moon countdown after each battle. Returns a log line when it rises or sets. */
export function advanceBloodMoon(run: Run, rng: RNG): string | null {
  const w = wildOf(run);
  if (w.bloodMoon > 0) { w.bloodMoon--; return w.bloodMoon === 0 ? 'The Blood Moon sets.' : null; }
  w.bloodMoonIn--;
  if (w.bloodMoonIn > 0) return null;
  return riseBloodMoon(run, rng);
}

export function riseBloodMoon(run: Run, rng: RNG): string {
  const w = wildOf(run);
  w.bloodMoon = 3; w.bloodMoons++; w.bloodMoonIn = 6 + rng.int(0, 3);
  bloodMoonReturns(run, run.map, rng);
  return 'The Blood Moon rises! Slain monsters return stronger, their camps restock, and anything cooked tonight comes out perfect. A beaten boss stirs on the map.';
}

/** The boss fought at a Blood Moon return node. */
export function returnBoss(node: MapNode | undefined) {
  return node?.bossReturn ? BOSSES[node.bossReturn] : undefined;
}

export function bloodMoonLabel(run: Run): string {
  const w = wildOf(run);
  if (w.bloodMoon > 0) return `🌕 Blood Moon (${w.bloodMoon})`;
  return skill(run, 'lunarPrediction') ? `🌙 Blood Moon in ${w.bloodMoonIn}` : '🌙';
}

/** Colossal Deployment Capacity: how many size-5 units can deploy (the commander doesn't count). */
export function colossalCap(run: Run): number {
  return run.campaign === 'wild' || run.wild ? wildOf(run).colossal : 99;
}

// ───────────────────────── After battle ─────────────────────────

const TIER_LEVELS = [6, 12, 18, 24];

export function wildAfterBattle(run: Run, b: Battle, won: boolean, rng: RNG): string[] {
  const st = b.wild;
  const isWild = run.campaign === 'wild' || WORLDS[b.world]?.campaign === 'wild';
  if (!st && !isWild) return [];
  const w = wildOf(run);
  const lines: string[] = [];
  if (won) {
    // Materials and quest finds picked up in battle
    const got = (st?.materials ?? []).filter((m) => !m.startsWith('compendium:'));
    for (const m of got) addQ(run, m);
    if (got.length) lines.push(`Collected: ${summarize(got)}.`);
    for (const c of (st?.materials ?? []).filter((m) => m.startsWith('compendium:'))) { const id = c.slice(11); if (!w.compendium.includes(id)) w.compendium.push(id); }
    // Foraging by layer and climate
    if (isWild) {
      const layer = layerOf(b.world);
      const pool = [...FORAGE[layer], ...(WILD_CLIMATE[b.world] === 'cold' ? FORAGE.cold : WILD_CLIMATE[b.world] === 'hot' ? FORAGE.hot : WILD_CLIMATE[b.world] === 'storm' ? FORAGE.storm : WILD_CLIMATE[b.world] === 'volcanic' ? FORAGE.volcano : []),
        ...(b.tiles.includes('water') ? FORAGE.water : []), ...(b.tiles.includes('forest') ? FORAGE.forest : [])];
      const n = 2 + (w.bloodMoon > 0 ? 2 : 0) + (b.nodeType === 'boss' ? 2 : 0);
      const found: string[] = [];
      for (let i = 0; i < n; i++) found.push(rng.pick(pool));
      if (layer === 'depths' || layer === 'sky') found.push('zonaite');
      if (skill(run, 'ancientTranslation') && layer === 'sky') found.push('zonaite');
      if (skill(run, 'miningAuthority')) found.push(rng.pick(['amber', 'opal', 'luminousStone']));
      for (const f of found) addQ(run, f);
      lines.push(`Foraged: ${summarize(found)}.`);
    }
    // Pristine weapons and the Depths' Lightroot blessing
    for (const id of st?.pristine ?? []) (run.itemState ??= {})[id] = { ...(run.itemState?.[id] ?? {}), mod: 'pristine' };
    // Zonaite refinement (Forge Construct)
    if (skill(run, 'zonaiteRefinement') && takeQ(run, 'zonaite', 3)) { addQ(run, 'crystallizedCharge'); lines.push('The Forge Construct refines 3 Zonaite into a Crystallized Charge.'); }
    if (skill(run, 'desertNavigation')) { run.rupees += 30; lines.push('Patricia sniffs out buried treasure (+₹30).'); }
    // Monster tiers advance with experience.
    for (const u of run.roster) {
      const id = u.templateId ?? '';
      if (!TIERED.has(id)) continue;
      const tier = TIER_LEVELS.filter((l) => u.level >= l).length;
      if (tier > (u.wildTier ?? 0)) { applyTier(u, tier); lines.push(`${u.name} grows stronger: it reaches a new tier!`); }
    }
  }
  // Sunlight heals Gloom on the surface and in the sky; Lightroots help in the Depths.
  const layer = layerOf(b.world);
  let healed = 0;
  for (const u of run.roster) if (u.gloom) healed += cureGloom(u, layer === 'depths' ? (q(run).includes('lightrootBlessing') ? 3 : 0) : Math.ceil(u.gloom / 2));
  if (healed) lines.push(`${layer === 'depths' ? 'Lightroot glow' : 'Sunlight'} restores ${healed} max HP lost to Gloom.`);
  // Permanent dragons stay dragons.
  if (isWild || run.wild) { const bm = advanceBloodMoon(run, rng); if (bm) lines.push(bm); }
  return lines;
}

function summarize(ids: string[]): string {
  const c = new Map<string, number>();
  for (const id of ids) c.set(id, (c.get(id) ?? 0) + 1);
  return [...c].map(([id, n]) => `${MATERIAL_BY_ID[id]?.name ?? ITEMS[id]?.name ?? id.replace(/([A-Z])/g, ' $1').toLowerCase()}${n > 1 ? ` ×${n}` : ''}`).join(', ');
}

// ───────────────────────── Recruitment ─────────────────────────

/** Recruit weighting: Kilton, Paya, Koltin, the Bubbul Gem Pendant. Vehicles are built, not recruited. */
export function wildRecruitWeight(run: Run, t: { id: string; race: string; monster?: boolean; rare?: boolean }): number {
  let m = 1;
  if (t.race === 'zonaiVehicle' && !t.id.startsWith('masterCycle')) return 0;
  if (t.monster && skill(run, 'monsterAppreciation')) m *= 2;
  if (t.race === 'sheikah' && skill(run, 'inheritedResponsibility')) m *= 2;
  if ((t.id === 'bubbulfrog' || t.id === 'blupee') && (skill(run, 'satoriObsession') || run.roster.some((u) => Object.values(u.gear).includes('bubbulGemPendant')))) m *= 4;
  return m;
}

/** A recruited monster joins at a tier (stronger under the Blood Moon). */
export function wildOnRecruit(run: Run, u: Unit, rng: RNG) {
  if (run.campaign !== 'wild' || !TIERED.has(u.templateId ?? '')) return;
  const w = wildOf(run);
  const t = Math.min(4, tierFor(u.level + (w.bloodMoon > 0 ? 6 : 0), rng, w.bloodMoon > 0) + (w.bloodMoon > 0 ? 1 : 0));
  if (t) applyTier(u, t);
}

// ───────────────────────── Event effects ─────────────────────────

export function applyWildEffect(run: Run, e: Extract<EventEffect, { kind: 'wild' }>, rng: RNG): string | null {
  const w = wildOf(run);
  const pickUnit = (f: (u: Unit) => boolean = () => true) => rng.pick(run.roster.filter(f).length ? run.roster.filter(f) : run.roster);
  switch (e.op) {
    case 'bloodMoon': return riseBloodMoon(run, rng);
    case 'delayBloodMoon': w.bloodMoonIn += e.amount ?? 3; return `The Blood Moon is ${w.bloodMoonIn} battles away.`;
    case 'cureGloom': { let n = 0; for (const u of run.roster) n += cureGloom(u); return n ? `The Gloom lifts (+${n} max HP).` : 'No one was Gloomed.'; }
    case 'energyCap': w.energyCap += e.amount ?? 10; return `Energy Cell capacity ${w.energyCap}.`;
    case 'blueprint': { const id = unlockBlueprint(run); return id ? `Autobuild blueprint: ${TEMPLATES[id]?.name ?? id} (kept for future campaigns).` : 'You already know every blueprint you can hold.'; }
    case 'stat': {
      const k = e.id ?? 'research';
      if (k === 'exploreSurface') w.explore.surface++;
      else if (k === 'exploreSky') w.explore.sky++;
      else if (k === 'exploreDepths') w.explore.depths++;
      else if (k in w) (w as unknown as Record<string, number>)[k] += e.amount ?? 1;
      return `${STAT_LABEL[k] ?? k} +${e.amount ?? 1}.`;
    }
    case 'mats': {
      const kind = e.id ?? 'food';
      const pool = kind === 'bubbul' ? ['bubbulGem'] : MATERIALS.filter((m) => m.kind === kind || (kind === 'food' && m.kind === 'critter')).map((m) => m.id);
      const got: string[] = [];
      for (let i = 0; i < (e.amount ?? 1); i++) { const id = rng.pick(pool); addQ(run, id); got.push(id); }
      return `Found: ${summarize(got)}.`;
    }
    case 'korok': addQ(run, 'korokSeed', e.amount ?? 1); return `+${e.amount ?? 1} Korok Seed${(e.amount ?? 1) > 1 ? 's' : ''} (${wildCount(run, 'korokSeed')}).`;
    case 'poe': addQ(run, 'poe', e.amount ?? 1); return `+${e.amount ?? 1} Poes (${wildCount(run, 'poe')}).`;
    case 'meal': {
      const meals = ['mightyBananaSkewer', 'heartyFriedWildGreens', 'toughMushroomSkewer', 'hastyMushroomSkewer', 'energizingMushroomSkewer'];
      for (let i = 0; i < (e.amount ?? 1) * (w.bloodMoon > 0 ? 2 : 1); i++) run.convoy.push(rng.pick(meals));
      return 'Meals packed into the convoy.';
    }
    case 'packSlot': { const u = pickUnit((x) => (x.packBonus ?? 0) < 4); u.packBonus = Math.min(4, (u.packBonus ?? 0) + 1); return `${u.name}'s pack grows (+1 slot).`; }
    case 'armyCap': run.metaBonus = { ...(run.metaBonus ?? {}), armyCap: (run.metaBonus?.armyCap ?? 0) + (e.amount ?? 1) }; return `Army capacity ${armyCap(run)}.`;
    case 'armorStar': { const u = pickUnit((x) => !!(x.gear.head || x.gear.body || x.gear.feet)); const n = enhanceArmor(u, e.amount ?? 1); return n ? `${u.name}'s armor is enhanced (${n} piece${n > 1 ? 's' : ''}).` : `${u.name} has no armor to enhance.`; }
    case 'sellMonster': {
      const mats = (run.questItems ?? []).filter((id) => MATERIAL_BY_ID[id]?.kind === 'monster');
      const value = mats.reduce((t, id) => t + RARITY_VALUE[MATERIAL_BY_ID[id].rarity], 0) * (skill(run, 'monsterAppreciation') ? 1.5 : 1);
      run.questItems = (run.questItems ?? []).filter((id) => MATERIAL_BY_ID[id]?.kind !== 'monster');
      run.rupees += Math.round(value);
      return mats.length ? `Sold ${mats.length} monster materials for ₹${Math.round(value)}.` : 'You have nothing Kilton wants.';
    }
    case 'orbHeart': { const u = pickUnit(); u.stats.hp += 5; u.hp += 5; return `${u.name}: +5 max HP.`; }
    case 'orbStamina': { const u = pickUnit(); u.stats.sta += 5; return `${u.name}: +5 stamina.`; }
    case 'sageEnhance': { const u = pickUnit((x) => SAGES.includes(x.templateId ?? '')); for (const k of ['str', 'mag', 'skl', 'def', 'res'] as const) u.stats[k] += 1; u.stats.hp += 3; u.hp += 3; return `${u.name}'s vow grows stronger (+1 to every stat, +3 HP).`; }
    case 'device': { const got: string[] = []; for (let i = 0; i < (e.amount ?? 1); i++) { const d = rng.pick(ZONAI_DEVICES); run.convoy.push(d); got.push(ITEMS[d]?.name ?? d); } return `Capsules: ${got.join(', ')}.`; }
    case 'pristine': {
      const pool = Object.values(WEAPONS).filter((x) => !x.unique && x.type !== 'natural' && x.type !== 'instrument' && ['rare', 'epic', 'legendary'].includes(x.rarity));
      const wpn = rng.pick(pool);
      run.convoy.push(wpn.id);
      (run.itemState ??= {})[wpn.id] = { ...(run.itemState?.[wpn.id] ?? {}), mod: 'pristine' };
      return `A pristine ${wpn.name} (sent to the convoy).`;
    }
    case 'reviveMount': {
      const i = run.fallen.findIndex((u) => u.race === 'wildMount' || u.classId === 'warSteed' || !!u.gear.mount);
      if (i >= 0 && run.roster.length < armyCap(run)) { const [u] = run.fallen.splice(i, 1); run.roster.push({ ...u, hp: u.stats.hp }); return `${u.name} returns from beyond.`; }
      run.convoy.push('royalWhiteStallionMount');
      return 'Malanya gives you a fine horse instead.';
    }
    case 'reverseForm': {
      const u = run.roster.find((x) => x.permanentForm && x.originalForm);
      if (!u) return 'No dragon in your army needs it.';
      const i = run.roster.indexOf(u);
      const back = restoreAll(u);
      run.roster[i] = back;
      return `${back.name} is restored to their old self.`;
    }
  }
  return null;
}

const RARITY_VALUE: Record<string, number> = { common: 10, uncommon: 25, rare: 50, epic: 90, legendary: 150 };
const STAT_LABEL: Record<string, string> = { research: 'Research Level', construction: 'Construction Level', cooking: 'Cooking Level', fusion: 'Fusion Proficiency', gloomRes: 'Gloom Resistance', colossal: 'Colossal Deployment Capacity', blueprintCap: 'Blueprint Capacity', exploreSurface: 'Surface Exploration', exploreSky: 'Sky Exploration', exploreDepths: 'Depths Exploration' };
export const SAGES = ['sidon', 'yunobo', 'tulin', 'riju', 'mineru', 'mineruConstruct'];

function restoreAll(u: Unit): Unit {
  const f = u.originalForm!;
  const ratio = u.hp / Math.max(1, u.stats.hp);
  const stats = { ...f.stats };
  for (const k of Object.keys(stats) as (keyof typeof stats)[]) stats[k] += Math.max(0, u.stats[k] - f.formStats[k]);
  const out: Unit = { ...u, templateId: f.templateId, bossId: f.bossId, name: f.name, title: f.title, race: f.race, classId: f.classId, size: f.size, stats, weapons: f.weapons, skills: f.skills, glyph: f.glyph, abilities: f.abilities };
  out.hp = Math.max(1, Math.ceil(stats.hp * ratio));
  delete out.originalForm; delete out.permanentForm;
  return out;
}

function enhanceArmor(u: Unit, n: number): number {
  let done = 0;
  for (const slot of ['head', 'body', 'feet'] as const) {
    const id = u.gear[slot];
    if (!id) continue;
    const cur = u.armorStars?.[id] ?? 0;
    if (cur >= 4) continue;
    (u.armorStars ??= {})[id] = Math.min(4, cur + n);
    done++;
  }
  return done;
}

// ───────────────────────── Camp facilities (section 32) ─────────────────────────

export interface WildCampOption {
  key: string;
  facility: string;
  label: string;
  desc: string;
  ok: boolean;
  /** Needs a unit picked (with this filter). */
  pick?: (u: Unit) => boolean;
  /** A choice the player makes from a list first. */
  select?: { id: string; label: string }[];
}

export const FACILITIES: Record<string, { name: string; icon: string; where: ('camp' | 'shop' | 'smith')[] }> = {
  lab: { name: 'Ancient Tech Lab', icon: '🔬', where: ['camp', 'smith'] },
  workshop: { name: 'Zonai Workshop', icon: '⚙', where: ['camp'] },
  fusion: { name: 'Fusion Station', icon: '🔗', where: ['camp', 'smith'] },
  cooking: { name: 'Cooking Station', icon: '🍲', where: ['camp'] },
  refinery: { name: 'Crystal Refinery', icon: '💠', where: ['camp'] },
  monsterShop: { name: 'Monster Shop', icon: '🦴', where: ['shop', 'camp'] },
  hudson: { name: 'Hudson Construction Office', icon: '🔨', where: ['camp'] },
  stable: { name: 'Stable', icon: '🐴', where: ['shop', 'camp'] },
  statue: { name: 'Goddess Statue', icon: '🗿', where: ['camp'] },
  bargainer: { name: 'Bargainer Statue', icon: '👻', where: ['shop', 'camp'] },
  fairy: { name: 'Great Fairy Fountain', icon: '🧚', where: ['camp'] },
  compendium: { name: 'Compendium Archive', icon: '📖', where: ['camp'] },
  hestu: { name: "Hestu's Dance", icon: '🌰', where: ['camp'] },
};

/** Total held of an item across the convoy and packs. */
function holding(run: Run, id: string): number {
  return run.convoy.filter((x) => x === id).length + run.roster.reduce((n, u) => n + u.pack.filter((p) => p.id === id).reduce((m, p) => m + p.uses, 0), 0);
}
function takeItem(run: Run, id: string, n: number): boolean {
  if (holding(run, id) < n) return false;
  for (let i = 0; i < n; i++) {
    const c = run.convoy.indexOf(id);
    if (c >= 0) { run.convoy.splice(c, 1); continue; }
    for (const u of run.roster) { const p = u.pack.find((x) => x.id === id); if (p) { if (--p.uses <= 0) u.pack.splice(u.pack.indexOf(p), 1); break; } }
  }
  return true;
}
const zonaiteHeld = (run: Run) => wildCount(run, 'zonaite') + 5 * wildCount(run, 'largeZonaite');
function takeZonaite(run: Run, n: number): boolean {
  if (zonaiteHeld(run) < n) return false;
  while (n > 0 && wildCount(run, 'zonaite') > 0) { takeQ(run, 'zonaite', 1); n--; }
  while (n > 0) { takeQ(run, 'largeZonaite', 1); n -= 5; if (n < 0) addQ(run, 'zonaite', -n); }
  return true;
}

/** Costs after discounts (Hudson, Grantéson, Purah, the commander and group supports). */
function costMult(run: Run, kind: 'vehicle' | 'research' | 'facility' | 'craft'): number {
  let m = 1;
  const all = (ids: string[]) => ids.every((id) => inArmy(run, id));
  if (kind === 'vehicle') {
    if (skill(run, 'hudsonConstruction')) m *= 0.7;
    if (run.bonus === 'yigaAmbush') m *= 0.7;
    if (all(['kohga', 'yigaEngineer', 'groose'])) m *= 0.7;
    if (all(['purah', 'robbie', 'mineru', 'gondo'])) m *= 0.7;
  }
  if (kind === 'research') {
    if (skill(run, 'researchDirector')) m *= 0.75;
    if (run.bonus === 'sacredResearch') m *= 0.75;
    if (all(['purah', 'robbie', 'impaWild'])) m *= 0.7;
  }
  if (kind === 'facility') { if (skill(run, 'modularHousing')) m *= 0.8; if (skill(run, 'hudsonConstruction')) m *= 0.7; }
  if (kind === 'craft' && all(['purah', 'robbie', 'mineru', 'gondo'])) m *= 0.7;
  return m;
}

/** Fusable materials the army holds (plus free rocks and boulders). */
export function fuseChoices(run: Run, shield: boolean): { id: string; label: string }[] {
  const out = [{ id: 'rock', label: 'Rock (+2, free)' }, { id: 'boulder', label: 'Boulder (+5, free)' }];
  for (const m of MATERIALS) {
    if (!m.fuse) continue;
    const n = wildCount(run, m.id);
    if (n) out.push({ id: m.id, label: `${m.name} (+${m.fuse.might}${m.fuse.element ? ` ${m.fuse.element}` : ''}${m.fuse.single ? ', single use' : ''}) ×${n}` });
  }
  if (shield) for (const d of ['zonaiRocket', 'zonaiSpring', 'bombFlower', 'zonaiCart', 'zonaiSled', 'zonaiMirror', 'flameEmitter', 'frostEmitter', 'shockEmitter', 'puffshroom']) { const n = holding(run, d); if (n) out.push({ id: d, label: `${ITEMS[d]?.name ?? d} ×${n}` }); }
  return out;
}

export function wildCampOptions(run: Run, where: 'camp' | 'shop' | 'smith'): WildCampOption[] {
  if (run.campaign !== 'wild') return [];
  const w = wildOf(run);
  const out: WildCampOption[] = [];
  const add = (facility: string, o: Omit<WildCampOption, 'facility'>) => { if (FACILITIES[facility].where.includes(where)) out.push({ facility, ...o }); };
  const used = (k: string) => w.campUsed.includes(k);
  // ── Ancient Tech Lab ──
  const rc = researchCost(run);
  add('lab', { key: 'research', label: `Research (Lv ${w.research} → ${w.research + 1}) — ₹${rc.rupees}, ${rc.parts}× ancient parts`, desc: 'Advanced Sheikah and Zonai gear: each level hands over a piece of ancient equipment.', ok: w.research < 6 && run.rupees >= rc.rupees && ancientParts(run) >= rc.parts });
  add('lab', { key: 'upgradeMachine', label: 'Upgrade a Guardian, construct or Divine Beast — 2 Ancient Gears + an Ancient Core (a Giant Ancient Core for a Divine Beast)', desc: '+4 HP, +1 STR, MAG and DEF.', ok: wildCount(run, 'ancientGear') >= 2,
    pick: (u) => ['guardian', 'zonaiConstruct', 'divineBeast', 'zonaiVehicle'].includes(u.race) && (u.race === 'divineBeast' ? wildCount(run, 'giantAncientCore') > 0 : wildCount(run, 'ancientCore') > 0) });
  // ── Zonai Workshop ──
  for (const v of VEHICLES) {
    const c = vehicleCost(run, v.id, false);
    const devs = Object.entries(c.devices).map(([d, n]) => `${ITEMS[d]?.name ?? d}${n > 1 ? ` ×${n}` : ''}`).join(', ');
    add('workshop', { key: `build:${v.id}`, label: `Build ${TEMPLATES[v.id]?.name ?? v.id} — ${c.zonaite} Zonaite, ${devs}, ₹${c.rupees}`, desc: `${v.purpose}; crew ${v.crew}, ${v.energy} energy a turn.`, ok: c.ok && run.roster.length < armyCap(run) });
    if (blueprints(run).includes(v.id)) {
      const a = vehicleCost(run, v.id, true);
      add('workshop', { key: `autobuild:${v.id}`, label: `Autobuild ${TEMPLATES[v.id]?.name ?? v.id} — ${a.zonaite} Zonaite, ₹${a.rupees} (blueprint)`, desc: 'Rebuilt from a saved blueprint: Zonaite instead of devices.', ok: a.ok && run.roster.length < armyCap(run) });
    }
  }
  add('workshop', { key: 'schema', label: 'Read an Autobuild Schema Stone (unlock a blueprint)', desc: `Blueprints are kept between campaigns (${blueprints(run).length} known, capacity ${w.blueprintCap + 3}).`, ok: wildCount(run, 'autobuildSchemaStone') > 0 });
  add('workshop', { key: 'attach', label: "Attach parts to Mineru's Construct (arms, back device, power core)", desc: 'Left and right arm: the best weapons in the convoy · back: a Zonai Device capsule · core: an Ancient Core or Flux Core.', ok: true,
    pick: (u) => u.templateId === 'mineruConstruct' || u.templateId === 'mineru' });
  // ── Fusion Station ──
  add('fusion', { key: 'fuseWeapon', label: 'Fuse a material onto a unit\'s weapon', desc: 'Might bonus and effect from the material; fused weapons last longer. Works on any pack\'s equipment.', ok: true, select: fuseChoices(run, false),
    pick: (u) => !!WEAPONS[u.weapons[0]] && !['natural', 'instrument', 'staff'].includes(WEAPONS[u.weapons[0]].type) });
  add('fusion', { key: 'fuseShield', label: 'Fuse onto a unit\'s shield', desc: 'Shields gain DEF and an effect (Rockets launch, Emitters burn or freeze attackers, gems resist elements).', ok: true, select: fuseChoices(run, true), pick: (u) => !!u.gear.shield });
  add('fusion', { key: 'separate', label: 'Separate fused materials (weapon and shield)', desc: 'The material is lost.', ok: true, pick: (u) => !!u.fused && Object.keys(u.fused).length > 0 });
  add('fusion', { key: 'repairAll', label: `Repair a unit's weapons (decayed weapons are restored) — ₹${Math.round(60 * costMult(run, 'craft'))}`, desc: 'Clears wear and the Decayed modifier.', ok: run.rupees >= 60,
    pick: (u) => u.weapons.some((id) => (u.wear?.[id] ?? 0) > 0 || u.wmod?.[id] === 'decayed') });
  // ── Cooking Station ──
  for (const c of cookOptions(run)) add('cooking', { key: `cook:${c.family}:${c.kind}`, label: c.label, desc: c.desc, ok: !used('cooked2') });
  // ── Crystal Refinery ──
  add('refinery', { key: 'refine', label: 'Refine 10 Zonaite into a Crystallized Charge', desc: `You hold ${zonaiteHeld(run)} Zonaite.`, ok: zonaiteHeld(run) >= Math.ceil(10 * costMult(run, 'research')) });
  const charges = wildCount(run, 'crystallizedCharge') + 5 * wildCount(run, 'largeCrystallizedCharge') + 20 * wildCount(run, 'hugeCrystallizedCharge');
  add('refinery', { key: 'expandCell', label: `Expand the Energy Cell (5 Crystallized Charges → +10; now ${w.energyCap})`, desc: `You hold ${charges} charges.`, ok: charges >= 5 });
  // ── Monster Shop ──
  const monsterMats = (run.questItems ?? []).filter((id) => MATERIAL_BY_ID[id]?.kind === 'monster').length;
  add('monsterShop', { key: 'sellMonster', label: `Sell monster materials (${monsterMats})`, desc: 'Kilton pays by rarity (more with Kilton in the army).', ok: monsterMats > 0 });
  add('monsterShop', { key: 'rareCreature', label: 'Recruit a rare creature — 2 Monster Medals', desc: 'A Lynel, Hinox, Molduga, Talus or Frox joins your army.', ok: wildCount(run, 'monsterMedal') >= 2 && run.roster.length < armyCap(run) });
  add('monsterShop', { key: 'monsterMask', label: 'Buy a monster mask — ₹200', desc: 'Bokoblin, Moblin, Lizalfos or Horriblin disguise.', ok: run.rupees >= 200 && !used('mask') });
  // ── Hudson Construction Office ──
  add('hudson', { key: 'construction', label: `Expand the camp (Construction Lv ${w.construction} → ${w.construction + 1}) — ₹${Math.round(200 * w.construction * costMult(run, 'facility'))}, 3 Wood`, desc: 'Vehicles are sturdier and cheaper to build.', ok: run.rupees >= Math.round(200 * w.construction * costMult(run, 'facility')) && wildCount(run, 'wood') >= 3 });
  add('hudson', { key: 'colossal', label: `Build a colossal hangar (Colossal Capacity ${w.colossal} → ${w.colossal + 1}) — ₹${Math.round(400 * w.colossal * costMult(run, 'facility'))}`, desc: 'Deploy more size-5 units (Divine Beasts, dragons) in one battle.', ok: run.rupees >= Math.round(400 * w.colossal * costMult(run, 'facility')) });
  add('hudson', { key: 'lightShrine', label: `Raise a light shrine (Gloom Resistance ${w.gloomRes} → ${w.gloomRes + 1}) — ₹${Math.round(250 * costMult(run, 'facility'))}, a Sun Pumpkin`, desc: 'The army takes 10% less Gloom per level (up to 50%).', ok: w.gloomRes < 5 && run.rupees >= Math.round(250 * costMult(run, 'facility')) && wildCount(run, 'sunPumpkin') > 0 });
  add('hudson', { key: 'blueprintCap', label: `Expand the blueprint archive (${w.blueprintCap + 3} → ${w.blueprintCap + 4}) — ₹${Math.round(300 * costMult(run, 'facility'))}`, desc: 'Hold more Autobuild blueprints.', ok: run.rupees >= Math.round(300 * costMult(run, 'facility')) });
  // ── Stable ──
  add('stable', { key: 'buyMount', label: 'Register a horse — ₹350', desc: 'A Royal White Stallion or Mountain Deer saddle (mount gear), plus a Pony Point.', ok: run.rupees >= 350 && !used('mount') });
  add('stable', { key: 'ponyReward', label: 'Spend 5 Pony Points (Giant White Stallion saddle)', desc: 'The stable\'s finest.', ok: wildCount(run, 'ponyPoint') >= 5 });
  if (inArmy(run, 'malanya')) add('stable', { key: 'malanyaRevive', label: 'Malanya: revive a fallen steed', desc: 'Equine Restoration: a fallen mount unit returns.', ok: run.fallen.some((u) => u.race === 'wildMount' || u.classId === 'warSteed') && run.roster.length < armyCap(run) && !used('malanya') });
  // ── Goddess Statue ──
  const orbs = wildCount(run, 'spiritOrb') + wildCount(run, 'lightOfBlessing');
  add('statue', { key: 'heart', label: `Offer 4 Spirit Orbs / Lights of Blessing: Heart Container (+5 max HP) — you hold ${orbs}`, desc: 'For one unit.', ok: orbs >= 4, pick: () => true });
  add('statue', { key: 'stamina', label: 'Offer 4: Stamina Vessel (+5 stamina)', desc: 'For one unit.', ok: orbs >= 4, pick: () => true });
  add('statue', { key: 'sage', label: `Offer 4 Sage's Wills: enhance a Sage (${wildCount(run, 'sagesWill')} held)`, desc: '+1 to every stat and +3 HP.', ok: wildCount(run, 'sagesWill') >= 4, pick: (u) => SAGES.includes(u.templateId ?? '') });
  add('statue', { key: 'cureGloom', label: 'Pray for light (cure all Gloom) — ₹80', desc: 'Restores every unit\'s max HP lost to Gloom.', ok: run.rupees >= 80 && run.roster.some((u) => (u.gloom ?? 0) > 0) });
  // ── Bargainer Statue ──
  add('bargainer', { key: 'poes', label: `Trade 5 Poes for Depths gear (${wildCount(run, 'poe')} held)`, desc: 'Depths, Miner or Evil Spirit armor, Gloom weapons.', ok: wildCount(run, 'poe') >= 5 });
  // ── Great Fairy Fountain ──
  add('fairy', { key: 'enhance', label: 'Enhance a unit\'s armor (+1★ on each worn piece; ★ = +1 DEF) — ₹150 and 2 monster materials', desc: 'Up to 4★ per piece.', ok: run.rupees >= 150 && monsterMats >= 2, pick: (u) => !!(u.gear.head || u.gear.body || u.gear.feet) });
  // ── Compendium Archive ──
  const unsold = w.compendium.length - w.compendiumSold;
  add('compendium', { key: 'sellPhotos', label: `Sell Compendium entries (${unsold} new, ₹15 each)`, desc: `${w.compendium.length} entries recorded.`, ok: unsold > 0 });
  add('compendium', { key: 'study', label: 'Study the Compendium (army +XP)', desc: '+2 XP per entry for everyone.', ok: w.compendium.length > 0 && !used('study') });
  // ── Hestu ──
  const seeds = wildCount(run, 'korokSeed');
  if (inArmy(run, 'hestu') || seeds >= 3) {
    add('hestu', { key: 'pack', label: `3 Korok Seeds: +1 pack slot (${seeds} held)`, desc: 'Shala-kaaa! (up to 10 slots)', ok: seeds >= 3, pick: (u) => (u.packBonus ?? 0) < 4 });
    add('hestu', { key: 'army', label: '8 Korok Seeds: +1 army capacity', desc: 'More room in the convoy and barracks.', ok: seeds >= 8 });
  }
  return out;
}

export function researchCost(run: Run): { rupees: number; parts: number } {
  const w = wildOf(run);
  return { rupees: Math.round(150 * w.research * costMult(run, 'research')), parts: Math.max(1, Math.round(2 * w.research * costMult(run, 'research'))) };
}
const PARTS = ['ancientScrew', 'ancientSpring', 'ancientGear', 'ancientShaft'];
const ancientParts = (run: Run) => PARTS.reduce((n, id) => n + wildCount(run, id), 0);
function takeParts(run: Run, n: number) { for (const id of PARTS) while (n > 0 && takeQ(run, id, 1)) n--; }

export function vehicleCost(run: Run, id: string, auto: boolean): { zonaite: number; rupees: number; devices: Record<string, number>; ok: boolean } {
  const v = VEHICLE_BY_ID[id];
  const m = costMult(run, 'vehicle');
  const w = wildOf(run);
  const zonaite = Math.max(1, Math.ceil((auto ? v.zonaite * 2 : v.zonaite) * m) - (wildCount(run, 'yigaSchematic') ? 2 : 0));
  const rupees = Math.round(v.rupees * m * Math.max(0.6, 1 - 0.1 * (w.construction - 1)));
  const devices: Record<string, number> = auto ? {} : { ...v.devices };
  const ok = zonaiteHeld(run) >= zonaite && run.rupees >= rupees && Object.entries(devices).every(([d, n]) => holding(run, d) >= n);
  return { zonaite, rupees, devices, ok };
}

export interface CookOption { family: CookFamily; kind: 'meal' | 'elixir'; label: string; desc: string; item: string }

/** Meals and elixirs the bag can make right now (up to five ingredients each). */
export function cookOptions(run: Run): CookOption[] {
  const out: CookOption[] = [];
  for (const [fam, m] of Object.entries(MEALS) as [CookFamily, { meal?: string; elixir?: string }][]) {
    const foods = MATERIALS.filter((x) => x.family === fam && x.kind === 'food').reduce((n, x) => n + wildCount(run, x.id), 0);
    const critters = MATERIALS.filter((x) => x.family === fam && x.kind === 'critter').reduce((n, x) => n + wildCount(run, x.id), 0);
    if (m.meal && foods > 0) out.push({ family: fam, kind: 'meal', item: m.meal, label: `Cook ${ITEMS[m.meal]?.name} (${Math.min(5, foods)} ingredient${foods > 1 ? 's' : ''})`, desc: ITEMS[m.meal]?.desc ?? '' });
    const monsterMat = (run.questItems ?? []).some((id) => MATERIAL_BY_ID[id]?.kind === 'monster');
    if (m.elixir && critters > 0 && monsterMat) out.push({ family: fam, kind: 'elixir', item: m.elixir, label: `Brew ${ITEMS[m.elixir]?.name} (${Math.min(4, critters)} critter${critters > 1 ? 's' : ''} + a monster part)`, desc: ITEMS[m.elixir]?.desc ?? '' });
  }
  const basics = MATERIALS.filter((x) => x.family === 'basic').reduce((n, x) => n + wildCount(run, x.id), 0);
  if (!out.length && basics > 0) out.push({ family: 'basic', kind: 'meal', item: 'dubiousFood', label: 'Cook Dubious Food (just basics)', desc: 'It\'s... food.' });
  return out;
}

/** Cook: up to five ingredients → servings (more with more ingredients and Cooking Level; a critical doubles them). */
export function cook(run: Run, family: CookFamily, kind: 'meal' | 'elixir', rng: RNG): string | null {
  const opt = cookOptions(run).find((c) => c.family === family && c.kind === kind);
  if (!opt) return null;
  const w = wildOf(run);
  const pool = MATERIALS.filter((x) => x.family === family && x.kind === (kind === 'meal' ? 'food' : 'critter')).flatMap((x) => Array(wildCount(run, x.id)).fill(x.id) as string[]);
  const n = Math.min(kind === 'meal' ? 5 : 4, pool.length);
  for (const id of pool.slice(0, n)) takeQ(run, id, 1);
  if (kind === 'elixir') { const m = (run.questItems ?? []).find((id) => MATERIAL_BY_ID[id]?.kind === 'monster'); if (m) takeQ(run, m, 1); }
  // Basics stretch a meal (up to five ingredients in all).
  let extra = 0;
  if (kind === 'meal') for (const b of MATERIALS.filter((x) => x.family === 'basic')) while (n + extra < 5 && takeQ(run, b.id, 1)) extra++;
  const golden = takeQ(run, 'goldenApple', 1) || (wildCount(run, 'starFragment') > 0 && rng.chance(50));
  const crit = w.bloodMoon > 0 || golden || rng.chance(8 * w.cooking);
  let servings = 1 + Math.floor((n + extra) / 2) + (w.cooking >= 3 ? 1 : 0) + (run.roster.some((u) => u.weapons.includes('soupLadle')) ? 1 : 0);
  if (crit) servings *= 2;
  for (let i = 0; i < servings; i++) run.convoy.push(opt.item);
  if (!w.campUsed.includes('cooked')) w.campUsed.push('cooked'); else if (!w.campUsed.includes('cooked2')) w.campUsed.push('cooked2');
  return `${crit ? 'A critical success! ' : ''}${servings} × ${ITEMS[opt.item]?.name} into the convoy.`;
}

export function doWildCamp(run: Run, key: string, rng: RNG, uid?: string, arg?: string): string | null {
  const w = wildOf(run);
  const u = uid ? run.roster.find((x) => x.uid === uid) : undefined;
  const opt = wildCampOptions(run, 'camp').concat(wildCampOptions(run, 'shop'), wildCampOptions(run, 'smith')).find((o) => o.key === key);
  if (!opt || !opt.ok || (opt.pick && (!u || !opt.pick(u)))) return null;
  const done = (k: string) => { if (!w.campUsed.includes(k)) w.campUsed.push(k); };
  if (key.startsWith('cook:')) { const [, fam, kind] = key.split(':'); return cook(run, fam as CookFamily, kind as 'meal' | 'elixir', rng); }
  if (key.startsWith('build:') || key.startsWith('autobuild:')) {
    const auto = key.startsWith('autobuild:');
    const id = key.split(':')[1];
    const c = vehicleCost(run, id, auto);
    if (!c.ok) return null;
    takeZonaite(run, c.zonaite);
    for (const [d, n] of Object.entries(c.devices)) takeItem(run, d, n);
    run.rupees -= c.rupees;
    const lvl = Math.max(1, Math.round(run.roster.reduce((t, x) => t + x.level, 0) / Math.max(1, run.roster.length)) - 1);
    const v = makeHero(id, `p${run.uidCounter++}`, lvl, rng);
    const bonus = 1 + 0.1 * (w.construction - 1);
    v.stats.hp = v.hp = Math.round(v.stats.hp * bonus);
    run.roster.push(v);
    return `${v.name} built${auto ? ' (Autobuild)' : ''}.`;
  }
  switch (key) {
    case 'research': {
      const c = researchCost(run);
      run.rupees -= c.rupees; takeParts(run, c.parts);
      w.research++;
      const reward = [undefined, undefined, 'guardianShield', 'ancientShortSword', 'ancientBow', 'ancientShield', 'ancientBladesaw'][w.research];
      if (reward) run.convoy.push(reward);
      return `Research Level ${w.research}.${reward ? ` The lab hands over: ${WEAPONS[reward]?.name ?? GEAR[reward]?.name}.` : ''}`;
    }
    case 'upgradeMachine': takeQ(run, 'ancientGear', 2); takeQ(run, u!.race === 'divineBeast' ? 'giantAncientCore' : 'ancientCore', 1); u!.stats.hp += 4; u!.hp += 4; u!.stats.str++; u!.stats.mag++; u!.stats.def++; return `${u!.name} is upgraded.`;
    case 'schema': { takeQ(run, 'autobuildSchemaStone', 1); const id = unlockBlueprint(run); return id ? `Blueprint saved: ${TEMPLATES[id]?.name}.` : 'Nothing new on this stone.'; }
    case 'attach': {
      const slots = (u!.constructSlots ??= {});
      const lines: string[] = [];
      for (const arm of ['leftArm', 'rightArm'] as const) {
        if (slots[arm]) continue;
        const best = run.convoy.filter((id) => WEAPONS[id] && WEAPONS[id].type !== 'natural' && WEAPONS[id].type !== 'staff').sort((a, c) => WEAPONS[c].might - WEAPONS[a].might)[0];
        if (!best) break;
        run.convoy.splice(run.convoy.indexOf(best), 1);
        slots[arm] = best; u!.weapons.push(best);
        lines.push(`${arm === 'leftArm' ? 'Left' : 'Right'} arm: ${WEAPONS[best].name}`);
      }
      if (!slots.back) {
        const dev = ['beamEmitter', 'flameEmitter', 'shockEmitter', 'frostEmitter', 'zonaiFan', 'zonaiRocket'].find((d) => holding(run, d) > 0);
        if (dev && takeItem(run, dev, 1)) {
          slots.back = dev;
          if (dev.endsWith('Emitter')) u!.weapons.push(`${dev}Blast`); else u!.stats.mov++;
          lines.push(`Back: ${ITEMS[dev]?.name}`);
        }
      }
      if (!slots.core) {
        const core = ['fluxConstructCoreIII', 'fluxConstructCoreII', 'fluxConstructCore', 'ancientCore'].find((c) => wildCount(run, c) > 0);
        if (core && takeQ(run, core, 1)) { slots.core = core; const n = core === 'fluxConstructCoreIII' ? 4 : core === 'ancientCore' ? 2 : 3; u!.stats.str += n; u!.stats.def += n; lines.push(`Core: ${MATERIAL_BY_ID[core]?.name}`); }
      }
      return lines.length ? `Attached — ${lines.join('; ')}.` : 'Nothing to attach (or every slot is full).';
    }
    case 'fuseWeapon': case 'fuseShield': {
      const item = key === 'fuseWeapon' ? u!.weapons[0] : u!.gear.shield!;
      if (!arg || !fuseOf(arg)) return null;
      if (arg !== 'rock' && arg !== 'boulder') { if (MATERIAL_BY_ID[arg]) { if (!takeQ(run, arg, 1)) return null; } else if (!takeItem(run, arg, 1)) return null; }
      (u!.fused ??= {})[item] = arg;
      w.fusion = Math.max(w.fusion, 1);
      return `${fuseOf(arg)!.name} fused onto ${WEAPONS[item]?.name ?? GEAR[item]?.name}.`;
    }
    case 'separate': delete u!.fused; return `${u!.name}'s fused materials are removed.`;
    case 'repairAll': {
      run.rupees -= Math.round(60 * costMult(run, 'craft'));
      u!.wear = {};
      for (const id of Object.keys(u!.wmod ?? {})) if (u!.wmod![id] === 'decayed') delete u!.wmod![id];
      return `${u!.name}'s weapons are repaired.`;
    }
    case 'refine': takeZonaite(run, Math.ceil(10 * costMult(run, 'research'))); addQ(run, 'crystallizedCharge'); return 'A Crystallized Charge.';
    case 'expandCell': {
      let need = 5;
      while (need > 0 && takeQ(run, 'crystallizedCharge', 1)) need--;
      while (need > 0 && takeQ(run, 'largeCrystallizedCharge', 1)) need -= 5;
      while (need > 0 && takeQ(run, 'hugeCrystallizedCharge', 1)) need -= 20;
      if (need < 0) addQ(run, 'crystallizedCharge', -need);
      w.energyCap += 10;
      return `Energy Cell capacity ${w.energyCap}.`;
    }
    case 'sellMonster': return applyWildEffect(run, { kind: 'wild', op: 'sellMonster' }, rng);
    case 'rareCreature': {
      takeQ(run, 'monsterMedal', 2);
      const pool = ['lynel', 'hinox', 'molduga', 'igneoTalus', 'frostTalus', 'battleTalus', 'frox', 'stalnox'].filter((id) => TEMPLATES[id] && ENEMIES[id]);
      const id = rng.pick(pool);
      const v = makeHero(id, `p${run.uidCounter++}`, Math.max(1, Math.round(run.roster.reduce((t, x) => t + x.level, 0) / run.roster.length) - 1), rng);
      run.roster.push(v);
      return `${v.name} joins your army.`;
    }
    case 'monsterMask': run.rupees -= 200; run.convoy.push(rng.pick(['bokoblinMask', 'moblinMask', 'lizalfosMask', 'horriblinMask'])); done('mask'); return 'A monster mask, to the convoy.';
    case 'construction': run.rupees -= Math.round(200 * w.construction * costMult(run, 'facility')); takeQ(run, 'wood', 3); w.construction++; return `Construction Level ${w.construction}.`;
    case 'colossal': run.rupees -= Math.round(400 * w.colossal * costMult(run, 'facility')); w.colossal++; return `Colossal Deployment Capacity ${w.colossal}.`;
    case 'lightShrine': run.rupees -= Math.round(250 * costMult(run, 'facility')); takeQ(run, 'sunPumpkin', 1); w.gloomRes++; return `Gloom Resistance ${w.gloomRes}.`;
    case 'blueprintCap': run.rupees -= Math.round(300 * costMult(run, 'facility')); w.blueprintCap++; return `Blueprint capacity ${w.blueprintCap + 3}.`;
    case 'buyMount': run.rupees -= 350; run.convoy.push(rng.pick(['royalWhiteStallionMount', 'mountainDeerMount'])); addQ(run, 'ponyPoint'); done('mount'); return 'A horse is registered (saddle in the convoy).';
    case 'ponyReward': takeQ(run, 'ponyPoint', 5); run.convoy.push('giantWhiteStallionMount'); return 'The Giant White Stallion\'s saddle is yours.';
    case 'malanyaRevive': { done('malanya'); return applyWildEffect(run, { kind: 'wild', op: 'reviveMount' }, rng); }
    case 'heart': case 'stamina': {
      let need = 4;
      while (need > 0 && takeQ(run, 'spiritOrb', 1)) need--;
      while (need > 0 && takeQ(run, 'lightOfBlessing', 1)) need--;
      if (key === 'heart') { u!.stats.hp += 5; u!.hp += 5; } else u!.stats.sta += 5;
      return `${u!.name}: +5 ${key === 'heart' ? 'max HP' : 'stamina'}.`;
    }
    case 'sage': takeQ(run, 'sagesWill', 4); for (const k of ['str', 'mag', 'skl', 'def', 'res'] as const) u!.stats[k]++; u!.stats.hp += 3; u!.hp += 3; return `${u!.name}'s vow grows stronger.`;
    case 'cureGloom': run.rupees -= 80; return applyWildEffect(run, { kind: 'wild', op: 'cureGloom' }, rng);
    case 'poes': takeQ(run, 'poe', 5); { const g = rng.pick(['depthsHead', 'depthsBody', 'depthsFeet', 'minerHead', 'minerBody', 'minerFeet', 'evilSpiritHead', 'evilSpiritBody', 'gloomSpear']); run.convoy.push(g); return `The statue trades you ${GEAR[g]?.name ?? WEAPONS[g]?.name}.`; }
    case 'enhance': {
      run.rupees -= 150;
      let n = 2;
      run.questItems = (run.questItems ?? []).filter((id) => { if (n > 0 && MATERIAL_BY_ID[id]?.kind === 'monster') { n--; return false; } return true; });
      const k = enhanceArmor(u!, 1);
      return k ? `${u!.name}'s armor shines (+1★ on ${k} piece${k > 1 ? 's' : ''}).` : 'Every piece is already at 4★.';
    }
    case 'sellPhotos': { const n = w.compendium.length - w.compendiumSold; w.compendiumSold = w.compendium.length; run.rupees += n * 15; return `₹${n * 15} for the photos.`; }
    case 'study': { done('study'); let ups = 0; for (const x of run.roster) { x.xp += 2 * w.compendium.length; while (x.xp >= 100 && x.level < 30) { x.xp -= 100; rollLevelUp(x, rng); ups++; } } return `The army studies the Compendium${ups ? ` (${ups} level-up${ups > 1 ? 's' : ''})` : ''}.`; }
    case 'pack': takeQ(run, 'korokSeed', 3); u!.packBonus = Math.min(4, (u!.packBonus ?? 0) + 1); return `${u!.name}'s pack grows! Shala-kaaa!`;
    case 'army': takeQ(run, 'korokSeed', 8); run.metaBonus = { ...(run.metaBonus ?? {}), armyCap: (run.metaBonus?.armyCap ?? 0) + 1 }; return `Army capacity ${armyCap(run)}.`;
  }
  return null;
}

/** New camp: facility uses reset. Paya and sunlight help at rest. */
export function wildCampVisit(run: Run) {
  if (run.campaign !== 'wild') return;
  wildOf(run).campUsed = [];
}

export function wildRestBonus(run: Run) {
  if (run.campaign !== 'wild') return;
  if (skill(run, 'inheritedResponsibility')) adjustMorale(run, 5);
  const layer = layerOf(run.region);
  if (layer !== 'depths') for (const u of run.roster) cureGloom(u);
}

/** Summary line for the top bar. */
export function wildStatus(run: Run): { energy: number; seeds: number; orbs: number; poes: number; moon: string; layer: string; zonaite: number; gloom: number } {
  const w = wildOf(run);
  return {
    energy: w.energyCap, seeds: wildCount(run, 'korokSeed'), orbs: wildCount(run, 'spiritOrb') + wildCount(run, 'lightOfBlessing'), poes: wildCount(run, 'poe'),
    moon: bloodMoonLabel(run), layer: layerOf(run.region), zonaite: zonaiteHeld(run), gloom: run.roster.reduce((n, u) => n + (u.gloom ?? 0), 0),
  };
}
