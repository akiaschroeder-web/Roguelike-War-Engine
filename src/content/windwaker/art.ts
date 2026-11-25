// Art sharing for the Wind Waker pack (files live in public/art and public/portraits).
export const ART_ALIASES: Record<string, string> = {
  ritoScout: 'ritoGeneric', ritoWarrior: 'ritoGeneric', ritoArcher: 'ritoGeneric', ritoGuardian: 'ritoGeneric', ritoWindcaller: 'ritoGeneric', ritoCourier: 'ritoGeneric',
  korokScout: 'korokGeneric', korokPlanter: 'korokGeneric', korokWindMage: 'korokGeneric', korokHealer: 'korokGeneric',
  pirateGrappler: 'senza',
  bokoblinChief: 'bokoblin', bigOctoBoss: 'bigOcto', mightyDarknutBoss: 'mightyDarknut', ganondorfWWBoss: 'ganondorfWW',
  smallRaft: 'raft', bokoblinRaft: 'raft', sailingBoat: 'raft',
};

export const ART_VARIANTS: Record<string, string[]> = {
  chuchuRed: ['chuchuRed', 'chuchuRedMM'],
  chuchuGreen: ['chuchuGreen', 'chuchuGreenMM'],
  bombchuMonster: ['bombchuMonster', 'bombchuMonsterMM'],
  phantomGanon: ['phantomGanon', 'phantomGanonWW'],
  pirateGrappler: ['senza', 'nudge', 'zuko', 'mako'],
};
