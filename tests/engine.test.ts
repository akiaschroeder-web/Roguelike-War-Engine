import { describe, expect, it } from 'vitest';
import {
  GEAR, ITEMS, BOSSES, CLASSES, COMMANDERS, ENEMIES, PERMANENT_ITEMS, RACES, REGION_BOSSES, REGION_IDS, ROSTERS, SKILLS, TEMPLATE_LIST, TEMPLATES, WEAPONS, WORLDS,
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
import { effectiveStats, gainXp, makeEnemy, makeHero } from '../src/engine/units';
import { canUse, useItem } from '../src/engine/items';
import { castAbility } from '../src/engine/abilities';
import { fountainTeach, useItemOutside } from '../src/engine/run';
import { migrateRun } from '../src/engine/run';
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
    for (const b of Object.values(BOSSES)) for (const d of b.drops ?? []) expect(WEAPONS[d] ?? GEAR[d], d).toBeDefined();
    for (const c of COMMANDERS) for (const id of c.startingItems ?? []) expect(WEAPONS[id] ?? GEAR[id] ?? ITEMS[id], id).toBeDefined();
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
    hero.gear.acc1 = 'triforceCourage';
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

describe('ai', () => {
  it('guards eventually advance so battles cannot stall', () => {
    const b = emptyBattle(14, 6);
    const p = place(makeHero('link', 'l', 1, rng()), 0, 2);
    const g = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'g', rng()), 13, 2);
    g.ai = 'guard';
    const g2 = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'g2', rng()), 13, 4);
    const g3 = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'g3', rng()), 13, 0);
    g2.ai = g3.ai = 'guard';
    b.units = [p, g, g2, g3];
    expect(planAction(b, g).dest).toEqual({ x: 13, y: 2 }); // early: holds position
    b.turn = 6;
    expect(planAction(b, g).dest.x).toBeLessThan(13); // later: advances
  });
});

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

  it('never offers Link and Young Link together', () => {
    const run = newRun(3, 'link');
    for (let s = 0; s < 40; s++) expect(recruitOffers(run, new RNG(s), 'kokiriForest')).not.toContain('youngLink');
  });

  it('every unit is in the recruitment pool, including villains, bosses and creatures', () => {
    for (const id of ['ganondorf', 'ganon', 'twinrova', 'queenGohma', 'bongoBongo', 'darkLink', 'phantomGanon', 'keese', 'octorok', 'ironKnuckleNabooru']) {
      expect(TEMPLATES[id], id).toBeDefined();
    }
    expect(TEMPLATES.ganondorfBoss).toBeUndefined(); // same person as the Ganondorf template
    const run = newRun(3, 'zelda');
    run.act = 6;
    const seen = new Set<string>();
    for (let s = 0; s < 400; s++) recruitOffers(run, new RNG(s), 'hyruleCastle').forEach((id) => seen.add(id));
    expect(seen.has('ganondorf')).toBe(true);
    expect([...seen].some((id) => TEMPLATES[id].rare)).toBe(true);
    expect([...seen].some((id) => TEMPLATES[id].monster)).toBe(true);
  });

  it('forms of the same person exclude each other, and recruited bosses stop appearing as bosses', () => {
    const run = newRun(7, 'ganondorf') as RunWithEvent;
    for (let s = 0; s < 60; s++) expect(recruitOffers(run, new RNG(s), 'hyruleCastle')).not.toContain('ganon');
    // Ganondorf's army never faces Ganondorf or Ganon.
    advanceRegion(run, 'hyruleCastle');
    const boss = run.map.nodes.find((n) => n.type === 'boss')!;
    run.currentNodeId = run.map.nodes.find((n) => n.next.includes(boss.id))!.id;
    enterNode(run, boss.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    const b = run.battle!.units.find((u) => u.isBoss)!;
    expect(['ganondorfBoss', 'ganon']).not.toContain(b.bossId);
  });

  it('shop purchases apply', () => {
    const run = newRun(4, 'nabooru') as RunWithEvent;
    run.rupees = 5000;
    run.event = { type: 'shop', weapons: ['gerudoScimitar'], gear: ['gerudoJewel'], items: ['redPotion'], permanents: ['powerGem'], sold: [] };
    const u = run.roster[0];
    const str = u.stats.str;
    expect(buy(run, 'permanent', 'powerGem', u.uid)).toBe(true);
    expect(u.stats.str).toBe(str + 2);
    expect(buy(run, 'gear', 'gerudoJewel', u.uid)).toBe(true);
    expect(Object.values(u.gear)).toContain('gerudoJewel');
    // Consumables can be bought more than once.
    expect(buy(run, 'item', 'redPotion', u.uid)).toBe(true);
    expect(buy(run, 'item', 'redPotion', u.uid)).toBe(true);
    expect(u.pack.find((p) => p.id === 'redPotion')?.uses).toBe(2);
  });
});

describe('equipment and items', () => {
  it('gear adds stats, and a shield does nothing with a two-handed weapon', () => {
    const u = makeHero('link', 'l', 1, rng());
    const def = u.stats.def;
    u.gear.shield = 'hylianShield';
    u.gear.body = 'kokiriTunic';
    expect(effectiveStats(u).def).toBe(def + 4 + 1);
    u.weapons = ['giantsKnife'];
    expect(effectiveStats(u).def).toBe(def + 1);
  });

  it('shields can block, halving damage', () => {
    const b = emptyBattle();
    const knight = place(makeHero('link', 'k', 1, rng()), 1, 0);
    knight.gear.shield = 'ironKnuckleShield';
    const foe = place(makeEnemy(ENEMIES.dinolfos, 'hyruleField', 10, 'f', rng()), 0, 0);
    b.units = [knight, foe];
    expect(forecast(b, foe, foe, knight).attacker.block).toBe(35);
    let blocked = false;
    for (let s = 0; s < 40 && !blocked; s++) {
      knight.hp = knight.stats.hp;
      blocked = resolveCombat(b, foe, knight, new RNG(s)).strikes.some((x) => x.blocked);
      if (!b.units.includes(knight)) b.units.push(knight);
    }
    expect(blocked).toBe(true);
  });

  it('a Bottled Fairy revives its holder once', () => {
    const b = emptyBattle();
    const hero = place(makeHero('saria', 's', 1, rng()), 0, 0);
    hero.pack = [{ id: 'fairy', uses: 1 }];
    hero.hp = 1;
    const brute = place(makeEnemy(ENEMIES.dinolfos, 'hyruleField', 20, 'z', rng()), 1, 0);
    b.units = [hero, brute];
    let saved = false;
    for (let s = 0; s < 60 && !saved; s++) saved = resolveCombat(b, brute, hero, new RNG(s)).strikes.some((x) => x.saved === 'fairy');
    expect(saved).toBe(true);
    expect(hero.pack.length).toBe(0);
    expect(hero.hp).toBeGreaterThan(1);
  });

  it('potions heal, bombs blast enemies in the radius, Deku Nuts stun', () => {
    const b = emptyBattle();
    const u = place(makeHero('link', 'l', 1, rng()), 0, 0);
    u.pack = [{ id: 'redPotion', uses: 1 }, { id: 'bomb', uses: 3 }, { id: 'dekuNut', uses: 3 }];
    const e1 = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'a', rng()), 3, 0);
    const e2 = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'b', rng()), 3, 1);
    const far = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'c', rng()), 6, 0);
    b.units = [u, e1, e2, far];
    expect(canUse(u, 0)).toBe(false); // full HP
    u.hp -= 10;
    useItem(b, u, 0, rng());
    expect(u.hp).toBe(u.stats.hp);
    expect(u.pack[0].id).toBe('bomb');
    const hp1 = e1.hp, hp2 = e2.hp, hpFar = far.hp;
    useItem(b, u, 0, rng(), { x: 3, y: 0 });
    expect(e1.hp).toBe(Math.max(0, hp1 - 10));
    expect(e2.hp).toBe(Math.max(0, hp2 - 10));
    expect(far.hp).toBe(hpFar);
    expect(u.pack[0].uses).toBe(2);
    expect(useItem(b, u, 0, rng(), { x: 6, y: 0 })).toBeNull(); // out of range
    useItem(b, u, 1, rng(), { x: 2, y: 0 });
    expect(e1.statuses).toEqual([{ kind: 'stun', turns: 1 }]);
    expect(e2.statuses).toEqual([]); // two spaces from the impact: outside the radius
    // Stunned enemies lose their next phase.
    startPhase(b, 'enemy');
    expect(e1.acted).toBe(true);
    expect(e2.acted).toBe(false);
    expect(e1.statuses).toEqual([]); // wore off
  });

  it('commanders start with their gear', () => {
    const z = newRun(2, 'zelda');
    const cmd = z.roster[0];
    expect(cmd.gear.shield).toBe('hylianShield');
    expect(cmd.gear.body).toBe('soldierArmor');
    expect(cmd.pack).toEqual([{ id: 'redPotion', uses: 2 }]); // two potions stack in one slot
    const d = newRun(2, 'darunia');
    expect(d.roster[0].pack).toEqual([{ id: 'bomb', uses: 6 }]);
    const r = newRun(2, 'ruto');
    expect(Object.values(r.roster[0].gear)).toEqual(expect.arrayContaining(['zoraTunic', 'silverScale']));
  });

  it('migrates old saves with a single accessory', () => {
    const run = newRun(4, 'link') as RunWithEvent & { roster: (Unit & { accessory?: string })[] };
    const u = run.roster[0] as Unit & { accessory?: string };
    (u as unknown as { gear?: unknown }).gear = undefined;
    (u as unknown as { pack?: unknown }).pack = undefined;
    u.accessory = 'kokiriCharm';
    migrateRun(run);
    expect(u.gear.acc1).toBe('kokiriCharm');
    expect(u.pack).toEqual([]);
  });
});

describe('magic and status effects', () => {
  it('statuses tick: burn and poison never kill, freeze and stun cost a turn', () => {
    const b = emptyBattle();
    const u = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'a', rng()), 0, 0);
    b.units = [u];
    u.hp = 2;
    u.statuses = [{ kind: 'burn', turns: 2 }, { kind: 'poison', turns: 3 }];
    startPhase(b, 'enemy');
    expect(u.hp).toBe(1);
    expect(u.acted).toBe(false);
    u.statuses = [{ kind: 'freeze', turns: 1 }];
    startPhase(b, 'enemy');
    expect(u.acted).toBe(true);
    expect(u.statuses).toEqual([]);
  });

  it('elemental weapons can burn, and damage thaws frozen targets', () => {
    const b = emptyBattle();
    const witch = place(makeHero('koume', 'k', 5, rng()), 0, 0);
    const foe = place(makeEnemy(ENEMIES.moblin, 'hyruleField', 15, 'm', rng()), 1, 0);
    b.units = [witch, foe];
    let burned = false;
    for (let s = 0; s < 60 && !burned; s++) {
      foe.hp = foe.stats.hp; witch.hp = witch.stats.hp; foe.statuses = [];
      burned = resolveCombat(b, witch, foe, new RNG(s)).strikes.some((x) => x.statuses?.includes('burn'));
      if (!b.units.includes(foe)) b.units.push(foe);
      if (!b.units.includes(witch)) b.units.push(witch);
    }
    expect(burned).toBe(true);
    // Frozen units can't counter.
    foe.statuses = [{ kind: 'freeze', turns: 1 }];
    expect(forecast(b, witch, witch, foe).defender.canAttack).toBe(false);
  });

  it("Din's Fire, Nayru's Love, Farore's Wind and songs", () => {
    const b = emptyBattle();
    const fairy = place(makeHero('greatFairy', 'g', 5, rng()), 4, 3);
    expect(fairy.abilities).toEqual(expect.arrayContaining(['dinsFire', 'nayrusLove', 'faroresWind', 'greatFairysBlessing']));
    const near = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'n', rng()), 7, 3);
    const far = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'f', rng()), 11, 3);
    b.units = [fairy, near, far];
    const mp = fairy.mp;
    const hpNear = near.hp, hpFar = far.hp;
    castAbility(b, fairy, 'dinsFire', rng());
    expect(near.hp).toBeLessThan(hpNear);
    expect(far.hp).toBe(hpFar);
    expect(fairy.mp).toBe(mp - 8);
    castAbility(b, fairy, 'nayrusLove', rng());
    expect(forecast(b, near, near, fairy).attacker.dmg).toBe(0);
    castAbility(b, fairy, 'faroresWind', rng());
    fairy.x = 0; fairy.y = 0;
    castAbility(b, fairy, 'faroresWind', rng());
    expect({ x: fairy.x, y: fairy.y }).toEqual({ x: 4, y: 3 });

    const saria = place(makeHero('saria', 's', 1, rng()), 1, 1);
    const ally = place(makeHero('link', 'l', 1, rng()), 2, 1);
    ally.statuses = [{ kind: 'poison', turns: 3 }];
    b.units = [saria, ally];
    const spd = effectiveStats(ally).spd;
    expect(castAbility(b, saria, 'sariasSong', rng())).not.toBeNull();
    expect(effectiveStats(ally).spd).toBe(spd + 2);
    // Songs need an instrument.
    saria.weapons = saria.weapons.filter((w) => w !== 'fairyOcarina');
    expect(castAbility(b, saria, 'sariasSong', rng())).toBeNull();
  });

  it('elemental arrows add might and cost MP', () => {
    const b = emptyBattle();
    const archer = place(makeHero('hyruleArcher', 'a', 5, rng()), 0, 0);
    archer.abilities.push('lightArrow');
    archer.stats.mp = archer.mp = 10;
    const ghoul = place(makeEnemy(ENEMIES.redead, 'kakarikoGraveyard', 5, 'r', rng()), 2, 0);
    b.units = [archer, ghoul];
    const plain = forecast(b, archer, archer, ghoul).attacker.dmg;
    const lit = forecast(b, archer, archer, ghoul, undefined, 'lightArrow').attacker;
    expect(lit.effective).toBe(true);
    expect(lit.dmg).toBeGreaterThan(plain);
    resolveCombat(b, archer, ghoul, rng(), undefined, 'lightArrow');
    expect(archer.mp).toBe(6);
  });

  it('learning from sheet music and the Great Fairy', () => {
    const run = newRun(8, 'link') as RunWithEvent;
    const link = run.roster[0];
    expect(link.weapons).toContain('fairyOcarina');
    link.pack.push({ id: 'sheetStorms', uses: 1 });
    expect(useItemOutside(run, link.uid, link.pack.length - 1)).toBe(true);
    expect(link.abilities).toContain('songOfStorms');
    run.event = { type: 'fountain' };
    const id = fountainTeach(run, link.uid);
    expect(['dinsFire', 'faroresWind', 'nayrusLove']).toContain(id);
    expect(link.abilities).toContain(id);
  });
});
