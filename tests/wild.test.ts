import { describe, expect, it } from 'vitest';
import { ABILITIES, ART_VARIANTS, BOSSES, CLASSES, COMMANDERS, ENEMIES, EVENTS, GEAR, ITEMS, QUEST_ITEMS, RACES, REGION_BOSSES, ROSTERS, SKILLS, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { ERA_OF_THE_WILD, MATERIALS, VEHICLES } from '../src/content/wild';
import { GROUP_SUPPORTS } from '../src/content/supports';
import { castAbility, unusableReason } from '../src/engine/abilities';
import { checkResult, createBattle, moveUnit, startPhase } from '../src/engine/battle';
import { forecast, resolveCombat, resolveHeal } from '../src/engine/combat';
import { environmentPhase } from '../src/engine/field';
import { computeMoves, keyOf } from '../src/engine/grid';
import { planAction } from '../src/engine/ai';
import { useItem } from '../src/engine/items';
import { RNG } from '../src/engine/rng';
import { MOVE_COSTS, SPECIAL_TERRAIN, TERRAIN_BONUS } from '../src/engine/rules';
import { availableNodes, chooseEvent, enterNode, finishBattle, newRun, offerRegions, recruitOffers, startBattle, type RunWithEvent } from '../src/engine/run';
import { activeGroups, specialSupportMods } from '../src/engine/supports';
import { effectiveStats, makeEnemy, makeHero, maxUses, prepareForBattle, usesLeft } from '../src/engine/units';
import { addGloom, applyTier, cureGloom, react, wildState } from '../src/engine/wild';
import { cook, doWildCamp, unlockBlueprint, wildAfterBattle, wildCampOptions, wildOf, wildRegionOptions, WILD_REGIONS } from '../src/engine/wildRun';
import { wildTraits } from '../src/engine/wildGear';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = (s = 7) => new RNG(s);

function field(w = 14, h = 9, world = 'greatPlateau'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'greatPlateau', lvl, uid, rng());

// Template ids fixed by the doc's Implementation IDs section.
const DOC_IDS = ['heroOfTheWild', 'zeldaWild', 'lightDragon', 'ganondorfWild', 'demonDragon', 'phantomGanondorf', 'calamityGanon', 'darkBeastGanonWild',
  'mipha', 'daruk', 'revali', 'urbosa', 'sidon', 'yunobo', 'tulin', 'riju', 'mineru', 'mineruConstruct', 'rauruZonai', 'sonia', 'dinraal', 'naydra', 'farosh', 'satori', 'malanya',
  'impaWild', 'purah', 'robbie', 'paya', 'kohga', 'sooga', 'teba', 'kass', 'hestu', 'kingRhoam', 'dorephan', 'muzu', 'yona', 'bludo', 'buliara', 'hudson', 'kilton', 'koltin', 'tauro', 'penn', 'hino', 'granteson',
  'yigaFootsoldier', 'yigaBlademaster', 'yigaEngineer', 'guardianStalker', 'guardianSkywatcher', 'guardianTurret', 'decayedGuardian', 'guardianScout1', 'guardianScout2', 'guardianScout3', 'guardianScout4',
  'soldierConstruct1', 'soldierConstruct2', 'soldierConstruct3', 'soldierConstruct4', 'captainConstruct1', 'captainConstruct2', 'captainConstruct3', 'captainConstruct4', 'stewardConstruct', 'forgeConstruct',
  'lynel', 'hinox', 'stalnox', 'stoneTalus', 'igneoTalus', 'frostTalus', 'battleTalus', 'molduga', 'molduking', 'bossBokoblin', 'horriblin', 'gleeokFlame', 'gleeokFrost', 'gleeokThunder', 'kingGleeok',
  'stonePebblit', 'igneoPebblit', 'frostPebblit', 'evermean', 'aerocuda', 'mothGibdo', 'gloomSpawn', 'bubbulfrog', 'blupee', 'littleFrox', 'frox', 'stalkoblin', 'stalmoblin', 'stalizalfos',
  'waterblight', 'fireblight', 'windblight', 'thunderblight', 'mazKoshia', 'colgera', 'marbledGohma', 'mucktorok', 'queenGibdo', 'seizedConstruct', 'moragia', 'fluxConstruct1', 'fluxConstruct2', 'fluxConstruct3',
  'vahRuta', 'vahRudania', 'vahMedoh', 'vahNaboris', 'giantWhiteStallion', 'royalWhiteStallion', 'patricia', 'mountainBear', 'mountainDeer', 'masterCycleZero'];
const WILD_COMMANDERS = ['heroOfTheWild', 'zeldaWild', 'mipha', 'daruk', 'revali', 'urbosa', 'sidon', 'yunobo', 'tulin', 'riju', 'mineru', 'rauruZonai', 'kohga', 'ganondorfWild', 'calamityGanon'];

describe('Era of the Wild content', () => {
  it('registers the pack: 15 commanders, 19 regions on three layers, and every doc unit (all recruitable)', () => {
    expect(COMMANDERS.filter((c) => c.campaign === 'wild').map((c) => c.heroId)).toEqual(WILD_COMMANDERS);
    const regions = Object.values(WORLDS).filter((w) => w.campaign === 'wild');
    expect(regions.length).toBe(19);
    expect(new Set(regions.map((r) => r.layer))).toEqual(new Set(['surface', 'sky', 'depths']));
    for (const id of DOC_IDS) expect(TEMPLATES[id], id).toBeDefined();
    for (const id of ['calamityGanonBoss', 'ganondorfWildBoss', 'demonDragonBoss', 'kohgaBoss', 'vahRutaBoss']) expect(TEMPLATES[id], id).toBeUndefined();
    expect(TEMPLATES.heroOfTheWild.stats).toMatchObject({ hp: 30, str: 12, mag: 5, skl: 15, spd: 14, def: 8, res: 6, lck: 10, con: 10, mov: 6, sta: 35, mp: 12 });
    expect(TEMPLATES.calamityGanon.size).toBe(4);
    expect(TEMPLATES.darkBeastGanonWild.size).toBe(5);
    expect(TEMPLATES.vahNaboris.stats).toMatchObject({ hp: 190, mag: 40, mp: 110 });
    expect(BOSSES.colgera.stats.hp).toBe(95);
    expect(TEMPLATES.zeldaWild.exclusiveWith).toContain('lightDragon');
    expect(TEMPLATES.ganondorfWild.exclusiveWith).toContain('demonDragon');
    // Returning units keep their entries: no second Gibdo, Bokoblin or Master Sword.
    expect(ERA_OF_THE_WILD.enemies.some((e) => ['gibdo', 'bokoblin', 'moblin', 'lizalfos', 'keese', 'octorok'].includes(e.id))).toBe(false);
    expect(ERA_OF_THE_WILD.weapons.some((w) => w.id === 'masterSword' || w.id === 'fairyBow')).toBe(false);
    expect(ERA_OF_THE_WILD.gear.some((g) => g.id === 'hylianShield')).toBe(false);
  });

  it('only references things that exist', () => {
    const missing: string[] = [];
    const known = (id: string) => !!(WEAPONS[id] || GEAR[id] || ITEMS[id]);
    const P = ERA_OF_THE_WILD;
    for (const t of [...P.templates, ...P.enemies, ...P.bosses]) {
      if (!RACES[t.race]) missing.push(`race ${t.race} (${t.id})`);
      if (!CLASSES[t.classId]) missing.push(`class ${t.classId} (${t.id})`);
      for (const w of t.weapons) if (!WEAPONS[w]) missing.push(`weapon ${w} (${t.id})`);
      if (t.skill && !SKILLS[t.skill]) missing.push(`skill ${t.skill} (${t.id})`);
      for (const s of ('extraSkills' in t ? t.extraSkills ?? [] : [])) if (!SKILLS[s]) missing.push(`skill ${s} (${t.id})`);
      for (const a of ('abilities' in t ? t.abilities ?? [] : [])) if (!ABILITIES[a]) missing.push(`ability ${a} (${t.id})`);
      for (const g of Object.values(('gear' in t ? t.gear : undefined) ?? {})) if (!GEAR[g as string]) missing.push(`gear ${g} (${t.id})`);
      const home = (t as { home?: string }).home;
      if (home && !WORLDS[home]) missing.push(`home ${home} (${t.id})`);
    }
    for (const b of P.bosses) for (const d of b.drops ?? []) if (!known(d)) missing.push(`drop ${d} (${b.id})`);
    for (const [r, ids] of Object.entries(P.rosters)) for (const id of ids) if (!ENEMIES[id]) missing.push(`roster ${r}: ${id}`);
    for (const r of P.regions) { if (!ROSTERS[r.id]?.length) missing.push(`no roster ${r.id}`); if (!REGION_BOSSES[r.id]?.length) missing.push(`no boss ${r.id}`); }
    for (const ids of Object.values(P.regionBosses)) for (const id of ids) if (!BOSSES[id]) missing.push(`boss ${id}`);
    for (const c of P.commanders) {
      for (const u of [c.heroId, ...c.units]) if (!TEMPLATES[u]) missing.push(`commander unit ${u}`);
      for (const i of c.startingItems ?? []) if (!known(i)) missing.push(`starting item ${i}`);
    }
    for (const f of P.factions) for (const u of [...f.units, ...f.leaders]) if (!TEMPLATES[u]) missing.push(`faction ${f.id}: ${u}`);
    for (const ev of P.events ?? []) {
      if (ev.art && !artFor(ev.art)) missing.push(`event art ${ev.art}`);
      for (const r of ev.regions ?? []) if (!WORLDS[r]) missing.push(`event region ${r}`);
      for (const ch of ev.choices) {
        for (const id of Object.keys(ch.requires?.questCount ?? {})) if (!QUEST_ITEMS[id]) missing.push(`event ${ev.id} needs ${id}`);
        for (const o of [ch.outcome, ch.gamble?.win, ch.gamble?.lose].filter(Boolean)) for (const e of o!.effects) {
          if (e.kind === 'loot') for (const i of e.ids) if (!known(i)) missing.push(`event ${ev.id} loot ${i}`);
          if (e.kind === 'recruit') for (const i of e.pool) if (!TEMPLATES[i]) missing.push(`event ${ev.id} recruit ${i}`);
          if ((e.kind === 'quest' || e.kind === 'takeQuest') && !QUEST_ITEMS[e.id]) missing.push(`event ${ev.id} quest ${e.id}`);
        }
      }
    }
    for (const a of P.abilities) for (const g of a.grantedBy?.gear ?? []) if (!GEAR[g]) missing.push(`ability ${a.id} gear ${g}`);
    for (const a of P.abilities) for (const t of a.grantedBy?.templates ?? []) if (!TEMPLATES[t] && !BOSSES[t]) missing.push(`ability ${a.id} template ${t}`);
    for (const v of VEHICLES) { if (!TEMPLATES[v.id]) missing.push(`vehicle ${v.id}`); for (const d of Object.keys(v.devices)) if (!ITEMS[d]) missing.push(`vehicle device ${d}`); }
    for (const g of GROUP_SUPPORTS) for (const m of g.members) if (!TEMPLATES[m]) missing.push(`group ${g.id}: ${m}`);
    for (const m of MATERIALS) if (!QUEST_ITEMS[m.id]) missing.push(`material ${m.id}`);
    expect(missing).toEqual([]);
    expect(EVENTS.bloodMoonRising).toBeTruthy();
  });

  it('every Wild unit, monster and boss has art; alternate art is appended to the older lists', () => {
    const noArt = [...ERA_OF_THE_WILD.templates, ...ERA_OF_THE_WILD.enemies, ...ERA_OF_THE_WILD.bosses]
      .filter((t) => t.race !== 'zonaiVehicle' && !artFor(t.id)).map((t) => t.id);
    expect(noArt).toEqual([]);
    expect(artFor('mineru')).toBe('mineruConstruct');
    expect(artFor('yigaEngineer')).toBe('yigaBlademaster');
    expect(artFor('soldierConstruct2')).toBe('soldierConstructSpear');
    expect(artFor('soldierConstruct4')).toBe('soldierConstructAxe');
    expect(artFor('captainConstruct3')).toBe('captainConstructBlade');
    expect(artFor('captainConstruct4')).toBe('captainConstructGold');
    expect(ART_VARIANTS.ganondorfWild).toEqual(['ganondorfWild', 'ganondorfWildDemonKing']);
    expect(ART_VARIANTS.gibdo).toEqual(['gibdo', 'gibdoTOTK']);
    expect(ART_VARIANTS.lizalfos[ART_VARIANTS.lizalfos.length - 1]).toBe('lizalfosBotW');
    expect(ART_VARIANTS.bokoblin).toContain('bokoblinBotW');
    expect(ART_VARIANTS.likeLike).toEqual(['likeLike', 'likeLikeBotW']);
    for (const id of ['goronWarrior', 'goronRoller']) expect(ART_VARIANTS[id]).toEqual(['goronWarrior', 'goronWarriorTP', 'goronWarriorWW', 'goronWarriorBotW']);
    for (const id of ['zoraWarrior', 'zoraMystic']) expect(ART_VARIANTS[id]).toEqual(['zoraWarrior', 'zoraWarriorTP', 'zoraWarriorBotW']);
    for (const id of ['ritoScout', 'ritoArcher', 'ritoGeneric']) expect(ART_VARIANTS[id]).toEqual(['ritoGeneric', 'ritoWarriorBotW']);
  });

  it('adds the 18 group supports, every battlefield space has a look, costs and a bonus', () => {
    const ids = ['championsOfHyrule', 'fiveChampions', 'sagesOfTheNewEra', 'acrossOneHundredYears', 'foundingOfHyrule', 'sheikahResearchTeam', 'ancientAndModernTech', 'threeGenerationsOfRito',
      'zoraRoyalFamily', 'gerudoLegacy', 'goronChampions', 'fourDivineBeasts', 'threeSacredDragons', 'yigaEngineeringDivision', 'ancientWarMachines', 'firstAndTheLast', 'legacyOfHylia', 'demonKings'];
    for (const id of ids) expect(GROUP_SUPPORTS.some((g) => g.id === id), id).toBe(true);
    const spaces: Terrain[] = ['climbableCliff', 'wetCliff', 'updraft', 'burningGrass', 'dryGrass', 'tallTree', 'fallenLog', 'oreDeposit', 'rareOre', 'luminousOre', 'cookingPot', 'monsterCamp',
      'monsterLookout', 'explosiveBarrel', 'sludge', 'korokPuzzle', 'stable', 'shrineEntrance', 'sheikahTower', 'skyviewTower', 'floatingIsland', 'fallingRuin', 'deviceDispenser', 'launchPlatform',
      'waterSphere', 'lowGravity', 'zonaiTerminal', 'crystalPedestal', 'floatingPlatform', 'gloom', 'gloomPool', 'lightroot', 'darkness', 'poeSpirit', 'bargainerStatue', 'zonaiteDeposit',
      'abandonedMine', 'ascendPillar', 'yigaHideout', 'chasm', 'pristinePedestal'];
    for (const t of spaces) {
      expect(SPECIAL_TERRAIN[t as keyof typeof SPECIAL_TERRAIN], t).toBeDefined();
      expect(TERRAIN_BONUS[t], t).toBeDefined();
      expect(MOVE_COSTS.foot[t], t).toBeDefined();
    }
  });
});

describe('Weapon fusion and durability', () => {
  it('a fused horn adds Might and durability — on any pack\'s weapon — and decay takes them away', () => {
    const b = field();
    const link = place(b, hero('heroOfTheWild', 'l', 5), 2, 4);
    const e = place(b, foe('bokoblin', 'e1', 3), 3, 4, 'enemy');
    for (const wid of ['travelersSword', 'kokiriSword']) {
      link.weapons = [wid];
      link.fused = {};
      const base = forecast(b, link, link, e, wid).attacker.dmg;
      const baseUses = usesLeft(link, wid)!;
      link.fused[wid] = 'lynelSaberHorn';
      expect(forecast(b, link, link, e, wid).attacker.dmg).toBeGreaterThanOrEqual(base + 15);
      expect(usesLeft(link, wid)!).toBeGreaterThan(baseUses);
    }
    link.weapons = ['knightsBroadsword'];
    link.fused = {};
    const clean = forecast(b, link, link, e, 'knightsBroadsword').attacker.dmg;
    link.wmod = { knightsBroadsword: 'decayed' };
    expect(forecast(b, link, link, e, 'knightsBroadsword').attacker.dmg).toBeLessThan(clean);
    expect(usesLeft(link, 'knightsBroadsword')!).toBeLessThan(maxUses(WEAPONS.knightsBroadsword));
    link.wmod = { knightsBroadsword: 'pristine' };
    expect(forecast(b, link, link, e, 'knightsBroadsword').attacker.dmg).toBeGreaterThan(clean);
  });

  it('Gerudo weapons double fused bonuses; gems give an element; the Master Sword rests instead of breaking', () => {
    const b = field();
    const riju = place(b, hero('riju', 'r', 5), 2, 4);
    const e = place(b, foe('bokoblin', 'e1', 3), 3, 4, 'enemy');
    riju.weapons = ['gerudoScimitarWild'];
    const base = forecast(b, riju, riju, e).attacker.dmg;
    riju.fused = { gerudoScimitarWild: 'moblinHorn' };
    expect(forecast(b, riju, riju, e).attacker.dmg).toBe(base + 10);
    riju.fused = { gerudoScimitarWild: 'ruby' };
    expect(forecast(b, riju, riju, e).attacker.element).toBe('fire');
    const link = place(b, hero('heroOfTheWild', 'l', 5), 2, 2);
    link.weapons = ['masterSword'];
    link.msEnergy = 1;
    const e2 = place(b, foe('bokoblin', 'e2', 1), 3, 2, 'enemy');
    e2.stats.hp = e2.hp = 200;
    resolveCombat(b, link, e2, rng());
    expect(link.weapons).toContain('masterSword');
    expect(link.buffs.some((x) => x.id === 'msDrained')).toBe(true);
    expect(forecast(b, link, link, e2, 'masterSword').attacker.canAttack).toBe(false);
  });

  it('the Fusion Station fuses from the material bag at camp', () => {
    const run = newRun(5, 'heroOfTheWild', 'wild') as RunWithEvent;
    run.questItems!.push('bokoblinHorn');
    const link = run.roster[0];
    const opt = wildCampOptions(run, 'camp').find((o) => o.key === 'fuseWeapon')!;
    expect(opt.select!.some((s) => s.id === 'bokoblinHorn')).toBe(true);
    expect(doWildCamp(run, 'fuseWeapon', rng(), link.uid, 'bokoblinHorn')).toMatch(/fused/);
    expect(link.fused?.[link.weapons[0]]).toBe('bokoblinHorn');
    expect(run.questItems!.includes('bokoblinHorn')).toBe(false);
  });
});

describe('Gloom and Malice', () => {
  it('Gloom lowers max HP; ordinary healing can\'t restore it; sunlight and Sunny meals do', () => {
    const b = field();
    const z = place(b, hero('zeldaWild', 'z', 5), 2, 2);
    const max = z.stats.hp;
    expect(addGloom(b, z, 6)).toBe(6);
    expect(z.stats.hp).toBe(max - 6);
    z.hp = 1;
    const healer = place(b, hero('mipha', 'm', 5), 3, 2);
    resolveHeal(b, healer, z, rng(), 'healStaff');
    expect(z.hp).toBeLessThanOrEqual(max - 6);
    z.pack = [{ id: 'sunnyFriedWildGreens', uses: 1 }];
    useItem(b, z, 0, rng());
    expect(z.stats.hp).toBe(max);
    expect(z.gloom ?? 0).toBe(0);
    // Gloom terrain at the start of a turn
    b.tiles[keyOf(b, z.x, z.y)] = 'gloom';
    startPhase(b, 'player');
    expect(z.gloom).toBeGreaterThan(0);
    // Sunlight after a surface battle heals half of it.
    const g = z.gloom!;
    cureGloom(z, 1);
    expect(z.gloom).toBe(g - 1);
  });

  it('Malice burns over time and sacred light purges it; Gloom attacks from the Demon King', () => {
    const b = field();
    const link = place(b, hero('heroOfTheWild', 'l', 5), 2, 4);
    link.statuses.push({ kind: 'malice', turns: 3 });
    const hp = link.hp;
    startPhase(b, 'player');
    expect(link.hp).toBeLessThan(hp);
    const g = place(b, foe('ganondorfWildBoss', 'g', 5), 3, 4, 'enemy');
    link.stats.hp = link.hp = 200;
    const before = link.stats.hp;
    resolveCombat(b, g, link, rng(3));
    expect(link.stats.hp).toBeLessThan(before);
  });
});

describe('Elemental reactions', () => {
  it('fire spreads through dry grass; ice freezes water; water washes sludge; lightning runs through water', () => {
    const b = field();
    for (let x = 4; x < 9; x++) b.tiles[keyOf(b, x, 4)] = 'dryGrass';
    react(b, { x: 4, y: 4 }, 'fire');
    expect(b.fires?.length).toBeGreaterThan(0);
    for (let i = 0; i < 6; i++) environmentPhase(b);
    expect([5, 6, 7, 8].some((x) => b.tiles[keyOf(b, x, 4)] !== 'dryGrass' || b.fires?.some((f) => f.x === x))).toBe(true);
    b.tiles[keyOf(b, 2, 2)] = 'water';
    react(b, { x: 2, y: 2 }, 'ice');
    expect(b.tiles[keyOf(b, 2, 2)]).toBe('frozenWater');
    const walker = place(b, hero('heroOfTheWild', 'w', 3), 1, 2);
    expect(computeMoves(b, walker).reach.has(keyOf(b, 2, 2))).toBe(true);
    b.tiles[keyOf(b, 10, 1)] = 'sludge';
    react(b, { x: 10, y: 1 }, 'water');
    expect(b.tiles[keyOf(b, 10, 1)]).toBe('plain');
    for (let x = 0; x < 4; x++) b.tiles[keyOf(b, x, 7)] = 'water';
    const zora = place(b, hero('sidon', 's', 3), 0, 7, 'enemy');
    zora.size = 1;
    const hp = zora.hp;
    react(b, { x: 3, y: 7 }, 'lightning', walker);
    expect(zora.hp).toBeLessThan(hp);
  });

  it('existing Fire Fruit sets dry grass alight; a pine cone in the fire makes an updraft', () => {
    const b = field();
    const u = place(b, hero('heroOfTheWild', 'l', 3), 2, 2);
    b.tiles[keyOf(b, 4, 2)] = 'dryGrass';
    u.pack = [{ id: 'hylianPineCone', uses: 3 }, { id: 'fireFruit', uses: 2 }];
    useItem(b, u, 0, rng(), { x: 4, y: 2 });
    useItem(b, u, 1, rng(), { x: 4, y: 2 });
    expect(b.fires?.some((f) => f.x === 4 && f.y === 2)).toBe(true);
    environmentPhase(b);
    expect(b.tiles.includes('updraft')).toBe(true);
  });
});

describe('Hero techniques', () => {
  it('Flurry Rush: a dodge sets up a flurry of strikes; Bullet Time: no counters against aerial archers', () => {
    const b = field();
    const link = place(b, hero('heroOfTheWild', 'l', 10), 2, 4);
    link.weapons = ['travelersSword'];
    link.stats.spd = 60; link.stats.lck = 60;
    const e = place(b, foe('bokoblin', 'e1', 1), 3, 4, 'enemy');
    e.stats.hp = e.hp = 300;
    const res = resolveCombat(b, e, link, rng(11));
    expect(res.strikes.filter((s) => s.by === link.uid).length).toBeGreaterThanOrEqual(4);
    const archer = place(b, hero('heroOfTheWild', 'a', 5), 2, 1);
    archer.weapons = ['travelersBow'];
    archer.buffs.push({ id: 'aerial', name: 'Updraft', turns: 1 });
    const bow = place(b, foe('bokoblin', 'e2', 1), 5, 1, 'enemy');
    bow.weapons = ['bokoBow'];
    expect(forecast(b, archer, archer, bow, 'travelersBow').defender.canAttack).toBe(false);
  });

  it('charged attacks: a two-handed charge pierces; Urbosa\'s Fury spends its charges on charged hits', () => {
    const b = field();
    const urb = place(b, hero('urbosa', 'u', 8), 2, 4);
    b.groupSupports = [];
    startPhase(b, 'player');
    const e1 = place(b, foe('bokoblin', 'e1', 1), 3, 4, 'enemy');
    const e2 = place(b, foe('bokoblin', 'e2', 1), 3, 5, 'enemy');
    e1.stats.hp = e1.hp = e2.stats.hp = e2.hp = 300;
    urb.wildCharges = { urbosasFury: 3 };
    urb.sta = 30;
    resolveCombat(b, urb, e1, rng(2), 'scimitarOfTheSeven', 'chargedAttack');
    expect(urb.wildCharges.urbosasFury).toBeLessThan(3);
    expect(e2.hp).toBeLessThan(300);
  });
});

describe('Champions and Sages', () => {
  it("Mipha's Grace saves once; Daruk's Protection blocks three blows; Revali's Gale has three charges", () => {
    const b = field();
    const mipha = place(b, hero('mipha', 'm', 5), 2, 2);
    const ally = place(b, hero('heroOfTheWild', 'l', 1), 3, 2);
    const daruk = place(b, hero('daruk', 'd', 5), 6, 6);
    const revali = place(b, hero('revali', 'r', 5), 10, 1);
    const lynel = place(b, foe('lynel', 'ly', 15), 4, 2, 'enemy');
    // battle start sets the charges
    const bt = createBattle({ world: 'greatPlateau', nodeType: 'battle', depth: 1, roster: [mipha, ally, daruk, revali], seed: 1 });
    expect(bt.units.find((u) => u.templateId === 'daruk')!.wildCharges?.daruksProtection).toBe(3);
    mipha.wildCharges = { miphasGrace: 1 };
    daruk.wildCharges = { daruksProtection: 3 };
    revali.wildCharges = { revalisGale: 3 };
    ally.hp = 1;
    resolveCombat(b, lynel, ally, rng(1));
    expect(b.log.join(' ')).toMatch(/Mipha's Grace/);
    expect(mipha.wildCharges.miphasGrace).toBe(0);
    const ogre = place(b, foe('hinox', 'hx', 10), 7, 2, 'enemy');
    void ogre;
    const hp = daruk.hp;
    const brute = place(b, foe('lynel', 'bk', 20), 8, 5, 'enemy');
    void hp;
    resolveCombat(b, brute, daruk, rng(100));
    expect(daruk.wildCharges.daruksProtection).toBeLessThan(3);
    expect(b.log.join(' ')).toMatch(/Daruk's Protection blocks/);
    for (let i = 0; i < 3; i++) { expect(castAbility(b, revali, 'revalisGale', rng(), revali.uid)).not.toBeNull(); }
    expect(unusableReason(b, revali, ABILITIES.revalisGale)).toMatch(/charges/);
    expect(revali.buffs.some((x) => x.id === 'aerial')).toBe(true);
  });

  it('Sage cooldowns: Water Shield 3 turns (2 with the Sages of the New Era); it blocks one attack', () => {
    const b = field();
    const sidon = place(b, hero('sidon', 's', 5), 2, 2);
    expect(castAbility(b, sidon, 'waterShield', rng(), sidon.uid)).not.toBeNull();
    expect(sidon.cooldowns?.waterShield).toBe(3);
    const e = place(b, foe('lynel', 'e', 12), 4, 2, 'enemy');
    e.stats.skl = 99;
    const hp = sidon.hp;
    void hp;
    resolveCombat(b, e, sidon, rng(5));
    expect(b.log.join(' ')).toMatch(/water barrier bursts/);
    expect(sidon.buffs.some((x) => x.id === 'waterBarrier')).toBe(false);
    b.groupSupports = ['sagesOfTheNewEra'];
    sidon.cooldowns = {};
    castAbility(b, sidon, 'waterShield', rng(), sidon.uid);
    expect(sidon.cooldowns?.waterShield).toBe(2);
  });

  it('Mineru possesses her Construct or takes its form; Zelda becomes the Light Dragon for good', () => {
    const b = field(16, 12);
    const mineru = place(b, hero('mineru', 'mn', 5), 2, 2);
    const cons = place(b, hero('mineruConstruct', 'mc', 5), 3, 2);
    expect(castAbility(b, mineru, 'spiritTransfer', rng())).not.toBeNull();
    expect(cons.cargo?.some((c) => c.uid === 'mn')).toBe(true);
    expect(cons.buffs.some((x) => x.id === 'possessed')).toBe(true);
    expect(castAbility(b, cons, 'leaveConstruct', rng())).not.toBeNull();
    expect(b.units.some((u) => u.uid === 'mn')).toBe(true);
    const zelda = place(b, hero('zeldaWild', 'z', 5), 8, 6);
    zelda.gear.acc1 = 'secretStoneLight';
    b.turn = 3;
    expect(unusableReason(b, zelda, ABILITIES.draconification)).toBeNull();
    castAbility(b, zelda, 'draconification', rng());
    expect(zelda.templateId).toBe('lightDragon');
    expect(zelda.permanentForm).toBe(true);
  });
});

describe('Divine Beasts, monster tiers and machines', () => {
  it('Divine Beasts carry troops, charge their laser, and are disabled rather than destroyed', () => {
    const b = field(18, 12);
    const ruta = place(b, hero('vahRuta', 'vr', 5), 2, 2);
    const mipha = place(b, hero('mipha', 'm', 5), 7, 2);
    expect(ruta.size).toBe(5);
    expect(castAbility(b, mipha, 'boardTransport', rng(), ruta.uid)).not.toBeNull();
    expect(ruta.cargo?.length).toBe(1);
    expect(ruta.buffs.some((x) => x.id === 'championPilot')).toBe(true);
    const e = place(b, foe('bokoblin', 'e', 3), 9, 8, 'enemy');
    void e;
    const r2 = place(b, hero('vahRudania', 'vd', 5), 2, 7);
    b.turn = 1;
    expect(unusableReason(b, r2, ABILITIES.divineBeastLaser)).toMatch(/charging/);
    const giant = place(b, foe('lynel', 'ly', 30), 7, 8, 'enemy');
    r2.hp = 1;
    resolveCombat(b, giant, r2, rng(4));
    expect(b.units.includes(r2)).toBe(true);
    expect(r2.wildDisabled).toBe(true);
  });

  it('monster tiers multiply HP, STR, MAG, SKL, SPD, DEF and RES (Blue ×1.2 … Gold ×2.0)', () => {
    const u = foe('bokoblin', 'b', 1);
    const s = { ...u.stats };
    applyTier(u, 4);
    expect(u.name).toMatch(/^Gold/);
    expect(u.stats.hp).toBe(Math.round(s.hp * 2));
    expect(u.stats.str).toBe(Math.round(s.str * 2));
    expect(u.stats.lck).toBe(s.lck);
    expect(u.stats.mov).toBe(s.mov);
  });

  it('Zonai Devices draw on the shared Energy Cell; vehicles are built at the Zonai Workshop', () => {
    const b = field();
    const st = wildState(b);
    const m = place(b, hero('mineru', 'mn', 5), 2, 2);
    m.pack = [{ id: 'flameEmitter', uses: 1 }, { id: 'zonaiRocket', uses: 1 }];
    st.energy = 2;
    expect(useItem(b, m, 1, rng())).toBeNull();
    st.energy = 30;
    useItem(b, m, 0, rng(), { x: 3, y: 2 });
    expect(b.units.some((u) => u.artId === 'flameEmitterDevice')).toBe(true);
    const run = newRun(3, 'mineru', 'wild') as RunWithEvent;
    expect(wildCampOptions(run, 'camp').find((o) => o.key === 'build:scoutCart')!.ok).toBe(false);
    run.questItems!.push(...Array(10).fill('zonaite'));
    run.convoy.push('zonaiCart', 'smallWheel', 'smallWheel', 'steeringStick');
    expect(doWildCamp(run, 'build:scoutCart', rng())).toMatch(/built/);
    expect(run.roster.some((u) => u.templateId === 'scoutCart')).toBe(true);
    expect(unlockBlueprint(run, 'hoverbike')).toBe('hoverbike');
    expect(run.questItems!.includes('blueprint_hoverbike')).toBe(true);
    expect(recruitOffers(run, rng(), 'greatPlateau').some((id) => TEMPLATES[id]?.race === 'zonaiVehicle')).toBe(false);
  });
});

describe('Armor sets and gear', () => {
  it('head + body + feet of a set give its bonus; resistances work', () => {
    const u = hero('heroOfTheWild', 'l', 1);
    u.gear = { head: 'snowquillHead', body: 'snowquillBody' };
    expect(wildTraits(u)).toContain('coldRes');
    expect(wildTraits(u)).not.toContain('freezeImmune');
    u.gear.feet = 'snowquillFeet';
    expect(wildTraits(u)).toContain('freezeImmune');
    u.armorStars = { snowquillBody: 2 };
    expect(effectiveStats(u).def).toBe(u.stats.def + 2 + 3 + 2 + 2);
  });
});

describe('The Era of the Wild campaign', () => {
  it('starts on the Great Plateau with an Energy Cell and Zonaite, and offers neighbouring regions', () => {
    for (const c of WILD_COMMANDERS) {
      const run = newRun(11, c, 'wild') as RunWithEvent;
      expect(run.region).toBe('greatPlateau');
      expect(run.campaign).toBe('wild');
      expect(wildOf(run).energyCap).toBe(30);
    }
    const run = newRun(12, 'heroOfTheWild') as RunWithEvent;
    expect(run.campaign).toBe('wild');
    expect(run.roster[0].gear.tool).toBe('sheikahSlate');
    const opts = wildRegionOptions(run, rng());
    expect(opts.length).toBeGreaterThan(0);
    for (const r of opts) expect(WILD_REGIONS).toContain(r);
    expect(opts).not.toContain('gloomsOrigin');
    offerRegions(run);
    expect((run.event as { options: string[] }).options.every((r) => WORLDS[r]?.campaign === 'wild')).toBe(true);
  });

  it('a first battle works for every commander, and the Blood Moon rises after enough battles', () => {
    for (const c of WILD_COMMANDERS) {
      const run = newRun(21, c, 'wild') as RunWithEvent;
      const node = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
      enterNode(run, node.id);
      if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
      expect(run.battle, c).toBeDefined();
      expect(run.battle!.wild?.energyMax).toBeGreaterThan(0);
      run.battle!.result = 'won';
      const sum = finishBattle(run);
      expect(sum.wild?.length).toBeGreaterThan(0);
    }
    const run = newRun(22, 'daruk', 'wild') as RunWithEvent;
    const w = wildOf(run);
    w.bloodMoonIn = 1;
    const b = createBattle({ world: 'greatPlateau', nodeType: 'battle', depth: 1, roster: run.roster, seed: 3 });
    b.result = 'won';
    const lines = wildAfterBattle(run, b, true, rng());
    expect(lines.join(' ')).toMatch(/Blood Moon rises/);
    expect(w.bloodMoon).toBe(3);
  });

  it('cooking: up to five ingredients make meals; the Blood Moon guarantees a critical', () => {
    const run = newRun(31, 'heroOfTheWild', 'wild') as RunWithEvent;
    run.questItems = ['mightyBananas', 'mightyBananas', 'mightyBananas', 'mightyBananas', 'mightyBananas', 'mightyBananas'];
    const before = run.convoy.length;
    expect(cook(run, 'mighty', 'meal', rng())).toMatch(/Mighty Banana Skewer/);
    const made = run.convoy.length - before;
    expect(run.questItems.filter((x) => x === 'mightyBananas').length).toBe(1);
    run.questItems.push('mightyBananas', 'mightyBananas', 'mightyBananas', 'mightyBananas');
    wildOf(run).bloodMoon = 2;
    const b2 = run.convoy.length;
    expect(cook(run, 'mighty', 'meal', rng())).toMatch(/critical/i);
    expect(run.convoy.length - b2).toBeGreaterThanOrEqual(made);
  });

  it('events, group supports and commander bonuses work', () => {
    const run = newRun(41, 'heroOfTheWild', 'wild') as RunWithEvent;
    run.event = { type: 'event', eventId: 'hestusDance' };
    run.questItems!.push('korokSeed', 'korokSeed', 'korokSeed');
    expect(chooseEvent(run, 0)?.lines.join(' ')).toMatch(/pack/);
    const b = field();
    for (const [i, id] of ['heroOfTheWild', 'mipha', 'daruk', 'revali', 'urbosa'].entries()) place(b, hero(id, id), 2 + i, 2);
    expect(activeGroups(b, 'player')).toEqual(expect.arrayContaining(['fiveChampions', 'championsOfHyrule']));
    b.groupSupports = activeGroups(b, 'player');
    const link = b.units[0];
    expect(specialSupportMods(b, link, link).str).toBeGreaterThanOrEqual(4);
    // Daruk's army: physical damage received −15%.
    const b2 = field();
    const d = place(b2, hero('goronWarrior', 'g', 3), 2, 2);
    const e = place(b2, foe('moblin', 'm', 6), 3, 2, 'enemy');
    const plain = forecast(b2, e, e, d).attacker.dmg;
    b2.bonus = 'goronGuard';
    expect(forecast(b2, e, e, d).attacker.dmg).toBeLessThan(plain);
  });

  it('battles in every Wild region set up and play a few rounds without errors', () => {
    const run = newRun(51, 'heroOfTheWild', 'wild') as RunWithEvent;
    for (const [i, r] of WILD_REGIONS.entries()) {
      const b = createBattle({ world: r, nodeType: i % 4 === 0 ? 'boss' : 'battle', depth: 4 + i, roster: run.roster, seed: 100 + i });
      const rr = rng(i);
      for (let turn = 0; turn < 3 && !checkResult(b); turn++) {
        for (const team of ['player', 'enemy'] as const) {
          startPhase(b, team);
          for (const u of b.units.filter((x) => x.team === team)) {
            if (!b.units.includes(u) || u.acted) continue;
            const plan = planAction(b, u);
            moveUnit(u, plan.dest.x, plan.dest.y, plan.path.length - 1);
            const t = plan.action && b.units.find((x) => x.uid === plan.action!.target);
            if (t && plan.action!.type === 'attack') resolveCombat(b, u, t, rr, plan.action!.weaponId);
            u.acted = true;
            if (checkResult(b)) break;
          }
        }
        environmentPhase(b);
        b.turn++;
      }
      expect(b.tiles.length, r).toBe(b.width * b.height);
    }
  });
});
