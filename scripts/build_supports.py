#!/usr/bin/env python3
"""Parse docs/support-expansion.md into src/content/supports/registry.ts.

Each pairing row becomes { a, b, max, theme, section, form? } with canonical template ids.
Usage: python3 scripts/build_supports.py
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOC = (ROOT / 'docs' / 'support-expansion.md').read_text()

# Names valid everywhere
COMMON = {
 'Young Link': 'youngLink', 'Hero of Time': 'link', 'Termina Link': 'terminaLink', 'Hero of Winds': 'heroOfWinds', 'Hero of Twilight': 'heroOfTwilight',
 "Hero's Shade": 'herosShade', 'Dark Link': 'darkLink', 'Fierce Deity Link': 'fierceDeityLink', 'Deku Link': 'dekuLink', 'Goron Link': 'goronLink',
 'Zora Link': 'zoraLink', 'Giant Link': 'giantLink', 'Wolf Link': 'wolfLink',
 'OOT Zelda': 'zelda', 'TP Zelda': 'zeldaTP', 'Tetra': 'tetra', 'Sheik': 'sheik', 'Impa': 'impa', 'Malon': 'malon', 'Ruto': 'ruto', 'Saria': 'saria', 'Navi': 'navi',
 'Darunia': 'darunia', 'Nabooru': 'nabooru', 'Rauru': 'rauru', 'Mido': 'mido', 'Great Deku Tree': 'dekuTree', 'Happy Mask Salesman': 'maskSalesman',
 'King Zora': 'kingZora', 'Jabu-Jabu': 'jabuJabu', 'Dampé': 'dampe', 'Kaepora Gaebora': 'kaepora', 'Talon': 'talon', 'Ingo': 'ingo', 'Carpenter Boss': 'carpenterBoss',
 'Biggoron': 'biggoron', 'Medigoron': 'medigoron', 'Great Fairy': 'greatFairy', 'Koume': 'koume', 'Kotake': 'kotake', 'Phantom Ganon': 'phantomGanon',
 'Volvagia': 'volvagia', 'Queen Gohma': 'queenGohma', 'Barinade': 'barinade', 'Bongo Bongo': 'bongoBongo', 'Morpha': 'morpha', 'Stalfos': 'stalfos',
 'Moblin': 'moblin', 'Iron Knuckle': 'ironKnuckle', 'Business Scrub': 'businessScrub', 'Deku Scrub': 'dekuScrub', 'King Dodongo': 'kingDodongo',
 'Joelle': 'joelle', 'Beth': 'beth', 'Amy': 'amy', 'Meg': 'meg',
 'Tatl': 'tatl', 'Tael': 'tael', 'Skull Kid': 'skullKid', 'Kafei': 'kafei', 'Anju': 'anju', 'Deku Princess': 'dekuPrincess', 'Deku King': 'dekuKing',
 'Darmani': 'darmani', 'Mikau': 'mikau', 'Lulu': 'lulu', 'Captain Keeta': 'captainKeeta', 'Keeta': 'captainKeeta', 'Igos': 'igosDuIkana', 'Majora': 'majorasMask',
 'Tingle': 'tingle', 'Giant Turtle': 'giantTurtle', 'Odolwa': 'odolwa', 'Goht': 'goht', 'Gyorg': 'gyorg', 'Red Twinmold': 'redTwinmold', 'Blue Twinmold': 'blueTwinmold',
 'Royal Servant I': 'ikanaServant1', 'Royal Servant II': 'ikanaServant2', 'Sharp': 'sharp', 'Flat': 'flat', 'Garo Master': 'garoMaster', 'Gomess': 'gomess',
 'Woodfall Giant': 'woodfallGiant', 'Snowhead Giant': 'snowheadGiant', 'Great Bay Giant': 'greatBayGiant', 'Ikana Giant': 'ikanaGiant', 'Gekko': 'gekko', 'Snapper': 'snapper',
 'Wart': 'wart', 'Aryll': 'aryll', 'Grandma': 'grandma', 'King Daphnes': 'kingDaphnes', 'Medli': 'medli', 'Makar': 'makar', 'Komali': 'komali', 'Orca': 'orca',
 'Sturgeon': 'sturgeon', 'Niko': 'niko', 'Beedle': 'beedle', 'Salvatore': 'salvatore', 'Mila': 'mila', 'Valoo': 'valoo', 'Jabun': 'jabun', 'Queen of Fairies': 'queenOfFairies',
 'Gonzo': 'gonzo', 'Fishman': 'fishman', 'Lenzo': 'lenzo', 'Quill': 'quill', 'Rito Chieftain': 'ritoChieftain', 'Laruto': 'laruto', 'Fado': 'fado',
 'Zephos': 'zephos', 'Cyclos': 'cyclos', 'Helmaroc King': 'helmarocKing', 'Puppet Ganon': 'puppetGanonBeast', 'Darknut': 'darknut', 'Kargaroc': 'kargaroc',
 'WW Gohma': 'gohmaWW', 'Kalle Demos': 'kalleDemos', 'Gohdan': 'gohdan', 'Jalhalla': 'jalhalla', 'Molgera': 'molgera', 'Molgera Larva': 'molgeraLarva',
 'Mighty Darknut': 'mightyDarknut', 'Bokoblin': 'bokoblin', 'Miniblin': 'miniblin', 'Mothula': 'mothula', 'Morth': 'morth', 'Big Octo': 'bigOcto',
 'Midna': 'midnaImp', 'Ilia': 'ilia', 'Colin': 'colin', 'Rusl': 'rusl', 'Mayor Bo': 'mayorBo', 'Malo': 'malo', 'Renado': 'renado', 'Ashei': 'ashei', 'Auru': 'auru',
 'Shad': 'shad', 'Telma': 'telma', 'Ralis': 'ralis', 'Queen Rutela': 'rutela', 'Yeto': 'yeto', 'Yeta': 'yeta', 'Ooccoo': 'ooccoo', 'King Bulblin': 'kingBulblin',
 'Zant': 'zant', 'Ordona': 'ordona', 'Faron': 'faron', 'Eldin': 'eldin', 'Lanayru': 'lanayru', 'Agitha': 'agitha', 'Jovani': 'jovani', 'Barnes': 'barnes',
 'Gor Coron': 'gorCoron', 'Darbus': 'darbus', 'Dangoro': 'dangoro', 'Fyrus': 'fyrus', 'Blizzeta': 'blizzeta', 'Postman': 'postman', 'Argorok': 'argorok',
 'Shadow Beast': 'shadowBeast', 'Phantom Zant': 'phantomZant', 'Stallord': 'stallord', 'Lord Bullbo': 'lordBullbo', 'Bulblin': 'bulblin', 'Bulblin Archer': 'bulblinArcher',
 'Bullbo': 'wildBullbo', 'Shadow Kargarok': 'shadowKargarok', 'Shadow Bulblin': 'shadowBulblin', 'Darkhammer': 'darkhammer', 'Death Sword': 'deathSword',
 'Aeralfos': 'aeralfos', 'Lizalfos': 'lizalfos', 'Dinolfos': 'dinolfos', 'Ook': 'ook', "Ook's Parasite": 'ooksParasite', 'Deku Toad': 'dekuToad', 'Toadpoli': 'toadpoli',
 'Armogohma': 'armogohma', 'Diababa': 'diababa', 'Morpheel': 'morpheel', 'Redead Knight': 'redeadKnight', 'White Wolfos': 'whiteWolfos', 'Freezard': 'freezard',
 'Chilfos': 'chilfos', 'Deku Baba': 'dekuBaba', 'Boko Baba': 'bokoBaba', 'Baba Serpent': 'babaSerpent', 'Fire Keese': 'fireKeese',
 'OOT Ganondorf': 'ganondorf', 'WW Ganondorf': 'ganondorfWW', 'TP Ganondorf': 'ganondorfTP',
 # Monster family shorthand
 'Red Bubble': 'redBubble', 'Blue Bubble': 'blueBubble', 'Green Bubble': 'greenBubble', 'Skull Bubble': 'skullBubble',
 # Generic units
 'Hyrule Soldier': 'hyruleSoldier', 'Hyrule Archer': 'hyruleArcher', 'Hyrule Knight': 'hyruleKnight', 'Hyrule Cavalry': 'hyruleCavalry', 'Rito Archer': 'ritoArcher',
 'Kokiri Scout': 'kokiriScout', 'Kokiri Slingshooter': 'kokiriSlingshooter', 'Korok Scout': 'korokScout', 'Deku Flower Scout': 'dekuFlowerScout',
 'Goron Warrior': 'goronWarrior', 'Goron Roller': 'goronRoller', 'Zora Warrior': 'zoraWarrior', 'Zora Mystic': 'zoraMystic', 'Rito Warrior': 'ritoWarrior',
 'Gerudo Guard': 'gerudoGuard', 'Gerudo Thief': 'gerudoThief', 'Pirate Deckhand': 'nudge', 'Sheikah Warrior': 'sheikahWarrior', 'Deku Soldier': 'dekuSoldier',
 'Deku Royal Guard': 'dekuRoyalGuard', 'Deku Mystic': 'dekuMystic', 'Korok Healer': 'korokHealer', 'Rito Scout': 'ritoScout', 'Deku Bombardier': 'dekuBombardier',
 'Pirate Cannoneer': 'mako', 'Rito Courier': 'ritoCourier', 'Rito Guardian': 'ritoGuardian', 'Rito Windcaller': 'ritoWindcaller', 'Korok Wind Mage': 'korokWindMage',
 'Korok Planter': 'korokPlanter', 'Pirate Swordsman': 'senza', 'Pirate Grappler': 'pirateGrappler', 'Pirate Lookout': 'zuko', 'Stalchild': 'stalchild',
}
# Names whose meaning depends on the section (game)
BY_SECTION = {
 'oot': {'Link': 'link', 'Zelda': 'zelda', 'Ganondorf': 'ganondorf'},
 'mm': {'Link': 'terminaLink', 'Zelda': 'zelda', 'Ganondorf': 'ganondorf', 'Darunia': 'darunia', 'Ruto': 'ruto'},
 'ww': {'Link': 'heroOfWinds', 'Zelda': 'tetra', 'Ganondorf': 'ganondorfWW', 'Gohma': 'gohmaWW', 'Great Fairy': 'greatFairy'},
 'tp': {'Link': 'heroOfTwilight', 'Zelda': 'zeldaTP', 'Ganondorf': 'ganondorfTP'},
 'cross': {'Ganondorf': 'ganondorf', 'Zelda': 'zelda'},
}
# ChuChu and Bubble family shorthand (inside those tables only)
CHU = {'Red': 'chuchuRed', 'Green': 'chuchuGreen', 'Yellow': 'chuchuYellow', 'Blue': 'chuchuBlue', 'Arrow': 'arrowChuchu', 'Dark': 'darkChuchu', 'Purple': 'purpleChuchu', 'Rare': 'rareChuchu'}
BUB = {'Red': 'redBubble', 'Blue': 'blueBubble', 'Green': 'greenBubble', 'White': 'whiteBubble', 'Bubble': 'bubbleMM', 'Skull Bubble': 'skullBubble'}
# Forms that share a character's progression
CANON = {'sheik': 'zelda', 'zeldaWW': 'tetra', 'kingOfRedLions': 'kingDaphnes', 'majorasIncarnation': 'majorasMask', 'majorasWrath': 'majorasMask',
         'wolfLink': 'heroOfTwilight', 'dekuLink': 'terminaLink', 'goronLink': 'terminaLink', 'zoraLink': 'terminaLink', 'fierceDeityLink': 'terminaLink',
         'giantLink': 'terminaLink', 'midnaTrue': 'midnaImp', 'fusedShadowMidna': 'midnaImp', 'ironKnuckleNabooru': 'nabooru', 'ganon': 'ganondorf'}
SKIP = {'Epona', 'Four Giants'}

section = None; game = 'oot'; table = None
pairs = []; unresolved = set()
lines = DOC.splitlines()
for i, line in enumerate(lines):
    s = line.strip()
    m = re.match(r'^(\d)\. (.+)$', s)
    if m:
        n = int(m.group(1))
        game = {1: 'oot', 2: 'mm', 3: 'ww', 4: 'tp', 5: 'cross', 6: 'monster', 7: 'generic', 8: 'group', 9: 'examples'}.get(n, game)
        continue
    if not s or '\t' not in s:
        if s and len(s) < 60 and not s.endswith('.'): section = s
        continue
    cols = s.split('\t')
    if cols[0] in ('Character pairing', 'Pairing', 'Unit pairing', 'Partner', 'Required form', 'Rank', 'Group support'):
        table = cols[0]; continue
    if game in ('group', 'examples'): continue
    form = None
    if table == 'Required form':
        form_name, partner, mx, theme = cols[0], cols[1], cols[2], cols[3]
        left, right = form_name, partner
        form = COMMON.get(form_name)
    elif table == 'Partner':  # Wolf Link-specific
        left, right, mx, theme = 'Wolf Link', cols[0], cols[1], cols[2]
        form = 'wolfLink'
    else:
        if len(cols) < 3 or '×' not in cols[0]: continue
        left, right = [x.strip() for x in cols[0].split('×')]
        mx, theme = cols[1], cols[2]
    def resolve(name):
        if name in SKIP: return None
        if game == 'monster' and section and 'ChuChu' in section and name in CHU: return CHU[name]
        if game == 'monster' and section and 'Bubble' in section and name in BUB: return BUB[name]
        if name in BY_SECTION.get(game, {}): return BY_SECTION[game][name]
        if name in COMMON: return COMMON[name]
        if name in BY_SECTION['oot']: return BY_SECTION['oot'][name]
        unresolved.add(f'{game}:{name}'); return None
    a, b = resolve(left), resolve(right)
    if not a or not b: continue
    ca, cb = CANON.get(a, a), CANON.get(b, b)
    if form is None and (a in CANON or b in CANON) and a not in ('sheik',) and b not in ('sheik',):
        form = a if a in CANON else b
    if form == 'sheik': form = None
    pairs.append({'a': ca, 'b': cb, 'max': mx.strip(), 'theme': theme.strip(), 'game': game, 'section': section or '', **({'form': form} if form else {}),
                  'names': [left, right]})

# Dedupe (keep the first; merge forms)
seen = {}
out = []
for p in pairs:
    k = '|'.join(sorted([p['a'], p['b']])) + ('#' + p['form'] if p.get('form') else '')
    if k in seen: continue
    seen[k] = 1
    p['key'] = k
    out.append(p)
if unresolved: print('UNRESOLVED:', sorted(unresolved), file=sys.stderr)
print(len(out), 'pairs', file=sys.stderr)
(ROOT / 'src' / 'content' / 'supports').mkdir(parents=True, exist_ok=True)
rows = []
for p in out:
    extra = f", form: '{p['form']}'" if p.get('form') else ''
    theme = p['theme'].replace('\\', '\\\\').replace("'", "\\'")
    rows.append(f"  {{ key: '{p['key']}', a: '{p['a']}', b: '{p['b']}', max: '{p['max']}', game: '{p['game']}', theme: '{theme}'{extra} }},")
(ROOT / 'src/content/supports/registry.ts').write_text(
    "// Generated by scripts/build_supports.py from docs/support-expansion.md. Do not edit by hand.\n"
    "// Every support pairing: canonical template ids (forms share their character's bond), the highest rank,\n"
    "// and the conversation theme. Form-specific conversations carry `form` (the form that must be fighting).\n\n"
    "export interface SupportPairDef { key: string; a: string; b: string; max: 'B' | 'A' | 'S'; game: string; theme: string; form?: string }\n\n"
    "export const SUPPORT_REGISTRY: SupportPairDef[] = [\n" + "\n".join(rows) + "\n];\n")
# Writing jobs for the conversation writers
names = {x[0]: x[1] for x in json.load(open('/tmp/claude-0/-home-user-Roguelike-War-Engine/91d671a8-e632-5830-91d4-4b1413c89fd5/scratchpad/names.json'))}
existing = set(re.findall(r"^  '([a-zA-Z|]+)': \{", (ROOT / 'src/content/ocarina/conversations.ts').read_text(), re.M))
examples = {'heroOfWinds|link', 'midnaImp|tatl', 'darmani|darunia', 'herosShade|link'}
def job(p):
    return {'key': p['key'], 'a': p['a'], 'aName': names.get(p['a'], p['a']), 'b': p['b'], 'bName': names.get(p['b'], p['b']), 'max': p['max'],
            'ranks': ['C', 'B', 'A'] + (['S'] if p['max'] == 'S' else []), 'theme': p['theme'], 'game': p['game'], 'section': p['section'],
            **({'form': p['form'], 'formName': names.get(p['form'], p['form'])} if p.get('form') else {}), 'docNames': p['names']}
todo = [p for p in out if p['key'] not in existing and p['key'] not in examples]
groups = {
  'oot': [p for p in todo if p['game'] == 'oot'],
  'mm': [p for p in todo if p['game'] == 'mm'],
  'ww': [p for p in todo if p['game'] == 'ww'],
  'tp1': [p for p in todo if p['game'] == 'tp' and p['section'] in ('Link and Midna', 'Wolf Link-Specific Conversations', 'Ordon and Kakariko')],
  'tp2': [p for p in todo if p['game'] == 'tp' and p['section'] not in ('Link and Midna', 'Wolf Link-Specific Conversations', 'Ordon and Kakariko')],
  'cross1': [p for p in todo if p['game'] == 'cross' and p['section'] in ('The Heroes of Hyrule', 'The Princesses', 'Fairies and Magical Companions', 'Goron Brotherhood', 'Zora and Rito')],
  'cross2': [p for p in todo if p['game'] == 'cross' and p['section'] not in ('The Heroes of Hyrule', 'The Princesses', 'Fairies and Magical Companions', 'Goron Brotherhood', 'Zora and Rito')],
  'monsters': [p for p in todo if p['game'] in ('monster', 'generic')],
}
jobdir = Path('/tmp/claude-0/-home-user-Roguelike-War-Engine/91d671a8-e632-5830-91d4-4b1413c89fd5/scratchpad/support_jobs')
jobdir.mkdir(exist_ok=True)
for g, ps in groups.items():
    (jobdir / f'{g}.json').write_text(json.dumps([job(p) for p in ps], ensure_ascii=False, indent=1))
    print(g, len(ps), file=sys.stderr)
print('covered', sum(len(v) for v in groups.values()), 'of', len(todo), file=sys.stderr)
