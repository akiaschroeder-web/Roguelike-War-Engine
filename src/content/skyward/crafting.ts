// Equipment upgrades (section 13). Recipes turn one weapon or piece of gear into
// a better one for materials and Rupees; they also cover earlier packs' gear.

export interface Recipe {
  id: string;
  from: string;
  to: string;
  /** Material (quest inventory) id -> count. */
  mats: Record<string, number>;
  rupees: number;
  /** Sacred artifacts consumed (the sword's flames). They are never discounted. */
  sacred?: string[];
}

const rc = (from: string, to: string, mats: Record<string, number>, rupees: number, sacred?: string[]): Recipe => ({ id: `${from}>${to}`, from, to, mats, rupees, sacred });

export const RECIPES: Recipe[] = [
  // ── The doc's example recipes ──
  rc('woodenShieldTP', 'bandedShield', { amberRelic: 2, monsterClaw: 1, jellyBlob: 1 }, 50),
  rc('bandedShield', 'bracedShield', { monsterClaw: 2, amberRelic: 2, ornamentalSkull: 1 }, 100),
  rc('ironShield', 'reinforcedShield', { eldinOre: 2, monsterHorn: 2 }, 75),
  rc('reinforcedShield', 'fortifiedShield', { eldinOre: 3, ornamentalSkull: 2, goldenSkull: 1 }, 150),
  rc('sacredShield', 'divineShield', { duskRelic: 2, birdFeather: 1, ornamentalSkull: 1 }, 100),
  rc('divineShield', 'goddessShield', { duskRelic: 3, blueBirdFeather: 1, goddessPlume: 1 }, 200),
  rc('fairySlingshot', 'scattershot', { tumbleweed: 2, jellyBlob: 2, amberRelic: 1 }, 75),
  rc('hookBeetle', 'quickBeetle', { ancientFlower: 2, hornetLarvae: 2, goldenSkull: 1 }, 100),
  rc('quickBeetle', 'toughBeetle', { ancientFlower: 3, amberRelic: 2, goddessPlume: 1 }, 150),
  rc('fairyBow', 'ironBow', { eldinOre: 3, monsterClaw: 2, tumbleweed: 2 }, 100),
  rc('ironBow', 'sacredBow', { evilCrystal: 2, duskRelic: 2, goddessPlume: 1 }, 250),
  rc('bugNetSS', 'bigBugNet', { tumbleweed: 3, ancientFlower: 2, evilCrystal: 1 }, 75),
  // ── The goddess's sword (the flames are sacred artifacts) ──
  rc('goddessSword', 'goddessLongsword', {}, 0, ['faroresFlame']),
  rc('goddessLongsword', 'goddessWhiteSword', {}, 0, ['nayrusFlame']),
  rc('goddessWhiteSword', 'masterSword', {}, 0, ['dinsFlame']),
  rc('masterSword', 'trueMasterSword', {}, 0, ['hyliasBlessing']),
  // ── My additions: the missing first steps and earlier packs' gear ──
  rc('beetle', 'hookBeetle', { ancientFlower: 1, hornetLarvae: 2, amberRelic: 1 }, 75),
  rc('dekuShield', 'bandedShield', { amberRelic: 2, monsterClaw: 1, jellyBlob: 2 }, 60),
  rc('ordonShield', 'bandedShield', { amberRelic: 2, monsterClaw: 1, jellyBlob: 1 }, 50),
  rc('iliasSling', 'scattershot', { tumbleweed: 3, jellyBlob: 2, amberRelic: 1 }, 75),
  rc('soldierShield', 'ironShield', { eldinOre: 2, monsterClaw: 1 }, 60),
  rc('kokiriSword', 'skyKnightsSword', { monsterClaw: 2, lizardTail: 1 }, 80),
  rc('soldierSword', 'skyKnightsSword', { monsterClaw: 1, lizardTail: 1, birdFeather: 1 }, 60),
  rc('practiceSword', 'skyKnightsSword', { monsterClaw: 1, birdFeather: 1 }, 40),
  rc('fairyBow', 'sacredBow', { evilCrystal: 3, duskRelic: 3, goddessPlume: 1, blueBirdFeather: 1 }, 400),
];

/** Generic army materials that can stand in for a missing crafting material ("existing materials with equivalent purposes"). */
export const GENERIC_PER_MATERIAL = 2;
