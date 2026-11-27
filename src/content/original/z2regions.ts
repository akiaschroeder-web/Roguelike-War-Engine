// Zelda II: The Adventure of Link — the second chapter of the Original Hyrule campaign
// (design doc sections 9 and 10): North Castle, the six palaces that take a Palace
// Crystal each, the Great Palace, and the overworld around them, with the Old Man
// encounters that teach spells and the swordmasters who teach techniques.

import type { BaseTerrain, CommanderDef, EventDef, MapStyle, Terrain, WorldDef } from '../../engine/types';
import { GREAT_PALACE, PALACES } from './z2units';

const t = (plain: string, forest: string, mountain: string, water: string, wall: string, fort: string, lava: string): Record<BaseTerrain, string> =>
  ({ plain, forest, mountain, water, wall, fort, lava });
const r = (id: string, name: string, genre: string, blurb: string, color: string, terrainNames: Record<BaseTerrain, string>, terrainColors: Record<BaseTerrain, string>, map: MapStyle): WorldDef =>
  ({ id, name, genre, blurb, color, terrainNames, terrainColors, map, campaign: 'original' });

const PALACE: MapStyle = { forest: 0.3, mountain: 0.8, water: 'none', walls: 5, forts: 1 };
const PAL = (floor: string) => t(floor, 'Curtain', 'Pillar', 'Moat', 'Palace Wall', 'Statue Hall', 'Lava Pit');
const palColors = (floor: string, wall: string, fort: string) => t(floor, '#5a3a5a', '#6a6a7a', '#2a3a6a', wall, fort, '#d05020');

export const Z2_REGIONS: WorldDef[] = [
  r('northCastle', 'North Castle', 'Bits · Bots · Mobys · Gerus', 'Where the first Princess Zelda sleeps on her altar. Impa hands over the six crystals; the road west begins at the castle gate.',
    '#7a8a5a', t('Castle Lawn', 'Woods', 'Hills', 'Moat', 'Castle Wall', 'North Castle', 'Fire'), t('#7a9a5a', '#3a6a3a', '#7a7a5a', '#2a5a8a', '#4a4a3a', '#9a9a7a', '#d06030'),
    { forest: 1.5, mountain: 1, water: 'river', walls: 1, forts: 1 }),
  r('parapaPalace', 'Parapa Palace', 'Bots · Myus · Stalfos · Iron Knuckles', 'The first palace, past the Parapa Desert. Horsehead swings his mace at the end of the hall.',
    '#8a7a5a', PAL('Sandstone Floor'), palColors('#a08a60', '#4a3a2a', '#b09a70'), PALACE),
  r('z2Towns', 'The Towns of Hyrule', 'Moas · Wosus · Gerus', 'Rauru, Ruto, Saria, Mido, Nabooru, Darunia, New Kasuto: at night the Moas and Wosus walk the streets. Every town has an Old Man who knows a spell.',
    '#9a8a6a', t('Town Road', 'Orchard', 'Hills', 'Fountain', 'Town Wall', 'Town House', 'Fire'), t('#a89a72', '#4a7a3a', '#8a7a5a', '#3a6a9a', '#6a5a4a', '#b09a7a', '#d06030'),
    { forest: 1, mountain: 0.5, water: 'lake', walls: 2, forts: 3 }),
  r('z2DeathMountain', 'Death Mountain (Western Hyrule)', 'Dairas · Gerus · Moblins', 'A maze of caves and bridges where the Dairas throw their axes. The Hammer waits at the far end.',
    '#6a4a3a', t('Cave Floor', 'Dead Brush', 'Crag', 'Underground Spring', 'Cave Wall', 'Bridge', 'Lava'), t('#7a5a4a', '#4a3a2a', '#5a4a3a', '#2a3a5a', '#2a1a14', '#8a6a4a', '#e0502a'),
    { forest: 0.3, mountain: 3, water: 'none', walls: 4, forts: 1, lava: true }),
  r('midoroPalace', 'Midoro Palace', 'Myus · Magos · Iron Knuckles', 'A palace in the Midoro Swamp. Helmethead keeps losing his helmets — and they keep fighting.',
    '#5a7a6a', PAL('Swamp Stone'), palColors('#6a8a7a', '#2a3a32', '#7a9a8a'), { ...PALACE, water: 'moat' }),
  r('islandPalace', 'Island Palace', 'Iron Knuckles · Bago-Bagos', 'Across the water by raft. Rebonack rides an armored horse through its halls.',
    '#4a6a9a', PAL('Blue Stone'), palColors('#5a7aaa', '#22324a', '#6a8aba'), { ...PALACE, water: 'moat' }),
  r('mazeIslandPalace', 'Maze Island Palace', 'Moas · Gumas · Goriyas', 'A palace at the heart of a maze of rocks. Carock blinks from wall to wall; only reflected magic touches him.',
    '#6a5a8a', PAL('Violet Stone'), palColors('#7a6a9a', '#2a2240', '#8a7aaa'), PALACE),
  r('spectacleRock', 'Spectacle Rock', 'Dairas · Mobys · Tektites', 'Two great rings of rock in the east, full of caves. Mobys circle overhead.',
    '#7a7a7a', t('Rock Shelf', 'Scrub', 'Spectacle Rock', 'Rain Pool', 'Cliff', 'Cave Mouth', 'Fire'), t('#8a8a7a', '#5a6a4a', '#6a6a6a', '#3a5a7a', '#3a3a3a', '#9a8a7a', '#d06030'),
    { forest: 0.5, mountain: 3, water: 'none', walls: 3, forts: 1 }),
  r('palaceOnTheSea', 'Palace on the Sea', 'Fokkas · Fokkerus · Doomknockers', 'A palace standing in the eastern sea, reached with the Boots. Gooma whirls his ball and chain.',
    '#3a7a8a', PAL('Sea Stone'), palColors('#4a8a9a', '#1a3a42', '#5a9aaa'), { ...PALACE, water: 'lake' }),
  r('threeEyeRockPalace', 'Three-Eye Rock Palace', 'Fokkas · Magos · Doomknockers', 'Hidden inside Three-Eye Rock until the Hammer breaks it open. Barba rises out of the lava.',
    '#8a4a3a', PAL('Ember Stone'), palColors('#9a5a4a', '#3a1a14', '#aa6a5a'), { ...PALACE, lava: true }),
  r('valleyOfDeath', 'Valley of Death', 'Dairas · Gumas · Doomknockers', 'The last road to the Great Palace: a valley of rock and fire, held by the toughest monsters left in Hyrule.',
    '#5a3a3a', t('Scorched Earth', 'Dead Trees', 'Rocks', 'Bog', 'Valley Wall', 'Ruined Fort', 'Lava'), t('#6a4a3a', '#3a2a1a', '#5a4a4a', '#3a2a3a', '#2a1a1a', '#7a5a4a', '#e0402a'),
    { forest: 0.6, mountain: 2.5, water: 'none', walls: 3, forts: 1, lava: true }),
  r('greatPalace', 'The Great Palace', 'Fokkas · Thunderbird · Link\'s Shadow', 'Opened by six Palace Crystals. Thunderbird guards the Triforce of Courage — and when it falls, the hero\'s own shadow stands up to fight.',
    '#6a6a8a', PAL('Great Hall'), palColors('#7a7a9a', '#2a2a3a', '#9a9aba'), { ...PALACE, walls: 6, lava: true }),
];

/** Zelda II battlefield spaces in each region (section 9). Palaces get a Palace Statue. */
export const Z2_FEATURES: Record<string, Partial<Record<Terrain, number>>> = {
  northCastle: { burnableBush: 1, riverDevil: 1, fallingBoulderZone: 1 },
  parapaPalace: { palaceStatue: 1, collapsingFloor: 2, elevator: 2, fallingBlock: 1, lockedDoor: 1 },
  z2Towns: { narrowPassage: 1, riverDevil: 1, secretCave: 1 },
  z2DeathMountain: { fallingBoulderZone: 3, collapsingFloor: 2, narrowPassage: 1, cracked: 1 },
  midoroPalace: { palaceStatue: 1, collapsingFloor: 2, elevator: 2, fallingBlock: 2, lockedDoor: 1 },
  islandPalace: { palaceStatue: 1, elevator: 2, fallingBlock: 1, collapsingFloor: 1, narrowPassage: 1, lockedDoor: 1 },
  mazeIslandPalace: { palaceStatue: 1, narrowPassage: 2, collapsingFloor: 2, elevator: 2, lockedDoor: 1 },
  spectacleRock: { fallingBoulderZone: 2, narrowPassage: 1, secretCave: 1 },
  palaceOnTheSea: { palaceStatue: 1, fallingBlock: 2, elevator: 2, collapsingFloor: 2, lockedDoor: 1 },
  threeEyeRockPalace: { palaceStatue: 1, fallingBlock: 2, collapsingFloor: 2, elevator: 2, narrowPassage: 1 },
  valleyOfDeath: { fallingBoulderZone: 3, riverDevil: 1, collapsingFloor: 1 },
  greatPalace: { fallingBlock: 2, collapsingFloor: 3, elevator: 2, narrowPassage: 1 },
};

export const Z2_REGION_IDS = Z2_REGIONS.map((x) => x.id);
const TOWN_REGIONS = ['z2Towns', 'northCastle', 'z2DeathMountain', 'spectacleRock'];
const ALL = Z2_REGION_IDS;
const aol = (op: string, id?: string) => ({ kind: 'aol' as const, op, id });

export const Z2_EVENTS: EventDef[] = [
  { id: 'z2SleepingPrincess', title: 'The Sleeping Princess', art: 'sleepingZelda', regions: ['northCastle'],
    text: 'Behind a locked door in North Castle a princess lies on an altar, asleep for longer than anyone can remember. Impa whispers: "Only the Triforce of Courage can wake her."',
    choices: [
      { label: 'Keep watch at her side', outcome: { text: 'Her sleep is lighter with you there. When the army moves on, she moves with it — still dreaming, but awake enough to help.', effects: [{ kind: 'recruit', pool: ['sleepingZelda'] }] } },
      { label: 'Take the six crystals from Impa', outcome: { text: '"Place them in the statues of the six palaces." The crystals hum in their box.', effects: [{ kind: 'xp', amount: 20 }] } },
    ] },
  { id: 'z2OldManRauru', title: 'The Old Man of Rauru', art: 'oldMan', regions: TOWN_REGIONS,
    text: 'An old man waits at the back of a house in Rauru. "If you can find my house, I will teach you magic." He knows two spells, and the woman of Ruto has a third reason to talk.',
    choices: [
      { label: 'Learn Shield (₹80)', cost: 80, outcome: { text: '"Magic like a wall around you."', effects: [aol('spell', 'spellShield')] } },
      { label: 'Return the Trophy in Ruto: learn Jump', requires: { quest: ['trophy'] }, outcome: { text: 'The old woman is overjoyed. Her husband teaches the Jump spell.', effects: [{ kind: 'takeQuest', id: 'trophy' }, aol('spell', 'spellJump')] } },
      { label: 'Ask about the palaces', outcome: { text: '"Six palaces, six statues. A crystal for each, once its guardian falls."', effects: [{ kind: 'xp', amount: 15 }] } },
    ] },
  { id: 'z2OldManSaria', title: 'The Old Man of Saria', art: 'oldMan', regions: TOWN_REGIONS,
    text: 'Across the river in Saria an old man is very upset about a mirror. In Mido, a mother says her child is sick: only the Water of Life can help.',
    choices: [
      { label: 'Return the Lost Mirror: learn Life', requires: { quest: ['lostMirror'] }, outcome: { text: '"My mirror! I owe you a spell." He teaches Life.', effects: [{ kind: 'takeQuest', id: 'lostMirror' }, aol('spell', 'spellLife')] } },
      { label: 'Bring the Water of Life to Mido: learn Fairy', requires: { gear: ['waterOfLife'] }, outcome: { text: 'The child sips and sits up. Upstairs, an old man teaches Fairy.', effects: [aol('take', 'waterOfLife'), aol('spell', 'spellFairy')] } },
      { label: 'Learn Life the hard way (₹200)', cost: 200, outcome: { text: 'He grumbles, but takes the Rupees and teaches you Life.', effects: [aol('spell', 'spellLife')] } },
      { label: 'Search the house', requires: { noQuest: ['lostMirror'] }, gamble: { chance: 55,
        win: { text: 'Under a table: a small hand mirror. Someone in Saria must be missing it.', effects: [{ kind: 'quest', id: 'lostMirror' }] },
        lose: { text: 'Dust, and a cat.', effects: [] } } },
    ] },
  { id: 'z2OldManNabooru', title: 'The Old Man of Nabooru', art: 'oldMan', regions: TOWN_REGIONS,
    text: 'By the fountain of Nabooru, a woman wants water. Past Death Mountain, in Darunia, a child has been carried off and an old man sits waiting.',
    choices: [
      { label: 'Fetch fountain water: learn Fire (₹120)', cost: 120, outcome: { text: 'Her grandfather teaches Fire.', effects: [aol('spell', 'spellFire')] } },
      { label: 'Rescue the child of Darunia: learn Reflect', gamble: { chance: 60,
        win: { text: 'You bring the child home from Death Mountain. Reflect is yours.', effects: [aol('spell', 'spellReflect')] },
        lose: { text: 'The trail goes cold in the caves. You come back tired.', effects: [{ kind: 'hp', pct: -0.1 }] } } },
      { label: 'Pay for Reflect (₹260)', cost: 260, outcome: { text: '"Magic bounces off a good shield."', effects: [aol('spell', 'spellReflect')] } },
    ] },
  { id: 'z2OldManKasuto', title: 'The Old Men of Kasuto', art: 'oldMan', regions: ['z2Towns', 'valleyOfDeath', 'spectacleRock'],
    text: 'New Kasuto hides behind a forest; old Kasuto lies in ruins across the desert. The last two spells are taught only to those who have proved themselves.',
    choices: [
      { label: 'Learn Spell (3 Palace Crystals, ₹150)', cost: 150, requires: { questCount: { palaceCrystal: 3 } }, outcome: { text: 'An old woman behind a locked door teaches Spell.', effects: [aol('spell', 'spellSpell')] } },
      { label: 'Learn Thunder (5 Palace Crystals)', requires: { questCount: { palaceCrystal: 5 } }, outcome: { text: 'In the ruins of old Kasuto, a sage gives you the strongest magic in Hyrule: Thunder.', effects: [aol('spell', 'spellThunder')] } },
      { label: 'Search the ruins', outcome: { text: 'Among the stones: a Magic Container and an old bag of experience.', effects: [{ kind: 'loot', ids: ['experienceBag', 'magicContainer'] }] } },
    ] },
  { id: 'z2Swordmaster', title: 'The Swordmasters', art: 'heroOfHyruleZ2', regions: ['z2Towns', 'northCastle', 'spectacleRock'],
    text: 'Two knights in Mido and New Kasuto still teach the old sword arts — to anyone who carries a sword and can keep up.',
    choices: [
      { label: 'Train: Downward Thrust (₹100)', cost: 100, outcome: { text: '"Jump, and point your sword down." It works better than it sounds.', effects: [aol('technique', 'downwardThrust')] } },
      { label: 'Train: Upward Thrust (2 Palace Crystals)', requires: { questCount: { palaceCrystal: 2 } }, outcome: { text: '"Strike above you — the birds won\'t expect it."', effects: [aol('technique', 'upwardThrust')] } },
      { label: 'Spar', outcome: { text: 'Bruised but wiser.', effects: [{ kind: 'xp', amount: 20 }, { kind: 'hp', pct: -0.05 }] } },
    ] },
  { id: 'z2StolenTrophy', title: 'The Stolen Trophy', art: 'goriya', regions: ALL,
    text: 'The people of Ruto say a monster stole their trophy and carried it off to a cave near the town.',
    choices: [
      { label: 'Go after it', requires: { noQuest: ['trophy'] }, gamble: { chance: 65,
        win: { text: 'A Goriya, sleeping on a pile of loot. The Trophy is yours.', effects: [{ kind: 'quest', id: 'trophy' }, { kind: 'xp', amount: 10 }] },
        lose: { text: 'A Goriya, wide awake. You come away with bruises.', effects: [{ kind: 'hp', pct: -0.08 }] } } },
      { label: 'Leave it', outcome: { text: 'Someone else\'s trophy.', effects: [] } },
    ] },
  { id: 'z2IAmError', title: 'I Am Error', art: 'oldMan', regions: ['z2Towns'],
    text: 'A man in Ruto introduces himself. "I am Error." His friend Bagu, he says, knows how to get past the River Devil.',
    choices: [
      { label: 'Ask for Bagu\'s note', outcome: { text: 'A scrap of paper: "Let this one cross." Bagu also left a Link Doll.', effects: [{ kind: 'loot', ids: ['linkDoll'] }] } },
      { label: 'Talk a while', outcome: { text: 'You learn a great deal about errors.', effects: [{ kind: 'xp', amount: 15 }] } },
    ] },
  { id: 'z2PalaceStatue', title: 'An Empty Statue', art: 'heroOfHyruleZ2', regions: [...PALACES, GREAT_PALACE],
    text: 'In a side hall stands a stone statue with an empty socket where a crystal should go. Behind it, something glints.',
    choices: [
      { label: 'Search behind it', gamble: { chance: 60,
        win: { text: 'A P-Bag and a key.', effects: [{ kind: 'loot', ids: ['experienceBag', 'smallKey', 'linkDoll', 'waterOfLife'] }] },
        lose: { text: 'A Myu was hiding there too.', effects: [{ kind: 'hp', pct: -0.06 }] } } },
      { label: 'Rest in the hall', outcome: { text: 'The palace is quiet for a while.', effects: [{ kind: 'hp', pct: 0.2 }] } },
    ] },
  { id: 'z2HealingFountain', title: 'A Healer in the Town', art: 'oldWoman', regions: ALL,
    text: 'A woman beckons from a doorway. "You look terrible. Come in."',
    choices: [
      { label: 'Rest (heal 30%)', outcome: { text: 'Hearts, and a red jar of magic.', effects: [{ kind: 'hp', pct: 0.3 }] } },
      { label: 'Ask for Water of Life (₹120)', cost: 120, outcome: { text: 'She fills a bottle for you.', effects: [{ kind: 'loot', ids: ['waterOfLife'] }] } },
    ] },
];

/** The Sleeping Princess commander (section 12). */
export const Z2_COMMANDERS: CommanderDef[] = [
  { heroId: 'sleepingZelda', armyName: 'Sleeping Princess Zelda', units: ['heroOfHyrule', 'oldMan', 'hyruleKnight'], bonus: 'ancientMagic', campaign: 'original',
    bonusText: 'Learned spells cost 20% less MP; Palace Crystal rewards give 25% more experience. The campaign begins at North Castle.', startingItems: ['waterOfLife', 'linkDoll'] },
];
