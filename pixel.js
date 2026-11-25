/* Meta Pixel da Lhart Design (Instagram e Facebook Ads).
   Uso: <script src="pixel.js" defer></script>   (as páginas de anúncio podem trazer data-lp="nome" no <html>)

   ➜ PARA LIGAR: cole o ID do Pixel (só números) em PIXEL_ID, aqui embaixo, e publique o site.
     Enquanto PIXEL_ID estiver vazio, este arquivo não faz nada: não carrega nada do Facebook e não mostra aviso.

   Privacidade (LGPD): o Pixel só carrega DEPOIS de a pessoa tocar em "Aceitar" no aviso de cookies de medição.
   "Agora não" guarda a escolha e o Pixel nunca carrega naquele navegador.

   Eventos enviados à Meta:
     PageView      toda página, depois do aceite
     ViewContent   páginas de anúncio (content_name = data-lp)
     Contact       clique em qualquer link do WhatsApp (wa.me)
     Lead          primeira mensagem enviada pelo chat do site (lh-site.js chama LH_EVT('Lead'))
   O resto do site pode chamar window.LH_EVT('NomeDoEvento', {…}) com segurança: se o Pixel estiver desligado, não acontece nada. */
(function () {
  'use strict';
  var PIXEL_ID = '';   // ← cole aqui, ex.: '123456789012345'

  var fila = [];
  window.LH_EVT = function (nome, dados) { fila.push([nome, dados]); };   // antes de carregar, guarda; se nunca carregar, descarta
  if (!/^\d{8,20}$/.test(PIXEL_ID)) return;

  var CHAVE = 'lh-consent-medicao', pt = (document.documentElement.lang || 'pt').slice(0, 2).toLowerCase() !== 'en';
  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }

  function carregar() {
    /* código-base oficial da Meta (ele mesmo não carrega duas vezes) */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
    var lp = document.documentElement.getAttribute('data-lp');
    if (lp) fbq('track', 'ViewContent', { content_name: lp });
    window.LH_EVT = function (nome, dados) { try { dados ? fbq('track', nome, dados) : fbq('track', nome); } catch (e) {} };
    fila.splice(0).forEach(function (x) { window.LH_EVT(x[0], x[1]); });
  }

  /* clique no WhatsApp = Contact (uma vez por clique) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (a) window.LH_EVT('Contact', { content_name: document.documentElement.getAttribute('data-lp') || location.pathname });
  }, true);

  function aviso() {
    var d = document.createElement('div');
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', pt ? 'Cookies de medição' : 'Measurement cookies');
    d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:2147482000;max-width:440px;padding:14px 16px;border-radius:16px;background:#1c1e2e;color:#e9e9ed;' +
      'border:1px solid #34374a;box-shadow:0 18px 50px #000a;font:400 14px/1.45 Inter,system-ui,sans-serif';
    d.innerHTML = '<div style="margin-bottom:10px">' + (pt
      ? 'Usamos cookies de medição (Meta) só para saber se nossos anúncios funcionam. Você aceita?'
      : 'We use measurement cookies (Meta) only to know whether our ads work. Do you accept?') + '</div>' +
      '<div style="display:flex;gap:8px"><button type="button" data-v="sim" style="flex:1;min-height:42px;border:0;border-radius:99px;background:#d2cefd;color:#161826;font:800 14px Inter,sans-serif;cursor:pointer">' + (pt ? 'Aceitar' : 'Accept') + '</button>' +
      '<button type="button" data-v="nao" style="flex:1;min-height:42px;border-radius:99px;background:transparent;color:#e9e9ed;border:1px solid #4a4e66;font:700 14px Inter,sans-serif;cursor:pointer">' + (pt ? 'Agora não' : 'Not now') + '</button></div>';
    d.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var v = b.getAttribute('data-v'); gravar(v); d.remove(); if (v === 'sim') carregar();
    });
    document.body.appendChild(d);
  }

  function iniciar() {
    var v = ler();
    if (v === 'sim') carregar(); else if (v !== 'nao') aviso();
  }
  if (document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();
