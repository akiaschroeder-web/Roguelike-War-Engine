// Support conversations: A Link Between Worlds (part 1: Hyrule and Lorule's own). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'linkALBW|zeldaALBW': {
    C: [
      ['b', 'You were asleep at the forge the morning Yuga came, weren\'t you? The captain told me.'],
      ['a', '…The smith said I could have five more minutes.'],
      ['b', 'Five more minutes. And then you saved a kingdom. I\'ll take that trade.'],
    ],
    B: [
      ['b', 'When I was a painting, I could still hear. I heard you walk into the throne room.'],
      ['a', 'You could hear me?'],
      ['b', 'You tripped on the carpet. Twice.'],
    ],
    A: [
      ['b', 'The Pendant of Courage chose you before I did. I only sent it.'],
      ['a', 'I\'d have come anyway.'],
      ['b', 'I know. That is why the Pendant chose you.'],
    ],
    S: [
      ['n', 'On the castle wall at dusk, Hyrule on one side and the crack to Lorule glowing on the other.'],
      ['b', 'Two kingdoms, two princesses, two Triforces. Only one of you.'],
      ['a', 'Then I\'ll stay on this side of the wall.'],
      ['b', 'Stay where I can see you. Not as a painting.'],
    ],
  },
  'linkALBW|ravio': {
    C: [
      ['b', 'Oh! You\'re awake! I\'ve moved into your house. Rent is free — for me. Tools are not — for you.'],
      ['a', 'That\'s my bed.'],
      ['b', 'It\'s a very good bed. Sheerow agrees.'],
    ],
    B: [
      ['b', 'You rented the Hookshot, broke a Rupee Like and came home in one piece. My best customer!'],
      ['a', 'Your only customer.'],
      ['b', 'Best AND only. That\'s a monopoly. Very good for business.'],
    ],
    A: [
      ['b', 'Can I tell you something? I came to Hyrule because I was too scared to stand up to Yuga in Lorule.'],
      ['a', 'You stood up to him today.'],
      ['b', 'I stood behind YOU today. It\'s a start.'],
    ],
    S: [
      ['b', 'When this is over, I suppose I\'ll have to move out of your house.'],
      ['a', 'You could stay.'],
      ['b', '…Do you mean that? Even with Sheerow?'],
      ['a', 'Especially with Sheerow. He found my lost sword.'],
      ['b', 'Then the rent stays free. For both of us.'],
    ],
  },
  'hilda|linkALBW': {
    C: [
      ['a', 'You are the Hero of Hyrule. I have read every account of your bloodline.'],
      ['b', 'Every one?'],
      ['a', 'Lorule has very little to do these days except read.'],
    ],
    B: [
      ['a', 'You walk through walls as if a painting were nothing. In Lorule, Yuga made paintings into prisons.'],
      ['b', 'It\'s Ravio\'s bracelet. It feels like holding your breath.'],
      ['a', 'Then I have been holding my breath for my whole reign.'],
    ],
    A: [
      ['a', 'I wanted your Triforce. I still wish Lorule had one.'],
      ['b', 'Then let\'s find a way that doesn\'t steal one.'],
      ['a', 'You make it sound easy, hero.'],
      ['b', 'I didn\'t say easy.'],
    ],
  },
  'gramps|linkALBW': {
    C: [
      ['a', 'Your guard is low. Your feet are wrong. Your grip is… actually not bad.'],
      ['b', 'Thanks?'],
      ['a', 'Don\'t thank me. Spar with me. Every morning.'],
    ],
    B: [
      ['a', 'I fought a boy in green once, long ago. A hero, with a blade like yours.'],
      ['b', 'Who won?'],
      ['a', 'My knees did. Eventually. Again!'],
    ],
    A: [
      ['b', 'You\'ve never once used your cane to walk.'],
      ['a', 'Of course not. It\'s a practice sword.'],
      ['b', 'Then why carry it?'],
      ['a', 'So nobody expects me to be good. Hah!'],
    ],
    S: [
      ['a', 'Today you beat me fair. No tricks, no walls.'],
      ['b', 'You let me.'],
      ['a', 'I\'m old, boy, not generous. You won.'],
      ['n', 'Gramps lays his sword across the hero\'s hands.'],
      ['a', 'Take this when I\'m done with it. Not before.'],
    ],
  },
  'gulley|linkALBW': {
    C: [
      ['a', 'You\'re the one my dad keeps yelling at for oversleeping!'],
      ['b', 'Your dad yells at everybody.'],
      ['a', 'He yells at YOU the most. I counted.'],
    ],
    B: [
      ['a', 'When I was a painting I couldn\'t move at all. Not even my nose. Is that what it\'s like in the walls?'],
      ['b', 'No. In the walls you can move. You just can\'t touch anything.'],
      ['a', 'That sounds worse!'],
    ],
    A: [
      ['a', 'I\'m a Sage! Like the old stories! Do you think I\'ll get a hat?'],
      ['b', 'You already have a hat.'],
      ['a', 'A SAGE hat. A taller one.'],
    ],
    S: [
      ['a', 'When I grow up I want to be a blacksmith like Dad AND a hero like you.'],
      ['b', 'I was a blacksmith first.'],
      ['a', 'Really? Then I\'m halfway there!'],
      ['b', 'You\'re more than halfway. You saved Lorule too.'],
    ],
  },
  'irene|linkALBW': {
    C: [
      ['a', 'Ring my bell and I\'ll pick you up anywhere in Hyrule! Ten Rupees. Hero discount!'],
      ['b', 'What\'s the normal price?'],
      ['a', 'Ten Rupees.'],
    ],
    B: [
      ['a', 'Grandma flew across the whole kingdom on this broom. Now it\'s mine and I\'m going to fly further.'],
      ['b', 'Into Lorule?'],
      ['a', 'Into everywhere!'],
    ],
    A: [
      ['a', 'I\'m sorry I was a painting for so long. I missed so many deliveries.'],
      ['b', 'Everyone walked. It was terrible.'],
      ['a', 'Ha! Hold on tight — we\'re making up for lost time.'],
    ],
  },
  'linkALBW|thiefGirl': {
    C: [
      ['b', 'You\'ve got the look of a mark. Wide eyes. Full wallet.'],
      ['a', 'My wallet is empty. Ravio.'],
      ['b', '…Oh. You poor thing.'],
    ],
    B: [
      ['b', 'Every trap in the Hideout? I set half of them myself.'],
      ['a', 'Which half?'],
      ['b', 'The half that didn\'t get you. You\'re welcome.'],
    ],
    A: [
      ['b', 'Turns out I\'m a Sage. A thief Sage. That\'s got to be a first.'],
      ['a', 'It suits you.'],
      ['b', 'Careful, hero. Say nice things and I\'ll stop picking your pockets.'],
    ],
  },
  'linkALBW|osfala': {
    C: [
      ['b', 'I am Osfala, apprentice to the great Sahasrahla, and I will be the one to save Hyrule.'],
      ['a', 'Okay.'],
      ['b', '…You\'re supposed to argue.'],
    ],
    B: [
      ['b', 'I went into the Desert Palace to prove I was the hero. Zaganaga nearly ate me.'],
      ['a', 'It nearly ate me too.'],
      ['b', 'Truly? Then perhaps neither of us is the hero, and it\'s simply a very hungry plant.'],
    ],
    A: [
      ['b', 'Grandfather says a Sage\'s confidence is a lamp, not a sword. I think I finally understand.'],
      ['a', 'What does it mean?'],
      ['b', 'I have absolutely no idea. But I feel wiser.'],
    ],
  },
  'linkALBW|rosso': {
    C: [
      ['b', 'Ho! Little fellow! Can you lift this rock?'],
      ['a', 'With the Power Glove.'],
      ['b', 'With your ARMS, little fellow!'],
    ],
    B: [
      ['b', 'I lifted every rock on Death Mountain once. Just to see what was under them.'],
      ['a', 'What was under them?'],
      ['b', 'More rocks! Wonderful!'],
    ],
    A: [
      ['b', 'Being a painting was the worst. You can\'t lift a painting. It has no weight at all.'],
      ['a', 'You\'re heavy again now.'],
      ['b', 'Ha ha! Yes! Thank you, little fellow!'],
    ],
  },
  'hilda|zeldaALBW': {
    C: [
      ['b', 'You have my face. Or I have yours.'],
      ['a', 'We are reflections, Princess. Your kingdom has a Triforce. Mine has a hole where one was.'],
      ['b', 'Then we will talk. Not paint.'],
    ],
    B: [
      ['a', 'My ancestors destroyed the Triforce of Lorule to stop the wars over it. The world began to fall apart soon after.'],
      ['b', 'And you thought taking ours would hold it together.'],
      ['a', 'I thought I had no other choice. I was wrong about the choice, not about the falling.'],
    ],
    A: [
      ['b', 'If both Triforces are wished on together, perhaps—'],
      ['a', '—perhaps Lorule\'s returns. You have thought of this too.'],
      ['b', 'Every night since Yuga painted me.'],
    ],
    S: [
      ['n', 'Two princesses stand before two Triforces at the end of the world.'],
      ['a', 'I came to take yours, Zelda.'],
      ['b', 'And I came to give you one. Wish with me.'],
      ['a', '…For both our kingdoms. Sister.'],
    ],
  },
  'impaALBW|zeldaALBW': {
    C: [
      ['a', 'Princess, you will not walk into the throne room ahead of me again.'],
      ['b', 'Impa, I was painted in my own throne room. Walking second did not help.'],
      ['a', 'Then I will walk BESIDE you.'],
    ],
    B: [
      ['b', 'You were painted beside me. I could see you out of the corner of the frame.'],
      ['a', 'I was trying to reach you. For days.'],
      ['b', 'I know. You never stopped trying.'],
    ],
    A: [
      ['a', 'My family has guarded yours since before Hyrule had a castle.'],
      ['b', 'Then let me guard you for once.'],
      ['a', '…That is not how it works, Princess.'],
      ['b', 'It is today.'],
    ],
    S: [
      ['b', 'When I am queen, I want you at my side. Not behind me.'],
      ['a', 'I am a Sheikah. We stand in the shadow of the throne.'],
      ['b', 'Then I\'ll move the throne into the light.'],
      ['a', '…As you command. Beside you.'],
    ],
  },
  'seres|zeldaALBW': {
    C: [
      ['a', 'Princess! I prayed for you every day in the Sanctuary.'],
      ['b', 'And I for you, Seres. We were both paintings by the end.'],
      ['a', 'Then the prayers must have been heard by someone in a frame.'],
    ],
    B: [
      ['a', 'Father says the Sanctuary\'s light comes from the Sacred Realm. I think it comes from people who don\'t give up.'],
      ['b', 'That sounds like a prayer of its own.'],
      ['a', 'I\'m writing it in my book!'],
    ],
    A: [
      ['b', 'Will you teach me the Sanctuary\'s healing prayers?'],
      ['a', 'You already know them, Princess. Your magic is full of them.'],
      ['b', 'Then teach me how to say them as kindly as you.'],
    ],
    S: [
      ['a', 'I was the first Sage Yuga took. I thought I\'d be the last one anyone remembered.'],
      ['b', 'Seres, you were the first one I asked about when I woke.'],
      ['a', '…Truly?'],
      ['b', 'Truly. The Sanctuary is not the Sanctuary without you.'],
    ],
  },
  'hilda|ravio': {
    C: [
      ['a', 'You. Rabbit. You ran.'],
      ['b', 'I ran to Hyrule to find someone braver than me, Your Highness.'],
      ['a', 'And did you?'],
      ['b', 'He\'s asleep in his own bed. Mine, technically.'],
    ],
    B: [
      ['b', 'I could never say it in Lorule. I thought you were wrong to bring Yuga in.'],
      ['a', 'I know. I saw it in your face. Your hood.'],
      ['b', 'You could tell through the hood?'],
      ['a', 'The ears droop.'],
    ],
    A: [
      ['a', 'You knew what I was going to do. You could have stopped me.'],
      ['b', 'I\'m a coward. I can only stop things by bringing other people.'],
      ['a', 'That is a kind of courage too, Ravio.'],
    ],
    S: [
      ['n', 'The rabbit hood comes off. Under it, a face very like the hero\'s.'],
      ['b', 'Lorule\'s hero was always supposed to be me. I hid instead.'],
      ['a', 'You hid in the right place. You found him.'],
      ['b', 'And I came back. For Lorule. For you.'],
      ['a', 'Then stay, my hero. Put the hood back on — it suits you.'],
    ],
  },
  'hilda|yuga': {
    C: [
      ['b', 'Your Highness. You look… pale. Pale is very fashionable in Lorule.'],
      ['a', 'You will speak to me as your princess, Yuga.'],
      ['b', 'Of course. My princess. My patron. My… canvas.'],
    ],
    B: [
      ['a', 'You were meant to gather the Sages for Lorule. Not for yourself.'],
      ['b', 'Ah, but art belongs to the artist, Highness.'],
      ['a', 'Lorule is not your art.'],
    ],
    A: [
      ['b', 'You still trust me. How curious.'],
      ['a', 'I do not trust you. I watch you. There is a difference.'],
      ['b', 'Then do watch carefully, Highness. I so love an audience.'],
    ],
  },
  'ravio|sheerow': {
    C: [
      ['a', 'Sheerow! The Fire Rod! Someone fell over — fetch!'],
      ['b', '(Sheerow flies off. He returns with a Fire Rod and a slightly singed sense of pride.)'],
      ['a', 'Good bird. Best bird.'],
    ],
    B: [
      ['b', '(Sheerow drops a dented sword at Ravio\'s feet.)'],
      ['a', 'That\'s not ours. That\'s… oh. That was Gulley\'s friend\'s. Bring it to the convoy, Sheerow. Gently.'],
      ['b', '(Sheerow chirps very quietly.)'],
    ],
    A: [
      ['a', 'You never ran away. Not once. Even when I did.'],
      ['b', '(Sheerow lands on the rabbit ears and refuses to move.)'],
      ['a', 'I know, I know. You\'re braver than me.'],
    ],
    S: [
      ['a', 'If anything happens to me, Sheerow, I want you to find the hero.'],
      ['b', '(Sheerow pecks his hand. Hard.)'],
      ['a', 'Ow! Fine! Nothing is going to happen to me!'],
      ['b', '(Sheerow settles in his hood, satisfied.)'],
    ],
  },
  'ravio|thiefGirl': {
    C: [
      ['b', 'Nice hood. Shame if somebody… borrowed it.'],
      ['a', 'Please don\'t. It\'s load-bearing.'],
      ['b', 'Load-bearing?'],
      ['a', 'Emotionally.'],
    ],
    B: [
      ['a', 'So you steal things, and I rent things. We\'re practically in the same trade.'],
      ['b', 'Except people give YOU money to take your stuff.'],
      ['a', 'Ha! Yes! Business!'],
    ],
    A: [
      ['b', 'You came back to Lorule. Nobody comes back to Lorule.'],
      ['a', 'You stayed in Lorule. Nobody stays in Lorule.'],
      ['b', 'Guess we\'re both a bit stupid, then.'],
      ['a', 'A bit brave, I think. Let\'s say brave.'],
    ],
  },
  'gramps|ravio': {
    C: [
      ['a', 'You. Rabbit. You hold a hammer like a tea tray.'],
      ['b', 'I\'m a merchant! I hold everything like a tea tray!'],
      ['a', 'Then today you learn to hold one thing like a weapon.'],
    ],
    B: [
      ['b', 'Could I rent your sword? Just for a battle? Very reasonable rates.'],
      ['a', 'Nobody rents this sword.'],
      ['b', 'Ah. Could I rent your knees, then?'],
      ['a', 'HAH! Nobody would.'],
    ],
    A: [
      ['a', 'You flinch before every swing. And you swing anyway. That\'s the trick, rabbit.'],
      ['b', 'Being scared?'],
      ['a', 'Swinging anyway.'],
    ],
  },
  'yuga|yugaGanon': {
    C: [
      ['a', 'Look at you. Look at ME. A masterpiece, and it moves!'],
      ['b', 'I AM YOU, FOOL. YOU ARE ADMIRING A MIRROR.'],
      ['a', 'The finest mirror in two kingdoms.'],
    ],
    B: [
      ['b', 'THE DEMON KING\'S STRENGTH. YOUR TRIFLING BRUSH. WHICH OF US IS IN CHARGE?'],
      ['a', 'The artist is always in charge of the paint.'],
      ['b', 'THE PAINT HAS OPINIONS.'],
    ],
    A: [
      ['a', 'I wanted to be beautiful. I wanted to be powerful. You were supposed to be both.'],
      ['b', 'AND?'],
      ['a', 'And you\'re loud. I hadn\'t painted you loud.'],
    ],
  },
  'oren|rosso': {
    C: [
      ['b', 'Your Majesty! I brought you a rock! A smooth one!'],
      ['a', 'That is not my Smooth Gem.'],
      ['b', 'It\'s very smooth, though!'],
    ],
    B: [
      ['a', 'You lift mountains. I command rivers. Between us, Hyrule could be rearranged entirely.'],
      ['b', 'Ho! Let\'s put a river on top of a mountain!'],
      ['a', '…That is how waterfalls happen, I suppose.'],
    ],
    A: [
      ['b', 'When we were paintings, I could see you two frames along. You looked very cross.'],
      ['a', 'I was trapped in a frame without water, Rosso. Of course I was cross.'],
      ['b', 'Next time I\'ll lift the whole wall and carry you to the lake!'],
      ['a', '…That would be acceptable.'],
    ],
  },
  'irene|osfala': {
    C: [
      ['b', 'A broom? Surely a proper sage would levitate.'],
      ['a', 'A proper sage would know a broom is faster than levitating.'],
      ['b', 'Is it?'],
      ['a', 'Want a ride?'],
    ],
    B: [
      ['b', 'Grandfather says your grandmother was the finest witch in Hyrule.'],
      ['a', 'And mine says your grandfather was the finest sage. They used to argue, apparently.'],
      ['b', 'About what?'],
      ['a', 'Brooms.'],
    ],
    A: [
      ['b', 'I was terrified up there. On the broom. I said I was taking notes.'],
      ['a', 'You were holding on to my hat.'],
      ['b', 'I was taking notes on your hat.'],
    ],
  },
  'impaALBW|seres': {
    C: [
      ['b', 'Lady Impa! Will you teach me to fight? Just a little?'],
      ['a', 'A priestess should not need to.'],
      ['b', 'A priestess got painted onto a wall, Lady Impa.'],
      ['a', '…Pick up the staff.'],
    ],
    B: [
      ['a', 'You hold your book in front of you when you\'re afraid.'],
      ['b', 'It\'s a very thick book.'],
      ['a', 'Then that is your shield. Good. Now we work on your feet.'],
    ],
    A: [
      ['b', 'Is it true the Sheikah keep the Sages\' secrets?'],
      ['a', 'Some of them. One of them is that the youngest Sage is always the strongest.'],
      ['b', 'Really?'],
      ['a', 'No. But it will be true for you, if you keep practising.'],
    ],
    S: [
      ['n', 'At the Sanctuary, the oldest and the youngest of the Seven Sages pray together.'],
      ['a', 'When I was a girl, a Sage told me I would guard the royal family.'],
      ['b', 'What did you say?'],
      ['a', 'I said I would guard everyone who needed it. Now I am telling you the same thing.'],
      ['b', 'Then I\'ll heal everyone who needs it. Including you.'],
    ],
  },
  'babyMaiamai|motherMaiamai': {
    C: [
      ['a', 'Maiamai!'],
      ['b', 'Oh, my darling! Where have you BEEN? Under a rock? Behind a waterfall? Inside a wall?!'],
      ['a', 'Maiamai…'],
      ['b', 'A WALL. Young octopus, we are going to have a talk.'],
    ],
    B: [
      ['b', 'Ninety-nine brothers and sisters, and you\'re the one who joined an army.'],
      ['a', 'Maiamai!'],
      ['b', 'I am NOT proud. Well. A little proud.'],
    ],
    A: [
      ['a', '(The Baby Maiamai climbs onto its mother\'s enormous shell and squeaks.)'],
      ['b', 'Yes, dear. Everyone is home now. Even the ones in Lorule.'],
      ['a', 'Maiamai.'],
      ['b', 'Even the one hiding in the hero\'s boot. Yes.'],
    ],
    S: [
      ['b', 'When I lost all one hundred of you, I thought I\'d never be whole again.'],
      ['a', 'Maiamai!'],
      ['b', 'And then a boy in green started bringing you home ten at a time.'],
      ['a', '(The Baby Maiamai hugs her tentacle very hard.)'],
      ['b', 'Oh, you dear. That\'s Nice. That\'s very Nice.'],
    ],
  },
};
