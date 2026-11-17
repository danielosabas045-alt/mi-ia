'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server/server.cjs');

test('provider requests disable storage and redirects', async () => {
  let options;
  const server = createServer({ apiKey: 'test-only', providerFetch: async (url, init) => {
    options = init;
    return new Response(JSON.stringify({choices:[{message:{content:'Respuesta de prueba'}}]}), {status:200});
  }});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:[{role:'user',content:'Hola'}]})
    });
    assert.equal(response.status, 200);
    assert.equal(options.redirect, 'error');
    assert.equal(JSON.parse(options.body).store, false);
    assert.equal((await response.json()).reply, 'Respuesta de prueba');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
