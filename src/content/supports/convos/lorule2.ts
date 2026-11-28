// Support conversations: A Link Between Worlds (part 2: across the ages). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  // ── Heroes ──
  'heroOfLegend|linkALBW': {
    C: [
      ['a', 'You\'re from Hyrule too. Same castle. Same Kakariko. Same Lost Woods.'],
      ['b', 'Different Lorule, though. Yours was the Dark World.'],
      ['a', 'Mine had more bunnies.'],
    ],
    B: [
      ['b', 'You walked between two worlds with a mirror. I do it with a bracelet and a wall.'],
      ['a', 'Does it hurt?'],
      ['b', 'It tickles. Being flat is strange.'],
    ],
    A: [
      ['a', 'They told stories about me in your time?'],
      ['b', 'They painted you. There\'s a picture of you in the Sanctuary.'],
      ['a', 'Is it a good picture?'],
      ['b', 'You look braver than you are.'],
      ['a', 'Ha! They always do.'],
    ],
    S: [
      ['a', 'Two Links, two Ganons, two Hyrules. It\'s almost like it keeps happening.'],
      ['b', 'Then it keeps needing someone.'],
      ['a', 'Then let\'s both be someone. Swords up?'],
      ['b', 'Swords up.'],
    ],
  },
  'link|linkALBW': {
    C: [
      ['a', 'You hold your sword in your left hand too.'],
      ['b', 'Doesn\'t everyone?'],
      ['a', 'Apparently just us.'],
    ],
    B: [
      ['b', 'You travelled through time. I travelled into walls. Which is worse?'],
      ['a', 'Time. Every time I went back, I was a child again and nobody remembered me.'],
      ['b', 'In the walls nobody can touch me. I think that\'s the same kind of lonely.'],
    ],
    A: [
      ['a', 'The Master Sword chose you, too?'],
      ['b', 'It was in the Lost Woods, waiting. Like it knew.'],
      ['a', 'It always knows. Don\'t let it make you old before your time.'],
    ],
    S: [
      ['n', 'Two heroes sit back to back by a campfire, cleaning the same legendary sword in turn.'],
      ['a', 'You\'ll carry it after me. Many times after me.'],
      ['b', 'Then I\'ll keep it sharp for the next one.'],
      ['a', 'That\'s all any of us can do.'],
    ],
  },
  'linksUncle|ravio': {
    C: [
      ['a', 'A merchant in a rabbit hood? On a battlefield?'],
      ['b', 'A man in his pyjamas with a sword? On a battlefield?'],
      ['a', '…Fair.'],
    ],
    B: [
      ['a', 'My nephew went into the castle alone, the night of the rain. I\'ve always wished I could have done more.'],
      ['b', 'You gave him a sword and a shield. That\'s a very good rental.'],
      ['a', 'It was a gift, rabbit.'],
      ['b', 'Even better!'],
    ],
    A: [
      ['b', 'You\'re very brave, you know. Going in first.'],
      ['a', 'Someone has to.'],
      ['b', 'I always thought someone ELSE had to. You\'re making me reconsider.'],
    ],
  },
  'beedle|ravio': {
    C: [
      ['a', 'Thank you, thank you! A fellow merchant! What do you sell?'],
      ['b', 'Oh, I don\'t sell. I RENT.'],
      ['a', '…Rent? Rent?! That\'s genius!'],
    ],
    B: [
      ['a', 'If someone falls with my merchandise, I lose it. What do you do?'],
      ['b', 'Sheerow flies over and takes it back.'],
      ['a', 'I need a Sheerow.'],
      ['b', 'Nobody gets Sheerow.'],
    ],
    A: [
      ['b', 'Your customers come back because they like you, Beedle.'],
      ['a', 'And yours come back because the items are theirs only until they die.'],
      ['b', 'Loyalty is loyalty!'],
    ],
    S: [
      ['a', 'Partner! I\'ll sell, you rent. Buy-or-rent, one shop, two kingdoms!'],
      ['b', 'Beedle and Ravio\'s Emporium.'],
      ['a', 'Ravio and Beedle\'s.'],
      ['b', 'We can alphabetise.'],
      ['a', 'Deal! Thank you, thank you!'],
    ],
  },
  'ravio|tingle': {
    C: [
      ['b', 'Kooloo-limpah! A bunny! A magic bunny!'],
      ['a', 'I\'m not a magic bunny, I\'m a merchant.'],
      ['b', 'A magic merchant bunny! Tingle wants a map of your shop!'],
    ],
    B: [
      ['b', 'Tingle sells maps. Ravio rents tools. Together we would be… FORTUNATE!'],
      ['a', 'Can I rent a map?'],
      ['b', 'Only Tingle knows where the map goes!'],
      ['a', 'That\'s not how renting works.'],
    ],
    A: [
      ['a', 'You wear green tights in public and nobody laughs at you.'],
      ['b', 'Oh, they laugh! Tingle laughs too! Kooloo-limpah!'],
      ['a', 'Maybe I should take the hood off sometime.'],
    ],
    S: [
      ['b', 'Ravio, Tingle has decided. You are Tingle\'s fairy friend.'],
      ['a', 'I\'m not a fairy, Tingle.'],
      ['b', 'A rental fairy!'],
      ['a', '…I accept. Rental fairy. Fine.'],
      ['b', 'KOOLOO-LIMPAH!'],
    ],
  },
  'linebeck|ravio': {
    C: [
      ['a', 'Linebeck. Captain Linebeck. You may have heard of me.'],
      ['b', 'I haven\'t, but I\'d love to rent you something!'],
      ['a', 'Linebeck doesn\'t RENT. Linebeck owns.'],
    ],
    B: [
      ['a', 'So the hero does the dangerous bits and you collect the fee?'],
      ['b', 'Exactly. Same as you and your boy with the sword.'],
      ['a', '…I like you. You\'re a coward with a business plan.'],
    ],
    A: [
      ['b', 'You went back to save him, didn\'t you? Your hero. At the end.'],
      ['a', 'Who told you that?'],
      ['b', 'Your hands shook when the Phantoms showed up. And you stayed anyway.'],
      ['a', 'Keep that quiet, rabbit.'],
    ],
    S: [
      ['a', 'Two cowards who keep turning up for the hard part. What does that make us?'],
      ['b', 'Bad at running away?'],
      ['a', 'Ha! Partners. It makes us partners.'],
      ['b', 'Linebeck and Ravio. I\'ll rent you the ship back at a discount.'],
      ['a', 'It\'s MY ship!'],
    ],
  },
  // ── Princesses ──
  'hilda|midnaImp': {
    C: [
      ['b', 'Princess of a twilit world, huh? Same. Mine got stolen too.'],
      ['a', 'You are… small.'],
      ['b', 'Cursed. You\'re one to talk about curses, Lorule.'],
    ],
    B: [
      ['a', 'You were willing to use the hero to save your people.'],
      ['b', 'At first. Then he turned out to be worth more than a tool.'],
      ['a', 'I made the same mistake with mine. And Yuga.'],
    ],
    A: [
      ['b', 'You broke your mirror? No — your Triforce?'],
      ['a', 'My ancestors did. To end the wars.'],
      ['b', 'I broke a mirror once. To keep two worlds apart. It\'s not always wrong.'],
    ],
    S: [
      ['b', 'Two princesses of the shadow side. They\'ll write songs about us.'],
      ['a', 'Sad songs.'],
      ['b', 'Nah. We win in the end. It\'s a twilight song. Dark first, then light.'],
      ['a', '…Then sing it with me, Princess of Twilight.'],
    ],
  },
  'hilda|tetra': {
    C: [
      ['b', 'You look like Zelda but sadder.'],
      ['a', 'And you look like Zelda but louder.'],
      ['b', 'Ha! I like you.'],
    ],
    B: [
      ['b', 'I didn\'t know I was a princess until a king told me. Was it like that for you?'],
      ['a', 'I always knew. It never helped.'],
      ['b', 'Then do what I do. Be a pirate first.'],
    ],
    A: [
      ['a', 'Your Hyrule drowned. Mine is crumbling.'],
      ['b', 'And we\'re both still standing on deck. That counts.'],
      ['a', 'Yes. It does.'],
    ],
  },
  'hilda|zeldaMC': {
    C: [
      ['b', 'Are you another Zelda? You look like you\'ve been crying.'],
      ['a', 'I am not a Zelda. I am Hilda of Lorule.'],
      ['b', 'I\'m sorry. I was turned to stone once. I cried a lot after.'],
    ],
    B: [
      ['a', 'You were stone. I was nearly a painting. Lorule\'s magic is not kind.'],
      ['b', 'Neither was Vaati\'s. But we both woke up.'],
      ['a', 'Did your kingdom forgive you for being asleep?'],
      ['b', 'It never blamed me.'],
    ],
    A: [
      ['b', 'Would you come to the Picori Festival? Everyone should see one.'],
      ['a', 'Lorule has not had a festival in a hundred years.'],
      ['b', 'Then we\'ll bring you one!'],
    ],
  },
  // ── Villains ──
  'ganondorf|yuga': {
    C: [
      ['b', 'Ganondorf! In the flesh! Oh, I\'ve so wanted to paint you!'],
      ['a', 'Try, and I will put my sword through your canvas.'],
      ['b', 'Mm. Fierce. I\'ll capture that.'],
    ],
    B: [
      ['a', 'You merged with me. My power, in your ridiculous body.'],
      ['b', 'Ridiculous? Our body was MAGNIFICENT.'],
      ['a', 'You lasted an hour.'],
      ['b', 'A glorious hour.'],
    ],
    A: [
      ['b', 'Why do you always want the Triforce? You could have everything else.'],
      ['a', 'Everything else is what the Triforce is for.'],
      ['b', 'How… boring. I only ever wanted beauty.'],
    ],
    S: [
      ['a', 'You were the only one who ever looked at me and saw art instead of a monster.'],
      ['b', 'You were the only subject who ever looked back at me.'],
      ['a', '…Paint me, then. Once. Without the prison.'],
      ['n', 'The painting takes a week. It is, everyone agrees, terrifying and very good.'],
    ],
  },
  'agahnim|yuga': {
    C: [
      ['a', 'A sorcerer who turns the Sages\' descendants into paintings. Crude. I sealed mine in crystals.'],
      ['b', 'Crystals! How… geometric.'],
      ['a', 'Paintings fade.'],
      ['b', 'Crystals crack.'],
    ],
    B: [
      ['b', 'You also worked for Ganon. Did he ever say thank you?'],
      ['a', 'He devoured my body and used me as a puppet.'],
      ['b', 'Ah. Mine fused with me. I suppose that\'s a thank-you of sorts.'],
    ],
    A: [
      ['a', 'Two wizards in red and purple, serving the same Demon King. We are a tradition.'],
      ['b', 'A tradition of being betrayed by him.'],
      ['a', 'Then let us break it. Together.'],
    ],
    S: [
      ['b', 'Agahnim, will you sit for me?'],
      ['a', 'Without the prison?'],
      ['b', 'Without the prison. Just a portrait. Two sorcerers, finally free of him.'],
      ['a', '…Paint my good side.'],
      ['b', 'Darling, they\'re all good sides.'],
    ],
  },
  'vaatiHylian|yuga': {
    C: [
      ['a', 'You trap people in paintings? I trap them in stone. And caps.'],
      ['b', 'Caps? How quaint. I prefer a gilt frame.'],
      ['a', 'A gilt frame is just a fancy cap.'],
    ],
    B: [
      ['b', 'You and I both want to be more than we were born, Wind Sorcerer.'],
      ['a', 'I was born a Minish. Tiny. Forgettable.'],
      ['b', 'I was born ugly. Same thing.'],
    ],
    A: [
      ['a', 'We\'re vain, you and I.'],
      ['b', 'We\'re discerning.'],
      ['a', 'We\'re vain, Yuga.'],
      ['b', '…We\'re discerningly vain.'],
    ],
    S: [
      ['a', 'If anyone ever tried to shrink you, I would stop them.'],
      ['b', 'And if anyone ever tried to frame you, I would stop them. Unless the frame was very good.'],
      ['a', 'Ha! Fair.'],
      ['b', 'Friends, then. Forbidden ones.'],
    ],
  },
  'ghirahim|yuga': {
    C: [
      ['a', 'Oh, I LOVE the cape. Is it real silk?'],
      ['b', 'Painted silk. Better than real.'],
      ['a', 'Ooh. Ooh, you\'re dangerous.'],
    ],
    B: [
      ['b', 'You serve a Demon King too. Does yours have taste?'],
      ['a', 'My master is the end of all things. Taste is irrelevant.'],
      ['b', 'Taste is never irrelevant, darling.'],
      ['a', '…Agreed, honestly.'],
    ],
    A: [
      ['a', 'You fused with your master. I AM my master\'s sword. We understand each other.'],
      ['b', 'Two works of art, made to be used by brutes.'],
      ['a', 'Then let\'s be used by no one.'],
    ],
  },
  'phantomGanon|yuga': {
    C: [
      ['b', 'A Phantom Ganon! You ride out of paintings!'],
      ['a', '…'],
      ['b', 'A fellow artist. Silent. Brooding. Marvellous.'],
    ],
    B: [
      ['b', 'Whose painting did you come from? I must know the painter.'],
      ['a', '(The phantom points at the far horizon, where a tower once stood.)'],
      ['b', 'A Gerudo master. Of course. The brushwork is unmistakable.'],
    ],
    A: [
      ['b', 'You were made to look like him. To be him, a little. Does it ever feel like you?'],
      ['a', '(The phantom lowers its trident.)'],
      ['b', 'No. It doesn\'t for me either.'],
    ],
    S: [
      ['b', 'Let me paint you, phantom. As yourself. Not as him.'],
      ['a', '(Phantom Ganon kneels, very still, for a very long time.)'],
      ['n', 'The finished portrait shows a tired knight with no face at all, and the phantom keeps it.'],
      ['b', 'There. That one is yours.'],
    ],
  },
  // ── Swordsmen ──
  'gramps|herosShade': {
    C: [
      ['b', 'Your stance is old. Older than you.'],
      ['a', 'So is yours, skeleton.'],
      ['b', '…It is.'],
    ],
    B: [
      ['a', 'Show me a hidden skill, then. I\'ll show you mine.'],
      ['b', 'The Ending Blow. Strike the fallen.'],
      ['a', 'The Cane Swipe. Strike them before they know you\'re armed. Hah!'],
    ],
    A: [
      ['b', 'You teach the boys of Kakariko.'],
      ['a', 'Somebody has to. They swing like brooms.'],
      ['b', 'I taught one boy once. It was enough for a lifetime. And after.'],
    ],
    S: [
      ['a', 'When I go, old ghost, will I come back like you? To teach?'],
      ['b', 'Only if you have regrets.'],
      ['a', 'Hah! Then I\'d better keep teaching while I\'m alive. Save myself the trouble.'],
      ['b', 'Wise. Draw.'],
    ],
  },
  'gramps|swiftbladeFirst': {
    C: [
      ['b', 'A Kakariko swordsman with a cane. I sense a technique.'],
      ['a', 'You\'re a ghost. You sense everything.'],
      ['b', 'Show me the cane.'],
    ],
    B: [
      ['a', 'The Great Spin. You invented it?'],
      ['b', 'I perfected it. Everyone invents a spin. Perfection takes a lifetime.'],
      ['a', 'And a bit after, it seems.'],
    ],
    A: [
      ['b', 'Your spin is wider than mine.'],
      ['a', 'I\'m old. My arms are longer.'],
      ['b', 'That is not how arms work.'],
      ['a', 'It is at my age.'],
    ],
    S: [
      ['n', 'At dawn, a living master and a dead one spin together, and the grass falls in a perfect circle.'],
      ['b', 'Two schools. One circle.'],
      ['a', 'Write it down for the next boy, ghost.'],
      ['b', 'I will carve it in the crypt.'],
    ],
  },
  // ── Witches ──
  'irene|syrup': {
    C: [
      ['b', 'Eh heh heh! A little witch on a broom! Want a potion, dearie?'],
      ['a', 'Grandma? No — you\'re not Grandma. You just laugh like her.'],
      ['b', 'All the best witches laugh like that. Eh heh heh!'],
    ],
    B: [
      ['b', 'Your broom\'s bristles are too short. You\'ll overshoot your landings.'],
      ['a', 'I like overshooting!'],
      ['b', 'Eh heh! So did I, at your age. I flew into a lake. Twice.'],
    ],
    A: [
      ['a', 'Will you teach me potions?'],
      ['b', 'Bring me mushrooms. Lots of mushrooms. Then we\'ll see.'],
      ['a', 'I\'ll fly there and back before you finish laughing!'],
    ],
    S: [
      ['b', 'You remind me of every witch I ever was.'],
      ['a', 'You remind me of Grandma.'],
      ['b', 'Then I\'ll be your grandma when she\'s busy, eh heh heh.'],
      ['a', 'Deal! I\'ll deliver your potions for free.'],
    ],
  },
  'irene|koume': {
    C: [
      ['b', 'Kee hee hee! A baby witch! And a FAST one!'],
      ['a', 'Want to race?'],
      ['b', 'Race a five-hundred-year-old Gerudo witch? Kee hee! You\'re on!'],
    ],
    B: [
      ['b', 'Your flames are pretty, dearie. Pretty and small.'],
      ['a', 'They\'re small because I don\'t want to burn anyone I like.'],
      ['b', 'Kee hee… what a strange idea.'],
    ],
    A: [
      ['a', 'You lost the race, you know.'],
      ['b', 'I let you win!'],
      ['a', 'You were three fields behind.'],
      ['b', 'Kee hee! A strategic three fields!'],
    ],
  },
  'irene|kotake': {
    C: [
      ['b', 'Ho ho ho! A young witch! Is your broom made of ice-oak?'],
      ['a', 'It\'s made of Grandma\'s old broom.'],
      ['b', 'Ho ho! The best kind.'],
    ],
    B: [
      ['b', 'My sister is all fire. You are all speed. Where is your patience, child?'],
      ['a', 'On the ground, mostly. I left it there.'],
      ['b', 'Ho ho ho! Honest, at least.'],
    ],
    A: [
      ['a', 'Can you freeze a whole lake?'],
      ['b', 'With my eyes closed.'],
      ['a', 'Then I\'ll skate on it with my broom!'],
      ['b', 'Ho ho… you\'d better not tell Koume.'],
    ],
  },
  // ── Zora royalty ──
  'oren|ruto': {
    C: [
      ['b', 'A Zora queen with LEGS? How do you swim like that?'],
      ['a', 'Gracefully. Unlike some princesses I could name.'],
      ['b', 'Hmph!'],
    ],
    B: [
      ['a', 'You lost something precious once too, I hear. A stone.'],
      ['b', 'My mother\'s Zora\'s Sapphire. I gave it to a boy.'],
      ['a', 'I lost my Smooth Gem and nearly let a kingdom fall. We are terribly attached to stones, we Zoras.'],
    ],
    A: [
      ['b', 'You\'re a Sage too.'],
      ['a', 'Of Lorule\'s Swamp. And you of Water.'],
      ['b', 'Then we outrank everyone in a wet room!'],
    ],
    S: [
      ['a', 'You will be a fine queen, Ruto. A loud one.'],
      ['b', 'And you\'re a fine queen already. A very loud one.'],
      ['a', 'Ho! Then we shall rule the rivers together. Loudly.'],
      ['b', 'The loudest rivers in Hyrule!'],
    ],
  },
  'mipha|oren': {
    C: [
      ['a', 'Your Majesty. You\'re… very large.'],
      ['b', 'Majestic, child. The word is majestic.'],
      ['a', 'Majestic. Yes.'],
    ],
    B: [
      ['b', 'You heal with water. I command it. Your way is kinder.'],
      ['a', 'Yours can stop a flood. Mine can only clean up after one.'],
      ['b', 'Then let us do both.'],
    ],
    A: [
      ['a', 'Did you ever regret being a Sage? Being bound to a duty?'],
      ['b', 'Every day. And I would choose it again every day.'],
      ['a', 'I think I would too.'],
    ],
    S: [
      ['b', 'You died for your kingdom, little princess. I hear it in your voice.'],
      ['a', 'I would do it again.'],
      ['b', 'Not while I reign over these waters. Stay behind me, Mipha.'],
      ['a', '…Then I\'ll heal you while you stand in front.'],
    ],
  },
  'oren|rutela': {
    C: [
      ['a', 'A Zora queen who became a spirit. Remarkable.'],
      ['b', 'A Zora queen who became a painting. Equally remarkable.'],
      ['a', 'Hmph. I much prefer being solid.'],
    ],
    B: [
      ['b', 'My son carries the weight of my people now.'],
      ['a', 'And mine are carried by me, still. Lorule\'s Zora had no one else.'],
      ['b', 'Then I will lend you my strength, sister queen.'],
    ],
    A: [
      ['a', 'Was it hard to let go of your body?'],
      ['b', 'It was harder to let go of my son.'],
      ['a', 'I would have kept fighting for both.'],
      ['b', 'I did. In my own way.'],
    ],
    S: [
      ['n', 'Two Zora queens stand in the shallows, one shining and one very much alive.'],
      ['a', 'Watch over my rivers, Rutela, when I can\'t.'],
      ['b', 'Always. And you watch over the living, Oren.'],
      ['a', 'Majestically.'],
    ],
  },
  'kingZora|oren': {
    C: [
      ['a', 'Mmm… a Zora queen from the rivers. We are… cousins of a kind.'],
      ['b', 'Very distant cousins. I am considerably more graceful.'],
      ['a', 'Mmm… we shall see.'],
    ],
    B: [
      ['b', 'You lost your daughter to a Sage\'s duty too, didn\'t you?'],
      ['a', 'Mmm… Ruto chose it. She is very stubborn.'],
      ['b', 'We are all very stubborn. It is a Zora trait.'],
    ],
    A: [
      ['a', 'Mmm… would you like a fish?'],
      ['b', 'Is that a royal gift?'],
      ['a', 'Mmm… it is a very good fish.'],
      ['b', '…I accept.'],
    ],
    S: [
      ['b', 'Two monarchs of the water, and neither of us can walk quickly.'],
      ['a', 'Mmm… we needn\'t walk. Our people come to us.'],
      ['b', 'Then let them come to both of us. An alliance of the rivers.'],
      ['a', 'Mmm… and of the fish.'],
    ],
  },
  // ── Mountain folk and smiths ──
  'darunia|rosso': {
    C: [
      ['a', 'You are not a Goron, but you lift like one. Brother!'],
      ['b', 'Ho! Brother! I\'ve always wanted a brother!'],
      ['a', 'Then we wrestle! It is our custom!'],
    ],
    B: [
      ['b', 'Who won that?'],
      ['a', 'I won the first fall. You won the second.'],
      ['b', 'And the third?'],
      ['a', 'We broke the mountain. That counts as a draw.'],
    ],
    A: [
      ['a', 'You were a painting, they say. Trapped by a sorcerer.'],
      ['b', 'It was awful! Couldn\'t lift a thing!'],
      ['a', 'Next time a sorcerer comes for you, he will have to lift ME first.'],
    ],
    S: [
      ['n', 'They sit on Death Mountain\'s summit, tossing boulders into the crater for fun.'],
      ['b', 'Sworn brothers, then?'],
      ['a', 'Sworn brothers! Death Mountain is your home as much as mine.'],
      ['b', 'Ho ho! Two homes! Two brothers! Wonderful!'],
    ],
  },
  'biggoron|rosso': {
    C: [
      ['a', 'A SMALL STRONG MAN. HOW DELIGHTFUL.'],
      ['b', 'Small? Nobody has ever called me small!'],
      ['a', 'EVERYONE IS SMALL, LITTLE FRIEND.'],
    ],
    B: [
      ['b', 'Can I lift your sword?'],
      ['a', 'YOU MAY TRY.'],
      ['n', 'Rosso lifts the Biggoron\'s Sword clear of the ground for nearly a second.'],
      ['a', 'MAGNIFICENT.'],
    ],
    A: [
      ['a', 'YOUR HAMMER NEEDS A BETTER HEAD. I WILL FORGE YOU ONE.'],
      ['b', 'Ho! Will it be enormous?'],
      ['a', 'IT WILL BE APPROPRIATE.'],
      ['b', 'So enormous!'],
    ],
    S: [
      ['a', 'IT IS FINISHED. A HAMMER FOR A SMALL GIANT.'],
      ['b', 'It\'s perfect! It\'s… heavy!'],
      ['a', 'GOOD. THINGS THAT MATTER SHOULD BE HEAVY.'],
      ['b', 'I\'ll carry it forever!'],
    ],
  },
  'loruleanBlacksmith|melari': {
    C: [
      ['b', 'You! Big one! Your bellows are wheezing like a sick Goron.'],
      ['a', 'My partner used to work them. He\'s gone.'],
      ['b', '…Then I\'ll work them. Hold still.'],
    ],
    B: [
      ['a', 'You reforged the Picori Blade? From pieces?'],
      ['b', 'From pieces and spite. You tempered a Master Sword with Lorule ore?'],
      ['a', 'With ore and grief.'],
      ['b', 'Same thing, really.'],
    ],
    A: [
      ['b', 'Your forge is half a ruin.'],
      ['a', 'So is Lorule.'],
      ['b', 'Then we fix the forge first. Then the kingdom. In that order.'],
    ],
    S: [
      ['n', 'A huge smith and a tiny one stand at the same anvil, and the hammer blows ring in time.'],
      ['a', 'My partner would have liked you.'],
      ['b', 'Then I\'m your partner now. Temporarily. Possibly permanently. Pass the tongs.'],
      ['a', '…Thank you.'],
    ],
  },
  'loruleanBlacksmith|smith': {
    C: [
      ['b', 'You work the anvil like my apprentice. Same lean. Same grunt.'],
      ['a', 'Your apprentice is the Hylian boy?'],
      ['b', 'A different one. All the good ones sleep through breakfast.'],
    ],
    B: [
      ['a', 'In Lorule, my partner and I forged together. Then he left to find his wife in Hyrule.'],
      ['b', 'In Hyrule? Then… I think I know him. A big fellow. Bad at goodbyes.'],
      ['a', '…That\'s him.'],
    ],
    A: [
      ['b', 'He\'s well. He talks about you. He talks about the forge he left.'],
      ['a', 'Tell him the fire\'s still lit.'],
      ['b', 'Tell him yourself. The crack in the wall goes both ways.'],
    ],
    S: [
      ['a', 'Two forges, two kingdoms, one sword between them.'],
      ['b', 'Then let\'s make the next one together. Hyrule steel, Lorule ore.'],
      ['a', 'And a little Kakariko stubbornness.'],
      ['b', 'Ha! The most important ingredient.'],
    ],
  },
  'osfala|sahasrahla': {
    C: [
      ['b', 'Osfala. You went into the Desert Palace alone.'],
      ['a', 'I was the hero, Grandfather. I was sure of it.'],
      ['b', 'And?'],
      ['a', '…I was eaten. Mostly.'],
    ],
    B: [
      ['b', 'The Sage\'s confidence is a lamp, not a sword.'],
      ['a', 'You keep saying that.'],
      ['b', 'Because you keep swinging the lamp.'],
    ],
    A: [
      ['a', 'Grandfather, when you found the hero all those years ago, how did you know?'],
      ['b', 'He didn\'t think he was the hero. That was how.'],
      ['a', '…Oh. Oh, I see.'],
    ],
    S: [
      ['b', 'You are a Sage now, Osfala. Not my apprentice. My equal.'],
      ['a', 'I will never be your equal, Grandfather.'],
      ['b', 'There. That doubt is the beginning of wisdom.'],
      ['a', 'Then I\'m very, very wise right now.'],
      ['b', 'Ho ho. Perhaps a little.'],
    ],
  },
  'nabooru|thiefGirl': {
    C: [
      ['a', 'A thief? A good one?'],
      ['b', 'The best in Thieves\' Town.'],
      ['a', 'Ha! I was the best in the desert. Show me your hands.'],
    ],
    B: [
      ['a', 'I stole from Ganondorf. Just to annoy him.'],
      ['b', 'I stole from Yuga. Just to eat.'],
      ['a', 'Yours is the better reason.'],
    ],
    A: [
      ['b', 'They say you\'re a Sage too. A thief Sage.'],
      ['a', 'Sages can be anything. I\'m proof. You\'re proof.'],
      ['b', 'Then let\'s go steal back two kingdoms.'],
    ],
  },
  'fluteBoy|gulley': {
    C: [
      ['a', '(A boy with a flute plays a short tune and smiles.)'],
      ['b', 'Wow! Can you teach me that? I only know how to hammer!'],
      ['a', 'Hammering is a kind of music too.'],
    ],
    B: [
      ['a', 'I was turned into something else in the Dark World. A tree-thing. I couldn\'t play.'],
      ['b', 'I was a painting! I couldn\'t do ANYTHING!'],
      ['a', 'Then we both know how good it is to be ourselves again.'],
    ],
    A: [
      ['b', 'Play the song from the grove again! The one that calls the bird!'],
      ['a', 'It only calls the bird if you mean it.'],
      ['b', 'I always mean it!'],
    ],
    S: [
      ['n', 'In the Lost Woods, a flute plays and a small hammer taps out the rhythm on a stump.'],
      ['a', 'You\'re very good at this.'],
      ['b', 'You\'re a good teacher! Will you play at my dad\'s forge?'],
      ['a', 'Every morning, if he lets me.'],
    ],
  },
  // ── Bosses ──
  'blind|stalblind': {
    C: [
      ['a', 'Heh heh… a headless guardian. You\'re copying me, bones.'],
      ['b', '(The floating skull grins.)'],
      ['a', 'At least you HAVE a head. Somewhere.'],
    ],
    B: [
      ['a', 'You fight with a sword and shield. Honest. I fight with lies.'],
      ['b', '(The skull drifts closer, unimpressed.)'],
      ['a', 'Fine. Lies AND a laser. Better?'],
    ],
    A: [
      ['a', 'Two thieves\' guardians, two worlds. We\'re the same nightmare, you and I.'],
      ['b', '(Stalblind\'s body lifts its shield in salute; the head bows separately.)'],
      ['a', 'Heh… show-off.'],
    ],
    S: [
      ['a', 'If anyone comes for the treasure, which of us gets them?'],
      ['b', '(The skull flies to one door; the body plants itself at the other.)'],
      ['a', 'Both of us, then. Heh heh heh.'],
      ['n', 'Nobody, in either kingdom, ever robs that vault again.'],
    ],
  },
  'gemesaurKing|helmasaurKing': {
    C: [
      ['b', '(The Helmasaur King snorts at the gem-crusted mask.)'],
      ['a', '(The Gemesaur King snorts back, showering the floor with Rupees.)'],
      ['n', 'Neither will look away first.'],
    ],
    B: [
      ['b', '(It rams the wall. A chunk of stone falls.)'],
      ['a', '(It rams the wall harder. Rupees fall.)'],
      ['n', 'Ravio, watching, takes notes on the Rupees.'],
    ],
    A: [
      ['a', '(The Gemesaur King lowers its glittering mask beside the Helmasaur\'s plain iron one.)'],
      ['b', '(The Helmasaur King nudges a gem loose and pushes it back with its snout.)'],
      ['n', 'It is, apparently, a compliment.'],
    ],
  },
  'barinade|gigabari': {
    C: [
      ['a', '(Barinade\'s tentacles crackle.)'],
      ['b', '(The Gigabari hums at the same pitch.)'],
      ['n', 'Every light in the room flickers.'],
    ],
    B: [
      ['a', '(Little Biri drift out of Barinade\'s cloud and settle into the Gigabari\'s glow.)'],
      ['b', '(The Gigabari hums happily.)'],
      ['n', 'Nobody is quite sure whose children they are now.'],
    ],
    A: [
      ['a', '(Barinade and the Gigabari float side by side, sharing a single crackling current.)'],
      ['b', '(When an enemy comes too close, both pulse at once.)'],
      ['n', 'The enemy does not come close again.'],
    ],
  },
};
