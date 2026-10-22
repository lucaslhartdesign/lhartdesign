/* Demos de delivery: botão "Ver um pedido completo". Faz o pedido no app do cliente, a cozinha prepara, o motoboy entrega, e a tela vai
   mudando sozinha de Cliente para Cozinha e Motoboy, com uma legenda do que está acontecendo. Usa as funções da própria demo (S, L, seed...). */
(function () {
  var bar = document.querySelector('.dbt'), stage = document.querySelector('.stage');
  if (!bar || !stage || typeof CFG === 'undefined') return;
  var T = function (s) { return (window.LH && LH.t) ? LH.t(s) : s; };
  var timers = [], rodando = false;
  var it = CFG.menu[0].items, a = it[0].id, b = (it[1] || it[0]).id;

  var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'go'; btn.id = 'da-btn';
  btn.textContent = '▶ ' + T('Ver um pedido completo');
  bar.insertBefore(btn, bar.firstChild);
  var cap = document.createElement('div'); cap.id = 'da-cap'; cap.setAttribute('role', 'status'); cap.hidden = true;
  stage.parentNode.insertBefore(cap, stage);
  var css = document.createElement('style');
  css.textContent = '#da-cap{display:flex;align-items:center;gap:10px;margin:0 14px 10px;padding:11px 14px;border-radius:14px;background:var(--ink);color:var(--bg);font:700 14px/1.3 var(--f2,inherit);max-width:1500px}' +
    '#da-cap[hidden]{display:none}#da-cap b{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--ac);color:var(--acink);font:800 13px var(--f1,inherit)}' +
    '@media(min-width:1201px){#da-cap{margin:0 auto 10px;max-width:1452px}}' +
    /* dentro da janela da página Delivery (celular): só o botão do pedido completo, para sobrar tela para o app */
    '@media(max-width:640px){.em-moldura .demo>div:first-child,.em-moldura #langsw,.em-moldura .dbt>button:not(#da-btn){display:none}.em-moldura .demo{padding:6px 10px 4px}.em-moldura .dev,.em-moldura .dev.tab{height:calc(100dvh - 96px)}#da-cap{margin:0 10px 8px}}';
  if (window.top !== window) document.documentElement.classList.add('em-moldura');
  document.head.appendChild(css);

  function rodaCodigo(c) { try { return (0, eval)(c); } catch (e) { return null; } }
  function clica(sel) { var e = document.querySelector(sel); if (e) { e.click(); return true; } return false; }
  /* o "+" do cartão adiciona direto (tocar no cartão abre o montador nas demos que têm) */
  function adiciona(id) { clica('#cliente [data-a="add"][data-id="' + id + '"] .ad') || clica('#cliente [data-a="add"][data-id="' + id + '"]'); }
  function aba(t) { var m = document.getElementById('mt'); if (m && getComputedStyle(m).display !== 'none') clica('#mt [data-t="' + t + '"]'); }
  function legenda(n, txt) { cap.hidden = false; cap.innerHTML = '<b>' + n + '</b><span></span>'; cap.lastChild.textContent = T(txt); }
  function em(ms, f) { timers.push(setTimeout(f, ms)); }
  function fim() { rodando = false; btn.disabled = false; btn.textContent = '↺ ' + T('Ver de novo'); }

  function roda() {
    if (rodando) return; rodando = true; btn.disabled = true; btn.textContent = '… ' + T('Rodando');
    timers.forEach(clearTimeout); timers = [];
    rodaCodigo("S=seed();save();L.my=null;L.screen='menu';L.cart={};L.seen=null;L.coupon=null;L.cmsg='';localStorage.removeItem(KEY+'-my');renderAll()");
    aba('cliente'); window.scrollTo({ top: 0 });
    legenda(1, 'O cliente escolhe os pratos');
    em(1200, function () { adiciona(a); });
    em(2100, function () { adiciona(b); });
    em(3200, function () { clica('#cliente [data-a="cart"]'); });
    em(4200, function () { legenda(2, 'Faz o pedido e paga no Pix'); });
    em(5600, function () { clica('#cliente [data-a="order"]'); });
    em(8000, function () { clica('#cliente [data-a="paynow"]'); });
    em(9400, function () { aba('cozinha'); legenda(3, 'A cozinha recebe o pedido já pago'); });
    em(11200, function () { clica('#cozinha [data-a="k"][data-s="preparando"][data-o="4821"]'); });
    em(13600, function () { clica('#cozinha [data-a="k"][data-s="pronto"][data-o="4821"]'); });
    em(15000, function () { aba('motoboy'); legenda(4, 'O motoboy aceita e sai para entregar'); clica('#motoboy [data-a="gps"]'); });
    em(16600, function () { clica('#motoboy [data-a="maccept"][data-o="4821"]'); });
    em(18400, function () {
      clica('#motoboy [data-a="mpick"]');
      rodaCodigo("var o=find(4821);if(o){o.t.routeStart=Date.now()-ROUTE_MS*.88;save();renderAll()}");
    });
    em(20400, function () { aba('cliente'); legenda(5, 'O cliente acompanha o motoboy no mapa'); });
    em(27800, function () { aba('motoboy'); legenda(6, 'O motoboy chega e confirma com o código'); clica('#motoboy [data-a="march"]'); });
    em(30200, function () { rodaCodigo("var o=find(4821);var i=document.getElementById('mcode');if(i&&o)i.value=o.code"); clica('#motoboy [data-a="mdone"]'); });
    em(32400, function () { aba('cliente'); legenda(7, 'Entrega confirmada'); });
    em(35500, fim);
  }
  btn.addEventListener('click', roda);
})();
