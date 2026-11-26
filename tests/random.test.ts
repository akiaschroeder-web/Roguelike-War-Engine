import { describe, expect, it } from 'vitest';
import { COMMANDERS, REGION_IDS } from '../src/data/registry';
import { availableNodes, enterNode, newRun, offerRegions, startBattle } from '../src/engine/run';

describe('Random campaign', () => {
  it('starts anywhere, fights in random regions and offers regions from every pack', () => {
    const starts = new Set<string>();
    const offered = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const run = newRun(seed, COMMANDERS[seed % COMMANDERS.length].heroId, 'random');
      expect(run.campaign).toBe('random');
      expect(new Set(run.map.nodes.map((n) => n.world)).size).toBeGreaterThan(3);
      expect(run.region).not.toBe('moon');
      starts.add(run.region);
      offerRegions(run);
      for (const r of (run.event as { options: string[] }).options) offered.add(r);
    }
    expect(starts.size).toBeGreaterThan(10);
    expect(offered.size).toBeGreaterThan(20);
    expect([...offered].every((r) => REGION_IDS.includes(r))).toBe(true);
  });

  it('a first battle works with an army from the whole cast', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const run = newRun(seed, 'link', 'random');
      const node = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
      enterNode(run, node.id);
      if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
      if (run.battle) expect(run.battle.units.some((u) => u.team === 'enemy')).toBe(true);
    }
  });
});
