const http = require('http');
const { spawn } = require('child_process');

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9224',
    '--window-size=1440,900',
    'http://localhost:8080/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9224/json', res => {
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

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const t = document.querySelector('.review-track');
          const rules = [];
          for (let sheet of document.styleSheets) {
            try {
              for (let rule of sheet.cssRules) {
                if (rule.selectorText && (rule.selectorText.includes('review-track') || rule.selectorText.includes('fb-track') || rule.selectorText.includes('fb-dir-up'))) {
                  rules.push({ selector: rule.selectorText, cssText: rule.cssText });
                }
              }
            } catch (e) {
              rules.push({ error: e.message });
            }
          }
          return {
            classes: t.className,
            inlineStyle: t.getAttribute('style'),
            matchedInSheets: rules
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Result:', JSON.stringify(evalRes.result.value, null, 2));
    ws.close();
  } finally {
    edge.kill();
  }
}

main().catch(console.error);
