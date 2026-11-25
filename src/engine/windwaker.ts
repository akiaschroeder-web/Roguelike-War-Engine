// The Wind Waker's battle rules: parries, weapon scavenging and disarming,
// armor breaking, boss mechanics, the Great Sea battlefield spaces, and the
// pack's abilities (melodies, grappling, planting, boarding…).

import { ENEMIES, ITEMS, RACES, TEMPLATES, WEAPONS } from '../data/registry';
import { SPOILS } from '../content/windwaker';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF, isMagical } from './rules';
import { addStatus, hasStatus } from './status';
import {
  aimWind, board, boardTargets, commandeer, commandeerTargets, damageComponent, disembark, disembarkTiles, isVessel, isWatery, refreshCargo, rotateWind, windLabel,
} from './naval';
import { canSwim, effectiveStats, hasEffect, makeEnemy, makeHero, moveTypeOf, prepareForBattle, unitTags } from './units';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

const isFlying = (u: Unit) => moveTypeOf(u) === 'flying';
const free = (b: Battle, u: Unit, x: number, y: number) =>
  inBounds(b, x, y) && anchorCost(b, u, x, y) < INF && footprint(x, y, u.size).every((p) => { const o = unitAt(b, p.x, p.y); return !o || o === u; });
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const WIND_WEAPONS = new Set(['gustMagic', 'korokWind', 'zephosGust', 'cyclosCycloneStaff']);
const isWindAttack = (w?: WeaponDef) => !!w && WIND_WEAPONS.has(w.id);

// ───────────────────────── Battlefield setup ─────────────────────────

/** Special spaces scattered across each Great Sea region. */
const FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  outsetIsland: { plantingSoil: 2, grapplePost: 1, spikedBarrel: 1, watchtower: 1 },
  forsakenFortress: { searchlight: 3, watchtower: 2, cannonEmplacement: 2, spikedBarrel: 3, ropeSwing: 2, boardingPoint: 1 },
  dragonRoost: { updraft: 3, ropeSwing: 2, grapplePost: 2, hangingVine: 1, spikedBarrel: 1 },
  forestHaven: { plantingSoil: 4, hangingVine: 3, grownTree: 2, grapplePost: 2, updraft: 1 },
  greatSea: {},
  towerOfTheGods: { commandStatue: 3, grapplePost: 1, spikedBarrel: 1, cannonEmplacement: 1 },
  earthTemple: { commandStatue: 1, hangingVine: 1, spikedBarrel: 1 },
  windTemple: { sandVortex: 4, updraft: 3, commandStatue: 1, grapplePost: 1 },
  submergedHyrule: { watchtower: 1, spikedBarrel: 2, commandStatue: 1, ropeSwing: 1 },
  ganonsTower: { spikedBarrel: 2, hangingVine: 2, ropeSwing: 1, sandVortex: 1 },
};
const OBSTACLES = new Set<Terrain>(['grapplePost', 'hangingVine', 'spikedBarrel', 'searchlight', 'commandStatue']);

export function decorateWindWaker(b: Battle, rng: RNG) {
  const feats = FEATURES[b.world];
  if (!feats) return;
  for (const [t, count] of Object.entries(feats) as [Terrain, number][]) {
    for (let i = 0; i < count; i++) {
      const cand: number[] = [];
      b.tiles.forEach((cur, k) => {
        const x = k % b.width, y = Math.floor(k / b.width);
        if (x < 3 || x > b.width - 4 || unitAt(b, x, y)) return;
        if (t === 'ropeSwing') { if (cur === 'water' || cur === 'lava' || (cur === 'plain' && rng.chance(5))) cand.push(k); return; }
        if (cur === 'plain' || (OBSTACLES.has(t) && cur === 'wall')) cand.push(k);
      });
      if (cand.length) b.tiles[rng.pick(cand)] = t;
    }
  }
}

/** Start-of-battle setup for Wind Waker regions, units and gear. */
export function windWakerUpkeepAtStart(b: Battle, rng: RNG) {
  for (const u of [...b.units]) {
    // Gohdan's two hands float beside it.
    if (u.skills.includes('trialOfTheGods') && ENEMIES.gohdansHand) {
      for (let i = 0; i < 2; i++) {
        const hand = makeEnemy(ENEMIES.gohdansHand, b.world, Math.max(1, b.enemyLevel), `e${b.uidCounter++}`, rng);
        const spot = nearFree(b, hand, u, 3);
        if (!spot) break;
        hand.team = u.team;
        hand.x = spot.x; hand.y = spot.y;
        b.units.push(hand);
      }
    }
    if (hasEffect(u, 'forestSeed')) for (const p of footprint(u.x, u.y, u.size)) if (b.tiles[keyOf(b, p.x, p.y)] === 'plain') b.tiles[keyOf(b, p.x, p.y)] = 'forest';
    if (b.night && u.team === 'enemy' && (u.skills.includes('phantomVoyage') || hasEffect(u, 'ghostFlag'))) u.hidden = true;
    if (u.skills.includes('burrowingAmbush') && u.team === 'enemy' && !u.isBoss) u.hidden = true;
    syncPosition(b, u);
  }
  if (b.world === 'forsakenFortress') b.fog = b.fog || rng.chance(50);
}

function nearFree(b: Battle, mover: Unit, by: Unit, r: number): Pos | null {
  let best: Pos | null = null, bd = 99;
  for (let y = by.y - r - mover.size; y <= by.y + by.size + r; y++) for (let x = by.x - r - mover.size; x <= by.x + by.size + r; x++) {
    if (!free(b, mover, x, y)) continue;
    const d = footDist(x, y, mover.size, by.x, by.y, by.size);
    if (d >= 1 && d < bd) { bd = d; best = { x, y }; }
  }
  return best;
}

/** Position-dependent bonuses: watchtowers and cannon emplacements. Call after any move. */
export function syncPosition(b: Battle, u: Unit) {
  const t = tileAt(b, u.x, u.y);
  const tower = t === 'watchtower';
  const had = u.buffs.some((x) => x.id === 'watchtower');
  if (tower && !had) u.buffs.push({ id: 'watchtower', name: 'Watchtower', turns: 99 });
  if (!tower && had) u.buffs = u.buffs.filter((x) => x.id !== 'watchtower');
  const gun = t === 'cannonEmplacement' && !isVessel(u) && u.size === 1;
  if (gun && !u.weapons.includes('emplacedCannon')) u.weapons.push('emplacedCannon');
  if (!gun && u.weapons.includes('emplacedCannon')) u.weapons = u.weapons.filter((w) => w !== 'emplacedCannon');
  if (hasEffect(u, 'forestConceal') || u.skills.includes('leafGlide')) {
    if ((t === 'forest' || t === 'grownTree') && !u.attacked) addStatus(u, 'veiled', 1);
  }
}

export interface WWEvent { uid: string; heal: number; damage: number; source: string }

/** Start of a unit's phase: Wind Waker skills, gear and spaces. */
export function wwStartPhase(b: Battle, u: Unit, events: WWEvent[]) {
  const mine = b.units.filter((a) => a.team === u.team);
  const foes = b.units.filter((e) => e.team !== u.team);
  const here = tileAt(b, u.x, u.y);
  const heal = (pct: number, source: string, flat = 0) => {
    const amt = Math.min(u.stats.hp - u.hp, Math.ceil(u.stats.hp * pct) + flat);
    if (amt > 0) { u.hp += amt; events.push({ uid: u.uid, heal: amt, damage: 0, source }); }
  };
  refreshCargo(u);
  if (isVessel(u) && hasEffect(u, 'repairStation') && u.movedDist === 0) heal(0, 'Repair Station', 5);
  if (hasEffect(u, 'jabunBlessing') && isWatery(here)) heal(0.1, "Jabun's Blessing");
  if (u.skills.includes('suspendedRoots') && u.hp > u.stats.hp / 2) heal(0.1, 'Suspended Roots');
  if (b.bonus === 'forestRenewal' && u.team === 'player' && (here === 'forest' || here === 'grownTree')) heal(0.1, 'Forest Renewal');
  for (const a of mine) {
    if (a === u) continue;
    if (a.skills.includes('forestMend') && unitDist(a, u) <= 2) heal(0, 'Forest Mend', 3);
    if (a.skills.includes('oceansProtection') && canSwim(u) && unitDist(a, u) <= 3) heal(0.1, "Jabun's currents");
    if (a.skills.includes('ancientEarthPrayer') && unitDist(a, u) <= 2) u.mp = Math.min(u.stats.mp, u.mp + 2);
    if (a.skills.includes('earthGodsPrayer') && unitDist(a, u) <= 2 && hasStatus(u, 'curse')) {
      u.statuses = u.statuses.filter((s) => s.kind !== 'curse');
      events.push({ uid: u.uid, heal: 0, damage: 0, source: "Medli's prayer lifts the curse" });
    }
    if (a.skills.includes('wingsOfLeadership') && isFlying(u) && unitDist(a, u) <= 3) buff(u, 'wings', 'Wings of Leadership', 1, { mov: 1 });
    if (a.skills.includes('tailwind') && unitDist(a, u) <= 2) buff(u, 'tailwind', 'Tailwind', 1, { mov: 1 });
  }
  if (u.skills.includes('oceanAmbush') && isWatery(here)) buff(u, 'ambush', 'Ocean Ambush', 1, { mov: 3 });
  if (u.skills.includes('ropeRunner') && here === 'shipDeck') buff(u, 'deck', 'Rope Runner', 1, { mov: 2 });
  if (here === 'updraft' && (isFlying(u) || u.skills.includes('leafGlide'))) buff(u, 'updraft', 'Updraft', 1, { mov: 2 });
  if (here === 'sandVortex' && !hasEffect(u, 'sandWalker') && !isFlying(u)) buff(u, 'sinking', 'Sinking Sand', 1, { mov: -2 });
  // Seagulls and lookouts spot hidden things.
  if (u.skills.includes('friendsOfTheSky') || u.skills.includes('crowsNest') || u.skills.includes('seaCharting') || hasEffect(u, 'telescope')) {
    const r = u.skills.includes('crowsNest') || u.skills.includes('seaCharting') ? 6 : 5;
    for (const e of foes) if (e.hidden && unitDist(u, e) <= r) { e.hidden = false; events.push({ uid: e.uid, heal: 0, damage: 0, source: `spotted by ${u.name}` }); }
    if (b.traps) for (const t of b.traps) if (t.hidden && footDist(t.x, t.y, 1, u.x, u.y, u.size) <= r) t.hidden = false;
  }
  // Big Octo's whirlpool drags ships and swimmers in.
  if (u.skills.includes('whirlpool')) for (const e of foes) if ((isVessel(e) || canSwim(e)) && unitDist(u, e) <= 3 && unitDist(u, e) > 1) pullToward(b, e, u, 1);
  // Jabun's currents push foes back.
  if (u.skills.includes('oceansProtection')) for (const e of foes) if (unitDist(u, e) <= 2) pushAway(b, e, u, 1);
  // Molgera spreads sinking sand and calls larvae.
  if (u.skills.includes('sandVortexSkill')) {
    const rng = new RNG(b.rngState);
    const spots = tilesInRange(b, u, 1, 3, u.size).filter((p) => tileAt(b, p.x, p.y) === 'plain' && !unitAt(b, p.x, p.y));
    for (const p of rng.shuffle(spots).slice(0, 2)) b.tiles[keyOf(b, p.x, p.y)] = 'sandVortex';
    const larvae = b.units.filter((x) => x.artId === 'molgeraLarva' && x.team === u.team).length;
    if (b.turn % 3 === 0 && larvae < 3 && ENEMIES.molgeraLarva) {
      const l = makeEnemy(ENEMIES.molgeraLarva, b.world, Math.max(1, b.enemyLevel - 1), `e${b.uidCounter++}`, rng);
      const spot = nearFree(b, l, u, 3);
      if (spot) { l.team = u.team; l.x = spot.x; l.y = spot.y; l.moved = l.acted = true; b.units.push(l); events.push({ uid: l.uid, heal: 0, damage: 0, source: 'A Molgera Larva bursts from the sand' }); }
    }
    b.rngState = rng.state;
  }
  // Bokoblins grab weapons lying around.
  if (u.skills.includes('scavenger')) {
    const near = (b.dropped ?? []).find((d) => footDist(d.x, d.y, 1, u.x, u.y, u.size) <= 1 && canCarry(u, d.id));
    if (near) { takeDropped(b, u, near); events.push({ uid: u.uid, heal: 0, damage: 0, source: `picks up a ${WEAPONS[near.id]?.name}` }); }
  }
  // The Command Melody wears off.
  if (u.commanded !== undefined && --u.commanded <= 0) {
    delete u.commanded;
    u.team = u.team === 'player' ? 'enemy' : 'player';
    u.moved = u.acted = true;
    events.push({ uid: u.uid, heal: 0, damage: 0, source: 'The Command Melody fades' });
  }
  syncPosition(b, u);
}

function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number>) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}

// ───────────────────────── Forced movement ─────────────────────────

const unmovable = (u: Unit) => hasEffect(u, 'unmovable') || u.isBoss || u.size >= 4;

export function pushAway(b: Battle, u: Unit, from: { x: number; y: number; size: number }, steps: number): boolean {
  if (unmovable(u)) return false;
  const dx = Math.sign(u.x + u.size / 2 - (from.x + from.size / 2)), dy = Math.sign(u.y + u.size / 2 - (from.y + from.size / 2));
  const [sx, sy] = Math.abs(dx) >= Math.abs(dy) && dx ? [dx, 0] : [0, dy || 1];
  let moved = false;
  for (let i = 0; i < steps; i++) {
    if (!free(b, u, u.x + sx, u.y + sy)) break;
    u.x += sx; u.y += sy;
    moved = true;
  }
  return moved;
}

export function pullToward(b: Battle, u: Unit, to: { x: number; y: number; size: number }, steps: number): boolean {
  if (unmovable(u)) return false;
  let moved = false;
  for (let i = 0; i < steps; i++) {
    if (footDist(u.x, u.y, u.size, to.x, to.y, to.size) <= 1) break;
    const dx = Math.sign(to.x - u.x), dy = Math.sign(to.y - u.y);
    const opts: [number, number][] = Math.abs(to.x - u.x) >= Math.abs(to.y - u.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
    const step = opts.find(([sx, sy]) => (sx || sy) && free(b, u, u.x + sx, u.y + sy));
    if (!step) break;
    u.x += step[0]; u.y += step[1];
    moved = true;
  }
  return moved;
}

// ───────────────────────── Environment ─────────────────────────

export function wwEnvironment(b: Battle, events: { text: string; uid?: string; damage?: number }[]) {
  for (const u of [...b.units]) {
    const fp = footprint(u.x, u.y, u.size).map((p) => tileAt(b, p.x, p.y));
    if (fp.includes('whirlpool') && u.hp > 1 && !isFlying(u)) {
      const d = Math.min(u.hp - 1, Math.ceil(u.stats.hp * 0.12));
      u.hp -= d;
      events.push({ text: `${u.name} is spun about by the whirlpool.`, uid: u.uid, damage: d });
    }
  }
  // Whirlpools and sand vortexes drag nearby units in.
  b.tiles.forEach((t, k) => {
    if (t !== 'whirlpool' && t !== 'sandVortex') return;
    const c = { x: k % b.width, y: Math.floor(k / b.width), size: 1 };
    for (const u of [...b.units]) {
      if (isFlying(u) || (t === 'sandVortex' && hasEffect(u, 'sandWalker'))) continue;
      const d = footDist(u.x, u.y, u.size, c.x, c.y, 1);
      if (d < 1 || d > (t === 'whirlpool' ? 2 : 1)) continue;
      if (t === 'whirlpool' && !isVessel(u) && !canSwim(u)) continue;
      const fx = u.x, fy = u.y;
      if (pullToward(b, u, { ...c, size: 0 } as never, 1) && (u.x !== fx || u.y !== fy)) events.push({ text: `${u.name} is dragged toward the ${t === 'whirlpool' ? 'whirlpool' : 'sinking sand'}.` });
    }
  });
  // Ocean currents carry ships too.
  if (b.naval && b.currentDir) {
    const [dx, dy] = b.currentDir;
    for (const u of b.units) {
      if (u.size < 2 || !isVessel(u)) continue;
      if (!footprint(u.x, u.y, u.size).some((p) => tileAt(b, p.x, p.y) === 'current')) continue;
      if (free(b, u, u.x + dx, u.y + dy)) { u.x += dx; u.y += dy; events.push({ text: `The current carries the ${u.name}.` }); }
    }
  }
  // Searchlights sweep: hidden player units in the light are spotted, and the fortress is alerted.
  const lights = b.tiles.map((t, k) => (t === 'searchlight' ? k : -1)).filter((k) => k >= 0);
  if (lights.length) {
    for (const u of b.units) {
      if (u.team !== 'player') continue;
      const lit = lights.some((k) => footDist(k % b.width, Math.floor(k / b.width), 1, u.x, u.y, u.size) <= 3);
      if (!lit) continue;
      if (hasStatus(u, 'veiled')) { u.statuses = u.statuses.filter((s) => s.kind !== 'veiled'); events.push({ text: `A searchlight catches ${u.name}!`, uid: u.uid }); }
      if (!b.alarm) {
        b.alarm = true;
        for (const e of b.units) if (e.team === 'enemy' && e.ai === 'guard') e.ai = 'aggressive';
        events.push({ text: 'The searchlights spot you: the fortress is on alert!' });
      }
    }
  }
}

// ───────────────────────── Combat hooks ─────────────────────────

export interface WWMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

/** Situational bonuses from Wind Waker skills, auras and gear. */
export function wwMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): WWMods {
  const m: WWMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const has = (s: string) => u.skills.includes(s);
  const allies = b.units.filter((a) => a !== u && a.team === u.team);
  const near = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  const melee = !!w && !isMagical(w.type) && w.minRange <= 1 && unitDist(u, foe, pos) <= 1;
  const tags = unitTags(u);
  if (has('mastersDiscipline') && melee) { m.hit += 15; m.crit += 15; }
  if (has('dragonsCourage') && foe.size > u.size) { m.str += 3; m.spd += 3; }
  if (has('mobMentality')) m.str += Math.min(6, 2 * b.units.filter((a) => a !== u && a.team === u.team && a.artId === 'miniblin' && unitDist(a, u, pos) <= 1).length);
  if (has('armoredCurl') && u.movedDist === 0 && !initiating) m.def += 8;
  if (has('aerialStrike') && initiating && isFlying(u) && u.movedDist > 0) m.dmg += 2;
  if (has('boardingParty') && tileAt(b, pos.x, pos.y) === 'shipDeck') m.str += 2;
  if (has('cannonDrill') && w?.type === 'siege') { m.hit += 10; if (isVessel(foe)) m.dmg += 2; }
  if (has('splooshKaboom') && w?.type === 'siege') m.hit += 20;
  if (has('earthGodsPrayer') && w?.element === 'light') m.dmg += 3;
  if (u.buffs.some((x) => x.id === 'earthLyric') && w?.element === 'light') m.dmg += 4;
  if (hasEffect(u, 'revealStats')) { m.hit += 10; m.crit += 5; }
  if (hasEffect(u, 'flightHit') && isFlying(u)) m.hit += 15;
  if (hasEffect(u, 'helmarocPlume') && isFlying(u)) m.avoid += 15;
  if (b.bonus === 'dragonRoost' && u.team === 'player' && w?.element === 'light' && unitTags(foe).includes('undead')) m.dmg += 2;
  for (const a of allies) {
    if (a.skills.includes('kingsWisdom') && near(a, 3)) { m.res += 2; m.avoid += 2; m.hit += 1; }
    if (a.skills.includes('piratesFortune') && tags.includes('pirate') && near(a, 3)) m.skl += 2;
    if (hasEffect(a, 'pirateAura') && tags.includes('pirate') && near(a, 3)) { m.str += 2; m.skl += 2; }
    if (a.skills.includes('wingsOfLeadership') && isFlying(u) && near(a, 3)) m.skl += 2;
    if (hasEffect(a, 'ritoCrestAura') && isFlying(u) && near(a, 2)) m.avoid += 10;
    if (hasEffect(a, 'poeCommand') && u.artId === 'poe' && near(a, 3)) m.str += 2;
  }
  if (b.bonus === 'hyrulesLegacy' && u.team === 'player') m.res += 2;
  return m;
}

/** Damage multipliers from Wind Waker skills and gear. */
export function wwMultiplier(b: Battle, atk: Unit, def: Unit, defPos: Pos, element: Element | undefined, magical: boolean, w: WeaponDef, dist: number): number {
  let mult = 1;
  const physical = !magical;
  if (def.skills.includes('heavyArmor') && physical && !def.armorBroken) mult *= 0.7;
  if (def.skills.includes('moltenCarapace') && physical && dist <= 1 && !def.armorBroken && w.type !== 'hammer' && !w.armorBreaker) mult *= 0.25;
  if (def.skills.includes('jellyBody') && physical) mult *= 0.8;
  if (def.skills.includes('submerge') && dist > 1) mult *= 0.5;
  if (hasEffect(def, 'frontalGuard') && physical && dist <= 1) mult *= 0.75;
  if (hasEffect(def, 'darkWard') && magical && element !== 'light') mult *= 0.7;
  if (def.weapons.some((id) => WEAPONS[id]?.reflectMagic) && magical) mult *= 0.5;
  if (element === 'fire' && (hasEffect(def, 'fireImmune') || (isFlying(def) && b.units.some((a) => a.team === def.team && a.skills.includes('dragonsBlessing') && unitDist(a, def) <= 3)))) mult = 0;
  if (w.armorBreaker && !hasEffect(def, 'armorBreakGuard') && (unitTags(def).includes('stone') || def.skills.includes('heavyArmor') || def.skills.includes('masterDuelist') || ['armor'].includes(moveTypeOf(def)))) mult *= w.armorBreaker;
  if (w.vsShield && def.gear.shield) mult *= w.vsShield;
  if (w.sandBonus && ['sandVortex'].includes(tileAt(b, defPos.x, defPos.y) ?? '')) mult *= 1 + w.sandBonus / 20;
  if (hasStatus(def, 'exposed') && b.units.some((a) => a.team === atk.team && a.skills.includes('perfectPicture'))) mult *= 1.15;
  const scholar = b.units.some((a) => a.team === atk.team && a.skills.includes('encyclopedicKnowledge') && unitDist(a, atk) <= 3);
  if (scholar && element && RACES[def.race]?.weakTo?.includes(element)) mult *= 1.1;
  if (atk.skills.includes('sacredPartnership') && element === 'light' && def.turnUses?.hitTurn === b.turn && def.lastHitBy !== atk.uid) mult *= 1.25;
  if (atk.weapons.includes('larutosHarp') && magical && (unitTags(def).includes('undead') || def.race === 'phantom')) mult *= 1.5;
  return mult;
}

/** Can't be critically hit. */
export function critImmune(def: Unit): boolean {
  return hasEffect(def, 'noCrit') || (def.skills.includes('armoredBeak') && !def.armorBroken) || (def.skills.includes('heavyArmor') && !def.armorBroken && false);
}

/** Extra range: watchtowers, Rito archers in the air, Salvatore's cannons. */
export function rangeBonus(u: Unit, w: WeaponDef): number {
  let r = 0;
  const ranged = w.maxRange >= 2 && w.type !== 'staff';
  if (ranged && u.buffs?.some((x) => x.id === 'watchtower')) r += 1;
  if (w.type === 'bow' && u.skills.includes('highGround') && moveTypeOf(u) === 'flying') r += 1;
  if (w.type === 'siege' && u.skills.includes('splooshKaboom')) r += 1;
  return r;
}

/** Element override (a lit Boko Stick). */
export function wwElement(u: Unit, w: WeaponDef): Element | undefined {
  if (w.ignitable && (u.turnUses?.burning ?? 0) > 0) return 'fire';
  return undefined;
}

export interface WWStrikeOut { lines: string[]; extra: { uid: string; dmg: number; hp: number; killed: boolean }[] }

/** After a damaging hit lands: components, armor, swarms, abductions, splits. */
export function wwAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, crit: boolean, w: WeaponDef | undefined, element: Element | undefined, rng: RNG): string[] {
  const lines: string[] = [];
  if (dmg <= 0) return lines;
  (target.turnUses ??= {}).hitTurn = b.turn;
  if (w?.ignitable && (by.turnUses?.burning ?? 0) > 0) {
    by.turnUses!.burning--;
    if (by.turnUses!.burning <= 0) { by.weapons = by.weapons.filter((x) => x !== w.id); if (!by.weapons.length) by.weapons.push('dekuStick'); lines.push(`${by.name}'s Boko Stick burns away.`); }
  }
  if (target.hp <= 0) return lines;
  // Ship components
  if (isVessel(target)) {
    const c = damageComponent(target, rng);
    if (c) lines.push(`The ${target.name}'s ${c === 'cannon' ? 'cannons are' : c + ' is'} knocked out!`);
  }
  if (w?.anchors) { addStatus(target, 'root', 1); }
  // Armor breaking (Darknuts, Gohma's carapace, the Helmaroc King's helmet)
  if (!target.armorBroken && (target.skills.includes('heavyArmor') || target.skills.includes('masterDuelist') || target.skills.includes('moltenCarapace') || target.skills.includes('armoredBeak'))) {
    if (crit || w?.armorBreaker || w?.type === 'hammer' || (w?.type === 'siege' && target.skills.includes('armoredBeak'))) {
      target.armorBroken = true;
      lines.push(`${target.name}'s ${target.skills.includes('moltenCarapace') ? 'shell cracks' : target.skills.includes('armoredBeak') ? 'helmet shatters' : 'armor falls away'}!`);
    }
  }
  // Disarm: a critical hit knocks the weapon out of their hands.
  if (crit) {
    const lost = disarm(b, target);
    if (lost) lines.push(`${target.name} is disarmed: the ${WEAPONS[lost]?.name} clatters to the ground!`);
  }
  if (by.skills.includes('cling') || w?.id === 'morthCling') buff(target, 'clung', 'Morth', 2, { mov: -2 });
  if (by.skills.includes('breezeCaller') && isWindAttack(w)) pushAway(b, target, by, 1);
  if (hasEffect(by, 'cyclonePull') && isWindAttack(w)) for (const e of b.units) if (e.team === target.team && e !== target && unitDist(e, target) <= 2) pullToward(b, e, target, 1);
  if (by.skills.includes('divineGraspSkill') && target.size < by.size) pushAway(b, target, by, 1);
  if (by.skills.includes('ancientEarthPrayer') && element === 'light' && unitTags(target).includes('undead')) addStatus(target, 'weaken', 2);
  if (hasEffect(by, 'dinPearl') && element === 'fire') by.sta = Math.min(by.stats.sta, by.sta + 2);
  if (hasEffect(target, 'fireImmune') && element === 'fire') target.mp = Math.min(target.stats.mp, target.mp + 3);
  // Floor Master drags its prey away.
  if (by.skills.includes('abduction') && target.size <= 1 && !target.isBoss && !target.isCommander && !isVessel(target) && rng.chance(40)) {
    const spot = farSpot(b, target);
    if (spot) { target.x = spot.x; target.y = spot.y; lines.push(`The Floor Master drags ${target.name} away!`); }
  }
  // Mothula releases Morths; Jalhalla splits off Poes in the light.
  const spawn = (id: string, near: Unit, why: string) => {
    const arch = ENEMIES[id];
    if (!arch) return;
    const n = makeEnemy(arch, b.world, Math.max(1, b.enemyLevel - 2), `e${b.uidCounter++}`, rng);
    const spot = nearFree(b, n, near, 2);
    if (!spot) return;
    n.team = near.team; n.x = spot.x; n.y = spot.y; n.moved = n.acted = true; n.summoned = true;
    b.units.push(n);
    lines.push(why);
  };
  if (target.skills.includes('infestation') && (target.turnUses?.morths ?? 0) < 3) { target.turnUses!.morths = (target.turnUses!.morths ?? 0) + 1; spawn('morth', target, 'A Morth scuttles out of the Mothula!'); }
  if (target.skills.includes('spiritCollective') && element === 'light' && (target.turnUses?.poes ?? 0) < 4) { target.turnUses!.poes = (target.turnUses!.poes ?? 0) + 1; spawn('poe', target, 'The light splits a Poe from Jalhalla!'); }
  return lines;
}

/** A far corner of the battlefield, away from the unit's allies. */
function farSpot(b: Battle, u: Unit): Pos | null {
  const friends = b.units.filter((a) => a.team === u.team && a !== u);
  let best: Pos | null = null, bs = -1;
  for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) {
    if (!free(b, u, x, y)) continue;
    const s = friends.length ? Math.min(...friends.map((a) => footDist(x, y, 1, a.x, a.y, a.size))) : 0;
    if (s > bs) { bs = s; best = { x, y }; }
  }
  return best;
}

/** Explosive deaths and self-destructs after an exchange. Returns damage dealt. */
export function wwAfterCombat(b: Battle, attacker: Unit, defender: Unit): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const blast = (src: Unit, power: number) => {
    for (const e of [...b.units]) {
      if (e === src || unitDist(e, src) !== 1) continue;
      const d = Math.min(e.hp, power);
      e.hp -= d;
      const killed = e.hp <= 0;
      out.push({ uid: e.uid, dmg: d, hp: e.hp, killed, by: src.uid });
      if (killed) { b.units = b.units.filter((x) => x !== e); b.fallen.push(e); b.log.push(`${e.name} is caught in the blast.`); }
    }
  };
  for (const u of [attacker, defender]) {
    if (u.skills.includes('explosiveCore') && u.hp > 0 && u.hp < u.stats.hp / 4 && !u.usedAbilities?.includes('explode')) {
      (u.usedAbilities ??= []).push('explode');
      b.log.push(`${u.name}'s core explodes!`);
      blast(u, 8 + Math.ceil(u.level / 2));
      u.hp = 0;
      b.units = b.units.filter((x) => x !== u);
      b.fallen.push(u);
      out.push({ uid: u.uid, dmg: 0, hp: 0, killed: true, by: u.uid });
    }
  }
  if (attacker.skills.includes('livingBomb') && attacker.hp > 0) {
    b.log.push(`${attacker.name} explodes!`);
    attacker.hp = 0;
    b.units = b.units.filter((x) => x !== attacker);
    b.fallen.push(attacker);
    out.push({ uid: attacker.uid, dmg: 0, hp: 0, killed: true, by: attacker.uid });
  }
  // Yellow ChuChus shock whoever hits them up close.
  for (const [me, foe] of [[attacker, defender], [defender, attacker]] as const) {
    if (me.hp > 0 && foe.hp > 3 && me.skills.includes('electricJelly') && unitDist(me, foe) === 1) {
      foe.hp -= 3;
      addStatus(foe, 'shock', 1);
      out.push({ uid: foe.uid, dmg: 3, hp: foe.hp, killed: false, by: me.uid });
    }
  }
  return out;
}

/** After a kill: dropped weapons, spoils, Gohdan's core. */
export function wwOnKill(b: Battle, by: Unit, victim: Unit, rng: RNG) {
  if (hasEffect(by, 'constructCore') && unitTags(victim).includes('stone')) by.mp = Math.min(by.stats.mp, by.mp + 5);
  if (victim.summoned || isVessel(victim)) return;
  const fortune = b.units.some((a) => a.team === by.team && a.skills.includes('piratesFortune')) || b.bonus === 'piratesSpoils';
  const w = victim.weapons.find((id) => WEAPONS[id] && WEAPONS[id].type !== 'natural' && !WEAPONS[id].unique && id !== 'emplacedCannon');
  if (w && rng.chance(fortune ? 60 : 40)) (b.dropped ??= []).push({ x: victim.x, y: victim.y, id: w });
  // Monster spoils
  const spoil = SPOILS[victim.bossId ?? victim.artId ?? victim.templateId ?? ''];
  const bag = b.owned?.includes('spoilsBag') ? 3 : 1;
  if (spoil && victim.team === 'enemy' && ITEMS[spoil] && rng.chance(Math.min(90, (fortune ? 1.25 : 1) * 12 * bag))) (b.loot ??= []).push(spoil);
}

// ───────────────────────── Disarming and scavenging ─────────────────────────

/** Knock the equipped weapon out of a unit's hands. Returns the weapon id, or null. */
export function disarm(b: Battle, u: Unit, to?: Pos): string | null {
  if (u.isBoss || isVessel(u)) return null;
  const id = u.weapons[0];
  const w = WEAPONS[id];
  if (!w || w.type === 'natural' || w.type === 'instrument' || w.unique || id === 'emplacedCannon') return null;
  u.weapons = u.weapons.slice(1);
  const at = to ?? { x: u.x, y: u.y };
  (b.dropped ??= []).push({ x: at.x, y: at.y, id });
  if (b.bonus === 'forsaken' && u.team === 'enemy') buff(u, 'disarmed', 'Disarmed', 2, { str: -3, def: -3 });
  return id;
}

/** Heavy weapons need enough CON. */
export function canCarry(u: Unit, id: string): boolean {
  const w = WEAPONS[id];
  if (!w || u.weapons.length >= 5 || isVessel(u)) return false;
  if (w.races && !w.races.includes(u.race)) return false;
  return w.weight <= effectiveStats(u).con + 4;
}

export function droppedNear(b: Battle, u: Unit): { x: number; y: number; id: string }[] {
  return (b.dropped ?? []).filter((d) => footDist(d.x, d.y, 1, u.x, u.y, u.size) <= 1 && canCarry(u, d.id));
}

export function takeDropped(b: Battle, u: Unit, d: { x: number; y: number; id: string }) {
  b.dropped = (b.dropped ?? []).filter((x) => x !== d);
  u.weapons.push(d.id);
  (u.scavenged ??= []).push(d.id);
}

/** Untrained with a scavenged weapon: −20 Hit. */
export function scavengePenalty(u: Unit, w: WeaponDef, classWeapons: string[]): number {
  return u.scavenged?.includes(w.id) && !classWeapons.includes(w.type) && w.type !== 'natural' ? -20 : 0;
}

// ───────────────────────── Parries ─────────────────────────

/** Does `u` get a parry after dodging this strike? */
export function canParry(u: Unit, attackerWeapon: WeaponDef | undefined, dist: number, rng: RNG): 'parry' | 'desertWind' | null {
  if (u.hp <= 0 || !attackerWeapon) return null;
  const melee = !isMagical(attackerWeapon.type) && dist <= 1;
  if (u.skills.includes('desertWind')) return 'desertWind';
  if (!melee) return null;
  if (u.skills.includes('heroOfWinds')) return 'parry';
  if (u.skills.includes('parryStance') && rng.chance(50)) return 'parry';
  return null;
}

/** Side effects of a successful parry (stamina, Command Points, Tetra's footwork). */
export function onParry(b: Battle, u: Unit, w: WeaponDef | undefined) {
  if (hasEffect(u, 'parryStamina')) u.sta = Math.min(u.stats.sta, u.sta + 2);
  if (hasEffect(u, 'parryStamina5')) u.sta = Math.min(u.stats.sta, u.sta + 5);
  if (b.bonus === 'courageOfTheSea' && u.team === 'player' && b.cp !== undefined && (u.turnUses?.cp ?? -1) !== b.turn) {
    b.cp = Math.min(b.cpMax ?? b.cp + 1, b.cp + 1);
    (u.turnUses ??= {}).cp = b.turn;
  }
  if (w?.id === 'tetrasCutlass') buff(u, 'parryStep', 'Pirate Footwork', 1, { mov: 2 });
}

// ───────────────────────── Abilities ─────────────────────────

export interface WWOutcome {
  hits: { uid: string; dmg: number; hp: number; killed: boolean; statuses: StatusKind[] }[];
  heals: { uid: string; amount: number }[];
  statuses: { uid: string; kind: StatusKind }[];
  cleansed: string[];
  buffed: string[];
  lines: string[];
  warped?: { from: Pos; to: Pos };
  free?: boolean;
  transformed?: string;
}

const adj = (b: Battle, u: Unit) => tilesInRange(b, u, 1, 1, u.size);
const enemyIn = (b: Battle, u: Unit, r: number, min = 1) => b.units.filter((e) => e.team !== u.team && !e.captive && unitDist(u, e) >= min && unitDist(u, e) <= r);
const tilesNear = (b: Battle, u: Unit, r: number, want: (t: Terrain) => boolean) =>
  tilesInRange(b, u, 1, r, u.size).filter((p) => want(b.tiles[keyOf(b, p.x, p.y)]));
const wantsTile = new Set(['plantTree', 'disembark', 'cutVine', 'detonateBarrel', 'salvage', 'smashSearchlight', 'balladOfGales', 'cyclone', 'pickUpWeapon', 'talonGrab', 'hurl']);
const wantsTarget = new Set(['boardVessel', 'commandeer', 'specialDelivery', 'steal', 'pullStrings', 'grapplePull', 'grappleDisarm', 'throwMachete', 'buyPotion', 'commandMelody']);

const WW_ABILITIES = new Set([...wantsTile, ...wantsTarget, 'windsRequiem', 'earthGodsLyric', 'windGodsAriaSong', 'songOfPassing', 'multiTargetThrow', 'shiftWind', 'summonPoe', 'leafGust', 'igniteStick']);

export function isWWAbility(def: AbilityDef): boolean {
  return WW_ABILITIES.has(def.id);
}

export function wwNeedsTile(def: AbilityDef): boolean {
  return wantsTile.has(def.id);
}

export function wwNeedsTarget(def: AbilityDef): boolean {
  return wantsTarget.has(def.id);
}

/** Second-step tiles for abilities that grab someone first (Talon Grab, Hurl): where they can be dropped. */
function throwTiles(b: Battle, u: Unit, r: number, victim?: Unit): Pos[] {
  const out: Pos[] = [];
  const v = victim ?? { size: 1 } as Unit;
  for (const p of tilesInRange(b, u, 2, r, u.size)) {
    if (!inBounds(b, p.x, p.y) || unitAt(b, p.x, p.y)) continue;
    const t = b.tiles[keyOf(b, p.x, p.y)];
    if (['wall', 'grapplePost', 'hangingVine', 'spikedBarrel', 'searchlight', 'commandStatue', 'mountain', 'timeBlock', 'cracked'].includes(t) && v.size === 1) continue;
    out.push(p);
  }
  return out;
}

function grabVictim(b: Battle, u: Unit, sizeMax: number): Unit | undefined {
  return b.units.find((e) => e.team !== u.team && !e.isBoss && !isVessel(e) && e.size <= sizeMax && unitDist(u, e) === 1);
}

const statueTiles = (b: Battle, u: Unit) => tilesNear(b, u, 4, (t) => t === 'commandStatue');

export function wwTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  switch (def.id) {
    case 'plantTree': return adj(b, u).filter((p) => ['plain', 'plantingSoil'].includes(b.tiles[keyOf(b, p.x, p.y)]) && !unitAt(b, p.x, p.y));
    case 'disembark': return disembarkTiles(b, u);
    case 'cutVine': return tilesNear(b, u, u.weapons.some((w) => WEAPONS[w]?.type === 'boomerang') ? 4 : 1, (t) => t === 'hangingVine');
    case 'detonateBarrel': {
      const r = Math.max(1, ...u.weapons.map((w) => WEAPONS[w]).filter((w) => w && w.type !== 'staff' && w.type !== 'instrument').map((w) => w.maxRange));
      return tilesNear(b, u, Math.min(6, r), (t) => t === 'spikedBarrel');
    }
    case 'salvage': return tilesNear(b, u, isVessel(u) && hasEffect(u, 'grappleCrane') ? 2 : 1, (t) => t === 'submergedTreasure');
    case 'smashSearchlight': return tilesNear(b, u, 1, (t) => t === 'searchlight');
    case 'balladOfGales': {
      const out: Pos[] = [];
      for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) if ((x <= 2 || x >= b.width - 3) && free(b, u, x, y) && footDist(x, y, u.size, u.x, u.y, u.size) >= 5) out.push({ x, y });
      return out;
    }
    case 'cyclone': return tilesInRange(b, u, 2, 5, u.size).filter((p) => b.units.some((e) => e.team !== u.team && footDist(p.x, p.y, 1, e.x, e.y, e.size) <= 1));
    case 'pickUpWeapon': return droppedNear(b, u).map((d) => ({ x: d.x, y: d.y }));
    case 'talonGrab': { const v = grabVictim(b, u, 1); return v ? throwTiles(b, u, 4, v) : []; }
    case 'hurl': { const v = grabVictim(b, u, Math.max(1, u.size - 1)); return v ? throwTiles(b, u, 3, v) : []; }
  }
  return [];
}

export function wwTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  switch (def.id) {
    case 'boardVessel': return boardTargets(b, u);
    case 'commandeer': return commandeerTargets(b, u);
    case 'specialDelivery': return u.pack.length ? b.units.filter((a) => a.team === u.team && a !== u && !isVessel(a) && unitDist(u, a) <= 6 && a.pack.length < 6) : [];
    case 'steal': return b.units.filter((e) => e.team !== u.team && unitDist(u, e) === 1 && (e.pack.length > 0 || e.weapons.length > 1));
    case 'pullStrings': return b.units.filter((e) => e.team !== u.team && !e.isBoss && e.size < u.size + (u.size === 1 ? 1 : 0) && unitDist(u, e) >= 2 && unitDist(u, e) <= 4 && !unmovable(e));
    case 'grapplePull': {
      const r = 3 + (hasEffect(u, 'ropeGloves') ? 2 : 0) + (u.skills.includes('grappler') ? 2 : 0);
      return b.units.filter((e) => e.team !== u.team && !e.isBoss && e.size <= u.size && unitDist(u, e) >= 2 && unitDist(u, e) <= r && !unmovable(e));
    }
    case 'grappleDisarm': return b.units.filter((e) => e.team !== u.team && unitDist(u, e) <= 3 && !e.isBoss && WEAPONS[e.weapons[0]] && !['natural', 'instrument'].includes(WEAPONS[e.weapons[0]].type) && !WEAPONS[e.weapons[0]].unique);
    case 'throwMachete': return u.weapons.includes('bokoblinMachete') ? enemyIn(b, u, 3, 2) : [];
    case 'buyPotion': {
      const near = b.units.filter((a) => a.team === u.team && a !== u && !isVessel(a) && unitDist(u, a) <= 1 && a.pack.length < 6);
      return [...near, ...(u.cargo ?? []).filter((p) => p.pack.length < 6).length ? [u] : []];
    }
    case 'commandMelody': return b.units.filter((e) => e.team !== u.team && unitTags(e).includes('stone') && !e.isBoss && e.size <= 2 && unitDist(u, e) <= 4);
  }
  return [];
}

/** Why a Wind Waker ability can't be used (undefined = not one of ours). */
export function wwUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isWWAbility(def)) return undefined;
  const turnUsed = (k: string) => u.turnUses?.[k] === b.turn;
  switch (def.id) {
    case 'boardVessel': return boardTargets(b, u).length ? null : 'No friendly ship with room next to you';
    case 'disembark': return u.cargo?.length ? (disembarkTiles(b, u).length ? null : 'Nowhere to land') : 'No passengers';
    case 'commandeer': return commandeerTargets(b, u).length ? null : 'No crewless enemy ship next to you';
    case 'pickUpWeapon': return droppedNear(b, u).length ? null : 'No weapon you can carry nearby';
    case 'windsRequiem': return b.wind || b.naval ? null : 'No wind to speak of here';
    case 'shiftWind': return turnUsed('shiftWind') ? 'Already used this turn' : null;
    case 'specialDelivery': return turnUsed('delivery') ? 'Already used this turn' : wwTargets(b, u, def).length ? null : 'No one to deliver to';
    case 'commandMelody': return statueTiles(b, u).length || wwTargets(b, u, def).length ? null : 'No statue or construct within 4';
    case 'multiTargetThrow': return enemyIn(b, u, 4).length || tilesNear(b, u, 4, (t) => t === 'hangingVine').length ? null : 'No enemies within 4';
    case 'leafGust': return enemyIn(b, u, 2).length ? null : 'No enemies within 2';
    case 'igniteStick': return (u.turnUses?.burning ?? 0) > 0 ? 'Already burning' : null;
    case 'summonPoe': return ENEMIES.poe ? null : 'No spirits answer';
    case 'earthGodsLyric': case 'windGodsAriaSong': case 'songOfPassing': return null;
  }
  if (wantsTile.has(def.id)) return wwTiles(b, u, def).length ? null : def.id === 'plantTree' ? 'No open ground next to you' : 'Nothing in reach';
  if (wantsTarget.has(def.id)) return wwTargets(b, u, def).length ? null : 'No one in reach';
  return null;
}

function strike(b: Battle, u: Unit, e: Unit, dmg: number, out: WWOutcome) {
  dmg = Math.min(e.hp, Math.max(0, Math.round(dmg)));
  e.hp -= dmg;
  const killed = e.hp <= 0;
  out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses: [] });
  if (killed) {
    u.kills++;
    b.units = b.units.filter((x) => x !== e);
    b.fallen.push(e);
    b.log.push(`${u.name} defeated ${e.name}.`);
  }
}

/** Use a Wind Waker ability. Returns null if `def` isn't one. */
export function castWindWaker(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): WWOutcome | null {
  if (!isWWAbility(def)) return null;
  const out: WWOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [] };
  const s = effectiveStats(u);
  const radius = 3 + (b.units.some((a) => a.team === u.team && a.skills.includes('ancientWindPrayer') && unitDist(a, u) <= 3) ? 1 : 0);
  const allies = (r: number) => b.units.filter((a) => a.team === u.team && unitDist(u, a) <= r);
  const songTurns = (n: number) => n + (u.weapons.includes('fadosViolin') ? 2 : 0);
  switch (def.id) {
    case 'boardVessel':
      if (!target || !board(b, u, target)) return null;
      out.lines.push(`${u.name} boards the ${target.name}.`);
      out.free = !u.acted;
      break;
    case 'disembark': {
      const p = at && disembark(b, u, at);
      if (!p) return null;
      out.lines.push(`${p.name} goes ashore.`);
      out.free = true;
      break;
    }
    case 'commandeer':
      if (!target || !commandeer(b, u, target)) return null;
      out.lines.push(`${u.name} takes the ${target.name}! It sails under your flag now.`);
      break;
    case 'pickUpWeapon': {
      const d = droppedNear(b, u).find((x) => x.x === at?.x && x.y === at?.y);
      if (!d) return null;
      takeDropped(b, u, d);
      out.lines.push(`${u.name} picks up a ${WEAPONS[d.id]?.name}.`);
      out.free = true;
      break;
    }
    case 'plantTree': {
      if (!at) return null;
      b.tiles[keyOf(b, at.x, at.y)] = 'grownTree';
      out.lines.push('A tree springs up: cover, a Hookshot anchor and a healing space.');
      if (hasEffect(u, 'freePlanting') && u.turnUses?.plant !== b.turn) { (u.turnUses ??= {}).plant = b.turn; out.free = true; }
      if (u.weapons.includes('makarsViolin')) for (const a of allies(2)) { const amt = Math.min(5, a.stats.hp - a.hp); if (amt > 0) { a.hp += amt; out.heals.push({ uid: a.uid, amount: amt }); } }
      break;
    }
    case 'cutVine': {
      if (!at) return null;
      b.tiles[keyOf(b, at.x, at.y)] = 'plain';
      for (const e of [...b.units]) if (e.team !== u.team && footDist(at.x, at.y, 1, e.x, e.y, e.size) === 1) strike(b, u, e, Math.ceil(e.stats.hp * 0.25), out);
      out.lines.push('The vine snaps: what it held comes crashing down!');
      break;
    }
    case 'detonateBarrel': {
      if (!at) return null;
      b.tiles[keyOf(b, at.x, at.y)] = 'plain';
      for (const e of [...b.units]) if (e !== u && footDist(at.x, at.y, 1, e.x, e.y, e.size) <= 1) strike(b, u, e, 12 + Math.floor(b.enemyLevel / 2) - Math.floor(effectiveStats(e).def / 2), out);
      // Chain reactions
      for (const p of tilesInRange(b, { x: at.x, y: at.y } as Pos, 1, 1, 1)) if (b.tiles[keyOf(b, p.x, p.y)] === 'spikedBarrel') b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      out.lines.push('💥 The spiked barrel explodes!');
      break;
    }
    case 'salvage': {
      if (!at) return null;
      b.tiles[keyOf(b, at.x, at.y)] = 'water';
      const rupees = 60 + b.enemyLevel * 15 + rng.int(0, 60);
      b.bonusRupees = (b.bonusRupees ?? 0) + rupees;
      const finds = ['repairPlanks', 'cannonball', 'chainShot', 'redChuJelly', 'blueChuJelly', 'tingleBottle', 'bigOctoInk'].filter((id) => ITEMS[id]);
      const item = rng.pick(finds);
      (b.loot ??= []).push(item);
      out.lines.push(`Hauled up a treasure chest: ₹${rupees} and ${ITEMS[item].name}!`);
      break;
    }
    case 'smashSearchlight':
      if (!at) return null;
      b.tiles[keyOf(b, at.x, at.y)] = 'plain';
      out.lines.push('The searchlight goes dark.');
      break;
    case 'windsRequiem': {
      const foe = [...b.units].filter((e) => e.team !== u.team).sort((a, c) => unitDist(u, a) - unitDist(u, c))[0];
      const w = foe ? aimWind(b, u, foe) : rotateWind(b);
      b.currentDir = b.tiles.includes('current') ? w : b.currentDir;
      out.lines.push(`The wind changes: ${windLabel(w)}.`);
      break;
    }
    case 'shiftWind':
      rotateWind(b);
      (u.turnUses ??= {}).shiftWind = b.turn;
      out.lines.push(`Zephos turns the wind: ${windLabel(b.wind)}.`);
      out.free = true;
      break;
    case 'balladOfGales': {
      if (!at) return null;
      const group = b.units.filter((a) => a.team === u.team && a !== u && unitDist(u, a) === 1 && a.size === 1 && !isVessel(a));
      out.warped = { from: { x: u.x, y: u.y }, to: { ...at } };
      u.x = at.x; u.y = at.y;
      for (const a of group) {
        const spot = nearFree(b, a, u, 2);
        if (spot) { a.x = spot.x; a.y = spot.y; }
      }
      out.lines.push(`A cyclone carries ${[u, ...group].map((x) => x.name).join(', ')} across the battlefield!`);
      break;
    }
    case 'commandMelody': {
      if (target) {
        target.team = u.team;
        target.commanded = 2;
        target.moved = target.acted = true;
        out.lines.push(`${target.name} obeys the Command Melody!`);
        out.statuses.push({ uid: target.uid, kind: 'confuse' });
      } else {
        const t = statueTiles(b, u)[0];
        const tmpl = TEMPLATES.armosKnight ? 'armosKnight' : undefined;
        if (!t || !tmpl) return null;
        b.tiles[keyOf(b, t.x, t.y)] = 'plain';
        const statue = prepareForBattle(makeHero(tmpl, `statue${b.uidCounter++}`, Math.max(1, u.level), rng));
        Object.assign(statue, { name: 'Command Statue', title: 'Awakened Statue', size: 1, x: t.x, y: t.y, team: u.team, npc: u.team === 'player', ai: 'aggressive', summoned: true, moved: true, acted: true });
        b.units.push(statue);
        out.lines.push('The statue stirs and steps forward at your command.');
      }
      break;
    }
    case 'earthGodsLyric':
      for (const a of allies(radius)) {
        if (a.statuses.some((x) => x.kind === 'curse')) { a.statuses = a.statuses.filter((x) => x.kind !== 'curse'); out.cleansed.push(a.uid); }
        buff(a, 'earthLyric', "Earth God's Lyric", songTurns(3), {});
        out.buffed.push(a.uid);
      }
      if (u.weapons.includes('medlisHarp')) for (const e of enemyIn(b, u, radius)) if (unitTags(e).includes('undead')) { addStatus(e, 'stun', 1); out.statuses.push({ uid: e.uid, kind: 'stun' }); }
      break;
    case 'windGodsAriaSong':
      for (const a of allies(radius)) {
        if (!isFlying(a) && !a.skills.includes('leafGlide') && !hasEffect(a, 'flight')) continue;
        buff(a, 'windAria', "Wind God's Aria", songTurns(2), { mov: 3 });
        out.buffed.push(a.uid);
      }
      if (u.weapons.includes('makarsViolin')) {
        const spot = adj(b, u).find((p) => b.tiles[keyOf(b, p.x, p.y)] === 'plain' && !unitAt(b, p.x, p.y));
        if (spot) { b.tiles[keyOf(b, spot.x, spot.y)] = 'grownTree'; out.lines.push('Healing vegetation sprouts from the melody.'); }
      }
      break;
    case 'songOfPassing':
      b.night = !b.night;
      b.fog = !!b.night;
      out.lines.push(b.night ? 'Night falls. The dead grow bold, and fog rolls in.' : 'The sun rises and the fog lifts.');
      break;
    case 'multiTargetThrow': {
      const boom = u.weapons.map((w) => WEAPONS[w]).find((w) => w?.type === 'boomerang');
      const power = s.str + (boom?.might ?? 3);
      for (const e of enemyIn(b, u, 4).sort((a, c) => unitDist(u, a) - unitDist(u, c)).slice(0, 5)) strike(b, u, e, (power - effectiveStats(e).def) * 0.6, out);
      for (const p of tilesNear(b, u, 4, (t) => t === 'hangingVine')) b.tiles[keyOf(b, p.x, p.y)] = 'plain';
      break;
    }
    case 'cyclone': {
      if (!at) return null;
      for (const e of [...b.units].filter((x) => x.team !== u.team && footDist(at.x, at.y, 1, x.x, x.y, x.size) <= 1)) {
        strike(b, u, e, s.mag + 8 - effectiveStats(e).res, out);
        if (b.units.includes(e)) pushAway(b, e, { x: at.x, y: at.y, size: 1 }, b.bonus === 'unrulyWinds' && isFlying(e) ? 3 : 2);
      }
      out.lines.push('A cyclone tears across the field!');
      break;
    }
    case 'leafGust': {
      for (const e of enemyIn(b, u, 2)) if (pushAway(b, e, u, b.bonus === 'unrulyWinds' && isFlying(e) ? 3 : 2)) out.lines.push(`${e.name} is blown back.`);
      if (b.wind && rng.chance(50)) { aimWind(b, u, enemyIn(b, u, 2)[0] ?? u); out.lines.push(`The gust swings the wind: ${windLabel(b.wind)}.`); }
      break;
    }
    case 'hurl':
    case 'talonGrab': {
      const v = grabVictim(b, u, def.id === 'talonGrab' ? 1 : Math.max(1, u.size - 1));
      if (!v || !at) return null;
      out.warped = { from: { x: v.x, y: v.y }, to: { ...at } };
      v.x = at.x; v.y = at.y;
      const dmg = def.id === 'hurl' ? s.str / 2 + 4 : 4;
      const drowned = isWatery(b.tiles[keyOf(b, at.x, at.y)]) && !canSwim(v) && !isFlying(v);
      strike(b, u, v, drowned ? v.hp : dmg, out);
      out.lines.push(drowned ? `${v.name} is dropped into the sea!` : `${u.name} ${def.id === 'hurl' ? 'hurls' : 'drops'} ${v.name}!`);
      break;
    }
    case 'grapplePull':
      if (!target) return null;
      pullToward(b, target, u, 6);
      out.lines.push(`${u.name} yanks ${target.name} closer!`);
      break;
    case 'grappleDisarm': {
      if (!target) return null;
      const lost = disarm(b, target, { x: u.x, y: u.y });
      if (!lost) return null;
      out.lines.push(`${u.name} snatches ${target.name}'s ${WEAPONS[lost]?.name}!`);
      break;
    }
    case 'pullStrings':
      if (!target) return null;
      pullToward(b, target, u, 8);
      out.lines.push(`${u.name} pulls ${target.name}'s strings.`);
      break;
    case 'throwMachete': {
      if (!target) return null;
      const w = WEAPONS.bokoblinMachete;
      strike(b, u, target, s.str + w.might - effectiveStats(target).def, out);
      u.weapons = u.weapons.filter((x, i) => x !== 'bokoblinMachete' || i !== u.weapons.indexOf('bokoblinMachete'));
      if (!u.weapons.length) u.weapons.push('dekuStick');
      const spot = nearFree(b, { ...u, size: 1 } as Unit, target, 1) ?? { x: target.x, y: target.y };
      (b.dropped ??= []).push({ x: spot.x, y: spot.y, id: 'bokoblinMachete' });
      break;
    }
    case 'igniteStick':
      (u.turnUses ??= {}).burning = 3;
      out.lines.push(`${u.name}'s Boko Stick catches fire!`);
      out.free = true;
      break;
    case 'specialDelivery': {
      if (!target) return null;
      const item = u.pack.shift()!;
      target.pack.push(item);
      (u.turnUses ??= {}).delivery = b.turn;
      out.lines.push(`${u.name} delivers ${ITEMS[item.id]?.name ?? item.id} to ${target.name}.`);
      out.free = true;
      break;
    }
    case 'steal': {
      if (!target) return null;
      (u.usedAbilities ??= []).push(def.id);
      if (target.pack.length) {
        const item = target.pack.shift()!;
        if (u.pack.length < 6) u.pack.push(item); else (b.loot ??= []).push(item.id);
        out.lines.push(`${u.name} pinches ${ITEMS[item.id]?.name ?? item.id} from ${target.name}!`);
      } else {
        const w = target.weapons.splice(1, 1)[0];
        (b.loot ??= []).push(w);
        out.lines.push(`${u.name} lifts ${target.name}'s spare ${WEAPONS[w]?.name ?? w}!`);
      }
      break;
    }
    case 'summonPoe': {
      (u.usedAbilities ??= []).push(def.id);
      const poe = makeEnemy(ENEMIES.poe, b.world, Math.max(1, u.level), `poe${b.uidCounter++}`, rng);
      const spot = nearFree(b, poe, u, 2);
      if (!spot) return null;
      Object.assign(poe, { team: u.team, npc: u.team === 'player', summoned: true, x: spot.x, y: spot.y, moved: true, acted: true, ai: 'aggressive' });
      b.units.push(poe);
      out.lines.push('A Poe rises from the lantern to fight for you.');
      break;
    }
    case 'buyPotion': {
      if (!target) return null;
      const buyer = target === u ? u.cargo!.find((p) => p.pack.length < 6)! : target;
      if ((b.rewardRupees + (b.bonusRupees ?? 0)) < 40 || !ITEMS.redPotion) return null;
      b.bonusRupees = (b.bonusRupees ?? 0) - 40;
      buyer.pack.push({ id: 'redPotion', uses: ITEMS.redPotion.uses });
      out.lines.push(`"Thank you so much!" ${buyer.name} buys a Red Potion for ₹40.`);
      out.free = true;
      break;
    }
    default:
      return null;
  }
  return out;
}

/** Wind abilities cost half for the Lords of the Gale. */
export function wwCostMult(b: Battle | undefined, u: Unit, def: AbilityDef): number {
  const windy = ['windsRequiem', 'balladOfGales', 'windGodsAriaSong', 'cyclone', 'leafGust', 'shiftWind'].includes(def.id);
  return windy && b?.bonus === 'unrulyWinds' && u.team === 'player' ? 0.5 : 1;
}

export { isFlying };
