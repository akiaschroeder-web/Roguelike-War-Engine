import type { AbilityDef } from '../../engine/types';

const ab = (d: Omit<AbilityDef, 'implemented'> & { implemented?: boolean }): AbilityDef => ({ implemented: true, ...d });
const act = (id: string, name: string, icon: string, desc: string, extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, desc, ...extra });
const tech = (id: string, name: string, sta: number, desc: string, templates: string[], extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, kind: 'technique', mp: 0, sta, weaponTypes: ['sword'], desc, grantedBy: { templates }, ...extra });
const pers = (id: string, name: string, mp: number, desc: string, templates: string[], extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: { templates }, ...extra });
const song = (id: string, name: string, mp: number, desc: string, extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, kind: 'song', mp, desc, grantedBy: { weapons: ['goddessHarp'] }, radius: 3, ...extra });

/** Swords that can unleash a Skyward Strike. */
export const SKYWARD_SWORDS = ['goddessSword', 'goddessLongsword', 'goddessWhiteSword', 'masterSword', 'trueMasterSword'];
const SKY = { weapons: SKYWARD_SWORDS };
const KNIGHTS = ['heroOfTheSky', 'pipit', 'karane', 'fledge', 'gaepora'];

export const ABILITIES: AbilityDef[] = [
  // ── Skyward Strike (section 20) ──
  pers('skywardCharge', 'Raise Sword (Charge)', 0, 'Raise your sword to the sky to charge a Skyward Strike: charge level +1 per action (+2 with the White Sword or Master Sword, full in one with the True Master Sword). Max level 3.', [],
    { grantedBy: SKY, icon: '⚡' }),
  pers('skywardStrike', 'Skyward Strike', 0, 'Release the charge as a ranged slash of sacred light (STR + sword Might vs RES). Level 1: +3 Might, range 2–3 · Level 2: +6, range 2–5 · Level 3: +10, range 2–6. Also opens Goddess Cubes in range.', [],
    { grantedBy: SKY }),
  pers('darkSkywardStrike', 'Dark Skyward Strike', 0, 'Demise\'s version: release a charge stored by Lightning Sword as a ranged slash of dark lightning (range 2–6, +10 Might).', ['demise', 'demiseBoss'],
    { grantedBy: { weapons: ['demonKingsSword'], templates: ['demise'] } }),
  // ── Hero of the Sky ──
  tech('fatalBlow', 'Fatal Blow', 4, 'Leap onto a knocked-down enemy (Dazed, Stunned, Frozen, Asleep or Rooted): double damage and +30 Hit. Against a standing enemy it\'s an ordinary strike.', ['heroOfTheSky']),
  tech('shieldBash', 'Shield Bash', 3, 'Needs a shield. Bash the enemy off balance: it is Dazed (knocked down) and loses its next counterattack chance; magic projectiles are deflected.', KNIGHTS, { might: -2, hit: 10 }),
  pers('dash', 'Dash', 0, 'Spend 4 stamina to sprint: +3 MOV this turn. Doesn\'t use your action; only before moving.', KNIGHTS, { sta: 4, freeAction: true, perTurn: true, icon: '💨',
    grantedBy: { templates: [...KNIGHTS, 'groose', 'impaSS'], gear: ['knightsUniform'] } }),
  // ── Zelda and Hylia ──
  pers('goddessBlessing', "Goddess's Blessing", 5, 'Heal an ally within 2 (MAG + 8) and lift curses, Weapon Curse and other harmful statuses.', ['zeldaSS', 'hylia']),
  pers('sacredSeal', 'Sacred Seal', 6, 'Seal an enemy within 3: Rooted and unable to transform for 2 turns.', ['zeldaSS'], { cooldown: 2 }),
  pers('divineBarrier', 'Divine Barrier', 8, 'You and allies within 2 take no magic damage until your next turn.', ['zeldaSS'], { cooldown: 3 }),
  pers('prayerOfHylia', 'Prayer of Hylia', 4, 'Allies within 3 recover 8 MP and 4 stamina.', ['zeldaSS', 'hylia'], { cooldown: 2 }),
  // ── Fi ──
  pers('dowsing', 'Dowsing', 2, 'Reveal hidden enemies, Sacred Tears and traps within 6 (10 with the White Sword) and point out buried treasure and Goddess Cubes.', ['fi'], { freeAction: true, perTurn: true }),
  pers('divineDance', 'Divine Dance', 5, 'You and allies within 2 gain +3 SKL and +15 Avoid for 2 turns.', ['fi'], { cooldown: 2 }),
  pers('sacredBlade', 'Sacred Blade', 4, 'A ranged blade of light at an enemy within 4 (MAG + 8 vs RES; +30% against demons and the undead).', ['fi']),
  pers('swordCommunion', 'Sword Communion', 5, 'An ally within 3 who carries a sword gains +3 damage and +15 Hit for 3 turns.', ['fi']),
  // ── Groose ──
  pers('bombardment', 'Bombardment', 0, 'Lob a bomb at a space 2–6 away: STR + 8 damage (vs DEF) to everyone in a radius of 1 (2 with the Siege Specialists). Costs 6 stamina.', ['groose'], { sta: 6, cooldown: 1 }),
  pers('constructEmplacement', 'Construct Emplacement', 0, 'Build a stationary artillery platform (Cannon Emplacement) on an adjacent open space. Costs 4 stamina.', ['groose', 'gondo'], { sta: 4 }),
  pers('heavyLift', 'Heavy Lift', 0, 'Heave: every adjacent smaller unit is shoved 2 spaces, and adjacent Sand Piles, rubble and cracked walls are cleared. Costs 4 stamina.', ['groose', 'gorko'], { sta: 4 }),
  pers('unexpectedCourage', 'Unexpected Courage', 0, 'With an injured ally next to you: +4 STR and DEF for 2 turns.', ['groose'], { cooldown: 2 }),
  // ── Impa ──
  pers('sacredBarrierSS', 'Sacred Barrier', 5, 'A barrier on you or an ally within 2 that absorbs the next 12 damage.', ['impaSS']),
  tech('sheikahStrike', 'Sheikah Strike', 4, 'A swift Sheikah blow: +4 Might, +20 Critical.', ['impaSS'], { weaponTypes: ['dagger', 'sword'], might: 4, crit: 20 }),
  pers('shadowDash', 'Shadow Dash', 0, 'Vanish and reappear up to 4 spaces away. Doesn\'t use your action. Costs 3 stamina.', ['impaSS'], { sta: 3, freeAction: true, perTurn: true }),
  pers('protectiveSeal', 'Protective Seal', 5, 'Seal an adjacent enemy: Rooted and Silenced for a turn.', ['impaSS']),
  // ── Ghirahim ──
  pers('bladeCatch', 'Blade Catch', 0, 'Until your next turn, the first melee attack against you is caught and negated (40% chance to disarm the attacker). Costs 3 stamina.', ['ghirahim', 'ghirahimBoss'], { sta: 3 }),
  pers('demonDarts', 'Demon Darts', 5, 'A spread of daggers at an enemy 2–5 away and up to two enemies next to it (MAG + 4 vs RES).', ['ghirahim', 'ghirahimBoss']),
  pers('teleportSlash', 'Teleport Slash', 4, 'Snap your fingers, appear next to an enemy within 5 and cut it (STR + weapon Might vs DEF).', ['ghirahim', 'ghirahimBoss']),
  pers('demonicRestoration', 'Demonic Restoration', 6, 'Draw on dark energy: recover 30% of max HP.', ['ghirahim', 'ghirahimBoss'], { cooldown: 3 }),
  pers('ghirahimTrueForm', 'True Form', 0, 'Drop the act: become Ghirahim\'s True Form (shares his progression; reverts after the battle).', ['ghirahim', 'ghirahimBoss']),
  pers('ghirahimSpiritForm', 'Demon Lord Form', 0, 'Return to Ghirahim\'s usual form.', ['ghirahimTrue']),
  tech('demonBlade', 'Demon Blade', 4, 'Strike with his own edge: +4 Might, ignores 25% of DEF.', ['ghirahimTrue'], { might: 4 }),
  pers('rapidTeleportation', 'Rapid Teleportation', 2, 'Teleport up to 3 spaces. Doesn\'t use your action.', ['ghirahimTrue'], { freeAction: true, perTurn: true }),
  pers('diamondBarrage', 'Diamond Barrage', 8, 'A storm of diamond blades: every enemy within 3 takes MAG/2 + 6 (vs half RES).', ['ghirahimTrue'], { cooldown: 2 }),
  tech('executionersStrike', "Executioner's Strike", 6, 'Against an enemy below half HP: +50% damage and +20 Hit.', ['ghirahimTrue']),
  // ── Demise ──
  tech('demonKingsSlash', "Demon King's Slash", 5, 'A sweeping blow: +5 Might, and half damage to enemies next to the target.', ['demise', 'demiseBoss'], { might: 5 }),
  pers('lightningSword', 'Lightning Sword', 6, 'Call lightning into the blade: sword attacks deal lightning damage with +4 Might for 2 turns, and Dark Skyward Strike is fully charged.', ['demise', 'demiseBoss'], { cooldown: 2 }),
  pers('demonicDominion', 'Demonic Dominion', 6, 'Demonic allies within 3 gain +3 STR and RES for 3 turns.', ['demise', 'demiseBoss'], { cooldown: 3 }),
  // ── Loftwings ──
  tech('beakStrike', 'Beak Strike', 2, 'A quick peck: +3 Might, +10 Hit.', ['skyLoftwing', 'crimsonLoftwing'], { weaponTypes: ['natural'], might: 3, hit: 10 }),
  tech('divingAttack', 'Diving Attack', 4, 'After moving 2+ spaces: dive onto the enemy for +50% damage.', ['skyLoftwing', 'crimsonLoftwing'], { weaponTypes: ['natural'] }),
  pers('wingGust', 'Wing Gust', 0, 'Beat your wings: adjacent enemies are blown 1 space back; Sand Piles and Wind Pinwheels next to you react. Costs 3 stamina.', ['skyLoftwing', 'crimsonLoftwing', 'levias'], { sta: 3 }),
  pers('aerialTransport', 'Aerial Transport', 0, 'Pick up an adjacent ally on foot and carry them (they ride along; drop them off later).', ['skyLoftwing', 'crimsonLoftwing', 'scrapper']),
  act('dropOff', 'Drop Off', '⬇', 'Set the ally you are carrying down on an adjacent space.'),
  // ── Tools ──
  pers('beetleFlight', 'Beetle', 0, 'Fly the Beetle to a space within range: reveals hidden enemies and traps around it, hits Wind Pinwheels and switches. A Hook Beetle drops a Bomb from your pack there.', [],
    { grantedBy: { gear: ['beetle', 'hookBeetle', 'quickBeetle', 'toughBeetle'] }, freeAction: true, perTurn: true }),
  pers('gustBellowsBlast', 'Gust Bellows', 0, 'A blast of wind: enemies within 2 are pushed back 1, Sand Piles within 2 blow away, pinwheels spin, flames go out. Costs 3 stamina.', [],
    { grantedBy: { gear: ['gustBellows'] }, sta: 3 }),
  pers('whipSnatch', 'Whip Snatch', 0, 'Crack the whip at an enemy within 3: snatch something small (₹15) and pull it next to you if it\'s small.', [], { grantedBy: { weapons: ['whip'] } }),
  pers('mogmaDig', 'Mogma Dig', 0, 'Dig here for buried items — or, on a Burrowing Tunnel, travel underground to another tunnel.', ['moldini'],
    { grantedBy: { templates: ['moldini'], gear: ['diggingMitts', 'mogmaMitts'], races: ['mogma'] } }),
  pers('diamondStep', 'Diamond Step', 0, 'A short teleport (2 spaces). Doesn\'t use your action.', [], { grantedBy: { gear: ['ghirahimsDiamond'] }, freeAction: true, perTurn: true }),
  // ── Battlefield spaces ──
  act('strikeTimeshiftStone', 'Strike Timeshift Stone', '⏳', 'Strike an adjacent Timeshift Stone: the land around it (radius 3) returns to the ancient era — or back to the present.'),
  act('openTrialGate', 'Open Trial Gate', '🚪', 'Stand on a Trial Gate and plant your sword: after this battle the army\'s next fight is a Silent Realm trial.'),
  act('throwWaterFruit', 'Throw Water Fruit', '💧', 'Pick a fruit from an adjacent Water Fruit Plant and throw it (up to 3 spaces): lava around the landing spot hardens for 3 turns and fire creatures there take 8 damage.'),
  // ── Goddess's Harp songs (section 11) ──
  song('balladOfTheGoddess', 'Ballad of the Goddess', 5, 'Reveals divine mechanisms (Goddess Cubes, hidden Sacred Tears) and gives adjacent allies +3 MAG for 2 turns.', { grantedBy: { weapons: ['goddessHarp'], templates: ['zeldaSS', 'hylia'] } }),
  song('faroresCourage', "Farore's Courage", 6, 'Allies within 3 gain +3 STR and SPD for 2 turns.'),
  song('nayrusWisdom', "Nayru's Wisdom", 6, 'Allies within 3 gain +3 MAG and RES for 2 turns.'),
  song('dinsPower', "Din's Power", 6, 'Allies within 3 gain +3 STR and DEF for 2 turns.'),
  song('songOfTheHero', 'Song of the Hero', 12, 'Needs the whole song (taught by the three Dragons and Levias). Every deployed ally gains +3 STR, MAG, SKL, SPD, DEF and RES for 3 turns.', { radius: 99 }),
  // ── Group support: Song of the Hero (three Dragons + Levias) ──
  pers('dragonsChorus', "Guardians' Chorus", 10, 'With all three Dragons and Levias on the field: a cooperative sacred attack. Every enemy within 4 of any of them takes MAG/2 + 10 sacred damage.', ['faronDragon', 'eldinDragon', 'lanayruDragon', 'levias'], { oncePerBattle: true }),
  // ── The Imprisoned ──
  pers('imprisonedRise', 'Grow Arms', 0, 'The Imprisoned grows arms and claws its way up (becomes the Armed Form).', ['imprisoned'], { oncePerBattle: true }),
  pers('imprisonedAscend', 'Break the Seal', 0, 'The seal shatters and the Imprisoned takes flight (becomes the Flying Form).', ['imprisonedArmed'], { oncePerBattle: true }),
];
