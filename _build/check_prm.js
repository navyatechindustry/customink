const http = require('http');
const { spawn } = require('child_process');

async function check() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9234',
    'http://localhost:5174/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  try {
    const tabs = await new Promise((res, rej) => {
      http.get('http://localhost:9234/json', r => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
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
    const res = await send('Runtime.evaluate', {
      expression: `
        ({
          prm: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          placeCount: document.querySelectorAll('#masonry .g-place').length,
          placeFirstHtml: document.querySelector('#masonry .g-place') ? document.querySelector('#masonry .g-place').outerHTML : null
        })
      `,
      returnByValue: true
    });
    console.log('Result:', JSON.stringify(res.result.value, null, 2));
    ws.close();
  } finally { edge.kill(); }
}
check();
