// Using consumables from a unit's pack during battle.

import { ITEMS } from '../data/registry';
import { useFairy, type LevelUp } from './combat';
import { footDist, inBounds, tilesInRange } from './grid';
import type { RNG } from './rng';
import { addStatus } from './status';
import { gainXp } from './units';
import type { Battle, ItemDef, Pos, Unit } from './types';

export interface ItemResult {
  item: ItemDef;
  heals: { uid: string; amount: number }[];
  hits: { uid: string; dmg: number; hp: number; killed: boolean; saved?: 'fairy' }[];
  stunned: string[];
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
  if (def.kind === 'learn') return false; // learned from the unit screen, outside battle
  return true;
}

export function isTargeted(def: ItemDef): boolean {
  return def.kind === 'bomb' || def.kind === 'stun';
}

/** Tiles a targeted item can be thrown at. */
export function targetTiles(b: Battle, u: Unit, def: ItemDef): Pos[] {
  if (!isTargeted(def)) return [];
  return tilesInRange(b, u, def.minRange ?? 1, def.maxRange ?? 1, u.size);
}

/** Enemies caught in the blast around a target tile. */
export function blastVictims(b: Battle, u: Unit, def: ItemDef, at: Pos): Unit[] {
  const r = def.radius ?? 0;
  return b.units.filter((e) => e.team !== u.team && footDist(at.x, at.y, 1, e.x, e.y, e.size) <= r);
}

function consume(u: Unit, index: number) {
  const slot = u.pack[index];
  slot.uses--;
  if (slot.uses <= 0) u.pack.splice(index, 1);
}

/** Use the item in `index` (targeted items need `at`). Mutates the battle. */
export function useItem(b: Battle, u: Unit, index: number, rng: RNG, at?: Pos): ItemResult | null {
  const slot = u.pack[index];
  const def = slot && ITEMS[slot.id];
  if (!def || !canUse(u, index)) return null;
  if (isTargeted(def) && (!at || !inBounds(b, at.x, at.y) || !targetTiles(b, u, def).some((t) => t.x === at.x && t.y === at.y))) return null;

  const res: ItemResult = { item: def, heals: [], hits: [], stunned: [], levelUps: [] };
  let xp = 0;
  if (def.kind === 'heal' || def.kind === 'fullHeal') {
    const amount = Math.min(def.kind === 'fullHeal' ? u.stats.hp : def.power, u.stats.hp - u.hp);
    u.hp += amount;
    if (def.kind === 'fullHeal') u.mp = u.stats.mp;
    res.heals.push({ uid: u.uid, amount });
    xp = 5;
  } else if (def.kind === 'mp') {
    const amount = Math.min(def.power, u.stats.mp - u.mp);
    u.mp += amount;
    res.mp = amount;
    xp = 5;
  } else if (def.kind === 'bomb') {
    for (const e of blastVictims(b, u, def, at!)) {
      const dmg = Math.min(def.power, e.hp);
      e.hp -= dmg;
      let saved: 'fairy' | undefined;
      if (e.hp <= 0 && useFairy(e)) saved = 'fairy';
      const killed = e.hp <= 0;
      res.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, saved });
      xp += 8 + (killed ? 20 : 0);
      if (killed) {
        u.kills++;
        b.units = b.units.filter((x) => x !== e);
        b.fallen.push(e);
        b.log.push(`${u.name}'s ${def.name} defeated ${e.name}.`);
      }
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
