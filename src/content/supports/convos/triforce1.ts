// Support conversations: Tri Force Heroes (part 1: the three heroes and the Hytopians). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  'blueHero|linkALBW': {
    C: [
      ['a', 'You stand at the bottom. I\'m on top. That\'s the rule.'],
      ['b', 'Since when?'],
      ['a', 'Since I said it. I\'m the fast one. Fast ones go on top.'],
      ['b', 'Fast ones also fall off first.'],
    ],
    B: [
      ['b', 'You jumped before I was ready. Again.'],
      ['a', 'You were ready. You just didn\'t know it yet.'],
      ['b', '…That actually worked, though.'],
      ['a', 'Of course it worked. I\'m always right. Mostly.'],
    ],
    A: [
      ['a', 'Can I tell you something? I hate waiting. For anything.'],
      ['b', 'I noticed.'],
      ['a', 'But when you\'re underneath, I don\'t mind waiting for you to brace. I know you will.'],
      ['b', 'Then I\'ll always brace.'],
    ],
    S: [
      ['a', 'After this, people will say the Green Hero saved Hytopia.'],
      ['b', 'People will say the three of us did.'],
      ['a', 'Ha. Good. But between us — I\'d stack on you anywhere. Even a volcano.'],
      ['b', 'We did stack in a volcano.'],
      ['a', 'And I\'d do it again.'],
    ],
  },
  'linkALBW|redHero': {
    C: [
      ['b', 'I\'ll carry the Totem. You two just hold on!'],
      ['a', 'You don\'t have to shout. I\'m right on top of you.'],
      ['b', 'I\'M NOT SHOUTING. I\'m encouraging!'],
    ],
    B: [
      ['a', 'Your shoulders are covered in bruises.'],
      ['b', 'Boots. Mostly yours.'],
      ['a', 'Sorry.'],
      ['b', 'Don\'t be! It means you got high enough to hit the eye.'],
    ],
    A: [
      ['b', 'Do you ever get scared up there?'],
      ['a', 'Every time. Then I feel you plant your feet, and it stops.'],
      ['b', 'Huh. I never thought about that. I\'ll plant them extra hard.'],
    ],
    S: [
      ['b', 'Back home, nobody wanted me on their team. Too loud. Too clumsy.'],
      ['a', 'You\'re the reason the Totem stands at all.'],
      ['b', '…You mean that?'],
      ['a', 'Every time I go up, I trust you to be there. That\'s what a hero is.'],
      ['b', 'Then I\'m staying right here. Underneath. Forever.'],
    ],
  },
  'blueHero|redHero': {
    C: [
      ['a', 'You\'re slow.'],
      ['b', 'You\'re rude!'],
      ['a', 'I\'m efficient.'],
      ['b', 'You\'re efficiently rude!'],
    ],
    B: [
      ['b', 'You grabbed my arm when I slipped on the ice.'],
      ['a', 'You\'d have dragged the whole Totem down. Don\'t make it a thing.'],
      ['b', 'It\'s a thing. Thank you.'],
    ],
    A: [
      ['a', 'I\'ll say this once. You\'re the best bottom any Totem ever had.'],
      ['b', 'Was that a compliment? From you?'],
      ['a', 'Don\'t get used to it.'],
    ],
    S: [
      ['b', 'When we get back, want to enter the Coliseum together?'],
      ['a', 'Only if you\'re on my side.'],
      ['b', 'I\'m always on your side.'],
      ['a', 'Yeah. I know. That\'s… the best part of all this, actually.'],
    ],
  },
  'kingTuft|styla': {
    C: [
      ['a', 'My darling! My precious! Let your father see you!'],
      ['b', 'Papa, no! Not in this bodysuit! Don\'t look!'],
      ['a', 'I would look at you in a potato sack and weep for joy!'],
    ],
    B: [
      ['b', 'You put up posters. All over the kingdom.'],
      ['a', 'Eleven thousand. I did several myself. My handwriting is very poor.'],
      ['b', 'I saw one. You spelled "heroes" with three Es.'],
      ['a', 'They came anyway!'],
    ],
    A: [
      ['b', 'Papa, you\'ve been crying every day since I was cursed.'],
      ['a', 'Only every hour, really.'],
      ['b', 'I\'m sorry I hid from you.'],
      ['a', 'Hide all you like. I\'ll just keep knocking.'],
    ],
    S: [
      ['b', 'The curse is gone. I can go outside again.'],
      ['a', 'And the first thing you did was come and find your silly old father.'],
      ['b', 'You\'re not silly. You\'re the man who sent heroes into the Drablands for me.'],
      ['a', '…Excuse me. Something in my eye. Both eyes. All of it.'],
    ],
  },
  'madameCouture|styla': {
    C: [
      ['b', 'Madame Couture! Please, make me anything. Anything but brown.'],
      ['a', 'Darling, I cannot sew over a curse. But I can sew around it.'],
      ['b', 'Around it?'],
      ['a', 'A scarf. A hat. Hope. Hold still.'],
    ],
    B: [
      ['a', 'You have a remarkable eye for colour, Princess.'],
      ['b', 'I used to sketch dresses at night. Before.'],
      ['a', 'Show me. If they are any good, I shall steal them.'],
    ],
    A: [
      ['b', 'Was your sister always… like that?'],
      ['a', 'Maud? She was the better seamstress, once. She simply stopped believing anyone would notice.'],
      ['b', 'I noticed her dress, in the Sky Realm. It was beautiful. Terrible, but beautiful.'],
    ],
    S: [
      ['a', 'For your first public appearance: the gown I have been making since the day you were cursed.'],
      ['b', 'Since that day? You knew they\'d win?'],
      ['a', 'Darling, I sewed every stitch as if they already had.'],
      ['b', 'Then I\'ll wear it as if I always believed it too.'],
    ],
  },
  'ladyMaud|styla': {
    C: [
      ['b', 'You.'],
      ['a', 'Me. Still in brown, I see. Oh — no. Not any more. How tiresome.'],
      ['b', 'Why did you do it?'],
      ['a', 'Because everyone looked at you. Nobody ever looked at me.'],
    ],
    B: [
      ['a', 'That dress. Who made it?'],
      ['b', 'Your sister.'],
      ['a', '…Of course she did. The hem is crooked.'],
      ['b', 'It isn\'t.'],
      ['a', 'No. It isn\'t.'],
    ],
    A: [
      ['b', 'I don\'t forgive you yet. But I\'m willing to try.'],
      ['a', 'Generous. Suspiciously so.'],
      ['b', 'You\'re very good with colour. Help me pick for the next festival, and we\'ll see.'],
      ['a', 'Fine. But we are NOT doing pastels.'],
    ],
  },
  'kingTuft|madameCouture': {
    C: [
      ['a', 'Madame! The kingdom\'s entire treasury, for one outfit that will break this curse!'],
      ['b', 'Majesty, outfits do not break curses. Heroes do. Outfits make them look nice while they do it.'],
    ],
    B: [
      ['b', 'Your cape has a hole in it, Majesty.'],
      ['a', 'I wiped my tears with it. Many times.'],
      ['b', 'Give it here. A king may weep, but not in a ragged cape.'],
    ],
    A: [
      ['a', 'You have dressed every hero who passed through my kingdom, and never charged me a Rupee.'],
      ['b', 'I charged them. Lavishly.'],
      ['a', 'Ha! Then Hytopia owes you twice. Name your reward.'],
      ['b', 'Bring my sister home, Majesty. That is all.'],
    ],
  },
  'ladyMaud|madameCouture': {
    C: [
      ['a', 'Hello, sister.'],
      ['b', 'Maud. You look… dramatic.'],
      ['a', 'And you look exactly the same. How do you stand it?'],
    ],
    B: [
      ['b', 'You took my best thread when you left.'],
      ['a', 'You noticed? It took you long enough.'],
      ['b', 'I noticed the day you left. I simply stopped saying so.'],
    ],
    A: [
      ['a', 'You wrote letters. Dozens. I never opened them.'],
      ['b', 'I know. The heroes found them in the sand.'],
      ['a', 'What did they say?'],
      ['b', 'Mostly "come home". Sometimes "your hem is crooked".'],
    ],
    S: [
      ['a', 'I was jealous. Of you, of the boutique, of the princess. Of everyone anyone admired.'],
      ['b', 'I admired you. I still do. You were always the braver designer.'],
      ['a', 'Then why did no one say so?'],
      ['b', 'Because I was afraid you\'d leave if I did. You left anyway. Come back, Maud. Sew with me.'],
      ['a', '…Only if my name goes first on the sign.'],
    ],
  },
};
