// Support conversations: Four Swords & Four Swords Adventures (part 1: the four Links, Zelda, Shadow Link, Vaati and Ganon). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'greenLink|redLink': {
    C: [
      ['b', 'Green! Green! Is there food? I can smell food. Somewhere in this forest someone is cooking.'],
      ['a', 'That\'s a Deku Baba. It\'s cooking us, if we\'re not careful.'],
      ['b', 'Oh. Can we eat it after?'],
    ],
    B: [
      ['a', 'You ran straight into those Moblins. Again. We had a plan.'],
      ['b', 'I know! I heard the plan! I just thought the plan would go faster if I was already there.'],
      ['a', 'It would go faster if you were alive at the end of it.'],
      ['b', '…Okay. That one I\'ll think about.'],
    ],
    A: [
      ['b', 'Green, can I ask you something weird? Were we… you, before? Am I just your loud bit?'],
      ['a', 'I don\'t know. Sometimes I think the sword didn\'t split me. It found three people I\'d been keeping quiet.'],
      ['b', 'So I\'m the part of you that\'s brave without thinking.'],
      ['a', 'You\'re the part I wish I listened to more.'],
    ],
    S: [
      ['n', 'The Four Sword hums in its pedestal. When it\'s sheathed, the four of them will be one boy again.'],
      ['b', 'Hey. When we go back in… keep some of me, okay? The laughing bit. And the eating bit.'],
      ['a', 'I\'ll keep all of you. I promise.'],
      ['b', 'Good. Then I\'m not scared.'],
    ],
  },
  'blueLink|greenLink': {
    C: [
      ['a', 'Who put you in charge, anyway? We\'re all Link. We\'ve all got the same sword arm.'],
      ['b', 'Nobody put me in charge. Somebody had to say "left" when we all went in different directions.'],
      ['a', 'I was going the right way.'],
      ['b', 'You were going into a wall.'],
    ],
    B: [
      ['a', 'Fine. Your flanking plan worked. Don\'t look at me like that.'],
      ['b', 'Like what?'],
      ['a', 'Like you\'re going to bring it up for the next three weeks.'],
      ['b', 'Two weeks. I\'m not cruel.'],
    ],
    A: [
      ['a', 'When the Moblins had you pinned, I didn\'t think. I just ran.'],
      ['b', 'You always just run.'],
      ['a', 'Not like that. Not toward someone. I didn\'t like how it felt, seeing you go down.'],
      ['b', 'Then you know how I feel every time you charge off alone.'],
    ],
    S: [
      ['a', 'I still think I should lead sometimes.'],
      ['b', 'You do. Every time you\'re first round the corner, everyone follows you.'],
      ['a', '…Huh. Never thought of it like that.'],
      ['b', 'You lead from the front. I lead from the middle. That\'s why there are four of us.'],
    ],
  },
  'greenLink|purpleLink': {
    C: [
      ['b', 'The tablet says the Four Sword was forged to seal Vaati. It doesn\'t say anything about what happens to us afterwards.'],
      ['a', 'Does it have to?'],
      ['b', 'I\'d like to know whether I\'m going to exist next week, Green. Call it curiosity.'],
    ],
    B: [
      ['a', 'You counted the Force Gems again.'],
      ['b', 'Three hundred and twelve. If Shadow Link hadn\'t scattered the last batch we\'d have the Awakening already.'],
      ['a', 'You can tell that from counting?'],
      ['b', 'I can tell most things from counting. It\'s the rest of you that make it hard.'],
    ],
    A: [
      ['b', 'You trust me with the plans. You never ask where I got them.'],
      ['a', 'You got them from the bit of me that reads the signs I walk past.'],
      ['b', 'So I\'m your patience.'],
      ['a', 'You\'re my second thought. I need one of those.'],
    ],
    S: [
      ['n', 'Purple has written it down: everything they\'ve learned, every map, every trick of the formations.'],
      ['a', 'What\'s the book for?'],
      ['b', 'For you. When we\'re one person again and you\'ve forgotten half of it.'],
      ['a', 'I won\'t forget you.'],
      ['b', 'Then read it anyway. Humour me.'],
    ],
  },
  'blueLink|redLink': {
    C: [
      ['b', 'Blue, race you to the Moblin camp!'],
      ['a', 'That\'s not how you attack a camp.'],
      ['b', 'It is if you win the race.'],
      ['a', '…Fine. On three. Three!'],
    ],
    B: [
      ['a', 'You took a spear for me back there. You didn\'t have to.'],
      ['b', 'You were busy being fast. Somebody had to be big.'],
      ['a', 'You\'re the same size as me.'],
      ['b', 'Not in my head!'],
    ],
    A: [
      ['b', 'Do you ever get scared? Like, properly?'],
      ['a', 'All the time. I just run before it can catch up.'],
      ['b', 'I laugh. Same idea, I think.'],
      ['a', 'Then let\'s keep running and laughing. It\'s working so far.'],
    ],
    S: [
      ['a', 'When this is over, we should do this again. Without the Moblins.'],
      ['b', 'We\'ll be one person.'],
      ['a', 'Then that person\'s going to race himself across Hyrule Field, and I hope he loses.'],
      ['b', 'He\'ll win! Because I\'ll be in there cheering.'],
    ],
  },
  'purpleLink|redLink': {
    C: [
      ['b', 'Purple, what does this sign say?'],
      ['a', '"Danger. Bottomless pit."'],
      ['b', 'Oh. I was going to jump in to see.'],
      ['a', 'I know. That\'s why I read signs.'],
    ],
    B: [
      ['a', 'You fight like you\'ve read nothing and fear nothing.'],
      ['b', 'Is that bad?'],
      ['a', 'It\'s infuriating. And it works. Both at once.'],
    ],
    A: [
      ['b', 'You worry a lot. I can tell, your face goes all scrunchy.'],
      ['a', 'Someone has to think about what could go wrong.'],
      ['b', 'Then I\'ll think about what could go right. Deal?'],
      ['a', '…That\'s actually a reasonable division of labour.'],
    ],
    S: [
      ['n', 'At the campfire, Purple is reading aloud. Red is asleep with his head on Purple\'s shoulder.'],
      ['a', 'You\'re not listening.'],
      ['b', '(mumbling) Am too. The bit with the dragon.'],
      ['a', 'There\'s no dragon in this book.'],
      ['b', 'There should be.'],
      ['n', 'Purple sighs, and turns the page, and doesn\'t move his shoulder.'],
    ],
  },
  'blueLink|purpleLink': {
    C: [
      ['a', 'If you say "according to the tablet" one more time—'],
      ['b', 'According to the tablet, the Talus Cave has a Four-Person Switch, which needs all four of us. Including you. Standing still.'],
      ['a', '…I hate tablets.'],
    ],
    B: [
      ['b', 'You charged the Geldman before I finished explaining.'],
      ['a', 'You were going to say "wait for the right moment". I found it.'],
      ['b', 'I was going to say "it\'s under the sand". You found it with your face.'],
    ],
    A: [
      ['a', 'You think I\'m reckless.'],
      ['b', 'I think you\'re the only one of us who doesn\'t hesitate. I hesitate all the time.'],
      ['a', 'Then plan for me. I\'ll go where you point.'],
      ['b', 'That might be the most trusting thing you\'ve ever said.'],
    ],
    S: [
      ['a', 'Purple. Next fight. Tell me where. I won\'t argue.'],
      ['b', 'You\'ll argue.'],
      ['a', 'I\'ll argue after. While it\'s working.'],
      ['b', 'Then the left flank. And Blue — be careful.'],
      ['a', 'You be careful. I\'m fast. You\'re just clever.'],
    ],
  },
  'greenLink|zeldaFS': {
    C: [
      ['b', 'You came to the Sanctuary with me to check the seal. You drew the sword. And now there are four of you.'],
      ['a', 'I didn\'t know it would do that.'],
      ['b', 'Neither did I. But I think the sword knew exactly what it was doing.'],
    ],
    B: [
      ['a', 'When Vaati took you, the others wanted to rush in. I made them wait for a plan.'],
      ['b', 'And?'],
      ['a', 'I\'ve never wanted to rush in so badly in my life.'],
      ['b', 'Thank you for waiting. And for coming.'],
    ],
    A: [
      ['b', 'You look at the sword sometimes like it\'s heavy.'],
      ['a', 'It is. It holds four of me and one of Vaati. Some days I can feel him in there.'],
      ['b', 'Then let me carry part of it. The Maidens and I keep the seal. That\'s our duty too.'],
      ['a', 'You already carry most of it, Zelda.'],
    ],
    S: [
      ['n', 'The sky over Hyrule is blue again. The Four Sword is back in its pedestal, and there is only one Link.'],
      ['b', 'Do you remember them? The other three?'],
      ['a', 'Every one. Red\'s laugh. Blue\'s temper. Purple\'s lists.'],
      ['b', 'Then they\'re not gone. They\'re you, being more yourself.'],
      ['a', 'And you\'re still here. That\'s the part I\'m most glad of.'],
    ],
  },
  'redLink|zeldaFS': {
    C: [
      ['a', 'Princess! Do princesses eat normal food or is it all, like, cakes?'],
      ['b', 'Mostly normal food. Some cakes.'],
      ['a', 'I knew it. Can I come to the castle?'],
    ],
    B: [
      ['b', 'You stood in front of me when the Darknuts came.'],
      ['a', 'Course I did! You\'re the princess.'],
      ['b', 'I can fight, Red.'],
      ['a', 'I know! I just like standing in front of people. It\'s my favourite.'],
    ],
    A: [
      ['b', 'You make the others laugh when they\'re frightened. Do you know you do that?'],
      ['a', 'Is it working?'],
      ['b', 'It worked on me. In Vaati\'s palace, I heard you laughing through the wall, and I stopped being afraid.'],
      ['a', '…Then I\'ll laugh louder next time.'],
    ],
  },
  'blueLink|zeldaFS': {
    C: [
      ['a', 'You don\'t need to thank me. I just wanted to hit Vaati.'],
      ['b', 'Then thank you for wanting to hit Vaati.'],
      ['a', '…You\'re welcome.'],
    ],
    B: [
      ['b', 'The others say you sulk.'],
      ['a', 'I don\'t sulk. I think angrily.'],
      ['b', 'May I think angrily with you? The council has been unbearable.'],
      ['a', 'Pull up a rock.'],
    ],
    A: [
      ['a', 'Everyone treats you like glass. You\'re not glass.'],
      ['b', 'No. I\'m not.'],
      ['a', 'You took a Ball and Chain Trooper\'s swing and kept casting. I saw.'],
      ['b', 'You\'re the first person to say that as if it impressed you.'],
      ['a', 'It did.'],
    ],
  },
  'purpleLink|zeldaFS': {
    C: [
      ['b', 'You\'ve been in the Sanctuary\'s library all night.'],
      ['a', 'The old texts on the Four Sword contradict each other. I wanted to know which one was right.'],
      ['b', 'And?'],
      ['a', 'None of them. But one of them is nearly right, and that\'s more interesting.'],
    ],
    B: [
      ['a', 'Your Sacred Light — the way you shape it isn\'t in any book I\'ve read.'],
      ['b', 'The Maidens taught me. It isn\'t written. It\'s sung.'],
      ['a', 'Then I\'m going to need you to sing it slowly. Several times.'],
    ],
    A: [
      ['b', 'You worry what happens to you when the sword is sheathed.'],
      ['a', 'Wouldn\'t you?'],
      ['b', 'I would. So I asked the Maidens. They say nothing is lost in the Four Sword. Only gathered.'],
      ['a', '"Gathered." I can live with gathered.'],
    ],
    S: [
      ['n', 'In the Sanctuary library, a new book sits among the old ones, its pages in two hands.'],
      ['a', 'A history of the Four Sword. The true one.'],
      ['b', 'Half yours, half mine.'],
      ['a', 'When I\'m gone back into Link, keep writing it. Please.'],
      ['b', 'Only if you promise to read it, whoever you are by then.'],
    ],
  },
  'greenLink|shadowLink': {
    C: [
      ['a', 'You\'ve got my face.'],
      ['b', 'You\'ve got mine. Funny how that works. I\'m the one the mirror made, and you\'re the one who looks surprised.'],
      ['a', 'Why are you on our side now?'],
      ['b', 'Who said I was?'],
    ],
    B: [
      ['b', 'You lead them. They follow you. Doesn\'t it make you sick, being that good?'],
      ['a', 'I\'m not that good. I\'m just the one who goes first.'],
      ['b', 'That\'s what makes it worse.'],
    ],
    A: [
      ['a', 'You saved Blue. You didn\'t have to.'],
      ['b', 'He\'d have been a terrible thing to lose. I\'d have had nobody to annoy.'],
      ['a', 'That\'s not why.'],
      ['b', '…No. It\'s not. Don\'t make me say the other reason, hero.'],
    ],
    S: [
      ['b', 'Ganon made me out of your shadow. Everything you wouldn\'t be.'],
      ['a', 'Then maybe you\'re the fifth Link. The one the sword didn\'t make.'],
      ['b', 'That\'s the stupidest thing anyone\'s said to me.'],
      ['a', 'You\'re smiling.'],
      ['b', 'Shut up. I\'m your shadow. I do what your face does.'],
    ],
  },
  'redLink|shadowLink': {
    C: [
      ['a', 'You stole our Force Gems!'],
      ['b', 'I borrowed them. With enthusiasm.'],
      ['a', 'Give them back!'],
      ['b', 'Come and get them, red one.'],
    ],
    B: [
      ['a', 'Okay, you\'re kind of funny. When you\'re not blowing us up.'],
      ['b', 'I\'m funnier when I am.'],
      ['a', 'No you\'re not.'],
      ['b', 'I\'m a little bit funnier.'],
    ],
    A: [
      ['a', 'Do you eat? Shadows, I mean.'],
      ['b', 'I never tried.'],
      ['a', 'Here. Half my apple. It\'s the best half.'],
      ['b', '…That\'s the half with the bite out of it.'],
      ['a', 'That\'s how you know it\'s the best half.'],
    ],
  },
  'blueLink|shadowLink': {
    C: [
      ['b', 'Ooh, temper. You\'re the one I like.'],
      ['a', 'You\'re the one I\'m going to hit.'],
      ['b', 'See? We already understand each other.'],
    ],
    B: [
      ['a', 'You fight like me.'],
      ['b', 'I fight like you on a good day. Meaner. Faster. Less shouting.'],
      ['a', 'I don\'t shout.'],
      ['b', 'You\'re shouting now.'],
    ],
    A: [
      ['b', 'They think you\'re the one most like me. The angry one.'],
      ['a', 'Maybe I am.'],
      ['b', 'You\'re not. You get angry for them. I only ever got angry for me.'],
      ['a', '…You could try the other way. It\'s better.'],
    ],
    S: [
      ['n', 'Back to back in the Dark World, the blue Link and the black one hold the line together.'],
      ['a', 'On your left!'],
      ['b', 'I know where my left is, hero.'],
      ['a', 'Then stay on it. I\'m not losing you.'],
      ['b', '…Fine. Nobody\'s losing anybody. Swing.'],
    ],
  },
  'purpleLink|shadowLink': {
    C: [
      ['a', 'You\'re a reflection made solid by the Dark Mirror. I\'d like to study you.'],
      ['b', 'Most people say "please don\'t hurt me".'],
      ['a', 'You haven\'t, yet. That\'s data too.'],
    ],
    B: [
      ['b', 'You took notes while I was attacking you. Notes.'],
      ['a', 'You favour your left after a feint. You laugh before a giant bomb. It\'s very predictable.'],
      ['b', 'I am not predictable.'],
      ['a', 'You\'re about to say "I am not predictable".'],
    ],
    A: [
      ['b', 'If the mirror\'s broken, do I break too?'],
      ['a', 'I don\'t know. I\'ve been looking for the answer since we met.'],
      ['b', 'Why? I tried to kill you.'],
      ['a', 'Because nobody else was going to look.'],
    ],
  },
  'shadowLink|vaatiHylian': {
    C: [
      ['b', 'Ganon\'s little shadow. Run along and fetch my gems.'],
      ['a', 'I fetch for Ganon. You\'re just the wind he lets out.'],
      ['b', 'Mind your tongue, or I\'ll put you back in the mirror myself.'],
    ],
    B: [
      ['a', 'You hate him too. Ganon.'],
      ['b', 'He freed me to use me. Of course I hate him. I simply hate the boy more.'],
      ['a', 'The boy\'s got four of himself. You should try hating something with fewer heads.'],
    ],
    A: [
      ['b', 'Neither of us asked to be anyone\'s tool.'],
      ['a', 'Speak for yourself. You asked to be a god.'],
      ['b', '…Yes. I suppose I did. And look where it put me. Inside a sword.'],
      ['a', 'Inside a mirror isn\'t much better. We\'re both made of somebody else\'s glass.'],
    ],
  },
  'ganonFSA|shadowLink': {
    C: [
      ['a', 'You failed to bring me the sword.'],
      ['b', 'I brought you four heroes. You didn\'t specify which part of them.'],
      ['a', 'Insolence. From my own shadow.'],
    ],
    B: [
      ['b', 'Why make me, if you only wanted a servant? Soldiers obey better.'],
      ['a', 'A servant who looks like the hero breaks their hearts before their bones. You were a weapon, nothing more.'],
      ['b', 'Funny. I\'ve started having opinions.'],
    ],
    A: [
      ['a', 'You stand with them now.'],
      ['b', 'I stand where I like. That\'s the one thing you didn\'t put in me.'],
      ['a', 'Then I will take it out of you.'],
      ['b', 'You\'re welcome to try. I learned to fight from the best. Four of him.'],
    ],
  },
  'ganonFSA|vaatiHylian': {
    C: [
      ['a', 'You were a cork in a bottle when I found you, wind mage. I pulled you out.'],
      ['b', 'And I blotted out the sky for you. The debt is paid.'],
      ['a', 'Nothing is paid until I say it is.'],
    ],
    B: [
      ['b', 'You let the boy break my palace and did nothing.'],
      ['a', 'I let him tire himself on you. That is what you were for.'],
      ['b', 'Charming. I see why the Gerudo threw you out.'],
    ],
    A: [
      ['a', 'You want power. So do I. The difference is that I take it.'],
      ['b', 'The difference is that I understand it. You only own it.'],
      ['a', 'Owning is enough.'],
      ['b', 'Ownership is just theft that hasn\'t been noticed yet.'],
    ],
    S: [
      ['n', 'Above the Palace of Winds, the sorcerer and the demon king look down on a Hyrule under a black sky.'],
      ['b', 'If we stopped trying to kill each other, we could hold this world forever.'],
      ['a', 'Forever is long, Vaati. Long enough for me to stop needing you.'],
      ['b', 'And for me to stop needing you. So we\'re agreed.'],
      ['a', 'Agreed. Until the boy comes.'],
      ['b', 'Until the boys come.'],
    ],
  },
};
