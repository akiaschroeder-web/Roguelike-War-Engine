import type { AbilityDef } from '../../engine/types';

const ab = (d: Omit<AbilityDef, 'implemented'> & { implemented?: boolean }): AbilityDef => ({ implemented: true, ...d });
const act = (id: string, name: string, icon: string, desc: string, extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, desc, ...extra });

export const ABILITIES: AbilityDef[] = [
  // ── Wind Waker melodies (conducted with the Wind Waker or any instrument) ──
  ab({ id: 'windsRequiem', name: "Wind's Requiem", kind: 'song', mp: 4, desc: 'Change the wind to blow the way you\'re facing (toward the nearest enemy).', grantedBy: { weapons: ['windWaker'] } }),
  ab({ id: 'balladOfGales', name: 'Ballad of Gales', kind: 'song', mp: 10, cooldown: 4, desc: 'A cyclone carries you and adjacent allies to a space at the far side of the battlefield you choose.', grantedBy: { weapons: ['windWaker'] } }),
  ab({ id: 'commandMelody', name: 'Command Melody', kind: 'song', mp: 6, cooldown: 3, desc: 'Take control of a Command Statue (it fights for you) or an enemy construct (for 2 turns), within 4.', grantedBy: { weapons: ['windWaker'] } }),
  ab({ id: 'earthGodsLyric', name: "Earth God's Lyric", kind: 'song', mp: 8, desc: 'Lifts curses from nearby allies; their light attacks deal +4 for 3 turns.', grantedBy: { weapons: ['windWaker', 'medlisHarp', 'larutosHarp'] } }),
  ab({ id: 'windGodsAriaSong', name: "Wind God's Aria", kind: 'song', mp: 8, desc: 'Flying and gliding allies nearby gain +3 MOV for 2 turns.', grantedBy: { weapons: ['windWaker', 'makarsViolin', 'fadosViolin'] } }),
  ab({ id: 'songOfPassing', name: 'Song of Passing', kind: 'song', mp: 5, cooldown: 2, desc: 'Day becomes night (or night day): undead grow stronger at night, and fog rolls in or lifts.', grantedBy: { weapons: ['windWaker'] } }),

  // ── Techniques ──
  ab({ id: 'multiTargetThrow', name: 'Multi-Target Throw', kind: 'technique', mp: 0, sta: 5, area: true, weaponTypes: ['boomerang'],
    desc: 'The Boomerang hits up to 5 enemies within 4 spaces, each for 60% damage. Cuts hanging vines in reach.' }),
  ab({ id: 'crestStrike', name: 'Crest Strike', kind: 'technique', mp: 0, sta: 5, weaponTypes: ['sword'], might: 4, crit: 15,
    desc: 'A Darknut sword technique: +4 Might, +15 Critical.' }),

  // ── Personal abilities ──
  ab({ id: 'plantTree', name: 'Plant Tree', kind: 'personal', mp: 0, cooldown: 2, grantedBy: { skills: ['windGodsAria', 'greenThumb'], races: ['korok'] },
    desc: 'Grow a tree on an adjacent open space or Planting Soil: cover (+30 Avoid), a Hookshot anchor and a healing space.' }),
  ab({ id: 'shiftWind', name: 'Shift Wind', kind: 'personal', mp: 0, perTurn: true, freeAction: true, grantedBy: { skill: 'godOfWinds' },
    desc: 'Once per turn, without using his action: turn the wind a quarter clockwise.' }),
  ab({ id: 'cyclone', name: 'Cyclone', kind: 'personal', mp: 6, cooldown: 2, grantedBy: { skill: 'godOfCyclones' },
    desc: 'A tornado within 5: enemies around it take magic damage and are hurled 2 spaces away.' }),
  ab({ id: 'specialDelivery', name: 'Special Delivery', kind: 'personal', mp: 0, freeAction: true, perTurn: true, grantedBy: { skills: ['specialDelivery', 'courierService'] },
    desc: 'Hand the first item in your pack to an ally within 6. Doesn\'t use your action.' }),
  ab({ id: 'steal', name: 'Steal', kind: 'personal', mp: 0, oncePerBattle: true, grantedBy: { skill: 'lightFingers' },
    desc: 'Steal an item (or a spare weapon) from an adjacent enemy.' }),
  ab({ id: 'summonPoe', name: 'Summon Poe', kind: 'personal', mp: 8, oncePerBattle: true, grantedBy: { weapons: ['jalhallasLantern'] },
    desc: 'A Poe spirit rises next to you and fights on your side for this battle.' }),
  ab({ id: 'pullStrings', name: 'Pull the Strings', kind: 'personal', mp: 0, cooldown: 3, grantedBy: { gear: ['puppetGanonsString'] },
    desc: 'Move a smaller enemy within 4 to a space next to you.' }),
  ab({ id: 'leafGust', name: 'Leaf Gust', kind: 'personal', mp: 2, grantedBy: { gear: ['dekuLeaf'] },
    desc: 'Blow a gust: enemies within 2 in a line are pushed back 2 spaces. Can swing the wind.' }),
  ab({ id: 'hurl', name: 'Hurl', kind: 'personal', mp: 0, sta: 4, grantedBy: { gear: ['powerBracelets'] },
    desc: 'Lift an adjacent smaller enemy and throw it 3 spaces away: it takes damage on landing.' }),
  ab({ id: 'talonGrab', name: 'Talon Grab', kind: 'personal', mp: 0, sta: 4, grantedBy: { skill: 'skyHunter', weapons: ['helmarocTalons'] },
    desc: 'Snatch an adjacent Size 1 enemy and drop it up to 4 spaces away (into water, if there is any).' }),
  ab({ id: 'grapplePull', name: 'Grapple Pull', kind: 'personal', mp: 0, sta: 2, grantedBy: { weapons: ['grapplingHook'] },
    desc: 'Hook a smaller enemy within 3 and yank it next to you.' }),
  ab({ id: 'grappleDisarm', name: 'Grapple Snatch', kind: 'personal', mp: 0, sta: 3, grantedBy: { weapons: ['grapplingHook'] },
    desc: 'Hook an enemy\'s weapon within 3 and pull it from their hands: it lands at your feet.' }),
  ab({ id: 'igniteStick', name: 'Ignite', kind: 'personal', mp: 0, freeAction: true, grantedBy: { weapons: ['bokoStick'] },
    desc: 'Set your Boko Stick alight (next to fire, lava or a torch-bearing ally): fire damage for 3 attacks, then it burns away.' }),
  ab({ id: 'throwMachete', name: 'Throw Machete', kind: 'personal', mp: 0, grantedBy: { weapons: ['bokoblinMachete'] },
    desc: 'Throw your Bokoblin Machete at an enemy up to 3 spaces away. It lands next to them.' }),
  ab({ id: 'buyPotion', name: 'Buy from Beedle', kind: 'personal', mp: 0, freeAction: true, grantedBy: { skill: 'floatingShop' },
    desc: 'Sell a passenger (or adjacent ally) a Red Potion for ₹40.' }),

  // ── Situational actions (their own buttons when usable) ──
  act('boardVessel', 'Board', '⛵', 'Climb aboard an adjacent friendly vessel with room. You\'re carried until you disembark.'),
  act('disembark', 'Disembark', '⚓', 'Put the next passenger ashore on an adjacent space. Doesn\'t use the vessel\'s action; the passenger can act.', { freeAction: true }),
  act('commandeer', 'Commandeer', '🏴', 'Take an adjacent enemy vessel whose crew is gone. It fights for you, and joins your fleet after a victory.'),
  act('pickUpWeapon', 'Pick Up', '🗡', 'Pick up a weapon lying on or next to your space. Weapons you aren\'t trained in suffer −20 Hit. Doesn\'t use your action.', { freeAction: true }),
  act('cutVine', 'Cut Vine', '🌿', 'Cut an adjacent Hanging Vine: what it held crashes down on everyone next to it.'),
  act('detonateBarrel', 'Detonate Barrel', '💥', 'Set off a Spiked Barrel within range of your weapon: it explodes, hurting everyone next to it.'),
  act('salvage', 'Salvage', '🪝', 'Haul up Submerged Treasure next to you (a vessel with a Grappling Crane reaches 2 spaces).'),
  act('smashSearchlight', 'Smash Searchlight', '🔦', 'Wreck an adjacent Searchlight.'),
];
