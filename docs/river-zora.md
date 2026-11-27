# River Zora: generic unit expansion (user spec, condensed)

A generic racial roster of its own, separate from the Ocarina of Time pack's Sea Zora.
- Used across every applicable campaign: original Zelda, A Link to the Past, Link's Awakening, the Oracles and A Link Between Worlds. There are no per-game versions.
- Hostile and friendly River Zora use the same entries, and all are recruitable.
- The classes, equipment and stats are custom.
- Build it with the A Link Between Worlds pack, which comes after Four Swords, and add it to the region pools of all the campaigns above.

## Art (art_sources/river_zora/)
riverZora1–5.webp are five images shared by all six units as ART_VARIANTS; each unit picks one.
1. The 3D horn-player.
2. The classic merman.
3. The green open-mouth.
4. The 2D teal one surfacing.
5. The 2D blue one surfacing.

## Racial traits: Aquatic Adaptation
- Water spaces cost 1 MOV, and deep water needs no equipment.
- +15 Avoid while in water.
- They can submerge to hide from ordinary enemies.
- No drowning and no underwater movement penalties.
- Vulnerable to lightning while submerged.
- Unlike Sea Zora, they have natural projectile attacks that need no equipped weapon.

## Units
1. **River Zora** (1, Common, Aquatic Skirmisher; ranged infantry).
   - River Ambush: +30% damage when attacking right after emerging.
   - Fireball (4 MP): fire projectile at range 2–4.
   - Claw Swipe (3 STA): basic melee.
   - Submerge (3 STA): hide underwater.
   - Aquatic Retreat (4 STA): moves 3 spaces through connected water after attacking.
   - Gear: Natural Claws, Zora Fireball.
2. **River Zora Warrior** (1, Common, Aquatic Warrior; melee infantry).
   - Shoreline Fighter: +3 STR/DEF in or next to water.
   - Spear Thrust (4 STA): piercing, range 1–2.
   - Aquatic Charge (6 STA): charges through connected water, then attacks.
   - Dragging Strike (7 STA): pulls an adjacent enemy 1 space toward water.
   - Fireball (4 MP).
   - Gear: River Zora Spear, River Zora Scale Armor.
3. **River Zora Hunter** (1, Uncommon, Aquatic Hunter; ranged assassin).
   - Beneath the Surface: +25 Hit and +20 Crit when attacking from concealment.
   - Precision Fireball (6 MP): range 2–5, high Hit.
   - Ambush Strike (5 STA): 150% damage against an unsuspecting enemy.
   - Silent Swim (3 STA): moves underwater without breaking concealment.
   - Hunter's Mark (4 STA): allies gain Hit against the target.
   - Gear: River Zora Hunting Spear, River Zora Hunter's Charm.
4. **River Zora Guardian** (2, Rare, Aquatic Heavy Infantry; tank).
   - River Sentinel: intercepts attacks on adjacent River Zora; +5 DEF in water.
   - Heavy Trident (5 STA): powerful piercing attack.
   - Tidal Sweep (8 STA): hits surrounding enemies and knocks them back 1.
   - Guardian Stance (5 STA): −40% physical damage taken until its next turn.
   - Greater Fireball (8 MP): large explosive projectile.
   - Gear: Heavy Trident, Shell Shield, Heavy Armor.
5. **River Zora Sorcerer** (1, Rare, Aquatic Sorcerer; artillery and terrain control).
   - River Magic: −25% MP in water.
   - Greater Fireball (8 MP).
   - Water Jet (6 MP): damage and knockback.
   - Flood (15 MP): a 2×2 area of eligible terrain becomes shallow water for 4 turns.
   - Healing Current (10 MP): aquatic allies within 3 heal 25% HP.
   - Boiling Current (15 MP): damages enemies in a connected stretch of water.
   - Gear: River Zora Staff, Mystic Charm.
6. **River Zora Chieftain** (2, Epic, Tribal Commander; heavy infantry and leadership). A generic tribal leader, not a replacement for named royalty such as Queen Oren.
   - Lord of the River: River Zora within 4 get +3 STR/MAG/DEF and +1 MOV while swimming.
   - Royal Trident Strike (6 STA): 150% damage.
   - Royal Fireball (10 MP): explosive magic projectile.
   - River Rally (8 STA): restores morale; nearby River Zora +3 SPD for 3 turns.
   - Rising Tide (20 MP): floods eligible terrain within 3.
   - Aquatic Reinforcements (15 MP): summons 2 temporary standard River Zora for 3 turns.
   - Gear: Royal Trident, Chieftain's Crown, Royal Armor.

## Stats (HP STR MAG SKL SPD DEF RES LCK CON MOV STA MP)
- River Zora 24 9 12 10 12 7 8 6 8 5 24 30
- Warrior 32 17 8 13 12 13 7 6 12 6 35 20
- Hunter 26 12 16 20 18 7 10 9 8 7 30 40
- Guardian 48 21 10 12 7 24 12 5 24 4 45 25
- Sorcerer 25 5 25 16 11 6 22 9 7 5 20 65
- Chieftain 55 24 22 18 12 20 18 13 25 6 45 60

## Equipment
| Item | Slot | Rarity | Effect |
|---|---|---|---|
| Zora Fireball | Natural weapon | Common | 9 magical Might; range 2–4 |
| River Zora Spear | Main | Common | 10 Might; range 1–2 |
| River Zora Hunting Spear | Main | Uncommon | 12 Might; +15 Crit from concealment |
| River Zora Heavy Trident | Main | Rare | 19 Might; more knockback |
| River Zora Staff | Main | Rare | 18 magical Might; stronger water magic |
| River Zora Royal Trident | Main | Epic | 23 Might; stronger fire and water attacks |
| River Zora Shell Shield | Off | Rare | +8 DEF |
| River Zora Scale Armor | Body | Common | +4 DEF, +2 RES |
| River Zora Heavy Armor | Body | Rare | +9 DEF, +4 RES |
| River Zora Royal Armor | Body | Epic | +8 DEF, +8 RES |
| River Zora Chieftain's Crown | Head | Epic | +4 MAG, +3 LCK |
| River Zora Hunter's Charm | Accessory | Uncommon | +10 Crit while concealed |
| River Zora Mystic Charm | Accessory | Rare | +3 MP per turn while submerged |

## Group supports
| Group | Name | Effect |
|---|---|---|
| Three River Zora | River Pack | +2 STR/MAG near one another |
| Warrior, Hunter, Guardian | River Hunting Party | +15 Hit and Avoid near water |
| Chieftain, Sorcerer | Masters of the Current | Floods last 2 more turns |
| Queen Oren, Chieftain | River Royalty | All allied River Zora +3 DEF/RES |
| River Zora, Sea Zora | United Waters | Both races +2 SKL/SPD while swimming |
