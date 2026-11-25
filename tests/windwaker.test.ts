import { describe, expect, it } from 'vitest';
import { ABILITIES, COMMANDERS, TEMPLATES, WEAPONS, WORLDS } from '../src/data/registry';
import { castAbility, knownAbilities, unusableReason } from '../src/engine/abilities';
import { checkResult, createBattle, startPhase } from '../src/engine/battle';
import { attackWeapons, canWield, resolveCombat } from '../src/engine/combat';
import { computeMoves, keyOf } from '../src/engine/grid';
import { board, capacityOf, commandeer, commandeerTargets, disembark, disembarkTiles, isVessel, resolveSinking, windFactor } from '../src/engine/naval';
import { RNG } from '../src/engine/rng';
import { availableNodes, canTake, enterNode, finishBattle, newRun, startBattle, type RunWithEvent } from '../src/engine/run';
import { CHART_SIZE, lockReason, seaOf } from '../src/engine/sea';
import { disarm, droppedNear, masterSwordState, takeDropped, wwStartPhase } from '../src/engine/windwaker';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = () => new RNG(7);

/** A blank test battlefield: water on the right, beach on the left. */
function sea(w = 12, h = 8, land = 4): Battle {
  const tiles: Terrain[] = Array.from({ length: w * h }, (_, k) => ((k % w) < land ? 'plain' : 'water'));
  return {
    width: w, height: h, tiles, world: 'greatSea', units: [], turn: 1, phase: 'player', objective: { type: 'rout' }, rngState: 1, rewardRupees: 100,
    nodeType: 'battle', log: [], fallen: [], enemyLevel: 3, uidCounter: 50, interceptUsed: false, healMult: 1, drops: [], naval: true, wind: [1, 0],
  };
}

function place<T extends Unit>(b: Battle, u: T, x: number, y: number, team: 'player' | 'enemy' = 'player'): T {
  const p = prepareForBattle(u) as T;
  Object.assign(p, { x, y, team });
  b.units.push(p);
  return p;
}

describe('Wind Waker content', () => {
  it('registers the pack: 7 commanders, 10 regions, vessels and all units', () => {
    expect(COMMANDERS.filter((c) => c.campaign === 'greatSea').length).toBe(7);
    expect(Object.values(WORLDS).filter((w) => w.campaign === 'greatSea').length).toBe(10);
    for (const id of ['heroOfWinds', 'tetra', 'zeldaWW', 'ganondorfWW', 'kingOfRedLions', 'valoo', 'jabun', 'senza', 'mako', 'zuko', 'nudge', 'ritoScout', 'korokHealer',
      'smallRaft', 'sailingBoat', 'beedlesShopShip', 'bokoblinRaft', 'gunboat', 'pirateShip', 'ghostShip', 'submarine',
      'bokoblin', 'darknut', 'mightyDarknut', 'chuchuRed', 'arrowChuchu', 'gohmaWW', 'kalleDemos', 'gohdan', 'helmarocKing', 'jalhalla', 'molgera',
      'puppetGanonBeast', 'puppetGanonSpider', 'puppetGanonSnake', 'molgeraLarva', 'gohdansHand']) expect(TEMPLATES[id], id).toBeDefined();
  });

  it('vessels carry passengers and take only ship gear', () => {
    const ship = makeHero('pirateShip', 'v', 1, rng());
    const link = makeHero('heroOfWinds', 'l', 1, rng());
    expect(isVessel(ship)).toBe(true);
    expect(capacityOf(ship)).toBe(8);
    expect(capacityOf(makeHero('kingOfRedLions', 'k', 1, rng()))).toBe(3);
    expect(canTake(ship, 'swiftSail')).toBe(true);
    expect(canTake(ship, 'herosClothes')).toBe(false);
    expect(canTake(link, 'swiftSail')).toBe(false);
    expect(canTake(makeHero('smallRaft', 'r', 1, rng()), 'pirateFlag')).toBe(false); // too small for a flag
    expect(canWield(ship, WEAPONS.shipCannon)).toBe(true);
    expect(canWield(link, WEAPONS.pirateCannon)).toBe(false);
  });
});

describe('naval combat', () => {
  it('board and disembark', () => {
    const b = sea();
    const ship = place(b, makeHero('sailingBoat', 'v', 1, rng()), 4, 3);
    const orca = place(b, makeHero('orca', 'o', 1, rng()), 3, 3);
    expect(board(b, orca, ship)).toBe(true);
    expect(b.units.includes(orca)).toBe(false);
    expect(ship.cargo).toContain(orca);
    const tiles = disembarkTiles(b, ship);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.every((t) => b.tiles[keyOf(b, t.x, t.y)] === 'plain')).toBe(true); // Orca can't swim
    expect(disembark(b, ship, tiles[0])).toBe(orca);
    expect(b.units.includes(orca)).toBe(true);
  });

  it('the wind speeds ships along and slows them against it', () => {
    const b = sea(20, 6, 1);
    const ship = place(b, makeHero('sailingBoat', 'v', 1, rng()), 8, 2);
    expect(windFactor(b, ship, 1, 0)).toBeLessThan(1);
    expect(windFactor(b, ship, -1, 0)).toBeGreaterThan(1);
    const moves = computeMoves(b, ship);
    const east = Math.max(...[...moves.reach.keys()].map((k) => k % b.width));
    const west = Math.min(...[...moves.reach.keys()].map((k) => k % b.width));
    expect(east - ship.x).toBeGreaterThan(ship.x - west);
    // A raft has no sail: the wind doesn't matter.
    const raft = place(b, makeHero('smallRaft', 'r', 1, rng()), 3, 0);
    expect(windFactor(b, raft, 1, 0)).toBe(1);
  });

  it('a sunk ship\'s passengers escape or are lost', () => {
    const b = sea();
    const ship = place(b, makeHero('sailingBoat', 'v', 1, rng()), 8, 3);
    const link = makeHero('heroOfWinds', 'l', 1, rng());
    const medli = makeHero('medli', 'm', 1, rng()); // a Rito: flies
    ship.cargo = [link, medli];
    b.units = b.units.filter((u) => u !== ship);
    b.fallen.push(ship);
    resolveSinking(b);
    expect(b.units.includes(medli)).toBe(true);
    expect(b.fallen.includes(link)).toBe(true); // far from land and can't swim
  });

  it('crewless enemy ships can be commandeered', () => {
    const b = sea();
    const raft = place(b, makeHero('bokoblinRaft', 'e1', 1, rng()), 4, 3, 'enemy');
    const niko = place(b, makeHero('niko', 'n', 1, rng()), 3, 3);
    raft.cargo = [makeEnemy({ id: 'bokoblin', name: 'Bokoblin', classId: 'monsterInfantry', race: 'monster', weapons: ['bokoStick'] }, 'greatSea', 1, 'e2', rng())];
    expect(commandeerTargets(b, niko)).toEqual([]);
    raft.cargo = [];
    expect(commandeer(b, niko, raft)).toBe(true);
    expect(raft.team).toBe('player');
    expect(raft.captured).toBe(true);
  });

  it('sea battles start passengers aboard, with wind and islands', () => {
    const run = newRun(11, 'tetra');
    const b = createBattle({ world: 'greatSea', nodeType: 'battle', depth: 3, roster: run.roster, seed: 5 });
    expect(b.naval).toBe(true);
    expect(b.wind).toBeDefined();
    const ship = b.units.find((u) => u.team === 'player' && isVessel(u))!;
    expect(ship).toBeDefined();
    expect(b.tiles[keyOf(b, ship.x, ship.y)]).not.toBe('plain');
    expect(b.units.some((u) => u.team === 'enemy')).toBe(true);
    // Everyone deployed is somewhere: on the field or aboard.
    const all = b.units.flatMap((u) => [u, ...(u.cargo ?? [])]).filter((u) => u.team === 'player');
    for (const u of run.roster) expect(all.some((a) => a.uid === u.uid), u.name).toBe(true);
    expect(checkResult(b)).toBeUndefined();
  });

  it('hits on a ship can knock out components', () => {
    const b = sea();
    const ship = place(b, makeHero('pirateShip', 'v', 5, rng()), 6, 2, 'enemy');
    const mako = place(b, makeHero('mako', 'm', 10, rng()), 2, 3);
    const r = new RNG(3);
    for (let i = 0; i < 25 && b.units.includes(ship); i++) { ship.hp = ship.stats.hp; mako.hp = mako.stats.hp; resolveCombat(b, mako, ship, r, 'pirateCannon'); }
    expect(Object.keys(ship.damaged ?? {}).length).toBeGreaterThan(0);
  });
});

describe('scavenging, parries and armor', () => {
  it('a disarmed weapon can be picked up by anyone strong enough', () => {
    const b = sea(10, 6, 10);
    const boko = place(b, makeEnemy({ id: 'bokoblin', name: 'Bokoblin', classId: 'monsterInfantry', race: 'monster', weapons: ['bokoblinMachete'] }, 'outsetIsland', 3, 'e1', rng()), 4, 2, 'enemy');
    const aryll = place(b, makeHero('aryll', 'a', 1, rng()), 3, 2);
    expect(disarm(b, boko)).toBe('bokoblinMachete');
    expect(boko.weapons).not.toContain('bokoblinMachete');
    const d = droppedNear(b, aryll);
    expect(d.length).toBe(1);
    takeDropped(b, aryll, d[0]);
    expect(aryll.weapons).toContain('bokoblinMachete');
    expect(attackWeapons(aryll, 1).some((w) => w.id === 'bokoblinMachete')).toBe(true); // untrained, but usable
  });

  it('Link parries dodged melee blows', () => {
    const b = sea(10, 6, 10);
    const link = place(b, makeHero('heroOfWinds', 'l', 20, rng()), 3, 2);
    link.stats.spd = 60; link.stats.lck = 60; // can't be hit
    const boko = place(b, makeEnemy({ id: 'bokoblin', name: 'Bokoblin', classId: 'monsterInfantry', race: 'monster', weapons: ['bokoStick'] }, 'outsetIsland', 1, 'e1', rng()), 4, 2, 'enemy');
    boko.stats.hp = boko.hp = 200;
    const res = resolveCombat(b, boko, link, new RNG(2));
    expect(res.strikes.some((s) => s.by === link.uid && s.hit && s.dmg > 0)).toBe(true);
  });

  it('Darknut armor halves damage until it breaks', () => {
    const b = sea(10, 6, 10);
    const dk = place(b, makeEnemy({ id: 'darknut', name: 'Darknut', classId: 'armoredSwordsman', race: 'monster', weapons: ['darknutGreatsword'], skill: 'heavyArmor', size: 2 }, 'submergedHyrule', 5, 'e1', rng()), 4, 2, 'enemy');
    expect(dk.skills).toContain('heavyArmor');
    const orca = place(b, makeHero('orca', 'o', 10, rng()), 3, 2);
    orca.weapons = ['skullHammer'];
    orca.classId = 'windAdventurer';
    const r = new RNG(1);
    for (let i = 0; i < 10 && !dk.armorBroken; i++) { orca.hp = orca.stats.hp; dk.hp = dk.stats.hp; resolveCombat(b, orca, dk, r, 'skullHammer'); }
    expect(dk.armorBroken).toBe(true);
  });
});

describe('Wind Waker abilities and spaces', () => {
  it('contextual actions appear only when usable', () => {
    const b = sea();
    const ship = place(b, makeHero('sailingBoat', 'v', 1, rng()), 4, 3);
    const orca = place(b, makeHero('orca', 'o', 1, rng()), 3, 3);
    expect(knownAbilities(orca).some((a) => a.id === 'boardVessel')).toBe(true);
    expect(unusableReason(b, orca, ABILITIES.boardVessel)).toBeNull();
    expect(unusableReason(b, orca, ABILITIES.commandeer)).not.toBeNull();
    expect(castAbility(b, orca, 'boardVessel', rng(), ship.uid)).not.toBeNull();
    expect(ship.cargo?.length).toBe(1);
  });

  it("Wind's Requiem turns the wind toward the enemy", () => {
    const b = sea();
    const link = place(b, makeHero('heroOfWinds', 'l', 5, rng()), 2, 3);
    place(b, makeHero('bokoblinRaft', 'e', 1, rng()), 6, 0, 'enemy');
    b.wind = [-1, 0];
    expect(castAbility(b, link, 'windsRequiem', rng())).not.toBeNull();
    expect(b.wind).toEqual([1, 0]);
  });

  it('Koroks plant trees', () => {
    const b = sea(10, 6, 10);
    const k = place(b, makeHero('korokPlanter', 'k', 1, rng()), 3, 3);
    expect(unusableReason(b, k, ABILITIES.plantTree)).toBeNull();
    expect(castAbility(b, k, 'plantTree', rng(), undefined, { x: 4, y: 3 })).not.toBeNull();
    expect(b.tiles[keyOf(b, 4, 3)]).toBe('grownTree');
  });

  it('Gohdan arrives with two hands; Molgera spreads sinking sand', () => {
    const run = newRun(3, 'heroOfWinds');
    const b = createBattle({ world: 'towerOfTheGods', nodeType: 'boss', depth: 20, roster: run.roster, seed: 9, naval: false, boss: undefined });
    const boss = b.units.find((u) => u.isBoss)!;
    if (boss.skills.includes('trialOfTheGods')) expect(b.units.filter((u) => u.artId === 'gohdansHand').length).toBe(2);
    const m = sea(12, 8, 12);
    const mol = place(m, makeEnemy({ id: 'molgera', name: 'Molgera', classId: 'desertLeviathan', race: 'monster', weapons: ['molgeraJaws'], skill: 'sandVortexSkill', size: 3 } as never, 'windTemple', 5, 'e1', rng()), 5, 3, 'enemy');
    wwStartPhase(m, mol, []);
    expect(m.tiles.includes('sandVortex')).toBe(true);
  });

  it('start-of-phase upkeep handles cargo', () => {
    const b = sea();
    const ship = place(b, makeHero('sailingBoat', 'v', 1, rng()), 4, 3);
    const orca = makeHero('orca', 'o', 1, rng());
    orca.acted = true;
    ship.cargo = [orca];
    startPhase(b, 'player');
    expect(orca.acted).toBe(false);
  });
});

describe('the Master Sword beneath the sea', () => {
  it('is dormant until the sages are in the army', () => {
    const b = sea(10, 6, 10);
    b.world = 'towerOfTheGods';
    const link = place(b, makeHero('heroOfWinds', 'l', 5, rng()), 2, 2);
    expect(masterSwordState(b, link)).toBe('dormant');
    place(b, makeHero('medli', 'm', 1, rng()), 2, 3);
    expect(masterSwordState(b, link)).toBe('earth');
    place(b, makeHero('makar', 'k', 1, rng()), 2, 4);
    expect(masterSwordState(b, link)).toBe('full');
    b.world = 'hyruleField';
    expect(masterSwordState(b, link)).toBeNull();
  });
});

describe('the Great Sea campaign', () => {
  it('starts at Outset on a 7×7 chart with locked islands', () => {
    const run = newRun(5, 'heroOfWinds') as RunWithEvent;
    expect(run.campaign).toBe('greatSea');
    expect(run.map.nodes.length).toBe(CHART_SIZE * CHART_SIZE);
    expect(run.roster.some(isVessel)).toBe(true);
    const first = availableNodes(run);
    expect(first.length).toBe(1);
    expect(first[0].island).toBe('outset');
    const tower = run.map.nodes.find((n) => n.island === 'tower')!;
    expect(lockReason(run, tower, new Set())).toMatch(/Pearls/);
    expect(lockReason(run, tower, new Set(['dinsPearl', 'faroresPearl', 'nayrusPearl']))).toBeNull();
    for (const k of ['outset', 'windfall', 'forsaken', 'dragonRoost', 'forestHaven', 'tower', 'hyrule', 'earth', 'wind', 'ganon']) expect(run.map.nodes.some((n) => n.island === k), k).toBe(true);
  });

  it('every commander can start a Great Sea run with a ship', () => {
    for (const c of COMMANDERS) {
      const run = newRun(9, c.heroId, 'greatSea');
      expect(run.roster.some(isVessel), c.heroId).toBe(true);
      expect(seaOf(run).revealed.length).toBeGreaterThan(5);
    }
  });

  it('sailing eats supplies, and fights at sea use ships', () => {
    const run = newRun(21, 'tetra') as RunWithEvent;
    enterNode(run, availableNodes(run)[0].id); // Outset
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    expect(run.battle).toBeDefined();
    expect(run.battle!.naval).toBeFalsy(); // Outset's raid is on land
    expect(run.battle!.units.some((u) => isVessel(u) && u.team === 'player')).toBe(false); // ships stay in harbour
    run.battle!.result = 'won';
    finishBattle(run);
    expect(seaOf(run).cleared).toContain('outset');
    const before = run.army!.supplies;
    const next = availableNodes(run)[0];
    enterNode(run, next.id);
    expect(run.army!.supplies).toBe(Math.max(0, before - 1));
  });
});
