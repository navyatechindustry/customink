import re

# 1. Update site/assets/js/main.js
with open('site/assets/js/main.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

old_js_pattern = re.compile(
    r'/\* ---------------- feedback wall builder ---------------- \*/\s*\(function \(\) \{.+?\}\)\(\);',
    re.DOTALL
)

new_js_code = '''/* ---------------- feedback wall builder ---------------- */
  (function () {
    var data = window.FB_REVIEWS || [];
    var container = document.getElementById('fbwallCols');
    if (!container || !data.length) return;

    /* Development-time validation */
    if (window.console && console.assert) {
      console.assert(
        data.length === 377,
        'Custom Ink review dataset should contain 377 reviews (found ' + data.length + ')'
      );
    }

    function esc(x) {
      return String(x)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function initials(n) {
      var parts = (n || '').trim().split(/\\s+/);
      var a = (parts[0] || '').charAt(0);
      var b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
      return ((a + b) || 'CI').toUpperCase();
    }

    function cardEl(r, isDup) {
      var li = document.createElement('li');
      li.className = 'fb-card' + (r.x ? '' : ' fb-card--rating');
      if (isDup) {
        li.setAttribute('aria-hidden', 'true');
      }

      var stars = '<span class="fb-stars-row" aria-label="5 stars" title="5 stars on Google">★★★★★</span>';
      var textHtml = r.x
        ? '<blockquote class="fb-text">“' + esc(r.x) + '”</blockquote>'
        : '<p class="fb-text fb-text--empty">Verified 5-star studio experience</p>';

      li.innerHTML =
        '<article class="fb-card-inner">' +
          '<header class="fb-top-row">' +
            stars +
            '<span class="fb-source-tag">Google Review</span>' +
          '</header>' +
          textHtml +
          '<footer class="fb-footer">' +
            '<div class="fb-ava" aria-hidden="true"><span>' + esc(initials(r.n)) + '</span></div>' +
            '<div class="fb-who">' +
              '<cite>' + esc(r.n) + '</cite>' +
              (r.t ? '<span>' + esc(r.t) + '</span>' : '') +
            '</div>' +
          '</footer>' +
        '</article>';
      return li;
    }

    var currentCols = -1;

    function getTargetColCount() {
      var w = window.innerWidth;
      if (w > 960) return 3;
      if (w > 600) return 2;
      return 1;
    }

    function renderWall() {
      var cols = getTargetColCount();
      if (cols === currentCols) return;
      currentCols = cols;

      container.innerHTML = '';

      // ALL columns move BOTTOM -> TOP (upward) at slightly varied speeds:
      // Desktop: 3 cols (col 1: 52s, col 2: 61s, col 3: 57s)
      // Tablet: 2 cols (col 1: 54s, col 2: 62s)
      // Mobile: 1 col (col 1: 72s)
      var durations = [];
      if (cols === 3) {
        durations = ['52s', '61s', '57s'];
      } else if (cols === 2) {
        durations = ['54s', '62s'];
      } else {
        durations = ['72s'];
      }

      var uls = [];
      for (var c = 0; c < cols; c++) {
        var colDiv = document.createElement('div');
        colDiv.className = 'fb-col fb-col-' + (c + 1);
        var ul = document.createElement('ul');
        ul.className = 'fb-track fb-dir-up';
        ul.style.setProperty('--dur', durations[c]);
        colDiv.appendChild(ul);
        container.appendChild(colDiv);
        uls.push(ul);
      }

      // Distribute EVERY single review across the visible columns (i % cols)
      // All 377 reviews preserved on every breakpoint
      for (var i = 0; i < data.length; i++) {
        var targetUl = uls[i % cols];
        targetUl.appendChild(cardEl(data[i], false));
      }

      // Duplicate each column's list for the seamless infinite -50% loop
      uls.forEach(function (ul) {
        var cards = Array.prototype.slice.call(ul.children);
        cards.forEach(function (card) {
          ul.appendChild(card.cloneNode(true));
        });
      });
    }

    renderWall();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderWall, 150);
    });
  })();'''

assert old_js_pattern.search(js_content), "Could not find old fbwall in main.js"
updated_js = old_js_pattern.sub(lambda m: new_js_code, js_content, count=1)
with open('site/assets/js/main.js', 'w', encoding='utf-8') as f:
    f.write(updated_js)
print("Updated site/assets/js/main.js successfully.")

# 2. Update site/assets/css/style.css
with open('site/assets/css/style.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

old_css_pattern = re.compile(
    r'/\* ============================================================\s*FEEDBACK WALL — auto-scrolling Google reviews\s*============================================================ \*/.+?(?=/\* ============================================================\s*VISIT / LOCATION)',
    re.DOTALL
)

new_css_code = '''/* ============================================================
   FEEDBACK WALL — auto-scrolling Google reviews (Vertical Marquee)
   ============================================================ */
.fbwall {
  margin-top: clamp(64px, 8vw, 100px);
  border-top: var(--bd);
  padding-top: clamp(48px, 6vw, 76px);
}
.fbwall-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  margin-bottom: clamp(40px, 5vw, 64px);
  flex-wrap: wrap;
}
.fbwall-head-text {
  max-width: 680px;
}
.fbwall-head .fb-chip {
  margin-bottom: 22px;
}
.fbwall-title {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  text-transform: uppercase;
  margin-bottom: 14px;
  letter-spacing: -0.01em;
  line-height: 1.05;
}
.fbwall-sub {
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--fg);
}
.fbwall-trust-badge {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 4px 4px 0 var(--acc);
  padding: 14px 22px;
  border-radius: 8px;
  flex-shrink: 0;
}
.fbwall-trust-score {
  font-family: var(--mono);
  font-size: 26px;
  font-weight: 800;
  color: #F5F2EA;
  line-height: 1;
}
.fbwall-trust-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fbwall-trust-stars {
  color: #D6A84F;
  font-size: 13px;
  letter-spacing: 2px;
  line-height: 1;
}
.fbwall-trust-count {
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #A5A096;
}

/* Layer 1 — FIXED VIEWPORT (overflow: hidden, non-scrollable, passes wheel/touch to page) */
.review-wall-viewport,
.fbwall-cols {
  display: flex;
  justify-content: center;
  gap: clamp(16px, 2vw, 24px);
  height: min(760px, 70vh);
  overflow: hidden !important; /* Strictly clips content; NO internal scroll container */
  position: relative;
  border-top: var(--bd);
  border-bottom: var(--bd);
  padding: 20px 0;
  -webkit-mask: none !important;
  mask: none !important;
  -webkit-mask-image: none !important;
  mask-image: none !important;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y; /* Touch gestures scroll the main page */
  pointer-events: none; /* Mouse wheel & touch drag scroll the page normally */
}

/* Layer 2 — ANIMATED TRACKS */
.fb-col {
  flex: 1 1 0px;
  min-width: 0;
  max-width: 400px;
  overflow: visible;
  pointer-events: none;
}
.fb-track,
.fb-col ul {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 18px;
  list-style: none;
  margin: 0;
  padding: 0;
  will-change: transform;
  pointer-events: none;
}

/* All columns move continuously upward: Bottom -> Top */
@keyframes fbScrollUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.fb-dir-up {
  animation: fbScrollUp var(--dur, 55s) linear infinite;
  will-change: transform;
}

/* Luxury editorial review card design (Variable natural content height) */
.fb-card {
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  padding: 22px 22px 20px;
  min-height: 120px; /* Natural content height */
  pointer-events: none;
  user-select: none;
}
.fb-card-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.fb-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.fb-stars-row {
  color: #D6A84F;
  font-size: 13px;
  letter-spacing: 2px;
  line-height: 1;
}
.fb-source-tag {
  font-family: var(--mono);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #A5A096;
}
.fb-text {
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.65;
  color: #DCD7CD;
  margin: 0;
}
.fb-text--empty {
  font-style: italic;
  font-size: 12px;
  color: #8E887E;
}
.fb-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 2px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.fb-ava {
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.04em;
  background: #202020;
  color: #D6A84F;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.fb-who {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.fb-who cite {
  font-style: normal;
  font-weight: 700;
  font-size: 13px;
  color: #F5F2EA;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fb-who span {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8E887E;
  margin-top: 2px;
}

.fbwall-note {
  margin-top: 36px;
  text-align: center;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray);
}
.fbwall-note::before {
  content: "";
  display: inline-block;
  width: 34px;
  height: 3px;
  background: var(--acc);
  margin-right: 14px;
  vertical-align: middle;
}
.fbwall-note::after {
  content: "";
  display: inline-block;
  width: 34px;
  height: 3px;
  background: var(--acc);
  margin-left: 14px;
  vertical-align: middle;
}

@media (max-width: 960px) {
  .review-wall-viewport,
  .fbwall-cols {
    height: min(700px, 68vh);
  }
  .fb-col {
    max-width: 440px;
  }
}
@media (max-width: 600px) {
  .review-wall-viewport,
  .fbwall-cols {
    height: min(650px, 65vh);
  }
  .fb-col {
    max-width: 100%;
  }
  .fbwall-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
}

/* Reduced motion: static wall clipped inside viewport, NO manual scroll container */
@media (prefers-reduced-motion: reduce) {
  .fb-dir-up {
    animation: none !important;
    transform: none !important;
  }
  .review-wall-viewport,
  .fbwall-cols {
    height: min(760px, 70vh);
    overflow: hidden !important;
    -webkit-mask-image: none;
    mask-image: none;
  }
}

'''

assert old_css_pattern.search(css_content), "Could not find old fbwall in style.css"
updated_css = old_css_pattern.sub(lambda m: new_css_code, css_content, count=1)
with open('site/assets/css/style.css', 'w', encoding='utf-8') as f:
    f.write(updated_css)
print("Updated site/assets/css/style.css successfully.")
