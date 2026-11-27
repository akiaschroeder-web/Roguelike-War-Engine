import { it } from 'vitest';
import { newRun, type RunWithEvent } from '../src/engine/run';
import { checkResult, createBattle, moveUnit, startPhase } from '../src/engine/battle';
import { planAction } from '../src/engine/ai';
import { resolveCombat } from '../src/engine/combat';
import { environmentPhase } from '../src/engine/field';
import { RNG } from '../src/engine/rng';
import { BOSSES } from '../src/data/registry';
import { gainXp } from '../src/engine/units';
import { phantomBattleSetup } from '../src/engine/phantomRun';
it('probe', () => {
  for (const seed of [3]) {
    const run = newRun(seed, 'linebeck', 'phantom') as RunWithEvent;
    for (const u of run.roster) gainXp(u, 300, new RNG(1));
    const b = createBattle({ world: 'isleOfEmber', nodeType: 'boss', depth: 9, roster: run.roster, seed, boss: BOSSES.blaaz });
    phantomBattleSetup(run, b, new RNG(2));
    console.log('lvl', b.enemyLevel, b.units.filter((u) => u.team === 'enemy').map((u) => `${u.name} L${u.level} hp${u.hp} def${u.stats.def} res${u.stats.res} ai${u.ai}`).join(' | '));
    console.log(b.units.filter((u) => u.team === 'player').map((u) => `${u.name} L${u.level} hp${u.hp} str${u.stats.str}`).join(' | '));
    const r = new RNG(seed);
    while (!checkResult(b) && b.turn <= 15) {
      for (const team of ['player', 'enemy'] as const) {
        startPhase(b, team);
        for (const u of b.units.filter((x) => x.team === team)) {
          if (!b.units.includes(u) || u.acted) continue;
          const plan = planAction(b, u);
          moveUnit(u, plan.dest.x, plan.dest.y, plan.path.length - 1);
          const tt = plan.action && b.units.find((x) => x.uid === plan.action!.target);
          if (tt && plan.action!.type === 'attack') { const res = resolveCombat(b, u, tt, r, plan.action!.weaponId); console.log('   t', b.turn, u.name, '->', tt.name, res.strikes.map((s) => `${s.by === u.uid ? 'A' : 'D'}${s.hit ? s.dmg : 'miss'}`).join(','), 'hp', tt.hp, u.hp); }
          u.acted = true;
          if (checkResult(b)) break;
        }
      }
      environmentPhase(b);
      b.turn++;
    }
    console.log(' result', b.result, 'turn', b.turn, b.log.slice(-8).join(' / '));
  }
});
