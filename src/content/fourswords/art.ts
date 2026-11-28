// Art for Four Swords & Four Swords Adventures (files live in public/art and public/portraits; scripts/prep_fourswords_art.py).
export const ART_IDS: string[] = [];

/** id -> id whose art it reuses. */
export const ART_ALIASES: Record<string, string> = {
  // The user's decision: Dera Zol shares Delu Zol's art as is.
  deraZol: 'deluZol',
  // The generic military classes share the Hyrule soldier art.
  hyruleSpearman: 'hyruleSoldier', hyruleBombardier: 'hyruleSoldier', hyruleCaptain: 'hyruleSoldier',
};

/** id -> several art ids; each unit picks one. Merged into (appended to) the other packs' lists. */
export const ART_VARIANTS: Record<string, string[]> = {
  kaepora: ['kaepora', 'kaeporaGaeboraFS'],
  arrghus: ['arrghus', 'arrghusFSA'],
  phantomGanon: ['phantomGanon', 'phantomGanonFSA'],
};
