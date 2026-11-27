import type { AbilityDef, WildAbilitySpec } from '../../engine/types';

type X = Partial<AbilityDef>;
const ab = (d: Omit<AbilityDef, 'implemented'>): AbilityDef => ({ implemented: true, ...d });
/** A personal ability with a data-driven effect (engine/wild.ts castWild, which any pack can use). */
const p = (id: string, name: string, mp: number, desc: string, templates: string[], wild: WildAbilitySpec, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, wild, grantedBy: { templates }, ...extra });
/** A personal ability with a special effect (engine/spirit.ts castSpirit). */
const q = (id: string, name: string, mp: number, desc: string, templates: string[], extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: { templates }, ...extra });
/** A Spirit Flute song (the Flute, and the Lokomo who play with it). */
const song = (id: string, name: string, mp: number, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, kind: 'song', mp, desc, grantedBy: { weapons: ['spiritFlute'] }, ...extra });
/** A battlefield action anyone can take where it applies (shown as its own button). */
const act = (id: string, name: string, icon: string, desc: string, extra: X = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, desc, ...extra });

const LOKOMO = ['forestMelodyST', 'snowMelody', 'oceanMelody', 'fireMelody', 'sandMelody'];
const CHU = (...ids: string[]) => ids.map((x) => `chuchu${x}`);

export const ABILITIES: AbilityDef[] = [
  // ── Railway and battlefield actions ──
  act('throwSwitch', 'Throw the Switch', '🔀', 'From next to a Railway Switch: the junctions change over (open lines close, closed lines open) and the floor spikes retract or spring up.'),
  act('repairTrack', 'Repair the Track', '🔧', 'From next to Broken Track: mend the whole broken stretch. Engineers (Link, Alfonzo, Engineer\'s Clothes or Certificate) do it without using their action.'),
  act('whipSwing', 'Whip Swing', '🪢', 'With a Whip, from next to a Whip Post: swing to a free space up to 3 beyond it, over pits, water and spikes.'),
  // ── Spirit Flute songs (section 8) ──
  song('songOfAwakening', 'Song of Awakening', 8, 'Wakes a dormant stone guardian, which fights beside you for the rest of the battle. Once per battle.', { oncePerBattle: true }),
  song('stSongOfHealing', 'Song of Healing', 10, 'Allies within 3 recover 30% of their HP. Once per battle.', { oncePerBattle: true, grantedBy: { weapons: ['spiritFlute'], skills: LOKOMO } }),
  song('songOfDiscovery', 'Song of Discovery', 4, 'Reveals hidden enemies, traps and buried treasure within 6. Doesn\'t use your action.', { freeAction: true, perTurn: true }),
  song('songOfBirds', 'Song of Birds', 6, 'A flock of birds carries you to a free space up to 5 away.', { cooldown: 2 }),
  song('songOfLight', 'Song of Light', 6, 'Lights every Light Statue within 5: enemies within 2 of a lit statue are exposed for 2 turns (Phantoms lose their armor), and the fog lifts.', { cooldown: 3 }),
  song('lokomoDuet', 'Lokomo Duet', 8, 'With another musician (a Lokomo or a Spirit Flute) within 2: the realm\'s duet restores every Broken Track within 5, and allies within 2 gain +2 STR, MAG, DEF and RES for 2 turns.',
    { cooldown: 3, grantedBy: { weapons: ['spiritFlute'], skills: LOKOMO } }),
  song('songOfRestoration', 'Song of Restoration', 12, 'A musician with Zelda (any form) and a Lokomo within 3: demonic enemies within 6 are weakened for 3 turns (−5 STR, MAG, DEF and RES) and the Demon King is exposed. Once per battle.',
    { oncePerBattle: true, grantedBy: { weapons: ['spiritFlute'], skills: LOKOMO } }),
  // ── Equipment ──
  q('sandPillarAct', 'Sand Pillar', 3, 'Raise a Sand Pillar (an obstacle, 3 turns) on a free space within 3.', [], { grantedBy: { weapons: ['sandWand'] }, icon: '🏛' }),
  q('sandBridgeAct', 'Sand Bridge', 3, 'Turn water, a pit, lava or quicksand within 3 (and the spaces next to it in line) into a Sand Bridge for 3 turns.', [], { grantedBy: { weapons: ['sandWand'] }, icon: '🌉' }),
  q('blinCapture', 'Capture', 0, 'Trap an adjacent size-1 enemy below 25% HP in the basket: it is taken off the field for 3 turns (and falls out next to you when the time is up).', ['bigBlinBoss'],
    { sta: 10, cooldown: 3, grantedBy: { gear: ['captureBasket'], templates: ['bigBlinBoss'] }, icon: '🧺' }),
  q('ironGrab', 'Iron Grab', 0, 'The gauntlet shoots out: an enemy within 2–3 is pulled next to you and takes STR + 4.', ['byrne', 'byrneBoss'], { sta: 6, cooldown: 2, grantedBy: { gear: ['byrnesGauntlet'], templates: ['byrne', 'byrneBoss'] }, icon: '🦾' }),
  q('gauntletThrow', 'Gauntlet Throw', 0, 'Grab an adjacent enemy (not a boss, size 2 or less) and hurl it 3 spaces away: STR + 6, and it lands Stunned if it hits something.', ['byrne', 'byrneBoss'],
    { sta: 8, cooldown: 2, grantedBy: { gear: ['byrnesGauntlet'], templates: ['byrne', 'byrneBoss'] } }),
  q('wreckingRoll', 'Wrecking Roll', 0, 'Curl into a rolling armored ball and roll up to 4 spaces in a straight line: obstacles in the way are crushed, and the first enemy takes STR + 8 and is knocked back.', ['wreckerPhantom', 'phantomZeldaWrecker'],
    { sta: 8, cooldown: 2, grantedBy: { gear: ['wreckerPhantomArmor'], templates: ['wreckerPhantom', 'phantomZeldaWrecker'] }, icon: '⚙' }),
  // ── Zelda ──
  q('spiritForm', 'Spirit Form', 4, 'Leave your body: become Spirit Zelda (pass through walls, half damage from ordinary physical attacks, possess Phantoms).', ['zeldaST'], { icon: '👻' }),
  q('possessPhantom', 'Possess', 6, 'Possess an adjacent Phantom that is exposed (a sacred weapon, Sacred Opening, Song of Light) or stunned: it is taken over, and you become Phantom Zelda in its armor (Torch, Warp, Wrecker or standard).', ['spiritZelda'], { icon: '🛡' }),
  q('returnToBody', 'Return to Body', 0, 'Leave the armor (or come back to your body): back to Princess Zelda.', ['spiritZelda', 'phantomZelda', 'phantomZeldaTorch', 'phantomZeldaWarp', 'phantomZeldaWrecker'], { icon: '👑' }),
  p('royalLightST', 'Royal Light', 6, 'Sacred light at an enemy within 3: MAG + 5.', ['zeldaST', 'spiritZelda'], { target: 'foe', range: [1, 3], dmg: { stat: 'mag', base: 5, vs: 'res', element: 'light', sacred: true }, tags: ['sacred'] }, { cooldown: 2 }),
  p('torchFlameST', 'Torch Flame', 4, 'The Torch Phantom\'s flame: enemies next to you take STR/2 + 6 fire damage and may Burn; hidden enemies within 4 are revealed.', ['phantomZeldaTorch', 'torchPhantom'],
    { target: 'foes', radius: 1, dmg: { stat: 'str', base: 6, vs: 'res', element: 'fire', hits: 1 }, status: { kind: 'burn', turns: 2, chance: 40 }, reveal: 4 }, { cooldown: 2 }),
  q('eyeWarpST', 'Phantom Eye Warp', 4, 'Warp next to an enemy within 8 (a Warp Phantom goes wherever a Phantom Eye looks).', ['phantomZeldaWarp'], { cooldown: 2, icon: '🌀' }),
  // ── Named characters ──
  q('masterRepair', 'Master Repair', 0, 'An adjacent ally: a train or machine recovers 30% HP and a knocked-out part; anyone else has their weapon repaired as good as new.', ['alfonzo'], { sta: 4, cooldown: 2, icon: '🔧' }),
  p('storyOfTheWinds', 'Tale of the Winds', 6, 'Old Niko tells a story of the Hero of Winds: allies within 2 are Inspired for 2 turns.', ['elderNiko'], { target: 'allies', radius: 2, status: { kind: 'inspired', turns: 2 } }, { cooldown: 3 }),
  p('darkMagicBarrage', 'Dark Barrage', 8, 'Demonic projectiles at an enemy within 4 and those beside it: MAG + 4 dark.', ['cole', 'coleBoss'], { target: 'foe', range: [1, 4], radius: 1, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'dark' } }, { cooldown: 2 }),
  p('colesWarp', 'Vanishing Act', 4, 'Cole bows and vanishes, reappearing on a free space within 6.', ['cole', 'coleBoss'], { target: 'tile', range: [1, 6], move: true }, { cooldown: 2 }),
  q('demonicSummon', 'Demonic Summons', 10, 'A Phantom Eye and a Keese answer the chancellor\'s call.', ['cole', 'coleBoss'], { cooldown: 4 }),
  p('sacredBarrierST', 'Sacred Barrier', 10, 'You and allies within 2 gain +5 DEF and RES for 2 turns and can\'t be cursed or possessed.', ['anjean'], { target: 'allies', radius: 2, buff: { id: 'sacredBarrierST', name: 'Sacred Barrier', turns: 2, stats: { def: 5, res: 5 } }, tags: ['sacred'] }, { cooldown: 3 }),
  p('sealDarknessST', 'Seal Darkness', 8, 'A sacred seal on an enemy within 4: MAG + 8 (double against demons and the undead).', ['anjean'], { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 8, vs: 'res', element: 'light', sacred: true }, tags: ['sacred'] }, { cooldown: 2 }),
  p('trainPictograph', 'Snapshot', 0, 'Ferrus snaps a picture: hidden enemies within 8 are revealed. Doesn\'t use your action.', ['ferrus'], { target: 'allies', radius: 0, reveal: 8 }, { freeAction: true, perTurn: true, icon: '📷' }),
  q('merchantsAppraisal', 'Appraisal', 0, 'Linebeck III sniffs out treasure: hidden enemies within 6 are revealed and a buried treasure is marked nearby. Once per battle; doesn\'t use your action.', ['linebeck3'], { freeAction: true, oncePerBattle: true, icon: '💰' }),
  p('swordLesson', 'Sword Lesson', 4, 'An adjacent ally: +3 SKL and +10 Critical for 2 turns.', ['teacher'], { target: 'ally', range: [1, 1], buff: { id: 'swordLesson', name: 'Sword Lesson', turns: 2, stats: { skl: 3 } } }, { cooldown: 2 }),
  p('disciplinedStrike', 'Disciplined Strike', 0, 'A textbook blow: STR + weapon + 5 on an adjacent enemy, ignoring 20% DEF.', ['teacher'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 5, vs: 'def', weapon: true, pierce: 0.2 } }, { sta: 6, cooldown: 2 }),
  // ── Lokomo melodies ──
  p('forestMelodyAct', 'Forest Melody', 8, 'Allies within 2 recover MAG + 6 HP.', ['gage'], { target: 'allies', radius: 2, heal: { base: 6, stat: 'mag' }, tags: ['sacred'] }, { cooldown: 2 }),
  p('snowMelodyAct', 'Snow Melody', 8, 'A blizzard: enemies within 2 take MAG + 3 ice damage and may Freeze.', ['steem'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'ice' }, status: { kind: 'freeze', turns: 1, chance: 30 } }, { cooldown: 2 }),
  p('oceanMelodyAct', 'Ocean Melody', 8, 'A wave at an enemy within 3 and those beside it: MAG + 4 water damage, pushed back 1.', ['carben'], { target: 'foe', range: [1, 3], radius: 1, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'water' }, push: 1, tags: ['water'] }, { cooldown: 2 }),
  p('fireMelodyAct', 'Fire Melody', 8, 'The drums boom: enemies within 2 take MAG + 3 fire damage and may Burn.', ['embrose'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 3, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 35 }, tags: ['fire'] }, { cooldown: 2 }),
  p('sandMelodyAct', 'Sand Melody', 8, 'The sand rises: enemies within 2 take MAG + 2 and are Rooted.', ['rael'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res' }, status: { kind: 'root', turns: 1, chance: 60 } }, { cooldown: 2 }),
  // ── Big Blin ──
  p('heavyClub', 'Heavy Club', 0, '150% physical damage on an adjacent enemy (STR + weapon, ×1.5), knocked back 2.', ['bigBlin', 'bigBlinBoss'], { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 6, vs: 'def', weapon: true }, push: 2 }, { sta: 5, cooldown: 2 }),
  q('sweepingSmash', 'Sweeping Smash', 0, 'A wild swing at everything in front of you — allies included: STR + weapon − 2 to every adjacent unit.', ['bigBlin'], { sta: 8, cooldown: 2 }),
  q('pirateRally', 'Pirate Rally', 0, 'Miniblins and Bulblins within 3 get +3 STR and +3 SPD for 3 turns.', ['bigBlin', 'bigBlinBoss'], { sta: 6, cooldown: 4, icon: '📣' }),
  p('boardingAssault', 'Boarding Assault', 0, 'Only in ship and train battles: +50% damage for this turn.', ['bigBlin'], { target: 'self', buff: { id: 'boardingAssault', name: 'Boarding Assault', turns: 1 } }, { sta: 6, cooldown: 3, freeAction: true, icon: '🏴' }),
  // ── Monsters ──
  p('chiefFireBreath', 'Fire Breath', 6, 'A gout of fire at an enemy within 2 and those beside it: MAG + 5, may Burn.', ['geozardChief'], { target: 'foe', range: [1, 2], radius: 1, dmg: { stat: 'mag', base: 5, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 30 } }, { cooldown: 2 }),
  q('sandAmbushAct', 'Burrow', 0, 'Dive under the sand (hidden) and surface on a free space within 5; the next attack deals +50%.', ['sandworm'], { sta: 6, cooldown: 3, icon: '🪱' }),
  q('keyTheft', 'Key Theft', 0, 'Snatch an item from an adjacent enemy\'s pack and run up to 4 spaces away.', ['keyMaster'], { sta: 5, cooldown: 2, icon: '🗝' }),
  // ── Bosses ──
  p('poisonCloud', 'Poison Cloud', 6, 'Enemies within 2 take MAG + 2 and may be Poisoned.', ['stagnox'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 2, vs: 'res' }, status: { kind: 'poison', turns: 3, chance: 50 } }, { cooldown: 3 }),
  p('stagnoxCharge', 'Armored Charge', 0, 'Charge an enemy within 3: STR + 5, knocked back 1.', ['stagnox'], { target: 'foe', range: [1, 3], dmg: { stat: 'str', base: 5, vs: 'def' }, push: 1, move: true }, { sta: 8, cooldown: 2 }),
  q('iceFireBreath', 'Ice and Fire', 8, 'Breath of the current form at an enemy within 3 and those beside it: MAG + 4 fire or ice.', ['fraaz'], { cooldown: 2 }),
  q('fraazSplit', 'Split', 10, 'Below half HP: split into two bodies (a smaller one of the other element). Once per battle.', ['fraaz'], { oncePerBattle: true }),
  p('thornTentacles', 'Thorn Tentacles', 0, 'Enemies within 2 take STR/2 + 4 twice and may be Poisoned.', ['phytops'], { target: 'foes', radius: 2, dmg: { stat: 'str', base: 4, vs: 'def', hits: 2 }, status: { kind: 'poison', turns: 2, chance: 30 } }, { sta: 10, cooldown: 3 }),
  p('thornWall', 'Thorn Field', 6, 'Floor spikes of thorn sprout around a space within 4 (3 turns).', ['phytops'], { target: 'tile', range: [1, 4], radius: 1, terrain: 'floorSpikes', terrainTurns: 3 }, { cooldown: 3 }),
  p('giantFist', 'Giant Fist', 0, 'A colossal punch at an enemy within 2: STR + 8.', ['cragma'], { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 8, vs: 'def' } }, { sta: 8, cooldown: 2 }),
  p('lavaEruption', 'Lava Eruption', 12, 'Enemies within 3 take MAG + 4 fire damage and may Burn.', ['cragma'], { target: 'foes', radius: 3, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'fire' }, status: { kind: 'burn', turns: 2, chance: 35 } }, { cooldown: 3 }),
  q('boulderHurl', 'Boulder Hurl', 0, 'Hurl a boulder at an enemy within 2–5: STR + 6. A Whirlwind (in the target\'s pack) or a shield-bearer\'s parry turns it back into Skeldritch\'s armor.', ['skeldritch'], { sta: 8, cooldown: 2 }),
  p('skeldritchQuake', 'Ancient Quake', 0, 'Enemies within 2 take STR/2 + 3 twice and may be Stunned.', ['skeldritch'], { target: 'foes', radius: 2, dmg: { stat: 'str', base: 3, vs: 'def', hits: 2 }, status: { kind: 'stun', turns: 1, chance: 20 } }, { sta: 10, cooldown: 3 }),
  p('demonKingsWrath', "Demon King's Wrath", 14, 'Enemies within 2 take MAG + 6 dark damage and may be Feared.', ['malladus'], { target: 'foes', radius: 2, dmg: { stat: 'mag', base: 6, vs: 'res', element: 'dark' }, status: { kind: 'fear', turns: 2, chance: 30 } }, { cooldown: 3 }),
  p('malladusBeam', 'Demon Beam', 8, 'A beam of darkness at an enemy within 4: MAG + 6.', ['malladus'], { target: 'foe', range: [1, 4], dmg: { stat: 'mag', base: 6, vs: 'res', element: 'dark' } }, { cooldown: 2 }),
  p('stolenLightBlast', 'Corrupted Light', 8, 'Zelda\'s light turned dark, at an enemy within 4 and those beside it: MAG + 4.', ['malladusZelda'], { target: 'foe', range: [1, 4], radius: 1, dmg: { stat: 'mag', base: 4, vs: 'res', element: 'dark' } }, { cooldown: 2 }),
  p('demonTrainBarrage', 'Barrage', 10, 'Every car fires: enemies within 4 take MAG/2 + 3 twice.', ['demonTrain'], { target: 'foes', radius: 4, dmg: { stat: 'mag', base: 3, vs: 'def', hits: 2, element: 'dark' } }, { cooldown: 3 }),
  // ── The new ChuChus ──
  p('chuBodySlam', 'Body Slam', 0, 'Leap at an adjacent enemy: STR + weapon + 3.', CHU('Standard', 'Helmet'), { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 3, vs: 'def', weapon: true } }, { sta: 3, cooldown: 1 }),
  p('waterBurst', 'Water Burst', 0, 'A splash of water: everyone around you is soaked (enemies take 3 water damage; Burning is put out on allies).', CHU('Standard'), { target: 'foes', radius: 1, dmg: { stat: 'mag', base: 1, vs: 'res', element: 'water' } }, { sta: 5, cooldown: 2 }),
  p('gelRecovery', 'Gel Recovery', 0, 'Recover 20% of your max HP.', CHU('Standard'), { target: 'allies', radius: 0, heal: { pct: 0.2 } }, { sta: 5, cooldown: 3 }),
  p('sludgeCleanse', 'Sludge Cleanse', 0, 'You and allies within 2 are cleansed of ailments (sludge, Burning, Poison).', CHU('Standard'), { target: 'allies', radius: 2, cleanse: true, purify: true }, { sta: 4, cooldown: 3 }),
  p('flamingLeap', 'Flaming Leap', 0, 'Leap at an enemy within 2: STR + 4 fire damage.', CHU('Fire'), { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 4, vs: 'def', element: 'fire' }, move: true }, { sta: 4, cooldown: 1 }),
  q('flameBurst', 'Flame Burst', 8, 'A fiery explosion: enemies within 2 take MAG + 3 fire damage and may Burn. Uses up the coating for 2 turns.', CHU('Fire'), { cooldown: 2 }),
  p('igniteST', 'Ignite', 4, 'Set the flammable ground around a space within 2 ablaze (enemies there may Burn).', CHU('Fire'), { target: 'tile', range: [1, 2], radius: 1, terrain: 'burningGrass', terrainTurns: 2 }, { cooldown: 2 }),
  q('reigniteChu', 'Reignite', 0, 'Restore your coating at once.', CHU('Fire'), { sta: 5, cooldown: 2 }),
  p('frozenLeap', 'Frozen Leap', 0, 'Leap at an enemy within 2: STR + 4 ice damage.', CHU('Ice'), { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 4, vs: 'def', element: 'ice' }, move: true }, { sta: 4, cooldown: 1 }),
  q('frostBurst', 'Frost Burst', 8, 'A freezing burst: enemies within 2 take MAG + 2 ice damage and may Freeze. Uses up the coating for 2 turns.', CHU('Ice'), { cooldown: 2 }),
  q('frozenSurfaceChu', 'Frozen Surface', 6, 'Shallow water within 2 freezes over (walkable ice for 3 turns).', CHU('Ice'), { cooldown: 3 }),
  q('refreeze', 'Refreeze', 0, 'Restore your coating at once.', CHU('Ice'), { sta: 5, cooldown: 2 }),
  p('electricLeap', 'Electric Leap', 0, 'Leap at an enemy within 2: STR + 4 lightning damage.', CHU('Electric'), { target: 'foe', range: [1, 2], dmg: { stat: 'str', base: 4, vs: 'def', element: 'lightning' }, move: true }, { sta: 4, cooldown: 1 }),
  q('dischargeST', 'Discharge', 8, 'Shock everyone next to you: MAG + 3 lightning damage, may Shock and disarm (Weaken). Uses up the coating for 2 turns.', CHU('Electric'), { cooldown: 2 }),
  q('conductiveBurst', 'Conductive Burst', 12, 'Lightning races through connected water: every enemy within 5 standing in or next to water takes MAG + 4 lightning damage.', CHU('Electric'), { cooldown: 3 }),
  q('recharge', 'Recharge', 0, 'Restore your coating at once.', CHU('Electric'), { sta: 5, cooldown: 2 }),
  p('metallicSlam', 'Metallic Slam', 0, 'A heavy slam: STR + weapon + 5 lightning damage on an adjacent enemy.', CHU('Metal'), { target: 'foe', range: [1, 1], dmg: { stat: 'str', base: 5, vs: 'def', weapon: true, element: 'lightning' } }, { sta: 5, cooldown: 2 }),
  q('staticField', 'Static Field', 8, 'An electric field around you for 3 turns: enemies next to you at the start of a turn take 4 + MAG/4 lightning damage.', CHU('Metal'), { cooldown: 4 }),
  p('electricalCounter', 'Electrical Counter', 0, 'Brace: until your next turn, anyone who hits you in melee takes a powerful shock.', CHU('Metal'), { target: 'self', buff: { id: 'electricalCounter', name: 'Electrical Counter', turns: 1 } }, { sta: 4, cooldown: 2 }),
  q('hornChargeChu', 'Horn Charge', 0, 'Charge up to 3 spaces in a line: the first enemy takes STR + weapon + 4 and is knocked back.', CHU('Helmet'), { sta: 6, cooldown: 2 }),
  p('armoredRetreat', 'Armored Retreat', 0, 'Hunker down: +6 DEF until your next turn.', CHU('Helmet'), { target: 'self', buff: { id: 'armoredRetreat', name: 'Armored Retreat', turns: 1, stats: { def: 6 } } }, { sta: 4, cooldown: 2 }),
  q('reequipHelmet', 'Reequip Helmet', 0, 'Pick the knocked-off helmet back up and put it on.', CHU('Helmet'), { sta: 3 }),
];

/** Abilities engine/spirit.ts resolves itself (the rest are data-driven). */
export const SP_SPECIAL = ['throwSwitch', 'repairTrack', 'whipSwing', 'songOfAwakening', 'stSongOfHealing', 'songOfDiscovery', 'songOfBirds', 'songOfLight', 'lokomoDuet',
  'songOfRestoration', 'sandPillarAct', 'sandBridgeAct', 'blinCapture', 'ironGrab', 'gauntletThrow', 'wreckingRoll', 'spiritForm', 'possessPhantom', 'returnToBody', 'eyeWarpST',
  'masterRepair', 'demonicSummon', 'merchantsAppraisal', 'sweepingSmash', 'pirateRally', 'sandAmbushAct', 'keyTheft', 'iceFireBreath', 'fraazSplit', 'boulderHurl',
  'flameBurst', 'reigniteChu', 'frostBurst', 'frozenSurfaceChu', 'refreeze', 'dischargeST', 'conductiveBurst', 'recharge', 'staticField', 'hornChargeChu', 'reequipHelmet'];
