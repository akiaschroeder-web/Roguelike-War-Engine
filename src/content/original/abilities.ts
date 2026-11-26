import type { AbilityDef } from '../../engine/types';

const ab = (d: Omit<AbilityDef, 'implemented'> & { implemented?: boolean }): AbilityDef => ({ implemented: true, ...d });
const act = (id: string, name: string, icon: string, desc: string, extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, desc, ...extra });
const pers = (id: string, name: string, mp: number, desc: string, templates: string[], extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: { templates }, ...extra });

// Each unit's doc abilities. Passive ones (Sword Beam, Dungeon Explorer, Quick Item,
// Invisible Assault, Prince of Darkness, the monsters' traits) are skills in skills.ts.
export const ABILITIES: AbilityDef[] = [
  // ── Link ──
  pers('triforcesCourage', "Triforce's Courage", 3, 'For 3 turns you are immune to Fear and Confusion (and both are lifted now). Doesn\'t use your action.', ['heroOfHyrule'],
    { cooldown: 4, freeAction: true, icon: '🔺' }),
  // ── Zelda ──
  pers('lightOfWisdom', 'Light of Wisdom', 4, 'Reveal invisible enemies, traps and hidden staircases within 5. Ganon can\'t turn invisible for 2 turns.', ['zeldaHyrule'], { cooldown: 2 }),
  pers('sacredBarrierHyrule', 'Sacred Barrier', 5, 'An ally within 2 (or you) takes no magic damage until your next turn.', ['zeldaHyrule']),
  pers('wisdomsGuidance', "Wisdom's Guidance", 5, 'You and allies within 2 gain +3 SKL and +5 LCK for 2 turns.', ['zeldaHyrule'], { cooldown: 2 }),
  pers('triforceRestoration', 'Triforce Restoration', 10, 'You and allies within 2 recover MAG/2 + 6 HP and 6 MP.', ['zeldaHyrule'], { cooldown: 3 }),
  // ── Ganon ──
  pers('darkFireball', 'Dark Fireball', 4, 'Hurl a dark fireball at an enemy within 4 (MAG + 8 vs RES, may Burn).', ['ganonHyrule']),
  pers('darkTeleport', 'Dark Teleport', 5, 'Vanish and reappear on a free space within 5 (you are Veiled afterwards).', ['ganonHyrule'], { cooldown: 2 }),
  // ── Supporting characters and monsters ──
  pers('disarmingThrow', 'Disarming Throw', 3, 'Throw the boomerang at an enemy within 3: STR + Might − DEF, and a 40% chance to knock its weapon away.', ['goriya'], { cooldown: 2,
    grantedBy: { templates: ['goriya'], weapons: ['goriyaBoomerang', 'magicalBoomerang'] } }),
  pers('slimeMerge', 'Slime Merge', 0, 'Two Gels flow together: merge with an adjacent Gel into a Zol (summoned; it fights for your side this battle).', ['gel'], { oncePerBattle: true }),
  pers('graveSummoning', 'Grave Summoning', 4, 'Call a temporary Ghini from an adjacent Gravestone.', ['ghini'], { cooldown: 3 }),
  pers('eyeSwarm', 'Eye Swarm', 6, 'Send the orbiting eyes out: every enemy within 2 takes MAG/3 + 1 per surviving eye (vs RES).', ['patra'], { cooldown: 2 }),
  pers('tripleFireball', 'Triple Fireball', 6, 'Three spreading fireballs at an enemy within 5: the target and up to two enemies next to it take MAG + 6 vs RES (fire).', ['aquamentus']),
  pers('hornCharge', 'Horn Charge', 4, 'Charge an enemy within 3: STR + 6 vs DEF, and it is knocked back a space.', ['aquamentus'], { sta: 4 }),
  pers('dragonGuard', 'Dragon Guard', 4, '+6 DEF and +6 RES for 2 turns. Doesn\'t use your action.', ['aquamentus'], { cooldown: 3, freeAction: true }),
  pers('concentratedBreath', 'Concentrated Breath', 8, 'Three fireballs as one: an enemy within 4 takes (MAG + 6) × 2 vs RES (fire).', ['aquamentus'], { cooldown: 2 }),
  pers('fourWayAssault', 'Four-Way Assault', 4, 'Every head bites: each adjacent enemy takes STR + 4 vs DEF.', ['manhandla'], { sta: 4 }),
  pers('seedBarrage', 'Seed Barrage', 5, 'Spit seeds at every enemy within 3: STR/2 + 4 vs DEF each.', ['manhandla'], { cooldown: 2 }),
  pers('heavyImpact', 'Heavy Impact', 4, 'Slam the ground: adjacent enemies take STR/2 + 4 vs DEF and are knocked back a space.', ['digdogger'], { sta: 4 }),
  pers('eyeFixation', 'Eye Fixation', 3, 'Fix your eye on an enemy within 4: it is Exposed (takes more damage) for 3 turns.', ['digdogger'], { cooldown: 2 }),
  pers('fragmentation', 'Fragmentation', 0, 'Split apart: two Lesser Digdoggers break off (summoned), and Digdogger shrinks to its vulnerable form. Below 60% HP, or once shrunk.', ['digdogger'],
    { oncePerBattle: true }),
  // ── Tools ──
  pers('playRecorder', 'Play the Recorder', 2, 'A whirlwind carries you to a free space within 6. Digdoggers within 4 shrink; Pols Voices within 3 take MAG + 8 (double: they hate music).', [],
    { grantedBy: { gear: ['recorder'] }, icon: '🎵', cooldown: 2 }),
  pers('candleFire', 'Candle Fire', 0, 'Light a fire on a space within 2: an enemy there takes 8 fire damage (may Burn), and a Burnable Bush there burns away — maybe revealing a secret.', [],
    { grantedBy: { gear: ['blueCandle', 'redCandle'] }, icon: '🕯' }),
  // ── Battlefield spaces ──
  act('pushBoulder', 'Push Boulder', '🪨', 'Push an adjacent Movable Boulder one space away (needs 12+ STR or a Power Bracelet). Something may be underneath.'),
  act('pushBlockOH', 'Push Block', '▣', 'Push an adjacent Push Block: mechanisms grind — Shutter Doors open, and a hidden staircase may appear.'),
  act('openLockedDoor', 'Open Door', '🔑', 'Open an adjacent Locked Door with the Magical Key (or use a Small Key from your pack).'),
];
