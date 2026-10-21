/* Desenhos "vivos" do cardápio: lanche em camadas e pizza vista de cima, com textura, luz e sombra (efeitos de filtro SVG),
   que se formam enquanto o cliente liga e desliga ingredientes. Só formas fixas escritas aqui: nada do cadastro da loja vira código.
   O preço é sempre calculado no servidor pelas opções do produto; isto é só a parte visual.

   Fotos reais: se window.LHD.fotos tiver um endereço para a camada (ex.: LHD.fotos.carne = '/static/ing/carne.webp'; também queijo,
   topo, pao...), a camada usa a foto (PNG/WebP com fundo transparente, ~1000 px de largura, vista de lado) no lugar do desenho. */
window.LHD = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let uid = 0;
  const semente = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296); };

  /* contorno orgânico (fechado e suave) em volta de um retângulo arredondado/elipse: dá o "irregular" de carne, queijo, alface... */
  function blob(cx, cy, rx, ry, n, jit, seed, pw = 0.55) {
    const r = semente(seed), pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      const k = 1 + (r() - 0.5) * jit;
      pts.push([cx + rx * Math.sign(c) * Math.pow(Math.abs(c), pw) * k, cy + ry * Math.sign(s) * Math.pow(Math.abs(s), pw) * (1 + (r() - 0.5) * jit * 0.7)]);
    }
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      d += (i ? `Q${a[0].toFixed(1)} ${a[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)} ` : `M${m[0].toFixed(1)} ${m[1].toFixed(1)} `);
    }
    const a = pts[0], b = pts[1], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    return d + `Q${a[0].toFixed(1)} ${a[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)} Z`;
  }
  const onda = (x0, y, n, dx, amp) => { let d = `M${x0} ${y} q${dx / 2} ${-amp} ${dx} 0`; for (let i = 1; i < n; i++) d += ` t${dx} 0`; return d; };

  /* ---------------- lanche em camadas (cada camada é desenhada com y = topo da camada) ---------------- */
  // gradientes e filtros: #gX / #fXX viram #<id>X na hora de montar (cada desenho tem os seus)
  const F = { tx: 'url(#fTX)', tx2: 'url(#fTX2)', sh: 'url(#fSH)', rg: 'url(#fRG)' };
  const CAM = {
    pao: [30, (y) => `<g filter="${F.tx}"><path d="M34 ${y} h192 q8 0 8 8 v6 q0 16 -16 16 h-176 q-16 0 -16 -16 v-6 q0 -8 8 -8z" fill="url(#gB)"/>
      <path d="M36 ${y + 22} q94 14 188 0 v3 q0 5 -16 5 h-156 q-16 0 -16 -5z" fill="#6b3a12" fill-opacity=".38"/>
      <path d="M42 ${y + 3} h176" stroke="#fff6dc" stroke-opacity=".38" stroke-width="3.2" stroke-linecap="round"/></g>`],
    carne: [28, (y) => `<g filter="${F.tx2}"><path d="${blob(130, y + 14, 106, 13.5, 26, 0.2, 'carne' + y, 0.42)}" fill="url(#gP)"/>
      <path d="${blob(130, y + 14, 106, 13.5, 26, 0.2, 'carne' + y, 0.42)}" fill="none" stroke="#1a0c06" stroke-opacity=".5" stroke-width="1.6"/>
      ${[58, 92, 126, 160, 194].map(x => `<path d="M${x} ${y + 5} l14 18" stroke="#150803" stroke-opacity=".5" stroke-width="3.4" stroke-linecap="round"/>`).join('')}
      <path d="M50 ${y + 6} q52 -5 110 -1" stroke="#fff" stroke-opacity=".2" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${[[70, 20], [100, 10], [150, 21], [178, 12], [118, 17], [200, 17], [88, 22]].map(([x, o]) => `<circle cx="${x}" cy="${y + o}" r="1.5" fill="#f2c98a" fill-opacity=".35"/>`).join('')}</g>`],
    grao: [28, (y) => `<g filter="${F.tx2}"><path d="${blob(130, y + 14, 106, 13.5, 24, 0.18, 'grao' + y, 0.45)}" fill="url(#gG)"/>
      ${Array.from({ length: 22 }, (_, i) => { const r = semente('g' + i); return `<circle cx="${50 + r() * 160}" cy="${y + 6 + r() * 16}" r="${2 + r() * 2}" fill="${r() > .5 ? '#c9a063' : '#3b2812'}" fill-opacity=".5"/>`; }).join('')}</g>`],
    queijo: [12, (y) => `<g filter="${F.sh}"><path d="M24 ${y + 1} Q24 ${y} 30 ${y} H230 Q236 ${y} 236 ${y + 1} V${y + 9} Q236 ${y + 12} 228 ${y + 12} H212 Q204 ${y + 12} 204 ${y + 18} V${y + 24} Q204 ${y + 31} 198 ${y + 31} Q192 ${y + 31} 192 ${y + 24} V${y + 18} Q192 ${y + 12} 186 ${y + 12} H76 Q68 ${y + 12} 68 ${y + 17} V${y + 21} Q68 ${y + 28} 62 ${y + 28} Q56 ${y + 28} 56 ${y + 21} V${y + 17} Q56 ${y + 12} 48 ${y + 12} H32 Q24 ${y + 12} 24 ${y + 9} Z" fill="url(#gC)" stroke="#d98606" stroke-opacity=".5"/>
      <path d="M32 ${y + 3} h86" stroke="#fffbe0" stroke-opacity=".7" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M150 ${y + 4} h56" stroke="#fffbe0" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="198" cy="${y + 26}" rx="2.4" ry="3.2" fill="#fff6c8" fill-opacity=".6"/><ellipse cx="62" cy="${y + 23}" rx="2.2" ry="3" fill="#fff6c8" fill-opacity=".6"/></g>`],
    bacon: [14, (y) => `<g filter="${F.sh}">${[[0, '#8e2412', 13], [0, '#c8432a', 9.5], [-1.2, '#e8785a', 4.5], [-1.6, '#f6cdb8', 2.2]].map(([o, c, w]) => `<path d="${onda(32, y + 8 + o, 7, 28, 6)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`).join('')}</g>`],
    alface: [14, (y) => `<g filter="${F.rg}"><path d="${(() => {
      let d = `M24 ${y + 14} L24 ${y + 6}`; const n = 15, dx = 212 / n, r = semente('alf' + y);
      for (let i = 0; i < n; i++) d += ` q${dx / 2} ${-(9 + r() * 9)} ${dx} ${(r() - 0.5) * 5}`;
      return d + ` L236 ${y + 14} Z`; })()}" fill="url(#gA)" stroke="#3d7d1f" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M30 ${y + 11} q30 -7 62 -1 t62 0 t74 -1" fill="none" stroke="#e1f7b0" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/>
      ${[50, 96, 142, 188].map(x => `<path d="M${x} ${y + 12} l4 -8" stroke="#d3f2a0" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round"/>`).join('')}</g>`],
    tomate: [11, (y) => `<g filter="${F.sh}">${[66, 130, 194].map(x => `<ellipse cx="${x}" cy="${y + 6}" rx="40" ry="6.6" fill="#c9302a"/><ellipse cx="${x}" cy="${y + 5.6}" rx="36" ry="5" fill="url(#gM)"/>
      <ellipse cx="${x}" cy="${y + 5.6}" rx="26" ry="2.8" fill="#f88b72" fill-opacity=".55"/>${[-18, -6, 8, 20].map(o => `<ellipse cx="${x + o}" cy="${y + 5.8}" rx="2.4" ry="1.1" fill="#ffe7a0" fill-opacity=".85"/>`).join('')}
      <path d="M${x - 28} ${y + 3.6} q28 -2.6 56 0" stroke="#fff" stroke-opacity=".4" stroke-width="1.4" fill="none" stroke-linecap="round"/>`).join('')}</g>`],
    cebola: [9, (y) => `<g filter="${F.sh}"><rect x="34" y="${y + 1}" width="192" height="7.4" rx="3.7" fill="#f3e9f7" stroke="#bf9bd6" stroke-width="1.2"/>
      <rect x="40" y="${y + 2.4}" width="180" height="2.2" rx="1.1" fill="#fff" fill-opacity=".7"/>
      ${[70, 104, 150, 188].map(x => `<path d="M${x} ${y + 2} v5.4" stroke="#bf9bd6" stroke-width="1.4"/>`).join('')}</g>`],
    ovo: [13, (y) => `<g filter="${F.sh}"><path d="M34 ${y + 9} Q28 ${y + 2} 60 ${y + 3} Q100 ${y - 1} 130 ${y + 3} Q190 ${y - 1} 216 ${y + 5} Q236 ${y + 8} 220 ${y + 12.5} Q130 ${y + 17} 40 ${y + 13.5} Z" fill="#fffdf5" stroke="#e6dcc2"/>
      <ellipse cx="130" cy="${y + 4}" rx="22" ry="11.5" fill="url(#gY)"/><ellipse cx="123" cy="${y + 0.5}" rx="6.5" ry="3.6" fill="#fff" fill-opacity=".65"/></g>`],
    picles: [7, (y) => `<g filter="${F.sh}">${[62, 106, 154, 198].map(x => `<ellipse cx="${x}" cy="${y + 4}" rx="21" ry="4.8" fill="#6f8f27"/><ellipse cx="${x}" cy="${y + 3.4}" rx="17" ry="3" fill="#a5c05a"/>${[-9, -2, 6, 12].map(o => `<circle cx="${x + o}" cy="${y + 3.2}" r=".9" fill="#d9e8a0" fill-opacity=".8"/>`).join('')}`).join('')}</g>`],
    molho: [8, (y) => `<g filter="${F.sh}"><path d="${onda(34, y + 5, 8, 24, 7)}" fill="none" stroke="#a82a14" stroke-width="7.4" stroke-linecap="round"/>
      <path d="${onda(34, y + 4.4, 8, 24, 7)}" fill="none" stroke="#e8532e" stroke-width="4.6" stroke-linecap="round"/>
      <path d="${onda(34, y + 3.4, 8, 24, 7)}" fill="none" stroke="#ffc9a8" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round"/></g>`],
    topo: [62, (y) => `<g filter="${F.tx}"><path d="M30 ${y + 60} C27 ${y + 22} 68 ${y + 1.5} 130 ${y + 1.5} C192 ${y + 1.5} 233 ${y + 22} 230 ${y + 60} Q230 ${y + 64.5} 224 ${y + 64.5} H36 Q30 ${y + 64.5} 30 ${y + 60}Z" fill="url(#gT)"/>
      <path d="M36 ${y + 56} q94 9 188 0 v7 q0 3 -8 3 h-172 q-8 0 -8 -3z" fill="#7a4210" fill-opacity=".4"/>
      <ellipse cx="94" cy="${y + 20}" rx="44" ry="10" transform="rotate(-18 94 ${y + 20})" fill="#fff6dd" fill-opacity=".18"/>
      <ellipse cx="86" cy="${y + 17}" rx="14" ry="3.6" transform="rotate(-18 86 ${y + 17})" fill="#fff" fill-opacity=".28"/>
      </g>${Array.from({ length: 30 }, (_, i) => { const u = (((i * 0.618034) % 1) * 1.6 - 0.8), v = ((i * 0.381966 + 0.2) % 1), x = 130 + u * 100, o = 9 + (1 - Math.sqrt(1 - u * u)) * 34 + v * 15, ang = ((i * 47) % 70) - 35 + u * 40;
        return `<g transform="translate(${x.toFixed(1)} ${(y + o).toFixed(1)}) rotate(${ang.toFixed(0)})"><ellipse cx=".5" cy="1" rx="3.7" ry="1.9" fill="#5c320c" fill-opacity=".4"/><ellipse rx="3.4" ry="1.7" fill="url(#gS)"/></g>`; }).join('')}`],
  };
  const ORDEM = ['pao', 'molho', 'picles', 'alface', 'tomate', 'cebola', 'carne', 'grao', 'queijo', 'bacon', 'ovo', 'topo'];
  const RX_CAMADA = [
    ['carne', /carne|hamburguer|burger|patty|duplo|dobro/], ['queijo', /queijo|cheddar|cheese|mussarela|mucarela|gouda|brie/], ['bacon', /bacon/],
    ['alface', /alface|salada|rucula/], ['tomate', /tomate/], ['cebola', /cebola|onion/], ['picles', /picles|pepino/],
    ['ovo', /\bovo\b|egg/], ['molho', /molho|maionese|barbecue|bbq|ketchup|mostarda/], ['grao', /grao|vegetal|veggie/],
  ];
  const camadaDe = nome => { const n = norm(nome); for (const [k, rx] of RX_CAMADA) if (rx.test(n)) return k; return null; };
  const empilha = (base, extras) => {
    const cont = {}; [...(base || []), ...extras].forEach(k => { cont[k] = (cont[k] || 0) + 1; });
    cont.pao = 1; cont.topo = 1;
    return ORDEM.flatMap(k => Array(Math.min(cont[k] || 0, 3)).fill(k));
  };

  /* gradientes e filtros de luz de cada desenho (ids únicos: #fTX vira #<id>TX etc.) */
  const defs = id => `<defs>
    <linearGradient id="${id}B" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecb868"/><stop offset=".6" stop-color="#cf8a3a"/><stop offset="1" stop-color="#a55f1c"/></linearGradient>
    <linearGradient id="${id}T" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8cd84"/><stop offset=".55" stop-color="#d9913d"/><stop offset="1" stop-color="#a65c1a"/></linearGradient>
    <radialGradient id="${id}S" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff9e2"/><stop offset="1" stop-color="#e3cd98"/></radialGradient>
    <linearGradient id="${id}P" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#704029"/><stop offset=".55" stop-color="#43220f"/><stop offset="1" stop-color="#231008"/></linearGradient>
    <linearGradient id="${id}G" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#94703a"/><stop offset="1" stop-color="#523a1c"/></linearGradient>
    <linearGradient id="${id}C" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd852"/><stop offset=".6" stop-color="#f5ae18"/><stop offset="1" stop-color="#e48f08"/></linearGradient>
    <linearGradient id="${id}A" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e066"/><stop offset=".6" stop-color="#62ad32"/><stop offset="1" stop-color="#47931f"/></linearGradient>
    <radialGradient id="${id}M" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#ee5a46"/><stop offset="1" stop-color="#c42f26"/></radialGradient>
    <radialGradient id="${id}Y" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffd24a"/><stop offset=".7" stop-color="#ffa91a"/><stop offset="1" stop-color="#e28300"/></radialGradient>
    <radialGradient id="${id}L" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#4a3d36"/><stop offset="1" stop-color="#14100e"/></radialGradient>
    <filter id="${id}TX" x="-4%" y="-8%" width="108%" height="120%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".05 .09" numOctaves="3" seed="4" result="n"/>
      <feDiffuseLighting in="n" lighting-color="#fff" surfaceScale="1.6" diffuseConstant="1.18" result="l"><feDistantLight azimuth="235" elevation="62"/></feDiffuseLighting>
      <feComposite in="l" in2="SourceAlpha" operator="in" result="lm"/><feBlend in="SourceGraphic" in2="lm" mode="multiply" result="b"/>
      <feComposite in="b" in2="SourceAlpha" operator="in" result="c"/>
      <feDropShadow in="c" dx="0" dy="2.2" stdDeviation="1.8" flood-color="#000" flood-opacity=".42"/></filter>
    <filter id="${id}TX2" x="-4%" y="-12%" width="108%" height="130%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".12 .2" numOctaves="3" seed="9" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".18 .3" numOctaves="3" seed="2" result="n2"/>
      <feDiffuseLighting in="n2" lighting-color="#fff" surfaceScale="2.6" diffuseConstant="1.25" result="l"><feDistantLight azimuth="235" elevation="55"/></feDiffuseLighting>
      <feComposite in="l" in2="d" operator="in" result="lm"/><feBlend in="d" in2="lm" mode="multiply" result="b"/>
      <feComposite in="b" in2="d" operator="in" result="c"/>
      <feDropShadow in="c" dx="0" dy="2.4" stdDeviation="1.8" flood-color="#000" flood-opacity=".5"/></filter>
    <filter id="${id}RG" x="-4%" y="-30%" width="108%" height="150%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".08 .22" numOctaves="2" seed="5" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feDropShadow in="d" dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".4"/></filter>
    <filter id="${id}SH" x="-4%" y="-30%" width="108%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".42"/></filter>
    <filter id="${id}PT" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx=".8" dy="1.8" stdDeviation="1.5" flood-color="#000" flood-opacity=".5"/></filter></defs>`;
  const unico = (txt, id) => txt.replace(/url\(#([gf])([A-Z]{1,2}[0-9]?)\)/g, (m, t, k) => `url(#${id}${k})`);

  /** Lanche vivo: set(['pao','carne','queijo','topo', ...]) e as camadas caem, sobem ou saem com animação. */
  function lancheViva() {
    const id = 'v' + (++uid), H = 300, base = H - 30;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 260 ${H}`); svg.setAttribute('class', 'lanche vivo'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `${defs(id)}<ellipse cx="130" cy="${H - 18}" rx="126" ry="15" fill="#000" fill-opacity=".45" filter="url(#${id}SH)"/>
      <ellipse cx="130" cy="${H - 26}" rx="120" ry="13.5" fill="url(#${id}L)" stroke="#6b5b50" stroke-width="1.2"/>
      <ellipse cx="130" cy="${H - 28.5}" rx="108" ry="9" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1.4"/><g class="pilha"></g>`;
    const pilha = svg.querySelector('.pilha');
    let atuais = [];
    const foto = k => (window.LHD && window.LHD.fotos && window.LHD.fotos[k]) || null;
    function set(lista) {
      const alvo = lista.filter(k => CAM[k]).map((k, i, a) => ({ k, id: k + '#' + a.slice(0, i).filter(x => x === k).length }));
      atuais = atuais.filter(e => {
        if (alvo.some(a => a.id === e.id)) return true;
        e.g.style.opacity = 0; e.g.style.transform += ' scale(.92)'; setTimeout(() => e.g.remove(), 320);
        return false;
      });
      let y = base; const pos = {};
      alvo.forEach((a, i) => { y -= CAM[a.k][0] - (i ? 3 : 0); pos[a.id] = y; });
      alvo.forEach(a => {
        let e = atuais.find(x => x.id === a.id);
        if (!e) {
          const g = document.createElementNS(NS, 'g');
          const f = foto(a.k);
          g.innerHTML = f ? `<image href="${f}" x="14" y="-10" width="232" height="${CAM[a.k][0] + 20}" preserveAspectRatio="xMidYMid meet"/>` : unico(CAM[a.k][1](0), id);
          g.style.transition = 'transform .6s cubic-bezier(.34,1.45,.55,1), opacity .35s';
          g.style.transform = 'translateY(-300px)'; g.style.opacity = 0;
          pilha.append(g); e = { id: a.id, g }; atuais.push(e);
          requestAnimationFrame(() => requestAnimationFrame(() => { g.style.transform = `translateY(${pos[a.id]}px)`; g.style.opacity = 1; }));
        } else e.g.style.transform = `translateY(${pos[a.id]}px)`;
      });
      alvo.forEach(a => pilha.append(atuais.find(x => x.id === a.id).g));
    }
    return { el: svg, set };
  }

  /* ---------------- pizza vista de cima ---------------- */
  const PECA = {
    mussarela: (r) => `<path d="${blob(0, 0, 12 + r() * 3, 7 + r() * 3, 9, 0.35, 'mz' + r(), 0.8)}" transform="rotate(${(r() * 180) | 0})" fill="#fff1c4" stroke="#e8cf86" stroke-width="1.1"/>
      <ellipse cx="-2.5" cy="-2" rx="4.5" ry="2" fill="#fff" fill-opacity=".55"/><circle cx="3.5" cy="1.5" r="1.8" fill="#e2b04a" fill-opacity=".55"/>`,
    pepperoni: (r) => `<circle r="10.4" fill="url(#gPP)"/><circle r="10.4" fill="none" stroke="#7a1810" stroke-width="1.5"/>
      <circle r="8.2" fill="none" stroke="#e0705a" stroke-opacity=".5" stroke-width="1"/>${[0, 1, 2, 3, 4, 5].map(i => { const a = i * 1.05 + r(); return `<circle cx="${(Math.cos(a) * 4.4).toFixed(1)}" cy="${(Math.sin(a) * 4.4).toFixed(1)}" r="1.5" fill="#fbc9a0" fill-opacity=".5"/>`; }).join('')}
      <ellipse cx="-3.4" cy="-3.6" rx="3.8" ry="1.8" transform="rotate(-35)" fill="#fff" fill-opacity=".42"/>`,
    cogumelo: (r) => `<g transform="rotate(${(r() * 360) | 0})"><path d="M-10 2 Q-10 -9.5 0 -9.5 Q10 -9.5 10 2 Z" fill="#f4e9d8" stroke="#c9b496" stroke-width="1"/>
      <path d="M-3.4 2 h6.8 v8 q0 2 -3.4 2 t-3.4 -2z" fill="#e9d8c0" stroke="#c9b496" stroke-width="1"/><path d="M-7 -2 q7 -4 14 0" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" fill="none"/><path d="M-6 -5 q6 -3 12 0" stroke="#cdb99d" stroke-opacity=".6" stroke-width="1" fill="none"/></g>`,
    azeitona: () => `<circle r="7" fill="none" stroke="#18181c" stroke-width="4.6"/><circle r="9.1" fill="none" stroke="#2c2c33" stroke-width=".8"/>
      <circle r="4.6" fill="#7e3b24" fill-opacity=".55"/><path d="M-6.4 -3 q2.6 -4 6.4 -4" stroke="#fff" stroke-opacity=".6" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    manjericao: (r) => `<g transform="rotate(${(r() * 360) | 0})"><path d="M0 -11 Q11 -3 0 11 Q-11 -3 0 -11Z" fill="url(#gBL)" stroke="#2a6e24" stroke-width="1"/>
      <path d="M0 -9 V9 M0 -3 l5 -3 M0 -3 l-5 -3 M0 2 l5 -3 M0 2 l-5 -3" stroke="#b6e592" stroke-opacity=".75" stroke-width=".9" fill="none"/></g>`,
    pimentao: (r) => `<g transform="rotate(${(r() * 360) | 0})"><path d="M-9 3 Q0 -10 9 3" fill="none" stroke="#3f8f2c" stroke-width="5.4" stroke-linecap="round"/>
      <path d="M-9 3 Q0 -10 9 3" fill="none" stroke="#6cc24a" stroke-width="3.2" stroke-linecap="round"/><path d="M-6 -1.6 Q-1 -6 4 -4.4" fill="none" stroke="#e7ffd6" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/></g>`,
    cebola: () => `<circle r="8" fill="none" stroke="#d6aee0" stroke-width="3" stroke-dasharray="38 7"/><circle r="8" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1" stroke-dasharray="38 7"/>`,
    tomate: () => `<circle r="9" fill="#cf3a2f"/><circle r="9" fill="none" stroke="#a02219" stroke-width="1"/><circle r="6.4" fill="#ee6a56"/>${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${(Math.cos(i * 1.26) * 3.6).toFixed(1)}" cy="${(Math.sin(i * 1.26) * 3.6).toFixed(1)}" rx="1.5" ry=".9" transform="rotate(${i * 72})" fill="#ffe9a8"/>`).join('')}
      <ellipse cx="-3" cy="-3.4" rx="3" ry="1.5" transform="rotate(-35)" fill="#fff" fill-opacity=".4"/>`,
    presunto: (r) => `<path d="${blob(0, 0, 10, 7, 8, 0.4, 'pr' + r(), 0.8)}" transform="rotate(${(r() * 180) | 0})" fill="#f4a9a8" stroke="#d98383" stroke-width="1"/><path d="M-6 -1 q6 -4 12 0" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" fill="none"/>`,
    milho: () => `<circle r="3.6" fill="#f6c12c"/><circle r="3.6" fill="none" stroke="#c7920e" stroke-width=".6"/><circle cx="-1" cy="-1" r="1.1" fill="#fff4b0"/>`,
    bacon: (r) => `<g transform="rotate(${(r() * 360) | 0})"><path d="M-11 0 q2.7 -5 5.4 0 t5.4 0 t5.4 0 t5.4 0" fill="none" stroke="#8e2412" stroke-width="5.2" stroke-linecap="round"/>
      <path d="M-11 0 q2.7 -5 5.4 0 t5.4 0 t5.4 0 t5.4 0" fill="none" stroke="#d24d32" stroke-width="3" stroke-linecap="round"/><path d="M-11 -.6 q2.7 -5 5.4 0 t5.4 0 t5.4 0 t5.4 0" fill="none" stroke="#f6cdb8" stroke-width="1" stroke-linecap="round"/></g>`,
  };
  const QTD = { mussarela: 13, pepperoni: 9, cogumelo: 8, azeitona: 10, manjericao: 6, pimentao: 8, cebola: 9, tomate: 8, presunto: 8, milho: 18, bacon: 8 };
  const RX_TOPPING = [
    ['mussarela', /mussarela|mucarela|queijo|catupiry|parmesao/], ['pepperoni', /pepperoni|calabresa|salame/], ['cogumelo', /cogumelo|champignon/],
    ['azeitona', /azeitona/], ['manjericao', /manjeric/], ['pimentao', /pimentao|pimentoes/], ['cebola', /cebola/], ['tomate', /tomate/],
    ['presunto', /presunto|peru/], ['milho', /milho/], ['bacon', /bacon/],
  ];
  const toppingDe = nome => { const n = norm(nome); for (const [k, rx] of RX_TOPPING) if (rx.test(n)) return k; return null; };

  /** Pizza viva: set(['mussarela','pepperoni', ...]); cada ingrediente aparece espalhado pela massa, sempre no mesmo lugar. */
  function pizzaViva() {
    const id = 'p' + (++uid), r0 = semente('massa');
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 260 260'); svg.setAttribute('class', 'pizza vivo'); svg.setAttribute('aria-hidden', 'true');
    const bolhas = Array.from({ length: 46 }, (_, i) => { const a = i * 0.137 + r0() * 0.1, rr = 106 + r0() * 7; const x = 130 + Math.cos(a * 6.28 * 7.3) * rr, y = 128 + Math.sin(a * 6.28 * 7.3) * rr;
      return r0() > 0.45 ? `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${3 + r0() * 4}" ry="${2 + r0() * 3}" fill="#9a5a1c" fill-opacity=".5"/>` : `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${3 + r0() * 3}" ry="${2 + r0() * 2}" fill="#f7dca0" fill-opacity=".55"/>`; }).join('');
    svg.innerHTML = `${defs(id)}<defs>
      <radialGradient id="${id}M2" cx=".42" cy=".35" r=".8"><stop offset="0" stop-color="#f5d79e"/><stop offset=".7" stop-color="#d9a051"/><stop offset="1" stop-color="#b9762b"/></radialGradient>
      <radialGradient id="${id}S2" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#e65a3c"/><stop offset=".8" stop-color="#c93a24"/><stop offset="1" stop-color="#a22818"/></radialGradient>
      <radialGradient id="${id}PP" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#df4a38"/><stop offset="1" stop-color="#9a2218"/></radialGradient>
      <linearGradient id="${id}BL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5cb84a"/><stop offset="1" stop-color="#2f8030"/></linearGradient>
      <filter id="${id}MS" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="6" result="n"/>
        <feDiffuseLighting in="n" lighting-color="#fff" surfaceScale="2.4" diffuseConstant="1.2" result="l"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting>
        <feComposite in="l" in2="SourceAlpha" operator="in" result="lm"/><feBlend in="SourceGraphic" in2="lm" mode="multiply" result="b"/><feComposite in="b" in2="SourceAlpha" operator="in"/></filter></defs>
      <ellipse cx="132" cy="142" rx="124" ry="114" fill="#000" fill-opacity=".38" filter="url(#${id}SH)"/>
      <g filter="url(#${id}MS)"><circle cx="130" cy="128" r="117" fill="url(#${id}M2)" stroke="#a9691f" stroke-width="2"/>${bolhas}
      <circle cx="130" cy="128" r="103" fill="none" stroke="#fff3d0" stroke-opacity=".28" stroke-width="3"/>
      <circle cx="130" cy="128" r="98" fill="url(#${id}S2)"/>${Array.from({ length: 26 }, () => `<circle cx="${(130 + (r0() - .5) * 170).toFixed(1)}" cy="${(128 + (r0() - .5) * 170).toFixed(1)}" r="${1 + r0() * 2.4}" fill="#7d1d10" fill-opacity=".28"/>`).join('')}</g>
      <circle cx="130" cy="128" r="98" fill="none" stroke="#6e170c" stroke-opacity=".4" stroke-width="3"/>
      <path d="M52 62 A100 100 0 0 1 150 28" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="5" stroke-linecap="round"/><g class="cob"></g>`;
    const cob = svg.querySelector('.cob');
    let atuais = {};
    function monta(k) {
      const g = document.createElementNS(NS, 'g'); const r = semente(k + '|pizza'); const n = QTD[k] || 8;
      const off = (Object.keys(QTD).indexOf(k) * 0.9) % 6.28;
      let html = '';
      for (let i = 0; i < n; i++) {
        const ang = i * 2.399963 + off, rad = 82 * Math.sqrt((i + 0.6) / (n + 0.4));
        const x = 130 + rad * Math.cos(ang), y = 128 + rad * Math.sin(ang);
        html += `<g class="pc" style="transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px)"><g class="pi" style="transition-delay:${i * 35}ms">${PECA[k](r)}</g></g>`;
      }
      g.innerHTML = unico(html, id);
      g.setAttribute('data-k', k); g.setAttribute('filter', `url(#${id}PT)`);
      return g;
    }
    function set(lista) {
      const alvo = new Set(lista.filter(k => PECA[k]));
      Object.keys(atuais).forEach(k => { if (!alvo.has(k)) { const g = atuais[k]; g.classList.remove('on'); setTimeout(() => g.remove(), 380); delete atuais[k]; } });
      alvo.forEach(k => {
        if (atuais[k]) return;
        const g = monta(k); cob.append(g); atuais[k] = g;
        requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add('on')));
      });
    }
    return { el: svg, set };
  }

  const ICONES = { carne: '🥩', queijo: '🧀', bacon: '🥓', alface: '🥬', tomate: '🍅', cebola: '🧅', picles: '🥒', ovo: '🍳', molho: '🥫', grao: '🫘',
                   mussarela: '🧀', pepperoni: '🍕', cogumelo: '🍄', azeitona: '🫒', manjericao: '🌿', pimentao: '🫑', presunto: '🍖', milho: '🌽' };
  return { lancheViva, pizzaViva, camadaDe, toppingDe, empilha, ICONES, fotos: {} };
})();
