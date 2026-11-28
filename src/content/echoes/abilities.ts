import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (engine/wild.ts castWild, which any pack can use). */
const p = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, grantedBy: { templates }, ...extra });
/** A personal ability with a special effect (engine/echoes.ts castEchoes). */
const q = (id: string, name: string, mp: number, desc: string, extra: X = {}): AbilityDef => ab({ id, name, kind: 'personal', mp, desc, ...extra });
/** A sword or bow technique chosen in the combat forecast. */
const tech = (id: string, name: string, sta: number, weapon: 'sword' | 'bow', desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'technique', mp: 0, sta, weaponTypes: [weapon], hidden: true, desc, ...extra });

const TRI_ROD = { weapons: ['triRod', 'falseTriRod'] };

export const ABILITIES: AbilityDef[] = [
  // ── Zelda's abilities (section 1): anyone carrying the Tri Rod can summon, bind and follow ──
  q('createEcho', 'Create Echo', 5, 'Summon a learned monster (75% of its HP, STR, MAG, DEF and RES; no EXP, items or casualties) or object on an empty space within 2 (more at higher Tri levels). Uses Echo Capacity until it falls or is dismissed. Not in Swordfighter Form.',
    { grantedBy: TRI_ROD, icon: '✨' }),
  q('dismissEcho', 'Dismiss Echo', 0, 'Remove one of your Echoes (a summoned monster or object) and free its capacity. Doesn\'t use your action.', { grantedBy: TRI_ROD, icon: '💨', freeAction: true }),
  q('eoBind', 'Bind', 5, 'Tie a creature within 3 to your movement and drag it 2 spaces toward you (size, CON and RES resist; a boss can\'t be moved, but its weak point always comes free). Pulls shields off (Shield Pull) and weak points out of bosses (the Seismic Talus\'s core, Bori\'s bubble, Mogryph from the sand). Not in Swordfighter Form.',
    { grantedBy: TRI_ROD, icon: '🔗' }),
  q('eoReverseBond', 'Reverse Bond', 5, 'Follow a bound creature: move next to a unit (or Echo) within 6. Doesn\'t use your action.', { grantedBy: TRI_ROD, icon: '🔁', freeAction: true, perTurn: true }),
  q('swordfighterForm', 'Swordfighter Form', 0, 'Costs 5 Energy: Zelda becomes a swordfighter (STR 24, MAG 12, SKL 25, SPD 23, DEF 18, RES 16, MOV 7) until her Energy runs out (10 a turn; Mighty weapon attacks 3 more). Echoes already summoned stay. Use again to change back. Doesn\'t use your action.',
    { grantedBy: { templates: ['zeldaEoW'] }, icon: '🗡', freeAction: true, perTurn: true }),
  q('eoRestoration', 'Restoration', 15, 'With Tri\'s help (Tri in the battle, or the Tri Rod): repairs every unstable Rift space within 2, seals a Rift Corruption Source there, and rescues Tri\'s friend if one is in reach.',
    { grantedBy: { templates: ['zeldaEoW', 'tri'] }, icon: '🔺' }),
  q('triBond', 'Bond of Creation', 8, 'Tri shares her power with an ally within 3: +4 MAG and RES for 2 turns, and its next Echo costs 1 less.', { grantedBy: { templates: ['tri'] }, icon: '💛' }),
  // ── Link's abilities (section 1) ──
  tech('mightySlash', 'Mighty Slash', 5, 'sword', 'A powerful sword attack: +6 Might.', { might: 6 }),
  tech('mightyShot', 'Mighty Shot', 5, 'bow', 'A high-Hit bow attack: +3 Might, +30 Hit.', { might: 3, hit: 30 }),
  p('mightyBomb', 'Mighty Bomb', 0, 'Throw an equipped bomb 1–3 spaces: STR + 8 to everyone within 1 of it.', ['linkEoW'], { target: 'tile', range: [1, 3], radius: 1, dmg: { stat: 'str', base: 8, element: 'fire' } }, { sta: 6, icon: '💣' }),
  p('heroicSpin', 'Heroic Spin', 0, 'A spin that hits every enemy next to Link (STR + weapon + 4).', ['linkEoW', 'echoLink'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4, weapon: true } }, { sta: 8, icon: '🌀' }),
  q('riftBreaker', 'Rift Breaker', 0, 'A blow at an adjacent enemy (STR + weapon + 6 vs DEF): double damage against Rift creatures and Echoes.', { sta: 10, grantedBy: { templates: ['linkEoW'] }, icon: '💥' }),
  // ── The cast ──
  p('royalDecreeEoW', 'Royal Command', 6, 'Allies within 3 gain +3 STR and DEF for 2 turns.', ['kingEoW'], { target: 'allies', radius: 3, buff: { id: 'royalCommandEoW', name: 'Royal Command', turns: 2, stats: { str: 3, def: 3 } } }, { cooldown: 3 }),
  p('formationCharge', 'Formation Charge', 0, 'Charge a foe within 3 (STR + weapon + 4); allied infantry within 2 of the target gain +2 STR for a turn.', ['generalWright'], { target: 'foe', range: [1, 3], move: true, dmg: { stat: 'str', base: 4, weapon: true } }, { sta: 8, cooldown: 2 }),
  p('tacticalPlan', 'Tactical Plan', 8, 'Allies within 2 gain +3 SKL and SPD for 2 turns.', ['ministerLefte'], { target: 'allies', radius: 2, buff: { id: 'tacticalPlan', name: 'Tactical Plan', turns: 2, stats: { skl: 3, spd: 3 } } }, { cooldown: 3 }),
  p('sheikahVanish', 'Sheikah Vanish', 6, 'Vanish and reappear on a space within 4.', ['impaEoW'], { target: 'tile', range: [1, 4], move: true }, { cooldown: 2 }),
  q('mightInfusion', 'Might Infusion', 6, 'An ally within 2 recovers 15 Swordfighter Energy (or Wind-Up Energy).', { grantedBy: { templates: ['lueburry'] }, icon: '💠' }),
  q('rewindAutomaton', 'Rewind', 0, 'Wind up an adjacent Automaton: its Wind-Up Energy is full again.', { grantedBy: { templates: ['dampeEoW'] }, icon: '🔑' }),
  q('repairAutomaton', 'Mechanical Repair', 6, 'Repair an adjacent Automaton: it recovers 40% HP.', { grantedBy: { templates: ['dampeEoW'] }, icon: '🔧' }),
  p('goronRally', 'Goron Rally', 6, 'Allies within 2 gain +3 DEF for 2 turns.', ['darston'], { target: 'allies', radius: 2, buff: { id: 'goronRally', name: 'Goron Rally', turns: 2, stats: { def: 3 } } }, { cooldown: 3 }),
  p('sandstormCommand', 'Sandstorm Command', 10, 'A Gerudo sandstorm: foes within 2 are Blinded for 2 turns.', ['chiefSeera'], { target: 'foes', radius: 2, status: { kind: 'blind', turns: 2, chance: 70 } }, { cooldown: 3 }),
  p('desertDash', 'Desert Dash', 0, '+2 MOV and +3 SPD this turn.', ['dohna'], { target: 'self', buff: { id: 'desertDash', name: 'Desert Dash', turns: 1, stats: { mov: 2, spd: 3 } } }, { sta: 5, cooldown: 2 }),
  p('riverDrumbeat', 'River Drumbeat', 8, 'Allies within 3 gain +2 STR and MAG for 2 turns (River Zora +4).', ['dradd'], { target: 'allies', radius: 3, buff: { id: 'riverDrumbeat', name: 'River Drumbeat', turns: 2, stats: { str: 2, mag: 2 } } }, { cooldown: 3 }),
  p('tidalHymn', 'Tidal Hymn', 10, 'Allies within 2 recover 20% HP.', ['kushara'], { target: 'allies', radius: 2, heal: { pct: 20 }, tags: ['water'] }, { cooldown: 2 }),
  p('avalancheShove', 'Avalanche Shove', 0, 'A shovelful of snow: every enemy next to Condé takes STR + 2 and is pushed 1 space.', ['conde'], { target: 'foes', radius: 1, push: 1, dmg: { stat: 'str', base: 2 } }, { sta: 8, cooldown: 2 }),
  p('mechanicalLeapAct', 'Mechanical Leap', 0, 'Leap at a foe 2–4 away and land on it (STR + 4 vs DEF).', ['techtite'], { target: 'foe', range: [2, 4], move: true, dmg: { stat: 'str', base: 4 } }, { sta: 6, cooldown: 2 }),
  p('musicalBubblesAct', 'Musical Bubbles', 8, 'Bubbles burst over every foe within 2 (MAG + 2 vs RES).', ['gizmol'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res' } }, { cooldown: 2 }),
  q('mechanicalMawAct', 'Mechanical Maw', 0, 'Eat an adjacent enemy below 30% HP that is no bigger than the Baba (not a boss).', { sta: 8, grantedBy: { templates: ['highTekuBaba'] }, icon: '🪤' }),
  // ── Bosses (enemies use them on their own) ──
  p('stoneFistEoW', 'Stone Fist', 0, 'A stone fist slams a foe 1–2 away (STR + 6 vs DEF).', ['seismicTalus', 'volcanicTalus'], { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 6 } }, { sta: 6, cooldown: 2 }),
  p('doubleSlam', 'Double Slam', 0, 'Both fists slam down on every foe within 1 (STR + 4 vs DEF).', ['seismicTalus', 'volcanicTalus'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4 } }, { sta: 8, cooldown: 3 }),
  p('rotatingBody', 'Rotating Body', 0, 'Spins its stone body: every foe within 1 takes STR + 2 and is pushed back.', ['seismicTalus'], { target: 'foes', radius: 1, push: 1, dmg: { stat: 'str', base: 2 } }, { sta: 8, cooldown: 3 }),
  p('coreReconstruction', 'Core Reconstruction', 15, 'Rebuilds its body around the core: recovers 20% HP.', ['seismicTalus', 'volcanicTalus'], { target: 'self', heal: { pct: 20 } }, { cooldown: 4 }),
  p('sandCharge', 'Sand Charge', 0, 'Charges a foe within 3 (STR + 4).', ['mogryph'], { target: 'foe', range: [1, 3], move: true, dmg: { stat: 'str', base: 4 } }, { sta: 6, cooldown: 2 }),
  p('burrowingAmbush', 'Burrowing Ambush', 0, 'Burrows and bursts up next to a foe within 6 (STR + 6).', ['mogryph'], { target: 'foe', range: [2, 6], move: true, dmg: { stat: 'str', base: 6 } }, { sta: 8, cooldown: 3 }),
  p('sandTornado', 'Sand Tornado', 12, 'A sand tornado: every foe within 2 takes MAG + 2 and may be Blinded.', ['mogryph'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res' }, status: { kind: 'blind', turns: 1, chance: 40 } }, { cooldown: 3 }),
  p('wingedAssault', 'Winged Assault', 0, 'Swoops on a foe within 4 (STR + 3).', ['mogryph'], { target: 'foe', range: [1, 4], move: true, dmg: { stat: 'str', base: 3 } }, { sta: 8, cooldown: 2 }),
  p('quicksandField', 'Quicksand Field', 15, 'The sand swallows the feet of every foe within 2 (Rooted for a turn).', ['mogryph'], { target: 'foes', radius: 2, status: { kind: 'root', turns: 1, chance: 60 } }, { cooldown: 4 }),
  p('whirlpoolEoW', 'Whirlpool', 10, 'Drags a foe within 4 two spaces closer.', ['vocavor'], { target: 'foe', range: [1, 4], pull: 2 }, { cooldown: 2 }),
  p('tailSweepEoW', 'Tail Sweep', 0, 'Its tail sweeps every foe within 1 (STR + 3).', ['vocavor'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 3 } }, { sta: 6, cooldown: 2 }),
  p('aquaticCharge', 'Aquatic Charge', 0, 'Charges a foe within 4 (STR + 4).', ['vocavor'], { target: 'foe', range: [1, 4], move: true, dmg: { stat: 'str', base: 4 } }, { sta: 8, cooldown: 3 }),
  p('crushingCurrent', 'Crushing Current', 15, 'A crushing current hits every foe within 2 (MAG + 3 vs RES).', ['vocavor'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'water' } }, { cooldown: 3 }),
  p('deepWaterRetreat', 'Deep Water Retreat', 0, 'Retreats into the deep: +6 DEF and RES for a turn and 10% HP.', ['vocavor'], { target: 'self', heal: { pct: 10 }, buff: { id: 'deepWaterRetreat', name: 'Deep Water', turns: 1, stats: { def: 6, res: 6 } } }, { sta: 5, cooldown: 4 }),
  p('spinningChargeEoW', 'Spinning Charge', 0, 'Spins and charges a foe within 3 (STR + 5).', ['skorchill'], { target: 'foe', range: [1, 3], move: true, dmg: { stat: 'str', base: 5 } }, { sta: 8, cooldown: 2 }),
  p('frozenHorns', 'Frozen Horns', 10, 'Icy horns: every foe within 1 takes MAG + 3 ice and may Freeze.', ['skorchill'], { target: 'foes', radius: 1, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'ice' }, status: { kind: 'freeze', turns: 1, chance: 25 } }, { cooldown: 3 }),
  p('burningHorns', 'Burning Horns', 10, 'Flaming horns: every foe within 1 takes MAG + 3 fire and may Burn.', ['skorchill'], { target: 'foes', radius: 1, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 40 } }, { cooldown: 3 }),
  q('helmetReconstruction', 'Helmet Reconstruction', 15, 'Rebuilds its elemental helmet and horns.', { grantedBy: { templates: ['skorchill'] }, cooldown: 4 }),
  p('mountainSmash', 'Mountain Smash', 0, 'Smashes the mountainside: every foe within 2 takes STR + 2.', ['skorchill'], { target: 'foes', radius: 2, dmg: { stat: 'str', base: 2 } }, { sta: 10, cooldown: 3 }),
  p('bubbleBounce', 'Bubble Bounce', 0, 'Bounces onto a foe within 2 (STR + 3).', ['bori'], { target: 'foe', range: [1, 2], move: true, dmg: { stat: 'str', base: 3 } }, { sta: 5, cooldown: 2 }),
  q('electricalSummons', 'Electrical Summons', 10, 'Summons two Biri to defend it.', { grantedBy: { templates: ['bori'] }, cooldown: 4 }),
  q('bubbleShield', 'Bubble Shield', 8, 'Re-forms its protective bubble.', { grantedBy: { templates: ['bori'] }, cooldown: 3 }),
  p('aquaticCollision', 'Aquatic Collision', 0, 'Rams a foe within 3 (STR + 4) and Shocks it.', ['bori'], { target: 'foe', range: [1, 3], move: true, dmg: { stat: 'str', base: 4 }, status: { kind: 'shock', turns: 1, chance: 40 } }, { sta: 6, cooldown: 2 }),
  // ── Null (section 4) ──
  p('voidGraspAct', 'Void Grasp', 0, 'Grabs a smaller foe within 2 and holds it: STR + 4 and Rooted.', ['nullEoW'], { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 4 }, status: { kind: 'root', turns: 1 } }, { sta: 8, cooldown: 2 }),
  q('riftCreation', 'Rift Creation', 15, 'Turns the ground within 2 of a foe into unstable Still World.', { grantedBy: { templates: ['nullEoW'] }, cooldown: 3 }),
  q('echoCreationNull', 'Echo Creation', 12, 'Summons a learned monster Echo.', { grantedBy: { templates: ['nullEoW'] }, cooldown: 2 }),
  q('echoCreationTekom', 'False Echo', 8, 'Summons a hostile Echo.', { grantedBy: { templates: ['tekomBoss'] }, cooldown: 2 }),
  q('bossReflection', 'Boss Reflection', 30, 'Summons a weakened Echo of an eligible boss (60% of its stats) for the rest of the battle. Once per battle.', { grantedBy: { templates: ['nullEoW'] }, oncePerBattle: true }),
  p('shadowArms', 'Shadow Arms', 15, 'Limbs burst from the walls: every foe within 3 takes STR + 2.', ['nullEoW'], { target: 'foes', radius: 3, dmg: { stat: 'str', base: 2 } }, { cooldown: 3 }),
  q('consumption', 'Consumption', 20, 'Heavy dark damage to a foe within 3 (MAG + 10 vs RES); Null recovers what it deals.', { grantedBy: { templates: ['nullEoW'] }, cooldown: 3 }),
  q('voidRestoration', 'Void Restoration', 25, 'Regrows its destroyed arms.', { grantedBy: { templates: ['nullEoW'] }, cooldown: 5 }),
  q('returnToNothing', 'Return to Nothing', 40, 'Massive damage to every foe within 3 (MAG + 6 vs RES), and enemy summoning is disabled for 2 turns.', { grantedBy: { templates: ['nullEoW'] }, cooldown: 6 }),
];

/** Abilities handled by engine/echoes.ts castEchoes. */
export const EO_SPECIAL = ['createEcho', 'dismissEcho', 'eoBind', 'eoReverseBond', 'swordfighterForm', 'eoRestoration', 'triBond', 'riftBreaker', 'mightInfusion',
  'rewindAutomaton', 'repairAutomaton', 'mechanicalMawAct', 'helmetReconstruction', 'electricalSummons', 'bubbleShield', 'riftCreation', 'echoCreationNull',
  'echoCreationTekom', 'bossReflection', 'consumption', 'voidRestoration', 'returnToNothing'];
/** Boss abilities enemies cast on their own (when a foe is in reach, or when hurt). */
export const EO_ENEMY_CASTS = ['returnToNothing', 'bossReflection', 'voidRestoration', 'consumption', 'shadowArms', 'riftCreation', 'echoCreationNull', 'echoCreationTekom',
  'coreReconstruction', 'doubleSlam', 'rotatingBody', 'sandTornado', 'quicksandField', 'crushingCurrent', 'deepWaterRetreat', 'helmetReconstruction', 'frozenHorns', 'burningHorns',
  'mountainSmash', 'electricalSummons', 'bubbleShield'];
