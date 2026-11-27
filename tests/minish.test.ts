import { describe, expect, it } from 'vitest';
import { ABILITIES, BOSSES, COMMANDERS, ENEMIES, GEAR, ITEMS, REGION_BOSSES, ROSTERS, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { MC_ROUTE_BOSSES, MINISH_CAP, MINISH_ROUTE } from '../src/content/minish';
import { GROUP_SUPPORTS, SUPPORT_REGISTRY } from '../src/content/supports';
import { castAbility, enemyAutoTransform, unusableReason } from '../src/engine/abilities';
import { createBattle } from '../src/engine/battle';
import { forecast } from '../src/engine/combat';
import { computeMoves, keyOf, tileCost, unitAt, unitDist } from '../src/engine/grid';
import { blastVictims } from '../src/engine/items';
import { isMicro, mcAfterMove, MICRO_CAP, microBeforeFinish, microRoom, placeMicroAtStart, sharesTile, unitsAt } from '../src/engine/micro';
import { minishBeforeFinish, minishBattleStart, mnSaveFromDeath, mnState, startMicroDungeon } from '../src/engine/minish';
import { applyMinishEffect, doMinishCamp, fuseKinstones, minishAfterBattle, minishCampOptions, minishOf, minishRegionOptions, minishStartRegion, swordStage } from '../src/engine/minishRun';
import { INF } from '../src/engine/rules';
import { RNG } from '../src/engine/rng';
import { availableNodes, enterNode, newRun, startBattle, type RunWithEvent } from '../src/engine/run';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = (s = 11) => new RNG(s);
function field(w = 12, h = 8, world = 'minishWoods'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'minishWoods', lvl, uid, rng());

const NAMED = ['heroOfMinish', 'microLink', 'zeldaMC', 'ezloMinish', 'ezloCap', 'vaatiMinish', 'vaatiHylian', 'kingDaltus', 'potho', 'smith', 'melari', 'festari',
  'gentari', 'librari', 'percy', 'gregal', 'swiftblade', 'greatblade', 'grimblade', 'swiftbladeFirst'];
const GENERIC = ['forestMinishScout', 'forestMinishHealer', 'mountainMinishWarrior', 'mountainMinishBlacksmith', 'townMinishThief', 'townMinishTinkerer'];
const MONSTERS = ['pesto', 'puffstool', 'spinyBeetle', 'rollobite', 'eyegoreStatue', 'ballChainSoldier'];
const BOSS_IDS = ['bigGreenChuchu', 'bigOctorok', 'gleerok', 'mazaal', 'gyorgFemale', 'gyorgMale', 'vaatiReborn', 'vaatiTransfigured', 'vaatisWrath'];
const MINI = ['bigBlueChuchu', 'madderpillar', 'spinyChuchu', 'silverDarknut', 'redDarknut', 'blackKnight'];

describe('The Minish Cap content', () => {
  it('registers all 47 units, recruitable and with art, with the doc\'s stats and sizes', () => {
    const all = [...NAMED, ...GENERIC, ...MONSTERS, ...BOSS_IDS, ...MINI];
    expect(all.length).toBe(47);
    for (const id of all) {
      expect(TEMPLATES[id], id).toBeDefined();
      expect(artFor(id), id).not.toBeNull();
    }
    expect(TEMPLATES.heroOfMinish.stats).toEqual({ hp: 28, str: 13, mag: 5, skl: 16, spd: 14, def: 9, res: 7, lck: 15, con: 8, mov: 6, sta: 30, mp: 20 });
    expect(TEMPLATES.microLink.stats).toMatchObject({ hp: 22, str: 12, skl: 18, spd: 17, def: 5, con: 1, mov: 7 });
    expect(TEMPLATES.vaatiHylian.stats).toMatchObject({ hp: 38, mag: 32, mp: 75 });
    expect(BOSSES.vaatisWrath.stats).toMatchObject({ hp: 125, str: 32, mag: 40, def: 28, mp: 100 });
    expect(BOSSES.blackKnight.stats).toMatchObject({ hp: 65, str: 29, skl: 25, def: 28 });
    expect(ENEMIES.ballChainSoldier.stats).toMatchObject({ hp: 52, str: 25, def: 23, con: 28 });
    // Sizes: Micro units are size 0.
    for (const id of ['microLink', 'ezloMinish', 'ezloCap', 'vaatiMinish', 'melari', 'festari', 'gentari', 'librari', ...GENERIC, 'pesto', 'puffstool', 'rollobite', 'madderpillar']) expect(TEMPLATES[id].size, id).toBe(0);
    expect(BOSSES.gleerok.size).toBe(4); expect(BOSSES.gyorgMale.size).toBe(3); expect(BOSSES.vaatiReborn.size).toBe(2);
    // Micro Link and the Cap form are forms, but recruitable on their own; the forms of one person never share an army.
    expect(TEMPLATES.microLink.formOf).toBe('heroOfMinish');
    expect(TEMPLATES.heroOfMinish.exclusiveWith).toContain('microLink');
    expect(TEMPLATES.vaatiHylian.exclusiveWith).toEqual(expect.arrayContaining(['vaatiMinish', 'vaatiReborn', 'vaatisWrath']));
    // Reused entries.
    for (const id of ['whiteSword', 'magicalBoomerang']) expect(WEAPONS[id], id).toBeDefined();
    for (const id of ['rocsCape', 'pegasusBoots', 'powerBracelets', 'zorasFlippers', 'mirrorShield']) expect(GEAR[id], id).toBeDefined();
    for (const id of ['gustJar', 'flameLantern', 'remoteBomb', 'redPicolyte', 'minishMushroom']) expect(ITEMS[id], id).toBeDefined();
    expect(MINISH_CAP.regions.map((r) => r.id)).toEqual(MINISH_ROUTE);
    expect(MINISH_ROUTE.length).toBe(16);
    for (const r of MINISH_ROUTE) { expect(WORLDS[r].campaign).toBe('minish'); expect(ROSTERS[r]?.length, r).toBeGreaterThan(3); expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0); }
    expect(MC_ROUTE_BOSSES.deepwoodShrine).toEqual(['bigGreenChuchu']);
    expect(MC_ROUTE_BOSSES.templeOfDroplets).toEqual(['bigBlueChuchu', 'bigOctorok']);
    expect(MC_ROUTE_BOSSES.palaceOfWinds).toEqual(['gyorgFemale', 'gyorgMale']);
    expect(COMMANDERS.filter((c) => c.campaign === 'minish').map((c) => c.heroId)).toEqual(['heroOfMinish', 'ezloMinish', 'zeldaMC', 'melari', 'kingDaltus', 'swiftblade', 'vaatiHylian']);
    expect(SUPPORT_REGISTRY.filter((p) => p.game === 'minish').length).toBe(68);
    expect(GROUP_SUPPORTS.filter((g) => ['picoriLegend', 'unitedMinish', 'masterForgers', 'bladeBrotherhood', 'herosCompanions', 'forbiddenAmbitionGroup', 'ancientGuardians'].includes(g.id)).length).toBe(7);
  });
});

describe('Micro units (base game)', () => {
  it('a size-0 template makes a one-tile Micro unit that never blocks and shares tiles (four at most)', () => {
    const b = field();
    const link = place(b, hero('heroOfMinish'), 3, 3);
    const m = place(b, hero('festari'), 3, 3);
    expect(isMicro(m)).toBe(true);
    expect(m.size).toBe(1);
    expect(unitAt(b, 3, 3)).toBe(link);
    expect(unitsAt(b, 3, 3)).toEqual([link, m]);
    expect(sharesTile(m, link)).toBe(true);
    expect(unitDist(m, link)).toBe(1);
    expect(unitDist(link, link)).toBe(0);
    expect(microRoom(b, 3, 3)).toBe(MICRO_CAP - 1);
    // A normal unit can stop on a tile that only holds Micro units; Micro units pass through enemies.
    const foeN = place(b, foe('spinyBeetle'), 5, 3, 'enemy');
    const m2 = place(b, hero('forestMinishScout', 's2'), 7, 3);
    const mv = computeMoves(b, m2, 6);
    expect(mv.reach.has(keyOf(b, 5, 3))).toBe(true);
    expect(mv.reach.has(keyOf(b, 3, 3))).toBe(true);
    const sold = place(b, hero('hyruleSoldier', 'hs'), 2, 6);
    const placedOnMicro = place(b, hero('forestMinishHealer', 'h1'), 2, 5);
    expect(computeMoves(b, sold, 4).reach.has(keyOf(b, 2, 5))).toBe(true);
    void placedOnMicro; void foeN;
    // The four-per-tile limit.
    for (let i = 0; i < 3; i++) place(b, hero('forestMinishScout', `f${i}`), 9, 1);
    expect(microRoom(b, 9, 1)).toBe(1);
    place(b, hero('forestMinishScout', 'f3'), 9, 1);
    expect(computeMoves(b, m2, 6).reach.has(keyOf(b, 9, 1))).toBe(false);
  });

  it('Micro vs Normal deals 25% (unless a weak point is open); Normal vs Micro gets −60 Hit; Micro vs Micro is standard', () => {
    const b = field();
    const ml = place(b, hero('microLink'), 3, 3);
    const beetle = place(b, foe('spinyBeetle', 'sb', 3), 4, 3, 'enemy');
    const pesto = place(b, foe('pesto', 'p1', 3), 3, 4, 'enemy');
    const vsNormal = forecast(b, ml, ml, beetle, 'minishSword').attacker;
    const full = forecast({ ...b, units: b.units } as Battle, { ...ml, micro: undefined } as Unit, ml, beetle, 'minishSword').attacker;
    expect(vsNormal.dmg).toBe(Math.floor(full.dmg * 0.25));
    beetle.buffs.push({ id: 'mcWeakPoint', name: 'Weak point', turns: 2, stats: { def: -5 } });
    expect(forecast(b, ml, ml, beetle, 'minishSword').attacker.dmg).toBeGreaterThan(vsNormal.dmg * 2);
    const soldier = place(b, hero('hyruleSoldier', 'hs'), 2, 3);
    const toMicro = forecast(b, soldier, soldier, ml).attacker;
    const toNormal = forecast(b, soldier, soldier, { ...ml, micro: undefined } as Unit).attacker;
    expect(toMicro.hit).toBe(Math.max(0, toNormal.hit - 60));
    const mm = forecast(b, ml, ml, pesto, 'minishSword').attacker;
    expect(mm.hit).toBeGreaterThan(40);
    // Area attacks (bombs) hit both sizes on the spaces they cover.
    const both = blastVictims(b, soldier, ITEMS.remoteBomb, { x: 3, y: 3 });
    expect(both).toEqual(expect.arrayContaining([beetle, pesto]));
  });

  it('Hitch Ride: a rider moves with its host; deployment puts Micro units on larger allies', () => {
    const b = field();
    const host = place(b, hero('heroOfMinish'), 2, 2);
    const rider = place(b, hero('mountainMinishBlacksmith', 'mb'), 2, 2);
    expect(unusableReason(b, rider, ABILITIES.mcHitchRide)).toBeNull();
    const res = castAbility(b, rider, 'mcHitchRide', rng());
    expect(res?.free).toBe(true);
    expect(rider.mcRide?.host).toBe(host.uid);
    host.x = 6; host.y = 5;
    mcAfterMove(b, host);
    expect([rider.x, rider.y]).toEqual([6, 5]);
    // Walking away ends the ride.
    rider.x = 7;
    mcAfterMove(b, rider);
    expect(rider.mcRide).toBeUndefined();
    const b2 = field();
    const h2 = place(b2, hero('swiftblade'), 1, 1);
    const m = place(b2, hero('forestMinishScout', 'fs'), 1, 3);
    placeMicroAtStart(b2);
    expect([m.x, m.y]).toEqual([1, 1]);
    expect(m.mcRide?.host).toBe(h2.uid);
  });

  it('infiltration actions, internal strikes and stomping', () => {
    const b = field();
    const thief = place(b, hero('townMinishTinkerer', 'tk', 6), 4, 4);
    const statue = place(b, foe('eyegoreStatue', 'eg', 3), 4, 4, 'enemy');
    expect(unusableReason(b, thief, ABILITIES.mcSabotage)).toBeNull();
    castAbility(b, thief, 'mcSabotage', rng(), statue.uid);
    expect(statue.buffs.some((x) => x.id === 'mcSabotaged')).toBe(true);
    thief.acted = false;
    castAbility(b, thief, 'mcExposeWeakPoint', rng(), statue.uid);
    expect(statue.buffs.some((x) => x.id === 'mcWeakPoint')).toBe(true);
    const hp = statue.hp;
    castAbility(b, thief, 'mcInternalStrike', rng(), statue.uid);
    expect(statue.hp).toBeLessThan(hp);
    // A normal unit with an enemy Micro unit underfoot stomps it (the enemy AI does it on its own).
    const b2 = field();
    const pesto = place(b2, foe('pesto', 'pe', 2), 3, 3, 'enemy');
    const ml = place(b2, hero('microLink', 'ml', 3), 3, 3);
    const big = place(b2, foe('ballChainSoldier', 'bc', 8), 3, 3, 'enemy');
    void pesto;
    let hit = false;
    for (let s = 1; s < 10 && !hit; s++) { const before = ml.hp; enemyAutoTransform(b2, big, new RNG(s)); hit = ml.hp < before; ml.hp = ml.stats.hp; }
    expect(hit).toBe(true);
  });

  it('shrinking and growing: the doc\'s modifiers, Link becomes Micro Link, growing needs room', () => {
    const b = field();
    b.tiles[keyOf(b, 2, 2)] = 'minishPortal';
    const s = place(b, hero('swiftblade', 'sw', 5), 2, 2);
    const before = { ...s.stats };
    castAbility(b, s, 'mcShrink', rng());
    expect(isMicro(s)).toBe(true);
    expect(s.stats.hp).toBe(Math.round(before.hp * 0.8));
    expect(s.stats.def).toBe(Math.round(before.def * 0.6));
    expect(s.stats.con).toBeLessThanOrEqual(2);
    expect(s.buffs.find((x) => x.id === 'mcShrink')?.stats).toEqual({ skl: 2, spd: 3, mov: 1 });
    // Someone normal-sized on the spot: no room to grow.
    const block = place(b, hero('hyruleKnight', 'hk'), 2, 2);
    expect(unusableReason(b, s, ABILITIES.mcGrow)).toBe('Not enough room to grow');
    b.units = b.units.filter((x) => x !== block);
    castAbility(b, s, 'mcGrow', rng());
    expect(isMicro(s)).toBe(false);
    expect(s.stats.hp).toBe(before.hp);
    const link = place(b, hero('heroOfMinish', 'lk'), 2, 3);
    link.x = 2; link.y = 2;
    castAbility(b, link, 'mcShrink', rng());
    expect(link.templateId).toBe('microLink');
    expect(isMicro(link)).toBe(true);
    // After the battle, a shrunk unit is restored.
    castAbility(b, s, 'mcShrink', rng());
    microBeforeFinish(b);
    expect(isMicro(s)).toBe(false);
    expect(s.stats.def).toBe(before.def);
    // The size-dependent terrain: separate movement networks.
    const ml = hero('microLink', 'm2');
    expect(tileCost(b, prepareForBattle(ml), 'microPassage')).toBe(1);
    expect(tileCost(b, prepareForBattle(hero('hyruleSoldier', 'x')), 'microPassage')).toBe(INF);
    expect(tileCost(b, prepareForBattle(ml), 'puddle')).toBe(INF);
    expect(tileCost(b, prepareForBattle(hero('hyruleSoldier', 'y')), 'puddle')).toBe(1);
  });
});

describe('The Minish Cap mechanics', () => {
  it('Four Sword Split makes duplicates by infusion stage; they fade and are never casualties', () => {
    const b = field();
    const link = place(b, hero('heroOfMinish', 'lk', 8), 5, 4);
    link.weapons = ['whiteSwordThree'];
    link.mp = link.stats.mp = 40;
    castAbility(b, link, 'fourSwordSplit', rng());
    const dups = b.units.filter((u) => u.mnDup !== undefined);
    expect(dups.length).toBe(2);
    expect(dups[0].stats.hp).toBe(Math.max(1, Math.round(link.stats.hp * 0.4)));
    expect(dups[0].pack).toEqual([]);
    expect(unusableReason(b, dups[0], ABILITIES.fourSwordSplit)).not.toBeNull();
    b.fallen.push(dups[1]);
    minishBeforeFinish(b);
    expect(b.units.some((u) => u.mnDup !== undefined)).toBe(false);
    expect(b.fallen.length).toBe(0);
  });

  it('Mazaal resists everything but Micro internal strikes; Vaati changes shape twice', () => {
    const b = field(16, 10, 'fortressOfWinds');
    const m = place(b, foe('mazaal', 'mz', 6), 8, 2, 'enemy');
    m.isBoss = true;
    const sword = place(b, hero('swiftblade', 'sw', 6), 7, 2);
    const before = forecast(b, sword, sword, m).attacker.dmg;
    const tk = place(b, hero('mountainMinishWarrior', 'mw', 6), 8, 2);
    castAbility(b, tk, 'mcInternalStrike', rng(), m.uid);
    expect(m.buffs.some((x) => x.id === 'mcExposedCore')).toBe(true);
    expect(forecast(b, sword, sword, m).attacker.dmg).toBeGreaterThan(before * 2);
    const b2 = field(16, 10, 'darkHyruleCastle');
    const v = place(b2, makeEnemy(BOSSES.vaatiReborn, 'darkHyruleCastle', 6, 'v', rng(), { boss: true }), 6, 4, 'enemy');
    minishBattleStart(b2);
    expect(mnSaveFromDeath(b2, v)?.line).toContain('Vaati Transfigured');
    expect(v.bossId).toBe('vaatiTransfigured');
    expect(v.size).toBe(3);
    expect(mnSaveFromDeath(b2, v)).not.toBeNull();
    expect(v.bossId).toBe('vaatisWrath');
    expect(mnSaveFromDeath(b2, v)).toBeNull();
  });

  it('the campaign: sixteen regions in order, Kinstone fusion, the Picori Blade to the Four Sword, figurines, camp facilities', () => {
    const run = newRun(5, 'heroOfMinish', 'minish');
    expect(run.campaign).toBe('minish');
    expect(run.region).toBe(minishStartRegion());
    expect(run.questItems).toContain('kinstoneBag');
    expect(minishRegionOptions(run, rng())).toEqual(['minishWoods']);
    run.questItems!.push('kinstoneGreen', 'kinstoneGreen', 'kinstoneGold', 'kinstoneGold');
    const greens = run.questItems!.filter((x) => x === 'kinstoneGreen').length;
    expect(fuseKinstones(run, 'green', rng())).toContain('Fusion');
    expect(run.questItems!.filter((x) => x === 'kinstoneGreen').length).toBe(greens - 2);
    expect(fuseKinstones(run, 'gold', rng())).toContain('Golden');
    // The blade: broken -> Melari's White Sword -> 2, 3 and 4 Elements.
    expect(swordStage(run)).toBe('picoriBlade');
    run.questItems!.push('brokenPicoriBlade');
    expect(applyMinishEffect(run, { kind: 'minish', op: 'reforge' }, rng())).toContain('White Sword');
    const link = run.roster.find((u) => u.templateId === 'heroOfMinish')!;
    expect(link.weapons[0]).toBe('whiteSword');
    run.questItems!.push('earthElement', 'fireElement');
    const fake = { nodeType: 'boss', world: 'templeOfDroplets', fallen: [], units: [], rewardRupees: 500 } as unknown as Battle;
    minishAfterBattle(run, fake, true, rng());
    expect(run.questItems).toContain('waterElement');
    expect(link.weapons[0]).toBe('whiteSwordThree');
    run.questItems!.push('windElement');
    expect(swordStage(run)).toBe('fourSword');
    // Figurines (Hyrule Archives entries) for Mysterious Shells.
    for (let i = 0; i < 5; i++) run.questItems!.push('mysteriousShell');
    expect(applyMinishEffect(run, { kind: 'minish', op: 'figurine' }, rng())).toContain('figurine');
    expect(minishOf(run).figurines.length).toBe(1);
    // Camp facilities.
    const facilities = new Set(minishCampOptions(run, 'camp').map((o) => o.facility));
    expect([...facilities].sort()).toEqual(['dojo', 'exchange', 'forge', 'gallery', 'garden', 'settlement']);
    run.rupees = 1000;
    expect(doMinishCamp(run, 'picolyte', rng(), undefined, 'yellowPicolyte')).toContain('Yellow Picolyte');
    expect(run.convoy).toContain('yellowPicolyte');
  });

  it('a Minish battle runs with Micro units on both sides (and the Micro dungeons shrink the army)', () => {
    const run = newRun(9, 'ezloMinish', 'minish') as RunWithEvent;
    const node = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    const b = run.battle!;
    expect(b.units.some((u) => u.team === 'player' && isMicro(u))).toBe(true);
    expect(b.tiles.some((t) => t === 'minishPortal')).toBe(true);
    // Micro dungeon.
    const b2 = createBattle({ world: 'minishVillage', nodeType: 'dungeon', depth: 3, roster: [hero('swiftblade', 'sw2')], seed: 4 });
    startMicroDungeon(b2, rng());
    expect(mnState(b2).microDungeon).toBe(true);
    expect(b2.units.filter((u) => u.team === 'player').every(isMicro)).toBe(true);
    expect(b2.tiles.some((t) => t === 'bookshelf' || t === 'puddle')).toBe(true);
  });
});
