import { it } from 'vitest';
import { forecast } from '../src/engine/combat';
import { newRun, enterNode, startBattle, advanceRegion, type RunWithEvent } from '../src/engine/run';
it('p', () => {
  const run = newRun(3, 'heroOfMinish', 'minish') as RunWithEvent;
  advanceRegion(run, 'minishWoods'); run.act = 2;
  const boss = run.map.nodes.find((n) => n.type === 'boss')!;
  (run as any).currentNodeId = run.map.nodes.find((n) => n.next.includes(boss.id))?.id ?? null;
  enterNode(run, boss.id);
  if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
  const b = run.battle!;
  const link = b.units.find((u) => u.name === 'Link')!;
  for (const e of b.units.filter((u) => u.team === 'enemy').slice(0, 25)) {
    const fc = forecast(b, e, { x: link.x + 1, y: link.y }, link);
    console.log(e.name, e.micro ? 'm' : '', 'atk', JSON.stringify(fc.attacker), 'def', JSON.stringify(fc.defender));
  }
  console.log(JSON.stringify(link.buffs), JSON.stringify(link.statuses), link.micro);
});
