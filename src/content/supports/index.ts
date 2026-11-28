// The expanded support network (docs/support-expansion.md): every pairing's
// highest rank and theme, their conversations, named pair bonuses and group supports.

import { SUPPORT_REGISTRY as BASE_REGISTRY, type SupportPairDef } from './registry';
import { SUPPORT_REGISTRY_SS } from './registrySS';
import { SUPPORT_REGISTRY_WILD } from './registryWild';
import { SUPPORT_REGISTRY_ORIGINAL } from './registryOriginal';
import { SUPPORT_REGISTRY_AOL } from './registryAol';
import { SUPPORT_REGISTRY_LEGEND } from './registryLegend';
import { SUPPORT_REGISTRY_PHANTOM } from './registryPhantom';
import { SUPPORT_REGISTRY_SPIRIT } from './registrySpirit';
import { SUPPORT_REGISTRY_MINISH } from './registryMinish';
import { SUPPORT_REGISTRY_FOURSWORDS } from './registryFourSwords';
import { SUPPORT_REGISTRY_LORULE } from './registryLorule';
import { SUPPORT_REGISTRY_ECHOES } from './registryEchoes';
import { CONVOS as EXAMPLES } from './convos/examples';
import { WRITTEN } from './written';

export type { SupportPairDef };
/** Every registered pairing, all packs. */
export const SUPPORT_REGISTRY: SupportPairDef[] = [...BASE_REGISTRY, ...SUPPORT_REGISTRY_SS, ...SUPPORT_REGISTRY_WILD, ...SUPPORT_REGISTRY_ORIGINAL, ...SUPPORT_REGISTRY_AOL, ...SUPPORT_REGISTRY_LEGEND, ...SUPPORT_REGISTRY_PHANTOM, ...SUPPORT_REGISTRY_SPIRIT, ...SUPPORT_REGISTRY_MINISH, ...SUPPORT_REGISTRY_FOURSWORDS, ...SUPPORT_REGISTRY_LORULE, ...SUPPORT_REGISTRY_ECHOES];

export type SupportLine = ['a' | 'b' | 'n', string];
export type SupportRankKey = 'C' | 'B' | 'A' | 'S';
export type ConvoSet = Partial<Record<SupportRankKey, SupportLine[]>>;

/** Forms that share their character's support progression (and conversations). */
export const SUPPORT_CANON: Record<string, string> = {
  sheik: 'zelda', zeldaWW: 'tetra', kingOfRedLions: 'kingDaphnes', majorasIncarnation: 'majorasMask', majorasWrath: 'majorasMask',
  wolfLink: 'heroOfTwilight', wolfLinkMidna: 'heroOfTwilight', dekuLink: 'terminaLink', goronLink: 'terminaLink', zoraLink: 'terminaLink',
  fierceDeityLink: 'terminaLink', giantLink: 'terminaLink', midnaTrue: 'midnaImp', fusedShadowMidna: 'midnaImp', ironKnuckleNabooru: 'nabooru',
  ganon: 'ganondorf', twinrova: 'koume', puppetGanonSpider: 'puppetGanonBeast', puppetGanonSnake: 'puppetGanonBeast',
  // Boss forms of recruitable characters
  zantBoss: 'zant', ganondorfTPBoss: 'ganondorfTP', kingBulblinBoss: 'kingBulblin', darkBeastGanonBoss: 'ganondorfTP', ganondorfWWBoss: 'ganondorfWW',
  darkBeastGanon: 'ganondorfTP',
  // Skyward Sword forms
  ghirahimTrue: 'ghirahim', imprisonedArmed: 'imprisoned', imprisonedFlying: 'imprisoned',
  // Era of the Wild forms
  bellumbeck: 'linebeck', oceanKing: 'oshus',
  // Spirit Tracks forms: Zelda's spirit and her Phantom armors, the Demon King in her body, boss forms
  spiritZelda: 'zeldaST', phantomZelda: 'zeldaST', phantomZeldaTorch: 'zeldaST', phantomZeldaWarp: 'zeldaST', phantomZeldaWrecker: 'zeldaST',
  malladusZelda: 'malladus', coleBoss: 'cole', byrneBoss: 'byrne', bigBlinBoss: 'bigBlin',
  // The Minish Cap forms: Micro Link, Ezlo's cap, and Vaati's Minish and demonic shapes
  // Echoes of Wisdom boss forms
  tekomBoss: 'tekom', echoLink: 'linkEoW',
  microLink: 'heroOfMinish', ezloCap: 'ezloMinish', vaatiMinish: 'vaatiHylian', vaatiReborn: 'vaatiHylian', vaatiTransfigured: 'vaatiHylian', vaatisWrath: 'vaatiHylian',
  // Four Swords: the Wind Mage is Vaati too
  vaatiWindMage: 'vaatiHylian',
  nayruPossessed: 'nayru', onoxDragon: 'onox', veranFairy: 'veran', veranTurtle: 'veran', veranSpider: 'veran', veranBee: 'veran',
  lightDragon: 'zeldaWild', demonDragon: 'ganondorfWild', darkBeastGanonWild: 'calamityGanon', mineruConstruct: 'mineru',
};
export const canonOf = (id: string) => SUPPORT_CANON[id] ?? id;
export const pairKey = (a: string, b: string) => { const x = canonOf(a), y = canonOf(b); return x < y ? `${x}|${y}` : `${y}|${x}`; };

const BASE = new Map<string, SupportPairDef>();
const FORMS = new Map<string, SupportPairDef[]>();
for (const p of SUPPORT_REGISTRY) {
  const base = p.key.split('#')[0];
  if (p.form) (FORMS.get(base) ?? FORMS.set(base, []).get(base)!).push(p);
  else if (!BASE.has(base)) BASE.set(base, p);
}

/** The registered pairing for two templates (forms resolve to their character). */
export function pairDef(ta: string, tb: string): SupportPairDef | undefined {
  return BASE.get(pairKey(ta, tb)) ?? FORMS.get(pairKey(ta, tb))?.[0];
}

/** Form-specific conversations for a pair (they share the pair's progression). */
export function formPairs(ta: string, tb: string): SupportPairDef[] {
  return FORMS.get(pairKey(ta, tb)) ?? [];
}

/** Highest rank two templates can reach: the registry's, or A for unlisted pairs. */
export function maxRankFor(ta: string, tb: string): 'B' | 'A' | 'S' {
  const d = pairDef(ta, tb);
  if (!d) return 'A';
  return d.max;
}

/** Every written conversation, keyed like the registry (`a|b` or `a|b#form`). */
export const SUPPORT_CONVOS: Record<string, ConvoSet> = { ...WRITTEN, ...EXAMPLES };

/** Named bonuses for pairs that reach a rank (doc section 9). */
export const PAIR_BONUSES: Record<string, { rank: 'A' | 'S'; name: string; text: string; radius: number; stats: Partial<Record<'str' | 'mag' | 'skl' | 'spd' | 'def' | 'res', number>> }> = {
  'heroOfWinds|link': { rank: 'S', name: 'A New Generation', radius: 3, stats: { str: 3, skl: 3 }, text: 'Both heroes gain +3 STR and SKL within 3 spaces of each other.' },
  'midnaImp|tatl': { rank: 'A', name: 'Unlikely Companions', radius: 99, stats: { mag: 3, spd: 3 }, text: 'Tatl and Midna gain +3 MAG and SPD.' },
  'darmani|darunia': { rank: 'S', name: 'Brotherhood of Stone', radius: 3, stats: { str: 4, def: 4 }, text: 'Both gain +4 STR and DEF within 3 spaces of each other.' },
  'herosShade|link': { rank: 'S', name: 'A Legacy Remembered', radius: 99, stats: { skl: 4 }, text: 'The Hero of Time learns all seven Hidden Skills. Both gain +4 SKL; sword techniques cost 25% less stamina.' },
};

export interface GroupSupport {
  id: string;
  name: string;
  members: string[];
  /** All members must be deployed; "any N" groups list a minimum. */
  need?: number;
  text: string;
}

/** Group supports (doc section 8): they switch on when every member is on the field. */
export const GROUP_SUPPORTS: GroupSupport[] = [
  { id: 'courageOfGenerations', name: 'The Courage of Generations', members: ['link', 'heroOfWinds', 'heroOfTwilight'], text: '+3 STR, SKL and SPD when fighting within 3 spaces of one another.' },
  { id: 'threePrincesses', name: 'Three Princesses', members: ['zelda', 'tetra', 'zeldaTP'], text: '+4 MAG and RES; sacred (light) abilities cost 20% less MP.' },
  { id: 'threeDarkLords', name: 'The Three Dark Lords', members: ['ganondorf', 'ganondorfWW', 'ganondorfTP'], text: '+5 STR and MAG against bosses.' },
  { id: 'companionsOfCourage', name: 'Companions of Courage', members: ['navi', 'tatl', 'midnaImp'], text: 'Heroes adjacent to any of them gain +20 Hit and Avoid.' },
  { id: 'swornBrothers', name: 'Sworn Brothers', members: ['darunia', 'darmani', 'darbus'], text: '+5 STR and DEF; smaller enemies can\'t move them.' },
  { id: 'sagesOfTheForest', name: 'Sages of the Forest', members: ['saria', 'fado', 'makar'], text: 'Nature and wind abilities and songs cost 30% less MP.' },
  { id: 'voicesOfTheSea', name: 'Voices of the Sea', members: ['ruto', 'lulu', 'medli'], text: 'Their songs reach 2 spaces further and their healing +25%.' },
  { id: 'poeQuartet', name: 'The Poe Quartet', members: ['joelle', 'beth', 'amy', 'meg'], text: 'Enhanced spectral magic and shared MP regeneration (Flames of the Forest Temple).' },
  { id: 'fallenHeroes', name: 'The Fallen Heroes', members: ['herosShade', 'darmani', 'mikau'], text: '+4 STR and RES; immune to fear.' },
  { id: 'kingdomOfIkana', name: 'The Kingdom of Ikana', members: ['igosDuIkana', 'captainKeeta', 'ikanaServant1', 'ikanaServant2'], text: 'All four gain +3 STR, DEF and RES.' },
  { id: 'forgottenKings', name: 'The Forgotten Kings', members: ['kingDaphnes', 'igosDuIkana', 'kingZora'], text: 'Allies within 3 of any of them gain +3 DEF and RES.' },
  { id: 'ancientWaters', name: 'The Ancient Waters', members: ['jabuJabu', 'jabun', 'giantTurtle'], text: 'Aquatic allies regenerate 10% max HP per turn.' },
  { id: 'guardiansOfTheWorld', name: 'Guardians of the World', members: ['dekuTree', 'valoo', 'jabun'], text: 'Allies heal 20% more and gain +3 RES.' },
  { id: 'fourGiants', name: 'The Four Giants', members: ['woodfallGiant', 'snowheadGiant', 'greatBayGiant', 'ikanaGiant'], text: '+5 STR, DEF and RES.' },
  { id: 'restorationOfLight', name: 'Restoration of Light', members: ['ordona', 'faron', 'eldin', 'lanayru'], text: 'Twilight can\'t spread within 4 spaces of any of them, and they purify everything within 2.' },
  { id: 'theResistance', name: 'The Resistance', members: ['telma', 'rusl', 'ashei', 'auru', 'shad'], text: 'One more recruit offered, +2 supplies after each battle, and they spot hidden enemies within 4.' },
  { id: 'ordonFamily', name: 'Ordon Family', members: ['rusl', 'colin', 'ilia', 'mayorBo'], text: '+3 DEF and RES next to an injured member.' },
  { id: 'outsetFamily', name: 'Outset Family', members: ['heroOfWinds', 'aryll', 'grandma'], text: 'Healing received +25%; immune to fear.' },
  { id: 'ranchFamily', name: 'The Ranch Family', members: ['malon', 'talon'], text: 'With Epona in the army: mounted allies +1 MOV, and the army recovers 10% more HP after battle.' },
  { id: 'merchantsGuild', name: "The Merchants' Guild", members: ['beedle', 'malo', 'maskSalesman'], text: 'Shop prices 10% lower.' },
  { id: 'mastersOfTheBlade', name: 'Masters of the Blade', members: ['herosShade', 'orca', 'impa'], text: 'Sword techniques cost 25% less stamina.' },
  { id: 'royalWitches', name: 'The Royal Witches', members: ['koume', 'kotake', 'ganondorf'], text: 'Fire, ice and darkness deal 20% more damage.' },
  { id: 'aPromiseKept', name: 'A Promise Kept', members: ['kafei', 'anju', 'terminaLink'], text: 'Once per battle, a member survives a fatal blow next to another member.' },
  { id: 'thePirateCrew', name: 'The Pirate Crew', members: ['tetra', 'gonzo', 'niko'], text: '+2 STR (boarding and ship decks +4) and vessels +1 MOV.' },
  { id: 'friendsOfTheForest', name: 'Friends of the Forest', members: ['saria', 'mido', 'skullKid'], text: '+20 Avoid in forests.' },
  // Skyward Sword (docs/skyward-sword-pack.md section 23)
  { id: 'originsOfCourage', name: 'Origins of Courage', members: ['heroOfTheSky', 'zeldaSS', 'fi'], text: 'Sacred weapons (light, the Goddess Swords, the Master Sword) deal +4 damage.' },
  { id: 'firstKnights', name: 'The First Knights', members: ['heroOfTheSky', 'groose', 'pipit', 'karane'], text: 'Sword experience +25% and +1 stamina recovered each turn.' },
  { id: 'ancientDragons', name: 'The Ancient Dragons', members: ['faronDragon', 'eldinDragon', 'lanayruDragon'], text: 'Elemental damage +25%.' },
  { id: 'heroesSong', name: 'Song of the Hero', members: ['faronDragon', 'eldinDragon', 'lanayruDragon', 'levias'], text: 'Unlocks a cooperative sacred attack (Guardians\' Chorus): every enemy near any of them takes sacred damage.' },
  { id: 'goddessServants', name: "The Goddess's Servants", members: ['hylia', 'impaSS', 'fi'], text: 'Sacred magic costs 30% less MP.' },
  { id: 'ancientEngineering', name: 'Ancient Engineering', members: ['gondo', 'scrapper', 'skipper'], text: 'Equipment upgrades need 30% fewer materials.' },
  { id: 'demonAndBlade', name: 'The Demon and His Blade', members: ['demise', 'ghirahim'], text: 'Dark attacks +5 damage and ignore 20% of RES.' },
  { id: 'siegeSpecialists', name: 'Siege Specialists', members: ['groose', 'auru', 'barnes'], text: 'Siege weapons +20 Hit; Bombardment blasts a bigger area.' },
  { id: 'forgersOfLegends', name: 'Forgers of Legends', members: ['gondo', 'biggoron', 'medigoron'], text: 'Equipment upgrades need 30% fewer materials.' },
  { id: 'spiritsOfTheSword', name: 'Spirits of the Sword', members: ['fi', 'ghirahim', 'herosShade'], text: 'Sword attacks +3 damage; sword techniques cost 20% less stamina.' },
  // Era of the Wild (docs/era-of-the-wild-pack.md section 30)
  { id: 'championsOfHyrule', name: 'Champions of Hyrule', members: ['mipha', 'daruk', 'revali', 'urbosa'], text: "Champion abilities gain one more charge; Mipha's Grace restores all HP instead." },
  { id: 'fiveChampions', name: 'The Five Champions', members: ['heroOfTheWild', 'mipha', 'daruk', 'revali', 'urbosa'], text: '+4 STR, SKL and RES while fighting together (within 3 of another member).' },
  { id: 'sagesOfTheNewEra', name: 'Sages of the New Era', members: ['sidon', 'yunobo', 'tulin', 'riju', 'mineru'], text: 'Sage ability cooldowns −1 (minimum 1).' },
  { id: 'acrossOneHundredYears', name: 'Across One Hundred Years', members: ['heroOfTheWild', 'zeldaWild', 'kingRhoam', 'impaWild'], text: '+10 morale at the start of battle; members are immune to fear.' },
  { id: 'foundingOfHyrule', name: 'The Founding of Hyrule', members: ['rauruZonai', 'sonia', 'mineru'], text: 'Sacred and Zonai abilities +25%.' },
  { id: 'sheikahResearchTeam', name: 'Sheikah Research Team', members: ['purah', 'robbie', 'impaWild'], text: 'Ancient research costs 30% less.' },
  { id: 'ancientAndModernTech', name: 'Ancient and Modern Technology', members: ['purah', 'robbie', 'mineru', 'gondo'], text: 'Repair and crafting 30% more efficient (cheaper vehicles and repairs; machines heal 30% more).' },
  { id: 'threeGenerationsOfRito', name: 'The Three Generations of Rito', members: ['revali', 'teba', 'tulin'], text: '+3 SKL and SPD and +1 aerial MOV.' },
  { id: 'zoraRoyalFamily', name: 'The Zora Royal Family', members: ['dorephan', 'mipha', 'sidon', 'yona'], text: 'Aquatic allies near a member heal 25% more, regenerate a little and gain +3 DEF.' },
  { id: 'gerudoLegacy', name: 'Gerudo Legacy', members: ['nabooru', 'urbosa', 'riju'], text: 'Lightning damage +25% and sword Critical +10.' },
  { id: 'goronChampions', name: 'Goron Champions', members: ['darunia', 'darmani', 'darbus', 'daruk', 'yunobo'], text: '+5 STR and DEF; heavy weapons hit 20% harder.' },
  { id: 'fourDivineBeasts', name: 'The Four Divine Beasts', members: ['vahRuta', 'vahRudania', 'vahMedoh', 'vahNaboris'], text: 'Unlocks Combined Bombardment: every enemy near any of them is shelled.' },
  { id: 'threeSacredDragons', name: 'The Three Sacred Dragons', members: ['dinraal', 'naydra', 'farosh'], text: 'Their elemental attacks cover more area (they hit the spaces around the target) and +10%.' },
  { id: 'yigaEngineeringDivision', name: 'The Yiga Engineering Division', members: ['kohga', 'yigaEngineer', 'groose'], text: 'Vehicles cost 30% less to build; siege weapons +20% damage.' },
  { id: 'ancientWarMachines', name: 'The Ancient War Machines', members: ['guardianStalker', 'koloktos', 'fluxConstruct3'], text: '+4 DEF for machines; members within 3 of each other +10 Hit (coordinated attacks).' },
  { id: 'firstAndTheLast', name: 'The First and the Last', members: ['heroOfTheSky', 'heroOfTheWild', 'fi'], text: 'Master Sword +5 Might, more energy and faster recharge.' },
  { id: 'legacyOfHylia', name: 'The Legacy of Hylia', members: ['hylia', 'zeldaSS', 'zeldaWild'], text: 'Sacred abilities cost 30% less MP.' },
  // Spirit Tracks (docs/spirit-tracks-pack.md section 13)
  { id: 'royalEngineersGroup', name: 'Royal Engineers', members: ['heroOfSpirits', 'zeldaST', 'alfonzo'], text: 'Better railway combat and repairs: members and allied trains +2 STR and DEF (trains +10 Hit).' },
  { id: 'sacredSymphonyGroup', name: 'Sacred Symphony', members: ['anjean', 'gage', 'steem', 'carben', 'embrose', 'rael'], text: 'Their songs cost 30% less MP.' },
  { id: 'generationsOfAdventure', name: 'Generations of Adventure', members: ['linebeck', 'linebeck3', 'elderNiko'], text: 'More treasure and salvage: +25% battle Rupees; members +2 SKL and SPD.' },
  { id: 'spiritsOfCourageST', name: 'Spirits of Courage', members: ['zeldaST', 'ciela', 'tetra'], text: '+3 SKL and MAG.' },
  { id: 'brokenSeal', name: 'The Broken Seal', members: ['cole', 'byrne', 'malladus'], text: 'Dark magic hits harder and possession is resisted: +3 STR, MAG and RES with dark weapons.' },
  // The Minish Cap (docs/minish-cap-pack.md section 13)
  { id: 'picoriLegend', name: 'Picori Legend', members: ['heroOfMinish', 'zeldaMC', 'ezloMinish'], text: 'Stronger sacred damage (+15%) and Micro transformation: members shrink and grow anywhere.' },
  { id: 'unitedMinish', name: 'United Minish', members: ['gentari', 'melari', 'librari'], text: 'Allied Micro units gain +2 DEF, RES and MOV.' },
  { id: 'masterForgers', name: 'Master Forgers', members: ['smith', 'melari', 'biggoron', 'zauz'], text: 'Cheaper crafting and better weapon durability: members gain +2 STR, and crafting at the Minish Forge costs 30% less.' },
  { id: 'bladeBrotherhood', name: 'Blade Brotherhood', members: ['swiftblade', 'greatblade', 'grimblade', 'swiftbladeFirst'], text: 'Their sword techniques cost 25% less STA.' },
  { id: 'herosCompanions', name: "Hero's Companions", members: ['ezloMinish', 'navi', 'tatl', 'ciela', 'fi'], text: 'Longer support-ability range and better MP recovery: members recover 3 MP a turn and gain +10 Hit and Avoid within 3 of a hero.' },
  { id: 'forbiddenAmbitionGroup', name: 'Forbidden Ambition', members: ['vaatiHylian', 'ghirahim', 'zant'], text: 'More dark magic damage (+20%).' },
  { id: 'ancientGuardians', name: 'Ancient Guardians', members: ['mazaal', 'gohdan', 'eox'], text: 'More construct defence (allied constructs take 15% less damage) and resistance to disabling effects (no Stun, Root or Freeze).' },
  // Four Swords & Four Swords Adventures (docs/four-swords-pack.md section 12)
  { id: 'fourfoldCourage', name: 'Fourfold Courage', members: ['greenLink', 'redLink', 'blueLink', 'purpleLink'], text: '+3 to all combat stats (STR, MAG, SKL, SPD, DEF, RES) while all four Links are within 4 of one another.' },
  { id: 'sacredFellowship', name: 'Sacred Fellowship', members: ['greenLink', 'redLink', 'blueLink', 'purpleLink', 'zeldaFS'], text: 'More healing (+15%) and sacred damage (+15% for the Links and Zelda).' },
  { id: 'fivefoldReflection', name: 'Fivefold Reflection', members: ['greenLink', 'redLink', 'blueLink', 'purpleLink', 'shadowLink'], text: 'Stronger shadow duplicates (60% HP, 75% of STR, MAG and SKL) and Four Sword copies.' },
  { id: 'sacredSealGroup', name: 'Sacred Seal', members: ['zeldaFS', 'greenMaiden', 'redMaiden', 'blueMaiden', 'purpleMaiden', 'yellowMaiden', 'whiteMaiden'], text: 'Much more resistance to dark magic: members take half dark damage.' },
  { id: 'darkConspiracy', name: 'Dark Conspiracy', members: ['vaatiHylian', 'ganonFSA', 'shadowLink'], text: 'More dark damage (+15%) and concealment (members are Veiled at the start of each turn while no enemy is next to them).' },
  { id: 'legacyOfFourSword', name: 'Legacy of the Four Sword', members: ['heroOfMinish', 'ezloMinish', 'greenLink', 'redLink', 'blueLink', 'purpleLink'], text: 'Four Sword abilities (Four Sword Split, the Links\' techniques and formation commands) cost 30% less.' },
  // A Link Between Worlds (docs/link-between-worlds-pack.md section 12) and the River Zora (docs/river-zora.md)
  { id: 'courageRestored', name: 'Courage Restored', members: ['linkALBW', 'zeldaALBW', 'ravio'], text: 'More sacred damage (+15%) and morale (+10 Hit, +5 Avoid).' },
  { id: 'betweenKingdoms', name: 'Between Kingdoms', members: ['zeldaALBW', 'hilda', 'linkALBW', 'ravio'], text: 'Cheaper world travel and wall merging: Wall Merge and its upkeep cost 25% less MP.' },
  { id: 'sagesUnited', name: 'Sages United', members: ['gulley', 'osfala', 'seres', 'oren', 'rosso', 'irene', 'impaALBW'], text: '+4 MAG and RES; their support spells cost 25% less MP.' },
  { id: 'hopeForLorule', name: 'Hope for Lorule', members: ['hilda', 'ravio', 'thiefGirl'], text: 'Better survival and item recovery: +2 DEF and RES.' },
  { id: 'businessPartners', name: 'Business Partners', members: ['ravio', 'beedle', 'tingle', 'linebeck'], text: 'Lower prices: Ravio\'s Shop 15% cheaper while all four are in the army.' },
  { id: 'veteranMasters', name: 'Veteran Masters', members: ['gramps', 'herosShade', 'swiftbladeFirst'], text: 'Better techniques and counters: +3 SKL and +5 Crit; sword techniques cost 20% less STA.' },
  { id: 'forbiddenSorcery', name: 'Forbidden Sorcery', members: ['yuga', 'agahnim', 'vaatiHylian'], text: 'More magic damage (+15%).' },
  { id: 'familyReunion', name: 'Family Reunion', members: ['motherMaiamai', 'babyMaiamai'], need: 5, text: 'Mother Maiamai and four Baby Maiamai: the Maiamai regenerate 10% HP a turn.' },
  { id: 'riverPack', name: 'River Pack', members: ['riverZora', 'riverZoraWarrior', 'riverZoraHunter', 'riverZoraGuardian', 'riverZoraSorcerer', 'riverZoraChieftain'], need: 3, text: 'Any three River Zora: +2 STR and MAG near one another.' },
  { id: 'riverHuntingParty', name: 'River Hunting Party', members: ['riverZoraWarrior', 'riverZoraHunter', 'riverZoraGuardian'], text: '+15 Hit and Avoid near water.' },
  { id: 'mastersOfTheCurrent', name: 'Masters of the Current', members: ['riverZoraChieftain', 'riverZoraSorcerer'], text: 'Their floods last 2 more turns.' },
  { id: 'riverRoyalty', name: 'River Royalty', members: ['oren', 'riverZoraChieftain'], text: 'Every allied River Zora gains +3 DEF and RES.' },
  { id: 'unitedWaters', name: 'United Waters', members: ['riverZora', 'zoraWarrior'], need: 2, text: 'Any River Zora with any Sea Zora: both races +2 SKL and SPD while swimming.' },
  // Echoes of Wisdom (docs/echoes-of-wisdom-pack.md section 15; with Oren and Shadow Link now in the game, United Waters and False Creation are live)
  { id: 'primeEnergy', name: 'Prime Energy', members: ['zeldaEoW', 'linkEoW', 'tri'], text: '+3 STR, MAG and RES; Echoes cost 1 less capacity.' },
  { id: 'royalCouncil', name: 'Royal Council', members: ['kingEoW', 'generalWright', 'ministerLefte', 'impaEoW'], text: 'More morale and CP recovery: +1 CP at the start of battle, +5 morale after victories, and members +2 DEF and RES.' },
  { id: 'mechanicalMasters', name: 'Mechanical Masters', members: ['dampeEoW', 'robbie', 'mineru'], text: 'Constructs and Automatons +4 DEF and SKL.' },
  { id: 'mountainBrotherhood', name: 'Mountain Brotherhood', members: ['darston', 'conde', 'yeto'], text: 'More obstacle destruction and cold resistance: members +2 DEF, half ice damage.' },
  { id: 'desertCommand', name: 'Desert Command', members: ['chiefSeera', 'dohna', 'urbosa'], text: 'Allied Gerudo +2 STR and SPD.' },
  { id: 'clockworkArmy', name: 'Clockwork Army', members: ['techtite', 'tocktorok', 'gizmol', 'highTekuBaba', 'roboblin', 'goldfinch'], text: 'Automatons spend 25% less Wind-Up Energy.' },
  { id: 'unitedWatersEoW', name: 'United Waters', members: ['dradd', 'kushara', 'oren'], text: 'Better aquatic stats for both Zora races: aquatic allies +2 DEF, RES and SPD.' },
  { id: 'falseCreation', name: 'False Creation', members: ['nullEoW', 'tekom', 'shadowLink'], text: 'Stronger temporary summons: allied Echoes +3 STR and MAG.' },
  { id: 'demonKings', name: 'The Demon Kings', members: ['demise', 'ganondorf', 'ganondorfWW', 'ganondorfTP', 'ganondorfWild'], text: 'Dark damage +25%.' },
];

/** The registered conversation set for a pair (form-specific when `form` is given). */
export function convoSet(ta: string, tb: string, form?: string): ConvoSet | undefined {
  const k = pairKey(ta, tb);
  return form ? SUPPORT_CONVOS[`${k}#${form}`] : SUPPORT_CONVOS[k];
}

/** Echoes of Wisdom groups whose members come with packs built in parallel (Queen Oren from A Link Between Worlds,
 *  Shadow Link from Four Swords): append them to GROUP_SUPPORTS once those templates exist. */
export const DEFERRED_GROUPS_EOW: GroupSupport[] = [
];
