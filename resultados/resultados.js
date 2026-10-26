/* Desenha a página de resultados a partir de window.RESULTADOS (arquivo dados.js da pasta do cliente).
   Quem edita o conteúdo mexe só no dados.js. Este arquivo só muda se a página ganhar um recurso novo. */
(function () {
  var D = window.RESULTADOS, raiz = document.getElementById('r-raiz');
  if (!raiz) return;
  if (!D) { raiz.innerHTML = '<div class="r-col r-vazio"><p>Não encontramos os dados desta página. Confira se o arquivo dados.js está na mesma pasta.</p></div>'; return; }

  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NF = new Intl.NumberFormat('pt-BR'), NF2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cor(c) { return /^#[0-9a-f]{3,8}$/i.test(c || '') ? c : ''; }

  /* "12480" vira "12.480"; formato: numero (padrão), moeda, percentual ou texto */
  function fmt(v, f) {
    if (f === 'texto' || typeof v === 'string') return esc(v);
    if (f === 'moeda') return 'R$ ' + (v % 1 ? NF2.format(v) : NF.format(v));
    if (f === 'percentual') return NF.format(v) + '%';
    return NF.format(v);
  }

  /* o que mudou em relação ao período anterior; menorMelhor serve para custos (quanto menos, melhor) */
  function variacao(v, menorMelhor, comparado) {
    if (v == null || v === '') return '';
    var n = Number(v), cls, seta, txt;
    if (!n) { cls = 'igual'; seta = '='; txt = 'igual ao mês passado'; }
    else {
      var bom = menorMelhor ? n < 0 : n > 0;
      cls = bom ? 'bom' : 'atencao'; seta = n > 0 ? '↑' : '↓';
      txt = Math.abs(n) + '% ' + (n > 0 ? 'a mais' : 'a menos') + (comparado ? ' que ' + comparado : '');
    }
    return '<span class="r-var ' + cls + '" title="' + esc(txt) + '"><span aria-hidden="true">' + seta + '</span> ' + (n ? Math.abs(n) + '%' : 'igual') + '<span class="r-ocupa">' + esc(txt) + '</span></span>';
  }

  /* curva suave (Catmull-Rom convertida em Bézier) passando por todos os pontos */
  function curva(p) {
    var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += ' C' + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + ' ' + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + ' ' + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + ' ' + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + ' ' + c[0].toFixed(1) + ' ' + c[1].toFixed(1);
    }
    return d;
  }
  function pontos(serie, w, h, pad) {
    var vs = serie.map(function (s) { return typeof s === 'object' ? s.v : s; }), mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), fa = mx === mn ? 1 : mx - mn;
    return vs.map(function (v, i) { return [pad + (vs.length === 1 ? (w - 2 * pad) / 2 : i * (w - 2 * pad) / (vs.length - 1)), pad + (h - 2 * pad) * (1 - (v - mn) / fa)]; });
  }
  var uid = 0;

  /* minigráfico de uma linha só, ao lado dos números */
  function spark(serie, c) {
    if (!serie || serie.length < 2) return '';
    var p = pontos(serie, 112, 34, 4), u = p[p.length - 1];
    return '<svg class="r-spark" viewBox="0 0 112 34" role="img" aria-label="Tendência dos últimos meses"><path d="' + curva(p) + '" fill="none" stroke="' + (c || 'var(--lavanda)') + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="' + u[0].toFixed(1) + '" cy="' + u[1].toFixed(1) + '" r="3.8" fill="' + (c || 'var(--lavanda)') + '"/></svg>';
  }

  /* gráfico de área: a curva da abertura e os gráficos de cada canal */
  function area(serie, o) {
    o = o || {}; var W = 1000, H = o.altura || 260, pad = 22, base = H - 34, c = o.cor || 'var(--lavanda)', id = 'g' + (++uid);
    var p = pontos(serie, W, base, pad), u = p[p.length - 1], topo = curva(p);
    var rotulos = serie.map(function (s, i) { return (s && s.r) ? '<text x="' + p[i][0].toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (i === 0 ? 'start' : i === serie.length - 1 ? 'end' : 'middle') + '" font-size="21" fill="#5f628a">' + esc(s.r) + '</text>' : ''; }).join('');
    var ultimo = serie[serie.length - 1], v = typeof ultimo === 'object' ? ultimo.v : ultimo;
    var resumo = serie.map(function (s) { return (s.r || '') + ' ' + fmt(typeof s === 'object' ? s.v : s, o.formato); }).join(', ');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc((o.titulo || 'Evolução') + ': ' + resumo) + '"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '" stop-opacity=".30"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + topo + ' L' + u[0].toFixed(1) + ' ' + base + ' L' + p[0][0].toFixed(1) + ' ' + base + ' Z" fill="url(#' + id + ')"/>' +
      '<path class="r-tr" d="' + topo + '" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" ' + (reduz ? '' : 'stroke-dashoffset="1"') + '/>' +
      p.map(function (q, i) { return i === p.length - 1 ? '' : '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="5" fill="#fff" stroke="' + c + '" stroke-width="3"/>'; }).join('') +
      '<circle cx="' + u[0].toFixed(1) + '" cy="' + u[1].toFixed(1) + '" r="16" fill="' + c + '" fill-opacity=".18"/><circle cx="' + u[0].toFixed(1) + '" cy="' + u[1].toFixed(1) + '" r="8.5" fill="' + c + '" stroke="#fff" stroke-width="3.5"/>' + rotulos + '</svg>';
  }

  /* barras verticais para comparar poucas coisas */
  function barras(dados, o) {
    o = o || {}; var W = 1000, H = 250, base = H - 36, n = dados.length, mx = Math.max.apply(null, dados.map(function (d) { return d.v; })) || 1, gap = 26, lw = (W - gap * (n + 1)) / n, c = o.cor || 'var(--lavanda)';
    var resumo = dados.map(function (d) { return d.r + ' ' + fmt(d.v, o.formato); }).join(', ');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc((o.titulo || 'Comparação') + ': ' + resumo) + '">' + dados.map(function (d, i) {
      var h = Math.max(6, (base - 34) * d.v / mx), x = gap + i * (lw + gap), ult = i === n - 1;
      return '<rect x="' + x.toFixed(1) + '" y="' + (base - h).toFixed(1) + '" width="' + lw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="12" fill="' + c + '" fill-opacity="' + (ult ? 1 : .32) + '"/>' +
        '<text x="' + (x + lw / 2).toFixed(1) + '" y="' + (base - h - 10).toFixed(1) + '" text-anchor="middle" font-size="24" font-weight="700" fill="#1d1f3d">' + fmt(d.v, o.formato) + '</text>' +
        '<text x="' + (x + lw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="21" fill="#5f628a">' + esc(d.r) + '</text>';
    }).join('') + '</svg>';
  }

  /* ---------- montagem da página ---------- */
  var cl = D.cliente || {}, tema = D.tema || {}, h = '';
  if (cor(tema.cor)) document.documentElement.style.setProperty('--lavanda', tema.cor);
  var periodoCurto = D.periodoCurto || D.periodo || '';
  var vazio = function (a) { return !a || !a.length; };

  if (D.modelo) h += '<div class="r-exemplo" role="note">Esta é uma página de exemplo, com números inventados só para mostrar como funciona.</div>';
  h += '<a class="r-ocupa" href="#r-conteudo">Ir para o conteúdo</a>';
  h += '<div class="r-barra"><div class="r-col"><a class="r-marca" href="#topo">' + (cl.logo ? '<img src="' + esc(cl.logo) + '" alt="">' : '') + '<span>' + esc(cl.nome || 'Resultados') + '</span></a><nav class="r-links" aria-label="Seções">' +
    '<a href="#numeros">Resultados</a>' + (vazio(D.canais) ? '' : '<a href="#canais">Canal por canal</a>') + (vazio(D.feito) ? '' : '<a href="#feito">O que fizemos</a>') + (vazio(D.proximos) ? '' : '<a href="#proximos">O que vem agora</a>') + '</nav></div></div>';
  h += '<main id="r-conteudo">';

  /* abertura */
  var dst = D.destaque || {};
  h += '<header class="r-topo" id="topo"><div class="r-col"><p class="r-ola">' + esc(D.saudacao || ('Oi, ' + (cl.nome || ''))) + '. ' + esc(dst.intro || '') + '</p>' +
    '<strong class="r-grande" data-conta="' + esc(dst.valor) + '" data-formato="' + esc(dst.formato || 'numero') + '">' + fmt(dst.valor || 0, dst.formato) + '</strong>' +
    '<p class="r-frase">' + esc(dst.frase || '') + (dst.variacao != null ? ' <span>' + (dst.variacao > 0 ? 'e isso é ' + dst.variacao + '% a mais' : dst.variacao < 0 ? 'e isso é ' + Math.abs(dst.variacao) + '% a menos' : 'igual') + (dst.comparado ? ' que em ' + esc(dst.comparado) : '') + '.</span>' : '') + '</p>' +
    (D.resumo ? '<p class="r-resumo">' + esc(D.resumo) + '</p>' : '') +
    (D.situacao ? '<div class="r-selo ' + (D.situacao.tom === 'atencao' ? 'atencao' : '') + '"><i></i>' + esc(D.situacao.texto) + '</div>' : '') + '</div>' +
    (dst.serie && dst.serie.length > 1 ? '<div class="r-col"><div class="r-curva">' + area(dst.serie, { altura: 280, titulo: dst.frase, formato: dst.formato }) + '</div></div>' : '') + '</header>';

  /* números do mês */
  if (!vazio(D.numeros)) {
    h += '<section class="r-sec" id="numeros"><div class="r-col"><h2>' + esc(D.tituloNumeros || 'O mês em poucos números') + '</h2>' + (D.subNumeros ? '<p class="r-sub">' + esc(D.subNumeros) + '</p>' : '') + '<div class="r-nums">' +
      D.numeros.map(function (n) {
        return '<div class="r-num"><div><h3>' + esc(n.rotulo) + '</h3>' + (n.explicacao ? '<p>' + esc(n.explicacao) + '</p>' : '') + '</div><div class="r-lado"><span class="r-valor">' + fmt(n.valor, n.formato) + '</span>' +
          '<span style="display:flex;align-items:center;gap:12px">' + spark(n.serie, cor(n.cor)) + variacao(n.variacao, n.menorMelhor, D.comparadoCom) + '</span></div></div>';
      }).join('') + '</div></div></section>';
  }

  /* canais (redes sociais, Google Ads, app, site...) */
  if (!vazio(D.canais)) {
    h += '<section class="r-sec" id="canais"><div class="r-col"><h2>' + esc(D.tituloCanais || 'Canal por canal') + '</h2>' + (D.subCanais ? '<p class="r-sub">' + esc(D.subCanais) + '</p>' : '') +
      D.canais.map(function (c) {
        var cc = cor(c.cor), st = cc ? ' style="--cor:' + cc + '"' : '', g = c.grafico, x = '';
        x += '<article class="r-canal"' + st + '><div class="r-canal-topo"><i></i><h3>' + esc(c.titulo) + '</h3></div>' + (c.resumo ? '<p>' + esc(c.resumo) + '</p>' : '');
        if (!vazio(c.metricas)) x += '<div class="r-mets">' + c.metricas.map(function (m) { return '<div class="r-met"><b>' + fmt(m.valor, m.formato) + '</b><span>' + esc(m.rotulo) + '</span>' + variacao(m.variacao, m.menorMelhor, D.comparadoCom) + '</div>'; }).join('') + '</div>';
        if (g && !vazio(g.dados)) x += '<div class="r-graf"><h4>' + esc(g.titulo || '') + '</h4>' + (g.tipo === 'barras' ? barras(g.dados, { cor: cc, formato: g.formato, titulo: g.titulo }) : area(g.dados, { cor: cc, altura: 230, formato: g.formato, titulo: g.titulo })) + '</div>';
        if (c.ranking && !vazio(c.ranking.itens)) {
          var mxr = Math.max.apply(null, c.ranking.itens.map(function (i) { return i.valor; })) || 1;
          x += '<div class="r-rank"><h4>' + esc(c.ranking.titulo || '') + '</h4><ol>' + c.ranking.itens.map(function (i) { return '<li><span>' + esc(i.nome) + '</span><b>' + fmt(i.valor, c.ranking.formato) + '</b><i style="--w:' + Math.round(i.valor / mxr * 100) + '%"></i></li>'; }).join('') + '</ol></div>';
        }
        if (c.significa) x += '<div class="r-significa"><b>' + esc(c.significaTitulo || 'O que isso significa para você') + '</b><p>' + esc(c.significa) + '</p></div>';
        return x + '</article>';
      }).join('') + '</div></section>';
  }

  /* o que já fizemos */
  if (!vazio(D.feito)) {
    h += '<section class="r-sec" id="feito"><div class="r-col"><h2>' + esc(D.tituloFeito || 'O que já fizemos juntos') + '</h2>' + (D.subFeito ? '<p class="r-sub">' + esc(D.subFeito) + '</p>' : '') + '<ol class="r-linha">' +
      D.feito.map(function (f) { return '<li class="r-feito">' + (f.data ? '<time>' + esc(f.data) + '</time>' : '') + '<h3>' + esc(f.titulo) + '</h3>' + (f.detalhe ? '<p>' + esc(f.detalhe) + '</p>' : '') + '</li>'; }).join('') + '</ol></div></section>';
  }

  /* o que vem agora (inclui o que precisamos do cliente) */
  if (!vazio(D.proximos)) {
    var ROT = { andamento: 'Em andamento', proximo: 'Próximo passo', precisamos: 'Precisamos de você' };
    h += '<section class="r-sec" id="proximos"><div class="r-col"><h2>' + esc(D.tituloProximos || 'O que vem agora') + '</h2>' + (D.subProximos ? '<p class="r-sub">' + esc(D.subProximos) + '</p>' : '') + '<div class="r-prox">' +
      D.proximos.map(function (p) {
        var s = ROT[p.status] ? p.status : 'proximo';
        return '<div class="r-item ' + s + '"><div class="r-item-topo"><span class="r-etiqueta ' + s + '">' + ROT[s] + '</span><h3>' + esc(p.titulo) + '</h3>' + (p.quando ? '<span class="r-quando">' + esc(p.quando) + '</span>' : '') + '</div>' +
          (p.detalhe ? '<p>' + esc(p.detalhe) + '</p>' : '') + (s === 'andamento' && p.progresso != null ? '<div class="r-barra-prog" style="--p:' + Math.max(4, Math.min(100, +p.progresso)) + '%" role="img" aria-label="' + (+p.progresso) + '% concluído"></div>' : '') + '</div>';
      }).join('') + '</div></div></section>';
  }
  h += '</main>';

  /* recado e contato */
  var rc = D.recado || {}, ct = D.contato || {};
  h += '<footer><div class="r-recado"><div class="r-col">' + (rc.texto ? '<q>' + esc(rc.texto) + '</q><cite>' + esc(rc.assinatura || '') + '</cite>' : '') +
    (ct.whatsapp ? '<a class="r-botao" href="https://wa.me/' + esc(ct.whatsapp) + '?text=' + encodeURIComponent(ct.mensagem || 'Oi! Vi o relatório e quero conversar.') + '" target="_blank" rel="noopener">' + esc(ct.botao || 'Falar com a Lhart no WhatsApp') + '</a>' : '') + '</div></div>' +
    '<div class="r-rodape"><div class="r-col"><span>Lhart Design</span><span>' + esc(D.periodo || '') + (D.atualizado ? ' · atualizado em ' + esc(D.atualizado) : '') + '</span></div></div></footer>';

  raiz.innerHTML = h;
  document.title = (cl.nome ? cl.nome + ': ' : '') + 'resultados' + (periodoCurto ? ' de ' + periodoCurto : '') + ' | Lhart Design';

  /* movimento: a curva se desenha e o número grande sobe uma vez; tudo fica no lugar se a pessoa prefere menos movimento */
  if (reduz) return;
  var tr = raiz.querySelector('.r-curva .r-tr'), n = raiz.querySelector('.r-grande');
  if (tr) { tr.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.3,.7,.2,1) .15s'; requestAnimationFrame(function () { requestAnimationFrame(function () { tr.style.strokeDashoffset = '0'; }); }); }
  raiz.querySelectorAll('.r-canal .r-tr').forEach(function (t) { t.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.3,.7,.2,1)'; new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { t.style.strokeDashoffset = '0'; ob.disconnect(); } }, { threshold: .3 }).observe(t); });
  if (n && +n.dataset.conta > 0 && !document.hidden) {
    var alvo = +n.dataset.conta, f = n.dataset.formato, ini = performance.now(), dur = 1400;
    (function passo(t) { var k = Math.min(1, (t - ini) / dur), e = 1 - Math.pow(1 - k, 3); n.textContent = fmt(Math.round(alvo * e), f); if (k < 1) requestAnimationFrame(passo); else n.textContent = fmt(alvo, f); })(ini);
    setTimeout(function () { n.textContent = fmt(alvo, f); }, dur + 400);  // garante o número final mesmo se a aba estiver em segundo plano
  }
})();
