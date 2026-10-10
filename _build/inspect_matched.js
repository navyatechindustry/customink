const http = require('http');
const { spawn } = require('child_process');

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9225',
    '--window-size=1440,900',
    'http://localhost:8080/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://localhost:9225/json', res => {
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

    await send('DOM.enable');
    await send('CSS.enable');

    const doc = await send('DOM.getDocument');
    const node = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '.review-track' });
    console.log('Node id:', node.nodeId);

    const matched = await send('CSS.getMatchedStylesForNode', { nodeId: node.nodeId });
    
    // Find all rules setting animation or animation-name
    for (let match of matched.matchedCSSRules || []) {
      for (let prop of match.rule.style.cssProperties) {
        if (prop.name.includes('anim')) {
          console.log(`[${match.rule.selectorList.text}] ${prop.name}: ${prop.value} (disabled: ${prop.disabled}, important: ${prop.important})`);
        }
      }
    }

    // Check inline style
    if (matched.inlineStyle) {
      for (let prop of matched.inlineStyle.cssProperties) {
        if (prop.name.includes('anim')) {
          console.log(`[inline] ${prop.name}: ${prop.value}`);
        }
      }
    }

    ws.close();
  } finally {
    edge.kill();
  }
}

main().catch(console.error);
