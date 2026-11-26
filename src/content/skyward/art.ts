// Art sharing for the Skyward Sword pack (files live in public/art and public/portraits).
export const ART_ALIASES: Record<string, string> = {
  skyLoftwing: 'loftwingBlue', crimsonLoftwing: 'loftwing',
  grooseRival: 'groose', ghirahimBoss: 'ghirahim', demiseBoss: 'demise',
};

/** id -> several art ids; each unit picks one. Merged into (appended to) the other packs' lists. */
export const ART_VARIANTS: Record<string, string[]> = {
  moblin: ['moblin', 'moblinSS'],
  beamos: ['beamos', 'beamosSS'],
  lizalfos: ['lizalfos', 'lizalfosSS'],
  stalfos: ['stalfos', 'stalfosSS'],
  chuchuGreen: ['chuchuGreen', 'chuchuGreenSS'],
  chuchuBlue: ['chuchuBlue', 'chuchuBlueSS'],
  chuchuRed: ['chuchuRed', 'chuchuRedSS'],
  chuchuYellow: ['chuchuYellow', 'chuchuYellowSS'],
};
