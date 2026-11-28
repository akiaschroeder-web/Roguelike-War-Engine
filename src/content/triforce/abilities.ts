import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (engine/wild.ts castWild, which any pack can use). */
const p = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, grantedBy: templates.length ? { templates } : undefined, ...extra });
/** A personal ability with a special effect (engine/triforce.ts castTriforce). */
const q = (id: string, name: string, mp: number, desc: string, extra: X = {}): AbilityDef => ab({ id, name, kind: 'personal', mp, desc, ...extra });
/** A Totem action or battlefield action anyone can take (a button when usable). */
const act = (id: string, name: string, icon: string, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, desc, grantedBy: { everyone: true }, ...extra });
const sta = (n: number): X => ({ sta: n });

/** Totem actions: Command Points (before discounts) and how tall the Totem must be. */
export const TOTEM_CP: Record<string, number> = { tfTotemStack: 1, tfHeroThrow: 1, tfElevatedStrike: 1, tfTripleSpin: 2, tfTriforceAssault: 3, tfTotemGuard: 1 };

export const ABILITIES: AbilityDef[] = [
  // ── Totem formations (section 6) ──
  act('tfTotemStack', 'Totem Stack', '🗼', 'Climb onto an adjacent ally (or the top of their Totem): up to 3 tall on one space. The bottom unit moves the Totem at the lowest MOV; the top can reach elevated targets; middle units use ranged attacks and support. 1 CP; doesn\'t use your action.',
    { freeAction: true, perTurn: true }),
  act('tfTotemDrop', 'Hop Down', '⤵', 'Jump down from the Totem to an empty space next to it. Doesn\'t use your action.', { freeAction: true }),
  act('tfHeroThrow', 'Hero Throw', '🤾', 'The bottom of a Totem throws the top unit across a gap or onto high ground, up to 4 spaces. 1 CP; uses your action (the thrown unit can still act).', sta(4)),
  act('tfElevatedStrike', 'Elevated Strike', '⬆', 'From height 2 or 3: strike an enemy\'s otherwise unreachable weak point (adjacent; 2 spaces from height 3) for 150% damage, past armour and spinning shells. 1 CP.', sta(6)),
  act('tfTripleSpin', 'Triple Spin', '🌀', 'A 3-unit Totem spins at every level at once: every enemy next to it takes three strikes (STR + weapon vs DEF each). 2 CP; uses every member\'s action.', sta(6)),
  act('tfTriforceAssault', 'Tri Force Assault', '🔺', 'The three heroes (Green, Red, Blue) in one Totem — or all within 2 of one another — strike an enemy within 2 together: each hits for 130%. 3 CP; uses all three heroes\' actions.', sta(10)),
  act('tfTotemGuard', 'Totem Guard', '🛡', 'The bottom of a 2–3 unit Totem braces: every member gains +5 DEF and RES until your next turn, and the top can\'t be reached by melee. 1 CP.', sta(4)),
  // ── Tools and battlefield spaces (sections 4 and 7) ──
  act('tfGripshot', 'Gripshot', '🪝', 'With the Gripshot in your pack: pull yourself next to a Gripshot Target, or pull an ally or an enemy (size 2 or less) next to you, up to 4 spaces (Robo Wear: 6). Doesn\'t use your action.', { freeAction: true, perTurn: true }),
  q('tfWaterPillar', 'Water Pillar', 6, 'Raise a Water Pillar on a space within 3 (ground or water) for 3 turns: whoever stands on it is lifted (+1 height). Torrent Robe: 5 turns.', { grantedBy: { weapons: ['waterRod'] }, cooldown: 2, icon: '⛲' }),
  q('tfDapperSpin', 'Dapper Spin', 0, 'A flamboyant spin: every enemy within 2 takes 120% of STR + sword Might vs DEF.', { sta: 8, grantedBy: { gear: ['dapperSpinnerKit'] }, cooldown: 1, icon: '🎩' }),
  // ── Named characters ──
  p('runwayGrace', 'Runway Grace', 8, 'Allies within 2 gain +3 RES and +2 SPD for 2 turns.', ['styla'], { target: 'allies', radius: 2, buff: { id: 'runwayGrace', name: 'Runway Grace', turns: 2, stats: { res: 3, spd: 2 } } }, { cooldown: 3 }),
  p('hytopianDecree', 'Hytopian Decree', 0, 'Allies within 3 gain +2 STR and DEF for 2 turns.', ['kingTuft'], { target: 'allies', radius: 3, buff: { id: 'hytopianDecree', name: 'Hytopian Decree', turns: 2, stats: { str: 2, def: 2 } } }, { ...sta(6), cooldown: 3 }),
  q('expertTailoring', 'Expert Tailoring', 6, 'An ally within 1 (or herself): Fashion Curses and curses are lifted, and their clothing is enhanced (+3 DEF and RES for 2 turns).', { grantedBy: { templates: ['madameCouture'] }, cooldown: 1 }),
  // ── Lady Maud (section 1) ──
  q('fashionCurse', 'Fashion Curse', 12, 'An enemy within 4 loses its clothing bonuses (its outfit\'s stats and effects) for 3 turns.', { grantedBy: { templates: ['ladyMaud', 'ladyMaudBoss'] }, cooldown: 2 }),
  p('parasolBarrage', 'Parasol Barrage', 10, 'Magical projectiles: two bolts at an enemy within 4 (MAG + 2 vs RES each).', ['ladyMaud', 'ladyMaudBoss'],
    { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 2, vs: 'res', hits: 2 } }, { cooldown: 2 }),
  p('magicalReflection', 'Magical Reflection', 8, 'Reflects the next magical attacks: magic attackers take half the damage they deal back, for 2 turns.', ['ladyMaud', 'ladyMaudBoss'],
    { target: 'self', buff: { id: 'tfReflect', name: 'Magical Reflection', turns: 2 } }, { cooldown: 3 }),
  p('witchsEnsemble', "Witch's Ensemble", 15, '+6 MAG, DEF and RES for 3 turns.', ['ladyMaud', 'ladyMaudBoss'],
    { target: 'self', buff: { id: 'witchsEnsemble', name: "Witch's Ensemble", turns: 3, stats: { mag: 6, def: 6, res: 6 } } }, { cooldown: 5 }),
  q('grandCurse', 'Grand Curse', 25, 'Every enemy within 4: its equipment bonuses are halved for 2 turns (outfits stop working).', { grantedBy: { templates: ['ladyMaud', 'ladyMaudBoss'] }, cooldown: 5 }),
  // ── Monsters and bosses (enemies use them on their own) ──
  q('segmentLaunch', 'Segment Launch', 0, 'Launch a segment at an enemy 2–3 away (STR + 4 vs DEF); −2 DEF for the rest of the battle (three segments).', { sta: 5, grantedBy: { templates: ['hokkubokku'] }, cooldown: 1 }),
  p('spikedDefense', 'Spiked Defense', 0, '+6 DEF for 2 turns; melee attackers are hurt by the spikes (4 damage).', ['margoma'], { target: 'self', buff: { id: 'tfSpiked', name: 'Spiked Defense', turns: 2, stats: { def: 6 } } }, { ...sta(6), cooldown: 3 }),
  p('crushingSpin', 'Crushing Spin', 0, 'Spins over every enemy next to it (STR + 6 vs DEF).', ['margoma'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 6 } }, { ...sta(8), cooldown: 3 }),
  q('miniMargoSummon', 'Mini-Margo Summon', 8, 'Two Mini-Margos roll out of its rim (four at most).', { grantedBy: { templates: ['margoma'] }, cooldown: 4 }),
  p('freezingBreathTF', 'Freezing Breath', 10, 'Frost at an enemy within 3 (MAG + 5 ice vs RES; Freeze 30%).', ['blizzagia'],
    { target: 'foe', range: [1, 3], dmg: { stat: 'mag', base: 5, vs: 'res', element: 'ice' }, status: { kind: 'freeze', turns: 1, chance: 30 } }, { cooldown: 2 }),
  p('icePillarTF', 'Ice Pillar', 12, 'Ice pillars burst under every enemy within 2 (MAG + 2 ice vs RES; Rooted 40%).', ['blizzagia'],
    { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'ice' }, status: { kind: 'root', turns: 1, chance: 40 } }, { cooldown: 3 }),
  q('undergroundDive', 'Underground Dive', 0, 'Dives under the ice and bursts out next to the nearest enemy.', { sta: 6, grantedBy: { templates: ['blizzagia'] }, cooldown: 3 }),
  p('blizzardTF', 'Blizzard', 16, 'A blizzard on every enemy within 3 (MAG + 3 ice vs RES).', ['blizzagia'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'ice' } }, { cooldown: 4 }),
  p('coordinatedAssaultTF', 'Coordinated Assault', 0, 'All three pets lunge at every enemy within 2 (STR + 3 vs DEF).', ['ladysPets'], { target: 'foes', radius: 2, dmg: { stat: 'str', base: 3 } }, { ...sta(8), cooldown: 3 }),
  q('elementalProjectile', 'Elemental Projectile', 10, 'A bolt of fire, ice or lightning at an enemy within 4 (MAG + 5 vs RES).', { grantedBy: { templates: ['ladysPets'] }, cooldown: 2 }),
  q('combinedAttack', 'Combined Attack', 0, 'With all three sections: a crushing blow on an adjacent enemy (STR + 10 vs DEF).', { sta: 10, grantedBy: { templates: ['ladysPets'] }, cooldown: 3 }),
  p('giantSwordSlash', 'Giant Sword Slash', 0, 'A sweep of the giant sword over every enemy within 2 (STR + 5 vs DEF).', ['stalchampion'], { target: 'foes', radius: 2, dmg: { stat: 'str', base: 5 } }, { ...sta(8), cooldown: 3 }),
  p('shieldDefense', 'Shield Defense', 0, '+8 DEF for 2 turns.', ['stalchampion'], { target: 'self', buff: { id: 'tfShieldDefense', name: 'Shield Defense', turns: 2, stats: { def: 8 } } }, { ...sta(6), cooldown: 4 }),
  p('skeletalRecovery', 'Skeletal Recovery', 12, 'Pulls its bones back together: recovers 25% HP.', ['stalchampion'], { target: 'self', heal: { pct: 0.25 } }, { cooldown: 4 }),
  p('groundSmash', 'Ground Smash', 0, 'Smashes the ground: every enemy next to it takes STR + 4 vs DEF and may be Stunned (30%).', ['stalchampion'],
    { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4 }, status: { kind: 'stun', turns: 1, chance: 30 } }, { ...sta(8), cooldown: 3 }),
  p('prismBeam', 'Prism Beam', 10, 'A piercing beam at an enemy within 4 (MAG + 6 light vs RES, ignoring 30% of it).', ['prismantus'],
    { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 6, vs: 'res', element: 'light', pierce: 0.3 } }, { cooldown: 2 }),
  p('rotatingBarrage', 'Rotating Barrage', 14, 'Beams sweep every enemy within 3 (MAG + 2 vs RES).', ['prismantus'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 2, vs: 'res' } }, { cooldown: 3 }),
  p('magicalBarrierTF', 'Magical Barrier', 10, '+10 RES for 2 turns.', ['prismantus'], { target: 'self', buff: { id: 'tfMagicalBarrier', name: 'Magical Barrier', turns: 2, stats: { res: 10 } } }, { cooldown: 4 }),
  p('segmentRestoration', 'Segment Restoration', 12, 'Restores its lenses: recovers 20% HP.', ['prismantus'], { target: 'self', heal: { pct: 0.2 } }, { cooldown: 4 }),
];

/** Abilities handled by engine/triforce.ts castTriforce. */
export const TF_SPECIAL = ['tfTotemStack', 'tfTotemDrop', 'tfHeroThrow', 'tfElevatedStrike', 'tfTripleSpin', 'tfTriforceAssault', 'tfTotemGuard', 'tfGripshot', 'tfWaterPillar', 'tfDapperSpin',
  'expertTailoring', 'fashionCurse', 'grandCurse', 'segmentLaunch', 'miniMargoSummon', 'undergroundDive', 'elementalProjectile', 'combinedAttack'];
/** Boss and monster abilities the enemy uses on its own (engine/abilities.ts enemyAutoTransform). */
export const TF_ENEMY_CASTS = ['grandCurse', 'witchsEnsemble', 'magicalReflection', 'fashionCurse', 'parasolBarrage', 'segmentLaunch', 'spikedDefense', 'crushingSpin', 'miniMargoSummon',
  'blizzardTF', 'freezingBreathTF', 'icePillarTF', 'undergroundDive', 'combinedAttack', 'coordinatedAssaultTF', 'elementalProjectile', 'skeletalRecovery', 'giantSwordSlash', 'groundSmash',
  'shieldDefense', 'segmentRestoration', 'rotatingBarrage', 'prismBeam', 'magicalBarrierTF'];
