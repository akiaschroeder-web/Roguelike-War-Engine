import type { SkillDef } from '../../engine/types';

const k = (id: string, name: string, desc: string): SkillDef => ({ id, name, desc, implemented: true });

export const SKILLS: SkillDef[] = [
  // ── The four Links ──
  k('unitedCourage', 'United Courage', 'The other three Links within 4 of him gain +2 STR, SKL and DEF.'),
  k('burningCourage', 'Burning Courage', '+4 STR below 50% HP.'),
  k('swiftCourage', 'Swift Courage', 'After a kill he moves 2 more spaces: +2 MOV until the end of his next turn.'),
  k('mysticCourage', 'Mystic Courage', 'Sword beams, magic weapons and his magical abilities deal +25% damage.'),
  // ── Section 2 ──
  k('sealOfLight', 'Seal of Light', 'Sacred attacks (light, sacred weapons and abilities) deal +25%; dark enemies within 2 (demons, shadows, the undead) have −3 STR, MAG and DEF.'),
  k('shadowReflectionSkill', 'Shadow Reflection', 'Creates temporary shadow duplicates (Shadow Reflection) and travels through dark terrain (forests, darkness and Dark World Portals cost 1). His hits steal Force Gems from the other side.'),
  k('kingOfDarkness', 'King of Darkness', 'Allied monsters, demons and the undead within 3 gain +3 STR and DEF; the Trident\'s hits can banish enemies into the Dark World.'),
  // ── The six Shrine Maidens ──
  k('forestBlessing', 'Forest Blessing', 'Allies within 2 recover 5% HP at the start of each turn and are cured of Poison.'),
  k('flameBlessing', 'Flame Blessing', 'Allies within 2 deal +25% fire damage and take half fire damage.'),
  k('waterBlessing', 'Water Blessing', 'Allies within 2 recover 5% HP and 3 MP at the start of each turn.'),
  k('shadowBlessing', 'Shadow Blessing', 'Allies within 2 gain +4 RES; the Maiden is Veiled at the start of each turn while no enemy is next to her.'),
  k('radiantBlessing', 'Radiant Blessing', 'Removes curses: allies within 2 lose Curse, Silence and Weaken at the start of each turn. Allied sacred attacks within 2 deal +20%.'),
  k('protectiveBlessing', 'Protective Blessing', 'Magical barriers: at the start of each turn, allies within 2 gain a barrier that absorbs 5 damage.'),
  // ── Section 3 ──
  k('spearFormation', 'Spear Formation', '+2 DEF for each other spearman next to him (up to +4).'),
  k('militaryExplosives', 'Military Explosives', 'His bombs deal 50% more damage and their blast reaches 1 space further.'),
  k('militaryCommand', 'Military Command', 'Generic Hyrule soldiers within 3 gain +2 STR and SKL.'),
  // ── Section 4 ──
  k('chainReach', 'Chain Reach', 'Attacks at range 2, and a hit pulls the target a space closer.'),
  k('massiveDetonation', 'Massive Detonation', 'A living bomb: its fuse burns for 3 turns, then it explodes (STR + 10 to every foe within 2). An enemy Big Bomb is destroyed by its own blast; an allied one is left at 1 HP and the fuse is relit.'),
  k('armoredShell', 'Armored Shell', 'Its shell resists attacks (it takes half damage) until it is flipped over: a hammer, a bomb blast, Guard Breaker, Power Slash or an attack from behind flips it for 2 turns.'),
  k('sandAmbush', 'Sand Ambush', 'Burrows under sand: hidden at the start of battle and of each turn in the desert (when no enemy is next to it), and an attack out of hiding deals +6 damage with +20 Hit.'),
  // ── Section 5 ──
  k('windFortress', 'Wind Fortress', 'A cyclone surrounds him: projectiles (attacks from 2 or more spaces) deal half damage, and at the start of his turn every enemy next to him is pushed back a space.'),
  k('dividingBody', 'Dividing Body', 'Splits as it is hurt: below 2/3 and again below 1/3 of its HP, a slime (a Zol) breaks off beside it.'),
  k('moltenBody', 'Molten Body', 'Immune to fire and lava; heals 10% HP at the start of each turn while on lava.'),
  k('shiftingDefense', 'Shifting Defense', 'Its elemental weakness changes every turn (fire → ice → lightning): its weakness deals ×1.75, everything else ×0.65. Its gel recovers 10% HP at the start of each turn.'),
  k('frozenDefense', 'Frozen Defense', 'Protective ice: it takes 40% damage until the ice is melted (a fire hit) or shattered (a hammer, a bomb or a 15+ damage hit). The ice re-forms after 2 turns.'),
];
