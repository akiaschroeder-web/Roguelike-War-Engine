import type { AbilityDef } from '../../engine/types';

// Great Fairy spells, Ocarina songs and elemental arrows from the design doc.
// Songs need an instrument (Fairy Ocarina, Ocarina of Time, Sheik's Harp…)
// carried by the performer; better instruments lower the MP cost.

const ab = (d: Omit<AbilityDef, 'implemented'> & { implemented?: boolean }): AbilityDef => ({ implemented: true, ...d });

export const ABILITIES: AbilityDef[] = [
  // ── Great Fairy spells ──
  ab({ id: 'dinsFire', name: "Din's Fire", kind: 'spell', mp: 8, desc: 'Fire magic hits every enemy within 2 spaces (MAG + 6 vs RES) and may set them Burning.' }),
  ab({ id: 'faroresWind', name: "Farore's Wind", kind: 'spell', mp: 6, desc: 'First cast marks your position. Cast again to warp back to the mark.' }),
  ab({ id: 'nayrusLove', name: "Nayru's Love", kind: 'spell', mp: 12, desc: 'A crystal barrier negates all damage to the caster until their next turn.' }),
  // ── Songs ──
  ab({ id: 'zeldasLullaby', name: "Zelda's Lullaby", kind: 'song', mp: 3, desc: 'Cures every status effect on allies within 3 spaces.' }),
  ab({ id: 'sariasSong', name: "Saria's Song", kind: 'song', mp: 4, desc: 'Allies within 3 spaces gain +2 SPD and +2 LCK for 3 turns.' }),
  ab({ id: 'sunsSong', name: "Sun's Song", kind: 'song', mp: 5, desc: 'Stuns every undead enemy within 3 spaces for a turn.' }),
  ab({ id: 'songOfStorms', name: 'Song of Storms', kind: 'song', mp: 6, desc: 'Rain for 3 turns: puts out all fires, stops Burning, and powers up water and lightning attacks.' }),
  ab({ id: 'eponasSong', name: "Epona's Song", kind: 'song', mp: 3, desc: 'Summons the performer’s mount. (Coming with mounts.)', implemented: false }),
  ab({ id: 'songOfTime', name: 'Song of Time', kind: 'song', mp: 5, desc: 'Moves Time Blocks and activates ancient mechanisms. (Coming with map objects.)', implemented: false }),
  // ── Elemental arrows (chosen in the combat forecast when a bow is equipped) ──
  ab({ id: 'fireArrow', name: 'Fire Arrow', kind: 'arrow', mp: 2, might: 3, element: 'fire', desc: '+3 Might; may set the target Burning.' }),
  ab({ id: 'iceArrow', name: 'Ice Arrow', kind: 'arrow', mp: 2, might: 2, element: 'ice', desc: '+2 Might; may Freeze the target.' }),
  ab({ id: 'lightArrow', name: 'Light Arrow', kind: 'arrow', mp: 4, might: 6, element: 'light', effective: ['undead', 'demon'], desc: '+6 Might; double damage against demons and the undead.' }),
  // ── Warp songs (3-turn cooldown) ──
  ab({ id: 'minuetOfForest', name: 'Minuet of Forest', kind: 'song', mp: 6, warp: 'forest', cooldown: 3, desc: 'Warp to any open forest space.' }),
  ab({ id: 'boleroOfFire', name: 'Bolero of Fire', kind: 'song', mp: 6, warp: 'fire', cooldown: 3, desc: 'Warp to any open space beside lava.' }),
  ab({ id: 'serenadeOfWater', name: 'Serenade of Water', kind: 'song', mp: 6, warp: 'water', cooldown: 3, desc: 'Warp to any open space beside water.' }),
  ab({ id: 'requiemOfSpirit', name: 'Requiem of Spirit', kind: 'song', mp: 6, warp: 'spirit', cooldown: 3, desc: 'Warp to any open fort or ruin.' }),
  ab({ id: 'nocturneOfShadow', name: 'Nocturne of Shadow', kind: 'song', mp: 6, warp: 'shadow', cooldown: 3, desc: 'Warp to any open space in the shadow of a wall.' }),
  ab({ id: 'preludeOfLight', name: 'Prelude of Light', kind: 'song', mp: 8, warp: 'light', cooldown: 3, desc: "Warp back to your army's deployment zone." }),
  // ── Techniques (stamina; known by anyone carrying the right weapon type) ──
  ab({ id: 'powerStrike', name: 'Power Strike', kind: 'technique', mp: 0, sta: 4, might: 4, weaponTypes: ['sword', 'axe', 'hammer', 'lance', 'gauntlet'], desc: '+4 Might on this attack.' }),
  ab({ id: 'piercingThrust', name: 'Piercing Thrust', kind: 'technique', mp: 0, sta: 4, crit: 25, weaponTypes: ['lance', 'dagger'], desc: '+25 Crit on this attack.' }),
  ab({ id: 'aimedShot', name: 'Aimed Shot', kind: 'technique', mp: 0, sta: 3, hit: 25, weaponTypes: ['bow', 'sling', 'boomerang', 'hookshot'], desc: '+25 Hit on this attack.' }),
  ab({ id: 'spinAttack', name: 'Spin Attack', kind: 'technique', mp: 0, sta: 6, area: true, weaponTypes: ['sword'], desc: 'Strike every adjacent enemy at once (STR + sword Might vs DEF). No counterattacks.' }),
  // ── Personal abilities ──
  ab({ id: 'greatFairysBlessing', name: "Great Fairy's Blessing", kind: 'personal', mp: 0, oncePerBattle: true, desc: 'Once per battle: fully restore the HP and MP of an ally within 2 spaces (or yourself).' }),
];
