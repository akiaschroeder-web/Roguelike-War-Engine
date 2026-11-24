// Balance probe: auto-plays region 1 many times. Run with: npx vitest run tests/balance.sim.ts --config vitest.sim.config.ts
import { it } from 'vitest';
import { COMMANDERS } from '../src/data/registry';
import { planAction } from '../src/engine/ai';
import { checkResult, moveUnit, spawnReinforcements, startPhase } from '../src/engine/battle';
import { resolveCombat, resolveHeal } from '../src/engine/combat';
import { RNG } from '../src/engine/rng';
import { advanceRegion, offerRegions, availableNodes, campRest, chooseEvent, enterNode, finishBattle, fountainHeal, newRun, recruit, startBattle, takeTreasure, descendDungeon, type RunWithEvent } from '../src/engine/run';
import { environmentPhase } from '../src/engine/field';
import type { Battle, Team } from '../src/engine/types';

function autoPlay(b: Battle, seed: number): Battle['result'] {
  const r = new RNG(seed);
  while (!checkResult(b) && b.turn <= 40) {
    for (const team of ['player', 'enemy'] as Team[]) {
      startPhase(b, team);
      if (team === 'enemy') spawnReinforcements(b);
      for (const u of b.units.filter((x) => x.team === team)) {
        if (!b.units.includes(u) || u.acted) continue;
        const plan = planAction(b, u);
        moveUnit(u, plan.dest.x, plan.dest.y, plan.path.length - 1);
        const t = plan.action && b.units.find((x) => x.uid === plan.action!.target);
        if (t && plan.action!.type === 'attack') resolveCombat(b, u, t, r, plan.action!.weaponId);
        if (t && plan.action!.type === 'heal') resolveHeal(b, u, t, r, plan.action!.weaponId);
        u.acted = true;
        if (checkResult(b)) return b.result;
      }
    }
    environmentPhase(b);
    b.turn++;
  }
  return checkResult(b) ?? 'lost';
}

const PREF = ['camp', 'fountain', 'recruit', 'treasure', 'event', 'battle', 'shop', 'blacksmith', 'ambush', 'siege', 'dungeon', 'elite', 'boss'];

it('region 1 balance', () => {
  const N = Number((globalThis as { process?: { env: Record<string, string> } }).process?.env.SIMN ?? 25);
  for (const c of COMMANDERS) {
    let bossWins = 0, reachBoss = 0, deathsBefore = 0, boss2 = 0, reach2 = 0;
    const lv2: number[] = [], blv2: number[] = [];
    const lv: number[] = [];
    const bossLv: number[] = [];
    for (let s = 0; s < N; s++) {
      const run = newRun(s * 977 + 3, c.heroId) as RunWithEvent;
      let alive = true;
      let lastType = '', lastObj = '', lastLv = 0;
      for (let step = 0; step < 80 && alive; step++) {
        if (run.event?.type === 'region') { if (run.act >= 2) break; advanceRegion(run, run.event.options[0]); continue; }
        if (!run.battle && !run.event) {
          const opts = availableNodes(run);
          if (!opts.length) break;
          opts.sort((a, b) => PREF.indexOf(a.type) - PREF.indexOf(b.type));
          enterNode(run, opts[0].id);
        }
        if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
        if (run.event?.type === 'dungeon') descendDungeon(run);
        if (run.battle) {
          run.battle.units.find((u) => u.isCommander)!.ai = 'guard';
          const isBoss = run.battle.nodeType === 'boss';
          if (isBoss && run.act === 2) { reach2++; lv2.push(run.roster.reduce((t, u) => t + u.level, 0) / run.roster.length); blv2.push(run.battle.enemyLevel); }
          if (isBoss && run.act === 1) {
            reachBoss++;
            lv.push(run.roster.reduce((t, u) => t + u.level, 0) / run.roster.length);
            bossLv.push(run.battle.enemyLevel);
          }
          const bossU = isBoss ? run.battle.units.find((u) => u.isBoss) : undefined;
          const bstats = bossU ? `${bossU.name} hp${bossU.stats.hp} str${bossU.stats.str} mag${bossU.stats.mag} def${bossU.stats.def} res${bossU.stats.res} spd${bossU.stats.spd}` : '';
          lastType = run.battle.nodeType; lastObj = run.battle.objective.type; lastLv = run.battle.enemyLevel;
          const res = autoPlay(run.battle, s + step);
          if (isBoss && run.act === 2) console.log('  ', c.heroId, res, bstats, 'boss hp left', bossU?.hp, 'cmdr dead', run.battle.fallen.some((u) => u.isCommander), 'players left', run.battle.units.filter((u) => u.team === 'player').length);
          run.battle.result = res;
          const sum = finishBattle(run);
          if (!sum.won && !sum.retreated) { alive = false; if (!isBoss) { deathsBefore++; if (0) console.log('   early loss', c.heroId, run.battle ? '' : '', 'depth', step, 'type', lastType, 'obj', lastObj, 'lv', lastLv); } break; }
          if (isBoss && run.act === 1) { bossWins++; offerRegions(run); continue; }
          if (isBoss) { boss2++; break; }
          continue;
        }
        const ev = run.event;
        if (!ev) continue;
        if (ev.type === 'recruit') { if (!recruit(run, ev.offers[0])) run.event = undefined; }
        else if (ev.type === 'camp') campRest(run);
        else if (ev.type === 'fountain') fountainHeal(run);
        else if (ev.type === 'treasure') takeTreasure(run, null, null);
        else if (ev.type === 'event') { if (!chooseEvent(run, 0)) chooseEvent(run, 1); run.event = undefined; }
        else if (ev.type === 'moonfall') { alive = false; break; }
        else run.event = undefined;
      }
    }
    const avg = (a: number[]) => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '-');
    console.log(`${c.heroId.padEnd(10)} reach boss ${reachBoss}/${N}  died before ${deathsBefore}  boss wins ${bossWins}/${reachBoss}  army lv ${avg(lv)}  boss enemy lv ${avg(bossLv)}  | region-2 boss ${boss2}/${reach2} army lv ${avg(lv2)} vs enemy lv ${avg(blv2)}`);
  }
}, 600000);
