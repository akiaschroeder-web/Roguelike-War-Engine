import type { SkillDef } from '../../engine/types';

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });

export const SKILLS: SkillDef[] = [
  // ── Named characters ──
  k('fortuneSeeker', 'Fortune Seeker', 'Treasure and salvage rewards +30%: battle salvage, treasure Rupees and the after-battle haul.'),
  k('phantomHourglassSkill', 'Phantom Hourglass', 'Stops time for one ally (Time Stop): it can move and attack again, and its next attack draws no retaliation. Hourglass abilities cost her 25% less time.'),
  k('oceanKingsWisdom', "Ocean King's Wisdom", 'Allies within 2 recover 5 MP at the start of each turn.'),
  k('masterOfTheSeasPH', 'Master of the Seas', 'Allied aquatic and naval units (swimmers, sea creatures and vessels) gain +3 DEF, RES and MOV.'),
  k('sacredFlame', 'Sacred Flame', 'Allies within 2 deal +3 extra fire damage with their attacks.'),
  k('sacredProtection', 'Sacred Protection', 'Allies within 2 take 20% less damage.'),
  k('relentlessPursuitPH', 'Relentless Pursuit', '+4 STR and SPD against an enemy she has already attacked this battle.'),
  k('mermaidsCharm', "Mermaid's Charm", 'Enemies within 2 are distracted (−10 Hit); allies within 2 have their spirits raised (+5 Hit).'),
  k('foresight', 'Foresight', 'At the start of each turn, hidden enemies and traps within 6 are revealed. Reinforcements and hazards are announced.'),
  k('mechanicalExpertise', 'Mechanical Expertise', 'At the start of each turn, adjacent allied vessels and constructs recover 10% HP and one knocked-out ship component.'),
  k('sacredForging', 'Sacred Forging', 'After each victory every worn weapon in the army is repaired by 5 uses (10 with his Forging Hammer).'),
  k('rollingCharge', 'Rolling Charge', 'Rolls through narrow passages (Goron Roll) and counts as striking from behind: Phantoms and frontal armor don\'t stop him.'),
  k('islandChief', 'Island Chief', 'Allied Gorons within 3 gain +3 STR and DEF.'),
  k('royalEngineering', 'Royal Engineering', 'Summons a temporary Cobble construct to fight beside him (Royal Engineering).'),
  k('ancientLoyalty', 'Ancient Loyalty', '+4 DEF while adjacent to the allied commander.'),
  k('royalChallenger', 'Royal Challenger', '+25% damage against enemy commanders and bosses.'),
  k('knightsTrial', "Knight's Trial", '+50% experience from defeating elite enemies and bosses.'),
  k('chiefOfTheFrost', 'Chief of the Frost', 'Allied Anouki and Yook within 4 gain +3 DEF, +3 RES and +1 MOV.'),
  // ── Anouki and Yook ──
  k('frozenFighter', 'Frozen Fighter', '+3 STR on snow or ice (frozen water, ice blocks, or anywhere on the Isle of Frost). Anouki are never Frozen and ignore snow penalties.'),
  k('iceTracker', 'Ice Tracker', 'At the start of each turn, hidden enemies within 3 are revealed.'),
  k('frostMagic', 'Frost Magic', 'Ice spells and abilities cost 25% less MP.'),
  k('winterGuard', 'Winter Guard', 'Adjacent allies can\'t be Frozen and take 25% less ice damage.'),
  k('heavyBlow', 'Heavy Blow', 'Melee hits knock the target back 1 space.'),
  k('frozenBreathSkill', 'Frozen Breath', 'Breathes a cone of freezing air (Frozen Breath).'),
  k('frozenRage', 'Frozen Rage', '+1 STR for every 10% of HP lost.'),
  // ── Monsters ──
  k('phantomArmorSkill', 'Phantom Armor', 'Immune to ordinary weapon attacks from the front (the way it faces: toward the last enemy it attacked or approached). Vulnerable from behind and the sides, to sacred weapons (the Phantom Sword, light), and while time is stopped (Time Freeze, Sacred Opening). Without the Phantom Sword they can\'t really be beaten: a rout is won once only Phantoms are left.'),
  k('relentlessChase', 'Relentless Chase', 'Phantom Armor, and +4 MOV while pursuing a detected enemy (an alarm is raised or an enemy is in sight within 6).'),
  k('spectralWarp', 'Spectral Warp', 'Phantom Armor, and teleports next to enemies spotted by Phantom Eyes (or an alarm).'),
  k('phantomAlarmSkill', 'Alarm', 'Reveals hidden enemies within 3 and raises the alarm: every Phantom on the field gives chase.'),
  k('shieldedAssault', 'Shielded Assault', 'Its shield blocks half the damage from the front. Breathes fire.'),
  // ── Bosses ──
  k('flameDivision', 'Flame Division', 'Below 75% HP it splits into three small flames that attack on their own while its body is untouchable. A boomerang (or any hit with a boomerang-type weapon) forces them to recombine, leaving it exposed; each flame destroyed burns away 10% of its HP.'),
  k('tornadoRider', 'Tornado Rider', 'Airborne: out of melee reach, and arrows and magic deal half damage. An explosive set off at or next to a Whirlwind (or thrown by someone standing next to one) knocks it down for 2 turns.'),
  k('invisibleHunter', 'Invisible Hunter', 'Invisible while its shell is intact (it fades at the start of each turn). Detection reveals it; four hits (or two heavy hits or explosions) break the shell for good.'),
  k('deadMansVolley', "Dead Man's Volley", 'Its spells rebound between the sisters: +3 damage for every other Cubus Sister within 4 of the target. With all four deployed together: +4 MAG, +3 RES and the Combined Barrage.'),
  k('exposedInterior', 'Exposed Interior', 'Frontal armor blocks 80% of damage. An explosion or a hammer blow knocks it over for a turn: then every hit lands on its soft belly (×1.5, explosives ×2).'),
  k('structuralWeakness', 'Structural Weakness', 'Four joints: while all stand, damage is halved. Heavy hits, explosions or any hit of 12% of its HP break a joint (−3 STR and −1 MOV each); with no joints left it takes 50% more damage. It rebuilds once (Ancient Reconstruction).'),
  k('lifeForceConsumption', 'Life Force Consumption', 'Recovers 15% HP and 10 MP whenever an enemy dies within 4. Drains 5% HP from enemies within 2 each turn. Takes half damage unless exposed (Sacred Opening, time stop, the Phantom Sword).'),
  k('possessedArmor', 'Possessed Armor', 'Frontal attacks deal 75% less damage. Time-stopping abilities expose Bellum\'s eye for 2 turns: no frontal protection and +50% damage taken.'),
  k('spectralFleet', 'Spectral Fleet', 'Every other turn it calls up spectral enemies from the deep. Bellum rides it: half damage until exposed.'),
  // ── Vessels ──
  k('strongSalvage', 'Strong Salvage', 'Salvages Submerged Treasure from 2 spaces away and hauls up more (+50% salvage Rupees).'),
  k('fastPursuit', 'Fast Pursuit', '+2 MOV; passengers board and land without ending their turn.'),
  // ── The Potion Shop Lady ──
  k('oldRecipes', 'Old Recipes', 'Potions and medicines she uses heal 30% more; once per battle she can use a pack item on an ally up to 2 spaces away without using her action (Quick Remedy). Brew: after each victory she turns an ingredient in the convoy (a mushroom, ChuChu jelly, toadstool) into a random potion. Mixing Shop: at a potion shop she mixes two potions into a stronger one.'),
  // ── The Subrosians ──
  k('secretKey', 'Secret Key', 'Opens adjacent Locked Doors without a key (Secret Key) and reveals hidden passages and Invisible Floors within 2 at the start of each turn.'),
  k('volcanicNative', 'Volcanic Native', '+3 STR and DEF when standing on or next to lava. Subrosians take no lava damage.'),
  k('subrosianDance', 'Subrosian Dance', 'Dances so an adjacent ally can act again (Subrosian Dance).'),
  k('masterSmith', 'Master Smith', 'Repairs an adjacent ally\'s equipped weapon during battle (Master Smith).'),
  k('oreHunter', 'Ore Hunter', 'Every map hides an extra buried treasure; after each victory, 50% chance to dig up Ore Chunks (and sometimes a crafting material).'),
  k('volcanicMagic', 'Volcanic Magic', 'Fire spells and abilities cost 25% less MP.'),
  k('lavaCooking', 'Lava Cooking', 'After each victory, cooks a Lava Soup from what was collected (40% chance).'),
  k('sneakySwap', 'Sneaky Swap', 'Steals an adjacent enemy\'s unequipped pack item (Sneaky Swap) — or whatever it has in its pockets.'),
];
