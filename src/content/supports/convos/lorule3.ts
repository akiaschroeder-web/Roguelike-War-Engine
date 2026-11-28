// Support conversations: A Link Between Worlds (part 3: the Seven Sages, each with every other). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'gulley|osfala': {
    C: [
      ['b', 'Child, stand back. A Sage of my calibre will handle this.'],
      ['a', 'I\'m a Sage too!'],
      ['b', '…You are? Of what calibre?'],
      ['a', 'The small calibre!'],
    ],
    B: [
      ['a', 'Why do you talk like a book?'],
      ['b', 'Because I have read many books.'],
      ['a', 'I\'ve read one. It had a dragon. Want to borrow it?'],
    ],
    A: [
      ['b', 'You were braver in the Dark Palace than I was in the Desert, Gulley.'],
      ['a', 'I was scared the whole time!'],
      ['b', 'Precisely. That\'s what brave is.'],
    ],
  },
  'gulley|seres': {
    C: [
      ['b', 'Gulley! You scraped your knee again.'],
      ['a', 'It\'s a battle scar!'],
      ['b', 'It\'s a scrape. Hold still.'],
    ],
    B: [
      ['a', 'Were you scared, being the first painting?'],
      ['b', 'Very. Then I heard you crying two frames along, and I wasn\'t alone any more.'],
      ['a', 'I wasn\'t crying! …Much.'],
    ],
    A: [
      ['b', 'When this is over, will you come and ring the Sanctuary bell with me?'],
      ['a', 'Every day! Can I ring it really loud?'],
      ['b', 'As loud as you like.'],
    ],
  },
  'gulley|oren': {
    C: [
      ['a', 'Whoa. You\'re HUGE.'],
      ['b', 'Majestic, child.'],
      ['a', 'You\'re HUGELY majestic!'],
      ['b', '…That is acceptable.'],
    ],
    B: [
      ['a', 'Can I ride on your tail?'],
      ['b', 'Certainly not.'],
      ['a', 'Please?'],
      ['b', '…Once. Hold on.'],
    ],
    A: [
      ['b', 'You splashed me on purpose.'],
      ['a', 'You laughed!'],
      ['b', 'A queen does not laugh. A queen… chuckles. Regally.'],
    ],
  },
  'gulley|rosso': {
    C: [
      ['b', 'Ho! Little fellow! Want to see me lift a boulder?'],
      ['a', 'YES!'],
      ['n', 'Rosso lifts a boulder. Gulley cheers. Rosso lifts another one.'],
    ],
    B: [
      ['a', 'Can you lift ME?'],
      ['b', 'Ho ho! Up you go!'],
      ['a', 'I can see the whole battlefield from here!'],
    ],
    A: [
      ['b', 'You\'re strong for your size, little fellow.'],
      ['a', 'I\'m the strongest kid in Kakariko!'],
      ['b', 'And I\'m the strongest miner on the mountain! We\'re a team!'],
    ],
  },
  'gulley|irene': {
    C: [
      ['b', 'Hey, kid! Want a broom ride?'],
      ['a', 'Is it safe?'],
      ['b', 'Nope!'],
      ['a', 'YES!'],
    ],
    B: [
      ['a', 'You did a loop! Do it again!'],
      ['b', 'Hold on to your hat!'],
      ['a', 'I lost my hat!'],
      ['b', 'Ha! We\'ll find it on the way back!'],
    ],
    A: [
      ['b', 'You know you\'re the only one who doesn\'t scream on my broom?'],
      ['a', 'I scream on the inside.'],
      ['b', 'Ha! That\'s the best way.'],
    ],
  },
  'gulley|impaALBW': {
    C: [
      ['b', 'Gulley. Walk behind me in the castle.'],
      ['a', 'Why?'],
      ['b', 'Because I walk in front of everyone. Even princesses.'],
    ],
    B: [
      ['a', 'Lady Impa, how do you move so quietly?'],
      ['b', 'Sheikah training. Heel first, then toe, and never think about it.'],
      ['a', 'I\'m thinking about it.'],
      ['b', 'Then you\'ll be loud. Try again.'],
    ],
    A: [
      ['a', 'I snuck up on you! Did you hear me?'],
      ['b', '…No, I did not. Well done, little Sage.'],
      ['a', 'You did hear me, didn\'t you.'],
      ['b', 'I will never tell.'],
    ],
  },
  'osfala|seres': {
    C: [
      ['a', 'Ah, the priestess. I trust you have studied the ancient texts on Sagehood?'],
      ['b', 'I wrote some of them. In my book.'],
      ['a', '…You WROTE them?'],
    ],
    B: [
      ['b', 'You can read my book if you like. It\'s mostly prayers. And some drawings.'],
      ['a', 'These drawings are very good.'],
      ['b', 'They\'re of the Sanctuary cat.'],
    ],
    A: [
      ['a', 'I was wrong to be so proud, Seres. You are a far better Sage than I.'],
      ['b', 'We\'re all just Sages, Osfala. There isn\'t a better.'],
      ['a', 'Then I will be a humble one. Starting now. Well, tomorrow.'],
    ],
  },
  'oren|osfala': {
    C: [
      ['b', 'Your Majesty. I am Osfala, apprentice of the great—'],
      ['a', 'I know who you are. You talk a great deal.'],
      ['b', '…That is fair.'],
    ],
    B: [
      ['a', 'Sand and water. You and I are opposites, little sage.'],
      ['b', 'Sand needs water to hold together.'],
      ['a', 'Hm. That was almost wise.'],
    ],
    A: [
      ['b', 'Your Majesty, why did you hide in the Swamp Palace for so long?'],
      ['a', 'I lost my gem, and my pride with it. A queen without pride hides.'],
      ['b', 'I lost mine in the desert. We should look for them together.'],
    ],
  },
  'osfala|rosso': {
    C: [
      ['b', 'Ho! Can you lift this?'],
      ['a', 'With magic? Certainly.'],
      ['b', 'With your ARMS!'],
      ['a', '…Certainly not.'],
    ],
    B: [
      ['a', 'You don\'t read at all, do you, Rosso?'],
      ['b', 'I read rocks! This one says "heavy".'],
      ['a', 'That\'s… actually rather a good reading.'],
    ],
    A: [
      ['b', 'You\'re much nicer than you were in the desert, little sage!'],
      ['a', 'I was terribly rude, wasn\'t I.'],
      ['b', 'Ho ho! You were a bit of a pebble. Now you\'re a boulder!'],
    ],
  },
  'impaALBW|osfala': {
    C: [
      ['a', 'You draw attention to yourself, apprentice.'],
      ['b', 'I am the grandson of Sahasrahla! Attention is my inheritance!'],
      ['a', 'Attention is how you get painted.'],
    ],
    B: [
      ['b', 'Lady Impa, did you know my grandfather when he was young?'],
      ['a', 'I knew him when he was loud. Like you.'],
      ['b', 'Grandfather? Loud?'],
      ['a', 'Very. And very brave. Like you, on a good day.'],
    ],
    A: [
      ['b', 'I have been practising silence.'],
      ['a', 'You have been talking about practising silence for an hour.'],
      ['b', '…Starting now.'],
    ],
  },
  'oren|seres': {
    C: [
      ['b', 'Your Majesty, may I bless your waters?'],
      ['a', 'My waters are already blessed. By me.'],
      ['b', 'Then may I bless you?'],
      ['a', '…You may.'],
    ],
    B: [
      ['a', 'Your prayers. They are very gentle.'],
      ['b', 'Father says gentle prayers travel the furthest.'],
      ['a', 'Then pray for my people in the rivers. They have been afraid a long time.'],
    ],
    A: [
      ['b', 'You smile when you think no one is looking, Your Majesty.'],
      ['a', 'Queens do not smile. We… glimmer.'],
      ['b', 'You glimmer very warmly, then.'],
    ],
  },
  'rosso|seres': {
    C: [
      ['a', 'Ho! The little priestess! I lifted the Sanctuary\'s gate once, you know. It was stuck.'],
      ['b', 'That was you? We prayed for a month for someone to fix it!'],
      ['a', 'Then I\'m an answered prayer! Ho ho!'],
    ],
    B: [
      ['b', 'You carried three wounded soldiers off the field at once.'],
      ['a', 'They were light!'],
      ['b', 'They were in armour, Rosso.'],
      ['a', 'Light armour!'],
    ],
    A: [
      ['b', 'Do Sages ever feel useless? I can only heal.'],
      ['a', 'I can only lift! Between us, everyone gets up again!'],
      ['b', '…Yes. Yes, they do.'],
    ],
  },
  'irene|seres': {
    C: [
      ['a', 'Want a lift to the Sanctuary? I\'ll have you there before your prayer is done!'],
      ['b', 'My prayers are quite long.'],
      ['a', 'Then I\'ll go the scenic way!'],
    ],
    B: [
      ['b', 'You fly so fast. Doesn\'t it frighten you?'],
      ['a', 'It frightens Grandma. That\'s why I do it.'],
      ['b', 'Irene!'],
    ],
    A: [
      ['a', 'Pray for my broom, will you? It\'s been through a lot.'],
      ['b', 'May this broom fly true and land gently.'],
      ['a', 'Gently? That\'s not my style.'],
      ['b', '…May it land, at least.'],
    ],
  },
  'irene|oren': {
    C: [
      ['a', 'Your Majesty! Delivery! A Smooth Gem-shaped… no, it\'s just a rock. Sorry.'],
      ['b', 'Everybody keeps bringing me rocks.'],
      ['a', 'Want a ride instead?'],
      ['b', 'Certainly not.'],
    ],
    B: [
      ['b', 'You fly over my rivers every morning. Very loudly.'],
      ['a', 'I wave!'],
      ['b', 'I know. My Zoras wave back. It is undignified.'],
    ],
    A: [
      ['b', 'Perhaps, one morning, I might… accept a ride.'],
      ['a', 'Really?!'],
      ['b', 'A short one. Over water. Slowly.'],
      ['a', 'I\'ll get a bigger broom!'],
    ],
  },
  'impaALBW|oren': {
    C: [
      ['b', 'The Sheikah woman. You were painted next to the princess.'],
      ['a', 'And you hid in a swamp.'],
      ['b', '…We both had our reasons.'],
    ],
    B: [
      ['a', 'Your Majesty, you are royalty. If an arrow comes for you, I will take it.'],
      ['b', 'I am rather large for you to stand in front of.'],
      ['a', 'I will stand in front of the important parts.'],
    ],
    A: [
      ['b', 'You are loyal to a fault, Impa.'],
      ['a', 'It is the only fault I allow myself.'],
      ['b', 'Then I shall allow it too.'],
    ],
  },
  'irene|rosso': {
    C: [
      ['b', 'Ho! Little witch! Can your broom carry me?'],
      ['a', 'Uh. No. Definitely not.'],
      ['b', 'Ho ho! I\'ll carry YOU, then!'],
    ],
    B: [
      ['a', 'If I tie a rope to your belt, could you pull me along really fast?'],
      ['b', 'Like a cart?'],
      ['a', 'Like a ROCKET!'],
      ['b', 'Ho ho! Let\'s try it!'],
    ],
    A: [
      ['b', 'That was the most fun I\'ve had since lifting the big rock!'],
      ['a', 'We broke a fence.'],
      ['b', 'A small fence! I\'ll lift it back!'],
    ],
  },
  'impaALBW|rosso': {
    C: [
      ['b', 'Ho! The serious lady! Want to arm-wrestle?'],
      ['a', 'No.'],
      ['b', 'Scared?'],
      ['a', '…Give me your arm.'],
    ],
    B: [
      ['b', 'You won! How did you win?!'],
      ['a', 'Leverage.'],
      ['b', 'What\'s leverage?'],
      ['a', 'The reason I won.'],
    ],
    A: [
      ['a', 'You are the strongest of the Seven, Rosso.'],
      ['b', 'And you\'re the toughest, serious lady!'],
      ['a', 'Then let us stand at the front together. The others can stand behind us.'],
    ],
  },
  'impaALBW|irene': {
    C: [
      ['a', 'That broom is a hazard.'],
      ['b', 'That\'s what makes it fun!'],
      ['a', 'It is what makes it a hazard.'],
    ],
    B: [
      ['b', 'Lady Impa, have you ever flown?'],
      ['a', 'Sheikah do not fly. We leap.'],
      ['b', 'How high?'],
      ['a', '…Higher than your broom, child.'],
    ],
    A: [
      ['b', 'Race me! Your leaping against my broom!'],
      ['a', 'If I win, you fly slowly for a week.'],
      ['b', 'And if I win, you ride with me once!'],
      ['n', 'Nobody saw who won. Irene flies slowly for a week, and Impa is seen on a broom exactly once.'],
    ],
  },
};
