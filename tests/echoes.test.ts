import { describe, expect, it } from 'vitest';
import { ABILITIES, BOSSES, COMMANDERS, ENEMIES, GEAR, ITEMS, REGION_BOSSES, ROSTERS, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { ECHOES_OF_WISDOM, ECHOES_ROUTE, EO_ROUTE_BOSSES, TRI_CAPACITY, resolveEchoesFallbacks } from '../src/content/echoes';
import { DEFERRED_GROUPS_EOW, GROUP_SUPPORTS, SUPPORT_REGISTRY } from '../src/content/supports';
import { castAbility, unusableReason } from '../src/engine/abilities';
import { startPhase } from '../src/engine/battle';
import { forecast } from '../src/engine/combat';
import { keyOf } from '../src/engine/grid';
import { echoCapacity, echoCost, echoesBattleStart, echoesBeforeFinish, echoUsed, eoState, isEchoEligible } from '../src/engine/echoes';
import { blendSmoothie, echoesAfterBattle, echoesOf, echoesRegionOptions, smoothieOptions, triLevel } from '../src/engine/echoesRun';
import { RNG } from '../src/engine/rng';
import { availableNodes, enterNode, newRun, startBattle, type RunWithEvent } from '../src/engine/run';
import { addStatus } from '../src/engine/status';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, CommanderDef, EnemyArchetype, Terrain, Unit } from '../src/engine/types';

const rng = (s = 11) => new RNG(s);
function field(w = 12, h = 8, world = 'suthornForest'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'suthornForest', lvl, uid, rng());

const NAMED = ['zeldaEoW', 'linkEoW', 'tri', 'kingEoW', 'generalWright', 'ministerLefte', 'impaEoW', 'lueburry', 'dampeEoW', 'darston', 'chiefSeera', 'dohna',
  'dradd', 'kushara', 'conde', 'stampGuy', 'tekom'];
const BOSS_IDS = ['seismicTalus', 'mogryph', 'vocavor', 'skorchill', 'bori', 'nullEoW'];
const MONSTERS = ['ignizol', 'hydrozol', 'caromadillo', 'tornando', 'ribbitune', 'drippitune', 'holmill', 'platboom', 'strandtula', 'crawltula', 'tweelus', 'chompfin'];
const AUTOMATONS = ['techtite', 'tocktorok', 'gizmol', 'highTekuBaba', 'roboblin', 'goldfinch'];

describe('Echoes of Wisdom content', () => {
  it('registers all 41 units, recruitable and with art, with the doc\'s stats and sizes', () => {
    const all = [...NAMED, ...BOSS_IDS, ...MONSTERS, ...AUTOMATONS];
    expect(all.length).toBe(41);
    for (const id of all) { expect(TEMPLATES[id], id).toBeDefined(); expect(artFor(id), id).not.toBeNull(); }
    expect(TEMPLATES.zeldaEoW.stats).toEqual({ hp: 32, str: 6, mag: 34, skl: 19, spd: 16, def: 8, res: 28, lck: 22, con: 6, mov: 6, sta: 25, mp: 90 });
    expect(TEMPLATES.tri.stats).toMatchObject({ hp: 20, mag: 35, mov: 8, mp: 100 });
    expect(BOSSES.nullEoW.stats).toMatchObject({ hp: 180, str: 40, mag: 48, def: 35, res: 40, mp: 150 });
    expect(TEMPLATES.roboblin.stats).toMatchObject({ hp: 50, str: 32, sta: 50 });
    expect(TEMPLATES.conde.size).toBe(3); expect(TEMPLATES.darston.size).toBe(2); expect(TEMPLATES.dradd.size).toBe(2);
    expect(BOSSES.nullEoW.size).toBe(5); expect(BOSSES.mogryph.size).toBe(4);
    // Reused entries: Dampé the gravekeeper stays separate; Crawltula shares Strandtula's art.
    expect(TEMPLATES.dampe).toBeDefined();
    expect(artFor('crawltula')).toBe('strandtula');
    for (const id of ['zorasFlippers', 'gerudoSandals', 'herosClothes']) expect(GEAR[id], id).toBeDefined();
    for (const id of ['triRod', 'swordOfMight', 'bowOfMight']) expect(WEAPONS[id], id).toBeDefined();
    for (const id of ['bombsOfMight', 'clockworkKey', 'energySmoothie', 'goldenSmoothie']) expect(ITEMS[id], id).toBeDefined();
    expect(ECHOES_OF_WISDOM.regions.map((r) => r.id)).toEqual(ECHOES_ROUTE);
    expect(ECHOES_ROUTE.length).toBe(12);
    for (const r of ECHOES_ROUTE) { expect(WORLDS[r].campaign).toBe('echoes'); expect(ROSTERS[r]?.length, r).toBeGreaterThan(3); expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0); }
    expect(EO_ROUTE_BOSSES.nullsBody).toEqual(['nullEoW']);
    expect(EO_ROUTE_BOSSES.hyruleCastleEoW).toEqual(['ganonLegendBoss']);
    expect(COMMANDERS.filter((c) => c.campaign === 'echoes').length).toBe(10);
    expect(SUPPORT_REGISTRY.filter((p) => p.game === 'echoes').length).toBe(49);
    expect(GROUP_SUPPORTS.filter((g) => ['primeEnergy', 'royalCouncil', 'mechanicalMasters', 'mountainBrotherhood', 'desertCommand', 'clockworkArmy'].includes(g.id)).length).toBe(6);
    expect(DEFERRED_GROUPS_EOW).toEqual([]);
    expect(GROUP_SUPPORTS.some((g) => g.id === 'unitedWatersEoW') && GROUP_SUPPORTS.some((g) => g.id === 'falseCreation')).toBe(true);
  });

  it('wires in the River Zora only once they exist', () => {
    const rosters: Record<string, string[]> = { jabulWaters: ['octorok'] };
    const cmds = [{ heroId: 'dradd', units: ['zoraWarrior', 'zoraMystic'] }] as unknown as CommanderDef[];
    resolveEchoesFallbacks({}, rosters, cmds, {});
    expect(rosters.jabulWaters).toEqual(['octorok']);
    expect(cmds[0].units).toEqual(['zoraWarrior', 'zoraMystic']);
    resolveEchoesFallbacks({ riverZora: {} as EnemyArchetype, riverZoraHunter: {} as EnemyArchetype }, rosters, cmds, { riverZoraWarrior: 1, riverZoraHunter: 1 });
    expect(rosters.jabulWaters).toEqual(['octorok', 'riverZora', 'riverZoraHunter']);
    expect(cmds[0].units).toEqual(['riverZoraWarrior', 'riverZoraHunter']);
  });
});

describe('Echoes (game-wide)', () => {
  it('learns monsters of every pack, costs follow the table, and Echoes have 75% stats and use capacity', () => {
    for (const id of ['keese', 'lynel', 'bokoblin', 'pesto', 'ignizol', 'darknut']) expect(isEchoEligible(id), id).toBe(true);
    for (const id of ['zeldaEoW', 'ganon', 'hyruleSoldier', 'nullEoW']) expect(isEchoEligible(id), id).toBe(false);
    expect(echoCost('keese')).toBe(2); expect(echoCost('darknut')).toBe(3); expect(echoCost('moblin')).toBe(4); expect(echoCost('lynel')).toBe(6);
    expect(echoCost('echoTable')).toBe(1); expect(echoCost('echoBoulder')).toBe(2);
    const b = field();
    const z = place(b, hero('zeldaEoW'), 2, 2);
    eoState(b).known.push('darknut');
    expect(echoCapacity(b, z)).toBe(TRI_CAPACITY[1]);
    z.eoPick = 'darknut';
    const res = castAbility(b, z, 'createEcho', rng(), undefined, { x: 3, y: 2 });
    expect(res).not.toBeNull();
    const echo = b.units.find((u) => u.eoBy === z.uid)!;
    const orig = makeEnemy(ENEMIES.darknut, b.world, z.level, 'o', rng());
    expect(echo.stats.str).toBe(Math.round(orig.stats.str * 0.75));
    expect(echo.stats.spd).toBe(orig.stats.spd);
    expect(echoUsed(b, z)).toBe(3);
    expect(echo.pack).toEqual([]);
    // No room for a second Darknut at capacity 3.
    z.eoPick = 'darknut';
    expect(unusableReason(b, z, ABILITIES.createEcho)).toMatch(/capacity/);
    // Tri in the battle raises capacity.
    place(b, hero('tri'), 5, 5);
    expect(echoCapacity(b, z)).toBe(TRI_CAPACITY[1] + 1);
    // Echoes are never casualties.
    b.fallen.push({ ...echo, hp: 0 });
    b.units = b.units.filter((u) => u !== echo);
    echoesBeforeFinish(b);
    expect(b.fallen.some((u) => u.eoBy)).toBe(false);
  });

  it('Object Echoes are battlefield tiles; the Boulder crushes and blocks; dismissing frees capacity', () => {
    const b = field();
    const z = place(b, hero('zeldaEoW'), 2, 2);
    const m = place(b, foe('octorok'), 5, 2, 'enemy');
    eoState(b).known.push('echoBoulder');
    z.eoPick = 'echoBoulder';
    const hp = m.hp;
    castAbility(b, z, 'createEcho', rng(), undefined, { x: 4, y: 2 });
    expect(b.tiles[keyOf(b, 4, 2)]).toBe('eoBoulder');
    expect(m.hp).toBeLessThan(hp);
    expect(echoUsed(b, z)).toBe(2);
    castAbility(b, z, 'dismissEcho', rng(), undefined, { x: 4, y: 2 });
    expect(b.tiles[keyOf(b, 4, 2)]).toBe('plain');
    expect(echoUsed(b, z)).toBe(0);
  });

  it('learns defeated monsters after a battle in any campaign when a summoner is in the army', () => {
    const run = newRun(5, 'zeldaEoW', 'hyrule') as RunWithEvent;
    const b = field(12, 8, 'hyruleField');
    const pesto = foe('pesto');
    b.fallen.push({ ...pesto, team: 'enemy', templateId: 'pesto' });
    echoesAfterBattle(run, b, true, rng());
    expect(echoesOf(run).known).toContain('pesto');
  });
});

describe('Zelda, Link, Tri and the Automatons', () => {
  it('Swordfighter Form: Energy, the doc\'s stats, no summoning, back at 0 Energy', () => {
    const b = field();
    const z = place(b, hero('zeldaEoW', 'z', 1), 2, 2);
    const m = place(b, foe('octorok'), 3, 2, 'enemy');
    echoesBattleStart(b);
    expect(z.eoEnergy).toBe(40);
    expect(forecast(b, z, z, m, 'swordOfMight').attacker.canAttack).toBe(false);
    castAbility(b, z, 'swordfighterForm', rng());
    expect(z.eoSword).toBe(true);
    expect(z.eoEnergy).toBe(35);
    expect(z.weapons[0]).toBe('swordOfMight');
    const s = z.buffs.find((x) => x.id === 'swordfighter')!.stats!;
    expect(z.stats.str + (s.str ?? 0)).toBe(24 + (z.stats.str - 6));
    expect(forecast(b, z, z, m, 'swordOfMight').attacker.canAttack).toBe(true);
    expect(unusableReason(b, z, ABILITIES.createEcho)).toBe('Not in Swordfighter Form');
    z.eoEnergy = 5;
    startPhase(b, 'player');
    expect(z.eoSword).toBe(false);
  });

  it('Bind pulls the Seismic Talus\'s core out; Null loses arms to strong hits', () => {
    const b = field();
    const z = place(b, hero('zeldaEoW', 'z', 10), 2, 2);
    const t = place(b, foe('seismicTalus', 't', 5), 4, 2, 'enemy');
    t.isBoss = true;
    const before = forecast(b, z, z, t, 'triRod').attacker.dmg;
    castAbility(b, z, 'eoBind', rng(1), t.uid);
    expect(t.buffs.some((x) => x.id === 'eoCoreOut')).toBe(true);
    expect(forecast(b, z, z, t, 'triRod').attacker.dmg).toBeGreaterThan(before);
    const b2 = field(14, 10);
    const n = place(b2, foe('nullEoW', 'n', 5), 5, 3, 'enemy');
    echoesBattleStart(b2);
    expect(n.eoArms).toBe(4);
  });

  it('Automatons wind down, can be rewound, ignore poison and food', () => {
    const b = field();
    const d = place(b, hero('dampeEoW'), 2, 2);
    const t = place(b, hero('techtite'), 3, 2);
    addStatus(t, 'poison', 3);
    expect(t.statuses.some((s) => s.kind === 'poison')).toBe(false);
    t.sta = 1;
    d.x = 9;
    startPhase(b, 'player');
    expect(t.acted).toBe(true);
    d.x = 2;
    castAbility(b, d, 'rewindAutomaton', rng(), t.uid);
    expect(t.sta).toBe(t.stats.sta);
  });
});

describe('The Still World campaign', () => {
  it('starts in Suthorn Forest, follows the route, marks Rifts and blends smoothies', () => {
    const run = newRun(3, 'zeldaEoW') as RunWithEvent;
    expect(run.campaign).toBe('echoes');
    expect(run.region).toBe('suthornForest');
    expect(run.map.nodes.some((n) => n.eoRift)).toBe(true);
    expect(echoesRegionOptions(run, rng())).toEqual(['gerudoDesertEoW']);
    expect(triLevel(run)).toBe(1);
    run.questItems!.push('freshMilk');
    expect(smoothieOptions(run).find((o) => o.id === 'energySmoothie')?.ok).toBe(true);
    expect(blendSmoothie(run, 'energySmoothie')).toBeTruthy();
    expect(run.convoy).toContain('energySmoothie');
    const node = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    if (run.battle) expect(run.battle.eo?.known.length).toBeGreaterThan(0);
  });
});
