// Support conversations: The Wind Waker. Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'heroOfWinds|tetra': {
    C: [
      ['b', 'You\'re standing on my map.'], ['a', 'Sorry.'], ['n', 'Link steps back. Tetra smooths the chart across a barrel.'],
      ['b', 'Hyrule\'s coastline, if you can call it that. Half of these islands aren\'t even drawn yet.'],
      ['a', 'Fishmen know where they are.'], ['b', 'Then the fish can join my crew. Until then, you\'re the one who goes ashore first.'],
      ['a', 'Why me?'], ['b', 'Because you jump off things without thinking. Very useful in a scout.'],
    ],
    B: [
      ['b', 'You kept up today. I didn\'t think you would.'], ['a', 'You told me to.'], ['b', 'I tell Niko to do lots of things.'],
      ['n', 'She tosses him an apple without looking.'], ['b', 'When I was little I used to stand on the crow\'s nest and pretend the sea had an end.'],
      ['a', 'Does it?'], ['b', 'Nobody\'s found it. Which means nobody\'s looked hard enough.'], ['a', 'We could look.'],
    ],
    A: [
      ['b', 'Can I tell you something without you making that face?'], ['a', 'What face?'], ['b', 'That one. The serious one.'],
      ['b', 'Being a princess in a basement under the sea scared me more than any monster. Sitting still. Waiting to be rescued.'],
      ['a', 'You didn\'t wait long.'], ['b', 'No. Because you came and got me.'], ['n', 'Tetra pulls her bandana down over her eyes.'],
      ['b', 'Don\'t let it go to your head, swordboy.'],
    ],
    S: [
      ['b', 'When this war is over, I\'m sailing past the edge of every chart we own.'], ['a', 'I know.'],
      ['b', 'I want a new land. Somewhere nobody\'s buried a kingdom first.'], ['b', 'And I want you on the ship. Not as cargo. As crew.'],
      ['a', 'First mate?'], ['b', 'Don\'t push it.'], ['n', 'She laughs, then holds out her hand. Link takes it.'],
      ['a', 'Wherever you\'re going, I\'m going too.'], ['b', 'Good. Then let\'s go find it together.'],
    ],
  },
  'aryll|heroOfWinds': {
    C: [
      ['a', 'Big brother! You\'re still wearing the green clothes!'], ['b', 'They\'re comfortable.'],
      ['a', 'You complained about them the whole morning of your birthday. You said the hat itched.'], ['b', 'It still itches.'],
      ['n', 'Aryll reaches up and straightens his cap anyway.'], ['a', 'There. Now you look like a real hero. Grandma would be proud.'],
    ],
    B: [
      ['a', 'Link? Can I sleep near your tent tonight?'], ['b', 'Bad dreams?'], ['a', 'Big wings. A cold room with a little window.'],
      ['b', 'He\'s gone. I made sure.'], ['a', 'I know. I just like hearing you breathe. You snore, you know.'],
      ['b', 'I do not.'], ['a', 'Like a pig. Like the big pig back home.'], ['n', 'Link sighs and moves his bedroll closer to hers.'],
    ],
    A: [
      ['a', 'I watched you fight today through my telescope.'], ['b', 'You brought that here?'], ['a', 'Of course. It\'s my lucky one.'],
      ['a', 'You looked so tall. Like someone I didn\'t know.'], ['b', 'It\'s still me.'], ['a', 'I know. You still stuck your tongue out at the Bokoblins.'],
      ['b', 'They started it.'], ['a', 'Just come back after every battle, okay? That\'s all I want.'],
    ],
    S: [
      ['a', 'Do you remember the lookout platform? You used to fall asleep up there instead of keeping watch.'], ['b', 'It was warm.'],
      ['a', 'I\'d count seagulls until you woke up. Then I\'d tell you there were a hundred, even when there were four.'], ['b', 'I knew.'],
      ['a', 'You crossed the whole sea for me, Link.'], ['b', 'I\'d do it again. Every time.'], ['n', 'Aryll throws her arms around him.'],
      ['a', 'When we\'re home, I\'m keeping watch. You can just rest.'],
    ],
  },
  'grandma|heroOfWinds': {
    C: [
      ['a', 'Link, dear. You\'ve got soot on your nose again.'], ['b', 'Grandma, there\'s a battle.'], ['a', 'There\'s always a battle. There\'s only one nose.'],
      ['n', 'She wipes it clean with the corner of her apron.'], ['a', 'Have you eaten anything today besides those dry rations?'],
      ['b', 'Some.'], ['a', 'That means no. Sit. I brought the soup pot.'],
    ],
    B: [
      ['a', 'I made that tunic for your birthday, you know. It was meant for one day.'], ['b', 'I know.'],
      ['a', 'One day of dressing up like the old hero. Then home for supper. That was the whole plan.'], ['b', 'Plans changed.'],
      ['n', 'Grandma threads a needle and starts mending a tear in the sleeve.'], ['a', 'So they did. Hold still. The cloth\'s worn thin here.'],
    ],
    A: [
      ['a', 'When you sailed away, I sat at the window every night.'], ['b', 'I\'m sorry.'], ['a', 'Don\'t be. I was angry at the sea, not at you.'],
      ['a', 'Your mother had that look too. Staring at the horizon like it owed her something.'], ['b', 'Did she ever leave?'],
      ['a', 'No. She stayed for you two. But I always wondered what she\'d have found.'], ['b', 'Maybe I\'ll find it for her.'],
    ],
    S: [
      ['a', 'Link, I\'ve decided something.'], ['b', 'Hm?'], ['a', 'When this is over, you\'re not to stay on Outset on my account.'],
      ['b', 'Grandma—'], ['a', 'Hush. You were born with the wind in your hair. I won\'t be the one who cuts it.'],
      ['a', 'Go where you need to. Just send letters. And come home for soup when you\'re tired.'], ['n', 'Link hugs her carefully, as if she might break.'],
      ['b', 'I\'ll always come home.'], ['a', 'I know you will. That\'s why I can let you go.'],
    ],
  },
  'heroOfWinds|kingDaphnes': {
    C: [
      ['b', 'You sail well tonight, Link. You have finally stopped fighting the tiller.'], ['a', 'You stopped telling me to.'],
      ['b', 'Ha! Perhaps we both learned something.'], ['n', 'The red boat rocks gently at its mooring beside the camp.'],
      ['a', 'Does it feel strange? Talking as a boat, then walking as a man?'], ['b', 'Less strange than seeing my kingdom drowned. One grows used to wonders.'],
    ],
    B: [
      ['a', 'Tell me about the castle.'], ['b', 'Which part? The halls, or the people who once filled them?'], ['a', 'The people.'],
      ['b', 'There was a baker by the east gate who sang badly every morning. I never told him to stop.'],
      ['b', 'I remember his voice better than my own council\'s. Funny, what stays with a man.'], ['a', 'I\'d have liked to hear it.'],
      ['b', 'No one will, now. That is the weight I carry.'],
    ],
    A: [
      ['b', 'I asked you to carry a sword that was forged for another boy.'], ['a', 'It fits fine.'],
      ['b', 'Not the sword. The memory. You were asked to inherit a kingdom you never saw.'], ['a', 'I just wanted Aryll back.'],
      ['b', 'Yes. And that is precisely why the gods chose well. You never wanted Hyrule. You wanted your people safe.'],
      ['a', 'Is that wrong?'], ['b', 'It is the only right thing I have heard in a hundred years.'],
    ],
    S: [
      ['b', 'Link. When the time comes, I will not ask you to rebuild Hyrule.'], ['a', 'You won\'t?'],
      ['b', 'An old king clings to old stones. A young man should build on new land.'], ['b', 'Let Hyrule be a story you tell your children. Not a chain.'],
      ['a', 'I\'ll tell it right. The baker, too.'], ['n', 'The King\'s laugh is thick with feeling.'],
      ['b', 'Then it lives on. Thank you, my boy. Truly.'],
    ],
  },
  'heroOfWinds|medli': {
    C: [
      ['b', 'Oh! Link! I didn\'t know you were assigned to this flank too.'], ['a', 'Hi, Medli.'],
      ['b', 'It\'s just like the Earth Temple, isn\'t it? You in front, me holding the light.'], ['a', 'Less dark.'],
      ['b', 'And fewer of those Redeads. I still dream about the screaming.'], ['a', 'You were brave there.'], ['b', 'I was hiding behind your shield!'],
    ],
    B: [
      ['b', 'Do you remember when you carried me across those spikes?'], ['a', 'You were heavier than you look.'],
      ['b', 'Link! That\'s rude! It was the harp!'], ['n', 'She swats him with a wing, laughing.'],
      ['b', 'I was so scared I\'d slow you down. Then you just picked me up like it was nothing.'], ['a', 'You lit the way. Fair trade.'],
    ],
    A: [
      ['b', 'When I played the harp in that chamber and the Master Sword glowed… I felt someone else\'s hands on the strings.'],
      ['a', 'Laruto?'], ['b', 'Yes. And I wasn\'t afraid. Because you were standing right there.'],
      ['b', 'I don\'t think I could\'ve become a Sage alone. I\'d have turned back at the first ghost.'], ['a', 'You wouldn\'t have.'],
      ['b', 'Maybe not. But I\'m glad I didn\'t have to find out.'],
    ],
  },
  'heroOfWinds|makar': {
    C: [
      ['b', 'Ah! Mr. Link! Hello! I\'m not hiding, I\'m practicing!'], ['a', 'Behind a crate?'],
      ['b', 'The acoustics are very good behind crates.'], ['n', 'Makar clutches his violin to his leafy chest.'],
      ['b', 'Everyone keeps calling me the Sage. I\'m mostly just a musician.'], ['a', 'You can be both.'],
    ],
    B: [
      ['b', 'Mr. Link, did you ever want to run away? From the whole hero business?'], ['a', 'Sometimes.'],
      ['b', 'Really? You never look like it.'], ['a', 'I get seasick.'], ['b', 'You sail on a talking boat all day!'],
      ['a', 'I didn\'t say I stopped.'], ['n', 'Makar giggles and plucks a few notes.'], ['b', 'Maybe I\'ll stop being scared later, then. And just do it now.'],
    ],
    A: [
      ['b', 'I played for the Wind Temple this morning. In my head. The whole song, all the way through.'], ['a', 'No mistakes?'],
      ['b', 'Two. But I kept going! Fado would have kept going.'], ['a', 'You don\'t have to be Fado.'],
      ['b', 'I know. That\'s the part that took me longest. I can just be Makar, the Sage who sometimes hides behind crates.'],
      ['a', 'Good Sage.'], ['b', 'Hee hee! Thank you, Mr. Link!'],
    ],
  },
  'heroOfWinds|komali': {
    C: [
      ['b', 'You. You\'re the one who brought back Grandmother\'s pearl.'], ['a', 'Yes.'],
      ['b', 'I was rude to you then. I locked myself in my room.'], ['a', 'You were sad.'],
      ['b', 'Princes aren\'t supposed to be sad. They\'re supposed to fly. I couldn\'t even do that.'], ['n', 'Komali fluffs his new wings, self-conscious.'],
      ['a', 'You can now.'],
    ],
    B: [
      ['b', 'Link, I froze today. When the Kargaroc dove at us.'], ['a', 'You moved after.'], ['b', 'After you shouted. Not before.'],
      ['a', 'First time I saw a Moblin, I ran into a tree.'], ['b', 'You did not.'], ['a', 'Ask Tetra. She laughed for a week.'],
      ['n', 'Komali almost smiles.'], ['b', 'Then… maybe freezing doesn\'t mean I\'m hopeless.'],
    ],
    A: [
      ['b', 'I flew up to scout the cliffs alone this morning. Nobody told me to.'], ['a', 'How was it?'],
      ['b', 'Terrifying. Wonderful. I found the enemy camp.'], ['a', 'That\'s a prince\'s job.'],
      ['b', 'No. It\'s a Rito\'s job. Father says being a prince comes after being brave.'],
      ['b', 'Thank you, Link. For not laughing at me back on Dragon Roost.'], ['a', 'Never would.'],
    ],
  },
  'heroOfWinds|orca': {
    C: [
      ['b', 'Your feet are too close together, boy.'], ['a', 'Again?'], ['b', 'Always. You fight like you\'re standing in a doorway.'],
      ['n', 'Orca nudges Link\'s heel outward with the butt of his spear.'], ['b', 'There. Now strike the log.'],
      ['a', 'Hyah!'], ['b', 'Better. Still too much shouting.'],
    ],
    B: [
      ['b', 'I taught your grandfather\'s neighbor\'s son once. He quit after a week.'], ['a', 'Why?'],
      ['b', 'He said swords were pointless on an island with no enemies.'], ['b', 'Then the great bird came. And there you were, the only one who\'d trained.'],
      ['a', 'You were right to keep teaching.'], ['b', 'I was stubborn. Sometimes that looks the same.'],
    ],
    A: [
      ['b', 'Show me the parry again. The one you use against the armored knights.'], ['a', 'You want me to teach you?'],
      ['b', 'I am old, not foolish. You\'ve seen battles I only read about.'], ['n', 'Link demonstrates. Orca mirrors it slowly.'],
      ['b', 'Hmph. Elegant. You learned this alone?'], ['a', 'From the ones who almost beat me.'],
      ['b', 'That is the only real teacher. I simply gave you the stance to survive the lessons.'],
    ],
    S: [
      ['b', 'Link. I want you to have this.'], ['n', 'He offers a worn practice sword, its grip wrapped in faded cloth.'],
      ['a', 'This was on your wall.'], ['b', 'My own master gave it to me. I never found a student who deserved it.'],
      ['b', 'I thought I would die on Outset with it still hanging there.'], ['a', 'I\'m honored, Orca.'],
      ['b', 'Bah. Just keep your feet apart. That is all an old man asks.'], ['a', 'Always, Master.'],
    ],
  },
  'heroOfWinds|sturgeon': {
    C: [
      ['b', 'Ah, young man. Have you read the notice I pinned to the supply tent?'], ['a', 'Which one?'],
      ['b', 'The one regarding proper rope maintenance. Or the one regarding Bokoblin migration. Both, ideally.'],
      ['a', 'I read the pictures.'], ['b', 'There are no pictures!'], ['n', 'Sturgeon adjusts his spectacles with great dignity.'],
    ],
    B: [
      ['b', 'Did you know the Great Sea\'s currents run clockwise around the Tower of the Gods?'], ['a', 'I sailed it.'],
      ['b', 'Sailing it and understanding it are different things, boy.'], ['b', 'Understanding is why my brother\'s spear breaks and my notes do not.'],
      ['a', 'Notes can\'t fight.'], ['b', 'No. But they tell the fighter where to stand.'], ['a', '…That\'s fair.'],
    ],
    A: [
      ['b', 'I have written something for you. A small treatise on the islands you\'ve visited.'], ['a', 'For me?'],
      ['b', 'You will forget their names, otherwise. Everyone does. Even heroes.'], ['n', 'He hands over a thin bundle of pages, carefully tied.'],
      ['b', 'Knowledge is a lantern you can pass on without it dimming. Remember that.'], ['a', 'I\'ll read it. Even without pictures.'],
      ['b', '…I may have drawn one or two.'],
    ],
  },
  'heroOfWinds|niko': {
    C: [
      ['b', 'Hey! Hey, new guy! Remember me? The rope swing? The test?'], ['a', 'You made me do it four times.'],
      ['b', 'Five! The first one didn\'t count, you fell in the water!'], ['a', 'You pushed the rope wrong.'],
      ['b', 'That\'s called realism, buddy. Real pirates train hard.'], ['n', 'Niko puffs his chest out, then trips over a coil of line.'],
    ],
    B: [
      ['b', 'So now you\'re a big famous hero, and I\'m still the guy who scrubs the deck.'], ['a', 'You trained me.'],
      ['b', '…I did, didn\'t I? Rope swing, platform, the whole course!'], ['b', 'I basically invented you!'],
      ['a', 'Let\'s not go that far.'], ['b', 'Fine, fine. I basically invented your jumping.'], ['a', 'Okay. That.'],
    ],
    A: [
      ['b', 'I saw you swing across the gap at the fortress today. Perfect form.'], ['a', 'Thanks.'],
      ['b', 'I didn\'t teach you that. You got better than me.'], ['n', 'Niko sits on a barrel, unusually quiet.'],
      ['b', 'It\'s good, I guess. Means I did my job. Even if Miss Tetra never noticed.'], ['a', 'I noticed.'],
      ['b', 'Heh. Yeah. That counts for somethin\'.'],
    ],
  },
  'beedle|heroOfWinds': {
    C: [
      ['a', 'Welcome, welcome! Oh! It\'s my favorite customer! Ring the bell if you need anything!'],
      ['b', 'I\'m standing right here.'], ['a', 'Yes, but the bell makes it official.'], ['n', 'Beedle gestures at a small brass bell nailed to his market stall.'],
      ['b', '…Ding.'], ['a', 'Wonderful! What can I sell you today? Bait? Bombs? Bait-shaped bombs?'],
    ],
    B: [
      ['a', 'You know, I counted. I\'ve met you on forty-one different islands.'], ['b', 'You follow me.'],
      ['a', 'I follow opportunity! It simply wears a green hat.'], ['a', 'Speaking of which, my Member\'s Card points are going to expire if you don\'t buy some bait.'],
      ['b', 'You said that last time.'], ['a', 'And you bought bait last time! Tradition is important.'],
    ],
    A: [
      ['a', 'I stocked a few extra red potions in my bag. For you. No charge.'], ['b', 'You never give anything away.'],
      ['a', 'Shh! Don\'t tell anyone. It would ruin me.'], ['n', 'Beedle presses the bottles into Link\'s hands quickly.'],
      ['a', 'A shopkeeper can\'t have his best customer get hurt. Who would I ring the bell for?'], ['b', 'Thanks, Beedle.'],
      ['a', 'Thank you! Come again! Please come again.'],
    ],
  },
  'heroOfWinds|salvatore': {
    C: [
      ['b', 'Hey, sweetie! You look bored. Wanna play a little game? Sploosh Kaboom! Find my squids!'],
      ['a', 'There\'s a war on.'], ['b', 'Sure, and wars got grids, right? Practically the same thing!'],
      ['n', 'Salvatore unrolls a chart covered in tiny squares.'], ['b', 'Twenty bombs, three squids. First one\'s on the house!'],
    ],
    B: [
      ['b', 'Hey, champ! I watched you aim that cannon today. You got the eye!'], ['a', 'From your game?'],
      ['b', 'Bingo! Everybody says my games are a waste of rupees. Ha! Look at you now!'], ['b', 'I\'m thinkin\' of a new one. Moving targets. Very educational.'],
      ['a', 'You just want my rupees.'], ['b', 'Can\'t a guy want two things?'],
    ],
    A: [
      ['b', 'Truth is, kid, I set up shop to make people laugh. Life on the sea gets heavy.'], ['a', 'It does.'],
      ['b', 'Even you. Especially you. So come play when you need to forget for a minute, okay?'],
      ['n', 'Salvatore slides the bomb tally across without asking for payment.'], ['a', 'B-4.'],
      ['b', 'SPLOOSH! Ha! Gotta try harder than that, sweetie!'],
    ],
  },
  'heroOfWinds|mila': {
    C: [
      ['b', 'What are you staring at? I\'m allowed to scrub pots. Everyone\'s doing chores.'], ['a', 'I didn\'t say anything.'],
      ['b', 'You were thinking it. "Look, the rich girl from Windfall is washing dishes."'], ['a', 'I was thinking you missed a spot.'],
      ['n', 'Mila glares, then scrubs the spot.'],
    ],
    B: [
      ['b', 'You know I took things. Back home. After Papa lost everything.'], ['a', 'I know.'],
      ['b', 'And you never said a word to anyone.'], ['a', 'You stopped.'], ['b', 'Because I got caught! By you, mostly.'],
      ['b', 'Papa gave up his whole fortune to pay my ransom. I didn\'t even thank him properly.'], ['a', 'You still can.'],
    ],
    A: [
      ['b', 'I wrote to Papa. A real letter. With an apology in it.'], ['a', 'How did it feel?'],
      ['b', 'Awful. Then good. He works at the Windfall shop now, did you know? He says he likes it.'],
      ['b', 'I think I\'d like to work too. Earn something that\'s actually mine.'], ['n', 'She holds up a clean pot proudly.'],
      ['b', 'Starting with this. Don\'t laugh.'], ['a', 'It\'s a good pot.'],
    ],
  },
  'ganondorfWW|heroOfWinds': {
    C: [
      ['a', 'You again, boy. Clothed in green, carrying that sword. The costume of a dead legend.'], ['b', 'It\'s a birthday present.'],
      ['a', '…A present.'], ['b', 'From my grandma.'], ['n', 'For a moment Ganondorf seems almost amused.'],
      ['a', 'How fitting. The gods dress their puppets in hand-me-downs.'],
    ],
    B: [
      ['a', 'Do you know whose blood you carry? Whose deeds you inherit?'], ['b', 'Not really.'],
      ['a', 'A hero once sealed me away. And this world drowned for his absence.'], ['b', 'That wasn\'t me.'],
      ['a', 'History does not care who you are, boy. It only cares what you wear.'], ['b', 'Then I\'ll take the hat off.'],
      ['n', 'Ganondorf\'s eyes narrow.'],
    ],
    A: [
      ['a', 'You fight without hatred. I find that tiresome.'], ['b', 'I\'m not fighting your history. Just you.'],
      ['a', 'And what if I am nothing but history? What if there is no "me" beneath it?'], ['b', 'Then that\'s sad.'],
      ['a', 'Sad.'], ['b', 'I got to choose why I sailed. You never did.'],
      ['n', 'The Gerudo king says nothing for a long time.'], ['a', '…Go, boy. Before I decide you are worth hating.'],
    ],
  },
  'heroOfWinds|valoo': {
    C: [
      ['n', 'Valoo coils around the peak above camp, smoke curling from his nostrils.'], ['b', 'Rrrrohhh…'],
      ['a', 'Hello, Valoo.'], ['n', 'The dragon lowers his great head until his eye is level with Link.'],
      ['n', 'He snorts. Warm air ruffles Link\'s hair and knocks his cap off.'], ['a', 'Thanks. I think.'],
    ],
    B: [
      ['n', 'Link sits on a ledge beside Valoo\'s tail, the one Gohma once tormented.'], ['a', 'Does it still hurt?'],
      ['b', 'Hrrmm.'], ['n', 'Valoo curls the tail gently around the ledge, as if to show it healed.'],
      ['a', 'I was scared the whole time I was in your mountain.'], ['n', 'The dragon gives a low rumble that sounds a lot like laughter.'],
    ],
    A: [
      ['n', 'At dawn, Valoo lays a single shed scale at Link\'s feet. It is warm as a hearthstone.'], ['b', 'Rrroohh.'],
      ['a', 'For me?'], ['n', 'Valoo turns his gaze west, toward the open sea, and then back.'],
      ['a', 'You want me to keep going.'], ['n', 'The dragon breathes a slow ring of smoke, ancient and patient.'],
      ['a', 'I will. Thank you, Valoo.'],
    ],
  },
  'heroOfWinds|jabun': {
    C: [
      ['n', 'At the edge of the camp\'s cove, an enormous shape breaks the surface. Jabun.'], ['b', 'Hrrrmmmm…'],
      ['a', 'You came all the way from Outset?'], ['n', 'The great fish exhales a misty breath that smells of deep water.'],
      ['n', 'One vast eye regards Link, weighing him.'],
    ],
    B: [
      ['n', 'Jabun speaks in the ancient tongue, rolling and slow. Link does not understand it, but listens anyway.'],
      ['a', 'I gave the pearls to the gods. Like you asked.'], ['b', 'Hmmmm.'], ['a', 'I still don\'t know why they picked me.'],
      ['n', 'Jabun sinks lower, until only his eye is above water, unblinking.'], ['a', 'You don\'t either?'],
    ],
    A: [
      ['n', 'Link wades into the shallows. Jabun rises to meet him.'], ['a', 'I\'m not the old hero. I know that.'],
      ['b', 'Hrrrrm.'], ['n', 'The ancient fish touches Link\'s shoulder with one enormous whisker, like a blessing.'],
      ['a', 'You\'re saying it doesn\'t matter.'], ['n', 'Jabun turns and glides away, the water around Link warm and still.'],
    ],
  },
  'heroOfWinds|queenOfFairies': {
    C: [
      ['b', 'Ohhh, look at you! The little hero who visits my island with arrows that only shoot sticks.'],
      ['a', 'I have fire arrows now.'], ['b', 'Because I gave them to you, darling!'], ['n', 'The Queen of Fairies drifts in a slow circle around his head.'],
      ['b', 'Tell me, why does a boy so small carry so many bottles?'], ['a', 'In case.'],
    ],
    B: [
      ['b', 'I\'ve watched you sleep, you know. You talk.'], ['a', 'I don\'t.'], ['b', 'You said "pig" four times and "Aryll" twice.'],
      ['a', '…That\'s private.'], ['b', 'Mortals are so delightfully strange! You dream of livestock and little sisters!'],
      ['b', 'I dream of nothing at all. I\'m terribly jealous.'],
    ],
    A: [
      ['b', 'In all my centuries, heroes came with swords and hungry eyes. You came with a sister to save.'], ['a', 'Is that different?'],
      ['b', 'Oh, very. Hunger burns out. Love only gets brighter.'], ['n', 'She settles lightly on the brim of his cap.'],
      ['b', 'Keep that, little hero. I\'ll keep the ice arrows coming.'], ['a', 'Thank you.'],
      ['b', 'And stop saying "pig" in your sleep. It\'s distracting.'],
    ],
  },
  'kingDaphnes|tetra': {
    C: [
      ['a', 'Princess Zelda, I believe your crown is still in—'], ['b', 'Tetra. My name is Tetra.'],
      ['a', 'Of course. Forgive an old man\'s habits.'], ['b', 'And I don\'t wear crowns. I wear bandanas. Bandanas don\'t fall off in a storm.'],
      ['n', 'The King strokes his beard to hide a smile.'],
    ],
    B: [
      ['a', 'Your ancestor wore the royal dress every day of her life.'], ['b', 'And look where that got the kingdom.'],
      ['a', 'Tetra…'], ['b', 'I\'m sorry. That was mean.'], ['b', 'But I\'ve run a crew since I was a kid. I gave orders, I took hits. That\'s who I am.'],
      ['a', 'Hm. You remind me of her, you know. She said things I did not wish to hear, too.'],
    ],
    A: [
      ['a', 'I owe you an apology, Tetra. I tried to fit you into a dress made for a world that no longer exists.'],
      ['b', 'It\'s fine. It was a nice dress, really.'], ['a', 'Royalty is not the robe. It is caring for those who depend on you.'],
      ['a', 'And your crew would sail into a storm for you. You need no crown.'], ['n', 'Tetra looks away, embarrassed.'],
      ['b', '…Thanks, Gramps.'], ['a', 'Gramps? Ha! I suppose I have earned that.'],
    ],
  },
  'aryll|tetra': {
    C: [
      ['a', 'Miss Tetra! Can I hold your cutlass? Just for a second?'], ['b', 'Absolutely not.'],
      ['a', 'Can I hold your telescope?'], ['b', 'You have your own telescope.'], ['a', 'Yours is pirate-y.'],
      ['n', 'Tetra sighs and hands it over. Aryll squeals.'],
    ],
    B: [
      ['a', 'Miss Tetra, how did you become a captain?'], ['b', 'My mother was one. Then she wasn\'t around anymore. Someone had to.'],
      ['a', 'Oh… I\'m sorry.'], ['b', 'Don\'t be, kid. I had a whole ship full of idiots who needed me.'],
      ['a', 'I think I\'d want to be a captain too. A nice one. With a pig as first mate.'], ['b', 'Gonzo would be insulted.'],
    ],
    A: [
      ['a', 'You came back for me. At the fortress. You didn\'t have to.'], ['b', 'Yeah, I did.'],
      ['b', 'Your brother would\'ve sunk my ship otherwise.'], ['a', 'That\'s not the real reason.'],
      ['n', 'Tetra crouches to look Aryll in the eye.'], ['b', 'Fine. You were brave, and brave kids deserve rescuing.'],
      ['b', 'When you\'re older, there\'s a spot on my crew. Captain\'s promise.'],
    ],
  },
  'gonzo|tetra': {
    C: [
      ['a', 'Miss Tetra! I polished all the cannons! And the deck! And your boots!'], ['b', 'Gonzo, I was wearing those boots.'],
      ['a', 'I know! You didn\'t even notice!'], ['b', 'I noticed. They squeak now.'],
      ['n', 'Gonzo beams with pride as Tetra squeaks away.'],
    ],
    B: [
      ['a', 'Miss Tetra, I took the blow meant for you today. I wanted to tell you before you heard it from Niko.'],
      ['b', 'Gonzo, you idiot. You\'re bleeding.'], ['a', 'Only a little!'], ['n', 'Tetra rips a strip from her sash and ties it around his arm.'],
      ['b', 'You don\'t get to be a hero without permission. That\'s an order.'], ['a', 'Aye aye, Miss!'],
    ],
    A: [
      ['a', 'I remember when you were knee-high, Miss. Your mother told me to look after you.'], ['b', 'You never said that.'],
      ['a', 'Didn\'t want you thinking you needed a babysitter. You didn\'t, really.'], ['a', 'But I kept the promise anyway.'],
      ['n', 'Tetra is quiet.'], ['b', 'You did a good job, Gonzo. A really good job.'],
    ],
    S: [
      ['b', 'Gonzo. When we sail to the new land, I want you at the helm.'], ['a', 'Me? The helm? Miss Tetra!'],
      ['b', 'Someone has to steer while I yell at everybody.'], ['a', 'I won\'t let you down! I\'ll steer so straight the sea will cry!'],
      ['b', 'That doesn\'t mean anything.'], ['a', 'It means I\'d follow you anywhere, Miss.'],
      ['n', 'Tetra punches his arm, softly for once.'], ['b', 'I know. That\'s why I picked you.'],
    ],
  },
  'niko|tetra': {
    C: [
      ['a', 'Miss Tetra! I made a new training course! Way harder than the rope swing!'], ['b', 'Did you test it?'],
      ['a', '…Define test.'], ['b', 'Did you do it yourself, Niko.'], ['a', 'Not technically. Not all the way.'],
      ['n', 'Tetra drags a hand down her face.'],
    ],
    B: [
      ['a', 'Miss Tetra, am I still the lowest rank on the ship?'], ['b', 'Yes.'], ['a', 'Even below the new kid?'],
      ['b', 'The new kid saved the world, Niko.'], ['a', 'Okay, but I\'ve been here longer!'],
      ['b', 'Then do something that makes me notice.'], ['a', 'Like what?'], ['b', 'Figure it out. That\'s the point.'],
    ],
    A: [
      ['b', 'Niko. You held the rope today while everyone climbed. Even when the deck was on fire.'], ['a', 'Somebody had to!'],
      ['b', 'Nobody told you to.'], ['a', 'Well… no.'], ['b', 'That\'s what I meant. That\'s a pirate.'],
      ['n', 'Niko\'s mouth falls open.'], ['a', 'Does that mean I\'m not lowest rank anymore?'], ['b', 'Don\'t push your luck.'],
    ],
  },
  'medli|tetra': {
    C: [
      ['a', 'Excuse me, Captain Tetra? You\'re… the princess, aren\'t you?'], ['b', 'Who told you that?'],
      ['a', 'The King of Red Lions. He was very excited.'], ['b', 'Of course he was.'],
      ['n', 'Medli bows deeply. Tetra looks horrified.'], ['b', 'Stop that. Please.'],
    ],
    B: [
      ['a', 'Do you ever feel like the role you were given is too big for you?'], ['b', 'Every morning.'],
      ['a', 'Really? You seem so sure of yourself.'], ['b', 'That\'s the trick. You act sure until people believe you.'],
      ['a', 'I was just an attendant. Then suddenly I was a Sage. I didn\'t have time to practice acting.'],
      ['b', 'You don\'t need to act. You already did the hard part.'],
    ],
    A: [
      ['b', 'You chose to be a Sage. I didn\'t choose to be royalty.'], ['a', 'Does that make it harder?'],
      ['b', 'Maybe. But I chose my crew. That\'s my responsibility, and I\'d pick it again.'], ['a', 'Then we\'re the same, really.'],
      ['a', 'We just carry what we love, and try not to drop it.'], ['n', 'Tetra grins.'],
      ['b', 'You\'re smarter than you let on, bird girl.'],
    ],
  },
  'ganondorfWW|tetra': {
    C: [
      ['a', 'So. Princess Zelda.'], ['b', 'Wrong name.'], ['a', 'The blood remembers what you choose to forget.'],
      ['b', 'My blood remembers rum and salt. Try again.'], ['n', 'Ganondorf\'s eyes linger on the triangle at her neck.'],
    ],
    B: [
      ['a', 'You carry the Triforce of Wisdom, girl. You are a piece of a greater design.'], ['b', 'I\'m a pirate.'],
      ['a', 'A pirate who wears the face of a dead princess. A pirate who hid in a sunken basement.'],
      ['b', 'I was hiding from you.'], ['a', 'Precisely. Destiny always finds its way to me.'], ['b', 'Then destiny has bad taste.'],
    ],
    A: [
      ['a', 'Why do you resist? Wisdom, Courage, Power. We were made to complete one another.'],
      ['b', 'You weren\'t made for anything. You just decided you were.'], ['a', 'And you decided you were not.'],
      ['b', 'Exactly. That\'s the difference, Ganondorf. I get to choose. You chose wrong.'],
      ['n', 'He studies her as if seeing her for the first time.'], ['a', '…The wind does blow differently around you.'],
    ],
  },
  'grandma|tetra': {
    C: [
      ['a', 'You must be the captain my grandson keeps mentioning.'], ['b', 'Uh. Yes, ma\'am.'],
      ['a', 'You look half starved. Pirates eat, don\'t they?'], ['b', 'We eat fish. A lot of fish.'],
      ['n', 'Grandma is already ladling out a bowl.'], ['a', 'Not anymore you don\'t. Sit.'],
    ],
    B: [
      ['a', 'You borrowed Link\'s old tunic last night, didn\'t you? It was folded too neatly to be him.'], ['b', 'Mine was soaked.'],
      ['a', 'Keep it. I\'ve got thread for another.'], ['b', 'I can\'t—'], ['a', 'Hush. Everyone who sleeps under my roof gets something warm.'],
      ['b', 'We\'re in a tent.'], ['a', 'My tent counts.'],
    ],
    A: [
      ['b', 'My mom used to make soup like this. Before.'], ['a', 'Then you\'ll come visit Outset when it\'s all done.'],
      ['b', 'Ma\'am, I\'m a pirate. People lock their doors when I come ashore.'], ['a', 'Not my door. Not ever.'],
      ['n', 'Tetra stares into the bowl a long while.'], ['b', '…Can I bring the crew?'], ['a', 'I\'ll need a bigger pot.'],
    ],
  },
  'aryll|grandma': {
    C: [
      ['a', 'Grandma! You came all the way out here?'], ['b', 'Somebody has to make sure you two eat vegetables.'],
      ['a', 'Link doesn\'t eat vegetables.'], ['b', 'Link is about to start.'], ['n', 'Grandma sets down a basket of Outset carrots with a firm thump.'],
      ['a', 'Did you feed the pigs before you left?'], ['b', 'Orca\'s minding them. Heaven help them.'],
    ],
    B: [
      ['a', 'Grandma, Link didn\'t come back to camp until really late tonight.'], ['b', 'I know, sweetheart. I was waiting too.'],
      ['a', 'Do you think he\'s okay?'], ['b', 'He\'s tired and filthy, and he snuck past my tent so I wouldn\'t fuss.'],
      ['n', 'Grandma smiles at the muddy boot prints outside.'], ['b', 'That means he\'s fine. A hurt boy comes straight to his grandma.'],
    ],
    A: [
      ['a', 'When the bird took me, did you cry?'], ['b', 'Every day.'], ['a', 'I\'m sorry.'],
      ['b', 'Don\'t you dare be sorry. You were taken. That\'s not something you did.'],
      ['b', 'I cried, and I made soup, and I waited for both my grandchildren to come home. And you did.'],
      ['n', 'Aryll leans against her shoulder.'], ['a', 'I always knew Link would come.'], ['b', 'So did I, dear. Mostly.'],
    ],
    S: [
      ['a', 'Grandma, I want to learn the soup recipe. The real one.'], ['b', 'The Elixir Soup? My, my.'],
      ['a', 'If Link\'s going to keep adventuring, someone needs to make it when you\'re… when you\'re resting.'],
      ['b', 'Oh, Aryll. You\'ve always been the one who looks after everyone, haven\'t you?'], ['a', 'You taught me.'],
      ['n', 'Grandma takes her hands and squeezes them.'], ['b', 'Then I\'ll teach you this too. First rule: never rush it.'],
      ['a', 'And second?'], ['b', 'Always make enough for one more person than you expect.'],
    ],
  },
  'aryll|medli': {
    C: [
      ['a', 'You\'re the Rito girl from the fortress! You were in the cell next to mine!'], ['b', 'Oh! Yes! Aryll, right?'],
      ['a', 'You used to hum through the wall. It helped me sleep.'], ['b', 'Really? I thought I was annoying everyone.'],
      ['n', 'Aryll grabs both of Medli\'s hands and swings them.'], ['a', 'You weren\'t! You were the best thing in that whole horrible place.'],
    ],
    B: [
      ['a', 'Medli, can you teach me to play the harp?'], ['b', 'Of course! Here, hold it like this.'],
      ['n', 'Aryll plucks a string. It makes a sound like a startled seagull.'], ['a', 'Was that right?'],
      ['b', 'That was… very enthusiastic!'], ['a', 'You\'re being nice.'], ['b', 'I\'m being encouraging. It\'s different!'],
    ],
    A: [
      ['b', 'Aryll, I never told you. In the fortress, I was so scared. Humming was the only thing I could do.'],
      ['a', 'I was scared too. But hearing you meant I wasn\'t alone.'], ['b', 'That\'s why I hummed. For both of us.'],
      ['a', 'You\'re a Sage now. Does that mean you\'re too important to be my friend?'], ['b', 'Never!'],
      ['n', 'Medli wraps a wing around her.'], ['b', 'Sages need friends more than anyone. Trust me.'],
    ],
  },
  'aryll|makar': {
    C: [
      ['a', 'Are you a… walking plant?'], ['b', 'I\'m a Korok! Makar, at your service!'],
      ['a', 'Do you have roots?'], ['b', 'Not since I was a seed!'], ['n', 'Aryll pokes the leaf on his face. Makar wobbles.'],
      ['a', 'It\'s so soft!'], ['b', 'Please be gentle! It\'s my only face!'],
    ],
    B: [
      ['a', 'Makar, do Koroks grow up? Like people do?'], ['b', 'Not exactly. We stay small. Forever and ever.'],
      ['a', 'Forever? That sounds lonely.'], ['b', 'Not really! We have the Great Deku Tree, and each other, and music!'],
      ['a', 'And seeds? Do you plant them?'], ['b', 'Every year! We fly all over the sea planting forests.'],
      ['a', 'Could you plant one on Outset?'], ['b', 'Hee hee! I\'ll ask!'],
    ],
    A: [
      ['b', 'Aryll! I brought you something!'], ['n', 'Makar holds out a tiny sprout in a cracked teacup.'],
      ['b', 'A Korok tree seed. If you plant it on Outset, the forest will remember your island.'], ['a', 'It\'s so small.'],
      ['b', 'So was I, once. Smaller!'], ['a', 'I\'ll water it every day, Makar. I promise.'],
      ['b', 'Then when I fly over, I\'ll know exactly where my friend lives.'],
    ],
  },
  'aryll|fishman': {
    C: [
      ['b', 'Hoy! Small fry! You fed me a piece of bread just now!'], ['a', 'Um. You talk?'],
      ['b', 'Talk? Small fry, I\'m the best gossip on the whole sea!'], ['a', 'Then tell me something!'],
      ['b', 'Heh! A fish never gives away a story for one crumb. Bring two.'], ['n', 'Aryll runs off to find more bread.'],
    ],
    B: [
      ['b', 'Hoy! Ready for a good one? Out by the Spectacle Island, the water\'s so clear you can see the old castle roofs!'],
      ['a', 'The castle under the sea? Link told me about that!'], ['b', 'Hah! Your brother\'s got sharp eyes for a land-walker.'],
      ['a', 'What else is out there?'], ['b', 'An island shaped like a big cabbage. Another one shaped like a goat. Tell no one.'],
      ['a', 'Why not?'], ['b', 'Bad for my business!'],
    ],
    A: [
      ['a', 'Mister Fishman, do you ever get tired of swimming everywhere?'], ['b', 'Hoy… Never been asked that.'],
      ['b', 'I suppose I don\'t. Every wave\'s a new story. Never the same twice.'], ['a', 'I want to see them all one day.'],
      ['b', 'Then I\'ll draw you a chart. A real one. With all my secret spots.'], ['n', 'The fish flaps a fin conspiratorially.'],
      ['b', 'Just remember who told you, small fry.'],
    ],
  },
  'aryll|queenOfFairies': {
    C: [
      ['b', 'A human child! How small! How sticky!'], ['a', 'I\'m not sticky.'], ['b', 'Your fingers are covered in jam.'],
      ['a', '…That was breakfast.'], ['n', 'The Queen of Fairies circles her with great curiosity.'],
      ['b', 'And you wear blue! Like the sky! I approve.'],
    ],
    B: [
      ['b', 'Tell me, little one, why do you human children always look up?'], ['a', 'Because the sky is pretty.'],
      ['b', 'The sea is prettier.'], ['a', 'The sea is where the big bird took me. The sky is where the seagulls live.'],
      ['b', 'Ah. Fear makes favorites. How fascinating!'], ['a', 'You ask lots of questions for a queen.'],
      ['b', 'I\'ve lived a thousand years and never been a child. Someone has to explain it.'],
    ],
    A: [
      ['b', 'Aryll, I have decided something. When you are old and grey, I will still remember you.'], ['a', 'Really?'],
      ['b', 'Few mortals make me laugh. You did, with the jam.'], ['a', 'I\'ll put jam on my fingers forever, then.'],
      ['n', 'The Queen sprinkles a glittering trail of light around her head.'], ['b', 'A blessing, little one. For luck.'],
      ['a', 'Thank you, Fairy Queen. You\'re my favorite queen.'], ['b', 'I am the only queen you know. But I accept!'],
    ],
  },
  'grandma|orca': {
    C: [
      ['a', 'Orca. Still swinging that old spear around, I see.'], ['b', 'Still feeding the island\'s children, I see.'],
      ['a', 'Somebody has to. You only teach them to hit things.'], ['b', 'Somebody has to do that too.'],
      ['n', 'They share a dry, long-practiced look.'],
    ],
    B: [
      ['a', 'You were hard on him, those lessons. I heard him groaning all the way down the hill.'],
      ['b', 'Hard on him, yes. Never cruel.'], ['a', 'He came home with bruises every day.'],
      ['b', 'And he came home every day. That\'s the point of a bruise, ma\'am. You live through it.'],
      ['a', '…I suppose I can\'t argue with that.'], ['b', 'You could. You simply choose not to.'],
    ],
    A: [
      ['a', 'I watched him fight today, Orca. He moved like you taught him.'], ['b', 'Like he taught himself, mostly.'],
      ['a', 'Don\'t be modest at my age. It wastes time.'], ['b', 'Ha! Very well. He moved like me. Only faster.'],
      ['n', 'Grandma smiles, eyes damp.'], ['a', 'Thank you for teaching him. Even when I didn\'t like it.'],
      ['b', 'Thank you for feeding him. A swordsman fights on soup.'],
    ],
  },
  'grandma|sturgeon': {
    C: [
      ['a', 'Sturgeon, you\'ve pinned another notice to my cooking tent.'], ['b', 'It\'s regarding smoke ventilation, madam.'],
      ['a', 'Thank you. Now take it down.'], ['b', 'But the smoke—'], ['a', 'Is from my soup. It\'s supposed to smell like that.'],
      ['n', 'Sturgeon removes the notice with great reluctance.'],
    ],
    B: [
      ['b', 'Do you remember the year the well froze on Outset?'], ['a', 'The year you wrote a treatise about it?'],
      ['b', 'Indeed! Very well received.'], ['a', 'By whom?'], ['b', '…By my brother. He used it to light his pipe.'],
      ['a', 'I remember that winter. The children skated on the pond. Even you.'], ['b', 'I fell eleven times. For science.'],
    ],
    A: [
      ['b', 'I\'ve begun writing a history of Outset Island. I would like your memories in it.'], ['a', 'Mine? Why?'],
      ['b', 'Because you remember things I never noticed. Births. Weddings. Who stayed and who sailed.'],
      ['a', 'That\'s not history, that\'s gossip.'], ['b', 'Madam, gossip is history that hasn\'t been written yet.'],
      ['n', 'Grandma laughs and pulls up a stool.'], ['a', 'Then fetch your quill. This will take a while.'],
    ],
  },
  'orca|sturgeon': {
    C: [
      ['a', 'Brother. You\'ve nailed a sign to my practice dummy.'], ['b', 'It explains the proper use of the dummy.'],
      ['a', 'The proper use is to stab it.'], ['b', 'With correct form. Read the sign.'], ['n', 'Orca stabs the sign.'],
      ['b', 'That was a first edition!'],
    ],
    B: [
      ['b', 'I suppose your spear work was adequate today.'], ['a', 'Adequate.'], ['b', 'Above adequate. Barely.'],
      ['a', 'And your little map of the battlefield was… useful.'], ['b', 'Useful!'], ['a', 'Don\'t make me say it twice.'],
      ['n', 'The brothers stand in stubborn, satisfied silence.'],
    ],
    A: [
      ['a', 'Do you remember when Father said one of us got the brawn and the other the brains?'], ['b', 'He didn\'t say which.'],
      ['a', 'We both assumed.'], ['b', 'We both assumed wrong, I think. You\'re cleverer than you let on.'],
      ['a', 'And you\'re stronger than you look. You carried those books up the ladder every day for thirty years.'],
      ['b', 'Hmph. Perhaps Father simply meant we\'d need each other.'],
    ],
    S: [
      ['b', 'Brother, I\'ve finished my history of Outset.'], ['a', 'Let me guess. I\'m in a footnote.'],
      ['b', 'You\'re in every chapter. Every time the island needed defending, there you were.'],
      ['n', 'Orca takes the book with unusual care.'], ['a', '…I\'ll read it. Slowly.'], ['b', 'I know you will.'],
      ['a', 'And when the war is done, we put the dummy back up. With your sign on it.'], ['b', 'Unstabbed?'],
      ['a', 'Mostly unstabbed.'],
    ],
  },
  'gonzo|orca': {
    C: [
      ['a', 'Hey, old-timer! You use a spear like a mop!'], ['b', 'And you swing a sword like a bucket of fish.'],
      ['a', 'Ha! Ha ha! You\'re funny!'], ['b', 'I\'m serious.'], ['n', 'Gonzo laughs so hard he has to sit down.'],
    ],
    B: [
      ['a', 'Show me that thing you do. The spin with the spear.'], ['b', 'It took me twenty years to learn.'],
      ['a', 'I\'ve got all afternoon!'], ['n', 'Orca demonstrates. Gonzo tries. Gonzo falls over.'],
      ['b', 'Pirates fight with their weight. You lean into everything.'], ['a', 'That\'s how you win bar fights!'],
      ['b', 'This is not a bar.'],
    ],
    A: [
      ['b', 'You took a hit for your captain today without blinking. Where did you learn that?'], ['a', 'Nowhere. I just did it.'],
      ['b', 'That cannot be taught. Believe me, I\'ve tried.'], ['a', 'Huh. You mean I\'ve got some technique?'],
      ['b', 'You have heart. Technique is how you keep it from getting stabbed.'], ['n', 'Orca hands him a practice spear.'],
      ['b', 'Again. Lean less.'],
    ],
  },
  'darknut|orca': {
    C: [
      ['n', 'The captured Darknut sits chained by the training yard, helmet tilted toward Orca\'s drills.'],
      ['b', 'You\'re watching my footwork, knight.'], ['a', '…'], ['n', 'The Darknut shifts its weight, mirroring Orca\'s stance exactly.'],
      ['b', 'Hm. You see it too.'],
    ],
    B: [
      ['b', 'Your thrust comes from the hip. Not the shoulder. Who taught you?'], ['a', 'Hrrmm.'],
      ['n', 'The Darknut traces a slow arc in the dirt with the tip of a stick.'], ['b', 'An old Hyrulean form. Older than my master\'s master.'],
      ['b', 'So that is what you are. A guard of a drowned kingdom.'], ['n', 'The knight lowers its head, almost a bow.'],
    ],
    A: [
      ['n', 'At dawn, Orca and the Darknut spar with wooden blades under the watch of the camp guards.'],
      ['b', 'Again.'], ['a', 'Hrrah.'], ['n', 'The knight disarms him. Orca laughs, a rare sound.'],
      ['b', 'Sixty years with a spear, and a suit of armor teaches me something new.'],
      ['n', 'The Darknut offers the hilt back to him, handle first.'], ['b', 'Thank you, sir knight.'],
    ],
  },
  'gonzo|niko': {
    C: [
      ['a', 'Niko! You tied the sail knots wrong again!'], ['b', 'It\'s a new kind of knot! I invented it!'],
      ['a', 'It came undone in the wind!'], ['b', 'It\'s a… quick-release knot.'],
      ['n', 'Gonzo picks Niko up by the collar and sets him in front of the mast.'], ['a', 'Again. Properly.'],
    ],
    B: [
      ['b', 'Gonzo, why do you always get the important jobs?'], ['a', 'Because I\'m big.'], ['b', 'That\'s it?'],
      ['a', 'And I do them right.'], ['b', 'I could do them right!'], ['a', 'Then show me. Watch the starboard rail tonight.'],
      ['b', 'Really?'], ['a', 'Fall asleep and I\'ll throw you overboard.'],
    ],
    A: [
      ['a', 'You didn\'t fall asleep.'], ['b', 'I told you!'], ['a', 'You spotted the Bokoblin boats before I did.'],
      ['b', 'They were really far away. Like dots. Grumpy dots.'], ['n', 'Gonzo claps him on the back, nearly knocking him over.'],
      ['a', 'I\'m telling Miss Tetra you\'re ready for more watches.'], ['b', 'Gonzo… thanks. Really.'],
    ],
  },
  'beedle|gonzo': {
    C: [
      ['a', 'Welcome, welcome! A pirate customer! Pirates always need things!'], ['b', 'We need forty barrels of fresh water.'],
      ['a', 'Forty! Oh my, oh my. That\'s a wonderful number.'], ['b', 'And we\'re not paying full price.'],
      ['a', 'That\'s a terrible number.'], ['n', 'Beedle\'s smile does not move, but his eyes look pained.'],
    ],
    B: [
      ['b', 'Last time you sold us rope that snapped in a week.'], ['a', 'That was premium rope! Sea-tested!'],
      ['b', 'It was tested once. On the sea. And it snapped.'], ['a', '…I can offer a ten percent discount on replacement rope.'],
      ['b', 'Thirty.'], ['a', 'Fifteen and a free bag of bait.'], ['b', 'We don\'t fish.'], ['a', 'Everyone fishes eventually!'],
    ],
    A: [
      ['a', 'For your crew, I saved the good barrels. The ones that don\'t leak.'], ['b', 'You have barrels that don\'t leak?'],
      ['a', 'Shh! Only for my favorite customers.'], ['b', 'Since when are we your favorite?'],
      ['a', 'Since your captain kept the Bokoblins off my ship last night.'], ['n', 'Gonzo blinks, then grins.'],
      ['b', 'Fine. Full price, this time. Just this once.'], ['a', 'Thank you! Come again!'],
    ],
  },
  'beedle|salvatore': {
    C: [
      ['b', 'Hey, sweetie! You run the shop boat? I run the games! We should team up!'], ['a', 'Team up?'],
      ['b', 'Sure! Folks lose rupees at my game, then they come buy stuff from you to feel better!'],
      ['a', 'That\'s… actually quite clever.'], ['n', 'Beedle rubs his chin, interested despite himself.'],
    ],
    B: [
      ['a', 'You give away prizes. Big ones. That\'s bad business.'], ['b', 'Nah! It\'s great business! People come back to win again!'],
      ['a', 'I give discounts to loyal customers. Points. Cards.'], ['b', 'Points! Ha! Who wants points when you could win a heart piece?'],
      ['a', 'People who like predictable things!'], ['b', 'Predictable is boring, champ.'],
    ],
    A: [
      ['a', 'I tried your idea. A small game at my counter. Guess which hand has the bomb.'], ['b', 'And?'],
      ['a', 'Sales went up by forty percent.'], ['b', 'Hah! See? Fun sells!'],
      ['a', 'I suppose I owe you a commission.'], ['b', 'Just give me one of those member cards. I wanna feel fancy.'],
      ['n', 'They shake on it.'],
    ],
  },
  'beedle|fishman': {
    C: [
      ['b', 'Hoy! You\'re the fella with the shop boat! You anchored on top of my nap spot!'], ['a', 'Oh! I\'m terribly sorry!'],
      ['b', 'Apology accepted. For one bait bag.'], ['a', 'You want to buy bait?'], ['b', 'I want to eat bait. Different thing.'],
      ['n', 'Beedle hands over a bag, bewildered.'],
    ],
    B: [
      ['a', 'You swim everywhere, yes? Do you know where the merchants gather?'], ['b', 'Hoy! Course I do.'],
      ['a', 'Information like that is worth a fortune!'], ['b', 'Two bait bags.'], ['a', 'Deal!'],
      ['b', 'Windfall, every third moon. And watch the rocks off Greatfish. They\'ll tear your hull open.'],
      ['a', 'My hull! Thank you! You\'ve saved my whole business!'],
    ],
    A: [
      ['b', 'Hoy, shopkeep. I\'ve been thinking.'], ['a', 'About bait?'], ['b', 'About maps. I give stories. You sell things.'],
      ['b', 'Together, we could sell route charts to every sailor on the sea.'], ['a', 'Fish-certified charts! Oh, oh, I love it!'],
      ['n', 'They shake on it: a hand and a wet fin.'], ['a', 'Partners, then. I\'ll ring the bell.'],
    ],
  },
  'mila|tetra': {
    C: [
      ['a', 'You\'re the pirate who saved me from the fortress.'], ['b', 'Technically, the boy in green did. I just steered.'],
      ['a', 'Still. Thank you.'], ['b', 'Don\'t thank me. Pirates don\'t do rescues for free.'], ['a', 'What do I owe you?'],
      ['b', 'Peel those potatoes and we\'re even.'], ['n', 'Mila stares at the pile. It is a large pile.'],
    ],
    B: [
      ['a', 'How did you get so… sure of yourself?'], ['b', 'Practice. And yelling at Niko.'],
      ['a', 'I used to just do what Papa said. Then we lost everything and I didn\'t know what to do at all.'],
      ['b', 'So you started stealing.'], ['a', '…You heard about that.'], ['b', 'I\'m a pirate. I hear everything.'],
      ['b', 'Doing something stupid is still deciding for yourself. Now decide something better.'],
    ],
    A: [
      ['a', 'I\'ve decided. When this war ends, I\'m opening a shop in Windfall. My own.'], ['b', 'Not your papa\'s?'],
      ['a', 'Mine. With my name on the sign.'], ['b', 'Good. Then I\'ll come buy things there.'],
      ['a', 'You\'ll pay full price?'], ['b', 'I\'m a pirate.'], ['n', 'Mila laughs, for the first time in a long time.'],
      ['a', 'Fine. Captain\'s discount. Only you.'],
    ],
  },
  'lenzo|mila': {
    C: [
      ['a', 'Young lady! Hold still! The light on your face is perfect!'], ['b', 'Who are you?'],
      ['a', 'Lenzo. I photographed your family\'s house in Windfall, back when…'], ['b', 'When we had a house.'],
      ['n', 'Lenzo lowers his Picto Box awkwardly.'], ['a', 'Ah. Forgive me.'],
    ],
    B: [
      ['a', 'I still have the pictographs, you know. Your old garden. Your father on the balcony.'],
      ['b', 'You kept them?'], ['a', 'I keep everything. It\'s an illness.'], ['b', 'Could I… see them?'],
      ['n', 'Mila looks through the small square images for a long time.'], ['b', 'I was so spoiled then. Look at that dress.'],
      ['a', 'You looked happy.'], ['b', 'I looked bored.'],
    ],
    A: [
      ['b', 'Lenzo, will you take a new pictograph? Of me now?'], ['a', 'With the apron? The sooty face?'],
      ['b', 'Yes. Exactly like this.'], ['n', 'The Picto Box clicks.'],
      ['a', 'There. Not bored at all. Something better.'], ['b', 'What do you see?'],
      ['a', 'Someone who chose her own life. That\'s a much better subject.'],
    ],
  },
  'fishman|lenzo': {
    C: [
      ['a', 'Hoy! What\'s that box you\'re pointing at me?'], ['b', 'A Picto Box! Hold that pose! The fin, yes, the fin!'],
      ['a', 'No one\'s ever wanted my picture.'], ['b', 'A talking fish! Of course I want your picture!'],
      ['n', 'The Fishman puffs himself up, very proud.'],
    ],
    B: [
      ['b', 'I\'m compiling a record of every island. Every person. Every curious creature.'], ['a', 'I can help with that.'],
      ['a', 'Hoy, I\'ve drawn charts for the boy in green. I know every reef, every cove.'],
      ['b', 'You draw? With what? You have fins!'], ['a', 'A fish has his secrets, picture-man.'],
      ['b', 'Fascinating. Simply fascinating.'],
    ],
    A: [
      ['b', 'Look. I\'ve combined them. Your charts and my pictographs.'], ['n', 'A thick album, each page an island with its people beside it.'],
      ['a', 'Hoy… that\'s the whole sea in one book.'], ['b', 'Our book. Your name goes on the front too.'],
      ['a', 'My name?'], ['b', 'What is your name, in fact?'], ['a', 'Heh. Just write "Fishman." Everyone knows who that is.'],
    ],
  },
  'niko|salvatore': {
    C: [
      ['b', 'Hey there, champ! I heard you\'re the guy who invented that rope swing test!'], ['a', 'You heard right!'],
      ['b', 'A fellow game designer! Put \'er there!'], ['a', 'It\'s not a game. It\'s training. Very serious pirate training.'],
      ['b', 'Sure, sure. Does it got prizes?'], ['a', '…It could have prizes.'],
    ],
    B: [
      ['a', 'Okay. New course. Rope swing, then a barrel jump, then you dodge a cannonball.'], ['b', 'A real cannonball?'],
      ['a', 'A coconut. Painted black.'], ['b', 'Ha! I like it! But where\'s the suspense? The drama?'],
      ['b', 'Add a timer. Folks go crazy for a timer.'], ['n', 'Niko scribbles furiously on a scrap of sail.'],
      ['a', 'You\'re not stealing this for your squid game.'], ['b', 'Me? Never! Probably.'],
    ],
    A: [
      ['b', 'Kid, the soldiers are lining up for your course. With my timer. Look at \'em go!'], ['a', 'They\'re actually getting better.'],
      ['b', 'That\'s the secret, champ. Make it fun and people practice without noticing.'], ['a', 'Wow. You\'re kind of a genius.'],
      ['b', 'Shh. Bad for my reputation.'], ['n', 'Niko beams as a soldier sails cleanly over the barrel.'],
      ['a', 'Miss Tetra\'s gonna be so proud.'],
    ],
  },
  'komali|medli': {
    C: [
      ['a', 'Medli! You shouldn\'t be on the front line. You\'re… you\'re a Sage now.'], ['b', 'And you\'re a prince, Komali.'],
      ['a', 'That\'s different.'], ['b', 'How?'], ['a', 'I… don\'t know yet. Just stay close to me.'],
      ['n', 'Medli hides a smile behind her harp.'], ['b', 'All right. But you stay close to me too.'],
    ],
    B: [
      ['a', 'When I was hiding in my room, you\'d leave food outside the door.'], ['b', 'You noticed?'],
      ['a', 'Every day. Apple slices. Cut the way Grandmother used to.'], ['b', 'I asked the cook how she did it.'],
      ['a', 'I never thanked you. I just ate them and cried.'], ['b', 'That was thanks enough.'],
      ['n', 'Komali looks down at his talons, embarrassed.'],
    ],
    A: [
      ['a', 'I flew ahead of the vanguard today. Did you see?'], ['b', 'I saw. I nearly dropped my harp.'],
      ['a', 'I wanted you to see. That\'s… a stupid reason, isn\'t it?'], ['b', 'It\'s not stupid.'],
      ['b', 'When you were little you were scared of heights, Komali. Now look at you.'], ['a', 'I\'m still scared. I just don\'t let it stop me.'],
      ['b', 'That\'s what courage is, I think.'],
    ],
    S: [
      ['a', 'Medli, when you go to the Earth Temple to pray, I\'d like to fly you there.'], ['b', 'Every time?'],
      ['a', 'Every time. If you\'ll let me.'], ['n', 'The wind tugs at their feathers on the cliff edge.'],
      ['b', 'Komali, are you asking what I think you\'re asking?'], ['a', 'I… think so. Yes.'],
      ['b', 'Then yes. Every time. And you\'ll stay and listen to me play?'], ['a', 'I\'d never want to be anywhere else.'],
    ],
  },
  'medli|quill': {
    C: [
      ['b', 'Medli! Post for you! From Dragon Roost!'], ['a', 'You flew all the way out here with one letter?'],
      ['b', 'One letter and fifty-three others. But yours is on top.'], ['a', 'Oh, Quill. You\'re so kind.'],
      ['b', 'Ha! I\'m efficient! Kindness is a side effect.'], ['n', 'He tips his cap and is airborne again in a gust.'],
    ],
    B: [
      ['a', 'Quill, what\'s it like? Flying to all those islands?'], ['b', 'Windy.'], ['a', 'Besides windy!'],
      ['b', 'Ah. Well. Windfall smells like bread in the mornings. Outset has the bluest water. The Forest Haven hums.'],
      ['a', 'It hums?'], ['b', 'Koroks. Hundreds of them, playing little songs. You\'d love it.'],
      ['a', 'I\'ve only ever seen Dragon Roost.'], ['b', 'Then we\'ll have to fix that.'],
    ],
    A: [
      ['b', 'I\'ve mapped you a route, Medli. Every island I fly. When the war\'s over.'], ['a', 'You mean I can come with you?'],
      ['b', 'A Sage ought to know the world she\'s protecting.'], ['n', 'He hands her a small map, stamped with the Rito post seal.'],
      ['a', 'I\'ll go everywhere. Even the stinky islands.'], ['b', 'Especially those! Bring a clothespin.'],
    ],
  },
  'medli|ritoChieftain': {
    C: [
      ['b', 'Medli. You\'ve been neglecting Lord Valoo\'s morning offering.'], ['a', 'There\'s a war, sir.'],
      ['b', 'Lord Valoo does not care about the war. He cares about his breakfast.'], ['a', 'Yes, sir. Sorry, sir.'],
      ['n', 'Medli scurries off with a basket of fish.'],
    ],
    B: [
      ['b', 'You were the most dedicated attendant I ever had, Medli. Even as a fledgling.'], ['a', 'Thank you, sir.'],
      ['b', 'You sang to him when he raged. No one else dared approach.'], ['a', 'He was in pain. I could hear it.'],
      ['b', 'And now you\'re a Sage. I fear I am losing my best attendant to the gods.'], ['a', 'I\'m still yours too, sir.'],
    ],
    A: [
      ['b', 'Medli. I\'ve chosen a new attendant for Lord Valoo. A young one.'], ['a', 'Oh. Of course.'],
      ['b', 'I want you to train her. Teach her the songs.'], ['a', 'Me? Train someone?'],
      ['b', 'Your duty was never just to feed a dragon. It was to care for him. Now you can teach that.'],
      ['n', 'Medli straightens, holding her harp close.'], ['a', 'I won\'t let you down, Chieftain.'],
    ],
  },
  'medli|valoo': {
    C: [
      ['a', 'Lord Valoo! I brought your favorite fish. The spiny ones.'], ['b', 'Rrrooh!'],
      ['n', 'The dragon snaps up the basket whole. Medli laughs.'], ['a', 'That was the basket too, my lord!'],
      ['b', 'Hrrm.'], ['a', 'Yes, I know. It was a nice basket. I\'ll weave another.'],
    ],
    B: [
      ['a', 'He says the camp is too noisy for his naps. He\'d like everyone to whisper.'], ['n', 'Valoo exhales smoke in a dignified huff.'],
      ['a', 'My lord, they\'re soldiers. They don\'t whisper.'], ['b', 'Rrrrohh.'],
      ['a', 'Yes, all right. I\'ll ask. But I won\'t promise.'], ['n', 'The dragon settles his head beside her, content to be listened to.'],
    ],
    A: [
      ['a', 'My lord, do you remember when Gohma hurt your tail? I was so small.'], ['b', 'Hmmmm.'],
      ['a', 'I sat outside the cave every night and played. I didn\'t know if you heard.'],
      ['n', 'Valoo curls his body around the rock where she sits, a wall of warm scales.'], ['b', 'Rrooh.'],
      ['a', 'He says he heard every note. Every single one.'], ['n', 'Medli wipes her eyes with a wing.'],
    ],
    S: [
      ['a', 'I\'m a Sage now, Lord Valoo. I might not always be the one who brings your fish.'], ['b', 'Hrrmm…'],
      ['a', 'But I\'ll always come back. I\'ll play for you at every new moon, for as long as I live.'],
      ['n', 'The great dragon lowers his head and touches his snout to her forehead, very gently.'],
      ['a', 'He says… he says I\'m the only one who ever made him feel like a friend and not a god.'],
      ['b', 'Rrrooohhh.'], ['a', 'You too, my lord. Always.'],
    ],
  },
  'laruto|medli': {
    C: [
      ['n', 'A shimmer of water-light gathers beside Medli\'s tent. A Zora woman stands within it.'],
      ['a', 'You hold my harp well, child of the Rito.'], ['b', 'L-Lady Laruto! I didn\'t know you could come out of the temple!'],
      ['a', 'When the Master Sword wakes, so do we. For a little while.'], ['b', 'I should bow. Should I bow?'],
      ['a', 'Please don\'t. You\'ll drop it.'],
    ],
    B: [
      ['a', 'You played the Earth God\'s Lyric with one note sharp yesterday.'], ['b', 'Oh no! Did the seal weaken?'],
      ['a', 'No. I only noticed because I used to do it too.'], ['b', 'You made mistakes?'],
      ['a', 'Constantly. The sea sages before me despaired of me.'], ['n', 'Laruto\'s laugh ripples like a stream.'],
      ['a', 'I tell you so you\'ll stop clenching your wings every time you play.'],
    ],
    A: [
      ['b', 'Lady Laruto, are you sad that I\'m the Sage now? Instead of you?'], ['a', 'Sad?'],
      ['a', 'I was killed before I could finish my prayers. For a long time, I waited, afraid no one would come.'],
      ['a', 'Then a girl with feathers knocked on my door. I was relieved, Medli. Not sad.'],
      ['b', 'I\'ll do it properly. For both of us.'], ['a', 'You\'ll do it your way. That\'s the only proper way.'],
    ],
    S: [
      ['a', 'My time here grows short, Medli. The temple is calling me back.'], ['b', 'Already?'],
      ['a', 'I wanted to tell you. My people are gone, mostly. But my song lives in you now.'],
      ['n', 'Laruto rests a translucent hand on Medli\'s harp.'], ['a', 'You are my heir. Not by blood. By choice.'],
      ['b', 'I\'ll carry it, Lady Laruto. And one day, I\'ll teach it to someone too.'],
      ['a', 'Then I am content. Play for me, one more time?'], ['n', 'Medli plays. The Zora sage fades with the final note.'],
    ],
  },
  'makar|medli': {
    C: [
      ['a', 'You\'re the Earth Sage! I\'m the Wind Sage! We\'re a set!'], ['b', 'Like teacups!'],
      ['a', 'Exactly like teacups!'], ['n', 'Makar and Medli shake hand and wing, both very pleased.'],
      ['b', 'Do you get nervous before you play in the temple?'], ['a', 'I get nervous before I play anywhere.'],
    ],
    B: [
      ['a', 'Medli, sometimes I wish I were still just the Korok who played at the ceremony.'], ['b', 'Me too. Just the attendant.'],
      ['a', 'Everyone looks at us like we\'re grown-ups now.'], ['b', 'We have to pray at the temples so the sword keeps working.'],
      ['a', 'That\'s a lot for a Korok.'], ['b', 'It\'s a lot for a Rito too.'],
      ['n', 'They sit on a log, the harp and the violin side by side.'],
    ],
    A: [
      ['b', 'Let\'s practice together. Harp and violin.'], ['a', 'Both songs at once? Will that work?'],
      ['b', 'Let\'s find out!'], ['n', 'The two melodies tangle, then find each other. The campfire flickers in time.'],
      ['a', 'Oh! That was nice! That was really nice!'], ['b', 'It feels less heavy when we do it together.'],
      ['a', 'Then let\'s always do it together.'],
    ],
    S: [
      ['a', 'Medli, I made a promise to myself. When the sword is done, I\'ll still come play with you every year.'],
      ['b', 'Every year? Even when you\'re planting seeds?'], ['a', 'I\'ll plant them on the way!'],
      ['b', 'Then I\'ll fly to the Forest Haven every year after that. We\'ll trade.'], ['a', 'Sage friends forever?'],
      ['b', 'Sage friends forever.'], ['n', 'Makar plucks a string. Medli answers it. The song is theirs alone.'],
    ],
  },
  'komali|ritoChieftain': {
    C: [
      ['b', 'Komali. Your posture in the air was sloppy today.'], ['a', 'Yes, Father.'],
      ['b', 'Shoulders back. Wings wide. You are the prince of the Rito.'], ['a', 'Yes, Father.'],
      ['b', 'Do you have anything to say besides "yes, Father"?'], ['a', '…No, Father.'],
      ['n', 'The Chieftain sighs into his beak.'],
    ],
    B: [
      ['a', 'Father, why did you never say anything when I hid in my room?'], ['b', 'I did not know what to say.'],
      ['b', 'Your grandmother always knew. I only knew how to give orders.'], ['a', 'I thought you were ashamed of me.'],
      ['b', 'Ashamed? Komali. I was afraid. I didn\'t want to push you and lose you too.'], ['n', 'The prince stares at his father, stunned.'],
    ],
    A: [
      ['b', 'You led the aerial patrol well today. I watched the entire thing.'], ['a', 'You did?'],
      ['b', 'You held your formation when the Kargarocs scattered the others. That takes nerve.'], ['a', 'I was terrified.'],
      ['b', 'So was I, the first time I led. Your grandmother told me terror means you understand what\'s at stake.'],
      ['a', 'That sounds like something she would say.'], ['b', 'She said a great many things. I should have repeated them sooner.'],
    ],
    S: [
      ['b', 'Komali. When I step down, you will be Chieftain.'], ['a', 'I\'m not ready, Father.'],
      ['b', 'No one is. I was not.'], ['b', 'But you have something I never had: you know what it is to be afraid and fly anyway.'],
      ['n', 'He places a talon on his son\'s shoulder.'], ['b', 'That is what our people will need. Not a perfect leader. A brave one.'],
      ['a', 'I\'ll make you proud.'], ['b', 'You already have, my son.'],
    ],
  },
  'komali|valoo': {
    C: [
      ['n', 'Komali approaches Valoo\'s perch slowly, clutching a fish in both talons.'], ['a', 'L-Lord Valoo. I brought this.'],
      ['b', 'Hrrrm.'], ['n', 'The dragon\'s eye fixes on him. Komali\'s feathers stand on end.'],
      ['a', 'Medli usually does this. I\'ll just… leave it here.'], ['n', 'He drops the fish and flees.'],
    ],
    B: [
      ['n', 'Komali comes back the next morning, and the next. Each day he stands a little closer.'],
      ['a', 'You gave me my wings. You gave every Rito their wings. I never thanked you.'], ['b', 'Rrooh.'],
      ['a', 'I was so frightened of you when you were angry. The whole island shook.'],
      ['n', 'Valoo lowers his head and lets out a quiet rumble, almost apologetic.'], ['a', 'It wasn\'t your fault. I know that now.'],
    ],
    A: [
      ['n', 'Komali lands on Valoo\'s back, wings trembling, and holds on.'], ['a', 'Is this okay?'],
      ['b', 'Hrrrmm.'], ['n', 'The dragon shifts beneath him, careful, and lifts his head into the wind.'],
      ['a', 'I can see the whole camp from here. The whole sea.'], ['n', 'Valoo rumbles, and Komali swears it sounds like a laugh.'],
      ['a', 'Grandmother used to say you were kind. I didn\'t believe her.'],
    ],
    S: [
      ['a', 'Lord Valoo, I\'m going to be Chieftain someday. I\'ll be the one who answers to you.'], ['b', 'Rrooh.'],
      ['a', 'I\'m not afraid of you anymore. I think I\'m only afraid of letting you down.'],
      ['n', 'Valoo coils his long body around the cliff, enclosing the young Rito in a circle of warm scales.'],
      ['n', 'He breathes a single ember into the sky, where it hangs like a star.'], ['a', 'Is that… a promise?'],
      ['b', 'Hrrmmm.'], ['a', 'Then I promise too. I\'ll take care of our people. And of you.'],
    ],
  },
  'komali|quill': {
    C: [
      ['b', 'Your Highness! Wings out, feet tucked! You\'ll catch the updraft better!'], ['a', 'Quill, I\'m trying!'],
      ['b', 'Try with your tail feathers! They\'re the rudder!'], ['n', 'Komali wobbles through a turn and lands hard.'],
      ['a', 'That was terrible.'], ['b', 'That was a landing! Every landing\'s a good landing!'],
    ],
    B: [
      ['a', 'Quill, how do you fly in storms? I saw you deliver mail through that squall.'], ['b', 'The trick is not looking down.'],
      ['a', 'That\'s it?'], ['b', 'And knowing that whoever\'s waiting for that letter is counting on you.'],
      ['b', 'Fear\'s a heavy bag, Highness. Purpose is lighter.'], ['a', 'That\'s very wise.'], ['b', 'I read it on a postcard.'],
    ],
    A: [
      ['a', 'Quill, I flew the patrol in the rain today. I didn\'t look down once.'], ['b', 'I saw! You looked like a real Rito!'],
      ['a', 'You\'ve been watching me all this time, haven\'t you? Even before the war.'],
      ['b', 'Ha! Your grandmother asked me to. Before she passed. She said you\'d need someone to cheer you on.'],
      ['n', 'Komali goes very quiet.'], ['a', 'Thank you, Quill. For keeping your word.'], ['b', 'Postman\'s honor, Highness.'],
    ],
  },
  'quill|ritoChieftain': {
    C: [
      ['a', 'Chieftain! The Windfall mayor sends his greetings. And a complaint about our mailbags.'], ['b', 'What sort of complaint?'],
      ['a', 'They\'re too heavy for his porch.'], ['b', 'Tell him to build a stronger porch.'],
      ['a', 'With respect, sir, he says that\'s what you\'d say.'], ['n', 'The Chieftain sighs heavily.'],
    ],
    B: [
      ['b', 'Quill, how are the supply routes holding?'], ['a', 'Badly, sir. Kargarocs have been diving the eastern lanes.'],
      ['b', 'And the islands?'], ['a', 'Worried. Some haven\'t had news in weeks.'],
      ['b', 'Then the post is as important as the army right now. A letter can steady a village.'], ['a', 'Aye, sir. I\'ll double the flights.'],
    ],
    A: [
      ['b', 'Quill. I\'ve never said it, but the Rito would be nothing without the post.'], ['a', 'Sir?'],
      ['b', 'Our wings keep the islands talking. That is how the sea stays a people and not a scattering of rocks.'],
      ['a', 'I\'ve thought that myself. On long flights.'], ['n', 'The Chieftain sets a new badge on Quill\'s satchel.'],
      ['b', 'Head of the post. Effective immediately.'], ['a', 'Sir! I… I won\'t let them down.'],
    ],
  },
  'dekuTree|makar': {
    C: [
      ['a', 'Hmm-hmm-hmm. Makar, little one. You have forgotten to water the saplings again.'], ['b', 'Ah! Great Deku Tree! I was practicing!'],
      ['a', 'Practicing what, I wonder?'], ['b', '…Hiding from chores.'], ['a', 'Ho ho! Honesty, at least.'],
      ['n', 'Makar scurries off with a watering can bigger than he is.'],
    ],
    B: [
      ['b', 'Great Deku Tree, do the other Koroks resent me? Because I\'m the Sage?'], ['a', 'Resent you? Hmm.'],
      ['a', 'They worried for you when you fell into the Forbidden Woods. They sang for you every night.'], ['b', 'They did?'],
      ['a', 'Out of tune, but sincerely. A Korok is never alone, Makar.'], ['b', 'Even when I\'m far away?'],
      ['a', 'Especially then. Roots run deep.'],
    ],
    A: [
      ['a', 'Makar. Our people need you to lead the seed ceremony this year.'], ['b', 'Me? But I\'m so busy with the temple!'],
      ['a', 'A Sage serves the gods. But a Korok serves the forest. You must be both.'], ['b', 'That sounds like a lot of serving.'],
      ['a', 'Ho ho! It is. But you play the violin every day without being asked. Is that not serving, too?'],
      ['b', 'I… never thought of it like that.'], ['a', 'Then think of it now, little one.'],
    ],
    S: [
      ['b', 'Great Deku Tree, the seed ceremony was beautiful. Did you hear me play?'], ['a', 'Every note, Makar.'],
      ['b', 'The others followed me. They actually followed me!'], ['a', 'Hmm-hmm. Of course they did.'],
      ['a', 'Long after the Master Sword sleeps, they will remember who led them. A Korok who was afraid and played anyway.'],
      ['n', 'A single leaf drifts down and lands in Makar\'s hands.'], ['b', 'I\'ll keep it forever.'],
      ['a', 'Forever is a long time for a Korok. But I believe you.'],
    ],
  },
  'fado|makar': {
    C: [
      ['n', 'A faint, glowing Korok spirit appears beside Makar\'s bedroll.'], ['a', 'Your bowing arm is too stiff, young Makar.'],
      ['b', 'F-Fado! You\'re the old Wind Sage!'], ['a', 'Was. Now you are. And your bowing arm is still too stiff.'],
      ['n', 'Makar squeaks and immediately loosens his elbow.'],
    ],
    B: [
      ['b', 'Fado, were you scared? When you were the Sage?'], ['a', 'Every day. The Wind Temple howls, you know.'],
      ['b', 'It does! It\'s awful!'], ['a', 'I used to play louder to drown it out. It worked, mostly.'],
      ['b', 'And then… the monster came.'], ['a', 'Yes. It did.'], ['n', 'Fado\'s light flickers, then steadies.'],
      ['a', 'But I am not sad you\'re here, Makar. I\'m glad someone came.'],
    ],
    A: [
      ['a', 'You play differently than I did. Faster. More cheerful.'], ['b', 'Is that wrong?'],
      ['a', 'No. The wind changes. So should its song.'], ['b', 'I thought I had to copy you exactly.'],
      ['a', 'Then the song would die with me. A Sage inherits a duty, Makar, not a voice.'],
      ['n', 'Makar plays a bright, bouncing phrase. Fado laughs.'], ['a', 'There it is. That\'s yours.'],
    ],
    S: [
      ['a', 'I must go back soon, Makar. The Master Sword is nearly whole.'], ['b', 'Can\'t you stay? Just a little?'],
      ['a', 'I stayed long enough to see you. That was my wish.'], ['a', 'Will you play the Wind God\'s Aria for me once more?'],
      ['n', 'Makar plays. His bow arm is loose, his tempo his own.'], ['a', 'Wonderful. You are the Wind Sage, Makar. In every way.'],
      ['b', 'I\'ll make you proud, Fado.'], ['a', 'You already have. Goodbye, little one.'],
    ],
  },
  'laruto|makar': {
    C: [
      ['a', 'Ah, the little Korok who carries Fado\'s violin.'], ['b', 'Lady Laruto! You knew Fado?'],
      ['a', 'We were the last two Sages of old Hyrule. We shared many long prayers.'], ['b', 'Was he nice?'],
      ['a', 'Very. And terribly out of tune when he was nervous.'], ['b', 'Hee hee! Me too!'],
    ],
    B: [
      ['b', 'Lady Laruto, what were the Sages like, long ago?'], ['a', 'Ah. Before the flood, there were seven of us. Forest, fire, water, shadow, spirit, light, and the princess besides.'],
      ['b', 'Seven! And now there\'s only two of us!'], ['a', 'The gods sealed what they could. The rest washed away.'],
      ['b', 'That\'s so sad.'], ['a', 'It is. But two are enough to keep the sword bright.'],
    ],
    A: [
      ['b', 'Lady Laruto, do you think Medli and I will be remembered? Like the old Sages?'], ['a', 'Remembered by whom?'],
      ['b', 'I don\'t know. Someone.'], ['a', 'You will be remembered by the forest, little Makar. By every tree you plant.'],
      ['a', 'That is better than any carving in a temple. Fado would have liked that.'],
      ['b', 'Then I\'ll plant a lot of trees.'], ['a', 'Plant one for me, too.'],
    ],
  },
  'fado|laruto': {
    C: [
      ['n', 'Two pale spirits meet at the edge of the camp, one tall and silver, one small and leafy.'],
      ['a', 'Laruto! You\'re here too!'], ['b', 'Fado. Your violin, I hear it, even from the Earth Temple.'],
      ['a', 'Is it still out of tune?'], ['b', 'Only when you\'re nervous.'], ['a', 'Then I\'m nervous all the time!'],
    ],
    B: [
      ['b', 'Do you remember the castle gardens? Before the flood?'], ['a', 'The fountain with the stone fish? Yes!'],
      ['b', 'We practiced there every spring. The princess used to sit and listen.'], ['a', 'She always clapped too early.'],
      ['b', 'Ha! She did. Bless her.'], ['n', 'The two spirits fall quiet, remembering.'],
    ],
    A: [
      ['a', 'Laruto, I never told you. When I heard you were gone… I couldn\'t play for days.'], ['b', 'Fado.'],
      ['a', 'Then the monster came for me too. And I was glad, a little, that I\'d see you again.'],
      ['b', 'Oh, my friend. You shouldn\'t have been glad.'], ['a', 'I know. But I was.'],
      ['n', 'Laruto rests her glowing hand on his small head.'], ['b', 'Well. Here we are again.'],
    ],
    S: [
      ['b', 'Fado. When the Master Sword is restored, we\'ll fade for good. Are you afraid?'], ['a', 'A little.'],
      ['a', 'But we have heirs now. A Rito girl and a Korok boy. That\'s not a bad ending.'],
      ['b', 'No. It\'s a good one.'], ['a', 'Will you play with me, one last time? Harp and violin?'],
      ['n', 'Their ghostly music drifts through the sleeping camp. Medli and Makar wake, and listen.'],
      ['b', 'Thank you, Fado. For being my friend through all of it.'], ['a', 'Always, Laruto. Always.'],
    ],
  },
  'dekuTree|fado': {
    C: [
      ['a', 'Hmmm. Fado. Your spirit lingers still.'], ['b', 'Great Deku Tree! It\'s been so long.'],
      ['a', 'Long for you. For me, it was the blink of a leaf.'], ['b', 'The Koroks look different now.'],
      ['a', 'They look the same. You simply forgot. Ho ho.'],
    ],
    B: [
      ['b', 'Great Deku Tree, how many generations of Koroks have you watched over?'], ['a', 'Hmm. Before Koroks there were Kokiri.'],
      ['b', 'Kokiri?'], ['a', 'Children of the forest. When the sea came, they changed. They grew leaves, so they could fly.'],
      ['b', 'So we came from them?'], ['a', 'Every child of the forest becomes what the world needs. That is our nature.'],
    ],
    A: [
      ['b', 'Will the Koroks keep changing? After all of this?'], ['a', 'They must. The world above the sea grows larger every year.'],
      ['b', 'Then Makar won\'t be the last Wind Sage. Maybe there\'ll be someone who doesn\'t look like either of us.'],
      ['a', 'Hmm-hmm. Very likely.'], ['b', 'I think I like that.'],
      ['a', 'You always did like new songs, Fado. Even ones you hadn\'t heard yet.'],
    ],
  },
  'kingDaphnes|laruto': {
    C: [
      ['a', 'Lady Laruto. I attended your initiation as Sage, centuries ago.'], ['b', 'Your Majesty. You were so young then.'],
      ['a', 'I was a prince with a terrible mustache.'], ['b', 'I remember. The whole Zora court remembered.'],
      ['n', 'The King laughs, surprised.'],
    ],
    B: [
      ['b', 'Do you remember Zora\'s Domain? The waterfalls before the flood?'], ['a', 'Like silver curtains. I stood beneath them once.'],
      ['b', 'Now the whole kingdom is water. My people became Rito, and flew away.'], ['a', 'And mine went to the mountaintops.'],
      ['b', 'We both lost our kingdoms to the same sea.'], ['a', 'Yes. And yet some of them are still here. Changed, but here.'],
    ],
    A: [
      ['a', 'I asked too much of you, Lady Laruto. I sent the Sages to pray while I sat on a throne.'], ['b', 'You sent us because we were needed.'],
      ['a', 'And you died for it.'], ['b', 'Your Majesty. I chose to pray. Just as the Rito girl chooses now.'],
      ['b', 'Do not carry my death. Carry my song. That is what I would want.'], ['n', 'The King bows his head deeply.'],
      ['a', 'Then I will hum it, badly, whenever I sail.'],
    ],
  },
  'kingDaphnes|valoo': {
    C: [
      ['a', 'Lord Valoo. It is good to see you again, old friend.'], ['b', 'Rrroohh.'],
      ['n', 'The dragon tilts his head at the old man, puzzled.'], ['a', 'Ah, you know me better as a boat. Yes, it is I.'],
      ['b', 'Hrrm!'], ['n', 'Valoo sneezes a small burst of flame. The King\'s beard narrowly survives.'],
    ],
    B: [
      ['a', 'You were once a guardian of Hyrule\'s skies, before the flood. Did you know that?'], ['b', 'Hmmm.'],
      ['a', 'You remember, then. The castle spires. The banners.'], ['n', 'Valoo lowers his eyes. A slow trickle of smoke rises.'],
      ['a', 'We are the last who saw it, you and I.'], ['b', 'Rrrooh.'],
    ],
    A: [
      ['a', 'I will tell you a secret, Valoo. I no longer wish to see Hyrule raised from the sea.'], ['b', 'Hrrm?'],
      ['a', 'It is the children above the waves who matter now. Rito, Koroks, island folk.'],
      ['n', 'Valoo spreads one wing over the King, a gesture of deep agreement.'], ['a', 'You knew that before me, didn\'t you?'],
      ['b', 'Rroohh.'], ['a', 'Then let us protect them together. The remnant and the new.'],
    ],
  },
  'jabun|kingDaphnes': {
    C: [
      ['n', 'Jabun surfaces near the shore. The King steps forward and speaks in the ancient tongue.'],
      ['b', 'Lord Jabun. You have been hiding on Outset for a long time.'], ['a', 'Hrrrmmm.'],
      ['b', 'Yes, I know. Ganondorf\'s forces found your old waters. I am sorry.'], ['n', 'The ancient fish blows a weary spray of mist.'],
    ],
    B: [
      ['b', 'When the gods flooded Hyrule, they gave you the pearl. The duty of keeping the old power.'], ['a', 'Hrrm.'],
      ['b', 'And they gave me the boat. The duty of waiting.'], ['n', 'Jabun answers at length, voice like distant thunder.'],
      ['b', 'Yes. Waiting was the harder of the two. I agree.'],
    ],
    A: [
      ['a', 'Hhhrrrmmmm.'], ['n', 'Jabun speaks long and low. The King listens, eyes closed.'],
      ['b', 'You say our duty is not to the past anymore. To the islanders, and their children.'],
      ['b', 'I came to the same conclusion. It took me longer than a fish.'], ['n', 'Jabun gives what might be a laugh.'],
      ['b', 'Then we have done our part, old friend. Let the young ones carry the rest.'],
    ],
  },
  'dekuTree|kingDaphnes': {
    C: [
      ['a', 'Hmm-hmm. King of Hyrule. Or what remains of him.'], ['b', 'Great Deku Tree. Still blunt, I see.'],
      ['a', 'A tree has no time to be otherwise.'], ['b', 'You have all the time in the world.'],
      ['a', 'And none to waste on flattery. Ho ho.'],
    ],
    B: [
      ['b', 'Some nights, I dream of raising the old kingdom. The castle above the waves again.'], ['a', 'And?'],
      ['b', 'And the people of the islands would have to make room for ghosts.'], ['a', 'Hmm. A forest cannot grow in the shade of a dead tree.'],
      ['b', 'You think Hyrule should be forgotten.'], ['a', 'I think it should be composted. Let it feed something new.'],
    ],
    A: [
      ['b', 'You were right, I think. Hyrule should rest.'], ['a', 'Hmm. That cannot have been easy to say.'],
      ['b', 'It was not. But Link and the girl deserve their own land. Not my ruins.'],
      ['a', 'Remembered, but not restored. That is the wisest way to love the past, old king.'],
      ['b', 'Then you will remember it with me? When I am gone?'], ['a', 'Every tree remembers. Rest easy.'],
    ],
  },
  'ganondorfWW|kingDaphnes': {
    C: [
      ['b', 'Ganondorf.'], ['a', 'King of Hyrule. Still alive, in a manner. Like a barnacle on a sunken ship.'],
      ['b', 'You are one to speak of ships, having sunk an entire kingdom.'], ['a', 'The gods sank it, old man. I merely gave them reason.'],
      ['n', 'The two men regard each other in cold silence.'],
    ],
    B: [
      ['a', 'Do you know what I wanted, Daphnes? Your green hills. Your wind, which brought rain instead of sand.'],
      ['b', 'You wanted Hyrule.'], ['a', 'I wanted what you had. And now neither of us has it.'],
      ['b', 'Yes. We are both kings of nothing.'], ['a', 'You still dream of it, though. I see it in your face.'],
      ['b', '…As do you.'],
    ],
    A: [
      ['b', 'I have let Hyrule go, Ganondorf. Have you?'], ['a', 'Let it go? I spent centuries trying to claim it.'],
      ['b', 'And I spent them trying to protect it. Look at us. Two old men in love with a grave.'],
      ['n', 'Ganondorf\'s jaw tightens. He does not answer for a long time.'], ['a', 'You make it sound pitiful.'],
      ['b', 'It is. But it need not be the end. The young ones have a whole sea ahead of them.'],
      ['a', '…Then let them have it. I will not watch.'],
    ],
  },
  'jabun|valoo': {
    C: [
      ['n', 'Valoo perches on a seaside cliff. Below, Jabun\'s great head rises from the water.'],
      ['a', 'Hrrrmmm.'], ['b', 'Rrroohh!'], ['n', 'The two ancient beings regard each other. The soldiers nearby back slowly away.'],
      ['n', 'After a long moment, Valoo settles his wings. Jabun sinks lower, satisfied.'],
    ],
    B: [
      ['n', 'At dusk, the dragon and the fish face the open sea together, one above, one below.'],
      ['b', 'Hrrm.'], ['a', 'Hhmmmm.'], ['n', 'Valoo sweeps his head west. Jabun turns his great eye east.'],
      ['n', 'Between them, nothing on the horizon escapes notice.'],
    ],
    A: [
      ['n', 'A storm rolls in over the camp. Valoo spreads his wings wide to shield the tents from the wind.'],
      ['n', 'Below the cliffs, Jabun circles the cove, calming the waves against the boats.'], ['b', 'Rrooohh!'],
      ['a', 'Hrrrmmm.'], ['n', 'When the storm passes, the camp wakes to find every boat and tent intact.'],
      ['n', 'The two guardians rest side by side until dawn.'],
    ],
  },
  'dekuTree|valoo': {
    C: [
      ['a', 'Hmm. Lord Valoo. Your fire has grown gentler with age.'], ['b', 'Rrroh.'],
      ['a', 'Ho ho! I meant it as a compliment.'], ['n', 'Valoo exhales a warm cloud over the Deku Tree\'s branches. The leaves rustle.'],
      ['a', 'Ah, very nice. Like spring.'],
    ],
    B: [
      ['a', 'Do you remember Hyrule Field, Valoo? Before?'], ['b', 'Hrrmm.'],
      ['a', 'So do I. The Kokiri forest at its edge. The horse ranch. The great lake.'],
      ['n', 'Valoo closes his eyes. A low, mournful rumble rolls across the camp.'], ['a', 'Yes. I miss it too, old friend.'],
    ],
    A: [
      ['a', 'But the old world was not perfect, Valoo. It ended in fire and war.'], ['b', 'Hrrm.'],
      ['a', 'This world of islands is smaller. But the Koroks plant forests, and the Rito fly free.'],
      ['n', 'Valoo nudges the tree\'s trunk with his snout, an old gesture of agreement.'],
      ['a', 'Ho ho. Then we are agreed. The new world is worth guarding.'], ['b', 'Rrrooohh.'],
    ],
  },
  'dekuTree|jabun': {
    C: [
      ['a', 'Lord Jabun. It is rare to see you so close to land.'], ['b', 'Hrrrmmm.'],
      ['a', 'Yes, the war brings us all out of hiding. Hmm-hmm.'], ['n', 'The great fish rolls lazily in the shallows beneath the tree\'s branches.'],
    ],
    B: [
      ['b', 'Hhmmmrrrm.'], ['a', 'You worry for the islanders\' children. So do I, for my Koroks.'],
      ['a', 'Each year I send them out with seeds. Each year I wonder if all will return.'],
      ['n', 'Jabun answers, low and sad.'], ['a', 'Hmm. You have lost some of yours too, then. To the monsters.'],
    ],
    A: [
      ['a', 'Jabun, I have an idea. Your waters around Outset could shelter a Korok grove.'], ['b', 'Hrrrm?'],
      ['a', 'The children of the forest and the children of the sea, side by side. Each protecting the other.'],
      ['n', 'Jabun considers this for a long, long time.'], ['b', 'Hhhrrmm.'],
      ['a', 'Ho ho! Then we plant it in spring. The future is a garden, old friend.'],
    ],
  },
  'cyclos|zephos': {
    C: [
      ['b', 'Cyclos. You spun three supply boats around the bay this morning.'], ['a', 'Ribbit! They were in my way!'],
      ['b', 'They were on the sea. The sea is not your way.'], ['a', 'Everything is my way when I\'m bored, brother!'],
      ['n', 'Zephos\'s cloud darkens a shade.'],
    ],
    B: [
      ['a', 'Mortals are fun to toss around, Zephos. They squeal!'], ['b', 'They drown.'],
      ['a', 'Not the ones I like.'], ['b', 'You like none of them.'], ['a', 'I like the green one. He shot me with arrows!'],
      ['b', 'And you liked that?'], ['a', 'Nobody had dared in centuries! It was thrilling!'],
    ],
    A: [
      ['b', 'You have changed, brother. You haven\'t thrown a single cyclone at our camp in weeks.'], ['a', 'I\'m saving them.'],
      ['b', 'For what?'], ['a', 'For the enemy, obviously. Ribbit. The mortals are… on our side, I suppose.'],
      ['b', 'Our side. You have never said that before.'], ['a', 'Don\'t make it a whole thing, Zephos.'],
    ],
    S: [
      ['a', 'Brother. I\'ve been thinking. Which I rarely do.'], ['b', 'I noticed.'],
      ['a', 'You always loved the mortals. You sent them gentle winds. I sent them storms.'], ['b', 'We are what we are.'],
      ['a', 'But when they sail with your winds and my storms both, they get where they need to go faster.'],
      ['n', 'Zephos is silent for a long moment, then laughs.'], ['b', 'Together, then? Wind and whirlwind.'],
      ['a', 'Together. But I still get to splash them a little.'],
    ],
  },
  'heroOfWinds|zephos': {
    C: [
      ['b', 'You conduct my winds with that little baton as though you own them.'], ['a', 'The King gave it to me.'],
      ['b', 'And who gave the King the wind? I did, small one.'], ['a', 'Thank you.'],
      ['n', 'The god of wind blinks, unused to gratitude.'], ['b', '…You are welcome.'],
    ],
    B: [
      ['b', 'You changed the wind three times during today\'s battle. Each time, it fought you.'], ['a', 'It was windy.'],
      ['b', 'Of course it was windy! The wind is not a dog that fetches, boy. It has moods.'],
      ['a', 'How do I know its mood?'], ['b', 'Listen before you play. Feel where it wishes to blow, then ask it kindly.'],
      ['a', 'Ask the wind.'], ['b', 'Ask, yes. Command, rarely.'],
    ],
    A: [
      ['a', 'I listened today. Before I played.'], ['b', 'I felt it. The wind turned for you like a friend.'],
      ['b', 'Very few mortals learn that. Your old hero never did. He simply ran faster than the breeze.'], ['a', 'I like sailing better.'],
      ['b', 'Then you and the wind will get along famously. Keep the baton, little one.'], ['a', 'I\'ll take care of it.'],
    ],
  },
  'cyclos|heroOfWinds': {
    C: [
      ['a', 'Ribbit! You again! The arrow boy!'], ['b', 'You threw me across the sea.'],
      ['a', 'And you shot me in the face! Three times!'], ['b', 'You deserved it.'],
      ['n', 'Cyclos puffs up indignantly on his cloud, then deflates.'], ['a', 'Ribbit… I suppose I did.'],
    ],
    B: [
      ['a', 'Why did you keep chasing me? Most mortals run away from a cyclone!'], ['b', 'I needed the song.'],
      ['a', 'Just a song?'], ['b', 'It got me home faster. To my sister.'], ['a', 'A sister? Hm. I have a brother.'],
      ['a', 'He\'s very bossy.'], ['b', 'Mine isn\'t.'], ['a', 'Lucky.'],
    ],
    A: [
      ['a', 'You know, arrow boy, I\'ve been watching mortals since I took a liking to you.'], ['b', 'And?'],
      ['a', 'They\'re so small, and they keep going anyway. They row through my storms and laugh!'],
      ['a', 'I used to find it insulting. Now I find it… impressive. Ribbit.'], ['b', 'You could help them instead.'],
      ['a', 'I already did! I pushed the medic boats ashore yesterday. Didn\'t even splash them!'], ['b', 'Good job, Cyclos.'],
    ],
  },
  'cyclos|tetra': {
    C: [
      ['b', 'You. Frog on a cloud. Did you just blow my ship sideways?'], ['a', 'Ribbit! Maybe!'],
      ['b', 'I had a heading. A perfect heading.'], ['a', 'Now you have an exciting heading!'],
      ['n', 'Tetra reaches for her cutlass. Cyclos floats slightly higher.'],
    ],
    B: [
      ['b', 'Listen, weather god. My crew needs predictable winds to run supplies.'], ['a', 'Predictable is so dull, pirate girl.'],
      ['b', 'Dull keeps people alive.'], ['a', 'Ribbit. You sound like my brother.'],
      ['b', 'Then your brother\'s smart.'], ['a', 'Don\'t tell him that! He\'ll be unbearable!'],
    ],
    A: [
      ['a', 'Pirate girl. I\'ve made you an offer. One cyclone, any time you need it. To escape trouble.'], ['b', 'You\'d do that?'],
      ['a', 'You\'re the only mortal who yells back at me. I like it.'], ['b', 'Fine. But you warn me first. No surprises.'],
      ['a', 'A tiny surprise?'], ['b', 'Cyclos.'], ['a', 'No surprises. Ribbit.'],
      ['n', 'Tetra grins despite herself.'],
    ],
  },
  'greatFairy|queenOfFairies': {
    C: [
      ['a', 'My Queen. I did not expect to see you outside the Mother and Child Isles.'], ['b', 'Neither did I, darling! But the mortals are so fun.'],
      ['a', 'Fun is not quite the word I would use for war.'], ['b', 'Oh, you\'re always so serious!'],
      ['n', 'The Great Fairy sighs, a sound like wind chimes.'],
    ],
    B: [
      ['a', 'You give gifts to the boy so freely. Arrows of fire and ice.'], ['b', 'He asked so nicely!'],
      ['a', 'Gifts are responsibilities. If he misuses them, the fault becomes ours.'],
      ['b', 'He won\'t misuse them. I looked into his heart. It\'s full of soup and his little sister.'],
      ['a', 'You looked?'], ['b', 'Of course I looked! I\'m frivolous, not careless.'],
    ],
    A: [
      ['a', 'I envy you, sometimes. You laugh with mortals. I only heal them and send them away.'],
      ['b', 'You could stay and chat. They like you, you know.'], ['a', 'They fear me.'],
      ['b', 'They respect you. Then they get nervous and mumble. That\'s not fear, that\'s shyness!'],
      ['n', 'The Great Fairy laughs, startled.'], ['a', 'You may be wiser than you appear, my Queen.'],
    ],
    S: [
      ['b', 'When this war is over, I think we should both visit the islands more. Not just wait in fountains.'],
      ['a', 'Our duty is to remain where we are needed.'], ['b', 'They\'re needed everywhere now. So are we.'],
      ['a', 'Then… perhaps we could travel together. You could teach me to laugh with them.'],
      ['b', 'And you could teach me to be patient!'], ['a', 'That will take centuries.'],
      ['b', 'Wonderful! I have centuries.'], ['n', 'Two lights drift side by side over the sleeping camp.'],
    ],
  },
  'navi|queenOfFairies': {
    C: [
      ['a', 'Hey! Listen! You\'re a fairy too!'], ['b', 'A fairy queen, darling. And who are you, little light?'],
      ['a', 'Navi! I\'m Link\'s guardian fairy! The other Link. The one from the past.'],
      ['b', 'A guardian fairy! How quaint! We haven\'t had those since before the flood!'], ['a', 'Quaint?! Hey!'],
    ],
    B: [
      ['b', 'Tell me, Navi. What does a guardian fairy do all day?'], ['a', 'Watch! Warn! Point at things!'],
      ['b', 'Point at things?'], ['a', 'Weak spots! Doors! Hey, look here! That kind of thing!'],
      ['b', 'Fascinating. My fairies just float about and heal people who open bottles.'],
      ['a', 'That\'s important too! I couldn\'t heal anyone. I could only nag them.'],
    ],
    A: [
      ['b', 'You love your hero, don\'t you? Not as a duty.'], ['a', '…Yes.'],
      ['a', 'I left him, once. When the adventure was done. I\'ve always wondered if he was all right.'],
      ['b', 'He is here now, darling. Fighting beside you.'], ['a', 'I know. That\'s why I\'m not leaving this time.'],
      ['n', 'The Queen of Fairies glows a little softer.'], ['b', 'Then you are a far greater fairy than I, little Navi.'],
    ],
  },
  'queenOfFairies|valoo': {
    C: [
      ['a', 'Oh my! A dragon! Can I sit on your nose?'], ['b', 'Rrrooh.'],
      ['n', 'Before Valoo can answer properly, the Queen of Fairies lands on his snout.'], ['a', 'So warm! Like a hearth!'],
      ['n', 'Valoo goes very cross-eyed.'],
    ],
    B: [
      ['a', 'The old magics are fading, dragon. Fairy springs. Dragon fire. Sage songs.'], ['b', 'Hrrmm.'],
      ['a', 'You remember the old rites too, don\'t you? Before the flood?'],
      ['n', 'Valoo breathes a pattern of sparks in the air: circles and triangles, an old symbol.'], ['a', 'Oh! The Triforce mark. You do remember!'],
    ],
    A: [
      ['a', 'I\'ve decided, dragon. We should teach the young ones. Before the old magic is forgotten entirely.'],
      ['b', 'Rroohh.'], ['a', 'You teach the Rito girl the fire songs. I teach the little Korok the fairy charms.'],
      ['n', 'Valoo dips his head, slow and solemn.'], ['a', 'Then it\'s settled! Ancient beings, starting a school!'],
      ['b', 'Hrrm.'], ['a', 'Yes, yes, you can be headmaster.'],
    ],
  },
  'dekuTree|queenOfFairies': {
    C: [
      ['a', 'Hmm. The Queen of Fairies. You have grown no taller.'], ['b', 'And you have grown no shorter, old stick.'],
      ['a', 'Ho ho! Still sharp-tongued.'], ['b', 'Always, darling.'],
      ['n', 'She settles on one of his branches like she owns it.'],
    ],
    B: [
      ['b', 'The monsters burned a stretch of forest on the eastern isle. Did you feel it?'], ['a', 'Hmm. I felt every root.'],
      ['b', 'I\'m sorry. I know you love your trees.'], ['a', 'And you love your springs. When the land is hurt, so are they.'],
      ['b', 'We\'re not so different, are we? The forest and the fountain.'], ['a', 'We never were.'],
    ],
    A: [
      ['b', 'I\'ve asked my fairies to visit the burned isle. To help it heal.'], ['a', 'And I have sent the Koroks with seeds.'],
      ['b', 'Fairies and Koroks, together! The mortals won\'t believe it.'],
      ['a', 'Hmm-hmm. Let them see it, then. The world grows back when we tend it together.'],
      ['b', 'Oh, I do like you when you\'re hopeful.'], ['a', 'And I you, when you are serious.'],
    ],
  },
  'ganondorfWW|helmarocKing': {
    C: [
      ['n', 'The Helmaroc King lands on the ruined tower above camp, its iron mask scraping stone.'], ['b', 'SKRAAAAAH!'],
      ['a', 'Quiet.'], ['n', 'The great bird falls instantly silent and lowers its head.'],
      ['a', 'You took the wrong girl, once. I have not forgotten.'], ['n', 'The Helmaroc King shudders, feathers flattening.'],
    ],
    B: [
      ['a', 'Hold still.'], ['n', 'Ganondorf runs a gauntleted hand along the beast\'s mask, where an arrow has cracked it.'],
      ['b', 'Krrrr.'], ['a', 'You flew through their volleys to carry my message. Foolish.'],
      ['n', 'The bird nudges his hand, like a hawk to its falconer.'], ['a', '…Foolish, but loyal.'],
    ],
    A: [
      ['a', 'Every servant I have ever had wanted something. Power. Gold. Revenge.'], ['b', 'Krrrraah.'],
      ['a', 'You want nothing. Only to fly where I point.'], ['n', 'The Helmaroc King settles its wings, waiting.'],
      ['a', 'I raised you from an egg in the Forsaken Fortress. You were the size of my fist.'],
      ['n', 'Ganondorf is silent a long while, his hand resting on its beak.'],
    ],
    S: [
      ['n', 'The Helmaroc King is wounded, a long gash across one wing. It drags itself back to its master anyway.'],
      ['b', 'Krrr…'], ['a', 'You came back. Even like this.'],
      ['n', 'Ganondorf kneels in the mud and binds the wound himself with strips torn from his cloak.'],
      ['a', 'Do not mistake this for kindness. I simply have no use for a bird that cannot fly.'],
      ['n', 'The bird rests its iron-masked head against his shoulder. He does not push it away.'], ['a', '…Rest. That is an order.'],
    ],
  },
  'ganondorfWW|puppetGanonBeast': {
    C: [
      ['n', 'Puppet Ganon hangs motionless from its strings in the corner of Ganondorf\'s tent.'],
      ['a', 'You are my finest creation. A shape for my power, empty of will.'], ['b', '…'],
      ['n', 'The puppet\'s head tilts slightly, though no hand has moved the strings.'], ['a', 'Hm.'],
    ],
    B: [
      ['a', 'Dance.'], ['n', 'The puppet rises, limbs jerking. It moves as he wills, every motion his.'],
      ['a', 'You are a mirror, puppet. When the boy strikes you, it is me he strikes.'],
      ['n', 'The puppet bows unprompted. Ganondorf\'s eyes narrow.'], ['a', 'I did not command that.'],
    ],
    A: [
      ['a', 'You hesitate before my commands now. A heartbeat. Barely.'], ['b', 'Hhhhhh…'],
      ['a', 'Is that your own will growing, or merely mine, reflected back?'],
      ['n', 'The puppet extends one wooden hand toward the strings above it, as if to touch them.'],
      ['a', 'Perhaps all puppets grow to resent their strings. I certainly did.'],
      ['n', 'He lets the strings go slack. The puppet does not fall.'],
    ],
  },
  'darknut|ganondorfWW': {
    C: [
      ['n', 'A Darknut stands at attention outside Ganondorf\'s tent, unmoving through the night.'],
      ['b', 'You have stood there for eleven hours.'], ['a', '…'], ['b', 'Good.'],
      ['n', 'The knight does not even nod.'],
    ],
    B: [
      ['b', 'The knights of Hyrule once wore armor such as yours. Before I made it mine.'],
      ['n', 'The Darknut draws its sword and holds it across both palms in salute.'],
      ['b', 'You do not care who wore it before. Only whom you serve now.'], ['a', 'Hrrmm.'],
      ['b', 'Discipline. A rare thing, in my ranks.'],
    ],
    A: [
      ['b', 'Bokoblins scatter when I raise my voice. Moblins sulk. Only your kind holds the line.'], ['a', 'Hrrr.'],
      ['b', 'Why? I offer you nothing but battle.'], ['n', 'The Darknut taps its breastplate twice, where an old crest was scraped away.'],
      ['b', 'Ah. You serve because service is what you are.'], ['n', 'Ganondorf nods, slowly, and something like respect crosses his face.'],
      ['b', 'Then serve well, knight. I shall remember it.'],
    ],
  },
  'ganondorfWW|phantomGanon': {
    C: [
      ['n', 'Phantom Ganon drifts from the shadows, a hollow echo of its master in a dark cloak.'], ['a', 'There you are.'],
      ['n', 'The phantom bows, mirroring Ganondorf exactly.'], ['a', 'A shadow should not be seen until it is needed.'],
      ['n', 'The phantom fades back into darkness.'],
    ],
    B: [
      ['a', 'You exist to be struck down. Do you understand that?'], ['b', 'Hhhhh…'],
      ['a', 'Every time the boy defeats you, he grows bolder. He thinks he has beaten me.'],
      ['a', 'Let him think so. A bold boy makes careless mistakes.'], ['n', 'The phantom inclines its masked head.'],
    ],
    A: [
      ['a', 'In the tower, you led the boy through the maze. Pointed the way with your sword.'], ['n', 'The phantom says nothing.'],
      ['a', 'I did not command that.'], ['b', 'Hhhhh.'],
      ['a', 'Perhaps even my shadow wishes to see how this ends. Perhaps I do as well.'],
      ['n', 'Ganondorf turns away. The phantom remains, watching him, for a long time.'],
    ],
  },
  'helmarocKing|kargaroc': {
    C: [
      ['n', 'A Kargaroc lands on the cliff where the Helmaroc King roosts. It screeches a challenge.'],
      ['a', 'SKRAAAAH!'], ['n', 'The Helmaroc King spreads its wings. The Kargaroc flees so fast it loses three feathers.'], ['b', 'Krek!'],
    ],
    B: [
      ['n', 'At dawn the Kargaroc returns, carrying a fish. It drops the offering at the edge of the Helmaroc\'s roost.'],
      ['b', 'Krek?'], ['n', 'The Helmaroc King eats the fish without looking at it.'],
      ['n', 'The Kargaroc is permitted to perch on the far side of the cliff. It looks very pleased.'],
    ],
    A: [
      ['n', 'The two birds circle above the battlefield together, one enormous, one small.'],
      ['n', 'The Kargaroc dives first, scattering the enemy. The Helmaroc King follows, talons wide.'],
      ['a', 'Krrraaah!'], ['b', 'Kek-kek!'],
      ['n', 'That night, the Kargaroc sleeps under the Helmaroc King\'s wing. Neither acknowledges this in the morning.'],
    ],
  },
  'aryll|helmarocKing': {
    C: [
      ['n', 'Aryll freezes as the Helmaroc King\'s shadow passes over the camp.'], ['a', 'N-no…'],
      ['n', 'She drops her telescope and hides behind a supply crate, shaking.'],
      ['b', 'Krrr.'], ['n', 'The great bird lands far away, at the other end of the camp. It does not look at her.'],
    ],
    B: [
      ['n', 'Aryll peeks over the crate. The Helmaroc King sits with its mask bowed, a soldier dressing a wound on its leg.'],
      ['a', 'It\'s hurt.'], ['n', 'The bird twitches as the bandage tightens.'],
      ['a', 'I didn\'t know it could get hurt. It was so big. Like the whole sky.'], ['b', 'Krrk.'],
      ['a', 'You still scare me. I just wanted you to know that.'],
    ],
    A: [
      ['n', 'Aryll walks up to the Helmaroc King slowly, her telescope clutched to her chest.'], ['a', 'You flew me over the sea, once.'],
      ['a', 'I was so scared. But I remember the clouds. They were beautiful.'],
      ['n', 'The bird lowers its head until its mask is level with her.'], ['b', 'Krrrr…'],
      ['a', 'I\'m not scared of you anymore. Not really.'], ['n', 'She reaches out and touches its beak, very lightly. It does not move.'],
    ],
  },
  'gohmaWW|valoo': {
    C: [
      ['n', 'Gohma\'s armored body scuttles into the camp in chains. Across the clearing, Valoo rises to his full height.'],
      ['b', 'RRRAAAAHH!'], ['n', 'Flame scorches the earth a hand\'s breadth from the beast. Gohma shrinks into its shell.'],
      ['n', 'The soldiers move Gohma\'s pen to the far side of the island.'],
    ],
    B: [
      ['n', 'Valoo lands beside Gohma\'s pen. His tail, still scarred, coils protectively behind him.'], ['a', 'Skrrrch.'],
      ['n', 'The great eye of Gohma blinks up at the dragon. It clicks its pincers once, then stops.'], ['b', 'Hrrrmmm.'],
      ['n', 'Valoo exhales smoke over the pen, then turns away. He does not burn it.'],
    ],
    A: [
      ['n', 'In the next battle, Gohma is unleashed against the enemy line. Valoo watches from above.'],
      ['n', 'When an enemy pins Gohma down, a jet of dragonfire clears them away.'], ['a', 'Skrrk?'],
      ['b', 'Rrrooh.'], ['n', 'Valoo has not forgiven. But he will not let it be destroyed by someone else.'],
      ['n', 'Gohma keeps its distance from the dragon\'s tail for the rest of the war.'],
    ],
  },
  'dekuTree|kalleDemos': {
    C: [
      ['n', 'Kalle Demos\'s great bulb sits in a clay pot at the forest edge, vines twitching.'],
      ['a', 'Hmm. So you are what grew in the Forbidden Woods.'], ['b', 'Hssssss.'],
      ['a', 'You were once a flower. I remember the seed.'], ['n', 'The bulb tightens shut.'],
    ],
    B: [
      ['a', 'The darkness got into your roots. Ganondorf\'s magic, seeping through the soil.'],
      ['n', 'Kalle Demos\'s vines curl and uncurl, restless.'], ['a', 'It was not your fault, little one. Rot spreads where it is fed.'],
      ['b', 'Ssshhhh.'], ['n', 'One vine reaches toward the Deku Tree\'s trunk, then withdraws.'],
    ],
    A: [
      ['a', 'Hmm. I have asked the Koroks to bring you fresh soil from the Forest Haven.'], ['n', 'The bulb trembles.'],
      ['a', 'Clean earth. Clean water. Perhaps you will remember what you were.'],
      ['n', 'Weeks later, a single green leaf unfurls from Kalle Demos\'s bulb. It is not poisoned.'],
      ['a', 'Ho ho. There you are.'], ['b', 'Hhhhh.'],
    ],
  },
  'kalleDemos|makar': {
    C: [
      ['n', 'Makar walks past Kalle Demos\'s pot. A vine twitches. Makar screams and leaps behind a tent.'],
      ['b', 'It moved! It moved, it moved!'], ['n', 'The bulb sways gently.'],
      ['b', 'I am not walking past there again. Ever.'],
    ],
    B: [
      ['b', 'You trapped me in a cage. Did you know that? Hung me up like a lantern.'], ['a', 'Hssss.'],
      ['b', 'I was so scared I couldn\'t even play. I just shook.'], ['n', 'Kalle Demos\'s vines curl back, away from him.'],
      ['b', 'Are you… shy? Are you shy?!'],
    ],
    A: [
      ['n', 'Makar sits cross-legged in front of Kalle Demos\'s pot, violin in hand.'], ['b', 'The Great Deku Tree says music helps plants grow.'],
      ['b', 'So I\'m going to play for you. Even though you\'re scary.'], ['n', 'He plays a slow, careful song. His hands only shake a little.'],
      ['n', 'The bulb opens slightly, leaves trembling in time.'], ['a', 'Hhhh.'], ['b', 'See? Not so scary. For either of us.'],
    ],
  },
  'gohdan|heroOfWinds': {
    C: [
      ['a', 'HERO. YOU HAVE COME BEFORE ME AGAIN.'], ['b', 'I\'m just walking past.'],
      ['a', 'A HERO NEVER JUST WALKS PAST.'], ['b', 'I\'m getting lunch.'],
      ['n', 'Gohdan\'s floating hands drift, considering this.'], ['a', '…THEN ENJOY YOUR LUNCH, HERO.'],
    ],
    B: [
      ['a', 'IN THE TOWER, YOU STRUCK MY EYES WITH ARROWS. MY HANDS WITH BOMBS.'], ['b', 'You told me to.'],
      ['a', 'I DID. YOU DID NOT HESITATE.'], ['b', 'It was a test.'],
      ['a', 'MANY HAVE FAILED IT BY HESITATING. MANY MORE BY ENJOYING IT.'], ['b', 'I didn\'t enjoy it.'],
      ['a', 'GOOD. THAT IS WHY YOU PASSED.'],
    ],
    A: [
      ['b', 'Gohdan, what happens to the ones who fail?'], ['a', 'THEY RETURN HOME. ALIVE. ASHAMED.'],
      ['a', 'I AM NOT A GUARDIAN OF DEATH, HERO. I AM A GUARDIAN OF WORTHINESS.'], ['b', 'And I\'m worthy?'],
      ['a', 'YOU CAME FOR A SISTER. YOU STAYED FOR A WORLD. THE GODS ASK NOTHING MORE.'],
      ['n', 'Gohdan\'s great hands come together, the stone fingers touching in salute.'], ['a', 'GO, HERO. WITH THEIR BLESSING.'],
    ],
  },
  'gohdan|kingDaphnes': {
    C: [
      ['a', 'KING OF HYRULE. YOU PETITIONED THE GODS FOR A TEST. I AM THAT TEST.'], ['b', 'I remember, Gohdan. Very well.'],
      ['a', 'YOU WERE YOUNGER THEN.'], ['b', 'And taller. Being a boat for a century shrinks a man.'],
      ['n', 'Gohdan\'s hands drift in what might be amusement.'],
    ],
    B: [
      ['b', 'The Tower of the Gods. I asked for it built so the hero could prove himself. Was I right to?'],
      ['a', 'THE GODS DO NOT GRANT THEIR POWER LIGHTLY.'], ['b', 'And yet a child passed.'],
      ['a', 'A CHILD WITH A PURE HEART. THE TOWER WEIGHS HEARTS, NOT YEARS.'], ['b', 'Then it was built well.'],
    ],
    A: [
      ['b', 'I wonder, Gohdan. Did the tower test the hero, or did it test me? My willingness to send a boy into danger?'],
      ['a', 'BOTH, KING.'], ['b', 'And did I pass?'],
      ['a', 'YOU SENT HIM. AND YOU SAILED BESIDE HIM EVERY STEP. YES, YOU PASSED.'],
      ['n', 'The old king bows his head, eyes damp.'], ['b', 'Thank you, old guardian. I have wondered for so long.'],
    ],
  },
  'jalhalla|laruto': {
    C: [
      ['n', 'Jalhalla\'s great grinning mask hovers near the edge of the camp. Laruto\'s spirit appears and goes very still.'],
      ['b', 'You.'], ['a', 'Hehehehehe…'], ['n', 'The Poe king\'s lantern swings, casting jagged shadows.'],
      ['b', 'You were there when they came for me. In the Earth Temple.'],
    ],
    B: [
      ['b', 'I prayed in that temple for years. You crept through its halls the whole time.'], ['n', 'Jalhalla spins slowly, mask grinning.'],
      ['b', 'You were Ganondorf\'s servant. You did not even hate me. I was simply in the way.'],
      ['a', 'Hehehe.'], ['b', 'That is the worst part, you know. To die for someone\'s errand.'],
    ],
    A: [
      ['n', 'Laruto floats before Jalhalla, small and silver against his looming shape.'], ['b', 'I will not hate you.'],
      ['b', 'Hate would bind me here forever. And I have an heir to watch over.'],
      ['n', 'Jalhalla\'s grin wavers for the first time. The lantern dims.'], ['a', '…Hhhh.'],
      ['b', 'Go on. Fight for the living, ghost. It is more than you ever did for them before.'],
    ],
  },
  'jalhalla|medli': {
    C: [
      ['n', 'Jalhalla hovers past Medli\'s tent. She shrieks and holds up her harp like a shield.'],
      ['b', 'G-get back! I\'ll reflect light at you! I will!'], ['a', 'Hehehe.'],
      ['n', 'The Poe king drifts away, apparently amused.'], ['b', 'Oh, goodness. Oh, goodness.'],
    ],
    B: [
      ['b', 'You tried to stop me from becoming a Sage. You and your little Poes.'], ['a', 'Hehehe.'],
      ['b', 'I was shaking the whole time. But I did it anyway.'],
      ['n', 'Medli stands firm, wings trembling but harp raised.'], ['b', 'I\'m not afraid of you now.'],
      ['n', 'Jalhalla tilts its mask, curious.'],
    ],
    A: [
      ['n', 'In battle, enemy spirits swarm Jalhalla. Medli\'s harp flashes, reflecting sunlight across the field.'],
      ['n', 'The spirits scatter. Jalhalla turns toward her, mask unreadable.'], ['a', '…Hehe.'],
      ['b', 'Don\'t thank me. I did it for the soldiers behind you.'],
      ['b', 'But… you\'re on our side now. So I suppose I\'ll keep doing it.'], ['n', 'Jalhalla bows, mockingly deep. Medli huffs.'],
    ],
  },
  'fado|molgera': {
    C: [
      ['n', 'Molgera burrows into the sand at the edge of the camp. Fado\'s faint spirit hovers nearby, unmoving.'],
      ['a', 'You.'], ['b', 'Grrrraaah.'], ['n', 'The sand worm\'s great maw opens, then closes again.'],
      ['a', 'I remember those teeth.'],
    ],
    B: [
      ['a', 'You ended my prayers in the Wind Temple. Every song I never got to play.'],
      ['n', 'Molgera thrashes beneath the sand, restless.'], ['a', 'You were only a beast, set loose by a cruel master.'],
      ['a', 'That does not make it easier.'], ['b', 'Hrrrr.'],
    ],
    A: [
      ['n', 'Fado drifts down to the edge of the sand where Molgera rests.'], ['a', 'Makar plays the songs now. Better than I did, perhaps.'],
      ['a', 'So you did not end anything, after all. You only made me wait for him.'],
      ['n', 'Molgera\'s tongue flicks, sensing the air.'], ['a', 'I forgive you, beast. Not for your sake. For mine.'],
      ['n', 'The spirit fades, lighter than before.'],
    ],
  },
  'makar|molgera': {
    C: [
      ['n', 'Molgera rises from the sand beside Makar. The Korok drops his violin and runs in a tight circle.'],
      ['a', 'Ahhh! Sand! Teeth! Ahhh!'], ['b', 'Grrrraaah.'],
      ['n', 'Molgera sinks back into the sand. Makar collapses, panting.'],
    ],
    B: [
      ['a', 'You hurt Fado. You hurt the Wind Temple.'], ['n', 'Makar stands at the edge of the sand pit, legs shaking.'],
      ['a', 'But I\'m the Wind Sage now. And I have to protect everyone. Even from you.'], ['b', 'Hrrrrr.'],
      ['a', 'So… so behave! Okay?'], ['n', 'Molgera\'s maw snaps shut. Makar decides this means yes.'],
    ],
    A: [
      ['n', 'An enemy charges Makar in battle. Molgera bursts from the earth and swallows the attacker whole.'],
      ['a', 'Ah! You… helped me?'], ['b', 'Grrrr.'],
      ['a', 'I still don\'t like you. But… thank you.'], ['n', 'Makar plays a short, defiant tune at the sand pit that night.'],
      ['a', 'That\'s Fado\'s song. So you remember who you\'re fighting for now.'],
    ],
  },
  'molgera|molgeraLarva': {
    C: [
      ['n', 'A Molgera Larva wriggles out of the sand near camp. It is about the size of a small dog.'],
      ['n', 'Molgera surfaces beside it. The larva squeaks and darts beneath the great worm\'s shadow.'],
      ['b', 'Skrrk!'], ['n', 'Molgera does not move. The larva stays close.'],
    ],
    B: [
      ['n', 'At night, the larvae burrow in a ring around Molgera\'s pit, like a nest.'],
      ['n', 'One larva tries to wander off toward the cook tent. Molgera nudges it back with its tail.'],
      ['a', 'Hrrrr.'], ['b', 'Skrk skrk.'], ['n', 'The larva sulks, then burrows back into the ring.'],
    ],
    A: [
      ['n', 'In battle, an enemy spear pins the smallest larva. Molgera erupts from the ground with a roar.'],
      ['a', 'GRRRAAAAHH!'], ['n', 'The enemy flees. Molgera sinks down beside the larva and curls around it.'],
      ['b', 'Skrrrk…'], ['n', 'The soldiers tending the wound do so very, very carefully.'],
    ],
    S: [
      ['n', 'The healed larva is now nearly twice its size. It follows Molgera everywhere, mimicking every burrow.'],
      ['n', 'Molgera teaches it to hunt in the dunes at dusk: rise, strike, sink.'], ['b', 'Skrk!'],
      ['n', 'The larva tries. It mostly sprays sand at its own tail. Molgera waits until it tries again.'],
      ['a', 'Hrrr.'], ['n', 'On the third try, it succeeds. Molgera rumbles low, a sound the soldiers have never heard before.'],
      ['n', 'They decide it must be pride.'],
    ],
  },
  'darknut|mightyDarknut': {
    C: [
      ['n', 'Two armored knights stand at the barracks door. The larger one wears a crimson cape.'],
      ['n', 'The Darknut steps aside to let the Mighty Darknut pass. The caped knight does not acknowledge it.'],
      ['a', 'Hrrm.'], ['b', 'HRRRM.'],
    ],
    B: [
      ['n', 'At practice, the Darknut challenges the Mighty Darknut to a sparring bout.'],
      ['n', 'Steel rings across the yard. The Darknut is disarmed in seven strokes.'],
      ['b', 'Hrrah.'], ['n', 'The Mighty Darknut taps its cape, then points at the Darknut\'s bare shoulders.'],
      ['n', 'The meaning is clear: not yet.'],
    ],
    A: [
      ['n', 'The Darknut challenges again, every dawn, for weeks. Each time it lasts a few strokes longer.'],
      ['n', 'At last, the bout ends in a draw. Both knights stand, blades crossed, breathing hard.'],
      ['a', 'Hrrrm.'], ['n', 'The Mighty Darknut unclasps a strip of crimson from its own cape and ties it around the other\'s pauldron.'],
      ['b', 'Hrrah.'], ['n', 'The Darknut salutes. The Mighty Darknut returns it.'],
    ],
  },
  'bokoblin|miniblin': {
    C: [
      ['n', 'A Bokoblin waves its machete at the training dummy. A Miniblin darts in and stabs the dummy\'s ankle with a pitchfork.'],
      ['a', 'Grah!'], ['b', 'Hee hee hee!'], ['n', 'The Bokoblin glares. The Miniblin stabs the ankle again.'],
    ],
    B: [
      ['n', 'The Bokoblin demonstrates proper machete swings: big, overhead, loud.'], ['a', 'GRAH! GRAH!'],
      ['n', 'The Miniblin copies it, falls over, then returns to its preferred strategy: swarming in from behind.'],
      ['b', 'Heeheehee!'], ['n', 'The Bokoblin throws up its hands in disgust.'],
    ],
    A: [
      ['n', 'In battle, the Bokoblin charges the front. A dozen Miniblins sneak along behind it, pitchforks ready.'],
      ['n', 'The enemy turns to face the Bokoblin. The Miniblins strike from below. The line breaks.'],
      ['a', 'Grah grah!'], ['b', 'Heeheehee!'],
      ['n', 'That night, the Bokoblin shares its roast meat with the whole swarm. Grudgingly.'],
    ],
  },
  'morth|mothula': {
    C: [
      ['n', 'A cloud of Morths swarms around Mothula\'s great wings at the edge of the woods.'],
      ['b', 'Bzzzzzt.'], ['n', 'Mothula shakes its wings irritably. The Morths scatter, then return at once.'], ['a', 'Bzt.'],
    ],
    B: [
      ['n', 'At dusk, the Morths cluster on Mothula\'s back like dust, riding along as it flies.'],
      ['b', 'Bzzzhh.'], ['a', 'Bzt bzt.'],
      ['n', 'When the soldiers light torches, the Morths flee to Mothula\'s shadow. Mothula shields them with its wings.'],
    ],
    A: [
      ['n', 'In battle, the Morths swarm the enemy, clinging to shields and slowing their swings.'],
      ['n', 'Mothula swoops in behind them, striking while the enemy is weighed down.'], ['a', 'Bzzzt!'],
      ['b', 'BZZZZZHH.'], ['n', 'Afterward, the Morths return to Mothula\'s wings, clinging close, humming contentedly.'],
    ],
  },
};
