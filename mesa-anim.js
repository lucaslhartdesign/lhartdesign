/* Cena animada "pedido na mesa" (página Delivery): QR da mesa -> pedido no celular -> cozinha -> prato na mesa.
   Só usa formas fixas escritas aqui (nada vem de fora). Pausa fora da tela e respeita "reduzir movimento". */
(function () {
  var host = document.getElementById('mzscene');
  if (!host) return;
  var T = function (s) { return (window.LH && LH.t) ? LH.t(s) : s; };
  var reduzido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INI = [0, 4900, 13300, 17100], FIM = 22800;
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
  var PESSOA = '<i class="lh"></i><i class="cq"></i><i class="ar l"></i><i class="ar r"></i><i class="sh"></i><i class="hn l"></i><i class="hn r"></i><i class="ea l"></i><i class="ea r"></i><i class="hd"></i><i class="hat"></i>';
  function pessoa(x, y, rot, cor, pele, cabelo, extra) {
    return '<div class="mz-pp ' + (extra || '') + '" style="transform:translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg);--c:' + cor + ';--h:' + pele + ';--hair:' + cabelo + '">' + PESSOA + '</div>';
  }
  function cadeira(x, y, rot) { return '<i class="mz-ch" style="left:' + x + 'px;top:' + y + 'px;margin:-12px 0 0 -15px;transform:rotate(' + rot + 'deg)"></i>'; }
  function prato(x, y, cor) { return '<i class="mz-pt" style="left:' + (x - 12) + 'px;top:' + (y - 12) + 'px;--f:' + cor + '"></i>'; }
  function copo(x, y) { return '<i class="mz-cup" style="left:' + (x - 5) + 'px;top:' + (y - 5) + 'px"></i>'; }
  function vaso(x, y) { return '<i class="mz-vaso" style="left:' + (x - 13) + 'px;top:' + (y - 13) + 'px"></i>'; }
  function mesaR(x, y, r, n, foco) { return '<div class="mz-tbl rd' + (foco ? ' foco' : '') + '" style="left:' + (x - r) + 'px;top:' + (y - r) + 'px;width:' + (2 * r) + 'px;height:' + (2 * r) + 'px"><span class="nb">' + n + '</span></div>'; }
  function mesaC(x, y, w, h, n) { return '<div class="mz-tbl rc" style="left:' + (x - w / 2) + 'px;top:' + (y - h / 2) + 'px;width:' + w + 'px;height:' + h + 'px"><span class="nb">' + n + '</span></div>'; }
  // um lugar ocupado: cadeira + pessoa + prato (n/s/l/o = lado da mesa onde está a pessoa)
  function lugar(cx, cy, lado, d, cor, pele, cab, est, pc) {
    var x = cx, y = cy, rot = 0, px = cx, py = cy;
    if (lado === 'n') { y = cy - d; rot = 0; py = cy - d + 26; }
    else if (lado === 's') { y = cy + d; rot = 180; py = cy + d - 26; }
    else if (lado === 'o') { x = cx - d; rot = 270; px = cx - d + 26; }
    else { x = cx + d; rot = 90; px = cx + d - 26; }
    return cadeira(x, y, lado === 'n' || lado === 's' ? 0 : 90) + pessoa(x, y, rot, cor, pele, cab, 'eat ' + (est || '')) + prato(px, py, pc);
  }
  function html(ls) {
    var ch = ls.map(function (l, i) { return '<button type="button" data-i="' + i + '"><b>' + l[0] + '</b><span>' + T(l[1]) + '</span></button>'; }).join('');
    var salao =
      '<div class="mz-kroom"></div><div class="mz-stove"><i class="mz-pan" style="left:12px"></i><i class="mz-pan" style="left:62px"></i><i class="mz-pan" style="left:98px;width:30px;height:30px;top:11px"></i></div><div class="mz-ctr"></div>' +
      '<div class="mz-floor"></div><div class="mz-wall"><i></i></div><div class="mz-door"></div>' +
      '<div class="mz-rug"></div><div class="mz-spot"></div>' +
      // fileira de cima
      mesaR(256, 212, 30, '1') + mesaC(340, 212, 72, 44, '2') + mesaR(480, 212, 30, '3') + mesaC(588, 212, 56, 44, '4') +
      lugar(256, 212, 'n', 46, '#4b7bd9', '#e9b88f', '#3a2418', '', '#c94b2c') + lugar(256, 212, 's', 46, '#d1456b', '#d9a37a', '#2c1b10', 'longo', '#e0a63a') +
      lugar(322, 212, 'n', 46, '#2fa884', '#f0c9a4', '#7a4a1e', '', '#6dbb3a') + lugar(322, 212, 's', 46, '#8e5bd1', '#c98f68', '#1c1210', 'coque', '#c94b2c') + lugar(358, 212, 's', 46, '#e0a63a', '#b57a52', '#150d09', '', '#e0a63a') +
      lugar(480, 212, 'n', 46, '#e0a63a', '#d9a37a', '#7a3a1e', 'longo', '#c94b2c') + lugar(480, 212, 's', 46, '#4b7bd9', '#e9b88f', '#8a5a2b', '', '#6dbb3a') +
      lugar(588, 212, 'n', 46, '#d1456b', '#f0c9a4', '#2c1b10', 'coque', '#e0a63a') + lugar(588, 212, 's', 46, '#2fa884', '#b57a52', '#150d09', '', '#c94b2c') +
      // fileira do meio
      mesaR(256, 330, 30, '5') + mesaC(500, 330, 72, 44, '6') +
      lugar(256, 330, 'n', 46, '#8e5bd1', '#e9b88f', '#8a5a2b', 'longo', '#6dbb3a') + lugar(256, 330, 's', 46, '#4b7bd9', '#c98f68', '#150d09', '', '#c94b2c') +
      lugar(482, 330, 'n', 46, '#e8683c', '#f0c9a4', '#3a2418', '', '#e0a63a') + lugar(518, 330, 'n', 46, '#2fa884', '#d9a37a', '#2c1b10', 'coque', '#6dbb3a') + lugar(482, 330, 's', 46, '#d1456b', '#e9b88f', '#7a4a1e', 'longo', '#c94b2c') +
      // canto de baixo
      mesaR(590, 424, 30, '8') + mesaR(484, 450, 30, '9') +
      lugar(590, 424, 'o', 46, '#4b7bd9', '#d9a37a', '#2c1b10', '', '#e0a63a') + lugar(590, 424, 'l', 46, '#e0a63a', '#b57a52', '#150d09', 'longo', '#c94b2c') +
      cadeira(484, 404, 0) + cadeira(484, 496, 0) +
      // a mesa do cliente (mesa 7), no foco
      mesaR(330, 402, 38, '', true) + cadeira(330, 460, 0) + cadeira(274, 402, 90) +
      copo(300, 392) + copo(364, 412) +
      vaso(206, 172) + vaso(630, 172) + vaso(206, 500) + vaso(630, 496) +
      '<span class="mz-lbl" style="left:296px;top:342px">' + T('MESA 7') + '</span>' +
      '<div class="mz-stand">' + qr(7) + '</div><div class="mz-food"><div class="pt"></div>' + burger(false) + '</div>' +
      '<div class="mz-pp mz-cu">' + PESSOA + '<i class="ph"></i></div><i class="mz-flash"></i>' +
      '<div class="mz-pp wt mz-wp" style="z-index:5">' + PESSOA + '<div class="mz-tray">' + burger(false) + '</div></div>' +
      pessoa(556, 84, 180, '#f6f6f8', '#d9a37a', '#2c1b10', 'chef') +
      '<div class="mz-ok">✓ ' + T('Servido na mesa') + '</div>';
    return DEFS +
      '<div class="mz-steps" id="mzchips">' + ch + '</div>' +
      '<div class="mz-box" id="mzbox"><div class="mz-stage" id="mzst">' + salao +
        '<div class="mz-kit"><div class="mz-kh"><span>' + T('Cozinha') + '</span><i>● ' + T('ao vivo') + '</i></div><div class="mz-tk"><b>🪑 ' + T('MESA 7') + '</b><small>1× Brasa Clássico</small>' +
          '<div class="mz-pls"><span>' + T('Novo') + '</span><span>' + T('Preparando') + '</span><span>' + T('Pronto') + '</span><span>' + T('Servido') + '</span></div></div></div>' +
        '<div class="mz-phone"><div class="mz-cam"><div class="mz-camt">' + T('Aponte para o QR da mesa') + '</div><div class="mz-vf">' + qr(7) + '<i class="mz-scan"></i></div><span class="mz-hit">✓ ' + T('Mesa 7') + '</span></div>' +
                    '<div class="mz-menu"><div class="mz-sc"><div class="mz-art">' + burger(true) + '</div>' +
          '<div class="mz-nm">BRASA CLÁSSICO</div><div class="mz-ds">' + T('Pão brioche, burger na brasa, cheddar e molho da casa') + '</div><div class="mz-pr">R$ 32,90</div><div class="mz-add">+</div>' +
          '<div class="mz-sec2">' + T('PORÇÕES') + '</div>' +
          '<div class="mz-row r2" style="top:392px"><i class="th">🍟</i><div class="tx"><b>' + T('BATATA RÚSTICA') + '</b><span>R$ 22,90</span></div><i class="ad2">+</i></div>' +
          '<div class="mz-row" style="top:476px"><i class="th">🧅</i><div class="tx"><b>' + T('ANÉIS DE CEBOLA') + '</b><span>R$ 24,90</span></div><i class="ad2">+</i></div>' +
          '<div class="mz-row" style="top:560px"><i class="th">🥤</i><div class="tx"><b>' + T('REFRIGERANTE') + '</b><span>R$ 6,50</span></div><i class="ad2">+</i></div></div>' +
          '<div class="mz-mh"><span>BRASA &amp; PONTO</span><i>' + T('MESA 7') + '</i></div>' +
          '<div class="mz-bag"><span class="l b1"><b>1</b>' + T('VER SACOLA') + '</span><span class="l b2"><b>2</b>' + T('FINALIZAR') + '</span><span class="r p1">R$ 32,90</span><span class="r p2">R$ 55,80</span></div>' +
          '<div class="mz-sent"><b>✓ ' + T('PEDIDO ENVIADO') + '</b><small>' + T('A cozinha já recebeu') + '</small></div></div></div>' +
        '<div class="mz-finger">👆</div><div class="mz-pk"></div>' +
      '</div></div><p class="mz-cap" id="mzcap" aria-live="polite"></p>';
  }

  var mob = false;
  function enquadra() { // celular: a cena é cortada e a "câmera" acompanha a ação (celular+mesa 7, depois cozinha+mesa 7)
    var x = (mob && step >= 2) ? 200 : 0;
    st.style.transform = mob ? 'translateX(' + (-x * k) + 'px) scale(' + k + ')' : 'scale(' + k + ')';
  }
  function fit() {
    if (!box) return;
    mob = box.clientWidth < 440;
    k = mob ? box.clientWidth / 430 : Math.min(1, box.clientWidth / 640);
    box.style.height = Math.round(520 * k) + 'px';
    enquadra();
  }
  function clear() { tm.forEach(clearTimeout); tm = []; }
  function legenda(n) { var l = legendas()[n]; cap.innerHTML = '<b>' + l[0] + '. ' + T(l[1]) + '</b> ' + T(l[2]); }
  function marca(n) { [].forEach.call(chips.children, function (b, i) { b.classList.toggle('on', i === n); b.classList.toggle('done', i < n); }); }
  function reset() { for (var i = 0; i < 4; i++) st.classList.remove('on' + i); step = -1; enquadra(); void st.offsetWidth; }
  function ir(n) { step = n; st.classList.add('on' + n); marca(n); legenda(n); enquadra(); }
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
