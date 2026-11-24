// Which art each unit uses. Generic recruits and enemies share ids where they
// are the same creature (e.g. the Stalfos recruit and the Stalfos enemy both
// use `stalfos`). Aliases let one image cover several units.
export { ART_IDS } from './artManifest';

export const ART_ALIASES: Record<string, string> = {
  ganondorfBoss: 'ganondorf',
  clubMoblin: 'moblin',
  fireKeese: 'keese',
  // Generic soldiers of the same army can share a look:
  hyruleKnight: 'hyruleSoldier',
  hyruleCavalry: 'hyruleSoldier',
  goronRoller: 'goronWarrior',
  biggoron: 'goronWarrior',
  medigoron: 'goronWarrior',
  zoraMystic: 'zoraWarrior',
  gibdo: 'redead',
};

/** Generic units that pick one of several looks (stable per unit). */
export const ART_VARIANTS: Record<string, string[]> = {
  kokiriScout: ['kokiriA', 'kokiriB', 'kokiriC'],
  kokiriSlingshooter: ['kokiriA', 'kokiriB', 'kokiriC'],
  stinger: ['stingerA', 'stingerB'],
};
