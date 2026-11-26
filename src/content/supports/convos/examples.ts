// The four complete support chains written in the design doc (section 9), verbatim.
// Lines: ['a' | 'b', text] spoken by the pair's first/second unit (key order), or ['n', text] narration.

type Line = ['a' | 'b' | 'n', string];

export const CONVOS: Record<string, Partial<Record<'C' | 'B' | 'A' | 'S', Line[]>>> = {
  // Hero of Time × Hero of Winds (a = heroOfWinds, b = link)
  'heroOfWinds|link': {
    C: [
      ['a', 'Is that the Master Sword?'], ['b', 'Yes.'], ['a', 'I\'ve got one too. The King told me it belonged to a hero from a long time ago.'], ['b', 'The King?'],
      ['a', 'Well, he was a boat when he told me.'], ['b', 'A boat?'], ['a', 'It\'s a long story.'], ['n', 'The Hero of Time examines the younger hero\'s sword.'],
      ['b', 'Where did you find it?'], ['a', 'Under the sea. In Hyrule Castle.'], ['b', 'Under the sea?'], ['a', 'You really haven\'t heard about any of this, have you?'],
    ],
    B: [
      ['b', 'What happened to Hyrule?'], ['a', 'Ganondorf came back. The people waited for the old hero to return, but he never did.'], ['n', 'The Hero of Time lowers his sword.'],
      ['a', 'The gods flooded the kingdom. That\'s what the King told me, anyway.'], ['b', 'And the people?'], ['a', 'Some of them escaped to the mountaintops. That\'s where our islands came from.'],
      ['b', 'I see.'], ['a', 'You couldn\'t have known.'], ['b', 'No. I suppose not.'],
    ],
    A: [
      ['a', 'You know, everyone kept telling me about you when I started my adventure.'], ['b', 'Did they?'], ['a', 'I didn\'t really care. I just wanted my sister back.'],
      ['b', 'That\'s a good reason to pick up a sword.'], ['a', 'Even if it isn\'t some great destiny?'], ['b', 'Especially then.'], ['a', 'The King eventually called me the Hero of Winds.'], ['b', 'It suits you.'],
    ],
    S: [
      ['b', 'I\'ve been thinking about what you told me.'], ['a', 'About Hyrule?'], ['b', 'Yes. I spent so much of my life trying to save it. It\'s difficult to imagine it gone.'],
      ['a', 'There are still people living up there. We\'ve got towns, forests, farms. Everything we need.'], ['b', 'Are they happy?'], ['a', 'Most of them. My grandma is. Aryll too.'],
      ['n', 'The older hero smiles.'], ['b', 'Then perhaps Hyrule survived after all.'], ['a', 'When this is over, you should come visit Outset.'], ['b', 'I\'d like that.'],
    ],
  },
  // Midna × Tatl (a = midnaImp, b = tatl)
  'midnaImp|tatl': {
    C: [
      ['b', 'So you\'re the one helping this Link?'], ['a', 'Helping him? Sometimes.'], ['b', 'Does he ever listen to you?'], ['a', 'When I make him.'],
      ['b', 'Mine usually just runs off before I\'m finished talking.'], ['a', 'They do have a habit of that.'],
    ],
    B: [
      ['b', 'Why did you start traveling with him?'], ['a', 'I needed someone to help me reclaim something.'], ['b', 'That\'s it?'], ['a', 'At first. What about you?'],
      ['b', 'I got separated from my brother. Link was going the same way, so I made him take me along.'], ['a', 'Sounds familiar.'], ['b', 'I wasn\'t very nice to him.'], ['a', 'Neither was I.'],
    ],
    A: [
      ['b', 'Do you ever worry about what happens when your adventure is finished?'], ['a', 'I\'ve thought about it.'], ['b', 'Link\'s going to leave Termina eventually. He has somewhere else to go.'],
      ['a', 'And you have someone waiting for you there.'], ['b', 'My brother. Skull Kid, too.'], ['a', 'Then make sure you say everything you want to before he leaves.'],
      ['b', 'Are you going to do that with your Link?'], ['n', 'Midna is quiet for a moment.'], ['a', 'I\'ll try.'],
    ],
  },
  // Darunia × Darmani (a = darmani, b = darunia)
  'darmani|darunia': {
    C: [
      ['b', 'That\'s quite a scar you\'ve got there, brother.'], ['a', 'An old injury. It happened while I was trying to reach Snowhead Temple.'], ['b', 'What were you doing up there?'],
      ['a', 'My people were freezing. Someone needed to find out why.'], ['b', 'You went alone?'], ['a', 'I did.'], ['n', 'Darunia nods.'], ['b', 'I\'d have done the same.'],
    ],
    B: [
      ['b', 'My son wants to become a great warrior someday.'], ['a', 'Is he strong?'], ['b', 'He\'s still small. But he\'s got a good heart.'],
      ['a', 'Then teach him to protect that heart. Strength will come with time.'], ['b', 'Did you ever have children?'], ['a', 'No. I suppose I thought there would be time for that later.'], ['b', 'I\'m sorry, brother.'],
    ],
    A: [
      ['a', 'You remind me of the Goron Elder back home.'], ['b', 'The elder? How old do you think I am?'], ['a', 'He was always worried about his people, even when he could barely move.'],
      ['b', 'That\'s what a leader does.'], ['a', 'I used to think being the strongest Goron meant I had to solve everything myself.'], ['b', 'There\'s no shame in asking your brothers for help.'], ['a', 'I\'m beginning to understand that.'],
    ],
    S: [
      ['b', 'Darmani! Come here!'], ['a', 'What is it?'], ['b', 'I\'ve spoken with the others. We\'re holding a feast tonight.'], ['a', 'What\'s the occasion?'], ['b', 'You.'], ['a', 'Me?'],
      ['b', 'You gave everything for your people. I think it\'s about time somebody celebrated what you accomplished.'], ['n', 'Darmani looks toward the gathered Gorons.'],
      ['a', 'I haven\'t attended a Goron feast in a long time.'], ['n', 'Darunia places a hand on his shoulder.'], ['b', 'You\'re among brothers now.'],
    ],
  },
  // Hero's Shade × Hero of Time (a = herosShade, b = link)
  'herosShade|link': {
    C: [
      ['b', 'Your swordsmanship is familiar.'], ['a', 'It should be.'], ['b', 'Have we met before?'], ['a', 'Not as you are now.'], ['b', 'What does that mean?'],
      ['a', 'Draw your sword. There are things I would like to see you perform.'],
    ],
    B: [
      ['b', 'You knew where I would strike before I moved.'], ['a', 'You favor your right side when your opponent raises a shield. You always have.'], ['b', 'Who are you?'],
      ['n', 'The armored spirit lowers his weapon.'], ['a', 'Someone who once carried that sword.'], ['b', 'The Master Sword?'], ['a', 'Yes.'], ['n', 'The younger warrior studies him in silence.'],
    ],
    A: [
      ['b', 'Did we save Hyrule?'], ['a', 'We did.'], ['b', 'Then why are you still here?'],
      ['a', 'I returned to a world that had no memory of what I had accomplished. I carried knowledge that I could not pass on.'], ['b', 'Did nobody believe us?'],
      ['a', 'There were people who believed me. But the life I had lived was gone.'], ['b', 'What happened to Navi?'], ['n', 'The spirit does not immediately answer.'], ['a', 'I never found her.'],
    ],
    S: [
      ['b', 'Is there anything I can do differently?'], ['a', 'You are not bound to repeat my life.'], ['b', 'But you\'re me.'], ['a', 'And you stand before me with years still ahead of you.'],
      ['n', 'The spirit sheathes his sword.'], ['a', 'Do not spend them waiting for someone to acknowledge what you have done. The people you saved owe you nothing.'],
      ['b', 'I wasn\'t expecting anything from them.'], ['a', 'Neither was I. Not at first.'], ['n', 'The Hero of Time looks down at his hands.'],
      ['a', 'Find people you wish to spend your life with. Teach what you have learned. And when the time comes, allow another hero to take your place.'], ['b', 'I\'ll remember.'], ['a', 'Good.'],
    ],
  },
};
