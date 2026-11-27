import type { FactionDef } from '../../engine/types';

export const FACTIONS: FactionDef[] = [
  { id: 'vaatisMinions', name: "Vaati's Minions", desc: 'Darknuts, Ball and Chain Soldiers and Wizzrobes in the Wind Sorcerer\'s pay, with the stone-cursed soldiers of the castle.',
    units: ['darknut', 'ballChainSoldier', 'wizzrobe', 'eyegoreStatue'], leaders: ['vaatiHylian'], regions: { fortressOfWinds: 2, palaceOfWinds: 3, darkHyruleCastle: 5, royalValley: 1 } },
  { id: 'hyruleRoyalGuard', name: 'The Royal Guard of Hyrule', desc: 'King Daltus\'s soldiers, knights and archers — under Vaati\'s spell, they march against anyone.',
    units: ['hyruleSoldier', 'hyruleSoldier', 'hyruleKnight', 'hyruleArcher'], leaders: ['kingDaltus'], regions: { hyruleTownMC: 2, darkHyruleCastle: 2, royalValley: 1 } },
];

export const MONSTER_CHANCE: Record<string, number> = {
  hyruleTownMC: 70, minishWoods: 95, minishVillage: 95, deepwoodShrine: 95, mountCrenel: 90, caveOfFlames: 95, castorWilds: 90, windRuins: 85,
  fortressOfWinds: 80, royalValley: 85, lakeHyliaMC: 90, templeOfDroplets: 95, veilFalls: 90, cloudTops: 85, palaceOfWinds: 70, darkHyruleCastle: 55,
};
