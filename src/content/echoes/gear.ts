import type { GearDef, GearSlotKind, Rarity } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const gs = (slot: GearSlotKind) => (id: string, name: string, rarity: Rarity, stats: GearDef['stats'], desc: string, eo: string[] = [], extra: Partial<GearDef> = {}): GearDef =>
  ({ id, name, slot, rarity, price: PRICE[rarity], stats, desc, eo, ...extra });
const body = gs('body'), acc = gs('accessory');

// Section 11's outfits and accessories. The Green Tunic is the existing Hero's Clothes, Zora's Flippers and the
// Gerudo Sandals are the existing entries (the Sandals also ignore quicksand here). `eo` tags: engine/echoes.ts.
// Pieces of one upgrade family (`fam:` tags) don't stack: the better one counts.
export const GEAR: GearDef[] = [
  // ── Outfits ──
  body('disguiseEoW', 'Disguise', 'uncommon', { avoid: 5 }, 'Patrols detect the wearer less: +5 Avoid, and enemies more than 3 away ignore the wearer at the start of a battle.', ['disguise']),
  body('royalTravelAttire', 'Royal Travel Attire', 'rare', { spd: 3, res: 3 }, '+3 SPD and RES.'),
  body('customaryAttire', 'Customary Attire', 'rare', { res: 2 }, '+2 RES; support points earned by the wearer +50%.', ['supportXp']),
  body('silkPajamas', 'Silk Pajamas', 'epic', { res: 2 }, 'Bed Echoes heal the wearer twice as much.', ['pajamas']),
  body('dancingOutfit', 'Dancing Outfit', 'epic', { spd: 2 }, 'Spin attacks (Spin Attack, Heroic Spin) reach 1 space further.', ['dance']),
  body('catClothes', 'Cat Clothes', 'rare', { lck: 3 }, 'You can talk to cats. (+3 LCK, and cats in events like you.)', ['cats']),
  body('stampSuit', 'Stamp Suit', 'rare', { lck: 2 }, 'Better exploration rewards: Stamp Stations give two stamps, treasure gives more Rupees.', ['stampSuit']),
  // ── Accessories ──
  acc('heartPin', 'Heart Pin', 'uncommon', {}, 'More heart drops: the wearer recovers 3 HP whenever it defeats an enemy.', ['fam:heart:1']),
  acc('heartBarrette', 'Heart Barrette', 'rare', {}, 'More heart drops: the wearer recovers 6 HP whenever it defeats an enemy.', ['fam:heart:2']),
  acc('energyGlove', 'Energy Glove', 'rare', {}, 'Swordfighter Energy recovers 3 a turn (outside Swordfighter Form).', ['fam:energy:1']),
  acc('energyBelt', 'Energy Belt', 'epic', {}, 'Swordfighter Energy recovers 6 a turn (outside Swordfighter Form).', ['fam:energy:2']),
  acc('surveyScope', 'Survey Scope', 'rare', {}, 'More material drops after battle.', ['fam:survey:1']),
  acc('surveyBinoculars', 'Survey Binoculars', 'epic', {}, 'More material drops, and rarer ones.', ['fam:survey:2']),
  acc('frogRing', 'Frog Ring', 'epic', { spd: 1 }, 'Jumps low obstacles: Echo objects, rubble and mountains cost 1 less movement.', ['frogRing']),
  acc('zoraScaleEoW', 'Zora Scale', 'rare', { res: 1 }, 'Longer underwater endurance: the wearer can swim.', ['swim'], { effects: ['swim'] }),
  acc('climbingBand', 'Climbing Band', 'rare', {}, 'Better climbing: mountains, walls of Echo objects and Rotated Terrain cost 2.', ['fam:climb:1']),
  acc('climbingBrace', 'Climbing Brace', 'epic', {}, 'Much better climbing: mountains and Rotated Terrain cost 1.', ['fam:climb:2']),
  acc('iceSpikes', 'Ice Spikes', 'rare', {}, 'No slipping on ice: frozen terrain and Ice Blocks cost 1.', ['iceSpikes']),
  acc('spinBrace', 'Spin Brace', 'epic', {}, 'Spin attacks knock enemies back 1 space.', ['spinBrace']),
  acc('firstMastery', 'First Mastery', 'rare', {}, 'Swordfighter Form uses 20% less Energy.', ['fam:mastery:1']),
  acc('secondMastery', 'Second Mastery', 'epic', {}, 'Swordfighter Form uses 35% less Energy.', ['fam:mastery:2']),
  acc('finalMastery', 'Final Mastery', 'legendary', {}, 'Swordfighter Form uses 50% less Energy.', ['fam:mastery:3']),
  acc('curiousCharm', 'Curious Charm', 'rare', { def: 1 }, 'Less damage taken (−10%).', ['fam:charm:1']),
  acc('ancientCharm', 'Ancient Charm', 'legendary', { def: 2, res: 2 }, 'Much less damage taken (−20%).', ['fam:charm:2']),
  acc('nullsEmbrace', "Null's Embrace", 'mythic', { mag: 6, res: 4 }, 'Stronger Rift manipulation and dark magic: dark damage +25%, Bind always succeeds, Restoration and Rift Creation reach 1 further.', ['nullsEmbrace']),
];
