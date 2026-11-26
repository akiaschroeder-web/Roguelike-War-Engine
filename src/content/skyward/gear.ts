import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, ...extra });
const shield = gs('shield'), head = gs('head'), body = gs('body'), hands = gs('hands'), feet = gs('feet'), acc = gs('accessory'), mount = gs('mount');
const sh = (id: string, name: string, rarity: Rarity, def: number, block: number, weight: number, durability: number, family: 'wood' | 'iron' | 'sacred', extra: Partial<GearDef> = {}): GearDef => {
  const famText = family === 'wood' ? 'Wooden: resists lightning, but fire wears it fast.' : family === 'iron' ? 'Iron: resists fire and heavy blows, but conducts lightning.' : 'Sacred: mends 5 durability a turn; wards off curses, darkness and the undead.';
  const spd = weight >= 8 ? -2 : weight >= 6 ? -1 : 0;
  return shield(id, name, rarity, { def, block, ...(spd ? { spd } : {}) }, `+${def} DEF, ${block}% block${spd ? `, ${spd} SPD` : ''}. Durability ${durability}. ${famText}`, { durability, shieldFamily: family, ...extra });
};

export const GEAR: GearDef[] = [
  // ── Shields (section 7). Blocks wear them down; at 0 durability they break. ──
  sh('bandedShield', 'Banded Shield', 'uncommon', 3, 25, 2, 35, 'wood'),
  sh('bracedShield', 'Braced Shield', 'rare', 4, 30, 3, 50, 'wood'),
  sh('ironShield', 'Iron Shield', 'uncommon', 5, 30, 6, 45, 'iron'),
  sh('reinforcedShield', 'Reinforced Shield', 'rare', 7, 35, 7, 60, 'iron'),
  sh('fortifiedShield', 'Fortified Shield', 'epic', 9, 40, 8, 80, 'iron'),
  sh('sacredShield', 'Sacred Shield', 'rare', 4, 30, 2, 25, 'sacred'),
  sh('divineShield', 'Divine Shield', 'epic', 5, 40, 3, 35, 'sacred'),
  sh('goddessShield', 'Goddess Shield', 'legendary', 7, 45, 3, 50, 'sacred', { unique: true }),
  shield('moblinIronGreatshield', 'Moblin Iron Greatshield', 'epic', { block: 50, spd: -2 }, '50% block, −2 SPD. +9 DEF against attacks from the side you face. Durability 90 (iron).',
    { effects: ['frontalShield'], durability: 90, shieldFamily: 'iron' }),
  // ── Adventuring tools (section 8) ──
  acc('beetle', 'Beetle', 'rare', {}, 'Remote flying device: scout up to 5 spaces away (reveals hidden enemies and traps there) and hit distant switches and pinwheels.', { effects: ['beetle'] }),
  acc('hookBeetle', 'Hook Beetle', 'epic', {}, 'As the Beetle (range 6), and it can carry a Bomb from your pack and drop it on the spot.', { effects: ['beetle', 'hookBeetle'] }),
  acc('quickBeetle', 'Quick Beetle', 'epic', {}, 'A faster Hook Beetle: range 8.', { effects: ['beetle', 'hookBeetle', 'quickBeetle'] }),
  acc('toughBeetle', 'Tough Beetle', 'legendary', {}, 'The final Beetle: range 10, and what it reveals stays revealed twice as long (reveal radius 3).', { effects: ['beetle', 'hookBeetle', 'quickBeetle', 'toughBeetle'] }),
  acc('gustBellows', 'Gust Bellows', 'rare', {}, 'Blast of wind: pushes enemies within 2 back, blows away Sand Piles, spins Wind Pinwheels and puts out flames.', { effects: ['gustBellows'] }),
  acc('bugNetSS', 'Bug Net', 'common', {}, 'Catches insects after battle (more insect materials). +15 Avoid against ranged attacks (bat projectiles away).', { effects: ['bugNet'] }),
  acc('bigBugNet', 'Big Bug Net', 'rare', {}, 'A bigger net: twice the insects, +25 Avoid against ranged attacks.', { effects: ['bugNet', 'bigBugNet'] }),
  hands('diggingMitts', 'Digging Mitts', 'uncommon', {}, 'Dig where you stand for buried items (Mogma Dig).', { effects: ['diggingMitts'] }),
  hands('mogmaMitts', 'Mogma Mitts', 'epic', {}, 'Dig, and travel underground between Burrowing Tunnels.', { effects: ['diggingMitts', 'mogmaMitts'] }),
  acc('sailcloth', 'Sailcloth', 'uncommon', {}, 'Controlled descent: starting a turn on a mountain or Sky Island Edge lets you glide (fly) that turn. No fall or knockback damage.', { effects: ['sailcloth'] }),
  acc('fireshieldEarrings', 'Fireshield Earrings', 'epic', {}, 'Immune to environmental heat (lava, burning ground); fire damage −50%.', { effects: ['lavaImmune', 'fireResist', 'hazardResist'] }),
  acc('waterDragonsScale', "Water Dragon's Scale", 'epic', {}, 'Breathe underwater and swim; +1 MOV starting a turn in water.', { effects: ['swim', 'fastSwim'] }),
  body('knightsUniform', "Knight's Uniform", 'uncommon', { def: 3 }, '+3 DEF; +2 SKL while riding a Loftwing. Knights in uniform can Dash.', { effects: ['knightsUniform'] }),
  // ── Medals (section 9, accessory slot) ──
  acc('bugMedal', 'Bug Medal', 'uncommon', {}, 'Doubles insects found after battle.', { effects: ['bugMedal'] }),
  acc('cursedMedal', 'Cursed Medal', 'epic', {}, 'Doubles Rupee and material rewards — but the wearer can\'t use their pack, and their shield does nothing.', { effects: ['cursedMedal'] }),
  acc('heartMedal', 'Heart Medal', 'rare', {}, 'More healing finds: after a victory the wearer may find a Heart Potion, and Recovery Hearts heal the army 5% more.', { effects: ['heartMedal'] }),
  acc('lifeMedal', 'Life Medal', 'epic', { hp: 10 }, '+10 max HP.'),
  acc('rupeeMedal', 'Rupee Medal', 'rare', {}, 'Battle Rupee rewards +30%.', { effects: ['rupeeMedal'] }),
  acc('treasureMedal', 'Treasure Medal', 'rare', {}, 'Monster material drops +50%.', { effects: ['treasureMedal'] }),
  acc('potionMedal', 'Potion Medal', 'epic', {}, 'Your timed potions (Stamina, Air, Guardian) last twice as long.', { effects: ['potionMedal'] }),
  // ── Additional armor (section 16) ──
  head('koloktosCrown', 'Koloktos Crown', 'legendary', { def: 6 }, '+6 DEF. Can\'t be disarmed.', { effects: ['disarmImmune'], unique: true }),
  head('silentGuardianMask', 'Silent Guardian Mask', 'epic', {}, 'See marked and hidden enemies through obstacles (reveals them within 6).', { effects: ['markedSight'] }),
  head('batreauxsHorns', "Batreaux's Horns", 'rare', { mag: 4 }, '+4 MAG. Demons are more willing to join you.', { effects: ['demonRecruit'] }),
  body('ancientRobotPlating', 'Ancient Robot Plating', 'epic', { def: 8 }, '+8 DEF. No damage from lava, burning ground or sinking sand.', { effects: ['hazardResist'] }),
  body('koloktosGoldenArmor', 'Koloktos Golden Armor', 'mythic', { def: 12 }, '+12 DEF. Layered plates: the first 3 hits each battle deal half damage.', { effects: ['armorLayers'], unique: true }),
  body('ghirahimsMantle', "Ghirahim's Mantle", 'legendary', { spd: 5, res: 5 }, '+5 SPD, +5 RES. Teleports reach 2 spaces further.', { effects: ['teleportBoost'], unique: true }),
  body('demisesScales', "Demise's Scales", 'mythic', { def: 8, res: 8 }, '+8 DEF, +8 RES. Fire damage −50%.', { effects: ['fireResist'], unique: true }),
  body('silentRealmVestments', 'Silent Realm Vestments', 'epic', {}, '+20 Avoid while no enemy is adjacent.', { effects: ['silentVestments'] }),
  hands('stalmastersBracers', "Stalmaster's Bracers", 'epic', {}, 'Smaller multi-weapon penalties: weapon weight slows you half as much.', { effects: ['multiWeapon'] }),
  hands('koloktosGauntlets', 'Koloktos Gauntlets', 'legendary', { str: 5, con: 6 }, '+5 STR, +6 CON.', { unique: true }),
  hands('ancientMechanicalGrips', 'Ancient Mechanical Grips', 'rare', {}, 'Better with ancient tech: +15 Hit and +2 damage with siege and electric weapons.', { effects: ['ancientGrip'] }),
  feet('skyKnightBoots', 'Sky Knight Boots', 'rare', {}, '+2 MOV while riding a flying mount.', { effects: ['skyBoots'] }),
  feet('mogmaBurrowBoots', 'Mogma Burrow Boots', 'epic', {}, 'Cheaper tunnel movement: travel between Burrowing Tunnels without using your action.', { effects: ['burrowBoots'] }),
  // ── Additional accessories (section 17) ──
  acc('crimsonFeather', 'Crimson Feather', 'legendary', { spd: 3 }, '+3 SPD; +15 Avoid while flying.', { effects: ['crimsonFeather'] }),
  acc('knightAcademyCrest', 'Knight Academy Crest', 'rare', {}, 'Combat experience +30% (weapon proficiency).', { effects: ['academyCrest'] }),
  acc('gratitudePendant', 'Gratitude Pendant', 'epic', {}, 'Completed side quests bring an extra Gratitude Crystal, and victories +2 reputation.', { effects: ['gratitudePendant'] }),
  acc('fisSpiritCrystal', "Fi's Spirit Crystal", 'legendary', {}, 'Reveals hidden enemies within 5 and lets you read their stance: +15 Hit against bosses and analyzed enemies.', { effects: ['fiCrystal'], unique: true }),
  acc('ghirahimsDiamond', "Ghirahim's Diamond", 'legendary', {}, 'One free short teleport (2 spaces) each turn (Diamond Step).', { effects: ['ghirahimDiamond'], unique: true }),
  acc('demisesFlame', "Demise's Flame", 'mythic', {}, '+1 STR for every 10% of your HP lost (max +6).', { effects: ['demisesFlame'], unique: true }),
  acc('scalderasMoltenCore', "Scaldera's Molten Core", 'legendary', {}, 'Immune to lava, and recover 20% HP starting a turn on it.', { effects: ['lavaImmune', 'moltenCore'], unique: true }),
  acc('moldarachsAncientEye', "Moldarach's Ancient Eye", 'epic', {}, 'Detects enemies hidden underground or in sand within 6.', { effects: ['ancientEye'] }),
  acc('koloktosPowerCore', 'Koloktos Power Core', 'mythic', {}, 'Once per battle, your first attack strikes one extra time.', { effects: ['powerCore'], unique: true }),
  acc('tentalusTentacleCharm', 'Tentalus Tentacle Charm', 'legendary', {}, 'Grappling range +2 (Hookshots, Clawshots, Whip).', { effects: ['ropeGloves'], unique: true }),
  acc('bilocytesParasiteGem', "Bilocyte's Parasite Gem", 'legendary', {}, 'Heal 25% of the damage you deal to larger enemies.', { effects: ['parasiteGem'], unique: true }),
  acc('leviasScale', "Levias's Scale", 'mythic', {}, 'Wind never slows you; +1 MOV while flying.', { effects: ['windCharm', 'flyMov'], unique: true }),
  acc('waterDragonsBlessing', "Water Dragon's Blessing", 'legendary', {}, 'Swim, and regenerate 10% HP per turn in water.', { effects: ['swim', 'jabunBlessing'], unique: true }),
  acc('fireDragonsBlessing', "Fire Dragon's Blessing", 'legendary', {}, 'Fire attacks +5 Might.', { effects: ['fireBlessing'], unique: true }),
  acc('thunderDragonsBlessing', "Thunder Dragon's Blessing", 'legendary', {}, 'Lightning attacks chain to one extra enemy near the target (half damage).', { effects: ['thunderBlessing'], unique: true }),
  // ── Loftwing mounts. The old OoT Loftwing mount is retired: its id stays (old saves), now the regular blue Loftwing. ──
  mount('loftwing', 'Loftwing', 'epic', { mov: 3, spd: 1 }, 'Sky Rider: +3 MOV, +1 SPD; the rider flies (watch out for arrows).', { effects: ['flight'], size: 2, art: 'loftwingBlue' }),
  mount('crimsonLoftwingMount', 'Crimson Loftwing', 'legendary', { mov: 4, avoid: 20 }, 'Chosen Companion: +4 MOV and +20 Avoid in the air; diving attacks (after moving) +25% damage. The Hero of the Sky rides it best (+10 Hit).',
    { effects: ['flight', 'crimsonDive'], size: 2, art: 'loftwing', unique: true }),
];
