import { describe, expect, it } from 'vitest';
import { ABILITIES, ART_VARIANTS, BOSSES, COMMANDERS, ENEMIES, GEAR, ITEMS, REGION_BOSSES, ROSTERS, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { FOUR_SWORDS, FS_ROUTE, FS_ROUTE_BOSSES } from '../src/content/fourswords';
import { GROUP_SUPPORTS, SUPPORT_REGISTRY } from '../src/content/supports';
import { castAbility, unusableReason } from '../src/engine/abilities';
import { checkResult, startPhase } from '../src/engine/battle';
import { forecast, resolveCombat } from '../src/engine/combat';
import { keyOf } from '../src/engine/grid';
import { useItem } from '../src/engine/items';
import {
  decorateFourSwords, formationCost, fourSwordsBattleStart, fourSwordsBeforeFinish, fsBossesRemain, fsGainForce, fsMultiplier, fsOnKill, fsState, weaknessOf,
} from '../src/engine/fourswords';
import { bigReturningBoss, doFourSwordsCamp, fourswordsBossFor, fourswordsCampOptions, fourswordsOf, fourswordsRegionOptions, fourswordsStartRegion, upgradeTool } from '../src/engine/fourswordsRun';
import { RNG } from '../src/engine/rng';
import { availableNodes, enterNode, newRun, startBattle, type RunWithEvent } from '../src/engine/run';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = (s = 11) => new RNG(s);
function field(w = 12, h = 8, world = 'seaOfTrees'): Battle {
  const tiles: Terrain[] = Array.from({ length: w * h }, () => 'plain');
  return {
    width: w, height: h, tiles, world, units: [], turn: 1, phase: 'player', objective: { type: 'rout' }, rngState: 1, rewardRupees: 100,
    nodeType: 'battle', log: [], fallen: [], enemyLevel: 3, uidCounter: 50, interceptUsed: false, healMult: 1, drops: [], cp: 10, cpMax: 10,
  };
}
function place<T extends Unit>(b: Battle, u: T, x: number, y: number, team: 'player' | 'enemy' = 'player'): T {
  const p = prepareForBattle(u) as T;
  Object.assign(p, { x, y, team });
  b.units.push(p);
  return p;
}
const hero = (id: string, uid = id, lvl = 5) => makeHero(id, uid, lvl, rng());
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'seaOfTrees', lvl, uid, rng());
const LINKS = ['greenLink', 'redLink', 'blueLink', 'purpleLink'];
const NAMED = [...LINKS, 'zeldaFS', 'shadowLink', 'ganonFSA', 'greenMaiden', 'redMaiden', 'blueMaiden', 'purpleMaiden', 'yellowMaiden', 'whiteMaiden'];
const GENERIC = ['hyruleSpearman', 'hyruleBombardier', 'hyruleCaptain'];
const MONSTERS = ['ballChainTrooper', 'bigBomb', 'terrorpin', 'geldman'];
const BOSS_IDS = ['vaatiWindMage', 'deluZol', 'gouen', 'deraZol', 'frostare'];

describe('Four Swords content', () => {
  it('registers all 25 units, recruitable and with art, with the doc\'s stats and sizes', () => {
    const all = [...NAMED, ...GENERIC, ...MONSTERS, ...BOSS_IDS];
    expect(all.length).toBe(25);
    for (const id of all) { expect(TEMPLATES[id], id).toBeDefined(); expect(artFor(id), id).not.toBeNull(); }
    expect(TEMPLATES.greenLink.stats).toEqual({ hp: 30, str: 15, mag: 7, skl: 16, spd: 15, def: 12, res: 10, lck: 15, con: 9, mov: 6, sta: 35, mp: 25 });
    expect(TEMPLATES.purpleLink.stats).toMatchObject({ mag: 21, res: 19, mp: 50 });
    expect(TEMPLATES.ganonFSA.stats).toMatchObject({ hp: 110, str: 35, def: 28, mp: 85 });
    expect(BOSSES.vaatiWindMage.stats).toMatchObject({ hp: 100, mag: 38, res: 35, mov: 8, mp: 100 });
    expect(ENEMIES.bigBomb.stats).toMatchObject({ hp: 35, str: 30, con: 20 });
    expect(BOSSES.gouen.size).toBe(4); expect(BOSSES.vaatiWindMage.size).toBe(3); expect(ENEMIES.bigBomb.size).toBe(2); expect(TEMPLATES.ganonFSA.size).toBe(3);
    // Shadow Link and Ganon are bosses too; Dera Zol uses Delu Zol's art, the soldiers the Hyrule soldier's.
    expect(BOSSES.shadowLink && BOSSES.ganonFSA).toBeTruthy();
    expect(artFor('deraZol')).toBe('deluZol');
    for (const id of GENERIC) expect(artFor(id)).toBe('hyruleSoldier');
    expect(ART_VARIANTS.kaepora).toContain('kaeporaGaeboraFS');
    expect(ART_VARIANTS.arrghus).toContain('arrghusFSA');
    expect(ART_VARIANTS.phantomGanon).toContain('phantomGanonFSA');
    expect(TEMPLATES.vaatiWindMage.exclusiveWith).toEqual(expect.arrayContaining(['vaatiHylian', 'vaatisWrath']));
    // Reused entries: the Four Sword, tools; the new tools and the Gnat Hat.
    for (const id of ['fourSword', 'fireRod', 'fairyBow', 'boomerang', 'fairySlingshot', 'magicHammer', 'tridentOfPower', 'shadowSword', 'vaatisCycloneOrb', 'fireRodL2', 'bowL2', 'hammerL2']) expect(WEAPONS[id], id).toBeDefined();
    for (const id of ['rocsFeather', 'rocsCape', 'pegasusBoots', 'magneticGloves', 'gnatHat', 'shadowMirror', 'herosMedal', 'ganonsDarkArmor', 'pegasusBootsL2']) expect(GEAR[id], id).toBeDefined();
    for (const id of ['bomb', 'bombL2', 'giantBomb', 'forceFairy', 'fsLamp']) expect(ITEMS[id], id).toBeDefined();
    expect(ABILITIES.rocsJump.grantedBy?.gear).toContain('rocsFeatherL2');
    expect(FOUR_SWORDS.regions.map((r) => r.id)).toEqual(FS_ROUTE);
    for (const r of FS_ROUTE) { expect(WORLDS[r].campaign).toBe('fourswords'); expect(ROSTERS[r]?.length, r).toBeGreaterThan(3); expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0); }
    expect(FS_ROUTE_BOSSES.seaOfTrees).toEqual(['deluZol']);
    expect(FS_ROUTE_BOSSES.talusCave).toEqual(['deraZol']);
    expect(FS_ROUTE_BOSSES.realmOfTheHeavens).toEqual(['vaatiWindMage']);
    expect(COMMANDERS.filter((c) => c.campaign === 'fourswords').map((c) => c.heroId)).toEqual(['greenLink', 'redLink', 'blueLink', 'purpleLink', 'zeldaFS', 'shadowLink', 'vaatiWindMage', 'ganonFSA']);
    expect(SUPPORT_REGISTRY.filter((p) => p.game === 'fourswords').length).toBe(65);
    expect(GROUP_SUPPORTS.filter((g) => ['fourfoldCourage', 'sacredFellowship', 'fivefoldReflection', 'sacredSealGroup', 'darkConspiracy', 'legacyOfFourSword'].includes(g.id)).length).toBe(6);
  });
});

describe('Force Gems and Force Power', () => {
  it('kills drop gems; 500 opens Force Barriers and each threshold gives a Command Point', () => {
    const b = field();
    const g = place(b, hero('greenLink'), 1, 1);
    b.tiles[keyOf(b, 5, 5)] = 'forceBarrier';
    const e = place(b, foe('octorok'), 2, 1, 'enemy');
    fsOnKill(b, g, e);
    expect(fsState(b).force).toBeGreaterThan(0);
    const cp = b.cp!;
    fsGainForce(b, 600, 'test');
    expect(fsState(b).reached).toContain('awakening');
    expect(b.tiles[keyOf(b, 5, 5)]).toBe('plain');
    expect(b.cp).toBe(cp + 1);
    fsGainForce(b, 2000, 'test');
    expect(fsState(b).reached).toEqual(['awakening', 'enhancement', 'mastery', 'sacred']);
  });

  it('Force Awakening strengthens the Links; Shadow Link scatters gems onto the field', () => {
    const b = field();
    const r = place(b, hero('redLink'), 1, 1);
    const e = place(b, foe('octorok'), 2, 1, 'enemy');
    const before = forecast(b, r, r, e, r.weapons[0]).attacker.dmg;
    fsGainForce(b, 500, 'test', true);
    expect(forecast(b, r, r, e, r.weapons[0]).attacker.dmg).toBeGreaterThan(before);
    const sl = place(b, foe('shadowLink', 'sl', 5), 1, 2, 'enemy');
    for (let i = 0; i < 6 && fsState(b).force === 500; i++) { r.hp = r.stats.hp; resolveCombat(b, sl, r, rng(i)); }
    expect(fsState(b).force).toBeLessThan(500);
    expect(b.tiles).toContain('forceGemDeposit');
  });

  it('a player unit on a Force Gem Deposit collects it at the start of the turn', () => {
    const b = field();
    const g = place(b, hero('greenLink'), 3, 3);
    b.tiles[keyOf(b, 3, 3)] = 'forceGemDeposit';
    fsState(b).deposits[keyOf(b, 3, 3)] = 100;
    startPhase(b, 'player');
    expect(fsState(b).force).toBe(100);
    expect(b.tiles[keyOf(b, 3, 3)]).toBe('plain');
    void g;
  });
});

describe('The Four Link formations', () => {
  it('Box costs CP, needs two Links, and gives the Links +4 DEF and RES', () => {
    const b = field();
    const g = place(b, hero('greenLink'), 1, 1);
    expect(unusableReason(b, g, ABILITIES.formationBox)).toMatch(/2 Links/);
    const r = place(b, hero('redLink'), 1, 2);
    const e = place(b, foe('moblin'), 4, 1, 'enemy');
    const before = forecast(b, e, { x: 2, y: 2 }, r, e.weapons[0]).attacker.dmg;
    expect(castAbility(b, g, 'formationBox', rng())).not.toBeNull();
    expect(b.cp).toBe(6);
    expect(fsState(b).formation?.id).toBe('box');
    expect(forecast(b, e, { x: 2, y: 2 }, r, e.weapons[0]).attacker.dmg).toBeLessThan(before);
    b.bonus = 'fourSwordLeader';
    expect(formationCost(b, 'formationBox')).toBe(3);
  });

  it('Fourfold Strike needs four Links and uses every participant\'s action; Sacred Seal needs 2,000 Force', () => {
    const b = field();
    const ls = LINKS.map((id, i) => place(b, hero(id), 2, 1 + i));
    const e = place(b, foe('moblin', 'm', 6), 3, 2, 'enemy');
    expect(unusableReason(b, ls[0], ABILITIES.sacredSealFS)).toMatch(/Sacred Awakening/);
    const hp = e.hp;
    expect(castAbility(b, ls[0], 'fourfoldStrike', rng(), e.uid)).not.toBeNull();
    expect(e.hp).toBeLessThan(hp);
    expect(ls.slice(1).every((l) => l.acted)).toBe(true);
    fsGainForce(b, 2000, 'test', true);
    expect(unusableReason(b, ls[1], ABILITIES.sacredSealFS)).toBeNull();
  });

  it('Coordinated Strike brings a second Link into the attack', () => {
    const b = field();
    const g = place(b, hero('greenLink'), 2, 2);
    place(b, hero('blueLink'), 4, 4);
    const e = place(b, foe('moblin', 'm', 8), 3, 2, 'enemy');
    const res = castAbility(b, g, 'coordinatedStrikeFS', rng(), e.uid);
    expect(res?.hits.length).toBe(2);
  });
});

describe('Four Swords battlefield', () => {
  it('Dark World Portals come in pairs and carry you across', () => {
    const b = field(14, 8, 'darkWorldFSA');
    const g = place(b, hero('greenLink'), 0, 0);
    decorateFourSwords(b, rng(3));
    const st = fsState(b);
    expect(st.portals.length % 2).toBe(0);
    expect(st.portals.length).toBeGreaterThan(0);
    const k = st.portals[0];
    g.x = k % b.width; g.y = Math.floor(k / b.width);
    const res = castAbility(b, g, 'fsCrossPortal', rng());
    expect(res).not.toBeNull();
    expect(keyOf(b, g.x, g.y)).toBe(st.portals[1]);
    expect(g.buffs.some((x) => x.id === 'fsDarkWorld')).toBe(true);
  });

  it('Shadow Mirror Gates spawn shadow duplicates until shattered; Giant Bombs go off after their countdown', () => {
    const b = field();
    const g = place(b, hero('greenLink'), 1, 1);
    place(b, foe('octorok'), 10, 7, 'enemy');
    b.tiles[keyOf(b, 6, 4)] = 'shadowMirrorGate';
    startPhase(b, 'enemy');
    expect(b.units.some((u) => u.fsGate === keyOf(b, 6, 4))).toBe(true);
    g.x = 5; g.y = 4;
    expect(castAbility(b, g, 'fsShatterMirror', rng())).not.toBeNull();
    expect(b.tiles[keyOf(b, 6, 4)]).toBe('plain');
    const e = place(b, foe('octorok', 'o2'), 9, 1, 'enemy');
    g.pack.push({ id: 'giantBomb', uses: 1 });
    g.x = 7; g.y = 1;
    expect(useItem(b, g, g.pack.length - 1, rng(), { x: 9, y: 2 })).not.toBeNull();
    expect(b.tiles[keyOf(b, 9, 2)]).toBe('giantBombZone');
    const hp = e.hp;
    for (let t = 2; t <= 4; t++) { b.turn = t; startPhase(b, 'player'); }
    expect(e.hp < hp || !b.units.includes(e)).toBe(true);
    expect(b.tiles[keyOf(b, 9, 2)]).toBe('plain');
  });

  it('Terrorpins resist until flipped; Dera Zol\'s weakness shifts; Big Bombs explode on their fuse', () => {
    const b = field();
    const r = place(b, hero('redLink'), 1, 1);
    const t = place(b, foe('terrorpin'), 2, 1, 'enemy');
    const w = WEAPONS.fightersSword;
    expect(fsMultiplier(b, r, r, t, false, w, 1)).toBe(0.5);
    resolveCombat(b, r, t, rng(), 'magicHammer');
    if (t.hp > 0) expect(fsMultiplier(b, r, r, t, false, w, 1)).toBe(1);
    const dz = place(b, foe('deraZol', 'dz', 5), 6, 4, 'enemy');
    const weak = weaknessOf(b, dz);
    expect(fsMultiplier(b, r, r, dz, true, undefined, 1, weak)).toBe(1.25);
    b.turn++;
    expect(weaknessOf(b, dz)).not.toBe(weak);
    const bomb = place(b, foe('bigBomb', 'bb'), 8, 0, 'enemy');
    const near = place(b, hero('blueLink'), 7, 1);
    fourSwordsBattleStart(b);
    const hp = near.hp;
    for (let i = 0; i < 3; i++) startPhase(b, 'enemy');
    expect(b.units.includes(bomb)).toBe(false);
    expect(near.hp).toBeLessThan(hp);
  });

  it('the finale: when Vaati falls, Ganon takes the field', () => {
    const b = field(16, 10, 'realmOfTheHeavens');
    b.objective = { type: 'boss' };
    place(b, hero('greenLink'), 1, 1);
    const v = place(b, makeEnemy(BOSSES.vaatiWindMage, b.world, 5, 'v', rng(), { boss: true }), 10, 3, 'enemy');
    fsState(b).finale = true;
    v.hp = 0;
    b.units = b.units.filter((x) => x !== v);
    b.fallen.push(v);
    expect(fsBossesRemain(b)).toBe(true);
    expect(b.units.some((u) => u.bossId === 'ganonFSA')).toBe(true);
    expect(checkResult(b)).toBeUndefined();
  });

  it('the Gnat Hat lets the wearer shrink anywhere (the Micro rules)', () => {
    const b = field();
    const u = place(b, hero('blueLink'), 2, 2);
    expect(unusableReason(b, u, ABILITIES.mcShrink)).toMatch(/Minish Portal/);
    u.gear.head = 'gnatHat';
    expect(unusableReason(b, u, ABILITIES.mcShrink)).toBeNull();
    castAbility(b, u, 'mcShrink', rng());
    expect(u.micro).toBe(true);
  });

  it('a Great Fairy pedestal upgrades the equipped tool for the battle only', () => {
    const b = field();
    const p = place(b, hero('purpleLink'), 3, 3);
    p.weapons = ['fireRod', 'fightersSword'];
    b.tiles[keyOf(b, 3, 3)] = 'fairyPedestal';
    expect(castAbility(b, p, 'fsFairyUpgrade', rng())).not.toBeNull();
    expect(p.weapons[0]).toBe('fireRodL2');
    fourSwordsBeforeFinish(b);
    expect(p.weapons[0]).toBe('fireRod');
  });
});

describe('The Four Swords campaign', () => {
  it('starts in the Sea of Trees and follows the route to the finale', () => {
    const run = newRun(5, 'greenLink', 'fourswords') as RunWithEvent;
    expect(run.campaign).toBe('fourswords');
    expect(run.region).toBe(fourswordsStartRegion());
    expect(run.roster.map((u) => u.templateId).sort()).toEqual([...LINKS].sort());
    run.region = 'talusCave';
    expect(fourswordsRegionOptions(run, rng())).toEqual(['deathMountainFS']);
    const boss = run.map.nodes.find((n) => n.type === 'boss')!;
    expect(fourswordsBossFor(run, { ...boss, world: 'talusCave' })?.id).toBe('deraZol');
    expect(fourswordsBossFor(run, { ...boss, world: 'deathMountainFSA' })?.name).toBe('Big Dodongo');
    expect(bigReturningBoss('mightyDarknut', 'nearTheFields')?.stats.hp).toBeGreaterThan(40);
  });

  it('fights its first battle with Force Power and formation Command Points', () => {
    const run = newRun(9, 'greenLink', 'fourswords') as RunWithEvent;
    const node = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    if (!run.battle) return;
    expect(run.battle.units.some((u) => u.team === 'enemy')).toBe(true);
    expect(run.battle.cpMax).toBeGreaterThanOrEqual(5);
    expect(run.battle.tiles.some((t) => t === 'forceGemDeposit')).toBe(true);
  });

  it('the camp facilities: the Force Shrine, formation drill and the Great Fairy Workshop', () => {
    const run = newRun(5, 'purpleLink', 'fourswords') as RunWithEvent;
    run.rupees = 5000;
    const opts = fourswordsCampOptions(run, 'camp');
    expect(new Set(opts.map((o) => o.facility))).toEqual(new Set(['sanctuary', 'shrine', 'maidens', 'workshop']));
    expect(doFourSwordsCamp(run, 'shrine', rng())).toMatch(/Force Shrine/);
    expect(fourswordsOf(run).shrine).toBe(1);
    expect(doFourSwordsCamp(run, 'drill', rng())).toMatch(/drill/);
    const purple = run.roster.find((u) => u.templateId === 'purpleLink')!;
    expect(doFourSwordsCamp(run, 'upgrade', rng(), undefined, '0')).toMatch(/Lv\. 2/);
    expect(purple.weapons).toContain('fireRodL2');
    expect(upgradeTool(run, 'notATool')).toBeNull();
    expect(doFourSwordsCamp(run, 'callLink', rng())).toMatch(/joins/);
  });
});
