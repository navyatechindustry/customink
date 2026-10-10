const http = require('http');
const { spawn } = require('child_process');

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9232',
    '--window-size=1440,900',
    'http://localhost:8080/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9232/json', res => {
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

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', msg.params.exceptionDetails);
      }
    });

    await send('Runtime.enable');
    await send('Page.enable');

    const res = await send('Runtime.evaluate', {
      expression: `
        ({
          masonryCount: document.querySelectorAll('#masonry .g-place').length,
          hasInitFn: typeof window.__mapTestRoute,
          scripts: Array.from(document.querySelectorAll('script')).map(s => s.src)
        })
      `,
      returnByValue: true
    });
    console.log('Inspection:', JSON.stringify(res.result.value, null, 2));

    ws.close();
  } finally {
    edge.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
