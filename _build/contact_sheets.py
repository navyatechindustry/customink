import os, math
from PIL import Image, ImageFilter, ImageDraw, ImageFont

SRC = r"C:\Users\ytkar\Desktop\tattooandpiercing\tattooimages"
OUT = r"C:\Users\ytkar\Desktop\tattooandpiercing\_sheets"
os.makedirs(OUT, exist_ok=True)

files = sorted(os.listdir(SRC), key=lambda f: (f.lower().replace(".jpg",".jpg").replace(".png",".png")))
# natural order: unnamed.jpg, unnamed (1)..., keep numeric ordering
import re
def natkey(f):
    m = re.match(r"unnamed(?: \((\d+)\))?\.(\w+)", f)
    if m:
        n = int(m.group(1)) if m.group(1) else 0
        return (n, m.group(2))
    return (9999, f)
files = sorted(os.listdir(SRC), key=natkey)

TILE_W = 300
COLS = 4
PAD = 24
LABEL_H = 34
BG = (24, 22, 20)

try:
    font = ImageFont.truetype("arial.ttf", 18)
except Exception:
    font = ImageFont.load_default()

per_sheet = 16
num_sheets = math.ceil(len(files) / per_sheet)

for s in range(num_sheets):
    batch = files[s*per_sheet:(s+1)*per_sheet]
    # precompute tiles
    tiles = []
    for f in batch:
        try:
            im = Image.open(os.path.join(SRC, f)).convert("RGB")
            w, h = im.size
            nh = int(h * TILE_W / w)
            im = im.resize((TILE_W, nh), Image.LANCZOS)
            im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))
            tiles.append((f, im))
        except Exception as e:
            print("ERR", f, e)
    rows = math.ceil(len(tiles) / COLS)
    col_h = [0]*COLS
    sheet_w = COLS * (TILE_W + PAD) + PAD
    sheet_h = 100
    placed = []
    for i, (f, im) in enumerate(tiles):
        c = i % COLS
        x = PAD + c * (TILE_W + PAD)
        y = 100 + col_h[c]
        placed.append((f, im, x, y))
        col_h[c] += im.size[1] + LABEL_H + PAD
    sheet_h = 100 + max(col_h) + PAD
    sheet = Image.new("RGB", (sheet_w, sheet_h), BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 30), f"SHEET {s+1}/{num_sheets} - {batch[0]} .. {batch[-1]}", fill=(220,210,190), font=font)
    for f, im, x, y in placed:
        sheet.paste(im, (x, y))
        d.text((x, y + im.size[1] + 6), f, fill=(160,200,160), font=font)
    out = os.path.join(OUT, f"sheet_{s+1}.png")
    sheet.save(out)
    print("saved", out, sheet.size)
