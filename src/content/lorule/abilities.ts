import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (engine/wild.ts castWild, which any pack can use). */
const p = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, grantedBy: templates.length ? { templates } : undefined, ...extra });
/** A personal ability with a special effect (engine/lorule.ts castLorule). */
const q = (id: string, name: string, mp: number, desc: string, extra: X = {}): AbilityDef => ab({ id, name, kind: 'personal', mp, desc, ...extra });
/** A stamina ability (STA instead of MP). */
const sta = (n: number): X => ({ sta: n });

export const ABILITIES: AbilityDef[] = [
  // ── Wall merging (section 7) and the battlefield spaces (section 10) ──
  q('wallMerge', 'Wall Merge', 5, 'Merge into an adjacent wall as a painting: you travel through walls (2 MP per wall space; ending a move on the ground emerges), can\'t be hit by ordinary melee, and pay 5 MP each turn to stay merged. Ordinary attacks are disabled while merged. Doesn\'t use your action.',
    { grantedBy: { skills: ['betweenWorlds'], gear: ['raviosBracelet'] }, icon: '🖼', contextual: true, freeAction: true }),
  q('wallEmerge', 'Emerge', 0, 'Step out of the wall onto an empty space next to it. Doesn\'t use your action.', { grantedBy: { everyone: true }, icon: '🚪', contextual: true, freeAction: true }),
  q('crackTravel', 'Wall Crack', 0, 'From a Wall Crack, slip through to the matching crack on the other side of the field (any other Wall Crack). Doesn\'t use your action.',
    { grantedBy: { everyone: true }, icon: '🌀', contextual: true, freeAction: true }),
  q('tornadoLiftAct', 'Tornado Lift', 0, 'From a Tornado Lift (or with the Tornado Rod), the wind throws you onto high ground up to 4 spaces away. Doesn\'t use your action.',
    { grantedBy: { everyone: true }, icon: '🌪', contextual: true, freeAction: true }),
  q('sandPillarLB', 'Sand Pillar', 6, 'Raise a pillar of sand on an empty space within 3 for 3 turns (an obstacle; with Osfala\'s rod or a Nice Sand Rod, in a cross for 5 turns).',
    { grantedBy: { weapons: ['sandRod', 'osfalasSandRod'] }, cooldown: 2 }),
  // ── Painting magic ──
  q('paintingPrison', 'Painting Prison', 15, 'Turn a foe within 3 into a painting for 3 turns (bosses 1): it can\'t move or attack and is immune to ordinary physical attacks. Freed by sacred magic, a painting dispel or the caster\'s defeat.',
    { grantedBy: { templates: ['yuga', 'yugaBoss', 'yugaGanon'] }, cooldown: 3 }),
  q('paintingDispel', 'Painting Dispel', 6, 'Free an ally within 2 from a painting (or a painted prisoner), and lift curses.', { cooldown: 1 }),
  q('darkWorldMerge', 'Dark World Merge', 8, 'Sink into the walls and resurface next to a wall near the enemy (within 6): immune to ordinary melee until the next turn.',
    { grantedBy: { templates: ['yugaGanon'] }, cooldown: 3 }),
  // ── Personal abilities ──
  p('hildasVeil', "Hilda's Veil", 10, 'Allies within 2 gain +5 RES and +2 DEF for 2 turns (with Hilda\'s Staff: +8 RES).', ['hilda'],
    { target: 'allies', radius: 2, buff: { id: 'hildasVeil', name: "Hilda's Veil", turns: 2, stats: { res: 5, def: 2 } } }, { cooldown: 3 }),
  p('merchantsLoan', "Merchant's Loan", 0, 'Lend an adjacent ally a better tool for a while: its equipped weapon hits harder (+3 STR and MAG) for 2 turns.', ['ravio'],
    { target: 'ally', range: [1, 1], buff: { id: 'merchantsLoan', name: "Merchant's Loan", turns: 2, stats: { str: 3, mag: 3 } } }, { cooldown: 2 }),
  p('mothersGift', "Mother's Gift", 12, 'Allied weapons and tools within 2 are briefly Nice: +4 STR and MAG for 2 turns.', ['motherMaiamai'],
    { target: 'allies', radius: 2, buff: { id: 'mothersGift', name: 'Nice!', turns: 2, stats: { str: 4, mag: 4 } } }, { cooldown: 3 }),
  p('sanctuaryBlessing', 'Sanctuary Blessing', 10, 'Allies within 1 recover 20% HP and gain +2 DEF for 2 turns.', ['seres'],
    { target: 'allies', radius: 1, heal: { pct: 20 }, buff: { id: 'sanctuaryBlessing', name: 'Sanctuary', turns: 2, stats: { def: 2 } }, tags: ['sacred'] }, { cooldown: 2 }),
  // ── Bosses (enemies use them on their own when a foe is in reach) ──
  p('yugaPaintStorm', 'Paint Storm', 10, 'Splashes of magic paint hit every foe within 2 (MAG + 2 dark vs RES).', ['yugaBoss'],
    { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'dark' } }, { cooldown: 3 }),
  p('windBlast', 'Wind Blast', 10, 'A blast of wind hits every foe within 2 and pushes them back (MAG + 3 vs RES).', ['margomill'],
    { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 3, vs: 'res' }, push: 1, tags: ['wind'] }, { cooldown: 3 }),
  p('spinningCharge', 'Spinning Charge', 0, 'Spins into every foe next to it (STR + 4 vs DEF).', ['margomill'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4 } }, { ...sta(6), cooldown: 2 }),
  p('rotatingDefense', 'Rotating Defense', 0, '+6 DEF for 2 turns.', ['margomill'], { target: 'self', buff: { id: 'rotatingDefense', name: 'Rotating Defense', turns: 2, stats: { def: 6 } } }, { ...sta(5), cooldown: 4 }),
  q('segmentRegeneration', 'Segment Regeneration', 15, 'Regrows a segment and recovers 15% HP.', { grantedBy: { templates: ['margomill'] }, cooldown: 4 }),
  p('gemstoneBarrage', 'Gemstone Barrage', 10, 'Gem shards fly at every foe within 3 (MAG + 4 vs DEF).', ['gemesaurKing'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 4, vs: 'def' } }, { cooldown: 3 }),
  p('crushingCharge', 'Crushing Charge', 0, 'Tramples every foe next to it (STR + 6 vs DEF).', ['gemesaurKing'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 6 } }, { ...sta(8), cooldown: 3 }),
  p('tailSweepLB', 'Tail Sweep', 0, 'Sweeps every foe next to it back a space (STR + 2 vs DEF).', ['gemesaurKing'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 2 }, push: 1 }, { ...sta(6), cooldown: 2 }),
  q('gemstoneRegrowth', 'Gemstone Regrowth', 15, 'The gem mask regrows (+25 points) and it recovers 10% HP.', { grantedBy: { templates: ['gemesaurKing'] }, cooldown: 5 }),
  p('crushingFist', 'Crushing Fist', 0, 'Slams every foe next to it (STR + 6 vs DEF).', ['knucklemaster'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 6 } }, { ...sta(8), cooldown: 3 }),
  p('graspHand', 'Grasp', 0, 'Grabs the foes next to it: Rooted for a turn (70%).', ['knucklemaster'], { target: 'foes', radius: 1, status: { kind: 'root', turns: 1, chance: 70 } }, { ...sta(6), cooldown: 3 }),
  p('sweepingPalm', 'Sweeping Palm', 0, 'Sweeps every foe within 1 back a space (STR + 2 vs DEF).', ['knucklemaster'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 2 }, push: 1 }, { ...sta(7), cooldown: 2 }),
  q('wallCrush', 'Wall Crush', 0, 'Smashes the walls within 2: wall-merged foes there are thrown out and take STR + 4 damage.', { grantedBy: { templates: ['knucklemaster'] }, sta: 10, cooldown: 3 }),
  p('shieldedSlash', 'Shielded Slash', 0, 'Slashes every foe next to it (STR + 3 vs DEF) and raises its shield (+4 DEF for a turn).', ['stalblind'],
    { target: 'foes', radius: 1, dmg: { stat: 'str', base: 3 }, buff: { id: 'shieldedSlash', name: 'Shield Up', turns: 1, stats: { def: 4 } } }, { ...sta(5), cooldown: 2 }),
  p('spectralBreath', 'Spectral Breath', 10, 'Ghostly fire on every foe within 2 (MAG + 3 dark vs RES).', ['stalblind'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'dark' } }, { cooldown: 3 }),
  q('detachHead', 'Detach Head', 15, 'Its head floats free as a temporary summon for 3 turns and attacks on its own.', { grantedBy: { templates: ['stalblind'] }, oncePerBattle: true }),
  p('undeadReassembly', 'Undead Reassembly', 12, 'Pulls its bones back together: recovers 30% HP.', ['stalblind'], { target: 'self', heal: { pct: 30 } }, { cooldown: 4 }),
  q('sandBurrow', 'Sand Burrow', 0, 'Burrows and erupts next to the nearest foe, without crossing the terrain between.', { grantedBy: { templates: ['zaganaga'] }, sta: 5, cooldown: 2 }),
  p('spikedSeedBarrage', 'Spiked Seed Barrage', 8, 'Seeds rain on every foe within 3 (MAG + 3 vs DEF).', ['zaganaga'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 3, vs: 'def', element: 'nature' } }, { cooldown: 3 }),
  p('rootGrasp', 'Root Grasp', 6, 'Roots burst from the sand under every foe within 2: Rooted for a turn (60%).', ['zaganaga'], { target: 'foes', radius: 2, status: { kind: 'root', turns: 1, chance: 60 } }, { cooldown: 3 }),
  q('sandstormLB', 'Sandstorm', 15, 'Whips up a sandstorm for 3 turns (−15 Hit for everyone) and scours every foe within 4 (MAG/2).', { grantedBy: { templates: ['zaganaga'] }, cooldown: 5 }),
  p('iceBeamLB', 'Ice Beam', 8, 'A freezing beam at every foe within 3 (MAG + 4 ice vs RES; Freeze 20%).', ['dharkstare'],
    { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'ice' }, status: { kind: 'freeze', turns: 1, chance: 20 } }, { cooldown: 3 }),
  p('frozenPrisonLB', 'Frozen Prison', 12, 'Encases every foe within 2 in ice: Frozen for a turn (45%).', ['dharkstare'], { target: 'foes', radius: 2, status: { kind: 'freeze', turns: 1, chance: 45 } }, { cooldown: 4 }),
  p('blizzardField', 'Blizzard Field', 15, 'A blizzard over every foe within 3 (MAG + 2 ice vs RES).', ['dharkstare'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'ice' } }, { cooldown: 4 }),
  q('iceShellRegeneration', 'Ice Shell Regeneration', 15, 'The frozen shell regrows to full.', { grantedBy: { templates: ['dharkstare'] }, cooldown: 4 }),
  p('lavaGeyser', 'Lava Geyser', 12, 'Lava erupts under every foe within 2 (MAG + 5 fire vs RES).', ['grinexx'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 5, vs: 'res', element: 'fire' } }, { cooldown: 3 }),
  p('shellSlam', 'Shell Slam', 0, 'Slams every foe next to it (STR + 5 vs DEF).', ['grinexx'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 5 } }, { ...sta(8), cooldown: 2 }),
  q('lavaSubmerge', 'Submerge', 0, 'Sinks into the lava (or the rock) and recovers 15% HP; hidden until it surfaces next turn.', { grantedBy: { templates: ['grinexx'] }, sta: 5, cooldown: 3 }),
  p('volcanicEruptionLB', 'Volcanic Eruption', 20, 'The volcano on its back erupts over every foe within 3 (MAG + 7 fire vs RES; Burn 30%).', ['grinexx'],
    { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 7, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 30 } }, { cooldown: 5 }),
  p('lightningBarrage', 'Lightning Barrage', 12, 'Bolts rain on every foe within 3 (MAG + 4 lightning vs RES).', ['yugaGanon'],
    { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'lightning' } }, { cooldown: 3 }),
  p('reflectedEnergy', 'Reflected Energy', 10, 'A painted mirror: magic attackers take half the damage they deal back, for 2 turns.', ['yugaGanon'],
    { target: 'self', buff: { id: 'lrReflect', name: 'Reflected Energy', turns: 2 } }, { cooldown: 4 }),
  p('triforceCataclysm', 'Triforce Cataclysm', 30, 'Below half HP: the stolen power of the Triforce strikes every foe within 4 (MAG + 10 vs RES). Once per battle.', ['yugaGanon'],
    { target: 'foes', radius: 4, dmg: { stat: 'mag', base: 10, vs: 'res' }, belowHp: 0.5 }, { oncePerBattle: true }),
  p('slidingCharge', 'Sliding Charge', 0, 'Slides into every foe next to it (STR + 5 vs DEF).', ['bigPengator'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 5 } }, { ...sta(6), cooldown: 2 }),
];

/** Abilities handled by engine/lorule.ts castLorule. */
export const LB_SPECIAL = ['wallMerge', 'wallEmerge', 'crackTravel', 'tornadoLiftAct', 'sandPillarLB', 'paintingPrison', 'paintingDispel', 'darkWorldMerge',
  'segmentRegeneration', 'gemstoneRegrowth', 'wallCrush', 'detachHead', 'sandBurrow', 'sandstormLB', 'iceShellRegeneration', 'lavaSubmerge'];
/** Boss abilities the enemy uses on its own (engine/abilities.ts enemyAutoTransform). */
export const LB_ENEMY_CASTS = ['triforceCataclysm', 'darkWorldMerge', 'detachHead', 'segmentRegeneration', 'gemstoneRegrowth', 'iceShellRegeneration', 'undeadReassembly',
  'volcanicEruptionLB', 'lightningBarrage', 'reflectedEnergy', 'yugaPaintStorm', 'windBlast', 'spinningCharge', 'rotatingDefense', 'gemstoneBarrage', 'crushingCharge', 'tailSweepLB',
  'crushingFist', 'graspHand', 'sweepingPalm', 'wallCrush', 'shieldedSlash', 'spectralBreath', 'sandBurrow', 'spikedSeedBarrage', 'rootGrasp', 'sandstormLB', 'iceBeamLB',
  'frozenPrisonLB', 'blizzardField', 'lavaGeyser', 'shellSlam', 'lavaSubmerge', 'slidingCharge'];
