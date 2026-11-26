import type { EventDef, EventEffect } from '../../engine/types';

const SURFACE = ['greatPlateau', 'centralHyrule', 'hyruleCastleWild', 'hateno', 'kakarikoWild', 'akkala', 'lanayruWild', 'eldinWild', 'hebra', 'gerudoWild', 'faronWild', 'necluda', 'greatHyruleForest', 'finalTrial'];
const SKY = ['greatSkyIsland', 'skyArchipelago'];
const DEPTHS = ['depthsMines', 'spiritTemple', 'gloomsOrigin'];
const ALL = [...SURFACE, ...SKY, ...DEPTHS];
const w = (op: string, amount?: number, id?: string): EventEffect => ({ kind: 'wild', op, amount, id });
const take = (id: string, n: number): EventEffect[] => Array.from({ length: n }, () => ({ kind: 'takeQuest' as const, id }));
const q = (id: string): EventEffect => ({ kind: 'quest', id });

export const EVENTS: EventDef[] = [
  { id: 'bloodMoonRising', title: 'The Blood Moon', art: 'hino', regions: ALL,
    text: 'The moon comes up red. "When the Blood Moon rises, the monsters you have slain come back," an old woman says. "Cook something. Quickly."',
    choices: [
      { label: 'Brace for it', outcome: { text: 'The red light washes over the land. Monsters stir in every camp.', effects: [w('bloodMoon')] } },
      { label: 'Cook under the red moon', outcome: { text: 'Everything you cook tonight comes out perfect.', effects: [w('bloodMoon'), w('meal', 2)] } },
    ] },
  { id: 'cookingPotRoadside', title: 'A Cooking Pot by the Road', art: 'impaWild', regions: SURFACE,
    text: 'An abandoned cooking pot sits over warm coals. Someone has left a bag of ingredients beside it.',
    choices: [
      { label: 'Cook a meal for the army', outcome: { text: 'Hearty, if a little burnt.', effects: [{ kind: 'hp', pct: 0.25 }, w('meal', 1)] } },
      { label: 'Take the ingredients', outcome: { text: 'Mushrooms, peppers, an apple or two.', effects: [w('mats', 3, 'food')] } },
    ] },
  { id: 'shrineOfLight', title: 'A Shrine', art: 'kass', regions: [...SURFACE, ...SKY],
    text: 'An orange-lit shrine hums at the edge of the road. Inside, a trial waits — and at the end, a blessing.',
    choices: [
      { label: 'Take the trial', gamble: { chance: 70,
        win: { text: 'The monk smiles. A Spirit Orb glows in your hands.', effects: [q('spiritOrb'), { kind: 'xp', amount: 25 }] },
        lose: { text: 'The trial bests you. Bruised, you leave with nothing but experience.', effects: [{ kind: 'hp', pct: -0.1 }, { kind: 'xp', amount: 15 }] } } },
      { label: 'Look for the Blessing (no fight)', outcome: { text: 'A Light of Blessing waits on a pedestal.', effects: [q('lightOfBlessing')] } },
    ] },
  { id: 'stableRest', title: 'A Stable', art: 'royalWhiteStallion', regions: SURFACE,
    text: 'A horse-head tent, a cook, a bed for the night and horses for sale.',
    choices: [
      { label: 'Rest the night (₹40)', cost: 40, outcome: { text: 'Everyone sleeps well.', effects: [{ kind: 'hp', pct: 0.5 }, q('ponyPoint')] } },
      { label: 'Buy a mount (₹400)', cost: 400, outcome: { text: 'A good horse, registered and saddled.', effects: [{ kind: 'loot', ids: ['royalWhiteStallionMount', 'mountainDeerMount', 'giantHorse', 'stalhorse'] }, q('ponyPoint')] } },
      { label: 'Spend 5 Pony Points (Malanya\'s blessing)', requires: { questCount: { ponyPoint: 5 } }, outcome: { text: 'The stable hands give you a token from the horse god herself.', effects: [...take('ponyPoint', 5), { kind: 'loot', ids: ['malanyasBlessing'] }] } },
    ] },
  { id: 'korokPuzzleEvent', title: 'A Strange Rock', art: 'hestu', regions: [...SURFACE, ...SKY],
    text: 'Three rocks in a circle, and a gap where a fourth should be. Something giggles under a leaf.',
    choices: [
      { label: 'Solve the puzzle', gamble: { chance: 75, win: { text: '"Yahaha! You found me!" A Korok Seed.', effects: [w('korok', 1)] }, lose: { text: 'It was just some rocks.', effects: [] } } },
      { label: 'Search the whole area', outcome: { text: 'Two more Koroks, hiding badly.', effects: [w('korok', 2)] } },
    ] },
  { id: 'hestusDance', title: "Hestu's Dance", art: 'hestu', regions: ALL,
    text: 'A huge Korok shakes his maracas. "Shala-kaaaa! Bring me Korok Seeds and I\'ll make your pockets bigger!"',
    choices: [
      { label: 'Give 3 Korok Seeds (+1 pack slot)', requires: { questCount: { korokSeed: 3 } }, outcome: { text: 'He does a little dance. Someone\'s pack is bigger now.', effects: [...take('korokSeed', 3), w('packSlot')] } },
      { label: 'Give 6 Korok Seeds (+2 army capacity)', requires: { questCount: { korokSeed: 6 } }, outcome: { text: '"Shalaka!" The convoy has room for more.', effects: [...take('korokSeed', 6), w('armyCap', 1)] } },
      { label: 'Ask him to come along', requires: { questCount: { korokSeed: 1 } }, outcome: { text: 'He packs his maracas.', effects: [...take('korokSeed', 1), { kind: 'recruit', pool: ['hestu'] }] } },
      { label: 'Listen to the song', outcome: { text: 'It is a very catchy song.', effects: [{ kind: 'support', amount: 2 }] } },
    ] },
  { id: 'bargainerStatue', title: 'The Bargainer Statue', art: 'kohga', regions: DEPTHS,
    text: 'A grinning statue in the dark. "Poes... bring me Poes... and I shall give you treasures."',
    choices: [
      { label: 'Trade 5 Poes (gear)', requires: { questCount: { poe: 5 } }, outcome: { text: 'The statue coughs up something shiny.', effects: [...take('poe', 5), { kind: 'loot', ids: ['depthsHead', 'depthsBody', 'depthsFeet', 'minerHead', 'minerBody', 'minerFeet', 'evilSpiritHead'] }] } },
      { label: 'Trade 12 Poes (rare gear)', requires: { questCount: { poe: 12 } }, outcome: { text: '"A fine bargain!"', effects: [...take('poe', 12), { kind: 'loot', ids: ['evilSpiritBody', 'evilSpiritFeet', 'mysticBody', 'gloomSword', 'ancientHerosAspect'] }] } },
      { label: 'Gather Poes nearby', outcome: { text: 'Blue lights flicker in the dark. You catch a few.', effects: [w('poe', 3)] } },
    ] },
  { id: 'greatFairyFountainWild', title: 'A Great Fairy Fountain', art: 'greatFairy', regions: SURFACE,
    text: 'A huge flower opens and a Great Fairy rises from it. "Your armor looks so tired! Let me freshen it up... for a price."',
    choices: [
      { label: 'Enhance armor (₹300)', cost: 300, outcome: { text: 'A shower of light. Someone\'s armor gleams.', effects: [w('armorStar', 1)] } },
      { label: 'Enhance armor twice (₹700)', cost: 700, outcome: { text: 'Light, kisses, more light.', effects: [w('armorStar', 2)] } },
      { label: 'Just a blessing', outcome: { text: 'The fairy laughs and heals everyone.', effects: [{ kind: 'hp', pct: 1 }] } },
    ] },
  { id: 'kiltonsFangAndBone', title: 'The Fang and Bone', art: 'kilton', regions: [...SURFACE, ...DEPTHS],
    text: 'A purple balloon-shop appears at dusk. "Monster parts! I pay in Mon! And I sell... masks."',
    choices: [
      { label: 'Sell monster materials (+₹ for each)', outcome: { text: 'Kilton shivers with joy at every horn.', effects: [w('sellMonster')] } },
      { label: 'Buy a monster mask (₹250)', cost: 250, outcome: { text: '"It smells authentic!"', effects: [{ kind: 'loot', ids: ['bokoblinMask', 'moblinMask', 'lizalfosMask', 'horriblinMask'] }] } },
      { label: 'Trade a Monster Medal (Lynel Mask)', requires: { questCount: { monsterMedal: 1 } }, outcome: { text: '"Careful. They notice eventually."', effects: [...take('monsterMedal', 1), { kind: 'loot', ids: ['lynelMask'] }] } },
    ] },
  { id: 'beedlesWildShop', title: "Beedle's Traveling Shop", art: 'beedle', regions: ALL,
    text: '"Thank you! Come again! Please buy something!" He has a backpack the size of a house.',
    choices: [
      { label: 'Elemental fruits (₹120)', cost: 120, outcome: { text: 'Fire, ice and shock, wrapped in leaves.', effects: [{ kind: 'loot', ids: ['fireFruit', 'iceFruit', 'shockFruit'] }, { kind: 'loot', ids: ['fireFruit', 'iceFruit', 'shockFruit'] }] } },
      { label: 'A bundle of Bomb Flowers (₹150)', cost: 150, outcome: { text: '"Handle with care!"', effects: [{ kind: 'loot', ids: ['bombFlower'] }, { kind: 'loot', ids: ['bombFlower'] }] } },
      { label: 'Zonai Charges (₹100)', cost: 100, outcome: { text: '"Fresh from the sky!"', effects: [{ kind: 'loot', ids: ['zonaiCharge'] }, { kind: 'loot', ids: ['zonaiCharge'] }] } },
      { label: 'Leave', outcome: { text: '"Come again!"', effects: [] } },
    ] },
  { id: 'goddessStatueWild', title: 'A Goddess Statue', art: 'zeldaWild', regions: ALL,
    text: 'A worn statue of the goddess. Spirit Orbs left at her feet turn into strength.',
    choices: [
      { label: 'Offer 4 orbs: Heart Container (+5 max HP)', requires: { questCount: { spiritOrb: 4 } }, outcome: { text: 'A warmth fills one of your soldiers.', effects: [...take('spiritOrb', 4), w('orbHeart')] } },
      { label: 'Offer 4 orbs: Stamina Vessel (+5 stamina)', requires: { questCount: { spiritOrb: 4 } }, outcome: { text: 'Lungs like a Rito.', effects: [...take('spiritOrb', 4), w('orbStamina')] } },
      { label: 'Offer 4 Lights of Blessing: Heart Container', requires: { questCount: { lightOfBlessing: 4 } }, outcome: { text: 'The statue glows.', effects: [...take('lightOfBlessing', 4), w('orbHeart')] } },
      { label: 'Offer 4 Sage\'s Wills: enhance a Sage', requires: { questCount: { sagesWill: 4 } }, outcome: { text: 'A Sage feels their vow grow stronger.', effects: [...take('sagesWill', 4), w('sageEnhance')] } },
      { label: 'Pray', outcome: { text: 'You feel watched over.', effects: [{ kind: 'hp', pct: 0.15 }] } },
    ] },
  { id: 'lightrootGrove', title: 'A Lightroot', art: 'lightDragon', regions: DEPTHS,
    text: 'A dead root in the dark, shaped like a shrine. Touch it and it might wake.',
    choices: [
      { label: 'Wake the Lightroot', outcome: { text: 'Light floods the Depths for a hundred paces. The Gloom on your soldiers melts away.', effects: [w('cureGloom'), q('lightrootBlessing'), w('stat', 1, 'exploreDepths')] } },
      { label: 'Search the lit ground', outcome: { text: 'Zonaite, glittering everywhere.', effects: [w('mats', 4, 'zonai')] } },
    ] },
  { id: 'skyviewTower', title: 'A Skyview Tower', art: 'purah', regions: SURFACE,
    text: 'A Purah Pad dock at the top of a tall tower, and a launch pad pointed at the sky islands.',
    choices: [
      { label: 'Activate it', outcome: { text: 'The map fills in, and the tower can launch you to the sky.', effects: [q('skyviewActivated'), w('stat', 1, 'exploreSurface'), w('stat', 1, 'exploreSky')] } },
      { label: 'Map the region', outcome: { text: 'You spot an extra route.', effects: [q('sheikahTowerMap')] } },
    ] },
  { id: 'yigaTraveler', title: 'A Friendly Traveler', art: 'yigaFootsoldier', regions: [...SURFACE, ...DEPTHS],
    text: 'A cheerful traveler waves you over. "Oh, a weary army! Have a banana."',
    choices: [
      { label: 'Accept the banana', gamble: { chance: 40,
        win: { text: 'It really was just a banana. A Mighty one.', effects: [{ kind: 'loot', ids: ['mightyBananaSkewer'] }] },
        lose: { text: 'The traveler flips into a Yiga! You beat him off, but not without wounds.', effects: [{ kind: 'hp', pct: -0.15 }, { kind: 'loot', ids: ['yigaHead', 'viciousSickle'] }] } } },
      { label: 'Expose him', outcome: { text: '"Curses!" He drops a schematic as he flees.', effects: [q('yigaSchematic')] } },
      { label: 'Offer to join the Yiga', outcome: { text: 'He looks delighted. A recruit, at least.', effects: [{ kind: 'recruit', pool: ['yigaFootsoldier', 'yigaEngineer'] }] } },
    ] },
  { id: 'zonaiDispenserEvent', title: 'A Device Dispenser', art: 'mineru', regions: [...SKY, ...DEPTHS, 'greatPlateau'],
    text: 'A Zonai dispenser with a coin slot shaped like a Zonai Charge.',
    choices: [
      { label: 'Feed it Zonaite (₹60)', cost: 60, outcome: { text: 'Clunk. Capsules roll out.', effects: [w('device', 2)] } },
      { label: 'Kick it', gamble: { chance: 40, win: { text: 'A capsule falls out.', effects: [w('device', 1)] }, lose: { text: 'Ow.', effects: [{ kind: 'hp', pct: -0.03 }] } } },
    ] },
  { id: 'autobuildSchema', title: 'A Schema Stone', art: 'tauro', regions: [...SKY, ...DEPTHS],
    text: 'A Zonai tablet etched with a construction diagram. Tauro reads it aloud, very excited.',
    choices: [
      { label: 'Take it (a new Autobuild blueprint)', outcome: { text: 'A blueprint, saved to your Zonai Arm — and kept for future campaigns.', effects: [q('autobuildSchemaStone'), w('blueprint')] } },
      { label: 'Study the ruins too', outcome: { text: 'Research notes and Zonaite.', effects: [w('stat', 1, 'research'), w('mats', 2, 'zonai')] } },
    ] },
  { id: 'bubbulfrogCave', title: 'A Bubbulfrog Cave', art: 'bubbulfrog', regions: [...SURFACE, ...DEPTHS],
    text: 'Something upside-down and glowing hangs from a cave ceiling. Koltin would love this.',
    choices: [
      { label: 'Catch it', gamble: { chance: 60, win: { text: 'A Bubbul Gem pops out!', effects: [w('mats', 1, 'bubbul')] }, lose: { text: 'It bubbles away.', effects: [] } } },
      { label: 'Trade a Bubbul Gem with Koltin', requires: { questCount: { bubbulGem: 1 } }, outcome: { text: '"Oh, it\'s beautiful!" He gives you something in return.', effects: [...take('bubbulGem', 1), { kind: 'loot', ids: ['bubbulGemPendant', 'lynelMask', 'evilSpiritHead'] }] } },
    ] },
  { id: 'lordOfTheMountain', title: 'The Lord of the Mountain', art: 'satori', regions: ['necluda', 'greatHyruleForest', 'hateno', 'akkala'],
    text: 'A glowing creature stands on the ridge, watching your army with too many eyes.',
    choices: [
      { label: 'Approach slowly', gamble: { chance: 25, win: { text: 'It steps down and walks beside you.', effects: [{ kind: 'recruit', pool: ['satori'] }] }, lose: { text: 'It vanishes. The animals around you seem calmer.', effects: [{ kind: 'support', amount: 1 }] } } },
      { label: 'Bow and let it go', outcome: { text: 'A blessing settles on you.', effects: [{ kind: 'loot', ids: ['satorisBlessing'] }] } },
    ] },
  { id: 'malanyasSpring', title: "Malanya's Spring", art: 'malanya', regions: ['necluda', 'hebra', 'centralHyrule'],
    text: 'Behind the Snowfield Stable, a tiny masked deity hums over a spring. "Have you lost a horse, little one?"',
    choices: [
      { label: 'Ask her to revive a fallen steed', outcome: { text: 'Light rises from the water and takes the shape of a horse.', effects: [w('reviveMount')] } },
      { label: 'Ask her to come along', gamble: { chance: 30, win: { text: '"Very well."', effects: [{ kind: 'recruit', pool: ['malanya'] }] }, lose: { text: '"No, no. I have horses to look after."', effects: [q('ponyPoint')] } } },
    ] },
  { id: 'dragonOverhead', title: 'A Dragon Overhead', art: 'dinraal', regions: ['eldinWild', 'faronWild', 'lanayruWild', 'hebra', 'gerudoWild', 'skyArchipelago'],
    text: 'A dragon loops overhead, scattering scales. One of your archers is already nocking an arrow.',
    choices: [
      { label: 'Shoot a scale loose', outcome: { text: 'A shard of dragon falls into the grass.', effects: [w('mats', 1, 'dragon')] } },
      { label: 'Follow it to its spring', gamble: { chance: 20, win: { text: 'It lands. It seems to want to come with you.', effects: [{ kind: 'recruit', pool: ['dinraal', 'naydra', 'farosh'] }] }, lose: { text: 'It climbs into the clouds and is gone.', effects: [{ kind: 'xp', amount: 10 }] } } },
    ] },
  { id: 'divineBeastAwakens', title: 'A Divine Beast Stirs', art: 'vahRuta', regions: ['lanayruWild', 'eldinWild', 'hebra', 'gerudoWild'],
    text: 'A Divine Beast stands still on the horizon, cleansed of Malice. It seems to be waiting for its Champion.',
    choices: [
      { label: 'Send a Champion aboard', requires: { unit: ['mipha', 'daruk', 'revali', 'urbosa', 'sidon', 'yunobo', 'tulin', 'riju'] }, outcome: { text: 'The beast lowers its head. It answers to you now.', effects: [{ kind: 'recruit', pool: ['vahRuta', 'vahRudania', 'vahMedoh', 'vahNaboris'] }] } },
      { label: 'Salvage what you can', outcome: { text: 'Ancient parts, still warm.', effects: [w('mats', 3, 'ancient')] } },
    ] },
  { id: 'tarreyTown', title: 'Tarrey Town', art: 'hudson', regions: ['akkala', 'necluda', 'hateno'],
    text: 'Hudson waves from a half-built house. "Bring me wood and I\'ll build you something nice!"',
    choices: [
      { label: 'Help build (₹200)', cost: 200, outcome: { text: 'A new camp workshop, Hudson-built.', effects: [w('stat', 1, 'construction')] } },
      { label: 'Ask for volunteers', outcome: { text: 'Someone with a hammer steps up.', effects: [{ kind: 'recruit', pool: ['hudson', 'granteson'] }] } },
    ] },
  { id: 'ancientTechLab', title: 'An Ancient Tech Lab', art: 'robbie', regions: ['hateno', 'akkala', 'centralHyrule'],
    text: 'A lab full of blue light and smoke. "Bring me ancient parts and I\'ll make you something incredible!"',
    choices: [
      { label: 'Research (+1 Research Level, ₹250)', cost: 250, outcome: { text: 'Notes, diagrams and a lot of excitement.', effects: [w('stat', 1, 'research')] } },
      { label: 'Trade an Ancient Core (ancient gear)', requires: { questCount: { ancientCore: 1 } }, outcome: { text: '"Ah! Perfect!"', effects: [...take('ancientCore', 1), { kind: 'loot', ids: ['ancientHead', 'ancientBody', 'ancientFeet', 'ancientShortSword', 'ancientBow', 'ancientSpear'] }] } },
      { label: 'Ask about the Purah Pad', outcome: { text: 'Purah hands over some map data.', effects: [q('purahPadItem')] } },
    ] },
  { id: 'depthsMineCache', title: 'An Abandoned Mine', art: 'yigaBlademaster', regions: DEPTHS,
    text: 'Rails, carts, a Construct asleep at the entrance, and Zonaite glittering in the walls.',
    choices: [
      { label: 'Mine Zonaite', outcome: { text: 'The carts fill up.', effects: [w('mats', 5, 'zonai')] } },
      { label: 'Wake the Construct', gamble: { chance: 50, win: { text: 'It salutes. A new soldier.', effects: [{ kind: 'recruit', pool: ['soldierConstruct2', 'soldierConstruct3', 'stewardConstruct', 'forgeConstruct'] }] }, lose: { text: 'It attacks, then falls apart.', effects: [{ kind: 'hp', pct: -0.08 }, w('mats', 2, 'zonai')] } } },
      { label: 'Search the Yiga storeroom', outcome: { text: 'A Yiga Schematic and an Old Map.', effects: [q('yigaSchematic'), q('oldMap')] } },
    ] },
  { id: 'pristinePedestal', title: 'A Pristine Weapon', art: 'phantomGanondorf', regions: DEPTHS,
    text: 'A weapon stands on a pedestal in the dark, guarded by the shadow of a soldier long gone.',
    choices: [
      { label: 'Fight the shadow for it', gamble: { chance: 65,
        win: { text: 'The shadow fades. The weapon is pristine, untouched by the Upheaval.', effects: [w('pristine')] },
        lose: { text: 'The shadow fights like a knight. You retreat.', effects: [{ kind: 'hp', pct: -0.12 }] } } },
      { label: 'Leave it be', outcome: { text: 'The shadow bows.', effects: [] } },
    ] },
  { id: 'sacredSpring', title: 'A Sacred Spring', art: 'lightDragon', regions: ['faronWild', 'eldinWild', 'lanayruWild', 'greatSkyIsland', 'finalTrial'],
    text: 'Light pours from a spring where a dragon once bathed. They say a dragon\'s heart can be called back to its body here.',
    choices: [
      { label: 'Bathe a dragon in the light', outcome: { text: 'A dragon in your army becomes who they were.', effects: [w('reverseForm')] } },
      { label: 'Drink from it', outcome: { text: 'The Gloom leaves you.', effects: [w('cureGloom'), { kind: 'hp', pct: 0.3 }] } },
    ] },
  { id: 'pennsScoop', title: 'Breaking News!', art: 'penn', regions: SURFACE,
    text: 'A Rito reporter lands in front of you. "Scoop! Have you seen the princess? No? Well, I have a tip anyway..."',
    choices: [
      { label: 'Follow the tip', outcome: { text: 'It leads to a stash of supplies.', effects: [{ kind: 'supplies', amount: 6 }, { kind: 'rupees', amount: 80 }] } },
      { label: 'Give him an interview', outcome: { text: 'Your army is famous now.', effects: [{ kind: 'xp', amount: 15 }, { kind: 'support', amount: 1 }] } },
    ] },
  { id: 'hinosForecast', title: 'A Blood Moon Forecast', art: 'hino', regions: SURFACE,
    text: 'A researcher with a red lens taps a chart. "The next Blood Moon rises soon. I can tell you exactly when."',
    choices: [
      { label: 'Listen (the Blood Moon comes later)', outcome: { text: 'You plan around it.', effects: [w('delayBloodMoon', 3)] } },
      { label: 'Ask her to come along', outcome: { text: '"For science!"', effects: [{ kind: 'recruit', pool: ['hino'] }] } },
    ] },
  { id: 'crystalRefineryEvent', title: 'A Crystal Refinery', art: 'mineruConstruct', regions: [...SKY, ...DEPTHS],
    text: 'A Zonai machine that turns Zonaite into crystallized energy, still humming.',
    choices: [
      { label: 'Refine (+10 Energy Cell capacity)', cost: 100, outcome: { text: 'The Energy Cell grows.', effects: [w('energyCap', 10)] } },
      { label: 'Take the stored charges', outcome: { text: 'Two crystallized charges.', effects: [q('crystallizedCharge'), q('crystallizedCharge')] } },
    ] },
];
