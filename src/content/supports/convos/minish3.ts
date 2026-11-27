// Support conversations: The Minish Cap (part 3: forgers, scholars, swordmasters, kings, constructs and monsters). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  // ── Forgers ──
  'biggoron|melari': {
    C: [
      ['a', 'WHO IS TALKING. I CANNOT SEE YOU.'],
      ['b', 'Down here! On your toe! Your hammer\'s badly balanced!'],
      ['a', 'A TINY CRITIC. HOW DELIGHTFUL.'],
    ],
    B: [
      ['b', 'You forge swords bigger than houses. I forge swords smaller than pins. Show me your quench.'],
      ['a', 'ONLY IF YOU SHOW ME YOURS. I HAVE NEVER SEEN A SWORD THAT SMALL.'],
    ],
    A: [
      ['a', 'YOUR FOLDING IS EXTRAORDINARY. A THOUSAND LAYERS IN A BLADE I CAN BARELY SEE.'],
      ['b', 'Your tempering is perfect. Like a mountain cooling.'],
      ['a', 'WE SHOULD MAKE A SWORD TOGETHER.'],
    ],
    S: [
      ['n', 'The blade they make together is as long as a Hylian is tall, and as fine as a needle.'],
      ['b', 'Nobody can lift it.'],
      ['a', 'NOBODY NEEDS TO. LOOK AT IT.'],
      ['b', '…Aye. Look at it.'],
    ],
  },
  'melari|zauz': {
    C: [
      ['b', 'A Minish smith? I\'ve heard stories. Never thought I\'d see one.'],
      ['a', 'Well, now you have. Your bellows are leaking.'],
    ],
    B: [
      ['b', 'I forged a Phantom Sword once. From three sacred metals.'],
      ['a', 'I reforged the Picori Blade. From one broken heart.'],
      ['b', 'That\'s a poetic way of saying it was broken.'],
      ['a', 'It was very broken.'],
    ],
    A: [
      ['a', 'You live alone on an island, I hear.'],
      ['b', 'A forge needs quiet.'],
      ['a', 'A forge needs someone to argue with. Come up the mountain some time.'],
    ],
    S: [
      ['b', 'I came up the mountain.'],
      ['a', 'So you did. Grab a hammer.'],
      ['b', 'It\'s the size of my thumbnail.'],
      ['a', 'Then you\'d better be precise.'],
    ],
  },
  'gondo|melari': {
    C: [
      ['a', 'You fix things that are thousands of years old? Me too!'],
      ['b', 'I fix things that are a hundred years old. With a hammer. You fix things with a screwdriver.'],
      ['a', 'Screwdrivers are very advanced!'],
    ],
    B: [
      ['b', 'Show me this "robot" of yours.'],
      ['a', 'Scrapper! Come here!'],
      ['n', 'Melari climbs inside the robot\'s arm and comes out an hour later covered in oil and grinning.'],
    ],
    A: [
      ['b', 'Your machines are clever, Gondo. Too clever. You hide the bolts.'],
      ['a', 'Elegant design!'],
      ['b', 'Bolts should be where a Minish can reach them.'],
    ],
    S: [
      ['a', 'I designed a new gear! With handholds! For Minish repair crews!'],
      ['b', '…That\'s the most thoughtful thing a big one has ever done for me.'],
      ['a', 'It also has a little lantern.'],
      ['b', 'You\'re going to make me cry, you idiot.'],
    ],
  },
  'melari|subrosianBlacksmith': {
    C: [
      ['b', '(The Subrosian, hooded and silent, examines Melari\'s hammer with great interest.)'],
      ['a', 'Don\'t touch it! …Well, all right. Gently.'],
    ],
    B: [
      ['a', 'You work with lava ore? In the underground?'],
      ['b', '(It nods, and hands over a small, glowing lump.)'],
      ['a', 'Hot! Hot hot hot. Lovely. Absolutely lovely.'],
    ],
    A: [
      ['b', '(The Subrosian demonstrates a technique for folding volcanic iron.)'],
      ['a', 'I\'ve never seen anyone fold it like that. Show me again. Slower.'],
    ],
    S: [
      ['a', 'You don\'t talk much.'],
      ['b', '(It shrugs, and taps its hammer twice on the anvil.)'],
      ['a', 'Aye. Neither does the anvil. Best conversation I\'ve had in years.'],
    ],
  },
  'alfonzo|smith': {
    C: [
      ['b', 'Is that a sword or a wrench in your belt?'],
      ['a', 'Both. Depending on the day.'],
      ['b', 'Ha! A man after my own heart.'],
    ],
    B: [
      ['a', 'You raised the boy yourself?'],
      ['b', 'Since he was small enough to sleep in the coal scuttle.'],
      ['a', 'I trained mine too. Engineer. Good kid. Too brave.'],
      ['b', 'They always are.'],
    ],
    A: [
      ['b', 'Here. A spare hammer. Balanced for a man who also swings a sword.'],
      ['a', '…That\'s a good hammer.'],
      ['b', 'Course it is. I made it.'],
    ],
  },
  'rusl|smith': {
    C: [
      ['a', 'An Ordon blade? Not your work.'],
      ['b', 'Not mine. But good. Whoever made it was patient.'],
      ['a', 'I made it.'],
      ['b', 'Ha! Then you\'re patient.'],
    ],
    B: [
      ['a', 'I trained a boy too. He went off to save the world.'],
      ['b', 'Mine as well. I gave him a sword to deliver to the castle. He came back with a magic hat.'],
      ['a', 'They always come back with something.'],
    ],
    A: [
      ['b', 'Do you worry about him?'],
      ['a', 'Every night. Every morning. In between, I sharpen things.'],
      ['b', 'Same. That\'s what the sharpening is for.'],
    ],
    S: [
      ['a', 'When this is over, bring your boy to Ordon. Mine will be there. They can spar.'],
      ['b', 'And we can sit by the fire and pretend we\'re not watching every swing.'],
      ['a', 'Exactly.'],
    ],
  },
  // ── Forest and scholars ──
  'dekuTree|gentari': {
    C: [
      ['a', 'A forest elder, small as a seed. Welcome.'],
      ['b', 'Great Deku Tree. Our village lives in a stump. I hope that doesn\'t offend you.'],
      ['a', 'Every stump was a tree once. It is an honour.'],
    ],
    B: [
      ['b', 'The young ones leave the village and come back changed. Do your Kokiri?'],
      ['a', 'They do not leave. That is their curse and their gift.'],
      ['b', 'I envy you, a little. And pity you, a little.'],
    ],
    A: [
      ['a', 'The forest remembers everything. Do your Minish?'],
      ['b', 'We write it down. On leaves. It fades.'],
      ['a', 'Then I shall remember it for you.'],
    ],
    S: [
      ['b', 'When I go, will you remember me, Great Tree?'],
      ['a', 'For as long as there is a forest.'],
      ['b', 'That is a very long time.'],
      ['a', 'Yes. You deserve a very long time.'],
    ],
  },
  'festari|makar': {
    C: [
      ['a', 'You\'re a Korok? You\'re tiny! Well, not tiny tiny. Minish tiny is tinier.'],
      ['b', 'I\'m a Korok sage! And a cellist!'],
      ['a', 'A tiny cellist!'],
    ],
    B: [
      ['b', 'I fly with a leaf. Do you?'],
      ['a', 'I fall with a leaf. Gracefully.'],
      ['b', 'Let me teach you! It\'s all in the wrists.'],
    ],
    A: [
      ['a', 'Play something.'],
      ['b', 'Here? Now?'],
      ['a', 'The woods are quiet. They could use a song.'],
      ['n', 'Makar plays. Somewhere in the grass, a dozen Minish stop to listen.'],
    ],
    S: [
      ['b', 'Will you come visit the Forest Haven? There\'s a whole forest there!'],
      ['a', 'A whole forest? I\'ll need a year to map it.'],
      ['b', 'Then stay a year!'],
      ['a', 'Maybe I will.'],
    ],
  },
  'festari|saria': {
    C: [
      ['b', 'Oh! A little forest person! You can see me too?'],
      ['a', 'Of course! You\'re standing right on my path.'],
    ],
    B: [
      ['a', 'You know the Lost Woods? Every turn?'],
      ['b', 'Every turn. And every song.'],
      ['a', 'Teach me. The Minish Woods are nothing like the Lost Woods.'],
    ],
    A: [
      ['b', 'Do you get lonely, being so small?'],
      ['a', 'Not with friends who can see me.'],
      ['b', 'Then I\'ll keep seeing you.'],
    ],
  },
  'librari|shad': {
    C: [
      ['b', 'Is that — a Minish? In a library? Oh, I must write this down!'],
      ['a', 'Please don\'t write me down wrong. Everyone always writes us down wrong.'],
    ],
    B: [
      ['b', 'Your handwriting is extraordinary. Is that a whole book, in the margin of a page?'],
      ['a', 'Three books. Corrections, mostly.'],
      ['b', 'I want to read all of them.'],
      ['a', 'You\'ll need a magnifying glass.'],
    ],
    A: [
      ['a', 'You study the Oocca. Sky people. Did you ever meet one?'],
      ['b', 'One. It was everything I dreamed, and also a bit like a chicken.'],
      ['a', 'That\'s how most Hylians describe us. Except the chicken part.'],
    ],
    S: [
      ['b', 'We should write a book together. "Small and Sky-Dwelling Peoples of Hyrule."'],
      ['a', 'With accurate illustrations.'],
      ['b', 'With very accurate illustrations.'],
      ['a', 'Then we have a deal, Scholar Shad.'],
    ],
  },
  'librari|robbie': {
    C: [
      ['b', 'A tiny researcher! Look at those spectacles! Do they magnify?'],
      ['a', 'Everything magnifies when you\'re my size.'],
    ],
    B: [
      ['a', 'Your Guardian machines have the most beautiful insides. I climbed into one.'],
      ['b', 'You WHAT? Did you see the core? The wiring?'],
      ['a', 'I took notes.'],
    ],
    A: [
      ['b', 'Join my lab! You could fit into places no one else can reach!'],
      ['a', 'I have a library to keep.'],
      ['b', 'Then I\'ll send you the blueprints. You send me the corrections.'],
    ],
  },
  // ── Swordmasters ──
  'herosShade|swiftblade': {
    C: [
      ['a', 'Your stance is good. Your guard, less so.'],
      ['b', 'I teach the guard.'],
      ['a', 'Then you teach it badly. Again.'],
    ],
    B: [
      ['b', 'You know techniques the Blade Brothers never wrote down.'],
      ['a', 'I know seven. Most of them died with me.'],
      ['b', 'Not if you teach them to me.'],
    ],
    A: [
      ['a', 'Why do you keep a dojo? You could be a great warrior.'],
      ['b', 'I am. But one great warrior is one sword. A dojo is a hundred.'],
      ['a', '…That is wiser than anything I ever said.'],
    ],
    S: [
      ['a', 'The Ending Blow. The Helm Splitter. All seven. You have them now.'],
      ['b', 'They\'ll be on the scrolls by morning.'],
      ['a', 'Good. Then I can finally stop haunting people.'],
    ],
  },
  'orca|swiftblade': {
    C: [
      ['a', 'Another swordmaster! Shall we spar, friend?'],
      ['b', 'Gladly. Mind the furniture.'],
    ],
    B: [
      ['a', 'My brother thinks swordplay is about strength. I disagree.'],
      ['b', 'Mine thinks it\'s about speed. And another one thinks it\'s about almost dying.'],
      ['a', 'Ha! You have more brothers than I do.'],
    ],
    A: [
      ['b', 'Your students. Do they ever beat you?'],
      ['a', 'One did. A small boy from Outset, with a borrowed sword.'],
      ['b', 'Mine too. A small boy from Hyrule Town. With a talking hat.'],
    ],
    S: [
      ['a', 'A thousand swings a day, friend. Shall we do them together?'],
      ['b', 'Two thousand. One for each of us.'],
      ['n', 'They finish at sunset, arms aching, both of them laughing.'],
    ],
  },
  'darunia|greatblade': {
    C: [
      ['a', 'BROTHER! That sword is almost as big as a Goron hammer!'],
      ['b', 'Almost? It\'s bigger!'],
      ['a', 'Let\'s settle it with a contest of strength!'],
    ],
    B: [
      ['b', 'You split boulders with your bare hands?'],
      ['a', 'And you split them with a sword! A worthy brother!'],
    ],
    A: [
      ['a', 'You fight like a Goron. I mean that as the highest honour.'],
      ['b', 'Then I\'ll take it. Rock Breaker was always my favourite technique.'],
      ['a', 'OF COURSE IT WAS!'],
    ],
  },
  'darkLink|grimblade': {
    C: [
      ['a', '(The shadow copies Grimblade\'s stance perfectly.)'],
      ['b', 'Hm. Even your gloom is accurate.'],
    ],
    B: [
      ['b', 'You are what a hero looks like from the inside, they say.'],
      ['a', '(The shadow tilts its head.)'],
      ['b', 'I wonder what I look like from the inside. Probably worse.'],
    ],
    A: [
      ['b', 'Peril Beam is for when there\'s nothing left. I think you live there.'],
      ['a', '(The shadow lowers its sword, for once.)'],
      ['b', 'Me too, sometimes. It helps to have company.'],
    ],
  },
  // ── Kings ──
  'kingDaltus|kingDaphnes': {
    C: [
      ['b', 'A fellow king of Hyrule. Though from a very different Hyrule.'],
      ['a', 'Oh! Have you any festivals, in yours?'],
      ['b', 'Mine is under the sea.'],
      ['a', 'Oh. Oh dear.'],
    ],
    B: [
      ['a', 'How did you bear it? Watching your kingdom drown?'],
      ['b', 'Badly. Very badly. And then I became a boat.'],
      ['a', 'I was enchanted. I nearly drowned mine myself.'],
    ],
    A: [
      ['b', 'You still have yours, King Daltus. Hold on to it.'],
      ['a', 'With both hands. And a festival every year.'],
      ['b', 'Have one for me.'],
    ],
    S: [
      ['a', 'I\'ve named a festival day for you. The Day of the Red Lion.'],
      ['b', 'You\'ve never even seen my kingdom.'],
      ['a', 'I\'ve seen its king. That\'s enough.'],
      ['b', '…Thank you, my friend.'],
    ],
  },
  'kingDaltus|kingRhoam': {
    C: [
      ['b', 'You are… very jolly, for a king at war.'],
      ['a', 'You are very stern, for a king at all!'],
    ],
    B: [
      ['b', 'I was too hard on my daughter. Pushed her and pushed her.'],
      ['a', 'I was too soft on mine. Never let her do anything.'],
      ['b', 'Perhaps the right way lies between us.'],
    ],
    A: [
      ['a', 'Your daughter saved your kingdom.'],
      ['b', 'After a hundred years. I did not live to see it.'],
      ['a', 'Then I\'ll make sure mine knows, every day, how proud I am. For both of us.'],
    ],
    S: [
      ['b', 'Tell her, King Daltus. Tell her now. Not in a hundred years.'],
      ['a', 'I will.'],
      ['b', 'And bake her a pie, I suppose. That seems to be your way.'],
      ['a', 'It is the best way, Rhoam. It is the best way.'],
    ],
  },
  // ── Wind ──
  'gregal|zephos': {
    C: [
      ['b', 'A Wind Tribe elder! You must know every breeze.'],
      ['a', 'And you must be one. You never stop moving.'],
    ],
    B: [
      ['b', 'My brother and I make the wind. Seasons and storms.'],
      ['a', 'My people live on it. On clouds, in palaces.'],
      ['b', 'Then we\'re neighbours, in a way!'],
    ],
    A: [
      ['a', 'Vaati stole our wind magic. Twisted it into a curse.'],
      ['b', 'Then let\'s untwist it. A good wind, for once.'],
    ],
    S: [
      ['b', 'This one\'s for you, elder. The gentlest breeze I can make.'],
      ['n', 'A soft wind rises, warm as summer, and carries the scent of the clouds down to the ground.'],
      ['a', '…That is the wind of home.'],
    ],
  },
  'cyclos|gregal': {
    C: [
      ['a', 'You. Wind man. Your palace floats in MY sky.'],
      ['b', 'Our sky, I think.'],
    ],
    B: [
      ['a', 'My brother is the gentle one. I am not.'],
      ['b', 'Storms have their place. The fields need rain.'],
      ['a', '…Hmph. Nobody says that.'],
    ],
    A: [
      ['b', 'Will you watch over the Palace of Winds? While I am down here?'],
      ['a', 'Why would I?'],
      ['b', 'Because nobody would dare attack it with you there.'],
      ['a', '…That is true. Fine.'],
    ],
  },
  // ── Constructs ──
  'gohdan|mazaal': {
    C: [
      ['a', 'ANOTHER GUARDIAN. GREETINGS.'],
      ['b', '(Mazaal\'s great stone face turns, slowly, toward the voice.)'],
    ],
    B: [
      ['a', 'YOU HAVE HANDS. I HAVE HANDS. WE WERE MADE BY SIMILAR MINDS.'],
      ['b', '(Mazaal raises one enormous palm. Gohdan raises his. They do not quite touch.)'],
    ],
    A: [
      ['a', 'A MINISH ENTERED YOUR HEAD, I AM TOLD. DID IT HURT?'],
      ['b', '(A long, grinding rumble that may be a laugh.)'],
      ['a', 'THEY ARE VERY PERSISTENT.'],
    ],
    S: [
      ['a', 'OUR MAKERS ARE GONE. WE REMAIN.'],
      ['b', '(Mazaal\'s eye glows, softly.)'],
      ['a', 'THEN WE SHALL REMAIN TOGETHER. AS GUARDIANS DO.'],
    ],
  },
  'eox|mazaal': {
    C: [
      ['a', 'Ancient one. You guard a fortress. I guard a temple.'],
      ['b', '(The stone hands settle, like a nod.)'],
    ],
    B: [
      ['a', 'They broke your mechanisms. Mine were broken too. And yet we move.'],
      ['b', '(A grinding sound, slow and certain.)'],
    ],
    A: [
      ['a', 'We were made to keep people out. Now we fight beside them.'],
      ['b', '(Mazaal\'s eye turns toward the camp, and the small figures sleeping there.)'],
      ['a', 'Yes. It is better, this way.'],
    ],
    S: [
      ['a', 'Shall we stand watch tonight, guardian?'],
      ['b', '(Mazaal rises to its full height, and turns to face the dark.)'],
      ['n', 'Nothing comes near the camp that night.'],
    ],
  },
  'koloktos|mazaal': {
    C: [
      ['a', '(Koloktos\'s six arms flex. Mazaal\'s two hands rise to meet the challenge.)'],
      ['b', '(The ground trembles slightly.)'],
    ],
    B: [
      ['a', '(Koloktos raises one sword in what might be respect.)'],
      ['b', '(Mazaal answers with a slow, grinding bow.)'],
    ],
    A: [
      ['n', 'The two ancient constructs stand guard side by side, motionless, for an entire night.'],
      ['a', '(At dawn, Koloktos taps one blade gently against Mazaal\'s stone hand.)'],
      ['b', '(Mazaal taps back.)'],
    ],
  },
  // ── Monsters and Minish ──
  'gyorg|gyorgFemale': {
    C: [
      ['n', 'The great fish of Great Bay surfaces beside the flying ray. They regard each other warily.'],
      ['a', '(A deep, bubbling growl.)'],
      ['b', '(A low hum from the sky.)'],
    ],
    B: [
      ['a', '(The fish leaps, trying to reach the sky.)'],
      ['b', '(She dips lower, curious, letting it see her wings.)'],
    ],
    A: [
      ['n', 'A storm passes over. The flying Gyorg glides down and shelters over the water, where the other one waits.'],
      ['a', '(The sea Gyorg rises to the surface beneath her shadow, and stays.)'],
    ],
  },
  'goronWarrior|mountainMinishBlacksmith': {
    C: [
      ['a', 'Goro! There\'s something tiny on my shoulder!'],
      ['b', 'Hold still! Your gauntlet\'s got a crack in it!'],
    ],
    B: [
      ['a', 'You fix my gauntlets while I punch things?'],
      ['b', 'Best seat in the house. Warm, too. You\'re very warm.'],
      ['a', 'Goron body heat, brother!'],
    ],
    A: [
      ['b', 'You\'re the first big one who doesn\'t try to swat me off.'],
      ['a', 'Why would I? You\'re my smith now, little brother!'],
      ['b', '…I like that.'],
    ],
  },
  'stewardConstruct|townMinishTinkerer': {
    C: [
      ['a', 'ALERT: SMALL ORGANIC INSIDE MY CHEST PANEL.'],
      ['b', 'Sorry! Just admiring your gears!'],
    ],
    B: [
      ['b', 'Your third cog is slipping. I tightened it.'],
      ['a', 'EFFICIENCY IMPROVED BY 4%. GRATITUDE.'],
      ['b', 'You\'re welcome!'],
    ],
    A: [
      ['a', 'SMALL ORGANIC. YOU MAY RESIDE IN MY CHEST PANEL.'],
      ['b', 'Really? It\'s the coziest place I\'ve ever seen.'],
      ['a', 'IT IS ALSO WARM. I HAVE ADJUSTED THE TEMPERATURE.'],
    ],
  },
};
