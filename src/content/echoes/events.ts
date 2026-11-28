import type { EventDef } from '../../engine/types';
import { ECHOES_ROUTE } from './regions';

const ALL = ECHOES_ROUTE;

// Encounters on the march: Echo learning, Lueburry's crystals, Dampé's studio, the Stamp Rally, smoothies, Tri's
// friends, the false court, and the people of the regions.
export const EVENTS: EventDef[] = [
  { id: 'echoOfTheWorld', title: 'Something Worth Copying', art: 'zeldaEoW', regions: ALL,
    text: 'An odd thing sits by the road — a trampoline, a torch, a sign, a cloud that never drifts. Tri bobs around it. "We could learn that one, Zelda!"',
    choices: [
      { label: 'Study it with the Tri Rod', outcome: { text: 'The rod hums. A new Echo is written into the Compendium.', effects: [{ kind: 'echoes', op: 'learnObject' }] } },
      { label: 'Copy a monster track instead', outcome: { text: 'The rod remembers the shape of whatever passed this way.', effects: [{ kind: 'echoes', op: 'learnMonster' }] } },
    ] },
  { id: 'lueburrysHouse', title: "Lueburry's House", art: 'lueburry', regions: ['suthornForest', 'hyruleCastleEoW', 'eternalForest'],
    text: 'An old man with swirling glasses waves you into a house full of humming crystals. "Might Crystals! They hold the power of that swordsman. Fascinating!"',
    choices: [
      { label: 'Trade Rupees for a Might Crystal (₹150)', cost: 150, outcome: { text: 'A crystal the size of a fist, warm to the touch.', effects: [{ kind: 'echoes', op: 'mightCrystal' }] } },
      { label: 'Ask Lueburry to come along', gamble: { chance: 45, win: { text: '"Field research! Wonderful!"', effects: [{ kind: 'recruit', pool: ['lueburry'] }] }, lose: { text: '"My experiments, my dear, my experiments!"', effects: [] } } },
    ] },
  { id: 'dampesStudio', title: "Dampé's Studio", art: 'dampeEoW', regions: ['eternalForest', 'suthornForest', 'hebraMountain'],
    text: 'A workshop of springs and gears. A bearded man wipes his hands. "Bring me a Monster Stone and I\'ll build you an Automaton that never tires — well, until it needs winding."',
    choices: [
      { label: 'Commission an Automaton (needs a Monster Stone)', requires: { quest: ['monsterStone'] }, outcome: { text: 'Clank, whirr, tick. It salutes.', effects: [{ kind: 'takeQuest', id: 'monsterStone' }, { kind: 'recruit', pool: ['techtite', 'tocktorok', 'gizmol', 'highTekuBaba'] }] } },
      { label: 'Ask Dampé to join', gamble: { chance: 40, win: { text: '"Someone has to keep the gears turning."', effects: [{ kind: 'recruit', pool: ['dampeEoW'] }] }, lose: { text: '"The studio won\'t run itself."', effects: [] } } },
      { label: 'Buy a Clockwork Key (₹100)', cost: 100, outcome: { text: 'A brass key on a string.', effects: [{ kind: 'loot', ids: ['clockworkKey'] }] } },
    ] },
  { id: 'stampStationEvent', title: 'A Stamp Station', art: 'stampGuy', regions: ALL,
    text: 'A little booth with an ink pad and a very large rubber stamp. A man in a stamp-covered suit leaps out of a bush. "You found one! Stamp it, stamp it!"',
    choices: [
      { label: 'Stamp your card', outcome: { text: 'THWACK. A perfect impression.', effects: [{ kind: 'echoes', op: 'stamp', amount: 1 }] } },
      { label: 'Invite the Stamp Guy along', gamble: { chance: 50, win: { text: '"I\'ll come! There must be stations ahead!"', effects: [{ kind: 'recruit', pool: ['stampGuy'] }] }, lose: { text: '"I must guard this one."', effects: [] } } },
    ] },
  { id: 'smoothieStand', title: 'A Smoothie Stand', art: 'tri', regions: ALL,
    text: 'A cheerful stand with a blender the size of a barrel. "Two ingredients and a few Rupees, and I\'ll blend you anything!"',
    choices: [
      { label: 'Buy a fresh smoothie (₹60)', cost: 60, outcome: { text: 'Cold, sweet, and faintly glowing.', effects: [{ kind: 'echoes', op: 'smoothie' }] } },
      { label: 'Sell some ingredients', outcome: { text: 'She pays for your spare grapes.', effects: [{ kind: 'echoes', op: 'ingredient', amount: 2 }] } },
    ] },
  { id: 'triFriendGlimmer', title: 'A Glimmer in the Rift', art: 'tri', regions: ALL,
    text: 'A small light flickers on the far side of a crack in the world. Tri goes very still. "That\'s one of my friends!"',
    choices: [
      { label: 'Reach into the Rift', gamble: { chance: 60, win: { text: 'The light comes free and settles beside Tri, who glows brighter than ever.', effects: [{ kind: 'echoes', op: 'triXp', amount: 1 }] },
        lose: { text: 'The Rift snaps at your fingers. The light retreats, but it is still there.', effects: [{ kind: 'hp', pct: -0.1 }] } } },
      { label: 'Mark it for later', outcome: { text: 'Tri memorises the place.', effects: [{ kind: 'xp', amount: 15 }] } },
    ] },
  { id: 'falseCourt', title: 'The False Court', art: 'kingEoW', regions: ['hyruleCastleEoW', 'suthornForest'],
    text: 'Soldiers in the castle colours bar the road. "By order of the king, the impostor princess is to be arrested!" Behind them, a minister with purple hair is making frantic faces.',
    choices: [
      { label: 'Talk to the minister', outcome: { text: 'Lefte slips away from the soldiers and joins you. "The king on the throne is not the king."', effects: [{ kind: 'recruit', pool: ['ministerLefte'] }] } },
      { label: 'Find the general', gamble: { chance: 45, win: { text: 'General Wright takes off his helmet. "My orders came from a copy. I serve the real crown."', effects: [{ kind: 'recruit', pool: ['generalWright'] }] },
        lose: { text: 'The general isn\'t convinced yet.', effects: [{ kind: 'support', amount: 1 }] } } },
    ] },
  { id: 'gerudoSanctumEvent', title: 'The Gerudo Sanctum', art: 'chiefSeera', regions: ['gerudoDesertEoW'],
    text: 'A red-haired chief with a trident receives you in the Sanctum. "A princess who copies monsters. Prove you are not another trick of the sand."',
    choices: [
      { label: 'Spar with Captain Dohna', gamble: { chance: 50, win: { text: '"…Not bad." Dohna joins you.', effects: [{ kind: 'recruit', pool: ['dohna'] }] }, lose: { text: 'You are flat on the sand. "Again tomorrow."', effects: [{ kind: 'xp', amount: 20 }] } } },
      { label: 'Ask Seera for her warriors', outcome: { text: 'Two Gerudo Guards fall in behind you.', effects: [{ kind: 'recruit', pool: ['gerudoGuard', 'gerudoThief'] }] } },
    ] },
  { id: 'zoraQuarrel', title: 'The Zora Quarrel', art: 'dradd', regions: ['jabulWaters', 'wreckedShip'],
    text: 'A drum booms upstream and a harp answers from the sea. River Zora and Sea Zora are about to come to blows over a sandbar.',
    choices: [
      { label: 'Side with Dradd and the River Zora', outcome: { text: 'Dradd thumps his belly. "Ha! Someone with sense!"', effects: [{ kind: 'recruit', pool: ['dradd'] }] } },
      { label: 'Side with Kushara and the Sea Zora', outcome: { text: 'Kushara bows over her harp. "Thank you. The sea will remember."', effects: [{ kind: 'recruit', pool: ['kushara'] }] } },
      { label: 'Make them shake hands', outcome: { text: 'Grudgingly, they do. Everyone feels better.', effects: [{ kind: 'support', amount: 2 }, { kind: 'echoes', op: 'ingredient', amount: 2 }] } },
    ] },
  { id: 'hebraGiant', title: 'A Gentle Giant', art: 'conde', regions: ['hebraMountain'],
    text: 'Through the blizzard comes a giant with a snow shovel, clearing a path for no one in particular. "Cold out. Come in, come in."',
    choices: [
      { label: 'Warm up in Condé\'s lodge', outcome: { text: 'Hot soup and a fire. Everyone rests.', effects: [{ kind: 'hp', pct: 0.3 }] } },
      { label: 'Ask him to come', gamble: { chance: 45, win: { text: '"Someone has to clear the snow for you."', effects: [{ kind: 'recruit', pool: ['conde'] }] }, lose: { text: '"The mountain needs me."', effects: [] } } },
    ] },
  { id: 'goronCourage', title: "Darston's Village", art: 'darston', regions: ['eldinVolcanoEoW'],
    text: 'A yellow Goron with a beak-like face stomps over. "The Rift took the hot springs! Whoever fixes it gets a Goron friend for life!"',
    choices: [
      { label: 'Promise to fix it', outcome: { text: '"That\'s courage, goro!" Darston comes with you.', effects: [{ kind: 'recruit', pool: ['darston'] }] } },
      { label: 'Recruit Goron volunteers', outcome: { text: 'Two Gorons roll up.', effects: [{ kind: 'recruit', pool: ['goronWarrior', 'goronRoller'] }] } },
    ] },
  { id: 'impasHideout', title: "Impa's Hideout", art: 'impaEoW', regions: ['hyruleCastleEoW', 'suthornForest'],
    text: 'An old woman with a cane appears where nobody was a moment ago. "Princess. I told you not to go off alone."',
    choices: [
      { label: 'Let Impa come', outcome: { text: '"Someone must keep you out of trouble."', effects: [{ kind: 'recruit', pool: ['impaEoW'] }] } },
      { label: 'Ask for news', outcome: { text: 'She tells you where the next Rift opened.', effects: [{ kind: 'xp', amount: 20 }, { kind: 'echoes', op: 'learnMonster' }] } },
    ] },
];
