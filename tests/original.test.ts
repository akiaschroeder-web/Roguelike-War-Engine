import { describe, expect, it } from 'vitest';
import { ABILITIES, ART_VARIANTS, BOSSES, CLASSES, COMMANDERS, ENEMIES, GEAR, ITEMS, PERMANENT_ITEMS, QUEST_ITEMS, RACES, REGION_BOSSES, ROSTERS, SKILLS, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { LEVELS, ORIGINAL_HYRULE } from '../src/content/original';
import { castAbility, enemyAutoTransform, unusableReason } from '../src/engine/abilities';
import { createBattle, startPhase } from '../src/engine/battle';
import { canReach, forecast, resolveCombat } from '../src/engine/combat';
import { keyOf, tileCost } from '../src/engine/grid';
import { useItem } from '../src/engine/items';
import { TRIALS } from '../src/engine/meta';
import { fragmentsHeld, ogAfterMove, ogMods, ogMultiplier, ogOnStrike, ogState } from '../src/engine/original';
import { originalAfterBattle, originalBossFor, originalRegionOptions } from '../src/engine/originalRun';
import { RNG } from '../src/engine/rng';
import { addStatus } from '../src/engine/status';
import { availableNodes, enterNode, finishBattle, isFreeForAll, newRun, offerRegions, startBattle, type RunWithEvent } from '../src/engine/run';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = () => new RNG(7);

function field(w = 14, h = 9, world = 'level1Eagle'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'level1Eagle', lvl, uid, rng());

const DOC_IDS = ['heroOfHyrule', 'zeldaHyrule', 'ganonHyrule', 'oldMan', 'oldWoman', 'merchantHyrule', 'goriya', 'rope', 'zol', 'gel', 'vire', 'polsVoice', 'ghini',
  'lanmola', 'patra', 'aquamentus', 'manhandla', 'digdogger', 'lesserDigdogger'];

describe('Original Hyrule content', () => {
  it('registers the pack: 3 commanders, the nine Levels and every unit in the doc (all recruitable, all with art)', () => {
    expect(COMMANDERS.filter((c) => c.campaign === 'original').map((c) => c.heroId)).toEqual(['heroOfHyrule', 'zeldaHyrule', 'ganonHyrule', 'sleepingZelda']);
    expect(Object.values(WORLDS).filter((w) => w.campaign === 'original').map((w) => w.id).slice(0, 9)).toEqual(LEVELS);
    for (const id of DOC_IDS) { expect(TEMPLATES[id], id).toBeDefined(); expect(artFor(id), id).not.toBeNull(); }
    expect(TEMPLATES.ganonBoss).toBeUndefined();
    expect(TEMPLATES.dodongoBoss).toBeUndefined();
    expect(TEMPLATES.heroOfHyrule.stats).toEqual({ hp: 28, str: 12, mag: 4, skl: 13, spd: 12, def: 8, res: 6, lck: 12, con: 9, mov: 6, sta: 28, mp: 12 });
    expect(TEMPLATES.zeldaHyrule.stats).toMatchObject({ hp: 24, mag: 22, res: 21, mp: 45 });
    expect(TEMPLATES.ganonHyrule.size).toBe(2);
    expect(TEMPLATES.patra.stats).toMatchObject({ hp: 55, mag: 19, mov: 7, mp: 40 });
    expect(TEMPLATES.patra.size).toBe(3);
    expect(TEMPLATES.digdogger.stats).toMatchObject({ hp: 85, str: 22, def: 20, con: 38 });
    expect(TEMPLATES.digdogger.size).toBe(4);
    expect(TEMPLATES.lesserDigdogger.stats).toMatchObject({ hp: 20, spd: 14, mov: 7 });
    expect(artFor('heroOfHyrule')).toBe('link1');
    expect(artFor('lesserDigdogger')).toBe('digdogger');
    for (const [id, alt] of [['dodongo', 'dodongo1'], ['queenGohma', 'gohma1'], ['octorok', 'octorok1'], ['moldorm', 'moldorm1'], ['darknut', 'darknut1'], ['tektite', 'tektite1'], ['gleeokFlame', 'gleeok1'], ['lynel', 'lynel1']])
      expect(ART_VARIANTS[id]).toContain(alt);
    expect(TRIALS.some((t) => t.id === 'secondQuest')).toBe(true);
    expect(QUEST_ITEMS.wisdomFragment).toBeDefined();
  });

  it('only references things that exist', () => {
    const missing: string[] = [];
    const known = (id: string) => !!(WEAPONS[id] || GEAR[id] || ITEMS[id]);
    for (const t of [...ORIGINAL_HYRULE.templates, ...ORIGINAL_HYRULE.enemies, ...ORIGINAL_HYRULE.bosses]) {
      if (!RACES[t.race]) missing.push(`race ${t.race} (${t.id})`);
      if (!CLASSES[t.classId]) missing.push(`class ${t.classId} (${t.id})`);
      for (const w of t.weapons) if (!WEAPONS[w]) missing.push(`weapon ${w} (${t.id})`);
      if (t.skill && !SKILLS[t.skill]) missing.push(`skill ${t.skill} (${t.id})`);
      for (const s of ('extraSkills' in t ? t.extraSkills ?? [] : [])) if (!SKILLS[s]) missing.push(`skill ${s} (${t.id})`);
      for (const a of ('abilities' in t ? t.abilities ?? [] : [])) if (!ABILITIES[a]) missing.push(`ability ${a} (${t.id})`);
      const home = (t as { home?: string }).home;
      if (home && !WORLDS[home]) missing.push(`home ${home} (${t.id})`);
    }
    for (const b of ORIGINAL_HYRULE.bosses) for (const d of b.drops ?? []) if (!known(d)) missing.push(`drop ${d} (${b.id})`);
    for (const [r, ids] of Object.entries(ORIGINAL_HYRULE.rosters)) for (const id of ids) if (!ENEMIES[id]) missing.push(`roster ${r}: ${id}`);
    for (const [r, ids] of Object.entries(ORIGINAL_HYRULE.regionBosses)) { if (!ROSTERS[r]?.length) missing.push(`no roster ${r}`); for (const id of ids) if (!BOSSES[id]) missing.push(`boss ${id}`); }
    expect(Object.keys(REGION_BOSSES)).toEqual(expect.arrayContaining(LEVELS));
    for (const c of ORIGINAL_HYRULE.commanders) {
      for (const u of [c.heroId, ...c.units]) if (!TEMPLATES[u]) missing.push(`commander unit ${u}`);
      for (const i of c.startingItems ?? []) if (!known(i)) missing.push(`starting item ${i}`);
    }
    for (const f of ORIGINAL_HYRULE.factions) for (const u of [...f.units, ...f.leaders]) if (!TEMPLATES[u]) missing.push(`faction ${f.id}: ${u}`);
    for (const ev of ORIGINAL_HYRULE.events ?? []) {
      if (ev.art && !artFor(ev.art)) missing.push(`event art ${ev.art}`);
      for (const ch of ev.choices) for (const o of [ch.outcome, ch.gamble?.win, ch.gamble?.lose]) for (const e of o?.effects ?? []) {
        if (e.kind === 'loot') for (const i of e.ids) if (!known(i) && !PERMANENT_ITEMS[i]) missing.push(`event ${ev.id} loot ${i}`);
        if (e.kind === 'recruit') for (const i of e.pool) if (!TEMPLATES[i]) missing.push(`event ${ev.id} recruit ${i}`);
      }
    }
    for (const a of ORIGINAL_HYRULE.abilities) for (const t of a.grantedBy?.templates ?? []) if (!TEMPLATES[t]) missing.push(`ability ${a.id} template ${t}`);
    expect(missing).toEqual([]);
  });
});

describe('Link, Zelda and Ganon', () => {
  it('Sword Beam: at full HP a sword reaches 3 spaces (4 with the Magical Sword)', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 2, 4);
    const sword = WEAPONS.kokiriSword;
    expect(canReach(sword, 3, link)).toBe(true);
    expect(canReach(sword, 4, link)).toBe(false);
    expect(canReach(WEAPONS.magicalSword, 4, link)).toBe(true);
    link.hp -= 1;
    expect(canReach(sword, 2, link)).toBe(false);
    // Anyone with the White Sword can beam.
    const soldier = place(b, hero('hyruleSoldier'), 5, 5);
    expect(canReach(WEAPONS.whiteSword, 3, soldier)).toBe(true);
    expect(canReach(WEAPONS.kokiriSword, 3, soldier)).toBe(false);
  });

  it("It's Dangerous to Go Alone: +2 STR/DEF/SKL with no ally within 3", () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 2, 4);
    const e = place(b, foe('gel'), 3, 4, 'enemy');
    expect(ogMods(b, link, link, e, true)).toMatchObject({ str: 2, def: 2, skl: 2 });
    place(b, hero('oldMan'), 2, 6);
    expect(ogMods(b, link, link, e, true).str).toBe(0);
  });

  it("Zelda's Scattered Wisdom grows with every fragment; the whole Triforce counts as eight", () => {
    const b = field();
    const z = place(b, hero('zeldaHyrule'), 2, 4);
    const e = place(b, foe('gel'), 3, 4, 'enemy');
    b.owned = ['wisdomFragment', 'wisdomFragment', 'wisdomFragment'];
    expect(ogMods(b, z, z, e, true)).toMatchObject({ mag: 3, res: 3 });
    b.owned = ['fullTriforce'];
    expect(fragmentsHeld(b)).toBe(8);
  });

  it('Ganon vanishes at the start of his phase; sacred light reveals him and Silver Arrows pin him for 3 turns', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    const ganon = place(b, makeEnemy(BOSSES.ganonBoss, 'level9DeathMountain', 5, 'g', rng()), 8, 4, 'enemy');
    startPhase(b, 'enemy');
    expect(ganon.hidden).toBe(true);
    // Light of Wisdom
    const z = place(b, hero('zeldaHyrule'), 4, 3);
    b.phase = 'player';
    expect(castAbility(b, z, 'lightOfWisdom', rng())).not.toBeNull();
    expect(ganon.hidden).toBe(false);
    // Silver Arrows: double damage to the demon, and he can't vanish.
    link.weapons = ['fairyBow'];
    link.x = 6;
    const plain = forecast(b, link, link, ganon, 'fairyBow').attacker.dmg;
    link.pack.push({ id: 'silverArrow', uses: 2 });
    expect(useItem(b, link, link.pack.findIndex((p) => p.id === 'silverArrow'), rng())).not.toBeNull();
    expect(forecast(b, link, link, ganon, 'fairyBow').attacker.dmg).toBeGreaterThanOrEqual(plain * 2 - 1);
    ganon.buffs = ganon.buffs.filter((x) => x.id !== 'wisdomLit');
    for (let i = 0; i < 20 && !ganon.buffs.some((x) => x.id === 'silverSealed'); i++) resolveCombat(b, link, ganon, new RNG(i), 'fairyBow');
    expect(ganon.buffs.some((x) => x.id === 'silverSealed')).toBe(true);
    startPhase(b, 'enemy');
    expect(ganon.hidden).toBeFalsy();
  });

  it("Triforce's Courage: immune to Fear and Confusion", () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    addStatus(link, 'fear', 2);
    expect(castAbility(b, link, 'triforcesCourage', rng())).not.toBeNull();
    expect(link.statuses.some((s) => s.kind === 'fear')).toBe(false);
    addStatus(link, 'confuse', 2);
    expect(link.statuses.some((s) => s.kind === 'confuse')).toBe(false);
  });

  it('Quick Item: the first item of the battle is free', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    link.hp -= 10;
    link.pack.push({ id: 'blueLifeMedicine', uses: 1 }, { id: 'redLifeMedicine', uses: 2 });
    expect(useItem(b, link, 0, rng())?.free).toBe(true);
    link.hp -= 10;
    expect(useItem(b, link, 0, rng())?.free).toBeFalsy();
  });
});

describe('the monsters', () => {
  it('Zols split into Gels on a weak finishing blow; Vires burst into Keese', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule', 'l', 1), 3, 4);
    link.hp -= 1; // no beams, plain swordsmanship
    const zol = place(b, foe('zol'), 4, 4, 'enemy');
    zol.hp = 2;
    for (let i = 0; i < 20 && b.units.includes(zol); i++) resolveCombat(b, link, zol, new RNG(i), 'kokiriSword');
    expect(b.units.includes(zol)).toBe(false);
    expect(b.units.filter((u) => u.artId === 'gel' && u.summoned).length).toBe(2);
    const vire = place(b, foe('vire'), 3, 7, 'enemy');
    link.x = 3; link.y = 6;
    vire.hp = 1;
    for (let i = 0; i < 20 && b.units.includes(vire); i++) resolveCombat(b, link, vire, new RNG(i), 'kokiriSword');
    expect(b.units.filter((u) => u.artId === 'keese' && u.summoned).length).toBe(2);
  });

  it('Pols Voice: double damage from arrows, half from ordinary melee', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    const pv = place(b, foe('polsVoice'), 4, 4, 'enemy');
    expect(ogMultiplier(b, link, pv, false, WEAPONS.fairyBow, 3)).toBe(2);
    expect(ogMultiplier(b, link, pv, false, WEAPONS.kokiriSword, 1)).toBe(0.5);
  });

  it("Patra's eyes intercept blows; Lanmola's segments absorb them", () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 1, 1);
    const patra = place(b, foe('patra'), 6, 3, 'enemy');
    const lan = place(b, foe('lanmola'), 2, 6, 'enemy');
    startPhase(b, 'enemy');
    patra.ogEyes = 8;
    lan.ogSegments = 3;
    expect(ogOnStrike(b, link, patra, 20).dmg).toBe(5);
    expect(patra.ogEyes).toBe(6);
    expect(ogOnStrike(b, link, lan, 10).dmg).toBe(4);
    expect(lan.ogSegments).toBe(2);
  });

  it("Manhandla: one head per blow, and each lost head speeds it up", () => {
    const b = field(16, 10);
    const link = place(b, hero('heroOfHyrule', 'l', 20), 3, 4);
    const m = place(b, makeEnemy(BOSSES.manhandla, 'level3Manji', 3, 'm', rng()), 4, 3, 'enemy');
    const q = m.stats.hp / 4;
    expect(ogOnStrike(b, link, m, 999).dmg).toBe(m.hp - Math.floor(3 * q + 1e-9));
    const spd = m.stats.spd;
    for (let i = 0; i < 30 && !(m.ogHeads ?? 0); i++) resolveCombat(b, link, m, new RNG(i));
    expect(m.ogHeads).toBeGreaterThanOrEqual(1);
    expect(m.buffs.find((x) => x.id === 'frenzy')?.stats).toMatchObject({ spd: 2 * m.ogHeads!, mov: m.ogHeads });
    expect(m.stats.spd).toBe(spd);
  });

  it('Digdogger: its shell halves damage until the Recorder shrinks it; it fragments into Lesser Digdoggers', () => {
    const b = field(18, 12);
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    const d = place(b, makeEnemy(BOSSES.digdogger, 'level5Lizard', 3, 'd', rng()), 6, 3, 'enemy');
    expect(ogMultiplier(b, link, d, false, WEAPONS.kokiriSword, 1)).toBe(0.5);
    link.gear.acc1 = 'recorder';
    expect(castAbility(b, link, 'playRecorder', rng(), undefined, { x: 3, y: 4 })).not.toBeNull();
    expect(d.ogShrunk).toBe(true);
    expect(ogMultiplier(b, link, d, false, WEAPONS.kokiriSword, 1)).toBe(1.5);
    expect(enemyAutoTransform(b, d, rng())).not.toBeNull();
    expect(b.units.filter((u) => u.artId === 'lesserDigdogger').length).toBe(2);
  });

  it('Ghinis call more Ghinis from the graves', () => {
    const b = field();
    b.turn = 2;
    const g = place(b, foe('ghini'), 6, 4, 'enemy');
    b.tiles[keyOf(b, 7, 4)] = 'gravestone';
    place(b, hero('heroOfHyrule'), 1, 1);
    startPhase(b, 'enemy');
    expect(b.units.filter((u) => u.artId === 'ghini' && u.summoned).length).toBe(1);
    void g;
  });
});

describe('equipment and spaces', () => {
  it("rings don't stack: the Red Ring halves, the Blue Ring cuts a quarter", () => {
    const b = field();
    const e = place(b, foe('goriya'), 4, 4, 'enemy');
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    link.gear.acc1 = 'blueRing';
    expect(ogMultiplier(b, e, link, false, WEAPONS.goriyaBoomerang, 1)).toBe(0.75);
    link.gear.acc2 = 'redRing';
    expect(ogMultiplier(b, e, link, false, WEAPONS.goriyaBoomerang, 1)).toBe(0.5);
  });

  it('the Magical Clock stops ordinary enemies; bosses keep going', () => {
    const b = field(16, 10);
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    const gel = place(b, foe('gel'), 8, 4, 'enemy');
    const aq = place(b, makeEnemy(BOSSES.aquamentus, 'level1Eagle', 3, 'aq', rng()), 10, 2, 'enemy');
    aq.isBoss = true;
    link.pack.push({ id: 'magicalClock', uses: 1 });
    useItem(b, link, 0, rng());
    startPhase(b, 'enemy');
    expect(gel.acted).toBe(true);
    expect(aq.acted).toBe(false);
  });

  it('candles burn bushes (secrets underneath), push blocks open shutters, keys open doors', () => {
    const b = field();
    ogState(b).secrets = [keyOf(b, 4, 4)];
    b.tiles[keyOf(b, 4, 4)] = 'burnableBush';
    b.tiles[keyOf(b, 6, 6)] = 'shutterDoor';
    b.tiles[keyOf(b, 3, 5)] = 'pushBlock';
    b.tiles[keyOf(b, 2, 4)] = 'lockedDoor';
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    link.gear.acc1 = 'blueCandle';
    expect(castAbility(b, link, 'candleFire', rng(), undefined, { x: 4, y: 4 })).not.toBeNull();
    expect(b.tiles[keyOf(b, 4, 4)]).toBe('hiddenStairs');
    expect(unusableReason(b, link, ABILITIES.candleFire)).toMatch(/once per battle/);
    expect(castAbility(b, link, 'pushBlockOH', rng())).not.toBeNull();
    expect(b.tiles[keyOf(b, 3, 6)]).toBe('pushBlock');
    expect(b.tiles[keyOf(b, 6, 6)]).toBe('plain');
    expect(unusableReason(b, link, ABILITIES.openLockedDoor)).toMatch(/Small Key/);
    link.pack.push({ id: 'smallKey', uses: 1 });
    expect(castAbility(b, link, 'openLockedDoor', rng())).not.toBeNull();
    expect(b.tiles[keyOf(b, 2, 4)]).toBe('plain');
    expect(link.pack.some((p) => p.id === 'smallKey')).toBe(false);
    // Down the staircase: treasure.
    link.x = 4; link.y = 4;
    expect(ogAfterMove(b, link)).toMatch(/staircase/);
    expect(b.loot?.length).toBe(1);
  });

  it('blade traps slide at whoever steps into their lane; ladders and rafts cross gaps and water', () => {
    const b = field();
    b.tiles[keyOf(b, 8, 4)] = 'bladeTrap';
    const link = place(b, hero('heroOfHyrule'), 5, 4);
    const hp = link.hp;
    expect(ogAfterMove(b, link)).toMatch(/Blade Trap/);
    expect(link.hp).toBe(hp - 5);
    expect(tileCost(b, link, 'ladderGap')).toBeGreaterThan(50);
    link.gear.acc1 = 'stepladder';
    expect(tileCost(b, link, 'ladderGap')).toBe(1);
    link.gear.acc1 = 'raft';
    expect(tileCost(b, link, 'water')).toBe(2);
  });

  it('the Levels are decorated with secrets and spaces; the Second Quest fields more enemies', () => {
    const run = newRun(3, 'ganonHyrule') as RunWithEvent; // no Old Man: his advice would reveal the secrets
    const b1 = createBattle({ world: 'level1Eagle', nodeType: 'battle', depth: 4, roster: run.roster, seed: 11 });
    expect(b1.og?.secrets.length).toBeGreaterThanOrEqual(2);
    expect(b1.tiles.some((t) => ['burnableBush', 'pushBlock', 'secretCave', 'lockedDoor', 'boulder', 'bladeTrap', 'shutterDoor'].includes(t))).toBe(true);
    const b2 = createBattle({ world: 'level1Eagle', nodeType: 'battle', depth: 4, roster: run.roster, seed: 11, trials: ['secondQuest'] });
    expect(b2.secondQuest).toBe(true);
    expect(b2.units.filter((u) => u.team === 'enemy').length).toBe(b1.units.filter((u) => u.team === 'enemy').length + 1);
    expect(b2.og!.secrets.length).toBeGreaterThan(b1.og!.secrets.length - 1);
  });
});

describe('Original Hyrule campaign', () => {
  it('starts in Level 1 and plays its first battle', () => {
    for (const c of COMMANDERS.filter((x) => x.campaign === 'original')) {
      const run = newRun(21, c.heroId) as RunWithEvent;
      expect(run.campaign).toBe('original');
      expect(run.region).toBe(c.heroId === 'sleepingZelda' ? 'northCastle' : 'level1Eagle');
      expect(run.roster.map((u) => u.templateId)).toEqual([c.heroId, ...c.units]);
    }
    const run = newRun(22, 'zeldaHyrule') as RunWithEvent;
    const node = availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    expect(run.battle?.world).toBe('level1Eagle');
    run.battle!.result = 'won';
    expect(finishBattle(run).won).toBe(true);
  });

  it('each Level has its boss; the Second Quest moves them; the Gleeok has a stand-in until it exists', () => {
    const run = newRun(23, 'heroOfHyrule') as RunWithEvent;
    const boss = run.map.nodes.find((n) => n.type === 'boss')!;
    expect(originalBossFor(run, boss)?.id).toBe('aquamentus');
    expect(originalBossFor(run, { ...boss, world: 'level9DeathMountain' })?.id).toBe('ganonBoss');
    expect(originalBossFor(run, { ...boss, world: 'level4Snake' })?.id).toBe(BOSSES.gleeokFlame ? 'gleeokFlame' : 'volvagia');
    run.trials = ['secondQuest'];
    expect(originalBossFor(run, boss)?.id).toBe('dodongoBoss');
  });

  it('boss fragments build the Triforce of Wisdom, which opens Death Mountain', () => {
    const run = newRun(24, 'zeldaHyrule') as RunWithEvent;
    run.currentNodeId = run.map.nodes.find((n) => n.type === 'boss')!.id;
    offerRegions(run);
    expect(run.event).toEqual({ type: 'region', options: ['level2Moon'] });
    for (const lvl of LEVELS.slice(0, 8)) {
      const b = createBattle({ world: lvl, nodeType: 'boss', depth: 3, roster: run.roster.slice(0, 1), seed: 3 });
      originalAfterBattle(run, b, true, rng());
    }
    expect(run.questItems?.filter((x) => x === 'wisdomFragment').length).toBe(8);
    expect(run.questItems).toContain('fullTriforce');
    expect(run.convoy).toContain('triforceWisdom');
    run.region = 'level8Lion';
    expect(originalRegionOptions(run)).toEqual(['level9DeathMountain']);
    run.questItems = run.questItems!.filter((x) => x !== 'fullTriforce');
    run.original!.fragments = run.original!.fragments.filter((l) => l !== 'level3Manji');
    expect(originalRegionOptions(run)).toEqual(['level3Manji']);
    // The Levels stay themselves: no Free-for-All until Death Mountain is done.
    run.act = 6;
    expect(isFreeForAll(run)).toBe(false);
  });
});
