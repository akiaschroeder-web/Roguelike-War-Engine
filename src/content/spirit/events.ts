import type { EventDef } from '../../engine/types';
import { SPIRIT_REALMS, SPIRIT_ROUTE } from './regions';

const LINES = SPIRIT_ROUTE.filter((r) => r !== 'towerOfSpirits' && r !== 'sacredBattlefield');

// Encounters on the line: Aboda's engineers and Niko's Stamp Book, the stations (stamps, parts,
// repairs), passenger and freight jobs, the Lokomo sanctuaries and their duets, Linebeck III's shop,
// Ferrus, the Tower's altar, the Bulblin raiders, and the new ChuChus.
export const EVENTS: EventDef[] = [
  { id: 'abodaWorkshop', title: "Alfonzo's Workshop", art: 'alfonzo', regions: ['abodaVillage', 'hyruleCastleST'],
    text: 'A big man in overalls wipes grease off his hands beside a half-built engine. "So you\'re the new engineer. Let\'s see what you know about boilers."',
    choices: [
      { label: 'Train with Alfonzo', outcome: { text: 'An afternoon of wrenches, whistles and shouting. You learn a lot.', effects: [{ kind: 'xp', amount: 30 }, { kind: 'quest', id: 'royalEngineerCertificate' }] } },
      { label: 'Buy a train part (₹300)', cost: 300, outcome: { text: '"Bolt it on and mind your fingers."', effects: [{ kind: 'spirit', op: 'buyPart' }] } },
      { label: 'Ask Alfonzo to join', gamble: { chance: 45, win: { text: '"Somebody has to keep you on the rails."', effects: [{ kind: 'recruit', pool: ['alfonzo'] }] }, lose: { text: '"I\'ve got an engine to finish."', effects: [] } } },
    ] },
  { id: 'nikosPictureShow', title: "Niko's Picture Show", art: 'elderNiko', regions: ['abodaVillage', 'hyruleCastleST', 'oceanRealm'],
    text: 'An old man sets up a little paper theatre. "Gather round! This is the story of a boy who sailed with pirates..." He has a well-thumbed Stamp Book under his arm.',
    choices: [
      { label: 'Watch the show', outcome: { text: 'A tale of a great sea and a hero in green. Everyone feels braver.', effects: [{ kind: 'support', amount: 1 }, { kind: 'xp', amount: 15 }] } },
      { label: 'Take the Stamp Book', requires: { noQuest: ['stampBook'] }, outcome: { text: '"Collect the station stamps for me, won\'t you? There are prizes!"', effects: [{ kind: 'quest', id: 'stampBook' }, { kind: 'spirit', op: 'stamp' }] } },
      { label: 'Ask Niko to come along', gamble: { chance: 50, win: { text: '"One more adventure, before these old bones settle down!"', effects: [{ kind: 'recruit', pool: ['elderNiko'] }] }, lose: { text: '"Ah, my back."', effects: [] } } },
    ] },
  { id: 'trainStation', title: 'A Train Station', art: 'spiritTrain', regions: LINES,
    text: 'A little station with a stamp stand, a water tower, a repair shed and a few passengers waiting with their bags.',
    choices: [
      { label: 'Stamp the Stamp Book', requires: { quest: ['stampBook'] }, outcome: { text: 'Ka-chunk. A fresh stamp.', effects: [{ kind: 'spirit', op: 'stamp' }] } },
      { label: 'Repair the trains', outcome: { text: 'The station crew patches up every boiler.', effects: [{ kind: 'fleet', pct: 0.5 }] } },
      { label: 'Take on passengers', outcome: { text: 'A family climbs aboard with a picnic basket.', effects: [{ kind: 'spirit', op: 'passenger' }] } },
      { label: 'Load freight for delivery', outcome: { text: 'Crates marked FRAGILE. Very fragile.', effects: [{ kind: 'spirit', op: 'freight' }] } },
    ] },
  { id: 'trainYard', title: 'The Train Yard', art: 'armoredTrain', regions: LINES,
    text: 'Rows of engines and cars in every style — wooden, steel, a car painted like candy, a skull-faced engine nobody will buy.',
    choices: [
      { label: 'Trade three treasures for a rare part', outcome: { text: 'The yardmaster weighs your treasures and rolls a car out.', effects: [{ kind: 'spirit', op: 'tradeTreasures' }] } },
      { label: 'Buy a train part (₹350)', cost: 350, outcome: { text: 'A new part for the train.', effects: [{ kind: 'spirit', op: 'buyPart' }] } },
      { label: 'Buy an Armored Train (₹900)', cost: 900, outcome: { text: 'A blue armored locomotive joins your line.', effects: [{ kind: 'recruit', pool: ['armoredTrain'] }] } },
    ] },
  { id: 'lokomoSanctuary', title: 'A Lokomo Sanctuary', art: 'gage', regions: SPIRIT_REALMS,
    text: 'Music drifts from a little temple on the hill. Inside, a Lokomo on a rolling chair plays to a ring of stopped clocks. "The tracks of this realm are fading. Play with me?"',
    choices: [
      { label: 'Play the realm\'s duet (Spirit Flute or a Lokomo)', outcome: { text: 'Two melodies meet. Somewhere outside, rails shine back into being.', effects: [{ kind: 'spirit', op: 'duet' }] } },
      { label: 'Ask the sage to join', gamble: { chance: 45, win: { text: '"The tracks can wait a little while I help you fix them."', effects: [{ kind: 'spirit', op: 'sage' }] }, lose: { text: '"Not until the realm\'s temple is cleansed."', effects: [{ kind: 'xp', amount: 10 }] } } },
      { label: 'Rest in the sanctuary', outcome: { text: 'The music soothes every bruise.', effects: [{ kind: 'hp', pct: 0.2 }] } },
    ] },
  { id: 'linebeckTradingPost', title: "Linebeck's Trading Post", art: 'linebeck3', regions: ['oceanRealm', 'fireRealm', 'abodaVillage', 'snowRealm'],
    text: 'A grinning man behind a counter full of loot. "Linebeck the Third, at your service! Treasures? I buy. Train cars? I sell. Grandpa\'s stories? Free, unfortunately."',
    choices: [
      { label: 'Sell your treasures', outcome: { text: 'Rupees change hands, rather fewer than you hoped.', effects: [{ kind: 'spirit', op: 'sellTreasures' }] } },
      { label: 'Buy a Whirlwind (₹350)', cost: 350, outcome: { text: 'A propeller toy. "Works on boulders too!"', effects: [{ kind: 'loot', ids: ['whirlwindST'] }] } },
      { label: 'Ask Linebeck III to join', gamble: { chance: 40, win: { text: '"A treasure hunt with an army? Grandpa would be so jealous."', effects: [{ kind: 'recruit', pool: ['linebeck3'] }] }, lose: { text: '"Who\'d mind the shop?"', effects: [] } } },
    ] },
  { id: 'ferrusSnapshot', title: 'A Railway Enthusiast', art: 'ferrus', regions: LINES,
    text: 'A young man with a camera sprints alongside the train. "Is that the Spirit Train? Hold still! Can I come? I know a secret branch line!"',
    choices: [
      { label: 'Let Ferrus come along', gamble: { chance: 55, win: { text: 'He hops aboard, still taking pictures.', effects: [{ kind: 'recruit', pool: ['ferrus'] }] }, lose: { text: 'He trips over a sleeper and waves you on.', effects: [{ kind: 'xp', amount: 10 }] } } },
      { label: 'Follow the secret branch line', outcome: { text: 'A forgotten stretch of track — and a gem in the ballast.', effects: [{ kind: 'quest', id: 'forceGem' }] } },
    ] },
  { id: 'deliverCargo', title: 'A Waiting Station Master', art: 'teacher', regions: LINES,
    text: 'A station master taps his watch. "You\'re carrying my freight? And my passengers? About time."',
    choices: [
      { label: 'Deliver the freight', requires: { quest: ['freightCargo'] }, outcome: { text: 'Not a single crate broken. He pays well.', effects: [{ kind: 'spirit', op: 'deliverFreight' }] } },
      { label: 'Drop off your passengers', requires: { quest: ['passengerTicket'] }, outcome: { text: 'Happy passengers, happy tips.', effects: [{ kind: 'spirit', op: 'deliverPassenger' }] } },
      { label: 'Ask about the Teacher', gamble: { chance: 35, win: { text: 'The princess\'s sword instructor steps off the next train. "You hold that sword like a shovel. Again."', effects: [{ kind: 'recruit', pool: ['teacher'] }] }, lose: { text: '"Never heard of him."', effects: [] } } },
    ] },
  { id: 'towerAltar', title: 'The Tower Altar', art: 'anjean', regions: ['towerOfSpirits', 'hyruleCastleST', 'darkRealm'],
    text: 'An old Lokomo woman waits by a glowing altar. "The Tears of Light gather here. Take them — the Phantoms fear them. And if you would, take me with you."',
    choices: [
      { label: 'Gather the Tears of Light', outcome: { text: 'Three tears of light, bottled.', effects: [{ kind: 'loot', ids: ['phantomTear'] }, { kind: 'loot', ids: ['phantomTear'] }] } },
      { label: 'Ask Anjean to join', gamble: { chance: 40, win: { text: '"Very well. My old bones still have a song in them."', effects: [{ kind: 'recruit', pool: ['anjean'] }] }, lose: { text: '"The Tower needs me. For now."', effects: [{ kind: 'xp', amount: 15 }] } } },
      { label: 'Claim the Lokomo Sword', requires: { questCount: { forceGem: 3 } }, outcome: { text: 'The sacred blade of the Lokomo is yours.', effects: [{ kind: 'spirit', op: 'lokomoSword' }] } },
    ] },
  { id: 'bulblinRaid', title: 'A Bulblin Raid', art: 'bigBlin', regions: ['abodaVillage', 'hyruleCastleST', 'forestRealm', 'snowRealm'],
    text: 'Horns and hoofbeats: Bulblins on Bullbos are chasing a train, and a huge Blin with a basket rides at the back.',
    choices: [
      { label: 'Fight them off', gamble: { chance: 55, win: { text: 'The raiders scatter; their loot is yours.', effects: [{ kind: 'rupees', amount: 200 }, { kind: 'quest', id: 'stalfosSkull' }] }, lose: { text: 'A rough fight.', effects: [{ kind: 'hp', pct: -0.1 }] } } },
      { label: 'Challenge the Big Blin', gamble: { chance: 30, win: { text: '"Hrrr! Strong little one. Big Blin follows strong."', effects: [{ kind: 'recruit', pool: ['bigBlin'] }] }, lose: { text: 'Into the basket you go — briefly.', effects: [{ kind: 'hp', pct: -0.08 }] } } },
      { label: 'Hire a Bulblin crew (₹150)', cost: 150, outcome: { text: 'Mercenaries are mercenaries.', effects: [{ kind: 'recruit', pool: ['bulblin', 'miniblin'] }] } },
    ] },
  { id: 'chuchuPondST', title: 'A ChuChu Pond', art: 'chuchuStandard', regions: [...SPIRIT_REALMS, 'greatPlateau', 'hateno', 'eldinWild', 'hebra', 'gerudoWild'],
    text: 'A pond full of wobbling ChuChus: plain blue, burning, frosty, crackling, one metal one and one wearing an iron helmet.',
    choices: [
      { label: 'Coax a ChuChu out', gamble: { chance: 60, win: { text: 'A ChuChu wobbles after you.', effects: [{ kind: 'recruit', pool: ['chuchuStandard', 'chuchuFire', 'chuchuIce', 'chuchuElectric', 'chuchuMetal', 'chuchuHelmet'] }] }, lose: { text: 'It bounces off into the reeds.', effects: [] } } },
      { label: 'Scoop up jelly', outcome: { text: 'Assorted jelly, sorted.', effects: [{ kind: 'loot', ids: ['chuchuJellyST', 'whiteChuJelly', 'yellowChuJelly'] }] } },
    ] },
];
