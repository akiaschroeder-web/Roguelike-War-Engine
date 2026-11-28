import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (engine/wild.ts castWild, which any pack can use). */
const p = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, grantedBy: { templates }, ...extra });
/** A personal ability with a special effect (engine/minish.ts castMinish). */
const q = (id: string, name: string, mp: number, desc: string, extra: X = {}): AbilityDef => ab({ id, name, kind: 'personal', mp, desc, ...extra });
/** A Micro action (engine/micro.ts castMicro): base game, any pack. */
const micro = (id: string, name: string, icon: string, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, desc, ...extra });
/** A sword technique taught by the Blade Brothers (learned at the Swordmaster Dojo). */
const tech = (id: string, name: string, sta: number, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'technique', mp: 0, sta, weaponTypes: ['sword'], hidden: true, desc, ...extra });

const ANYONE = { everyone: true };

export const ABILITIES: AbilityDef[] = [
  // ── Micro actions (section 1): the base game's size rules ──
  micro('mcShrink', 'Shrink', '🍄', 'On a Minish Portal, next to Ezlo, or with transformation magic: become a Micro unit (HP ×0.8, DEF ×0.6, CON 1–2, SKL +2, SPD +3, MOV +1; Link becomes Micro Link). Keeps level, EXP, supports and HP%.', { grantedBy: ANYONE }),
  micro('mcGrow', 'Grow', '🌳', 'On a Minish Portal, next to Ezlo, or with transformation magic: return to normal size. Needs room for the full-sized footprint (not inside a creature or a wall).', { grantedBy: ANYONE }),
  micro('mcHitchRide', 'Hitch Ride', '🐴', 'A Micro unit sharing a larger ally\'s space rides along: it moves with the host for free until it acts on its own. Doesn\'t use your action.', { grantedBy: ANYONE, freeAction: true }),
  micro('mcDismount', 'Hop Off', '⤵', 'Stop riding your host. Doesn\'t use your action.', { grantedBy: ANYONE, freeAction: true }),
  micro('mcStomp', 'Stomp', '🦶', 'Deliberately try to crush an enemy Micro unit sharing your space: (STR + 4 − its DEF) ×1.5; Hit 55% + (your SKL − its SPD) ×3.', { grantedBy: ANYONE }),
  micro('mcSabotage', 'Sabotage', '🔧', 'Infiltration (on an enemy\'s space): its equipped weapon loses 5 uses, and it has −3 STR and MAG and −2 DEF for 2 turns.'),
  micro('mcDistract', 'Distract', '🎭', 'Infiltration: the enemy has −4 SKL and −15 Hit for 2 turns.'),
  micro('mcTrip', 'Trip', '🪢', 'Infiltration: −2 MOV for 2 turns (an enemy of size 1 or 2 is also Rooted for a turn: its movement is interrupted).'),
  micro('mcExposeWeakPoint', 'Expose Weak Point', '🎯', 'Infiltration: −5 DEF for 2 turns, and Micro attacks against it deal full damage.'),
  micro('mcInternalStrike', 'Internal Strike', '💥', 'Infiltration: enter a compatible enemy (a monster or construct of size 2+) and strike its internal weak point: STR (or MAG) + weapon Might, ignoring 75% of DEF; its weak point stays exposed for a turn.'),
  micro('mcPickpocket', 'Pickpocket', '🪙', 'Infiltration: steal an unequipped pack item or spare weapon (55% + speed difference ×2).'),
  micro('mcTunnelTravel', 'Micro Tunnel', '🕳', 'From a Micro Tunnel: crawl under the terrain to any other Micro Tunnel. Doesn\'t use your action.', { grantedBy: ANYONE }),
  micro('mcMushroomLaunch', 'Mushroom Bounce', '🍄', 'From a Giant Mushroom: a Micro unit is launched 2–4 spaces.', { grantedBy: ANYONE }),
  micro('mcPacciLaunch', 'Pacci Launch', '⤴', 'From a Pacci Hole, with the Cane of Pacci (yours or an adjacent ally\'s): launch 2–4 spaces.', { grantedBy: ANYONE }),
  micro('mcWindCrestWarp', 'Wind Crest', '🌬', 'With the Ocarina of Wind, from a Wind Crest: travel to any other Wind Crest.', { grantedBy: ANYONE }),
  micro('mcDigWall', 'Dig Through', '⛏', 'With Mole Mitts, next to a Soft Earth Wall: dig through it.', { grantedBy: ANYONE }),
  micro('mcBurnWeb', 'Burn Spiderweb', '🔥', 'With fire (a Flame Lantern or a fire weapon), burn away Spiderwebs within 2. Doesn\'t use your action.', { grantedBy: ANYONE, freeAction: true }),
  // ── Four Sword (section 11) ──
  q('fourSwordSplit', 'Four Sword Split', 20, 'With an awakened Picori Blade (two Elements or more; on a Duplication Tile it costs nothing): create 1–3 magical duplicates (40% of your max HP, 60% of your STR, MAG and SKL) for 3 turns. They move, attack and surround, but can\'t use items, trade, or split.',
    { grantedBy: { skill: 'fourSwordHero', weapons: ['whiteSwordTwo', 'whiteSwordThree', 'fourSword'] }, icon: '⚔', oncePerBattle: true }),
  q('ezloCapForm', 'Cap Form', 0, 'Ezlo becomes the Minish Cap (Magical Companion) for the rest of the battle.', { grantedBy: { templates: ['ezloMinish'] }, freeAction: true, perTurn: true }),
  q('ezloMinishForm', 'Minish Form', 0, 'Ezlo returns to his true Minish form (Minish Sage).', { grantedBy: { templates: ['ezloCap'] }, freeAction: true, perTurn: true }),
  // ── Personal abilities ──
  p('lightForceBarrier', 'Light Force', 10, 'Allies within 2 gain +6 RES and recover 15% HP; dark magic is repelled.', ['zeldaMC'], { target: 'allies', radius: 2, heal: { pct: 0.15 }, buff: { id: 'lightForceBarrier', name: 'Light Force', turns: 2, stats: { res: 6 } }, tags: ['sacred'] }, { cooldown: 3 }),
  p('vaatiCurse', 'Petrifying Curse', 12, 'A curse of stone on a foe within 3: MAG-based damage and Stunned.', ['vaatiHylian'], { target: 'foe', range: [1, 3], dmg: { stat: 'mag', base: 4, vs: 'res', element: 'dark' }, status: { kind: 'stun', turns: 1, chance: 60 } }, { cooldown: 3 }),
  p('royalDecree', 'Royal Decree', 6, 'Allies within 3 gain +2 STR and DEF for 2 turns.', ['kingDaltus'], { target: 'allies', radius: 3, buff: { id: 'royalDecree', name: 'Royal Decree', turns: 2, stats: { str: 2, def: 2 } } }, { cooldown: 3 }),
  p('royalRequisition', 'Royal Requisition', 6, 'Supplies from the royal stores: allies within 2 recover 20% HP. Once per battle.', ['potho'], { target: 'allies', radius: 2, heal: { pct: 0.2 } }, { oncePerBattle: true }),
  p('inspiringVerseAct', 'Ode to Courage', 8, 'Allies within 2 gain +3 SKL and +2 SPD for 2 turns.', ['percy'], { target: 'allies', radius: 2, buff: { id: 'odeToCourage', name: 'Ode to Courage', turns: 2, stats: { skl: 3, spd: 2 } } }, { cooldown: 3 }),
  p('windTribeTailwind', 'Tailwind', 8, 'Allies within 2 gain +2 MOV this turn.', ['gregal'], { target: 'allies', radius: 2, buff: { id: 'windTribeTailwind', name: 'Tailwind', turns: 1, stats: { mov: 2 } } }, { cooldown: 2 }),
  // ── Sword techniques (section 8): the existing Spin Attack, Great Spin, Downward Thrust and Sword Beam, and the new ones ──
  tech('rollAttack', 'Roll Attack', 5, 'Roll toward the enemy, then strike: +2 Might, +15 Hit.', { might: 2, hit: 15 }),
  tech('rockBreakerMC', 'Rock Breaker', 4, 'A smashing blow that breaks rocks and damages armour: double Might against armoured units, constructs and stone.', { effective: ['armored', 'construct', 'stone'] }),
  p('dashAttack', 'Dash Attack', 0, 'With Pegasus Boots: charge up to 4 spaces at an enemy and strike it (STR + 6 vs DEF).', [], { target: 'foe', range: [1, 4], move: true, dmg: { stat: 'str', base: 6, weapon: true } },
    { kind: 'technique', sta: 7, weaponTypes: ['sword'], hidden: true, area: true, grantedBy: undefined }),
  p('perilBeam', 'Peril Beam', 0, 'Below 25% HP: a strong sword projectile at an enemy 2–4 away (STR + 10 vs DEF).', [], { target: 'foe', range: [2, 4], dmg: { stat: 'str', base: 10, weapon: true }, belowHp: 0.25 },
    { kind: 'technique', sta: 5, weaponTypes: ['sword'], hidden: true, area: true, grantedBy: undefined }),
  // Enhancements (passive once learned).
  q('fasterSpin', 'Faster Spin', 0, 'Passive: Spin Attack costs 2 less STA.', { hidden: true }),
  q('fasterSplit', 'Faster Split', 0, 'Passive: Four Sword Split costs 25% less MP.', { hidden: true }),
  q('longerGreatSpin', 'Longer Great Spin', 0, 'Passive: Great Spin reaches 1 space further (3).', { hidden: true }),
  // ── Boss and monster abilities (enemies use them on their own) ──
  p('crushingBounce', 'Crushing Bounce', 6, 'Bounces down on every enemy next to it (STR + 4 vs DEF).', ['bigGreenChuchu', 'bigBlueChuchu'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4 } }, { cooldown: 3 }),
  p('bodyRegeneration', 'Body Regeneration', 8, 'Regrows its gel: recovers 25% HP.', ['bigGreenChuchu', 'bigBlueChuchu'], { target: 'self', heal: { pct: 0.25 } }, { cooldown: 4 }),
  p('vacuumInhale', 'Vacuum Inhale', 6, 'Inhales a foe within 3, pulling it 2 spaces closer.', ['bigOctorok'], { target: 'foe', range: [1, 3], pull: 2 }, { cooldown: 2 }),
  p('octorokInk', 'Ink Cloud', 8, 'Blinds every foe within 2 for 2 turns.', ['bigOctorok'], { target: 'foes', radius: 2, status: { kind: 'blind', turns: 2, chance: 70 } }, { cooldown: 3 }),
  p('volcanicEruption', 'Volcanic Eruption', 10, 'Lava rains on every foe within 2 (MAG + 6 fire vs RES).', ['gleerok'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'fire' } }, { cooldown: 3 }),
  p('mechanicalSlam', 'Mechanical Slam', 8, 'Both hands slam down on every foe within 1 (STR + 6 vs DEF).', ['mazaal'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 6 } }, { cooldown: 3 }),
  p('gyorgWingGust', 'Wing Gust', 6, 'A beat of her wings pushes every foe within 2 back a space.', ['gyorgFemale'], { target: 'foes', radius: 2, push: 1, dmg: { stat: 'str', base: 0 } }, { cooldown: 2 }),
  p('magicalTeleport', 'Magical Teleport', 6, 'Vanish and reappear on a space within 5.', ['vaatiReborn'], { target: 'tile', range: [2, 5], move: true }, { cooldown: 2 }),
  p('windCataclysm', 'Wind Cataclysm', 14, 'A storm of dark wind strikes every foe within 3 (MAG + 4 vs RES).', ['vaatisWrath'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 4, vs: 'res' } }, { cooldown: 4 }),
  p('crawlingCharge', 'Crawling Charge', 4, 'Charges at a foe within 3 (STR + 3 vs DEF).', ['madderpillar'], { target: 'foe', range: [1, 3], move: true, dmg: { stat: 'str', base: 3 } }, { cooldown: 2 }),
  p('spinyGelRecovery', 'Gel Recovery', 4, 'Recovers 25% HP.', ['spinyChuchu'], { target: 'self', heal: { pct: 0.25 } }, { cooldown: 3 }),
  p('defensiveStance', 'Defensive Stance', 0, '+6 DEF for 2 turns.', ['silverDarknut'], { target: 'self', buff: { id: 'defensiveStance', name: 'Defensive Stance', turns: 2, stats: { def: 6 } } }, { cooldown: 3 }),
  p('lungingThrust', 'Lunging Thrust', 4, 'A lunge at a foe 1–2 away (STR + 5 vs DEF).', ['redDarknut'], { target: 'foe', range: [1, 2], move: true, dmg: { stat: 'str', base: 5 } }, { cooldown: 2 }),
  p('executionStrike', 'Execution Strike', 6, 'A killing blow on an adjacent foe (STR + 8 vs DEF).', ['blackKnight'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 8 } }, { cooldown: 3 }),
];

/** Abilities handled by engine/minish.ts castMinish. */
export const MN_SPECIAL = ['fourSwordSplit', 'ezloCapForm', 'ezloMinishForm', 'fasterSpin', 'fasterSplit', 'longerGreatSpin'];
/** Sword techniques the Swordmaster Dojo teaches (existing ones reused). */
export const DOJO_TECHNIQUES = ['rollAttack', 'dashAttack', 'rockBreakerMC', 'perilBeam', 'downwardThrust', 'greatSpin', 'fasterSpin', 'fasterSplit', 'longerGreatSpin'];
