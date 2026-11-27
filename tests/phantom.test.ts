import { describe, expect, it } from 'vitest';
import {
  ABILITIES, ART_VARIANTS, BOSS_AS_TEMPLATE, BOSSES, COMMANDERS, ENEMIES, EVENTS, FACTIONS, GEAR, ITEMS, QUEST_ITEMS, REGION_BOSSES, ROSTERS, SKILLS, TEMPLATES, WEAPONS, WORLDS, artFor,
} from '../src/data/registry';
import { PHANTOM_HOURGLASS, PHANTOM_ROUTE, PH_ROUTE_BOSSES, SHIP_PART_IDS, SHIP_SETS, SHIP_SLOTS, shipPartId } from '../src/content/phantom';
import { castAbility, unusableReason } from '../src/engine/abilities';
import { checkResult, createBattle, moveUnit, startPhase } from '../src/engine/battle';
import { forecast, resolveCombat } from '../src/engine/combat';
import { environmentPhase } from '../src/engine/field';
import { planAction } from '../src/engine/ai';
import { tileCost } from '../src/engine/grid';
import { capacityOf } from '../src/engine/naval';
import {
  face, hourglassCost, isFrontal, phAfterHit, phMultiplier, phOnBlast, phOnKill, phState, phStartPhase, phantomBattleStart, setLevel,
} from '../src/engine/phantom';
import { applyPhantomEffect, hourglassMax, phantomAfterBattle, phantomBattleSetup, phantomOf, phantomRegionOptions, phantomStartRegion, spiritLevel } from '../src/engine/phantomRun';
import { RNG } from '../src/engine/rng';
import { availableNodes, enterNode, isNavalNode, newRun, offerRegions, startBattle, vesselHasSlot, type RunWithEvent } from '../src/engine/run';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = (s = 11) => new RNG(s);

function field(w = 14, h = 9, world = 'mercayIsland'): Battle {
  const tiles: Terrain[] = Array.from({ length: w * h }, () => 'plain');
  return {
    width: w, height: h, tiles, world, units: [], turn: 1, phase: 'player', objective: { type: 'rout' }, rngState: 1, rewardRupees: 100,
    nodeType: 'battle', log: [], fallen: [], enemyLevel: 3, uidCounter: 50, interceptUsed: false, healMult: 1, drops: [],
  };
}
function place<T extends Unit>(b: Battle, u: T, x: number, y: number, team: 'player' | 'enemy' = 'player'): T {
  const p = prepareForBattle(u) as T;
  Object.assign(p, { x, y, team });
  b.units.push(p);
  return p;
}
const hero = (id: string, uid = id, lvl = 5) => makeHero(id, uid, lvl, rng());
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'mercayIsland', lvl, uid, rng());
const withHourglass = (b: Battle, energy = 20) => { const st = phState(b); st.hourglass = true; st.max = energy; st.energy = energy; return st; };

const CAST = ['linebeck', 'bellumbeck', 'ciela', 'oshus', 'oceanKing', 'leaf', 'neri', 'jolene', 'joanne', 'astrid', 'eddo', 'zauz', 'gongoron', 'biggoronGoronIsland', 'kingMutoh',
  'bremeur', 'doylan', 'max', 'anoukiChief', 'anoukiWarrior', 'anoukiHunter', 'anoukiIceMage', 'anoukiGuardian', 'yookWarrior', 'yookIceBreather', 'yookBerserker', 'ssLinebeck', 'jolenesShip'];
const MONSTERS = ['phantom', 'swiftPhantom', 'warpPhantom', 'phantomEye', 'geozard'];
const NEW_BOSSES = ['blaaz', 'cyclok', 'crayk', 'cubusSister1', 'cubusSister2', 'cubusSister3', 'cubusSister4', 'dongorongo', 'eox', 'bellum', 'bellumsGhostShip'];
const PENDING = ['potionShopLady', 'rosa', 'subrosianWarrior', 'subrosianDancer', 'subrosianBlacksmith', 'subrosianMiner', 'subrosianSorcerer', 'subrosianChef', 'subrosianThief'];

describe('Phantom Hourglass content', () => {
  it('registers the cast, the species, the monsters, the bosses and the pending units (all recruitable, all with art) with the doc\'s stats', () => {
    for (const id of [...CAST, ...MONSTERS, ...NEW_BOSSES, ...PENDING]) {
      expect(TEMPLATES[id], id).toBeDefined();
      expect(artFor(id), id).not.toBeNull();
      expect(TEMPLATES[id].formOf, id).toBeUndefined();
    }
    expect(TEMPLATES.linebeck.stats).toEqual({ hp: 26, str: 7, mag: 0, skl: 13, spd: 11, def: 5, res: 5, lck: 19, con: 8, mov: 6, sta: 22, mp: 0 });
    expect(TEMPLATES.oceanKing.stats).toMatchObject({ hp: 120, str: 22, mag: 35, res: 32, mov: 7, mp: 90 });
    expect(TEMPLATES.oceanKing.size).toBe(5);
    expect(TEMPLATES.biggoronGoronIsland.size).toBe(4);
    expect(TEMPLATES.anoukiChief.stats).toMatchObject({ hp: 32, str: 9, mag: 18, skl: 15, spd: 7, def: 12, res: 19, lck: 16, con: 8, mov: 5, sta: 22, mp: 45 });
    expect(TEMPLATES.anoukiChief.gear).toEqual({ head: 'chiefsAntlerCrown', body: 'chiefsWinterRobes' });
    expect(BOSSES.eox.stats).toMatchObject({ hp: 125, str: 32, def: 35, mov: 4 });
    expect(BOSSES.eox.size).toBe(5);
    expect(BOSSES.bellum.stats).toMatchObject({ hp: 110, mag: 35, res: 30, mp: 85 });
    expect(TEMPLATES.bellumbeck.stats).toMatchObject({ hp: 48, str: 24, skl: 23, spd: 19, def: 22 });
    expect(ENEMIES.warpPhantom.stats).toMatchObject({ hp: 48, str: 20, mag: 18, def: 24, res: 20 });
    expect(TEMPLATES.potionShopLady.stats).toMatchObject({ hp: 21, str: 4, mag: 15, skl: 13, spd: 5, def: 5, res: 16, lck: 14, con: 4, mov: 4, sta: 12, mp: 32 });
    expect(TEMPLATES.potionShopLady.growths).toMatchObject({ hp: 45, mag: 55, lck: 50 });
    expect(TEMPLATES.rosa.stats).toMatchObject({ hp: 24, spd: 15, lck: 16 });
    expect(TEMPLATES.subrosianThief.stats).toMatchObject({ hp: 20, spd: 15, mov: 7 });
    // Forms are also recruitable on their own, but never in the same army.
    expect(TEMPLATES.linebeck.exclusiveWith).toContain('bellumbeck');
    expect(TEMPLATES.oshus.exclusiveWith).toContain('oceanKing');
    expect(BOSS_AS_TEMPLATE.bellumbeckBoss).toBe('bellumbeck');
    expect(BOSS_AS_TEMPLATE.joleneBoss).toBe('jolene');
    // No new Link, Tetra or Gleeok; no Cobble generics.
    for (const id of ['cobbleSoldier', 'cobbleKnight', 'cobbleMystic', 'linkPH', 'tetraPH', 'gleeokPH']) expect(TEMPLATES[id], id).toBeUndefined();
  });

  it('uses the fixed art ids: aliases, variants and the Cubus Sisters\' crops', () => {
    expect(artFor('eox')).toBe('koloktos');
    expect(artFor('anoukiChief')).toBe('anouki');
    for (const id of ['anoukiWarrior', 'anoukiHunter', 'anoukiIceMage', 'anoukiGuardian']) expect(artFor(id)).toBe('anouki');
    for (const id of ['yookWarrior', 'yookIceBreather', 'yookBerserker']) expect(artFor(id)).toBe('yook');
    for (const id of ['subrosianWarrior', 'subrosianChef', 'subrosianThief']) expect(artFor(id)).toBe('subrosian');
    for (const n of [1, 2, 3, 4]) expect(artFor(`cubusSister${n}`)).toBe(`cubusSister${n}`);
    expect(ART_VARIANTS.gleeokFlame).toContain('gleeokPH');
    expect(ART_VARIANTS.gleeokFrost).toContain('gleeokPH');
    expect(ART_VARIANTS.gleeokFlame[0]).toBe('gleeokFlame');
    // The Wind Waker's Ghost Ship keeps its id (its art is now the PH Ghost Ship, translucent and light blue).
    expect(artFor('ghostShip')).toBe('ghostShip');
  });

  it('only references things that exist', () => {
    const missing: string[] = [];
    const known = (id: string) => !!(WEAPONS[id] || GEAR[id] || ITEMS[id]);
    const P = PHANTOM_HOURGLASS;
    for (const t of [...P.templates, ...P.enemies, ...P.bosses]) {
      for (const w of t.weapons) if (!WEAPONS[w]) missing.push(`weapon ${w} (${t.id})`);
      if (t.skill && !SKILLS[t.skill]) missing.push(`skill ${t.skill} (${t.id})`);
      for (const a of ('abilities' in t ? t.abilities ?? [] : [])) if (!ABILITIES[a]) missing.push(`ability ${a} (${t.id})`);
      for (const g of Object.values(('gear' in t ? t.gear : undefined) ?? {})) if (!GEAR[g as string]) missing.push(`gear ${g} (${t.id})`);
    }
    for (const b of P.bosses) for (const d of b.drops ?? []) if (!known(d)) missing.push(`drop ${d} (${b.id})`);
    for (const ids of Object.values(P.rosters)) for (const id of ids) if (!ENEMIES[id]) missing.push(`roster ${id}`);
    for (const f of P.factions) for (const u of [...f.units, ...f.leaders]) if (!TEMPLATES[u]) missing.push(`faction ${f.id}: ${u}`);
    for (const ev of P.events ?? []) {
      if (ev.art && !artFor(ev.art)) missing.push(`event art ${ev.art}`);
      for (const ch of ev.choices) for (const o of [ch.outcome, ch.gamble?.win, ch.gamble?.lose].filter(Boolean)) for (const e of o!.effects) {
        if (e.kind === 'loot') for (const i of e.ids) if (!known(i)) missing.push(`event ${ev.id} loot ${i}`);
        if (e.kind === 'recruit') for (const i of e.pool) if (!TEMPLATES[i]) missing.push(`event ${ev.id} recruit ${i}`);
        if (e.kind === 'quest' && !QUEST_ITEMS[e.id]) missing.push(`event ${ev.id} quest ${e.id}`);
      }
      for (const r of ev.regions ?? []) if (!WORLDS[r]) missing.push(`event ${ev.id} region ${r}`);
    }
    for (const ids of Object.values(PH_ROUTE_BOSSES)) for (const id of ids) if (!BOSSES[id]) missing.push(`route boss ${id}`);
    expect(missing).toEqual([]);
    for (const r of PHANTOM_ROUTE) {
      expect(WORLDS[r]?.campaign, r).toBe('phantom');
      expect(ROSTERS[r]?.length, r).toBeGreaterThan(0);
      expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0);
    }
    expect(PHANTOM_ROUTE.length).toBe(14);
    expect(WORLDS.bellumsWaters.naval).toBe(true);
  });

  it('has five phantom commanders and brings in the pending units where they belong', () => {
    const cmd = COMMANDERS.filter((c) => c.campaign === 'phantom');
    expect(cmd.map((c) => c.heroId)).toEqual(['linebeck', 'ciela', 'jolene', 'kingMutoh', 'bellum']);
    expect(cmd[0].units).toEqual(['ssLinebeck', 'eddo', 'senza', 'heroOfWinds']);
    expect(cmd[2].units).toEqual(['jolenesShip', 'nudge', 'zuko', 'gonzo']);
    // Subrosians in Subrosia's roster, a Subrosian faction, the market and Rosa's date.
    expect(ROSTERS.subrosia).toEqual(expect.arrayContaining(['subrosianWarrior', 'subrosianMiner', 'subrosianThief']));
    expect(FACTIONS.subrosianOreGang.regions.subrosia).toBeGreaterThan(0);
    expect(EVENTS.subrosianMarket.regions).toContain('subrosia');
    expect(EVENTS.rosasDate.choices.some((c) => c.requires?.quest?.includes('tradeLA_Ribbon'))).toBe(true);
    // The Potion Shop Lady: Kakariko, and anyone's potion shop after the first region.
    expect(EVENTS.kakarikoPotionShop.regions).toContain('kakarikoGraveyard');
    expect(EVENTS.travelingPotionShop.requires?.minAct).toBe(2);
  });

  it('has 72 ship parts: nine sets for the eight slots', () => {
    expect(SHIP_SLOTS.length).toBe(8);
    expect(SHIP_SETS.length).toBe(9);
    expect(SHIP_PART_IDS.length).toBe(72);
    for (const id of SHIP_PART_IDS) expect(GEAR[id], id).toBeDefined();
    expect(GEAR[shipPartId('golden', 'chimney')].slot).toBe('chimney');
  });
});

describe('the Phantom Hourglass', () => {
  it('is a shared reserve: abilities spend time energy, Ciela\'s army pays less, Sands of Hours raise the reserve', () => {
    const b = field();
    const st = withHourglass(b, 10);
    const link = place(b, hero('heroOfWinds'), 2, 2);
    const p = place(b, foe('phantom'), 4, 2, 'enemy');
    expect(unusableReason(b, link, ABILITIES.timeFreeze)).toBeNull();
    castAbility(b, link, 'timeFreeze', rng());
    expect(st.energy).toBe(5);
    expect(p.buffs.some((x) => x.id === 'timeFrozen')).toBe(true);
    // Frozen enemies can't counter.
    expect(forecast(b, link, { x: 3, y: 2 }, p).defender.attacks).toBe(0);
    st.energy = 10;
    expect(unusableReason(b, link, ABILITIES.frozenBattlefield)).toBe('Not enough time in the Hourglass');
    b.bonus = 'spiritOfCourage';
    expect(hourglassCost(b, link, 'frozenBattlefield')).toBe(12);
    // No Hourglass, no time abilities (and enemies never have it).
    const b2 = field();
    const l2 = place(b2, hero('heroOfWinds'), 2, 2);
    place(b2, foe('phantom'), 4, 2, 'enemy');
    expect(unusableReason(b2, l2, ABILITIES.timeFreeze)).toBe('Needs the Phantom Hourglass');
    const run = newRun(5, 'linebeck', 'phantom');
    expect(hourglassMax(run)).toBe(10);
    applyPhantomEffect(run, { kind: 'phantom', op: 'sands' }, rng());
    expect(hourglassMax(run)).toBe(15);
  });

  it('Frozen Battlefield makes ordinary enemies skip their turn; bosses resist', () => {
    const b = field();
    withHourglass(b, 20);
    const link = place(b, hero('heroOfWinds'), 1, 1);
    const e = place(b, foe('geozard'), 6, 1, 'enemy');
    const boss = place(b, makeEnemy(BOSSES.blaaz, 'isleOfEmber', 5, 'bz', rng(), { boss: true }), 8, 4, 'enemy');
    castAbility(b, link, 'frozenBattlefield', rng());
    startPhase(b, 'enemy');
    expect(e.acted).toBe(true);
    expect(boss.acted).toBe(false);
  });
});

describe('Phantoms and the Temple', () => {
  it('Phantoms shrug off frontal weapon attacks; behind, sacred weapons and Sacred Opening get through', () => {
    const b = field();
    withHourglass(b, 20);
    const link = place(b, hero('heroOfWinds'), 3, 4);
    const p = place(b, foe('phantom'), 4, 4, 'enemy');
    face(p, link);
    expect(isFrontal(p, link, 1)).toBe(true);
    expect(forecast(b, link, { x: 3, y: 4 }, p).attacker.dmg).toBe(0);
    expect(phMultiplier(b, link, { x: 3, y: 4 }, p, false, WEAPONS.herosSword, 1)).toBe(0);
    // From behind (or the side) the armor doesn't help.
    expect(phMultiplier(b, link, { x: 5, y: 4 }, p, false, WEAPONS.herosSword, 1)).toBe(1);
    expect(phMultiplier(b, link, { x: 4, y: 3 }, p, false, WEAPONS.herosSword, 1)).toBe(1);
    // The Phantom Sword.
    link.weapons = ['phantomSword', ...link.weapons];
    expect(phMultiplier(b, link, { x: 3, y: 4 }, p, false, WEAPONS.phantomSword, 1)).toBe(2);
    link.weapons.shift();
    // Sacred Opening exposes it.
    castAbility(b, link, 'sacredOpening', rng(), p.uid);
    expect(phMultiplier(b, link, { x: 3, y: 4 }, p, false, WEAPONS.herosSword, 1)).toBe(1);
  });

  it('the Temple drains life outside Safe Zones once the Hourglass is empty; Phantoms can\'t enter Safe Zones', () => {
    const b = field(14, 9, 'templeOfTheOceanKing');
    const st = withHourglass(b, 1);
    st.temple = true;
    const a = place(b, hero('heroOfWinds'), 2, 2);
    const safe = place(b, hero('tetra'), 5, 5);
    b.tiles[5 * 14 + 5] = 'sacredSafeZone';
    startPhase(b, 'player');
    expect(st.energy).toBe(0);
    expect(a.hp).toBe(a.stats.hp);
    b.turn++;
    startPhase(b, 'player');
    expect(a.hp).toBeLessThan(a.stats.hp);
    expect(safe.hp).toBe(safe.stats.hp);
    const p = place(b, foe('phantom'), 9, 2, 'enemy');
    expect(tileCost(b, p, 'sacredSafeZone')).toBeGreaterThanOrEqual(99);
  });

  it('a Phantom Eye raises the alarm and Warp Phantoms teleport to whoever it spotted', () => {
    const b = field();
    const st = phState(b);
    const link = place(b, hero('heroOfWinds'), 2, 2);
    place(b, foe('phantomEye'), 4, 2, 'enemy');
    const wp = place(b, foe('warpPhantom'), 12, 8, 'enemy');
    startPhase(b, 'enemy');
    expect(st.alarm).toBeGreaterThan(0);
    expect(Math.abs(wp.x - link.x) + Math.abs(wp.y - link.y)).toBeLessThanOrEqual(2);
  });
});

describe('boss gimmicks', () => {
  it('Blaaz divides into three flames; a boomerang recombines them and leaves him exposed', () => {
    const b = field();
    const link = place(b, hero('heroOfWinds'), 2, 2);
    const bz = place(b, makeEnemy(BOSSES.blaaz, 'isleOfEmber', 5, 'bz', rng(), { boss: true }), 6, 2, 'enemy');
    bz.hp = Math.floor(bz.stats.hp * 0.6);
    phAfterHit(b, link, bz, 5, WEAPONS.herosSword);
    const flames = b.units.filter((u) => u.artId === 'blaazFlame');
    expect(flames.length).toBe(3);
    expect(phMultiplier(b, link, link, bz, false, WEAPONS.herosSword, 1)).toBe(0);
    phAfterHit(b, link, flames[0], 3, WEAPONS.boomerang);
    expect(b.units.filter((u) => u.artId === 'blaazFlame').length).toBe(0);
    expect(phMultiplier(b, link, link, bz, false, WEAPONS.herosSword, 1)).toBeGreaterThan(1);
  });

  it('Cyclok is out of melee reach until an explosive goes up a Whirlwind', () => {
    const b = field();
    const link = place(b, hero('heroOfWinds'), 2, 2);
    const cy = place(b, makeEnemy(BOSSES.cyclok, 'isleOfGust', 5, 'cy', rng(), { boss: true }), 3, 2, 'enemy');
    expect(forecast(b, link, { x: 2, y: 2 }, cy).attacker.attacks).toBe(0);
    b.tiles[1 * 14 + 2] = 'whirlwind';
    const lines = phOnBlast(b, link, { x: 2, y: 1 }, 1, 12);
    expect(lines.join(' ')).toMatch(/crashes/);
    expect(forecast(b, link, { x: 2, y: 2 }, cy).attacker.attacks).toBeGreaterThan(0);
  });

  it('Crayk hides while its shell holds; four hits break it', () => {
    const b = field();
    const link = place(b, hero('heroOfWinds'), 2, 2);
    const cr = place(b, makeEnemy(BOSSES.crayk, 'molidaIsland', 5, 'cr', rng(), { boss: true }), 4, 2, 'enemy');
    phantomBattleStart(b);
    expect(cr.hidden).toBe(true);
    for (let i = 0; i < 4; i++) phAfterHit(b, link, cr, 2, WEAPONS.herosSword);
    expect(cr.phShellBroken).toBe(true);
    expect(cr.hidden).toBe(false);
  });

  it('Dongorongo\'s front is armored until a blast knocks it over; Eox loses joints', () => {
    const b = field();
    const link = place(b, hero('heroOfWinds'), 2, 2);
    const dg = place(b, makeEnemy(BOSSES.dongorongo, 'goronIsland', 5, 'dg', rng(), { boss: true }), 5, 1, 'enemy');
    face(dg, link);
    expect(phMultiplier(b, link, link, dg, false, WEAPONS.herosSword, 2)).toBeCloseTo(0.2);
    phOnBlast(b, link, { x: 5, y: 2 }, 1, 12);
    expect(phMultiplier(b, link, link, dg, false, WEAPONS.herosSword, 2)).toBeCloseTo(1.5);
    const eox = place(b, makeEnemy(BOSSES.eox, 'isleOfRuins', 5, 'ex', rng(), { boss: true }), 8, 3, 'enemy');
    phantomBattleStart(b);
    expect(eox.phJoints).toBe(4);
    expect(phMultiplier(b, link, link, eox, false, WEAPONS.herosSword, 1)).toBe(0.5);
    phAfterHit(b, link, eox, 30, WEAPONS.megatonHammer);
    expect(eox.phJoints).toBe(3);
  });

  it('the Cubus Sisters\' volley rebounds; all four together are stronger', () => {
    const b = field();
    const link = place(b, hero('heroOfWinds'), 2, 2);
    const s1 = place(b, makeEnemy(BOSSES.cubusSister1, 'ghostShipPH', 5, 'c1', rng(), { boss: true }), 4, 2, 'enemy');
    for (const [i, n] of [2, 3, 4].entries()) place(b, makeEnemy(BOSSES[`cubusSister${n}`], 'ghostShipPH', 5, `c${n}`, rng(), { boss: true }), 5, 1 + i * 2, 'enemy');
    const fc = forecast(b, s1, { x: 4, y: 2 }, link);
    const solo = field();
    const l2 = place(solo, hero('heroOfWinds'), 2, 2);
    const t1 = place(solo, makeEnemy(BOSSES.cubusSister1, 'ghostShipPH', 5, 'c1', rng(), { boss: true }), 4, 2, 'enemy');
    expect(fc.attacker.dmg).toBeGreaterThan(forecast(solo, t1, { x: 4, y: 2 }, l2).attacker.dmg);
    expect(unusableReason(b, s1, ABILITIES.combinedBarrage)).toBeNull();
    expect(unusableReason(solo, t1, ABILITIES.combinedBarrage)).toBe('Needs all four sisters');
  });

  it('Bellum feeds on the fallen and possesses Linebeck, who becomes Bellumbeck; time stops expose Bellumbeck\'s eye', () => {
    const b = field(16, 10, 'templeOfTheOceanKing');
    withHourglass(b, 20);
    const lb = place(b, hero('linebeck'), 4, 4);
    const link = place(b, hero('heroOfWinds'), 3, 3);
    const bel = place(b, makeEnemy(BOSSES.bellum, 'templeOfTheOceanKing', 6, 'bel', rng(), { boss: true }), 6, 4, 'enemy');
    bel.hp = 50;
    const victim = place(b, hero('tetra'), 5, 8);
    phOnKill(b, bel, victim, rng());
    expect(bel.hp).toBeGreaterThan(50);
    castAbility(b, bel, 'bellumPossession', rng(), lb.uid);
    expect(lb.team).toBe('enemy');
    expect(lb.templateId).toBe('bellumbeck');
    face(lb, link);
    expect(phMultiplier(b, link, link, lb, false, WEAPONS.herosSword, 1)).toBeCloseTo(0.25);
    castAbility(b, link, 'timeFreeze', rng());
    expect(phMultiplier(b, link, link, lb, false, WEAPONS.herosSword, 1)).toBeCloseTo(1.5);
    // The possession ends: Linebeck again, on your side.
    lb.phPossessed!.turns = 1;
    phStartPhase(b, lb, []);
    expect(lb.team).toBe('player');
    expect(lb.templateId).toBe('linebeck');
  });
});

describe('ships, spirits and units', () => {
  it('steamships have the eight part slots; four matching parts give the partial set bonus, iron parts cut damage', () => {
    const ship = hero('ssLinebeck');
    expect(vesselHasSlot(ship, 'chimney')).toBe(true);
    expect(vesselHasSlot(ship, 'sail')).toBe(false);
    expect(vesselHasSlot(hero('sailingBoat'), 'chimney')).toBe(false);
    ship.gear = { hull: shipPartId('iron', 'hull'), cannonMount: shipPartId('iron', 'cannonMount'), prow: shipPartId('iron', 'prow'), anchor: shipPartId('iron', 'anchor') };
    expect(setLevel(ship, 'iron')).toBe(1);
    const b = field(14, 9, 'bellumsWaters');
    const attacker = place(b, hero('heroOfWinds'), 2, 2);
    const s = place(b, ship, 3, 3);
    expect(phMultiplier(b, attacker, attacker, s, false, WEAPONS.herosSword, 1)).toBeCloseTo(0.85);
    ship.gear = { ...ship.gear, handrail: shipPartId('barrel', 'handrail') };
    expect(capacityOf(hero('ssLinebeck'))).toBe(4);
    const barrel = hero('ssLinebeck');
    barrel.gear = Object.fromEntries(SHIP_SLOTS.map((sl) => [sl, shipPartId('barrel', sl)]));
    expect(capacityOf(barrel)).toBe(6);
  });

  it('Spirit Gems raise the Spirits\' levels at 10 and 20', () => {
    const run = newRun(4, 'ciela', 'phantom');
    expect(spiritLevel(run, 'ciela')).toBe(0);
    for (let i = 0; i < 10; i++) run.questItems!.push('courageSpiritGem');
    expect(spiritLevel(run, 'ciela')).toBe(1);
    for (let i = 0; i < 10; i++) run.questItems!.push('courageSpiritGem');
    expect(spiritLevel(run, 'ciela')).toBe(2);
  });

  it('the Anouki never freeze; the Chief strengthens them; Yook resist ice', () => {
    const b = field(14, 9, 'isleOfFrost');
    const chief = place(b, hero('anoukiChief'), 2, 2);
    const w = place(b, hero('anoukiWarrior'), 3, 2);
    const y = place(b, foe('yookWarrior'), 6, 2, 'enemy');
    w.statuses.push({ kind: 'freeze', turns: 2 });
    startPhase(b, 'player');
    expect(w.statuses.some((s) => s.kind === 'freeze')).toBe(false);
    expect(forecast(b, y, { x: 4, y: 2 }, w).defender).toBeDefined();
    const fcWith = forecast(b, y, { x: 4, y: 2 }, w).attacker.dmg;
    b.units = b.units.filter((u) => u !== chief);
    expect(forecast(b, y, { x: 4, y: 2 }, w).attacker.dmg).toBeGreaterThanOrEqual(fcWith);
    expect(phMultiplier(b, w, w, y, true, WEAPONS.frostSpell, 2, 'ice')).toBe(0.5);
  });

  it('the Potion Shop Lady heals 30% more and can remedy an ally 2 spaces away for free; Subrosians dance and repair', () => {
    const b = field();
    const lady = place(b, hero('potionShopLady'), 2, 2);
    const ally = place(b, hero('heroOfWinds'), 4, 2);
    ally.hp = 5;
    lady.pack = [{ id: 'redPotion', uses: 1 }];
    const res = castAbility(b, lady, 'quickRemedy', rng(), ally.uid);
    expect(res?.free).toBe(true);
    expect(ally.hp).toBeGreaterThan(5);
    const d = place(b, hero('subrosianDancer'), 5, 2);
    ally.acted = true;
    castAbility(b, d, 'subrosianDanceAct', rng(), ally.uid);
    expect(ally.acted).toBe(false);
  });
});

describe('the phantom campaign', () => {
  it('starts on Mercay Island with the Phantom Hourglass, the Hero of Winds and a steamship', () => {
    const run = newRun(9, 'jolene', 'phantom');
    expect(run.region).toBe(phantomStartRegion());
    expect(run.region).toBe('mercayIsland');
    expect(run.questItems).toContain('phantomHourglass');
    expect(run.roster.some((u) => u.templateId === 'heroOfWinds')).toBe(true);
    expect(run.roster.some((u) => u.templateId === 'jolenesShip')).toBe(true);
    // A Temple floor and a sea crossing on the island's map.
    expect(run.map.nodes.some((n) => n.type === 'dungeon' && n.world === 'templeOfTheOceanKing')).toBe(true);
    expect(run.map.nodes.some((n) => n.naval && isNavalNode(run, n))).toBe(true);
    const r2 = newRun(9, 'linebeck', 'phantom');
    expect(r2.roster.filter((u) => u.templateId === 'ssLinebeck').length).toBe(1);
  });

  it('follows the route and its sea charts, and rewards the bosses', () => {
    const run = newRun(12, 'linebeck', 'phantom') as RunWithEvent;
    expect(phantomRegionOptions(run, rng())).toEqual(['isleOfEmber']);
    run.region = 'molidaIsland';
    expect(phantomRegionOptions(run, rng())).toEqual(['molidaIsland']);
    run.questItems!.push('northwesternSeaChart');
    expect(phantomRegionOptions(run, rng())).toEqual(['ghostShipPH']);
    run.region = 'goronIsland';
    const b = createBattle({ world: 'goronIsland', nodeType: 'boss', depth: 30, roster: run.roster, seed: 3, boss: BOSSES.dongorongo });
    b.result = 'won';
    b.fallen.push(...b.units.filter((u) => u.isBoss));
    const lines = phantomAfterBattle(run, b, true, rng());
    expect(run.questItems).toContain('crimsonine');
    expect(run.questItems).toContain('northeasternSeaChart');
    expect(phantomOf(run).beaten).toContain('dongorongo');
    expect(lines.length).toBeGreaterThan(0);
    offerRegions(run);
    expect((run.event as { options: string[] }).options).toEqual(['isleOfFrost']);
  });

  it('the Temple of the Ocean King gets deeper: cleared floors become a shortcut', () => {
    const run = newRun(21, 'ciela', 'phantom') as RunWithEvent;
    const t = run.map.nodes.find((n) => n.type === 'dungeon' && n.world === 'templeOfTheOceanKing')!;
    phantomOf(run).templeFloor = 3;
    // Walk to the temple node.
    run.currentNodeId = null;
    const path: string[] = [];
    const find = (id: string): boolean => { const n = run.map.nodes.find((m) => m.id === id)!; if (n === t) return true; for (const nx of n.next) { if (find(nx)) { path.unshift(nx); return true; } } return false; };
    const start = run.map.nodes.find((n) => n.row === 0 && (n === t || find(n.id)))!;
    path.unshift(start.id);
    run.currentNodeId = path.length > 1 ? path[path.length - 2] : null;
    enterNode(run, t.id);
    expect(run.dungeon).toEqual({ floor: 3, of: 5 });
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    expect(run.battle?.world).toBe('templeOfTheOceanKing');
    expect(run.battle?.ph?.temple).toBe(true);
    expect(run.battle?.ph?.hourglass).toBe(true);
    expect(run.battle?.ph?.templeFloor).toBe(3);
  });

  it('battles in every phantom region (and at sea) set up and play a few rounds without errors', () => {
    const run = newRun(51, 'linebeck', 'phantom') as RunWithEvent;
    for (const [i, r] of PHANTOM_ROUTE.entries()) {
      const boss = i % 3 === 0 ? BOSSES[PH_ROUTE_BOSSES[r][0]] : undefined;
      const b = createBattle({ world: r, nodeType: boss ? 'boss' : 'battle', depth: 4 + i * 2, roster: run.roster, seed: 100 + i, boss, naval: !!WORLDS[r].naval || i === 2 });
      phantomBattleSetup(run, b, rng(i));
      const rr = rng(i);
      for (let turn = 0; turn < 3 && !checkResult(b); turn++) {
        for (const team of ['player', 'enemy'] as const) {
          startPhase(b, team);
          for (const u of b.units.filter((x) => x.team === team)) {
            if (!b.units.includes(u) || u.acted) continue;
            const plan = planAction(b, u);
            moveUnit(u, plan.dest.x, plan.dest.y, plan.path.length - 1);
            const t = plan.action && b.units.find((x) => x.uid === plan.action!.target);
            if (t && plan.action!.type === 'attack') resolveCombat(b, u, t, rr, plan.action!.weaponId);
            u.acted = true;
            if (checkResult(b)) break;
          }
        }
        environmentPhase(b);
        b.turn++;
      }
      expect(b.tiles.length, r).toBe(b.width * b.height);
    }
  });

  it('plays the first battle of a phantom campaign from the map', () => {
    const run = newRun(77, 'kingMutoh', 'phantom') as RunWithEvent;
    const node = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    expect(run.battle).toBeTruthy();
    expect(run.battle!.units.some((u) => u.team === 'enemy')).toBe(true);
    expect(run.battle!.ph?.hourglass).toBe(true);
  });
});
