import type { EventDef } from '../../engine/types';
import { NORTHEASTERN_SEA, PHANTOM_ROUTE, SOUTHWESTERN_SEA } from './regions';

const ISLANDS = PHANTOM_ROUTE.filter((r) => r !== 'templeOfTheOceanKing' && r !== 'finalDuel');

// Encounters on the march: Eddo's workshop and ship parts, the treasure trader, salvage and
// fishing, Zauz's forge, the Spirits' shrine, the islands' people; then the pending units —
// the Kakariko potion shop (and the Potion Shop Lady's shop anywhere after the first region) and
// Subrosia's market and Rosa.
export const EVENTS: EventDef[] = [
  { id: 'eddosWorkshop', title: "Eddo's Workshop", art: 'eddo', regions: SOUTHWESTERN_SEA,
    text: 'Cannons on every shelf, a ship hull on blocks and a little man in goggles. "A customer! Ship parts, refits, cannons — and the doorbell is NOT a trap. Mostly."',
    choices: [
      { label: 'Buy a ship part (₹300)', cost: 300, outcome: { text: '"Bolts right on. Probably."', effects: [{ kind: 'phantom', op: 'buyPart' }] } },
      { label: 'Trade three treasures for a rare ship part', outcome: { text: 'He weighs the treasures, nods and digs through a crate.', effects: [{ kind: 'phantom', op: 'tradeTreasures' }] } },
      { label: 'Refit the fleet', outcome: { text: 'Eddo patches the hulls and swaps the cannons around.', effects: [{ kind: 'fleet', pct: 0.4 }] } },
      { label: 'Ask Eddo to join', gamble: { chance: 45, win: { text: '"Field testing! Finally!"', effects: [{ kind: 'recruit', pool: ['eddo'] }] }, lose: { text: '"After I finish this cannon. And the next one."', effects: [] } } },
    ] },
  { id: 'treasureTrader', title: 'A Treasure Trader', art: 'linebeck', regions: ISLANDS,
    text: 'A trader with a magnifying glass looks over your finds. "Pearls? Coral? A Ruto Crown?! I pay well — and I have a chart or two for sale."',
    choices: [
      { label: 'Sell your treasures', outcome: { text: 'Rupees change hands.', effects: [{ kind: 'phantom', op: 'sellTreasures' }] } },
      { label: 'Buy a Treasure Chart (₹200)', cost: 200, outcome: { text: 'An X marks a spot at sea. Salvage it at the next treasure.', effects: [{ kind: 'quest', id: 'treasureChart' }] } },
      { label: 'Buy Sands of Hours (₹600)', cost: 600, outcome: { text: 'A glittering pinch of sand pours into the Phantom Hourglass: its reserve grows.', effects: [{ kind: 'phantom', op: 'sands' }] } },
    ] },
  { id: 'salvageSpot', title: 'A Salvage Spot', art: 'ssLinebeck', regions: ISLANDS,
    text: 'Bubbles rise from a dark patch of water. Something big and boxy lies on the sea floor.',
    choices: [
      { label: 'Lower the Salvage Arm', outcome: { text: 'The chain rattles down... and comes up heavy.', effects: [{ kind: 'phantom', op: 'salvage' }] } },
      { label: 'Use a Treasure Chart to dive deeper', requires: { quest: ['treasureChart'] }, outcome: { text: 'The chart leads to the real wreck.', effects: [{ kind: 'takeQuest', id: 'treasureChart' }, { kind: 'phantom', op: 'salvage', amount: 2 }] } },
      { label: 'Leave it', outcome: { text: 'Some treasures are better left to the fish.', effects: [{ kind: 'xp', amount: 10 }] } },
    ] },
  { id: 'deepSeaFishing', title: 'Deep-Sea Fishing', art: 'joanne', regions: ISLANDS,
    text: 'A fisherman on a rock dangles a line into the deep. "The big ones only bite a Big Catch Lure. I happen to have one."',
    choices: [
      { label: 'Buy the Big Catch Lure (₹250)', requires: { noQuest: ['bigCatchLure'] }, cost: 250, outcome: { text: 'A gaudy lure the size of your fist.', effects: [{ kind: 'quest', id: 'bigCatchLure' }] } },
      { label: 'Fish the deep sea', requires: { quest: ['bigCatchLure'] }, outcome: { text: 'Something enormous takes the line.', effects: [{ kind: 'phantom', op: 'fish' }] } },
      { label: 'Fish from the rock', gamble: { chance: 50, win: { text: 'A respectable catch: the army eats well.', effects: [{ kind: 'supplies', amount: 2 }, { kind: 'hp', pct: 0.1 }] }, lose: { text: 'Only seaweed.', effects: [] } } },
    ] },
  { id: 'zauzsForge', title: "Zauz's Forge", art: 'zauz', regions: ['zauzsIsland', 'isleOfRuins'],
    text: 'An old blacksmith works alone at a forge older than he is. "Crimsonine, Azurine, Aquanine. Bring me all three and the Spirits\' blessing, and I\'ll make you a sword that cuts Phantoms."',
    choices: [
      { label: 'Forge the Phantom Sword', requires: { questCount: { crimsonine: 1, azurine: 1, aquanine: 1 } }, outcome: { text: 'Three nights of hammering. The blade hums in your hand.', effects: [{ kind: 'phantom', op: 'forgeSword' }] } },
      { label: 'Craft Phantom gear from Phantom Essence', requires: { questCount: { phantomEssence: 3 } }, outcome: { text: '"Their armor, remade for you."', effects: [{ kind: 'phantom', op: 'craftPhantom' }] } },
      { label: 'Ask Zauz to join', gamble: { chance: 40, win: { text: '"My forge goes where the hammer goes."', effects: [{ kind: 'recruit', pool: ['zauz'] }] }, lose: { text: '"Not until the sword is done."', effects: [] } } },
    ] },
  { id: 'spiritShrine', title: 'A Spirit Shrine', art: 'ciela', regions: ISLANDS,
    text: 'A small shrine with three crystal hollows — red, blue and yellow. The air hums with something sacred.',
    choices: [
      { label: 'Pray for a Spirit Gem', gamble: { chance: 60, win: { text: 'A gem glimmers in one of the hollows.', effects: [{ kind: 'phantom', op: 'gem' }] }, lose: { text: 'The hollows stay empty.', effects: [{ kind: 'xp', amount: 10 }] } } },
      { label: 'Ask the Spirits to join', gamble: { chance: 30, win: { text: 'A Spirit rises from the shrine.', effects: [{ kind: 'recruit', pool: ['ciela', 'leaf', 'neri'] }] }, lose: { text: 'Only an echo of a laugh.', effects: [] } } },
      { label: 'Rest in the sacred air', outcome: { text: 'Everyone feels lighter.', effects: [{ kind: 'hp', pct: 0.15 }] } },
    ] },
  { id: 'oshusHouse', title: "Oshus's House", art: 'oshus', regions: ['mercayIsland', 'templeOfTheOceanKing'],
    text: 'An old man with a big stick sits by the fire. "You will need the Phantom Hourglass, and sand for it. The Temple takes the life of those who linger."',
    choices: [
      { label: 'Listen to the old man', outcome: { text: 'You learn more than you expected about the Temple.', effects: [{ kind: 'xp', amount: 30 }, { kind: 'phantom', op: 'sands' }] } },
      { label: 'Ask him to come along', gamble: { chance: 35, win: { text: '"Very well. Someone must keep you out of trouble."', effects: [{ kind: 'recruit', pool: ['oshus'] }] }, lose: { text: '"I am needed here. For now."', effects: [] } } },
    ] },
  { id: 'astridsFortune', title: "Astrid's Fortune", art: 'astrid', regions: ['isleOfEmber', 'isleOfRuins', 'isleOfGust'],
    text: 'A woman in purple beckons from a dark doorway. "I have seen you coming. Sit; let me read what the tide brings."',
    choices: [
      { label: 'Have your fortune read (₹80)', cost: 80, outcome: { text: '"A great darkness, a treasure in the deep, and a friend who is not what he seems."', effects: [{ kind: 'xp', amount: 25 }, { kind: 'quest', id: 'treasureChart' }] } },
      { label: 'Ask Astrid to join', gamble: { chance: 40, win: { text: '"I foresaw this too."', effects: [{ kind: 'recruit', pool: ['astrid'] }] }, lose: { text: '"Not yet. The cards say not yet."', effects: [] } } },
    ] },
  { id: 'jolenesLetterEvent', title: 'Two Sisters', art: 'joanne', regions: ['molidaIsland', 'cannonIsland', 'bellumsWaters'],
    text: 'A "mermaid" waves from the rocks. "You\'ve met my sister Jolene? If she gives you a letter, bring it to me, won\'t you?"',
    choices: [
      { label: 'Deliver Jolene\'s Letter', requires: { quest: ['jolenesLetter'] }, outcome: { text: 'Joanne reads it twice and laughs. "Same old Jolene. I\'m coming with you."', effects: [{ kind: 'takeQuest', id: 'jolenesLetter' }, { kind: 'recruit', pool: ['joanne'] }] } },
      { label: 'Promise to keep an eye out', outcome: { text: 'She hands you a pearl "for luck".', effects: [{ kind: 'quest', id: 'pearlNecklace' }] } },
      { label: 'Ask her to join', gamble: { chance: 35, win: { text: 'She swims after your ship.', effects: [{ kind: 'recruit', pool: ['joanne'] }] }, lose: { text: '"Find my sister first."', effects: [{ kind: 'quest', id: 'jolenesLetter' }] } } },
    ] },
  { id: 'anoukiVillage', title: 'The Anouki Village', art: 'anouki', regions: NORTHEASTERN_SEA,
    text: 'Round Anouki huddle by their huts. "One of us is a Yook in disguise! Our Chief says so! Can you tell which?" The Chief watches from his doorway.',
    choices: [
      { label: 'Question the villagers (Guard Notebook)', outcome: { text: 'You spot the Yook by its teeth. The Anouki cheer.', effects: [{ kind: 'quest', id: 'guardNotebook' }, { kind: 'recruit', pool: ['anoukiWarrior', 'anoukiHunter', 'anoukiIceMage', 'anoukiGuardian'] }] } },
      { label: 'Show the Hero\'s New Clothes to the Chief', requires: { quest: ['herosNewClothes'] }, outcome: { text: '"A true hero\'s garb. Then the Anouki will follow a true hero." The Chief joins you.', effects: [{ kind: 'takeQuest', id: 'herosNewClothes' }, { kind: 'recruit', pool: ['anoukiChief'] }] } },
      { label: 'Ask the Chief to join', gamble: { chance: 35, win: { text: '"My people are safe. My staff is yours."', effects: [{ kind: 'recruit', pool: ['anoukiChief'] }] }, lose: { text: '"Not while the Yook prowl." He gives you a bundle of new clothes "for the hero".', effects: [{ kind: 'quest', id: 'herosNewClothes' }] } } },
    ] },
  { id: 'goronChallenge', title: "The Gorons' Challenge", art: 'gongoron', regions: ['goronIsland', 'isleOfEmber'],
    text: 'A little Goron sniffles behind his enormous father. "My son wants to see the world, brother. Answer my quiz and he may go!"',
    choices: [
      { label: 'Take the quiz', gamble: { chance: 55, win: { text: '"Right! You know Gorons, brother!" Gongoron rolls after you.', effects: [{ kind: 'recruit', pool: ['gongoron'] }] }, lose: { text: '"Wrong, brother! Study harder!" He gives you some Goron Amber anyway.', effects: [{ kind: 'quest', id: 'goronAmber' }] } } },
      { label: 'Ask the Chief himself', gamble: { chance: 30, win: { text: '"Ha! An adventure! The island can look after itself."', effects: [{ kind: 'recruit', pool: ['biggoronGoronIsland'] }] }, lose: { text: '"Someone has to keep the island!"', effects: [] } } },
      { label: 'Buy Bombchus (₹200)', cost: 200, outcome: { text: 'A bag of mechanical mice.', effects: [{ kind: 'loot', ids: ['bombchu'] }] } },
      { label: 'Buy a Bombchu Bag (₹500)', requires: { noQuest: ['bombchuBagPH'] }, cost: 500, outcome: { text: 'Your bombchus will come in bigger stacks.', effects: [{ kind: 'quest', id: 'bombchuBagPH' }] } },
    ] },
  { id: 'mutohsTomb', title: "King Mutoh's Tomb", art: 'kingMutoh', regions: ['isleOfTheDead', 'isleOfRuins'],
    text: 'Three helmeted knights stand before a sealed door — yellow, green and red. "None pass without the King\'s Key."',
    choices: [
      { label: 'Search the tombs for the King\'s Key', gamble: { chance: 55, win: { text: 'A heavy key, under a dusty urn.', effects: [{ kind: 'quest', id: 'kingsKey' }] }, lose: { text: 'Only dust — and a Stalfos who didn\'t want to be disturbed.', effects: [{ kind: 'hp', pct: -0.1 }] } } },
      { label: 'Open the door with the King\'s Key', requires: { quest: ['kingsKey'] }, outcome: { text: 'The knights bow. One of them falls in behind you.', effects: [{ kind: 'recruit', pool: ['bremeur', 'doylan', 'max'] }] } },
      { label: 'Pay respects to the Cobble dead', outcome: { text: 'The air grows still.', effects: [{ kind: 'support', amount: 1 }] } },
    ] },
  { id: 'cycloneShrine', title: 'The Golden Chief', art: 'cyclok', regions: ['isleOfGust', 'cannonIsland', 'molidaIsland'],
    text: 'A frog-faced idol on a pillar of stone. "Mark my symbol on your chart, and the cyclones will carry you."',
    choices: [
      { label: 'Take the Cyclone Slate', requires: { noQuest: ['cycloneSlate'] }, outcome: { text: 'The slate is warm. Cyclone Warp Points will answer it.', effects: [{ kind: 'quest', id: 'cycloneSlate' }] } },
      { label: 'Ask the winds for fair sailing', outcome: { text: 'The fleet sails easily for a while.', effects: [{ kind: 'supplies', amount: 2 }] } },
    ] },
  { id: 'ghostShipHold', title: 'The Ghost Ship\'s Hold', art: 'ghostShip', regions: ['ghostShipPH', 'bellumsWaters'],
    text: 'Fog, creaking timbers, and a door with a skull-shaped lock. Somewhere below, someone giggles.',
    choices: [
      { label: 'Search for the Ghost Key', gamble: { chance: 50, win: { text: 'A green key on a skeleton\'s finger.', effects: [{ kind: 'quest', id: 'ghostKey' }] }, lose: { text: 'Something cold brushes past you.', effects: [{ kind: 'hp', pct: -0.08 }] } } },
      { label: 'Open the hold with the Ghost Key', requires: { quest: ['ghostKey'] }, outcome: { text: 'Treasure, and a chest of old ship parts.', effects: [{ kind: 'takeQuest', id: 'ghostKey' }, { kind: 'phantom', op: 'salvage', amount: 2 }] } },
    ] },
  // ── The Potion Shop Lady (Ocarina of Time) ──
  { id: 'kakarikoPotionShop', title: "Kakariko's Potion Shop", art: 'potionShopLady', regions: ['kakarikoGraveyard', 'hyruleField', 'deathMountain'],
    text: 'A dim shop that smells of herbs. An old woman in a spiked wheelchair looks up from her pot. "Hmph. Customers. Buy something, or carry something heavy for me."',
    choices: [
      { label: 'Red Potion (₹60)', cost: 60, outcome: { text: '"Bitter, but it works."', effects: [{ kind: 'loot', ids: ['redPotion'] }] } },
      { label: 'Blue Potion (₹180)', cost: 180, outcome: { text: '"Don\'t drink it all at once."', effects: [{ kind: 'loot', ids: ['bluePotion'] }] } },
      { label: 'Ask her to join', gamble: { chance: 50, win: { text: '"An old woman on a battlefield? Why not. Push."', effects: [{ kind: 'recruit', pool: ['potionShopLady'] }] }, lose: { text: '"Who would mind the shop?"', effects: [] } } },
    ] },
  { id: 'travelingPotionShop', title: 'A Traveling Potion Shop', art: 'potionShopLady', requires: { minAct: 2 },
    text: 'A cart of bottles by the road, and an old woman in a wheelchair counting them. "Potions, medicines, tonics. I mix to order."',
    choices: [
      { label: 'Red Potion (₹60)', cost: 60, outcome: { text: '"There."', effects: [{ kind: 'loot', ids: ['redPotion'] }] } },
      { label: 'Mix two potions into a stronger one', requires: { unit: ['potionShopLady'] }, outcome: { text: 'She pours, stirs and corks.', effects: [{ kind: 'phantom', op: 'mixPotions' }] } },
      { label: 'Ask her to join', gamble: { chance: 45, win: { text: '"Fine. But you push the chair."', effects: [{ kind: 'recruit', pool: ['potionShopLady'] }] }, lose: { text: '"Buy something first."', effects: [] } } },
    ] },
  // ── The Subrosians (Era of Legend: Subrosia) ──
  { id: 'subrosianMarket', title: 'The Subrosian Market', art: 'subrosian', regions: ['subrosia', 'templeOfSeasons'],
    text: 'Hooded Subrosians haggle over Ore Chunks around a bubbling lava pool. One waves you over. "You trade? You fight? You dance?"',
    choices: [
      { label: 'Trade Ore Chunks for Rupees', requires: { questCount: { oreChunk: 1 } }, outcome: { text: '"Good ore! Good ore!"', effects: [{ kind: 'phantom', op: 'sellOre' }] } },
      { label: 'Hire a Subrosian (₹120)', cost: 120, outcome: { text: 'A hooded figure joins your line.', effects: [{ kind: 'recruit', pool: ['subrosianWarrior', 'subrosianDancer', 'subrosianBlacksmith', 'subrosianMiner', 'subrosianSorcerer', 'subrosianChef', 'subrosianThief'] }] } },
      { label: 'Dance in the dance hall', gamble: { chance: 50, win: { text: 'You dance well enough to earn some Ore Chunks.', effects: [{ kind: 'quest', id: 'oreChunk' }, { kind: 'quest', id: 'oreChunk' }] }, lose: { text: 'You trip over your own feet. The Subrosians laugh kindly.', effects: [{ kind: 'support', amount: 1 }] } } },
    ] },
  { id: 'rosasDate', title: "Rosa's Date", art: 'rosa', regions: ['subrosia', 'horonVillage', 'templeOfSeasons'],
    text: 'An orange-hooded Subrosian with a big pink bow blocks the path. "You! You look like you know where to find a Ribbon. I\'ve wanted one forever."',
    choices: [
      { label: 'Give her the Ribbon', requires: { quest: ['tradeLA_Ribbon'] }, outcome: { text: '"For me?!" She grabs your hand. "Come on, I know a secret way!" Rosa joins you.', effects: [{ kind: 'takeQuest', id: 'tradeLA_Ribbon' }, { kind: 'recruit', pool: ['rosa'] }] } },
      { label: 'Go on a date through Subrosia', gamble: { chance: 45, win: { text: 'She shows you a hidden door, and decides to keep showing you things. Rosa joins you.', effects: [{ kind: 'recruit', pool: ['rosa'] }] }, lose: { text: '"Next time, bring a Ribbon!" She gives you an Ore Chunk anyway.', effects: [{ kind: 'quest', id: 'oreChunk' }] } } },
    ] },
];
