import type { SkillDef } from '../../engine/types';

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });

// Every effect lives in engine/triforce.ts (and triforceRun.ts for the ones that act between battles).
export const SKILLS: SkillDef[] = [
  // ── Named characters ──
  k('heroicAgility', 'Heroic Agility', '+3 SPD and SKL while another hero (a Tri Force Hero or one of the Links) is within 2.'),
  k('heroicStrength', 'Heroic Strength', '+3 STR and DEF while another hero (a Tri Force Hero or one of the Links) is within 2.'),
  k('fashionableInspiration', 'Fashionable Inspiration', 'Allies within 2 get 20% more from their outfits\' stat bonuses (at least +1 to each). Not while she is cursed.'),
  k('hytopianAuthority', 'Hytopian Authority', 'More army morale and material rewards: allies within 3 gain +5 Hit; after each victory the army gains morale and an extra material.'),
  k('expertTailoringSkill', 'Expert Tailoring', 'Repairs and briefly enhances allied clothing (Expert Tailoring): lifts Fashion Curses and adds +3 DEF and RES for 2 turns.'),
  k('fashionCurseSkill', 'Fashion Curse', 'Can disable an enemy\'s clothing bonuses (Fashion Curse); her hits curse the target\'s outfit for a turn 25% of the time.'),
  // ── Monsters ──
  k('stackedGuardian', 'Stacked Guardian', 'Three armoured layers, destroyed one at a time: 30% less damage while any remain; each hit of 10+ breaks one (an Elevated Strike or a hammer: two). −3 DEF per layer lost.'),
  k('chameleonTF', 'Chameleon', 'Camouflages (Veiled) at the start of its turn when no enemy is next to it; +20% damage when it strikes from camouflage.'),
  k('hokkuSegments', 'Segmented Body', 'Launches its segments as projectiles (Segment Launch): each launch lowers its own DEF by 2 (three segments).'),
  // ── Bosses ──
  k('rotatingFortress', 'Rotating Fortress', 'Armoured while spinning: half damage from attackers on the ground. Its upper eye is open to elevated attacks (a Totem\'s upper levels, fliers, Totem Platforms, Water Pillars): +50% damage.'),
  k('frozenDragon', 'Frozen Dragon', 'Ice armour round its head (30 points, absorbs damage first; fire deals double to it and stops it regrowing). At the start of its turn, foes next to it may be Frozen (25%).'),
  k('threefoldBeast', 'Threefold Beast', 'Three sections that attack independently: each remaining extra section strikes its target again for 40% of STR. Each lost third of its HP is one section fewer.'),
  k('toweringSwordsman', 'Towering Swordsman', 'Resists ordinary frontal attacks: 40% less damage from attackers on the ground. Strikes across several elevations: no penalty against a Totem\'s top or fliers.'),
  k('rotatingPrism', 'Rotating Prism', 'Rotates each turn — red (weak to melee), green (weak to ranged), blue (weak to magic): +50% damage from its weakness, 30% less from the rest.'),
  k('electricalCrown', 'Electrical Crown', 'A damaging electric field: enemies within 1 take MAG/3 damage at the start of its turn, and melee attackers are shocked (25%).'),
  k('electricBrood', 'Electric Brood', 'Summons an electrified Buzz Blob every other turn (four at most); blobs within 2 gain +3 STR and MAG.'),
  k('livingGlacier', 'Living Glacier', 'Ice armour: 40% less damage until fire breaks it (fire deals 50% more, then the armour is gone for 2 turns). Its projectiles freeze.'),
  k('desertSovereign', 'Desert Sovereign', 'Wind currents push enemies within 2 back a space at the start of its turn; attacks from high ground (+20% damage against units on the ground).'),
  k('spectralReaper', 'Spectral Reaper', 'Turns intangible on odd turns (immune to physical attacks); on even turns it strikes hard (+50% damage).'),
  k('perfectCamouflage', 'Perfect Camouflage', 'Invisible until it attacks or is revealed (Light Armor, a hit, or an enemy next to it); hidden again when no enemy is near.'),
];
