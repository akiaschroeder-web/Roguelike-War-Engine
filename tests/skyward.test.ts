import { describe, expect, it } from 'vitest';
import { ABILITIES, ART_VARIANTS, BOSSES, CLASSES, COMMANDERS, ENEMIES, EVENTS, GEAR, ITEMS, QUEST_ITEMS, RACES, REGION_BOSSES, ROSTERS, SKILLS, TEMPLATE_LIST, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { SKYWARD_SWORD, RECIPES } from '../src/content/skyward';
import { GROUP_SUPPORTS } from '../src/content/supports';
import { castAbility, enemyAutoTransform, unusableReason } from '../src/engine/abilities';
import { checkResult, createBattle, startPhase } from '../src/engine/battle';
import { forecast, resolveCombat } from '../src/engine/combat';
import { computeMoves, keyOf } from '../src/engine/grid';
import { useItem } from '../src/engine/items';
import { RNG } from '../src/engine/rng';
import { chooseEvent, availableNodes, enterNode, finishBattle, newRun, offerRegions, startBattle, type RunWithEvent } from '../src/engine/run';
import { axisOf, inTimeshift, skywardInfo, ssAfterMove, ssMods, ssOnBlock, shieldDurability, toggleTimeshift } from '../src/engine/skyward';
import { craft, recipeCost, skywardQuestCheck } from '../src/engine/skywardRun';
import { activeGroups, specialSupportMods, supportDamageMult } from '../src/engine/supports';
import { activeGear, effectiveStats, makeEnemy, makeHero, moveTypeOf, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = () => new RNG(7);

function field(w = 14, h = 9, world = 'faronWoodsSS'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'faronWoodsSS', lvl, uid, rng());

const DOC_IDS = ['heroOfTheSky', 'zeldaSS', 'fi', 'groose', 'impaSS', 'ghirahim', 'ghirahimTrue', 'demise',
  'gaepora', 'fledge', 'pipit', 'karane', 'batreaux', 'gondo', 'scrapper', 'skipper', 'bucha', 'gorko', 'moldini', 'levias', 'faronDragon', 'eldinDragon', 'lanayruDragon', 'hylia',
  'technoblin', 'cursedBokoblin', 'ironShieldMoblin', 'quadroBaba', 'furnix', 'pyrup', 'froak', 'ampilus', 'ampilusEgg', 'aracha', 'magmanos', 'sentrobe', 'beamos', 'watcher', 'earthGuardian', 'skyGuardian', 'remlit',
  'scaldera', 'moldarach', 'koloktos', 'tentalus', 'bilocyte', 'imprisoned', 'imprisonedArmed', 'imprisonedFlying', 'stalmaster', 'scervo', 'dreadfuse', 'darkLizalfos',
  'skyLoftwing', 'crimsonLoftwing'];

describe('Skyward Sword content', () => {
  it('registers the pack: 5 commanders, 11 regions and every unit in the doc (all recruitable)', () => {
    expect(COMMANDERS.filter((c) => c.campaign === 'skyward').map((c) => c.heroId)).toEqual(['heroOfTheSky', 'zeldaSS', 'groose', 'ghirahim', 'demise']);
    expect(Object.values(WORLDS).filter((w) => w.campaign === 'skyward').length).toBe(11);
    for (const id of DOC_IDS) expect(TEMPLATES[id], id).toBeDefined();
    expect(TEMPLATES.ghirahimBoss).toBeUndefined();
    expect(TEMPLATES.demiseBoss).toBeUndefined();
    expect(TEMPLATE_LIST.filter((t) => t.id === 'beamos').length).toBe(1);
    expect(TEMPLATES.beamos.stats).toMatchObject({ hp: 40, mag: 16, def: 17, mov: 0, mp: 30 });
    expect(TEMPLATES.heroOfTheSky.stats).toMatchObject({ hp: 27, str: 10, mag: 5, skl: 12, spd: 11, def: 7, res: 6, lck: 10, con: 9, mov: 5, sta: 28, mp: 10 });
    expect(TEMPLATES.demise.size).toBe(2);
    expect(TEMPLATES.levias.size).toBe(5);
    expect(BOSSES.koloktos.stats.hp).toBe(80);
    expect(TEMPLATES.ghirahim.exclusiveWith).toContain('ghirahimTrue');
    expect(TEMPLATES.imprisoned.exclusiveWith).toEqual(expect.arrayContaining(['imprisonedArmed', 'imprisonedFlying']));
  });

  it('only references things that exist', () => {
    const missing: string[] = [];
    const known = (id: string) => !!(WEAPONS[id] || GEAR[id] || ITEMS[id]);
    for (const t of [...SKYWARD_SWORD.templates, ...SKYWARD_SWORD.enemies, ...SKYWARD_SWORD.bosses]) {
      if (!RACES[t.race]) missing.push(`race ${t.race} (${t.id})`);
      if (!CLASSES[t.classId]) missing.push(`class ${t.classId} (${t.id})`);
      for (const w of t.weapons) if (!WEAPONS[w]) missing.push(`weapon ${w} (${t.id})`);
      if (t.skill && !SKILLS[t.skill]) missing.push(`skill ${t.skill} (${t.id})`);
      for (const a of ('abilities' in t ? t.abilities ?? [] : [])) if (!ABILITIES[a]) missing.push(`ability ${a} (${t.id})`);
      const home = (t as { home?: string }).home;
      if (home && !WORLDS[home]) missing.push(`home ${home} (${t.id})`);
    }
    for (const b of SKYWARD_SWORD.bosses) for (const d of b.drops ?? []) if (!known(d)) missing.push(`drop ${d} (${b.id})`);
    for (const [r, ids] of Object.entries(SKYWARD_SWORD.rosters)) for (const id of ids) if (!ENEMIES[id]) missing.push(`roster ${r}: ${id}`);
    for (const [r, ids] of Object.entries(SKYWARD_SWORD.regionBosses)) { if (!ROSTERS[r]?.length) missing.push(`no roster ${r}`); for (const id of ids) if (!BOSSES[id]) missing.push(`boss ${id}`); }
    expect(Object.keys(REGION_BOSSES)).toEqual(expect.arrayContaining(SKYWARD_SWORD.regions.map((r) => r.id)));
    for (const c of SKYWARD_SWORD.commanders) {
      for (const u of [c.heroId, ...c.units]) if (!TEMPLATES[u]) missing.push(`commander unit ${u}`);
      for (const i of c.startingItems ?? []) if (!known(i)) missing.push(`starting item ${i}`);
    }
    for (const f of SKYWARD_SWORD.factions) for (const u of [...f.units, ...f.leaders]) if (!TEMPLATES[u]) missing.push(`faction ${f.id}: ${u}`);
    for (const ev of SKYWARD_SWORD.events ?? []) {
      if (ev.art && !artFor(ev.art)) missing.push(`event art ${ev.art}`);
      for (const r of ev.regions ?? []) if (!WORLDS[r]) missing.push(`event region ${r}`);
      for (const ch of ev.choices) for (const o of [ch.outcome, ch.gamble?.win, ch.gamble?.lose].filter(Boolean)) for (const e of o!.effects) {
        if (e.kind === 'loot') for (const i of e.ids) if (!known(i)) missing.push(`event ${ev.id} loot ${i}`);
        if (e.kind === 'recruit') for (const i of e.pool) if (!TEMPLATES[i]) missing.push(`event ${ev.id} recruit ${i}`);
        if (e.kind === 'quest' && !QUEST_ITEMS[e.id]) missing.push(`event ${ev.id} quest ${e.id}`);
      }
    }
    for (const r of RECIPES) {
      if (!known(r.from)) missing.push(`recipe from ${r.from}`);
      if (!known(r.to)) missing.push(`recipe to ${r.to}`);
      for (const m of [...Object.keys(r.mats), ...(r.sacred ?? [])]) if (!QUEST_ITEMS[m]) missing.push(`recipe material ${m}`);
    }
    for (const g of GROUP_SUPPORTS) for (const m of g.members) if (!TEMPLATES[m]) missing.push(`group ${g.id}: ${m}`);
    for (const a of SKYWARD_SWORD.abilities) for (const w of a.grantedBy?.weapons ?? []) if (!WEAPONS[w]) missing.push(`ability ${a.id} weapon ${w}`);
    for (const a of SKYWARD_SWORD.abilities) for (const g of a.grantedBy?.gear ?? []) if (!GEAR[g]) missing.push(`ability ${a.id} gear ${g}`);
    expect(missing).toEqual([]);
    expect(EVENTS.trialGate).toBeTruthy();
  });

  it('every SS unit, monster and boss has art; alternate art is appended to the older lists', () => {
    const noArt = [...SKYWARD_SWORD.templates, ...SKYWARD_SWORD.enemies, ...SKYWARD_SWORD.bosses].filter((t) => !artFor(t.id)).map((t) => t.id);
    expect(noArt).toEqual([]);
    expect(artFor('skyLoftwing')).toBe('loftwingBlue');
    expect(artFor('crimsonLoftwing')).toBe('loftwing');
    expect(ART_VARIANTS.moblin).toEqual(['moblin', 'moblinWW', 'moblinSS']);
    expect(ART_VARIANTS.chuchuRed).toEqual(['chuchuRed', 'chuchuRedMM', 'chuchuRedTP', 'chuchuRedSS']);
    expect(ART_VARIANTS.beamos).toEqual(['beamos', 'beamosSS']);
    expect(ART_VARIANTS.stalfos).toContain('stalfosTP');
    expect(ART_VARIANTS.stalfos).toContain('stalfosSS');
  });

  it('retires the old Loftwing mount: the id still works and is now the blue Loftwing; the Crimson Loftwing has its own', () => {
    expect(GEAR.loftwing.art).toBe('loftwingBlue');
    expect(GEAR.crimsonLoftwingMount.art).toBe('loftwing');
    const u = makeHero('link', 'l', 1, rng());
    u.gear.mount = 'loftwing';
    expect(moveTypeOf(u)).toBe('flying');
    u.gear.mount = 'crimsonLoftwingMount';
    expect(effectiveStats(u).mov).toBe(TEMPLATES.link.stats.mov + 4);
  });
});

describe('Skyward Strike and stamina', () => {
  it('charges in three levels: +3/+6/+10 Might and ranges 2–3/2–5/2–6', () => {
    const b = field();
    const link = place(b, hero('heroOfTheSky', 'l', 8), 2, 4);
    link.weapons = ['goddessSword'];
    const e = place(b, foe('bokoblin', 'e1', 3), 6, 4, 'enemy');
    expect(unusableReason(b, link, ABILITIES.skywardStrike)).toMatch(/Charge/);
    expect(castAbility(b, link, 'skywardCharge', rng())).not.toBeNull();
    expect(skywardInfo(link)).toMatchObject({ level: 1, max: 3, might: 3 });
    expect(unusableReason(b, link, ABILITIES.skywardStrike)).toBe('No enemy in range'); // 4 away
    castAbility(b, link, 'skywardCharge', rng());
    expect(skywardInfo(link)).toMatchObject({ level: 2, max: 5, might: 6 });
    castAbility(b, link, 'skywardCharge', rng());
    // Level 3 and the Hero of the Sky's Chosen by the Goddess (+4).
    expect(skywardInfo(link)).toMatchObject({ level: 3, max: 6, might: 14 });
    const hp = e.hp;
    expect(castAbility(b, link, 'skywardStrike', rng(), e.uid)).not.toBeNull();
    expect(e.hp).toBeLessThan(hp);
    expect(skywardInfo(link).level).toBe(0);
    // Upgraded swords charge faster: the True Master Sword is full in one action.
    link.weapons = ['trueMasterSword'];
    castAbility(b, link, 'skywardCharge', rng());
    expect(skywardInfo(link).level).toBe(3);
    expect(skywardInfo(link).max).toBe(7);
  });

  it('Goddess Cubes in range open when the Strike is released', () => {
    const b = field();
    const link = place(b, hero('heroOfTheSky', 'l', 8), 2, 4);
    link.weapons = ['goddessWhiteSword'];
    const e = place(b, foe('bokoblin', 'e1'), 5, 4, 'enemy');
    b.tiles[keyOf(b, 4, 6)] = 'goddessCube';
    castAbility(b, link, 'skywardCharge', rng());
    castAbility(b, link, 'skywardStrike', rng(), e.uid);
    expect(b.tiles[keyOf(b, 4, 6)]).toBe('plain');
    expect(b.loot?.length).toBeGreaterThan(0);
  });

  it('Dash spends stamina for movement; Stamina Potion+ makes it free', () => {
    const b = field();
    const pipit = place(b, hero('pipit'), 2, 4);
    const mov = effectiveStats(pipit).mov;
    const sta = pipit.sta;
    expect(castAbility(b, pipit, 'dash', rng())?.free).toBe(true);
    expect(pipit.sta).toBe(sta - 4);
    expect(effectiveStats(pipit).mov).toBe(mov + 3);
    pipit.buffs = [];
    pipit.pack = [{ id: 'staminaPotionPlus', uses: 1 }];
    useItem(b, pipit, 0, rng());
    const before = pipit.sta;
    castAbility(b, pipit, 'dash', rng());
    expect(pipit.sta).toBe(before);
  });
});

describe('Timeshift, directional guards and battlefield spaces', () => {
  it('a Timeshift Stone brings back the past: waterways flow, robots wake, ancient units harden', () => {
    const b = field(14, 9, 'lanayruDesert');
    b.tiles[keyOf(b, 6, 4)] = 'timeshiftStone';
    b.tiles[keyOf(b, 7, 6)] = 'driedWaterway';
    const link = place(b, hero('heroOfTheSky'), 5, 4);
    const robot = place(b, hero('scrapper', 's'), 8, 4);
    const tb = place(b, foe('technoblin', 't1'), 7, 2, 'enemy');
    tb.ssDormant = true;
    startPhase(b, 'enemy');
    expect(tb.acted).toBe(true); // dormant in the present
    const before = ssMods(b, robot, robot, tb, false).def;
    expect(castAbility(b, link, 'strikeTimeshiftStone', rng())).not.toBeNull();
    expect(inTimeshift(b, robot)).toBe(true);
    expect(b.tiles[keyOf(b, 7, 6)]).toBe('water');
    expect(tb.ssDormant).toBe(false);
    expect(ssMods(b, robot, robot, tb, false).def).toBe(before + 3);
    // Strike it again: back to the present.
    castAbility(b, link, 'strikeTimeshiftStone', rng());
    expect(b.tiles[keyOf(b, 7, 6)]).toBe('driedWaterway');
    expect(toggleTimeshift(b, { x: 3, y: 3 }, 2, 3)).toBe('on');
  });

  it('Quadro Babas are only open on one side, and switch after attacking', () => {
    const b = field();
    const q = place(b, foe('quadroBaba', 'q', 3), 6, 4, 'enemy');
    q.ssGuard = 'h';
    const left = place(b, hero('pipit', 'p1', 6), 5, 4);
    const above = place(b, hero('karane', 'p2', 6), 6, 3);
    expect(axisOf(left, q)).toBe('h');
    expect(axisOf(above, q)).toBe('v');
    const open = forecast(b, left, left, q).attacker.dmg;
    const shut = forecast(b, above, above, q).attacker.dmg;
    expect(open).toBeGreaterThan(shut);
    for (let i = 0; i < 8 && q.ssGuard === 'h'; i++) resolveCombat(b, q, left, new RNG(i));
    expect(q.ssGuard).toBe('v');
  });

  it('Stalmaster guards the side it faces; flanking gets through', () => {
    const b = field();
    const st = place(b, foe('stalmaster', 'sm', 5), 6, 4, 'enemy');
    const front = place(b, hero('pipit', 'p1', 8), 5, 4);
    startPhase(b, 'enemy');
    expect(st.ssGuard).toBe('h');
    const side = place(b, hero('pipit', 'p2', 8), 6, 6);
    expect(forecast(b, side, side, st).attacker.dmg).toBeGreaterThan(forecast(b, front, front, st).attacker.dmg);
  });

  it('only flyers cross the open sky; Sailcloth glides from a Sky Island Edge', () => {
    const b = field(12, 8, 'theSky');
    for (let y = 0; y < 8; y++) b.tiles[keyOf(b, 5, y)] = 'water';
    const zora = place(b, hero('ruto'), 4, 3);
    expect(computeMoves(b, zora).reach.has(keyOf(b, 5, 3))).toBe(false);
    const lw = place(b, hero('skyLoftwing'), 1, 1);
    expect(computeMoves(b, lw).reach.has(keyOf(b, 5, 1))).toBe(true);
    const link = place(b, hero('heroOfTheSky'), 4, 6);
    link.gear.acc1 = 'sailcloth';
    b.tiles[keyOf(b, 4, 6)] = 'skyIslandEdge';
    startPhase(b, 'player');
    expect(moveTypeOf(link)).toBe('flying');
  });
});

describe('the Silent Realm', () => {
  it('is a trial: no fighting, gather Sacred Tears, a Guardian\'s touch ends it in a retreat', () => {
    const run = newRun(3, 'heroOfTheSky') as RunWithEvent;
    const b = createBattle({ world: 'skyloft', nodeType: 'battle', depth: 2, roster: run.roster.slice(0, 2), seed: 9, silentRealm: 'skyloft' });
    expect(b.objective.type).toBe('trial');
    expect(b.units.filter((u) => u.team === 'enemy').every((u) => ['watcher', 'earthGuardian', 'skyGuardian'].includes(u.artId ?? ''))).toBe(true);
    const link = b.units.find((u) => u.templateId === 'heroOfTheSky')!;
    const g = b.units.find((u) => u.artId === 'earthGuardian')!;
    expect(forecast(b, link, link, g).attacker.canAttack).toBe(false);
    expect(unusableReason(b, link, ABILITIES.skywardCharge)).toMatch(/Silent Realm/);
    // Gather the tears.
    const tears = b.tiles.map((t, i) => (t === 'sacredTear' ? i : -1)).filter((i) => i >= 0);
    for (const k of b.ss!.trial!.hidden) b.tiles[k] = 'sacredTear';
    const all = b.tiles.map((t, i) => (t === 'sacredTear' ? i : -1)).filter((i) => i >= 0);
    expect(all.length).toBeGreaterThan(tears.length);
    for (const k of all) { link.x = k % b.width; link.y = Math.floor(k / b.width); ssAfterMove(b, link); }
    expect(checkResult(b)).toBe('won');
  });

  it('a Guardian that catches you fails the trial without hurting anyone', () => {
    const run = newRun(4, 'zeldaSS') as RunWithEvent;
    const b = createBattle({ world: 'faronWoodsSS', nodeType: 'battle', depth: 2, roster: run.roster.slice(0, 1), seed: 5, silentRealm: 'faronWoodsSS' });
    const z = b.units.find((u) => u.team === 'player')!;
    const g = b.units.find((u) => u.artId === 'earthGuardian')!;
    g.x = z.x + 1; g.y = z.y;
    const hp = z.hp;
    for (let i = 0; i < 10 && !b.result; i++) resolveCombat(b, g, z, new RNG(i));
    expect(b.result).toBe('lost');
    expect(b.retreat).toBe(true);
    expect(z.hp).toBe(hp);
  });

  it('the Trial Gate event queues a trial for the next battle', () => {
    const run = newRun(5, 'heroOfTheSky') as RunWithEvent;
    run.event = { type: 'event', eventId: 'trialGate' };
    chooseEvent(run, 0);
    expect(run.skyward?.trialPending).toBeTruthy();
    const node = availableNodes(run).find((n) => n.type === 'battle')!;
    enterNode(run, node.id);
    if ((run.event as RunWithEvent['event'])?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    expect(run.battle?.objective.type).toBe('trial');
    expect(run.battle!.units.filter((u) => u.team === 'player').length).toBeLessThanOrEqual(3);
    run.battle!.result = 'won';
    run.battle!.ss!.trial!.got = 5;
    const sum = finishBattle(run);
    expect(sum.skyward?.some((l) => /Trial passed/.test(l))).toBe(true);
    expect(run.skyward?.trialPending).toBeUndefined();
    expect(run.questItems).toContain('stoneOfTrials');
  });
});

describe('shields, medals and crafting', () => {
  it('blocking wears a shield down until it breaks; sacred shields mend', () => {
    const b = field();
    const z = place(b, hero('zeldaSS'), 2, 2);
    z.gear.shield = 'sacredShield';
    expect(shieldDurability(z)).toEqual({ left: 25, max: 25 });
    ssOnBlock(b, z, 10, undefined);
    expect(shieldDurability(z)!.left).toBe(15);
    startPhase(b, 'player');
    expect(shieldDurability(z)!.left).toBe(20);
    ssOnBlock(b, z, 30, undefined);
    expect(z.gear.shield).toBeUndefined();
    // Wooden shields resist lightning; iron conducts it.
    const p = place(b, hero('pipit'), 6, 2);
    const t = place(b, foe('technoblin', 't', 5), 7, 2, 'enemy');
    p.gear.shield = 'bandedShield';
    const wood = forecast(b, t, t, p).attacker.dmg;
    p.gear.shield = 'ironShield';
    expect(forecast(b, t, t, p).attacker.dmg).toBeGreaterThan(wood);
  });

  it('the Cursed Medal disables the pack and shield; the Life Medal adds HP', () => {
    const u = hero('pipit');
    u.gear.shield = 'ironShield';
    u.gear.acc1 = 'cursedMedal';
    expect(activeGear(u).some((g) => g.slot === 'shield')).toBe(false);
    u.gear.acc1 = 'lifeMedal';
    expect(effectiveStats(u).hp).toBe(u.stats.hp + 10);
  });

  it('upgrades gear with materials (Gondo saves some), and the flames forge the sword', () => {
    const run = newRun(6, 'heroOfTheSky') as RunWithEvent;
    const link = run.roster[0];
    expect(link.gear.shield).toBe('woodenShieldTP');
    run.rupees = 1000;
    const r = RECIPES.find((x) => x.id === 'woodenShieldTP>bandedShield')!;
    expect(recipeCost(run, r).ok).toBe(true);
    expect(craft(run, r.id, link.uid)).toBe(true);
    expect(link.gear.shield).toBe('bandedShield');
    // Missing materials come out of the army's generic materials.
    const r2 = RECIPES.find((x) => x.id === 'bandedShield>bracedShield')!;
    const c2 = recipeCost(run, r2);
    expect(c2.generic).toBeGreaterThan(0);
    run.roster.push(hero('gondo', 'g'));
    expect(recipeCost(run, RECIPES.find((x) => x.id === 'reinforcedShield>fortifiedShield')!).mats.eldinOre).toBe(3); // 3 × 0.75 rounds up
    expect(recipeCost(run, RECIPES.find((x) => x.id === 'ironBow>sacredBow')!).mats.evilCrystal).toBe(2);
    // Farore's Flame: Goddess Sword → Goddess Longsword.
    const sword = RECIPES.find((x) => x.id === 'goddessSword>goddessLongsword')!;
    expect(recipeCost(run, sword).ok).toBe(false);
    run.questItems!.push('faroresFlame');
    expect(craft(run, sword.id, link.uid)).toBe(true);
    expect(link.weapons).toContain('goddessLongsword');
    expect(run.questItems).not.toContain('faroresFlame');
  });
});

describe('characters, forms and groups', () => {
  it('Ghirahim takes his True Form and back; the Imprisoned grows arms when hurt', () => {
    const b = field();
    const g = place(b, hero('ghirahim'), 3, 3);
    expect(castAbility(b, g, 'ghirahimTrueForm', rng())?.transformed).toBeTruthy();
    expect(g.templateId).toBe('ghirahimTrue');
    expect(castAbility(b, g, 'ghirahimSpiritForm', rng())).not.toBeNull();
    expect(g.templateId).toBe('ghirahim');
    const big = field(16, 10, 'sealedGrounds');
    const imp = place(big, makeEnemy(BOSSES.imprisoned, 'sealedGrounds', 5, 'imp', rng(), { boss: true }), 8, 2, 'enemy');
    expect(enemyAutoTransform(big, imp, rng())).toBeNull();
    imp.hp = Math.floor(imp.stats.hp * 0.5);
    expect(enemyAutoTransform(big, imp, rng())?.transformed).toBeTruthy();
    expect(imp.templateId).toBe('imprisonedArmed');
    expect(imp.isBoss).toBe(true);
  });

  it('Metallic Body shrugs off ordinary blows but not sacred light; Fi analyzes enemies', () => {
    const b = field();
    const gt = place(b, hero('ghirahimTrue', 'gt', 5), 6, 4, 'enemy');
    const pipit = place(b, hero('pipit', 'p', 8), 5, 4);
    const plain = forecast(b, pipit, pipit, gt).attacker.dmg;
    pipit.buffs.push({ id: 'sacredFlame', name: 'Sacred Flame', turns: 3 });
    expect(forecast(b, pipit, pipit, gt).attacker.dmg).toBeGreaterThan(plain);
    const fi = place(b, hero('fi'), 3, 4);
    startPhase(b, 'player');
    expect(gt.ssAnalyzed).toBe(true);
    expect(ssMods(b, pipit, pipit, gt, true).hit).toBeGreaterThanOrEqual(15);
    void fi;
  });

  it('group supports: Origins of Courage, the Ancient Dragons and the Song of the Hero', () => {
    const b = field(20, 12);
    const link = place(b, hero('heroOfTheSky'), 1, 1);
    link.weapons = ['goddessSword'];
    place(b, hero('zeldaSS'), 1, 3);
    place(b, hero('fi'), 1, 5);
    expect(activeGroups(b, 'player')).toContain('originsOfCourage');
    b.groupSupports = activeGroups(b, 'player');
    expect(specialSupportMods(b, link, link).str).toBe(4);
    const faron = place(b, hero('faronDragon'), 4, 1);
    place(b, hero('eldinDragon'), 9, 1);
    place(b, hero('lanayruDragon'), 14, 1);
    b.groupSupports = activeGroups(b, 'player');
    expect(b.groupSupports).toContain('ancientDragons');
    expect(supportDamageMult(b, faron, 'water')).toBe(1.25);
    expect(unusableReason(b, faron, ABILITIES.dragonsChorus)).toMatch(/Dragons and Levias/);
    place(b, hero('levias'), 4, 6);
    b.groupSupports = activeGroups(b, 'player');
    expect(b.groupSupports).toContain('heroesSong');
  });

  it('the Song of the Hero is learned from the three Dragons and Levias', () => {
    const run = newRun(7, 'zeldaSS') as RunWithEvent;
    run.questItems = ['songPartFaron', 'songPartEldin', 'songPartLanayru', 'songPartLevias'];
    expect(skywardQuestCheck(run).length).toBe(1);
    expect(run.questItems).toEqual(['songOfTheHeroComplete']);
    const b = field();
    const z = place(b, run.roster[0], 2, 2);
    expect(z.weapons).toContain('goddessHarp');
    expect(unusableReason(b, z, ABILITIES.songOfTheHero)).toMatch(/four parts/);
    b.owned = ['songOfTheHeroComplete'];
    expect(unusableReason(b, z, ABILITIES.songOfTheHero)).toBeNull();
  });

  it('Impa intercepts for Zelda; Demise grows stronger as he is hurt', async () => {
    const { findInterceptor } = await import('../src/engine/combat');
    const b = field();
    const z = place(b, hero('zeldaSS'), 3, 3);
    const impa = place(b, hero('impaSS'), 3, 4);
    const e = place(b, foe('pyrup', 'e'), 5, 3, 'enemy');
    expect(findInterceptor(b, e, z)).toBe(impa);
    const d = place(b, hero('demise', 'd', 5), 8, 2);
    const full = ssMods(b, d, d, e, true).str;
    d.hp = Math.floor(d.stats.hp * 0.4);
    expect(ssMods(b, d, d, e, true).str).toBe(full + 4);
  });
});

describe('Skyward Sword campaign', () => {
  it('starts each commander in Skyloft with their army; the Sky comes next', () => {
    for (const c of COMMANDERS.filter((x) => x.campaign === 'skyward')) {
      const run = newRun(11, c.heroId) as RunWithEvent;
      expect(run.campaign).toBe('skyward');
      expect(run.region).toBe('skyloft');
      expect(run.roster.map((u) => u.templateId)).toEqual([c.heroId, ...c.units]);
    }
    const run = newRun(12, 'groose') as RunWithEvent;
    run.currentNodeId = run.map.nodes.find((n) => n.type === 'boss')!.id;
    offerRegions(run);
    expect(run.event).toEqual({ type: 'region', options: ['theSky'] });
  });

  it('plays a Skyloft battle and offers Skyward regions afterwards; Batreaux trades crystals', () => {
    const run = newRun(13, 'demise') as RunWithEvent;
    const node = availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    if (run.battle) { run.battle.result = 'won'; expect(finishBattle(run).won).toBe(true); }
    run.regionsVisited.push('theSky');
    run.region = 'theSky';
    offerRegions(run);
    if (run.event?.type === 'region') for (const r of run.event.options) expect(WORLDS[r].campaign).toBe('skyward');
    run.questItems = Array(10).fill('gratitudeCrystal');
    run.event = { type: 'event', eventId: 'batreauxsHouse' };
    expect(chooseEvent(run, 2)).not.toBeNull();
    expect(run.convoy).toContain('cursedMedal');
    expect(run.questItems.filter((x) => x === 'gratitudeCrystal').length).toBe(0);
  });
});
