// The Minish Cap battle rules: the Four Sword and its duplicates, Ezlo's two forms, the pack's battlefield
// spaces and Micro dungeons, the cast's skills (Sacred Forging, Field Forging, Natural Medicine, Light Force,
// Royal Authority, the Blade Brothers' techniques), every boss gimmick (the giant ChuChus, the Big
// Octorok, Gleerok, Mazaal, the Gyorg pair, Vaati's three forms) and the minibosses, the Gust Jar, the Flame
// Lantern and the Picolytes. The size rules themselves are the base game's (engine/micro.ts).
// Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts, abilities.ts, twilight.ts and battleView.ts.

import { TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import { MC_FEATURES, MC_SPOILS, MICRO_DUNGEON_TERRAIN, MN_SPECIAL, VAATI_FORMS } from '../content/minish';
import { anchorCost, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { internalHooks, isMicro, mcTransform, microFits, sharesTile, shrink } from './micro';
import { RNG } from './rng';
import { INF } from './rules';
import { addStatus } from './status';
import { activeGear, effectiveStats, moveTypeOf, unitTags } from './units';
import { pullToward } from './windwaker';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** The Minish Cap battle state. */
    mn?: MNState;
  }
  interface Unit {
    /** A Four Sword duplicate: turns left before it fades. */
    mnDup?: number;
    /** Vaati Reborn / Transfigured: orbiting eyes left. */
    mnEyes?: number;
    /** Vaati's Wrath: arms left, and how many of them are disabled. */
    mnArms?: number;
    mnArmsDisabled?: number;
    /** Black Knight: the round its automatic counter was last used. */
    mnCounterRound?: number;
    /** Eyegore Statue: awake. */
    mnAwake?: boolean;
    /** Rollobite: position at the start of its last turn (Armored Roll). */
    mnStill?: Pos;
  }
}

export interface MNState {
  /** Quest items found in battle (materials, shells, Kinstones). */
  found: string[];
  /** Picolytes drunk this battle. */
  picolytes: string[];
  /** A Micro-only encounter. */
  microDungeon?: boolean;
  /** Every listed boss must fall (paired bosses). */
  allBosses?: boolean;
}

export const mnState = (b: Battle): MNState => (b.mn ??= { found: [], picolytes: [] });
const MN_WORLD = (b: Battle) => worldDef(b.world).campaign === 'minish';
const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.bossId ?? u.templateId ?? u.artId ?? '';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
const mcTag = (u: Unit, t: string) => activeGear(u).some((g) => g.mc?.includes(t)) || !!WEAPONS[u.weapons[0]]?.mc?.includes(t);
function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}
const isHyruleSoldier = (u: Unit) => ['hyruleSoldier', 'hyruleKnight', 'hyruleArcher'].includes(u.templateId ?? '') || ['soldier', 'knight', 'archer'].includes(u.classId);
const host = (b: Battle, u: Unit) => (u.mcRide ? b.units.find((h) => h.uid === u.mcRide!.host) : undefined);
const sacredHit = (w: WeaponDef | undefined, element?: Element) => !!w?.mc?.includes('sacred') || element === 'light' || !!w?.sacredMult;
const WIND_WEAPONS = new Set(['windTome', 'capGust', 'darkCyclone']);

/** Four Sword duplicates a weapon allows (the infusion stage). */
export const dupCount = (u: Unit) => Math.max(0, ...u.weapons.map((id) => Number(WEAPONS[id]?.mc?.find((t) => t.startsWith('dup:'))?.slice(4) ?? 0)));

// ───────────────────────── Movement ─────────────────────────

/** The pack's per-unit movement (grid.ts tileCost): the Grip Ring, Hidden Trails, Climbing Gloves, the Leaf Glider. */
export function mnTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  if ((t === 'mountain' || t === 'minishVine') && mcTag(u, 'gripRing')) c = Math.min(c, 2);
  if (!u.micro) return c;
  if ((t === 'tallGrass' || t === 'giantGrass') && has(u, 'hiddenTrails')) c = Math.min(c, 1);
  if ((t === 'bookshelf' || t === 'giantFlower' || t === 'minishVine') && mcTag(u, 'climb')) c = Math.min(c, 1);
  if ((t === 'puddle' || t === 'water') && mcTag(u, 'glider')) c = Math.min(c, 2);
  void b;
  return c;
}

// ───────────────────────── Battlefield setup ─────────────────────────

/** Place the region's battlefield spaces; Micro dungeons get the size-dependent terrain; big bosses an Internal Weak Point. */
export function decorateMinish(b: Battle, rng: RNG) {
  const feats = MC_FEATURES[b.world];
  if (!feats || b.naval) return;
  const st = mnState(b);
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 1 && i % b.width <= b.width - 2 ? i : -1)).filter((i) => i >= 0));
  const lay = (list: Partial<Record<Terrain, number>>) => {
    for (const [t, n] of Object.entries(list) as [Terrain, number][]) for (let j = 0; j < n; j++) { const k = plains.pop(); if (k !== undefined) b.tiles[k] = t; }
  };
  lay(feats);
  void st;
  // A Minish Portal near the army's start, so anyone can shrink.
  const p0 = b.units.find((u) => u.team === 'player');
  if (p0 && !b.tiles.includes('minishPortal')) {
    const spot = tilesInRange(b, p0, 1, 2, p0.size).find((p) => b.tiles[keyOf(b, p.x, p.y)] === 'plain' && !occupied.has(keyOf(b, p.x, p.y)));
    if (spot) b.tiles[keyOf(b, spot.x, spot.y)] = 'minishPortal';
  }
  // Big bosses have an Internal Weak Point beside them.
  for (const boss of b.units.filter((u) => u.isBoss && u.size >= 3)) {
    const spot = tilesInRange(b, boss, 1, 1, boss.size).find((p) => b.tiles[keyOf(b, p.x, p.y)] === 'plain' && !occupied.has(keyOf(b, p.x, p.y)));
    if (spot) b.tiles[keyOf(b, spot.x, spot.y)] = 'internalWeakPoint';
  }
}

/** Battle start: boss defences, the Micro dungeon's shrinking, camouflage, dormant Eyegores. */
export function minishBattleStart(b: Battle) {
  for (const u of b.units) {
    if (has(u, 'eyesOfDarkness')) u.mnEyes = 4;
    if (has(u, 'eightfoldDefense')) u.mnEyes = 8;
    if (has(u, 'demonicArms')) { u.mnArms = 2; u.mnArmsDisabled = 0; }
    if (has(u, 'watchingGuardianSkill') && u.team === 'enemy') { u.mnAwake = false; u.ai = 'stationary'; }
    if (has(u, 'camouflage') && ['forest', 'mountain', 'tallGrass', 'giantGrass'].includes(tileAt(b, u.x, u.y) ?? '')) u.hidden = u.team === 'enemy';
  }
}

/** A Micro dungeon (a house, a library shelf, a flooded garden): size-dependent terrain, and the army fights at
 *  Minish size (whoever can shrink does; normal-sized enemies keep their entries and the Micro combat rules apply). */
export function startMicroDungeon(b: Battle, rng: RNG) {
  const st = mnState(b);
  st.microDungeon = true;
  const occupied = new Set(b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))));
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) ? i : -1)).filter((i) => i >= 0));
  for (const [t, n] of Object.entries(MICRO_DUNGEON_TERRAIN) as [Terrain, number][]) for (let j = 0; j < n; j++) { const k = plains.pop(); if (k !== undefined) b.tiles[k] = t; }
  for (const u of b.units.filter((x) => x.team === 'player' && !x.micro && (x.baseSize ?? x.size) <= 2 && !unitTags(x).includes('vessel') && !unitTags(x).includes('train'))) {
    const form = TEMPLATES[u.templateId ?? '']?.microForm;
    if (form && TEMPLATES[form]) mcTransform(b, u, form); else shrink(u);
  }
}

// ───────────────────────── Start of each turn ─────────────────────────

export interface MNEvent { uid: string; heal: number; damage: number; source: string }

export function mnStartPhase(b: Battle, u: Unit, events: MNEvent[]) {
  const heal = (who: Unit, pct: number, source: string) => {
    const amt = Math.min(who.stats.hp - who.hp, Math.ceil(who.stats.hp * pct));
    if (amt > 0) { who.hp += amt; events.push({ uid: who.uid, heal: amt, damage: 0, source }); }
  };
  const hurt = (who: Unit, dmg: number, source: string) => {
    dmg = Math.min(who.hp - 1, Math.floor(dmg));
    if (dmg > 0) { who.hp -= dmg; events.push({ uid: who.uid, heal: 0, damage: dmg, source }); }
  };
  const mend = (who: Unit, n: number) => { const w = who.weapons[0]; if (w && who.wear?.[w]) who.wear[w] = Math.max(0, who.wear[w] - n); };
  const forgeMult = u.team === 'player' && b.bonus === 'masterForging' ? 2 : 1;
  // Four Sword duplicates fade.
  if (u.mnDup !== undefined && --u.mnDup <= 0) {
    b.units = b.units.filter((x) => x !== u);
    events.push({ uid: u.uid, heal: 0, damage: 0, source: 'fades back into the Four Sword' });
    return;
  }
  // Riders work on their hosts.
  const h = host(b, u);
  if (h) {
    if (has(u, 'sacredForgingMC')) { mend(h, 3 * forgeMult); buff(h, 'sacredForgingMC', 'Sacred Forging', 1, { str: 2 }); }
    if (has(u, 'fieldForging')) mend(h, (2 + (mcTag(u, 'forging') ? 2 : 0)) * forgeMult);
    if (WEAPONS[u.weapons[0]]?.mc?.includes('forging')) mend(h, 3 * forgeMult);
    if (has(u, 'enchantedCap')) buff(h, 'capGlide', 'Gliding (Ezlo)', 1, { mov: 1 });
  }
  if (has(u, 'naturalMedicine')) for (const a of alliesOf(b, u)) if (!a.micro && sharesTile(u, a)) heal(a, 0.15, 'is treated by a Minish healer');
  // Auras.
  for (const a of alliesOf(b, u)) {
    const d = unitDist(u, a);
    if (has(a, 'lightForce') && d <= 2) u.mp = Math.min(u.stats.mp, u.mp + 3);
    if (has(a, 'ancientWisdom') && d <= 2 && u.micro) u.mp = Math.min(u.stats.mp, u.mp + 4);
    if (has(a, 'windBlessing') && d <= 3 && moveTypeOf(u) === 'flying') buff(u, 'windBlessing', 'Wind Blessing', 1, { mov: 1 });
  }
  if (mcTag(u, 'lightForce')) u.mp = Math.min(u.stats.mp, u.mp + 5);
  if (mcTag(u, 'sacredCore') && unitTags(u).includes('construct')) heal(u, 0.1, "Mazaal's Sacred Core repairs");
  if (b.groupSupports?.includes('unitedMinish') && u.team === 'player' && u.micro) buff(u, 'unitedMinish', 'United Minish', 1, { mov: 2 });
  // Detection.
  const reveal = (r: number) => { for (const e of foesOf(b, u)) if (e.hidden && unitDist(u, e) <= r) e.hidden = false; };
  if (has(u, 'forestPassage')) reveal(5);
  if (has(u, 'hiddenTrails')) reveal(3);
  if (has(u, 'hiddenKnowledge')) { reveal(4); for (const t of b.traps ?? []) if (t.hidden && Math.abs(t.x - u.x) + Math.abs(t.y - u.y) <= 4) t.hidden = false; }
  if (mcTag(u, 'woodlandConceal') && ['forest', 'tallGrass', 'giantGrass'].includes(tileAt(b, u.x, u.y) ?? '')) addStatus(u, 'veiled', 1);
  // ── Monsters ──
  if (has(u, 'sporeCloud')) for (const e of foesOf(b, u)) if (unitDist(u, e) <= 1 && (b.turn + e.uid.length) % 2 === 0) addStatus(e, (b.turn % 4 < 2 ? 'poison' : 'confuse') as StatusKind, 2);
  if (has(u, 'camouflage') && u.team === 'enemy' && ['forest', 'mountain', 'tallGrass', 'giantGrass'].includes(tileAt(b, u.x, u.y) ?? '') && !foesOf(b, u).some((e) => unitDist(u, e) <= 1)) u.hidden = true;
  if (has(u, 'armoredRoll')) { if (u.mnStill && u.mnStill.x === u.x && u.mnStill.y === u.y) buff(u, 'armoredRoll', 'Curled up', 1, { def: 5 }); u.mnStill = { x: u.x, y: u.y }; }
  if (has(u, 'watchingGuardianSkill') && u.mnAwake === false && foesOf(b, u).some((e) => !e.hidden && unitDist(u, e) <= 3)) {
    u.mnAwake = true; u.ai = 'aggressive';
    events.push({ uid: u.uid, heal: 0, damage: 0, source: 'opens its eye' });
  }
  // ── Bosses ──
  if (has(u, 'gelatinousGiant') || has(u, 'giganticCharge')) heal(u, 0.05, 'reforms its gel');
  if (has(u, 'giganticCharge') && b.turn % 2 === 1) for (const e of foesOf(b, u)) if (sharesTile(u, e) || (e.micro && unitDist(u, e) <= 1)) hurt(e, e.stats.hp * 0.15 + effectiveStats(u).mag / 4, 'is electrified by the Gigantic Charge');
  if (has(u, 'eyesOfDarkness') && b.turn % 2 === 0) u.mnEyes = Math.min(4, (u.mnEyes ?? 0) + 1);
  if (has(u, 'eightfoldDefense')) u.mnEyes = Math.min(8, (u.mnEyes ?? 0) + 1);
  if (has(u, 'demonicArms') && u.team === 'enemy') {
    const live = (u.mnArms ?? 0) - (u.mnArmsDisabled ?? 0);
    const s = effectiveStats(u);
    for (let i = 0; i < live; i++) {
      const t = foesOf(b, u).filter((e) => !e.hidden && unitDist(u, e) <= 2).sort((x, y) => x.hp - y.hp)[i % 2];
      if (t) hurt(t, Math.max(1, Math.floor(s.str / 2) + 4 - effectiveStats(t).def / 2), 'is struck by a demonic arm');
    }
  }
}

// ───────────────────────── Combat ─────────────────────────

export interface MNMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

export function mnMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): MNMods {
  const m: MNMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const allies = b.units.filter((a) => a !== u && a.team === u.team);
  const within = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  if (u.micro && allies.some((a) => has(a, 'masterOfMiniaturization') && within(a, 2))) { m.str += 2; m.mag += 2; m.def += 2; }
  if (u.micro && u.team === 'player' && b.bonus === 'minishSage') { m.skl += 2; m.spd += 2; }
  if (isHyruleSoldier(u)) {
    const reach = (a: Unit) => 4 + (mcTag(a, 'commander') ? 2 : 0);
    if (allies.some((a) => has(a, 'royalAuthority') && within(a, reach(a)))) { m.str += 3; m.def += 3; }
    if (u.team === 'player' && b.bonus === 'royalAuthority') m.def += 3;
  }
  if (has(u, 'forbiddenAmbition')) m.mag += Math.min(8, 2 * u.abilities.length);
  if (has(u, 'hiddenKnowledge') && w?.type === 'magic') m.hit += 10;
  if (allies.some((a) => has(a, 'inspiringVerse') && within(a, 2))) { m.hit += 10; m.avoid += 5; }
  if (has(u, 'flyingPest') && foe.micro) m.hit += 20;
  if (w?.mc?.includes('microReach') && foe.micro) m.hit += 15;
  if (mcTag(u, 'aerialAim') && (moveTypeOf(u) === 'flying' || moveTypeOf(foe) === 'flying')) m.hit += 15;
  const still = !u.moved && (u.movedDist ?? 0) === 0;
  if (has(u, 'powerTechnique') && w?.type === 'sword' && still && initiating) m.dmg += 4;
  if (w?.mc?.includes('charged') && still && initiating) m.dmg += 4;
  const low = u.hp < u.stats.hp / 2;
  if (has(u, 'perilTechnique') && low) { m.str += 4; m.crit += 15; }
  if (w?.mc?.includes('peril') && low) { m.dmg += 4; m.crit += 15; }
  if (has(u, 'ultimateTechnique') && w?.type === 'sword') m.dmg += 2;
  if (has(u, 'aerialPair') && b.units.filter((a) => a.team === u.team && has(a, 'aerialPair')).length >= 2) { m.str += 3; m.spd += 3; m.def += 3; }
  if (has(u, 'aggressiveSwordsmanship') && foe.gear.shield) { m.crit += 15; m.dmg += 4; }
  if (has(u, 'frozenArena') && !hasBuff(u, 'mnThawed')) { m.def += 8; m.res += 8; }
  if (has(foe, 'enragedCrawl') && u.micro) m.crit += 10;
  if (has(u, 'watchingGuardianSkill') && u.mnAwake === false) m.def += 10;
  return m;
}

/** Nothing in the pack forbids an attack outright (kept for the combat hook chain). */
export function mnCannotAttack(b: Battle, atk: Unit, def: Unit, w: WeaponDef | undefined): boolean {
  void b; void atk; void def; void w;
  return false;
}

/** Damage multipliers: boss defences, Micro-hunting bosses, sacred and wind magic bonuses. */
export function mnMultiplier(b: Battle, atk: Unit, atkPos: Pos, def: Unit, magical: boolean, w: WeaponDef | undefined, d: number, element?: Element): number {
  let m = 1;
  void atkPos;
  const weak = def.buffs.some((x) => x.id === 'mcWeakPoint');
  if ((has(def, 'gelatinousGiant') || has(def, 'giganticCharge')) && !magical && !hasBuff(def, 'mnKnockedOver')) m *= 0.6;
  if (has(atk, 'gelatinousGiant') && def.micro) m *= 2;
  if (has(def, 'volcanicShell') && !hasBuff(def, 'mnShellOpen')) m *= 0.4;
  if (has(def, 'mechanicalInterior') && !weak && !hasBuff(def, 'mcExposedCore')) m *= 0.3;
  if ((has(def, 'eyesOfDarkness') && (def.mnEyes ?? 0) > 0)) m *= 0.5;
  if ((has(def, 'eightfoldDefense') && (def.mnEyes ?? 0) > 0)) m *= 0.25;
  if (has(def, 'demonicArms') && (def.mnArms ?? 0) > 0) m *= 0.5;
  if (has(def, 'silverGuard') && !magical && d <= 1 && !(atk.micro && weak)) m *= 0.5;
  if (has(def, 'enragedCrawl') && atk.micro) m *= 1.5;
  if (has(def, 'ultimateTechnique') && (atk.race === 'undead' || unitTags(atk).includes('undead'))) m *= 0.5;
  if (has(atk, 'smallButMightyMC') && weak) m *= 1.25;
  if (has(atk, 'sorcerersCapSkill') && magical) m *= 1.2;
  if (element === 'dark' && b.units.some((a) => a.team === def.team && has(a, 'lightForce') && unitDist(def, a) <= 2)) m *= 0.7;
  if (atk.team === 'player' && b.bonus === 'lightForceBonus' && sacredHit(w, element)) m *= 1.2;
  if (atk.team === 'player' && b.bonus === 'windSorcery' && magical && (element === 'dark' || WIND_WEAPONS.has(w?.id ?? ''))) m *= 1.25;
  if (b.groupSupports?.includes('picoriLegend') && ['heroOfMinish', 'microLink', 'zeldaMC', 'ezloMinish', 'ezloCap'].includes(atk.templateId ?? '') && sacredHit(w, element)) m *= 1.15;
  if (b.groupSupports?.includes('forbiddenAmbitionGroup') && element === 'dark' && ['vaatiHylian', 'vaatiMinish', 'ghirahim', 'zant'].includes(atk.templateId ?? '')) m *= 1.2;
  if (b.groupSupports?.includes('ancientGuardians') && def.team === 'player' && unitTags(def).includes('construct')) m *= 0.85;
  if (mcTag(def, 'fireGuard') && element === 'fire') m *= 0.5;
  return m;
}

/** After a hit lands: the bosses' weak points open, eyes and arms break, enrage. */
export function mnAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element?: Element): string[] {
  const lines: string[] = [];
  if (target.hp > 0) {
    if (w?.mc?.includes('flip')) {
      buff(target, 'mnFlipped', 'Flipped', 1, { def: -5 });
      if (has(target, 'gelatinousGiant') || (has(target, 'giganticCharge') && b.turn % 2 === 0)) { buff(target, 'mnKnockedOver', 'Knocked over', 2); lines.push(`The Cane of Pacci flips ${target.name} onto its back!`); }
    }
    if (has(target, 'volcanicShell') && (w?.mc?.includes('tool') || w?.type === 'hammer')) { buff(target, 'mnShellOpen', 'Shell open', 2); lines.push(`${by.name} strikes ${target.name}'s shell mechanism: it cracks open!`); }
    if (has(target, 'frozenArena') && element === 'fire') { buff(target, 'mnThawed', 'Flower burning', 2); lines.push(`The flower on ${target.name}'s back catches fire: its frozen armour melts!`); }
    if ((has(target, 'eyesOfDarkness') || has(target, 'eightfoldDefense')) && (target.mnEyes ?? 0) > 0 && dmg > 0) { target.mnEyes!--; lines.push(`An eye shielding ${target.name} bursts (${target.mnEyes} left).`); }
    if (has(target, 'demonicArms') && dmg >= 10 && (target.mnArmsDisabled ?? 0) < (target.mnArms ?? 0)) { target.mnArmsDisabled = (target.mnArmsDisabled ?? 0) + 1; lines.push(`One of ${target.name}'s arms hangs limp — a Micro unit could get inside it.`); }
    if (has(target, 'enragedCrawl') && dmg > 0) buff(target, 'enragedCrawl', 'Enraged', 2, { str: 5, spd: 4 });
  }
  b.log.push(...lines);
  return lines;
}

/** After an exchange: spikes, the Gigantic Charge's coating, the Black Knight's automatic counter. */
export function mnAfterCombat(b: Battle, attacker: Unit, defender: Unit, landed: { atk: number; def: number }): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const zap = (to: Unit, from: Unit, dmg: number) => {
    if (to.hp <= 0 || !b.units.includes(to)) return;
    dmg = Math.min(to.hp, Math.max(1, Math.floor(dmg)));
    to.hp -= dmg;
    const killed = to.hp <= 0;
    if (killed) { b.units = b.units.filter((x) => x !== to); if (!to.summoned) b.fallen.push(to); }
    out.push({ uid: to.uid, dmg, hp: to.hp, killed, by: from.uid });
  };
  const melee = unitDist(attacker, defender) <= 1 && landed.atk > 0 && defender.hp > 0;
  if (melee && has(defender, 'retractableSpikes') && b.turn % 2 === 0) zap(attacker, defender, 5 + effectiveStats(defender).str / 3);
  if (melee && has(defender, 'giganticCharge') && b.turn % 2 === 1) zap(attacker, defender, 4 + effectiveStats(defender).mag / 4);
  if (melee && has(defender, 'masterOfTheBlade') && defender.mnCounterRound !== b.turn) {
    defender.mnCounterRound = b.turn;
    zap(attacker, defender, effectiveStats(defender).str + (WEAPONS[defender.weapons[0]]?.might ?? 0) - effectiveStats(attacker).def);
    b.log.push(`${defender.name}'s Master of the Blade: an instant counter!`);
  }
  return out;
}

export function mnOnKill(b: Battle, by: Unit, victim: Unit) {
  if (victim.team !== 'enemy' || by.team !== 'player') return;
  const st = mnState(b);
  const id = tid(victim);
  const n = (b.turn + victim.uid.length * 7) % 4;
  if (MC_SPOILS[id] && n === 0) st.found.push(MC_SPOILS[id]);
  if (MN_WORLD(b)) {
    if (n === 1) st.found.push('mysteriousShell');
    if (n === 2 && victim.micro) st.found.push('kinstoneGreen');
    if (victim.isBoss) st.found.push(victim.size >= 3 ? 'kinstoneRed' : 'kinstoneBlue');
  }
}

/** Vaati changes shape instead of falling: Reborn → Transfigured → Wrath. */
export function mnSaveFromDeath(b: Battle, u: Unit): { line: string; heal: number } | null {
  const i = VAATI_FORMS.indexOf(u.bossId ?? '');
  if (i < 0 || i === VAATI_FORMS.length - 1 || u.team !== 'enemy' || !TEMPLATES[VAATI_FORMS[i + 1]]) return null;
  const next = VAATI_FORMS[i + 1];
  const was = u.name;
  const size = TEMPLATES[next].size;
  // Find room for the bigger shape nearby.
  for (let d = 0; d <= 3; d++) {
    const spot = (d === 0 ? [{ x: u.x, y: u.y }] : tilesInRange(b, u, d, d, u.size)).find((p) => anchorCost(b, { ...u, size }, p.x, p.y) < INF
      && footprint(p.x, p.y, size).every((q) => { const o = unitAt(b, q.x, q.y); return !o || o === u; }));
    if (spot) { u.x = spot.x; u.y = spot.y; break; }
  }
  mcTransform(b, u, next);
  u.bossId = next; u.artId = next; u.isBoss = true;
  const lvlGain = Math.max(0, u.level - 1);
  u.stats.hp = Math.round(u.stats.hp * ((b.bossTier ?? 0) === 0 ? 0.6 : 0.8)) + lvlGain;
  minishBattleStartUnit(u);
  return { line: `${was} is beaten — and tears open into ${u.name}!`, heal: u.stats.hp };
}
function minishBattleStartUnit(u: Unit) {
  if (has(u, 'eyesOfDarkness')) u.mnEyes = 4;
  if (has(u, 'eightfoldDefense')) u.mnEyes = 8;
  if (has(u, 'demonicArms')) { u.mnArms = 2; u.mnArmsDisabled = 0; }
}

/** The Male Gyorg protects his mate. */
export function mnInterceptor(b: Battle, p: Unit, target: Unit): boolean {
  void b;
  return p.bossId === 'gyorgMale' && target.bossId === 'gyorgFemale' && unitDist(p, target) <= 2;
}

export function mnBossesRemain(b: Battle): boolean {
  return !!b.mn?.allBosses && b.units.some((u) => u.team === 'enemy' && u.isBoss);
}

/** Before the battle ends: duplicates fade (never casualties, no EXP). */
export function minishBeforeFinish(b: Battle) {
  b.units = b.units.filter((u) => u.mnDup === undefined);
  b.fallen = b.fallen.filter((u) => u.mnDup === undefined);
}

// ───────────────────────── Abilities ─────────────────────────

const SPECIAL = new Set(MN_SPECIAL);
const PASSIVE = new Set(['fasterSpin', 'fasterSplit', 'longerGreatSpin']);
export const isMinishAbility = (def: AbilityDef) => SPECIAL.has(def.id);
export const MN_ENEMY_CASTS = ['crushingBounce', 'volcanicEruption', 'mechanicalSlam', 'windCataclysm', 'octorokInk', 'bodyRegeneration', 'spinyGelRecovery'];

export function mnCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  let m = 1;
  if (def.id === 'fourSwordSplit') {
    if (u.team === 'player' && b?.bonus === 'fourSwordHero') m *= 0.75;
    if (u.abilities.includes('fasterSplit')) m *= 0.75;
    if (b && footprint(u.x, u.y, u.size).some((p) => tileAt(b, p.x, p.y) === 'duplicationTile')) m = 0;
  }
  return m;
}

/** Sword technique stamina (twilight.ts techniqueCost). */
export function mnStaminaAdjust(u: Unit, a: AbilityDef, bonus: string | undefined, c: number, groups?: string[]): number {
  if (a.kind !== 'technique' || !(a.weaponTypes ?? []).includes('sword')) return c;
  if (a.id === 'spinAttack' && u.abilities.includes('fasterSpin')) c -= 2;
  let m = 1;
  if (has(u, 'swiftTechnique')) m *= 0.75;
  if (WEAPONS[u.weapons[0]]?.mc?.includes('techThrift')) m *= 0.8;
  if (bonus === 'bladeBrothers' && u.team === 'player') m *= 0.8;
  if (groups?.includes('bladeBrotherhood') && ['swiftblade', 'greatblade', 'grimblade', 'swiftbladeFirst'].includes(u.templateId ?? '')) m *= 0.75;
  return Math.max(0, Math.floor(c * m));
}

export function mnUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (PASSIVE.has(def.id)) return 'Passive';
  if (def.id === 'dashAttack' && !Object.values(u.gear).includes('pegasusBoots')) return 'Needs Pegasus Boots';
  if (!isMinishAbility(def)) return undefined;
  switch (def.id) {
    case 'fourSwordSplit':
      if (u.mnDup !== undefined) return 'Duplicates can\'t split';
      if (!dupCount({ ...u, weapons: [u.weapons[0]] })) return 'Needs an awakened Picori Blade equipped';
      return null;
    case 'ezloCapForm': case 'ezloMinishForm': return null;
  }
  void b;
  return null;
}

export interface MNOutcome {
  hits: { uid: string; dmg: number; hp: number; killed: boolean; statuses: StatusKind[] }[];
  heals: { uid: string; amount: number }[];
  statuses: { uid: string; kind: StatusKind }[];
  cleansed: string[];
  buffed: string[];
  lines: string[];
  transformed?: string;
  warped?: { from: Pos; to: Pos };
  free?: boolean;
}

export function castMinish(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): MNOutcome | null {
  if (!isMinishAbility(def)) return null;
  void rng; void target; void at;
  const out: MNOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  switch (def.id) {
    case 'fourSwordSplit': {
      const n = dupCount({ ...u, weapons: [u.weapons[0]] });
      let made = 0;
      for (let i = 0; i < n; i++) {
        const dup = makeDuplicate(b, u);
        if (!dup) break;
        made++;
      }
      out.lines.push(made ? `${u.name} splits! ${made} duplicate${made > 1 ? 's' : ''} step${made > 1 ? '' : 's'} out of the Four Sword.` : 'There is no room for duplicates.');
      return out;
    }
    case 'ezloCapForm': case 'ezloMinishForm': {
      const was = u.name;
      mcTransform(b, u, def.id === 'ezloCapForm' ? 'ezloCap' : 'ezloMinish');
      out.transformed = was;
      out.lines.push(def.id === 'ezloCapForm' ? `${was} turns back into the Minish Cap.` : `${was} takes his true Minish form.`);
      return out;
    }
  }
  return null;
}

/** A Four Sword duplicate: 40% max HP, 60% of the offensive stats, the equipped sword only, for 3 turns. */
function makeDuplicate(b: Battle, u: Unit): Unit | null {
  let spot: Pos | undefined;
  for (let d = 1; d <= 3 && !spot; d++) {
    spot = tilesInRange(b, u, d, d, u.size).find((p) => u.micro ? microFits(b, u, p.x, p.y)
      : anchorCost(b, u, p.x, p.y) < INF && footprint(p.x, p.y, u.size).every((q) => !unitAt(b, q.x, q.y)));
  }
  if (!spot) return null;
  const s = { ...u.stats };
  s.hp = Math.max(1, Math.round(s.hp * 0.4));
  for (const k of ['str', 'mag', 'skl'] as const) s[k] = Math.round(s[k] * 0.6);
  const dup: Unit = {
    ...u, uid: `dup${b.uidCounter++}`, name: `${u.name} (Duplicate)`, stats: s, hp: s.hp, x: spot.x, y: spot.y, weapons: [u.weapons[0]], pack: [], abilities: [], skills: [],
    gear: {}, buffs: [], statuses: [], isCommander: false, summoned: true, mnDup: 3, moved: false, acted: false, kills: 0, movedDist: 0, wear: {}, mcRide: undefined,
    usedAbilities: [], cooldowns: {}, originalForm: undefined,
  };
  b.units.push(dup);
  return dup;
}

// ───────────────────────── Items ─────────────────────────

export function useMinishItem(b: Battle, u: Unit, id: string, at?: Pos): string | null {
  const st = mnState(b);
  const on = (p: Pos) => b.units.filter((e) => p.x >= e.x && p.y >= e.y && p.x < e.x + e.size && p.y < e.y + e.size);
  switch (id) {
    case 'gustJar': {
      const lines: string[] = [];
      let webs = 0;
      for (const p of tilesInRange(b, at!, 0, 1)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'spiderweb') { b.tiles[k] = 'plain'; webs++; } }
      if (webs) lines.push(`The Gust Jar sucks up ${webs} spiderweb${webs > 1 ? 's' : ''}.`);
      for (const e of on(at!).filter((x) => x.team !== u.team)) {
        if ((has(e, 'gelatinousGiant') || (has(e, 'giganticCharge') && b.turn % 2 === 0))) { buff(e, 'mnKnockedOver', 'Knocked over', 2); lines.push(`The Gust Jar knocks ${e.name} over — its head is exposed!`); continue; }
        if (has(e, 'giganticCharge')) { lines.push(`${e.name}'s charged coating repels the Gust Jar.`); continue; }
        if (e.micro || e.size <= 1) {
          if (!e.isBoss) pullToward(b, e, u, 2);
          const d = Math.min(e.hp - 1, 6);
          if (d > 0) e.hp -= d;
          lines.push(`The Gust Jar inhales ${e.name}${d > 0 ? ` (−${d})` : ''}.`);
        }
      }
      return lines.join(' ') || 'The Gust Jar blows a strong wind.';
    }
    case 'flameLantern': {
      let webs = 0;
      for (const p of tilesInRange(b, at!, 0, 1)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'spiderweb' || b.tiles[k] === 'frozenWater') { b.tiles[k] = b.tiles[k] === 'frozenWater' ? 'water' : 'plain'; webs++; } }
      const lines = webs ? [`The lantern flame burns away ${webs} web${webs > 1 ? 's' : ''} and ice.`] : [];
      for (const e of on(at!).filter((x) => x.team !== u.team)) {
        const d = Math.min(e.hp - 1, 8);
        if (d > 0) e.hp -= d;
        addStatus(e, 'burn', 2);
        if (has(e, 'frozenArena')) { buff(e, 'mnThawed', 'Flower burning', 2); lines.push(`The flower on ${e.name}'s back catches fire: its frozen armour melts!`); }
        else lines.push(`${e.name} is singed (−${Math.max(0, d)}).`);
      }
      b.fog = false;
      return lines.join(' ') || 'The Flame Lantern lights the way.';
    }
    case 'dogFood': {
      let n = 0;
      for (const e of b.units) if (e.team !== u.team && !e.isBoss && unitTags(e).includes('beast') && Math.abs(e.x - at!.x) + Math.abs(e.y - at!.y) <= 2) { addStatus(e, 'confuse', 1); n++; }
      return n ? `The smell lures ${n} animal${n > 1 ? 's' : ''} away.` : 'Nothing takes the bait.';
    }
    case 'minishMushroom': {
      const amt = Math.min(u.stats.hp - u.hp, isMicro(u) ? 28 : 14);
      u.hp += amt; u.mp = Math.min(u.stats.mp, u.mp + 5);
      return `${u.name} eats a Minish Mushroom (+${amt} HP, +5 MP).`;
    }
  }
  if (id.endsWith('Picolyte')) {
    st.picolytes.push(id);
    return `${u.name} drinks the ${id.replace('Picolyte', '')} Picolyte: the battle will leave more behind.`;
  }
  return null;
}

export const MN_FREE_ITEMS = new Set(['redPicolyte', 'greenPicolyte', 'bluePicolyte', 'yellowPicolyte', 'whitePicolyte', 'orangePicolyte']);

/** Bombs open Gleerok's shell and burn webs. */
export function mnOnBlast(b: Battle, by: Unit, at: Pos, radius: number): string[] {
  const lines: string[] = [];
  for (const e of b.units) {
    if (e.team === by.team || !has(e, 'volcanicShell')) continue;
    if (footprint(e.x, e.y, e.size).some((p) => Math.abs(p.x - at.x) + Math.abs(p.y - at.y) <= radius)) { buff(e, 'mnShellOpen', 'Shell open', 2); lines.push(`The blast cracks ${e.name}'s shell open!`); }
  }
  for (const p of tilesInRange(b, at, 0, radius)) { const k = keyOf(b, p.x, p.y); if (b.tiles[k] === 'spiderweb') b.tiles[k] = 'plain'; }
  return lines;
}

/** An internal strike from a Micro unit: Mazaal's core, Vaati's eyes and disabled arms, Gleerok's shell. */
export function mnInternalHit(b: Battle, by: Unit, e: Unit): string[] {
  const lines: string[] = [];
  if (has(e, 'mechanicalInterior')) { buff(e, 'mcExposedCore', 'Mechanisms broken', 2); lines.push(`${by.name} wrecks ${e.name}'s internal mechanisms: it is open to full damage!`); }
  if (has(e, 'volcanicShell')) buff(e, 'mnShellOpen', 'Shell open', 2);
  if (has(e, 'eyesOfDarkness') || has(e, 'eightfoldDefense')) { e.mnEyes = Math.max(0, (e.mnEyes ?? 0) - (has(e, 'eightfoldDefense') ? 3 : 2)); lines.push(`Eyes shielding ${e.name} burst from the inside (${e.mnEyes} left).`); }
  if (has(e, 'demonicArms') && (e.mnArmsDisabled ?? 0) > 0) { e.mnArmsDisabled!--; e.mnArms = Math.max(0, (e.mnArms ?? 0) - 1); lines.push(`${by.name} climbs into a limp arm and destroys its eye: ${e.mnArms} arm${e.mnArms === 1 ? '' : 's'} left.`); }
  if (has(by, 'smallMechanisms') && unitTags(e).includes('construct') && e.size <= 3) addStatus(e, 'root', 1);
  b.log.push(...lines);
  return lines;
}

internalHooks.push(mnInternalHit);
