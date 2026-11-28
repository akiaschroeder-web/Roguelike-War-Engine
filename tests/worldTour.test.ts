import { describe, expect, it } from 'vitest';
import { advanceRegion, availableNodes, enterNode, newRun, offerRegions, startBattle, TOUR_ORDER, type RunWithEvent } from '../src/engine/run';

function firstBattle(run: RunWithEvent) {
  const node = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
  expect(node).toBeTruthy();
  enterNode(run, node.id);
  if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
  return run.battle;
}

describe('World Tour', () => {
  it('visits every campaign in turn, home campaign first, then wanders at random', () => {
    const run = newRun(7, 'heroOfTwilight', 'worldTour', 1);
    expect(run.tour?.legs[0]).toBe('twilight');
    expect(new Set(run.tour?.legs)).toEqual(new Set(TOUR_ORDER));
    const seen: string[] = [run.campaign!];
    for (let i = 0; i < 16; i++) {
      offerRegions(run);
      const opt = (run.event as { options: string[] }).options;
      expect(opt.length).toBe(1);
      advanceRegion(run, opt[0]);
      seen.push(run.campaign!);
      if (run.campaign === 'termina') expect(run.clock).toBeTruthy(); else expect(run.clock).toBeUndefined();
      if (run.campaign === 'greatSea') expect(run.sea).toBeTruthy();
      const b = firstBattle(run);
      if (b) expect(b.units.some((u) => u.team === 'enemy')).toBe(true);
      run.battle = undefined; run.event = undefined;
    }
    expect(seen.slice(0, 15)).toEqual(run.tour!.legs);
    expect(seen[15]).not.toBe(seen[14]);
    expect(run.tour!.legs).toContain(seen[15]);
  });

  it('stays in the current campaign until its regions are done', () => {
    const run = newRun(3, 'link', 'worldTour', 3);
    expect(run.campaign).toBe('hyrule');
    for (let i = 0; i < 2; i++) {
      offerRegions(run);
      const opt = (run.event as { options: string[] }).options;
      expect(run.tour?.next).toBeUndefined();
      advanceRegion(run, opt[0]);
      expect(run.campaign).toBe('hyrule');
    }
    offerRegions(run);
    expect(run.tour?.next).toBe('termina');
    advanceRegion(run, (run.event as { options: string[] }).options[0]);
    expect(run.campaign).toBe('termina');
    expect(run.region).toBe('clockTown');
  });
});
