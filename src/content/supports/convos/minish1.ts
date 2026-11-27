// Support conversations: The Minish Cap (part 1: the pack's own pairs). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'heroOfMinish|zeldaMC': {
    C: [
      ['b', 'Link! You promised to take me to the festival stalls before the tournament. You promised.'],
      ['a', 'I had a sword to deliver.'],
      ['b', 'You always have a sword to deliver. Come on — there\'s a man selling Picori masks with real feathers.'],
      ['n', 'Zelda drags him off by the sleeve. Ezlo mutters something about priorities from the top of Link\'s head.'],
    ],
    B: [
      ['b', 'When I was stone, I could still hear. Not much. Footsteps. Someone humming the festival song.'],
      ['a', '…That was me. In the throne room.'],
      ['b', 'I thought so. You hum flat.'],
      ['a', 'Ezlo says the same thing.'],
    ],
    A: [
      ['b', 'Everyone keeps telling me the Light Force is inside me. I don\'t feel any different.'],
      ['a', 'You were always the one who found the way out. When we were little. Every time.'],
      ['b', 'That was luck.'],
      ['a', 'Then you\'re very lucky, and I\'m staying close.'],
    ],
    S: [
      ['n', 'The festival is over. The stalls are packed away, and the square is quiet.'],
      ['b', 'Next year, no swords to deliver. No sorcerers. Just the festival.'],
      ['a', 'Just the festival.'],
      ['b', 'And you\'ll actually take me to see the masks this time?'],
      ['a', 'I\'ll buy you the one with the real feathers.'],
      ['n', 'Zelda laughs, and takes his hand, and doesn\'t let go all the way home.'],
    ],
  },
  'ezloMinish|heroOfMinish': {
    C: [
      ['a', 'Stop slouching. A hat has standards, you know. I will not be worn by a slouch.'],
      ['b', 'You\'re a hat. You don\'t get a say.'],
      ['a', 'I am a Minish sage of great learning who happens to be, temporarily, a hat. Shoulders back.'],
    ],
    B: [
      ['b', 'Does it hurt? Being stuck as a cap?'],
      ['a', '…Nobody has asked me that in a very long time.'],
      ['a', 'It itches. Constantly. And I can\'t scratch, because I have no hands. There. Satisfied?'],
      ['b', 'I\'ll scratch for you. Just tell me where.'],
      ['a', 'The brim. Left side. Ah — yes. Hmph. Thank you.'],
    ],
    A: [
      ['a', 'I made the Minish Cap to grant wishes. I gave it to my apprentice to show him what magic could do. He wished for power.'],
      ['b', 'That\'s not your fault.'],
      ['a', 'Isn\'t it? I taught him. I trusted him.'],
      ['b', 'You trusted me, too. That worked out.'],
      ['a', 'So far, boy. So far.'],
    ],
    S: [
      ['n', 'The curse is lifted. Ezlo stands on the grass in his true shape, no taller than a thimble.'],
      ['a', 'Well. That\'s that, then. You won\'t need a talking hat any more.'],
      ['b', 'I\'ll miss the talking.'],
      ['a', '…You will?'],
      ['b', 'Who else is going to tell me to stand up straight?'],
      ['a', 'Hmph. Bend down, then. I have a gift for you, and you are, as ever, much too tall.'],
    ],
  },
  'heroOfMinish|smith': {
    C: [
      ['b', 'You held that sword like a pitchfork out there. I didn\'t forge it to toss hay.'],
      ['a', 'It worked.'],
      ['b', 'Everything works once. Grip, boy. From the wrist.'],
    ],
    B: [
      ['b', 'When your parents left you with me, you were so small you slept in the coal scuttle. Warmest place in the house.'],
      ['a', 'You never told me that.'],
      ['b', 'You never asked. Too busy running off into the woods after things nobody else could see.'],
      ['a', 'The Minish are real, Grandpa.'],
      ['b', 'I know. I\'ve been leaving them bread crusts on the anvil for forty years.'],
    ],
    A: [
      ['b', 'The sword I made for the festival was meant to sit on a cushion for a hundred years. Look at it now. Chipped and blooded.'],
      ['a', 'I\'m sorry.'],
      ['b', 'Sorry? It\'s the proudest I\'ve ever been of a blade. It\'s finally doing what swords are for.'],
    ],
    S: [
      ['n', 'Smith hands Link a small, plain knife, freshly made.'],
      ['b', 'Your first sword was a stick, and your second was mine. This one\'s for you. Not for festivals or sorcerers. For you.'],
      ['a', 'It\'s perfect.'],
      ['b', 'It\'s not. Nothing is. But I made it with everything I know, and that\'s all a smith can give.'],
      ['a', 'Then it\'s perfect.'],
    ],
  },
  'heroOfMinish|melari': {
    C: [
      ['b', 'You! Big one! Stop swinging that blade at rocks. Do you know what that does to the edge? Do you?'],
      ['a', 'Sorry.'],
      ['b', 'Sorry doesn\'t hone a blade. Give it here. No — the whole thing, I\'m not climbing you.'],
    ],
    B: [
      ['a', 'How do you work steel when you\'re so small?'],
      ['b', 'Small hammers. Small taps. A thousand of them, each one exactly right. You big folk hit once and hope.'],
      ['a', 'Grandpa says the same thing about patience.'],
      ['b', 'Then your grandfather is the only sensible giant I\'ve ever heard of.'],
    ],
    A: [
      ['b', 'When the Picori Blade came to my forge in pieces, I wept. A Minish blade, broken by a Minish sorcerer.'],
      ['a', 'You made it whole again.'],
      ['b', 'I made it a White Sword. You and the Elements will have to do the rest. Don\'t you dare break it twice.'],
    ],
  },
  'heroOfMinish|swiftblade': {
    C: [
      ['b', 'You found one of my Tiger Scrolls! Then you are ready to learn. Draw.'],
      ['a', 'Right now?'],
      ['b', 'A swordsman is always ready "right now." That is the first lesson. You have failed it. Draw again.'],
    ],
    B: [
      ['b', 'Your Spin Attack is fast, but your feet stay rooted. The blade circles; you must circle with it.'],
      ['a', 'I keep getting dizzy.'],
      ['b', 'Everyone gets dizzy. Masters simply decide not to fall over.'],
    ],
    A: [
      ['b', 'My brothers and I learned from the scrolls of the First. Now you learn from us. That is how a technique stays alive.'],
      ['a', 'Who teaches you?'],
      ['b', 'The students do. Every one of them swings differently. Every one of them shows me something I missed.'],
    ],
    S: [
      ['b', 'I have nothing left to teach you. Every technique of the Blade Brothers, you know.'],
      ['a', 'There must be something.'],
      ['b', 'One thing. Come back, sometimes. Teach the children who find the scrolls after you. A dojo dies without its students.'],
      ['a', 'I\'ll come back.'],
      ['b', 'Then the school of the First is in good hands.'],
    ],
  },
  'festari|heroOfMinish': {
    C: [
      ['a', 'Psst! Up here! No — down here! Under the leaf! You\'re standing on my front door.'],
      ['b', 'Sorry!'],
      ['a', 'It\'s fine. It\'s a very sturdy leaf. Want to see a short cut?'],
    ],
    B: [
      ['a', 'Most big folk can\'t see us at all. You\'re the first one in ages who waves back.'],
      ['b', 'Why can\'t they see you?'],
      ['a', 'Gentari says only children can. You\'re a bit tall for a child. Maybe you just never grew up properly.'],
      ['b', 'Grandpa would agree.'],
    ],
    A: [
      ['a', 'I mapped every path in the woods for you. Roots, rabbit holes, the dry route over the pond.'],
      ['b', 'That must have taken weeks.'],
      ['a', 'Days. Minish days are very long when your legs are this short. But it was worth it.'],
    ],
  },
  'kingDaltus|zeldaMC': {
    C: [
      ['a', 'Zelda! My dear girl! Are you warm enough? Have you eaten? Shall I have the cooks make a pie?'],
      ['b', 'Father, we\'re in the middle of a battle.'],
      ['a', 'All the more reason for pie!'],
    ],
    B: [
      ['a', 'I don\'t remember much of the time Vaati had me. Only that I said terrible things, and you were stone, and I didn\'t weep for you.'],
      ['b', 'That wasn\'t you.'],
      ['a', 'It was my mouth. My crown. A king ought to be stronger than a spell.'],
      ['b', 'A king ought to forgive himself, too.'],
    ],
    A: [
      ['b', 'You\'ve never let me lead anything. Not even the festival parade.'],
      ['a', 'You\'re the heir to Hyrule. If anything happened to you—'],
      ['b', 'Something already did. And I came back. Let me lead the vanguard tomorrow.'],
      ['a', '…Your mother would have said the same thing. Very well.'],
    ],
    S: [
      ['a', 'I watched you on the field today. Every soldier followed you without a word.'],
      ['b', 'They were following the Light Force.'],
      ['a', 'They were following my daughter. Someday this kingdom will be yours, and I find I am not afraid of that at all.'],
      ['b', 'Not yet, Father. You\'ve still got festivals to ruin with pie.'],
    ],
  },
  'vaatiHylian|zeldaMC': {
    C: [
      ['b', 'You turned me to stone.'],
      ['a', 'And here you are, walking about. Stone was never going to hold the Light Force forever. A pity.'],
      ['b', 'Why are you even here?'],
      ['a', 'The same reason as you, princess. Something worse than me is out there.'],
    ],
    B: [
      ['a', 'Do you know what it is like, to be small? To be stepped over? To be the smallest of a small people?'],
      ['b', 'I know what it\'s like to be a statue in a garden while people walk past.'],
      ['a', '…Touché.'],
    ],
    A: [
      ['b', 'You\'re not sorry. I can tell.'],
      ['a', 'I am sorry I lost. Sorry I hurt you? I would like to be. I am trying the feeling on, like a hat. It does not fit yet.'],
      ['b', 'Keep wearing it. Hats stretch.'],
    ],
  },
  'ezloMinish|vaatiHylian': {
    C: [
      ['a', 'Vaati.'],
      ['b', 'Master.'],
      ['a', 'Don\'t you dare call me that. Not in that voice. Not wearing that.'],
      ['b', 'It is only a cap, Ezlo. You made it. I simply took the lesson further than you would.'],
    ],
    B: [
      ['b', 'Do you remember my first spell? A light, no brighter than a firefly. You clapped.'],
      ['a', 'I remember. You were so proud you set my beard on fire.'],
      ['b', 'You laughed then, too.'],
      ['a', 'I laughed a great deal, before.'],
    ],
    A: [
      ['a', 'I should have seen it. The way you looked at the cap. The way you asked what wishes it could grant.'],
      ['b', 'You saw it. You just thought I would grow out of it.'],
      ['a', '…Yes.'],
      ['b', 'I did not.'],
    ],
    S: [
      ['n', 'Two Minish sit on the same toadstool. Neither speaks for a long time.'],
      ['b', 'Teach me something. Something small. A light, no brighter than a firefly.'],
      ['a', 'Why?'],
      ['b', 'Because I would like to learn a spell from you once more and use it for nothing at all.'],
      ['n', 'Ezlo raises his staff. A tiny light flickers between them, and stays.'],
    ],
  },
  'ezloMinish|melari': {
    C: [
      ['b', 'Ezlo! You old fool, you\'re a HAT.'],
      ['a', 'Thank you, Melari, I hadn\'t noticed.'],
      ['b', 'Hah! I\'d make you a better hat. Iron brim. Rivets.'],
    ],
    B: [
      ['a', 'You were the only Minish who argued with me in the council. Every single time.'],
      ['b', 'You were wrong every single time.'],
      ['a', 'I was wrong about one thing. One. And it became a sorcerer.'],
      ['b', 'Aye. Well. That one I didn\'t argue about. Should have.'],
    ],
    A: [
      ['b', 'Here. I forged you a staff. Mountain oak, mithril cap. For when you\'ve got hands again.'],
      ['a', 'Melari… I don\'t know what to say.'],
      ['b', 'Say "thank you, Melari, you\'re the finest smith of any size." I\'ll wait.'],
    ],
    S: [
      ['a', 'When this is over, the Mountain Minish should come down to the woods for the festival. All of them.'],
      ['b', 'And what would we do at a festival? Dance?'],
      ['a', 'Argue with me, of course. In public. As tradition demands.'],
      ['b', '…Aye. I\'d like that. Don\'t tell anyone.'],
    ],
  },
  'ezloMinish|gentari': {
    C: [
      ['b', 'So the legend comes true. A Hylian child, a Minish sage, and a blade made whole.'],
      ['a', 'The legend left out the part where the sage is a hat, Gentari.'],
      ['b', 'Legends are kind. They leave out the embarrassing parts.'],
    ],
    B: [
      ['a', 'You knew Vaati, as a boy. Did you see anything?'],
      ['b', 'I saw a bright child who asked "why" too often and "should I" too rarely. I saw it in you, too, once.'],
      ['a', 'In me?'],
      ['b', 'You asked "should I" eventually. That is the difference between a sage and a sorcerer.'],
    ],
    A: [
      ['b', 'The villagers are afraid of the big folk again. They remember what Vaati did.'],
      ['a', 'Then let them see the boy. Let them see what a Hylian does with a Minish blade.'],
      ['b', 'You trust him a great deal.'],
      ['a', 'He scratches my brim when it itches. A man like that can be trusted with anything.'],
    ],
    S: [
      ['b', 'I am old, Ezlo. When I am gone, the village will need an elder.'],
      ['a', 'You can\'t mean me. I made the cap. I made the sorcerer.'],
      ['b', 'You also made it right. That is the only lesson worth teaching. Stay, when this is done.'],
      ['a', '…I\'ll think about it. Now stop talking like that, you\'ll outlive us all.'],
    ],
  },
  'ezloMinish|librari': {
    C: [
      ['b', 'Ezlo! I have every book you ever wrote. Even the one about mushroom-based levitation.'],
      ['a', 'That one was a mistake.'],
      ['b', 'Page forty-two is excellent, though.'],
    ],
    B: [
      ['b', 'There\'s a book in the castle library about the Minish Cap. Written by a Hylian. It\'s all wrong.'],
      ['a', 'Of course it\'s wrong. Hylians can\'t even see us.'],
      ['b', 'I\'ve been correcting it in the margins. Very small handwriting.'],
    ],
    A: [
      ['a', 'You hid in the library the whole time Vaati ruled?'],
      ['b', 'I read. Every scroll on wind magic, every page on curses. I was looking for a way to free you.'],
      ['a', '…You found one?'],
      ['b', 'I found the boy. That counts.'],
    ],
  },
  'melari|smith': {
    C: [
      ['b', 'Huh. There\'s a tiny fellow on my anvil telling me my quench is too hot.'],
      ['a', 'It IS too hot, you great lump.'],
      ['b', 'Forty years I\'ve been leaving crusts out for you lot, and this is the thanks.'],
    ],
    B: [
      ['a', 'Your folding is good. Better than good. Where did you learn?'],
      ['b', 'My father, and his. And — I always thought — some help from somebody small, now and then.'],
      ['a', 'Hah. My grandfather used to visit a Hylian forge. Said the fellow made the best bread crusts in Hyrule.'],
    ],
    A: [
      ['b', 'The Picori Blade. You reforged it?'],
      ['a', 'You made the festival sword. Same bones, those two. Same idea of what a blade should be.'],
      ['b', 'Then we\'ve been working on the same sword for a hundred years, you and I.'],
    ],
    S: [
      ['n', 'Smith and Melari stand over the same anvil — one full-sized, one the size of a thumb on its edge.'],
      ['a', 'Together, then. You strike, I guide.'],
      ['b', 'Ready.'],
      ['n', 'The blade they make that night is nothing special to look at. Both of them keep it on the wall for the rest of their lives.'],
    ],
  },
  'festari|gentari': {
    C: [
      ['b', 'Festari. You were supposed to be back by sundown.'],
      ['a', 'I was! A Minish sundown. The shadow of a mushroom.'],
      ['b', 'That is not how sundown works.'],
    ],
    B: [
      ['a', 'Why do you never leave the village, Elder?'],
      ['b', 'Someone must be here when the young ones come home with their stories.'],
      ['a', 'Even the made-up ones?'],
      ['b', 'Especially those.'],
    ],
    A: [
      ['b', 'You led the hero through the woods. Every path. I am proud of you.'],
      ['a', 'I got us lost twice.'],
      ['b', 'And found us twice. That is what a guide is.'],
    ],
    S: [
      ['b', 'When I am gone, the village will need someone who knows every path.'],
      ['a', 'Don\'t say that.'],
      ['b', 'I will say it once and then never again. You are ready, Festari. Now go, before the mushroom shadow moves.'],
    ],
  },
  'gentari|librari': {
    C: [
      ['b', 'Gentari, the forest Minish still write with leaf ink? It fades in a year.'],
      ['a', 'So does most of what\'s worth writing, Librari.'],
      ['b', 'That\'s the saddest thing I\'ve ever heard. I\'m giving you proper ink.'],
    ],
    B: [
      ['a', 'You keep the town Minish\'s histories. I keep the forest\'s. We have never once compared.'],
      ['b', 'I assumed yours were all about acorns.'],
      ['a', 'Mostly. Some are about you.'],
      ['b', '…What do they say?'],
    ],
    A: [
      ['b', 'Our stories don\'t agree about the first Picori Blade. Yours says it was forged in the woods. Mine says the town.'],
      ['a', 'Perhaps both. Perhaps the blade was carried from one to the other.'],
      ['b', 'That\'s not in either book.'],
      ['a', 'Then we shall write a third.'],
    ],
    S: [
      ['n', 'Two elders sit over one enormous (to them) open book.'],
      ['b', 'Chapter one: The Minish of the Woods and the Town, Together.'],
      ['a', 'A bold title.'],
      ['b', 'A true one, now.'],
    ],
  },
  'greatblade|swiftblade': {
    C: [
      ['a', 'Brother! Your sword is so thin. Do you even hit anything with it?'],
      ['b', 'Everything I aim at. Unlike you.'],
      ['a', 'I hit everything near what I aim at. It\'s more efficient.'],
    ],
    B: [
      ['b', 'Father said you\'d break every sword you touched.'],
      ['a', 'So I got a bigger sword.'],
      ['b', '…That\'s not what he meant.'],
      ['a', 'It worked though!'],
    ],
    A: [
      ['a', 'You always took the scrolls first. You got the clever techniques. I got Rock Breaker.'],
      ['b', 'I took the scrolls first because you were too busy breaking rocks to read.'],
      ['a', 'Rock Breaker is a perfectly good technique!'],
      ['b', 'It is. It\'s yours. I could never do it the way you do.'],
    ],
    S: [
      ['b', 'Spar with me. No techniques. Just the two of us, like when we were boys.'],
      ['a', 'You always won.'],
      ['b', 'I always won because I was faster. Today I want to see if you\'re stronger.'],
      ['n', 'The spar lasts an hour. Neither wins. Both of them are grinning at the end.'],
    ],
  },
  'grimblade|swiftblade': {
    C: [
      ['b', 'You could smile, brother. Once a year. For the students.'],
      ['a', 'My students learn Peril Beam. Nobody smiles at Peril Beam.'],
    ],
    B: [
      ['a', 'Do you know why I teach the techniques for when you\'re nearly dead?'],
      ['b', 'You enjoy being gloomy.'],
      ['a', 'Because that is when people give up. I want them to know there\'s one more thing they can do.'],
      ['b', '…That\'s not gloomy at all, brother.'],
    ],
    A: [
      ['b', 'You moved your dojo out by the graveyard. Mother hated it.'],
      ['a', 'It\'s quiet. And the Royal Valley is where the First is buried. Someone should be near him.'],
      ['b', 'You visit him.'],
      ['a', 'Every week. He doesn\'t talk much. Neither do I.'],
    ],
    S: [
      ['a', 'If I fall — and I nearly do, often, that\'s the technique — keep my dojo open.'],
      ['b', 'You won\'t fall.'],
      ['a', 'Promise anyway.'],
      ['b', 'I promise. And you promise to smile once a year.'],
      ['a', '…Fine. Once.'],
    ],
  },
  'swiftblade|swiftbladeFirst': {
    C: [
      ['b', 'So. You are the one who runs my school now. Show me your stance.'],
      ['a', 'Founder! It\'s an honour—'],
      ['b', 'Stance, not speeches. Hm. Your back foot. Like a crane on ice.'],
    ],
    B: [
      ['a', 'Why did you wait in the crypt all these years?'],
      ['b', 'Because the Great Spin was never written down. A technique that lives only in a dead man must find a living one.'],
      ['a', 'Then teach me.'],
      ['b', 'I am. You are simply not listening yet.'],
    ],
    A: [
      ['b', 'You and your brothers each took one part of my teaching. Speed, strength, and peril.'],
      ['a', 'We argued about which part mattered most.'],
      ['b', 'They were never parts. They were one thing. You will have to teach each other to find it.'],
    ],
    S: [
      ['b', 'The Great Spin. You have it now. Feel how the blade carries you?'],
      ['a', 'I feel… dizzy.'],
      ['b', 'Good. Masters get dizzy. Masters decide not to fall.'],
      ['a', 'That\'s what I tell my students!'],
      ['b', 'Where do you think you heard it?'],
    ],
  },
  'kingDaltus|potho': {
    C: [
      ['b', 'Your Majesty, the quartermaster requires your seal on seventeen requisitions.'],
      ['a', 'Seventeen? In the middle of a war?'],
      ['b', 'Especially in the middle of a war, Your Majesty.'],
    ],
    B: [
      ['a', 'Potho, when Vaati had me, did I… did I say anything to you?'],
      ['b', 'You ordered me to have the castle painted black. And the cook dismissed.'],
      ['a', 'Oh, dear.'],
      ['b', 'I filed the orders, Your Majesty. Under "pending." Indefinitely.'],
    ],
    A: [
      ['a', 'You kept the kingdom running while I was enchanted, didn\'t you?'],
      ['b', 'Someone had to sign the grain shipments, sire.'],
      ['a', 'You never said a word.'],
      ['b', 'It is not the minister\'s place to be thanked. Only to be right.'],
    ],
    S: [
      ['a', 'I\'ve had a medal made. For extraordinary service to the crown.'],
      ['b', 'Your Majesty, that requires approval of the royal council, the treasury, and—'],
      ['a', 'I\'ve already filed the forms, Potho. All seventeen.'],
      ['n', 'For the first time anyone can remember, the minister has nothing to say.'],
    ],
  },
  'ezloMinish|gregal': {
    C: [
      ['b', 'A Minish sage riding a Hylian\'s head. The Wind Tribe would write a song about this.'],
      ['a', 'Please don\'t.'],
      ['b', 'Too late, I\'ve thought of a chorus.'],
    ],
    B: [
      ['a', 'Vaati learned wind magic from somewhere. Not from me.'],
      ['b', 'From us. From the books of the Wind Tribe, stolen from the Palace long ago.'],
      ['a', 'Then we both lost something to him.'],
    ],
    A: [
      ['b', 'When this is done, come up to the clouds. The air is thin, but the view is good, and we could use a sage.'],
      ['a', 'I\'m afraid of heights.'],
      ['b', 'You are four inches tall. Everything is a height.'],
      ['a', '…Fair point.'],
    ],
  },
  'gyorgFemale|gyorgMale': {
    C: [
      ['n', 'The great red Gyorg glides low over the camp. The blue one circles her, never more than a wingbeat away.'],
      ['b', '(The male clicks, sharply, at a soldier who comes too close.)'],
      ['a', '(The female hums, low, and he settles.)'],
    ],
    B: [
      ['n', 'Arrows hiss up from the enemy line toward the Female Gyorg.'],
      ['b', '(The male drops into their path, taking two in the fin.)'],
      ['a', '(Later, she curls her vast wing over him while he rests.)'],
    ],
    A: [
      ['n', 'A group of Minish clamber onto the Female Gyorg\'s back. She allows it, rippling gently.'],
      ['b', '(The male watches the tiny riders with deep suspicion.)'],
      ['a', '(She tilts, so the smallest one can see the clouds. The male, grudgingly, lets them be.)'],
    ],
    S: [
      ['n', 'At dusk, above the Palace of Winds, two shapes fly together: one vast and red, one small and blue.'],
      ['a', '(She calls, a long, low note that carries across the sky.)'],
      ['b', '(He answers. They turn as one, and vanish into the clouds.)'],
    ],
  },
};
