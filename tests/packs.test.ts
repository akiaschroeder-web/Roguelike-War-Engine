import { afterEach, describe, expect, it } from 'vitest';
import { HEROES, HERO_MAP } from '../src/data/heroes';
import { PLAYABLE_WORLDS, WORLDS } from '../src/data/worlds';
import { BOSSES, rosterFor } from '../src/data/enemies';
import { applyPacks, normalizePack, validatePack } from '../src/engine/packs';
import { availableNodes, enterNode, newRun, type RunWithEvent } from '../src/engine/run';

const sample = () =>
  normalizePack({
    name: 'Test Pack',
    worlds: [{ name: 'Moon Base', genre: 'Space Opera', color: '#33ccff', theme: 'starfall', terrainNames: { plain: 'Regolith' } }],
    heroes: [
      { name: 'Alpha One', title: 'Pilot', world: 'Moon Base', classId: 'gunner', weaponId: 'blaster', skill: 'deadeye', statMods: { spd: 2 } },
      { name: 'Bravo', world: 'Moon Base', classId: 'knight', weaponId: 'ironLance', skill: 'bulwark' },
      { name: 'Charlie', world: 'emberhold', classId: 'mage', weaponId: 'fire', skill: 'lifesteal' },
    ],
    enemies: [{ name: 'Moon Grunt', world: 'Moon Base', classId: 'brawler', weaponId: 'ironAxe' }],
    bosses: [{ name: 'Moon Tyrant', world: 'Moon Base', classId: 'knight', weaponId: 'silverLance', skill: 'bulwark', quote: 'Hi.' }],
  });

afterEach(() => applyPacks([]));

describe('content packs', () => {
  it('normalizes ids, glyphs and world references', () => {
    const p = sample();
    expect(p.worlds[0].id).toBe('pack-test-pack:world-moon-base');
    expect(p.heroes[0].world).toBe(p.worlds[0].id);
    expect(p.heroes[0].glyph).toBe('AO');
    expect(p.heroes[2].world).toBe('emberhold');
    expect(validatePack(p).errors).toEqual([]);
  });

  it('flags a weapon the class cannot use', () => {
    const p = normalizePack({ name: 'Bad', heroes: [{ name: 'X', classId: 'knight', weaponId: 'fire' }] });
    expect(validatePack(p).errors.join()).toMatch(/can't use/);
  });

  it('applies and removes cleanly', () => {
    const before = HEROES.length;
    const p = sample();
    applyPacks([p]);
    expect(HEROES.length).toBe(before + 3);
    expect(HERO_MAP[p.heroes[0].id].name).toBe('Alpha One');
    expect(WORLDS[p.worlds[0].id].terrainNames.plain).toBe('Regolith');
    expect(PLAYABLE_WORLDS).toContain(p.worlds[0].id);
    expect(rosterFor(p.worlds[0].id)[0].name).toBe('Moon Grunt');
    expect(BOSSES.some((b) => b.name === 'Moon Tyrant')).toBe(true);
    applyPacks([]);
    expect(HEROES.length).toBe(before);
    expect(WORLDS[p.worlds[0].id]).toBeUndefined();
  });

  it('can replace the built-in cast and worlds entirely', () => {
    const p = { ...sample(), hideBuiltinHeroes: true, hideBuiltinWorlds: true };
    applyPacks([p]);
    expect(HEROES.map((h) => h.name).sort()).toEqual(['Alpha One', 'Bravo', 'Charlie']);
    expect(PLAYABLE_WORLDS).toEqual([p.worlds[0].id]);
    // A full run starts and its first battle builds with only pack content.
    const run = newRun(5, p.heroes[0].id) as RunWithEvent;
    expect(run.roster.length).toBe(3);
    enterNode(run, availableNodes(run)[0].id);
    expect(run.battle!.units.filter((u) => u.team === 'enemy').every((u) => u.name === 'Moon Grunt')).toBe(true);
  });

  it('survives junk input', () => {
    const p = normalizePack({ name: 5, heroes: 'nope', worlds: [{ color: 'red' }] });
    expect(p.name).toBe('Untitled Pack');
    expect(p.heroes).toEqual([]);
    expect(p.worlds[0].color).toBe('#b48cff');
  });
});
