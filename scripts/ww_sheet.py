import sys
from PIL import Image, ImageDraw
ids = sys.argv[2:]
S = sys.argv[1]
cols = 8
sheet = Image.new('RGBA', (cols * 160, ((len(ids) + cols - 1) // cols) * 180), (40, 40, 40, 255))
d = ImageDraw.Draw(sheet)
for n, i in enumerate(ids):
    im = Image.open(f'public/portraits/{i}.png').resize((150, 150))
    x, y = (n % cols) * 160 + 5, (n // cols) * 180 + 5
    bg = Image.new('RGBA', (150, 150), (90, 110, 140, 255)); bg.alpha_composite(im)
    sheet.paste(bg, (x, y)); d.text((x, y + 152), i, fill=(255, 255, 255, 255))
sheet.save(S)
