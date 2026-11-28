import type { EventDef } from '../../engine/types';
import { HYRULE_ROUTE, LORULE_ROUTE } from './regions';

const ALL = LORULE_ROUTE;
const LORULE = LORULE_ROUTE.filter((r) => !HYRULE_ROUTE.includes(r));

// Encounters on the march: Ravio's travelling stall, lost Baby Maiamai, the Milk Bar, Master Ore, hint ghosts,
// the Sages' families, Thief Girl, the witch's hut, Gramps, the Lorulean smith, and Yuga's fusion with Ganon.
export const EVENTS: EventDef[] = [
  { id: 'raviosStall', title: "Ravio's Stall", art: 'ravio', regions: ALL,
    text: 'A purple rabbit hood pokes out from behind a cart of tools. "Oh! A customer! Rent anything you like — I\'ll want it back, of course. Sheerow will come and get it if anything… happens."',
    choices: [
      { label: 'Rent a tool for the run (₹100)', cost: 100, outcome: { text: '"Pleasure doing business! Try not to fall over."', effects: [{ kind: 'lorule', op: 'rent' }] } },
      { label: 'Ask Ravio to come along', requires: { minAct: 2 }, gamble: { chance: 40, win: { text: '"I\'m a coward, you know. …Fine. Someone has to keep an eye on my stock."', effects: [{ kind: 'recruit', pool: ['ravio'] }] }, lose: { text: '"Me? Out there? Ha ha. No."', effects: [] } } },
      { label: 'Just browse', outcome: { text: 'You learn the price of everything.', effects: [{ kind: 'xp', amount: 10 }] } },
    ] },
  { id: 'lostMaiamai', title: '"Maiamai!"', art: 'babyMaiamai', regions: ALL,
    text: 'A tiny squeak from a crack in a rock. A pink hermit octopus is wedged inside, and there are more noises from the bushes around it.',
    choices: [
      { label: 'Search every rock and bush', outcome: { text: 'Three Baby Maiamai, found and sent home to their mother.', effects: [{ kind: 'lorule', op: 'maiamai', amount: 3 }, { kind: 'hp', pct: -0.05 }] } },
      { label: 'Rescue the one you can see', outcome: { text: '"Maiamai!" It scuttles off towards Lake Hylia.', effects: [{ kind: 'lorule', op: 'maiamai', amount: 1 }] } },
      { label: 'Ask it to stay with you', gamble: { chance: 50, win: { text: 'It climbs onto someone\'s shoulder and refuses to leave.', effects: [{ kind: 'recruit', pool: ['babyMaiamai'] }] }, lose: { text: 'It squeaks and hides.', effects: [] } } },
    ] },
  { id: 'milkBarLB', title: 'The Milk Bar', art: 'ravio', regions: ['kakarikoLB', 'thievesTown', 'sanctuaryLB', 'hyruleCastleLB'],
    text: 'A cosy bar that serves only milk. A band is playing in the corner, and the barman polishes a glass that has never held anything stronger.',
    choices: [
      { label: 'A round of milk for everyone (₹60)', cost: 60, outcome: { text: 'Stories are told. Friendships deepen.', effects: [{ kind: 'support', amount: 3 }, { kind: 'hp', pct: 0.1 }] } },
      { label: 'Buy Premium Milk (₹150)', cost: 150, outcome: { text: 'It comes in a bottle with a ribbon.', effects: [{ kind: 'quest', id: 'premiumMilk' }, { kind: 'loot', ids: ['lonLonMilk'] }] } },
      { label: 'Ask after a Letter in a Bottle', requires: { quest: ['letterInABottle'] }, outcome: { text: 'The barman reads it and goes pale. "This is for my brother in Lorule." He pays you handsomely.', effects: [{ kind: 'takeQuest', id: 'letterInABottle' }, { kind: 'rupees', amount: 300 }] } },
    ] },
  { id: 'bottledLetter', title: 'A Bottle on the Shore', art: 'babyMaiamai', regions: ['kakarikoLB', 'houseOfGales', 'swampPalaceLB', 'thievesTown'],
    text: 'Half-buried in wet sand: a corked bottle with a letter inside.',
    choices: [
      { label: 'Keep it', outcome: { text: 'Somebody, somewhere, is waiting for this.', effects: [{ kind: 'quest', id: 'letterInABottle' }] } },
      { label: 'Throw it back', outcome: { text: 'It bobs away. A Baby Maiamai pops out of the sand where it lay.', effects: [{ kind: 'lorule', op: 'maiamai', amount: 1 }] } },
    ] },
  { id: 'masterOreVein', title: 'A Glint in the Rock', art: 'loruleanBlacksmith', regions: ['towerOfHeraLB', 'iceRuins', 'turtleRockLB', 'darkPalaceLB', 'skullWoodsLB', 'treacherousTower'],
    text: 'Deep in the stone, something shines that is not a Rupee: a seam of blue-white ore that rings when you tap it.',
    choices: [
      { label: 'Dig it out', outcome: { text: 'Master Ore! The smiths will want to see this.', effects: [{ kind: 'lorule', op: 'masterOre' }, { kind: 'hp', pct: -0.08 }] } },
      { label: 'Mark the spot and move on', outcome: { text: 'You find a few Rupees on the way out.', effects: [{ kind: 'rupees', amount: 80 }] } },
    ] },
  { id: 'hintGhost', title: 'A Hint Ghost', art: 'seres', regions: ALL,
    text: 'A translucent figure floats beside a wall. "Psst. For a Play Coin I\'ll tell you a secret. You don\'t have Play Coins? A Rupee, then."',
    choices: [
      { label: 'Pay for a hint (₹50)', cost: 50, outcome: { text: '"There\'s a crack in that wall. It goes somewhere else entirely."', effects: [{ kind: 'lorule', op: 'hint' }] } },
      { label: 'Ask for the glasses it\'s wearing', requires: { noGear: ['hintGlasses'] }, gamble: { chance: 45, win: { text: '"I suppose I don\'t need them. I\'m a ghost."', effects: [{ kind: 'loot', ids: ['hintGlasses'] }] }, lose: { text: 'It vanishes in a huff.', effects: [] } } },
    ] },
  { id: 'smoothGemEvent', title: 'A Perfectly Smooth Stone', art: 'oren', regions: ['kakarikoLB', 'houseOfGales', 'swampPalaceLB', 'sanctuaryLB'],
    text: 'At the bottom of a clear pool lies a stone so smooth it looks wet even in your hand. A Zora is watching you very carefully.',
    choices: [
      { label: 'Take the Smooth Gem', outcome: { text: '"Her Majesty has been looking for that," says the Zora, and swims away fast.', effects: [{ kind: 'quest', id: 'smoothGem' }] } },
      { label: 'Return it to Queen Oren', requires: { quest: ['smoothGem'] }, outcome: { text: 'The queen of the Zoras rises from the water, enormous and delighted. "Finally! I shall reward you with my presence."', effects: [{ kind: 'takeQuest', id: 'smoothGem' }, { kind: 'recruit', pool: ['oren'] }] } },
    ] },
  { id: 'grampsHut', title: "Gramps's Hut", art: 'gramps', regions: ['kakarikoLB', 'sanctuaryLB', 'hyruleCastleLB'],
    text: 'A bald old man with a cane eyes your sword arm. "Swinging it like a broom. Want to see how it\'s done?"',
    choices: [
      { label: 'Train with him', outcome: { text: 'Bruised all over, and better for it.', effects: [{ kind: 'xp', amount: 35 }, { kind: 'hp', pct: -0.1 }] } },
      { label: 'Ask him to come', gamble: { chance: 35, win: { text: '"Hah! Fine. Someone has to look after you lot."', effects: [{ kind: 'recruit', pool: ['gramps'] }] }, lose: { text: '"My knees say no."', effects: [] } } },
      { label: 'Buy a Great Spin Scroll (₹500)', cost: 500, outcome: { text: '"Read it. Then practise. Then practise more."', effects: [{ kind: 'loot', ids: ['greatSpinScroll'] }] } },
    ] },
  { id: 'witchsHut', title: "The Witch's Hut", art: 'irene', regions: ['kakarikoLB', 'easternPalaceLB', 'towerOfHeraLB', 'turtleRockLB', 'sanctuaryLB'],
    text: 'A broom leans against a crooked hut. A girl in a witch\'s hat pokes her head out of the window. "Need a lift? Ring the bell!"',
    choices: [
      { label: 'Ring the bell', outcome: { text: 'She swoops you over the next ridge. The march is much shorter.', effects: [{ kind: 'hp', pct: 0.1 }, { kind: 'supplies', amount: 1 }] } },
      { label: 'Invite Irene along', gamble: { chance: 40, win: { text: '"An adventure? Grandma would be so jealous!"', effects: [{ kind: 'recruit', pool: ['irene'] }] }, lose: { text: '"I\'ve got deliveries all week. Sorry!"', effects: [] } } },
      { label: 'Buy a Stamina Scroll (₹700)', cost: 700, outcome: { text: '"Grandma\'s recipe. Don\'t read it on an empty stomach."', effects: [{ kind: 'loot', ids: ['staminaScroll'] }] } },
    ] },
  { id: 'thievesDen', title: 'A Pink-Haired Thief', art: 'thiefGirl', regions: LORULE,
    text: 'Someone drops from a rooftop and lands on your supply cart. "Nice stuff. Shame if somebody… borrowed it."',
    choices: [
      { label: 'Let her take a little (₹80)', cost: 80, outcome: { text: '"You\'re all right." She tells you where the traps are.', effects: [{ kind: 'lorule', op: 'hint' }, { kind: 'support', amount: 1 }] } },
      { label: 'Offer her a job', gamble: { chance: 45, win: { text: '"Paid work? In Lorule? Now that\'s a heist."', effects: [{ kind: 'recruit', pool: ['thiefGirl'] }] }, lose: { text: 'She vanishes with a sack of Rupees.', effects: [{ kind: 'rupees', amount: -60 }] } } },
    ] },
  { id: 'loruleanForge', title: 'The Ruined Forge', art: 'loruleanBlacksmith', regions: LORULE,
    text: 'A Lorulean smith works alone in a forge with half a roof. "My partner\'s gone. Work isn\'t. You have something that needs tempering?"',
    choices: [
      { label: 'Temper the Master Sword with Master Ore', requires: { quest: ['masterOre'] }, outcome: { text: 'The sword hums in the quench.', effects: [{ kind: 'lorule', op: 'temper' }] } },
      { label: 'Have him mend the army\'s weapons', outcome: { text: 'Every edge comes back sharp.', effects: [{ kind: 'lorule', op: 'repairAll' }] } },
      { label: 'Ask him to join', gamble: { chance: 40, win: { text: '"Fine. Bring the forge with us."', effects: [{ kind: 'recruit', pool: ['loruleanBlacksmith'] }] }, lose: { text: '"Someone has to keep this fire lit."', effects: [] } } },
    ] },
  { id: 'loruleDeserters', title: 'Deserters of Lorule', art: 'loruleSoldier', regions: LORULE,
    text: 'Horned soldiers sit around a dying fire. "The princess says the kingdom can be saved. We\'ve stopped believing her."',
    choices: [
      { label: 'Give them a reason to fight', outcome: { text: 'Two of them pick up their spears.', effects: [{ kind: 'recruit', pool: ['loruleSoldier', 'loruleSpearman', 'loruleKnight'] }] } },
      { label: 'Share your rations', outcome: { text: 'They tell you which crack in which wall leads home.', effects: [{ kind: 'supplies', amount: -1 }, { kind: 'lorule', op: 'hint' }, { kind: 'support', amount: 1 }] } },
    ] },
  { id: 'portraitOfGanon', title: "The Demon King's Portrait", art: 'yuga', regions: ['hyruleCastleLB', 'thievesTown', 'loruleCastle', 'treacherousTower'], requires: { unit: ['yuga'] },
    text: 'A dusty frame leans in the ruins. Inside: a boar-headed giant with a trident, painted so well it seems to breathe. Yuga stares at it for a long time.',
    choices: [
      { label: 'Let Yuga merge with the painting', outcome: { text: '"Magnificent. MAGNIFICENT." The painting peels off the canvas and pours into him. Yuga Ganon rises.', effects: [{ kind: 'lorule', op: 'fuseYuga' }] } },
      { label: 'Burn the painting', outcome: { text: 'Yuga sulks for a week. The army sleeps better.', effects: [{ kind: 'support', amount: 1 }] } },
    ] },
  { id: 'maiamaiMother', title: "Mother Maiamai's Pool", art: 'motherMaiamai', regions: ['kakarikoLB', 'houseOfGales', 'swampPalaceLB'],
    text: 'In a cave by the lake, an enormous pink octopus sits in a pool, weeping. "My babies! I\'ve lost a hundred of them! Every ten you bring home, I\'ll make one of your tools Nice."',
    choices: [
      { label: 'Promise to look for them', outcome: { text: '"Oh, you dear. Here — one was hiding under my shell."', effects: [{ kind: 'lorule', op: 'maiamai', amount: 2 }] } },
      { label: 'Ask her to come with you', requires: { minAct: 3 }, gamble: { chance: 30, win: { text: '"If it means finding them faster… carry me carefully."', effects: [{ kind: 'recruit', pool: ['motherMaiamai'] }] }, lose: { text: '"I can\'t leave the pool, dear. What if they come home?"', effects: [] } } },
    ] },
];
