import re
import os

html_path = 'site/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update hero video tag to include webm source before mp4, and poster to webp
# Check current video snippet
old_video_snippet = '''  <video class="hero-video" autoplay muted loop playsinline preload="metadata"
    poster="assets/video/heading-poster.jpg" aria-hidden="true" tabindex="-1">

    <source src="assets/video/heading.mp4" type="video/mp4">
  </video>'''

new_video_snippet = '''  <video class="hero-video" autoplay muted loop playsinline preload="metadata"
    poster="assets/video/heading-poster.webp" aria-hidden="true" tabindex="-1">
    <source src="assets/video/heading.webm" type="video/webm">
    <source src="assets/video/heading.mp4" type="video/mp4">
  </video>'''

if old_video_snippet in content:
    content = content.replace(old_video_snippet, new_video_snippet)
    print("Hero video updated with webm and webp poster.")
else:
    print("Old video snippet not found directly, checking regex...")

# 2. For each <img> tag that has a src="assets/..." pointing to a .jpg that has a .webp counterpart:
def convert_img(m):
    img_tag = m.group(0)
    # Don't touch if already inside picture
    start_pos = m.start()
    preceding = content[max(0, start_pos - 30):start_pos]
    if '<picture' in preceding:
        return img_tag
    
    src_m = re.search(r'src=["\'](assets/[^"\']+\.jpg)["\']', img_tag)
    if not src_m:
        return img_tag
    
    jpg_rel = src_m.group(1)
    webp_rel = jpg_rel[:-4] + '.webp'
    disk_path = os.path.join('site', webp_rel.replace('/', os.sep))
    if not os.path.exists(disk_path):
        return img_tag
    
    return f'<picture><source srcset="{webp_rel}" type="image/webp">{img_tag}</picture>'

# Pattern for <img>
new_content = re.sub(r'<img\s+[^>]+>', convert_img, content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Images successfully updated.")
