const http = require('http');
const { spawn } = require('child_process');

const VIEWPORTS = [
  { name: 'Mobile 320', width: 320, height: 640 },
  { name: 'Mobile 360', width: 360, height: 740 },
  { name: 'Mobile 375', width: 375, height: 667 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 414', width: 414, height: 896 },
  { name: 'Mobile 430', width: 430, height: 932 },
  { name: 'Tablet 600', width: 600, height: 960 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Small Laptop 1024', width: 1024, height: 768 },
  { name: 'Desktop 1280', width: 1280, height: 800 },
  { name: 'Desktop 1440', width: 1440, height: 900 },
  { name: 'Large Desktop 1920', width: 1920, height: 1080 },
  { name: 'Ultrawide 2560', width: 2560, height: 1080 }
];

async function run() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9235',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9235/json', res => {
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

    const consoleMessages = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleMessages.push({ type: msg.params.type, text: msg.params.args.map(a => a.value || a.description).join(' ') });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleMessages.push({ type: 'error', text: JSON.stringify(msg.params.exceptionDetails) });
      }
    });

    await send('Runtime.enable');
    await send('Page.enable');

    console.log('--- AUDITING VIEWPORTS ---');

    for (const vp of VIEWPORTS) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 900
      });
      await new Promise(r => setTimeout(r, 400));

      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const hasHOverflow = docWidth > winWidth;
            
            // Find overflowing elements
            const overflowing = [];
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > winWidth + 1 || r.left < -1) {
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden' && style.position !== 'fixed') {
                  const desc = (el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + String(el.className).split(' ').join('.') : '')).slice(0, 50);
                  overflowing.push({ desc, left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) });
                  if (overflowing.length > 5) break;
                }
              }
            }

            const burger = document.querySelector('.burger');
            const burgerVisible = burger ? window.getComputedStyle(burger).display !== 'none' : false;
            const navLinks = document.querySelector('.nav-links');
            const navLinksVisible = navLinks ? window.getComputedStyle(navLinks).display !== 'none' : false;
            const fbCols = document.querySelectorAll('#fbwallCols .review-column').length;

            return {
              winWidth,
              docWidth,
              hasHOverflow,
              overflowCount: overflowing.length,
              overflowingSample: overflowing.slice(0, 3),
              burgerVisible,
              navLinksVisible,
              fbCols
            };
          })()
        `,
        returnByValue: true
      });

      console.log(JSON.stringify({ vp: vp.name, data: evalRes && evalRes.result ? evalRes.result.value : evalRes }));

    }

    console.log('--- CONSOLE LOGS ---');
    console.log(JSON.stringify(consoleMessages));

    ws.close();
  } finally {
    edge.kill();
  }
}

run().catch(console.error);
