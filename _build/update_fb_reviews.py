import io, re, json

RAW = r"c:\Users\ytkar\Desktop\tattooandpiercing\_build\reviews_raw.txt"
OUT = r"c:\Users\ytkar\Desktop\tattooandpiercing\site\assets\js\fb-reviews.js"

lines = [l.strip() for l in io.open(RAW, encoding="utf-8").read().splitlines()]

TIME_RE = re.compile(r"^(?:Edited\s+)?(?:(?:a|\d+)\s+(?:year|month|week|day|hour)s?\s+ago|New|\d+\s*(?:days?|weeks?|months?|years?)\s+ago)\s*(?:Edited)?$", re.I)
META_RE = re.compile(r"^(?:Local Guide(?:\s*·\s*[\d,]+ reviews?)?(?:\s*·\s*[\d,]+ photos?)?|[\d,]+ reviews?(?:\s*·\s*[\d,]+ photos?)?|[\d,]+ photos?|Local Guide)$", re.I)
OWNER_RE = re.compile(r"^(?:Response from the owner|Custom Ink Luxembourg \(owner\))", re.I)
TRANS_RE = re.compile(r"^Translated by Google", re.I)
PHOTO_RE = re.compile(r"^Photo \d+ in review", re.I)
PRICE_RE = re.compile(r"^\u20ac[\d,]+(\u2013[\d,]+)?$", re.I)
REQ_RE = re.compile(r"^(Requested (style|information)|Specialities|Services|Stylist)", re.I)
EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF\u2764\u2763\u2661\u2B50\u2705\u274C\u2714]+")

def is_reaction(l):
    if EMOJI_RE.search(l) and not re.search(r"[A-Za-z]", l):
        return True
    return False

def is_time(l):
    return bool(TIME_RE.match(l))

def is_meta(l):
    return bool(META_RE.match(l)) and "ago" not in l.lower()

def is_terminator(l):
    return (bool(TRANS_RE.match(l)) or bool(PHOTO_RE.match(l)) or bool(OWNER_RE.match(l))
            or bool(PRICE_RE.match(l)) or bool(REQ_RE.match(l)) or is_reaction(l)
            or l.lower() in ("more", "helpful", "like", "share"))

def looks_like_header(i):
    if i + 1 >= len(lines):
        return False
    name = lines[i]
    nxt = lines[i + 1]
    if not name or len(name) > 60 or name.startswith("\u20ac"):
        return False
    if OWNER_RE.match(name) or TRANS_RE.match(name) or PHOTO_RE.match(name):
        return False
    if is_time(name) or is_meta(name) or is_terminator(name) or name.lower() == "new":
        return False
    if re.match(r"^(consultation|atmosphere|cleanliness|listening|Sort by|Most relevant|Google review|Reviews|All|\+6|\d)$", name, re.I):
        return False
    return is_meta(nxt) or is_time(nxt)

reviews = []
i = 0
in_owner = False
while i < len(lines):
    l = lines[i]
    if looks_like_header(i):
        name = l
        j = i + 1
        if is_meta(lines[j]):
            j += 1
        time = ""
        if j < len(lines) and is_time(lines[j]):
            time = re.sub(r"^Edited\s+", "", lines[j], flags=re.I)
            time = time.replace(" New", "").strip()
            j += 1
        if j < len(lines) and PRICE_RE.match(lines[j]):
            j += 1
        buf = []
        k = j
        in_owner = False
        while k < len(lines):
            tl = lines[k]
            if looks_like_header(k):
                break
            if is_terminator(tl):
                if OWNER_RE.match(tl):
                    in_owner = True
                if TRANS_RE.match(tl) or PHOTO_RE.match(tl):
                    in_owner = False
                k += 1
                continue
            if in_owner:
                k += 1
                continue
            if is_time(tl) and not buf:
                k += 1
                continue
            if tl.lower() == "new":
                k += 1
                continue
            buf.append(tl)
            k += 1
        text = " ".join(x for x in buf if x)
        text = re.sub(r"\s*\u2026\s*More$", "", text).strip()
        text = re.sub(r"\s*\u2026\s*$", "", text).strip()
        text = re.sub(r"\s{2,}", " ", text)
        reviews.append({"n": name, "t": time or "Google review", "x": text})
        i = k
        continue
    i += 1

seen = set()
clean = []
for r in reviews:
    n = r["n"]
    if is_meta(n) or is_time(n) or re.match(r"^\d+ review", n):
        continue
    # EXCLUDE ARESA AS EXPLICITLY REQUESTED
    if "aresa" in n.lower() or "lower arm sleeve" in r["x"].lower():
        continue
    key = (n.lower(), r["t"].lower(), r["x"][:30])
    if key in seen:
        continue
    seen.add(key)
    clean.append(r)

with_text = [r for r in clean if len(r["x"]) > 1]
rating_only = [r for r in clean if len(r["x"]) <= 1]
neg_keys = ["scammer", "don't recommend them", "don't recommend this", "way too expensive",
            "would not recommend", "leave much to be desired"]
neg = [r for r in with_text if any(k in r["x"].lower() for k in neg_keys)]
pos_text = [r for r in with_text if r not in neg]

print("total parsed:", len(clean))
print("with text:", len(pos_text), "| rating-only:", len(rating_only))
print("sample names:", [r["n"] for r in pos_text[:6]])

data = [{"n": r["n"], "t": r["t"], "x": r["x"]} for r in pos_text] + \
       [{"n": r["n"], "t": r["t"], "x": ""} for r in rating_only]

js = "/* Generated from the studio's Google review export — Aresa removed as requested. */\nwindow.FB_REVIEWS = " + \
     json.dumps(data, ensure_ascii=False) + ";\n"
io.open(OUT, "w", encoding="utf-8").write(js)
print("wrote", OUT, len(js), "bytes,", len(data), "reviews")
