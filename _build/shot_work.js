const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9229',
    '--window-size=1440,900',
    'http://localhost:8080/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9229/json', res => {
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

    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
        document.getElementById('work').scrollIntoView({ behavior: 'instant', block: 'start' });
      `
    });

    await new Promise(r => setTimeout(r, 600));

    const shot = await send('Page.captureScreenshot');
    fs.writeFileSync('_build/work_section.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved _build/work_section.png');

    ws.close();
  } finally {
    edge.kill();
  }
}

main().catch(console.error);
