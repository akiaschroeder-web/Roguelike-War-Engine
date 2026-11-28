import type { EventDef } from '../../engine/types';
import { TF_ROUTE } from './regions';

const ALL = TF_ROUTE;

// Encounters on the march: Hytopia's street merchant, the Daily Riches stand, the Coliseum, the Doppel master,
// a fashion crowd, a stranded Hytopian, and Lady Maud's sister's letters.
export const EVENTS: EventDef[] = [
  { id: 'streetMerchantTF', title: 'The Street Merchant', art: 'madameCouture', regions: ALL,
    text: 'A Hytopian merchant has spread a blanket of oddments by the road: shells, shrooms, scraps of lace, a wooden doll that looks a lot like you.',
    choices: [
      { label: 'Buy a bundle of materials (₹120)', cost: 120, outcome: { text: 'Two materials, wrapped in tissue paper.', effects: [{ kind: 'triforce', op: 'material', amount: 2 }] } },
      { label: 'Buy the Doppel Doll (₹150)', cost: 150, outcome: { text: '"It\'s you! Well. It\'s wood. But it\'s you."', effects: [{ kind: 'loot', ids: ['doppelDoll'] }] } },
      { label: 'Haggle and leave', outcome: { text: 'You learn the price of everything.', effects: [{ kind: 'xp', amount: 10 }] } },
    ] },
  { id: 'dailyRiches', title: 'Daily Riches', art: 'kingTuft', regions: ALL,
    text: 'A booth with a hand-painted sign: DAILY RICHES. "One a day! Could be anything! Could be a butterfly!"',
    choices: [
      { label: 'Try your luck (₹100)', cost: 100, gamble: { chance: 50, win: { text: 'A rare material, glittering in a jar.', effects: [{ kind: 'triforce', op: 'rare' }] }, lose: { text: 'A Monster Guts. Lovely.', effects: [{ kind: 'triforce', op: 'material', id: 'monsterGutsTF', amount: 1 }] } } },
      { label: 'Walk on', outcome: { text: 'The vendor waves sadly.', effects: [] } },
    ] },
  { id: 'coliseumTF', title: 'The Coliseum', art: 'blueHero', regions: ['woodlandsTF', 'fortressTF', 'dunesTF', 'denOfTrialsTF'],
    text: 'In a ring of stone seats, heroes are knocking each other into a moat while a crowd cheers. A Hytopian with a megaphone waves you in.',
    choices: [
      { label: 'Spar for practice', outcome: { text: 'Bruised, soaked and better for it.', effects: [{ kind: 'xp', amount: 30 }, { kind: 'hp', pct: -0.08 }] } },
      { label: 'Practise Totems in front of the crowd', outcome: { text: 'Three high and nobody falls! The crowd throws Friendly Tokens.', effects: [{ kind: 'triforce', op: 'material', id: 'friendlyToken', amount: 2 }, { kind: 'support', amount: 2 }] } },
    ] },
  { id: 'doppelMaster', title: 'The Doppel Master', art: 'redHero', regions: ALL,
    text: 'An old man sits among a dozen wooden dolls, each carved in the shape of a hero. "Practise with these. They never complain when you drop them."',
    choices: [
      { label: 'Take two dolls', outcome: { text: 'They are surprisingly light.', effects: [{ kind: 'loot', ids: ['doppelDoll'] }, { kind: 'loot', ids: ['doppelDoll'] }] } },
      { label: 'Ask for a lesson in Totems', outcome: { text: '"Bottom moves. Top swings. Middle — middle tries not to look down."', effects: [{ kind: 'triforce', op: 'drill' }] } },
    ] },
  { id: 'fashionCrowd', title: 'The Fashion Crowd', art: 'styla', regions: ALL,
    text: 'A crowd of Hytopians stops dead in the road to look the army up and down. Somebody gasps. Somebody faints.',
    choices: [
      { label: 'Show off your outfits', outcome: { text: 'Applause, flowers, and Rupees for every outfit on show.', effects: [{ kind: 'triforce', op: 'fashionShow' }] } },
      { label: 'Hurry past', outcome: { text: 'They will be talking about your boots for a week.', effects: [] } },
    ] },
  { id: 'strandedHytopian', title: 'A Stranded Hytopian', art: 'kingTuft', regions: ['woodlandsTF', 'riversideTF', 'volcanoTF', 'iceCavernTF'],
    text: 'A Hytopian in a very impractical ballgown is stuck on a rock in the river. "I only came for the Fresh Kelp! It\'s in this season!"',
    choices: [
      { label: 'Rescue her', outcome: { text: 'She gives you everything in her basket.', effects: [{ kind: 'triforce', op: 'material', amount: 2 }, { kind: 'hp', pct: -0.05 }] } },
      { label: 'Ask the way to the boutique', outcome: { text: '"Madame Couture? Everyone knows Madame Couture!" She draws a map.', effects: [{ kind: 'xp', amount: 15 }] } },
    ] },
  { id: 'coutureLetters', title: 'Letters to a Sister', art: 'ladyMaud', regions: ['fortressTF', 'dunesTF', 'ruinsTF', 'skyRealmTF'],
    text: 'A bundle of letters tied with ribbon lies in the sand, all addressed in the same elegant hand: "To my dear Maud. Please come home." None were ever opened.',
    choices: [
      { label: 'Keep them for Madame Couture', outcome: { text: 'Some things are worth carrying.', effects: [{ kind: 'support', amount: 2 }, { kind: 'triforce', op: 'material', id: 'exquisiteLace', amount: 1 }] } },
      { label: 'Leave them where they lie', outcome: { text: 'The wind takes one of them away.', effects: [] } },
    ] },
];
