// Army-wide progression and resources: army level, supplies, materials,
// morale, reputation, Fairy Dust, Sacred Energy, and commander orders.

import { anchorCost, footprint, unitAt, unitDist } from './grid';
import { INF } from './rules';
import { addStatus } from './status';
import type { Army, Battle, OrderId, Pos, Run, Unit } from './types';

export function newArmy(): Army {
  return { level: 1, xp: 0, supplies: 30, materials: 10, morale: 60, reputation: 10, fairyDust: 0, sacredEnergy: 0 };
}

export function armyOf(run: Run): Army {
  return (run.army ??= newArmy());
}

export const xpToNext = (level: number) => 60 + level * 40;

/** Army capacity grows from 12 to 16 with army level. */
export function armyCap(run: Run): number {
  return Math.min(16, 12 + Math.floor((armyOf(run).level - 1) / 2) + (run.metaBonus?.armyCap ?? 0));
}

/** Deployment capacity grows from 8 to 10. */
export function deployCap(run: Run): number {
  return Math.min(10, 8 + Math.floor((armyOf(run).level - 1) / 3));
}

export function supplyCap(run: Run): number {
  return 30 + armyOf(run).level * 5;
}

export function cpMax(run: Run): number {
  return Math.min(8, 3 + Math.floor(armyOf(run).level / 2) + (run.metaBonus?.cp ?? 0));
}

/** Gain army experience; returns the number of army level-ups. */
export function gainArmyXp(run: Run, amount: number): number {
  const a = armyOf(run);
  a.xp += amount;
  let ups = 0;
  while (a.xp >= xpToNext(a.level)) {
    a.xp -= xpToNext(a.level);
    a.level++;
    ups++;
  }
  return ups;
}

export function adjustMorale(run: Run, d: number) {
  const a = armyOf(run);
  a.morale = Math.max(0, Math.min(100, a.morale + d));
}

export function adjustReputation(run: Run, d: number) {
  const a = armyOf(run);
  a.reputation = Math.max(0, Math.min(100, a.reputation + d));
}

/** Hit/Avoid bonus from morale: −10 at 0, +10 at 100. */
export function moraleBonus(morale: number | undefined): number {
  if (morale === undefined) return 0;
  return Math.round((morale - 50) / 5);
}

/** Shop discount from reputation (up to 15%). */
export function repDiscount(run: Run): number {
  return Math.min(15, Math.floor(armyOf(run).reputation / 6));
}

export function moraleLabel(m: number): string {
  return m >= 85 ? 'Fired up' : m >= 65 ? 'High' : m >= 40 ? 'Steady' : m >= 20 ? 'Low' : 'Breaking';
}

// ───────────────────────── Orders ─────────────────────────

export interface OrderDef {
  id: OrderId;
  name: string;
  cp: number;
  desc: string;
  /** Needs a target: an ally, an enemy, a reserve unit (picked from a list) or nothing. */
  target?: 'ally' | 'enemy' | 'reserve';
}

export const ORDERS: Record<OrderId, OrderDef> = {
  rally: { id: 'rally', name: 'Rally', cp: 2, desc: 'Allies within 3 of the Commander become Inspired (+10 Hit/Avoid, +2 damage) for 2 turns.' },
  forcedMarch: { id: 'forcedMarch', name: 'Forced March', cp: 2, desc: 'Every ally who hasn’t moved yet is Hasted (+2 MOV, +2 SPD) this turn.' },
  defensiveFormation: { id: 'defensiveFormation', name: 'Defensive Formation', cp: 2, desc: 'All allies are Protected (+3 DEF/RES) for 2 turns.' },
  focusFire: { id: 'focusFire', name: 'Focus Fire', cp: 1, target: 'enemy', desc: 'Mark an enemy: it is Exposed (−3 DEF/RES) for 2 turns.' },
  emergencyRetreat: { id: 'emergencyRetreat', name: 'Emergency Retreat', cp: 2, target: 'ally', desc: 'Pull an ally (not the Commander) out of the battle. They survive and rest.' },
  reinforce: { id: 'reinforce', name: 'Reinforce', cp: 3, target: 'reserve', desc: 'Bring a benched unit onto the field near the left edge.' },
  holdTheLine: { id: 'holdTheLine', name: 'Hold the Line', cp: 1, desc: 'Allies within 2 of the Commander are Protected for 2 turns and shake off Root and Fear.' },
  coordinatedStrike: { id: 'coordinatedStrike', name: 'Coordinated Strike', cp: 2, desc: 'This turn, attacks deal +2 damage for every other ally next to the target.' },
  secondWind: { id: 'secondWind', name: 'Second Wind', cp: 1, desc: 'All allies recover full stamina and shake off Fear.' },
};

/** Orders by commander (everyone can Rally). */
export const COMMANDER_ORDERS: Record<string, OrderId[]> = {
  link: ['rally', 'coordinatedStrike', 'secondWind', 'focusFire', 'reinforce'],
  zelda: ['rally', 'defensiveFormation', 'focusFire', 'emergencyRetreat', 'reinforce'],
  darunia: ['rally', 'holdTheLine', 'defensiveFormation', 'reinforce', 'secondWind'],
  ruto: ['rally', 'secondWind', 'defensiveFormation', 'emergencyRetreat', 'forcedMarch'],
  nabooru: ['rally', 'forcedMarch', 'coordinatedStrike', 'focusFire', 'emergencyRetreat'],
  ganondorf: ['rally', 'forcedMarch', 'focusFire', 'coordinatedStrike', 'reinforce'],
};

export function ordersFor(commanderId: string): OrderId[] {
  return COMMANDER_ORDERS[commanderId] ?? ['rally', 'focusFire', 'secondWind', 'reinforce'];
}

const players = (b: Battle) => b.units.filter((u) => u.team === 'player' && !u.npc);

export function orderUnusable(b: Battle, id: OrderId): string | null {
  const def = ORDERS[id];
  if ((b.cp ?? 0) < def.cp) return 'Not enough Command Points';
  if (b.phase !== 'player') return 'Only during your phase';
  if (id === 'reinforce' && (!b.reserves?.length || !reinforceTile(b, b.reserves[0]))) return b.reserves?.length ? 'No room near the edge' : 'No benched units';
  if (id === 'emergencyRetreat' && !orderTargets(b, id).length) return 'No one to pull out';
  if (id === 'focusFire' && !orderTargets(b, id).length) return 'No visible enemies';
  if (id === 'coordinatedStrike' && b.coordinatedTurn === b.turn) return 'Already active';
  return null;
}

export function orderTargets(b: Battle, id: OrderId): Unit[] {
  if (id === 'emergencyRetreat') return players(b).filter((u) => !u.isCommander);
  if (id === 'focusFire') return b.units.filter((u) => u.team === 'enemy' && !u.hidden);
  if (id === 'reinforce') return b.reserves ?? [];
  return [];
}

function reinforceTile(b: Battle, u: Unit): Pos | null {
  for (let x = 0; x < Math.min(4, b.width); x++) {
    for (let y = 0; y < b.height; y++) {
      if (anchorCost(b, u, x, y) >= INF) continue;
      if (footprint(x, y, u.size).every((p) => !unitAt(b, p.x, p.y))) return { x, y };
    }
  }
  return null;
}

/** Issue an order. Returns a description of what happened, or null if it can't be done. */
export function issueOrder(b: Battle, id: OrderId, targetUid?: string): string | null {
  if (orderUnusable(b, id) || !(b.orders ?? []).includes(id)) return null;
  const def = ORDERS[id];
  const cmd = players(b).find((u) => u.isCommander);
  const target = targetUid ? b.units.find((u) => u.uid === targetUid) ?? b.reserves?.find((u) => u.uid === targetUid) : undefined;
  if (def.target && (!target || !orderTargets(b, id).includes(target))) return null;
  let text = '';
  switch (id) {
    case 'rally': {
      const who = players(b).filter((u) => cmd && unitDist(u, cmd) <= 3);
      for (const u of who) addStatus(u, 'inspired', 2);
      text = `${who.length} allies rally!`;
      break;
    }
    case 'forcedMarch': {
      const who = players(b).filter((u) => !u.moved);
      for (const u of who) addStatus(u, 'haste', 1);
      text = `${who.length} allies march double-time.`;
      break;
    }
    case 'defensiveFormation':
      for (const u of players(b)) addStatus(u, 'protected', 2);
      text = 'The army forms up defensively.';
      break;
    case 'focusFire':
      addStatus(target!, 'exposed', 2);
      text = `Focus fire on ${target!.name}!`;
      break;
    case 'emergencyRetreat':
      b.units = b.units.filter((u) => u !== target);
      (b.withdrawn ??= []).push(target!);
      text = `${target!.name} withdraws from the battle.`;
      break;
    case 'reinforce': {
      const p = reinforceTile(b, target!)!;
      b.reserves = b.reserves!.filter((u) => u !== target);
      target!.x = p.x;
      target!.y = p.y;
      target!.moved = target!.acted = false;
      b.units.push(target!);
      text = `${target!.name} joins the battle!`;
      break;
    }
    case 'holdTheLine': {
      const who = players(b).filter((u) => cmd && unitDist(u, cmd) <= 2);
      for (const u of who) {
        u.statuses = u.statuses.filter((s) => s.kind !== 'root' && s.kind !== 'fear');
        addStatus(u, 'protected', 2);
      }
      text = `${who.length} allies hold the line.`;
      break;
    }
    case 'coordinatedStrike':
      b.coordinatedTurn = b.turn;
      text = 'Coordinated Strike: gang up on your targets this turn!';
      break;
    case 'secondWind':
      for (const u of players(b)) {
        u.sta = u.stats.sta;
        u.statuses = u.statuses.filter((s) => s.kind !== 'fear');
      }
      text = 'The army catches its second wind.';
      break;
  }
  b.cp = (b.cp ?? 0) - def.cp;
  b.log.push(`Order: ${def.name}. ${text}`);
  return text;
}

/** Coordinated Strike bonus for an attack on `foe` by `u`. */
export function coordinatedBonus(b: Battle, u: Unit, foe: Unit): number {
  if (b.coordinatedTurn !== b.turn || u.team !== 'player') return 0;
  return 2 * b.units.filter((a) => a !== u && a.team === 'player' && !a.captive && unitDist(a, foe) === 1).length;
}

// ───────────────────────── Sacred Energy blessings ─────────────────────────

export const BLESSINGS = {
  din: { name: "Din's Blessing", desc: '+2 STR and MAG for everyone in the next battle.' },
  nayru: { name: "Nayru's Blessing", desc: '+2 DEF and RES for everyone in the next battle.' },
  farore: { name: "Farore's Blessing", desc: 'The whole army is healed to full right now.' },
} as const;

export function useBlessing(run: Run, kind: keyof typeof BLESSINGS): boolean {
  const a = armyOf(run);
  if (a.sacredEnergy < 1 || run.battle) return false;
  if (kind !== 'farore' && a.blessing) return false;
  a.sacredEnergy--;
  if (kind === 'farore') for (const u of run.roster) u.hp = u.stats.hp;
  else a.blessing = kind;
  return true;
}

/** Apply pending blessings and feasts to a new battle. */
export function applyArmyBuffs(run: Run, b: Battle) {
  const a = armyOf(run);
  for (const u of b.units.filter((x) => x.team === 'player' && !x.npc)) {
    if (a.blessing === 'din') u.buffs.push({ id: 'din', name: "Din's Blessing", turns: 99, stats: { str: 2, mag: 2 } });
    if (a.blessing === 'nayru') u.buffs.push({ id: 'nayru', name: "Nayru's Blessing", turns: 99, stats: { def: 2, res: 2 } });
    if (a.feast) addStatus(u, 'inspired', 2);
  }
  a.blessing = undefined;
  a.feast = false;
  b.morale = a.morale;
  b.cpMax = cpMax(run);
  b.cp = b.cpMax;
  b.orders = ordersFor(run.commanderId);
}

