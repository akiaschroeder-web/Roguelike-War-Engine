import type { EventDef } from '../../engine/types';

const TP = ['ordonProvince', 'faronWoods', 'eldinProvince', 'lanayruProvince', 'hyruleFieldTP', 'gerudoDesertTP', 'snowpeak', 'sacredGrove', 'cityInTheSky', 'hyruleCastleTP'];
const FIELD = ['hyruleFieldTP', 'eldinProvince', 'lanayruProvince', 'faronWoods', 'ordonProvince'];

export const EVENTS: EventDef[] = [
  // ── The Hero's Shade and the Howling Stones ──
  { id: 'howlingStone', title: 'A Howling Stone', art: 'wolfLinkMidna', regions: TP,
    text: 'A carved stone stands in the grass, wind whistling through its holes. It sounds almost like a song.',
    choices: [
      { label: 'Howl the melody (Wolf Link)', requires: { unit: ['wolfLink', 'heroOfTwilight'] }, outcome: { text: 'A golden wolf answers from far away. That night, a skeletal warrior is waiting in the fog.', effects: [{ kind: 'hiddenSkill' }, { kind: 'xp', amount: 15 }] } },
      { label: 'Listen a while', outcome: { text: 'The tune stays in your head for days.', effects: [{ kind: 'support', amount: 2 }] } },
    ] },
  { id: 'shadeTraining', title: 'The Hero\'s Shade', art: 'herosShade', regions: TP, requires: { unit: ['herosShade'] },
    text: '"Draw your sword. There is something I must teach you." The old spirit takes one of your swordsmen aside.',
    choices: [
      { label: 'Train through the night', outcome: { text: 'Bruised, exhausted, and better than before.', effects: [{ kind: 'hiddenSkill' }, { kind: 'hp', pct: -0.1 }] } },
      { label: 'Not tonight', outcome: { text: '"When you are ready, then."', effects: [] } },
    ] },
  // ── Ordon and Kakariko ──
  { id: 'ordonRanch', title: 'Ordon Ranch', art: 'ilia', regions: ['ordonProvince'],
    text: 'The goats have broken out again, and Fado is nowhere to be found.',
    choices: [
      { label: 'Herd the goats', gamble: { chance: 70,
        win: { text: 'Every goat back in the barn. The village sends you off with pumpkins and cheese.', effects: [{ kind: 'quest', id: 'ordonPumpkin' }, { kind: 'quest', id: 'ordonGoatCheese' }, { kind: 'supplies', amount: 4 }] },
        lose: { text: 'A goat flattens you. The cheese is still very good.', effects: [{ kind: 'quest', id: 'ordonGoatCheese' }, { kind: 'hp', pct: -0.05 }] } } },
      { label: 'Ride on', outcome: { text: 'Someone else\'s problem today.', effects: [] } },
    ] },
  { id: 'sloopsShield', title: "Jaggle's Rooftop", art: 'rusl', regions: ['ordonProvince'], requires: { noGear: ['woodenShieldTP'] },
    text: 'A wooden shield hangs on a wall in Ordon. Its owner says you can have it if you can get it down without breaking anything.',
    choices: [{ label: 'Climb up', outcome: { text: 'A sturdy Wooden Shield.', effects: [{ kind: 'loot', ids: ['woodenShieldTP'] }] } }, { label: 'Leave it', outcome: { text: 'Some other day.', effects: [] } }] },
  { id: 'maloMart', title: 'Malo Mart', art: 'malo', regions: ['eldinProvince', 'hyruleFieldTP'],
    text: '"Welcome to Malo Mart." The toddler behind the counter does not smile.',
    choices: [
      { label: 'Hylian Shield (₹200)', cost: 200, outcome: { text: '"Thank you for your patronage."', effects: [{ kind: 'loot', ids: ['hylianShield'] }] } },
      { label: 'Lantern Oil and Red Potion (₹60)', cost: 60, outcome: { text: '"Come again."', effects: [{ kind: 'loot', ids: ['lanternOil'] }, { kind: 'loot', ids: ['redPotion'] }] } },
      { label: 'Invest in the Castle Town branch (₹300)', cost: 300, requires: { noQuest: ['maloMartCastle'] }, outcome: { text: 'Malo nods once. Prices drop everywhere.', effects: [{ kind: 'quest', id: 'maloMartCastle' }, { kind: 'rupees', amount: 50 }] } },
      { label: 'Just looking', outcome: { text: '"..."', effects: [] } },
    ] },
  { id: 'barnesBombShop', title: "Barnes Bombs", art: 'barnes', regions: ['eldinProvince'],
    text: '"BOMBS! Get yer BOMBS! What? Speak up!"',
    choices: [
      { label: 'Water Bombs (₹120)', cost: 120, outcome: { text: 'They slosh a bit.', effects: [{ kind: 'loot', ids: ['waterBomb'] }] } },
      { label: 'Bomblings (₹200)', cost: 200, outcome: { text: 'They wriggle.', effects: [{ kind: 'loot', ids: ['bomblingItem'] }] } },
      { label: 'Leave', outcome: { text: '"WHAT?"', effects: [] } },
    ] },
  { id: 'renadoSanctuary', title: 'Kakariko Sanctuary', art: 'renado', regions: ['eldinProvince'],
    text: 'Renado opens the sanctuary to your wounded. "Rest. The spirits watch over this village."',
    choices: [{ label: 'Rest', outcome: { text: 'Everyone sleeps soundly for the first time in days.', effects: [{ kind: 'hp', pct: 0.35 }] } }] },
  // ── The Resistance ──
  { id: 'telmasBar', title: "Telma's Bar", art: 'telma', regions: ['hyruleFieldTP', 'hyruleCastleTP'],
    text: '"Well, look what the cat dragged in." Telma pours you something and slides a map across the bar.',
    choices: [
      { label: 'Meet the Resistance', requires: { noQuest: ['renadosLetter'] }, outcome: { text: 'Rusl, Auru, Ashei and Shad, around one table. Someone might follow you.', effects: [{ kind: 'quest', id: 'renadosLetter' }, { kind: 'recruit', pool: ['ashei', 'shad', 'auru', 'rusl'] }] } },
      { label: 'Buy a round (₹40)', cost: 40, outcome: { text: 'The army\'s spirits lift.', effects: [{ kind: 'support', amount: 4 }] } },
      { label: 'Ask about the castle', outcome: { text: '"A barrier of Twilight. Nobody gets in or out." Good to know.', effects: [{ kind: 'xp', amount: 10 }] } },
    ] },
  { id: 'aurusMemo', title: 'Auru at Lake Hylia', art: 'auru', regions: ['lanayruProvince'], requires: { noQuest: ['aurusMemo'] },
    text: 'An old man by the lake studies the desert through a telescope. "You\'ll want Fyer\'s cannon. Show him this."',
    choices: [{ label: 'Take the memo', outcome: { text: 'Auru\'s Memo: the way to the Gerudo Desert.', effects: [{ kind: 'quest', id: 'aurusMemo' }] } }] },
  { id: 'shadsResearch', title: 'Shad\'s Research', art: 'shad', regions: ['eldinProvince', 'sacredGrove', 'cityInTheSky'],
    text: 'Shad is copying Sky Characters from a weathered monument. "The Oocca! I knew it!"',
    choices: [
      { label: 'Help him decipher it', gamble: { chance: 60,
        win: { text: 'A whole Sky Character, clear as day.', effects: [{ kind: 'quest', id: 'skyCharacter' }, { kind: 'quest', id: 'ancientSkyBook' }] },
        lose: { text: 'It was a weathered owl statue. Still interesting.', effects: [{ kind: 'xp', amount: 10 }] } } },
      { label: 'Leave him to it', outcome: { text: '"Hm? Oh, goodbye!"', effects: [] } },
    ] },
  // ── Snowpeak ──
  { id: 'yetoSoup', title: "Yeto's Soup", art: 'yeto', regions: ['snowpeak'],
    text: 'A huge pot of soup simmers in the ruined kitchen. "You hungry? Soup good for you!"',
    choices: [
      { label: 'Have some', outcome: { text: 'Simple, hot, and enough for everyone.', effects: [{ kind: 'hp', pct: 0.2 }, { kind: 'loot', ids: ['simpleSoup'] }] } },
      { label: 'Add an Ordon Pumpkin', requires: { quest: ['ordonPumpkin'] }, outcome: { text: 'Good Soup! Yeto is delighted.', effects: [{ kind: 'takeQuest', id: 'ordonPumpkin' }, { kind: 'hp', pct: 0.3 }, { kind: 'loot', ids: ['goodSoup'] }] } },
      { label: 'Add Ordon Goat Cheese', requires: { quest: ['ordonGoatCheese'] }, outcome: { text: 'Superb Soup. Yeta sits up for the first time in weeks.', effects: [{ kind: 'takeQuest', id: 'ordonGoatCheese' }, { kind: 'hp', pct: 0.4 }, { kind: 'loot', ids: ['superbSoup'] }] } },
    ] },
  // ── Castle Town oddities ──
  { id: 'agithasCastle', title: "Agitha's Castle", art: 'agitha', regions: ['hyruleFieldTP', 'hyruleCastleTP'],
    text: '"Oh! Have you brought a guest to my ball?" A girl in a parasol dress is looking for golden bugs.',
    choices: [
      { label: 'Give her a Golden Bug', requires: { quest: ['goldenBug'] }, outcome: { text: '"Thank you, Mr. Bug Hunter!" She pays you handsomely.', effects: [{ kind: 'takeQuest', id: 'goldenBug' }, { kind: 'rupees', amount: 100 }] } },
      { label: 'Go bug-hunting', gamble: { chance: 55, win: { text: 'A Golden Ladybug, glittering in the grass.', effects: [{ kind: 'quest', id: 'goldenBug' }] }, lose: { text: 'Just a regular beetle.', effects: [] } } },
      { label: 'Ask her to join you', requires: { quest: ['goldenBug'] }, outcome: { text: '"A ball on the road? How wonderful!"', effects: [{ kind: 'takeQuest', id: 'goldenBug' }, { kind: 'recruit', pool: ['agitha'] }] } },
    ] },
  { id: 'jovanisHouse', title: "Jovani's House", art: 'jovani', regions: ['hyruleFieldTP'],
    text: 'Through a crack in the floor you see a man made of gold, and a gold cat. "Poes... bring me their souls..."',
    choices: [
      { label: 'Give him a Poe Soul', requires: { quest: ['poeSoul'] }, outcome: { text: 'A little gold flakes off him. He presses a chest of Rupees on you.', effects: [{ kind: 'takeQuest', id: 'poeSoul' }, { kind: 'rupees', amount: 200 }] } },
      { label: 'Promise to help', outcome: { text: '"Hurry..."', effects: [{ kind: 'recruit', pool: ['jovani'] }] } },
      { label: 'Leave quickly', outcome: { text: 'You don\'t look back.', effects: [] } },
    ] },
  { id: 'postmanDelivery', title: 'Special Delivery!', art: 'postman', regions: TP,
    text: 'A man in a red cap sprints up, panting. "Letter for you! It\'s been following you for a while."',
    choices: [
      { label: 'Read it', outcome: { text: 'An advertisement from Malo Mart — with a coupon.', effects: [{ kind: 'rupees', amount: 40 }] } },
      { label: '"Want a job?"', outcome: { text: '"Hmm! I deliver to the front line too, you know."', effects: [{ kind: 'recruit', pool: ['postman'] }] } },
    ] },
  { id: 'fishingHole', title: 'The Fishing Hole', art: 'heroOfTwilight', regions: ['faronWoods', 'lanayruProvince', 'ordonProvince'],
    text: 'A quiet pond, a rented rod and a sign: "Catch something big!"',
    choices: [
      { label: 'Fish with a Frog Lure', gamble: { chance: 50,
        win: { text: 'A huge Hylian Loach! The owner gives you a Coral Earring.', effects: [{ kind: 'quest', id: 'fishingJournal' }, { kind: 'rupees', amount: 80 }, { kind: 'loot', ids: ['superbSoup'] }] },
        lose: { text: 'A Greengill and a sunburn.', effects: [{ kind: 'quest', id: 'fishingJournal' }, { kind: 'supplies', amount: 2 }] } } },
      { label: 'Keep moving', outcome: { text: 'The fish can wait.', effects: [] } },
    ] },
  { id: 'iliasMemory', title: 'Ilia\'s Memory', art: 'ilia', regions: ['eldinProvince', 'hyruleFieldTP'], requires: { unit: ['ilia'], noQuest: ['iliasCharm'] },
    text: 'Ilia stares at a little wooden statue. "I made this... didn\'t I?"',
    choices: [{ label: 'Tell her about Ordon', outcome: { text: 'She remembers. She gives you a charm that calls Epona from anywhere.', effects: [{ kind: 'quest', id: 'iliasCharm' }, { kind: 'loot', ids: ['horseCall'] }, { kind: 'support', amount: 5 }] } }] },
  // ── The Twilight artifacts ──
  { id: 'fusedShadowShrine', title: 'A Fragment of Shadow', art: 'midnaImp', regions: ['faronWoods', 'eldinProvince', 'lanayruProvince'],
    text: 'In a sealed temple chamber, a fragment of a black, horned helmet floats above the floor.',
    choices: [{ label: 'Take it', outcome: { text: 'A Fused Shadow Fragment. Midna is very interested.', effects: [{ kind: 'quest', id: 'fusedShadowPiece' }] } }] },
  { id: 'mirrorShardChamber', title: 'A Mirror Shard', art: 'midnaTrue', regions: ['gerudoDesertTP', 'snowpeak', 'sacredGrove', 'cityInTheSky'],
    text: 'A shard of dark glass, cold to the touch. Through it you can see a different sky.',
    choices: [{ label: 'Take it', outcome: { text: 'A Mirror Shard.', effects: [{ kind: 'quest', id: 'mirrorShard' }] } }] },
  { id: 'greatFairyFountain', title: "The Cave of Ordeals", art: 'greatFairyTP', regions: ['gerudoDesertTP', 'faronWoods'],
    text: 'At the bottom of fifty floors of monsters, the Great Fairy waits with her tears.',
    choices: [
      { label: 'Descend', gamble: { chance: 55,
        win: { text: 'She is pleased. "Take my tears."', effects: [{ kind: 'loot', ids: ['greatFairysTears'] }, { kind: 'xp', amount: 30 }] },
        lose: { text: 'You turn back at floor 30, battered.', effects: [{ kind: 'hp', pct: -0.15 }, { kind: 'xp', amount: 20 }] } } },
      { label: 'Not today', outcome: { text: 'The cave hums behind you.', effects: [] } },
    ] },
  { id: 'coroOil', title: "Coro's Lantern", art: 'heroOfTwilight', regions: FIELD,
    text: 'A man by a cooking fire sells lantern oil out of a bottle. "Long road ahead, right?"',
    choices: [
      { label: 'Buy oil (₹20)', cost: 20, outcome: { text: 'Three hours of light, at least.', effects: [{ kind: 'loot', ids: ['lanternOil'] }] } },
      { label: 'Buy his old lantern (₹150)', cost: 150, requires: { noGear: ['lantern'] }, outcome: { text: 'A good lantern, a little dented.', effects: [{ kind: 'loot', ids: ['lantern'] }] } },
      { label: 'Decline', outcome: { text: '"Suit yourself."', effects: [] } },
    ] },
  { id: 'chuJellyPond', title: 'ChuChu Pond', art: 'rareChuchu', regions: ['eldinProvince', 'lanayruProvince', 'faronWoods'],
    text: 'Jelly in four colours wobbles around a pond. One of them glitters gold.',
    choices: [
      { label: 'Catch the golden one', gamble: { chance: 30,
        win: { text: 'A Rare ChuChu! It wobbles after you.', effects: [{ kind: 'recruit', pool: ['rareChuchu'] }] },
        lose: { text: 'It slips away. You get a bottle of purple jelly instead.', effects: [{ kind: 'loot', ids: ['purpleChuJelly'] }] } } },
      { label: 'Scoop up jelly', outcome: { text: 'A bottle of Purple Chu Jelly. Probably edible.', effects: [{ kind: 'loot', ids: ['purpleChuJelly'] }] } },
    ] },
];

/** Forced when a Vessel of Light is full (see run.ts). */
EVENTS.push({ id: 'lightSpiritSpring', title: 'The Light Spirit\'s Spring', art: 'ordona', requires: { quest: ['vesselOfLightFull'] },
  text: 'The Vessel of Light overflows. At the spring, a great shape of light gathers itself: "Hero chosen by the gods… release the Tears, and the Twilight will lift from this land."',
  choices: [
    { label: 'Release the Tears of Light', outcome: { text: 'Light pours across the province. Merchants, recruits and the ordinary roads return.', effects: [{ kind: 'restoreLight' }] } },
    { label: 'Keep the Twilight a while longer', outcome: { text: 'The spirit dims. Twilight creatures and shadow equipment remain within reach.', effects: [{ kind: 'delayLight' }] } },
  ] });
