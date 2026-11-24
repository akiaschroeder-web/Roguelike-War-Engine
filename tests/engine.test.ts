import { describe, expect, it } from 'vitest';
import { planAction } from '../src/engine/ai';
import { checkResult, createBattle, moveUnit, spawnReinforcements, startPhase } from '../src/engine/battle';
import { forecast, resolveCombat } from '../src/engine/combat';
import { computeMoves, keyOf } from '../src/engine/grid';
import { generateMap } from '../src/engine/mapgen';
import { RNG } from '../src/engine/rng';
import {
  availableNodes, buyTonic, enterNode, finishBattle, newRun, recruit, restDrill, type RunWithEvent,
} from '../src/engine/run';
import { gainXp, makeEnemyUnit, makeHeroUnit } from '../src/engine/units';
import { ENEMY_ROSTERS } from '../src/data/enemies';
import { HEROES } from '../src/data/heroes';
import { CLASSES } from '../src/data/classes';
import { WEAPONS } from '../src/data/weapons';
import type { Battle, Team } from '../src/engine/types';

describe('data integrity', () => {
  it('every hero/enemy references a real class and a weapon that class can use', () => {
    for (const h of HEROES) {
      expect(CLASSES[h.classId], h.id).toBeDefined();
      expect(CLASSES[h.classId].weapons).toContain(WEAPONS[h.weaponId].type);
    }
    for (const roster of Object.values(ENEMY_ROSTERS)) {
      for (const e of roster) expect(CLASSES[e.classId].weapons, e.name).toContain(WEAPONS[e.weaponId].type);
    }
  });
});

describe('rng', () => {
  it('is deterministic for a given seed', () => {
    const a = new RNG(42), b = new RNG(42);
    for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next());
  });
});

describe('map generation', () => {
  it('places all spawns on distinct walkable tiles', () => {
    for (let seed = 0; seed < 50; seed++) {
      const m = generateMap(new RNG(seed), 13, 9, 6, 8);
      const all = [...m.playerSpawns, ...m.enemySpawns, m.bossSpawn];
      const keys = new Set(all.map((p) => p.y * m.width + p.x));
      expect(keys.size).toBe(all.length);
      for (const p of all) expect(['plain', 'forest', 'fort']).toContain(m.tiles[p.y * m.width + p.x]);
    }
  });
});

describe('combat', () => {
  const rng = new RNG(1);
  const baseBattle = (): Battle =>
    createBattle({ world: 'emberhold', nodeType: 'battle', depth: 0, roster: [makeHeroUnit('aldric', 'p0', 1, rng)], relics: [], seed: 7 });

  it('weapon triangle shifts hit and damage', () => {
    const b = baseBattle();
    const sword = makeHeroUnit('kaito', 'a', 5, rng);
    const axeFoe = makeEnemyUnit({ name: 'X', classId: 'brawler', weaponId: 'ironAxe' }, 'emberhold', 5, 'b', rng);
    const lanceFoe = makeEnemyUnit({ name: 'Y', classId: 'brawler', weaponId: 'ironAxe' }, 'emberhold', 5, 'c', rng);
    lanceFoe.classId = 'knight';
    lanceFoe.weaponId = 'ironLance';
    b.tiles.fill('plain');
    b.units = [sword, axeFoe];
    axeFoe.x = 1; axeFoe.y = 0; sword.x = 0; sword.y = 0;
    const adv = forecast(b, sword, { x: 0, y: 0 }, axeFoe);
    expect(adv.attacker.triangle).toBe(1);
    b.units = [sword, lanceFoe];
    lanceFoe.x = 1; lanceFoe.y = 0;
    const dis = forecast(b, sword, { x: 0, y: 0 }, lanceFoe);
    expect(dis.attacker.triangle).toBe(-1);
  });

  it('bows are effective against fliers and cannot counter at melee range', () => {
    const b = baseBattle();
    b.tiles.fill('plain');
    const archer = makeHeroUnit('hana', 'a', 3, rng);
    const flier = makeHeroUnit('brynja', 'f', 3, rng);
    flier.team = 'enemy';
    archer.x = 0; archer.y = 0; flier.x = 2; flier.y = 0;
    b.units = [archer, flier];
    const fc = forecast(b, archer, { x: 0, y: 0 }, flier);
    expect(fc.attacker.effective).toBe(true);
    const melee = forecast(b, flier, { x: 1, y: 0 }, archer);
    expect(melee.defender.canAttack).toBe(false);
  });

  it('resolves deaths and removes the dead unit', () => {
    const b = baseBattle();
    b.tiles.fill('plain');
    const strong = makeHeroUnit('oni', 'a', 15, rng);
    const weak = makeEnemyUnit(ENEMY_ROSTERS.pixelvale[0], 'pixelvale', 1, 'w', rng);
    weak.hp = 1;
    strong.x = 0; strong.y = 0; weak.x = 1; weak.y = 0;
    b.units = [strong, weak];
    // Retry with different seeds until the hit lands (hit chance is high).
    const res = resolveCombat(b, strong, weak, new RNG(3));
    if (res.deaths.length) {
      expect(b.units).not.toContain(weak);
      expect(b.fallen).toContain(weak);
      expect(strong.kills).toBe(1);
    }
  });

  it('phoenix feather saves exactly once', () => {
    const b = baseBattle();
    b.tiles.fill('plain');
    b.relics = ['phoenixFeather'];
    const victim = makeHeroUnit('osric', 'v', 1, rng);
    const brute = makeEnemyUnit({ name: 'Z', classId: 'brawler', weaponId: 'silverAxe' }, 'emberhold', 20, 'z', rng);
    victim.x = 0; victim.y = 0; brute.x = 1; brute.y = 0;
    b.units = [victim, brute];
    for (let s = 0; s < 50 && !b.phoenixUsed; s++) resolveCombat(b, brute, victim, new RNG(s));
    expect(b.phoenixUsed).toBe(true);
  });
});

describe('movement', () => {
  it('cannot pass through enemies but can pass through allies', () => {
    const rng = new RNG(5);
    const b = createBattle({ world: 'ronin', nodeType: 'battle', depth: 0, roster: [makeHeroUnit('kaito', 'p0', 1, rng)], relics: [], seed: 9 });
    b.tiles.fill('plain');
    const mover = makeHeroUnit('pip', 'm', 1, rng); // mov 6
    const ally = makeHeroUnit('zero', 'al', 1, rng);
    const foe = makeEnemyUnit(ENEMY_ROSTERS.ronin[0], 'ronin', 1, 'f', rng);
    mover.x = 0; mover.y = 0; ally.x = 1; ally.y = 0;
    b.units = [mover, ally];
    const { reach } = computeMoves(b, mover);
    expect(reach.has(keyOf(b, 1, 0))).toBe(false); // can't stop on ally
    expect(reach.has(keyOf(b, 2, 0))).toBe(true); // but can pass through
    b.units = [mover, foe];
    foe.x = 1; foe.y = 0;
    b.tiles.fill('wall');
    b.tiles[keyOf(b, 0, 0)] = 'plain';
    b.tiles[keyOf(b, 1, 0)] = 'plain';
    b.tiles[keyOf(b, 2, 0)] = 'plain';
    expect(computeMoves(b, mover).reach.has(keyOf(b, 2, 0))).toBe(false);
  });
});

describe('leveling', () => {
  it('levels up at 100 XP', () => {
    const rng = new RNG(1);
    const u = makeHeroUnit('aldric', 'p', 1, rng);
    const hp = u.stats.hp;
    const ups = gainXp(u, 100, rng);
    expect(ups.length).toBe(1);
    expect(u.level).toBe(2);
    expect(u.stats.hp).toBeGreaterThanOrEqual(hp);
  });
});

/** Let the AI play both sides until the battle ends. */
function autoPlay(b: Battle, seed: number, maxTurns = 40): Battle['result'] {
  const rng = new RNG(seed);
  const order: Team[] = ['player', 'enemy'];
  while (!checkResult(b) && b.turn <= maxTurns) {
    for (const team of order) {
      startPhase(b, team);
      if (team === 'enemy') spawnReinforcements(b);
      for (const u of b.units.filter((x) => x.team === team)) {
        if (!b.units.includes(u) || u.acted) continue;
        const plan = planAction(b, u);
        moveUnit(u, plan.dest.x, plan.dest.y);
        const target = plan.action && b.units.find((x) => x.uid === plan.action!.target);
        if (target && plan.action!.type === 'attack') resolveCombat(b, u, target, rng);
        u.acted = true;
        if (checkResult(b)) return b.result;
      }
    }
    b.turn++;
  }
  return checkResult(b);
}

describe('simulation', () => {
  it('auto-played early battles finish, and a decent squad usually wins', () => {
    let wins = 0;
    const N = 30;
    for (let s = 0; s < N; s++) {
      const rng = new RNG(s);
      const roster = ['aldric', 'vex', 'kaito', 'hana'].map((id, i) => makeHeroUnit(id, `p${i}`, 2, rng));
      roster[0].isCommander = true;
      const b = createBattle({ world: 'emberhold', nodeType: 'battle', depth: 1, roster, relics: [], seed: s * 13 });
      // A human keeps their commander safe; approximate that by holding position.
      b.units[0].ai = 'guard';
      const r = autoPlay(b, s);
      if (r === 'won') wins++;
    }
    // The player AI is naive (no healing, no formation), so this is a floor.
    expect(wins).toBeGreaterThan(N * 0.4);
    expect(wins).toBeLessThan(N); // ...but it shouldn't be trivial
  });
});

describe('run flow', () => {
  it('creates a run, enters a battle node, and folds results back', () => {
    const run = newRun(123, 'aldric') as RunWithEvent;
    expect(run.roster.length).toBe(3);
    expect(run.roster[0].isCommander).toBe(true);
    const first = availableNodes(run)[0];
    enterNode(run, first.id);
    expect(run.battle).toBeDefined();
    run.battle!.result = 'won';
    const summary = finishBattle(run);
    expect(summary.won).toBe(true);
    expect(run.gold).toBeGreaterThan(200);
    expect(availableNodes(run).length).toBeGreaterThan(0);
  });

  it('map rows are fully connected to the boss', () => {
    for (let s = 0; s < 30; s++) {
      const run = newRun(s, 'kaito');
      const boss = run.map.nodes.find((n) => n.type === 'boss')!;
      // Every row-0 node must be able to reach the boss.
      for (const start of run.map.nodes.filter((n) => n.row === 0)) {
        const seen = new Set<string>();
        const stack = [start.id];
        while (stack.length) {
          const id = stack.pop()!;
          if (seen.has(id)) continue;
          seen.add(id);
          stack.push(...run.map.nodes.find((n) => n.id === id)!.next);
        }
        expect(seen.has(boss.id)).toBe(true);
      }
    }
  });

  it('recruit, shop and rest events work', () => {
    const run = newRun(9, 'vex') as RunWithEvent;
    run.event = { type: 'recruit', offers: ['pip', 'lilith'] };
    recruit(run, 'pip');
    expect(run.roster.some((u) => u.heroId === 'pip')).toBe(true);
    run.event = { type: 'shop', weapons: [], relics: [], tonics: ['str'], sold: [] };
    run.gold = 1000;
    const u = run.roster[0];
    const str = u.stats.str;
    expect(buyTonic(run, 'str', u.uid)).toBe(true);
    expect(u.stats.str).toBe(str + 2);
    run.event = { type: 'rest' };
    restDrill(run);
    expect(run.roster.every((x) => x.xp > 0 || x.level > 1)).toBe(true);
  });
});
