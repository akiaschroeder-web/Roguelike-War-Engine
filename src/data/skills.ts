import type { RelicId, SkillId } from '../engine/types';

export const SKILLS: Record<SkillId, { name: string; desc: string }> = {
  lifesteal: { name: 'Lifesteal', desc: 'Heal for half the damage dealt.' },
  armorBreak: { name: 'Armor Break', desc: 'Attacks ignore half of the target’s Def/Res.' },
  nimble: { name: 'Nimble', desc: '+20 Avoid.' },
  deadeye: { name: 'Deadeye', desc: '+20 Crit.' },
  bulwark: { name: 'Bulwark', desc: 'Take 3 less damage from every hit.' },
  regen: { name: 'Regen', desc: 'Recover 20% max HP at the start of each turn.' },
  vantage: { name: 'Vantage', desc: 'When attacked, strike first.' },
  momentum: { name: 'Momentum', desc: '+2 damage for each foe defeated this battle (max +6).' },
};

export interface RelicDef {
  id: RelicId;
  name: string;
  desc: string;
  icon: string;
  price: number;
}

export const RELICS: Record<RelicId, RelicDef> = {
  warpShard: { id: 'warpShard', name: 'Warp Shard', icon: '◆', price: 450, desc: 'All units gain +1 Move.' },
  ironBanner: { id: 'ironBanner', name: 'Iron Banner', icon: '⚑', price: 350, desc: 'All units gain +2 Def.' },
  critLens: { id: 'critLens', name: 'Crit Lens', icon: '◎', price: 300, desc: 'All units gain +10 Crit.' },
  phoenixFeather: { id: 'phoenixFeather', name: 'Phoenix Feather', icon: '♨', price: 500, desc: 'Once per battle, an ally that would fall survives with 1 HP.' },
  bountyBadge: { id: 'bountyBadge', name: 'Bounty Badge', icon: '✪', price: 250, desc: 'Earn 50% more gold from battles.' },
  vampireFang: { id: 'vampireFang', name: 'Vampire Fang', icon: '♆', price: 350, desc: 'Allies recover 8 HP after defeating a foe.' },
  tacticianMap: { id: 'tacticianMap', name: "Tactician's Map", icon: '⌘', price: 300, desc: 'All units gain +15 Hit.' },
  riftBattery: { id: 'riftBattery', name: 'Rift Battery', icon: '⚡', price: 400, desc: 'All units gain +2 Str and +2 Mag.' },
  glassCannon: { id: 'glassCannon', name: 'Glass Cannon', icon: '✧', price: 300, desc: '+4 Str/Mag, but −3 Def/Res.' },
  medkit: { id: 'medkit', name: 'Field Medkit', icon: '✚', price: 250, desc: 'All allies recover 5 HP at the start of each turn.' },
};

export const RELIC_IDS = Object.keys(RELICS) as RelicId[];
