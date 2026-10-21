/* "Monte o seu" nas demos de delivery (burger, pizza e açaí).
   Mantém o jeito antigo (o botão + redondo do cartão adiciona direto) e acrescenta o novo: tocar no cartão abre a folha onde o cliente
   escolhe os adicionais e vê o prato se formar. Depende de desenho.js (window.LHD) e das globais da demo (L, cliente, ALL). */
(function () {
  var arq = location.pathname.split('/').pop().replace(/\.html$/, '');
  var BURGER = [['Cheddar', 4], ['Bacon crocante', 5], ['Alface', 2], ['Tomate', 2], ['Cebola caramelizada', 3], ['Picles', 2], ['Ovo frito', 3], ['Carne extra', 9]];
  var PIZZA = [['Mussarela', 5], ['Pepperoni', 6], ['Cogumelos', 5], ['Azeitonas', 4], ['Manjericão', 3], ['Pimentão', 3], ['Cebola', 2], ['Bacon', 6]];
  var BOWL = [['Sorvete', 5], ['Banana', 3], ['Morango', 4], ['Granola', 3], ['Leite em pó', 4], ['Leite condensado', 3], ['Paçoca', 3]];
  var CFG = {
    'delivery-burger-neon': { tipo: 'burger', extras: BURGER, itens: {
      bn1: { ini: ['Cheddar', 'Cheddar', 'Picles'] }, bn2: { ini: ['Carne extra', 'Bacon crocante'] },
      bn3: { ini: ['Cheddar', 'Cebola caramelizada'] }, bn4: { ini: ['Alface', 'Tomate'], base: ['pao', 'grao', 'topo'] } } },
    'delivery-sabor-express': { tipo: 'misto', itens: {
      se1: { tipo: 'burger', extras: BURGER, ini: ['Cheddar', 'Alface', 'Tomate'] },
      se2: { tipo: 'burger', extras: BURGER, ini: ['Cheddar', 'Bacon crocante', 'Alface'] },
      se3: { tipo: 'burger', extras: BURGER, ini: ['Cheddar', 'Bacon crocante', 'Ovo frito', 'Alface', 'Tomate'] },
      se4: { tipo: 'pizza', extras: PIZZA, ini: ['Mussarela', 'Calabresa', 'Cebola'] },
      se5: { tipo: 'pizza', extras: PIZZA, ini: ['Mussarela', 'Tomate', 'Manjericão'] } } },
    'delivery-forno-a-lenha': { tipo: 'pizza', extras: PIZZA, itens: {
      fl1: { ini: ['Mussarela', 'Tomate', 'Manjericão'] }, fl2: { ini: ['Calabresa', 'Cebola', 'Mussarela'] }, fl3: { ini: ['Mussarela'] },
      fl4: { ini: ['Mussarela', 'Manjericão'] }, fl5: { ini: ['Mussarela', 'Pepperoni'] } } },
    'delivery-acai-tropical': { tipo: 'acai', extras: BOWL, itens: { at1: { ini: ['Açaí'] }, at2: { ini: ['Açaí'] }, at3: { ini: ['Açaí'] }, at4: { ini: ['Açaí', 'Banana', 'Morango', 'Granola'] } } }
  };
  var C = CFG[arq];
  var KEY = 'md-itens-' + arq;
  var guardados = {};
  try { guardados = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { guardados = {}; }

  /* itens montados ficam guardados no navegador: o pedido feito com eles continua aparecendo na cozinha depois de recarregar */
  window.MD = {
    get: function (id) { return guardados[id] || { id: id, name: 'Item', price: 0, e: '🍽', a: '#999', b: '#666' }; }
  };
  if (!C) return;

  var T = function (s) { return (window.LH && LH.t) ? LH.t(s) : s; };
  var R = function (v) { return 'R$ ' + v.toFixed(2).replace('.', ','); };
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  var css = document.createElement('style');
  css.textContent =
    '.mdt{display:inline-block;margin:0 0 8px;padding:3px 9px;border:1px dashed var(--ac);border-radius:99px;color:var(--ac);font:700 11px var(--f2,inherit);letter-spacing:.02em}' +
    '.mdx{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-end;background:#0009;animation:mdf .25s}' +
    '.mds{width:100%;max-height:94%;overflow:auto;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-bottom:0;border-radius:24px 24px 0 0;padding:14px 14px 18px;animation:mdu .35s cubic-bezier(.2,.8,.2,1)}' +
    '.mdh{display:flex;align-items:center;gap:10px;margin-bottom:6px}.mdh b{flex:1;font:800 17px var(--f1,inherit)}' +
    '.mdh button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:18px}' +
    '.mdp{display:grid;justify-items:center;border-radius:18px;background:radial-gradient(60% 70% at 50% 58%,color-mix(in srgb,var(--ac) 22%,transparent),transparent 72%),var(--card);padding:8px 0 2px}' +
    '.mdp svg{width:min(210px,62%);height:auto;max-height:230px;overflow:visible;filter:drop-shadow(0 12px 12px #0006)}' +
    '.mdp p{margin:2px 0 6px;font-size:12px;color:var(--mu);text-align:center}' +
    '.mdc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}' +
    '.mdc button{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 4px 7px;border:1.5px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);transition:.2s}' +
    '.mdc i{font-style:normal;font-size:22px;line-height:1.1;filter:grayscale(.6);opacity:.7;transition:.2s}' +
    '.mdc span{font:700 11.5px/1.15 var(--f2,inherit);text-align:center}.mdc small{font-size:10.5px;color:var(--mu)}' +
    '.mdc button.on{border-color:var(--ac);box-shadow:0 6px 16px color-mix(in srgb,var(--ac) 30%,transparent)}.mdc button.on i{filter:none;opacity:1;transform:scale(1.12)}' +
    '.mdc button.on::after{content:"✓";position:absolute;right:4px;top:3px;width:15px;height:15px;border-radius:50%;background:var(--ac);color:var(--acink);font:800 9px sans-serif;display:grid;place-items:center}' +
    '.mdr{display:flex;align-items:center;gap:12px}.mdr strong{font:800 22px var(--f1,inherit);color:var(--price)}' +
    '.mdr .ok{flex:1;border:0;border-radius:14px;padding:14px;background:var(--ac);color:var(--acink);font-weight:800;font-size:15px}' +
    '.mdq{display:block;width:100%;margin-top:10px;border:0;background:none;color:var(--mu);font:600 12.5px var(--f2,inherit);text-decoration:underline}' +
    '.mdp .pizza .pi{transform:scale(0);opacity:0;transition:transform .45s cubic-bezier(.3,1.6,.5,1),opacity .2s}' +
    '.mdp .pizza g.on .pi{transform:scale(1);opacity:1}' +
    '.mdp .pizza .cob>g{transition:opacity .3s}.mdp .pizza .cob>g:not(.on){opacity:.001}' +
    '@keyframes mdf{from{opacity:0}}@keyframes mdu{from{transform:translateY(40px);opacity:.4}}';
  document.head.appendChild(css);

  var folha = null;
  function conf(id) {
    var i = C.itens[id];
    return { tipo: i.tipo || C.tipo, extras: i.extras || C.extras, ini: i.ini || [], base: i.base };
  }

  function fecha() { if (folha) { folha.remove(); folha = null; } }

  function abre(id) {
    var base = ALL.filter(function (x) { return x.id === id; })[0]; if (!base) return;
    var c = conf(id), L = window.LHD;
    var marcados = {}, vivo = null, ordem = c.ini.slice(), ord = null;
    var chave = c.tipo === 'pizza' ? L && L.toppingDe : c.tipo === 'acai' ? L && L.bowlDe : L && L.camadaDe;
    var iniKeys = c.ini.map(function (n) { return chave && chave(n); }).filter(Boolean);
    var extras = c.extras.filter(function (x) { return c.tipo === 'burger' || iniKeys.indexOf(chave && chave(x[0])) < 0; });

    var x = el('div', 'mdx'), s = el('div', 'mds'); x.appendChild(s);
    x.addEventListener('click', function (e) { if (e.target === x) fecha(); });
    var h = el('div', 'mdh'), b = el('b', null, T(base.name)), fx = el('button', null, '×'); fx.type = 'button'; fx.setAttribute('aria-label', T('Fechar'));
    fx.addEventListener('click', fecha); h.append(b, fx);
    var prev = el('div', 'mdp');
    if (L) {
      vivo = c.tipo === 'pizza' ? L.pizzaViva() : c.tipo === 'acai' ? L.copoViva() : L.lancheViva();
      prev.append(vivo.el, el('p', null, T('Toque nos ingredientes para montar')));
    }
    var chips = el('div', 'mdc'), preco = el('strong'), rod = el('div', 'mdr'), ok = el('button', 'ok'); ok.type = 'button';

    function nomes() { return extras.map(function (e) { return e[0]; }).filter(function (n) { return marcados[n]; }); }
    function total() { return base.price + extras.reduce(function (t, e) { return t + (marcados[e[0]] ? e[1] : 0); }, 0); }
    function desenha() {
      if (L && vivo) {
        var todos = c.ini.concat(nomes());
        if (c.tipo === 'acai') {
          /* o copo enche de baixo para cima na ordem dos toques; as setas trocam a ordem das camadas */
          var n = nomes();
          ordem.splice(0, ordem.length, ...ordem.filter(function (x) { return c.ini.indexOf(x) >= 0 || n.indexOf(x) >= 0; }), ...n.filter(function (x) { return ordem.indexOf(x) < 0; }));
          if (ord) ord.desenha();
          vivo.set(ordem.map(chave).filter(Boolean));
        } else if (c.tipo === 'burger') vivo.set(L.empilha(c.base || ['pao', 'carne', 'topo'], todos.map(L.camadaDe).filter(Boolean)));
        else vivo.set(todos.map(chave).filter(Boolean));
      }
      preco.textContent = R(total());
      ok.textContent = T('Adicionar') + ' · ' + R(total());
    }
    extras.forEach(function (e) {
      var k = chave && chave(e[0]);
      var bt = el('button'); bt.type = 'button'; bt.setAttribute('aria-pressed', 'false');
      var ic = el('i', null, (k && L && L.ICONES[k]) || '•'); ic.setAttribute('aria-hidden', 'true');
      bt.append(ic, el('span', null, T(e[0])), el('small', null, '+ ' + R(e[1])));
      bt.addEventListener('click', function () { marcados[e[0]] = !marcados[e[0]]; bt.classList.toggle('on', !!marcados[e[0]]); bt.setAttribute('aria-pressed', marcados[e[0]] ? 'true' : 'false'); desenha(); });
      chips.appendChild(bt);
    });
    ok.addEventListener('click', function () {
      var n = nomes();
      if (!n.length) { poeNaSacola(base.id); fecha(); return; }
      var nid = base.id + '~' + extras.map(function (e, i) { return marcados[e[0]] ? i : ''; }).join('') + (c.tipo === 'acai' ? '~' + ordem.map(function (x) { return (chave && chave(x)) || x; }).join('.') : '');
      var nome = c.tipo === 'acai' ? base.name + ' · ' + T('camadas de baixo para cima') + ': ' + ordem.map(T).join(' › ') : base.name + ' + ' + n.map(T).join(', ');
      guardados[nid] = Object.assign({}, base, { id: nid, name: nome, price: total() });
      try { localStorage.setItem(KEY, JSON.stringify(guardados)); } catch (e) { /* sem armazenamento: o item só vale nesta visita */ }
      poeNaSacola(nid); fecha();
    });
    var q = el('button', 'mdq', T('Adicionar sem personalizar')); q.type = 'button';
    q.addEventListener('click', function () { poeNaSacola(base.id); fecha(); });
    rod.append(preco, ok);
    if (c.tipo === 'acai' && L) { ord = L.ordenador(ordem, function () { vivo.set(ordem.map(chave).filter(Boolean)); }); prev.append(ord.el); }
    s.append(h, prev, chips, rod, q);
    fecha(); folha = x; $('cliente').appendChild(x); desenha();
  }
  /* L (estado) e cliente() são globais da própria demo */
  function poeNaSacola(id) { L.cart[id] = (L.cart[id] || 0) + 1; cliente(); }

  document.addEventListener('click', function (e) {
    var it = e.target.closest && e.target.closest('.it[data-a="add"]');
    if (!it || !C.itens[it.dataset.id] || e.target.closest('.ad')) return;
    e.stopPropagation(); e.preventDefault(); abre(it.dataset.id);
  }, true);

  function decora() {
    var cl = document.getElementById('cliente'); if (!cl) return;
    if (folha && !cl.contains(folha)) cl.appendChild(folha);
    cl.querySelectorAll('.it[data-a="add"]').forEach(function (it) {
      if (!C.itens[it.dataset.id] || it.querySelector('.mdt')) return;
      var t = el('span', 'mdt', '✨ ' + T('Monte ao seu gosto')), d = it.querySelector('.p');
      if (d && d.parentNode) d.parentNode.insertBefore(t, d); else it.firstElementChild.appendChild(t);
    });
  }
  function liga() {
    var cl = document.getElementById('cliente'); if (!cl) return;
    new MutationObserver(decora).observe(cl, { childList: true });
    decora();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liga); else liga();
})();
