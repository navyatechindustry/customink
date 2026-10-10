import os
from PIL import Image

SRC = r"C:\Users\ytkar\Desktop\tattooandpiercing\tattooimages"
WORK = r"C:\Users\ytkar\Desktop\tattooandpiercing\site\assets\img\work"
STUDIO = r"C:\Users\ytkar\Desktop\tattooandpiercing\site\assets\img\studio"

# timestamp suffix of each new screenshot -> slot
def f(ts):
    for name in os.listdir(SRC):
        if ts in name:
            return os.path.join(SRC, name)
    raise FileNotFoundError(ts)

MAP = [
    # hero collage
    (f("152743"), WORK, "hero-gladiator.jpg"),
    (f("152051"), WORK, "hero-ornamental.jpg"),
    (f("152600"), WORK, "hero-chest.jpg"),
    # studio / process
    (f("152635"), STUDIO, "studio-reception.jpg"),
    (f("152530"), STUDIO, "studio-artist.jpg"),
    (f("152458"), STUDIO, "studio-sketch.jpg"),
    (f("152400"), STUDIO, "studio-counter.jpg"),
    (f("152625"), STUDIO, "process-session.jpg"),
    (f("152450"), STUDIO, "process-stencil.jpg"),
    # gallery w01..w33
    (f("152807"), WORK, "w01-blackgrey-sleeve.jpg"),
    (f("152747"), WORK, "w02-dotwork-forearm.jpg"),
    (f("152750"), WORK, "w03-dotwork-shoulder.jpg"),
    (f("152738"), WORK, "w04-realism-cherub.jpg"),
    (f("152743"), WORK, "w05-blackgrey-statue.jpg"),
    (f("152729"), WORK, "w06-colour-cat.jpg"),
    (f("152725"), WORK, "w07-fineline-ornament.jpg"),
    (f("152715"), WORK, "w08-blackgrey-tiger.jpg"),
    (f("152710"), WORK, "w09-colour-neotrad.jpg"),
    (f("152705"), WORK, "w10-fineline-flower.jpg"),
    (f("152657"), WORK, "w11-fineline-sneaker.jpg"),
    (f("152643"), WORK, "w12-blackgrey-witch.jpg"),
    (f("152629"), WORK, "w13-fineline-ornband.jpg"),
    (f("152609"), WORK, "w14-colour-peacock.jpg"),
    (f("152603"), WORK, "w15-realism-portrait.jpg"),
    (f("152600"), WORK, "w16-blackgrey-chest.jpg"),
    (f("152143"), WORK, "w17-blackgrey-horse.jpg"),   # slot reused: jewel mandala thigh
    (f("152540"), WORK, "w18-blackgrey-skull.jpg"),
    (f("152513"), WORK, "w19-blackgrey-lettering.jpg"),
    (f("152506"), WORK, "w20-realism-shattered.jpg"),
    (f("152446"), WORK, "w21-fineline-bee.jpg"),
    (f("152441"), WORK, "w22-colour-sugarskull.jpg"),
    (f("152410"), WORK, "w23-dotwork-eye.jpg"),       # slot reused: statue hand
    (f("152419"), WORK, "w24-dotwork-backpiece.jpg"),
    (f("152405"), WORK, "w25-colour-japanese.jpg"),
    (f("152331"), WORK, "w26-colour-tigereyes.jpg"),
    (f("152324"), WORK, "w27-colour-balloon.jpg"),    # slot reused: watercolour lightbulb
    (f("152253"), WORK, "w28-colour-rosemandala.jpg"),
    (f("152300"), WORK, "w29-realism-lioness.jpg"),
    (f("152225"), WORK, "w30-colour-gypsy.jpg"),
    (f("152116"), WORK, "w31-realism-legsleeve.jpg"),
    (f("152051"), WORK, "w32-dotwork-fern.jpg"),
    (f("152818"), WORK, "w33-colour-skullsnake.jpg"),
]

for src, folder, name in MAP:
    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        im = im.convert("RGBA")
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    # cap width at 960 for web (sources are ~480 wide, so this is a no-op safeguard)
    if im.width > 960:
        im = im.resize((960, int(im.height * 960 / im.width)), Image.LANCZOS)
    out = os.path.join(folder, name)
    im.save(out, "JPEG", quality=90, optimize=True, progressive=True)
    print(f"{name}: {im.size[0]}x{im.size[1]}")
print("DONE", len(MAP))
