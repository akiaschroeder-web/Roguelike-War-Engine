// Using consumables from a unit's pack during battle.

import { ITEMS } from '../data/registry';
import { useFairy, type LevelUp } from './combat';
import { footDist, inBounds, tilesInRange } from './grid';
import type { RNG } from './rng';
import { addStatus, NEGATIVE_STATUSES } from './status';
import { blastTerrain, canDig, canFish, dig, fish, ignite, plantBean, revealNearby } from './field';
import { keyOf } from './grid';
import { gainXp } from './units';
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
  if (def.kind === 'heal') return u.hp < u.stats.hp;
  if (def.kind === 'fullHeal') return u.hp < u.stats.hp || u.mp < u.stats.mp;
  if (def.kind === 'mp') return u.mp < u.stats.mp;
  if (def.kind === 'sta') return u.sta < u.stats.sta;
  if (def.kind === 'learn') return false; // learned from the unit screen, outside battle
  if (def.kind === 'cure') return u.statuses.some((st) => curable(def).includes(st.kind));
  return true;
}

function curable(def: ItemDef): StatusKind[] {
  return def.cures === 'negative' ? NEGATIVE_STATUSES : def.cures ?? [];
}

/** In battle: can this item be used here and now? (Adds tool and terrain checks.) */
export function canUseHere(b: Battle, u: Unit, index: number): boolean {
  const def = ITEMS[u.pack[index]?.id];
  if (!def || !canUse(u, index)) return false;
  if (def.kind === 'tool') {
    if (def.tool === 'lens') return u.mp >= 1 && !u.buffs.some((x) => x.id === 'lens');
    if (def.tool === 'fishing') return canFish(b, u);
    if (def.tool === 'shovel') return canDig(b, u);
  }
  if (isTargeted(def)) return targetTiles(b, u, def).length > 0;
  return true;
}

export function isTargeted(def: ItemDef): boolean {
  return ['bomb', 'stun', 'fruit', 'cloud', 'muddle', 'bean'].includes(def.kind);
}

/** Tiles a targeted item can be thrown at. */
export function targetTiles(b: Battle, u: Unit, def: ItemDef): Pos[] {
  if (!isTargeted(def)) return [];
  const tiles = tilesInRange(b, u, def.minRange ?? 1, def.maxRange ?? 1, u.size);
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
    const amount = Math.min(def.kind === 'fullHeal' ? u.stats.hp : def.power, u.stats.hp - u.hp);
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
  } else if (def.kind === 'bomb' || def.kind === 'fruit') {
    if (def.kind === 'bomb') {
      const broken = blastTerrain(b, at!, def.radius ?? 0);
      if (broken) res.lines.push(`The blast breaks ${broken} cracked wall${broken > 1 ? 's' : ''}!`);
    }
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
    }
  } else if (def.kind === 'stun') {
    for (const e of blastVictims(b, u, def, at!)) {
      addStatus(e, 'stun', 1);
      res.stunned.push(e.uid);
      xp += 6;
    }
  }
  consume(u, index);
  if (u.team === 'player' && xp) {
    for (const gains of gainXp(u, Math.min(60, xp), rng)) res.levelUps.push({ uid: u.uid, name: u.name, level: u.level, gains });
  }
  return res;
}
