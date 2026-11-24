import type { GearDef, GearSlotKind, ItemDef, Rarity, SkillDef } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), head = gs('head'), body = gs('body'), hands = gs('hands'), feet = gs('feet'), acc = gs('accessory');
const mount = (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, art: string, size: number, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot: 'mount', rarity, price: PRICE[rarity], stats, desc, art, size, ...extra });

export const GEAR: GearDef[] = [
  shield('herosShield', "Hero's Shield", 'uncommon', { def: 3, block: 15 }, '+3 DEF, 15% block. Light enough not to slow small units.'),
  shield('odolwaShield', "Odolwa's Shield", 'legendary', { def: 6, block: 30, avoid: 10 }, '+6 DEF, 30% block, +10 Avoid against projectiles.', { unique: true }),
  shield('snapperShield', 'Snapper Shell Shield', 'epic', { def: 7, block: 25 }, '+7 DEF, 25% block. Grants the Shell Spin defensive attack.'),

  // ── Transformation masks ──
  head('dekuMask', 'Deku Mask', 'epic', { spd: 1 }, 'Link transforms into Deku Link (Size 1): bubbles, spins, water bouncing and flower gliding.', { transform: 'dekuLink' }),
  head('goronTransformMask', 'Goron Mask (Transformation)', 'epic', { def: 1 }, 'Link transforms into Goron Link (Size 2): rolling, ground pounds, punches and curling.', { transform: 'goronLink' }),
  head('zoraTransformMask', 'Zora Mask (Transformation)', 'epic', { res: 1 }, 'Link transforms into Zora Link (Size 1): swimming, fin boomerangs and electric barriers.', { transform: 'zoraLink' }),
  head('fierceDeityMask', "Fierce Deity's Mask", 'mythic', { str: 2 }, 'Link becomes the Fierce Deity (Size 2) with the Double Helix Sword. Costs 3 MP per turn.', { transform: 'fierceDeityLink', upkeep: 3, unique: true }),
  head('giantsMask', "Giant's Mask", 'mythic', { def: 2 }, 'Link grows to colossal size (Size 5). Costs 4 MP per turn.', { transform: 'giantLink', upkeep: 4, unique: true }),
  head('majorasMaskGear', "Majora's Mask", 'mythic', { mag: 6, spd: 4, res: 4 }, '+6 MAG, +4 SPD, +4 RES. Skull Kid can become Majora\'s Incarnation.', { transform: 'majorasIncarnation', unique: true }),

  // ── Other masks ──
  head('postmansHat', "Postman's Hat", 'uncommon', { spd: 1 }, 'Doubles what you find in battlefield mailboxes.', { effects: ['postman'] }),
  head('allNightMask', 'All-Night Mask', 'rare', { res: 1 }, 'Immune to sleep.', { effects: ['sleepImmune'] }),
  head('blastMask', 'Blast Mask', 'rare', { str: 1 }, 'Blast ability: 12 damage to adjacent enemies (5 recoil without a shield). 3-turn cooldown.'),
  head('stoneMask', 'Stone Mask', 'epic', { avoid: 5 }, 'Enemies more than 2 spaces away ignore you until you attack.', { effects: ['stoneMask'] }),
  head('greatFairyMask', "Great Fairy's Mask", 'rare', { res: 2 }, 'Receive 25% more healing. Stray Fairies are drawn to you.', { effects: ['healBoost'] }),
  head('bremenMask', 'Bremen Mask', 'uncommon', { lck: 2 }, 'March ability: allies within 2 gain +1 MOV for the turn. Animals are friendlier in recruitment.'),
  head('donGeroMask', "Don Gero's Mask", 'rare', { lck: 1 }, 'Talk to frogs: unlocks frog encounters (and Gekko recruitment).'),
  head('maskOfScents', 'Mask of Scents', 'rare', { skl: 1 }, 'Sniffs out buried treasure, traps and hidden creatures within 4 spaces.', { effects: ['scents'] }),
  head('romaniMask', "Romani's Mask", 'rare', { lck: 1 }, 'Members only: unlocks the Milk Bar encounter and Chateau Romani.'),
  head('circusLeaderMask', "Circus Leader's Mask", 'rare', { res: 2 }, 'Hostile ranchers and bandit cavalry lose their nerve (they hold position).'),
  head('kafeiMask', "Kafei's Mask", 'uncommon', { lck: 1 }, 'Rescue and missing-person encounters appear more often.'),
  head('couplesMask', "Couple's Mask", 'legendary', { lck: 3 }, 'Supports grow twice as fast, and support bonuses are 25% stronger.', { effects: ['couple'], unique: true }),
  head('kamaroMask', "Kamaro's Mask", 'rare', { spd: 1 }, 'Dance ability: enemies within 2 are Dazed (−15 Hit/Avoid) for two turns.'),
  head('gibdoMask', 'Gibdo Mask', 'rare', { def: 1 }, 'Gibdos and ReDeads leave you alone unless provoked. Immune to fear.', { effects: ['gibdo', 'fearImmune'] }),
  head('garoMask', "Garo's Mask", 'epic', { spd: 2, avoid: 15 }, '+2 SPD, +15 Avoid. Reveals hidden enemies within 4 spaces.', { effects: ['garoSight'] }),
  head('captainsHat', "Captain's Hat", 'legendary', { str: 2 }, 'Undead join your recruitment pool. Allied undead within 3 gain +2 SKL.', { effects: ['captain'], unique: true }),

  // ── Termina head gear ──
  head('dekuRoyalCrown', 'Deku Royal Crown', 'epic', { mag: 3, lck: 2 }, '+3 MAG, +2 LCK. Deku allies within 2 gain +1 RES.', { effects: ['dekuCrown'], unique: true }),
  head('ikanaRoyalCrown', 'Ikana Royal Crown', 'legendary', { str: 3, res: 3 }, '+3 STR, +3 RES. Immune to fear.', { effects: ['fearImmune', 'captain'], unique: true }),
  head('garoHood', 'Garo Hood', 'rare', { spd: 2 }, '+2 SPD. Enemies only notice you within 2 spaces until you attack.', { effects: ['stoneMask'] }),
  head('hiploopMask', 'Hiploop Mask', 'rare', { def: 4 }, '+4 DEF (a sturdy leaf shield over the face).'),

  // ── Body ──
  body('dekuBarkArmor', 'Deku Bark Armor', 'uncommon', { def: 3 }, '+3 DEF. Regenerate in forests, but fire hurts more.', { effects: ['forestRegen', 'fireWeak'] }),
  body('garoRobes', 'Garo Robes', 'rare', { spd: 3 }, '+3 SPD. A turn without attacking hides you (Veiled).', { effects: ['concealOnWait'] }),
  body('ikanaRoyalArmor', 'Ikana Royal Armor', 'epic', { def: 6, res: 3 }, '+6 DEF, +3 RES. Immune to curses.', { effects: ['curseImmune'], unique: true }),
  body('gohtPlating', "Goht's Mechanical Plating", 'legendary', { def: 9, spd: -2 }, '+9 DEF, −2 SPD. Immune to shock.', { effects: ['shockImmune'], unique: true }),
  body('twinmoldCarapace', 'Twinmold Carapace', 'legendary', { def: 8, res: 2 }, '+8 DEF, +2 RES.', { unique: true }),

  // ── Hands and feet ──
  hands('goronRacingBracers', 'Goron Racing Bracers', 'rare', { str: 2 }, '+2 STR. Rolling and charging come easier (+2 MOV to rolls).', { effects: ['rollBoost'] }),
  hands('giantsGauntlets', "Giant's Gauntlets", 'legendary', { str: 6, con: 5 }, '+6 STR, +5 CON. Size 3 or larger only.', { minSize: 3, unique: true }),
  feet('postmanShoes', "Postman's Running Shoes", 'rare', { mov: 1 }, '+1 MOV.'),
  feet('odolwaAnklets', "Odolwa's Anklets", 'epic', { spd: 2 }, '+2 SPD. Leap past enemy units while moving.', { effects: ['phaseThrough'], unique: true }),
  feet('gohtHooves', "Goht's Hooves", 'legendary', { mov: 2 }, '+2 MOV. Charging attacks hit harder (+2 after moving 3+).', { effects: ['charge'], unique: true }),

  // ── Accessories ──
  acc('bombersBadge', "Bombers' Badge", 'uncommon', { lck: 2 }, '+2 LCK. The Bombers share rumors: +10% Rupees from battles.'),
  acc('dekuFlowerPetal', 'Deku Flower Petal', 'rare', { avoid: 5 }, 'Glide on the petal: you move as a flier (over water and gaps).', { effects: ['flight'] }),
  acc('goronRacingMedal', 'Goron Racing Medal', 'rare', { spd: 1 }, 'Rolling attacks deal +3 damage after moving 3+ spaces.', { effects: ['charge'] }),
  acc('indigoGosEmblem', "Indigo-Go's Emblem", 'epic', { mag: 1 }, 'Songs cost 25% less MP.', { effects: ['songThrift'] }),
  acc('composersSheet', "Composer's Sheet Music", 'rare', { mag: 2 }, '+2 MAG. Your sleep and curse effects last longer.'),
  acc('garoSpiritEmblem', 'Garo Spirit Emblem', 'epic', { spd: 1 }, 'Move through enemy units.', { effects: ['phaseThrough'] }),
  acc('wartsBubble', "Wart's Bubble", 'epic', { res: 1 }, 'Negates the first damaging hit you take each battle.', { effects: ['bubble'] }),
  acc('eyegoreCrystal', "Eyegore's Crystal", 'epic', { mag: 2 }, '+2 MAG. Magic reaches 1 space further.', { effects: ['magicRange'] }),
  acc('giantsTear', "Giant's Tear", 'legendary', {}, '+5 max HP for every point of your size.', { effects: ['giantTear'], unique: true }),
  acc('moonFragment', 'Moon Fragment', 'mythic', { mag: 2 }, 'Time songs (Song of Time, Soaring, Inverted, Double Time) cost 50% less MP.', { effects: ['timeThrift'], unique: true }),
  acc('majorasEye', "Majora's Eye", 'mythic', { mag: 3 }, 'Offensive magic inflicts a random negative status.', { effects: ['majoraEye'], unique: true }),

  // ── Boss Remains (one of each per run) ──
  acc('odolwaRemains', "Odolwa's Remains", 'legendary', { str: 3, skl: 3 }, '+3 STR, +3 SKL. +25% damage against enemies in forests.', { effects: ['remainsForest'], unique: true }),
  acc('gohtRemains', "Goht's Remains", 'legendary', { spd: 3, con: 3 }, '+3 SPD, +3 CON. +1 Might per space moved before attacking (up to +5).', { effects: ['remainsMomentum'], unique: true }),
  acc('gyorgRemains', "Gyorg's Remains", 'legendary', { str: 3, res: 3 }, '+3 STR, +3 RES. Swim freely; +25% damage against aquatic enemies.', { effects: ['remainsAquatic'], unique: true }),
  acc('twinmoldRemains', "Twinmold's Remains", 'legendary', { def: 4, mag: 3 }, '+4 DEF, +3 MAG. Take 25% less damage from larger units.', { effects: ['remainsGiant'], unique: true }),

  // ── Mounts and transports ──
  mount('tinglesBalloon', "Tingle's Balloon", 'rare', { mov: 2 }, 'Flight and +2 MOV, but bows and slings deal double damage.', 'tingle', 1, { effects: ['balloon', 'flight'] }),
  mount('giantTurtleMount', 'Giant Turtle', 'legendary', { mov: 1, def: 3 }, 'Ride across deep water (+1 MOV, swimming).', 'giantTurtle', 4, { effects: ['swim'], unique: true }),
  mount('snapperMount', 'Snapper Mount', 'rare', { mov: 1, def: 4 }, '+4 DEF, +1 MOV and a spinning charge (+2 damage after moving 3+).', 'snapper', 2, { effects: ['charge'] }),
];

const it = (id: string, name: string, kind: ItemDef['kind'], rarity: Rarity, price: number, power: number, uses: number, desc: string, extra: Partial<ItemDef> = {}): ItemDef =>
  ({ id, name, kind, rarity, price, power, uses, desc, ...extra });

export const ITEMS: ItemDef[] = [
  it('pictographBox', 'Pictograph Box', 'tool', 'uncommon', 400, 0, 1, 'Tool: photograph an enemy within 4 spaces. It is revealed and Exposed (−3 DEF/RES) for 2 turns.', { tool: 'pictograph', minRange: 1, maxRange: 4 }),
  it('powderKeg', 'Powder Keg', 'bomb', 'epic', 700, 25, 1, 'Placed 1–2 spaces away: 25 damage within 2 spaces; destroys walls. Gorons or 16+ CON only.', { minRange: 1, maxRange: 2, radius: 2, minCon: 16, breaksWalls: true }),
  it('chateauRomani', 'Chateau Romani', 'special', 'legendary', 900, 0, 1, 'All abilities cost 0 MP for three turns.'),
  it('magicMushroom', 'Magic Mushroom', 'mp', 'uncommon', 120, 8, 1, 'Restores 8 MP.'),
  it('springWater', 'Spring Water', 'cure', 'common', 60, 0, 1, 'Puts out Burning.', { cures: ['burn'] }),
  it('hotSpringWater', 'Hot Spring Water', 'special', 'rare', 250, 0, 1, 'Poured 0–2 spaces away: thaws frozen units and Frozen Mechanisms within 1 space.', { targeted: true, minRange: 0, maxRange: 2, radius: 1 }),
  it('goldDust', 'Gold Dust', 'special', 'epic', 900, 0, 1, 'Outside battle: reforges a Razor Sword into a Gilded Sword, or improves another weapon by +1.'),
  it('seahorse', 'Seahorse', 'special', 'rare', 300, 0, 1, 'Guides you through water: swim for 3 turns.'),
  it('mysteryMilk', 'Mystery Milk', 'special', 'uncommon', 120, 0, 1, 'Restores a random amount of HP, MP and stamina.'),
  it('strayFairy', 'Stray Fairy', 'special', 'rare', 400, 0, 1, 'Return it to a Great Fairy Fountain for a permanent enhancement.'),
  it('dekuFlowerSeed', 'Deku Flower Seed', 'special', 'uncommon', 200, 0, 2, 'Planted 1–2 spaces away: a Deku Flower that launches Deku into a glide.', { targeted: true, minRange: 1, maxRange: 2 }),
  it('bioDekuBabaSeed', 'Bio Deku Baba Seed', 'special', 'rare', 400, 0, 1, 'Planted 1–2 spaces away: an allied Bio Deku Baba that bites nearby enemies.', { targeted: true, minRange: 1, maxRange: 2 }),
  it('wartBubbleCluster', 'Wart Bubble Cluster', 'special', 'rare', 450, 0, 1, 'You and up to two allies within 2 get a bubble that absorbs the next hit.'),
  it('gomessBatSwarm', 'Gomess Bat Swarm', 'special', 'epic', 600, 0, 1, 'Released 1–3 spaces away: enemies within 1 space are Blinded for 2 turns.', { targeted: true, minRange: 1, maxRange: 3, radius: 1 }),
  it('deathArmosCore', 'Death Armos Core', 'special', 'epic', 600, 0, 1, 'Set 1–2 spaces away: a trap that hurts and roots the first enemy to step on it.', { targeted: true, minRange: 1, maxRange: 2 }),
  it('garoSpiritDust', 'Garo Spirit Dust', 'special', 'rare', 350, 0, 1, 'Conceals you (Veiled) for 2 turns.'),
  it('twinmoldWingFragment', 'Twinmold Wing Fragment', 'special', 'legendary', 900, 0, 1, 'Before moving: fly this turn (+1 MOV). Free action.'),
  it('giantsHorn', "Giant's Horn", 'special', 'legendary', 1200, 0, 1, 'Calls a benched Giant onto the battlefield.'),
  it('sheetHealing', 'Sheet Music: Song of Healing', 'learn', 'rare', 500, 0, 1, 'Teaches the Song of Healing (5 MP).', { teaches: 'songOfHealing' }),
  it('sheetSoaring', 'Sheet Music: Song of Soaring', 'learn', 'rare', 550, 0, 1, 'Teaches the Song of Soaring (6 MP): warp to an Owl Statue.', { teaches: 'songOfSoaring' }),
  it('sheetSonata', 'Sheet Music: Sonata of Awakening', 'learn', 'uncommon', 400, 0, 1, 'Teaches the Sonata of Awakening (4 MP).', { teaches: 'sonataOfAwakening' }),
  it('sheetLullabyGoron', 'Sheet Music: Goron Lullaby', 'learn', 'rare', 550, 0, 1, 'Teaches the Goron Lullaby (6 MP): puts nearby enemies to sleep.', { teaches: 'goronLullaby' }),
  it('sheetBossaNova', 'Sheet Music: New Wave Bossa Nova', 'learn', 'rare', 500, 0, 1, 'Teaches the New Wave Bossa Nova (5 MP).', { teaches: 'newWaveBossaNova' }),
  it('sheetElegy', 'Sheet Music: Elegy of Emptiness', 'learn', 'epic', 750, 0, 1, 'Teaches the Elegy of Emptiness (8 MP).', { teaches: 'elegyOfEmptiness' }),
  it('sheetOath', 'Sheet Music: Oath to Order', 'learn', 'legendary', 1100, 0, 1, 'Teaches the Oath to Order (12 MP).', { teaches: 'oathToOrder' }),
  it('sheetInverted', 'Sheet Music: Inverted Song of Time', 'learn', 'epic', 800, 0, 1, 'Teaches the Inverted Song of Time (10 MP).', { teaches: 'invertedSongOfTime' }),
  it('sheetDoubleTime', 'Sheet Music: Song of Double Time', 'learn', 'epic', 700, 0, 1, 'Teaches the Song of Double Time (8 MP).', { teaches: 'songOfDoubleTime' }),
];

/** Quest items: kept in the army's quest inventory, not in packs. */
export const QUEST_ITEMS: { id: string; name: string; desc: string }[] = [
  { id: 'bombersNotebook', name: "Bombers' Notebook", desc: 'Records who can be recruited when: shows the day schedule during the Termina campaign.' },
  { id: 'moonsTear', name: "Moon's Tear", desc: 'A strange stone that fell from the Moon. A certain Business Scrub would love it.' },
  { id: 'landDeed', name: 'Land Title Deed', desc: 'Trade it onward in the Southern Swamp.' },
  { id: 'swampDeed', name: 'Swamp Title Deed', desc: 'Trade it onward in the mountains.' },
  { id: 'mountainDeed', name: 'Mountain Title Deed', desc: 'Trade it onward at the coast.' },
  { id: 'oceanDeed', name: 'Ocean Title Deed', desc: 'The final deed. Someone in Ikana pays handsomely for it.' },
  { id: 'roomKey', name: 'Room Key', desc: 'A key to the Stock Pot Inn. Unlocks special inn encounters.' },
  { id: 'letterToKafei', name: 'Letter to Kafei', desc: 'Begins the Kafei investigation.' },
  { id: 'pendantOfMemories', name: 'Pendant of Memories', desc: 'Kafei\'s keepsake for Anju.' },
  { id: 'specialDelivery', name: 'Special Delivery to Mama', desc: 'Deliver it for Chateau Romani or postal gear.' },
  { id: 'fishingPass', name: 'Fishing Hole Pass', desc: 'Unlocks the fishing hole encounter.' },
  { id: 'sunsMask', name: "Sun's Mask", desc: 'Half of a promise. Combines with the Moon\'s Mask.' },
  { id: 'moonsMask', name: "Moon's Mask", desc: 'Half of a promise. Combines with the Sun\'s Mask.' },
  { id: 'zoraEgg', name: 'Zora Egg', desc: 'One of Lulu\'s missing eggs. Bring several back to Great Bay.' },
  { id: 'bottledDekuPrincess', name: 'Bottled Deku Princess', desc: 'The Deku Princess, rescued in a bottle. Return her to the Deku Palace.' },
];

export const SKILLS: SkillDef[] = [
  { id: 'heroOfMasks', name: 'Hero of Masks', implemented: true, desc: 'Once per turn, putting on or taking off a mask doesn\'t use his action.' },
  { id: 'dekuMobility', name: 'Deku Mobility', implemented: true, desc: 'Bounces across water (cost 2) and glides from Deku Flowers.' },
  { id: 'spikedRoll', name: 'Spiked Roll', implemented: true, desc: '+4 damage when attacking after moving 3+ spaces.' },
  { id: 'aquaticGrace', name: 'Aquatic Grace', implemented: true, desc: '+15 Avoid in water (and Rapid Swimming for +3 MOV).' },
  { id: 'wrathOfTheDeity', name: 'Wrath of the Deity', implemented: true, desc: '+50% damage against bosses.' },
  { id: 'colossalStrength', name: 'Colossal Strength', implemented: true, desc: 'Attacks spill onto enemies next to the target and smash nearby walls.' },
  { id: 'mischief', name: 'Mischief', implemented: true, desc: 'Swap places with a Size 1 unit within 4 spaces (3-turn cooldown).' },
  { id: 'quickWarning', name: 'Quick Warning', implemented: true, desc: 'An ally within 3 spaces becomes Veiled (+30 Avoid) for their next round.' },
  { id: 'callTheGiants', name: 'Call the Giants', implemented: true, desc: 'Allies of Size 3+ within 3 spaces gain +2 STR and RES.' },
  { id: 'determination', name: 'Determination', implemented: true, desc: '+2 SPD and SKL while carrying unique equipment.' },
  { id: 'hospitality', name: 'Hospitality', implemented: true, desc: 'Camps heal 25% more and raise morale.' },
  { id: 'royalTemper', name: 'Royal Temper', implemented: true, desc: '+4 STR against whoever hurt her last.' },
  { id: 'royalCommand', name: 'Royal Command', implemented: true, desc: 'Deku allies within 2 spaces gain +2 STR and DEF.' },
  { id: 'mountainHero', name: 'Mountain Hero', implemented: true, desc: 'Adjacent Goron allies gain +2 DEF. Immune to fear.' },
  { id: 'indigoGos', name: "Indigo-Go's", implemented: true, desc: 'His songs also restore 3 stamina to allies.' },
  { id: 'voiceOfTheOcean', name: 'Voice of the Ocean', implemented: true, desc: 'Songs reach 2 spaces further while she stands in water.' },
  { id: 'captainsOrders', name: "Captain's Orders", implemented: true, desc: 'Undead allies within 4 spaces gain +2 STR and SKL.' },
  { id: 'undyingKingdom', name: 'Undying Kingdom', implemented: true, desc: 'Once per battle, rises again with 25% HP, unless struck by light.' },
  { id: 'songOfSorrow', name: 'Song of Sorrow', implemented: true, desc: 'Enemies within 3 spaces lose 2 MP at the start of their turns.' },
  { id: 'songOfRelease', name: 'Song of Release', implemented: true, desc: 'His songs remove curses from allies and weaken undead enemies.' },
  { id: 'masterOfAmbush', name: 'Master of Ambush', implemented: true, desc: 'Starts battles concealed; the first attack from concealment is a guaranteed critical.' },
  { id: 'kooloolimpah', name: 'Kooloo-Limpah', implemented: true, desc: 'Reveals hidden treasure, traps and enemies within 6 spaces.' },
  { id: 'jungleRitual', name: 'Jungle Ritual', implemented: true, desc: 'An insect swarm stings enemies within 2 spaces each turn.' },
  { id: 'runawayMachine', name: 'Runaway Machine', implemented: true, desc: '+1 Might per space moved before attacking (up to +8).' },
  { id: 'predatorOfTheDeep', name: 'Predator of the Deep', implemented: true, desc: 'Double damage against non-aquatic enemies in water.' },
  { id: 'burrowingTerror', name: 'Burrowing Terror', implemented: true, desc: 'Attacks erupt around the target, hitting adjacent enemies.' },
  { id: 'desertFlight', name: 'Desert Flight', implemented: true, desc: 'Flies over obstacles and launches fireballs.' },
  { id: 'cursedRotation', name: 'Cursed Rotation', implemented: true, desc: 'Attacks also hit every enemy adjacent to it.' },
  { id: 'frenziedMovement', name: 'Frenzied Movement', implemented: true, desc: 'Can move again after attacking.' },
  { id: 'wrathfulReach', name: 'Wrathful Reach', implemented: true, desc: 'Whips strike up to 4 spaces away and hit enemies around the target.' },
  { id: 'forestGuardian', name: 'Forest Guardian', implemented: true, desc: 'Grows forest where it stands and regenerates 10% HP in forests.' },
  { id: 'mountainGuardian', name: 'Mountain Guardian', implemented: true, desc: 'Ground pounds may freeze enemies (25%).' },
  { id: 'oceanGuardian', name: 'Ocean Guardian', implemented: true, desc: 'Tidal attacks surge through enemies in a line.' },
  { id: 'spiritGuardian', name: 'Spirit Guardian', implemented: true, desc: 'Allies within 3 spaces gain +3 RES.' },
  { id: 'bubbleShield', name: 'Bubble Shield', implemented: true, desc: 'Starts each battle wrapped in a bubble that absorbs the first hit.' },
  { id: 'batSwarm', name: 'Bat Swarm', implemented: true, desc: 'Takes half damage unless struck by light.' },
  { id: 'snapperRider', name: 'Snapper Rider', implemented: true, desc: 'Rides a Snapper into battle.' },
  { id: 'spinningShell', name: 'Spinning Shell', implemented: true, desc: 'Spinning attacks hit every adjacent enemy.' },
  { id: 'ancientDive', name: 'Ancient Dive', implemented: true, desc: 'Explosive dives hit enemies around the target.' },
  { id: 'piercingGaze', name: 'Piercing Gaze', implemented: true, desc: 'Its beam pierces every enemy in a line.' },
  { id: 'constrict', name: 'Constrict', implemented: true, desc: 'Bites can restrain (Root) the target.' },
  { id: 'frontalMask', name: 'Frontal Mask', implemented: true, desc: 'A leaf mask gives it extra DEF.' },
  { id: 'detachedStem', name: 'Detached Stem', implemented: true, desc: 'Moves across land and water.' },
  { id: 'livingIsland', name: 'Living Island', implemented: true, desc: 'Swims through deep water; can serve as a mount.' },
  { id: 'kingsBlade', name: "King's Blade", implemented: true, desc: '+3 STR, +2 SPD and +10 Crit within 3 spaces of Igos du Ikana.' },
  { id: 'kingsShield', name: "King's Shield", implemented: true, desc: 'Intercepts the first attack on Igos du Ikana each round (within 2 spaces).' },
  { id: 'skeletalReassembly', name: 'Skeletal Reassembly', implemented: true, desc: 'Once per battle, rises again with 25% HP, unless struck by light.' },
  { id: 'dekuPhalanx', name: 'Deku Phalanx', implemented: true, desc: '+2 DEF next to another Deku Soldier.' },
  { id: 'royalGuardDeku', name: 'Royal Guard', implemented: true, desc: 'Intercepts attacks on an adjacent Deku King or Princess.' },
  { id: 'flowerLaunch', name: 'Flower Launch', implemented: true, desc: 'Glides 6 spaces from Deku Flowers.' },
  { id: 'natureMend', name: 'Nature Mend', implemented: true, desc: 'After attacking, allies within 2 spaces recover 2 HP.' },
  { id: 'nutBombardment', name: 'Nut Bombardment', implemented: true, desc: 'Explosive pods splash around the target.' },
  { id: 'tripleShot', name: 'Triple Shot', implemented: true, desc: 'Strikes twice when attacking without moving.' },
  { id: 'guardianOfTheZora', name: 'Guardian of the Zora', implemented: true, desc: 'Zora allies within 4 spaces gain +3 DEF/RES and recover 5% HP each turn.' },
  { id: 'divineBulk', name: 'Divine Bulk', implemented: true, desc: 'Takes 25% less physical damage. Moves only through water.' },
];
