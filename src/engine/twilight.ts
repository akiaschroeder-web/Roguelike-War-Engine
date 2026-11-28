// Twilight Princess battle rules: Twilight corruption and the pack's battlefield
// spaces, the seven Hidden Skills, Shadow Beast revival, mounted combat, Wolf
// Link and Midna, plus the extra units (Poe Sisters, ChuChus, Bubbles, Queen of
// Fairies). Hooks are called from battle.ts, combat.ts, field.ts and abilities.ts.

import { ABILITIES, ENEMIES, GEAR, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import { HIDDEN_SKILLS, TWILIT_PROVINCES } from '../content/twilight';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF, isMagical } from './rules';
import { addStatus, hasStatus } from './status';
import { restoreForm, roomFor, transformInto } from './transform';
import { effectiveStats, hasEffect, isMounted, makeEnemy, moveTypeOf, unitTags } from './units';
import { pullToward, pushAway } from './windwaker';
import { activeGroups, promiseKept } from './supports';
import { ssHazardImmune, ssStaminaMult } from './skyward';
import { wildStaminaMult } from './wild';
import { lgStaminaMult } from './legend';
import { spChuFusion } from './spirit';
import { mnStaminaAdjust } from './minish';
import { lrStaminaAdjust } from './lorule';
import { tfStaminaAdjust } from './triforce';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** This battle is fought under the Twilight (a twilit province). */
    twilit?: boolean;
    /** Twilight Princess battle state. */
    tp?: {
      tears: number;
      dormant: { unit: Unit; turns: number }[];
      howled?: boolean;
      learn?: string[];
      timers?: { k: number; turns: number; revert: Terrain }[];
      poeSouls?: number;
      rupees?: number;
    };
  }
  interface Unit {
    /** Bubbles: flames out for this many turns. */
    flameOut?: number;
    /** Green Bubble: currently ignited. */
    ignited?: boolean;
    /** Damage layers left on Argorok's armor / Blizzeta's ice. */
    layers?: number;
    /** Argorok: damage taken toward breaking its armor. */
    armorDmg?: number;
    /** Meg's illusions: the uid of the real Meg. */
    illusionOf?: string;
    /** Temporary units that leave after battle (Golden Division, fairies). */
    ephemeral?: boolean;
  }
}

const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const tilesOf = (b: Battle, u: Unit) => footprint(u.x, u.y, u.size).map((p) => b.tiles[keyOf(b, p.x, p.y)]);
const isFlying = (u: Unit) => moveTypeOf(u) === 'flying';
const has = (u: Unit, s: string) => u.skills.includes(s);
const free = (b: Battle, u: Unit, x: number, y: number) =>
  inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u; });
const tpState = (b: Battle) => (b.tp ??= { tears: 0, dormant: [] });

function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number>, barrier = false) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats, ...(barrier ? { barrier } : {}) });
}

/** Spaces next to a unit that fit `who`. */
function nearFree(b: Battle, who: Unit, by: Unit, r = 1): Pos | null {
  for (let d = 1; d <= r; d++) {
    for (const p of tilesInRange(b, by, d, d, by.size)) if (free(b, who, p.x, p.y)) return p;
  }
  return null;
}

// ───────────────────────── Who the Twilight hurts ─────────────────────────

/** Twili, Twilit creatures, Wolf Link and Light Spirits shrug off the Twilight. */
export function twilightNative(u: Unit): boolean {
  const tags = unitTags(u);
  return tags.includes('twili') || tags.includes('twilight') || u.race === 'twili' || u.race === 'sacredBeast' || u.race === 'lightSpirit';
}

function twilightProtected(b: Battle, u: Unit): boolean {
  if (twilightNative(u)) return true;
  if (u.team === 'player' && b.bonus === 'childrenOfTwilight') return true;
  if (u.pack.some((p) => p.id === 'sol')) return true;
  return b.units.some((a) => a.team === u.team && hasEffect(a, 'sacredForest') && unitDist(a, u) <= 1 && tileAt(b, a.x, a.y) === 'forest');
}

export function inTwilight(b: Battle, u: Unit, pos: Pos = u): boolean {
  return footprint(pos.x, pos.y, u.size).some((p) => tileAt(b, p.x, p.y) === 'twilightFog');
}

/** Purify the Twilight on and around a space. */
export function purify(b: Battle, at: Pos, r: number, size = 1): number {
  let n = 0;
  for (const p of [...footprint(at.x, at.y, size), ...tilesInRange(b, at, 1, r, size)]) {
    const k = keyOf(b, p.x, p.y);
    if (b.tiles[k] === 'twilightFog' || b.tiles[k] === 'twilightBarrier') { b.tiles[k] = 'plain'; n++; }
  }
  return n;
}

/** Twilight Princess movement exceptions (called from grid.ts). */
export function tpTileCost(_b: Battle, u: Unit, t: Terrain, c: number): number {
  switch (t) {
    case 'twilightBarrier':
      return hasEffect(u, 'barrierWalker') || has(u, 'shadowFlight') || u.race === 'twili' || unitTags(u).includes('twilight') ? 1 : c;
    case 'spinnerRail':
      return hasEffect(u, 'spinner') ? 1 : c;
    case 'sinkingSand':
      return hasEffect(u, 'sandWalker') || hasEffect(u, 'spinner') || has(u, 'sandBurrow') ? 1 : c;
    case 'magneticSurface':
      return Object.values(u.gear).includes('ironBoots') ? 2 : c;
    case 'hangingPeahat':
    case 'clawshotGrate':
      return hasEffect(u, 'clawshot') && t === 'hangingPeahat' ? 1 : c;
    case 'flames':
      return unitTags(u).includes('fire') || hasEffect(u, 'fireImmune') ? 1 : c;
    default:
      return c;
  }
}

// ───────────────────────── Battlefield setup ─────────────────────────

const FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  ordonProvince: { howlingStone: 1, buriedPassage: 2, windVent: 0 },
  faronWoods: { howlingStone: 1, buriedPassage: 2, sacredLight: 1, clawshotGrate: 1 },
  eldinProvince: { magneticSurface: 3, magneticCrane: 1, buriedPassage: 1, howlingStone: 1 },
  lanayruProvince: { clawshotGrate: 2, hangingPeahat: 1, iceBlock: 2, howlingStone: 1 },
  hyruleFieldTP: { howlingStone: 1, buriedPassage: 1, cannonTransport: 1 },
  gerudoDesertTP: { sinkingSand: 5, spinnerRail: 4, spinnerGear: 1, buriedPassage: 1, cannonTransport: 1 },
  snowpeak: { iceWall: 3, iceBlock: 3, howlingStone: 1 },
  sacredGrove: { dominionStatue: 3, sacredLight: 2, howlingStone: 1 },
  cityInTheSky: { windVent: 4, clawshotGrate: 3, hangingPeahat: 3 },
  twilightRealm: { twilightBarrier: 3, sacredLight: 1 },
  hyruleCastleTP: { twilightBarrier: 2, clawshotGrate: 1, spinnerGear: 1 },
};
const OBSTACLE_SPACES = new Set<Terrain>(['spinnerGear', 'clawshotGrate', 'magneticCrane', 'dominionStatue', 'iceWall', 'iceBlock', 'howlingStone', 'twilightBarrier']);

export function decorateTwilight(b: Battle, rng: RNG) {
  const w = worldDef(b.world);
  if (w.campaign !== 'twilight') return;
  const feats = FEATURES[b.world] ?? {};
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains: number[] = [];
  for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i] === 'plain' && !occupied.has(i)) plains.push(i);
  const pool = rng.shuffle(plains);
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    for (let j = 0; j < n && pool.length; j++) {
      const k = pool.pop()!;
      const x = k % b.width;
      // Keep obstacles out of the deployment columns.
      if (OBSTACLE_SPACES.has(t) && (x < 3 || x > b.width - 3)) { j--; continue; }
      b.tiles[k] = t;
    }
  }
  // Under the Twilight: patches of fog everywhere but the deployment zone, and hidden Shadow Insects.
  if (b.twilit || b.world === 'twilightRealm') {
    for (let i = 0; i < b.tiles.length; i++) {
      const x = i % b.width;
      if (x >= 3 && (b.tiles[i] === 'plain' || b.tiles[i] === 'forest') && !occupied.has(i) && rng.chance(b.world === 'twilightRealm' ? 55 : 40)) b.tiles[i] = 'twilightFog';
    }
  }
  for (const u of b.units) {
    if (u.team === 'enemy' && (has(u, 'invisibleParasite') || has(u, 'invisibleBurden') || has(u, 'invisibleExecutioner') || has(u, 'hiddenBeneath'))) u.hidden = true;
    if (has(u, 'electricalAmbush')) u.hidden = true;
    if (u.skills.includes('infernalShroud') || u.skills.includes('cursedFlameBubble') || u.skills.includes('cursedFlameTP')) u.flameOut = 0;
    if (has(u, 'pulsatingFlame')) u.ignited = true;
    if (has(u, 'frozenFortress') || hasEffect(u, 'armorLayers')) u.layers = 3;
  }
}

/** Battle start: the Hero's Shade's Crest teaches a skill; Meg's illusions appear; group supports switch on. */
export function twilightBattleStart(b: Battle, rng: RNG) {
  b.groupSupports = activeGroups(b, 'player');
  for (const g of b.groupSupports) b.log.push(`Group support: ${g.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
  for (const u of [...b.units]) {
    if (hasEffect(u, 'hiddenCrest') && u.weapons.some((w) => WEAPONS[w]?.type === 'sword')) {
      const left = HIDDEN_SKILLS.filter((s) => !u.abilities.includes(s));
      if (left.length) { const s = rng.pick(left); u.abilities.push(s); b.log.push(`${u.name} learns ${ABILITIES[s]?.name} from the Hero's Shade's Crest.`); }
    }
    if (has(u, 'sisterOfIllusions')) for (let i = 0; i < 3; i++) spawnIllusion(b, u);
  }
}

function spawnIllusion(b: Battle, meg: Unit): Unit | null {
  if (b.units.filter((x) => x.illusionOf === meg.uid).length >= 3) return null;
  const copy: Unit = { ...meg, uid: `${meg.uid}-ill${b.uidCounter++}`, hp: 1, stats: { ...meg.stats, hp: 1 }, illusionOf: meg.uid, ephemeral: true,
    summoned: true, abilities: [], skills: ['illusion'], pack: [], gear: {}, buffs: [], statuses: [], moved: true, acted: true, kills: 0 };
  const spot = nearFree(b, copy, meg, 3);
  if (!spot) return null;
  copy.x = spot.x; copy.y = spot.y;
  b.units.push(copy);
  return copy;
}

// ───────────────────────── Start of phase ─────────────────────────

export interface TPEvent { uid: string; heal: number; damage: number; source: string }

export function tpStartPhase(b: Battle, u: Unit, events: TPEvent[]) {
  const rng = new RNG(b.rngState);
  const mine = b.units.filter((a) => a.team === u.team);
  const foes = b.units.filter((e) => e.team !== u.team);
  const here = tilesOf(b, u);
  const heal = (amt: number, source: string) => {
    amt = Math.min(u.stats.hp - u.hp, Math.max(0, Math.ceil(amt)));
    if (amt > 0) { u.hp += amt; events.push({ uid: u.uid, heal: amt, damage: 0, source }); if (hasEffect(u, 'healStamina')) u.sta = Math.min(u.stats.sta, u.sta + 3); }
  };
  const hurt = (amt: number, source: string, lethal = false) => {
    amt = Math.min(lethal ? u.hp : u.hp - 1, Math.max(0, Math.ceil(amt)));
    if (amt > 0) { u.hp -= amt; events.push({ uid: u.uid, heal: 0, damage: amt, source }); }
  };
  const st = tpState(b);

  // ── The Twilight ──
  if (here.includes('twilightFog')) {
    if (twilightNative(u) && (u.race === 'lightSpirit' || hasEffect(u, 'purifyStep'))) purify(b, u, 0, u.size);
    else if (!twilightProtected(b, u)) hurt(u.stats.hp * 0.05, 'Twilight');
    else if (hasEffect(u, 'twilightRegen')) heal(u.stats.hp * 0.1, "Midna's Twilight Garb");
    if (hasEffect(u, 'twilightConceal') && !u.attacked) addStatus(u, 'veiled', 1);
  }
  if (here.includes('sacredLight') && (unitTags(u).includes('twilight') || unitTags(u).includes('shadow'))) hurt(u.stats.hp * 0.1, 'Sacred Light');
  if (here.includes('sacredLight') && !unitTags(u).includes('twilight') && !unitTags(u).includes('shadow')) heal(u.stats.hp * 0.1, 'Sacred Light');
  if (here.includes('flames') && !hasEffect(u, 'fireImmune') && !unitTags(u).includes('fire') && !ssHazardImmune(u)) { hurt(u.stats.hp * 0.1, 'Burning ground'); }
  if (u.race === 'lightSpirit' || hasEffect(u, 'purifyStep') || WEAPONS[u.weapons[0]]?.dispelsTwilight) purify(b, u, u.race === 'lightSpirit' ? 1 : 0, u.size);
  if (has(u, 'lightOfTheLake')) purify(b, u, 2, u.size);
  // ── Spaces ──
  if (here.includes('windVent') && (isFlying(u) || hasEffect(u, 'clawshot'))) buff(u, 'vent', 'Wind Vent', 1, { mov: 2 });
  if (here.includes('spinnerRail') && hasEffect(u, 'spinner')) buff(u, 'rail', 'Spinner Rail', 1, { mov: 3 });
  if (here.includes('sinkingSand') && !hasEffect(u, 'sandWalker') && !hasEffect(u, 'spinner') && !isFlying(u) && !has(u, 'sandBurrow') && !ssHazardImmune(u)) { buff(u, 'sink', 'Sinking Sand', 1, { mov: -2, spd: -2 }); hurt(2, 'Sinking Sand'); }
  if (b.world === 'snowpeak' && !isFlying(u) && !hasEffect(u, 'snowWalker') && !has(u, 'mountainTraining') && u.race !== 'yeti' && !has(u, 'snowPredator') && !has(u, 'slidingCollision')) buff(u, 'snow', 'Deep Snow', 1, { mov: -1 });
  if (b.world === 'snowpeak' && has(u, 'slidingCollision')) buff(u, 'slide', 'Sliding', 1, { mov: 3 });
  if (b.world === 'snowpeak' && hasEffect(u, 'iceRegen')) heal(3, 'Chilfos Ice Armor');
  // ── Timers on special spaces (burning ground, ice pillars, fog capsules) ──
  if (u.team === 'player' && st.timers?.length) {
    for (const t of st.timers) if (--t.turns <= 0) b.tiles[t.k] = t.revert;
    st.timers = st.timers.filter((t) => t.turns > 0);
  }

  // Darkhammer's whirling chain catches anyone who stays next to it.
  const ham = foes.find((e) => has(e, 'chainDefense') && unitDist(e, u) <= 1);
  if (ham) hurt(5, `${ham.name}'s chain`);
  for (const e of foes) if (e.hidden && has(e, 'hiddenBeneath') && unitDist(e, u) <= 1) { e.hidden = false; (e.turnUses ??= {}).revealedTurn = b.turn; }
  // ── Personal skills ──
  if (has(u, 'goldenRegeneration')) heal(u.stats.hp * 0.25, 'Golden Regeneration');
  if (has(u, 'unstableComposition')) {
    const roll = rng.int(0, 4);
    if (roll === 0) buff(u, 'unstable', 'Unstable: +5 STR', 1, { str: 5 });
    else if (roll === 1) buff(u, 'unstable', 'Unstable: +5 MAG', 1, { mag: 5 });
    else if (roll === 2) buff(u, 'unstable', 'Unstable: +5 DEF/RES', 1, { def: 5, res: 5 });
    else if (roll === 3) heal(u.stats.hp * 0.25, 'Unstable Composition');
    else hurt(u.stats.hp * 0.1, 'Unstable Composition');
  }
  if (has(u, 'pulsatingFlame')) {
    u.ignited = !u.ignited;
    if (u.ignited) buff(u, 'pulse', 'Ignited', 1, { def: 5, res: 5 });
    else buff(u, 'pulse', 'Extinguished', 1, { mov: 3 });
  }
  if (hasEffect(u, 'pulsingGuard')) buff(u, 'pulseGear', 'Pulsing Flame', 1, b.turn % 2 ? { def: 4 } : { res: 4 });
  if (u.flameOut && u.flameOut > 0 && --u.flameOut === 0) events.push({ uid: u.uid, heal: 0, damage: 0, source: 'Its flames reignite' });
  if (has(u, 'spectralDormancy') && u.movedDist === 0 && !u.attacked) addStatus(u, 'veiled', 1);
  if (has(u, 'electricalAmbush') && !u.hidden && (u.turnUses?.revealedTurn ?? 0) < b.turn - 1) u.hidden = true;
  if (has(u, 'invisibleExecutioner') && !u.hidden && (u.turnUses?.revealedTurn ?? 0) <= b.turn - 2) u.hidden = true;
  if (has(u, 'severedStalk') && u.hp < u.stats.hp / 2 && u.stats.mov === 0) { u.stats = { ...u.stats, mov: 4 }; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'breaks free of its stalk' }); }
  if (has(u, 'twilightEmpowerment') && inTwilight(b, u)) buff(u, 'empower', 'Twilight Empowerment', 1, { str: 3, res: 3 });
  if (has(u, 'undeadSwimmer') && here.some((t) => t === 'water')) buff(u, 'swim', 'Undead Swimmer', 1, { mov: 3 });
  if (has(u, 'snowPredator') && b.world === 'snowpeak') buff(u, 'snowP', 'Snow Predator', 1, { str: 3 });
  if (has(u, 'frozenArmament') && !u.weapons.length) u.weapons.push('chilfosSpear');
  if (has(u, 'unstableSorcery')) {
    const s: Record<string, number> | null = inTwilight(b, u) ? { mag: 3 } : here.includes('water') ? { res: 3 } : here.includes('forest') ? { spd: 3 } : here.includes('mountain') ? { def: 3 } : null;
    if (s) buff(u, 'sorcery', 'Unstable Sorcery', 1, s);
  }
  // Corrupted Roots spread the Twilight.
  if (has(u, 'corruptedRoots') && !b.units.some((s) => s.race === 'lightSpirit' && unitDist(s, u) <= 4)) {
    const spots = tilesInRange(b, u, 1, 1, u.size).filter((p) => tileAt(b, p.x, p.y) === 'plain' || tileAt(b, p.x, p.y) === 'forest');
    if (spots.length) { const p = rng.pick(spots); b.tiles[keyOf(b, p.x, p.y)] = 'twilightFog'; }
  }
  // Paralyzing Scream (ReDead Knights).
  if (has(u, 'paralyzingScream')) {
    for (const e of foes) if (unitDist(u, e) <= 2 && !hasStatus(e, 'stun') && rng.int(0, 30) > effectiveStats(e).res) {
      addStatus(e, 'stun', 1); events.push({ uid: e.uid, heal: 0, damage: 0, source: 'paralyzed by a scream' });
    }
  }
  // Summoners: Stallord, Deku Toad, Bomblings, Phantom Zant.
  const summon = (enemyId: string, cap: number, every: number, label: string) => {
    if (b.turn % every !== 0 || !ENEMIES[enemyId]) return;
    if (b.units.filter((x) => x.team === u.team && x.artId === enemyId && x.summoned).length >= cap) return;
    const s = makeEnemy(ENEMIES[enemyId], b.world, Math.max(1, b.enemyLevel - 1), `e${b.uidCounter++}`, rng);
    const spot = nearFree(b, s, u, 2);
    if (!spot) return;
    Object.assign(s, { team: u.team, x: spot.x, y: spot.y, moved: true, acted: true, summoned: true, ephemeral: true });
    b.units.push(s);
    events.push({ uid: s.uid, heal: 0, damage: 0, source: label });
  };
  if (has(u, 'ancientResurrection')) summon('stalchild', 3, 3, 'Stallord raises the dead');
  if (has(u, 'spawnBrood')) summon('toadpoli', 3, 2, 'A Toadpoli drops from the Deku Toad');
  if (has(u, 'livingExplosive')) summon('bombling', 3, 2, 'A Bombling hatches');
  if (has(u, 'phantomSummoning')) summon('shadowKeese', 3, 3, 'Phantom Zant summons a Shadow Keese');
  // Phantom Zant teleports away from anyone who gets close.
  if (has(u, 'phantomSummoning') && foes.some((e) => unitDist(u, e) <= 1)) {
    const spots = tilesInRange(b, u, 3, 5, u.size).filter((p) => free(b, u, p.x, p.y) && !foes.some((e) => footDist(p.x, p.y, u.size, e.x, e.y, e.size) <= 1));
    if (spots.length) { const p = rng.pick(spots); u.x = p.x; u.y = p.y; events.push({ uid: u.uid, heal: 0, damage: 0, source: 'teleports away' }); }
  }
  // Shadow Beasts lying dormant: a living Shadow Beast screams them back.
  if (st.dormant.length) {
    for (const d of st.dormant.filter((x) => x.unit.team === u.team)) d.turns--;
    if (has(u, 'twilightRevival')) {
      for (const d of st.dormant.filter((x) => x.unit.team === u.team && x.turns >= 0)) {
        const spot = free(b, d.unit, d.unit.x, d.unit.y) ? { x: d.unit.x, y: d.unit.y } : nearFree(b, d.unit, u, 3);
        if (!spot) continue;
        const pct = d.unit.team === 'player' && b.bonus === 'endlessTwilight' ? 0.5 : 0.25;
        Object.assign(d.unit, { x: spot.x, y: spot.y, hp: Math.max(1, Math.ceil(d.unit.stats.hp * pct)), moved: true, acted: true });
        b.units.push(d.unit);
        b.fallen = b.fallen.filter((f) => f !== d.unit);
        d.turns = -99;
        events.push({ uid: d.unit.uid, heal: d.unit.hp, damage: 0, source: 'revived by a Shadow Beast\'s scream' });
      }
    }
    st.dormant = st.dormant.filter((x) => x.turns >= 0);
  }

  // ── Group supports ──
  const groups = u.team === 'player' ? b.groupSupports ?? [] : [];
  if (groups.length) {
    const tidOf = (x: Unit) => x.templateId ?? '';
    if (groups.includes('ancientWaters') && (u.race === 'zora' || u.race === 'zoraSpirit' || unitTags(u).includes('aquatic') || u.race === 'aquaticDeity' || u.race === 'aquaticCreature')) heal(u.stats.hp * 0.1, 'The Ancient Waters');
    if (groups.includes('restorationOfLight') && ['ordona', 'faron', 'eldin', 'lanayru'].includes(tidOf(u))) purify(b, u, 2, u.size);
    if (groups.includes('theResistance') && ['telma', 'rusl', 'ashei', 'auru', 'shad'].includes(tidOf(u))) revealAround(b, u, 4, events);
    if ((groups.includes('outsetFamily') && ['heroOfWinds', 'aryll', 'grandma'].includes(tidOf(u))) || (groups.includes('fallenHeroes') && ['herosShade', 'darmani', 'mikau'].includes(tidOf(u)))) u.statuses = u.statuses.filter((s) => s.kind !== 'fear');
    if (groups.includes('ranchFamily') && isMounted(u) && b.units.some((x) => x.team === u.team && Object.values(x.gear).includes('epona'))) buff(u, 'ranch', 'The Ranch Family', 1, { mov: 1 });
    if (groups.includes('thePirateCrew') && unitTags(u).includes('vessel')) buff(u, 'crew', 'The Pirate Crew', 1, { mov: 1 });
  }
  // ── Auras from allies ──
  for (const a of mine) {
    if (a === u) continue;
    const d = unitDist(a, u);
    if (has(a, 'lightOfOrdon') && d <= 2) { heal(3, 'Light of Ordon'); u.statuses = u.statuses.filter((s) => s.kind !== 'fear'); }
    if (has(a, 'royalHeritage') && u.race === 'zora' && d <= 3) u.sta = Math.min(u.stats.sta, u.sta + 2);
    if (has(a, 'mountainHospitality') && d <= 2 && b.world === 'snowpeak') { heal(3, 'Mountain Hospitality'); u.sta = Math.min(u.stats.sta, u.sta + 2); }
    if (has(a, 'motherOfFairies') && u.race === 'fairy' && d <= 99) u.mp = Math.min(u.stats.mp, u.mp + 5);
    if (has(a, 'poeSisterBond') && has(u, 'poeSisterBond') && poeQuartet(b, u)) u.mp = Math.min(u.stats.mp, u.mp + 2);
  }
  if (hasEffect(u, 'mpRegen3')) u.mp = Math.min(u.stats.mp, u.mp + 3);
  // Light of the Forest: shadow enemies in forests near the spirit burn.
  if (foes.some((e) => has(e, 'lightOfTheForest') && unitDist(e, u) <= 2) && (unitTags(u).includes('shadow') || unitTags(u).includes('twilight')) && here.includes('forest')) hurt(5, 'Light of the Forest');
  // Lantern: light within 3 reveals spectral and hidden enemies, and burns oil.
  if (hasEffect(u, 'lantern') && u.team === 'player') {
    const oil = u.pack.find((p) => p.id === 'lanternOil');
    const lit = !!oil || (u.turnUses?.oilTurns ?? 0) > 0;
    if (oil && !(u.turnUses?.oilTurns)) { oil.uses--; (u.turnUses ??= {}).oilTurns = 3; if (oil.uses <= 0) u.pack = u.pack.filter((p) => p !== oil); }
    if (u.turnUses?.oilTurns) u.turnUses.oilTurns--;
    if (lit) revealAround(b, u, 3, events);
  }
  if (has(u, 'heightenedSenses')) revealAround(b, u, 4, events);
  if (hasEffect(u, 'revealUndead')) for (const e of foes) if (e.hidden && unitTags(e).includes('undead') && unitDist(u, e) <= 4) e.hidden = false;
  b.rngState = rng.state;
}

function revealAround(b: Battle, u: Unit, r: number, events: TPEvent[]) {
  for (const e of b.units) if (e.team !== u.team && e.hidden && unitDist(u, e) <= r) { e.hidden = false; (e.turnUses ??= {}).revealedTurn = b.turn; events.push({ uid: e.uid, heal: 0, damage: 0, source: `revealed by ${u.name}` }); }
  if (b.traps) for (const t of b.traps) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= r) t.hidden = false;
}

const poeQuartet = (b: Battle, u: Unit) => ['joelle', 'beth', 'amy', 'meg'].every((id) => b.units.some((a) => a.team === u.team && a.templateId === id));

// ───────────────────────── Combat hooks ─────────────────────────

export interface TPMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

/** Situational bonuses from Twilight Princess skills, gear and spaces. */
export function tpMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): TPMods {
  const m: TPMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const dist = unitDist(u, foe, pos);
  const melee = !!w && !isMagical(w.type) && dist <= 1;
  const allies = b.units.filter((a) => a !== u && a.team === u.team);
  // The Twilight: Light World units are weakened; Twili and Twilit creatures empowered.
  if (inTwilight(b, u, pos)) {
    if (twilightNative(u)) { m.mag += 2; m.res += 2; }
    else if (!twilightProtected(b, u)) { m.str -= 2; m.spd -= 2; m.hit -= 10; }
  }
  if (has(u, 'raidersMomentum') && initiating && u.movedDist >= 3) m.dmg += 2;
  if (has(u, 'resistanceFighter') && initiating && (tileAt(b, pos.x, pos.y) === 'forest' || hasStatus(u, 'veiled'))) m.dmg += 0; // ×1.25 in tpMultiplier
  if (has(u, 'mountainStrength') && melee && foe.size > u.size) m.dmg += 5;
  if (has(u, 'strengthAboveAll') && (foe.stats.str > u.stats.str)) { m.str += 3; m.def += 3; }
  if (has(u, 'veteransAim') && w?.type === 'siege') { m.hit += 20; m.crit += 10; }
  if (has(u, 'snowPredator') && b.world === 'snowpeak') m.avoid += 20;
  if (has(u, 'aerialDuelist')) { if (u.movedDist === 0 && !initiating) m.def += 5; else if (initiating && u.movedDist > 0) m.dmg += 3; }
  if (has(u, 'pillarAcrobat') && !initiating && melee) m.avoid += 30;
  if (has(u, 'ceilingPredator') && !initiating && foe && unitDist(u, foe, pos) <= 1) m.avoid += 30;
  if (has(u, 'pulsatingFlame') && !u.ignited) m.avoid += 15;
  if (has(u, 'swarmingDarkness')) m.dmg += Math.min(6, 2 * allies.filter((a) => unitTags(a).includes('twilight') && unitDist(a, u, pos) <= 1).length);
  if (has(u, 'relentlessPatrol') && initiating) m.dmg += Math.min(10, 2 * (u.movedDist ?? 0));
  if (has(u, 'poeSisterBond') && poeQuartet(b, u)) { m.mag += 3; m.res += 3; m.avoid += 15; }
  if (hasEffect(u, 'hawkeye') && w?.type === 'bow' && dist >= 3) m.hit += 20;
  if (hasEffect(u, 'stillAvoid') && u.movedDist === 0) m.avoid += 15;
  if (hasEffect(u, 'sacredFire') && w?.element === 'fire') m.dmg += 3;
  if (u.buffs.some((x) => x.id === 'hiddenPotential')) m.skl += 2;
  if (u.buffs.some((x) => x.id === 'midnaRiding')) { m.str += 2; m.mag += 2; }
  // Commander bonuses
  if (u.team === 'player') {
    if (b.bonus === 'divinePower' && u.hp < u.stats.hp / 2) { m.str += 3; m.mag += 3; }
  }
  for (const a of allies) {
    const d = unitDist(a, u, pos);
    if (has(a, 'lightOfHyrule') && d <= 1 && (foe && WEAPONS[foe.weapons[0]]?.element === 'dark')) m.res += 3;
    if (has(a, 'royalHeritage') && u.race === 'zora' && d <= 3) m.res += 2;
    if (has(a, 'motherOfFairies') && u.race === 'fairy') { m.mag += 4; m.res += 4; }
    if (hasEffect(a, 'boneCrest') && unitTags(u).includes('undead') && d <= 2) m.def += 2;
  }
  return m;
}

/** Damage multipliers from Twilight Princess skills, gear, spaces and Hidden Skills. */
export function tpMultiplier(b: Battle, atk: Unit, def: Unit, _defPos: Pos, element: Element | undefined, magical: boolean, w: WeaponDef, dist: number, arrow?: AbilityDef): number {
  let mult = 1;
  const physical = !magical;
  const tagsD = unitTags(def);
  const twilit = tagsD.includes('twilight') || tagsD.includes('shadow');
  if (has(atk, 'resistanceFighter') && (tileAt(b, atk.x, atk.y) === 'forest' || hasStatus(atk, 'veiled'))) mult *= 1.25;
  if (has(def, 'armoredFace') && physical && dist <= 1 && !def.armorBroken && arrow?.id !== 'helmSplitter' && arrow?.id !== 'backSlice') mult *= 0.5;
  if (has(def, 'armoredDragon') && physical && !def.armorBroken) mult *= 0.6;
  if (has(def, 'sandBurrow') && dist > 1) mult *= 0.5;
  if (has(def, 'abyssalPredator') && dist > 1 && tilesOf(b, def).includes('water')) mult *= 0.5;
  if (has(atk, 'abyssalPredator') && tilesOf(b, def).includes('water')) mult *= 1.25;
  if (has(def, 'infernalShroud') && !def.flameOut && physical && dist <= 1) mult *= 0.5;
  if (has(def, 'creatureOfDarkness') && !hasStatus(def, 'petrified') && physical && element !== 'light' && w.type !== 'natural') mult = 0;
  if (hasStatus(def, 'petrified') && w.type === 'hammer') mult *= 2;
  if (has(def, 'puppetOfDarkness') && magical) mult *= 0.5;
  if (has(def, 'poeSisterBond') && physical) mult *= 0.75;
  if ((has(def, 'poeSisterBond') || def.race === 'undead' && def.classId === 'bubbleSpirit') && element === 'light') mult *= 1.5;
  if (hasEffect(def, 'shadowWard') && element === 'dark') mult *= 0.5;
  if (hasEffect(def, 'fireResist') && element === 'fire') mult *= 0.5;
  if (hasEffect(def, 'zoraArmorWeak') && (element === 'fire' || element === 'ice')) mult *= 1.5;
  if (has(atk, 'twilightSovereign') && element === 'dark') mult *= 1.15; // ignores 25% RES, roughly
  if (has(atk, 'crimsonFlame') && element === 'fire') mult *= 1.15;
  if (w.sacredVsDemon && tagsD.includes('demon')) mult *= 1 + w.sacredVsDemon * 0.5;
  if (atk.team === 'player' && b.bonus === 'sacredResistance' && element === 'light' && (twilit || tagsD.includes('undead'))) mult *= 1.25;
  if (atk.team === 'player' && b.bonus === 'mightMakesRight' && isMounted(atk) && atk.movedDist >= 2) mult *= 1.3;
  if (has(atk, 'mountainStrength') && def.size > atk.size && physical) mult *= 1;
  if (twilit && element === 'light' && WEAPONS[atk.weapons[0]]?.dispelsTwilight) mult *= 1;
  if (b.units.some((a) => a.team === atk.team && has(a, 'ancientResearch') && unitDist(a, atk) <= 3) && tagsD.includes('construct')) mult *= 1.25;
  if (hasEffect(atk, 'ambushBoost') && hasStatus(atk, 'veiled')) mult *= 1.2;
  if (has(atk, 'spectralDormancy') && hasStatus(atk, 'veiled')) mult *= 1.5;
  // Mounted Charge: +10% per space ridden before the blow (max +50%).
  if (isMounted(atk) && physical && dist <= 1) mult *= 1 + Math.min(5, atk.movedDist ?? 0) * 0.1;
  // Hidden Skills
  if (arrow?.id === 'mortalDraw') mult *= 2;
  if (atk.buffs.some((x) => x.id === 'rareJelly') && physical) mult *= 2;
  if (atk.buffs.some((x) => x.id === 'fairyTears') && physical) mult *= 2;
  return mult;
}

/** Forecast tweaks: Hidden Skills, Zelda's Rapier, Death Sword, Weapon Curse. */
export function tpSideAdjust(_b: Battle, atk: Unit, def: Unit, w: WeaponDef, arrow: AbilityDef | undefined, defense: number, magical: boolean): { defense: number; hit: number; crit: number; noBlock: boolean; finish: boolean; extraAttack: boolean } {
  const out = { defense, hit: 0, crit: 0, noBlock: false, finish: false, extraAttack: false };
  if (arrow?.id === 'backSlice') out.defense = Math.floor(defense * 0.5);
  if (arrow?.id === 'helmSplitter') out.noBlock = true;
  if (arrow?.id === 'endingBlow') {
    if (def.isBoss) out.extraAttack = true;
    else if (def.hp <= def.stats.hp * 0.25) { out.finish = true; out.hit += 30; }
  }
  if (w.strOrMag && !magical) {
    const s = effectiveStats(atk);
    if (s.mag > s.str) out.defense = Math.max(0, out.defense - (s.mag - s.str));
  }
  if (w.sacredVsDemon && unitTags(def).includes('demon') && !magical) out.defense = Math.floor(out.defense * (1 - w.sacredVsDemon));
  if (has(def, 'ceilingPredator') && !magical && w.minRange <= 1) out.hit -= 30;
  return out;
}

/** Weapon Curse and petrification stop weapon attacks (natural ones still work for Bubbles). */
export function tpCannotAttack(u: Unit, w: WeaponDef): boolean {
  if (hasStatus(u, 'petrified')) return true;
  if (hasStatus(u, 'weaponCurse') && w.type !== 'natural' && w.type !== 'magic') return true;
  return false;
}

/** Hidden Skills and other technique gates in the forecast. */
export function techniqueAllowed(u: Unit, a: AbilityDef, b?: Battle): boolean {
  if (a.hidden && !u.abilities.includes(a.id)) return false;
  if (a.mounted && !isMounted(u)) return false;
  if ((a.id === 'shieldAttack' || a.id === 'shieldBash') && !u.gear.shield) return false;
  if (a.id === 'mortalDraw' && b && (u.turnUses?.lastAttackTurn ?? -9) >= b.turn - 1) return false;
  if (a.id === 'greatSpin' && u.hp < u.stats.hp) return false;
  if (a.grantedBy?.templates && !a.grantedBy.templates.includes(u.templateId ?? u.bossId ?? '')) return false;
  return true;
}

/** Stamina cost of a technique for this unit. */
export function techniqueCost(u: Unit, a: AbilityDef, bonus?: string, groups?: string[]): number {
  let c = a.sta ?? 0;
  if (!c) return 0;
  if (a.hidden || a.id === 'mountedSpin' || a.id === 'mountedGrapple') {
    const thrift = Math.max(0, ...u.weapons.map((id) => WEAPONS[id]?.hiddenThrift ?? 0));
    if (a.hidden) c -= thrift;
    if (a.id === 'shieldAttack' && hasEffect(u, 'freeShieldAttack')) return 0;
    if (has(u, 'hiddenPotential') && a.hidden) c = Math.floor(c * 0.75);
    if (hasEffect(u, 'mountedThrift') && a.mounted) c = Math.floor(c * 0.75);
  }
  if (bonus === 'forgottenTechniques' && u.team === 'player') c = Math.floor(c * 0.8);
  if (hasEffect(u, 'farorePearl')) c = Math.ceil(c * 0.75);
  c = Math.floor(c * ssStaminaMult(u, bonus) * wildStaminaMult(u, a.id) * lgStaminaMult(u, a));
  // The Minish Cap: Swift Technique, Swiftblade's Sword, the Blade Brothers, Faster Spin.
  c = mnStaminaAdjust(u, a, bonus, c, groups);
  c = lrStaminaAdjust(u, a, bonus, c, groups);
  c = tfStaminaAdjust(u, a, bonus, c, groups);
  return Math.max(0, c);
}

/** MP multiplier for Twilight Princess abilities. */
export function tpCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  let m = 1;
  if (b?.bonus === 'endlessTwilight' && u.team === 'player' && (u.race === 'twili' || unitTags(u).includes('twilight') || ['shadowGrab', 'zantsWarp'].includes(def.id))) m *= 0.75;
  if (def.id === 'zantsWarp' && hasEffect(u, 'warpThrift')) m *= 0.5;
  if (has(u, 'poeSisterBond') && b && poeQuartet(b, u)) m *= 0.75;
  if (hasEffect(u, 'healThrift') && ['fairyQueensBlessing', 'royalRestoration', 'radiantJelly'].includes(def.id)) m *= 0.75;
  return m;
}

/** Extra bow range (Hawkeye). */
export function tpRangeBonus(u: Unit, w: WeaponDef): number {
  return w.type === 'bow' && hasEffect(u, 'hawkeye') ? 2 : 0;
}

/** Can't be critically hit from the front (Helmasaurus). */
export function tpCritImmune(def: Unit): boolean {
  return has(def, 'heavyCarapace');
}

/** Damage as it lands: armor layers, Blizzeta's ice, Spectral Barrier. */
export function tpOnStrike(_b: Battle, by: Unit, target: Unit, dmg: number): { dmg: number; line?: string } {
  if (dmg <= 0) return { dmg };
  const barrier = target.buffs.find((x) => x.id === 'spectralBarrier');
  if (barrier) {
    const absorb = Math.min(dmg, barrier.stats?.def ?? 15);
    dmg -= absorb;
    target.buffs = target.buffs.filter((x) => x !== barrier);
    return { dmg, line: `${target.name}'s spectral barrier absorbs ${absorb}.` };
  }
  if (target.buffs.some((x) => x.id === 'azureBarrier') && !isMagical(WEAPONS[by.weapons[0]]?.type ?? 'natural')) dmg = Math.floor(dmg / 2);
  if ((target.layers ?? 0) > 0) {
    target.layers!--;
    return { dmg: Math.ceil(dmg / 2), line: `${target.name}'s ${has(target, 'frozenFortress') ? 'ice armor' : 'armor plates'} absorb half the blow.` };
  }
  return { dmg };
}

/** A fatal blow about to land: Divine Defiance, Mother's Blessing, Divine Protection. */
export function tpSaveFromDeath(b: Battle, target: Unit): string | null {
  if (has(target, 'divineDefiance') && !target.usedAbilities?.includes('divineDefiance')) {
    (target.usedAbilities ??= []).push('divineDefiance');
    buff(target, 'defiance', 'Divine Defiance', 2, { str: 5, mag: 5 });
    return `${target.name} refuses to fall!`;
  }
  if (promiseKept(b, target)) return `A promise kept: ${target.name} holds on!`;
  const prot = target.buffs.find((x) => x.id === 'divineProtection');
  if (prot) { target.buffs = target.buffs.filter((x) => x !== prot); return `The Fairy Queen's protection saves ${target.name}!`; }
  if (target.race === 'zora') {
    const mom = b.units.find((a) => a.team === target.team && a !== target && has(a, 'mothersBlessing') && unitDist(a, target) <= 1 && !a.usedAbilities?.includes('mothersBlessing'));
    if (mom) { (mom.usedAbilities ??= []).push('mothersBlessing'); return `${mom.name} shields ${target.name}!`; }
  }
  return null;
}

/** After a damaging hit lands. */
export function tpAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, _crit: boolean, w: WeaponDef | undefined, element: Element | undefined, rng: RNG, arrow?: AbilityDef): string[] {
  const lines: string[] = [];
  if (dmg <= 0 || !w) return lines;
  const big = (u: Unit) => u.size;
  // Hidden Skills
  if (arrow?.hidden) {
    if (has(by, 'hiddenPotential')) buff(by, 'hiddenPotential', 'Hidden Potential', 2, { skl: 2 });
    if (arrow.id === 'shieldAttack' && target.hp > 0) {
      addStatus(target, 'dazed', 1);
      target.buffs = target.buffs.filter((x) => !x.barrier && x.id !== 'azureBarrier');
      if (target.flameOut !== undefined && has(target, 'cursedFlameBubble')) target.flameOut = 2;
      lines.push(`${target.name} is staggered!`);
    }
  }
  // Light petrifies Dark ChuChus.
  if (has(target, 'creatureOfDarkness') && element === 'light' && target.hp > 0) { addStatus(target, 'petrified', 2); lines.push(`${target.name} turns to stone!`); }
  // Water, ice and wind put out Bubble flames.
  if ((element === 'water' || element === 'ice' || w.gale || ['gustMagic', 'korokWind', 'zephosGust', 'cyclosCycloneStaff'].includes(w.id)) && target.flameOut !== undefined) {
    target.flameOut = 2; lines.push(`${target.name}'s flames go out!`);
  }
  if (w.drainsMp) {
    const d = Math.min(target.mp, w.drainsMp);
    target.mp -= d;
    if (w.mpToWielder) by.mp = Math.min(by.stats.mp, by.mp + d);
  }
  if (has(by, 'emeraldFlame')) { target.mp = Math.max(0, target.mp - 3); target.sta = Math.max(0, target.sta - 3); by.mp = Math.min(by.stats.mp, by.mp + 3); }
  if (has(by, 'shadowBite')) target.mp = Math.max(0, target.mp - 3);
  if ((w.chill || has(by, 'azureFlame')) && target.hp > 0) buff(target, 'chilled', 'Chilled', 1, { mov: -2, spd: -2 });
  if ((w.burden || has(by, 'invisibleBurden')) && target.hp > 0) buff(target, 'burden', 'Ghostly Burden', 2, { mov: -2 });
  if (has(by, 'clingingSwarm') && target.hp > 0) addStatus(target, 'root', 1);
  if (has(by, 'devouringMaw') && big(target) < big(by) && target.hp > 0) { addStatus(target, 'root', 1); lines.push(`${by.name} traps ${target.name} in its maw!`); }
  if (w.stripsBuff && target.buffs.length) { const lost = target.buffs.shift()!; lines.push(`The light dispels ${target.name}'s ${lost.name}.`); }
  if (has(by, 'lightOfHyrule') && element === 'light' && target.buffs.length) target.buffs.shift();
  if ((w.inflict?.status === 'weaponCurse' || has(by, 'cursedFlameTP') || (has(by, 'cursedFlameBubble') && !by.flameOut) || has(by, 'lingeringCurse')) && target.hp > 0 && !curseImmune(b, target)) {
    const turns = has(by, 'lingeringCurse') ? 3 : 2;
    addStatus(target, 'weaponCurse', turns + (hasEffect(by, 'composer') ? 1 : 0));
  }
  if (hasEffect(by, 'curseTouch') && !isMagical(w.type) && rng.chance(20) && !curseImmune(b, target)) addStatus(target, 'weaponCurse', 2);
  // Pushes and pulls
  if (w.gale && target.size <= by.size && target.hp > 0 && !has(target, 'unmovableElder') && !has(target, 'heavyCarapace')) pushAway(b, target, by, 1);
  const knock = (w.mountedKnockback && isMounted(by)) ? w.mountedKnockback : (has(by, 'wildCharge') || has(by, 'volcanicWrestler')) && target.size < by.size ? 1 : 0;
  if (knock && target.hp > 0 && !has(target, 'heavyCarapace') && !(has(target, 'unmovableElder') && target.size >= by.size)) pushAway(b, target, by, knock);
  if (has(by, 'infernalChains') && target.hp > 0) pullToward(b, target, by, 1);
  if (w.burnsPath || has(by, 'infernalChains')) setTimed(b, target.x, target.y, 'flames', 2);
  if ((w.iceObstacle || hasEffect(by, 'iceJewel')) && element === 'ice') {
    const behind = { x: target.x + Math.sign(target.x - by.x), y: target.y + Math.sign(target.y - by.y) };
    if (tileAt(b, behind.x, behind.y) === 'plain' && !unitAt(b, behind.x, behind.y)) setTimed(b, behind.x, behind.y, 'iceBlock', 3);
  }
  if (w.purifies) purify(b, target, 0, target.size);
  if (w.breaksIce) for (const p of tilesInRange(b, target, 0, 1, target.size)) if (tileAt(b, p.x, p.y) === 'iceWall' || tileAt(b, p.x, p.y) === 'iceBlock') b.tiles[keyOf(b, p.x, p.y)] = 'plain';
  // Possession: Ook's Parasite takes over a weakened enemy.
  if (has(by, 'possessionSkill') && target.hp > 0 && target.hp < target.stats.hp * 0.3 && !target.isBoss) {
    target.team = by.team; target.commanded = 1; target.moved = target.acted = true;
    lines.push(`${by.name} possesses ${target.name}!`);
  }
  // Breaking Argorok's armor: grappling, armor breakers, or 30 damage in a battle.
  if (has(target, 'armoredDragon') && !target.armorBroken) {
    target.armorDmg = (target.armorDmg ?? 0) + dmg;
    if (w.armorBreaker || w.type === 'hookshot' || hasEffect(by, 'clawshot') || target.armorDmg >= 30) {
      target.armorBroken = true; lines.push(`${target.name}'s armor plates fall away!`);
      if (hasEffect(by, 'dragonHeart')) by.hp = Math.min(by.stats.hp, by.hp + Math.ceil(by.stats.hp * 0.2));
    }
  }
  if (has(target, 'armoredFace') && !target.armorBroken && (w.type === 'hookshot' || hasEffect(by, 'clawshot') || w.armorBreaker)) { target.armorBroken = true; lines.push(`${target.name}'s armored face is torn off!`); }
  // Forced Dismount: a heavy blow or a Mounted Grapple throws a rider from the saddle.
  if (isMounted(target) && target.hp > 0 && (arrow?.id === 'mountedGrapple' || dmg >= target.stats.hp * 0.4)) {
    target.mounted = false;
    target.size = target.baseSize ?? 1;
    lines.push(`${target.name} is thrown from the saddle!`);
  }
  // Joust: two riders clash; the one who struck is the winner and the loser is pushed back.
  if (isMounted(by) && isMounted(target) && target.hp > 0 && unitDist(by, target) <= 1) pushAway(b, target, by, 1);
  // Revealing hidden attackers.
  if (by.hidden) { by.hidden = false; (by.turnUses ??= {}).revealedTurn = b.turn; }
  return lines;
}

function curseImmune(b: Battle, u: Unit): boolean {
  if (hasEffect(u, 'curseImmune') || has(u, 'lingeringCurse') || has(u, 'cursedFlameBubble') || has(u, 'spectralDormancy')) return true;
  return b.units.some((a) => a.team === u.team && has(a, 'twilightSovereign') && unitDist(a, u) <= 2);
}

function setTimed(b: Battle, x: number, y: number, t: Terrain, turns: number) {
  if (!inBounds(b, x, y)) return;
  const k = keyOf(b, x, y);
  const was = b.tiles[k];
  if (was === t || ['wall', 'water', 'lava', 'fort'].includes(was) || OBSTACLE_SPACES.has(was)) return;
  if (t !== 'flames' && unitAt(b, x, y)) return;
  b.tiles[k] = t;
  (tpState(b).timers ??= []).push({ k, turns, revert: was });
}

/** After combat: auras that hurt attackers, chain defenses, multi-maws. */
export function tpAfterCombat(b: Battle, attacker: Unit, defender: Unit): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  (attacker.turnUses ??= {}).lastAttackTurn = b.turn;
  const hit = (me: Unit, foe: Unit, d: number) => {
    if (foe.hp <= 1 || me.hp <= 0) return;
    d = Math.min(foe.hp - 1, d);
    foe.hp -= d;
    out.push({ uid: foe.uid, dmg: d, hp: foe.hp, killed: false, by: me.uid });
  };
  for (const [me, foe] of [[attacker, defender], [defender, attacker]] as const) {
    if (unitDist(me, foe) > 1) continue;
    if (has(me, 'infernalShroud') && !me.flameOut) { hit(me, foe, 3); addStatus(foe, 'burn', 1); }
    if (hasEffect(me, 'burningAura')) hit(me, foe, 3);
    if (has(me, 'pulsatingFlame') && me.ignited) hit(me, foe, Math.ceil(effectiveStats(me).mag / 3));
  }
  // Diababa's other heads bite nearby enemies.
  if (has(attacker, 'tripleMaw') && attacker.hp > 0) {
    for (const e of b.units.filter((x) => x.team !== attacker.team && x !== defender && unitDist(attacker, x) <= 2).slice(0, 2)) hit(attacker, e, Math.ceil(effectiveStats(attacker).str / 3));
  }
  // Illusions vanish when struck.
  for (const u of [attacker, defender]) if (u.illusionOf && u.hp <= 1) { b.units = b.units.filter((x) => x !== u); }
  return out;
}

/** Chain Defense: enemies ending a move next to Darkhammer take damage (called after movement). */
export function tpAfterMove(b: Battle, u: Unit): string | null {
  const ham = b.units.find((e) => e.team !== u.team && has(e, 'chainDefense') && unitDist(e, u) <= 1);
  if (ham && u.hp > 1) { const d = Math.min(u.hp - 1, 5); u.hp -= d; return `${ham.name}'s whirling chain strikes ${u.name} (${d}).`; }
  if (hasEffect(u, 'purifyStep')) purify(b, u, 0, u.size);
  // Tile Worms and hidden ambushers strike when someone comes close.
  for (const e of b.units) if (e.team !== u.team && e.hidden && has(e, 'hiddenBeneath') && unitDist(e, u) <= 1) { e.hidden = false; (e.turnUses ??= {}).revealedTurn = b.turn; }
  return null;
}

/** On a kill: Shadow Beast dormancy, Tears of Light, Meg's duplicates, Poe Souls. */
export function tpOnKill(b: Battle, by: Unit, victim: Unit, _rng: RNG, element?: Element) {
  const st = tpState(b);
  if (has(victim, 'twilightRevival') && element !== 'light' && !WEAPONS[by.weapons[0]]?.dispelsTwilight) {
    if (b.units.some((x) => x !== victim && x.team === victim.team && has(x, 'twilightRevival'))) {
      st.dormant.push({ unit: victim, turns: 1 });
      b.log.push(`${victim.name} collapses... but its body doesn't fade.`);
    }
  }
  if (has(victim, 'invisibleParasite') && by.team === 'player') { st.tears++; b.log.push('A Tear of Light!'); }
  if (WEAPONS[by.weapons[0]]?.duplicateOnKill) spawnIllusion(b, by);
  if (victim.artId === 'poe' || victim.templateId === 'poe' || victim.race === 'undead' && victim.classId === 'caster') {
    st.poeSouls = (st.poeSouls ?? 0) + 1;
    if (b.units.some((a) => a.team === by.team && has(a, 'goldenCurse'))) st.rupees = (st.rupees ?? 0) + 20;
  }
  // Riders climb down when their mount falls.
  if (victim.cargo?.length) {
    for (const c of victim.cargo) {
      const spot = nearFree(b, c, victim, 2);
      if (spot) { Object.assign(c, { x: spot.x, y: spot.y }); b.units.push(c); }
    }
    victim.cargo = [];
  }
  // A larger ally falls: Armogohma's Eye escapes; Stallord's Head floats free.
  for (const u of b.units) {
    if (u.team !== victim.team || u === victim) continue;
    if (has(u, 'emergencyEscape') && victim.size > u.size) buff(u, 'escape', 'Emergency Escape', 3, { mov: 4 });
    if (has(u, 'floatingSkull') && victim.templateId === 'stallord') buff(u, 'float', 'Floating Skull', 9, { mov: 2 });
  }
  // Illusions die with Meg.
  if (has(victim, 'sisterOfIllusions')) b.units = b.units.filter((x) => x.illusionOf !== victim.uid);
}

// ───────────────────────── Abilities ─────────────────────────

const TP_TILE = new Set(['jumpStrike', 'zantsWarp', 'shadowGrab', 'midnaDismount', 'ancientEscapeAbility']);
const TP_TARGET = new Set(['spectralBarrier', 'hauntingCurse', 'spiritDrain', 'coldEmbrace', 'fairyQueensBlessing', 'elementalGift', 'divineProtection', 'fairyAscension',
  'goldenBlessing', 'jellyTransfer', 'chuFusion', 'midnaRide', 'sumoThrow', 'curseTransfer', 'phantomAssault']);
const TP_OTHER = new Set(['wolfDig', 'wolfSense', 'wolfHowl', 'energyField', 'wolfForm', 'humanForm', 'fusedShadowForm', 'zantsFrenzy', 'beastCharge', 'lakesMercy',
  'warHorn', 'horseCallAbility', 'greatSpin', 'mountedSpin', 'crimsonLantern', 'paintingRefuge', 'phantomQuartet', 'illusoryExchange', 'chuDivide', 'radiantJelly',
  'purifyingBody', 'goldenDivision', 'reignite', 'lavaDive', 'fireburst', 'curseWave', 'azureBarrier', 'flameToggle', 'hexingScreech', 'dormantSkull',
  'royalRestoration', 'fairySummoning', 'solLight']);

export function isTPAbility(def: AbilityDef): boolean {
  return TP_TILE.has(def.id) || TP_TARGET.has(def.id) || TP_OTHER.has(def.id);
}
export function tpNeedsTile(def: AbilityDef): boolean { return TP_TILE.has(def.id); }
export function tpNeedsTarget(def: AbilityDef): boolean { return TP_TARGET.has(def.id); }

const foesWithin = (b: Battle, u: Unit, r: number) => b.units.filter((e) => e.team !== u.team && !e.captive && unitDist(u, e) <= r);
const alliesWithin = (b: Battle, u: Unit, r: number) => b.units.filter((a) => a.team === u.team && a !== u && unitDist(u, a) <= r);
const isBeast = (a: Unit) => a.race === 'sacredBeast' || a.race === 'bullbo' || unitTags(a).includes('beast') || isMounted(a) || a.templateId === 'epona';
const isChu = (a: Unit) => a.race === 'chuchu';

export function tpTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  const out: Pos[] = [];
  const scan = (r: number, ok: (x: number, y: number) => boolean) => {
    for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) if (footDist(x, y, u.size, u.x, u.y, u.size) <= r && ok(x, y)) out.push({ x, y });
  };
  switch (def.id) {
    case 'jumpStrike':
      scan(2, (x, y) => free(b, u, x, y) && b.units.some((e) => e.team !== u.team && footDist(x, y, u.size, e.x, e.y, e.size) === 1));
      break;
    case 'zantsWarp':
      scan(4, (x, y) => (x !== u.x || y !== u.y) && free(b, u, x, y));
      break;
    case 'shadowGrab': {
      const victim = grabVictim(b, u);
      if (victim) for (const p of tilesInRange(b, victim, 1, 3, victim.size)) if (free(b, victim, p.x, p.y)) out.push(p);
      break;
    }
    case 'midnaDismount': {
      const midna = u.cargo?.find((c) => has(c, 'twilightCompanion'));
      if (midna) for (const p of tilesInRange(b, u, 1, 1, u.size)) if (free(b, midna, p.x, p.y)) out.push(p);
      break;
    }
    case 'ancientEscapeAbility':
      scan(99, (x, y) => x < 3 && free(b, u, x, y));
      break;
  }
  return out;
}

function grabVictim(b: Battle, u: Unit): Unit | undefined {
  const cap = 1 + (hasEffect(u, 'bigGrapple') ? 1 : 0) + (u.size >= 3 ? 2 : 0);
  return foesWithin(b, u, 3).filter((e) => e.size <= cap && !e.isBoss && !has(e, 'unmovableElder')).sort((a, c) => unitDist(u, a) - unitDist(u, c))[0];
}

export function tpTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  switch (def.id) {
    case 'spectralBarrier': return [u, ...alliesWithin(b, u, 2)];
    case 'fairyQueensBlessing': case 'divineProtection': return [u, ...alliesWithin(b, u, 3)];
    case 'elementalGift': return alliesWithin(b, u, 3).filter((a) => a.weapons.some((w) => WEAPONS[w]?.type === 'bow'));
    case 'fairyAscension': return alliesWithin(b, u, 3).filter((a) => a.race === 'fairy');
    case 'goldenBlessing': return alliesWithin(b, u, 1);
    case 'jellyTransfer': return b.units.filter((a) => a !== u && unitDist(u, a) <= 1);
    case 'hauntingCurse': case 'spiritDrain': return foesWithin(b, u, 3);
    case 'phantomAssault': return foesWithin(b, u, 4);
    case 'coldEmbrace': return foesWithin(b, u, 1);
    case 'curseTransfer': return foesWithin(b, u, 4).filter((e) => hasStatus(e, 'weaponCurse'));
    case 'chuFusion': return alliesWithin(b, u, 1).filter((a) => isChu(a) && !a.fusedPartner && !a.ephemeral && spChuFusion(u, a) !== null);
    case 'midnaRide': return alliesWithin(b, u, 1).filter((a) => isBeast(a) && !(a.cargo?.length));
    case 'sumoThrow': return b.units.filter((a) => a !== u && unitDist(u, a) === 1 && a.size <= u.size + (hasEffect(u, 'bigGrapple') ? 1 : 0) && !has(a, 'unmovableElder') && !a.isBoss);
  }
  return [];
}

export function tpUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isTPAbility(def)) return undefined;
  if (tpNeedsTarget(def) && !tpTargets(b, u, def).length) return 'No one in range';
  if (tpNeedsTile(def) && !tpTiles(b, u, def).length) return def.id === 'shadowGrab' ? 'No smaller enemy within 3' : 'Nowhere to go';
  switch (def.id) {
    case 'wolfForm': return TEMPLATES.wolfLink && roomFor(b, u, 1) ? null : 'Can\'t transform here';
    case 'humanForm': return u.originalForm ? null : 'Already in Hylian form';
    case 'fusedShadowForm':
      if (!Object.values(u.gear).includes('fusedShadow')) return 'Needs the Complete Fused Shadow';
      if (!TEMPLATES.fusedShadowMidna || !roomFor(b, u, 5)) return 'Not enough room (5×5)';
      return u.mp >= 5 ? null : 'Needs at least 5 MP';
    case 'wolfDig': return null;
    case 'wolfHowl': return footprint(u.x, u.y, u.size).some((p) => tilesInRange(b, p, 1, 1).some((q) => tileAt(b, q.x, q.y) === 'howlingStone')) ? null : 'Stand next to a Howling Stone';
    case 'energyField': return b.units.some((a) => a.templateId === 'midnaImp' || a.templateId === 'midnaTrue') || (u.cargo ?? []).some((c) => has(c, 'twilightCompanion')) || u.templateId === 'wolfLinkMidna' ? (foesWithin(b, u, 3).length ? null : 'No enemies within 3') : 'Midna must be on the field';
    case 'zantsFrenzy': return foesWithin(b, u, 1).length ? (u.sta >= 4 + 3 * (u.turnUses?.frenzy ?? 0) ? null : 'Not enough stamina') : 'No adjacent enemies';
    case 'beastCharge': return u.sta >= 6 ? null : 'Not enough stamina';
    case 'greatSpin': return u.hp < u.stats.hp ? 'Only at full HP' : foesWithin(b, u, u.abilities.includes('longerGreatSpin') ? 3 : 2).length ? null : 'No enemies within range';
    case 'mountedSpin': return !isMounted(u) ? 'Only while mounted' : foesWithin(b, u, 1).length ? null : 'No adjacent enemies';
    case 'crimsonLantern': case 'curseWave': case 'hexingScreech': return foesWithin(b, u, 1).length ? null : 'No adjacent enemies';
    case 'fireburst': return foesWithin(b, u, 2).length ? null : 'No enemies within 2';
    case 'lavaDive': return tilesOf(b, u).includes('lava') ? (u.sta >= 3 ? null : 'Not enough stamina') : 'Must be over lava';
    case 'reignite': return u.flameOut ? null : 'Already aflame';
    case 'illusoryExchange': return b.units.some((x) => x.illusionOf === u.uid) ? null : 'No duplicates';
    case 'phantomQuartet': return b.units.filter((x) => x.illusionOf === u.uid).length < 3 ? null : 'Already three duplicates';
    case 'chuDivide': return u.fusedPartner ? null : 'Not merged';
    case 'goldenBlessing': return u.hp > 8 ? null : 'Not enough HP';
    case 'goldenDivision': return u.hp > 15 ? null : 'Not enough HP';
    case 'jellyTransfer': return u.hp > 5 ? null : 'Not enough HP';
    case 'horseCallAbility': return Object.values(u.gear).some((g) => GEAR[g]?.slot === 'mount') && u.mounted === false ? null : 'Nothing to call';
    case 'warHorn': return alliesWithin(b, u, 3).some(isMounted) || isMounted(u) ? null : 'No mounted allies nearby';
    case 'solLight': return null;
  }
  return null;
}

export interface TPOutcome {
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

/** Damage an ability strike would do (physical or magical), like a basic attack. */
function power(u: Unit, e: Unit, magical: boolean, bonus = 0, pct = 1): number {
  const s = effectiveStats(u), d = effectiveStats(e);
  const w = WEAPONS[u.weapons[0]];
  const might = (w?.might ?? 0) + bonus;
  return Math.max(1, Math.floor(((magical ? s.mag : s.str) + might - (magical ? d.res : d.def)) * pct));
}

export function castTwilight(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): TPOutcome | null {
  if (!isTPAbility(def)) return null;
  const out: TPOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [] };
  const s = effectiveStats(u);
  const strike = (e: Unit, dmg: number, status?: StatusKind, chance = 0) => {
    dmg = Math.min(e.hp, Math.max(0, Math.floor(dmg)));
    const saved = dmg >= e.hp ? tpSaveFromDeath(b, e) : null;
    if (saved) { dmg = e.hp - 1; out.lines.push(saved); }
    e.hp -= dmg;
    const killed = e.hp <= 0;
    const statuses: StatusKind[] = [];
    if (!killed && status && rng.chance(chance)) { addStatus(e, status, 1); statuses.push(status); }
    out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses });
    if (dmg > 0) e.lastHitBy = u.uid;
    if (killed) {
      u.kills++;
      tpOnKill(b, u, e, rng);
      b.units = b.units.filter((x) => x !== e);
      if (!e.illusionOf && !e.ephemeral) b.fallen.push(e);
      b.log.push(`${u.name} defeated ${e.name}.`);
    }
  };
  const heal = (a: Unit, amt: number) => {
    amt = Math.min(a.stats.hp - a.hp, Math.ceil(amt));
    if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); }
  };
  const cleanse = (a: Unit) => {
    const before = a.statuses.length;
    a.statuses = a.statuses.filter((x) => ['regen', 'inspired', 'protected', 'haste', 'veiled'].includes(x.kind));
    if (a.statuses.length < before) out.cleansed.push(a.uid);
  };
  const foes = (r: number) => foesWithin(b, u, r);
  switch (def.id) {
    // ── Hidden Skills (area) ──
    case 'jumpStrike': {
      if (!at) return null;
      out.warped = { from: { x: u.x, y: u.y }, to: { ...at } };
      u.x = at.x; u.y = at.y;
      for (const e of foes(1)) strike(e, power(u, e, false, 2));
      if (has(u, 'hiddenPotential')) buff(u, 'hiddenPotential', 'Hidden Potential', 2, { skl: 2 });
      break;
    }
    case 'greatSpin':
      // Longer Great Spin reaches 3; Swiftblade the First's Ultimate Technique hits harder.
      for (const e of foes(u.abilities.includes('longerGreatSpin') ? 3 : 2)) strike(e, power(u, e, false, 4 + (has(u, 'ultimateTechnique') ? 4 : 0)));
      if (has(u, 'hiddenPotential')) buff(u, 'hiddenPotential', 'Hidden Potential', 2, { skl: 2 });
      break;
    case 'mountedSpin':
      for (const e of foes(1)) strike(e, power(u, e, false, 2));
      break;
    // ── Wolf Link ──
    case 'wolfDig': {
      const k = keyOf(b, u.x, u.y);
      if (b.tiles[k] === 'buriedPassage') {
        const exits = b.tiles.map((t, i) => (t === 'buriedPassage' && i !== k ? i : -1)).filter((i) => i >= 0 && !unitAt(b, i % b.width, Math.floor(i / b.width)));
        if (exits.length) {
          const e = rng.pick(exits);
          out.warped = { from: { x: u.x, y: u.y }, to: { x: e % b.width, y: Math.floor(e / b.width) } };
          u.x = e % b.width; u.y = Math.floor(e / b.width);
          out.lines.push(`${u.name} digs through a buried passage!`);
          break;
        }
      }
      const spot = (b.digSpots ?? []).find((d) => d.x === u.x && d.y === u.y);
      if (spot) {
        b.digSpots = (b.digSpots ?? []).filter((d) => d !== spot);
        b.rewardRupees += 30;
        out.lines.push(`${u.name} digs up something buried!`);
      } else if (rng.chance(25)) { b.rewardRupees += 10; out.lines.push(`${u.name} digs up a few Rupees.`); }
      else out.lines.push(`${u.name} digs, but finds nothing.`);
      break;
    }
    case 'wolfSense': {
      const ev: TPEvent[] = [];
      revealAround(b, u, 6, ev);
      out.lines.push(ev.length ? `${u.name} senses ${ev.length} hidden thing${ev.length > 1 ? 's' : ''}.` : `${u.name} sniffs the air. Nothing hidden nearby.`);
      break;
    }
    case 'wolfHowl': {
      const st = tpState(b);
      st.howled = true;
      (st.learn ??= []).push(u.uid);
      out.lines.push('A golden wolf answers the howl. The Hero\'s Shade will be waiting after the battle.');
      break;
    }
    case 'energyField':
      for (const e of foes(3).sort((a, c) => a.hp - c.hp).slice(0, 5)) strike(e, power(u, e, false));
      break;
    case 'wolfForm':
    case 'fusedShadowForm': {
      const before = u.name;
      transformInto(b, u, def.id === 'wolfForm' ? 'wolfLink' : 'fusedShadowMidna');
      u.maskForm = def.id === 'wolfForm' ? 'twilightCrystal' : 'fusedShadow';
      u.maskTurn = b.turn;
      out.transformed = before;
      out.free = hasEffect(u, 'freeTransform') || !!u.originalForm?.weapons && Object.values(u.gear).includes('twilightCrystal');
      out.lines.push(def.id === 'wolfForm' ? `${before} becomes a wolf!` : 'Midna dons the Fused Shadow!');
      break;
    }
    case 'humanForm': {
      if (!u.originalForm) return null;
      const before = u.name;
      const restored = restoreForm(u);
      Object.assign(u, restored);
      delete u.originalForm; delete u.maskForm;
      out.transformed = before;
      out.free = Object.values(u.gear).includes('twilightCrystal');
      break;
    }
    // ── Midna, Zant and the rest ──
    case 'shadowGrab': {
      const v = grabVictim(b, u);
      if (!v || !at) return null;
      v.x = at.x; v.y = at.y;
      strike(v, 6 + Math.floor(s.mag / 2) - Math.floor(effectiveStats(v).def / 2));
      out.lines.push(`${u.name} hurls ${v.name}!`);
      break;
    }
    case 'midnaRide': {
      const beast = target!;
      (beast.cargo ??= []).push(u);
      b.units = b.units.filter((x) => x !== u);
      buff(beast, 'midnaRiding', 'Midna riding', 99, {});
      out.lines.push(`${u.name} climbs onto ${beast.name}'s back.`);
      out.free = true;
      break;
    }
    case 'midnaDismount': {
      const midna = u.cargo?.find((c) => has(c, 'twilightCompanion'));
      if (!midna || !at) return null;
      u.cargo = u.cargo!.filter((c) => c !== midna);
      u.buffs = u.buffs.filter((x) => x.id !== 'midnaRiding');
      Object.assign(midna, { x: at.x, y: at.y, moved: true, acted: false });
      b.units.push(midna);
      out.free = true;
      break;
    }
    case 'zantsWarp':
      if (!at) return null;
      out.warped = { from: { x: u.x, y: u.y }, to: { ...at } };
      u.x = at.x; u.y = at.y;
      out.free = true;
      break;
    case 'zantsFrenzy': {
      const n = u.turnUses?.frenzy ?? 0;
      u.sta -= 4 + 3 * n;
      (u.turnUses ??= {}).frenzy = n + 1;
      for (const e of foes(1)) strike(e, power(u, e, false));
      break;
    }
    case 'beastCharge': {
      u.sta -= 6;
      const target0 = foes(6).sort((a, c) => unitDist(u, a) - unitDist(u, c))[0];
      if (!target0) { out.lines.push('Nothing to charge at.'); break; }
      const dx = Math.sign(target0.x - u.x), dy = dx === 0 ? Math.sign(target0.y - u.y) : 0;
      const from = { x: u.x, y: u.y };
      for (let i = 0; i < 4; i++) {
        const nx = u.x + dx, ny = u.y + dy;
        if (!inBounds(b, nx, ny) || anchorCost(b, u, nx, ny) >= INF) break;
        const inWay = b.units.filter((e) => e !== u && footprint(nx, ny, u.size).some((p) => footprint(e.x, e.y, e.size).some((q) => q.x === p.x && q.y === p.y)));
        if (inWay.some((e) => e.team === u.team || e.size >= u.size)) break;
        for (const e of inWay) { strike(e, power(u, e, false, 2)); if (e.hp > 0) pushAway(b, e, u, 1); }
        if (inWay.some((e) => e.hp > 0 && footprint(nx, ny, u.size).some((p) => footprint(e.x, e.y, e.size).some((q) => q.x === p.x && q.y === p.y)))) break;
        u.x = nx; u.y = ny;
      }
      out.warped = { from, to: { x: u.x, y: u.y } };
      break;
    }
    case 'sumoThrow': {
      const t = target!;
      u.sta = Math.max(0, u.sta - 4);
      pushAway(b, t, u, 2);
      if (t.team !== u.team) strike(t, Math.floor(s.str / 2));
      out.lines.push(`${u.name} shoves ${t.name} out of the ring!`);
      break;
    }
    case 'ancientEscapeAbility': {
      if (!at) return null;
      const ally = alliesWithin(b, u, 1)[0];
      out.warped = { from: { x: u.x, y: u.y }, to: { ...at } };
      u.x = at.x; u.y = at.y;
      if (ally) { const p = nearFree(b, ally, u, 2); if (p) { ally.x = p.x; ally.y = p.y; } }
      (u.usedAbilities ??= []).push(def.id);
      break;
    }
    case 'lakesMercy':
      for (const a of [u, ...alliesWithin(b, u, 3)]) heal(a, a.stats.hp * 0.3);
      purify(b, u, 2, u.size);
      break;
    case 'warHorn':
      for (const a of [u, ...alliesWithin(b, u, 3)]) if (isMounted(a) || a === u) { buff(a, 'warHorn', 'War Horn', 2, { str: 2, mov: 2 }); out.buffed.push(a.uid); }
      (u.usedAbilities ??= []).push(def.id);
      break;
    case 'horseCallAbility':
      u.mounted = true;
      out.lines.push(`${u.name}'s mount gallops in.`);
      out.free = true;
      break;
    case 'solLight':
      purify(b, u, 4, u.size);
      for (const e of foes(4)) if (unitTags(e).includes('twilight') || unitTags(e).includes('shadow')) strike(e, 10);
      break;
    // ── Poe Sisters ──
    case 'crimsonLantern':
      for (const e of foes(1)) strike(e, Math.floor(s.mag / 2) + 4 - Math.floor(effectiveStats(e).res / 2), 'burn', 50);
      break;
    case 'paintingRefuge':
      addStatus(u, 'veiled', 1);
      out.statuses.push({ uid: u.uid, kind: 'veiled' });
      break;
    case 'coldEmbrace': {
      const t = target!;
      if (rng.int(0, 30) > effectiveStats(t).res) { addStatus(t, 'freeze', 1); out.statuses.push({ uid: t.uid, kind: 'freeze' }); out.lines.push(`${t.name} is frozen solid!`); }
      else out.lines.push(`${t.name} shakes off the cold.`);
      break;
    }
    case 'spectralBarrier': buff(target!, 'spectralBarrier', 'Spectral Barrier', 99, { def: 15 }); out.buffed.push(target!.uid); break;
    case 'hauntingCurse': buff(target!, 'haunted', 'Haunting Curse', 2, { str: -3, mag: -3 }); out.buffed.push(target!.uid); break;
    case 'spiritDrain': { const d = Math.min(8, target!.mp); target!.mp -= d; u.mp = Math.min(u.stats.mp, u.mp + d); out.lines.push(`${u.name} drains ${d} MP from ${target!.name}.`); break; }
    case 'phantomQuartet': {
      let n = 0;
      while (spawnIllusion(b, u)) n++;
      out.lines.push(n ? `${u.name} splits into ${n + 1} identical Poes!` : 'No room for illusions.');
      break;
    }
    case 'illusoryExchange': {
      const ill = b.units.find((x) => x.illusionOf === u.uid)!;
      const p = { x: u.x, y: u.y };
      u.x = ill.x; u.y = ill.y; ill.x = p.x; ill.y = p.y;
      out.warped = { from: p, to: { x: u.x, y: u.y } };
      out.free = true;
      break;
    }
    case 'phantomAssault': {
      const t = target!;
      const n = b.units.filter((x) => x.illusionOf === u.uid).length;
      for (let i = 0; i < n && t.hp > 0; i++) strike(t, power(u, t, true, 0, 0.3));
      if (!n) out.lines.push('No duplicates to attack with.');
      break;
    }
    // ── ChuChus ──
    case 'chuFusion': {
      const other = target!;
      // The Spirit Tracks ChuChus have their own fusion rules (engine/spirit.ts spChuFusion).
      const into = spChuFusion(u, other);
      const mixed = into ? into === 'purpleChuchu' : other.templateId !== u.templateId && !['darkChuchu', 'rareChuchu'].includes(other.templateId ?? '');
      const n = 1 + (u.turnUses?.fused ?? 0);
      const total = u.hp + other.hp;
      transformInto(b, u, into ?? (mixed && TEMPLATES.purpleChuchu ? 'purpleChuchu' : (u.templateId ?? 'chuchuRed')), other);
      (u.turnUses ??= {}).fused = n;
      const size = Math.min(5, n + 1);
      const grow = 1 + 0.5 * n;
      u.stats = { ...u.stats, hp: Math.ceil(u.stats.hp * grow), str: u.stats.str + 3 * n };
      u.hp = Math.min(u.stats.hp, total);
      if (roomFor(b, u, size)) u.size = u.baseSize = size;
      out.transformed = `${u.name} (merged)`;
      out.lines.push(mixed ? 'The colours swirl together into a Purple ChuChu!' : 'The ChuChus merge into a bigger blob!');
      break;
    }
    case 'chuDivide': {
      const partner = u.fusedPartner!;
      const ratio = u.hp / u.stats.hp;
      const back = restoreForm(u);
      Object.assign(u, back, { size: 1, baseSize: 1 });
      delete u.originalForm; delete u.fusedPartner;
      if (u.turnUses) u.turnUses.fused = 0;
      const p = nearFree(b, partner, u, 2);
      if (p) { Object.assign(partner, { x: p.x, y: p.y, hp: Math.max(1, Math.ceil(partner.stats.hp * ratio)), moved: true, acted: true }); b.units.push(partner); }
      out.lines.push('The ChuChu splits back apart.');
      break;
    }
    case 'jellyTransfer': {
      u.hp -= 5;
      const t = target!;
      if (rng.chance(50)) heal(t, 10); else strike(t, 10);
      break;
    }
    case 'goldenBlessing': {
      u.hp -= 8;
      heal(target!, target!.stats.hp);
      buff(target!, 'rareJelly', 'Golden Blessing', 3, {});
      out.buffed.push(target!.uid);
      break;
    }
    case 'radiantJelly': for (const a of alliesWithin(b, u, 1)) heal(a, 10); break;
    case 'purifyingBody': for (const a of [u, ...alliesWithin(b, u, 1)]) cleanse(a); break;
    case 'goldenDivision': {
      u.hp -= 15;
      const t = TEMPLATES.rareChuchu;
      if (!t) break;
      const bud: Unit = { ...u, uid: `${u.uid}-bud${b.uidCounter++}`, stats: { ...u.stats, hp: Math.ceil(u.stats.hp * 0.25) }, hp: Math.ceil(u.stats.hp * 0.25), ephemeral: true, summoned: true,
        pack: [], gear: {}, buffs: [], statuses: [], abilities: [], moved: true, acted: true, kills: 0 };
      const p = nearFree(b, bud, u, 2);
      if (p) { bud.x = p.x; bud.y = p.y; b.units.push(bud); out.lines.push('A little golden ChuChu buds off.'); }
      (u.usedAbilities ??= []).push(def.id);
      break;
    }
    // ── Bubbles ──
    case 'reignite': u.flameOut = 0; out.lines.push(`${u.name}'s flames roar back.`); break;
    case 'lavaDive': u.sta -= 3; addStatus(u, 'veiled', 1); u.hidden = true; out.lines.push(`${u.name} sinks into the lava.`); break;
    case 'fireburst': for (const e of foes(2)) strike(e, Math.floor(s.mag / 2) + 5 - Math.floor(effectiveStats(e).res / 2), 'burn', 40); break;
    case 'curseWave': for (const e of foes(1)) if (!curseImmune(b, e)) { addStatus(e, 'weaponCurse', 2); out.statuses.push({ uid: e.uid, kind: 'weaponCurse' }); } break;
    case 'azureBarrier': buff(u, 'azureBarrier', 'Azure Barrier', 1, {}); out.buffed.push(u.uid); break;
    case 'flameToggle': u.ignited = !u.ignited; buff(u, 'pulse', u.ignited ? 'Ignited' : 'Extinguished', 1, u.ignited ? { def: 5, res: 5 } : { mov: 3 }); out.free = true; break;
    case 'curseTransfer': {
      const src = target!;
      const turns = src.statuses.find((x) => x.kind === 'weaponCurse')?.turns ?? 2;
      const next = b.units.find((e) => e.team === src.team && e !== src && unitDist(e, src) <= 3 && !hasStatus(e, 'weaponCurse') && !curseImmune(b, e));
      if (next) { addStatus(next, 'weaponCurse', turns); out.statuses.push({ uid: next.uid, kind: 'weaponCurse' }); } else out.lines.push('No one nearby to curse.');
      break;
    }
    case 'hexingScreech': for (const e of foes(1)) { buff(e, 'hex', 'Hexing Screech', 2, { skl: -3, lck: -3 }); out.buffed.push(e.uid); } break;
    case 'dormantSkull': addStatus(u, 'veiled', 2); u.hidden = true; break;
    // ── Queen of Fairies ──
    case 'fairyQueensBlessing': heal(target!, target!.stats.hp); cleanse(target!); break;
    case 'elementalGift': {
      const t = target!;
      for (const id of ['fireArrow', 'iceArrow']) if (ABILITIES[id] && !t.abilities.includes(id)) t.abilities.push(id);
      buff(t, 'elementalGift', 'Elemental Gift', 3, {});
      out.buffed.push(t.uid);
      break;
    }
    case 'royalRestoration':
      for (const a of b.units.filter((x) => x.team === u.team)) { heal(a, a.stats.hp * 0.3); a.mp = Math.min(a.stats.mp, a.mp + Math.ceil(a.stats.mp * 0.3)); }
      break;
    case 'fairySummoning': {
      const n = 2 + (hasEffect(u, 'extraFairy') ? 1 : 0);
      const fairy = TEMPLATES.navi ? 'navi' : null;
      let made = 0;
      for (let i = 0; i < n && fairy; i++) {
        const f: Unit = { ...u, uid: `${u.uid}-fairy${b.uidCounter++}`, name: 'Fairy', title: 'Summoned Fairy', templateId: undefined, artId: 'navi', stats: { ...u.stats, hp: 8, str: 0, mag: 4 },
          hp: 8, ephemeral: true, summoned: true, weapons: ['healStaff'], abilities: [], skills: [], pack: [], gear: {}, buffs: [], statuses: [], moved: true, acted: true, kills: 0 };
        const p = nearFree(b, f, u, 2);
        if (p) { f.x = p.x; f.y = p.y; b.units.push(f); made++; }
      }
      out.lines.push(`${made} fairies flutter out.`);
      break;
    }
    case 'divineProtection': buff(target!, 'divineProtection', 'Divine Protection', 99, {}); out.buffed.push(target!.uid); break;
    case 'fairyAscension': buff(target!, 'ascension', 'Fairy Ascension', 3, { mag: 8, res: 8 }); out.buffed.push(target!.uid); break;
    default:
      return null;
  }
  return out;
}


/** Twilight Princess's own items, resolved by id. Returns a log line, or null if not a TP item. */
export function useTwilightItem(b: Battle, u: Unit, id: string, rng: RNG, target?: Unit, at?: Pos): string | null {
  switch (id) {
    case 'purpleChuJelly': {
      const r = rng.int(0, 9);
      if (r === 0) { u.hp = 1; return `${u.name} feels terrible (1 HP).`; }
      if (r <= 5) { const h = Math.min(15, u.stats.hp - u.hp); u.hp += h; return `${u.name} recovers ${h} HP.`; }
      u.hp = Math.max(1, u.hp - 10);
      return `${u.name} feels queasy (−10 HP).`;
    }
    case 'rareChuJelly': u.hp = u.stats.hp; buff(u, 'rareJelly', 'Rare Chu Jelly', 3, {}); return `${u.name} glows gold.`;
    case 'nastySoup': { const d = rng.int(-5, 5); u.hp = Math.max(1, Math.min(u.stats.hp, u.hp + d)); return d >= 0 ? `Not bad (+${d} HP).` : `Ugh (${d} HP).`; }
    case 'superbSoup': u.hp = Math.min(u.stats.hp, u.hp + 40); u.sta = Math.min(u.stats.sta, u.sta + 10); return `${u.name} feels wonderful.`;
    case 'greatFairysTears': u.hp = u.stats.hp; buff(u, 'fairyTears', "Great Fairy's Tears", 3, {}); return `${u.name} is filled with power.`;
    case 'lanternOil': (u.turnUses ??= {}).oilTurns = 3; return `${u.name} refills the lantern.`;
    case 'worm': return 'You bait a hook. Nothing bites.';
    case 'sol': {
      purify(b, u, 4, u.size);
      for (const e of b.units.filter((x) => x.team !== u.team && unitDist(u, x) <= 4 && (unitTags(x).includes('twilight') || unitTags(x).includes('shadow')))) e.hp = Math.max(1, e.hp - 10);
      const i = u.weapons.indexOf('masterSword');
      if (i >= 0 && WEAPONS.lightSword) { u.weapons[i] = 'lightSword'; return 'Sol\'s light floods the Master Sword: it becomes the Light Sword!'; }
      return 'Sol\'s light burns the Twilight away.';
    }
    case 'bombArrows': {
      if (!u.weapons.some((w) => WEAPONS[w]?.type === 'bow') || !at) return 'Needs a bow.';
      for (const e of b.units.filter((x) => x.team !== u.team && footDist(at.x, at.y, 1, x.x, x.y, x.size) <= 1)) e.hp = Math.max(e === target ? 0 : 1, e.hp - 12);
      return 'Boom!';
    }
    case 'babaSerpentSeed': {
      if (!at || !ENEMIES.babaSerpent) return null;
      const s = makeEnemy(ENEMIES.babaSerpent, b.world, Math.max(1, b.enemyLevel - 1), `p${b.uidCounter++}`, rng);
      Object.assign(s, { team: u.team, x: at.x, y: at.y, moved: true, acted: true, summoned: true });
      if (!free(b, s, at.x, at.y)) return 'No room.';
      b.units.push(s);
      return 'A Baba Serpent sprouts!';
    }
    case 'shadowBeastFragment': {
      const st = tpState(b);
      const d = st.dormant.find((x) => x.unit.team === u.team) ?? { unit: b.fallen.find((f) => f.team === u.team && has(f, 'twilightRevival')), turns: 0 };
      if (!d.unit) return 'No fallen Shadow Beast.';
      const p = nearFree(b, d.unit, u, 3);
      if (!p) return 'No room.';
      Object.assign(d.unit, { x: p.x, y: p.y, hp: Math.ceil(d.unit.stats.hp * 0.25), moved: true, acted: true });
      b.units.push(d.unit);
      b.fallen = b.fallen.filter((f) => f !== d.unit);
      st.dormant = st.dormant.filter((x) => x !== d);
      return `${d.unit.name} rises from the shadows.`;
    }
    case 'ghoulRatEssence': if (target) { buff(target, 'burden', 'Spectral Burden', 3, { mov: -Math.ceil(effectiveStats(target).mov / 2) }); return `${target.name} is weighed down.`; } return null;
    case 'chilfosIceShard': if (!u.weapons.includes('chilfosIceSpear')) { u.weapons.push('chilfosIceSpear'); return 'An ice spear forms in your hands.'; } return 'You already have one.';
    case 'fyrusChainFragment': if (target) { addStatus(target, 'root', 1); return `${target.name} is chained in place.`; } return null;
    case 'morpheelTentacle': if (target) { pullToward(b, target, u, 3); return `${target.name} is dragged closer.`; } return null;
    case 'blizzetaIceMirror': buff(u, 'iceMirror', 'Ice Mirror', 99, {}); return 'An ice mirror shimmers before you.';
    case 'argorokScale': buff(u, 'argorokScale', 'Argorok Scale', 99, {}); u.layers = (u.layers ?? 0) + 1; return 'The scale hardens over you.';
    case 'twilightFogCapsule': if (at) { for (const p of [at, ...tilesInRange(b, at, 1, 1)]) setTimed(b, p.x, p.y, 'twilightFog', 3); return 'Twilight fog billows out.'; } return null;
    case 'volcanicFlameEssence': buff(u, 'volcanic', 'Volcanic Flame', 3, {}); return 'You feel fireproof.';
    case 'spectralFlameEssence': buff(u, 'spectralStep', 'Spectral Step', 1, {}); return 'You feel weightless.';
    case 'bubbleBoneFragment': b.rewardRupees += 30; return 'You trade the fragment for ₹30.';
  }
  return null;
}

/** Items above that take a target tile. */
export const TP_TARGETED_ITEMS = new Set(['bombArrows', 'babaSerpentSeed', 'ghoulRatEssence', 'fyrusChainFragment', 'morpheelTentacle', 'twilightFogCapsule']);
export { TWILIT_PROVINCES };
