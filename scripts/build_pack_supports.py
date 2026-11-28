#!/usr/bin/env python3
"""Parse a pack doc's support section (`A×B rank (theme) · …` entries, optionally under ### headings)
into src/content/supports/registry<Suffix>.ts, and write conversation-writer jobs.

Usage: python3 scripts/build_pack_supports.py wild|original [jobdir]
An entry starting with `×` (e.g. `×Young Link A`) reuses the previous entry's left-hand name.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / 'scripts' / 'build_supports.py').read_text()
COMMON = eval(src[src.index('COMMON = {') + len('COMMON = '):src.index('\n}\n', src.index('COMMON = {')) + 2])
ss = (ROOT / 'scripts' / 'build_ss_supports.py').read_text()
SS = eval(ss[ss.index('SS = {') + len('SS = '):ss.index('\n}\n', ss.index('SS = {')) + 2])
# Skyward Sword names a later pack's doc may use
SS_GLOBAL = {f'SS {k}' if not k.startswith('SS ') else k: v for k, v in SS.items()}
SS_GLOBAL.update({'Hero of the Sky': 'heroOfTheSky', 'Fi': 'fi', 'Hylia': 'hylia', 'Demise': 'demise', 'Ghirahim': 'ghirahim', 'Groose': 'groose',
                  'Gondo': 'gondo', 'Scrapper': 'scrapper', 'Skipper': 'skipper', 'Gorko': 'gorko', 'Levias': 'levias', 'Koloktos': 'koloktos',
                  'Stalmaster': 'stalmaster', 'Scaldera': 'scaldera', 'Beamos': 'beamos', 'Crimson Loftwing': 'crimsonLoftwing', 'Moldorm': 'moldorm',
                  'Majora': 'majorasMask', 'Midna': 'midnaImp', 'Gohma': 'queenGohma', 'Keese': 'keese', 'Green ChuChu': 'chuchuGreen',
                  'Red ChuChu': 'chuchuRed', 'Granny (WW)': 'grandma', 'Rauru (OoT)': 'rauru', 'OoT Rauru': 'rauru', 'OoT Impa': 'impa',
                  'Queen Rutela': 'rutela', 'Ancient Robot': 'scrapper', 'Captain Keeta': 'captainKeeta', 'Argorok': 'argorok', 'Stallord': 'stallord',
                  'Colgera': 'colgera', 'Lynel': 'lynel', 'OoT Ganondorf': 'ganondorf', 'OoT Zelda': 'zelda', 'Grandma (WW)': 'grandma'})

PACKS = {
    'wild': dict(doc='docs/era-of-the-wild-pack.md', start='## 29. Support Options', end='## 30. Group Supports', suffix='Wild', game='wild', names={
        'Wild Link': 'heroOfTheWild', 'Wild Zelda': 'zeldaWild', 'Zelda': 'zeldaWild', 'Ganondorf': 'ganondorfWild', 'Wild Ganondorf': 'ganondorfWild',
        'Mipha': 'mipha', 'Daruk': 'daruk', 'Revali': 'revali', 'Urbosa': 'urbosa', 'Sidon': 'sidon', 'Yunobo': 'yunobo', 'Tulin': 'tulin', 'Riju': 'riju',
        'Mineru': 'mineru', 'Rauru': 'rauruZonai', 'Zonai Rauru': 'rauruZonai', 'Sonia': 'sonia', 'King Rhoam': 'kingRhoam', 'Master Kohga': 'kohga',
        'Kohga': 'kohga', 'Maz Koshia': 'mazKoshia', 'Purah': 'purah', 'Robbie': 'robbie', 'Impa': 'impaWild', 'Paya': 'paya', 'Teba': 'teba',
        'Kass': 'kass', 'Yona': 'yona', 'Dorephan': 'dorephan', 'Muzu': 'muzu', 'Bludo': 'bludo', 'Buliara': 'buliara', 'Hudson': 'hudson',
        'Grantéson': 'granteson', 'Tauro': 'tauro', 'Penn': 'penn', 'Kilton': 'kilton', 'Koltin': 'koltin', 'Satori': 'satori', 'Malanya': 'malanya',
        'Yiga Engineer': 'yigaEngineer', 'Dinraal': 'dinraal', 'Naydra': 'naydra', 'Farosh': 'farosh', 'Light Dragon': 'lightDragon', 'Hero of the Wild': 'heroOfTheWild',
        'Calamity Ganon': 'calamityGanon', 'Phantom Ganondorf': 'phantomGanondorf', 'Boss Bokoblin': 'bossBokoblin', 'Stalnox': 'stalnox',
        'Igneo Talus': 'igneoTalus', 'Frost Talus': 'frostTalus', 'Molduga': 'molduga', 'Frox': 'frox', 'Flame Gleeok': 'gleeokFlame',
        'Frost Gleeok': 'gleeokFrost', 'Thunder Gleeok': 'gleeokThunder', 'Queen Gibdo': 'queenGibdo', 'Flux Construct': 'fluxConstruct3',
        'Guardian Stalker': 'guardianStalker', 'Guardian Scout IV': 'guardianScout4', 'Soldier Construct': 'soldierConstruct1',
    }),
    'original': dict(doc='docs/original-hyrule-pack.md', start='## 10. Supports', end='## 11. Commanders', suffix='Original', game='original', names={
        'Link': 'heroOfHyrule', 'Original Link': 'heroOfHyrule', 'Zelda': 'zeldaHyrule', 'Original Zelda': 'zeldaHyrule', 'Ganon': 'ganonHyrule',
        'Original Ganon': 'ganonHyrule', 'Old Man': 'oldMan', 'Old Woman': 'oldWoman', 'Merchant': 'merchantHyrule', 'Goriya': 'goriya',
        'Ghini': 'ghini', 'Vire': 'vire', 'Zol': 'zol', 'Gel': 'gel', 'Lanmola': 'lanmola', 'Aquamentus': 'aquamentus', 'Manhandla': 'manhandla',
        'Patra': 'patra', 'Digdogger': 'digdogger', 'Wild Zelda': 'zeldaWild', 'Hero of the Wild': 'heroOfTheWild', 'Wild Ganondorf': 'ganondorfWild',
        'Calamity Ganon': 'calamityGanon', 'King Rhoam': 'kingRhoam', 'Yona': 'yona', 'Flame Gleeok': 'gleeokFlame', 'Meg': 'meg', 'Syrup': 'syrup',
    }),
    'aol': dict(doc='docs/adventure-of-link-pack.md', start='## 11. Supports', end='## 12. New Commander', suffix='Aol', game='aol', names={
        'Sleeping Zelda': 'sleepingZelda', 'Hero of Hyrule': 'heroOfHyrule', 'Original Zelda': 'zeldaHyrule', 'Original Ganon': 'ganonHyrule',
        'Wild Zelda': 'zeldaWild', 'Sonia': 'sonia', 'King Rhoam': 'kingRhoam', 'Old Man': 'oldMan', 'Old Woman': 'oldWoman',
        'Rebonack': 'rebonack', 'Horsehead': 'horsehead', 'Gooma': 'gooma', 'Helmethead': 'helmethead', 'Carock': 'carock', 'Wizzrobe': 'wizzrobe',
        'Thunderbird': 'thunderbird', 'Fokka': 'fokka', 'Revali': 'revali', 'Moa': 'moa', 'Ghini': 'ghini', 'Bot': 'bot', 'Zol': 'zol',
        'Daira': 'daira', 'Doomknocker': 'doomknocker', 'Goriya': 'goriya', 'Lynel': 'lynel', 'Agahnim': 'agahnim',
    }),
    'legend': dict(doc='docs/era-of-legend-pack.md', start='## 14. Supports', end='## 15. Commanders', suffix='Legend', game='legend', names={
        'Link': 'heroOfLegend', 'Hero of Legend': 'heroOfLegend', 'Zelda': 'zeldaLegend', 'Ganon': 'ganonLegend', "Link's Uncle": 'linksUncle',
        'Sahasrahla': 'sahasrahla', 'Aginah': 'aginah', 'Syrup': 'syrup', 'Flute Boy': 'fluteBoy', 'Agahnim': 'agahnim', 'Marin': 'marin',
        'Tarin': 'tarin', 'BowWow': 'bowwow', 'Wind Fish': 'windFish', 'Din': 'din', 'Nayru': 'nayru', 'Farore': 'farore', 'Ralph': 'ralph',
        'Impa': 'impaOracle', 'Queen Ambi': 'queenAmbi', 'Ricky': 'ricky', 'Dimitri': 'dimitri', 'Moosh': 'moosh', 'Onox': 'onox', 'Veran': 'veran',
        'Shadow Nightmare': 'shadowNightmare', 'Holodrum Maku Tree': 'makuTreeHolodrum', 'Labrynna Maku Tree': 'makuTreeLabrynna',
        'Hero of Time': 'link', 'Hero of Winds': 'heroOfWinds', 'Hero of Twilight': 'heroOfTwilight', 'Hero of Hyrule': 'heroOfHyrule',
        'Sleeping Zelda': 'sleepingZelda', 'Sonia': 'sonia', 'Malon': 'malon', 'Lulu': 'lulu', 'Medli': 'medli', 'Kass': 'kass', 'Talon': 'talon',
        'Dinraal': 'dinraal', 'Eldin': 'eldinDragon', 'Purah': 'purah', 'Robbie': 'robbie', 'Sidon': 'sidon', 'Prince Ralis': 'ralis',
        'Light Dragon': 'lightDragon', 'Wild Ganondorf': 'ganondorfWild', 'Rauru (OOT)': 'rauru', 'Zelda (OOT)': 'zelda', 'OOT Ganondorf': 'ganondorf',
        'OOT Zelda': 'zelda', 'Iron Knuckle': 'ironKnuckle', 'Twinrova': 'twinrova', 'Darmani': 'darmani',
    }),
    'phantom': dict(doc='docs/phantom-hourglass-pack.md', start='## 12. Supports', end='## 13. Commanders', suffix='Phantom', game='phantom', names={
        'Hero of Winds': 'heroOfWinds', 'Tetra': 'tetra', 'Linebeck': 'linebeck', 'Ciela': 'ciela', 'Oshus': 'oshus', 'Jolene': 'jolene', 'Joanne': 'joanne',
        'Eddo': 'eddo', 'Bellum': 'bellum', 'Leaf': 'leaf', 'Neri': 'neri', 'Astrid': 'astrid', 'Zauz': 'zauz', 'Gongoron': 'gongoron',
        'Biggoron': 'biggoronGoronIsland', 'King Mutoh': 'kingMutoh', 'Bremeur': 'bremeur', 'Doylan': 'doylan', 'Max': 'max', 'Phantom': 'phantom',
        'Hero of Legend': 'heroOfLegend', 'Nayru': 'nayru', 'Din': 'din', 'Zelda (OoT)': 'zelda', 'Wind Fish': 'windFish', 'Biggoron (OoT)': 'biggoron',
        'Robbie': 'robbie', 'Purah': 'purah', 'Yunobo': 'yunobo', 'Anouki Warrior': 'anoukiWarrior', 'Anouki Hunter': 'anoukiHunter',
        'Anouki Ice Mage': 'anoukiIceMage', 'Anouki Guardian': 'anoukiGuardian', 'Yook Warrior': 'yookWarrior', 'Igos du Ikana': 'igosDuIkana',
        'Eox': 'eox', 'Shadow Nightmare': 'shadowNightmare', 'Anouki Chief': 'anoukiChief', 'Urbosa': 'urbosa', 'Sonia': 'sonia', 'Gondo': 'gondo',
        'Groose': 'groose', 'Koloktos': 'koloktos', 'Calamity Ganon': 'calamityGanon', 'Cubus Red': 'cubusSister1', 'Cubus Blue': 'cubusSister2',
        'Cubus Gold': 'cubusSister3', 'Cubus Green': 'cubusSister4', 'Syrup': 'syrup', 'Potion Shop Lady': 'potionShopLady', 'Old Woman': 'oldWoman',
        'Grandma': 'grandma', 'OoT Impa': 'impa', 'Rosa': 'rosa', 'Subrosian Chef': 'subrosianChef', 'Subrosian Blacksmith': 'subrosianBlacksmith', 'King of Red Lions': 'kingOfRedLions',
    }),
    'spirit': dict(doc='docs/spirit-tracks-pack.md', start='## 13. Supports', end='## 14. Commanders', suffix='Spirit', game='spirit',
        # Big Blin's pairs are in the doc's "Additions (batch 4)" section.
        extra='Internal: Big Blin×Miniblin S · Big Blin×Moblin A · Big Blin×Bulblin A · Big Blin×King Bulblin S · Big Blin×Boss Bokoblin A · Big Blin×Jolene A', names={
        'Link': 'heroOfSpirits', 'Hero of Spirits': 'heroOfSpirits', 'Zelda': 'zeldaST', 'ST Zelda': 'zeldaST', 'Alfonzo': 'alfonzo', 'Elder Niko': 'elderNiko',
        'Byrne': 'byrne', 'Ferrus': 'ferrus', 'Linebeck III': 'linebeck3', 'Anjean': 'anjean', 'Cole': 'cole', 'Malladus': 'malladus', 'Gage': 'gage',
        'Steem': 'steem', 'Carben': 'carben', 'Embrose': 'embrose', 'Rael': 'rael', 'Hero of Winds': 'heroOfWinds', 'Hero of Legend': 'heroOfLegend',
        'Hero of the Wild': 'heroOfTheWild', 'Tetra': 'tetra', 'Ciela': 'ciela', 'Midna': 'midnaImp', 'Fi': 'fi', 'Nayru': 'nayru', 'Young Niko': 'niko',
        'Gonzo': 'gonzo', 'Linebeck': 'linebeck', 'Jolene': 'jolene', 'Eddo': 'eddo', 'Robbie': 'robbie', 'Purah': 'purah', "Hero's Shade": 'herosShade',
        'Tingle': 'tingle', 'Ghirahim': 'ghirahim', 'Zant': 'zant', 'Oshus': 'oshus', 'Rauru (OoT)': 'rauru', 'Sahasrahla': 'sahasrahla', 'Saria': 'saria',
        'Anouki Chief': 'anoukiChief', 'Yeta': 'yeta', 'Medli': 'medli', 'Lulu': 'lulu', 'Darunia': 'darunia', 'Din': 'din', 'Nabooru': 'nabooru',
        'Aginah': 'aginah', 'Agahnim': 'agahnim', 'Veran': 'veran', 'Ganon': 'ganon', 'Demise': 'demise', 'Bellum': 'bellum', 'Majora': 'majorasMask',
        'Wrecker Phantom': 'wreckerPhantom', 'Goron Roller': 'goronRoller', 'Big Blin': 'bigBlin', 'Miniblin': 'miniblin', 'Moblin': 'moblin',
        'Bulblin': 'bulblin', 'King Bulblin': 'kingBulblin', 'Boss Bokoblin': 'bossBokoblin',
    }),
    'minish': dict(doc='docs/minish-cap-pack.md', start='## 13. Supports', end='### Groups', suffix='Minish', game='minish', names={
        'Link': 'heroOfMinish', 'Hero of the Minish': 'heroOfMinish', 'Zelda': 'zeldaMC', 'Minish Cap Zelda': 'zeldaMC', 'Ezlo': 'ezloMinish', 'Smith': 'smith',
        'Melari': 'melari', 'Swiftblade': 'swiftblade', 'Festari': 'festari', 'King Daltus': 'kingDaltus', 'Vaati': 'vaatiHylian', 'Gentari': 'gentari',
        'Librari': 'librari', 'Greatblade': 'greatblade', 'Grimblade': 'grimblade', 'Swiftblade the First': 'swiftbladeFirst', 'Potho': 'potho', 'Gregal': 'gregal',
        'Female Gyorg': 'gyorgFemale', 'Male Gyorg': 'gyorgMale', 'Hero of Time': 'link', 'Hero of Legend': 'heroOfLegend', 'Hero of Winds': 'heroOfWinds',
        'Hero of Spirits': 'heroOfSpirits', 'Hero of the Wild': 'heroOfTheWild', "Hero's Shade": 'herosShade', 'Skyward Sword Zelda': 'zeldaSS',
        'Spirit Tracks Zelda': 'zeldaST', 'Tetra': 'tetra', 'Navi': 'navi', 'Tatl': 'tatl', 'Ciela': 'ciela', 'Fi': 'fi', 'King of Red Lions': 'kingOfRedLions',
        'Midna': 'midnaImp', 'Anjean': 'anjean', 'Ghirahim': 'ghirahim', 'Zant': 'zant', 'Ganondorf': 'ganondorf', 'Majora': 'majorasMask', 'Bellum': 'bellum',
        'Malladus': 'malladus', 'Biggoron': 'biggoron', 'Zauz': 'zauz', 'Gondo': 'gondo', 'Subrosian Blacksmith': 'subrosianBlacksmith', 'Alfonzo': 'alfonzo',
        'Rusl': 'rusl', 'Great Deku Tree': 'dekuTree', 'Makar': 'makar', 'Saria': 'saria', 'Shad': 'shad', 'Robbie': 'robbie', 'Orca': 'orca', 'Darunia': 'darunia',
        'Dark Link': 'darkLink', 'King Daphnes': 'kingDaphnes', 'King Rhoam': 'kingRhoam', 'Zephos': 'zephos', 'Cyclos': 'cyclos', 'Mazaal': 'mazaal',
        'Gohdan': 'gohdan', 'Eox': 'eox', 'Koloktos': 'koloktos', 'Gyorg (MM)': 'gyorg', 'Mountain Minish Blacksmith': 'mountainMinishBlacksmith',
        'Goron Warrior': 'goronWarrior', 'Town Minish Tinkerer': 'townMinishTinkerer', 'Steward Construct': 'stewardConstruct',
    }),
    'fourswords': dict(doc='docs/four-swords-pack.md', start='## 12. Supports', end='### Groups', suffix='FourSwords', game='fourswords',
        # The doc's "Zelda × each Maiden", "each Maiden × every other Maiden" and "Maidens × their Sages" rows, expanded
        # (Forest → Saria, Fire → Darunia, Water → Ruto, Shadow → Impa, Light → Rauru, Spirit/Protection → Nabooru).
        extra='Internal: Zelda×Green Maiden S · Zelda×Red Maiden S · Zelda×Blue Maiden S · Zelda×Purple Maiden S · Zelda×Yellow Maiden S · Zelda×White Maiden S · Green Maiden×Red Maiden A · Green Maiden×Blue Maiden A · Green Maiden×Purple Maiden A · Green Maiden×Yellow Maiden A · Green Maiden×White Maiden A · Red Maiden×Blue Maiden A · Red Maiden×Purple Maiden A · Red Maiden×Yellow Maiden A · Red Maiden×White Maiden A · Blue Maiden×Purple Maiden A · Blue Maiden×Yellow Maiden A · Blue Maiden×White Maiden A · Purple Maiden×Yellow Maiden A · Purple Maiden×White Maiden A · Yellow Maiden×White Maiden A\nCross-pack: Green Maiden×Saria S · Red Maiden×Darunia S · Blue Maiden×Ruto S · Purple Maiden×Impa S · Yellow Maiden×Rauru S · White Maiden×Nabooru S', names={
        'Green Link': 'greenLink', 'Red Link': 'redLink', 'Blue Link': 'blueLink', 'Purple Link': 'purpleLink', 'Zelda': 'zeldaFS', 'Shadow Link': 'shadowLink',
        'Vaati': 'vaatiHylian', 'Ganon': 'ganonFSA', 'Green Maiden': 'greenMaiden', 'Red Maiden': 'redMaiden', 'Blue Maiden': 'blueMaiden',
        'Purple Maiden': 'purpleMaiden', 'Yellow Maiden': 'yellowMaiden', 'White Maiden': 'whiteMaiden', 'Hero of the Minish': 'heroOfMinish',
        'Hero of Time': 'link', 'Hero of Twilight': 'heroOfTwilight', 'Darunia': 'darunia', 'Hero of the Wild': 'heroOfTheWild', 'Greatblade': 'greatblade',
        'Hero of Winds': 'heroOfWinds', 'Tetra': 'tetra', 'Revali': 'revali', 'Ezlo': 'ezloMinish', 'Fi': 'fi', 'Nayru': 'nayru', 'Dark Link': 'darkLink',
        'Midna': 'midnaImp', 'Skull Kid': 'skullKid', 'Zant': 'zant', 'Phantom Ganon': 'phantomGanon', 'Ganondorf (OoT)': 'ganondorf',
        'Ganon (ALttP)': 'ganonLegend', 'Demise': 'demise', 'Cyclos': 'cyclos', 'Ghirahim': 'ghirahim', 'Saria': 'saria', 'Ruto': 'ruto', 'Impa': 'impa',
        'Rauru': 'rauru', 'Nabooru': 'nabooru',
    }),
    'lorule': dict(doc='docs/link-between-worlds-pack.md', start='## 12. Supports', end='### Groups', suffix='Lorule', game='lorule',
        # "Each Sage × every other Sage A", expanded (pairs listed above keep their own rank).
        extra='- Gulley × Osfala A\n- Gulley × Seres A\n- Gulley × Oren A\n- Gulley × Rosso A\n- Gulley × Irene A\n- Gulley × Impa A\n- Osfala × Seres A\n- Osfala × Oren A\n- Osfala × Rosso A\n- Osfala × Irene A\n- Osfala × Impa A\n- Seres × Oren A\n- Seres × Rosso A\n- Seres × Irene A\n- Seres × Impa A\n- Oren × Rosso A\n- Oren × Irene A\n- Oren × Impa A\n- Rosso × Irene A\n- Rosso × Impa A\n- Irene × Impa A', names={
        'Link': 'linkALBW', 'ALBW Link': 'linkALBW', 'Zelda': 'zeldaALBW', 'Hilda': 'hilda', 'Ravio': 'ravio', 'Yuga': 'yuga', 'Yuga Ganon': 'yugaGanon',
        'Sheerow': 'sheerow', 'Gramps': 'gramps', 'Mother Maiamai': 'motherMaiamai', 'Baby Maiamai': 'babyMaiamai', 'Lorulean Blacksmith': 'loruleanBlacksmith',
        'Thief Girl': 'thiefGirl', 'Gulley': 'gulley', 'Osfala': 'osfala', 'Seres': 'seres', 'Oren': 'oren', 'Rosso': 'rosso', 'Irene': 'irene', 'Impa': 'impaALBW',
        'Hero of Legend': 'heroOfLegend', 'Hero of Time': 'link', "Link's Uncle": 'linksUncle', 'Beedle': 'beedle', 'Tingle': 'tingle', 'Linebeck': 'linebeck',
        'Midna': 'midnaImp', 'Tetra': 'tetra', 'Minish Cap Zelda': 'zeldaMC', 'Ganondorf': 'ganondorf', 'Agahnim': 'agahnim', 'Vaati': 'vaatiHylian',
        'Ghirahim': 'ghirahim', 'Phantom Ganon': 'phantomGanon', "Hero's Shade": 'herosShade', 'Swiftblade the First': 'swiftbladeFirst', 'Syrup': 'syrup',
        'Koume': 'koume', 'Kotake': 'kotake', 'Ruto': 'ruto', 'Mipha': 'mipha', 'Rutela': 'rutela', 'King Zora': 'kingZora', 'Darunia': 'darunia',
        'Biggoron': 'biggoron', 'Melari': 'melari', 'Smith': 'smith', 'Sahasrahla': 'sahasrahla', 'Nabooru': 'nabooru', 'Flute Boy': 'fluteBoy',
        'Stalblind': 'stalblind', 'Blind the Thief': 'blind', 'Gemesaur King': 'gemesaurKing', 'Helmasaur King': 'helmasaurKing', 'Gigabari': 'gigabari',
        'Barinade': 'barinade',
    }),
    'echoes': dict(doc='docs/echoes-of-wisdom-pack.md', start='## 15. Supports', end='### Groups', suffix='Echoes', game='echoes',
        names={
        'Zelda': 'zeldaEoW', 'EoW Zelda': 'zeldaEoW', 'Link': 'linkEoW', 'EoW Link': 'linkEoW', 'Tri': 'tri', 'King': 'kingEoW', 'Impa': 'impaEoW',
        'Dohna': 'dohna', 'Condé': 'conde', 'Tekom': 'tekom', 'Lueburry': 'lueburry', 'Wright': 'generalWright', 'Lefte': 'ministerLefte',
        'Seera': 'chiefSeera', 'Darston': 'darston', 'Dradd': 'dradd', 'Kushara': 'kushara', 'Dampe': 'dampeEoW', 'Null': 'nullEoW', 'Stamp Guy': 'stampGuy',
        'OoT Zelda': 'zelda', 'Hero of Time': 'link', 'Hero of Legend': 'heroOfLegend', 'Fi': 'fi', 'Navi': 'navi', 'Ciela': 'ciela', 'Ezlo': 'ezloMinish',
        'Queen of Fairies': 'queenOfFairies', 'Dark Link': 'darkLink', 'Demise': 'demise', 'Majora': 'majorasMask', 'Calamity Ganon': 'calamityGanon',
        'Darunia': 'darunia', 'Yunobo': 'yunobo', 'Yeto': 'yeto', 'Yeta': 'yeta', 'Ruto': 'ruto', 'Mipha': 'mipha', 'Urbosa': 'urbosa', 'Nabooru': 'nabooru',
        'Robbie': 'robbie', 'Mineru': 'mineru', 'Purah': 'purah', 'Gondo': 'gondo', 'Tingle': 'tingle', 'Seismic Talus': 'seismicTalus',
        'Stone Talus': 'stoneTalus', 'Skorchill': 'skorchill', 'Blizzeta': 'blizzeta',
        # Partners from the A Link Between Worlds and Four Swords packs
        'ALBW Zelda': 'zeldaALBW', 'Hilda': 'hilda', 'Ravio': 'ravio', 'Oren': 'oren', 'Shadow Link': 'shadowLink', 'Yuga': 'yuga',
    }),
}
SKIP = {'Epona', 'Four Giants', 'OOT Potion Shopkeeper', 'OoT Potion Shopkeeper', 'Cubus Sisters',
        # Four Swords: rows the pack entry expands into concrete pairs
        'each Shrine Maiden', 'Each Maiden', 'every other Maiden', 'Shrine Maidens', 'their corresponding Sages'}
CANON = {'ghirahimTrue': 'ghirahim', 'imprisonedArmed': 'imprisoned', 'imprisonedFlying': 'imprisoned', 'ganon': 'ganondorf', 'sheik': 'zelda',
         'lightDragon': 'zeldaWild', 'demonDragon': 'ganondorfWild', 'darkBeastGanonWild': 'calamityGanon', 'mineruConstruct': 'mineru'}
FORMS = {'kingOfRedLions': 'kingDaphnes', 'lightDragon': 'zeldaWild'}

pack = PACKS[sys.argv[1]]
DOC = (ROOT / pack['doc']).read_text()
body = DOC[DOC.index(pack['start']):DOC.index(pack['end'])] + '\n' + pack.get('extra', '')
names = {**COMMON, **SS_GLOBAL, **pack['names']}


def resolve(n, unresolved):
    n = n.strip()
    if n in SKIP:
        return None
    if n in pack.get('skip', ()):
        DEFERRED.add(n)
        return None
    if n in names:
        return names[n]
    unresolved.add(n)
    return None


DEFERRED = set()
pairs, unresolved, section, last_left = [], set(), None, None
for line in body.splitlines():
    if line.startswith('### ') or (line.endswith(':') is False and re.match(r'^(Internal|Cross-pack):', line)):
        section = line[4:].strip() if line.startswith('### ') else line.split(':')[0]
    if re.match(r'^(Internal|Cross-pack):', line):
        section = line.split(':')[0]
        line = line.split(':', 1)[1]
    line = re.sub(r'\. S ranks can be.*$', '', line)
    line = re.sub(r'^\s*-\s+', '', line)  # bulleted lists (one pair per line)
    for entry in [e.strip().rstrip('.') for e in line.split(' · ') if '×' in e and '`' not in e]:
        m = re.match(r'^(.*?)×(.+?) ([ABS])(?: \((.*)\))?$', entry)
        if not m:
            print('SKIP ENTRY', entry, file=sys.stderr)
            continue
        left = m.group(1).strip() or last_left
        last_left = left
        right, mx, theme = m.group(2), m.group(3), m.group(4) or ''
        a, b = resolve(left, unresolved), resolve(right, unresolved)
        if not a or not b:
            continue
        form = a if a in FORMS else b if b in FORMS else None
        a, b = FORMS.get(a, a), FORMS.get(b, b)
        pairs.append(dict(a=CANON.get(a, a), b=CANON.get(b, b), max=mx, theme=theme, section=section or '', names=[left, right], form=form))

existing = set()
for f in (ROOT / 'src/content/supports').glob('registry*.ts'):
    if f.name != f"registry{pack['suffix']}.ts":
        existing |= set(re.findall(r"key: '([^']+)'", f.read_text()))
seen, out = set(), []
for p in pairs:
    k = '|'.join(sorted([p['a'], p['b']])) + ('#' + p['form'] if p.get('form') else '')
    if k in seen or p['a'] == p['b']:
        continue
    seen.add(k)
    if k in existing:
        print('ALREADY REGISTERED', k, file=sys.stderr)
        continue
    p['key'] = k
    out.append(p)
if DEFERRED:
    print('DEFERRED (pairs skipped):', sorted(DEFERRED), file=sys.stderr)
if unresolved:
    print('UNRESOLVED:', sorted(unresolved), file=sys.stderr)
print(len(out), 'pairs', file=sys.stderr)

rows = []
for p in out:
    theme = p['theme'].replace('\\', '\\\\').replace("'", "\\'")
    form = f", form: '{p['form']}'" if p.get('form') else ''
    rows.append(f"  {{ key: '{p['key']}', a: '{p['a']}', b: '{p['b']}', max: '{p['max']}', game: '{pack['game']}', theme: '{theme}'{form} }},")
suffix = pack['suffix']
(ROOT / f'src/content/supports/registry{suffix}.ts').write_text(
    f"// Generated by scripts/build_pack_supports.py from {pack['doc']}. Do not edit by hand.\n"
    "import type { SupportPairDef } from './registry';\n\n"
    f"export const SUPPORT_REGISTRY_{suffix.upper()}: SupportPairDef[] = [\n" + "\n".join(rows) + "\n];\n")

if len(sys.argv) > 2:
    jobdir = Path(sys.argv[2]); jobdir.mkdir(parents=True, exist_ok=True)
    jobs = [dict(key=p['key'], speakerA=p['key'].split('#')[0].split('|')[0], speakerB=p['key'].split('#')[0].split('|')[1], docNames=p['names'],
                 max=p['max'], ranks=['C', 'B', 'A'] + (['S'] if p['max'] == 'S' else []), theme=p['theme'], section=p['section'],
                 **({'form': p['form']} if p.get('form') else {})) for p in out]
    (jobdir / f"{sys.argv[1]}_all.json").write_text(json.dumps(jobs, ensure_ascii=False, indent=1))
