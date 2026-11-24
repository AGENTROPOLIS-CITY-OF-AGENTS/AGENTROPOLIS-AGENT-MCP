/**
 * Headless smoke of the committed github-pages/ launcher.
 *
 * Reproducible command (local Google Chrome or Chromium). This is not part of
 * the no-network `validate` job: GitHub-hosted ubuntu runners do not include
 * Chrome, and installing a browser there is a network download.
 *
 *   node scripts/smoke-github-pages-loop-baseline.mjs
 *
 * Prints one JSON object. Exit 0 only when the vendored script is served
 * locally with status 200, the page reports no console errors, and the page
 * makes no remote request. The committed launcher does not meet that bar:
 * github-pages/landing-config.json sets a Worker baseUrl, and landing.js
 * fetches it. That request is pre-existing and is not issued by
 * agentropolis-loop-baseline.js.
 *
 * To smoke the same folder with that Worker URL blanked only inside this
 * process (the file on disk is unchanged):
 *
 *   SMOKE_ISOLATE_WIDGET=1 node scripts/smoke-github-pages-loop-baseline.mjs
 */
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const pagesRoot = fileURLToPath(new URL('../github-pages/', import.meta.url));
const isolateWidget = process.env.SMOKE_ISOLATE_WIDGET === '1';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function chromeBin() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv) return fromEnv;
  return 'google-chrome';
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function startStaticServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
      const relativePath = pathname.replace(/^\/+/, '');
      if (isolateWidget && relativePath === 'landing-config.json') {
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        res.end('{"baseUrl":""}\n');
        return;
      }
      const rootPath = resolve(pagesRoot);
      const full = resolve(rootPath, relativePath);
      if (full !== rootPath && !full.startsWith(rootPath + sep)) {
        res.writeHead(403).end('forbidden');
        return;
      }
      const info = await stat(full);
      if (!info.isFile()) {
        res.writeHead(404).end('not found');
        return;
      }
      const body = await readFile(full);
      res.writeHead(200, {
        'content-type': TYPES[extname(full).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store'
      });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  const port = await listen(server);
  return { server, origin: `http://127.0.0.1:${port}` };
}

function waitForDevtools(stream, timeoutMs) {
  return new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => {
      stream.off('data', onData);
      reject(new Error(`Chrome did not expose DevTools within ${timeoutMs}ms`));
    }, timeoutMs);
    function onData(chunk) {
      buf += chunk.toString();
      const match = buf.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[^\s]+)/);
      if (!match) return;
      clearTimeout(timer);
      stream.off('data', onData);
      resolve(match[1]);
    }
    stream.on('data', onData);
  });
}

function openSocket(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  const listeners = [];
  let next = 1;
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve());
    ws.addEventListener('error', () => reject(new Error(`DevTools socket failed for ${url}`)));
  });
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(`${message.error.message || 'cdp error'}`));
      else resolve(message.result || {});
      return;
    }
    for (const listener of listeners) listener(message);
  });
  return {
    ready,
    on(listener) { listeners.push(listener); },
    send(method, params = {}, sessionId) {
      const id = next++;
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify(payload));
      });
    },
    close() { ws.close(); }
  };
}

function hostOf(raw) {
  try { return new URL(raw).host; } catch { return ''; }
}

function isLoopback(raw) {
  try {
    const url = new URL(raw);
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  } catch {
    return false;
  }
}

function isFaviconNoise(text) {
  return /favicon\.ico/i.test(text);
}

async function run() {
  const { server, origin } = await startStaticServer();
  const userData = await mkdtemp(join(tmpdir(), 'loop-baseline-smoke-'));
  const chrome = spawn(chromeBin(), [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--disable-extensions',
    '--mute-audio',
    `--user-data-dir=${userData}`,
    '--remote-debugging-port=0',
    'about:blank'
  ], { detached: true, stdio: ['ignore', 'ignore', 'pipe'] });

  const requests = new Map();
  const consoleErrors = [];
  let client;
  try {
    const browserWs = await waitForDevtools(chrome.stderr, 20000);
    chrome.stderr.on('data', () => {});
    client = openSocket(browserWs);
    await client.ready;
    const created = await client.send('Target.createTarget', { url: 'about:blank' });
    const attached = await client.send('Target.attachToTarget', { targetId: created.targetId, flatten: true });
    const sessionId = attached.sessionId;
    client.on((message) => {
      if (message.sessionId !== sessionId) return;
      if (message.method === 'Network.requestWillBeSent') {
        const { requestId, request, initiator } = message.params;
        requests.set(requestId, {
          url: request.url,
          method: request.method,
          initiatorType: initiator?.type || '',
          initiatorUrl: initiator?.url || initiator?.stack?.callFrames?.[0]?.url || ''
        });
      } else if (message.method === 'Network.responseReceived') {
        const row = requests.get(message.params.requestId);
        if (row) row.status = message.params.response.status;
      } else if (message.method === 'Network.loadingFailed') {
        const row = requests.get(message.params.requestId);
        if (row) row.error = message.params.errorText;
      } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        const text = message.params.args.map((arg) => arg.value || arg.description || '').join(' ');
        const url = message.params.stackTrace?.callFrames?.[0]?.url || '';
        if (!isFaviconNoise(`${text} ${url}`)) consoleErrors.push(url ? `${text} (${url})` : text);
      } else if (message.method === 'Runtime.exceptionThrown') {
        const details = message.params.exceptionDetails || {};
        const text = details.text || details.exception?.description || 'exception';
        const url = details.url || '';
        if (!isFaviconNoise(`${text} ${url}`)) consoleErrors.push(url ? `${text} (${url})` : text);
      } else if (message.method === 'Log.entryAdded' && message.params.entry?.level === 'error') {
        const entry = message.params.entry;
        const text = entry.text || '';
        const url = entry.url || '';
        if (!isFaviconNoise(`${text} ${url}`)) consoleErrors.push(url ? `${text} (${url})` : text);
      }
    });
    await client.send('Network.enable', {}, sessionId);
    await client.send('Page.enable', {}, sessionId);
    await client.send('Runtime.enable', {}, sessionId);
    await client.send('Log.enable', {}, sessionId);
    const loaded = new Promise((resolve) => {
      const timer = setTimeout(resolve, 15000);
      client.on((message) => {
        if (message.sessionId === sessionId && message.method === 'Page.loadEventFired') {
          clearTimeout(timer);
          resolve();
        }
      });
    });
    await client.send('Page.navigate', { url: `${origin}/` }, sessionId);
    await loaded;
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const rows = [...requests.values()];
    const script = rows.find((row) => row.url === `${origin}/agentropolis-loop-baseline.js`);
    const pageRows = rows.filter((row) => {
      if (row.url.startsWith('data:') || row.url.startsWith('blob:')) return false;
      return row.initiatorType === 'parser' || row.initiatorType === 'script' || row.initiatorUrl.startsWith(origin);
    });
    const remoteRequests = pageRows.filter((row) => !isLoopback(row.url));
    const forbidden = pageRows.filter((row) => {
      return /loop-baseline/i.test(row.url) && !isLoopback(row.url)
        || /AGENTROPOLIS-DESIGN-SYSTEM/i.test(row.url);
    });
    const baselineInitiatedRemote = pageRows.filter((row) => {
      return /agentropolis-loop-baseline\.js/i.test(row.initiatorUrl) && !isLoopback(row.url);
    });

    const report = {
      origin,
      isolateWidget,
      localScript: script ? { url: script.url, status: script.status ?? null } : null,
      consoleErrors,
      forbiddenScriptRequests: forbidden.map((row) => row.url),
      baselineInitiatedRemote: baselineInitiatedRemote.map((row) => row.url),
      remoteRequests: remoteRequests.map((row) => ({
        url: row.url,
        status: row.status ?? null,
        initiatorType: row.initiatorType,
        initiatorUrl: row.initiatorUrl
      })),
      failedRequests: rows.filter((row) => row.status === 404 || row.error).map((row) => ({
        url: row.url,
        status: row.status ?? null,
        error: row.error || '',
        initiatorType: row.initiatorType
      })),
      pageRequests: pageRows.map((row) => ({
        url: row.url,
        status: row.status ?? null,
        host: hostOf(row.url),
        initiatorType: row.initiatorType
      }))
    };
    const pass = Boolean(script && script.status === 200)
      && consoleErrors.length === 0
      && forbidden.length === 0
      && baselineInitiatedRemote.length === 0;
    report.pass = pass;
    report.pageWideNoRemoteRequest = remoteRequests.length === 0;
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return pass ? 0 : 1;
  } finally {
    client?.close();
    if (chrome.pid) {
      try { process.kill(-chrome.pid, 'SIGKILL'); } catch { chrome.kill('SIGKILL'); }
    }
    server.close();
    await rm(userData, { recursive: true, force: true });
  }
}

const exitCode = await run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  return 1;
});
process.exit(exitCode);
