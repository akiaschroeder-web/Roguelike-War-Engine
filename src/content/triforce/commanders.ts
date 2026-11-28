import type { CommanderDef } from '../../engine/types';

// Section 10. ALBW Link keeps his single commander entry (A Link Between Worlds): in this campaign he takes the
// alternative loadout below instead (engine/triforceRun.ts triforceLoadout).
export const COMMANDERS: CommanderDef[] = [
  { heroId: 'kingTuft', armyName: 'The Court of Hytopia', units: ['styla', 'hyruleKnight'], bonus: 'hytopianCrafting', campaign: 'triforce',
    bonusText: 'Battles yield 30% more crafting materials.', startingItems: ['redPotion'] },
  { heroId: 'ladyMaud', armyName: "The Drablands Witch's Court", units: ['grimRepoe', 'keeleon'], bonus: 'fashionTyranny', campaign: 'triforce',
    bonusText: 'Equipment-disabling effects the army inflicts on enemies (Fashion Curse, Grand Curse…) last 1 turn longer.' },
];

/** Alternative loadouts: an existing commander's army and bonus when they lead this campaign. */
export const ALT_LOADOUTS: CommanderDef[] = [
  { heroId: 'linkALBW', armyName: 'The Tri Force Heroes', units: ['blueHero', 'redHero'], bonus: 'triforceHeroes', campaign: 'triforce',
    bonusText: 'Cooperative techniques (Totem actions and the heroes\' combined attacks) cost 25% less STA.', startingItems: ['redPotion'] },
];
