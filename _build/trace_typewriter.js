const http = require('http');
const { spawn } = require('child_process');

async function testFromStart() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9235',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const tabs = await new Promise((res, rej) => {
      http.get('http://localhost:9235/json', r => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const pageTab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(m, p = {}) {
      return new Promise(r => {
        const i = id++;
        const h = e => { const msg = JSON.parse(e.data); if (msg.id === i) { ws.removeEventListener('message', h); r(msg.result); } };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: i, method: m, params: p }));
      });
    }

    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:8080/index.html' });

    // Wait for load
    await new Promise(r => setTimeout(r, 600));

    console.log('--- Tracing Card 0 ("Forearm sleeve") and Card 1 ("Forearm") ---');
    for (let t = 0; t <= 3500; t += 250) {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          ({
            t: ${t},
            c0: document.querySelector('#masonry .g-item:nth-child(1) .g-place-text') ? document.querySelector('#masonry .g-item:nth-child(1) .g-place-text').textContent : '',
            c1: document.querySelector('#masonry .g-item:nth-child(2) .g-place-text') ? document.querySelector('#masonry .g-item:nth-child(2) .g-place-text').textContent : '',
            c2: document.querySelector('#masonry .g-item:nth-child(3) .g-place-text') ? document.querySelector('#masonry .g-item:nth-child(3) .g-place-text').textContent : ''
          })
        `,
        returnByValue: true
      });
      console.log(`t=${t}ms:`, evalRes.result.value);
      await new Promise(r => setTimeout(r, 250));
    }

    ws.close();
  } finally {
    edge.kill();
  }
}

testFromStart().catch(console.error);
