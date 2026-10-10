# Custom Ink Luxembourg — Website

Premium, conversion-focused single-page site — **neubrutalist theme**: white ground, thick black borders, hard offset shadows, marigold-gold accent, Anton display type, Space Mono labels, full-colour photography for Custom Ink Luxembourg
(tattoo & piercing studio, 103 Waistrooss, L-5440 Remerschen).

Static build: **no frameworks, no build step.** Only external references: self-hosted fonts and Leaflet (map library, via CDN) + OpenStreetMap tiles. If you self-host everything, download Leaflet 1.9.4 into `assets/` and swap the two CDN tags in `index.html`.
Deploy the `site/` folder to any static host (Netlify, Vercel, Cloudflare Pages, IONOS, etc.).

```
site/
├── index.html            ← the whole landing page (all content lives here)
├── privacy.html          ← privacy policy (template — review before launch)
├── robots.txt / sitemap.xml
└── assets/
    ├── css/style.css     ← neubrutalist design system + all styling
    ├── js/main.js        ← nav, filters, lightbox, form, concierge, analytics hooks
    ├── fonts/            ← self-hosted Anton, Space Grotesk, Space Mono, Caveat (woff2)
├── video/            ← hero background loop (heading.mp4, 1080p, silent, 2.5 MB) + poster
    └── img/              ← work/, studio/, og.jpg, favicon.svg
```

## Before going live — checklist for the studio

1. **Domain** — `https://customink.lu/` is used as the canonical URL (in
   `index.html`, `sitemap.xml`, `robots.txt`, OG tags). Confirm the final domain and
   update it in those places if different.
2. **Privacy page** — `privacy.html` is an honest template (this site truly sets no
   cookies and sends nothing automatically). Add the legal entity details
   (S.à r.l., RCS number, hosting provider) or have your legal advisor review it.
3. **Images** — the photos in `assets/img/` were rebuilt from small Google-listing
   thumbnails (upscaled 3× + sharpened). They look good at the sizes used on the page,
   but if you have the **original files** of these tattoos, drop them in with the same
   filenames — the site will immediately look even sharper, especially the hero collage.
4. **WhatsApp** — a floating green WhatsApp button (bottom-left on every page) links
   to `https://api.whatsapp.com/send?phone=352621523131...` with a prefilled French
   message. To change the number or prefill, edit the `wa-fab` link in `index.html`,
   `privacy.html` and `WA_URL` in `main.js` (the concierge also hands off to it).

## Where to edit content

| Content | Where |
|---|---|
| Studio info, hours, address, phone | `index.html` (Visit section + footer + JSON-LD block at the top) |
| Reviews | `index.html` → section `#reviews` (quotes are real Google reviews) |
| FAQ | `index.html` → section `#faq` (also mirrored in the FAQPage JSON-LD) |
| Services | `index.html` → section `#services` |
| Gallery items | `index.html` → section `#work` — copy a `<figure class="g-item">` block and set `data-cat` (`fineline`, `dotwork`, `realism`, `blackgrey`, `colour`), `data-title`, `data-style`, `data-place` |
| Polaroid board | `index.html` → section `#board` — add a `<figure class="polaroid p-item">` (with `data-title`/`data-style`/`data-place`) or a `.sticky-note`. Captions use the Caveat handwriting font; sticky notes carry real client quotes from the Google reviews. Board polaroids also open in the lightbox (but are untouched by the gallery filters). |
| Concierge answers | `main.js` → `CONCIERGE` object (EN + FR intents; each answer can carry follow-up topic chips via `n`) |
| Feedback wall | Data: `assets/js/fb-reviews.js` (generated from the studio's Google review export — do not hand-edit; regenerate with `_build/parse_reviews.py` against a fresh export). Rendering: `main.js` → feedback wall builder (round-robins reviews into 3 columns, duplicates each set for the seamless loop, middle column scrolls downward, duration auto-computed from column height at ~45 px/s). Rating-only reviews (no text on Google) render as star-stamp cards. Three critical reviews are intentionally excluded from the wall. |
| Hero video | `assets/video/heading.mp4` — replace the file to update it (keep the name). Autoplay is muted/looped/playsinline and runs for everyone. Each loop fades in/out over the poster frame (~1.1s smoothstep) so the restart has no visible cut. The video pauses off-screen and on hidden tabs (logic in `main.js`; fade sampling runs on rAF only while playing). Re-encode large files: `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset medium -an -movflags +faststart -pix_fmt yuv420p out.mp4`. |
| Map & routing | `main.js` → map block. Studio pin is geocoded from the address (49.4870753, 6.3530326). “Fetch my location” uses the browser Geolocation API + OSRM public routing (`router.project-osrm.org`) to draw the car route and show distance/time; Google Maps is the always-visible fallback. Map + basemap load from unpkg (Leaflet) and tile.openstreetmap.org (grayscaled via CSS). A test hook exists: `__mapTestRoute(lat, lng)` draws a route without geolocation. |
| Opening-hours logic | `main.js` → “open-now” block (Europe/Luxembourg) |

## Analytics

Clicks on every important CTA already push events into `window.dataLayer`
(`hero_book`, `phone_call`, `form_submitted`, `whatsapp`/`concierge_*`, …).
Add a Google Tag Manager container ID to `index.html` and all events flow
into GA4 / Meta Pixel without further code. Nothing loads until you add it.

## Local preview

```bash
cd site
python -m http.server 8080
# → http://localhost:8080
```
