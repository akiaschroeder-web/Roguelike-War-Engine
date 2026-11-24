import type { AbilityDef } from '../../engine/types';

const ab = (d: Omit<AbilityDef, 'implemented'> & { implemented?: boolean }): AbilityDef => ({ implemented: true, ...d });

export const ABILITIES: AbilityDef[] = [
  // ── Songs ──
  ab({ id: 'songOfHealing', name: 'Song of Healing', kind: 'song', mp: 5, desc: 'Removes curses, fear and confusion from nearby allies. Weakened undead or possessed enemies are purified and may join you.' }),
  ab({ id: 'songOfSoaring', name: 'Song of Soaring', kind: 'song', mp: 6, warp: 'owl', cooldown: 3, desc: 'Fly to a space next to an Owl Statue. 3-turn cooldown.' }),
  ab({ id: 'sonataOfAwakening', name: 'Sonata of Awakening', kind: 'song', mp: 4, desc: 'Wakes nearby allies (removes Asleep, Stunned and Frozen).' }),
  ab({ id: 'goronLullaby', name: 'Goron Lullaby', kind: 'song', mp: 6, desc: 'Nearby enemies may fall Asleep for 2 turns (high RES resists).' }),
  ab({ id: 'newWaveBossaNova', name: 'New Wave Bossa Nova', kind: 'song', mp: 5, desc: 'Nearby aquatic allies gain +2 MOV and +2 MAG for 3 turns.' }),
  ab({ id: 'elegyOfEmptiness', name: 'Elegy of Emptiness', kind: 'song', mp: 8, cooldown: 3, desc: 'Leaves a stationary shell of yourself next to you. It blocks enemies and holds switches.' }),
  ab({ id: 'oathToOrder', name: 'Oath to Order', kind: 'song', mp: 12, desc: 'Every allied Giant gains +4 STR, DEF and RES for 3 turns.' }),
  ab({ id: 'invertedSongOfTime', name: 'Inverted Song of Time', kind: 'song', mp: 10, oncePerBattle: true, desc: 'Once per battle: reinforcements and hazards are delayed for 2 turns.' }),
  ab({ id: 'songOfDoubleTime', name: 'Song of Double Time', kind: 'song', mp: 8, oncePerBattle: true, desc: 'Once per battle: every ally\'s cooldowns advance by 2 turns.' }),

  // ── Transformation masks (granted by wearing the mask) ──
  ab({ id: 'mask_dekuMask', name: 'Deku Mask', kind: 'personal', mp: 0, grantedBy: { gear: ['dekuMask'] }, desc: 'Transform into Deku Link.' }),
  ab({ id: 'mask_goronTransformMask', name: 'Goron Mask', kind: 'personal', mp: 0, grantedBy: { gear: ['goronTransformMask'] }, desc: 'Transform into Goron Link (Size 2).' }),
  ab({ id: 'mask_zoraTransformMask', name: 'Zora Mask', kind: 'personal', mp: 0, grantedBy: { gear: ['zoraTransformMask'] }, desc: 'Transform into Zora Link.' }),
  ab({ id: 'mask_fierceDeityMask', name: "Fierce Deity's Mask", kind: 'personal', mp: 0, grantedBy: { gear: ['fierceDeityMask'] }, desc: 'Become the Fierce Deity (Size 2). Costs 3 MP each turn.' }),
  ab({ id: 'mask_giantsMask', name: "Giant's Mask", kind: 'personal', mp: 0, grantedBy: { gear: ['giantsMask'] }, desc: 'Grow to colossal size (Size 5). Costs 4 MP each turn.' }),
  ab({ id: 'mask_majorasMaskGear', name: "Majora's Mask", kind: 'personal', mp: 0, grantedBy: { gear: ['majorasMaskGear'] }, desc: 'Skull Kid gives in to the mask and becomes Majora\'s Incarnation.' }),
  ab({ id: 'removeMask', name: 'Remove Mask', kind: 'personal', mp: 0, grantedBy: { gear: ['dekuMask', 'goronTransformMask', 'zoraTransformMask', 'fierceDeityMask', 'giantsMask', 'majorasMaskGear'] }, desc: 'Return to your normal form.' }),

  // ── Majora's sequential forms ──
  ab({ id: 'majoraIncarnate', name: 'Incarnation', kind: 'personal', mp: 0, oncePerBattle: true, grantedBy: { templates: ['majorasMask'] }, desc: 'Below half HP: sprout limbs and become Majora\'s Incarnation.' }),
  ab({ id: 'majoraWrath', name: 'Wrath', kind: 'personal', mp: 0, oncePerBattle: true, grantedBy: { templates: ['majorasIncarnation'] }, desc: 'Below half HP: become Majora\'s Wrath.' }),

  // ── Form abilities ──
  ab({ id: 'dekuSpin', name: 'Deku Spin', kind: 'technique', mp: 0, sta: 4, grantedBy: { templates: ['dekuLink'] }, desc: 'Spin into every adjacent enemy (STR + 4 vs DEF).' }),
  ab({ id: 'flowerGlide', name: 'Flower Glide', kind: 'personal', mp: 3, grantedBy: { templates: ['dekuLink', 'dekuFlowerScout'] }, desc: 'Before moving: glide this turn (flying, +2 MOV). Free action.' }),
  ab({ id: 'dekuNutDrop', name: 'Deku Nut Drop', kind: 'personal', mp: 4, grantedBy: { templates: ['dekuLink', 'dekuBombardier'] }, desc: 'Stun every adjacent enemy for a turn.' }),
  ab({ id: 'groundPound', name: 'Ground Pound', kind: 'technique', mp: 0, sta: 6, grantedBy: { templates: ['goronLink', 'darmani'] }, desc: 'Slam the ground: STR + 6 to adjacent enemies, 30% Stun.' }),
  ab({ id: 'defensiveCurl', name: 'Defensive Curl', kind: 'technique', mp: 0, sta: 4, grantedBy: { templates: ['goronLink', 'darmani'] }, desc: 'Curl up: +6 DEF and +3 RES until your next turn.' }),
  ab({ id: 'goronRoll', name: 'Goron Roll', kind: 'technique', mp: 0, sta: 4, grantedBy: { templates: ['goronLink', 'darmani'] }, desc: 'Before moving: roll for +3 MOV this turn. Free action.' }),
  ab({ id: 'rapidSwim', name: 'Rapid Swimming', kind: 'technique', mp: 0, sta: 2, grantedBy: { templates: ['zoraLink', 'mikau'] }, desc: 'Before moving, in water: +3 MOV this turn. Free action.' }),
  ab({ id: 'electricBarrier', name: 'Electric Barrier', kind: 'spell', mp: 6, grantedBy: { templates: ['zoraLink', 'mikau'] }, desc: 'For 2 turns, adjacent attackers take 4 damage and are Shocked.' }),
  ab({ id: 'giantStomp', name: 'Giant Stomp', kind: 'technique', mp: 0, sta: 8, grantedBy: { templates: ['giantLink'] }, desc: 'Stomp: STR + 8 to adjacent enemies, 40% Stun.' }),
  ab({ id: 'tidalSurge', name: 'Tidal Surge', kind: 'personal', mp: 0, oncePerBattle: true, grantedBy: { templates: ['jabuJabu', 'greatBayGiant'] }, desc: 'Once per battle: a wave hits every enemy within 2 spaces (MAG + 6 vs RES).' }),
  ab({ id: 'royalGuardBash', name: 'Royal Guard', kind: 'technique', mp: 0, sta: 4, grantedBy: { templates: ['ikanaServant2'] }, desc: 'Adjacent allies gain +4 DEF until your next turn.' }),

  // ── Character abilities ──
  ab({ id: 'mischief', name: 'Mischief', kind: 'personal', mp: 0, cooldown: 3, grantedBy: { skill: 'mischief' }, desc: 'Swap places with a Size 1 unit within 4 spaces. 3-turn cooldown.' }),
  ab({ id: 'quickWarning', name: 'Quick Warning', kind: 'personal', mp: 0, cooldown: 1, grantedBy: { skill: 'quickWarning' }, desc: '"Watch out!" An ally within 3 spaces becomes Veiled (+30 Avoid) for a turn.' }),

  // ── Mask abilities ──
  ab({ id: 'blastMask', name: 'Blast Mask', kind: 'personal', mp: 0, cooldown: 3, grantedBy: { gear: ['blastMask'] }, desc: '12 damage to every adjacent enemy (5 recoil without a shield). 3-turn cooldown.' }),
  ab({ id: 'kamaroDance', name: "Kamaro's Dance", kind: 'personal', mp: 0, cooldown: 3, grantedBy: { gear: ['kamaroMask'] }, desc: 'Enemies within 2 spaces are Dazed (−15 Hit/Avoid) for two turns.' }),
  ab({ id: 'bremenMarch', name: 'Bremen March', kind: 'personal', mp: 0, cooldown: 2, grantedBy: { gear: ['bremenMask'] }, desc: 'Allies within 2 spaces gain +1 MOV this turn.' }),
];
