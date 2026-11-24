// Mid-battle transformations: Ganondorf -> Ganon, and Koume + Kotake -> Twinrova.
// The original form is restored after the battle.

import { BOSSES, TEMPLATES } from '../data/registry';
import { anchorCost, footprint, unitAt } from './grid';
import { INF } from './rules';
import type { Battle, Stats, Unit } from './types';

export interface FormSnapshot {
  templateId?: string;
  bossId?: string;
  name: string;
  title: string;
  race: string;
  classId: string;
  size: number;
  baseSize?: number;
  stats: Stats;
  weapons: string[];
  skills: string[];
  glyph: string;
  abilities: string[];
  /** The new form's stats right after transforming (to carry level-up gains back). */
  formStats: Stats;
}

declare module './types' {
  interface Unit {
    originalForm?: FormSnapshot;
    /** Twinrova: the sister who merged in (restored after battle). */
    fusedPartner?: Unit;
  }
}

/** Stats a unit had at level 1 in its current form (to keep level-up gains when changing form). */
function baseStatsOf(u: Unit): Stats {
  return (u.templateId && TEMPLATES[u.templateId]?.stats) || (u.bossId && BOSSES[u.bossId]?.stats) || u.stats;
}

/** Is there room for the new form's footprint at the unit's anchor? */
export function roomFor(b: Battle, u: Unit, size: number, ignore: Unit[] = []): boolean {
  const probe = { ...u, size };
  if (anchorCost(b, probe, u.x, u.y) >= INF) return false;
  return footprint(u.x, u.y, size).every((p) => {
    const o = unitAt(b, p.x, p.y);
    return !o || o === u || ignore.includes(o);
  });
}

/** Turn `u` into another template's form, keeping its level gains and HP ratio. */
export function transformInto(b: Battle, u: Unit, templateId: string, partner?: Unit) {
  const t = TEMPLATES[templateId];
  if (!t) return;
  const ratio = partner ? (u.hp + partner.hp) / (u.stats.hp + partner.stats.hp) : u.hp / u.stats.hp;
  const oldBase = baseStatsOf(u);
  if (!u.originalForm) {
    u.originalForm = {
      templateId: u.templateId, bossId: u.bossId, name: u.name, title: u.title, race: u.race, classId: u.classId,
      size: u.size, baseSize: u.baseSize, stats: { ...u.stats }, weapons: [...u.weapons], skills: [...u.skills],
      glyph: u.glyph, abilities: [...u.abilities], formStats: { ...u.stats },
    };
  }
  const stats = { ...t.stats };
  for (const k of Object.keys(stats) as (keyof Stats)[]) stats[k] += Math.max(0, u.stats[k] - oldBase[k]);
  Object.assign(u, {
    templateId, bossId: BOSSES[templateId] ? templateId : undefined, name: t.name, title: t.title, race: t.race,
    classId: t.classId, size: t.size, baseSize: t.size, mounted: false, stats, weapons: [...t.weapons],
    skills: t.skill ? [t.skill] : [], glyph: t.glyph, abilities: [...(t.abilities ?? [])],
  });
  u.originalForm.formStats = { ...stats };
  u.hp = Math.max(1, Math.ceil(stats.hp * ratio));
  if (partner) {
    u.fusedPartner = { ...partner };
    b.units = b.units.filter((x) => x !== partner);
  }
}

/** Restore a unit to its original form (after battle). Keeps level gains made while transformed. */
export function restoreForm(u: Unit): Unit {
  const f = u.originalForm;
  if (!f) return u;
  const ratio = u.hp / u.stats.hp;
  const stats = { ...f.stats };
  for (const k of Object.keys(stats) as (keyof Stats)[]) stats[k] += Math.max(0, u.stats[k] - f.formStats[k]);
  const out: Unit = {
    ...u, templateId: f.templateId, bossId: f.bossId, name: f.name, title: f.title, race: f.race, classId: f.classId,
    size: f.size, baseSize: f.baseSize, stats, weapons: f.weapons, skills: f.skills, glyph: f.glyph, abilities: f.abilities,
  };
  out.hp = u.hp <= 0 ? 0 : Math.max(1, Math.ceil(stats.hp * ratio));
  delete out.originalForm;
  delete out.fusedPartner;
  return out;
}
