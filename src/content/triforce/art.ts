// Art for Tri Force Heroes (files live in public/art and public/portraits; scripts/prep_triforce_art.py).
export const ART_IDS: string[] = [];

/** id -> id whose art it reuses. The Hinox Brothers are the Hinox; the Mini-Margos are little Margomas. */
export const ART_ALIASES: Record<string, string> = {
  hinoxEldest: 'hinox', hinoxElder: 'hinox', lilHinox: 'hinox', ladyMaudBoss: 'ladyMaud', miniMargo: 'margoma',
};

/** Alternate looks (merged into the existing lists): the Green Hero art for the ALBW Link, and the cursed Styla. */
export const ART_VARIANTS: Record<string, string[]> = {
  linkALBW: ['linkALBW', 'greenHeroALBW'],
  styla: ['styla', 'stylaCursed'],
};

/** Art this campaign prefers: the ALBW Link as the Green Hero. */
export const TRIFORCE_PREFERRED_ART: Record<string, string> = { linkALBW: 'greenHeroALBW' };
/** Princess Styla while Lady Maud's Fashion Curse holds. */
export const CURSED_STYLA_ART = 'stylaCursed';

/** Totem art: every stacking order of the three heroes (top first), and the two-hero stacks cropped from them. */
export const TOTEM_ART_3 = ['GRB', 'GBR', 'RGB', 'RBG', 'BGR', 'BRG'].map((o) => `totem${o}`);
export const TOTEM_ART_2 = ['GR', 'GB', 'RG', 'RB', 'BG', 'BR'].map((o) => `totem${o}`);
