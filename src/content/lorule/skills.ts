import type { SkillDef } from '../../engine/types';

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });

// Every effect lives in engine/lorule.ts (and loruleRun.ts for the ones that act between battles).
export const SKILLS: SkillDef[] = [
  // ── Named characters ──
  k('betweenWorlds', 'Between Worlds', 'Can merge into walls (Wall Merge): 5 MP to merge, 2 MP per wall space travelled, 5 MP each turn to stay merged. Merged, he can\'t be hit by ordinary melee.'),
  k('hyrulesLight', "Hyrule's Light", 'Allies within 2 deal sacred damage (+20% against demons and the undead) and shake off curses at the start of each turn.'),
  k('fallenKingdom', 'Fallen Kingdom', 'Allies grow stronger as the army\'s casualties rise: +1 STR, MAG and DEF for every allied casualty this battle (up to +5).'),
  k('resourcefulMerchant', 'Resourceful Merchant', 'Exchanges, lends and briefly upgrades allied equipment in battle (Merchant\'s Loan); rentals cost him nothing to move between allies.'),
  k('livingPortrait', 'Living Portrait', 'Can turn enemies into paintings (Painting Prison: 3 turns, bosses 1). His painting magic can hit wall-merged and painted units.'),
  k('itemRetrieval', 'Item Retrieval', 'Picks up weapons dropped on the field as he passes; after a battle he survives, he brings home the equipment of fallen allies (rentals still go back to Ravio).'),
  k('veteranHero', 'Veteran Hero', 'Against sword users: +20 Hit, +10 Crit, and his counterattacks deal 30% more damage.'),
  k('mothersGiftSkill', "Mother's Gift", 'Mother of a hundred: allied Baby Maiamai within 3 gain +4 DEF and RES. Her Gift briefly enhances allied weapons and tools.'),
  k('hiddenChild', 'Hidden Child', 'Clings to walls and trees (walls cost it 2 movement; +20 Avoid next to a wall or tree) and to larger allies (Hitch Ride).'),
  k('masterTempering', 'Master Tempering', 'Allies within 1 deal +2 damage; after each victory every worn weapon in the army recovers 5 uses.'),
  k('insideKnowledge', 'Inside Knowledge', 'Reveals traps, hidden doors and hidden enemies within 5 at the start of each turn; Rupee Traps near her are disarmed.'),
  // ── The Seven Sages ──
  k('forestChild', 'Forest Child', 'Forests cost 1 movement; +20 Avoid in forests, and concealed (veiled) there at the start of each turn.'),
  k('sagesConfidence', "Sage's Confidence", '+1 MAG and SKL for each enemy he has defeated this battle (up to +5).'),
  k('sanctuaryPrayer', 'Sanctuary', 'Creates protective healing spaces: allies within 1 recover 10% HP at the start of each turn and gain +3 RES.'),
  k('riverQueen', 'River Queen', 'Aquatic allies within 3 gain +3 STR and MAG, and +3 MOV while swimming.'),
  k('mountainStrengthLB', 'Mountain Strength', 'More carrying capacity (+1 pack slot of bombs: never slowed by heavy weapons) and +30% damage against obstacles (armoured units, constructs and stone).'),
  k('witchTransportation', 'Witch Transportation', 'Carries an allied size-1 unit across the field on her broom (Transport).'),
  k('royalProtection', 'Royal Protection', 'Intercepts attacks on adjacent royalty (princesses, queens and kings).'),
  // ── Generics ──
  k('desperateDefense', 'Desperate Defense', '+3 DEF below half HP.'),
  k('piercingFormation', 'Piercing Formation', '+3 damage when another spear-wielding ally is next to it or to the target.'),
  k('fallenGuard', "Fallen Kingdom's Guard", 'Darkness deals 30% less damage, and it can\'t be Cursed.'),
  // ── Monsters ──
  k('greedySwallow', 'Greedy Swallow', 'Steals Rupees instead of eating equipment (₹15–30 a hit); defeat it to get them back.'),
  k('electricalMembrane', 'Electrical Membrane', 'Electrified on even turns: melee attackers take shock damage. Splits into two Biri when defeated.'),
  k('tinyConductor', 'Tiny Conductor', 'Shares an enemy\'s space (Micro) and shocks it now and then at the start of its turn.'),
  k('elementalConstruct', 'Elemental Construct', 'Takes a Fire or an Ice Core at the start of battle: its attacks take that element. Hammers and bombs knock the core out.'),
  k('slidingAssault', 'Sliding Assault', 'On ice: +2 MOV and +4 damage.'),
  k('sandHunter', 'Sand Hunter', 'Hides under the sand of desert battlefields until an enemy comes close; +30% damage when it strikes from hiding.'),
  // ── Bosses ──
  k('layeredBody', 'Layered Body', 'Four rotating segments: 30% less damage while any remain. Each strong hit (10+) or wind attack destroys one (wind: two): −3 DEF and +2 SPD per segment lost.'),
  k('gemstoneArmor', 'Gemstone Armor', 'Its gem-covered mask (40 points) absorbs 70% of damage until shattered (hammers and bombs break it twice as fast); then its weak point is exposed (+30% damage taken). Hits shed Rupees.'),
  k('crushingPalm', 'Crushing Palm', 'Pins smaller units it hits (Rooted for a turn). Weak to its exposed eye and to wall-mergers: units that can wall-merge deal +50% damage to it.'),
  k('headlessWarrior', 'Headless Warrior', 'Detaches its head as a temporary summon that attacks on its own. Fights with sword and shield: −30% damage from ranged physical attacks.'),
  k('rootedAmbush', 'Rooted Ambush', 'Relocates between connected sand spaces: every other turn it burrows and erupts next to an enemy, without crossing the terrain between.'),
  k('frozenShell', 'Frozen Shell', 'A regenerating ice barrier (25 points, +12 a turn) absorbs damage before its HP. Fire deals +50% and shatters the shell (it doesn\'t regrow next turn).'),
  k('lavaDweller', 'Lava Dweller', 'Regenerates 10% HP a turn on or next to lava; every third turn it submerges and erupts beneath an enemy (fire damage to everyone around it).'),
  k('fusionOfPower', 'Fusion of Power', 'Ganon\'s strength with Yuga\'s magic: +20% damage with dark and lightning, and he can wall-merge despite his size (Dark World Merge).'),
  k('cycloneSwarm', 'Cyclone Swarm', 'At the start of its turn, small tornadoes strike up to two enemies within 3 (MAG/3 damage, pushed back a space).'),
  k('electricalDivision', 'Electrical Division', 'Electrified on even turns (melee attackers are shocked); splits into three Bari when destroyed.'),
  k('iceCommander', 'Ice Commander', 'Pengators within 3 gain +3 STR and SPD; its own sliding charges deal +4 damage after moving 3 or more spaces.'),
];
