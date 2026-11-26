// Support conversations: Twilight Princess (Resistance, Gorons/Zora/Snowpeak, Light Spirits and others, Villains and Monsters). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'rusl|telma': {
    C: [
      ['b', 'You look like a man counting the miles back to Ordon, honey.'], ['a', 'Is it so plain?'],
      ['b', 'Every time a cart rolls past going south, you watch it go.'], ['a', 'Colin is old enough to look after the house. Uli says so. I am less certain.'],
      ['b', 'Then write to them. I\'ll see the letter gets carried. That\'s half of what the Resistance is: knowing who\'s heading where.'],
      ['a', 'Thank you, Telma.'],
    ],
    B: [
      ['b', 'I\'ve put you on the night watch for the supply wagons.'], ['a', 'Not with the scouts?'],
      ['b', 'Ashei scouts. Shad reads. Auru plans. You, honey, are the one man here who has actually raised a child. You notice when something\'s off.'],
      ['a', 'That is a strange reason to choose a sentry.'], ['b', 'It\'s the best reason I\'ve got.'],
      ['n', 'Rusl ties back his sleeves and takes up his sword.'], ['a', 'Then I\'ll watch them as I would watch my own.'],
    ],
    A: [
      ['a', 'You never sleep, do you?'], ['b', 'Somebody has to wipe the tables and count the coin and decide who goes out tomorrow.'],
      ['a', 'Who decides for you?'], ['n', 'Telma pauses, a glass half dried in her hand.'],
      ['b', 'Nobody, I suppose.'], ['a', 'Then tonight I will. Sit. I\'ll mind the bar.'],
      ['b', 'You\'ll water the drinks.'], ['a', 'Only Auru\'s.'], ['b', 'Ha! All right. Just this once.'],
    ],
  },
  'ashei|telma': {
    C: [
      ['a', 'Going out alone again.'], ['b', 'That a question?'], ['a', 'Nope.'],
      ['b', 'You could at least take somebody with you, sweetheart. Rusl. Even Shad.'], ['a', 'Shad would talk.'],
      ['b', 'He would, at that.'], ['n', 'Ashei pulls her fur hood up and leaves without another word.'],
    ],
    B: [
      ['b', 'You came back with your arm in a sling.'], ['a', 'Lizalfos. Two of them. Handled it.'],
      ['b', 'Two, and you alone.'], ['a', 'My father raised me in the mountains. You learn to rely on yourself up there.'],
      ['b', 'Your father isn\'t here, honey. I am. And I\'m telling you, there\'s no shame in calling for help.'],
      ['a', '…Noted.'], ['b', 'That\'s what you say when you mean no.'], ['a', 'Yep.'],
    ],
    A: [
      ['a', 'Telma.'], ['b', 'Mm?'], ['a', 'Took Rusl out with me today. Second pair of eyes.'],
      ['b', 'Well, well. And?'], ['a', 'He spotted an ambush I\'d have walked into.'], ['n', 'Ashei scowls at the floor as if it had insulted her.'],
      ['a', 'Don\'t make a thing of it.'], ['b', 'I would never. I\'ll just pour you something warm and smile a lot.'], ['a', '…Fine.'],
    ],
  },
  'auru|telma': {
    C: [
      ['a', 'I\'ve gone over our stores. Arrows, rations, lamp oil. We\'re thin on all of it.'], ['b', 'And here I thought you came by for my company.'],
      ['a', 'That too. But mostly the oil.'], ['b', 'I\'ve got a merchant in Castle Town who owes me a favor. I\'ll lean on him.'],
      ['a', 'Lean gently. We need him again next month.'], ['b', 'Honey, I always lean gently.'],
    ],
    B: [
      ['a', 'Our maps of the field are a disgrace. Half of them predate the twilight.'], ['b', 'So redraw them.'],
      ['a', 'I am. Ashei brings me the north, Rusl the south. Shad brings me footnotes.'], ['b', 'Footnotes are free, at least.'],
      ['n', 'Auru spreads a fresh sheet across the bar, pinned under four empty mugs.'], ['a', 'Without you, there\'d be no table to draw on. Don\'t think I forget it.'],
      ['b', 'You\'re getting sentimental in your old age.'], ['a', 'I was always sentimental. I just hid it under armor.'],
    ],
    A: [
      ['b', 'You ever wonder what we\'ll do when there\'s nothing left to resist?'], ['a', 'Often.'],
      ['b', 'And?'], ['a', 'I\'ll go back to the lake. Fish. Fall asleep in a chair. You?'],
      ['b', 'Same bar. Same tables. Only the folks sitting at them will be laughing instead of whispering.'],
      ['a', 'Then that\'s what we\'re keeping running. Not the Resistance. The bar.'], ['b', 'Ha. Don\'t tell the others. They think it\'s noble.'],
    ],
  },
  'shad|telma': {
    C: [
      ['a', 'Telma, have you seen my notebook? The green one, with the Oocca glyphs on page forty?'], ['b', 'Under your elbow, sugar.'],
      ['a', 'Oh. So it is.'], ['b', 'You\'ve been at that corner table since breakfast. You know there\'s a war outside?'],
      ['a', 'I know. I simply feel more useful in here.'], ['b', 'Mm. We\'ll see about that.'],
    ],
    B: [
      ['b', 'I need someone to talk the Kakariko traders into a better price on bombs.'], ['a', 'Me? I\'m hardly a negotiator.'],
      ['b', 'You speak four dead languages. Surely you can manage one living one.'], ['a', 'That is not how languages work.'],
      ['n', 'He goes anyway. He comes back with the bombs and a list of corrections to their ledger.'],
      ['a', 'They were miscounting. I simply… pointed it out.'], ['b', 'You got us a discount by being a know-it-all. I\'m so proud.'],
    ],
    A: [
      ['a', 'I held the line at the bridge today. With a sword. An actual sword.'], ['b', 'I heard. Ashei said you didn\'t even drop it.'],
      ['a', 'I very nearly did. Twice.'], ['b', 'But you didn\'t.'],
      ['a', 'My father always said a scholar who won\'t step outside the library is only half a scholar.'],
      ['b', 'Then I reckon you\'re a whole one now.'], ['n', 'Shad straightens his glasses, trying and failing not to grin.'],
    ],
  },
  'renado|telma': {
    C: [
      ['a', 'Telma. You came all the way from Castle Town.'], ['b', 'Somebody had to bring the bandages, Renado. And I wanted to see Kakariko still standing.'],
      ['a', 'It stands. Barely, but it stands.'], ['b', 'And you look like you haven\'t slept since the twilight fell.'],
      ['a', 'The children need watching. Luda. The Zora prince.'], ['b', 'Then I\'ll watch you while you watch them.'],
    ],
    B: [
      ['b', 'You took a hit for Shad out there. Don\'t think I didn\'t see.'], ['a', 'It was nothing.'],
      ['b', 'It was a spear, honey. Sit still.'], ['n', 'Telma winds a bandage around his arm with practiced, unhurried hands.'],
      ['a', 'You have done this before.'], ['b', 'Run a bar long enough, you patch up more brawlers than a field medic.'],
      ['a', 'And who patches you?'], ['b', '…Nobody\'s asked that in a long time.'],
    ],
    A: [
      ['a', 'I worry for you, Telma. You put yourself in the path of every danger in Castle Town.'], ['b', 'And you live under a volcano next to a graveyard. Pot, kettle.'],
      ['a', 'I am serious.'], ['b', 'I know you are. That\'s what I like about you.'],
      ['n', 'Renado is quiet for a long moment.'], ['a', 'When this is over, I would like you to visit Kakariko. When it is not a refuge, only a village.'],
      ['b', 'I\'d like that, Renado. I really would.'],
    ],
    S: [
      ['a', 'Telma, the spring in Kakariko has warmed again. The children are bathing in it, shrieking with joy.'], ['b', 'Sounds like heaven.'],
      ['a', 'It would be closer to heaven if you were there.'], ['n', 'Telma sets down her cloth.'],
      ['b', 'Are you asking me what I think you\'re asking, Renado?'], ['a', 'I am asking you to stay. Not forever, if you do not wish it. Only… often.'],
      ['b', 'Honey, I\'ve been waiting for a man with sense to ask me that.'], ['a', 'Then I am glad I finally found some.'],
      ['n', 'Her laugh fills the room, and the shaman smiles like a much younger man.'],
    ],
  },
  'ashei|auru': {
    C: [
      ['b', 'You favor your left leg when you charge.'], ['a', 'Old wound. Doesn\'t matter.'],
      ['b', 'It matters to the Bulblin who sees it first.'], ['a', 'You were a soldier.'],
      ['b', 'Long ago. Before you were born, I\'d wager.'], ['a', 'Doesn\'t mean you know how I fight.'], ['b', 'No. But I know how you\'ll get hurt.'],
    ],
    B: [
      ['a', 'You don\'t move fast.'], ['b', 'I don\'t need to. I move first.'],
      ['a', 'Explain.'], ['b', 'You young ones react. I\'ve seen enough battles to guess where the next blow will land before it\'s thrown.'],
      ['n', 'Ashei considers this, then sets her spear aside and watches him spar with Rusl.'],
      ['a', 'He swings wide when he\'s tired.'], ['b', 'Good. Now you\'re thinking like a veteran.'],
    ],
    A: [
      ['a', 'My father would\'ve liked you.'], ['b', 'Was he a soldier too?'],
      ['a', 'Mountain guard. Taught me to fight alone because he was all I had.'], ['b', 'He taught you well.'],
      ['a', 'You\'re teaching me something he didn\'t.'], ['b', 'Oh?'], ['a', 'When to let somebody else take the first blow.'],
      ['b', 'Then I\'ll make sure I\'m worth standing behind.'],
    ],
  },
  'ashei|shad': {
    C: [
      ['b', 'Did you know the stone circles near the bridge predate the royal family by—'], ['a', 'No.'],
      ['b', '—by at least three centuries? I believe they were—'], ['a', 'Shad.'], ['b', 'Yes?'],
      ['a', 'Bulblins. Behind the stone circles. Talk later.'], ['n', 'Shad drops his notebook and scrambles after her.'],
    ],
    B: [
      ['b', 'You saved my life today. Thank you.'], ['a', 'You\'d have managed. Probably.'],
      ['b', 'I was hiding behind a cart reciting Oocca prayers.'], ['a', 'Yeah. That part didn\'t help.'],
      ['b', 'Still. You decoded that Bulblin signal fire before I did. I\'d spent hours on it.'], ['a', 'Smoke\'s just a language. Same as your books.'],
      ['b', 'Ashei, that\'s… rather profound.'], ['a', 'Don\'t write it down.'],
    ],
    A: [
      ['a', 'Read me something.'], ['b', 'I beg your pardon?'], ['a', 'From the notebook. The Oocca stuff. Can\'t sleep.'],
      ['n', 'Shad clears his throat, delighted, and begins.'],
      ['b', '"And the city rose upon the wind, and the people who dwelt there…" Are you asleep already?'], ['a', 'No. Keep going.'],
      ['b', 'I never imagined you\'d find this interesting.'], ['a', 'I find you interesting. Different thing.'],
    ],
    S: [
      ['b', 'Ashei, I\'ve been meaning to ask… after the war, would you consider joining me in the field? For research?'], ['a', 'Field means outside?'],
      ['b', 'Ruins, mostly. Mountains. Places with Bulblins in them, I should think.'], ['a', 'You\'d need a guard.'],
      ['b', 'I\'d need you. Not as a guard. As a… partner.'], ['n', 'Ashei looks at him for a long time.'],
      ['a', 'You\'ll talk the whole way.'], ['b', 'Almost certainly.'], ['a', '…Yep. All right.'],
    ],
  },
  'ashei|yeto': {
    C: [
      ['n', 'Ashei keeps her spear angled toward the enormous furred figure stirring a pot.'], ['b', 'Little warrior want soup?'],
      ['a', 'What are you?'], ['b', 'Yeto is Yeto. Yeto live on mountain with wife.'],
      ['a', 'I\'ve seen your footprints near Snowpeak. Thought you were a monster.'], ['b', 'Yeto get that a lot. Soup is good though.'],
    ],
    B: [
      ['a', 'I followed you this morning.'], ['b', 'Yeto know. Little warrior is very loud in snow.'],
      ['a', '…I am not loud.'], ['b', 'Loud for Yeto. Yeto hear fish under ice.'],
      ['a', 'You went to the frozen lake. Caught a reekfish with your bare hands.'], ['b', 'For Yeta. She is sick. Fish make her strong.'],
      ['n', 'Ashei finally lowers her spear.'], ['a', 'Huh. Not a monster, then.'],
    ],
    A: [
      ['a', 'I grew up near Snowpeak. Always heard stories of a beast on the summit.'], ['b', 'Stories about Yeto?'],
      ['a', 'Probably. They said it ate travelers.'], ['b', 'Yeto never eat traveler. Yeto give traveler soup.'],
      ['a', 'I know. I\'m sorry I didn\'t trust you.'], ['b', 'Is okay. Mountain teach you be careful. Mountain teach Yeto too.'],
      ['a', 'Save me a bowl, then.'], ['b', 'Yeto always save bowl for friend.'],
    ],
  },
  'ashei|rusl': {
    C: [
      ['b', 'Your stance is unusual. Low and wide.'], ['a', 'Ice. You fight on ice, you stay low or you fall.'],
      ['b', 'That makes sense. In Ordon we train in the woods. Roots and mud.'], ['a', 'You step high.'],
      ['b', 'Old habit. A stray root has dropped many a swordsman in Faron.'], ['a', 'Different ground. Different fighters.'],
    ],
    B: [
      ['a', 'Who taught you?'], ['b', 'An old soldier who came to Ordon to retire. And then I taught Link.'],
      ['a', 'He fights like you.'], ['b', 'Better than me, now. That is how it should be.'],
      ['a', 'My father taught me with a stick and bruises.'], ['b', 'Mine too. I tried to be gentler with Link. I am not sure I managed it.'],
      ['n', 'Ashei almost smiles.'], ['a', 'He seems fine.'],
    ],
    A: [
      ['b', 'Spar with me. I want to learn that low guard.'], ['a', 'You\'ll hate it. Your knees will hate it more.'],
      ['b', 'I am not too old to learn.'], ['n', 'An hour later Rusl is sitting in the grass, breathing hard.'],
      ['b', 'My knees do hate it.'], ['a', 'Told you. But your footwork was better at the end.'],
      ['b', 'Teach me the rest tomorrow?'], ['a', 'Yep. Bring ice for those knees.'],
    ],
  },
  'auru|shad': {
    C: [
      ['b', 'Auru, you once mentioned ruins near the desert. Arbiter\'s Grounds?'], ['a', 'I did. Grim place.'],
      ['b', 'I\'ve read every account of it in the castle library. None of them describe the interior.'], ['a', 'That\'s because few who go in come back to write.'],
      ['b', 'You did.'], ['a', 'I was lucky. And I didn\'t take notes.'], ['b', 'Unforgivable.'],
    ],
    B: [
      ['a', 'The symbols on this stone. You can read them?'], ['b', 'Some. They\'re Hylian, but very old. Older than the castle.'],
      ['a', 'What do they say?'], ['b', '"Here the sages… sealed… one who would not die." Then the stone breaks off.'],
      ['n', 'Auru goes very quiet.'], ['a', 'I always suspected the Mirror of Twilight was not the only thing out there.'],
      ['b', 'You suspected? You knew?'], ['a', 'An old soldier hears rumors. A young scholar proves them.'],
    ],
    A: [
      ['b', 'I\'ve compiled everything. Your memories of the desert, my translations, Ashei\'s maps.'], ['a', 'All of it in one book?'],
      ['b', 'Three books, actually. With an index.'], ['a', 'Ha! Of course.'],
      ['b', 'I wanted to put your name on it. Alongside mine.'], ['a', 'Mine? I only walked around in the dust.'],
      ['b', 'Without the man who walks in the dust, there is nothing for the scholar to read.'], ['a', '…Then I\'d be honored, Shad.'],
    ],
  },
  'auru|herosShade': {
    C: [
      ['n', 'The golden wolf\'s spirit takes a man\'s shape in the dark beyond the campfire.'], ['b', 'You carry yourself like a soldier of the old guard.'],
      ['a', 'I served the royal family, once. Who are you?'], ['b', 'One who served it far longer ago.'],
      ['a', 'There are no records of soldiers in armor like yours.'], ['b', 'No. There would not be.'],
    ],
    B: [
      ['a', 'I\'ve read every roster of the Hylian army back two hundred years. Your name isn\'t in any of them.'], ['b', 'My name was never written down.'],
      ['a', 'How is that possible?'], ['b', 'Some deeds are remembered. The people who did them are not.'],
      ['a', 'That\'s a hard thing to accept.'], ['b', 'It was hard. Then it was simply true.'],
      ['n', 'Auru sets down his quill. He does not write anything for a long while.'],
    ],
    A: [
      ['a', 'I\'ve started a new list. Soldiers whose names were never recorded. The ones I remember, at least.'], ['b', 'Why?'],
      ['a', 'Because someone should. I\'d like to add yours, if you\'ll tell it to me.'],
      ['b', 'I have not spoken it in a very long time.'], ['n', 'The Shade leans close and says it, quietly.'],
      ['a', 'There. It\'s written.'], ['b', 'Thank you, soldier. That is more than I hoped for.'],
    ],
  },
  'ooccoo|shad': {
    C: [
      ['b', 'Oh my— oh my goodness. You\'re— you\'re an Oocca. A real Oocca.'], ['a', 'Hm? Yes, dear. And you are…?'],
      ['b', 'Shad. A scholar. I\'ve spent my whole life studying your people!'], ['a', 'How flattering! Do you have a pot I could sit in? I\'ve been flying all day.'],
      ['n', 'Shad empties his satchel onto the ground without hesitation.'], ['b', 'Will this do?'], ['a', 'Perfectly!'],
    ],
    B: [
      ['b', 'Is it true the Oocca built the City in the Sky?'], ['a', 'Oh, it\'s true! Though the parts with the windmills were my great-grandmother\'s idea.'],
      ['b', 'And you are… closer to the gods than Hylians?'], ['a', 'Closer to the clouds, certainly. I wouldn\'t say the gods, dear.'],
      ['b', 'My father would have given anything to hear this.'], ['a', 'Then write it all down. I\'ll tell you everything. Well. Most things.'],
      ['b', 'What do you leave out?'], ['a', 'Recipes. A lady has her secrets.'],
    ],
    A: [
      ['a', 'You\'re very sweet, Shad. Your father would be proud.'], ['b', 'He spent years searching for the city. He never found it.'],
      ['a', 'Then perhaps you\'ll see it for him.'], ['b', 'You\'d… show me?'],
      ['a', 'When the war is over, my son and I will take you up. Ooccoo Jr. will want to meet you.'],
      ['n', 'Shad has to take off his glasses and wipe them for a while.'], ['b', 'Thank you. Truly.'],
    ],
  },
  'shad|zeldaTP': {
    C: [
      ['a', 'Your Highness. Forgive me, I don\'t mean to intrude.'], ['b', 'You don\'t intrude, Shad. You were reading the royal genealogies, weren\'t you?'],
      ['a', 'Ah. Yes. The copies I had were water-damaged. I didn\'t know whether to ask.'],
      ['b', 'Ask. There is no shame in wanting to know where we come from.'], ['a', 'That is very generous.'],
    ],
    B: [
      ['a', 'There\'s a gap in the royal records. Centuries ago. As if a whole generation simply vanished.'], ['b', 'I\'ve noticed it as well.'],
      ['a', 'Do you know why?'], ['b', 'There are stories of a war against the Gerudo. Of an exile to another realm.'],
      ['a', 'The Twili.'], ['b', 'Yes. My ancestors were not always kind, Shad. The history is not only glory.'],
      ['n', 'Shad looks up from his book, startled at her candor.'],
    ],
    A: [
      ['b', 'I\'d like you to help me rewrite the royal history. Honestly, this time.'], ['a', 'Your Highness?'],
      ['b', 'Hyrule hid its mistakes. The Twili paid for it. I won\'t let that happen again.'], ['a', 'It would be an honor.'],
      ['b', 'Be thorough. Even about my family.'], ['a', 'Especially about your family, I should think.'],
      ['b', 'Yes. Especially then.'],
    ],
  },
  'darbus|gorCoron': {
    C: [
      ['b', 'Patriarch! You\'re on your feet again, goro!'], ['a', 'Gor Coron. You kept the tribe together while I was… away.'],
      ['b', 'Away! You were a raging fire-beast in the mines, brother. That\'s more than away.'], ['a', 'Ha! True enough.'],
      ['b', 'The elders and I did what we could. It wasn\'t easy.'], ['a', 'I know. I am grateful. The tribe is mine to carry again now.'],
    ],
    B: [
      ['a', 'The young ones still flinch when I walk by.'], ['b', 'They saw what you became, brother. It will take time.'],
      ['a', 'Time. I am not a patient Goron.'], ['b', 'No Goron is patient! We roll everywhere!'],
      ['a', 'Ha! Then what do I do?'], ['b', 'Eat with them. Wrestle with them. Lose a match or two, goro.'],
      ['n', 'Darbus rubs his chin, considering.'], ['a', 'Lose on purpose? You ask much, elder.'],
    ],
    A: [
      ['a', 'I wrestled the children today. All of them at once.'], ['b', 'And?'],
      ['a', 'They pinned me. I let them. They laughed for an hour.'], ['b', 'Ha! That\'s a Patriarch, brother.'],
      ['a', 'You were right. They needed to see I could be gentle.'], ['b', 'The tribe doesn\'t need a fist, goro. It needs a heart. You\'ve always had a big one.'],
      ['a', 'And a big belly.'], ['b', 'That too!'],
    ],
    S: [
      ['a', 'Gor Coron. When I am gone, I want you to stand with whoever leads next.'], ['b', 'Don\'t talk like that, brother.'],
      ['a', 'I speak plainly. Darkness nearly took me once. It could again.'], ['b', 'Then it would have to go through me first, goro.'],
      ['n', 'The two Gorons clasp forearms, rock against rock.'],
      ['a', 'You and I. Sworn brothers. For the tribe, until the mountain itself sleeps.'], ['b', 'Until the mountain sleeps, Patriarch. Goro!'],
    ],
  },
  'dangoro|gorCoron': {
    C: [
      ['b', 'Dangoro! Still standing guard over the mine\'s deepest chamber?'], ['a', 'Always, elder. No one passes without proving their strength.'],
      ['b', 'Even me?'], ['a', '…You are the elder.'], ['b', 'Ha! That\'s not a no, goro.'], ['a', 'It is not a no.'],
    ],
    B: [
      ['a', 'Elder, a question. The mine was overrun while I stood guard. Did I fail?'], ['b', 'Failed? Brother, you held one chamber while the whole mountain burned.'],
      ['a', 'One chamber was not enough.'], ['b', 'One chamber was what you were asked to hold. And you held it.'],
      ['n', 'Dangoro stares at his enormous fists.'], ['a', 'I will hold more next time.'], ['b', 'Then I\'ll stand beside you to help.'],
    ],
    A: [
      ['b', 'The others ask me why you take guard duty so seriously, goro.'], ['a', 'What do you tell them?'],
      ['b', 'That a guardian\'s strength isn\'t in his arms. It\'s in not moving when everything tells him to run.'],
      ['a', 'That is… well spoken, elder.'], ['b', 'I\'ve had a long time to think about it. Watching you.'],
      ['a', 'Then I will not move. Not for anything.'], ['b', 'Except dinner.'], ['a', 'Except dinner.'],
    ],
  },
  'gorCoron|mayorBo': {
    C: [
      ['b', 'Well, if it isn\'t Gor Coron! Haven\'t seen you since our last match!'], ['a', 'Bo! And you\'ve gotten soft since then, brother!'],
      ['b', 'Soft? I\'ve been raising a daughter and running a village!'], ['a', 'Soft, goro.'],
      ['b', 'Ha! You want a rematch? I\'ll give you a rematch!'], ['a', 'After the battle. I won\'t have you blaming fatigue.'],
    ],
    B: [
      ['n', 'The two of them crouch in a ring of rope behind the camp. A small crowd gathers.'], ['b', 'Ready?'], ['a', 'Born ready!'],
      ['n', 'They slam together. Bo skids back three paces and holds.'], ['a', 'Oho! You\'ve been practicing!'],
      ['b', 'Ilia caught me on the roof last week. Said I was too old to be climbing. I\'ll show her old!'],
      ['a', 'Again!'], ['b', 'Again!'],
    ],
    A: [
      ['b', 'That makes it twelve wins to you, eleven to me.'], ['a', 'Twelve to eleven. Close as it ever was, brother.'],
      ['b', 'You know, I taught Link everything he knows about sumo. Learned it all from losing to you.'], ['a', 'Ha! Then I\'m partly responsible for the hero, goro.'],
      ['b', 'Don\'t let it go to your head.'], ['a', 'Too late. Rematch tomorrow?'], ['b', 'You bet. And I\'m tying it up.'],
    ],
  },
  'dangoro|darbus': {
    C: [
      ['a', 'Patriarch.'], ['b', 'Dangoro. You guarded the mine while I was lost.'],
      ['a', 'I tried. The fire was everywhere.'], ['b', 'The fire was me, brother.'],
      ['a', '…Yes.'], ['b', 'And still you stayed. That is the kind of warrior the tribe needs.'],
    ],
    B: [
      ['b', 'Come. Wrestle with me.'], ['a', 'Patriarch, you have only just recovered.'],
      ['b', 'All the more reason. I need to know my strength is mine again.'],
      ['n', 'They grapple until the earth groans. Neither moves.'], ['a', 'You are strong as ever.'],
      ['b', 'And you, Dangoro, are stronger than I remembered. Ha!'],
    ],
    A: [
      ['a', 'When the fire-beast came for my chamber, I did not fight it.'], ['b', 'You knew it was me.'],
      ['a', 'I knew. I could not raise my hand to you.'], ['n', 'Darbus is silent for a long moment.'],
      ['b', 'You should have, brother. Next time, if it comes to that, you strike.'], ['a', 'I… will try.'],
      ['b', 'Promise me.'], ['a', 'I promise, Patriarch.'],
    ],
    S: [
      ['b', 'Dangoro. I name you my sworn shield.'], ['a', 'Patriarch?'],
      ['b', 'Where I go, you go. Where I fall, you stand. And if I lose myself again, you are the one who brings me back.'],
      ['a', 'That is a great honor.'], ['b', 'It is a great burden. I would only give it to someone I trust above all others.'],
      ['n', 'Dangoro kneels, the ground shaking under him.'], ['a', 'Then I accept. For you, and for the tribe. Goro.'],
    ],
  },
  'darbus|fyrus': {
    C: [
      ['n', 'At the edge of camp, chained in magic, the great flaming beast lifts its head as Darbus approaches.'],
      ['b', 'GRRRAAAH!'], ['a', 'So. This is what I was.'],
      ['n', 'The crystal in Fyrus\'s brow glows the same color Darbus once saw behind his own eyes.'],
      ['a', 'I remember the heat. I remember not remembering anything else.'], ['b', 'Hrrrnnn…'],
    ],
    B: [
      ['a', 'They tell me you fight for us now. Some echo of the Fused Shadow, held together by whatever magic brought us here.'],
      ['n', 'Fyrus\'s chains clink. Embers drift from its shoulders.'], ['a', 'Do you remember the tribe?'],
      ['b', 'Grrrk.'], ['a', 'No. Neither did I, while I was you.'],
      ['n', 'Darbus sits down on a stone within reach of the flames and does not flinch.'], ['a', 'Then I will remember for both of us.'],
    ],
    A: [
      ['a', 'I have stopped being afraid of you.'], ['n', 'The beast tilts its burning head.'],
      ['a', 'You are not something that was done to me. You are a part of me that I did not control. Rage. Hunger. Pride.'],
      ['a', 'Every Goron carries those. Mine simply grew a body.'], ['b', 'Hrrrm…'],
      ['n', 'For the first time, the flames around Fyrus burn low and steady, like a hearth.'],
      ['a', 'Good. Stay like that, brother. Fight beside me, and stay like that.'],
    ],
  },
  'ralis|rutela': {
    C: [
      ['a', 'Mother?'], ['b', 'Ralis. My son. You\'ve grown so tall.'],
      ['a', 'I— I thought I would never see you again. I thought…'], ['b', 'I know, my darling. I\'m here. For now, I\'m here.'],
      ['n', 'The queen\'s ghostly form flickers like light through water.'], ['a', 'For now?'],
    ],
    B: [
      ['a', 'Mother, I was so sick in Kakariko. I didn\'t know you had died. No one told me.'], ['b', 'You were a child, Ralis. They protected you.'],
      ['a', 'I should have been there.'], ['b', 'You would have died too. That is what I feared most.'],
      ['a', 'Did it hurt?'], ['n', 'Rutela is quiet for a moment.'],
      ['b', 'Only the part where I did not know if you were safe. Everything else, I have forgotten.'],
    ],
    A: [
      ['b', 'You lead our people now, Ralis.'], ['a', 'I don\'t know how. Father never taught me. You never had the chance.'],
      ['b', 'You lead them already. I have watched you. You speak gently. You listen.'], ['a', 'Is that enough?'],
      ['b', 'It is more than most kings manage.'], ['n', 'Ralis lowers his head. His mother\'s cold, glowing hand rests on his crown.'],
      ['a', 'I\'ll try, Mother. I\'ll try to make you proud.'], ['b', 'You already have.'],
    ],
    S: [
      ['b', 'Ralis. I can feel it. My time here is nearly over.'], ['a', 'No. Not yet. Please, there\'s so much I haven\'t told you.'],
      ['b', 'Then tell me now.'], ['a', 'I— I love you. I\'m sorry I wasn\'t there. I miss you every day.'],
      ['b', 'I love you too, my son. I have never been anywhere but at your side. Not truly.'],
      ['n', 'Her light softens into the shimmer of the river.'], ['b', 'Whenever you swim in Zora\'s Domain, I will be with you.'],
      ['a', 'Goodbye, Mother.'], ['b', 'Not goodbye. Only… until the water carries us together again.'],
    ],
  },
  'ralis|zeldaTP': {
    C: [
      ['a', 'Princess Zelda. I… don\'t know what to say to you. You lost your father too, didn\'t you?'], ['b', 'Long ago. Before I could remember him well.'],
      ['a', 'I lost my mother. Only recently.'], ['b', 'I\'m sorry, Prince Ralis. Truly.'],
      ['a', 'How did you learn to rule? So young?'], ['b', 'I\'m not sure I have yet.'],
    ],
    B: [
      ['b', 'You speak to your people as if apologizing to them.'], ['a', 'Is that wrong?'],
      ['b', 'Not wrong. But they need to see you believe in your own decisions.'], ['a', 'What if I don\'t?'],
      ['b', 'Then you hide it. I hid it for years.'], ['n', 'Ralis looks up, surprised.'],
      ['a', 'You were frightened?'], ['b', 'Every day. I still am.'],
    ],
    A: [
      ['a', 'I gave my first real order today. To the Zora soldiers. They obeyed.'], ['b', 'How did it feel?'],
      ['a', 'Terrifying. And then… right.'], ['b', 'That is the whole of it, Ralis. Frightened, and then right.'],
      ['a', 'Will it get easier?'], ['b', 'No. But you will get stronger.'], ['a', 'Then I\'ll be strong. For Mother. For them.'],
    ],
  },
  'lanayru|ralis': {
    C: [
      ['n', 'A vast serpent of light coils above the water, holding a glowing orb in its jaws.'], ['a', 'Child of the Zora.'],
      ['b', 'You\'re Lanayru. The spirit my people pray to.'], ['a', 'Your people have always kept my waters pure. I remember each of your kings.'],
      ['b', 'I\'m not a king yet.'], ['a', 'You will be.'],
    ],
    B: [
      ['b', 'When the twilight froze our domain, why didn\'t you stop it?'], ['a', 'I was weakened. My light was stolen.'],
      ['b', 'My mother died in that time.'], ['a', 'I know. I grieved her as I grieve every Zora who passes.'],
      ['b', 'Even spirits grieve?'], ['a', 'Spirits do little else, child. We remember everything.'],
    ],
    A: [
      ['a', 'The Zora look to you now. And through you, to me.'], ['b', 'What should I tell them?'],
      ['a', 'That the water remembers. That it will flow again, clean and cold, so long as they tend it.'],
      ['b', 'And so long as I tend them.'], ['a', 'Yes. That is the duty. Mine to the water. Yours to the people.'],
      ['n', 'The serpent dips its head low, almost a bow.'], ['b', 'Then I\'ll keep it. I promise.'],
    ],
  },
  'lanayru|rutela': {
    C: [
      ['b', 'Great Spirit. I have a favor to ask of you.'], ['a', 'Speak, Queen of the Zora.'],
      ['b', 'My body is gone. My spirit lingers only by your grace. I want to use what time I have to protect Ralis.'],
      ['a', 'You have already done so. You guided the hero to him.'], ['b', 'It is not enough.'],
    ],
    B: [
      ['a', 'Why do you cling to this world so tightly, Rutela?'], ['b', 'Because he is still so young.'],
      ['a', 'He is older than you think.'], ['b', 'To a mother, never.'],
      ['n', 'The light spirit\'s coils shimmer, something like amusement.'], ['a', 'Then I will lend you my waters a while longer.'],
    ],
    A: [
      ['b', 'When I am gone, will you watch him?'], ['a', 'I watch all Zora.'],
      ['b', 'Watch him a little more than the others. Please.'], ['a', '…I will.'],
      ['b', 'Thank you, Lanayru. Then I can rest.'], ['n', 'The queen\'s ghost dims, peaceful at last, at the edge of the spirit\'s light.'],
      ['a', 'Rest, Rutela. Your son is in good waters.'],
    ],
  },
  'renado|rutela': {
    C: [
      ['b', 'You are the shaman of Kakariko.'], ['a', 'I am. And you are the Zora Queen. I had feared you were lost.'],
      ['b', 'I am lost, in the ways that matter. But I wanted to thank you.'], ['a', 'For Ralis.'],
      ['b', 'For Ralis. You sheltered him when I could not.'], ['a', 'It was no more than any father would do.'],
    ],
    B: [
      ['b', 'How was he, in your village? Truly?'], ['a', 'Feverish, at first. Frightened. He asked for you in his sleep.'],
      ['n', 'The queen\'s light wavers.'], ['a', 'My daughter Luda sat with him every night. She brought him water from the spring.'],
      ['b', 'Then I owe her as well.'], ['a', 'She would tell you it was nothing. She has her mother\'s modesty.'],
    ],
    A: [
      ['b', 'I have little to give you, shaman. I have no body, no treasure, no throne.'], ['a', 'I want nothing.'],
      ['b', 'Then take this. A Zora blessing. It will keep your spring clean for a hundred years.'],
      ['n', 'Cool light flows from her hands into the shaman\'s palms.'], ['a', 'Queen Rutela… thank you.'],
      ['b', 'No. Thank you. You kept my son alive. Every tide that touches Kakariko will remember it.'],
    ],
  },
  'yeta|yeto': {
    C: [
      ['b', 'Yeta! Yeta feel better today?'], ['a', 'A little, Yeto. The cold doesn\'t bite so much.'],
      ['b', 'Yeto make soup. Special soup.'], ['a', 'With pumpkin?'], ['b', 'With pumpkin AND cheese.'],
      ['a', 'Oh, Yeto. You always know.'],
    ],
    B: [
      ['a', 'Yeto, I keep dreaming of the mirror. The cold. How I wasn\'t myself.'], ['b', 'Yeta not like that now.'],
      ['a', 'But I was. I said such cruel things to you.'], ['b', 'Yeto not remember cruel things. Yeto only remember Yeta.'],
      ['n', 'He wraps an enormous furry arm around her.'], ['a', 'You\'re a terrible liar, dear.'], ['b', 'Yeto good liar. Yeta just know Yeto too well.'],
    ],
    A: [
      ['b', 'Yeto go fishing. Catch reekfish. For Yeta.'], ['a', 'You don\'t have to fight every day for me, Yeto.'],
      ['b', 'Yeto want to. Yeto promise when marry Yeta: always keep warm, always keep fed.'],
      ['a', 'And I promised to take care of you too. Let me come this time.'], ['b', '…Yeta come?'],
      ['a', 'I\'m strong enough now. I want to try.'], ['b', 'Okay. Yeto carry Yeta if Yeta get tired.'],
    ],
    S: [
      ['a', 'Yeto, do you remember the day we came to the mansion?'], ['b', 'Yeto remember. Snow everywhere. Yeta laugh and laugh.'],
      ['a', 'I want to laugh like that again.'], ['b', 'Yeta will. Yeto make sure.'],
      ['n', 'They sit together by the fire, her head against his shoulder, snow falling quietly outside.'],
      ['a', 'You never once gave up on me.'], ['b', 'Yeto never give up. Yeto love Yeta forever. That is all Yeto know.'],
      ['a', 'That is all anyone needs to know, dear.'],
    ],
  },
  'gorCoron|yeto': {
    C: [
      ['b', 'You big furry. Yeto hear you strong.'], ['a', 'Ha! I\'m the strongest elder on Death Mountain, brother!'],
      ['b', 'Yeto strongest on Snowpeak.'], ['a', 'Is that so? Then there\'s only one way to settle it, goro!'],
      ['b', 'Soup-eating contest?'], ['a', '…I was going to say sumo.'],
    ],
    B: [
      ['n', 'The Goron and the yeti lock arms in a ring of trampled snow. Neither gives an inch.'],
      ['a', 'Hnnngh! You\'re… heavy… goro!'], ['b', 'Yeto eat many pumpkin.'],
      ['n', 'They both topple sideways at once into a snowbank.'], ['a', 'A draw?'], ['b', 'Draw. Now soup.'],
    ],
    A: [
      ['a', 'Twelve matches and still no clear winner, brother.'], ['b', 'Yeto think we same strong.'],
      ['a', 'I think you might be right. Though I\'d never say it to Bo.'], ['b', 'Yeto not tell.'],
      ['a', 'You know, the Gorons would welcome you on Death Mountain. You and Yeta both.'],
      ['b', 'Too hot for Yeto. But Gor Coron always welcome on Snowpeak.'], ['a', 'Too cold for me! Ha! Then we\'ll meet halfway, goro.'],
    ],
  },
  'darbus|yeto': {
    C: [
      ['a', 'You live on that frozen peak? Ha! How do you not freeze solid?'], ['b', 'Yeto have fur. Big fur.'],
      ['a', 'Gorons have stone skin and a fire in our bellies. We could never live there.'],
      ['b', 'Yeto never live in fire mountain. Yeto melt.'], ['a', 'Ha! Then we each keep our own mountain, brother.'],
    ],
    B: [
      ['b', 'How Goron find food on fire mountain?'], ['a', 'Rocks! The best rocks are near the lava. Rich and crunchy.'],
      ['b', 'Yeto eat rock? No. Yeto eat fish under ice.'], ['a', 'Fish? Hm. Too soft.'],
      ['b', 'Rock too hard.'], ['n', 'They stare at each other, then both laugh, loud enough to shake the snow from the trees.'],
    ],
    A: [
      ['a', 'When the storms come on Death Mountain, we curl into balls and roll into the caves.'], ['b', 'When storm come on Snowpeak, Yeto go inside, keep Yeta warm.'],
      ['a', 'So in the end it is the same. You protect your family. I protect my tribe.'],
      ['b', 'Mountain hard. Family make it soft.'], ['a', 'Ha! You\'re wiser than you look, brother.'],
      ['b', 'Yeto get that a lot too.'],
    ],
  },
  'blizzeta|yeta': {
    C: [
      ['n', 'An ice-crystal monster hangs in the cold air beyond the camp. Yeta stands before it, trembling.'],
      ['b', 'That… that\'s my face. Inside the ice.'], ['n', 'Blizzeta\'s shards chime, a sound almost like a laugh.'],
      ['b', 'Is it really me?'], ['a', '…Mine…'], ['b', 'No. I don\'t belong to you anymore.'],
    ],
    B: [
      ['b', 'I remember now. The mirror shard was so beautiful. I wanted to keep it forever.'], ['a', '…Keep…'],
      ['b', 'And it kept me instead.'], ['n', 'The ice creaks. Frost spreads across the ground toward her feet.'],
      ['b', 'You want me to feel that cold again. I won\'t.'], ['n', 'Yeta does not step back. The frost stops an inch from her slippers.'],
    ],
    A: [
      ['b', 'I\'m not afraid of you now. You\'re only the part of me that wanted something too badly.'],
      ['n', 'The great crystal dims, the frozen face within it softening.'],
      ['b', 'You can fight beside me. But you\'re not me. I choose warmth. I choose Yeto.'], ['a', '…Warm…'],
      ['n', 'A single shard of ice falls and melts in Yeta\'s palm.'], ['b', 'Yes. Warm.'],
    ],
  },
  'ilia|yeta': {
    C: [
      ['a', 'You\'re the girl from Ordon, aren\'t you? The one who lost her memory.'], ['b', 'Yes. And you\'re the lady from Snowpeak who… wasn\'t herself.'],
      ['a', 'That\'s a gentle way of saying it.'], ['b', 'It\'s the only way I know to say it. It happened to me too, in a way.'],
      ['a', 'Then perhaps we could sit together a while.'],
    ],
    B: [
      ['b', 'Some nights I wake up and I\'m not sure who I am. Just for a moment.'], ['a', 'I do the same. I wake up cold, even with the fire lit.'],
      ['b', 'What do you do?'], ['a', 'I look at Yeto, snoring. I remember the soup. Silly things.'],
      ['b', 'I think of Epona. And the spring in Ordon.'], ['a', 'Hold onto those, dear. Those are what bring us back.'],
    ],
    A: [
      ['b', 'I knitted you something. A scarf. I know it\'s not very good.'], ['a', 'Oh, Ilia. It\'s lovely.'],
      ['b', 'I made it on the nights I couldn\'t sleep. It helped.'], ['a', 'Then every stitch is a night you got through.'],
      ['n', 'Yeta wraps the uneven scarf twice around her neck.'], ['a', 'I\'ll never be cold in it.'],
      ['b', 'That\'s what I was hoping.'],
    ],
  },
  'renado|yeta': {
    C: [
      ['b', 'Shaman, they say you healed the Zora prince.'], ['a', 'I helped him heal. The strength was his own.'],
      ['b', 'There\'s something still in me. A coldness. From the mirror.'], ['a', 'Let me see.'],
      ['n', 'Renado holds his hand over her brow, eyes closed.'], ['a', 'Yes. A shadow of it remains. It can be mended.'],
    ],
    B: [
      ['a', 'Drink this. Hot spring water and Kakariko herbs.'], ['b', 'It tastes dreadful.'],
      ['a', 'The best medicines often do.'], ['b', 'Yeto\'s soup tastes better.'], ['a', 'Then drink this first, and the soup after.'],
      ['n', 'Yeta laughs, and a faint frost on her fingers melts.'],
    ],
    A: [
      ['b', 'The cold hasn\'t come back for a whole week.'], ['a', 'Good. Your spirit is strong, Yeta.'],
      ['b', 'I thought magic like that would never leave me.'], ['a', 'It may not leave entirely. But it will grow quiet, if you keep tending yourself.'],
      ['b', 'Like a garden.'], ['a', 'Just like a garden. Warmth, patience, and someone who loves you to water it.'],
      ['b', 'I have that. I have Yeto.'],
    ],
  },
  'faron|ordona': {
    C: [
      ['n', 'At the border of the woods, a great goat of light meets a great monkey of light beneath the trees.'],
      ['b', 'Faron. Your forest grows close to my village again.'], ['a', 'The twilight drove us apart, Ordona. It is good to see your light so near.'],
      ['b', 'The children of Ordon were taken through your woods. I could not follow.'], ['a', 'Nor I. My light was stolen first.'],
    ],
    B: [
      ['a', 'The southern lands have always been the quiet ones. No castle, no great temples.'], ['b', 'Only goats and pumpkins and children.'],
      ['a', 'And perhaps that is why the darkness reached us first. It thought no one would notice.'],
      ['b', 'Someone noticed. A rancher\'s boy.'], ['n', 'The two spirits share a long, warm silence.'],
    ],
    A: [
      ['b', 'Let us make a pact. Should either of us weaken again, the other will shelter both provinces.'], ['a', 'Forest and field, together.'],
      ['b', 'My spring will water your trees.'], ['a', 'And my trees will hide your village from any who come hunting.'],
      ['n', 'Light flows between them, mingling green and gold.'], ['a', 'The south will not be taken so easily again.'],
    ],
  },
  'eldin|ordona': {
    C: [
      ['a', 'Ordona. Your light is gentle. Mine burns.'], ['b', 'That is as it should be, Eldin. The volcano and the pasture are not alike.'],
      ['a', 'Still, I wonder that we serve the same goddesses.'], ['b', 'Balance requires difference.'],
      ['a', 'Hmph. Spoken like a spirit who has never had to hold back a mountain.'],
    ],
    B: [
      ['b', 'When the twilight fell, I felt your fire flicker even from the south.'], ['a', 'It nearly went out.'],
      ['b', 'Had it gone out, the land would have chilled. Even Ordon would have suffered.'], ['a', 'And had your spring gone dry, my fire would have spread unchecked.'],
      ['b', 'So we hold each other in check.'], ['a', 'Yes. I did not think of it that way before.'],
    ],
    A: [
      ['a', 'I will keep my fire within the mountain.'], ['b', 'And I will keep the fields green and the rains coming.'],
      ['a', 'Neither too hot nor too cold.'], ['b', 'Neither too wild nor too still.'],
      ['n', 'The two spirits face each other, firelight and gentle gold.'], ['a', 'Balance. Perhaps it is not such a dull word.'],
      ['b', 'It never was.'],
    ],
  },
  'lanayru|ordona': {
    C: [
      ['a', 'Ordona.'], ['b', 'Lanayru. You still carry the vision of the past, I see.'],
      ['a', 'Someone must. The weight of what the Hylians did with power must not be forgotten.'],
      ['b', 'You are a grim guardian.'], ['a', 'I guard the water. Water remembers.'],
    ],
    B: [
      ['b', 'Why did you show the hero that terrible vision? The war, the greed?'], ['a', 'Because guardianship is not only protection. It is warning.'],
      ['b', 'I would rather shield the people than frighten them.'], ['a', 'Both are needed.'],
      ['n', 'Ordona\'s light dims, thoughtful.'], ['b', 'Perhaps you are right. Perhaps I have been too gentle.'],
    ],
    A: [
      ['a', 'I do not envy you, Ordona. Your village is small and loves you simply.'], ['b', 'And yours is great and fears you a little.'],
      ['a', 'Yes.'], ['b', 'Then let us share. I will teach you how to be loved. You will teach me how to warn.'],
      ['a', '…That would be a fair trade.'], ['n', 'The serpent coils lower, its light no longer quite so cold.'],
    ],
  },
  'eldin|faron': {
    C: [
      ['b', 'Eldin. I purify slowly. Let the forest breathe, and the darkness fades.'], ['a', 'I burn it away. Quick. Clean.'],
      ['b', 'You burn the trees with it.'], ['a', 'Only the ones too far gone.'],
      ['b', 'That is the difference between us.'],
    ],
    B: [
      ['a', 'Your way is too slow, Faron. While you wait, the shadow spreads.'], ['b', 'And your way leaves ash where there was life.'],
      ['a', 'Ash makes the soil rich. Forests grow back.'], ['b', 'In a hundred years.'],
      ['n', 'The two spirits glare at each other, light flaring.'], ['a', 'Neither of us is wrong.'], ['b', 'No. That is what makes it maddening.'],
    ],
    A: [
      ['b', 'I tried your way today. A patch of twilight in the woods, too deep for patience.'], ['a', 'And?'],
      ['b', 'I let you burn it. Then I made the seeds sprout in the ash.'], ['a', 'Fire, then forest.'],
      ['b', 'Together, it was faster than either of us alone.'], ['a', 'Hm. I suppose patience has its uses.'], ['b', 'And so does fire.'],
    ],
  },
  'faron|lanayru': {
    C: [
      ['a', 'Lanayru. The land is still sick in places.'], ['b', 'The Twilight left wounds. They will not all close quickly.'],
      ['a', 'My woods will heal. Will your waters?'], ['b', 'In time. The lake has been dry before.'],
    ],
    B: [
      ['b', 'Lake Hylia nearly emptied while the twilight held. Fish lay dying on the cracked bed.'], ['a', 'I remember the river failing. My trees thirsted.'],
      ['b', 'Then we must restore it together. Water to the roots. Roots to hold the banks.'],
      ['a', 'A forest along the river. To keep it clear.'], ['b', 'Yes. That would serve us both.'],
    ],
    A: [
      ['n', 'Along the river\'s edge, small saplings rise where once there was only parched stone.'],
      ['a', 'Look. They are already drinking.'], ['b', 'And the water runs clearer for their shade.'],
      ['a', 'We could not have done this alone.'], ['b', 'No spirit can. The land is too large for any one guardian.'],
      ['a', 'Then we will heal it piece by piece. Together.'],
    ],
  },
  'eldin|lanayru': {
    C: [
      ['a', 'Lanayru. You are cold.'], ['b', 'And you are hot. We are what we are.'],
      ['a', 'Every time my fire touches your water, there is only steam.'], ['b', 'Steam is not destruction. It is change.'],
      ['a', 'Hmph. You always have an answer.'],
    ],
    B: [
      ['b', 'The hot springs of Kakariko. Do you know where they come from?'], ['a', 'My mountain heats them.'],
      ['b', 'And my rains fill them.'], ['n', 'Eldin\'s flames flicker in surprise.'],
      ['a', 'So the springs the villagers love are both of us.'], ['b', 'They always have been.'],
    ],
    A: [
      ['a', 'I used to think fire and water were enemies.'], ['b', 'Many think so.'],
      ['a', 'But my fire would scorch the land with nothing to cool it. And your water would freeze without warmth.'],
      ['b', 'Opposites, yes. Not enemies.'], ['a', 'Partners.'],
      ['n', 'For a moment, their lights touch. A gentle mist rises, glowing in the dark.'], ['b', 'Partners.'],
    ],
  },
  'ilia|ordona': {
    C: [
      ['a', 'Spirit… you\'re the light from the spring. The one we always prayed to.'], ['b', 'Ilia. Child of the mayor.'],
      ['a', 'You know my name?'], ['b', 'I know every child who has played in my waters. You bathed Epona there many times.'],
      ['a', 'Oh! I— I hope she didn\'t muddy it too much.'], ['b', 'Never.'],
    ],
    B: [
      ['a', 'When I lost my memories, the one thing I always remembered was the spring.'], ['b', 'It is part of you.'],
      ['a', 'How?'], ['b', 'Ordon has always lived close to the land. The goats, the pumpkins, the water. The village does not take more than it needs.'],
      ['a', 'Dad says that too. Never take more than you give back.'], ['b', 'Your father is a wise man.'],
    ],
    A: [
      ['a', 'When this is over, I want to go home. Plant something new.'], ['b', 'What will you plant?'],
      ['a', 'Flowers, near the spring. For you.'], ['n', 'The goat spirit\'s light glows softly, almost warm.'],
      ['b', 'Then the spring will water them for as long as Ordon stands.'], ['a', 'Thank you, Ordona.'],
      ['b', 'No, child. Thank you.'],
    ],
  },
  'dekuTree|faron': {
    C: [
      ['a', 'A spirit of light in my forest. Thou art welcome.'], ['b', 'Great Deku Tree. I know of you. You lived long before my time.'],
      ['a', 'In an age when the forest was young, yes. I see the woods have grown different since.'],
      ['b', 'They are called by my name now. Faron.'], ['a', 'A fine name for a forest.'],
    ],
    B: [
      ['b', 'You had children once. The Kokiri.'], ['a', 'I did. Each one a sprout of the forest.'],
      ['b', 'There are no Kokiri in my woods now.'], ['a', '…Then perhaps they have become something else. Forests change.'],
      ['b', 'There are stories of small creatures in the deepest wood. Skull Kids, the travelers call them.'],
      ['n', 'The ancient tree is silent a long while, its leaves rustling.'], ['a', 'Then I hope they are happy.'],
    ],
    A: [
      ['a', 'We guard the same forest, Faron, though centuries apart.'], ['b', 'You were its heart. I am only its light.'],
      ['a', 'Heart and light are needed both.'], ['b', 'Then let us guard it together. While we can.'],
      ['n', 'The spirit\'s glow settles gently among the old tree\'s roots, like dew at dawn.'],
      ['a', 'The forest is in good keeping.'],
    ],
  },
  'darbus|eldin': {
    C: [
      ['a', 'Great Spirit of the mountain!'], ['b', 'Darbus. Patriarch of the Gorons.'],
      ['a', 'The Gorons have always honored the sacred flame of Death Mountain. We thank you for it.'],
      ['b', 'And yet a shadow of my fire consumed you.'], ['a', '…Yes. That fire was not yours.'],
    ],
    B: [
      ['b', 'The Fused Shadow twisted the mountain\'s power. It was cruel of it to use you as its vessel.'], ['a', 'I was proud. Perhaps it found me easy to take.'],
      ['b', 'Pride is not evil. The mountain is proud too.'], ['a', 'Ha! True. The mountain bows to no one.'],
      ['b', 'But it does not try to swallow the world, either.'], ['a', 'No. I will remember that.'],
    ],
    A: [
      ['a', 'Spirit, the young Gorons ask me about the mountain\'s heart. What should I tell them?'],
      ['b', 'That it is not a weapon. It is warmth. It is the stone under their feet and the fire in their bellies.'],
      ['a', 'And if they seek to use it for power?'], ['b', 'Then tell them of the Patriarch who became a beast, and found his way back.'],
      ['n', 'Darbus laughs, but his eyes are wet.'], ['a', 'I will tell them, Spirit. Goro.'],
    ],
  },
  'lanayru|zeldaTP': {
    C: [
      ['b', 'Spirit of Lanayru. You remember the time before Hyrule had a name.'], ['a', 'I do, Princess.'],
      ['b', 'Will you tell me where our magic came from?'], ['a', 'From the goddesses. And from those who misused it.'],
      ['b', 'That is not a comforting answer.'], ['a', 'It was not meant to be.'],
    ],
    B: [
      ['a', 'The Triforce. The sacred realm. The Fused Shadow. All drawn from the same source.'], ['b', 'The same power that built my kingdom destroyed others.'],
      ['a', 'Yes. Power is not good or evil. Only those who hold it are.'],
      ['b', 'And I hold it now. The Triforce of Wisdom.'], ['a', 'Then you must be wise, Princess. More than your ancestors were.'],
    ],
    A: [
      ['b', 'I\'ve decided. The royal family will no longer hoard the knowledge of sacred magic.'], ['a', 'That is a dangerous choice.'],
      ['b', 'Secrecy is more dangerous. It let the Twili be banished. It let Ganondorf rise unseen.'],
      ['a', '…You are wiser than your ancestors.'], ['b', 'I\'m only trying to be honest.'],
      ['n', 'The serpent bows its head low before the princess.'], ['a', 'Honesty is the beginning of wisdom.'],
    ],
  },
  'agitha|jovani': {
    C: [
      ['a', 'Ooh! What a shiny gentleman! Are you made of gold?'], ['b', 'Uh… sort of. It\'s a curse, kid.'],
      ['a', 'A curse! How very exciting! Do you collect things too?'], ['b', 'I collect Poe Souls. I need them to break the curse.'],
      ['a', 'I collect golden bugs! For my ball!'], ['b', 'Golden, huh? Can\'t say I like gold much anymore.'],
    ],
    B: [
      ['b', 'Why bugs, anyway?'], ['a', 'Because they\'re the most beautiful creatures in the whole kingdom! And they\'re all my friends!'],
      ['b', 'Huh. I used to collect gold. Treasure, coins, jewels. Anything shiny.'], ['a', 'And then?'],
      ['b', 'And then I sold my soul for more of it. Didn\'t work out so great.'],
      ['a', 'Oh dear. Maybe you should have collected friends instead.'], ['b', '…Kid, you might be onto something.'],
    ],
    A: [
      ['a', 'I found you a present! It\'s a ghost bug! It glows like a Poe!'], ['b', 'Ha! That\'s… actually kind of thoughtful.'],
      ['a', 'You can collect it! Then you\'ll have a friend AND a ghost!'], ['b', 'I\'ve got Gengle for a friend. My cat.'],
      ['a', 'Now you\'ll have two!'], ['n', 'Jovani laughs. A flake of gold falls from his cheek, revealing skin underneath.'],
      ['b', 'Huh. Would you look at that.'],
    ],
  },
  'agitha|armogohma': {
    C: [
      ['n', 'A colossal spider looms over the camp, its single great eye fixed on a tiny girl in a frilly dress.'],
      ['a', 'Oh my goodness. You\'re the BIGGEST bug I\'ve ever seen!'], ['b', 'Skrreeee…'],
      ['a', 'And you have such lovely legs! Eight of them!'], ['n', 'The spider\'s eye narrows. Agitha claps her hands with delight.'],
    ],
    B: [
      ['a', 'I made you a crown! It\'s very small, but you\'re a princess too, I think.'], ['n', 'Armogohma stares at the crown in her outstretched hands.'],
      ['b', 'Krrk?'], ['a', 'Everyone says you\'re a monster. But I think you\'re just misunderstood.'],
      ['n', 'One enormous leg lowers. Agitha balances the crown carefully on its tip.'], ['a', 'There! Beautiful!'],
    ],
    A: [
      ['a', 'You know, I\'m going to invite you to my bug ball. You\'ll be the guest of honor!'],
      ['n', 'The spider\'s many smaller eyes blink in sequence.'], ['b', 'Skrrrr…'],
      ['a', 'You don\'t have to dance if you don\'t want. Just come.'], ['n', 'Armogohma settles its bulk beside her, careful of her dress.'],
      ['a', 'I knew you\'d say yes!'],
    ],
  },
  'herosShade|jovani': {
    C: [
      ['b', 'Whoa. You\'re a ghost, right?'], ['a', 'I am a spirit, yes.'],
      ['b', 'Cursed?'], ['a', 'No. I remain by choice.'],
      ['b', 'By CHOICE? I\'d give anything to get out of my situation.'], ['a', 'Then we are very different.'],
    ],
    B: [
      ['b', 'Okay, explain it to me. Why stick around if nobody\'s making you?'], ['a', 'I have knowledge I never passed on. Skills unshared.'],
      ['b', 'Unfinished business.'], ['a', 'Yes. My regret holds me here. Your greed holds you.'],
      ['b', 'Hey! That\'s a little harsh.'], ['a', 'Is it untrue?'], ['b', '…No.'],
    ],
    A: [
      ['b', 'So what\'s the difference, really? A curse and unfinished business?'], ['a', 'A curse is a chain someone else forged for you.'],
      ['b', 'And business?'], ['a', 'A chain you forged yourself. Only you can break it.'],
      ['b', 'Huh. Then my curse… I kind of forged it myself too, didn\'t I?'], ['a', 'Perhaps.'],
      ['b', 'Then maybe I can break it myself too.'], ['a', 'That is the first step.'],
    ],
  },
  'jovani|postman': {
    C: [
      ['b', 'Letter for you! Jovani of Castle Town!'], ['a', 'For me? Nobody writes to me. I\'m a gold statue.'],
      ['b', 'Mail is mail! It must be delivered!'], ['a', 'I can\'t open it. My hands don\'t move.'],
      ['b', 'Oh. Hm. That is a problem.'],
    ],
    B: [
      ['b', 'I\'ve found a solution! I will read your mail to you!'], ['a', 'That\'s… actually really nice.'],
      ['b', 'It\'s from your cat.'], ['a', 'My CAT writes letters?'],
      ['b', 'It says "Mrow." Signed with a paw print.'], ['a', 'That\'s Gengle all right.'],
      ['n', 'The postman taps his foot impatiently, even while standing still.'],
    ],
    A: [
      ['a', 'You know, you\'re the only guy who visits me regularly.'], ['b', 'I visit everyone regularly! It is my duty!'],
      ['a', 'Still. Thanks.'], ['b', 'Hm! When you\'re free of your curse, you can deliver a letter yourself.'],
      ['a', 'To who?'], ['b', 'Anyone! Mail brings people together!'],
      ['a', 'Then I guess I\'ll write one to you first.'],
    ],
  },
  'malo|postman': {
    C: [
      ['a', 'Delivering for Malo Mart!'], ['b', 'You\'re late. I needed those fliers in Castle Town by noon.'],
      ['a', 'It is precisely noon!'], ['b', 'Noon was a minute ago. Time is money.'],
      ['a', 'A minute is not money!'], ['b', 'It is in my ledger.'],
    ],
    B: [
      ['b', 'I\'ve designed new advertisements. Big letters. Low prices. I need them in every house.'], ['a', 'Every house?!'],
      ['b', 'Every house. And the Goron mines. And the Zora Domain.'], ['a', 'The Zora Domain is underwater!'],
      ['b', 'Then waterproof them.'], ['n', 'The postman looks at the tiny shopkeeper with something like awe.'],
    ],
    A: [
      ['a', 'Malo Mart\'s sales doubled! Because of MY deliveries!'], ['b', 'Because of my prices. But you helped.'],
      ['a', 'I demand a commission!'], ['b', '…Five percent.'],
      ['a', 'Ten!'], ['b', 'Six. And a free bottle of milk.'], ['a', 'Deal!'],
      ['n', 'Malo writes it into his ledger in tiny, neat letters.'],
    ],
  },
  'argorok|ooccoo': {
    C: [
      ['n', 'A small round creature in a pot stares up at the massive, armored dragon.'], ['b', 'Oh my. Oh no. Oh my goodness. That\'s HIM.'],
      ['a', 'GRRRRAAAAH!'], ['b', 'He took over our whole city. Terrorized my people.'],
      ['n', 'Ooccoo does not leave the pot. But she does not fly away either.'],
    ],
    B: [
      ['b', 'You burned the bridges. You chased the Oocca into hiding. My son was terrified.'], ['n', 'The dragon\'s wings shift, armor clanking.'],
      ['a', 'Hrrrrmm…'], ['b', 'And now we\'re on the same side. How ridiculous.'],
      ['b', 'Well. I won\'t forgive you. But I\'ll stop hiding from you.'], ['n', 'She climbs out of the pot. Barely. Then back in.'],
    ],
    A: [
      ['b', 'I came to say something.'], ['n', 'Argorok lowers its massive head, curious.'],
      ['b', 'The dark power is gone from you now. I can see it. You were used, just like us.'], ['a', 'Grrk…'],
      ['b', 'Maybe one day the City in the Sky will be safe for both of us.'],
      ['n', 'The dragon makes a low, rumbling sound. Not a roar. Something softer.'], ['b', 'I\'ll take that as agreement.'],
    ],
  },
  'ganondorfTP|zant': {
    C: [
      ['b', 'My god. My king. You stand among us.'], ['a', 'Zant. You still grovel. Good.'],
      ['b', 'I have done everything you asked. The Twilight covers Hyrule. The princess is broken.'], ['a', 'Not everything. The beast still walks.'],
      ['b', 'I— I will see to the beast. I swear it.'], ['n', 'Ganondorf turns away without another word. Zant\'s fingers twitch inside his sleeves.'],
    ],
    B: [
      ['b', 'You granted me power when the Twili denied me the throne. You were the only one who saw my worth.'], ['a', 'I saw a tool.'],
      ['b', 'A… tool?'], ['a', 'A sharp one. Do not mistake my use of you for affection.'],
      ['n', 'Zant laughs, too high, too long.'], ['b', 'Of course. Of course, my god. A tool. I am honored to be your tool.'],
      ['n', 'When Ganondorf leaves, the laughter stops all at once.'],
    ],
    A: [
      ['b', 'I watched you fall to the hero. I watched you, and I felt nothing. Isn\'t that strange?'], ['a', 'You forget yourself, usurper.'],
      ['b', 'No. I remember myself. Finally. You never meant to make me king. You only needed a door to walk through.'],
      ['a', 'And you opened it gladly.'], ['b', 'Yes. Gladly. Like a fool.'],
      ['n', 'Zant straightens, his voice calm for once.'], ['b', 'I fight in this army for my own reasons now. Not yours.'],
      ['a', 'Hmph. At last, something worth my attention.'],
    ],
  },
  'phantomZant|zant': {
    C: [
      ['n', 'A flickering copy of Zant, mask and robes and all, drifts silently behind the usurper.'],
      ['b', 'Ah. You. My little reflection.'], ['a', '…'], ['b', 'You never speak. How restful. The real one never stops.'],
      ['n', 'The phantom tilts its head at exactly the angle Zant does.'],
    ],
    B: [
      ['b', 'I made you to confuse the hero. Dozens of you, all at once.'], ['n', 'Phantom Zant raises its arms. Zant raises his at the same moment.'],
      ['b', 'Stop that.'], ['n', 'It lowers them. A beat late.'],
      ['b', 'You\'re a better copy than I deserve. You\'re never afraid. Never angry. Never… unhinged.'],
      ['a', '…'], ['b', 'Perhaps I should take lessons.'],
    ],
    A: [
      ['b', 'Do you know what I hate most about you?'], ['n', 'The phantom waits.'],
      ['b', 'You are what I wanted to be. Faceless. Obedient. Untroubled.'], ['b', 'And you are hollow. There is nothing in you.'],
      ['n', 'Zant reaches out. His hand passes through the phantom\'s shoulder like smoke.'],
      ['b', 'I would rather be broken and real. Do you hear me? I would rather be real.'], ['a', '…'],
      ['n', 'The phantom bows, perfectly, and fades.'],
    ],
  },
  'shadowBeast|zant': {
    C: [
      ['n', 'A Shadow Beast crouches before Zant, its mask cracked, red markings glowing on its gray hide.'],
      ['b', 'Up. Up, you beast. You are an instrument of my will.'], ['a', 'Hhhhrrrrrk…'],
      ['b', 'Do not look at me like that. You were Twili once. You should be grateful for your new purpose.'],
      ['n', 'The beast\'s eyes, under the mask, remain fixed on him.'],
    ],
    B: [
      ['b', 'They called me unfit to rule. These very people. And now they serve me on all fours.'], ['a', 'Grrrk.'],
      ['b', 'Was it you, perhaps? Did you laugh at me in the palace once?'], ['n', 'The Shadow Beast says nothing. It only shivers in the light.'],
      ['b', '…You are so cold. The light hurts you, doesn\'t it?'], ['n', 'For a moment Zant\'s hand hovers over its head. Then he withdraws it.'],
    ],
    A: [
      ['b', 'Midna turned the others back. Did you know that? They are Twili again.'], ['a', 'Hhhrrr…'],
      ['b', 'But you are still here. A shadow of yourself. Because of me.'], ['n', 'Zant kneels before the beast. His voice drops very low.'],
      ['b', 'I do not know how to undo this. I did not care to learn.'], ['b', 'When this is over, I will find her. I will ask her to return you.'],
      ['n', 'The beast leans, ever so slightly, toward him. Zant does not move away.'],
    ],
  },
  'argorok|zant': {
    C: [
      ['n', 'Argorok circles above, its armor plating catching the light. Zant watches it with satisfaction.'],
      ['b', 'Magnificent, isn\'t it? A fragment of the Fused Shadow, and a lizard becomes a dragon.'], ['a', 'RRRRAAAAH!'],
      ['b', 'The Oocca thought themselves closer to the gods. I showed them how near their gods truly were.'],
    ],
    B: [
      ['b', 'You burned their windmills. Shattered their bridges. Splendid work.'], ['n', 'The dragon lands heavily, cracking the ground.'],
      ['b', 'They hid in their pots like frightened birds. The city in the sky, so proud, so pure.'], ['a', 'Grrrk.'],
      ['b', 'Purity always breaks first. Remember that.'],
    ],
    A: [
      ['b', 'The Fused Shadow is gone from you now. Yet you still fly with us.'], ['n', 'Argorok\'s great eyes regard him.'],
      ['b', 'The Oocca rebuild. Did you see? The windmills turn again.'], ['a', 'Hrrrm.'],
      ['b', 'Corruption is a strange gift. It tears down, and something grows back. Perhaps that is my only legacy.'],
      ['n', 'The dragon snorts smoke and turns its head toward the distant, rising city.'],
    ],
  },
  'stallord|zant': {
    C: [
      ['n', 'A colossal skeleton half buried in sand. Zant raises his hand, and dark light pours into its skull.'],
      ['b', 'Rise. Ancient guardian of the Arbiter\'s Grounds. Your sleep is over.'], ['a', 'GRRRAAAAAHHH!'],
      ['b', 'Yes. Yes, that\'s it. I need soldiers that do not tire and do not question.'],
    ],
    B: [
      ['b', 'You were a king of beasts once, before the sand took you.'], ['n', 'Stallord\'s jaw clacks open and shut.'],
      ['b', 'I gave you back your bones. Your purpose. Isn\'t that generous of me?'],
      ['n', 'The skeleton\'s spine sways, rattling, as if it does not know where to look.'],
      ['b', 'You don\'t remember who you were. Better that way. Memory only makes things hesitate.'],
    ],
    A: [
      ['b', 'All my monsters. Every one I raised, the hero cut down.'], ['n', 'Stallord\'s glowing eyes dim slightly.'],
      ['b', 'Perhaps the dead should stay dead. Perhaps power borrowed from graves is power that cannot hold.'],
      ['a', 'Hrrrr…'], ['b', 'And yet here you are, fighting beside me, for no master at all.'],
      ['n', 'Zant almost laughs. It comes out tired instead.'], ['b', 'Well. Neither of us chose this. Let us at least choose how we fight.'],
    ],
  },
  'blizzeta|zant': {
    C: [
      ['b', 'Ah, the mirror shard of Snowpeak. How lovely you became.'], ['n', 'Blizzeta hangs in the air, frost crackling, a face sealed within.'],
      ['b', 'All it took was one shard. One gentle woman. And she became winter itself.'], ['a', '…Mine…'],
      ['b', 'Yes. The Mirror always whispers that. Mine, mine, mine.'],
    ],
    B: [
      ['b', 'I never touched the Mirror Shards. Did you know? I only scattered them.'], ['n', 'The ice creaks in the silence.'],
      ['b', 'Those who found them did the rest. Greed is so efficient.'], ['a', '…Keep… forever…'],
      ['n', 'Zant tilts his head, studying the ice.'], ['b', 'Forever. Yes. I wanted the throne forever too.'],
    ],
    A: [
      ['b', 'The Mirror did not corrupt that woman. It only showed her a want and gave it teeth.'], ['n', 'Blizzeta drifts lower.'],
      ['b', 'Ganondorf did the same to me. Power was never the poison. Wanting was.'],
      ['a', '…Warm…'], ['b', 'Warm? She wants warmth now? Ha. Then she has escaped. Lucky woman.'],
      ['n', 'Zant watches the ice for a long time, his hands still for once.'],
    ],
  },
  'ganondorfTP|kingBulblin': {
    C: [
      ['a', 'You serve me well, chieftain. Your raiders have bled Hyrule\'s borders dry.'], ['n', 'King Bulblin grunts, his great axe resting on his shoulder.'],
      ['a', 'I will reward your loyalty when the kingdom is mine.'], ['n', 'The Bulblin king says nothing. He only watches.'],
    ],
    B: [
      ['a', 'Your warriors fell at the bridge. The hero broke them.'], ['b', 'Hrrn.'],
      ['a', 'Gather more. I will not tolerate failure.'], ['n', 'King Bulblin does not move to obey. He looks at the bodies of his raiders, then at Ganondorf.'],
      ['a', 'Is there a problem, chieftain?'], ['n', 'The Bulblin king turns and walks away without answering.'],
    ],
    A: [
      ['a', 'You fought the hero alone, three times, and lost three times. Yet you return.'], ['n', 'King Bulblin\'s scarred face gives nothing away.'],
      ['a', 'Not for me. I can see it. You follow strength. And I am no longer the strongest thing you have seen.'],
      ['n', 'The Bulblin king meets the Gerudo\'s eyes, steady and unafraid.'], ['b', 'Hrm.'],
      ['a', 'Hmph. Then fight. But do not pretend it is for me.'], ['n', 'King Bulblin shoulders his axe and nods, once.'],
    ],
  },
  'ganondorfTP|herosShade': {
    C: [
      ['a', 'So the hero lingers. Even in death, you cannot leave Hyrule alone.'], ['b', 'Nor can you, Ganondorf.'],
      ['a', 'I was sealed. You were forgotten. Which of us has the worse fate?'], ['b', 'I chose mine.'],
      ['a', 'Ha. As I chose mine.'],
    ],
    B: [
      ['b', 'You still carry the Triforce of Power.'], ['a', 'And you still carry your regrets. I can see them on you like rust.'],
      ['b', 'I regret only that I could not pass on all I learned.'], ['a', 'And I regret nothing.'],
      ['n', 'The Shade\'s hand tightens on his sword hilt.'], ['b', 'That is your weakness. It always has been.'],
    ],
    A: [
      ['a', 'How many times have we fought? You and your line, me and mine.'], ['b', 'Too many to count.'],
      ['a', 'And it will happen again. When this army disbands, we will be enemies once more.'], ['b', 'Yes.'],
      ['a', 'Then why do you stand beside me now?'], ['b', 'Because even enemies can fight for the same cause, for a time.'],
      ['n', 'Ganondorf laughs, low and cold.'], ['a', 'You were always too honorable, hero.'], ['b', 'And you, never enough.'],
    ],
  },
  'ganondorfTP|zeldaTP': {
    C: [
      ['a', 'Princess. Do you still feel me, in the hollows of your mind?'], ['b', 'Every day.'],
      ['a', 'Good. Then you know I nearly had you.'], ['b', 'Nearly. Not quite.'],
      ['n', 'Zelda does not lower her eyes.'],
    ],
    B: [
      ['b', 'When you took my body, I could see everything you did. I could not stop you.'], ['a', 'And did you enjoy it?'],
      ['b', 'I learned from it. I learned what you are.'], ['a', 'And what am I?'],
      ['b', 'Hungry. Always hungry. Nothing ever fills you.'], ['n', 'For the first time, Ganondorf has no reply.'],
    ],
    A: [
      ['a', 'You fight beside me as if nothing happened.'], ['b', 'Something happened. I will never forget it.'],
      ['a', 'Then why?'], ['b', 'Because I will not let what you did to me decide who I am. That would be another way of letting you win.'],
      ['a', 'You are strong, Princess. Stronger than your ancestors.'], ['b', 'I don\'t want your praise.'],
      ['a', 'You have it anyway.'],
    ],
  },
  'kingBulblin|lordBullbo': {
    C: [
      ['n', 'The massive boar stamps its hooves as King Bulblin approaches, snorting steam.'],
      ['n', 'The king lays one heavy hand on its neck. Lord Bullbo goes still.'],
      ['a', 'Hrm.'], ['b', 'Snrrrk.'], ['n', 'The two of them stand like that for a long time.'],
    ],
    B: [
      ['n', 'After a skirmish, King Bulblin finds his mount limping. An arrow is lodged in its flank.'],
      ['b', 'Grrrnn!'], ['n', 'The king grips the arrow. With one swift pull, he removes it.'],
      ['n', 'Lord Bullbo snorts and shoves its head against the king\'s chest. The king stumbles, but does not fall.'],
      ['a', 'Hrn.'],
    ],
    A: [
      ['n', 'At the bridge, Lord Bullbo charges straight into a wall of spears. The king does not pull the reins.'],
      ['n', 'They break through together. Behind them, the enemy line scatters.'],
      ['n', 'Afterward, the king feeds his mount from his own rations, piece by piece.'], ['b', 'Snrrk.'], ['a', 'Hrrm.'],
    ],
    S: [
      ['n', 'The hero\'s sword knocks King Bulblin from his saddle. He hits the ground hard.'],
      ['n', 'Lord Bullbo wheels around, ignoring the battle, and stands over him, tusks lowered.'],
      ['b', 'GRRRAAAH!'], ['n', 'No one approaches. The king rises slowly and climbs back into the saddle.'],
      ['n', 'He leans forward and presses his forehead to the beast\'s.'], ['a', 'Hrrn.'],
      ['n', 'Warrior and mount ride on as one, as they always have.'],
    ],
  },
  'bulblin|kingBulblin': {
    C: [
      ['n', 'A young Bulblin swaggers through camp, swinging a club too big for him.'], ['a', 'Gwah! Gwah gwah!'],
      ['n', 'King Bulblin steps in his path. The young one\'s swagger evaporates.'], ['b', 'Hrm.'],
      ['n', 'The Bulblin drops his club and backs away, eyes on the ground.'],
    ],
    B: [
      ['n', 'The Bulblin challenges King Bulblin to a duel at dawn. The whole camp gathers.'], ['a', 'Grrah!'],
      ['n', 'The young one charges. The king steps aside and taps him once on the back of the head. He falls flat.'],
      ['n', 'The camp roars with laughter. The Bulblin rises, furious and humiliated.'], ['b', 'Hrn.'],
    ],
    A: [
      ['n', 'In battle, the young Bulblin is surrounded. Before he can be cut down, King Bulblin crashes through the enemy.'],
      ['a', 'Gwah…?'], ['n', 'The king holds out his hand. The Bulblin takes it.'],
      ['n', 'From then on, he walks two steps behind the king, always.'], ['b', 'Hrrm.'],
    ],
  },
  'bulblinArcher|kingBulblin': {
    C: [
      ['n', 'A Bulblin Archer fires early. The arrow goes wide. The ambush is ruined.'], ['n', 'King Bulblin turns his head slowly toward the archer.'],
      ['a', 'Gwah… gwah…'], ['b', 'Hrm.'], ['n', 'The archer quickly nocks another arrow and does not loose it.'],
    ],
    B: [
      ['n', 'At night, King Bulblin stands behind the archers as they practice on targets of straw.'],
      ['n', 'He raises his fist. They draw. He holds. They hold. Their arms tremble.'],
      ['n', 'He drops his fist. Every arrow flies at once. Every one strikes.'], ['a', 'Gwah!'], ['b', 'Hrn.'],
    ],
    A: [
      ['n', 'On the battlefield, the archers wait in perfect silence for the king\'s signal.'],
      ['n', 'He raises his fist. Lowers it. A storm of arrows darkens the sky.'],
      ['a', 'Gwah gwah!'], ['n', 'Afterward, the king taps the lead archer on the shoulder, once. The archer stands taller for a week.'],
    ],
  },
  'bulblin|wildBullbo': {
    C: [
      ['n', 'A Bulblin tries to mount a wild boar. The boar bucks him into the mud.'], ['a', 'Gwaaah!'],
      ['b', 'Snrrk!'], ['n', 'The Bulblin tries again. Mud again.'],
    ],
    B: [
      ['n', 'The Bulblin brings the boar a sack of turnips. It eats them all, then bucks him off anyway.'],
      ['a', 'Gwah…'], ['n', 'But the next morning, when he approaches, the boar does not run.'], ['b', 'Hrnk.'],
    ],
    A: [
      ['n', 'They charge across Hyrule Field together, the Bulblin whooping, the boar\'s hooves thundering.'],
      ['a', 'Gwah gwah gwah!'], ['b', 'SNRRRK!'], ['n', 'An enemy soldier dives out of the way. The Bulblin turns in the saddle and laughs.'],
    ],
    S: [
      ['n', 'The boar is wounded in battle. The Bulblin drags it away from the fighting, staying by its side through the night.'],
      ['a', 'Gwah… gwah.'], ['n', 'By morning, the boar stands again, shaky but alive.'],
      ['b', 'Snrrrk.'], ['n', 'It nudges him with its snout. He climbs into the saddle, and they ride off together, as one.'],
    ],
  },
  'shadowBeast|shadowKargarok': {
    C: [
      ['n', 'A Shadow Beast crouches on a rock. Overhead, a Shadow Kargarok circles, shrieking.'],
      ['a', 'Hhhrrrk.'], ['b', 'SKREEEE!'], ['n', 'The beast looks up. The bird descends and lands beside it.'],
    ],
    B: [
      ['n', 'Sunlight breaks through the clouds. Both creatures hiss and retreat to the same patch of shade.'],
      ['n', 'They huddle there together, black hides smoking faintly.'], ['a', 'Hhhrr…'], ['b', 'Krrk…'],
    ],
    A: [
      ['n', 'At night, the Shadow Kargarok perches on the Shadow Beast\'s back as it prowls the camp\'s edge.'],
      ['n', 'Neither remembers what it was. But both remember the light, and the cold, and each other.'],
      ['b', 'Skree.'], ['a', 'Hhrrm.'],
    ],
  },
  'shadowBeast|shadowBulblin': {
    C: [
      ['n', 'A Shadow Bulblin crouches at the fire, poking it with a stick. A Shadow Beast watches from the darkness.'],
      ['b', 'Gwahhh…'], ['a', 'Hhrrrk.'], ['n', 'The beast approaches slowly and sits beside it.'],
    ],
    B: [
      ['n', 'The Shadow Bulblin scratches shapes into the dirt. A house. A tree. A face.'],
      ['n', 'The Shadow Beast watches, then scratches its own: a palace, tall and strange.'],
      ['b', 'Gwah?'], ['a', 'Hhhrr.'], ['n', 'Neither knows where these memories come from.'],
    ],
    A: [
      ['n', 'One night, both creatures wake at the same moment, trembling.'],
      ['n', 'They dreamed of being something else. A Twili in the palace. A Bulblin in the desert.'],
      ['a', 'Hhrrrk…'], ['b', 'Gwaaah…'], ['n', 'They press close together, and do not sleep again until dawn.'],
    ],
  },
  'darkhammer|darknut': {
    C: [
      ['n', 'A Darkhammer swings its great ball-and-chain in a slow arc. A Darknut watches, sword and shield raised.'],
      ['a', 'Hrrrnnn.'], ['b', 'Hrm.'], ['n', 'The Darknut steps in and parries the chain away with a single, clean motion.'],
    ],
    B: [
      ['n', 'The Darkhammer teaches the Darknut to use its weight. The Darknut teaches the Darkhammer to keep its guard.'],
      ['n', 'Neither speaks. They spar from dawn until dusk, armor ringing.'], ['a', 'Hrrn.'], ['b', 'Hrm.'],
    ],
    A: [
      ['n', 'In battle, they fight back to back. The chain sweeps wide; the sword finishes what it starts.'],
      ['n', 'Afterward, they sit and polish their armor in silence.'], ['a', 'Hrm.'], ['b', 'Hrrn.'],
    ],
  },
  'darkhammer|deathSword': {
    C: [
      ['n', 'The Darkhammer guards a crumbling gate. The Death Sword drifts beside it, its blade humming.'],
      ['a', 'Hrrrnnn.'], ['b', 'Hhhaaaaaa…'], ['n', 'They stand watch together until morning. Neither moves.'],
    ],
    B: [
      ['n', 'The Darkhammer remembers a temple sealed with chains. The Death Sword remembers a desert prison, buried in sand.'],
      ['n', 'Both guarded places no one visits anymore.'], ['b', 'Hhhaaa…'], ['a', 'Hrrn.'],
    ],
    A: [
      ['n', 'One night, the Death Sword drifts away from its post. The Darkhammer follows it into the dark.'],
      ['n', 'They find a forgotten shrine, half buried. They stand guard over it, together, until dawn.'],
      ['a', 'Hrm.'], ['b', 'Hhhaaa.'],
    ],
  },
  'deathSword|herosShade': {
    C: [
      ['n', 'The Death Sword\'s blade gleams in the darkness. The Hero\'s Shade watches it from a distance.'],
      ['b', 'You are bound here. As I am.'], ['a', 'Hhhaaaa…'],
      ['b', 'But you are bound by a curse. I, by choice.'],
    ],
    B: [
      ['b', 'You guard the Arbiter\'s Grounds still. The place where the Gerudo king was meant to die.'], ['a', 'Hhhaaa…'],
      ['b', 'You failed in that duty. As did I, in mine.'],
      ['n', 'The Death Sword\'s blade lowers slightly.'], ['b', 'But I remain to teach. You remain to punish.'],
    ],
    A: [
      ['b', 'When this is done, I will rest. My lessons will be passed on.'], ['n', 'The Death Sword is silent.'],
      ['b', 'You, too, may rest, if you choose. Your guardianship need not last forever.'],
      ['a', 'Hhhaaa…'], ['n', 'For a moment, the blade dims. Then glows again.'], ['b', 'Perhaps not yet. But someday.'],
    ],
  },
  'captainKeeta|stallord': {
    C: [
      ['n', 'The two skeletal giants face each other across the camp. One with a sword. One with a spine of a hundred vertebrae.'],
      ['a', 'Hmph! Another of the restless dead. And a large one.'], ['b', 'GRRRAAAH!'],
      ['a', 'Roaring will not impress me, beast. I commanded an army of the dead.'],
    ],
    B: [
      ['a', 'You were raised by dark magic to guard a prison. I remained by my own will, to lead my men.'], ['n', 'Stallord\'s jaw clacks.'],
      ['a', 'But what are we, really? Bones and duty.'], ['b', 'Hrrrnnn…'],
      ['a', 'Hmm. Perhaps you understand more than you let on.'],
    ],
    A: [
      ['n', 'Keeta draws his sword. Stallord rises, towering.'], ['a', 'Let us show these living soldiers what the dead can do!'],
      ['b', 'GRRRAAAH!'], ['n', 'They charge together, an army of two.'],
      ['a', 'Ha! A fine comrade, beast. Rest well when this is over.'],
    ],
  },
  'aeralfos|lizalfos': {
    C: [
      ['n', 'An Aeralfos lands beside a Lizalfos, wings snapping shut. The Lizalfos hisses.'],
      ['a', 'Ksssssh!'], ['b', 'Hssss!'], ['n', 'They circle each other, tails lashing.'],
    ],
    B: [
      ['n', 'The Aeralfos dives from above. The Lizalfos rolls aside and counterattacks with its tail.'],
      ['n', 'They spar until both are exhausted, then collapse in the sun, hissing at each other.'], ['a', 'Ksssh.'], ['b', 'Hsss.'],
    ],
    A: [
      ['n', 'In battle, the Aeralfos lifts the Lizalfos into the air and drops it behind enemy lines.'],
      ['n', 'They fight together, sky and ground, until the field is clear.'], ['a', 'Kssssh!'], ['b', 'Hssss!'],
    ],
  },
  'aeralfos|argorok': {
    C: [
      ['n', 'An Aeralfos flies up to meet Argorok in the sky, wings beating hard.'],
      ['a', 'Ksssh!'], ['b', 'RRRAAAH!'], ['n', 'The dragon swats it away with one wing. The Aeralfos spins, recovers, and tries again.'],
    ],
    B: [
      ['n', 'The Aeralfos challenges Argorok to a race around the city in the sky. It loses badly.'],
      ['n', 'But it keeps trying, day after day.'], ['a', 'Ksssh.'], ['b', 'Hrrrm.'],
    ],
    A: [
      ['n', 'The Aeralfos finally keeps pace with the dragon, wing to wing, through the clouds.'],
      ['n', 'Argorok glances over and lets out a low rumble. The Aeralfos shrieks with delight.'],
      ['a', 'Kssssh!'], ['b', 'Grrrr.'],
    ],
  },
  'ook|ooksParasite': {
    C: [
      ['n', 'The baboon Ook scratches at his neck. A dark, glistening parasite clings there, pulsing.'],
      ['a', 'Ook! Ook ook!'], ['n', 'The parasite tightens its grip. Ook\'s eyes glow red for a moment.'], ['n', 'Then the glow fades, and he goes back to scratching, confused.'],
    ],
    B: [
      ['n', 'Ook tries to pull the parasite away with both hands. It digs in deeper.'],
      ['a', 'OOOK!'], ['b', 'Hssshhh…'], ['n', 'Ook falls still, panting. The red glow returns to his eyes.'],
    ],
    A: [
      ['n', 'Ook throws himself into the river. The parasite writhes and loosens its grip.'],
      ['n', 'He climbs out shaking water from his fur, the parasite clinging on by a single tendril.'],
      ['a', 'Ook…'], ['b', 'Hssh…'], ['n', 'For now, Ook is himself again. The parasite waits.'],
    ],
  },
  'dekuToad|toadpoli': {
    C: [
      ['n', 'A massive Deku Toad lounges in the swamp. Tiny Toadpoli swim around it in circles.'],
      ['a', 'Grrrrbbb.'], ['b', 'Pip! Pip!'], ['n', 'Whenever one strays too far, a long tongue flicks out and gently pulls it back.'],
    ],
    B: [
      ['n', 'A soldier wanders too close to the Toadpoli. The Deku Toad rises, puffing up to twice its size.'],
      ['a', 'GRRRRBBB!'], ['n', 'The soldier flees. The Toadpoli hide behind their parent\'s leg.'], ['b', 'Pip…'],
    ],
    A: [
      ['n', 'The Deku Toad carries the Toadpoli on its back across the battlefield, keeping them safe.'],
      ['n', 'When danger comes, it swallows them whole, then spits them out unharmed once it passes.'], ['a', 'Grrrbbb.'], ['b', 'Pip pip!'],
    ],
    S: [
      ['n', 'One Toadpoli is caught in a net. The Deku Toad charges, tearing through it with its jaws.'],
      ['n', 'The Toadpoli swims free, back to its parent.'], ['a', 'Grrrbbb…'],
      ['n', 'The Deku Toad gathers all of them close, and does not let them out of its sight again.'], ['b', 'Pip!'],
    ],
  },
};
