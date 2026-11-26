import type { EventDef } from '../../engine/types';
import { LEVELS } from './regions';

const EARLY = LEVELS.slice(0, 4);
const LATE = LEVELS.slice(4);

// Caves and secrets of the first Hyrule (section 8's Secret Cave and Hidden Staircase, on the march).
export const EVENTS: EventDef[] = [
  { id: 'oldMansCave', title: "The Old Man's Cave", art: 'oldMan', regions: LEVELS,
    text: 'Two fires burn at the back of a cave. Between them stands an old man with a staff. "It\'s dangerous to go alone! Take this."',
    choices: [
      { label: 'Take the sword', requires: { noGear: ['whiteSword', 'magicalSword'] }, outcome: { text: 'A blade that hums in your hand: the White Sword.', effects: [{ kind: 'loot', ids: ['whiteSword'] }] } },
      { label: 'Ask for the Magical Sword', requires: { gear: ['whiteSword'], noGear: ['magicalSword'] }, gamble: { chance: 45,
        win: { text: '"Master using it and you can have this." The Magical Sword is yours.', effects: [{ kind: 'loot', ids: ['magicalSword'] }] },
        lose: { text: '"Master using it and you can have this." He clearly doesn\'t think you have. Yet.', effects: [{ kind: 'xp', amount: 15 }] } } },
      { label: 'Listen to his advice', outcome: { text: '"Eastmost peninsula is the secret." Or something like it. You understand a little more.', effects: [{ kind: 'xp', amount: 25 }] } },
      { label: 'Ask him to come along', requires: { noGear: ['letter'] }, outcome: { text: 'He hands you a Letter. "Show this to the old woman." Then he picks up his staff.', effects: [{ kind: 'loot', ids: ['letter'] }, { kind: 'recruit', pool: ['oldMan'] }] } },
    ] },
  { id: 'oldWomansCave', title: "The Old Woman's Medicine", art: 'oldWoman', regions: LEVELS,
    text: 'An old woman in red sits by her shelf of bottles. "Buy medicine before you go." She looks at your hands, waiting for a letter.',
    choices: [
      { label: 'Show the Letter: Blue Life Medicine (₹120)', requires: { gear: ['letter'] }, cost: 120, outcome: { text: 'A small blue bottle. It smells terrible.', effects: [{ kind: 'loot', ids: ['blueLifeMedicine'] }] } },
      { label: 'Show the Letter: Red Life Medicine (₹220)', requires: { gear: ['letter'] }, cost: 220, outcome: { text: 'A red bottle, two doses. "Don\'t waste it."', effects: [{ kind: 'loot', ids: ['redLifeMedicine'] }] } },
      { label: 'Show the Letter and ask her to join you', requires: { gear: ['letter'] }, outcome: { text: '"Someone has to keep you alive." She packs her bottles.', effects: [{ kind: 'recruit', pool: ['oldWoman'] }] } },
      { label: 'No letter? Ask anyway', outcome: { text: 'She shakes her head and offers you some tea instead.', effects: [{ kind: 'hp', pct: 0.1 }] } },
    ] },
  { id: 'merchantsCave', title: 'Buy Somethin\', Will Ya!', art: 'merchant1', regions: LEVELS,
    text: 'Behind a burnt bush, a merchant has set out his wares on the cave floor. "Buy somethin\', will ya!"',
    choices: [
      { label: 'Blue Candle (₹60)', cost: 60, outcome: { text: '"A fine light!"', effects: [{ kind: 'loot', ids: ['blueCandle'] }] } },
      { label: 'Magical Shield (₹160)', cost: 160, outcome: { text: 'It\'s heavy, and it shines.', effects: [{ kind: 'loot', ids: ['magicalShield'] }] } },
      { label: 'Food and Bombs (₹60)', cost: 60, outcome: { text: 'Meat for the Goriya and bombs for the walls.', effects: [{ kind: 'loot', ids: ['enemyBait'] }, { kind: 'loot', ids: ['bomb'] }] } },
      { label: 'Blue Ring (₹250)', cost: 250, outcome: { text: '"That\'s my best piece!"', effects: [{ kind: 'loot', ids: ['blueRing'] }] } },
      { label: 'Hire him', outcome: { text: '"A cut of everything, mind." He shoulders his pack.', effects: [{ kind: 'recruit', pool: ['merchantHyrule'] }] } },
    ] },
  { id: 'secretToEverybody', title: "It's a Secret to Everybody", art: 'merchant1', regions: LEVELS,
    text: 'You bomb a wall and find a Moblin sitting in a cave. "It\'s a secret to everybody." It pushes a pile of Rupees toward you.',
    choices: [
      { label: 'Take the Rupees', outcome: { text: 'You don\'t ask questions.', effects: [{ kind: 'rupees', amount: 100 }] } },
      { label: 'Ask it to join', gamble: { chance: 40, win: { text: 'It shrugs, gets up and follows you.', effects: [{ kind: 'recruit', pool: ['moblin'] }] }, lose: { text: 'It shrugs and goes back to sitting.', effects: [{ kind: 'rupees', amount: 30 }] } } },
    ] },
  { id: 'doorRepair', title: 'Pay Me for the Door Repair Charge', art: 'merchant1', regions: LEVELS,
    text: 'You blow open a cave wall. The man inside is not pleased. "Pay me for the door repair charge."',
    choices: [
      { label: 'Pay (₹20)', cost: 20, outcome: { text: 'Fair is fair.', effects: [{ kind: 'support', amount: 1 }] } },
      { label: 'Run for it', gamble: { chance: 50, win: { text: 'Out before he can count.', effects: [] }, lose: { text: 'He takes it out of your pockets.', effects: [{ kind: 'rupees', amount: -40 }] } } },
    ] },
  { id: 'moneyMakingGame', title: 'Money Making Game', art: 'merchant1', regions: LEVELS,
    text: 'Three Rupees face down on the cave floor. "Let\'s play a money making game." One is worth a lot. One will cost you.',
    choices: [
      { label: 'Bet ₹10', cost: 10, gamble: { chance: 45, win: { text: 'Big winner!', effects: [{ kind: 'rupees', amount: 60 }] }, lose: { text: 'Lost it all.', effects: [] } } },
      { label: 'Bet ₹40', cost: 40, gamble: { chance: 40, win: { text: 'The crowd (a Moblin) cheers.', effects: [{ kind: 'rupees', amount: 200 }] }, lose: { text: 'Gone.', effects: [] } } },
      { label: 'Walk away', outcome: { text: 'The smart move.', effects: [] } },
    ] },
  { id: 'hiddenStaircase', title: 'A Hidden Staircase', art: 'link1', regions: EARLY,
    text: 'Pushing a block in an empty room reveals a staircase going down into the dark.',
    choices: [
      { label: 'Go down', gamble: { chance: 65,
        win: { text: 'A treasure room: a chest at the end of a narrow corridor.', effects: [{ kind: 'loot', ids: ['raft', 'stepladder', 'blueCandle', 'magicalBoomerang', 'bookOfMagic'] }] },
        lose: { text: 'Keese, hundreds of them. You come back up scratched and empty-handed.', effects: [{ kind: 'hp', pct: -0.08 }] } } },
      { label: 'Leave it', outcome: { text: 'Some secrets stay secret.', effects: [] } },
    ] },
  { id: 'deepStaircase', title: 'The Deep Staircase', art: 'link1', regions: LATE,
    text: 'Under a burnt bush, a staircase. The air coming up it is cold.',
    choices: [
      { label: 'Go down', gamble: { chance: 55,
        win: { text: 'Treasure from the old kingdom.', effects: [{ kind: 'loot', ids: ['redCandle', 'magicalKey', 'silverArrow', 'redLifeMedicine', 'magicalRod', 'redRing'] }] },
        lose: { text: 'A Wallmaster drags someone halfway back to the entrance. Everyone is shaken.', effects: [{ kind: 'hp', pct: -0.12 }] } } },
      { label: 'Leave it', outcome: { text: 'Probably for the best.', effects: [] } },
    ] },
  { id: 'fairyFountainHyrule', title: 'A Fairy Pond', art: 'link1', regions: LEVELS,
    text: 'Fairies circle a little pond in a quiet room of the dungeon.',
    choices: [
      { label: 'Rest', outcome: { text: 'Hearts float up out of the water.', effects: [{ kind: 'hp', pct: 0.35 }] } },
      { label: 'Catch a fairy', outcome: { text: 'One for the road.', effects: [{ kind: 'loot', ids: ['fairy'] }] } },
    ] },
];
