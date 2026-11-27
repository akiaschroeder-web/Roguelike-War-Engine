// Support conversations: Spirit Tracks (part 2: cross-pack pairs). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'heroOfSpirits|heroOfWinds': {
    C: [
      ['n', 'Two Links in green and blue stare at each other across the campfire.'],
      ['a', 'Niko says you sailed the whole Great Sea. In a boat that talked.'],
      ['b', 'He talked a lot.'],
      ['a', 'My train doesn’t talk. Thank goodness.'],
    ],
    B: [
      ['b', 'What’s it like? Driving a train?'],
      ['a', 'Loud. Hot. You can’t steer. You go where the rails go.'],
      ['b', 'The wind was like that. You go where it blows.'],
      ['a', 'Unless you have a magic baton.'],
      ['b', 'Unless you have a magic baton.'],
      ['n', 'Both of them grin at exactly the same moment.'],
    ],
    A: [
      ['b', 'Your land. It was built by my crew’s grandchildren, wasn’t it?'],
      ['a', 'That’s what the stories say. You found it, and they stayed.'],
      ['b', 'Then I’m glad it has someone looking after it.'],
      ['a', 'I’m just an engineer.'],
      ['b', 'I was just a boy from Outset. It’s how it starts.'],
    ],
    S: [
      ['a', 'If you ever want to see the whole of New Hyrule, I’ll drive you. Every line.'],
      ['b', 'And if you ever want to see the sea, I’ll sail you. Every island.'],
      ['a', 'Deal. Trains first.'],
      ['b', 'Boats first.'],
      ['a', 'We’ll flip a coin.'],
      ['n', 'They flip a Rupee. It lands on its edge in the mud. They take this as a sign to do both.'],
    ],
  },
  'heroOfLegend|heroOfSpirits': {
    C: [
      ['a', 'You carry a flute too? Mine summons a bird.'],
      ['b', 'Mine has a song for birds too!'],
      ['a', 'Does it summon a giant bird that carries you across the kingdom?'],
      ['b', '…It summons quite a lot of small ones.'],
    ],
    B: [
      ['b', 'You’ve been to two worlds, Niko says. Light and Dark.'],
      ['a', 'And a dream island. And a couple of others I try not to think about.'],
      ['b', 'I just have the one kingdom. And five realms. And a Dark Realm.'],
      ['a', 'Sounds like plenty.'],
    ],
    A: [
      ['a', 'When it all gets too big, I think about my uncle. The first one who handed me a sword.'],
      ['b', 'For me it’s Alfonzo. He handed me a wrench first.'],
      ['a', 'Better start, maybe.'],
      ['b', 'A wrench fixes things. A sword just protects the things you fixed.'],
    ],
  },
  'heroOfSpirits|heroOfTheWild': {
    C: [
      ['b', 'Is that a train? It runs on rails? You can’t take it off the rails?'],
      ['a', 'No. That’s what rails are for.'],
      ['b', 'Hm. I would put wheels and a fan on it.'],
    ],
    B: [
      ['a', 'You built a flying machine out of three planks and a stabilizer.'],
      ['b', 'It worked for almost a minute.'],
      ['a', 'That’s… actually very impressive engineering.'],
      ['b', 'Thanks. Then it exploded.'],
    ],
    A: [
      ['b', 'A hundred years asleep. When I woke up, everything I knew was ruins.'],
      ['a', 'That sounds lonely.'],
      ['b', 'It was. Then I found people again, one at a time. That’s how you rebuild, I think.'],
      ['a', 'One rail at a time.'],
      ['b', 'Yeah. Exactly that.'],
    ],
  },
  'tetra|zeldaST': {
    C: [
      ['a', 'So you’re the princess of the new kingdom. You don’t look very royal, floating around.'],
      ['b', 'You don’t look very royal either, with that cutlass.'],
      ['a', 'Ha! I like you already.'],
    ],
    B: [
      ['b', 'Is it true? You were Princess Zelda too, once?'],
      ['a', 'Apparently. I preferred being a pirate. Fewer meetings.'],
      ['b', 'I have so many meetings. Teacher schedules them by the minute.'],
      ['a', 'Then run away to sea. It worked for me.'],
    ],
    A: [
      ['a', 'You know, I founded your kingdom. Well, my crew and I did. Somewhere back there.'],
      ['b', 'So you’re my… great-great-great-something?'],
      ['a', 'Don’t make me feel old, kid.'],
      ['b', 'You don’t look a day over a hundred.'],
      ['a', 'Watch it, Princess.'],
    ],
    S: [
      ['a', 'Here. A pirate’s scarf. Every captain needs one.'],
      ['b', 'I’m not a captain.'],
      ['a', 'You command a train, a hero and a Phantom. That’s a crew if I ever saw one.'],
      ['b', 'Then you’re invited to the castle. As family. No meetings, I promise.'],
      ['a', 'I’ll bring the crew. You’ll regret it.'],
      ['b', 'I absolutely won’t.'],
    ],
  },
  'ciela|zeldaST': {
    C: [
      ['a', 'Another floating girl! Finally someone who understands.'],
      ['b', 'Understands what?'],
      ['a', 'How annoying it is when boys won’t listen to the glowing person yelling directions!'],
    ],
    B: [
      ['b', 'How do you stay so cheerful? I’m a spirit, and some days I feel so… thin.'],
      ['a', 'Courage. It’s not about being cheerful. It’s about doing the next thing anyway.'],
      ['b', 'The next thing.'],
      ['a', 'And yelling at Link while you do it. That helps a lot.'],
    ],
    A: [
      ['a', 'I forgot who I was, once. Completely. I thought I was just a fairy.'],
      ['b', 'I forgot what my own body felt like.'],
      ['a', 'But you didn’t forget who you were.'],
      ['b', 'No. Being without my body made me remember harder.'],
    ],
    S: [
      ['a', 'When you get your body back, promise you won’t stop being the brave ghost girl.'],
      ['b', 'I promise. Will you visit the castle?'],
      ['a', 'Only if you leave a window open. Fairies don’t do doors.'],
      ['b', 'I’ll leave every window open.'],
    ],
  },
  'midnaImp|zeldaST': {
    C: [
      ['a', 'Hee hee. A princess without a body? Welcome to the club.'],
      ['b', 'You too?'],
      ['a', 'Cursed into this cute little shape. Yours is see-through. Mine has a big head.'],
    ],
    B: [
      ['b', 'Does it get easier? Not being yourself?'],
      ['a', 'No. But you get better at it. You learn to use what you are now.'],
      ['b', 'I possess Phantoms now. I used to be afraid of them.'],
      ['a', 'See? Look at you. Terrifying.'],
    ],
    A: [
      ['a', 'I had a Zelda once. Another one. She gave me everything to save me.'],
      ['b', 'That sounds like something a Zelda would do.'],
      ['a', 'It annoyed me. I wanted to be the one saving her.'],
      ['b', 'Maybe this time you can.'],
    ],
    S: [
      ['a', 'Listen, Princess. When you get your body back, don’t let anyone take it again. Promise me.'],
      ['b', 'I promise. And you—when you get your true shape back, come to New Hyrule.'],
      ['a', 'A Twili queen in a kingdom of trains? They’ll faint.'],
      ['b', 'Let them. I’ll be standing right next to you.'],
    ],
  },
  'fi|zeldaST': {
    C: [
      ['a', 'Princess. I calculate a 78% probability that you are about to float into a wall.'],
      ['b', 'I go through walls, Fi.'],
      ['a', 'Recalculating. Probability: 0%. My apologies.'],
    ],
    B: [
      ['b', 'Do you ever want to be something other than a sword?'],
      ['a', 'I was made for a purpose. When the purpose ends, I rest.'],
      ['b', 'That sounds sad.'],
      ['a', 'I detect no sadness in my parameters. …I detect some curiosity about your question.'],
    ],
    A: [
      ['a', 'You were born with the goddess’s light, as was my first master’s companion.'],
      ['b', 'Is it a burden or a gift?'],
      ['a', 'Both, at a ratio that changes daily. Today I estimate it is mostly a gift.'],
      ['b', 'I’ll take today, then.'],
    ],
  },
  'nayru|zeldaST': {
    C: [
      ['a', 'You were possessed too? Oh, you poor thing. I know just how it feels.'],
      ['b', 'You do?'],
      ['a', 'A sorceress wore me like a dress for half an era. Ghastly.'],
    ],
    B: [
      ['b', 'How did you stop feeling like someone else was in there?'],
      ['a', 'I sang. Every day. Songs only I knew. It reminded me which voice was mine.'],
      ['b', 'I can try that.'],
      ['a', 'Start with a happy one. They chase out shadows faster.'],
    ],
    A: [
      ['a', 'Your Lokomo friends sing to hold the world together. I sing to move it through time.'],
      ['b', 'Maybe we could sing together sometime.'],
      ['a', 'I would like that very much. Duets are the best kind of magic.'],
    ],
  },
  'elderNiko|niko': {
    C: [
      ['b', 'Who’s this old guy with my face?'],
      ['a', 'Ah, me! I’d forgotten how short I was!'],
      ['b', 'I’m not short! I’m… compact!'],
    ],
    B: [
      ['a', 'Tell me, young me, have you got the rope swing yet?'],
      ['b', 'Almost! I fall in less than half the time now.'],
      ['a', 'Keep at it. One day you’ll do it in front of the whole crew. Mind the barrel.'],
      ['b', 'What barrel?'],
      ['a', 'You’ll see.'],
    ],
    A: [
      ['b', 'Do I… ever stop being a deckhand?'],
      ['a', 'You become a storyteller. You tell everyone about the crew, and the boy in green, and Miss Tetra.'],
      ['b', 'That’s it? Stories?'],
      ['a', 'Stories are how a whole kingdom remembers where it came from. It’s the most important job there is.'],
    ],
    S: [
      ['a', 'Here, young me. My Stamp Book. Well, our Stamp Book.'],
      ['b', 'It’s full of places I haven’t been yet!'],
      ['a', 'You will. Every one of them. And you’ll have a wonderful time.'],
      ['b', 'Will I be happy?'],
      ['a', 'Very. Now go practise that rope swing.'],
    ],
  },
  'elderNiko|heroOfWinds': {
    C: [
      ['a', 'You! Link! Look at you! You haven’t aged a day!'],
      ['b', '…Niko?'],
      ['a', 'The very same! A little more wrinkly. A great deal wiser.'],
    ],
    B: [
      ['a', 'Do you remember the time I tested you on the rope swing and you went straight into the water?'],
      ['b', 'You pushed me.'],
      ['a', 'I encouraged you. Forcefully.'],
    ],
    A: [
      ['a', 'I tell your story every day to the children of Aboda. They adore you.'],
      ['b', 'You make it up.'],
      ['a', 'I embellish. The giant bird was only fairly giant. But the courage — that part I never had to make up.'],
    ],
    S: [
      ['a', 'I never said thank you. For taking a scared little deckhand along on the greatest adventure of his life.'],
      ['b', 'You came along on your own.'],
      ['a', 'I came along because you did. That’s how it works, with heroes.'],
      ['b', 'Then thank you for coming.'],
      ['n', 'The old man wipes his eyes and immediately claims it is smoke from the fire.'],
    ],
  },
  'elderNiko|tetra': {
    C: [
      ['b', 'Niko?! You got OLD!'],
      ['a', 'Miss Tetra! You haven’t changed! Still shouting!'],
      ['b', 'Somebody has to give the orders.'],
    ],
    B: [
      ['b', 'So you’re a storyteller now. What do you tell them about me?'],
      ['a', 'That you were the bravest, fiercest, most terrifying captain on the Great Sea.'],
      ['b', 'Good. Accurate.'],
      ['a', 'And that you were secretly very kind to your crew. They love that part.'],
      ['b', 'Delete that part.'],
    ],
    A: [
      ['a', 'The kingdom you founded, Miss Tetra. It grew so big. There are trains.'],
      ['b', 'I saw. Noisy things. I like them.'],
      ['a', 'You should be proud.'],
      ['b', 'I am. Of the crew that built it. Of you, even, swab.'],
    ],
    S: [
      ['b', 'Hey, Niko. Want to sail one more time? Just you and me and the old crew?'],
      ['a', 'My knees, Miss Tetra…'],
      ['b', 'You can sit at the bow and tell stories. Captain’s orders.'],
      ['a', 'Aye aye, Captain. One more voyage.'],
    ],
  },
  'elderNiko|gonzo': {
    C: [
      ['b', 'NIKO?! Little Niko?! You’re ANCIENT!'],
      ['a', 'Gonzo! You haven’t aged and you’re still crying!'],
      ['b', 'I’m not crying, it’s sea spray!'],
    ],
    B: [
      ['b', 'Remember when you were so small you fit in the barrels?'],
      ['a', 'You put me in the barrels!'],
      ['b', 'For safety! Mostly safety.'],
    ],
    A: [
      ['a', 'You looked after me, Gonzo. When I was the youngest on the ship and scared of everything.'],
      ['b', 'Somebody had to. You were tiny. Like a sad little potato.'],
      ['a', 'I told the children of Aboda all about you. The big strong sailor who cried at sunsets.'],
      ['b', 'You told them I CRIED?'],
    ],
    S: [
      ['b', 'Look at you. All grown up. Too grown up.'],
      ['a', 'You were the closest thing I had to a big brother, you know.'],
      ['b', 'Oh no. Oh no, don’t say that, I’m going to—'],
      ['n', 'Gonzo bursts into tears and lifts the old man in a hug that cracks three of his vertebrae, pleasantly.'],
    ],
  },
  'linebeck|linebeck3': {
    C: [
      ['a', 'You there! Shopkeeper! Your prices are robbery.'],
      ['b', 'Thank you. It runs in the family.'],
      ['a', 'What family?'],
      ['b', 'Hi, Grandpa.'],
    ],
    B: [
      ['a', 'My grandson. A merchant. Not a treasure hunter?'],
      ['b', 'Treasure hunting is risky. Buying treasure from treasure hunters is very safe.'],
      ['a', '…That’s smart. That’s very smart. Why didn’t I think of that?'],
    ],
    A: [
      ['b', 'You know, the family stories say you were a coward.'],
      ['a', 'A strategic coward.'],
      ['b', 'But they also say you came back. For your friend. Every time.'],
      ['a', '…The family says that?'],
      ['b', 'It’s my favourite part.'],
    ],
    S: [
      ['a', 'Here. My old compass. Points to whoever you’re thinking about.'],
      ['b', 'Grandpa, I already have it. You left it to me.'],
      ['a', 'I— did I? Then I must have meant it. Huh.'],
      ['b', 'Want to know who it points to?'],
      ['a', 'Don’t make it weird, kid.'],
      ['b', 'It points to you.'],
    ],
  },
  'jolene|linebeck3': {
    C: [
      ['a', 'You. You have his face. His smug, cowardly face.'],
      ['b', 'Ma’am, I am a respectable merchant.'],
      ['a', 'That’s what HE said.'],
    ],
    B: [
      ['b', 'Grandpa mentioned you in his diary, you know.'],
      ['a', 'Oh, did he. What did he say?'],
      ['b', 'Mostly “RUN.” In large letters. But one page just said “She was right.”'],
      ['a', '…Right about what?'],
      ['b', 'He didn’t say.'],
    ],
    A: [
      ['a', 'Your grandfather owed me a great deal of money.'],
      ['b', 'Then let me settle the family debt. Here. With interest.'],
      ['a', 'You’re… actually paying?'],
      ['b', 'Grandpa would have hated it. That’s half the fun.'],
    ],
  },
  'alfonzo|eddo': {
    C: [
      ['b', 'A train! A whole train! With a cannon on it! Who installed that cannon?'],
      ['a', 'I did.'],
      ['b', 'It’s too small.'],
    ],
    B: [
      ['b', 'If you just added a second boiler here, and a cannon there, and another cannon over there—'],
      ['a', 'It would explode.'],
      ['b', 'Magnificently!'],
    ],
    A: [
      ['a', 'All right. One bigger cannon. On the freight car. Where it won’t blow off my engine.'],
      ['b', 'You won’t regret this!'],
      ['a', 'I’m already regretting it.'],
      ['n', 'The test fire takes out a hill. Both men stand in silence, then shake hands.'],
    ],
    S: [
      ['b', 'You know, you’re the first engineer who didn’t throw me out of the workshop.'],
      ['a', 'You fix things. You just fix them louder than most.'],
      ['b', 'Partners?'],
      ['a', 'Partners. My workshop, your cannons, and nobody touches the boiler.'],
      ['b', 'Deal! …Mostly.'],
    ],
  },
  'alfonzo|robbie': {
    C: [
      ['b', 'Fascinating! A steam engine! So primitive, so elegant, so LOUD!'],
      ['a', 'Who are you calling primitive?'],
      ['b', 'It’s a compliment! Mostly!'],
    ],
    B: [
      ['b', 'What if you powered it with an ancient core? Tremendous output!'],
      ['a', 'What if it took off and flew into a mountain?'],
      ['b', 'Then we’d know it works!'],
    ],
    A: [
      ['a', 'All right, show me your ancient… thingamajig. Slowly.'],
      ['b', 'You’re interested! I knew it!'],
      ['a', 'I’m cautious. Interested and cautious. That’s how you don’t die in this job.'],
      ['b', 'A wise man! The rarest kind of engineer!'],
    ],
    S: [
      ['b', 'We did it. The first steam-and-ancient hybrid engine in history.'],
      ['a', 'It only exploded twice.'],
      ['b', 'A success rate any researcher would weep for!'],
      ['a', 'Same time next week?'],
      ['b', 'I’ll bring more goggles.'],
    ],
  },
  'alfonzo|purah': {
    C: [
      ['b', 'You fix trains? With a WRENCH? Not even a little bit of Sheikah technology?'],
      ['a', 'A wrench never runs out of power.'],
      ['b', 'Okay, that’s actually a good point.'],
    ],
    B: [
      ['b', 'Let me scan your engine! Just a little scan!'],
      ['a', 'If it beeps, I’m throwing it in the lake.'],
      ['b', 'It doesn’t beep. It… chirps.'],
    ],
    A: [
      ['b', 'You know, I think you’d have made a great researcher.'],
      ['a', 'I’d have made a terrible one. I don’t take notes.'],
      ['b', 'You remember everything though! Every bolt!'],
      ['a', 'That’s not research, that’s caring about your engine.'],
    ],
  },
  'alfonzo|gonzo': {
    C: [
      ['a', 'You’re built like a train. Ever thought about engineering?'],
      ['b', 'I’m a pirate! Pirates don’t do… trains.'],
      ['a', 'Pity. You could carry a boiler under each arm.'],
    ],
    B: [
      ['b', 'All right, how does this thing work? The big wheely thing.'],
      ['a', 'Steam pushes the piston. Piston turns the wheel. Wheel moves the train.'],
      ['b', 'It’s like rowing! But with fire!'],
      ['a', '…Close enough.'],
    ],
    A: [
      ['b', 'Captain Tetra would love this. She always wanted a ship that didn’t need wind.'],
      ['a', 'Then build her one. I’ll show you how.'],
      ['b', 'Me? Build something? I only break things.'],
      ['a', 'So did I, once. Grab a wrench.'],
    ],
    S: [
      ['b', 'Alfonzo! Look! I built a little steam rowboat!'],
      ['a', 'It works?'],
      ['b', 'It sank. Then it floated. Then it sank again! But in between, it worked!'],
      ['a', 'Ha! You’re an engineer now, Gonzo. That’s exactly how it starts.'],
      ['n', 'Gonzo cries with pride. Alfonzo pretends not to notice and passes him a handkerchief.'],
    ],
  },
  'alfonzo|herosShade': {
    C: [
      ['b', 'You hold your blade like a guardsman who has forgotten the guard.'],
      ['a', 'I’ve been fixing trains for twenty years. I’m out of practice.'],
      ['b', 'Practice returns. Show me your stance.'],
    ],
    B: [
      ['b', 'Your counter is good. Better than good. Who taught it to you?'],
      ['a', 'An old captain of the royal guard. He said it came from an old, old hero.'],
      ['b', '…Then it came from me.'],
      ['a', 'You’re pulling my leg.'],
      ['b', 'I have no legs to pull with. Again.'],
    ],
    A: [
      ['a', 'Why teach me? I’m a mechanic.'],
      ['b', 'Because you teach others. My lessons have travelled through centuries that way.'],
      ['a', 'Then I’ll pass them on. To the kid. And whoever comes after.'],
      ['b', 'That is all a sword-master ever wants.'],
    ],
  },
  'ferrus|tingle': {
    C: [
      ['b', 'Kooloo-limpah! A boy who loves maps almost as much as Tingle!'],
      ['a', 'I love RAIL maps. Rails!'],
      ['b', 'Tingle will make you a rail map! Only 398 Rupees!'],
    ],
    B: [
      ['a', 'Your maps are… surprisingly accurate.'],
      ['b', 'Tingle is a professional! Tingle floated over everything with a balloon!'],
      ['a', 'A balloon! I could take pictures from up there!'],
    ],
    A: [
      ['b', 'Ferrus-friend, Tingle has a gift. A map of every rail in New Hyrule.'],
      ['a', 'This is… this is the most beautiful thing I’ve ever seen.'],
      ['b', 'Only 398 Rupees.'],
      ['a', 'Worth every one.'],
    ],
  },
  'ferrus|robbie': {
    C: [
      ['b', 'Your camera! May I see it? Hmm! A primitive Sheikah Slate!'],
      ['a', 'It’s a camera. It takes pictures. Of trains.'],
      ['b', 'Fascinating!'],
    ],
    B: [
      ['b', 'With a few modifications, your camera could analyse the composition of a rail!'],
      ['a', 'You can do that?'],
      ['b', 'With ancient technology, anything is possible! Most things. Some things.'],
    ],
    A: [
      ['a', 'You fitted my camera with an ancient lens. Now I can see cracks in the rails before they break!'],
      ['b', 'Science serves the railway!'],
      ['a', 'You’re the best weird old man I’ve ever met.'],
      ['b', 'I’ll take that!'],
    ],
  },
  'byrne|ghirahim': {
    C: [
      ['b', 'Ooh. A fellow servant of a demon king. How fabulous. How tragic.'],
      ['a', 'I was not his servant.'],
      ['b', 'Oh, we all say that, darling.'],
    ],
    B: [
      ['b', 'Tell me, what did yours promise you? Mine promised me everything.'],
      ['a', 'The power of the Spirit Gods.'],
      ['b', 'And you believed him? Adorable.'],
      ['a', 'And you believed yours?'],
      ['b', '…That is not the point.'],
    ],
    A: [
      ['a', 'I turned against Malladus in the end. Do you regret not turning against Demise?'],
      ['b', 'I am a sword, sweetling. A sword does not turn against its hand.'],
      ['a', 'I was a gauntlet. And I did.'],
      ['b', 'Hmph. Then perhaps you are something more than a weapon. How enviable.'],
    ],
  },
};
