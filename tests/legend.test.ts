import { describe, expect, it } from 'vitest';
import { ABILITIES, ART_VARIANTS, BOSS_AS_TEMPLATE, BOSSES, COMMANDERS, ENEMIES, EVENTS, GEAR, ITEMS, QUEST_ITEMS, REGION_BOSSES, ROSTERS, TEMPLATES, WEAPONS, WORLDS, artFor, gearArt, unitArt } from '../src/data/registry';
import { ERA_OF_LEGEND, LEGEND_REGION_IDS, NIGHTMARE_FORMS, RING_IDS, ROUTE_BOSSES, SIREN_INSTRUMENTS } from '../src/content/legend';
import { abilityCost, castAbility, unusableReason } from '../src/engine/abilities';
import { checkResult } from '../src/engine/battle';
import { forecast } from '../src/engine/combat';
import { tileCost } from '../src/engine/grid';
import { activeGear, makeEnemy, makeHero, prepareForBattle } from '../src/engine/units';
import {
  adventuresOf, crossWorlds, legendBattleStart, lgAfterHit, lgMultiplier, lgSaveFromDeath, lgSeedReady, lgState, lgTileCost, setSeason, shiftEra,
} from '../src/engine/legend';
import { applyLegendEffect, legendAfterBattle, legendBattleSetup, legendOf, legendRegionOptions, legendStartRegion } from '../src/engine/legendRun';
import { RNG } from '../src/engine/rng';
import { availableNodes, enterNode, newRun, offerRegions, startBattle, type RunWithEvent } from '../src/engine/run';
import type { Battle, Terrain, Unit } from '../src/engine/types';

const rng = () => new RNG(11);

function field(w = 14, h = 9, world = 'horonVillage'): Battle {
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
const foe = (id: string, uid = id, lvl = 3) => makeEnemy(ENEMIES[id] ?? BOSSES[id], 'horonVillage', lvl, uid, rng());

const CAST = ['heroOfLegend', 'zeldaLegend', 'ganonLegend', 'linksUncle', 'sahasrahla', 'aginah', 'syrup', 'fluteBoy', 'agahnim', 'marin', 'tarin', 'bowwow', 'flyingRooster', 'windFish',
  'din', 'nayru', 'farore', 'ralph', 'impaOracle', 'queenAmbi', 'makuTreeHolodrum', 'makuTreeLabrynna', 'ricky', 'dimitri', 'moosh'];
const MONSTERS = ['antiFairy', 'buzzBlob', 'cukeman', 'subterror', 'smasher', 'wizzrobe', 'bossWizzrobe', 'meteoWizzrobe', 'thunderWizzrobe', 'blizzrobe'];
const NEW_BOSSES = ['helmasaurKing', 'arrghus', 'blind', 'kholdstare', 'vitreous', 'trinexx', 'genie', 'slimeEye', 'anglerFish', 'slimeEel', 'facade', 'evilEagle', 'hotHead', 'shadowNightmare',
  'medusaHead', 'onox', 'pumpkinHead', 'headThwomp', 'shadowHag', 'eyesoar', 'smog', 'octogon', 'ramrock', 'veran'];
const FORMS = ['nayruPossessed', 'onoxDragon', 'veranFairy', 'veranTurtle', 'veranSpider', 'veranBee'];

describe('Era of Legend content', () => {
  it('registers the cast, the monsters, the Wizzrobe family, 24 bosses and the forms (all with art) with the doc\'s stats', () => {
    for (const id of [...CAST, ...MONSTERS, ...NEW_BOSSES, ...FORMS]) {
      expect(TEMPLATES[id], id).toBeDefined();
      expect(artFor(id), id).not.toBeNull();
    }
    expect(TEMPLATES.heroOfLegend.stats).toEqual({ hp: 32, str: 15, mag: 9, skl: 15, spd: 13, def: 10, res: 8, lck: 14, con: 10, mov: 6, sta: 32, mp: 24 });
    expect(TEMPLATES.ganonLegend.stats).toMatchObject({ hp: 90, str: 28, mag: 28, con: 32, mp: 65 });
    expect(TEMPLATES.ganonLegend.size).toBe(3);
    expect(TEMPLATES.windFish.size).toBe(5);
    expect(TEMPLATES.makuTreeHolodrum.stats.mov).toBe(0);
    expect(BOSSES.trinexx.stats).toMatchObject({ hp: 110, str: 27, mag: 29, def: 25, res: 26 });
    expect(BOSSES.veran.stats).toMatchObject({ hp: 45, mag: 32, res: 28, mp: 75 });
    expect(TEMPLATES.smasher.size).toBe(2);
    // Boss Wizzrobe: stronger than a Wizzrobe, weaker than Agahnim.
    const power = (id: string) => { const s = (ENEMIES[id]?.stats ?? TEMPLATES[id].stats) as Record<string, number>; return s.hp + s.mag * 2 + s.res; };
    expect(power('bossWizzrobe')).toBeGreaterThan(power('wizzrobe'));
    expect(power('bossWizzrobe')).toBeLessThan(power('agahnim'));
    for (const id of ['meteoWizzrobe', 'thunderWizzrobe', 'blizzrobe']) expect(power(id)).toBeGreaterThan(power('wizzrobe'));
    expect(WEAPONS.meteoFlame.element).toBe('fire');
    expect(WEAPONS.thunderBolt.element).toBe('lightning');
    expect(WEAPONS.blizzardBolt.element).toBe('ice');
    // Forms share progression and are never recruited on their own.
    for (const id of FORMS) expect(TEMPLATES[id].formOf, id).toBeDefined();
    expect(TEMPLATES.nayruPossessed.formOf).toBe('nayru');
    expect(TEMPLATES.onoxDragon.formOf).toBe('onox');
    expect(BOSS_AS_TEMPLATE.ganonLegendBoss).toBe('ganonLegend');
    expect(BOSS_AS_TEMPLATE.agahnimBoss).toBe('agahnim');
  });

  it('uses the fixed art ids: variants, aliases and the Nightmare\'s forms', () => {
    expect(ART_VARIANTS.zeldaLegend).toEqual(['zeldaLegend', 'zeldaLegend2']);
    expect(ART_VARIANTS.wizzrobe).toEqual(['wizzrobe', 'wizzrobeWW']);
    expect(ART_VARIANTS.bossWizzrobe).toEqual(['bossWizzrobe', 'bossWizzrobeWW']);
    for (const id of ['octorokALTTP', 'octorokWW', 'octorokSS', 'octorokBotW']) expect(ART_VARIANTS.octorok).toContain(id);
    expect(ART_VARIANTS.octorok[0]).toBe('octorok');
    expect(artFor('shadowNightmare')).toBe('shadowNightmareAll');
    expect(artFor('smog')).toBe('smog');
    for (const f of NIGHTMARE_FORMS) expect(artFor(f.art), f.art).not.toBeNull();
    expect(artFor('bunnyLink')).toBe('bunnyLink');
  });

  it('has the equipment catalog: rings (Oracle-specific where the name is taken), medallions, pendants, instruments, seeds and quest items', () => {
    expect(RING_IDS.length).toBeGreaterThanOrEqual(60);
    // The Original Hyrule Blue and Red Rings stay; the Oracle rings are functionally different.
    expect(GEAR.blueRing.desc).toMatch(/25%/);
    expect(GEAR.blueRingOracle.lg).toContain('damage50');
    expect(GEAR.redRingOracle.lg).toContain('physical200');
    for (const id of ['bombosMedallion', 'etherMedallion', 'quakeMedallion', 'pendantOfCourage', 'pendantOfWisdom', 'pendantOfPower', 'moonPearl', 'magicMirror', 'rocsFeather', 'rocsCape', 'mermaidSuit',
      'rickysFlute', 'dimitrisFlute', 'mooshsFlute', 'magicCape', 'titansMitt', 'powerBraceletL2']) expect(GEAR[id], id).toBeDefined();
    for (const id of ['fightersSword', 'temperedSword', 'goldenSword', 'koholintSword', 'nobleSword', 'rodOfSeasons', 'harpOfAges', 'seedShooter', 'hyperSlingshot', 'switchHook', 'longHook',
      'caneOfSomaria', 'caneOfByrna', 'magicHammer', ...SIREN_INSTRUMENTS]) expect(WEAPONS[id], id).toBeDefined();
    for (const id of ['superBomb', 'magicPowder', 'secretMedicine', 'guardianAcorn', 'pieceOfPower', 'gashaSeed', 'gashaNut', 'makuSeed', 'emberSeed', 'scentSeed', 'pegasusSeed', 'galeSeed', 'mysterySeed', 'strangeFlute'])
      expect(ITEMS[id], id).toBeDefined();
    for (const id of ['crystalMaiden', 'essenceOfNature', 'essenceOfTime', 'mysteryRing', 'ringBox', 'seedSatchelOracle', 'hugeSeedSatchel', 'tradeLA_YoshiDoll', 'tradeOoS_Phonograph', 'tradeOoA_BrokenSword'])
      expect(QUEST_ITEMS[id], id).toBeDefined();
    for (const id of ['vasuRingShop', 'gashaTree', 'syrupsHut', 'owlStatue', 'tradingLA', 'tradingOoS', 'tradingOoA', 'animalCompanions']) expect(EVENTS[id], id).toBeDefined();
  });

  it('has 23 regions in campaign legend with rosters and bosses, 10 commanders, and Wizzrobes in older rosters', () => {
    expect(LEGEND_REGION_IDS.length).toBe(23);
    for (const r of LEGEND_REGION_IDS) {
      expect(WORLDS[r]?.campaign, r).toBe('legend');
      expect(ROSTERS[r]?.length, r).toBeGreaterThan(0);
      expect(REGION_BOSSES[r]?.length, r).toBeGreaterThan(0);
      for (const id of ROUTE_BOSSES[r]) expect(BOSSES[id], id).toBeDefined();
    }
    const cmd = COMMANDERS.filter((c) => c.campaign === 'legend');
    expect(cmd.map((c) => c.heroId).sort()).toEqual(['agahnim', 'din', 'farore', 'ganonLegend', 'heroOfLegend', 'marin', 'nayru', 'onox', 'veran', 'zeldaLegend'].sort());
    expect(cmd.find((c) => c.heroId === 'agahnim')!.units).toContain('wizzrobe');
    for (const r of ['greatPalace', 'level9DeathMountain', 'towerOfTheGods', 'hyruleCastle']) expect(ROSTERS[r], r).toContain('wizzrobe');
    expect(ERA_OF_LEGEND.supportPairs).toEqual([]);
  });
});

describe("Link's equipment-dependent art", () => {
  it('follows the equipped weapon and worn gear, over the variant pick', () => {
    const link = hero('heroOfLegend');
    expect(TEMPLATES.heroOfLegend.artByGear?.length).toBe(3);
    expect(unitArt(link)).toBe('heroOfLegend');
    expect(gearArt(link)).toBeNull();
    link.weapons = ['rodOfSeasons', ...link.weapons];
    expect(unitArt(link)).toBe('heroOfLegendRod');
    link.weapons = ['harpOfAges', ...link.weapons.slice(1)];
    expect(unitArt(link)).toBe('heroOfLegendHarp');
    link.weapons = ['koholintSword', ...link.weapons.slice(1)];
    expect(unitArt(link)).toBe('heroOfLegendJump');
    link.weapons = ['fightersSword'];
    link.gear.acc1 = 'rocsCape';
    expect(unitArt(link)).toBe('heroOfLegendJump');
    link.artPick = 'heroOfLegend';
    expect(unitArt(link)).toBe('heroOfLegendJump');
    link.artOverride = 'bunnyLink';
    expect(unitArt(link)).toBe('bunnyLink');
    // Zelda's two arts are ordinary variants.
    const z = hero('zeldaLegend');
    z.artPick = 'zeldaLegend2';
    expect(unitArt(z)).toBe('zeldaLegend2');
  });
});

describe('Era of Legend mechanics', () => {
  it('Four Adventures: +1 SKL and LCK per game represented by the carried tools', () => {
    const link = hero('heroOfLegend');
    link.weapons = ['fightersSword', 'rodOfSeasons', 'harpOfAges'];
    link.gear.acc1 = 'rocsFeather';
    expect(adventuresOf(link)).toBe(4);
    const b = field();
    const l = place(b, link, 2, 2);
    legendBattleStart(b);
    expect(l.buffs.find((x) => x.id === 'fourAdventures')?.stats).toEqual({ skl: 4, lck: 4 });
  });

  it('seasons change the field for both armies; the Rod needs a Tree Stump, Din does not', () => {
    const b = field();
    b.tiles[20] = 'water';
    b.tiles[21] = 'seasonalSnowbank';
    const link = place(b, hero('heroOfLegend'), 2, 4);
    const moblin = place(b, foe('moblin'), 10, 4, 'enemy');
    setSeason(b, 'winter');
    expect(b.tiles[20]).toBe('frozenWater');
    expect(tileCost(b, link, 'seasonalSnowbank')).toBe(1);
    expect(tileCost(b, moblin, 'seasonalSnowbank')).toBe(1);
    setSeason(b, 'summer');
    expect(b.tiles[20]).toBe('plain');
    expect(lgTileCost(b, link, 'seasonalSnowbank', 1)).toBeGreaterThan(10);
    link.weapons = ['rodOfSeasons', ...link.weapons];
    expect(unusableReason(b, link, ABILITIES.changeSeason)).toMatch(/Tree Stump/);
    b.tiles[4 * 14 + 3] = 'treeStump';
    expect(unusableReason(b, link, ABILITIES.changeSeason)).toBeNull();
    castAbility(b, link, 'changeSeason', rng());
    expect(b.lg?.season).toBe('autumn');
    const din = place(b, hero('din'), 5, 1);
    castAbility(b, din, 'changeSeasonDin', rng());
    expect(b.lg?.season).toBe('winter');
  });

  it('Light and Dark Worlds: the field swaps, rabbits without the Moon Pearl, the Mirror brings it back', () => {
    const b = field(14, 9, 'darkWorld');
    const st = lgState(b);
    st.world = 'light';
    st.alt = b.tiles.map((_, i) => (i % 14 === 7 ? 'water' : 'plain'));
    const link = place(b, hero('heroOfLegend'), 2, 2);
    const zelda = place(b, hero('zeldaLegend'), 3, 2);
    zelda.gear.acc1 = 'moonPearl';
    const moblin = place(b, foe('moblin'), 10, 2, 'enemy');
    crossWorlds(b, rng());
    expect(st.world).toBe('dark');
    expect(b.tiles[7]).toBe('water');
    expect(link.buffs.some((x) => x.id === 'bunny')).toBe(true);
    expect(link.artOverride).toBe('bunnyLink');
    expect(unitArt(link)).toBe('bunnyLink');
    expect(zelda.buffs.some((x) => x.id === 'bunny')).toBe(false);
    expect(moblin.buffs.some((x) => x.id === 'bunny')).toBe(false);
    expect(forecast(b, link, link, moblin).attacker.canAttack).toBe(false);
    link.gear.acc2 = 'magicMirror';
    expect(unusableReason(b, link, ABILITIES.magicMirrorWarp)).toBeNull();
    castAbility(b, link, 'magicMirrorWarp', rng());
    expect(st.world).toBe('light');
    expect(link.buffs.some((x) => x.id === 'bunny')).toBe(false);
    expect(link.artOverride).toBeUndefined();
  });

  it('past and present: what changes in the past changes the present', () => {
    const b = field(14, 9, 'lynnaCity');
    const st = lgState(b);
    st.era = 'present';
    st.eraAlt = b.tiles.map((t, i) => (i === 30 ? 'softSoil' : t));
    st.pastStart = [...st.eraAlt];
    b.tiles[30] = 'wall';
    shiftEra(b);
    expect(st.era).toBe('past');
    expect(b.tiles[30]).toBe('softSoil');
    b.tiles[30] = 'forest'; // a seed planted in the past
    shiftEra(b);
    expect(st.era).toBe('present');
    expect(b.tiles[30]).toBe('forest');
  });

  it('the Shadow Nightmare goes through its six forms before it falls', () => {
    const b = field(14, 9, 'windFishsEgg');
    const sn = place(b, makeEnemy(BOSSES.shadowNightmare, 'windFishsEgg', 10, 'sn', rng(), { boss: true }), 8, 3, 'enemy');
    legendBattleStart(b);
    expect(sn.lgForm).toBe(0);
    expect(unitArt(sn)).toBe('nightmareGel');
    const seen = [unitArt(sn)];
    for (let i = 1; i < 6; i++) { expect(lgSaveFromDeath(b, sn)).not.toBeNull(); seen.push(unitArt(sn)); }
    expect(seen).toEqual(['nightmareGel', 'nightmareAgahnim', 'moldorm', 'nightmareGanon', 'lanmola', 'nightmareDethI']);
    expect(lgSaveFromDeath(b, sn)).toBeNull();
  });

  it('Possessed Nayru gives way to Veran, then her monster forms; Onox becomes the Dark Dragon', () => {
    const b = field(16, 10, 'blackTower');
    const pn = place(b, makeEnemy(BOSSES.nayruPossessed, 'blackTower', 10, 'pn', rng(), { boss: true }), 6, 3, 'enemy');
    const chain: string[] = [];
    for (let i = 0; i < 4; i++) { expect(lgSaveFromDeath(b, pn), String(i)).not.toBeNull(); chain.push(pn.templateId!); }
    expect(chain).toEqual(['veran', 'veranTurtle', 'veranSpider', 'veranBee']);
    expect(pn.isBoss).toBe(true);
    expect(lgSaveFromDeath(b, pn)).toBeNull();
    const onox = place(b, makeEnemy(BOSSES.onox, 'templeOfSeasons', 10, 'onox', rng(), { boss: true }), 1, 1, 'enemy');
    onox.hp = Math.floor(onox.stats.hp / 3);
    expect(unusableReason(b, onox, ABILITIES.onoxTransform)).toBeNull();
    castAbility(b, onox, 'onoxTransform', rng());
    expect(onox.templateId).toBe('onoxDragon');
    expect(onox.size).toBe(4);
  });

  it('boss gimmicks: Helmasaur\'s mask, Genie\'s bottle, Kholdstare\'s shell, Arrghus\'s Arrgi', () => {
    const b = field(16, 10, 'darkWorld');
    const link = place(b, hero('heroOfLegend'), 2, 2);
    const hk = place(b, makeEnemy(BOSSES.helmasaurKing, 'darkWorld', 8, 'hk', rng(), { boss: true }), 3, 2, 'enemy');
    const genie = place(b, makeEnemy(BOSSES.genie, 'mabeVillage', 8, 'ge', rng(), { boss: true }), 10, 2, 'enemy');
    const kh = place(b, makeEnemy(BOSSES.kholdstare, 'darkWorld', 8, 'kh', rng(), { boss: true }), 10, 6, 'enemy');
    const ar = place(b, makeEnemy(BOSSES.arrghus, 'darkWorld', 8, 'ar', rng(), { boss: true }), 2, 6, 'enemy');
    legendBattleStart(b);
    const sword = WEAPONS.fightersSword, hammer = WEAPONS.magicHammer;
    expect(lgMultiplier(b, link, hk, false, sword, 1)).toBeCloseTo(0.25);
    expect(lgMultiplier(b, link, hk, false, hammer, 1)).toBe(1);
    for (let i = 0; i < 3; i++) lgAfterHit(b, link, hk, 5, hammer);
    expect(hk.lgMaskBroken).toBe(true);
    expect(lgMultiplier(b, link, hk, false, sword, 1)).toBe(1);
    expect(lgMultiplier(b, link, genie, false, sword, 1)).toBe(0);
    lgAfterHit(b, link, genie, 0, hammer);
    expect(lgMultiplier(b, link, genie, false, sword, 1)).toBe(1);
    expect(lgMultiplier(b, link, kh, false, sword, 1)).toBeCloseTo(0.2);
    const before = b.units.length;
    lgAfterHit(b, link, kh, 5, WEAPONS.fireRod, 'fire');
    expect(kh.lgShell).toBe(false);
    expect(b.units.length).toBe(before + 2); // split into three bodies
    expect(ar.lgGuards).toBe(6);
    expect(lgMultiplier(b, link, ar, false, sword, 1)).toBeCloseTo(0.3);
    lgAfterHit(b, link, ar, 3, WEAPONS.hookshot);
    expect(ar.lgGuards).toBe(4);
  });

  it('identical rings don\'t stack; the Oracle Blue Ring halves damage', () => {
    const link = hero('heroOfLegend');
    link.gear.acc1 = 'powerRingL1';
    link.gear.acc2 = 'powerRingL1';
    expect(activeGear(link).filter((g) => g.id === 'powerRingL1').length).toBe(1);
    const b = field();
    const l = place(b, link, 2, 2);
    const m = place(b, foe('moblin'), 3, 2, 'enemy');
    m.gear.acc1 = 'blueRingOracle';
    expect(lgMultiplier(b, l, m, false, WEAPONS.fightersSword, 1)).toBeCloseTo(0.5);
  });

  it('seed ammunition needs a seed weapon and seeds in the satchel, and uses them up', () => {
    const b = field();
    const st = lgState(b);
    const link = place(b, hero('heroOfLegend'), 2, 2);
    link.weapons = ['seedShooter', 'fightersSword'];
    const m = place(b, foe('moblin'), 5, 2, 'enemy');
    expect(lgSeedReady(b, link, WEAPONS.seedShooter, ABILITIES.emberShot)).toBe(false);
    st.seeds.ember = 2;
    expect(lgSeedReady(b, link, WEAPONS.seedShooter, ABILITIES.emberShot)).toBe(true);
    expect(lgSeedReady(b, link, WEAPONS.fairySlingshot, ABILITIES.emberShot)).toBe(false);
    const fc = forecast(b, link, link, m, 'seedShooter', 'emberShot');
    expect(fc.attacker.arrowId).toBe('emberShot');
    expect(fc.attacker.element).toBe('fire');
  });

  it('Legendary Adaptability makes tool abilities cheaper', () => {
    const b = field();
    const link = place(b, hero('heroOfLegend'), 2, 2);
    link.gear.acc1 = 'bombosMedallion';
    const z = place(b, hero('zeldaLegend'), 4, 4);
    z.gear.acc1 = 'bombosMedallion';
    expect(abilityCost(link, ABILITIES.bombos, b)).toBe(16);
    expect(abilityCost(z, ABILITIES.bombos, b)).toBe(20);
  });
});

describe('the Era of Legend campaign', () => {
  it('starts in each commander\'s game and gives a Seed Satchel', () => {
    expect(legendStartRegion({ commanderId: 'heroOfLegend', regionsVisited: [] })).toBe('hyruleCastleLttP');
    expect(legendStartRegion({ commanderId: 'marin', regionsVisited: [] })).toBe('mabeVillage');
    expect(legendStartRegion({ commanderId: 'din', regionsVisited: [] })).toBe('horonVillage');
    expect(legendStartRegion({ commanderId: 'nayru', regionsVisited: [] })).toBe('lynnaCity');
    const run = newRun(3, 'din', 'legend');
    expect(run.region).toBe('horonVillage');
    expect(run.questItems).toContain('seedSatchelOracle');
    expect(legendOf(run).seeds.ember).toBe(10);
  });

  it('routes, gates, the linked Oracle continuation and the Room of Rites', () => {
    const run = newRun(4, 'din', 'legend');
    const lg = legendOf(run);
    run.region = 'tarmRuins';
    // Fewer than eight Essences of Nature: go back for the missing ones.
    lg.beaten.push('aquamentus', 'dodongoBoss');
    expect(legendRegionOptions(run)).not.toContain('templeOfSeasons');
    for (let i = 0; i < 8; i++) run.questItems!.push('essenceOfNature');
    expect(legendRegionOptions(run)).toEqual(['templeOfSeasons']);
    run.region = 'templeOfSeasons';
    lg.done.push('oos');
    expect(legendRegionOptions(run)).toEqual(['lynnaCity']);
    run.region = 'blackTower';
    lg.done.push('ooa');
    expect(legendRegionOptions(run)).toEqual(['roomOfRites']);
    run.region = 'darkWorld';
    expect(legendRegionOptions(run)).toEqual(['darkWorld']);
    for (let i = 0; i < 7; i++) run.questItems!.push('crystalMaiden');
    expect(legendRegionOptions(run)).toEqual(['ganonsTowerLttP']);
    run.event = undefined;
    offerRegions(run as RunWithEvent);
    expect((run.event as { options: string[] } | undefined)?.options).toEqual(['ganonsTowerLttP']);
  });

  it('a paired boss fight brings both bosses (after the first region), and both must fall', () => {
    const run = newRun(5, 'din', 'legend') as RunWithEvent;
    run.act = 2;
    const boss = run.map.nodes.find((n) => n.type === 'boss')!;
    for (const n of run.map.nodes) n.visited = n !== boss;
    run.currentNodeId = run.map.nodes.find((n) => n.next.includes(boss.id))!.id;
    expect(availableNodes(run).map((n) => n.id)).toContain(boss.id);
    enterNode(run, boss.id);
    if (run.event?.type === 'deploy') startBattle(run, run.roster.map((u) => u.uid));
    const b = run.battle!;
    const bosses = b.units.filter((u) => u.isBoss && u.team === 'enemy').map((u) => u.bossId);
    expect(bosses).toContain('aquamentus');
    expect(bosses).toContain('dodongoBoss');
    expect(b.lg?.allBosses).toBe(true);
    // One boss down is not enough.
    const first = b.units.find((u) => u.bossId === 'aquamentus')!;
    b.units = b.units.filter((u) => u !== first);
    b.fallen.push(first);
    expect(checkResult(b)).toBeUndefined();
    legendBattleSetup(run, b, rng());
  });

  it('rings, Gasha trees and trading sequences', () => {
    const run = newRun(6, 'heroOfLegend', 'legend');
    run.questItems!.push('mysteryRing');
    const before = run.convoy.length;
    expect(applyLegendEffect(run, { kind: 'legend', op: 'appraise' }, rng())).toMatch(/Vasu/);
    expect(run.convoy.length).toBe(before + 1);
    expect(RING_IDS).toContain(run.convoy[run.convoy.length - 1]);
    run.convoy.push('gashaSeed');
    applyLegendEffect(run, { kind: 'legend', op: 'plantGasha' }, rng());
    expect(legendOf(run).gasha).toEqual([1]);
    const b = field(14, 9, 'hyruleCastleLttP');
    b.result = 'won';
    b.nodeType = 'boss';
    for (let i = 0; i < 3; i++) legendAfterBattle(run, b, true, rng());
    expect(legendOf(run).gasha.length).toBe(0); // ripe and harvested
    expect(applyLegendEffect(run, { kind: 'legend', op: 'trade', id: 'la' }, rng())).toMatch(/Yoshi Doll/);
    expect(run.questItems).toContain('tradeLA_YoshiDoll');
    expect(applyLegendEffect(run, { kind: 'legend', op: 'trade', id: 'la' }, rng())).toMatch(/Ribbon/);
    expect(run.questItems).not.toContain('tradeLA_YoshiDoll');
  });
});
