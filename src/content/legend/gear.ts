import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), body = gs('body'), acc = gs('accessory'), hands = gs('hands'), feet = gs('feet'), head = gs('head'), mount = gs('mount');
/** A Magic Ring (accessory). Identical rings don't stack (the second copy does nothing). */
const ring = (id: string, name: string, rarity: Rarity, desc: string, lg: string[] = [], stats: GearDef['stats'] = {}): GearDef =>
  ({ id, name, slot: 'accessory', rarity, price: Math.round(PRICE[rarity] * 0.6), stats, desc, lg: ['ring', ...lg] });

// Section 6 (A Link to the Past, Link's Awakening, the Oracles), section 9 character gear and
// section 8's Magic Rings. Returning gear is the existing entry: Mirror Shield, Power Bracelets,
// Lantern. Functionally different same-name rings get Oracle-specific ids (Red Ring, Blue Ring).
export const GEAR: GearDef[] = [
  // ── A Link to the Past ──
  shield('fightersShield', "Fighter's Shield", 'common', { def: 2, block: 20 }, '+2 DEF, 20% block; blocks ordinary projectiles (ranged physical attacks, +10% block).', { lg: ['projectileGuard'] }),
  shield('redShield', 'Red Shield', 'rare', { def: 4, res: 2, block: 25 }, '+4 DEF, +2 RES, 25% block; blocks fireballs and stronger arrows (fire and ranged damage −25%).', { lg: ['projectileGuard', 'fireGuard'] }),
  body('blueMail', 'Blue Mail', 'epic', { def: 2 }, 'Damage taken −25%.', { lg: ['damage75'] }),
  body('redMail', 'Red Mail', 'legendary', { def: 3 }, 'Damage taken −50%.', { lg: ['damage50'], unique: true }),
  body('magicCape', 'Magic Cape', 'legendary', { res: 3 }, 'Cloak (Magic Cape ability): invisible and intangible — untargetable, can\'t attack — for 4 MP a turn.', { lg: ['cape'] }),
  feet('pegasusBoots', 'Pegasus Boots', 'epic', { mov: 2 }, '+2 MOV. Pegasus Dash: a straight-line charge that damages the first enemy hit.', { lg: ['pegasusBoots'] }),
  hands('powerGlove', 'Power Glove', 'rare', { con: 5 }, '+5 effective STR for lifting: rocks, pots and Wooden Stakes (+5 CON).', { lg: ['lift5'] }),
  hands('titansMitt', "Titan's Mitt", 'legendary', { con: 12, str: 2 }, '+12 effective STR for lifting (+12 CON, +2 STR): even the heaviest boulders.', { lg: ['lift12'] }),
  acc('moonPearl', 'Moon Pearl', 'legendary', {}, 'No involuntary Dark World transformation: the holder keeps its own shape in the Dark World.', { lg: ['moonPearl'], unique: true }),
  acc('magicMirror', 'Magic Mirror', 'epic', {}, 'Warp from the Dark World back to the corresponding Light World spot (Magic Mirror ability) — the whole field returns.', { lg: ['magicMirror'], unique: true }),
  acc('bookOfMudora', 'Book of Mudora', 'epic', { mag: 1 }, 'Deciphers Hylian inscriptions: unlocks sacred encounters, and spells cost 10% less.', { lg: ['mudora'], unique: true }),
  acc('bugCatchingNet', 'Bug-Catching Net', 'uncommon', { avoid: 5 }, 'Catches insects (Bees, Golden Bees and fairies after battle) and reflects some magic (25% chance to halve a spell).', { lg: ['net'] }),
  feet('zorasFlippers', "Zora's Flippers", 'rare', {}, 'Swimming: deep water and Underwater Floor cost 1 movement.', { effects: ['swim'], lg: ['flippers'] }),
  acc('pendantOfCourage', 'Pendant of Courage', 'epic', { str: 3, skl: 3 }, '+3 STR and SKL. One of the three Pendants of Virtue.', { lg: ['pendant'], unique: true }),
  acc('pendantOfWisdom', 'Pendant of Wisdom', 'epic', { mag: 3, res: 3 }, '+3 MAG and RES. One of the three Pendants of Virtue.', { lg: ['pendant'], unique: true }),
  acc('pendantOfPower', 'Pendant of Power', 'epic', { def: 3, con: 3 }, '+3 DEF and CON. One of the three Pendants of Virtue.', { lg: ['pendant'], unique: true }),
  acc('bombosMedallion', 'Bombos Medallion', 'legendary', {}, 'Bombos (20 MP): a field-wide firestorm — every enemy takes MAG/2 + 8 fire damage and may Burn.', { lg: ['medallion'], unique: true }),
  acc('etherMedallion', 'Ether Medallion', 'legendary', {}, 'Ether (20 MP): enemies vulnerable to ice freeze (every enemy is struck by ice; most are Frozen), and Invisible Floors and hidden foes are revealed.', { lg: ['medallion'], unique: true }),
  acc('quakeMedallion', 'Quake Medallion', 'legendary', {}, 'Quake (20 MP): every grounded enemy takes STR/2 + 8; weaker ordinary monsters may be turned into harmless creatures (Stunned 2 turns).', { lg: ['medallion'], unique: true }),
  // ── Link's Awakening ──
  acc('rocsFeather', "Roc's Feather", 'rare', {}, 'Jump: leap over a one-space obstacle or unit (Roc\'s Jump), and pits and gaps don\'t stop you.', { lg: ['jump1'] }),
  hands('powerBraceletL2', 'Power Bracelet Lv. 2', 'epic', { str: 6, con: 10 }, 'The upgraded Power Bracelet: +6 STR, +10 CON; lift very heavy objects (Wooden Stakes, Somaria Blocks, iron balls).', { lg: ['lift12'] }),
  // ── The Oracles ──
  hands('magneticGloves', 'Magnetic Gloves', 'epic', {}, 'Attract or repel metal (Magnetic Pull): drag a metal-armored enemy or Magnetic Orb 2 spaces toward or away from you.', { lg: ['magnet'] }),
  acc('rocsCape', "Roc's Cape", 'epic', { avoid: 5 }, 'Long jumps: leap to a free space up to 3 away over anything (Roc\'s Jump), +5 Avoid.', { lg: ['jump3'] }),
  body('mermaidSuit', 'Mermaid Suit', 'epic', { def: 1 }, 'Underwater movement: swims, and +2 MOV while starting the turn in water.', { effects: ['swim'], lg: ['mermaid'] }),
  acc('mastersPlaque', "Master's Plaque", 'legendary', { crit: 10, hit: 10 }, 'Proof of sword mastery: +10 Hit and Critical, and +3 Might with swords.', { lg: ['plaque'] }),
  acc('slingshotEnhancement', 'Slingshot Enhancement', 'rare', {}, 'Any slingshot can fire mystical seeds from the satchel (chosen when attacking).', { lg: ['seedSlingshot'] }),
  // ── Section 9: character equipment ──
  body('agahnimsRobes', "Agahnim's Robes", 'legendary', { mag: 6, res: 6 }, '+6 MAG and RES.', { unique: true }),
  acc('windFishsBlessing', "Wind Fish's Blessing", 'mythic', {}, 'Immune to sleep and confusion; +3 MP each turn.', { effects: ['mpRegen'], lg: ['noSleep', 'mpRegen3'], unique: true }),
  acc('oraclesJewelry', "Oracle's Jewelry", 'legendary', { mag: 4, lck: 4 }, '+4 MAG and LCK.', { unique: true }),
  head('queenAmbisCrown', "Queen Ambi's Crown", 'epic', { res: 2 }, 'Adjacent allied defenders (units not moving this turn) gain +3 DEF.', { lg: ['crownAura'], unique: true }),
  hands('rickysBoxingGloves', "Ricky's Boxing Gloves", 'epic', { str: 2 }, '+6 Might with gauntlets and natural weapons; punches knock the target back a space.', { lg: ['boxing'], unique: true }),
  body('onoxsArmor', "Onox's Armor", 'legendary', { def: 12, spd: -2 }, '+12 DEF, −2 SPD.', { unique: true }),
  body('veransShadowGarb', "Veran's Shadow Garb", 'legendary', { mag: 7 }, '+7 MAG. Possession lasts a turn longer.', { lg: ['longPossession'], unique: true }),
  acc('trinexxsScale', "Trinexx's Scale", 'legendary', {}, 'Fire and ice damage −50%.', { lg: ['fireIceGuard'], unique: true }),
  head('helmasaurKingsMask', "Helmasaur King's Mask", 'legendary', { def: 4 }, '+12 DEF against attacks from in front (melee from an adjacent foe); heavy weapons and explosives ignore it.', { lg: ['frontalMask'], unique: true }),
  acc('medusasEye', "Medusa's Eye", 'legendary', { mag: 2 }, 'Magic critical hits Petrify the target for a turn.', { lg: ['petrifyCrit'], unique: true }),
  acc('nightmareEssence', 'Nightmare Essence', 'mythic', { mag: 2, str: 2 }, '+30% damage against sleeping, frightened and confused foes.', { lg: ['nightmareEssence'], unique: true }),
  // ── Animal companions (mount gear; the Strange Flute calls whoever is registered) ──
  mount('rickysFlute', "Ricky's Flute", 'epic', { mov: 2, str: 2 }, 'Ride Ricky: +2 MOV, +2 STR; hop up cliffs (mountains cost 2) and over one-space gaps.', { size: 2, art: 'ricky', effects: ['mountainWalker'], lg: ['companion', 'ricky'] }),
  mount('dimitrisFlute', "Dimitri's Flute", 'epic', { mov: 1, def: 3 }, 'Ride Dimitri: +1 MOV, +3 DEF; swims through water and currents without penalty.', { size: 2, art: 'dimitri', effects: ['swim'], lg: ['companion', 'dimitri'] }),
  mount('mooshsFlute', "Moosh's Flute", 'epic', { mov: 1, def: 2 }, 'Ride Moosh: +1 MOV, +2 DEF; fly over pits and obstacles, and ground-pound after landing.', { size: 2, art: 'moosh', effects: ['flight'], lg: ['companion', 'moosh'] }),

  // ── Magic Rings (section 8) ──
  // Combat and defense
  ring('friendshipRing', 'Friendship Ring', 'common', 'Support points grow 50% faster.', ['friendship']),
  ring('powerRingL1', 'Power Ring L-1', 'uncommon', '+3 STR, −1 DEF.', [], { str: 3, def: -1 }),
  ring('powerRingL2', 'Power Ring L-2', 'rare', '+6 STR, −2 DEF.', [], { str: 6, def: -2 }),
  ring('powerRingL3', 'Power Ring L-3', 'epic', '+10 STR, −4 DEF.', [], { str: 10, def: -4 }),
  ring('armorRingL1', 'Armor Ring L-1', 'uncommon', '+3 DEF, −1 STR.', [], { def: 3, str: -1 }),
  ring('armorRingL2', 'Armor Ring L-2', 'rare', '+6 DEF, −2 STR.', [], { def: 6, str: -2 }),
  ring('armorRingL3', 'Armor Ring L-3', 'epic', '+10 DEF, −4 STR.', [], { def: 10, str: -4 }),
  ring('redRingOracle', 'Red Ring (Oracle)', 'legendary', 'Physical damage dealt is doubled.', ['physical200']),
  ring('blueRingOracle', 'Blue Ring (Oracle)', 'legendary', 'Damage taken is halved.', ['damage50']),
  ring('greenRing', 'Green Ring', 'epic', 'Physical damage dealt +50%; damage taken −25%.', ['physical150', 'damage75']),
  ring('cursedRing', 'Cursed Ring', 'uncommon', 'Half damage dealt, double damage taken — and +50% Rupees after battle.', ['cursed']),
  ring('expertsRing', "Expert's Ring", 'epic', 'Strong unarmed attacks: +6 Might with gauntlets and natural weapons.', ['unarmed6']),
  ring('fistRing', 'Fist Ring', 'uncommon', 'Basic unarmed attacks: +2 Might with gauntlets and natural weapons.', ['unarmed2']),
  ring('spinRing', 'Spin Ring', 'epic', 'Spin attacks (Spin Attack, Hurricane Spin, Great Spin) hit twice.', ['spinTwice']),
  ring('chargeRing', 'Charge Ring', 'rare', 'Techniques and charged attacks cost 50% less stamina.', ['chargeThrift']),
  ring('energyRing', 'Energy Ring', 'rare', 'Sword beams below full HP, for 3 MP each.', ['energyBeam']),
  ring('victoryRing', 'Victory Ring', 'epic', '+3 STR and SKL in every battle after the wearer\'s army has beaten a boss (this run).', ['victory']),
  // Regeneration and protection
  ring('heartRingL1', 'Heart Ring L-1', 'rare', 'Regenerate 5% max HP each turn.', ['regen5']),
  ring('heartRingL2', 'Heart Ring L-2', 'epic', 'Regenerate 10% max HP each turn.', ['regen10']),
  ring('protectionRing', 'Protection Ring', 'epic', 'Once per battle, an ordinary hit is capped at 25% of max HP.', ['protection']),
  ring('blueLuckRing', 'Blue Luck Ring', 'uncommon', 'Beam damage (sword beams and magic beams) −50%.', ['beamGuard']),
  ring('redLuckRing', 'Red Luck Ring', 'uncommon', 'Spike damage −50% (blade and spike traps).', ['spikeGuard']),
  ring('greenLuckRing', 'Green Luck Ring', 'uncommon', 'Trap damage −50%.', ['trapGuard']),
  ring('goldLuckRing', 'Gold Luck Ring', 'rare', 'Falling damage −50% (pits, collapsing floors, falling blocks).', ['fallGuard']),
  ring('greenHolyRing', 'Green Holy Ring', 'rare', 'No damage from electric terrain and electric bodies (Buzz Blob shocks).', ['electricGuard']),
  ring('blueHolyRing', 'Blue Holy Ring', 'rare', 'Projectile hazards (Zora fireballs, energy balls) deal half damage.', ['projectileHazard']),
  ring('redHolyRing', 'Red Holy Ring', 'rare', 'No damage from small rocks (falling boulders and thrown rocks).', ['rockGuard']),
  ring('snowshoeRing', 'Snowshoe Ring', 'uncommon', 'No slipping on ice: frozen water and snowbanks cost 1 movement.', ['snowshoe']),
  ring('rocsRing', "Roc's Ring", 'uncommon', 'Cracked and collapsing floors don\'t collapse under you.', ['noCollapse']),
  ring('quicksandRing', 'Quicksand Ring', 'uncommon', 'No quicksand penalty (sinking sand and sand vortexes cost 1).', ['quicksand']),
  ring('zoraRing', 'Zora Ring', 'rare', 'Better underwater movement: Underwater Floor costs 1 and you can swim there.', ['zoraRing']),
  ring('swimmersRing', "Swimmer's Ring", 'rare', '+2 MOV while swimming (in water at the start of the turn).', ['swimmer']),
  ring('whispRing', 'Whisp Ring', 'rare', 'Immune to weapon-disabling curses (Curse and Bubbles\' jinx).', ['whisp']),
  ring('likeLikeRing', 'Like Like Ring', 'uncommon', 'Your equipment can\'t be stolen or knocked away.', ['noTheft']),
  // Utility and resources
  ring('bombproofRing', 'Bombproof Ring', 'uncommon', 'Your own bombs never hurt you.', ['bombproof']),
  ring('blastRing', 'Blast Ring', 'rare', 'Bomb damage +50%.', ['blast']),
  ring('rangRingL1', 'Rang Ring L-1', 'uncommon', '+3 Might with boomerangs.', ['rang3']),
  ring('rangRingL2', 'Rang Ring L-2', 'rare', '+6 Might with boomerangs.', ['rang6']),
  ring('tossRing', 'Toss Ring', 'uncommon', 'Throw twice as far: thrown items and bombs reach 2 spaces further.', ['toss']),
  ring('pegasusRing', 'Pegasus Ring', 'uncommon', 'Pegasus Seeds last twice as long.', ['pegasusLong']),
  ring('lightRingL1', 'Light Ring L-1', 'rare', 'Sword beams above 75% HP (not only at full).', ['light75']),
  ring('lightRingL2', 'Light Ring L-2', 'epic', 'Sword beams above 50% HP.', ['light50']),
  ring('steadfastRing', 'Steadfast Ring', 'uncommon', 'Half knockback: you can\'t be pushed more than a space.', ['steadfast']),
  ring('peaceRing', 'Peace Ring', 'uncommon', 'Carried explosives don\'t go off when you are hit.', ['peace']),
  ring('discoveryRing', 'Discovery Ring', 'rare', 'Senses buried treasure within 3 (dig spots are revealed).', ['discovery']),
  ring('goldJoyRing', 'Gold Joy Ring', 'epic', '×4 Rupees from defeated monsters\' drops (+30% battle Rupees).', ['goldJoy']),
  ring('redJoyRing', 'Red Joy Ring', 'rare', 'Double crafting materials after battle.', ['redJoy']),
  ring('blueJoyRing', 'Blue Joy Ring', 'rare', 'Double recovery: healing received +50%.', ['blueJoy']),
  ring('greenJoyRing', 'Green Joy Ring', 'rare', 'Double special monster drops.', ['greenJoy']),
  ring('octoRing', 'Octo Ring', 'uncommon', 'Become an Octorok (Transform ability): spit rocks from range 1–3, but no other weapons, for 3 turns.', ['octo']),
  ring('moblinRing', 'Moblin Ring', 'uncommon', 'Become a Moblin (Transform ability): +4 STR, spear in hand, for 3 turns; monsters hesitate (−10 Hit) against you.', ['moblin']),
  // Transformation and achievement
  ring('firstGenRing', 'First Gen Ring', 'rare', 'An NES-style look: +2 LCK and +5 Avoid.', [], { lck: 2, avoid: 5 }),
  ring('subrosianRing', 'Subrosian Ring', 'uncommon', 'A Subrosian disguise: unlocks restricted Subrosian encounters, and Subrosia\'s monsters ignore you beyond 2 spaces.', ['subrosian']),
  ring('firstRing', 'First Ring', 'rare', 'Awarded for the first campaign completion: +1 to every stat.', [], { str: 1, mag: 1, skl: 1, spd: 1, def: 1, res: 1, lck: 1 }),
  ring('hundredthRing', '100th Ring', 'rare', 'For 100 battles: +2 SKL and DEF.', [], { skl: 2, def: 2 }),
  ring('thousandthRing', '1000th Ring', 'legendary', 'For 1,000 battles: +4 to STR, MAG, DEF and RES.', [], { str: 4, mag: 4, def: 4, res: 4 }),
  ring('slayersRing', "Slayer's Ring", 'epic', 'For 1,000 enemies defeated: +4 STR, +10 Critical.', [], { str: 4, crit: 10 }),
  ring('rupeeRing', 'Rupee Ring', 'epic', 'For 10,000 Rupees collected: +20% Rupees after battle.', ['rupee']),
  ring('gbaTimeRing', 'GBA Time Ring', 'rare', '+2 MAG and RES.', [], { mag: 2, res: 2 }),
  ring('gbaNatureRing', 'GBA Nature Ring', 'rare', '+2 STR and DEF.', [], { str: 2, def: 2 }),
  ring('gbaLightRing', 'GBA Light Ring', 'rare', '+2 SKL and LCK.', [], { skl: 2, lck: 2 }),
  ring('signRing', 'Sign Ring', 'uncommon', 'More environmental treasure: an extra dig spot on every map.', ['sign']),
  ring('whimsicalRing', 'Whimsical Ring', 'rare', 'Damage dealt −25%, but a 10% chance for a huge hit (×3).', ['whimsical']),
  ring('doubleEdgedRing', 'Double-Edged Ring', 'rare', 'Damage dealt +50%, but you take 10% of it as recoil.', ['doubleEdged']),
  ring('gashaRing', 'Gasha Ring', 'rare', 'Gasha trees grow 50% faster while it is worn in the army.', ['gasha']),
];

/** Every Magic Ring (Vasu appraises Mystery Rings into one of these). */
export const RING_IDS = GEAR.filter((g) => g.lg?.includes('ring')).map((g) => g.id);
/** Rings too rare for appraisal (achievements give them). */
export const ACHIEVEMENT_RINGS = ['firstRing', 'hundredthRing', 'thousandthRing', 'slayersRing', 'rupeeRing'];
