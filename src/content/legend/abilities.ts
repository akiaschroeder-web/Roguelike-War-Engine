import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (resolved by engine/wild.ts castWild, which any pack can use). */
const p = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, grantedBy: { templates }, ...extra });
/** A personal ability with a special effect (engine/legend.ts castLegend). */
const q = (id: string, name: string, mp: number, desc: string, templates: string[], extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: { templates }, ...extra });
/** Granted by equipment. */
const tool = (id: string, name: string, mp: number, desc: string, gear: { gear?: string[]; weapons?: string[] }, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: gear, ...extra });
/** A battlefield action anyone can take where it applies. */
const act = (id: string, name: string, icon: string, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, desc, ...extra });
/** Seed ammunition for the Seed Shooter, Hyper Slingshot and enhanced slingshots (chosen when attacking; uses a seed). */
const seedShot = (id: string, name: string, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'technique', mp: 0, sta: 0, weaponTypes: ['sling'], desc, ...extra });
const sacred = ['sacred'] as const;

/** Mystical seed ammunition: technique id -> seed kind. */
export const SEED_SHOTS: Record<string, string> = { emberShot: 'ember', scentShot: 'scent', pegasusShot: 'pegasus', galeShot: 'gale', mysteryShot: 'mystery' };
/** Harp of Ages tunes. */
export const HARP_TUNES = ['tuneOfEchoes', 'tuneOfCurrents', 'tuneOfAges'];
/** The Ocarina's three Koholint songs (taught by events). */
export const KOHOLINT_SONGS = ['balladSong', 'manbosMambo', 'frogsSongOfSoul'];

export const ABILITIES: AbilityDef[] = [
  // ── Link ──
  q('pegasusDash', 'Pegasus Dash', 0, 'Charge in a straight line up to 4 spaces (6 with the Pegasus Boots): the first enemy in the way takes STR + weapon + 4 and is knocked back.', ['heroOfLegend'],
    { sta: 6, cooldown: 2, grantedBy: { templates: ['heroOfLegend'], gear: ['pegasusBoots'] }, icon: '💨' }),
  p('hurricaneSpin', 'Hurricane Spin', 0, 'A powerful spin: every adjacent enemy takes STR + weapon + 4 (the Spin Ring makes it hit twice).', ['heroOfLegend'],
    { target: 'foes', radius: 1, dmg: { stat: 'str', base: 4, vs: 'def', weapon: true } }, { sta: 8, cooldown: 2 }),
  q('secretDiscoveryAbility', 'Secret Discovery', 0, 'Search: reveals hidden enemies, traps, buried treasure, Invisible Floors and hidden passages within 4. Doesn\'t use your action.', ['heroOfLegend'],
    { freeAction: true, perTurn: true, icon: '🔍' }),
  // ── Zelda ──
  p('sacredLightLegend', 'Sacred Light', 6, 'Sacred light on an enemy within 4 (MAG + 8 vs RES) — half again against demons and the undead.', ['zeldaLegend'],
    { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 8, vs: 'res', element: 'light', sacred: true }, tags: [...sacred] }),
  p('maidensBlessing', "Maiden's Blessing", 6, 'You and allies within 2 recover MAG/2 + 5 HP and gain +2 RES for 2 turns.', ['zeldaLegend'],
    { target: 'allies', radius: 2, heal: { base: 5 }, buff: { id: 'maidensBlessing', name: "Maiden's Blessing", turns: 2, stats: { res: 2 } }, tags: [...sacred] }, { cooldown: 2 }),
  q('sealDarkness', 'Seal Darkness', 8, 'Seal an enemy within 3: Silenced for 2 turns and −2 MOV; demons and nightmares also take MAG + 6 sacred damage.', ['zeldaLegend'], { cooldown: 3 }),
  p('telepathicGuidance', 'Telepathic Guidance', 3, 'Guide an ally within 8: +2 MOV and +2 SKL for its next turn. Doesn\'t use your action.', ['zeldaLegend'],
    { target: 'ally', range: [1, 8], buff: { id: 'telepathy', name: 'Telepathic Guidance', turns: 1, stats: { mov: 2, skl: 2 } } }, { freeAction: true, perTurn: true }),
  // ── Ganon ──
  p('tridentThrow', 'Trident Throw', 6, 'Hurl the trident at an enemy 2–4 away: STR + weapon + 4, ignores 30% DEF.', ['ganonLegend', 'ganonLegendBoss'],
    { target: 'foe', range: [2, 4], dmg: { stat: 'str', base: 4, vs: 'def', weapon: true, pierce: 0.3 } }, { cooldown: 2 }),
  p('blazingBatSwarm', 'Blazing Bat Swarm', 8, 'Burning bats swarm an enemy within 4 and those next to it (MAG + 4 fire, may Burn).', ['ganonLegend', 'ganonLegendBoss'],
    { target: 'foe', range: [1, 4], radius: 1, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 40 } }, { cooldown: 2 }),
  p('darkTeleportation', 'Dark Teleportation', 4, 'Vanish and reappear on a free space within 6.', ['ganonLegend', 'ganonLegendBoss'], { target: 'tile', range: [1, 6], move: true }, { cooldown: 2 }),
  p('earthquakeGanon', 'Earthquake', 8, 'Slam the trident down: enemies within 2 take STR/2 + 8 and may be Stunned.', ['ganonLegend', 'ganonLegendBoss'],
    { target: 'foes', radius: 2, dmg: { stat: 'str', base: 8, vs: 'def', hits: 2 }, status: { kind: 'stun', turns: 1, chance: 30 } }, { cooldown: 3 }),
  q('darknessShroud', 'Darkness Shroud', 6, 'Put out the lights: enemies within 3 are Blinded for 2 turns and you are Veiled. Below half HP it reaches 5.', ['ganonLegend', 'ganonLegendBoss'], { cooldown: 3 }),
  p('demonicRestoration', 'Demonic Restoration', 10, 'Recover 25% of your max HP.', ['ganonLegend', 'ganonLegendBoss'], { target: 'allies', radius: 0, heal: { pct: 0.25 } }, { cooldown: 4 }),
  // ── Supporting cast ──
  p('telepathicCounsel', 'Telepathic Counsel', 4, 'Sahasrahla\'s voice reaches an ally within 8: +3 SKL and RES for 2 turns.', ['sahasrahla'],
    { target: 'ally', range: [1, 8], buff: { id: 'counsel', name: 'Telepathic Counsel', turns: 2, stats: { skl: 3, res: 3 } } }),
  q('brewPotion', 'Brew Potion', 0, 'Brew from ingredients in your pack or an adjacent ally\'s: a Mushroom becomes a Red Potion, a Sleepy Toadstool Magic Powder, a Bee or jelly a Blue Potion. With no ingredients, 10 MP makes a Red Potion (once per battle).', ['syrup'],
    { icon: '⚗' }),
  ab({ id: 'forestSong', name: 'Forest Melody', kind: 'song', mp: 4, desc: 'Allies within 3 recover 6 HP and 8 stamina.', grantedBy: { templates: ['fluteBoy'] }, radius: 3,
    wild: { target: 'allies', radius: 3, heal: { base: 6 } } }),
  p('energyBallVolley', 'Energy Ball Volley', 6, 'Three energy balls at an enemy 2–5 away (MAG + 4 each at reduced power).', ['agahnim', 'agahnimBoss'],
    { target: 'foe', range: [2, 5], dmg: { stat: 'mag', base: 4, vs: 'res', hits: 3 } }, { cooldown: 2 }),
  p('lightningSpread', 'Lightning Spread', 8, 'Lightning fans out over a space within 4 and the spaces around it (MAG + 6, may Shock).', ['agahnim', 'agahnimBoss'],
    { target: 'tile', range: [1, 4], radius: 1, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'lightning' }, status: { kind: 'shock', turns: 1, chance: 30 } }, { cooldown: 2 }),
  p('illusoryTeleport', 'Illusory Teleport', 3, 'Blink to a free space within 5.', ['agahnim', 'agahnimBoss'], { target: 'tile', range: [1, 5], move: true }, { cooldown: 2 }),
  q('sendToDarkWorld', 'Banish to the Dark World', 10, 'An enemy within 3 is cast into the Dark World\'s shape for 2 turns: without a Moon Pearl it becomes a rabbit (can\'t attack, −4 DEF and RES).', ['agahnim', 'agahnimBoss'], { cooldown: 3 }),
  q('balladOfTheWindFish', 'Ballad of the Wind Fish', 6, 'Allies within 3 recover MAG/2 + 6 HP and wake up; nightmare enemies within 3 are Weakened for 2 turns.', ['marin'], { cooldown: 2 }),
  q('carryAlly', 'Flight Assistance', 0, 'Lift an adjacent size-1 ally and set it down on a free space within 4, over walls and water.', ['flyingRooster'], { icon: '🐓' }),
  p('awakeningSong', 'Song of Awakening', 12, 'Allies within 5 recover 15% HP and are cleansed of every harmful status.', ['windFish'], { target: 'allies', radius: 5, heal: { pct: 0.15 }, cleanse: true }, { cooldown: 3 }),
  q('changeSeasonDin', 'Seasonal Harmony', 6, 'Dance the season forward (spring → summer → autumn → winter), anywhere, without the Rod. Both armies feel it.', ['din'], { cooldown: 2, icon: '🍂' }),
  p('dinsDance', "Din's Dance", 5, 'You and allies within 2 gain +3 STR and +2 SPD for 2 turns.', ['din'],
    { target: 'allies', radius: 2, buff: { id: 'dinsDance', name: "Din's Dance", turns: 2, stats: { str: 3, spd: 2 } } }, { cooldown: 2 }),
  q('actionReset', 'Temporal Harmony', 6, 'Turn back an ally\'s moment: an ally within 3 who has already acted this turn can act again.', ['nayru'], { cooldown: 4, icon: '⌛' }),
  q('songOfAges', 'Song of Ages', 6, 'Allies within 3 have their cooldowns cut by a turn and recover 5 MP.', ['nayru'], { cooldown: 2 }),
  q('revealSecrets', 'Keeper of Secrets', 2, 'Everything hidden within 8 is revealed: enemies, traps, buried treasure and Invisible Floors.', ['farore'], { freeAction: true, perTurn: true }),
  p('faroresCounsel', "Farore's Counsel", 3, 'An ally within 4 gains +3 SKL and +6 LCK for 2 turns.', ['farore'],
    { target: 'ally', range: [0, 4], buff: { id: 'faroreCounsel', name: "Farore's Counsel", turns: 2, stats: { skl: 3, lck: 6 } } }),
  p('heroicCharge', 'Heroic Charge', 0, 'Rush an adjacent enemy: STR + weapon + 5. Ralph never waits for the plan.', ['ralph'],
    { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 5, vs: 'def', weapon: true } }, { sta: 6, cooldown: 2 }),
  p('raiseBarricade', 'Royal Construction', 4, 'Order a barricade raised on a space within 2 (a wall for 3 turns).', ['queenAmbi'],
    { target: 'tile', range: [1, 2], terrain: 'wall', terrainTurns: 3 }, { cooldown: 2 }),
  // ── Forms ──
  p('timeWarpCurse', 'Time Warp Curse', 8, 'Twist an enemy\'s time (within 4): MAG + 6, and it is Weakened for 2 turns.', ['nayruPossessed'],
    { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 6, vs: 'res', element: 'dark' }, status: { kind: 'weaken', turns: 2 } }, { cooldown: 2 }),
  p('aerialBombardment', 'Aerial Bombardment', 8, 'Rain fire on a space 2–5 away and around it (STR + 8 fire).', ['onoxDragon'],
    { target: 'tile', range: [2, 5], radius: 1, dmg: { stat: 'str', base: 8, vs: 'def', element: 'fire' } }, { cooldown: 2 }),
  p('fairyIllusion', 'Illusion', 4, 'Flicker into illusions: +6 SPD and +10 LCK for 2 turns.', ['veranFairy'],
    { target: 'self', buff: { id: 'fairyIllusion', name: 'Illusion', turns: 2, stats: { spd: 6, lck: 10 } } }),
  p('groundPound', 'Ground Pound', 0, 'Slam down: adjacent enemies take STR + 6 and may be Stunned.', ['veranTurtle', 'moosh'],
    { target: 'foes', radius: 1, dmg: { stat: 'str', base: 6, vs: 'def' }, status: { kind: 'stun', turns: 1, chance: 30 } }, { sta: 8, cooldown: 2 }),
  p('webShot', 'Web Shot', 4, 'Web an enemy within 3: Rooted for 2 turns.', ['veranSpider'], { target: 'foe', range: [1, 3], status: { kind: 'root', turns: 2 } }, { cooldown: 2 }),
  q('summonBees', 'Summon Bees', 8, 'Two temporary Bees join the fight.', ['veranBee'], { cooldown: 3 }),
  q('veranMetamorphosis', 'Metamorphosis', 6, 'Become the next of Veran\'s monster forms (fairy → turtle → spider → bee → back to herself) until the battle ends.', ['veran', 'veranFairy', 'veranTurtle', 'veranSpider', 'veranBee'],
    { cooldown: 2 }),
  q('veranPossession', 'Possession', 12, 'Slip inside an enemy within 3 (not a boss): it fights for your side for 2 turns (3 with Veran\'s Shadow Garb).', ['veran'], { cooldown: 4 }),
  q('onoxTransform', 'Dark Dragon', 0, 'Below half HP: become Dark Dragon Onox until the battle ends.', ['onox'], { oncePerBattle: true }),
  p('flailSweep', 'Flail Sweep', 0, 'Swing the flail around: adjacent enemies take STR + weapon, ignoring 30% DEF.', ['onox'],
    { target: 'foes', radius: 1, dmg: { stat: 'str', base: 2, vs: 'def', weapon: true, pierce: 0.3 } }, { sta: 8, cooldown: 2 }),
  // ── Monsters and bosses (when recruited) ──
  q('powderMutation', 'Powder Mutation', 4, 'Confuse every enemy within 2 for a turn — or shift between Buzz Blob and Cukeman.', ['cukeman', 'buzzBlob'], { cooldown: 3 }),
  q('burrow', 'Burrow', 0, 'Dig underground: hidden (untargetable) until you next attack; a Shovel or Secret Discovery exposes you.', ['subterror'], { cooldown: 2, freeAction: true }),
  p('wizzrobeBlast', 'Wizzrobe Blast', 4, 'A burst of magic at an enemy within 4 (MAG + 4).', ['wizzrobe', 'bossWizzrobe', 'meteoWizzrobe', 'thunderWizzrobe', 'blizzrobe'],
    { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 4, vs: 'res' } }),
  p('meteorShower', 'Meteor Shower', 10, 'Meteors on a space within 5 and around it (MAG + 6 fire, may Burn).', ['meteoWizzrobe', 'bossWizzrobe'],
    { target: 'tile', range: [1, 5], radius: 1, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 40 } }, { cooldown: 3 }),
  p('thunderCall', 'Thunder Call', 10, 'Lightning on every enemy within 2 (MAG + 4, may Shock).', ['thunderWizzrobe', 'bossWizzrobe'],
    { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'lightning' }, status: { kind: 'shock', turns: 1, chance: 40 } }, { cooldown: 3 }),
  p('blizzardCall', 'Blizzard', 10, 'A blizzard on a space within 4 and around it (MAG + 5 ice, may Freeze).', ['blizzrobe', 'bossWizzrobe'],
    { target: 'tile', range: [1, 4], radius: 1, dmg: { stat: 'mag', base: 5, vs: 'res', element: 'ice' }, status: { kind: 'freeze', turns: 1, chance: 35 } }, { cooldown: 3 }),
  p('kholdstareHail', 'Hailstorm', 8, 'Ice falls on a space within 4 and around it (MAG + 6 ice).', ['kholdstare'],
    { target: 'tile', range: [1, 4], radius: 1, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'ice' }, status: { kind: 'freeze', turns: 1, chance: 25 } }, { cooldown: 2 }),
  p('vitreousStorm', 'Lightning Storm', 10, 'Lightning across the field: every enemy within 4 takes MAG/2 + 4.', ['vitreous'],
    { target: 'foes', radius: 4, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'lightning', hits: 2 } }, { cooldown: 3 }),
  p('genieFlames', 'Bottle Flames', 6, 'Flames on an enemy within 3 and those next to it (MAG + 3 fire).', ['genie'],
    { target: 'foe', range: [1, 3], radius: 1, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'fire' } }, { cooldown: 2 }),
  p('galeWings', 'Gale Wings', 6, 'A gust from your wings: enemies within 2 take STR/2 + 4 and are pushed back 2 spaces.', ['evilEagle'],
    { target: 'foes', radius: 2, dmg: { stat: 'str', base: 4, vs: 'def', hits: 2 }, push: 2 }, { cooldown: 2 }),
  p('lavaBurst', 'Lava Burst', 8, 'Erupt on a space within 4 and around it (MAG + 6 fire, may Burn).', ['hotHead'],
    { target: 'tile', range: [1, 4], radius: 1, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 50 } }, { cooldown: 2 }),
  p('petrifyingStare', 'Petrifying Stare', 8, 'Stare at an enemy within 3: Petrified for a turn.', ['medusaHead'], { target: 'foe', range: [1, 3], status: { kind: 'petrified', turns: 1, chance: 60 } }, { cooldown: 3 }),
  p('smogStorm', 'Storm Cloud', 8, 'Lightning from the cloud on enemies within 2 (MAG + 3, may Shock).', ['smog'],
    { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'lightning' }, status: { kind: 'shock', turns: 1, chance: 30 } }, { cooldown: 2 }),
  p('inkCloud', 'Ink Cloud', 6, 'Ink on an enemy within 3 and those next to it: Blinded for 2 turns.', ['octogon'], { target: 'foe', range: [1, 3], radius: 1, status: { kind: 'blind', turns: 2 } }, { cooldown: 2 }),
  p('shadowCurse', 'Shadow Curse', 6, 'A curse on an enemy within 4 (MAG + 4 dark, may Curse).', ['shadowHag'],
    { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 4, vs: 'res', element: 'dark' }, status: { kind: 'curse', turns: 2, chance: 40 } }, { cooldown: 2 }),
  p('eyeVolley', 'Eye Volley', 6, 'The orbiting eyes fire at every enemy within 3 (MAG/2 + 4).', ['eyesoar', 'vitreous'],
    { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 4, vs: 'res', hits: 2 } }, { cooldown: 2 }),
  p('nightmareShift', 'Nightmare Shift', 0, 'Below half HP: the shadows recede and the Nightmare recovers 20% HP.', ['shadowNightmare'], { target: 'allies', radius: 0, heal: { pct: 0.2 }, belowHp: 0.5 }, { oncePerBattle: true }),

  // ── Equipment ──
  tool('bombos', 'Bombos', 20, 'A firestorm over the whole field: every enemy takes MAG + 2 fire damage and may Burn.', { gear: ['bombosMedallion'] },
    { wild: { target: 'foes', radius: 40, dmg: { stat: 'mag', base: 2, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 40 } }, oncePerBattle: true, icon: '🔥' }),
  tool('ether', 'Ether', 20, 'A freezing storm: every enemy is struck by ice (MAG vs RES) and most are Frozen; Invisible Floors and hidden foes are revealed.', { gear: ['etherMedallion'] },
    { oncePerBattle: true, icon: '❄' }),
  tool('quake', 'Quake', 20, 'The earth splits: every grounded enemy takes STR + 4; ordinary monsters weaker than you are Stunned for 2 turns.', { gear: ['quakeMedallion'] },
    { oncePerBattle: true, icon: '🌋' }),
  tool('magicCapeCloak', 'Magic Cape', 4, 'Vanish (toggle): invisible and intangible — untargetable, can\'t attack — for 4 MP a turn. Use again to reappear.', { gear: ['magicCape'] }, { freeAction: true, perTurn: true, icon: '🧥' }),
  tool('somariaBlockAbility', 'Somaria Block', 4, 'Conjure a Somaria Block on a free space within 2 — or burst an adjacent block into four projectiles (MAG + 6 to everything next to it).', { weapons: ['caneOfSomaria'] }, { icon: '🟨' }),
  tool('byrnaBarrier', 'Byrna Barrier', 6, 'A spinning barrier: damage taken −75% and adjacent enemies take 4 a turn, draining 3 MP a turn until it fails.', { weapons: ['caneOfByrna'] }, { cooldown: 2, icon: '🌀' }),
  tool('rocsJump', "Roc's Jump", 0, 'Jump to a free space 2 away over an obstacle, pit or unit (up to 3 away with Roc\'s Cape). Doesn\'t end your turn.', { gear: ['rocsFeather', 'rocsCape'], weapons: ['koholintSword'] },
    { freeAction: true, perTurn: true, icon: '🪶' }),
  tool('magneticPull', 'Magnetic Pull', 0, 'Attract or repel metal: pull an armored, metal or construct enemy within 4 two spaces toward you (or push a Magnetic Orb along).', { gear: ['magneticGloves'] }, { cooldown: 1, icon: '🧲' }),
  tool('switchPlaces', 'Switch Places', 0, 'Swap places with a unit (not a boss larger than you) or a Switch Hook Target within 4 (7 with the Long Hook).', { weapons: ['switchHook', 'longHook'] }, { cooldown: 1, icon: '🔁' }),
  tool('changeSeason', 'Change Season', 0, 'From a Tree Stump (on or next to it): wave the Rod and choose the next season. Both armies feel it.', { weapons: ['rodOfSeasons'] }, { icon: '🍁' }),
  ab({ id: 'tuneOfEchoes', name: 'Tune of Echoes', kind: 'song', mp: 3, desc: 'Awaken a Time Portal next to you: the whole field passes between past and present.', grantedBy: { weapons: ['harpOfAges'] }, icon: '🎼' }),
  ab({ id: 'tuneOfCurrents', name: 'Tune of Currents', kind: 'song', mp: 5, desc: 'From the past, return to the present at once (where the present allows).', grantedBy: { weapons: ['harpOfAges'] }, icon: '🎼' }),
  ab({ id: 'tuneOfAges', name: 'Tune of Ages', kind: 'song', mp: 8, desc: 'Move between past and present anywhere (where the other era allows).', grantedBy: { weapons: ['harpOfAges'] }, icon: '🎼' }),
  tool('octoForm', 'Octo Ring: Octorok', 0, 'Become an Octorok for 3 turns: spit rocks from range 1–3 (+2 range), −4 STR.', { gear: ['octoRing'] }, { oncePerBattle: true, freeAction: true, icon: '🐙' }),
  tool('moblinForm', 'Moblin Ring: Moblin', 0, 'Become a Moblin for 3 turns: +4 STR and +2 DEF; monsters hesitate (−10 Hit) against you.', { gear: ['moblinRing'] }, { oncePerBattle: true, freeAction: true, icon: '👹' }),
  tool('magicMirrorWarp', 'Magic Mirror', 0, 'In the Dark World: warp back to the Light World — the whole field returns to its Light World shape.', { gear: ['magicMirror'] }, { icon: '🪞' }),
  // The Ocarina's three Koholint songs (events teach them; they need an instrument, like every song).
  ab({ id: 'balladSong', name: 'Ballad of the Wind Fish (Ocarina)', kind: 'song', mp: 5, desc: 'Allies within 3 recover 8 HP and wake up.', radius: 3,
    wild: { target: 'allies', radius: 3, heal: { base: 8 } } }),
  ab({ id: 'manbosMambo', name: "Manbo's Mambo", kind: 'song', mp: 6, desc: 'Retreat: warp to the deployment zone (a discovered warp point).', warp: 'light', cooldown: 3 }),
  ab({ id: 'frogsSongOfSoul', name: "Frog's Song of Soul", kind: 'song', mp: 8, desc: 'Awaken dormant creatures: allies within 3 lose Sleep, Stun and Petrification; an ally at 1 HP is revived to 30%.', radius: 3 }),

  // ── Mystical seed ammunition ──
  seedShot('emberShot', 'Ember Seed', 'Fire seed: +2 Might, fire (may Burn). Uses an Ember Seed.', { element: 'fire', might: 2 }),
  seedShot('scentShot', 'Scent Seed', 'Scent seed: double Might against beasts. Uses a Scent Seed.', { effective: ['beast'] }),
  seedShot('pegasusShot', 'Pegasus Seed', 'Pegasus seed: a hit immobilizes the target (Rooted for a turn). Uses a Pegasus Seed.', { hit: 10 }),
  seedShot('galeShot', 'Gale Seed', 'Gale seed: wind damage that pushes the target 2 spaces. Uses a Gale Seed.', { might: 1 }),
  seedShot('mysteryShot', 'Mystery Seed', 'Mystery seed: a random element — and it reveals a possessed foe\'s true shape. Uses a Mystery Seed.', {}),

  // ── Battlefield spaces ──
  act('hitCrystalSwitch', 'Strike the Switch', '💠', 'Strike an adjacent Crystal Switch: every Crystal Barrier on the field rises or falls.'),
  act('poundStake', 'Pound the Stake', '🔨', 'Pound an adjacent Wooden Stake into the ground (Magic Hammer, or lift it with a Power Glove / Titan\'s Mitt / Power Bracelet).'),
  act('harvestSeeds', 'Harvest Seeds', '🌰', 'Shake an adjacent Mystical Seed Tree: +8 of its seeds for the satchel (and a Gale Seed tree becomes a warp point).'),
  act('stoneBeakHint', 'Ask the Owl', '🦉', 'With a Stone Beak, an adjacent Owl Statue gives a hint: hidden things within 5 are revealed, and allies within 2 gain +10 Hit this turn.'),
  act('enterPortal', 'Enter the Portal', '🌀', 'Step through the portal you stand on: the field passes into the Dark World (or back to the Light World).'),
  act('enterTimePortal', 'Enter the Time Portal', '⏳', 'Step through the Time Portal you stand on (once it has been awakened): the field passes between past and present.'),
];
