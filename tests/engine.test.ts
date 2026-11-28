import { describe, expect, it } from 'vitest';
import {
  GEAR, ITEMS, BOSSES, CLASSES, COMMANDERS, ENEMIES, PERMANENT_ITEMS, RACES, REGION_BOSSES, REGION_IDS, ROSTERS, SKILLS, TEMPLATE_LIST, TEMPLATES, WEAPONS, WORLDS,
} from '../src/data/registry';
import { planAction } from '../src/engine/ai';
import { checkResult, createBattle, moveUnit, spawnReinforcements, startPhase, toggleMount } from '../src/engine/battle';
import { canWield, findInterceptor, forecast, resolveCombat } from '../src/engine/combat';
import { computeMoves, footDist, keyOf, unitAt } from '../src/engine/grid';
import { generateMap } from '../src/engine/mapgen';
import { RNG } from '../src/engine/rng';
import {
  advanceRegion, availableNodes, buy, enterNode, finishBattle, newRun, offerRegions, recruit, recruitOffers, startBattle, type RunWithEvent,
} from '../src/engine/run';
import { canRide, effectiveStats, forgeLevel, moveTypeOf, gainXp, makeEnemy, makeHero, prepareForBattle as prepareForBattleFn } from '../src/engine/units';
import { canUse, useItem } from '../src/engine/items';
import { castAbility } from '../src/engine/abilities';
import { fountainTeach, improveWeapon, pickForce, repairWeapon, useItemOutside } from '../src/engine/run';
import { gainSupport, isSPair, rankOf, supportKey } from '../src/engine/supports';
import { canChoose, chooseEvent, descendDungeon, migrateRun } from '../src/engine/run';
import { addStatus, onDamaged, rollElement, tickStatuses } from '../src/engine/status';
import { dig, environmentPhase, ignite, isSeen, plantBean, revealNearby, triggerTraps } from '../src/engine/field';
import { hookTiles } from '../src/engine/abilities';
import { freeCaptive } from '../src/engine/battle';
import { armyCap, deployCap, gainArmyXp, issueOrder, orderUnusable, useBlessing } from '../src/engine/army';
import { campFeast } from '../src/engine/run';
import { applyMetaToRun, awardMedals, bump, buyUpgrade, claimBounties, emptyProgress, trialMultiplier, unlockFormation, unlockKit } from '../src/engine/meta';
import { conversationFor } from '../src/content/ocarina/conversations';
import { ABILITIES, QUEST_ITEMS, SUPPORT_S_PAIRS } from '../src/data/registry';
import { enemyAutoTransform, unusableReason } from '../src/engine/abilities';
import { addQuestItem, clockLabel, deposit, songOfTimeReset } from '../src/engine/run';
import { canUseHere } from '../src/engine/items';
import { EVENTS } from '../src/data/registry';
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
    expect(COMMANDERS.length).toBe(96);
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
      advanceRegion(run, (run.event as unknown as { options: string[] }).options[0]);
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
    expect(run.battle!.units.filter((u) => u.team === 'player' && !u.npc).length).toBe(8);
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
    for (let s = 0; s < 3000; s++) recruitOffers(run, new RNG(s), 'hyruleCastle').forEach((id) => seen.add(id));
    expect(seen.has('ganondorf')).toBe(true);
    expect([...seen].some((id) => TEMPLATES[id].rare)).toBe(true);
    expect([...seen].some((id) => TEMPLATES[id].monster)).toBe(true);
  });

  it('forms of the same person are not offered together in recruitment', () => {
    const run = newRun(7, 'ganondorf') as RunWithEvent;
    for (let s = 0; s < 60; s++) expect(recruitOffers(run, new RNG(s), 'hyruleCastle')).not.toContain('ganon');
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

describe('enemy armies, techniques and warp songs', () => {
  it('battles are not always monsters: regional armies, rival heroes and named leaders appear', () => {
    let army = 0, monsters = 0, leaders = 0, rivals = 0;
    for (let s = 0; s < 120; s++) {
      const run = newRun(s + 500, 'link') as RunWithEvent;
      const node = { ...run.map.nodes[0], type: (s % 3 === 0 ? 'elite' : 'battle') as 'elite' | 'battle', world: 'gerudoDesert' };
      const force = pickForce(run, new RNG(s), node);
      if (!force) { monsters++; continue; }
      army++;
      if (force.leader) leaders++;
      if (force.heroes?.length) rivals++;
    }
    expect(monsters).toBeGreaterThan(0);
    expect(army).toBeGreaterThan(monsters);
    expect(leaders).toBeGreaterThan(0);
    expect(rivals).toBeGreaterThan(0);
  });

  it('from region 4 on, battles draw units from anywhere', () => {
    const run = newRun(21, 'ruto') as RunWithEvent;
    const node = { ...run.map.nodes[0], type: 'battle' as const, world: 'zorasDomain' };
    expect(pickForce(run, new RNG(1), node)?.name).not.toBe('Free-for-All');
    run.act = 4;
    const force = pickForce(run, new RNG(1), node)!;
    expect(force.name).toBe('Free-for-All');
    expect(force.anyMonsters).toBe(true);
    // Over many battles, enemies come from many different regions.
    const homes = new Set<string>();
    for (let s = 0; s < 30; s++) {
      const b = createBattle({ world: 'zorasDomain', nodeType: 'battle', depth: 25, roster: run.roster, seed: s, force: pickForce(run, new RNG(s), node) });
      for (const u of b.units) if (u.team === 'enemy') homes.add(u.templateId ? TEMPLATES[u.templateId].home : Object.keys(ROSTERS).find((r) => ROSTERS[r].includes(u.artId!)) ?? '');
    }
    expect(homes.size).toBeGreaterThanOrEqual(5);
  });

  it('an army battle fields soldiers (with portraits) and an elite leader', () => {
    const run = newRun(3, 'zelda');
    const b = createBattle({
      world: 'gerudoDesert', nodeType: 'elite', depth: 3, roster: run.roster, seed: 11,
      force: { name: 'Gerudo Raiders', templates: ['gerudoGuard', 'gerudoThief'], monsters: false, leader: 'nabooru' },
    });
    const foes = b.units.filter((u) => u.team === 'enemy');
    expect(b.forceName).toBe('Gerudo Raiders');
    expect(foes.every((u) => ['gerudoGuard', 'gerudoThief', 'nabooru'].includes(u.templateId!))).toBe(true);
    expect(foes.find((u) => u.isBoss)?.templateId).toBe('nabooru');
  });

  it('techniques modify attacks and cost stamina; Spin Attack hits all adjacent enemies', () => {
    const b = emptyBattle();
    const link = place(makeHero('link', 'l', 5, rng()), 3, 3);
    const a = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'a', rng()), 4, 3);
    const c = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'c', rng()), 2, 3);
    const far = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'f', rng()), 7, 3);
    b.units = [link, a, c, far];
    const base = forecast(b, link, link, a).attacker.dmg;
    expect(forecast(b, link, link, a, undefined, 'powerStrike').attacker.dmg).toBe(base + 4);
    const sta = link.sta;
    const hpA = a.hp, hpC = c.hp, hpFar = far.hp;
    expect(castAbility(b, link, 'spinAttack', rng())).not.toBeNull();
    expect(a.hp).toBeLessThan(hpA);
    expect(c.hp).toBeLessThan(hpC);
    expect(far.hp).toBe(hpFar);
    expect(link.sta).toBe(sta - 6);
  });

  it('warp songs teleport to matching terrain and then recharge', () => {
    const b = emptyBattle();
    b.tiles[keyOf(b, 9, 5)] = 'forest';
    const sheik = place(makeHero('sheik', 's', 5, rng()), 1, 1);
    b.units = [sheik];
    expect(castAbility(b, sheik, 'minuetOfForest', rng(), undefined, { x: 5, y: 5 })).toBeNull(); // not forest
    expect(castAbility(b, sheik, 'minuetOfForest', rng(), undefined, { x: 9, y: 5 })).not.toBeNull();
    expect({ x: sheik.x, y: sheik.y }).toEqual({ x: 9, y: 5 });
    b.tiles[keyOf(b, 2, 2)] = 'forest';
    expect(castAbility(b, sheik, 'minuetOfForest', rng(), undefined, { x: 2, y: 2 })).toBeNull(); // cooldown
    for (let i = 0; i < 3; i++) startPhase(b, 'player');
    expect(castAbility(b, sheik, 'minuetOfForest', rng(), undefined, { x: 2, y: 2 })).not.toBeNull();
  });
});

describe('mounts', () => {
  it('riding makes a unit 2×2 cavalry; dismounting shrinks it back; size resets after battle', () => {
    const run = newRun(30, 'link') as RunWithEvent;
    const link = run.roster[0];
    link.gear.mount = 'hyruleHorse';
    const b = createBattle({ world: 'hyruleField', nodeType: 'battle', depth: 0, roster: run.roster, seed: 3 });
    const bl = b.units.find((u) => u.uid === link.uid)!;
    expect(bl.size).toBe(2);
    expect(bl.mounted).toBe(true);
    expect(effectiveStats(bl).mov).toBe(link.stats.mov + 3);
    expect(toggleMount(b, bl)).toBe(true);
    expect(bl.size).toBe(1);
    expect(effectiveStats(bl).mov).toBe(link.stats.mov);
    run.battle = b;
    b.result = 'won';
    finishBattle(run);
    expect(run.roster.find((u) => u.uid === link.uid)!.size).toBe(1);
  });

  it('giants and fliers cannot ride; Malon brings Epona and Ganondorf his stallion', () => {
    expect(canRide(makeHero('biggoron', 'b', 1, rng()))).toBe(false);
    expect(canRide(makeHero('navi', 'n', 1, rng()))).toBe(false);
    expect(makeHero('malon', 'm', 1, rng()).gear.mount).toBe('epona');
    expect(newRun(1, 'ganondorf').roster[0].gear.mount).toBe('ganondorfStallion');
  });

  it("Phantom Ganon's Horse rides through enemies; Epona's Song calls the mount back", () => {
    const b = emptyBattle(12, 6);
    const rider = place(makeHero('ingo', 'i', 1, rng()), 0, 0);
    rider.classId = 'soldier'; // a foot class that can ride
    rider.gear.mount = 'phantomHorse';
    const r = { ...prepareForBattleForTest(rider) };
    const wall = place(makeEnemy(ENEMIES.moblin, 'hyruleField', 1, 'w', rng()), 3, 0);
    b.units = [r, wall];
    const reach = computeMoves(b, r).reach;
    expect([...reach.keys()].some((k) => k % b.width >= 5)).toBe(true);

    const malon = place(makeHero('malon', 'm', 1, rng()), 6, 3);
    malon.weapons.push('fairyOcarina');
    const mb = prepareForBattleForTest(malon);
    b.units = [mb];
    toggleMount(b, mb);
    expect(mb.mounted).toBe(false);
    expect(castAbility(b, mb, 'eponasSong', rng())).not.toBeNull();
    expect(mb.mounted).toBe(true);
    expect(mb.size).toBe(2);
  });
});

function prepareForBattleForTest(u: Unit): Unit {
  return Object.assign(prepareForBattleFn(u), { x: u.x, y: u.y });
}

describe('durability, blacksmith, supports and transformations', () => {
  it("weapons wear out; the Giant's Knife breaks into the Broken Giant's Knife", () => {
    const b = emptyBattle();
    const u = place(makeHero('link', 'l', 10, rng()), 0, 0);
    u.weapons = ['giantsKnife', 'kokiriSword'];
    const foe = place(makeEnemy(ENEMIES.ironKnuckle, 'hyruleField', 25, 'f', rng()), 1, 0);
    foe.stats.hp = foe.hp = 999;
    b.units = [u, foe];
    let broke = false;
    for (let s = 0; s < 12 && !broke; s++) {
      u.hp = u.stats.hp;
      broke = resolveCombat(b, u, foe, new RNG(s), 'giantsKnife').broken.some((x) => x.weaponId === 'giantsKnife');
      if (!b.units.includes(u)) b.units.push(u);
    }
    expect(broke).toBe(true);
    expect(u.weapons).toContain('brokenGiantsKnife');
    expect(u.weapons).not.toContain('giantsKnife');
  });

  it('the Blacksmith repairs and improves weapons', () => {
    const run = newRun(5, 'darunia') as RunWithEvent;
    const d = run.roster[0];
    d.wear = { [d.weapons[0]]: 5 };
    run.rupees = 5000;
    run.event = { type: 'blacksmith', forgeOffers: [], sold: [] };
    expect(repairWeapon(run, d.uid, d.weapons[0])).toBe(true);
    expect(d.wear[d.weapons[0]]).toBeUndefined();
    expect(improveWeapon(run, d.uid, d.weapons[0])).toBe(true);
    expect(forgeLevel(d, d.weapons[0])).toBe(1);
  });

  it('supports build up and give bonuses; only special pairs reach S', () => {
    const b = emptyBattle();
    const link = place(makeHero('link', 'l', 1, rng()), 2, 2);
    const zelda = place(makeHero('zelda', 'z', 1, rng()), 3, 2);
    const soldier = place(makeHero('hyruleSoldier', 's', 1, rng()), 2, 3);
    const foe = place(makeEnemy(ENEMIES.stalchild, 'hyruleField', 1, 'f', rng()), 6, 6);
    b.units = [link, zelda, soldier, foe];
    foe.x = 1; foe.y = 2;
    const foeHitBefore = forecast(b, foe, foe, link).attacker.hit;
    b.supports = { [supportKey(link.uid, zelda.uid)]: 70, [supportKey(link.uid, soldier.uid)]: 5 };
    for (let i = 0; i < 100; i++) gainSupport(b, link);
    expect(b.supports[supportKey(link.uid, zelda.uid)]).toBe(70);
    expect(b.supports[supportKey(link.uid, soldier.uid)]).toBe(40); // capped at A
    expect(rankOf(70, isSPair(link, zelda))).toBe('S');
    expect(forecast(b, foe, foe, link).attacker.hit).toBeLessThan(foeHitBefore); // allies boost Link's avoid
  });

  it('Ganondorf becomes Ganon below half HP, and turns back after battle', () => {
    const run = newRun(9, 'ganondorf') as RunWithEvent;
    run.roster[0].gear = {};
    run.battle = createBattle({ world: 'hyruleField', nodeType: 'battle', depth: 0, roster: run.roster, seed: 1 });
    const b = run.battle;
    b.tiles.fill('plain');
    const g = b.units.find((u) => u.isCommander)!;
    b.units = b.units.filter((u) => u.team === 'player' || u.uid === b.units.find((x) => x.team === 'enemy')!.uid);
    g.x = 4; g.y = 3;
    b.units = b.units.filter((u) => u === g || u.team === 'enemy');
    expect(castAbility(b, g, 'transformGanon', rng())).toBeNull(); // full HP
    g.hp = Math.floor(g.stats.hp / 2);
    expect(castAbility(b, g, 'transformGanon', rng())).not.toBeNull();
    expect(g.name).toBe('Ganon');
    expect(g.size).toBe(3);
    b.result = 'won';
    finishBattle(run);
    const back = run.roster.find((u) => u.isCommander)!;
    expect(back.name).toBe('Ganondorf');
    expect(back.size).toBe(1);
  });

  it('Koume and Kotake fuse into Twinrova and split again after battle', () => {
    const run = newRun(10, 'link') as RunWithEvent;
    run.roster.push(makeHero('koume', 'k1', 1, rng()), makeHero('kotake', 'k2', 1, rng()));
    run.battle = createBattle({ world: 'hyruleField', nodeType: 'battle', depth: 0, roster: run.roster, seed: 2 });
    const b = run.battle;
    b.tiles.fill('plain');
    const k1 = b.units.find((u) => u.uid === 'k1')!, k2 = b.units.find((u) => u.uid === 'k2')!;
    k1.x = 5; k1.y = 3; k2.x = 6; k2.y = 3;
    const cmd = b.units.find((u) => u.isCommander)!;
    cmd.x = 0; cmd.y = 0;
    b.units = [k1, k2, cmd];
    expect(castAbility(b, k1, 'twinrovaFusion', rng())).not.toBeNull();
    expect(k1.name).toBe('Twinrova');
    expect(b.units).not.toContain(k2);
    b.result = 'won';
    finishBattle(run);
    expect(run.roster.map((u) => u.name)).toEqual(expect.arrayContaining(['Koume', 'Kotake']));
  });

  it('a Loftwing makes its rider fly', () => {
    const u = makeHero('link', 'l', 1, rng());
    u.gear.mount = 'loftwing';
    expect(moveTypeOf(u)).toBe('flying');
  });
});

describe('objectives and encounters', () => {
  it('places every objective type with reachable tiles, across many seeds', async () => {
    const counts: Record<string, number> = {};
    for (let s = 0; s < 120; s++) {
      const run = newRun(s + 900, 'link');
      const b = createBattle({ world: REGION_IDS[s % REGION_IDS.length], nodeType: 'battle', depth: 3, roster: run.roster, seed: s });
      counts[b.objective.type] = (counts[b.objective.type] ?? 0) + 1;
      if (['seize', 'defend', 'escape', 'capture'].includes(b.objective.type)) {
        expect(b.objective.tiles?.length, `${s}`).toBeGreaterThan(0);
        for (const t of b.objective.tiles!) expect(['plain', 'forest', 'fort']).toContain(b.tiles[keyOf(b, t.x, t.y)]);
      }
    }
    for (const t of ['rout', 'seize', 'defend', 'escape', 'capture']) expect(counts[t], t).toBeGreaterThan(0);
  });

  it('seize, escape, capture and defend resolve correctly', () => {
    const link = () => place(makeHero('link', 'p1', 5, rng()), 0, 0, 'player');
    const foe = () => place(makeEnemy(ENEMIES.octorok ?? Object.values(ENEMIES)[0], 'hyruleField', 1, 'e2', rng()), 11, 7, 'enemy');
    let b = emptyBattle(); let u = link(); u.isCommander = true; b.units = [u, foe()];
    b.objective = { type: 'seize', tiles: [{ x: 5, y: 3 }] };
    expect(checkResult(b)).toBeUndefined();
    moveUnit(u, 5, 3); expect(checkResult(b)).toBe('won');

    b = emptyBattle(); u = link(); u.isCommander = true; b.units = [u, foe()];
    b.objective = { type: 'escape', tiles: [{ x: 11, y: 2 }] };
    moveUnit(u, 11, 2); expect(checkResult(b)).toBe('won');

    b = emptyBattle(); u = link(); u.isCommander = true; const v = place(makeHero('saria', 'p3', 5, rng()), 0, 1, 'player');
    b.units = [u, v, foe()];
    b.objective = { type: 'capture', tiles: [{ x: 4, y: 1 }, { x: 4, y: 5 }, { x: 8, y: 3 }], need: 2 };
    moveUnit(u, 4, 1); expect(checkResult(b)).toBeUndefined();
    moveUnit(v, 8, 3); expect(checkResult(b)).toBe('won');

    b = emptyBattle(); u = link(); u.isCommander = true; const e = foe(); b.units = [u, e];
    b.objective = { type: 'defend', turns: 6, tiles: [{ x: 1, y: 4 }] };
    moveUnit(e, 1, 4); expect(checkResult(b)).toBe('lost'); expect(b.retreat).toBe(true);
  });

  it('enemies on defend maps take the point when they can', () => {
    const b = emptyBattle();
    const e = place(makeEnemy(ENEMIES.octorok ?? Object.values(ENEMIES)[0], 'hyruleField', 1, 'e2', rng()), 4, 4, 'enemy');
    b.units = [place(makeHero('link', 'p1', 5, rng()), 11, 0, 'player'), e];
    b.objective = { type: 'defend', turns: 6, tiles: [{ x: 2, y: 4 }] };
    expect(planAction(b, e).dest).toEqual({ x: 2, y: 4 });
  });

  it('a retreat from a defend map does not end the run', () => {
    const run = newRun(12, 'link') as RunWithEvent;
    const node = availableNodes(run)[0];
    enterNode(run, node.id);
    run.battle!.result = 'lost'; run.battle!.retreat = true;
    const sum = finishBattle(run);
    expect(sum.retreated).toBe(true);
    expect(run.roster.some((u) => u.isCommander)).toBe(true);
  });

  it('ambush and siege battles set up', () => {
    const run = newRun(5, 'link');
    const a = createBattle({ world: 'hyruleField', nodeType: 'ambush', depth: 4, roster: run.roster, seed: 3 });
    expect(a.units.some((u) => u.team === 'enemy' && u.x <= 5)).toBe(true);
    const s = createBattle({ world: 'hyruleCastle', nodeType: 'siege', depth: 4, roster: run.roster, seed: 3 });
    expect(s.objective.type).toBe('seize');
  });

  it('dungeons chain three battles and end in a vault', () => {
    const run = newRun(33, 'link') as RunWithEvent;
    const node = availableNodes(run)[0];
    node.type = 'dungeon';
    enterNode(run, node.id);
    for (let f = 1; f <= 3; f++) {
      expect(run.battle, `floor ${f}`).toBeDefined();
      expect(run.battle!.nodeType).toBe(f === 3 ? 'elite' : 'battle');
      run.battle!.result = 'won';
      const sum = finishBattle(run);
      expect(sum.dungeon?.cleared).toBe(f === 3);
      if (f < 3) { expect(run.event?.type).toBe('dungeon'); descendDungeon(run); }
    }
    expect(run.event?.type).toBe('treasure');
    expect(run.dungeon).toBeUndefined();
  });

  it('side quests pay out when completed', () => {
    const run = newRun(40, 'link') as RunWithEvent;
    enterNode(run, availableNodes(run)[0].id);
    run.battle!.sideQuest = { kind: 'noLoss', rupees: 100, item: 'redPotion' };
    run.battle!.result = 'won';
    const before = run.rupees;
    const sum = finishBattle(run);
    expect(sum.sideQuest?.done).toBe(true);
    expect(run.rupees - before).toBe(sum.rupees);
    expect(run.convoy).toContain('redPotion');
  });

  it('every random event references real content and resolves', () => {
    for (const ev of Object.values(EVENTS)) {
      for (const c of ev.choices) {
        const outs = c.gamble ? [c.gamble.win, c.gamble.lose] : [c.outcome!];
        for (const o of outs) for (const e of o.effects) {
          if (e.kind === 'loot') for (const id of e.ids) expect(WEAPONS[id] || GEAR[id] || ITEMS[id] || PERMANENT_ITEMS[id], `${ev.id}:${id}`).toBeTruthy();
          if (e.kind === 'recruit') for (const id of e.pool) expect(TEMPLATES[id], `${ev.id}:${id}`).toBeDefined();
        }
      }
      if (ev.regions) for (const r of ev.regions) expect(WORLDS[r], ev.id).toBeDefined();
      for (let i = 0; i < ev.choices.length; i++) {
        const run = newRun(i + 7, 'link') as RunWithEvent;
        run.rupees = 1000;
        run.event = { type: 'event', eventId: ev.id };
        if (!canChoose(run, ev, i)) continue; // gated behind quest items or masks
        const res = chooseEvent(run, i);
        expect(res, `${ev.id}#${i}`).not.toBeNull();
        expect(run.roster.every((u) => u.hp >= 1)).toBe(true);
      }
    }
  });
});

describe('statuses, consumables and tools', () => {
  it('new statuses change stats, tick and wake', () => {
    const u = makeHero('link', 'p1', 5, rng());
    const base = effectiveStats(u).str;
    addStatus(u, 'curse', 2);
    expect(effectiveStats(u).str).toBe(base - 2);
    u.statuses = [];
    u.hp = 10;
    addStatus(u, 'regen', 2);
    const t = tickStatuses(u);
    expect(t.heal).toBeGreaterThan(0);
    addStatus(u, 'sleep', 3);
    expect(tickStatuses(u).lostTurn).toBe('sleep');
    onDamaged(u);
    expect(u.statuses.some((s) => s.kind === 'sleep')).toBe(false);
  });

  it('rooted units cannot move', () => {
    const b = emptyBattle();
    const u = place(makeHero('link', 'p1', 5, rng()), 2, 2, 'player');
    b.units = [u];
    addStatus(u, 'root', 1);
    expect(computeMoves(b, u).reach.size).toBe(1);
  });

  it('antidote cures, elixir buffs, fire fruit burns the ground', () => {
    const b = emptyBattle();
    const u = place(makeHero('link', 'p1', 5, rng()), 1, 1, 'player');
    const e = place(makeEnemy(ENEMIES.octorok ?? Object.values(ENEMIES)[0], 'hyruleField', 1, 'e2', rng()), 3, 1, 'enemy');
    e.stats.hp = e.hp = 50;
    b.units = [u, e];
    addStatus(u, 'poison', 3);
    u.pack = [{ id: 'antidote', uses: 1 }, { id: 'elixir', uses: 1 }, { id: 'fireFruit', uses: 2 }];
    expect(useItem(b, u, 0, rng())).not.toBeNull();
    expect(u.statuses.length).toBe(0);
    const str = effectiveStats(u).str;
    useItem(b, u, 0, rng());
    expect(effectiveStats(u).str).toBe(str + 3);
    b.tiles[keyOf(b, 3, 2)] = 'forest';
    const r = useItem(b, u, 0, rng(), { x: 3, y: 1 });
    expect(r!.hits[0].dmg).toBe(8);
    expect(b.fires!.length).toBeGreaterThan(0);
  });

  it('bombs break cracked walls; Song of Time toggles Time Blocks', () => {
    const b = emptyBattle();
    const u = place(makeHero('zelda', 'p1', 5, rng()), 1, 1, 'player');
    b.units = [u];
    b.tiles[keyOf(b, 3, 1)] = 'cracked';
    u.pack = [{ id: 'bomb', uses: 3 }];
    useItem(b, u, 0, rng(), { x: 3, y: 1 });
    expect(b.tiles[keyOf(b, 3, 1)]).toBe('plain');
    b.tiles[keyOf(b, 5, 5)] = 'timeBlock';
    u.abilities.push('songOfTime');
    if (!u.weapons.some((w) => WEAPONS[w]?.type === 'instrument')) u.weapons.push('fairyOcarina');
    u.mp = 20;
    const res = castAbility(b, u, 'songOfTime', rng());
    expect(res).not.toBeNull();
    expect(b.tiles[keyOf(b, 5, 5)]).toBe('timeGap');
  });

  it('the Hookshot pulls across water to an anchor', () => {
    const b = emptyBattle();
    const u = place(makeHero('link', 'p1', 5, rng()), 1, 1, 'player');
    u.weapons.push('hookshot');
    b.units = [u];
    b.tiles[keyOf(b, 2, 1)] = 'water';
    b.tiles[keyOf(b, 4, 1)] = 'forest';
    const tiles = hookTiles(b, u);
    expect(tiles.some((t) => t.land.x === 3 && t.land.y === 1)).toBe(true);
    const res = castAbility(b, u, 'hookshotPull', rng(), undefined, { x: 3, y: 1 });
    expect(res).not.toBeNull();
    expect(u.x).toBe(3);
    expect(u.acted).toBe(false);
  });

  it('magic beans grow into bridges; fire spreads and burns out', () => {
    const b = emptyBattle();
    b.units = [];
    b.tiles[keyOf(b, 5, 4)] = 'water';
    plantBean(b, { x: 5, y: 4 });
    environmentPhase(b);
    environmentPhase(b);
    expect(b.tiles[keyOf(b, 5, 4)]).toBe('bridge');
    for (let x = 0; x < 6; x++) b.tiles[keyOf(b, x, 0)] = 'forest';
    ignite(b, [{ x: 0, y: 0 }]);
    for (let i = 0; i < 8; i++) environmentPhase(b);
    expect(b.fires!.length).toBe(0);
    expect(b.tiles[keyOf(b, 0, 0)]).toBe('plain');
  });

  it('traps, digging, fog and hidden enemies', () => {
    const b = emptyBattle();
    const u = place(makeHero('link', 'p1', 5, rng()), 1, 1, 'player');
    const e = place(makeEnemy(ENEMIES.octorok ?? Object.values(ENEMIES)[0], 'hyruleField', 1, 'e2', rng()), 10, 6, 'enemy');
    b.units = [u, e];
    b.traps = [{ x: 1, y: 1, hidden: true }];
    expect(triggerTraps(b, u)).toBeGreaterThan(0);
    expect(u.statuses.some((s) => s.kind === 'root')).toBe(true);
    b.digSpots = [{ x: 1, y: 1 }];
    expect(dig(b, u, rng()).item).toBeDefined();
    b.fog = true;
    expect(isSeen(b, e)).toBe(false);
    moveUnit(e, 3, 1);
    expect(isSeen(b, e)).toBe(true);
    e.hidden = true;
    expect(isSeen(b, e)).toBe(false);
    moveUnit(e, 2, 1);
    revealNearby(b);
    expect(e.hidden).toBe(false);
  });

  it('every map decorates without breaking (fog, traps, dig spots, special walls)', () => {
    for (let s = 0; s < 40; s++) {
      const run = newRun(s + 300, 'link');
      const b = createBattle({ world: REGION_IDS[s % REGION_IDS.length], nodeType: s % 3 ? 'battle' : 'siege', depth: 4, roster: run.roster, seed: s });
      for (const d of b.digSpots ?? []) expect(b.tiles[keyOf(b, d.x, d.y)]).toBe('plain');
    }
  });
});

describe('allies, escorts and rescues', () => {
  const find = (type: string) => {
    for (let s = 0; s < 400; s++) {
      const run = newRun(s + 77, 'link');
      const b = createBattle({ world: 'hyruleField', nodeType: 'battle', depth: 3, roster: run.roster, seed: s });
      if (b.objective.type === type) return { run, b };
    }
    throw new Error('no ' + type);
  };

  it('escort battles have a VIP who heads for the exit', () => {
    const { b } = find('escort');
    const vip = b.units.find((u) => u.vip)!;
    expect(vip.npc).toBe(true);
    expect(planAction(b, vip).action).toBeNull();
    moveUnit(vip, b.objective.tiles![0].x, b.objective.tiles![0].y);
    expect(checkResult(b)).toBe('won');
  });

  it('losing the VIP means a retreat', () => {
    const { b } = find('escort');
    const vip = b.units.find((u) => u.vip)!;
    b.units = b.units.filter((u) => u !== vip);
    b.fallen.push(vip);
    expect(checkResult(b)).toBe('lost');
    expect(b.retreat).toBe(true);
  });

  it('rescued prisoners join after victory; allied NPCs do not', () => {
    const { run, b } = find('rescue') as { run: RunWithEvent; b: Battle };
    const captives = b.units.filter((u) => u.captive);
    expect(captives.length).toBeGreaterThan(0);
    const hero = b.units.find((u) => u.team === 'player' && !u.npc)!;
    for (const c of captives) {
      const spot = [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy]) => ({ x: c.x + dx, y: c.y + dy }))
        .find((p) => p.x >= 0 && p.y >= 0 && p.x < b.width && p.y < b.height && !unitAt(b, p.x, p.y))!;
      moveUnit(hero, spot.x, spot.y);
      expect(freeCaptive(b, hero, c.uid)).not.toBeNull();
    }
    expect(checkResult(b)).toBe('won');
    run.battle = b;
    run.deployment = run.roster.map((u) => u.uid);
    const before = run.roster.length;
    const sum = finishBattle(run);
    expect(run.roster.length).toBe(before + sum.joined.length);
    expect(sum.joined.length).toBeGreaterThan(0);
    expect(run.roster.every((u) => !u.npc)).toBe(true);
  });
});

describe('army management', () => {
  it('army level raises capacities', () => {
    const run = newRun(5, 'link');
    expect(armyCap(run)).toBe(12);
    expect(deployCap(run)).toBe(8);
    gainArmyXp(run, 100000);
    expect(armyCap(run)).toBe(20);
    expect(deployCap(run)).toBe(12);
  });

  it('battles eat supplies, salvage materials and move morale', () => {
    const run = newRun(6, 'link') as RunWithEvent;
    enterNode(run, availableNodes(run)[0].id);
    const a = run.army!;
    const s0 = a.supplies, m0 = a.morale;
    run.battle!.result = 'won';
    const sum = finishBattle(run);
    expect(sum.army.xp).toBeGreaterThan(0);
    expect(a.morale).toBeGreaterThan(m0);
    // Supplies are eaten (1 + a third of the army), then some are foraged back (2-5).
    expect(sum.army.supplies).toBe(a.supplies - s0);
    expect(sum.army.supplies).toBeGreaterThanOrEqual(-3);
    expect(sum.army.supplies).toBeLessThanOrEqual(3);
    expect(a.materials).toBeGreaterThan(10);
  });

  it('orders spend Command Points', () => {
    const run = newRun(7, 'link') as RunWithEvent;
    enterNode(run, availableNodes(run)[0].id);
    const b = run.battle!;
    expect(b.cp).toBeGreaterThan(0);
    const cp = b.cp!;
    expect(issueOrder(b, 'rally')).not.toBeNull();
    expect(b.cp).toBe(cp - 2);
    const foe = b.units.find((u) => u.team === 'enemy' && !u.hidden)!;
    expect(issueOrder(b, 'focusFire', foe.uid)).not.toBeNull();
    expect(foe.statuses.some((s) => s.kind === 'exposed')).toBe(true);
    b.cp = 0;
    expect(issueOrder(b, 'secondWind')).toBeNull();
  });

  it('reinforce brings in benched units and emergency retreat keeps them alive', () => {
    const run = newRun(8, 'link') as RunWithEvent;
    for (let i = 0; i < 6; i++) run.roster.push(makeHero('hyruleSoldier', `x${i}`, 1, rng()));
    enterNode(run, availableNodes(run)[0].id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.slice(0, 8).map((u) => u.uid));
    const b = run.battle!;
    expect(b.reserves!.length).toBeGreaterThan(0);
    b.cp = 8;
    const r = b.reserves![0];
    expect(orderUnusable(b, 'reinforce')).toBeNull();
    expect(issueOrder(b, 'reinforce', r.uid)).not.toBeNull();
    expect(b.units).toContain(r);
    const pulled = b.units.find((u) => u.team === 'player' && !u.isCommander && !u.npc)!;
    b.orders!.push('emergencyRetreat');
    expect(issueOrder(b, 'emergencyRetreat', pulled.uid)).not.toBeNull();
    b.result = 'won';
    finishBattle(run);
    expect(run.roster.some((u) => u.uid === pulled.uid)).toBe(true);
  });

  it('feasts and blessings', () => {
    const run = newRun(9, 'link') as RunWithEvent;
    run.event = { type: 'camp' };
    expect(campFeast(run)).toBe(true);
    run.army!.sacredEnergy = 1;
    expect(useBlessing(run, 'din')).toBe(true);
    enterNode(run, availableNodes(run)[0].id);
    const p = run.battle!.units.find((u) => u.isCommander)!;
    expect(p.buffs.some((x) => x.id === 'din')).toBe(true);
    expect(p.statuses.some((x) => x.kind === 'inspired')).toBe(true);
  });
});

describe('cross-run progression and support conversations', () => {
  it('medals buy upgrades that apply to new campaigns', () => {
    const p = emptyProgress();
    awardMedals(p, 40);
    expect(buyUpgrade(p, 'purse')).toBe(true);
    expect(buyUpgrade(p, 'barracks')).toBe(true);
    expect(unlockKit(p, 'explorer')).toBe(true);
    expect(unlockFormation(p, 'quartermasters')).toBe(true);
    const run = newRun(3, 'link') as RunWithEvent;
    const r0 = run.rupees;
    const s0 = run.army!.supplies;
    const given: string[] = [];
    applyMetaToRun(run, p, { kit: 'explorer', formation: 'quartermasters', trials: ['hardened'] }, () => undefined, (id) => given.push(id), () => undefined);
    expect(run.rupees).toBe(r0 + 100);
    expect(armyCap(run)).toBe(13);
    expect(given).toContain('shovel');
    expect(run.army!.supplies).toBe(s0 + 20);
    expect(run.trials).toEqual(['hardened']);
  });

  it('bounties pay once', () => {
    const p = emptyProgress();
    bump(p, 'sieges');
    const first = claimBounties(p);
    expect(first.map((b) => b.id)).toContain('siege');
    expect(claimBounties(p).length).toBe(0);
    expect(p.medals).toBeGreaterThan(0);
  });

  it('trials raise enemy levels and medal rewards', () => {
    const run = newRun(4, 'link');
    const normal = createBattle({ world: 'hyruleField', nodeType: 'battle', depth: 3, roster: run.roster, seed: 9 });
    const hard = createBattle({ world: 'hyruleField', nodeType: 'battle', depth: 3, roster: run.roster, seed: 9, trials: ['hardened', 'mist'] });
    expect(hard.enemyLevel).toBe(normal.enemyLevel + 2);
    expect(hard.fog).toBe(true);
    expect(trialMultiplier(['hardened', 'swarm'])).toBeGreaterThan(1.5);
  });

  it('every pair has a conversation at every rank', () => {
    for (const [a, b] of SUPPORT_S_PAIRS) {
      for (const r of ['C', 'B', 'A', 'S'] as const) {
        const c = conversationFor(a, b, r, { a: 'A', b: 'B' });
        expect(c.lines.length, `${a}|${b}|${r}`).toBeGreaterThan(0);
      }
    }
    const g = conversationFor('hyruleSoldier', 'moblin', 'B', { a: 'Sol', b: 'Mob' });
    expect(g.lines.some(([, t]) => t.includes('{'))).toBe(false);
  });
});

describe("Majora's Mask pack", () => {
  it('every MM unit, monster and boss exists and is recruitable', () => {
    for (const id of ['terminaLink', 'dekuLink', 'goronLink', 'zoraLink', 'fierceDeityLink', 'giantLink', 'skullKid', 'tatl', 'tael', 'kafei', 'anju',
      'dekuPrincess', 'dekuKing', 'darmani', 'mikau', 'lulu', 'captainKeeta', 'igosDuIkana', 'sharp', 'flat', 'garoMaster', 'tingle',
      'odolwa', 'goht', 'gyorg', 'redTwinmold', 'blueTwinmold', 'majorasMask', 'majorasIncarnation', 'majorasWrath',
      'woodfallGiant', 'snowheadGiant', 'greatBayGiant', 'ikanaGiant', 'wart', 'gomess', 'gekko', 'snapper', 'deathArmos', 'eyegore',
      'deepPython', 'hiploop', 'bioDekuBaba', 'giantTurtle', 'dekuSoldier', 'dekuRoyalGuard', 'dekuFlowerScout', 'dekuMystic', 'dekuBombardier',
      'madScrub', 'ikanaServant1', 'ikanaServant2', 'jabuJabu']) {
      expect(TEMPLATES[id], id).toBeDefined();
    }
    expect(TEMPLATES.giantLink.size).toBe(5);
    expect(TEMPLATES.goronLink.size).toBe(2);
  });

  it('Termina Link transforms with masks, keeps HP ratio, and reverts', () => {
    const b = emptyBattle();
    const l = place(makeHero('terminaLink', 'p1', 5, rng()), 3, 3, 'player');
    l.gear.head = 'dekuMask';
    l.hp = Math.floor(l.stats.hp / 2);
    b.units = [l];
    const res = castAbility(b, l, 'mask_dekuMask', rng());
    expect(res).not.toBeNull();
    expect(l.templateId).toBe('dekuLink');
    expect(l.hp / l.stats.hp).toBeGreaterThan(0.3);
    expect(res!.free).toBe(true); // Hero of Masks
    l.gear.head = 'giantsMask';
    expect(unusableReason(b, l, ABILITIES.mask_giantsMask)).toBeNull();
    castAbility(b, l, 'mask_giantsMask', rng());
    expect(l.size).toBe(5);
    l.mp = 0;
    startPhase(b, 'player');
    expect(l.templateId).toBe('terminaLink'); // out of MP: the mask slips off
  });

  it('Majora changes form below half HP', () => {
    const b = emptyBattle();
    const m = place(makeEnemy(BOSSES.majorasMask, 'moon', 10, 'm', rng(), { boss: true }), 6, 3, 'enemy');
    b.units = [m];
    m.hp = 5;
    const tr = enemyAutoTransform(b, m, rng());
    expect(tr?.transformed).toBeTruthy();
    expect(m.name).toBe("Majora's Incarnation");
  });

  it('Igos rises again unless struck by light; Wart\'s bubble absorbs a hit', () => {
    const b = emptyBattle();
    const igos = place(makeHero('igosDuIkana', 'p1', 1, rng()), 2, 2, 'enemy');
    igos.hp = 1;
    const link = place(makeHero('link', 'p2', 20, rng()), 4, 2, 'player');
    b.units = [igos, link];
    for (let seed = 1; seed < 40 && !igos.usedAbilities?.includes('revive'); seed++) { igos.hp = 1; resolveCombat(b, link, igos, new RNG(seed)); }
    expect(igos.usedAbilities).toContain('revive');
    const wart = prepareForBattleFn(makeEnemy(ENEMIES.wart, 'greatBay', 5, 'w', rng()));
    expect(wart.buffs.some((x) => x.id === 'bubble')).toBe(true);
  });

  it('splash weapons hit neighbours and the Double Helix beam costs MP', () => {
    const b = emptyBattle();
    const fd = place(makeHero('fierceDeityLink', 'p1', 10, rng()), 0, 0, 'player');
    const e1 = place(makeEnemy(ENEMIES.octorok ?? Object.values(ENEMIES)[0], 'hyruleField', 1, 'e1', rng()), 4, 0, 'enemy');
    b.units = [fd, e1];
    const mp = fd.mp;
    const fc = forecast(b, fd, fd, e1);
    expect(fc.attacker.canAttack).toBe(true);
    resolveCombat(b, fd, e1, new RNG(1));
    expect(fd.mp).toBe(mp - 3);
    const g = place(makeHero('giantLink', 'p3', 5, rng()), 0, 0, 'player');
    const a = place(makeEnemy(ENEMIES.octorok ?? Object.values(ENEMIES)[0], 'hyruleField', 1, 'a', rng()), 5, 0, 'enemy');
    const c2 = place(makeEnemy(ENEMIES.octorok ?? Object.values(ENEMIES)[0], 'hyruleField', 1, 'c', rng()), 6, 0, 'enemy');
    a.stats.hp = a.hp = 99; c2.stats.hp = c2.hp = 99;
    b.units = [g, a, c2];
    const res = resolveCombat(b, g, a, new RNG(5));
    if (res.strikes.some((s) => s.by === g.uid && s.hit && s.dmg > 0)) expect(c2.hp).toBeLessThan(99);
  });

  it('Termina campaign: clock, Song of Time reset, bank and region order', () => {
    const run = newRun(5, 'terminaLink') as RunWithEvent;
    expect(run.campaign).toBe('termina');
    expect(run.region).toBe('clockTown');
    expect(clockLabel(run).day).toBe(1);
    enterNode(run, availableNodes(run)[0].id);
    expect(run.clock!.hours).toBeGreaterThan(0);
    run.battle = undefined; run.event = undefined;
    run.rupees = 300;
    expect(deposit(run, 100)).toBe(true);
    run.roster[0].pack = [{ id: 'redPotion', uses: 1 }, { id: 'lensOfTruth', uses: 1 }];
    const lost = songOfTimeReset(run);
    expect(lost.length).toBeGreaterThan(0);
    expect(run.rupees).toBe(0);
    expect(run.bank).toBe(100);
    expect(run.clock!.hours).toBe(0);
    expect(run.clock!.resets).toBe(1);
    expect(run.roster[0].pack.map((p) => p.id)).toEqual(['lensOfTruth']);
    // After Clock Town: Termina Field, then the four regions, then the Moon once all Remains are held.
    run.region = 'clockTown';
    offerRegions(run);
    expect((run.event as unknown as { options: string[] }).options).toEqual(['terminaField']);
    run.regionsVisited.push('terminaField');
    run.region = 'terminaField';
    offerRegions(run);
    expect((run.event as unknown as { options: string[] }).options.sort()).toEqual(['greatBay', 'ikana', 'snowhead', 'woodfall']);
    run.convoy.push('odolwaRemains', 'gohtRemains', 'gyorgRemains', 'twinmoldRemains');
    offerRegions(run);
    expect((run.event as unknown as { options: string[] }).options).toEqual(['moon']);
  });

  it('the Moon falls when the third day ends', () => {
    const run = newRun(6, 'terminaLink') as RunWithEvent;
    run.clock!.hours = 70;
    enterNode(run, availableNodes(run)[0].id);
    expect(run.event?.type).toBe('moonfall');
  });

  it('quest chains: the Sun and Moon Masks combine into the Couple\'s Mask', () => {
    const run = newRun(7, 'terminaLink') as RunWithEvent;
    addQuestItem(run, 'sunsMask');
    addQuestItem(run, 'moonsMask');
    expect(run.convoy).toContain('couplesMask');
    expect(run.questItems).toEqual([]);
  });

  it('every Termina event references real content', () => {
    for (const ev of Object.values(EVENTS)) {
      for (const c of ev.choices) {
        for (const o of c.gamble ? [c.gamble.win, c.gamble.lose] : [c.outcome!]) for (const e of o.effects) {
          if (e.kind === 'loot') for (const id of e.ids) expect(WEAPONS[id] || GEAR[id] || ITEMS[id] || PERMANENT_ITEMS[id], `${ev.id}:${id}`).toBeTruthy();
          if (e.kind === 'recruit') for (const id of e.pool) expect(TEMPLATES[id], `${ev.id}:${id}`).toBeDefined();
          if (e.kind === 'quest' || e.kind === 'takeQuest') expect(QUEST_ITEMS[e.id], `${ev.id}:${e.id}`).toBeDefined();
        }
      }
    }
  });

  it('Termina maps place their special spaces and battles run', () => {
    for (const [i, world] of ['clockTown', 'terminaField', 'woodfall', 'snowhead', 'greatBay', 'ikana', 'moon'].entries()) {
      const run = newRun(i + 40, 'terminaLink');
      const b = createBattle({ world, nodeType: 'battle', depth: 3, roster: run.roster, seed: i + 3 });
      expect(b.tiles.length).toBe(b.width * b.height);
      environmentPhase(b);
    }
    const run = newRun(9, 'terminaLink');
    const b = createBattle({ world: 'woodfall', nodeType: 'boss', depth: 6, roster: run.roster, seed: 3, boss: BOSSES.odolwa });
    expect(b.units.some((u) => u.bossId === 'odolwa')).toBe(true);
  });

  it('powder kegs break walls and need a strong carrier', () => {
    const b = emptyBattle();
    const weak = place(makeHero('terminaLink', 'p1', 1, rng()), 1, 1, 'player');
    weak.pack = [{ id: 'powderKeg', uses: 1 }];
    b.units = [weak];
    expect(canUseHere(b, weak, 0)).toBe(false);
    const gor = place(makeHero('darmani', 'p2', 1, rng()), 1, 4, 'player');
    gor.pack = [{ id: 'powderKeg', uses: 1 }];
    b.units = [gor];
    b.tiles[keyOf(b, 4, 4)] = 'wall';
    expect(useItem(b, gor, 0, rng(), { x: 4, y: 4 })).not.toBeNull();
    expect(b.tiles[keyOf(b, 4, 4)]).toBe('plain');
  });
});

describe("Composer's Sheet Music", () => {
  it('makes sleep and curses last a turn longer', () => {
    const b = emptyBattle();
    const sharp = place(makeHero('sharp', 'p1', 10, rng()), 2, 2, 'player');
    const foe = place(makeEnemy(ENEMIES.octorok ?? Object.values(ENEMIES)[0], 'hyruleField', 1, 'e1', rng()), 3, 2, 'enemy');
    b.units = [sharp, foe];
    const sleepFor = (withSheet: boolean) => {
      sharp.gear.acc1 = withSheet ? 'composersSheet' : undefined;
      for (let seed = 1; seed < 60; seed++) {
        foe.statuses = [];
        foe.stats.res = 0;
        sharp.mp = 30;
        castAbility(b, sharp, 'goronLullaby', new RNG(seed));
        const st = foe.statuses.find((s) => s.kind === 'sleep');
        if (st) return st.turns;
      }
      return 0;
    };
    expect(sleepFor(true)).toBe(sleepFor(false) + 1);
    // Curses from dark attacks linger too.
    sharp.gear.acc1 = 'composersSheet';
    let cursed = 0;
    for (let seed = 1; seed < 200 && !cursed; seed++) {
      foe.statuses = [];
      rollElement(b, sharp, foe, 'dark', new RNG(seed));
      cursed = foe.statuses.find((s) => s.kind === 'curse')?.turns ?? 0;
    }
    expect(cursed).toBe(4);
  });
});
