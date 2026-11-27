# ChuChu Expansion — 6 new units (built with the Spirit Tracks pack)

All six are recruitable and size 1×1. The existing Red, Blue and Yellow ChuChus keep their abilities. The Wild-era variants specialise in elemental absorption, explosive reactions and terrain manipulation instead.

## Implementation IDs and art (fixed)
| Unit | id | Art (main, then alts) |
|---|---|---|
| Standard ChuChu | chuchuStandard | chuchuBasic, chuchuBlueSS |
| Fire ChuChu | chuchuFire | chuchuFlame, chuchuRedSS |
| Ice ChuChu (Wild and Spirit Tracks share one entry) | chuchuIce | chuchuFrost, chuchuFrostAlt |
| Electric ChuChu | chuchuElectric | chuchuElectric |
| Metal ChuChu | chuchuMetal | chuchuMetal |
| Helmet ChuChu | chuchuHelmet | chuchuHelmet, chuchuSpikedHelmet |

- chuchuSpikedHelmet has no unit of its own; it is used as a Helmet ChuChu alt, since the spec calls the helmet three-horned.
- The art files are in art_sources/spirit_tracks/.

## 1. Standard ChuChu
- Origin: Breath of the Wild / Tears of the Kingdom. Common. Class: Adaptive Slime. Role: Elemental Utility.
- Personal skill, Elemental Adaptation: when struck by Fire, Ice or Lightning damage, it transforms into the matching elemental ChuChu. It keeps its level, EXP and HP percentage.
- Abilities:
  - Body Slam (3 STA): leaps at an adjacent enemy.
  - Water Burst (5 STA): Wet on surrounding units.
  - Gel Recovery (5 STA): heals 20% of max HP.
  - Sludge Cleanse (4 STA): removes sludge and puts out burning terrain within 2 spaces.
- Drop: ChuChu Jelly.

## 2. Fire ChuChu
- Origin: Breath of the Wild / Tears of the Kingdom. Uncommon. Class: Elemental Slime. Role: Area Damage.
- Personal skill, Combustible Body: immune to fire damage and Burning. Direct melee attackers take fire damage. Explodes on death, damaging all adjacent units.
- Abilities:
  - Flaming Leap (4 STA): physical plus fire damage.
  - Flame Burst (8 MP): fiery explosion within 2 spaces.
  - Ignite (4 MP): sets adjacent flammable terrain ablaze.
  - Reignite (5 STA): restores its coating after a Flame Burst.
- Weak to ice and water. Drop: Red ChuChu Jelly.

## 3. Ice ChuChu
- Origin: Breath of the Wild / Tears of the Kingdom / Spirit Tracks. Uncommon. Class: Elemental Slime. Role: Crowd Control.
- Personal skill, Frozen Body: immune to ice damage and freezing. Direct melee attackers risk being Frozen. Freezing explosion on death.
- Abilities:
  - Frozen Leap (4 STA): physical plus ice damage.
  - Frost Burst (8 MP): damages and freezes surrounding units.
  - Frozen Surface (6 MP): freezes shallow water and makes slippery terrain.
  - Refreeze (5 STA): restores its coating.
- Weak to fire. Drop: White ChuChu Jelly.

## 4. Electric ChuChu
- Origin: Breath of the Wild / Tears of the Kingdom. Uncommon. Class: Elemental Slime. Role: Disruption.
- Personal skill, Volatile Charge: immune to lightning damage and Shocked. Direct melee attackers take electrical damage. Electrical explosion on death.
- Abilities:
  - Electric Leap (4 STA): physical plus lightning damage.
  - Discharge (8 MP): shocks surrounding units and may disarm them.
  - Conductive Burst (12 MP): spreads through connected water spaces and conductive objects, damaging units along the way.
  - Recharge (5 STA): restores its coating.
- Weak to nonconductive ranged weapons. Drop: Yellow ChuChu Jelly.
- Unlike the existing Yellow ChuChu, it specialises in explosive area attacks and environmental electricity.

## 5. Metal ChuChu
- Origin: Spirit Tracks. Rare. Class: Armored Electric Slime. Role: Defensive Tank.
- Personal skill, Permanent Conduction: keeps its electric coating even when stunned. Ordinary contact melee does no damage to it and shocks the attacker instead.
- Abilities:
  - Metallic Slam (5 STA): heavy physical plus lightning damage.
  - Static Field (8 MP): persistent electric field around itself for 3 turns.
  - Electrical Counter (4 STA): powerful retaliatory shock.
  - Conductive Absorption (passive): +5 MP when struck by lightning.
- Weak to arrows and other ranged projectiles, explosives, sacred weapons and sword beams, and magnetic manipulation.
- Drop: Electrified Metal Gel.

## 6. Helmet ChuChu
- Origin: Spirit Tracks. Uncommon. Class: Armored Slime. Role: Physical Defender.
- Personal skill, Iron Helmet: +12 DEF while it wears its three-horned helmet, and immune to critical hits while the helmet stays on. A Whip can remove the helmet and throw it back.
- Abilities:
  - Helmet Bash (4 STA): heavy physical damage.
  - Horn Charge (6 STA): charges 3 spaces and knocks enemies back.
  - Armored Retreat (4 STA): +6 more DEF until its next turn.
  - Reequip Helmet (3 STA): picks up and equips a discarded adjacent helmet.
- Weak to whip disarms, magnetic manipulation and armor-piercing attacks.
- Drops: Red ChuChu Jelly and the ChuChu Iron Helmet.
- ChuChu Iron Helmet: head slot, rare, +12 DEF, +2 RES, weight 8, prevents critical hits, ChuChu units only. The helmet supplies the skill's +12 DEF; the two do not stack.

## Base stats
| Unit | HP | STR | MAG | SKL | SPD | DEF | RES | LCK | CON | MOV | STA | MP |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Standard | 16 | 5 | 4 | 5 | 7 | 3 | 5 | 6 | 4 | 5 | 18 | 12 |
| Fire | 18 | 6 | 14 | 7 | 8 | 4 | 10 | 5 | 5 | 5 | 20 | 30 |
| Ice | 18 | 5 | 15 | 8 | 6 | 5 | 12 | 5 | 5 | 5 | 18 | 32 |
| Electric | 16 | 5 | 16 | 9 | 12 | 3 | 11 | 6 | 4 | 6 | 18 | 35 |
| Metal | 28 | 12 | 15 | 8 | 4 | 22 | 14 | 4 | 16 | 4 | 24 | 35 |
| Helmet | 22 | 10 | 0 | 7 | 6 | 6 | 4 | 5 | 12 | 4 | 26 | 0 |

Helmet ChuChu's base DEF does not include the helmet.

## Elemental coating (Fire, Ice and Electric)
| Property | Charged | Discharged |
|---|---|---|
| Contact damage | Yes | No |
| Elemental burst | Available | Unavailable |
| Death explosion | Yes | No |
| Elemental MAG bonus | +4 | None |
| Duration | Until the burst is used | 2 turns, then automatic recovery |

- Reignite, Refreeze and Recharge recover the coating without waiting the 2 turns.
- Metal ChuChu has no discharged state.

## Fusion (all earlier ChuChu fusion rules still apply)
| Fusion | Result |
|---|---|
| Standard + Standard | Larger Standard |
| Fire + Fire | Larger Fire |
| Ice + Ice | Larger Ice |
| Electric + Electric | Larger Electric |
| Standard + an elemental | Larger matching elemental |
| Metal + Metal | Larger Metal |
| Helmet + Helmet | Larger Helmet |
| Two different elementals | Purple ChuChu |

- Metal and Helmet ChuChus cannot fuse with other variants while keeping their defences.
- A Helmet ChuChu must remove its helmet before merging with an ordinary ChuChu.

## Roster
- 14 ChuChus in all, not counting larger fusion forms.
- Existing: Red, Green, Yellow, Blue, Arrow, Dark, Purple and Rare.
- New: Standard, Fire, Ice, Electric, Metal and Helmet.
