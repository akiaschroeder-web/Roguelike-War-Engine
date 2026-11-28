// Support conversations: Echoes of Wisdom (part 1: the pack's own pairs). Not canon.
// This pack's Link barely speaks; most of what he says is in the narration.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'linkEoW|zeldaEoW': {
    C: [
      ['b', 'You came out of the Rift holding your sword the same way you went in. As if no time had passed at all.'],
      ['n', 'Link looks at his hand, then at her, and shrugs.'],
      ['b', 'It was weeks, Link. I copied tables. I copied Moblins. I learned to swing a sword made of your light.'],
      ['a', '…Thank you.'],
    ],
    B: [
      ['b', 'Does it bother you? That my Swordfighter Form is your power, borrowed?'],
      ['n', 'Link shakes his head and taps the hilt of the Sword of Might, then points at her.'],
      ['b', 'You mean it was always going to be shared. That is a very generous way to say "you\'re welcome".'],
    ],
    A: [
      ['n', 'In the Still World, an Echo of Link steps out of the dark. The real one stops dead.'],
      ['b', 'It isn\'t you. I know the difference. I\'d always know.'],
      ['a', 'How?'],
      ['b', 'It doesn\'t hesitate before it swings. You always do, just for a moment, in case you don\'t have to.'],
    ],
    S: [
      ['n', 'The last Rift closes. For the first time in weeks, the sky over Hyrule is only sky.'],
      ['b', 'You rescued me once. I rescued you once. I think that makes us even.'],
      ['n', 'Link thinks about it, and holds up two fingers.'],
      ['b', 'Two? When did you…? Oh. The Wrecked Ship. Fine. I owe you one.'],
      ['a', 'Stay. That\'s enough.'],
      ['n', 'Zelda laughs, and does not let him out of her sight for the rest of the day.'],
    ],
  },
  'tri|zeldaEoW': {
    C: [
      ['a', 'Zelda, Zelda! What\'s this one called? It\'s soft and it\'s square and it has a little pillow!'],
      ['b', 'That\'s an old bed, Tri. You can copy it if you like.'],
      ['a', 'Copied! Oh, I love beds. Can we copy another bed? A softer one?'],
    ],
    B: [
      ['a', 'Every time we fix a Rift, I remember a little more. There were others like me. They were bright.'],
      ['b', 'Your friends. We\'ll find them, Tri. Every one.'],
      ['a', 'You say that like it\'s already true.'],
      ['b', 'If I say it often enough, I make it true. That\'s what the rod is for, isn\'t it? Making things.'],
    ],
    A: [
      ['a', 'Zelda… when all the Rifts are closed, I\'ll have to go back to the Still World.'],
      ['b', 'I know.'],
      ['a', 'Will you remember me? Even if you can\'t copy me?'],
      ['b', 'You aren\'t something I could copy. You\'re the one who taught me how.'],
    ],
    S: [
      ['n', 'Tri glows so brightly that the camp has no need of torches.'],
      ['a', 'All my friends are home. I can feel them, all of them, singing.'],
      ['b', 'Then go and sing with them.'],
      ['a', 'I will. But first I\'m copying you. Not your shape. Just a little of your stubbornness.'],
      ['b', 'Tri. You already have plenty of that.'],
      ['a', 'I know. I got it from you.'],
    ],
  },
  'kingEoW|zeldaEoW': {
    C: [
      ['a', 'They tell me a copy sat on my throne and called you an impostor. I am sorry, my dear.'],
      ['b', 'It wasn\'t you, Father.'],
      ['a', 'No. But it had my face, and it said what I might have said on a bad day. That is what troubles me.'],
    ],
    B: [
      ['a', 'You command soldiers, summon monsters, mend the sky. When did my daughter become a general?'],
      ['b', 'When the general was swallowed by a Rift along with everyone else.'],
      ['a', 'Ha! Wright will never forgive you for saying so. I shall tell him at dinner.'],
    ],
    A: [
      ['a', 'When I was in the Still World, everything was very quiet. I could not tell how long it lasted.'],
      ['b', 'It was long enough.'],
      ['a', 'I kept thinking of you as a little girl, copying my signature on the castle letters. You were always good at copies.'],
      ['b', 'I was always good at getting into trouble for them.'],
    ],
    S: [
      ['a', 'Hyrule will need a queen one day. I used to fear that day.'],
      ['b', 'And now?'],
      ['a', 'Now I fear only that I will not live to see how very good at it you will be.'],
      ['b', 'Then you\'ll have to stay out of Rifts, Father.'],
      ['a', 'A royal decree. I shall obey it gladly.'],
    ],
  },
  'impaEoW|zeldaEoW': {
    C: [
      ['a', 'Princess. You have mud on your boots, a Moblin\'s Echo on your heels and a hole in your cloak.'],
      ['b', 'Good morning to you too, Impa.'],
      ['a', 'Sit. The cloak first, then the scolding.'],
    ],
    B: [
      ['b', 'You hid me when the castle turned. You never told me how you knew it was a copy on the throne.'],
      ['a', 'Your father always says "my dear" before he says your name. The copy didn\'t.'],
      ['b', 'That\'s all?'],
      ['a', 'That is everything. Small things are what people are made of.'],
    ],
    A: [
      ['a', 'You fight with your head down, like a soldier. Your mother fought with her head up.'],
      ['b', 'You knew her well.'],
      ['a', 'I served her before you were born. You have her stubbornness and her hands, and your own courage.'],
    ],
    S: [
      ['a', 'I am old, Princess. One day you will look round for me, and I will not be standing behind you.'],
      ['b', 'Then I\'ll copy you. A small old woman with a cane, scolding me about mud.'],
      ['a', 'It would not be the same.'],
      ['b', 'No. I\'d only keep it so I could hear "Princess" in your voice. Stay as long as you can, Impa.'],
      ['a', '…As long as I can.'],
    ],
  },
  'dohna|zeldaEoW': {
    C: [
      ['a', 'A princess who spawns monsters. I have met sand spirits more convincing.'],
      ['b', 'Shall I summon one for you? I learned a very nice Caromadillo yesterday.'],
      ['a', '…Hm. You have a sense of humour. That is not nothing.'],
    ],
    B: [
      ['a', 'In the Sanctum you put a boulder between me and Mogryph without being asked.'],
      ['b', 'You were busy. I wasn\'t.'],
      ['a', 'The Gerudo do not forget a shield. Even a strange one.'],
    ],
    A: [
      ['a', 'I doubted you. Openly. In front of my chief.'],
      ['b', 'You were right to. I doubted me too, for a while.'],
      ['a', 'Then we are both wiser now. Walk ahead, Princess. I have your back.'],
    ],
  },
  'conde|zeldaEoW': {
    C: [
      ['a', 'Small princess. Cold out. Here — scarf.'],
      ['b', 'Condé, this scarf is bigger than I am.'],
      ['a', 'Good. Warm all over, then.'],
    ],
    B: [
      ['b', 'Why do you clear the paths, Condé? Nobody comes up the mountain in a blizzard.'],
      ['a', 'Somebody might. If path is clear, they get home.'],
      ['b', 'That is the kindest reason for anything I have ever heard.'],
    ],
    A: [
      ['n', 'Zelda summons an Echo of a soft bed in the middle of a snowfield. Condé stares at it.'],
      ['a', 'You make beds. From nothing.'],
      ['b', 'You make paths from snow. It\'s the same, really. Making a place where someone can rest.'],
      ['a', '…Yes. Same.'],
    ],
    S: [
      ['a', 'When the Rifts are gone, princess goes back to castle. Condé goes back to mountain.'],
      ['b', 'The castle has a very cold north tower. It could use someone with a shovel.'],
      ['a', 'You offer Condé a job?'],
      ['b', 'I offer Condé a home. The job is just so you don\'t feel strange about it.'],
      ['n', 'Condé is quiet for a long moment, and then very carefully picks her up and hugs her.'],
    ],
  },
  'tekom|zeldaEoW': {
    C: [
      ['a', 'You look at me as though I were a mirror that talks.'],
      ['b', 'You look at me as though I were the copy.'],
      ['a', 'Perhaps we are both right. That is the trouble with Null\'s work.'],
    ],
    B: [
      ['a', 'I remember your childhood. Your father\'s study. The smell of the library. None of it happened to me.'],
      ['b', 'Then make your own. Something that only happens to you.'],
      ['a', 'Such as?'],
      ['b', 'You could start by choosing a name you like better than mine.'],
    ],
    A: [
      ['a', 'I chose one. "Tekom". It is what the Rift called me. I would rather keep a name I earned than borrow one.'],
      ['b', 'That sounds like something I would say.'],
      ['a', 'Yes. But I said it first.'],
    ],
  },
  'linkEoW|lueburry': {
    C: [
      ['b', 'Hold still, young man! I only need one strand of the power in your sword. Just one!'],
      ['n', 'Link holds still. Lueburry pokes him with a crystal.'],
      ['b', 'Fascinating! Absolutely fascinating! Do you know you hum when you are charged with Might?'],
    ],
    B: [
      ['b', 'The Might Crystals take their shape from you. It is as if the land remembers every swordsman who wore green.'],
      ['a', '…All of them?'],
      ['b', 'All of them, my boy. You are a very long story.'],
    ],
    A: [
      ['b', 'I gave your power to the princess while you were gone. I hope that was not presumptuous.'],
      ['n', 'Link shakes his head firmly and claps the old man on the shoulder.'],
      ['b', 'Ah. Good. I did lie awake about it.'],
    ],
    S: [
      ['b', 'I have written it all down, you know. Every crystal, every measurement. One day another scholar will read it.'],
      ['a', 'And?'],
      ['b', 'And they will know a boy fell into a Rift, and the whole kingdom kept a little of his courage until he came home.'],
      ['n', 'Link is quiet for a while, and then asks Lueburry to read him the first page.'],
    ],
  },
  'generalWright|ministerLefte': {
    C: [
      ['a', 'Lefte, your plan has seventeen steps. A charge has one.'],
      ['b', 'Your charges have one step, General, and then I write seventeen letters of apology.'],
    ],
    B: [
      ['b', 'You obeyed the false king. So did I. Neither of us noticed.'],
      ['a', 'I noticed. I just did not trust myself to say it.'],
      ['b', '…That is worse, Wright.'],
      ['a', 'I know. Next time, I say it. You may hold me to that.'],
    ],
    A: [
      ['b', 'I have drawn up a plan for the next Rift. Step one: General Wright charges.'],
      ['a', 'And step two?'],
      ['b', 'Steps two to seventeen are what we do while you are charging. You are, it turns out, a very good distraction.'],
    ],
    S: [
      ['a', 'When this is over, the king will want a new council. He will want you on it.'],
      ['b', 'He will want us both on it. Someone must keep you from charging the treasury.'],
      ['a', 'And someone must keep you from writing seventeen steps for breakfast.'],
      ['b', 'Then we are agreed. A partnership.'],
      ['a', 'A formation, Lefte. Of two.'],
    ],
  },
  'generalWright|impaEoW': {
    C: [
      ['a', 'Madam, a woman of your years should be at the rear with the baggage.'],
      ['b', 'General, a man of your helmet should be at the front with the Moblins. I will catch up.'],
    ],
    B: [
      ['a', 'You were faster than my scouts. And quieter. And you hit harder than my sergeants.'],
      ['b', 'You may say "I was wrong", General. It is good for the lungs.'],
      ['a', '…I was wrong.'],
    ],
    A: [
      ['a', 'Would you train my soldiers? They could use a lesson from the Sheikah.'],
      ['b', 'They could use a lesson in humility first. I shall give them that free of charge.'],
    ],
  },
  'chiefSeera|dohna': {
    C: [
      ['a', 'You followed the princess into the sand without orders, Dohna.'],
      ['b', 'You would have given the order. I saved you the breath.'],
      ['a', 'Hm. Next time, save me the worry instead.'],
    ],
    B: [
      ['b', 'When Gerudo Town vanished into the Rift, you did not weep. Everyone saw.'],
      ['a', 'A chief weeps later. When there is time.'],
      ['b', 'There is time now, Seera. Nobody is watching but me.'],
    ],
    A: [
      ['a', 'The Sanctum is safe. The town is back. My people look to you as much as to me now.'],
      ['b', 'They look to me because I stand next to you.'],
      ['a', 'Then keep standing there.'],
    ],
    S: [
      ['a', 'One day the Gerudo will need a new chief.'],
      ['b', 'Not for a long time.'],
      ['a', 'Not for a long time. But when it comes, I want it to be someone who follows a princess into a Rift without orders.'],
      ['b', 'You mean someone reckless.'],
      ['a', 'I mean someone brave enough to be wrong, and right often enough to be forgiven. Think on it, Captain.'],
    ],
  },
  'conde|darston': {
    C: [
      ['b', 'Goro! You\'re even bigger than me! How much do you lift?'],
      ['a', 'Snow. Mostly.'],
      ['b', 'Snow! I lift boulders! Want to see?'],
      ['a', '…Yes.'],
    ],
    B: [
      ['b', 'Every time one of our friends gets hit, I feel braver. Is that strange?'],
      ['a', 'No. Condé feels warmer. Same thing, maybe.'],
      ['b', 'Warm and brave! We\'re a good team, goro!'],
    ],
    A: [
      ['b', 'The Volcano is hot and your mountain is cold. If we put them together they\'d be just right.'],
      ['a', 'Cannot move mountain.'],
      ['b', 'No… but we could visit each other! I\'ll bring hot springs water. You bring snow for the drinks.'],
    ],
    S: [
      ['n', 'Halfway between the Volcano and Hebra, two huge figures build a little hut together.'],
      ['b', 'A rest stop! For anyone going from my mountain to yours.'],
      ['a', 'Path is clear both ways now.'],
      ['b', 'Brothers clear paths for each other, goro.'],
      ['a', 'Brothers. Yes.'],
    ],
  },
  'dradd|kushara': {
    C: [
      ['a', 'The Sea Zora always look down on us. Literally! You live downstream!'],
      ['b', 'Dradd, that is how rivers work.'],
      ['a', 'It\'s still rude!'],
    ],
    B: [
      ['b', 'Your drum and my harp. When Vocavor attacked, they kept the same time without either of us trying.'],
      ['a', 'Coincidence.'],
      ['b', 'For an hour?'],
      ['a', '…A long coincidence.'],
    ],
    A: [
      ['a', 'My grandfather quarrelled with your grandmother over a sandbar. Does anybody remember which sandbar?'],
      ['b', 'No. I asked the elders. Nobody knows.'],
      ['a', 'Then what have we been fighting about for three generations?'],
      ['b', 'Being proud, I think.'],
    ],
    S: [
      ['a', 'I\'ve written a new rhythm. It needs a harp.'],
      ['b', 'Then let us play it at the river mouth, where the fresh water meets the salt.'],
      ['a', 'Both peoples listening.'],
      ['b', 'Both peoples dancing, if we play it well.'],
      ['n', 'They play it well. The sandbar, whichever one it was, is forgotten for good.'],
    ],
  },
  'dampeEoW|lueburry': {
    C: [
      ['b', 'Your Automatons run on wind-up springs? Not Might Crystals?'],
      ['a', 'Crystals are flashy. Springs are honest. You always know when a spring is going to run out.'],
    ],
    B: [
      ['b', 'I have an idea. A Might Crystal in the mainspring of a Roboblin.'],
      ['a', 'It would either fight for a week or explode.'],
      ['b', 'Only one way to find out!'],
      ['a', 'We are not finding out in my studio.'],
    ],
    A: [
      ['a', 'All right. I built your crystal spring. In a field, a long way from anything.'],
      ['b', 'And?'],
      ['a', 'It fought for a week. Then it exploded. Beautifully.'],
      ['b', 'Science!'],
    ],
    S: [
      ['b', 'We should write a book together. "Springs and Crystals: A Practical Guide".'],
      ['a', 'Chapter one: do not put a Might Crystal in a Roboblin.'],
      ['b', 'Chapter two: unless you are in a very large field.'],
      ['a', 'You are a terrible influence, old man.'],
      ['b', 'And you, my friend, are a very good one.'],
    ],
  },
  'nullEoW|tri': {
    C: [
      ['n', 'The thing that was Null hangs in the air like a hole. Tri floats up to it, very small.'],
      ['b', 'You ate my friends.'],
      ['a', 'I… ate. I do not remember why. Nothing remembers why.'],
    ],
    B: [
      ['b', 'Zelda says you can\'t help being hungry. I don\'t know if I believe her.'],
      ['a', 'Hunger is all there is, where I come from. Then there was light. Your light. It tasted of… being.'],
      ['b', 'That\'s because it isn\'t for eating. It\'s for making things.'],
    ],
    A: [
      ['a', 'Show me. Making.'],
      ['n', 'Tri glows, and makes a very small, very wobbly table out of nothing at all.'],
      ['a', '…It is a thing that was not. Now it is.'],
      ['b', 'Yes. Isn\'t it nice?'],
      ['a', 'I do not know "nice". I would like to learn.'],
    ],
  },
  'nullEoW|tekom': {
    C: [
      ['a', 'You were my voice in the world. Now you walk with them.'],
      ['b', 'I was your copy of a voice. I would rather speak for myself.'],
    ],
    B: [
      ['a', 'Why do you stay near me, if you have left me?'],
      ['b', 'Because you made me, and somebody should keep an eye on you. Zelda would say it is responsibility.'],
      ['a', 'And what do you say?'],
      ['b', 'I say it is curiosity. I want to know what you become.'],
    ],
    A: [
      ['a', 'I am learning "nice" from the small light. Is it also yours to learn?'],
      ['b', 'It is everyone\'s to learn. Even copies. Even holes in the world.'],
      ['a', 'Then we will learn it together. Two things that were not, and now are.'],
    ],
  },
};
