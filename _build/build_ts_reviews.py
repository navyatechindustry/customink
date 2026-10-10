import json, os

txt = open('site/assets/js/fb-reviews.js', encoding='utf-8').read()
idx = txt.find('[')
data = json.loads(txt[idx:txt.rfind(']')+1])
assert len(data) == 377, f"Expected 377, got {len(data)}"

os.makedirs('data', exist_ok=True)

lines = []
lines.append('export type Review = {')
lines.append('  id: string;')
lines.append('  name: string;')
lines.append('  text: string;')
lines.append('  rating?: number;')
lines.append('  date?: string;')
lines.append('  reviewCount?: number;')
lines.append('  photoCount?: number;')
lines.append('  language?: string;')
lines.append('  source?: "Google";')
lines.append('};')
lines.append('')
lines.append('export const reviews: Review[] = [')

for i, r in enumerate(data, start=1):
    rid = f'rev-{i:03d}'
    name = json.dumps(r['n'], ensure_ascii=False)
    date = json.dumps(r['t'], ensure_ascii=False)
    text = json.dumps(r['x'], ensure_ascii=False)
    lines.append(f'  {{ id: "{rid}", name: {name}, text: {text}, rating: 5, date: {date}, source: "Google" }},')

lines.append('];')
lines.append('')
lines.append('console.assert(')
lines.append('  reviews.length === 377,')
lines.append('  "Custom Ink review dataset should contain 377 reviews"')
lines.append(');')
lines.append('')
lines.append('export default reviews;')
lines.append('')

with open('data/custom-ink-reviews.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Successfully generated data/custom-ink-reviews.ts with', len(data), 'reviews.')
