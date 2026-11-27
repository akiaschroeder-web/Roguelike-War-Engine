// Status effects (burn, freeze, shock, poison, stun), elemental on-hit effects
// and timed buffs.

import { GEAR, WEAPONS } from '../data/registry';
import { wildImmune } from './wildGear';
import type { RNG } from './rng';
import { ogImmune } from './original';
import { lgImmune } from './legend';
import { phImmune } from './phantom';
import type { Battle, Element, StatusKind, Unit } from './types';

export const STATUS_INFO: Record<StatusKind, { name: string; icon: string; desc: string; good?: boolean }> = {
  dazed: { name: 'Dazed', icon: '💃', desc: '−15 Hit and −15 Avoid (Kamaro\'s dance).' },
  burn: { name: 'Burning', icon: '🔥', desc: 'Loses 10% max HP each turn and has −2 DEF.' },
  freeze: { name: 'Frozen', icon: '❄', desc: 'Cannot act. Taking damage breaks the ice.' },
  shock: { name: 'Shocked', icon: '⚡', desc: '−15 Hit.' },
  poison: { name: 'Poisoned', icon: '☠', desc: 'Loses 10% max HP each turn.' },
  stun: { name: 'Stunned', icon: '💫', desc: 'Loses its next action.' },
  silence: { name: 'Silenced', icon: '🔇', desc: 'Cannot cast spells, play songs or fire magic arrows.' },
  root: { name: 'Rooted', icon: '🌿', desc: 'Cannot move (can still attack).' },
  blind: { name: 'Blinded', icon: '🌫', desc: '−30 Hit.' },
  curse: { name: 'Cursed', icon: '👁', desc: '−2 to STR, MAG, SKL, SPD, DEF and RES. Sacred Water lifts it.' },
  confuse: { name: 'Confused', icon: '❓', desc: 'Half the time it stumbles and hurts itself instead of acting.' },
  sleep: { name: 'Asleep', icon: '💤', desc: 'Cannot act. Taking damage wakes it.' },
  bleed: { name: 'Bleeding', icon: '🩸', desc: 'Loses 8% max HP each turn.' },
  fear: { name: 'Frightened', icon: '😱', desc: '−20 Hit and −3 damage.' },
  weaken: { name: 'Weakened', icon: '🥀', desc: '−4 STR.' },
  exposed: { name: 'Exposed', icon: '🎯', desc: '−3 DEF and RES.' },
  regen: { name: 'Regenerating', icon: '✚', desc: 'Recovers 10% max HP each turn.', good: true },
  inspired: { name: 'Inspired', icon: '✦', desc: '+10 Hit, +10 Avoid and +2 damage.', good: true },
  protected: { name: 'Protected', icon: '🛡', desc: '+3 DEF and RES.', good: true },
  haste: { name: 'Hasted', icon: '💨', desc: '+2 MOV and +2 SPD.', good: true },
  veiled: { name: 'Veiled', icon: '☁', desc: '+30 Avoid (hidden in a cloud).', good: true },
  weaponCurse: { name: 'Weapon Curse', icon: '⛓', desc: 'Can\'t make weapon attacks (spells, items and natural abilities still work).' },
  petrified: { name: 'Petrified', icon: '🗿', desc: 'Turned to stone: can\'t move or act; hammers deal double damage.' },
  malice: { name: 'Malice', icon: '🟣', desc: 'Corrupted by Malice: loses 8% max HP each turn and has −3 RES. Sacred light burns it away.' },
};

/** Stat changes from statuses (applied in effectiveStats). */
export const STATUS_STATS: Partial<Record<StatusKind, Partial<Record<'str' | 'mag' | 'skl' | 'spd' | 'def' | 'res' | 'mov', number>>>> = {
  burn: { def: -2 },
  curse: { str: -2, mag: -2, skl: -2, spd: -2, def: -2, res: -2 },
  weaken: { str: -4 },
  exposed: { def: -3, res: -3 },
  protected: { def: 3, res: 3 },
  haste: { mov: 2, spd: 2 },
  malice: { res: -3 },
};

export const NEGATIVE_STATUSES = (Object.keys(STATUS_INFO) as StatusKind[]).filter((k) => !STATUS_INFO[k].good);

/** A damaged unit thaws and wakes up. */
export function onDamaged(u: Unit) {
  u.statuses = u.statuses.filter((s) => s.kind !== 'freeze' && s.kind !== 'sleep');
}

export function hasStatus(u: Unit, kind: StatusKind): boolean {
  return u.statuses.some((s) => s.kind === kind);
}

/** Gear and skills that make a unit immune to a status. */
export function immuneTo(u: Unit, kind: StatusKind): boolean {
  const gear = (effect: string) => Object.values(u.gear ?? {}).some((id) => GEAR[id!]?.effects?.includes(effect as never));
  if (kind === 'sleep' && gear('sleepImmune')) return true;
  // Skyward Sword: the Imprisoned shrugs off ordinary immobilization; sacred shields ward off curses.
  if (['root', 'stun', 'freeze', 'sleep'].includes(kind) && u.skills?.includes('unstoppableAscension')) return true;
  if ((kind === 'curse' || kind === 'weaponCurse') && u.gear?.shield && GEAR[u.gear.shield]?.shieldFamily === 'sacred') return true;
  if (kind === 'fear' && (gear('fearImmune') || gear('gibdo') || u.skills.includes('mountainHero'))) return true;
  if (kind === 'curse' && gear('curseImmune')) return true;
  if (kind === 'shock' && gear('shockImmune')) return true;
  // Era of the Wild: armor sets, helms, elixirs and racial traits.
  if (wildImmune(u, kind)) return true;
  if (ogImmune(u, kind)) return true;
  if (lgImmune(undefined, u, kind)) return true;
  if (phImmune(u, kind)) return true;
  return false;
}

/** Wearing the Composer's Sheet Music? */
export function hasComposer(u: Unit): boolean {
  return Object.values(u.gear ?? {}).some((id) => GEAR[id!]?.effects?.includes('composer'));
}

export function addStatus(u: Unit, kind: StatusKind, turns: number) {
  if (immuneTo(u, kind)) return;
  const cur = u.statuses.find((s) => s.kind === kind);
  if (cur) cur.turns = Math.max(cur.turns, turns);
  else u.statuses.push({ kind, turns });
}

export function clearStatus(u: Unit, kind?: StatusKind) {
  u.statuses = kind ? u.statuses.filter((s) => s.kind !== kind) : [];
}

/** Combat modifiers from statuses (stat changes live in STATUS_STATS). */
export function statusMods(u: Unit): { def: number; hit: number; avoid: number; dmg: number } {
  const has = (k: StatusKind) => hasStatus(u, k);
  return {
    def: 0,
    hit: (has('shock') ? -15 : 0) + (has('blind') ? -30 : 0) + (has('fear') ? -20 : 0) + (has('inspired') ? 10 : 0) + (has('dazed') ? -15 : 0),
    avoid: (has('inspired') ? 10 : 0) + (has('veiled') ? 30 : 0) + (has('dazed') ? -15 : 0),
    dmg: (has('fear') ? -3 : 0) + (has('inspired') ? 2 : 0),
  };
}

/** Statuses that cost the unit its turn. */
export function isHelpless(u: Unit): boolean {
  return hasStatus(u, 'freeze') || hasStatus(u, 'stun') || hasStatus(u, 'sleep');
}

/** Might adjustment for an element in the current weather. */
export function weatherMight(b: Battle, el: Element | undefined): number {
  if (b.weather?.kind !== 'rain' || !el) return 0;
  if (el === 'fire') return -2;
  if (el === 'water' || el === 'lightning') return 2;
  return 0;
}

/**
 * After a damaging hit, an elemental attack may inflict a status.
 * Returns the status applied, if any.
 */
/** Monsters whose attacks carry a status (by archetype/template id). */
const MONSTER_INFLICT: Record<string, [StatusKind, number, number]> = {
  redead: ['root', 35, 1], gibdo: ['root', 25, 1], wallmaster: ['root', 30, 1],
  likeLike: ['weaken', 40, 3], poe: ['curse', 30, 3], anubis: ['curse', 25, 3], bongoBongo: ['curse', 25, 3],
  wolfos: ['bleed', 30, 3], stinger: ['bleed', 25, 3], peahat: ['bleed', 20, 3], shellBlade: ['bleed', 25, 3],
  skulltula: ['poison', 25, 3], keese: ['blind', 20, 2], darkLink: ['fear', 25, 2], phantomGanon: ['fear', 20, 2],
  ironKnuckle: ['exposed', 25, 2], dinolfos: ['burn', 0, 0],
};

export function rollElement(b: Battle, by: Unit, target: Unit, el: Element | undefined, rng: RNG, weaponId?: string): StatusKind[] {
  const out: StatusKind[] = [];
  const extra = target.team === 'enemy' && b.statusBonus ? b.statusBonus : 0; // Skull Kid's army
  const w = weaponId ? WEAPONS[weaponId] : undefined;
  if (w?.inflict && rng.chance(w.inflict.chance)) { addStatus(target, w.inflict.status, w.inflict.turns + extra); out.push(w.inflict.status); }
  if (by.skills.includes('mountainGuardian') && rng.chance(25)) { addStatus(target, 'freeze', 1 + extra); out.push('freeze'); }
  if (w && (w.type === 'magic') && Object.values(by.gear ?? {}).some((id) => GEAR[id!]?.effects?.includes('majoraEye'))) {
    const kind = rng.pick(['curse', 'poison', 'blind', 'weaken', 'exposed', 'fear'] as StatusKind[]);
    addStatus(target, kind, 2 + extra); out.push(kind);
  }
  const m = MONSTER_INFLICT[by.artId ?? ''] ?? MONSTER_INFLICT[by.templateId ?? ''] ?? MONSTER_INFLICT[by.bossId ?? ''];
  if (m && m[1] && rng.chance(m[1])) { addStatus(target, m[0], m[2]); out.push(m[0]); }
  if (weaponId && /dagger|knife|kunai/i.test(weaponId) && rng.chance(15) && !out.includes('bleed')) { addStatus(target, 'bleed', 2); out.push('bleed'); }
  if (weaponId === 'boomerang' && rng.chance(30)) { addStatus(target, 'stun', 1); out.push('stun'); }
  if (el === 'dark' && rng.chance(30)) { addStatus(target, 'curse', 3); out.push('curse'); }
  // Composer's Sheet Music: sleep and curses linger.
  if (out.some((k) => k === 'sleep' || k === 'curse') && hasComposer(by)) {
    for (const st of target.statuses) if ((st.kind === 'sleep' || st.kind === 'curse') && out.includes(st.kind)) st.turns++;
  }
  const els: Element[] = el ? [el] : [];
  if (by.skills.includes('combinedSorcery') && (el === 'fire' || el === 'ice')) els.splice(0, 1, 'fire', 'ice');
  const rain = b.weather?.kind === 'rain';
  for (const e of els) {
    if (e === 'fire' && !rain && rng.chance(30)) {
      addStatus(target, 'burn', by.skills.includes('witchOfFlame') ? 3 : 2);
      out.push('burn');
    } else if (e === 'ice' && rng.chance(by.skills.includes('witchOfIce') ? 40 : 20)) {
      addStatus(target, 'freeze', 1);
      out.push('freeze');
    } else if (e === 'lightning' && rng.chance(rain ? 50 : 30)) {
      addStatus(target, 'shock', 2);
      out.push('shock');
    } else if (e === 'nature' && rng.chance(30)) {
      addStatus(target, 'poison', 3);
      out.push('poison');
    }
  }
  return out;
}

export interface StatusTick {
  damage: number;
  heal: number;
  lostTurn: StatusKind | null;
}

/**
 * Start-of-phase upkeep for one unit: damage over time (never lethal),
 * regeneration, lost turns (freeze/stun/sleep, or stumbling while confused),
 * and status/buff countdowns. `roll` is a 0-100 random number for confusion.
 */
export function tickStatuses(u: Unit, roll = 100): StatusTick {
  let damage = 0;
  let heal = 0;
  let lostTurn: StatusKind | null = null;
  for (const s of u.statuses) {
    if (s.kind === 'burn' || s.kind === 'poison') damage += Math.max(1, Math.ceil(u.stats.hp * 0.1));
    if (s.kind === 'bleed' || s.kind === 'malice') damage += Math.max(1, Math.ceil(u.stats.hp * 0.08));
    if (s.kind === 'regen') heal += Math.ceil(u.stats.hp * 0.1);
    if ((s.kind === 'freeze' || s.kind === 'stun' || s.kind === 'sleep') && !lostTurn) lostTurn = s.kind;
  }
  if (!lostTurn && hasStatus(u, 'confuse') && roll < 50) {
    lostTurn = 'confuse';
    damage += Math.max(1, Math.ceil(u.stats.hp * 0.05));
  }
  damage = Math.min(damage, Math.max(0, u.hp - 1));
  u.hp -= damage;
  heal = Math.min(heal, u.stats.hp - u.hp);
  u.hp += heal;
  for (const s of u.statuses) s.turns--;
  u.statuses = u.statuses.filter((s) => s.turns > 0);
  for (const b of u.buffs) b.turns--;
  u.buffs = u.buffs.filter((b) => b.turns > 0);
  return { damage, heal, lostTurn };
}