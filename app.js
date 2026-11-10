/* OSAIA AI Web v0.2.0 — sin claves incrustadas. */
(() => {
  'use strict';
  const STORE = 'osaia_web_v2';
  const MAX_CHATS = 25;
  const MAX_MESSAGES = 120;
  const $ = id => document.getElementById(id);
  const state = { chats: [], active: '', endpoint: '', busy: false, controller: null };
  const now = () => Date.now();
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(now()) + Math.random().toString(36).slice(2));
  const clean = (value, max = 8000) => String(value == null ? '' : value).slice(0, max);
  const chat = () => state.chats.find(c => c.id === state.active);
  const date = ms => new Intl.DateTimeFormat('es-GT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ms));
  const icon = (text, title, action) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'icon-btn'; b.textContent = text; b.title = title;
    b.setAttribute('aria-label', title); b.addEventListener('click', action); return b;
  };
  function toast(message) {
    const el = $('toast'); el.textContent = message; el.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.hidden = true; }, 4200);
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE) || '{}');
      state.endpoint = typeof data.endpoint === 'string' && safeEndpoint(data.endpoint) ? data.endpoint : '';
      state.chats = Array.isArray(data.chats) ? data.chats.slice(0, MAX_CHATS).filter(c => c && typeof c.id === 'string' && Array.isArray(c.messages)).map(c => ({
        id: clean(c.id, 80), title: clean(c.title || 'Conversación', 70),
        created: Number(c.created) || now(), updated: Number(c.updated) || now(),
        messages: c.messages.slice(-MAX_MESSAGES).filter(m => m && ['user', 'assistant'].includes(m.role)).map(m => ({
          role: m.role, text: clean(m.text), kind: m.kind === 'local' ? 'local' : m.kind === 'remote' ? 'remote' : '',
          at: Number(m.at) || now()
        }))
      })) : [];
      state.active = state.chats.some(c => c.id === data.active) ? data.active : (state.chats[0]?.id || '');
    } catch (_) { state.chats = []; state.active = ''; state.endpoint = ''; }
  }
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ endpoint: state.endpoint, active: state.active, chats: state.chats.slice(0, MAX_CHATS).map(c => ({ ...c, messages: c.messages.slice(-MAX_MESSAGES) })) }));
    } catch (_) { toast('No se pudo guardar el historial. Revisá el almacenamiento del navegador.'); }
  }
  function safeEndpoint(value) {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && !u.username && !u.password && !u.hash && u.hostname.includes('.') && u.pathname !== '/' && u.search === '';
    } catch (_) { return false; }
  }
  function makeChat() {
    if (state.busy) return;
    const current = chat();
    if (current && !current.messages.length) { $('prompt').focus(); closeMenu(); return; }
    const c = { id: uid(), title: 'Nueva conversación', created: now(), updated: now(), messages: [] };
    state.chats.unshift(c); state.chats = state.chats.slice(0, MAX_CHATS); state.active = c.id;
    save(); render(); closeMenu(); $('prompt').focus();
  }
  function selectChat(id) {
    if (state.busy) { toast('Esperá a que termine la respuesta o detenela.'); return; }
    if (!state.chats.some(c => c.id === id)) return;
    state.active = id; save(); render(); closeMenu();
  }
  function deleteChat(id) {
    if (state.busy) return;
    if (!confirm('¿Eliminar esta conversación de este navegador?')) return;
    state.chats = state.chats.filter(c => c.id !== id);
    if (state.active === id) state.active = state.chats[0]?.id || '';
    if (!state.chats.length) {
      const c = { id: uid(), title: 'Nueva conversación', created: now(), updated: now(), messages: [] };
      state.chats.push(c); state.active = c.id;
    }
    save(); render();
  }
  function addMessage(role, text, kind = '') {
    const c = chat(); if (!c) return;
    const msg = { role, text: clean(text), kind, at: now() };
    c.messages.push(msg); c.messages = c.messages.slice(-MAX_MESSAGES); c.updated = now();
    if (role === 'user' && c.title === 'Nueva conversación') c.title = clean(text.replace(/^\/[a-záéíóúñ]+\s*/i, ''), 43) || 'Nueva conversación';
    state.chats.sort((a, b) => b.updated - a.updated);
    save(); render(); return msg;
  }
  function renderList() {
    const list = $('chatList'); list.replaceChildren();
    for (const c of state.chats) {
      const item = document.createElement('div'); item.className = 'chat-row' + (c.id === state.active ? ' selected' : '');
      const select = document.createElement('button'); select.type = 'button'; select.className = 'chat-select';
      select.textContent = c.title; select.title = c.title; select.setAttribute('aria-current', c.id === state.active ? 'page' : 'false');
      select.addEventListener('click', () => selectChat(c.id));
      item.append(select, icon('×', 'Eliminar ' + c.title, () => deleteChat(c.id))); list.append(item);
    }
  }
  function renderThread() {
    const thread = $('thread'); thread.replaceChildren();
    const c = chat();
    $('conversationTitle').textContent = c?.title || 'Nueva conversación';
    if (!c || !c.messages.length) {
      const welcome = document.createElement('div'); welcome.className = 'welcome';
      const mark = document.createElement('div'); mark.className = 'welcome-mark'; mark.textContent = '✦';
      const heading = document.createElement('h2'); heading.textContent = '¿En qué puedo ayudarte?';
      const p = document.createElement('p'); p.textContent = 'OSAIA AI está creciendo. Podés usar herramientas locales reales o conectar tu propio servidor de IA HTTPS en Ajustes.';
      const chips = document.createElement('div'); chips.className = 'chips';
      [['Contar palabras', '/contar Hola, mundo'], ['Fecha actual', '/fecha'], ['Ver comandos', '/ayuda']].forEach(([label, cmd]) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.className = 'chip';
        b.addEventListener('click', () => { $('prompt').value = cmd; resizePrompt(); $('prompt').focus(); }); chips.append(b);
      });
      welcome.append(mark, heading, p, chips); thread.append(welcome);
    } else {
      for (const m of c.messages) {
        const row = document.createElement('article'); row.className = 'message ' + m.role;
        const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = m.role === 'user' ? 'T' : 'O';
        const body = document.createElement('div'); body.className = 'message-body';
        const top = document.createElement('div'); top.className = 'message-meta';
        const name = document.createElement('strong'); name.textContent = m.role === 'user' ? 'Vos' : m.kind === 'local' ? 'Herramienta local' : m.kind === 'remote' ? 'OSAIA AI · servidor' : 'OSAIA AI';
        const time = document.createElement('span'); time.textContent = date(m.at);
        top.append(name, time);
        const content = document.createElement('div'); content.className = 'message-text'; content.textContent = m.text;
        const actions = document.createElement('div'); actions.className = 'message-actions';
        actions.append(icon('⧉', 'Copiar mensaje', () => copy(m.text)));
        if (m.role === 'assistant' && 'speechSynthesis' in window) actions.append(icon('♫', 'Escuchar mensaje', () => speak(m.text)));
        body.append(top, content, actions); row.append(avatar, body); thread.append(row);
      }
    }
    requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; });
  }
  function renderStatus() {
    const connected = Boolean(state.endpoint);
    $('connectionIndicator').textContent = connected ? 'Servidor configurado · sin verificar' : 'IA sin conectar';
    $('connectionIndicator').className = 'status ' + (connected ? 'configured' : 'unconfigured');
    $('endpointInput').value = state.endpoint;
    $('sendBtn').disabled = state.busy;
    $('abortBtn').hidden = !state.busy;
    $('sendBtn').hidden = state.busy;
  }
  function render() { renderList(); renderThread(); renderStatus(); }
  function resizePrompt() {
    const p = $('prompt'); p.style.height = 'auto'; p.style.height = Math.min(160, p.scrollHeight) + 'px';
    $('promptCount').textContent = p.value.length + '/8000';
  }
  function localCommand(value) {
    const space = value.indexOf(' ');
    const cmd = (space < 0 ? value : value.slice(0, space)).toLowerCase();
    const arg = space < 0 ? '' : value.slice(space + 1);
    if (!cmd.startsWith('/')) return null;
    if (cmd === '/ayuda') return 'Comandos disponibles:\n/contar texto — cuenta palabras, caracteres y líneas\n/mayusculas texto — transforma a mayúsculas\n/minusculas texto — transforma a minúsculas\n/invertir texto — invierte caracteres\n/json {"clave":1} — formatea JSON\n/fecha — fecha y hora local\n\nSon herramientas reales del navegador, no respuestas de un modelo de IA.';
    if (cmd === '/fecha') return 'Fecha y hora de tu dispositivo: ' + new Date().toLocaleString('es-GT', { dateStyle: 'full', timeStyle: 'long' });
    if (cmd === '/contar') return 'Palabras: ' + (arg.trim() ? arg.trim().split(/\s+/u).length : 0) + '\nCaracteres: ' + [...arg].length + '\nLíneas: ' + (arg ? arg.split(/\r?\n/).length : 0);
    if (cmd === '/mayusculas') return arg.toLocaleUpperCase('es-GT') || 'Agregá texto después del comando.';
    if (cmd === '/minusculas') return arg.toLocaleLowerCase('es-GT') || 'Agregá texto después del comando.';
    if (cmd === '/invertir') return [...arg].reverse().join('') || 'Agregá texto después del comando.';
    if (cmd === '/json') {
      try { return JSON.stringify(JSON.parse(arg), null, 2).slice(0, 8000); }
      catch (_) { return 'JSON inválido. Ejemplo: /json {"nombre":"OSAIA","version":2}'; }
    }
    return 'No reconozco ese comando. Escribí /ayuda para ver las herramientas disponibles.';
  }
  async function remoteReply(c, signal) {
    const endpoint = state.endpoint;
    if (!safeEndpoint(endpoint)) throw new Error('Configurá un servidor HTTPS válido en Ajustes.');
    const messages = c.messages.filter(m => m.role === 'user' || (m.role === 'assistant' && m.kind === 'remote')).slice(-24).map(m => ({ role: m.role, content: m.text }));
    const response = await fetch(endpoint, {
      method: 'POST', mode: 'cors', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }), signal
    });
    if (!response.ok) throw new Error('El servidor devolvió HTTP ' + response.status + '. Revisá la configuración del backend.');
    const result = await response.json();
    const content = result?.reply ?? result?.message ?? result?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('El servidor no devolvió texto. Se esperaba { "reply": "..." }.');
    return content.slice(0, 8000);
  }
  async function send() {
    if (state.busy) return;
    const value = $('prompt').value.trim(); if (!value) return;
    $('prompt').value = ''; resizePrompt();
    if (!chat()) makeChat();
    const c = chat(); addMessage('user', value);
    const answer = localCommand(value);
    if (answer !== null) { addMessage('assistant', answer, 'local'); return; }
    if (!state.endpoint) {
      addMessage('assistant', 'La IA aún no está conectada. No voy a inventar una respuesta. Abrí Ajustes para configurar un backend HTTPS o escribí /ayuda para usar herramientas locales.', 'local');
      return;
    }
    state.busy = true; state.controller = new AbortController(); renderStatus();
    const timeout = setTimeout(() => state.controller?.abort(), 45000);
    try {
      const answer = await remoteReply(c, state.controller.signal);
      addMessage('assistant', answer, 'remote');
    } catch (e) {
      const reason = e.name === 'AbortError' ? 'Solicitud detenida o agotó los 45 segundos.' : e.name === 'TypeError' ? 'No se pudo conectar. Revisá HTTPS, CORS y la conexión de red.' : e.message;
      addMessage('assistant', 'No se pudo obtener respuesta: ' + clean(reason, 400), 'local');
    } finally {
      clearTimeout(timeout); state.busy = false; state.controller = null; renderStatus(); $('prompt').focus();
    }
  }
  async function copy(value) {
    try { await navigator.clipboard.writeText(value); toast('Mensaje copiado.'); }
    catch (_) { toast('No se pudo copiar automáticamente en este navegador.'); }
  }
  function speak(value) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(value.slice(0, 3000));
    utterance.lang = 'es-GT'; utterance.rate = 1; speechSynthesis.speak(utterance);
  }
  function startDictation() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast('El reconocimiento de voz no está disponible en este navegador.'); return; }
    const rec = new SpeechRecognition(); rec.lang = 'es-GT'; rec.interimResults = false;
    rec.onresult = e => { $('prompt').value += ($('prompt').value ? ' ' : '') + e.results[0][0].transcript; resizePrompt(); $('prompt').focus(); };
    rec.onerror = () => toast('No se pudo reconocer la voz. Revisá el permiso del micrófono.');
    try { rec.start(); toast('Escuchando…'); } catch (_) { toast('No se pudo iniciar el micrófono.'); }
  }
  function exportHistory() {
    const data = JSON.stringify({ app: 'OSAIA AI', version: '0.2.0', exportedAt: new Date().toISOString(), chats: state.chats }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'OSAIA-AI-conversaciones.json';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Exportación iniciada.');
  }
  function openSettings() {
    $('endpointInput').value = state.endpoint;
    $('settingsDialog').showModal();
  }
  function closeMenu() { $('sidebar').classList.remove('open'); $('overlay').hidden = true; }
  function toggleMenu() {
    const open = !$('sidebar').classList.contains('open');
    $('sidebar').classList.toggle('open', open); $('overlay').hidden = !open;
  }
  function init() {
    load();
    if (!state.chats.length) {
      const c = { id: uid(), title: 'Nueva conversación', created: now(), updated: now(), messages: [] };
      state.chats.push(c); state.active = c.id; save();
    }
    $('chatForm').addEventListener('submit', e => { e.preventDefault(); send(); });
    $('prompt').addEventListener('input', resizePrompt);
    $('prompt').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); }
    });
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); makeChat(); }
      if (e.key === 'Escape') closeMenu();
    });
    $('newChat').addEventListener('click', makeChat);
    $('mobileNew').addEventListener('click', makeChat);
    $('menuToggle').addEventListener('click', toggleMenu);
    $('overlay').addEventListener('click', closeMenu);
    $('settingsBtn').addEventListener('click', openSettings);
    $('mobileSettings').addEventListener('click', openSettings);
    $('settingsClose').addEventListener('click', () => $('settingsDialog').close());
    $('settingsForm').addEventListener('submit', e => {
      e.preventDefault();
      const value = $('endpointInput').value.trim();
      if (value && !safeEndpoint(value)) { toast('Ingresá una URL HTTPS completa con ruta, sin clave, usuario ni parámetros.'); return; }
      state.endpoint = value; save(); renderStatus(); $('settingsDialog').close();
      toast(value ? 'Servidor guardado. Se comprobará al enviar un mensaje.' : 'Modo local activado.');
    });
    $('clearChat').addEventListener('click', () => {
      if (state.busy || !confirm('¿Vaciar todos los mensajes de esta conversación?')) return;
      const c = chat(); if (c) { c.messages = []; c.title = 'Nueva conversación'; c.updated = now(); save(); render(); }
    });
    $('exportBtn').addEventListener('click', exportHistory);
    $('dictateBtn').addEventListener('click', startDictation);
    $('abortBtn').addEventListener('click', () => state.controller?.abort());
    $('helpBtn').addEventListener('click', () => { $('prompt').value = '/ayuda'; resizePrompt(); $('prompt').focus(); });
    render(); resizePrompt();
  }
  document.addEventListener('DOMContentLoaded', init);
})();