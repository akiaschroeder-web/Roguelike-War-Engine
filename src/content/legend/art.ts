// Art for the Era of Legend pack (files live in public/art and public/portraits).
export const ART_ALIASES: Record<string, string> = {
  shadowNightmare: 'shadowNightmareAll',
  agahnimBoss: 'agahnim', ganonLegendBoss: 'ganonLegend', ganonResurrected: 'ganonLegend',
  armosKnightsBoss: 'armosKnight', lanmolasBoss: 'lanmola', moldormBoss: 'moldorm', mothulaBoss: 'mothula',
};

/** id -> several art ids; each unit picks one. Merged into (appended to) the other packs' lists. */
export const ART_VARIANTS: Record<string, string[]> = {
  zeldaLegend: ['zeldaLegend', 'zeldaLegend2'],
  wizzrobe: ['wizzrobe', 'wizzrobeWW'],
  bossWizzrobe: ['bossWizzrobe', 'bossWizzrobeWW'],
  octorok: ['octorok', 'octorokALTTP', 'octorokWW', 'octorokSS', 'octorokBotW'],
};

/** The Shadow Nightmare's six forms, in order: name and art. Moldorm's Shadow and Lanmola borrow the existing art. */
export const NIGHTMARE_FORMS: { id: string; name: string; art: string }[] = [
  { id: 'giantGel', name: 'Giant Gel', art: 'nightmareGel' },
  { id: 'agahnimsShadow', name: "Agahnim's Shadow", art: 'nightmareAgahnim' },
  { id: 'moldormsShadow', name: "Moldorm's Shadow", art: 'moldorm' },
  { id: 'shadowOfGanon', name: 'Shadow of Ganon', art: 'nightmareGanon' },
  { id: 'lanmolaShadow', name: 'Lanmola', art: 'lanmola' },
  { id: 'dethI', name: 'DethI', art: 'nightmareDethI' },
];
/** Link's Dark World rabbit form. */
export const BUNNY_ART = 'bunnyLink';
