#!/usr/bin/env python3
"""Remove the baked-in checkerboard background from Malon's source art.

Usage: python3 scripts/cutout_malon.py <original.png>  -> writes art-src/malon.png
"""
import sys
from collections import deque
from PIL import Image, ImageFilter

im = Image.open(sys.argv[1]).convert("RGBA")
w, h = im.size
px = im.load()
FACE = (345, 185, 545, 265)  # eyes only: keep the highlights in her eyes


def cand(p):
    r, g, b, _ = p
    return min(r, g, b) >= 222 and max(r, g, b) - min(r, g, b) <= 16


remove = bytearray(w * h)
seen = bytearray(w * h)
for sy in range(h):
    for sx in range(w):
        i = sy * w + sx
        if seen[i] or not cand(px[sx, sy]):
            continue
        comp, q, border = [], deque([(sx, sy)]), False
        seen[i] = 1
        while q:
            x, y = q.popleft()
            comp.append((x, y))
            border |= x in (0, w - 1) or y in (0, h - 1)
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and cand(px[nx, ny]):
                    seen[ny * w + nx] = 1
                    q.append((nx, ny))
        if not border:
            cx = sum(x for x, _ in comp) / len(comp)
            cy = sum(y for _, y in comp) / len(comp)
            if FACE[0] <= cx <= FACE[2] and FACE[1] <= cy <= FACE[3]:
                continue
            vals = [min(px[x, y][:3]) for x, y in comp]
            lo = sum(v <= 249 for v in vals)
            hi = sum(v >= 251 for v in vals)
            if not (len(comp) >= 12 and lo > len(comp) * 0.15 and hi > len(comp) * 0.15):
                continue  # not checkerboard
        for x, y in comp:
            remove[y * w + x] = 1


def orange(x, y):
    r, g, b, _ = px[x, y]
    return not remove[y * w + x] and r > 170 and r - b > 90 and g < 175


# Peel pale pixels off the outline: anywhere for neutral greys, and next to hair for warm pales.
for _ in range(4):
    peel = []
    for y in range(2, h - 2):
        for x in range(2, w - 2):
            i = y * w + x
            if remove[i] or not (remove[i - 1] or remove[i + 1] or remove[i - w] or remove[i + w]):
                continue
            if FACE[0] <= x <= FACE[2] and FACE[1] <= y <= FACE[3]:
                continue
            r, g, b, _ = px[x, y]
            lo, spread = min(r, g, b), max(r, g, b) - min(r, g, b)
            if lo >= 185 and spread <= 40:
                peel.append(i)
            elif lo >= 130 and spread <= 90 and sum(orange(x + dx, y + dy) for dy in (-2, -1, 0, 1, 2) for dx in (-2, -1, 0, 1, 2)) >= 3:
                peel.append(i)
    for i in peel:
        remove[i] = 1

mask = Image.new("L", (w, h), 255)
mp = mask.load()
for i in range(w * h):
    if remove[i]:
        mp[i % w, i // w] = 0
# Pull the outline in a little (except around the face) so no pale anti-aliasing survives.
eroded = mask.filter(ImageFilter.MinFilter(5))
eroded.paste(mask.crop(FACE), FACE[:2])
mask = eroded

# Defringe: recolour edge pixels from fully-inside neighbours.
mp = mask.load()
src = im.copy().load()
for y in range(3, h - 3):
    for x in range(3, w - 3):
        if mp[x, y] == 0:
            continue
        edge = any(mp[x + dx, y + dy] == 0 for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2), (1, 1), (-1, -1), (1, -1), (-1, 1)))
        if not edge:
            continue
        acc, n = [0, 0, 0], 0
        for dy in range(-3, 4):
            for dx in range(-3, 4):
                if mp[x + dx, y + dy] == 255 and not any(mp[x + dx + ex, y + dy + ey] == 0 for ex, ey in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    r, g, b, _ = src[x + dx, y + dy]
                    acc[0] += r; acc[1] += g; acc[2] += b; n += 1
        if n:
            px[x, y] = (acc[0] // n, acc[1] // n, acc[2] // n, 255)

# Final pass: pale specks hemmed in by hair or transparency are leftover background.
mp = mask.load()
def pale(x, y):
    r, g, b, _ = px[x, y]
    return mp[x, y] > 0 and min(r, g, b) >= 170 and max(r, g, b) - min(r, g, b) <= 50
def hairy(x, y):
    r, g, b, _ = px[x, y]
    return mp[x, y] == 0 or (r > 160 and r - b > 80 and g < 175)
seen2 = bytearray(w * h)
for sy in range(2, h - 2):
    for sx in range(2, w - 2):
        if seen2[sy * w + sx] or not pale(sx, sy):
            continue
        comp, q = [], deque([(sx, sy)])
        seen2[sy * w + sx] = 1
        while q:
            x, y = q.popleft()
            comp.append((x, y))
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 2 <= nx < w - 2 and 2 <= ny < h - 2 and not seen2[ny * w + nx] and pale(nx, ny):
                    seen2[ny * w + nx] = 1
                    q.append((nx, ny))
        if len(comp) > 400:
            continue  # big pale areas are clothing, not specks
        cx = sum(x for x, _ in comp) / len(comp)
        cy = sum(y for _, y in comp) / len(comp)
        if FACE[0] <= cx <= FACE[2] and FACE[1] <= cy <= FACE[3]:
            continue
        cs = set(comp)
        ring = {(x + dx, y + dy) for x, y in comp for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2))} - cs
        if ring and sum(hairy(x, y) for x, y in ring) / len(ring) >= 0.7:
            for x, y in comp:
                mp[x, y] = 0

# Head area: peel warm off-white pixels caught between hair tips (no white in her hair or ears).
HEAD_BOTTOM = 330
for _ in range(3):
    peel = []
    for y in range(2, HEAD_BOTTOM):
        for x in range(2, w - 2):
            if mp[x, y] == 0 or (FACE[0] <= x <= FACE[2] and FACE[1] <= y <= FACE[3]):
                continue
            if not any(mp[x + dx, y + dy] == 0 for dx in (-2, -1, 0, 1, 2) for dy in (-2, -1, 0, 1, 2)):
                continue
            r, g, b, _ = px[x, y]
            if min(r, g, b) >= 195 and max(r, g, b) - min(r, g, b) <= 75:
                peel.append((x, y))
    for x, y in peel:
        mp[x, y] = 0

# Beside the face (where only hair and ears are), near-white pixels are always leftover background.
for y in range(0, HEAD_BOTTOM):
    for x in list(range(0, 330)) + list(range(570, w)):
        r, g, b, _ = px[x, y]
        if mp[x, y] and min(r, g, b) >= 200 and max(r, g, b) - min(r, g, b) <= 75:
            mp[x, y] = 0

# Strand tips beside the face: pale, unsaturated pixels touching transparency are background blend.
for _ in range(2):
    peel = []
    for y in range(2, HEAD_BOTTOM):
        for x in list(range(2, 330)) + list(range(570, w - 2)):
            r, g, b, _ = px[x, y]
            if mp[x, y] == 0 or min(r, g, b) < 140 or r - b >= 90:
                continue
            if any(mp[x + dx, y + dy] == 0 for dx in (-2, -1, 0, 1, 2) for dy in (-2, -1, 0, 1, 2)):
                peel.append((x, y))
    for x, y in peel:
        mp[x, y] = 0

# Soften the edge, but never let removed pixels bleed back in.
hard = mask.copy()
mask = mask.filter(ImageFilter.GaussianBlur(0.6))
mask = Image.composite(mask, hard, hard)  # where hard is 0, stay 0
im.putalpha(mask)
im.save("art-src/malon.png")
print("done")
