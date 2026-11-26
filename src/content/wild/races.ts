import type { RaceDef } from '../../engine/types';

// Races new in the Era of the Wild pack. Hylians, Sheikah (the Yiga are a Sheikah
// splinter faction: their classes carry the 'yiga' tag), Gorons, Zora, Rito, Gerudo,
// Koroks, monsters, the undead and the older packs' dragons reuse the existing entries.
export const RACES: RaceDef[] = [
  { id: 'zonai', name: 'Zonai', desc: 'The ancient sky people who founded Hyrule with the Hylians. Masters of sacred light and of machines that run on Zonaite.', tags: ['zonai', 'divine', 'sacred'], growthMods: { mag: 10, res: 10, def: -5 } },
  { id: 'zonaiConstruct', name: 'Zonai Construct', desc: 'A soldier of Zonaite and spirit-light, built to serve the Zonai. Never afraid, never tired; weak to lightning.', tags: ['construct', 'zonai', 'mechanical'], weakTo: ['lightning'], growthMods: { def: 10, hp: 5, mag: -10, lck: -10 } },
  { id: 'guardian', name: 'Guardian', desc: 'A Sheikah war machine from ten thousand years ago. Purified, it obeys; corrupted by Malice, it hunts.', tags: ['construct', 'ancient', 'mechanical', 'guardian'], weakTo: ['lightning'], growthMods: { mag: 10, def: 5, spd: -10, lck: -15 } },
  { id: 'divineBeast', name: 'Divine Beast', desc: 'A colossal Sheikah machine built to fight Calamity Ganon. Carries troops, mounts heavy guns, needs a pilot to be at its best.', tags: ['construct', 'ancient', 'mechanical', 'divineBeast', 'colossal'], weakTo: ['lightning'], growthMods: { hp: 20, def: 10, spd: -20, lck: -10 } },
  { id: 'maliceEntity', name: 'Malice Entity', desc: 'The Calamity: Ganon\'s hatred given a body of Malice and stolen Sheikah machinery. Sacred light is the one thing it fears.', tags: ['demon', 'malice', 'mechanical'], weakTo: ['light'], lavaImmune: true, growthMods: { hp: 20, str: 5, lck: -15 } },
  { id: 'gloomEntity', name: 'Gloom Spawn', desc: 'Something made of the Demon King\'s Gloom. Its touch steals the life it can\'t give back.', tags: ['demon', 'gloom', 'phantom'], weakTo: ['light'], growthMods: { str: 5, mag: 5, lck: -10 } },
  { id: 'immortalDragon', name: 'Immortal Dragon', desc: 'A being who swallowed a Secret Stone and became a dragon forever. The Light Dragon heals the land it flies over.', flies: true, tags: ['dragon', 'divine', 'sacred', 'light'], growthMods: { hp: 20, mag: 10, res: 10, spd: -10 } },
  { id: 'immortalDemonDragon', name: 'Immortal Demon Dragon', desc: 'The Demon King as a dragon of Gloom. Whatever it burns stays burned.', flies: true, tags: ['dragon', 'demon', 'gloom'], weakTo: ['light'], growthMods: { hp: 25, str: 10, lck: -15 } },
  { id: 'frostDragon', name: 'Frost Dragon', desc: 'Naydra, the dragon of Mount Lanayru, whose breath freezes the air.', flies: true, tags: ['dragon', 'divine', 'ice'], weakTo: ['fire'], growthMods: { mag: 10, res: 10, spd: -5 } },
  { id: 'hylianSpirit', name: 'Hylian Spirit', desc: 'A Hylian who lingers after death to finish what they started.', flies: true, tags: ['spirit', 'royal'], weakTo: ['dark'], growthMods: { res: 10, mag: 5, hp: -5 } },
  { id: 'mountainSpirit', name: 'Mountain Spirit', desc: 'The Lord of the Mountain, a glowing guardian of wild animals. Seen once, remembered forever.', forestWalker: true, tags: ['divine', 'spirit', 'beast'], growthMods: { spd: 10, res: 10, str: -10 } },
  { id: 'horseGod', name: 'Horse God', desc: 'Malanya, the deity of horses, who can call a fallen steed back from death.', tags: ['divine', 'spirit'], growthMods: { mag: 10, res: 10, str: -15 } },
  { id: 'magicalCreature', name: 'Magical Creature', desc: 'A small, strange, glowing thing: Bubbulfrogs and Blupees. Hard to catch, worth catching.', tags: ['spirit', 'beast'], growthMods: { spd: 15, lck: 15, hp: -15, str: -10 } },
  { id: 'wildMount', name: 'Steed', desc: 'A horse, bear, deer or seal of the wilds. Fights on its own, or carries a rider.', tags: ['beast', 'mount'], growthMods: { spd: 10, hp: 5, mag: -20 } },
  { id: 'zonaiVehicle', name: 'Zonai Vehicle', desc: 'A machine built from Zonai Devices. It runs on the army\'s shared Energy Cell and stops when the energy does.', tags: ['construct', 'zonai', 'mechanical', 'vehicle'], weakTo: ['lightning'], growthMods: { def: 10, mag: -20, lck: -20 } },
  { id: 'stalMonster', name: 'Stal Monster', desc: 'A monster\'s skeleton walking at night. It falls apart under light, and pulls itself back together if the skull survives.', tags: ['undead', 'stal'], weakTo: ['light'], growthMods: { hp: -10, str: 5, lck: -10 } },
];
