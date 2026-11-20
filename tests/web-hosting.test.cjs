'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server/server.cjs');

test('Render serves the web app, public assets, and API without exposing private files', async t => {
  const server = createServer({ apiKey: '', publicOrigin: 'https://osaia-ai-web.onrender.com' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;

  const home = await fetch(base + '/');
  assert.equal(home.status, 200);
  assert.match(home.headers.get('content-type'), /text\/html/);
  assert.match(await home.text(), /OSAIA AI/);

  for (const asset of ['/app.js', '/styles.css', '/sw.js', '/manifest.webmanifest', '/icons/icon.svg']) {
    const response = await fetch(base + asset);
    assert.equal(response.status, 200, 'asset: ' + asset);
    assert.ok((await response.arrayBuffer()).byteLength > 0, 'asset content: ' + asset);
  }
  for (const forbidden of ['/server/server.cjs', '/package.json', '/.env', '/tests/server.test.cjs']) {
    const response = await fetch(base + forbidden);
    assert.equal(response.status, 404, 'private file must stay hidden: ' + forbidden);
  }

  const health = await fetch(base + '/health');
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok', aiConfigured: false });

  const preflight = await fetch(base + '/api/chat', {
    method: 'OPTIONS',
    headers: { Origin: 'https://osaia-ai-web.onrender.com', 'Access-Control-Request-Method': 'POST' }
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://osaia-ai-web.onrender.com');

  const chat = await fetch(base + '/api/chat', {
    method: 'POST',
    headers: { Origin: 'https://osaia-ai-web.onrender.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }] })
  });
  assert.equal(chat.status, 503);
  assert.match((await chat.json()).error, /no está configurada/);

  const denied = await fetch(base + '/api/chat', {
    method: 'POST',
    headers: { Origin: 'https://malicious.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }] })
  });
  assert.equal(denied.status, 403);
});
