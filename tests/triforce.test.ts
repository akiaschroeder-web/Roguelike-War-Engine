import { describe, expect, it } from 'vitest';
import { ART_VARIANTS, BOSSES, COMMANDERS, ENEMIES, GEAR, ITEMS, QUEST_ITEMS, REGION_BOSSES, ROSTERS, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { MATERIALS, OUTFITS, RECIPES, TF_ROUTE, TF_ROUTE_BOSSES } from '../src/content/triforce';
import { GROUP_SUPPORTS, SUPPORT_REGISTRY } from '../src/content/supports';
import { abilityTiles, castAbility, unusableReason } from '../src/engine/abilities';
import { ABILITIES } from '../src/data/registry';
import { moveUnit, startPhase } from '../src/engine/battle';
import { forecast } from '../src/engine/combat';
import { computeMoves, keyOf, unitAt, unitDist } from '../src/engine/grid';
import { baseOf, curseOutfit, heightOf, syncTotems, tfAfterWalk, tfAdjustItem, tfMultiplier, tfSaveFromDeath, totemArtOf, totemMembers, triforceBattleStart, triforceBeforeFinish, wears } from '../src/engine/triforce';
import { addMat, canCraft, doTriforceCamp, matCount, recipeCost, triforceAfterBattle, triforceCampOptions, triforceOf, triforceRegionOptions } from '../src/engine/triforceRun';
import { RNG } from '../src/engine/rng';
import { newRun } from '../src/engine/run';
import { effectiveStats, makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = (s = 11) => new RNG(s);
function field(w = 12, h = 8, world = 'woodlandsTF'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'woodlandsTF', lvl, uid, rng());
const cast = (b: Battle, u: Unit, id: string, t?: Unit, at?: { x: number; y: number }) => castAbility(b, u, id, rng(), t?.uid, at);

const NAMED = ['blueHero', 'redHero', 'styla', 'kingTuft', 'madameCouture', 'ladyMaud'];
const MONSTERS = ['totemArmos', 'keeleon', 'hokkubokku'];
const BOSS_IDS = ['margoma', 'blizzagia', 'ladysPets', 'stalchampion', 'prismantus'];
const MINI = ['electricBlobKing', 'electricBlobQueen', 'freezlord', 'vultureVizier', 'grimRepoe', 'gigaleon'];

describe('Tri Force Heroes content', () => {
  it('registers every new unit, recruitable and with art, with the doc\'s stats', () => {
    for (const id of [...NAMED, ...MONSTERS, ...BOSS_IDS, ...MINI]) { expect(TEMPLATES[id], id).toBeDefined(); expect(artFor(id), id).not.toBeNull(); }
    expect(TEMPLATES.blueHero.stats).toEqual({ hp: 28, str: 14, mag: 10, skl: 20, spd: 22, def: 9, res: 11, lck: 16, con: 8, mov: 7, sta: 35, mp: 30 });
    expect(TEMPLATES.ladyMaud.stats).toMatchObject({ hp: 35, mag: 32, res: 29, mp: 85 });
    expect(BOSSES.blizzagia.stats).toMatchObject({ hp: 110, mag: 34, res: 30 });
    expect(BOSSES.grimRepoe.stats).toMatchObject({ hp: 65, str: 23, mag: 26 });
    expect(ENEMIES.totemArmos.stats).toMatchObject({ hp: 42, def: 24 });
    // The ALBW Link is the Green Hero: his entry is unchanged, with the Green Hero art as an alternative.
    expect(TEMPLATES.linkALBW.stats).toMatchObject({ hp: 32, str: 16 });
    expect(ART_VARIANTS.linkALBW).toEqual(['linkALBW', 'greenHeroALBW']);
    expect(ART_VARIANTS.styla).toContain('stylaCursed');
    // Lady Maud's boss form and the Hinox Brothers recruit as their existing entries.
    expect(TEMPLATES.ladyMaudBoss).toBeUndefined(); expect(TEMPLATES.hinoxEldest).toBeUndefined();
    expect(artFor('hinoxEldest')).toBe(artFor('hinox')); expect(BOSSES.lilHinox.size).toBeLessThan(ENEMIES.hinox.size!);
  });

  it('has 34 outfits in the body slot, recipes made of real materials, and the six totem orders\' art', () => {
    expect(OUTFITS.length).toBe(34);
    for (const o of OUTFITS) { expect(o.slot).toBe('body'); expect(RECIPES[o.id], o.id).toBeDefined(); }
    for (const id of ['herosClothes', 'zoraArmor', 'fierceDeityBody', 'linebecksCoat']) { expect(GEAR[id]).toBeDefined(); expect(RECIPES[id]).toBeDefined(); }
    for (const r of Object.values(RECIPES)) for (const m of Object.keys(r.mats)) expect(MATERIALS, m).toContain(m);
    for (const m of MATERIALS) expect(QUEST_ITEMS[m] ?? ITEMS[m] ?? (m === 'fairyDust' ? {} : undefined), m).toBeDefined();
    for (const id of ['gripshot', 'doppelDoll']) expect(ITEMS[id]).toBeDefined();
    for (const id of ['waterRod', 'ladyMaudsParasol', 'grimRepoesScythe', 'stalchampionsSword']) expect(WEAPONS[id]).toBeDefined();
    expect(WEAPONS.ladyMaudsParasol.might).toBe(26); expect(WEAPONS.stalchampionsSword.might).toBe(28); expect(WEAPONS.grimRepoesScythe.might).toBe(21);
    for (const o of ['GRB', 'GBR', 'RGB', 'RBG', 'BGR', 'BRG', 'GR', 'GB', 'RG', 'RB', 'BG', 'BR']) expect(artFor(`totem${o}`), o).toBe(`totem${o}`);
  });

  it('has nine regions with their bosses, rosters and boss pools', () => {
    expect(TF_ROUTE.length).toBe(9);
    for (const r of TF_ROUTE) {
      expect(WORLDS[r]?.campaign).toBe('triforce');
      for (const id of TF_ROUTE_BOSSES[r]) expect(BOSSES[id], id).toBeDefined();
      for (const id of ROSTERS[r]) expect(ENEMIES[id], id).toBeDefined();
      for (const id of REGION_BOSSES[r]) expect(BOSSES[id], id).toBeDefined();
    }
    expect(TF_ROUTE_BOSSES.riversideTF).toEqual(['arrghus']); expect(TF_ROUTE_BOSSES.denOfTrialsTF).toEqual(['shadowLink']);
  });

  it('adds King Tuft and Lady Maud as commanders; ALBW Link leads the Tri Force Heroes without a second entry', () => {
    expect(COMMANDERS.filter((c) => c.heroId === 'linkALBW').length).toBe(1);
    expect(COMMANDERS.filter((c) => c.campaign === 'triforce').map((c) => c.heroId)).toEqual(['kingTuft', 'ladyMaud']);
    const run = newRun(3, 'linkALBW', 'triforce');
    expect(run.roster.map((u) => u.templateId)).toEqual(['linkALBW', 'blueHero', 'redHero']);
    expect(run.bonus).toBe('triforceHeroes');
    expect(run.region).toBe('woodlandsTF');
    expect(run.roster[0].artPick).toBe('greenHeroALBW');
    const home = newRun(3, 'linkALBW');
    expect(home.campaign).toBe('lorule');
    expect(home.roster.map((u) => u.templateId)).toEqual(['linkALBW', 'gulley', 'hyruleSoldier']);
    const tuft = newRun(4, 'kingTuft');
    expect(tuft.campaign).toBe('triforce');
    expect(tuft.roster.find((u) => u.templateId === 'styla')!.artPick).toBe('stylaCursed');
  });

  it('registers the supports and the group supports', () => {
    expect(SUPPORT_REGISTRY.filter((p) => p.game === 'triforce').length).toBe(20);
    for (const id of ['triForceHeroes', 'hytopianFashion', 'multicoloredCourage', 'mastersOfTransformation']) expect(GROUP_SUPPORTS.some((g) => g.id === id), id).toBe(true);
  });
});

describe('Totems', () => {
  function trio() {
    const b = field();
    const red = place(b, hero('redHero'), 3, 3);
    const green = place(b, hero('linkALBW'), 4, 3);
    const blue = place(b, hero('blueHero'), 3, 4);
    return { b, red, green, blue };
  }

  it('stacks up to three on one space; the base is the one on the tile, riders follow it', () => {
    const { b, red, green, blue } = trio();
    expect(unusableReason(b, green, ABILITIES.tfTotemStack)).toBeNull();
    expect(cast(b, green, 'tfTotemStack', red)).toBeTruthy();
    expect(cast(b, blue, 'tfTotemStack', green)).toBeTruthy();
    expect(totemMembers(b, red).map((u) => u.uid)).toEqual(['redHero', 'linkALBW', 'blueHero']);
    expect([green.x, green.y, blue.x, blue.y]).toEqual([3, 3, 3, 3]);
    expect(unitAt(b, 3, 3)).toBe(red);
    expect(heightOf(b, blue)).toBe(3); expect(heightOf(b, green)).toBe(2); expect(heightOf(b, red)).toBe(1);
    expect(unitDist(red, blue)).toBe(1);
    // Full: nobody else climbs on.
    const fourth = place(b, hero('styla'), 2, 3);
    expect(unusableReason(b, fourth, ABILITIES.tfTotemStack)).not.toBeNull();
    // The base moves the Totem at its lowest MOV (Red Hero's 5 here) and carries the others.
    expect(effectiveStats(red).mov).toBe(Math.min(effectiveStats(green).mov, effectiveStats(blue).mov, TEMPLATES.redHero.stats.mov));
    const moves = computeMoves(b, red);
    expect(moves.reach.has(keyOf(b, 6, 3))).toBe(true);
    moveUnit(red, 6, 3, 3);
    tfAfterWalk(b, red, [{ x: 3, y: 3 }, { x: 6, y: 3 }]);
    expect([green.x, green.y, blue.x, blue.y]).toEqual([6, 3, 6, 3]);
  });

  it('shows the Totem art matching the order, and the two-hero crop', () => {
    const { b, red, green, blue } = trio();
    cast(b, green, 'tfTotemStack', red);
    expect(totemArtOf(red)).toBe('totemGR');
    cast(b, blue, 'tfTotemStack', green);
    expect(totemArtOf(red)).toBe('totemBGR');
    // Hopping down the top: back to the two-hero art; then the stack comes apart and the art goes.
    const tiles = abilityTiles(b, blue, ABILITIES.tfTotemDrop);
    cast(b, blue, 'tfTotemDrop', undefined, tiles[0]);
    expect(totemArtOf(red)).toBe('totemGR');
    moveUnit(green, 5, 5, 3); tfAfterWalk(b, green, [{ x: 3, y: 3 }, { x: 5, y: 5 }]);
    expect(green.tfStack).toBeUndefined();
    expect(totemArtOf(red)).toBeNull(); expect(red.artOverride).toBeUndefined();
  });

  it('the top can\'t be reached by ground melee; the middle only fights at range; the base\'s fall collapses it', () => {
    const { b, red, green, blue } = trio();
    cast(b, green, 'tfTotemStack', red); cast(b, blue, 'tfTotemStack', green);
    const moblin = place(b, foe('moblin'), 3, 1, 'enemy');
    moblin.x = 2; moblin.y = 3; moblin.size = 1;
    expect(forecast(b, moblin, moblin, blue).attacker.canAttack).toBe(false);
    expect(forecast(b, moblin, moblin, red).attacker.canAttack).toBe(true);
    expect(forecast(b, green, green, moblin).attacker.canAttack).toBe(false);
    expect(forecast(b, blue, blue, moblin).attacker.canAttack).toBe(true);
    // The base falls: the riders tumble (15% of max HP), the middle one becomes the new base.
    red.hp = 0;
    syncTotems(b);
    expect(green.tfStack).toBeUndefined(); expect(baseOf(b, blue)).toBe(green);
    expect(green.hp).toBeLessThan(green.stats.hp);
  });

  it('Micro units ride Totem members without adding height', () => {
    const { b, red, green } = trio();
    cast(b, green, 'tfTotemStack', red);
    const baby = place(b, hero('babyMaiamai'), 3, 3);
    expect(cast(b, baby, 'mcHitchRide')).toBeTruthy();
    expect(totemMembers(b, red).length).toBe(2);
    expect(heightOf(b, green)).toBe(2);
  });

  it('cooperative actions: Elevated Strike, Hero Throw, Triple Spin, Tri Force Assault and Totem Guard spend Command Points', () => {
    const { b, red, green, blue } = trio();
    b.cp = 10; b.cpMax = 10;
    cast(b, green, 'tfTotemStack', red); cast(b, blue, 'tfTotemStack', green);
    expect(b.cp).toBe(8);
    const margoma = place(b, foe('margoma'), 4, 1, 'enemy');
    margoma.x = 4; margoma.y = 3; margoma.size = 1;
    // Margoma's spinning shell: elevated attacks hit its eye; ground attacks are blunted.
    expect(tfMultiplier(b, blue, blue, margoma, false, WEAPONS.fightersSword, 1)).toBeGreaterThan(tfMultiplier(b, red, red, margoma, false, WEAPONS.fightersSword, 1));
    const hp = margoma.hp;
    cast(b, blue, 'tfElevatedStrike', margoma);
    expect(margoma.hp).toBeLessThan(hp);
    cast(b, red, 'tfTotemGuard');
    expect(red.buffs.some((x) => x.id === 'tfTotemGuard')).toBe(true);
    expect(blue.buffs.some((x) => x.id === 'tfTotemGuarded')).toBe(true);
    for (const u of [red, green, blue]) u.acted = false;
    const before = margoma.hp;
    cast(b, red, 'tfTripleSpin');
    expect(margoma.hp).toBeLessThan(before);
    expect(green.acted && blue.acted).toBe(true);
    // Hero Throw: the base throws the top across the field.
    for (const u of [red, green, blue]) u.acted = false;
    margoma.hp = margoma.stats.hp;
    const t = abilityTiles(b, red, ABILITIES.tfHeroThrow)[0];
    cast(b, red, 'tfHeroThrow', undefined, t);
    expect([blue.x, blue.y]).toEqual([t.x, t.y]); expect(blue.tfStack).toBeUndefined();
    // The three heroes together: the Tri Force Assault.
    blue.x = 5; blue.y = 3; blue.acted = false; green.acted = false;
    const hp2 = margoma.hp;
    expect(unusableReason(b, green, ABILITIES.tfTriforceAssault)).toBeNull();
    cast(b, green, 'tfTriforceAssault', margoma);
    expect(margoma.hp).toBeLessThan(hp2);
    expect(b.cp).toBeLessThan(8);
  });

  it('a Triforce Gateway opens for three allies; an Elevated Switch needs a Totem', () => {
    const { b, red, green, blue } = trio();
    b.tiles[keyOf(b, 4, 4)] = 'triforceGateway';
    red.x = 5; red.y = 4; blue.x = 3; blue.y = 4; green.x = 4; green.y = 3;
    b.tiles[keyOf(b, 6, 6)] = 'elevatedSwitch';
    tfAfterWalk(b, blue, [{ x: 3, y: 4 }]);
    expect(b.tiles[keyOf(b, 4, 4)]).toBe('plain');
    expect(b.tf!.found).toContain('friendlyToken');
    const e = place(b, foe('octorok'), 10, 6, 'enemy');
    red.x = 6; red.y = 6;
    tfAfterWalk(b, red, [{ x: 6, y: 6 }]);
    expect(b.tiles[keyOf(b, 6, 6)]).toBe('elevatedSwitch');
    green.x = 6; green.y = 5;
    cast(b, green, 'tfTotemStack', red);
    tfAfterWalk(b, red, [{ x: 6, y: 6 }]);
    expect(b.tiles[keyOf(b, 6, 6)]).toBe('plain');
    expect(e.buffs.some((x) => x.id === 'tfSwitchDown')).toBe(true);
  });
});

describe('Outfits and the Fashion Curse', () => {
  it('heart outfits raise max HP for the battle only; tights halve it; the Big Bomb Outfit widens bombs', () => {
    const b = field();
    const u = place(b, hero('redHero'), 2, 2);
    u.gear.body = 'queenOfHearts';
    const v = place(b, hero('blueHero'), 3, 2);
    v.gear.body = 'cursedTights';
    const max = u.stats.hp, vmax = v.stats.hp;
    triforceBattleStart(b);
    expect(u.stats.hp).toBe(max + 30);
    expect(v.stats.hp).toBe(vmax - Math.floor(vmax / 2));
    expect(effectiveStats(v).str).toBe(v.stats.str + 8);
    triforceBeforeFinish(b);
    expect(u.stats.hp).toBe(max); expect(v.stats.hp).toBe(vmax);
    u.gear.body = 'bigBombOutfit';
    const bomb = tfAdjustItem(u, ITEMS.bomb)!;
    expect(bomb.radius).toBe((ITEMS.bomb.radius ?? 0) + 1); expect(bomb.power).toBeGreaterThan(ITEMS.bomb.power);
  });

  it('the Fashion Curse cancels an outfit\'s stats and effects; Expert Tailoring lifts it', () => {
    const b = field();
    const u = place(b, hero('blueHero'), 2, 2);
    u.gear.body = 'cheetahCostume';
    const mov = effectiveStats(u).mov;
    const maud = place(b, hero('ladyMaud'), 5, 2, 'enemy');
    expect(cast(b, maud, 'fashionCurse', u)).toBeTruthy();
    expect(effectiveStats(u).mov).toBe(mov - 2);
    expect(wears(u, 'cheetah')).toBe(false);
    const couture = place(b, hero('madameCouture'), 2, 3);
    cast(b, couture, 'expertTailoring', u);
    expect(wears(u, 'cheetah')).toBe(true);
    expect(effectiveStats(u).mov).toBe(mov);
    // Lady Maud's command: curses on enemies last a turn longer.
    const b2 = field();
    b2.tf = { pillars: [], found: [], rupees: 0, coop: 0, prism: 0, tyranny: 1 };
    const e = place(b2, foe('moblin'), 4, 4, 'enemy');
    e.gear.body = 'cactoClothes';
    curseOutfit(b2, e, 3);
    expect(e.buffs.find((x) => x.id === 'tfFashionCursed')!.turns).toBe(4);
  });

  it('Tingle Tights catch the first fatal blow', () => {
    const b = field();
    const u = place(b, hero('redHero'), 2, 2);
    u.gear.body = 'tingleTights';
    expect(tfSaveFromDeath(b, u)).not.toBeNull();
    expect(u.tfTingleUsed).toBe(true);
    expect(tfSaveFromDeath(b, u)).toBeNull();
  });
});

describe('The Tri Force Heroes campaign', () => {
  it('crafts outfits from materials and Rupees at Madame Couture\'s Boutique (Hytopian Fashion: 25% off)', () => {
    const run = newRun(5, 'kingTuft');
    run.rupees = 2000;
    expect(canCraft(run, 'cozyParka')).toBe(false);
    addMat(run, 'snowflakeTF', 2); addMat(run, 'fluffyFuzz', 1);
    expect(canCraft(run, 'cozyParka')).toBe(true);
    const opt = triforceCampOptions(run, 'camp').find((o) => o.key === 'craft')!;
    expect(opt.ok).toBe(true);
    expect(doTriforceCamp(run, 'craft', rng(), undefined, 'cozyParka')).toMatch(/Cozy Parka/);
    expect(run.convoy).toContain('cozyParka');
    expect(matCount(run, 'snowflakeTF')).toBe(0);
    expect(run.rupees).toBe(2000 - 300);
    // Gold Dust (a pack item) and Fairy Dust (the army's) are materials too.
    addMat(run, 'goldDust'); addMat(run, 'fairyDust');
    expect(matCount(run, 'goldDust')).toBe(1); expect(matCount(run, 'fairyDust')).toBeGreaterThanOrEqual(1);
    run.roster.push(makeHero('madameCouture', 'mc', 3, rng()));
    expect(recipeCost(run, 'cozyParka').rupees).toBe(230);
  });

  it('the Challenge Board restricts the next battle and pays rare materials', () => {
    const run = newRun(5, 'kingTuft');
    expect(doTriforceCamp(run, 'challenge', rng(), undefined, 'reducedDeployment')).toMatch(/Reduced Deployment/);
    expect(triforceOf(run).challenge).toBe('reducedDeployment');
    const b = field();
    b.tf = { pillars: [], found: [], rupees: 0, coop: 0, prism: 0, challenge: 'limitedTurns' };
    b.turn = 3;
    const before = (run.questItems ?? []).length;
    triforceAfterBattle(run, b, true, rng());
    expect((run.questItems ?? []).length).toBeGreaterThan(before);
  });

  it('follows the Drablands in order; Lady Maud\'s defeat lifts the Fashion Curse', () => {
    const run = newRun(6, 'kingTuft');
    run.region = 'woodlandsTF';
    expect(triforceRegionOptions(run, rng())).toEqual(['riversideTF']);
    const b = field(10, 8, 'skyRealmTF');
    b.nodeType = 'boss';
    const maud = makeEnemy(BOSSES.ladyMaudBoss, 'skyRealmTF', 8, 'mb', rng(), { boss: true });
    b.fallen.push(maud);
    run.region = 'skyRealmTF';
    run.roster.push(makeHero('styla', 'st2', 3, rng()));
    expect(triforceOf(run).cursed).toBe(true);
    const lines = triforceAfterBattle(run, b, true, rng());
    expect(lines.join(' ')).toMatch(/Fashion Curse lifts/);
    expect(triforceOf(run).cursed).toBe(false);
    expect(run.roster.some((u) => u.templateId === 'ladyMaud')).toBe(true);
    expect(run.roster.filter((u) => u.templateId === 'styla').every((u) => u.artPick === 'styla')).toBe(true);
  });

  it('plays a battle in the campaign without errors', () => {
    const run = newRun(9, 'linkALBW', 'triforce');
    const b = field();
    for (const [i, u] of run.roster.entries()) place(b, u, 1, i + 1);
    place(b, foe('keeleon'), 8, 2, 'enemy');
    triforceBattleStart(b);
    for (let t = 0; t < 3; t++) { startPhase(b, 'player'); startPhase(b, 'enemy'); b.turn++; }
    expect(b.units.length).toBeGreaterThan(0);
  });
});
