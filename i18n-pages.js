/* Motor de idiomas (EN / ES / PT) para as páginas Sites para Games, Delivery e os demos de delivery.
   Usa a mesma chave de idioma do site principal (localStorage "lhart-lang") e aceita ?lang=en|es|pt.
   O texto-fonte está em português; cada linha dos dicionários é ["pt", "en", "es"]. */
(function () {
  var LANGS = ['en', 'es', 'pt'];
  var D = {}, P = [], H = {}, CB = [], O = new WeakMap(), vars = {};
  var lang = 'pt';

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function add(rows) {
    rows.forEach(function (r) {
      var k = r[0];
      if (k.indexOf('{}') > -1) {
        P.push({ re: new RegExp('^' + k.split('{}').map(esc).join('([\\s\\S]+?)') + '$'), en: r[1], es: r[2] });
      } else D[k] = [r[1], r[2]];
    });
  }
  function html(map) { for (var k in map) H[k] = map[k]; }

  function tr1(s) {
    if (lang === 'pt') return s;
    var i = lang === 'en' ? 0 : 1;
    if (D[s]) return D[s][i];
    for (var j = 0; j < P.length; j++) {
      var m = s.match(P[j].re);
      if (m) { var n = 1; return P[j][lang].replace(/\{\}/g, function () { return tr1((m[n++] || '').trim()); }); }
    }
    if (s.indexOf(' · ') > -1) {
      var a = s.split(' · '), b = a.map(tr1), ch = false;
      for (var x = 0; x < a.length; x++) if (a[x] !== b[x]) ch = true;
      if (ch) return b.join(' · ');
    }
    return s;
  }
  /* t("texto em português", {n: 3}) -> traduzido, com {chaves} substituídas */
  function t(s, v) {
    var r = tr1(s);
    if (v) r = r.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; });
    return r;
  }

  function textNodes(root) {
    var out = [];
    if (root.nodeType === 3) { out.push(root); return out; }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        return (p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA' || !n.nodeValue.trim()) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }
  function doText(n) {
    var r = O.get(n);
    if (r && n.nodeValue !== r.t) r = null;
    if (!r) { r = { o: n.nodeValue, t: n.nodeValue }; O.set(n, r); }
    var m = r.o.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var nv = m[1] + (lang === 'pt' ? m[2] : tr1(m[2])) + m[3];
    if (n.nodeValue !== nv) n.nodeValue = nv;
    r.t = nv;
  }
  var ATTR = ['title', 'placeholder', 'aria-label', 'alt'];
  function doAttrs(e) {
    ATTR.forEach(function (a) {
      if (!e.hasAttribute || !e.hasAttribute(a)) return;
      var cur = e.getAttribute(a), ko = '_o_' + a, kt = '_t_' + a;
      if (e[ko] === undefined || (e[kt] !== undefined && cur !== e[kt])) e[ko] = cur;
      var v = lang === 'pt' ? e[ko] : tr1(e[ko]);
      e[kt] = v;
      if (cur !== v) e.setAttribute(a, v);
    });
  }
  function doHtml(root) {
    var els = root.querySelectorAll ? root.querySelectorAll('[data-ih]') : [];
    Array.prototype.forEach.call(els, function (e) {
      var k = e.getAttribute('data-ih'), h = H[k];
      if (!h) return;
      var s = (h[lang] || h.pt).replace(/\{(\w+)\}/g, function (m, x) { return vars[x] != null ? vars[x] : m; });
      if (e.innerHTML !== s) e.innerHTML = s;
    });
  }
  function apply(root) {
    root = root || document.body;
    if (!root) return;
    if (root.nodeType === 1) { doHtml(root); doAttrs(root); }
    textNodes(root).forEach(doText);
    if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('[title],[placeholder],[aria-label],[alt]'), doAttrs);
  }

  function valid(l) { return LANGS.indexOf(l) !== -1; }
  function detect() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (valid(q)) { try { localStorage.setItem('lhart-lang', q); } catch (e) {} return q; }
    var s = null;
    try { s = localStorage.getItem('lhart-lang'); } catch (e) {}
    if (valid(s)) return s;
    var n = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return valid(n) ? n : 'en';
  }
  function set(l, fromStorage) {
    if (!valid(l)) return;
    lang = l;
    if (!fromStorage) { try { localStorage.setItem('lhart-lang', l); localStorage.setItem('lhart-lang-chosen', '1'); } catch (e) {} }
    document.documentElement.lang = l === 'pt' ? 'pt-BR' : l;
    apply(document.body);
    meta();
    var sw = document.querySelectorAll('.langsw button');
    Array.prototype.forEach.call(sw, function (b) { b.setAttribute('aria-current', String(b.getAttribute('data-lang') === l)); });
    CB.forEach(function (f) { try { f(l); } catch (e) { console.error(e); } });
  }
  var M = null;
  function meta(m) {
    if (m) M = m;
    if (!M) return;
    if (M.title) document.title = M.title[lang] || M.title.pt;
    if (M.desc) { var d = document.querySelector('meta[name="description"]'); if (d) d.setAttribute('content', M.desc[lang] || M.desc.pt); }
  }
  function observe(root) {
    if (!window.MutationObserver) return;
    new MutationObserver(function (ms) {
      if (lang === 'pt') return;
      ms.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 || n.nodeType === 3) apply(n); });
      });
    }).observe(root || document.body, { childList: true, subtree: true });
  }
  function switcher(el) {
    if (!el) return;
    el.className = 'langsw';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Language');
    el.innerHTML = LANGS.map(function (l) { return '<button type="button" data-lang="' + l + '">' + l.toUpperCase() + '</button>'; }).join('');
    el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) set(b.getAttribute('data-lang')); });
  }
  window.addEventListener('storage', function (e) { if (e.key === 'lhart-lang' && valid(e.newValue) && e.newValue !== lang) set(e.newValue, true); });

  lang = detect();
  window.LH = {
    add: add, html: html, t: t, apply: apply, set: set, observe: observe, switcher: switcher, meta: meta,
    get lang() { return lang; },
    vars: vars,
    on: function (f) { CB.push(f); },
    start: function () { document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang; apply(document.body); meta(); set(lang, true); }
  };
})();
