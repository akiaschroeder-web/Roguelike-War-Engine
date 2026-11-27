// Art for the Spirit Tracks pack (files live in public/art and public/portraits).
export const ART_ALIASES: Record<string, string> = {
  // Every Phantom form of Zelda shares one image (binding user request).
  phantomZeldaTorch: 'phantomZelda', phantomZeldaWarp: 'phantomZelda', phantomZeldaWrecker: 'phantomZelda',
  // Boss forms.
  bigBlinBoss: 'bigBlin', coleBoss: 'cole', byrneBoss: 'byrne', darkTrainBoss: 'darkTrain',
  // Temporary units.
  fraazHalf: 'fraaz',
};

/** id -> several art ids; each unit picks one. Merged into (appended to) the other packs' lists. */
export const ART_VARIANTS: Record<string, string[]> = {
  // The new ChuChus (docs/chuchu-expansion.md: main art first, then the alternates).
  chuchuStandard: ['chuchuStandard', 'chuchuBlueSS'],
  chuchuFire: ['chuchuFire', 'chuchuRedSS'],
  chuchuIce: ['chuchuIce', 'chuchuFrostAlt'],
  chuchuHelmet: ['chuchuHelmet', 'chuchuSpikedHelmet'],
  // Spirit Tracks alternates for existing units.
  bubbleMM: ['bubbleMM', 'bubbleST'],
  skulltula: ['skulltula', 'skulltulaST'],
  wildBullbo: ['bullboTP', 'bullbo', 'bullboST'],
  bulblin: ['bulblin', 'bulblinST'],
  phantom: ['phantom', 'phantomOfficial'],
};
