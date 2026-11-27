// Support conversations: Four Swords & Four Swords Adventures (part 3: cross-pack pairs). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'greenLink|heroOfMinish': {
    C: [
      ['b', 'That sword. It\'s the Four Sword, isn\'t it? The one I reforged with the Elements.'],
      ['a', 'You made it?'],
      ['b', 'Melari made it. I just carried it round four temples. And a hat yelled at me the whole way.'],
    ],
    B: [
      ['a', 'When you split, the duplicates fade after a few turns. Mine don\'t.'],
      ['b', 'Mine were copies. Yours are… you. Different yous.'],
      ['a', 'Do you think the sword remembers you?'],
      ['b', 'I hope so. I talked to it a lot.'],
    ],
    A: [
      ['b', 'Vaati was my fault. I sealed him in that blade.'],
      ['a', 'And I let him out, by drawing it. So he\'s my fault too.'],
      ['b', 'Then we\'ll keep him in there together.'],
    ],
    S: [
      ['n', 'Two heroes hold one sword between them, generations apart.'],
      ['b', 'Feel that? It\'s humming.'],
      ['a', 'It\'s happy. Both its heroes in one place.'],
      ['b', 'Then let\'s make sure it never needs another one.'],
    ],
  },
  'greenLink|link': {
    C: [
      ['b', 'You lead four of yourselves. I can barely lead one.'],
      ['a', 'You led the Sages through seven years of darkness. I just say "left" a lot.'],
      ['b', '…That\'s honestly most of it.'],
    ],
    B: [
      ['a', 'You lost seven years. Does it feel strange?'],
      ['b', 'Like waking up wearing someone else\'s boots. They fit, but I don\'t remember buying them.'],
      ['a', 'I woke up as four people. I know the feeling.'],
    ],
    A: [
      ['b', 'Ganon. In my time he\'s Ganondorf, the King of Thieves. In yours…'],
      ['a', 'A blue boar with a trident. Every time it\'s him.'],
      ['b', 'Then maybe every time it\'s us, too.'],
    ],
    S: [
      ['a', 'If there\'s always a hero, does it get easier?'],
      ['b', 'No. But you get better at not being alone with it.'],
      ['a', 'I\'ve got three Links and a princess. I\'m very rarely alone.'],
      ['b', 'Then you\'re luckier than I was. Hold on to them.'],
    ],
  },
  'greenLink|heroOfTwilight': {
    C: [
      ['b', 'Four of you. You must never be lonely.'],
      ['a', 'We argue about directions constantly.'],
      ['b', 'I travelled with Midna. I understand.'],
    ],
    B: [
      ['a', 'You fight like a wolf sometimes. Low, fast.'],
      ['b', 'I was one, for a while. It never quite leaves you.'],
      ['a', 'Red says that\'s the coolest thing he\'s ever heard.'],
    ],
    A: [
      ['b', 'When the twilight covered Hyrule, I didn\'t know if I was enough.'],
      ['a', 'When the sword split me, I knew I wasn\'t. So it gave me three more.'],
      ['b', 'Maybe that\'s the trick. Nobody\'s enough alone.'],
    ],
  },
  'darunia|redLink': {
    C: [
      ['a', 'You! The red one! You eat like a Goron!'],
      ['b', 'Is that good?'],
      ['a', 'It\'s the highest praise there is! Have a rock!'],
      ['b', '…I\'ll save it for later.'],
    ],
    B: [
      ['a', 'You charged that Big Dodongo head-first! No fear!'],
      ['b', 'I was a little scared. I just did it louder.'],
      ['a', 'HA! That\'s what courage is, brother! Fear, but louder!'],
    ],
    A: [
      ['b', 'Can I be a Goron? Honorary?'],
      ['a', 'You\'d need to roll down Death Mountain.'],
      ['b', 'I can do that! I\'ve fallen down it twice already!'],
      ['a', 'Ha! Then you\'re halfway there!'],
    ],
    S: [
      ['n', 'At Goron City, the chief stands Red Link in front of the whole tribe.'],
      ['a', 'This is my sworn brother! The Red Hero! Treat him as you would treat me!'],
      ['b', 'Does that mean free rocks?'],
      ['a', 'Free rocks forever!'],
      ['b', 'Best day of my life.'],
    ],
  },
  'heroOfTheWild|redLink': {
    C: [
      ['b', 'You cook? Like, real food?'],
      ['a', 'Mushroom skewers. Meat and rice. Apples on a fire.'],
      ['b', 'Teach me everything.'],
    ],
    B: [
      ['a', 'You don\'t hesitate. In a fight.'],
      ['b', 'Hesitating\'s for Purple! I\'m the one who goes.'],
      ['a', 'I slept for a hundred years. I go now. I don\'t wait.'],
    ],
    A: [
      ['b', 'Is it true you forgot everything when you woke up?'],
      ['a', 'Almost everything.'],
      ['b', 'That\'s sad. I\'d hate to forget the others.'],
      ['a', 'Then make memories they can\'t take. Cook with them. Laugh with them.'],
    ],
  },
  'greatblade|redLink': {
    C: [
      ['a', 'Your sword arm is good, but you swing like you\'re trying to knock down a door.'],
      ['b', 'I am usually trying to knock down a door.'],
      ['a', 'Ha! An honest answer. I respect that.'],
    ],
    B: [
      ['b', 'Show me the big swing again! The one that broke the boulder!'],
      ['a', 'The Rock Breaker. Plant your feet. No, wider. Wider. Now think about lunch.'],
      ['b', 'Why lunch?'],
      ['a', 'Because you hit harder when you\'re hungry.'],
    ],
    A: [
      ['a', 'You\'ve got the makings of a Blade Brother, boy.'],
      ['b', 'Really?'],
      ['a', 'You don\'t have the patience of Swiftblade or the gloom of Grimblade. But you\'ve got my heart.'],
    ],
    S: [
      ['a', 'Here. A scroll. The Power Technique. I don\'t give these to just anybody.'],
      ['b', 'I can keep it?'],
      ['a', 'Keep it, learn it, and when you\'re one hero again, teach it to whoever you become.'],
      ['b', 'I promise! I\'ll practise on every door in Hyrule!'],
    ],
  },
  'blueLink|heroOfWinds': {
    C: [
      ['a', 'You sail? Alone?'],
      ['b', 'With a talking boat.'],
      ['a', '…Okay. That\'s actually cool.'],
    ],
    B: [
      ['b', 'You get angry fast. So did I, when they took my sister.'],
      ['a', 'Did it help?'],
      ['b', 'It got me on the boat. It didn\'t get me across the sea. That took more than angry.'],
    ],
    A: [
      ['a', 'I\'m always the first one in. I can\'t help it.'],
      ['b', 'Me neither. I jumped off a cliff to rescue Aryll.'],
      ['a', 'Did it work?'],
      ['b', 'I landed in a fortress full of Moblins. So, kind of.'],
    ],
    S: [
      ['n', 'On the deck of the King of Red Lions, two Links watch the horizon.'],
      ['b', 'Want to come with me? After all this?'],
      ['a', 'Where?'],
      ['b', 'Anywhere. That\'s the point of a boat.'],
      ['a', '…Yeah. I think I\'d like that.'],
    ],
  },
  'blueLink|tetra': {
    C: [
      ['b', 'You\'ve got a mouth on you, sailor.'],
      ['a', 'You\'ve got a mouth on you, pirate.'],
      ['b', 'Ha! Finally, someone who talks back.'],
    ],
    B: [
      ['a', 'You didn\'t wait for the others either.'],
      ['b', 'A captain doesn\'t wait. She decides.'],
      ['a', 'That\'s what I keep telling Green!'],
    ],
    A: [
      ['b', 'You\'re quick, you\'re rude, and you\'re brave. You\'d make a fine pirate.'],
      ['a', 'I\'m a hero.'],
      ['b', 'In my experience, kid, the difference is mostly paperwork.'],
    ],
  },
  'blueLink|revali': {
    C: [
      ['b', 'Ah. The blue one. I suppose you think you\'re fast.'],
      ['a', 'I am fast.'],
      ['b', 'On the ground, perhaps. How quaint.'],
    ],
    B: [
      ['a', 'Race me. To the end of the field and back.'],
      ['b', 'I can fly.'],
      ['a', 'Then you\'ve got nothing to lose. Unless you\'re scared.'],
      ['b', '…Very well. Prepare to be humbled.'],
    ],
    A: [
      ['b', 'You lost the race, but you nearly kept up. Nobody nearly keeps up.'],
      ['a', 'You nearly lost.'],
      ['b', 'I did not.'],
      ['a', 'You looked back. Twice.'],
      ['b', '…Hmph. Perhaps once.'],
    ],
    S: [
      ['b', 'I have something to say, and I will only say it once.'],
      ['a', 'Okay.'],
      ['b', 'You are… a worthy rival. There. It is said.'],
      ['a', 'Rematch tomorrow?'],
      ['b', 'Obviously. I intend to win by a much larger margin.'],
    ],
  },
  'ezloMinish|purpleLink': {
    C: [
      ['a', 'You! The thoughtful one! Finally, a Link who reads before he swings!'],
      ['b', 'You must be Ezlo. The others warned me.'],
      ['a', 'Warned you? I was a delight! Mostly.'],
    ],
    B: [
      ['b', 'You made the Minish Cap. And Vaati stole it. And then the Four Sword sealed him.'],
      ['a', 'Yes, yes, the whole sorry chain of events, all my fault, et cetera.'],
      ['b', 'I wasn\'t blaming you. I wanted to know how the Cap worked. For research.'],
      ['a', '…Oh. Well. Sit down, then. This will take a while.'],
    ],
    A: [
      ['a', 'You remind me of Vaati, when he was young. Before.'],
      ['b', 'That\'s worrying.'],
      ['a', 'The curiosity. Not the rest. The difference is you ask questions so you can help.'],
    ],
    S: [
      ['a', 'Here. My notes on transformation magic. Don\'t let anyone read them. Especially wind mages.'],
      ['b', 'I\'ll guard them with my life.'],
      ['a', 'Guard them with your sense. You\'ve plenty of that. More than your green friend.'],
      ['b', 'I\'ll tell him you said so.'],
      ['a', 'Don\'t you dare.'],
    ],
  },
  'fi|purpleLink': {
    C: [
      ['a', 'Master Purple. I calculate a 74% probability that you have been counting the Force Gems again.'],
      ['b', '312. And you\'re a sword that calculates?'],
      ['a', 'I am the spirit of a sword. Calculating is what I do best.'],
    ],
    B: [
      ['b', 'Can I ask you about the Four Sword? What it\'s like inside a blade.'],
      ['a', 'Quiet. Purposeful. I find it very orderly.'],
      ['b', 'I find the idea terrifying.'],
      ['a', 'That is a 92% common response.'],
    ],
    A: [
      ['a', 'When the Four Sword is sheathed, you will rejoin your other selves.'],
      ['b', 'I know.'],
      ['a', 'I spent a very long time in a sword. I can tell you, it is not an ending. It is a rest.'],
      ['b', '…That helps more than you know, Fi.'],
    ],
    S: [
      ['a', 'I have revised my estimate. There is a 100% probability that I will remember you.'],
      ['b', 'Is that statistically possible?'],
      ['a', 'For you, I am prepared to make an exception.'],
      ['b', 'Thank you, Fi.'],
    ],
  },
  'nayru|purpleLink': {
    C: [
      ['a', 'You carry a library in your head, young hero.'],
      ['b', 'Mostly lists.'],
      ['a', 'Wisdom begins with lists. Then it learns when to throw them away.'],
    ],
    B: [
      ['b', 'You\'re the Oracle of Ages. Do you know what happens to the four of us?'],
      ['a', 'I know what happens. I don\'t know how it feels. That part is yours.'],
    ],
    A: [
      ['a', 'Sing with me. Time listens to songs more than it listens to reasons.'],
      ['b', 'I can\'t sing.'],
      ['a', 'Then hum. Time is not fussy.'],
    ],
  },
  'darkLink|shadowLink': {
    C: [
      ['b', 'Oh, look. Another one. Do they make us in a factory?'],
      ['a', '…'],
      ['b', 'Not much of a talker. I\'ll do the talking for both of us.'],
    ],
    B: [
      ['a', 'You laugh. In the Water Temple I only watched.'],
      ['b', 'Someone has to enjoy being a shadow. It\'s not going to be you.'],
      ['a', 'I was made to mirror. You were made to mock.'],
    ],
    A: [
      ['b', 'Do you ever want to be something other than his reflection?'],
      ['a', 'Every time he looks away.'],
      ['b', 'Me too. So let\'s look away from him together, brother.'],
    ],
    S: [
      ['n', 'Two shadows stand on a lake that reflects nothing.'],
      ['a', 'Brother.'],
      ['b', 'Hey, that\'s my line.'],
      ['a', 'I am your reflection. I may borrow it.'],
      ['b', 'Ha! Fine. You can have that one. Keep it.'],
    ],
  },
  'midnaImp|shadowLink': {
    C: [
      ['a', 'A shadow that walks on its own. You\'d fit in nicely in the Twilight Realm.'],
      ['b', 'Is it fun there?'],
      ['a', 'It\'s very quiet. You\'d hate it.'],
    ],
    B: [
      ['b', 'You tease the hero all the time. I respect that.'],
      ['a', 'Someone has to keep him humble. You\'re doing a fine job too.'],
      ['b', 'I steal his gems and blow him up.'],
      ['a', 'Amateur.'],
    ],
    A: [
      ['a', 'You were made by someone who wanted a weapon. I was cursed by someone who wanted a throne.'],
      ['b', 'And here we are. Being the funniest people in the army.'],
      ['a', 'Funny is how you survive, shadow. Remember that.'],
    ],
    S: [
      ['a', 'If you ever need a place to go, the Twilight Realm will have you. I\'ll see to it.'],
      ['b', 'You\'d do that? For a mirror-thing?'],
      ['a', 'For a friend, imp. Don\'t make me say it twice.'],
      ['b', '…You just did say it twice. Sort of.'],
    ],
  },
  'shadowLink|skullKid': {
    C: [
      ['a', 'Ooh, a mask. Is there a face under there?'],
      ['b', 'Is there a face under yours? Hee hee!'],
      ['a', '…Good question, actually.'],
    ],
    B: [
      ['b', 'You play tricks too! You stole their gems!'],
      ['a', 'And blew up a bridge. And swapped Red\'s lunch for a rock.'],
      ['b', 'Hee hee! I like you!'],
    ],
    A: [
      ['a', 'Why\'d you take the mask, back then?'],
      ['b', 'My friends left. I was lonely. The mask said it would be fun.'],
      ['a', 'Ganon made me because he wanted something cruel. I don\'t think either of us is as bad as we were made.'],
    ],
    S: [
      ['b', 'Friends? Real ones? Not mask friends?'],
      ['a', 'Real ones. No masks. No mirrors.'],
      ['b', 'Hee hee! Then we\'ll play the best tricks! The nice kind!'],
      ['a', 'The nice kind. Mostly.'],
    ],
  },
  'shadowLink|zant': {
    C: [
      ['b', 'A king who serves Ganon. That\'s not very kingly.'],
      ['a', 'Silence, shadow! I am the Usurper King!'],
      ['a', '…He promised me a throne.'],
      ['b', 'He promised me a hero. We both got lied to.'],
    ],
    B: [
      ['a', 'He never kept a promise to me. Not one.'],
      ['b', 'He made me out of a mirror and called me a tool. You\'re in good company.'],
      ['a', 'I do not want company. I want revenge.'],
    ],
    A: [
      ['b', 'You could stop wanting his favour, you know.'],
      ['a', 'And want what instead?'],
      ['b', 'I\'m trying "nothing he gave me". It\'s working out.'],
    ],
  },
  'phantomGanon|shadowLink': {
    C: [
      ['b', 'You\'re a copy of Ganon. I\'m a copy of Link. We should start a club.'],
      ['a', '(The Phantom says nothing. Its eyes glow.)'],
      ['b', 'Great chat.'],
    ],
    B: [
      ['a', '(The Phantom points its sword at the four Links, then at Shadow Link, and tilts its head.)'],
      ['b', 'Why am I with them? Good question. I\'ll let you know when I figure it out.'],
    ],
    A: [
      ['b', 'You don\'t have to do what he says, you know. I stopped.'],
      ['a', '(The Phantom lowers its sword, very slowly.)'],
      ['b', 'See? It\'s easier than it looks.'],
    ],
  },
  'ganonFSA|ganondorf': {
    C: [
      ['b', 'So. This is what I become. A beast with a fork.'],
      ['a', 'A trident, little thief. And this is what you were. A man with a crown he stole.'],
      ['b', 'Hm. Neither of us is very flattering.'],
    ],
    B: [
      ['a', 'You took the Triforce. I took the Trident of Power from the Pyramid. We always want more.'],
      ['b', 'More is the only direction worth going.'],
      ['a', 'Then why does the hero keep stopping us?'],
    ],
    A: [
      ['b', 'Every time, there is a boy with a sword.'],
      ['a', 'This time there were four.'],
      ['b', '…That seems unfair.'],
      ['a', 'It is the gods\' joke. I have stopped laughing.'],
    ],
    S: [
      ['n', 'The King of Thieves and the King of Darkness stand together, two shapes of one ambition.'],
      ['b', 'If we fought together, not one after another…'],
      ['a', 'Then the heroes would come together too. They always do.'],
      ['b', 'So we wait.'],
      ['a', 'We always wait. And we always return.'],
    ],
  },
  'ganonFSA|ganonLegend': {
    C: [
      ['a', 'Another Ganon. You came out of the Dark World, did you?'],
      ['b', 'I made the Dark World. The Golden Land, twisted to my desire.'],
      ['a', 'I only borrow mine through a mirror. How grand of you.'],
    ],
    B: [
      ['b', 'You carry a trident too.'],
      ['a', 'The Trident of Power. Taken from a Pyramid.'],
      ['b', 'I waited in a Pyramid for the hero to come. He came with silver arrows.'],
      ['a', 'Mine came four at a time.'],
    ],
    A: [
      ['a', 'We are the same demon, wearing different wars.'],
      ['b', 'Then let the wars change. The demon stays.'],
      ['a', 'And so does the hero.'],
    ],
    S: [
      ['b', 'Two tridents. One king. The Dark World has never looked so crowded.'],
      ['a', 'Then make room, brother. When the light falls, we will share it.'],
      ['b', 'Share? We have never shared anything.'],
      ['a', 'We have never had to face four heroes at once.'],
    ],
  },
  'demise|ganonFSA': {
    C: [
      ['a', 'So this is what my hatred has become. A pig with a fork.'],
      ['b', 'Mind your words, ancient one. The trident is sharper than it looks.'],
      ['a', 'Ha! At least it has teeth.'],
    ],
    B: [
      ['b', 'You cursed the hero\'s bloodline. I am that curse?'],
      ['a', 'You are the echo of it. Every echo is quieter than the shout.'],
      ['b', 'Then I will be louder.'],
    ],
    A: [
      ['a', 'Four heroes, you say. My curse made only one.'],
      ['b', 'Your curse was not counting on the Four Sword.'],
      ['a', '…Then the goddess has grown clever. Good. I prefer a worthy fight.'],
    ],
  },
  'cyclos|vaatiHylian': {
    C: [
      ['a', 'You call yourself a wind mage. I am a god of wind.'],
      ['b', 'I call myself the wind. Mages are for other people.'],
      ['a', 'Ha! The arrogance of mortals. I like it.'],
    ],
    B: [
      ['b', 'Teach me to call cyclones that size.'],
      ['a', 'You stole the Minish Cap to get your power. Will you steal mine?'],
      ['b', 'I prefer to be given things. It saves time.'],
    ],
    A: [
      ['a', 'You were small, once. A little Minish who wanted to fly.'],
      ['b', 'And now I am the storm itself.'],
      ['a', 'Being a storm is lonely, little one. Even gods know that.'],
    ],
  },
};
