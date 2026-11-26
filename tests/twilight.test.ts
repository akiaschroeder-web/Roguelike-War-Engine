import { describe, expect, it } from 'vitest';
import { ABILITIES, COMMANDERS, ENEMIES, GEAR, TEMPLATES, WORLDS } from '../src/data/registry';
import { castAbility, knownAbilities, unusableReason } from '../src/engine/abilities';
import { createBattle, startPhase } from '../src/engine/battle';
import { attackMods, forecast, resolveCombat } from '../src/engine/combat';
import { computeMoves, keyOf } from '../src/engine/grid';
import { RNG } from '../src/engine/rng';
import { availableNodes, chooseEvent, enterNode, finishBattle, newRun, offerRegions, startBattle, type RunWithEvent } from '../src/engine/run';
import { tpMods } from '../src/engine/twilight';
import { isTwilit, restoreLight, TEARS_NEEDED, twilightOf, twilightQuestCheck } from '../src/engine/twilightRun';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = () => new RNG(7);

function field(w = 12, h = 8, world = 'hyruleFieldTP'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id], 'hyruleFieldTP', lvl, uid, rng());

describe('Twilight Princess content', () => {
  it('registers the pack: 7 commanders, 11 regions and the whole cast', () => {
    expect(COMMANDERS.filter((c) => c.campaign === 'twilight').length).toBe(7);
    expect(Object.values(WORLDS).filter((w) => w.campaign === 'twilight').length).toBe(11);
    for (const id of ['heroOfTwilight', 'wolfLink', 'zeldaTP', 'ganondorfTP', 'darkBeastGanon', 'midnaImp', 'midnaTrue', 'zant', 'herosShade', 'ilia', 'colin', 'malo',
      'rusl', 'mayorBo', 'renado', 'barnes', 'telma', 'ashei', 'auru', 'shad', 'ralis', 'rutela', 'gorCoron', 'darbus', 'yeto', 'yeta', 'agitha', 'jovani', 'ooccoo',
      'kingBulblin', 'postman', 'ordona', 'faron', 'eldin', 'lanayru', 'fusedShadowMidna', 'lordBullbo',
      'bulblin', 'bulblinArcher', 'wildBullbo', 'shadowBeast', 'shadowInsect', 'twilitBloat', 'redeadKnight', 'aeralfos', 'chilfos', 'whiteWolfos',
      'diababa', 'fyrus', 'morpheel', 'stallord', 'blizzeta', 'armogohma', 'argorok', 'ook', 'ooksParasite', 'dangoro', 'dekuToad', 'deathSword', 'darkhammer',
      'phantomZant', 'possessedZelda', 'stallordsHead', 'armogohmasEye',
      'joelle', 'beth', 'amy', 'meg', 'darkChuchu', 'purpleChuchu', 'rareChuchu', 'queenOfFairies',
      'redBubble', 'blueBubble', 'greenBubble', 'whiteBubble', 'bubbleMM', 'skullBubble', 'freezard']) expect(TEMPLATES[id], id).toBeDefined();
    // The seven Hidden Skills, mounted techniques and Weapon Curse
    for (const id of ['endingBlow', 'shieldAttack', 'backSlice', 'helmSplitter', 'mortalDraw', 'jumpStrike', 'greatSpin', 'mountedSpin', 'mountedGrapple']) expect(ABILITIES[id], id).toBeDefined();
    expect(GEAR.fusedShadow.transform).toBe('fusedShadowMidna');
  });
});

describe('Hidden Skills', () => {
  it('only units who learned them can use them; the Hero\'s Shade knows all seven', () => {
    const b = field();
    const link = place(b, hero('heroOfTwilight'), 2, 2);
    const shade = place(b, hero('herosShade'), 2, 4);
    const e = place(b, foe('bulblin', 'e1'), 3, 2, 'enemy');
    expect(attackMods(link, { type: 'sword' } as never).filter((a) => a.hidden)).toEqual([]);
    const shadeMods = attackMods(shade, { type: 'sword' } as never).map((a) => a.id);
    expect(shadeMods).toEqual(expect.arrayContaining(['endingBlow', 'backSlice', 'helmSplitter', 'mortalDraw', 'shieldAttack']));
    expect(knownAbilities(link).some((a) => a.id === 'greatSpin')).toBe(false);
    expect(knownAbilities(shade).some((a) => a.id === 'greatSpin')).toBe(true);
    void e;
  });

  it('Back Slice ignores half the DEF; Mortal Draw doubles damage; Ending Blow finishes the weak', () => {
    const b = field();
    const shade = place(b, hero('herosShade', 's', 10), 2, 2);
    const e = place(b, foe('helmasaurus', 'e1', 5), 3, 2, 'enemy');
    const plain = forecast(b, shade, shade, e).attacker.dmg;
    const back = forecast(b, shade, shade, e, undefined, 'backSlice').attacker.dmg;
    const draw = forecast(b, shade, shade, e, undefined, 'mortalDraw').attacker.dmg;
    expect(back).toBeGreaterThan(plain);
    expect(draw).toBeGreaterThanOrEqual(plain * 2 - 1);
    e.hp = Math.floor(e.stats.hp * 0.2);
    expect(forecast(b, shade, shade, e, undefined, 'endingBlow').attacker.dmg).toBeGreaterThanOrEqual(e.hp);
  });

  it('Great Spin needs full HP and hits everything within 2', () => {
    const b = field();
    const shade = place(b, hero('herosShade', 's', 10), 5, 4);
    place(b, foe('bulblin', 'e1'), 6, 4, 'enemy');
    place(b, foe('bulblin', 'e2'), 5, 6, 'enemy');
    const res = castAbility(b, shade, 'greatSpin', rng());
    expect(res?.hits.length).toBe(2);
    shade.hp = shade.stats.hp - 1;
    shade.sta = 99;
    expect(unusableReason(b, shade, ABILITIES.greatSpin)).toBe('Only at full HP');
  });
});

describe('the Twilight', () => {
  it('weakens Light World units, empowers Twili, and hurts the unprotected each turn', () => {
    const b = field();
    const rusl = place(b, hero('rusl'), 2, 2);
    const zant = place(b, hero('zant'), 5, 5);
    for (const u of [rusl, zant]) b.tiles[keyOf(b, u.x, u.y)] = 'twilightFog';
    const e = place(b, foe('bulblin', 'e1'), 3, 2, 'enemy');
    expect(tpMods(b, rusl, rusl, e, true).str).toBe(-2);
    expect(tpMods(b, zant, zant, e, true).mag).toBe(2);
    const hp = rusl.hp;
    startPhase(b, 'player');
    expect(rusl.hp).toBeLessThan(hp);
    expect(zant.hp).toBe(zant.stats.hp);
  });

  it('Light Spirits purify the Twilight they stand in; barriers stop all but shadow walkers', () => {
    const b = field();
    const ordona = place(b, hero('ordona'), 2, 2);
    for (let y = 1; y <= 5; y++) for (let x = 1; x <= 5; x++) b.tiles[keyOf(b, x, y)] = 'twilightFog';
    startPhase(b, 'player');
    expect(b.tiles[keyOf(b, 3, 3)]).toBe('plain');
    b.tiles[keyOf(b, 8, 2)] = 'twilightBarrier';
    const rusl = place(b, hero('rusl'), 7, 2);
    const kar = place(b, foe('shadowKargarok', 'k'), 7, 5, 'player');
    expect(computeMoves(b, rusl).reach.has(keyOf(b, 8, 2))).toBe(false);
    expect(computeMoves(b, kar).reach.size).toBeGreaterThan(0);
    void ordona;
  });
});

describe('Twilight creatures and the extra units', () => {
  it('Shadow Beasts revive each other unless finished with light', () => {
    const b = field();
    const link = place(b, hero('heroOfTwilight', 'l', 15), 2, 2);
    const s1 = place(b, foe('shadowBeast', 's1', 1), 3, 2, 'enemy');
    place(b, foe('shadowBeast', 's2', 1), 8, 6, 'enemy');
    s1.hp = 1;
    link.weapons = ['ordonSword'];
    resolveCombat(b, link, s1, rng());
    expect(b.units.includes(s1)).toBe(false);
    expect(b.tp?.dormant.length).toBe(1);
    startPhase(b, 'enemy');
    expect(b.units.includes(s1)).toBe(true);
    expect(s1.hp).toBeGreaterThan(0);
  });

  it('Bubbles inflict Weapon Curse, which stops weapon attacks', () => {
    const b = field();
    const rusl = place(b, hero('rusl'), 2, 2);
    const bub = place(b, foe('blueBubble', 'bb', 8), 3, 2, 'enemy');
    for (let i = 0; i < 6 && !rusl.statuses.some((s) => s.kind === 'weaponCurse'); i++) resolveCombat(b, bub, rusl, new RNG(i));
    expect(rusl.statuses.some((s) => s.kind === 'weaponCurse')).toBe(true);
    expect(forecast(b, rusl, rusl, bub).attacker.canAttack).toBe(false);
  });

  it('Dark ChuChus shrug off ordinary weapons until light turns them to stone', () => {
    const b = field();
    const rusl = place(b, hero('rusl', 'r', 10), 2, 2);
    const dark = place(b, foe('darkChuchu', 'dc'), 3, 2, 'enemy');
    expect(forecast(b, rusl, rusl, dark).attacker.dmg).toBe(0);
  });

  it('ChuChus fuse into a bigger blob and divide again', () => {
    const b = field();
    const red = place(b, foe('chuchuRed', 'c1'), 2, 2);
    const green = place(b, foe('chuchuGreen', 'c2'), 3, 2);
    for (const u of [red, green]) { u.templateId = u.uid === 'c1' ? 'chuchuRed' : 'chuchuGreen'; u.team = 'player'; }
    const res = castAbility(b, red, 'chuFusion', rng(), green.uid);
    expect(res).not.toBeNull();
    expect(b.units.includes(green)).toBe(false);
    expect(red.templateId).toBe('purpleChuchu');
    expect(red.size).toBe(2);
    castAbility(b, red, 'chuDivide', rng());
    expect(red.size).toBe(1);
    expect(b.units.some((u) => u.uid === 'c2')).toBe(true);
  });

  it('Meg starts with three illusions; Wolf Link transforms back and forth', () => {
    const b = createBattle({ world: 'hyruleFieldTP', nodeType: 'battle', depth: 1, roster: [hero('meg'), hero('heroOfTwilight')], seed: 3 });
    const meg = b.units.find((u) => u.templateId === 'meg')!;
    expect(b.units.filter((u) => u.illusionOf === meg.uid).length).toBe(3);
    const link = b.units.find((u) => u.templateId === 'heroOfTwilight')!;
    expect(castAbility(b, link, 'wolfForm', rng())?.transformed).toBeTruthy();
    expect(link.templateId).toBe('wolfLink');
    expect(castAbility(b, link, 'humanForm', rng())).not.toBeNull();
    expect(link.templateId).toBe('heroOfTwilight');
  });

  it('Midna rides Wolf Link and climbs down again', () => {
    const b = field();
    const wolf = place(b, hero('wolfLink'), 2, 2);
    const midna = place(b, hero('midnaImp'), 3, 2);
    expect(castAbility(b, midna, 'midnaRide', rng(), wolf.uid)).not.toBeNull();
    expect(b.units.includes(midna)).toBe(false);
    expect(wolf.cargo).toContain(midna);
    expect(castAbility(b, wolf, 'midnaDismount', rng(), undefined, { x: 2, y: 3 })).not.toBeNull();
    expect(b.units.includes(midna)).toBe(true);
  });
});

describe('Twilight campaign', () => {
  it('starts in Ordon; provinces stay twilit until their Vessel of Light is released', () => {
    const run = newRun(5, 'heroOfTwilight') as RunWithEvent;
    expect(run.campaign).toBe('twilight');
    expect(run.region).toBe('ordonProvince');
    expect(isTwilit(run, 'faronWoods')).toBe(true);
    const tw = twilightOf(run);
    tw.tears.faronWoods = TEARS_NEEDED;
    tw.pending = 'faronWoods';
    const line = restoreLight(run, rng());
    expect(line).toMatch(/Faron/);
    expect(isTwilit(run, 'faronWoods')).toBe(false);
    expect(run.roster.some((u) => u.templateId === 'faron')).toBe(true);
  });

  it('four fragments make the Complete Fused Shadow; the Hidden Skill event teaches a skill', () => {
    const run = newRun(5, 'heroOfTwilight') as RunWithEvent;
    run.questItems = ['fusedShadowPiece', 'fusedShadowPiece', 'fusedShadowPiece', 'fusedShadowPiece'];
    twilightQuestCheck(run);
    expect(run.convoy).toContain('fusedShadow');
    run.event = { type: 'event', eventId: 'shadeTraining' };
    run.roster.push(hero('herosShade', 'p99'));
    const before = run.roster.find((u) => u.templateId === 'heroOfTwilight')!.abilities.length;
    chooseEvent(run, 0);
    expect(run.roster.find((u) => u.templateId === 'heroOfTwilight')!.abilities.length).toBe(before + 1);
  });

  it('plays a battle in a twilit province and offers Twilight regions afterwards', () => {
    const run = newRun(11, 'midnaImp') as RunWithEvent;
    const node = availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    if (run.battle) {
      run.battle.result = 'won';
      const sum = finishBattle(run);
      expect(sum.won).toBe(true);
    }
    offerRegions(run);
    if (run.event?.type === 'region') for (const r of run.event.options) expect(WORLDS[r].campaign).toBe('twilight');
  });
});

describe('expanded supports', () => {
  it('uses the registry: max ranks, shared form progression, and conversations', async () => {
    const { maxRank, rankOf, gainSupport, activeGroups, specialSupportMods } = await import('../src/engine/supports');
    const { pairDef, convoSet, SUPPORT_REGISTRY } = await import('../src/content/supports');
    const { conversationFor } = await import('../src/content/ocarina/conversations');
    expect(SUPPORT_REGISTRY.length).toBeGreaterThan(600);
    const b = field();
    const link = place(b, hero('link'), 2, 2);
    const winds = place(b, hero('heroOfWinds'), 3, 2);
    const wolf = place(b, hero('wolfLink'), 5, 5);
    const midna = place(b, hero('midnaImp'), 5, 6);
    expect(maxRank(link, winds)).toBe('S');
    expect(pairDef('wolfLink', 'midnaImp')?.key).toBe('heroOfTwilight|midnaImp');
    expect(maxRank(wolf, midna)).toBe('S');
    expect(maxRank(hero('rusl'), hero('ashei'))).toBe('A');
    // The doc's own chains are used verbatim.
    expect(convoSet('link', 'heroOfWinds')?.C?.[0][1]).toBe('Is that the Master Sword?');
    expect(conversationFor('heroOfWinds', 'link', 'S', { a: 'x', b: 'y' }).lines.some(([s]) => s === 'n')).toBe(true);
    // Wolf Link fighting beside Midna unlocks the wolf-form conversations.
    b.supports = {};
    gainSupport(b, wolf, 5, midna);
    expect(b.formSupports).toContain('heroOfTwilight|midnaImp#wolfLink');
    // A named pair bonus: A New Generation at S.
    b.supports[[link.uid, winds.uid].sort().join('|')] = 70;
    expect(rankOf(70, maxRank(link, winds))).toBe('S');
    expect(specialSupportMods(b, link, link).str).toBeGreaterThanOrEqual(3);
    // Group support: the Courage of Generations needs all three heroes (Wolf Link counts as the Hero of Twilight).
    expect(activeGroups(b, 'player')).toContain('courageOfGenerations');
    b.units = b.units.filter((x) => x !== wolf);
    expect(activeGroups(b, 'player')).not.toContain('courageOfGenerations');
    place(b, hero('heroOfTwilight', 'tp'), 2, 3);
    expect(activeGroups(b, 'player')).toContain('courageOfGenerations');
  });
});

describe('support conversations', () => {
  it('every registered pair has a written conversation for each rank it can reach', async () => {
    const { SUPPORT_REGISTRY, SUPPORT_CONVOS } = await import('../src/content/supports');
    const { CONVERSATIONS } = await import('../src/content/ocarina/conversations');
    const missing: string[] = [];
    for (const p of SUPPORT_REGISTRY) {
      const set = SUPPORT_CONVOS[p.key] ?? CONVERSATIONS[p.key];
      const ranks: ('C' | 'B' | 'A' | 'S')[] = ['C', 'B', 'A', ...(p.max === 'S' ? ['S' as const] : [])];
      for (const r of ranks) if (!set?.[r]?.length) missing.push(`${p.key} ${r}`);
    }
    expect(missing).toEqual([]);
    for (const k of Object.keys(SUPPORT_CONVOS)) expect(SUPPORT_REGISTRY.some((p) => p.key === k), k).toBe(true);
  });
});
