// Art sharing for the Twilight Princess pack (files live in public/art and public/portraits).
export const ART_ALIASES: Record<string, string> = {
  wildBullbo: 'bullboTP', lordBullboMount: 'lordBullbo', shadowKargarokMount: 'shadowKargarok', freezard: 'freezardTP',
  bulblinRaidLeader: 'bulblin', kingBulblinBoss: 'kingBulblin', zantBoss: 'zant', ganondorfTPBoss: 'ganondorfTP', darkBeastGanonBoss: 'darkBeastGanon',
  ooksParasite: 'shadowInsect', wolfLink: 'wolfLinkMidna',
};

/** id -> several art ids; each unit picks one. */
export const ART_VARIANTS: Record<string, string[]> = {
  wildBullbo: ['bullboTP', 'bullbo'],
  kargaroc: ['kargaroc', 'kargarocTP'],
  postman: ['postman', 'postmanMM'],
  whiteWolfos: ['whiteWolfos', 'whiteWolfosOoT'],
  skullfish: ['skullfish', 'skullfishMM'],
  lizalfos: ['lizalfos', 'lizalfosTP'],
  dinolfos: ['dinolfos', 'dinolfosTP'],
  darknut: ['darknut', 'darknutTP'],
  bokoblin: ['bokoblin', 'bokoblinTP'],
  stalfos: ['stalfos', 'stalfosTP'],
  poe: ['poe', 'poeTP', 'poeTP2'],
  moblin: ['moblin', 'moblinWW'],
  greatFairy: ['greatFairy', 'greatFairyTP', 'greatFairyWW'],
  hyruleSoldier: ['hyruleSoldier', 'hyruleSoldierTP'],
  hyruleKnight: ['hyruleSoldier', 'hyruleSoldierTP'],
  hyruleArcher: ['hyruleSoldier', 'hyruleSoldierTP'],
  hyruleCavalry: ['hyruleSoldier', 'hyruleSoldierTP'],
  redBubble: ['redBubble', 'redBubbleWW'],
  blueBubble: ['blueBubble', 'blueBubbleWW'],
  chuchuRed: ['chuchuRed', 'chuchuRedMM', 'chuchuRedTP'],
  chuchuGreen: ['chuchuGreen', 'chuchuGreenMM', 'chuchuGreenTP'],
  chuchuBlue: ['chuchuBlue', 'chuchuBlueTP'],
  chuchuYellow: ['chuchuYellow', 'chuchuYellowTP'],
};
