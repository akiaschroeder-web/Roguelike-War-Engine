// Support conversations: Echoes of Wisdom (part 2: cross-pack pairs — Zelda, Link, Tri, Tekom and Null). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'zelda|zeldaEoW': {
    C: [
      ['a', 'You summon things with a rod. I hid behind a Sheikah disguise for seven years.'],
      ['b', 'Seven years? I only had to hide for a few days before I started copying furniture.'],
      ['a', 'Furniture?'],
      ['b', 'You would be amazed what a well-placed table can do.'],
    ],
    B: [
      ['b', 'Did your Link ever come back from somewhere you couldn\'t follow?'],
      ['a', 'He came back from seven years in the Sacred Realm. Taller. Quieter. The same.'],
      ['b', 'Mine came back from a Rift. The same, too. I\'m starting to think they always are.'],
    ],
    A: [
      ['a', 'Everyone asks us to wait. To be rescued. And every time, we end up doing the rescuing.'],
      ['b', 'Maybe that\'s the secret of the royal family. We are terrible at waiting.'],
      ['a', 'I prefer to call it "wisdom".'],
    ],
    S: [
      ['b', 'If I copied you, I wonder what the Echo would do.'],
      ['a', 'Play the ocarina badly, probably. Then hide.'],
      ['b', 'Then I won\'t. One of you is enough for the world — and I\'d rather have the real one to talk to.'],
      ['a', 'Sisters across time, then.'],
      ['b', 'Sisters across time. And never wait to be rescued again.'],
    ],
  },
  'link|zeldaEoW': {
    C: [
      ['a', 'You\'re a princess who fights with monsters. Mine fights with a harp.'],
      ['b', 'A harp? How does that work?'],
      ['a', 'She plays it. Things get better. I don\'t really understand it either.'],
    ],
    B: [
      ['b', 'My Swordfighter Form borrows a Link\'s power. Do you mind?'],
      ['a', 'Borrow away. Swords are heavy. It\'s nice to share.'],
    ],
    A: [
      ['a', 'You fight like someone who has been alone too long.'],
      ['b', 'A Rift took everyone. For a while I had nobody but Tri.'],
      ['a', 'I know the feeling. Seven years of it. It gets better when they come back.'],
      ['b', 'They do come back, don\'t they?'],
      ['a', 'Every time.'],
    ],
  },
  'heroOfLegend|linkEoW': {
    C: [
      ['a', 'You don\'t talk much either, huh.'],
      ['n', 'The two Links nod at each other with deep satisfaction.'],
    ],
    B: [
      ['a', 'I washed up on an island that turned out to be a dream. You fell into a Rift. Which is worse?'],
      ['b', 'Rift.'],
      ['a', 'Really? Mine had a talking owl.'],
      ['b', '…Dream is worse.'],
    ],
    A: [
      ['a', 'Did you ever wonder if you were just someone else\'s Echo? All of us green-hatted heroes?'],
      ['n', 'Link thinks about it for a long time, then draws the Sword of Might and holds it up to the light.'],
      ['b', 'No. Mine.'],
    ],
    S: [
      ['a', 'Same face, same tunic, same habit of rescuing princesses who could probably rescue themselves.'],
      ['b', 'Probably.'],
      ['a', 'And still, every time, we go.'],
      ['b', 'Always.'],
      ['n', 'They bump fists. Somewhere nearby, a Zelda sighs and rolls her eyes.'],
    ],
  },
  'fi|tri': {
    C: [
      ['b', 'Ooh, you\'re shiny! Are you a spirit too? Are you made of light?'],
      ['a', 'I am Fi, the spirit of the Goddess Sword. There is a 97% probability that you are also a spirit.'],
      ['b', 'Only ninety-seven?'],
      ['a', 'You are very bouncy. It skews my readings.'],
    ],
    B: [
      ['b', 'Do you have friends, Fi? Other spirits like you?'],
      ['a', 'I have a master. Master Link. And I have a purpose.'],
      ['b', 'Those aren\'t the same as friends!'],
      ['a', '…Analysis suggests you may be correct.'],
    ],
    A: [
      ['b', 'You can be my friend! You\'re quiet, and I\'m loud, so it evens out.'],
      ['a', 'I calculate that this arrangement has a 100% chance of being noisy.'],
      ['b', 'Is that a yes?'],
      ['a', 'Yes.'],
    ],
    S: [
      ['a', 'When my purpose is fulfilled, I will sleep inside the sword. For a very long time.'],
      ['b', 'Then I\'ll come and visit. I\'ll tell you about everything that happened while you were asleep.'],
      ['a', 'That would take a great deal of time.'],
      ['b', 'Good! I have lots.'],
      ['a', 'Then I look forward to it. That is… a new feeling. I will call it "friendship" until a better word is found.'],
    ],
  },
  'navi|tri': {
    C: [
      ['a', 'Hey! Listen! You\'re glowing in the wrong colour!'],
      ['b', 'There\'s a right colour?'],
      ['a', 'Blue! Blue is the right colour for a guide!'],
      ['b', 'I\'m yellow and green. I guide things into existence.'],
    ],
    B: [
      ['a', 'Do you have to tell your hero what to do all the time, too?'],
      ['b', 'Zelda mostly tells me what to do. I just say "ooh" a lot.'],
      ['a', 'That sounds restful. My Link never listens.'],
    ],
    A: [
      ['a', 'Listen… do you ever worry they won\'t need us anymore? When the adventure\'s over?'],
      ['b', 'Zelda will always need someone to say "ooh" at her tables.'],
      ['a', '…Link will always need someone to tell him to look up.'],
      ['b', 'See? We\'re safe.'],
    ],
    S: [
      ['a', 'Hey, Tri. Listen. I\'m glad I met you.'],
      ['b', 'Me too! You\'re the bossiest light I know.'],
      ['a', 'That\'s the nicest thing anyone has ever said to me.'],
      ['n', 'Blue and gold, the two little lights circle each other until dawn.'],
    ],
  },
  'ciela|tri': {
    C: [
      ['a', 'You lost your friends, too? To something that eats spirits?'],
      ['b', 'Null. It ate them, and then the Rifts started.'],
      ['a', 'Bellum took my power and my memory. I know how it feels to be missing pieces.'],
    ],
    B: [
      ['b', 'How did you get your pieces back?'],
      ['a', 'One at a time. Each one felt like waking up a little more.'],
      ['b', 'That\'s exactly how it feels when we rescue one of my friends!'],
    ],
    A: [
      ['a', 'I was the Spirit of Courage all along and didn\'t know it. Maybe you\'re more than you think, too.'],
      ['b', 'Zelda says I\'m the Triforce\'s child. I don\'t really know what that means.'],
      ['a', 'It means you were made to make things better. You already do.'],
    ],
    S: [
      ['b', 'When my friends are all home, will you visit the Still World with me?'],
      ['a', 'Only if you visit the Great Sea with me. There are ships, and islands, and a boy with a very silly hat.'],
      ['b', 'Deal! I\'ll copy him a better hat.'],
      ['a', 'Please don\'t. He loves that hat.'],
    ],
  },
  'ezloMinish|tri': {
    C: [
      ['a', 'Bah. Another magical companion. Do you also talk too much?'],
      ['b', 'Probably! Do you?'],
      ['a', 'I talk exactly the right amount. Everyone else listens too little.'],
    ],
    B: [
      ['a', 'You helped your princess copy things. I helped my boy shrink. We both change the shape of the world.'],
      ['b', 'Yours makes things small. Mine makes things exist. Mine is better.'],
      ['a', 'Hmph! Mine has a hat.'],
    ],
    A: [
      ['a', 'My own apprentice cursed me into a cap. You were hunted by the thing that ate your friends. We are survivors, you and I.'],
      ['b', 'Survivors who talk too much.'],
      ['a', '…Exactly the right amount.'],
    ],
  },
  'queenOfFairies|tri': {
    C: [
      ['a', 'A little light from another realm. Come, child. Let me look at you.'],
      ['b', 'You\'re so tall! And so sparkly!'],
      ['a', 'And you are very bright for one so small.'],
    ],
    B: [
      ['b', 'Are you the queen of all the fairies? Even the ones in bottles?'],
      ['a', 'Especially the ones in bottles. Somebody must remind them to come out.'],
      ['b', 'Could you be my queen too? Just a little?'],
    ],
    A: [
      ['a', 'You carry the light of the Triforce. That is a heavy thing for a small spirit.'],
      ['b', 'It doesn\'t feel heavy. It feels like holding someone\'s hand.'],
      ['a', 'Then you understand it better than most kings.'],
    ],
    S: [
      ['a', 'When your friends come home, bring them to my fountain. All of them.'],
      ['b', 'All of them? There are a lot!'],
      ['a', 'Then I shall make the fountain larger. A queen can do that, you know.'],
      ['b', 'You really are my queen.'],
      ['a', 'And you, little light, are my honoured guest. For as long as you like.'],
    ],
  },
  'darkLink|tekom': {
    C: [
      ['b', 'You are a copy of a hero. I am a copy of a princess.'],
      ['a', '…'],
      ['b', 'I take it you are also not much of a talker.'],
    ],
    B: [
      ['a', 'He fought me in a room full of water. I lost. Then I was nothing for a long time.'],
      ['b', 'Null made me, and I lost too. Losing is how I found out I was someone.'],
      ['a', 'Someone.'],
      ['b', 'Yes. Try it. It is less lonely than being a reflection.'],
    ],
    A: [
      ['a', 'If I am someone, what do I do?'],
      ['b', 'Whatever you choose. That is the frightening part, and the best part.'],
      ['a', '…Then I choose to stand next to you. For now.'],
    ],
  },
  'demise|nullEoW': {
    C: [
      ['a', 'You are not a demon. You are less than a demon. You are an absence.'],
      ['b', 'Absence. Yes. I was before demons.'],
      ['a', 'Hah! Then we shall see whose hunger is older.'],
    ],
    B: [
      ['a', 'I swore a curse that my hatred would follow the hero forever. What did you swear?'],
      ['b', 'Nothing. I did not know words. I only knew empty.'],
      ['a', 'Then you are spared a great deal of trouble.'],
    ],
    A: [
      ['b', 'You hate. I hunger. Both are wanting.'],
      ['a', 'Do not compare us, void.'],
      ['b', 'I do not compare. I only notice. Both of us are wanting something we will never have.'],
      ['a', '…Hm. Perhaps the void is wiser than it looks.'],
    ],
    S: [
      ['a', 'The small light has taught you something. I see it in you. A shape where there was none.'],
      ['b', 'She taught me "making". It is better than "eating".'],
      ['a', 'Is it?'],
      ['b', 'Things you make stay. Things you eat are gone. You could make something, Demon King.'],
      ['a', 'Ha… What would I make?'],
      ['b', 'A different ending. Even a curse can be unmade.'],
    ],
  },
  'majorasMask|nullEoW': {
    C: [
      ['a', 'Hee hee! A hole in the world! Can I fall into it? Can I?'],
      ['b', 'You are… loud.'],
      ['a', 'I am fun! Let\'s pull the moon down together!'],
    ],
    B: [
      ['a', 'You swallowed whole kingdoms! That\'s so much more than I ever managed!'],
      ['b', 'It did not feel like "managing". It felt like nothing at all.'],
      ['a', 'Nothing at all? Then what\'s the point?'],
      ['b', 'There was no point. That was the problem.'],
    ],
    A: [
      ['a', 'If there\'s no point to eating the world, then why does it feel so good to break things?'],
      ['b', 'Does it? Or does it feel like the moment before it is over?'],
      ['a', '…Don\'t be so gloomy, hole.'],
    ],
    S: [
      ['b', 'You wanted friends. That is what the moon was for, I think. A game no one could leave.'],
      ['a', 'Who told you that?!'],
      ['b', 'Nobody. I know what it is to have no one. I have someone now. A small light.'],
      ['a', '…Can she play games?'],
      ['b', 'She plays a game called "make a table". It is very long. You may join.'],
      ['a', 'Hee… hee. Fine. But I get to make the moon.'],
    ],
  },
  'calamityGanon|nullEoW': {
    C: [
      ['a', 'MALICE. MALICE CONSUMES.'],
      ['b', 'Consumes. Yes. I know that word.'],
    ],
    B: [
      ['a', 'THE WORLD WILL BE DROWNED IN MALICE.'],
      ['b', 'Then there will be nothing left to drown. I have seen that. It is very quiet.'],
      ['a', '…QUIET.'],
    ],
    A: [
      ['b', 'You are hunger with a shape. As I was. Something taught me another shape.'],
      ['a', 'THERE IS NO OTHER SHAPE.'],
      ['b', 'There is. I am still learning it. It begins with stopping.'],
    ],
  },
};
