#!/usr/bin/env python3
"""Bundle the newer art (Twilight Princess onward) into a few JSON packs of WebP data URIs,
so the published artifact stays under its file-count limit.

Usage: python3 scripts/pack_art.py   (after scripts/process_art.py)
"""
import base64, io, json, re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / 'scripts' / 'process_art.py').read_text()
ids = re.findall(r'"(\w+)": \(', src[src.index('# Twilight Princess'):])
out = ROOT / 'public' / 'packs'
out.mkdir(parents=True, exist_ok=True)

def uri(path: Path, q: int) -> str:
    im = Image.open(path).convert('RGBA')
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

def job(a):
    kind, i, q = a
    return kind, i, uri(ROOT / 'public' / kind / f'{i}.png', q)

import multiprocessing as mp
with mp.get_context('fork').Pool() as pool:
    done = pool.map(job, [('portraits', i, 82) for i in ids] + [('art', i, 80) for i in ids], chunksize=4)
por = {i: d for k, i, d in done if k == 'portraits'}
artd = {i: d for k, i, d in done if k == 'art'}
packs = {'portraits-1': {i: por[i] for i in ids}}
art = [i for i in ids]
per = (len(art) + 2) // 3
for n in range(3):
    packs[f'art-{n + 1}'] = {i: artd[i] for i in art[n * per:(n + 1) * per]}
for name, data in packs.items():
    p = out / f'{name}.json'
    p.write_text(json.dumps(data))
    print(name, len(data), f'{p.stat().st_size / 1e6:.1f} MB')
(out / 'index.json').write_text(json.dumps(sorted(packs)))
