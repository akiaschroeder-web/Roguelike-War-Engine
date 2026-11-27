import type { EventDef } from '../../engine/types';
import { FS_ROUTE } from './regions';

const ALL = FS_ROUTE;
const fx = (op: string, extra: { id?: string; amount?: number } = {}) => ({ kind: 'fourswords' as const, op, ...extra });

// Encounters on the march: Great Fairies and their Level 2 tools, the Shrine Maidens' crystals, Hyrule soldiers to
// rescue, Kaepora Gaebora, Tingle's Force Gem trade, Shadow Link's tricks, the Dark Mirror and the Royal Jewels.
export const EVENTS: EventDef[] = [
  { id: 'fsGreatFairy', title: 'A Great Fairy', art: 'greatFairy', regions: ALL,
    text: 'Behind a Force Barrier that has just dissolved, a Great Fairy laughs. "Four little heroes! Show me your tools and I will make them stronger."',
    choices: [
      { label: 'Ask for a Level 2 upgrade', outcome: { text: 'One of your tools glows, and comes back heavier.', effects: [fx('upgrade')] } },
      { label: 'Ask for her blessing', outcome: { text: 'The whole army is healed.', effects: [{ kind: 'hp', pct: 1 }] } },
    ] },
  { id: 'fsMaidenCrystal', title: 'A Shrine Maiden\'s Crystal', art: 'whiteMaiden', regions: ['whereaboutsOfTheWind', 'easternHyrule', 'deathMountainFSA', 'darkWorldFSA', 'desertOfDoubt', 'frozenHyrule'],
    text: 'In an alcove, a girl in robes sleeps inside a crystal. A Force Gem the size of a fist sits on the pedestal in front of her.',
    choices: [
      { label: 'Carry the crystal to the Sanctuary', outcome: { text: 'The crystal is lighter than it looks. The Shrine Maiden Sanctuary can free her.', effects: [{ kind: 'quest', id: 'maidenCrystal' }] } },
      { label: 'Break the seal now (the Four Links)', requires: { unit: ['greenLink', 'redLink', 'blueLink', 'purpleLink'] }, outcome: { text: 'The four swords touch the crystal at once. It shatters, and she steps out.', effects: [fx('maiden')] } },
    ] },
  { id: 'fsRescueSoldiers', title: 'Bewitched Soldiers', art: 'hyruleSoldier', regions: ['whereaboutsOfTheWind', 'nearTheFields', 'easternHyrule'],
    text: 'A squad of Hyrule soldiers stands in the road with empty eyes, spears levelled. Ganon\'s spell is wearing thin.',
    choices: [
      { label: 'Break the spell', outcome: { text: 'They blink, and salute. One of them asks to come along.', effects: [{ kind: 'recruit', pool: ['hyruleSpearman', 'hyruleBombardier', 'hyruleSoldier'] }] } },
      { label: 'Ask for their captain', gamble: { chance: 45, win: { text: 'The captain shakes off the spell and takes command of his men again — under you.', effects: [{ kind: 'recruit', pool: ['hyruleCaptain'] }] },
        lose: { text: 'The captain is still under it. You leave him to sleep it off.', effects: [{ kind: 'xp', amount: 15 }] } } },
    ] },
  { id: 'fsKaepora', title: 'The Owl', art: 'kaeporaGaeboraFS', regions: ALL,
    text: 'A great owl lands on a stone. "Hoo hoo! The Force Gems you gather are the power of the Four Sword itself. Gather enough, and the sword will answer."',
    choices: [
      { label: 'Listen to his advice', outcome: { text: 'Your next battle begins with 250 Force Power.', effects: [fx('force', { amount: 250 })] } },
      { label: 'Ask him to fly with you', gamble: { chance: 30, win: { text: '"Hoo! Very well, for a while."', effects: [{ kind: 'recruit', pool: ['kaepora'] }] }, lose: { text: '"Hoo hoo. Another time."', effects: [] } } },
    ] },
  { id: 'fsTingle', title: 'Tingle\'s Gem Trade', art: 'tingle', regions: ALL,
    text: 'A man in green tights pops out of a bush. "Force Gems! Tingle buys and sells. Rupees for gems, gems for Rupees. Kooloo-limpah!"',
    choices: [
      { label: 'Buy a head start (₹150)', cost: 150, outcome: { text: 'Your next battle begins with 400 Force Power.', effects: [fx('force', { amount: 400 })] } },
      { label: 'Sell him your gem luck', outcome: { text: 'He pays in Rupees and runs.', effects: [{ kind: 'rupees', amount: 120 }] } },
    ] },
  { id: 'fsShadowAmbush', title: 'Shadow Link', art: 'shadowLink', regions: ['whereaboutsOfTheWind', 'nearTheFields', 'darkWorldFSA', 'desertOfDoubt', 'realmOfTheHeavens'],
    text: 'A Link in black stands on the road ahead, grinning. He tosses a Force Gem from hand to hand. "Come and take it."',
    choices: [
      { label: 'Chase him', outcome: { text: 'He leads you a merry dance and drops a bomb at your feet. But he drops the gem too.', effects: [{ kind: 'hp', pct: -0.1 }, fx('force', { amount: 300 })] } },
      { label: 'Offer him a place in your army', requires: { unit: ['greenLink', 'redLink', 'blueLink', 'purpleLink'] },
        gamble: { chance: 30, win: { text: '"Four of you and one of me? Fine. I\'ll be the interesting one."', effects: [{ kind: 'recruit', pool: ['shadowLink'] }] }, lose: { text: 'He laughs and melts into the shadows.', effects: [] } } },
    ] },
  { id: 'fsSanctuary', title: 'The Four Sword Sanctuary', art: 'zeldaFS', regions: ['seaOfTrees', 'whereaboutsOfTheWind'],
    text: 'The Four Sword stands in its pedestal under the shrine roof, the Maidens\' sigils carved around it. Princess Zelda is waiting.',
    choices: [
      { label: 'Draw the sword', outcome: { text: 'Light. Then four of you, blinking at each other.', effects: [fx('links')] } },
      { label: 'Train formations with the princess', outcome: { text: 'Box, Line, Column, Cross. Again. Again.', effects: [fx('drill'), { kind: 'xp', amount: 20 }] } },
      { label: 'Ask the princess to come', gamble: { chance: 40, win: { text: '"I will not wait to be carried off a second time."', effects: [{ kind: 'recruit', pool: ['zeldaFS'] }] }, lose: { text: '"The Sanctuary needs me here."', effects: [] } } },
    ] },
  { id: 'fsRoyalJewel', title: 'A Royal Jewel', art: 'zeldaFS', regions: ['whereaboutsOfTheWind', 'nearTheFields', 'desertOfDoubt', 'frozenHyrule', 'easternHyrule'],
    text: 'Under a heap of stones, something glitters: one of the five Royal Jewels, the keys to the Pyramid\'s seal.',
    choices: [
      { label: 'Take the jewel', outcome: { text: 'Set on a Royal Jewel Pedestal, it will open the way on.', effects: [{ kind: 'quest', id: 'royalJewel' }] } },
      { label: 'Trade it to a merchant', outcome: { text: 'He pays well, and asks no questions.', effects: [{ kind: 'rupees', amount: 200 }] } },
    ] },
  { id: 'fsDarkMirror', title: 'The Dark Mirror', art: 'shadowLink', regions: ['darkWorldFSA', 'vaatisPalace', 'realmOfTheHeavens'],
    text: 'A mirror of black glass hangs in the air. In it, your reflections smile when you don\'t.',
    choices: [
      { label: 'Smash it', outcome: { text: 'It breaks into shards that whisper. You keep one.', effects: [{ kind: 'quest', id: 'shadowMirrorQuest' }, { kind: 'xp', amount: 25 }] } },
      { label: 'Step through', gamble: { chance: 50, win: { text: 'On the other side, a chest — and your own shadow, holding it out to you.', effects: [{ kind: 'loot', ids: ['shadowHerosTunic', 'shadowMirror', 'shadowSword'] }] },
        lose: { text: 'Your shadow shoves you back out, bruised.', effects: [{ kind: 'hp', pct: -0.15 }] } } },
    ] },
  { id: 'fsBigBombShop', title: 'The Bomb Shop', art: 'bigBomb', regions: ['deathMountainFS', 'deathMountainFSA', 'nearTheFields', 'realmOfTheHeavens'],
    text: 'A Goron in a shed full of fuses. "Bombs! Big bombs! A Giant Bomb, if you have the Rupees and the nerve."',
    choices: [
      { label: 'Buy Level 2 Bombs (₹300)', cost: 300, outcome: { text: 'Bigger, louder.', effects: [{ kind: 'loot', ids: ['bombL2'] }] } },
      { label: 'Buy a Giant Bomb (₹700)', cost: 700, outcome: { text: 'It takes two of you to carry it.', effects: [{ kind: 'loot', ids: ['giantBomb'] }] } },
      { label: 'Adopt the shop\'s "pet"', gamble: { chance: 35, win: { text: 'A Big Bomb waddles after you, fuse already lit.', effects: [{ kind: 'recruit', pool: ['bigBomb'] }] }, lose: { text: 'It explodes. Everyone is fine. Mostly.', effects: [{ kind: 'hp', pct: -0.05 }] } } },
    ] },
  { id: 'fsGnatHat', title: 'The Gnat Hat', art: 'ezloCap', regions: ['seaOfTrees', 'easternHyrule', 'desertOfDoubt', 'darkWorldFSA'],
    text: 'In a tree stump, a tiny hat on a tiny peg. A note: "Wear me, and fit where you couldn\'t."',
    choices: [
      { label: 'Take the Gnat Hat', requires: { noGear: ['gnatHat'] }, outcome: { text: 'It fits any head, and makes it very small.', effects: [{ kind: 'loot', ids: ['gnatHat'] }] } },
      { label: 'Leave it', outcome: { text: 'Somewhere, a Minish sighs.', effects: [{ kind: 'support', amount: 1 }] } },
    ] },
];
