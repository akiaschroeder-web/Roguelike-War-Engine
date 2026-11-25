// Great Sea balance probe. Run with: SIMN=10 npx vitest run tests/sea.sim.ts --config vitest.sim.config.ts
import { it } from 'vitest';
import { COMMANDERS } from '../src/data/registry';
import { planAction } from '../src/engine/ai';
import { checkResult, moveUnit, spawnReinforcements, startPhase } from '../src/engine/battle';
import { resolveCombat, resolveHeal } from '../src/engine/combat';
import { RNG } from '../src/engine/rng';
import { availableNodes, campRest, chooseEvent, enterNode, finishBattle, fountainHeal, newRun, recruit, startBattle, takeTreasure, descendDungeon, buySupplies, type RunWithEvent } from '../src/engine/run';
import { environmentPhase } from '../src/engine/field';
import { disembark, disembarkTiles, enemyUnload } from '../src/engine/naval';
import { syncPosition } from '../src/engine/windwaker';
import { seaOf } from '../src/engine/sea';
import type { Battle, Team } from '../src/engine/types';

function autoPlay(b: Battle, seed: number): Battle['result'] {
  const r = new RNG(seed);
  while (!checkResult(b) && b.turn <= 40) {
    for (const team of ['player', 'enemy'] as Team[]) {
      startPhase(b, team);
      if (team === 'enemy') spawnReinforcements(b);
      for (let i = 0; i < b.units.length; i++) {
        const u = b.units[i];
        if (u.team !== team || u.acted) continue;
        if (team === 'player') { while (u.cargo?.length) { const t = disembarkTiles(b, u); if (!t.length) break; const p = disembark(b, u, t[0]); if (p) p.acted = false; } }
        else enemyUnload(b, u);
        const plan = planAction(b, u);
        moveUnit(u, plan.dest.x, plan.dest.y, plan.path.length - 1);
        syncPosition(b, u);
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

const PREF = ['camp', 'fountain', 'recruit', 'treasure', 'event', 'shop', 'battle', 'blacksmith', 'sea', 'ambush', 'elite', 'boss'];

it('great sea balance', () => {
  const process = (globalThis as unknown as { process: { env: Record<string, string> } }).process;
  const N = Number(process.env.SIMN ?? 8);
  for (const c of COMMANDERS.filter((x) => x.campaign === 'greatSea')) {
    let outset = 0, islands = 0, deaths = 0, battles = 0, navalWins = 0, navalFights = 0;
    const firstIsland: number[] = [];
    for (let s = 0; s < N; s++) {
      const run = newRun(s * 911 + 5, c.heroId) as RunWithEvent;
      let alive = true;
      for (let step = 0; step < 70 && alive; step++) {
        if (!run.battle && !run.event) {
          const opts = availableNodes(run);
          if (!opts.length) break;
          const avg = run.roster.reduce((t, u) => t + u.level, 0) / run.roster.length;
          const fresh = opts.filter((n) => !n.visited);
          const pool = (fresh.length ? fresh : opts).filter((n) => n.type !== 'boss' || avg >= 3 + seaOf(run).cleared.length * 1.5 || !run.currentNodeId);
          const pick = (pool.length ? pool : opts).sort((a, b) => PREF.indexOf(a.type) - PREF.indexOf(b.type))[0];
          enterNode(run, pick.id);
        }
        if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
        if (run.event?.type === 'dungeon') descendDungeon(run);
        if (run.battle) {
          run.battle.units.find((u) => u.isCommander)?.ai && (run.battle.units.find((u) => u.isCommander)!.ai = 'guard');
          const naval = !!run.battle.naval;
          const isBoss = run.battle.nodeType === 'boss';
          const res = autoPlay(run.battle, s + step);
          run.battle.result = res;
          const bb = run.battle;
          const lastType = bb.nodeType, lastTurn = bb.turn, lastCmdr = bb.fallen.some((u) => u.isCommander), lastLv = bb.enemyLevel;
          const lastP = bb.units.flatMap((u) => [u, ...(u.cargo ?? [])]).filter((u) => u.team === 'player').length;
          const lastE = bb.units.flatMap((u) => [u, ...(u.cargo ?? [])]).filter((u) => u.team === 'enemy').map((u) => u.name).join('/');
          battles++;
          if (naval) { navalFights++; if (res === 'won') navalWins++; }
          const wasOutset = !seaOf(run).cleared.includes('outset');
          const sum = finishBattle(run);
          if (!sum.won && !sum.retreated) {
            const fb = (run as unknown as { _b?: Battle })._b;
            void fb;
            alive = false; deaths++;
            if (process.env.SIMLOG) console.log('   LOSS', c.heroId, 'step', step, 'naval', naval, 'type', lastType, 'turn', lastTurn, 'cmdrFell', lastCmdr, 'players', lastP, 'enemies', lastE, 'avgLv', (run.roster.reduce((t, u) => t + u.level, 0) / Math.max(1, run.roster.length)).toFixed(1), 'eLv', lastLv);
            break;
          }
          if (isBoss && sum.won && wasOutset && seaOf(run).cleared.includes('outset')) outset++;
          else if (isBoss && sum.won && seaOf(run).cleared.length === 2) firstIsland.push(step);
          continue;
        }
        const ev = run.event;
        if (!ev) continue;
        if (ev.type === 'recruit') { if (!recruit(run, ev.offers[0])) run.event = undefined; }
        else if (ev.type === 'camp') campRest(run);
        else if (ev.type === 'fountain') fountainHeal(run);
        else if (ev.type === 'treasure') takeTreasure(run, null, null);
        else if (ev.type === 'shop') { buySupplies(run); run.event = undefined; }
        else if (ev.type === 'event') { if (!chooseEvent(run, 0)) chooseEvent(run, 1); run.event = undefined; }
        else run.event = undefined;
      }
      islands += seaOf(run).cleared.length;
    }
    console.log(`${c.heroId.padEnd(12)} outset ${outset}/${N}  islands/run ${(islands / N).toFixed(1)}  died ${deaths}/${N}  battles ${battles}  sea battles won ${navalWins}/${navalFights}  first island at step ${firstIsland.length ? (firstIsland.reduce((a, b) => a + b, 0) / firstIsland.length).toFixed(0) : '-'}`);
  }
}, 900000);
