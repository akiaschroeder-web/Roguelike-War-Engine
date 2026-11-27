import { it } from 'vitest';
import { newRun, availableNodes, enterNode, startBattle, advanceRegion, type RunWithEvent } from '../src/engine/run';
it('p', () => {
  const run = newRun(3, 'heroOfMinish', 'minish') as RunWithEvent;
  advanceRegion(run, 'minishWoods');
  const boss = run.map.nodes.find((n) => n.type === 'boss')!;
  run.currentNodeId = null;
  // jump straight to boss
  (run as any).currentNodeId = run.map.nodes.find((n) => n.next.includes(boss.id))?.id ?? null;
  enterNode(run, boss.id);
  if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
  const b = run.battle!;
  console.log(b.width, b.height, b.units.map((u) => `${u.team}:${u.name}:${u.micro ? 'm' : ''}:${u.x},${u.y}:boss=${!!u.isBoss}:hp${u.hp}`).join('\n'));
});
