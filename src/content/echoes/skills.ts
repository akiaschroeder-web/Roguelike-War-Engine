import type { SkillDef } from '../../engine/types';

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });

// The King reuses The Minish Cap's Royal Authority (Hyrule soldiers within 4 gain +3 STR and DEF).
export const SKILLS: SkillDef[] = [
  // ── Named characters ──
  k('wisdomOfThePrincess', 'Wisdom of the Princess', 'Summons Echoes of learned monsters and objects (Create Echo), binds and follows them, and takes Swordfighter Form (Energy).'),
  k('mysteriousSwordsman', 'Mysterious Swordsman', '+30% damage against Rift creatures and Echoes.'),
  k('powerOfCreation', 'Power of Creation', 'Allied summoners in the battle have +1 Echo Capacity (+2 from Tri level 6); Tri repairs unstable Rift spaces (Restoration).'),
  k('royalOffensive', 'Royal Offensive', 'Stronger coordinated infantry attacks: allied infantry within 3 deal +3 damage to a foe that another ally is next to.'),
  k('strategicWisdom', 'Strategic Wisdom', 'Cheaper commander abilities: battle orders cost 1 less CP (minimum 1), and allies within 2 pay 15% less MP.'),
  k('hiddenStrength', 'Hidden Strength', '+3 damage in melee, and counterattacks deal +4 more.'),
  k('mightResearch', 'Might Research', 'Better Swordfighter gear and Energy recovery: allies within 3 recover 4 Energy a turn and Mighty weapons gain +2 Might near Lueburry.'),
  k('mechanicalGenius', 'Mechanical Genius', 'Builds and repairs Automatons: allied Automatons within 2 gain +2 DEF and recover 3 Wind-Up Energy a turn; Rewind and Repair.'),
  k('growingCourage', 'Growing Courage', 'Each time an ally within 3 takes damage, +1 STR and DEF for the battle (up to +6).'),
  k('desertAuthority', 'Desert Authority', 'Allied Gerudo within 3 gain +3 STR and SKL.'),
  k('desertTactics', 'Desert Tactics', 'In the desert or on sand: +1 MOV, +2 STR and +5 Avoid.'),
  k('riverPercussion', 'River Percussion', 'River Zora within 3 gain +3 STR and MAG; water magic around him is 20% stronger.'),
  k('oceanMelody', 'Ocean Melody', 'Aquatic allies within 2 recover 10% HP at the start of each turn; her healing on aquatic allies +30%.'),
  k('gentleGiant', 'Gentle Giant', 'Cold resistance (half ice damage, no Freeze), double damage to objects and constructs; carries allies (+1 MOV to adjacent allies at turn start).'),
  k('stampEnthusiast', 'Stamp Enthusiast', 'More exploration and treasure rewards: +20% battle Rupees, and an extra stamp at every Stamp Station.'),
  k('falseWisdom', 'False Wisdom', 'Creates hostile Echoes, and copies enemy summoning: whenever a foe summons an Echo, she summons one too (if she has the capacity).'),
  // ── Monsters ──
  k('livingFlameEoW', 'Living Flame', 'Ignites on contact: its attacks Burn, and melee attackers may catch fire. Immune to fire.'),
  k('waterAbsorption', 'Water Absorption', 'Next to water at the start of its turn it absorbs it; after 2 turns it swells (+50% max HP, +4 STR and DEF).'),
  k('rollingShell', 'Rolling Shell', 'Rolls in a straight line: +1 damage per space moved before attacking (up to +4), and bounces off obstacles unharmed.'),
  k('livingCyclone', 'Living Cyclone', 'At the start of its turn, pushes adjacent enemies (size 1) 1 space away.'),
  k('tauntingCroak', 'Taunting Croak', 'Draws attention: enemies within 2 of it attack it if they can.'),
  k('rainSong', 'Rain Song', 'Every third turn it calls local rain: fires go out and the field is wet (lightning hits harder, fire weaker).'),
  k('burrower', 'Burrower', 'Digs holes and underground passages: every other turn it reappears next to the nearest enemy.'),
  k('livingPlatform', 'Living Platform', 'Lifts allies, then falls to crush: an ally next to it has +15 Hit; when it is defeated, it crushes adjacent enemies (8 damage).'),
  k('silkClimber', 'Silk Climber', 'Makes climbable silk strands: walls and mountains cost it 2, and its bite can root.'),
  k('wallCrawler', 'Wall Crawler', 'Climbs walls (cost 2) and carries Micro units.'),
  k('stoneBody', 'Stone Body', 'High physical resistance (−40% physical damage); immune to ordinary fire.'),
  k('aquaticPredator', 'Aquatic Predator', '+30% damage against enemies standing in water.'),
  // ── Automatons ──
  k('mechanicalLeap', 'Mechanical Leap', 'Leaps 2–4 spaces and damages whatever it lands next to (Mechanical Leap).'),
  k('rapidFire', 'Rapid Fire', 'Several projectiles in one attack (its cannon fires twice).'),
  k('musicalBubbles', 'Musical Bubbles', 'Damaging bubbles over nearby spaces (Musical Bubbles).'),
  k('mechanicalMaw', 'Mechanical Maw', 'Instantly eats a weakened (below 30% HP) smaller enemy next to it (Mechanical Maw).'),
  k('mechanicalSwordmaster', 'Mechanical Swordmaster', 'Powerful sweeping sword attacks: half damage to everyone else next to it.'),
  k('goldenPeck', 'Golden Peck', 'Enemies it hits drop extra Rupees (+₹15 a hit).'),
  // ── Bosses ──
  k('floatingCore', 'Floating Core', 'Takes 70% damage while its core is in place. Bind pulls the core out (Weak Point Extraction): it takes 125% for 2 turns. Bombs loosen it for a turn.'),
  k('desertBurrower', 'Desert Burrower', 'Travels under the sand: −30% damage taken while burrowed (it burrows every other turn); Burrowing Ambush brings it up under an enemy. Bind drags it out.'),
  k('whirlpoolMaster', 'Whirlpool Master', 'At the start of its turn, the current pulls enemies within 4 one space toward it.'),
  k('elementalHelmet', 'Elemental Helmet', 'Its helmet alternates fire (odd turns) and ice (even turns) protection: −40% damage, except from the opposing element, which shatters its horns (+30% damage taken for 2 turns).'),
  k('protectiveBubble', 'Protective Bubble', 'Shielded by a bubble (−60% damage) that pops after 15 damage, to a Bind, or to an arrow; summons Biri to defend it.'),
  k('primordialNothingness', 'Primordial Nothingness', 'Many arms (4), each attacking a foe within 3 at the start of its turn; half damage while any arm remains, and a strong hit (12+) destroys one. Creates Rift spaces, summons Echoes and reflections of bosses. On your side it has no arms, and outside the Still World it is starved of Rifts: −45% STR, MAG, DEF and RES, −4 SPD, and it enters battle at no more than 60% HP.'),
];
