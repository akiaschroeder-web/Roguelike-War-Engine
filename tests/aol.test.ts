import { describe, expect, it } from 'vitest';
import { ABILITIES, ART_VARIANTS, BOSSES, COMMANDERS, ENEMIES, EVENTS, GEAR, ITEMS, QUEST_ITEMS, REGION_BOSSES, REGION_IDS, ROSTERS, SKILLS, TEMPLATES, WEAPONS, WORLDS, artFor } from '../src/data/registry';
import { PALACES, Z2_REGION_IDS, Z2_SPELLS } from '../src/content/original';
import { abilityCost, castAbility, enemyAutoTransform, knownAbilities, unusableReason } from '../src/engine/abilities';
import { checkResult, startPhase } from '../src/engine/battle';
import { attackMods, forecast, resolveCombat } from '../src/engine/combat';
import { computeMoves, keyOf, tileCost } from '../src/engine/grid';
import { useItem } from '../src/engine/items';
import { ogAfterMove, ogMultiplier, ogOnKill, ogStartPhase } from '../src/engine/original';
import { aolAfterCombat, aolDefense, aolRound } from '../src/engine/aol';
import { applyAolEffect, crystalsHeld, inOriginalLevels, originalAfterBattle, originalBossFor, originalRegionOptions } from '../src/engine/originalRun';
import { RNG } from '../src/engine/rng';
import { addStatus } from '../src/engine/status';
import { availableNodes, chooseEvent, enterNode, finishBattle, isFreeForAll, newRun, offerRegions, startBattle, type RunWithEvent } from '../src/engine/run';
import { makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = () => new RNG(7);

function field(w = 14, h = 9, world = 'parapaPalace'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'parapaPalace', lvl, uid, rng());

const MONSTERS = ['bit', 'bot', 'moby', 'deeler', 'daira', 'geru', 'geldarm', 'moa', 'myu', 'bagoBago', 'doomknocker', 'guma', 'fokka', 'fokkeru', 'wosu', 'mago'];
const GUARDIANS = ['horsehead', 'helmethead', 'rebonack', 'carock', 'gooma', 'thunderbird'];

describe('Zelda II content', () => {
  it('registers the Sleeping Princess, 16 monsters and 6 guardians (all recruitable, all with art) with the doc\'s stats', () => {
    for (const id of ['sleepingZelda', ...MONSTERS, ...GUARDIANS]) {
      expect(TEMPLATES[id], id).toBeDefined();
      expect(artFor(id), id).not.toBeNull();
    }
    expect(TEMPLATES.sleepingZelda.stats).toEqual({ hp: 23, str: 2, mag: 23, skl: 13, spd: 8, def: 4, res: 24, lck: 16, con: 4, mov: 5, sta: 14, mp: 50 });
    expect(TEMPLATES.thunderbird.stats).toMatchObject({ hp: 105, str: 20, mag: 32, def: 24, res: 28, con: 38, mov: 8, mp: 65 });
    expect(TEMPLATES.thunderbird.size).toBe(4);
    expect(TEMPLATES.gooma.size).toBe(3);
    expect(TEMPLATES.carock.stats).toMatchObject({ hp: 35, mag: 28, res: 26, mp: 60 });
    expect(TEMPLATES.guma.stats).toMatchObject({ hp: 42, str: 19, def: 13, con: 20, mov: 4, sta: 35 });
    expect(TEMPLATES.fokka.stats).toMatchObject({ hp: 36, skl: 19, spd: 18, mov: 7 });
    expect(TEMPLATES.geldarm.size).toBe(2);
    expect(artFor('deeler')).toBe('skulltula');
    expect(artFor('daira')).toBe('geru');
    expect(artFor('gooma')).toBe('guma');
    expect(ART_VARIANTS.heroOfHyrule).toEqual(['link1', 'heroOfHyruleZ2']);
    expect(ART_VARIANTS.darkLink).toContain('darkLinkZ2');
    expect(ART_VARIANTS.volvagia).toContain('barba');
    // No Wizzrobe unit: rosters skip it.
    expect(Object.values(ROSTERS).flat()).not.toContain('wizzrobe');
    for (const r of Z2_REGION_IDS) { expect(WORLDS[r]?.campaign).toBe('original'); expect(ROSTERS[r]?.length, r).toBeGreaterThan(0); expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0); }
    for (const id of [...Z2_SPELLS, 'downwardThrust', 'upwardThrust', 'sleepingCurse', 'ancientBlessing', 'dreamProtection', 'couragesAwakening']) expect(ABILITIES[id], id).toBeDefined();
    for (const id of ['dairaAxe', 'doomknockerHammer', 'horseheadsMace', 'rebonacksLance', 'fokkaSword', 'carocksStaff']) expect(WEAPONS[id], id).toBeDefined();
    for (const id of ['horseheadsArmor', 'helmetheadsHelm', 'rebonacksArmor', 'fokkaHelmet', 'thunderbirdMask', 'magicBoots', 'cross']) expect(GEAR[id], id).toBeDefined();
    for (const id of ['experienceBag', 'linkDoll', 'waterOfLife', 'moaEye', 'myuSpike', 'fokkaFeather', 'thunderbirdFlame']) expect(ITEMS[id], id).toBeDefined();
    for (const id of ['palaceCrystal', 'trophy', 'lostMirror']) expect(QUEST_ITEMS[id], id).toBeDefined();
    const c = COMMANDERS.find((x) => x.heroId === 'sleepingZelda')!;
    expect(c).toMatchObject({ units: ['heroOfHyrule', 'oldMan', 'hyruleKnight'], bonus: 'ancientMagic', campaign: 'original' });
    for (const k of [...MONSTERS.map((m) => TEMPLATES[m].skill), ...GUARDIANS.map((g) => BOSSES[g].skill)]) expect(SKILLS[k!], k).toBeDefined();
  });

  it('Random and World Tour can reach the new regions', () => {
    for (const r of Z2_REGION_IDS) expect(REGION_IDS).toContain(r);
    // A World Tour that has been through the nine Levels comes back to North Castle.
    const run = newRun(5, 'heroOfHyrule', 'worldTour', 1) as RunWithEvent;
    run.regionsVisited.push('level1Eagle');
    run.tour!.legStartAct = run.act;
    run.tour!.next = 'original';
    run.currentNodeId = run.map.nodes.find((n) => n.type === 'boss')!.id;
    offerRegions(run);
    expect(run.event).toEqual({ type: 'region', options: ['northCastle'] });
  });
});

describe('spells and sword techniques', () => {
  it('the Hero of Hyrule knows all eight spells; others learn them from the Old Men', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 2, 4);
    const known = knownAbilities(link).map((a) => a.id);
    for (const s of Z2_SPELLS) expect(known).toContain(s);
    const run = newRun(9, 'sleepingZelda') as RunWithEvent;
    expect(applyAolEffect(run, { kind: 'aol', op: 'spell', id: 'spellShield' }, rng())).toContain('Shield');
    expect(run.roster.find((u) => u.templateId === 'sleepingZelda')!.abilities).toContain('spellShield');
    // Hyrule Knights have no magic in them.
    expect(run.roster.find((u) => u.templateId === 'hyruleKnight')!.abilities).not.toContain('spellShield');
    expect(applyAolEffect(run, { kind: 'aol', op: 'technique', id: 'downwardThrust' }, rng())).toContain('Downward Thrust');
    expect(run.roster.find((u) => u.templateId === 'heroOfHyrule')!.abilities).toContain('downwardThrust');
  });

  it('Ancient Magic: learned spells cost 20% less MP', () => {
    const b = field();
    b.bonus = 'ancientMagic';
    const z = place(b, hero('sleepingZelda'), 2, 4);
    z.abilities.push('spellThunder');
    expect(abilityCost(z, ABILITIES.spellThunder, b)).toBe(19);
    b.bonus = undefined;
    expect(abilityCost(z, ABILITIES.spellThunder, b)).toBe(24);
  });

  it('Shield halves damage; Life heals 40%; Fairy flies and can\'t attack; Jump leaps gaps', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 2, 4);
    const e = place(b, foe('bot'), 3, 4, 'enemy');
    const before = forecast(b, e, e, link).attacker.dmg;
    expect(castAbility(b, link, 'spellShield', rng())).not.toBeNull();
    expect(forecast(b, e, e, link).attacker.dmg).toBeLessThanOrEqual(Math.ceil(before / 2));
    link.hp = 10;
    link.mp = 50;
    castAbility(b, link, 'spellLife', rng());
    expect(link.hp).toBe(10 + Math.ceil(link.stats.hp * 0.4));
    expect(tileCost(b, link, 'ladderGap')).toBeGreaterThan(50);
    link.cooldowns = {};
    castAbility(b, link, 'spellJump', rng());
    expect(tileCost(b, link, 'ladderGap')).toBe(1);
    link.cooldowns = {};
    castAbility(b, link, 'spellFairy', rng());
    expect(forecast(b, link, link, e).attacker.canAttack).toBe(false);
    expect(tileCost(b, link, 'narrowPassage')).toBe(1);
  });

  it('Thunder strikes every enemy and breaks Thunderbird\'s Sealed Face for 3 turns', () => {
    const b = field(16, 12, 'greatPalace');
    const z = place(b, hero('sleepingZelda', 'z', 10), 1, 1);
    z.abilities.push('spellThunder');
    const tb = place(b, makeEnemy(BOSSES.thunderbird, 'greatPalace', 5, 'tb', rng()), 8, 4, 'enemy');
    const bit = place(b, foe('bot', 'bot1'), 3, 8, 'enemy');
    const link = place(b, hero('heroOfHyrule'), 7, 4);
    expect(ogMultiplier(b, link, tb, false, WEAPONS.kokiriSword, 1)).toBe(0.25);
    const hp = [tb.hp, bit.hp];
    expect(castAbility(b, z, 'spellThunder', rng())).not.toBeNull();
    expect(tb.hp).toBeLessThan(hp[0]);
    expect(bit.hp < hp[1] || !b.units.includes(bit)).toBe(true);
    expect(tb.buffs.find((x) => x.id === 'thunderExposed')?.turns).toBe(3);
    expect(ogMultiplier(b, link, tb, false, WEAPONS.kokiriSword, 1)).toBe(1);
    // Below half HP, an enemy Thunderbird reseals its face (once).
    tb.hp = 30;
    enemyAutoTransform(b, tb, rng());
    expect(tb.buffs.some((x) => x.id === 'thunderExposed')).toBe(false);
  });

  it('Reflect turns magic projectiles back — double damage on Carock, who shrugs off swords', () => {
    const b = field();
    const z = place(b, hero('sleepingZelda'), 2, 4);
    const carock = place(b, makeEnemy(BOSSES.carock, 'mazeIslandPalace', 5, 'ca', rng()), 5, 4, 'enemy');
    const link = place(b, hero('heroOfHyrule'), 4, 6);
    expect(ogMultiplier(b, link, carock, false, WEAPONS.kokiriSword, 1)).toBeCloseTo(0.1);
    z.abilities.push('spellReflect');
    castAbility(b, z, 'spellReflect', rng());
    expect(ogMultiplier(b, carock, z, true, WEAPONS.carockBolt, 3)).toBe(0);
    carock.weapons = ['carockBolt'];
    const hp = carock.hp;
    const hits = aolAfterCombat(b, carock, z, null, { atk: 0, def: 0 });
    expect(hits[0]?.uid).toBe(carock.uid);
    expect(hp - carock.hp).toBeGreaterThan(10);
  });

  it('Spell turns ordinary enemies into Bots for 2 turns', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule', 'l', 10), 2, 4);
    link.mp = 30;
    const geru = place(b, foe('geru', 'g1'), 3, 4, 'enemy');
    expect(castAbility(b, link, 'spellSpell', rng())).not.toBeNull();
    expect(geru.templateId).toBe('bot');
    b.turn = 3;
    startPhase(b, 'enemy');
    expect(geru.templateId).not.toBe('bot');
    expect(geru.name).toBe('Geru');
  });

  it('Downward Thrust leaps past Horsehead\'s armor and bounces; Upward Thrust hits fliers harder', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    link.abilities.push('downwardThrust', 'upwardThrust');
    const hh = place(b, makeEnemy(BOSSES.horsehead, 'parapaPalace', 5, 'hh', rng()), 4, 4, 'enemy');
    expect(ogMultiplier(b, link, hh, false, WEAPONS.kokiriSword, 1)).toBe(0.5);
    expect(ogMultiplier(b, link, hh, false, WEAPONS.kokiriSword, 1, ABILITIES.downwardThrust)).toBe(1);
    expect(attackMods(link, WEAPONS.kokiriSword).map((a) => a.id)).toEqual(expect.arrayContaining(['downwardThrust', 'upwardThrust']));
    // Surrounded, he can't keep his armor facing everyone.
    place(b, hero('hyruleKnight'), 6, 4);
    expect(ogMultiplier(b, link, hh, false, WEAPONS.kokiriSword, 1)).toBe(0.5);
    place(b, hero('oldMan'), 4, 6);
    expect(ogMultiplier(b, link, hh, false, WEAPONS.kokiriSword, 1)).toBe(1);
    const moby = place(b, foe('moby'), 2, 2, 'enemy');
    expect(ogMultiplier(b, link, moby, false, WEAPONS.kokiriSword, 1, ABILITIES.upwardThrust)).toBe(1.5);
    // Bounce: a second enemy next to the target takes half.
    const b2 = field();
    const l2 = place(b2, hero('heroOfHyrule', 'l2'), 3, 4);
    const t1 = place(b2, foe('myu', 'm1'), 4, 4, 'enemy');
    const t2 = place(b2, foe('bot', 'b2'), 4, 5, 'enemy');
    const hp2 = t2.hp;
    aolAfterCombat(b2, l2, t1, 'downwardThrust', { atk: 8, def: 0 });
    expect(t2.hp).toBe(hp2 - 4);
  });
});

describe('Zelda II monsters and guardians', () => {
  it('Myu spikes melee attackers; Wosu drains MP; Geru guards when it hasn\'t moved; Guma ignores 25% DEF', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    const myu = place(b, foe('myu'), 4, 4, 'enemy');
    const hp = link.hp;
    aolAfterCombat(b, link, myu, null, { atk: 12, def: 0 });
    expect(link.hp).toBe(hp - 3);
    const wosu = place(b, foe('wosu'), 3, 5, 'enemy');
    link.mp = 10;
    for (let i = 0; i < 20 && link.mp === 10; i++) resolveCombat(b, wosu, link, new RNG(i));
    expect(link.mp).toBeLessThan(10);
    const guma = place(b, foe('guma'), 6, 6, 'enemy');
    expect(aolDefense(guma, link, WEAPONS.gumaMace, undefined, 12, false)).toBe(9);
  });

  it('Gooma\'s Crushing Momentum ignores more DEF with every blow on the same target', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 3, 4);
    const g = place(b, makeEnemy(BOSSES.gooma, 'palaceOnTheSea', 5, 'gm', rng()), 4, 3, 'enemy');
    g.aolMomentum = { uid: link.uid, n: 2 };
    expect(aolDefense(g, link, WEAPONS.ballAndChain, undefined, 16, false)).toBe(12);
    g.aolMomentum = { uid: link.uid, n: 9 };
    expect(aolDefense(g, link, WEAPONS.ballAndChain, undefined, 16, false)).toBe(8);
  });

  it('Helmethead sheds Floating Helmets at 75% and 50% HP; Rebonack dismounts below 40%', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 2, 4);
    const hh = place(b, makeEnemy(BOSSES.helmethead, 'midoroPalace', 5, 'hm', rng()), 6, 4, 'enemy');
    hh.hp = Math.floor(hh.stats.hp * 0.7);
    aolAfterCombat(b, link, hh, null, { atk: 1, def: 0 });
    expect(b.units.filter((u) => u.artId === 'floatingHelmet' && u.summoned).length).toBe(1);
    hh.hp = Math.floor(hh.stats.hp * 0.45);
    aolAfterCombat(b, link, hh, null, { atk: 1, def: 0 });
    expect(b.units.filter((u) => u.artId === 'floatingHelmet' && u.summoned).length).toBe(2);
    const rb = place(b, makeEnemy(BOSSES.rebonack, 'islandPalace', 5, 'rb', rng()), 9, 1, 'enemy');
    expect(rb.size).toBe(2);
    const spd = forecast(b, rb, rb, link).attacker;
    rb.hp = Math.floor(rb.stats.hp * 0.35);
    aolAfterCombat(b, link, rb, null, { atk: 1, def: 0 });
    expect(rb.size).toBe(1);
    expect(rb.buffs.find((x) => x.id === 'dismounted')?.stats).toEqual({ spd: 4, skl: 4 });
    void spd;
  });

  it('Moa is invisible like Ganon; detection and the Cross reveal it', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 1, 4);
    const moa = place(b, foe('moa'), 9, 4, 'enemy');
    startPhase(b, 'enemy');
    expect(moa.hidden).toBe(true);
    link.x = 7;
    ogAfterMove(b, link);
    expect(moa.hidden).toBe(false);
    startPhase(b, 'enemy');
    expect(moa.hidden).toBe(true);
    link.gear.acc1 = 'cross';
    ogStartPhase(b, link, []);
    expect(moa.hidden).toBe(false);
  });

  it('Deelers and Geldarms ambush from hiding; Bits leap through enemies', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 1, 4);
    const deeler = place(b, foe('deeler'), 5, 4, 'enemy');
    startPhase(b, 'player');
    b.og = undefined;
    // Battle start hides the ambushers.
    deeler.hidden = true;
    const hp = link.hp;
    link.x = 4;
    ogAfterMove(b, link);
    expect(deeler.hidden).toBe(false);
    expect(link.hp).toBeLessThan(hp);
    const bit = place(b, foe('bit'), 8, 1, 'enemy');
    place(b, hero('oldMan', 'om'), 8, 2);
    const reach = computeMoves(b, bit).reach;
    expect(reach.has(keyOf(b, 8, 3))).toBe(true);
  });

  it('when Thunderbird falls in the Great Palace, Link\'s Shadow stands up and the fight goes on', () => {
    const b = field(16, 12, 'greatPalace');
    b.objective = { type: 'boss' };
    const link = place(b, hero('heroOfHyrule'), 1, 1);
    const tb = place(b, makeEnemy(BOSSES.thunderbird, 'greatPalace', 5, 'tb', rng(), { boss: true }), 8, 4, 'enemy');
    ogOnKill(b, link, tb, rng(), 50, undefined, undefined);
    b.units = b.units.filter((u) => u !== tb);
    b.fallen.push(tb);
    expect(checkResult(b)).toBeUndefined();
    const shadow = b.units.find((u) => u.bossId === 'darkLink')!;
    expect(shadow.isBoss).toBe(true);
    b.units = b.units.filter((u) => u !== shadow);
    b.fallen.push(shadow);
    expect(checkResult(b)).toBe('won');
  });
});

describe('the Sleeping Princess', () => {
  it('Sleeping Curse, Dream Protection, Ancient Blessing and Courage\'s Awakening', () => {
    const b = field();
    const z = place(b, hero('sleepingZelda'), 2, 4);
    const link = place(b, hero('heroOfHyrule'), 3, 5);
    const e = place(b, foe('geru'), 4, 4, 'enemy');
    castAbility(b, z, 'sleepingCurse', rng(), e.uid);
    expect(e.statuses.some((s) => s.kind === 'sleep')).toBe(true);
    addStatus(link, 'poison', 3);
    castAbility(b, z, 'dreamProtection', rng(), link.uid);
    expect(link.statuses.some((s) => s.kind === 'poison')).toBe(false);
    addStatus(link, 'confuse', 2);
    expect(link.statuses.length).toBe(0);
    link.mp = 0;
    castAbility(b, z, 'ancientBlessing', rng(), link.uid);
    expect(link.mp).toBeGreaterThan(0);
    // A fallen ally rises.
    b.units = b.units.filter((u) => u !== link);
    link.hp = 0;
    b.fallen.push(link);
    z.mp = 50;
    expect(unusableReason(b, z, ABILITIES.couragesAwakening)).toBeNull();
    castAbility(b, z, 'couragesAwakening', rng());
    expect(b.units).toContain(link);
    expect(link.hp).toBe(Math.ceil(link.stats.hp * 0.25));
    expect(unusableReason(b, z, ABILITIES.couragesAwakening)).not.toBeNull();
  });

  it('Awakening: recovering from a negative status restores 20% HP and MP', () => {
    const b = field();
    const z = place(b, hero('sleepingZelda'), 2, 4);
    z.hp = 5; z.mp = 0;
    addStatus(z, 'poison', 1);
    ogStartPhase(b, z, []);
    z.statuses = [];
    ogStartPhase(b, z, []);
    expect(z.hp).toBe(5 + Math.ceil(z.stats.hp * 0.2));
    expect(z.mp).toBe(Math.ceil(z.stats.mp * 0.2));
  });

  it('the Link Doll stops a fatal blow', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule', 'l', 1), 3, 4);
    link.hp = 1;
    link.pack.push({ id: 'linkDoll', uses: 1 });
    const bot = place(b, foe('bot', 'bt', 1), 4, 4, 'enemy');
    for (let i = 0; i < 30 && link.pack.some((p) => p.id === 'linkDoll'); i++) resolveCombat(b, bot, link, new RNG(i));
    expect(link.hp).toBeGreaterThan(0);
    expect(link.pack.some((p) => p.id === 'linkDoll')).toBe(false);
    link.pack.push({ id: 'experienceBag', uses: 1 });
    const xp = link.xp + link.level * 100;
    expect(useItem(b, link, link.pack.findIndex((p) => p.id === 'experienceBag'), rng())).not.toBeNull();
    expect(link.xp + link.level * 100).toBe(xp + 60);
  });
});

describe('palace spaces', () => {
  it('narrow passages, collapsing floors, falling blocks, elevators and the River Devil', () => {
    const b = field();
    const link = place(b, hero('heroOfHyrule'), 2, 4);
    const guma = place(b, foe('guma'), 8, 1, 'enemy');
    expect(tileCost(b, link, 'narrowPassage')).toBe(1);
    expect(tileCost(b, guma, 'narrowPassage')).toBeGreaterThan(50);
    b.tiles[keyOf(b, 3, 4)] = 'collapsingFloor';
    link.x = 3;
    ogAfterMove(b, link);
    link.x = 2;
    b.turn = 2;
    aolRound(b);
    expect(b.tiles[keyOf(b, 3, 4)]).toBe('ladderGap');
    b.tiles[keyOf(b, 2, 4)] = 'fallingBlock';
    const hp = link.hp;
    aolRound(b);
    expect(link.hp).toBe(hp - 8);
    b.tiles[keyOf(b, 2, 4)] = 'elevator';
    b.tiles[keyOf(b, 10, 7)] = 'elevator';
    expect(unusableReason(b, link, ABILITIES.rideElevator)).toBeNull();
    castAbility(b, link, 'rideElevator', rng(), undefined, { x: 10, y: 7 });
    expect([link.x, link.y]).toEqual([10, 7]);
    b.tiles[keyOf(b, 5, 5)] = 'riverDevil';
    expect(tileCost(b, link, 'riverDevil')).toBeGreaterThan(50);
    link.gear.acc1 = 'recorder';
    link.mp = 10;
    castAbility(b, link, 'playRecorder', rng(), undefined, { x: 10, y: 7 });
    expect(b.tiles[keyOf(b, 5, 5)]).toBe('water');
  });
});

describe('the Zelda II chapter', () => {
  it('after Death Mountain the campaign goes on to North Castle and the palaces in order', () => {
    const run = newRun(30, 'heroOfHyrule') as RunWithEvent;
    run.region = 'level9DeathMountain';
    run.original!.fragments.push('level9DeathMountain');
    expect(originalRegionOptions(run)).toEqual(['northCastle']);
    run.region = 'northCastle';
    expect(inOriginalLevels(run)).toBe(true);
    run.act = 12;
    expect(isFreeForAll(run)).toBe(false);
    expect(originalRegionOptions(run)).toEqual(['parapaPalace', 'z2Towns']);
    const boss = run.map.nodes.find((n) => n.type === 'boss')!;
    for (const [p, id] of [['parapaPalace', 'horsehead'], ['midoroPalace', 'helmethead'], ['islandPalace', 'rebonack'], ['mazeIslandPalace', 'carock'], ['palaceOnTheSea', 'gooma'], ['threeEyeRockPalace', 'volvagia'], ['greatPalace', 'thunderbird']])
      expect(originalBossFor(run, { ...boss, world: p })?.id).toBe(id);
  });

  it('a Palace Crystal levels up whoever stands by the statue; six open the Valley of Death and the Great Palace', () => {
    const run = newRun(31, 'sleepingZelda') as RunWithEvent;
    expect(run.region).toBe('northCastle');
    const knight = run.roster.find((u) => u.templateId === 'hyruleKnight')!;
    for (const [i, p] of PALACES.entries()) {
      const b = field(14, 9, p);
      b.nodeType = 'boss';
      b.tiles[keyOf(b, 6, 4)] = 'palaceStatue';
      if (i === 0) { const k = place(b, { ...knight }, 5, 4); k.uid = knight.uid; }
      const before = knight.level;
      originalAfterBattle(run, b, true, rng());
      if (i === 0) expect(knight.level).toBe(before + 1);
      run.region = p;
      if (i < 5) expect(originalRegionOptions(run)[0]).toBe(PALACES[i + 1]);
    }
    expect(crystalsHeld(run)).toBe(6);
    expect(run.convoy).toContain('magicBoots');
    expect(originalRegionOptions(run)).toEqual(['valleyOfDeath']);
    run.region = 'valleyOfDeath';
    expect(originalRegionOptions(run)).toEqual(['greatPalace']);
    const gp = field(14, 9, 'greatPalace');
    gp.nodeType = 'boss';
    originalAfterBattle(run, gp, true, rng());
    expect(run.convoy).toContain('triforceCourage');
    run.region = 'greatPalace';
    expect(originalRegionOptions(run)).toEqual([]);
    expect(inOriginalLevels(run)).toBe(false);
  });

  it('the Sleeping Princess plays her first battle at North Castle; the Old Men\'s events teach spells', () => {
    const run = newRun(32, 'sleepingZelda') as RunWithEvent;
    const node = availableNodes(run)[0];
    enterNode(run, node.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    expect(run.battle?.world).toBe('northCastle');
    run.battle!.result = 'won';
    expect(finishBattle(run).won).toBe(true);
    // Rauru's Old Man.
    run.event = { type: 'event', eventId: 'z2OldManRauru' };
    run.rupees = 500;
    const res = chooseEvent(run, 0);
    expect(res?.lines.join(' ')).toContain('Shield');
    expect(EVENTS.z2SleepingPrincess.regions).toEqual(['northCastle']);
  });
});
