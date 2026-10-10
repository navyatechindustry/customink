import re

with open(r'site\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

items = re.findall(r'<figure class="g-item"[^>]*data-place="([^"]+)"[^>]*>[\s\S]*?<span class="g-place">([^<]+)</span>', text)
print(f"Total cards found in masonry: {len(items)}")
for i, (dp, gp) in enumerate(items, 1):
    print(f"{i:2d}. data-place='{dp}' | text='{gp}'")
