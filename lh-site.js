/* Lhart Design: registro de visitas (anônimo, sem cookies) e chat ao vivo, em todas as páginas.
   <script src="lh-site.js" defer></script>            -> visitas + cliques no WhatsApp + chat
   <script src="lh-site.js" defer data-notrack></script> -> só o chat (a página já registra as visitas sozinha) */
(function () {
  'use strict';
  var SCRIPT = document.currentScript;
  var NOTRACK = !!(SCRIPT && SCRIPT.hasAttribute('data-notrack'));
  var WA = '5511989304239';

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function rnd(n) {
    var a = new Uint8Array(n), s = '';
    (window.crypto || window.msCrypto).getRandomValues(a);
    for (var i = 0; i < n; i++) s += (a[i] % 36).toString(36);
    return s;
  }
  var vid = ls('lh-vid');
  if (!vid || !/^[a-z0-9]{8,32}$/.test(vid)) { vid = rnd(20); ls('lh-vid', vid); }
  var sid = ss('lh-sid');
  if (!sid) { sid = rnd(14); ss('lh-sid', sid); }
  function lang() { var l = (ls('lhart-lang') || document.documentElement.lang || 'pt').slice(0, 2).toLowerCase(); return l === 'en' || l === 'es' ? l : 'pt'; }

  function beacon(url, data) {
    var body = JSON.stringify(data);
    try { if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))) return; } catch (e) {}
    try { fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }); } catch (e) {}
  }

  /* ---------- visitas ---------- */
  if (!NOTRACK) {
    var q = new URLSearchParams(location.search);
    var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    beacon('/api/track-visit', {
      path: location.pathname + location.hash, ref: document.referrer, lang: lang(), vid: vid, sid: sid,
      us: q.get('utm_source') || q.get('o') || '', um: q.get('utm_medium') || '', uc: q.get('utm_campaign') || '',
      tz: tz, w: window.innerWidth || 0
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
      if (a) beacon('/api/track-whatsapp', { source: a.id || a.className || 'link', path: location.pathname + location.hash, lang: lang(), vid: vid });
    }, true);
  }

  /* ---------- textos do chat ---------- */
  var T = {
    pt: { btn: 'Fale comigo agora', title: 'Lucas · Lhart Design', on: 'online agora', off: 'respondo assim que puder', hi: 'Oi! Sou o Lucas, da Lhart Design. Conta o que você precisa e eu respondo por aqui.',
      name: 'Seu nome', contact: 'WhatsApp ou e-mail (para eu te achar depois)', msg: 'Sua mensagem', send: 'Enviar', type: 'Escreva aqui…', wa: 'Prefere o WhatsApp?', close: 'Fechar',
      sent: 'Recebi! Respondo por aqui assim que eu ver. Pode deixar o chat aberto ou me chamar no WhatsApp.', err: 'Não consegui enviar agora. Tente de novo ou chame no WhatsApp.', many: 'Você enviou muitas mensagens. Tente de novo em alguns minutos.',
      lgpd: 'Uso seu nome e contato só para responder você.', waMsg: 'Oi! Estava no site da Lhart Design e queria falar com você.', needName: 'Diga seu nome para eu saber com quem falo.', needMsg: 'Escreva a sua mensagem.' },
    en: { btn: 'Talk to me now', title: 'Lucas · Lhart Design', on: 'online now', off: 'I reply as soon as I can', hi: "Hi! I'm Lucas from Lhart Design. Tell me what you need and I'll reply right here.",
      name: 'Your name', contact: 'WhatsApp or e-mail (so I can reach you later)', msg: 'Your message', send: 'Send', type: 'Type here…', wa: 'Prefer WhatsApp?', close: 'Close',
      sent: "Got it! I'll reply here as soon as I see it. You can leave the chat open or message me on WhatsApp.", err: "I couldn't send it right now. Try again or message me on WhatsApp.", many: 'You sent many messages. Please try again in a few minutes.',
      lgpd: 'I use your name and contact only to reply to you.', waMsg: 'Hi! I was on the Lhart Design site and wanted to talk to you.', needName: 'Tell me your name so I know who I am talking to.', needMsg: 'Write your message.' },
    es: { btn: 'Habla conmigo ahora', title: 'Lucas · Lhart Design', on: 'en línea ahora', off: 'respondo apenas pueda', hi: '¡Hola! Soy Lucas, de Lhart Design. Cuéntame qué necesitas y te respondo por aquí.',
      name: 'Tu nombre', contact: 'WhatsApp o e-mail (para ubicarte después)', msg: 'Tu mensaje', send: 'Enviar', type: 'Escribe aquí…', wa: '¿Prefieres WhatsApp?', close: 'Cerrar',
      sent: '¡Recibido! Te respondo por aquí apenas lo vea. Puedes dejar el chat abierto o escribirme por WhatsApp.', err: 'No pude enviarlo ahora. Intenta de nuevo o escríbeme por WhatsApp.', many: 'Enviaste muchos mensajes. Intenta de nuevo en unos minutos.',
      lgpd: 'Uso tu nombre y contacto solo para responderte.', waMsg: '¡Hola! Estaba en el sitio de Lhart Design y quería hablar contigo.', needName: 'Dime tu nombre para saber con quién hablo.', needMsg: 'Escribe tu mensaje.' }
  };
  function t(k) { return (T[lang()] || T.pt)[k]; }

  /* ---------- estilo ---------- */
  var css = '' +
    '#lhc-btn{position:fixed;right:18px;bottom:var(--lhb,84px);z-index:45;display:inline-flex;align-items:center;gap:9px;background:#1c1e2e;color:#e9e9ed;border:1px solid #9184d9;border-radius:99px;padding:12px 18px;font:700 14px/1 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 12px 34px rgba(0,0,0,.45),0 0 0 0 rgba(145,132,217,.5);transition:transform .2s,background .2s}' +
    '#lhc-btn:hover{transform:translateY(-2px);background:#262a3d}#lhc-btn i{position:relative;font-style:normal}' +
    '#lhc-btn .b{display:none;min-width:20px;height:20px;border-radius:99px;background:#ff5d6c;color:#fff;font:800 12px/20px Inter,sans-serif;text-align:center;padding:0 6px}' +
    '#lhc-btn.has .b{display:inline-block}#lhc-btn.pulse{animation:lhcp 2.4s ease-out 1}@keyframes lhcp{0%{box-shadow:0 12px 34px rgba(0,0,0,.45),0 0 0 0 rgba(145,132,217,.6)}100%{box-shadow:0 12px 34px rgba(0,0,0,.45),0 0 0 22px rgba(145,132,217,0)}}' +
    '#lhc{position:fixed;right:18px;bottom:calc(var(--lhb,84px) + 56px);z-index:46;width:350px;max-width:calc(100vw - 24px);height:480px;max-height:calc(100vh - var(--lhb,84px) - 86px);display:none;flex-direction:column;background:#161826;color:#e9e9ed;border:1px solid #34374a;border-radius:18px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6);font:400 14px/1.45 Inter,system-ui,sans-serif}' +
    '#lhc.on{display:flex}#lhc *{box-sizing:border-box}#lhc.form{height:auto}#lhc.form .bd{flex:none;overflow:visible}' +
    '#lhc header{display:flex;align-items:center;gap:11px;padding:13px 14px;background:linear-gradient(135deg,#232532,#1c1e2e);border-bottom:1px solid #34374a}' +
    '#lhc .av{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#9184d9,#796cbf);color:#161826;font-weight:800}' +
    '#lhc header b{display:block;font-size:14.5px}#lhc header small{display:flex;align-items:center;gap:6px;color:#9397ab;font-size:12px}#lhc header small::before{content:"";width:8px;height:8px;border-radius:50%;background:#6b7080}#lhc header small.on::before{background:#4be39a;box-shadow:0 0 8px #4be39a}' +
    '#lhc .x{margin-left:auto;border:0;background:transparent;color:#9397ab;font-size:20px;cursor:pointer;width:32px;height:32px;border-radius:8px}#lhc .x:hover{background:#2a2d3f;color:#fff}' +
    '#lhc .bd{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;scroll-behavior:smooth}' +
    '#lhc .m{max-width:86%;padding:9px 12px;border-radius:14px;word-wrap:break-word;white-space:pre-wrap}' +
    '#lhc .m.a{background:#232532;border:1px solid #34374a;border-bottom-left-radius:4px;align-self:flex-start}' +
    '#lhc .m.v{background:linear-gradient(135deg,#9184d9,#796cbf);color:#161826;font-weight:600;border-bottom-right-radius:4px;align-self:flex-end}' +
    '#lhc .m.s{align-self:center;background:transparent;color:#9397ab;font-size:12.5px;text-align:center;max-width:94%}' +
    '#lhc form{display:flex;flex-direction:column;gap:9px;padding:0 14px 14px}#lhc label{display:none}' +
    '#lhc input,#lhc textarea{width:100%;background:#232532;border:1px solid #34374a;color:#e9e9ed;border-radius:10px;padding:10px 12px;font:inherit;outline:0}#lhc input:focus,#lhc textarea:focus{border-color:#9184d9}' +
    '#lhc textarea{resize:none;min-height:70px}#lhc .hp{position:absolute!important;left:-9999px!important;opacity:0}' +
    '#lhc .go{border:0;border-radius:10px;padding:11px;font:700 14px Inter,sans-serif;background:linear-gradient(135deg,#9184d9,#796cbf);color:#161826;cursor:pointer}#lhc .go:disabled{opacity:.55}' +
    '#lhc .er{color:#ff8a8a;font-size:12.5px;min-height:0}' +
    '#lhc form.ft{flex-direction:row;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid #34374a;background:#1c1e2e}#lhc .ft input{flex:1;width:auto;min-width:0}#lhc .ft .go{padding:11px 16px}' +
    '#lhc .wa{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 14px 12px;padding:9px;border-radius:10px;border:1px solid #1d6b4a;background:#0d3a2866;color:#7ef0b6;font-weight:700;font-size:13px;text-decoration:none}#lhc .wa:hover{background:#0d3a28aa}' +
    '#lhc .lg{margin:0 14px 12px;color:#6f748a;font-size:11.5px;text-align:center}' +
    '@media(max-width:520px){#lhc{right:8px;left:8px;width:auto;max-width:none;bottom:calc(var(--lhb,84px) + 56px);height:min(520px,calc(100vh - var(--lhb,84px) - 76px))}#lhc-btn{right:12px;bottom:calc(var(--lhb,84px) - 6px);padding:11px 15px}}' +
    '@media(prefers-reduced-motion:reduce){#lhc-btn,#lhc-btn.pulse{animation:none;transition:none}#lhc .bd{scroll-behavior:auto}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var bot = parseInt(SCRIPT && SCRIPT.getAttribute('data-bottom'), 10); if (bot) document.documentElement.style.setProperty('--lhb', bot + 'px');

  /* ---------- elementos ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  var btn = el('button', { id: 'lhc-btn', type: 'button', 'aria-haspopup': 'dialog', 'aria-controls': 'lhc' }, [el('i', { text: '💬' }), el('span', { class: 'tx' }), el('span', { class: 'b', text: '0' })]);
  var box = el('section', { id: 'lhc', role: 'dialog', 'aria-label': 'Chat' });
  document.body.appendChild(btn); document.body.appendChild(box);

  var state = { open: false, last: 0, timer: null, unread: 0, enviando: false, online: false, enviou: false };
  var nome = ls('lh-nome') || '', contato = ls('lh-contato') || '';
  state.enviou = ls('lh-chat') === '1';

  function beep() { try { var C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = 740; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(.15, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .25); o.start(); o.stop(c.currentTime + .26); } catch (e) {} }
  function waLink() {
    var base = t('waMsg'), nm = nome ? ' (' + nome + ')' : '';
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(base + nm);
  }

  var bd, ftInput, stat;
  function head() {
    stat = el('small', { text: state.online ? t('on') : t('off'), class: state.online ? 'on' : '' });
    var x = el('button', { class: 'x', type: 'button', 'aria-label': t('close'), text: '✕' }); x.onclick = fechar;
    return el('header', null, [el('div', { class: 'av', text: 'L' }), el('div', null, [el('b', { text: t('title') }), stat]), x]);
  }
  function addMsg(cls, text) { var m = el('div', { class: 'm ' + cls }); m.textContent = text; bd.appendChild(m); bd.scrollTop = bd.scrollHeight; return m; }

  function telaForm() {
    box.classList.add('form'); box.textContent = ''; box.appendChild(head());
    bd = el('div', { class: 'bd', 'aria-live': 'polite' }); box.appendChild(bd);
    addMsg('a', t('hi'));
    var f = el('form', { novalidate: 'novalidate' });
    var iN = el('input', { type: 'text', maxlength: '60', placeholder: t('name'), 'aria-label': t('name'), autocomplete: 'name' }); iN.value = nome;
    var iC = el('input', { type: 'text', maxlength: '80', placeholder: t('contact'), 'aria-label': t('contact'), autocomplete: 'off' }); iC.value = contato;
    var iM = el('textarea', { maxlength: '1000', placeholder: t('msg'), 'aria-label': t('msg'), rows: '3' });
    var hp = el('input', { type: 'text', name: 'website', class: 'hp', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
    var er = el('div', { class: 'er', role: 'alert' });
    var go = el('button', { class: 'go', type: 'submit', text: t('send') });
    f.appendChild(iN); f.appendChild(iC); f.appendChild(iM); f.appendChild(hp); f.appendChild(er); f.appendChild(go);
    f.onsubmit = function (e) {
      e.preventDefault(); er.textContent = '';
      if (iN.value.trim().length < 2) { er.textContent = t('needName'); iN.focus(); return; }
      if (!iM.value.trim()) { er.textContent = t('needMsg'); iM.focus(); return; }
      nome = iN.value.trim(); contato = iC.value.trim(); ls('lh-nome', nome); ls('lh-contato', contato);
      go.disabled = true;
      enviar(iM.value.trim(), hp.value, function (ok, erro) {
        go.disabled = false;
        if (!ok) { er.textContent = erro; return; }
        state.enviou = true; ls('lh-chat', '1'); telaChat(true);
      });
    };
    box.appendChild(f);
    box.appendChild(el('div', { class: 'lg', text: t('lgpd') }));
    box.appendChild(el('a', { class: 'wa', href: waLink(), target: '_blank', rel: 'noopener', text: '💬 ' + t('wa') }));
    setTimeout(function () { iN.focus(); }, 60);
  }

  var feitas = {};
  function telaChat(primeira) {
    box.classList.remove('form'); box.textContent = ''; box.appendChild(head());
    bd = el('div', { class: 'bd', 'aria-live': 'polite' }); box.appendChild(bd);
    addMsg('a', t('hi'));
    feitas = {};
    var ft = el('form', { class: 'ft' });
    ftInput = el('input', { type: 'text', maxlength: '1000', placeholder: t('type'), 'aria-label': t('type'), autocomplete: 'off' });
    var go = el('button', { class: 'go', type: 'submit', text: t('send') });
    ft.appendChild(ftInput); ft.appendChild(go);
    ft.onsubmit = function (e) {
      e.preventDefault();
      var tx = ftInput.value.trim(); if (!tx) return;
      ftInput.value = ''; go.disabled = true;
      enviar(tx, '', function (ok, erro) { go.disabled = false; if (!ok) addMsg('s', erro); else puxa(); ftInput.focus(); });
    };
    box.appendChild(ft);
    box.appendChild(el('a', { class: 'wa', href: waLink(), target: '_blank', rel: 'noopener', text: '💬 ' + t('wa') }));
    state.last = 0; puxa(primeira);
    setTimeout(function () { ftInput.focus(); }, 60);
  }

  function enviar(texto, hp, cb) {
    if (state.enviando) return; state.enviando = true;
    fetch('/api/chat?a=send', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid: vid, name: nome, contact: contato, text: texto, page: location.pathname + location.hash, hp: hp }) })
      .then(function (r) { state.enviando = false; if (r.status === 429) { cb(false, t('many')); return; } if (!r.ok) { cb(false, t('err')); return; } cb(true); })
      .catch(function () { state.enviando = false; cb(false, t('err')); });
  }

  var avisouEnvio = false;
  function puxa(primeira) {
    fetch('/api/chat?a=poll&vid=' + vid + '&after=' + state.last, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        state.online = !!d.online;
        if (stat) { stat.textContent = state.online ? t('on') : t('off'); stat.className = state.online ? 'on' : ''; }
        var novaDoLucas = false;
        (d.msgs || []).forEach(function (m) {
          if (feitas[m.t]) return; feitas[m.t] = 1; if (m.t > state.last) state.last = m.t;
          if (state.open && bd) addMsg(m.f === 'a' ? 'a' : 'v', m.x);
          if (m.f === 'a') novaDoLucas = true;
        });
        if (primeira && !avisouEnvio && state.open && bd) { addMsg('s', t('sent')); avisouEnvio = true; }
        if (novaDoLucas && !state.open) { state.unread++; marca(); beep(); }
        if (novaDoLucas && state.open && document.hidden) beep();
      })
      .catch(function () {});
  }

  function marca() { btn.classList.toggle('has', state.unread > 0); btn.querySelector('.b').textContent = state.unread; }
  function ciclo() {
    clearInterval(state.timer);
    if (!state.enviou) return;
    state.timer = setInterval(function () { if (!document.hidden) puxa(); }, state.open ? 4000 : 20000);
  }
  function abrir() {
    state.open = true; box.classList.add('on'); btn.setAttribute('aria-expanded', 'true'); state.unread = 0; marca();
    if (state.enviou) telaChat(false); else telaForm();
    ciclo();
  }
  function fechar() { state.open = false; box.classList.remove('on'); btn.setAttribute('aria-expanded', 'false'); ciclo(); btn.focus(); }
  btn.onclick = function () { state.open ? fechar() : abrir(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.open) fechar(); });

  function texto() { btn.querySelector('.tx').textContent = t('btn'); }
  texto();
  setInterval(function () { var l = lang(); if (l !== texto.l) { texto.l = l; texto(); if (state.open) { state.enviou ? telaChat(false) : telaForm(); } } }, 1500);
  if (state.enviou) { ciclo(); setTimeout(puxa, 1200); }
  setTimeout(function () { if (!state.open && !state.unread) btn.classList.add('pulse'); }, 4000);
})();
