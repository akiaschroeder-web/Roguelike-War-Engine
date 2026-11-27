import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (engine/wild.ts castWild, which any pack can use). */
const p = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, grantedBy: { templates }, ...extra });
/** A personal ability with a special effect (engine/fourswords.ts castFourSwords). */
const q = (id: string, name: string, mp: number, desc: string, extra: X = {}): AbilityDef => ab({ id, name, kind: 'personal', mp, desc, ...extra });
/** A Four Link formation or formation command: costs Command Points (engine/fourswords.ts). */
const f = (id: string, name: string, icon: string, desc: string, extra: X = {}): AbilityDef => ab({ id, name, kind: 'personal', mp: 0, icon, desc, ...extra });
/** A battlefield action (shown as its own button when usable). */
const act = (id: string, name: string, icon: string, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, desc, grantedBy: { everyone: true }, ...extra });

const GREEN = ['greenLink'], RED = ['redLink'], BLUE = ['blueLink'], PURPLE = ['purpleLink'];

/** Formation command CP costs (before the Green Link commander's discount). */
export const FORMATION_CP: Record<string, number> = {
  formationBox: 4, formationLine: 3, formationColumn: 2, formationCross: 3,
  formationMarch: 1, combinedSpin: 2, heroStack: 1, cooperativeThrow: 1, fourfoldStrike: 3, fourfoldBarrier: 3, sacredSeal: 4,
};
/** Links each formation command needs on the field. */
export const FORMATION_NEEDS: Record<string, number> = {
  formationBox: 2, formationLine: 2, formationColumn: 2, formationCross: 2,
  formationMarch: 2, combinedSpin: 2, heroStack: 2, cooperativeThrow: 2, fourfoldStrike: 4, fourfoldBarrier: 4, sacredSeal: 4,
};
/** The four formations: what each gives the Links while it holds (3 turns). */
export const FORMATIONS: Record<string, { name: string; text: string }> = {
  box: { name: 'Box', text: '+4 DEF and RES for the Links' },
  line: { name: 'Line', text: '+3 STR and +10 Hit for the Links' },
  column: { name: 'Column', text: '+2 MOV for the Links' },
  cross: { name: 'Cross', text: '+15 Avoid and +10 Crit for the Links' },
};

export const ABILITIES: AbilityDef[] = [
  // ── Green Link ──
  q('coordinatedStrikeFS', 'Coordinated Strike', 0, 'Strike an adjacent enemy, and another Link within 3 of it joins the attack (both hit: STR + weapon vs DEF). Uses only your action.',
    { sta: 6, grantedBy: { templates: GREEN }, icon: '⚔' }),
  p('herosRally', "Hero's Rally", 0, 'Allies within 2 gain +2 STR and DEF for 3 turns.', GREEN, { target: 'allies', radius: 2, buff: { id: 'herosRally', name: "Hero's Rally", turns: 3, stats: { str: 2, def: 2 } } }, { sta: 5, cooldown: 3 }),
  q('swordBeamFS', 'Sword Beam', 0, 'At full HP: a sword beam at an enemy 2–4 away (STR + weapon vs DEF; Mystic Courage +25%).', { sta: 5, grantedBy: { templates: GREEN } }),
  // ── Red Link ──
  q('powerSlash', 'Power Slash', 0, 'A heavy blow on an adjacent enemy: 160% damage (STR + weapon vs DEF). Flips Terrorpins.', { sta: 6, grantedBy: { templates: RED } }),
  q('guardBreaker', 'Guard Breaker', 0, 'An adjacent enemy: STR + weapon, ignoring 50% of its DEF. Flips Terrorpins and cracks ice armour.', { sta: 8, grantedBy: { templates: RED } }),
  q('recklessCharge', 'Reckless Charge', 0, 'Charge up to 4 spaces at an enemy and strike hard (STR + weapon + 6 vs DEF), at −3 DEF until your next turn.', { sta: 8, grantedBy: { templates: RED } }),
  // ── Blue Link ──
  q('quickSlash', 'Quick Slash', 0, 'Two quick hits on an adjacent enemy at 75% each.', { sta: 4, grantedBy: { templates: BLUE } }),
  q('rollingAssault', 'Rolling Assault', 0, 'Roll through an adjacent enemy\'s space to the far side and strike it from behind (120% damage; flips Terrorpins).', { sta: 5, grantedBy: { templates: BLUE } }),
  q('evasiveStep', 'Evasive Step', 0, '+30 Avoid until your next turn. Doesn\'t use your action.', { sta: 4, freeAction: true, perTurn: true, grantedBy: { templates: BLUE } }),
  // ── Purple Link ──
  q('mysticSlash', 'Mystic Slash', 5, 'A sword stroke driven by magic: an adjacent enemy takes MAG + weapon vs DEF.', { grantedBy: { templates: PURPLE } }),
  q('chargedBeam', 'Charged Beam', 10, 'A piercing magical beam at an enemy 2–5 away (MAG + 6 vs RES, ignoring half its RES); half damage to the enemy behind it.', { grantedBy: { templates: PURPLE } }),
  p('herosBlessing', "Hero's Blessing", 8, 'An ally within 2 (or himself) recovers 20% HP and is cured of a negative status.', PURPLE, { target: 'ally', range: [0, 2], heal: { pct: 0.2 }, cleanse: true }),
  // ── The Four Link formations (section 8): Command Points, at least 2 Links on the field ──
  f('formationBox', 'Formation: Box', '⬛', 'The Links close ranks: +4 DEF and RES for every Link for 3 turns. 4 CP. Doesn\'t use your action.', { freeAction: true, perTurn: true }),
  f('formationLine', 'Formation: Line', '➖', 'A battle line: +3 STR and +10 Hit for every Link for 3 turns. 3 CP. Doesn\'t use your action.', { freeAction: true, perTurn: true }),
  f('formationColumn', 'Formation: Column', '⬇', 'A marching column: +2 MOV for every Link for 3 turns. 2 CP. Doesn\'t use your action.', { freeAction: true, perTurn: true }),
  f('formationCross', 'Formation: Cross', '✚', 'Back to back: +15 Avoid and +10 Crit for every Link for 3 turns. 3 CP. Doesn\'t use your action.', { freeAction: true, perTurn: true }),
  f('formationMarch', 'Formation March', '👣', 'The Links move together: every Link within 3 that hasn\'t moved gains +2 MOV this turn. 1 CP. Doesn\'t use your action.', { freeAction: true, perTurn: true }),
  f('combinedSpin', 'Combined Spin', '🌀', 'You and every Link next to you spin together: every enemy next to any of you takes STR + weapon vs DEF. 2 CP; uses every participant\'s action.'),
  f('heroStack', 'Hero Stack', '🧍', 'An adjacent Link climbs onto your shoulders: it reaches high switches (Four-Person and Formation Switches within 1 trigger) and gains +2 range and +15 Hit this turn. 1 CP; uses your action.'),
  f('cooperativeThrow', 'Cooperative Throw', '🤾', 'Throw an adjacent Link to a free space up to 4 away, over gaps and obstacles. 1 CP; uses your action (the thrown Link can still act).'),
  f('fourfoldStrike', 'Fourfold Strike', '✴', 'Four Links: every Link within 3 of an enemy within 2 of you hits it in turn (STR or MAG + weapon vs DEF). 3 CP; uses every participant\'s action.'),
  f('fourfoldBarrier', 'Fourfold Barrier', '🛡', 'Four Links: a barrier around the Links and every ally next to them blocks all damage until your next turn. 3 CP; uses every Link\'s action.'),
  f('sacredSeal', 'Sacred Seal', '🔆', 'Four Links and Sacred Awakening (2,000 Force): massive sacred damage (2 × the best of STR and MAG + 10 vs RES) to every enemy within 3 of any Link; demonic bosses are stunned for a turn. 4 CP; uses every Link\'s action.'),
  // ── Section 2 ──
  p('sacredLightFS', 'Sacred Light', 12, 'Every enemy within 2 takes MAG + 4 sacred light damage vs RES (demons and the undead take 50% more) and may be Stunned.', ['zeldaFS'],
    { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'light', sacred: true }, status: { kind: 'stun', turns: 1, chance: 30 }, tags: ['sacred'] }, { cooldown: 3 }),
  q('shadowReflection', 'Shadow Reflection', 12, 'Two shadow duplicates step out of you (40% of your HP, 60% of your STR, MAG and SKL) for 2 turns. Once per battle.',
    { oncePerBattle: true, grantedBy: { templates: ['shadowLink'], gear: ['shadowMirror'] }, icon: '🌑' }),
  q('giantBombThrow', 'Giant Bomb', 14, 'Throw a giant bomb to a space up to 3 away: after 2 turns it explodes (STR + 12 to every enemy within 2). A Giant Bomb Zone marks the blast.', { cooldown: 4, grantedBy: { templates: ['shadowLink'] }, icon: '💣' }),
  q('banishToDarkWorld', 'Banish to the Dark World', 15, 'An enemy within 3 is banished into the Dark World: −4 STR, MAG, DEF and RES and rooted for 2 turns (through a Dark World Portal if there is one).', { cooldown: 3, grantedBy: { templates: ['ganonFSA'] } }),
  p('tridentSpin', 'Trident Spin', 8, 'The trident sweeps every enemy next to him (STR + 4 vs DEF).', ['ganonFSA'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4, weapon: true } }, { cooldown: 2 }),
  // ── The Shrine Maidens ──
  p('forestPrayer', 'Forest Prayer', 8, 'Allies within 2 recover 15% HP and are cured of negative statuses.', ['greenMaiden'], { target: 'allies', radius: 2, heal: { pct: 0.15 }, cleanse: true, tags: ['sacred'] }, { cooldown: 2 }),
  p('flamePrayer', 'Flame Prayer', 8, 'Sacred fire on an enemy within 3 (MAG + 4 fire vs RES; may Burn).', ['redMaiden'], { target: 'foe', range: [1, 3], dmg: { stat: 'mag', base: 4, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 40 } }),
  p('waterPrayer', 'Water Prayer', 8, 'An ally within 2 recovers 25% HP and is cured.', ['blueMaiden'], { target: 'ally', range: [0, 2], heal: { pct: 0.25 }, cleanse: true, tags: ['water'] }),
  p('shadowVeil', 'Shadow Veil', 8, 'Allies within 2 are Veiled (hidden from attack) until their next turn.', ['purpleMaiden'], { target: 'allies', radius: 2, status: { kind: 'veiled', turns: 1 } }, { cooldown: 3 }),
  p('radiantPrayer', 'Radiant Prayer', 10, 'Radiant light on every enemy within 2 (MAG + 2 sacred light vs RES; demons and the undead take 50% more).', ['yellowMaiden'],
    { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'light', sacred: true }, tags: ['sacred'] }, { cooldown: 2 }),
  p('protectivePrayer', 'Protective Prayer', 10, 'Allies within 2 gain +5 DEF and RES for 2 turns.', ['whiteMaiden'], { target: 'allies', radius: 2, buff: { id: 'protectivePrayer', name: 'Protective Prayer', turns: 2, stats: { def: 5, res: 5 } }, tags: ['sacred'] }, { cooldown: 3 }),
  // ── Section 3 ──
  p('captainsOrder', "Captain's Order", 0, 'Allies within 3 gain +2 STR and SKL for 2 turns.', ['hyruleCaptain'], { target: 'allies', radius: 3, buff: { id: 'captainsOrder', name: "Captain's Order", turns: 2, stats: { str: 2, skl: 2 } } }, { sta: 6, cooldown: 3 }),
  // ── Bosses (enemies use them on their own) ──
  p('cycloneFS', 'Cyclone', 10, 'A moving tornado strikes an enemy within 4 (MAG + 4 vs RES) and throws it back 2 spaces.', ['vaatiWindMage'], { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 4, vs: 'res' }, push: 2, tags: ['wind'] }, { cooldown: 2 }),
  q('vacuumFS', 'Vacuum', 8, 'Pulls every enemy within 3 two spaces toward him.', { cooldown: 3, grantedBy: { templates: ['vaatiWindMage'] } }),
  p('windBarrierFS', 'Wind Barrier', 12, 'A barrier of wind deflects projectiles for 2 turns (attacks from 2 or more spaces deal nothing).', ['vaatiWindMage'], { target: 'self', buff: { id: 'fsWindBarrier', name: 'Wind Barrier', turns: 2 }, tags: ['wind'] }, { cooldown: 4 }),
  p('eyeBeamFS', 'Eye Beam', 10, 'A piercing beam at an enemy within 4 (MAG + 6 vs RES, ignoring half its RES).', ['vaatiWindMage'], { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 6, vs: 'res', pierce: 0.5 } }, { cooldown: 2 }),
  p('greatTornado', 'Great Tornado', 25, 'Scatters every enemy within 3 with heavy wind (MAG + 4 vs RES, pushed back 2).', ['vaatiWindMage'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 4, vs: 'res' }, push: 2, tags: ['wind'] }, { cooldown: 4 }),
  q('slimeDivision', 'Slime Division', 10, 'Two Zols split off its body onto the spaces beside it.', { cooldown: 4, grantedBy: { templates: ['deluZol'] } }),
  q('gelAbsorption', 'Gel Absorption', 6, 'Engulfs an adjacent enemy (STR + 2 vs DEF) and absorbs half the damage as HP.', { cooldown: 2, grantedBy: { templates: ['deluZol'] } }),
  p('flameBreathFS', 'Flame Breath', 8, 'Fire at an enemy within 2 (MAG + 4 fire vs RES; may Burn).', ['gouen'], { target: 'foe', range: [1, 2], dmg: { stat: 'mag', base: 4, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 40 } }, { cooldown: 2 }),
  p('lavaBurst', 'Lava Burst', 12, 'Lava erupts under every enemy within 2 (MAG + 2 fire vs RES).', ['gouen'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'fire' } }, { cooldown: 3 }),
  p('crushingSlamFS', 'Crushing Slam', 8, 'Slams every enemy next to it (STR + 4 vs DEF).', ['gouen'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4 } }, { cooldown: 2 }),
  p('moltenArmor', 'Molten Armor', 10, '+8 DEF for 2 turns.', ['gouen'], { target: 'self', buff: { id: 'moltenArmor', name: 'Molten Armor', turns: 2, stats: { def: 8 } } }, { cooldown: 4 }),
  q('elementalShift', 'Elemental Shift', 8, 'Its weakness shifts to the next element at once, and it recovers 10% HP.', { cooldown: 2, grantedBy: { templates: ['deraZol'] } }),
  p('slimeBarrage', 'Slime Barrage', 10, 'Gel rains on every enemy within 2 (MAG + 2 vs RES).', ['deraZol'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res' } }, { cooldown: 3 }),
  p('iceBeamFS', 'Ice Beam', 10, 'A freezing beam at an enemy within 3 (MAG + 4 ice vs RES; may Freeze).', ['frostare'], { target: 'foe', range: [1, 3], dmg: { stat: 'mag', base: 4, vs: 'res', element: 'ice' }, status: { kind: 'freeze', turns: 1, chance: 25 } }, { cooldown: 2 }),
  q('frozenBarrier', 'Frozen Barrier', 12, 'Its ice armour re-forms at once, and it gains +4 RES for 2 turns.', { cooldown: 4, grantedBy: { templates: ['frostare'] } }),
  p('blizzardFS', 'Blizzard', 14, 'A blizzard on every enemy within 3 (MAG + 2 ice vs RES).', ['frostare'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'ice' } }, { cooldown: 3 }),
  p('frostRegeneration', 'Frost Regeneration', 10, 'Recovers 20% HP.', ['frostare'], { target: 'self', heal: { pct: 0.2 } }, { cooldown: 4 }),
  // ── Returning bosses: encounter-specific abilities (added when they are fought in this campaign) ──
  p('phantomVolley', 'Phantom Volley', 8, 'A volley of dark energy at an enemy 2–4 away (MAG + 6 dark vs RES).', [], { target: 'foe', range: [2, 4], dmg: { stat: 'mag', base: 6, vs: 'res', element: 'dark' } }, { cooldown: 2 }),
  p('stoneShellFS', 'Stone Shell', 6, 'Its stone shell hardens: +8 DEF for 2 turns.', [], { target: 'self', buff: { id: 'stoneShellFS', name: 'Stone Shell', turns: 2, stats: { def: 8 } } }, { cooldown: 4 }),
  p('dodongoFireBreath', 'Fire Breath', 6, 'Fire at an enemy within 2 (STR + 4 fire vs RES). Bombs it swallows explode inside it (bombs deal triple damage to it).', [], { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 4, vs: 'res', element: 'fire' } }, { cooldown: 2 }),
  p('vineLash', 'Vine Lash', 8, 'Its heads lash every enemy within 2 (STR + 2 vs DEF).', [], { target: 'foes', radius: 2, dmg: { stat: 'str', base: 2 } }, { cooldown: 3 }),
  p('talonDive', 'Talon Dive', 8, 'Dives at an enemy within 4 (STR + 6 vs DEF).', [], { target: 'foe', range: [1, 4], move: true, dmg: { stat: 'str', base: 6 } }, { cooldown: 2 }),
  p('hinoxBombToss', 'Bomb Toss', 6, 'Throws a bomb at an enemy 2–4 away: STR + 2 to it and everyone next to it.', [], { target: 'foe', range: [2, 4], radius: 1, dmg: { stat: 'str', base: 2 } }, { cooldown: 2 }),
  p('tailWhip', 'Tail Whip', 4, 'Its tail whips every enemy next to it (STR + 2) and knocks them back.', [], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 2 }, push: 1 }, { cooldown: 2 }),
  // ── Battlefield actions (section 10) ──
  act('fsCrossPortal', 'Cross to the other World', '🌗', 'From a Dark World Portal: step through to the matching portal (Dark World: dark units +3 STR and MAG, others −2 DEF for 2 turns).'),
  act('fsShatterMirror', 'Shatter Mirror', '🪞', 'Smash an adjacent Shadow Mirror Gate: no more shadow duplicates from it.'),
  act('fsPushBlock', 'Push Block', '🧱', 'With another ally next to the same Cooperative Block: push it out of the way (a Force Gem is underneath).'),
  act('fsTakeItem', 'Take Item', '🎁', 'Take the battlefield tool on this Item Pedestal. Doesn\'t use your action.', { freeAction: true }),
  act('fsFairyUpgrade', 'Great Fairy Upgrade', '🧚', 'On a Great Fairy Upgrade Pedestal: your equipped tool becomes Level 2 for the rest of the battle. Doesn\'t use your action.', { freeAction: true }),
  act('fsMagnetSwing', 'Magnetic Swing', '🧲', 'With Magnetic Gloves: swing to a space next to a Magnetic Pillar within 4 (6 with the Lv. 2 gloves).'),
  act('fsBreakSeal', 'Break the Seal', '🔆', 'Next to a Sanctuary Seal, with sacred power (Zelda, a Maiden, a light or sacred weapon) or a formation of 2 Links within 2: the seal breaks.'),
];

/** Abilities handled by engine/fourswords.ts castFourSwords. */
export const FS_SPECIAL = [
  'coordinatedStrikeFS', 'swordBeamFS', 'powerSlash', 'guardBreaker', 'recklessCharge', 'quickSlash', 'rollingAssault', 'evasiveStep', 'mysticSlash', 'chargedBeam',
  ...Object.keys(FORMATION_CP), 'shadowReflection', 'giantBombThrow', 'banishToDarkWorld', 'vacuumFS', 'slimeDivision', 'gelAbsorption', 'elementalShift', 'frozenBarrier',
  'fsCrossPortal', 'fsShatterMirror', 'fsPushBlock', 'fsTakeItem', 'fsFairyUpgrade', 'fsMagnetSwing', 'fsBreakSeal',
];
/** Encounter-specific abilities for the returning bosses (by the boss's id). */
export const RETURNING_BOSS_ABILITIES: Record<string, string[]> = {
  phantomGanon: ['phantomVolley'], arrghus: ['stoneShellFS'], dodongo: ['dodongoFireBreath'], manhandla: ['vineLash'], helmarocKing: ['talonDive'],
  hinox: ['hinoxBombToss'], moldorm: ['tailWhip'], mightyDarknut: [],
};
