// Art for The Minish Cap (files live in public/art and public/portraits; scripts/prep_minish_art.py).
export const ART_IDS: string[] = [];

/** id -> id whose art it reuses (the doc's FINAL art identities and fallbacks). */
export const ART_ALIASES: Record<string, string> = {
  microLink: 'heroOfMinish',
  // The clover Minish is the shared art of the generic Minish and of Librari and Festari.
  festari: 'forestMinish', librari: 'forestMinish',
  forestMinishScout: 'forestMinish', forestMinishHealer: 'forestMinish', mountainMinishWarrior: 'forestMinish', mountainMinishBlacksmith: 'forestMinish',
  townMinishThief: 'forestMinish', townMinishTinkerer: 'forestMinish',
  grimblade: 'swiftblade',
  silverDarknut: 'darknut', redDarknut: 'darknut',
};
