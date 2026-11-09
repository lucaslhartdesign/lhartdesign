/* Tela de carregamento das páginas do site (a de Social tem a sua própria). Entra antes de a página aparecer e só sai quando tudo terminou de carregar,
   para a pessoa abrir já com a página pronta. Vai no <head>, sem defer:  <link rel="stylesheet" href="preloader.css"><script src="preloader.js"></script> */
(function () {
  var d = document, h = d.documentElement;
  var src = (d.currentScript && d.currentScript.src) || '';
  var base = src.replace(/preloader\.js(\?.*)?$/, '');
  h.classList.add('pl-on');

  var el = d.createElement('div');
  el.id = 'site-preloader'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<img src="' + base + 'assets/logo.png" alt=""><div class="preloader-bar"><span></span></div>';
  h.appendChild(el);   // fica em cima de tudo desde o primeiro quadro, mesmo antes de o <body> existir

  var inicio = Date.now(), pronto = false, MIN = 450, MAX = 4500;
  function sai() {
    if (pronto) return; pronto = true;
    var resta = Math.max(0, MIN - (Date.now() - inicio));
    setTimeout(function () {
      el.classList.add('is-hidden'); h.classList.remove('pl-on');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
    }, resta);
  }
  function quandoCarregou() {
    var fontes = (d.fonts && d.fonts.ready) ? d.fonts.ready : Promise.resolve();
    // um instante depois do load: os scripts da página já arrumaram o layout (idioma, seções do celular)
    fontes.then(function () { setTimeout(sai, 120); });
  }
  if (d.readyState === 'complete') quandoCarregou(); else window.addEventListener('load', quandoCarregou);
  setTimeout(sai, MAX);                                  // rede de segurança: nunca prende a página
  window.addEventListener('pageshow', function (e) { if (e.persisted) sai(); });   // voltar pelo histórico
})();
