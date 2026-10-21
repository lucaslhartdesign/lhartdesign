/* Demonstração "o cliente monta o prato" (página Delivery): hambúrguer e pizza que se formam e o preço que sobe na hora.
   Usa os mesmos desenhos do app (desenho.js). Os textos passam pelo motor de idiomas do site (LH.t). */
(function () {
  var host = document.getElementById('mtdemo');
  if (!host || !window.LHD) return;
  var WA = '5511989304239';
  var T = function (s, v) { return (window.LH && LH.t) ? LH.t(s, v) : s.replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); };
  var R = function (v) { return 'R$ ' + v.toFixed(2).replace('.', ','); };
  var D = {
    burger: { rotulo: 'Hambúrguer', prato: 'Monte o seu burger', base: 22.9, extra: 'Pão brioche e burger de 160 g',
      itens: [['Cheddar', 4], ['Bacon crocante', 5], ['Alface', 2], ['Tomate', 2], ['Cebola caramelizada', 3], ['Picles', 2], ['Ovo frito', 3], ['Carne extra', 9]] },
    pizza: { rotulo: 'Pizza', prato: 'Monte sua pizza', base: 39.9, extra: 'Massa fina e molho de tomate',
      itens: [['Mussarela', 5], ['Pepperoni', 6], ['Cogumelos', 5], ['Azeitonas', 4], ['Manjericão', 3], ['Pimentão', 3], ['Cebola', 2], ['Tomate', 3]] },
    acai: { rotulo: 'Açaí', prato: 'Monte o seu açaí', base: 18.9, extra: 'Açaí 300 ml e o creme',
      itens: [['Sorvete', 5], ['Banana', 3], ['Morango', 4], ['Granola', 3], ['Leite em pó', 4], ['Leite condensado', 3], ['Paçoca', 3]] }
  };
  var modo = 'burger', marcados = {}, vivo = null, preco, wa, prev, ordem = ['Açaí'], ord = null;

  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  function desenha() {
    var d = D[modo], nomes = Object.keys(marcados).filter(function (k) { return marcados[k]; });
    var L = window.LHD;
    if (modo === 'pizza') vivo.set(nomes.map(L.toppingDe).filter(Boolean));
    else if (modo === 'acai') {
      /* o copo enche de baixo para cima na ordem dos toques; as setas trocam a ordem das camadas */
      ordem.splice(0, ordem.length, ...ordem.filter(function (x) { return x === 'Açaí' || nomes.indexOf(x) >= 0; }), ...nomes.filter(function (x) { return ordem.indexOf(x) < 0; }));
      ord.desenha(); vivo.set(ordem.map(L.bowlDe).filter(Boolean));
    }
    else vivo.set(L.empilha(['pao', 'carne', 'topo'], nomes.map(L.camadaDe).filter(Boolean)));
    var total = d.base + nomes.reduce(function (s, n) { return s + d.itens.filter(function (i) { return i[0] === n; })[0][1]; }, 0);
    preco.textContent = R(total);
    var lista = nomes.length ? (modo === 'acai' ? ordem.filter(function (n) { return n !== 'Açaí'; }) : nomes).map(function (n) { return T(n); }).join(', ') : T('sem adicionais');
    wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(T('Oi! Montei no site da Lhart: {prato} com {itens} ({preco}). Quero um cardápio assim no meu restaurante.', { prato: T(d.prato), itens: lista, preco: R(total) }));
  }

  function monta() {
    var d = D[modo];
    host.textContent = '';
    var abas = el('div', 'mt-abas');
    Object.keys(D).forEach(function (k) {
      var b = el('button', k === modo ? 'on' : '', T(D[k].rotulo)); b.type = 'button';
      b.addEventListener('click', function () { if (modo !== k) { modo = k; marcados = {}; monta(); } });
      abas.append(b);
    });
    prev = el('div', 'mt-prev');
    vivo = modo === 'pizza' ? window.LHD.pizzaViva() : modo === 'acai' ? window.LHD.copoViva() : window.LHD.lancheViva();
    prev.append(vivo.el, el('p', 'mt-dica', T('Toque nos ingredientes para montar')));
    if (modo === 'acai') { ordem = ['Açaí']; ord = window.LHD.ordenador(ordem, function () { vivo.set(ordem.map(window.LHD.bowlDe).filter(Boolean)); }); ord.el.style.width = 'calc(100% - 24px)'; prev.append(ord.el); }
    var chips = el('div', 'mt-chips');
    d.itens.forEach(function (it) {
      var k = modo === 'pizza' ? window.LHD.toppingDe(it[0]) : modo === 'acai' ? window.LHD.bowlDe(it[0]) : window.LHD.camadaDe(it[0]);
      var b = el('button', 'mt-chip'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      var ic = el('i', null, (k && window.LHD.ICONES[k]) || '•'); ic.setAttribute('aria-hidden', 'true');
      b.append(ic, el('span', null, T(it[0])), el('small', null, '+ ' + R(it[1])));
      b.addEventListener('click', function () { marcados[it[0]] = !marcados[it[0]]; b.classList.toggle('on', !!marcados[it[0]]); b.setAttribute('aria-pressed', marcados[it[0]] ? 'true' : 'false'); desenha(); });
      chips.append(b);
    });
    var rodape = el('div', 'mt-rod');
    var info = el('div', 'mt-info');
    info.append(el('b', null, T(d.prato)), el('small', null, T(d.extra)));
    preco = el('strong', 'mt-preco', R(d.base));
    wa = el('a', 'btn'); wa.target = '_blank'; wa.rel = 'noopener'; wa.textContent = T('Quero um cardápio assim');
    rodape.append(info, preco, wa);
    host.append(abas, prev, chips, rodape);
    desenha();
  }
  monta();
  if (window.LH && LH.on) LH.on(function () { marcados = {}; monta(); });
})();
