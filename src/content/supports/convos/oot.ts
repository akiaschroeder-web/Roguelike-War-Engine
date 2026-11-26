// Support conversations: Ocarina of Time. Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'impa|link': {
    C: [
      ['b', 'Your guard drops after every third swing.'], ['a', 'Only in practice.'], ['b', 'Ganondorf will not care whether it is practice.'],
      ['n', 'Impa steps in close and taps the gap beneath Link\'s shield arm.'], ['a', 'There.'], ['b', 'There. Again, Hero of Time.'],
    ],
    B: [
      ['b', 'When the princess first spoke of you, I expected someone taller.'], ['a', 'I was ten.'], ['b', 'You were. I told her a child could not carry Hyrule.'],
      ['a', 'And now?'], ['b', 'Now I watch you carry it, and I wonder if I asked too much of you.'], ['n', 'Link sheathes his sword and sits beside her.'],
      ['a', 'You didn\'t ask. I chose.'],
    ],
    A: [
      ['b', 'I have trained Sheikah for most of my life. I have never once said this to a student.'], ['a', 'Said what?'],
      ['b', 'That they exceeded what I expected of them.'], ['n', 'Link looks at her, surprised.'], ['b', 'Do not let it go to your head. Your third swing is still slow.'],
      ['a', 'I\'ll work on it.'], ['b', 'I know you will. That is why I said it.'],
    ],
  },
  'link|nabooru': {
    C: [
      ['b', 'Well, well. The kid who crawled through the Spirit Temple for me.'], ['a', 'You remember?'], ['b', 'I remember a little boy who promised me silver gauntlets.'],
      ['b', 'And then I woke up seven years later and he was a grown man with a sword. Hardly fair.'], ['a', 'It wasn\'t fair for me either.'], ['b', 'Ha! No, I suppose it wasn\'t.'],
    ],
    B: [
      ['b', 'You fight like someone who learned in a hurry.'], ['a', 'I did.'], ['b', 'It shows. You never waste a step, because you never had time to.'],
      ['n', 'Nabooru twirls a scimitar and offers him the hilt.'], ['b', 'Try a Gerudo blade. Lighter. Meaner.'], ['a', 'It\'s heavy at the tip.'],
      ['b', 'That\'s the point, kid. Let it fall and follow it.'],
    ],
    A: [
      ['b', 'Among my people, a warrior earns a name by what they protect, not what they kill.'], ['a', 'What did you protect?'],
      ['b', 'The women and children Ganondorf ignored. I failed, for a while. You helped me finish.'], ['a', 'You did that yourself.'],
      ['b', 'Hah. Modest too. If you\'d been born in the desert, I\'d have made you my second.'], ['n', 'She claps him hard on the shoulder.'],
      ['b', 'You\'re no kid anymore. Don\'t let anyone treat you like one.'],
    ],
  },
  'link|rauru': {
    C: [
      ['b', 'You still wake before dawn, I notice.'], ['a', 'I don\'t like sleeping.'], ['b', 'I imagine not. Seven years in the Chamber of Sages is a long night.'],
      ['a', 'It felt like a blink.'], ['n', 'Rauru nods slowly, his hands folded in his sleeves.'], ['b', 'For you. Not for Hyrule.'],
    ],
    B: [
      ['a', 'The Kokiri didn\'t grow up. Everyone else did.'], ['b', 'And you feel you were left behind.'], ['a', 'Or they were. I don\'t know which.'],
      ['b', 'Malon runs a ranch now. The carpenters have a village. Castle Town is ash.'], ['a', 'I missed all of it.'],
      ['b', 'You were protected while the Triforce chose its moment. I sealed you. Blame me, if you need someone.'], ['n', 'Link shakes his head.'],
    ],
    A: [
      ['b', 'I have asked myself if I was right to keep you.'], ['a', 'You were.'], ['b', 'You say that very quickly.'],
      ['a', 'A child couldn\'t have beaten him. I needed the years, even if I didn\'t live them.'], ['b', 'And what you lost?'],
      ['a', 'I\'ll get some of it back. Some of it, I\'ll make new.'], ['n', 'Rauru smiles, the first real smile Link has seen on him.'],
      ['b', 'Then the time was not wasted after all.'],
    ],
  },
  'darkLink|link': {
    C: [
      ['n', 'Dark Link stands on the far side of the fire, mirroring Link\'s every move.'], ['a', 'Stop that.'], ['n', 'Dark Link tilts his head. So does Link, without meaning to.'],
      ['b', '…You stop.'], ['a', 'You talk?'], ['b', 'Only when you do.'],
    ],
    B: [
      ['b', 'You hesitate before you strike someone you think might be good.'], ['a', 'Yes.'], ['b', 'I don\'t. That makes me faster.'],
      ['a', 'It makes you worse.'], ['b', 'Does it? You lose time on mercy. I lose nothing.'], ['n', 'Link says nothing. Dark Link smiles with his mouth.'],
      ['b', 'I know you\'re afraid of failing. I\'m made of it.'],
    ],
    A: [
      ['a', 'I\'ve been thinking about the Water Temple.'], ['b', 'You won by giving up. You put the sword down.'], ['a', 'I stopped fighting myself.'],
      ['b', 'And now? You still carry me.'], ['a', 'I know. You\'re the part of me that\'s scared. I can live with that.'],
      ['n', 'For a long moment, the shadow does not mirror him at all.'], ['b', 'Then I\'ll stay. Somebody has to watch your back.'],
    ],
  },
  'ganondorf|link': {
    C: [
      ['b', 'So the boy hero marches under the same banner as me. The gods have a sense of humour.'], ['a', 'This is temporary.'],
      ['b', 'All alliances are. Remember that when you sleep.'], ['n', 'Link\'s hand stays on his sword hilt until Ganondorf has walked away.'],
    ],
    B: [
      ['b', 'Tell me, Hero. What is courage without power?'], ['a', 'Still courage.'], ['b', 'A fool\'s answer. A brave child with a stick dies brave.'],
      ['a', 'And power without courage?'], ['b', 'Rules.'], ['a', 'Until somebody brave enough stands up to it.'], ['n', 'Ganondorf\'s eyes narrow.'],
    ],
    A: [
      ['b', 'You lost seven years and yet you stand there unbroken. Why?'], ['a', 'Because people were still fighting. I wasn\'t the only one.'],
      ['b', 'Hmph. In the desert, a Gerudo born male is destined to be king. No one asked me if I wanted it.'], ['a', 'No one asked me either.'],
      ['b', 'Then we are both tools of the gods. The difference is I refused to stay one.'], ['a', 'You chose to hurt people. That\'s the difference.'],
      ['n', 'Neither looks away. Neither draws.'],
    ],
  },
  'youngLink|zelda': {
    C: [
      ['b', 'Do you still have the letter I gave you? The one for the guards?'], ['a', 'It\'s in my pack.'], ['b', 'Good. We might need it again.'],
      ['a', 'We\'re in an army now. Nobody stops us at gates.'], ['b', 'Oh. I suppose that\'s true.'], ['n', 'Zelda looks oddly disappointed.'],
    ],
    B: [
      ['b', 'I\'ve been drawing up a new plan. Look.'], ['n', 'She unrolls a parchment covered in arrows and a lopsided drawing of Ganondorf.'],
      ['a', 'Why does he have horns?'], ['b', 'Because that is how he looked in my dream.'], ['a', 'Okay.'],
      ['b', 'Step one, gather the Spiritual Stones. Step two, the Ocarina. Step three…'], ['a', 'Step three went badly last time.'], ['b', 'Then we\'ll improve step three.'],
    ],
    A: [
      ['b', 'Link, I\'m sorry. It was my plan that opened the Door of Time. I led him straight to it.'], ['a', 'We were kids.'],
      ['b', 'We still are, a little.'], ['a', 'Then we get another try.'], ['n', 'Zelda laughs, wiping her eyes.'],
      ['b', 'This time, we make the plan together.'], ['a', 'And I get to draw the map.'],
    ],
  },
  'malon|youngLink': {
    C: [
      ['b', 'Fairy boy! You came to see the horses?'], ['a', 'Is Epona here?'], ['b', 'Of course she is. She\'s been fussing since the march started.'],
      ['n', 'A chestnut foal noses at Link\'s tunic.'], ['b', 'She remembers you. Horses never forget a friend.'],
    ],
    B: [
      ['b', 'Here, listen. My mom wrote this song.'], ['n', 'Malon hums the first notes of Epona\'s Song.'], ['a', 'Can I try?'],
      ['n', 'Link plays it on the ocarina, a note off at the end. Epona\'s ears turn anyway.'], ['b', 'Close! She heard you. That\'s what matters.'],
      ['a', 'Why does it work?'], ['b', 'Because she knows it means somebody who loves her is calling.'],
    ],
    A: [
      ['b', 'The cuccos got loose again last night. You helped me catch every one.'], ['a', 'It was fun.'],
      ['b', 'Dad says soldiers only care about horses that can fight. You\'re not like that.'], ['a', 'Epona\'s my friend, not a weapon.'],
      ['b', 'Promise you\'ll take care of her, if she ever goes with you?'], ['a', 'I promise.'], ['n', 'Malon ties a ribbon in Epona\'s mane and hands Link the reins.'],
    ],
  },
  'ruto|youngLink': {
    C: [
      ['b', 'There you are, my fiancé!'], ['a', 'I\'m not—'], ['b', 'You took the Zora\'s Sapphire. That is a marriage proposal, you know.'],
      ['a', 'I didn\'t know.'], ['b', 'Ignorance of the law is no excuse. You\'ll learn to love it.'],
    ],
    B: [
      ['b', 'A proper Zora husband must be able to hold his breath for at least ten minutes.'], ['a', 'I have a tunic for that.'],
      ['b', 'Cheating! But I suppose it\'s clever cheating.'], ['n', 'Ruto splashes him from the camp\'s water barrel.'],
      ['b', 'And he must carry his princess when she gets tired.'], ['a', 'You\'re heavier than you look.'], ['b', 'How dare you!'],
    ],
    A: [
      ['b', 'Link. Be honest. You never meant to marry me.'], ['a', 'No.'], ['b', 'Hmph. You could have at least lied.'],
      ['a', 'You saved me inside Jabu-Jabu, though. Sort of.'], ['b', 'I saved you entirely.'], ['a', 'Okay. You\'re a good friend, Ruto.'],
      ['n', 'Ruto turns away, fins flushed blue.'], ['b', 'Friend. Fine. For now.'],
    ],
  },
  'mido|youngLink': {
    C: [
      ['b', 'Why did they make YOU the vanguard? I\'m the boss of the Kokiri.'], ['a', 'I didn\'t ask.'], ['b', 'Of course you didn\'t. You never have to ask.'],
      ['n', 'Mido kicks a pebble at Link\'s boot and stalks off.'],
    ],
    B: [
      ['b', 'Saria always liked you better. Since the day the Deku Tree let you in.'], ['a', 'She likes you too.'],
      ['b', 'She feels sorry for me. That\'s different.'], ['a', 'I don\'t think so.'], ['n', 'Mido picks at the Kokiri Sword\'s scabbard on Link\'s back.'],
      ['b', 'I could\'ve found that sword too, you know. If I\'d looked.'], ['a', 'I believe you.'],
    ],
    A: [
      ['b', 'I saw you fight that Deku Baba patch today.'], ['a', 'You were there?'], ['b', 'I was guarding the rear. Leader stuff.'],
      ['b', 'You didn\'t run. Even when it nearly bit your head off.'], ['a', 'You didn\'t run either.'], ['b', '…No. I didn\'t, did I?'],
      ['n', 'Mido sticks out a hand, quickly, before he can change his mind.'], ['b', 'Don\'t tell anyone I did this.'],
    ],
  },
  'navi|youngLink': {
    C: [
      ['b', 'Hey! Listen! You left your shield by the fire again!'], ['a', 'I was going to get it.'], ['b', 'When? After the Moblins took it?'],
      ['n', 'Navi bumps against his hat until he goes to fetch it.'], ['b', 'Honestly. What would you do without me?'],
    ],
    B: [
      ['a', 'Navi, why didn\'t I have a fairy before you?'], ['b', 'Hmm… The Great Deku Tree said your fairy had to be special.'],
      ['a', 'Because I\'m not Kokiri.'], ['b', 'Hey, don\'t say it like that! You\'re different. Different isn\'t bad.'],
      ['a', 'Mido says it is.'], ['b', 'Mido says a lot of things. Listen to me instead!'],
    ],
    A: [
      ['b', 'Look at this camp. Gorons, Zoras, soldiers… and they all know your name.'], ['a', 'They\'re just being nice.'],
      ['b', 'No they aren\'t! They trust you. You found a place out here, Link.'], ['a', 'You helped.'],
      ['n', 'Navi glows a little brighter.'], ['b', 'I only pointed. You walked.'],
    ],
    S: [
      ['b', 'Link… when this is over, I might have to go somewhere.'], ['a', 'Where?'], ['b', 'I don\'t know yet. Fairies go where they\'re needed.'],
      ['a', 'I need you.'], ['b', 'You\'ve got a whole world now. You don\'t need a fairy to tell you where to look.'],
      ['n', 'Link holds out his hand. Navi lands in it.'], ['a', 'Then I\'ll look for you.'], ['b', 'Hey… listen. I\'d like that.'],
    ],
  },
  'dekuTree|youngLink': {
    C: [
      ['b', 'Thou hast grown, little one. A sapling under strange skies.'], ['a', 'You\'re… here.'], ['b', 'A sprout of mine, carrying my voice. Close enough.'],
      ['n', 'The young Deku Sprout\'s leaves rustle as Link sits among its roots.'], ['b', 'Tell me of thy travels.'],
    ],
    B: [
      ['a', 'Why didn\'t I have a fairy for so long?'], ['b', 'Because thou wert not born of the forest, though thou wert raised in it.'],
      ['a', 'Then where?'], ['b', 'A woman fled war and carried thee to my roots. She asked me to keep thee safe. Then she was gone.'],
      ['n', 'Link is very quiet.'], ['a', 'My mother.'], ['b', 'Yes. I am sorry, child. I should have told thee sooner.'],
    ],
    A: [
      ['a', 'So I\'m Hylian.'], ['b', 'Thou art. Thou wilt grow, as the Kokiri never shall.'], ['a', 'And leave them behind.'],
      ['b', 'Or carry them with thee. A seed leaves the tree. It is not lost because of it.'], ['a', 'I\'ll come back to visit.'],
      ['b', 'The forest will be glad of thee. As was I.'],
    ],
    S: [
      ['a', 'Did she say my name? My mother?'], ['b', 'She did not. She was too weak. I named thee myself.'], ['a', 'You named me?'],
      ['b', 'A small name, for a small boy. I hoped it might become a great one.'], ['n', 'Link presses his palm against the bark.'],
      ['a', 'Then you\'re family too.'], ['b', 'Then I am content, child. More than thou knowest.'],
    ],
  },
  'maskSalesman|youngLink': {
    C: [
      ['b', 'Oh, my! My best customer! How did the Keaton Mask sell?'], ['a', 'Fine.'], ['b', 'Wonderful, wonderful. And the Skull Mask?'],
      ['a', 'A kid in the Lost Woods took it.'], ['n', 'The Happy Mask Salesman\'s smile does not move at all.'], ['b', 'Mmm. Masks do find the people they want.'],
    ],
    B: [
      ['b', 'Do you know why people wear masks, young man?'], ['a', 'To have fun?'], ['b', 'To become someone else. Even for a little while.'],
      ['b', 'But a mask remembers who wore it. All the joy. All the sorrow.'], ['a', 'That sounds heavy.'], ['b', 'Oh, it is. Terribly heavy. That is why I carry so many.'],
    ],
    A: [
      ['b', 'I have watched you, young man. You return every mask you borrow.'], ['a', 'They\'re not mine.'],
      ['b', 'Few understand that. They wear a face and forget to take it off.'], ['a', 'What happens then?'],
      ['b', 'They become the mask. Ah, but not you. You are too honest a boy.'], ['n', 'He presses a small, blank mask into Link\'s hands.'],
      ['b', 'Keep this one. Fill it with good memories. Then you will be happy.'],
    ],
  },
  'link|youngLink': {
    C: [
      ['n', 'Young Link stares up at the older man for a long time.'], ['a', 'Are you really me?'], ['b', 'I think so.'],
      ['a', 'You\'re so tall.'], ['b', 'You will be too.'], ['a', 'Do you still like fishing?'], ['b', 'Yes.'], ['a', 'Good.'],
    ],
    B: [
      ['a', 'What\'s it like being a grown-up?'], ['b', 'Heavier. Everything is.'], ['a', 'The sword?'],
      ['b', 'That too. People look at you differently. They expect you to know things.'], ['a', 'Do you know things?'], ['b', 'Not many.'],
      ['n', 'Young Link laughs. After a moment, so does Link.'],
    ],
    A: [
      ['a', 'Do I lose anything? When I grow up?'], ['b', 'Some things. You stop fitting through crawlspaces.'], ['a', 'That\'s not what I meant.'],
      ['b', 'I know.'], ['n', 'The older hero kneels so they are eye to eye.'], ['b', 'You keep the important parts. You just have to choose to.'],
      ['a', 'Okay. I\'ll choose.'], ['b', 'I know you will. I did.'],
    ],
  },
  'rauru|zelda': {
    C: [
      ['b', 'Princess. The other Sages await your word on tomorrow\'s march.'], ['a', 'Mine? You are the eldest of us, Rauru.'],
      ['b', 'Eldest, yes. But the seventh Sage leads. It has always been so.'], ['n', 'Zelda closes her map slowly.'], ['a', 'I see. Then tell them dawn.'],
    ],
    B: [
      ['a', 'Darunia wants to charge. Ruto wants to wait for the rain. Nabooru wants neither.'], ['b', 'And what do you want?'],
      ['a', 'For someone else to decide.'], ['b', 'That is honest, at least.'], ['b', 'A leader of Sages does not need the answer. She needs to listen until the answer appears.'],
      ['a', 'And if it never does?'], ['b', 'Then she chooses, and carries the cost.'],
    ],
    A: [
      ['a', 'I made the wrong call at the ford. Two soldiers were hurt.'], ['b', 'You did. And you visited them first, before your own tent.'],
      ['a', 'That changes nothing.'], ['b', 'It changes them. They will follow you again because of it.'], ['n', 'Rauru lays a hand on her shoulder.'],
      ['b', 'I sealed the Sacred Realm, and Hyrule still fell. No Sage is perfect, princess. We are only faithful.'], ['a', 'Then I will be faithful.'],
    ],
  },
  'saria|zelda': {
    C: [
      ['b', 'You\'re the princess Link talks about.'], ['a', 'And you are the friend he talks about. Saria, isn\'t it?'],
      ['b', 'That\'s me! I didn\'t think a princess would know my name.'], ['a', 'He mentions you rather a lot.'], ['n', 'Saria beams.'],
    ],
    B: [
      ['b', 'Do you get lonely in the castle?'], ['a', 'Often. There are a hundred people around me and none I can talk to.'],
      ['b', 'In the Forest Temple, there\'s nobody at all. Just the trees. I play my ocarina so they don\'t forget me.'], ['a', 'Does it help?'],
      ['b', 'A little. Sometimes the wind plays back.'], ['a', 'I used to sing to the courtyard birds. They never sang back.'],
    ],
    A: [
      ['a', 'When this is over, you will return to your temple, and I to my throne.'], ['b', 'And neither of us gets to leave.'],
      ['a', 'No. But perhaps we could write?'], ['b', 'I can\'t write very well. Kokiri don\'t really need to.'], ['a', 'Then I will teach you.'],
      ['b', 'And I\'ll teach you a song. So you can hear me, even from the castle.'], ['n', 'Saria plays a few bright notes. Zelda repeats them, carefully.'],
    ],
  },
  'malon|zelda': {
    C: [
      ['b', 'Oh! You\'re the princess! I delivered milk to your castle, you know.'], ['a', 'You did? I never met the delivery people.'],
      ['b', 'Dad usually did it. He fell asleep at your gate once.'], ['a', 'Ah. The guards still talk about that.'], ['n', 'They both laugh.'],
    ],
    B: [
      ['a', 'What was your childhood like, Malon?'], ['b', 'Up before the sun. Feed the horses, chase the cuccos, sing to the cows.'],
      ['a', 'It sounds wonderful.'], ['b', 'It\'s hard work. Wonderful, but hard. What about you?'],
      ['a', 'Lessons. Etiquette, history, harp. Watching the world from a window.'], ['b', 'Oh. That sounds lonely.'], ['a', 'It was.'],
    ],
    A: [
      ['b', 'I didn\'t know princesses could brush horses.'], ['a', 'They can if someone shows them how.'], ['n', 'Zelda works the brush awkwardly along Epona\'s flank.'],
      ['b', 'Long strokes. Follow the hair. There you go!'], ['a', 'You grew up with far more freedom than I did.'],
      ['b', 'And you grew up knowing what was at stake. We both had to grow up fast, I think.'], ['a', 'Then we have that in common, at least.'],
    ],
  },
  'ruto|zelda': {
    C: [
      ['b', 'Princess Zelda. I\'ve heard a great deal about you.'], ['a', 'And I you, Princess Ruto.'], ['b', 'Mostly from Link, I imagine.'],
      ['a', 'Some from him.'], ['b', 'Then you\'ll know he is my fiancé.'], ['n', 'Zelda blinks.'], ['a', 'He… did not mention that.'],
    ],
    B: [
      ['b', 'Does your father ever let you decide anything?'], ['a', 'Rarely. He calls my visions childish dreams.'],
      ['b', 'Mine thinks Jabu-Jabu will solve everything. And he will not stop eating.'], ['a', 'We are both waiting to be taken seriously.'],
      ['b', 'Then we stop waiting.'], ['n', 'Ruto lifts her chin. Zelda, slowly, does the same.'],
    ],
    A: [
      ['b', 'I know he doesn\'t really mean to marry me.'], ['a', 'Ruto…'], ['b', 'Don\'t pity me. A princess knows how to lose with grace.'],
      ['a', 'I don\'t think either of us gets to keep him, really. He belongs to Hyrule.'], ['b', 'So do we. That is our burden.'],
      ['a', 'Then we carry it together.'], ['b', 'Hmph. Fine. But I still get to call him my fiancé.'],
    ],
  },
  'nabooru|zelda': {
    C: [
      ['b', 'A Hylian princess in a Gerudo camp. My grandmother would spit.'], ['a', 'Mine might have, too.'],
      ['b', 'Ha! At least you\'re honest.'], ['n', 'Nabooru passes Zelda a cup of something sour and strong.'], ['b', 'Drink. It\'s rude not to.'],
    ],
    B: [
      ['a', 'My father kept the Gerudo outside the treaties.'], ['b', 'Your father kept us outside everything. Water rights, trade, grain.'],
      ['a', 'And that made Ganondorf\'s promises sound sweet.'], ['b', 'Some of my sisters followed him for bread, princess. Not for power.'],
      ['a', 'I didn\'t know.'], ['b', 'No. Your kind never asked.'],
    ],
    A: [
      ['a', 'I have drafted something. Open trade at the Gerudo Valley bridge, and a seat at court.'], ['b', 'A seat? For a thief?'],
      ['a', 'For a Sage. And for whoever the Gerudo choose after you.'], ['n', 'Nabooru reads the draft twice.'],
      ['b', 'You\'re serious.'], ['a', 'Hyrule failed your people. I would like to stop failing them.'], ['b', 'Then I\'ll sign. And I\'ll hold you to it.'],
    ],
  },
  'ganondorf|zelda': {
    C: [
      ['b', 'The little princess who watched me through a courtyard window.'], ['a', 'I knew what you were even then.'],
      ['b', 'And yet your father welcomed me. Did he listen to you?'], ['n', 'Zelda does not answer.'], ['b', 'I thought not.'],
    ],
    B: [
      ['b', 'Do you know how the Gerudo live, princess? Sand and wind and thirst, while Hyrule\'s lakes overflow.'],
      ['a', 'I know my father\'s court ignored you.'], ['b', 'Ignored. A gentle word for it.'], ['a', 'That doesn\'t excuse what you did.'],
      ['b', 'No. But it explains why no one stopped me.'],
    ],
    A: [
      ['a', 'You were right about one thing. Hyrule\'s crown failed your people.'], ['b', 'How gracious.'],
      ['a', 'I mean to change it. Without you.'], ['b', 'Without me, there would be nothing to change. I forced your eyes open.'],
      ['a', 'You burned the kingdom to make a point.'], ['n', 'Ganondorf smiles, cold and slow.'],
      ['b', 'And you will rule the ashes better than your father ruled the gardens. Prove me wrong.'],
    ],
  },
  'mido|saria': {
    C: [
      ['b', 'Saria! You can\'t just wander off to the front line!'], ['a', 'I\'m a Sage, Mido. That\'s where I\'m supposed to be.'],
      ['b', 'You\'re supposed to be in the forest. With us.'], ['n', 'Saria smiles, but it is a tired smile.'], ['a', 'I know you miss me.'],
    ],
    B: [
      ['b', 'Everything changed when Link left. Then you left. Now the forest\'s too quiet.'], ['a', 'The forest is fine, Mido.'],
      ['b', 'It\'s not fine! The Kokiri keep asking me where you are and I don\'t know what to tell them!'],
      ['a', 'Tell them I\'m keeping them safe.'], ['b', 'From a temple. Where nobody can visit.'], ['a', 'Yes.'],
    ],
    A: [
      ['b', 'I was mean to Link because he took you away. That\'s what I thought.'], ['a', 'And now?'],
      ['b', 'Now I think you were always going to go somewhere. He just went first.'], ['n', 'Saria sits beside him on the log.'],
      ['a', 'That\'s very grown-up of you, Mido.'], ['b', 'Don\'t say grown-up. Kokiri don\'t grow up.'],
    ],
    S: [
      ['b', 'I made something for you.'], ['n', 'He holds out a crooked flute carved from a Deku branch.'], ['a', 'Did you carve this yourself?'],
      ['b', 'It doesn\'t play very well. But you could keep it in the temple. So you remember us.'], ['a', 'Mido, I could never forget you.'],
      ['b', 'Promise?'], ['a', 'Promise. You\'re my oldest friend. That doesn\'t change.'], ['n', 'Mido rubs his nose hard and looks away.'],
    ],
  },
  'dekuTree|saria': {
    C: [
      ['b', 'Saria. My Sage of the Forest. Thy song still reaches my roots.'], ['a', 'Great Deku Tree! I wasn\'t sure you could hear me out here.'],
      ['b', 'Wherever a seed of mine grows, I listen.'], ['n', 'Saria rests her head against the sprout\'s small trunk.'],
    ],
    B: [
      ['a', 'The Kokiri can\'t leave the forest. So who protects them while I\'m here?'], ['b', 'The forest itself, and the Skull Kids, and the fairies.'],
      ['a', 'That\'s not enough. Not with monsters in the Lost Woods.'], ['b', 'No. Not alone. That is why thou art here, to end the cause.'],
      ['a', 'It feels like running away.'], ['b', 'Sometimes guarding a home means leaving its doorway.'],
    ],
    A: [
      ['b', 'When I perished, Saria, thou didst carry the forest.'], ['a', 'I didn\'t do much. I just waited in the temple.'],
      ['b', 'Waiting is the hardest of watches. Thy prayers kept the Kokiri whole.'], ['a', 'Really?'], ['b', 'Truly.'],
      ['n', 'The sprout\'s leaves turn toward her like sunlight.'], ['a', 'Then I\'ll keep waiting, as long as they need me.'],
    ],
    S: [
      ['a', 'Great Deku Tree… will you grow tall again? Like before?'], ['b', 'In time. Many Kokiri lifetimes, which is to say, none at all.'],
      ['a', 'Then I\'ll still be here when you do.'], ['b', 'Thou wilt. Thou art the forest\'s heart now, as I once was.'],
      ['a', 'That\'s too big for me.'], ['b', 'It was too big for me as well, once. We grow into what we guard.'],
      ['n', 'Saria plays her song. A breeze stirs every leaf in the camp.'],
    ],
  },
  'darunia|saria': {
    C: [
      ['b', 'Ho! You there, little one! Was that you playing that tune just now?'], ['a', 'My song? Yes!'],
      ['b', 'Hahaha! Play it again! It makes my feet itch!'], ['n', 'Saria plays. Darunia stamps the ground in rhythm, shaking every tent pole in the camp.'],
    ],
    B: [
      ['b', 'When Brother Link played your song, I danced so hard I nearly rolled off the mountain!'], ['a', 'He told me! He said you broke a stone pillar.'],
      ['b', 'Two pillars. But who is counting!'], ['a', 'Do Gorons have songs of their own?'], ['b', 'Bah! We have drums and shouting. Your song has… a heart.'],
      ['a', 'You have a heart too, Darunia.'], ['b', 'Of course! It is made of stone!'],
    ],
    A: [
      ['b', 'Sister Saria. I would ask a favour.'], ['a', 'What is it?'], ['b', 'Teach me to play your song. On my own.'],
      ['n', 'Saria hands him her ocarina. It looks like a pebble in his hand.'], ['a', 'Gently. Cover the holes with the tips of your fingers.'],
      ['n', 'Darunia produces something that is almost a note.'], ['b', 'HAHAHA! Did you hear that, Sister? It was music!'], ['a', 'It was! Brother.'],
    ],
  },
  'ruto|saria': {
    C: [
      ['b', 'You\'re the forest girl. Link\'s little friend.'], ['a', 'I\'m his best friend, actually.'], ['b', 'Hmph. I\'m his fiancée.'],
      ['a', 'Oh! Does Link know that?'], ['n', 'Ruto\'s fins twitch.'], ['b', 'He will.'],
    ],
    B: [
      ['b', 'Why aren\'t you jealous? He spends more time with that Hylian princess than either of us.'], ['a', 'Because I\'m not trying to keep him.'],
      ['b', 'Then what are you trying to do?'], ['a', 'Make sure he has somewhere to come home to.'], ['b', '…That\'s infuriatingly sweet.'],
    ],
    A: [
      ['b', 'I have been thinking about what you said.'], ['a', 'About home?'], ['b', 'Zora\'s Domain could be his home too. If he wanted.'],
      ['a', 'If he wanted.'], ['b', 'Yes. Fine. I understand your point.'], ['n', 'Saria giggles. After a moment, so does Ruto.'],
      ['b', 'You and I should look after him together. Both his homes.'], ['a', 'I\'d like that, Ruto.'],
    ],
  },
  'nabooru|saria': {
    C: [
      ['b', 'You never left your forest before this?'], ['a', 'Kokiri can\'t. We\'d get lost and turn into Skull Kids.'], ['b', 'That\'s a grim fairy tale.'],
      ['a', 'It\'s not a tale.'], ['n', 'Nabooru raises an eyebrow and says nothing more.'],
    ],
    B: [
      ['b', 'The fortress was like your forest, I suppose. Walls, rules, and no men past the gate.'], ['a', 'Did you want to leave?'],
      ['b', 'Every day. So I did. I stole my first horse at fourteen.'], ['a', 'I never wanted to leave. I liked it there.'],
      ['b', 'Then you were lucky. Not everyone\'s cage is comfortable.'],
    ],
    A: [
      ['a', 'Is it scary? The outside world?'], ['b', 'Sometimes. It\'s also big, and full of people who don\'t know your rules.'],
      ['a', 'That sounds scary.'], ['b', 'It\'s freeing, kid. You find out which rules are really yours.'], ['n', 'Saria thinks about that for a long while.'],
      ['a', 'I think I\'d keep most of mine.'], ['b', 'Ha. Then they were good ones.'],
    ],
  },
  'navi|saria': {
    C: [
      ['b', 'Saria! Saria! Is it really you?'], ['a', 'Navi! You\'re still with him!'], ['b', 'Of course! Someone has to keep him out of trouble.'],
      ['a', 'Is it working?'], ['b', '…Not really.'],
    ],
    B: [
      ['a', 'Does he eat properly? He always forgot when he was in the forest.'], ['b', 'He eats mushrooms off the ground if I don\'t stop him!'],
      ['a', 'Oh no.'], ['b', 'And he sleeps in his boots! And he jumps off cliffs to save time!'], ['a', 'That sounds like Link.'],
      ['n', 'They share a long, worried look.'],
    ],
    A: [
      ['a', 'Navi, I\'m glad it was you who went with him.'], ['b', 'Really? I always thought you wished you could have.'],
      ['a', 'I did. But I had to stay. You could go.'], ['b', 'I\'ll take care of him, Saria. I promise.'],
      ['a', 'I know. And I\'ll be listening from the forest, for both of you.'], ['n', 'Navi circles Saria once, a fairy\'s embrace.'],
    ],
  },
  'darunia|medigoron': {
    C: [
      ['a', 'Medigoron! Your blades shatter on Lizalfos scales, brother!'], ['b', 'Goro? That is because Lizalfos are wet. Wet scales are slippery.'],
      ['a', 'Then make a blade that is not afraid of slippery!'], ['n', 'Medigoron scratches his enormous head.'], ['b', 'Hmm. Hmmm. I will think about it.'],
    ],
    B: [
      ['b', 'Big Brother Darunia, I tried folding the steel with Dodongo Cavern magma.'], ['a', 'And?'],
      ['b', 'It is very hot. Also very sharp. Also it melted my hammer.'], ['a', 'HAHA! A blade that melts hammers! Splendid!'],
      ['b', 'Not splendid. I liked that hammer.'], ['a', 'I will get you a bigger one!'],
    ],
    A: [
      ['b', 'Here. For our warriors. Forty of them.'], ['n', 'Medigoron sets down a crate of broad, heavy Goron cleavers.'],
      ['a', 'Brother… these are magnificent.'], ['b', 'I made the grips bigger. Goron hands are big. Nobody makes things for big hands.'],
      ['a', 'You do. That is why you are the best smith on the mountain.'], ['b', 'Goro… second best. Do not tell my brother.'], ['a', 'HAHAHA!'],
    ],
  },
  'darunia|ruto': {
    C: [
      ['a', 'Ah! The little fish princess!'], ['b', 'I am a Zora, not a fish. And you\'re the rock that eats rocks.'],
      ['a', 'HAHA! Correct!'], ['n', 'Ruto wrinkles her nose at the smell of roasted stone.'],
    ],
    B: [
      ['b', 'When Zora\'s Domain froze, your people did nothing.'], ['a', 'When Death Mountain was burning, yours did nothing either.'],
      ['b', 'We were frozen solid!'], ['a', 'We were being fed to a dragon!'], ['n', 'An awkward pause.'],
      ['b', 'Hm. I suppose we were both rather busy.'], ['a', 'HAH! Very busy, Sister!'],
    ],
    A: [
      ['a', 'The Gorons have always bought your fish. You have always bought our ore.'], ['b', 'And we have always complained about the prices.'],
      ['a', 'Let us complain about them together, then, as Sages.'], ['b', 'That is the strangest treaty I have ever heard.'],
      ['a', 'It is a Goron treaty! Simple and loud!'], ['n', 'Darunia sticks out a hand the size of Ruto\'s whole body. She shakes one finger of it.'],
    ],
  },
  'darunia|nabooru': {
    C: [
      ['b', 'They say Goron chiefs can split a boulder with one punch.'], ['a', 'They say correctly!'], ['b', 'I\'d like to see it.'],
      ['n', 'Darunia punches a boulder. It splits. Nabooru whistles.'], ['b', 'Not bad, big man.'],
    ],
    B: [
      ['b', 'Bet you can\'t catch me in the next skirmish. Kill count, winner buys drinks.'], ['a', 'You are on, Sister!'],
      ['n', 'After the battle, both of them claim twelve.'], ['b', 'Twelve? I saw you sit on one. That doesn\'t count.'],
      ['a', 'It counts if he does not get up!'],
    ],
    A: [
      ['b', 'You know, the drinks were a draw.'], ['a', 'Then we both buy, and we both drink!'], ['b', 'Ha! I like your thinking.'],
      ['b', 'Truth is, I haven\'t had a rival I respected in years. Ganondorf didn\'t count. He just bullied.'], ['a', 'And I have not had a friend who could keep up with me.'],
      ['n', 'They clash cups hard enough to crack them.'], ['a', 'To the next fight, Sister!'], ['b', 'To the next fight.'],
    ],
  },
  'jabuJabu|ruto': {
    C: [
      ['n', 'Ruto kneels at the edge of the camp\'s spring. Lord Jabu-Jabu floats beside it, enormous and placid.'], ['a', 'Lord Jabu-Jabu. I brought you fish.'],
      ['n', 'The great fish opens its mouth. Ruto tosses the fish in from a respectful distance.'], ['a', 'Not too close this time. I remember the inside of you.'],
    ],
    B: [
      ['a', 'I was so angry with you when you swallowed me.'], ['b', 'Hrrrmmmm.'], ['a', 'I know. You were ill. Barinade made you ill.'],
      ['n', 'Jabu-Jabu blows a slow stream of bubbles that pop against Ruto\'s cheeks.'], ['a', 'Was that an apology? Hmph. Accepted.'],
    ],
    A: [
      ['a', 'When the Domain froze, I was sealed away and couldn\'t protect you.'], ['n', 'Jabu-Jabu sinks lower in the water, closer to her.'],
      ['a', 'I swore my mother\'s oath to you, and I broke it.'], ['b', 'Hrrrmm…'], ['n', 'The deity nudges the Zora\'s Sapphire pendant at her throat.'],
      ['a', 'You don\'t think I broke it? …You\'re too kind for a fish.'],
    ],
    S: [
      ['a', 'My mother used to feed you every morning. I remember her humming.'], ['n', 'Jabu-Jabu goes very still in the water.'],
      ['a', 'You remember her too, don\'t you?'], ['b', 'Hmmmmrrrr.'], ['a', 'I will feed you every morning, as long as I live. That is my oath, not hers.'],
      ['n', 'Ruto hums a Zora lullaby. The great fish closes its eyes and drifts, content.'],
    ],
  },
  'impa|ruto': {
    C: [
      ['b', 'You are late for drills, Princess.'], ['a', 'A princess is never late. Everyone else is early.'],
      ['b', 'Then everyone else will be alive when you are not.'], ['n', 'Ruto gapes. Impa hands her a practice spear.'],
    ],
    B: [
      ['a', 'My arms ache. My fins ache. Even my gills ache.'], ['b', 'Good. They are learning.'],
      ['a', 'Is this how you trained Zelda?'], ['b', 'Zelda complained less. But she was also a worse swimmer.'], ['a', 'Ha! I knew it.'],
      ['b', 'Again. Twenty more.'],
    ],
    A: [
      ['b', 'You held the line at the river today. Without being told.'], ['a', 'Someone had to.'],
      ['b', 'Yes. That is discipline, Princess. Not drills. Knowing when someone has to, and being that someone.'],
      ['a', 'You\'re saying something nice to me.'], ['b', 'Do not get used to it.'], ['n', 'Ruto grins and picks up the spear before Impa can tell her to.'],
    ],
  },
  'impa|nabooru': {
    C: [
      ['b', 'The Sheikah. I thought Ganondorf wiped you out.'], ['a', 'He tried. We are difficult to find.'], ['b', 'Ha. So are thieves.'],
      ['n', 'Each notes where the other keeps her knives.'],
    ],
    B: [
      ['a', 'You stood against him while he was still your king. That took nerve.'], ['b', 'I stole from him, mostly. Not quite rebellion.'],
      ['a', 'Every theft was a message. I heard them in Kakariko.'], ['b', 'And you? The Sheikah just vanished?'],
      ['a', 'We hid the princess, and then we hid ourselves. Seven years of waiting.'], ['b', 'Waiting sounds worse than fighting.'], ['a', 'It was.'],
    ],
    A: [
      ['b', 'Twinrova took me in the end. Made me his.'], ['a', 'And you came back.'], ['b', 'I came back. I don\'t remember much of what I did.'],
      ['a', 'I remember much of what I did not do. We both carry it.'], ['n', 'Nabooru passes Impa a flask. Impa drinks.'],
      ['b', 'Next time he rises, we hit him together.'], ['a', 'Agreed. From the shadows, and from the sand.'],
    ],
  },
  'impa|rauru': {
    C: [
      ['b', 'Impa. The Sheikah still keep their vigil, I see.'], ['a', 'We are the shadow of the royal family. We keep it always.'],
      ['b', 'Even when there is no throne to guard?'], ['n', 'Impa glances at Zelda\'s tent.'], ['a', 'There is a throne. It is just smaller now.'],
    ],
    B: [
      ['b', 'In my day, the Sheikah guarded more than kings. They kept the Temple of Time\'s secrets too.'], ['a', 'Much of that was lost.'],
      ['b', 'Not lost. Buried. Under Kakariko, under the well, under your own feet.'], ['a', 'You knew my ancestors.'],
      ['b', 'I taught some of them. They were as stubborn as you are.'],
    ],
    A: [
      ['a', 'Tell me what the Sheikah were meant to be. Not what we became.'], ['b', 'Watchers. Never rulers. Never quite trusted, and always relied upon.'],
      ['a', 'That has not changed.'], ['b', 'No. Nor has your courage. When the first Sheikah swore their oath, I thought it too heavy for mortals.'],
      ['n', 'Rauru bows to her, deeply.'], ['b', 'I was wrong. You have carried it ten thousand years.'], ['a', 'And we will carry it ten thousand more.'],
    ],
  },
  'dampe|impa': {
    C: [
      ['b', 'Lady Impa! Heh heh… you\'re not here to make me dig up something, are you?'], ['a', 'Not today, Dampé.'],
      ['b', 'Good, good. My back\'s not what it was.'], ['n', 'Dampé leans on his shovel and squints at her.'], ['b', 'You still walk like the graves can hear you.'],
    ],
    B: [
      ['a', 'You have tended the graveyard for many years. Have you ever gone below?'], ['b', 'Below? Heh… only into the windmill boy\'s tunnels.'],
      ['a', 'There is more beneath. Older things.'], ['b', 'I know. I hear knocking, some nights. I don\'t knock back.'],
      ['a', 'Wise.'], ['b', 'Not wise. Scared. It\'s the same thing, mostly.'],
    ],
    A: [
      ['a', 'The Shadow Temple lies under your royal tomb. My people sealed it there.'], ['b', 'So that\'s what I\'ve been guarding all these years.'],
      ['a', 'You guarded it well. Better than the Sheikah, in the end.'], ['b', 'Heh. With a lantern and a shovel.'],
      ['n', 'Impa hands him a small Sheikah charm.'], ['a', 'If the knocking ever grows louder, burn this. I will come.'], ['b', 'Heh heh… I\'ll hold you to it, lady.'],
    ],
  },
  'nabooru|rauru': {
    C: [
      ['b', 'Sage of Spirit. Welcome to the Chamber\'s fellowship.'], ['a', 'Fellowship. Is that what you call getting dragged into the gods\' plans?'],
      ['b', 'You came of your own will.'], ['a', 'I woke up in a temple with a destiny. Hard to call that will.'], ['n', 'Rauru\'s brow furrows.'],
    ],
    B: [
      ['a', 'Where were the Sages when Ganondorf took the Triforce?'], ['b', 'Waiting for the Hero.'], ['a', 'Waiting. While the desert starved.'],
      ['b', 'Our duty was to seal him, not to rule in his place.'], ['a', 'Convenient duty. Keeps your hands clean.'],
      ['b', 'Clean hands, but heavy hearts, Nabooru.'],
    ],
    A: [
      ['b', 'You were right to question me.'], ['a', 'Was I?'], ['b', 'The Sages of old saw the kingdom from a temple. We lost sight of the people in it.'],
      ['a', 'That\'s a big admission for an old man.'], ['b', 'Then let the Sage of Spirit keep us honest. Someone must.'],
      ['n', 'Nabooru studies him, then nods once.'], ['a', 'All right, old man. I\'ll keep an eye on you.'],
    ],
  },
  'koume|nabooru': {
    C: [
      ['b', 'Kee hee hee! Our old servant, standing tall again.'], ['a', 'Keep your distance, witch.'], ['b', 'You didn\'t mind my company in the Spirit Temple.'],
      ['a', 'I didn\'t have a choice in the Spirit Temple.'], ['n', 'Koume\'s broom crackles with heat as she floats away, cackling.'],
    ],
    B: [
      ['b', 'You\'re still angry, dearie? We made you strong. Armour, axe, a master\'s purpose!'], ['a', 'You made me a puppet.'],
      ['b', 'A very good puppet. You cut down three of your own sisters.'], ['n', 'Nabooru goes white.'], ['a', 'Say that again and I\'ll—'],
      ['b', 'You\'ll what? Kee hee! You\'ll do nothing. You\'re on our side now.'],
    ],
    A: [
      ['a', 'I visited their graves. My sisters.'], ['b', 'How touching.'], ['a', 'I\'m not going to kill you, Koume. That\'s not for you. It\'s for them.'],
      ['b', 'Kee… what nonsense is that?'], ['a', 'They\'d want me free. Not chained to hating you.'], ['n', 'For once, Koume has no cackle ready.'],
      ['a', 'You don\'t own me anymore. Not even my anger.'],
    ],
  },
  'kotake|nabooru': {
    C: [
      ['b', 'Ho ho! How is your head, little Nabooru? Still ringing?'], ['a', 'Clearer every day, no thanks to you.'],
      ['b', 'You were so peaceful under our spell. So obedient.'], ['n', 'Frost creeps over the ground where Kotake hovers.'], ['a', 'Peaceful. Is that what you called it?'],
    ],
    B: [
      ['a', 'There are gaps. Whole months I can\'t remember.'], ['b', 'Ho ho. Shall I tell you what you did in them?'], ['a', 'No.'],
      ['b', 'You polished your armour every night. Over and over. Because we told you to.'], ['a', 'Stop.'],
      ['n', 'Nabooru grips her own wrist hard, as if checking it is hers.'],
    ],
    A: [
      ['a', 'I remember something now. My name, whispered, while your spell was on me.'], ['b', 'Nonsense. No one could reach you.'],
      ['a', 'I reached me. I kept saying it. Nabooru. Nabooru.'], ['b', 'Hmph. A stubborn mind is an ugly thing.'],
      ['a', 'It\'s mine. That\'s all it has to be.'], ['n', 'Nabooru walks away. Kotake\'s ice melts behind her in the sun.'],
    ],
  },
  'kaepora|rauru': {
    C: [
      ['b', 'Hoo hoo! Rauru, old friend! You look exactly as stern as always.'], ['a', 'And you look exactly as feathered, Kaepora.'],
      ['b', 'Hoot! Would you like to hear a short summary of our last three centuries?'], ['a', 'Is it short?'], ['b', 'No.'],
    ],
    B: [
      ['a', 'Do you remember when the Temple of Time was first raised?'], ['b', 'Hoo… I remember the scaffolding. The Hylians were dreadful at heights.'],
      ['a', 'You spoke to them from the rafters, as I recall. Unhelpfully.'], ['b', 'I gave excellent advice! Do you want to hear it again?'],
      ['n', 'Rauru sighs, but he is smiling.'],
    ],
    A: [
      ['a', 'You took this shape so you could guide the Hero. Was it worth it?'], ['b', 'Hoo hoo… I have flown over every corner of this land.'],
      ['b', 'I have watched kingdoms rise and children grow. I would not trade the wings for the robes again.'], ['a', 'I envy you a little, old friend.'],
      ['b', 'Then come to the roof sometime. Even a Sage needs a view.'], ['n', 'Kaepora ruffles his feathers. Rauru laughs for the first time in years.'],
    ],
  },
  'dekuTree|rauru': {
    C: [
      ['a', 'Great Deku Tree. Your voice is younger than I remember.'], ['b', 'And thine older, Rauru. We both have seen too much.'],
      ['a', 'We watched the last Hero together, did we not? Before this one.'], ['b', 'And the one before him, in seed and stone.'],
    ],
    B: [
      ['b', 'Each Hero comes as a child. Always as a child.'], ['a', 'Courage is strongest before it learns fear.'],
      ['b', 'And yet each time I wish it were not so. I raised this one, Rauru. He cried when he skinned his knee.'],
      ['a', 'And I took seven years from him.'], ['n', 'They are silent for a time, each with his guilt.'],
    ],
    A: [
      ['a', 'Perhaps our duty is not to make heroes, but to leave them a world worth saving.'], ['b', 'Thou hast grown wiser in the Sacred Realm.'],
      ['a', 'Lonelier, at least. Wisdom may be the same thing.'], ['b', 'Then let us not be lonely. Watch with me.'],
      ['n', 'The two ancient guardians look out over the camp, where a boy in green is teaching soldiers to fish.'], ['a', 'He will be all right.'], ['b', 'He will.'],
    ],
  },
  'ingo|malon': {
    C: [
      ['a', 'Ingo, the horses\' water troughs are empty again.'], ['b', 'And? I\'m busy with real work.'], ['a', 'Watering them IS the work.'],
      ['n', 'Ingo grumbles and kicks the bucket toward the well.'],
    ],
    B: [
      ['a', 'You whipped Epona while I was gone, didn\'t you? There are marks.'], ['b', 'That beast wouldn\'t obey!'],
      ['a', 'She obeys kindness. You know that.'], ['b', 'Kindness never got me anything on that ranch.'], ['a', 'Then that\'s on you, not the horses.'],
      ['n', 'Malon\'s voice shakes, but she doesn\'t back down.'],
    ],
    A: [
      ['b', 'Malon. I… I fed the horses. Brushed the old mare too.'], ['a', 'You did?'], ['b', 'Don\'t make a fuss. It was a long march. They looked tired.'],
      ['a', 'Ingo, thank you.'], ['b', 'I wasn\'t fair to you, or them. Your father left me with the work and the Lon Lon name, but not the heart.'],
      ['a', 'You can learn the heart. I\'ll show you.'], ['b', '…Unbelievable. Fine.'],
    ],
  },
  'malon|saria': {
    C: [
      ['a', 'Your music! Is that from the forest?'], ['b', 'It\'s my song! Do you like it?'], ['a', 'It sounds like spring. Mine sounds like autumn, I think.'],
      ['n', 'Malon hums Epona\'s Song. Saria tries it on her ocarina.'],
    ],
    B: [
      ['a', 'Did Link really grow up in a forest where nobody gets older?'], ['b', 'He did! He was always falling out of his treehouse.'],
      ['a', 'Ha! He fell off our fence twice trying to ride Epona.'], ['b', 'That\'s my Link.'], ['a', 'He\'s everybody\'s Link, I think.'],
      ['b', 'Mm. Maybe.'],
    ],
    A: [
      ['b', 'Malon, would you teach me your song properly?'], ['a', 'Only if you teach me yours.'],
      ['n', 'They sit together and trade melodies, until the two tunes begin to weave together.'], ['b', 'Oh! They fit.'],
      ['a', 'Like they were written for each other.'], ['b', 'We should play it for him.'], ['a', 'We should. He\'ll pretend not to cry.'],
    ],
  },
  'malon|navi': {
    C: [
      ['a', 'A fairy! You\'re the one who\'s always with the fairy boy.'], ['b', 'That\'s me! Navi!'], ['a', 'You\'re so tiny. Don\'t you get tired following him?'],
      ['b', 'Every single day.'],
    ],
    B: [
      ['a', 'He never stays at the ranch long. He has supper, sleeps one night, and he\'s gone again.'], ['b', 'He\'s like that everywhere. Hey, you should hear the Gorons complain!'],
      ['a', 'I leave a lamp in the window anyway.'], ['b', 'He sees it, you know. He looks for it every time we pass.'],
      ['n', 'Malon\'s cheeks go pink.'], ['a', 'Really?'],
    ],
    A: [
      ['a', 'How do you care about someone who\'s always leaving?'], ['b', 'You go with them, if you can.'], ['a', 'And if you can\'t?'],
      ['b', 'Then you keep the lamp lit. That\'s just as brave.'], ['n', 'Navi lands on the brim of Malon\'s bonnet.'],
      ['b', 'I\'ll tell him you said hello. Every time.'], ['a', 'Thank you, Navi.'],
    ],
  },
  'ingo|talon': {
    C: [
      ['a', 'Ingo! Have you seen my good pillow?'], ['b', 'Your pillow. We\'re at war and you want your pillow.'], ['a', 'A man needs his rest.'],
      ['b', 'Unbelievable. You\'ve had seven years of rest.'],
    ],
    B: [
      ['b', 'I did all the work on that ranch. You napped and Malon sang.'], ['a', 'And you did a mighty fine job, Ingo. I always said so!'],
      ['b', 'No, you didn\'t. You never said anything. You just let me do it.'], ['n', 'Talon fidgets with his suspenders.'],
      ['a', 'I… suppose I did.'],
    ],
    A: [
      ['a', 'Ingo, I\'ve been thinking. When we get home, the ranch should be in both our names.'], ['b', 'Both… you mean it?'],
      ['a', 'You kept it running when I couldn\'t. A man should own what he built.'], ['b', 'Talon, I sold it to Ganondorf. Nearly.'],
      ['a', 'Nearly ain\'t done.'], ['n', 'Ingo looks at his boots for a long time.'], ['b', 'Unbelievable. Fine. Partners. But you\'re doing mornings.'],
    ],
  },
  'carpenterBoss|talon': {
    C: [
      ['b', 'Talon! You look like a man with workers who won\'t work.'], ['a', 'I have one worker, and he works too much and complains about it.'],
      ['b', 'Ha! I\'ve got four who do nothing and complain anyway.'], ['n', 'The two men nod, sharing a weary understanding.'],
    ],
    B: [
      ['b', 'Mine wandered off into Gerudo territory. Got themselves locked up.'], ['a', 'All four?'], ['b', 'All four! One at a time!'],
      ['a', 'My Malon would never do that.'], ['b', 'Your Malon\'s the only competent one in the whole valley, I reckon.'], ['a', 'Don\'t tell Ingo.'],
    ],
    A: [
      ['b', 'Truth is, I yell at those boys, but I\'d walk into that fortress for any of them.'], ['a', 'I know the feeling.'],
      ['b', 'Hardest part of being boss isn\'t the work. It\'s caring and not showing it.'], ['a', 'Maybe you should show it.'],
      ['b', 'Hah! And have them slack off even more?'], ['n', 'But that evening, he buys each of his carpenters a hot meal.'],
    ],
  },
  'ganondorf|ingo': {
    C: [
      ['a', 'Lord Ganondorf, sir! The horses are fed and ready.'], ['b', 'And who are you?'], ['a', 'Ingo, sir. I ran Lon Lon Ranch for you. Remember?'],
      ['n', 'Ganondorf looks at him the way one looks at mud on a boot.'], ['b', 'No.'],
    ],
    B: [
      ['a', 'I raced the Hylian boy for you. I bet the ranch!'], ['b', 'And lost.'], ['a', 'That was the horse\'s fault, sir.'],
      ['b', 'A man who blames horses will not be remembered by kings.'], ['n', 'Ingo shrinks.'],
    ],
    A: [
      ['a', 'Why don\'t you ever see me, sir? I did everything you asked.'], ['b', 'Because you did it for my favour, not for yourself.'],
      ['a', 'What\'s wrong with that?'], ['b', 'Everything. The Gerudo follow me because they would follow no one else. You would follow anyone.'],
      ['n', 'Ingo stands there, stung.'], ['a', 'Then maybe I\'ll stop following.'], ['b', 'Hm. That is the first interesting thing you have said.'],
    ],
  },
  'biggoron|medigoron': {
    C: [
      ['b', 'Big Brother! You came down the mountain!'], ['a', 'Ohhh… my eyes hurt… The army needed a smith… so I came…'],
      ['b', 'The army has a smith. Me.'], ['n', 'Biggoron\'s shadow covers half the camp as he sits down, very slowly.'], ['a', 'Two smiths… then…'],
    ],
    B: [
      ['b', 'My Giant\'s Knife is the most famous blade in Hyrule.'], ['a', 'It… breaks…'], ['b', 'Only sometimes!'],
      ['a', 'My Biggoron\'s Sword… does not break…'], ['b', 'Because it took you three days to make one! I make ten a week!'],
      ['a', 'Ohhh… ten broken knives…'], ['n', 'Medigoron stomps off. The ground shakes for a while.'],
    ],
    A: [
      ['b', 'Brother. Show me how you temper the edge.'], ['a', 'Ohhh… you have never asked before…'], ['b', 'I am asking now.'],
      ['n', 'Biggoron\'s huge hands guide Medigoron\'s hammer, slow and patient.'], ['a', 'Slower… listen to the metal…'], ['b', 'It sounds… different.'],
      ['a', 'That is the sound… of a blade that will not break…'],
    ],
    S: [
      ['a', 'Little Brother… I have something for you…'], ['n', 'He lowers a great hammer, scarred and old, into Medigoron\'s arms.'],
      ['b', 'This is our father\'s hammer.'], ['a', 'You should carry it now… My eyes… are not what they were…'],
      ['b', 'Brother, I cannot take this. You are the better smith.'], ['a', 'Ohhh… no… you are the faster one… Hyrule needs fast, now…'],
      ['b', 'Then we will forge together. Your patience and my speed. Goro!'], ['a', 'Goro…'],
    ],
  },
  'biggoron|link': {
    C: [
      ['a', 'Ohhh… you are the one who brought me the Eyedrops… so small…'], ['b', 'You\'re very big.'],
      ['a', 'Ohhh… my eyes are clear now… thanks to you… What do you need, brother…'], ['b', 'A sword that won\'t break.'],
      ['n', 'Biggoron smiles so wide the camp seems to tilt.'],
    ],
    B: [
      ['a', 'Give me your hand… the sword hand…'], ['n', 'Link holds it out. Biggoron measures it against a fingertip the size of a boulder.'],
      ['a', 'Ohhh… you swing low… and fast… The blade must be balanced near the hilt…'], ['b', 'You can tell that from my hand?'],
      ['a', 'A smith… knows…'],
    ],
    A: [
      ['a', 'It is done… Take it…'], ['n', 'He sets down a two-handed blade, gleaming and enormous, its grip wrapped in Goron leather.'],
      ['b', 'It\'s beautiful.'], ['a', 'It took three days… I did not sleep… I thought about who would carry it…'],
      ['b', 'I\'ll take care of it.'], ['a', 'No… let it take care of you… That is what it is for…'],
    ],
  },
  'link|medigoron': {
    C: [
      ['a', 'You! I sold you a Giant\'s Knife. Did it break?'], ['b', 'Yes.'], ['a', 'Goro… how long did it last?'], ['b', 'Three fights.'],
      ['n', 'Medigoron sighs like a rockslide.'], ['a', 'Three. A record.'],
    ],
    B: [
      ['a', 'My brother\'s sword does not break. Everyone tells me so.'], ['b', 'It\'s good.'], ['a', 'So is mine! Mine is just… brittle.'],
      ['b', 'Maybe it\'s too thin near the tip.'], ['a', 'Hmm? Show me where.'], ['n', 'Link traces the line where the blade cracked last time. Medigoron leans in, intent.'],
    ],
    A: [
      ['a', 'Here. Giant\'s Knife, mark two.'], ['n', 'The new blade is a little shorter, a little thicker, with a ridge down its spine.'],
      ['b', 'You changed the tip.'], ['a', 'You told me. I listened. A smith must listen to warriors.'], ['b', 'It feels right.'],
      ['a', 'Then go and break it. If it lasts four fights, I win.'], ['b', 'Deal.'],
    ],
  },
  'mido|navi': {
    C: [
      ['b', 'You! Mido! I heard what you said to Link this morning!'], ['a', 'I only said his tunic was muddy.'],
      ['b', 'You said he looked like a Deku Baba ate him and spat him out!'], ['a', 'Well, he did.'], ['n', 'Navi glows a sharp, angry red.'],
    ],
    B: [
      ['b', 'Why are you so mean to him? He saved the forest!'], ['a', 'He didn\'t have a fairy for years. Everyone laughed. I was just… joining in.'],
      ['b', 'That\'s not a reason.'], ['a', 'It\'s easier to laugh with everyone than be the one they laugh at.'], ['n', 'Navi\'s glow softens a little.'],
      ['b', 'Oh. Hey… listen. That\'s still not okay.'], ['a', 'I know.'],
    ],
    A: [
      ['a', 'I told Link sorry. For all of it.'], ['b', 'Really? What did he say?'], ['a', 'He said "Okay." Just "Okay."'],
      ['b', 'That means a lot coming from him!'], ['a', 'It does?'], ['b', 'Trust me. I\'ve been listening to him for years.'],
      ['n', 'Mido grins, and Navi does a small, approving loop.'],
    ],
  },
  'dekuTree|mido': {
    C: [
      ['a', 'G-Great Deku Tree! I didn\'t know you could talk again!'], ['b', 'I can, young Mido. Art thou keeping the Kokiri well?'],
      ['a', 'Of course! I\'m the boss!'], ['b', 'Mm. And what does a boss do?'], ['a', 'Tells everyone what to do.'], ['n', 'The Deku Sprout rustles thoughtfully.'],
    ],
    B: [
      ['b', 'I am told thou didst block the path to my meadow, long ago.'], ['a', 'I was protecting it!'], ['b', 'From whom?'],
      ['a', 'From… Link. He didn\'t have a sword or shield.'], ['b', 'Then thou wert keeping him safe, in thy way.'], ['a', 'Uh. Yeah! That\'s what I was doing.'],
    ],
    A: [
      ['a', 'The Kokiri are scared when Saria\'s gone. They come to me now.'], ['b', 'And what dost thou do?'],
      ['a', 'I tell them it\'s okay. Even when I don\'t know. Is that bad?'], ['b', 'No, child. That is what leaders do.'],
      ['b', 'A boss commands. A leader comforts. Thou art becoming the second.'], ['n', 'Mido stands up very straight.'], ['a', 'I\'ll be a good one. I promise.'],
    ],
  },
  'dampe|maskSalesman': {
    C: [
      ['b', 'Oh, my! A gravekeeper! Do you sell anything?'], ['a', 'Heh heh… I dig things up. Don\'t sell \'em.'], ['b', 'What a waste!'],
      ['a', 'Dead folks don\'t like their things sold.'], ['n', 'The salesman\'s grin seems to widen just slightly.'], ['b', 'Mmm. Some of them don\'t mind at all.'],
    ],
    B: [
      ['a', 'Found this in an old grave last spring.'], ['n', 'Dampé unwraps a cracked wooden mask with a carved, weeping face.'],
      ['b', 'Oh… my. Oh, my, my.'], ['a', 'Gives me bad dreams.'], ['b', 'It would. Whoever wore this died sad.'],
      ['a', 'Can you take it?'], ['b', 'I can. Masks are my business. Even the unhappy ones.'],
    ],
    A: [
      ['b', 'I cleaned your mask, gravekeeper. Here, look.'], ['n', 'The carved face has been sanded and painted. It now looks almost serene.'],
      ['a', 'Heh… it looks happy.'], ['b', 'A mask can be healed, if someone cares enough to try.'], ['a', 'You\'re a strange fella, you know that.'],
      ['b', 'Oh, I know. So are you. That\'s why we get along.'],
    ],
  },
  'carpenterBoss|dampe': {
    C: [
      ['b', 'Gravekeeper! Your fence is falling down, you know.'], ['a', 'Heh. So\'s Kakariko\'s.'], ['b', 'Not my fault! My boys built half of it.'],
      ['a', 'That\'s why it\'s falling down.'], ['n', 'The Carpenter Boss starts to argue, then stops.'],
    ],
    B: [
      ['a', 'Nobody\'s mended the graveyard wall in fifteen years. Royal family stopped paying for it.'], ['b', 'Nobody\'s paid for the bridge at Gerudo Valley either.'],
      ['a', 'Or the well.'], ['b', 'Or the road to Lon Lon.'], ['a', 'Heh. Kingdom\'s falling apart and nobody notices till it\'s a hole.'],
      ['b', 'That\'s when they call us.'],
    ],
    A: [
      ['b', 'After the war, I\'m fixing your wall. No charge.'], ['a', 'Eh? What\'s the catch?'], ['b', 'No catch. You keep the dead in, I keep the living housed.'],
      ['b', 'Somebody has to hold this country together. Might as well be the shovel and the hammer.'], ['a', 'Heh heh… I like that.'],
      ['n', 'They shake hands, rough and calloused.'],
    ],
  },
  'ganondorf|maskSalesman': {
    C: [
      ['a', 'Oh my, a king of the desert! Would you care for a mask?'], ['b', 'I have no need for toys.'],
      ['a', 'Oh, but everyone needs a face they can take off.'], ['n', 'Ganondorf looks at him for a long moment.'], ['b', 'Begone.'],
    ],
    B: [
      ['a', 'I knew a little imp once who stole a very powerful mask.'], ['b', 'And?'], ['a', 'It nearly brought the moon down on a whole land.'],
      ['b', 'A weak vessel for a strong power.'], ['a', 'Oh, no. The strong ones are worse. They don\'t know when to take it off.'],
      ['n', 'Ganondorf\'s hand drifts toward the back of his own wrist, where the Triforce mark burns.'],
    ],
    A: [
      ['b', 'You are not an ordinary merchant.'], ['a', 'Oh, I am a very ordinary merchant. I simply sell extraordinary things.'],
      ['b', 'Then sell me nothing. I already wear the gods\' mark.'], ['a', 'Ah. But a relic of power is still a mask, my dear king.'],
      ['a', 'Wear it too long, and there is nothing beneath.'], ['n', 'For once, Ganondorf has no reply.'], ['a', 'Do be careful. Ohohoho.'],
    ],
  },
  'greatFairy|navi': {
    C: [
      ['a', 'Hehehe! Little Navi! You\'ve grown so bright!'], ['b', 'Great Fairy! You\'re here too?'],
      ['a', 'Where else would I be? Someone has to heal these clumsy soldiers.'], ['n', 'The Great Fairy blows a kiss. Navi spins in delight.'],
    ],
    B: [
      ['b', 'Is it always this hard? Being a guardian fairy?'], ['a', 'Oh, harder. Your charge runs, and you must follow.'],
      ['b', 'He never listens!'], ['a', 'They never do, dearie. But they always hear.'], ['b', 'What\'s the difference?'],
      ['a', 'You\'ll know when he remembers your words when you\'re not there.'],
    ],
    A: [
      ['b', 'Great Fairy… what happens to a guardian fairy when their hero doesn\'t need them anymore?'], ['a', 'Ah. So that is what troubles you.'],
      ['a', 'They return to the fountains, or they find another child who is lost.'], ['b', 'I don\'t want another child.'],
      ['a', 'Then you have loved this one very well. That is the whole duty, little one.'], ['n', 'Navi rests on the Great Fairy\'s palm, small and quiet.'],
    ],
  },
  'greatFairy|rauru': {
    C: [
      ['a', 'Hehehe! The old Sage of Light. Still wearing those robes?'], ['b', 'Still laughing like that, Great Fairy?'],
      ['a', 'Always. Laughter is the first magic.'], ['b', 'Some would say light was.'], ['n', 'They regard each other like old rivals.'],
    ],
    B: [
      ['b', 'The Golden Goddesses left power behind when they departed. You and I both draw on it.'], ['a', 'You draw. I bathe in it, darling.'],
      ['b', 'The fountains were blessed by Nayru, were they not?'], ['a', 'Farore, mostly. Din did the flashier spells.'],
      ['b', 'You speak as if you knew them.'], ['a', 'Hehehe. Maybe I did.'],
    ],
    A: [
      ['b', 'I have studied sacred magic for ten thousand years and still do not know where it begins.'], ['a', 'It begins wherever someone needs help, Rauru.'],
      ['b', 'That is a very simple answer.'], ['a', 'Sacred things usually are. Mortals make them complicated.'],
      ['n', 'She touches his forehead. A warm light lingers there.'], ['b', 'I shall write that down.'], ['a', 'Don\'t. Just remember it.'],
    ],
  },
  'jabuJabu|kingZora': {
    C: [
      ['a', 'Lord Jabu-Jabu! Have you eaten today? You look thin.'], ['n', 'Jabu-Jabu is not thin in the slightest.'],
      ['a', 'Bring more fish! The finest! Our patron deserves nothing less.'], ['b', 'Hrrrmmm.'],
    ],
    B: [
      ['a', 'My father fed you. His father fed you. Every Zora King since the Domain was founded.'], ['n', 'Jabu-Jabu blows bubbles.'],
      ['a', 'We called it tradition. Truly, I simply cannot bear to see you hungry.'], ['b', 'Hrrrm.'],
      ['a', 'Yes, yes. I know. My waistline speaks for itself.'],
    ],
    A: [
      ['a', 'When you fell ill, I did nothing. I sent my daughter. She was only a child.'], ['n', 'Jabu-Jabu drifts closer, a mountain in the water.'],
      ['a', 'A king should not hide behind his own child.'], ['b', 'Hmmmmmmm.'], ['a', 'You forgive me so easily. You always have.'],
      ['n', 'The great fish rests its chin on the shore beside him.'],
    ],
    S: [
      ['a', 'When the ice took the Domain, I thought it was the end of us both.'], ['b', 'Hrrrmmmm…'],
      ['a', 'But you are here. And Ruto. And I am still too fat to swim properly.'], ['n', 'Jabu-Jabu makes a sound like rumbling laughter.'],
      ['a', 'I swear to you, as long as there are Zora, you will never go hungry, nor alone.'], ['b', 'Hrrrmm.'],
      ['n', 'King Zora rests a hand on the great fish\'s side, and the two old guardians stay that way until dusk.'],
    ],
  },
  'darunia|kingZora': {
    C: [
      ['b', 'King Zora! It has been too long since a Goron visited your Domain!'], ['a', 'Oh my. Yes. The last one fell in the fountain.'],
      ['b', 'HAHA! That was my uncle!'], ['a', 'It took us a week to drain it.'],
    ],
    B: [
      ['a', 'There is the matter of the ore shipments, Darunia. They have been late.'], ['b', 'Because Dodongos ate the road!'],
      ['a', 'And the fish payments to Goron City have been… delayed, on account of that.'], ['b', 'Bah! Then we are even!'],
      ['a', 'Diplomacy does not work that way.'], ['b', 'Goron diplomacy does!'],
    ],
    A: [
      ['a', 'My people froze while yours burned. Neither of us came to the other\'s aid.'], ['b', 'Hm. That troubles me too, King.'],
      ['a', 'Let us agree, then. When one is threatened, the other comes.'], ['b', 'A sworn brotherhood between mountain and river!'],
      ['n', 'Darunia offers his fist. King Zora considers it, then very carefully bumps it with his own.'], ['b', 'HAHAHA! Brother!'],
    ],
  },
  'ganondorf|koume': {
    C: [
      ['b', 'Kee hee hee! Our little boy, all grown up and leading armies!'], ['a', 'Koume. Do not call me that in front of the soldiers.'],
      ['b', 'But it\'s true, my king! I wiped your nose for three hundred years!'], ['n', 'Ganondorf does not dignify this with an answer.'],
    ],
    B: [
      ['b', 'You were such a fierce little thing. You bit the first Gerudo who tried to hold you.'], ['a', 'She deserved it.'],
      ['b', 'Kee hee! That\'s what I said. Kotake wanted to scold you.'], ['a', 'And you didn\'t.'],
      ['b', 'Fire doesn\'t scold, dear. Fire teaches you to burn.'],
    ],
    A: [
      ['a', 'You taught me magic before I could walk.'], ['b', 'Of course. A king must be dangerous before he\'s tall.'],
      ['a', 'Did you ever wonder if I wanted it?'], ['b', 'Kee hee… what a strange question. You were born for it.'],
      ['a', 'Hm. Born for it. Yes.'], ['n', 'He watches the fire for a long time. Koume, for once, does not cackle.'],
    ],
    S: [
      ['b', 'When you were very small, you had nightmares. Do you remember?'], ['a', 'No.'],
      ['b', 'You dreamed of a boy in green. You woke up screaming, and I sang to you.'], ['n', 'Ganondorf goes still.'],
      ['a', 'A song. What song?'], ['b', 'Just a desert song. Kee hee… you\'d hate it now.'], ['a', 'Sing it anyway.'],
      ['n', 'Koume sings, cracked and quiet. The Gerudo King listens to the end.'],
    ],
  },
  'ganondorf|kotake': {
    C: [
      ['b', 'Ho ho! My son. You are slouching in your throne again.'], ['a', 'It is a camp stool, Kotake.'],
      ['b', 'A king\'s posture does not depend on the furniture.'], ['n', 'Ganondorf straightens, irritated with himself for doing it.'],
    ],
    B: [
      ['b', 'You let the Hylian boy escape twice this week.'], ['a', 'I let nothing. He is quick.'], ['b', 'Excuses. The Demon King does not make excuses.'],
      ['a', 'Then the Demon King will make a plan.'], ['b', 'Ho ho. That\'s my boy.'],
    ],
    A: [
      ['a', 'You expect a great deal of me, Kotake.'], ['b', 'We expect you to rule the world. That is not a great deal. That is the minimum.'],
      ['a', 'And if I fail?'], ['b', 'Then you were not our son after all.'], ['n', 'Ganondorf says nothing, but his jaw tightens.'],
      ['b', 'Ho ho… you won\'t fail. We didn\'t raise a failure.'],
    ],
    S: [
      ['a', 'Answer me honestly. Would you love me if I were not the king?'], ['b', 'Love? Ho… what an odd thing for you to ask.'],
      ['a', 'Answer.'], ['n', 'Kotake drifts in silence for a long time.'], ['b', 'I would be disappointed. I would still come when you called.'],
      ['a', 'Then that will have to do.'], ['b', 'Ho ho. It always has, my boy.'],
    ],
  },
  'ganondorf|phantomGanon': {
    C: [
      ['n', 'Phantom Ganon sits astride its spectral horse, a perfect copy of its master down to the cape.'], ['a', 'You still answer when called. Good.'],
      ['b', 'I answer. I always answer.'], ['a', 'You were made to.'],
    ],
    B: [
      ['b', 'In the Forest Temple, I held the boy at bay for an hour.'], ['a', 'And then he beat you.'], ['b', 'He beat me. He has also beaten you.'],
      ['n', 'Ganondorf\'s eyes narrow.'], ['a', 'Careful, shadow.'], ['b', 'I am your shadow. Careful is not something you gave me.'],
    ],
    A: [
      ['b', 'Could I surpass you, master? If I were given the Triforce?'], ['a', 'No.'], ['b', 'Why not?'],
      ['a', 'Because you want what I want. You are a hunger with no history. I am the history.'],
      ['b', 'Then I will never be more than you.'], ['a', 'Correct. And never less. Be content with that.'],
      ['n', 'The phantom bows, slowly, and fades into the paintings on the tent walls.'],
    ],
  },
  'darkLink|ganondorf': {
    C: [
      ['a', 'My Water Temple creation. You failed.'], ['b', 'He put down his sword. I didn\'t know what to do.'],
      ['a', 'You were meant to be his every flaw. Do better.'], ['n', 'Dark Link watches Ganondorf the way Link would: wary, still, silent.'],
    ],
    B: [
      ['a', 'Tell me his weaknesses.'], ['b', 'He trusts too much. He forgets to eat. He worries about the girl.'],
      ['a', 'Which girl?'], ['b', 'All of them.'], ['n', 'Ganondorf laughs, a short, cold bark.'], ['a', 'Useful.'],
    ],
    A: [
      ['b', 'I won\'t do it.'], ['a', 'Do what?'], ['b', 'Use what I know against him. The parts of him I carry aren\'t yours.'],
      ['a', 'You are mine. I made you.'], ['b', 'You made me from him. That means part of me is brave, too.'],
      ['n', 'Ganondorf studies the shadow with something almost like interest.'], ['a', 'Then I made you too well.'],
    ],
  },
  'ganondorf|volvagia': {
    C: [
      ['n', 'Volvagia coils through the lava pit at the edge of camp, bursting up in a spray of embers.'], ['a', 'You remember who raised you from the ash.'],
      ['b', 'Hhhrrrraaagh!'], ['n', 'The dragon snaps at the air an arm\'s length from Ganondorf\'s face. He does not flinch.'], ['a', 'Good. You remember.'],
    ],
    B: [
      ['n', 'Ganondorf tosses a slab of raw Dodongo meat into the pit. Volvagia ignores it, watching him.'], ['a', 'The Gorons killed you once. A hammer to the skull.'],
      ['b', 'Grrrrrk.'], ['a', 'I gave you back your fire. Now you will burn what I tell you to burn.'],
      ['n', 'Slowly, the dragon lowers its head and takes the meat.'],
    ],
    A: [
      ['n', 'After the battle, Volvagia curls around the base of Ganondorf\'s tent, its scales glowing like coals.'], ['a', 'Hm. You came back without being called.'],
      ['b', 'Hrrrmm.'], ['a', 'Even beasts can learn loyalty, it seems. Or habit.'], ['n', 'He lays a hand on the scorching scales. The dragon allows it.'],
      ['a', 'Rest. We hunt again at dawn.'],
    ],
  },
  'darkLink|phantomGanon': {
    C: [
      ['n', 'Two shadows sit at the edge of the firelight, neither casting one of its own.'], ['a', 'You are the reflection.'], ['b', 'You\'re the painting.'],
      ['a', 'We are both copies.'], ['b', 'Of men who don\'t want us.'],
    ],
    B: [
      ['a', 'Do you dream?'], ['b', 'Only his dreams. Mostly of a forest, and a fairy.'], ['a', 'I dream of a throne. It is not mine.'],
      ['b', 'Nothing is ours.'], ['n', 'Phantom Ganon\'s horse paws the ground, silent.'], ['a', 'Perhaps that is a kind of freedom.'],
    ],
    A: [
      ['b', 'If they both died, would we keep going?'], ['a', 'I have wondered. I think we would fade.'], ['b', 'I don\'t want to fade.'],
      ['a', 'Then do something your original never would. Something that is yours alone.'], ['b', 'Like what?'],
      ['a', 'Like sitting here with me.'], ['n', 'The two imitations stay by the fire until it burns out.'],
    ],
  },
  'darunia|volvagia': {
    C: [
      ['a', 'That beast! In OUR camp?!'], ['n', 'Volvagia rises from the lava pit, hissing at the Goron chief.'], ['b', 'Hhhssssss!'],
      ['a', 'My ancestor smashed your skull with the Megaton Hammer, dragon! I can do it again!'], ['n', 'Soldiers pull them apart before the camp catches fire.'],
    ],
    B: [
      ['a', 'Gorons and dragons have fought since the first fire on Death Mountain.'], ['b', 'Grrrrrk.'],
      ['a', 'You ate our people. We broke your bones. Ancient business.'], ['n', 'Volvagia lowers itself into the lava, eyes still on him.'],
      ['a', 'But today you burned a line of Moblins before they reached my brothers. Why?'], ['n', 'The dragon only snorts sparks.'],
    ],
    A: [
      ['a', 'Dragon. I brought you rocks.'], ['n', 'Darunia dumps a sack of glowing ore beside the pit.'], ['a', 'Gorons share their food after a battle. Even with enemies.'],
      ['n', 'Volvagia sniffs the ore suspiciously, then crunches a piece.'], ['b', 'Hrrrrm.'], ['a', 'HAHA! Good, eh? Fine taste for a monster!'],
      ['a', 'Truce, then. For now. But if you eat a Goron, I bring the hammer.'],
    ],
  },
  'dekuTree|queenGohma': {
    C: [
      ['n', 'Queen Gohma skitters along the camp\'s edge, her great eye fixed on the Deku Sprout.'], ['a', 'Thou. Thou art the one who poisoned me.'],
      ['b', 'Skreeeee!'], ['n', 'She clings to a tree trunk, clicking her mandibles.'], ['a', 'I remember thy legs inside my roots. Begone.'],
    ],
    B: [
      ['a', 'Thou didst lay eggs in my heart. A hundred of thy children.'], ['n', 'Gohma\'s eye contracts.'],
      ['a', 'Did Ganondorf send thee? Or wert thou simply hungry?'], ['b', 'Kkkrrrkkk.'], ['a', 'Hungry. I thought as much.'],
      ['n', 'The parasite retreats a little, but does not leave.'],
    ],
    A: [
      ['n', 'Gohma nests in a hollow near the Deku Sprout. She keeps the beetles off its leaves.'], ['a', 'What is this? Thou guardest me now?'],
      ['b', 'Skrrrk.'], ['a', 'A strange thing, for a parasite to keep its host.'], ['n', 'The great eye blinks, slowly.'],
      ['a', 'Very well. Stay, then. But eat the beetles, not my roots.'],
    ],
  },
  'barinade|jabuJabu': {
    C: [
      ['n', 'Barinade floats near the water\'s edge, tentacles trailing. Jabu-Jabu turns away from it, shuddering.'], ['a', 'Hrrrmmm!'],
      ['b', 'Zzzzzzt.'], ['n', 'Sparks dance along Barinade\'s jellyfish shell. Every Zora nearby takes a step back.'],
    ],
    B: [
      ['n', 'When Barinade drifts too close to the spring, Jabu-Jabu sends a great wave over the bank, drenching it.'],
      ['b', 'Zzzt! Zzzzt!'], ['a', 'Hrrrrmmmmm.'], ['n', 'The parasite retreats, crackling furiously. Jabu-Jabu looks extremely satisfied.'],
    ],
    A: [
      ['n', 'During a lightning storm, Barinade hovers above the spring, drawing the bolts into itself.'],
      ['n', 'None of the lightning reaches the water where Jabu-Jabu sleeps.'], ['a', 'Hrrrmm…?'], ['b', 'Zzzt.'],
      ['n', 'At dawn, the great fish lets the parasite drift down to the shallows to rest. It is not friendship. But it is no longer war.'],
    ],
  },
  'bongoBongo|impa': {
    C: [
      ['n', 'Two disembodied hands drum against the ground near Impa\'s tent. A single red eye watches from the shadows.'],
      ['a', 'I sealed you beneath Kakariko once.'], ['b', 'Boom… boom… boom.'], ['a', 'Do not think I have forgotten how.'],
    ],
    B: [
      ['a', 'The Sheikah dug the Shadow Temple to bury Hyrule\'s secrets. Torture rooms. Executions. Things the royals denied.'],
      ['n', 'Bongo Bongo\'s drumming slows.'], ['a', 'You were born from that blood. From the dark the crown hid.'], ['b', 'Boom… boom.'],
      ['a', 'My people built your prison. My people built you, too, I suppose.'],
    ],
    A: [
      ['n', 'Impa sits in the dark beside the great hands, as she might beside a prisoner\'s cell.'], ['a', 'I never asked what you were before. A man? Many men?'],
      ['b', 'Boom… boom… boom…'], ['a', 'Many, then. All the ones Hyrule forgot.'], ['n', 'The eye closes for the first time.'],
      ['a', 'I will remember them. That much the Sheikah can do.'],
    ],
  },
  'morpha|ruto': {
    C: [
      ['n', 'A tendril of water rises from a camp barrel and takes the shape of a grasping hand. The nucleus glows red at its centre.'],
      ['a', 'You! You turned our Water Temple into a sewer!'], ['b', 'Blrrrrrb.'], ['a', 'Don\'t you blrrb at me.'],
    ],
    B: [
      ['a', 'I spent a week scrubbing the temple after Link beat you. A week!'], ['n', 'Morpha sloshes sullenly in its barrel.'],
      ['a', 'You fouled the source of Lake Hylia. The fish died. Children got sick.'], ['b', 'Blrb.'],
      ['a', 'Is that remorse? It sounded like remorse.'],
    ],
    A: [
      ['a', 'All right, amoeba. You live in water. You can feel the bad in it, can\'t you?'], ['n', 'Morpha\'s nucleus pulses.'],
      ['a', 'Then help me clean the camp wells. Every one you clear, I don\'t freeze you.'], ['b', 'Blrrrrb!'],
      ['n', 'By evening, the wells run clear for the first time on the march.'], ['a', 'Hmph. Perhaps you\'re not entirely disgusting.'],
    ],
  },
  'dampe|stalfos': {
    C: [
      ['a', 'Heh… another one climbed out. Back in the hole with you.'], ['n', 'The Stalfos rattles its jaw and draws a rusted blade.'],
      ['b', 'Krrrk.'], ['a', 'Don\'t you wave that at me. I buried your cousin last Tuesday.'],
    ],
    B: [
      ['a', 'Folks become Stalfos when they get lost and forget themselves. That\'s what my granddad said.'], ['n', 'The Stalfos sits on a gravestone, listening.'],
      ['a', 'Were you a soldier? A farmer? Got any family waiting?'], ['b', 'Krrk… krk.'], ['a', 'Don\'t remember. Heh. Me neither, some days.'],
    ],
    A: [
      ['n', 'Dampé hammers a small wooden marker into the ground and carves a sword on it.'], ['a', 'There. That one\'s yours.'],
      ['b', 'Krrk?'], ['a', 'Everybody deserves a grave, even the ones who walk out of \'em.'], ['n', 'The Stalfos stares at the marker a long while.'],
      ['a', 'When you\'re ready to rest, it\'ll be here.'],
    ],
  },
  'darkLink|stalfos': {
    C: [
      ['n', 'Dark Link and a Stalfos face each other in the practice ring. Their stances are almost identical.'], ['a', 'You fight like a Hylian knight.'],
      ['b', 'Krrk.'], ['a', 'You don\'t remember being one.'],
    ],
    B: [
      ['a', 'I was born in a temple with no memories at all. Just his.'], ['b', 'Krrk… krk.'], ['a', 'You had memories once. They rotted.'],
      ['n', 'The Stalfos taps its own skull with a bony finger.'], ['a', 'Empty. Like me.'],
    ],
    A: [
      ['n', 'They spar until dusk. Neither tires. Neither wins.'], ['a', 'We don\'t need memories to be good at this.'],
      ['b', 'Krrrk.'], ['a', 'Maybe what we do now is enough. Maybe that\'s who we are.'],
      ['n', 'The Stalfos raises its sword in salute. Dark Link returns it, a gesture neither of them was taught.'],
    ],
  },
  'ganondorf|moblin': {
    C: [
      ['a', 'Grrah! Big boss!'], ['b', 'You are standing in my way.'], ['n', 'The Moblin scrambles aside so quickly it trips over its spear.'],
      ['a', 'Sorry, boss! Sorry!'],
    ],
    B: [
      ['a', 'Boss strong. Strongest. Moblins follow strongest.'], ['b', 'And if someone stronger came?'],
      ['a', 'Grr… Moblins follow them?'], ['b', 'Then you will follow me until you die, because no one stronger will come.'], ['a', 'Yes, boss!'],
    ],
    A: [
      ['a', 'Boss. Moblin hold the bridge today. Nobody pass. Even when hurt.'], ['b', 'I saw.'], ['a', 'Boss see? Grrah!'],
      ['b', 'Fear holds an army together. But a beast that stands its ground while bleeding… that is something else.'],
      ['n', 'Ganondorf tosses the Moblin a fresh slab of meat.'], ['b', 'Eat. You earned it.'], ['a', 'GRRAH! Boss best boss!'],
    ],
  },
  'ironKnuckle|nabooru': {
    C: [
      ['n', 'An Iron Knuckle stands motionless at the edge of camp, axe resting on the ground.'], ['b', 'I wore armour like that.'],
      ['a', '…'], ['b', 'Can you hear me in there?'], ['n', 'The helmet turns, slowly, toward her.'],
    ],
    B: [
      ['b', 'Twinrova\'s spell is like being underwater. You see yourself moving and can\'t stop.'], ['a', '…Yes.'],
      ['b', 'You spoke!'], ['a', 'It… is hard. The armour… speaks louder.'], ['b', 'Then talk anyway. Even one word a day.'],
    ],
    A: [
      ['a', 'I… remember… a name.'], ['b', 'Yours?'], ['a', 'Mine. Not the witches\'.'], ['n', 'Nabooru helps unbuckle the great helmet. The face beneath is pale, tired, and Gerudo.'],
      ['b', 'Welcome back, sister.'], ['a', 'The armour… is only armour now.'], ['b', 'Good. Then it\'s yours to wear or leave.'],
    ],
  },
  'businessScrub|maskSalesman': {
    C: [
      ['a', 'Oh, oh! Fine customer! Deku Nuts, only twenty Rupees!'], ['b', 'Oh my! A fellow merchant! But I don\'t sell nuts.'],
      ['a', 'You sell faces? Faces can\'t be thrown at enemies!'], ['b', 'Oh, but they can be thrown at feelings.'], ['n', 'The Business Scrub hides back in his flower, confused.'],
    ],
    B: [
      ['a', 'My technique: spit at the customer until they listen! Then sell!'], ['b', 'My technique: lend the mask, let the customer sell it, take a cut.'],
      ['a', 'Trust? In business? Crazy!'], ['b', 'Trust brings repeat customers, little one.'], ['a', 'Spitting brings repeat customers too. Angry ones.'],
    ],
    A: [
      ['a', 'I tried your way. I lent a soldier a Deku Shield on credit.'], ['b', 'And?'], ['a', 'He paid me back double! He said thank you!'],
      ['b', 'Oh my. Now you\'ve found happiness.'], ['a', 'No, I found profit! …But happiness too, maybe.'],
      ['n', 'They shake hands. The salesman\'s grin is enormous; the scrub\'s eyes glow red.'],
    ],
  },
  'dekuScrub|saria': {
    C: [
      ['a', 'Don\'t hurt me! I\'ll tell you a secret! …I don\'t have a secret.'], ['b', 'I wasn\'t going to hurt you!'],
      ['a', 'Oh. Everyone from the forest usually throws my nuts back at me.'], ['n', 'Saria kneels beside his patch of grass.'], ['b', 'That sounds awful.'],
    ],
    B: [
      ['a', 'The Kokiri don\'t like Deku Scrubs. The Skull Kids don\'t either.'], ['b', 'The Lost Woods aren\'t easy for anyone.'],
      ['a', 'I used to spit at travellers. It\'s what we do.'], ['b', 'Do you want to do something else?'], ['a', 'I don\'t know. Nobody ever asked.'],
    ],
    A: [
      ['b', 'Come back to the forest with me, after. The Deku Sprout could use a gardener.'], ['a', 'Me? A Scrub?'],
      ['b', 'Scrubs are part of the forest too. The Great Deku Tree said so.'], ['a', 'He did?'], ['b', 'Well, he said everything green is. That includes you.'],
      ['n', 'The Deku Scrub pops all the way out of his flower for the first time.'], ['a', 'Then I\'ll come!'],
    ],
  },
  'beth|joelle': {
    C: [
      ['a', 'Beth! The torches went out again and you just floated there!'], ['b', 'They will be lit again. There is no hurry.'],
      ['a', 'There is ALWAYS a hurry!'], ['n', 'Joelle\'s lantern flares red. Beth\'s glows a cool, unbothered blue.'],
    ],
    B: [
      ['b', 'You burn too hot, sister. You flicker out faster for it.'], ['a', 'And you\'re so cold you never do anything at all!'],
      ['b', 'I do things. Slowly. Correctly.'], ['a', 'You took a century to choose a corridor to haunt!'], ['b', 'It was a very good corridor.'],
    ],
    A: [
      ['a', 'You stood by me today. When the soldiers came at my flank.'], ['b', 'Naturally. You charged without looking.'],
      ['a', 'I always do.'], ['b', 'And I always look. That is why we work, Joelle.'], ['n', 'The red lantern and the blue drift a little closer.'],
    ],
    S: [
      ['a', 'When the Hero put out my flame, the first thing I saw in the dark was you.'], ['b', 'I was waiting. I am patient, as you say.'],
      ['a', 'I used to think that was a flaw.'], ['b', 'And now?'], ['a', 'Now I think it\'s why I always come back.'],
      ['n', 'Their lanterns touch, and for a moment the flame burns violet.'], ['b', 'Then I will keep waiting, sister. Always.'],
    ],
  },
  'amy|joelle': {
    C: [
      ['a', 'Amy. Where is my lantern?'], ['b', 'Hee hee! What lantern?'], ['a', 'The one you are holding behind your back.'],
      ['b', 'Ohhh, THIS lantern.'], ['n', 'Joelle snatches it back, flaring crimson.'],
    ],
    B: [
      ['a', 'You turned the camp\'s soup green.'], ['b', 'It was already green! I just made it glow.'], ['a', 'The soldiers think it\'s cursed!'],
      ['b', 'Maybe it is. Hee hee!'], ['a', 'One more prank, Amy, and I\'ll lock you in a painting myself.'],
    ],
    A: [
      ['b', 'You know why I play tricks on you most?'], ['a', 'Because you\'re a pest.'], ['b', 'Because you\'re the only one who always notices.'],
      ['n', 'Joelle\'s flame dims a little.'], ['a', 'That\'s… a strange compliment.'], ['b', 'Hee hee. I\'m a strange ghost.'],
    ],
    S: [
      ['a', 'I found a spider in my lantern this morning. Very funny.'], ['b', 'That one wasn\'t me! Honest!'], ['a', '…Really?'],
      ['b', 'Really. But I\'ll take the credit if you want.'], ['n', 'Joelle laughs, a sound like crackling embers.'],
      ['a', 'Keep your tricks, little sister. Just don\'t ever stop.'], ['b', 'Never. Hee hee. Not for all eternity.'],
    ],
  },
  'joelle|meg': {
    C: [
      ['b', 'I decided where we haunt tonight. The east tower.'], ['a', 'YOU decided? I\'m the eldest.'],
      ['b', 'And I\'m the strongest. I hold the last room of the Forest Temple, not you.'], ['n', 'Their lanterns flare against one another.'],
    ],
    B: [
      ['a', 'Ganondorf gave you the final room because you can split into four. That\'s all.'], ['b', 'That\'s plenty.'],
      ['a', 'It isn\'t leading. Leading is making the others follow.'], ['b', 'They\'d follow me if you stopped shouting first.'],
      ['a', 'I shout because nobody listens!'], ['b', 'Maybe nobody listens because you shout.'],
    ],
    A: [
      ['a', 'Today you split the soldiers\' attention while I struck. That was well done.'], ['b', 'And you charged right when I needed it.'],
      ['a', 'Maybe the Poe Sisters don\'t need one leader.'], ['b', 'Maybe they need a loud one and a clever one.'], ['a', 'I\'m clever too.'],
      ['b', 'Not as clever as me. Ha!'], ['n', 'Joelle flares, then laughs despite herself.'],
    ],
    S: [
      ['b', 'Joelle, if the Hero finds us again… you go first. Like always.'], ['a', 'You want me to lead the charge?'],
      ['b', 'I want you to lead. I\'ll make sure no one can tell which of us they\'re aiming at.'], ['a', 'That\'s the nicest thing you\'ve ever said.'],
      ['b', 'Don\'t get used to it, eldest.'], ['n', 'Four purple lanterns flicker into being around Joelle, a guard of honour.'],
    ],
  },
  'amy|beth': {
    C: [
      ['b', 'Ooo! Beth! Watch this!'], ['n', 'Amy vanishes, reappears behind a soldier, and blows out his candle.'], ['a', 'Childish.'],
      ['b', 'It was art.'], ['a', 'A haunting should be slow. A chill. A whisper. Not a shriek and a giggle.'],
    ],
    B: [
      ['a', 'Watch, sister. This is how one haunts.'], ['n', 'Beth drifts silently into a tent. A long pause. A soldier walks out, shivering, and never quite knows why.'],
      ['b', 'That\'s it?'], ['a', 'He will not sleep tonight.'], ['b', 'Hmph. Mine screamed. Screaming is better.'],
    ],
    A: [
      ['b', 'I tried your way today. I stood behind the quartermaster for an hour and breathed on his neck.'], ['a', 'And?'],
      ['b', 'He gave me his dessert to make it stop!'], ['a', 'That is not what I meant to teach you.'], ['b', 'But it worked!'],
      ['n', 'Beth\'s blue glow flickers. It may be laughter.'],
    ],
    S: [
      ['a', 'Amy. Haunt with me tonight.'], ['b', 'Together? Your way or mine?'], ['a', 'Both. I will chill the room. You will make them scream.'],
      ['b', 'Ooooh, that\'s mean. I love it.'], ['n', 'Somewhere in camp, a very unlucky soldier is about to have the worst night of his life.'],
      ['a', 'You were right. Screaming is better. Occasionally.'], ['b', 'Hee hee! Best sisters ever.'],
    ],
  },
  'beth|meg': {
    C: [
      ['a', 'Meg. Which of you is real?'], ['n', 'Four purple Poes turn toward her at once.'], ['b', 'Guess.'],
      ['a', 'I am not playing. Show yourself.'], ['n', 'Three of them vanish.'], ['b', 'Spoilsport.'],
    ],
    B: [
      ['a', 'You hide behind your copies in every battle.'], ['b', 'That\'s called tactics.'], ['a', 'That is called fear.'],
      ['b', 'I\'m the youngest. If they find the real me, I lose.'], ['a', 'And if you are always hiding, sister, you never truly fight.'],
    ],
    A: [
      ['b', 'I fought without copies today.'], ['a', 'I saw.'], ['b', 'It was terrifying. They all came at me.'],
      ['a', 'And I came at them. You were never alone.'], ['n', 'Meg\'s lantern flickers uncertainly.'], ['b', 'You stayed right beside me.'],
      ['a', 'Of course. You need not be four to be safe, Meg. You only need us.'],
    ],
    S: [
      ['b', 'Beth, do you think I\'m still me when I split?'], ['a', 'I think you become very small, spread four ways.'],
      ['b', 'It feels like that. Like I\'m thinner.'], ['a', 'Then spend some time whole. With me.'],
      ['n', 'Meg drifts beside her eldest blue sister, a single lantern, steady and bright.'], ['b', 'This is nice.'], ['a', 'It is.'],
    ],
  },
  'amy|meg': {
    C: [
      ['a', 'Meg! I need four of you!'], ['b', 'For what?'], ['a', 'You\'ll see. Hee hee!'],
      ['n', 'By dawn, four Megs are stationed at the four corners of the officers\' tent, each holding a bucket of cold water.'],
    ],
    B: [
      ['b', 'Last time was too simple. They knew it was us.'], ['a', 'So we need a decoy!'], ['b', 'A decoy of a decoy. I make three copies, one of them pretends to be you.'],
      ['a', 'And I pretend to be a copy of you!'], ['b', 'And nobody knows which is which.'], ['a', 'We\'re geniuses.'],
    ],
    A: [
      ['n', 'The plan involves six ropes, two buckets, a stolen cucco, four Megs and one very confused Moblin.'], ['a', 'It worked! It actually worked!'],
      ['b', 'The cucco was a stroke of brilliance.'], ['a', 'That was your idea!'], ['b', 'It was one of my copies\' idea.'],
      ['a', 'Then tell her she\'s my favourite.'],
    ],
    S: [
      ['a', 'Meg, promise me something.'], ['b', 'What?'], ['a', 'If we ever get sealed in paintings again, we\'ll trick our way out together.'],
      ['b', 'Obviously. I\'ve already planned three escape routes.'], ['a', 'Only three?'], ['b', 'Four, counting the one where you pretend to be a lamp.'],
      ['n', 'The two youngest sisters dissolve into giggles that set every candle in camp guttering.'],
    ],
  },
  'joelle|link': {
    C: [
      ['a', 'You. The boy with the bow.'], ['b', 'Joelle.'], ['a', 'You remember my name? I suppose you should, after shooting me.'],
      ['n', 'Her red lantern flickers with old anger.'], ['b', 'You took the torch flame first.'],
    ],
    B: [
      ['a', 'Do you know how long I waited in that painting for someone to come?'], ['b', 'How long?'], ['a', 'Years. And then it was you.'],
      ['a', 'I thought: finally, a challenge. Then you turned around and shot me in the back.'], ['b', 'You were hiding in the painting.'],
      ['a', 'That is what a Poe does!'],
    ],
    A: [
      ['a', 'When you took my flame, it went back to the torch. Did you know that?'], ['b', 'Yes.'], ['a', 'The temple was a little brighter after.'],
      ['a', 'I hated you. But I think the forest liked it.'], ['b', 'You can be bright without being trapped, you know.'],
      ['n', 'Joelle drifts close to the campfire. Her lantern glows warm instead of angry.'], ['a', 'We\'ll see, Hero.'],
    ],
  },
  'beth|saria': {
    C: [
      ['b', 'You smell of moss and leaves. The Forest Temple\'s Sage?'], ['a', 'That\'s me! You\'re one of the sisters who lived there.'],
      ['b', 'Haunted there. It is different.'], ['n', 'A cold breeze accompanies Beth\'s every word.'], ['a', 'You make it chilly.'],
    ],
    B: [
      ['a', 'The forest has always had spirits. Skull Kids, wisps. You\'re just another kind.'], ['b', 'We were placed there by Ganondorf. Not invited.'],
      ['a', 'Maybe. But you\'ve been there a long time. That makes you part of it.'], ['b', 'An odd way to see things.'],
      ['a', 'The forest is very forgiving.'],
    ],
    A: [
      ['b', 'When the temple was cleansed, I felt the trees breathe again. Even I.'], ['a', 'You liked it?'],
      ['b', 'I… did not dislike it.'], ['a', 'Then come back after the war. The forest can use quiet spirits.'],
      ['n', 'Beth considers. A small blue spark flickers in her lantern.'], ['b', 'I will haunt only the empty corridors, then. Gently.'],
    ],
  },
  'amy|dampe': {
    C: [
      ['n', 'Dampé\'s lantern goes out. It relights itself, green.'], ['b', 'Ooooooo!'], ['a', 'Heh… nice try, little ghost. I been around Poes all my life.'],
      ['b', 'Hmph! You\'re supposed to scream!'],
    ],
    B: [
      ['b', 'I hid all your shovels.'], ['a', 'Heh heh… found \'em. In the well.'], ['b', 'How?'],
      ['a', 'Ghosts always hide things in the well. Every single one. You ain\'t special.'], ['n', 'Amy\'s lantern flares an offended green.'],
    ],
    A: [
      ['b', 'Why aren\'t you scared of me, old man?'], ['a', 'Heh. Lived next to the dead so long they\'re like neighbours.'],
      ['a', 'Besides, a graveyard\'s lonely. A little haunting makes the nights go faster.'], ['b', 'You LIKE being haunted?'],
      ['a', 'Only by you, heh heh.'], ['n', 'Amy floats beside him all night, humming, and doesn\'t play a single trick.'],
    ],
  },
  'meg|phantomGanon': {
    C: [
      ['a', 'You came out of a painting too!'], ['b', 'The paintings in the Forest Temple. I rode from them.'], ['a', 'I hid in them! We were neighbours!'],
      ['n', 'Phantom Ganon regards the little ghost without expression.'],
    ],
    B: [
      ['a', 'How do you make the painted copies of yourself? I can only do four.'], ['b', 'I ride into one canvas, and out of another.'],
      ['a', 'So the copies are empty?'], ['b', 'All but one. The trick is making them all seem full.'], ['a', 'Same as mine!'],
      ['b', 'Our master taught us both, it seems.'],
    ],
    A: [
      ['a', 'Phantom… are you a copy too? Like my clones?'], ['b', 'I am a copy of him. But I am the real copy, if that has meaning.'],
      ['a', 'It does to me. My clones vanish. You stay.'], ['b', 'Then perhaps we are each more real than we are told.'],
      ['n', 'Meg creates four clones. Phantom Ganon summons four painted riders. They bow to one another, all ten of them.'],
    ],
  },
  'darkLink|meg': {
    C: [
      ['a', 'Are you real, or one of those copies?'], ['b', 'Which one do you think?'], ['a', 'You look like the Hero.'],
      ['b', 'That\'s the idea.'], ['n', 'Meg splits into four. Dark Link doesn\'t blink.'],
    ],
    B: [
      ['a', 'When I make my copies, they don\'t think. They just move.'], ['b', 'I think.'], ['a', 'Even though you\'re a copy?'],
      ['b', 'Even though. He\'s the original. I\'m whatever\'s left in the water.'], ['a', 'That sounds lonely.'],
    ],
    A: [
      ['a', 'I want you to meet my sisters. They\'re not copies of anyone.'], ['b', 'Why?'],
      ['a', 'Because nobody should feel like a leftover.'], ['n', 'Dark Link hesitates, then follows the little purple lantern toward the Poe sisters\' fire.'],
      ['b', 'Do they talk much?'], ['a', 'Constantly. You\'ll hate it.'], ['b', 'Probably.'],
    ],
  },
  'ganondorf|meg': {
    C: [
      ['a', 'You put us in paintings. All four of us.'], ['b', 'I gave you a temple to guard.'], ['a', 'You gave us a cage with a nice frame.'],
      ['n', 'Ganondorf does not look down at her.'],
    ],
    B: [
      ['a', 'Why should I follow you now?'], ['b', 'Because I am the strongest thing in this army.'], ['a', 'The Hero beat you.'],
      ['b', 'And he beat you too, little lantern.'], ['a', 'But I don\'t pretend to be a king.'],
    ],
    A: [
      ['a', 'I\'ve decided. I\'m fighting for my sisters, not for you.'], ['b', 'Do you think I care why you fight?'],
      ['a', 'I think you do. You like being obeyed.'], ['n', 'Ganondorf turns, and his eyes find hers.'], ['b', 'Hm. You have more spine than your sisters.'],
      ['a', 'I\'m a ghost. I don\'t have a spine. But I have a choice.'],
    ],
  },
};
