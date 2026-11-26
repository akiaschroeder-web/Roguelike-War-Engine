import type { AbilityDef } from '../../engine/types';

const ab = (d: Omit<AbilityDef, 'implemented'> & { implemented?: boolean }): AbilityDef => ({ implemented: true, ...d });
const act = (id: string, name: string, icon: string, desc: string, extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, icon, kind: 'personal', mp: 0, contextual: true, grantedBy: { everyone: true }, desc, ...extra });
const tech = (id: string, name: string, sta: number, desc: string, extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, kind: 'technique', mp: 0, sta, weaponTypes: ['sword'], hidden: true, desc, ...extra });
const pers = (id: string, name: string, mp: number, desc: string, templates: string[], extra: Partial<AbilityDef> = {}): AbilityDef =>
  ab({ id, name, kind: 'personal', mp, desc, grantedBy: { templates }, ...extra });

/** The seven Hidden Skills (learned from the Hero's Shade). */
export const HIDDEN_SKILLS = ['endingBlow', 'shieldAttack', 'backSlice', 'helmSplitter', 'mortalDraw', 'jumpStrike', 'greatSpin'];

export const ABILITIES: AbilityDef[] = [
  // ── Hidden Skills (section 9) ──
  tech('endingBlow', 'Ending Blow', 4, 'Finishes an enemy below 25% HP outright. Against a boss, strikes an extra time instead.'),
  tech('shieldAttack', 'Shield Attack', 3, 'Needs a shield. Staggers the target (Dazed) and breaks its guard; magic projectiles are reflected while you hold it up.', { might: -2, hit: 15 }),
  tech('backSlice', 'Back Slice', 5, 'Roll around the target before striking: ignores 50% of its DEF.'),
  tech('helmSplitter', 'Helm Splitter', 6, 'Vault over the target and strike from above: ignores shields, frontal armor and blocks.', { crit: 10 }),
  tech('mortalDraw', 'Mortal Draw', 8, 'Only if you didn\'t attack last turn: a lightning-fast draw that deals double damage.'),
  tech('jumpStrike', 'Jump Strike', 7, 'Leap up to 2 spaces onto a target space and strike every enemy next to where you land.', { area: true }),
  tech('greatSpin', 'Great Spin', 10, 'Only at full HP: strikes every enemy within 2 spaces.', { area: true }),

  // ── Wolf Link (section 1) ──
  ab({ id: 'wolfJumpAttack', name: 'Jump Attack', kind: 'technique', mp: 0, sta: 3, weaponTypes: ['natural'], might: 3, desc: 'Leaps at the enemy: +3 Might.', grantedBy: { templates: ['wolfLink'] } }),
  pers('wolfDig', 'Dig', 0, 'Dig the space you stand on: uncovers buried items, Buried Passages and dig spots.', ['wolfLink'], { contextual: true, icon: '⛏', freeAction: true, perTurn: true }),
  pers('wolfSense', 'Sense', 2, 'Reveals hidden enemies, spirits and traps within 6 this turn.', ['wolfLink'], { freeAction: true, perTurn: true }),
  pers('wolfHowl', 'Howl', 0, 'Howl at a Howling Stone you stand next to: the Hero\'s Shade teaches a Hidden Skill after the battle.', ['wolfLink'], { contextual: true, icon: '🐺' }),
  pers('energyField', 'Energy Field', 8, 'With Midna\'s help: strike up to 5 enemies within 3, one after another (each for full damage). Midna must be in the army.', ['wolfLink', 'wolfLinkMidna'], { cooldown: 3 }),
  pers('wolfForm', 'Shadow Crystal: Wolf', 0, 'Transform into Wolf Link (until you change back or the battle ends).', ['heroOfTwilight']),
  pers('humanForm', 'Shadow Crystal: Hylian', 0, 'Return to Hylian form.', ['wolfLink']),

  // ── Midna, Zant, Ganondorf and others ──
  pers('shadowGrab', 'Shadow Grab', 4, 'Seize a smaller enemy within 3 and hurl it up to 3 spaces away (6 + MAG/2 damage).', ['midnaImp', 'midnaTrue', 'fusedShadowMidna'], { grantedBy: { templates: ['midnaImp', 'midnaTrue', 'fusedShadowMidna'], gear: ['twilightGrasp'], weapons: ['midnasShadowHand'] } }),
  act('midnaRide', 'Ride', '🐺', 'Midna climbs onto an adjacent allied beast (Wolf Link, horses, Bullbos): she rides without making it bigger, and it gains +2 STR and MAG.', { grantedBy: { skills: ['twilightCompanion'] } }),
  act('midnaDismount', 'Climb Down', '⬇', 'Midna leaves the beast she is riding for an adjacent space.', { grantedBy: { everyone: true } }),
  pers('fusedShadowForm', 'Fused Shadow', 0, 'With the Complete Fused Shadow equipped, become Fused Shadow Midna (costs 5 MP per turn).', ['midnaImp', 'midnaTrue']),
  pers('zantsWarp', "Zant's Warp", 4, 'Teleport to an empty space up to 4 away. Doesn\'t use your action.', ['zant', 'phantomZant'], { freeAction: true, perTurn: true, grantedBy: { templates: ['zant', 'phantomZant'], gear: ['zantsHelmet', 'zantsRoyalJewel'], skills: ['unstableSorcery'] } }),
  pers('zantsFrenzy', "Zant's Frenzy", 0, 'Spin with the twin blades: strike every adjacent enemy. Costs 4 stamina, +3 each further use this battle.', ['zant'], { grantedBy: { weapons: ['zantsTwinBlades'] } }),
  pers('beastCharge', 'Beast Charge', 0, 'Charge up to 4 spaces in a straight line, trampling smaller enemies in the way (STR damage) and knocking them aside. Costs 6 stamina.', ['darkBeastGanon', 'lordBullbo'], { grantedBy: { skills: ['beastOfDarkness', 'unstoppableCharge'] } }),
  pers('sumoThrow', 'Sumo Throw', 0, 'Grab an adjacent unit of equal or smaller size and shove it 2 spaces (STR/2 damage). Costs 4 stamina.', ['mayorBo', 'gorCoron', 'darbus', 'dangoro'], { grantedBy: { skills: ['sumoChampion', 'volcanicWrestler', 'unmovableElder'] } }),
  pers('ancientEscapeAbility', 'Ancient Escape', 0, 'Ooccoo whisks herself and an adjacent ally back to your deployment area.', ['ooccoo'], { oncePerBattle: true }),
  pers('lakesMercy', "Lake's Mercy", 12, 'Healing rain: every ally within 3 recovers 30% HP and Twilight within 2 is purified.', ['lanayru'], { cooldown: 3 }),
  pers('warHorn', 'War Horn', 0, 'Mounted allies within 3 gain +2 STR and +2 MOV for 2 turns.', [], { grantedBy: { gear: ['bulblinWarHorn'] }, oncePerBattle: true }),
  pers('horseCallAbility', 'Horse Call', 0, 'Your mount gallops in: you mount up if you aren\'t already (needs a mount equipped).', [], { grantedBy: { gear: ['horseCall'] }, freeAction: true, perTurn: true }),
  pers('solLight', 'Raise Sol', 0, 'Purify Twilight within 4 and sear nearby Twilight creatures. The Master Sword becomes the Light Sword.', [], { grantedBy: { gear: [] }, implemented: true }),

  // ── Mounted combat (section 19) ──
  ab({ id: 'mountedSpin', name: 'Mounted Spin Attack', kind: 'technique', mp: 0, sta: 5, area: true, weaponTypes: ['sword', 'axe', 'lance'], mounted: true,
    desc: 'While mounted: strike every adjacent enemy.' }),
  ab({ id: 'mountedGrapple', name: 'Mounted Grapple', kind: 'technique', mp: 0, sta: 4, weaponTypes: ['sword', 'axe', 'lance', 'hookshot', 'gauntlet'], mounted: true, might: -2,
    desc: 'While mounted: drag a mounted enemy out of the saddle (Forced Dismount) if it hits.' }),

  // ── Poe Sisters ──
  pers('crimsonLantern', 'Flame Rotation', 4, 'Spin the lantern: fire damage (MAG/2 + 4) to every adjacent enemy, with a chance to burn.', ['joelle']),
  pers('paintingRefuge', 'Painting Refuge', 3, 'Vanish into a painting or wall: Veiled until your next turn.', ['joelle', 'beth', 'amy'], { freeAction: false }),
  pers('coldEmbrace', 'Cold Embrace', 4, 'Freeze an adjacent enemy that fails a RES check.', ['beth']),
  pers('spectralBarrier', 'Spectral Barrier', 5, 'A barrier on you or an ally within 2 that absorbs the next 15 damage.', ['beth']),
  pers('hauntingCurse', 'Haunting Curse', 4, 'An enemy within 3 loses 3 STR and MAG for 2 turns.', ['amy']),
  pers('spiritDrain', 'Spirit Drain', 0, 'Steal up to 8 MP from an enemy within 3.', ['amy'], { cooldown: 2 }),
  pers('phantomQuartet', 'Phantom Quartet', 6, 'Create up to three illusory duplicates of Meg (each vanishes when struck).', ['meg'], { cooldown: 3 }),
  pers('illusoryExchange', 'Illusory Exchange', 0, 'Swap places with one of your duplicates. Doesn\'t use your action.', ['meg'], { freeAction: true, perTurn: true }),
  pers('phantomAssault', 'Phantom Assault', 5, 'Every duplicate strikes an enemy within 4 for 30% of Meg\'s damage.', ['meg']),

  // ── ChuChus ──
  act('chuFusion', 'Fuse', '🫧', 'Merge with an adjacent allied ChuChu into a bigger ChuChu (+50% HP and +3 STR per ChuChu merged). Mixed colours make a Purple ChuChu.', { grantedBy: { races: ['chuchu'] } }),
  act('chuDivide', 'Divide', '🫧', 'Split back into the ChuChus that merged.', { grantedBy: { races: ['chuchu'] } }),
  pers('jellyTransfer', 'Jelly Transfer', 0, 'Spend 5 HP: an adjacent unit is randomly healed 10 or hurt 10.', ['purpleChuchu']),
  pers('goldenBlessing', 'Golden Blessing', 0, 'Spend 8 HP: fully heal an adjacent ally and double the damage of its next hit.', ['rareChuchu']),
  pers('radiantJelly', 'Radiant Jelly', 6, 'Heals every adjacent ally for 10 HP.', ['rareChuchu']),
  pers('purifyingBody', 'Purifying Body', 8, 'Removes harmful statuses from yourself and adjacent allies.', ['rareChuchu']),
  pers('goldenDivision', 'Golden Division', 0, 'Spend 15 HP: bud off a temporary Rare ChuChu (25% of your max HP) that leaves after battle.', ['rareChuchu'], { oncePerBattle: true }),

  // ── Bubbles ──
  pers('reignite', 'Reignite', 4, 'Rekindle your protective flames.', ['redBubble', 'blueBubble', 'skullBubble']),
  pers('lavaDive', 'Lava Dive', 0, 'Sink into the lava you\'re over: untargetable until your next turn. Costs 3 stamina.', ['redBubble']),
  pers('fireburst', 'Fireburst', 8, 'Fire damage (MAG/2 + 5) to every enemy within 2.', ['redBubble']),
  pers('curseWave', 'Curse Wave', 8, 'Weapon Curse on every adjacent enemy (2 turns).', ['blueBubble']),
  pers('azureBarrier', 'Azure Barrier', 4, 'Physical damage you take is halved until your next turn.', ['blueBubble']),
  pers('flameToggle', 'Ignite / Extinguish', 2, 'Switch the Green Bubble\'s flame state now.', ['greenBubble'], { freeAction: true, perTurn: true }),
  pers('curseTransfer', 'Curse Transfer', 4, 'Spread a Weapon Curse from one enemy to another within 3 of it.', ['bubbleMM']),
  pers('hexingScreech', 'Hexing Screech', 5, 'Adjacent enemies lose 3 SKL and LCK for 2 turns.', ['bubbleMM']),
  pers('dormantSkull', 'Dormant Skull', 2, 'Drop to the ground and hide (Veiled) until you move or attack.', ['skullBubble']),

  // ── Queen of Fairies ──
  pers('fairyQueensBlessing', "Fairy Queen's Blessing", 8, 'Fully heal an ally within 3 and remove their harmful statuses.', ['queenOfFairies']),
  pers('elementalGift', 'Elemental Gift', 6, 'An allied archer within 3 can fire Fire or Ice Arrows for free for 3 turns.', ['queenOfFairies']),
  pers('royalRestoration', 'Royal Restoration', 15, 'Every ally on the field recovers 30% of their HP and MP.', ['queenOfFairies'], { cooldown: 4 }),
  pers('fairySummoning', 'Fairy Summoning', 10, 'Summon two Fairies that heal allies near them.', ['queenOfFairies'], { cooldown: 3 }),
  pers('divineProtection', 'Divine Protection', 12, 'An ally within 3 survives the next fatal blow at 1 HP.', ['queenOfFairies']),
  pers('fairyAscension', 'Fairy Ascension', 20, 'An allied Fairy within 3 gains +8 MAG and RES for 3 turns, and its healing doubles.', ['queenOfFairies'], { cooldown: 4 }),
];
