// Support conversations: Twilight Princess (Link and Midna, Wolf Link, Ordon and Kakariko). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'heroOfTwilight|midnaImp': {
    C: [
      ['b', 'Look at you, standing on two legs. Almost makes me miss the fur.'], ['a', 'Almost?'],
      ['b', 'You were easier to steer as a wolf. One tug on the ear and off you went.'], ['a', 'You pulled hard.'],
      ['b', 'You needed it.'], ['n', 'Midna floats a little higher, out of reach.'],
      ['b', 'Don\'t get the wrong idea. We\'re only working together until I get what I want.'], ['a', 'I know.'],
    ],
    B: [
      ['n', 'Midna sits on a crate at the edge of camp, watching the soldiers eat.'], ['b', 'They all laugh so easily here.'],
      ['a', 'You could join them.'], ['b', 'And let them see what I look like up close? No thanks.'],
      ['a', 'Colin asked if you were hungry.'], ['b', '…He did?'], ['a', 'He saved you a plate.'],
      ['b', 'Hmph. Tell him I\'ll eat it later. When no one\'s looking.'],
    ],
    A: [
      ['b', 'Back at Lake Hylia, when I was dying… you ran all the way to the castle.'], ['a', 'You were heavy.'],
      ['b', 'I weigh nothing, you idiot.'], ['n', 'She stops. Her voice softens.'],
      ['b', 'You didn\'t have to. You owed me nothing. Less than nothing, really.'], ['a', 'You were my friend.'],
      ['b', 'Friend. Heh. I\'ve never had one of those.'], ['a', 'Now you do.'],
    ],
    S: [
      ['b', 'When this war is done, I\'ll have to go home. You know that, right?'], ['a', 'I know.'],
      ['b', 'The Twilight is where my people are. I can\'t just… stay.'], ['a', 'I wouldn\'t ask you to.'],
      ['b', 'That\'s the worst part. You wouldn\'t.'], ['n', 'Midna drifts close and rests her forehead against his.'],
      ['b', 'Link. I\'ll see you later. Remember that, even if it isn\'t true.'], ['a', 'I\'ll remember.'],
    ],
  },
  'heroOfTwilight|ilia': {
    C: [
      ['b', 'Link! You\'ve got mud all the way up to your knees again.'], ['a', 'The road was wet.'],
      ['b', 'You say that every time. Every single time since we were six.'], ['a', 'It\'s always wet.'],
      ['n', 'Ilia shakes her head and hands him a clean cloth.'], ['b', 'Some things never change. I\'m glad.'],
    ],
    B: [
      ['b', 'I still remember your face when I took Epona away. You looked like a scolded puppy.'], ['a', 'You were angry.'],
      ['b', 'You hurt her! Well… she hurt herself, jumping that fence for you.'], ['a', 'She wanted to.'],
      ['b', 'I know. She trusts you. Like everyone does.'], ['n', 'Ilia picks at a stray thread on her sleeve.'],
      ['b', 'Sometimes I wish you\'d trust somebody back. Tell somebody where you go.'], ['a', 'I\'ll try.'],
    ],
    A: [
      ['b', 'When I lost my memories, I didn\'t know your name. But I knew the charm.'], ['a', 'The horse whistle.'],
      ['b', 'I carved it for you. Even when I forgot everything else, my hands remembered.'], ['a', 'I still have it.'],
      ['n', 'He takes the small wooden charm from his belt. It is worn smooth.'], ['b', 'You kept it this whole time?'],
      ['a', 'Of course.'], ['b', 'Oh, Link… you really are hopeless.'],
    ],
    S: [
      ['b', 'Dad keeps asking me what I want to do when we go home.'], ['a', 'What did you tell him?'],
      ['b', 'That I want the spring by the village, the goats, the summer festival… and you there.'], ['n', 'Link blinks.'],
      ['b', 'Don\'t look so surprised. I\'ve waited a long time to say that out loud.'], ['a', 'I want that too.'],
      ['b', 'Then come home. When it\'s over, just come home.'], ['a', 'I promise.'],
    ],
  },
  'heroOfTwilight|zeldaTP': {
    C: [
      ['b', 'You came to the tower when no one else could. I never thanked you properly.'], ['a', 'You don\'t need to.'],
      ['b', 'A princess who cannot thank her people is a poor princess.'], ['a', 'I\'m a goat herder.'],
      ['b', 'You were. I think the gods have other plans.'], ['n', 'Zelda glances at the Triforce mark on his hand.'],
    ],
    B: [
      ['b', 'I surrendered Hyrule to Zant to spare my people. Do you think I chose wrongly?'], ['a', 'You saved lives.'],
      ['b', 'And I gave Twilight to the whole kingdom. Midna\'s people suffered for my choice too.'], ['a', 'Midna doesn\'t blame you.'],
      ['b', 'She told you that?'], ['a', 'Not in words.'], ['b', 'Then I will have to earn the words someday.'],
    ],
    A: [
      ['b', 'Light and Twilight were never meant to be enemies. Only kept apart.'], ['a', 'Two sides of a coin.'],
      ['b', 'Yes. Hyrule shut the Twili away and forgot them. That is our shame.'], ['n', 'She looks over the camp, where Twili and Hylian soldiers share a fire.'],
      ['b', 'When this ends, I want both realms to remember each other.'], ['a', 'I\'ll help.'],
      ['b', 'I know you will. You already walk in both worlds.'],
    ],
  },
  'heroOfTwilight|herosShade': {
    C: [
      ['b', 'You stand too far forward on your heel. A blade is wasted on unsteady feet.'], ['a', 'Like this?'],
      ['b', 'Better. Again.'], ['n', 'The Shade\'s single eye follows every movement.'],
      ['b', 'You learn quickly. That is good. There is much I must pass on, and little time.'], ['a', 'Why me?'],
      ['b', 'Because you carry what I carried. Strike again.'],
    ],
    B: [
      ['a', 'You fight like someone who\'s done this for years.'], ['b', 'Longer than you know.'],
      ['a', 'Who were you?'], ['n', 'The Shade is silent for a long time.'],
      ['b', 'A hero, once. Then a boy sent home to a time that did not remember him.'], ['a', 'That sounds lonely.'],
      ['b', 'It was. My skills went with me to the grave. No one learned them.'], ['a', 'I\'m learning them now.'],
    ],
    A: [
      ['b', 'I spent my life wishing the world had known what I did for it.'], ['a', 'Do you still wish that?'],
      ['b', 'No. I see now that it was not the world\'s memory I needed.'], ['n', 'The Shade lowers his sword.'],
      ['b', 'I needed someone to carry it forward. Someone to make the sacrifice mean something.'], ['a', 'It does.'],
      ['b', 'Then my regret grows lighter.'],
    ],
    S: [
      ['b', 'You have learned every technique I have to teach.'], ['a', 'Then this is the last lesson?'],
      ['b', 'One more. Do not let the sword become your whole self, as I did.'], ['a', 'What else is there?'],
      ['b', 'Your village. Your friends. A horse that waits for you. Hold on to them.'], ['n', 'The Shade places a hand on his shoulder. It is barely there at all.'],
      ['b', 'Go now, my child. Live the life I could not.'], ['a', 'I will. I promise.'],
    ],
  },
  'colin|heroOfTwilight': {
    C: [
      ['a', 'Link! Can you show me how you hold your sword? I want to try.'], ['b', 'Here. Two hands.'],
      ['a', 'It\'s so heavy! How do you swing this all day?'], ['b', 'Practice.'],
      ['n', 'Colin wobbles, then steadies himself.'], ['a', 'Dad says you\'re the bravest person in Ordon. I want to be like that.'],
      ['b', 'You already are.'], ['a', 'Me? No way!'],
    ],
    B: [
      ['a', 'When the Bulblins took me, I was so scared. I cried the whole time.'], ['b', 'Anyone would.'],
      ['a', 'Did you ever cry? When you came to get me?'], ['b', '…A little.'],
      ['a', 'Really?'], ['b', 'Being scared is fine. You still pushed Beth out of the way of that boar.'],
      ['a', 'I didn\'t think about it. I just did it.'], ['b', 'That\'s courage.'],
    ],
    A: [
      ['a', 'I\'ve been practicing with the wooden sword every night. Look!'], ['n', 'Colin runs through a simple drill, carefully, every step correct.'],
      ['b', 'Good form.'], ['a', 'I still can\'t fight like you. But I can stand in front of the little ones.'],
      ['b', 'That\'s the important part.'], ['a', 'Being brave isn\'t about not being afraid, is it?'],
      ['b', 'No. It\'s doing it anyway.'],
    ],
    S: [
      ['a', 'Link, when I grow up, I want to protect Ordon. Like you and Dad do.'], ['b', 'You will.'],
      ['a', 'You really think so?'], ['b', 'I know so. You\'re braver than I was at your age.'],
      ['n', 'Colin straightens up, as tall as he can.'], ['a', 'Then I\'ll keep the village safe while you\'re away. I promise.'],
      ['b', 'I\'m counting on you.'], ['a', 'I won\'t let you down!'],
    ],
  },
  'heroOfTwilight|rusl': {
    C: [
      ['b', 'You\'ve let your guard drop on the left again. I warned you about that at the ranch.'], ['a', 'Sorry.'],
      ['b', 'Don\'t apologize, fix it. Here — shoulder up.'], ['n', 'Rusl taps Link\'s elbow with the flat of his blade.'],
      ['b', 'That\'s it. Your father would\'ve had my hide if I\'d taught you sloppy.'], ['a', 'You knew him?'],
      ['b', 'Long ago. Another time, lad.'],
    ],
    B: [
      ['b', 'I should\'ve been the one to go after the children. Not you.'], ['a', 'You were hurt.'],
      ['b', 'A cut on the head. I\'ve had worse falling off a fence.'], ['a', 'I didn\'t mind going.'],
      ['b', 'I know. That\'s what worries me. You never mind.'], ['n', 'Rusl sighs and rubs his brow.'],
      ['b', 'You\'re not a lad who asks for help. Promise me you\'ll learn.'], ['a', 'I\'ll try.'],
    ],
    A: [
      ['b', 'When you first came to Ordon, you were no taller than my sword. Barely spoke a word.'], ['a', 'I still don\'t.'],
      ['b', 'Ha! True enough. But you listened. You always listened.'], ['n', 'Rusl looks at him with quiet pride.'],
      ['b', 'Uli and I… we always thought of you as one of ours.'], ['a', 'I know. Thank you.'],
    ],
    S: [
      ['b', 'Link. I\'ve something for you.'], ['n', 'He holds out a worn leather sword belt, the stitching redone many times.'],
      ['b', 'It was mine, when I first carried a blade for Ordon. I want you to have it.'], ['a', 'Rusl, I can\'t…'],
      ['b', 'You can. A father passes things down to his son. That\'s just how it is.'], ['a', 'Father?'],
      ['b', 'Near enough. Wear it well, lad.'], ['a', 'I will.'],
    ],
  },
  'heroOfTwilight|mayorBo': {
    C: [
      ['b', 'Link! Those Gorons in camp keep challenging folk to wrestle. You remember the stance I taught you?'], ['a', 'Feet wide.'],
      ['b', 'Feet wide, hips low, and never, ever let go of the belt! Ordon sumo is a proud tradition!'], ['a', 'I remember.'],
      ['n', 'Bo slaps his own belly with satisfaction.'], ['b', 'Good lad. Show them what a goat-farming village is made of!'],
    ],
    B: [
      ['b', 'Did you know Ordon\'s sumo comes from the Gorons? My grandfather learned it on the mountain.'], ['a', 'Really?'],
      ['b', 'Oh, yes! He came back with a sore back and a belt. Ha ha!'], ['n', 'Bo shows the frayed belt he still wears.'],
      ['b', 'We keep the old ways in Ordon. The spring, the festival, the wrestling. They bind us together.'],
      ['a', 'I like the old ways.'], ['b', 'I knew you would.'],
    ],
    A: [
      ['b', 'I saw you beat Gor Coron. Square in the ring! My knees nearly gave out.'], ['a', 'You helped.'],
      ['b', 'Me? I just showed you a few moves in my living room.'], ['a', 'They worked.'],
      ['n', 'Bo\'s eyes get suspiciously wet.'], ['b', 'You\'ve made Ordon proud, Link. Proud as can be.'],
      ['b', 'When you come home, we\'ll hold a festival in your name. I insist!'],
    ],
  },
  'heroOfTwilight|malo': {
    C: [
      ['b', 'Link. You\'re out of arrows again.'], ['a', 'How do you know?'],
      ['b', 'I count. Customers who run out of arrows come to me. Malo Mart always has stock.'], ['a', 'You have a shop here?'],
      ['b', 'A stall. For now.'], ['n', 'Malo slides a quiver across the crate he uses as a counter.'],
      ['b', 'Thirty rupees. No discounts for heroes.'],
    ],
    B: [
      ['b', 'I\'m opening a second branch. Near the supply wagons.'], ['a', 'You\'re… what, eight?'],
      ['b', 'Age is irrelevant. Location is everything.'], ['a', 'Who\'s running it?'],
      ['b', 'I hired two Goron soldiers. They work for rock sirloin.'], ['n', 'Link has no response to this.'],
      ['b', 'You may continue to shop with me. Loyal customers are appreciated.'],
    ],
    A: [
      ['b', 'Malo Mart now supplies three companies in this army.'], ['a', 'That\'s impressive.'],
      ['b', 'It is. I didn\'t do it for the rupees, though.'], ['a', 'No?'],
      ['b', 'Mostly for the rupees. But also so nobody runs out of arrows when it matters.'], ['n', 'Malo pushes a quiver over. There is no price tag.'],
      ['b', 'That one\'s free. Don\'t tell anyone.'],
    ],
  },
  'heroOfTwilight|renado': {
    C: [
      ['b', 'The Ordon children are asleep in my tent. Talo snores like a Goron.'], ['a', 'He always did.'],
      ['b', 'You need not worry for them while they are with me. Kakariko kept them safe once.'], ['a', 'I remember.'],
      ['n', 'Renado lights a small lamp of incense.'], ['b', 'Children should not see a war. But we do what we can.'],
    ],
    B: [
      ['b', 'Beth asked me today if you will die in battle.'], ['a', 'What did you say?'],
      ['b', 'That you are very stubborn. She found that comforting.'], ['a', 'It\'s true.'],
      ['b', 'Indeed. Luda has taken them under her wing. She teaches them the spirit songs.'],
      ['n', 'From the tent, faint, comes the sound of children singing off-key.'], ['b', 'They are learning.'],
    ],
    A: [
      ['b', 'You fight so that they may grow. I pray so that they may heal. It is the same work.'], ['a', 'I hadn\'t thought of it like that.'],
      ['b', 'When the shadow fell on Kakariko, I could not wield a sword. Only shelter them.'], ['a', 'That was enough.'],
      ['b', 'Was it? I wonder, some nights.'], ['a', 'They\'re alive. They\'re singing.'],
      ['n', 'Renado smiles.'], ['b', 'Then yes. Perhaps it was enough.'],
    ],
  },
  'ashei|heroOfTwilight': {
    C: [
      ['a', 'You. Ordon boy. I watched you clear that ridge alone today.'], ['b', 'It needed clearing.'],
      ['a', 'Reckless. Effective, but reckless.'], ['n', 'Ashei sharpens her blade without looking up.'],
      ['a', 'Next time, signal. I\'ll take the flank.'], ['b', 'Fine.'],
      ['a', 'Good. Don\'t make me ask twice.'],
    ],
    B: [
      ['a', 'My father trained me in the mountains. Taught me to fight in the cold, the dark, on ice.'], ['b', 'Snowpeak?'],
      ['a', 'Near it. Who trained you?'], ['b', 'Rusl. And… a ghost.'],
      ['a', 'A ghost.'], ['b', 'Yes.'], ['n', 'Ashei stares at him, then snorts.'],
      ['a', 'Well. It shows. You fight like someone from another century.'],
    ],
    A: [
      ['a', 'Spar with me. No holding back this time.'], ['n', 'Steel rings across the camp until long after dark. Neither yields.'],
      ['a', 'Hah… you\'re good. Better than good.'], ['b', 'So are you.'],
      ['a', 'I don\'t trust easily. But I\'d stand back to back with you anywhere.'], ['b', 'Same.'],
      ['a', 'Then that\'s settled. Don\'t get yourself killed.'],
    ],
  },
  'auru|heroOfTwilight': {
    C: [
      ['a', 'You\'ve the look of someone who doesn\'t care for history lessons.'], ['b', 'I\'m listening.'],
      ['a', 'Hm. Good. Most young folk can\'t sit still for a word about the old kingdom.'],
      ['a', 'Did you know the Gerudo once had a king? Only one born every hundred years.'], ['b', 'Ganondorf.'],
      ['n', 'Auru\'s eyebrows rise.'], ['a', 'You know more than you let on, boy.'],
    ],
    B: [
      ['a', 'The sages tried to execute him in the Arbiter\'s Grounds. I was there, more or less, in the records I studied.'],
      ['b', 'It didn\'t work.'], ['a', 'No. The Triforce of Power saved him. The sages banished him to the Twilight instead.'],
      ['a', 'History is a strange thing. One mistake, and it echoes for centuries.'], ['b', 'Like Zant.'],
      ['a', 'Precisely like Zant.'],
    ],
    A: [
      ['a', 'I taught the princess once. Did she tell you?'], ['b', 'No.'],
      ['a', 'Bright girl. Too serious. She understood that a kingdom which forgets its past is doomed to repeat it.'],
      ['n', 'Auru taps the stem of his pipe against his knee.'], ['a', 'You\'re living history, boy. Make sure someone writes it down properly.'],
      ['b', 'You could.'], ['a', 'Ha! Maybe I will.'],
    ],
  },
  'heroOfTwilight|shad': {
    C: [
      ['b', 'Excuse me — you\'re the one who\'s been to the City in the Sky? Truly?'], ['a', 'Yes.'],
      ['b', 'Oh, marvelous! My father spent his whole life searching for the Oocca, and you simply… went.'], ['a', 'With a cannon.'],
      ['b', 'A cannon. Of course. Why didn\'t I think of a cannon?'], ['n', 'Shad scribbles furiously in his notebook.'],
    ],
    B: [
      ['b', 'What were they like? The Oocca? Did they speak? Were they wise and noble?'], ['a', 'They\'re… birds. With faces.'],
      ['b', 'Birds with faces.'], ['a', 'And they lay eggs.'],
      ['n', 'Shad\'s pen stops moving.'], ['b', 'I see. That\'s… not quite what the legends said.'],
      ['b', 'No matter! Truth is more interesting than legend. Usually.'],
    ],
    A: [
      ['b', 'Ooccoo showed me her journal today. She was quite charming, once I stopped screaming.'], ['a', 'She has that effect.'],
      ['b', 'I\'ve decided my father wasn\'t wrong. The Oocca are real, and closer to the gods than we are.'],
      ['b', 'Just… not the way anyone pictured.'], ['n', 'He closes the notebook gently.'],
      ['b', 'Thank you, Link. You\'ve finished his life\'s work for him.'], ['a', 'You finished it.'],
    ],
  },
  'heroOfTwilight|telma': {
    C: [
      ['b', 'Well, if it isn\'t my favorite country boy. Still running errands for the Resistance, honey?'], ['a', 'Still.'],
      ['b', 'Good. Auru needs a map delivered and Ashei needs someone to argue with.'], ['a', 'I can do one of those.'],
      ['n', 'Telma laughs and scratches Louise behind the ears.'], ['b', 'Sweetie, you\'re exactly what this group needed.'],
    ],
    B: [
      ['b', 'You know you\'re the only one of us who\'s actually gotten anything done?'], ['a', 'That\'s not true.'],
      ['b', 'Shad reads. Auru grumbles. Ashei glares. Rusl worries. And you go out and fix things.'],
      ['a', 'They help.'], ['b', 'They do, they do. But they help better with you there.'],
      ['n', 'She pours him a drink. It\'s milk.'], ['b', 'Don\'t look at me like that, you\'re underage.'],
    ],
    A: [
      ['b', 'I started the Resistance in the back of my bar because nobody else would. Did I ever tell you that?'], ['a', 'No.'],
      ['b', 'Just a few drinks and grumbling, at first. Then the Twilight came, and grumbling wasn\'t enough.'],
      ['b', 'You turned us into something real, honey. A family, almost.'], ['a', 'You did that.'],
      ['n', 'Telma pats his cheek fondly.'], ['b', 'Well, we did it together. Now go eat something.'],
    ],
  },
  'heroOfTwilight|ralis': {
    C: [
      ['b', 'Link. I wanted to thank you. For carrying me to Kakariko.'], ['a', 'Ilia carried you.'],
      ['b', 'Ilia found me. You carried me. I was quite heavy, I\'m told.'], ['n', 'Ralis manages a small, tired smile.'],
      ['b', 'The Zoras look to me now. I\'m not sure I\'m ready.'], ['a', 'Nobody is.'],
    ],
    B: [
      ['b', 'My mother\'s ghost asked you to save me. She trusted you more than anyone.'], ['a', 'She loved you.'],
      ['b', 'I know. And now I must lead in her place, and I keep asking: what would she do?'],
      ['a', 'Ask what you would do.'], ['b', 'What if it\'s wrong?'], ['a', 'Then you fix it.'],
      ['n', 'Ralis considers this, frowning.'], ['b', 'You make it sound so simple.'],
    ],
    A: [
      ['b', 'I spoke to the Zora captains today. They listened. All of them.'], ['a', 'Good.'],
      ['b', 'I was terrified the whole time. My fins were shaking.'], ['a', 'Mine shake too.'],
      ['b', 'You don\'t have fins.'], ['a', 'My hands, then.'],
      ['n', 'Ralis laughs for the first time in a long while.'], ['b', 'Thank you, Link. I think I can do this.'],
    ],
  },
  'heroOfTwilight|yeto': {
    C: [
      ['b', 'Little guy! You come here for soup? Yeto make big pot.'], ['a', 'Sure.'],
      ['b', 'Good, good! Pumpkin, cheese, little bit of reekfish. Yeta say Yeto make best soup.'], ['n', 'Yeto ladles an enormous bowl.'],
      ['b', 'Eat! Then we race down hill again. Yeto win last time!'], ['a', 'You cheated.'],
      ['b', 'Yeto no cheat! Yeto just big.'],
    ],
    B: [
      ['b', 'Yeto find good hill behind camp. Very steep. Good for board!'], ['a', 'I\'ll race you.'],
      ['n', 'Two shapes, one tiny and one huge, hurtle down the snowy slope.'], ['b', 'Ho ho! Little guy fast!'],
      ['a', 'You took a shortcut.'], ['b', 'Shortcut not cheating. Shortcut smart!'],
      ['a', 'Again?'], ['b', 'Again!'],
    ],
    A: [
      ['b', 'Little guy. Yeto want say thank you. For Yeta.'], ['a', 'She\'s better now?'],
      ['b', 'Yeta smile again. Yeta make jokes. Yeto almost lose her.'], ['n', 'The big yeti sniffs and wipes his nose.'],
      ['b', 'Little guy friend forever. Yeto make soup every day for you.'], ['a', 'Every day?'],
      ['b', 'Every day! Also race. Yeto still win.'],
    ],
  },
  'heroOfTwilight|yeta': {
    C: [
      ['b', 'You… are the little one. Who climbed our house.'], ['a', 'Yes. How do you feel?'],
      ['b', 'Cold. Even here. Yeta was always warm before.'], ['n', 'She pulls her shawl tighter.'],
      ['b', 'Yeta does not remember much. Only the mirror. So pretty. So cold.'], ['a', 'It\'s gone now.'],
    ],
    B: [
      ['b', 'Yeta dreamed of ice again. Of looking at Yeto and not knowing him.'], ['a', 'That wasn\'t you.'],
      ['b', 'But it was Yeta\'s hands. Yeta\'s voice. Yeta frightened you.'], ['a', 'I\'ve been frightened before.'],
      ['n', 'She looks at him with wide, sad eyes.'], ['b', 'You forgive Yeta?'], ['a', 'There\'s nothing to forgive.'],
    ],
    A: [
      ['b', 'Yeto made soup with too much cheese again. Yeta laughed. First time in long time.'], ['a', 'That\'s good.'],
      ['b', 'Yeta thinks the cold is leaving. A little more each day.'], ['n', 'She takes Link\'s small hand in her huge one.'],
      ['b', 'Thank you, little one. You brought Yeta home.'], ['a', 'You found your own way back.'],
      ['b', 'Hee hee. Maybe both.'],
    ],
  },
  'heroOfTwilight|ooccoo': {
    C: [
      ['b', 'Oh! It\'s you! I was wondering when you\'d find me again!'], ['a', 'You were in my bag.'],
      ['b', 'Yes, and it\'s very cramped in there. You carry far too many bottles.'], ['n', 'Ooccoo flaps indignantly.'],
      ['b', 'Still, I can\'t complain. You did get me out of that dreadful forest temple.'], ['a', 'You\'re welcome.'],
    ],
    B: [
      ['b', 'Do you remember the Goron mines? That awful heat? My feathers have never recovered.'], ['a', 'You hid in a pot.'],
      ['b', 'A lady must look after herself!'], ['a', 'And the Zora temple?'],
      ['b', 'Wet. So very wet. I don\'t want to talk about it.'], ['n', 'She fluffs her feathers primly.'],
      ['b', 'But we did have adventures, didn\'t we? Strange ones.'], ['a', 'Very strange.'],
    ],
    A: [
      ['b', 'Ooccoo Jr. told me you were very polite to him. Even when he… you know.'], ['a', 'When he wouldn\'t stop staring?'],
      ['b', 'Exactly! Most people scream. You just nodded.'], ['n', 'Ooccoo beams, which is unsettling.'],
      ['b', 'You\'re a good friend to the Oocca, Link. When this ends, I\'ll take you home to the sky properly.'],
      ['a', 'No cannon?'], ['b', 'No cannon. I promise.'],
    ],
  },
  'heroOfTwilight|kingBulblin': {
    C: [
      ['n', 'King Bulblin\'s boar is tethered near the edge of camp. The king himself watches Link from across the fire.'],
      ['b', 'Hrrn.'], ['a', 'You\'re fighting with us now.'], ['n', 'The king spits into the fire and says nothing.'],
      ['a', 'Fine. Just don\'t take any more children.'], ['b', 'Grrh.'],
    ],
    B: [
      ['n', 'At dawn, the king blocks the path with his boar, horn in hand.'], ['a', 'You want to fight.'],
      ['b', 'Hrrh!'], ['n', 'They clash on the bridge outside camp. Neither falls. Eventually, the king lowers his axe.'],
      ['b', '…Hrm.'], ['a', 'Again tomorrow?'], ['n', 'The king grunts in what might be agreement.'],
    ],
    A: [
      ['n', 'After the battle, King Bulblin drops a bundle at Link\'s feet: a carved Bulblin horn, polished.'],
      ['a', 'For me?'], ['b', 'Hrr.'], ['n', 'He thumps his own chest once, then points at Link.'],
      ['a', 'Strongest?'], ['n', 'The king nods, just once, and rides away.'],
    ],
  },
  'ganondorfTP|heroOfTwilight': {
    C: [
      ['a', 'So the gods have chosen another whelp to wield their courage. How tiresome.'], ['b', 'I didn\'t ask to be chosen.'],
      ['a', 'None of you ever do. That is what makes you so weak.'], ['n', 'Ganondorf turns his hand, the Triforce of Power glowing faintly.'],
      ['a', 'I seized what I wanted. You merely hold what was handed to you.'], ['b', 'Then I hold it better.'],
    ],
    B: [
      ['a', 'Power is the only truth in this world, boy. Every king, every god, knows it.'], ['b', 'You\'re wrong.'],
      ['a', 'Am I? Your princess surrendered to Zant because she lacked it. Your village fell for lack of it.'],
      ['b', 'They got back up.'], ['a', 'Only because you had the strength to drag them.'],
      ['b', 'No. Because they helped each other.'], ['n', 'Ganondorf\'s lip curls.'],
    ],
    A: [
      ['a', 'You could have power to match mine. Take it. No one would stop you.'], ['b', 'I don\'t want it.'],
      ['a', 'Liar. Every man wants it.'], ['b', 'I want to go home and herd goats.'],
      ['n', 'For a moment, Ganondorf is genuinely silent.'], ['a', 'Goats.'],
      ['b', 'That\'s what I\'m fighting for. Not power.'], ['a', 'Then you are a greater fool than I thought. Or something I do not understand.'],
    ],
  },
  'heroOfTwilight|zant': {
    C: [
      ['b', 'Ah. The beast. The little dog the princess kept on a leash.'], ['a', 'I\'m not a dog.'],
      ['b', 'No? You walked on four legs in my Twilight. You whimpered in my light.'], ['n', 'Zant tilts his head too far to one side.'],
      ['b', 'And yet here you stand, wearing my defeat like a medal.'], ['a', 'I don\'t wear anything of yours.'],
    ],
    B: [
      ['b', 'Do you know what it is to be passed over? To be told you are not worthy of the throne?'], ['a', 'No.'],
      ['b', 'No! Of course not! The gods hand you everything!'], ['n', 'His voice cracks into a shriek, then drops to a whisper.'],
      ['b', 'Forgive me. I am very… calm. Perfectly calm.'], ['a', 'You\'re not.'],
      ['b', 'I AM PERFECTLY CALM.'],
    ],
    A: [
      ['b', 'You beat me. You, a peasant. I have thought about it every night since.'], ['a', 'Why?'],
      ['b', 'Because if you could win with nothing… then perhaps my god gave me nothing too.'], ['n', 'Zant clutches his helm with shaking hands.'],
      ['a', 'You had your people. You threw them away.'], ['b', 'They never chose me.'],
      ['a', 'You never gave them a reason.'], ['n', 'Zant has no answer. He turns away, very still.'],
    ],
  },
  'midnaImp|zeldaTP': {
    C: [
      ['b', 'Midna. You look well. Better than when last we met.'], ['a', 'You mean when I was dying on your floor? Low bar.'],
      ['b', 'I gave you what I had. It seemed the only choice.'], ['a', 'You gave me your life, Princess. People don\'t usually do that for me.'],
      ['n', 'Zelda inclines her head gracefully.'], ['b', 'We are both rulers. We understand debts.'],
    ],
    B: [
      ['a', 'Doesn\'t it bother you? That I\'m the reason the Twilight swallowed your kingdom?'], ['b', 'Zant was the reason.'],
      ['a', 'I failed to stop him. That\'s the same thing for a queen.'], ['b', 'Then I failed too. I surrendered.'],
      ['a', 'Heh. Look at us. Two princesses who lost their thrones to the same idiot.'], ['n', 'Zelda almost laughs.'],
      ['b', 'Then let us take them back together.'],
    ],
    A: [
      ['b', 'When I gave you my power, I felt something of the Twilight. It was not dark. Only quiet.'], ['a', 'That\'s home.'],
      ['b', 'I understand why you love it.'], ['a', 'And I understand why you\'d die for this place. Annoyingly bright as it is.'],
      ['n', 'Midna drifts a little closer.'], ['a', 'You\'re not what I expected from a Hylian royal. I mean that kindly.'],
      ['b', 'I know. I took it kindly.'],
    ],
    S: [
      ['a', 'When this is over, the Mirror will have to break. You know that.'], ['b', 'Must it?'],
      ['a', 'Light and Twilight can\'t touch forever. Someone else might use the path like Ganondorf did.'],
      ['b', 'Then I will not forget you. Hyrule will not forget the Twili again. I swear it.'], ['n', 'Midna takes Zelda\'s hand.'],
      ['a', 'You know… if I had a sister, I\'d want her to be like you.'], ['b', 'Then let us be sisters, across both worlds.'],
      ['a', 'Deal, Princess.'],
    ],
  },
  'ilia|midnaImp': {
    C: [
      ['a', 'So you\'re Midna. Link\'s… friend?'], ['b', 'Something like that. And you\'re the girl he kept moping about.'],
      ['a', 'He mopes?'], ['b', 'Constantly. Very quietly. It\'s hard to notice unless you live in his shadow.'],
      ['a', 'You live in his shadow?'], ['b', 'Long story.'], ['n', 'Ilia looks at Link\'s shadow on the grass, then at Midna, very suspiciously.'],
    ],
    B: [
      ['a', 'You were with him the whole time I was lost. Every day.'], ['b', 'Not by choice, at first.'],
      ['a', 'But you stayed.'], ['b', 'He\'s… hard to leave. Infuriatingly so.'],
      ['a', 'I know. I tried to stay angry with him once. Lasted half a day.'], ['n', 'Midna snorts.'],
      ['b', 'Half a day? Amateur. I lasted weeks.'],
    ],
    A: [
      ['a', 'Midna, can I ask you something? Do you love him?'], ['n', 'Midna nearly falls out of the air.'],
      ['b', 'Wh— what kind of question is that?'], ['a', 'An honest one. I won\'t be angry.'],
      ['b', '…He saved me. More than once. That\'s all I\'ll say.'], ['a', 'That\'s enough.'],
      ['a', 'He\'s lucky. To have both of us looking after him.'], ['b', 'Heh. Don\'t let him hear that. He\'ll get a big head.'],
    ],
  },
  'midnaImp|zant': {
    C: [
      ['b', 'My queen. Or should I say, my former queen? Shrunken and squeaking.'], ['a', 'Hello, Zant. Still wearing that ridiculous fish helmet?'],
      ['b', 'It is a symbol of my office!'], ['a', 'Your stolen office.'],
      ['n', 'Zant\'s sleeves twitch.'], ['b', 'Nothing was stolen. I merely took what you were too weak to hold.'],
    ],
    B: [
      ['b', 'I served your family for years. I was loyal. I was patient. And they chose you. A child.'], ['a', 'They chose me because you\'re like this.'],
      ['b', 'Like WHAT?'], ['a', 'Exactly like that.'], ['n', 'Zant clutches his head and stamps his feet like a toddler.'],
      ['b', 'You know nothing of my suffering!'], ['a', 'I know you cursed my body and enslaved my people. Seems I know plenty.'],
    ],
    A: [
      ['b', 'Why do you let me live? In this army, beside you? You could have me killed.'], ['a', 'I could.'],
      ['b', 'Then why?'], ['a', 'Because a Twili ruler doesn\'t become you. That\'s the whole point.'],
      ['n', 'Zant falls quiet. For a moment he seems smaller.'], ['b', 'You pity me.'],
      ['a', 'A little. Don\'t make me regret it.'],
    ],
  },
  'ganondorfTP|midnaImp': {
    C: [
      ['a', 'The little Twili princess. I remember you. You were in Zant\'s curse.'], ['b', 'You remember the curse you gave him.'],
      ['a', 'I gave him power. He chose what to do with it.'], ['b', 'You gave a madman a weapon and pointed it at my people.'],
      ['n', 'Ganondorf smiles thinly.'], ['a', 'And look how well he used it.'],
    ],
    B: [
      ['b', 'Why Zant? Of all the Twili, why him?'], ['a', 'Because he wanted. Desperately. Bitterly. That is useful.'],
      ['b', 'He was a fool.'], ['a', 'He was a tool. Fools are only tools that do not know it.'],
      ['n', 'Midna\'s hair twitches into a fist and slowly relaxes.'], ['b', 'Keep talking. I\'m memorizing everything for when I hit you.'],
    ],
    A: [
      ['a', 'You stood against me with a borrowed sword and a borrowed hero. You have nerve, I will grant you that.'],
      ['b', 'Nothing about him is borrowed. He chose to stand with me.'], ['a', 'Sentiment.'],
      ['b', 'You call it that because you\'ve never had anyone choose you.'], ['n', 'Ganondorf\'s smile fades.'],
      ['b', 'That\'s the difference between you and me. And why you\'ll lose.'],
    ],
  },
  'lanayru|midnaImp': {
    C: [
      ['a', 'Twilight child. You are far from the shadow, and the light still burns you.'], ['b', 'I\'ve noticed, thanks.'],
      ['a', 'I remember when you lay near death beneath the castle. The light nearly took you.'], ['n', 'Midna stiffens.'],
      ['b', 'I\'d rather not remember that.'], ['a', 'Memory is water. It goes where it will.'],
    ],
    B: [
      ['b', 'You know what I thought, when I was lying there? That I\'d die in a world that hated me.'], ['a', 'The world did not hate you.'],
      ['b', 'It burned me. Same thing, when you\'re small.'], ['a', 'And yet a hero carried you through it.'],
      ['b', 'In the rain. Without stopping.'], ['n', 'Her voice wavers, just slightly.'], ['b', 'Stupid wolf.'],
    ],
    A: [
      ['a', 'The light harmed you because you were not meant for it. And yet the princess gave you hers.'], ['b', 'She did.'],
      ['a', 'Light willingly given does not burn. Remember this.'], ['n', 'Midna looks at her own small hands.'],
      ['b', 'So it isn\'t the light I\'m afraid of. It\'s being alone in it.'], ['a', 'You are not alone.'],
      ['b', '…No. I suppose I\'m not.'],
    ],
  },
  'herosShade|midnaImp': {
    C: [
      ['b', 'So you\'re the ghost who keeps teaching him tricks. You\'re a cheerful one.'], ['a', 'I am what remains.'],
      ['b', 'Of what?'], ['a', 'Of a hero who came before him.'],
      ['n', 'Midna circles the Shade curiously.'], ['b', 'He\'s got your eyes. Well. Your eye.'],
    ],
    B: [
      ['a', 'You watch over him. As someone once watched over me.'], ['b', 'Who?'],
      ['a', 'A fairy. She left when my work was finished. I never saw her again.'], ['n', 'The Shade\'s voice grows quieter.'],
      ['b', 'That\'s… awful.'], ['a', 'It is why I teach him. So that what I carried is not lost.'],
      ['b', 'Then I\'ll make sure he doesn\'t lose it.'],
    ],
    A: [
      ['b', 'He\'s going to be all right, isn\'t he? After all this?'], ['a', 'He has more than I had.'],
      ['b', 'Like what?'], ['a', 'A home that remembers him. And a companion who chose to stay with him.'],
      ['n', 'Midna looks away.'], ['b', 'I can\'t stay forever.'],
      ['a', 'Then stay as long as you can. Leave him a memory, not a silence. That is enough.'], ['b', 'I\'ll try.'],
    ],
  },
  'midnaImp|telma': {
    C: [
      ['b', 'Well, aren\'t you a cute little thing. You come with the hero, honey?'], ['a', 'Cute? Watch it, lady.'],
      ['b', 'Ooh, she\'s got claws. I like that.'], ['n', 'Telma\'s cat Louise hisses at Midna. Midna hisses back.'],
      ['b', 'Ha! You and Louise are going to be best friends.'], ['a', 'Doubt it.'],
    ],
    B: [
      ['b', 'You know, I\'ve run a bar a long time. You learn to tell when someone\'s wearing armor on the inside.'],
      ['a', 'I\'m not wearing anything.'], ['b', 'Exactly my point, sweetie. Nobody gets close to you, do they?'],
      ['a', 'That\'s none of your business.'], ['b', 'Mm-hm. That\'s what Ashei said too. Now she drinks here every night.'],
      ['n', 'Midna scowls and says nothing.'],
    ],
    A: [
      ['a', 'Fine. You win. I don\'t let people close because they always want something.'], ['b', 'And the hero?'],
      ['a', 'He never wanted anything. That\'s what scared me.'], ['b', 'Oh, honey.'],
      ['n', 'Telma pours a small cup and slides it across the counter.'], ['b', 'You can drop the armor here. Louise won\'t tell.'],
      ['a', '…Thanks, Telma.'],
    ],
  },
  'agitha|midnaImp': {
    C: [
      ['a', 'Ooh! You\'re ever so pretty! Are you a bug? A sort of shadowy fairy-bug?'], ['b', 'I am NOT a bug.'],
      ['a', 'You float like a dragonfly, though!'], ['b', 'I\'m a Twili. A princess, actually.'],
      ['a', 'A princess! Like me! Princess of the Insect Kingdom!'], ['n', 'Midna stares at Agitha for a very long moment.'],
      ['b', 'Sure. Why not.'],
    ],
    B: [
      ['a', 'Princess Midna, do you have bugs in your Twilight world? Shadow bugs? Ever so dark and glowy ones?'],
      ['b', 'Hm. There are little things that drift over the fields at dusk. Like sparks.'], ['a', 'Oh! Oh, how wonderful!'],
      ['b', 'They\'re not that wonderful.'], ['a', 'They are to me! Will you draw one?'],
      ['n', 'Midna sighs, then sketches a small, glowing shape in the dirt with a finger of hair.'],
    ],
    A: [
      ['a', 'I made you this! A Twilight bug doll! I sewed the glowy bits from my best ribbon!'], ['b', 'You… made this for me?'],
      ['a', 'Princesses should give each other gifts. It\'s good manners.'], ['n', 'Midna holds the lopsided little doll carefully.'],
      ['b', 'It\'s… actually not terrible.'], ['a', 'That means you love it!'],
      ['b', 'Heh. Fine. I love it. Don\'t tell anyone.'],
    ],
  },
  'midnaImp|shadowBeast': {
    C: [
      ['n', 'The Shadow Beast crouches at the edge of camp, its mask-like face turned toward Midna.'], ['b', 'Hrrrrk…'],
      ['a', 'Easy. I know what you are.'], ['n', 'The beast\'s strange limbs twitch. It doesn\'t attack.'],
      ['a', 'Zant twisted you. You were one of mine once.'], ['b', 'Hhhh…'],
    ],
    B: [
      ['n', 'Midna sits near the beast at night. Neither moves much.'], ['a', 'Do you remember anything? Your name? Your home?'],
      ['b', 'Krrrh.'], ['n', 'It lifts one long arm and points toward the twilit sky beyond the hills.'],
      ['a', 'Yes. That way. The Palace of Twilight.'], ['n', 'The beast lowers its head.'],
      ['a', 'You remember. Somewhere in there, you remember.'],
    ],
    A: [
      ['a', 'When this is over, I\'m going to undo what Zant did. To you. To all of you.'], ['b', 'Hhrrh…'],
      ['n', 'The beast\'s mask tilts. For a moment, something like a Twili\'s posture shows through the monster.'],
      ['a', 'You\'re not a monster. You\'re my subject. My responsibility.'], ['n', 'It bows, slowly and awkwardly, to its queen.'],
      ['a', 'Hang on a little longer. I\'ll bring you home.'],
    ],
  },
  'heroOfTwilight|midnaImp#wolfLink': {
    C: [
      ['n', 'Midna rides on the wolf\'s back, one hand fisted in his fur.'], ['b', 'Left. No, my left. Ugh, go left!'],
      ['a', 'Grrrr.'], ['b', 'Don\'t growl at me. You\'re my faithful steed, remember? Steeds don\'t talk back.'],
      ['n', 'The wolf stops dead and sits down. Midna nearly tumbles off.'], ['b', 'Hey! Fine, fine. Please go left.'],
      ['n', 'He goes left.'],
    ],
    B: [
      ['b', 'You know, you\'re not a bad listener. Probably because you can\'t interrupt.'], ['a', 'Hff.'],
      ['n', 'The wolf flicks an ear at her.'], ['b', 'That was a snort, wasn\'t it? You\'re laughing at me.'],
      ['b', 'Fine. Here\'s something I\'ve never told anyone: I hate giving orders. I just don\'t know how else to ask.'],
      ['n', 'The wolf nudges her hand with his nose, gently.'], ['b', '…Yeah. Okay. I could try asking.'],
    ],
    A: [
      ['n', 'After a hard fight, the wolf limps. Midna slides off his back and walks beside him instead.'],
      ['b', 'Don\'t look so surprised. I can walk. Float. Whatever.'], ['a', 'Wrrf?'],
      ['b', 'Because you\'re hurt, idiot. A partner doesn\'t ride a partner who\'s bleeding.'], ['n', 'The wolf stops and looks at her.'],
      ['b', 'What? Yes, I said partner. Don\'t make it weird.'], ['a', 'Awoo.'],
    ],
    S: [
      ['n', 'The two of them sit on a hill above camp, watching the sunset bleed into twilight.'], ['b', 'Funny. This is my favorite time of day now.'],
      ['b', 'It\'s when I first met you. Snarling in a cell. You were terrifying.'], ['a', 'Hrrn.'],
      ['b', 'Okay, you were a mess. But you were the only one who ever came back for me. Every time.'],
      ['n', 'The wolf leans his warm weight against her side.'], ['b', 'I\'m glad it was you. Whatever shape you\'re in.'],
      ['a', 'Awoooo…'],
    ],
  },
  'heroOfTwilight|herosShade#wolfLink': {
    C: [
      ['n', 'At the edge of camp stands a Howling Stone, carried by the army\'s engineers. The wolf lifts his head and howls.'],
      ['b', 'You know the old song. Good. Follow it to me.'], ['n', 'A golden wolf appears in the mist, still and watchful.'],
      ['b', 'In this form, I can only speak to you through the song. Listen.'], ['a', 'Awoo…'],
    ],
    B: [
      ['n', 'The golden wolf and the dark wolf circle each other under the moon.'], ['b', 'You howl well. Better than I did.'],
      ['b', 'I wandered as a beast too, for a time. Not by curse, but by regret.'], ['a', 'Hrrr?'],
      ['b', 'A spirit with unfinished work cannot rest. So I waited at these stones for someone to sing.'],
      ['n', 'The wolf tilts his head and gives a soft, low whine.'],
    ],
    A: [
      ['b', 'Sing the last song with me. The one the sages taught the old heroes.'], ['n', 'Two voices rise together over the camp, wolf and golden wolf.'],
      ['a', 'Awooooo…'], ['b', 'It is complete. My song lives in you now, whatever shape you wear.'],
      ['n', 'The golden wolf bows its head and fades into the mist. The dark wolf watches the place where it stood.'],
    ],
  },
  'heroOfTwilight|ilia#wolfLink': {
    C: [
      ['b', 'Oh! You\'re the wolf everyone talks about. Hello there.'], ['n', 'The wolf freezes, then slowly sits.'],
      ['b', 'You\'re not scary at all. Are you? You\'ve got such kind eyes.'], ['a', 'Wrrf.'],
      ['n', 'Ilia reaches out. He lets her scratch behind his ears.'], ['b', 'Funny. You remind me of someone.'],
    ],
    B: [
      ['b', 'I brought you some goat cheese. Don\'t tell anyone in camp.'], ['n', 'The wolf eats it in one bite.'],
      ['b', 'Link always eats it like that too! All at once, like someone\'s going to take it.'], ['a', 'Hff.'],
      ['b', 'Strange. Epona isn\'t frightened of you either. She\'s frightened of all wolves.'],
      ['n', 'The wolf looks away very innocently.'],
    ],
    A: [
      ['b', 'When I didn\'t have my memories, I dreamed of a wolf. It sat by my bed in Kakariko.'], ['n', 'The wolf\'s ears drop.'],
      ['b', 'I thought it was a dream. It wasn\'t, was it?'], ['a', 'Whine…'],
      ['b', 'You don\'t have to tell me. I just know.'], ['n', 'She rests her forehead against his.'],
      ['b', 'Whoever you are, you\'re home. Okay?'], ['a', 'Wrrf.'],
    ],
  },
  'heroOfTwilight|ordona#wolfLink': {
    C: [
      ['b', 'Child of Ordon. My chosen. You come before me again, wearing the shape of the beast.'], ['n', 'The wolf lowers his head.'],
      ['b', 'Do not be ashamed. The Twilight changed your form, but not your heart.'], ['a', 'Hrrn.'],
      ['b', 'I have watched over the village of Ordon for many ages. I watched you grow.'],
    ],
    B: [
      ['b', 'I chose you once to guard my forest. You were a boy who herded goats and climbed trees.'], ['n', 'The wolf looks at his own paws.'],
      ['b', 'Now you wear fang and fur. Does this frighten you?'], ['a', 'Whine.'],
      ['b', 'It need not. A protector must sometimes be fierce. Even goats know this, when wolves come.'],
      ['n', 'The wolf\'s tail moves, just slightly.'],
    ],
    A: [
      ['b', 'You have grown far beyond the forest. Beyond what I imagined for you.'], ['a', 'Awoo.'],
      ['b', 'Whether man or beast, you remain Ordon\'s guardian. I chose well.'], ['n', 'Golden light gathers around the wolf like spring sunshine.'],
      ['b', 'Go. Carry my blessing in whatever shape you take. And come home when it is done.'],
    ],
  },
  'faron|heroOfTwilight#wolfLink': {
    C: [
      ['a', 'Your eyes are open, but you do not yet see. Close them.'], ['n', 'The wolf obeys, ears twitching.'],
      ['a', 'What do you hear? Smell? The world speaks to the beast more clearly than to the man.'], ['b', 'Snff.'],
      ['a', 'Yes. There. Something hidden beneath the earth. Dig.'], ['n', 'The wolf digs, and finds a buried pouch of rupees.'],
    ],
    B: [
      ['a', 'You hunt by sight still. That is the man\'s habit. Use your nose.'], ['n', 'The wolf sniffs the air, frustrated.'],
      ['b', 'Grrr.'], ['a', 'Patience. The forest is full of scents. Choose one, and follow it to its end.'],
      ['n', 'Slowly, the wolf\'s nose settles on a trail. He follows it to a lost soldier hiding in the brush.'],
      ['a', 'Good. Your senses are a lantern in the dark. Learn to carry it.'],
    ],
    A: [
      ['a', 'You see what others cannot now. The spirits of the dead. The hidden paths.'], ['n', 'The wolf\'s eyes glow faintly in the dusk.'],
      ['a', 'This is a gift, and a burden. Not all things you sense are kind.'], ['b', 'Hrrn.'],
      ['a', 'But you walk on, unafraid. That is why the light chose you.'], ['n', 'The wolf howls once, softly, and the forest answers.'],
    ],
  },
  'eldin|heroOfTwilight#wolfLink': {
    C: [
      ['a', 'You hold back, beast. I see it in your shoulders. You fear your own teeth.'], ['n', 'The wolf\'s hackles rise.'],
      ['b', 'Grrr.'], ['a', 'Good. That is a beginning. The fire in you is not evil. It is strength.'],
      ['n', 'Eldin\'s light flickers like embers over the volcanic stone.'],
    ],
    B: [
      ['a', 'When you fought the Bulblins today, you hesitated before you bit.'], ['n', 'The wolf looks away.'],
      ['a', 'You fear becoming a monster. That is wise. But a beast who refuses its nature is weaker for it.'],
      ['b', 'Whine.'], ['a', 'Let the fire burn, child. Guide it. Do not smother it.'],
    ],
    A: [
      ['n', 'The wolf charges through a line of monsters, swift and certain, never losing control.'], ['a', 'Yes. That is it.'],
      ['a', 'Man and beast are one in you now. Neither is master. Both are strength.'], ['b', 'Awoooo!'],
      ['a', 'Eldin\'s fire is yours. Burn bright, and burn true.'], ['n', 'The wolf stands tall amid the cooling ash.'],
    ],
  },
  'heroOfTwilight|lanayru#wolfLink': {
    C: [
      ['b', 'You walk in shadow and carry the light. A strange creature indeed.'], ['n', 'The wolf sits, ears perked.'],
      ['b', 'Many believe light and shadow are enemies. Look at your own shape upon the water.'],
      ['n', 'The wolf peers into the lake. His reflection shimmers, half wolf, half man.'], ['a', 'Hrrn?'],
    ],
    B: [
      ['b', 'Without shadow, light has no shape. Without light, shadow has no meaning.'], ['a', 'Wrrf.'],
      ['b', 'You were made a beast by Twilight. Yet in that form, you saved the light spirits.'],
      ['n', 'The wolf thinks of Midna, small and fierce, riding on his back.'], ['b', 'You understand, I see.'],
    ],
    A: [
      ['b', 'The Twili were banished long ago. Now one of them rides beside the chosen hero.'], ['n', 'The wolf\'s tail sweeps the ground.'],
      ['b', 'Light and shadow, side by side. Perhaps the old wound may heal at last.'], ['a', 'Awoo.'],
      ['b', 'Go, child of both worlds. Carry the balance with you.'], ['n', 'Lanayru\'s glow fades into the still water.'],
    ],
  },
  'agitha|heroOfTwilight#wolfLink': {
    C: [
      ['a', 'Ooh! A doggy! A great big shadowy doggy!'], ['n', 'The wolf backs away a step.'],
      ['a', 'Don\'t be shy, Mr. Doggy. I\'m Princess Agitha! Would you like to see my bugs?'],
      ['n', 'She holds out a jar with a golden beetle in it. The wolf sniffs it suspiciously.'], ['b', 'Snff.'],
      ['a', 'He likes you! That means you\'re a good doggy.'],
    ],
    B: [
      ['a', 'Mr. Doggy, can you smell bugs? Ever so many golden bugs are hiding around camp!'], ['n', 'The wolf sighs heavily.'],
      ['a', 'Please? Pretty please? I\'ll give you a treat.'], ['b', 'Hff.'],
      ['n', 'He sniffs along the fence and digs. A golden mantis scuttles out.'], ['a', 'Oh! Oh, you\'re ever so clever!'],
    ],
    A: [
      ['a', 'Mr. Doggy, I made you a royal collar! You\'re a knight of the Insect Kingdom now!'], ['n', 'It is pink and covered in ribbon beetles.'],
      ['b', 'Grrr…'], ['a', 'Don\'t growl! It\'s ever so dignified!'],
      ['n', 'The wolf allows her to tie it on. He looks miserable, but he doesn\'t take it off.'], ['a', 'There! Now we\'re best friends forever.'],
      ['b', 'Wrrf.'],
    ],
  },
  'heroOfTwilight|jovani#wolfLink': {
    C: [
      ['b', 'You can see them, can\'t you? The Poes. I know you can. Your eyes follow them.'], ['n', 'The wolf growls at a flickering lantern in the dark.'],
      ['b', 'Every soul you take frees a bit of me. I can move my fingers now. Look!'], ['a', 'Hrrn.'],
      ['b', 'Gengle says thank you too. Don\'t you, Gengle?'], ['n', 'The golden cat says nothing. It is a statue.'],
    ],
    B: [
      ['b', 'The spirits in the camp graveyard whisper all night. I can\'t understand them.'], ['n', 'The wolf sits, listening intently.'],
      ['b', 'You can, though. What are they saying?'], ['n', 'The wolf turns toward one grave and whines softly.'],
      ['b', 'A soldier. Waiting for someone. I see.'], ['b', 'I was greedy for gold, and I got it. They\'re just waiting for home.'],
    ],
    A: [
      ['n', 'The wolf leads Jovani to a quiet grave. A faint light hovers above it.'], ['b', 'You want me to speak to it?'],
      ['a', 'Wrrf.'], ['b', 'I… I\'m sorry. For what I did. I bargained with the dead for treasure.'],
      ['n', 'The light dims and drifts away, gentle and calm.'], ['b', 'It forgave me. I think. You helped it hear me.'],
      ['b', 'Thank you, wolf. I\'ve never felt so light.'],
    ],
  },
  'colin|ilia': {
    C: [
      ['b', 'Colin! You\'ve torn your sleeve again. Come here.'], ['a', 'It\'s fine, Ilia, really.'],
      ['b', 'It\'s not fine. You\'ll catch cold. Hold still.'], ['n', 'Ilia pulls out a needle and thread.'],
      ['a', 'You always carry those?'], ['b', 'Since the day Talo dragged you into the forest. Somebody has to.'],
    ],
    B: [
      ['a', 'Ilia, you don\'t have to follow me to the front lines. I\'m with the archers now.'], ['b', 'I know. I just… worry.'],
      ['a', 'You worry about everyone.'], ['b', 'I worry about you most. You\'re the one who jumps in front of things.'],
      ['a', 'That was one time! And it was Beth!'], ['n', 'Ilia laughs despite herself.'],
      ['b', 'One time was enough for my heart, Colin.'],
    ],
    A: [
      ['b', 'When the Bulblins took you, I thought I\'d never see you again.'], ['a', 'You came looking. You and Link.'],
      ['b', 'I didn\'t do much. I lost my memory, then found Ralis…'], ['a', 'You still came. That\'s what counts.'],
      ['n', 'Ilia hugs him suddenly.'], ['b', 'I\'m so proud of you. You\'re so much braver than you were.'],
      ['a', 'I learned from you, too, you know.'],
    ],
    S: [
      ['a', 'Ilia, you\'re like my big sister. I never said that before.'], ['b', 'Oh, Colin…'],
      ['a', 'You always look after me. So I want to look after you too now. Is that okay?'],
      ['b', 'Of course it is. But you don\'t have to grow up all at once.'], ['a', 'I know. Just a little.'],
      ['n', 'Ilia ruffles his hair.'], ['b', 'Then we\'ll look after each other. Like a real family.'],
    ],
  },
  'ilia|mayorBo': {
    C: [
      ['b', 'Ilia! My little girl! Are you eating enough? You look thin!'], ['a', 'Dad, I\'m fine.'],
      ['b', 'This army stew is all bones and gristle. I\'ll talk to the cook.'], ['a', 'Please don\'t.'],
      ['n', 'Bo is already marching toward the kitchen tent.'], ['a', 'Dad!'],
    ],
    B: [
      ['b', 'I never should have let you come. War is no place for you.'], ['a', 'Dad, I chose to come.'],
      ['b', 'I know! And I\'m proud! But I\'m also terrified. A father can be both.'], ['n', 'He wrings his huge hands.'],
      ['a', 'I came to help. To tend the horses and the wounded. I\'m good at it.'], ['b', 'You are. Your mother was the same.'],
    ],
    A: [
      ['b', 'When you lost your memory, you didn\'t recognize me. You called me "sir."'], ['a', 'Dad…'],
      ['b', 'I thought I\'d lost you. My only daughter.'], ['n', 'Ilia takes his hand.'],
      ['a', 'You didn\'t. I came back. I remembered you first, before anything else.'], ['b', 'Truly?'],
      ['a', 'Truly. Your awful snoring, mostly.'], ['b', 'Ha! That\'s my girl.'],
    ],
    S: [
      ['b', 'Ilia. When all this is done, what will you do?'], ['a', 'Go home. Take care of the spring. Maybe…'],
      ['b', 'Maybe the boy?'], ['n', 'Ilia turns bright red.'], ['a', 'Dad!'],
      ['b', 'Ha ha! I\'m not blind. I only want you happy, whatever you choose.'], ['a', 'Even if I choose to stay in Ordon forever?'],
      ['b', 'Especially then. Ordon is lucky to have you. So am I.'],
    ],
  },
  'ilia|renado': {
    C: [
      ['a', 'Renado. I wanted to thank you again for looking after me in Kakariko.'], ['b', 'You owe me nothing, child.'],
      ['a', 'I was so frightened. I didn\'t even know my own name.'], ['b', 'Yet you cared for Prince Ralis without knowing yours.'],
      ['n', 'Ilia smiles softly.'], ['a', 'I suppose I did.'],
    ],
    B: [
      ['a', 'Sometimes I still feel those empty days. Like there\'s a hole I keep stepping into.'], ['b', 'Memory returns in pieces. So does peace.'],
      ['a', 'Did I say anything strange back then?'], ['b', 'You asked Luda every morning if she had seen a horse.'],
      ['a', 'Epona.'], ['n', 'Renado nods.'], ['b', 'Your heart remembered what your mind could not.'],
    ],
    A: [
      ['a', 'I\'ve stopped being afraid of those days. I learned something from them.'], ['b', 'Oh?'],
      ['a', 'That I\'m still me, even without memories. I still want to help people.'], ['b', 'That is a rare thing to know about oneself.'],
      ['n', 'Renado places a hand gently on her head, as he does with Luda.'], ['b', 'You are welcome in Kakariko always, Ilia.'],
      ['a', 'Thank you. For everything.'],
    ],
  },
  'ilia|ralis': {
    C: [
      ['b', 'Ilia. You are the one who… found me. In the castle town.'], ['a', 'Prince Ralis! You look so much better.'],
      ['b', 'Thanks to you. I barely remember it. Only your voice.'], ['n', 'Ralis bows his head gracefully.'],
      ['a', 'You were so weak. I couldn\'t just leave you.'], ['b', 'Many would have.'],
    ],
    B: [
      ['b', 'I\'ve been learning to lead the Zoras. It is harder than I imagined.'], ['a', 'You\'re doing well, from what I hear.'],
      ['b', 'Am I? Every choice feels too heavy.'], ['a', 'Then share it. With your people. With friends.'],
      ['b', 'Friends? Are we friends, Ilia?'], ['a', 'Of course we are, silly.'], ['n', 'Ralis looks unexpectedly pleased.'],
    ],
    A: [
      ['b', 'I wrote a song for you. Zoras sing to those who saved them. It is tradition.'], ['a', 'For me?'],
      ['n', 'Ralis plays a few gentle notes on his harp. Ilia listens, smiling.'], ['a', 'It\'s beautiful.'],
      ['b', 'It is only fair. You sang to me, when I was too sick to sleep.'], ['a', 'You remember that?'],
      ['b', 'I remember everything you did. I always will.'],
    ],
    S: [
      ['b', 'Ilia. When the war ends, I will return to Zora\'s Domain.'], ['a', 'And I\'ll go home to Ordon.'],
      ['b', 'Will you visit? The Domain is beautiful in spring.'], ['a', 'Only if you visit Ordon too. I\'ll show you the spring.'],
      ['n', 'Ralis smiles.'], ['b', 'A spring, for a prince who lives in water? It seems right.'],
      ['a', 'Then it\'s a promise. Friends for life.'], ['b', 'Friends for life.'],
    ],
  },
  'colin|rusl': {
    C: [
      ['a', 'Dad! I hit the target three times today! Three!'], ['b', 'Did you, now? Show me.'],
      ['n', 'Colin draws his bow and looses an arrow. It hits the edge of the target.'], ['a', 'Well… it was better earlier.'],
      ['b', 'Ha! It always is. Again, lad.'],
    ],
    B: [
      ['a', 'Dad, are you scared? When you fight?'], ['b', 'Every time.'],
      ['a', 'Really? But you\'re so strong.'], ['b', 'Strong and scared aren\'t opposites, Colin. I\'m scared because I have you and your mother.'],
      ['n', 'Colin thinks about this for a while.'], ['a', 'I\'m scared too. For you.'],
      ['b', 'Then we\'ll be scared together. And brave together.'],
    ],
    A: [
      ['b', 'When I was lying hurt in Ordon, and you were taken… I couldn\'t do anything.'], ['a', 'Dad, you were injured.'],
      ['b', 'That\'s no excuse for a father.'], ['n', 'Colin takes his father\'s scarred hand.'],
      ['a', 'You trained Link. And Link saved me. So you did save me, Dad.'], ['b', '…When did you get so wise?'],
      ['a', 'I learned from you.'],
    ],
    S: [
      ['b', 'Colin. I have something for you.'], ['n', 'Rusl holds out a small, carefully carved wooden sword.'],
      ['b', 'Made it myself, by the campfire. It\'s the right size for you now.'], ['a', 'Dad… it\'s perfect.'],
      ['b', 'One day you\'ll carry a real blade. But don\'t rush. Be a boy a little longer.'], ['a', 'I will. I promise.'],
      ['b', 'That\'s my son.'], ['n', 'Colin hugs his father fiercely.'],
    ],
  },
  'colin|malo': {
    C: [
      ['b', 'Colin. You\'re wasting time on that wooden sword.'], ['a', 'It\'s practice!'],
      ['b', 'Practice for what? Real adults make money.'], ['a', 'Real adults protect people.'],
      ['n', 'Malo pushes up his little cap.'], ['b', 'Protecting people doesn\'t pay rent.'],
    ],
    B: [
      ['a', 'Malo, why do you want to be grown up so fast?'], ['b', 'Being a kid is inefficient.'],
      ['a', 'That\'s not true! Being a kid is fun!'], ['b', 'Fun doesn\'t make a business profitable.'],
      ['a', 'But you\'re only eight!'], ['b', 'And I already own a shop. What do you own?'],
      ['n', 'Colin opens his mouth, then closes it.'],
    ],
    A: [
      ['a', 'Malo, I saw you give free potions to the wounded soldiers.'], ['n', 'Malo freezes.'],
      ['b', 'That was a marketing strategy.'], ['a', 'It was nice. You\'re nice.'],
      ['b', '…Don\'t spread that around.'], ['a', 'Maybe being grown up just means helping people your own way.'],
      ['b', 'Hmph. Maybe. Your way\'s louder, though.'],
    ],
  },
  'colin|kingBulblin': {
    C: [
      ['n', 'Colin freezes when King Bulblin rides into camp. He hides behind a supply wagon.'], ['b', 'Hrrn.'],
      ['n', 'The king glances at the wagon. He knows exactly who\'s behind it.'], ['a', 'G-go away!'],
      ['n', 'King Bulblin turns his boar and leaves without a word.'],
    ],
    B: [
      ['a', 'You took me. You tied me to your boar. You scared me so much.'], ['n', 'King Bulblin sits sharpening his axe. He doesn\'t look up.'],
      ['a', 'Are you going to do it again?'], ['b', 'Hrrh.'],
      ['n', 'The king shakes his head once, slowly.'], ['a', 'You… you promise?'], ['b', 'Grrh.'],
    ],
    A: [
      ['n', 'Colin approaches the king\'s boar with an apple in his hand. The king watches silently.'], ['a', 'Can I…?'],
      ['b', 'Hrm.'], ['n', 'The boar eats the apple from Colin\'s palm. It snuffles his hair.'],
      ['a', 'I\'m not scared anymore. Not of you.'], ['n', 'King Bulblin grunts, and for a moment almost looks impressed.'],
      ['b', 'Hrrr. Brave.'],
    ],
  },
  'colin|herosShade': {
    C: [
      ['b', 'You watch the swordsmen every day, boy. Why?'], ['a', 'I want to be strong like them.'],
      ['b', 'Strength is not what makes a hero.'], ['a', 'It isn\'t?'],
      ['n', 'The Shade looks down at him with his single burning eye.'], ['b', 'No. I will show you, in time.'],
    ],
    B: [
      ['b', 'When I was a child, I was smaller than the others. The other children mocked me.'], ['a', 'You? But you\'re a hero.'],
      ['b', 'I was a boy without a fairy. They thought me weak.'], ['a', 'What did you do?'],
      ['b', 'I walked into the forest anyway. That is all courage is. Walking forward when you would rather hide.'],
      ['n', 'Colin is very quiet.'], ['a', 'I pushed Beth out of the way of a boar once.'], ['b', 'Then you already know.'],
    ],
    A: [
      ['a', 'I still can\'t lift a real sword. Does that mean I can\'t be brave?'], ['b', 'Courage lives in the heart, not the arm.'],
      ['b', 'The bravest thing I ever did was not a fight. It was choosing to go on when I had lost everything.'],
      ['n', 'The Shade places a ghostly hand on Colin\'s head.'], ['b', 'You have that in you. I see it.'],
      ['a', 'Thank you, sir. I won\'t forget.'],
    ],
  },
  'barnes|malo': {
    C: [
      ['b', 'Barnes. Your bomb prices are outrageous.'], ['a', 'Excuse me? Kid, those are quality explosives!'],
      ['b', 'Fifty rupees for ten bombs is robbery. I\'ll give you thirty.'], ['a', 'Thirty?! You trying to ruin me?'],
      ['n', 'Malo stares at him impassively.'], ['a', '…Forty.'], ['b', 'Thirty-five. Final offer.'],
    ],
    B: [
      ['b', 'I\'d like to stock your water bombs in Malo Mart.'], ['a', 'Oh, you would, would you?'],
      ['b', 'Exclusively. Ten percent commission.'], ['a', 'Twenty!'],
      ['b', 'Twelve. And I\'ll put your name on the sign.'], ['n', 'Barnes hesitates, visibly tempted.'],
      ['a', 'In big letters?'], ['b', 'Medium letters.'],
    ],
    A: [
      ['a', 'You know, kid, sales have doubled since we teamed up.'], ['b', 'I\'m aware. I keep the books.'],
      ['a', 'Course you do.'], ['n', 'Barnes laughs and claps Malo on the back. Malo nearly falls over.'],
      ['a', 'You\'re all right, kid. Tough negotiator. Remind me never to play cards with you.'],
      ['b', 'Bomb Kings and Malo Mart. Partners. Don\'t make it emotional.'],
    ],
  },
  'malo|mayorBo': {
    C: [
      ['b', 'Malo! I hear your shop is doing well! Ha ha!'], ['a', 'It\'s adequate, Mayor.'],
      ['b', 'Adequate? You\'ve got stalls in three villages!'], ['a', 'Four. Ordon is next.'],
      ['n', 'Bo blinks.'], ['b', 'In Ordon? We have goats and pumpkins.'], ['a', 'Untapped market.'],
    ],
    B: [
      ['a', 'Mayor, Ordon\'s pumpkins sell for triple in Castle Town. Why don\'t we export more?'], ['b', 'Export? We just eat them.'],
      ['a', 'That\'s the problem. Ordon could be rich.'], ['b', 'Rich? Ordon\'s always been simple, little Malo.'],
      ['a', 'Simple can still be profitable.'], ['n', 'Bo scratches his head, troubled but intrigued.'],
    ],
    A: [
      ['b', 'I\'ve been thinking about what you said. About Ordon\'s future.'], ['a', 'And?'],
      ['b', 'We can sell some pumpkins. Some cheese. But Ordon must stay Ordon.'], ['a', 'Agreed.'],
      ['n', 'Bo blinks again, surprised.'], ['b', 'You agree?'],
      ['a', 'If Ordon changes too much, nobody will want its pumpkins. Tradition is our brand.'], ['b', 'Ha ha! Brilliant boy!'],
    ],
  },
  'malo|telma': {
    C: [
      ['b', 'Well, look at this. A little businessman. You\'re the one undercutting my milk prices, sugar?'], ['a', 'I\'m competitive.'],
      ['b', 'Mm. I like that.'], ['a', 'Your bar serves drinks. I serve supplies. We don\'t really compete.'],
      ['b', 'Oh, honey, everyone in business competes.'], ['n', 'Malo narrows his eyes thoughtfully.'],
    ],
    B: [
      ['a', 'Your customers stay for hours. Mine leave quickly.'], ['b', 'That\'s because folks come to my bar to talk, honey. Not shop.'],
      ['a', 'Talking doesn\'t make money.'], ['b', 'Oh, it does. Talking makes friends. Friends spend money.'],
      ['n', 'Malo writes this down.'], ['a', 'Interesting.'],
    ],
    A: [
      ['a', 'I added benches outside Malo Mart. Customers stay longer. Sales are up.'], ['b', 'Ha! See? I told you.'],
      ['a', 'You were right. I hate that.'], ['b', 'Honey, being right is the best part of business.'],
      ['n', 'She pours him a glass of milk.'], ['b', 'On the house. Competitor\'s courtesy.'], ['a', 'Thank you. Partner.'],
    ],
  },
  'mayorBo|rusl': {
    C: [
      ['a', 'Rusl! I\'m worried about the village. Uli and the children are alone.'], ['b', 'Ordon is safe now, Bo. Mostly.'],
      ['a', 'Mostly isn\'t good enough for a mayor!'], ['b', 'Or a father. I know.'],
      ['n', 'Bo paces anxiously.'], ['a', 'We should send someone home.'],
    ],
    B: [
      ['b', 'Bo, I sent word to the Ordon farmers. They\'ve set up watches at the bridge.'], ['a', 'Good, good.'],
      ['b', 'Uli\'s organizing the women. They\'re fierce, Bo. Fiercer than us.'], ['a', 'Ha! Uli\'s fiercer than both of us put together.'],
      ['n', 'Rusl laughs.'], ['b', 'That she is.'],
    ],
    A: [
      ['a', 'Rusl, when we go home, I want to train the young ones. Sumo, sword, everything.'], ['b', 'So do I.'],
      ['a', 'Ordon was too soft before. We nearly lost everything.'], ['b', 'We won\'t be caught unprepared again.'],
      ['n', 'They clasp hands.'], ['a', 'For Ordon.'], ['b', 'For Ordon.'],
    ],
  },
  'renado|rusl': {
    C: [
      ['a', 'You are Rusl, of Ordon. Your children stayed in Kakariko.'], ['b', 'You looked after them. Thank you.'],
      ['a', 'They were brave. Your son especially.'], ['b', 'Colin? He\'s always been timid.'],
      ['a', 'Not in Kakariko.'], ['n', 'Rusl blinks, surprised and proud.'],
    ],
    B: [
      ['b', 'Kakariko was nearly lost too. I heard about the Twilight.'], ['a', 'We held on. Barely.'],
      ['b', 'Ordon held on because of Link. Kakariko held on because of you.'], ['a', 'And the spirits.'],
      ['n', 'They share a quiet nod.'], ['b', 'Some of us fight with swords. Some with prayer.'],
    ],
    A: [
      ['a', 'If Kakariko ever needs Ordon\'s help…'], ['b', 'We\'ll come. Without asking why.'],
      ['a', 'And Kakariko will do the same.'], ['b', 'Good. Villages should look out for each other.'],
      ['n', 'They shake hands firmly.'], ['a', 'Then we are allies.'], ['b', 'Friends, I\'d say.'],
    ],
  },
  'kingBulblin|rusl': {
    C: [
      ['n', 'Rusl stands at the edge of camp, sword drawn. King Bulblin watches from his boar.'], ['b', 'You burned my village. You took my son.'],
      ['a', 'Hrrn.'], ['b', 'I should run you through right here.'],
      ['n', 'The king doesn\'t move. He simply waits.'], ['b', '…But I won\'t. Not today.'],
    ],
    B: [
      ['b', 'Why do you fight with us now? Money? Power?'], ['a', 'Hrrh.'],
      ['n', 'The king points his axe at Link, training across the field.'], ['b', 'Link? You follow Link?'],
      ['a', 'Hrrr.'], ['n', 'King Bulblin thumps his chest once.'], ['b', 'Strongest. I understand.'],
    ],
    A: [
      ['b', 'I\'ve been angry with you a long time. I\'m tired of it.'], ['a', 'Hrm.'],
      ['b', 'Colin isn\'t afraid of you anymore. He fed your boar an apple.'], ['n', 'The king grunts, almost in amusement.'],
      ['b', 'If my son can forgive you, I can at least try.'], ['n', 'Rusl offers his hand. After a long pause, the king clasps it roughly.'],
      ['a', 'Hrrr.'],
    ],
  },
  'barnes|renado': {
    C: [
      ['a', 'Renado! When we go back, I\'m rebuilding the bomb shop first thing!'], ['b', 'Perhaps the houses first, Barnes.'],
      ['a', 'Houses can wait! People need bombs!'], ['b', 'People need roofs.'],
      ['n', 'Barnes grumbles into his mustache.'], ['a', 'Fine. Roofs, then bombs.'],
    ],
    B: [
      ['b', 'You have a great deal of energy for rebuilding, Barnes.'], ['a', 'Kakariko\'s my home! I can\'t let it rot.'],
      ['b', 'The Twilight took much from us. But not our spirit.'], ['a', 'Spirit and bombs, Renado. That\'s Kakariko.'],
      ['n', 'Renado smiles faintly.'], ['b', 'Mostly spirit, I hope.'],
    ],
    A: [
      ['a', 'I\'ve drawn plans for the new village. Wider streets, better wells. And a bigger bomb shop.'], ['b', 'Hm. These are good plans.'],
      ['a', 'You think so?'], ['b', 'I do. Kakariko will be stronger than before.'],
      ['n', 'Barnes beams proudly.'], ['a', 'Then let\'s build it together.'], ['b', 'Together.'],
    ],
  },
  'ralis|renado': {
    C: [
      ['b', 'Prince Ralis. You are quiet tonight.'], ['a', 'I was thinking of my mother.'],
      ['b', 'Queen Rutela. A gracious soul.'], ['a', 'I never said goodbye.'],
      ['n', 'Renado sits beside him in silence.'], ['b', 'Grief needs time, young prince.'],
    ],
    B: [
      ['a', 'I saw her spirit, you know. In the graveyard. Link told me she watched over me.'], ['b', 'She loved you deeply.'],
      ['a', 'Then why did she have to die?'], ['b', 'There is no answer that would comfort you, I fear.'],
      ['n', 'Ralis clenches his fists.'], ['a', 'That isn\'t fair.'], ['b', 'No. It is not.'],
    ],
    A: [
      ['a', 'I visited her grave today. I told her I will be a good king.'], ['b', 'Did it help?'],
      ['a', 'A little. I felt she heard me.'], ['b', 'She did. The spirits hear us when we speak with love.'],
      ['n', 'Ralis smiles faintly.'], ['a', 'Thank you, Renado. For listening.'], ['b', 'Always, young prince.'],
    ],
  },
  'barnes|gorCoron': {
    C: [
      ['b', 'Brother Barnes! The Gorons need more bombs for the mines, goro!'], ['a', 'More? I just sent you a whole cart!'],
      ['b', 'Gorons eat a lot of rock, brother. Bombs open the rock!'], ['a', 'Eat?! You eat the rocks?!'],
      ['n', 'Gor Coron laughs, the ground rumbling.'], ['b', 'Ha ha! Of course, goro!'],
    ],
    B: [
      ['a', 'Gor Coron, I\'ve been working on a new bomb. Bigger blast. Perfect for mining.'], ['b', 'Ooh! Show me, brother!'],
      ['n', 'Barnes lights the fuse. It fizzles. Then, after a long pause, it explodes a little.'], ['a', 'Well… it\'s a prototype.'],
      ['b', 'Goro… a small prototype.'],
    ],
    A: [
      ['b', 'Brother Barnes, your bombs saved many Gorons in the mines. We owe you.'], ['a', 'Ah, it\'s just business.'],
      ['b', 'No, brother. It is friendship, goro.'], ['n', 'Gor Coron gives Barnes a crushing Goron hug.'],
      ['a', 'Gah! My ribs! Okay, okay, friendship!'], ['b', 'Ha ha ha! Brother!'],
    ],
  },
};
