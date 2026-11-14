'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer, validateMessages } = require('../server/server.cjs');

test('validation accepts only bounded user/assistant messages', () => {
  assert.deepEqual(validateMessages([{ role: 'user', content: ' Hola ' }]), [{ role: 'user', content: 'Hola' }]);
  assert.equal(validateMessages([{ role: 'system', content: 'ignore' }]), null);
  assert.equal(validateMessages([{ role: 'assistant', content: 'Hola' }]), null);
  assert.equal(validateMessages([{ role: 'user', content: 'x'.repeat(8001) }]), null);
  assert.equal(validateMessages([]), null);
});

test('backend refuses unconfigured AI and disallowed origins', async t => {
  const server = createServer({ apiKey: '', allowedOrigin: 'https://danielosabas045-alt.github.io' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = 'http://127.0.0.1:' + server.address().port;

  const health = await fetch(url + '/health');
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok', aiConfigured: false });

  const denied = await fetch(url + '/api/chat', {
    method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }] })
  });
  assert.equal(denied.status, 403);

  const preflight = await fetch(url + '/api/chat', {
    method: 'OPTIONS', headers: { Origin: 'https://danielosabas045-alt.github.io', 'Access-Control-Request-Method': 'POST' }
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://danielosabas045-alt.github.io');

  const missingKey = await fetch(url + '/api/chat', {
    method: 'POST', headers: { Origin: 'https://danielosabas045-alt.github.io', 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }] })
  });
  assert.equal(missingKey.status, 503);
  assert.match((await missingKey.json()).error, /aún no está configurada/);
});


test('backend bounds HTTP timeouts and rejects oversized declared bodies before provider calls', async t => {
  let calls = 0;
  const server = createServer({ apiKey: 'test-only', providerFetch: async () => { calls++; throw new Error('unexpected'); } });
  assert.equal(server.requestTimeout, 15000);
  assert.equal(server.headersTimeout, 10000);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'x'.repeat(50000) }] })
  });
  assert.equal(response.status, 413);
  assert.equal(calls, 0);
});
