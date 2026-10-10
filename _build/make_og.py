import os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

ROOT = r"C:\Users\ytkar\Desktop\tattooandpiercing"
IMG = os.path.join(ROOT, "site", "assets", "img")
SERIF = os.path.join(ROOT, "cormorant-600.ttf")
SERIF_IT = os.path.join(ROOT, "site", "assets", "fonts")  # italic ttf not converted; fallback below
W, H = 1200, 630
BG = (22, 19, 15)
IVORY = (238, 229, 212)
STONE = (168, 156, 136)
BRONZE = (176, 141, 87)

serif = ImageFont.truetype(SERIF, 148)
serif_sm = ImageFont.truetype(SERIF, 46)
try:
    serif_it = ImageFont.truetype(os.path.join(ROOT, "cormorant-400italic.ttf"), 48)
except Exception:
    serif_it = serif_sm

og = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(og)

# right collage: 3 images, right-aligned, bleeding off right edge
pics = ["hero-gladiator.jpg", "w24-dotwork-backpiece.jpg", "w08-blackgrey-tiger.jpg"]
x = W - 300
ys = [-40, 220, 470]
for p, y in zip(pics, ys):
    im = Image.open(os.path.join(IMG, "work", p))
    im = im.resize((300, int(im.height * 300 / im.width)), Image.LANCZOS)
    im = ImageEnhance.Brightness(im).enhance(0.92)
    og.paste(im, (x, y))

# fade collage into bg from left
fade = og.crop((x - 90, 0, x + 60, H)).filter(ImageFilter.GaussianBlur(18))
mask = Image.new("L", fade.size, 0)
md = ImageDraw.Draw(mask)
for i in range(fade.width):
    md.line([(i, 0), (i, H)], fill=int(255 * (i / fade.width)))
og.paste(fade, (x - 90, 0), mask)

d = ImageDraw.Draw(og)

def tracked(draw, pos, text, font, fill, tracking=6):
    x, y = pos
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x

label_font = ImageFont.truetype(SERIF, 24)
tracked(d, (72, 92), "TATTOO & PIERCING STUDIO", label_font, BRONZE, 8)
d.line([(72, 138), (560, 138)], fill=(70, 61, 46), width=1)

d.text((66, 190), "CUSTOM", font=serif, fill=IVORY)
w1 = d.textlength("CUSTOM ", font=serif)
d.text((66 + w1, 190), "INK", font=serif, fill=BRONZE)
d.text((72, 360), "Your skin. Your story.", font=serif_it, fill=STONE)

d.line([(72, 500), (200, 500)], fill=(70, 61, 46), width=1)
small = ImageFont.truetype(SERIF, 28)
d.text((72, 522), "4.9", font=small, fill=IVORY)
xs = 72 + d.textlength("4.9  ", font=small)

import math
def star(draw, cx, cy, r, fill):
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rad = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    draw.polygon(pts, fill=fill)

for i in range(5):
    star(d, xs + 14 + i * 30, 536, 13, BRONZE)
xs += 5 * 30 + 18
d.text((xs, 522), "377 Google reviews", font=small, fill=STONE)

# subtle grain
noise = Image.effect_noise((W, H), 14).convert("L")
noise_img = Image.merge("RGB", (noise, noise, noise))
og = Image.blend(og, noise_img, 0.035)

og.save(os.path.join(IMG, "og.jpg"), "JPEG", quality=90, optimize=True)
print("og.jpg saved", og.size)
