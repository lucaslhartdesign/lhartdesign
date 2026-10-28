/* Social Media e Tráfego no celular: botão de WhatsApp fixo no pé da tela (o link vem do WhatsApp principal da própria página). */
(function () {
  if (!window.matchMedia || !matchMedia('(max-width:560px)').matches) return;
  var T = { pt: 'Falar no WhatsApp', en: 'Chat on WhatsApp', es: 'Hablar por WhatsApp' };
  function lang() { var l = (window.LH && LH.lang) || document.documentElement.lang || 'pt'; l = String(l).slice(0, 2).toLowerCase(); return T[l] ? l : 'pt'; }
  function monta() {
    var base = document.querySelector('a[href*="wa.me/55"]') || document.querySelector('a[href*="wa.me"]');
    if (!base) return false;
    var a = document.createElement('a'); a.className = 'sm-stick'; a.target = '_blank'; a.rel = 'noopener'; a.href = base.href; a.textContent = T[lang()];
    document.body.appendChild(a);
    return true;
  }
  if (!monta()) { var n = 0, t = setInterval(function () { if (monta() || ++n > 20) clearInterval(t); }, 500); }
})();
