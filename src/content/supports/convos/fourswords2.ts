// Support conversations: Four Swords & Four Swords Adventures (part 2: Zelda and the six Shrine Maidens, and the Maidens and their Sages). Not canon.
type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  // ── Zelda and each Maiden ──
  'greenMaiden|zeldaFS': {
    C: [
      ['b', 'You smell of the Lost Woods.'],
      ['a', 'Moss and rain, Princess. It never washes out. I stopped trying.'],
      ['b', 'Don\'t. It\'s the only part of the Sanctuary that smells alive.'],
    ],
    B: [
      ['a', 'You\'ve been sleeping badly. Chew this leaf before bed.'],
      ['b', 'Is it a sleeping herb?'],
      ['a', 'It\'s a "stop worrying about the seal for one night" herb. It works about half the time.'],
    ],
    A: [
      ['b', 'When the crystals took you, I tried to keep the prayers alone. I couldn\'t hold the forest part.'],
      ['a', 'It isn\'t meant to be held alone. That\'s why there are seven of us.'],
      ['b', 'I know that now.'],
    ],
    S: [
      ['n', 'In the Sanctuary garden, the Green Maiden has planted something new.'],
      ['a', 'A sapling from the Lost Woods. It will outlive both of us.'],
      ['b', 'Then it can keep the prayer when we can\'t.'],
      ['a', 'That\'s the idea, Princess. Water it on Tuesdays.'],
    ],
  },
  'redMaiden|zeldaFS': {
    C: [
      ['a', 'Princess, that Moblin insulted you. May I set him on fire?'],
      ['b', 'He\'s already on fire.'],
      ['a', 'May I set him on fire more?'],
    ],
    B: [
      ['b', 'You were sealed in the Tower of Flames for weeks. Weren\'t you frightened?'],
      ['a', 'I was furious. It kept me warm.'],
      ['b', 'I envy that. I was frightened the whole time Vaati held me.'],
      ['a', 'Then be furious next time. I\'ll lend you some.'],
    ],
    A: [
      ['a', 'You hold yourself so still. Like a candle that\'s afraid of wind.'],
      ['b', 'A princess is supposed to be still.'],
      ['a', 'A flame is supposed to move. You\'re both. You\'re allowed to flicker.'],
    ],
    S: [
      ['a', 'Here. A charm from the Tower: an ember that never goes out.'],
      ['b', 'It\'s warm.'],
      ['a', 'It\'s me, in a stone. Whenever you\'re cold, you\'ll know someone\'s angry on your behalf.'],
      ['b', 'Thank you, Red Maiden. I\'ll keep it close.'],
    ],
  },
  'blueMaiden|zeldaFS': {
    C: [
      ['a', 'Please don\'t call it the Village of the Blue Maiden in front of me. They did it without asking.'],
      ['b', 'They love you.'],
      ['a', 'They could love me with a smaller sign.'],
    ],
    B: [
      ['b', 'Your water prayer: it restores more than wounds.'],
      ['a', 'It restores whatever you\'ve been pouring out. Strength. Courage. Patience.'],
      ['b', 'Then I\'ll need a great deal of it before the next council meeting.'],
    ],
    A: [
      ['a', 'You give so much of yourself to the seal. Who refills you?'],
      ['b', 'I never thought about it.'],
      ['a', 'Then I will. That\'s what water is for.'],
    ],
    S: [
      ['n', 'At the village spring, the princess and the Maiden sit with their feet in the water.'],
      ['b', 'I could stay here forever.'],
      ['a', 'You can stay here until sunset. Forever is for later.'],
      ['b', 'Until sunset, then. And again tomorrow.'],
    ],
  },
  'purpleMaiden|zeldaFS': {
    C: [
      ['b', 'You startled me. I didn\'t hear you come in.'],
      ['a', 'Nobody does, Princess. The Temple of Darkness taught me to walk quietly.'],
      ['b', 'Could you… make a little noise? For my nerves?'],
    ],
    B: [
      ['a', 'In the dark, I could hear Ganon\'s shadow plotting. I memorised everything.'],
      ['b', 'Everything?'],
      ['a', 'He talks to himself. A great deal. He\'s very vain.'],
    ],
    A: [
      ['b', 'Are you afraid of the dark, after all that?'],
      ['a', 'No. I\'m afraid of the light now. Things are so easily seen.'],
      ['b', 'Then I\'ll stand beside you when it\'s bright. You can stand beside me when it\'s dark.'],
    ],
    S: [
      ['a', 'I made you this. A veil woven in the Temple. It hides you from anything that hunts by sight.'],
      ['b', 'Will I need it?'],
      ['a', 'Probably not. But I sleep better knowing you have it.'],
      ['b', 'Then I\'ll wear it. For your sleep.'],
    ],
  },
  'yellowMaiden|zeldaFS': {
    C: [
      ['a', 'Princess! Isn\'t it a lovely day? Look at all that sky!'],
      ['b', 'It was black last week.'],
      ['a', 'All the more reason to look at it now!'],
    ],
    B: [
      ['b', 'You lifted the curse from three soldiers in one breath.'],
      ['a', 'Curses are just sadness that\'s set solid. You warm them and they melt.'],
      ['b', 'That isn\'t what the books say.'],
      ['a', 'The books were written by very serious people.'],
    ],
    A: [
      ['a', 'Your light is so careful. Like you\'re afraid of shining too much.'],
      ['b', 'Vaati wanted me for my light. I learned to hide it.'],
      ['a', 'Then shine with me. Nobody can take it if there\'s too much of it to carry.'],
    ],
    S: [
      ['n', 'At dawn on the Sanctuary steps, two lights are brighter than the sun coming up.'],
      ['a', 'See? Nobody stole it.'],
      ['b', 'No. Nobody did.'],
      ['a', 'Same time tomorrow?'],
      ['b', 'Same time every day.'],
    ],
  },
  'whiteMaiden|zeldaFS': {
    C: [
      ['a', 'Stay behind the barrier, Princess.'],
      ['b', 'I can fight.'],
      ['a', 'I know you can. That\'s exactly why you\'ll stay behind the barrier until I say.'],
    ],
    B: [
      ['b', 'You were the first Maiden I ever met. I was six. You told me to stop running in the shrine.'],
      ['a', 'You still run in the shrine.'],
      ['b', 'Only when you\'re not looking.'],
      ['a', 'I\'m always looking.'],
    ],
    A: [
      ['a', 'When the ice took me, I thought the seal would fail. That I\'d left you alone.'],
      ['b', 'You didn\'t. I could feel your barrier around the Sanctuary the whole time.'],
      ['a', '…It held? Without me there?'],
      ['b', 'It held because you made it.'],
    ],
    S: [
      ['a', 'You don\'t need me to protect you any more.'],
      ['b', 'I need you for everything else.'],
      ['a', 'Hm. Then I\'ll stay. And you\'ll still not run in the shrine.'],
      ['b', 'I make no promises.'],
    ],
  },
  // ── The Maidens together ──
  'greenMaiden|redMaiden': {
    C: [
      ['b', 'Your forest is very flammable.'],
      ['a', 'Please don\'t.'],
      ['b', 'I\'m just saying it is.'],
    ],
    B: [
      ['a', 'You burned the poisoned brambles away and left the healthy trees. That takes control.'],
      ['b', 'I have control. I just don\'t use it in front of Moblins.'],
    ],
    A: [
      ['b', 'Fire clears. Forests grow back. Maybe we\'re the same prayer from two ends.'],
      ['a', 'I\'ve thought that for years. I didn\'t want to say it in case you set me alight.'],
      ['b', 'I\'d never. You\'re damp.'],
    ],
  },
  'blueMaiden|greenMaiden': {
    C: [
      ['b', 'Your saplings look thirsty.'],
      ['a', 'Everything looks thirsty to you.'],
      ['b', 'Everything is.'],
    ],
    B: [
      ['a', 'Your water and my herbs together healed the captain in half the time.'],
      ['b', 'We should do that more often.'],
      ['a', 'We should have done it for the last hundred years.'],
    ],
    A: [
      ['b', 'Rain and roots. It\'s an old partnership.'],
      ['a', 'The oldest. Before swords, before kings.'],
      ['b', 'Then we\'ll keep it going after both.'],
    ],
  },
  'greenMaiden|purpleMaiden': {
    C: [
      ['a', 'You stand in the shade of my trees and nobody can see you at all.'],
      ['b', 'That\'s the point.'],
      ['a', 'It\'s a little unsettling.'],
    ],
    B: [
      ['b', 'The Lost Woods are full of shadows. I like them.'],
      ['a', 'Most people get lost in them.'],
      ['b', 'Most people walk with their eyes open. You have to listen.'],
    ],
    A: [
      ['a', 'You found the path through the woods I\'ve been looking for for years.'],
      ['b', 'It was always there. Just in the dark.'],
      ['a', 'Then show me. I\'ll bring a lamp. You can tell me when to put it out.'],
    ],
  },
  'greenMaiden|yellowMaiden': {
    C: [
      ['b', 'Your flowers turn to face me. Isn\'t that sweet?'],
      ['a', 'They think you\'re the sun.'],
      ['b', 'I am a bit.'],
    ],
    B: [
      ['a', 'The blight on the eastern grove: your light burned it out where my medicine couldn\'t reach.'],
      ['b', 'And your medicine healed what my light left scorched. We\'re a pair!'],
    ],
    A: [
      ['b', 'Do you ever just lie in the grass and do nothing?'],
      ['a', 'Never. There\'s always something to tend.'],
      ['b', 'Then today, tend me. Lie down. Look at the sky.'],
      ['a', '…This is surprisingly difficult.'],
    ],
  },
  'greenMaiden|whiteMaiden': {
    C: [
      ['b', 'You let the ivy grow over the shrine wall again.'],
      ['a', 'It holds the stones together.'],
      ['b', 'It holds them together the way a bear hug holds a person together.'],
    ],
    B: [
      ['a', 'Your barriers and my vines. If we wove them, the Sanctuary would be twice as strong.'],
      ['b', 'Show me.'],
      ['a', 'You\'re willing?'],
      ['b', 'I\'m old, not stubborn. Show me.'],
    ],
    A: [
      ['b', 'It works. Living walls. They heal themselves.'],
      ['a', 'I told you.'],
      ['b', 'You did. I should listen to the young ones more.'],
      ['a', 'I\'m two hundred years old.'],
      ['b', 'Young ones.'],
    ],
  },
  'blueMaiden|redMaiden': {
    C: [
      ['b', 'You\'re steaming.'],
      ['a', 'You splashed me!'],
      ['b', 'You were on fire!'],
      ['a', 'I\'m always on fire!'],
    ],
    B: [
      ['a', 'Fine. You put out the Big Bomb\'s fuse. That was quick of you.'],
      ['b', 'That was the nicest thing you\'ve ever said to me.'],
      ['a', 'Don\'t get used to it.'],
    ],
    A: [
      ['b', 'Fire and water. Everyone thinks we hate each other.'],
      ['a', 'We argue. It\'s not the same.'],
      ['b', 'No. Arguing is what you do with someone you\'ll still be talking to tomorrow.'],
    ],
  },
  'purpleMaiden|redMaiden': {
    C: [
      ['b', 'Could you stand in the light, please? I keep forgetting you\'re there and shouting at you.'],
      ['a', 'You shout at everyone.'],
      ['b', 'Yes, but I like to see who.'],
    ],
    B: [
      ['a', 'You burn so bright you cast the best shadows.'],
      ['b', 'Is that a compliment?'],
      ['a', 'From me it\'s the highest one.'],
    ],
    A: [
      ['b', 'You covered me in the Dark World when I couldn\'t see a thing.'],
      ['a', 'You lit the way out when I couldn\'t find it.'],
      ['b', 'Then we\'re even.'],
      ['a', 'We\'re a team.'],
    ],
  },
  'redMaiden|yellowMaiden': {
    C: [
      ['b', 'We\'re both very bright! We should be friends!'],
      ['a', 'I\'m bright because I\'m angry.'],
      ['b', 'I\'m bright because I\'m happy! See, we complement each other!'],
    ],
    B: [
      ['a', 'How are you never angry?'],
      ['b', 'I am. I just turn it into light before it gets out.'],
      ['a', '…Teach me that.'],
    ],
    A: [
      ['b', 'You were less angry today.'],
      ['a', 'I tried your trick. I turned it into light.'],
      ['b', 'How did it go?'],
      ['a', 'I blinded a Darknut. It was very satisfying.'],
    ],
  },
  'redMaiden|whiteMaiden': {
    C: [
      ['b', 'You rushed the barrier\'s edge again. It\'s there to keep you in.'],
      ['a', 'It was keeping me out of the fight.'],
      ['b', 'That is the same thing, child.'],
    ],
    B: [
      ['a', 'You were frozen in the Ice Temple. I was burning in the Tower. We both kept praying.'],
      ['b', 'Of course we did. That is the duty.'],
      ['a', 'I kept praying out of spite. Is that allowed?'],
      ['b', 'It worked, didn\'t it?'],
    ],
    A: [
      ['b', 'I am too cautious. You are too rash. Between us, we might make one sensible Maiden.'],
      ['a', 'Who gets to be the sensible one?'],
      ['b', 'We take turns. I go first.'],
    ],
  },
  'blueMaiden|purpleMaiden': {
    C: [
      ['a', 'You\'re very quiet.'],
      ['b', 'You\'re very wet.'],
      ['a', '…That\'s fair.'],
    ],
    B: [
      ['b', 'Still water reflects the stars at night. It\'s the only light I like.'],
      ['a', 'Then come to the village spring after dark. I\'ll keep it still for you.'],
    ],
    A: [
      ['a', 'You came. I didn\'t think you would.'],
      ['b', 'You kept the water still. Nobody\'s ever done something quiet for me before.'],
      ['a', 'Then I\'ll do it again. Every clear night.'],
    ],
  },
  'blueMaiden|yellowMaiden': {
    C: [
      ['b', 'Look, a rainbow! That\'s us! Water and light!'],
      ['a', 'It\'s mostly mist from the falls.'],
      ['b', 'Mist is just shy water.'],
    ],
    B: [
      ['a', 'You make the children of my village laugh whenever you visit.'],
      ['b', 'They make me laugh! They named a duck after me.'],
      ['a', 'They named the whole village after me.'],
      ['b', 'Yes, but the duck is very handsome.'],
    ],
    A: [
      ['b', 'Will you be embarrassed if they put up another sign?'],
      ['a', 'Yes.'],
      ['b', 'Will you be embarrassed if it says "and the Yellow Maiden too"?'],
      ['a', '…Less. Much less.'],
    ],
  },
  'blueMaiden|whiteMaiden': {
    C: [
      ['b', 'Your prayer runs warm. You\'ve been at the springs again.'],
      ['a', 'You could join me. You\'d stop being cold for once.'],
      ['b', 'I am ice by vocation.'],
    ],
    B: [
      ['a', 'Ice is just water that\'s holding its breath.'],
      ['b', 'Is it.'],
      ['a', 'So let it out, once in a while.'],
    ],
    A: [
      ['b', 'I let my barrier melt a little today. To let you through to the wounded.'],
      ['a', 'I noticed. Thank you.'],
      ['b', 'It was easier than I expected. Don\'t tell anyone.'],
    ],
  },
  'purpleMaiden|yellowMaiden': {
    C: [
      ['b', 'Hello! Where are you? Hello!'],
      ['a', 'Right behind you.'],
      ['b', 'Eek!'],
    ],
    B: [
      ['a', 'You make it hard to hide.'],
      ['b', 'Sorry! I can\'t really turn it off.'],
      ['a', 'Don\'t. It\'s nice to stand near something that bright. The shadows are sharper.'],
    ],
    A: [
      ['b', 'Do you think we\'re opposites?'],
      ['a', 'No. Light makes shadow. Shadow makes light worth seeing.'],
      ['b', 'Then we\'re a matching set!'],
      ['a', '…I suppose we are.'],
    ],
  },
  'purpleMaiden|whiteMaiden': {
    C: [
      ['b', 'You slipped out past my barrier last night.'],
      ['a', 'You notice everything.'],
      ['b', 'I am supposed to. Where did you go?'],
    ],
    B: [
      ['a', 'I go out at night to listen. The Dark World is thin near the Sanctuary.'],
      ['b', 'You should have told me.'],
      ['a', 'You would have built a wall.'],
      ['b', '…Yes. I would have.'],
    ],
    A: [
      ['b', 'Tonight I\'ll come with you. No wall. Only listening.'],
      ['a', 'You\'ll hate it.'],
      ['b', 'Then I\'ll hate it next to you, where I can keep an eye on you.'],
    ],
  },
  'whiteMaiden|yellowMaiden': {
    C: [
      ['b', 'Good morning, eldest! Did you sleep well? Did you dream?'],
      ['a', 'I never dream. Dreams are unguarded.'],
      ['b', 'That\'s the saddest thing I\'ve ever heard!'],
    ],
    B: [
      ['a', 'You lifted the curse on my barrier. I didn\'t know it was there.'],
      ['b', 'It was a little one. Grumpy. It looked like you.'],
      ['a', 'Hmph.'],
    ],
    A: [
      ['b', 'Did you dream last night?'],
      ['a', '…Yes. Something bright. I think it was you, singing.'],
      ['b', 'See? Dreams aren\'t so bad.'],
      ['a', 'That one wasn\'t.'],
    ],
  },
  // ── The Maidens and their Sages ──
  'greenMaiden|saria': {
    C: [
      ['b', 'You pray to the forest too! What do you ask it for?'],
      ['a', 'Patience, mostly. And that nobody steps on the mushrooms.'],
      ['b', 'I ask it for songs. It always gives me one.'],
    ],
    B: [
      ['a', 'Your ocarina: the Lost Woods answer it. I\'ve never heard them so awake.'],
      ['b', 'They\'re lonely. Everyone gets lost in them and nobody stays to talk.'],
    ],
    A: [
      ['b', 'A Sage and a Maiden. Do you think we\'re doing the same job?'],
      ['a', 'I think we\'re keeping the same door from two sides.'],
      ['b', 'Then let\'s leave it open a crack. So we can wave.'],
    ],
    S: [
      ['n', 'In a clearing of the Lost Woods, a Kokiri girl plays and a Maiden in green sings along.'],
      ['a', 'The trees are dancing.'],
      ['b', 'They\'re happy. They\'ve got two friends now.'],
      ['a', 'Then I\'ll come back. Every season.'],
      ['b', 'Bring the song. I\'ll bring the ocarina.'],
    ],
  },
  'darunia|redMaiden': {
    C: [
      ['a', 'Ha! A Maiden of Flame! Tell me, little sister, can you take the heat of Death Mountain?'],
      ['b', 'I was sealed in the Tower of Flames for three weeks. Can you?'],
      ['a', '…HA! I like you!'],
    ],
    B: [
      ['b', 'Your people eat rocks.'],
      ['a', 'The finest rocks! From the deepest caverns!'],
      ['b', 'Could I try one? The ones near the lava. Spicy.'],
      ['a', 'A Maiden after my own heart!'],
    ],
    A: [
      ['a', 'The mountain\'s fire is in you. I felt it when you prayed.'],
      ['b', 'It\'s the same fire you keep, Sage of Fire. I just keep it louder.'],
      ['a', 'Louder! Ha! Then sing it louder still, little sister.'],
    ],
    S: [
      ['n', 'At the summit of Death Mountain, a Goron chief and a Maiden in red watch the crater glow.'],
      ['a', 'Brother. That\'s what you are to us now. A sister, I mean. A brother-sister!'],
      ['b', 'Sworn by fire?'],
      ['a', 'Sworn by fire, and rock, and a very good dinner. Come! The feast is waiting!'],
    ],
  },
  'blueMaiden|ruto': {
    C: [
      ['b', 'A Maiden of Water. Well. I suppose you\'re pretty enough for it.'],
      ['a', 'Thank you, Princess.'],
      ['b', 'I didn\'t say prettier than me.'],
    ],
    B: [
      ['a', 'Your domain is beautiful. The water sings there.'],
      ['b', 'Of course it does. It\'s Zora water.'],
      ['a', 'My village is named after me, you know.'],
      ['b', '…They named a whole village? I only got a fountain.'],
    ],
    A: [
      ['b', 'Do you ever feel like a title, and not a person?'],
      ['a', 'Every day. "The Blue Maiden." As if that\'s all I am.'],
      ['b', 'Hmph. Well. You can be Ruto\'s friend, too. That\'s a title I don\'t give out.'],
    ],
    S: [
      ['b', 'I\'ve decided. You\'re my sister now. Zora law.'],
      ['a', 'Is that a real law?'],
      ['b', 'It is if the princess says so.'],
      ['a', 'Then I accept, little sister.'],
      ['b', 'Big sister. I\'m older. Obviously.'],
    ],
  },
  'impa|purpleMaiden': {
    C: [
      ['a', 'You move like a Sheikah.'],
      ['b', 'I learned in the Temple of Darkness. There was no one to teach me.'],
      ['a', 'Then you taught yourself well. That is rarer.'],
    ],
    B: [
      ['b', 'You guard a princess. So do I, in my way.'],
      ['a', 'From the shadows. Yes. It is lonely work.'],
      ['b', 'It doesn\'t have to be. Shadows are big. There\'s room for two.'],
    ],
    A: [
      ['a', 'If I taught you the Sheikah way of walking unseen, would you teach me how you see in the dark?'],
      ['b', 'It isn\'t seeing. It\'s listening very hard.'],
      ['a', 'Then I will listen very hard.'],
    ],
    S: [
      ['n', 'Two figures cross the Kakariko rooftops at midnight. Nobody below hears a thing.'],
      ['a', 'You are ready. The Sheikah would have been proud to call you one of us.'],
      ['b', 'And you\'d have made a fine Maiden. You never complain.'],
      ['a', 'I complain constantly. Silently.'],
      ['b', 'I know. I can hear it.'],
    ],
  },
  'rauru|yellowMaiden': {
    C: [
      ['b', 'Are you the Sage of Light? You\'re very… round and serious!'],
      ['a', 'I have guarded the Chamber of Sages for a very long time, child.'],
      ['b', 'Have you tried smiling? It makes the light come easier.'],
    ],
    B: [
      ['a', 'Your light lifts curses without a word of the old prayers. How?'],
      ['b', 'I just think about something happy and push it outwards!'],
      ['a', '…Seven hundred years of liturgy, and that is the answer.'],
    ],
    A: [
      ['b', 'You look tired, Rauru.'],
      ['a', 'Light is heavy when you carry it alone.'],
      ['b', 'Then let me carry the bright bits. You do the serious bits.'],
    ],
    S: [
      ['n', 'In the Temple of Light, an old sage is laughing for the first time in an age.'],
      ['a', 'You have done what no curse-breaker ever has. You made me forget the weight.'],
      ['b', 'It was never that heavy! You were just holding it wrong.'],
      ['a', 'Then teach me to hold it right, little sun.'],
    ],
  },
  'nabooru|whiteMaiden': {
    C: [
      ['a', 'So you\'re the one who builds walls of light. Can they stop a Gerudo?'],
      ['b', 'They can stop anything. Shall we test it?'],
      ['a', 'Now we\'re talking.'],
    ],
    B: [
      ['b', 'You broke through on the fourth attempt.'],
      ['a', 'You rebuilt it on the fourth attempt. I\'d call that a draw.'],
      ['b', 'I would call it a lesson. For both of us.'],
    ],
    A: [
      ['a', 'I spent years as Twinrova\'s puppet. I know what it\'s like to be locked away.'],
      ['b', 'I spent weeks in the Ice Temple\'s crystal. I know too.'],
      ['a', 'So no more walls around us. Only walls around the people we protect.'],
      ['b', 'Agreed, Sage of Spirit.'],
    ],
    S: [
      ['a', 'Come to the desert with me. The Spirit Temple could use a guardian with your kind of stubbornness.'],
      ['b', 'And the Ice Temple?'],
      ['a', 'Will still be cold when you get back.'],
      ['b', '…One season. Then you come north and freeze with me.'],
      ['a', 'Deal. Bring a cloak for me.'],
    ],
  },
};
