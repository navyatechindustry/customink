const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const VIEWPORTS = [
  { name: '320_small_mobile', width: 320, height: 640 },
  { name: '375_standard_mobile', width: 375, height: 667 },
  { name: '430_large_mobile', width: 430, height: 932 },
  { name: '768_tablet_portrait', width: 768, height: 1024 },
  { name: '1024_tablet_landscape', width: 1024, height: 768 },
  { name: '1100_small_laptop', width: 1100, height: 800 },
  { name: '1440_desktop', width: 1440, height: 900 },
  { name: '1920_large_desktop', width: 1920, height: 1080 },
  { name: '2560_ultrawide', width: 2560, height: 1080 },
];

async function run() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9239',
    '--window-size=1600,1000',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9239/json', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const pageTab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (event) => {
          const res = JSON.parse(event.data);
          if (res.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    const report = [];

    for (const vp of VIEWPORTS) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 900
      });
      await new Promise(r => setTimeout(r, 400));

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const docScrollsH = docWidth > winWidth;

            // Header checks
            const nav = document.querySelector('.nav');
            const navInner = document.querySelector('.nav-inner');
            const brand = document.querySelector('.brand');
            const navLinks = document.querySelector('.nav-links');
            const burger = document.querySelector('.burger');
            const navCtaBtn = document.querySelector('.nav-cta .btn');

            const navLinksDisplay = navLinks ? window.getComputedStyle(navLinks).display : 'none';
            const burgerDisplay = burger ? window.getComputedStyle(burger).display : 'none';
            const navCtaBtnDisplay = navCtaBtn ? window.getComputedStyle(navCtaBtn).display : 'none';

            // Check if nav overflows its container
            const navInnerScrollWidth = navInner ? navInner.scrollWidth : 0;
            const navInnerClientWidth = navInner ? navInner.clientWidth : 0;
            const navOverflow = navInnerScrollWidth > navInnerClientWidth;

            // Hero title check
            const heroTitle = document.querySelector('.hero-title');
            const heroTitleRect = heroTitle ? heroTitle.getBoundingClientRect() : null;
            const heroCtas = document.querySelector('.hero-ctas');
            const heroTrust = document.querySelector('.hero-trust');

            // Feedback wall check
            const fbCols = document.querySelectorAll('#fbwallCols .review-column').length;
            const fbCards = document.querySelectorAll('#fbwallCols .review-card').length;

            // Form check
            const form = document.querySelector('.book-form');
            const formRect = form ? form.getBoundingClientRect() : null;
            const frmRows = Array.from(document.querySelectorAll('.frm-row, .frm-row-4')).map(r => {
              const cs = window.getComputedStyle(r);
              return cs.gridTemplateColumns;
            });

            // Masonry check
            const masonry = document.querySelector('.masonry');
            const masonryCols = masonry ? window.getComputedStyle(masonry).columnCount : null;

            // Check any elements extending beyond right edge
            const overflowingEls = [];
            document.querySelectorAll('body *').forEach(el => {
              if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
              const cs = window.getComputedStyle(el);
              if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
              const r = el.getBoundingClientRect();
              if (r.right > winWidth + 2) {
                // Check if parent has overflow hidden
                let parent = el.parentElement;
                let clipped = false;
                while (parent && parent !== document.body) {
                  const pcs = window.getComputedStyle(parent);
                  if (pcs.overflowX === 'hidden' || pcs.overflow === 'hidden') {
                    clipped = true;
                    break;
                  }
                  parent = parent.parentElement;
                }
                if (!clipped) {
                  const tag = el.tagName.toLowerCase();
                  const cls = el.className ? '.' + String(el.className).trim().split(/\\s+/).join('.') : '';
                  const id = el.id ? '#' + el.id : '';
                  overflowingEls.push({ sel: tag + id + cls, right: Math.round(r.right), excess: Math.round(r.right - winWidth) });
                }
              }
            });

            return {
              viewport: "${vp.name}",
              winWidth,
              docWidth,
              docScrollsH,
              nav: {
                overflow: navOverflow,
                innerScrollWidth: navInnerScrollWidth,
                innerClientWidth: navInnerClientWidth,
                burgerDisplay,
                navLinksDisplay,
                navCtaBtnDisplay
              },
              hero: {
                titleWidth: heroTitleRect ? Math.round(heroTitleRect.width) : 0,
                titleRight: heroTitleRect ? Math.round(heroTitleRect.right) : 0
              },
              fbWall: {
                cols: fbCols,
                totalCardsRendered: fbCards
              },
              masonry: {
                columns: masonryCols
              },
              unclippedOverflowCount: overflowingEls.length,
              unclippedOverflowSample: overflowingEls.slice(0, 5)
            };
          })()
        `,
        returnByValue: true
      });

      if (res && res.result && res.result.value) {
        report.push(res.result.value);
      } else {
        report.push({ error: res });
      }
    }

    fs.writeFileSync('_build/audit_report.json', JSON.stringify(report, null, 2));
    console.log('AUDIT COMPLETED. Results written to _build/audit_report.json');
    console.log(JSON.stringify(report, null, 2));

    ws.close();
  } finally {
    edge.kill();
  }
}

run().catch(console.error);
