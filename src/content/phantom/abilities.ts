import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (engine/wild.ts castWild, which any pack can use). */
const p = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, grantedBy: { templates }, ...extra });
/** A personal ability with a special effect (engine/phantom.ts castPhantom). */
const q = (id: string, name: string, mp: number, desc: string, templates: string[], extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: { templates }, ...extra });
/** A battlefield action anyone can take where it applies (shown as its own button). */
const act = (id: string, name: string, icon: string, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, desc, ...extra });

/** The Phantom Hourglass's four abilities and their time costs (the army's shared reserve). */
export const HOURGLASS_COSTS: Record<string, number> = { timeFreeze: 5, frozenBattlefield: 15, temporalEscape: 8, sacredOpening: 5 };

export const ABILITIES: AbilityDef[] = [
  // ── The Phantom Hourglass (shared: any unit, while the army holds the Hourglass and it has time) ──
  act('timeFreeze', 'Time Freeze', '⏸', 'Phantom Hourglass (5 time): enemies within 3 are frozen until your phase ends — they can\'t counterattack, and Phantoms and Bellum lose their protection. Bosses resist (only those within 2).'),
  act('frozenBattlefield', 'Frozen Battlefield', '⌛', 'Phantom Hourglass (15 time): every ordinary enemy skips the next enemy phase. Bosses resist long freezes.'),
  act('temporalEscape', 'Temporal Escape', '↩', 'Phantom Hourglass (8 time): slip out of time and reappear on a free space up to 4 away — no one can strike at you as you go. Doesn\'t use your action.', { freeAction: true }),
  act('sacredOpening', 'Sacred Opening', '✦', 'Phantom Hourglass (5 time): expose an enemy within 4 for 2 turns — Phantoms can be struck from any side, and Bellum\'s defenses fall.'),
  // ── Named characters ──
  q('cielaTimeStop', 'Time Stop', 8, 'Stop time for an ally within 4 who has acted: it can move and act again, and its next attack draws no retaliation.', ['ciela'], { cooldown: 3, icon: '⏱' }),
  q('revealOceanKing', 'True Form', 0, 'Oshus reveals his true form: the Ocean King (size 5, needs room). Once per battle; he stays the Ocean King until it ends.', ['oshus'], { oncePerBattle: true, icon: '🐋' }),
  p('tidalSurge', 'Tidal Surge', 10, 'The sea rises: enemies within 2 take MAG + 4 water damage and are pushed back 1.', ['oceanKing', 'oshus'],
    { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'water' }, push: 1, tags: ['water'] }, { cooldown: 3 }),
  p('powerFlare', 'Power Flare', 6, 'The Spirit of Power\'s fire on an enemy within 3: MAG + 6, may Burn.', ['leaf'],
    { target: 'foe', range: [1, 3], dmg: { stat: 'mag', base: 6, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 30 }, tags: ['fire', 'sacred'] }, { cooldown: 2 }),
  p('wisdomVeil', 'Wisdom Veil', 10, 'A barrier on an ally within 3: no damage until its next turn.', ['neri'],
    { target: 'ally', range: [0, 3], buff: { id: 'wisdomVeil', name: 'Wisdom Veil', turns: 1, barrier: true }, tags: ['sacred'] }, { cooldown: 4 }),
  p('treasureSense', 'Treasure Sense', 0, 'Linebeck smells treasure: reveals hidden enemies within 6. Doesn\'t use your action.', ['linebeck'],
    { target: 'allies', radius: 0, reveal: 6 }, { freeAction: true, perTurn: true, icon: '💰' }),
  p('cowardsRetreat', "Coward's Retreat", 0, '"You go on ahead!" Dash to a free space up to 4 away.', ['linebeck', 'bellumbeck'], { target: 'tile', range: [1, 4], move: true }, { sta: 0, cooldown: 3 }),
  p('pirateFlurry', 'Pirate Flurry', 0, 'Two quick cutlass strikes on an adjacent enemy (STR + weapon + 2 each, at 60%).', ['jolene', 'joleneBoss'],
    { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 2, vs: 'def', weapon: true, hits: 2 } }, { sta: 8, cooldown: 2 }),
  p('mermaidsSong', "Mermaid's Song", 8, 'Allies within 2 recover MAG + 6 HP.', ['joanne'], { target: 'allies', radius: 2, heal: { base: 6, stat: 'mag' }, tags: ['water'] }, { cooldown: 2 }),
  p('visionOfFate', 'Vision of Fate', 4, 'Astrid sees what is hidden: enemies within 8 are revealed. Doesn\'t use your action.', ['astrid'], { target: 'allies', radius: 0, reveal: 8 }, { freeAction: true, perTurn: true, icon: '🔮' }),
  q('fieldRepair', 'Field Repair', 4, 'Repair an adjacent allied vessel or construct: 30% HP and one knocked-out component.', ['eddo'], { cooldown: 2, icon: '🔧' }),
  p('sacredTempering', 'Sacred Tempering', 6, 'Temper an adjacent ally\'s weapon: +3 STR for 3 turns.', ['zauz'], { target: 'ally', range: [1, 1], buff: { id: 'tempered', name: 'Tempered', turns: 3, stats: { str: 3 } } }, { cooldown: 2 }),
  q('goronRoll', 'Goron Roll', 0, 'Roll up to 4 spaces in a straight line: the first enemy in the way takes STR + 6 (from behind) and you come to rest beyond it if there is room.', ['gongoron', 'biggoronGoronIsland'],
    { sta: 6, cooldown: 2, icon: '🪨' }),
  p('goronStomp', 'Goron Stomp', 0, 'A belly-flop: enemies adjacent take STR + 4 and may be Stunned.', ['biggoronGoronIsland'],
    { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4, vs: 'def' }, status: { kind: 'stun', turns: 1, chance: 25 } }, { sta: 8, cooldown: 3 }),
  q('cobbleConstruct', 'Royal Engineering', 10, 'Raise a temporary Cobble construct next to you for the rest of the battle.', ['kingMutoh', 'kingMutohBoss'], { oncePerBattle: true, icon: '🗿' }),
  p('knightsWall', "Knight's Wall", 0, 'You and adjacent allies gain +3 DEF for 2 turns.', ['bremeur'], { target: 'allies', radius: 1, buff: { id: 'knightsWall', name: "Knight's Wall", turns: 2, stats: { def: 3 } } }, { sta: 6, cooldown: 3 }),
  p('royalChallenge', 'Royal Challenge', 0, 'A duelist\'s thrust: STR + weapon + 6 on an adjacent enemy.', ['doylan'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 6, vs: 'def', weapon: true } }, { sta: 6, cooldown: 2 }),
  p('trialStrike', 'Trial Strike', 0, 'A tested blow: STR + weapon + 4, ignoring 20% DEF.', ['max'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 4, vs: 'def', weapon: true, pierce: 0.2 } }, { sta: 5, cooldown: 2 }),
  // ── The Anouki Chief ──
  p('winterRally', 'Winter Rally', 8, 'You and allies within 2 gain +3 STR and SKL for 3 turns.', ['anoukiChief'], { target: 'allies', radius: 2, buff: { id: 'winterRally', name: 'Winter Rally', turns: 3, stats: { str: 3, skl: 3 } } }, { cooldown: 3 }),
  p('frostBarrier', 'Frost Barrier', 6, 'Raise a temporary wall of ice (3 turns) on a space within 3 and the spaces around it.', ['anoukiChief'], { target: 'tile', range: [1, 3], radius: 1, terrain: 'iceBlock', terrainTurns: 3 }, { cooldown: 3 }),
  p('chiefsJudgment', "Chief's Judgment", 4, 'Reveals hidden and disguised units within 4. Doesn\'t use your action.', ['anoukiChief'], { target: 'allies', radius: 0, reveal: 4 }, { freeAction: true, perTurn: true, icon: '⚖' }),
  q('frozenSanctuary', 'Frozen Sanctuary', 8, 'Allies within 3 who stand on snow or ice (anywhere on the Isle of Frost) recover 20% HP.', ['anoukiChief'], { cooldown: 3, icon: '❄' }),
  // ── Yook ──
  p('frozenBreath', 'Frozen Breath', 6, 'A cone of freezing air at an enemy within 2 and those beside it: MAG + 4 ice, may Freeze.', ['yookIceBreather'],
    { target: 'foe', range: [1, 2], radius: 1, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'ice' }, status: { kind: 'freeze', turns: 1, chance: 30 } }, { cooldown: 2 }),
  // ── Warp Phantom Armor ──
  q('phantomWarp', 'Phantom Warp', 0, 'Teleport next to an enemy within 6. Once per battle.', [], { oncePerBattle: true, grantedBy: { gear: ['warpPhantomArmor'] }, icon: '🌀' }),
  // ── Bosses ──
  p('fireballBarrage', 'Fireball Barrage', 8, 'Fireballs at an enemy within 4 and those beside it (MAG + 2 fire).', ['blaaz'], { target: 'foe', range: [1, 4], radius: 1, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'fire' } }, { cooldown: 2 }),
  q('flameDivisionAbility', 'Flame Division', 6, 'Split into three flames (see Flame Division).', ['blaaz'], { cooldown: 4 }),
  p('burningTeleport', 'Burning Teleport', 4, 'Vanish in fire and reappear on a free space within 6.', ['blaaz'], { target: 'tile', range: [1, 6], move: true }, { cooldown: 2 }),
  p('infernalBlast', 'Infernal Blast', 12, 'Enemies within 2 take MAG + 6 fire damage and may Burn.', ['blaaz'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 40 } }, { cooldown: 3 }),
  q('tornadoSummoning', 'Tornado Summoning', 8, 'Raise two Whirlwinds near the enemy; enemies within 2 are blown back 1.', ['cyclok'], { cooldown: 3, icon: '🌪' }),
  p('windScythe', 'Wind Scythe', 6, 'A blade of wind at an enemy within 4: MAG + 4.', ['cyclok'], { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 4, vs: 'res' }, tags: ['wind'] }, { cooldown: 2 }),
  p('aerialDive', 'Aerial Dive', 6, 'Dive at an enemy within 3: STR + 6.', ['cyclok'], { target: 'foe', range: [1, 3], dmg: { stat: 'str', base: 6, vs: 'def' } }, { cooldown: 2 }),
  p('cycloneBarrage', 'Cyclone Barrage', 12, 'Winds batter every enemy within 3 twice (MAG/2 each) and push them back.', ['cyclok'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 2, vs: 'res', hits: 2 }, push: 1, tags: ['wind'] }, { cooldown: 3 }),
  p('pincerCrush', 'Pincer Crush', 0, 'STR + 6 on an adjacent enemy, ignoring 30% DEF.', ['crayk'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 6, vs: 'def', pierce: 0.3 } }, { sta: 8, cooldown: 2 }),
  q('invisiblePursuit', 'Invisible Pursuit', 4, 'Fade from sight (while the shell holds) and gain +2 MOV for a turn.', ['crayk'], { cooldown: 2 }),
  q('craykletSummoning', 'Crayklet Summoning', 8, 'Two Crayklets scuttle out to fight.', ['crayk'], { cooldown: 4 }),
  p('shellDefense', 'Shell Defense', 4, 'Withdraw into the shell: +8 DEF for 2 turns.', ['crayk'], { target: 'self', buff: { id: 'shellDefense', name: 'Shell Defense', turns: 2, stats: { def: 8 } } }, { cooldown: 3 }),
  p('cubusVolley', 'Cubus Volley', 6, 'A dark orb at an enemy within 4: MAG + 4 (it rebounds between the sisters).', ['cubusSister1', 'cubusSister2', 'cubusSister3', 'cubusSister4'],
    { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 4, vs: 'res', element: 'dark' } }, { cooldown: 2 }),
  q('combinedBarrage', 'Combined Barrage', 12, 'With all four sisters on the field: every enemy within 3 of any sister takes MAG/2 + 6. Once per battle.', ['cubusSister1', 'cubusSister2', 'cubusSister3', 'cubusSister4'], { oncePerBattle: true }),
  p('armoredCharge', 'Armored Charge', 0, 'Charge an enemy within 3: STR + 6, knocked back 1.', ['dongorongo'], { target: 'foe', range: [1, 3], dmg: { stat: 'str', base: 6, vs: 'def' }, push: 1 }, { sta: 8, cooldown: 2 }),
  p('tailSweep', 'Tail Sweep', 0, 'Adjacent enemies take STR + 2 and are knocked back.', ['dongorongo'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 2, vs: 'def' }, push: 1 }, { sta: 6, cooldown: 2 }),
  p('dongorongoFlameBreath', 'Flame Breath', 8, 'Fire at an enemy within 3 and those beside it: MAG + 4, may Burn.', ['dongorongo'],
    { target: 'foe', range: [1, 3], radius: 1, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 30 } }, { cooldown: 2 }),
  p('crushingStomp', 'Crushing Stomp', 0, 'Enemies within 2 take STR/2 + 4 twice and may be Stunned.', ['dongorongo', 'eox'], { target: 'foes', radius: 2, dmg: { stat: 'str', base: 4, vs: 'def', hits: 2 }, status: { kind: 'stun', turns: 1, chance: 25 } }, { sta: 10, cooldown: 3 }),
  p('stoneFist', 'Stone Fist', 0, 'A colossal punch: STR + 8 on an adjacent enemy.', ['eox'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 8, vs: 'def' } }, { sta: 8, cooldown: 2 }),
  p('earthquakeEox', 'Earthquake', 0, 'The ground heaves: enemies within 3 take STR/2 + 2 twice and may be Stunned.', ['eox'], { target: 'foes', radius: 3, dmg: { stat: 'str', base: 2, vs: 'def', hits: 2 }, status: { kind: 'stun', turns: 1, chance: 20 } }, { sta: 12, cooldown: 3 }),
  q('ancientReconstruction', 'Ancient Reconstruction', 0, 'Below half HP: rebuild a broken joint and recover 15% HP. Once per battle.', ['eox'], { oncePerBattle: true }),
  p('tentacleStrike', 'Tentacle Strike', 0, 'A tentacle lashes an enemy within 3: STR + 4.', ['bellum'], { target: 'foe', range: [1, 3], dmg: { stat: 'str', base: 4, vs: 'def' } }, { sta: 6, cooldown: 1 }),
  q('phantomEyeSummoning', 'Phantom Eye Summoning', 8, 'Two Phantom Eyes rise to watch the field.', ['bellum'], { cooldown: 4 }),
  q('lifeForceDrain', 'Life Force Drain', 10, 'Drain an enemy within 3: MAG + 6 against RES, and recover as much HP as you take.', ['bellum'], { cooldown: 2 }),
  p('spectralFlight', 'Spectral Flight', 4, 'Drift to a free space within 6.', ['bellum'], { target: 'tile', range: [1, 6], move: true }, { cooldown: 2 }),
  q('bellumPossession', 'Possession', 12, 'Possess an enemy within 3 (not a boss or commander): it fights for you for 2 turns. Linebeck becomes Bellumbeck.', ['bellum'], { cooldown: 4 }),
  p('maliciousRegeneration', 'Malicious Regeneration', 10, 'Recover 20% of your max HP.', ['bellum'], { target: 'allies', radius: 0, heal: { pct: 0.2 } }, { cooldown: 4 }),
  p('phantomSwordStrike', 'Phantom Sword', 0, 'STR + weapon + 6 on an adjacent enemy.', ['bellumbeck'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 6, vs: 'def', weapon: true } }, { sta: 8, cooldown: 2 }),
  p('spectralCounter', 'Spectral Counter', 4, 'Brace: +4 DEF and RES until your next turn.', ['bellumbeck'], { target: 'self', buff: { id: 'spectralCounter', name: 'Spectral Counter', turns: 1, stats: { def: 4, res: 4 } } }, { cooldown: 2 }),
  p('possessedCharge', 'Possessed Charge', 0, 'Charge an enemy within 4: STR + 5, knocked back 1.', ['bellumbeck'], { target: 'foe', range: [1, 4], dmg: { stat: 'str', base: 5, vs: 'def' }, push: 1 }, { sta: 8, cooldown: 2 }),
  q('lifeForceSlash', 'Life Force Slash', 8, 'STR + 4 on an adjacent enemy; recover half the damage as HP.', ['bellumbeck'], { cooldown: 2 }),
  // ── The Potion Shop Lady ──
  p('bitterTonic', 'Bitter Tonic', 6, 'An adjacent ally recovers MAG + 8 HP and is cured of poison, sleep and other ailments.', ['potionShopLady'], { target: 'ally', range: [0, 1], heal: { base: 8, stat: 'mag' }, cleanse: true }),
  q('wheelchairRush', 'Wheelchair Rush', 0, 'Roll up to 3 spaces in a straight line over flat ground; an enemy in the way takes STR + 4 and is pushed back.', ['potionShopLady'], { sta: 5, cooldown: 2, icon: '♿' }),
  q('quickRemedy', 'Quick Remedy', 0, 'Use the first healing item in your pack on an ally within 2 (Old Recipes: +30%). Doesn\'t use your action; once per battle.', ['potionShopLady'],
    { oncePerBattle: true, freeAction: true, icon: '🧪' }),
  // ── The Subrosians ──
  q('secretKeyOpen', 'Secret Key', 0, 'Open an adjacent Locked Door without a key.', ['rosa'], { contextual: true, icon: '🗝' }),
  q('subrosianDanceAct', 'Subrosian Dance', 4, 'Dance for an adjacent ally who has acted: it can act again.', ['subrosianDancer'], { cooldown: 3, icon: '💃' }),
  q('subrosianRepair', 'Master Smith', 0, 'Repair an adjacent ally\'s equipped weapon (all its uses back).', ['subrosianBlacksmith'], { sta: 4, cooldown: 2, icon: '⚒' }),
  q('sneakySwapAbility', 'Sneaky Swap', 0, 'Steal an adjacent enemy\'s unequipped pack item (or whatever is in its pockets).', ['subrosianThief'], { sta: 4, cooldown: 2, icon: '🫳' }),
  // ── Battlefield spaces ──
  act('strikeSunCrest', 'Strike the Sun Crest', '☀', 'Strike an adjacent Sun Crest: sacred mechanisms open — Locked Doors and Cracked walls within 4 give way, and a hidden treasure is revealed.'),
  act('activatePedestal', 'Place the Crystal', '🔷', 'Fit a crystal into an adjacent Crystal Pedestal: Power (+2 STR), Wisdom (+2 RES) or Courage (+2 SKL) for the whole army this battle.'),
  act('hammerLaunch', 'Hammer Launch', '🔨', 'Standing on a Hammer Launch Pad with a hammer (yours or an adjacent ally\'s): launch to a free space 2–4 away.'),
  act('stringTightrope', 'String a Tightrope', '🪢', 'Grappling Hook (with the Enhancement): from next to a Tightrope Post, string a tightrope across the gap to the post in line with it.'),
  act('cycloneWarpAct', 'Cyclone Warp', '🌀', 'With the Cyclone Slate, a unit on a Cyclone Warp Point is carried to another one.'),
];
