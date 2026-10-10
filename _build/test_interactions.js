const http = require('http');
const { spawn } = require('child_process');

async function test() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9240',
    '--window-size=375,667',
    'http://localhost:5173/'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    let pageTab = null;
    for (let i = 0; i < 20; i++) {
      const tabs = await new Promise((resolve) => {
        http.get('http://localhost:9240/json', res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', () => resolve([]));
      });
      pageTab = tabs.find(t => t.type === 'page' && t.url.includes('5173'));
      if (pageTab) break;
      await new Promise(r => setTimeout(r, 200));
    }
    if (!pageTab) throw new Error('Could not find 5173 page tab');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
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

    for (const w of [320, 360, 375]) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: 640, deviceScaleFactor: 1, mobile: true });
      await new Promise(r => setTimeout(r, 300));

      // Test mobile menu open
      const menuTest = await send('Runtime.evaluate', {
        expression: `(() => {
          const burger = document.querySelector('#burger');
          burger.click();
          const menu = document.querySelector('#mobileMenu');
          const isMenuOpen = menu.classList.contains('is-open');
          const menuRect = menu.getBoundingClientRect();
          const docScrollW = document.documentElement.scrollWidth;
          const overflow = docScrollW > window.innerWidth;
          
          // Close menu again
          burger.click();
          
          return { w: ${w}, isMenuOpen, menuWidth: Math.round(menuRect.width), overflow, docScrollW, winW: window.innerWidth };
        })()`,
        returnByValue: true
      });
      console.log('MENU TEST:', JSON.stringify(menuTest.result.value));

      // Test concierge open
      const concTest = await send('Runtime.evaluate', {
        expression: `(() => {
          const fab = document.querySelector('#concFab');
          fab.click();
          const panel = document.querySelector('#concPanel');
          const panelRect = panel.getBoundingClientRect();
          const docScrollW = document.documentElement.scrollWidth;
          const overflow = docScrollW > window.innerWidth;
          
          // Close panel
          document.querySelector('#concClose').click();

          return {
            w: ${w},
            panelLeft: Math.round(panelRect.left),
            panelRight: Math.round(panelRect.right),
            panelWidth: Math.round(panelRect.width),
            overflow,
            docScrollW,
            winW: window.innerWidth
          };
        })()`,
        returnByValue: true
      });
      console.log('CONCIERGE TEST:', JSON.stringify(concTest.result.value));

    }

    ws.close();
  } finally { edge.kill(); }
}
test().catch(console.error);
