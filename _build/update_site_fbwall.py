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

    function cardEl(r, isDup, index) {
      var li = document.createElement('li');
      li.className = 'fb-card' + (r.x ? '' : ' fb-card--rating');
      if (isDup) {
        li.setAttribute('aria-hidden', 'true');
        li.setAttribute('tabindex', '-1');
      } else {
        li.setAttribute('tabindex', '0');
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

      // Column configs: directions and durations
      // Desktop: 3 cols (col 1 up 52s, col 2 down 61s, col 3 up 57s)
      // Tablet: 2 cols (col 1 up 54s, col 2 down 62s)
      // Mobile: 1 col (col 1 up 85s)
      var colConfigs = [];
      if (cols === 3) {
        colConfigs = [
          { dir: 'up', dur: '52s' },
          { dir: 'down', dur: '61s' },
          { dir: 'up', dur: '57s' }
        ];
      } else if (cols === 2) {
        colConfigs = [
          { dir: 'up', dur: '54s' },
          { dir: 'down', dur: '62s' }
        ];
      } else {
        colConfigs = [
          { dir: 'up', dur: '85s' }
        ];
      }

      var uls = [];
      for (var c = 0; c < cols; c++) {
        var colDiv = document.createElement('div');
        colDiv.className = 'fb-col fb-col-' + (c + 1);
        var ul = document.createElement('ul');
        ul.className = colConfigs[c].dir === 'down' ? 'fb-dir-down' : 'fb-dir-up';
        ul.style.setProperty('--dur', colConfigs[c].dur);
        colDiv.appendChild(ul);
        container.appendChild(colDiv);
        uls.push(ul);
      }

      // Distribute EVERY single review across the visible columns (i % cols)
      // No review is ever dropped on tablet or mobile!
      for (var i = 0; i < data.length; i++) {
        var targetUl = uls[i % cols];
        targetUl.appendChild(cardEl(data[i], false, i));
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
   FEEDBACK WALL — auto-scrolling Google reviews
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

.fbwall-cols {
  display: flex;
  justify-content: center;
  gap: clamp(16px, 2vw, 24px);
  height: min(760px, 70vh);
  overflow: hidden;
  position: relative;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
  scrollbar-width: none;
}
.fbwall-cols::-webkit-scrollbar { display: none; }
.fb-col {
  flex: 1 1 0px;
  min-width: 0;
  max-width: 400px;
  overflow: visible;
  scrollbar-width: none;
}
.fb-col::-webkit-scrollbar { display: none; }
.fb-col ul {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 18px;
  list-style: none;
  margin: 0;
  padding: 0;
  will-change: transform;
}
.fb-col:hover ul, .fb-col:focus-within ul {
  animation-play-state: paused;
}

/* continuous animations: upward and downward */
@keyframes fbScrollUp {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
@keyframes fbScrollDown {
  from { transform: translateY(-50%); }
  to { transform: translateY(0); }
}
.fb-dir-up {
  animation: fbScrollUp var(--dur, 52s) linear infinite;
}
.fb-dir-down {
  animation: fbScrollDown var(--dur, 61s) linear infinite;
}

/* luxury editorial review card design */
.fb-card {
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  padding: 22px 22px 20px;
  transition: transform 0.25s var(--ease), border-color 0.25s ease, box-shadow 0.25s ease;
  cursor: default;
  outline: none;
}
.fb-card:hover, .fb-card:focus-visible {
  transform: translateY(-4px);
  border-color: rgba(214, 168, 79, 0.5);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(214, 168, 79, 0.3);
  background: #181818;
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
  transition: border-color 0.2s ease, color 0.2s ease;
}
.fb-card:hover .fb-ava {
  border-color: #D6A84F;
  color: #F5F2EA;
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
  .fbwall-cols {
    height: min(700px, 68vh);
  }
  .fb-col {
    max-width: 440px;
  }
}
@media (max-width: 600px) {
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

@media (prefers-reduced-motion: reduce) {
  .fb-dir-up, .fb-dir-down {
    animation: none !important;
    transform: none !important;
  }
  .fbwall-cols {
    height: auto;
    max-height: 800px;
    overflow-y: auto;
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
