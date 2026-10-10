const http = require('http');
const { spawn } = require('child_process');

async function test() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9237',
    '--window-size=1400,900',
    'http://localhost:5173/'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  try {
    const tabs = await new Promise(res => http.get('http://localhost:9237/json', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }));
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    function send(m, p = {}) {
      return new Promise(res => {
        const i = id++;
        const h = e => { const d = JSON.parse(e.data); if (d.id === i) { ws.removeEventListener('message', h); res(d.result); } };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: i, method: m, params: p }));
      });
    }
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1000));
    
    for (const w of [1000, 1081, 1100, 1140, 1200, 1280]) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: 800, deviceScaleFactor: 1, mobile: false });
      await new Promise(r => setTimeout(r, 200));
      const check = await send('Runtime.evaluate', {
        expression: `(() => {
          const brand = document.querySelector('.brand').getBoundingClientRect();
          const links = document.querySelector('.nav-links').getBoundingClientRect();
          const cta = document.querySelector('.nav-cta').getBoundingClientRect();
          const inner = document.querySelector('.nav-inner').getBoundingClientRect();
          return {
            w: ${w},
            brandRight: Math.round(brand.right),
            linksLeft: Math.round(links.left),
            linksRight: Math.round(links.right),
            ctaLeft: Math.round(cta.left),
            gapBrandLinks: Math.round(links.left - brand.right),
            gapLinksCta: Math.round(cta.left - links.right),
            innerScrollWidth: Math.round(document.querySelector('.nav-inner').scrollWidth),
            innerWidth: Math.round(inner.width)
          };
        })()`,
        returnByValue: true
      });
      console.log(JSON.stringify(check));
    }
    ws.close();
  } finally { edge.kill(); }
}
test().catch(console.error);
