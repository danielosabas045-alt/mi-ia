'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('JavaScript parses without errors', () => {
  assert.doesNotThrow(() => new vm.Script(js, { filename: 'app.js' }));
});

test('all referenced DOM IDs exist in the HTML', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const referenced = [...js.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]);
  for (const id of referenced) assert.ok(ids.has(id), 'Missing element: ' + id);
});

test('CSP disallows inline scripts and app has no inline handlers', () => {
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /script-src 'self'/);
  assert.doesNotMatch(html, /\bon(?:click|load|error|submit)\s*=/i);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i);
});

test('the website serves relative assets on GitHub Pages project paths', () => {
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.ok(css.includes('@media(max-width:680px)'));
});

test('no hardcoded provider key or client-side Authorization header', () => {
  for (const source of [html, js, css]) {
    assert.doesNotMatch(source, /sk-proj-[A-Za-z0-9_-]{8,}/);
    assert.doesNotMatch(source, /sk-[A-Za-z0-9_-]{32,}/);
  }
  assert.doesNotMatch(js, /Authorization\s*:/i);
  assert.match(js, /credentials:\s*'omit'/);
  assert.match(js, /referrerPolicy:\s*'no-referrer'/);
});

test('messages are inserted as text and not interpreted as HTML', () => {
  assert.match(js, /content\.textContent\s*=\s*m\.text/);
  assert.doesNotMatch(js, /innerHTML\s*=/);
});

test('real offline tools, export and backend error handling are present', () => {
  for (const cmd of ['/ayuda', '/contar', '/mayusculas', '/minusculas', '/invertir', '/json', '/fecha']) {
    assert.ok(js.includes(cmd), 'Missing command ' + cmd);
  }
  assert.match(js, /JSON\.stringify\(\{\s*messages\s*\}\)/);
  assert.match(js, /response\.ok/);
  assert.match(js, /exportHistory/);
  assert.match(js, /speechSynthesis/);
  assert.match(js, /SpeechRecognition/);
});
