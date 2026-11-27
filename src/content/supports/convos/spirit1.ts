// Support conversations: Spirit Tracks (part 1: the pack's own pairs and Big Blin). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  // ── Spirit Tracks: internal ──
  'heroOfSpirits|zeldaST': {
    C: [
      ['n', 'Zelda’s spirit drifts beside the Spirit Train’s cab while Link checks the pressure gauge.'],
      ['b', 'You’re tapping that dial again. Is it broken, or are you just nervous?'],
      ['a', 'It sticks. You tap it, it tells the truth.'],
      ['b', 'Hmm. I wish people worked like that. Tap the chancellor, he confesses everything.'],
      ['a', 'I’d tap him pretty hard.'],
      ['b', 'Ha! Now you’re talking like a hero. Full steam ahead, engineer.'],
    ],
    B: [
      ['b', 'Can I tell you something embarrassing? I’ve never actually ridden a train before all this.'],
      ['a', 'Never? You live next to the biggest station in New Hyrule.'],
      ['b', 'Princesses are supposed to wave at trains, not ride them. Teacher said it was undignified.'],
      ['a', 'Want to blow the whistle?'],
      ['b', 'I have no hands, Link. I’m a ghost.'],
      ['a', 'Then I’ll pull it. You tell me when.'],
      ['n', 'Zelda shouts “Now!” at the worst possible moment. Every bird in the Forest Realm takes flight. She laughs for a full minute.'],
    ],
    A: [
      ['n', 'After a hard fight, Zelda floats in silence beside the dying campfire.'],
      ['b', 'When I saw my own body walking around with Cole, it was like looking at a stranger wearing my face.'],
      ['a', 'We’ll get it back.'],
      ['b', 'You say that like it’s a delivery. “Princess body, one, to Hyrule Castle.”'],
      ['a', 'I’ve never missed a delivery.'],
      ['b', '…You really haven’t, have you. All right. I’ll hold you to it, engineer.'],
    ],
    S: [
      ['n', 'At the end of the line, the tracks shine in the evening light. Zelda stands on them, in her own body at last.'],
      ['b', 'I can feel the rails under my feet. Isn’t that silly? It’s the best thing I’ve felt in ages.'],
      ['a', 'It’s not silly.'],
      ['b', 'Link… when this is over, I don’t want to go back to waving at trains from a window.'],
      ['a', 'Then don’t. Ride up front. With me.'],
      ['b', 'Is that an engineer’s offer or a hero’s?'],
      ['a', 'Mine.'],
      ['n', 'Zelda takes his hand, and for once neither of them has a clever thing to say.'],
    ],
  },
  'alfonzo|heroOfSpirits': {
    C: [
      ['a', 'Feet wider. You swing a sword the way you shovel coal: all shoulders.'],
      ['b', 'Coal doesn’t fight back.'],
      ['a', 'Neither will the Phantoms, if you do it right. Again.'],
      ['n', 'Link swings. Alfonzo grunts, which from him is high praise.'],
    ],
    B: [
      ['b', 'You were a royal swordsman. Why did you become an engineer?'],
      ['a', 'Swords break things. Engines carry people where they need to go. Got tired of breaking.'],
      ['b', 'But you’re fighting again now.'],
      ['a', 'Somebody has to keep you alive long enough to get your certificate framed.'],
    ],
    A: [
      ['a', 'That counter you pulled on the Torch Phantom. Where’d you learn that?'],
      ['b', 'From you. You did it to me every morning for a year.'],
      ['a', 'Hah. So you were watching and not just falling over.'],
      ['b', 'Both.'],
      ['a', 'That’s how everybody learns, kid. I’m proud of you. Don’t let it go to your head.'],
    ],
    S: [
      ['n', 'Alfonzo hands Link a battered wrench, its grip worn smooth by years of use.'],
      ['a', 'Had this since my first engine. Built half the line out of Aboda with it.'],
      ['b', 'Alfonzo, I can’t take this.'],
      ['a', 'You can and you will. A sword and a wrench. A real Royal Engineer carries both.'],
      ['b', 'Then you carry mine. My first sword. It’s terrible.'],
      ['a', '…It is terrible. I’ll treasure it.'],
    ],
  },
  'elderNiko|heroOfSpirits': {
    C: [
      ['a', 'Did I ever tell you about the time I was swallowed by a giant bird?'],
      ['b', 'Six times.'],
      ['a', 'Then this is lucky number seven! Sit, sit.'],
      ['n', 'Link sits. He would never admit it, but it’s his favourite story.'],
    ],
    B: [
      ['a', 'You remind me of him, you know. The boy in green. Same stubborn chin.'],
      ['b', 'The Hero of Winds? Was he really real?'],
      ['a', 'Real as these old knees! He climbed the rope swings better than any pirate. I fell off. Often.'],
      ['b', 'You were a pirate?'],
      ['a', 'A very junior one. I swabbed. I swabbed with great courage.'],
    ],
    A: [
      ['a', 'When he left, he went looking for a new land. I think he found it. I think you’re standing on it.'],
      ['b', 'New Hyrule…'],
      ['a', 'Built by the folk who sailed with him. So every rail you mend, my boy, you’re finishing his story.'],
      ['b', 'Then I’d better not mess it up.'],
      ['a', 'You won’t. I can always tell the ones who won’t.'],
    ],
    S: [
      ['n', 'Niko presses his Stamp Book into Link’s hands. Every page is full.'],
      ['a', 'I started that book to remember every place I’d been. Now it’s yours.'],
      ['b', 'Niko, these are your memories.'],
      ['a', 'And they’ll go on travelling. That’s all an old storyteller wants: for the tale not to stop at him.'],
      ['b', 'I’ll tell it right. Swallowed by a bird and everything.'],
      ['a', 'Lucky number seven!'],
    ],
  },
  'byrne|heroOfSpirits': {
    C: [
      ['a', 'You fight like someone who has never been taught properly.'],
      ['b', 'I was taught by an engineer.'],
      ['a', 'It shows. Your guard is low and your heart is on your sleeve.'],
      ['b', 'It’s kept me alive.'],
      ['a', '…For now.'],
    ],
    B: [
      ['a', 'Why do you keep standing next to me? I tried to kill you.'],
      ['b', 'You also stopped trying.'],
      ['a', 'That is not the same as being a friend.'],
      ['b', 'It’s a start.'],
    ],
    A: [
      ['a', 'Anjean taught me everything she knew, and I wanted more. I wanted to be a god.'],
      ['b', 'What do you want now?'],
      ['a', 'To be forgiven. Which is harder, I think.'],
      ['b', 'Then keep fighting with us. That’s how you start.'],
      ['n', 'Byrne looks at his great clawed gauntlet for a long time, then nods once.'],
    ],
  },
  'ferrus|heroOfSpirits': {
    C: [
      ['a', 'Hold still! The light is hitting the boiler just right!'],
      ['b', 'We’re in the middle of a battle.'],
      ['a', 'Which makes it historic! Click!'],
    ],
    B: [
      ['a', 'Did you know there’s an old branch line behind the Snow Realm that isn’t on any map?'],
      ['b', 'How do you know that?'],
      ['a', 'I walked it. With my camera. For three days. In the snow.'],
      ['b', 'That’s amazing. And a little worrying.'],
    ],
    A: [
      ['a', 'Link, can I tell you something? I always wanted to be an engineer. I failed the exam.'],
      ['b', 'You know more about rails than anyone I’ve met.'],
      ['a', 'Knowing isn’t driving. I panic at the whistle.'],
      ['b', 'Then ride with me. I’ll drive. You navigate.'],
      ['a', 'Really? I— I’ll bring the maps! All of them!'],
    ],
  },
  'heroOfSpirits|linebeck3': {
    C: [
      ['b', 'A Ruto Crown! Kid, I’ll give you three hundred Rupees for it. Final offer.'],
      ['a', 'Niko says it’s worth eight hundred.'],
      ['b', 'Niko is a lovely old man who has never run a shop. Three fifty.'],
    ],
    B: [
      ['b', 'My grandfather was a treasure hunter, you know. Famous. Brave. Mostly.'],
      ['a', 'Mostly?'],
      ['b', 'He said he hid behind a barrel once. Strategically. The family doesn’t talk about it.'],
      ['a', 'Sounds like a good man.'],
      ['b', '…He was, actually. Don’t tell anyone I said that, it’s bad for business.'],
    ],
    A: [
      ['b', 'You know what the best treasure I ever found was? Grandpa’s old compass. Points to whoever you’re thinking of.'],
      ['a', 'Who does it point to for you?'],
      ['b', 'Lately? Your silly train. Which is very inconvenient for a shopkeeper.'],
      ['a', 'You could come with us for good.'],
      ['b', 'For a modest fee. A very modest fee. Fine. Free. Don’t make it weird.'],
    ],
  },
  'anjean|zeldaST': {
    C: [
      ['a', 'Princess. You float too close to the Phantoms. A spirit is not invulnerable.'],
      ['b', 'I know, Anjean. But they’re slow, and I’m very brave.'],
      ['a', 'Brave and careless sit side by side on the same bench, child.'],
    ],
    B: [
      ['b', 'Did my ancestors really make a pact with the Lokomo?'],
      ['a', 'They did. Your bloodline carries the light that sealed Malladus. That is why he wanted your body.'],
      ['b', 'So I’m a lock. A pretty, talking lock.'],
      ['a', 'You are a guardian. Locks do not choose to keep the door shut. Guardians do.'],
    ],
    A: [
      ['b', 'Anjean, what if I’m not strong enough when it matters?'],
      ['a', 'I have watched a hundred years of your family. None of them were strong enough alone.'],
      ['b', 'That’s not comforting.'],
      ['a', 'It should be. You are not alone. That has always been the secret.'],
    ],
    S: [
      ['n', 'Anjean places a small sacred gem in Zelda’s hands.'],
      ['a', 'When the Spirit Tracks are whole again, my watch ends. Someone must remember the songs.'],
      ['b', 'Me? I can barely play the panpipes.'],
      ['a', 'Then practise. You have a whole kingdom of listeners.'],
      ['b', 'Will you come and hear me play?'],
      ['a', 'I would not miss it. Even if you are dreadful at first.'],
    ],
  },
  'alfonzo|zeldaST': {
    C: [
      ['b', 'Alfonzo! You used to guard my father’s doors, didn’t you?'],
      ['a', 'I did, Princess. Then I guarded engines. Engines complain less.'],
      ['b', 'I do not complain.'],
      ['a', 'With respect, Your Highness, you complained about the soup for three whole days.'],
    ],
    B: [
      ['a', 'Why’d you sneak out to see the engineers’ ceremony? You weren’t supposed to.'],
      ['b', 'Because I wanted to meet people who actually do things. Everyone at court just bows.'],
      ['a', 'Well, you met one. He’s mostly soot.'],
      ['b', 'Best decision I ever made.'],
    ],
    A: [
      ['a', 'I left the guard because I thought I’d failed the royal family. A long time ago.'],
      ['b', 'Failed how?'],
      ['a', 'Wasn’t fast enough once. Doesn’t matter what happened. It matters I swore it wouldn’t again.'],
      ['b', 'You haven’t failed me, Alfonzo. Not once.'],
    ],
    S: [
      ['b', 'When I’m queen, I want you to train the new guard.'],
      ['a', 'I’m an engineer now, Highness.'],
      ['b', 'Then train them to fix trains too. Swords and wrenches. Your idea.'],
      ['a', '…The kid told you about the wrench.'],
      ['b', 'He tells me everything. Will you?'],
      ['a', 'For you, Princess? I’ll even polish my old helmet.'],
    ],
  },
  'byrne|zeldaST': {
    C: [
      ['b', 'You helped Cole take my body.'],
      ['a', 'I did. I will not insult you with excuses.'],
      ['b', 'Good. Because I don’t want excuses. I want you to help me take it back.'],
    ],
    B: [
      ['a', 'Why did you not let the Lokomo seal me away when you had the chance?'],
      ['b', 'Because Anjean still talks about you like you’re her student. Not her enemy.'],
      ['a', 'She is a sentimental old woman.'],
      ['b', 'She’s the wisest person I know. So maybe she’s right.'],
    ],
    A: [
      ['a', 'When Malladus struck, I stood in front of you. I do not know why.'],
      ['b', 'I do. You’re better than you wanted to be.'],
      ['a', 'That is a strange thing to be told by the person I wronged.'],
      ['b', 'Then let me say it again until you believe it.'],
    ],
  },
  'cole|zeldaST': {
    C: [
      ['a', 'Princess! Floating about without your body? How dreadfully informal.'],
      ['b', 'You stole it, you horrible little man!'],
      ['a', 'Borrowed. I always return what I borrow. Eventually. Usually to a demon.'],
    ],
    B: [
      ['b', 'You served at court for years. My father trusted you.'],
      ['a', 'Your father trusted the hat. People always trust a good hat.'],
      ['b', 'I liked you once. You did magic tricks at my birthday.'],
      ['a', '…That was a good trick. The doves. I— never mind.'],
    ],
    A: [
      ['a', 'Do you know why I wanted Malladus back? Because the Lokomo sealed my kind away and called it peace.'],
      ['b', 'So you’d have let him burn New Hyrule.'],
      ['a', 'I would have. I can’t pretend otherwise, Princess.'],
      ['b', 'Then don’t pretend. Just choose differently now. That’s all anyone gets.'],
    ],
  },
  'malladus|zeldaST': {
    C: [
      ['a', 'Your body made a fine vessel, little princess. Warm. Strong.'],
      ['b', 'You are not getting it back.'],
      ['a', 'I do not want it. Too much light. It gave me a headache.'],
    ],
    B: [
      ['b', 'When you wore me, I could feel your rage. Why are you so angry?'],
      ['a', 'A hundred years under a tower. Would you not be angry?'],
      ['b', 'I would. But I wouldn’t take it out on a whole kingdom.'],
      ['a', 'Then you are smaller than I am. Or wiser. I have not decided.'],
    ],
    A: [
      ['b', 'Some nights I still dream your dreams. Fire, and the dark.'],
      ['a', 'Possession leaves marks, girl. On both of us.'],
      ['b', 'On you?'],
      ['a', 'I dream of a garden. Your garden. I loathe it. …I keep returning to it.'],
    ],
  },
  'anjean|byrne': {
    C: [
      ['a', 'Your guard has grown sloppy, Byrne.'],
      ['b', 'My guard was fine for a century, Master.'],
      ['a', 'A century of watching. Not of being watched. Lift the gauntlet higher.'],
    ],
    B: [
      ['b', 'You never asked why I left.'],
      ['a', 'I knew why. You wanted to stand beside the Spirit Gods, not beneath them.'],
      ['b', 'And you think that was wrong.'],
      ['a', 'I think it was lonely. Ambition usually is.'],
    ],
    A: [
      ['b', 'Malladus promised me power, and gave me nothing but shame.'],
      ['a', 'Demons are generous with promises.'],
      ['b', 'You were generous with lessons. I did not listen to half of them.'],
      ['a', 'Then listen now. There is still time to learn the other half.'],
    ],
    S: [
      ['n', 'Anjean and Byrne sit at the foot of the Tower, watching the trains below.'],
      ['b', 'When I am gone, will you tell the others I came back?'],
      ['a', 'You will tell them yourself. I forbid you to be gone.'],
      ['b', 'You cannot forbid that, Master.'],
      ['a', 'I am very old and very stubborn. Watch me.'],
      ['n', 'For the first time in a century, Byrne laughs.'],
    ],
  },
  'anjean|gage': {
    C: [
      ['b', 'The trees in the Forest Realm are sick, Anjean. They droop when the tracks fade.'],
      ['a', 'Then we mend the tracks. Play, Gage. The forest listens to your cello.'],
      ['b', 'It listens better when I’m not nervous.'],
    ],
    B: [
      ['a', 'You hold the bow too tightly. You always have.'],
      ['b', 'If I loosen up, the notes wobble.'],
      ['a', 'Wobbling notes are alive. The forest is alive. Let them wobble.'],
    ],
    A: [
      ['b', 'Do you ever miss the old days, before the tracks? When we only played for the trees?'],
      ['a', 'Every day. But the tracks carry our songs further than the trees ever could.'],
      ['b', 'I never thought of it that way.'],
      ['a', 'That is why I am the eldest. Someone must think of things.'],
    ],
    S: [
      ['b', 'Anjean, I wrote a new piece. For you. It’s about an old tree that never stops standing.'],
      ['a', 'I am not a tree, Gage.'],
      ['b', 'You are a little bit a tree.'],
      ['a', '…Play it, then.'],
      ['n', 'The cello sings. Anjean closes her eyes and, very quietly, hums along.'],
    ],
  },
  'anjean|steem': {
    C: [
      ['b', 'Too cold for these old wheels, Anjean. Too cold.'],
      ['a', 'You live in the Snow Realm, Steem.'],
      ['b', 'Which is how I know it is too cold.'],
    ],
    B: [
      ['a', 'You have been the Snow Sanctuary’s guardian longer than any Lokomo save me.'],
      ['b', 'And still you call me “young Steem”.'],
      ['a', 'I will stop when you stop sulking about the weather.'],
    ],
    A: [
      ['b', 'When the tracks vanished, I thought the snow had swallowed my song for good.'],
      ['a', 'Songs do not vanish. They wait.'],
      ['b', 'Then I am glad someone came to play the other half.'],
      ['a', 'So am I, old friend.'],
    ],
    S: [
      ['b', 'Anjean, when this is over, come and visit the Snow Sanctuary. I will make soup.'],
      ['a', 'You will complain about the cold.'],
      ['b', 'Constantly. That is part of the hospitality.'],
      ['a', 'Then I accept. Bring extra blankets.'],
    ],
  },
  'anjean|carben': {
    C: [
      ['b', 'Anjean! Did you see the way that wave knocked the Geozard over? I timed it perfectly!'],
      ['a', 'You timed it a beat late, Carben.'],
      ['b', 'A stylish beat late.'],
    ],
    B: [
      ['a', 'You flirt with every passenger on the Ocean line.'],
      ['b', 'I’m friendly! The sea is friendly! It’s practically my job.'],
      ['a', 'Your job is the Ocean Sanctuary.'],
      ['b', 'Which is very lonely without passengers to be friendly to.'],
    ],
    A: [
      ['b', 'I act carefree, but the day the ocean tracks broke, I couldn’t play a single note.'],
      ['a', 'I know. I felt the silence from the Tower.'],
      ['b', 'You did?'],
      ['a', 'I feel all of you. Even when you are a stylish beat late.'],
    ],
    S: [
      ['b', 'Anjean, will you dance at the Ocean festival this year? Just once?'],
      ['a', 'I ride a chair, Carben.'],
      ['b', 'The chair can dance! I’ve seen it spin.'],
      ['a', '…Once. And if you tell anyone, I will seal you in a clam.'],
    ],
  },
  'anjean|embrose': {
    C: [
      ['b', 'I CAN’T HEAR YOU, ANJEAN, THE DRUMS ARE TOO LOUD!'],
      ['a', 'Then stop drumming.'],
      ['b', 'WHAT?'],
    ],
    B: [
      ['a', 'Why must the Fire Melody always be so loud?'],
      ['b', 'Because the volcano is loud! If I play softly, it doesn’t notice me.'],
      ['a', 'Hm. There is wisdom in that, buried under the noise.'],
    ],
    A: [
      ['b', 'Cragma woke because I wasn’t loud enough. The tracks broke, and I wasn’t there.'],
      ['a', 'You cannot drum every hour of every day, Embrose.'],
      ['b', 'I can try.'],
      ['a', 'Then try with others beside you. The burden is lighter in a chorus.'],
    ],
    S: [
      ['b', 'I made new drums. Lighter ones. For travelling with you all.'],
      ['a', 'Are they quieter?'],
      ['b', 'No. Louder. I worked very hard on it.'],
      ['a', 'Of course you did. Play them, then. Let the whole realm hear.'],
    ],
  },
  'anjean|rael': {
    C: [
      ['b', 'The sand remembers, Anjean. It remembers when the tracks were buried.'],
      ['a', 'And what does it say?'],
      ['b', 'Mostly that it would like to stop being walked on.'],
    ],
    B: [
      ['a', 'You were sealed away from us longer than any of the sages. A whole century under the dunes.'],
      ['b', 'It was quiet. I learned many songs that nobody heard.'],
      ['a', 'Then teach them to us now.'],
    ],
    A: [
      ['b', 'Did you ever doubt the Sand Realm would come back?'],
      ['a', 'Every day. I hid it from the others.'],
      ['b', 'Why?'],
      ['a', 'Because the eldest must believe even when she cannot. That is the duty.'],
    ],
    S: [
      ['b', 'I will play the horn at the sanctuary at dawn every day, so you hear it at the Tower.'],
      ['a', 'The Tower is very far, Rael.'],
      ['b', 'It is a very loud horn.'],
      ['a', 'Then I will listen for it. Every dawn.'],
    ],
  },
  'alfonzo|ferrus': {
    C: [
      ['b', 'Mr. Alfonzo! Is it true you rebuilt the Aboda engine with a single spanner?'],
      ['a', 'Two spanners. One was bent.'],
      ['b', 'Can I take your picture?'],
      ['a', 'No.'],
    ],
    B: [
      ['a', 'You’ve got a good eye for track wear. Who taught you?'],
      ['b', 'Nobody. I just look at rails a lot. Like, a lot a lot.'],
      ['a', 'Hm. That’s how I learned too.'],
    ],
    A: [
      ['b', 'I failed the engineer’s exam twice.'],
      ['a', 'I failed it once. Showed up with a hangover and called the examiner a boiler.'],
      ['b', 'You didn’t!'],
      ['a', 'Passed the second time. Tell you what, kid. Next exam, I’ll coach you.'],
    ],
  },
  'elderNiko|linebeck3': {
    C: [
      ['a', 'Linebeck! The Third! I knew your grandfather. Loud fellow. Excellent moustache.'],
      ['b', 'You knew Grandpa? He never mentioned an old pirate.'],
      ['a', 'He never mentioned anyone but himself, as I recall!'],
    ],
    B: [
      ['b', 'What was the Great Sea like, back then?'],
      ['a', 'Endless. Blue. Full of fog and ghost ships and fish that talked.'],
      ['b', 'Fish that talked? Now you’re pulling my leg.'],
      ['a', 'The fish pulled everyone’s leg. Fish humour.'],
    ],
    A: [
      ['b', 'Grandpa’s last words were about a treasure he never found. Something he left “at sea”.'],
      ['a', 'Ahh. I think I know what he meant. A friendship, boy. He left a friend out there.'],
      ['b', 'That’s not treasure.'],
      ['a', 'Ask him again in fifty years. You’ll see.'],
    ],
  },
  'cole|malladus': {
    C: [
      ['a', 'My lord! Risen at last! I have prepared everything. The princess, the tower, the hat.'],
      ['b', 'The hat?'],
      ['a', 'It is a very good hat.'],
    ],
    B: [
      ['b', 'You waited a hundred years for me, Cole. Why?'],
      ['a', 'Because the Lokomo locked our kind beneath the earth. You were the only key.'],
      ['b', 'A key. Hm. You speak as if I were a tool.'],
      ['a', 'A magnificent tool, my lord! The finest!'],
    ],
    A: [
      ['b', 'When the princess’s body failed me, you did not flee. Most servants would have.'],
      ['a', 'I have been many things, but never a quitter.'],
      ['b', 'Then you are more than a servant. You are a fool.'],
      ['a', 'A loyal fool. It’s a niche.'],
    ],
    S: [
      ['b', 'If we are defeated, Cole, will you remember me?'],
      ['a', 'My lord, I will remember you every time I put on the hat.'],
      ['b', 'Always the hat.'],
      ['a', 'I bought it for your return. Every day for a hundred years, I brushed it.'],
      ['n', 'The Demon King says nothing. But he does not tell Cole to take it off.'],
    ],
  },
  'byrne|malladus': {
    C: [
      ['b', 'Byrne. My most ambitious servant.'],
      ['a', 'I was never your servant. I was your partner.'],
      ['b', 'You may tell yourself that.'],
    ],
    B: [
      ['a', 'You promised me the power of the Spirit Gods.'],
      ['b', 'I promised you power. I did not say whose.'],
      ['a', 'You lied.'],
      ['b', 'I am a demon. You knew that when you shook my hand.'],
    ],
    A: [
      ['b', 'You turned against me in the end. For an old woman and a boy.'],
      ['a', 'For a teacher and a hero. You never had either.'],
      ['b', 'And you think they made you stronger?'],
      ['a', 'I know they did. You felt it, when my gauntlet found your face.'],
    ],
  },
  // ── Big Blin (batch 4) ──
  'bigBlin|miniblin': {
    C: [
      ['b', 'Boss! Boss! We stole a whole crate of apples!'],
      ['a', 'Hrrr. Good. Big Blin carries crate.'],
      ['b', 'And then we ate them.'],
      ['a', 'Hrrr. Less good.'],
    ],
    B: [
      ['a', 'Little Miniblin always runs ahead. Big Blin always has to catch up.'],
      ['b', 'You’re slow, boss!'],
      ['a', 'Big Blin is BIG. Big things are slow. Small things are fast and get squashed.'],
      ['b', 'Squashed?!'],
    ],
    A: [
      ['n', 'After a battle, a Miniblin limps back to camp. Big Blin scoops it up and puts it in the basket.'],
      ['b', 'Boss, the basket is for prisoners.'],
      ['a', 'Basket is for whatever Big Blin wants. Big Blin wants little Miniblin safe.'],
      ['b', '…It’s actually very comfy in here.'],
    ],
    S: [
      ['a', 'Big Blin made little Miniblin a new pitchfork. Very sharp. Very small.'],
      ['b', 'Boss… it’s beautiful.'],
      ['a', 'Hrrr. Stop leaking from eyes. Blins do not leak.'],
      ['b', 'You’re leaking too, boss.'],
      ['a', 'Is rain.'],
    ],
  },
  'bigBlin|moblin': {
    C: [
      ['b', 'You are the big one? You are not that big.'],
      ['a', 'Big Blin is big ENOUGH.'],
      ['b', 'Hah. We will see who carries more.'],
    ],
    B: [
      ['a', 'Moblin uses spear. Big Blin uses club. Club is better.'],
      ['b', 'Spear reaches further.'],
      ['a', 'Club reaches face.'],
    ],
    A: [
      ['b', 'You fought well today, small-big one.'],
      ['a', 'Moblin also fought well. For a stick-poker.'],
      ['n', 'They bump fists. Somewhere a tree falls over from the impact.'],
    ],
  },
  'bigBlin|bulblin': {
    C: [
      ['b', 'Big Blin! The train is coming! Raid? Raid?'],
      ['a', 'Hrrr. No raid. Big Blin is on the train now.'],
      ['b', 'Then who do we rob?'],
    ],
    B: [
      ['a', 'Bulblin rides Bullbo very fast. Big Blin is too heavy for Bullbo.'],
      ['b', 'You broke three Bullbos!'],
      ['a', 'Bullbos were weak.'],
    ],
    A: [
      ['b', 'Working with the green kid is strange. He shares food.'],
      ['a', 'Big Blin likes the green kid. He fixes things. Big Blin breaks things. Good team.'],
      ['b', 'You’ve gone soft, Big Blin.'],
      ['a', 'Say that again, Bulblin. Big Blin will show you soft.'],
    ],
  },
  'bigBlin|kingBulblin': {
    C: [
      ['b', 'So you’re the Blin who leads the rail raiders. I’ve heard about you.'],
      ['a', 'Hrrr. Big Blin has heard of King Bulblin. Big horns. Big axe.'],
      ['b', 'Big respect, then.'],
    ],
    B: [
      ['b', 'I serve whoever is strongest. Who do you serve?'],
      ['a', 'Big Blin serves Big Blin. And little Miniblins. And now green kid.'],
      ['b', 'That’s a lot of masters.'],
      ['a', 'Is not masters. Is friends. Different.'],
    ],
    A: [
      ['b', 'I changed sides once. Fought for the boy in green, in another Hyrule.'],
      ['a', 'Why?'],
      ['b', 'He was the strongest. And he never gave up. That earns a Bulblin’s loyalty.'],
      ['a', 'Hrrr. Big Blin understands.'],
    ],
    S: [
      ['b', 'Let’s make a pact, Big Blin. Blins of every land, riding together.'],
      ['a', 'Pact! Big Blin likes pacts. Do we hit each other to seal it?'],
      ['b', 'That’s how my clan does it.'],
      ['a', 'Big Blin’s too!'],
      ['n', 'The resulting thud is heard three realms away.'],
    ],
  },
  'bigBlin|bossBokoblin': {
    C: [
      ['b', 'Another boss? There can be only one boss per camp.'],
      ['a', 'Big Blin is not boss of camp. Big Blin is boss of basket.'],
      ['b', '…That is acceptable.'],
    ],
    B: [
      ['b', 'Your underlings follow you without question. How?'],
      ['a', 'Big Blin carries them when they are tired.'],
      ['b', 'Mine fear me. Fear is easier.'],
      ['a', 'Fear runs away. Carrying stays.'],
    ],
    A: [
      ['b', 'I tried carrying a Bokoblin today. It bit me.'],
      ['a', 'First time they always bite. Second time they nap.'],
      ['b', 'Strange advice, from a monster.'],
      ['a', 'Big Blin is a very wise monster.'],
    ],
  },
  'bigBlin|jolene': {
    C: [
      ['b', 'You! You’re the brute who tried to board my ship off the Ocean Realm coast!'],
      ['a', 'Hrrr. Big Blin boards everything. Ships. Trains. Wagons.'],
      ['b', 'Well, keep your basket off my deck.'],
    ],
    B: [
      ['b', 'Your boarding technique is terrible. You just jump and hope.'],
      ['a', 'Big Blin lands. Always lands.'],
      ['b', 'You land ON people.'],
      ['a', 'Yes. Is the technique.'],
    ],
    A: [
      ['b', 'Fine, I’ll admit it. You cleared that Dark Train’s deck faster than my whole crew could.'],
      ['a', 'Big Blin is honoured. Pirate lady is good with sword. Very fast. Very angry.'],
      ['b', 'I’m not angry. I’m motivated.'],
      ['a', 'Hrrr. Big Blin will remember the difference.'],
    ],
  },
};
