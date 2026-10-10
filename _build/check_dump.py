import re

with open(r'_build\dump_edge.html', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'id="fbwallCols"[^>]*>([\s\S]*?)</div>\s*<p class="fbwall-note"', content)
if match:
    inner = match.group(1)
    print('fbwallCols inner length:', len(inner))
    cols = re.findall(r'<div class="review-column[^>]*>', inner)
    print('Columns found:', len(cols))
    for c in cols:
        print('  ', c)
    tracks = re.findall(r'<div class="review-track[^>]*>', inner)
    print('Tracks found:', len(tracks))
    for t in tracks:
        print('  ', t)
    groups = re.findall(r'<div class="review-group[^>]*>', inner)
    print('Groups found:', len(groups))
    cards = re.findall(r'<article class="review-card[^>]*>', inner)
    print('Cards found in dumped DOM:', len(cards))
else:
    print('fbwallCols not matched!')
