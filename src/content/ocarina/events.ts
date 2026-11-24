import type { EventDef } from '../../engine/types';

/** Random events on the march. Effects are resolved by engine/run.ts (resolveEventChoice). */
export const EVENTS: EventDef[] = [
  {
    id: 'travelingMerchant', title: 'A Wandering Merchant', art: 'maskSalesman',
    text: 'A cheerful salesman with an enormous backpack waves you down. "I have just the thing for you… for a price!"',
    choices: [
      { label: 'Buy his mystery bag (₹200)', cost: 200, gamble: { chance: 65,
        win: { text: 'Inside: something genuinely useful!', effects: [{ kind: 'loot', ids: ['bluePotion', 'fairy', 'bombchu', 'magicJar', 'learnFireArrows', 'sheetSaria'] }] },
        lose: { text: 'Inside: a single rock with a face painted on it. The salesman is already gone.', effects: [] } } },
      { label: 'Ask for directions instead', outcome: { text: 'He points vaguely in every direction and wishes you happiness.', effects: [{ kind: 'xp', amount: 10 }] } },
    ],
  },
  {
    id: 'woundedSoldier', title: 'A Wounded Soldier', art: 'hyruleSoldier',
    text: 'A Hyrulean soldier lies by the road, his unit scattered. He begs to be taken along.',
    choices: [
      { label: 'Patch him up and bring him along', outcome: { text: 'He is grateful and swears to fight for you.', effects: [{ kind: 'recruit', pool: ['hyruleSoldier', 'hyruleArcher', 'hyruleKnight'] }] } },
      { label: 'Share your rations and move on', outcome: { text: 'He thanks you. Your army feels good about the kindness.', effects: [{ kind: 'support', amount: 4 }] } },
    ],
  },
  {
    id: 'gamblingDen', title: 'Treasure Chest Shop', art: 'kokiriA',
    text: 'A shady game: pick the right chest out of two and win big. Pick wrong and you lose your stake.',
    choices: [
      { label: 'Bet ₹150', cost: 150, gamble: { chance: 50,
        win: { text: 'The chest is full of Rupees!', effects: [{ kind: 'rupees', amount: 400 }] },
        lose: { text: 'Empty. The shopkeeper grins.', effects: [] } } },
      { label: 'Walk away', outcome: { text: 'Wise. Probably.', effects: [] } },
    ],
  },
  {
    id: 'hotSpring', title: 'A Hidden Spring', art: 'greatFairy',
    text: 'Warm water bubbles up between the rocks. It would be a fine place to rest.',
    choices: [
      { label: 'Bathe and rest', outcome: { text: 'Your army feels refreshed.', effects: [{ kind: 'hp', pct: 0.4 }] } },
      { label: 'Spar by the water instead', outcome: { text: 'A good workout, if a tiring one.', effects: [{ kind: 'xp', amount: 30 }, { kind: 'hp', pct: -0.1 }] } },
    ],
  },
  {
    id: 'skulltulaHouse', title: 'The Cursed House', art: 'skulltula',
    text: 'An abandoned house crawls with Gold Skulltulas. A cursed man inside will pay for every token you bring him.',
    choices: [
      { label: 'Clear out the Skulltulas', gamble: { chance: 70,
        win: { text: 'You return with a fistful of tokens. He pays well.', effects: [{ kind: 'rupees', amount: 250 }, { kind: 'xp', amount: 15 }] },
        lose: { text: 'The spiders bite back. You flee with a few tokens.', effects: [{ kind: 'rupees', amount: 60 }, { kind: 'hp', pct: -0.2 }] } } },
      { label: 'Leave the poor man be', outcome: { text: 'You hear him sobbing as you go.', effects: [] } },
    ],
  },
  {
    id: 'gerudoChallenge', title: 'A Gerudo Challenge', art: 'gerudoGuard', regions: ['gerudoDesert', 'hyruleField'],
    text: 'A Gerudo warrior blocks the path. "Prove your strength, and you may pass with a gift."',
    choices: [
      { label: 'Accept the duel', gamble: { chance: 60,
        win: { text: 'She laughs and hands over her blade. "Not bad!"', effects: [{ kind: 'loot', ids: ['gerudoScimitar', 'staminaPotion'] }, { kind: 'stat', stat: 'str', amount: 1 }] },
        lose: { text: 'You are thrown in the sand. She is kind enough to let you go.', effects: [{ kind: 'hp', pct: -0.15 }] } } },
      { label: 'Pay a toll (₹100)', cost: 100, outcome: { text: 'She steps aside, unimpressed.', effects: [] } },
    ],
  },
  {
    id: 'goronFeast', title: 'A Goron Feast', art: 'goronWarrior', regions: ['deathMountain', 'hyruleField', 'kakarikoGraveyard'],
    text: 'A group of Gorons invites you to share a meal of their finest rocks.',
    choices: [
      { label: 'Eat a rock, Goron style', gamble: { chance: 40,
        win: { text: 'Somehow it works. You feel tougher.', effects: [{ kind: 'stat', stat: 'def', amount: 1 }, { kind: 'support', amount: 6 }] },
        lose: { text: 'Ow. Your teeth.', effects: [{ kind: 'hp', pct: -0.1 }] } } },
      { label: 'Politely watch', outcome: { text: 'A Goron youngster asks to follow you!', effects: [{ kind: 'recruit', pool: ['goronWarrior', 'goronRoller'] }] } },
    ],
  },
  {
    id: 'zoraOffering', title: 'An Offering at the Shrine', art: 'kingZora', regions: ['zorasDomain', 'lostWoods', 'hyruleField'],
    text: 'A sacred pool glints with coins. A sign asks travelers to leave an offering for good fortune.',
    choices: [
      { label: 'Make an offering (₹120)', cost: 120, outcome: { text: 'A blessing settles over your army.', effects: [{ kind: 'stat', stat: 'lck', amount: 2 }, { kind: 'hp', pct: 0.25 }] } },
      { label: 'Fish out a few coins', gamble: { chance: 55,
        win: { text: 'Nobody saw.', effects: [{ kind: 'rupees', amount: 150 }] },
        lose: { text: 'An Octorok in the pool spits at you. Bad luck follows.', effects: [{ kind: 'rupees', amount: 30 }, { kind: 'hp', pct: -0.2 }] } } },
    ],
  },
  {
    id: 'graveDigger', title: "Dampé's Tour", art: 'dampe', regions: ['kakarikoGraveyard', 'hyruleField', 'hyruleCastle'],
    text: 'The gravekeeper offers to dig up something for you, for a small fee. "Heh heh… what will come out?"',
    choices: [
      { label: 'Pay for a dig (₹80)', cost: 80, gamble: { chance: 60,
        win: { text: 'Treasure from beneath the earth!', effects: [{ kind: 'loot', ids: ['redPotion', 'bluePotion', 'fairy', 'sheetStorms', 'magicJar', 'bomb'] }] },
        lose: { text: 'Only bones. Then the bones get up.', effects: [{ kind: 'hp', pct: -0.1 }, { kind: 'xp', amount: 15 }] } } },
      { label: 'No thanks', outcome: { text: 'He shrugs and keeps digging.', effects: [] } },
    ],
  },
  {
    id: 'kokiriLost', title: 'Lost in the Woods', art: 'kokiriB', regions: ['kokiriForest', 'lostWoods'],
    text: 'A Kokiri child has wandered too far and is frightened. The woods are dangerous for those who stray.',
    choices: [
      { label: 'Escort them home', outcome: { text: 'The Kokiri thank you with a gift from the forest.', effects: [{ kind: 'loot', ids: ['dekuNut', 'lonLonMilk', 'sheetSaria'] }, { kind: 'xp', amount: 10 }] } },
      { label: 'Invite them to join', outcome: { text: '"Can I really come?"', effects: [{ kind: 'recruit', pool: ['kokiriScout', 'kokiriSlingshooter'] }] } },
    ],
  },
  {
    id: 'trainingGround', title: 'An Old Training Ground', art: 'ironKnuckle',
    text: 'Rusted practice dummies and an old suit of armor stand in a ruined courtyard.',
    choices: [
      { label: 'Train hard', outcome: { text: 'Everyone pushes their limits.', effects: [{ kind: 'xp', amount: 40 }, { kind: 'hp', pct: -0.2 }] } },
      { label: 'Light drills', outcome: { text: 'A steady practice session.', effects: [{ kind: 'xp', amount: 15 }] } },
    ],
  },
  {
    id: 'campfire', title: 'Campfire Stories', art: 'malon',
    text: 'Around the fire, the army swaps stories late into the night.',
    choices: [
      { label: 'Stay up and talk', outcome: { text: 'Bonds grow stronger.', effects: [{ kind: 'support', amount: 10 }] } },
      { label: 'Get a good night’s sleep', outcome: { text: 'Everyone wakes rested.', effects: [{ kind: 'hp', pct: 0.25 }] } },
    ],
  },
  {
    id: 'deserters', title: 'Deserters', art: 'moblin',
    text: 'A handful of monsters have fled their army and want no part of the war. One offers to switch sides.',
    choices: [
      { label: 'Take them in', outcome: { text: 'A new, if unusual, ally.', effects: [{ kind: 'recruit', pool: ['moblin', 'lizalfos', 'stalchild', 'dekuScrub'] }] } },
      { label: 'Shake them down', outcome: { text: 'They hand over their loot and scurry off.', effects: [{ kind: 'rupees', amount: 120 }] } },
    ],
  },
  {
    id: 'owlAdvice', title: 'The Wise Owl', art: 'kaepora',
    text: 'A great owl lands on a branch above you. "Hoo hoo! Would you like to hear my advice again?"',
    choices: [
      { label: 'Yes', outcome: { text: 'It goes on… and on… but you learn something.', effects: [{ kind: 'xp', amount: 25 }] } },
      { label: 'No', outcome: { text: '"Hoo hoo! Then listen once more…" You lose most of the afternoon.', effects: [{ kind: 'xp', amount: 10 }] } },
    ],
  },
  {
    id: 'ambushedCaravan', title: 'A Raided Caravan', art: 'ingo',
    text: 'An overturned supply wagon. The raiders are gone, but they left a few crates behind.',
    choices: [
      { label: 'Search the crates', gamble: { chance: 75,
        win: { text: 'Supplies!', effects: [{ kind: 'loot', ids: ['redPotion', 'hyruleRation', 'staminaPotion', 'greenPotion', 'bomb'] }, { kind: 'rupees', amount: 60 }] },
        lose: { text: 'A trap! A bomb goes off.', effects: [{ kind: 'hp', pct: -0.15 }] } } },
      { label: 'Return the cargo to its owner', outcome: { text: 'The merchant pays a reward.', effects: [{ kind: 'rupees', amount: 140 }] } },
    ],
  },
];
