const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9231',
    '--window-size=1440,900',
    'http://localhost:8080/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9231/json', res => {
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
        window.scrollTo(0, document.getElementById('work').offsetTop + 350);
      `
    });

    // Sample text at t = 300ms
    await new Promise(r => setTimeout(r, 300));
    let evalRes1 = await send('Runtime.evaluate', {
      expression: `
        Array.from(document.querySelectorAll('#masonry .g-item')).slice(0, 4).map(it => ({
          title: it.getAttribute('data-title'),
          full: it.getAttribute('data-place'),
          rendered: it.querySelector('.g-place-text') ? it.querySelector('.g-place-text').textContent : 'none',
          html: it.querySelector('.g-place') ? it.querySelector('.g-place').outerHTML : 'none'
        }))
      `,
      returnByValue: true
    });
    console.log('Sample at 300ms:', JSON.stringify(evalRes1.result.value, null, 2));

    const shot1 = await send('Page.captureScreenshot');
    fs.writeFileSync('_build/typewriter_frame1.png', Buffer.from(shot1.data, 'base64'));

    // Sample text at t = 900ms
    await new Promise(r => setTimeout(r, 600));
    let evalRes2 = await send('Runtime.evaluate', {
      expression: `
        Array.from(document.querySelectorAll('#masonry .g-item')).slice(0, 4).map(it => ({
          title: it.getAttribute('data-title'),
          full: it.getAttribute('data-place'),
          rendered: it.querySelector('.g-place-text') ? it.querySelector('.g-place-text').textContent : 'none'
        }))
      `,
      returnByValue: true
    });
    console.log('Sample at 900ms:', JSON.stringify(evalRes2.result.value, null, 2));

    const shot2 = await send('Page.captureScreenshot');
    fs.writeFileSync('_build/typewriter_frame2.png', Buffer.from(shot2.data, 'base64'));

    // Sample text at t = 1800ms
    await new Promise(r => setTimeout(r, 900));
    let evalRes3 = await send('Runtime.evaluate', {
      expression: `
        Array.from(document.querySelectorAll('#masonry .g-item')).slice(0, 4).map(it => ({
          title: it.getAttribute('data-title'),
          full: it.getAttribute('data-place'),
          rendered: it.querySelector('.g-place-text') ? it.querySelector('.g-place-text').textContent : 'none'
        }))
      `,
      returnByValue: true
    });
    console.log('Sample at 1800ms:', JSON.stringify(evalRes3.result.value, null, 2));

    const shot3 = await send('Page.captureScreenshot');
    fs.writeFileSync('_build/typewriter_frame3.png', Buffer.from(shot3.data, 'base64'));

    ws.close();
  } finally {
    edge.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
