// Support conversations. Not canon: just the cast getting to know each other
// between battles. Lines are [speaker, text], speaker 'a' or 'b' matching the
// pair's order in the key ('a|b').

export type ConvoLine = ['a' | 'b', string];
export type ConvoRank = 'C' | 'B' | 'A' | 'S';

export const CONVERSATIONS: Record<string, Partial<Record<ConvoRank, ConvoLine[]>>> = {
  'link|zelda': {
    C: [['b', 'You fight like someone who has done this a hundred times.'], ['a', '…'], ['b', 'And you talk like someone who has never done it once.'], ['a', '(nods)'], ['b', 'Fine. Keep your secrets. Just keep that shield up.']],
    B: [['b', 'I had a dream about a boy in green, long before we met.'], ['a', '…?'], ['b', 'In the dream, you were carrying a sword far too big for you. You tripped over it.'], ['a', '(looks offended)'], ['b', 'You got back up, though. That part I remember clearly.']],
    A: [['b', 'Whatever this war is, I am glad you are on my side of it.'], ['a', 'Always.'], ['b', 'He speaks! I will have to write that down.'], ['a', '…'], ['b', 'Too late. It is in the royal records now.']],
    S: [['b', 'When this is over, will you stay at the castle?'], ['a', 'If you want me there.'], ['b', 'I do. Not as a knight. As… someone I can talk to.'], ['a', 'Then I will listen.'], ['b', 'You always do. That is rather the point.']],
  },
  'link|malon': {
    C: [['b', 'Fairy boy! You ride like a sack of turnips.'], ['a', '…'], ['b', 'Shoulders back, heels down. Epona can feel you worrying.'], ['a', '(sits up straight)'], ['b', 'See? She already likes you more.']],
    B: [['b', 'Dad says the ranch will be fine without me for a while.'], ['b', 'He says that, then falls asleep in the hay.'], ['a', 'Ingo is there.'], ['b', 'That is exactly what worries me!']],
    A: [['b', 'When the fighting gets bad, I sing to the horses. Keeps them calm.'], ['a', 'It keeps me calm too.'], ['b', 'Oh! Well… I suppose I can sing a little louder, then.']],
    S: [['b', 'Promise me something. When it is all over, come back to Lon Lon.'], ['a', 'I promise.'], ['b', 'Good. The fences will need fixing, and you owe me about a hundred carrots.']],
  },
  'link|saria': {
    C: [['b', 'You still get lost in the woods, don\'t you?'], ['a', '…sometimes.'], ['b', 'Just follow the music. I will always be playing.']],
    B: [['b', 'Mido keeps saying you aren\'t a real Kokiri.'], ['a', '…'], ['b', 'I told him real friends don\'t care about that. He sulked for a week.']],
    A: [['b', 'Out here, everything is so big. The sky goes on forever.'], ['a', 'Does it scare you?'], ['b', 'A little. But you\'re here. That makes it an adventure instead.']],
    S: [['b', 'Whatever happens, we\'ll be friends forever. Right?'], ['a', 'Forever.'], ['b', 'Then let\'s win this, and go home and play my song under the big tree.']],
  },
  'link|navi': {
    C: [['b', 'Hey! Listen! You missed that Octorok three times!'], ['a', '…'], ['b', 'I\'m just saying! Aim with your EYES!']],
    B: [['b', 'Do you ever get tired of me shouting at you?'], ['a', '…a little.'], ['b', 'Hmph! Well, I only do it because somebody has to watch your back!']],
    A: [['b', 'The Great Deku Tree asked me to look after you.'], ['b', 'At first I thought it was a punishment.'], ['a', 'And now?'], ['b', 'Now I think it\'s the best job in all of Hyrule. Don\'t tell anyone.']],
    S: [['b', 'If I ever have to fly away… you\'ll be okay. You know that, right?'], ['a', 'Don\'t go.'], ['b', '…Then I won\'t. Not today. Hey! Listen! There\'s a battle to win!']],
  },
  'darunia|link': {
    C: [['a', 'BROTHER! Your swordwork is good, but your stance is weak! Like a pebble!'], ['b', '…'], ['a', 'A Goron stands like a mountain! Again!']],
    B: [['a', 'Do you dance, brother?'], ['b', '…no.'], ['a', 'Then today you learn! A warrior who cannot dance cannot fight! HAHAHA!']],
    A: [['a', 'You have the heart of a Goron, little brother. Small body, big heart!'], ['b', 'Thank you.'], ['a', 'Now hug it out! A Goron hug! Brace yourself!']],
    S: [['a', 'I give you this, brother: the name of a true Goron. Link of the Mountain!'], ['b', 'I\'m honored.'], ['a', 'And when this is over, we feast! Rock sirloin for everyone!']],
  },
  'link|ruto': {
    C: [['b', 'You there! You will carry my things.'], ['a', '…'], ['b', 'A princess does not carry her own spear. It is undignified.']],
    B: [['b', 'Did you know a Zora gives her Sapphire only to her future husband?'], ['a', '(steps back)'], ['b', 'Why do you look so pale? It is an honor!']],
    A: [['b', 'I was childish before. Demanding things.'], ['a', 'A little.'], ['b', '…You were supposed to say "not at all"! Ugh. But thank you for staying anyway.']],
    S: [['b', 'Whatever comes after the war, I want you near the water. Near me.'], ['a', 'I\'ll visit.'], ['b', 'Often! You will visit often. That is a royal command.']],
  },
  'impa|zelda': {
    C: [['a', 'Stay behind me in the next fight, Princess.'], ['b', 'Impa, I can fight.'], ['a', 'I know. That is what worries me.']],
    B: [['b', 'You taught me to hide. Now I want you to teach me to stand.'], ['a', '…Then we begin at dawn. No complaints.'], ['b', 'When have I ever complained?'], ['a', 'Every dawn for twelve years.']],
    A: [['a', 'Your mother would be proud of you.'], ['b', 'Do you really think so?'], ['a', 'I know so. I was there when she was your age. She was far more stubborn.']],
    S: [['b', 'You have given your whole life to protecting me.'], ['a', 'And I would give it again.'], ['b', 'Then let me protect you this time. Just once.'], ['a', '…Just once.']],
  },
  'kingZora|ruto': {
    C: [['a', 'Ruto! A princess should not be on the front line!'], ['b', 'Father, you are on the front line.'], ['a', 'That is… different. I am very large.']],
    B: [['b', 'Did you worry about me when I was swallowed by Lord Jabu-Jabu?'], ['a', 'I did not sleep for days.'], ['b', 'You sleep sitting up. Constantly.'], ['a', 'Worried sleeping. It is very different.']],
    A: [['a', 'You have become a fine leader, my daughter.'], ['b', 'I had a fine example.'], ['a', '…Do not make your father cry in front of the troops.']],
    S: [['b', 'When the war is done, I will take the throne one day. Will you guide me?'], ['a', 'For as long as these old fins can wave.'], ['b', 'Then you will be guiding me for a very long time.']],
  },
  'malon|talon': {
    C: [['b', 'Malon, sweetie, are you eating enough out here?'], ['a', 'Dad, you\'re asleep on your feet.'], ['b', 'I\'m resting my eyes! A man can rest his eyes!']],
    B: [['a', 'Dad, you packed twelve bottles of milk in my saddlebag.'], ['b', 'And?'], ['a', 'And no bandages.'], ['b', 'Milk fixes everything, dear.']],
    A: [['b', 'Your mother would have loved seeing you ride like that.'], ['a', 'You think so?'], ['b', 'I know it. She was the same: fearless, and always humming.']],
    S: [['a', 'When we get home, I\'m going to run the ranch, and you\'re going to nap as much as you like.'], ['b', 'That\'s my girl. Wake me when it\'s dinner.']],
  },
  'biggoron|darunia': {
    C: [['a', 'Little brother Darunia.'], ['b', 'Little? I am the Big Brother of all Gorons!'], ['a', '…I am Biggoron.'], ['b', '…Fair point.']],
    B: [['a', 'I have forged a blade for the war. It is very big.'], ['b', 'How big?'], ['a', 'Bigger than Medigoron\'s.'], ['b', 'Then it is perfect!']],
    A: [['b', 'Brother, when you step into battle, the whole mountain shakes.'], ['a', 'Sorry.'], ['b', 'Do not apologize! It is magnificent!']],
    S: [['b', 'After the war, we will hold the greatest feast the mountain has ever seen!'], ['a', 'I will bring the rocks.'], ['b', 'You ARE the rocks, brother!']],
  },
  'kotake|koume': {
    C: [['b', 'Kotake! You froze my favorite broom again!'], ['a', 'Koume, you set fire to my hat. Again.'], ['b', 'It was cold! I was helping!']],
    B: [['a', 'Four hundred years and you still snore like a volcano.'], ['b', 'Four hundred years and you still complain like a glacier!'], ['a', 'Kotta-ke-ke-ke!']],
    A: [['b', 'You know, sister, I would not want to rule the desert with anyone else.'], ['a', '…Are you feeling ill?'], ['b', 'Never mind! Forget I said anything!']],
    S: [['a', 'Fire and ice.'], ['b', 'Ice and fire.'], ['a', 'Together we are unstoppable.'], ['b', 'Twinrova! Ho ho ho!']],
  },
  'ganondorf|nabooru': {
    C: [['b', 'Don\'t expect me to bow just because we fight on the same side.'], ['a', 'I would expect nothing less from you.']],
    B: [['b', 'The Gerudo deserve better than fear and conquest.'], ['a', 'And what would you give them instead?'], ['b', 'Freedom. Something you\'ve never once offered.']],
    A: [['a', 'You challenge me at every turn. No one else dares.'], ['b', 'Someone has to.'], ['a', 'Perhaps that is why I keep you close.']],
    S: [['b', 'This isn\'t the story everyone tells about us. Good.'], ['a', 'In this one, we fight together.'], ['b', 'Then make it count, King of Thieves.']],
  },
  'saria|youngLink': {
    C: [['a', 'Saria! Look, I have a sword now!'], ['b', 'Careful! You\'ll poke your eye out.'], ['a', 'I won\'t, I\'m—ow.'], ['b', '…']],
    B: [['b', 'Do you miss the forest?'], ['a', 'I miss you playing music by the stump.'], ['b', 'Then I\'ll play it out here. The forest can come with us.']],
    A: [['a', 'Saria, when we grow up—'], ['b', 'Kokiri don\'t grow up, silly.'], ['a', 'Well, if we DID.'], ['b', 'Then we\'d still be best friends. Obviously.']],
    S: [['b', 'Forever and always, okay?'], ['a', 'Forever and always.']],
  },
};

const GENERIC: Record<'C' | 'B' | 'A', ConvoLine[][]> = {
  C: [
    [['a', 'You\'re {b}, right? I\'ve seen you fight.'], ['b', 'And? Any notes?'], ['a', 'Only that I\'m glad you\'re on our side.']],
    [['b', 'You nearly took my head off with that swing, {a}.'], ['a', 'Nearly. I have excellent aim.'], ['b', '…Let\'s practice anyway.']],
    [['a', 'Mind if I share your campfire?'], ['b', 'Only if you brought something to eat.'], ['a', 'I have… one ration. And a rock.'], ['b', 'Sit down.']],
    [['b', '{a}, you snore.'], ['a', 'I do not.'], ['b', 'The whole camp heard you. Even the horses looked worried.']],
  ],
  B: [
    [['a', 'I watched your back out there.'], ['b', 'I noticed. Thanks, {a}.'], ['a', 'Just return the favor next time.']],
    [['b', 'Why do you fight, {a}?'], ['a', 'Same reason as anyone, I suppose. Somebody has to.'], ['b', 'That\'s a better answer than most.']],
    [['a', 'You\'re quieter than I expected, {b}.'], ['b', 'I talk when there\'s something worth saying.'], ['a', 'Then I\'ll try to be worth talking to.']],
    [['b', 'We make a good team, don\'t we?'], ['a', 'The enemy certainly thinks so.']],
  ],
  A: [
    [['a', '{b}, if anything happens to me—'], ['b', 'Nothing is going to happen. I won\'t let it.'], ['a', '…Alright. Same goes for you.']],
    [['b', 'I trust you, {a}. I don\'t say that often.'], ['a', 'Then I\'ll make sure it means something.']],
    [['a', 'When this is over, let\'s get a drink at the Kakariko inn.'], ['b', 'Your treat.'], ['a', 'Naturally.']],
    [['b', 'Funny. We started as strangers.'], ['a', 'And now?'], ['b', 'Now I can\'t imagine this army without you.']],
  ],
};

/** The conversation for a pair at a rank: hand-written if there is one, otherwise a generic one. */
export function conversationFor(ta: string, tb: string, rank: ConvoRank, names: { a: string; b: string }): { lines: ConvoLine[]; swap: boolean } {
  const key = ta < tb ? `${ta}|${tb}` : `${tb}|${ta}`;
  const swap = ta > tb;
  const special = CONVERSATIONS[key]?.[rank];
  if (special) return { lines: special, swap };
  const pool = GENERIC[rank === 'S' ? 'A' : rank];
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const lines = pool[h % pool.length].map(([s, t]) => [s, t.replace(/\{a\}/g, names.a).replace(/\{b\}/g, names.b)] as ConvoLine);
  return { lines, swap: false };
}
