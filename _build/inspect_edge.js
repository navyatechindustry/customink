const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9223',
    '--window-size=1440,900',
    'http://localhost:8080/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9223/json', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const pageTab = tabs.find(t => t.type === 'page');
    console.log('Page tab:', pageTab.title, pageTab.url);

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

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

    // Evaluate in page
    const evalCode = `
      (function() {
        const cols = document.querySelectorAll('.review-column');
        const tracks = document.querySelectorAll('.review-track');
        const anims = document.getAnimations ? document.getAnimations() : [];
        const track1 = tracks[0];
        const style1 = track1 ? getComputedStyle(track1) : null;
        return {
          colsCount: cols.length,
          tracksCount: tracks.length,
          animsCount: anims.length,
          col1: {
            animName: style1 ? style1.animationName : null,
            animDuration: style1 ? style1.animationDuration : null,
            animPlayState: style1 ? style1.animationPlayState : null,
            transform: style1 ? style1.transform : null,
            height: track1 ? track1.offsetHeight : null
          }
        };
      })()
    `;

    const r1 = await send('Runtime.evaluate', { expression: evalCode, returnByValue: true });
    console.log('T=0s:', JSON.stringify(r1.result.value, null, 2));

    await new Promise(r => setTimeout(r, 2000));

    const r2 = await send('Runtime.evaluate', { expression: evalCode, returnByValue: true });
    console.log('T=2s:', JSON.stringify(r2.result.value, null, 2));

    // Also capture screenshot
    const shot = await send('Page.captureScreenshot');
    if (shot && shot.data) {
      fs.writeFileSync('_build/screenshot_live.png', Buffer.from(shot.data, 'base64'));
      console.log('Screenshot saved to _build/screenshot_live.png');
    }

    ws.close();
  } finally {
    edge.kill();
  }
}

main().catch(console.error);
