import { describe, expect, it } from 'vitest';
import {
  ABILITIES, ART_VARIANTS, BOSS_AS_TEMPLATE, BOSSES, COMMANDERS, ENEMIES, GEAR, ITEMS, QUEST_ITEMS, REGION_BOSSES, ROSTERS, SKILLS, TEMPLATES, WEAPONS, WORLDS, artFor,
} from '../src/data/registry';
import { RAIL_MAPS, SPIRIT_ROUTE, SPIRIT_TRACKS, ST_ROUTE_BOSSES, TRAIN_PART_IDS, TRAIN_SETS, TRAIN_SLOTS, trainPartId } from '../src/content/spirit';
import { castAbility, unusableReason } from '../src/engine/abilities';
import { checkResult, createBattle, moveUnit, startPhase } from '../src/engine/battle';
import { resolveCombat } from '../src/engine/combat';
import { environmentPhase } from '../src/engine/field';
import { planAction } from '../src/engine/ai';
import { tileCost } from '../src/engine/grid';
import { capacityOf } from '../src/engine/naval';
import { face, phState } from '../src/engine/phantom';
import {
  isTrain, RAIL, spAfterCombat, spAfterHit, spChuFusion, spiritBattleStart, spMultiplier, spMods, spSaveFromDeath, spStartPhase, spState, trainSetLevel, useSpiritItem,
} from '../src/engine/spirit';
import { spiritAfterBattle, spiritBattleSetup, spiritOf, spiritRegionOptions, spiritStartRegion, applySpiritEffect } from '../src/engine/spiritRun';
import { RNG } from '../src/engine/rng';
import { availableNodes, enterNode, isNavalNode, newRun, offerRegions, startBattle, vesselHasSlot, type RunWithEvent } from '../src/engine/run';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = (s = 11) => new RNG(s);

function field(w = 14, h = 9, world = 'forestRealm'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'forestRealm', lvl, uid, rng());

const CAST = ['heroOfSpirits', 'zeldaST', 'spiritZelda', 'phantomZelda', 'alfonzo', 'elderNiko', 'cole', 'byrne', 'anjean', 'ferrus', 'linebeck3', 'teacher',
  'gage', 'steem', 'carben', 'embrose', 'rael', 'bigBlin', 'spiritTrain', 'armoredTrain', 'darkTrain'];
const MONSTERS = ['torchPhantom', 'wreckerPhantom', 'geozardChief', 'sandworm', 'keyMaster'];
const NEW_BOSSES = ['stagnox', 'fraaz', 'phytops', 'cragma', 'skeldritch', 'malladus', 'malladusZelda', 'demonTrain'];
const CHUCHUS = ['chuchuStandard', 'chuchuFire', 'chuchuIce', 'chuchuElectric', 'chuchuMetal', 'chuchuHelmet'];

describe('Spirit Tracks content', () => {
  it('registers the cast, monsters, bosses, trains and the six new ChuChus (all recruitable, all with art) with the docs\' stats', () => {
    for (const id of [...CAST, ...MONSTERS, ...NEW_BOSSES, ...CHUCHUS]) {
      expect(TEMPLATES[id], id).toBeDefined();
      expect(artFor(id), id).not.toBeNull();
      expect(TEMPLATES[id].formOf, id).toBeUndefined();
    }
    expect(TEMPLATES.heroOfSpirits.stats).toEqual({ hp: 28, str: 12, mag: 5, skl: 16, spd: 13, def: 9, res: 7, lck: 14, con: 8, mov: 6, sta: 28, mp: 18 });
    expect(TEMPLATES.phantomZelda.stats).toMatchObject({ hp: 48, str: 21, def: 28, con: 25, mov: 5 });
    expect(TEMPLATES.phantomZelda.size).toBe(2);
    expect(TEMPLATES.anjean.stats).toMatchObject({ hp: 30, mag: 29, res: 28, mp: 70 });
    expect(TEMPLATES.bigBlin.stats).toMatchObject({ hp: 48, str: 23, mag: 0, skl: 11, spd: 6, def: 17, res: 6, lck: 5, con: 24, mov: 5, sta: 40, mp: 0 });
    expect(ENEMIES.wreckerPhantom.stats).toMatchObject({ hp: 65, str: 28, def: 32 });
    expect(BOSSES.cragma.stats).toMatchObject({ hp: 130, str: 35, def: 32 });
    expect(BOSSES.cragma.size).toBe(5);
    expect(BOSSES.malladus.stats).toMatchObject({ hp: 125, mag: 35, mp: 85 });
    expect(BOSSES.malladusZelda.stats).toMatchObject({ hp: 45, mag: 34, res: 30 });
    expect(BOSSES.demonTrain.size).toBe(5);
    expect(ENEMIES.chuchuMetal.stats).toMatchObject({ hp: 28, str: 12, mag: 15, def: 22, mov: 4 });
    expect(TEMPLATES.chuchuHelmet.gear).toEqual({ head: 'chuchuIronHelmet' });
    expect(GEAR.chuchuIronHelmet.stats).toMatchObject({ def: 12, res: 2 });
    // Zelda's Torch, Warp and Wrecker possession forms are never recruited on their own (the doc).
    for (const id of ['phantomZeldaTorch', 'phantomZeldaWarp', 'phantomZeldaWrecker']) expect(TEMPLATES[id].formOf).toBe('phantomZelda');
    // Forms of the same person never share an army; boss forms share their character's progression.
    expect(TEMPLATES.zeldaST.exclusiveWith).toEqual(expect.arrayContaining(['spiritZelda', 'phantomZelda', 'malladusZelda']));
    expect(TEMPLATES.malladus.exclusiveWith).toContain('malladusZelda');
    expect(BOSS_AS_TEMPLATE.coleBoss).toBe('cole');
    expect(BOSS_AS_TEMPLATE.byrneBoss).toBe('byrne');
    expect(BOSS_AS_TEMPLATE.bigBlinBoss).toBe('bigBlin');
    // No generic Lokomo, no Armored Dark Train, no Kokomo.
    for (const id of ['lokomoGuardian', 'lokomoMusician', 'lokomoMystic', 'armoredDarkTrain', 'kokomo']) expect(TEMPLATES[id], id).toBeUndefined();
    // The Twilight Princess's Possessed Zelda keeps her own id.
    expect(BOSSES.possessedZelda.home).toBe('hyruleCastleTP');
  });

  it('uses the fixed art: one Phantom Zelda image, ChuChu alternates, Spirit Tracks alternates for existing units', () => {
    for (const id of ['phantomZelda', 'phantomZeldaTorch', 'phantomZeldaWarp', 'phantomZeldaWrecker']) expect(artFor(id)).toBe('phantomZelda');
    expect(ART_VARIANTS.chuchuStandard).toEqual(['chuchuStandard', 'chuchuBlueSS']);
    expect(ART_VARIANTS.chuchuFire).toEqual(['chuchuFire', 'chuchuRedSS']);
    expect(ART_VARIANTS.chuchuIce).toEqual(['chuchuIce', 'chuchuFrostAlt']);
    expect(ART_VARIANTS.chuchuHelmet).toEqual(['chuchuHelmet', 'chuchuSpikedHelmet']);
    expect(ART_VARIANTS.bubbleMM).toEqual(['bubbleMM', 'bubbleST']);
    expect(ART_VARIANTS.skulltula).toEqual(['skulltula', 'skulltulaST']);
    expect(ART_VARIANTS.wildBullbo).toContain('bullboST');
    expect(ART_VARIANTS.bulblin).toEqual(['bulblin', 'bulblinST']);
    expect(ART_VARIANTS.phantom).toEqual(['phantom', 'phantomOfficial']);
    for (const id of ['bubbleST', 'skulltulaST', 'bullboST', 'bulblinST', 'phantomOfficial', 'chuchuFrostAlt', 'chuchuSpikedHelmet']) expect(artFor(id), id).toBe(id);
    expect(artFor('coleBoss')).toBe('cole');
  });

  it('only references things that exist', () => {
    const missing: string[] = [];
    const known = (id: string) => !!(WEAPONS[id] || GEAR[id] || ITEMS[id]);
    const P = SPIRIT_TRACKS;
    for (const t of [...P.templates, ...P.enemies, ...P.bosses]) {
      for (const w of t.weapons) if (!WEAPONS[w]) missing.push(`weapon ${w} (${t.id})`);
      if (t.skill && !SKILLS[t.skill]) missing.push(`skill ${t.skill} (${t.id})`);
      for (const s of ('extraSkills' in t ? t.extraSkills ?? [] : [])) if (!SKILLS[s]) missing.push(`skill ${s} (${t.id})`);
      for (const a of ('abilities' in t ? t.abilities ?? [] : [])) if (!ABILITIES[a]) missing.push(`ability ${a} (${t.id})`);
      for (const g of Object.values(('gear' in t ? t.gear : undefined) ?? {})) if (!GEAR[g as string]) missing.push(`gear ${g} (${t.id})`);
    }
    for (const b of P.bosses) for (const d of b.drops ?? []) if (!known(d)) missing.push(`drop ${d} (${b.id})`);
    for (const ids of Object.values(P.rosters)) for (const id of ids) if (!ENEMIES[id]) missing.push(`roster ${id}`);
    for (const f of P.factions) for (const u of [...f.units, ...f.leaders]) if (!TEMPLATES[u]) missing.push(`faction ${f.id}: ${u}`);
    for (const ev of P.events ?? []) {
      if (ev.art && !artFor(ev.art)) missing.push(`event art ${ev.art}`);
      for (const ch of ev.choices) for (const o of [ch.outcome, ch.gamble?.win, ch.gamble?.lose].filter(Boolean)) for (const e of o!.effects) {
        if (e.kind === 'loot') for (const i of e.ids) if (!known(i)) missing.push(`event ${ev.id} loot ${i}`);
        if (e.kind === 'recruit') for (const i of e.pool) if (!TEMPLATES[i]) missing.push(`event ${ev.id} recruit ${i}`);
        if (e.kind === 'quest' && !QUEST_ITEMS[e.id]) missing.push(`event ${ev.id} quest ${e.id}`);
      }
      for (const r of ev.regions ?? []) if (!WORLDS[r]) missing.push(`event ${ev.id} region ${r}`);
    }
    for (const ids of Object.values(ST_ROUTE_BOSSES)) for (const id of ids) if (!BOSSES[id]) missing.push(`route boss ${id}`);
    for (const m of Object.values(RAIL_MAPS)) if (!QUEST_ITEMS[m]) missing.push(`rail map ${m}`);
    expect(missing).toEqual([]);
    for (const r of SPIRIT_ROUTE) {
      expect(WORLDS[r]?.campaign, r).toBe('spirit');
      expect(ROSTERS[r]?.length, r).toBeGreaterThan(0);
      expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0);
    }
    expect(SPIRIT_ROUTE.length).toBe(11);
    // The new ChuChus also join the Wild campaign's ChuChu pools.
    expect(ROSTERS.eldinWild).toContain('chuchuFire');
    expect(ROSTERS.hebra).toContain('chuchuIce');
    expect(ROSTERS.gerudoWild).toContain('chuchuElectric');
    expect(ROSTERS.greatPlateau).toContain('chuchuStandard');
  });

  it('has six commanders; Steem stands in for the dropped Lokomo Guardian', () => {
    const cmd = COMMANDERS.filter((c) => c.campaign === 'spirit');
    expect(cmd.map((c) => c.heroId)).toEqual(['heroOfSpirits', 'zeldaST', 'anjean', 'byrne', 'cole', 'malladus']);
    expect(cmd[0].units).toContain('spiritTrain');
    expect(cmd[2].units).toEqual(['gage', 'steem']);
    expect(cmd[5].units).toContain('darkTrain');
  });

  it('has 32 train parts: eight sets for the four slots', () => {
    expect(TRAIN_SETS.length).toBe(8);
    expect(TRAIN_SLOTS.length).toBe(4);
    expect(TRAIN_PART_IDS.length).toBe(32);
    for (const id of TRAIN_PART_IDS) expect(GEAR[id], id).toBeDefined();
    expect(GEAR[trainPartId('dragon', 'trainCannon')].slot).toBe('trainCannon');
  });
});

describe('Spirit Tracks: trains and railway combat', () => {
  it('trains run only on rail spaces; passenger room grows with the Stagecoach set', () => {
    const b = field();
    const t = place(b, hero('spiritTrain'), 0, 0);
    expect(isTrain(t)).toBe(true);
    for (const r of RAIL) expect(tileCost(b, t, r), r).toBe(1);
    for (const r of ['plain', 'forest', 'brokenTrack', 'water'] as Terrain[]) expect(tileCost(b, t, r), r).toBeGreaterThanOrEqual(99);
    // Anyone else can walk the rails (but not a switch).
    const l = place(b, hero('heroOfSpirits'), 5, 5);
    expect(tileCost(b, l, 'railTrack')).toBe(1);
    expect(tileCost(b, l, 'railSwitch')).toBeGreaterThanOrEqual(99);
    expect(capacityOf(t)).toBe(4);
    t.gear.passengerCar = trainPartId('stagecoach', 'passengerCar');
    t.gear.freightCar = trainPartId('stagecoach', 'freightCar');
    expect(trainSetLevel(t, 'stagecoach')).toBe(1);
    expect(capacityOf(t)).toBe(5);
    expect(vesselHasSlot(t, 'trainEngine')).toBe(true);
    expect(vesselHasSlot(t, 'sail')).toBe(false);
  });

  it('a train battle lays a loop of track with a junction, stations and a broken section; trains start on the rails', () => {
    const run = newRun(5, 'heroOfSpirits', 'spirit');
    const b = createBattle({ world: 'forestRealm', nodeType: 'battle', depth: 6, roster: run.roster.map(prepareForBattle), seed: 3, naval: true });
    expect(b.sp?.rail).toBe(true);
    expect(b.wind).toBeUndefined();
    for (const t of ['railTrack', 'railJunction', 'railSwitch', 'trainStation', 'railCrossing', 'spiritTrack', 'brokenTrack'] as Terrain[]) expect(b.tiles, t).toContain(t);
    const trains = b.units.filter(isTrain);
    expect(trains.some((u) => u.team === 'player')).toBe(true);
    expect(trains.some((u) => u.team === 'enemy')).toBe(true);
    for (const tr of trains) for (let dy = 0; dy < tr.size; dy++) for (let dx = 0; dx < tr.size; dx++) expect(RAIL).toContain(b.tiles[(tr.y + dy) * b.width + tr.x + dx]);
    // Throwing the switch closes the junction (and opens it again).
    const sw = b.tiles.indexOf('railSwitch');
    const l = b.units.find((u) => u.templateId === 'heroOfSpirits') ?? b.units.flatMap((v) => v.cargo ?? []).find((u) => u.templateId === 'heroOfSpirits')!;
    if (!b.units.includes(l)) b.units.push(l);
    l.x = sw % b.width - 1; l.y = Math.floor(sw / b.width);
    expect(unusableReason(b, l, ABILITIES.throwSwitch)).toBeNull();
    castAbility(b, l, 'throwSwitch', rng());
    expect(b.sp!.junctionsOpen).toBe(false);
    expect(b.tiles[b.sp!.junctions[0]]).toBe('brokenTrack');
    l.acted = false;
    castAbility(b, l, 'throwSwitch', rng());
    expect(b.tiles[b.sp!.junctions[0]]).toBe('railJunction');
  });

  it('Broken Track is mended in one go, free for engineers; stations repair trains; collisions hurt more on crossings', () => {
    const b = field();
    spState(b).rail = true;
    for (let x = 0; x < 14; x++) b.tiles[2 * 14 + x] = 'railTrack';
    for (const x of [6, 7]) b.tiles[2 * 14 + x] = 'brokenTrack';
    const l = place(b, hero('heroOfSpirits'), 6, 3);
    const res = castAbility(b, l, 'repairTrack', rng());
    expect(res?.free).toBe(true);
    expect(b.tiles[2 * 14 + 7]).toBe('railTrack');
    const t = place(b, hero('spiritTrain'), 0, 5);
    t.hp = 20;
    for (let y = 5; y < 8; y++) for (let x = 0; x < 3; x++) b.tiles[y * 14 + x] = 'trainStation';
    spStartPhase(b, t, []);
    expect(t.hp).toBeGreaterThan(20);
    const dt = place(b, hero('darkTrain'), 10, 5, 'enemy');
    const victim = place(b, hero('alfonzo'), 9, 5);
    const w = WEAPONS.trainCollision;
    const plain = spMultiplier(b, dt, dt, victim, false, w, 1);
    b.tiles[5 * 14 + 9] = 'railCrossing';
    expect(spMultiplier(b, dt, dt, victim, false, w, 1)).toBe(plain * 2);
    expect(plain).toBe(1.25); // Dark Collision
  });

  it('the Demon Train takes half damage until a car is knocked out, and its other cars fire', () => {
    const b = field(20, 12);
    const d = place(b, foe('demonTrain', 'dt', 10), 10, 3, 'enemy');
    spiritBattleStart(b);
    const l = place(b, hero('heroOfSpirits'), 9, 4);
    const a = place(b, hero('alfonzo'), 9, 6);
    expect(spMultiplier(b, l, l, d, false, WEAPONS.recruitsSword, 1)).toBe(0.5);
    spAfterHit(b, l, d, Math.ceil(d.stats.hp * 0.2), WEAPONS.recruitsSword);
    expect(spMultiplier(b, l, l, d, false, WEAPONS.recruitsSword, 1)).toBe(1);
    const zaps = spAfterCombat(b, d, l, { atk: 10, def: 0 });
    expect(zaps.some((z) => z.uid === a.uid)).toBe(true);
  });
});

describe('Spirit Tracks: Zelda, possession and the Tower', () => {
  it('Zelda leaves her body, possesses an exposed Phantom, and slips out as a spirit when the armor falls', () => {
    const b = field();
    const z = place(b, hero('zeldaST'), 3, 3);
    castAbility(b, z, 'spiritForm', rng());
    expect(z.templateId).toBe('spiritZelda');
    expect(z.skills).toContain('spectralPassage');
    // Ordinary blows pass through her spirit; sacred and demonic power doesn't.
    const e = place(b, foe('bulblin', 'bu'), 8, 8, 'enemy');
    expect(spMultiplier(b, e, e, z, false, WEAPONS[e.weapons[0]], 1)).toBe(0.5);
    expect(spMultiplier(b, e, e, z, true, undefined, 2, 'dark')).toBe(1.5);
    const t = place(b, foe('torchPhantom', 'tp', 3), 4, 3, 'enemy');
    z.acted = false;
    expect(unusableReason(b, z, ABILITIES.possessPhantom)).not.toBeNull();
    // A sacred blow exposes it.
    const l = place(b, hero('heroOfSpirits'), 6, 4);
    l.weapons = ['lokomoSword', ...l.weapons];
    spAfterHit(b, l, t, 5, WEAPONS.lokomoSword, 'light');
    expect(unusableReason(b, z, ABILITIES.possessPhantom)).toBeNull();
    castAbility(b, z, 'possessPhantom', rng(), t.uid);
    expect(b.units).not.toContain(t);
    expect(z.templateId).toBe('phantomZeldaTorch');
    expect(artFor(z.templateId)).toBe('phantomZelda');
    const saved = spSaveFromDeath(b, z);
    expect(saved).not.toBeNull();
    expect(z.templateId).toBe('spiritZelda');
  });

  it('the Lokomo Sword and Tears of Light cut through Phantom armor; Torch and Wrecker Phantoms wear it too', async () => {
    const { phMultiplier } = await import('../src/engine/phantom');
    const b = field();
    const l = place(b, hero('heroOfSpirits'), 3, 4);
    const w = place(b, foe('wreckerPhantom', 'wr'), 4, 4, 'enemy');
    face(w, l);
    expect(phMultiplier(b, l, l, w, false, WEAPONS.recruitsSword, 1)).toBe(0);
    expect(phMultiplier(b, l, l, w, false, WEAPONS.lokomoSword, 1, 'light')).toBeGreaterThan(0);
    l.buffs.push({ id: 'tearOfLight', name: 'Tear of Light', turns: 3 });
    expect(phMultiplier(b, l, l, w, false, WEAPONS.recruitsSword, 1)).toBeGreaterThan(0);
  });

  it('the Tower of Spirits has patrols and Safe Zones but no life drain', () => {
    const run = newRun(5, 'zeldaST', 'spirit');
    const b = createBattle({ world: 'towerOfSpirits', nodeType: 'battle', depth: 8, roster: run.roster.map(prepareForBattle), seed: 4 });
    expect(b.sp?.tower).toBe(true);
    expect(b.ph?.temple).toBe(true);
    expect(b.ph?.noDrain).toBe(true);
    expect(b.tiles).toContain('sacredSafeZone');
    const p = b.units.find((u) => u.team === 'player' && !isTrain(u))!;
    const hp = p.hp;
    for (let i = 0; i < 3; i++) { startPhase(b, 'player'); b.turn++; }
    expect(p.hp).toBeGreaterThanOrEqual(Math.min(hp, p.stats.hp) - 1);
  });
});

describe('Spirit Tracks: bosses and the ChuChus', () => {
  it('Fraaz alternates fire and ice: immune to the current element, weak to the other', () => {
    const b = field(16, 10);
    const f = place(b, foe('fraaz', 'fz', 6), 8, 3, 'enemy');
    spiritBattleStart(b);
    const s = place(b, hero('steem'), 6, 3);
    spStartPhase(b, f, []);
    const form = f.stForm!;
    const other = form === 'fire' ? 'ice' : 'fire';
    expect(spMultiplier(b, s, s, f, true, undefined, 2, form)).toBe(0);
    expect(spMultiplier(b, s, s, f, true, undefined, 2, other)).toBeGreaterThanOrEqual(2);
  });

  it('Stagnox is armored in front until the wind blows its shell open', () => {
    const b = field(16, 10);
    const st = place(b, foe('stagnox', 'sg', 6), 8, 3, 'enemy');
    spiritBattleStart(b);
    const l = place(b, hero('heroOfSpirits'), 6, 4);
    face(st, l);
    expect(spMultiplier(b, l, l, st, false, WEAPONS.recruitsSword, 1)).toBeCloseTo(0.2);
    useSpiritItem(b, l, 'whirlwindST', { x: st.x, y: st.y });
    expect(st.stArmorOpen).toBe(2);
    expect(spMultiplier(b, l, l, st, false, WEAPONS.recruitsSword, 1)).toBeCloseTo(1.5);
  });

  it('the new ChuChus: adaptation, immunities, Metal\'s conduction, the Helmet and the Whip, fusion rules', () => {
    const b = field();
    const c = place(b, foe('chuchuStandard', 'cs'), 5, 5, 'enemy');
    const l = place(b, hero('heroOfSpirits'), 4, 5);
    spAfterHit(b, l, c, 2, undefined, 'fire');
    expect(c.templateId).toBe('chuchuFire');
    expect(spMultiplier(b, l, l, c, true, undefined, 1, 'fire')).toBe(0);
    expect(spMultiplier(b, l, l, c, true, undefined, 1, 'ice')).toBe(1.5);
    const m = place(b, foe('chuchuMetal', 'cm'), 7, 7, 'enemy');
    expect(spMultiplier(b, l, l, m, false, WEAPONS.recruitsSword, 1)).toBe(0);
    expect(spMultiplier(b, l, l, m, false, WEAPONS.fairyBow, 2)).toBe(1.5);
    const h = place(b, foe('chuchuHelmet', 'ch'), 9, 2, 'enemy');
    spiritBattleStart(b);
    expect(spMods(b, h, h, l, false, WEAPONS.helmetHorns).def).toBe(12);
    spAfterHit(b, l, h, 2, WEAPONS.whip);
    expect(h.stHelmetOff).toBe(true);
    expect(spMods(b, h, h, l, false, WEAPONS.helmetHorns).def).toBe(0);
    // Fusion: Standard + elemental = that elemental; two elementals = Purple; Metal only with Metal.
    const s2 = foe('chuchuStandard', 's2'), f2 = foe('chuchuFire', 'f2'), i2 = foe('chuchuIce', 'i2'), m2 = foe('chuchuMetal', 'm2');
    expect(spChuFusion(s2, f2)).toBe('chuchuFire');
    expect(spChuFusion(f2, i2)).toBe('purpleChuchu');
    expect(spChuFusion(m2, s2)).toBeNull();
    expect(spChuFusion(m2, foe('chuchuMetal', 'm3'))).toBe('chuchuMetal');
    expect(spChuFusion(foe('chuchuRed', 'r1'), foe('chuchuBlue', 'b1'))).toBeUndefined();
  });

  it('Big Blin grows stronger with Miniblins around and can carry off a beaten foe', () => {
    const b = field();
    const bb = place(b, hero('bigBlin'), 3, 3);
    const foeU = place(b, foe('bulblin', 'bu'), 5, 3, 'enemy');
    const base = spMods(b, bb, bb, foeU, true).str;
    place(b, hero('miniblin', 'm1'), 2, 6);
    place(b, hero('miniblin', 'm2'), 1, 2);
    expect(spMods(b, bb, bb, foeU, true).str).toBe(base + 4);
    foeU.x = 4; foeU.y = 2;
    foeU.hp = 2;
    expect(unusableReason(b, bb, ABILITIES.blinCapture)).toBeNull();
    castAbility(b, bb, 'blinCapture', rng(), foeU.uid);
    expect(b.units).not.toContain(foeU);
    expect(checkResult(b)).toBe('won');
  });
});

describe('Spirit Tracks campaign', () => {
  it('starts in Aboda Village with the Hero of Spirits and a train; a Tower climb and a train battle on the map', () => {
    const run = newRun(9, 'zeldaST', 'spirit');
    expect(run.region).toBe(spiritStartRegion());
    expect(run.region).toBe('abodaVillage');
    expect(run.roster.some((u) => u.templateId === 'heroOfSpirits')).toBe(true);
    expect(run.roster.some((u) => u.templateId === 'spiritTrain')).toBe(true);
    expect(run.map.nodes.some((n) => n.naval && isNavalNode(run, n))).toBe(true);
    const r2 = newRun(9, 'heroOfSpirits', 'spirit') as RunWithEvent;
    r2.region = 'forestRealm';
    offerRegions(r2);
  });

  it('follows the route and its rail maps, and rewards the bosses (sages, Force Gems, stamps)', () => {
    const run = newRun(12, 'heroOfSpirits', 'spirit') as RunWithEvent;
    expect(spiritRegionOptions(run, rng())).toEqual(['hyruleCastleST']);
    run.region = 'hyruleCastleST';
    expect(spiritRegionOptions(run, rng())).toEqual(['hyruleCastleST']);
    run.questItems = [...(run.questItems ?? []), 'stampBook'];
    run.region = 'forestRealm';
    const b = createBattle({ world: 'forestRealm', nodeType: 'boss', depth: 12, roster: run.roster, seed: 3, boss: BOSSES.stagnox });
    b.result = 'won';
    b.fallen.push(...b.units.filter((u) => u.isBoss));
    const lines = spiritAfterBattle(run, b, true, rng());
    expect(lines.length).toBeGreaterThan(0);
    expect(run.questItems).toContain('snowRailMap');
    expect(run.questItems).toContain('forceGem');
    expect(spiritOf(run).beaten).toContain('stagnox');
    expect(spiritOf(run).stamps).toBe(1);
    expect(run.roster.some((u) => u.templateId === 'gage')).toBe(true);
    offerRegions(run);
    expect((run.event as { options: string[] }).options).toEqual(['snowRealm']);
    // Stamps: five give a prize.
    for (let i = 0; i < 4; i++) applySpiritEffect(run, { kind: 'spirit', op: 'stamp' }, rng(i));
    expect(spiritOf(run).prizes).toContain(5);
    expect(run.convoy).toContain('engineersCertificate');
  });

  it('battles in every spirit region (and on the rails) set up and play a few rounds without errors', () => {
    const run = newRun(51, 'heroOfSpirits', 'spirit') as RunWithEvent;
    for (const [i, r] of SPIRIT_ROUTE.entries()) {
      const boss = i % 2 === 0 ? BOSSES[ST_ROUTE_BOSSES[r][0]] : undefined;
      const b = createBattle({ world: r, nodeType: boss ? 'boss' : 'battle', depth: 4 + i * 2, roster: run.roster, seed: 100 + i, boss, naval: i % 3 === 1 || r === 'demonTrainLine' });
      spiritBattleSetup(run, b, rng(i));
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

  it('plays the first battle of a spirit campaign from the map', () => {
    const run = newRun(77, 'cole', 'spirit') as RunWithEvent;
    const node = availableNodes(run).find((n) => n.type === 'battle') ?? availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    expect(run.battle).toBeTruthy();
    expect(run.battle!.units.some((u) => u.team === 'enemy')).toBe(true);
    void phState;
  });
});
