import os
from PIL import Image, ImageFilter, ImageEnhance

SRC = r"C:\Users\ytkar\Desktop\tattooandpiercing\tattooimages"
WORK = r"C:\Users\ytkar\Desktop\tattooandpiercing\site\assets\img\work"
STUDIO = r"C:\Users\ytkar\Desktop\tattooandpiercing\site\assets\img\studio"

# (source, dest_folder, dest_name)
MAP = [
    # hero collage (dark, moody)
    ("unnamed (8).jpg",  WORK,   "hero-gladiator.jpg"),
    ("unnamed (56).jpg", WORK,   "hero-ornamental.jpg"),
    ("unnamed.png",      WORK,   "hero-chest.jpg"),
    # studio / craft
    ("unnamed (20).jpg", STUDIO, "studio-reception.jpg"),
    ("unnamed (29).jpg", STUDIO, "studio-artist.jpg"),
    ("unnamed (32).jpg", STUDIO, "studio-sketch.jpg"),
    ("unnamed (41).jpg", STUDIO, "studio-counter.jpg"),
    ("unnamed (22).jpg", STUDIO, "process-session.jpg"),
    ("unnamed (33).jpg", STUDIO, "process-stencil.jpg"),
    ("unnamed (11).jpg", STUDIO, "logo-wood.jpg"),
    # gallery
    ("unnamed (1).jpg",  WORK,   "w01-blackgrey-sleeve.jpg"),
    ("unnamed (2).jpg",  WORK,   "w02-dotwork-forearm.jpg"),
    ("unnamed (5).jpg",  WORK,   "w03-dotwork-shoulder.jpg"),
    ("unnamed (7).jpg",  WORK,   "w04-realism-cherub.jpg"),
    ("unnamed (8).jpg",  WORK,   "w05-blackgrey-statue.jpg"),
    ("unnamed (12).jpg", WORK,   "w06-colour-cat.jpg"),
    ("unnamed (13).jpg", WORK,   "w07-fineline-ornament.jpg"),
    ("unnamed (14).jpg", WORK,   "w08-blackgrey-tiger.jpg"),
    ("unnamed (15).jpg", WORK,   "w09-colour-neotrad.jpg"),
    ("unnamed (16).jpg", WORK,   "w10-fineline-flower.jpg"),
    ("unnamed (17).jpg", WORK,   "w11-fineline-sneaker.jpg"),
    ("unnamed (19).jpg", WORK,   "w12-blackgrey-witch.jpg"),
    ("unnamed (21).jpg", WORK,   "w13-fineline-ornband.jpg"),
    ("unnamed (24).jpg", WORK,   "w14-colour-peacock.jpg"),
    ("unnamed (25).jpg", WORK,   "w15-realism-portrait.jpg"),
    ("unnamed.png",      WORK,   "w16-blackgrey-chest.jpg"),
    ("unnamed (27).jpg", WORK,   "w17-blackgrey-horse.jpg"),
    ("unnamed (28).jpg", WORK,   "w18-blackgrey-skull.jpg"),
    ("unnamed (30).jpg", WORK,   "w19-blackgrey-lettering.jpg"),
    ("unnamed (31).jpg", WORK,   "w20-realism-shattered.jpg"),
    ("unnamed (34).jpg", WORK,   "w21-fineline-bee.jpg"),
    ("unnamed (35).jpg", WORK,   "w22-colour-sugarskull.jpg"),
    ("unnamed (36).jpg", WORK,   "w23-dotwork-eye.jpg"),
    ("unnamed (39).jpg", WORK,   "w24-dotwork-backpiece.jpg"),
    ("unnamed (42).jpg", WORK,   "w25-colour-japanese.jpg"),
    ("unnamed (45).jpg", WORK,   "w26-colour-tigereyes.jpg"),
    ("unnamed (46).jpg", WORK,   "w27-colour-balloon.jpg"),
    ("unnamed (49).jpg", WORK,   "w28-colour-rosemandala.jpg"),
    ("unnamed (50).jpg", WORK,   "w29-realism-lioness.jpg"),
    ("unnamed (52).jpg", WORK,   "w30-colour-gypsy.jpg"),
    ("unnamed (55).jpg", WORK,   "w31-realism-legsleeve.jpg"),
    ("unnamed (56).jpg", WORK,   "w32-dotwork-fern.jpg"),
    ("unnamed (57).jpg", WORK,   "w33-colour-skullsnake.jpg"),
]

def process(src_path, out_path, scale=3):
    im = Image.open(src_path).convert("RGB")
    w, h = im.size
    im = im.resize((w * scale, h * scale), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=95, threshold=2))
    im = ImageEnhance.Contrast(im).enhance(1.04)
    im = ImageEnhance.Color(im).enhance(1.05)
    im.save(out_path, "JPEG", quality=88, optimize=True, progressive=True)
    return im.size

for src, folder, name in MAP:
    out = os.path.join(folder, name)
    size = process(os.path.join(SRC, src), out)
    print(f"{name}: {size[0]}x{size[1]}")
print("DONE", len(MAP), "images")
