import type { AccessoryDef, PermanentItemDef, Rarity, SkillDef } from '../../engine/types';

const PRICE: Record<Rarity, number> = { common: 200, uncommon: 350, rare: 600, epic: 1000, legendary: 1600, mythic: 2600 };
const a = (id: string, name: string, rarity: Rarity, stats: AccessoryDef['stats'], desc: string, extra: Partial<AccessoryDef> = {}): AccessoryDef =>
  ({ id, name, rarity, price: PRICE[rarity], stats, desc, ...extra });

// One accessory slot per unit for now. Effects that depend on systems not
// built yet (elements, MP, status effects) are noted as "coming later".
export const ACCESSORIES: AccessoryDef[] = [
  a('gerudoJewel', 'Gerudo Jewel', 'uncommon', { skl: 2, lck: 1 }, '+2 SKL, +1 LCK.'),
  a('kokiriCharm', 'Kokiri Charm', 'uncommon', { lck: 2 }, '+2 LCK.'),
  a('goronRubyPendant', 'Goron Ruby Pendant', 'rare', { str: 2 }, '+2 STR. (Fire resistance coming with elements.)'),
  a('zoraPearl', 'Zora Pearl Necklace', 'rare', { mag: 2 }, '+2 MAG.'),
  a('royalCrest', 'Royal Family Crest', 'epic', { res: 2 }, '+2 RES; adjacent allies gain +5 Hit.', { effects: ['crestAura'] }),
  a('lonLonHorseshoe', 'Lon Lon Horseshoe', 'uncommon', { lck: 2 }, '+2 LCK; +10 Avoid while mounted.', { effects: ['mountedAvoid'] }),
  a('poeCharm', 'Poe Spirit Charm', 'rare', { res: 3 }, '+3 RES.'),
  a('sacredForestSeed', 'Sacred Forest Seed', 'rare', {}, 'Restores 2 HP each turn in forests.', { effects: ['forestRegen'] }),
  a('dodongoFang', 'Dodongo Fang Necklace', 'rare', {}, '+3 STR against beasts.', { effects: ['beastSlayer'] }),
  a('gohmaEye', "Gohma's Eye", 'epic', {}, '+20 Hit against large (size 2+) enemies.', { effects: ['giantEye'], unique: true }),
  a('ganonHorn', "Ganon's Horn Fragment", 'legendary', { str: 5, lck: -3 }, '+5 STR, −3 LCK.', { unique: true }),
  a('twinrovaGem', "Twinrova's Gem", 'legendary', { mag: 4 }, '+4 MAG. (Fire/ice resistance coming with elements.)', { unique: true }),
  // Spiritual Stones
  a('kokiriEmerald', "Kokiri's Emerald", 'legendary', { spd: 2, lck: 2 }, '+2 SPD, +2 LCK; regenerate 2 HP per turn in forests.', { effects: ['forestRegen'], unique: true }),
  a('goronRuby', "Goron's Ruby", 'legendary', { str: 3, def: 2 }, '+3 STR, +2 DEF.', { unique: true }),
  a('zoraSapphire', "Zora's Sapphire", 'legendary', { mag: 3, res: 2 }, '+3 MAG, +2 RES.', { unique: true }),
  // Sage Medallions
  a('lightMedallion', 'Light Medallion', 'legendary', { res: 4, mag: 2 }, '+4 RES, +2 MAG; adjacent allies recover 3 HP each turn.', { effects: ['lightAura'], unique: true }),
  a('forestMedallion', 'Forest Medallion', 'legendary', { spd: 3, lck: 2, avoid: 10 }, '+3 SPD, +2 LCK, +10 Avoid.', { unique: true }),
  a('fireMedallion', 'Fire Medallion', 'legendary', { str: 4, def: 2 }, '+4 STR, +2 DEF.', { unique: true }),
  a('waterMedallion', 'Water Medallion', 'legendary', { mag: 4, res: 2 }, '+4 MAG, +2 RES.', { unique: true }),
  a('shadowMedallion', 'Shadow Medallion', 'legendary', { skl: 4, avoid: 10 }, '+4 SKL, +10 Avoid.', { unique: true }),
  a('spiritMedallion', 'Spirit Medallion', 'legendary', { str: 3, mag: 3 }, '+3 STR, +3 MAG.', { unique: true }),
  // Triforce
  a('triforceCourage', 'Triforce of Courage', 'mythic', { str: 4, skl: 4, spd: 4 }, '+4 STR/SKL/SPD; survive one fatal attack per battle with 1 HP.', { effects: ['surviveOnce'], unique: true }),
  a('triforceWisdom', 'Triforce of Wisdom', 'mythic', { mag: 6, res: 6 }, '+6 MAG, +6 RES.', { unique: true }),
  a('triforcePower', 'Triforce of Power', 'mythic', { str: 6, def: 4, mag: 4 }, '+6 STR, +4 DEF, +4 MAG; +25% damage below half HP.', { effects: ['desperation'], unique: true }),
];

// The doc doesn't give amounts for the gems/seeds; +2 (+1 MOV) is my proposal.
export const PERMANENT_ITEMS: PermanentItemDef[] = [
  { id: 'heartContainer', name: 'Heart Container', price: 400, stat: 'hp', amount: 4, desc: 'Permanently +4 max HP.' },
  { id: 'powerGem', name: 'Power Gem', price: 450, stat: 'str', amount: 2, desc: 'Permanently +2 STR.' },
  { id: 'wisdomGem', name: 'Wisdom Gem', price: 450, stat: 'mag', amount: 2, desc: 'Permanently +2 MAG.' },
  { id: 'courageGem', name: 'Courage Gem', price: 400, stat: 'skl', amount: 2, desc: 'Permanently +2 SKL.' },
  { id: 'speedSeed', name: 'Speed Seed', price: 450, stat: 'spd', amount: 2, desc: 'Permanently +2 SPD.' },
  { id: 'defenseSeed', name: 'Defense Seed', price: 450, stat: 'def', amount: 2, desc: 'Permanently +2 DEF.' },
  { id: 'resistanceSeed', name: 'Resistance Seed', price: 400, stat: 'res', amount: 2, desc: 'Permanently +2 RES.' },
  { id: 'luckyRing', name: 'Lucky Ring Fragment', price: 300, stat: 'lck', amount: 2, desc: 'Permanently +2 LCK.' },
  { id: 'goddessPlume', name: 'Goddess Plume', price: 900, stat: 'mov', amount: 1, desc: 'Permanently +1 MOV.' },
];

export const SKILLS: SkillDef[] = [
  { id: 'spiritOfCourage', name: 'Spirit of Courage', implemented: true, desc: '+2 STR, SKL and SPD when fighting an enemy at least three levels higher.' },
  { id: 'smallButMighty', name: 'Small but Mighty', implemented: true, desc: '+20 Avoid against enemies with at least twice his CON.' },
  { id: 'spiritOfWisdom', name: 'Spirit of Wisdom', implemented: true, desc: 'Allies within two spaces gain +2 RES and +10 Hit.' },
  { id: 'vanishingAct', name: 'Vanishing Act', implemented: true, desc: 'After defeating an enemy, may move up to three additional spaces.' },
  { id: 'spiritOfPower', name: 'Spirit of Power', implemented: true, desc: '+1 STR and MAG per enemy personally defeated this battle (max +5).' },
  { id: 'sacredSanctuary', name: 'Sacred Sanctuary', implemented: true, desc: 'Allies beginning their turn within two spaces recover 10% max HP.' },
  { id: 'forestsFriendship', name: "Forest's Friendship", implemented: true, desc: 'Saria and adjacent allies ignore forest movement penalties and gain +10 Avoid in forests.' },
  { id: 'swornBrother', name: 'Sworn Brother', implemented: true, desc: '+3 STR and DEF when adjacent to an ally below half HP.' },
  { id: 'royalWaters', name: 'Royal Waters', implemented: true, desc: 'Recovers 15% max HP each turn while in water.' },
  { id: 'royalProtector', name: 'Royal Protector', implemented: true, desc: 'Once per enemy phase, intercepts an attack targeting an adjacent ally.' },
  { id: 'loneThief', name: 'Lone Thief', implemented: true, desc: '+15 Hit and Avoid when no allies are adjacent.' },
  { id: 'songOfTheRanch', name: 'Song of the Ranch', implemented: false, desc: 'Restores HP to adjacent mounted units and removes their movement penalties. (Coming with songs.)' },
  { id: 'ranchSupplies', name: 'Ranch Supplies', implemented: false, desc: 'Produces two bottles of Lon Lon Milk after each battle. (Coming with items.)' },
  { id: 'ruthlessRider', name: 'Ruthless Rider', implemented: true, desc: '+3 damage when attacking after moving at least four spaces.' },
  { id: 'kokiriAuthority', name: 'Kokiri Authority', implemented: true, desc: 'Kokiri allies within two spaces gain +2 SKL and SPD.' },
  { id: 'royalPresence', name: 'Royal Presence', implemented: true, desc: 'Zora allies within three spaces gain +2 DEF and RES.' },
  { id: 'masterCraftsman', name: 'Master Craftsman', implemented: false, desc: 'Restores five durability to an adjacent ally’s weapon once per battle. (Coming with durability.)' },
  { id: 'heavyForging', name: 'Heavy Forging', implemented: true, desc: 'Two-handed weapons gain +2 Might in his hands.' },
  { id: 'graveyardShift', name: 'Graveyard Shift', implemented: false, desc: 'Excavates special spaces for treasure and reveals hidden undead. (Coming with dig spots.)' },
  { id: 'maskCollector', name: 'Mask Collector', implemented: false, desc: 'Receives 50% greater bonuses from masks. (Coming with head slot.)' },
  { id: 'masterBuilder', name: 'Master Builder', implemented: false, desc: 'Repairs bridges, builds barricades and removes obstacles. (Coming with destructible terrain.)' },
  { id: 'heyListen', name: 'Hey! Listen!', implemented: true, desc: 'Allies within two spaces gain +20 Hit. (Simplified: marking a single enemy comes later.)' },
  { id: 'ancientGuidance', name: 'Ancient Guidance', implemented: false, desc: 'Reveals fog and transports an adjacent infantry unit. (Coming with fog/transport.)' },
  { id: 'guardianOfTheForest', name: 'Guardian of the Forest', implemented: true, desc: 'Allies within three spaces recover 10% max HP each turn. (Creating forest terrain comes later.)' },
  { id: 'greatFairysBlessing', name: "Great Fairy's Blessing", implemented: false, desc: 'Restores a large amount of HP and MP to an ally once per battle. (Coming with MP.)' },
  { id: 'witchOfFlame', name: 'Witch of Flame', implemented: false, desc: 'Fire attacks inflict Burning for an extra turn. (Coming with status effects.)' },
  { id: 'witchOfIce', name: 'Witch of Ice', implemented: false, desc: 'Ice attacks reduce movement by two more. (Coming with status effects.)' },
  { id: 'combinedSorcery', name: 'Combined Sorcery', implemented: false, desc: 'Alternates fire and ice magic freely. (Coming with elements.)' },
  { id: 'spectralPassage', name: 'Spectral Passage', implemented: true, desc: 'Moves through enemy units and walls.' },
  { id: 'demonicFury', name: 'Demonic Fury', implemented: true, desc: '+5 STR below 50% HP. (Forced-movement immunity comes later.)' },
  { id: 'darkReflection', name: 'Dark Reflection', implemented: true, desc: 'When initiating combat, copies the target’s STR and SPD if higher.' },
  { id: 'lifesteal', name: 'Life Drain', implemented: true, desc: 'Heals for half the damage dealt.' },
  { id: 'enslavedWarrior', name: 'Enslaved Warrior', implemented: true, desc: '+4 DEF. (Status and forced-movement immunity come later.)' },
];
