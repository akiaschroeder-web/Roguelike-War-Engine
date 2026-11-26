import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (engine/wild.ts castWild). */
const p = (id: string, name: string, mp: number, desc: string, wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, ...extra });
/** A battlefield action anyone can take where it applies. */
const act = (id: string, name: string, icon: string, desc: string, wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, desc, wild, ...extra });
const SLATE = { gear: ['sheikahSlate', 'purahPad'] };
const ARM = { gear: ['zonaiArm'], templates: ['heroOfTheWild', 'rauruZonai'] };
const sacred = ['sacred'] as const;
const CHARGERS = ['heroOfTheWild', 'urbosa', 'riju', 'sidon', 'daruk', 'yunobo', 'yigaBlademaster', 'buliara', 'kingRhoam', 'mineruConstruct', 'teba', 'sooga', 'ganondorfWild', 'ganondorfWildBoss', 'lynel', 'phantomGanondorf'];

export const ABILITIES: AbilityDef[] = [
  // ── Charged Attack (section 1; weapon-specific heavy attack) ──
  ab({ id: 'chargedAttack', name: 'Charged Attack', kind: 'technique', mp: 0, sta: 6, weaponTypes: ['sword', 'lance', 'axe', 'hammer'], grantedBy: { templates: CHARGERS },
    desc: 'Weapon-specific heavy attack. One-handed sword: a spin that also hits every enemy next to you (half damage) · two-handed: +6 Might and ignores 25% DEF · spear: a flurry of thrusts (strikes twice at 70%). Sets off Urbosa\'s Fury and the Windcleaver.', might: 2 }),
  // ── Sheikah Slate runes (section 17) ──
  p('remoteBombRound', 'Remote Bomb (Round)', 0, 'Roll a bomb to a space within 4 and detonate it: 10 damage in a small blast (Remote Bomb+: 14, bigger blast, recharges faster). Breaks cracked walls and ore.',
    { target: 'tile', range: [1, 4], radius: 1, dmg: { stat: 'str', base: 10, vs: 'def' } }, { grantedBy: SLATE, cooldown: 2 }),
  p('remoteBombCube', 'Remote Bomb (Cube)', 0, 'Set a cube bomb within 3: 12 damage in a small blast.', { target: 'tile', range: [1, 3], radius: 1, dmg: { stat: 'str', base: 12, vs: 'def' } }, { grantedBy: SLATE, cooldown: 2 }),
  p('magnesis', 'Magnesis', 2, 'Grab metal: disarm an enemy within 4 whose weapon or shield is metal (or pull it 2 spaces), or haul a metal object.', { target: 'foe', range: [1, 4], pull: 2 }, { grantedBy: SLATE, cooldown: 2 }),
  p('stasis', 'Stasis', 2, 'Freeze an object in time: a machine, vehicle or construct within 4 is Stunned for a turn (Stasis+: any enemy).', { target: 'foe', range: [1, 4], status: { kind: 'stun', turns: 1 } }, { grantedBy: SLATE, cooldown: 3 }),
  p('cryonis', 'Cryonis', 2, 'Raise an ice pillar from water within 3: the space becomes walkable ice for 4 turns.', { target: 'tile', range: [1, 3], terrain: 'frozenWater', terrainTurns: 4 }, { grantedBy: SLATE, freeAction: true, perTurn: true }),
  p('camera', 'Camera', 0, 'Photograph an enemy within 6 for the Compendium: it is analyzed (allies +10 Hit against it).', { target: 'foe', range: [1, 6] }, { grantedBy: SLATE, freeAction: true, perTurn: true }),
  p('sheikahSensor', 'Sheikah Sensor', 0, 'Detect objectives: reveals hidden enemies, traps, dig spots and Korok puzzles within 8.', { target: 'self', reveal: 8 }, { grantedBy: SLATE, freeAction: true, perTurn: true }),
  p('masterCycleZeroRune', 'Master Cycle Zero', 0, 'Summon Master Cycle Zero (once the rune is unlocked): +6 MOV and mountains passable for 3 turns.', { target: 'self', buff: { id: 'cycleZero', name: 'Master Cycle Zero', turns: 3, stats: { mov: 6 } } },
    { grantedBy: SLATE, oncePerBattle: true }),
  // ── Zonai Arm (section 17) ──
  p('ultrahand', 'Ultrahand', 0, 'Lift a log, barrel or platform next to you and put it down within 3: a log or platform bridges water, chasms and lava; a barrel is set where it can be blown up.',
    { target: 'tile', range: [1, 3] }, { grantedBy: ARM }),
  p('fuse', 'Fuse', 0, 'Fuse a throwable from your pack onto your arrows (3 shots with its effect) or your weapon (3 strikes) — or fuse a rock or log lying next to you (+4 Might this battle).', { target: 'self' }, { grantedBy: ARM }),
  p('ascend', 'Ascend', 0, 'Rise straight up through an overhead surface: move onto a cliff, mountain, tall tree, tower or wall-top space within 4 (instead of walking).', { target: 'tile', range: [1, 4], move: true }, { grantedBy: ARM, freeAction: true, perTurn: true }),
  p('recall', 'Recall', 2, 'Reverse something\'s recent movement: an enemy or ally within 4 goes back to where it started its last turn (or a Falling Ruin rises into a platform).', { target: 'foe', range: [1, 4] }, { grantedBy: ARM, cooldown: 2 }),
  p('autobuild', 'Autobuild', 0, 'Recreate a saved construction: build a vehicle from an unlocked blueprint next to you for this battle (10 energy).', { target: 'tile', range: [1, 1] }, { grantedBy: ARM, oncePerBattle: true }),
  // ── Zelda ──
  p('sealingLight', 'Sealing Light', 8, 'Massive sacred damage (MAG + 10 vs RES) to an enemy within 4 — double against corrupted, Malice, Gloom and demonic foes.', { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 10, vs: 'res', element: 'light', sacred: true }, tags: [...sacred] }, { cooldown: 2 }),
  p('sacredProtection', 'Sacred Protection', 5, 'A barrier on an ally within 3 that absorbs 15 damage.', { target: 'ally', range: [0, 3], shield: 15, tags: [...sacred] }),
  p('ancientResearch', 'Ancient Research', 2, 'Reveals a machine\'s weaknesses: an enemy within 6 is Exposed for 3 turns and analyzed (+15 Hit; machines take +25% damage).', { target: 'foe', range: [1, 6], status: { kind: 'exposed', turns: 3 } }, { freeAction: true, perTurn: true }),
  p('lightOfRestoration', 'Light of Restoration', 6, 'You and allies within 2 are purified: Gloom lifted (max HP restored) and Malice cleansed.', { target: 'allies', radius: 2, purify: true, tags: [...sacred] }, { cooldown: 2 }),
  p('recallBlessing', 'Recall Blessing', 4, 'An ally within 4 returns to where it started this turn and can move again.', { target: 'ally', range: [1, 4] }, { perTurn: true }),
  p('draconification', 'Draconification', 0, 'Swallow a Secret Stone (Light or Time must be worn) and become the Light Dragon. Irreversible — only a special sacred event can undo it.', { target: 'self' }, { oncePerBattle: true }),
  // ── The Light Dragon ──
  p('sacredBreathAbility', 'Sacred Breath', 8, 'Sacred breath on an enemy within 5 and those next to it (MAG + 12, light).', { target: 'foe', range: [1, 5], radius: 1, dmg: { stat: 'mag', base: 12, vs: 'res', element: 'light', sacred: true }, tags: [...sacred] }),
  p('healingWind', 'Healing Wind', 8, 'Allies within 3 recover 25% HP and 5 Gloom.', { target: 'allies', radius: 3, heal: { pct: 0.25 }, purify: true, tags: [...sacred] }, { cooldown: 2 }),
  p('divineFlight', 'Divine Flight', 4, '+4 MOV and +20 Avoid for 2 turns.', { target: 'self', buff: { id: 'divineFlight', name: 'Divine Flight', turns: 2, stats: { mov: 4 } } }),
  p('restorativeScales', 'Restorative Scales', 6, 'Drop scales on a space within 4: it and the spaces around it become Sacred Light (heals 10% a turn) for 3 turns.', { target: 'tile', range: [1, 4], radius: 1, terrain: 'sacredLight', terrainTurns: 3, tags: [...sacred] }),
  // ── Ganondorf ──
  p('gloomBlade', 'Gloom Blade', 4, 'A Gloom-wreathed strike on an adjacent enemy (STR + weapon + 6) that steals 6 max HP.', { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 6, vs: 'def', weapon: true }, gloom: 6, tags: ['gloom'] }),
  p('demonKingsSpear', "Demon King's Spear", 5, 'A long Gloom spear thrust (range 1–3): STR + 8, ignores 40% DEF.', { target: 'foe', range: [1, 3], dmg: { stat: 'str', base: 8, vs: 'def', pierce: 0.4 }, gloom: 2, tags: ['gloom'] }, { cooldown: 2 }),
  p('gloomBarrageAbility', 'Gloom Barrage', 8, 'A storm of Gloom projectiles on an enemy within 5 and its neighbours (MAG + 4, Gloom 3 each).', { target: 'foe', range: [1, 5], radius: 1, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'dark' }, gloom: 3, tags: ['gloom'] }),
  p('perfectEvasion', 'Perfect Evasion', 4, 'Until your next turn, the first melee attack against you misses and you counter at full strength.', { target: 'self', buff: { id: 'perfectEvasion', name: 'Perfect Evasion', turns: 1 } }, { cooldown: 2 }),
  p('phantomLegion', 'Phantom Legion', 12, 'Summon two Phantom Ganondorfs next to you for this battle.', { target: 'self', summon: 'phantomGanondorf' }, { oncePerBattle: true }),
  p('demonDragonForm', 'Secret Stone: Demon Dragon', 0, 'Swallow the Secret Stone of Darkness (it must be worn) and become the Demon Dragon. Irreversible but for a special sacred event. Enemy Ganondorf does it below half HP.', { target: 'self' }, { oncePerBattle: true }),
  // ── The Demon Dragon ──
  p('gloomMeteor', 'Gloom Meteor', 12, 'A meteor of Gloom on a space within 2–6: MAG + 10 fire in a wide blast, Gloom 4, and the ground becomes Gloom.', { target: 'tile', range: [2, 6], radius: 2, dmg: { stat: 'mag', base: 10, vs: 'res', element: 'fire' }, gloom: 4, terrain: 'gloom', tags: ['gloom'] }, { cooldown: 2 }),
  p('demonicBreathAbility', 'Demonic Breath', 8, 'Burning Gloom breath on an enemy within 4 (MAG + 8 fire, Gloom 5).', { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 8, vs: 'res', element: 'fire' }, gloom: 5, tags: ['gloom'] }),
  p('corruptingFlight', 'Corrupting Flight', 4, '+3 MOV for 2 turns, trailing Gloom.', { target: 'self', buff: { id: 'corruptingFlight', name: 'Corrupting Flight', turns: 2, stats: { mov: 3 } }, tags: ['gloom'] }),
  p('calamityDive', 'Calamity Dive', 10, 'Dive onto an enemy within 5: land next to it and strike (STR + 10, also hits its neighbours).', { target: 'foe', range: [1, 5], radius: 1, move: true, dmg: { stat: 'str', base: 10, vs: 'def' }, gloom: 2 }, { cooldown: 3 }),
  // ── Calamity Ganon ──
  p('ancientLaserCalamity', 'Ancient Laser', 8, 'A Guardian laser at an enemy within 2–7 (MAG + 10 fire) that leaves Malice.', { target: 'foe', range: [2, 7], dmg: { stat: 'mag', base: 10, vs: 'res', element: 'fire' }, status: { kind: 'malice', turns: 2, chance: 60 }, tags: ['mechanical'] }),
  p('maliceEruption', 'Malice Eruption', 10, 'Malice bursts from the ground around you: enemies within 2 take MAG + 4 and are corrupted by Malice.', { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'dark' }, status: { kind: 'malice', turns: 3 } }, { cooldown: 2 }),
  p('calamityCleaverAbility', 'Calamity Cleaver', 6, 'A sweeping cleave at every adjacent enemy (STR + 6).', { target: 'foes', radius: 1, dmg: { stat: 'str', base: 6, vs: 'def' } }),
  p('elementalBarrageAbility', 'Elemental Barrage', 10, 'Three elemental blasts (fire, ice, lightning) at an enemy within 5 (MAG ÷ 2 + 4 each).', { target: 'foe', range: [1, 5], dmg: { stat: 'mag', base: 4, vs: 'res', hits: 3 } }),
  p('guardianCorruption', 'Guardian Corruption', 12, 'Malice seizes an enemy machine within 5 (Guardian, construct, vehicle, Divine Beast): it fights for you for 2 turns.', { target: 'foe', range: [1, 5], tags: ['mechanical'] }, { cooldown: 3 }),
  p('calamityForm', 'Calamity Form', 0, 'Below half HP: become Dark Beast Ganon for the rest of the battle.', { target: 'self', belowHp: 0.5 }, { oncePerBattle: true }),
  // ── Dark Beast Ganon ──
  p('calamityBeamAbility', 'Calamity Beam', 12, 'A beam of Malice at an enemy within 3–9 (MAG + 14), corrupting it.', { target: 'foe', range: [3, 9], dmg: { stat: 'mag', base: 14, vs: 'res' }, status: { kind: 'malice', turns: 2 } }, { cooldown: 2 }),
  p('maliceStampedeAbility', 'Malice Stampede', 10, 'Charge an enemy within 4: land next to it, trampling it and everything beside you (STR + 8).', { target: 'foe', range: [1, 4], radius: 1, move: true, dmg: { stat: 'str', base: 8, vs: 'def' } }, { cooldown: 2 }),
  p('corruptingPresence', 'Corrupting Presence', 6, 'Enemies within 3 are corrupted by Malice for 2 turns.', { target: 'foes', radius: 3, status: { kind: 'malice', turns: 2 } }),
  p('darkEruption', 'Dark Eruption', 10, 'Dark fire erupts around you: enemies within 2 take MAG + 6.', { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'dark' } }, { cooldown: 2 }),
  // ── Mipha ──
  p('healingWaters', 'Healing Waters', 5, 'Heal an ally within 2 (MAG + 10) and wash away harmful statuses.', { target: 'ally', range: [0, 2], heal: { stat: 'mag', base: 10 }, cleanse: true, tags: ['water'] }),
  p('lightscaleThrust', 'Lightscale Thrust', 3, 'A swift thrust at an enemy within 2 (STR + weapon + 4, water, ignores 20% DEF).', { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 4, vs: 'def', element: 'water', weapon: true, pierce: 0.2 }, tags: ['water'] }),
  p('aquaticDash', 'Aquatic Dash', 2, '+3 MOV this turn, swimming freely.', { target: 'self', buff: { id: 'seahorse', name: 'Aquatic Dash', turns: 1, stats: { mov: 3 } }, tags: ['water'] }, { freeAction: true, perTurn: true }),
  p('restorativeAura', 'Restorative Aura', 8, 'You and allies within 2 regenerate (10% a turn) for 3 turns.', { target: 'allies', radius: 2, status: { kind: 'regen', turns: 3 }, tags: ['water'] }, { cooldown: 3 }),
  // ── Daruk ──
  p('boulderBreakerStrike', 'Boulder Breaker', 4, 'A huge overhead smash on an adjacent enemy (STR + weapon + 8; +50% against armor and stone), breaking walls around it.', { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 8, vs: 'def', weapon: true } }),
  p('goronCharge', 'Goron Charge', 4, 'Roll at an enemy within 4: land next to it, strike (STR + 4) and knock it back.', { target: 'foe', range: [1, 4], move: true, push: 1, dmg: { stat: 'str', base: 4, vs: 'def' } }),
  p('protectiveDome', 'Protective Dome', 8, 'A dome of fire: you and adjacent allies take no damage until your next turn.', { target: 'allies', radius: 1, buff: { id: 'protectiveDome', name: 'Protective Dome', turns: 1, barrier: true } }, { cooldown: 3 }),
  p('seismicSlam', 'Seismic Slam', 8, 'Slam the ground: enemies within 2 take STR ÷ 2 + 6 and are Dazed.', { target: 'foes', radius: 2, dmg: { stat: 'str', base: 6, vs: 'def' }, status: { kind: 'dazed', turns: 1 } }, { cooldown: 2 }),
  // ── Revali ──
  p('revalisGale', "Revali's Gale", 0, 'An updraft (3 per battle): you or an adjacent ally fly for 2 turns (+2 MOV, Bullet Time).', { target: 'ally', range: [0, 1], charges: 3, buff: { id: 'aerial', name: "Revali's Gale", turns: 2, stats: { mov: 2 } }, tags: ['champion', 'wind'] }, { freeAction: true }),
  p('aerialVolley', 'Aerial Volley', 6, 'A volley at an enemy within 2–6: three arrows (bow Might + STR, 60% each).', { target: 'foe', range: [2, 6], dmg: { stat: 'str', base: 0, vs: 'def', weapon: true, hits: 3 } }),
  p('tripleShotRevali', 'Triple Shot', 4, 'Three arrows at once at an enemy within 2–5 (50% each).', { target: 'foe', range: [2, 5], dmg: { stat: 'str', base: 2, vs: 'def', weapon: true, hits: 3 } }),
  p('divingArrow', 'Diving Arrow', 4, 'Dive and shoot an enemy within 2–5: bow Might + STR + 6, can\'t miss.', { target: 'foe', range: [2, 5], dmg: { stat: 'str', base: 6, vs: 'def', weapon: true } }),
  p('windBarrage', 'Wind Barrage', 8, 'A barrage of wind on an enemy within 5 and those next to it: STR + 2, knocked back 1.', { target: 'foe', range: [1, 5], radius: 1, push: 1, dmg: { stat: 'str', base: 2, vs: 'def' }, tags: ['wind'] }, { cooldown: 2 }),
  // ── Urbosa ──
  p('thunderSlash', 'Thunder Slash', 4, 'A lightning-charged slash on an adjacent enemy (STR + weapon + 6, lightning, may Shock). Counts as a charged attack (Urbosa\'s Fury).', { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 6, vs: 'def', element: 'lightning', weapon: true }, status: { kind: 'shock', turns: 1, chance: 50 }, tags: ['lightning'] }),
  p('gerudoCounter', 'Gerudo Counter', 3, 'Until your next turn, melee attacks against you deal half damage and your counters +50%.', { target: 'self', buff: { id: 'gerudoCounter', name: 'Gerudo Counter', turns: 1 } }),
  p('lightningField', 'Lightning Field', 8, 'Lightning strikes every enemy within 2 (MAG + 6).', { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'lightning' }, status: { kind: 'shock', turns: 1, chance: 40 }, tags: ['lightning'] }, { cooldown: 2 }),
  p('scimitarDance', 'Scimitar Dance', 6, 'A whirling dance: two strikes on every adjacent enemy (STR ÷ 2 + 6 each).', { target: 'foes', radius: 1, dmg: { stat: 'str', base: 6, vs: 'def', hits: 2 } }),
  // ── Sidon ──
  p('royalTrident', 'Royal Trident', 4, 'A powerful trident strike at an enemy within 2 (STR + weapon + 6, water, ignores 20% DEF).', { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 6, vs: 'def', element: 'water', weapon: true, pierce: 0.2 }, tags: ['water'] }),
  p('waterShield', 'Water Shield', 4, "Water Sage's Vow (3-turn cooldown): a water barrier on you or an adjacent ally that blocks one attack completely.", { target: 'ally', range: [0, 1], buff: { id: 'waterBarrier', name: 'Water Barrier', turns: 3 }, tags: ['water', 'sage'] }, { cooldown: 3 }),
  p('tidalSlash', 'Tidal Slash', 4, 'A ranged water slash at an enemy within 2–4 (STR + 4). Discharging a water barrier you carry adds +8 and hits its neighbours too.', { target: 'foe', range: [2, 4], dmg: { stat: 'str', base: 4, vs: 'def', element: 'water' }, tags: ['water', 'sage'] }),
  p('aquaticRescue', 'Aquatic Rescue', 4, 'Pull an ally within 4 to a space next to you and heal it 10.', { target: 'ally', range: [1, 4], heal: { base: 10 }, tags: ['water'] }),
  // ── Yunobo ──
  p('flamingRoll', 'Flaming Roll', 4, "Yunobo's Charge (2-turn cooldown): roll at an enemy within 4, land next to it and strike (STR + 6, fire), smashing cracked walls and ore around it.", { target: 'foe', range: [1, 4], move: true, dmg: { stat: 'str', base: 6, vs: 'def', element: 'fire' }, tags: ['fire', 'sage'] }, { cooldown: 2 }),
  p('rockBreaker', 'Rock Breaker', 0, 'Smash an adjacent cracked wall, ore deposit, barrel or wall (with Goron strength), and collect what was inside.', { target: 'tile', range: [1, 1] }, { perTurn: true }),
  p('volcanicCharge', 'Volcanic Charge', 4, '+4 STR and fire attacks for 2 turns.', { target: 'self', buff: { id: 'volcanicCharge', name: 'Volcanic Charge', turns: 2, stats: { str: 4 } }, tags: ['fire'] }),
  p('goronGuard', 'Goron Guard', 4, '+6 DEF for 2 turns; adjacent allies +2 DEF.', { target: 'self', buff: { id: 'goronGuard', name: 'Goron Guard', turns: 2, stats: { def: 6 } } }),
  // ── Tulin ──
  p('precisionShot', 'Precision Shot', 3, 'A careful shot at an enemy within 2–7 (bow Might + STR + 4, +30 Hit, +20 Critical).', { target: 'foe', range: [2, 7], dmg: { stat: 'str', base: 4, vs: 'def', weapon: true } }),
  p('windGust', 'Wind Gust', 4, "Tulin's Gust (2-turn cooldown): allies within 3 ride the wind — +4 MOV for fliers, gliding and +2 MOV for everyone else, this turn.", { target: 'allies', radius: 3, buff: { id: 'tulinsGust', name: "Tulin's Gust", turns: 1, stats: { mov: 2 } }, tags: ['wind', 'sage'] }, { cooldown: 2 }),
  p('aerialPursuit', 'Aerial Pursuit', 2, '+3 MOV this turn, airborne (Bullet Time).', { target: 'self', buff: { id: 'aerial', name: 'Aerial Pursuit', turns: 1, stats: { mov: 3 } }, tags: ['wind'] }, { freeAction: true, perTurn: true }),
  p('eagleEye', 'Eagle Eye', 4, 'Reveal hidden enemies within 8; allies within 3 +10 Hit for 2 turns.', { target: 'allies', radius: 3, reveal: 8, buff: { id: 'eagleEye', name: 'Eagle Eye', turns: 2 } }, { cooldown: 2 }),
  // ── Riju ──
  p('twinScimitarStrike', 'Twin Scimitar Strike', 3, 'Two quick strikes on an adjacent enemy (STR + weapon + 2 each).', { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 2, vs: 'def', weapon: true, hits: 2 } }),
  p('lightningFieldRiju', 'Lightning Field', 4, "Riju's Lightning (3-turn cooldown): a field of lightning around you (radius 2) for 2 turns; allied projectile hits on enemies inside call down a lightning strike (+8, Shock).", { target: 'self', radius: 2, tags: ['lightning', 'sage'] }, { cooldown: 3 }),
  p('thunderbolt', 'Thunderbolt', 6, 'A bolt of lightning at an enemy within 5 (MAG + 8, may Shock).', { target: 'foe', range: [1, 5], dmg: { stat: 'mag', base: 8, vs: 'res', element: 'lightning' }, status: { kind: 'shock', turns: 1, chance: 50 }, tags: ['lightning'] }),
  p('gerudoRally', 'Gerudo Rally', 6, 'Allies within 3 gain +3 STR and SKL for 2 turns (Gerudo +5).', { target: 'allies', radius: 3, buff: { id: 'gerudoRally', name: 'Gerudo Rally', turns: 2, stats: { str: 3, skl: 3 } } }, { cooldown: 2 }),
  // ── Mineru and her Construct ──
  p('spiritTransfer', 'Spirit Transfer', 0, "Mineru's spirit moves into a mechanical body: possess an adjacent allied Mineru's Construct (it gains her power), or take the Construct form herself. Persistent while deployed.", { target: 'self', tags: ['zonai', 'sage'] }),
  p('leaveConstruct', 'Leave the Construct', 0, 'Mineru steps out of the Construct.', { target: 'self' }),
  p('constructControl', 'Construct Control', 4, 'An allied machine within 3 gains +4 STR, DEF and SKL for 3 turns.', { target: 'ally', range: [0, 3], buff: { id: 'constructControl', name: 'Construct Control', turns: 3, stats: { str: 4, def: 4, skl: 4 } }, tags: ['zonai', 'mechanical'] }),
  p('ancientKnowledgeMineru', 'Ancient Knowledge', 3, 'Machines within 6 are revealed and Exposed for 2 turns.', { target: 'foes', radius: 6, reveal: 6, status: { kind: 'exposed', turns: 2 }, tags: ['zonai', 'mechanical'] }),
  p('zonaiEnhancement', 'Zonai Enhancement', 5, 'An ally within 3 gains +5 damage with Zonai weapons and devices for 3 turns, and the Energy Cell +10.', { target: 'ally', range: [0, 3], buff: { id: 'zonaiEnhancement', name: 'Zonai Enhancement', turns: 3 }, tags: ['zonai'] }),
  // ── Rauru ──
  p('sacredBeam', 'Sacred Beam', 8, 'A beam of Zonai light at an enemy within 2–6 (MAG + 10, ignores 30% RES; +30% against the Gloomed).', { target: 'foe', range: [2, 6], dmg: { stat: 'mag', base: 10, vs: 'res', element: 'light', sacred: true, pierce: 0.3 }, tags: ['sacred', 'zonai'] }),
  p('lightBarrier', 'Light Barrier', 10, 'You and allies within 2 take no damage until your next turn.', { target: 'allies', radius: 2, buff: { id: 'lightBarrier', name: 'Light Barrier', turns: 1, barrier: true }, tags: ['sacred', 'zonai'] }, { cooldown: 3 }),
  p('divineArmAbility', 'Divine Arm', 5, 'A Zonai arm of light grabs an enemy within 3, pulls it next to you and strikes (MAG + 6, light).', { target: 'foe', range: [1, 3], pull: 3, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'light', sacred: true }, tags: ['sacred', 'zonai'] }),
  p('royalSeal', 'Royal Seal', 8, 'Seal an enemy within 3: Rooted and Silenced for 2 turns, and unable to transform.', { target: 'foe', range: [1, 3], status: { kind: 'root', turns: 2 }, buff: { id: 'sacredSeal', name: 'Royal Seal', turns: 2 }, tags: ['sacred'] }, { cooldown: 3 }),
  // ── Sonia ──
  p('soniasRecall', 'Recall', 3, 'Temporal Wisdom: an ally within 3 goes back to where it started this turn and can move again (once per round).', { target: 'ally', range: [1, 3], tags: ['sacred'] }, { freeAction: true, perTurn: true }),
  p('temporalRestoration', 'Temporal Restoration', 6, 'Turn back an ally\'s wounds: HP returns to what it was at the start of the turn (+5), and new harmful statuses fade.', { target: 'ally', range: [0, 3], heal: { base: 5 }, cleanse: true, tags: ['sacred'] }),
  p('timeBarrier', 'Time Barrier', 6, 'Time slows around you: enemies within 2 are slowed (−3 SPD, −1 MOV) for 2 turns.', { target: 'foes', radius: 2, buff: { id: 'timeSlow', name: 'Slowed', turns: 2, stats: { spd: -3, mov: -1 } }, tags: ['sacred'] }, { cooldown: 2 }),
  p('sacredGuidance', 'Sacred Guidance', 6, 'Allies within 3 gain +2 MAG and RES for 3 turns, and their cooldowns shorten by 1.', { target: 'allies', radius: 3, buff: { id: 'sacredGuidance', name: 'Sacred Guidance', turns: 3, stats: { mag: 2, res: 2 } }, tags: ['sacred'] }, { cooldown: 3 }),
  // ── Divine Beasts (section 10) ──
  p('divineBeastLaser', 'Divine Beast Laser', 20, 'Once per battle, after charging (from turn 3): a beam of ancient energy at an enemy within 2–8 (MAG + 18, ignores half its RES).', { target: 'foe', range: [2, 8], dmg: { stat: 'mag', base: 18, vs: 'res', pierce: 0.5, element: 'light' } }, { oncePerBattle: true }),
  p('deployTroops', 'Deploy Troops', 0, 'Let the first unit aboard out onto an adjacent space.', { target: 'tile', range: [1, 1] }, { freeAction: true, icon: '⬇', contextual: true }),
  p('restoringWaters', 'Restoring Waters', 10, 'Vah Ruta sprays healing water: allies within 3 recover 20% HP.', { target: 'allies', radius: 3, heal: { pct: 0.2 }, tags: ['water'] }, { cooldown: 2 }),
  p('eruptionBarrage', 'Eruption Barrage', 12, 'Volcanic artillery on a space within 2–6: STR + 8 fire in a wide blast, igniting the ground.', { target: 'tile', range: [2, 6], radius: 2, dmg: { stat: 'str', base: 8, vs: 'def', element: 'fire' }, tags: ['fire'] }, { cooldown: 2 }),
  p('updraftDeck', 'Updraft Deck', 6, 'Allies within 3 ride Medoh\'s updraft: airborne for 2 turns (+2 MOV).', { target: 'allies', radius: 3, buff: { id: 'aerial', name: 'Medoh\'s Updraft', turns: 2, stats: { mov: 2 } }, tags: ['wind'] }, { cooldown: 2 }),
  p('electricBarrier', 'Electric Barrier', 8, 'You and adjacent allies are wrapped in lightning for 2 turns: melee attackers are Shocked and take 4.', { target: 'allies', radius: 1, buff: { id: 'electric', name: 'Electric Barrier', turns: 2 }, tags: ['lightning'] }, { cooldown: 2 }),
  p('combinedBombardment', 'Combined Bombardment', 0, 'The Four Divine Beasts fire together: every enemy within 5 of any of them takes MAG ÷ 2 + 10.', { target: 'self' },
    { grantedBy: { templates: ['vahRuta', 'vahRudania', 'vahMedoh', 'vahNaboris'] }, oncePerBattle: true }),
  // ── Bosses ──
  p('mazDuplicates', 'Duplicates', 8, 'Monk Maz Koshia splits into two duplicates for this battle.', { target: 'self', summon: 'mazKoshia' }, { oncePerBattle: true }),
  p('mazGiantForm', 'Giant Form', 6, 'Grows to giant size (3) for 2 turns: +6 STR and DEF.', { target: 'self', buff: { id: 'giantForm', name: 'Giant Form', turns: 2, stats: { str: 6, def: 6 } } }, { oncePerBattle: true }),
  p('sludgeSurge', 'Sludge Form', 6, 'Swells into a sludge mass (size 3) for 2 turns, flooding the ground around it with sludge.', { target: 'self', radius: 2, terrain: 'sludge', terrainTurns: 4, buff: { id: 'giantForm', name: 'Sludge Form', turns: 2, stats: { def: 4 } } }, { oncePerBattle: true }),
  // ── Battlefield spaces (section 24): actions anyone can take where they apply ──
  act('boardTransport', 'Board', '⬆', 'Climb aboard an adjacent allied Divine Beast or vehicle with room.', { target: 'ally', range: [1, 1] }, { freeAction: true }),
  act('cookAtPot', 'Cook', '🍲', 'Cook at an adjacent Cooking Pot: you and adjacent allies recover 20% HP and shake off a harmful status.', { target: 'self' }),
  act('mineOre', 'Mine', '⛏', 'Break an adjacent ore deposit, Zonaite deposit or explosive barrel and collect the materials.', { target: 'tile', range: [1, 1] }),
  act('solveKorok', 'Korok Puzzle', '🌰', 'Solve the Korok puzzle you are standing on: Yahaha! A Korok Seed.', { target: 'self' }),
  act('activateTower', 'Activate Tower', '🗼', 'Activate the Sheikah or Skyview Tower you stand on: the fog lifts, hidden enemies are revealed, and a Skyview Tower launches allies within 1 into the air.', { target: 'self' }),
  act('enterShrine', 'Shrine', '⛩', 'Complete the shrine you stand on (or set the crystal on its pedestal): heals you, and a Spirit Orb or Light of Blessing awaits after the battle.', { target: 'self' }),
  act('useDispenser', 'Device Dispenser', '🎰', 'Feed an adjacent Zonai Device Dispenser: a random device capsule drops into your pack (once per dispenser).', { target: 'self' }),
  act('useTerminal', 'Zonai Terminal', '⌘', 'Activate an adjacent Zonai Terminal: allied machines gain +2 STR for 3 turns and the Energy Cell +10 (once).', { target: 'self' }),
  act('launchPlatform', 'Launch', '⏫', 'Launch from the platform (or updraft) you stand on: airborne for 2 turns, +3 MOV.', { target: 'self', buff: { id: 'aerial', name: 'Launched', turns: 2, stats: { mov: 3 } } }, { freeAction: true }),
];
