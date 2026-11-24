// Which art each unit uses. Generic recruits and enemies share ids where they
// are the same creature (e.g. the Stalfos recruit and the Stalfos enemy both
// use `stalfos`). Aliases let one image cover several units.
export { ART_IDS } from './artManifest';

export const ART_ALIASES: Record<string, string> = {
  ganondorfBoss: 'ganondorf',
  phantomGanon: 'phantomGanonMounted', // until on-foot art arrives
  clubMoblin: 'moblin',
  fireKeese: 'keese',
  // Generic soldiers of the same army can share a look:
  hyruleKnight: 'hyruleSoldier',
  hyruleCavalry: 'hyruleSoldier',
  kokiriSlingshooter: 'kokiriScout',
  goronRoller: 'goronWarrior',
  zoraMystic: 'zoraWarrior',
  businessScrub: 'dekuScrub',
  gibdo: 'redead',
};
