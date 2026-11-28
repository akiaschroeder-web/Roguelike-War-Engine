// Art for Echoes of Wisdom (files live in public/art and public/portraits; scripts/prep_echoes_art.py).
export const ART_IDS: string[] = [];

/** id -> id whose art it reuses. */
export const ART_ALIASES: Record<string, string> = {
  // Crawltula never arrived: it uses Strandtula's art.
  crawltula: 'strandtula',
  // Boss forms and modifiers of other entries.
  tekomBoss: 'tekom', echoLink: 'linkEoW', volcanicTalus: 'seismicTalus', jabuJabuBoss: 'jabuJabuEoW',
};

/** id -> several art ids; each unit picks one. Merged into (appended to) the other packs' lists. */
export const ART_VARIANTS: Record<string, string[]> = {
  // The A Link Between Worlds pack's Biri (id `biri`) gets this pack's alternate.
  biri: ['biri', 'biriEoW'],
  // Lord Jabu-Jabu: this pack's look first, the Ocarina of Time model as the alternate.
  jabuJabuEoW: ['jabuJabuEoW', 'jabuJabuOoT'],
};
