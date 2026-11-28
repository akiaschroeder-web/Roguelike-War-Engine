// Support conversations: Echoes of Wisdom (part 3: cross-pack pairs — the chiefs, the engineers, the collectors and the bosses). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'darston|darunia': {
    C: [
      ['a', 'Goro! You\'re Darunia! The Goron chief from the old songs!'],
      ['b', 'Songs? Ha! I like the sound of that, brother. What do they say?'],
      ['a', 'That you hug so hard it breaks people!'],
      ['b', 'That one is true.'],
    ],
    B: [
      ['b', 'You get braver when your friends are hurt, eh? That\'s a chief\'s heart.'],
      ['a', 'I used to be scared of everything. Then my people needed me.'],
      ['b', 'Being needed is the best cure for being scared.'],
    ],
    A: [
      ['a', 'How do you lead, Darunia? I just shout "goro" and hope.'],
      ['b', 'That\'s most of it! The rest is dancing.'],
      ['a', 'Dancing?'],
      ['b', 'When a chief dances, everyone knows things are going to be all right.'],
    ],
    S: [
      ['b', 'Come here, brother. Let me give you the true Goron hug.'],
      ['a', 'Is it the one that breaks people?'],
      ['b', 'Only a little.'],
      ['n', 'There is a great crunching sound. Darston comes out of it beaming.'],
      ['a', 'Sworn brothers, goro!'],
    ],
  },
  'darston|yunobo': {
    C: [
      ['b', 'Um, hi! I\'m Yunobo! You\'re a Goron chief? That\'s so cool! I get nervous just talking to chiefs.'],
      ['a', 'I get nervous too! Let\'s be nervous together, goro!'],
    ],
    B: [
      ['b', 'They say you get braver when people get hurt. I\'m the opposite. I curl up into a ball.'],
      ['a', 'But then you roll, right? Into the bad guys?'],
      ['b', '…Yeah! I do!'],
      ['a', 'That\'s courage too!'],
    ],
    A: [
      ['b', 'I\'m a Sage now. I still don\'t feel brave.'],
      ['a', 'Feeling brave doesn\'t matter. Being brave matters. And you were brave in front of a giant Rift beast.'],
      ['b', 'I was screaming the whole time.'],
      ['a', 'Brave screaming is the best kind!'],
    ],
    S: [
      ['b', 'When I go home, I\'m going to tell the Gorons there\'s a chief who\'s nervous like me.'],
      ['a', 'And when I go home, I\'ll tell mine about a Sage who rolls into danger anyway.'],
      ['b', 'Best friends?'],
      ['a', 'The best, goro!'],
    ],
  },
  'conde|yeto': {
    C: [
      ['b', 'You big! Bigger than Yeto, almost!'],
      ['a', 'Almost.'],
      ['b', 'Yeto likes big friend. Come to mansion. Yeta makes soup.'],
    ],
    B: [
      ['b', 'You shovel snow all day? Why?'],
      ['a', 'So people get home.'],
      ['b', 'Yeto never thought of that. Yeto just likes snow.'],
      ['a', 'Snow is good. Paths are also good.'],
    ],
    A: [
      ['b', 'Yeto makes best soup. Reekfish soup. You try.'],
      ['a', '…Strong.'],
      ['b', 'Strong soup for strong friend!'],
    ],
    S: [
      ['b', 'You and Yeto. Two big friends on two big mountains.'],
      ['a', 'Path between them now. Condé cleared it.'],
      ['b', 'For Yeto?'],
      ['a', 'For soup. And for Yeto.'],
      ['n', 'Yeto laughs so hard that a small avalanche comes down. Condé, sighing happily, clears it.'],
    ],
  },
  'conde|yeta': {
    C: [
      ['b', 'Oh, my. Such a big visitor. Are you cold, dear?'],
      ['a', 'Never cold. Thank you.'],
      ['b', 'Have a blanket anyway.'],
    ],
    B: [
      ['b', 'Yeto talks about you all the time now. "Shovel friend", he calls you.'],
      ['a', 'Shovel friend is a good name.'],
    ],
    A: [
      ['b', 'When I was sick, the mansion was so cold. Yeto tried so hard to keep it warm.'],
      ['a', 'Condé will clear the path to your door. Always. So help can come.'],
      ['b', 'Oh… thank you, dear. That is the kindest promise.'],
    ],
  },
  'kushara|ruto': {
    C: [
      ['b', 'You\'re a Zora chief? You don\'t look much like a Zora from Zora\'s Domain.'],
      ['a', 'We are the Sea Zora. You are a river princess, I think.'],
      ['b', 'Princess of the Domain! And future wife of the Hero of Time, thank you very much.'],
    ],
    B: [
      ['a', 'Does your hero know he is to be your husband?'],
      ['b', 'He accepted my mother\'s stone. That is a binding promise among Zora.'],
      ['a', 'Among Sea Zora, a promise is made by playing the same song together.'],
      ['b', 'Hmph! Maybe I should learn the harp.'],
    ],
    A: [
      ['b', 'I was a sage, in the end. Not a wife. Sometimes I don\'t know how I feel about that.'],
      ['a', 'A chief rarely gets the life she planned. She gets the one her people need.'],
      ['b', 'That\'s horribly wise.'],
      ['a', 'I have had a long time to practise.'],
    ],
    S: [
      ['a', 'Play with me. A Zora song from the river, and one from the sea.'],
      ['b', 'I don\'t play the harp!'],
      ['a', 'Then sing. Sea Zora say a true song needs no instrument.'],
      ['n', 'Ruto sings. Kushara plays. For a while, every Zora in the camp stops to listen.'],
      ['b', '…That was a binding promise, wasn\'t it?'],
      ['a', 'Of friendship. Yes.'],
    ],
  },
  'kushara|mipha': {
    C: [
      ['a', 'You are a healer, I hear. As am I, after a fashion.'],
      ['b', 'With magic. And you with music?'],
      ['a', 'Music is magic, if you play it well enough.'],
    ],
    B: [
      ['b', 'Sometimes healing feels like holding back the tide with your hands.'],
      ['a', 'The tide always comes back. That is why we play again tomorrow.'],
      ['b', 'Again tomorrow. Yes. I like that.'],
    ],
    A: [
      ['b', 'I died, you know. A hundred years ago. I came back as a spirit for a while.'],
      ['a', 'Then you know better than anyone what it is worth to be healed.'],
      ['b', 'And how much it is worth to heal. Even when it is too late for yourself.'],
    ],
    S: [
      ['a', 'Let us write a song together. One that heals.'],
      ['b', 'My grace and your harp?'],
      ['a', 'Your grace and my harp. We shall call it "Again Tomorrow".'],
      ['b', 'Then let us play it every day.'],
    ],
  },
  'dohna|urbosa': {
    C: [
      ['b', 'A captain of the Gerudo, from another age. Show me your stance.'],
      ['a', 'Gladly, Lady Urbosa.'],
      ['b', 'Good feet. Your shoulders are too tense. Breathe.'],
    ],
    B: [
      ['a', 'They say you guarded a princess who did not believe in herself.'],
      ['b', 'She believed. She just did not know it yet.'],
      ['a', 'I guard a princess who believes too much. She runs into Rifts.'],
      ['b', 'Ha! A better problem to have, captain.'],
    ],
    A: [
      ['a', 'How do you stay calm, when your princess walks into danger?'],
      ['b', 'I don\'t. I simply make sure the danger is more frightened than I am.'],
    ],
    S: [
      ['b', 'You remind me of myself, Dohna. Sharp, loyal, and far too proud to say "I was wrong".'],
      ['a', 'I said it to the princess once.'],
      ['b', 'Once is more than I managed for a hundred years. Keep that. It is worth more than any blade.'],
      ['a', 'Then I will say it again: I was wrong to think the old champions were only stories.'],
      ['b', 'Ha! Flattery. Now that, I do accept.'],
    ],
  },
  'dohna|nabooru': {
    C: [
      ['b', 'Another Gerudo who works for a princess? What happened to us?'],
      ['a', 'Princesses happened. They are very persuasive.'],
    ],
    B: [
      ['b', 'I stole from my own king once. Ganondorf. Best thing I ever did.'],
      ['a', 'I doubted my own princess once. Worst thing I ever did.'],
      ['b', 'Then we each have a story to tell the young ones.'],
    ],
    A: [
      ['a', 'You became a sage. Do you miss being a thief?'],
      ['b', 'Every single day. But a sage can still pick a lock if she has to.'],
      ['a', 'Teach me?'],
      ['b', 'Ha! I knew I liked you.'],
    ],
  },
  'dampeEoW|robbie': {
    C: [
      ['b', 'WHAT IS THIS?! A wind-up construct! No ancient energy at all! Just a SPRING!'],
      ['a', 'A good spring. Tempered steel, triple-wound.'],
      ['b', 'Magnificent! Primitive! MAGNIFICENT!'],
    ],
    B: [
      ['b', 'My Guardians had cores of pure ancient power. And still they turned on us.'],
      ['a', 'A spring can\'t turn on anybody. It just runs down. That\'s why I trust them.'],
      ['b', '…There is wisdom in that, old timer.'],
    ],
    A: [
      ['a', 'Show me those ancient cores of yours. I want to see what all the fuss is about.'],
      ['b', 'Only if you show me your Roboblin\'s katana mount. I have never seen balance like it!'],
      ['a', 'Deal.'],
    ],
    S: [
      ['b', 'I have built a hybrid. A Sheikah core in a wind-up frame!'],
      ['a', 'It\'ll either fight forever or blow up.'],
      ['b', 'That is exactly what Lueburry said!'],
      ['a', 'Then it\'ll blow up. Beautifully. Let\'s go and watch.'],
      ['n', 'It blows up beautifully. Both engineers applaud.'],
    ],
  },
  'dampeEoW|mineru': {
    C: [
      ['b', 'Your Automatons are charming. Do they think?'],
      ['a', 'They think about one thing: what\'s next to them. Then they hit it.'],
      ['b', 'Ha. Zonai constructs were much the same, at first.'],
    ],
    B: [
      ['b', 'I put my own soul into a construct once. To keep fighting.'],
      ['a', 'I put a bit of mine into every one I build. Not the same way, mind.'],
      ['b', 'No. But I think it is the same reason.'],
    ],
    A: [
      ['a', 'If I built you a body, wind-up, would you want it?'],
      ['b', 'A spring-powered sage? I would have to be wound every morning.'],
      ['a', 'Somebody would always come and do it. That\'s the point.'],
    ],
    S: [
      ['b', 'You build things so that people will come back to them. To wind them. To repair them.'],
      ['a', 'A machine that nobody visits is just scrap.'],
      ['b', 'Then let us build machines that are always visited.'],
      ['a', 'That\'s the best design brief I ever heard, madam.'],
    ],
  },
  'lueburry|purah': {
    C: [
      ['b', 'Crystals that hold a hero\'s power?! Show me! Show me now!'],
      ['a', 'Ah! A fellow enthusiast! Mind the glass, my dear, mind the glass!'],
    ],
    B: [
      ['b', 'I reversed my own age once. Science accident.'],
      ['a', 'I once turned my eyebrows into crystal. Also science.'],
      ['b', 'We\'re going to be best friends.'],
    ],
    A: [
      ['a', 'Do you ever worry, my dear, that we meddle with things too large for us?'],
      ['b', 'All the time! But if nobody meddles, nobody learns.'],
      ['a', 'Quite right. Quite right. Pass me that crystal.'],
    ],
    S: [
      ['b', 'We should open a laboratory together. Sheikah tech and Might Crystals!'],
      ['a', 'With proper safety measures.'],
      ['b', 'Of course! Mostly.'],
      ['a', 'Mostly is all any of us can promise, my dear.'],
      ['n', 'The first experiment goes very, very wrong. Both of them call it a triumph.'],
    ],
  },
  'gondo|lueburry': {
    C: [
      ['a', 'You make gadgets out of crystals? I make them out of scrap.'],
      ['b', 'Scrap! Marvellous! Show me your soldering!'],
    ],
    B: [
      ['a', 'Everyone in Skyloft thought my workshop was a waste of time.'],
      ['b', 'Everyone in my village thought my house was a fire hazard.'],
      ['a', 'Was it?'],
      ['b', 'Constantly. But it was a very well-researched fire hazard.'],
    ],
    A: [
      ['a', 'You helped the princess fight. I fixed up an ancient robot so it could help the hero.'],
      ['b', 'The makers behind the scenes, my boy. We are never in the songs.'],
      ['a', 'I don\'t mind. I\'d rather be in the workshop.'],
    ],
    S: [
      ['b', 'I\'ve left you something in my will, Gondo. All my notebooks.'],
      ['a', 'All of them? There must be hundreds!'],
      ['b', 'Four hundred and twelve. Some of them are only diagrams of eyebrows.'],
      ['a', 'I\'ll treasure every one. Even the eyebrows.'],
    ],
  },
  'stampGuy|tingle': {
    C: [
      ['b', 'Kooloo-limpah! A fellow traveller with an extraordinary outfit!'],
      ['a', 'A fellow COLLECTOR! You collect maps, I collect stamps!'],
      ['b', 'Tingle collects Rupees, mostly.'],
    ],
    B: [
      ['a', 'I\'ve hidden Stamp Stations all over Hyrule. Have you ever stamped one?'],
      ['b', 'Tingle stamped his foot once, when nobody bought a map.'],
      ['a', 'That\'s not the same, but I appreciate the spirit!'],
    ],
    A: [
      ['b', 'People laugh at Tingle\'s suit.'],
      ['a', 'People laugh at mine too! But they always come back for the next stamp.'],
      ['b', 'And for the next map!'],
      ['a', 'Exactly! Being laughed at is just being remembered with a smile.'],
    ],
    S: [
      ['a', 'I\'ve made you a special card. The Tingle Stamp Card! Every station has a little balloon on it.'],
      ['b', 'For Tingle?! Kooloo-limpah!'],
      ['a', 'And every stamp you collect earns you a map. One of yours.'],
      ['b', 'Tingle will collect them all! And then make a map of where the stamps are!'],
      ['a', 'A map of stamps! It\'s perfect!'],
    ],
  },
  'seismicTalus|stoneTalus': {
    C: [
      ['n', 'Two piles of boulders regard each other. Something grinds. It might be a greeting.'],
      ['a', 'GRRRND.'],
      ['b', 'GRRRND?'],
    ],
    B: [
      ['n', 'The Seismic Talus lifts a floating rock from its back and offers it to the Stone Talus.'],
      ['b', 'GRND. (It accepts the rock and puts it on its own head, a little crooked.)'],
    ],
    A: [
      ['n', 'The Stone Talus pulls out its own ore and offers it in return. The Seismic Talus\'s core glows bright.'],
      ['a', 'GRRRRRND.'],
      ['n', 'Nobody understands it, but everyone agrees it sounded friendly.'],
    ],
  },
  'blizzeta|skorchill': {
    C: [
      ['a', 'Cold… so cold… why are you warm, beast?'],
      ['n', 'Its helmet flares red, then frosts over blue, as if it can\'t decide.'],
    ],
    B: [
      ['a', 'Half of you is fire. Half of you is ice. Doesn\'t it hurt?'],
      ['n', 'Skorchill lowers its horns. For a moment, the flame and frost glow together, perfectly balanced.'],
      ['a', '…It doesn\'t hurt you. Because you let both be.'],
    ],
    A: [
      ['a', 'I was all ice. I froze everything because I was afraid of being alone.'],
      ['n', 'Skorchill turns its fire side toward her, very gently, and the frost on her edges softens.'],
      ['a', 'Warm… Thank you.'],
    ],
  },
};
