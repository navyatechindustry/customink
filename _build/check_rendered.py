import re

with open(r"_build\dump_rendered.html", "r", encoding="utf-8") as f:
    text = f.read()

cards = len(re.findall(r'class="fb-card', text))
print("Total fb-cards in rendered HTML:", cards)

# Check the three ul elements in fb-col
m = re.findall(r'<div class="fb-col[^"]*"[^>]*>\s*<ul([^>]*)>', text)
for i, ul_attrs in enumerate(m):
    print(f"Col {i+1} ul attrs: {ul_attrs}")
