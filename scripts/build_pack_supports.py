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
}
SKIP = {'Epona', 'Four Giants', 'Ciela', 'OOT Potion Shopkeeper'}
CANON = {'ghirahimTrue': 'ghirahim', 'imprisonedArmed': 'imprisoned', 'imprisonedFlying': 'imprisoned', 'ganon': 'ganondorf', 'sheik': 'zelda',
         'lightDragon': 'zeldaWild', 'demonDragon': 'ganondorfWild', 'darkBeastGanonWild': 'calamityGanon', 'mineruConstruct': 'mineru'}
FORMS = {'kingOfRedLions': 'kingDaphnes', 'lightDragon': 'zeldaWild'}

pack = PACKS[sys.argv[1]]
DOC = (ROOT / pack['doc']).read_text()
body = DOC[DOC.index(pack['start']):DOC.index(pack['end'])]
names = {**COMMON, **SS_GLOBAL, **pack['names']}


def resolve(n, unresolved):
    n = n.strip()
    if n in SKIP:
        return None
    if n in names:
        return names[n]
    unresolved.add(n)
    return None


pairs, unresolved, section, last_left = [], set(), None, None
for line in body.splitlines():
    if line.startswith('### ') or (line.endswith(':') is False and re.match(r'^(Internal|Cross-pack):', line)):
        section = line[4:].strip() if line.startswith('### ') else line.split(':')[0]
    if re.match(r'^(Internal|Cross-pack):', line):
        section = line.split(':')[0]
        line = line.split(':', 1)[1]
    line = re.sub(r'\. S ranks can be.*$', '', line)
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
