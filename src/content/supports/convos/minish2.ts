// Support conversations: The Minish Cap (part 2: cross-pack heroes, princesses, companions and villains). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  // ── Heroes ──
  'heroOfMinish|link': {
    C: [
      ['b', 'Your hat is talking.'],
      ['a', 'Your fairy is talking.'],
      ['b', '…Fair.'],
    ],
    B: [
      ['b', 'You shrink? Like, all the way down?'],
      ['a', 'Small enough to walk inside a ChuChu.'],
      ['b', 'I\'ve been swallowed by a giant fish. I don\'t think I want to know what the inside of a ChuChu is like.'],
      ['a', 'Sticky.'],
    ],
    A: [
      ['b', 'I slept for seven years and woke up a hero. Did you get to choose?'],
      ['a', 'I chose to carry a sword to the festival. The rest just… happened.'],
      ['b', 'That\'s how it always goes. Somebody hands you a sword and the whole world gets heavier.'],
    ],
    S: [
      ['a', 'Ezlo says there will be other heroes after us. In other times. Wearing green.'],
      ['b', 'Then let\'s leave them something good to find.'],
      ['a', 'A sword in a pedestal?'],
      ['b', 'I was thinking a well-stocked shop. But yes, the sword too.'],
    ],
  },
  'heroOfLegend|heroOfMinish': {
    C: [
      ['a', 'Pegasus Boots? I have a pair too. Race you to the tree line.'],
      ['b', 'Ready—'],
      ['n', 'They both crash into the same bush at exactly the same moment.'],
    ],
    B: [
      ['a', 'I\'ve been to three different kingdoms that weren\'t mine. Every one of them had a princess in trouble.'],
      ['b', 'Mine was turned to stone.'],
      ['a', 'Mine was sealed in a crystal. Do you think they compare notes?'],
      ['b', 'I think they\'d have stern words for both of us about taking so long.'],
    ],
    A: [
      ['b', 'The Four Sword splits me into four. It\'s strange. They all think they\'re me.'],
      ['a', 'On Koholint, I wasn\'t sure what was real either. A whole island inside a dream.'],
      ['b', 'How did you know which was the real you?'],
      ['a', 'The one who keeps going when it would be easier to stop.'],
    ],
    S: [
      ['a', 'You know, of all the Links I\'ve met, you\'re the only one who\'s tinier than the monsters.'],
      ['b', 'You\'ve met other Links?'],
      ['a', 'A few. Different swords, same stubbornness. You\'d like them.'],
      ['b', 'I like you. That\'s a good start.'],
    ],
  },
  'heroOfMinish|heroOfWinds': {
    C: [
      ['b', 'Is that a bird on your head?'],
      ['a', 'It\'s Ezlo.'],
      ['b', 'Huh. I had a talking boat.'],
      ['a', 'A boat? That must be very hard to wear.'],
    ],
    B: [
      ['b', 'My grandma made me wear green on my birthday. Said it was the hero\'s colour.'],
      ['a', 'Mine just came with the job. And the hat.'],
      ['b', 'It looks good on you. Better than on me. I spent half my journey in my pyjamas.'],
    ],
    A: [
      ['a', 'The sea must be enormous. I\'ve never seen it.'],
      ['b', 'Come with me some time. There\'s nothing bigger than the Great Sea.'],
      ['a', 'At my size, a puddle is the Great Sea.'],
      ['b', 'Then you\'ve been on a lot more voyages than me.'],
    ],
  },
  'heroOfMinish|heroOfSpirits': {
    C: [
      ['b', 'You don\'t ride trains? How do you get around?'],
      ['a', 'I walk. Or I ride a Minish leaf down a stream.'],
      ['b', '…Respect.'],
    ],
    B: [
      ['b', 'I was an engineer, not a swordsman. Then somebody gave me a sword.'],
      ['a', 'I was a blacksmith\'s boy. Same thing.'],
      ['b', 'Do you ever feel like you\'re just pretending?'],
      ['a', 'Every time. The monsters don\'t seem to notice.'],
    ],
    A: [
      ['b', 'Zelda\'s spirit rode with me the whole journey. Who rides with you?'],
      ['a', 'A cranky old sage on my head.'],
      ['b', 'Close enough. Hang on to him.'],
    ],
  },
  'heroOfMinish|heroOfTheWild': {
    C: [
      ['b', 'Your sword is tiny when you shrink. Do you get a tiny shield?'],
      ['a', 'A leaf. Melari made it. It works better than you\'d think.'],
      ['b', 'I once fought a Lynel with a pot lid.'],
    ],
    B: [
      ['b', 'I lost a hundred years. Woke up and everyone I knew was gone.'],
      ['a', 'I lost a princess to stone for a while. Not a hundred years.'],
      ['b', 'It still counts. Every day of it.'],
    ],
    A: [
      ['a', 'You fix weapons by finding new ones. I fix them by going to a forge.'],
      ['b', 'Mine break.'],
      ['a', 'Mine break too. I\'ll introduce you to Melari. You\'ll never throw a sword at a rock again.'],
      ['b', 'Throwing it at the rock is half the fun.'],
    ],
  },
  'heroOfMinish|herosShade': {
    C: [
      ['b', 'Show me your stance, young one.'],
      ['a', 'Another swordmaster?'],
      ['b', 'An old one. Older than the Blade Brothers\' founder. Feet apart.'],
    ],
    B: [
      ['b', 'You split into four. In my day, a hero had to do everything alone.'],
      ['a', 'They\'re still me. It\'s still alone, in a way.'],
      ['b', 'Hm. Wise. Lonely, but wise.'],
    ],
    A: [
      ['b', 'I died with regrets. Techniques I never passed on. Do you know what that is like?'],
      ['a', 'The First Swiftblade waited in a crypt for someone to learn the Great Spin.'],
      ['b', 'Then he and I are not so different. Let me teach you, too.'],
    ],
    S: [
      ['b', 'There. That was the last of what I know.'],
      ['a', 'Thank you.'],
      ['b', 'Do not thank me. Teach it to someone else, one day. Then I will be able to rest.'],
      ['a', 'I will. I promise.'],
    ],
  },
  // ── Princesses ──
  'zeldaMC|zeldaSS': {
    C: [
      ['b', 'Your Picori Festival sounds wonderful. We had a Wing Ceremony on Skyloft. Mostly I just fell off a statue.'],
      ['a', 'On purpose?'],
      ['b', 'Mostly on purpose.'],
    ],
    B: [
      ['a', 'They say the goddess\'s blood runs in Hyrule\'s royal line. That\'s you, isn\'t it?'],
      ['b', 'Some of it is me. Some of it is someone I had to become.'],
      ['a', 'I have the Light Force. I didn\'t ask for it either.'],
    ],
    A: [
      ['b', 'Were you afraid, as stone?'],
      ['a', 'I couldn\'t feel afraid. That was the worst part. Just… waiting.'],
      ['b', 'I slept for thousands of years in a crystal. I know.'],
    ],
    S: [
      ['a', 'Do you think every Zelda after us will have to wait for someone?'],
      ['b', 'I hope some of them get to do the rescuing.'],
      ['a', 'Then let\'s make sure of it. Teach me to fight properly.'],
      ['b', 'Only if you teach me your festival song.'],
    ],
  },
  'zeldaMC|zeldaST': {
    C: [
      ['b', 'You were turned to stone? I lost my body entirely. A spirit, floating about.'],
      ['a', 'Which was worse?'],
      ['b', 'Neither. Both. We should start a club.'],
    ],
    B: [
      ['b', 'At least as a spirit I could possess a Phantom and punch things.'],
      ['a', 'I wish I\'d had that option.'],
      ['b', 'I\'ll teach you. It\'s very satisfying.'],
    ],
    A: [
      ['a', 'You ride trains.'],
      ['b', 'I drive them, now. Link taught me.'],
      ['a', 'I\'m going to make Link teach me to ride a horse. Properly. Not on his head.'],
    ],
  },
  'tetra|zeldaMC': {
    C: [
      ['a', 'A princess with a sword tournament for a festival? I like this kingdom.'],
      ['b', 'You\'re a princess too, I\'m told.'],
      ['a', 'Don\'t believe everything you hear. I\'m a pirate.'],
    ],
    B: [
      ['a', 'Ever thought about running away? On a ship? No more crowns?'],
      ['b', 'Every day, when I was little.'],
      ['a', 'And now?'],
      ['b', 'Now I want to make Hyrule a place nobody needs to run away from.'],
    ],
    A: [
      ['a', 'Fine. You\'re a better princess than me.'],
      ['b', 'You\'re a better pirate.'],
      ['a', 'Ha! Well, that\'s settled. Drinks on me.'],
    ],
  },
  // ── Companions ──
  'ezloMinish|navi': {
    C: [
      ['b', 'Hey! Listen!'],
      ['a', 'I am listening. Must you shout?'],
      ['b', 'It\'s how I get Link\'s attention!'],
      ['a', 'I simply bite mine on the ear.'],
    ],
    B: [
      ['b', 'Does your boy ignore you too? Mine runs off and leaves me shouting at walls.'],
      ['a', 'Mine wears me on his head. He can\'t escape.'],
      ['b', 'That\'s not fair. I want a hat.'],
    ],
    A: [
      ['a', 'You\'ll leave him, one day. When it\'s done.'],
      ['b', '…How did you know?'],
      ['a', 'Because I will, too. Guides always do. That is how they know the hero is ready.'],
    ],
    S: [
      ['b', 'Ezlo… does it get easier? Leaving?'],
      ['a', 'No. But they remember you. Every time they hear a cap flap, or a fairy\'s wings, they remember.'],
      ['b', 'I\'d like that.'],
      ['a', 'Then shout at him one more time, for luck. I\'ll bite his ear.'],
    ],
  },
  'ezloMinish|tatl': {
    C: [
      ['b', 'So you\'re a cursed guy who became a hat. I\'ve seen weirder. I\'ve seen a Skull Kid in a mask.'],
      ['a', 'That is not reassuring.'],
    ],
    B: [
      ['b', 'Mine was the other side. My friend did the bad thing. I just followed.'],
      ['a', 'My apprentice did the bad thing. I taught him.'],
      ['b', 'Huh. So we\'re both the ones who should\'ve stopped it.'],
    ],
    A: [
      ['b', 'Skull Kid\'s okay now. Mostly. Is yours?'],
      ['a', 'Ask me again when this is over.'],
      ['b', 'I will. Don\'t think I won\'t.'],
    ],
  },
  'ciela|ezloMinish': {
    C: [
      ['a', 'You\'re a spirit of courage? You look like a bright yellow fairy.'],
      ['b', 'You look like a bright green hat.'],
      ['a', 'Hmph. Touché.'],
    ],
    B: [
      ['a', 'I didn\'t know who I was, for a while. Just a fairy with no memories.'],
      ['b', 'I remember everything. I\'d rather forget a few things.'],
      ['a', 'You don\'t mean that.'],
      ['b', 'No. I don\'t.'],
    ],
    A: [
      ['a', 'Courage, wisdom and power. I was all three, broken apart.'],
      ['b', 'And I made something with all three of mine that I regret.'],
      ['a', 'Then make something else. Something you\'re proud of.'],
    ],
    S: [
      ['b', 'I\'ve decided what I\'m proud of. The boy.'],
      ['a', 'Same! Ours are both very stubborn.'],
      ['b', 'Stubborn is good. Stubborn wins.'],
      ['a', 'To stubborn boys, then.'],
    ],
  },
  'ezloMinish|fi': {
    C: [
      ['b', 'Master Ezlo. I calculate a 92% probability that your current form causes you discomfort.'],
      ['a', 'You calculate correctly. Can you calculate a cure?'],
      ['b', 'Insufficient data.'],
    ],
    B: [
      ['a', 'You live in a sword. I live in a hat. We should compare.'],
      ['b', 'The sword is spacious. The hat appears to be cramped.'],
      ['a', 'The hat has a view.'],
    ],
    A: [
      ['b', 'When my purpose is complete, I will sleep within the blade. Will you return to your Minish form?'],
      ['a', 'I hope so. Whether I want to is another question.'],
      ['b', 'I do not understand.'],
      ['a', 'You will, one day. You\'ll miss him.'],
    ],
    S: [
      ['b', 'Master Ezlo. I have recalculated. I believe I will miss Master Link.'],
      ['a', 'There it is.'],
      ['b', 'The sensation is… unpleasant. And not.'],
      ['a', 'That is the whole of it, Fi. That is the whole of it.'],
    ],
  },
  'ezloMinish|kingDaphnes#kingOfRedLions': {
    C: [
      ['b', 'A talking hat. And I am a talking boat. We are a strange pair of guides.'],
      ['a', 'At least people sit on you willingly.'],
    ],
    B: [
      ['b', 'Once, I was a king. Now I carry a boy across the sea.'],
      ['a', 'Once, I was a sage. Now I sit on a boy\'s head.'],
      ['b', 'It is humbling.'],
      ['a', 'It is very humbling.'],
    ],
    A: [
      ['a', 'Do you ever wish you could just… be yourself again?'],
      ['b', 'Every day. But then I would not be beside him.'],
      ['a', 'That is the trouble with being a guide.'],
    ],
    S: [
      ['b', 'I will not change back, I think. When it is over, I will stay with the sea.'],
      ['a', 'I will change back. And I am afraid he won\'t recognise me.'],
      ['b', 'He will. He will look at you and see a hat with very strong opinions.'],
      ['a', '…Thank you, Your Majesty.'],
    ],
  },
  'ezloMinish|midnaImp': {
    C: [
      ['b', 'So you\'re cursed, small, and you ride a Hylian around. Rude.'],
      ['a', 'That is exactly what I was going to say about you.'],
    ],
    B: [
      ['b', 'You know what helps with a curse? Being incredibly smug about it.'],
      ['a', 'I have been incredibly smug for years. It has not helped.'],
    ],
    A: [
      ['b', 'Fine. You\'re all right, for a hat.'],
      ['a', 'You\'re all right, for an imp.'],
      ['b', 'I\'m a princess.'],
      ['a', 'And I\'m a sage. We\'re both lying a little, then.'],
    ],
  },
  'anjean|ezloMinish': {
    C: [
      ['a', 'A fellow teacher! Did your student turn into a monster too?'],
      ['b', 'He sided with a demon king.'],
      ['a', 'Ah. A club, then.'],
    ],
    B: [
      ['a', 'I keep asking myself what I should have done differently.'],
      ['b', 'As do I. Every day.'],
      ['a', 'And?'],
      ['b', 'Nothing. Some students choose. We can only be there when they choose again.'],
    ],
    A: [
      ['b', 'Byrne came back, at the end. He gave his life for it.'],
      ['a', 'I hope Vaati doesn\'t have to give that much.'],
      ['b', 'So do I, sage. So do I.'],
    ],
    S: [
      ['a', 'If I ever take another apprentice, I shall teach him what you taught Byrne. All of it.'],
      ['b', 'Including how to fail?'],
      ['a', 'Especially that. Mine never learned.'],
      ['b', 'Then you have already begun.'],
    ],
  },
  // ── Villains ──
  'ghirahim|vaatiHylian': {
    C: [
      ['a', 'Oh, I adore the cape. And the eye! Simply fabulous. Who is your tailor?'],
      ['b', 'I made it myself. With magic.'],
      ['a', 'Of course you did, darling.'],
    ],
    B: [
      ['b', 'You serve a demon king. Why? Why not take the power yourself?'],
      ['a', 'Because, sweet little sorcerer, some of us know what we are. I am a sword. You are a…?'],
      ['b', '…'],
      ['a', 'That\'s the problem, isn\'t it?'],
    ],
    A: [
      ['b', 'I wanted the Light Force so no one would ever step over me again.'],
      ['a', 'And now?'],
      ['b', 'Now people step around me. It is not better.'],
    ],
    S: [
      ['a', 'You\'re not hopeless, you know. Just dramatic. I respect dramatic.'],
      ['b', 'That is the kindest thing anyone has said to me in a century.'],
      ['a', 'Don\'t get used to it.'],
    ],
  },
  'vaatiHylian|zant': {
    C: [
      ['a', 'You also stole a throne, I hear.'],
      ['b', 'I was CHOSEN. It is a completely different thing.'],
      ['a', 'Is it.'],
    ],
    B: [
      ['b', 'The Twili mocked me. Called me unworthy. So I showed them.'],
      ['a', 'The Minish stepped over me. So I showed them.'],
      ['b', 'Did it feel good?'],
      ['a', 'For a while.'],
    ],
    A: [
      ['b', 'My god abandoned me in the end.'],
      ['a', 'My master didn\'t. He came after me, as a hat. I don\'t know which is worse.'],
    ],
    S: [
      ['b', 'Perhaps we should simply… stop. Showing them.'],
      ['a', 'And do what?'],
      ['b', 'I do not know. Something no one expects of us. Something kind.'],
      ['a', 'That would certainly surprise them.'],
    ],
  },
  'ganondorf|vaatiHylian': {
    C: [
      ['a', 'A Minish who wants the Triforce. Interesting.'],
      ['b', 'I wanted the Light Force. A smaller ambition.'],
      ['a', 'There are no small ambitions. Only small men.'],
    ],
    B: [
      ['b', 'You are very large.'],
      ['a', 'And you are very small. Yet you nearly took a kingdom. I can respect that.'],
    ],
    A: [
      ['a', 'If you ever grow tired of the boy\'s side, there is a place for you in my army.'],
      ['b', 'I have been someone\'s apprentice before. It ended badly.'],
      ['a', 'Then do not be my apprentice. Be my rival.'],
    ],
  },
  'majorasMask|vaatiHylian': {
    C: [
      ['a', 'A hat that grants wishes. A mask that grants power. We are kindred.'],
      ['b', 'I am not a mask.'],
      ['a', 'Not yet.'],
    ],
    B: [
      ['a', 'Put me on. Just for a moment. You would never be small again.'],
      ['b', 'No.'],
      ['a', 'Why not? You put on the cap.'],
      ['b', 'And look where that got me.'],
    ],
    A: [
      ['b', 'You are what I would have become. A curse in a shape, with nothing left inside.'],
      ['a', 'Is that so terrible?'],
      ['b', 'Yes. I see that now.'],
    ],
  },
  'bellum|vaatiHylian': {
    C: [
      ['a', 'Your life force… so bright. So much magic.'],
      ['b', 'Keep your tentacles to yourself.'],
    ],
    B: [
      ['b', 'You devour spirits. I only wanted to rule.'],
      ['a', 'Ruling is devouring, little sorcerer. Slowly.'],
    ],
    A: [
      ['b', 'I have met many monsters. You are the first that frightens me.'],
      ['a', 'Good.'],
      ['b', 'Not good. It means I can still be frightened. It means I am not like you.'],
    ],
  },
  'malladus|vaatiHylian': {
    C: [
      ['a', 'You took a princess\'s light. I took a princess\'s body. Which of us did better?'],
      ['b', 'Neither of us is still holding the princess, are we?'],
    ],
    B: [
      ['a', 'A demon king and a wind sorcerer. We could take every kingdom in every age.'],
      ['b', 'Every kingdom has a boy in green.'],
      ['a', '…Yes. That does seem to be a problem.'],
    ],
    A: [
      ['b', 'Why do you keep coming back? Every time you are sealed, you come back.'],
      ['a', 'Because someone always lets me out.'],
      ['b', 'Then perhaps I should not.'],
    ],
  },
};
