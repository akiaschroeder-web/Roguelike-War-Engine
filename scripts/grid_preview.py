import sys
from PIL import Image, ImageDraw
out = sys.argv[1]
ids = sys.argv[2:]
cells = []
for i in ids:
    im = Image.open(f'art-src/{i}.png').convert('RGBA')
    im.thumbnail((300, 300))
    bg = Image.new('RGBA', (300, 320), (90, 110, 140, 255))
    bg.alpha_composite(im, (0, 0))
    d = ImageDraw.Draw(bg)
    w, h = im.size
    for k in range(1, 10):
        d.line([(w * k / 10, 0), (w * k / 10, h)], fill=(255, 255, 0, 110))
        d.line([(0, h * k / 10), (w, h * k / 10)], fill=(255, 255, 0, 110))
        d.text((w * k / 10 + 1, 1), str(k), fill=(255, 255, 0, 255))
        d.text((1, h * k / 10 + 1), str(k), fill=(0, 255, 255, 255))
    d.text((4, 304), f'{i} {w}x{h}', fill=(255, 255, 255, 255))
    cells.append(bg)
cols = 5
sheet = Image.new('RGBA', (cols * 305, ((len(cells) + cols - 1) // cols) * 325), (30, 30, 30, 255))
for n, c in enumerate(cells):
    sheet.paste(c, ((n % cols) * 305, (n // cols) * 325))
sheet.save(out)
