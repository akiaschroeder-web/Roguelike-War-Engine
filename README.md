# Hyrule Tactical War

A personal, non-commercial fan project: an endless roguelike tactics game in the style of Fire Emblem, set in The Legend of Zelda. Not affiliated with Nintendo. It runs in the browser.

## Play

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/
npm test           # engine tests + AI-vs-AI battle simulations
```

## What's in it

- **Endless campaign:** each region is a branching map ending in a regional boss. Then you pick the next region. Enemies keep scaling, and the goal is to last as long as you can.
- **Ocarina of Time content pack:**
  - 24 named characters plus Ganondorf as a commander, with the stat sheets, races, classes, sizes and personal skills from the design doc
  - 21 generic recruits (monster recruits only for Ganondorf's army)
  - 31 enemy types and 15 bosses
  - 8 regions with their own terrain, map style, enemies and bosses
  - 6 commanders with their starting armies and bonuses
- **Unit sizes:** units occupy 1×1 up to 5×5 squares. Pathing, attack range, deployment and map generation all respect footprints.
- **Combat:**
  - weapon triangle, effectiveness (fliers, armor, demons, undead…), weapon weight vs CON, and LCK for hit, avoid and crit avoid
  - brave and armor-piercing weapons
  - multiple carried weapons, switchable in the forecast
  - healing staves
- **Terrain:** lava (Gorons and fliers are immune), deep water (Zora and fliers only) and forts. Kokiri ignore forest penalties.
- **Attrition:** HP carries over between battles. Camps and Great Fairy Fountains heal, and fountains can revive the fallen. Permadeath otherwise; losing the commander ends the run.
- **Encounters:** battle, elite, recruitment, merchant, camp, Great Fairy Fountain, treasure and regional boss.
- **Gear:** one accessory slot per unit, plus the Spiritual Stones, Medallions and Triforce pieces. Permanent stat items include Heart Containers and gems. Bosses drop their gear, and a convoy holds spare equipment.
- **Deployment:** army capacity is 12 and deployment capacity is 8.

## Portraits

Units show their initials as placeholders. Drop images into `public/portraits/` named by id (for example `link.png`). `public/portraits/README.md` lists every filename.

## Layout

```
src/
  content/ocarina/   The Ocarina of Time pack: races, classes, weapons, items, regions, units, enemies, commanders
  content/types.ts   ContentPack shape (future packs: Majora's Mask, Wind Waker, …)
  data/registry.ts   Installs packs and indexes all content for the engine
  engine/            UI-free rules: units, grid/footprints, combat, AI, mapgen, battle, run
  ui/                Screens, battle view, components, CSS
tests/               Vitest suite
```

## Not built yet (from the design doc)

- Full equipment slots (head, body, hands, feet, shield, 2 accessories, mount) and the 6-slot pack
- Consumables and tools
- STA/MP resources and techniques
- Songs and Great Fairy spells, elemental arrows
- Status effects, elements, weather, fog of war, destructible terrain
- Supports, mounts and transformations (Twinrova fusion, Ganon)
- Weapon durability and the Blacksmith
- Army stats and resources (supplies, materials, command points, morale)
- Commander orders
- More objectives (escort, capture, siege…) and encounters (siege, ambush, side quests, dungeons, random events)
- Allied and environmental phases
- Cross-run progression facilities

Personal skills that depend on those systems are marked "coming" in-game.
