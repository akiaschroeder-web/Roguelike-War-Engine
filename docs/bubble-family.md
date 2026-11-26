# Bubble Family — Complete Unit Set (design doc, as supplied)

Art: `art_sources/twilight_princess/` — redBubble (OoT), redBubbleWW, blueBubble (OoT), blueBubbleWW, greenBubble, whiteBubble (no flames), bubbleMM (low-poly lavender flame), skullBubble (TP).

The Bubble family consists of six independently recruitable variants across Ocarina of Time, Majora's Mask, The Wind Waker and Twilight Princess. Red Bubble and Fire Bubble share a single entry.

1. Red Bubble

Origin: OOT, WW Race: Undead Class: Infernal Spirit Size: 1 Rarity: Uncommon Role: Aerial Assault / Lava Ambusher

Personal Skill — Infernal Shroud: While surrounded by flames, incoming melee attacks deal 50% less damage and inflict Burning on the attacker.

Ability	STA/MP cost	Effect
Flaming Collision	3 STA	Deals physical and fire damage to an adjacent enemy.
Lava Dive	3 STA	Submerges into lava, becoming untargetable until emerging.
Eruption	5 MP	Emerges from lava within four spaces, damaging adjacent enemies.
Infernal Dive	5 STA	Flies up to four spaces toward an enemy before delivering a flaming collision.
Fireburst	8 MP	Deals fire damage to enemies within two spaces.
Reignite	4 MP	Restores extinguished protective flames.

Natural traits:

* Immune to fire and lava damage.
* Water, ice and strong wind attacks extinguish its flames for two turns.
* Can fly over ordinary terrain and hazards.

Drop: Red Bubble Flame.

2. Blue Bubble

Origin: OOT, WW Race: Undead Class: Cursed Spirit Size: 1 Rarity: Uncommon Role: Anti-Infantry Support

Personal Skill — Cursed Flame: Direct-contact attacks inflict Weapon Curse for two turns while its flames are active.

Ability	STA/MP cost	Effect
Cursed Collision	3 STA	Deals magical contact damage and inflicts Weapon Curse.
Azure Barrier	4 MP	Reduces incoming physical damage by 50% until the next turn.
Curse Wave	8 MP	Inflicts Weapon Curse on every adjacent enemy.
Cursed Pursuit	4 STA	Moves an additional three spaces toward an already cursed enemy.
Reignite	4 MP	Restores extinguished magical flames.

Natural traits:

* Immune to Weapon Curse.
* Shield attacks and strong wind attacks extinguish its flames.
* Cannot inflict Weapon Curse through ordinary contact while extinguished.

Drop: Blue Bubble Flame.

3. Green Bubble

Origin: OOT Race: Undead Class: Rotating Spirit Size: 1 Rarity: Uncommon Role: Defensive Area Control

Personal Skill — Pulsating Flame: Automatically alternates between ignited and extinguished states at the beginning of each turn.

State	Effect
Ignited	+5 DEF and RES. Direct-contact attackers receive magical damage.
Extinguished	+3 MOV and +15 Avoidance, but loses flame protection.

Abilities

Ability	STA/MP cost	Effect
Circular Patrol	4 STA	Circles a selected space, damaging enemies along its movement path.
Emerald Collision	3 STA	Deals magical contact damage.
Flame Expansion	6 MP	Expands its flames to damage every adjacent enemy. Requires ignition.
Forced Ignition	4 MP	Immediately switches to its ignited state.
Forced Extinguishing	2 MP	Immediately switches to its extinguished state.

Natural traits:

* Cannot be permanently extinguished.
* Immune to damage from its own magical flames.
* Can switch between defensive and mobile combat roles.

Drop: Green Bubble Flame.

4. White Bubble

Origin: OOT Race: Undead Class: Spectral Charger Size: 1 Rarity: Uncommon Role: High-Mobility Physical Attacker

Personal Skill — Relentless Patrol: Gains +2 Might for every space traveled before attacking, up to +10 Might.

Ability	STA cost	Effect
Skull Charge	3	Rushes toward an enemy in a straight line before attacking.
Ricochet	4	Bounces off a wall or solid obstacle, continuing its movement in another direction.
Rapid Patrol	5	Performs a second movement action but cannot attack afterward.
Impact Strike	6	Knocks an equal-sized or smaller enemy back two spaces.
Rebound Assault	8	Bounces between up to three enemies, dealing 75% damage to each.

Natural traits:

* Does not possess a protective flame barrier.
* Cannot have its abilities disabled through flame extinguishing.
* Relies entirely on physical damage and stamina.

Drop: White Bubble Skull.

5. Bubble

Origin: MM Race: Undead Class: Cursed Skull Size: 1 Rarity: Common Role: Curse Spreading / Disruption

Based on the ordinary winged Bubble encountered in Termina.

Personal Skill — Lingering Curse: Direct-contact attacks inflict Weapon Curse for three turns.

Ability	STA/MP cost	Effect
Cursed Bite	3 STA	Damages an adjacent enemy and inflicts Weapon Curse.
Erratic Flight	4 STA	Grants +30 Avoidance until the next turn.
Hexing Screech	5 MP	Reduces adjacent enemies' SKL and LCK by three for two turns.
Curse Transfer	4 MP	Spreads an existing Weapon Curse to another nearby enemy.
Lingering Hex	6 MP	Extends a targeted enemy's existing negative status effects by one turn.

Natural traits:

* Immune to Weapon Curse.
* Does not rely on a protective flame barrier.
* Physically fragile but highly mobile.
* Can inflict curses without needing to reignite itself.

Drop: Cursed Skull Charm.

6. Skull Bubble

Origin: TP Race: Undead Class: Spectral Ambusher Size: 1 Rarity: Uncommon Role: Magical Skirmisher

Personal Skill — Spectral Dormancy: Becomes concealed when remaining stationary for an entire turn. Its first attack after emerging from concealment deals 50% additional damage.

Ability	STA/MP cost	Effect
Spectral Collision	3 STA	Deals physical and magical contact damage.
Dormant Skull	2 MP	Drops to the ground and becomes concealed until moving or attacking.
Sudden Awakening	4 STA	Emerges from dormancy and immediately lunges toward an enemy within three spaces.
Spectral Flame	5 MP	Deals magical damage and inflicts Weapon Curse for one turn.
Haunting Flight	4 MP	Passes through ordinary obstacles during its next movement action.

Natural traits:

* Immune to Weapon Curse.
* Can disguise itself as an ordinary skull.
* Wind attacks temporarily extinguish its magical flames.
* Excels at ambushes rather than prolonged direct combat.

Drop: Spectral Skull Fragment.

7. Base Stats

All statistics represent Level 1 units without equipment bonuses.

Stat	Red	Blue	Green	White	Bubble	Skull
Size	1	1	1	1	1	1
HP	24	20	24	18	17	16
STR	8	4	5	10	4	3
MAG	12	12	9	0	10	10
SKL	9	9	7	11	9	10
SPD	12	9	7	15	12	12
DEF	6	4	6	3	2	3
RES	10	12	10	4	9	10
LCK	4	4	5	5	4	3
CON	4	3	3	4	2	3
MOV	7	6	5	9	7	7
STA	18	12	14	24	12	10
MP	24	26	22	0	24	20

8. Shared Bubble Traits

Trait	Effect
Floating Movement	Ignores ordinary ground hazards, gaps and low obstacles.
Undead	Immune to poison, bleeding and disease.
Sacred Weakness	Receives 50% additional damage from sacred light.
Natural Weaponry	Uses skull collisions, bites and magical flames instead of conventional weapons.
Lightweight	Can be displaced by strong wind and heavy impact attacks.
Flame Extinguishing	Applicable variants temporarily lose flame-related abilities when extinguished.

Weapon Curse

Weapon Curse prevents affected units from performing conventional weapon attacks for its duration.

Affected units can still move, use items, cast spells and perform compatible natural abilities.

The effect can be removed through sacred magic, curse-removing consumables or the Song of Healing.

9. Equipment Compatibility

Slot	Compatibility
Main Hand	Natural weapons and magical flames
Off Hand	None
Head	Compatible masks and helmets
Body	None
Hands	None
Feet	None
Accessory I	Yes
Accessory II	Yes
Pack	3 slots
Mount	None

10. Unique Equipment

Accessories and headgear

Equipment	Slot	Rarity	Effect
Red Bubble Flame	Accessory	Rare	Grants 50% fire resistance and deals 3 fire damage to direct-contact attackers.
Blue Bubble Flame	Accessory	Epic	Physical attacks have a 20% chance of inflicting Weapon Curse.
Green Bubble Flame	Accessory	Rare	Alternates between granting +4 DEF and +4 RES each turn.
White Bubble Skull	Head	Rare	Grants +2 SPD and increases charging attack damage according to distance traveled.
Cursed Skull Charm	Accessory	Uncommon	Increases the duration of inflicted curses by one turn.
Spectral Skull Fragment	Accessory	Rare	Grants +15 Avoidance while stationary and increases ambush damage by 20%.

Pack items

Item	Rarity	Effect
Bubble Bone Fragment	Common	Crafting material for undead equipment.
Cursed Flame Essence	Rare	Inflicts Weapon Curse on a selected enemy within three spaces.
Volcanic Flame Essence	Rare	Grants immunity to fire and lava damage for three turns.
Pulsating Flame Essence	Rare	Grants +5 DEF and RES for two turns.
Spectral Flame Essence	Rare	Allows the user to pass through ordinary obstacles during their next movement action.

11. Final Bubble Roster

Unit	Games	Size	Specialty
Red Bubble	OOT, WW	1	Fire and lava combat
Blue Bubble	OOT, WW	1	Weapon disabling
Green Bubble	OOT	1	Alternating defense
White Bubble	OOT	1	Physical charging
Bubble	MM	1	Curse spreading
Skull Bubble	TP	1	Spectral ambushes

Total content:

* 6 unique recruitable units.
* 6 unique equippable gear items.
* 5 additional pack items.
* 1 shared status effect.
* No duplicate Red Bubble or Fire Bubble entries.

The individual abilities and numerical statistics are tactical adaptations designed to differentiate the variants within the shared combat system.
