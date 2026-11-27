import type { EventDef } from '../../engine/types';
import { AGES_OF_LABRYNNA, DREAM_OF_KOHOLINT, LEGEND_REGION_IDS, LIGHT_AND_DARK, SEASONS_OF_HOLODRUM } from './regions';

const ORACLES = [...SEASONS_OF_HOLODRUM, ...AGES_OF_LABRYNNA];
const LTTP = LIGHT_AND_DARK;
const LA = DREAM_OF_KOHOLINT;

// Encounters on the march (section 12's ring appraisal and Gasha farming, the trading sequences,
// Syrup's potions, owl statues, and the people of Hyrule, Koholint, Holodrum and Labrynna).
export const EVENTS: EventDef[] = [
  { id: 'vasuRingShop', title: "Vasu's Ring Shop", art: 'farore', regions: [...ORACLES, ...LA],
    text: 'A jeweller in a striped awning polishes a loupe. "Rings! I appraise rings! And I keep them safe, too, if you have a Ring Box." Two Subrosians argue over a ring on the counter.',
    choices: [
      { label: 'Appraise a Mystery Ring (₹20)', requires: { questCount: { mysteryRing: 1 } }, cost: 20, outcome: { text: 'Vasu squints through his loupe. "Oh ho! Now this is something."', effects: [{ kind: 'legend', op: 'appraise' }] } },
      { label: 'Appraise every Mystery Ring (₹15 each, paid after)', requires: { questCount: { mysteryRing: 2 } }, outcome: { text: 'He lines them up and goes through them one by one.', effects: [{ kind: 'legend', op: 'appraiseAll' }] } },
      { label: 'Sell duplicate rings', outcome: { text: '"Two of the same? Identical rings don\'t stack, you know. I\'ll take the spare."', effects: [{ kind: 'legend', op: 'sellDuplicates' }] } },
      { label: 'Ring Box: store unequipped rings', requires: { quest: ['ringBox'] }, outcome: { text: 'The rings go into velvet slots, out of the convoy.', effects: [{ kind: 'legend', op: 'ringBoxStore' }] } },
      { label: 'Ring Box: take the rings out', requires: { quest: ['ringBox'] }, outcome: { text: 'Back to the convoy they go.', effects: [{ kind: 'legend', op: 'ringBoxTake' }] } },
      { label: 'Buy a Ring Box (₹150)', requires: { noQuest: ['ringBox'] }, cost: 150, outcome: { text: '"Every serious collector needs one." Your first ring is a gift: a Friendship Ring.', effects: [{ kind: 'quest', id: 'ringBox' }, { kind: 'loot', ids: ['friendshipRing'] }] } },
    ] },
  { id: 'gashaTree', title: 'Soft Soil', art: 'makuTreeHolodrum', regions: [...ORACLES, ...LA],
    text: 'A patch of soft, dark soil by the road. Old Gasha trees grow in places like this — and somewhere nearby, one you planted may be ready.',
    choices: [
      { label: 'Plant a Gasha Seed', outcome: { text: 'You push a Gasha Seed into the soil. It will grow as you fight, explore and finish quests.', effects: [{ kind: 'legend', op: 'plantGasha' }] } },
      { label: 'Check your Gasha trees', outcome: { text: 'You walk back along the road to see how your trees are doing.', effects: [{ kind: 'legend', op: 'harvestGasha' }] } },
      { label: 'Dig around the roots', gamble: { chance: 50, win: { text: 'A Gasha Seed someone dropped!', effects: [{ kind: 'loot', ids: ['gashaSeed'] }] }, lose: { text: 'Only worms.', effects: [{ kind: 'xp', amount: 10 }] } } },
    ] },
  { id: 'syrupsHut', title: "Syrup's Potion Shop", art: 'syrup', regions: [...LTTP, ...ORACLES],
    text: 'A cackle from a hut full of bubbling pots. "Heh heh heh! Potions! Fresh potions! Bring me mushrooms and I\'ll make you something special."',
    choices: [
      { label: 'Red Potion (₹60)', cost: 60, outcome: { text: '"Drink it all, dearie."', effects: [{ kind: 'loot', ids: ['redPotion'] }] } },
      { label: 'Blue Potion (₹160)', cost: 160, outcome: { text: '"The good stuff. Heh heh."', effects: [{ kind: 'loot', ids: ['bluePotion'] }] } },
      { label: 'Trade a Sleepy Toadstool for Magic Powder', outcome: { text: 'She stirs the toadstool into a pot. Sparkling powder comes out.', effects: [{ kind: 'legend', op: 'brew', id: 'sleepyToadstool' }] } },
      { label: 'Ask her to join you', gamble: { chance: 45, win: { text: '"An apprentice with a sword? Why not!" She packs her pots.', effects: [{ kind: 'recruit', pool: ['syrup'] }] }, lose: { text: '"Buy something first!"', effects: [] } } },
    ] },
  { id: 'owlStatue', title: 'An Owl Statue', art: 'windFish', regions: LA,
    text: 'A stone owl stands beside the path, its beak missing. A carving on the base reads: "The Wind Fish dreams."',
    choices: [
      { label: 'Fit a Stone Beak and listen', requires: { quest: ['stoneBeak'] }, outcome: { text: '"Hoot! The key to the egg lies with the eight instruments..." You understand the island a little better.', effects: [{ kind: 'xp', amount: 30 }, { kind: 'support', amount: 1 }] } },
      { label: 'Search the base', gamble: { chance: 55, win: { text: 'A Stone Beak, wedged in the rocks.', effects: [{ kind: 'quest', id: 'stoneBeak' }] }, lose: { text: 'Only moss.', effects: [] } } },
      { label: 'Rest in its shade', outcome: { text: 'A quiet hour on Koholint.', effects: [{ kind: 'hp', pct: 0.1 }] } },
    ] },
  { id: 'mambosCave', title: "Manbo's Cave", art: 'marin', regions: LA,
    text: 'A fish in sunglasses dances in a pond under the cliffs. "Manbo\'s Mambo! Learn it and you can always get away, baby!"',
    choices: [
      { label: "Learn Manbo's Mambo", outcome: { text: 'Whoever carries an instrument picks up the tune.', effects: [{ kind: 'legend', op: 'song', id: 'manbosMambo' }] } },
      { label: 'Listen to Mamu the frog instead (₹100)', cost: 100, outcome: { text: '"The Frog\'s Song of Soul! It wakes what sleeps."', effects: [{ kind: 'legend', op: 'song', id: 'frogsSongOfSoul' }] } },
      { label: 'Ask Marin to teach the Ballad', requires: { unit: ['marin'] }, outcome: { text: 'She hums it until you can play it too.', effects: [{ kind: 'legend', op: 'song', id: 'balladSong' }] } },
    ] },
  { id: 'tradingLA', title: 'A Trade on Koholint', art: 'tarin', regions: LA,
    text: 'Someone in the village has something they\'d give a lot to swap. On Koholint, every trade leads to another.',
    choices: [
      { label: 'Make the trade', outcome: { text: 'You hand over what you carry and get the next thing in return.', effects: [{ kind: 'legend', op: 'trade', id: 'la' }] } },
      { label: 'Keep walking', outcome: { text: 'Maybe later.', effects: [] } },
    ] },
  { id: 'tradingOoS', title: 'A Trade in Holodrum', art: 'din', regions: SEASONS_OF_HOLODRUM,
    text: 'A traveller by the road looks at your pack hopefully. "Got anything to trade?"',
    choices: [
      { label: 'Make the trade', outcome: { text: 'One more link in the chain.', effects: [{ kind: 'legend', op: 'trade', id: 'oos' }] } },
      { label: 'Keep walking', outcome: { text: 'Maybe later.', effects: [] } },
    ] },
  { id: 'tradingOoA', title: 'A Trade in Labrynna', art: 'nayru', regions: AGES_OF_LABRYNNA,
    text: 'In Lynna, past and present, everyone seems to want what someone else has.',
    choices: [
      { label: 'Make the trade', outcome: { text: 'One more link in the chain.', effects: [{ kind: 'legend', op: 'trade', id: 'ooa' }] } },
      { label: 'Keep walking', outcome: { text: 'Maybe later.', effects: [] } },
    ] },
  { id: 'seedTreeGrove', title: 'A Mystical Seed Tree', art: 'makuTreeLabrynna', regions: ORACLES,
    text: 'A strange tree heavy with seeds — ember, scent, pegasus, gale or mystery, depending on the soil.',
    choices: [
      { label: 'Fill the satchel', outcome: { text: 'You shake the branches.', effects: [{ kind: 'legend', op: 'seeds', amount: 15 }] } },
      { label: 'Buy a bigger Seed Satchel (₹200)', cost: 200, outcome: { text: 'A satchel-maker sits under the tree. Your satchel holds more now.', effects: [{ kind: 'legend', op: 'satchel' }] } },
      { label: 'Take a handful for the pack', outcome: { text: 'Seeds for throwing.', effects: [{ kind: 'loot', ids: ['emberSeed', 'scentSeed', 'pegasusSeed', 'galeSeed', 'mysterySeed'] }] } },
    ] },
  { id: 'smithiesOfKakariko', title: 'The Smithies', art: 'linksUncle', regions: LTTP,
    text: 'Two dwarven smiths — brothers, once a pair, now a pair again — eye your sword. "We can temper that."',
    choices: [
      { label: "Temper the Fighter's Sword (₹150)", requires: { gear: ['fightersSword'] }, cost: 150, outcome: { text: 'Clang, clang: a Tempered Sword.', effects: [{ kind: 'legend', op: 'temper' }] } },
      { label: 'Buy a Red Shield (₹300)', cost: 300, outcome: { text: 'It doesn\'t mind fire.', effects: [{ kind: 'loot', ids: ['redShield'] }] } },
      { label: 'Ask about the Golden Sword', requires: { gear: ['temperedSword'] }, gamble: { chance: 35,
        win: { text: 'They send you to the fairy fountain under the Pyramid. You throw the sword in — and it comes back gold.', effects: [{ kind: 'legend', op: 'gild' }] },
        lose: { text: '"Not yet. Find the fountain under the Pyramid first."', effects: [{ kind: 'xp', amount: 15 }] } } },
    ] },
  { id: 'sahasrahlasHideout', title: "Sahasrahla's Hideout", art: 'sahasrahla', regions: LTTP,
    text: 'An old man waits in a hidden room behind Kakariko. "The Pendants of Virtue... gather them all, and the Master Sword will be yours."',
    choices: [
      { label: 'Show him the three Pendants', requires: { gear: ['pendantOfCourage', 'pendantOfWisdom', 'pendantOfPower'], noGear: ['masterSword'] }, outcome: { text: 'In the Lost Woods, the blade comes free of its pedestal.', effects: [{ kind: 'loot', ids: ['masterSword'] }] } },
      { label: 'Ask for his counsel', outcome: { text: '"Courage, wisdom and power — all three must be in you."', effects: [{ kind: 'xp', amount: 25 }] } },
      { label: 'Ask him to come along', outcome: { text: '"I have waited long enough." He takes his staff.', effects: [{ kind: 'recruit', pool: ['sahasrahla'] }] } },
    ] },
  { id: 'pyramidFountain', title: 'The Fountain under the Pyramid', art: 'ganonLegend', regions: ['darkWorld', 'ganonsTowerLttP'],
    text: 'A cracked wall in the Pyramid of Power, and behind it a fairy fountain. "Did you drop this?"',
    choices: [
      { label: 'Throw in your arrows', outcome: { text: 'The fairy gives back arrows of silver.', effects: [{ kind: 'loot', ids: ['silverArrow'] }] } },
      { label: 'Throw in your sword', requires: { gear: ['temperedSword'] }, outcome: { text: 'It comes back gold.', effects: [{ kind: 'legend', op: 'gild' }] } },
      { label: 'Bathe in the fountain', outcome: { text: 'Everyone feels better.', effects: [{ kind: 'hp', pct: 0.35 }] } },
    ] },
  { id: 'animalCompanions', title: 'A Friend in Natzu', art: 'ricky', regions: SEASONS_OF_HOLODRUM,
    text: 'A kangaroo without his boxing gloves, a Dodongo the villagers are bullying and a nervous blue bear with wings. All three look at you.',
    choices: [
      { label: "Find Ricky's gloves", outcome: { text: '"Thanks, mate!" Ricky\'s Flute is yours, and so is his friendship.', effects: [{ kind: 'loot', ids: ['rickysFlute'] }, { kind: 'recruit', pool: ['ricky'] }] } },
      { label: 'Chase off the bullies', outcome: { text: 'Dimitri gives you his flute and swims along beside you.', effects: [{ kind: 'loot', ids: ['dimitrisFlute'] }, { kind: 'recruit', pool: ['dimitri'] }] } },
      { label: 'Share some Spring Bananas', outcome: { text: 'Moosh flutters after you, very grateful and very nervous.', effects: [{ kind: 'loot', ids: ['mooshsFlute'] }, { kind: 'recruit', pool: ['moosh'] }] } },
      { label: 'Buy a Strange Flute (₹200)', cost: 200, outcome: { text: 'It plays a note none of them can resist.', effects: [{ kind: 'loot', ids: ['strangeFlute'] }] } },
    ] },
  { id: 'subrosianDance', title: 'The Subrosian Dance Hall', art: 'din', regions: ['subrosia', 'templeOfSeasons'],
    text: 'Hooded Subrosians dance in a ring of lava light. "Dance with us! Win and you get a prize! Lose and you get... dancing."',
    choices: [
      { label: 'Dance', gamble: { chance: 55, win: { text: 'Perfect steps! A Mystery Ring and a boomerang.', effects: [{ kind: 'quest', id: 'mysteryRing' }, { kind: 'loot', ids: ['magicalBoomerang'] }] }, lose: { text: 'You get very dizzy.', effects: [{ kind: 'xp', amount: 10 }] } } },
      { label: 'Trade Star-Shaped Ore for a ribbon', requires: { questCount: { starShapedOre: 1 } }, outcome: { text: 'Rosa loves it.', effects: [{ kind: 'takeQuest', id: 'starShapedOre' }, { kind: 'quest', id: 'ribbonOracle' }, { kind: 'quest', id: 'mysteryRing' }] } },
      { label: 'Dig on the beach', gamble: { chance: 50, win: { text: 'Star-Shaped Ore!', effects: [{ kind: 'quest', id: 'starShapedOre' }] }, lose: { text: 'Hot sand.', effects: [] } } },
    ] },
  { id: 'makuTreeCounsel', title: 'The Maku Tree', art: 'makuTreeLabrynna', regions: ORACLES,
    text: 'A great tree yawns awake. "You came! The Essences... bring them to me, and I will make you a Maku Seed."',
    choices: [
      { label: 'Ask for a Maku Seed', requires: { questCount: { essenceOfNature: 4 } }, outcome: { text: 'A glowing seed falls into your hands.', effects: [{ kind: 'loot', ids: ['makuSeed'] }] } },
      { label: 'Ask for a Maku Seed', requires: { questCount: { essenceOfTime: 4 } }, outcome: { text: 'A glowing seed falls into your hands.', effects: [{ kind: 'loot', ids: ['makuSeed'] }] } },
      { label: 'Rest under the branches', outcome: { text: 'The Maku Tree hums. Everyone heals.', effects: [{ kind: 'hp', pct: 0.25 }] } },
      { label: 'Ask the Oracle of Secrets for help', gamble: { chance: 30, win: { text: 'Farore steps out from behind the tree. "I suppose I could come."', effects: [{ kind: 'recruit', pool: ['farore'] }] }, lose: { text: 'A voice from the branches: "Come back with a secret."', effects: [{ kind: 'xp', amount: 15 }] } } },
    ] },
  { id: 'ralphRushes', title: 'Ralph Rushes Ahead', art: 'ralph', regions: AGES_OF_LABRYNNA,
    text: 'A young swordsman in a cape runs past. "Nayru! I\'m coming!" He trips, gets up and turns around. "...Are you going the same way?"',
    choices: [
      { label: 'Let him come', outcome: { text: '"Great! Just try to keep up."', effects: [{ kind: 'recruit', pool: ['ralph'] }] } },
      { label: 'Spar with him', outcome: { text: 'He\'s reckless but good. Everyone learns something.', effects: [{ kind: 'xp', amount: 30 }] } },
    ] },
  { id: 'impaPushes', title: 'Impa and the Stone', art: 'impaOracle', regions: [...AGES_OF_LABRYNNA, ...SEASONS_OF_HOLODRUM],
    text: 'A big woman leans on a boulder that won\'t move. "Help an old nursemaid out? There\'s a Triforce carving behind it."',
    choices: [
      { label: 'Push together', outcome: { text: 'It moves. "Thank you, dear. I\'ll come with you — the Oracles may need me."', effects: [{ kind: 'recruit', pool: ['impaOracle'] }] } },
      { label: 'Look behind it', gamble: { chance: 50, win: { text: 'A Mystery Ring in the dirt.', effects: [{ kind: 'quest', id: 'mysteryRing' }] }, lose: { text: 'A very old carving and nothing else.', effects: [{ kind: 'xp', amount: 10 }] } } },
    ] },
  { id: 'tarinsBees', title: "Tarin's Bees", art: 'tarin', regions: LA,
    text: 'Tarin holds a stick in front of a beehive. "If I just poke it a little, I bet there\'s honey—"',
    choices: [
      { label: 'Stop him', outcome: { text: '"Aw." He shares his mushrooms instead.', effects: [{ kind: 'loot', ids: ['magicMushroom', 'sleepyToadstool'] }] } },
      { label: 'Let him poke it', gamble: { chance: 40, win: { text: 'Honeycomb! And a bottled Golden Bee.', effects: [{ kind: 'loot', ids: ['goldenBee'] }] }, lose: { text: 'Bees. Everywhere.', effects: [{ kind: 'hp', pct: -0.06 }, { kind: 'loot', ids: ['bottledBee'] }] } } },
      { label: 'Ask him to come along', outcome: { text: '"An adventure? With mushrooms?"', effects: [{ kind: 'recruit', pool: ['tarin'] }] } },
    ] },
  { id: 'mysteryRingCache', title: 'A Buried Ring', art: 'heroOfLegend', regions: LEGEND_REGION_IDS,
    text: 'A Treasure Map scrap points to a stump. Under it, something glints.',
    choices: [
      { label: 'Dig it up', outcome: { text: 'A Mystery Ring. Vasu will want to see this.', effects: [{ kind: 'quest', id: 'mysteryRing' }] } },
      { label: 'Look for Gasha Seeds instead', outcome: { text: 'Two seeds in a little pouch.', effects: [{ kind: 'loot', ids: ['gashaSeed'] }, { kind: 'loot', ids: ['gashaSeed'] }] } },
    ] },
  { id: 'fluteBoysGrove', title: 'The Haunted Grove', art: 'fluteBoy', regions: ['darkWorld', 'deathMountainLttP', 'hyruleCastleLttP'],
    text: 'In a clearing, a small creature plays a flute for the animals. When it sees you, it stops. "Will you take my flute back to the Light World?"',
    choices: [
      { label: 'Take the flute', outcome: { text: 'A bird-call flute: songs come easily now.', effects: [{ kind: 'loot', ids: ['fluteBoysOcarina'] }] } },
      { label: 'Ask him to play for you', outcome: { text: 'Everyone feels rested.', effects: [{ kind: 'hp', pct: 0.2 }, { kind: 'support', amount: 1 }] } },
      { label: 'Invite him along', outcome: { text: 'He smiles and follows.', effects: [{ kind: 'recruit', pool: ['fluteBoy'] }] } },
    ] },
];
