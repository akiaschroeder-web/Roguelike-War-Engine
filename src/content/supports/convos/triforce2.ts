// Support conversations: Tri Force Heroes (part 2: across the packs). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'linkALBW|styla': {
    C: [
      ['a', 'Princess? It\'s safe to come out.'],
      ['b', 'Is the hero looking? Don\'t look at me!'],
      ['a', 'I\'m looking at the door. Very hard.'],
    ],
    B: [
      ['b', 'You wear the same green every day.'],
      ['a', 'It\'s my tunic.'],
      ['b', 'It\'s a statement. I approve. Have you considered a Cheetah Costume?'],
    ],
    A: [
      ['b', 'You came all the way from another kingdom for a princess you\'d never met.'],
      ['a', 'Someone in a different kingdom did that for me once. I owed it forward.'],
      ['b', 'Then I owe it too. When someone needs it, I\'ll go.'],
    ],
  },
  'madameCouture|ravio': {
    C: [
      ['b', 'Nice shop! Want to rent some Gust Jars? Very fashionable this season.'],
      ['a', 'Darling, I sell. I do not rent.'],
      ['b', 'Ah. A traditionalist.'],
    ],
    B: [
      ['a', 'Your hood. Is that rabbit fur?'],
      ['b', 'It\'s more of a… rabbit concept.'],
      ['a', 'Let me line it. You look cold.'],
    ],
    A: [
      ['b', 'What if I rented out your outfits? You make them, I lend them, we split the profit!'],
      ['a', 'And when the renter falls off a Totem?'],
      ['b', 'Sheerow brings it home. Usually.'],
      ['a', '…I am listening.'],
    ],
    S: [
      ['a', 'The first rental came back with a tear in the knee. You mended it yourself.'],
      ['b', 'I watched you sew for weeks. It\'s the least a business partner can do.'],
      ['a', 'Partner. Hm. "Couture and Ravio."'],
      ['b', '"Ravio and Couture" has a nice ring too!'],
      ['a', 'No, darling. It does not.'],
    ],
  },
  'hilda|styla': {
    C: [
      ['a', 'Two princesses of two lost causes. Hytopia\'s curse, Lorule\'s collapse.'],
      ['b', 'Hytopia isn\'t lost! Just badly dressed for a while.'],
    ],
    B: [
      ['b', 'Your crown is gorgeous. Very severe.'],
      ['a', 'It was my grandmother\'s. It\'s heavy.'],
      ['b', 'Then let\'s find you a dress light enough to balance it.'],
    ],
    A: [
      ['a', 'You laugh easily, after everything.'],
      ['b', 'I cried for a year in a brown bodysuit. I\'ve earned some laughing.'],
      ['a', 'Perhaps I have too. Teach me.'],
    ],
  },
  'styla|zeldaALBW': {
    C: [
      ['a', 'Princess Zelda! Your gown! Who is your tailor?'],
      ['b', 'Hyrule Castle\'s seamstresses. Is it… all right?'],
      ['a', 'It is magnificent and very old-fashioned. I adore it.'],
    ],
    B: [
      ['b', 'You were cursed into another shape. So was I, once. A painting.'],
      ['a', 'A painting! Could you still see?'],
      ['b', 'Everything. That was the worst of it.'],
      ['a', 'Yes. Everyone looking, and you unable to answer. I know.'],
    ],
    A: [
      ['a', 'When people stared at me in the bodysuit, I wanted to vanish.'],
      ['b', 'When I was a painting, they walked past without stopping.'],
      ['a', 'Which is worse?'],
      ['b', 'Neither, now. We\'re both free to be looked at — or not — as we choose.'],
    ],
    S: [
      ['a', 'I designed you something. A traveling gown — light, practical, still a princess\'s.'],
      ['b', 'For me? For adventures?'],
      ['a', 'For a princess who sends heroes out and sometimes goes herself.'],
      ['b', 'Then I\'ll wear it the next time Hyrule needs me. Thank you, Styla.'],
    ],
  },
  'blueHero|blueLink': {
    C: [
      ['a', 'Blue tunic, blue hat. Copying me?'],
      ['b', 'I was here first. A whole Four Sword first.'],
      ['a', 'Prove it.'],
      ['b', 'Race you to the tree.'],
    ],
    B: [
      ['b', 'You\'re fast. Annoyingly fast.'],
      ['a', 'You\'re fast too. For a split-off copy of somebody.'],
      ['b', 'Say that again and I\'m splitting you off a lake.'],
    ],
    A: [
      ['a', 'Do you ever wish you weren\'t one of four?'],
      ['b', 'Never. Being one of four means three people always have my back. Same as you.'],
      ['a', '…Yeah. Same as me.'],
    ],
    S: [
      ['b', 'Blue Team. Two of us. Unstoppable.'],
      ['a', 'You\'d stack on me?'],
      ['b', 'I\'d stack under you. Don\'t tell anyone.'],
      ['a', 'Ha! Our secret. Blue Team forever.'],
    ],
  },
  'redHero|redLink': {
    C: [
      ['a', 'ANOTHER RED ONE!'],
      ['b', 'YOU\'RE LOUD TOO!'],
      ['a', 'I LIKE YOU ALREADY!'],
    ],
    B: [
      ['b', 'The others call me reckless.'],
      ['a', 'They call me the bottom of the Totem. I think it\'s the same thing.'],
      ['b', 'It means we go first. Somebody has to.'],
    ],
    A: [
      ['a', 'Do you ever get tired of being the strong one?'],
      ['b', 'Some days. Then the others lean on me and I remember why I am.'],
      ['a', 'That\'s exactly it. That\'s exactly it!'],
    ],
    S: [
      ['b', 'Arm-wrestle. Winner carries the Totem.'],
      ['a', 'Loser carries the Totem!'],
      ['b', '…That\'s the same thing.'],
      ['a', 'I KNOW! WE BOTH WIN!'],
    ],
  },
  'ladyMaud|yuga': {
    C: [
      ['b', 'What a striking silhouette. May I paint you?'],
      ['a', 'Only if you paint me as I truly am: magnificent.'],
      ['b', 'Darling, I paint nothing else.'],
    ],
    B: [
      ['a', 'You turn people into pictures. I turn their clothes into rags. We are artists of the same school.'],
      ['b', 'Mine hang in galleries. Yours hang in closets.'],
      ['a', 'Careful, painter.'],
    ],
    A: [
      ['b', 'You envied the princess. I envied the Demon King. We both wanted to be the thing everyone looked at.'],
      ['a', 'And neither of us was, in the end.'],
      ['b', 'No. But together, darling, we might make a very good exhibition.'],
    ],
    S: [
      ['a', 'I saw your self-portrait. The one without the paint.'],
      ['b', 'That one is not for public viewing.'],
      ['a', 'It was the best thing you ever made. Honest. Unflattering.'],
      ['b', '…No one has ever said that to me.'],
      ['a', 'Then I shall say it again at the gala. Loudly.'],
    ],
  },
  'ladyMaud|veran': {
    C: [
      ['b', 'A witch of fashion. How quaint. I possess queens.'],
      ['a', 'And dress them terribly, I imagine.'],
    ],
    B: [
      ['a', 'Your curses take bodies. Mine only take clothes. Which is crueller?'],
      ['b', 'Yours. A body can be returned. Dignity, rarely.'],
    ],
    A: [
      ['b', 'When we are both done here, Labrynna will need a court witch. The pay is excellent.'],
      ['a', 'And the dress code?'],
      ['b', 'Whatever you curse into existence.'],
      ['a', 'I accept.'],
    ],
  },
  'koume|ladyMaud': {
    C: [
      ['a', 'Ho ho! A young witch with a parasol! Kotake, look at her!'],
      ['b', 'Young! Oh, I like you.'],
    ],
    B: [
      ['a', 'Fire and ice, that\'s us. What\'s your element, dearie?'],
      ['b', 'Disappointment. It burns AND freezes.'],
      ['a', 'Ha! She\'ll do. She\'ll do.'],
    ],
    A: [
      ['a', 'Four hundred years of witchcraft, and I\'ll tell you a secret: the hat matters.'],
      ['b', 'I KNEW it.'],
      ['a', 'Come over for tea. Bring that parasol. We\'ll curse a Gerudo guard together.'],
    ],
  },
  'blizzagia|volvagia': {
    C: [
      ['n', 'The ice serpent and the fire dragon coil at opposite ends of the camp. Neither looks away.'],
      ['b', '(A low, smouldering growl.)'],
      ['a', '(A crackle of frost, answering.)'],
    ],
    B: [
      ['n', 'Volvagia breathes on the frozen ground. Blizzagia breathes it frozen again. This goes on for an hour.'],
      ['b', '(It snorts, almost amused.)'],
    ],
    A: [
      ['n', 'A sudden storm. Volvagia\'s heat keeps the fire alive; Blizzagia\'s cold keeps the rain off it. The army sleeps warm and dry.'],
      ['a', '(It settles, crystals chiming softly.)'],
    ],
    S: [
      ['n', 'At dawn the two dragons are found curled together in a ring of steam: ice on one side, fire on the other, the camp warm between them.'],
      ['b', '(A contented rumble.)'],
      ['a', '(A soft hiss of frost, answering in kind.)'],
    ],
  },
  'stalchampion|stalmaster': {
    C: [
      ['b', '(Four arms raise four swords in salute.)'],
      ['a', '(One giant sword answers. It is larger than all four together.)'],
    ],
    B: [
      ['n', 'The two skeletons spar until the moon sets. Bones scatter. Bones reassemble. Neither yields.'],
      ['a', '(It clatters approvingly.)'],
    ],
    A: [
      ['n', 'Stalchampion lowers its sword. Stalmaster lowers all four. They stand in silence, two swordsmen who have outlived their names.'],
      ['b', '(It taps its chest, where a heart would be.)'],
    ],
    S: [
      ['n', 'They teach the younger soldiers together: one how to strike from above, one how to strike from everywhere at once.'],
      ['a', '(It rattles its jaw. A laugh, perhaps.)'],
      ['b', '(It rattles back.)'],
    ],
  },
  'margoma|margomill': {
    C: [
      ['n', 'Margoma spins up beside Margomill. Margomill\'s segments turn to face it. For a while, the two just rotate at each other.'],
    ],
    B: [
      ['n', 'Margomill sends a gust of wind; Margoma spins faster in it, delighted, throwing sparks.'],
    ],
    A: [
      ['n', 'At the army\'s camp, the two guardians spin in time, one in iron, one in stone — a slow, grinding dance only they understand.'],
    ],
  },
};
