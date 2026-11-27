// Art for the Phantom Hourglass pack (files live in public/art and public/portraits).
export const ART_ALIASES: Record<string, string> = {
  anoukiChief: 'anouki', anoukiWarrior: 'anouki', anoukiHunter: 'anouki', anoukiIceMage: 'anouki', anoukiGuardian: 'anouki',
  yookWarrior: 'yook', yookIceBreather: 'yook', yookBerserker: 'yook',
  // Eox has no art yet: an ancient construct stands in.
  eox: 'koloktos',
  // Boss forms and temporary units.
  bellumbeckBoss: 'bellumbeck', joleneBoss: 'jolene', kingMutohBoss: 'kingMutoh', phantomVanguard: 'phantom',
  blaazFlame: 'blaaz', crayklet: 'crayk', cobbleConstruct: 'bremeur',
  // The seven generic Subrosians share one image.
  subrosianWarrior: 'subrosian', subrosianDancer: 'subrosian', subrosianBlacksmith: 'subrosian', subrosianMiner: 'subrosian',
  subrosianSorcerer: 'subrosian', subrosianChef: 'subrosian', subrosianThief: 'subrosian',
};

/** id -> several art ids; each unit picks one. Merged into (appended to) the other packs' lists. */
export const ART_VARIANTS: Record<string, string[]> = {
  gleeokFlame: ['gleeokFlame', 'gleeokPH'],
  gleeokFrost: ['gleeokFrost', 'gleeokPH'],
};
