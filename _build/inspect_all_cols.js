const http = require('http');
const { spawn } = require('child_process');

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9226',
    '--window-size=1440,900',
    'http://localhost:8080/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9226/json', res => {
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

    const evalCode = `
      (function() {
        const tracks = document.querySelectorAll('.review-track');
        return Array.from(tracks).map((t, idx) => {
          const s = getComputedStyle(t);
          return {
            col: idx + 1,
            animName: s.animationName,
            duration: s.animationDuration,
            playState: s.animationPlayState,
            transform: s.transform
          };
        });
      })()
    `;

    const r1 = await send('Runtime.evaluate', { expression: evalCode, returnByValue: true });
    console.log('T=0s:', JSON.stringify(r1.result.value, null, 2));

    await new Promise(r => setTimeout(r, 1500));

    const r2 = await send('Runtime.evaluate', { expression: evalCode, returnByValue: true });
    console.log('T=1.5s:', JSON.stringify(r2.result.value, null, 2));

    ws.close();
  } finally {
    edge.kill();
  }
}

main().catch(console.error);
