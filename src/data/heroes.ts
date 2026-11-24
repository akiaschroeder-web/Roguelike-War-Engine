import type { HeroDef } from '../engine/types';

// Original crossover cast — three heroes per world. Each hero is a class plus
// small personal stat/growth tweaks, a starting weapon and a signature skill.

export const HEROES: HeroDef[] = [
  // ── Emberhold (High Fantasy) ──
  {
    id: 'aldric', name: 'Aldric', title: 'Exiled Prince', world: 'emberhold', classId: 'cavalier',
    weaponId: 'ironSword', skill: 'momentum', glyph: 'AL',
    statMods: { hp: 2, str: 1, skl: 1 }, growthMods: { str: 5, def: 5 },
    bio: 'Heir to a throne that no longer exists. He rides for the crown he lost, and for whoever is beside him.',
  },
  {
    id: 'brynja', name: 'Brynja', title: 'Dragon Knight', world: 'emberhold', classId: 'skyrider',
    weaponId: 'ironLance', skill: 'bulwark', glyph: 'BR',
    statMods: { str: 2, def: 1 }, growthMods: { hp: 10 },
    bio: 'Her wyvern Cinder answers to no one else. Neither does she.',
  },
  {
    id: 'osric', name: 'Osric', title: 'Court Sorcerer', world: 'emberhold', classId: 'mage',
    weaponId: 'fire', skill: 'deadeye', glyph: 'OS',
    statMods: { mag: 2 }, growthMods: { mag: 5, spd: -5 },
    bio: 'Burned the royal library by accident. Twice. Has been very careful since.',
  },

  // ── Starfall Station (Sci-Fi Shooter) ──
  {
    id: 'vex', name: 'Sgt. Vex', title: 'Void Marine', world: 'starfall', classId: 'gunner',
    weaponId: 'blaster', skill: 'bulwark', glyph: 'VX',
    statMods: { hp: 3, def: 2 }, growthMods: { hp: 10, def: 10, spd: -10 },
    bio: 'Last survivor of the 7th Drop Battalion. Keeps her helmet on. Always.',
  },
  {
    id: 'unit7', name: 'UNIT-7', title: 'Rogue Android', world: 'starfall', classId: 'blademaster',
    weaponId: 'ironSword', skill: 'armorBreak', glyph: 'U7',
    statMods: { skl: 2, res: -1 }, growthMods: { skl: 10, res: -10 },
    bio: 'Built to dismantle. Reprogrammed itself to protect. Still learning what jokes are.',
  },
  {
    id: 'kestrel', name: 'Dr. Kestrel', title: 'Field Medic', world: 'starfall', classId: 'cleric',
    weaponId: 'mend', skill: 'regen', glyph: 'KE',
    statMods: { mag: 1, spd: 1 }, growthMods: { mag: 5 },
    bio: 'Has stitched up aliens, androids, and once a sentient fungus. You are not special.',
  },

  // ── Pixelvale (8-Bit Platformer) ──
  {
    id: 'pip', name: 'Pip', title: 'Jump-Boot Hero', world: 'pixelvale', classId: 'blademaster',
    weaponId: 'ironSword', skill: 'nimble', glyph: 'PI',
    statMods: { spd: 2, mov: 1 }, growthMods: { spd: 10, str: -5 },
    bio: 'Has saved Pixelvale 255 times. The counter rolled over, so it says zero.',
  },
  {
    id: 'gruntle', name: 'Gruntle', title: 'Reformed Minion Boss', world: 'pixelvale', classId: 'brawler',
    weaponId: 'ironAxe', skill: 'lifesteal', glyph: 'GR',
    statMods: { hp: 4, str: 1, spd: -2 }, growthMods: { hp: 10 },
    bio: 'Used to be the final boss. Got bored of losing. Switched sides.',
  },
  {
    id: 'bitsy', name: 'Bitsy', title: '1-Up Fairy', world: 'pixelvale', classId: 'cleric',
    weaponId: 'mend', skill: 'nimble', glyph: 'BI',
    statMods: { spd: 2, hp: -1 }, growthMods: { spd: 10, res: 5 },
    bio: 'Grants extra lives, but only to people she likes. The list is short.',
  },

  // ── Neon Sprawl (Cyberpunk) ──
  {
    id: 'zero', name: 'Zero', title: 'Street Samurai', world: 'neon', classId: 'blademaster',
    weaponId: 'ironSword', skill: 'deadeye', glyph: 'ZR',
    statMods: { str: 1, skl: 1 }, growthMods: { str: 5 },
    bio: 'Chrome arms, monofilament blade, a debt to the Yakuza she plans never to pay.',
  },
  {
    id: 'glitch', name: 'Glitch', title: 'Netrunner', world: 'neon', classId: 'mage',
    weaponId: 'fire', skill: 'armorBreak', glyph: 'GL',
    statMods: { spd: 2, mag: 1 }, growthMods: { spd: 10, hp: -5 },
    bio: 'Hacks reality the way others hack firewalls. The Rift is just bad code to them.',
  },
  {
    id: 'tank', name: 'Mother Tank', title: 'Riot Enforcer', world: 'neon', classId: 'knight',
    weaponId: 'ironLance', skill: 'bulwark', glyph: 'MT',
    statMods: { hp: 3, def: 1 }, growthMods: { def: 5 },
    bio: 'Ex-corporate security. Now protects her block, and her block protects her.',
  },

  // ── Ronin Isles (Samurai Fighter) ──
  {
    id: 'kaito', name: 'Kaito', title: 'Wandering Ronin', world: 'ronin', classId: 'blademaster',
    weaponId: 'ironSword', skill: 'vantage', glyph: 'KA',
    statMods: { skl: 2, spd: 1 }, growthMods: { skl: 5, spd: 5 },
    bio: 'Has never lost a duel. Has never started one, either.',
  },
  {
    id: 'hana', name: 'Hana', title: 'Storm Archer', world: 'ronin', classId: 'ranger',
    weaponId: 'ironBow', skill: 'deadeye', glyph: 'HA',
    statMods: { skl: 2 }, growthMods: { skl: 10 },
    bio: 'Can split an arrow mid-flight. Prefers to split helmets.',
  },
  {
    id: 'oni', name: 'Tetsuo', title: 'Oni Brawler', world: 'ronin', classId: 'brawler',
    weaponId: 'ironAxe', skill: 'momentum', glyph: 'TE',
    statMods: { str: 2, hp: 2 }, growthMods: { str: 10, skl: -5 },
    bio: 'Champion of a thousand tournaments. Fights because the crowd stopped being enough.',
  },

  // ── Hollowmere (Gothic Horror) ──
  {
    id: 'vesper', name: 'Vesper', title: 'Vampire Hunter', world: 'hollowmere', classId: 'ranger',
    weaponId: 'ironBow', skill: 'lifesteal', glyph: 'VE',
    statMods: { spd: 1, res: 2 }, growthMods: { res: 10 },
    bio: 'Silver bolts, holy water, and a family curse she intends to end with her.',
  },
  {
    id: 'mortimer', name: 'Mortimer', title: 'Gravekeeper', world: 'hollowmere', classId: 'knight',
    weaponId: 'ironLance', skill: 'regen', glyph: 'MO',
    statMods: { hp: 2, res: 2 }, growthMods: { res: 10, spd: -5 },
    bio: 'Keeps the dead in their graves. Mostly. He takes it very personally when they leave.',
  },
  {
    id: 'lilith', name: 'Lilith', title: 'Blood Witch', world: 'hollowmere', classId: 'mage',
    weaponId: 'fire', skill: 'lifesteal', glyph: 'LI',
    statMods: { mag: 2, def: -1 }, growthMods: { mag: 10, def: -5 },
    bio: 'Her magic has a price. She is very good at making others pay it.',
  },
];

export const HERO_MAP: Record<string, HeroDef> = Object.fromEntries(HEROES.map((h) => [h.id, h]));
