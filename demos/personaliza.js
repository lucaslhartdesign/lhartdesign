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

  // ?tema=clean — o app por dentro sem neon, no ESCURO com as cores do pedido
  // na mesa (mesa.html): fundo #161826, painéis grafite, roxo da Lhart e o
  // verde dos confirmados. Pedido do Lucas, 09/11/2026: "deixa o app com tema
  // escuro, que tá refletindo, não claro, seguindo as cores do pedido na mesa".
  var clean = p.get('tema') === 'clean';
  if (clean) {
    var f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(f);
    var st = document.createElement('style');
    st.textContent = ':root{--page:#161826;--pcard:#1c1e2e;--pink:#e9e9ed;--pmu:#9397ab;--pline:#34374a;' +
      '--bg:#1c1e2e;--card:#232532;--ink:#e9e9ed;--mu:#9397ab;--line:#34374a;--ac:#9184d9;--ac2:#b5abfc;' +
      '--acink:#161826;--price:#d2cefd;--rad:14px;--f1:Inter,sans-serif;--f2:Inter,sans-serif;color-scheme:dark}' +
      // tira o brilho neon que alguns modelos desenham fora das variáveis
      '*{text-shadow:none!important}' +
      // o prato branco da capa e o fundo branco atrás de cada prato
      '.cover .plate{background:radial-gradient(circle at 35% 30%,#34374a,#2a2c3f 60%,#232532)!important}' +
      '.art{background:radial-gradient(circle at 35% 28%,#34374a,#2a2c3f 55%,#232532)!important;' +
      'box-shadow:inset 0 -6px 14px #0003,0 10px 20px #0004!important}' +
      // as peças claras pequenas: filtro ativo, selo "Mais pedido", aviso
      '.chip.on,.it .bg{background:#9184d9!important;color:#161826!important;border-color:#9184d9!important}' +
      '.toast{background:#232532!important;color:#e9e9ed!important;border:1px solid #34374a}';
    document.head.appendChild(st);
  }

  // ?embed=1 — dentro de previa/restaurante.html: a página de fora cuida das
  // abas, das setas e do "ver um pedido completo". Some o cabeçalho da demo
  // (título, idiomas, links ↗) e a barra de abas de baixo. O #da-btn continua
  // existindo (escondido) para a página de fora clicar.
  var embed = p.get('embed') === '1';
  if (embed) {
    var em = document.createElement('style');
    em.textContent = '.demo{display:none!important}' +
      // fora da vista, mas existindo: o "pedido completo" troca de tela clicando nela
      '#mt{position:fixed!important;left:-9999px!important;top:0!important;bottom:auto!important}' +
      '.stage{padding-top:6px!important;padding-bottom:16px!important}' +
      'body{background:transparent!important}' +
      (mesa !== null ? '#col-motoboy{display:none!important}' +
        '@media(min-width:1201px){.stage{grid-template-columns:372px minmax(0,1fr)!important;max-width:1100px!important}}' : '');
    document.head.appendChild(em);
  }

  window.LHP = function (CFG) {
    if (clean) {
      CFG.accent = '#9184d9';
      CFG.mapBg = '#232532';
      CFG.road = '#34374a';
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
        // O "Grátis · Entrega" do cartão da loja: na mesa não há entrega.
        el.querySelectorAll('.meta > div').forEach(function (d) {
          if (/entrega/i.test(d.textContent)) d.style.display = 'none';
        });
        // A linha "Entrega · Grátis" do resumo e da sacola.
        el.querySelectorAll('.sum > div').forEach(function (d) {
          var s = d.querySelector('span');
          if (s && s.textContent.trim() === 'Entrega') d.style.display = 'none';
        });
        return r;
      };
      // Na cozinha, o pedido pronto da mesa é servido, não sai com motoboy.
      var TROCA_COZ = [[/🛵\s*Saiu p\/ entrega/g, '🍽 Servido na mesa'], [/Saiu p\/ entrega/g, 'Servido na mesa'], [/🛵\s*$/g, '🍽 '], [/^Em rota$/g, 'Servidos'],
                       [/Chamar motoboy/g, 'Servir na mesa']];
      var desenharCoz = cozinha;
      cozinha = function () {
        var r = desenharCoz.apply(this, arguments), el = document.getElementById('cozinha');
        if (!el) return r;
        var it = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
        while ((n = it.nextNode())) {
          var t = n.nodeValue, t0 = t;
          TROCA_COZ.forEach(function (x) { t = t.replace(x[0], x[1]); });
          if (t !== t0) n.nodeValue = t;
        }
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
