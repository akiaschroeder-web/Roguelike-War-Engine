// Support conversations: Cross-game (Heroes of Hyrule, Princesses, Fairies and Companions, Goron Brotherhood, Zora and Rito). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  // ── The Heroes of Hyrule ──
  'link|terminaLink': {
    C: [
      ['n', 'The two Heroes of Time sit on opposite ends of a log, sharpening the same sword with the same stone motion.'],
      ['b', 'You hold it like I do.'], ['a', 'I learned from you. Sort of.'], ['b', 'You\'re me, then. Grown up.'],
      ['a', 'Grown up the long way. Seven years asleep in a temple.'], ['b', 'I went back before that could happen. Then I got lost.'],
      ['a', 'Lost where?'], ['b', 'A place called Termina. The moon was falling.'], ['a', '…I never went there.'],
    ],
    B: [
      ['a', 'You carry a lot of masks.'], ['b', 'Every one is somebody I couldn\'t save. Or almost couldn\'t.'],
      ['n', 'The younger Link turns the Goron Mask over in his hands.'], ['a', 'I had the Sages. Everyone I lost, I found again as a Sage.'],
      ['b', 'I had three days. Over and over. Nobody remembered any of it but me.'], ['a', 'That sounds lonelier than the temple.'],
      ['b', 'Sometimes.'], ['a', 'You kept going anyway.'], ['b', 'You would have too.'],
    ],
    A: [
      ['b', 'Do you ever wish you were me instead?'], ['a', 'Younger?'], ['b', 'Not grown up so fast. Still with Navi.'],
      ['n', 'The older Link is quiet for a long moment.'], ['a', 'Sometimes. Do you wish you were me?'],
      ['b', 'Sometimes. You got to finish. Everybody knew what you did.'], ['a', 'Nobody remembers that either. Zelda sent me back.'],
      ['b', 'So we both saved a world that forgot.'], ['a', 'Then we\'ll remember for each other.'],
    ],
  },
  'heroOfTwilight|link': {
    C: [
      ['b', 'You fight with your left hand.'], ['a', 'So do you.'], ['b', 'And you carry the Master Sword.'],
      ['a', 'I pulled it from a ruined temple in the woods. It was waiting for me.'], ['b', 'The Temple of Time. Ruined?'],
      ['a', 'For a long time now. Centuries, they say.'], ['n', 'The Hero of Time glances at the blade, then back at his successor.'],
      ['b', 'Then it waited a long time for you.'],
    ],
    B: [
      ['a', 'There was a wolf of gold who trained me. A warrior made of bone.'], ['b', 'A ghost?'],
      ['a', 'He said he regretted never passing on his skills. He knew every move I\'d use before I did.'],
      ['b', 'What did he look like?'], ['a', 'Old armor. One eye. He moved like you do.'],
      ['n', 'The Hero of Time stops mid-swing.'], ['b', 'Like me.'], ['a', 'I\'ve thought about it a lot since I met you.'],
    ],
    A: [
      ['b', 'If he was what I become… then I don\'t get to rest.'], ['a', 'He rests now. He told me so, the last time.'],
      ['b', 'Because of you?'], ['a', 'Because there was someone to carry it on.'], ['b', 'Carry what?'],
      ['a', 'Courage. And the duty. To Hyrule, to Zelda, to whoever needs it.'], ['n', 'The older hero breathes out slowly.'],
      ['b', 'Then I\'ll teach you anything you want while I\'m alive to do it.'],
    ],
    S: [
      ['a', 'I\'m not really a knight. I herd goats in Ordon.'], ['b', 'I was a Kokiri boy without a fairy.'],
      ['a', 'Then where do heroes come from?'], ['b', 'Ordinary places. People who stand up when they\'re needed.'],
      ['n', 'The Hero of Time draws a line in the dirt between them, then steps over it.'],
      ['b', 'I don\'t know how much of your blood is mine. It doesn\'t matter.'], ['a', 'What does?'],
      ['b', 'That you\'re family. I choose it.'], ['a', 'Then so do I. Ancestor.'],
    ],
  },
  'heroOfWinds|terminaLink': {
    C: [
      ['a', 'Hey. The soldiers keep sending me to the supply tent.'], ['b', 'Me too. One of them patted my head.'],
      ['a', 'I sailed across the whole Great Sea!'], ['b', 'I stopped a moon from falling.'], ['a', 'A moon?'],
      ['b', 'It had a face.'], ['a', '…Okay, you win that one.'], ['n', 'The two boys glare together at the quartermaster\'s back.'],
    ],
    B: [
      ['b', 'Being small helps sometimes. Nobody expects you.'], ['a', 'The Moblins on Forsaken Fortress didn\'t. They threw me in a cell anyway.'],
      ['b', 'How\'d you get out?'], ['a', 'Crawled through a pipe. Hid in a barrel.'], ['b', 'I turned into a Deku Scrub and hopped through a window.'],
      ['a', 'You can turn into a Deku Scrub?'], ['b', 'Want to see?'], ['n', 'A minute later, a small Deku Scrub bounces past an extremely confused sentry.'],
    ],
    A: [
      ['a', 'Do you ever wish you were older? So people would just listen?'], ['b', 'I was older, once. For a while.'],
      ['a', 'What was it like?'], ['b', 'People listened. They also expected me to fix everything.'],
      ['a', 'Like that\'s different now.'], ['b', 'It\'s different when you\'re a kid. When you win, they\'re surprised.'],
      ['a', 'Ha. I like surprising them.'], ['b', 'Then let\'s keep doing it. Together.'],
    ],
  },
  'heroOfTwilight|terminaLink': {
    C: [
      ['a', 'Those masks. Where did you get them?'], ['b', 'From people. And from a Happy Mask Salesman who wanted his back.'],
      ['a', 'You\'re the boy from the old stories, aren\'t you? The Hero of Time.'], ['b', 'Stories?'],
      ['a', 'Hyrule tells them. A boy who saved the kingdom and then vanished.'], ['n', 'The young Link looks down at his boots.'],
      ['b', 'I went looking for a friend. I haven\'t found her yet.'],
    ],
    B: [
      ['a', 'After you warned the King, Ganondorf was executed. Or they tried.'], ['b', 'Tried?'],
      ['a', 'He was sealed in the Twilight. That\'s where Zant found him, centuries later.'],
      ['b', 'So my warning saved everyone then… and made you fight him now.'], ['a', 'It gave Hyrule centuries of peace. That counts.'],
      ['b', 'Does it?'], ['a', 'It counts to me. I grew up in a village that never knew war.'],
    ],
    A: [
      ['b', 'Is there anyone who remembers me? In your time?'], ['a', 'The Master Sword. And a ghost who taught me to fight.'],
      ['b', 'A ghost?'], ['n', 'The Hero of Twilight chooses his words carefully.'],
      ['a', 'He was lonely. He wanted someone to know what he\'d learned.'], ['b', 'Then I\'ll tell people. Before I\'m a ghost.'],
      ['a', 'Good. Tell me first.'],
    ],
    S: [
      ['b', 'I made you something.'], ['n', 'He holds out a small carved wooden wolf.'], ['a', 'A wolf?'],
      ['b', 'The soldiers said you turn into one. I wanted you to have something from me. Not just from a legend.'],
      ['a', 'Thank you.'], ['b', 'If I end up like that ghost… you won\'t let me be forgotten, right?'],
      ['a', 'Never. You\'re not a story to me anymore.'], ['b', 'What am I?'], ['a', 'My little brother. Whatever the history says.'],
    ],
  },
  'heroOfTwilight|heroOfWinds': {
    C: [
      ['b', 'You ride a horse?'], ['a', 'Epona. You?'], ['b', 'A talking boat.'], ['a', 'That\'s… better than a horse, honestly.'],
      ['b', 'He\'s grumpy sometimes. He\'s a king.'], ['a', 'My guide is a princess. Also grumpy.'],
      ['n', 'Somewhere nearby, Midna\'s shadow flickers in protest.'], ['b', 'I think she heard you.'],
    ],
    B: [
      ['a', 'How many temples did you go through?'], ['b', 'Lost count after the Tower of the Gods. You?'],
      ['a', 'Eight or nine. A sky city. A frozen mansion where a yeti made soup.'], ['b', 'I had to carry a Rito girl through one. And a Korok.'],
      ['a', 'Carry?'], ['b', 'She played the harp. He played the violin. Their songs woke the sword.'],
      ['a', 'I just had to get mine back from a forest. And clean it.'], ['b', 'Mine had to be woken up twice.'],
    ],
    A: [
      ['a', 'You\'re young to carry all this.'], ['b', 'I didn\'t really choose it. Pirates took my sister.'],
      ['a', 'Monsters took my village\'s children. I didn\'t choose either.'], ['b', 'Does it get easier?'],
      ['a', 'No. But you get better at standing up under it.'], ['n', 'The Hero of Winds nods slowly.'],
      ['b', 'When it\'s all over, I want to go home and sleep on the lookout platform for a week.'], ['a', 'Ordon has a good hammock.'],
    ],
    S: [
      ['b', 'You and me. Are we related?'], ['a', 'I don\'t know. Our Hyrules aren\'t even the same Hyrule.'],
      ['b', 'Mine\'s under the ocean. Yours has fields.'], ['a', 'Maybe the hero isn\'t a family. Maybe it\'s a promise that keeps getting made.'],
      ['b', 'Then I\'m keeping it with you.'], ['n', 'They clasp forearms, a little awkwardly, the way soldiers do.'],
      ['a', 'If you ever need a sword in your sky, call me.'], ['b', 'If you ever need a boat, I know a guy.'],
    ],
  },
  'heroOfWinds|youngLink': {
    C: [
      ['a', 'You\'ve got a fairy!'], ['b', 'This is Navi. She talks a lot.'], ['a', 'My grandma said fairies were lucky.'],
      ['b', 'Why are you wearing my clothes?'], ['a', 'They\'re not yours! On Outset Island, boys wear them on their birthday.'],
      ['a', 'For the Hero of Time. He\'s a legend.'], ['b', '…I\'m the Hero of Time.'], ['a', 'You\'re short.'], ['b', 'So are you!'],
    ],
    B: [
      ['n', 'Young Link watches the Hero of Winds skip stones along the river, six, seven, eight bounces.'],
      ['b', 'How do you do that?'], ['a', 'Flat rock. Flick your wrist. I grew up next to the sea.'],
      ['b', 'I grew up in a forest. We had puddles.'], ['a', 'Here. Try it.'],
      ['n', 'Young Link\'s stone sinks immediately. He tries again. Three bounces.'], ['a', 'See?'], ['b', 'Again!'],
    ],
    A: [
      ['b', 'Do you miss home?'], ['a', 'Every night. My sister, Aryll. She loves seagulls.'], ['b', 'I don\'t really have a home anymore.'],
      ['a', 'What about your forest?'], ['b', 'Kokiri don\'t grow up. I do. I\'m not one of them.'],
      ['n', 'The Hero of Winds thinks hard about this.'], ['a', 'Then when the war\'s done, come live on Outset. Grandma makes soup.'],
      ['b', 'Really?'], ['a', 'Really.'],
    ],
    S: [
      ['a', 'I made a pact. With you. Right now.'], ['b', 'What kind of pact?'], ['a', 'Best friends. Forever. Even across time.'],
      ['b', 'How do you make one across time?'], ['a', 'Spit and shake.'], ['n', 'They spit and shake. Navi groans loudly.'],
      ['b', 'Now what?'], ['a', 'Now if you ever get lost, I come find you. That\'s the rule.'], ['b', 'And I find you. Deal.'],
    ],
  },
  'heroOfTwilight|youngLink': {
    C: [
      ['n', 'Young Link tries to lift the older hero\'s shield and topples over beneath it.'], ['a', 'Easy. That\'s heavier than it looks.'],
      ['b', 'You\'re really strong.'], ['a', 'I wrestle goats. Lots of goats.'], ['b', 'Goats?'],
      ['a', 'They\'re harder than Moblins sometimes. Want to learn how to hold a shield properly?'], ['b', 'Yes!'],
    ],
    B: [
      ['a', 'Keep your elbow in. Let the shield take it, not your arm.'], ['b', 'Like this?'], ['a', 'Good. Now shove.'],
      ['n', 'Young Link slams the shield forward, and the Hero of Twilight stumbles back with exaggerated surprise.'],
      ['b', 'Did I do it?'], ['a', 'That\'s a shield attack. Somebody taught it to me once.'], ['b', 'Who?'],
      ['a', 'Someone a lot like you. I\'ll tell you when you\'re older.'],
    ],
    A: [
      ['b', 'Why are you so nice to me?'], ['a', 'Because nobody stays a kid forever. I want you to have a little more time.'],
      ['b', 'Time?'], ['a', 'You\'re going to have a hard road. I want to make it a bit softer.'],
      ['b', 'Did someone do that for you?'], ['a', 'Ilia. Rusl. Everyone in Ordon.'], ['n', 'Young Link nods seriously.'],
      ['b', 'Then I\'ll do it for somebody too, someday.'], ['a', 'I know you will.'],
    ],
  },
  'herosShade|terminaLink': {
    C: [
      ['a', 'Child. You bear the masks of the land called Termina.'], ['b', 'How do you know about Termina?'],
      ['a', 'I have walked its fields. Long ago.'], ['n', 'The young Link stares at the ghostly warrior\'s single gleaming eye.'],
      ['b', 'Nobody here knows about Termina.'], ['a', 'Nobody does. That is the way of it.'], ['b', 'Who are you?'], ['a', 'One who searched, as you search.'],
    ],
    B: [
      ['b', 'I\'m looking for my fairy. Navi. Did you ever find yours?'], ['a', '…No.'],
      ['b', 'Did you keep looking?'], ['a', 'Until there was nothing left of me to look.'], ['n', 'The young Link swallows.'],
      ['b', 'That\'s sad.'], ['a', 'It was a long road, and I walked it unremembered. I regret that more than any wound.'],
      ['b', 'I don\'t want to be unremembered.'], ['a', 'Then do not walk alone.'],
    ],
    A: [
      ['b', 'You\'re me. Aren\'t you?'], ['n', 'The Shade does not answer at first.'],
      ['a', 'I was a boy who carried masks. Who stopped a moon. Who never found what he lost.'],
      ['b', 'So I fail?'], ['a', 'No. You save Termina. You save Hyrule. You only forget to save yourself.'],
      ['b', 'How do I do that?'], ['a', 'Let them know you. Let them call you hero to your face.'], ['b', 'I\'ll try.'],
    ],
    S: [
      ['a', 'Draw your sword. I would teach you while I still can.'], ['b', 'Teach me what you never got to pass on?'],
      ['a', 'All of it. The Ending Blow. The Back Slice. The rest.'], ['n', 'Steel rings across the camp until long after the fires burn low.'],
      ['b', 'I\'m tired.'], ['b', 'If I change things… you won\'t have to be you.'],
      ['a', 'Then I will have done what I came back for. Go gently, brave one.'], ['b', 'I\'ll remember you.'], ['a', 'That is all I ever wanted.'],
    ],
  },
  'herosShade|youngLink': {
    C: [
      ['a', 'You hold the sword too tightly, child.'], ['b', 'Who are you? You\'re made of bones!'],
      ['a', 'I am an old warrior who has not yet found rest.'], ['b', 'Are you a Stalfos?'],
      ['a', 'Something like one. I will not harm you.'], ['n', 'Navi hides behind Young Link\'s hat.'], ['a', 'Loosen your grip. Let the blade breathe.'],
    ],
    B: [
      ['b', 'I tried what you said. I didn\'t drop it once!'], ['a', 'Good. A sword held in fear is easily lost.'],
      ['b', 'I\'m not scared.'], ['a', 'Of course not.'], ['b', 'Okay, sometimes. Of Dodongos.'],
      ['a', 'Fear is not shameful. Courage is the step you take while it is still there.'], ['b', 'Did you have fear?'], ['a', 'Always.'],
    ],
    A: [
      ['b', 'Why do you help me?'], ['a', 'Because once, I needed someone to help me, and no one did.'],
      ['b', 'That\'s not fair.'], ['a', 'No. But you may make it fair, for someone else.'],
      ['n', 'Young Link looks up at the empty eye socket for a long time.'], ['b', 'You feel familiar.'],
      ['a', 'Perhaps we have crossed paths in a dream.'], ['b', 'I hope you find your rest.'], ['a', 'Speaking with you, I come closer.'],
    ],
  },
  'heroOfWinds|herosShade': {
    C: [
      ['a', 'Orca taught me to fight with a stick on a ladder. Can you teach me something better?'],
      ['b', 'You already know the Hurricane Spin. Few of my students did.'], ['a', 'Students?'],
      ['b', 'Only one, truly. In another age.'], ['a', 'Okay. Then I\'ll be number two.'], ['n', 'The Shade\'s eye flickers with something like amusement.'],
    ],
    B: [
      ['b', 'Strike the shield aside, then strike again. The Shield Attack.'], ['a', 'My shield has the old hero\'s crest on it.'],
      ['b', 'The Hylian Shield.'], ['a', 'Grandma kept it on her wall. She said a hero would come and take it someday.'],
      ['b', 'Then you were meant to bear it.'], ['n', 'The Hero of Winds slams his shield forward. The Shade nods once.'],
      ['b', 'Again. With your weight behind it.'],
    ],
    A: [
      ['a', 'You\'re the Hero of Time. Aren\'t you?'], ['b', 'I was something of him. Once.'],
      ['a', 'Everyone where I\'m from waited for you to come back. You never did.'], ['b', 'I could not. I was in another time.'],
      ['a', 'I\'m not mad. I just wanted you to know they remembered you. They still dress their kids like you.'],
      ['n', 'The Shade lowers his blade.'], ['b', 'That is a gift I did not expect. Thank you, young hero.'], ['a', 'Now teach me the Helm Splitter.'],
    ],
  },
  'darkLink|heroOfWinds': {
    C: [
      ['n', 'The Hero of Winds turns around. Dark Link stands there, matching his pose perfectly, a head taller.'],
      ['b', 'Uh. Hi?'], ['a', '…Hi.'], ['b', 'You\'re a shadow of that other Link, right?'], ['a', 'Right.'],
      ['b', 'Can you copy me too?'], ['n', 'Dark Link tilts his head, considering the boy\'s short frame and enormous eyes.'], ['a', 'We will see.'],
    ],
    B: [
      ['n', 'They spar. Dark Link mirrors every strike, but the boy keeps doing strange things: rolling, jumping, pulling faces.'],
      ['b', 'Ha! You can\'t copy a parry you don\'t see coming!'], ['a', 'You are… unpredictable.'],
      ['b', 'Orca says I fight like a seagull.'], ['a', 'Seagull.'], ['n', 'Dark Link tries a spin, flaps one arm, and stops, frowning.'],
      ['b', 'Not like that.'],
    ],
    A: [
      ['a', 'I cannot become you.'], ['b', 'Why not?'], ['a', 'A shadow needs a body. You are always changing.'],
      ['b', 'Maybe that\'s okay. Maybe you\'re not supposed to be anyone\'s copy.'], ['n', 'Dark Link looks at his own hands for a long moment.'],
      ['a', 'Then what am I?'], ['b', 'You\'re my sparring partner. You\'re pretty good.'], ['a', '…Pretty good.'],
    ],
  },
  'darkLink|heroOfTwilight': {
    C: [
      ['a', 'You turn into a beast.'], ['b', 'A wolf. In the Twilight.'], ['a', 'Then you have a darkness too.'],
      ['b', 'Everyone does.'], ['n', 'Dark Link steps closer, close enough that his breath fogs nothing at all.'],
      ['a', 'Show me yours.'], ['b', 'Not today.'],
    ],
    B: [
      ['a', 'When you were the wolf, you bit them. Bokoblins. Hard.'], ['b', 'I did what I had to.'],
      ['a', 'You liked it.'], ['n', 'The Hero of Twilight doesn\'t answer right away.'],
      ['b', 'Maybe I did. That\'s why I\'m careful.'], ['a', 'Courage that likes the fight. That is me.'],
      ['b', 'No. Courage that likes the fight, with nothing holding the leash. That\'s you.'],
    ],
    A: [
      ['a', 'What holds your leash?'], ['b', 'My village. Ilia. Midna. Colin, who ran into fire because he saw me do it.'],
      ['a', 'I have nothing to hold.'], ['b', 'You have this army. You\'ve fought beside it for weeks.'],
      ['n', 'Dark Link glances toward the campfires and the soldiers around them.'], ['a', 'They do not trust me.'],
      ['b', 'They didn\'t trust me either, when I had fur. Give it time.'], ['a', '…Time.'],
    ],
  },
  'darkLink|terminaLink#fierceDeityLink': {
    C: [
      ['n', 'Fierce Deity Link stands at the edge of camp, blank white eyes catching the moon. Dark Link watches him from the shadows.'],
      ['a', 'You are not him. Not the child.'], ['b', 'I am what the mask holds.'],
      ['a', 'And I am what the mirror holds.'], ['n', 'Neither moves for a long time.'],
    ],
    B: [
      ['n', 'At dawn they test each other. The Fierce Deity\'s double helix blade throws arcs of light; Dark Link answers each with a mirrored blow.'],
      ['a', 'You hold back.'], ['b', 'The boy is still inside. He does not want to break things that need not break.'],
      ['a', 'I was made only to break.'], ['b', 'Then you were made poorly.'], ['n', 'Dark Link almost laughs.'],
    ],
    A: [
      ['a', 'When the mask comes off, you sleep?'], ['b', 'I wait. The boy carries me.'], ['a', 'No one carries me.'],
      ['b', 'Then walk beside him. The other Link. He would not refuse you.'], ['n', 'Dark Link touches the edge of his own face, as though checking for a mask.'],
      ['a', 'Two shadows of one hero.'], ['b', 'Two powers. What we do with them is the only difference.'],
    ],
  },

  // ── The Princesses ──
  // a = tetra, b = zelda
  'tetra|zelda': {
    C: [
      ['b', 'You\'re the one the soldiers call Captain.'], ['a', 'That\'s because I am one. Got a problem with that, Princess?'],
      ['b', 'None. Though I\'m told we share a bloodline.'], ['a', 'Yeah, yeah. Some king on a boat said I\'m Princess Zelda too.'],
      ['b', 'You don\'t sound pleased.'], ['a', 'I\'ve got a ship, a crew and a sea. What would I want a castle for?'],
      ['n', 'Zelda hides a smile behind her hand.'],
    ],
    B: [
      ['a', 'Doesn\'t it drive you crazy? Everybody bowing, everybody watching what fork you use?'],
      ['b', 'Sometimes. For seven years I wore a Sheikah disguise and no one bowed at all.'], ['a', 'Seriously? You ran around in a mask?'],
      ['b', 'Wrappings. A harp. Throwing needles.'], ['a', 'Ha! Now that\'s a princess I could work with.'],
      ['b', 'It wasn\'t freedom, Tetra. It was hiding.'], ['a', 'Out at sea it\'s both. Depends on the day.'],
    ],
    A: [
      ['a', 'When the King told me what I was, I hated it. Felt like somebody stole my life.'], ['b', 'And now?'],
      ['a', 'Now I think… maybe the Triforce doesn\'t care if I wear a crown. I still protect my crew.'],
      ['b', 'That\'s all a crown ever meant. A promise to the people under it.'], ['a', 'You really believe that?'],
      ['b', 'I have to. Otherwise I gave up a great deal for a hat.'], ['n', 'Tetra barks out a laugh.'],
    ],
    S: [
      ['a', 'Here. Take it.'], ['n', 'She tosses Zelda a pirate\'s red neckerchief.'], ['b', 'What is this?'],
      ['a', 'Crew colors. Every one of my lot wears one. You\'re crew now, if you want.'],
      ['b', 'A princess in a pirate crew.'], ['a', 'Two princesses in a pirate crew. Think of the stories.'],
      ['b', 'Then I accept, Captain. Sister.'], ['a', 'Sister, huh? …Yeah. I could get used to that.'],
    ],
  },
  // a = zelda (OoT), b = zeldaTP
  'zelda|zeldaTP': {
    C: [
      ['a', 'You wear the royal crest of Hyrule. But not any version I know.'], ['b', 'Centuries separate us. I have seen your face in the castle tapestries.'],
      ['a', 'Truly? How do I look?'], ['b', 'Younger than I expected. And very determined.'],
      ['a', 'That sounds about right.'], ['n', 'The two Zeldas regard each other with polite, curious eyes.'],
    ],
    B: [
      ['b', 'When Zant came, I had to choose. Surrender the kingdom, or watch my people die.'], ['a', 'You surrendered.'],
      ['b', 'Yes. And spent the Twilight in a tower, cloaked in black, watching rain I could not stop.'],
      ['a', 'I hid for seven years while Ganondorf ruled. I told myself it was strategy.'], ['b', 'Wasn\'t it?'],
      ['a', 'It was. It was also the hardest thing I ever did. Waiting.'], ['b', 'Then you understand.'],
    ],
    A: [
      ['a', 'I was the one who sent Link back. To childhood. To a time where no one knew him.'], ['b', 'Why?'],
      ['a', 'So he might live the years he lost. I thought it was a kindness.'], ['b', 'Was it?'],
      ['n', 'The elder Zelda looks out over camp, toward a young boy in green with masks on his belt.'],
      ['a', 'I don\'t know. That\'s the part I carry.'], ['b', 'I gave my life to Midna once. It was returned to me. I am still not sure I deserved it.'],
      ['a', 'Perhaps none of us decide what we deserve. Only what we give.'],
    ],
    S: [
      ['b', 'The tapestries call you the first Zelda to wield the wisdom fully.'], ['a', 'They exaggerate. I made many mistakes.'],
      ['b', 'They do not show those. I wish they did. I would have felt less alone.'],
      ['a', 'Then let me be honest with you, from now on. Every doubt. Every regret.'], ['b', 'And I with you.'],
      ['n', 'They grip each other\'s hands, the marks of the Triforce of Wisdom faintly glowing on both.'],
      ['a', 'Whatever lies between our ages, we are family.'], ['b', 'Grandmother of a hundred generations.'], ['a', 'Please. Just Zelda.'],
    ],
  },
  // a = tetra, b = zeldaTP
  'tetra|zeldaTP': {
    C: [
      ['a', 'So you\'re a real queen-type. Throne and everything.'], ['b', 'Princess regent. And you are… a pirate.'],
      ['a', 'Captain. Of the best ship on the Great Sea.'], ['b', 'I have never seen a sea. Only Lake Hylia.'],
      ['a', 'A lake? Oh, you poor thing.'], ['n', 'Zelda raises an eyebrow, unsure whether to be offended.'],
    ],
    B: [
      ['b', 'How do you command a crew without a council?'], ['a', 'I yell. If that doesn\'t work, I yell louder.'],
      ['b', 'My council would faint.'], ['a', 'What do you do when they argue?'], ['b', 'I listen. All of them. Then I decide.'],
      ['a', 'Huh. That\'s… actually not bad. Gonzo would hate it.'], ['b', 'Perhaps we each have something to teach.'],
    ],
    A: [
      ['a', 'Honestly? I\'d crack under all that. Robes. Speeches. Nobody to blame but you.'],
      ['b', 'You lead men into storms and pirate fortresses. Nothing about you cracks.'],
      ['a', 'That\'s different. I picked that life.'], ['b', 'I did not pick mine. But I have come to love it.'],
      ['n', 'Tetra studies her for a moment.'], ['a', 'You\'re tougher than you look, Princess.'], ['b', 'And you are kinder than you pretend, Captain.'],
    ],
  },
  // a = heroOfWinds, b = zelda (OoT)
  'heroOfWinds|zelda': {
    C: [
      ['b', 'You carry the Master Sword, and you are from Hyrule\'s future.'], ['a', 'Kind of. My Hyrule\'s underwater.'],
      ['b', 'Underwater?'], ['a', 'The gods flooded it. To seal Ganondorf. The castle\'s still down there, frozen in time.'],
      ['n', 'Princess Zelda goes very still.'], ['b', 'Tell me everything. Please.'],
    ],
    B: [
      ['b', 'And the people?'], ['a', 'They live on islands. The tops of the mountains. Outset, Windfall, Dragon Roost.'],
      ['b', 'Dragon Roost. Death Mountain, perhaps.'], ['a', 'There\'s a dragon there. And the Rito. They\'re bird people.'],
      ['b', 'Bird people?'], ['a', 'They used to be Zora, I think. Medli said something like that.'],
      ['b', 'Then Hyrule\'s people changed to survive. The Zora too.'], ['a', 'Yeah. They\'re pretty good at it.'],
    ],
    A: [
      ['b', 'All of it, lost to the sea. Everything I tried to save.'], ['a', 'Not everything. People still tell your story.'],
      ['b', 'Do they?'], ['a', 'They tell it to kids. The hero in green. The princess with wisdom. Grandma knows it by heart.'],
      ['n', 'Zelda presses her hand to her mouth.'], ['b', 'Then Hyrule lives in them. Not in stone.'],
      ['a', 'Tetra says the same. Sort of. More rude.'], ['b', 'I believe I would like Tetra.'],
    ],
  },
  // a = heroOfTwilight, b = zelda (OoT)
  'heroOfTwilight|zelda': {
    C: [
      ['b', 'You wear his green. And yet you are not him.'], ['a', 'No, Princess. I\'m from Ordon. A long time after your Hyrule.'],
      ['b', 'How long?'], ['a', 'Long enough that the Temple of Time is a ruin in the woods.'],
      ['n', 'Zelda\'s expression tightens slightly.'], ['b', 'I see. Then I must ask you about the kingdom I will leave behind.'],
    ],
    B: [
      ['b', 'Is the castle still standing?'], ['a', 'Yes. Your descendant rules from it. She\'s… very calm. Very brave.'],
      ['b', 'And the Gorons? The Zora?'], ['a', 'The Zora queen died protecting her son. The Gorons still live on the mountain. They wrestle.'],
      ['b', 'Of course they do.'], ['a', 'Lake Hylia is still there. A little different.'], ['b', 'Everything is a little different. That is time, I suppose.'],
    ],
    A: [
      ['b', 'May I ask something foolish?'], ['a', 'Sure.'], ['b', 'Was it worth it? All we fought for?'],
      ['a', 'I grew up in a peaceful village. Pumpkins, goats, a spring where kids swam.'],
      ['a', 'That came from somewhere. From you.'], ['n', 'The princess lets out a breath she seems to have held for years.'],
      ['b', 'Then thank you, hero of the future. For telling me that.'],
    ],
  },
  // a = link (Hero of Time), b = zeldaTP
  'link|zeldaTP': {
    C: [
      ['b', 'You are the Hero of Time.'], ['a', 'That\'s what they say.'], ['b', 'Your story is woven into the stained glass of my castle.'],
      ['a', 'Stained glass?'], ['b', 'You look rather more tired than the windows suggest.'], ['n', 'Link rubs the back of his neck.'], ['a', 'It\'s been a long war.'],
    ],
    B: [
      ['b', 'The Royal Family has kept your legend for generations. It shaped how we raise our children.'], ['a', 'How?'],
      ['b', 'We teach that courage may come from anywhere. A farm. A forest. That a princess must seek it out.'],
      ['a', 'Zelda found me. Not the other way around.'], ['b', 'Then my ancestors learned well from her.'],
      ['a', 'Did you find yours?'], ['b', 'A goat herder from Ordon. Yes.'],
    ],
    A: [
      ['a', 'Does it bother you? Living up to stories about people like me?'], ['b', 'It did. Then I met the real one.'],
      ['a', 'And?'], ['b', 'The real one fumbles his ration bowl and forgets to eat when he\'s worried.'],
      ['n', 'Link actually laughs.'], ['b', 'You are not a legend, Hero. You are a person who chose well, over and over.'],
      ['a', 'That\'s all any of us can do.'], ['b', 'Then I am glad my kingdom was shaped by a person.'],
    ],
  },
  // a = link (Hero of Time), b = tetra
  'link|tetra': {
    C: [
      ['b', 'So you\'re him. The Hero of Time. The guy everybody on my islands waits for.'], ['a', 'I suppose.'],
      ['b', 'You know they waited and you never showed up, right?'], ['n', 'Link\'s jaw tightens.'],
      ['a', 'I didn\'t know.'], ['b', 'Hmph. Figures. Legends never do.'],
    ],
    B: [
      ['b', 'I\'ll be honest. I expected someone taller.'], ['a', 'Everyone does.'],
      ['b', 'And louder. Big speeches. You barely talk.'], ['a', 'Talking didn\'t stop Ganondorf.'],
      ['b', 'Fair point.'], ['n', 'She watches him oil his shield for a while.'], ['b', 'Why didn\'t you come back? Really?'],
      ['a', 'Zelda sent me back in time. After. I don\'t think I could have come.'], ['b', '…Oh.'],
    ],
    A: [
      ['b', 'I was wrong about you. Kinda.'], ['a', 'Kinda?'],
      ['b', 'Everybody blamed the hero who didn\'t return. But you weren\'t hiding. You just got sent somewhere else.'],
      ['a', 'The people still suffered.'], ['b', 'Yeah. And they survived. And they made a new hero.'],
      ['a', 'The boy with the telescope.'], ['b', 'Don\'t tell him I said this, but he\'s not bad. He learned from your story.'],
      ['n', 'Link nods slowly.'], ['a', 'Then maybe I did come back, in a way.'],
    ],
  },
  // a = ashei, b = zelda (Sheik)
  'ashei|zelda': {
    C: [
      ['n', 'Ashei watches Sheik vanish in a flash of Deku Nut light, then reappear behind a training dummy.'],
      ['a', 'Flashy.'], ['b', 'Effective.'], ['a', 'Both, I guess. You fight like no soldier I know.'],
      ['b', 'I am not a soldier. I am Sheikah-trained.'], ['a', 'Same difference to the enemy.'],
    ],
    B: [
      ['a', 'My father raised me in the mountains. Taught me the blade. No one else to rely on.'], ['b', 'Impa raised me the same.'],
      ['a', 'Impa. Your guardian?'], ['b', 'And teacher. She taught me that an army is slow, and one shadow can move anywhere.'],
      ['a', 'That\'s why I scout alone.'], ['b', 'Alone has its limits.'], ['a', 'Says the woman who hid for seven years.'],
      ['n', 'Sheik inclines her head, conceding.'],
    ],
    A: [
      ['b', 'You don\'t need a princess to protect you, do you?'], ['a', 'Nope.'],
      ['b', 'I find that refreshing. Most look at me and see someone to rescue.'],
      ['a', 'I look at you and see somebody who can put a needle through a Lizalfos eye at forty paces.'],
      ['b', 'Thirty-five.'], ['a', 'Practice more.'], ['n', 'For the first time, Sheik laughs aloud.'],
      ['b', 'Spar with me tomorrow. No titles.'], ['a', 'Wasn\'t planning on any.'],
    ],
  },
  // a = midnaImp, b = zelda (Sheik)
  'midnaImp|zelda': {
    C: [
      ['a', 'Well, well. A princess wrapped up like a mummy. I know a disguise when I see one.'],
      ['b', 'And I know a curse when I see one. You are not truly that shape.'], ['a', '…Clever.'],
      ['b', 'I hid as Sheik for seven years. I recognize someone who is hiding.'], ['n', 'Midna\'s grin falters, just for a second.'],
    ],
    B: [
      ['a', 'So what was it like? Pretending to be someone else for that long?'], ['b', 'Lonely. Some days I forgot which was the mask.'],
      ['a', 'Heh. I get it. Nobody bows to an imp.'], ['b', 'Did you want them to?'],
      ['a', 'I wanted them to remember I was their ruler. Even with this head.'], ['b', 'And they did?'], ['a', 'Some.'],
    ],
    A: [
      ['b', 'When I finally took off the wrappings, I was afraid no one would believe me.'], ['a', 'Did they?'],
      ['b', 'Link did. That was enough to start.'], ['a', 'Mine believed me too. Even when I was a brat to him.'],
      ['n', 'Midna drifts down to sit beside her, uncharacteristically quiet.'],
      ['a', 'Survive first. Be yourself after. That\'s what we both did.'], ['b', 'And now we can be both.'],
    ],
  },
  // a = impa, b = zeldaTP
  'impa|zeldaTP': {
    C: [
      ['n', 'Impa positions herself between Zelda and a shadowed tree line before anyone else notices the movement.'],
      ['b', 'Impa. I have my own guards.'], ['a', 'Then they are slow.'], ['b', 'I am not the Zelda you protected.'],
      ['a', 'You carry the same blood and the same wisdom. It is close enough for me.'],
    ],
    B: [
      ['b', 'You watch me eat. You watch me sleep. You watch me read reports.'], ['a', 'Yes.'],
      ['b', 'I am grateful, but I surrendered to Zant once. I know when to fight and when to yield.'],
      ['a', 'I know. That is why I stand ready. So you need not yield again.'], ['n', 'Zelda falls silent.'],
      ['b', 'You make it difficult to argue.'], ['a', 'I raised one princess. I know the tactics.'],
    ],
    A: [
      ['b', 'Tell me about her. The Zelda you raised.'], ['a', 'She was stubborn. Curious. She dreamed things that came true.'],
      ['b', 'And you protected her through all of it.'], ['a', 'I tried. I could not stop her from carrying the weight.'],
      ['b', 'No one could. But you made her stronger. I can see it in how you stand.'],
      ['n', 'Impa bows, deeply.'], ['a', 'Then allow me to stand at your side too, Princess.'], ['b', 'I would be honored.'],
    ],
  },
  // a = impa, b = tetra
  'impa|tetra': {
    C: [
      ['a', 'You stand like a pirate.'], ['b', 'Thanks!'], ['a', 'It was not praise.'],
      ['b', 'Look, if you\'re gonna lecture me about posture, the Princess over there is more your type.'],
      ['a', 'You are also the Princess.'], ['b', 'Ugh. Not you too.'],
    ],
    B: [
      ['a', 'The Sheikah served the Royal Family in shadow. We guarded the princess, her secrets, her life.'],
      ['b', 'Never heard of you. Where I\'m from there\'s just sea.'], ['a', 'Then the Sheikah are gone from your world.'],
      ['b', 'Probably. Sorry.'], ['n', 'Impa is silent for a moment.'], ['a', 'Then someone must teach you what they would have.'],
      ['b', 'Like what?'], ['a', 'How to move without being heard. Your crew is very loud.'], ['b', '…Okay, that one I\'ll take.'],
    ],
    A: [
      ['b', 'Got it! You didn\'t hear me that time, did you?'], ['a', 'I heard you. The guard did not.'],
      ['b', 'Close enough.'], ['a', 'A princess is not her crown, Tetra. It is the people who would die for her, and she for them.'],
      ['b', 'That\'s just being a captain.'], ['a', 'Precisely. You were raised royal without knowing it.'],
      ['n', 'Tetra opens her mouth to argue, and closes it.'], ['b', '…Don\'t tell my crew you said that.'],
    ],
  },

  // ── Fairies and Magical Companions ──
  // a = navi, b = tatl
  'navi|tatl': {
    C: [
      ['a', 'Hey! Listen! You\'re a fairy too!'], ['b', 'Obviously. And don\'t yell, I\'m right here.'],
      ['a', 'Sorry! I\'m Navi. I travel with Link.'], ['b', 'Tatl. I travel with Link too. A shorter one. With masks.'],
      ['a', 'He\'s… my Link? Later?'], ['n', 'Both fairies flicker in confusion.'], ['b', 'Ugh, time travel. Let\'s not.'],
    ],
    B: [
      ['b', 'So does yours ever listen when you tell him where to go?'], ['a', 'Mostly. I just keep saying it until he does!'],
      ['b', 'Hah. I tried that. Then I started insulting him. Works faster.'], ['a', 'Tatl! That\'s mean!'],
      ['b', 'He liked it. Probably.'], ['a', 'I tell him about enemies. Weak points. Watch out!'], ['b', 'Same. Plus I tell him when he looks dumb.'],
    ],
    A: [
      ['b', 'Can I ask you something? He was looking for you. In Termina. That\'s why he came at all.'],
      ['n', 'Navi\'s glow dims.'], ['a', 'I… I had to leave. After Ganondorf. My task was done.'],
      ['b', 'He never stopped looking. He\'d stare at every bright light in the sky.'], ['a', 'I didn\'t know.'],
      ['b', 'So I took care of him. Somebody had to.'], ['a', 'Thank you, Tatl. Really.'],
    ],
    S: [
      ['a', 'When this war ends, I\'m going to find him. My Link. The one who\'s searching.'], ['b', 'You\'d better.'],
      ['a', 'Will you come with me? You know where he went.'], ['b', 'Me? I\'ve got a brother to watch.'],
      ['a', 'Bring Tael! Bring everyone!'], ['n', 'Tatl buzzes in a small circle, thinking.'],
      ['b', 'Fine. But I\'m doing the talking when we find him. You\'ll just yell "Listen!" and he\'ll cry.'],
      ['a', 'Deal! Best friends?'], ['b', '…Best friends. Don\'t make it weird.'],
    ],
  },
  // a = navi, b = tael
  'navi|tael': {
    C: [
      ['a', 'Hey! You\'re Tatl\'s brother!'], ['b', 'Um. Yes. Tael.'], ['a', 'Why are you hiding behind the tent?'],
      ['b', 'There were… soldiers. Loud ones.'], ['a', 'They\'re nice! Mostly!'], ['n', 'Tael edges out about half a wing.'],
    ],
    B: [
      ['a', 'Okay! Practice! When you see a Keese, you say "Watch out!" really loud!'], ['b', 'Watch out.'],
      ['a', 'Louder!'], ['b', 'Watch… out!'], ['a', 'Even louder! From the belly!'], ['b', 'Fairies don\'t have bellies.'],
      ['a', 'Then from the glow!'], ['n', 'Tael glows brighter, startling a soldier who was walking past.'], ['b', 'Oh! Sorry!'],
    ],
    A: [
      ['b', 'Navi. Today I warned the archers about the Bulblins. Before anyone else.'], ['a', 'I heard! You did it!'],
      ['b', 'They said thanks. To me.'], ['a', 'Because you\'re brave! You just whisper a lot.'],
      ['b', 'When the moon came, all I could do was shout four words. Swamp, mountain, ocean, canyon. I barely got them out.'],
      ['a', 'But you did! And they saved everyone.'], ['n', 'Tael glows warm and steady.'], ['b', 'I guess they did.'],
    ],
  },
  // a = midnaImp, b = navi
  'midnaImp|navi': {
    C: [
      ['b', 'Hey! Listen! You\'re riding inside that Link\'s shadow!'], ['a', 'Yes. It\'s cozy. What\'s it to you, sparkle?'],
      ['b', 'Fairies fly next to their hero. We don\'t hide!'], ['a', 'Then fairies get swatted.'],
      ['n', 'Navi bristles, her light flashing an indignant red.'],
    ],
    B: [
      ['a', 'So you just… tell him what to look at? All day?'], ['b', 'It\'s important! "Look, a crack in the wall!"'],
      ['a', 'I usually let him figure it out. Then I laugh.'], ['b', 'That\'s horrible!'],
      ['a', 'It works. He thinks harder when I\'m smirking at him.'], ['b', 'Mine thinks harder when I explain things.'],
      ['a', 'Then I guess each Link gets the guide he deserves.'],
    ],
    A: [
      ['b', 'Midna. You\'re really mean to him. But he trusts you completely.'], ['a', 'Hmph. Maybe.'],
      ['b', 'Why does that work?'], ['a', 'Because when it counted, I didn\'t leave.'],
      ['n', 'Navi goes quiet, her light dipping.'], ['b', 'I left. When it was over.'],
      ['a', 'Then go back. Nag him, scold him, whatever. Just don\'t disappear.'], ['b', '…I won\'t. Listen to you, giving good advice.'],
    ],
  },
  // a = midnaImp, b = tael
  'midnaImp|tael': {
    C: [
      ['b', 'Um. Excuse me. Are you from the place with the black sky?'], ['a', 'The Twilight Realm. And it\'s not black. It\'s gold.'],
      ['b', 'Gold?'], ['a', 'And quiet. Everyone glows a little.'], ['b', 'Like fairies?'],
      ['a', 'Like… huh. Sort of, actually.'], ['n', 'Tael drifts a little closer.'],
    ],
    B: [
      ['b', 'Do the Twili sing?'], ['a', 'Not much. We\'re a solemn bunch. Banished people usually are.'],
      ['b', 'Banished?'], ['a', 'Long ago, for trying to steal the Triforce. Hyrule shut us away in a mirror.'],
      ['b', 'That\'s sad. Like Skull Kid when everyone forgot him.'], ['a', 'Your friend in the creepy mask?'],
      ['b', 'He\'s nice now. He just wanted friends.'], ['a', '…So did we, maybe.'],
    ],
    A: [
      ['b', 'Can I visit? The Twilight?'], ['a', 'It\'s not exactly a picnic spot, little light.'],
      ['b', 'I\'d be quiet. I\'m good at quiet.'], ['n', 'Midna laughs, genuinely.'],
      ['a', 'You are. Fine. If there\'s ever a way back, you get the first tour. Palace and all.'],
      ['b', 'And you\'ll show me the gold sky?'], ['a', 'I\'ll show you everything.'],
    ],
  },
  // a = queenOfFairies, b = tatl
  'queenOfFairies|tatl': {
    C: [
      ['a', 'Little one. Your light is restless.'], ['b', 'That\'s because people keep calling me "little one."'],
      ['a', 'All fairies are little before me.'], ['b', 'Doesn\'t mean you have to rub it in, Your Majesty.'],
      ['n', 'The Queen of Fairies laughs, a sound like water over glass.'],
    ],
    B: [
      ['b', 'Back home, fairies are supposed to guide the lost and heal the hurt. That\'s it.'], ['a', 'It is an honorable purpose.'],
      ['b', 'Sure. But I made friends with a Skull Kid who caused a moon to fall. That\'s not in the rules.'],
      ['a', 'No, it is not.'], ['b', 'And I\'d do it again. He needed somebody.'],
      ['a', 'Perhaps the rules were written by those who never met a Skull Kid.'],
    ],
    A: [
      ['b', 'So you\'re not going to tell me I\'m doing it wrong?'], ['a', 'You guided a lost child through four temples. You healed a broken friendship.'],
      ['b', 'With a lot of yelling.'], ['a', 'Even so. Duty is not a cage, Tatl. It is a direction.'],
      ['n', 'Tatl hovers, unusually silent.'], ['b', 'Huh. Nobody ever said it like that before.'],
      ['a', 'Then I am glad to be the first.'],
    ],
  },
  // a = queenOfFairies, b = tael
  'queenOfFairies|tael': {
    C: [
      ['n', 'Tael approaches the Queen of Fairies, freezes, retreats, and approaches again.'],
      ['a', 'Come. I do not bite.'], ['b', 'S-sorry, Your Majesty. You\'re just very… big.'],
      ['a', 'And you are very brave, to come so close anyway.'], ['b', 'I am?'],
    ],
    B: [
      ['b', 'My sister does all the talking. I mostly hide.'], ['a', 'And yet you carried a message across the whole of Termina.'],
      ['b', 'How do you know that?'], ['a', 'Fairies talk. Even the quiet ones.'],
      ['b', 'I could only say a few words. Before the Skull Kid caught me.'], ['a', 'They were the right words. That is rare.'],
    ],
    A: [
      ['b', 'I want to be more like Tatl.'], ['a', 'Why?'], ['b', 'She\'s brave. Loud. Everyone notices her.'],
      ['a', 'Courage need not be loud, little light. Sometimes it is simply staying, when you wish to flee.'],
      ['n', 'The Queen touches Tael gently, and his glow brightens to match hers for a moment.'],
      ['a', 'Be Tael. The world has need of him.'], ['b', '…Okay. I\'ll try.'],
    ],
  },
  // a = midnaImp, b = queenOfFairies
  'midnaImp|queenOfFairies': {
    C: [
      ['a', 'So you\'re the big shiny one everyone curtsies to.'], ['b', 'And you are the little dark one everyone avoids.'],
      ['a', 'Ha! Fair.'], ['b', 'Your magic tastes of dusk. Twilight, if I am not mistaken.'],
      ['a', 'Sharp. Yours tastes like a hot spring and sugar.'], ['n', 'The Fairy Queen seems quite pleased by this.'],
    ],
    B: [
      ['a', 'Show me something. A spell.'], ['b', 'Very well.'],
      ['n', 'Every wounded soldier in sight sighs as warm light falls over them and their cuts close.'],
      ['a', '…Okay, show-off. Watch this.'], ['n', 'Midna\'s hair forms a giant hand and lifts a supply cart clean off the ground.'],
      ['b', 'Impressive. And rude.'], ['a', 'That\'s my specialty.'],
    ],
    A: [
      ['a', 'Your magic heals. Mine grabs and smashes and warps. Not the nicest set of tools.'],
      ['b', 'You used them to save two worlds. That seems quite nice to me.'], ['a', 'Doesn\'t feel that way.'],
      ['b', 'Light and shadow are not opposites, Princess. They make each other visible.'],
      ['n', 'Midna stares at her for a moment.'], ['a', 'Did you just call me Princess?'], ['b', 'I know royalty when I see it.'],
    ],
  },
  // a = greatFairy, b = midnaImp
  'greatFairy|midnaImp': {
    C: [
      ['a', 'Ahahaha! A shadow-child, dancing in my fountain\'s light!'], ['b', 'I wasn\'t dancing. I was flinching.'],
      ['a', 'Light stings you?'], ['b', 'Too much of it. I\'m Twili. We like things dim.'],
      ['a', 'Then I shall turn myself down. Just a little. Ahaha!'], ['n', 'The glow softens. Midna blinks gratefully.'],
    ],
    B: [
      ['b', 'Can you even touch Twilight magic without it going sour?'], ['a', 'Shall we find out?'],
      ['n', 'Midna holds out a thread of shadow. The Great Fairy wraps it in a ribbon of light, and both flicker together.'],
      ['b', 'Huh. It didn\'t explode.'], ['a', 'It shimmers! Like a dusk sky!'], ['b', 'Like home, sort of.'],
    ],
    A: [
      ['a', 'Together, our magic made a shield that fended off an entire Darknut charge.'], ['b', 'I noticed. Not bad.'],
      ['a', 'You always say "not bad." You mean "wonderful."'], ['b', 'Don\'t push it, sparkles.'],
      ['n', 'The Great Fairy laughs her echoing laugh.'], ['a', 'Shadow and light, little princess. We are better entwined.'],
      ['b', '…Yeah. Okay. Wonderful. Happy?'], ['a', 'Ahahaha! Very!'],
    ],
  },
  // a = giantTurtle, b = kaepora
  'giantTurtle|kaepora': {
    C: [
      ['b', 'Hoo hoo! An old shell, sunning upon the camp\'s edge.'], ['a', 'And an old feather, perched upon my head.'],
      ['b', 'Forgive me. You looked like an island.'], ['a', 'Many have made that mistake. Most were less polite.'],
      ['n', 'The owl stays exactly where he is.'],
    ],
    B: [
      ['a', 'You fly far. What have you seen?'], ['b', 'Kingdoms rise. Children grow. Forests forget their names.'],
      ['a', 'And I have seen the ocean floor turn over, and the tide rise higher each century.'],
      ['b', 'Hoo. Then between us, we have seen most of the world.'], ['a', 'From the top, and from the bottom.'],
    ],
    A: [
      ['b', 'Do you ever grow weary of guiding the young ones?'], ['a', 'I carried a boy to a temple once. He did not stop shouting.'],
      ['b', 'Ah. A boy in green?'], ['a', 'You know him?'], ['b', 'I have told him more than he ever wished to hear. Hoo hoo!'],
      ['n', 'The Giant Turtle rumbles a slow, deep laugh.'], ['a', 'Patience is the oldest wisdom.'], ['b', 'And the least welcome. Shall I repeat that?'],
    ],
  },
  // a = kaepora, b = kingDaphnes
  'kaepora|kingDaphnes': {
    C: [
      ['a', 'Hoo hoo! The King of Red Lions. A curious shape for a monarch.'], ['b', 'And a talking owl is a curious shape for a sage.'],
      ['a', 'You see through me.'], ['b', 'I have seen through many disguises. I wear one myself.'],
      ['n', 'The wooden lion\'s eyes gleam with old intelligence.'],
    ],
    B: [
      ['b', 'You guided the Hero of Time.'], ['a', 'From branch to branch. He rarely wanted my advice.'],
      ['b', 'My boy is the same. He sails off before I finish.'], ['a', 'And yet they arrive where they must.'],
      ['b', 'That is the art, is it not? To point, and let them walk.'], ['a', 'Or sail. Hoo.'],
    ],
    A: [
      ['b', 'My guidance ended with my kingdom beneath the waves. I let it go.'], ['a', 'You let Hyrule go?'],
      ['b', 'I wished for the young ones to make their own future. Not to chase mine.'],
      ['n', 'Kaepora Gaebora is quiet for a long moment.'], ['a', 'I once was a Sage of Light. I clung to Hyrule\'s fate for many lifetimes.'],
      ['b', 'Perhaps the last lesson is to stop guiding.'], ['a', 'Hoo. Perhaps. But not quite yet.'],
    ],
  },

  // ── Goron Brotherhood ──
  // a = darbus, b = darunia
  'darbus|darunia': {
    C: [
      ['b', 'BROTHER! You must be Darbus! The patriarch of the Gorons of your age!'], ['a', 'Hrm. I am.'],
      ['b', 'I am Darunia, Big Brother of the Gorons of Death Mountain! Let me shake your hand!'],
      ['n', 'The handshake is so vigorous that both Gorons\' feet leave small craters.'], ['a', '…A strong grip, goro.'],
    ],
    B: [
      ['b', 'How do you lead your brothers, Darbus?'], ['a', 'Quietly. I eat with them. I watch the mines.'],
      ['b', 'I shout! I dance! I lead from the front!'], ['a', 'I noticed.'],
      ['a', 'I did not watch closely enough. A shadow took me. I became a beast and burned my own mountain.'],
      ['n', 'Darunia\'s grin fades.'], ['b', 'Brother… that was not your doing.'], ['a', 'My people still had to pay.'],
    ],
    A: [
      ['b', 'When Volvagia rose, I went into the Fire Temple to stop it. My people were taken while I was gone.'],
      ['a', 'You blame yourself?'], ['b', 'Every day, until a boy in green saved them.'], ['a', 'Hrm. A boy in green saved mine as well.'],
      ['b', 'Then we\'re a pair of old rocks who needed help, eh?'], ['n', 'Darbus actually chuckles, a sound like rolling gravel.'],
      ['a', 'A leader who needs no help leads no one.'],
    ],
    S: [
      ['b', 'Darbus! I have decided! We will swear brotherhood, under the stars, the Goron way!'], ['a', 'We are already brothers. All Gorons are.'],
      ['b', 'Sworn brothers! There\'s a difference!'], ['a', 'What is the difference?'],
      ['b', 'Sworn brothers share their best rock sirloin!'], ['n', 'Darunia produces an enormous, gleaming slab of rock.'],
      ['a', '…Hrm. That is a serious oath.'], ['b', 'Across all of time, brother!'], ['a', 'Across all of time. Goro.'],
    ],
  },
  // a = darunia, b = gorCoron
  'darunia|gorCoron': {
    C: [
      ['b', 'You are the famous Darunia? The Big Brother of legend, goro?'], ['a', 'Ha! The same!'],
      ['b', 'We still tell of you on Death Mountain. Your sumo was said to shake the earth.'],
      ['a', 'Still does! Care to find out, elder?'], ['n', 'Gor Coron\'s eyes light up like a forge.'], ['b', 'I thought you would never ask.'],
    ],
    B: [
      ['n', 'A crowd of soldiers circles the makeshift sumo ring. The two Gorons slam together with a sound like a landslide.'],
      ['a', 'HA! You push like a mountain!'], ['b', 'And you shove like a volcano!'],
      ['n', 'Neither yields. After ten minutes, the ring itself has sunk a foot into the ground.'],
      ['b', 'A… draw, goro?'], ['a', 'A draw! Again tomorrow!'],
    ],
    A: [
      ['b', 'Tell me, legend. Do you ever lose?'], ['a', 'Once. To a Hylian boy wearing iron boots and the strength of the Goron Bracelet.'],
      ['b', 'Hah! The same thing happened to me, with a boy in green.'], ['a', 'Maybe it\'s the same kind of boy.'],
      ['b', 'They make them sturdy, these heroes.'], ['n', 'Darunia slaps him on the back hard enough to dent a breastplate.'],
      ['a', 'And they make us sturdier, brother!'],
    ],
  },
  // a = dangoro, b = darunia
  'dangoro|darunia': {
    C: [
      ['b', 'You! You\'re the guardian of the Goron Mines, aren\'t you?'], ['a', 'Dangoro. That\'s me, goro.'],
      ['b', 'They say you\'re the strongest in your era!'], ['a', 'Only a boy in iron boots ever beat me.'],
      ['b', 'Then I\'ll test you myself! Show me what you\'ve got!'],
    ],
    B: [
      ['n', 'Dangoro curls into a ball and rams Darunia. Darunia stops him with both palms, skidding back.'],
      ['b', 'HA! Good, but you lead with your head!'], ['a', 'That\'s how I roll.'],
      ['b', 'Lead with the shoulder. Your whole weight behind it. Again!'],
      ['n', 'Dangoro tries again. This time Darunia slides back twice as far.'], ['a', 'Whoa.'], ['b', 'Now you\'re learning!'],
    ],
    A: [
      ['a', 'I used to think being strong meant guarding a room and smashing whoever came in.'], ['b', 'And now?'],
      ['a', 'You don\'t fight like that. You fight for the brothers behind you.'], ['b', 'That\'s the only reason to be strong, brother!'],
      ['a', 'Then I want to get strong like that.'], ['n', 'Darunia beams.'], ['b', 'You already are. You just needed someone to say it.'],
    ],
  },
  // a = darbus, b = darmani
  'darbus|darmani': {
    C: [
      ['b', 'You\'re a patriarch, aren\'t you? You have that weight about you.'], ['a', 'Hrm. Darbus. Of Death Mountain.'],
      ['b', 'Darmani. Of Snowhead.'], ['a', 'Snowhead. Is it cold?'], ['b', 'It was frozen solid, last time I saw it. My people nearly froze too.'],
      ['n', 'Darbus nods slowly.'], ['a', 'Mine nearly burned.'],
    ],
    B: [
      ['b', 'What made it burn?'], ['a', 'A dark shard of magic. It made me into something else. A fire beast.'],
      ['b', 'Something like that happened in Snowhead. A masked monster made the cold.'], ['a', 'Did you stop it?'],
      ['n', 'Darmani is quiet.'], ['b', 'I fell before I could. Someone else finished it for me.'],
      ['a', 'Hrm. Then we were both beaten by our own mountains.'],
    ],
    A: [
      ['a', 'You still wish you had won alone?'], ['b', 'For a long time, yes. Pride is heavy.'],
      ['a', 'It is. I carried it into the mines. It nearly crushed my brothers.'], ['b', 'And now?'],
      ['a', 'Now I let them help. Even the children.'], ['b', 'I wish I\'d learned that before Snowhead.'],
      ['a', 'You learn it now. That counts.'],
    ],
    S: [
      ['b', 'Darbus. When this war is done, will you visit Snowhead with me?'], ['a', 'Is it still cold?'],
      ['b', 'Spring came. The hot springs flow again. My people race on the slopes.'],
      ['a', 'Then I will come. And you will see Death Mountain.'], ['b', 'Our tribes have never met.'],
      ['n', 'Darbus places a heavy hand on Darmani\'s shoulder.'], ['a', 'They will now. As one family.'], ['b', 'One family. Goro.'],
    ],
  },
  // a = darmani, b = gorCoron
  'darmani|gorCoron': {
    C: [
      ['a', 'Elder. The soldiers say you know the old Goron traditions.'], ['b', 'Some. What do you seek?'],
      ['a', 'In my land, when a Goron hero falls, his brothers sing a lullaby at his grave.'],
      ['b', 'We do something similar, goro. We roll a stone of his up the mountain.'], ['n', 'Darmani looks thoughtful.'],
    ],
    B: [
      ['b', 'Tell me of your fallen.'], ['a', 'I am one. Or I was. A ghost, for a time, wandering by my own grave.'],
      ['b', 'A ghost!'], ['a', 'A boy played a song of healing. I became a mask, and gave him my strength.'],
      ['b', 'Then your spirit still served your tribe. That is the greatest honor among Gorons.'], ['a', 'I didn\'t feel honored. I felt lost.'],
    ],
    A: [
      ['b', 'Come. There is a ritual for heroes who found rest late.'], ['a', 'What do I do?'],
      ['n', 'Gor Coron hands him a smooth, round stone, warm from the campfire.'],
      ['b', 'Roll it up the hill, then roll it back down. That is your old life, and your new one.'],
      ['a', 'That\'s it?'], ['b', 'Gorons are simple folk, goro.'], ['n', 'Darmani rolls it up, then down. Something settles in his face.'],
      ['a', 'Thank you, elder.'],
    ],
  },
  // a = dangoro, b = darmani
  'dangoro|darmani': {
    C: [
      ['a', 'You. The big one with the scar. Wanna spar?'], ['b', 'Are you sure, little brother?'],
      ['a', 'Little? I guarded the Goron Mines alone!'], ['b', 'Then let\'s see it.'],
      ['n', 'Dangoro charges. Darmani plants his feet and doesn\'t move an inch.'], ['a', 'Huh.'],
    ],
    B: [
      ['b', 'You rely on rolling. Close in, a rolling Goron is easy to stop.'], ['a', 'So what do I do?'],
      ['b', 'Grapple. Hands, shoulders, hips. Use your weight, not your speed.'],
      ['n', 'They grapple for an hour. Dangoro is tossed four times, then five, then finally tosses Darmani once.'],
      ['a', 'YEAH! Got you!'], ['b', 'Hah! Now you\'re fighting!'],
    ],
    A: [
      ['a', 'Why do you train so hard? You don\'t even look tired.'], ['b', 'I died because I was strong but not strong enough.'],
      ['a', '…Oh.'], ['b', 'I won\'t let a brother fall like I did. That includes you.'],
      ['n', 'Dangoro straightens up a little.'], ['a', 'Then train me every day. I\'ll be your back.'], ['b', 'Deal, brother.'],
    ],
  },
  // a = biggoron, b = darbus
  'biggoron|darbus': {
    C: [
      ['a', 'Ho… You are… a big one, too.'], ['b', 'Not as big as you, Biggoron.'],
      ['a', 'Ha… ha… nobody is. Your armor… is too small.'], ['n', 'Darbus looks down at his straining shoulder plates.'],
      ['b', 'Hrm. The camp smith gave me his biggest.'], ['a', 'Biggest… for Hylians.'],
    ],
    B: [
      ['n', 'Biggoron hammers an enormous plate on his anvil, each strike a thunderclap. Darbus watches.'],
      ['a', 'Arms… up.'], ['b', 'Like this?'], ['a', 'Ho… Bigger… than I thought.'],
      ['b', 'Can you fit me?'], ['a', 'I made… a sword… longer than a boy. I can… make armor.'],
    ],
    A: [
      ['n', 'Darbus stands in a full suit of dark iron, gleaming with forge-light.'], ['b', 'It fits.'],
      ['a', 'Of course… it fits. I am… the best.'], ['b', 'Hrm. You are. Thank you.'],
      ['a', 'Protect… your brothers. That is… payment.'], ['b', 'I will. With my life.'],
      ['a', 'Ho… not with life. With armor. That is… the point.'],
    ],
  },
  // a = gorCoron, b = medigoron
  'gorCoron|medigoron': {
    C: [
      ['a', 'You make blades, goro?'], ['b', 'The finest! Except for my brother Biggoron\'s, maybe.'],
      ['a', 'I have no use for blades. I fight sumo.'], ['b', 'Sumo! Then what you need is armor that bends!'],
      ['a', 'Armor… that bends?'], ['n', 'Medigoron is already sketching in the dirt with an enormous finger.'],
    ],
    B: [
      ['b', 'Right! Stand there. Now slap.'], ['n', 'Gor Coron slaps. The plate on his chest snaps clean in half.'],
      ['a', 'That is not bending.'], ['b', 'Back to the anvil!'],
      ['n', 'The second plate cracks. The third splits. The fourth holds, wobbling slightly.'], ['a', 'Hm! Better, goro!'],
    ],
    A: [
      ['b', 'Layered plates. Overlapping, like scales on a Dodongo. They slide when you push!'], ['a', 'And protect when I am struck?'],
      ['b', 'Exactly!'], ['n', 'Gor Coron grapples a training post and topples it, plates shifting smoothly over his back.'],
      ['a', 'Splendid! It moves as I move!'], ['b', 'Of course! I\'m the second best smith on the mountain!'],
      ['a', 'Only second?'], ['b', 'Don\'t tell Biggoron I said that.'],
    ],
  },
  // a = biggoron, b = yeto
  'biggoron|yeto': {
    C: [
      ['b', 'Hm? You… big. Like mountain.'], ['a', 'Ho… you are… big too. Furry.'],
      ['b', 'Yeto live on Snowpeak. With wife. You live on mountain too?'], ['a', 'Death Mountain… the top.'],
      ['b', 'Hm. Mountain friends!'], ['n', 'The two giants regard one another with slow, pleased astonishment.'],
    ],
    B: [
      ['b', 'Yeto make soup. Reekfish soup. You eat?'], ['a', 'Ho… I eat… rocks.'],
      ['b', 'Rocks? …Hm. Yeto put rock in soup.'], ['n', 'Yeto drops a fist-sized stone into the pot.'],
      ['a', 'Ho… ho… delicious.'], ['b', 'Hm! Good!'],
    ],
    A: [
      ['b', 'Yeto worry. Wife alone on Snowpeak.'], ['a', 'You miss… her.'], ['b', 'Very much. Yeta is best wife.'],
      ['a', 'I made… something.'], ['n', 'Biggoron opens a palm to reveal a tiny, perfectly forged silver snowflake.'],
      ['a', 'For… Yeta.'], ['b', 'Hm… hm! Yeto give it! Yeta will be happy!'], ['a', 'Ho… mountain friends.'],
    ],
  },
  // a = darunia, b = yeto
  'darunia|yeto': {
    C: [
      ['a', 'BROTHER! That soup smells incredible! What\'s in it?'], ['b', 'Hm. Reekfish. Pumpkin. Goat cheese.'],
      ['a', 'I\'ll take three bowls!'], ['b', 'Hm! Big eater! Yeto like big eater!'],
      ['n', 'Darunia drains a bowl in one gulp and holds it out again.'],
    ],
    B: [
      ['a', 'Let\'s see who can eat more! Loser wrestles the winner!'], ['b', 'Hm? Loser wrestle winner?'],
      ['a', 'Ha! Winner wrestles loser! Either way, there\'s wrestling!'], ['b', 'Hm! Yeto good at wrestling!'],
      ['n', 'Eleven bowls later, both are still eating. The quartermaster begins to panic about rations.'],
    ],
    A: [
      ['n', 'The wrestling match lasts until moonrise. Darunia lies flat on his back, laughing at the stars.'],
      ['a', 'HAHAHA! Brother, you are as strong as a Goron!'], ['b', 'Hm. You strong like Yeto.'],
      ['a', 'You must come to Death Mountain. Feast with my brothers!'], ['b', 'Yeto come. Bring Yeta. Bring soup.'],
      ['a', 'Bring lots of soup!'], ['b', 'Hm! Lots!'],
    ],
  },
  // a = gorCoron, b = kingBulblin
  'gorCoron|kingBulblin': {
    C: [
      ['n', 'King Bulblin and Gor Coron stand over the same roasted boar, glaring.'],
      ['a', 'I was here first, goro.'], ['b', 'Hrrgh.'], ['a', 'There is only one fair way to settle this.'],
      ['n', 'Gor Coron slaps his belly and steps into a sumo stance. King Bulblin cracks his knuckles.'],
    ],
    B: [
      ['n', 'The match is brutal. King Bulblin throws Gor Coron once; Gor Coron throws him back twice.'],
      ['a', 'You fight with honor, warrior.'], ['b', 'Grrh.'],
      ['n', 'King Bulblin tears the boar in two and tosses half to the Goron elder.'],
      ['a', 'Hah! Shared spoils. I like you.'],
    ],
    A: [
      ['n', 'Now, whenever a quarrel breaks out between the Bulblin riders and the Goron troops, a ring is drawn in the dirt.'],
      ['a', 'Every argument settled in the ring. No grudges after.'], ['b', 'Hrrh.'],
      ['n', 'King Bulblin gives a single short nod, then slams a fist into his palm.'],
      ['a', 'Again? Hah! Very well. For old times\' sake, goro!'],
    ],
  },

  // ── Zora and Rito ──
  // a = mikau, b = ruto
  'mikau|ruto': {
    C: [
      ['b', 'You there! A Zora with a guitar made of fish bones? How peculiar.'], ['a', 'It\'s my axe, Princess. I\'m the guitarist for the Indigo-Go\'s.'],
      ['b', 'Indigo-what?'], ['a', 'Biggest band in Termina. Ever heard of us?'], ['b', 'Certainly not. Zora royalty does not listen to… bands.'],
      ['n', 'Mikau strums a riff. Ruto\'s foot taps, very slightly.'],
    ],
    B: [
      ['b', 'Your people have no king?'], ['a', 'We\'ve got Great Bay. A marine lab. A hall full of Zora who just want to play music.'],
      ['b', 'In Zora\'s Domain, we serve Lord Jabu-Jabu and the King. Everything is ceremony.'],
      ['a', 'Sounds stiff.'], ['b', 'It is dignified!'], ['a', 'Dignified and stiff.'],
      ['b', 'Hmph. I suppose a little music would not hurt the Domain.'],
    ],
    A: [
      ['a', 'You know, Princess, you\'ve got a good voice. I heard you singing on watch.'], ['b', 'You heard nothing!'],
      ['a', 'You hit a high note on that old Zora hymn. Want to try it with a beat?'],
      ['n', 'Ruto hesitates, then sings. Mikau joins on guitar, and the soldiers nearby go silent to listen.'],
      ['b', '…That was rather wonderful.'], ['a', 'See? Ceremony and rock can get along.'], ['b', 'Just this once.'],
    ],
  },
  // a = lulu, b = ruto
  'lulu|ruto': {
    C: [
      ['b', 'You\'re Lulu. The singer the soldiers keep sighing over.'], ['a', 'Oh. I\'m sorry.'],
      ['b', 'Don\'t apologize! Hold your head up. You\'re a Zora.'], ['a', 'I… I\'ll try.'],
      ['n', 'Lulu lifts her chin a fraction. Ruto nods approvingly.'],
    ],
    B: [
      ['b', 'Why are you always staring out at the water?'], ['a', 'Once, pirates stole my eggs. I lost my voice until they came back.'],
      ['b', 'Your eggs! How dreadful.'], ['a', 'A boy brought them home. And Mikau tried, before him.'],
      ['b', 'I see.'], ['n', 'Ruto sits beside her, which for Ruto is a significant gesture.'], ['b', 'I\'ll stand watch with you, then.'],
    ],
    A: [
      ['a', 'Ruto, how are you so bold? You just say exactly what you think.'], ['b', 'Because I\'m a princess. And because I\'m right.'],
      ['a', 'Always?'], ['b', 'Mostly. When I\'m wrong, I say that too. Loudly.'], ['n', 'Lulu laughs, softly but truly.'],
      ['a', 'I think I\'d like to be a little more like you.'], ['b', 'And I a little more like you. Graceful. Don\'t tell anyone.'],
    ],
  },
  // a = ralis, b = ruto
  'ralis|ruto': {
    C: [
      ['b', 'You\'re the Zora prince of the future? Stand up straight!'], ['a', 'S-sorry, Princess Ruto. I didn\'t mean to slouch.'],
      ['b', 'And don\'t apologize for everything!'], ['a', 'Sorry. I mean—'], ['n', 'Ruto sighs dramatically.'], ['b', 'This will take work.'],
    ],
    B: [
      ['b', 'When you speak to your people, what do you say?'], ['a', 'I… I ask what they think we should do.'],
      ['b', 'Asking is fine. Then you must decide. Out loud. As if you meant it.'], ['a', 'What if I\'m wrong?'],
      ['b', 'Then you will be wrong with conviction, and fix it with conviction.'], ['a', 'That sounds terrifying.'],
      ['b', 'It is! That\'s why so few do it well.'],
    ],
    A: [
      ['a', 'Princess. I gave an order today. To the Zora scouts. They followed it.'], ['b', 'And?'],
      ['a', 'It was a good order. They found the enemy\'s flank.'], ['b', 'Of course they did. I trained you.'],
      ['n', 'Ralis smiles, for once without looking at the ground.'], ['a', 'My mother would have been proud.'],
      ['b', 'She would. And so am I, though you shouldn\'t expect me to say it twice.'],
    ],
  },
  // a = rutela, b = ruto
  'rutela|ruto': {
    C: [
      ['a', 'Princess Ruto. The Sage of Water. Your name is still sung in our Domain.'], ['b', 'Is it? Naturally.'],
      ['a', 'You are as proud as the songs say.'], ['b', 'And you are a queen! Of the Zora? With no king?'],
      ['a', 'My husband passed. I ruled for my son, until I passed too.'], ['n', 'Ruto is silent, unusually.'],
    ],
    B: [
      ['b', 'Do you still worship Lord Jabu-Jabu, in your age?'], ['a', 'He is gone. But we remember the old fountain.'],
      ['b', 'Gone! Who did the Zora sapphire go to, then?'], ['a', 'It was given to a hero, long ago. As a pledge of marriage, I believe.'],
      ['n', 'Ruto goes slightly pink.'], ['b', 'Well. That pledge was perfectly binding.'], ['a', 'So the songs say.'],
    ],
    A: [
      ['a', 'My reign was short. I fear I left my son too little guidance.'], ['b', 'Ralis is soft. But he listens.'],
      ['a', 'You have been teaching him.'], ['b', 'Someone must. The Zora need a king, not a wilting kelp frond.'],
      ['a', 'Then I am grateful, Sage. You carry what I could not.'], ['n', 'Ruto lifts her chin.'],
      ['b', 'Traditions are stronger when the royals help one another. Even across centuries.'],
    ],
  },
  // a = kingZora, b = ralis
  'kingZora|ralis': {
    C: [
      ['a', 'Mo-ho… young prince of the future Domain. Come closer, I move slowly.'], ['b', 'Your Majesty. I\'ve read about you.'],
      ['a', 'Splendid! What did you read?'], ['b', 'That you… spent a long time sitting on the throne.'],
      ['a', 'Mo-ho! It is a very good throne.'], ['n', 'King Zora wiggles, delighted.'],
    ],
    B: [
      ['a', 'A king must be patient. The water does not rush. It shapes the stone slowly.'], ['b', 'I am very patient.'],
      ['a', 'Yes. But you must also be like the waterfall, sometimes. Loud.'], ['b', 'Loud?'],
      ['a', 'When the Domain froze in my age, there was no time for patience. Only action.'], ['b', 'What did you do?'],
      ['a', 'I… became a statue of ice. Not my finest hour. Mo-ho.'],
    ],
    A: [
      ['b', 'I want to be a good king. But I\'m afraid my people will see a sick little boy.'], ['a', 'Is that what you see?'],
      ['b', 'Sometimes.'], ['a', 'I see a prince who stands at the front of battle beside Hylians and Gorons.'],
      ['n', 'Ralis looks up.'], ['a', 'That is what your people will see, little one. Trust them to.'],
      ['b', 'Thank you, Your Majesty.'], ['a', 'Mo-ho! Now help me up. I have been sitting a long time.'],
    ],
  },
  // a = kingZora, b = rutela
  'kingZora|rutela': {
    C: [
      ['a', 'Mo-ho! A queen of the Zora! Of the future!'], ['b', 'Your Majesty. You are much as the old portraits show.'],
      ['a', 'Majestic?'], ['b', 'Large.'], ['a', '…Mo-ho. That too.'],
    ],
    B: [
      ['b', 'In my day, the Domain moved upriver. The lake changed. Our people dwindled.'], ['a', 'Dwindled? How?'],
      ['b', 'War. Sickness. Our children fewer each generation.'], ['n', 'King Zora is quiet for a long while.'],
      ['a', 'Then my Domain must grow strong now, so yours may survive.'], ['b', 'It may already have.'],
    ],
    A: [
      ['a', 'Tell me. What future do you want for our people?'], ['b', 'One where my son reigns long. Where the waters stay clean.'],
      ['a', 'And where the Zora are not alone.'], ['b', 'Yes. Gorons, Hylians, even the bird folk. Allies.'],
      ['a', 'Mo-ho. Then we shall start here, in this army. Across all our ages.'],
      ['n', 'The two monarchs bow, one stiffly and one with great effort.'], ['b', 'For the Zora.'], ['a', 'For the Zora!'],
    ],
  },
  // a = mikau, b = ralis
  'mikau|ralis': {
    C: [
      ['a', 'Hey, little prince. You look like you need a song.'], ['b', 'Do I? I mean, um. Yes, maybe.'],
      ['a', 'What\'s up?'], ['b', 'Everyone keeps telling me how to be a king. Like my mother. Like King Zora.'],
      ['a', 'And what do you want to be?'], ['n', 'Ralis stares at him blankly.'], ['b', 'Nobody\'s ever asked me that.'],
    ],
    B: [
      ['a', 'Okay. You don\'t know who you are yet. That\'s fine. Pick something up.'], ['n', 'He hands Ralis a guitar.'],
      ['b', 'I don\'t know how.'], ['a', 'Neither did I. Strum.'], ['n', 'Ralis strums. It\'s terrible. Mikau grins.'],
      ['a', 'That sound? Nobody else makes that sound. That\'s you.'], ['b', 'That\'s a very bad sound.'], ['a', 'For now.'],
    ],
    A: [
      ['b', 'Mikau. I wrote something. A song. About the Zora river.'], ['a', 'Let\'s hear it.'],
      ['n', 'Ralis plays a few shaky bars. It is simple, but it is entirely his own.'],
      ['a', 'That, prince, is a king\'s song. Not your mother\'s. Not anyone\'s. Yours.'],
      ['b', 'You really think so?'], ['a', 'I know so. Lead like you play that. From the heart.'],
    ],
  },
  // a = medli, b = mikau
  'medli|mikau': {
    C: [
      ['a', 'Oh! You play an instrument? It\'s shaped like a fish skeleton!'], ['b', 'It\'s a guitar. You\'ve got a harp, right?'],
      ['a', 'A lyre! I\'m the attendant to Valoo. I play during the ceremony.'], ['b', 'Valoo? Who\'s that?'],
      ['a', 'The sky spirit. A dragon.'], ['b', 'Whoa. Our audience was mostly drunk sailors.'],
    ],
    B: [
      ['b', 'Play that ceremony song.'], ['n', 'Medli plays. Mikau listens intently, then answers on guitar with the same melody in a lower key.'],
      ['a', 'You knew that song!'], ['b', 'No. It just sounded… like a Zora song. Like something I\'ve always known.'],
      ['a', 'The elders say the Rito were Zora, long ago.'], ['b', 'Then maybe the melody remembered even if we didn\'t.'],
    ],
    A: [
      ['a', 'I\'ve been writing out both songs side by side. Look!'], ['b', 'Same notes, different time signatures.'],
      ['a', 'Our people flew. Yours swam. But the song never changed.'], ['b', 'Music outlives everything, huh?'],
      ['n', 'They play the duet through, and a passing Rito scout stops dead in the air to listen.'],
      ['a', 'We should play it for everyone.'], ['b', 'Indigo-Go\'s and the Rito. I like it.'],
    ],
  },
  // a = laruto, b = mikau
  'laruto|mikau': {
    C: [
      ['b', 'Hey. You\'re a Zora, but you look really… old school.'], ['a', 'I am the Sage of the Earth Temple. Laruto. From a Hyrule long gone.'],
      ['b', 'I\'m from Termina. Great Bay.'], ['a', 'A sea I have never heard of. And you carry an instrument.'],
      ['b', 'Guitar. Rock music, mostly.'], ['n', 'Laruto smiles gently.'], ['a', 'I would hear it.'],
    ],
    B: [
      ['a', 'In my age, our songs were prayers. Each note was meant to wake the sacred and calm the restless.'], ['b', 'Ours wake people up.'],
      ['a', 'Then you understand more than you think. Play the Earth God\'s Lyric with me.'],
      ['n', 'She plays a slow melody on her harp. Mikau listens, then follows with a heavy, rolling bass line.'],
      ['a', 'Oh. That is… surprisingly holy.'], ['b', 'Told you, rock is spiritual.'],
    ],
    A: [
      ['a', 'When the flood came, I hoped the old songs would survive.'], ['b', 'They did. Medli knows them.'],
      ['a', 'And now you do as well.'], ['b', 'Never figured I\'d be a keeper of ancient Hyrule.'],
      ['a', 'You carry them forward, Mikau. Do not let them be still.'], ['n', 'Mikau slings the guitar over his shoulder.'],
      ['b', 'Every gig. Promise.'],
    ],
  },
  // a = lulu, b = medli
  'lulu|medli': {
    C: [
      ['b', 'Excuse me! You\'re the singer from Termina, aren\'t you?'], ['a', 'Yes. Lulu.'],
      ['b', 'I\'m Medli. I\'m an attendant. I play the harp for our sky spirit.'], ['a', 'A sky spirit… how lovely.'],
      ['n', 'They study one another, each a little shy.'], ['b', 'Would you… maybe sing for me sometime?'],
    ],
    B: [
      ['a', 'When my voice was gone, I could feel the sea calling. Waiting for me.'], ['b', 'The sea?'],
      ['a', 'Music is the voice of the sea, for the Zora. Without it, I was nobody.'],
      ['b', 'For the Rito, it\'s the voice of the sky. When I played in the Earth Temple, it woke the sleeping sage.'],
      ['a', 'Then our songs reach things beyond us.'], ['b', 'I think so. Isn\'t that wonderful?'],
    ],
    A: [
      ['n', 'At dusk, Lulu sings and Medli plays. The wounded in the healer\'s tent fall quiet and sleep.'],
      ['b', 'Did you see? They\'re resting.'], ['a', 'Music heals, sometimes. I didn\'t believe it until I sang again.'],
      ['b', 'Then we should do it every night.'], ['a', 'I would like that very much.'], ['b', 'Me too!'],
    ],
    S: [
      ['b', 'Lulu. I wrote something for us. A duet.'], ['a', 'For us?'],
      ['b', 'Zora melody, Rito harmony. The sea and the sky.'], ['n', 'Lulu reads the sheet, her fins trembling slightly.'],
      ['a', 'It\'s beautiful, Medli.'], ['b', 'It\'s ours. Wherever we end up after the war, we\'ll always have it.'],
      ['a', 'Then I\'ll sing it on the Great Bay, and you\'ll play it on Dragon Roost, and somehow we\'ll hear each other.'],
      ['b', 'Friends forever, across the water.'], ['a', 'Forever.'],
    ],
  },
  // a = laruto, b = lulu
  'laruto|lulu': {
    C: [
      ['a', 'Your voice is beautiful, child. It reminds me of the old temple choirs.'], ['b', 'Thank you. I learned only the songs of Great Bay.'],
      ['a', 'Would you like to learn the older ones?'], ['b', 'From… before Termina?'],
      ['a', 'From before the sea covered Hyrule.'], ['n', 'Lulu\'s eyes widen.'],
    ],
    B: [
      ['a', 'This melody was sung to the Zora goddess at the spring of each year.'], ['n', 'Laruto hums. Lulu echoes, hesitantly.'],
      ['a', 'Lower. Let the throat open.'], ['b', 'Like this?'], ['n', 'The note rings clear across the water.'],
      ['a', 'Yes. Exactly so.'], ['b', 'It feels so old.'], ['a', 'It is. And now, it is young again in you.'],
    ],
    A: [
      ['b', 'I sang your melody to the eggs I protect. They swam toward me when they heard it.'], ['a', 'They knew it.'],
      ['b', 'How? They\'ve never heard it before.'], ['a', 'Some songs live in the blood of a people. They wait to be called.'],
      ['n', 'Lulu clasps her hands to her chest.'], ['b', 'Then I\'ll sing them all. Every one you know.'],
      ['a', 'Then I shall teach you every one. You will carry them where I cannot.'],
    ],
  },
  // a = laruto, b = ruto
  'laruto|ruto': {
    C: [
      ['b', 'You\'re a Sage? A Zora Sage?'], ['a', 'Of the Earth Temple. Laruto.'],
      ['b', 'I\'m the Sage of Water! Ruto. Princess of the Zora!'], ['a', 'A princess and a Sage. You must be very busy.'],
      ['b', 'Extremely.'], ['n', 'Laruto looks politely amused.'],
    ],
    B: [
      ['a', 'When you awakened as Sage, what did you feel?'], ['b', 'That I had to stay in the Sacred Realm. Without my fiancé.'],
      ['a', 'Ah. A great sacrifice.'], ['b', 'Hmph. Duty is duty. What did you feel?'],
      ['a', 'That I would not live to see the flood\'s end. I passed my duty to a Rito girl, many years after me.'],
      ['b', 'A Rito?'], ['a', 'Our descendants, you might say.'], ['b', '…How strange. And rather lovely.'],
    ],
    A: [
      ['b', 'Is it lonely? Being a Sage, watching over people who never see you?'], ['a', 'It was. Then I heard Medli\'s harp.'],
      ['b', 'Then the duty doesn\'t end. It just changes hands.'], ['a', 'And the music keeps us company.'],
      ['n', 'Ruto takes Laruto\'s hand, a gesture of real warmth.'], ['b', 'Two Zora Sages. Sisters in duty.'],
      ['a', 'Sisters in duty. I\'m glad to have met you, Princess.'],
    ],
  },
  // a = medli, b = ruto
  'medli|ruto': {
    C: [
      ['b', 'You! Bird girl! Are you aware you have Zora fins on your arms?'], ['a', 'Oh! Um. Those are wings.'],
      ['b', 'They look like fins.'], ['a', 'The elders say we Rito were Zora once, a long time ago.'],
      ['b', 'Zora? Flying?'], ['n', 'Ruto circles Medli, examining her critically.'], ['b', 'Well, I suppose I see the resemblance.'],
    ],
    B: [
      ['b', 'Why did you stop swimming?'], ['a', 'When the sea came, the Zora had to change or vanish. We grew wings to live on the islands.'],
      ['b', 'And you gave up the water?'], ['a', 'Mostly. I can\'t swim very well.'], ['b', 'Unthinkable! I\'ll teach you!'],
      ['n', 'Ten minutes later, Medli bobs in the river, flapping. Ruto shouts encouragement from the bank.'],
    ],
    A: [
      ['a', 'Ruto, I think I understand now. The Zora didn\'t disappear. They just flew.'], ['b', 'Hmph. Of course they didn\'t disappear.'],
      ['a', 'Your people are part of mine.'], ['b', 'Then you, bird girl, are part Zora royalty.'],
      ['a', 'Really?'], ['b', 'Distantly. Very distantly. Don\'t get ideas.'],
      ['n', 'Medli giggles, and Ruto pretends to be annoyed.'], ['b', 'Fine. You may call me cousin.'],
    ],
  },
  // a = komali, b = ralis
  'komali|ralis': {
    C: [
      ['a', 'You\'re a prince too? You don\'t look like a prince.'], ['b', 'Neither do you. No offense.'],
      ['a', 'None taken. I couldn\'t even fly until recently.'], ['b', 'I couldn\'t breathe properly until recently.'],
      ['n', 'They look at each other for a moment.'], ['a', 'Huh. So you\'re sickly too?'], ['b', 'Used to be.'],
    ],
    B: [
      ['a', 'My grandmother died, and I locked myself in my room for months. Didn\'t talk to anyone.'], ['b', 'My mother died, and I was ill in a stranger\'s house.'],
      ['a', 'Did people think you were weak?'], ['b', 'Yes.'], ['a', 'Me too.'],
      ['b', 'But we\'re still here. Fighting with this army.'], ['n', 'Komali nods, and for once his chin stays up.'],
    ],
    A: [
      ['b', 'How do you talk to your people? I get so nervous I forget what I mean.'],
      ['a', 'I just tell them what I\'m scared of. Then what I\'m going to do anyway.'],
      ['b', 'That\'s brave.'], ['a', 'Somebody with a sword taught me that.'], ['b', 'Mine too. A boy in green.'],
      ['a', 'There\'s a lot of those.'], ['n', 'They both laugh at that.'],
    ],
    S: [
      ['a', 'Ralis. When I\'m chieftain and you\'re king, let\'s make a treaty.'], ['b', 'A treaty?'],
      ['a', 'Zora and Rito. Allies. Forever. Like back when we were the same people.'],
      ['b', 'Our worlds aren\'t even the same world.'], ['a', 'Then we\'ll make the treaty between us. Prince to prince.'],
      ['n', 'They clasp hand to wing.'], ['b', 'Friends. And allies.'], ['a', 'Brothers, almost.'], ['b', 'Almost? Just brothers.'],
    ],
  },
  // a = laruto, b = rutela
  'laruto|rutela': {
    C: [
      ['a', 'Queen Rutela. I sense you, as I sensed you on the water before you spoke.'], ['b', 'And I, you, Sage Laruto. We are both… shadows of the departed.'],
      ['a', 'Spirits, yes. Lingering for those who come after.'], ['b', 'Then we have that in common.'],
      ['n', 'Both women\'s forms shimmer faintly at the edges, like light through water.'],
    ],
    B: [
      ['b', 'I appeared to a Hylian boy as a ghost and begged him to save my son.'], ['a', 'And did he?'],
      ['b', 'He did. And then I gave him armor so he could breathe beneath the lake.'],
      ['a', 'I waited centuries in my temple for a Rito girl to wake me. I taught her the song before I faded.'],
      ['b', 'We guide from the edges.'], ['a', 'We guide, and then we let go.'],
    ],
    A: [
      ['b', 'Is it hard for you? Letting go?'], ['a', 'Every time. Each new generation feels like a child I\'ll never hold again.'],
      ['b', 'Ralis is growing. He will not need me much longer.'], ['a', 'Then you have done your duty well.'],
      ['n', 'Rutela looks across camp, to where her son is laughing with a Rito prince.'], ['b', 'Yes. I suppose I have.'],
      ['a', 'Then rest easy, Queen of Zora.'], ['b', 'And you, Sage.'],
    ],
  },
  // a = jabuJabu, b = jabun
  'jabuJabu|jabun': {
    C: [
      ['n', 'Lord Jabu-Jabu floats in the deep lake water beside camp. Across the shore, the great fish Jabun surfaces with a low groan.'],
      ['b', 'Ancient one. You are the guardian I have heard of in old tales. The Zora god.'],
      ['a', 'Booo…'], ['n', 'Jabu-Jabu gapes slowly. A small cloud of bubbles rises to the surface.'],
      ['b', 'I am Jabun. I too carry a pearl for the gods.'],
    ],
    B: [
      ['n', 'At night the two huge creatures circle each other in the lake, slow and curious, their shapes long and dark beneath the moon.'],
      ['b', 'You do not speak, ancient one. Yet you listen.'], ['a', 'Booo.'],
      ['b', 'In my age, Hyrule is beneath a sea. I hid in a cave beneath an island. I waited for a hero.'],
      ['n', 'Jabu-Jabu sinks gently until only his eyes remain above the water.'],
    ],
    A: [
      ['b', 'The Zora fed you once. They served you as a god. Your Zora became my Rito.'],
      ['n', 'Jabu-Jabu\'s fins drift up and down, a gesture almost like a nod.'],
      ['b', 'They flew away, but they kept your memory. They keep it still, though they don\'t know it.'],
      ['a', 'Booo…'], ['b', 'Yes. It is sad. And beautiful.'],
    ],
    S: [
      ['n', 'At dawn, Jabun drifts close and opens his great jaws. Inside, Nayru\'s Pearl gleams in the half light.'],
      ['b', 'This was entrusted to me by the goddess. I wish you to see it.'],
      ['n', 'Jabu-Jabu stares at the pearl a long time, then opens his own mouth. In memory, a sapphire glimmers there.'],
      ['a', 'Booo.'], ['b', 'Two guardians. Two treasures. One duty.'],
      ['n', 'The great fish swim side by side until the sun is high, and the Zora soldiers on shore stand in silent awe.'],
    ],
  },
  // a = jabuJabu, b = giantTurtle
  'giantTurtle|jabuJabu': {
    C: [
      ['n', 'The Giant Turtle lumbers into the lake shallows. Lord Jabu-Jabu surfaces nearby, cheeks puffed.'],
      ['a', 'A great fish, swollen with the waters of a kingdom. Greetings.'], ['b', 'Booo.'],
      ['a', 'You do not speak. Very well. I am old enough to understand silence.'],
    ],
    B: [
      ['a', 'I have carried heroes across the Great Bay to the temple where the waters turn.'], ['b', 'Booo.'],
      ['n', 'Jabu-Jabu opens his mouth wide, showing the deep tunnel of his belly.'],
      ['a', 'Ah. You have carried heroes as well. Inside you. Hmm. That is different.'],
      ['b', 'Booo…'], ['a', 'Yes. Uncomfortable for them, I am sure.'],
    ],
    A: [
      ['a', 'The waters we each know will change. Lakes become seas. Seas become ice.'], ['b', 'Booo.'],
      ['a', 'We were not made to stop it. Only to carry the small ones through.'],
      ['n', 'Jabu-Jabu drifts closer, resting his fin against the turtle\'s shell.'],
      ['a', 'You understand. Good. We are old friends now, I think.'], ['b', 'Booo.'],
    ],
  },
  // a = jabun, b = lanayru
  'jabun|lanayru': {
    C: [
      ['b', 'Great fish. I am Lanayru, spirit of light, guardian of the waters of Hyrule.'], ['a', 'I am Jabun. I guarded a pearl, beneath a drowned Hyrule.'],
      ['b', 'Drowned?'], ['a', 'In my age, the waters of the gods covered all. Your springs, your lake. Everything.'],
      ['n', 'The light spirit\'s glow flickers.'],
    ],
    B: [
      ['b', 'I have guarded Lake Hylia from the Twilight. Its waters flow from my spring to every corner of the kingdom.'],
      ['a', 'And I have watched those same waters swallow it whole.'], ['b', 'Then we are two faces of the same water.'],
      ['a', 'A giver of life and a bearer of loss.'], ['b', 'Both are sacred.'],
    ],
    A: [
      ['a', 'Lanayru. If your waters must one day become the sea I knew, will you mourn?'],
      ['b', 'I will mourn. And I will remain. Water does not abandon the land it covers.'],
      ['a', 'Nor did I. I waited for the hero beneath the island.'], ['b', 'Then we guard, whatever the shape of the world.'],
      ['n', 'The light spirit lowers its head, and the great fish bows in return.'], ['a', 'Guardian.'], ['b', 'Guardian.'],
    ],
  },
  // a = morpha, b = morpheel
  'morpha|morpheel': {
    C: [
      ['n', 'A single tendril of water rises from the lake. Morpha\'s nucleus pulses red inside it.'],
      ['n', 'Across the bay, Morpheel lifts its great jaws above the waves and stares.'],
      ['a', 'Shlrrrp.'], ['b', 'GRRRAAOOH!'],
      ['n', 'The soldiers on watch decide that both sides of the lake are off limits tonight.'],
    ],
    B: [
      ['n', 'Morpha shapes the water into a towering column. Morpheel answers with a lunge that throws waves over the dock.'],
      ['n', 'Neither yields. The fishing nets of three Zora scouts are swept away in the crossfire.'],
      ['a', 'Shlrrp!'], ['b', 'Grrrrrk.'],
      ['n', 'They retreat to their respective corners, sulking in the deep.'],
    ],
    A: [
      ['n', 'One night an enemy squadron tries to cross the lake. The water rises; the jaws open.'],
      ['n', 'A column of water lifts the boats; Morpheel\'s bulk smashes them apart. In moments the lake is quiet again.'],
      ['a', 'Shlrrp.'], ['b', 'Grrr.'],
      ['n', 'The two monsters drift apart, but not as far as before. The lake is big enough for both, after all.'],
    ],
  },
  // a = gyorg, b = morpheel
  'gyorg|morpheel': {
    C: [
      ['n', 'A sleek shark-like shape circles the deep water beneath the floating camp platforms. Gyorg.'],
      ['n', 'Morpheel\'s glowing eye opens on the lakebed. It does not like what it sees.'],
      ['a', 'Ssshhkk!'], ['b', 'GRRRAAAH!'],
    ],
    B: [
      ['n', 'At feeding time, both monsters lunge for the same school of fish. They collide in a burst of foam.'],
      ['n', 'Gyorg snaps; Morpheel coils. The army\'s fishermen take shelter behind a rock.'],
      ['a', 'Ssssk!'], ['b', 'Grrrrk!'],
      ['n', 'Gyorg emerges with most of the fish. Morpheel emerges with most of Gyorg\'s pride.'],
    ],
    A: [
      ['n', 'A summer storm stirs up an army of Tektites on the shore. The two monsters surface at once, side by side.'],
      ['n', 'They share the hunt without a single collision, Gyorg herding, Morpheel snapping shut.'],
      ['a', 'Ssshk.'], ['b', 'Grrh.'],
      ['n', 'From then on, the Zora soldiers notice the two predators patrolling the lake in a single wide circle.'],
    ],
  },
};
