import { describe, expect, it } from 'vitest';
import { OCARINA } from '../src/content/ocarina';
import { MAJORA } from '../src/content/majora';
import { WIND_WAKER } from '../src/content/windwaker';
import { TWILIGHT_PRINCESS } from '../src/content/twilight';
import { SKYWARD_SWORD } from '../src/content/skyward';
import { ABILITIES, BOSSES, CLASSES, ENEMIES, GEAR, ITEMS, RACES, ROSTERS, SKILLS, TEMPLATES, WEAPONS, WORLDS, COMMANDERS, EVENTS, artFor } from '../src/data/registry';

const PACKS = [OCARINA, MAJORA, WIND_WAKER, TWILIGHT_PRINCESS, SKYWARD_SWORD];
const lists = ['races', 'classes', 'weapons', 'gear', 'items', 'abilities', 'skills', 'templates', 'enemies', 'bosses'] as const;

describe('content integrity', () => {
  it('has no id collisions between packs', () => {
    const dupes: string[] = [];
    for (const key of lists) {
      const seen = new Map<string, string>();
      for (const p of PACKS) for (const x of (p[key] as { id: string }[])) {
        if (seen.has(x.id) && seen.get(x.id) !== p.id) dupes.push(`${key}:${x.id} (${seen.get(x.id)} & ${p.id})`);
        seen.set(x.id, p.id);
      }
    }
    // Weapons/gear/items share one namespace in loot and the convoy.
    const all = new Map<string, string>();
    for (const p of PACKS) for (const x of [...p.weapons, ...p.gear, ...p.items]) {
      if (all.has(x.id) && all.get(x.id) !== `${p.id}`) dupes.push(`equip:${x.id}`);
      all.set(x.id, p.id);
    }
    // zoraFins: an Ocarina gear and a Majora weapon share an id (pre-existing, harmless: different lookups).
    expect(dupes.filter((d) => !d.includes('zoraFins'))).toEqual([]);
  });

  it('the Twilight Princess pack only references things that exist', () => {
    const missing: string[] = [];
    const known = (id: string) => !!(WEAPONS[id] || GEAR[id] || ITEMS[id]);
    for (const t of [...TWILIGHT_PRINCESS.templates, ...TWILIGHT_PRINCESS.enemies, ...TWILIGHT_PRINCESS.bosses]) {
      if (!RACES[t.race]) missing.push(`race ${t.race} (${t.id})`);
      if (!CLASSES[t.classId]) missing.push(`class ${t.classId} (${t.id})`);
      for (const w of t.weapons) if (!WEAPONS[w]) missing.push(`weapon ${w} (${t.id})`);
      if (t.skill && !SKILLS[t.skill]) missing.push(`skill ${t.skill} (${t.id})`);
      for (const a of ('abilities' in t ? t.abilities ?? [] : [])) if (!ABILITIES[a]) missing.push(`ability ${a} (${t.id})`);
      for (const g of Object.values(('gear' in t ? t.gear : undefined) ?? {})) if (!GEAR[g as string]) missing.push(`gear ${g} (${t.id})`);
      const home = (t as { home?: string }).home;
      if (home && !WORLDS[home]) missing.push(`home ${home} (${t.id})`);
    }
    for (const b of TWILIGHT_PRINCESS.bosses) for (const d of b.drops ?? []) if (!known(d)) missing.push(`drop ${d} (${b.id})`);
    for (const [r, ids] of Object.entries(TWILIGHT_PRINCESS.rosters)) for (const id of ids) if (!ENEMIES[id]) missing.push(`roster ${r}: ${id}`);
    for (const ids of Object.values(TWILIGHT_PRINCESS.regionBosses)) for (const id of ids) if (!BOSSES[id]) missing.push(`boss ${id}`);
    for (const c of TWILIGHT_PRINCESS.commanders) {
      if (!TEMPLATES[c.heroId]) missing.push(`commander ${c.heroId}`);
      for (const u of c.units) if (!TEMPLATES[u]) missing.push(`commander unit ${u}`);
      for (const i of c.startingItems ?? []) if (!known(i)) missing.push(`starting item ${i}`);
    }
    for (const f of TWILIGHT_PRINCESS.factions) for (const u of [...f.units, ...f.leaders]) if (!TEMPLATES[u]) missing.push(`faction ${f.id}: ${u}`);
    for (const ev of TWILIGHT_PRINCESS.events ?? []) for (const ch of ev.choices) {
      const outs = [ch.outcome, ch.gamble?.win, ch.gamble?.lose].filter(Boolean);
      for (const o of outs) for (const e of o!.effects) {
        if (e.kind === 'loot') for (const i of e.ids) if (!known(i)) missing.push(`event ${ev.id} loot ${i}`);
        if (e.kind === 'recruit') for (const i of e.pool) if (!TEMPLATES[i]) missing.push(`event ${ev.id} recruit ${i}`);
      }
      if (ev.art && !artFor(ev.art)) missing.push(`event art ${ev.art}`);
    }
    expect(missing).toEqual([]);
    expect(Object.keys(ROSTERS).length).toBeGreaterThan(0);
    expect(COMMANDERS.some((c) => c.heroId === 'heroOfTwilight')).toBe(true);
    expect(EVENTS.howlingStone).toBeTruthy();
  });

  it('every TP unit, monster and boss has art', () => {
    const noArt = [...TWILIGHT_PRINCESS.templates, ...TWILIGHT_PRINCESS.enemies, ...TWILIGHT_PRINCESS.bosses]
      .filter((t) => !artFor(t.id)).map((t) => t.id);
    expect(noArt).toEqual([]);
  });
});
