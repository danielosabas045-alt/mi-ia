'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server/server.cjs');

test('daily provider quota rejects excess calls before upstream', async () => {
  let calls = 0;
  const server = createServer({
    apiKey: 'test-only', dailyLimit: 1,
    providerFetch: async () => {
      calls++;
      return new Response(JSON.stringify({ choices: [{ message: { content: 'test' } }] }), {status:200,headers:{'Content-Type':'application/json'}});
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = 'http://127.0.0.1:' + server.address().port + '/api/chat';
    const request = () => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }] }) });
    const first = await request();
    assert.equal(first.status, 200);
    await first.json();
    const second = await request();
    assert.equal(second.status, 429);
    assert.match((await second.json()).error, /diaria/);
    assert.equal(calls, 1);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
