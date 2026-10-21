/* "Como o cliente pede" (página Delivery): um celular que percorre o pedido (mesa, balcão ou delivery) e os motivos que fazem o cliente pedir mais.
   Tudo é desenhado aqui, sem iframes (leve no celular). Os textos têm PT, EN e ES e seguem o idioma do site (LH.lang). */
(function () {
  var host = document.getElementById('fxroot');
  if (!host) return;
  var WA = '5511989304239';
  var S = {
    eyebrow: ['Como o cliente pede', 'How customers order', 'Cómo pide el cliente'],
    h2: ['Do toque no celular <em>ao pedido na cozinha</em>', 'From a phone tap <em>to the kitchen ticket</em>', 'Del toque en el celular <em>al pedido en la cocina</em>'],
    sub: ['Escolha por onde o cliente chega e veja o pedido andar. Sem baixar app, sem esperar o garçom e já pago no Pix.',
      'Pick how the customer arrives and watch the order move. No app to download, no waiting for a waiter, already paid by Pix.',
      'Elige por dónde llega el cliente y mira cómo avanza el pedido. Sin descargar app, sin esperar al mesero y ya pagado por Pix.'],
    m_mesa: ['🪑 Na mesa', '🪑 At the table', '🪑 En la mesa'], m_balcao: ['🏪 No balcão', '🏪 At the counter', '🏪 En el mostrador'], m_delivery: ['🛵 Delivery', '🛵 Delivery', '🛵 Delivery'],
    p1t_mesa: ['Encosta o celular na mesa', 'Tap the phone on the table', 'Acerca el celular a la mesa'],
    p1d_mesa: ['Um adesivo NFC, com QR Code ao lado, abre o cardápio da mesa. Sem app e sem esperar o garçom.', 'An NFC sticker, with a QR Code beside it, opens the table’s menu. No app, no waiting for the waiter.', 'Un sticker NFC, con QR al lado, abre el menú de la mesa. Sin app y sin esperar al mesero.'],
    p1t_balcao: ['Aponta a câmera para o QR do balcão', 'Points the camera at the counter QR', 'Apunta la cámara al QR del mostrador'],
    p1d_balcao: ['O QR fica no balcão, no caixa ou no totem. O cliente pede e paga sem entrar na fila.', 'The QR sits on the counter, at the register or on a stand. Customers order and pay without queuing.', 'El QR está en el mostrador, la caja o un tótem. El cliente pide y paga sin hacer fila.'],
    p1t_delivery: ['Toca no link do Instagram ou do WhatsApp', 'Taps the Instagram or WhatsApp link', 'Toca el link de Instagram o WhatsApp'],
    p1d_delivery: ['O link fica na bio, no Google e nas conversas. Abre direto o seu cardápio, sem marketplace no meio.', 'The link lives in your bio, on Google and in chats. It opens your menu directly, with no marketplace in between.', 'El link está en tu bio, en Google y en los chats. Abre tu menú directo, sin marketplace en el medio.'],
    p2t: ['O cardápio chama atenção', 'The menu grabs attention', 'El menú llama la atención'],
    p2d: ['Fotos, selo de mais pedido e o botão “Monte ao seu gosto” em destaque.', 'Photos, a best-seller badge and a highlighted “Build it your way” button.', 'Fotos, sello de más pedido y el botón “Arma a tu gusto” destacado.'],
    p3t: ['O cliente monta o lanche e vê o preço subir', 'The customer builds the burger and watches the price climb', 'El cliente arma la hamburguesa y ve subir el precio'],
    p3d: ['O lanche se forma na tela, camada por camada. É isso que leva o cliente a pôr mais um ingrediente.', 'The burger forms on screen, layer by layer. That is what gets customers to add one more ingredient.', 'La hamburguesa se forma en la pantalla, capa por capa. Eso hace que el cliente agregue un ingrediente más.'],
    p4t: ['Paga no Pix sem sair do app', 'Pays by Pix without leaving the app', 'Paga por Pix sin salir de la app'],
    p4d: ['QR Code e copia e cola. O banco avisa na hora e o pedido só entra na fila depois de pago.', 'QR Code and copy-and-paste code. The bank confirms instantly and the order only joins the queue once paid.', 'QR y copia y pega. El banco avisa al instante y el pedido solo entra en la cola cuando está pagado.'],
    p5t_mesa: ['A cozinha recebe e leva até a mesa 7', 'The kitchen gets it and brings it to table 7', 'La cocina lo recibe y lo lleva a la mesa 7'],
    p5d_mesa: ['O pedido cai na tela da cozinha com o número da mesa. Ficou pronto, o cliente é avisado.', 'The order lands on the kitchen screen with the table number. When it is ready, the customer is told.', 'El pedido llega a la pantalla de la cocina con el número de mesa. Cuando está listo, se avisa al cliente.'],
    p5t_balcao: ['A cozinha chama a senha 42', 'The kitchen calls ticket 42', 'La cocina llama al turno 42'],
    p5d_balcao: ['O cliente acompanha o status no celular e retira quando a senha for chamada.', 'The customer follows the status on the phone and picks up when the ticket is called.', 'El cliente sigue el estado en el celular y retira cuando llaman su turno.'],
    p5t_delivery: ['O motoboy sai e o cliente acompanha no mapa', 'The courier leaves and the customer follows on the map', 'El motoboy sale y el cliente lo sigue en el mapa'],
    p5d_delivery: ['Tempo de chegada, aviso de “chegando” e código de entrega. Acaba o “cadê meu pedido?”.', 'Arrival time, an “arriving” alert and a delivery code. The “where is my order?” calls stop.', 'Tiempo de llegada, aviso de “llegando” y código de entrega. Se acabó el “¿dónde está mi pedido?”.'],
    b1: ['Sem atrito', 'No friction', 'Sin fricción'], b2: ['Mais pedidos', 'More orders', 'Más pedidos'], b3: ['Ticket maior', 'Bigger ticket', 'Ticket mayor'], b4: ['Sem calote', 'No unpaid orders', 'Sin impagos'], b5: ['Cozinha organizada', 'Organized kitchen', 'Cocina organizada'],
    n_titulo_mesa: ['Abrir cardápio', 'Open menu', 'Abrir menú'], n_sub_mesa: ['Mesa 7 · Brasa & Ponto', 'Table 7 · Brasa & Ponto', 'Mesa 7 · Brasa & Ponto'],
    n_titulo_balcao: ['Abrir cardápio', 'Open menu', 'Abrir menú'], n_sub_balcao: ['Balcão · Brasa & Ponto', 'Counter · Brasa & Ponto', 'Mostrador · Brasa & Ponto'],
    n_titulo_delivery: ['Pedir agora', 'Order now', 'Pedir ahora'], n_sub_delivery: ['Brasa & Ponto · cardápio online', 'Brasa & Ponto · online menu', 'Brasa & Ponto · menú online'],
    loc_mesa: ['Mesa 7', 'Table 7', 'Mesa 7'], loc_balcao: ['Balcão', 'Counter', 'Mostrador'], loc_delivery: ['Entrega', 'Delivery', 'Entrega'],
    c2_tag: ['✨ Monte ao seu gosto', '✨ Build it your way', '✨ Arma a tu gusto'], c2_desc: ['Pão brioche, burger 160 g', 'Brioche bun, 160 g patty', 'Pan brioche, carne 160 g'],
    f_cheddar: ['Cheddar', 'Cheddar', 'Cheddar'], f_bacon: ['Bacon', 'Bacon', 'Bacon'], f_ovo: ['Ovo', 'Egg', 'Huevo'], add: ['Adicionar', 'Add', 'Agregar'],
    pix_exp: ['Confirmação automática pelo banco', 'Automatic bank confirmation', 'Confirmación automática del banco'], pix_t: ['Pague com Pix', 'Pay with Pix', 'Paga con Pix'], pix_copia: ['Copiar código', 'Copy code', 'Copiar código'], pix_ok: ['Pix recebido', 'Pix received', 'Pix recibido'],
    tk_novo: ['Pedido novo', 'New order', 'Pedido nuevo'], tk_pago: ['PAGO', 'PAID', 'PAGADO'], tk_loc_balcao: ['Senha 42', 'Ticket 42', 'Turno 42'],
    st1: ['Recebido', 'Received', 'Recibido'], st2: ['Preparando', 'Preparing', 'Preparando'], st3: ['Pronto', 'Ready', 'Listo'],
    av_mesa: ['🔔 Cliente avisado: o pedido está pronto', '🔔 Customer notified: the order is ready', '🔔 Cliente avisado: el pedido está listo'],
    av_balcao: ['🔔 Senha 42 chamada no painel', '🔔 Ticket 42 called on the screen', '🔔 Turno 42 llamado en la pantalla'],
    av_delivery: ['🛵 Motoboy a caminho · chega em 12 min', '🛵 Courier on the way · arrives in 12 min', '🛵 Motoboy en camino · llega en 12 min'],
    nfc_t: ['Encostou, abriu.', 'Tap and it opens.', 'Lo acercas y se abre.'],
    nfc_d: ['O mesmo adesivo leva NFC e QR Code. O cliente usa o que for mais fácil.', 'The same sticker carries NFC and a QR Code. Customers use whichever is easier.', 'El mismo sticker lleva NFC y QR. El cliente usa el que le resulte más fácil.'],
    nfc_1: ['Cada mesa tem o seu link, e o pedido já chega com o número da mesa.', 'Every table has its own link, and the order arrives with the table number.', 'Cada mesa tiene su link y el pedido llega con el número de mesa.'],
    nfc_2: ['Funciona na maioria dos celulares atuais. Quem não tem NFC lê o QR Code.', 'Works on most current phones. Those without NFC scan the QR Code.', 'Funciona en la mayoría de los celulares actuales. Quien no tiene NFC lee el QR.'],
    nfc_3: ['Você recebe o link de cada mesa pronto para gravar no adesivo.', 'You get each table’s link ready to write onto the sticker.', 'Recibes el link de cada mesa listo para grabar en el sticker.'],
    nfc_placa: ['Encoste aqui', 'Tap here', 'Acerca aquí'],
    g_t: ['O que faz o cliente pedir mais', 'What makes customers order more', 'Lo que hace que el cliente pida más'],
    g1: ['Monta o prato', 'Builds the dish', 'Arma el plato'], g1d: ['Ver o lanche se formar convida a pôr mais um ingrediente. O ticket sobe sem você pedir.', 'Watching the burger form invites one more ingredient. The ticket grows without you asking.', 'Ver cómo se forma la hamburguesa invita a agregar un ingrediente. El ticket sube sin que lo pidas.'],
    g2: ['Pix na hora', 'Instant Pix', 'Pix al instante'], g2d: ['O pedido só entra pago. Sem comprovante no WhatsApp e sem calote.', 'The order only comes in paid. No receipts on WhatsApp, no unpaid orders.', 'El pedido solo entra pagado. Sin comprobantes por WhatsApp y sin impagos.'],
    g3: ['Mesa sem esperar', 'No waiting at the table', 'Mesa sin esperar'], g3d: ['O cliente pede e paga sozinho. O garçom só serve.', 'Customers order and pay on their own. The waiter only serves.', 'El cliente pide y paga solo. El mesero solo sirve.'],
    g4: ['Motoboy no mapa', 'Courier on the map', 'Motoboy en el mapa'], g4d: ['O cliente acompanha a entrega e para de ligar para perguntar.', 'Customers follow the delivery and stop calling to ask.', 'El cliente sigue la entrega y deja de llamar para preguntar.'],
    g5: ['Sem comissão por pedido', 'No commission per order', 'Sin comisión por pedido'], g5d: ['É o seu canal. A margem fica com você, e o contato de quem pediu também.', 'It is your channel. The margin stays with you, and so does the contact of who ordered.', 'Es tu canal. El margen se queda contigo y también el contacto de quien pidió.'],
    g6: ['Com a cara do seu restaurante', 'Looks like your restaurant', 'Con la cara de tu restaurante'], g6d: ['6 estilos de app, com a sua marca, as suas cores e o seu cardápio.', '6 app styles, with your brand, colors and menu.', '6 estilos de app, con tu marca, tus colores y tu menú.'],
    cta1: ['Quero isso no meu restaurante', 'I want this for my restaurant', 'Quiero esto en mi restaurante'], cta2: ['Ver o app funcionando', 'See the app running', 'Ver la app funcionando'], cta3: ['Ver a demo da mesa', 'See the table demo', 'Ver la demo de la mesa'],
    wa: ['Oi! Vi o fluxo do cliente (mesa, balcão e delivery) na página Delivery e quero isso no meu restaurante.', 'Hi! I saw the customer flow (table, counter and delivery) on the Delivery page and I want this for my restaurant.', 'Hola. Vi el flujo del cliente (mesa, mostrador y delivery) en la página Delivery y quiero esto en mi restaurante.']
  };
  S.tk_loc_mesa = S.loc_mesa; S.tk_loc_delivery = S.loc_delivery;
  var modo = 'mesa', passo = 0, timer = null, pausaAte = 0, burger = null, tFichas = [];
  var N = 5;
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lang() { var l = window.LH && LH.lang; return l === 'en' ? 1 : l === 'es' ? 2 : 0; }
  function tx(k) { var v = S[k + '_' + modo] || S[k]; return v ? v[lang()] : k; }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function t(tag, cls, k) { var n = el(tag, cls); n.setAttribute('data-k', k); return n; }

  function qrHtml() {
    var n = 21, h = '', seed = 7;
    function achador(x, y) { var d = Math.max(Math.abs(x - 3), Math.abs(y - 3)); return d === 3 || d <= 1; }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var escuro, a = x < 7 && y < 7, b = x > n - 8 && y < 7, c = x < 7 && y > n - 8;
      if (a) escuro = achador(x, y); else if (b) escuro = achador(x - (n - 7), y); else if (c) escuro = achador(x, y - (n - 7));
      else { seed = (seed * 1103515245 + 12345) & 0x7fffffff; escuro = (seed >> 16) % 5 < 2; }
      h += '<i' + (escuro ? '' : ' class="z"') + '></i>';
    }
    return h;
  }

  function monta() {
    host.textContent = '';
    var base = el('div');
    base.append(t('span', 'eyebrow', 'eyebrow'), t('h2', null, 'h2'), t('p', 's', 'sub'));
    var modos = el('div', 'fx-modos'); modos.setAttribute('role', 'tablist');
    ['mesa', 'balcao', 'delivery'].forEach(function (m) {
      var b = t('button', m === modo ? 'on' : '', 'm_' + m); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', m === modo ? 'true' : 'false');
      b.addEventListener('click', function () { if (modo === m) return; modo = m; pausa(); monta(); vai(0, true); });
      modos.append(b);
    });
    base.append(modos);

    var grid = el('div', 'fx-grid'), fone = el('div', 'fx-fone'), tel = el('div', 'fx-tel');
    tel.setAttribute('role', 'img'); tel.setAttribute('aria-label', 'Simulação do app do cliente');
    // 1: toque
    var c1 = el('div', 'fx-cena fx-c1');
    c1.innerHTML = '<div class="fx-hora">9:41<small>' + { mesa: '🪑', balcao: '🏪', delivery: '📱' }[modo] + '</small></div>' +
      '<div class="fx-onda"><i></i><i></i><i></i><b>' + { mesa: '📲', balcao: '📷', delivery: '🔗' }[modo] + '</b></div>' +
      '<div class="fx-notif"><i>🍔</i><div><b data-k="n_titulo"></b><small data-k="n_sub"></small></div></div>';
    // 2: cardápio
    var c2 = el('div', 'fx-cena fx-c2');
    c2.innerHTML = '<div class="fx-topo"><h4>Brasa &amp; Ponto</h4><span data-k="loc"></span></div>' +
      '<div class="fx-item d"><div><span class="tg" data-k="c2_tag"></span><b>Brasa Burger</b><small data-k="c2_desc"></small><em>R$ 29,90</em></div><div class="ft">🍔</div></div>' +
      '<div class="fx-item"><div><b>Smash Duplo</b><small>Cheddar, picles e molho da casa</small><em>R$ 34,90</em></div><div class="ft">🧀</div></div>' +
      '<div class="fx-item"><div><b>Batata rústica</b><small>Páprica e alecrim</small><em>R$ 16,90</em></div><div class="ft">🍟</div></div>';
    // 3: monta
    var c3 = el('div', 'fx-cena fx-c3');
    c3.innerHTML = '<h4>Brasa Burger</h4><div class="fx-burger"></div><div class="fx-fichas"><span data-f="queijo"><i>🧀</i><b data-k="f_cheddar"></b></span><span data-f="bacon"><i>🥓</i><b data-k="f_bacon"></b></span><span data-f="ovo"><i>🍳</i><b data-k="f_ovo"></b></span></div>' +
      '<div class="fx-total"><span data-k="add"></span><strong>R$ 29,90</strong></div>';
    // 4: pix
    var c4 = el('div', 'fx-cena fx-c4');
    c4.innerHTML = '<h4 data-k="pix_t"></h4><div class="fx-val">R$ 41,90</div><div class="fx-qr">' + qrHtml() + '</div><div class="fx-copia" data-k="pix_copia"></div><small class="fx-exp" data-k="pix_exp"></small>' +
      '<div class="fx-ok"><b>✓</b><span data-k="pix_ok"></span></div>';
    // 5: cozinha
    var c5 = el('div', 'fx-cena fx-c5');
    c5.innerHTML = '<div class="fx-tk"><div class="h"><span data-k="tk_pago"></span><b>#4821 · <span data-k="tk_loc" style="all:unset"></span></b></div><p>1× Brasa Burger<br>+ Cheddar, Bacon, Ovo</p></div>' +
      '<div class="fx-pas"><div data-k="st1"></div><div data-k="st2"></div><div data-k="st3"></div></div><div class="fx-aviso" data-k="av"></div>';
    [c1, c2, c3, c4, c5].forEach(function (c) { tel.append(c); });
    var pontos = el('div', 'fx-dots'); for (var i = 0; i < N; i++) pontos.append(el('i'));
    fone.append(tel, pontos);

    var lado = el('div'), ol = el('ol', 'fx-passos');
    for (var p = 1; p <= N; p++) {
      var li = el('li'), b = el('button', 'fx-passo'); b.type = 'button'; b.dataset.p = p - 1;
      b.append(t('span', 't', 'p' + p + 't'), t('span', 'd', 'p' + p + 'd'), t('span', 'b', 'b' + p));
      b.addEventListener('click', function (e) { pausa(); vai(+e.currentTarget.dataset.p, true); });
      li.append(b); ol.append(li);
    }
    var cta = el('div', 'fx-cta'), zap = t('a', 'btn', 'cta1'); zap.id = 'fxzap'; zap.target = '_blank'; zap.rel = 'noopener';
    var demo = t('a', 'btn g', modo === 'mesa' ? 'cta3' : 'cta2'); demo.href = modo === 'mesa' ? 'mesa.html' : 'demos/delivery-burger-neon.html';
    cta.append(zap, demo); lado.append(ol, cta);
    grid.append(fone, lado); base.append(grid);

    // NFC
    var nfc = el('div', 'fx-nfc');
    var txt = el('div'); txt.append(t('h3', null, 'nfc_t'), t('p', null, 'nfc_d'));
    var ul = el('ul'); ['nfc_1', 'nfc_2', 'nfc_3'].forEach(function (k) { ul.append(t('li', null, k)); }); txt.append(ul);
    var toque = el('div', 'fx-toque');
    toque.innerHTML = '<div class="fx-placa"><small data-k="nfc_placa"></small><b data-k="loc"></b><div class="sel"><div class="nf">NFC</div><div class="qr"></div></div></div><span class="ring"></span><span class="ring"></span><div class="fx-mao"></div>';
    nfc.append(txt, toque); base.append(nfc);

    // ganhos
    var g = el('div', 'fx-ganhos'); g.append(t('h3', null, 'g_t'));
    var gl = el('ul'), ic = ['🍔', '⚡', '🪑', '🛵', '💸', '🎨'];
    ic.forEach(function (e, i) { var li = el('li'); li.append(el('i', null, e)); var d = el('div'); d.append(t('b', null, 'g' + (i + 1)), t('span', null, 'g' + (i + 1) + 'd')); li.append(d); gl.append(li); });
    g.append(gl); base.append(g);
    host.append(base);
    textos();
    burger = null;
  }

  function textos() {
    host.querySelectorAll('[data-k]').forEach(function (n) { var k = n.getAttribute('data-k'); if (k === 'h2') n.innerHTML = tx('h2'); else n.textContent = tx(k); });
    var z = document.getElementById('fxzap'); if (z) z.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(tx('wa'));
  }

  function limpaFichas() { tFichas.forEach(clearTimeout); tFichas = []; }

  function vai(n, manual) {
    passo = n; limpaFichas();
    var cenas = host.querySelectorAll('.fx-cena'), passos = host.querySelectorAll('.fx-passo'), pontos = host.querySelectorAll('.fx-dots i');
    var antes = host.querySelector('.fx-cena.on');
    cenas.forEach(function (c, i) {
      if (i === n) { c.classList.remove('sai'); c.classList.add('on'); }
      else if (c === antes) { c.classList.remove('on'); c.classList.add('sai'); setTimeout(function () { c.classList.remove('sai'); }, 650); }
      else c.classList.remove('on');
    });
    passos.forEach(function (b, i) { b.classList.toggle('on', i === n); b.setAttribute('aria-current', i === n ? 'step' : 'false'); });
    pontos.forEach(function (d, i) { d.classList.toggle('on', i === n); });
    var c4 = host.querySelector('.fx-c4'); if (c4) { c4.classList.remove('pago'); if (n === 3) tFichas.push(setTimeout(function () { c4.classList.add('pago'); }, reduz ? 100 : 1900)); }
    if (n === 2) montaLanche();
  }

  /* cena 3: o lanche usa os mesmos desenhos do app (desenho.js) e as fichas ligam uma a uma */
  function montaLanche() {
    var L = window.LHD, area = host.querySelector('.fx-burger'), fichas = host.querySelectorAll('.fx-fichas span'), total = host.querySelector('.fx-total strong');
    fichas.forEach(function (f) { f.classList.remove('on'); }); total.textContent = 'R$ 29,90';
    if (!L || !area) return;
    area.textContent = ''; burger = L.lancheViva(); area.append(burger.el);
    burger.set(L.empilha(['pao', 'carne', 'topo'], []));
    var ordem = [['queijo', 4, 700], ['bacon', 5, 1700], ['ovo', 3, 2700]], marcados = [], soma = 29.9;
    ordem.forEach(function (o, i) {
      tFichas.push(setTimeout(function () {
        marcados.push(o[0]); soma += o[1];
        fichas[i].classList.add('on'); total.textContent = 'R$ ' + soma.toFixed(2).replace('.', ',');
        burger.set(L.empilha(['pao', 'carne', 'topo'], marcados));
      }, reduz ? 100 : o[2]));
    });
  }

  /* o celular está na tela? (a seção inteira é mais alta que o celular do cliente, então não dá para medir a seção) */
  function naTela() { var f = host.querySelector('.fx-tel'); if (!f) return false; var r = f.getBoundingClientRect(); return r.bottom > 80 && r.top < (window.innerHeight || 700) - 80; }
  function pausa() { pausaAte = Date.now() + 14000; }
  function roda() {
    clearInterval(timer);
    if (reduz) return;
    timer = setInterval(function () { if (naTela() && Date.now() > pausaAte) vai((passo + 1) % N); }, 5200);
  }

  monta(); vai(0);
  roda();
  if (window.LH && LH.on) LH.on(function () { textos(); });
})();
