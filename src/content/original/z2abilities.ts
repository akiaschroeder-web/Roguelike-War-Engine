// Zelda II: The Adventure of Link — abilities and skills (design doc sections 1–6).
// The guardians' attacks are data-driven (engine/wild.ts castWild); the spells, sword
// techniques, Sleeping Zelda's abilities and the special cases live in engine/aol.ts.

import type { AbilityDef, SkillDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
const pers = (id: string, name: string, mp: number, desc: string, templates: string[], extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: { templates }, ...extra });
/** A guardian's attack with a data-driven effect. */
const dd = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: { templates }, wild, ...extra });
/** A learnable spell (Old Man encounters in the towns); the Hero of Hyrule knows all eight. */
const spell = (id: string, name: string, mp: number, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'spell', mp, desc, grantedBy: { templates: ['heroOfHyrule'] }, icon: '✨', ...extra });

/** The eight spells, in the order the towns teach them. */
export const Z2_SPELLS = ['spellShield', 'spellJump', 'spellLife', 'spellFairy', 'spellFire', 'spellReflect', 'spellSpell', 'spellThunder'];
/** The two sword techniques (swordmaster training; any sword user can learn them). */
export const Z2_TECHNIQUES = ['downwardThrust', 'upwardThrust'];

export const Z2_ABILITIES: AbilityDef[] = [
  // ── Section 5: spells ──
  spell('spellShield', 'Shield', 6, 'Incoming damage −50% for 3 turns.', { cooldown: 2 }),
  spell('spellJump', 'Jump', 4, 'For 3 turns: +1 MOV, leap over units and one-space gaps and low obstacles (pits, collapsing floors, narrow passages), and your attacks count as jumping attacks.', { cooldown: 2 }),
  spell('spellLife', 'Life', 10, 'Restore 40% of your max HP.', { cooldown: 2 }),
  spell('spellFairy', 'Fairy', 12, 'Become a fairy for 2 turns: you fly (+3 MOV, +30 Avoid) and slip through Narrow Passages, but can\'t attack.', { cooldown: 3 }),
  spell('spellFire', 'Fire', 6, 'For 3 turns your sword attacks release fire: +1 range, +3 fire damage.', { cooldown: 2 }),
  spell('spellReflect', 'Reflect', 8, 'For 3 turns magic projectiles (ranged magic) can\'t hurt you — they bounce back at the caster. Reflected magic deals Carock double damage.', { cooldown: 2 }),
  spell('spellSpell', 'Spell', 14, 'Ordinary enemies within 2 turn into Bots for 2 turns; hidden staircases and secrets within 4 are revealed.', { cooldown: 3 }),
  spell('spellThunder', 'Thunder', 24, 'Lightning strikes every enemy on the field (MAG + 12 vs RES). It breaks Thunderbird\'s seal: its face is exposed for 3 turns.', { cooldown: 4, element: 'lightning' }),
  // ── Section 6: sword techniques (chosen in the combat forecast; learned from swordmasters) ──
  ab({ id: 'downwardThrust', name: 'Downward Thrust', kind: 'technique', mp: 0, sta: 5, weaponTypes: ['sword'], hidden: true, might: 2,
    desc: 'Leap onto the enemy: a jumping attack that ignores half the DEF its shield gives and can\'t be blocked, then bounce onto another enemy next to it (half damage).' }),
  ab({ id: 'upwardThrust', name: 'Upward Thrust', kind: 'technique', mp: 0, sta: 4, weaponTypes: ['sword'], hidden: true,
    desc: 'Strike straight up: +50% damage against flying enemies and enemies on higher ground (mountains, forts, elevators).' }),
  // ── Section 1: Sleeping Zelda ──
  dd('sleepingCurse', 'Sleeping Curse', 6, 'The curse that held her: an enemy within 3 falls asleep for 2 turns.', ['sleepingZelda'],
    { target: 'foe', range: [1, 3], status: { kind: 'sleep', turns: 2 } }, { cooldown: 2 }),
  pers('ancientBlessing', 'Ancient Blessing', 0, 'An ally within 2 recovers MAG/2 + 8 MP and 6 stamina.', ['sleepingZelda'], { cooldown: 2 }),
  pers('dreamProtection', 'Dream Protection', 6, 'You or an ally within 2: negative statuses are lifted, and none can take hold for 3 turns.', ['sleepingZelda'], { cooldown: 3 }),
  pers('couragesAwakening', "Courage's Awakening", 10, 'Once per battle: the most recently fallen ally wakes and rises beside you with 25% HP.', ['sleepingZelda'], { oncePerBattle: true }),
  // ── Section 3: the guardians ──
  dd('heavyMaceSwing', 'Heavy Mace Swing', 0, 'STR + 6 against an adjacent enemy.', ['horsehead'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 6 } }, { cooldown: 1 }),
  dd('crushingStrike', 'Crushing Strike', 0, 'STR + 4, ignoring half the target\'s DEF.', ['horsehead'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 4, pierce: 0.5 } }, { cooldown: 2 }),
  dd('sweepingBlow', 'Sweeping Blow', 0, 'Every adjacent enemy takes STR + 2.', ['horsehead'], { target: 'foes', radius: 1, dmg: { stat: 'str', base: 2 } }, { cooldown: 2 }),
  dd('armoredAdvance', 'Armored Advance', 0, '+4 DEF and +1 MOV for 2 turns. Doesn\'t use your action.', ['horsehead'],
    { target: 'self', buff: { id: 'armoredAdvance', name: 'Armored Advance', turns: 2, stats: { def: 4, mov: 1 } } }, { cooldown: 3, freeAction: true }),
  dd('helmetFireballAbility', 'Helmet Fireball', 4, 'A fireball at an enemy within 2–4: MAG + 6 vs RES (fire, may Burn).', ['helmethead'],
    { target: 'foe', range: [2, 4], dmg: { stat: 'mag', base: 6, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 25 } }),
  dd('armoredCharge', 'Armored Charge', 0, 'Charge an enemy within 3: STR + 5, knocked back a space.', ['helmethead'],
    { target: 'foe', range: [1, 3], dmg: { stat: 'str', base: 5 }, push: 1 }, { cooldown: 2 }),
  pers('spectralSummoning', 'Spectral Summoning', 8, 'Call up a Floating Helmet beside you (temporary; it shoots spectral fire).', ['helmethead'], { cooldown: 3 }),
  pers('spectralHelmet', 'Spectral Helmet', 0, 'Once per battle: release a Floating Helmet that fights beside you.', [], { grantedBy: { gear: ['helmetheadsHelm'] }, oncePerBattle: true }),
  dd('tripleBarrage', 'Triple Barrage', 8, 'Three fireballs at an enemy within 2–4 (each MAG/2 + 2 vs RES).', ['helmethead'],
    { target: 'foe', range: [2, 4], dmg: { stat: 'mag', base: 2, vs: 'res', element: 'fire', hits: 3 } }, { cooldown: 2 }),
  dd('mountedCharge', 'Mounted Charge', 0, 'Charge an enemy within 3: STR + 8.', ['rebonack'], { target: 'foe', range: [1, 3], dmg: { stat: 'str', base: 8 } }, { cooldown: 2 }),
  dd('lanceThrust', 'Lance Thrust', 0, 'STR + 5 against an enemy within 2, ignoring 30% of its DEF.', ['rebonack'], { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 5, pierce: 0.3 } }, { cooldown: 1 }),
  dd('swordBeamBarrage', 'Sword Beam Barrage', 5, 'Two sword beams at an enemy within 2–4 (each SKL/2 + 4 vs RES).', ['rebonack'],
    { target: 'foe', range: [2, 4], dmg: { stat: 'skl', base: 4, vs: 'res', hits: 2 } }, { cooldown: 2 }),
  dd('defensiveDuel', 'Defensive Duel', 0, '+5 DEF and +3 SKL for 2 turns. Doesn\'t use your action.', ['rebonack'],
    { target: 'self', buff: { id: 'defensiveDuel', name: 'Defensive Duel', turns: 2, stats: { def: 5, skl: 3 } } }, { cooldown: 3, freeAction: true }),
  dd('rapidTeleport', 'Rapid Teleport', 4, 'Teleport to a space within 5. Doesn\'t use your action.', ['carock'], { target: 'tile', range: [1, 5], move: true }, { freeAction: true, cooldown: 1 }),
  dd('arcaneBolt', 'Arcane Bolt', 4, 'MAG + 8 vs RES at an enemy within 5.', ['carock'], { target: 'foe', range: [1, 5], dmg: { stat: 'mag', base: 8, vs: 'res' } }),
  dd('magicalBarrage', 'Magical Barrage', 10, 'Every enemy within 3 takes MAG + 2 vs RES.', ['carock'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 2, vs: 'res' } }, { cooldown: 2 }),
  dd('illusoryEscape', 'Illusory Escape', 6, 'Leave an illusion behind: +6 SPD and +2 MOV for 2 turns. Doesn\'t use your action.', ['carock'],
    { target: 'self', buff: { id: 'illusoryEscape', name: 'Illusory Escape', turns: 2, stats: { spd: 6, mov: 2 } } }, { cooldown: 3, freeAction: true }),
  dd('ballAndChainSwing', 'Ball and Chain', 0, 'Whirl the ball at an enemy within 2: STR + 6.', ['gooma'], { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 6 } }, { cooldown: 1 }),
  dd('wideSweep', 'Wide Sweep', 0, 'Every enemy within 2 takes STR (the chain sweeps the floor).', ['gooma'], { target: 'foes', radius: 2, dmg: { stat: 'str', base: 0 } }, { cooldown: 2 }),
  dd('overheadSlam', 'Overhead Slam', 0, 'STR + 10 on an adjacent enemy; 30% chance to Stun.', ['gooma'],
    { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 10 }, status: { kind: 'stun', turns: 1, chance: 30 } }, { cooldown: 3 }),
  dd('armorCrusher', 'Armor Crusher', 0, 'STR + 4 ignoring half the target\'s DEF, and it is Weakened.', ['gooma'],
    { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 4, pierce: 0.5 }, status: { kind: 'weaken', turns: 2 } }, { cooldown: 2 }),
  dd('fireballRain', 'Fireball Rain', 10, 'Fire falls on a wide area: enemies within 2 of a space 2–6 away take MAG + 4 vs RES (fire).', ['thunderbird'],
    { target: 'tile', range: [2, 6], radius: 2, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'fire' } }, { cooldown: 2 }),
  dd('guardianFlight', 'Guardian Flight', 0, 'Take wing for 2 turns: ignore terrain, +2 MOV. Doesn\'t use your action.', ['thunderbird'],
    { target: 'self', buff: { id: 'aerial', name: 'Guardian Flight', turns: 2, stats: { mov: 2 } } }, { cooldown: 3, freeAction: true }),
  dd('burningDive', 'Burning Dive', 0, 'Dive at an enemy within 4: STR + 8 (fire).', ['thunderbird'], { target: 'foe', range: [1, 4], dmg: { stat: 'str', base: 8, element: 'fire' } }, { cooldown: 2 }),
  dd('infernalStorm', 'Infernal Storm', 14, 'Fire in all directions: every enemy within 3 takes MAG + 2 vs RES (fire).', ['thunderbird'],
    { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'fire' } }, { cooldown: 3 }),
  pers('reseal', 'Reseal', 6, 'Restore the barrier over your face: ends the exposure Thunder caused.', ['thunderbird'], { cooldown: 4 }),
  // ── Section 9: battlefield spaces ──
  ab({ id: 'rideElevator', name: 'Ride the Elevator', icon: '⇕', kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, freeAction: true,
    desc: 'Standing on an Elevator: ride it to another free Elevator on the field. Doesn\'t use your action.' }),
];

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });

export const Z2_SKILLS: SkillDef[] = [
  k('awakening', 'Awakening', 'Whenever she recovers from a negative status, she restores 20% of her max HP and MP.'),
  k('suddenLeap', 'Sudden Leap', 'Jumps over adjacent units: moves through enemies. Its attacks count as jumping attacks.'),
  k('bouncingAssault', 'Bouncing Assault', '+3 Might when attacking after moving (jumping). Its attacks count as jumping attacks.'),
  k('diveAttack', 'Dive Attack', '+50% damage when attacking from higher ground (mountain, fort, elevator), or diving at a grounded enemy after flying 2+ spaces.'),
  k('suspendedAmbush', 'Suspended Ambush', 'Hides in the trees (starts hidden; hides again in forest). When an enemy comes adjacent it drops on them (STR/2 damage) and is revealed.'),
  k('axeThrow', 'Axe Throw', 'Throws axes without losing them: axes reach 1 space further.'),
  k('reptilianGuard', 'Reptilian Guard', '+4 DEF when defending without having moved this turn.'),
  k('sandEmergence', 'Sand Emergence', 'Burrows under the sand (starts hidden; burrows again when no one is near). When an enemy comes adjacent it bursts out (STR/2 damage) and is revealed.'),
  k('unseenPresence', 'Unseen Presence', 'Invisible until it attacks or is revealed (like Ganon: detection within 2, sacred light, the Cross, a Moa Eye).'),
  k('spikedBody', 'Spiked Body', 'Reflects 25% of the damage from direct-contact (melee physical) attacks back at the attacker.'),
  k('leapingBones', 'Leaping Bones', 'Moves through water and lava as if they were floor; starting its turn in them, it leaps (+2 MOV).'),
  k('returningHammer', 'Returning Hammer', 'Thrown hammers come back: attacking from 2+ spaces away with a hammer strikes once more.'),
  k('ironFlail', 'Iron Flail', 'Ignores 25% of the enemy\'s DEF.'),
  k('leapingSwordsmanship', 'Leaping Swordsmanship', 'Jumping sword attacks bypass shields: no block and no shield DEF when attacking with a sword.'),
  k('fireSpit', 'Fire Spit', 'Its fire projectiles bounce across the ground (half damage to enemies next to the target); burning ground is no obstacle to it.'),
  k('mindDrain', 'Mind Drain', 'Contact attacks drain 3 MP from the target.'),
  k('magicalRelocation', 'Magical Relocation', 'After attacking with magic, teleports up to 4 spaces away from its target.'),
  k('spectralHelm', 'Spectral Helm', 'A floating, haunted helmet: it flies and shoots spectral fire. It fades when the battle ends.'),
  k('armoredBody', 'Armored Body', 'Ordinary physical damage −50% — unless the attack is a jumping attack, comes from the air, or he is surrounded (3+ enemies adjacent).'),
  k('detachedHelmets', 'Detached Helmets', 'At 75% and at 50% HP a helmet breaks off and floats away as a Floating Helmet that shoots magic on its own.'),
  k('unyieldingKnight', 'Unyielding Knight', 'Below 40% HP he dismounts: size 2 → 1, +4 SPD and SKL for the rest of the battle.'),
  k('magicalIntangibility', 'Magical Intangibility', 'Physical damage −90%. Magic reflected back at him (the Reflect spell) deals double damage.'),
  k('crushingMomentum', 'Crushing Momentum', 'Consecutive attacks on the same target ignore progressively more of its DEF (+12.5% each, up to 50%).'),
  k('sealedFace', 'Sealed Face', 'Damage taken −75% while its face is sealed. The Thunder spell exposes the weak point for 3 turns.'),
];
