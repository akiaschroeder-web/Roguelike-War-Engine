// The expanded support network (docs/support-expansion.md): every pairing's
// highest rank and theme, their conversations, named pair bonuses and group supports.

import { SUPPORT_REGISTRY as BASE_REGISTRY, type SupportPairDef } from './registry';
import { SUPPORT_REGISTRY_SS } from './registrySS';
import { CONVOS as EXAMPLES } from './convos/examples';
import { WRITTEN } from './written';

export type { SupportPairDef };
/** Every registered pairing, all packs. */
export const SUPPORT_REGISTRY: SupportPairDef[] = [...BASE_REGISTRY, ...SUPPORT_REGISTRY_SS];

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
];

/** The registered conversation set for a pair (form-specific when `form` is given). */
export function convoSet(ta: string, tb: string, form?: string): ConvoSet | undefined {
  const k = pairKey(ta, tb);
  return form ? SUPPORT_CONVOS[`${k}#${form}`] : SUPPORT_CONVOS[k];
}
