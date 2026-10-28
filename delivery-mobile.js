/* Delivery no celular (até 820 px): reordena a página (o que vende vem primeiro) e fecha as seções longas com "Ver mais". */
(function () {
  if (!window.matchMedia || !matchMedia('(max-width:1024px)').matches) return;
  var TXT = { mais: ['Ver mais', 'Show more', 'Ver más'], menos: ['Ver menos', 'Show less', 'Ver menos'] };
  function idioma() { var l = window.LH && LH.lang; return l === 'en' ? 1 : l === 'es' ? 2 : 0; }

  function roda() {
    var esc = document.getElementById('escolha'), trust = document.querySelector('.trust'), fx = document.getElementById('fluxo'), mt = document.getElementById('monte');
    // 1) o título e o passo a passo vêm antes; a escolha de pacote desce para depois do topo
    if (esc && trust) trust.after(esc);
    if (fx && mt) mt.before(fx);

    // 2) seções longas: título e primeira frase ficam; o resto abre com "Ver mais"
    var botoes = [], caixas = [];
    document.querySelectorAll('.sec').forEach(function (sec) {
      if (sec.id === 'monte' || sec.id === 'fluxo') return;
      var wrap = sec.querySelector('.wrap'); if (!wrap) return;
      var resto = [].slice.call(wrap.children).filter(function (k) { return !k.matches('.eyebrow,h2,.s'); });
      if (!resto.length) return;
      var caixa = document.createElement('div'); caixa.className = 'mx-box';
      resto.forEach(function (k) { caixa.appendChild(k); });
      wrap.appendChild(caixa);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mx-mais'; b.setAttribute('aria-expanded', 'false');
      function rotulo() { b.textContent = TXT[caixa.classList.contains('open') ? 'menos' : 'mais'][idioma()]; }
      b.addEventListener('click', function () {
        var abre = !caixa.classList.contains('open');
        caixa.classList.toggle('open', abre); b.setAttribute('aria-expanded', abre ? 'true' : 'false'); rotulo();
        if (!abre) sec.scrollIntoView({ block: 'start' });
      });
      rotulo(); wrap.appendChild(b); botoes.push(rotulo);
      caixas.push({ caixa: caixa, botao: b });
    });
    if (window.LH && LH.on) LH.on(function () { botoes.forEach(function (f) { f(); }); });

    // 3) o "Ver mais" só aparece nas seções que, mesmo com os cartões compactos, ainda ficam enormes
    function avalia() {
      caixas.forEach(function (c) {
        var aberta = c.caixa.classList.contains('open');
        c.caixa.classList.remove('limite');
        var longa = c.caixa.scrollHeight > 1250;
        c.botao.hidden = !longa;
        if (longa && !aberta) c.caixa.classList.add('limite');
      });
    }
    avalia(); setTimeout(avalia, 600); setTimeout(avalia, 2000);
    window.addEventListener('load', avalia); window.addEventListener('resize', avalia);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(avalia);

    // 4) perguntas frequentes: abrem ao tocar (só no celular estreito)
    var estreito = matchMedia('(max-width:560px)');
    document.querySelectorAll('.faq .q').forEach(function (q) {
      q.tabIndex = 0; q.setAttribute('role', 'button'); q.setAttribute('aria-expanded', 'false');
      function alterna() { if (!estreito.matches) return; var ab = q.classList.toggle('aberto'); q.setAttribute('aria-expanded', ab ? 'true' : 'false'); avalia(); }
      q.addEventListener('click', alterna);
      q.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alterna(); } });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', roda); else roda();
})();
