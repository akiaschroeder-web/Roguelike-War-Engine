# Zelda II: The Adventure of Link — Expansion for Era of the Hero (Original Hyrule)

Design doc as supplied by the user (condensed; every value kept). A small expansion of the Original Hyrule pack (src/content/original/, campaign 'original'): palace enemies, bosses, learned magic and sword techniques.

The original game's Link (heroOfHyrule) carries over; existing monsters and equipment carry over without duplicates. The sleeping Princess Zelda is a different incarnation from zeldaHyrule and gets her own unit.

## 1. New Character
**Princess Zelda — Sleeping Princess.** Hylian, Ancient Princess, size 1, Legendary, Magical Support. Personal — Awakening: whenever she recovers from a negative status, she restores 20% max HP and MP. Abilities: Sleeping Curse (enemy sleeps 2 turns); Ancient Blessing (restore an ally's MP); Dream Protection (ally immune to negative statuses for 3 turns); Courage's Awakening (once per battle, revive one recently defeated ally at 25% HP).

## 2. New Monsters
| Unit | Size | Rarity | Class | Personal skill |
|---|---|---|---|---|
| Bit | 1 | Common | Lesser Slime | Sudden Leap: can jump over adjacent units. |
| Bot | 1 | Common | Slime | Bouncing Assault: +3 Mt when attacking after jumping. |
| Moby | 1 | Common | Diving Bird | Dive Attack: +50% damage attacking from higher elevation. |
| Deeler | 1 | Common | Tree Spider | Suspended Ambush: hides in trees and drops onto enemies. |
| Daira | 1 | Rare | Axe Warrior | Axe Throw: throws axes without losing them. |
| Geru | 1 | Uncommon | Reptilian Fighter | Reptilian Guard: +4 DEF when defending without moving. |
| Geldarm | 2 | Uncommon | Desert Crawler | Sand Emergence: burrows under sand and ambushes. |
| Moa | 1 | Rare | Invisible Spirit | Unseen Presence: invisible until attacking or revealed by detection. |
| Myu | 1 | Common | Spiked Crawler | Spiked Body: reflects 25% of direct-contact damage. |
| Bago-Bago | 1 | Uncommon | Skeletal Fish | Leaping Bones: leaps from water or lava onto nearby land. |
| Doomknocker | 2 | Rare | Armored Warrior | Returning Hammer: thrown hammer returns after attacking. |
| Guma | 2 | Rare | Heavy Warrior | Iron Flail: ignores 25% enemy DEF. |
| Fokka | 1 | Epic | Avian Knight | Leaping Swordsmanship: jumping sword attacks bypass shields. |
| Fokkeru | 2 | Rare | Firebird | Fire Spit: bouncing fire projectiles across terrain. |
| Wosu | 1 | Common | Skeletal Wanderer | Mind Drain: contact attacks drain 3 MP. |
| Mago | 1 | Rare | Teleporting Mage | Magical Relocation: teleports up to 4 after casting. |
Colour variants use the existing monster progression system.

## 3. New Bosses (all recruitable)
- **Horsehead (Mazura)** — size 2, Epic, Armored Mace Knight. Armored Body: ordinary frontal damage −50%; jumping attacks bypass. Abilities: Heavy Mace Swing, Crushing Strike, Sweeping Blow, Armored Advance.
- **Helmethead (Jermafenser)** — size 2, Legendary, Haunted Knight. Detached Helmets: at 75% and 50% HP releases a floating helmet that fires magic projectiles independently. Abilities: Helmet Fireball, Armored Charge, Spectral Summoning, Triple Barrage.
- **Rebonack** — size 2 mounted / 1 dismounted, Legendary, Iron Knuckle Commander. Unyielding Knight: dismounts below 40% HP, gaining +4 SPD and SKL. Abilities: Mounted Charge, Lance Thrust, Sword Beam Barrage, Defensive Duel. A named commander, not a generic Iron Knuckle.
- **Carock** — size 2, Legendary, Supreme Sorcerer. Magical Intangibility: physical damage −90%; reflected magic projectiles deal double damage to him. Abilities: Rapid Teleport, Arcane Bolt, Magical Barrage, Illusory Escape.
- **Gooma** — size 3, Legendary, Heavy Flail Warrior. Crushing Momentum: consecutive attacks on the same target ignore progressively more DEF, up to 50%. Abilities: Ball and Chain, Wide Sweep, Overhead Slam, Armor Crusher.
- **Thunderbird** — size 4, Mythic, Palace Guardian. Sealed Face: −75% damage taken until hit by the Thunder spell, which exposes its weak point for 3 turns. Abilities: Fireball Rain (large area), Guardian Flight (ignores terrain), Burning Dive, Infernal Storm (fire in all directions), Reseal (restores its barrier).
Returning bosses: Barba = Volvagia (existing; user sent Zelda II alt art), Link's Shadow = Dark Link (existing; user sent alt art). Iron Knuckles, Stalfos, Goriyas, Moblins, Octoroks, Leevers, Tektites, Wizzrobes, Keese and Bubbles keep their units.

## 4. Base Stats (HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP)
Sleeping Zelda 23 2 23 13 8 4 24 16 4 5 14 50 · Bit 10 3 0 5 8 2 2 4 2 4 10 0 · Bot 18 6 0 7 10 4 3 4 4 5 16 0 · Moby 12 6 0 9 15 2 3 4 2 8 16 0 · Deeler 18 7 0 10 9 4 4 5 4 5 18 0 · Daira 32 15 0 12 10 10 5 5 12 5 28 0 · Geru 26 10 0 10 9 9 5 5 8 5 22 0 · Geldarm 34 12 0 8 6 10 4 3 15 5 26 0 · Moa 22 4 14 11 13 3 14 6 3 7 14 30 · Myu 14 5 0 5 4 13 4 3 5 3 12 0 · Bago-Bago 16 7 4 8 12 4 6 3 3 6 16 8 · Doomknocker 38 17 0 13 8 15 6 5 17 5 32 0 · Guma 42 19 0 11 6 13 5 4 20 4 35 0 · Fokka 36 15 3 19 18 10 7 7 10 7 32 8 · Fokkeru 30 8 16 12 14 6 12 5 9 8 22 30 · Wosu 14 5 3 5 5 3 6 2 4 4 12 6 · Mago 22 3 18 14 12 3 17 6 4 5 14 38 · Horsehead 48 19 0 13 7 21 8 5 23 5 38 0 · Helmethead 55 16 17 13 8 18 15 5 22 5 30 35 · Rebonack 46 18 5 19 15 18 9 6 18 8 38 15 · Carock 35 3 28 20 16 5 26 7 5 7 16 60 · Gooma 72 26 0 12 6 20 7 4 35 4 45 0 · Thunderbird 105 20 32 17 14 24 28 5 38 8 40 65

## 5. Learnable Magic Spells (from Old Man encounters in towns; the Hero of Hyrule has natural proficiency with all eight)
Shield (6 MP: incoming damage −50% for 3 turns) · Jump (4: jump over units, gaps, low obstacles for 3 turns) · Life (10: restore 40% max HP to caster) · Fairy (12: temporarily a noncombatant fairy that flies and passes narrow openings) · Fire (6: sword attacks release fire projectiles for 3 turns) · Reflect (8: shields reflect magic projectiles for 3 turns) · Spell (14: ordinary enemies within 2 become Bots temporarily; can reveal hidden structures) · Thunder (24: heavy lightning damage to every enemy on the field; exposes Thunderbird).

## 6. Learnable Sword Techniques (swordmaster training encounters; not Link-exclusive)
Downward Thrust (5 STA: leap onto an enemy, bypass 50% shield defense; can bounce to another adjacent enemy) · Upward Thrust (4 STA: hits flying/elevated enemies directly above, +50% damage).

## 7. Equipment
Weapons: Daira Axe (R, 13, throwable up to 4) · Doomknocker Hammer (R, 15, returning ranged hammer) · Horsehead's Mace (E, 19, extra vs shields) · Rebonack's Lance (L, 21, +Mt per space travelled before attacking) · Fokka Sword (E, 16, jumping attacks bypass shields) · Carock's Staff (L, 22, teleport MP costs −50%). Gooma uses the existing Ball and Chain.
Armor/accessories: Horsehead's Armor (body, E: +8 DEF, less frontal damage) · Helmethead's Helm (head, L: summon a spectral helmet once per battle) · Rebonack's Armor (body, L: +7 DEF, +3 SKL) · Fokka Helmet (head, R: +3 DEF, better aerial accuracy) · Thunderbird Mask (head, L: +6 MAG, +5 RES, more lightning vulnerability) · Magic Boots (feet, E: walk on water) · Cross (accessory, L: reveals invisible enemies within 5). Raft, Recorder/Flute, Magical Key and existing Hammer are reused.

## 8. Pack and Quest Items
Experience Bag (immediate XP) · Link Doll (prevents the next fatal attack, restoring 25% HP; consumed) · Water of Life (fully restores MP or completes a medicine quest) · Trophy (exchange for spell training) · Lost Mirror (return to its owner for a reward) · Palace Crystal (placed in a palace statue after beating its guardian) · Moa Eye (temporarily reveals invisible enemies) · Myu Spike (retaliation damage on fused shields) · Fokka Feather (improves jumping/aerial gear) · Thunderbird Flame (legendary fire/magic material). Triforce of Courage and Magic Containers reuse existing entries.

## 9. Battlefield Spaces
Palace Statue (accepts a Palace Crystal after the guardian falls) · Collapsing Floor (breaks after a unit crosses) · Falling Block (periodically drops a block on a marked space) · Elevator (moves units between elevations) · Narrow Passage (only small units or Fairy-transformed) · Falling Boulder Zone (periodic damage on marked spaces) · River Devil (blocks travel until the Recorder is played). Existing lava, breakable walls, forest and water stay unchanged.

## 10. Palace Campaign
Six Palace Crystals unlock the Great Palace: Parapa Palace → Horsehead · Midoro Palace → Helmethead · Island Palace → Rebonack · Maze Island Palace → Carock · Palace on the Sea → Gooma · Three-Eye Rock Palace → Volvagia (Barba) · Great Palace → Thunderbird, then Dark Link. Extra encounters around North Castle, Death Mountain, Spectacle Rock, the Valley of Death and the towns. Town encounters teach spells (quests, Rupees, returning lost items). Placing a Palace Crystal levels up one chosen unit; all six open the Great Palace.

## 11. Supports
Sleeping Zelda×Hero of Hyrule S (waking in a changed kingdom) · Sleeping Zelda×Original Zelda S (two princesses with one name and legacy) · Sleeping Zelda×OoT Zelda A (burden of protecting the Triforce) · Sleeping Zelda×Wild Zelda S (losing huge parts of their lives to magic) · Sleeping Zelda×Sonia A (ancient royal traditions) · Sleeping Zelda×King Daphnes A (what became of an ancient kingdom) · Sleeping Zelda×King Rhoam A (royal family conflicts) · Sleeping Zelda×Original Ganon A (the struggle for the Triforce) · Sleeping Zelda×Old Man S (the centuries she slept through) · Sleeping Zelda×Old Woman A (adjusting to ordinary life) · Rebonack×Iron Knuckle A (armored traditions) · Rebonack×Darknut A (elite knights' rivalry) · Rebonack×Horsehead S (brotherhood of palace guardians) · Rebonack×Hero's Shade A (advanced swordsmanship) · Horsehead×Gooma A (heavy weapon training) · Horsehead×Lynel A (strength and prowess) · Helmethead×Stallord A (undead guardianship) · Helmethead×Captain Keeta A (loyalty beyond death) · Carock×Wizzrobe A (advanced magic) · Carock×Agahnim A (only once Agahnim exists — skip for now) · Thunderbird×Valoo A (sacred guardians) · Thunderbird×Helmaroc King A (aerial rivalry) · Thunderbird×Argorok A (armored opponents) · Thunderbird×Dark Link S (guarding the final trial of courage) · Fokka×Revali A (aerial combat styles) · Fokka×Aeralfos A (aerial swordsmanship) · Moa×Ghini A (invisible spirits) · Bot×Zol A (slime combat) · Daira×Iron Knuckle A (axe techniques) · Doomknocker×Goriya A (returning weapons).

## 12. New Commander
Sleeping Princess Zelda: Sleeping Princess Zelda, Hero of Hyrule, Old Man, Hyrule Knight. Ancient Magic: learned spells cost 20% less MP; XP from Palace Crystal rewards +25%. Hero of Hyrule and Ganon keep their commander options.

## Summary
1 named character, 16 monsters, 6 bosses (23 recruitable), 8 spells, 2 sword techniques, 30 support pairings, 7 palaces. All values are adaptations.

## Art received
Saved in `art_sources/adventure_of_link/`.
Batch 1 (15): heroOfHyruleZ2 (alt art for heroOfHyrule), sleepingZelda_sheet (JPEG concept sheet on white — crop the standing figure, top right), darkLinkZ2 (black silhouette — alt art for Dark Link / Link's Shadow), barba (alt art for Volvagia), bit (red slime), bot (blue slime), moby (eagle), geru (lizard with mace and shield), myu (spiked dome), moa (flaming eye), geldarm (centipede), guma (horned bull-man with ball and chain), doomknocker (blue armored knight with spiked mace), bagoBago (skeletal fish), fokka (blue armored bird knight).
Still needed: Deeler, Daira, Fokkeru, Wosu, Mago, Horsehead, Helmethead, Rebonack, Carock, Gooma, Thunderbird.
