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
- **Gear:** shield, head, body, hands, feet and two accessory slots per unit (shields block, and do nothing with a two-handed weapon; Goron/Zora Tunics grant lava immunity and swimming). Includes masks, tunics, the Spiritual Stones, Medallions and Triforce pieces. Bosses drop their gear, and a convoy holds spare equipment.
- **6-slot pack:** potions, Lon Lon Milk, Bottled Fairies (auto-revive), Bombs, Bombchus and Deku Nuts (stun), usable in battle with the Item action.
- **Magic:** units have MP (refilled each battle; Green Potions, Magic Jars and Magic Containers). Great Fairy spells (Din's Fire, Farore's Wind, Nayru's Love), songs played on an ocarina or harp (Zelda's Lullaby, Saria's Song, Sun's Song, Song of Storms), and Fire/Ice/Light Arrows chosen in the forecast. Learned from items, sheet music and Great Fairy Fountains.
- **Enemy armies:** battles aren't all monsters. Depending on the region you fight the Hyrulean Army, Gerudo Raiders, Goron Brawlers, the Zora Royal Guard, Kokiri Pranksters, Sheikah Shadows or a band of Rival Heroes, sometimes alongside monsters. Elite fights can be led by named characters (Nabooru, Darunia, Impa…).
- **Free-for-All:** from region 4 on, battles ignore regions: enemies, armies, leaders and bosses are drawn from the entire cast. Characters can show up on both sides at once (it's not canon).
- **Stamina and techniques:** Power Strike, Piercing Thrust and Aimed Shot (chosen in the forecast) and Spin Attack, based on the weapon type; Stamina Potions and Stamina Vessels.
- **Warp songs:** Minuet, Bolero, Serenade, Requiem, Nocturne and Prelude teleport the performer (3-turn cooldown).
- **Status effects and elements:** fire weapons can Burn, ice can Freeze, lightning can Shock, nature can Poison; Deku Nuts and Sun's Song Stun. Song of Storms brings rain (no burning, stronger water and lightning).
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

- Mounts and the mount slot; tools (Hookshot traversal, Lens of Truth…) and the remaining consumables (Magic Beans, Fire/Ice Fruit…)
- Epona's Song and Song of Time; curses, confusion and the remaining statuses
- Fog of war, destructible terrain, fire spreading
- Supports, mounts and transformations (Twinrova fusion, Ganon)
- Weapon durability and the Blacksmith
- Army stats and resources (supplies, materials, command points, morale)
- Commander orders
- More objectives (escort, capture, siege…) and encounters (siege, ambush, side quests, dungeons, random events)
- Allied and environmental phases
- Cross-run progression facilities

Personal skills that depend on those systems are marked "coming" in-game.
