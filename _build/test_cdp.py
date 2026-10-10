import subprocess, time, json, urllib.request

# Start Edge with remote debugging port
proc = subprocess.Popen([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless',
    '--remote-debugging-port=9222',
    '--window-size=1280,900',
    'http://localhost:8080/index.html'
])

time.sleep(2)

try:
    tabs = json.loads(urllib.request.urlopen('http://localhost:9222/json').read().decode('utf-8'))
    print('Tabs:', len(tabs))
    ws_url = tabs[0].get('webSocketDebuggerUrl')
    print('WebSocket URL:', ws_url)
finally:
    proc.terminate()
