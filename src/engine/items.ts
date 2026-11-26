// Using consumables from a unit's pack during battle.

import { useTwilightItem } from './twilight';
import { useSkywardItem } from './skyward';
import { useWildItem, wildCanUseItem, wildItemReaction } from './wild';
import { ogCanUseItem, ogHealItemMult, ogOnBlast, ogQuickItem, useOriginalItem } from './original';
import { ITEMS, TEMPLATES } from '../data/registry';
import { useFairy, type LevelUp } from './combat';
import { footDist, inBounds, tilesInRange } from './grid';
import type { RNG } from './rng';
import { addStatus, NEGATIVE_STATUSES } from './status';
import { blastTerrain, canDig, canFish, dig, fish, ignite, plantBean, revealNearby, thawMechanisms } from './field';
import { reinforceTile } from './army';
import { keyOf } from './grid';
import { effectiveStats, gainXp, makeHero, prepareForBattle, unitTags } from './units';
import { damageComponent, isVessel, repairComponent } from './naval';
import { WEAPONS } from '../data/registry';
import type { Battle, ItemDef, Pos, StatusKind, Unit } from './types';

export interface ItemResult {
  item: ItemDef;
  heals: { uid: string; amount: number }[];
  hits: { uid: string; dmg: number; hp: number; killed: boolean; saved?: 'fairy' }[];
  stunned: string[];
  statuses: { uid: string; kind: StatusKind }[];
  /** Extra log lines (finds, cures, terrain changes). */
  lines: string[];
  /** Free action: the unit can still act. */
  free?: boolean;
  mp?: number;
  levelUps: LevelUp[];
}

/** Can this pack slot be used right now? (Fairies work automatically; heals need missing HP.) */
export function canUse(u: Unit, index: number): boolean {
  const def = ITEMS[u.pack[index]?.id];
  if (!def || def.kind === 'fairy') return false;
  // Skyward Sword's Cursed Medal: the wearer can't use their pack.
  if (u.gear?.acc1 === 'cursedMedal' || u.gear?.acc2 === 'cursedMedal') return false;
  if (def.id === 'adventurePouch') return false; // used outside battle
  if (def.kind === 'heal') return u.hp < u.stats.hp;
  if (def.kind === 'fullHeal') return u.hp < u.stats.hp || u.mp < u.stats.mp;
  if (def.kind === 'mp') return u.mp < u.stats.mp;
  if (def.kind === 'sta') return u.sta < u.stats.sta;
  if (def.kind === 'learn') return false; // learned from the unit screen, outside battle
  if (def.kind === 'cure') return u.statuses.some((st) => curable(def).includes(st.kind));
  if (def.minCon && u.race !== 'goron' && effectiveStats(u).con < def.minCon) return false;
  if (def.id === 'strayFairy' || def.id === 'goldDust') return false; // used at fountains / outside battle
  return true;
}

function curable(def: ItemDef): StatusKind[] {
  return def.cures === 'negative' ? NEGATIVE_STATUSES : def.cures ?? [];
}

/** In battle: can this item be used here and now? (Adds tool and terrain checks.) */
export function canUseHere(b: Battle, u: Unit, index: number): boolean {
  const def = ITEMS[u.pack[index]?.id];
  if (!def || !canUse(u, index)) return false;
  // The Silent Realm: no fighting, not even with bombs.
  if (b.ss?.trial && u.team === 'player' && (['bomb', 'fruit', 'stun', 'muddle'].includes(def.kind) || (def.kind === 'special' && def.targeted))) return false;
  if (def.kind === 'tool') {
    if (def.tool === 'lens') return u.mp >= 1 && !u.buffs.some((x) => x.id === 'lens');
    if (def.tool === 'fishing') return canFish(b, u);
    if (def.tool === 'shovel') return canDig(b, u);
  }
  const wl = wildCanUseItem(b, u, def.id);
  if (wl !== undefined && !wl) return false;
  if (def.id === 'twinmoldWingFragment' && u.movedDist > 0) return false;
  if ((def.id === 'cannonball' || def.id === 'chainShot') && !isVessel(u)) return false;
  if (def.id === 'cannonball') return u.weapons.some((w) => WEAPONS[w]?.type === 'siege' && (u.wear?.[w] ?? 0) > 0);
  if (def.id === 'seahatRotor' || def.id === 'helmarocFeather') return u.movedDist === 0;
  if (def.id === 'giantsHorn') return !!giantReserve(b);
  const og = ogCanUseItem(b, u, def.id);
  if (og !== undefined) return og;
  if (isTargeted(def)) return targetTiles(b, u, def).length > 0;
  return true;
}

/** A benched Giant that the Giant's Horn can call in. */
function giantReserve(b: Battle): Unit | undefined {
  return (b.reserves ?? []).find((r) => (r.race === 'giant' || (r.baseSize ?? r.size) >= 5) && reinforceTile(b, r));
}

export function isTargeted(def: ItemDef): boolean {
  return ['bomb', 'stun', 'fruit', 'cloud', 'muddle', 'bean'].includes(def.kind) || (def.kind === 'special' && !!def.targeted) || def.tool === 'pictograph';
}

/** Tiles a targeted item can be thrown at. */
export function targetTiles(b: Battle, u: Unit, def: ItemDef): Pos[] {
  if (!isTargeted(def)) return [];
  const tiles = tilesInRange(b, u, def.minRange ?? 1, def.maxRange ?? 1, u.size);
  if (def.tool === 'pictograph') return tiles.filter((p) => b.units.some((e) => e.team !== u.team && footDist(p.x, p.y, 1, e.x, e.y, e.size) === 0));
  if (def.id === 'chainShot') return tiles.filter((p) => b.units.some((e) => e.team !== u.team && isVessel(e) && footDist(p.x, p.y, 1, e.x, e.y, e.size) === 0));
  if (def.id === 'repairPlanks') {
    const ok = (e: Unit) => e.team === u.team && (isVessel(e) || unitTags(e).includes('wood') || unitTags(e).includes('stone')) && (e.hp < e.stats.hp || !!e.damaged && Object.keys(e.damaged).length > 0);
    return [...tiles, { x: u.x, y: u.y }].filter((p) => b.units.some((e) => ok(e) && footDist(p.x, p.y, 1, e.x, e.y, e.size) === 0));
  }
  if (def.id === 'puppetStringBundle') return tiles.filter((p) => b.units.some((e) => e.team !== u.team && footDist(p.x, p.y, 1, e.x, e.y, e.size) === 0));
  if (def.id === 'magtailShell' || def.id === 'molgeraSandSac') return tiles.filter((p) => b.tiles[keyOf(b, p.x, p.y)] === 'plain' && !b.units.some((x) => footDist(p.x, p.y, 1, x.x, x.y, x.size) === 0));
  if (def.id === 'dekuFlowerSeed' || def.id === 'bioDekuBabaSeed' || def.id === 'deathArmosCore' || def.id === 'bokoBabaSeed' || def.id === 'bokoBabaPod') {
    return tiles.filter((p) => ['plain', 'forest'].includes(b.tiles[keyOf(b, p.x, p.y)]) && !b.units.some((x) => footDist(p.x, p.y, 1, x.x, x.y, x.size) === 0));
  }
  if (def.kind === 'bean') {
    return tiles.filter((p) => ['plain', 'water', 'lava', 'forest'].includes(b.tiles[keyOf(b, p.x, p.y)])
      && !b.units.some((x) => footDist(p.x, p.y, 1, x.x, x.y, x.size) === 0) && !(b.sprouts ?? []).some((sp) => sp.x === p.x && sp.y === p.y));
  }
  return tiles;
}

/** Enemies caught in the blast around a target tile. */
export function blastVictims(b: Battle, u: Unit, def: ItemDef, at: Pos): Unit[] {
  const r = def.radius ?? 0;
  const friendly = def.kind === 'cloud';
  return b.units.filter((e) => (friendly ? e.team === u.team : e.team !== u.team && !e.captive) && footDist(at.x, at.y, 1, e.x, e.y, e.size) <= r);
}

function consume(u: Unit, index: number) {
  const slot = u.pack[index];
  if (ITEMS[slot.id]?.kind === 'tool') return; // tools are never used up
  slot.uses--;
  if (slot.uses <= 0) u.pack.splice(index, 1);
}

/** Use the item in `index` (targeted items need `at`). Mutates the battle. */
export function useItem(b: Battle, u: Unit, index: number, rng: RNG, at?: Pos): ItemResult | null {
  const slot = u.pack[index];
  const def = slot && ITEMS[slot.id];
  if (!def || !canUseHere(b, u, index)) return null;
  if (isTargeted(def) && (!at || !inBounds(b, at.x, at.y) || !targetTiles(b, u, def).some((t) => t.x === at.x && t.y === at.y))) return null;

  const res: ItemResult = { item: def, heals: [], hits: [], stunned: [], statuses: [], lines: [], levelUps: [] };
  let xp = 0;
  if (def.kind === 'heal' || def.kind === 'fullHeal') {
    const amount = Math.min(def.kind === 'fullHeal' ? u.stats.hp : Math.ceil(def.power * ogHealItemMult(b, u)), u.stats.hp - u.hp);
    u.hp += amount;
    if (def.kind === 'fullHeal') u.mp = u.stats.mp;
    res.heals.push({ uid: u.uid, amount });
    xp = 5;
  } else if (def.kind === 'sta') {
    u.sta = Math.min(u.stats.sta, u.sta + def.power);
    xp = 5;
  } else if (def.kind === 'mp') {
    const amount = Math.min(def.power, u.stats.mp - u.mp);
    u.mp += amount;
    res.mp = amount;
    xp = 5;
  } else if (def.kind === 'special') {
    xp = 5;
    useSpecial(b, u, def, rng, res, at);
  } else if (def.kind === 'bomb' || def.kind === 'fruit') {
    let broken = 0;
    if (def.kind === 'bomb') {
      broken = blastTerrain(b, at!, def.radius ?? 0, def.breaksWalls);
      if (broken) res.lines.push(`The blast breaks ${broken} cracked wall${broken > 1 ? 's' : ''}!`);
    }
    if (def.kind === 'bomb') res.lines.push(...ogOnBlast(b, at!, def.radius ?? 0, broken, blastVictims(b, u, def, at!), def.power, rng));
    if (def.element === 'fire') {
      const tiles: Pos[] = [];
      const r = def.radius ?? 0;
      for (let y = at!.y - r; y <= at!.y + r; y++) for (let x = at!.x - r; x <= at!.x + r; x++) if (Math.abs(x - at!.x) + Math.abs(y - at!.y) <= r) tiles.push({ x, y });
      ignite(b, tiles);
    }
    for (const e of blastVictims(b, u, def, at!)) {
      const dmg = Math.min(def.power, e.hp);
      e.hp -= dmg;
      let saved: 'fairy' | undefined;
      if (e.hp <= 0 && useFairy(e)) saved = 'fairy';
      const killed = e.hp <= 0;
      res.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, saved });
      if (!killed && def.status && (def.kind !== 'fruit' || def.status === 'freeze' || rng.chance(60))) {
        addStatus(e, def.status, def.statusTurns ?? 2);
        res.statuses.push({ uid: e.uid, kind: def.status });
      }
      if (e.hidden) e.hidden = false;
      xp += 8 + (killed ? 20 : 0);
      if (killed) {
        u.kills++;
        b.units = b.units.filter((x) => x !== e);
        b.fallen.push(e);
        b.log.push(`${u.name}'s ${def.name} defeated ${e.name}.`);
      }
    }
  } else if (def.kind === 'cure') {
    const kinds = curable(def);
    const before = u.statuses.length;
    u.statuses = u.statuses.filter((st) => !kinds.includes(st.kind));
    res.lines.push(`${u.name} is cured (${before - u.statuses.length} status${before - u.statuses.length > 1 ? 'es' : ''}).`);
    xp = 5;
  } else if (def.kind === 'buff') {
    u.buffs = u.buffs.filter((x) => x.id !== def.id);
    u.buffs.push({ id: def.id, name: def.name, turns: def.buffTurns ?? 3, stats: def.buff });
    res.lines.push(`${u.name} feels powerful!`);
    xp = 5;
  } else if (def.kind === 'cloud' || def.kind === 'muddle') {
    for (const e of blastVictims(b, u, def, at!)) {
      addStatus(e, def.status!, def.statusTurns ?? 2);
      res.statuses.push({ uid: e.uid, kind: def.status! });
      xp += 5;
    }
  } else if (def.kind === 'bean') {
    plantBean(b, at!);
    res.lines.push('A Magic Bean is planted. It will sprout in 2 turns.');
    xp = 5;
  } else if (def.kind === 'tool') {
    if (def.tool === 'lens') {
      u.mp -= 1;
      u.buffs.push({ id: 'lens', name: 'Lens of Truth', turns: 1 });
      const found = revealNearby(b);
      res.lines.push(found.length ? `The Lens of Truth reveals: ${found.join(', ')}!` : 'The Lens of Truth shows nothing hidden nearby.');
      res.free = true;
    } else if (def.tool === 'fishing') {
      const got = fish(b, rng);
      res.lines.push(got.item ? `Caught something: ${ITEMS[got.item].name}!` : got.rupees ? `Fished up ₹${got.rupees}!` : 'Nothing bites.');
      xp = 4;
    } else if (def.tool === 'shovel') {
      const got = dig(b, u, rng);
      res.lines.push(got.item ? `Buried treasure: ${ITEMS[got.item].name}!` : got.rupees ? `Dug up ₹${got.rupees}.` : 'Just dirt.');
      xp = 4;
    } else if (def.tool === 'pictograph') {
      const e = b.units.find((x) => x.team !== u.team && footDist(at!.x, at!.y, 1, x.x, x.y, x.size) === 0);
      if (e) {
        e.hidden = false;
        addStatus(e, 'exposed', 2);
        res.statuses.push({ uid: e.uid, kind: 'exposed' });
        res.lines.push(`Snap! ${e.name}'s weak points are recorded (Exposed for 2 turns).`);
      }
      xp = 4;
    }
  } else if (def.kind === 'stun') {
    for (const e of blastVictims(b, u, def, at!)) {
      addStatus(e, 'stun', 1);
      res.stunned.push(e.uid);
      xp += 6;
    }
  }
  if (at && (def.kind === 'fruit' || def.kind === 'cloud')) res.lines.push(...wildItemReaction(b, u, def.id, at));
  // Link's Quick Item: once per battle, an item costs no action.
  if (!res.free && ogQuickItem(u)) { res.free = true; res.lines.push(`${u.name} uses it in a flash (Quick Item).`); }
  consume(u, index);
  if (u.team === 'player' && xp) {
    for (const gains of gainXp(u, Math.min(60, xp), rng)) res.levelUps.push({ uid: u.uid, name: u.name, level: u.level, gains });
  }
  return res;
}

/** Majora's Mask and Wind Waker items. */
function useSpecial(b: Battle, u: Unit, def: ItemDef, rng: RNG, res: ItemResult, at?: Pos) {
  const tpTarget = at ? b.units.find((e) => footDist(at.x, at.y, 1, e.x, e.y, e.size) === 0) : undefined;
  const tpLine = useTwilightItem(b, u, def.id, rng, tpTarget, at);
  if (tpLine !== null) { res.lines.push(tpLine); return; }
  const ssLine = useSkywardItem(b, u, def.id, rng, tpTarget, at);
  if (ssLine !== null) { res.lines.push(ssLine); return; }
  const wildLine = useWildItem(b, u, def.id, rng, tpTarget, at);
  if (wildLine !== null) { res.lines.push(wildLine); return; }
  const ogLine = useOriginalItem(b, u, def.id, rng, tpTarget, at);
  if (ogLine !== null) { res.lines.push(ogLine); return; }
  const allies = b.units.filter((a) => a.team === u.team);
  const at0 = at ?? { x: u.x, y: u.y };
  const unitOn = (p: Pos) => b.units.find((e) => footDist(p.x, p.y, 1, e.x, e.y, e.size) === 0);
  const plant = (lvl: number) => {
    if (!TEMPLATES.bokoBaba) return;
    const sprout = prepareForBattle(makeHero('bokoBaba', `baba${b.uidCounter++}`, Math.max(1, lvl), rng));
    Object.assign(sprout, { x: at0.x, y: at0.y, team: u.team, npc: u.team === 'player', summoned: true, ai: 'stationary', moved: true, acted: true });
    b.units.push(sprout);
    res.lines.push('A Boko Baba sprouts and snaps at anything nearby.');
  };
  switch (def.id) {
    // ── Wind Waker ──
    case 'bokoBabaSeed': plant(u.level - 1); return;
    case 'bokoBabaPod': plant(u.level); return;
    case 'allPurposeBait':
      for (const e of b.units) {
        if (e.team === u.team || e.isBoss || footDist(at0.x, at0.y, 1, e.x, e.y, e.size) > 2 || !unitTags(e).includes('beast')) continue;
        addStatus(e, 'confuse', 1);
        res.statuses.push({ uid: e.uid, kind: 'confuse' });
      }
      res.lines.push('The bait lures the beasts in.');
      return;
    case 'hyoiPear':
      b.fog = false;
      for (const e of b.units) e.hidden = false;
      for (const t of b.traps ?? []) t.hidden = false;
      res.lines.push('A seagull soars over the battlefield: nothing stays hidden.');
      res.free = true;
      return;
    case 'elixirSoup': {
      const amt = u.stats.hp - u.hp;
      u.hp = u.stats.hp;
      u.mp = u.stats.mp;
      res.heals.push({ uid: u.uid, amount: amt });
      u.buffs = u.buffs.filter((x) => x.id !== 'elixir');
      u.buffs.push({ id: 'elixir', name: 'Elixir Soup (next hit ×2)', turns: 5 });
      res.lines.push(`${u.name} drinks Grandma's Elixir Soup!`);
      return;
    }
    case 'forestWater':
      for (const a of allies) {
        if (footDist(a.x, a.y, a.size, u.x, u.y, u.size) > 3 || !unitTags(a).includes('plant')) continue;
        res.heals.push({ uid: a.uid, amount: a.stats.hp - a.hp });
        a.hp = a.stats.hp;
      }
      for (const p of tilesInRange(b, u, 1, 1, u.size)) if (b.tiles[keyOf(b, p.x, p.y)] === 'plain' && !unitOn(p)) b.tiles[keyOf(b, p.x, p.y)] = 'forest';
      res.lines.push('Forest Water revives the green.');
      return;
    case 'morthCluster':
      for (const e of b.units) {
        if (e.team === u.team || footDist(at0.x, at0.y, 1, e.x, e.y, e.size) > (def.radius ?? 1)) continue;
        addStatus(e, 'weaken', 2);
        e.buffs.push({ id: 'clung', name: 'Morths', turns: 2, stats: { mov: -2 } });
        res.statuses.push({ uid: e.uid, kind: 'weaken' });
      }
      return;
    case 'magtailShell':
      b.tiles[keyOf(b, at0.x, at0.y)] = 'wall';
      res.lines.push('The Magtail shell curls into a heavy block.');
      return;
    case 'kalleDemosVine':
      for (const e of b.units) {
        if (e.team === u.team || footDist(e.x, e.y, e.size, u.x, u.y, u.size) > 2) continue;
        addStatus(e, 'root', 2);
        res.statuses.push({ uid: e.uid, kind: 'root' });
      }
      return;
    case 'seahatRotor':
      u.buffs.push({ id: 'wing', name: 'Seahat Rotor', turns: 1, stats: { mov: 2 } });
      res.free = true;
      return;
    case 'helmarocFeather':
      u.buffs.push({ id: 'wing', name: 'Helmaroc Feather', turns: 1, stats: { mov: 4 } });
      res.free = true;
      return;
    case 'molgeraSandSac':
      for (const p of [at0, ...tilesInRange(b, at0 as Unit, 1, 1, 1)]) if (b.tiles[keyOf(b, p.x, p.y)] === 'plain') b.tiles[keyOf(b, p.x, p.y)] = 'sandVortex';
      res.lines.push('The ground turns to sinking sand.');
      return;
    case 'jalhallaSpiritFlame':
      for (const e of b.units) {
        if (e.team === u.team) continue;
        const d = footDist(e.x, e.y, e.size, u.x, u.y, u.size);
        if (d <= 5) e.hidden = false;
        if (d <= 3 && unitTags(e).includes('undead')) { addStatus(e, 'weaken', 2); addStatus(e, 'exposed', 2); res.statuses.push({ uid: e.uid, kind: 'exposed' }); }
      }
      return;
    case 'puppetStringBundle': {
      const e = unitOn(at0);
      if (e) { addStatus(e, 'root', 2); res.statuses.push({ uid: e.uid, kind: 'root' }); }
      return;
    }
    case 'cannonball':
      for (const w of u.weapons) if (WEAPONS[w]?.type === 'siege' && u.wear?.[w]) u.wear[w] = Math.max(0, u.wear[w] - 10);
      res.lines.push(`${u.name}'s cannons are reloaded.`);
      return;
    case 'chainShot': {
      const e = unitOn(at0);
      if (e && damageComponent(e, rng, 'sail')) res.lines.push(`Chain shot shreds the ${e.name}'s sail!`);
      else if (e) res.lines.push(`The ${e.name}'s sail holds.`);
      return;
    }
    case 'repairPlanks': {
      const e = unitOn(at0);
      if (!e) return;
      const amt = Math.min(20, e.stats.hp - e.hp);
      e.hp += amt;
      res.heals.push({ uid: e.uid, amount: amt });
      const c = repairComponent(e);
      res.lines.push(`The ${e.name} is patched up${c ? ` (${c} repaired)` : ''}.`);
      return;
    }
    case 'tingleBottle': {
      const roll = rng.int(0, 2);
      if (roll === 0) { b.bonusRupees = (b.bonusRupees ?? 0) + 150; res.lines.push('"Kooloo-limpah!" A bag of ₹150 floats back.'); }
      else if (roll === 1) { (b.loot ??= []).push(rng.pick(['redPotion', 'bluePotion', 'repairPlanks', 'cannonball'])); res.lines.push('A crate of supplies washes up.'); }
      else { for (const e of b.units) e.hidden = false; b.fog = false; res.lines.push('Tingle sends a map of the battlefield!'); }
      return;
    }
    case 'chateauRomani':
      u.buffs.push({ id: 'chateau', name: 'Chateau Romani', turns: 3 });
      res.lines.push(`${u.name} drinks Chateau Romani: magic costs nothing for 3 turns!`);
      break;
    case 'mysteryMilk': {
      const hp = rng.int(5, 20), mp = rng.int(0, 10), sta = rng.int(0, 10);
      const healed = Math.min(hp, u.stats.hp - u.hp);
      u.hp += healed;
      u.mp = Math.min(u.stats.mp, u.mp + mp);
      u.sta = Math.min(u.stats.sta, u.sta + sta);
      res.heals.push({ uid: u.uid, amount: healed });
      res.lines.push(`Mystery Milk: +${healed} HP, +${mp} MP, +${sta} stamina.`);
      break;
    }
    case 'seahorse':
      u.buffs.push({ id: 'seahorse', name: 'Seahorse Guide', turns: 3 });
      res.lines.push(`The seahorse guides ${u.name} through the water for 3 turns.`);
      break;
    case 'hotSpringWater': {
      for (const a of b.units) if (footDist(at!.x, at!.y, 1, a.x, a.y, a.size) <= 1) a.statuses = a.statuses.filter((st) => st.kind !== 'freeze');
      const n = thawMechanisms(b, { x: at!.x, y: at!.y, size: 1 }, 1);
      res.lines.push(n ? `The hot water thaws ${n} frozen mechanism${n > 1 ? 's' : ''}.` : 'Steam rises: the ice melts away.');
      break;
    }
    case 'dekuFlowerSeed':
      b.tiles[keyOf(b, at!.x, at!.y)] = 'dekuFlower';
      res.lines.push('A Deku Flower blooms. Deku standing on it can glide.');
      break;
    case 'bioDekuBabaSeed': {
      if (!TEMPLATES.bioDekuBaba) break;
      const sprout = prepareForBattle(makeHero('bioDekuBaba', `baba${b.uidCounter++}`, Math.max(1, u.level), rng));
      Object.assign(sprout, { x: at!.x, y: at!.y, team: u.team, npc: true, summoned: true, ai: 'stationary', moved: true, acted: true });
      b.units.push(sprout);
      res.lines.push('A Bio Deku Baba sprouts and snaps at anything nearby.');
      break;
    }
    case 'wartBubbleCluster': {
      const near = allies.filter((a) => footDist(a.x, a.y, a.size, u.x, u.y, u.size) <= 2).sort((a, c) => (a === u ? -1 : c === u ? 1 : 0)).slice(0, 3);
      for (const a of near) { a.buffs = a.buffs.filter((x) => x.id !== 'bubble'); a.buffs.push({ id: 'bubble', name: 'Bubble', turns: 3 }); }
      res.lines.push(`Protective bubbles surround ${near.map((a) => a.name).join(', ')}.`);
      break;
    }
    case 'gomessBatSwarm':
      for (const e of b.units) {
        if (e.team === u.team || footDist(at!.x, at!.y, 1, e.x, e.y, e.size) > 1) continue;
        addStatus(e, 'blind', 2);
        res.statuses.push({ uid: e.uid, kind: 'blind' });
      }
      break;
    case 'deathArmosCore':
      (b.traps ??= []).push({ x: at!.x, y: at!.y, hidden: false, armed: true });
      res.lines.push('An armed Death Armos Core waits for the enemy.');
      break;
    case 'garoSpiritDust':
      addStatus(u, 'veiled', 2);
      res.lines.push(`${u.name} vanishes into the shadows.`);
      break;
    case 'twinmoldWingFragment':
      u.buffs.push({ id: 'wing', name: 'Twinmold Wing', turns: 1, stats: { mov: 1 } });
      res.lines.push(`${u.name} takes flight!`);
      res.free = true;
      break;
    case 'giantsHorn': {
      const g = giantReserve(b)!;
      const p = reinforceTile(b, g)!;
      b.reserves = b.reserves!.filter((x) => x !== g);
      Object.assign(g, { x: p.x, y: p.y, moved: false, acted: false });
      b.units.push(g);
      res.lines.push(`The Giant's Horn sounds… ${g.name} answers the call!`);
      break;
    }
  }
}
