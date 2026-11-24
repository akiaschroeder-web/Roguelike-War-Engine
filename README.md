# Hyrule Tactical War

A personal, non-commercial fan project: an endless roguelike tactics game in the style of Fire Emblem, set in The Legend of Zelda. Not affiliated with Nintendo. It runs in the browser.

## Play

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/
npm test           # engine tests + AI-vs-AI battle simulations
npx vitest run --config vitest.sim.config.ts   # balance probe: auto-plays regions 1-2 for every commander
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
- **Encounters:** battle, elite, ambush, siege, dungeon, random event, recruitment, merchant, camp, Great Fairy Fountain, treasure, blacksmith and regional boss.
  - **Ambush:** half the enemy starts on your flank and the enemy moves first.
  - **Siege:** storm a walled keep; a guard holds the throne.
  - **Dungeon:** three battles in a row (the last against a guardian), then a vault with better treasure. You can leave between floors.
  - **Random events:** 15 road events with choices, gambles, loot, recruits, healing, EXP, stat boosts and support bonds.
- **Objectives:** rout, defeat the commander, survive, seize the throne, defend a point (losing it means a retreat, not a game over), escape with your Commander, and hold 2 of 3 capture points.
- **Side quests:** some battles add a bonus goal (win within N turns, or lose nobody) for extra Rupees and items.
- **Gear:** shield, head, body, hands, feet and two accessory slots per unit (shields block, and do nothing with a two-handed weapon; Goron/Zora Tunics grant lava immunity and swimming). Includes masks, tunics, the Spiritual Stones, Medallions and Triforce pieces. Bosses drop their gear, and a convoy holds spare equipment.
- **6-slot pack:** potions, Lon Lon Milk, Bottled Fairies (auto-revive), Bombs, Bombchus and Deku Nuts (stun), usable in battle with the Item action.
- **Magic:** units have MP (refilled each battle; Green Potions, Magic Jars and Magic Containers). Great Fairy spells (Din's Fire, Farore's Wind, Nayru's Love), songs played on an ocarina or harp (Zelda's Lullaby, Saria's Song, Sun's Song, Song of Storms), and Fire/Ice/Light Arrows chosen in the forecast. Learned from items, sheet music and Great Fairy Fountains.
- **Enemy armies:** battles aren't all monsters. Depending on the region you fight the Hyrulean Army, Gerudo Raiders, Goron Brawlers, the Zora Royal Guard, Kokiri Pranksters, Sheikah Shadows or a band of Rival Heroes, sometimes alongside monsters. Elite fights can be led by named characters (Nabooru, Darunia, Impa…).
- **Free-for-All:** from region 4 on, battles ignore regions: enemies, armies, leaders and bosses are drawn from the entire cast. Characters can show up on both sides at once (it's not canon).
- **Stamina and techniques:** Power Strike, Piercing Thrust and Aimed Shot (chosen in the forecast) and Spin Attack, based on the weapon type; Stamina Potions and Stamina Vessels.
- **Warp songs:** Minuet, Bolero, Serenade, Requiem, Nocturne and Prelude teleport the performer (3-turn cooldown).
- **Mounts:** a mount slot for horses (Hyrule Horse, Lon Lon Horse, Gerudo Stallion, Royal Warhorse, Stalhorse, Giant Horse, Epona, Phantom Ganon's Horse, Ganondorf's Stallion, Lord of the Mountain). Riders become 2×2 cavalry with bonus movement and mount abilities; dismount in battle to fit through gaps. Epona's Song calls the mount back. Malon starts with Epona, Ganondorf with his stallion.
- **Weapon durability and the Blacksmith:** weapons wear out with use (Kokiri Sword 45, Giant's Knife 8 then it breaks into the Broken Giant's Knife, Master Sword unbreakable…). Blacksmith nodes repair, improve (+1 Might up to +3) and forge weapons. Biggoron's Master Craftsman repairs in battle.
- **Supports:** allies who fight near each other build C/B/A ranks (S for special pairs like Link & Zelda), granting Hit/Avoid/Crit/Def bonuses when close.
- **Transformations:** Ganondorf can become Ganon below half HP; Koume and Kotake fuse into Twinrova when adjacent. Enemy versions do it on their own. Forms revert after battle.
- **Status effects and elements:** fire weapons can Burn, ice can Freeze, lightning can Shock, nature can Poison; Deku Nuts and Sun's Song Stun. Song of Storms brings rain (no burning, stronger water and lightning).
- **Deployment:** army capacity starts at 12 (up to 16) and deployment at 8 (up to 10) as the army levels up.
- **More statuses:** Silenced, Rooted, Blinded, Cursed, Confused, Asleep, Bleeding, Frightened, Weakened, Exposed, plus Regenerating, Inspired, Protected, Hasted and Veiled. Some monsters inflict them (ReDead roots, Like Like weakens, Poes curse, Wolfos make you bleed).
- **Consumables and tools:** Antidote, Sacred Water, Elixir, Fire/Ice/Shock Fruit, Puffshroom, Muddle Bud, Magic Beans, Lens of Truth, Fishing Rod and Shovel. The Hookshot/Longshot double as traversal tools.
- **Battlefield:** fog of war, invisible enemies, cracked walls, Time Blocks (Song of Time), spike traps, buried treasure, spreading fire, bean bridges, rain and sandstorms.
- **Turn phases:** Player, Allied (friendly NPC squads, escorts, freed prisoners), Enemy and Environment.
- **Escort and rescue objectives:** guide a VIP to the far edge, or free prisoners (who then join your army).
- **Army management:** army level, supplies, materials, Command Points, morale, reputation, Fairy Dust and Sacred Energy. Commanders give orders (Rally, Forced March, Defensive Formation, Focus Fire, Emergency Retreat, Reinforce, Hold the Line, Coordinated Strike, Second Wind). Camps have a Feast and an Infirmary.
- **Support conversations** for every pair at every rank (hand-written for the special pairs).
- **Between campaigns:** Hero Medals and the Sanctuary: Goddess Statue upgrades, Hall of Heroes companions, Royal Treasury kits, Military Academy formations, the Bounty Board, Chamber of Trials modifiers, and expanded Hyrule Archives.

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

## Majora's Mask pack (Termina)

- **Termina campaign** (pick it at commander select): Clock Town → Termina Field → Woodfall, Snowhead, Great Bay and Ikana in any order → the Moon once you hold all four Boss Remains → endless war. A **three-day clock** advances with every encounter; when the third day ends, the Moon falls. The **Song of Time** resets to the first dawn: you keep your army, levels, gear, masks, Remains and banked Rupees, but lose unbanked Rupees, ordinary consumables, most quest items and the current route, and enemies grow stronger after every reset. Day and night matter (undead regenerate at night for Igos's army; recruits follow a day schedule shown in the Bombers' Notebook).
- **52 new units**: Link (Termina) and his Deku, Goron, Zora, Fierce Deity and Giant forms; 16 Terminians; Odolwa, Goht, Gyorg, both Twinmolds and Majora's three forms; the Four Giants; 10 monsters; 6 new Deku generics; Igos's two Royal Servants. Plus **Lord Jabu-Jabu** for Ocarina of Time. Every one is recruitable.
- **Transformation masks**: Link puts on the Deku, Goron, Zora, Fierce Deity (3 MP/turn) and Giant's (4 MP/turn) Masks mid-battle; HP ratio and levels carry over, and Hero of Masks makes one swap per turn free. Majora's Mask changes into its Incarnation and Wrath below half HP.
- **Masks, gear and items**: 21 new masks (Stone Mask hides you, Gibdo Mask pacifies the dead, Kamaro's dance dazes, Couple's Mask doubles supports…), Boss Remains, Termina weapons (Razor/Gilded/Great Fairy's/Double Helix swords, Garo blades, Keeta's greatsword…), instruments, 9 new songs (Healing purifies and recruits, Soaring warps to Owl Statues, Elegy leaves a shell, Goron Lullaby sleeps…), and new consumables (Powder Keg, Chateau Romani, Bio Deku Baba seeds, Death Armos Core traps…). Quest items drive event chains (title deeds, Kafei and Anju, the Couple's Mask, Zora Eggs, the Deku Princess).
- **Battlefield spaces**: Deku Flowers, Owl Statues, poisoned water, frozen mechanisms, rolling ramps, underwater currents and waterwheels, Sun Blocks, weighted and inversion switches, and mailboxes.
- **6 new commanders**: Link, Darmani, Mikau, the Deku King, Igos du Ikana and Skull Kid.

## Sound

Sound effects are synthesized in the browser. Music is optional: put files in `public/music/` named `title`, `map`, `battle`, `boss`, `victory`, `gameover`, `camp`, `shop`, `termina` or `moon` (`.mp3`, `.ogg`, `.m4a` or `.wav`). Volume and mute are in the Sound menu.

## Possible future additions

- More content packs (Majora's Mask, Wind Waker…) and the tools from other games (Clawshot, Gust Bellows, Dominion Rod…)
- Class promotions
