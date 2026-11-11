'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('PWA manifest is valid, scoped to project path, and links to an icon', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(icon => icon.src === './icons/icon.svg'));
  assert.match(read('icons/icon.svg'), /<svg /);
  assert.match(read('index.html'), /href="\.\/manifest\.webmanifest"/);
});

test('service worker is valid JavaScript and is registered by the web app', () => {
  assert.doesNotThrow(() => new vm.Script(read('sw.js')));
  assert.match(read('app.js'), /serviceWorker\.register\('\.\/sw\.js'/);
  assert.match(read('app.js'), /registration\.update\(\)/);
});

test('offline worker caches only allowlisted same-origin GET assets, not user messages or APIs', async () => {
  const events = new Map();
  const cached = [];
  const fetched = [];
  const cache = {
    addAll: async assets => cached.push(...assets),
    put: async request => cached.push(request.url),
    match: async () => undefined
  };
  const self = {
    registration: { scope: 'https://example.github.io/mi-ia/' },
    location: { origin: 'https://example.github.io' },
    addEventListener: (type, handler) => events.set(type, handler),
    skipWaiting: async () => {},
    clients: { claim: async () => {} }
  };
  const context = {
    self, URL, Set, Promise, Response,
    caches: { open: async () => cache, keys: async () => [] },
    fetch: async request => {
      fetched.push(request.url);
      return { ok: true, type: 'basic', clone() { return this; } };
    }
  };
  vm.runInNewContext(read('sw.js'), context);
  let installation;
  events.get('install')({ waitUntil: promise => { installation = promise; } });
  await installation;
  assert.ok(cached.includes('./index.html'));
  assert.ok(cached.includes('./app.js'));
  assert.ok(cached.includes('./manifest.webmanifest'));

  async function request(url, method = 'GET') {
    let response;
    events.get('fetch')({
      request: { url, method, mode: 'same-origin' },
      respondWith: promise => { response = promise; }
    });
    if (response) await response;
    return Boolean(response);
  }
  assert.equal(await request('https://example.github.io/mi-ia/app.js'), true);
  assert.equal(await request('https://example.github.io/mi-ia/api/chat'), false);
  assert.equal(await request('https://other.example/api/chat'), false);
  assert.equal(await request('https://example.github.io/mi-ia/index.html', 'POST'), false);
  assert.equal(fetched.length, 1);
  assert.ok(!cached.some(item => String(item).includes('/api/chat')));
});

test('Pages deploy artifact includes all PWA assets', () => {
  const workflow = read('.github/workflows/pages.yml');
  assert.match(workflow, /cp index\.html app\.js styles\.css sw\.js manifest\.webmanifest public\//);
  assert.match(workflow, /cp icons\/icon\.svg public\/icons\//);
});
