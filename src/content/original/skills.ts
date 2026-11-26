import type { SkillDef } from '../../engine/types';

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });

export const SKILLS: SkillDef[] = [
  // ── Main characters ──
  k('itsDangerousToGoAlone', "It's Dangerous to Go Alone", '+2 STR, DEF and SKL while no ally is within 3 spaces.'),
  k('swordBeam', 'Sword Beam', 'At full HP, sword attacks reach 2 spaces further as a Sword Beam (3 with the Magical Sword).'),
  k('dungeonExplorer', 'Dungeon Explorer', 'At the start of each turn, reveals hidden staircases, hidden enemies and traps within 3.'),
  k('quickItem', 'Quick Item', 'Once per battle, using a pack item doesn\'t use your action.'),
  k('scatteredWisdom', 'Scattered Wisdom', '+1 MAG and +1 RES for each Triforce of Wisdom fragment the army holds (+8 each once the Triforce is whole).'),
  k('invisibleDarkness', 'Invisible Darkness', 'Turns invisible at the start of his phase (as an enemy: hidden; on your side: Veiled). Sacred light, detection (an enemy within 2) and Silver Arrows reveal him; Silver Arrows deal him extra damage.'),
  k('invisibleAssault', 'Invisible Assault', '+25 Critical when attacking from concealment (hidden or Veiled).'),
  k('princeOfDarkness', 'Prince of Darkness', 'Allied monsters within 2 gain +3 STR and MAG.'),
  // ── Supporting characters ──
  k('ancientAdvice', 'Ancient Advice', 'At the start of battle, reveals hidden staircases and traps, and every enemy is Exposed for the first turn (its weaknesses known).'),
  k('lifeMedicine', 'Life Medicine', 'Potions and medicines used by her or by allies within 2 heal 30% more.'),
  k('secretMerchandise', 'Secret Merchandise', 'Shop equipment is 15% cheaper; sometimes (25%) a rare item turns up after a won battle.'),
  // ── New monsters ──
  k('returningStrike', 'Returning Strike', 'Boomerangs hit on the way out and back: an extra strike when attacking with a boomerang.'),
  k('suddenCharge', 'Sudden Charge', '+4 MOV at the start of its turn if an enemy is in a straight line within 6.'),
  k('division', 'Division', 'On a fatal blow that dealt less than half its max HP, it splits into two temporary Gels.'),
  k('clingingBody', 'Clinging Body', 'Its contact attacks cling on: the target has −1 MOV for a turn.'),
  k('batDivision', 'Bat Division', 'Killed by an ordinary (non-magical, non-light) attack, it splits into two temporary Keese.'),
  k('sensitiveHearing', 'Sensitive Hearing', 'Double damage from arrows, instruments and music; ordinary melee attacks deal half.'),
  k('graveyardHaunting', 'Graveyard Haunting', 'Next to a Gravestone at the start of its turn, it calls up a temporary Ghini (every other turn, two at most).'),
  k('segmentedBody', 'Segmented Body', 'Three body segments absorb blows: each hit while a segment remains breaks it off and deals only 40% to the head.'),
  k('orbitalDefense', 'Orbital Defense', 'Eight small eyes orbit it and intercept attacks (the body takes 25%; each hit destroys an eye, two if strong). Destroyed eyes don\'t come back.'),
  k('tripleFireballSkill', 'Triple Fireball', 'Its ranged magic fires three spreading projectiles (half damage to enemies next to the target).'),
  k('frenziedGrowth', 'Frenzied Growth', 'Four heads, each with its own share of HP: a single blow can only destroy one. Each head lost: +2 SPD and +1 MOV.'),
  k('resonantWeakness', 'Resonant Weakness', 'Its huge shell halves damage until the Recorder shrinks it (or it fragments); shrunk, it takes 50% more and loses 8 DEF.'),
  k('explosiveAppetite', 'Explosive Appetite', 'Swallows bombs: a bomb blast that catches it deals triple damage and Stuns it.'),
  k('erraticMovement', 'Erratic Movement', '+20 Avoid after moving 3 or more spaces this turn.'),
];
