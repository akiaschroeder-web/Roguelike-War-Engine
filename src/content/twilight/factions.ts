import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'bulblinRaiders', name: 'Bulblin Raiders', desc: 'Horn-blowing raiders on Bullbos, burning everything they ride past.',
    units: ['bulblin', 'bulblin', 'bulblinArcher', 'wildBullbo'], leaders: ['kingBulblin'], regions: { ordonProvince: 5, hyruleFieldTP: 7, gerudoDesertTP: 3 } },
  { id: 'resistance', name: 'The Resistance', desc: 'Telma\'s friends, who take you for Zant\'s spies.',
    units: ['hyruleSoldier', 'hyruleArcher', 'hyruleKnight'], leaders: ['rusl', 'ashei', 'telma', 'auru'], regions: { hyruleFieldTP: 3, hyruleCastleTP: 3, lanayruProvince: 2 } },
  { id: 'goronMiners', name: 'Goron Miners', desc: 'Gorons under the Fused Shadow\'s spell, rolling down on outsiders.',
    units: ['goronWarrior', 'goronWarrior', 'goronWarrior'], leaders: ['gorCoron', 'darbus'], regions: { eldinProvince: 5 } },
  { id: 'usurpersArmy', name: "Usurper's Army", desc: 'Shadow Beasts and Twilit monsters loyal to Zant.',
    units: ['shadowBeast', 'shadowBeast', 'shadowBulblin', 'shadowKargarok', 'shadowKeese'], leaders: ['zant'], regions: { twilightRealm: 8, faronWoods: 2, eldinProvince: 2, lanayruProvince: 2 } },
  { id: 'darkLordsLegion', name: "Dark Lord's Legion", desc: 'Ganondorf\'s elite: Darknuts, Aeralfos and ReDead Knights.',
    units: ['darknut', 'aeralfos', 'redeadKnight', 'lizalfos', 'dinolfos'], leaders: ['ganondorfTP'], regions: { hyruleCastleTP: 7, gerudoDesertTP: 2 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  ordonProvince: 60, faronWoods: 85, eldinProvince: 60, lanayruProvince: 80, hyruleFieldTP: 55, gerudoDesertTP: 75, snowpeak: 90, sacredGrove: 85,
  cityInTheSky: 85, twilightRealm: 70, hyruleCastleTP: 60,
};
