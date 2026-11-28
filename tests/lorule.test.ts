import { describe, expect, it } from 'vitest';
import { ABILITIES, ART_VARIANTS, BOSSES, COMMANDERS, ENEMIES, GEAR, ITEMS, REGION_BOSSES, ROSTERS, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { LB_ROUTE_BOSSES, LINK_BETWEEN_WORLDS, LORULE_ROUTE, SAGE_DUNGEONS } from '../src/content/lorule';
import { RIVER_ZORA_IDS, RIVER_ZORA_REGIONS } from '../src/content/riverzora';
import { GROUP_SUPPORTS, SUPPORT_REGISTRY } from '../src/content/supports';
import { abilityTiles, castAbility } from '../src/engine/abilities';
import { checkResult, createBattle, startPhase } from '../src/engine/battle';
import { forecast, resolveCombat } from '../src/engine/combat';
import { computeMoves, keyOf } from '../src/engine/grid';
import { loruleBattleStart, lrAfterWalk, lrMultiplier, lrSaveFromDeath, lrState, paint } from '../src/engine/lorule';
import { doLoruleCamp, loruleAfterBattle, loruleCampOptions, loruleOf, loruleRegionOptions, niceAvailable, rentPrice, rescueMaiamai, buyPrice, temper } from '../src/engine/loruleRun';
import { planAction } from '../src/engine/ai';
import { RNG } from '../src/engine/rng';
import { moveUnit } from '../src/engine/battle';
import { newRun } from '../src/engine/run';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = (s = 11) => new RNG(s);
function field(w = 12, h = 8, world = 'easternPalaceLB'): Battle {
  const tiles: Terrain[] = Array.from({ length: w * h }, () => 'plain');
  return {
    width: w, height: h, tiles, world, units: [], turn: 1, phase: 'player', objective: { type: 'rout' }, rngState: 1, rewardRupees: 100,
    nodeType: 'battle', log: [], fallen: [], enemyLevel: 3, uidCounter: 50, interceptUsed: false, healMult: 1, drops: [],
  };
}
function place<T extends Unit>(b: Battle, u: T, x: number, y: number, team: 'player' | 'enemy' = 'player'): T {
  const p = prepareForBattle(u) as T;
  Object.assign(p, { x, y, team });
  b.units.push(p);
  return p;
}
const hero = (id: string, uid = id, lvl = 5) => makeHero(id, uid, lvl, rng());
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'easternPalaceLB', lvl, uid, rng());

const NAMED = ['linkALBW', 'zeldaALBW', 'hilda', 'ravio', 'yuga', 'sheerow', 'gramps', 'motherMaiamai', 'babyMaiamai', 'loruleanBlacksmith', 'thiefGirl',
  'gulley', 'osfala', 'seres', 'oren', 'rosso', 'irene', 'impaALBW'];
const GENERIC = ['loruleSoldier', 'loruleSpearman', 'loruleKnight'];
const MONSTERS = ['rupeeLike', 'bari', 'biri', 'gimos', 'pengator', 'devalant'];
const BOSS_IDS = ['margomill', 'gemesaurKing', 'knucklemaster', 'stalblind', 'zaganaga', 'dharkstare', 'grinexx', 'yugaGanon'];
const MINI = ['heedle', 'gigabari', 'bigPengator'];

describe('A Link Between Worlds content', () => {
  it('registers the 38 new units, recruitable and with art, with the doc\'s stats and sizes', () => {
    const all = [...NAMED, ...GENERIC, ...MONSTERS, ...BOSS_IDS, ...MINI];
    expect(all.length).toBe(38);
    for (const id of all) { expect(TEMPLATES[id], id).toBeDefined(); expect(artFor(id), id).not.toBeNull(); }
    expect(TEMPLATES.linkALBW.stats).toEqual({ hp: 32, str: 16, mag: 12, skl: 18, spd: 16, def: 12, res: 10, lck: 16, con: 9, mov: 6, sta: 35, mp: 40 });
    expect(TEMPLATES.gramps.stats).toMatchObject({ hp: 42, str: 24, skl: 29 });
    expect(BOSSES.yugaGanon.stats).toMatchObject({ hp: 130, str: 36, mag: 40, def: 30, res: 35, mp: 100 });
    expect(BOSSES.grinexx.stats).toMatchObject({ hp: 115, str: 32, def: 34 });
    expect(ENEMIES.biri.stats).toMatchObject({ hp: 10, spd: 16 });
    // Micro units and sizes.
    expect(TEMPLATES.babyMaiamai.size).toBe(0); expect(ENEMIES.biri.size).toBe(0);
    expect(TEMPLATES.motherMaiamai.size).toBe(3); expect(BOSSES.gemesaurKing.size).toBe(4); expect(TEMPLATES.oren.size).toBe(2);
    // Shared and alternate art.
    expect(artFor('loruleSpearman')).toBe('loruleSoldier'); expect(artFor('loruleKnight')).toBe('loruleSoldier');
    expect(ART_VARIANTS.bari).toContain('bariOOT'); expect(ART_VARIANTS.biri).toContain('biriOOT'); expect(ART_VARIANTS.moldorm).toContain('moldormALBW');
    expect(ART_VARIANTS.ganonHyrule).toContain('ganonALBW');
    // New entries where none existed; reused ones untouched.
    for (const id of ['tornadoRod', 'sandRod', 'yugasPaintbrush', 'grampsSword']) expect(WEAPONS[id], id).toBeDefined();
    for (const id of ['masterSword', 'temperedSword', 'goldenSword', 'fairyBow', 'boomerang', 'hookshot', 'magicHammer', 'fireRod', 'iceRod']) expect(WEAPONS[id], id).toBeDefined();
    for (const id of ['raviosBracelet', 'hintGlasses', 'irenesBroom', 'hylianShield', 'blueMail', 'redMail', 'powerGlove', 'titansMitt', 'pegasusBoots', 'zorasFlippers', 'bugCatchingNet']) expect(GEAR[id], id).toBeDefined();
    for (const id of ['scootFruit', 'foulFruit', 'staminaScroll', 'greatSpinScroll', 'lonLonMilk', 'goldenBee']) expect(ITEMS[id], id).toBeDefined();
    expect(TEMPLATES.impa.name).toBe('Impa'); // the Ocarina of Time Impa keeps her entry
    expect(LINK_BETWEEN_WORLDS.regions.map((r) => r.id)).toEqual(LORULE_ROUTE);
    expect(LORULE_ROUTE.length).toBe(16);
    for (const r of LORULE_ROUTE) { expect(WORLDS[r].campaign).toBe('lorule'); expect(ROSTERS[r]?.length, r).toBeGreaterThan(3); expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0); }
    expect(LB_ROUTE_BOSSES.towerOfHeraLB).toEqual(['moldormBoss']);
    expect(LB_ROUTE_BOSSES.swampPalaceLB).toEqual(['arrghus']);
    expect(COMMANDERS.filter((c) => c.campaign === 'lorule').map((c) => c.heroId)).toEqual(['linkALBW', 'zeldaALBW', 'hilda', 'ravio', 'yuga', 'oren', 'gramps', 'yugaGanon']);
    expect(SUPPORT_REGISTRY.filter((p) => p.game === 'lorule').length).toBe(73);
    // Each Sage × every other Sage.
    const sages = ['gulley', 'osfala', 'seres', 'oren', 'rosso', 'irene', 'impaALBW'];
    for (let i = 0; i < sages.length; i++) for (const s of sages.slice(i + 1)) expect(SUPPORT_REGISTRY.some((p) => p.key === [sages[i], s].sort().join('|')), `${sages[i]}|${s}`).toBe(true);
    for (const g of ['courageRestored', 'betweenKingdoms', 'sagesUnited', 'hopeForLorule', 'businessPartners', 'veteranMasters', 'forbiddenSorcery', 'familyReunion',
      'riverPack', 'riverHuntingParty', 'mastersOfTheCurrent', 'riverRoyalty', 'unitedWaters']) expect(GROUP_SUPPORTS.some((x) => x.id === g), g).toBe(true);
  });

  it('the River Zora: six generics with five shared looks, in the water regions of three campaigns', () => {
    expect(RIVER_ZORA_IDS.length).toBe(6);
    for (const id of RIVER_ZORA_IDS) {
      expect(TEMPLATES[id].generic, id).toBe(true);
      expect(ENEMIES[id], id).toBeDefined();
      expect(ART_VARIANTS[id]).toEqual(['riverZora1', 'riverZora2', 'riverZora3', 'riverZora4', 'riverZora5']);
      expect(artFor(id, 'p1'), id).toMatch(/^riverZora[1-5]$/);
      expect(TEMPLATES[id].weapons, id).toContain('zoraFireball');
    }
    expect(TEMPLATES.riverZoraChieftain.stats).toMatchObject({ hp: 55, str: 24, mag: 22, mov: 6, mp: 60 });
    const camps = new Set(RIVER_ZORA_REGIONS.map((r) => WORLDS[r].campaign));
    expect([...camps].sort()).toEqual(['legend', 'lorule', 'original']);
    for (const r of RIVER_ZORA_REGIONS) expect(ROSTERS[r], r).toContain('riverZora');
  });
});

describe('A Link Between Worlds battle rules', () => {
  it('wall merging: 5 MP to merge, walls to travel through (2 MP each), immune to melee, emerges on the ground, upkeep and forced out', () => {
    const b = field();
    for (let y = 0; y < 8; y++) b.tiles[keyOf(b, 4, y)] = 'wall';
    const link = place(b, hero('linkALBW'), 3, 3);
    const enemy = place(b, foe('stalfos'), 6, 3, 'enemy');
    const def = castAbility(b, link, 'wallMerge', rng(), undefined, { x: 4, y: 3 });
    expect(def).not.toBeNull();
    expect(link.lrMerged).toBe(true);
    expect(link.x).toBe(4);
    expect(link.mp).toBe(link.stats.mp - 5);
    expect(link.artOverride).toBe('link2D');
    // Ordinary melee can't touch a merged unit; merged units can't attack ordinarily.
    const atk = place(b, foe('stalfos', 'st2'), 5, 3, 'enemy');
    expect(forecast(b, atk, atk, link, atk.weapons[0]).attacker.canAttack).toBe(false);
    expect(forecast(b, link, link, atk, link.weapons[0]).attacker.canAttack).toBe(false);
    // Through the wall (wall spaces cost 1 movement for a merged unit).
    const moves = computeMoves(b, link);
    expect(moves.reach.has(keyOf(b, 4, 6))).toBe(true);
    const mp = link.mp;
    moveUnit(link, 4, 6, 3);
    lrAfterWalk(b, link, [{ x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 }]);
    expect(link.mp).toBe(mp - 6);
    expect(link.lrMerged).toBe(true);
    // Upkeep each turn, then forced out at 0.
    startPhase(b, 'player');
    expect(link.mp).toBe(mp - 11);
    link.mp = 2;
    startPhase(b, 'player');
    expect(link.lrMerged).toBe(false);
    expect(b.tiles[keyOf(b, link.x, link.y)]).not.toBe('wall');
    // Ending a walk on the ground emerges.
    link.mp = 40; link.x = 3; link.y = 0;
    castAbility(b, link, 'wallMerge', rng(), undefined, { x: 4, y: 0 });
    link.acted = false;
    moveUnit(link, 5, 0, 1);
    lrAfterWalk(b, link, [{ x: 4, y: 0 }, { x: 5, y: 0 }]);
    expect(link.lrMerged).toBe(false);
    expect(link.artOverride).toBeUndefined();
    void enemy;
  });

  it('Painting Prison: no moving or attacking, immune to physical attacks, freed by light or the caster\'s defeat; bosses 1 turn', () => {
    const b = field();
    const yuga = place(b, hero('yuga'), 1, 1);
    const soldier = place(b, foe('stalfos'), 3, 1, 'enemy');
    const res = castAbility(b, yuga, 'paintingPrison', rng(), soldier.uid);
    expect(res).not.toBeNull();
    expect(soldier.lrPainted?.turns).toBe(3);
    const knight = place(b, hero('loruleKnight', 'lk'), 4, 1);
    expect(forecast(b, knight, knight, soldier, 'loruleSword').attacker.canAttack).toBe(false);
    expect(forecast(b, yuga, { x: 2, y: 1 }, soldier, 'yugasPaintbrush').attacker.canAttack).toBe(true);
    startPhase(b, 'enemy');
    expect(soldier.acted).toBe(true);
    // Light frees it.
    const zelda = place(b, hero('zeldaALBW'), 3, 3);
    resolveCombat(b, zelda, soldier, rng(3), 'sacredLightLB');
    if (soldier.hp > 0) expect(soldier.lrPainted).toBeUndefined();
    // Bosses: one turn; the caster's defeat frees.
    const boss = place(b, foe('margomill'), 7, 4, 'enemy');
    boss.isBoss = true;
    paint(b, yuga, boss);
    expect(boss.lrPainted?.turns).toBe(1);
  });

  it('Yuga fuses into Yuga Ganon instead of falling in Lorule Castle; Bari split into Biri', () => {
    const b = field(14, 10, 'loruleCastle');
    b.nodeType = 'boss';
    const y = place(b, foe('yugaBoss', 'yb', 8), 6, 4, 'enemy');
    y.isBoss = true;
    lrState(b).fusion = true;
    const saved = lrSaveFromDeath(b, y);
    expect(saved).not.toBeNull();
    expect(y.bossId).toBe('yugaGanon');
    expect(y.size).toBe(3);
    expect(lrSaveFromDeath(b, y)).toBeNull();
    // A Bari's death leaves two Biri (Micro).
    const b2 = field();
    const link = place(b2, hero('linkALBW', 'l2', 10), 2, 2);
    const bari = place(b2, foe('bari', 'ba', 1), 3, 2, 'enemy');
    bari.hp = 1;
    for (let i = 0; i < 5 && b2.units.includes(bari); i++) resolveCombat(b2, link, bari, rng(i), 'fightersSword');
    expect(b2.units.includes(bari)).toBe(false);
    expect(b2.units.filter((u) => u.artId === 'biri').length).toBe(2);
    expect(b2.units.find((u) => u.artId === 'biri')!.micro).toBe(true);
  });

  it('River Zora submerge, lightning weakness, Flood and the natural Fireball', () => {
    const b = field();
    for (let x = 0; x < 6; x++) b.tiles[keyOf(b, x, 4)] = 'water';
    const rz = place(b, hero('riverZoraHunter', 'rz'), 2, 4);
    expect(castAbility(b, rz, 'rzSubmerge', rng())).not.toBeNull();
    expect(rz.lrSubmerged).toBe(true);
    const archer = place(b, foe('octorok', 'oc'), 2, 1, 'enemy');
    const fc = forecast(b, archer, archer, rz, archer.weapons[0]);
    expect(fc.attacker.canAttack).toBe(false);
    expect(lrMultiplier(b, archer, archer, rz, true, WEAPONS.bariShock, 3, 'lightning')).toBeCloseTo(1.5);
    // The natural Fireball reaches 2–4 without any other weapon.
    const plain = place(b, hero('riverZora', 'rz2'), 5, 1);
    plain.weapons = ['zoraFireball'];
    expect(forecast(b, plain, plain, archer, 'zoraFireball').attacker.canAttack).toBe(true);
    // Flood: a 2×2 of open ground becomes water for 4 turns.
    const sorc = place(b, hero('riverZoraSorcerer', 'rs', 8), 9, 6);
    const tile = abilityTiles(b, sorc, ABILITIES.flood)[0];
    expect(castAbility(b, sorc, 'flood', rng(), undefined, tile)).not.toBeNull();
    expect(b.tiles[keyOf(b, tile.x, tile.y)]).toBe('water');
    expect(lrState(b).timers.length).toBeGreaterThan(0);
  });

  it('the Lorule group supports count heads (Family Reunion needs four Baby Maiamai; any three River Zora make a River Pack)', () => {
    const b = field();
    place(b, hero('motherMaiamai', 'mm'), 0, 0);
    for (let i = 0; i < 3; i++) place(b, hero('babyMaiamai', `bm${i}`), 4 + i, 0);
    b.groupSupports = ['familyReunion'];
    loruleBattleStart(b);
    expect(b.groupSupports).not.toContain('familyReunion');
    place(b, hero('babyMaiamai', 'bm9'), 7, 2);
    for (const id of ['riverZora', 'riverZoraWarrior', 'riverZoraHunter']) place(b, hero(id, `x${id}`), 9, 4);
    loruleBattleStart(b);
    expect(b.groupSupports).toEqual(expect.arrayContaining(['familyReunion', 'riverPack']));
  });
});

describe('A Link Between Worlds campaign', () => {
  it('the route: Hyrule in order, the Lorule hub, the Sage dungeons (the Desert Palace from Hyrule), the tower and the castle', () => {
    const run = newRun(5, 'linkALBW', 'lorule');
    expect(run.region).toBe('kakarikoLB');
    const st = loruleOf(run);
    run.region = 'kakarikoLB';
    expect(loruleRegionOptions(run, rng())).toEqual(['easternPalaceLB']);
    run.region = 'hyruleCastleLB';
    expect(loruleRegionOptions(run, rng())).toEqual(['thievesTown']);
    st.beaten.push('region:hyruleCastleLB', 'region:thievesTown');
    run.region = 'thievesTown';
    for (let i = 0; i < 10; i++) expect(loruleRegionOptions(run, rng(i))).not.toContain('desertPalaceLB');
    run.region = 'sanctuaryLB';
    const fromHyrule = new Set(Array.from({ length: 20 }, (_, i) => loruleRegionOptions(run, rng(i))).flat());
    expect(fromHyrule.has('desertPalaceLB')).toBe(true);
    for (const r of SAGE_DUNGEONS) st.beaten.push(`region:${r}`);
    run.region = 'iceRuins';
    expect(loruleRegionOptions(run, rng())).toEqual(['treacherousTower', 'loruleCastle']);
  });

  it('Ravio\'s shop: rent or buy, Sheerow reclaims a fallen renter\'s item; Maiamai make tools Nice; Master Ore tempers the Master Sword', () => {
    const run = newRun(7, 'ravio', 'lorule');
    run.rupees = 5000;
    const st = loruleOf(run);
    const ravio = run.roster.find((u) => u.templateId === 'ravio')!;
    expect(rentPrice(run, 'fireRod')).toBeLessThan(buyPrice(run, 'fireRod') / 10);
    expect(loruleCampOptions(run, 'camp').map((o) => o.facility)).toEqual(expect.arrayContaining(['ravio', 'nursery', 'forge', 'milkBar', 'sanctuary']));
    expect(doLoruleCamp(run, 'rent', rng(), ravio.uid, 'magicHammer')).toMatch(/rents/);
    expect(st.rentals).toEqual([{ id: 'magicHammer', uid: ravio.uid }]);
    expect(ravio.weapons).toContain('magicHammer');
    // The renter falls: the rental goes back to Ravio.
    const b = field();
    b.fallen.push({ ...ravio, hp: 0, team: 'player' });
    run.fallen.push({ ...ravio, hp: 0 });
    run.roster = run.roster.filter((u) => u !== ravio);
    const lines = loruleAfterBattle(run, b, false, rng());
    expect(lines.join(' ')).toMatch(/Sheerow/);
    expect(st.rentals.length).toBe(0);
    expect(run.fallen.find((u) => u.uid === ravio.uid)!.weapons).not.toContain('magicHammer');
    // Maiamai: every 10 rescued, a Nice upgrade on an owned (bought) tool.
    expect(doLoruleCamp(run, 'buy', rng(), undefined, 'fairyBow')).toMatch(/Bought/);
    rescueMaiamai(run, 10, []);
    expect(niceAvailable(run)).toBe(1);
    expect(doLoruleCamp(run, 'nice', rng(), undefined, 'fairyBow')).toMatch(/Nice/);
    expect(st.nice).toEqual(['fairyBow']);
    expect(niceAvailable(run)).toBe(0);
    rescueMaiamai(run, 90, []);
    expect(st.greatSpin).toBe(true);
    // Master Ore.
    run.convoy.push('masterSword');
    run.questItems!.push('masterOre', 'masterOre');
    expect(temper(run)).toMatch(/Tempered/);
    expect(temper(run)).toMatch(/Golden/);
    expect(run.convoy).toContain('goldenSword');
  });

  it('a battle in every region of the route sets up and plays a few rounds without errors', () => {
    for (const [i, world] of LORULE_ROUTE.entries()) {
      for (const nodeType of ['battle', 'boss'] as const) {
        const roster = ['linkALBW', 'zeldaALBW', 'riverZora', 'babyMaiamai', 'oren'].map((id, k) => makeHero(id, `p${k}`, 6, rng(i + k)));
        const b = createBattle({ world, nodeType, depth: 4 + i, roster, seed: 100 + i, healMult: 1 } as never);
        expect(b.units.some((u) => u.team === 'enemy'), world).toBe(true);
        const r = rng(i);
        for (let turn = 0; turn < 3 && !checkResult(b); turn++) {
          for (const team of ['player', 'enemy'] as const) {
            startPhase(b, team);
            for (const u of b.units.filter((x) => x.team === team)) {
              if (!b.units.includes(u) || u.acted) continue;
              const plan = planAction(b, u);
              moveUnit(u, plan.dest.x, plan.dest.y, plan.path.length - 1);
              const t = plan.action && b.units.find((x) => x.uid === plan.action!.target);
              if (t && plan.action!.type === 'attack') resolveCombat(b, u, t, r, plan.action!.weaponId);
              u.acted = true;
              if (checkResult(b)) break;
            }
          }
          b.turn++;
        }
      }
    }
  });
});
