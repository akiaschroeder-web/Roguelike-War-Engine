// Art for the Original Hyrule pack (files live in public/art and public/portraits).
export const ART_ALIASES: Record<string, string> = {
  heroOfHyrule: 'link1', zeldaHyrule: 'zelda1', ganonHyrule: 'ganon1', merchantHyrule: 'merchant1',
  lesserDigdogger: 'digdogger', ganonBoss: 'ganon1', dodongoBoss: 'dodongo1',
};

/** id -> several art ids; each unit picks one. Merged into (appended to) the other packs' lists.
 *  gleeokFlame and lynel come from the Era of the Wild pack: until it is merged these entries are inert. */
export const ART_VARIANTS: Record<string, string[]> = {
  dodongo: ['dodongo', 'dodongo1'],
  queenGohma: ['queenGohma', 'gohma1'],
  octorok: ['octorok', 'octorok1'],
  moldorm: ['moldorm', 'moldorm1'],
  gleeokFlame: ['gleeokFlame', 'gleeok1'],
  darknut: ['darknut', 'darknut1'],
  lynel: ['lynel', 'lynel1'],
  tektite: ['tektite', 'tektite1'],
};
