import { describe, expect, it } from 'vitest';
import { armyCap, bossCapacityReward, deployCap } from '../src/engine/army';
import { buyBarracks, newRun, recruitOffers } from '../src/engine/run';
import { RNG } from '../src/engine/rng';

describe('army capacity', () => {
  it('grows with boss victories and barracks', () => {
    const run = newRun(5, 'link', 'hyrule');
    const a0 = armyCap(run), d0 = deployCap(run);
    bossCapacityReward(run);
    expect(armyCap(run)).toBe(a0 + 1);
    bossCapacityReward(run);
    expect(armyCap(run)).toBe(a0 + 2);
    expect(deployCap(run)).toBe(d0 + 1);
    run.event = { type: 'shop', weapons: [], gear: [], items: [], permanents: [], sold: [] };
    run.rupees = 5000;
    expect(buyBarracks(run)).toBe(true);
    expect(armyCap(run)).toBe(a0 + 3);
    expect(deployCap(run)).toBe(d0 + 1);
  });
});

describe('recruitment', () => {
  it('can offer form units such as Phantom Zelda (Torch)', () => {
    const run = newRun(9, 'link', 'spirit');
    const seen = new Set<string>();
    for (let i = 0; i < 3000 && !seen.has('phantomZeldaTorch'); i++) for (const id of recruitOffers(run, new RNG(i), 'towerOfSpirits')) seen.add(id);
    expect(seen.has('phantomZeldaTorch')).toBe(true);
  });
});

import { makeHero } from '../src/engine/units';
import { enterNode, availableNodes, startBattle, type RunWithEvent } from '../src/engine/run';
describe('deployment', () => {
  it('fields every chosen unit, several size-5 giants included', () => {
    const run = newRun(11, 'link', 'wild') as RunWithEvent;
    const rng = new RNG(3);
    for (const id of ['ikanaGiant', 'snowheadGiant', 'woodfallGiant']) run.roster.push(makeHero(id, `g-${id}`, 1, rng));
    const battleNode = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
    enterNode(run, battleNode.id);
    run.event = undefined;
    startBattle(run, run.roster.map((u) => u.uid));
    const fielded = new Set(run.battle!.units.filter((u) => u.team === 'player').map((u) => u.uid));
    for (const id of ['ikanaGiant', 'snowheadGiant', 'woodfallGiant']) expect(fielded.has(`g-${id}`)).toBe(true);
  });
});

import { microSheltered } from '../src/engine/micro';
import { forecast } from '../src/engine/combat';
describe('fairy companions', () => {
  it('are Micro units', () => {
    const rng = new RNG(1);
    for (const id of ['navi', 'tatl', 'tael', 'ciela', 'leaf', 'neri']) expect(makeHero(id, `f-${id}`, 1, rng).micro).toBe(true);
  });
  it('cannot be targeted while sharing a tile with a normal-sized ally', () => {
    const run = newRun(21, 'link', 'hyrule') as RunWithEvent;
    run.roster.push(makeHero('navi', 'navi-1', 1, new RNG(2)));
    enterNode(run, (availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0]).id);
    run.event = undefined;
    startBattle(run, run.roster.map((u) => u.uid));
    const b = run.battle!;
    const navi = b.units.find((u) => u.uid === 'navi-1')!;
    const host = b.units.find((u) => u.team === 'player' && !u.micro)!;
    const foe = b.units.find((u) => u.team === 'enemy')!;
    navi.x = host.x; navi.y = host.y;
    expect(microSheltered(b, navi)).toBe(true);
    expect(forecast(b, foe, { x: navi.x + 1, y: navi.y }, navi).attacker.canAttack).toBe(false);
    navi.x = host.x + host.size + 2; navi.y = host.y;
    if (!b.units.some((u) => u !== navi && !u.micro && u.team === 'player' && navi.x >= u.x && navi.x < u.x + u.size && navi.y >= u.y && navi.y < u.y + u.size)) expect(microSheltered(b, navi)).toBe(false);
  });
});

import { moveUnit, startPhase } from '../src/engine/battle';
import { mcAfterMove } from '../src/engine/micro';
import { computeMoves, posOf } from '../src/engine/grid';
describe('hitching a ride', () => {
  it('lasts across turns until the rider moves off', () => {
    const run = newRun(5, 'link', 'hyrule') as RunWithEvent;
    enterNode(run, (availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0]).id);
    run.event = undefined;
    startBattle(run, run.roster.map((u) => u.uid));
    const b = run.battle!;
    const navi = b.units.find((u) => u.templateId === 'navi')!;
    expect(navi.mcRide).toBeTruthy();
    for (let t = 0; t < 3; t++) {
      const host = b.units.find((u) => u.uid === navi.mcRide?.host)!;
      const k = [...computeMoves(b, host).reach.keys()].find((k) => { const p = posOf(b, k); return p.x !== host.x || p.y !== host.y; })!;
      const p = posOf(b, k);
      moveUnit(host, p.x, p.y, 1); mcAfterMove(b, host);
      expect(navi.mcRide?.host).toBe(host.uid);
      expect(navi.x >= host.x && navi.x < host.x + host.size && navi.y >= host.y && navi.y < host.y + host.size).toBe(true);
      for (const u of b.units) { u.moved = false; u.acted = false; }
      startPhase(b, 'enemy'); startPhase(b, 'player');
      expect(navi.mcRide).toBeTruthy();
    }
  });
});
