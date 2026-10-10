import io, re, json, os

SRC = r"C:\Users\ytkar\.zcode\tmp\paste-attachments\2026-10-06\pasted-text-20261006-023200-e7d8887c.txt"
DUMP = r"c:\Users\ytkar\Desktop\tattooandpiercing\_build\reviews_full_dump.txt"
OUT_JS = r"c:\Users\ytkar\Desktop\tattooandpiercing\site\assets\js\fb-reviews.js"

# Let's combine lines from both sources to ensure nothing is missed
raw1 = io.open(SRC, encoding="utf-8", errors="ignore").read()
raw2 = io.open(DUMP, encoding="utf-8", errors="ignore").read()

TIME_RE = re.compile(r"^(?:Edited\s+)?(?:(?:a|\d+)\s+(?:year|month|week|day|hour)s?\s+ago|New|\d+\s*(?:days?|weeks?|months?|years?)\s+ago)\s*(?:Edited)?$", re.I)
META_RE = re.compile(r"^(?:Local Guide(?:\s*·\s*[\d,]+ reviews?)?(?:\s*·\s*[\d,]+ photos?)?|[\d,]+ reviews?(?:\s*·\s*[\d,]+ photos?)?|[\d,]+ photos?|Local Guide|\d+\s*reviews?.*)$", re.I)
OWNER_RE = re.compile(r"^(?:Response from the owner|Custom Ink Luxembourg \(owner\))", re.I)
TRANS_RE = re.compile(r"^Translated by Google", re.I)
PHOTO_RE = re.compile(r"^Photo \d+ in review", re.I)
PRICE_RE = re.compile(r"^\u20ac[\d,]+(\u2013[\d,]+)?$", re.I)
REQ_RE = re.compile(r"^(Requested (style|information)|Specialities|Services|Stylist)", re.I)
EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF\u2764\u2763\u2661\u2B50\u2705\u274C\u2714]+")

def is_reaction(l):
    return bool(EMOJI_RE.search(l)) and not bool(re.search(r"[A-Za-z]", l))

def is_time(l):
    return bool(TIME_RE.match(l))

def is_meta(l):
    return bool(META_RE.match(l)) and "ago" not in l.lower()

def is_terminator(l):
    return (bool(TRANS_RE.match(l)) or bool(PHOTO_RE.match(l)) or bool(OWNER_RE.match(l))
            or bool(PRICE_RE.match(l)) or bool(REQ_RE.match(l)) or is_reaction(l)
            or l.lower() in ("more", "helpful", "like", "share"))

def parse_text(raw_text):
    raw_lines = [l.strip() for l in raw_text.splitlines()]
    lines = [l for l in raw_lines if l]

    def looks_like_header(i):
        if i + 1 >= len(lines):
            return False
        name = lines[i].lstrip('"\u201c\u201d')
        nxt = lines[i + 1]
        if not name or len(name) > 60 or name.startswith("\u20ac"):
            return False
        if OWNER_RE.match(name) or TRANS_RE.match(name) or PHOTO_RE.match(name):
            return False
        if is_time(name) or is_meta(name) or is_terminator(name) or name.lower() == "new":
            return False
        if re.match(r"^(consultation|atmosphere|cleanliness|listening|Sort by|Most relevant|Google review|Reviews|All|\+6|\d|<USER_REQUEST>|here are the reviews)$", name, re.I):
            return False
        return is_meta(nxt) or is_time(nxt)

    reviews = []
    i = 0
    while i < len(lines):
        l = lines[i]
        if looks_like_header(i):
            name = l.lstrip('"\u201c\u201d').strip()
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
    return reviews

revs1 = parse_text(raw1)
revs2 = parse_text(raw2)

all_revs = revs1 + revs2
seen = set()
clean = []
for r in all_revs:
    n = r["n"]
    if is_meta(n) or is_time(n) or re.match(r"^\d+ review", n):
        continue
    # Normalize name
    norm_n = re.sub(r"\s+", " ", n).strip()
    key = norm_n.lower()
    if key in seen:
        continue
    seen.add(key)
    clean.append({"n": norm_n, "t": r["t"], "x": r["x"]})

print("Total unique clean reviews parsed:", len(clean))
without_aresa = [r for r in clean if not ("aresa" in r["n"].lower() or "lower arm sleeve" in r["x"].lower())]
print("Total reviews without Aresa:", len(without_aresa))

# Interleave text and rating-only reviews for balanced aesthetic
text_revs = [r for r in without_aresa if len(r["x"]) > 1]
rating_revs = [r for r in without_aresa if len(r["x"]) <= 1]
print(f"Distribution: {len(text_revs)} text reviews, {len(rating_revs)} rating-only reviews")

# Interleave so every column gets an even blend of text stories and 5-star badges
interleaved = []
t_idx = 0
r_idx = 0
# Roughly 2.2 text reviews per 1 rating review
while t_idx < len(text_revs) or r_idx < len(rating_revs):
    if t_idx < len(text_revs):
        interleaved.append(text_revs[t_idx])
        t_idx += 1
    if t_idx < len(text_revs):
        interleaved.append(text_revs[t_idx])
        t_idx += 1
    if r_idx < len(rating_revs):
        interleaved.append(rating_revs[r_idx])
        r_idx += 1

print("Interleaved total count:", len(interleaved))

# Write out to site/assets/js/fb-reviews.js
data = [{"n": r["n"], "t": r["t"], "x": r["x"]} for r in interleaved]
js = "/* Google Reviews Data \u2014 All " + str(len(data)) + " authentic reviews */\nwindow.FB_REVIEWS = " + \
     json.dumps(data, ensure_ascii=False) + ";\n"

io.open(OUT_JS, "w", encoding="utf-8").write(js)
print("Successfully generated", OUT_JS, "with", len(data), "reviews, size:", len(js), "bytes")

