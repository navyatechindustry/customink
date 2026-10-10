const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function capture() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9241',
    '--window-size=1600,1000',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9241/json', (res) => {
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

    const outDir = path.join(__dirname, 'shots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const viewports = [
      { name: 'mobile_375', w: 375, h: 812 },
      { name: 'tablet_768', w: 768, h: 1024 },
      { name: 'desktop_1440', w: 1440, h: 900 }
    ];

    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.w <= 768
      });
      await new Promise(r => setTimeout(r, 600));

      const shotHero = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(outDir, `${vp.name}_hero.png`), Buffer.from(shotHero.data, 'base64'));

      await send('Runtime.evaluate', {
        expression: `document.getElementById('feedbackWall').scrollIntoView({ behavior: 'instant', block: 'center' })`
      });
      await new Promise(r => setTimeout(r, 600));
      const shotFb = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(outDir, `${vp.name}_fbwall.png`), Buffer.from(shotFb.data, 'base64'));

      await send('Runtime.evaluate', {
        expression: `document.getElementById('book').scrollIntoView({ behavior: 'instant', block: 'center' })`
      });
      await new Promise(r => setTimeout(r, 600));
      const shotForm = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(outDir, `${vp.name}_form.png`), Buffer.from(shotForm.data, 'base64'));
    }

    console.log('Captures completed successfully in', outDir);
    ws.close();
  } finally {
    edge.kill();
  }
}

capture().catch(console.error);
