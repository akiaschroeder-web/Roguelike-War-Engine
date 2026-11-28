// Art for A Link Between Worlds (files live in public/art and public/portraits; scripts/prep_lorule_art.py).
export const ART_IDS: string[] = [];

/** id -> id whose art it reuses. The Lorule Spearman and Knight share the Lorule Soldier's art. */
export const ART_ALIASES: Record<string, string> = {
  loruleSpearman: 'loruleSoldier', loruleKnight: 'loruleSoldier', hyruleSpearman: 'hyruleSoldier', yugaBoss: 'yuga',
};

/** Alternate looks (merged into the existing lists): the Ocarina of Time Bari and Biri, this game's Moldorm and Ganon. */
export const ART_VARIANTS: Record<string, string[]> = {
  bari: ['bari', 'bariOOT'],
  biri: ['biri', 'biriOOT'],
  moldorm: ['moldorm', 'moldormALBW'],
  moldormBoss: ['moldorm', 'moldormALBW'],
  ganonHyrule: ['ganon1', 'ganonALBW'],
  ganonBoss: ['ganon1', 'ganonALBW'],
};

/** Art this campaign prefers (in its battles and on its recruits): the A Link Between Worlds Ganon. */
export const LORULE_PREFERRED_ART: Record<string, string> = { ganonHyrule: 'ganonALBW', ganonBoss: 'ganonALBW' };
/** ALBW Link while wall-merged: the 2D painting on the brick wall. */
export const MERGED_ART: Record<string, string> = { linkALBW: 'link2D' };
