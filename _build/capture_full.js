const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function captureFull() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9237',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const tabs = await new Promise((res, rej) => {
      http.get('http://localhost:9237/json', r => {
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
    await new Promise(r => setTimeout(r, 500));

    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
        window.scrollTo(0, document.getElementById('work').offsetTop + 350);
      `
    });

    // Wait until full text is typed and holding
    await new Promise(r => setTimeout(r, 1800));
    const s = await send('Page.captureScreenshot');
    fs.writeFileSync('_build/typewriter_complete_hold.png', Buffer.from(s.data, 'base64'));

    console.log('Saved _build/typewriter_complete_hold.png');
    ws.close();
  } finally {
    edge.kill();
  }
}

captureFull().catch(console.error);
