import { describe, expect, it } from 'vitest';
import {
  ACCESSORIES, BOSSES, CLASSES, COMMANDERS, ENEMIES, PERMANENT_ITEMS, RACES, REGION_BOSSES, REGION_IDS, ROSTERS, SKILLS, TEMPLATE_LIST, TEMPLATES, WEAPONS, WORLDS,
} from '../src/data/registry';
import { planAction } from '../src/engine/ai';
import { checkResult, createBattle, moveUnit, spawnReinforcements, startPhase } from '../src/engine/battle';
import { canWield, findInterceptor, forecast, resolveCombat } from '../src/engine/combat';
import { computeMoves, footDist, keyOf, unitAt } from '../src/engine/grid';
import { generateMap } from '../src/engine/mapgen';
import { RNG } from '../src/engine/rng';
import {
  advanceRegion, availableNodes, buy, enterNode, finishBattle, newRun, offerRegions, recruit, recruitOffers, startBattle, type RunWithEvent,
} from '../src/engine/run';
import { gainXp, makeEnemy, makeHero } from '../src/engine/units';
import type { Battle, Team, Unit } from '../src/engine/types';

const rng = () => new RNG(1);

function emptyBattle(w = 12, h = 8): Battle {
  const b = createBattle({ world: 'hyruleField', nodeType: 'battle', depth: 0, roster: [makeHero('link', 'p0', 1, rng())], seed: 7 });
  b.width = w; b.height = h;
  b.tiles = new Array(w * h).fill('plain');
  b.units = [];
  return b;
}
const place = (u: Unit, x: number, y: number, team: Team = u.team) => Object.assign(u, { x, y, team });

describe('content integrity', () => {
  it('every unit, enemy and boss can wield its weapons', () => {
    for (const t of TEMPLATE_LIST) {
      expect(CLASSES[t.classId], t.id).toBeDefined();
      expect(RACES[t.race], t.id).toBeDefined();
      expect(WORLDS[t.home], t.id).toBeDefined();
      for (const w of t.weapons) {
        expect(WEAPONS[w], `${t.id}:${w}`).toBeDefined();
        expect(canWield(makeHero(t, 'x', 1, rng()), WEAPONS[w]), `${t.id} can't wield ${w}`).toBe(true);
      }
      if (t.skill) expect(SKILLS[t.skill], t.skill).toBeDefined();
    }
    for (const e of [...Object.values(ENEMIES), ...Object.values(BOSSES)]) {
      expect(CLASSES[e.classId], e.id).toBeDefined();
      expect(RACES[e.race], e.id).toBeDefined();
      const u = makeEnemy(e, 'hyruleField', 1, 'x', rng());
      for (const w of e.weapons) expect(canWield(u, WEAPONS[w]), `${e.id} can't wield ${w}`).toBe(true);
      if (e.skill) expect(SKILLS[e.skill], e.skill).toBeDefined();
    }
  });

  it('rosters, boss pools, drops and commanders reference real content', () => {
    for (const r of REGION_IDS) {
      expect(ROSTERS[r]?.length, r).toBeGreaterThan(0);
      expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0);
      for (const id of ROSTERS[r]) expect(ENEMIES[id], id).toBeDefined();
      for (const id of REGION_BOSSES[r]) expect(BOSSES[id], id).toBeDefined();
    }
    for (const b of Object.values(BOSSES)) for (const d of b.drops ?? []) expect(WEAPONS[d] ?? ACCESSORIES[d], d).toBeDefined();
    expect(COMMANDERS.length).toBe(6);
    for (const c of COMMANDERS) {
      expect(TEMPLATES[c.heroId]).toBeDefined();
      for (const id of c.units) expect(TEMPLATES[id], id).toBeDefined();
    }
    expect(Object.keys(PERMANENT_ITEMS).length).toBeGreaterThan(0);
  });

  it('uses the design doc sizes and stats', () => {
    expect(TEMPLATES.biggoron.size).toBe(5);
    expect(TEMPLATES.dekuTree.size).toBe(5);
    expect(TEMPLATES.darunia.size).toBe(2);
    expect(TEMPLATES.link.stats).toMatchObject({ hp: 24, str: 8, mag: 3, skl: 9, spd: 10, def: 7, res: 4, lck: 8, con: 9, mov: 5 });
    expect(BOSSES.bongoBongo.size).toBe(5);
    expect(BOSSES.ganon.stats.hp).toBe(60);
  });
});

describe('unit sizes', () => {
  it('large units occupy their whole footprint', () => {
    const b = emptyBattle();
    const big = place(makeHero('darunia', 'd', 1, rng()), 3, 3);
    b.units = [big];
    expect(unitAt(b, 4, 4)).toBe(big);
    expect(unitAt(b, 5, 4)).toBeUndefined();
  });

  it('a 2×2 unit cannot squeeze through a 1-wide gap', () => {
    const b = emptyBattle(10, 5);
    for (let y = 0; y < 5; y++) if (y !== 2) b.tiles[keyOf(b, 5, y)] = 'wall';
    const big = place(makeHero('darunia', 'd', 1, rng()), 2, 1);
    big.stats.mov = 20;
    const small = place(makeHero('link', 'l', 1, rng()), 2, 0);
    small.stats.mov = 20;
    b.units = [big];
    expect([...computeMoves(b, big).reach.keys()].some((k) => k % b.width >= 6)).toBe(false);
    b.units = [small];
    expect([...computeMoves(b, small).reach.keys()].some((k) => k % b.width >= 6)).toBe(true);
  });

  it('attack distance is measured from the footprint edge', () => {
    expect(footDist(0, 0, 3, 3, 0, 1)).toBe(1);
    expect(footDist(0, 0, 3, 4, 1, 1)).toBe(2);
    expect(footDist(0, 0, 2, 1, 1, 1)).toBe(0);
  });

  it('maps fit even the 5×5 units', () => {
    for (let s = 0; s < 15; s++) {
      const m = generateMap(new RNG(s), 19, 11, WORLDS.deathMountain.map, [5, 1, 1, 2], [1, 2, 1, 1, 1], 4);
      expect(m.playerSpawns.length).toBe(4);
      expect(m.bossSpawn).not.toBeNull();
    }
  });
});

describe('combat', () => {
  it('weapon triangle, effectiveness and weight', () => {
    const b = emptyBattle();
    const sword = place(makeHero('hyruleSoldier', 'a', 3, rng()), 0, 0);
    sword.weapons = ['soldierSword'];
    const axe = place(makeEnemy(ENEMIES.ironKnuckle, 'hyruleField', 3, 'b', rng()), 1, 0);
    b.units = [sword, axe];
    expect(forecast(b, sword, sword, axe).attacker.triangle).toBe(1);

    const sling = place(makeHero('kokiriSlingshooter', 'c', 1, rng()), 0, 4);
    const bat = place(makeEnemy(ENEMIES.keese, 'kokiriForest', 1, 'k', rng()), 2, 4);
    b.units = [sling, bat];
    expect(forecast(b, sling, sling, bat).attacker.effective).toBe(true);
  });

  it('Spirit of Courage triggers against much stronger foes', () => {
    const b = emptyBattle();
    const link = place(makeHero('link', 'l', 1, rng()), 0, 0);
    const weak = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'w', rng()), 1, 0);
    const strong = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 6, 's', new RNG(1)), 1, 0);
    b.units = [link, weak];
    const vsWeak = forecast(b, link, link, weak).attacker.dmg;
    strong.stats = { ...weak.stats };
    b.units = [link, strong];
    expect(forecast(b, link, link, strong).attacker.dmg).toBe(vsWeak + 2);
  });

  it('Royal Protector intercepts for an adjacent ally', () => {
    const b = emptyBattle();
    const zelda = place(makeHero('zelda', 'z', 1, rng()), 2, 2);
    const impa = place(makeHero('impa', 'i', 1, rng()), 2, 1);
    const foe = place(makeEnemy(ENEMIES.moblin, 'hyruleField', 1, 'm', rng()), 3, 1);
    b.units = [zelda, impa, foe];
    // Moblin (2x2 at 3,1) is adjacent to Zelda and to Impa.
    expect(findInterceptor(b, foe, zelda)).toBe(impa);
  });

  it('kills remove the unit and the Triforce of Courage saves once', () => {
    const b = emptyBattle();
    const hero = place(makeHero('link', 'l', 1, rng()), 0, 0);
    hero.accessory = 'triforceCourage';
    hero.hp = 1;
    const brute = place(makeEnemy(ENEMIES.dinolfos, 'hyruleField', 20, 'z', rng()), 1, 0);
    b.units = [hero, brute];
    for (let s = 0; s < 60 && !hero.survivedOnce; s++) resolveCombat(b, brute, hero, new RNG(s));
    expect(hero.survivedOnce).toBe(true);
    expect(b.units).toContain(hero);
  });

  it('lava burns non-Gorons at turn start', () => {
    const b = emptyBattle();
    b.tiles[keyOf(b, 0, 0)] = 'lava';
    b.tiles[keyOf(b, 3, 3)] = 'lava';
    const link = place(makeHero('link', 'l', 1, rng()), 0, 0);
    const goron = place(makeHero('goronWarrior', 'g', 1, rng()), 3, 3);
    b.units = [link, goron];
    startPhase(b, 'player');
    expect(link.hp).toBeLessThan(link.stats.hp);
    expect(goron.hp).toBe(goron.stats.hp);
  });

  it('levels up at 100 XP', () => {
    const r = rng();
    const u = makeHero('link', 'p', 1, r);
    expect(gainXp(u, 100, r).length).toBe(1);
    expect(u.level).toBe(2);
  });
});

function autoPlay(b: Battle, seed: number, maxTurns = 40): Battle['result'] {
  const r = new RNG(seed);
  while (!checkResult(b) && b.turn <= maxTurns) {
    for (const team of ['player', 'enemy'] as Team[]) {
      startPhase(b, team);
      if (team === 'enemy') spawnReinforcements(b);
      for (const u of b.units.filter((x) => x.team === team)) {
        if (!b.units.includes(u) || u.acted) continue;
        const plan = planAction(b, u);
        moveUnit(u, plan.dest.x, plan.dest.y, plan.path.length - 1);
        const t = plan.action && b.units.find((x) => x.uid === plan.action!.target);
        if (t && plan.action!.type === 'attack') resolveCombat(b, u, t, r, plan.action!.weaponId);
        u.acted = true;
        if (checkResult(b)) return b.result;
      }
    }
    b.turn++;
  }
  return checkResult(b);
}

describe('simulation', () => {
  it('each starting army can win an early battle with naive AI play', () => {
    for (const c of COMMANDERS) {
      let wins = 0;
      const N = 12;
      for (let s = 0; s < N; s++) {
        const run = newRun(s * 31 + 1, c.heroId);
        const b = createBattle({ world: run.region, nodeType: 'battle', depth: 0, roster: run.roster, seed: s * 13 });
        b.units.find((u) => u.isCommander)!.ai = 'guard';
        if (autoPlay(b, s) === 'won') wins++;
      }
      expect(wins, c.heroId).toBeGreaterThan(N * 0.3);
    }
  });
});

describe('run flow', () => {
  it('starts each commander with their army', () => {
    const run = newRun(1, 'link');
    expect(run.roster.map((u) => u.templateId)).toEqual(['link', 'navi', 'malon', 'hyruleSoldier']);
    expect(run.roster[0].isCommander).toBe(true);
    const g = newRun(1, 'ganondorf');
    expect(g.roster.map((u) => u.templateId)).toEqual(['ganondorf', 'moblin', 'stalfos', 'lizalfos']);
  });

  it('battles fold back, HP persists, and regions go on forever', () => {
    const run = newRun(5, 'zelda') as RunWithEvent;
    enterNode(run, availableNodes(run)[0].id);
    const b = run.battle!;
    b.units.find((u) => u.isCommander)!.hp = 5;
    b.result = 'won';
    finishBattle(run);
    const cmd = run.roster.find((u) => u.isCommander)!;
    expect(cmd.hp).toBeLessThan(cmd.stats.hp);
    for (let i = 0; i < 12; i++) {
      offerRegions(run);
      expect(run.event?.type).toBe('region');
      advanceRegion(run, (run.event as { options: string[] }).options[0]);
    }
    expect(run.act).toBe(13);
    expect(availableNodes(run).length).toBeGreaterThan(0);
  });

  it('deployment caps the army in battle', () => {
    const run = newRun(9, 'link') as RunWithEvent;
    run.event = { type: 'recruit', offers: [] };
    while (run.roster.length < 10) { run.event = { type: 'recruit', offers: [] }; recruit(run, 'hyruleSoldier'); }
    enterNode(run, availableNodes(run)[0].id);
    expect(run.event?.type).toBe('deploy');
    startBattle(run, run.roster.slice(0, 8).map((u) => u.uid));
    expect(run.battle!.units.filter((u) => u.team === 'player').length).toBe(8);
  });

  it('never offers Link and Young Link together, and gates monsters', () => {
    const run = newRun(3, 'link');
    for (let s = 0; s < 30; s++) {
      const offers = recruitOffers(run, new RNG(s), 'kokiriForest');
      expect(offers).not.toContain('youngLink');
      expect(offers.some((id) => TEMPLATES[id].monster)).toBe(false);
    }
  });

  it('shop purchases apply', () => {
    const run = newRun(4, 'nabooru') as RunWithEvent;
    run.rupees = 5000;
    run.event = { type: 'shop', weapons: ['gerudoScimitar'], accessories: ['gerudoJewel'], permanents: ['powerGem'], sold: [] };
    const u = run.roster[0];
    const str = u.stats.str;
    expect(buy(run, 'permanent', 'powerGem', u.uid)).toBe(true);
    expect(u.stats.str).toBe(str + 2);
    expect(buy(run, 'accessory', 'gerudoJewel', u.uid)).toBe(true);
    expect(u.accessory).toBe('gerudoJewel');
  });
});
