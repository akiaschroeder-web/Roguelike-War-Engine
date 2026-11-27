// Zelda II: The Adventure of Link battle rules (an expansion of the Original Hyrule pack).
// Spells and sword techniques, the Sleeping Princess, the palace monsters' traits, the
// guardians' mechanics (Horsehead's armor, Helmethead's helmets, Rebonack dismounting,
// Carock's intangibility, Gooma's momentum, Thunderbird's Sealed Face), Link's Shadow in
// the Great Palace, the pack items and the palace spaces (collapsing floors, falling
// blocks and boulders, elevators, narrow passages, the River Devil).
// Every hook is called from engine/original.ts (and through it from battle.ts, combat.ts,
// grid.ts, items.ts, status.ts and abilities.ts), so the wiring stays in one place.
// The guardians' attacks themselves are data-driven abilities (engine/wild.ts castWild).

import { BOSSES, ENEMIES, GEAR, WEAPONS } from '../data/registry';
import { GREAT_PALACE, GREAT_PALACE_SHADOW, Z2_SPELLS } from '../content/original';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF, isMagical } from './rules';
import { restoreForm, transformInto } from './transform';
import { effectiveStats, hasEffect, makeEnemy, moveTypeOf } from './units';
import type { AbilityDef, Battle, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Zelda II battle state. */
    aol?: { crumbling: number[] };
  }
  interface Unit {
    /** Gooma's Crushing Momentum: the target and how many blows in a row. */
    aolMomentum?: { uid: string; n: number };
  }
}

const has = (u: Unit, s: string) => u.skills.includes(s);
const hasBuff = (u: Unit, id: string) => !!u.buffs?.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const tilesOf = (b: Battle, u: Unit) => footprint(u.x, u.y, u.size).map((p) => tileAt(b, p.x, p.y));
const GOOD = new Set<StatusKind>(['regen', 'inspired', 'protected', 'haste', 'veiled']);
const bad = (u: Unit) => u.statuses.filter((s) => !GOOD.has(s.kind)).length;
const HIGH = new Set<Terrain>(['mountain', 'fort', 'elevator']);
const onHigh = (b: Battle, u: Unit) => tilesOf(b, u).some((t) => !!t && HIGH.has(t));
const flying = (u: Unit) => moveTypeOf(u) === 'flying';
const uses = (u: Unit) => (u.turnUses ??= {});
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
export const aolState = (b: Battle) => (b.aol ??= { crumbling: [] });

function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}
const free = (b: Battle, u: Unit, x: number, y: number, ignore?: Unit) =>
  inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u || o === ignore; });
function nearFree(b: Battle, who: Unit, by: Pos & { size: number }, r = 2, ignore?: Unit): Pos | null {
  if (ignore && free(b, who, by.x, by.y, ignore)) return { x: by.x, y: by.y };
  for (let d = 1; d <= r; d++) for (const p of tilesInRange(b, by, d, d, by.size)) if (free(b, who, p.x, p.y, ignore)) return p;
  return null;
}

/** A temporary unit (Floating Helmets) on `team`'s side. */
function spawn(b: Battle, id: string, near: Pos & { size: number }, team: Unit['team'], level: number): Unit | null {
  const a = ENEMIES[id];
  if (!a) return null;
  const rng = new RNG(b.rngState);
  const e = makeEnemy(a, b.world, Math.max(1, level), `aol${b.uidCounter++}`, rng);
  b.rngState = rng.state;
  const spot = nearFree(b, e, near, 3);
  if (!spot) return null;
  Object.assign(e, { x: spot.x, y: spot.y, team, summoned: true, moved: true, acted: true, ai: 'aggressive' });
  if (team === 'player') e.npc = true;
  b.units.push(e);
  return e;
}

/** A jumping attack: the Jump spell, a Fokka Feather, the Downward Thrust, the leaping monsters. */
export function isJumping(atk: Unit, arrow?: AbilityDef, w?: WeaponDef): boolean {
  return arrow?.id === 'downwardThrust' || hasBuff(atk, 'spellJump') || hasBuff(atk, 'fokkaFeather') || has(atk, 'suddenLeap') || has(atk, 'bouncingAssault')
    || (has(atk, 'leapingSwordsmanship') && w?.type === 'sword') || (w?.id === 'fokkaSword' && (atk.movedDist ?? 0) >= 1);
}
const flanked = (b: Battle, u: Unit) => foesOf(b, u).filter((e) => unitDist(e, u) <= 1).length >= 2;

// ───────────────────────── Movement ─────────────────────────

/** Units that leap over others (move through enemies). */
export function aolLeaps(u: Unit): boolean {
  return has(u, 'suddenLeap') || hasBuff(u, 'spellJump') || hasBuff(u, 'fokkaFeather');
}

export function aolTileCost(_b: Battle, u: Unit, t: Terrain, c: number): number {
  switch (t) {
    case 'narrowPassage': if (hasBuff(u, 'spellFairy') || (u.size === 1 && effectiveStats(u).con <= 10)) c = 1; break;
    case 'ladderGap': if (hasBuff(u, 'spellJump') || hasBuff(u, 'fokkaFeather')) c = 1; break;
    case 'water': if (hasEffect(u, 'waterWalk') || has(u, 'leapingBones')) c = 1; break;
    case 'lava': if (has(u, 'leapingBones') || has(u, 'fireSpit')) c = 1; break;
  }
  return c;
}

// ───────────────────────── Combat ─────────────────────────

export interface AolMods { def: number; hit: number; dmg: number }

export function aolMods(b: Battle, u: Unit, foe: Unit, initiating: boolean, w?: WeaponDef): AolMods {
  const m: AolMods = { def: 0, hit: 0, dmg: 0 };
  if (has(u, 'reptilianGuard') && !initiating && (u.movedDist ?? 0) === 0) m.def += 4;
  if (has(u, 'bouncingAssault') && initiating && (u.movedDist ?? 0) >= 1) m.dmg += 3;
  if (w?.type === 'sword' && hasBuff(u, 'spellFire')) m.dmg += 3;
  if (w?.type === 'sword' && hasBuff(u, 'thunderbirdFlame')) m.dmg += 4;
  if (hasEffect(u, 'aerialAim') && (flying(foe) || isJumping(foe))) m.hit += 15;
  // Deelers and Geldarms dropping out of hiding hit hard once.
  if (initiating && hasBuff(u, 'ambush')) m.dmg += 4;
  void b;
  return m;
}

/** Damage multipliers: Shield, Reflect, the guardians' defenses, dives and thrusts. */
export function aolMultiplier(b: Battle, atk: Unit, def: Unit, magical: boolean, w: WeaponDef | undefined, dist: number, arrow?: AbilityDef): number {
  let mult = 1;
  if (hasBuff(def, 'spellShield')) mult *= 0.5;
  if (magical && dist > 1 && hasBuff(def, 'spellReflect')) return 0;
  const jumping = isJumping(atk, arrow, w);
  if (!magical && has(def, 'armoredBody') && !jumping && !flying(atk) && !flanked(b, def)) mult *= 0.5;
  if (!magical && dist <= 1 && hasEffect(def, 'frontalArmor') && !jumping && !flanked(b, def)) mult *= 0.85;
  if (!magical && has(def, 'magicalIntangibility')) mult *= 0.1;
  if (has(def, 'sealedFace') && !hasBuff(def, 'thunderExposed')) mult *= 0.25;
  if (w?.element === 'lightning' && hasEffect(def, 'lightningVulnerable')) mult *= 1.5;
  if (has(atk, 'diveAttack') && (onHigh(b, atk) || (flying(atk) && !flying(def) && (atk.movedDist ?? 0) >= 2))) mult *= 1.5;
  if (arrow?.id === 'upwardThrust' && (flying(def) || onHigh(b, def))) mult *= 1.5;
  return mult;
}

/** DEF the attack ignores: Iron Flail, Crushing Momentum, shield-bypassing jumps, Horsehead's Mace. */
export function aolDefense(atk: Unit, def: Unit, w: WeaponDef | undefined, arrow: AbilityDef | undefined, defense: number, magical: boolean): number {
  if (magical) return defense;
  const shieldDef = def.gear?.shield ? GEAR[def.gear.shield]?.stats?.def ?? 0 : 0;
  if (arrow?.id === 'downwardThrust') defense -= Math.floor(shieldDef / 2);
  else if (w?.id === 'horseheadsMace' || (w?.type === 'sword' && (has(atk, 'leapingSwordsmanship') || (w.id === 'fokkaSword' && (atk.movedDist ?? 0) >= 1)))) defense -= shieldDef;
  if (has(atk, 'ironFlail')) defense *= 0.75;
  if (has(atk, 'crushingMomentum') && atk.aolMomentum?.uid === def.uid) defense *= 1 - Math.min(0.5, 0.125 * atk.aolMomentum.n);
  return Math.max(0, Math.floor(defense));
}

/** Attacks that can't be blocked. */
export function aolNoBlock(atk: Unit, w: WeaponDef | undefined, arrow?: AbilityDef): boolean {
  return arrow?.id === 'downwardThrust' || w?.id === 'horseheadsMace' || (w?.type === 'sword' && (has(atk, 'leapingSwordsmanship') || (w.id === 'fokkaSword' && (atk.movedDist ?? 0) >= 1)));
}

/** Axe Throw and the Fire spell reach further. */
export function aolRangeBonus(u: Unit, w: WeaponDef): number {
  let r = 0;
  if (w.type === 'axe' && has(u, 'axeThrow')) r += 1;
  if (w.type === 'sword' && hasBuff(u, 'spellFire')) r += 1;
  return r;
}

/** Returning Hammer: thrown hammers strike again on the way back. */
export function aolExtraAttack(atk: Unit, w: WeaponDef, initiating: boolean): boolean {
  return initiating && w.type === 'hammer' && w.maxRange >= 2 && !w.brave && (has(atk, 'returningHammer') || w.id === 'doomknockerHammer');
}

/** A fairy can't fight. */
export function aolCannotAttack(u: Unit): boolean {
  return hasBuff(u, 'spellFairy');
}

/** The Link Doll: the next fatal blow is stopped and the carrier recovers 25% HP. */
export function aolSaveFromDeath(target: Unit): { line: string; heal: number } | null {
  const i = target.pack?.findIndex((p) => p.id === 'linkDoll') ?? -1;
  if (!hasBuff(target, 'linkDoll') && i < 0) return null;
  if (hasBuff(target, 'linkDoll')) target.buffs = target.buffs.filter((x) => x.id !== 'linkDoll');
  else if (--target.pack[i].uses <= 0) target.pack.splice(i, 1);
  return { line: `The Link Doll crumbles: ${target.name} is spared!`, heal: Math.ceil(target.stats.hp * 0.25) };
}

/** After a damaging hit: Mind Drain, Crushing Momentum. */
export function aolAfterHit(by: Unit, target: Unit, dmg: number): string[] {
  const lines: string[] = [];
  if (has(by, 'mindDrain') && dmg > 0 && unitDist(by, target) <= 1 && target.mp > 0) {
    const d = Math.min(3, target.mp);
    target.mp -= d;
    by.mp = Math.min(by.stats.mp, by.mp + d);
    lines.push(`${by.name} drains ${d} MP from ${target.name}.`);
  }
  if (has(by, 'crushingMomentum')) by.aolMomentum = by.aolMomentum?.uid === target.uid ? { uid: target.uid, n: by.aolMomentum.n + 1 } : { uid: target.uid, n: 1 };
  return lines;
}

/** HP thresholds: Helmethead's helmets break off, Rebonack dismounts. */
export function aolThresholds(b: Battle, u: Unit): string[] {
  const lines: string[] = [];
  if (u.hp <= 0) return lines;
  const ratio = u.hp / u.stats.hp;
  if (has(u, 'detachedHelmets')) {
    const shed = uses(u).aolHelmets ?? 0;
    const due = (ratio <= 0.75 ? 1 : 0) + (ratio <= 0.5 ? 1 : 0);
    for (let i = shed; i < due; i++) {
      const h = spawn(b, 'floatingHelmet', u, u.team, u.level - 2);
      uses(u).aolHelmets = i + 1;
      if (h) lines.push(`One of ${u.name}'s helmets breaks off and floats away — it starts shooting on its own!`);
    }
  }
  if (has(u, 'unyieldingKnight') && ratio < 0.4 && !hasBuff(u, 'dismounted')) {
    if (u.size > 1) u.size = 1;
    buff(u, 'dismounted', 'Dismounted', 99, { spd: 4, skl: 4 });
    lines.push(`${u.name} is thrown from his horse — and gets up faster than before! (+4 SPD, +4 SKL)`);
  }
  b.log.push(...lines);
  return lines;
}

export interface AolStrike { uid: string; dmg: number; hp: number; killed: boolean; by: string }

/** After a combat: spikes, reflected magic, the Downward Thrust's bounce, Mago's teleport, thresholds. */
export function aolAfterCombat(b: Battle, attacker: Unit, defender: Unit, arrowId: string | null, landed: { atk: number; def: number }): AolStrike[] {
  const out: AolStrike[] = [];
  const hit = (me: Unit, foe: Unit, d: number) => {
    if (foe.hp <= 1 || d <= 0) return;
    d = Math.min(foe.hp - 1, Math.floor(d));
    foe.hp -= d;
    out.push({ uid: foe.uid, dmg: d, hp: foe.hp, killed: false, by: me.uid });
  };
  const aw = WEAPONS[attacker.weapons[0]];
  const dw = WEAPONS[defender.weapons[0]];
  const contact = (w: WeaponDef | undefined) => !!w && !isMagical(w.type) && !w.magicContact;
  const close = unitDist(attacker, defender) <= 1;
  // Myu's Spiked Body and the Myu Spike.
  if (close && landed.atk > 0 && contact(aw)) {
    if (has(defender, 'spikedBody')) hit(defender, attacker, Math.ceil(landed.atk * 0.25));
    if (hasBuff(defender, 'myuSpike')) hit(defender, attacker, 4);
  }
  if (close && landed.def > 0 && contact(dw)) {
    if (has(attacker, 'spikedBody')) hit(attacker, defender, Math.ceil(landed.def * 0.25));
    if (hasBuff(attacker, 'myuSpike')) hit(attacker, defender, 4);
  }
  // Reflect: magic projectiles bounce back (double on Carock).
  if (!close && hasBuff(defender, 'spellReflect') && aw && (isMagical(aw.type) || aw.magicContact) && attacker.hp > 0) {
    const s = effectiveStats(attacker);
    const d = Math.max(1, s.mag + aw.might - s.res) * (has(attacker, 'magicalIntangibility') ? 2 : 1);
    hit(defender, attacker, d);
    b.log.push(`${defender.name} reflects the magic back at ${attacker.name}!`);
  }
  // Downward Thrust: bounce onto another enemy next to the target.
  if (arrowId === 'downwardThrust' && landed.atk > 0 && attacker.hp > 0) {
    const next = b.units.find((e) => e.team === defender.team && e !== defender && unitDist(e, defender) <= 1 && unitDist(e, attacker) <= 2);
    if (next) { hit(attacker, next, Math.max(1, Math.floor(landed.atk / 2))); b.log.push(`${attacker.name} bounces off ${defender.name} onto ${next.name}!`); }
  }
  // Mago: Magical Relocation after casting.
  if (has(attacker, 'magicalRelocation') && attacker.hp > 0 && aw && (isMagical(aw.type) || aw.magicContact) && defender.hp > 0) {
    const spots = tilesInRange(b, attacker, 1, 4, attacker.size).filter((p) => free(b, attacker, p.x, p.y))
      .sort((p, q) => footDist(q.x, q.y, attacker.size, defender.x, defender.y, defender.size) - footDist(p.x, p.y, attacker.size, defender.x, defender.y, defender.size));
    if (spots[0]) { attacker.x = spots[0].x; attacker.y = spots[0].y; b.log.push(`${attacker.name} teleports away.`); }
  }
  for (const u of [attacker, defender]) aolThresholds(b, u);
  return out;
}

/** On a kill: when Thunderbird falls in the Great Palace, Link's Shadow stands up. */
export function aolOnKill(b: Battle, victim: Unit) {
  if (victim.bossId !== 'thunderbird' || b.world !== GREAT_PALACE || victim.team !== 'enemy' || !victim.isBoss || b.objective.type !== 'boss') return;
  const def = BOSSES[GREAT_PALACE_SHADOW];
  if (!def) return;
  const rng = new RNG(b.rngState);
  const shadow = makeEnemy(def, b.world, b.enemyLevel + 2, `aol${b.uidCounter++}`, rng, { boss: true });
  b.rngState = rng.state;
  const spot = nearFree(b, shadow, victim, 4, victim);
  if (!spot) return;
  victim.isBoss = false;
  Object.assign(shadow, { x: spot.x, y: spot.y, name: "Link's Shadow", ai: 'aggressive', moved: true, acted: true });
  b.units.push(shadow);
  b.log.push('Thunderbird falls — and your own shadow peels away from the floor. Link\'s Shadow draws its sword!');
}

// ───────────────────────── Turns ─────────────────────────

export interface AolEvent { uid: string; heal: number; damage: number; source: string }

/** Once per round (start of the player phase): falling blocks and boulders, crumbling floors. */
export function aolRound(b: Battle): string[] {
  const lines: string[] = [];
  const st = aolState(b);
  // Crumbled floors fall away once no one is standing on them.
  st.crumbling = st.crumbling.filter((k) => {
    if (b.tiles[k] !== 'collapsingFloor') return false;
    if (unitAt(b, k % b.width, Math.floor(k / b.width))) return true;
    b.tiles[k] = 'ladderGap';
    lines.push('A collapsing floor gives way into a pit.');
    return false;
  });
  const drop = (t: Terrain, dmg: number, what: string) => {
    for (const u of b.units) {
      if (!tilesOf(b, u).includes(t) || flying(u)) continue;
      const d = Math.min(u.hp - 1, dmg);
      if (d > 0) { u.hp -= d; lines.push(`${what} ${u.name} (−${d}).`); }
    }
  };
  if (b.turn % 2 === 0) drop('fallingBlock', 8, 'A falling block crashes down on');
  if (b.turn % 2 === 1 && b.turn > 1) drop('fallingBoulderZone', 6, 'Falling boulders hit');
  b.log.push(...lines);
  return lines;
}

export function aolStartPhase(b: Battle, u: Unit, events: AolEvent[]) {
  const foes = foesOf(b, u);
  // Spell: the transformation into a Bot wears off.
  const until = u.turnUses?.aolBotUntil;
  if (until !== undefined && b.turn >= until && u.originalForm) {
    Object.assign(u, restoreForm(u));
    delete u.originalForm;
    delete u.turnUses!.aolBotUntil;
    events.push({ uid: u.uid, heal: 0, damage: 0, source: 'is no longer a Bot' });
  }
  // Deelers climb back into the trees; Geldarms burrow again.
  if (u.team === 'enemy' && !u.hidden) {
    const near = foes.some((e) => unitDist(e, u) <= 1);
    if (has(u, 'suspendedAmbush') && !near && tilesInRange(b, u, 0, 1, u.size).some((p) => tileAt(b, p.x, p.y) === 'forest')) u.hidden = true;
    if (has(u, 'sandEmergence') && !foes.some((e) => unitDist(e, u) <= 2) && b.turn % 2 === 0) u.hidden = true;
  }
  // Bago-Bago leaps out of water or lava.
  if (has(u, 'leapingBones') && tilesOf(b, u).some((t) => t === 'water' || t === 'lava')) buff(u, 'leapingBones', 'Leaping Bones', 1, { mov: 2 });
  // Sleeping Zelda's Awakening: recovering from a negative status restores HP and MP.
  if (has(u, 'awakening')) {
    const n = bad(u);
    const prev = uses(u).aolBad;
    if (prev !== undefined && n < prev && u.hp > 0) {
      const h = Math.min(u.stats.hp - u.hp, Math.ceil(u.stats.hp * 0.2));
      u.hp += h;
      u.mp = Math.min(u.stats.mp, u.mp + Math.ceil(u.stats.mp * 0.2));
      events.push({ uid: u.uid, heal: h, damage: 0, source: 'Awakening' });
    }
    uses(u).aolBad = n;
  }
  // The Cross and the Moa Eye reveal the unseen.
  const sight = hasEffect(u, 'cross') ? 5 : hasBuff(u, 'moaEye') ? 6 : 0;
  if (sight) for (const e of foes) if (unitDist(u, e) <= sight && (e.hidden || has(e, 'unseenPresence') || has(e, 'invisibleDarkness'))) { e.hidden = false; buff(e, 'wisdomLit', 'Revealed', 1); }
  for (const l of aolThresholds(b, u)) events.push({ uid: u.uid, heal: 0, damage: 0, source: l });
}

/** Battle start: per-battle state, ambushers hide. */
export function aolBattleStart(b: Battle) {
  aolState(b);
  for (const u of b.units) {
    delete u.aolMomentum;
    if (u.team === 'enemy' && (has(u, 'suspendedAmbush') || has(u, 'sandEmergence'))) u.hidden = true;
  }
}

/** After a unit moves: floors crumble under it; ambushers drop out of hiding. */
export function aolAfterMove(b: Battle, u: Unit): string[] {
  const lines: string[] = [];
  for (const p of footprint(u.x, u.y, u.size)) {
    const k = keyOf(b, p.x, p.y);
    if (b.tiles[k] === 'collapsingFloor' && !flying(u)) { const st = aolState(b); if (!st.crumbling.includes(k)) { st.crumbling.push(k); lines.push('The floor starts to crumble.'); } }
  }
  for (const e of b.units) {
    if (e.team === u.team || !e.hidden || !(has(e, 'suspendedAmbush') || has(e, 'sandEmergence')) || unitDist(e, u) > 1) continue;
    e.hidden = false;
    const d = Math.min(u.hp - 1, Math.max(1, Math.floor(effectiveStats(e).str / 2) - Math.floor(effectiveStats(u).def / 2)));
    if (d > 0) u.hp -= d;
    buff(e, 'ambush', 'Ambush', 1);
    lines.push(has(e, 'suspendedAmbush') ? `A ${e.name} drops out of the trees onto ${u.name}${d > 0 ? ` (−${d})` : ''}!` : `A ${e.name} bursts out of the sand under ${u.name}${d > 0 ? ` (−${d})` : ''}!`);
  }
  return lines;
}

/** Status immunity: Dream Protection. */
export function aolImmune(u: Unit, kind: StatusKind): boolean {
  return !GOOD.has(kind) && hasBuff(u, 'dreamProtection');
}

// ───────────────────────── Abilities ─────────────────────────

const AOL_TILE = new Set(['rideElevator']);
const AOL_TARGET = new Set(['ancientBlessing', 'dreamProtection']);
const AOL_OTHER = new Set([...Z2_SPELLS, 'couragesAwakening', 'spectralSummoning', 'spectralHelmet', 'reseal']);

export const isAolAbility = (def: AbilityDef) => AOL_TILE.has(def.id) || AOL_TARGET.has(def.id) || AOL_OTHER.has(def.id);
export const aolNeedsTile = (def: AbilityDef) => AOL_TILE.has(def.id);
export const aolNeedsTarget = (def: AbilityDef) => AOL_TARGET.has(def.id);

/** Spell MP: the Sleeping Princess's Ancient Magic, Carock's Staff on teleports. */
export function aolCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  let m = 1;
  if (b?.bonus === 'ancientMagic' && u.team === 'player' && Z2_SPELLS.includes(def.id)) m *= 0.8;
  if (u.weapons.includes('carocksStaff') && ['rapidTeleport', 'darkTeleport', 'illusoryEscape'].includes(def.id)) m *= 0.5;
  return m;
}

const fallenAlly = (b: Battle, u: Unit) => [...b.fallen].reverse().find((f) => f.team === u.team && !f.summoned && !f.npc && !f.isBoss);
const ordinaryNear = (b: Battle, u: Unit, r: number) => foesOf(b, u).filter((e) => !e.isBoss && !e.originalForm && unitDist(u, e) <= r && !e.hidden);

export function aolTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  if (def.id !== 'rideElevator') return [];
  const out: Pos[] = [];
  for (let k = 0; k < b.tiles.length; k++) {
    const x = k % b.width, y = Math.floor(k / b.width);
    if (b.tiles[k] === 'elevator' && !(x === u.x && y === u.y) && free(b, u, x, y)) out.push({ x, y });
  }
  return out;
}

export function aolTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  switch (def.id) {
    case 'ancientBlessing': return alliesOf(b, u).filter((a) => unitDist(u, a) <= 2);
    case 'dreamProtection': return [u, ...alliesOf(b, u).filter((a) => unitDist(u, a) <= 2)];
  }
  return [];
}

export function aolUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isAolAbility(def)) return undefined;
  if (aolNeedsTarget(def) && !aolTargets(b, u, def).length) return 'No ally in range';
  switch (def.id) {
    case 'rideElevator': return !tilesOf(b, u).includes('elevator') ? 'Stand on an Elevator' : aolTiles(b, u, def).length ? null : 'No free Elevator to ride to';
    case 'couragesAwakening': { const f = fallenAlly(b, u); return !f ? 'No fallen ally to wake' : nearFree(b, f, u, 2) ? null : 'No room beside you'; }
    case 'spectralSummoning': case 'spectralHelmet': return ENEMIES.floatingHelmet ? null : 'Nothing answers';
    case 'reseal':
      if (!hasBuff(u, 'thunderExposed')) return 'Its face is already sealed';
      if (u.team === 'enemy' && (u.hp > u.stats.hp / 2 || u.usedAbilities?.includes('reseal'))) return 'Not yet';
      return null;
    case 'spellLife': return u.hp >= u.stats.hp ? 'Already at full HP' : null;
    case 'spellSpell': return ordinaryNear(b, u, 2).length || (b.og?.secrets.length ?? 0) ? null : 'No ordinary enemy within 2';
    case 'spellThunder': return foesOf(b, u).some((e) => !e.hidden) ? null : 'No enemies in sight';
  }
  return null;
}

export interface AolOutcome {
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

/** Cast a Zelda II ability. `onKill` runs the Original Hyrule kill effects (spoils, splitting). */
export function castAol(b: Battle, u: Unit, def: AbilityDef, rng: RNG, onKill: (e: Unit, dmg: number) => void, target?: Unit, at?: Pos): AolOutcome | null {
  if (!isAolAbility(def)) return null;
  const out: AolOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [] };
  const s = effectiveStats(u);
  const magicMult = u.team === 'player' && b.bonus === 'wisdomOfHyrule' ? 1.2 : 1;
  const self = (id: string, name: string, turns: number, stats: Record<string, number> = {}) => { buff(u, id, name, turns, stats); out.buffed.push(u.uid); };
  switch (def.id) {
    // ── Spells ──
    case 'spellShield': self('spellShield', 'Shield', 3); out.lines.push(`${u.name} is wrapped in a Shield.`); break;
    case 'spellJump': self('spellJump', 'Jump', 3, { mov: 1 }); out.lines.push(`${u.name} can leap high.`); break;
    case 'spellLife': {
      const h = Math.min(u.stats.hp - u.hp, Math.ceil(u.stats.hp * 0.4 * (u.team === 'player' ? b.healMult : 1)));
      u.hp += h;
      if (h > 0) out.heals.push({ uid: u.uid, amount: h });
      break;
    }
    case 'spellFairy': self('spellFairy', 'Fairy', 2, { mov: 3 }); buff(u, 'glide', 'Fairy wings', 2); out.lines.push(`${u.name} turns into a fairy.`); break;
    case 'spellFire': self('spellFire', 'Fire', 3); out.lines.push(`${u.name}'s sword burns.`); break;
    case 'spellReflect': self('spellReflect', 'Reflect', 3); out.lines.push(`Magic will bounce off ${u.name}.`); break;
    case 'spellSpell': {
      let n = 0;
      for (const e of ordinaryNear(b, u, 2)) {
        if (e.size > 1 && !free(b, { ...e, size: 1 } as Unit, e.x, e.y)) continue;
        transformInto(b, e, 'bot');
        (e.turnUses ??= {}).aolBotUntil = b.turn + 2;
        n++;
      }
      let found = 0;
      if (b.og) b.og.secrets = b.og.secrets.filter((k) => {
        if (footDist(k % b.width, Math.floor(k / b.width), 1, u.x, u.y, u.size) > 4 || b.tiles[k] !== 'plain') return true;
        b.tiles[k] = 'hiddenStairs'; found++;
        return false;
      });
      out.lines.push(`Spell! ${n ? `${n} enem${n === 1 ? 'y turns' : 'ies turn'} into Bots.` : 'Nothing turns into a Bot.'}${found ? ` ${found} hidden staircase${found > 1 ? 's appear' : ' appears'}.` : ''}`);
      break;
    }
    case 'spellThunder': {
      for (const e of foesOf(b, u).filter((x) => !x.hidden)) {
        if (has(e, 'sealedFace')) { buff(e, 'thunderExposed', 'Face exposed', 3); out.lines.push(`Thunder breaks ${e.name}'s seal: its face is exposed!`); }
        let dmg = Math.max(1, Math.floor((s.mag + 12) * magicMult - effectiveStats(e).res));
        if (hasEffect(e, 'lightningVulnerable')) dmg = Math.floor(dmg * 1.5);
        if (hasBuff(e, 'spellShield')) dmg = Math.floor(dmg / 2);
        if (e.buffs.some((x) => x.barrier)) dmg = 0;
        dmg = Math.min(e.hp, dmg);
        e.hp -= dmg;
        const killed = e.hp <= 0;
        out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses: [] });
        if (dmg > 0) e.lastHitBy = u.uid;
        if (killed) {
          u.kills++;
          onKill(e, dmg);
          b.units = b.units.filter((x) => x !== e);
          if (!e.summoned) b.fallen.push(e);
          b.log.push(`${u.name} defeated ${e.name}.`);
        } else out.lines.push(...aolThresholds(b, e));
      }
      out.lines.push('Thunder!');
      break;
    }
    // ── Sleeping Zelda ──
    case 'ancientBlessing': {
      const t = target!;
      t.mp = Math.min(t.stats.mp, t.mp + Math.floor(s.mag / 2) + 8);
      t.sta = Math.min(t.stats.sta, t.sta + 6);
      out.buffed.push(t.uid);
      out.lines.push(`An ancient blessing restores ${t.name}'s magic.`);
      break;
    }
    case 'dreamProtection': {
      const t = target!;
      const n = t.statuses.length;
      t.statuses = t.statuses.filter((x) => GOOD.has(x.kind));
      if (t.statuses.length < n) out.cleansed.push(t.uid);
      buff(t, 'dreamProtection', 'Dream Protection', 3);
      out.buffed.push(t.uid);
      break;
    }
    case 'couragesAwakening': {
      const f = fallenAlly(b, u)!;
      const spot = nearFree(b, f, u, 2)!;
      b.fallen = b.fallen.filter((x) => x !== f);
      Object.assign(f, { x: spot.x, y: spot.y, hp: Math.max(1, Math.ceil(f.stats.hp * 0.25)), statuses: [], moved: true, acted: true });
      b.units.push(f);
      (u.usedAbilities ??= []).push(def.id);
      out.heals.push({ uid: f.uid, amount: f.hp });
      out.lines.push(`Courage's Awakening: ${f.name} opens their eyes and rises again!`);
      break;
    }
    // ── Guardians ──
    case 'spectralSummoning': case 'spectralHelmet': {
      const h = spawn(b, 'floatingHelmet', u, u.team, u.level - 2);
      if (def.id === 'spectralHelmet') (u.usedAbilities ??= []).push(def.id);
      out.lines.push(h ? 'A Floating Helmet rises and starts to circle.' : 'No room for a helmet.');
      break;
    }
    case 'reseal':
      u.buffs = u.buffs.filter((x) => x.id !== 'thunderExposed');
      (u.usedAbilities ??= []).push(def.id);
      out.buffed.push(u.uid);
      out.lines.push(`${u.name} reseals its face.`);
      b.log.push(`${u.name} reseals its face!`);
      break;
    // ── Spaces ──
    case 'rideElevator':
      out.warped = { from: { x: u.x, y: u.y }, to: { ...at! } };
      u.x = at!.x; u.y = at!.y;
      out.free = true;
      out.lines.push(`${u.name} rides the elevator.`);
      break;
  }
  void rng;
  b.log.push(...out.lines.filter((l) => !b.log.includes(l)));
  return out;
}

// ───────────────────────── Items ─────────────────────────

export function useAolItem(b: Battle, u: Unit, id: string): string | null {
  switch (id) {
    case 'experienceBag': return `${u.name} opens the bag: experience!`;
    case 'linkDoll': buff(u, 'linkDoll', 'Link Doll', 99); return `${u.name} holds the Link Doll close.`;
    case 'moaEye': {
      let n = 0;
      for (const e of foesOf(b, u)) if (unitDist(u, e) <= 6 && (e.hidden || has(e, 'unseenPresence') || has(e, 'invisibleDarkness'))) { if (e.hidden) n++; e.hidden = false; buff(e, 'wisdomLit', 'Revealed', 3); }
      buff(u, 'moaEye', 'Moa Eye', 3);
      return n ? `The Moa Eye sees ${n} hidden enem${n === 1 ? 'y' : 'ies'}.` : 'The Moa Eye stares. Nothing is hiding nearby — for now.';
    }
    case 'myuSpike': buff(u, 'myuSpike', 'Myu Spike', 3); return `${u.name}'s shield bristles with spikes.`;
    case 'fokkaFeather': buff(u, 'fokkaFeather', 'Fokka Feather', 2, { mov: 2 }); return `${u.name} feels light as a feather.`;
    case 'thunderbirdFlame': buff(u, 'thunderbirdFlame', 'Thunderbird Flame', 3, { mag: 6 }); return `${u.name} burns with the guardian's flame (+6 MAG).`;
  }
  return null;
}
