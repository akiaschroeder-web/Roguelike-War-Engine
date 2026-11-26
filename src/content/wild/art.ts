// Art sharing for the Era of the Wild pack (files live in public/art and public/portraits;
// ids and sources are in art_sources/era_of_the_wild/IDS.md).
export const ART_ALIASES: Record<string, string> = {
  // Template ids fixed by the doc's Implementation IDs section
  mineru: 'mineruConstruct', yigaEngineer: 'yigaBlademaster',
  soldierConstruct1: 'soldierConstructSpear', soldierConstruct2: 'soldierConstructSpear', soldierConstruct3: 'soldierConstructAxe', soldierConstruct4: 'soldierConstructAxe',
  captainConstruct1: 'captainConstructBlade', captainConstruct2: 'captainConstructBlade', captainConstruct3: 'captainConstructBlade', captainConstruct4: 'captainConstructGold',
  // Boss forms of recruitable characters
  calamityGanonBoss: 'calamityGanon', darkBeastGanonWildBoss: 'darkBeastGanonWild', ganondorfWildBoss: 'ganondorfWild', demonDragonBoss: 'demonDragon',
  kohgaBoss: 'kohga', soogaBoss: 'sooga', guardianArmyStalker: 'guardianStalker',
  vahRutaBoss: 'vahRuta', vahRudaniaBoss: 'vahRudania', vahMedohBoss: 'vahMedoh', vahNaborisBoss: 'vahNaboris',
};

/** id -> several art ids; each unit picks one. Appended to the other packs' lists. */
const goron = ['goronWarrior', 'goronWarriorTP', 'goronWarriorWW', 'goronWarriorBotW'];
const zora = ['zoraWarrior', 'zoraWarriorTP', 'zoraWarriorBotW'];
const rito = ['ritoGeneric', 'ritoWarriorBotW'];
export const ART_VARIANTS: Record<string, string[]> = {
  ganondorfWild: ['ganondorfWild', 'ganondorfWildDemonKing'],
  gibdo: ['gibdo', 'gibdoTOTK'],
  lizalfos: ['lizalfos', 'lizalfosBotW'],
  moblin: ['moblin', 'moblinBotW'],
  bokoblin: ['bokoblin', 'bokoblinBotW'],
  likeLike: ['likeLike', 'likeLikeBotW'],
  // Every generic unit of those races that uses the base art gets the same variants.
  goronWarrior: goron, goronRoller: goron, ritoGeneric: rito,
  zoraWarrior: zora, zoraMystic: zora,
  ritoScout: rito, ritoWarrior: rito, ritoArcher: rito, ritoGuardian: rito, ritoWindcaller: rito, ritoCourier: rito,
};
