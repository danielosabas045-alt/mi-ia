'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server/server.cjs');

test('global quota limits provider calls and invalid JSON is rejected', async () => {
  let calls = 0;
  const server = createServer({apiKey:'test-only', globalLimit:1, providerFetch:async () => {
    calls++;
    return {ok:true,json:async()=>({choices:[{message:{content:'mock response'}}]})};
  }});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url = 'http://127.0.0.1:'+server.address().port+'/api/chat';
  const send = (body,type='application/json')=>fetch(url,{method:'POST',headers:{'Content-Type':type},body});
  try {
    assert.equal((await send('null')).status,400);
    assert.equal((await send('{}','text/plain')).status,415);
    const body=JSON.stringify({messages:[{role:'user',content:'Hola'}]});
    assert.equal((await send(body)).status,200);
    assert.equal((await send(body)).status,429);
    assert.equal(calls,1);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
