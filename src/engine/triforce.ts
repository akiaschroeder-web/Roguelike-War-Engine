// Tri Force Heroes battle rules: Totem formations (up to three compatible size-1 humanoids stacked on one space, with
// Hero Throw, Elevated Strike, Triple Spin, the Tri Force Assault and Totem Guard), the 34 outfits, Lady Maud's Fashion
// Curse and Grand Curse, the Drablands monsters and bosses, the six battlefield spaces (Elevated Switches, Totem
// Platforms, Triforce Gateways, Gripshot Targets, Water Pillars, Outfit Pedestals), the Gripshot, the Water Rod and
// the Doppel Doll. Micro units (engine/micro.ts) ride Totem members without adding height.
// Hooks are called from battle.ts, combat.ts, field.ts, grid.ts, items.ts, abilities.ts, twilight.ts, run.ts and battleView.ts.

import { ART_IDS, ENEMIES, GEAR, WEAPONS, worldDef } from '../data/registry';
import { OUTFITS, RARE_MATERIALS, SANDY_TF, TF_ENEMY_CASTS, TF_FEATURES, TF_SPECIAL, TOTEM_CP, TRI_HEROES } from '../content/triforce';
import { anchorCost, footDist, footprint, inBounds, keyOf, tilesInRange, unitAt, unitDist } from './grid';
import { RNG } from './rng';
import { INF, WATERY } from './rules';
import { addStatus } from './status';
import { activeGear, effectiveStats, isMounted, makeEnemy, moveTypeOf, unitTags } from './units';
import { pullToward, pushAway } from './windwaker';
import type { AbilityDef, Battle, Element, Pos, StatusKind, Terrain, Unit, WeaponDef } from './types';

declare module './types' {
  interface Battle {
    /** Tri Force Heroes battle state. */
    tf?: TFState;
  }
  interface Unit {
    /** A Totem rider: the bottom unit it stands on, its level (1 = middle or top of two, 2 = top of three), the base's
     *  last known space, and whether it is the top of its Totem. */
    tfStack?: { base: string; level: number; bx: number; by: number; top: boolean };
    /** The art override a Totem's base had before it took the Totem art (null: none). */
    tfArtPrev?: string | null;
    /** Totem Armos: armoured layers left. */
    tfLayers?: number;
    /** Hokkubokku: segments launched. */
    tfSegments?: number;
    /** A temporary unit (Doppels, Mini-Margos, brood Blobs): turns left. */
    tfTemp?: number;
    /** Outfit stat changes made for this battle (undone afterwards). */
    tfStatMod?: { hp: number; sta: number; mp: number };
    /** An Outfit Pedestal's outfit, worn for the rest of this battle. */
    tfLoanOutfit?: string;
    /** Tingle Tights already saved the wearer this battle. */
    tfTingleUsed?: boolean;
  }
}

export interface TFState {
  /** Water Pillars raised by the Water Rod: tile key, turns left and the terrain underneath. */
  pillars: { k: number; turns: number; revert: Terrain }[];
  /** Materials found in battle (quest items, Gold Dust, Fairy Dust). */
  found: string[];
  /** Rupees picked up (Rupee Regalia). */
  rupees: number;
  /** Cooperative actions taken (Totem actions, the Triforce Gateway): enough earn a Friendly Token. */
  coop: number;
  /** The Drablands Challenge Board modifier for this battle. */
  challenge?: string;
  /** Last phase processed (`turn:team`), for once-per-phase effects. */
  phase?: string;
  /** Prismantus' rotation (0 red, 1 green, 2 blue). */
  prism: number;
  /** Every listed boss must fall (the Den of Trials' Shadow Links). */
  allBosses?: boolean;
  /** Lady Maud's Fashion Curse still holds over Hytopia (she curses an outfit at the start of the battle). */
  curse?: boolean;
  /** The curse has struck this battle. */
  cursed?: boolean;
  /** Extra turns on equipment-disabling effects the player's army inflicts (Lady Maud's command). */
  tyranny?: number;
}

export const tfState = (b: Battle): TFState => (b.tf ??= { pillars: [], found: [], rupees: 0, coop: 0, prism: 0 });
const has = (u: Unit, s: string) => u.skills.includes(s);
const tid = (u: Unit) => u.bossId ?? u.templateId ?? u.artId ?? '';
const hasBuff = (u: Unit, id: string) => u.buffs.some((x) => x.id === id);
const tileAt = (b: Battle, x: number, y: number): Terrain | undefined => (inBounds(b, x, y) ? b.tiles[keyOf(b, x, y)] : undefined);
const foesOf = (b: Battle, u: Unit) => b.units.filter((e) => e.team !== u.team && !e.captive);
const alliesOf = (b: Battle, u: Unit) => b.units.filter((a) => a !== u && a.team === u.team && !a.captive);
const tfTag = (w: WeaponDef | undefined, t: string) => !!w?.tf?.includes(t);
function buff(u: Unit, id: string, name: string, turns: number, stats: Record<string, number> = {}) {
  u.buffs = u.buffs.filter((x) => x.id !== id);
  u.buffs.push({ id, name, turns, stats });
}
const isWater = (t?: Terrain) => !!t && (WATERY as readonly string[]).includes(t);
const isMagicW = (w?: WeaponDef) => !!w && (w.type === 'magic' || w.type === 'staff' || !!w.magicContact);
const groups = (b: Battle) => b.groupSupports ?? [];
const FOUR_LINKS = ['greenLink', 'redLink', 'blueLink', 'purpleLink'];
/** A hero for the heroes' skills: a Tri Force Hero or one of the Four Sword's Links. */
const isHero = (u: Unit) => !!TRI_HEROES[u.templateId ?? ''] || FOUR_LINKS.includes(u.templateId ?? '');

// ───────────────────────── Outfits ─────────────────────────

const CURSE_IDS = ['tfFashionCursed', 'tfGrandCursed'];
/** The outfit a unit is wearing (an Outfit Pedestal's loan first). Nothing while a Fashion Curse holds. */
export function outfitOf(u: Unit) {
  if (u.buffs?.some((x) => CURSE_IDS.includes(x.id))) return undefined;
  const id = u.tfLoanOutfit ?? u.gear?.body;
  const g = id ? GEAR[id] : undefined;
  return g?.tf?.includes('outfit') ? g : undefined;
}
export const wears = (u: Unit, key: string) => !!outfitOf(u)?.tf?.includes(key);
/** Outfits a Pedestal can lend (no max-HP effects: those are set when the battle starts). */
const LOANABLE = ['cheetahCostume', 'kokiriClothes', 'boomeranger', 'swordSuit', 'cactoClothes', 'ninjaGi', 'showstopper', 'lightArmor', 'fireBlazer', 'hammerwear', 'triSuit', 'gustGarb'];

/** Curse an outfit: its stats are cancelled (a buff of the opposite stats) and its effects stop. */
export function curseOutfit(b: Battle, u: Unit, turns: number, grand = false): boolean {
  const id = u.tfLoanOutfit ?? u.gear?.body;
  const g = id ? GEAR[id] : undefined;
  const st = b.tf;
  if (st?.tyranny && u.team === 'enemy') turns += st.tyranny;
  if (u.team === 'enemy' && groups(b).includes('mastersOfTransformation')) turns += 1;
  if (grand) {
    // Halve every equipment bonus.
    const half: Record<string, number> = {};
    for (const gear of activeGear(u)) for (const [k, v] of Object.entries(gear.stats)) if (['str', 'mag', 'skl', 'spd', 'def', 'res', 'lck', 'mov'].includes(k)) half[k] = (half[k] ?? 0) - Math.floor((v as number) / 2);
    buff(u, 'tfGrandCursed', 'Grand Curse', turns, half);
    return true;
  }
  if (!g) return false;
  const neg: Record<string, number> = {};
  for (const [k, v] of Object.entries(g.stats)) if (['str', 'mag', 'skl', 'spd', 'def', 'res', 'lck', 'mov'].includes(k)) neg[k] = -(v as number);
  buff(u, 'tfFashionCursed', 'Fashion Curse', turns, neg);
  return true;
}
const liftCurses = (u: Unit) => { u.buffs = u.buffs.filter((x) => !CURSE_IDS.includes(x.id)); u.statuses = u.statuses.filter((s) => s.kind !== 'curse'); };

// ───────────────────────── Totems ─────────────────────────

const NOT_HUMANOID = new Set(['monster', 'construct', 'aquaticCreature', 'chuchu', 'animalCompanion', 'wildMount', 'cuccoBird', 'chainChomp', 'vessel', 'enchantedVessel', 'steamship',
  'train', 'zonaiVehicle', 'zonaiConstruct', 'guardian', 'divineBeast', 'sacredBeast', 'loftwingRace', 'owl', 'fairy', 'maiamai', 'companionBird', 'dragonDeity', 'waterDragon',
  'fireDragon', 'thunderDragon', 'immortalDragon', 'immortalDemonDragon', 'frostDragon', 'horseGod', 'magicalCreature', 'dreamCreature', 'nightmare', 'guardianTree', 'maliceEntity',
  'gloomEntity', 'ancientRobot', 'stalMonster', 'giant']);
/** Can join a Totem: a size-1 humanoid on foot, not riding, not Micro. */
export function totemCompatible(u: Unit): boolean {
  if (u.micro || u.size !== 1 || isMounted(u) || u.captive || NOT_HUMANOID.has(u.race)) return false;
  const mt = moveTypeOf(u);
  if (mt === 'flying' || mt === 'fixed' || mt === 'cavalry') return false;
  return !unitTags(u).some((t) => ['beast', 'vessel', 'train', 'jelly', 'construct', 'plant', 'insect', 'bird'].includes(t));
}
/** The bottom unit of a unit's Totem (itself when it isn't riding). */
export function baseOf(b: Battle, u: Unit): Unit {
  if (!u.tfStack) return u;
  return b.units.find((x) => x.uid === u.tfStack!.base) ?? u;
}
/** A Totem's members, bottom first. */
export function totemMembers(b: Battle, u: Unit): Unit[] {
  const base = baseOf(b, u);
  return [base, ...b.units.filter((x) => x.tfStack?.base === base.uid).sort((x, y) => x.tfStack!.level - y.tfStack!.level)];
}
/** Height on the field: the Totem level, +1 on a Totem Platform or a Water Pillar. */
export function heightOf(b: Battle, u: Unit, pos: Pos = u): number {
  const t = tileAt(b, pos.x, pos.y);
  return 1 + (u.tfStack?.level ?? 0) + (t === 'totemPlatform' || t === 'waterPillar' ? 1 : 0);
}
/** High enough for elevated targets: height 2+ or flying. */
export const isElevated = (b: Battle, u: Unit, pos: Pos = u) => heightOf(b, u, pos) >= 2 || moveTypeOf(u) === 'flying';
const isTop = (u: Unit) => !!u.tfStack?.top;
/** Middle of a three-unit Totem (or below the top): ranged and support only. */
const isMiddle = (u: Unit) => !!u.tfStack && !u.tfStack.top;
const riders = (b: Battle, base: Unit) => b.units.filter((x) => x.tfStack?.base === base.uid);

/** Renumber a Totem's levels, refresh the lowest-MOV rule and the Totem art. */
function restack(b: Battle, base: Unit) {
  const rs = riders(b, base).sort((x, y) => x.tfStack!.level - y.tfStack!.level);
  rs.forEach((r, i) => { r.tfStack = { base: base.uid, level: i + 1, bx: base.x, by: base.y, top: i === rs.length - 1 }; r.x = base.x; r.y = base.y; });
  // The stack moves at its lowest MOV.
  base.buffs = base.buffs.filter((x) => x.id !== 'tfTotemMov');
  if (rs.length) {
    const own = effectiveStats(base).mov;
    const low = Math.min(...rs.map((r) => effectiveStats(r).mov));
    if (low < own) base.buffs.push({ id: 'tfTotemMov', name: 'Totem (lowest MOV)', turns: 99, stats: { mov: low - own } });
  }
  totemArt(b, base, rs);
}
/** The three heroes in a Totem show the matching Totem art (top first); two heroes, the cropped two-hero art. */
function totemArt(b: Battle, base: Unit, rs: Unit[]) {
  void b;
  const members = [...rs].reverse().concat(base);
  const codes = members.map((m) => TRI_HEROES[m.templateId ?? '']);
  const art = members.length >= 2 && codes.every(Boolean) && new Set(codes).size === codes.length ? `totem${codes.join('')}` : null;
  if (art && ART_IDS.has(art)) {
    if (base.tfArtPrev === undefined) base.tfArtPrev = base.artOverride ?? null;
    base.artOverride = art;
  } else if (base.tfArtPrev !== undefined) {
    base.artOverride = base.tfArtPrev ?? undefined;
    delete base.tfArtPrev;
  }
}
/** The Totem art a base is showing (its riders' tokens are folded into it in the battle view). */
export const totemArtOf = (u: Unit) => (u.tfArtPrev !== undefined && u.artOverride?.startsWith('totem') ? u.artOverride : null);

/** Climb onto a unit (onto the top of its Totem). */
export function climb(b: Battle, u: Unit, onto: Unit): boolean {
  const base = baseOf(b, onto);
  const members = totemMembers(b, base);
  if (members.length >= 3 || members.includes(u) || riders(b, u).length) return false;
  if (u.tfStack) leaveTotem(b, u);
  u.tfStack = { base: base.uid, level: members.length, bx: base.x, by: base.y, top: true };
  u.x = base.x; u.y = base.y;
  restack(b, base);
  return true;
}
/** Leave a Totem (walking off, hopping down, thrown or knocked off): the ones above drop a level. */
export function leaveTotem(b: Battle, u: Unit) {
  const base = u.tfStack ? b.units.find((x) => x.uid === u.tfStack!.base) : undefined;
  delete u.tfStack;
  if (base) restack(b, base);
}
/** A unit stops being a Totem's base (it left the field): its riders tumble down (15% of max HP: the fall can be fatal). */
function collapse(b: Battle, baseUid: string, lines: string[]) {
  const rs = b.units.filter((x) => x.tfStack?.base === baseUid).sort((x, y) => x.tfStack!.level - y.tfStack!.level);
  if (!rs.length) return;
  const [nb, ...rest] = rs;
  delete nb.tfStack;
  for (const r of rest) r.tfStack = { ...r.tfStack!, base: nb.uid };
  lines.push(`The Totem collapses! ${rs.map((r) => r.name).join(' and ')} tumble${rs.length > 1 ? '' : 's'} down.`);
  for (const r of rs) {
    const d = Math.max(1, Math.ceil(r.stats.hp * 0.15));
    if (d >= r.hp && wears(r, 'tingle') && !r.tfTingleUsed) { r.tfTingleUsed = true; r.hp = 1; lines.push(`The Tingle Tights catch ${r.name} — saved at 1 HP!`); continue; }
    r.hp -= Math.min(d, r.hp);
    if (r.hp <= 0) { b.units = b.units.filter((x) => x !== r); if (!r.summoned) b.fallen.push(r); lines.push(`${r.name} falls from the Totem and is defeated.`); }
  }
  const survivor = b.units.includes(nb) ? nb : b.units.find((x) => rest.includes(x));
  if (survivor) { if (survivor.tfStack) delete survivor.tfStack; for (const r of b.units.filter((x) => x.tfStack?.base === nb.uid)) r.tfStack = { ...r.tfStack!, base: survivor.uid }; restack(b, survivor); }
}
/** Keep every Totem together: riders follow a base that moved (or was pushed); a rider knocked off leaves; a lost base collapses. */
export function syncTotems(b: Battle): string[] {
  const lines: string[] = [];
  const lost = new Set<string>();
  for (const r of b.units.filter((x) => x.tfStack)) {
    const base = b.units.find((x) => x.uid === r.tfStack!.base);
    if (!base || base.hp <= 0) { lost.add(r.tfStack!.base); continue; }
    if (base.x !== r.tfStack!.bx || base.y !== r.tfStack!.by) { r.x = base.x; r.y = base.y; r.tfStack!.bx = base.x; r.tfStack!.by = base.y; }
    else if (r.x !== base.x || r.y !== base.y) { leaveTotem(b, r); lines.push(`${r.name} is knocked off the Totem.`); }
  }
  for (const uid of lost) collapse(b, uid, lines);
  b.log.push(...lines);
  return lines;
}

/** Battle view: how a unit's token sits on its Totem. */
export function tfView(b: Battle, u: Unit): { dy: number; scale: number; folded: boolean } | null {
  if (!u.tfStack) return null;
  const base = b.units.find((x) => x.uid === u.tfStack!.base);
  const folded = !!base && !!totemArtOf(base);
  return { dy: -0.34 * u.tfStack.level, scale: 0.72, folded };
}

// ───────────────────────── Movement ─────────────────────────

/** Outfits on terrain: the Cozy Parka on ice, the Dunewalker Duds on sand. */
export function tfTileCost(b: Battle, u: Unit, t: Terrain, c: number): number {
  if (c >= INF || c <= 1) return c;
  if (wears(u, 'parka') && (t === 'icePlatform' || b.world === 'iceCavernTF' || /ice|snow|frozen/i.test(worldDef(b.world).name))) return 1;
  if (wears(u, 'dunes') && (t === 'forest' || t === 'mountain') && (SANDY_TF.includes(b.world) || /desert|dune|sand/i.test(worldDef(b.world).name))) return 1;
  return c;
}

/** After a walk (battle view): a rider that walked off leaves its Totem; a base carries its riders; spaces underfoot. */
export function tfAfterWalk(b: Battle, u: Unit, path: Pos[]): string | null {
  const lines: string[] = [];
  if (u.tfStack && path.length > 1) { leaveTotem(b, u); lines.push(`${u.name} jumps off the Totem.`); }
  if (riders(b, u).length) syncTotems(b);
  lines.push(...spacesUnder(b, u));
  return lines.length ? lines.join(' ') : null;
}

/** Elevated Switches, Outfit Pedestals and Triforce Gateways around a player unit. */
function spacesUnder(b: Battle, u: Unit): string[] {
  if (u.team !== 'player') return [];
  const st = tfState(b);
  const lines: string[] = [];
  const k = keyOf(b, u.x, u.y);
  const t = b.tiles[k];
  const stack = totemMembers(b, u);
  if (t === 'elevatedSwitch' && stack.some((m) => isElevated(b, m))) {
    b.tiles[k] = 'plain';
    for (const e of b.units.filter((x) => x.team !== u.team)) buff(e, 'tfSwitchDown', 'Gates lowered', 2, { def: -3, res: -3 });
    if (stack.length > 1) { st.coop++; st.found.push('friendlyToken'); }
    lines.push(`${stack[stack.length - 1].name} reaches the Elevated Switch${stack.length > 1 ? ' from the Totem' : ''}: the enemy's gates drop (−3 DEF and RES for 2 turns).`);
  }
  if (t === 'outfitPedestal') {
    b.tiles[k] = 'plain';
    const rng = new RNG(b.rngState + k);
    const id = rng.pick(LOANABLE);
    u.tfLoanOutfit = id;
    const g = GEAR[id];
    if (g) buff(u, 'tfLoan', g.name, 99, Object.fromEntries(Object.entries(g.stats).filter(([s]) => ['str', 'mag', 'skl', 'spd', 'def', 'res', 'lck', 'mov'].includes(s))) as Record<string, number>);
    lines.push(`${u.name} puts on the ${g?.name ?? 'outfit'} from the Outfit Pedestal (this battle only).`);
  }
  lines.push(...checkGateways(b));
  return lines;
}
/** Three allies at a Triforce Gateway at once: it opens. */
function checkGateways(b: Battle): string[] {
  const st = tfState(b);
  const lines: string[] = [];
  b.tiles.forEach((t, k) => {
    if (t !== 'triforceGateway') return;
    const x = k % b.width, y = Math.floor(k / b.width);
    const near = b.units.filter((u) => u.team === 'player' && !u.captive && footDist(x, y, 1, u.x, u.y, u.size) <= 1);
    if (near.length < 3) return;
    b.tiles[k] = 'plain';
    for (const a of b.units.filter((u) => u.team === 'player')) a.hp = Math.min(a.stats.hp, a.hp + Math.ceil(a.stats.hp * 0.15));
    st.coop++;
    st.found.push('friendlyToken');
    b.rewardRupees += 50;
    lines.push('Three heroes at the Triforce Gateway: it opens! The army recovers 15% HP (a Friendly Token, ₹50).');
  });
  b.log.push(...lines);
  return lines;
}

// ───────────────────────── Battlefield setup ─────────────────────────

const OBSTACLES = new Set<Terrain>(['triforceGateway', 'gripshotTarget']);
/** Place the region's battlefield spaces. */
export function decorateTriforce(b: Battle, rng: RNG) {
  const feats = TF_FEATURES[b.world];
  if (!feats || b.naval) return;
  const occupied = new Set([...b.units.flatMap((u) => footprint(u.x, u.y, u.size).map((p) => keyOf(b, p.x, p.y))), ...(b.objective?.tiles ?? []).map((p) => keyOf(b, p.x, p.y))]);
  const plains = rng.shuffle(b.tiles.map((t, i) => (t === 'plain' && !occupied.has(i) && i % b.width >= 2 && i % b.width <= b.width - 3 ? i : -1)).filter((i) => i >= 0));
  const waters = rng.shuffle(b.tiles.map((t, i) => (isWater(t) && !occupied.has(i) ? i : -1)).filter((i) => i >= 0));
  for (const [t, n] of Object.entries(feats) as [Terrain, number][]) {
    for (let j = 0; j < n; j++) {
      const k = t === 'waterPillar' && waters.length ? waters.pop() : OBSTACLES.has(t) ? takeOpen(b, plains) : plains.pop();
      if (k !== undefined) b.tiles[k] = t;
    }
  }
}
/** A plain whose eight neighbours are open ground (obstacles never block a pass). */
function takeOpen(b: Battle, plains: number[]): number | undefined {
  const open = (x: number, y: number) => inBounds(b, x, y) && (b.tiles[keyOf(b, x, y)] === 'plain' || b.tiles[keyOf(b, x, y)] === 'forest');
  const i = plains.findIndex((k) => {
    const x = k % b.width, y = Math.floor(k / b.width);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && !open(x + dx, y + dy)) return false;
    return true;
  });
  return i >= 0 ? plains.splice(i, 1)[0] : undefined;
}

/** Battle start: outfit stats (hearts, tights, energy), Light Armor, the bosses' defences, Fire Keeleons. */
export function triforceBattleStart(b: Battle) {
  for (const u of b.units) {
    // Outfits that change max HP, STA and MP do it for the battle only.
    const mod = { hp: 0, sta: 0, mp: 0 };
    if (wears(u, 'hearts15')) mod.hp += 15;
    if (wears(u, 'hearts30')) mod.hp += 30;
    if (wears(u, 'cursed')) mod.hp -= Math.floor((u.stats.hp + mod.hp) / 2);
    if (wears(u, 'semiCursed')) mod.hp -= Math.floor((u.stats.hp + mod.hp) / 4);
    if (wears(u, 'energy')) { mod.sta += 15; mod.mp += 15; }
    if (mod.hp || mod.sta || mod.mp) {
      u.tfStatMod = mod;
      u.stats.hp = Math.max(1, u.stats.hp + mod.hp); u.stats.sta += mod.sta; u.stats.mp += mod.mp;
      u.hp = Math.max(1, Math.min(u.stats.hp, u.hp + Math.max(0, mod.hp))); u.sta += mod.sta; u.mp += mod.mp;
    }
    if (wears(u, 'light') && u.team === 'player') b.fog = false;
    if (has(u, 'stackedGuardian')) u.tfLayers = 3;
    if (has(u, 'frozenDragon')) { buff(u, 'wildShield', 'Ice Armour', 99); (u.turnUses ??= {}).wildShield = 30; }
    if (has(u, 'perfectCamouflage') && u.team === 'enemy') u.hidden = true;
    if (tid(u) === 'keeleon' && b.world === 'volcanoTF' && u.team === 'enemy') { u.name = 'Fire Keeleon'; u.weapons = ['keeleonFireTongue']; u.stats.mag += 4; }
  }
}

// ───────────────────────── Start of each turn ─────────────────────────

export interface TFEvent { uid: string; heal: number; damage: number; source: string }

export function tfStartPhase(b: Battle, u: Unit, events: TFEvent[]) {
  const st = tfState(b);
  const mark = `${b.turn}:${u.team}`;
  if (st.phase !== mark) {
    st.phase = mark;
    for (const line of syncTotems(b)) events.push({ uid: u.uid, heal: 0, damage: 0, source: line });
    if (u.team === 'player') {
      // Water Pillars sink back.
      for (const p of [...st.pillars]) if (--p.turns <= 0) { if (b.tiles[p.k] === 'waterPillar') b.tiles[p.k] = p.revert; st.pillars = st.pillars.filter((x) => x !== p); }
      checkGateways(b);
      for (const base of b.units.filter((x) => riders(b, x).length)) restack(b, base);
    }
    if (u.team === 'enemy') {
      st.prism = (st.prism + 1) % 3;
      // Lady Maud's curse lingers over Hytopia: one outfit is cursed when the battle begins.
      if (st.curse && !st.cursed) {
        st.cursed = true;
        const victim = b.units.filter((x) => x.team === 'player' && outfitOf(x)).sort((x, y) => x.uid.localeCompare(y.uid))[b.turn % 3];
        if (victim && curseOutfit(b, victim, 2)) b.log.push(`Lady Maud's curse drifts over the field: ${victim.name}'s ${GEAR[victim.gear.body ?? '']?.name ?? 'outfit'} stops working.`);
      }
    }
  }
  if (!b.units.includes(u)) return;
  // Temporary units fade.
  if (u.tfTemp !== undefined && --u.tfTemp <= 0) {
    b.units = b.units.filter((x) => x !== u);
    events.push({ uid: u.uid, heal: 0, damage: 0, source: u.artId === 'doppel' ? 'clatters to the ground, a wooden doll again' : 'fades away' });
    syncTotems(b);
    return;
  }
  const near = (r: number) => foesOf(b, u).filter((e) => unitDist(u, e) <= r);
  const hurt = (e: Unit, dmg: number, source: string) => {
    dmg = Math.min(e.hp - 1, Math.max(1, Math.floor(dmg)));
    if (dmg > 0) { e.hp -= dmg; events.push({ uid: e.uid, heal: 0, damage: dmg, source }); }
  };
  // Hytopian Authority: the king's morale keeps his army on its feet.
  if (alliesOf(b, u).some((a) => has(a, 'hytopianAuthority') && unitDist(u, a) <= 3) && u.hp < u.stats.hp) {
    const h = Math.min(u.stats.hp - u.hp, Math.ceil(u.stats.hp * 0.05));
    u.hp += h; events.push({ uid: u.uid, heal: h, damage: 0, source: 'is rallied by King Tuft' });
  }
  // The Cheer Outfit: allies close by recover more.
  if (alliesOf(b, u).some((a) => wears(a, 'cheer') && unitDist(u, a) <= 2)) { u.sta = Math.min(effectiveStats(u).sta, u.sta + 5); u.mp = Math.min(effectiveStats(u).mp, u.mp + 5); }
  // Monsters and bosses.
  if (has(u, 'chameleonTF') && !near(1).length) addStatus(u, 'veiled', 1);
  if (has(u, 'perfectCamouflage') && u.team === 'enemy' && !near(1).length && !b.units.some((a) => a.team !== u.team && wears(a, 'light') && unitDist(u, a) <= 3)) u.hidden = true;
  if (has(u, 'frozenDragon')) {
    if (!hasBuff(u, 'tfShellBroken')) { if (!hasBuff(u, 'wildShield')) buff(u, 'wildShield', 'Ice Armour', 99); (u.turnUses ??= {}).wildShield = Math.min(30, (u.turnUses.wildShield ?? 0) + 10); }
    for (const e of near(1)) if (!wears(e, 'parka') && roll(b) < 25) { addStatus(e, 'freeze', 1); events.push({ uid: e.uid, heal: 0, damage: 0, source: 'is frozen by the dragon\'s cold' }); }
  }
  if (has(u, 'electricalCrown')) for (const e of near(1)) hurt(e, effectiveStats(u).mag / 3, 'the Electrical Crown');
  if (has(u, 'electricBrood') && b.turn % 2 === 0 && b.units.filter((x) => x.tfTemp !== undefined && tid(x) === 'buzzBlob').length < 4) {
    const blob = spawnTemp(b, 'buzzBlob', u, Math.max(1, u.level - 2), u.team, 6);
    if (blob) events.push({ uid: blob.uid, heal: 0, damage: 0, source: 'is born of the Electric Brood' });
  }
  if (has(u, 'desertSovereign')) for (const e of near(2)) if (!isElevated(b, e) && pushAway(b, e, u, 1)) events.push({ uid: e.uid, heal: 0, damage: 0, source: 'is blown back by the wind currents' });
}
function roll(b: Battle): number {
  const r = new RNG(b.rngState);
  const v = r.int(0, 99);
  b.rngState = r.state;
  return v;
}

/** A temporary unit next to another (brood Blobs, Mini-Margos). */
function spawnTemp(b: Battle, id: string, near: Unit, level: number, team: Unit['team'], turns: number): Unit | undefined {
  const arch = ENEMIES[id];
  if (!arch) return undefined;
  const e = makeEnemy(arch, b.world, level, `tf${b.uidCounter++}`, new RNG(b.rngState + b.uidCounter));
  for (let d = 1; d <= 3; d++) {
    const spot = tilesInRange(b, near, d, d, near.size).find((p) => anchorCost(b, e, p.x, p.y) < INF && footprint(p.x, p.y, e.size).every((f) => !unitAt(b, f.x, f.y)));
    if (spot) { Object.assign(e, { x: spot.x, y: spot.y, team, ai: 'aggressive', moved: true, acted: true, tfTemp: turns, summoned: true }); b.units.push(e); return e; }
  }
  return undefined;
}

// ───────────────────────── Combat ─────────────────────────

export interface TFMods { str: number; mag: number; skl: number; spd: number; def: number; res: number; hit: number; avoid: number; crit: number; dmg: number }

export function tfMods(b: Battle, u: Unit, pos: Pos, foe: Unit, initiating: boolean, w?: WeaponDef): TFMods {
  const m: TFMods = { str: 0, mag: 0, skl: 0, spd: 0, def: 0, res: 0, hit: 0, avoid: 0, crit: 0, dmg: 0 };
  const allies = alliesOf(b, u);
  const within = (a: Unit, r: number) => unitDist(u, a, pos) <= r;
  // The heroes' personal skills.
  if (has(u, 'heroicAgility') && allies.some((a) => isHero(a) && within(a, 2))) { m.spd += 3; m.skl += 3; }
  if (has(u, 'heroicStrength') && allies.some((a) => isHero(a) && within(a, 2))) { m.str += 3; m.def += 3; }
  if (allies.some((a) => has(a, 'hytopianAuthority') && within(a, 3))) { m.hit += 5; m.str += 2; m.def += 2; }
  // Fashionable Inspiration: 20% more from the outfit's stats.
  const o = outfitOf(u);
  if (o && allies.some((a) => has(a, 'fashionableInspiration') && !hasBuff(a, 'tfStylaCursed') && within(a, 2))) {
    for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res'] as const) { const v = o.stats[k] ?? 0; if (v > 0) m[k] += Math.max(1, Math.round(v * 0.2)); }
  }
  // Tri Force Heroes (group support): +3 STR, SKL and SPD within 4 of the other two.
  if (u.team === 'player' && groups(b).includes('triForceHeroes') && TRI_HEROES[u.templateId ?? ''] && Object.keys(TRI_HEROES).every((id) => id === u.templateId || allies.some((a) => a.templateId === id && within(a, 4)))) {
    m.str += 3; m.skl += 3; m.spd += 3;
  }
  // Outfits.
  if (wears(u, 'triSuit') && allies.filter((a) => isHero(a) && within(a, 2)).length >= 2) { m.str += 3; m.mag += 3; m.def += 3; m.res += 3; }
  if (wears(u, 'serpent') && footprint(pos.x, pos.y, u.size).concat(tilesInRange(b, pos, 1, 1, u.size)).some((p) => isWater(tileAt(b, p.x, p.y)))) { m.str += 3; m.def += 3; }
  if (w?.type === 'sword' && wears(u, 'sword5')) m.dmg += 5;
  if (w?.type === 'sword' && wears(u, 'sword8')) m.dmg += 8;
  if (w?.type === 'boomerang' && wears(u, 'boomerang')) m.dmg += 3;
  if (initiating && wears(u, 'ninja') && (u.movedDist ?? 0) >= 3) m.dmg += 4;
  if (wears(u, 'light')) m.hit += 10;
  if (foesOf(b, u).some((e) => wears(e, 'showstopper') && unitDist(e, { ...u, ...pos }) <= 2)) m.hit -= 10;
  // A unit on top of a Totem aims down.
  if (isTop(u)) m.hit += 5;
  void foe;
  return m;
}

/** Totem reach, Grim Repoe's intangibility, the Totem's top out of melee reach. */
export function tfCannotAttack(b: Battle, atk: Unit, def: Unit, w: WeaponDef | undefined, d: number): boolean {
  if (!w) return false;
  // The middle of a Totem uses ranged attacks only.
  if (isMiddle(atk) && d <= 1) return true;
  // Out of melee reach: the top of a three-unit Totem (or of any Totem braced by Totem Guard).
  const braced = !!def.tfStack && hasBuff(baseOf(b, def), 'tfTotemGuard');
  if (isTop(def) && (def.tfStack!.level >= 2 || braced) && d <= 1 && w.type !== 'magic' && w.type !== 'staff' && !isElevated(b, atk) && atk.size <= 1 && !tfTag(w, 'vertical') && !has(atk, 'toweringSwordsman')) return true;
  // Grim Repoe (on either side) is intangible on odd turns: physical attacks pass through.
  if (has(def, 'spectralReaper') && b.turn % 2 === 1 && !isMagicW(w) && w.element !== 'light' && !w.sacredMult) return true;
  return false;
}

/** Range: the Boomeranger, the Sword Master Suit's beams, the top of a Totem with a ranged weapon. */
export function tfRangeBonus(u: Unit, w: WeaponDef): number {
  let r = 0;
  if (w.type === 'boomerang' && wears(u, 'boomerang')) r += 1;
  if (w.type === 'sword' && wears(u, 'sword8') && u.hp >= u.stats.hp) r += 2;
  if (isTop(u) && w.maxRange >= 2) r += 1;
  return r;
}

export function tfMultiplier(b: Battle, atk: Unit, atkPos: Pos, def: Unit, magical: boolean, w: WeaponDef | undefined, d: number, element?: Element): number {
  let m = 1;
  const up = isElevated(b, atk, atkPos) || hasBuff(atk, 'tfElevating');
  // Outfits.
  if (element === 'fire' && magical && wears(atk, 'fireBlazer')) m *= 1.3;
  if (element === 'water' && wears(atk, 'torrent')) m *= 1.3;
  if (w?.type === 'hammer' && wears(atk, 'hammer')) m *= 1.25;
  // Elevation: fliers and high targets.
  if (up && moveTypeOf(def) === 'flying' && moveTypeOf(atk) !== 'flying') m *= 1.25;
  // Bosses.
  if (has(def, 'rotatingFortress')) m *= up ? 1.5 : 0.7;
  if (has(def, 'toweringSwordsman') && !up) m *= 0.6;
  if ((def.tfLayers ?? 0) > 0) m *= 0.7;
  if (has(def, 'rotatingPrism')) {
    const phase = b.tf?.prism ?? 0;
    const weak = phase === 0 ? !magical && d <= 1 : phase === 1 ? !magical && d >= 2 : magical;
    m *= weak ? 1.5 : 0.7;
  }
  if (has(def, 'livingGlacier') && !hasBuff(def, 'tfGlacierBroken')) m *= element === 'fire' ? 1.5 : 0.6;
  if (has(atk, 'desertSovereign') && !isElevated(b, def)) m *= 1.2;
  if (has(atk, 'spectralReaper') && b.turn % 2 === 0) m *= 1.5;
  if (has(atk, 'chameleonTF') && atk.statuses.some((s) => s.kind === 'veiled')) m *= 1.2;
  return m;
}

export function tfAfterHit(b: Battle, by: Unit, target: Unit, dmg: number, w: WeaponDef | undefined, element?: Element): string[] {
  const lines: string[] = [];
  const st = tfState(b);
  // Totem Armos: its layers break one at a time.
  if ((target.tfLayers ?? 0) > 0 && dmg >= 10) {
    const n = Math.min(target.tfLayers!, w?.type === 'hammer' || hasBuff(by, 'tfElevating') ? 2 : 1);
    target.tfLayers! -= n;
    buff(target, 'tfLayersLost', 'Layers broken', 99, { def: -3 * (3 - target.tfLayers!) });
    lines.push(`${n > 1 ? 'Two layers' : 'A layer'} of ${target.name} break${n > 1 ? '' : 's'} away (${target.tfLayers} left).`);
  }
  if (element === 'fire' && has(target, 'frozenDragon') && !hasBuff(target, 'tfShellBroken')) {
    buff(target, 'tfShellBroken', 'Ice armour melted', 2);
    target.buffs = target.buffs.filter((x) => x.id !== 'wildShield');
    lines.push(`The fire melts ${target.name}'s ice armour!`);
  }
  if (element === 'fire' && has(target, 'livingGlacier') && !hasBuff(target, 'tfGlacierBroken')) { buff(target, 'tfGlacierBroken', 'Glacier cracked', 2); lines.push(`${target.name}'s ice armour cracks!`); }
  if (has(by, 'perfectCamouflage')) by.hidden = false;
  if (has(target, 'perfectCamouflage')) target.hidden = false;
  if (has(target, 'electricalCrown') && unitDist(by, target) <= 1 && roll(b) < 25) addStatus(by, 'shock', 1);
  if (has(by, 'fashionCurseSkill') && target.hp > 0 && roll(b) < 25 && curseOutfit(b, target, 1)) lines.push(`${by.name}'s curse strips ${target.name}'s outfit of its power.`);
  // The Drablands Challenge Board: shared damage.
  if (st.challenge === 'sharedDamage' && target.team === 'player' && dmg > 0) for (const a of b.units.filter((x) => x.team === 'player' && x !== target && x.hp > 1)) a.hp -= Math.min(2, a.hp - 1);
  lines.push(...syncTotems(b));
  return lines;
}

export function tfAfterCombat(b: Battle, attacker: Unit, defender: Unit, landed: { atk: number; def: number }): { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] {
  const out: { uid: string; dmg: number; hp: number; killed: boolean; by: string }[] = [];
  const zap = (to: Unit, from: Unit, dmg: number) => {
    if (to.hp <= 0 || !b.units.includes(to)) return;
    dmg = Math.min(to.hp, Math.max(1, Math.floor(dmg)));
    to.hp -= dmg;
    const killed = to.hp <= 0;
    if (killed) { b.units = b.units.filter((x) => x !== to); if (!to.summoned) b.fallen.push(to); tfOnKill(b, from, to); }
    out.push({ uid: to.uid, dmg, hp: to.hp, killed, by: from.uid });
  };
  const w = WEAPONS[attacker.weapons[0]];
  const melee = unitDist(attacker, defender) <= 1;
  // Spines and spikes on the defender.
  if (melee && landed.atk > 0 && (wears(defender, 'cacto') || hasBuff(defender, 'tfSpiked'))) zap(attacker, defender, 4);
  // Magical reflection.
  if (landed.atk > 0 && isMagicW(w)) {
    if (hasBuff(defender, 'tfReflect')) zap(attacker, defender, landed.atk / 2);
    else if (tfTag(WEAPONS[defender.weapons[0]], 'reflect')) zap(attacker, defender, landed.atk / 4);
  }
  // Kokiri Clothes: three arrows. Hammerwear: the shockwave.
  if (landed.atk > 0 && w?.type === 'bow' && wears(attacker, 'kokiri')) for (const e of b.units.filter((x) => x.team === defender.team && x !== defender && unitDist(x, defender) <= 1).slice(0, 2)) zap(e, attacker, landed.atk / 2);
  if (landed.atk > 0 && w?.type === 'hammer' && wears(attacker, 'hammer')) for (const e of b.units.filter((x) => x.team === defender.team && x !== defender && unitDist(x, defender) <= 1)) zap(e, attacker, landed.atk / 4);
  // The Lady's Pets: each remaining extra section strikes again.
  if (has(attacker, 'threefoldBeast') && attacker.hp > 0 && defender.hp > 0 && b.units.includes(defender)) {
    const sections = Math.max(1, Math.ceil((3 * attacker.hp) / attacker.stats.hp));
    for (let i = 1; i < sections; i++) zap(defender, attacker, Math.max(1, effectiveStats(attacker).str * 0.4 - effectiveStats(defender).def / 2));
  }
  syncTotems(b);
  return out;
}

export function tfOnKill(b: Battle, by: Unit, victim: Unit) {
  const st = tfState(b);
  if (by.team === 'player' && victim.team === 'enemy' && !victim.summoned) {
    const id = tid(victim);
    const race = victim.race;
    const mats: string[] = [];
    if (/moblin|blin/i.test(id)) mats.push('blinBling');
    if (/tektite/i.test(id)) mats.push('tektiteShell');
    if (/freezard/i.test(id)) mats.push('freezardWater');
    if (race === 'undead' || unitTags(victim).includes('undead')) mats.push('stalSkull');
    else if (race === 'aquatic' || unitTags(victim).includes('aquatic')) mats.push(victim.isBoss ? 'ancientFin' : 'fluffyFuzz');
    else if (race === 'monster' || race === 'construct') mats.push('monsterGutsTF');
    if (victim.isBoss && ['fortressTF', 'skyRealmTF'].includes(b.world)) mats.push('exquisiteLace');
    const r = roll(b);
    for (const m of mats) if (victim.isBoss || r < 45) st.found.push(m);
    if (wears(by, 'rupees')) { st.rupees += 15; }
    if (wears(by, 'hearts')) by.hp = Math.min(by.stats.hp, by.hp + Math.ceil(by.stats.hp * 0.1));
  }
  if (b.units.some((x) => x.tfStack?.base === victim.uid)) syncTotems(b);
}

/** Tingle Tights: the first fatal blow each battle leaves the wearer at 1 HP. */
export function tfSaveFromDeath(b: Battle, u: Unit): { line: string; heal: number } | null {
  void b;
  if (!wears(u, 'tingle') || u.tfTingleUsed) return null;
  u.tfTingleUsed = true;
  return { line: `The Tingle Tights flutter: ${u.name} survives at 1 HP!`, heal: 0 };
}

export function tfBossesRemain(b: Battle): boolean {
  return !!b.tf?.allBosses && b.units.some((u) => u.team === 'enemy' && u.isBoss);
}

/** Before the battle ends: temporary units vanish, Totems come apart, outfit stat changes are undone, loans go back. */
export function triforceBeforeFinish(b: Battle) {
  b.units = b.units.filter((u) => u.tfTemp === undefined);
  b.fallen = b.fallen.filter((u) => u.tfTemp === undefined);
  for (const u of [...b.units, ...b.fallen, ...(b.withdrawn ?? [])]) {
    if (u.tfArtPrev !== undefined) { u.artOverride = u.tfArtPrev ?? undefined; delete u.tfArtPrev; }
    delete u.tfStack; delete u.tfLoanOutfit; delete u.tfLayers; delete u.tfSegments; delete u.tfTingleUsed;
    const mod = u.tfStatMod;
    if (mod) {
      u.stats.hp = Math.max(1, u.stats.hp - mod.hp); u.stats.sta -= mod.sta; u.stats.mp -= mod.mp;
      if (u.hp > 0) u.hp = Math.max(1, Math.min(u.stats.hp, u.hp - Math.max(0, mod.hp)));
      delete u.tfStatMod;
    }
  }
}

// ───────────────────────── Items ─────────────────────────

/** The Gripshot is used through its action; the Challenge Board's restricted equipment locks the packs. */
export function tfCanUseItem(b: Battle, u: Unit, id: string): boolean | undefined {
  if (u.team === 'player' && b.tf?.challenge === 'restrictedEquipment') return false;
  if (id === 'gripshot') return false;
  return undefined;
}
/** The Big Bomb Outfit and the Gust Garb change the item. */
export function tfAdjustItem<T extends { id: string; kind: string; power: number; radius?: number } | undefined>(u: Unit, def: T): T {
  if (!def) return def;
  if (def.kind === 'bomb' && wears(u, 'bigBomb')) return { ...def, power: Math.ceil(def.power * 1.5), radius: (def.radius ?? 0) + 1 };
  if (def.id === 'gustJar' && wears(u, 'gust')) return { ...def, power: def.power + 3 };
  return def;
}
/** The Legendary Dress: stronger recovery items. */
export const tfHealItemMult = (b: Battle, u: Unit) => { void b; return wears(u, 'dress') ? 1.5 : 1; };
/** The Lady's Ensemble: stronger support magic. */
export const tfHealMult = (b: Battle, healer: Unit) => { void b; return wears(healer, 'ladys') ? 1.3 : 1; };

export function useTriforceItem(b: Battle, u: Unit, id: string): string | null {
  if (id !== 'doppelDoll') return null;
  const spot = tilesInRange(b, u, 1, 2, u.size).find((p) => anchorCost(b, u, p.x, p.y) < INF && !unitAt(b, p.x, p.y));
  if (!spot) return 'There is no room for the Doppel.';
  const s = { ...u.stats, hp: Math.max(1, Math.ceil(u.stats.hp / 2)) };
  for (const k of ['str', 'mag', 'skl'] as const) s[k] = Math.round(s[k] * 0.7);
  const dup: Unit = {
    ...u, uid: `tfd${b.uidCounter++}`, name: `${u.name}'s Doppel`, templateId: undefined, bossId: undefined, artId: 'doppel', artOverride: undefined, glyph: 'DP',
    stats: s, hp: s.hp, x: spot.x, y: spot.y, weapons: [u.weapons[0]].filter(Boolean), pack: [], abilities: [], skills: [], gear: {}, buffs: [], statuses: [],
    isCommander: false, summoned: true, tfTemp: 3, moved: true, acted: true, kills: 0, movedDist: 0, usedAbilities: [], cooldowns: {}, tfStack: undefined, npc: false,
  };
  b.units.push(dup);
  return `${u.name} sets down a Doppel Doll: a wooden ${u.name} stands ready for 3 turns.`;
}

/** Spin technique stamina (twilight.ts techniqueCost): the Spin Attack Attire, ALBW Link's Tri Force Heroes. */
export function tfStaminaAdjust(u: Unit, a: AbilityDef, bonus: string | undefined, c: number, groups?: string[]): number {
  void groups;
  let m = 1;
  if (['spinAttack', 'greatSpin', 'tfDapperSpin', 'hurricaneSpin', 'tfTripleSpin'].includes(a.id) && wears(u, 'spinThrift')) m *= 0.5;
  if (bonus === 'triforceHeroes' && u.team === 'player' && TOTEM_IDS.has(a.id)) m *= 0.75;
  return m === 1 ? c : Math.max(0, Math.floor(c * m));
}

// ───────────────────────── Abilities ─────────────────────────

const SPECIAL = new Set(TF_SPECIAL);
const TOTEM_IDS = new Set(Object.keys(TOTEM_CP));
const TILE = new Set(['tfTotemDrop', 'tfHeroThrow', 'tfGripshot', 'tfWaterPillar']);
const TARGET = new Set(['tfTotemStack', 'tfElevatedStrike', 'tfTriforceAssault', 'expertTailoring', 'fashionCurse', 'segmentLaunch', 'elementalProjectile', 'combinedAttack']);
export const isTriforceAbility = (def: AbilityDef) => SPECIAL.has(def.id);
export const tfNeedsTile = (def: AbilityDef) => TILE.has(def.id);
export const tfNeedsTarget = (def: AbilityDef) => TARGET.has(def.id);

/** Command Points a Totem action costs (Multicolored Courage −25%). */
export function totemCost(b: Battle, id: string): number {
  const c = TOTEM_CP[id] ?? 0;
  if (!c) return 0;
  return groups(b).includes('multicoloredCourage') ? Math.max(1, Math.floor(c * 0.75)) : c;
}
const free = (b: Battle, u: Unit, x: number, y: number) => inBounds(b, x, y) && anchorCost(b, { ...u, tfStack: undefined }, x, y) < INF && footprint(x, y, u.size).every((q) => { const o = unitAt(b, q.x, q.y); return !o || o === u; });
const visibleFoes = (b: Battle, u: Unit) => foesOf(b, u).filter((e) => !e.hidden);
const gripRange = (u: Unit) => 4 + (wears(u, 'robo') ? 2 : 0);
/** The three heroes ready for the Tri Force Assault: in one Totem, or all within 2 of the user. */
function heroTrio(b: Battle, u: Unit): Unit[] | null {
  if (!TRI_HEROES[u.templateId ?? '']) return null;
  const trio = Object.keys(TRI_HEROES).map((id) => (id === u.templateId ? u : b.units.find((a) => a.team === u.team && a.templateId === id && !a.captive)));
  if (trio.some((x) => !x)) return null;
  const set = trio as Unit[];
  return set.every((a) => a === u || (!a.acted && unitDist(u, a) <= 2)) ? set : null;
}

export function tfTargets(b: Battle, u: Unit, def: AbilityDef): Unit[] {
  const foes = visibleFoes(b, u);
  switch (def.id) {
    case 'tfTotemStack': {
      if (!totemCompatible(u) || riders(b, u).length) return [];
      const tops = new Map<string, Unit>();
      for (const a of alliesOf(b, u)) {
        if (!totemCompatible(a) || unitDist(u, a) !== 1) continue;
        const ms = totemMembers(b, a);
        if (ms.length >= 3 || ms.includes(u)) continue;
        tops.set(ms[0].uid, ms[ms.length - 1]);
      }
      return [...tops.values()];
    }
    case 'tfElevatedStrike': { const r = heightOf(b, u) >= 3 ? 2 : 1; return foes.filter((e) => unitDist(u, e) <= r); }
    case 'tfTriforceAssault': return foes.filter((e) => unitDist(u, e) <= 2);
    case 'expertTailoring': return [u, ...alliesOf(b, u).filter((a) => unitDist(u, a) <= 1)];
    case 'fashionCurse': return foes.filter((e) => unitDist(u, e) <= 4 && !!outfitOf(e));
    case 'segmentLaunch': return foes.filter((e) => { const d = unitDist(u, e); return d >= 2 && d <= 3; });
    case 'elementalProjectile': return foes.filter((e) => unitDist(u, e) <= 4);
    case 'combinedAttack': return foes.filter((e) => unitDist(u, e) <= 1);
  }
  return [];
}

export function tfTiles(b: Battle, u: Unit, def: AbilityDef): Pos[] {
  switch (def.id) {
    case 'tfTotemDrop': return u.tfStack ? tilesInRange(b, u, 1, 1, 1).filter((p) => free(b, u, p.x, p.y)) : [];
    case 'tfHeroThrow': {
      const top = riders(b, u).find(isTop);
      return top ? tilesInRange(b, u, 2, 4, u.size).filter((p) => free(b, top, p.x, p.y)) : [];
    }
    case 'tfGripshot': {
      if (!u.pack.some((p) => p.id === 'gripshot')) return [];
      const out: Pos[] = [];
      for (const p of tilesInRange(b, u, 2, gripRange(u), u.size)) {
        const t = tileAt(b, p.x, p.y);
        const o = unitAt(b, p.x, p.y);
        if (t === 'gripshotTarget' && landing(b, u, p)) out.push(p);
        else if (o && o !== u && !o.isBoss && o.size <= 2 && !o.captive && !(o.team !== u.team && o.hidden)) out.push(p);
      }
      return out;
    }
    case 'tfWaterPillar': return tilesInRange(b, u, 1, 3, u.size).filter((p) => {
      const t = tileAt(b, p.x, p.y);
      const o = unitAt(b, p.x, p.y);
      return !!t && (t === 'plain' || t === 'forest' || t === 'fort' || isWater(t)) && (!o || o.team === u.team);
    });
  }
  return [];
}
/** The free space next to a Gripshot Target closest to the user. */
function landing(b: Battle, u: Unit, post: Pos): Pos | undefined {
  return tilesInRange(b, post, 1, 1, 1).filter((p) => free(b, u, p.x, p.y)).sort((p, q) => footDist(p.x, p.y, 1, u.x, u.y, u.size) - footDist(q.x, q.y, 1, u.x, u.y, u.size))[0];
}

/** Why a pack ability can't be used now (null: it can; undefined: not ours). */
export function tfUnusable(b: Battle, u: Unit, def: AbilityDef): string | null | undefined {
  if (!isTriforceAbility(def)) {
    if ((TF_ENEMY_CASTS as readonly string[]).includes(def.id) && def.wild?.target === 'self' && def.wild.heal && u.hp > u.stats.hp * 0.6) return 'Not hurt enough';
    return undefined;
  }
  const cost = totemCost(b, def.id);
  if (cost && b.cp !== undefined && b.cp < cost) return 'Not enough Command Points';
  if (tfNeedsTarget(def) && !tfTargets(b, u, def).length) {
    return def.id === 'tfTotemStack' ? (totemCompatible(u) ? 'No ally to climb onto' : 'Can\'t join a Totem') : def.id === 'tfElevatedStrike' && heightOf(b, u) < 2 ? 'Needs height 2 or 3' : 'No target in reach';
  }
  if (tfNeedsTile(def) && !tfTiles(b, u, def).length) {
    return def.id === 'tfTotemDrop' ? (u.tfStack ? 'No room to hop down' : 'Not on a Totem') : def.id === 'tfHeroThrow' ? 'Only the bottom of a Totem throws' : def.id === 'tfGripshot' ? (u.pack.some((p) => p.id === 'gripshot') ? 'Nothing to grip' : 'Needs the Gripshot') : 'Not from here';
  }
  const members = totemMembers(b, u);
  switch (def.id) {
    case 'tfTotemStack': return riders(b, u).length ? 'Already carrying a Totem' : null;
    case 'tfElevatedStrike': return heightOf(b, u) < 2 ? 'Needs height 2 or 3' : null;
    case 'tfTripleSpin': return members.length < 3 ? 'Needs a 3-unit Totem' : !members.some((m) => visibleFoes(b, m).some((e) => unitDist(m, e) <= 1)) ? 'No enemy next to the Totem' : null;
    case 'tfTriforceAssault': return heroTrio(b, u) ? null : 'Needs the three heroes together (one Totem, or all within 2)';
    case 'tfTotemGuard': return members.length < 2 || members[0] !== u ? 'Only the bottom of a 2–3 unit Totem' : null;
    case 'tfDapperSpin': return visibleFoes(b, u).some((e) => unitDist(u, e) <= 2) ? null : 'No enemy within 2';
    case 'segmentLaunch': return (u.tfSegments ?? 0) >= 3 ? 'No segments left' : null;
    case 'miniMargoSummon': return b.units.filter((x) => tid(x) === 'miniMargo' && x.team === u.team).length >= 4 ? 'Enough Mini-Margos' : null;
    case 'undergroundDive': return visibleFoes(b, u).some((e) => unitDist(u, e) <= 1) ? 'Already next to an enemy' : !visibleFoes(b, u).length ? 'No enemy' : null;
    case 'combinedAttack': return Math.ceil((3 * u.hp) / u.stats.hp) < 3 ? 'A section is lost' : null;
    case 'grandCurse': return visibleFoes(b, u).some((e) => unitDist(u, e) <= 4) ? null : 'No enemy within 4';
  }
  return null;
}

export interface TFOutcome {
  hits: { uid: string; dmg: number; hp: number; killed: boolean; statuses: StatusKind[] }[];
  heals: { uid: string; amount: number }[];
  statuses: { uid: string; kind: StatusKind }[];
  cleansed: string[];
  buffed: string[];
  lines: string[];
  transformed?: string;
  warped?: { from: Pos; to: Pos };
  free?: boolean;
}

/** One strike of a cooperative technique or a boss ability (this pack's multipliers apply). */
function strike(b: Battle, u: Unit, e: Unit, out: TFOutcome, o: { stat?: 'str' | 'mag' | 'best'; base?: number; mult?: number; vs?: 'def' | 'res'; element?: Element; noWeapon?: boolean } = {}) {
  if (e.hp <= 0 || !b.units.includes(e)) return;
  const s = effectiveStats(u);
  const w = WEAPONS[u.weapons[0]];
  const es = effectiveStats(e);
  const magical = o.stat === 'mag' || (o.stat === 'best' && s.mag > s.str) || o.vs === 'res';
  const stat = magical ? s.mag : s.str;
  const mods = tfMods(b, u, u, e, true, w);
  let dmg = (stat + (magical ? mods.mag : mods.str) + (o.base ?? 0) + (o.noWeapon ? 0 : w?.might ?? 0) + mods.dmg - (o.vs === 'res' || magical ? es.res : es.def)) * (o.mult ?? 1);
  dmg *= tfMultiplier(b, u, u, e, magical, w, unitDist(u, e), o.element ?? w?.element);
  dmg = Math.max(1, Math.floor(dmg));
  if (e.buffs.some((x) => x.barrier)) dmg = 0;
  if (dmg >= e.hp) { const sv = tfSaveFromDeath(b, e); if (sv) { out.lines.push(sv.line); dmg = e.hp - 1; } }
  e.hp -= Math.min(dmg, e.hp);
  e.lastHitBy = u.uid;
  const killed = e.hp <= 0;
  out.hits.push({ uid: e.uid, dmg, hp: e.hp, killed, statuses: [] });
  if (!killed) out.lines.push(...tfAfterHit(b, u, e, dmg, w, o.element ?? w?.element));
  if (killed) {
    u.kills++;
    b.units = b.units.filter((x) => x !== e);
    if (!e.summoned) b.fallen.push(e);
    b.log.push(`${u.name} defeated ${e.name}.`);
    tfOnKill(b, u, e);
  }
}

export function castTriforce(b: Battle, u: Unit, def: AbilityDef, rng: RNG, target?: Unit, at?: Pos): TFOutcome | null {
  if (!isTriforceAbility(def)) return null;
  const out: TFOutcome = { hits: [], heals: [], statuses: [], cleansed: [], buffed: [], lines: [], free: !!def.freeAction };
  const st = tfState(b);
  if (def.perTurn) (u.turnUses ??= {})[`pt:${def.id}`] = b.turn;
  const cost = totemCost(b, def.id);
  if (cost && b.cp !== undefined) b.cp = Math.max(0, b.cp - cost);
  if (TOTEM_IDS.has(def.id) && def.id !== 'tfTotemStack') st.coop++;
  const used = (list: Unit[]) => { for (const a of list) if (a !== u) { a.acted = true; a.moved = true; } };
  switch (def.id) {
    // ── Totems ──
    case 'tfTotemStack': {
      const onto = target!;
      if (!climb(b, u, onto)) return null;
      const ms = totemMembers(b, u);
      out.warped = { from: { x: u.x, y: u.y }, to: { x: u.x, y: u.y } };
      out.lines.push(`${u.name} climbs onto ${onto.name}: a Totem ${ms.length} high${totemArtOf(ms[0]) ? ' — the Tri Force Heroes!' : '.'}`);
      if (ms.length >= 3) st.coop++;
      return out;
    }
    case 'tfTotemDrop': {
      const from = { x: u.x, y: u.y };
      leaveTotem(b, u);
      u.x = at!.x; u.y = at!.y;
      out.warped = { from, to: { ...at! } };
      out.lines.push(`${u.name} hops down from the Totem.`);
      return out;
    }
    case 'tfHeroThrow': {
      const top = riders(b, u).find(isTop)!;
      const from = { x: top.x, y: top.y };
      leaveTotem(b, top);
      top.x = at!.x; top.y = at!.y;
      out.warped = { from, to: { ...at! } };
      out.lines.push(`${u.name} throws ${top.name} across the field!`);
      return out;
    }
    case 'tfElevatedStrike': {
      buff(u, 'tfElevating', 'Elevated Strike', 1);
      strike(b, u, target!, out, { mult: 1.5 });
      u.buffs = u.buffs.filter((x) => x.id !== 'tfElevating');
      out.lines.push(`${u.name} strikes ${target!.name}'s weak point from on high!`);
      return out;
    }
    case 'tfTripleSpin': {
      const ms = totemMembers(b, u);
      const hit = new Set<Unit>();
      for (const m of ms) for (const e of visibleFoes(b, m)) if (unitDist(m, e) <= 1) hit.add(e);
      for (const e of hit) for (const m of ms) strike(b, m, e, out);
      used(ms);
      out.lines.push(`The Totem spins at every level: ${hit.size} enem${hit.size === 1 ? 'y' : 'ies'} caught!`);
      return out;
    }
    case 'tfTriforceAssault': {
      const trio = heroTrio(b, u)!;
      for (const h of trio) strike(b, h, target!, out, { mult: 1.3 });
      used(trio);
      st.coop++;
      out.lines.push('Green, Red and Blue strike as one: the Tri Force Assault!');
      return out;
    }
    case 'tfTotemGuard': {
      for (const m of totemMembers(b, u)) { buff(m, m === u ? 'tfTotemGuard' : 'tfTotemGuarded', 'Totem Guard', 1, { def: 5, res: 5 }); out.buffed.push(m.uid); }
      out.lines.push(`${u.name} braces the Totem: +5 DEF and RES, and the top is out of melee reach.`);
      return out;
    }
    // ── Tools ──
    case 'tfGripshot': {
      const o = unitAt(b, at!.x, at!.y);
      const from = { x: u.x, y: u.y };
      if (o && o !== u) {
        if (o.tfStack) leaveTotem(b, o);
        pullToward(b, o, u, footDist(o.x, o.y, o.size, u.x, u.y, u.size) - 1);
        out.lines.push(`${u.name}'s Gripshot drags ${o.name} in!`);
        if (o.team === u.team) st.coop++;
        syncTotems(b);
        return out;
      }
      const spot = landing(b, u, at!)!;
      if (u.tfStack) leaveTotem(b, u);
      u.x = spot.x; u.y = spot.y;
      out.warped = { from, to: { ...spot } };
      syncTotems(b);
      out.lines.push(`${u.name} zips across to the Gripshot Target.`);
      return out;
    }
    case 'tfWaterPillar': {
      const k = keyOf(b, at!.x, at!.y);
      const turns = wears(u, 'torrent') ? 5 : 3;
      const prev = st.pillars.find((p) => p.k === k);
      if (prev) prev.turns = Math.max(prev.turns, turns);
      else { st.pillars.push({ k, turns, revert: b.tiles[k] }); b.tiles[k] = 'waterPillar'; }
      const o = unitAt(b, at!.x, at!.y);
      out.lines.push(`${u.name} raises a Water Pillar${o ? `: ${o.name} is lifted up` : ''} (${turns} turns).`);
      return out;
    }
    case 'tfDapperSpin': {
      const foes = visibleFoes(b, u).filter((e) => unitDist(u, e) <= 2);
      for (const e of foes) strike(b, u, e, out, { mult: 1.2 });
      out.lines.push(`${u.name} spins with style!`);
      return out;
    }
    // ── Characters ──
    case 'expertTailoring': {
      const a = target!;
      liftCurses(a);
      buff(a, 'tfTailored', 'Enhanced clothing', 2, { def: 3, res: 3 });
      out.buffed.push(a.uid); out.cleansed.push(a.uid);
      out.lines.push(`Madame Couture mends ${a === u ? 'her own' : `${a.name}'s`} clothing: curses lifted, +3 DEF and RES.`);
      return out;
    }
    case 'fashionCurse': {
      const e = target!;
      curseOutfit(b, e, 3);
      out.statuses.push({ uid: e.uid, kind: 'curse' });
      out.lines.push(`${u.name} curses ${e.name}'s outfit: its bonuses are gone for ${e.buffs.find((x) => x.id === 'tfFashionCursed')?.turns ?? 3} turns.`);
      return out;
    }
    case 'grandCurse': {
      const foes = visibleFoes(b, u).filter((e) => unitDist(u, e) <= 4);
      for (const e of foes) { curseOutfit(b, e, 2, true); out.statuses.push({ uid: e.uid, kind: 'curse' }); }
      out.lines.push(`The Grand Curse falls: ${foes.length} enem${foes.length === 1 ? 'y\'s' : 'ies\''} equipment bonuses are halved.`);
      return out;
    }
    // ── Monsters and bosses ──
    case 'segmentLaunch': {
      strike(b, u, target!, out, { base: 4, noWeapon: true });
      u.tfSegments = (u.tfSegments ?? 0) + 1;
      buff(u, 'tfSegmentsLaunched', 'Segments launched', 99, { def: -2 * u.tfSegments });
      out.lines.push(`${u.name} launches a segment at ${target!.name}!`);
      return out;
    }
    case 'miniMargoSummon': {
      let n = 0;
      for (let i = 0; i < 2; i++) if (spawnTemp(b, 'miniMargo', u, Math.max(1, u.level - 3), u.team, 99)) n++;
      out.lines.push(n ? `${n} Mini-Margo${n > 1 ? 's roll' : ' rolls'} out of ${u.name}'s rim.` : 'There is no room for Mini-Margos.');
      return out;
    }
    case 'undergroundDive': {
      const foe = visibleFoes(b, u).sort((x, y) => unitDist(u, x) - unitDist(u, y))[0];
      const spot = foe ? [1, 2, 3].map((d) => tilesInRange(b, foe, d, d, foe.size).find((p) => free(b, u, p.x, p.y))).find(Boolean) : undefined;
      if (!spot) { out.lines.push(`${u.name} dives — and comes up where it was.`); return out; }
      const from = { x: u.x, y: u.y };
      u.x = spot.x; u.y = spot.y;
      out.warped = { from, to: { ...spot } };
      out.lines.push(`${u.name} dives under the ice and bursts out beside ${foe!.name}!`);
      return out;
    }
    case 'elementalProjectile': {
      const el = rng.pick(['fire', 'ice', 'lightning'] as Element[]);
      strike(b, u, target!, out, { stat: 'mag', base: 5, vs: 'res', element: el, noWeapon: true });
      out.lines.push(`A bolt of ${el} flies from the Lady's Pets!`);
      return out;
    }
    case 'combinedAttack': {
      strike(b, u, target!, out, { base: 10, noWeapon: true });
      out.lines.push(`All three of the Lady's Pets crash into ${target!.name}!`);
      return out;
    }
  }
  return null;
}

/** Enemy AI: the bosses and monsters aim their abilities. */
export function tfEnemyCast<R>(b: Battle, u: Unit, usable: (d: AbilityDef) => boolean, cast: (id: string, target?: string, at?: Pos) => R | null, abilities: Record<string, AbilityDef>): R | null {
  if (u.team !== 'enemy') return null;
  const foes = visibleFoes(b, u);
  for (const id of TF_ENEMY_CASTS) {
    if (!u.abilities.includes(id)) continue;
    const def = abilities[id];
    if (!def || !usable(def)) continue;
    const s = def.wild;
    if (s?.target === 'foes' && !foes.some((e) => unitDist(u, e) <= (s.radius ?? 1))) continue;
    if (s?.target === 'self' && s.heal && u.hp > u.stats.hp * 0.6) continue;
    if (s?.target === 'self' && !s.heal && !foes.some((e) => unitDist(u, e) <= 3)) continue;
    if (id === 'grandCurse' && foes.filter((e) => unitDist(u, e) <= 4).length < 2) continue;
    if (s?.target === 'foe') {
      const [lo, hi] = s.range ?? [1, 1];
      const t = foes.filter((e) => { const d = unitDist(u, e); return d >= lo && d <= hi; }).sort((x, y) => x.hp - y.hp)[0];
      if (!t) continue;
      const r = cast(id, t.uid);
      if (r) return r;
      continue;
    }
    if (tfNeedsTarget(def)) { const t = tfTargets(b, u, def).sort((x, y) => x.hp - y.hp)[0]; if (!t) continue; const r = cast(id, t.uid); if (r) return r; continue; }
    const r = cast(id);
    if (r) return r;
  }
  return null;
}

/** Totem summary for the battle view's unit panel. */
export function tfStatus(b: Battle, u: Unit): string | null {
  const ms = totemMembers(b, u);
  const parts: string[] = [];
  if (ms.length > 1) parts.push(`Totem ${ms.length} high (${[...ms].reverse().map((m) => m.name).join(' / ')}) · height ${heightOf(b, u)}`);
  else if (heightOf(b, u) > 1) parts.push(`Height ${heightOf(b, u)}`);
  const o = outfitOf(u);
  if (o) parts.push(`Outfit: ${o.name}${u.tfLoanOutfit ? ' (on loan)' : ''}`);
  else if (u.buffs.some((x) => CURSE_IDS.includes(x.id))) parts.push('Outfit cursed');
  if ((u.tfLayers ?? 0) > 0) parts.push(`Layers ${u.tfLayers}/3`);
  if (has(u, 'rotatingPrism')) parts.push(`Prism: ${['red (weak to melee)', 'green (weak to ranged)', 'blue (weak to magic)'][b.tf?.prism ?? 0]}`);
  return parts.length ? parts.join(' · ') : null;
}

/** Outfit ids (for the boutique, pedestals and tests). */
export const OUTFIT_IDS = OUTFITS.map((o) => o.id);
export const isRareMaterial = (id: string) => RARE_MATERIALS.includes(id);
