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
