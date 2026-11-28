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
# Split into files of at most ~9 MB each (the published page allows 16 MB per file).
LIMIT = 9_000_000
def split(prefix, data):
    out, cur, size, n = {}, {}, 0, 1
    for i in ids:
        v = data[i]
        if cur and size + len(v) > LIMIT:
            out[f'{prefix}-{n}'] = cur; cur, size, n = {}, 0, n + 1
        cur[i] = v; size += len(v)
    if cur: out[f'{prefix}-{n}'] = cur
    return out
packs = {**split('portraits', por), **split('art', artd)}
for old in out.glob('*.json'):
    if old.name != 'index.json' and old.stem not in packs: old.unlink()
for name, data in packs.items():
    p = out / f'{name}.json'
    p.write_text(json.dumps(data))
    print(name, len(data), f'{p.stat().st_size / 1e6:.1f} MB')
(out / 'index.json').write_text(json.dumps(sorted(packs)))
