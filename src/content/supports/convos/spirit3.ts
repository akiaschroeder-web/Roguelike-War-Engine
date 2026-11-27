// Support conversations: Spirit Tracks (part 3: cross-pack pairs). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'byrne|zant': {
    C: [
      ['b', 'You. You reached for a power that was not yours. I can smell it on you.'],
      ['a', 'And you are the usurper who wore a stolen crown.'],
      ['b', 'Stolen? It was OWED to me!'],
      ['a', 'That is what I told myself, too.'],
    ],
    B: [
      ['b', 'Your demon cast you aside, didn’t he? As mine did.'],
      ['a', 'He tried. I chose to leave before he could finish.'],
      ['b', 'Hmph. You make it sound noble.'],
      ['a', 'It was not noble. It was late. But it was mine.'],
    ],
    A: [
      ['b', 'Tell me, Lokomo. Does the shame ever fade?'],
      ['a', 'No. But it becomes lighter when you carry something else beside it.'],
      ['b', 'Such as?'],
      ['a', 'A purpose. A teacher. People who let you stand with them anyway.'],
      ['b', '…I have none of those.'],
      ['a', 'Not yet.'],
    ],
  },
  'byrne|herosShade': {
    C: [
      ['b', 'You fight with your gauntlet like a beast. Is there no art to it?'],
      ['a', 'It wins.'],
      ['b', 'Winning is not the only measure of a warrior.'],
    ],
    B: [
      ['a', 'You are a spirit who stays to teach. Why?'],
      ['b', 'Because I died with regrets. Teaching soothes them.'],
      ['a', 'I also have regrets.'],
      ['b', 'Then you know why I stay.'],
    ],
    A: [
      ['b', 'Your strikes are cleaner today. You are thinking of someone when you fight.'],
      ['a', 'My master. Anjean. I fought to stand above her. Now I fight to stand beside her.'],
      ['b', 'That is the beginning of real strength.'],
    ],
    S: [
      ['b', 'I have one last technique to teach. The Ending Blow. You will use it to protect, not to conquer.'],
      ['a', 'You trust me with that?'],
      ['b', 'I trust the warrior you are becoming. Not the one you were.'],
      ['a', 'Then I will be worthy of it. I swear on my claws.'],
      ['b', 'Swear on your heart. Claws can be broken.'],
    ],
  },
  'anjean|oshus': {
    C: [
      ['b', 'A Lokomo! It has been a long time since I spoke with a guardian of the old ways.'],
      ['a', 'And you are no mere old man, I think. You smell of the sea.'],
      ['b', 'Ho ho. Sharp eyes, for one so wheeled.'],
    ],
    B: [
      ['a', 'You guarded a world, once. As I guard the tracks.'],
      ['b', 'I let it fall to a phantom for too long. Guardianship is a heavy oar.'],
      ['a', 'Then we have both rowed too long alone.'],
    ],
    A: [
      ['b', 'When I let my world sink back into dream, I wondered if I had failed.'],
      ['a', 'You set it free. That is not failure.'],
      ['b', 'And when your watch ends, Anjean? Will you set the tracks free?'],
      ['a', 'I will give them to the young. That is the same thing.'],
    ],
    S: [
      ['b', 'Let us make a pact, old guardian. When our watches end, we will sit by the sea and tell lies about how strong we were.'],
      ['a', 'I do not lie.'],
      ['b', 'You will learn. It is the joy of old age.'],
      ['a', '…Very well. One lie each. I will choose mine carefully.'],
    ],
  },
  'anjean|rauru': {
    C: [
      ['a', 'You are a sage of light. I feel it from here.'],
      ['b', 'And you a sage of the tracks. The light here runs along the rails like a river.'],
      ['a', 'That is the oldest song of the Lokomo.'],
    ],
    B: [
      ['b', 'I sealed the Sacred Realm against a great evil, long ago. Sealing is lonely work.'],
      ['a', 'We sealed Malladus beneath our Tower. A hundred years of listening to him scratch.'],
      ['b', 'I know that scratching.'],
    ],
    A: [
      ['a', 'Do you ever regret becoming a sage? Giving up the ordinary world?'],
      ['b', 'Every sage regrets something. But I would choose it again. Would you?'],
      ['a', 'A hundred times. Though I would complain more.'],
    ],
    S: [
      ['b', 'When the dark rises again, and it will, there must be those who remember how to seal it.'],
      ['a', 'Then let us write it down together. Your light, my songs.'],
      ['b', 'A book of sages. I like it.'],
      ['a', 'We will need a very patient scribe.'],
      ['b', 'I know a young princess who never stops talking. She will do nicely.'],
    ],
  },
  'anjean|sahasrahla': {
    C: [
      ['b', 'Ah. A fellow elder of the old knowledge.'],
      ['a', 'And a fellow keeper of secrets, I suspect.'],
      ['b', 'Only the important ones.'],
    ],
    B: [
      ['a', 'You guided a young hero once, I am told. Through telepathy.'],
      ['b', 'It saved on walking. These old legs.'],
      ['a', 'These old wheels understand.'],
    ],
    A: [
      ['b', 'The young always think they’re the first to face the darkness.'],
      ['a', 'And we let them. Because believing it makes them braver.'],
      ['b', 'Precisely. You and I would have been good friends, Anjean.'],
      ['a', 'We are good friends, old man. Do keep up.'],
    ],
  },
  'gage|saria': {
    C: [
      ['b', 'Your cello! It sounds like the Lost Woods on a quiet evening!'],
      ['a', 'You hear the forest in it too?'],
      ['b', 'Of course! The trees are humming along.'],
    ],
    B: [
      ['b', 'Want to play together? I have my ocarina!'],
      ['a', 'I— I get nervous playing with others.'],
      ['b', 'Then just listen to the trees. Play to them, not to me.'],
      ['n', 'Gage plays. Saria joins in. Somewhere in the forest, a dead branch puts out a leaf.'],
    ],
    A: [
      ['a', 'The trees in my realm were dying when the tracks faded. I thought it was my fault.'],
      ['b', 'Forests don’t blame anyone, silly. They just wait for someone to sing again.'],
      ['a', 'You make it sound simple.'],
      ['b', 'It is simple. It’s just not easy.'],
    ],
    S: [
      ['b', 'Gage, will you come to the Sacred Forest Meadow one day? The Kokiri would love your cello.'],
      ['a', 'Is it… a big audience?'],
      ['b', 'Huge. Trees, Kokiri, fairies, and one very grumpy Mido.'],
      ['a', 'I’ll come. I’ll be terrified. But I’ll come.'],
      ['b', 'That’s the spirit!'],
    ],
  },
  'anoukiChief|steem': {
    C: [
      ['b', 'Another elder of the snow! Do the Anouki complain about the cold as much as I do?'],
      ['a', 'The Anouki never complain about the cold. We complain about the Yook.'],
      ['b', 'Yook? Are those like Freezards?'],
      ['a', 'Worse. They pretend to be us.'],
    ],
    B: [
      ['a', 'You play to keep the tracks alive. I keep a village alive. Similar, I think.'],
      ['b', 'Similar. Both are mostly worrying.'],
      ['a', 'And shovelling snow.'],
    ],
    A: [
      ['b', 'Do your people ever ask you to rest, Chief?'],
      ['a', 'Constantly. I ignore them.'],
      ['b', 'So do I. Anjean calls it stubbornness.'],
      ['a', 'I call it wisdom. In the cold, the one who stops moving freezes.'],
    ],
    S: [
      ['a', 'Come to our village, Steem. We will make you an Anouki coat. The warmest in the world.'],
      ['b', 'Warmer than my sanctuary? Impossible.'],
      ['a', 'You complain that your sanctuary is too cold every day.'],
      ['b', '…Make it a big coat.'],
    ],
  },
  'steem|yeta': {
    C: [
      ['b', 'Oh! Another one who lives in the snow! Do you get cold too?'],
      ['a', 'Always. Far too cold.'],
      ['b', 'Me too. I wear many scarves. You may borrow one.'],
    ],
    B: [
      ['b', 'My husband makes soup. The best soup. You should try it.'],
      ['a', 'Soup! Finally, someone who understands the important things in the snow.'],
    ],
    A: [
      ['b', 'Once, a mirror made me very sick. Very cold inside. I was not myself.'],
      ['a', 'A curse, perhaps. The cold gets in through cracks in the heart.'],
      ['b', 'How do you close the cracks?'],
      ['a', 'Soup. Music. Friends who visit. Mostly soup.'],
    ],
  },
  'carben|medli': {
    C: [
      ['a', 'A Rito who plays the harp! May I say, your wings are absolutely stunning.'],
      ['b', 'Oh! Um, thank you. That’s… very forward.'],
      ['a', 'The sea makes me bold.'],
    ],
    B: [
      ['b', 'Do you really play to hold the tracks together?'],
      ['a', 'I do! The Ocean Melody. Everyone thinks I’m a flirt, but I take the music very seriously.'],
      ['b', 'I believe you. You never miss a note.'],
    ],
    A: [
      ['a', 'You prayed to Valoo for years before anyone thought you were good enough.'],
      ['b', 'I wasn’t good enough. I kept practising until I was.'],
      ['a', 'That’s… exactly what I did. Nobody knows that.'],
      ['b', 'Now I do.'],
    ],
    S: [
      ['a', 'Medli, would you play a duet with me at the Ocean Sanctuary? Just us?'],
      ['b', 'Is that… a sage thing, or a Carben thing?'],
      ['a', 'Both. Mostly a Carben thing.'],
      ['b', 'Then yes. Mostly a Medli thing too.'],
      ['n', 'Carben spends the rest of the day blushing a darker shade of blue.'],
    ],
  },
  'carben|lulu': {
    C: [
      ['b', 'A Lokomo who plays the sea! How lovely.'],
      ['a', 'And a Zora diva who sings to it! The waves must be jealous.'],
      ['b', 'Oh, you charmer.'],
    ],
    B: [
      ['b', 'Have you ever lost your voice? Truly lost it?'],
      ['a', 'When the ocean tracks broke. I couldn’t play a single note.'],
      ['b', 'I lost mine when my eggs were stolen. Grief steals songs.'],
      ['a', 'But they come back.'],
      ['b', 'They do. With help.'],
    ],
    A: [
      ['a', 'Sing with me, Lulu? The Ocean Melody needs a voice like yours.'],
      ['b', 'Only if you keep up.'],
      ['a', 'I’ll be a stylish beat late, as always.'],
    ],
  },
  'darunia|embrose': {
    C: [
      ['a', 'BROTHER! Those drums! They shake the very mountain!'],
      ['b', 'YOU HEAR THEM?! FINALLY, SOMEONE WHO APPRECIATES VOLUME!'],
      ['a', 'HA HA HA! I LIKE YOU, BROTHER!'],
    ],
    B: [
      ['b', 'Do Gorons dance?'],
      ['a', 'Gorons DANCE like the earth itself is moving!'],
      ['b', 'Then dance to my drums!'],
      ['n', 'The resulting dance knocks two tents over and causes a minor rockslide.'],
    ],
    A: [
      ['a', 'You play to keep a volcano asleep. Gorons live with volcanoes. We know that weight.'],
      ['b', 'It’s lonely, being the only one who can keep it quiet.'],
      ['a', 'Then you are not alone anymore, brother. Darunia will drum with you.'],
    ],
    S: [
      ['a', 'Brother Embrose! Let us swear brotherhood, as Gorons do!'],
      ['b', 'How do Gorons do it?'],
      ['a', 'A great hug! Then a great rock roast!'],
      ['b', 'I accept!'],
      ['n', 'The hug cracks Embrose’s chair. He considers it an honour.'],
    ],
  },
  'din|embrose': {
    C: [
      ['a', 'Oh, I love a good beat! Can you play something I can dance to?'],
      ['b', 'EVERYTHING I PLAY YOU CAN DANCE TO!'],
      ['a', 'Wonderful!'],
    ],
    B: [
      ['b', 'You’re the Oracle of Seasons? You command the seasons?'],
      ['a', 'I ask them nicely. And then I dance until they listen.'],
      ['b', 'That’s how I deal with volcanoes!'],
    ],
    A: [
      ['a', 'Fire is joy, Embrose. Everyone forgets that. They only think of burning.'],
      ['b', 'Fire is warm. Fire is music. Fire is drums.'],
      ['a', 'Then let us remind them. You drum, I dance.'],
    ],
  },
  'nabooru|rael': {
    C: [
      ['a', 'A desert sage! You must know the sands like I do.'],
      ['b', 'The sand of my realm was sealed for a hundred years. It is still waking up.'],
      ['a', 'Sand always remembers. Give it time.'],
    ],
    B: [
      ['b', 'Your people live in the desert by choice?'],
      ['a', 'The desert keeps you honest. No hiding from the sun.'],
      ['b', 'Then my horn and your people would get along.'],
    ],
    A: [
      ['a', 'You stayed calm when the Sandworm surfaced right under you. Impressive.'],
      ['b', 'Panic is louder than sand. And the sand hears everything.'],
      ['a', 'Ha! I’m stealing that one, sage.'],
    ],
  },
  'aginah|rael': {
    C: [
      ['a', 'A sage of the sands! I study the desert’s old magic. Have you seen the ruins near your sanctuary?'],
      ['b', 'Seen them? I was buried under them for a century.'],
      ['a', 'Oh. Oh my. Would you tell me everything?'],
    ],
    B: [
      ['b', 'You live alone in a cave in the desert?'],
      ['a', 'Studying! Alone is very good for studying.'],
      ['b', 'Alone is very bad for everything else.'],
    ],
    A: [
      ['a', 'Your horn — its tones follow the same patterns as the desert ruins’ inscriptions.'],
      ['b', 'The Lokomo carved those songs into stone long ago.'],
      ['a', 'You mean I’ve been reading music all this time?'],
    ],
    S: [
      ['b', 'Come to the Sand Sanctuary, Aginah. Bring your notebooks. I will play every inscription for you.'],
      ['a', 'Every one? There are hundreds.'],
      ['b', 'I have time. I spent a hundred years under the sand. I am very good at time.'],
      ['a', 'Then I will bring a very large notebook.'],
    ],
  },
  'agahnim|cole': {
    C: [
      ['b', 'A fellow court wizard! How do you do? Lovely robes.'],
      ['a', 'Lovely hat.'],
      ['b', 'Thank you! I’m so glad someone noticed!'],
    ],
    B: [
      ['a', 'You also deceived a king to free a demon?'],
      ['b', 'Oh, constantly. It’s practically the job description.'],
      ['a', 'Did yours ever thank you?'],
      ['b', '…No.'],
      ['a', 'Mine neither.'],
    ],
    A: [
      ['b', 'Do you ever wonder if we chose the wrong masters?'],
      ['a', 'Every day since my defeat.'],
      ['b', 'Perhaps we should have opened a magic shop. Card tricks. Doves.'],
      ['a', 'I would have liked that. I am quite good with doves.'],
    ],
  },
  'cole|veran': {
    C: [
      ['a', 'A possessor of bodies. How chic. What do you use, a ritual?'],
      ['b', 'Ritual! Darling, I just slip inside. Like a glove.'],
      ['a', 'I prefer a nice clean ritual. Less mess.'],
    ],
    B: [
      ['b', 'You stole a princess’s body? For your master? How generous of you.'],
      ['a', 'I thought so. He didn’t even like it.'],
      ['b', 'Masters never appreciate the effort we put into possessions.'],
    ],
    A: [
      ['a', 'Tell me, sorceress. When you were driven out of the Oracle, how did it feel?'],
      ['b', 'Cold. Like being thrown into the sea. Why do you ask?'],
      ['a', 'Because I watched the princess’s spirit float beside her body for weeks. I wondered.'],
      ['b', 'Careful, Cole. That sounds suspiciously like guilt.'],
    ],
  },
  'ganondorf|malladus': {
    C: [
      ['a', 'Another demon king. Hmph. You do not look like much.'],
      ['b', 'I am a god who was sealed under a tower. You are a thief with a triangle.'],
      ['a', 'A triangle that made me immortal.'],
    ],
    B: [
      ['b', 'You wanted a whole kingdom. I wanted a whole body.'],
      ['a', 'And neither of us got it.'],
      ['b', 'Not yet.'],
    ],
    A: [
      ['a', 'Every time I rise, a boy in green cuts me down. Do you have a boy in green?'],
      ['b', 'A boy in blue. With a train. And a princess who hits very hard.'],
      ['a', 'Hm. Then we are cursed alike, Demon King.'],
      ['b', 'Perhaps the curse is called "being wrong".'],
    ],
  },
  'demise|malladus': {
    C: [
      ['a', 'You are a small flame, Demon King of the tracks.'],
      ['b', 'Small? I burned through a whole realm.'],
      ['a', 'I burned through the heavens. Kneel.'],
    ],
    B: [
      ['b', 'You are the first, then. The demon from whom all hatred comes.'],
      ['a', 'All hatred finds its way back to me. As yours did.'],
      ['b', 'Mine was my own.'],
      ['a', 'So they all say.'],
    ],
    A: [
      ['a', 'You were sealed by music. I was sealed by a sword. Which is the greater shame?'],
      ['b', 'Music. At least a sword is a warrior’s death.'],
      ['a', 'Then you understand nothing. The song outlasts the blade.'],
      ['b', '…You admire them.'],
      ['a', 'I respect what defeated me. It is the only respect I have left.'],
    ],
    S: [
      ['a', 'Rise with me, Malladus. When the curse ends, we will both return. Together.'],
      ['b', 'And burn everything?'],
      ['a', 'Burn everything. Or watch it, from a distance, and see if it ever stops singing.'],
      ['b', 'You sound almost tired, Demise.'],
      ['a', 'An eternity of hatred is a long time. Even for me.'],
    ],
  },
  'bellum|malladus': {
    C: [
      ['a', 'Gloooo… another one who drinks life… from a god…'],
      ['b', 'I drank from a princess. It tasted of light. Disgusting.'],
      ['a', 'The Ocean King tasted of salt… and old age…'],
    ],
    B: [
      ['b', 'You possessed a man named Linebeck. Was he worth it?'],
      ['a', 'He was afraid. Fear is… delicious.'],
      ['b', 'The princess was not afraid. That was the problem.'],
    ],
    A: [
      ['a', 'We are both… defeated by the little ones… with their swords and their songs…'],
      ['b', 'They should have been nothing.'],
      ['a', 'Yet here we are. Fighting… beside them.'],
      ['b', 'Do not say that so loudly.'],
    ],
  },
  'majorasMask|malladus': {
    C: [
      ['a', 'Tee hee. A big angry pig god. Do you want to play a game?'],
      ['b', 'I do not play games.'],
      ['a', 'Everyone plays games. Some of them just lose.'],
    ],
    B: [
      ['b', 'You wanted to crush a world with a moon. I wanted to shroud mine in darkness.'],
      ['a', 'Same game, different board!'],
      ['b', 'It is not a game.'],
      ['a', 'You’re no fun.'],
    ],
    A: [
      ['a', 'Do you know why I like you? Because you got stuck in a little girl like I got stuck in a little boy.'],
      ['b', 'That is not why anyone should like anyone.'],
      ['a', 'It’s the best reason! Hosts are fun!'],
      ['b', 'Hosts fight back. That is what I learned.'],
    ],
  },
  'goronRoller|wreckerPhantom': {
    C: [
      ['a', 'Hey! You roll too! Wanna race, brother?'],
      ['b', '…'],
      ['a', 'I’ll take that as a yes!'],
    ],
    B: [
      ['a', 'You’re fast for a guy made of metal. What’s your secret?'],
      ['b', '(The Phantom tucks its arms in and curls up very tightly.)'],
      ['a', 'Oh, tuck the elbows! Smart!'],
    ],
    A: [
      ['n', 'After the race, the Goron and the Wrecker Phantom lie side by side, dented and dusty.'],
      ['a', 'You won. Barely. Good roll, brother.'],
      ['b', '(The Phantom lifts one heavy fist and taps it, very gently, against the Goron’s.)'],
      ['a', 'Ha! Rolling buddies for life!'],
    ],
  },
};
