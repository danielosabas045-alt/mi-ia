'use strict';
/**
 * OSAIA AI backend mínimo para Node.js >=20.
 * No guardar secretos en GitHub Pages. Configurar OPENAI_API_KEY en el host.
 * En producción agregar protección antiabuso robusta y observabilidad.
 */
const http = require('node:http');

const MAX_BODY = 48 * 1024;
const MAX_REQUESTS_PER_MINUTE = 12;
const DEFAULT_ORIGIN = 'https://danielosabas045-alt.github.io';
const DEFAULT_MODEL = 'gpt-4.1-mini';

function send(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'"
  });
  res.end(JSON.stringify(payload));
}

function validateMessages(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 24) return null;
  const messages = [];
  let total = 0;
  for (const item of value) {
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') return null;
    const content = item.content.trim();
    if (!content || content.length > 8000) return null;
    total += content.length;
    if (total > 30000) return null;
    messages.push({ role: item.role, content });
  }
  return messages.at(-1)?.role === 'user' ? messages : null;
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) {
      const error = new Error('Solicitud demasiado grande');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch (_) { const error = new Error('JSON inválido'); error.status = 400; throw error; }
}

function createServer(config = {}) {
  const allowedOrigin = config.allowedOrigin || process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const apiKey = config.apiKey === undefined ? process.env.OPENAI_API_KEY : config.apiKey;
  const model = config.model || process.env.OSAIA_MODEL || DEFAULT_MODEL;
  const limiter = new Map();
  // Process-wide cap protects the provider even when clients rotate IPs.
  const globalLimit = config.globalLimit ?? 30;
  const maxConcurrent = config.maxConcurrent ?? 3;
  let globalMinute = -1, globalCount = 0, active = 0;
  const providerFetch = config.providerFetch || fetch;
  return http.createServer({ requestTimeout: 15000, headersTimeout: 10000, keepAliveTimeout: 5000 }, async (req, res) => {
    const origin = req.headers.origin;
    if (origin && origin !== allowedOrigin) return send(res, 403, { error: 'Origen no permitido' });
    if (origin === allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS' && req.url === '/api/chat') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && req.url === '/health') return send(res, 200, { status: 'ok', aiConfigured: Boolean(apiKey) });
    if (req.method !== 'POST' || req.url !== '/api/chat') return send(res, 404, { error: 'Ruta no encontrada' });
    const ip = req.socket.remoteAddress || 'unknown';
    const minute = Math.floor(Date.now() / 60000);
    const old = limiter.get(ip);
    const current = old?.minute === minute ? old.count + 1 : 1;
    limiter.set(ip, { minute, count: current });
    if (limiter.size > 2000) {
      for (const [key, value] of limiter) if (value.minute !== minute) limiter.delete(key);
    }
    if (current > MAX_REQUESTS_PER_MINUTE) return send(res, 429, { error: 'Demasiadas solicitudes. Probá de nuevo en un minuto.' });
    if (!apiKey) return send(res, 503, { error: 'La IA aún no está configurada en el servidor.' });
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return send(res, 415, { error: 'Se requiere application/json.' });
    if (Number(req.headers['content-length']) > MAX_BODY) return send(res, 413, { error: 'Solicitud demasiado grande' });
    if (active >= maxConcurrent) return send(res, 429, { error: 'Servidor ocupado. Intentá nuevamente.' });
    active++;
    try {
      const input = await readJson(req);
      const messages = validateMessages(input?.messages);
      if (!messages) return send(res, 400, { error: 'Mensajes inválidos o demasiado largos.' });
      const nowMinute = Math.floor(Date.now() / 60000);
      if (globalMinute !== nowMinute) { globalMinute = nowMinute; globalCount = 0; }
      if (globalCount >= globalLimit) return send(res, 429, { error: 'Cuota temporal del servidor agotada.' });
      globalCount++;
      const upstream = await providerFetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: 'Sos OSAIA AI, un asistente útil, claro, preciso y amable. Respondé en español cuando te hablen en español. No inventés hechos ni capacidades.' }, ...messages],
          max_tokens: 900
        }),
        signal: AbortSignal.timeout(30000)
      });
      if (!upstream.ok) return send(res, 502, { error: 'El proveedor de IA rechazó la solicitud (HTTP ' + upstream.status + ').' });
      const data = await upstream.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply !== 'string' || !reply.trim()) return send(res, 502, { error: 'El proveedor no devolvió una respuesta válida.' });
      return send(res, 200, { reply: reply.slice(0, 8000) });
    } catch (error) {
      return send(res, error.status || (error.name === 'TimeoutError' ? 504 : 502), {
        error: error.status ? error.message : error.name === 'TimeoutError' ? 'Tiempo de espera agotado.' : 'No se pudo completar la solicitud.'
      });
    } finally { active--; }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, '0.0.0.0', () => console.log('OSAIA AI backend escuchando en puerto ' + port));
}

module.exports = { createServer, validateMessages };
