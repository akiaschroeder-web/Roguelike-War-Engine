import type { EventDef } from '../../engine/types';
import { MINISH_ROUTE } from './regions';

const ALL = MINISH_ROUTE;
const fuse = (color: 'Green' | 'Blue' | 'Red' | 'Gold', text: string) => ({
  label: `Fuse ${color} Kinstones`, requires: { questCount: { [`kinstone${color}`]: 2 } },
  outcome: { text, effects: [{ kind: 'minish' as const, op: 'fuse', id: color.toLowerCase() }] },
});

// Encounters on the march: Kinstone fusions with the people you meet, the Picori Festival, the Minish
// villages, Carlov's Figurine Gallery, Melari's forge, the Blade Brothers, the library's missing books,
// the Wind Tribe, and the pests of the Minish Woods.
export const EVENTS: EventDef[] = [
  { id: 'kinstoneStranger', title: 'Fuse Kinstones?', art: 'forestMinish', regions: ALL,
    text: 'A passer-by holds up half of a Kinstone and raises an eyebrow. Somewhere in your bag, a piece with the same jagged edge is humming.',
    choices: [
      fuse('Green', 'The halves click together. Somewhere, a chest appears.'),
      fuse('Blue', 'A blue light goes up. Something has changed on the road ahead.'),
      fuse('Red', 'A red flash. A secret has opened.'),
      fuse('Gold', 'Gold light floods the sky. Far away, something great awakens.'),
      { label: 'Trade a few Rupees for a piece (₹80)', cost: 80, outcome: { text: '"Lucky you. I\'ve two of these."', effects: [{ kind: 'minish', op: 'kinstone' }] } },
    ] },
  { id: 'picoriFestival', title: 'The Picori Festival', art: 'zeldaMC', regions: ['hyruleTownMC'],
    text: 'Bunting over every street, a sword tournament in the square, and stalls selling Picori masks and Kinstone pieces. A princess is watching the fights.',
    choices: [
      { label: 'Enter the sword tournament', gamble: { chance: 55, win: { text: 'Champion! The prize is a sword… and an audience with the Minish.', effects: [{ kind: 'rupees', amount: 200 }, { kind: 'xp', amount: 30 }, { kind: 'minish', op: 'kinstone' }] },
        lose: { text: 'Knocked out in the second round. The crowd claps politely.', effects: [{ kind: 'xp', amount: 15 }] } } },
      { label: 'Buy festival Kinstones (₹120)', cost: 120, outcome: { text: 'A bag of mixed pieces.', effects: [{ kind: 'minish', op: 'kinstone' }, { kind: 'minish', op: 'kinstone' }] } },
      { label: 'Walk with the princess', requires: { unit: ['heroOfMinish', 'microLink'] }, outcome: { text: 'Zelda laughs all the way round the festival.', effects: [{ kind: 'recruit', pool: ['zeldaMC'] }] } },
    ] },
  { id: 'minishHouse', title: 'A Minish House', art: 'forestMinish', regions: ['hyruleTownMC', 'minishWoods', 'minishVillage', 'lakeHyliaMC', 'castorWilds'],
    text: 'Under a flowerpot there is a tiny door, and behind it a family of Minish having tea. They look at you with great suspicion.',
    choices: [
      { label: 'Speak to them (needs a Jabber Nut or a Minish)', requires: { quest: ['jabberNut'] }, outcome: { text: 'They brighten at once. "A friend of the Picori!" One of them packs a bag.', effects: [{ kind: 'recruit', pool: ['forestMinishScout', 'forestMinishHealer', 'townMinishThief', 'townMinishTinkerer'] }] } },
      { label: 'Trade a Kinstone', outcome: { text: 'They swap you a piece for a crumb of bread.', effects: [{ kind: 'minish', op: 'kinstone' }] } },
      { label: 'Leave them be', outcome: { text: 'You close the door gently.', effects: [{ kind: 'support', amount: 1 }] } },
    ] },
  { id: 'gentarisHall', title: "Gentari's Hall", art: 'gentari', regions: ['minishVillage', 'minishWoods'],
    text: 'An old Minish with a leaf for a hat peers up at you. "A Hylian who can see us. Then the tale of the Picori Blade is about to be told again."',
    choices: [
      { label: 'Listen to the old stories', outcome: { text: 'The Minish elders teach you their magic.', effects: [{ kind: 'xp', amount: 30 }, { kind: 'quest', id: 'jabberNut' }] } },
      { label: 'Ask Gentari to come', gamble: { chance: 45, win: { text: '"My knees are old, but my magic is not."', effects: [{ kind: 'recruit', pool: ['gentari'] }] }, lose: { text: '"The village needs me."', effects: [] } } },
      { label: 'Recruit Forest Minish', outcome: { text: 'Two young Minish volunteer.', effects: [{ kind: 'recruit', pool: ['forestMinishScout', 'forestMinishHealer'] }] } },
    ] },
  { id: 'melarisForge', title: "Melari's Forge", art: 'melari', regions: ['mountCrenel', 'caveOfFlames'],
    text: 'Inside the mountain, a Minish with a hammer bigger than himself is shouting at an anvil. "Broken blades! Bring me broken blades!"',
    choices: [
      { label: 'Have Melari reforge the Picori Blade', outcome: { text: 'Sparks fly for a day and a night. The White Sword gleams.', effects: [{ kind: 'minish', op: 'reforge' }] } },
      { label: 'Repair the army\'s weapons', outcome: { text: 'Every blade comes back sharper.', effects: [{ kind: 'minish', op: 'repairAll' }] } },
      { label: 'Ask Melari to join', gamble: { chance: 40, win: { text: '"Fine! But I ride on someone\'s shoulder."', effects: [{ kind: 'recruit', pool: ['melari'] }] }, lose: { text: '"Can\'t you see I\'m busy?"', effects: [] } } },
    ] },
  { id: 'carlovsGallery', title: "Carlov's Figurine Gallery", art: 'smith', regions: ['hyruleTownMC', 'lakeHyliaMC', 'cloudTops'],
    text: 'A little man with a monocle shows you shelves of tiny painted figurines. "Mysterious Shells, my friend. Five for a capsule."',
    choices: [
      { label: 'Trade 5 Mysterious Shells for a figurine', requires: { questCount: { mysteriousShell: 5 } }, outcome: { text: 'A capsule rolls out of the machine.', effects: [{ kind: 'minish', op: 'figurine' }] } },
      { label: 'Look at the collection', outcome: { text: 'Every monster in Hyrule, in miniature.', effects: [{ kind: 'xp', amount: 10 }] } },
    ] },
  { id: 'bladeBrothersDojo', title: "A Blade Brother's Dojo", art: 'swiftblade', regions: ['hyruleTownMC', 'castorWilds', 'royalValley', 'veilFalls'],
    text: 'Behind a sliding door, a swordmaster stands perfectly still. "You have a Tiger Scroll? Then show me your stance."',
    choices: [
      { label: 'Learn a technique (₹250)', cost: 250, outcome: { text: '"Again. Again. Good."', effects: [{ kind: 'minish', op: 'teach' }] } },
      { label: 'Spar for experience', outcome: { text: 'You leave bruised and better.', effects: [{ kind: 'xp', amount: 35 }, { kind: 'hp', pct: -0.1 }] } },
      { label: 'Ask the swordmaster to join', gamble: { chance: 35, win: { text: '"Very well. Someone must keep your elbow up."', effects: [{ kind: 'recruit', pool: ['swiftblade', 'greatblade', 'grimblade'] }] }, lose: { text: '"My students need me."', effects: [] } } },
    ] },
  { id: 'missingBooks', title: 'The Missing Library Books', art: 'forestMinish', regions: ['hyruleTownMC', 'lakeHyliaMC', 'royalValley'],
    text: 'A worried librarian: three books are overdue — a bestiary, a book about masks, and the Book of the Minish. A tiny voice from the top shelf adds: "And the Legend of the Picori!"',
    choices: [
      { label: 'Search for the books', outcome: { text: 'You find one under a bed and one in a well.', effects: [{ kind: 'quest', id: 'hyruleanBestiary' }, { kind: 'quest', id: 'bookOfTheMinish' }] } },
      { label: 'Climb up and meet the voice', outcome: { text: 'Librari, the Town Minish elder, waves from the top of a bookshelf.', effects: [{ kind: 'recruit', pool: ['librari'] }] } },
    ] },
  { id: 'picolyteGarden', title: 'The Picolyte Garden', art: 'forestMinish', regions: ['hyruleTownMC', 'minishVillage', 'castorWilds', 'lakeHyliaMC'],
    text: 'A woman in an apron is bottling bright liquids from a row of flowers. "Picolytes! Drink one before a fight and see what turns up."',
    choices: [
      { label: 'Buy a Picolyte (₹120)', cost: 120, outcome: { text: 'Still warm from the sun.', effects: [{ kind: 'minish', op: 'picolyte' }] } },
      { label: 'Help in the garden', outcome: { text: 'You leave with a Mysterious Shell she found in the soil.', effects: [{ kind: 'minish', op: 'shells', amount: 2 }] } },
    ] },
  { id: 'windTribeElder', title: 'The Wind Tribe', art: 'gregal', regions: ['veilFalls', 'cloudTops', 'palaceOfWinds', 'windRuins'],
    text: 'An old man in Wind Tribe robes sits by a Wind Crest. "The Ocarina of Wind remembers every crest it has heard."',
    choices: [
      { label: 'Ask for the Ocarina of Wind', requires: { noGear: ['ocarinaOfWind'] }, outcome: { text: 'A green ocarina with a bird on it.', effects: [{ kind: 'loot', ids: ['ocarinaOfWind'] }] } },
      { label: 'Ask Gregal to travel with you', gamble: { chance: 45, win: { text: '"The ground could use a little wind."', effects: [{ kind: 'recruit', pool: ['gregal'] }] }, lose: { text: '"My legs prefer clouds."', effects: [] } } },
    ] },
  { id: 'smithsForge', title: "Smith's Forge", art: 'smith', regions: ['hyruleTownMC', 'minishWoods'],
    text: 'Smith hammers away by the south road. "Link! Take this sword to the castle, would you? And mind the Octoroks."',
    choices: [
      { label: 'Deliver the sword', outcome: { text: 'The castle guards wave you through. A reward awaits.', effects: [{ kind: 'quest', id: 'smithsSwordDelivery' }, { kind: 'rupees', amount: 150 }] } },
      { label: 'Ask Smith to join', gamble: { chance: 40, win: { text: '"Someone has to keep that blade sharp."', effects: [{ kind: 'recruit', pool: ['smith'] }] }, lose: { text: '"The forge won\'t run itself."', effects: [] } } },
    ] },
  { id: 'percysVerse', title: 'A Wandering Poet', art: 'percy', regions: ALL,
    text: 'A man in a feathered hat stands on a crate and declaims to nobody in particular.',
    choices: [
      { label: 'Listen', outcome: { text: 'It is terrible. Everyone feels much better.', effects: [{ kind: 'support', amount: 2 }] } },
      { label: 'Invite him along', gamble: { chance: 55, win: { text: '"An epic needs a poet!"', effects: [{ kind: 'recruit', pool: ['percy'] }] }, lose: { text: '"I am between verses."', effects: [] } } },
    ] },
  { id: 'pestoSwarm', title: 'A Swarm of Pestos', art: 'pesto', regions: ['minishWoods', 'minishVillage', 'castorWilds', 'lakeHyliaMC'],
    text: 'At Minish size, flies are the size of hawks. A swarm of Pestos buzzes around a Mysterious Shell.',
    choices: [
      { label: 'Fight them off', outcome: { text: 'A bruising scramble, but the shell is yours.', effects: [{ kind: 'hp', pct: -0.1 }, { kind: 'minish', op: 'shells', amount: 2 }] } },
      { label: 'Tame one', gamble: { chance: 40, win: { text: 'It lands on your hand and stays.', effects: [{ kind: 'recruit', pool: ['pesto'] }] }, lose: { text: 'It stings and buzzes off.', effects: [{ kind: 'hp', pct: -0.05 }] } } },
    ] },
];
