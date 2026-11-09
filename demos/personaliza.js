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

  window.LHP = function (CFG) {
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
      // Os pedidos de exemplo da cozinha também vêm de mesas, não de endereços.
      if (!S.mesaPronto) {
        S.orders.forEach(function (o, i) { o.cust = 'Mesa ' + (i + 2); o.addr = 'No salão'; o.fee = 0; });
        S.mesaPronto = 1;
        original();
      }
    } catch (e) { /* a demo segue como delivery */ }
  };
})();
