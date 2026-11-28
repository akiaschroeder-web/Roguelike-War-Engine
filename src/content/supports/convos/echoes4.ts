// Support conversations: Echoes of Wisdom (part 4: cross-pack pairs with A Link Between Worlds and Four Swords). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'zeldaALBW|zeldaEoW': {
    C: [
      ['b', 'Another Zelda. I keep meeting us. Are you the one with the Triforce of Wisdom?'],
      ['a', 'I am. Though I spent most of my story inside a painting, so I am not sure I used it very wisely.'],
      ['b', 'I spent most of mine copying beds. We all have our moments.'],
    ],
    B: [
      ['a', 'You went out yourself, with a rod and a fairy. I waited for a hero to come and fetch me.'],
      ['b', 'Only because mine had been swallowed by a Rift. I would have waited too, if anyone had been left to come.'],
      ['a', 'Truly?'],
      ['b', 'No. I would have been bored within the hour.'],
    ],
    A: [
      ['a', 'Hilda and I are reflections. Two princesses, two kingdoms. You and I are something else.'],
      ['b', 'Two princesses, one kingdom, different centuries.'],
      ['a', 'Then everything I worry about, you have already lived past. And everything you worry about, I will never see.'],
      ['b', 'That is a comforting thought and a lonely one at the same time.'],
      ['a', 'Most wisdom is.'],
    ],
    S: [
      ['b', 'Let us leave something for each other. Whichever of us comes first.'],
      ['a', 'A letter in the castle library? Under a loose stone?'],
      ['b', 'Third shelf, behind the dullest book. No one ever reads the dullest book.'],
      ['a', 'Then I shall write to the Zelda who comes after me, and tell her she is braver than she knows.'],
      ['b', 'And I will have already read it.'],
    ],
  },
  'hilda|zeldaEoW': {
    C: [
      ['a', 'You have my face. Another one. How many of you are there in Hyrule?'],
      ['b', 'Quite a few, it turns out. I am from a long time after yours, I think. Or before. It gets confusing.'],
      ['a', 'Then you are not the Zelda who refused me.'],
      ['b', 'No. But I would like to hear what she refused.'],
    ],
    B: [
      ['a', 'Lorule was falling into pieces. I meant to take your Triforce and mend it.'],
      ['b', 'Hyrule was falling into pieces too, in my time. Rifts swallowing whole villages.'],
      ['a', 'And you did not steal another kingdom\'s heart to stop it.'],
      ['b', 'Nobody offered me one. I am not sure what I would have done if they had.'],
      ['a', '…That is more honest than I expected.'],
    ],
    A: [
      ['b', 'When the Rifts came, the council blamed me. They called me an impostor and locked me away.'],
      ['a', 'Did they? And you did not hate them?'],
      ['b', 'For a while. Then I decided hating them was a lot of work, and the Rifts were still coming.'],
      ['a', 'I gave my people a sorcerer and a war because I could not bear to watch them suffer.'],
      ['b', 'You could not bear it. That is the part I understand. The sorcerer is the part I don\'t.'],
    ],
    S: [
      ['a', 'If you had been born in Lorule, would you have done better than I did?'],
      ['b', 'I don\'t know. Probably not at first. I would have tried something foolish and clever and terribly risky.'],
      ['a', 'That is exactly what I did.'],
      ['b', 'Then the difference is only what you do next. And you gave the Triforce back. I would be proud of that.'],
      ['n', 'Hilda looks away. When she looks back, she is almost smiling.'],
      ['a', 'Come to Lorule when it is whole again. I will show you how it should have looked.'],
    ],
  },
  'ravio|zeldaEoW': {
    C: [
      ['a', 'Ah! A princess! Welcome to Ravio\'s! Everything is for rent, nothing is for free, and the bracelet is not for sale!'],
      ['b', 'I don\'t need to rent anything. I can make a copy of whatever I need.'],
      ['a', '…You can what?'],
    ],
    B: [
      ['a', 'So you just wave the rod, and there is a bed. A table. A Moblin.'],
      ['b', 'More or less. Tri does most of the hard work.'],
      ['a', 'Please never open a shop. Please. I am begging. On my knees. Look, these are my knees.'],
      ['b', 'I wasn\'t planning to!'],
      ['a', 'That\'s what everyone says, right before they open a shop.'],
    ],
    A: [
      ['a', 'Can I tell you a secret, Princess? I ran away from Lorule. I hid under a hood and called it business.'],
      ['b', 'I hid under a hood too. A cloak, anyway. When the guards were after me.'],
      ['a', 'You hid to keep going, though. I hid to not have to.'],
      ['b', 'You kept going in the end. You found a hero. You gave him every tool you had.'],
      ['a', 'Rented. I rented them to him.'],
      ['b', 'Ravio.'],
      ['a', '…Fine. I would have given them.'],
    ],
    S: [
      ['a', 'I have something for you. Not a rental. A real gift. My hood. My spare hood. My spare spare hood.'],
      ['b', 'A rabbit hood?'],
      ['a', 'Sometimes it helps to be someone else for a little while. You of all people know that.'],
      ['n', 'Zelda puts it on. It is far too big. She does not take it off.'],
      ['b', 'How do I look?'],
      ['a', 'Braver than me. Which is not hard. But still.'],
    ],
  },
  'dradd|oren': {
    C: [
      ['b', 'You are a chief of the river Zora. I am the queen of the river Zora.'],
      ['a', 'Then we have a problem, don\'t we? There can only be one ruler of the river!'],
      ['b', 'There are a great many rivers.'],
      ['a', '…There are, aren\'t there?'],
    ],
    B: [
      ['a', 'My people sing to the water and drum the beat. What do yours do?'],
      ['b', 'Mine sulk in the shallows and quarrel over nothing. Until I lose a Smooth Gem, and then they all go looking.'],
      ['a', 'A good ruler gives them something to look for.'],
      ['b', 'A good ruler does not lose her gem in the first place.'],
      ['a', 'Ha! I lose my drumsticks every week.'],
    ],
    A: [
      ['b', 'Without my Smooth Gem, I swelled up into something enormous and frightening, and hid in my chamber from everyone.'],
      ['a', 'When the Rift took our waters, I nearly gave up. I sat on my drum and did not play it for three days.'],
      ['b', 'What made you play again?'],
      ['a', 'A little Zora asked me if the river was dead. I wanted to show him it was not.'],
      ['b', '…That is a better reason than mine. I was simply angry.'],
    ],
    S: [
      ['a', 'Queen Oren. One day, when this is over, let our rivers meet.'],
      ['b', 'A treaty between two Zora peoples?'],
      ['a', 'A party! With drums! And your people can sulk at the edges, if they want.'],
      ['b', 'They will want to.'],
      ['n', 'Dradd starts to play. After a moment, the queen of the Zora begins, very slowly, to keep time.'],
      ['b', 'Do not tell anyone I did this.'],
    ],
  },
  'shadowLink|tekom': {
    C: [
      ['a', 'Ooh. A fake Zelda. I\'m a fake Link. Should we get married and confuse everyone?'],
      ['b', 'I would rather not.'],
      ['a', 'Shame. It would have been hilarious.'],
    ],
    B: [
      ['a', 'So who made you? Me, I came out of a dark mirror. Vaati\'s idea. Or Ganon\'s. They argued about the credit.'],
      ['b', 'Null made me. Out of the princess\'s image, to rule in her place.'],
      ['a', 'And how did that go?'],
      ['b', 'I sat on her throne and did exactly what I was told. Nobody noticed for days.'],
      ['a', 'Ha! That\'s the saddest thing I\'ve ever heard. And I live in a mirror.'],
    ],
    A: [
      ['a', 'Here\'s a trick. Whenever someone says you\'re only a copy, do something the real one would never do.'],
      ['b', 'Such as?'],
      ['a', 'I steal Force Gems. The real Link would never. Drives him mad.'],
      ['b', 'I could learn to laugh. The princess laughs, but never the way you do.'],
      ['a', 'There you go! Rude, loud, at the wrong moment. Practise on me.'],
      ['n', 'Tekom laughs. It is awkward and too loud. Shadow Link looks delighted.'],
    ],
    S: [
      ['b', 'When Null was defeated, I thought I would fade. I did not. I don\'t know why.'],
      ['a', 'Same with me. Every time they beat me, I come back. I think it\'s because I\'m stubborn.'],
      ['b', 'Or because someone, somewhere, still needs a shadow.'],
      ['a', 'Well, I need a partner in crime. Two fakes. Imagine the havoc.'],
      ['b', 'Small havoc. Nothing cruel.'],
      ['a', 'Deal. The princess\'s copy and the hero\'s shadow, causing small havoc. They\'ll never see us coming.'],
    ],
  },
  'tekom|yuga': {
    C: [
      ['b', 'Hold still. Exactly like that. Oh, the princess\'s face with eyes like rubies. What a commission you would make.'],
      ['a', 'If you are planning to put me in a painting, I should warn you that I am already a copy.'],
      ['b', 'A copy of a copy? How deliciously modern.'],
    ],
    B: [
      ['b', 'I painted seven sages and a princess into pictures. They were more beautiful framed. Still. Perfect.'],
      ['a', 'Null wished to make everything still and silent, too. It called that perfect as well.'],
      ['b', 'Your master and I would have got on splendidly.'],
      ['a', 'I do not think so. Null did not care about beauty. Only about the quiet.'],
    ],
    A: [
      ['a', 'I spent days being a picture of the princess. Smiling when told. Standing where placed.'],
      ['b', 'And?'],
      ['a', 'And a picture can never be more than the person who made it. I wanted to be more.'],
      ['b', '…That is a dreadfully good criticism of my entire art.'],
      ['a', 'You may paint me, Yuga. But only as I am now, and only if I may watch.'],
      ['b', 'An artist with a sitter who argues. How tiresome. How fascinating.'],
    ],
  },
};
