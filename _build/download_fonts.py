import re, os, urllib.request

CD = r"C:\Users\ytkar\Desktop\tattooandpiercing\site\assets\fonts"
css = open(os.path.join(CD, "fonts.css"), encoding="utf-8").read()

# split into @font-face blocks with preceding subset comment
blocks = re.findall(r"/\*\s*([a-z-]+)\s*\*/\s*@font-face\s*\{([^}]+)\}", css)
want = []
for subset, body in blocks:
    if subset != "latin":
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", body).group(1)
    style = re.search(r"font-style:\s*(\w+)", body).group(1)
    weight = re.search(r"font-weight:\s*(\d+)", body).group(1)
    url = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
    slug = fam.lower().replace(" ", "-")
    fname = f"{slug}-{weight}{'-italic' if style=='italic' else ''}.woff2"
    want.append((fname, url, fam, style, weight))

lines = []
for fname, url, fam, style, weight in want:
    dest = os.path.join(CD, fname)
    urllib.request.urlretrieve(url, dest)
    kb = os.path.getsize(dest) // 1024
    print(f"{fname}  {kb}KB  <- {url[:60]}...")
    lines.append(
        "@font-face{font-family:'%s';font-style:%s;font-weight:%s;font-display:swap;"
        "src:url('%s') format('woff2');}" % (fam, style, weight, fname)
    )

open(os.path.join(CD, "fonts.css"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("wrote fonts.css with", len(lines), "faces")
