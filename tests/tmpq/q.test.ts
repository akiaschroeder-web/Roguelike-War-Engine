import { it } from 'vitest';
import { BOSSES, TEMPLATES, ENEMIES, WEAPONS, GEAR, ITEMS, WORLDS } from '../../src/data/registry';
it('q', () => {
  for (const id of ['ironKnuckle','darkLink','volvagia','stalfos','goriya','moblin','octorok','leever','tektite','keese','redBubble','blueBubble','bubble','skulltula','wizzrobe','ballAndChain','raft','recorder','magicalKey','hammer','megatonHammer','triforceCourage','magicContainer','magicJar','hyruleKnight','oldMan','sonia','zeldaWild','kingRhoam','agahnim','aeralfos','revali','zol','lynel','darknut','heroShade','herosShade','captainKeeta','stallord','valoo','helmarocKing','argorok','ghini','bot','iceKeese','fireKeese','ache','redLeever','ballAndChainTrooper','ironKnuckleBoss']) {
    console.log(id, !!BOSSES[id] && 'BOSS', !!TEMPLATES[id] && 'TPL', !!ENEMIES[id] && 'ENEMY', !!WEAPONS[id] && 'W', !!GEAR[id] && 'G:'+GEAR[id]?.slot, !!ITEMS[id] && 'I');
  }
  console.log(Object.keys(BOSSES).filter(k=>/knuckle|dark|link|volv|ball/i.test(k)));
  console.log(Object.keys(WEAPONS).filter(k=>/ball|chain|hammer|flail/i.test(k)));
  console.log(Object.keys(GEAR).filter(k=>/magic|container|triforce|hammer|boot|cross|key/i.test(k)));
  console.log(Object.keys(ITEMS).filter(k=>/magic|container|jar|doll|fairy/i.test(k)));
  console.log(Object.keys(ENEMIES).filter(k=>/keese|bubble|stal|knuck|moblin|octo|leev|tekt|wizz|goriya|skull/i.test(k)));
  console.log(Object.keys(TEMPLATES).filter(k=>/knight|sold|knuck|old|wizz|dark/i.test(k)));
});
