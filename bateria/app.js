'use strict';
// Mapa de Bateria: letra com as marcações da bateria em cima, rolagem automática e editor.
// Tudo roda no navegador. Músicas editadas ficam no aparelho (localStorage); o mp3 fica no IndexedDB.

(() => {
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const mmss = s => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const agora = () => performance.now();

// ---------------- ícones ----------------
const ICONE = {
  sobe: '<svg viewBox="0 0 24 24"><path d="M12 3l8 9h-5v9H9v-9H4z"/></svg>',
  desce: '<svg viewBox="0 0 24 24"><path d="M12 21l-8-9h5V3h6v9h5z"/></svg>',
  virada: '<svg viewBox="0 0 24 24"><circle cx="5" cy="17" r="3"/><circle cx="12" cy="13.5" r="3.5"/><circle cx="19.5" cy="9.5" r="4"/><path d="M3 9c4-6 10-7 15-5l-.6 1.9C13 4.3 8 5.2 4.7 10z"/></svg>',
  prato: '<svg viewBox="0 0 24 24"><path d="M2 9c0-1.7 4.5-3 10-3s10 1.3 10 3-4.5 3-10 3S2 10.7 2 9z"/><rect x="11" y="3" width="2" height="3" rx="1"/><rect x="11" y="11.5" width="2" height="10" rx="1"/></svg>',
  corte: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
  conducao: '<svg viewBox="0 0 24 24"><path d="M7 7h10V4l4 4-4 4V9H7a3 3 0 000 6h1v2H7A5 5 0 017 7zm9 8h1a3 3 0 000-6h-1V7h1a5 5 0 010 10h-1z"/></svg>',
  pausa: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  entra: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
  livre: '<svg viewBox="0 0 24 24"><path d="M5 4h14v12l-5 5H5zm9 15.5L17.5 16H14z"/></svg>',
  marca: '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="12" rx="12" ry="4.5"/><path d="M4 12v9c0 2.5 5.4 4.5 12 4.5s12-2 12-4.5v-9c-1.6 2.4-6.4 4-12 4s-10.4-1.6-12-4z" opacity=".55"/><rect x="18" y="-1" width="2.2" height="15" rx="1.1" transform="rotate(32 19 6)"/><rect x="10" y="-1" width="2.2" height="15" rx="1.1" transform="rotate(-32 11 6)"/></svg>',
  voltar: '<svg viewBox="0 0 24 24"><path d="M15.5 4L7.5 12l8 8 1.5-1.5L10.5 12 17 5.5z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  anterior: '<svg viewBox="0 0 24 24"><path d="M12 5l7 8h-4v6H9v-6H5z"/></svg>',
  proxima: '<svg viewBox="0 0 24 24"><path d="M12 19l-7-8h4V5h6v6h4z"/></svg>',
  fechar: '<svg viewBox="0 0 24 24"><path d="M6.4 5L12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z"/></svg>',
  mais: '<svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>',
  seguir: '<svg viewBox="0 0 24 24"><path d="M8.5 4l8 8-8 8L7 18.5l6.5-6.5L7 5.5z"/></svg>',
  clique: '<svg viewBox="0 0 24 24"><path d="M10 2h4l5 20H5zm1.6 2L7.6 20h8.8l-1.5-6.1-4.6 4.6-1.4-1.4 5.5-5.5L12.4 4z"/></svg>',
  som: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zm12.5-1.5a6 6 0 010 9l-1.4-1.4a4 4 0 000-6.2zm2.8-2.8a10 10 0 010 14.6l-1.4-1.4a8 8 0 000-11.8z"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0012 0h-2a4 4 0 01-8 0zm5 7h2v3h-2z"/></svg>',
};

const TIPOS = {
  sobe: 'Sobe', desce: 'Desce', virada: 'Virada', prato: 'Prato', corte: 'Corte',
  conducao: 'Condução', pausa: 'Para', entra: 'Entra', livre: 'Nota',
};
// primeira palavra depois do "!" que escolhe o tipo
const ALIAS = {
  sobe: 'sobe', subindo: 'sobe', subir: 'sobe', cresce: 'sobe', abre: 'sobe',
  desce: 'desce', desceu: 'desce', descendo: 'desce', leve: 'desce', baixa: 'desce',
  virada: 'virada', vira: 'virada', prato: 'prato', ataque: 'prato', crash: 'prato',
  corte: 'corte', corta: 'corte', conducao: 'conducao', ride: 'conducao',
  para: 'pausa', pausa: 'pausa', sai: 'pausa', entra: 'entra', nota: 'livre',
};
function tipoDe(txt) {
  const t = semAcento(txt);
  if (/\b(corte|corta|parada seca)/.test(t)) return 'corte';
  if (/\bvirad/.test(t)) return 'virada';
  if (/\b(desc|baix|leve)/.test(t)) return 'desce';
  if (/\b(sub|cresc|cheio|abre)/.test(t)) return 'sobe';
  if (/\b(prato|ataque|crash)/.test(t)) return 'prato';
  if (/\b(conduc|ride)/.test(t)) return 'conducao';
  if (/\b(pausa|para\b|sem bateria|sai\b)/.test(t)) return 'pausa';
  if (/\bentra/.test(t)) return 'entra';
  return 'livre';
}
const ehDeixa = l => l.startsWith('!') || /^bateria\b/i.test(l);
function lerDeixa(l) {
  if (l.startsWith('!')) {
    const resto = l.slice(1).trim();
    const [p, ...r] = resto.split(/\s+/);
    const tipo = ALIAS[semAcento(p || '')];
    if (tipo) return { tipo, txt: cap(resto) };
    return { tipo: tipoDe(resto), txt: cap(resto) || 'Nota' };
  }
  const resto = l.replace(/^bateria\s*/i, '');
  return { tipo: tipoDe(resto || l), txt: cap(resto || l) };
}
// texto do editor -> itens. "#" = parte da música, "!" ou "Bateria..." = marcação, resto = letra
function interpretar(texto) {
  const itens = []; let n = 0;
  for (const bruta of String(texto || '').split(/\r?\n/)) {
    const l = bruta.trim();
    if (!l) itens.push({ k: 'vazio' });
    else if (l.startsWith('#')) itens.push({ k: 'secao', txt: l.replace(/^#+\s*/, '') });
    else if (ehDeixa(l)) itens.push({ k: 'deixa', ...lerDeixa(l) });
    else itens.push({ k: 'linha', txt: l, i: n++ });
  }
  return { itens, nLinhas: n };
}
// cifra colada do Cifra Club: tira as linhas de acorde e de tablatura, e "[Refrão]" vira "# Refrão".
// Devolve null quando o texto não parece cifra (aí cola do jeito que veio).
const ACORDE = /^\(?[A-G][#b]?(?:maj|min|dim|aug|sus|add|m|M|º|°|\+|-|\d|\(|\)|[#b]|\/[A-G][#b]?)*\)?$/;
function limparCifra(texto) {
  let acordes = 0, partes = 0;
  const out = [];
  for (const bruta of String(texto).split(/\r?\n/)) {
    const l = bruta.trim();
    const soAcordes = s => { const toks = s.split(/\s+/).filter(Boolean); return toks.length > 0 && toks.every(t => ACORDE.test(t) || /^[|x\d()]+$/i.test(t)); };
    const sec = l.match(/^\[([^\]]+)\](.*)$/); // "[Intro] G D/F# Em" também é título de parte
    if (sec && (!sec[2].trim() || soAcordes(sec[2]))) { partes++; out.push('', '# ' + sec[1].trim()); continue; }
    if (soAcordes(l)) { acordes++; continue; }
    if (/^[EADGBe]\s*\|/.test(l) || /-{3,}/.test(l) || /^(tom|capotraste|afinação)\b/i.test(l)) { acordes++; continue; }
    out.push(l);
  }
  if (acordes < 2 && !partes) return null;
  return { texto: out.join('\n').replace(/\n{3,}/g, '\n\n').trim(), acordes };
}
const linhasDe = texto => interpretar(texto).itens.filter(x => x.k === 'linha').map(x => x.txt);

// ---------------- dados ----------------
const CHAVE = 'mapabateria.v1';
let dados;
try { dados = JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { dados = {}; }
dados.locais ||= {}; dados.ocultas ||= []; dados.listas ||= []; dados.prefs ||= {}; dados.listasApagadas ||= [];
// ensaios que vêm no musicas.js entram na lista uma vez; dali em diante são editados como qualquer outro
function trazerListasDoSite() {
  (Array.isArray(window.LISTAS_DO_SITE) ? window.LISTAS_DO_SITE : []).forEach(l => {
    if (!dados.listas.some(x => x.id === l.id) && !dados.listasApagadas.includes(l.id)) dados.listas.push(JSON.parse(JSON.stringify(l)));
  });
}
trazerListasDoSite();
dados.prefs.escala ||= 1;
function gravarLocal() {
  try { localStorage.setItem(CHAVE, JSON.stringify(dados)); }
  catch (e) { aviso('Não deu para guardar no aparelho: ' + e.message); }
}
// mudou música ou lista: guarda no aparelho e manda para o site
function salvar() { dados.pendente = true; gravarLocal(); Nuvem.agendar(); }

// ---------------- nuvem: guarda tudo no site, atrás da senha do painel admin ----------------
// No aparelho fica sempre uma cópia (funciona sem internet). O que mudou sem internet sobe quando ela volta.
const Nuvem = {
  estado: 'desligada', // desligada (sem servidor) | entrar | ok | offline | erro
  timer: 0,
  pedir(caminho, opcoes = {}) {
    return fetch(caminho, { credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json' }, ...opcoes });
  },
  async carregar() {
    if (!location.protocol.startsWith('http')) return;
    let r;
    try { r = await this.pedir('/api/admin/data?k=bateria'); }
    catch { this.estado = 'offline'; return; }
    if (r.status === 401) { this.estado = 'entrar'; return; }
    let j = null;
    try { j = r.ok ? await r.json() : null; } catch {}
    if (!j || !('bateria' in j)) { this.estado = 'desligada'; return; }
    this.estado = 'ok';
    if (dados.pendente || !j.bateria) { await this.enviar(); return; }
    const b = j.bateria;
    dados.locais = Object.fromEntries((b.musicas || []).map(m => [m.id, m]));
    dados.listas = b.listas || [];
    dados.ocultas = b.ocultas || [];
    dados.listasApagadas = b.listasApagadas || dados.listasApagadas;
    trazerListasDoSite();
    gravarLocal();
  },
  agendar() {
    if (this.estado === 'desligada' || this.estado === 'entrar') return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.enviar(), 1200);
  },
  async enviar() {
    const corpo = { key: 'bateria', data: { musicas: Object.values(dados.locais), listas: dados.listas, ocultas: dados.ocultas, listasApagadas: dados.listasApagadas } };
    try {
      const r = await this.pedir('/api/admin/save', { method: 'POST', body: JSON.stringify(corpo) });
      if (r.status === 401) this.estado = 'entrar';
      else if (r.status === 413) { this.estado = 'erro'; aviso('Coisa demais para guardar no site. Apague músicas que não usa.'); }
      else if (!r.ok) this.estado = 'erro';
      else { dados.pendente = false; gravarLocal(); this.estado = 'ok'; }
    } catch { this.estado = 'offline'; }
    mostrarNuvem();
  },
  async entrar(senha) {
    let r;
    try { r = await this.pedir('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: senha }) }); }
    catch { return 'Sem internet.'; }
    if (r.status === 401) return 'Senha errada.';
    if (!r.ok) return 'O site não aceitou agora. Tente de novo.';
    await this.carregar();
    return '';
  },
};
window.addEventListener('online', () => { if (Nuvem.estado === 'offline') Nuvem.carregar().then(mostrarNuvem); });
function mostrarNuvem() {
  const el = $('#nuvem'); if (!el) return;
  const txt = {
    ok: dados.pendente ? 'Guardando no site…' : 'Tudo guardado no site. Abra lhartdesign.com/bateria em qualquer aparelho.',
    offline: 'Sem internet. Está tudo guardado neste aparelho e sobe para o site quando a internet voltar.',
    erro: 'O site não respondeu. Está guardado neste aparelho; tento de novo na próxima mudança.',
    entrar: 'Entre com a senha do painel da Lhart para guardar no site e abrir em qualquer aparelho.',
    desligada: 'Guardado só neste aparelho.',
  }[Nuvem.estado];
  el.querySelector('.status').textContent = txt;
  el.querySelector('form').hidden = Nuvem.estado !== 'entrar';
}
const doSite = () => Array.isArray(window.MUSICAS_DO_SITE) ? window.MUSICAS_DO_SITE : [];
function todas() {
  const mapa = new Map();
  doSite().forEach(m => { if (!dados.ocultas.includes(m.id)) mapa.set(m.id, { ...m, origem: 'site' }); });
  Object.values(dados.locais).forEach(m => mapa.set(m.id, { ...m, origem: mapa.has(m.id) ? 'editada' : 'aparelho' }));
  return [...mapa.values()].sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '', 'pt'));
}
const pegar = id => todas().find(m => m.id === id);
function guardar(m) { const c = JSON.parse(JSON.stringify(m)); delete c.origem; dados.locais[m.id] = c; salvar(); }
function apagarMusica(id) {
  delete dados.locais[id];
  dados.listas.forEach(l => { l.musicas = l.musicas.filter(x => x !== id); });
  if (doSite().some(m => m.id === id) && !dados.ocultas.includes(id)) dados.ocultas.push(id);
  salvar(); Banco.del(id);
}

const Banco = {
  db: null,
  abrir() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((ok, erro) => {
      const r = indexedDB.open('mapabateria', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('audios');
      r.onsuccess = () => ok(this.db = r.result);
      r.onerror = () => erro(r.error);
    });
  },
  async op(modo, fn) {
    const db = await this.abrir();
    return new Promise((ok, erro) => {
      const tx = db.transaction('audios', modo);
      const r = fn(tx.objectStore('audios'));
      tx.oncomplete = () => ok(r && r.result);
      tx.onerror = () => erro(tx.error);
    });
  },
  get(id) { return this.op('readonly', s => s.get(id)).catch(() => null); },
  put(id, blob) { return this.op('readwrite', s => s.put(blob, id)); },
  del(id) { return this.op('readwrite', s => s.delete(id)).catch(() => {}); },
};

let avisoTimer;
function aviso(txt, ms = 4500) {
  const el = $('#aviso'); el.textContent = txt; el.hidden = false;
  clearTimeout(avisoTimer); avisoTimer = setTimeout(() => { el.hidden = true; }, ms);
}
function baixar(nome, conteudo, tipo = 'text/javascript') {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a'); a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
document.documentElement.style.setProperty('--escala', dados.prefs.escala);
if (dados.prefs.volume == null) dados.prefs.volume = 80;
if (dados.prefs.clique == null) dados.prefs.clique = 70;

// ---------------- fonte da música: mp3 (aparelho ou site) ou vídeo do YouTube ----------------
// as duas têm a mesma cara: play, pause, t (segundos), duracao, tocando, volume(0..1), destruir
let ctxAudio = null;
function fonteAudio(src) {
  const a = new Audio(src); a.preload = 'auto';
  // o iPhone ignora audio.volume; passando por um GainNode o volume funciona em todo lugar.
  // só dá para fazer isso com áudio do próprio site (ou do aparelho), senão sai mudo.
  const mesmaOrigem = src.startsWith('blob:') || new URL(src, location.href).origin === location.origin;
  let ganho = null;
  const f = {
    tipo: 'audio', vol: 1,
    async play() {
      if (ganho === null) {
        try {
          if (!mesmaOrigem) throw 0;
          ctxAudio ||= new (window.AudioContext || window.webkitAudioContext)();
          ganho = ctxAudio.createGain();
          ctxAudio.createMediaElementSource(a).connect(ganho).connect(ctxAudio.destination);
          ganho.gain.value = f.vol;
        } catch { ganho = false; a.volume = f.vol; }
      }
      if (ctxAudio && ctxAudio.state === 'suspended') await ctxAudio.resume();
      await a.play();
    },
    pause() { a.pause(); },
    get t() { return a.currentTime; }, set t(v) { a.currentTime = v; },
    get duracao() { return isFinite(a.duration) ? a.duration : 0; },
    get tocando() { return !a.paused; },
    volume(v) { f.vol = v; if (ganho) ganho.gain.value = v; else a.volume = v; },
    aoTerminar(cb) { a.addEventListener('ended', cb); },
    aoErro(cb) { a.addEventListener('error', cb); },
    destruir() { a.pause(); a.removeAttribute('src'); a.load(); },
  };
  return f;
}
const idYouTube = u => {
  const s = String(u || '').trim();
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/);
  return m ? m[1] : null;
};
let ytPronto = null;
function carregarYT() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (!ytPronto) ytPronto = new Promise((ok, erro) => {
    const antes = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (antes) antes(); ok(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { ytPronto = null; s.remove(); erro(new Error('sem internet')); };
    document.head.appendChild(s);
  });
  return ytPronto;
}
async function fonteYouTube(id, caixa) {
  await carregarYT();
  return new Promise((ok, erro) => {
    let aoFim = () => {}, tocando = false;
    const alvo = document.createElement('div');
    caixa.replaceChildren(alvo);
    const f = {
      tipo: 'youtube',
      async play() { p.playVideo(); },
      pause() { p.pauseVideo(); },
      get t() { return p.getCurrentTime ? p.getCurrentTime() : 0; }, set t(v) { p.seekTo(v, true); },
      get duracao() { return p.getDuration ? p.getDuration() : 0; },
      get tocando() { return tocando; },
      volume(v) { if (p.setVolume) p.setVolume(Math.round(v * 100)); },
      aoTerminar(cb) { aoFim = cb; }, aoErro() {},
      destruir() { try { p.destroy(); } catch {} },
    };
    const p = new YT.Player(alvo, {
      videoId: id, width: '100%', height: '100%',
      playerVars: { playsinline: 1, rel: 0 },
      events: {
        onReady: () => ok(f),
        onError: () => erro(new Error('vídeo indisponível')),
        onStateChange: e => { tocando = e.data === 1 || e.data === 3; if (e.data === 0) aoFim(); },
      },
    });
  });
}
// escolhe a fonte da música: mp3 guardado no aparelho > mp3 do site > YouTube
async function abrirFonte(m, caixa) {
  const blob = await Banco.get(m.id);
  if (blob) {
    const url = URL.createObjectURL(blob), f = fonteAudio(url), d = f.destruir;
    f.destruir = () => { d(); URL.revokeObjectURL(url); };
    return f;
  }
  if (m.audioUrl) return fonteAudio(m.audioUrl);
  const id = idYouTube(m.youtube);
  if (id && caixa) {
    caixa.hidden = false;
    try { return await fonteYouTube(id, caixa); }
    catch { caixa.hidden = true; aviso('Não consegui abrir o vídeo do YouTube. Precisa de internet e de um link válido.'); }
  }
  return null;
}

// ---------------- tempos ----------------
function interpolar(t, n) {
  const idx = []; for (let i = 0; i < n; i++) if (typeof t[i] === 'number') idx.push(i);
  const a0 = idx[0], a1 = idx[idx.length - 1];
  const media = (t[a1] - t[a0]) / Math.max(1, a1 - a0) || 4;
  const r = new Array(n);
  for (let i = 0; i < n; i++) {
    if (typeof t[i] === 'number') { r[i] = t[i]; continue; }
    let a, b;
    for (const j of idx) { if (j < i) a = j; else if (b === undefined) b = j; }
    if (a !== undefined && b !== undefined) r[i] = t[a] + (t[b] - t[a]) * (i - a) / (b - a);
    else if (a !== undefined) r[i] = t[a] + media * (i - a);
    else r[i] = Math.max(0, t[b] - media * (b - i));
  }
  return r;
}
// tempos marcados (com buracos preenchidos) ou, sem eles, uma linha a cada N compassos pelo BPM
function temposEfetivos(m, n) {
  const t = (m.tempos || []).slice(0, n);
  if (t.filter(x => typeof x === 'number').length >= 2) return { tempos: interpolar(t, n), marcados: true };
  if (m.bpm > 0 && n) {
    const passo = (m.compassos || 2) * 4 * 60 / m.bpm, ini = m.primeiroSom || 0;
    return { tempos: Array.from({ length: n }, (_, i) => ini + i * passo), marcados: false };
  }
  return { tempos: null, marcados: false };
}
// ao editar a letra, cada linha que continua igual mantém o tempo que já tinha
function remapear(velho, novo, tempos) {
  if (!tempos || !tempos.length) return [];
  const a = linhasDe(velho), b = linhasDe(novo), r = new Array(b.length).fill(null);
  let j = 0;
  for (let i = 0; i < b.length; i++) {
    for (let k = j; k < a.length; k++) if (a[k] === b[i]) { r[i] = tempos[k] ?? null; j = k + 1; break; }
  }
  return r;
}

// ---------------- análise do áudio ----------------
async function analisarAudio(blob) {
  const SR = 11025;
  const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const ctx = new Ctx(1, SR, SR);
  const bytes = await blob.arrayBuffer();
  const ab = await new Promise((ok, erro) => {
    const p = ctx.decodeAudioData(bytes, ok, erro);
    if (p && p.then) p.then(ok, erro);
  });
  const sr = ab.sampleRate, n = ab.length, nc = ab.numberOfChannels;
  const x = new Float32Array(n);
  for (let c = 0; c < nc; c++) { const d = ab.getChannelData(c); for (let i = 0; i < n; i++) x[i] += d[i] / nc; }

  const hop = Math.round(sr * 0.0232), nf = Math.floor(n / hop), fps = sr / hop;
  const env = new Float32Array(nf);
  for (let f = 0; f < nf; f++) {
    let s = 0; const o = f * hop;
    for (let i = 0; i < hop; i++) { const v = x[o + i]; s += v * v; }
    env[f] = Math.sqrt(s / hop);
  }
  // intensidade a cada meio segundo, suavizada
  const por = Math.max(1, Math.round(0.5 * fps)), nb = Math.ceil(nf / por);
  let bruta = [];
  for (let b = 0; b < nb; b++) {
    let s = 0, c = 0;
    for (let f = b * por; f < Math.min(nf, (b + 1) * por); f++) { s += env[f]; c++; }
    bruta.push(c ? s / c : 0);
  }
  const suave = bruta.map((_, i) => {
    let s = 0, c = 0;
    for (let k = i - 1; k <= i + 1; k++) if (k >= 0 && k < nb) { s += bruta[k]; c++; }
    return s / c;
  });
  const ord = [...suave].sort((a, b) => a - b);
  const p95 = ord[Math.floor(ord.length * 0.95)] || 1;
  const energia = suave.map(v => Math.round(Math.min(1, v / p95) * 100) / 100);

  const limite = 0.1 * p95;
  let primeiro = 0;
  for (let f = 0; f < nf; f++) if (env[f] > limite) { primeiro = f / fps; break; }

  // BPM: autocorrelação dos ataques
  const lg = Array.from(env, v => Math.log(1 + 1000 * v));
  const flux = new Float32Array(nf);
  for (let f = 1; f < nf; f++) flux[f] = Math.max(0, lg[f] - lg[f - 1]);
  const jan = 16, sem = new Float32Array(nf);
  let soma = 0;
  for (let f = 0; f < nf; f++) {
    soma += flux[f]; if (f >= jan) soma -= flux[f - jan];
    sem[f] = Math.max(0, flux[f] - soma / Math.min(f + 1, jan));
  }
  const lMin = Math.floor(fps * 60 / 200), lMax = Math.ceil(fps * 60 / 50);
  const r = [];
  for (let L = lMin; L <= lMax; L++) {
    let s = 0; for (let f = 0; f + L < nf; f++) s += sem[f] * sem[f + L];
    const bpm = 60 * fps / L, w = Math.exp(-0.5 * (Math.log2(bpm / 105) / 0.9) ** 2);
    r.push({ L, s, p: s * w });
  }
  let melhor = 0;
  r.forEach((v, i) => { if (v.p > r[melhor].p) melhor = i; });
  let Lf = r[melhor].L;
  if (melhor > 0 && melhor < r.length - 1) {
    const a = r[melhor - 1].s, b = r[melhor].s, c = r[melhor + 1].s, den = a - 2 * b + c;
    if (den) Lf += 0.5 * (a - c) / den;
  }
  return { bpm: Math.round(60 * fps / Lf), energia, duracao: n / sr, primeiroSom: Math.round(primeiro * 100) / 100 };
}

function desenharEnergia(cv, m, t, marcas) {
  const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (!w) return;
  if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const css = getComputedStyle(document.documentElement), cor = v => css.getPropertyValue(v).trim();
  const dur = m.duracao || 0, e = m.energia;
  if (e && e.length && dur) {
    const passo = w / e.length;
    g.fillStyle = cor('--c-desce');
    for (let i = 0; i < e.length; i++) {
      const bh = Math.max(1, e[i] * (h - 4));
      g.globalAlpha = t != null && (i + 0.5) / e.length * dur <= t ? 0.95 : 0.4;
      g.fillRect(i * passo, h - bh, Math.max(1, passo - 0.4), bh);
    }
    g.globalAlpha = 1;
  }
  if (marcas && dur) { g.fillStyle = cor('--muted'); marcas.forEach(x => { if (x != null) g.fillRect(x / dur * w, 0, 1, 5); }); }
  if (t != null && dur) { g.fillStyle = cor('--c-prato'); g.fillRect(Math.min(w - 2, t / dur * w), 0, 2, h); }
}

// ---------------- sugestões de marcação ----------------
// sugestoes: Map(índice da linha de letra -> ['! ...']); finais: linhas que vão no fim
function inserirDeixas(texto, sugestoes, finais) {
  const out = []; let n = 0, inseridas = 0;
  const ultimaCheia = () => { for (let k = out.length - 1; k >= 0; k--) if (out[k].trim()) return out[k].trim(); return ''; };
  for (const l of String(texto).split(/\r?\n/)) {
    const t = l.trim();
    if (t && !t.startsWith('#') && !ehDeixa(t)) {
      const s = sugestoes.get(n);
      if (s && !ehDeixa(ultimaCheia())) { out.push(...s); inseridas += s.length; }
      n++;
    }
    out.push(l);
  }
  if (finais && finais.length && !ehDeixa(ultimaCheia())) { out.push(...finais); inseridas += finais.length; }
  return { texto: out.join('\n'), inseridas };
}
function sugerirPelaLetra(texto) {
  const blocos = []; let atual = null, n = 0;
  for (const l of String(texto).split(/\r?\n/)) {
    const t = l.trim();
    if (!t || t.startsWith('#')) { atual = null; continue; }
    if (ehDeixa(t)) continue;
    if (!atual) { atual = { ini: n, linhas: [] }; blocos.push(atual); }
    atual.linhas.push(semAcento(t).replace(/[^\w\s]/g, '').trim()); n++;
  }
  if (blocos.length < 2) return null;
  const cont = new Map();
  blocos.forEach(b => b.linhas.forEach(l => cont.set(l, (cont.get(l) || 0) + 1)));
  const refrao = blocos.map(b => b.linhas.filter(l => cont.get(l) > 1).length >= b.linhas.length / 2);
  const s = new Map();
  blocos.forEach((b, j) => {
    if (j === 0) { if (!refrao[0]) s.set(b.ini, ['! entra leve, chimbal fechado e aro']); return; }
    if (refrao[j] && !refrao[j - 1]) s.set(b.ini, ['! virada e prato', '! sobe condução no prato, bumbo cheio']);
    else if (refrao[j] && refrao[j - 1]) s.set(b.ini, ['! virada curta, segue cheio']);
    else if (!refrao[j] && refrao[j - 1]) s.set(b.ini, ['! desce só bumbo e chimbal']);
    else if (refrao[j + 1]) s.set(b.ini, ['! sobe caixa e tom']);
  });
  return { sugestoes: s, finais: ['! corte final no prato'] };
}
function sugerirPeloAudio(m, texto) {
  const n = linhasDe(texto).length;
  const { tempos, marcados } = temposEfetivos({ ...m, tempos: m.tempos }, n);
  if (!marcados || !m.energia || !m.duracao) return null;
  const e = m.energia, dt = m.duracao / e.length;
  const media = (a, b) => {
    const i0 = Math.max(0, Math.floor(a / dt)), i1 = Math.min(e.length, Math.ceil(b / dt));
    let s = 0, c = 0; for (let i = i0; i < i1; i++) { s += e[i]; c++; } return c ? s / c : 0;
  };
  const achados = [];
  for (let i = 0; i < n; i++) {
    const t = tempos[i], antes = media(t - 4, t - 0.5), depois = media(t + 0.3, t + 4);
    const forca = Math.abs(depois - antes);
    if (depois < 0.15 && antes > 0.3) achados.push({ i, rumo: -1, forca, cue: '! corte' });
    else if (depois - antes > 0.12 && depois / Math.max(antes, 0.05) >= 1.4)
      achados.push({ i, rumo: 1, forca, cue: depois > 0.75 ? '! virada e prato, entra cheio' : '! sobe caixa e tom' });
    else if (antes - depois > 0.12 && depois / Math.max(antes, 0.05) <= 0.7) achados.push({ i, rumo: -1, forca, cue: '! desce' });
  }
  // a mesma subida (ou descida) aparece em linhas vizinhas: fica só a mais forte
  const s = new Map(); let ult = null;
  for (const a of achados) {
    if (ult && a.rumo === ult.rumo && a.i - ult.i <= 2) {
      if (a.forca > ult.forca) { s.delete(ult.i); s.set(a.i, [a.cue]); ult = a; }
      continue;
    }
    s.set(a.i, [a.cue]); ult = a;
  }
  const fimLetra = tempos[n - 1] || 0;
  const finais = media(fimLetra + 2, m.duracao) < 0.25 ? ['! corte final'] : [];
  return { sugestoes: s, finais };
}

// ---------------- telas ----------------
let P = null; // estado do palco
function pararTudo() {
  if (!P) return;
  P.ativo = false;
  cancelAnimationFrame(P.raf);
  if (P.fonte) P.fonte.destruir();
  if (P.pararClique) P.pararClique();
  app.classList.remove('tocando');
  pararMic();
  try { P.lock && P.lock.release(); } catch {}
  P = null;
}
function rota() {
  pararTudo();
  const [, tipo, id, extra] = (location.hash.slice(1) || '/').split('/');
  if (tipo === 'm' && id) telaPalco(decodeURIComponent(id), extra ? decodeURIComponent(extra) : null);
  else if (tipo === 'l' && id) telaEnsaio(decodeURIComponent(id));
  else if (tipo === 'e') telaEditor(id ? decodeURIComponent(id) : 'novo', extra ? decodeURIComponent(extra) : null);
  else telaLista();
}
window.addEventListener('hashchange', rota);

function resumo(m) {
  const p = [];
  if (m.artista) p.push(m.artista);
  if (m.bpm) p.push(`${m.bpm} BPM`);
  const marc = (m.tempos || []).filter(x => typeof x === 'number').length;
  p.push(marc >= 2 ? 'rola sozinha' : m.bpm ? 'rola pelo BPM' : 'rolagem manual');
  if (m.origem === 'aparelho') p.push('só neste aparelho');
  if (m.origem === 'editada') p.push('editada neste aparelho');
  return p.join(', ');
}

function telaLista() {
  const lista = todas();
  app.innerHTML = `
    <header class="topo"><h1 class="marca">${ICONE.marca}Mapa de Bateria</h1>
      <a class="btn primario" href="#/e/novo">Nova música</a></header>
    <main class="rolagem">
      <section class="grupo">
        <div class="grupo-topo"><h2>Ensaios</h2><button class="btn" id="nova-lista">Novo ensaio</button></div>
        ${dados.listas.length ? `<ul class="musicas">${dados.listas.map(l => `
          <li><a href="#/l/${encodeURIComponent(l.id)}"><span class="t">${esc(l.nome)}</span>
          <span class="sub">${l.musicas.length} música${l.musicas.length === 1 ? '' : 's'}</span></a></li>`).join('')}</ul>`
        : '<p class="dica">Monte a lista do ensaio em casa; lá é só abrir e tocar na ordem.</p>'}
      </section>
      <section class="grupo"><div class="grupo-topo"><h2>Músicas</h2></div>
      ${lista.length ? `<ul class="musicas">${lista.map(m => `
        <li><a href="#/m/${encodeURIComponent(m.id)}"><span class="t">${esc(m.titulo || 'Sem nome')}</span>
        <span class="sub">${esc(resumo(m))}</span></a></li>`).join('')}</ul>`
      : '<p class="vazio">Nenhuma música ainda. Toque em Nova música e cole a letra.</p>'}
      </section>
      <section class="ferramentas" id="nuvem">
        <h2>Guardar no site</h2>
        <p class="status"></p>
        <form class="entrar" hidden>
          <label class="campo">Senha do painel<input type="password" id="senha" autocomplete="current-password"></label>
          <button class="btn primario" type="submit">Entrar</button>
        </form>
      </section>
      <section class="ferramentas">
        <h2>Cópia de segurança</h2>
        <p>Baixa todas as músicas num arquivo. "Importar" traz de volta.</p>
        <div class="acoes">
          <button class="btn" id="exportar">Baixar musicas.js</button>
          <label class="btn">Importar arquivo<input type="file" id="importar" accept=".js,.json,application/json,text/javascript" hidden></label>
        </div>
      </section>
    </main>`;
  mostrarNuvem();
  $('#nuvem form').onsubmit = async ev => {
    ev.preventDefault();
    const erro = await Nuvem.entrar($('#senha').value);
    if (erro) { aviso(erro); return; }
    aviso('Pronto. Agora fica tudo guardado no site.');
    telaLista();
  };
  $('#nova-lista').onclick = () => {
    const l = { id: 'l' + Date.now().toString(36), nome: 'Ensaio ' + new Date().toLocaleDateString('pt-BR'), musicas: [] };
    dados.listas.unshift(l); salvar();
    location.hash = '#/l/' + encodeURIComponent(l.id);
  };
  $('#exportar').onclick = () => {
    const musicas = todas().map(({ origem, temAudio, ...m }) => m);
    const dia = new Date().toISOString().slice(0, 10);
    baixar(`mapa-bateria-${dia}.json`, JSON.stringify({ musicas, listas: dados.listas }, null, 1), 'application/json');
  };
  $('#importar').onchange = async ev => {
    const f = ev.target.files[0]; if (!f) return;
    try {
      const txt = await f.text();
      const ini = txt.search(/[[{]/), fim = Math.max(txt.lastIndexOf(']'), txt.lastIndexOf('}'));
      let lido = JSON.parse(txt.slice(ini, fim + 1));
      // aceita a cópia nova ({musicas, listas}), o musicas.js antigo (lista) ou uma música só
      const musicas = Array.isArray(lido) ? lido : Array.isArray(lido.musicas) ? lido.musicas : [lido];
      const boas = musicas.filter(m => m && m.id && typeof m.texto === 'string');
      boas.forEach(m => { dados.locais[m.id] = m; dados.ocultas = dados.ocultas.filter(x => x !== m.id); });
      (lido.listas || []).forEach(l => { if (l && l.id && !dados.listas.some(x => x.id === l.id)) dados.listas.push(l); });
      if (!boas.length) throw 0;
      salvar(); aviso(`${boas.length} música(s) importada(s).`); telaLista();
    } catch { aviso('Esse arquivo não tem músicas do Mapa de Bateria.'); }
  };
}

// ---------------- ensaio: a lista de músicas na ordem ----------------
function telaEnsaio(id) {
  const l = dados.listas.find(x => x.id === id);
  if (!l) { location.hash = '#/'; return; }
  const desenhar = () => {
    const mapa = new Map(todas().map(m => [m.id, m]));
    l.musicas = l.musicas.filter(mid => mapa.has(mid));
    const fora = todas().filter(m => !l.musicas.includes(m.id));
    const abrir = mid => `#/m/${encodeURIComponent(mid)}/${encodeURIComponent(l.id)}`;
    app.innerHTML = `
      <header class="topo"><a class="btn icone" href="#/" aria-label="Voltar">${ICONE.voltar}</a><h1>${esc(l.nome)}</h1>
        ${l.musicas.length ? `<a class="btn primario" href="${abrir(l.musicas[0])}">Começar</a>` : ''}</header>
      <main class="rolagem editor">
        <label class="campo">Nome do ensaio<input id="l-nome" autocomplete="off"></label>
        ${l.musicas.length ? `<ol class="setlist">${l.musicas.map((mid, i) => `
          <li><a href="${abrir(mid)}">${esc(mapa.get(mid).titulo || 'Sem nome')}</a>
            <button class="btn icone" data-mover="${i},-1" aria-label="Subir" ${i === 0 ? 'disabled' : ''}>${ICONE.anterior}</button>
            <button class="btn icone" data-mover="${i},1" aria-label="Descer" ${i === l.musicas.length - 1 ? 'disabled' : ''}>${ICONE.proxima}</button>
            <button class="btn icone perigo" data-tirar="${i}" aria-label="Tirar do ensaio">${ICONE.fechar}</button></li>`).join('')}</ol>`
        : '<p class="vazio">Ensaio vazio. Toque nas músicas abaixo para colocar na lista.</p>'}
        <section class="bloco"><h2>Colocar no ensaio</h2>
          ${fora.length ? `<ul class="adicionar">${fora.map(m => `<li><button class="btn" data-por="${esc(m.id)}">${ICONE.mais}${esc(m.titulo || 'Sem nome')}</button></li>`).join('')}</ul>`
          : '<p class="dica">Todas as músicas já estão neste ensaio.</p>'}
        </section>
        <button class="btn perigo apagar" id="l-apagar" type="button">Apagar este ensaio</button>
      </main>`;
    const nome = $('#l-nome');
    nome.value = l.nome;
    nome.oninput = () => { l.nome = nome.value.trim() || 'Ensaio'; $('.topo h1').textContent = l.nome; salvar(); };
    app.querySelectorAll('[data-mover]').forEach(b => b.onclick = () => {
      const [i, d] = b.dataset.mover.split(',').map(Number);
      [l.musicas[i], l.musicas[i + d]] = [l.musicas[i + d], l.musicas[i]];
      salvar(); desenhar();
    });
    app.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => { l.musicas.splice(+b.dataset.tirar, 1); salvar(); desenhar(); });
    app.querySelectorAll('[data-por]').forEach(b => b.onclick = () => { l.musicas.push(b.dataset.por); salvar(); desenhar(); });
    $('#l-apagar').onclick = () => {
      if (!confirm(`Apagar o ensaio "${l.nome}"? As músicas continuam.`)) return;
      dados.listas = dados.listas.filter(x => x !== l);
      if (!dados.listasApagadas.includes(l.id)) dados.listasApagadas.push(l.id);
      salvar(); location.hash = '#/';
    };
  };
  desenhar();
}

function renderItens(itens) {
  return itens.map(it => {
    if (it.k === 'secao') return `<h2 class="secao">${esc(it.txt)}</h2>`;
    if (it.k === 'deixa') return `<div class="deixa" style="--cor:var(--c-${it.tipo})">${ICONE[it.tipo]}<span>${esc(it.txt)}</span></div>`;
    if (it.k === 'linha') return `<p class="linha" data-i="${it.i}">${esc(it.txt)}</p>`;
    return '<div class="espaco"></div>';
  }).join('');
}

async function telaPalco(id, listaId) {
  const m = pegar(id);
  if (!m) { location.hash = '#/'; return; }
  // aberta de dentro de um ensaio: mostra a posição e leva para a música seguinte
  const ensaio = listaId ? dados.listas.find(x => x.id === listaId) : null;
  const pos = ensaio ? ensaio.musicas.indexOf(m.id) : -1;
  const vizinha = d => {
    const mid = ensaio && ensaio.musicas[pos + d], v = mid && pegar(mid);
    return v ? { href: `#/m/${encodeURIComponent(mid)}/${encodeURIComponent(ensaio.id)}`, titulo: v.titulo || 'Sem nome' } : null;
  };
  const antes = vizinha(-1), depois = vizinha(1);
  const barraEnsaio = pos < 0 ? '' : `
    <nav class="ensaio-barra" aria-label="Ensaio">
      ${antes ? `<a class="btn icone" href="${antes.href}" aria-label="Música anterior: ${esc(antes.titulo)}">${ICONE.voltar}</a>` : '<span class="btn icone" aria-hidden="true"></span>'}
      <a class="onde" href="#/l/${encodeURIComponent(ensaio.id)}">Música ${pos + 1} de ${ensaio.musicas.length}</a>
      ${depois ? `<a class="btn depois" href="${depois.href}"><span>${esc(depois.titulo)}</span>${ICONE.seguir}</a>` : '<span class="fim-ensaio">Última</span>'}
    </nav>`;
  const { itens, nLinhas } = interpretar(m.texto);
  // cada marcação aponta para a linha de letra que vem logo depois dela
  const deixas = []; let pend = [];
  itens.forEach(it => {
    if (it.k === 'deixa') pend.push(it);
    if (it.k === 'linha') { pend.forEach(d => deixas.push({ ...d, alvo: it.i })); pend = []; }
  });
  pend.forEach(d => deixas.push({ ...d, alvo: nLinhas }));

  app.innerHTML = `
    <header class="topo"><a class="btn icone" href="${ensaio ? '#/l/' + encodeURIComponent(ensaio.id) : '#/'}" aria-label="Voltar">${ICONE.voltar}</a>
      <h1>${esc(m.titulo || 'Sem nome')}</h1><a class="btn" href="#/e/${encodeURIComponent(m.id)}${ensaio ? '/' + encodeURIComponent(ensaio.id) : ''}">Editar</a></header>
    ${barraEnsaio}
    <canvas class="faixa" id="faixa" aria-label="Intensidade da música; toque para pular"></canvas>
    <main class="rolagem palco" id="palco"><div class="yt" id="yt" hidden></div>${nLinhas ? renderItens(itens)
      : `<p class="vazio">Esta música ainda não tem letra. Dá para ouvir com o clique; para a letra aparecer, toque em <a href="#/e/${encodeURIComponent(m.id)}${ensaio ? '/' + encodeURIComponent(ensaio.id) : ''}">Editar</a> e cole.</p>`}<div class="fim"></div></main>
    <footer class="controle">
      <div class="proxima" id="proxima" aria-live="polite"></div>
      <div class="botoes">
        <button class="btn icone" id="ant" aria-label="Linha anterior">${ICONE.anterior}</button>
        <button class="btn primario grande" id="play"></button>
        <button class="btn icone" id="prox" aria-label="Próxima linha">${ICONE.proxima}</button>
      </div>
      <div class="opcoes">
        <div class="seg" role="group" aria-label="Como a letra anda">
          <button data-modo="audio" title="Toca a música (mp3 ou YouTube) e a letra acompanha">Música</button><button data-modo="tempo" title="Cronômetro: anda pelos tempos marcados, sem tocar som">Tempo</button><button data-modo="manual">Manual</button>
        </div>
        <button class="btn" id="ouvir" title="Liga o microfone e começa o cronômetro quando a banda tocar">${ICONE.mic}<span>Ouvir</span><span class="medidor" hidden><i></i></span></button>
        <button class="btn" id="abrir-som" aria-expanded="${!!dados.prefs.somAberto}" aria-controls="som">${ICONE.som}<span>Som</span></button>
        <span class="espacador"></span>
        <button class="btn icone" id="menor" aria-label="Letra menor">A−</button>
        <button class="btn icone" id="maior" aria-label="Letra maior">A+</button>
      </div>
      <div class="som" id="som" ${dados.prefs.somAberto ? '' : 'hidden'}>
        <label class="vol" id="vol-caixa" hidden>${ICONE.som}<span class="rotulo">Música</span>
          <input type="range" id="vol" min="0" max="100" step="1"><output id="vol-num"></output></label>
        <div class="vol">
          <button class="btn" id="clique" aria-pressed="false">${ICONE.clique}<span>Clique</span></button>
          <input type="range" id="vol-clique" min="0" max="100" step="1" aria-label="Volume do clique"><output id="vol-clique-num"></output>
        </div>
        <div class="clique-ajuste">
          <button class="btn icone" id="bpm-menos" type="button" aria-label="BPM mais lento">−</button>
          <span class="bpm" id="bpm-num"></span>
          <button class="btn icone" id="bpm-mais" type="button" aria-label="BPM mais rápido">+</button>
          <button class="btn" id="bater1" type="button">Bater no 1</button>
        </div>
        <button class="btn bater-tempo" id="bater-tempo" type="button">Bater o tempo junto com a música</button>
        <p class="dica" id="clique-info"></p>
      </div>
    </footer>`;

  const palco = $('#palco'), faixa = $('#faixa'), proxima = $('#proxima');
  const linhasEl = [...palco.querySelectorAll('.linha')];
  const { tempos, marcados } = temposEfetivos(m, nLinhas);
  P = { ativo: true, m, tempos, fonte: null, modo: 'manual', tocando: false, base: 0, t0: 0, atual: -1, raf: 0 };
  const pode = { audio: false, tempo: !!tempos, manual: true };

  const tempoAtual = () => P.modo === 'audio' && P.fonte ? P.fonte.t
    : P.tocando ? P.base + (agora() - P.t0) / 1000 : P.base;
  const duracao = () => m.duracao || (P.fonte && P.fonte.duracao) || (tempos ? tempos[nLinhas - 1] + 8 : 0);

  function desenhar() {
    desenharEnergia(faixa, { ...m, duracao: duracao() }, P.modo === 'manual' ? null : tempoAtual(), tempos);
  }
  function mostrarProxima() {
    const a = P.atual, prox = deixas.filter(d => d.alvo > a);
    if (!prox.length) { proxima.innerHTML = ''; proxima.className = 'proxima'; return; }
    const alvo = prox[0].alvo, grupo = prox.filter(d => d.alvo === alvo), dist = alvo - a;
    let quando = alvo >= nLinhas ? 'no fim' : dist === 1 ? 'na próxima linha' : `em ${dist} linhas`;
    if (P.tocando && tempos && alvo < nLinhas) quando += `, ${Math.max(0, Math.ceil(tempos[alvo] - tempoAtual()))} s`;
    proxima.className = 'proxima' + (dist === 1 ? ' ja' : '');
    proxima.innerHTML = `<span>Próxima:</span>${grupo.map(d => `<span class="mini" style="--cor:var(--c-${d.tipo})">${ICONE[d.tipo]}${esc(d.txt)}</span>`).join('')}<span>${quando}</span>`;
  }
  function irPara(i, doUsuario) {
    i = Math.max(-1, Math.min(nLinhas - 1, i));
    if (doUsuario && tempos && i >= 0 && P.modo !== 'manual') {
      if (P.modo === 'audio') P.fonte.t = tempos[i];
      else { P.base = tempos[i]; P.t0 = agora(); }
      if (P.cliqueDoZero) P.cliqueDoZero();
    }
    if (i === P.atual) return;
    P.atual = i;
    linhasEl.forEach((el, k) => { el.classList.toggle('atual', k === i); el.classList.toggle('passada', k < i); });
    const el = linhasEl[Math.max(0, i)];
    if (el) palco.scrollTo({ top: Math.max(0, el.offsetTop - palco.offsetTop - palco.clientHeight * 0.3), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    mostrarProxima();
  }
  function laco() {
    if (!P || !P.ativo) return;
    // a música pode ser pausada pelo próprio player do YouTube: o botão segue o estado real
    if (P.modo === 'audio' && P.fonte && P.fonte.tocando !== P.tocando) {
      P.tocando = P.fonte.tocando; rotularPlay(); if (P.tocando) manterTela();
    }
    if (P.tocando && tempos && P.modo !== 'manual') {
      const t = tempoAtual() + 0.35; // um pouco adiantado: a marcação aparece antes de acontecer
      let i = -1; while (i + 1 < nLinhas && tempos[i + 1] <= t) i++;
      irPara(i, false);
      mostrarProxima();
    }
    desenhar();
    P.raf = requestAnimationFrame(laco);
  }
  function rotularPlay() {
    // tocando: a tela vira modo palco (só letra, próxima marcação e o botão de pausa)
    app.classList.toggle('tocando', P.tocando && P.modo !== 'manual');
    if (P.cliqueDoZero) P.cliqueDoZero();
    const b = $('#play');
    if (P.modo === 'manual') b.innerHTML = `${ICONE.proxima}<span>Próxima linha</span>`;
    else b.innerHTML = P.tocando ? `${ICONE.pause}<span>Pausar</span>` : `${ICONE.play}<span>Tocar</span>`;
  }
  async function tocar() {
    if (P.modo === 'manual') return irPara(P.atual + 1, true);
    if (P.modo === 'audio') {
      try { await P.fonte.play(); }
      catch { aviso('O navegador não deixou tocar. Toque de novo.'); return; }
      if (P.fonte.tipo === 'youtube') setTimeout(() => { if (P && P.fonte && !P.fonte.tocando && P.modo === 'audio') aviso('Se o vídeo não começou, toque nele uma vez. Depois o botão funciona.', 6000); }, 1500);
    }
    else P.t0 = agora();
    P.tocando = true; rotularPlay(); manterTela();
  }
  function pausar() {
    if (!P) return;
    if (P.modo === 'audio' && P.fonte) P.fonte.pause();
    else if (P.tocando) P.base = tempoAtual();
    P.tocando = false; rotularPlay(); mostrarProxima();
  }
  function trocarModo(modo) {
    if (!pode[modo]) return;
    const t = tempoAtual(); pausar();
    P.modo = modo;
    // só pula se precisar: no YouTube, pular um vídeo parado faz ele começar a tocar
    if (modo === 'audio') { if (Math.abs(P.fonte.t - t) > 0.5) P.fonte.t = t; } else P.base = t;
    app.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.modo === modo));
    rotularPlay(); desenhar();
  }
  P.comecarPeloSom = () => {
    // a banda começou: o cronômetro parte do primeiro som da gravação
    if (P.modo !== 'tempo') trocarModo('tempo');
    P.base = m.primeiroSom || (marcados ? 0 : (tempos ? tempos[0] : 0)); P.t0 = agora();
    P.tocando = true; rotularPlay(); manterTela(); aviso('Ouvi a banda. Rolando.');
  };

  function atualizarModos() {
    app.querySelectorAll('.seg button').forEach(b => {
      b.disabled = !pode[b.dataset.modo];
      b.setAttribute('aria-pressed', b.dataset.modo === P.modo);
      b.onclick = () => trocarModo(b.dataset.modo);
    });
    $('#ouvir').disabled = !pode.tempo;
    rotularPlay();
  }
  P.modo = pode.tempo ? 'tempo' : 'manual';
  atualizarModos();
  if (tempos && !marcados) aviso(`Rolando pelo BPM (${m.bpm}), ${m.compassos || 2} compassos por linha. Para ficar exato, marque os tempos em Editar.`, 6000);

  // ---- clique (metrônomo) ----
  // Segue o relógio da música que está tocando (mp3 ou YouTube); parado, segue sozinho no mesmo compasso.
  // O relógio do YouTube anda aos pulinhos, então o clique usa o relógio do áudio e só se corrige quando
  // a diferença passa de 0,12 s (pulo na música, travada da internet).
  const clique = { ligado: false, timer: 0, prox: -1e9, livre0: 0, ancora: null };
  const batidas = () => m.batidas || 4;
  const periodo = () => 60 / m.bpm;
  const ctxClique = () => {
    ctxAudio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctxAudio.state === 'suspended') ctxAudio.resume();
    return ctxAudio;
  };
  const andando = () => P.tocando && P.modo !== 'manual';
  function relogioClique() {
    const c = ctxAudio.currentTime;
    if (!andando()) return c - clique.livre0;
    const real = tempoAtual();
    if (!clique.ancora || Math.abs(clique.ancora.t + (c - clique.ancora.c) - real) > 0.12) clique.ancora = { t: real, c };
    return clique.ancora.t + (c - clique.ancora.c);
  }
  function cliqueDoZero() {
    clique.prox = -1e9; clique.ancora = null;
    if (ctxAudio) clique.livre0 = ctxAudio.currentTime - tempoAtual();
  }
  function bip(quando, forte) {
    const c = ctxAudio, o = c.createOscillator(), g = c.createGain();
    const v = Math.max(0.0002, (dados.prefs.clique / 100) * (forte ? 1 : 0.55));
    o.frequency.value = forte ? 1650 : 1050;
    g.gain.setValueAtTime(0.0001, quando);
    g.gain.exponentialRampToValueAtTime(v, quando + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, quando + 0.05);
    o.connect(g).connect(c.destination);
    o.start(quando); o.stop(quando + 0.06);
  }
  function agendarClique() {
    if (!clique.ligado || !P || P !== meuClique || !m.bpm) return;
    const t = relogioClique(), p = periodo(), fase = m.faseClique ?? (m.primeiroSom || 0), agoraCtx = ctxAudio.currentTime;
    let k = Math.ceil((t - fase) / p - 1e-6);
    if (k < clique.prox && clique.prox - k < 3) k = clique.prox; // não repete a batida já marcada
    for (; fase + k * p < t + 0.15; k++) {
      const em = fase + k * p;
      if (em >= 0) bip(agoraCtx + Math.max(0, em - t), ((k % batidas()) + batidas()) % batidas() === 0);
    }
    clique.prox = k;
    clique.timer = setTimeout(agendarClique, 40);
  }
  const meuClique = P;
  P.pararClique = () => { clique.ligado = false; clearTimeout(clique.timer); };
  P.cliqueDoZero = cliqueDoZero;
  function mostrarClique() {
    const b = $('#clique');
    b.disabled = !m.bpm;
    b.setAttribute('aria-pressed', clique.ligado);
    b.classList.toggle('ativo', clique.ligado);
    $('#bpm-num').textContent = m.bpm ? `${m.bpm} BPM` : 'sem BPM';
    $('#vol-clique-num').textContent = dados.prefs.clique;
    $('#clique-info').textContent = !m.bpm ? 'Informe o BPM (em Editar ou no + e −) para ligar o clique.'
      : (m.bpmConferir ? 'BPM tirado do mp3: pode estar na metade ou no dobro. Confira com "Bater o tempo". ' : '')
        + `${batidas()} tempos por compasso. Se o 1 estiver fora, toque "Bater no 1" junto com o primeiro tempo de um compasso.`;
  }
  function guardarAjuste() { const { origem, ...c } = m; dados.locais[m.id] = JSON.parse(JSON.stringify(c)); salvar(); }
  $('#vol-clique').value = dados.prefs.clique;
  $('#vol-clique').oninput = ev => { dados.prefs.clique = +ev.target.value; mostrarClique(); };
  $('#vol-clique').onchange = gravarLocal;
  $('#clique').onclick = () => {
    if (!m.bpm) return;
    clique.ligado = !clique.ligado;
    if (clique.ligado) { ctxClique(); cliqueDoZero(); agendarClique(); manterTela(); }
    else clearTimeout(clique.timer);
    mostrarClique();
  };
  const mudarBpm = d => {
    m.bpm = Math.max(30, Math.min(260, (m.bpm || 100) + d)); delete m.bpmConferir;
    cliqueDoZero(); mostrarClique(); guardarAjuste();
  };
  $('#bpm-menos').onclick = () => mudarBpm(-1);
  $('#bpm-mais').onclick = () => mudarBpm(1);
  // tap tempo: 4 toques ou mais no ritmo viram o BPM; parar 2 s recomeça a contagem
  let toques = [];
  $('#bater-tempo').onclick = () => {
    const t = agora();
    if (toques.length && t - toques[toques.length - 1] > 2000) toques = [];
    toques.push(t); toques = toques.slice(-9);
    const b = $('#bater-tempo');
    if (toques.length < 4) { b.textContent = `Continue batendo… ${toques.length}`; return; }
    const dif = toques.slice(1).map((x, i) => x - toques[i]).sort((a, c) => a - c);
    const bpm = Math.round(60000 / dif[Math.floor(dif.length / 2)]);
    if (bpm < 30 || bpm > 260) return;
    m.bpm = bpm; delete m.bpmConferir;
    b.textContent = `${bpm} BPM. Pare para fixar, ou continue para refinar`;
    cliqueDoZero(); mostrarClique(); guardarAjuste();
    clearTimeout(b._fim);
    b._fim = setTimeout(() => { b.textContent = 'Bater o tempo junto com a música'; toques = []; }, 2200);
  };
  $('#bater1').onclick = () => {
    if (!m.bpm) { aviso('Informe o BPM antes.'); return; }
    ctxClique();
    const t = (ctxAudio && clique.ligado ? relogioClique() : tempoAtual()) - 0.05; // desconta o tempo do dedo
    const compasso = periodo() * batidas();
    m.faseClique = Math.round((((t % compasso) + compasso) % compasso) * 1000) / 1000;
    cliqueDoZero(); guardarAjuste();
    aviso('O 1 do clique agora cai aqui.');
  };
  $('#abrir-som').onclick = () => {
    const s = $('#som'), abrir = s.hidden;
    s.hidden = !abrir; $('#abrir-som').setAttribute('aria-expanded', abrir);
    dados.prefs.somAberto = abrir; gravarLocal();
  };
  mostrarClique();

  // a música carrega depois da letra aparecer (o YouTube demora um pouco)
  const meu = P;
  abrirFonte(m, $('#yt')).then(fonte => {
    if (P !== meu || !P.ativo) { if (fonte) fonte.destruir(); return; }
    if (!fonte) return;
    P.fonte = fonte; pode.audio = true;
    fonte.aoTerminar(() => { pausar(); if (depois) aviso(`Acabou. Próxima do ensaio: ${depois.titulo}.`, 8000); });
    fonte.aoErro(() => { if (P && P.modo === 'audio') aviso('Não consegui abrir o áudio desta música.'); });
    const vol = $('#vol'), num = $('#vol-num');
    const aplicar = () => { fonte.volume(dados.prefs.volume / 100); num.textContent = dados.prefs.volume; };
    vol.value = dados.prefs.volume; aplicar();
    vol.oninput = () => { dados.prefs.volume = +vol.value; aplicar(); };
    vol.onchange = gravarLocal;
    $('#vol-caixa').hidden = false;
    atualizarModos();
    trocarModo('audio');
    if (!tempos) aviso('A música toca, mas a letra não sabe quando andar. Use as setas, ou em Editar marque os tempos.', 7000);
  });

  $('#play').onclick = () => P.tocando ? pausar() : tocar();
  $('#ant').onclick = () => irPara(P.atual - 1, true);
  $('#prox').onclick = () => irPara(P.atual + 1, true);
  $('#ouvir').onclick = () => P.mic ? pararMic() : ouvir();
  const zoom = d => {
    dados.prefs.escala = Math.round(Math.max(0.7, Math.min(2.2, dados.prefs.escala + d)) * 10) / 10;
    document.documentElement.style.setProperty('--escala', dados.prefs.escala); gravarLocal();
  };
  $('#menor').onclick = () => zoom(-0.1);
  $('#maior').onclick = () => zoom(0.1);
  linhasEl.forEach(el => el.onclick = () => irPara(+el.dataset.i, true));
  faixa.onclick = ev => {
    if (P.modo === 'manual' || !tempos) return;
    const t = (ev.offsetX / faixa.clientWidth) * duracao();
    if (P.modo === 'audio') P.fonte.t = t; else { P.base = t; P.t0 = agora(); }
    if (P.cliqueDoZero) P.cliqueDoZero();
  };

  mostrarProxima(); laco();
  P.irPara = irPara; P.tocar = tocar; P.pausar = pausar;
}

// teclado e pedal bluetooth (viram páginas mandando setas / PageDown)
document.addEventListener('keydown', ev => {
  if (!P || !P.ativo || /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
  const k = ev.key;
  if (['ArrowDown', 'PageDown', 'ArrowRight'].includes(k)) { ev.preventDefault(); P.irPara(P.atual + 1, true); }
  else if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(k)) { ev.preventDefault(); P.irPara(P.atual - 1, true); }
  else if (k === ' ' && ev.target.tagName !== 'BUTTON') { ev.preventDefault(); P.tocando ? P.pausar() : P.tocar(); }
});

async function manterTela() {
  try { if (P && !P.lock && navigator.wakeLock) { P.lock = await navigator.wakeLock.request('screen'); P.lock.onrelease = () => { if (P) P.lock = null; }; } } catch {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && P && P.tocando) manterTela(); });

// microfone: espera o som da banda passar do ruído da sala e começa o cronômetro
async function ouvir() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    aviso('Este navegador não libera o microfone. No site, ele precisa abrir com https.'); return;
  }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
  catch { aviso('Sem acesso ao microfone. Libere o microfone para este site nas configurações do navegador.'); return; }
  if (!P) { stream.getTracks().forEach(t => t.stop()); return; }
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const an = ctx.createAnalyser(); an.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(an);
  const buf = new Float32Array(an.fftSize);
  P.mic = { stream, ctx };
  const botao = $('#ouvir'), medidor = botao.querySelector('.medidor'), barra = medidor.querySelector('i');
  botao.classList.add('ativo'); botao.querySelector('span').textContent = 'Ouvindo'; medidor.hidden = false;
  aviso('Ouvindo a sala. Quando a banda começar, a letra anda sozinha. Toque em Ouvindo para cancelar.', 6000);
  const ini = agora(); let ruido = 0, amostras = 0, acima = 0;
  const passo = () => {
    if (!P || !P.mic) return;
    an.getFloatTimeDomainData(buf);
    let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    const rms = Math.sqrt(s / buf.length);
    barra.style.width = Math.min(100, rms * 400) + '%';
    if (agora() - ini < 900) { ruido += rms; amostras++; }
    else {
      const lim = Math.max(0.02, (ruido / Math.max(1, amostras)) * 3);
      if (rms > lim) { if (++acima >= 5) { pararMic(); P.comecarPeloSom(); return; } } else acima = 0;
    }
    requestAnimationFrame(passo);
  };
  passo();
}
function pararMic() {
  if (!P || !P.mic) return;
  P.mic.stream.getTracks().forEach(t => t.stop());
  try { P.mic.ctx.close(); } catch {}
  P.mic = null;
  const botao = $('#ouvir');
  if (botao) { botao.classList.remove('ativo'); botao.querySelector('span').textContent = 'Ouvir'; botao.querySelector('.medidor').hidden = true; }
}

// ---------------- editor ----------------
const PALETA = [
  ['sobe', '! sobe '], ['desce', '! desce '], ['virada', '! virada '], ['prato', '! prato '],
  ['corte', '! corte '], ['conducao', '! condução '], ['pausa', '! para '], ['entra', '! entra '],
];
async function telaEditor(id, listaId) {
  const voltarPara = mid => '#/m/' + encodeURIComponent(mid) + (listaId ? '/' + encodeURIComponent(listaId) : '');
  const nova = id === 'novo';
  const base = nova ? null : pegar(id);
  if (!nova && !base) { location.hash = '#/'; return; }
  const m = nova
    ? { id: 'm' + Date.now().toString(36), titulo: '', artista: '', bpm: null, compassos: 2, texto: '', tempos: [] }
    : JSON.parse(JSON.stringify(base));
  let textoGuardado = m.texto, desfazerTexto = null;

  app.innerHTML = `
    <header class="topo"><a class="btn icone" href="${nova ? '#/' : voltarPara(m.id)}" aria-label="Voltar sem salvar">${ICONE.voltar}</a>
      <h1>${nova ? 'Nova música' : 'Editar'}</h1><button class="btn primario" id="salvar">Salvar</button></header>
    <main class="rolagem editor">
      <div class="campos">
        <label class="campo largo">Nome<input id="f-titulo" autocomplete="off"></label>
        <label class="campo">Artista<input id="f-artista" autocomplete="off"></label>
        <label class="campo">BPM<input id="f-bpm" type="number" inputmode="numeric" min="30" max="260"></label>
      </div>
      <div class="paleta" role="toolbar" aria-label="Inserir marcação acima da linha do cursor">
        ${PALETA.map(([t, ins]) => `<button class="btn" type="button" data-ins="${esc(ins)}" style="--cor:var(--c-${t})">${ICONE[t]}${TIPOS[t]}</button>`).join('')}
        <button class="btn" type="button" data-ins="# " style="--cor:var(--muted)">Parte</button>
      </div>
      <textarea id="f-texto" spellcheck="false" placeholder="Cole a letra aqui, uma frase por linha.&#10;Deixe uma linha em branco entre as partes."></textarea>
      <div class="acoes"><a class="btn" id="buscar-letra" target="_blank" rel="noopener">Buscar no Cifra Club</a></div>
      <p class="dica">Pode colar a cifra inteira: o app tira os acordes e transforma [Refrão] em parte. Depois use "Sugerir pela letra" lá embaixo para as marcações da bateria.</p>
      <p class="dica">Linha que começa com <code>!</code> ou com <code>Bateria</code> vira marcação. A primeira palavra escolhe o ícone: sobe, desce, virada, prato, corte, condução, para, entra. Linha com <code>#</code> é o nome da parte (Verso, Refrão).</p>

      <section class="bloco">
        <h2>Áudio da música</h2>
        <p class="status" id="a-status"></p>
        <canvas class="energia" id="a-energia" aria-hidden="true"></canvas>
        <div class="acoes"><label class="btn">Escolher mp3<input type="file" id="a-arquivo" accept="audio/*" hidden></label>
          <button class="btn perigo" id="a-tirar" type="button" hidden>Tirar o mp3 deste aparelho</button></div>
        <label class="campo">Link do YouTube<input id="f-yt" type="url" inputmode="url" placeholder="https://youtu.be/..." autocomplete="off"></label>
        <label class="campo">Endereço do mp3 no site (opcional)<input id="f-url" placeholder="audio/nome-da-musica.mp3" autocomplete="off"></label>
        <p class="dica">A música toca nesta ordem: mp3 escolhido aqui (fica só neste aparelho), mp3 do site, YouTube. O link do YouTube vale em qualquer celular, mas precisa de internet e o vídeo aparece pequeno em cima da letra. A análise de BPM e de onde a música enche só funciona com mp3.</p>
      </section>

      <section class="bloco">
        <h2>Rolagem automática</h2>
        <p class="status" id="t-status"></p>
        <div class="acoes"><button class="btn primario" id="marcar" type="button">Marcar tempos tocando junto</button></div>
        <label class="campo">Compassos por linha quando não há tempos marcados<input id="f-comp" type="number" inputmode="numeric" min="1" max="16"></label>
        <label class="campo">Tempos por compasso (o clique acentua o 1)<input id="f-batidas" type="number" inputmode="numeric" min="2" max="12"></label>
      </section>

      <section class="bloco">
        <h2>Sugestões de marcação</h2>
        <p class="dica">Pela letra: acha o refrão pelas frases que se repetem (precisa de linha em branco entre as partes). Pelo áudio: mede onde a música enche e esvazia (precisa do mp3 e dos tempos marcados). Confira sempre: é sugestão.</p>
        <div class="acoes">
          <button class="btn" id="sug-letra" type="button">Sugerir pela letra</button>
          <button class="btn" id="sug-audio" type="button">Sugerir pelo áudio</button>
          <button class="btn" id="sug-desfazer" type="button" hidden>Desfazer sugestões</button>
        </div>
      </section>
      ${nova ? '' : '<button class="btn perigo apagar" id="apagar" type="button">Apagar música</button>'}
    </main>`;

  const f = s => $('#f-' + s);
  f('titulo').value = m.titulo || ''; f('artista').value = m.artista || '';
  f('bpm').value = m.bpm || ''; f('texto').value = m.texto || '';
  f('url').value = m.audioUrl || ''; f('yt').value = m.youtube || ''; f('comp').value = m.compassos || 2; f('batidas').value = m.batidas || 4;
  const ta = f('texto'), cvE = $('#a-energia');

  function lerCampos() {
    const texto = ta.value;
    if (texto !== textoGuardado) { m.tempos = remapear(textoGuardado, texto, m.tempos); textoGuardado = texto; }
    m.texto = texto;
    m.titulo = f('titulo').value.trim() || linhasDe(texto)[0] || 'Sem nome';
    m.artista = f('artista').value.trim();
    m.bpm = parseInt(f('bpm').value, 10) || null;
    m.compassos = parseInt(f('comp').value, 10) || 2;
    m.batidas = parseInt(f('batidas').value, 10) || 4;
    m.audioUrl = f('url').value.trim() || undefined;
    m.youtube = f('yt').value.trim() || undefined;
  }
  const guardarSemSair = () => { lerCampos(); guardar(m); };
  async function atualizarStatus() {
    const temBlob = !!(await Banco.get(m.id));
    m.temAudio = temBlob;
    const a = [];
    const yt = f('yt').value.trim();
    if (temBlob) a.push('Toca o mp3 deste aparelho.');
    else if (f('url').value.trim()) a.push('Toca o mp3 do site.');
    else if (idYouTube(yt)) a.push('Toca pelo YouTube.');
    else a.push('Nenhuma música ainda.');
    if (yt && !idYouTube(yt)) a.push('O link do YouTube não parece certo.');
    $('#a-tirar').hidden = !temBlob;
    if (m.energia) a.push(`Analisado: ${m.bpm ? m.bpm + ' BPM (confira), ' : ''}${mmss(m.duracao)} de música, banda começa em ${m.primeiroSom || 0} s.`);
    $('#a-status').textContent = a.join(' ');
    const n = linhasDe(ta.value).length, marc = (m.tempos || []).filter(x => typeof x === 'number').length;
    $('#t-status').textContent = marc >= 2 ? `${marc} de ${n} linhas com tempo marcado. A letra anda sozinha.`
      : m.bpm ? `Sem tempos marcados. A letra anda pelo BPM, ${f('comp').value || 2} compassos por linha.`
      : 'Sem tempos e sem BPM: a letra anda só pelo botão. Marque os tempos ou informe o BPM.';
    desenharEnergia(cvE, m, null, m.tempos);
  }

  app.querySelectorAll('.paleta button').forEach(b => b.onclick = () => {
    const ins = b.dataset.ins, v = ta.value, pos = ta.selectionStart;
    const ini = v.lastIndexOf('\n', pos - 1) + 1;   // começo da linha do cursor
    ta.value = v.slice(0, ini) + ins + '\n' + v.slice(ini);
    const cursor = ini + ins.length;
    ta.focus(); ta.setSelectionRange(cursor, cursor);
  });

  $('#a-arquivo').onchange = async ev => {
    const arq = ev.target.files[0]; if (!arq) return;
    $('#a-status').textContent = 'Lendo a música…';
    try {
      await Banco.put(m.id, arq);
      const r = await analisarAudio(arq);
      Object.assign(m, { energia: r.energia, duracao: r.duracao, primeiroSom: r.primeiroSom });
      if (!parseInt(f('bpm').value, 10)) f('bpm').value = r.bpm;
      else if (Math.abs(parseInt(f('bpm').value, 10) - r.bpm) > 3) aviso(`Pelo áudio deu ${r.bpm} BPM; mantive o ${f('bpm').value} que você escreveu.`, 6000);
      guardarSemSair();
    } catch (e) { aviso('Não consegui ler esse arquivo de áudio. Tente um mp3.'); }
    atualizarStatus();
  };

  $('#marcar').onclick = async () => {
    lerCampos();
    const lin = linhasDe(m.texto);
    if (!lin.length) { aviso('Cole a letra antes de marcar os tempos.'); return; }
    marcarTempos(lin, m, tempos => {
      if (!tempos) return;
      m.tempos = lin.map((_, i) => tempos[i] ?? null);
      guardarSemSair(); atualizarStatus();
      aviso(`${tempos.length} linha(s) marcadas. Já pode tocar no palco.`);
    });
  };

  const aplicarSugestao = r => {
    if (!r) return;
    desfazerTexto = ta.value;
    const { texto, inseridas } = inserirDeixas(ta.value, r.sugestoes, r.finais);
    ta.value = texto;
    $('#sug-desfazer').hidden = !inseridas;
    aviso(inseridas ? `${inseridas} marcação(ões) sugerida(s). Confira e ajuste.` : 'Nada novo para sugerir: onde eu marcaria, já tem marcação.');
  };
  $('#sug-letra').onclick = () => {
    const r = sugerirPelaLetra(ta.value);
    if (!r) { aviso('Separe as partes com uma linha em branco para eu achar o refrão.'); return; }
    aplicarSugestao(r);
  };
  $('#sug-audio').onclick = () => {
    lerCampos();
    const r = sugerirPeloAudio(m, ta.value);
    if (!r) { aviso('Para sugerir pelo áudio, escolha o mp3 e marque os tempos antes.'); return; }
    aplicarSugestao(r);
  };
  $('#sug-desfazer').onclick = () => { if (desfazerTexto != null) { ta.value = desfazerTexto; desfazerTexto = null; $('#sug-desfazer').hidden = true; } };

  $('#salvar').onclick = () => { guardarSemSair(); location.hash = voltarPara(m.id); };
  if (!nova) $('#apagar').onclick = () => {
    if (confirm(`Apagar "${m.titulo}" deste aparelho?`)) { apagarMusica(m.id); location.hash = '#/'; }
  };
  $('#a-tirar').onclick = async () => {
    await Banco.del(m.id);
    delete m.energia; delete m.duracao; delete m.primeiroSom;
    guardarSemSair(); atualizarStatus();
  };
  // abre a pesquisa da letra em outra aba; o Lucas copia e cola aqui
  const linkLetra = () => {
    $('#buscar-letra').href = 'https://www.google.com/search?q=' + encodeURIComponent(`site:cifraclub.com.br ${f('titulo').value} ${f('artista').value}`.trim());
  };
  ta.addEventListener('paste', ev => {
    const colado = ev.clipboardData && ev.clipboardData.getData('text');
    const r = colado && limparCifra(colado);
    if (!r) return;
    ev.preventDefault();
    const ini = ta.selectionStart, fim = ta.selectionEnd;
    ta.value = ta.value.slice(0, ini) + r.texto + ta.value.slice(fim);
    ta.setSelectionRange(ini + r.texto.length, ini + r.texto.length);
    aviso(`Colei só a letra: tirei ${r.acordes} linha(s) de acorde.`);
  });
  f('titulo').oninput = f('artista').oninput = linkLetra;
  linkLetra();
  f('comp').oninput = atualizarStatus;
  f('yt').oninput = f('url').oninput = atualizarStatus;
  atualizarStatus();
}

// tela cheia: toca a música (ou cronometra) e cada toque marca o começo da próxima linha
async function marcarTempos(linhas, m, fim) {
  const el = document.createElement('div');
  el.className = 'marcar';
  el.innerHTML = `
    <div class="yt" id="m-yt" hidden></div>
    <div class="m-topo"><span id="m-cont"></span><span id="m-tempo">0:00</span></div>
    <p class="m-prox" id="m-prox"></p>
    <p class="m-depois" id="m-depois"></p>
    <button class="btn primario enorme" id="m-toque"></button>
    <div class="acoes">
      <button class="btn" id="m-desfazer">Desfazer</button>
      <button class="btn" id="m-cancelar">Cancelar</button>
      <button class="btn" id="m-ok">Concluir</button>
    </div>`;
  document.body.appendChild(el);
  const toque = $('#m-toque', el);
  const tempos = []; let t0 = null, raf = 0, comecou = false, saiu = false;
  toque.textContent = 'Carregando a música…'; toque.disabled = true;
  const fonte = await abrirFonte(m, $('#m-yt', el));
  if (saiu) { if (fonte) fonte.destruir(); return; }
  toque.disabled = false;
  if (fonte) fonte.volume(dados.prefs.volume / 100);
  const t = () => fonte ? fonte.t : t0 == null ? 0 : (agora() - t0) / 1000;
  function mostrar() {
    const k = tempos.length;
    $('#m-cont', el).textContent = `Linha ${Math.min(k + 1, linhas.length)} de ${linhas.length}`;
    $('#m-prox', el).textContent = linhas[k] || 'Todas as linhas marcadas.';
    $('#m-depois', el).textContent = linhas[k + 1] ? 'depois: ' + linhas[k + 1] : '';
    toque.textContent = !comecou ? (fonte ? 'Tocar a música' : 'Começar quando a música começar')
      : k < linhas.length ? 'Toque quando cantar esta linha' : 'Concluir';
  }
  function relogio() { $('#m-tempo', el).textContent = mmss(t()); raf = requestAnimationFrame(relogio); }
  function sair(r) {
    saiu = true; cancelAnimationFrame(raf); if (fonte) fonte.destruir();
    document.removeEventListener('keydown', tecla); el.remove(); fim(r);
  }
  async function bater() {
    if (tempos.length >= linhas.length) return sair(tempos);
    if (!comecou) {
      if (fonte) {
        try { await fonte.play(); } catch { aviso('Toque de novo para a música começar.'); return; }
        if (fonte.tipo === 'youtube') setTimeout(() => { if (!saiu && !fonte.tocando) aviso('Se o vídeo não começou, toque nele uma vez.', 6000); }, 1500);
      } else t0 = agora();
      comecou = true; mostrar(); return;
    }
    tempos.push(Math.max(0, Math.round((t() - 0.12) * 100) / 100)); // desconta o tempo de reação
    if (tempos.length >= linhas.length && fonte) fonte.pause();
    mostrar();
  }
  function tecla(ev) { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); bater(); } }
  toque.onclick = bater;
  $('#m-desfazer', el).onclick = () => { tempos.pop(); mostrar(); };
  $('#m-cancelar', el).onclick = () => sair(null);
  $('#m-ok', el).onclick = () => sair(tempos.length ? tempos : null);
  document.addEventListener('keydown', tecla);
  mostrar(); relogio(); toque.focus();
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
rota();
// traz do site o que foi feito em outro aparelho; só redesenha se estiver na tela inicial
Nuvem.carregar().then(() => {
  const h = location.hash.slice(1) || '/';
  if (h === '/' || h === '') telaLista(); else mostrarNuvem();
});
})();
