/* Demo com o nome do restaurante (SniperLeads, 09/11/2026).
   ?nome=Bar do Ze   troca o nome da loja em todas as telas e separa o estado desta demo das outras.
   ?mesa=4           modo "pedido na mesa": sem taxa de entrega, o pedido sai como "Mesa 4" na cozinha.
   Sem parametro nenhum, a demo fica exatamente como era (delivery.html continua usando os mesmos arquivos). */
(function () {
  var p = new URLSearchParams(location.search);
  var nome = (p.get('nome') || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  var mesaParam = p.get('mesa');
  var mesa = mesaParam === null ? null : (parseInt(mesaParam, 10) || 0);

  function slug(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  }

  // ?tema=clean — o app por dentro limpo: branco, cinzas suaves, Inter e um
  // destaque só, no roxo da Lhart. Em qualquer modelo (o Burger Neon é rosa
  // neon). Pedido do Lucas, 09/11/2026: "dentro do app deixa algo mais clean".
  var clean = p.get('tema') === 'clean';
  if (clean) {
    var f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(f);
    var st = document.createElement('style');
    st.textContent = ':root{--page:#f3f4f7;--pcard:#ffffff;--pink:#15161c;--pmu:#6b6f7d;--pline:#e6e7ec;' +
      '--bg:#ffffff;--card:#f6f7f9;--ink:#15161c;--mu:#6b6f7d;--line:#ececf1;--ac:#6c5fd3;--ac2:#9184d9;' +
      '--acink:#fff;--price:#15161c;--rad:14px;--f1:Inter,sans-serif;--f2:Inter,sans-serif}' +
      // tira o brilho neon que alguns modelos desenham fora das variáveis
      '*{text-shadow:none!important}';
    document.head.appendChild(st);
  }

  window.LHP = function (CFG) {
    if (clean) {
      CFG.accent = '#6c5fd3';
      CFG.mapBg = '#eef0f4';
      CFG.road = '#ffffff';
      // Os nomes "neon" do modelo de hambúrguer viram nomes de cardápio comum.
      var NOMES = { bn1: 'Clássico da Casa', bn2: 'Bacon Barbecue', bn3: 'Gorgonzola',
                    bn4: 'Veggie', bn5: 'Batata Rústica' };
      (CFG.menu || []).forEach(function (cat) {
        (cat.items || []).forEach(function (i) { if (NOMES[i.id]) i.name = NOMES[i.id]; });
      });
    }
    if (nome) {
      CFG.store.name = nome;
      CFG.slug = CFG.slug + '-' + slug(nome);
      document.title = nome + ' · demonstração';
    }
    if (mesa !== null) {
      CFG.slug = CFG.slug + '-mesa';
      CFG.store.fee = 0;
    }
  };

  window.LHP_pos = function () {
    if (mesa === null) return;
    try {
      if (mesa > 0) L.addr = 'Mesa ' + mesa + ' · no salão';
      // O pedido feito por este celular sai com o número da mesa na cozinha.
      var original = save;
      save = function () {
        if (mesa > 0) {
          S.orders.forEach(function (o) {
            if (o.cust === 'Você' && !o.mesa) { o.mesa = mesa; o.cust = 'Mesa ' + mesa; o.addr = 'No salão'; }
          });
        }
        return original.apply(this, arguments);
      };
      // Quem está sentado não tem motoboy: sai o mapa, a rota e o código de
      // entrega, e o acompanhamento termina com o prato na mesa.
      var css = document.createElement('style');
      css.textContent = '#cliente .map,#cliente .mapfr,#cliente .mt2,#cliente .eta,#cliente .cour,' +
        '#cliente .code,#cliente .banner,#cliente .note{display:none!important}';
      document.head.appendChild(css);
      var passos = stepsFor;
      stepsFor = function (o) {
        var lista = passos(o), T = o.t || {};
        var servido = o.st === 'pronto' || o.st === 'rota' || o.st === 'entregue';
        return [lista[0], lista[1], ['Pronto, indo para a mesa', T.pronto, !!T.pronto],
                ['Servido na mesa', T.pronto, servido && o.st !== 'pronto']];
      };
      // As frases de delivery da tela do cliente viram frases de salão.
      var TROCA = [[/Aguardando o motoboy retirar/g, 'O garçom já leva na sua mesa'],
                   [/Seu pedido está a caminho/g, 'Seu pedido está indo para a mesa'],
                   [/Saiu para entrega/g, 'Indo para a mesa'],
                   [/Seu entregador (chegou|está chegando)/g, 'Servido na mesa'],
                   [/^Entregue$/g, 'Servido']];
      var desenhar = cliente;
      cliente = function () {
        var r = desenhar.apply(this, arguments), el = document.getElementById('cliente');
        if (!el) return r;
        var it = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
        while ((n = it.nextNode())) {
          var t = n.nodeValue;
          TROCA.forEach(function (x) { t = t.replace(x[0], x[1]); });
          if (t !== n.nodeValue) n.nodeValue = t;
        }
        // A linha "Entrega · Grátis" do resumo e da sacola.
        el.querySelectorAll('.sum > div').forEach(function (d) {
          var s = d.querySelector('span');
          if (s && s.textContent.trim() === 'Entrega') d.style.display = 'none';
        });
        return r;
      };
      // Os pedidos de exemplo da cozinha também vêm de mesas, não de endereços.
      if (!S.mesaPronto) {
        S.orders.forEach(function (o, i) { o.cust = 'Mesa ' + (i + 2); o.addr = 'No salão'; o.fee = 0; });
        S.mesaPronto = 1;
        original();
      }
    } catch (e) { /* a demo segue como delivery */ }
  };
})();
