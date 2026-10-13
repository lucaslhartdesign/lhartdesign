/* Cena animada "pedido na mesa" (página Delivery): QR da mesa -> pedido no celular -> cozinha -> prato na mesa.
   Só usa formas fixas escritas aqui (nada vem de fora). Pausa fora da tela e respeita "reduzir movimento". */
(function () {
  var host = document.getElementById('mzscene');
  if (!host) return;
  var T = function (s) { return (window.LH && LH.t) ? LH.t(s) : s; };
  var reduzido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INI = [0, 3200, 8600, 12400], FIM = 18200;
  var tm = [], step = -1, vis = false, st, box, cap, chips, k = 1;

  function qr(seed) {
    var n = 21, r = seed, out = '';
    function rnd() { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; }
    function finder(x, y) { return x < 7 && y < 7 || x > 13 && y < 7 || x < 7 && y > 13; }
    function fv(x, y) { var a = x > 13 ? x - 14 : x, b = y > 13 ? y - 14 : y; return a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4); }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var on = finder(x, y) ? fv(x, y) : rnd() > 0.52;
      if (on) out += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    return '<svg viewBox="0 0 21 21" fill="#161826" shape-rendering="crispEdges" aria-hidden="true">' + out + '</svg>';
  }
  function burger(animado) {
    var L = function (i, body) { return '<g' + (animado ? ' class="mz-ly" style="--i:' + i + '"' : '') + '>' + body + '</g>'; };
    return '<svg viewBox="0 0 200 150" aria-hidden="true">' +
      L(0, '<path d="M24 118 h152 q6 0 6 6 v4 q0 12 -12 12 h-140 q-12 0 -12 -12 v-4 q0 -6 6 -6z" fill="url(#mzB)"/>') +
      L(1, '<path d="M26 104 q8 -9 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 v14 h-112z" fill="#6dbb3a" stroke="#4d9a26"/><path d="M30 112 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="#ff6a4d" stroke-width="5" stroke-linecap="round"/>') +
      L(2, '<rect x="22" y="84" width="156" height="24" rx="12" fill="url(#mzP)"/>') +
      L(3, '<path d="M20 78 h160 l-6 6 q-10 2 -12 12 q-4 8 -10 0 q-2 -8 -10 -10 h-72 q-8 2 -10 10 q-4 8 -10 0 q-2 -10 -12 -12z" fill="#ffc933"/>') +
      L(4, '<path d="M24 70 q-4 -6 4 -6 h144 q8 0 4 6 v10 h-152z" fill="url(#mzT)" opacity="0"/>') +
      L(5, '<path d="M26 82 C24 40 60 22 100 22 C140 22 176 40 174 82 Q174 88 168 88 H32 Q26 88 26 82Z" fill="url(#mzT)"/>' +
        '<ellipse cx="72" cy="40" rx="26" ry="6" transform="rotate(-16 72 40)" fill="#fff" opacity=".22"/>' +
        '<ellipse cx="68" cy="52" rx="4" ry="2" fill="#fff0cd"/><ellipse cx="94" cy="38" rx="4" ry="2" fill="#fff0cd"/><ellipse cx="122" cy="48" rx="4" ry="2" fill="#fff0cd"/><ellipse cx="146" cy="60" rx="4" ry="2" fill="#fff0cd"/><ellipse cx="100" cy="62" rx="4" ry="2" fill="#fff0cd"/>') +
      '</svg>';
  }
  var DEFS = '<svg class="mz-hid" aria-hidden="true"><defs>' +
    '<linearGradient id="mzB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9b061"/><stop offset="1" stop-color="#b66b1b"/></linearGradient>' +
    '<linearGradient id="mzT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c477"/><stop offset=".75" stop-color="#d28a35"/><stop offset="1" stop-color="#b66b1b"/></linearGradient>' +
    '<linearGradient id="mzP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a3b25"/><stop offset="1" stop-color="#2a140a"/></linearGradient></defs></svg>';

  function legendas() {
    return [
      ['1', 'Chega e escaneia', 'O cliente entra, senta e <b>aponta a câmera para o QR Code da mesa</b>. Não precisa baixar nada nem chamar o garçom.'],
      ['2', 'Faz o pedido', 'O cardápio abre já na <b>mesa dele</b>. Ele escolhe, toca em “+” e envia: sem esperar atendimento.'],
      ['3', 'Cozinha recebe', 'O pedido cai direto na tela da cozinha, com o <b>número da mesa</b>, e avança de Novo a Pronto.'],
      ['4', 'Garçom serve', 'O garçom leva o prato <b>direto à mesa certa</b> e marca “servido”. A conta da mesa fecha no caixa.']
    ];
  }
  function pessoa(x, y, rot, cor, pele, cabelo, extra) {
    return '<div class="mz-pp ' + (extra || '') + '" style="transform:translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg);--c:' + cor + ';--h:' + pele + ';--hair:' + cabelo + '">' +
      '<i class="sh"></i><i class="ar l"></i><i class="ar r"></i><i class="hd"></i></div>';
  }
  function cadeira(x, y, rot) { return '<i class="mz-ch" style="left:' + x + 'px;top:' + y + 'px;margin:-12px 0 0 -15px;transform:rotate(' + rot + 'deg)"></i>'; }
  function prato(x, y, cor) { return '<i class="mz-pt" style="left:' + (x - 13) + 'px;top:' + (y - 13) + 'px;--f:' + cor + '"></i>'; }
  function mesa(x, y, r, n) { return '<div class="mz-tbl" style="left:' + (x - r) + 'px;top:' + (y - r) + 'px;width:' + (2 * r) + 'px;height:' + (2 * r) + 'px"><span class="nb">' + n + '</span></div>'; }
  function html(ls) {
    var ch = ls.map(function (l, i) { return '<button type="button" data-i="' + i + '"><b>' + l[0] + '</b><span>' + T(l[1]) + '</span></button>'; }).join('');
    var salao =
      '<div class="mz-kroom"></div><div class="mz-pan" style="left:500px"></div><div class="mz-pan" style="left:566px"></div><div class="mz-ctr"></div>' +
      '<div class="mz-floor"></div><div class="mz-wall"><i></i></div><div class="mz-door"></div>' +
      // mesas 2, 4 e 9 (ocupadas, gente comendo) e a mesa 7 (a do cliente)
      mesa(255, 250, 42, '2') + mesa(385, 240, 40, '4') + mesa(565, 330, 42, '9') + mesa(330, 370, 46, '7') +
      cadeira(255, 194, 0) + cadeira(198, 250, 90) + cadeira(385, 186, 0) + cadeira(385, 296, 0) + cadeira(565, 274, 0) + cadeira(565, 386, 0) + cadeira(278, 370, 90) + cadeira(330, 432, 0) +
      prato(255, 222, '#c94b2c') + prato(227, 250, '#e0a63a') + prato(385, 214, '#6dbb3a') + prato(385, 268, '#c94b2c') + prato(565, 303, '#e0a63a') + prato(565, 358, '#6dbb3a') +
      '<i class="mz-cup" style="left:280px;top:240px"></i><i class="mz-cup" style="left:372px;top:246px"></i><i class="mz-cup" style="left:586px;top:326px"></i>' +
      pessoa(255, 194, 0, '#4b7bd9', '#e9b88f', '#3a2418', 'eat') + pessoa(198, 250, 270, '#8e5bd1', '#c98f68', '#1c1210', 'eat') +
      pessoa(385, 186, 0, '#2fa884', '#f0c9a4', '#7a4a1e', 'eat') + pessoa(385, 296, 180, '#d1456b', '#d9a37a', '#2c1b10', 'eat') +
      pessoa(565, 274, 0, '#e0a63a', '#b57a52', '#150d09', 'eat') + pessoa(565, 386, 180, '#4b7bd9', '#e9b88f', '#8a5a2b', 'eat') +
      '<span class="mz-lbl" style="left:292px;top:300px">' + T('MESA 7') + '</span>' +
      '<div class="mz-stand">' + qr(7) + '</div><div class="mz-food"><div class="pt"></div>' + burger(false) + '</div>' +
      '<div class="mz-pp mz-cu">' + '<i class="sh"></i><i class="ar l"></i><i class="ar r"></i><i class="hd"></i></div>' +
      '<div class="mz-pp wt mz-wp" style="z-index:5"><i class="sh"></i><i class="ar l"></i><i class="ar r"></i><i class="hd"></i><div class="mz-tray">' + burger(false) + '</div></div>' +
      '<div class="mz-ok">✓ ' + T('Servido na mesa') + '</div>';
    return DEFS +
      '<div class="mz-steps" id="mzchips">' + ch + '</div>' +
      '<div class="mz-box" id="mzbox"><div class="mz-stage" id="mzst">' + salao +
        '<div class="mz-kit"><div class="mz-kh"><span>' + T('Cozinha') + '</span><i>● ' + T('ao vivo') + '</i></div><div class="mz-tk"><b>🪑 ' + T('MESA 7') + '</b><small>1× Brasa Clássico</small>' +
          '<div class="mz-pls"><span>' + T('Novo') + '</span><span>' + T('Preparando') + '</span><span>' + T('Pronto') + '</span><span>' + T('Servido') + '</span></div></div></div>' +
        '<div class="mz-phone"><div class="mz-cam"><div class="mz-camt">' + T('Aponte para o QR da mesa') + '</div><div class="mz-vf">' + qr(7) + '<i class="mz-scan"></i></div><span class="mz-hit">✓ ' + T('Mesa 7') + '</span></div>' +
          '<div class="mz-menu"><div class="mz-mh"><span>BRASA &amp; PONTO</span><i>' + T('MESA 7') + '</i></div><div class="mz-art">' + burger(true) + '</div>' +
          '<div class="mz-nm">BRASA CLÁSSICO</div><div class="mz-ds">' + T('Pão brioche, burger na brasa, cheddar e molho da casa') + '</div><div class="mz-pr">R$ 32,90</div><div class="mz-add">+</div>' +
          '<div class="mz-bag"><span><b>1</b>' + T('VER SACOLA') + '</span><span>R$ 32,90</span></div>' +
          '<div class="mz-sent"><b>✓ ' + T('PEDIDO ENVIADO') + '</b><small>' + T('A cozinha já recebeu') + '</small></div></div></div>' +
        '<div class="mz-finger">👆</div><div class="mz-pk"></div>' +
      '</div></div><p class="mz-cap" id="mzcap" aria-live="polite"></p>';
  }

  function fit() { if (!box) return; k = Math.min(1, box.clientWidth / 640); st.style.transform = 'scale(' + k + ')'; box.style.height = Math.round(520 * k) + 'px'; }
  function clear() { tm.forEach(clearTimeout); tm = []; }
  function legenda(n) { var l = legendas()[n]; cap.innerHTML = '<b>' + l[0] + '. ' + T(l[1]) + '</b> ' + T(l[2]); }
  function marca(n) { [].forEach.call(chips.children, function (b, i) { b.classList.toggle('on', i === n); b.classList.toggle('done', i < n); }); }
  function reset() { for (var i = 0; i < 4; i++) st.classList.remove('on' + i); void st.offsetWidth; }
  function ir(n) { step = n; st.classList.add('on' + n); marca(n); legenda(n); }
  function roda() {
    clear(); reset(); ir(0);
    INI.slice(1).forEach(function (t, i) { tm.push(setTimeout(function () { ir(i + 1); }, t)); });
    tm.push(setTimeout(roda, FIM));
  }
  function pula(n) { // clique no passo: salta direto, sem repetir as animações dos anteriores
    clear(); st.classList.add('mz-skip'); reset();
    for (var i = 0; i < n; i++) st.classList.add('on' + i);
    void st.offsetWidth; st.classList.remove('mz-skip'); ir(n);
    INI.slice(n + 1).forEach(function (t, i) { tm.push(setTimeout(function () { ir(n + 1 + i); }, t - INI[n])); });
    tm.push(setTimeout(roda, FIM - INI[n]));
  }
  function monta() {
    host.innerHTML = html(legendas());
    st = document.getElementById('mzst'); box = document.getElementById('mzbox'); cap = document.getElementById('mzcap'); chips = document.getElementById('mzchips');
    [].forEach.call(chips.children, function (b) { b.addEventListener('click', function () { if (reduzido) { ir(+b.dataset.i); return; } pula(+b.dataset.i); }); });
    fit();
    if (reduzido) { st.classList.add('mz-static'); for (var i = 0; i < 4; i++) st.classList.add('on' + i); marca(3); legenda(3); }
    else if (vis) roda();
  }

  monta();
  addEventListener('resize', fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(host);
  if (window.LH && LH.on) LH.on(function () { var n = step < 0 ? 0 : step; clear(); monta(); if (!reduzido && vis) { st.classList.add('mz-skip'); for (var i = 0; i < n; i++) st.classList.add('on' + i); void st.offsetWidth; st.classList.remove('mz-skip'); ir(n); tm.push(setTimeout(roda, FIM - INI[n])); } });
  if ('IntersectionObserver' in window && !reduzido) {
    new IntersectionObserver(function (es) {
      var v = es[0].isIntersecting;
      if (v && !vis) { vis = true; roda(); } else if (!v && vis) { vis = false; clear(); }
    }, { threshold: 0.25 }).observe(host);
  } else if (!reduzido) { vis = true; roda(); }
})();
