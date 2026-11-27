import { it } from 'vitest';
import { planAction } from '../src/engine/ai';
import { checkResult, moveUnit, spawnReinforcements, startPhase } from '../src/engine/battle';
import { resolveCombat, resolveHeal } from '../src/engine/combat';
import { RNG } from '../src/engine/rng';
import { newRun, enterNode, startBattle, advanceRegion, type RunWithEvent } from '../src/engine/run';
import { environmentPhase } from '../src/engine/field';
import type { Team } from '../src/engine/types';
it('p', () => {
  for (const cmd of ['swiftblade']) {
  const run = newRun(3, cmd, 'minish') as RunWithEvent;
  for (const u of run.roster) { u.level = 6; for (const k of ['hp','str','skl','spd','def'] as const) u.stats[k] += 2; u.hp = u.stats.hp; }
  advanceRegion(run, 'minishWoods'); run.act = 2;
  const boss = run.map.nodes.find((n) => n.type === 'boss')!;
  (run as any).currentNodeId = run.map.nodes.find((n) => n.next.includes(boss.id))?.id ?? null;
  enterNode(run, boss.id);
  if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
  const b = run.battle!; const r = new RNG(5);
  b.units.find((u) => u.isCommander)!.ai = 'guard';
  console.log(cmd, 'units', b.units.map((u) => `${u.team[0]}:${u.name}:L${u.level}`).join(', '));
  while (!checkResult(b) && b.turn <= 40) {
    for (const team of ['player', 'enemy'] as Team[]) {
      startPhase(b, team);
      for (const u of b.units.filter((x) => x.team === team)) {
        if (!b.units.includes(u) || u.acted) continue;
        const plan = planAction(b, u);
        moveUnit(u, plan.dest.x, plan.dest.y, plan.path.length - 1);
        const t = plan.action && b.units.find((x) => x.uid === plan.action!.target);
        if (t && plan.action!.type === 'attack') { const res = resolveCombat(b, u, t, r, plan.action!.weaponId); if (res.strikes.some((s: any) => s.killed) || u.isCommander) console.log(' t', b.turn, u.name, '->', t.name, res.strikes.map((s: any) => `${s.by===u.uid?'A':'D'}${s.hit?s.dmg:'miss'}`).join(' ')); }
        if (t && plan.action!.type === 'heal') resolveHeal(b, u, t, r, plan.action!.weaponId);
        u.acted = true;
        if (checkResult(b)) break;
      }
      if (checkResult(b)) break;
    }
    environmentPhase(b); b.turn++;
  }
  console.log(cmd, 'result', checkResult(b), 'turn', b.turn, 'fallen', b.fallen.map((u) => `${u.team[0]}:${u.name}`).join(', '));
  }
});
