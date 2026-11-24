# Riftbound Tactics

A roguelike tactics game in the spirit of grid-based strategy RPGs, where heroes from six very different video-game-style worlds get pulled into one war. It runs in the browser.

**Worlds:** Emberhold (high fantasy) · Starfall Station (sci-fi shooter) · Pixelvale (8-bit platformer) · Neon Sprawl (cyberpunk) · Ronin Isles (samurai fighter) · Hollowmere (gothic horror), plus the Rift itself.

All characters, worlds and bosses are original. Each one is a nod to a genre, not a copy of a specific franchise.

## Play

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/ (works from any path)
npm test           # engine tests + headless battle simulation
```

## Features

- **Tactics combat:** grid movement with terrain costs, a weapon triangle (sword > axe > lance > sword), bows that are effective against fliers, guns that can't counter up close, magic that targets Res, double attacks from Speed, crits, healing staves, combat forecasts, enemy threat ranges and a danger zone.
- **Permadeath:** fallen units are gone, and losing your Commander ends the run.
- **Roguelike runs:** 3 acts, each with a branching map of skirmishes, elites, Rift Tears (recruit a hero), merchants, campfires, relic caches and a warlord boss. Maps and battles are procedurally generated from a seed.
- **18 heroes, 6 warlords and a final boss**, each with a signature skill (Lifesteal, Vantage, Armor Break, Momentum…).
- **10 relics** that change how your whole army plays.
- **Saves automatically** after every action (localStorage). You can close the tab mid-battle and pick up where you left off.
- Works on desktop and mobile. Keyboard: `Esc` cancel, `E` end turn, `D` danger zone.

## Architecture

```
src/
  engine/        Pure, UI-free game logic (all state is plain JSON)
    types.ts     Core types: Unit, Battle, Run, ...
    rng.ts       Seeded PRNG (mulberry32)
    units.ts     Unit creation, growth-based level ups, relic stat mods
    grid.ts      Pathfinding (Dijkstra), ranges, distance fields
    combat.ts    Forecasts and combat resolution
    ai.ts        Enemy AI (scores every tile × target pair)
    mapgen.ts    Procedural battle maps with guaranteed connectivity
    battle.ts    Battle setup, phases, objectives, reinforcements
    run.ts       Run map, node events, shop/rest/recruit, persistence
  data/          Content: worlds, classes, weapons, heroes, enemies, skills, relics
  ui/            DOM rendering: app shell/screens, battle view, components, CSS
tests/           Vitest suite, including AI-vs-AI battle simulations
```

### Adding content

All content is data-driven:

- **New hero:** add an entry to `src/data/heroes.ts` (class, starting weapon, skill, stat/growth tweaks, bio).
- **New world:** add it to `WORLDS` and `PLAYABLE_WORLDS` in `src/data/worlds.ts` (it sets the terrain names and colours), give it an enemy roster in `src/data/enemies.ts`, and optionally a warlord in `BOSSES`.
- **New class / weapon / relic:** `classes.ts`, `weapons.ts`, `skills.ts`. Relic effects are implemented in `units.ts` (`effectiveStats`) and `combat.ts`.

`npm test` checks that every hero and enemy uses a weapon its class can actually wield.
