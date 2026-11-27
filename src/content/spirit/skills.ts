import type { SkillDef } from '../../engine/types';

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });

export const SKILLS: SkillDef[] = [
  // ── Named characters ──
  k('spiritEngineer', 'Spirit Engineer', 'Allied trains get +1 MOV, and trains next to him recover 10% HP and a knocked-out part each turn. +10 Hit. He repairs Broken Track without using his action.'),
  k('unboundSpirit', 'Unbound Spirit', 'Zelda can leave her body (Spirit Form): as a spirit she passes through walls, takes half damage from ordinary physical attacks (but 50% more from sacred and demonic ones), and can possess an adjacent Phantom that has been exposed (a sacred weapon, Sacred Opening, Song of Light) or stunned. If the possessed armor is destroyed she returns to spirit form instead of dying.'),
  k('royalGuardianST', 'Royal Guardian', 'Once per enemy phase, takes the hit for an ally within 2. Carries an adjacent size-1 ally over spikes, pits and water (Transport).'),
  k('masterEngineer', 'Master Engineer', 'Repairs trains and machines (Master Repair: 30% HP and a knocked-out part, or an ally\'s weapon as good as new). After each victory he mends 5 uses on every worn weapon in the army. Repairs Broken Track without using his action.'),
  k('livingHistory', 'Living History', 'Allies gain 20% more experience and support points after each victory. Keeps the Stamp Book.'),
  k('demonicInfluence', 'Demonic Influence', 'Possessed and demonic allies within 3 gain +3 STR and MAG.'),
  k('ironGauntletSkill', 'Iron Gauntlet', 'Grabs, pulls and throws enemies with his arm (Iron Grab, Gauntlet Throw). Melee attacks ignore 15% of DEF.'),
  k('sacredGuardian', 'Sacred Guardian', 'Allies within 2 can\'t be possessed or cursed and take 25% less dark damage.'),
  k('railwayKnowledge', 'Railway Knowledge', 'At the start of each turn, hidden enemies and traps within 6 are revealed. In train battles, Broken Track within 3 is mended at the start of the battle and reinforcements are announced.'),
  k('inheritedFortune', 'Inherited Fortune', 'Treasure and collectible materials are worth 30% more: treasure Rupees, sold treasures and the after-battle haul.'),
  k('swordTraining', 'Sword Training', 'Allies within 2 who wield swords gain +2 SKL and +5 Hit, and sword users who fought beside him earn 20% more experience.'),
  // ── Lokomo sages ──
  k('forestMelodyST', 'Forest Melody', 'Allies within 2 recover 10% HP and 3 STA at the start of each turn.'),
  k('snowMelody', 'Snow Melody', 'Allies within 2 take half ice damage and can\'t be Frozen; ice magic used near him is 25% stronger.'),
  k('oceanMelody', 'Ocean Melody', 'Allies within 2 swim (water costs 1) and their water magic is 25% stronger.'),
  k('fireMelody', 'Fire Melody', 'Allies within 2 take half fire damage, can\'t be Burned, and their weapon attacks deal +2 fire damage.'),
  k('sandMelody', 'Sand Melody', 'Allies within 2 ignore desert and sand penalties (sand, quicksand and dunes cost 1) and gain +2 DEF; earth magic near him is 25% stronger.'),
  // ── Big Blin ──
  k('blinBrute', 'Blin Brute', '+2 STR and +2 DEF for each allied Miniblin within 3 (up to +6 each).'),
  // ── Monsters ──
  k('livingTorch', 'Living Torch', 'Phantom armor (immune to ordinary frontal attacks). Lights the dark: reveals hidden units within 3, and its melee hits inflict Burning.'),
  k('rollingDestruction', 'Rolling Destruction', 'Phantom armor. Curls into a rolling armored ball (Wrecking Roll) that crushes obstacles and enemies in a straight line.'),
  k('eliteReptilian', 'Elite Reptilian', 'Its shield blocks half the damage from the front; breathes stronger fire than a Geozard.'),
  k('sandAmbushST', 'Sand Ambush', 'Burrows under sand and plain ground (hidden) and emerges to strike: +50% damage on the first attack after surfacing.'),
  k('keyTheftSkill', 'Key Theft', 'Steals a carried item from an adjacent enemy and runs (Key Theft). Very fast.'),
  // ── Bosses ──
  k('armoredInsectSkill', 'Armored Insect', 'Heavy frontal armor: attacks from the front deal 80% less. Wind (the Whirlwind, wind magic, a gust) blows its armor open for 2 turns, exposing its abdomen (×1.5). Spreads poison clouds.'),
  k('iceAndFire', 'Master of Ice and Fire', 'Alternates fire and ice forms each turn: immune to its own element and takes double damage from the other. Below half HP it splits into two smaller bodies.'),
  k('thornedMenaceSkill', 'Thorned Menace', 'Poison tentacles and thorns control the spaces around it: enemies within 2 take 5% HP and may be Poisoned at the start of each turn. Takes half damage until an explosive or a sacred weapon exposes it.'),
  k('lavaColossusSkill', 'Lava Colossus', '+10 DEF and RES on or next to lava. Its armored body halves damage until an explosion (or Sand Wand pillars) exposes its weak point for 2 turns.'),
  k('ancientDemonSkill', 'Ancient Demon', 'Armored body: half damage unless exposed. Its boulders can be turned back by a Whirlwind (or a shield-bearer\'s parry): the boulder smashes its armor (exposed for 2 turns).'),
  k('demonicIncarnation', 'Demonic Incarnation', '+2 STR and MAG for each allied demon that falls (up to +10). Sacred weapons deal ×1.5 to him; the Song of Restoration weakens him.'),
  k('stolenVesselSkill', 'Stolen Vessel', 'Zelda\'s sacred power in Malladus\'s hands: dark magic +25%, and ordinary attacks deal half damage. Sacred weapons and light strike her in full.'),
  // ── Trains ──
  k('spiritLocomotive', 'Spirit Locomotive', 'On the Spirit Tracks it gains +3 STR and DEF. Passengers board and land at stations without ending their turn.'),
  k('armoredPlating', 'Armored Plating', 'Damage taken −20%; immune to knockback.'),
  k('darkCollision', 'Dark Collision', 'Its collision attacks deal +50% damage, and double to anyone standing on a Railway Crossing.'),
  k('multiCarTrain', 'Multi-Car Train', 'A boss train of many cars with independent weapons: after it attacks, two of its cars fire at other enemies within 4. Takes half damage until a car is knocked out (any hit of 15% of its HP).'),
  // ── The new ChuChus ──
  k('elementalAdaptation', 'Elemental Adaptation', 'When struck by fire, ice or lightning damage, it turns into the matching elemental ChuChu (Fire, Ice or Electric), keeping its level, experience and HP percentage.'),
  k('combustibleBody', 'Combustible Body', 'Immune to fire damage and Burning. While coated, direct melee attackers take fire damage and it explodes on death, damaging every adjacent unit. Coating: +4 MAG; Flame Burst uses it up for 2 turns.'),
  k('frozenBody', 'Frozen Body', 'Immune to ice damage and freezing. While coated, direct melee attackers may be Frozen and it bursts into a freezing explosion on death. Coating: +4 MAG; Frost Burst uses it up for 2 turns.'),
  k('volatileCharge', 'Volatile Charge', 'Immune to lightning damage and Shock. While coated, direct melee attackers take electrical damage and it explodes on death. Coating: +4 MAG; Discharge uses it up for 2 turns.'),
  k('permanentConduction', 'Permanent Conduction', 'Its electric coating never fades. Ordinary contact melee does no damage and shocks the attacker instead; arrows and other ranged attacks, explosives, sacred weapons and sword beams hit it for ×1.5. Struck by lightning: +5 MP (Conductive Absorption).'),
  k('ironHelmet', 'Iron Helmet', '+12 DEF while it wears its three-horned helmet (the ChuChu Iron Helmet supplies it if worn; they don\'t stack) and immune to critical hits. A Whip knocks the helmet off; Reequip Helmet puts it back.'),
];
