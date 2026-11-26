import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), head = gs('head'), body = gs('body'), feet = gs('feet'), acc = gs('accessory'), mount = gs('mount'), tool = gs('tool');
const DUR: Record<Rarity, number> = { common: 25, uncommon: 35, rare: 45, epic: 55, legendary: 70, mythic: 99 };
const sh = (id: string, name: string, rarity: Rarity, def: number, block: number, desc: string, fx: string[] = [], extra: Partial<GearDef> = {}): GearDef =>
  shield(id, name, rarity, { def, block }, `+${def} DEF, ${block}% block. ${desc}`, { durability: DUR[rarity], wildFx: fx, ...extra });

// ── Shields (section 14). The Hylian Shield stays the existing entry. Shields wear down when they block. ──
const SHIELDS: GearDef[] = [
  sh('potLid', 'Pot Lid', 'common', 1, 10, 'Better than nothing.', [], { durability: 10, shieldFamily: 'wood' }),
  sh('travelersShield', "Traveler's Shield", 'common', 3, 20, 'Light.', [], { shieldFamily: 'wood' }),
  sh('soldiersShield', "Soldier's Shield", 'uncommon', 5, 25, 'Standard issue.', [], { shieldFamily: 'iron' }),
  sh('knightsShield', "Knight's Shield", 'rare', 8, 30, 'Durable.', [], { durability: 65, shieldFamily: 'iron' }),
  sh('royalShield', 'Royal Shield', 'epic', 11, 40, 'Better counters (+3 counter damage).', ['bash'], { shieldFamily: 'iron' }),
  sh('royalGuardsShield', "Royal Guard's Shield", 'legendary', 15, 50, 'Low durability.', [], { durability: 25, shieldFamily: 'iron' }),
  sh('huntersShield', "Hunter's Shield", 'common', 3, 25, 'Forest concealment: hidden while standing in a forest.', [], { effects: ['forestConceal'], shieldFamily: 'wood' }),
  sh('fishermansShield', "Fisherman's Shield", 'common', 3, 20, 'Aquatic stability: +10 Avoid in or next to water.', ['aquaticStability'], { shieldFamily: 'wood' }),
  sh('emblazonedShield', 'Emblazoned Shield', 'uncommon', 4, 25, 'Morale: the army starts battles with +3 morale per bearer.', ['morale'], { shieldFamily: 'iron' }),
  sh('forestDwellersShield', "Forest Dweller's Shield", 'rare', 5, 30, 'Light nature defense (+3 RES against nature and plants).', ['natureDef'], { shieldFamily: 'wood' }),
  sh('kiteShield', 'Kite Shield', 'rare', 5, 35, 'Better shield surfing: +1 MOV starting on a cliff, slope or snow.', ['surfing'], { shieldFamily: 'iron' }),
  sh('radiantShield', 'Radiant Shield', 'epic', 8, 40, 'Less surfing wear; shield surfing (+1 MOV on slopes).', ['surfing'], { durability: 75 }),
  sh('gerudoShield', 'Gerudo Shield', 'uncommon', 5, 30, 'Heat resistance.', ['heatRes'], { shieldFamily: 'iron' }),
  sh('daybreaker', 'Daybreaker', 'legendary', 12, 50, "Urbosa's shield: lightning resistance and enhanced Perfect Guards (+20%).", ['shockRes', 'enhancedParry'], { unique: true, durability: 90 }),
  sh('shieldOfTheMindsEye', "Shield of the Mind's Eye", 'rare', 5, 40, 'Better Perfect Guard timing (+15%).', ['perfectTiming'], { shieldFamily: 'wood' }),
  sh('bokoShield', 'Boko Shield', 'common', 2, 15, 'Crude.', [], { shieldFamily: 'wood' }),
  sh('spikedBokoShield', 'Spiked Boko Shield', 'uncommon', 4, 25, 'Damages melee attackers (3).', ['spiked'], { shieldFamily: 'wood' }),
  sh('dragonboneBokoShield', 'Dragonbone Boko Shield', 'rare', 7, 30, 'More contact damage (5).', ['contactDmg']),
  sh('lizalShield', 'Lizal Shield', 'uncommon', 4, 25, 'Light.', [], { shieldFamily: 'iron' }),
  sh('reinforcedLizalShield', 'Reinforced Lizal Shield', 'rare', 7, 35, 'Durable.', [], { durability: 65, shieldFamily: 'iron' }),
  sh('steelLizalShield', 'Steel Lizal Shield', 'epic', 10, 40, 'Physical resistance (−10% physical damage).', ['physRes'], { shieldFamily: 'iron' }),
  sh('lynelShield', 'Lynel Shield', 'rare', 8, 35, 'Damaging bash (+3 counter damage).', ['bash'], { shieldFamily: 'iron' }),
  sh('mightyLynelShield', 'Mighty Lynel Shield', 'epic', 12, 40, 'Powerful bash (+5 counter damage).', ['powerBash'], { shieldFamily: 'iron' }),
  sh('savageLynelShield', 'Savage Lynel Shield', 'legendary', 16, 50, 'Heavy counter damage (+8).', ['heavyCounter'], { shieldFamily: 'iron' }),
  sh('guardianShield', 'Guardian Shield', 'rare', 6, 35, 'Reflects weak Scout beams when it blocks a laser.', ['reflectWeak']),
  sh('guardianShieldPlus', 'Guardian Shield+', 'epic', 9, 40, 'Reflects weak beams.', ['reflectWeak']),
  sh('guardianShieldPlusPlus', 'Guardian Shield++', 'legendary', 12, 50, 'Reflects stronger beams.', ['reflectWeak', 'reflectStrong']),
  sh('ancientShield', 'Ancient Shield', 'legendary', 13, 55, 'Automatically reflects compatible lasers (half their damage back).', ['reflectWeak', 'reflectStrong', 'autoReflect']),
  sh('zonaiteShield', 'Zonaite Shield', 'uncommon', 5, 25, 'Fused devices on it cost 1 less energy.', ['deviceThrift']),
  sh('strongZonaiteShield', 'Strong Zonaite Shield', 'rare', 8, 35, 'Fused devices cost 1 less energy.', ['deviceThrift']),
  sh('mightyZonaiteShield', 'Mighty Zonaite Shield', 'epic', 12, 45, 'Fused devices cost 1 less energy.', ['deviceThrift']),
  sh('seaBreezeShield', 'Sea-Breeze Shield', 'legendary', 10, 40, 'Wind and water resistance (−25% damage).', ['windWaterRes'], { durability: 80 }),
  sh('rustyShield', 'Rusty Shield', 'common', 2, 15, 'Very low durability.', [], { durability: 8, shieldFamily: 'iron' }),
];

// ── Armor sets (section 15). A piece gives the set's partial effect; head + body + feet give the set bonus. ──
interface SetDef { id: string; name: string; rarity: Rarity; piece: string[]; bonus: string[]; pieceText: string; bonusText: string; names: [string, string, string]; stats?: GearDef['stats'] }
const SETS: SetDef[] = [
  { id: 'hylianSet', name: 'Hylian', rarity: 'common', piece: [], bonus: ['tempHp'], pieceText: 'Balanced defense.', bonusText: 'More max HP: start each battle with +8 temporary HP.', names: ['Hylian Hood', 'Hylian Tunic', 'Hylian Trousers'] },
  { id: 'soldierSet', name: "Soldier's", rarity: 'uncommon', piece: [], bonus: ['physGuard'], pieceText: 'Heavy physical defense (+1 DEF).', bonusText: 'Physical damage taken −15%.', names: ["Soldier's Helm", "Soldier's Armor", "Soldier's Greaves"], stats: { def: 1 } },
  { id: 'stealthSet', name: 'Stealth', rarity: 'rare', piece: ['stealth'], bonus: ['nightMove'], pieceText: 'Concealment: +10 Avoid at night.', bonusText: 'Night movement: +1 MOV at night.', names: ['Stealth Mask', 'Stealth Chest Guard', 'Stealth Tights'] },
  { id: 'climbingSet', name: 'Climbing', rarity: 'rare', piece: ['climb'], bonus: ['climbMaster'], pieceText: 'Climbing: cliffs cost 1 less movement.', bonusText: 'Less climbing stamina: mountains and cliffs cost 1.', names: ["Climber's Bandanna", 'Climbing Gear', 'Climbing Boots'] },
  { id: 'snowquillSet', name: 'Snowquill', rarity: 'rare', piece: ['coldRes'], bonus: ['freezeImmune'], pieceText: 'Cold resistance.', bonusText: 'Immune to Freeze.', names: ['Snowquill Headdress', 'Snowquill Tunic', 'Snowquill Trousers'] },
  { id: 'flamebreakerSet', name: 'Flamebreaker', rarity: 'rare', piece: ['flameRes'], bonus: ['fireImmune'], pieceText: 'Flame resistance (−25% fire damage; no volcanic heat).', bonusText: 'Immune to Burning; fire damage halved.', names: ['Flamebreaker Helm', 'Flamebreaker Armor', 'Flamebreaker Boots'] },
  { id: 'desertVoeSet', name: 'Desert Voe', rarity: 'rare', piece: ['heatRes'], bonus: ['shockRes'], pieceText: 'Heat resistance.', bonusText: 'Shock resistance (lightning damage halved).', names: ['Desert Voe Headband', 'Desert Voe Spaulder', 'Desert Voe Trousers'] },
  { id: 'gerudoVaiSet', name: 'Gerudo Vai', rarity: 'uncommon', piece: ['heatRes'], bonus: ['gerudoDisguise'], pieceText: 'Heat resistance.', bonusText: 'Gerudo infiltration: Gerudo enemies ignore the wearer unless adjacent.', names: ['Gerudo Veil', 'Gerudo Top', 'Gerudo Sirwal'] },
  { id: 'zoraSet', name: 'Zora', rarity: 'rare', piece: ['swim'], bonus: ['fastSwim'], pieceText: 'Swimming.', bonusText: 'Less swimming stamina: +2 MOV starting a turn in water.', names: ['Zora Helm', 'Zora Armor', 'Zora Greaves'] },
  { id: 'rubberSet', name: 'Rubber', rarity: 'rare', piece: ['shockRes'], bonus: ['shockImmune'], pieceText: 'Lightning resistance (halved).', bonusText: 'Immune to Shock and electrified water.', names: ['Rubber Helm', 'Rubber Armor', 'Rubber Tights'] },
  { id: 'barbarianSet', name: 'Barbarian', rarity: 'epic', piece: [], bonus: ['chargedThrift'], pieceText: 'Physical damage (+2 STR).', bonusText: 'Charged attacks cost half stamina.', names: ['Barbarian Helm', 'Barbarian Armor', 'Barbarian Leg Wraps'], stats: { str: 2 } },
  { id: 'ancientSet', name: 'Ancient', rarity: 'epic', piece: ['guardianRes'], bonus: ['ancientDmg'], pieceText: 'Guardian resistance (−15% from machines each).', bonusText: 'Ancient weapon damage +25%.', names: ['Ancient Helm', 'Ancient Cuirass', 'Ancient Greaves'], stats: { def: 1 } },
  { id: 'radiantSet', name: 'Radiant', rarity: 'rare', piece: ['boneDisguise'], bonus: ['boneDmg'], pieceText: 'Skeletal disguise: Stal monsters ignore the wearer unless adjacent.', bonusText: 'Bone weapon damage +30%.', names: ['Radiant Mask', 'Radiant Shirt', 'Radiant Tights'] },
  { id: 'darkSet', name: 'Dark', rarity: 'epic', piece: ['nightMove'], bonus: ['nightAvoid'], pieceText: 'Night movement (+1 MOV at night).', bonusText: '+20 Avoid at night.', names: ['Dark Hood', 'Dark Tunic', 'Dark Trousers'] },
  { id: 'wildSet', name: 'of the Wild', rarity: 'legendary', piece: [], bonus: ['swordBeam'], pieceText: 'Balanced (+1 STR, +1 DEF).', bonusText: 'Better Master Sword beams: sword beams reach 1–4 at any HP.', names: ['Cap of the Wild', 'Tunic of the Wild', 'Trousers of the Wild'], stats: { str: 1, def: 1 } },
  { id: 'fierceDeitySet', name: 'Fierce Deity', rarity: 'legendary', piece: [], bonus: ['chargedThrift'], pieceText: 'Attack (+2 STR).', bonusText: 'Charged attacks cost half stamina.', names: ['Fierce Deity Mask (Wild)', 'Fierce Deity Armor', 'Fierce Deity Boots'], stats: { str: 2 } },
  { id: 'phantomSet', name: 'Phantom', rarity: 'epic', piece: [], bonus: ['vsArmored'], pieceText: 'Attack (+2 STR).', bonusText: '+25% damage against armored enemies and constructs.', names: ['Phantom Helmet', 'Phantom Armor', 'Phantom Greaves'], stats: { str: 2 } },
  { id: 'phantomGanonSet', name: 'Phantom Ganon', rarity: 'epic', piece: ['stealth'], bonus: ['boneDisguise', 'boneDmg'], pieceText: 'Stealth (+10 Avoid at night).', bonusText: 'Skeletal disguise and bone weapon proficiency (+30%).', names: ['Phantom Ganon Skull', 'Phantom Ganon Armor', 'Phantom Ganon Greaves'] },
  { id: 'royalGuardSet', name: 'Royal Guard', rarity: 'epic', piece: [], bonus: ['staminaThrift'], pieceText: 'Proficiency (+5 Hit).', bonusText: 'Techniques cost 30% less stamina.', names: ['Royal Guard Cap', 'Royal Guard Uniform', 'Royal Guard Boots'], stats: { hit: 5 } },
  { id: 'tingleSet', name: 'Tingle', rarity: 'rare', piece: ['nightMove'], bonus: ['rupeeFind'], pieceText: 'Night movement.', bonusText: 'Rupee discovery: +20% battle Rupees.', names: ["Tingle's Hood", "Tingle's Shirt", "Tingle's Tights"] },
  { id: 'salvagerSet', name: 'Salvager', rarity: 'rare', piece: ['swim'], bonus: ['fastSwim'], pieceText: 'Swimming.', bonusText: '+2 MOV starting a turn in water.', names: ['Salvager Headwear', 'Salvager Vest', 'Salvager Trousers'] },
  { id: 'skySet', name: 'Sky', rarity: 'legendary', piece: ['sacredBoost'], bonus: ['swordBeam'], pieceText: 'Sacred attacks +5% each.', bonusText: 'Sword beams.', names: ['Cap of the Sky', 'Tunic of the Sky', 'Trousers of the Sky'] },
  { id: 'timeSet', name: 'Time', rarity: 'legendary', piece: [], bonus: ['swordBeam'], pieceText: 'Sword proficiency (+5 Hit).', bonusText: 'Sword beams.', names: ['Cap of Time', 'Tunic of Time', 'Trousers of Time'], stats: { hit: 5 } },
  { id: 'windSet', name: 'Wind', rarity: 'legendary', piece: ['windRes'], bonus: ['swordBeam'], pieceText: 'Wind resistance (can\'t be blown around).', bonusText: 'Sword beams.', names: ['Cap of the Wind', 'Tunic of the Wind', 'Trousers of the Wind'] },
  { id: 'twilightSet', name: 'Twilight', rarity: 'legendary', piece: ['shadowRes'], bonus: ['swordBeam'], pieceText: 'Shadow resistance (−20% dark damage).', bonusText: 'Sword beams.', names: ['Cap of Twilight', 'Tunic of Twilight', 'Trousers of Twilight'] },
  { id: 'heroSet', name: 'Hero', rarity: 'legendary', piece: [], bonus: ['swordBeam'], pieceText: 'Offense (+1 STR).', bonusText: 'Sword beams.', names: ['Cap of the Hero', 'Tunic of the Hero', 'Trousers of the Hero'], stats: { str: 1 } },
  { id: 'archaicSet', name: 'Archaic', rarity: 'common', piece: [], bonus: ['moveEfficiency'], pieceText: 'Light defense (+1 RES).', bonusText: 'Movement efficiency: +1 MOV.', names: ['Archaic Cap', 'Archaic Tunic', 'Archaic Legwear'], stats: { res: 1 } },
  { id: 'glideSet', name: 'Glide', rarity: 'epic', piece: ['glide'], bonus: ['fallImmune'], pieceText: 'Aerial maneuvering: glide off cliffs and towers.', bonusText: 'Fall immunity: +1 MOV while airborne, and can\'t be pushed into hazards.', names: ['Glide Mask', 'Glide Shirt', 'Glide Tights'] },
  { id: 'froggySet', name: 'Froggy', rarity: 'rare', piece: ['slipRes'], bonus: ['slipImmune'], pieceText: 'Slip resistance (no rain or wet-cliff penalties).', bonusText: 'Slip immunity: +10 Avoid in rain, wet cliffs cost 1.', names: ['Froggy Hood', 'Froggy Sleeve', 'Froggy Leggings'] },
  { id: 'minerSet', name: 'Miner', rarity: 'rare', piece: ['lightsTerrain'], bonus: ['leavesLight'], pieceText: 'Lights terrain: reveals Darkness within 2.', bonusText: 'Leaves lit spaces: Darkness you walk through stays lit.', names: ["Miner's Mask", "Miner's Top", "Miner's Trousers"] },
  { id: 'depthsSet', name: 'Depths', rarity: 'epic', piece: ['gloomRes'], bonus: ['gloomRes2'], pieceText: 'Gloom resistance (−30% Gloom).', bonusText: 'More Gloom protection (−60%).', names: ['Depths Hood', 'Depths Gloves', 'Depths Tights'] },
  { id: 'yigaSet', name: 'Yiga', rarity: 'rare', piece: ['stealth'], bonus: ['yigaDisguise'], pieceText: 'Stealth.', bonusText: 'Yiga infiltration: Yiga enemies ignore the wearer unless adjacent.', names: ['Yiga Mask', 'Yiga Armor', 'Yiga Tights'] },
  { id: 'zonaiteSet', name: 'Zonaite', rarity: 'epic', piece: ['deviceThrift'], bonus: ['fastRecharge'], pieceText: 'Less device energy (−10% each).', bonusText: 'Faster recharge: +4 shared energy each turn.', names: ['Zonaite Helm', 'Zonaite Waistguard', 'Zonaite Shin Guards'] },
  { id: 'emberSet', name: 'Ember', rarity: 'epic', piece: ['emberPower'], bonus: ['fireAttack'], pieceText: '+3 STR in hot regions.', bonusText: 'Attacks deal fire damage in intense heat.', names: ['Ember Headdress', 'Ember Shirt', 'Ember Trousers'] },
  { id: 'frostbiteSet', name: 'Frostbite', rarity: 'epic', piece: ['frostPower'], bonus: ['iceAttack'], pieceText: '+3 STR in cold regions.', bonusText: 'Attacks deal ice damage in extreme cold.', names: ['Frostbite Headdress', 'Frostbite Shirt', 'Frostbite Trousers'] },
  { id: 'chargedSet', name: 'Charged', rarity: 'epic', piece: ['stormPower'], bonus: ['lightningAttack'], pieceText: '+3 STR in storms (rain).', bonusText: 'Attacks deal lightning damage in storms.', names: ['Charged Headdress', 'Charged Shirt', 'Charged Trousers'] },
  { id: 'mysticSet', name: 'Mystic', rarity: 'epic', piece: [], bonus: ['rupeeShield'], pieceText: 'Damage (+2 STR).', bonusText: 'A quarter of the damage you take is paid in Rupees instead (better conversion).', names: ['Mystic Headpiece', 'Mystic Robe', 'Mystic Trousers'], stats: { str: 2 } },
  { id: 'evilSpiritSet', name: 'Evil Spirit', rarity: 'epic', piece: ['stealth'], bonus: ['boneDisguise', 'boneDmg'], pieceText: 'Stealth.', bonusText: 'Skeletal disguise and bone weapon damage +30%.', names: ['Evil Spirit Mask', 'Evil Spirit Armor', 'Evil Spirit Greaves'] },
];

const DEF: Record<Rarity, number> = { common: 1, uncommon: 2, rare: 2, epic: 3, legendary: 4, mythic: 5 };
/** Full-set bonus traits by set id. */
export const SET_BONUSES: Record<string, { name: string; traits: string[]; text: string }> = {};
const ARMOR: GearDef[] = [];
for (const st of SETS) {
  SET_BONUSES[st.id] = { name: `${st.name} set`, traits: st.bonus, text: st.bonusText };
  const slots = [head, body, feet] as const;
  const suffix = ['Head', 'Body', 'Feet'];
  st.names.forEach((nm, i) => {
    const def = DEF[st.rarity] + (i === 1 ? 1 : 0) + (st.stats?.def ?? 0);
    const stats = { ...(st.stats ?? {}), def };
    const txt = Object.entries(stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
    ARMOR.push(slots[i](`${st.id.replace(/Set$/, '')}${suffix[i]}`, nm, st.rarity, stats, `${txt}. ${st.pieceText} Set bonus (head + body + feet): ${st.bonusText}`, { wildSet: st.id, wildFx: st.piece }));
  });
}

// ── Single pieces (section 15) ──
const PIECES: GearDef[] = [
  body('championsTunic', "Champion's Tunic", 'legendary', { def: 6, res: 2 }, '+6 DEF, +2 RES. Reveals enemy HP, weaknesses and equipment wear.', { effects: ['revealStats'], unique: true }),
  body('championsLeathers', "Champion's Leathers", 'legendary', { def: 4, spd: 1 }, '+4 DEF, +1 SPD. Master Sword beams at any HP.', { wildFx: ['swordBeam'], unique: true }),
  head('wellWornHairBand', 'Well-Worn Hair Band', 'common', { spd: 1, lck: 2 }, '+1 SPD, +2 LCK.'),
  body('warmDoublet', 'Warm Doublet', 'common', { def: 1 }, '+1 DEF. Cold resistance.', { wildFx: ['coldRes'] }),
  feet('archaicWarmGreaves', 'Archaic Warm Greaves', 'common', { def: 1 }, '+1 DEF. Cold resistance.', { wildFx: ['coldRes'] }),
  feet('sandBoots', 'Sand Boots', 'uncommon', { def: 1 }, '+1 DEF. No sand penalties (sinking sand, sand vortexes, quicksand).', { effects: ['sandWalker'] }),
  feet('snowBoots', 'Snow Boots', 'uncommon', { def: 1 }, '+1 DEF. No snow penalties.', { effects: ['snowWalker'] }),
  head('thunderHelm', 'Thunder Helm', 'legendary', { def: 3 }, '+3 DEF. Lightning immunity (no lightning damage or Shock).', { effects: ['shockImmune'], wildFx: ['lightningImmune'], unique: true }),
  head('lightningHelm', 'Lightning Helm', 'epic', { def: 2 }, '+2 DEF. A Yiga replica of the Thunder Helm: lightning immunity.', { effects: ['shockImmune'], wildFx: ['lightningImmune'] }),
  head('midnasHelmet', "Midna's Helmet", 'legendary', { def: 3, res: 3 }, '+3 DEF, +3 RES. Guardian and Gloom resistance.', { wildFx: ['guardianRes', 'gloomRes'], unique: true }),
  head('raviosHood', "Ravio's Hood", 'rare', { def: 1 }, '+1 DEF. Sideways climbing: cliffs cost 1 less.', { wildFx: ['climb'] }),
  body('islandLobsterShirt', 'Island Lobster Shirt', 'uncommon', { def: 2 }, '+2 DEF. Heat resistance.', { wildFx: ['heatRes'] }),
  head('korokMask', 'Korok Mask', 'rare', { lck: 3 }, '+3 LCK. Reveals Korok Seeds: Korok puzzles on the field are worth 2 seeds.', { wildFx: ['korokSense'] }),
  head('bokoblinMask', 'Bokoblin Mask', 'uncommon', { def: 1 }, 'Disguise: Bokoblins ignore the wearer unless it attacks them or stands next to them.', { wildFx: ['disguise:bokoblin'] }),
  head('moblinMask', 'Moblin Mask', 'uncommon', { def: 1 }, 'Disguise among Moblins.', { wildFx: ['disguise:moblin'] }),
  head('lizalfosMask', 'Lizalfos Mask', 'uncommon', { def: 1 }, 'Disguise among Lizalfos.', { wildFx: ['disguise:lizalfos'] }),
  head('horriblinMask', 'Horriblin Mask', 'uncommon', { def: 1 }, 'Disguise among Horriblins.', { wildFx: ['disguise:horriblin'] }),
  head('lynelMask', 'Lynel Mask', 'epic', { def: 2 }, 'Temporarily deceives Lynels (the first 3 turns).', { wildFx: ['disguise:lynel'] }),
  body('ancientHerosAspect', "Ancient Hero's Aspect", 'mythic', { def: 9, res: 6, str: 2, mag: 2 }, 'Occupies head, body and feet. Enhances sacred combat (+25% sacred damage); counts as a full set.',
    { wildFx: ['fullBody', 'sacredAspect'], unique: true }),
];

// ── Accessories (section 16) ──
const stone = (id: string, name: string, el: string, desc: string): GearDef =>
  acc(id, name, 'mythic', { mag: 2, res: 2 }, `+2 MAG, +2 RES. ${desc}`, { wildFx: [`secret:${el}`], unique: true });
const ACCESSORIES: GearDef[] = [
  acc('amberEarrings', 'Amber Earrings', 'uncommon', { def: 3 }, '+3 DEF.'),
  acc('opalEarrings', 'Opal Earrings', 'rare', { res: 1 }, 'Swimming movement (can swim).', { effects: ['swim'] }),
  acc('topazEarrings', 'Topaz Earrings', 'rare', { res: 1 }, 'Lightning resistance (halved).', { wildFx: ['shockRes'] }),
  acc('rubyCirclet', 'Ruby Circlet', 'rare', { res: 1 }, 'Cold resistance.', { wildFx: ['coldRes'] }),
  acc('sapphireCirclet', 'Sapphire Circlet', 'rare', { res: 1 }, 'Heat resistance.', { wildFx: ['heatRes'] }),
  acc('diamondCirclet', 'Diamond Circlet', 'legendary', { str: 2, def: 2 }, '+2 STR, +2 DEF. Guardian resistance.', { wildFx: ['guardianRes'] }),
  acc('championsEmblem', "Champion's Emblem", 'legendary', { res: 2 }, 'Champion abilities get one more charge.', { wildFx: ['championCharge'], unique: true }),
  acc('sagesEmblem', "Sage's Emblem", 'legendary', { mag: 2 }, 'Sage abilities recharge 1 turn faster and are 20% stronger.', { wildFx: ['sageBoost'], unique: true }),
  acc('ancientCorePendant', 'Ancient Core Pendant', 'epic', { skl: 1 }, 'Mechanical (ancient) weapon damage +20%.', { wildFx: ['ancientDmg'] }),
  acc('zonaiPowerCrystal', 'Zonai Power Crystal', 'epic', { mag: 1 }, 'The army\'s Energy Cell holds 15 more energy in battle.', { wildFx: ['energyCap'] }),
  acc('lynelManeCharm', 'Lynel Mane Charm', 'legendary', { crit: 15 }, '+15 Critical on physical attacks.', { wildFx: ['critDmg'] }),
  acc('gleeokCrown', 'Gleeok Crown', 'legendary', { mag: 2 }, 'Elemental damage +20%.', { wildFx: ['elementDmg'] }),
  acc('talusOrePendant', 'Talus Ore Pendant', 'epic', { def: 4 }, '+4 DEF. More mineral rewards from ore deposits.', { wildFx: ['mineralFind'] }),
  acc('bubbulGemPendant', 'Bubbul Gem Pendant', 'rare', { lck: 3 }, 'Rare creatures are offered more often.', { wildFx: ['rareRecruit'] }),
  acc('satorisBlessing', "Satori's Blessing", 'legendary', { lck: 4 }, 'Rare encounters: more treasure and event nodes are found.', { wildFx: ['rareEncounter'], unique: true }),
  acc('malanyasBlessing', "Malanya's Blessing", 'legendary', { res: 2 }, 'Mounted stamina recovery (+3 stamina per turn while riding).', { wildFx: ['mountedStamina'], unique: true }),
  stone('secretStoneLight', 'Secret Stone of Light', 'light', 'Amplifies light: light attacks and sacred abilities +25%.'),
  stone('secretStoneTime', 'Secret Stone of Time', 'time', 'Amplifies time: time abilities recharge 1 turn faster and are 25% stronger.'),
  stone('secretStoneWater', 'Secret Stone of Water', 'water', 'Amplifies water: water attacks and abilities +25%.'),
  stone('secretStoneFire', 'Secret Stone of Fire', 'fire', 'Amplifies fire: fire attacks and abilities +25%.'),
  stone('secretStoneWind', 'Secret Stone of Wind', 'wind', 'Amplifies wind: wind abilities +25% and +1 MOV while airborne.'),
  stone('secretStoneLightning', 'Secret Stone of Lightning', 'lightning', 'Amplifies lightning: lightning attacks and abilities +25%.'),
  stone('secretStoneSpirit', 'Secret Stone of Spirit', 'spirit', 'Amplifies spirit: Zonai devices cost 25% less energy; spirit abilities +25%.'),
  stone('secretStoneDarkness', 'Secret Stone of Darkness', 'dark', 'Amplifies darkness: dark and Gloom attacks +25%.'),
  acc('paraglider', 'Paraglider', 'rare', {}, 'Controlled descent: starting a turn on a cliff, tree, tower or updraft lets you glide (fly) that turn. No fall damage.', { wildFx: ['glide', 'fallImmune'] }),
];

// ── Tools: the Sheikah Slate and the Zonai Arm (section 17, tool slot) ──
const TOOLS: GearDef[] = [
  tool('sheikahSlate', 'Sheikah Slate', 'epic', {}, 'Sheikah runes: Remote Bomb (round and cube), Magnesis, Stasis, Cryonis, Camera and the Sheikah Sensor (and Master Cycle Zero once unlocked).', { wildFx: ['slate'] }),
  tool('zonaiArm', 'Zonai Arm', 'legendary', {}, 'Zonai abilities: Ultrahand, Fuse, Ascend, Recall and Autobuild.', { wildFx: ['zonaiArm'] }),
  tool('purahPad', 'Purah Pad', 'mythic', { hit: 5 }, 'Purah\'s improved slate: every Sheikah rune, plus scouting (reveals hidden enemies within 5, +2 vision) and the Compendium.', { wildFx: ['slate', 'scouting'], unique: true }),
];

// ── Mounts (section 11). Ordinary horses, Epona, the Giant Horse, Stalhorse, Sand Seal and Golden Horse are existing entries. ──
const MOUNTS: GearDef[] = [
  mount('giantWhiteStallionMount', 'Giant White Stallion', 'legendary', { mov: 3, def: 4 }, '+3 MOV, +4 DEF; fear immunity; tramples (+2 damage charging).', { effects: ['fearImmune', 'charge'], size: 3, art: 'giantWhiteStallion' }),
  mount('royalWhiteStallionMount', 'Royal White Stallion', 'epic', { mov: 3, hit: 10 }, '+3 MOV, +10 Hit; +2 stamina each turn.', { effects: ['staRegen', 'mountedAvoid'], art: 'royalWhiteStallion' }),
  mount('patriciaMount', 'Patricia', 'legendary', { mov: 3, lck: 3 }, '+3 MOV, +3 LCK; desert navigation (no sand penalty) and treasure discovery.', { effects: ['sandWalker', 'scents'], art: 'patricia', unique: true }),
  mount('mountainBearMount', 'Mountain Bear', 'rare', { mov: 2, str: 3 }, '+2 MOV, +3 STR; heavy melee and forest movement.', { effects: ['forestRunner', 'charge'], art: 'mountainBear' }),
  mount('mountainDeerMount', 'Mountain Deer', 'uncommon', { mov: 4 }, '+4 MOV; forest movement and concealment.', { effects: ['forestRunner', 'forestConceal'], art: 'mountainDeer' }),
  mount('masterCycleZeroMount', 'Master Cycle Zero', 'mythic', { mov: 6, spd: 2 }, '+6 MOV, +2 SPD; climbs mountains. Consumes 1 army material per battle as fuel (−3 MOV without).', { effects: ['mountainWalker'], wildFx: ['fuel'], art: 'masterCycleZero', unique: true }),
];

export const GEAR: GearDef[] = [...SHIELDS, ...ARMOR, ...PIECES, ...ACCESSORIES, ...TOOLS, ...MOUNTS];
